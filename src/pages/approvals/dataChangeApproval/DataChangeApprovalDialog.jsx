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
  Box,
  CircularProgress,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import CloseIcon from "@mui/icons-material/Close";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import HelpIcon from "@mui/icons-material/Help";
import { useGetDataChangeAttachmentQuery } from "../../../features/api/forms/datachangeApi";

const DataChangeApprovalDialog = ({
  open,
  onClose,
  approval,
  onApprove,
  onReject,
  isLoading = false,
}) => {
  const [comments, setComments] = useState("");
  const [reason, setReason] = useState("");
  const [actionType, setActionType] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [fileViewerOpen, setFileViewerOpen] = useState(false);
  const [fileUrl, setFileUrl] = useState(null);
  const [attachmentParams, setAttachmentParams] = useState(null);

  const {
    data: attachmentData,
    isLoading: isLoadingAttachment,
    error: attachmentError,
  } = useGetDataChangeAttachmentQuery(
    attachmentParams || { submissionId: null, attachmentId: null },
    {
      skip: !fileViewerOpen || !attachmentParams,
    }
  );

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
      onReject({ reason: reason.trim(), comments });
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

  const handleFileViewerOpen = (attachmentId) => {
    const submissionData = approval?.submission || approval;
    const formSubmissionId = submissionData?.id;

    if (formSubmissionId && attachmentId) {
      setAttachmentParams({
        submissionId: formSubmissionId,
        attachmentId: attachmentId,
      });
      setFileViewerOpen(true);
    }
  };

  const handleFileViewerClose = () => {
    setFileViewerOpen(false);
    setFileUrl(null);
    setTimeout(() => {
      setAttachmentParams(null);
    }, 100);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatCurrency = (amount) => {
    if (!amount) return "N/A";
    return `₱${parseFloat(amount).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const getCurrentAttachmentFilename = () => {
    if (!attachmentParams) return "attachment.pdf";
    const submissionData = approval?.submission || approval;
    const attachments = submissionData?.form_details?.attachments || [];
    const currentAttachment = attachments.find(
      (att) => att.id === attachmentParams.attachmentId
    );
    return currentAttachment?.original_filename || "attachment.pdf";
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

  if (!approval) return null;

  const submission = approval.submission || {};
  const formDetails = submission.form_details || {};
  const fromPosition = formDetails.from_position || {};
  const toPosition = formDetails.to_position || {};
  const attachments = formDetails?.attachments || [];
  const status = approval?.status?.toLowerCase() || "pending";
  const isProcessed = status === "approved" || status === "rejected";
  const hasAttachments = attachments.length > 0;

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
                VIEW DATA CHANGE REQUEST
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
              Employee Information
            </Typography>

            <Box>
              <Box sx={{ display: "flex", gap: 6, mb: 1.5 }}>
                <Box sx={{ flex: 1, minHeight: "60px" }}>
                  <Typography
                    variant="caption"
                    sx={{
                      color: "rgb(33, 61, 112)",
                      fontSize: "11px",
                      fontWeight: 600,
                      display: "block",
                      mb: 0.5,
                    }}>
                    EMPLOYEE CODE
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: "#000000ff", fontSize: "13px" }}>
                    {formDetails.employee_code || "N/A"}
                  </Typography>
                </Box>
                <Box sx={{ flex: 1, minHeight: "60px" }}>
                  <Typography
                    variant="caption"
                    sx={{
                      color: "rgb(33, 61, 112)",
                      fontSize: "11px",
                      fontWeight: 600,
                      display: "block",
                      mb: 0.5,
                    }}>
                    EMPLOYEE NAME
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: "#000000ff", fontSize: "13px" }}>
                    {formDetails.employee_name || "N/A"}
                  </Typography>
                </Box>
                <Box sx={{ flex: 1, minHeight: "60px" }}>
                  <Typography
                    variant="caption"
                    sx={{
                      color: "rgb(33, 61, 112)",
                      fontSize: "11px",
                      fontWeight: 600,
                      display: "block",
                      mb: 0.5,
                    }}>
                    REFERENCE NUMBER
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: "#000000ff", fontSize: "13px" }}>
                    {formDetails.reference_number || "N/A"}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: "flex", gap: 6 }}>
                <Box sx={{ flex: 1, minHeight: "60px" }}>
                  <Typography
                    variant="caption"
                    sx={{
                      color: "rgb(33, 61, 112)",
                      fontSize: "11px",
                      fontWeight: 600,
                      display: "block",
                      mb: 0.5,
                    }}>
                    DEPARTMENT
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: "#000000ff", fontSize: "13px" }}>
                    {fromPosition.charging?.department_name || "N/A"}
                  </Typography>
                </Box>
                <Box sx={{ flex: 1, minHeight: "60px" }}>
                  <Typography
                    variant="caption"
                    sx={{
                      color: "rgb(33, 61, 112)",
                      fontSize: "11px",
                      fontWeight: 600,
                      display: "block",
                      mb: 0.5,
                    }}>
                    SUB UNIT
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: "#000000ff", fontSize: "13px" }}>
                    {fromPosition.charging?.sub_unit_name || "N/A"}
                  </Typography>
                </Box>
                <Box sx={{ flex: 1, minHeight: "60px" }}>
                  <Typography
                    variant="caption"
                    sx={{
                      color: "rgb(33, 61, 112)",
                      fontSize: "11px",
                      fontWeight: 600,
                      display: "block",
                      mb: 0.5,
                    }}>
                    SCHEDULE
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: "#000000ff", fontSize: "13px" }}>
                    {fromPosition.schedule?.name || "N/A"}
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
                mb: 2,
                fontSize: "14px",
              }}>
              Movement Details
            </Typography>

            <Box>
              <Box sx={{ display: "flex", gap: 6, mb: 1.5 }}>
                <Box sx={{ flex: 1, minHeight: "60px" }}>
                  <Typography
                    variant="caption"
                    sx={{
                      color: "rgb(33, 61, 112)",
                      fontSize: "11px",
                      fontWeight: 600,
                      display: "block",
                      mb: 0.5,
                    }}>
                    MOVEMENT TYPE
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: "#000000ff", fontSize: "13px" }}>
                    {formDetails.movement_type || "N/A"}
                  </Typography>
                </Box>
                <Box sx={{ flex: 1, minHeight: "60px" }}>
                  <Typography
                    variant="caption"
                    sx={{
                      color: "rgb(33, 61, 112)",
                      fontSize: "11px",
                      fontWeight: 600,
                      display: "block",
                      mb: 0.5,
                    }}>
                    EFFECTIVE DATE
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: "#000000ff", fontSize: "13px" }}>
                    {formatDate(formDetails.effective_date)}
                  </Typography>
                </Box>
                <Box sx={{ flex: 1, minHeight: "60px" }}>
                  <Typography
                    variant="caption"
                    sx={{
                      color: "rgb(33, 61, 112)",
                      fontSize: "11px",
                      fontWeight: 600,
                      display: "block",
                      mb: 0.5,
                    }}>
                    REQUESTED BY
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: "#000000ff", fontSize: "13px" }}>
                    {submission.requested_by || "N/A"}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: "flex", gap: 6, mb: 1.5 }}>
                <Box sx={{ flex: 1, minHeight: "60px" }}>
                  <Typography
                    variant="caption"
                    sx={{
                      color: "rgb(33, 61, 112)",
                      fontSize: "11px",
                      fontWeight: 600,
                      display: "block",
                      mb: 0.5,
                    }}>
                    FROM POSITION
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: "#000000ff", fontSize: "13px" }}>
                    {fromPosition.title?.name || "N/A"}
                  </Typography>
                </Box>
                <Box sx={{ flex: 1, minHeight: "60px" }}>
                  <Typography
                    variant="caption"
                    sx={{
                      color: "rgb(33, 61, 112)",
                      fontSize: "11px",
                      fontWeight: 600,
                      display: "block",
                      mb: 0.5,
                    }}>
                    TO POSITION
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: "#000000ff", fontSize: "13px" }}>
                    {toPosition.title?.name || "N/A"}
                  </Typography>
                </Box>
                <Box sx={{ flex: 1, minHeight: "60px" }}>
                  <Typography
                    variant="caption"
                    sx={{
                      color: "rgb(33, 61, 112)",
                      fontSize: "11px",
                      fontWeight: 600,
                      display: "block",
                      mb: 0.5,
                    }}>
                    PAY FREQUENCY
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: "#000000ff", fontSize: "13px" }}>
                    {toPosition.pay_frequency || "N/A"}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: "flex", gap: 6 }}>
                <Box sx={{ flex: 1, minHeight: "60px" }}>
                  <Typography
                    variant="caption"
                    sx={{
                      color: "rgb(33, 61, 112)",
                      fontSize: "11px",
                      fontWeight: 600,
                      display: "block",
                      mb: 0.5,
                    }}>
                    FROM JOB RATE
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: "#000000ff", fontSize: "13px" }}>
                    {formatCurrency(formDetails.from_job_rate)}
                  </Typography>
                </Box>
                <Box sx={{ flex: 1, minHeight: "60px" }}>
                  <Typography
                    variant="caption"
                    sx={{
                      color: "rgb(33, 61, 112)",
                      fontSize: "11px",
                      fontWeight: 600,
                      display: "block",
                      mb: 0.5,
                    }}>
                    TO JOB RATE
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: "#000000ff", fontSize: "13px" }}>
                    {formatCurrency(formDetails.to_job_rate)}
                  </Typography>
                </Box>
                <Box sx={{ flex: 1, minHeight: "60px" }} />
              </Box>
            </Box>
          </Box>

          {hasAttachments && (
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
                Supporting Documents ({attachments.length})
              </Typography>

              <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                {attachments.map((attachment) => (
                  <Box
                    key={attachment.id}
                    sx={{
                      border: "2px dashed #d1d5db",
                      borderRadius: 2,
                      p: 2.5,
                      textAlign: "center",
                      backgroundColor: "#ffffff",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                      "&:hover": {
                        backgroundColor: "#f8f9fa",
                        borderColor: "#007bff",
                      },
                    }}
                    onClick={() => handleFileViewerOpen(attachment.id)}>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 1,
                      }}>
                      <AttachFileIcon sx={{ color: "#007bff", fontSize: 24 }} />
                      <Typography
                        sx={{
                          color: "#007bff",
                          fontSize: "14px",
                          fontWeight: 500,
                          textDecoration: "underline",
                          cursor: "pointer",
                        }}>
                        {attachment.original_filename}
                      </Typography>
                    </Box>
                    <Typography
                      variant="caption"
                      sx={{
                        color: "#666",
                        fontSize: "11px",
                        display: "block",
                        mt: 0.5,
                      }}>
                      Click to view file
                    </Typography>
                  </Box>
                ))}
              </Box>
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
                This data change request has already been {status}
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
            {confirmAction === "approve"
              ? "Confirm Approval"
              : "Confirm Rejection"}
          </Typography>
        </DialogTitle>

        <DialogContent sx={{ textAlign: "center", px: 3 }}>
          <Typography
            variant="body1"
            gutterBottom
            sx={{ fontSize: "14px", mb: 2 }}>
            {confirmAction === "approve"
              ? "Are you sure you want to Approve this data change request?"
              : "Are you sure you want to Reject this data change request?"}
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ fontSize: "13px", mb: 3 }}>
            Data Change Request ID: {approval?.id || "N/A"}
          </Typography>

          {confirmAction === "reject" && (
            <TextField
              label="Reason for Rejection"
              placeholder="Please provide a reason for rejecting this request..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              multiline
              rows={3}
              fullWidth
              required
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
                isLoading || (confirmAction === "reject" && !reason.trim())
              }>
              {isLoading ? (
                <CircularProgress size={20} color="inherit" />
              ) : confirmAction === "approve" ? (
                "APPROVE"
              ) : (
                "REJECT"
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
            Attachment - {getCurrentAttachmentFilename()}
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
                  {getCurrentAttachmentFilename()}
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

export default DataChangeApprovalDialog;
