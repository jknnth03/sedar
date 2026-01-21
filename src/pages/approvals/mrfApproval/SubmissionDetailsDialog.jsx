import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  TextField,
  Button,
  IconButton,
  Stack,
  Grid,
  Divider,
  CircularProgress,
  Autocomplete,
  Box,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import CloseIcon from "@mui/icons-material/Close";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import HelpIcon from "@mui/icons-material/Help";
import { useGetMrfSubmissionAttachmentQuery } from "../../../features/api/forms/mrfApi";

const SubmissionDetailsDialog = ({
  open,
  onClose,
  submission,
  onApprove,
  onReject,
  isLoading = false,
  styles,
}) => {
  const [comments, setComments] = useState("");
  const [reason, setReason] = useState("");
  const [actionType, setActionType] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [fileViewerOpen, setFileViewerOpen] = useState(false);
  const [fileUrl, setFileUrl] = useState(null);
  const [currentFormSubmissionId, setCurrentFormSubmissionId] = useState(null);

  const isReasonRequired = actionType === "reject";
  const canProceed =
    actionType === "approve" || (actionType === "reject" && comments.trim());

  const {
    data: attachmentData,
    isLoading: isLoadingAttachment,
    error: attachmentError,
  } = useGetMrfSubmissionAttachmentQuery(currentFormSubmissionId, {
    skip: !fileViewerOpen || !currentFormSubmissionId,
  });

  const handleApprove = () => {
    setActionType("approve");
    setConfirmAction("approve");
    setConfirmOpen(true);
  };

  const handleReject = () => {
    setActionType("reject");
    setConfirmAction("reject");
    setConfirmOpen(true);
  };

  const handleActionConfirm = () => {
    if (confirmAction === "approve") {
      onApprove({ comments });
    } else if (confirmAction === "reject") {
      onReject({
        reason: reason.trim(),
        comments,
      });
    }
    setConfirmOpen(false);
    handleReset();
  };

  const handleClose = () => {
    onClose();
    handleReset();
  };

  const handleReset = () => {
    setComments("");
    setReason("");
    setActionType(null);
    setConfirmAction(null);
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

  const handleFileViewerOpen = () => {
    const formSubmissionId = submission?.submission?.id || submission?.id;
    if (formSubmissionId) {
      setCurrentFormSubmissionId(formSubmissionId);
      setFileViewerOpen(true);
    }
  };

  const handleFileViewerClose = () => {
    setFileViewerOpen(false);
    // Don't reset currentFormSubmissionId immediately to prevent query from being skipped
    // Reset fileUrl to null but don't revoke it yet - let useEffect handle it
    setFileUrl(null);

    // Reset currentFormSubmissionId after a short delay to allow cleanup
    setTimeout(() => {
      setCurrentFormSubmissionId(null);
    }, 100);
  };

  const getDisplayFilename = () => {
    const submissionData = submission?.submission || submission;
    return (
      submissionData?.form_details?.manpower_attachment_filename || "dummy.pdf"
    );
  };

  const getConfirmationTitle = () => {
    return confirmAction === "approve"
      ? "Confirm Approval"
      : "Confirm Rejection";
  };

  const getConfirmationMessage = () => {
    return confirmAction === "approve"
      ? "Are you sure you want to Approve this request?"
      : "Are you sure you want to Reject this request?";
  };

  const getSubmissionDisplayName = () => {
    if (!submission) return "Unknown";
    const submissionData = submission.submission || submission;
    return (
      submissionData.form_details?.position?.title?.name ||
      "Manpower Requisition"
    );
  };

  const getSubmissionId = () => {
    if (!submission) return "N/A";
    const submissionData = submission.submission || submission;
    return submissionData.id || "N/A";
  };

  const getConfirmButtonColor = () => {
    return confirmAction === "approve" ? "success" : "error";
  };

  const getConfirmButtonText = () => {
    return confirmAction === "approve" ? "APPROVE" : "REJECT";
  };

  const canConfirmReject = confirmAction === "reject" ? reason.trim() : true;

  // Handle attachment data and create blob URL
  useEffect(() => {
    if (attachmentData && attachmentData instanceof Blob && fileViewerOpen) {
      // Revoke previous URL if it exists
      if (fileUrl) {
        URL.revokeObjectURL(fileUrl);
      }

      // Create new blob URL
      const url = URL.createObjectURL(attachmentData);
      setFileUrl(url);
    }
  }, [attachmentData, fileViewerOpen]);

  // Cleanup blob URL when component unmounts or fileUrl changes
  useEffect(() => {
    return () => {
      if (fileUrl) {
        URL.revokeObjectURL(fileUrl);
      }
    };
  }, [fileUrl]);

  // Additional cleanup when file viewer closes
  useEffect(() => {
    if (!fileViewerOpen && fileUrl) {
      // Small delay to ensure iframe has time to finish using the URL
      const timeoutId = setTimeout(() => {
        URL.revokeObjectURL(fileUrl);
        setFileUrl(null);
      }, 100);

      return () => clearTimeout(timeoutId);
    }
  }, [fileViewerOpen, fileUrl]);

  if (!submission) return null;

  const submissionData = submission.submission || submission;
  const status = submission?.status?.toLowerCase() || "pending";
  const isProcessed = status === "approved" || status === "rejected";

  // Get actual data from the submission object
  const getFormType = () => {
    return "Manpower Requisition Form";
  };

  const getPosition = () => {
    return submissionData?.form_details?.position?.title?.name || "N/A";
  };

  const getJobLevel = () => {
    return submissionData?.form_details?.job_level?.name || "N/A";
  };

  const getExpectedSalary = () => {
    const salary = submissionData?.form_details?.expected_salary;
    return salary ? `₱${parseFloat(salary).toLocaleString()}` : "N/A";
  };

  const getRequisitionType = () => {
    return submissionData?.form_details?.requisition_type?.name || "N/A";
  };

  const getEmployeeToBeReplaced = () => {
    return (
      submissionData?.form_details?.employee_to_be_replaced?.full_name || "N/A"
    );
  };

  const getJustification = () => {
    return submissionData?.form_details?.justification || "N/A";
  };

  const getRemarks = () => {
    return submissionData?.form_details?.remarks || "N/A";
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
          },
        }}>
        <DialogTitle
          sx={{
            padding: "18px 26px",
          }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              📋
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 600,
                  color: "rgb(33, 61, 112)",
                  fontSize: "16px",
                }}>
                VIEW MANPOWER FORM
              </Typography>
            </Box>
            <IconButton onClick={handleClose} size="small">
              <CloseIcon sx={{ color: "rgb(33, 61, 112)" }} />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box
            sx={{
              backgroundColor: "#ffffff",
              border: "1px solid #dee2e6",
              borderRadius: 2,
              p: 3,
              mb: 2,
            }}>
            <Typography
              variant="subtitle2"
              sx={{
                fontWeight: 600,
                color: "rgb(33, 61, 112)",
                mb: 2,
                fontSize: "14px",
              }}>
              Request Information
            </Typography>

            <Box>
              <Box sx={{ display: "flex", gap: 6, mb: 1.5 }}>
                <Box
                  sx={{
                    flex: 1,
                    minHeight: "60px",
                    display: "flex",
                    flexDirection: "column",
                  }}>
                  <Typography
                    variant="caption"
                    sx={{
                      color: "rgb(33, 61, 112)",
                      fontSize: "11px",
                      fontWeight: 600,
                      display: "block",
                      mb: 0.5,
                    }}>
                    FORM TYPE
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: "#000000ff",
                      fontSize: "13px",
                      lineHeight: 1.4,
                      flex: 1,
                      wordBreak: "break-word",
                      whiteSpace: "normal",
                      overflow: "hidden",
                    }}>
                    Manpower Requisition Form
                  </Typography>
                </Box>
                <Box
                  sx={{
                    flex: 1,
                    minHeight: "60px",
                    display: "flex",
                    flexDirection: "column",
                  }}>
                  <Typography
                    variant="caption"
                    sx={{
                      color: "rgb(33, 61, 112)",
                      fontSize: "11px",
                      fontWeight: 600,
                      display: "block",
                      mb: 0.5,
                    }}>
                    POSITION
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: "#000000ff",
                      fontSize: "13px",
                      lineHeight: 1.4,
                      flex: 1,
                      wordBreak: "break-word",
                      whiteSpace: "normal",
                      overflow: "hidden",
                    }}>
                    {getPosition()}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    flex: 1,
                    minHeight: "60px",
                    display: "flex",
                    flexDirection: "column",
                  }}>
                  <Typography
                    variant="caption"
                    sx={{
                      color: "rgb(33, 61, 112)",
                      fontSize: "11px",
                      fontWeight: 600,
                      display: "block",
                      mb: 0.5,
                    }}>
                    JOB LEVEL
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: "#000000ff",
                      fontSize: "13px",
                      lineHeight: 1.4,
                      flex: 1,
                      wordBreak: "break-word",
                      whiteSpace: "normal",
                      overflow: "hidden",
                    }}>
                    {getJobLevel()}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: "flex", gap: 6 }}>
                <Box
                  sx={{
                    flex: 1,
                    minHeight: "60px",
                    display: "flex",
                    flexDirection: "column",
                  }}>
                  <Typography
                    variant="caption"
                    sx={{
                      color: "rgb(33, 61, 112)",
                      fontSize: "11px",
                      fontWeight: 600,
                      display: "block",
                      mb: 0.5,
                    }}>
                    EXPECTED SALARY
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: "#000000ff",
                      fontSize: "13px",
                      lineHeight: 1.4,
                      flex: 1,
                      wordBreak: "break-word",
                      whiteSpace: "normal",
                      overflow: "hidden",
                    }}>
                    {getExpectedSalary()}
                  </Typography>
                </Box>

                <Box
                  sx={{
                    flex: 1,
                    minHeight: "60px",
                    display: "flex",
                    flexDirection: "column",
                  }}>
                  <Typography
                    variant="caption"
                    sx={{
                      color: "rgb(33, 61, 112)",
                      fontSize: "11px",
                      fontWeight: 600,
                      display: "block",
                      mb: 0.5,
                    }}>
                    REQUISITION TYPE
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: "#000000ff",
                      fontSize: "13px",
                      lineHeight: 1.4,
                      flex: 1,
                      wordBreak: "break-word",
                      whiteSpace: "normal",
                      overflow: "hidden",
                    }}>
                    {getRequisitionType()}
                  </Typography>
                </Box>

                <Box
                  sx={{
                    flex: 1,
                    minHeight: "60px",
                    display: "flex",
                    flexDirection: "column",
                  }}>
                  <Typography
                    variant="caption"
                    sx={{
                      color: "rgb(33, 61, 112)",
                      fontSize: "11px",
                      fontWeight: 600,
                      display: "block",
                      mb: 0.5,
                    }}>
                    EMPLOYEE TO BE REPLACED
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: "#000000ff",
                      fontSize: "13px",
                      lineHeight: 1.4,
                      flex: 1,
                      wordBreak: "break-word",
                      whiteSpace: "normal",
                      overflow: "hidden",
                    }}>
                    {getEmployeeToBeReplaced()}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>

          <Box
            sx={{
              backgroundColor: "#ffffff",
              border: "1px solid #dee2e6",
              borderRadius: 2,
              p: 3,
              mb: 2,
            }}>
            <Typography
              variant="subtitle2"
              sx={{
                fontWeight: 600,
                color: "rgb(33, 61, 112)",
                mb: 1.5,
                fontSize: "14px",
              }}>
              Justification & Remarks
            </Typography>

            <Box sx={{ display: "flex", gap: 10 }}>
              <Box
                sx={{
                  flex: 1,
                  minHeight: "60px",
                  display: "flex",
                  flexDirection: "column",
                }}>
                <Typography
                  variant="caption"
                  sx={{
                    color: "rgb(33, 61, 112)",
                    fontSize: "11px",
                    fontWeight: 600,
                    mb: 0.5,
                  }}>
                  JUSTIFICATION
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: "#000000ff",
                    fontSize: "13px",
                    lineHeight: 1.4,
                    flex: 1,
                    wordBreak: "break-word",
                    whiteSpace: "normal",
                    overflow: "hidden",
                  }}>
                  {getJustification()}
                </Typography>
              </Box>

              <Box
                sx={{
                  flex: 1,
                  minHeight: "60px",
                  display: "flex",
                  flexDirection: "column",
                }}>
                <Typography
                  variant="caption"
                  sx={{
                    color: "rgb(33, 61, 112)",
                    fontSize: "11px",
                    fontWeight: 600,
                    mb: 0.5,
                  }}>
                  REMARKS
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: "#000000ff",
                    fontSize: "13px",
                    lineHeight: 1.4,
                    flex: 1,
                    wordBreak: "break-word",
                    whiteSpace: "normal",
                    overflow: "hidden",
                  }}>
                  {getRemarks()}
                </Typography>
              </Box>
            </Box>
          </Box>

          <Box
            sx={{
              backgroundColor: "#ffffff",
              border: "1px solid #dee2e6",
              borderRadius: 2,
              p: 3,
              mb: 2,
            }}>
            <Typography
              variant="subtitle2"
              sx={{
                fontWeight: 600,
                color: "rgb(33, 61, 112)",
                mb: 1.5,
                fontSize: "14px",
              }}>
              Supporting Documents
            </Typography>

            <Box
              sx={{
                border: "2px dashed #d1d5db",
                borderRadius: 2,
                p: 3,
                textAlign: "center",
                backgroundColor: "#ffffff",
                cursor: "pointer",
                "&:hover": {
                  backgroundColor: "#f8f9fa",
                },
              }}
              onClick={handleFileViewerOpen}>
              <AttachFileIcon
                sx={{ color: "#000000ff", fontSize: 32, mb: 0.5 }}
              />
              <Typography
                sx={{
                  color: "#007bff",
                  fontSize: "14px",
                  fontWeight: 500,
                  mb: 0.5,
                  textDecoration: "underline",
                  cursor: "pointer",
                }}>
                {getDisplayFilename()}
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: "#000000ff",
                  fontSize: "12px",
                  display: "block",
                }}>
                Click to view file
              </Typography>
            </Box>
          </Box>

          {!isProcessed &&
            submission?.comments !== null &&
            submission?.comments !== "" && (
              <Box sx={{ mt: 2 }}>
                <TextField
                  label="Additional Comments (Optional)"
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  multiline
                  rows={3}
                  fullWidth
                  placeholder="Add any additional comments..."
                  variant="outlined"
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                    },
                  }}
                />
              </Box>
            )}

          {isProcessed && (
            <Box
              sx={{
                textAlign: "center",
                py: 2,
                backgroundColor: "#ffffff",
                borderRadius: 2,
              }}>
              <Typography
                variant="h6"
                color="text.secondary"
                sx={{ fontSize: "16px" }}>
                This submission has already been {status}
              </Typography>
              {submission.reason && (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 1, fontSize: "13px" }}>
                  Reason: {submission.reason}
                </Typography>
              )}
            </Box>
          )}
        </DialogContent>

        <DialogActions
          sx={{
            px: 4.4,
            pb: 2,
            pt: 2,
            justifyContent: "flex-end",
            gap: 2,
          }}>
          {!isProcessed && (
            <>
              <Button
                onClick={handleReject}
                variant="contained"
                sx={{
                  backgroundColor: "#dc3545",
                  color: "white",
                  minWidth: "100px",
                  height: "40px",
                  fontSize: "14px",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  borderRadius: 1,
                  "&:hover": {
                    backgroundColor: "#c82333",
                  },
                }}
                disabled={isLoading}
                startIcon={
                  isLoading && actionType === "reject" ? (
                    <CircularProgress size={16} color="inherit" />
                  ) : (
                    <CancelIcon />
                  )
                }>
                {isLoading && actionType === "reject"
                  ? "Processing..."
                  : "REJECT"}
              </Button>
              <Button
                onClick={handleApprove}
                variant="contained"
                sx={{
                  backgroundColor: "#28a745",
                  color: "white",
                  minWidth: "100px",
                  height: "40px",
                  fontSize: "14px",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  borderRadius: 1,
                  "&:hover": {
                    backgroundColor: "#218838",
                  },
                }}
                disabled={isLoading}
                startIcon={
                  isLoading && actionType === "approve" ? (
                    <CircularProgress size={16} color="inherit" />
                  ) : (
                    <CheckCircleIcon />
                  )
                }>
                {isLoading && actionType === "approve"
                  ? "Processing..."
                  : "APPROVE"}
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>

      <Dialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
          },
        }}>
        <DialogTitle sx={{ textAlign: "center", pt: 3 }}>
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            mb={2}>
            <HelpIcon sx={{ fontSize: 60, color: "#ff4400" }} />
          </Box>
          <Typography
            variant="h6"
            fontWeight="bold"
            textAlign="center"
            sx={{ color: "#213d70", fontSize: "18px" }}>
            {getConfirmationTitle()}
          </Typography>
        </DialogTitle>

        <DialogContent sx={{ textAlign: "center", px: 3 }}>
          <Typography
            variant="body1"
            gutterBottom
            sx={{ fontSize: "14px", mb: 2 }}>
            {getConfirmationMessage()}
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ fontSize: "13px", mb: 3 }}>
            {getSubmissionDisplayName()} - ID: {getSubmissionId()}
          </Typography>

          {confirmAction === "reject" && (
            <TextField
              label={<span>Reason for Rejection</span>}
              placeholder="Please provide a reason for rejecting this form..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              multiline
              rows={3}
              fullWidth
              variant="outlined"
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                },
              }}
            />
          )}
        </DialogContent>

        <DialogActions sx={{ justifyContent: "center", pb: 3, px: 3 }}>
          <Box display="flex" gap={2}>
            <Button
              onClick={() => setConfirmOpen(false)}
              variant="outlined"
              sx={{
                borderRadius: 2,
                minWidth: 80,
                height: "40px",
                borderColor: "#dc3545",
                color: "#dc3545",
                "&:hover": {
                  borderColor: "#c82333",
                  backgroundColor: "rgba(220, 53, 69, 0.04)",
                },
              }}
              disabled={isLoading}>
              Cancel
            </Button>
            <Button
              onClick={handleActionConfirm}
              variant="contained"
              sx={{
                borderRadius: 2,
                minWidth: 80,
                height: "40px",
                backgroundColor:
                  confirmAction === "approve" ? "#28a745" : "#dc3545",
                "&:hover": {
                  backgroundColor:
                    confirmAction === "approve" ? "#218838" : "#c82333",
                },
              }}
              disabled={
                isLoading || (confirmAction === "reject" && !canConfirmReject)
              }>
              {isLoading ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                getConfirmButtonText()
              )}
            </Button>
          </Box>
        </DialogActions>
      </Dialog>

      <Dialog
        open={fileViewerOpen}
        onClose={handleFileViewerClose}
        maxWidth={false}
        fullWidth={false}
        PaperProps={{
          sx: {
            width: "80vw",
            height: "90vh",
            maxWidth: "none",
            maxHeight: "none",
            margin: 0,
            borderRadius: 2,
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
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
          <Typography variant="h6" sx={{ fontWeight: 600, fontSize: "16px" }}>
            Attachment - {getDisplayFilename()}
          </Typography>
          <IconButton onClick={handleFileViewerClose} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent
          sx={{ p: 0, height: "calc(90vh - 64px)", overflow: "hidden" }}>
          {isLoadingAttachment ? (
            <Box
              sx={{
                width: "100%",
                height: "100%",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: "#f5f5f5",
                flexDirection: "column",
              }}>
              <CircularProgress size={48} />
              <Typography
                variant="body1"
                sx={{ mt: 2, color: "text.secondary" }}>
                Loading attachment...
              </Typography>
            </Box>
          ) : attachmentError ? (
            <Box
              sx={{
                width: "100%",
                height: "100%",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: "#f5f5f5",
                flexDirection: "column",
              }}>
              <Typography variant="h6" color="error" gutterBottom>
                Error loading attachment
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Unable to load the attachment. Please try again.
              </Typography>
            </Box>
          ) : fileUrl ? (
            <Box
              sx={{
                width: "100%",
                height: "100%",
                backgroundColor: "#f5f5f5",
              }}>
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
              <Box textAlign="center">
                <AttachFileIcon
                  sx={{ fontSize: 64, color: "text.secondary", mb: 2 }}
                />
                <Typography
                  variant="h6"
                  color="text.secondary"
                  sx={{ fontSize: "18px" }}>
                  {getDisplayFilename()}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 1, fontSize: "14px" }}>
                  File preview not available
                </Typography>
              </Box>
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SubmissionDetailsDialog;
