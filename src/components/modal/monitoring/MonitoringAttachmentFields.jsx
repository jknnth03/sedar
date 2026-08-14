import React, { useState, useEffect } from "react";
import { Box, Typography, FormControl, Button } from "@mui/material";
import {
  CloudUpload as CloudUploadIcon,
  Visibility as VisibilityIcon,
} from "@mui/icons-material";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  CircularProgress,
} from "@mui/material";
import {
  Close as CloseIcon,
  Download as DownloadIcon,
} from "@mui/icons-material";

const MonitoringAttachmentField = ({ submissionData }) => {
  const [fileViewerOpen, setFileViewerOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [blobUrl, setBlobUrl] = useState(null);
  const [error, setError] = useState(null);
  const [activeAttachment, setActiveAttachment] = useState(null);

  const getSubmittable = () => {
    const result = submissionData?.result || submissionData;
    return result?.submittable || result;
  };

  const getAttachments = () => {
    const submittable = getSubmittable();
    if (
      submittable?.attachments &&
      Array.isArray(submittable.attachments) &&
      submittable.attachments.length > 0
    ) {
      return submittable.attachments;
    }
    return [];
  };

  const getDisplayFilename = (attachment) => {
    if (attachment?.filename) {
      return attachment.filename;
    }
    return "Unknown file";
  };

  const getDownloadUrl = (attachment) => {
    if (attachment?.download_url) {
      return attachment.download_url;
    }
    return "";
  };

  const attachments = getAttachments();
  const hasAttachments = attachments.length > 0;

  const fetchFileAsBlob = async (attachment) => {
    setLoading(true);
    setError(null);

    try {
      const url = getDownloadUrl(attachment);
      const token = localStorage.getItem("token");

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch file");
      }

      const blob = await response.blob();
      const blobURL = URL.createObjectURL(blob);
      setBlobUrl(blobURL);
    } catch (err) {
      setError(err.message);
      console.error("Error fetching file:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewFile = (attachment) => {
    setActiveAttachment(attachment);
    setFileViewerOpen(true);
    fetchFileAsBlob(attachment);
  };

  const handleFileViewerClose = () => {
    setFileViewerOpen(false);
    if (blobUrl) {
      URL.revokeObjectURL(blobUrl);
      setBlobUrl(null);
    }
    setError(null);
    setActiveAttachment(null);
  };

  const handleDownload = async () => {
    const filename = getDisplayFilename(activeAttachment);

    if (blobUrl) {
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      const url = getDownloadUrl(activeAttachment);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      link.target = "_blank";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  useEffect(() => {
    return () => {
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
      }
    };
  }, [blobUrl]);

  if (!hasAttachments) {
    return (
      <Box
        sx={{
          border: "1px solid #ddd",
          borderRadius: "8px",
          padding: "16px",
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          backgroundColor: "#fff",
        }}>
        <CloudUploadIcon sx={{ color: "#bbb", fontSize: 24 }} />
        <Typography sx={{ color: "#666", fontSize: "0.9rem" }}>
          No attachment available
        </Typography>
      </Box>
    );
  }

  return (
    <>
      <FormControl fullWidth>
        {attachments.map((attachment) => (
          <Box
            key={attachment.id}
            sx={{
              border: "1px solid #ddd",
              borderRadius: "8px",
              padding: "16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              backgroundColor: "#fff",
              mb: 1,
            }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <CloudUploadIcon sx={{ color: "#1976d2", fontSize: 24 }} />
              <Typography sx={{ fontSize: "0.9rem", color: "#333" }}>
                File name:{" "}
                <Box
                  component="span"
                  sx={{ color: "#f44336", fontWeight: 600 }}>
                  {getDisplayFilename(attachment)}
                </Box>
              </Typography>
            </Box>
            <Button
              variant="outlined"
              size="small"
              startIcon={<VisibilityIcon />}
              onClick={() => handleViewFile(attachment)}
              sx={{
                textTransform: "none",
                borderRadius: "20px",
                px: 2,
              }}>
              VIEW
            </Button>
          </Box>
        ))}
      </FormControl>

      <Dialog
        open={fileViewerOpen}
        onClose={handleFileViewerClose}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            height: "90vh",
            maxHeight: "90vh",
          },
        }}>
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: "1px solid #e0e0e0",
          }}>
          <Typography variant="h6" component="div">
            {getDisplayFilename(activeAttachment)}
          </Typography>
          <IconButton onClick={handleFileViewerClose} sx={{ color: "#666" }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent
          sx={{
            p: 0,
            display: "flex",
            flexDirection: "column",
            height: "100%",
            overflow: "hidden",
          }}>
          {loading && (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "100%",
                position: "absolute",
                width: "100%",
                zIndex: 1,
                backgroundColor: "rgba(255,255,255,0.9)",
              }}>
              <CircularProgress />
            </Box>
          )}
          {error && (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "100%",
              }}>
              <Typography color="error">{error}</Typography>
            </Box>
          )}
          {blobUrl && !error && (
            <iframe
              src={blobUrl}
              style={{
                width: "100%",
                height: "100%",
                border: "none",
              }}
              title="PDF Viewer"
            />
          )}
        </DialogContent>

        <DialogActions
          sx={{
            borderTop: "1px solid #e0e0e0",
            padding: "12px 24px",
          }}>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={handleDownload}
            disabled={loading}>
            Download
          </Button>
          <Button variant="contained" onClick={handleFileViewerClose}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default MonitoringAttachmentField;
