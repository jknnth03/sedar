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
  Visibility as VisibilityIcon,
} from "@mui/icons-material";
import { useGetMrfAttachmentByIdQuery } from "../../../features/api/forms/mrfApi";

const SubmissionDialog = ({
  open,
  onClose,
  submission,
  isDialogLoading = false,
  onReceive,
  onReturn,
  isLoading = false,
}) => {
  const [fileViewerOpen, setFileViewerOpen] = useState(false);
  const [fileUrl, setFileUrl] = useState(null);
  const [selectedAttachment, setSelectedAttachment] = useState(null);
  const [fetchAttachment, setFetchAttachment] = useState(false);
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [confirmationAction, setConfirmationAction] = useState("");

  const {
    data: attachmentData,
    isLoading: isLoadingAttachment,
    error: attachmentError,
  } = useGetMrfAttachmentByIdQuery(
    {
      submissionId: selectedAttachment?.submissionId,
      attachmentId: selectedAttachment?.attachmentId,
    },
    {
      skip:
        !fetchAttachment ||
        !selectedAttachment?.submissionId ||
        !selectedAttachment?.attachmentId ||
        !fileViewerOpen,
    },
  );

  useEffect(() => {
    if (!fileViewerOpen) {
      if (fileUrl) {
        URL.revokeObjectURL(fileUrl);
        setFileUrl(null);
      }
      return;
    }
    if (isLoadingAttachment || attachmentError) return;
    if (attachmentData instanceof Blob) {
      if (fileUrl) URL.revokeObjectURL(fileUrl);
      setFileUrl(URL.createObjectURL(attachmentData));
    }
  }, [fileViewerOpen, attachmentData, isLoadingAttachment, attachmentError]);

  useEffect(() => {
    if (!open) {
      setConfirmationOpen(false);
      setConfirmationAction("");
    }
  }, [open]);

  const handleClose = () => onClose();

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
      } catch (error) {}
    }
    setConfirmationOpen(false);
    handleClose();
  };

  const handleConfirmReturn = async (reason) => {
    if (onReturn) {
      try {
        await onReturn(submission, reason);
      } catch (error) {}
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

  const handleViewAttachment = (attachment) => {
    const submissionId = submission?.id;
    setFileUrl(null);
    setSelectedAttachment({
      submissionId,
      attachmentId: attachment.id,
      filename: attachment.filename,
    });
    setFetchAttachment(true);
    setFileViewerOpen(true);
  };

  const handleFileViewerClose = () => {
    setFileViewerOpen(false);
    setFetchAttachment(false);
    setSelectedAttachment(null);
    if (fileUrl) {
      URL.revokeObjectURL(fileUrl);
      setFileUrl(null);
    }
  };

  const submittable = submission?.submittable || {};
  const position = submittable.position || {};
  const jobLevel = submittable.job_level || {};
  const requisitionType = submittable.requisition_type || {};
  const employeeToReplace = submittable.replacement_info || {};
  const attachments = submittable.attachments || [];

  const getFormType = () =>
    submission?.form?.name || "Manpower Requisition Form";
  const getPosition = () => position.title?.name || "Unknown Position";
  const getJobLevel = () => jobLevel.name || "N/A";
  const getExpectedSalary = () => {
    const salary = submittable.expected_salary;
    return salary ? `₱${Number(salary).toLocaleString()}` : "₱0";
  };
  const getRequisitionType = () => requisitionType.name || "N/A";
  const getEmployeeToBeReplaced = () => employeeToReplace?.full_name || "N/A";
  const getJustification = () =>
    submittable.justification || "No justification provided";
  const getRemarks = () => submittable.remarks || "No remarks";

  const isProcessed =
    submission?.status === "APPROVED" ||
    submission?.status === "RECEIVED" ||
    submission?.status === "RETURNED";

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
        <DialogTitle sx={{ padding: "18px 26px" }}>
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
          {isDialogLoading ? (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                minHeight: "300px",
                flexDirection: "column",
                gap: 2,
              }}>
              <CircularProgress size={40} />
              <Typography variant="body2" color="text.secondary">
                Loading form details...
              </Typography>
            </Box>
          ) : !submission ? (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                minHeight: "300px",
              }}>
              <Typography variant="body2" color="text.secondary">
                No data available.
              </Typography>
            </Box>
          ) : (
            <>
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

                <Box sx={{ display: "flex", gap: 6, mb: 1.5 }}>
                  {[
                    { label: "FORM TYPE", value: getFormType() },
                    { label: "POSITION", value: getPosition() },
                    { label: "JOB LEVEL", value: getJobLevel() },
                  ].map(({ label, value }) => (
                    <Box
                      key={label}
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
                        {label}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          color: "#000",
                          fontSize: "13px",
                          lineHeight: 1.4,
                          wordBreak: "break-word",
                        }}>
                        {value}
                      </Typography>
                    </Box>
                  ))}
                </Box>

                <Box sx={{ display: "flex", gap: 6 }}>
                  {[
                    { label: "EXPECTED SALARY", value: getExpectedSalary() },
                    { label: "REQUISITION TYPE", value: getRequisitionType() },
                    {
                      label: "EMPLOYEE TO BE REPLACED",
                      value: getEmployeeToBeReplaced(),
                    },
                  ].map(({ label, value }) => (
                    <Box
                      key={label}
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
                        {label}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          color: "#000",
                          fontSize: "13px",
                          lineHeight: 1.4,
                          wordBreak: "break-word",
                        }}>
                        {value}
                      </Typography>
                    </Box>
                  ))}
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
                  {[
                    { label: "JUSTIFICATION", value: getJustification() },
                    { label: "REMARKS", value: getRemarks() },
                  ].map(({ label, value }) => (
                    <Box
                      key={label}
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
                        {label}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          color: "#000",
                          fontSize: "13px",
                          lineHeight: 1.4,
                        }}>
                        {value}
                      </Typography>
                    </Box>
                  ))}
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

                {attachments.length > 0 ? (
                  <Box
                    sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                    {attachments.map((attachment) => (
                      <Box
                        key={attachment.id}
                        sx={{
                          border: "2px solid #ddd",
                          borderRadius: 2,
                          p: 1.5,
                          backgroundColor: "#fff",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                        }}>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1.5,
                          }}>
                          <AttachFileIcon
                            sx={{ color: "#1976d2", fontSize: 22 }}
                          />
                          <Box>
                            <Typography
                              sx={{
                                fontWeight: 600,
                                color: "rgb(33, 61, 112)",
                                fontSize: "0.85rem",
                              }}>
                              {attachment.filename}
                            </Typography>
                            <Typography
                              variant="caption"
                              sx={{ color: "#666", fontSize: "11px" }}>
                              Click VIEW to preview the file
                            </Typography>
                          </Box>
                        </Box>
                        <IconButton
                          size="small"
                          onClick={() => handleViewAttachment(attachment)}
                          sx={{
                            border: "1px solid #1976d2",
                            color: "#1976d2",
                            borderRadius: 1,
                            px: 1.5,
                            gap: 0.5,
                            "&:hover": { backgroundColor: "#e3f2fd" },
                          }}>
                          <VisibilityIcon fontSize="small" />
                          <Typography
                            variant="caption"
                            sx={{ fontWeight: 600 }}>
                            VIEW
                          </Typography>
                        </IconButton>
                      </Box>
                    ))}
                  </Box>
                ) : (
                  <Box
                    sx={{
                      border: "2px dashed #d1d5db",
                      borderRadius: 2,
                      p: 3,
                      textAlign: "center",
                      backgroundColor: "#fafafa",
                    }}>
                    <AttachFileIcon
                      sx={{ color: "#bbb", fontSize: 32, mb: 0.5 }}
                    />
                    <Typography
                      sx={{
                        color: "#9ca3af",
                        fontSize: "14px",
                        fontWeight: 500,
                      }}>
                      No supporting documents attached
                    </Typography>
                  </Box>
                )}
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
                    {submission?.status === "RECEIVED"
                      ? "This submission has already been received"
                      : submission?.status === "RETURNED"
                        ? "This submission has been returned"
                        : "This submission has already been approved"}
                  </Typography>
                </Box>
              )}
            </>
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
          {!isDialogLoading && submission && !isProcessed && (
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
                  "&:hover": { backgroundColor: "#c82333" },
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
                  "&:hover": { backgroundColor: "#218838" },
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
            {selectedAttachment?.filename || "Attachment"}
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
                style={{ border: "none", borderRadius: "0 0 8px 8px" }}
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
                  {selectedAttachment?.filename}
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
    if (reasonError) setReasonError("");
  };

  const getConfirmationTitle = () => {
    if (!action) return "Confirmation";
    return action === "receive" ? "Confirm Receive" : "Confirm Return";
  };

  const getConfirmationMessage = () => {
    if (!action || !submission) return "";
    return action === "receive"
      ? "Are you sure you want to receive this manpower form?"
      : "Are you sure you want to return this manpower form?";
  };

  const getConfirmButtonText = () => {
    if (!action) return "Confirm";
    return action === "receive" ? "RECEIVE" : "RETURN";
  };

  const getSubmissionDisplayName = () =>
    submission?.form?.name || "Manpower Requisition Form";

  const getSubmissionId = () => submission?.id || "N/A";

  const canConfirmReturn = action === "return" ? reason.trim() : true;
  const shouldShowReasonField = action === "return";

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
                  "& fieldset": { borderColor: "#d32f2f" },
                },
              },
              "& .MuiFormHelperText-root.Mui-error": { color: "#d32f2f" },
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

const ReceivingDialog = {
  SubmissionDialog,
  ConfirmationDialog,
};

export default ReceivingDialog;
