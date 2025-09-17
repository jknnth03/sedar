import React, { useState, useCallback } from "react";
import { useFormContext } from "react-hook-form";
import {
  Grid,
  Box,
  FormHelperText,
  Button,
  IconButton,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  CircularProgress,
} from "@mui/material";
import {
  CloudUpload,
  Delete,
  AttachFile,
  Visibility,
  Download,
  Close,
} from "@mui/icons-material";

import { useGetAttainmentAttachmentQuery } from "../../../../../features/api/employee/attainmentsempApi";

const PendingAttainmentFormAttachment = ({
  isLoading,
  isReadOnly,
  watchedValues,
  handleFileChange,
  handleFileRemove,
  selectedPendingAttainment,
}) => {
  const {
    formState: { errors },
  } = useFormContext();

  const [fileViewerOpen, setFileViewerOpen] = useState(false);
  const [currentAttachmentId, setCurrentAttachmentId] = useState(null);
  const [currentFileName, setCurrentFileName] = useState("");
  const [fileUrl, setFileUrl] = useState(null);

  const {
    data: attachmentData,
    isLoading: isLoadingAttachment,
    error: attachmentError,
  } = useGetAttainmentAttachmentQuery(currentAttachmentId, {
    skip:
      !fileViewerOpen ||
      !currentAttachmentId ||
      currentAttachmentId === "undefined",
  });

  React.useEffect(() => {
    if (attachmentData) {
      const url = URL.createObjectURL(attachmentData);
      setFileUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [attachmentData]);

  const getAttachmentData = () => {
    const attachmentUrl = watchedValues?.existing_attachment_url;
    const attachmentFilename =
      watchedValues?.existing_attachment_filename ||
      watchedValues?.attainment_attachment?.name ||
      "attachment.pdf";

    let attachmentId = null;

    if (
      selectedPendingAttainment?.id &&
      typeof selectedPendingAttainment.id === "number"
    ) {
      attachmentId = selectedPendingAttainment.id;
    } else if (attachmentUrl) {
      const urlMatch = attachmentUrl.match(/\/attainments\/(\d+)\/attachment/);
      if (urlMatch && urlMatch[1]) {
        attachmentId = parseInt(urlMatch[1], 10);
      }
    }

    return {
      url: attachmentUrl,
      filename: attachmentFilename,
      id: attachmentId,
      isNewFile: watchedValues?.attainment_attachment instanceof File,
    };
  };

  const handleFileViewerOpen = useCallback(() => {
    const attachmentData = getAttachmentData();

    if (attachmentData.isNewFile) {
      const fileUrl = URL.createObjectURL(watchedValues.attainment_attachment);
      window.open(fileUrl, "_blank");
      setTimeout(() => URL.revokeObjectURL(fileUrl), 100);
      return;
    }

    if (
      attachmentData.id &&
      !isNaN(attachmentData.id) &&
      attachmentData.id > 0
    ) {
      setCurrentAttachmentId(attachmentData.id);
      setCurrentFileName(attachmentData.filename);
      setFileViewerOpen(true);
    } else {
      console.error("Invalid attachment ID:", attachmentData.id);
      alert("No valid attachment ID found. Check console for debug info.");
    }
  }, [watchedValues, selectedPendingAttainment]);

  const handleFileViewerClose = useCallback(() => {
    setFileViewerOpen(false);
    setCurrentAttachmentId(null);
    setCurrentFileName("");
  }, []);

  const handleFileDownload = useCallback(async () => {
    const attachmentData = getAttachmentData();

    if (attachmentData.isNewFile) {
      const url = URL.createObjectURL(watchedValues.attainment_attachment);
      const link = document.createElement("a");
      link.href = url;
      link.download =
        watchedValues.attainment_attachment.name || attachmentData.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      return;
    }

    if (attachmentData && fileUrl) {
      const link = document.createElement("a");
      link.href = fileUrl;
      link.download = attachmentData.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      alert("No attachment available to download");
    }
  }, [watchedValues, attachmentData, fileUrl]);

  const getDisplayFilename = () => {
    if (watchedValues?.existing_attachment_filename) {
      return watchedValues.existing_attachment_filename;
    }

    if (watchedValues?.attainment_attachment?.name) {
      return watchedValues.attainment_attachment.name;
    }

    if (watchedValues?.attainment_attachment instanceof File) {
      return watchedValues.attainment_attachment.name;
    }

    return "dummy.pdf";
  };

  const hasExistingFile = () => {
    if (watchedValues?.attainment_attachment) return true;
    const attachmentData = getAttachmentData();
    return !!attachmentData.id;
  };

  const getFileName = (filename) => {
    if (!filename) {
      if (watchedValues?.existing_attachment_filename) {
        return watchedValues.existing_attachment_filename;
      }
      if (watchedValues?.attainment_attachment?.name) {
        return watchedValues.attainment_attachment.name;
      }
      if (watchedValues?.attainment_attachment instanceof File) {
        return watchedValues.attainment_attachment.name;
      }
      return "dummy.pdf";
    }
    return filename.split("/").pop() || filename;
  };

  const FileViewerDialog = () => (
    <Dialog
      open={fileViewerOpen}
      onClose={handleFileViewerClose}
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
          Pending Attachment - {currentFileName}
        </Typography>
        <Box sx={{ display: "flex", gap: 1 }}>
          {fileUrl && (
            <IconButton
              onClick={handleFileDownload}
              size="small"
              sx={{
                color: "text.secondary",
                "&:hover": {
                  backgroundColor: "rgba(0, 0, 0, 0.04)",
                },
              }}
              title="Download file">
              <Download />
            </IconButton>
          )}
          <IconButton
            onClick={handleFileViewerClose}
            size="small"
            sx={{
              color: "text.secondary",
              "&:hover": {
                backgroundColor: "rgba(0, 0, 0, 0.04)",
              },
            }}>
            <Close />
          </IconButton>
        </Box>
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
              Loading pending attachment...
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
              Error loading pending attachment
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Unable to load the pending attachment. Please try again.
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
                title="Pending File Attachment"
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
                  Pending file preview not available
                </Typography>
              </Box>
            )}
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );

  return (
    <>
      <Grid item xs={12} className="general-form__grid-item">
        <Box sx={{ display: "flex", flexDirection: "column" }}>
          <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
            {!isReadOnly ? (
              <>
                <input
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  style={{ display: "none" }}
                  id="pending-attainment-file-input"
                  type="file"
                  onChange={handleFileChange}
                  disabled={isLoading}
                />
                <label
                  htmlFor="pending-attainment-file-input"
                  style={{ flex: 1 }}>
                  <Button
                    variant="outlined"
                    component="span"
                    startIcon={<CloudUpload />}
                    disabled={isLoading}
                    sx={{
                      height: "40px",
                      width: "1094px",
                      borderRadius: 2,
                      borderStyle: "dashed",
                      borderColor: errors.attainment_attachment
                        ? "error.main"
                        : "darkblue",
                      color: errors.attainment_attachment
                        ? "error.main"
                        : "darkblue",
                      "&:hover": {
                        borderColor: errors.attainment_attachment
                          ? "error.dark"
                          : "#0000CD",
                        backgroundColor: "action.hover",
                      },
                      "& .MuiButton-label": {
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      },
                    }}>
                    {watchedValues.attainment_attachment?.name ||
                      (hasExistingFile()
                        ? `Current: ${getDisplayFilename()}`
                        : "Upload Pending Attachment (PDF, DOC, DOCX, JPG, PNG)")}
                  </Button>
                </label>

                {watchedValues.attainment_attachment && (
                  <IconButton
                    onClick={handleFileRemove}
                    disabled={isLoading}
                    sx={{ color: "error.main" }}
                    title="Remove file">
                    <Delete />
                  </IconButton>
                )}
              </>
            ) : (
              <Box
                sx={{
                  border: "2px dashed #d1d5db",
                  borderRadius: 2,
                  p: 3,
                  textAlign: "center",
                  backgroundColor: "#f5f5f5",
                  width: "1094px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 1,
                }}>
                <AttachFile sx={{ color: "#6b7280", fontSize: 30 }} />
                {hasExistingFile() ? (
                  <>
                    <Typography
                      onClick={handleFileViewerOpen}
                      sx={{
                        color: "#1976d2",
                        textDecoration: "none",
                        "&:hover": {
                          textDecoration: "underline",
                        },
                        cursor: "pointer",
                        fontWeight: 500,
                      }}>
                      {getFileName(getDisplayFilename())}
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#6b7280" }}>
                      Click to view pending file
                    </Typography>
                    <Box sx={{ display: "flex", gap: 1 }}>
                      <IconButton
                        onClick={handleFileViewerOpen}
                        sx={{
                          color: "#1976d2",
                          "&:hover": {
                            backgroundColor: "rgba(25, 118, 210, 0.04)",
                          },
                        }}
                        title="View pending file">
                        <Visibility />
                      </IconButton>
                      <IconButton
                        onClick={handleFileDownload}
                        sx={{
                          color: "#1976d2",
                          "&:hover": {
                            backgroundColor: "rgba(25, 118, 210, 0.04)",
                          },
                        }}
                        title="Download pending file">
                        <Download />
                      </IconButton>
                    </Box>
                  </>
                ) : (
                  <Typography variant="body2" sx={{ color: "#6b7280" }}>
                    No pending attachment available
                  </Typography>
                )}
              </Box>
            )}
          </Box>

          {errors.attainment_attachment && (
            <FormHelperText error sx={{ mt: 0.5 }}>
              {errors.attainment_attachment.message ||
                "Invalid file format or size"}
            </FormHelperText>
          )}
        </Box>
      </Grid>

      <FileViewerDialog />
    </>
  );
};

export default PendingAttainmentFormAttachment;
