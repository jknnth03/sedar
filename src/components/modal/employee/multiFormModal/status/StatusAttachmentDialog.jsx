import React, { useState, useCallback, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Typography,
  IconButton,
  Box,
  CircularProgress,
} from "@mui/material";
import { Close, AttachFile } from "@mui/icons-material";

import { useGetStatusAttachmentQuery } from "../../../../../features/api/employee/statusApi";

const StatusAttachmentDialog = ({ open, onClose, status }) => {
  const [fileUrl, setFileUrl] = useState(null);
  const [currentFileName, setCurrentFileName] = useState("");

  const {
    data: attachmentData,
    isLoading: isLoadingAttachment,
    error: attachmentError,
  } = useGetStatusAttachmentQuery(status?.id, {
    skip: !open || !status?.id || status?.id === "undefined",
  });

  // Create and manage file URL
  useEffect(() => {
    if (open && attachmentData) {
      // Clean up previous URL if it exists
      if (fileUrl) {
        URL.revokeObjectURL(fileUrl);
      }

      // Create new URL
      const url = URL.createObjectURL(attachmentData);
      setFileUrl(url);
    }

    // Cleanup when dialog closes or component unmounts
    if (!open && fileUrl) {
      URL.revokeObjectURL(fileUrl);
      setFileUrl(null);
    }

    return () => {
      if (fileUrl) {
        URL.revokeObjectURL(fileUrl);
      }
    };
  }, [open, attachmentData]);

  // Reset fileUrl when dialog closes
  useEffect(() => {
    if (!open) {
      setFileUrl(null);
    }
  }, [open]);

  // Set filename when status changes
  useEffect(() => {
    if (status) {
      const filename = getDisplayFileName(status);
      setCurrentFileName(filename);
    }
  }, [status]);

  // Function to get display filename (adapted for status)
  const getDisplayFileName = (status) => {
    if (!status) return "";

    // First, check if employee_status_attachment_filename is provided
    if (status.employee_status_attachment_filename) {
      return status.employee_status_attachment_filename;
    }

    // Check for status_attachment_filename as alternative
    if (status.status_attachment_filename) {
      return status.status_attachment_filename;
    }

    // Fallback to extracting from URL if filename is not provided
    if (status.employee_status_attachment) {
      try {
        const urlParts = status.employee_status_attachment.split("/");
        const filename = urlParts[urlParts.length - 1];
        return decodeURIComponent(filename);
      } catch (error) {
        return status.employee_status_attachment;
      }
    }

    // Check for alternative attachment field
    if (status.status_attachment) {
      try {
        const urlParts = status.status_attachment.split("/");
        const filename = urlParts[urlParts.length - 1];
        return decodeURIComponent(filename);
      } catch (error) {
        return status.status_attachment;
      }
    }

    return "attachment.pdf";
  };

  const handleClose = useCallback(() => {
    // Clean up file URL when closing
    if (fileUrl) {
      URL.revokeObjectURL(fileUrl);
    }
    setFileUrl(null);
    setCurrentFileName("");
    onClose();
  }, [fileUrl, onClose]);

  // If no status or no attachment, don't render
  if (
    !status ||
    (!status.employee_status_attachment && !status.status_attachment)
  ) {
    return null;
  }

  const attachmentUrl =
    status.employee_status_attachment || status.status_attachment;

  return (
    <Dialog
      open={open}
      onClose={handleClose}
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
          Status Attachment - {currentFileName}
        </Typography>
        <IconButton
          onClick={handleClose}
          size="small"
          sx={{
            color: "text.secondary",
            "&:hover": {
              backgroundColor: "rgba(0, 0, 0, 0.04)",
            },
          }}>
          <Close />
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
            {fileUrl ? (
              <iframe
                src={fileUrl}
                width="100%"
                height="100%"
                style={{
                  border: "none",
                  borderRadius: "0 0 8px 8px",
                }}
                title="Status Attachment"
              />
            ) : attachmentUrl ? (
              // If we have a URL but no blob data, try to display directly
              <iframe
                src={attachmentUrl}
                width="100%"
                height="100%"
                style={{
                  border: "none",
                  borderRadius: "0 0 8px 8px",
                }}
                title="Status Attachment"
                onError={() => {
                  // If iframe fails to load, show fallback
                  console.error("Failed to load attachment:", attachmentUrl);
                }}
              />
            ) : (
              <Box textAlign="center">
                <AttachFile
                  sx={{ fontSize: 64, color: "text.secondary", mb: 2 }}
                />
                <Typography variant="h6" color="text.secondary">
                  {currentFileName}
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

export default StatusAttachmentDialog;
