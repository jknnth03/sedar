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

const FileViewerDialog = ({
  open,
  onClose,
  selectedEntry,
  currentFormSubmissionId,
  attachmentIndex,
}) => {
  const { watch } = useFormContext();
  const [fileUrl, setFileUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState(false);

  const watchedAttachments = watch("attachments");

  const getDisplayFilename = () => {
    if (
      attachmentIndex !== undefined &&
      watchedAttachments?.[attachmentIndex]
    ) {
      const att = watchedAttachments[attachmentIndex];
      if (att.file_attachment instanceof File) return att.file_attachment.name;
      if (att.existing_file_name) return att.existing_file_name;
    }
    if (
      selectedEntry?.submittable?.attachments &&
      attachmentIndex !== null &&
      attachmentIndex !== undefined
    ) {
      const att = selectedEntry.submittable.attachments[attachmentIndex];
      if (att) return att.filename || "Attachment";
    }
    return "Attachment";
  };

  const getDownloadUrl = () => {
    if (
      attachmentIndex !== undefined &&
      watchedAttachments?.[attachmentIndex]?.existing_file_path
    ) {
      return watchedAttachments[attachmentIndex].existing_file_path;
    }
    if (
      selectedEntry?.submittable?.attachments &&
      attachmentIndex !== null &&
      attachmentIndex !== undefined
    ) {
      const att = selectedEntry.submittable.attachments[attachmentIndex];
      if (att?.download_url) return att.download_url;
    }
    return "";
  };

  const handleFileDownload = () => {
    const url = getDownloadUrl();
    if (!url) return;
    const link = document.createElement("a");
    link.href = url;
    link.download = getDisplayFilename();
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
      if (fileUrl && fileUrl.startsWith("blob:")) URL.revokeObjectURL(fileUrl);
      setFileUrl(null);
      setIsLoading(false);
      setLoadError(false);
      return;
    }

    if (
      attachmentIndex !== undefined &&
      watchedAttachments?.[attachmentIndex]?.file_attachment instanceof File
    ) {
      const file = watchedAttachments[attachmentIndex].file_attachment;
      if (fileUrl && fileUrl.startsWith("blob:")) URL.revokeObjectURL(fileUrl);
      setFileUrl(URL.createObjectURL(file));
      setLoadError(false);
      return;
    }

    const downloadUrl = getDownloadUrl();
    if (downloadUrl) {
      setIsLoading(true);
      setLoadError(false);

      fetch(downloadUrl, { credentials: "include" })
        .then((res) => {
          if (!res.ok) throw new Error("Failed to fetch");
          return res.blob();
        })
        .then((blob) => {
          if (fileUrl && fileUrl.startsWith("blob:"))
            URL.revokeObjectURL(fileUrl);
          setFileUrl(URL.createObjectURL(blob));
        })
        .catch(() => {
          setLoadError(true);
        })
        .finally(() => {
          setIsLoading(false);
        });
      return;
    }

    setFileUrl(null);
  }, [open, attachmentIndex, watchedAttachments]);

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
        sx: { backgroundColor: "rgba(0, 0, 0, 0.7)" },
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
            "&:hover": { backgroundColor: "rgba(0,0,0,0.04)" },
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
        ) : loadError ? (
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
                style={{ border: "none", borderRadius: "0 0 8px 8px" }}
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
