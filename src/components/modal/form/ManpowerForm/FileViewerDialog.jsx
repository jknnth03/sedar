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
import { useGetFormSubmissionAttachmentQuery } from "../../../../features/api/approvalsetting/formSubmissionApi";

const FileViewerDialog = ({
  open,
  onClose,
  selectedEntry,
  selectedFile,
  currentFormSubmissionId,
}) => {
  const { watch } = useFormContext();
  const [fileUrl, setFileUrl] = useState(null);

  const watchedAttachmentFilename = watch("manpower_attachment_filename");
  const watchedFormAttachment = watch("manpower_form_attachment");

  const {
    data: attachmentData,
    isLoading: isLoadingAttachment,
    error: attachmentError,
  } = useGetFormSubmissionAttachmentQuery(currentFormSubmissionId, {
    skip: !open || !currentFormSubmissionId,
  });

  const getDisplayFilename = () => {
    if (selectedFile && selectedFile instanceof File) {
      return selectedFile.name;
    }

    if (selectedFile && typeof selectedFile === "string") {
      return selectedFile;
    }

    if (watchedAttachmentFilename) {
      return watchedAttachmentFilename;
    }

    if (selectedEntry?.submittable?.manpower_attachment_filename) {
      return selectedEntry.submittable.manpower_attachment_filename;
    }

    if (selectedEntry?.submittable?.manpower_form_attachment) {
      return selectedEntry.submittable.manpower_form_attachment
        .split("/")
        .pop();
    }

    if (watchedFormAttachment && typeof watchedFormAttachment === "string") {
      return watchedFormAttachment.split("/").pop();
    }

    return "Download File";
  };

  const getDownloadUrl = () => {
    if (selectedEntry?.submittable?.manpower_form_attachment) {
      return selectedEntry.submittable.manpower_form_attachment;
    }

    if (watchedFormAttachment && typeof watchedFormAttachment === "string") {
      return watchedFormAttachment;
    }

    return "";
  };

  const handleFileDownload = (fileUrl, filename) => {
    const link = document.createElement("a");
    link.href = fileUrl;
    link.download = filename || "attachment";
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadFromViewer = () => {
    if (attachmentData) {
      const filename = getDisplayFilename();
      handleFileDownload(attachmentData, filename);
    } else {
      handleFileDownload(getDownloadUrl(), getDisplayFilename());
    }
  };

  useEffect(() => {
    if (attachmentData) {
      const url = URL.createObjectURL(attachmentData);
      setFileUrl(url);

      return () => URL.revokeObjectURL(url);
    }
  }, [attachmentData]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={false}
      fullWidth={false}
      PaperProps={{
        sx: {
          width: "77vw",
          height: "96vh",
          maxWidth: "80vw",
          maxHeight: "96vh",
          margin: "0",
          position: "fixed",
          top: "2vh",
          left: "320px",
          transform: "none",
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
          padding: "12px 24px",
          backgroundColor: "#f8f9fa",
        }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Attachment - {getDisplayFilename()}
        </Typography>
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
      </DialogTitle>

      <DialogContent
        sx={{
          p: 0,
          position: "relative",
          height: "calc(90vh - 140px)",
          overflow: "hidden",
        }}>
        {isLoadingAttachment ? (
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
        ) : attachmentError ? (
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            height="100%"
            flexDirection="column">
            <Typography variant="h6" color="error" gutterBottom>
              Error loading attachment
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Unable to load the attachment. Please try again.
            </Typography>
          </Box>
        ) : (
          <Box
            sx={{
              width: "100%",
              height: "100%",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: "#f5f5f5",
            }}>
            {attachmentData ? (
              <iframe
                src={fileUrl}
                width="100%"
                height="100%"
                style={{
                  border: "none",
                  borderRadius: "0 0 8px 8px",
                }}
                title="File Attachment"
              />
            ) : (
              <Box textAlign="center">
                <AttachFileIcon
                  sx={{ fontSize: 64, color: "text.secondary", mb: 2 }}
                />
                <Typography variant="h6" color="text.secondary">
                  {getDisplayFilename()}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 1 }}>
                  File preview not available
                </Typography>
              </Box>
            )}
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default FileViewerDialog;
