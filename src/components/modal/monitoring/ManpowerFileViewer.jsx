import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Box,
  CircularProgress,
  Typography,
} from "@mui/material";
import {
  Close as CloseIcon,
  Download as DownloadIcon,
} from "@mui/icons-material";

const ManpowerFileViewer = ({ open, onClose, submissionData }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fileUrl, setFileUrl] = useState(null);

  const getFileUrl = () => {
    if (submissionData?.result?.submittable?.manpower_form_attachment) {
      return submissionData.result.submittable.manpower_form_attachment;
    }

    if (submissionData?.submittable?.manpower_form_attachment) {
      return submissionData.submittable.manpower_form_attachment;
    }

    return null;
  };

  const getFilename = () => {
    if (submissionData?.result?.submittable?.manpower_attachment_filename) {
      return submissionData.result.submittable.manpower_attachment_filename;
    }

    if (submissionData?.submittable?.manpower_attachment_filename) {
      return submissionData.submittable.manpower_attachment_filename;
    }

    return "attachment.pdf";
  };

  useEffect(() => {
    if (open) {
      setLoading(true);
      setError(null);
      const url = getFileUrl();

      if (url) {
        setFileUrl(url);
        setLoading(false);
      } else {
        setError("File not found");
        setLoading(false);
      }
    }

    return () => {
      setFileUrl(null);
      setLoading(true);
      setError(null);
    };
  }, [open, submissionData]);

  const handleDownload = () => {
    const url = getFileUrl();
    const filename = getFilename();

    if (url) {
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      link.target = "_blank";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
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
          {getFilename()}
        </Typography>
        <IconButton
          onClick={handleClose}
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
        {loading ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "100%",
            }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "100%",
            }}>
            <Typography color="error">{error}</Typography>
          </Box>
        ) : (
          <iframe
            src={fileUrl}
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
          disabled={!fileUrl}>
          Download
        </Button>
        <Button variant="contained" onClick={handleClose}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ManpowerFileViewer;
