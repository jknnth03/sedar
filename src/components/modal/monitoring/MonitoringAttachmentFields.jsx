import React, { useState, useEffect } from "react";
import { Box, Typography, FormControl, Button } from "@mui/material";
import {
  AttachFile as AttachFileIcon,
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

  const getDisplayFilename = () => {
    const result = submissionData?.result || submissionData;
    const submittable = result?.submittable || result;

    if (submittable?.manpower_attachment_filename) {
      return submittable.manpower_attachment_filename;
    }

    if (submittable?.manpower_form_attachment) {
      return submittable.manpower_form_attachment.split("/").pop();
    }

    return "No attachment available";
  };

  const getDownloadUrl = () => {
    const result = submissionData?.result || submissionData;
    const submittable = result?.submittable || result;

    if (submittable?.manpower_form_attachment) {
      return submittable.manpower_form_attachment;
    }

    return "";
  };

  const hasAttachment = () => {
    return Boolean(getDownloadUrl());
  };

  const fetchFileAsBlob = async () => {
    setLoading(true);
    setError(null);

    try {
      const url = getDownloadUrl();
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

  const handleViewFile = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (hasAttachment()) {
      setFileViewerOpen(true);
      fetchFileAsBlob();
    }
  };

  const handleFileViewerClose = () => {
    setFileViewerOpen(false);
    if (blobUrl) {
      URL.revokeObjectURL(blobUrl);
      setBlobUrl(null);
    }
    setError(null);
  };

  const handleDownload = async () => {
    const filename = getDisplayFilename();

    if (blobUrl) {
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      const url = getDownloadUrl();
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

  return (
    <>
      <FormControl fullWidth>
        <Box
          sx={{
            border: "2px dashed #d1d5db",
            borderRadius: 2,
            p: 3,
            textAlign: "center",
            backgroundColor: "#fafafa",
            cursor: "default",
          }}>
          {hasAttachment() ? (
            <>
              <AttachFileIcon
                sx={{ color: "#6b7280", fontSize: 48, mb: 1.5 }}
              />
              <Typography
                onClick={handleViewFile}
                sx={{
                  color: "#1976d2",
                  fontWeight: 500,
                  mb: 0.5,
                  fontSize: "15px",
                  textDecoration: "none",
                  cursor: "pointer",
                  "&:hover": {
                    textDecoration: "underline",
                  },
                }}>
                {getDisplayFilename()}
              </Typography>
              <Typography
                variant="body2"
                onClick={handleViewFile}
                sx={{
                  color: "#6b7280",
                  fontSize: "13px",
                  cursor: "pointer",
                  "&:hover": {
                    color: "#4b5563",
                  },
                }}>
                Click to view file
              </Typography>
            </>
          ) : (
            <>
              <AttachFileIcon sx={{ color: "#9ca3af", fontSize: 48 }} />
              <Typography
                variant="body1"
                sx={{
                  color: "#9ca3af",
                  fontWeight: 500,
                  mb: 1,
                  mt: 1.5,
                }}>
                ATTACHMENT
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: "#9ca3af",
                  fontSize: "13px",
                }}>
                No attachment available
              </Typography>
            </>
          )}
        </Box>
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
            {getDisplayFilename()}
          </Typography>
          <IconButton
            onClick={handleFileViewerClose}
            sx={{
              color: "#666",
            }}>
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
