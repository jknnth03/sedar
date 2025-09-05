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

import { useGetPositionAttachmentQuery } from "../../../features/api/masterlist/positionAttachmentApi";

const PositionDialog = ({ open, onClose, position }) => {
  const [fileUrl, setFileUrl] = useState(null);
  const [currentFileName, setCurrentFileName] = useState("");

  const {
    data: attachmentData,
    isLoading: isLoadingAttachment,
    error: attachmentError,
  } = useGetPositionAttachmentQuery(position?.id, {
    skip: !open || !position?.id || position?.id === "undefined",
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

  // Set filename when position changes
  useEffect(() => {
    if (position) {
      const filename = getDisplayFileName(position);
      setCurrentFileName(filename);
    }
  }, [position]);

  // Function to get display filename (similar to your positions component)
  const getDisplayFileName = (position) => {
    if (!position) return "";

    // First, check if position_attachment_filename is provided
    if (position.position_attachment_filename) {
      return position.position_attachment_filename;
    }

    // Fallback to extracting from URL if filename is not provided
    if (position.position_attachment) {
      try {
        const urlParts = position.position_attachment.split("/");
        const filename = urlParts[urlParts.length - 1];
        return decodeURIComponent(filename);
      } catch (error) {
        return position.position_attachment;
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

  // If no position or no attachment, don't render
  if (!position || !position.position_attachment) {
    return null;
  }

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
          Attachment - {currentFileName}
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
                title="Position Attachment"
              />
            ) : position.position_attachment ? (
              // If we have a URL but no blob data, try to display directly
              <iframe
                src={position.position_attachment}
                width="100%"
                height="100%"
                style={{
                  border: "none",
                  borderRadius: "0 0 8px 8px",
                }}
                title="Position Attachment"
                onError={() => {
                  // If iframe fails to load, show fallback
                  console.error(
                    "Failed to load attachment:",
                    position.position_attachment
                  );
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

export default PositionDialog;
