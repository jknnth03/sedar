import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Typography,
  IconButton,
  Box,
} from "@mui/material";
import { Close, AttachFile } from "@mui/icons-material";

const AttainmentFormDialog = ({
  fileViewerOpen,
  onClose,
  attachmentUrl,
  displayFilename,
  onDownload,
}) => {
  return (
    <Dialog
      open={fileViewerOpen}
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
          Attachment - {displayFilename}
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
        <Box
          sx={{
            width: "100%",
            height: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "#f5f5f5",
          }}>
          {attachmentUrl ? (
            <iframe
              src={attachmentUrl}
              width="100%"
              height="100%"
              style={{ border: "none", borderRadius: "0 0 8px 8px" }}
              title="File Attachment"
            />
          ) : (
            <Box textAlign="center">
              <AttachFile
                sx={{ fontSize: 64, color: "text.secondary", mb: 2 }}
              />
              <Typography variant="h6" color="text.secondary">
                {displayFilename}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                File preview not available
              </Typography>
              {onDownload && (
                <IconButton onClick={onDownload} sx={{ mt: 2 }}>
                  <Typography variant="button" sx={{ ml: 1 }}>
                    Download File
                  </Typography>
                </IconButton>
              )}
            </Box>
          )}
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default AttainmentFormDialog;
