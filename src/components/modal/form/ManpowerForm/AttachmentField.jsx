import React, { useCallback } from "react";
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
import {
  AttachmentBox,
  containerStyles,
  fileNameStyles,
  uploadAttachmentSubtextStyles,
  attachmentBoxContentStyles,
  attachmentBoxMainStyles,
  uploadIconWithFileStyles,
  uploadIconNoFileStyles,
  buttonStyles,
  hiddenInputStyles,
} from "./FormSubmissionFieldStyles";

let idCounter = 0;
const generateUniqueId = (prefix = "attachment") => {
  idCounter++;
  return `${prefix}_${Date.now()}_${idCounter}_${Math.random().toString(36).substr(2, 9)}`;
};

const AttachmentField = ({
  selectedEntry,
  disabled = false,
  onFileViewerOpen,
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

  const watchedAttachments = watch("attachments");
  const isReadOnly = disabled;

  React.useEffect(() => {
    if (fields.length === 0) {
      // API response: submittable.attachments[].{ id, filename, download_url }
      const existingAttachments = selectedEntry?.submittable?.attachments;

      if (
        existingAttachments &&
        Array.isArray(existingAttachments) &&
        existingAttachments.length > 0
      ) {
        replace(
          existingAttachments.map((att) => ({
            id: generateUniqueId(),
            file_attachment: null,
            existing_file_name: att.filename || "Unknown file",
            existing_file_path: att.download_url || null,
            existing_file_id: att.id,
            is_new_file: false,
            keep_existing: true,
          })),
        );
      } else {
        replace([
          {
            id: generateUniqueId(),
            file_attachment: null,
            existing_file_name: null,
            existing_file_path: null,
            existing_file_id: null,
            is_new_file: true,
            keep_existing: false,
          },
        ]);
      }
    }
  }, []);

  const handleFileChange = useCallback(
    (index, event) => {
      if (isReadOnly) return;
      const file = event.target.files[0];
      if (file) {
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
    [setValue, isReadOnly],
  );

  const hasAttachmentInField = useCallback(
    (index) => {
      const attachment = watchedAttachments?.[index];
      if (!attachment) return false;
      return (
        attachment.file_attachment instanceof File ||
        !!attachment.existing_file_name ||
        !!attachment.existing_file_path
      );
    },
    [watchedAttachments],
  );

  const canAddNewLine = useCallback(() => {
    if (fields.length === 0) return true;
    return hasAttachmentInField(fields.length - 1);
  }, [fields.length, hasAttachmentInField]);

  const addAttachmentLine = useCallback(() => {
    if (!canAddNewLine()) return;
    append({
      id: generateUniqueId(),
      file_attachment: null,
      existing_file_name: null,
      existing_file_path: null,
      existing_file_id: null,
      is_new_file: true,
      keep_existing: false,
    });
  }, [append, canAddNewLine]);

  const removeAttachmentLine = useCallback(
    (index) => {
      const current = getValues("attachments") || [];
      if (current.length > 1) {
        remove(index);
      }
    },
    [getValues, remove],
  );

  const hasNewFileSelected = (index) =>
    watchedAttachments?.[index]?.file_attachment instanceof File;

  const hasExistingFile = (index) => {
    const attachment = watchedAttachments?.[index];
    if (!attachment) return false;
    if (attachment.file_attachment instanceof File) return false;
    return !!(attachment.existing_file_name || attachment.existing_file_path);
  };

  const getDisplayFilename = (index) => {
    const attachment = watchedAttachments?.[index];
    if (attachment?.file_attachment instanceof File) {
      return attachment.file_attachment.name;
    }
    if (attachment?.existing_file_name) {
      return attachment.existing_file_name;
    }
    return "Attachment";
  };

  const canViewFile = (index) =>
    hasNewFileSelected(index) || hasExistingFile(index);

  return (
    <Box sx={containerStyles.attachmentSection}>
      {fields.map((field, index) => {
        const fileExists = hasAttachmentInField(index);
        const isNew = hasNewFileSelected(index);
        const showDelete = fields.length > 1 && !isReadOnly;
        const fileName = fileExists ? getDisplayFilename(index) : null;

        return (
          <Box key={field.id} sx={containerStyles.attachmentItem}>
            <FormControl fullWidth error={!!errors.attachments?.[index]}>
              <input
                accept=".pdf,.doc,.docx,.jpg,.png"
                style={hiddenInputStyles}
                id={`mrf-attachment-upload-${index}`}
                type="file"
                onChange={(e) => handleFileChange(index, e)}
                disabled={isReadOnly}
              />

              <AttachmentBox
                hasFile={fileExists}
                isReadOnly={isReadOnly}
                sx={attachmentBoxMainStyles}>
                <Box
                  sx={{
                    ...attachmentBoxContentStyles,
                    cursor: isReadOnly ? "default" : "pointer",
                    alignItems: "flex-start",
                    textAlign: "left",
                  }}
                  onClick={() => {
                    if (!isReadOnly) {
                      document
                        .getElementById(`mrf-attachment-upload-${index}`)
                        .click();
                    }
                  }}>
                  <CloudUploadIcon
                    sx={
                      fileExists
                        ? uploadIconWithFileStyles
                        : uploadIconNoFileStyles
                    }
                  />
                  <Box sx={{ flex: 1, textAlign: "left" }}>
                    {fileExists ? (
                      <>
                        <Typography
                          sx={{
                            ...fileNameStyles,
                            cursor: "default",
                            color: isNew ? "rgb(33, 61, 112)" : "#1976d2",
                          }}
                          onClick={(e) => e.stopPropagation()}>
                          {isNew ? "New file selected: " : "File name: "}
                          <span
                            style={{ color: isNew ? "#22c55e" : "#f44336" }}>
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
                        <Typography
                          sx={{
                            fontWeight: 600,
                            color: "rgb(33, 61, 112)",
                            fontSize: "0.9rem",
                          }}>
                          UPLOAD ATTACHMENT (PDF ONLY)
                          <span style={{ color: isReadOnly ? "gray" : "red" }}>
                            {" "}
                            *
                          </span>
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

                <Box
                  sx={{ display: "flex", gap: 1, marginTop: 1 }}
                  onClick={(e) => e.stopPropagation()}>
                  {showDelete && (
                    <Button
                      variant="contained"
                      color="error"
                      size="small"
                      startIcon={<DeleteIcon />}
                      onClick={() => removeAttachmentLine(index)}
                      sx={buttonStyles.deleteLine}>
                      DELETE LINE
                    </Button>
                  )}
                  {canViewFile(index) && (
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<VisibilityIcon />}
                      onClick={() =>
                        onFileViewerOpen && onFileViewerOpen(index)
                      }
                      sx={{ marginLeft: showDelete ? 0 : "auto" }}>
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
          onClick={addAttachmentLine}
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
  );
};

export default AttachmentField;
