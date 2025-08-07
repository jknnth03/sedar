import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  TextField,
  IconButton,
  CircularProgress,
} from "@mui/material";
import {
  CheckCircle as ReceiveIcon,
  Close as CloseIcon,
  AttachFile as AttachFileIcon,
  Help as HelpIcon,
  Undo as ReturnIcon,
} from "@mui/icons-material";
import dayjs from "dayjs";
import { useGetFormSubmissionAttachmentQuery } from "../../features/api/approvalsetting/formSubmissionApi";

const SubmissionDialog = ({
  open,
  onClose,
  submission,
  onReceive,
  onReturn,
  isLoading = false,
}) => {
  const [fileViewerOpen, setFileViewerOpen] = useState(false);
  const [fileUrl, setFileUrl] = useState(null);
  const [currentFormSubmissionId, setCurrentFormSubmissionId] = useState(null);
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [confirmationAction, setConfirmationAction] = useState("");

  const {
    data: attachmentData,
    isLoading: isLoadingAttachment,
    error: attachmentError,
  } = useGetFormSubmissionAttachmentQuery(currentFormSubmissionId, {
    skip: !fileViewerOpen || !currentFormSubmissionId,
  });

  const handleClose = () => {
    onClose();
  };

  const handleReceive = () => {
    setConfirmationAction("receive");
    setConfirmationOpen(true);
  };

  const handleReturn = () => {
    setConfirmationAction("return");
    setConfirmationOpen(true);
  };

  const handleConfirmReceive = async () => {
    if (onReceive) {
      try {
        await onReceive(submission);
      } catch (error) {
        // Error handling is done in the parent component
      }
    }
    setConfirmationOpen(false);
    handleClose();
  };

  const handleConfirmReturn = async (reason) => {
    if (onReturn) {
      try {
        await onReturn(submission, reason);
      } catch (error) {
        // Error handling is done in the parent component
      }
    }
    setConfirmationOpen(false);
    handleClose();
  };

  const handleConfirmAction = (reason) => {
    if (confirmationAction === "receive") {
      handleConfirmReceive();
    } else if (confirmationAction === "return") {
      handleConfirmReturn(reason);
    }
  };

  const handleFileViewerOpen = () => {
    const formSubmissionId = submission?.id;
    if (formSubmissionId) {
      setCurrentFormSubmissionId(formSubmissionId);
      setFileViewerOpen(true);
    }
  };

  const handleFileViewerClose = () => {
    setFileViewerOpen(false);
    setFileUrl(null);
    setTimeout(() => {
      setCurrentFormSubmissionId(null);
    }, 100);
  };

  const getDisplayFilename = () => {
    return (
      submission?.submittable?.manpower_attachment_filename || "attachment.pdf"
    );
  };

  useEffect(() => {
    if (attachmentData && attachmentData instanceof Blob && fileViewerOpen) {
      if (fileUrl) {
        URL.revokeObjectURL(fileUrl);
      }
      const url = URL.createObjectURL(attachmentData);
      setFileUrl(url);
    }
  }, [attachmentData, fileViewerOpen]);

  useEffect(() => {
    return () => {
      if (fileUrl) {
        URL.revokeObjectURL(fileUrl);
      }
    };
  }, [fileUrl]);

  useEffect(() => {
    if (!fileViewerOpen && fileUrl) {
      const timeoutId = setTimeout(() => {
        URL.revokeObjectURL(fileUrl);
        setFileUrl(null);
      }, 100);

      return () => clearTimeout(timeoutId);
    }
  }, [fileViewerOpen, fileUrl]);

  // Reset confirmation state when dialog closes
  useEffect(() => {
    if (!open) {
      setConfirmationOpen(false);
      setConfirmationAction("");
    }
  }, [open]);

  if (!submission) return null;

  const submittable = submission.submittable || {};
  const position = submittable.position || {};
  const jobLevel = submittable.job_level || {};
  const requisitionType = submittable.requisition_type || {};
  const employeeToReplace = submittable.employee_to_be_replaced || {};

  const getFormType = () => {
    return submission.form?.name || "Manpower Requisition Form";
  };

  const getPosition = () => {
    return position.title?.name || "Unknown Position";
  };

  const getJobLevel = () => {
    return jobLevel.name || "N/A";
  };

  const getExpectedSalary = () => {
    const salary = submittable.expected_salary;
    return salary ? `₱${Number(salary).toLocaleString()}` : "₱0";
  };

  const getRequisitionType = () => {
    return requisitionType.name || "N/A";
  };

  const getEmployeeToBeReplaced = () => {
    return employeeToReplace.full_name || "N/A";
  };

  const getJustification = () => {
    return submittable.justification || "No justification provided";
  };

  const getRemarks = () => {
    return submittable.remarks || "No remarks";
  };

  const isProcessed = submission?.status === "APPROVED";

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
            <IconButton onClick={handleClose} size="small" disabled={isLoading}>
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
                    {getFormType()}
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
                This submission has already been approved
              </Typography>
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
                onClick={handleReturn}
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
                startIcon={<ReturnIcon />}>
                Return
              </Button>
              <Button
                onClick={handleReceive}
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
                  isLoading ? (
                    <CircularProgress size={16} color="inherit" />
                  ) : (
                    <ReceiveIcon />
                  )
                }>
                {isLoading ? "Processing..." : "Receive"}
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>

      <ConfirmationDialog
        open={confirmationOpen}
        onClose={() => setConfirmationOpen(false)}
        onConfirm={handleConfirmAction}
        action={confirmationAction}
        submission={submission}
        isLoading={isLoading}
      />

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

const ConfirmationDialog = ({
  open,
  onClose,
  onConfirm,
  action,
  submission,
  isLoading = false,
}) => {
  const [reason, setReason] = useState("");
  const [reasonError, setReasonError] = useState("");

  useEffect(() => {
    if (!open) {
      setReason("");
      setReasonError("");
    }
  }, [open, action]);

  const handleConfirm = () => {
    if (action === "return" && !reason.trim()) {
      setReasonError("Reason is required for return");
      return;
    }

    setReasonError("");

    if (action === "return") {
      onConfirm(reason.trim());
    } else {
      onConfirm();
    }
  };

  const handleReasonChange = (e) => {
    setReason(e.target.value);
    if (reasonError) {
      setReasonError("");
    }
  };

  const getConfirmationMessage = () => {
    if (!action || !submission) return "";

    const messages = {
      receive: `Are you sure you want to receive this manpower form?`,
      return: `Are you sure you want to return this manpower form?`,
    };

    return messages[action] || "";
  };

  const getConfirmationTitle = () => {
    if (!action) return "Confirmation";

    const titles = {
      receive: "Confirm Receive",
      return: "Confirm Return",
    };

    return titles[action] || "Confirmation";
  };

  const getConfirmButtonText = () => {
    if (!action) return "Confirm";

    const texts = {
      receive: "RECEIVE",
      return: "RETURN",
    };

    return texts[action] || "Confirm";
  };

  const shouldShowReasonField = action === "return";

  const getSubmissionDisplayName = () => {
    if (!submission) return "Unknown";
    return submission.form?.name || "Manpower Requisition Form";
  };

  const getSubmissionId = () => {
    if (!submission) return "N/A";
    return submission.id || "N/A";
  };

  const canConfirmReturn = action === "return" ? reason.trim() : true;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
        },
      }}>
      <DialogTitle sx={{ textAlign: "center", pt: 3 }}>
        <Box display="flex" justifyContent="center" alignItems="center" mb={2}>
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
          sx={{ fontSize: "13px", mb: shouldShowReasonField ? 3 : 0 }}>
          {getSubmissionDisplayName()} - ID: {getSubmissionId()}
        </Typography>

        {shouldShowReasonField && (
          <TextField
            label="Reason for Return"
            value={reason}
            onChange={handleReasonChange}
            multiline
            rows={3}
            fullWidth
            placeholder="Please provide a reason for returning this form..."
            error={!!reasonError}
            helperText={reasonError}
            disabled={isLoading}
            variant="outlined"
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
                "&.Mui-error": {
                  "& fieldset": {
                    borderColor: "#d32f2f",
                  },
                },
              },
              "& .MuiFormHelperText-root.Mui-error": {
                color: "#d32f2f",
              },
            }}
          />
        )}
      </DialogContent>

      <DialogActions sx={{ justifyContent: "center", pb: 3, px: 3 }}>
        <Box display="flex" gap={2}>
          <Button
            onClick={onClose}
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
            onClick={handleConfirm}
            variant="contained"
            sx={{
              borderRadius: 2,
              minWidth: 80,
              height: "40px",
              backgroundColor: action === "receive" ? "#28a745" : "#dc3545",
              "&:hover": {
                backgroundColor: action === "receive" ? "#218838" : "#c82333",
              },
            }}
            disabled={isLoading || (action === "return" && !canConfirmReturn)}>
            {isLoading ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              getConfirmButtonText()
            )}
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
};

// Create the object to export
const ReceivingDialog = {
  SubmissionDialog,
  ConfirmationDialog,
};

// Export as default
export default ReceivingDialog;
