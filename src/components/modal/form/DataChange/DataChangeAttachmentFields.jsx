import React, { useState, useEffect, useCallback } from "react";
import { useFormContext, useFieldArray } from "react-hook-form";
import {
  Box,
  Button,
  Typography,
  FormControl,
  FormHelperText,
} from "@mui/material";
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  CloudUpload as CloudUploadIcon,
  Visibility as VisibilityIcon,
} from "@mui/icons-material";
import DataChangeFileViewer from "./DataChangeFileViewer";
import {
  AttachmentBox,
  containerStyles,
  labelWithRequired,
  fileNameStyles,
  replaceAttachmentStyles,
  uploadAttachmentTitleStyles,
  uploadAttachmentSubtextStyles,
  attachmentBoxContentStyles,
  attachmentBoxMainStyles,
  uploadIconWithFileStyles,
  uploadIconNoFileStyles,
  buttonStyles,
  hiddenInputStyles,
} from "./DataChangeModalStyles";

let idCounter = 0;
const generateUniqueId = (prefix = "attachment") => {
  idCounter++;
  return `${prefix}_${Date.now()}_${idCounter}_${Math.random()
    .toString(36)
    .substr(2, 9)}`;
};

const DataChangeAttachmentFields = ({
  isLoading = false,
  mode = "create",
  selectedEntry = null,
}) => {
  const {
    control,
    formState: { errors },
    setValue,
    watch,
    getValues,
  } = useFormContext();

  const { fields, append, remove, replace } = useFieldArray({
    control,
    name: "attachments",
  });

  const [fileViewerOpen, setFileViewerOpen] = useState(false);
  const [currentAttachmentIndex, setCurrentAttachmentIndex] = useState(null);
  const [currentFormSubmissionId, setCurrentFormSubmissionId] = useState(null);

  const watchedAttachments = watch("attachments");

  const isReadOnly = mode === "view";

  const handleFileChange = useCallback(
    (index, event) => {
      const file = event.target.files[0];

      if (file) {
        if (file.type !== "application/pdf") {
          alert("Only PDF files are allowed");
          return;
        }
        if (file.size > 10 * 1024 * 1024) {
          alert("File size must be less than 10MB");
          return;
        }

        setValue(`attachments.${index}.file_attachment`, file, {
          shouldValidate: true,
          shouldDirty: true,
        });
        setValue(`attachments.${index}.is_new_file`, true);
        setValue(`attachments.${index}.existing_file_name`, null);
        setValue(`attachments.${index}.existing_file_id`, null);
        setValue(`attachments.${index}.existing_file_path`, null);
        setValue(`attachments.${index}.keep_existing`, false);
      }
      event.target.value = "";
    },
    [setValue]
  );

  const handleUploadBoxClick = (index) => {
    if (!isReadOnly) {
      document.getElementById(`attachment-upload-input-${index}`).click();
    }
  };

  const replaceAttachment = useCallback(
    (index) => {
      if (!isReadOnly) {
        document.getElementById(`attachment-upload-input-${index}`).click();
      }
    },
    [isReadOnly]
  );

  const hasAttachmentInField = useCallback(
    (index) => {
      const attachment = watchedAttachments?.[index];
      if (!attachment) return false;

      return (
        attachment.file_attachment instanceof File ||
        attachment.existing_file_name ||
        attachment.existing_file_path
      );
    },
    [watchedAttachments]
  );

  const canAddNewLine = useCallback(() => {
    if (fields.length === 0) return true;

    const lastFieldIndex = fields.length - 1;
    return hasAttachmentInField(lastFieldIndex);
  }, [fields.length, hasAttachmentInField]);

  const addAttachmentLine = useCallback(() => {
    if (!canAddNewLine()) return;

    const newAttachment = {
      id: generateUniqueId(),
      file_attachment: null,
      existing_file_name: null,
      existing_file_id: null,
      existing_file_path: null,
      is_new_file: true,
      keep_existing: false,
    };
    append(newAttachment);
  }, [append, canAddNewLine]);

  const removeAttachmentLine = useCallback(
    (index) => {
      const currentAttachments = getValues("attachments") || [];
      if (currentAttachments.length > 1) {
        remove(index);
      }
    },
    [getValues, remove]
  );

  const getFileName = useCallback((fileData) => {
    if (!fileData) return null;
    if (fileData instanceof File) return fileData.name;
    if (typeof fileData === "string")
      return fileData.split("/").pop() || fileData;
    if (typeof fileData === "object") {
      return (
        fileData.name ||
        fileData.filename ||
        fileData.original_name ||
        "Unknown file"
      );
    }
    return "Unknown file";
  }, []);

  const hasNewFileSelected = (index) => {
    return watchedAttachments?.[index]?.file_attachment instanceof File;
  };

  const hasExistingFile = (index) => {
    const attachment = watchedAttachments?.[index];
    if (!attachment) return false;

    if (attachment.file_attachment instanceof File) return false;
    if (attachment.existing_file_name || attachment.existing_file_path)
      return true;

    if (selectedEntry?.result?.submittable) {
      const submittable = selectedEntry.result.submittable;
      if (submittable.datachange_form_attachment) return true;
      if (submittable.attachments && Array.isArray(submittable.attachments)) {
        const entryAttachment = submittable.attachments[index];
        return !!(entryAttachment?.file_path || entryAttachment?.filename);
      }
    }

    return false;
  };

  const getDisplayFilename = (index) => {
    const attachment = watchedAttachments?.[index];

    if (attachment?.file_attachment instanceof File) {
      return attachment.file_attachment.name;
    }

    if (attachment?.existing_file_name) {
      return typeof attachment.existing_file_name === "string"
        ? attachment.existing_file_name.split("/").pop() ||
            attachment.existing_file_name
        : attachment.existing_file_name;
    }

    if (selectedEntry?.result?.submittable) {
      const submittable = selectedEntry.result.submittable;

      if (submittable.datachange_attachment_filename) {
        return submittable.datachange_attachment_filename;
      }

      if (submittable.datachange_form_attachment) {
        return submittable.datachange_form_attachment.split("/").pop();
      }

      if (submittable.attachments && Array.isArray(submittable.attachments)) {
        const entryAttachment =
          submittable.attachments[index] || submittable.attachments[0];
        if (entryAttachment) {
          return (
            entryAttachment.original_filename ||
            entryAttachment.filename ||
            entryAttachment.name ||
            entryAttachment.original_name ||
            "attachment.pdf"
          );
        }
      }
    }

    return "Data Change Attachment";
  };

  const getDownloadUrl = (index) => {
    const attachment = watchedAttachments?.[index];

    if (attachment?.existing_file_path) {
      return attachment.existing_file_path;
    }

    if (selectedEntry?.result?.submittable) {
      const submittable = selectedEntry.result.submittable;

      if (submittable.datachange_form_attachment) {
        return submittable.datachange_form_attachment;
      }

      if (submittable.attachments && Array.isArray(submittable.attachments)) {
        const entryAttachment =
          submittable.attachments[index] || submittable.attachments[0];
        if (entryAttachment?.file_path) {
          return entryAttachment.file_path;
        }
      }
    }

    return "";
  };

  const canViewFile = (index) => {
    if (hasNewFileSelected(index)) {
      return true;
    }

    if (hasExistingFile(index)) {
      return true;
    }

    return false;
  };

  const handleFileDownload = (fileUrl, filename) => {
    const link = document.createElement("a");
    link.href = fileUrl;
    link.download = filename || "data_change_attachment";
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileViewerOpen = (index) => {
    if (!canViewFile(index)) {
      const downloadUrl = getDownloadUrl(index);
      if (downloadUrl) {
        handleFileDownload(downloadUrl, getDisplayFilename(index));
      }
      return;
    }

    setCurrentAttachmentIndex(index);
    const submissionId = selectedEntry?.result?.id || selectedEntry?.id;
    setCurrentFormSubmissionId(submissionId);
    setFileViewerOpen(true);
  };

  const handleFileViewerClose = () => {
    setFileViewerOpen(false);
    setCurrentAttachmentIndex(null);
    setCurrentFormSubmissionId(null);
  };

  const handleFilenameClick = (e, index) => {
    e.stopPropagation();
    return;
  };

  const handleAttachmentBoxClick = (index) => {
    if (isReadOnly) return;

    const isExisting = hasExistingFile(index);
    const hasNewFile = hasNewFileSelected(index);

    handleUploadBoxClick(index);
  };

  useEffect(() => {
    if (fields.length === 0 && mode === "create") {
      const emptyAttachment = {
        id: generateUniqueId(),
        file_attachment: null,
        existing_file_name: null,
        existing_file_id: null,
        existing_file_path: null,
        is_new_file: true,
        keep_existing: false,
      };
      replace([emptyAttachment]);
    }
  }, [fields.length, replace, mode]);

  return (
    <>
      <Box sx={containerStyles.attachmentSection}>
        {fields.map((field, index) => {
          const hasFile =
            watchedAttachments?.[index]?.file_attachment ||
            watchedAttachments?.[index]?.existing_file_name ||
            hasExistingFile(index);
          const fileName = hasFile ? getDisplayFilename(index) : null;
          const isNewFile = hasNewFileSelected(index);
          const isExisting = hasExistingFile(index);

          const showDeleteButton = fields.length > 1 && !isReadOnly;

          return (
            <Box key={field.id} sx={containerStyles.attachmentItem}>
              <FormControl fullWidth error={!!errors.attachments?.[index]}>
                <input
                  accept=".pdf"
                  style={hiddenInputStyles}
                  id={`attachment-upload-input-${index}`}
                  type="file"
                  onChange={(e) => handleFileChange(index, e)}
                  disabled={isLoading || isReadOnly}
                />

                <AttachmentBox
                  hasFile={hasFile}
                  isReadOnly={isReadOnly}
                  sx={attachmentBoxMainStyles}>
                  <Box
                    sx={{
                      ...attachmentBoxContentStyles,
                      cursor: isReadOnly ? "default" : "pointer",
                      alignItems: "flex-start",
                      textAlign: "left",
                    }}
                    onClick={() => handleAttachmentBoxClick(index)}>
                    <CloudUploadIcon
                      sx={
                        hasFile
                          ? uploadIconWithFileStyles
                          : uploadIconNoFileStyles
                      }
                    />
                    <Box sx={{ flex: 1, textAlign: "left" }}>
                      {hasFile ? (
                        <>
                          <Typography
                            sx={{
                              ...fileNameStyles,
                              cursor: "default",
                              color: isNewFile ? "#f44336" : "#1976d2",
                            }}
                            onClick={(e) => handleFilenameClick(e, index)}>
                            {isNewFile ? "New file selected: " : "File name: "}
                            <span
                              style={{
                                ...labelWithRequired,
                                color: isNewFile ? "#22c55e" : "#f44336",
                              }}>
                              {fileName}
                            </span>
                          </Typography>
                          {!isReadOnly && (
                            <Typography
                              variant="caption"
                              sx={{
                                display: "block",
                                color: "#666",
                                fontSize: "11px",
                                marginTop: 0.5,
                              }}>
                              Click anywhere in this box to replace the file
                            </Typography>
                          )}
                        </>
                      ) : (
                        <>
                          <Typography sx={uploadAttachmentTitleStyles}>
                            UPLOAD ATTACHMENT (PDF ONLY) *
                          </Typography>
                          <Typography sx={uploadAttachmentSubtextStyles}>
                            {isReadOnly
                              ? "No attachment available"
                              : "Click to browse files or drag and drop"}
                          </Typography>
                        </>
                      )}
                    </Box>
                  </Box>

                  <Box sx={{ display: "flex", gap: 1, marginTop: 1 }}>
                    {showDeleteButton && (
                      <Button
                        variant="contained"
                        color="error"
                        size="small"
                        startIcon={<DeleteIcon />}
                        onClick={(e) => {
                          e.stopPropagation();
                          removeAttachmentLine(index);
                        }}
                        sx={buttonStyles.deleteLine}>
                        DELETE LINE
                      </Button>
                    )}
                    {hasFile && (
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<VisibilityIcon />}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleFileViewerOpen(index);
                        }}
                        sx={{ marginLeft: showDeleteButton ? 0 : "auto" }}>
                        VIEW
                      </Button>
                    )}
                  </Box>
                </AttachmentBox>

                {errors.attachments?.[index] && (
                  <FormHelperText>
                    {errors.attachments[index]?.file_attachment?.message ||
                      "Attachment is required"}
                  </FormHelperText>
                )}
              </FormControl>
            </Box>
          );
        })}

        {!isReadOnly && (
          <Button
            variant="contained"
            color="success"
            size="small"
            startIcon={<AddIcon />}
            onClick={(e) => {
              e.stopPropagation();
              addAttachmentLine();
            }}
            disabled={!canAddNewLine()}
            sx={{
              ...buttonStyles.addLine,
              width: "100%",
              height: "36px",
              marginTop: 1,
              opacity: canAddNewLine() ? 1 : 0.6,
              "&:disabled": {
                backgroundColor: "#cccccc !important",
                color: "#666666 !important",
              },
            }}>
            ADD LINE
          </Button>
        )}
      </Box>

      <DataChangeFileViewer
        open={fileViewerOpen}
        onClose={handleFileViewerClose}
        selectedEntry={selectedEntry}
        selectedFile={null}
        currentFormSubmissionId={currentFormSubmissionId}
        attachmentIndex={currentAttachmentIndex}
      />
    </>
  );
};

export default DataChangeAttachmentFields;
