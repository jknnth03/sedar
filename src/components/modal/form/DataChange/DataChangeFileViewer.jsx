import React, { useState, useEffect } from "react";
import { useFormContext } from "react-hook-form";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  Typography,
  IconButton,
  CircularProgress,
} from "@mui/material";
import {
  Close as CloseIcon,
  AttachFile as AttachFileIcon,
} from "@mui/icons-material";
import { useGetDataChangeAttachmentQuery } from "../../../../features/api/forms/datachangeApi";

const DataChangeFileViewer = ({
  open,
  onClose,
  selectedEntry,
  selectedFile,
  currentFormSubmissionId,
  attachmentIndex,
}) => {
  const { watch } = useFormContext();
  const [fileUrl, setFileUrl] = useState(null);

  const watchedAttachments = watch("attachments");

  const getAttachmentId = () => {
    if (
      attachmentIndex !== null &&
      attachmentIndex !== undefined &&
      watchedAttachments?.[attachmentIndex]
    ) {
      const watchedAttachment = watchedAttachments[attachmentIndex];
      if (watchedAttachment.existing_file_id) {
        return watchedAttachment.existing_file_id;
      }
    }

    if (
      selectedEntry?.result?.submittable?.attachments &&
      attachmentIndex !== null &&
      attachmentIndex !== undefined
    ) {
      const attachment =
        selectedEntry.result.submittable.attachments[attachmentIndex];
      return attachment?.id;
    }
    return null;
  };

  const getSubmissionId = () => {
    if (selectedEntry?.result?.id) {
      return selectedEntry.result.id;
    }
    if (selectedEntry?.id) {
      return selectedEntry.id;
    }
    return currentFormSubmissionId;
  };

  const getFilePath = () => {
    if (
      attachmentIndex !== null &&
      attachmentIndex !== undefined &&
      watchedAttachments?.[attachmentIndex]
    ) {
      const watchedAttachment = watchedAttachments[attachmentIndex];
      if (watchedAttachment.existing_file_path) {
        return watchedAttachment.existing_file_path;
      }
    }

    if (
      selectedEntry?.result?.submittable?.attachments &&
      attachmentIndex !== null &&
      attachmentIndex !== undefined
    ) {
      const attachment =
        selectedEntry.result.submittable.attachments[attachmentIndex];
      return attachment?.file_path;
    }

    return null;
  };

  const attachmentId = getAttachmentId();
  const submissionId = getSubmissionId();
  const filePath = getFilePath();

  const {
    data: attachmentData,
    isLoading: isLoadingAttachment,
    error: attachmentError,
  } = useGetDataChangeAttachmentQuery(
    {
      submissionId: submissionId,
      attachmentId: attachmentId,
    },
    {
      skip:
        !open ||
        !submissionId ||
        attachmentIndex === null ||
        attachmentIndex === undefined ||
        !attachmentId,
    }
  );

  const getDisplayFilename = () => {
    if (selectedFile) {
      if (selectedFile instanceof File) {
        return selectedFile.name;
      }
      if (typeof selectedFile === "string") {
        return selectedFile.split("/").pop() || selectedFile;
      }
    }

    if (
      attachmentIndex !== undefined &&
      watchedAttachments?.[attachmentIndex]
    ) {
      const currentAttachment = watchedAttachments[attachmentIndex];

      if (currentAttachment.file_attachment instanceof File) {
        return currentAttachment.file_attachment.name;
      }

      if (currentAttachment.existing_file_name) {
        return typeof currentAttachment.existing_file_name === "string"
          ? currentAttachment.existing_file_name.split("/").pop() ||
              currentAttachment.existing_file_name
          : currentAttachment.existing_file_name;
      }
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
        const attachment =
          submittable.attachments[attachmentIndex] ||
          submittable.attachments[0];
        if (attachment) {
          return (
            attachment.original_filename ||
            attachment.filename ||
            attachment.name ||
            attachment.original_name ||
            "attachment.pdf"
          );
        }
      }
    }

    return "Data Change Attachment";
  };

  const getDownloadUrl = () => {
    if (
      attachmentIndex !== undefined &&
      watchedAttachments?.[attachmentIndex]?.existing_file_path
    ) {
      return watchedAttachments[attachmentIndex].existing_file_path;
    }

    if (selectedEntry?.result?.submittable) {
      const submittable = selectedEntry.result.submittable;

      if (submittable.datachange_form_attachment) {
        return submittable.datachange_form_attachment;
      }

      if (submittable.attachments && Array.isArray(submittable.attachments)) {
        const attachment =
          submittable.attachments[attachmentIndex] ||
          submittable.attachments[0];
        if (attachment && attachment.file_path) {
          return attachment.file_path;
        }
      }
    }

    return "";
  };

  const handleFileDownload = () => {
    if (fileUrl) {
      const link = document.createElement("a");
      link.href = fileUrl;
      link.download = getDisplayFilename();
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      const directUrl = getDownloadUrl();
      if (directUrl) {
        const possibleUrls = [
          `http://10.10.13.9:8001/storage/${directUrl}`,
          `http://10.10.13.9:8001/api/storage/${directUrl}`,
          `http://10.10.13.9:8001/files/${directUrl}`,
          `http://10.10.13.9:8001/api/files/${directUrl}`,
          `http://10.10.13.9:8001/${directUrl}`,
        ];

        const link = document.createElement("a");
        link.href = possibleUrls[0];
        link.download = getDisplayFilename();
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    }
  };

  useEffect(() => {
    return () => {
      if (fileUrl && fileUrl.startsWith("blob:")) {
        URL.revokeObjectURL(fileUrl);
      }
    };
  }, [fileUrl]);

  useEffect(() => {
    if (!open) {
      if (fileUrl && fileUrl.startsWith("blob:")) {
        URL.revokeObjectURL(fileUrl);
      }
      setFileUrl(null);
      return;
    }

    if (attachmentData && attachmentData instanceof Blob) {
      if (fileUrl && fileUrl.startsWith("blob:")) {
        URL.revokeObjectURL(fileUrl);
      }

      const url = URL.createObjectURL(attachmentData);
      setFileUrl(url);
      return;
    }

    if (
      attachmentIndex !== undefined &&
      watchedAttachments?.[attachmentIndex]?.file_attachment instanceof File
    ) {
      const file = watchedAttachments[attachmentIndex].file_attachment;

      if (fileUrl && fileUrl.startsWith("blob:")) {
        URL.revokeObjectURL(fileUrl);
      }

      const url = URL.createObjectURL(file);
      setFileUrl(url);
      return;
    }

    if (!attachmentData) {
      const directUrl = getDownloadUrl();
      if (directUrl && !directUrl.startsWith("blob:")) {
        if (
          directUrl.startsWith("employee_movements/") ||
          !directUrl.startsWith("http")
        ) {
          const fullUrl = `http://10.10.13.9:8001/storage/${directUrl}`;
          setFileUrl(fullUrl);
        } else {
          setFileUrl(directUrl);
        }
        return;
      }
    }

    if (!attachmentData) {
      setFileUrl(null);
    }
  }, [open, attachmentData, attachmentIndex, watchedAttachments]);

  const isLoading = isLoadingAttachment;
  const currentError = attachmentError;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={false}
      fullWidth={false}
      PaperProps={{
        sx: {
          width: "80vw",
          height: "90vh",
          maxWidth: "80vw",
          maxHeight: "90vh",
          margin: "0",
          position: "fixed",
          top: "5vh",
          left: "50%",
          transform: "translateX(-50%)",
          borderRadius: 2,
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
        },
      }}
      BackdropProps={{
        sx: {
          backgroundColor: "rgba(0, 0, 0, 0.7)",
        },
      }}>
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: 1,
          borderColor: "divider",
          padding: "16px 24px",
          backgroundColor: "#f8f9fa",
        }}>
        <Typography
          variant="h6"
          sx={{
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}>
          <AttachFileIcon sx={{ color: "primary.main" }} />
          {getDisplayFilename()}
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {(fileUrl || getDownloadUrl()) && (
            <IconButton
              onClick={handleFileDownload}
              size="small"
              sx={{
                color: "primary.main",
                "&:hover": {
                  backgroundColor: "rgba(25, 118, 210, 0.08)",
                },
              }}
              title="Download file"></IconButton>
          )}
          <IconButton
            onClick={onClose}
            size="small"
            sx={{
              color: "text.secondary",
              "&:hover": {
                backgroundColor: "rgba(0, 0, 0, 0.04)",
              },
            }}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent
        sx={{
          p: 0,
          position: "relative",
          height: "calc(90vh - 80px)",
          overflow: "hidden",
          backgroundColor: "#f5f5f5",
        }}>
        {isLoading ? (
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            height="100%"
            flexDirection="column">
            <CircularProgress size={48} />
            <Typography variant="body1" sx={{ mt: 2, color: "text.secondary" }}>
              Loading attachment...
            </Typography>
          </Box>
        ) : currentError ? (
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            height="100%"
            flexDirection="column">
            <Typography variant="h6" color="error" gutterBottom>
              Error loading attachment
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mb: 2, textAlign: "center" }}>
              {currentError?.message ||
                currentError?.data?.message ||
                "Unable to load the attachment. Please try downloading instead."}
            </Typography>
            {getDownloadUrl() && (
              <IconButton
                onClick={handleFileDownload}
                color="primary"
                sx={{
                  backgroundColor: "rgba(25, 118, 210, 0.08)",
                  "&:hover": {
                    backgroundColor: "primary.main",
                    color: "white",
                  },
                }}></IconButton>
            )}
          </Box>
        ) : fileUrl ? (
          <iframe
            src={fileUrl}
            width="100%"
            height="100%"
            style={{
              border: "none",
              backgroundColor: "#fff",
            }}
            title="Data Change Attachment"
            onError={(e) => {
              console.error("Error loading PDF in iframe:", e);
            }}
          />
        ) : (
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            height="100%"
            flexDirection="column">
            <AttachFileIcon
              sx={{ fontSize: 64, color: "text.secondary", mb: 2 }}
            />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              {getDisplayFilename()}
            </Typography>
            {getDownloadUrl() && (
              <>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 2 }}>
                  Try downloading instead:
                </Typography>
                <IconButton
                  onClick={handleFileDownload}
                  color="primary"
                  sx={{
                    backgroundColor: "rgba(25, 118, 210, 0.08)",
                    "&:hover": {
                      backgroundColor: "primary.main",
                      color: "white",
                    },
                  }}></IconButton>
              </>
            )}
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default DataChangeFileViewer;
