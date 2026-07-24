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
  CircularProgress,
  Box,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import CloseIcon from "@mui/icons-material/Close";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import VisibilityIcon from "@mui/icons-material/Visibility";
import HelpIcon from "@mui/icons-material/Help";
import { useGetMrfAttachmentByIdQuery } from "../../../features/api/forms/mrfApi";

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
  const [selectedAttachment, setSelectedAttachment] = useState(null);
  const [fetchAttachment, setFetchAttachment] = useState(false);

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

  const handleViewAttachment = (attachment) => {
    const submissionId = submission?.submission?.id || submission?.id;
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

  const getConfirmationTitle = () =>
    confirmAction === "approve" ? "Confirm Approval" : "Confirm Rejection";

  const getConfirmationMessage = () =>
    confirmAction === "approve"
      ? "Are you sure you want to Approve this request?"
      : "Are you sure you want to Reject this request?";

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

  const getConfirmButtonText = () =>
    confirmAction === "approve" ? "APPROVE" : "REJECT";

  const canConfirmReject = confirmAction === "reject" ? reason.trim() : true;

  if (!submission) return null;

  const submissionData = submission.submission || submission;
  const status = submission?.status?.toLowerCase() || "pending";
  const isProcessed = status === "approved" || status === "rejected";
  const attachments = submissionData?.form_details?.attachments || [];

  const getPosition = () =>
    submissionData?.form_details?.position?.title?.name || "N/A";
  const getJobLevel = () =>
    submissionData?.form_details?.job_level?.name || "N/A";
  const getExpectedSalary = () => {
    const salary = submissionData?.form_details?.expected_salary;
    return salary ? `₱${parseFloat(salary).toLocaleString()}` : "N/A";
  };
  const getRequisitionType = () =>
    submissionData?.form_details?.requisition_type?.name || "N/A";
  const getEmployeeToBeReplaced = () => {
    const replacementInfo = submissionData?.form_details?.replacement_info;
    if (replacementInfo?.name) return replacementInfo.name;

    const legacyReplacement =
      submissionData?.form_details?.employee_to_be_replaced;
    return legacyReplacement?.full_name || "N/A";
  };
  const getJustification = () =>
    submissionData?.form_details?.justification || "N/A";
  const getRemarks = () => submissionData?.form_details?.remarks || "N/A";

  return (
    <>
      {/* Main Dialog */}
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
            <IconButton onClick={handleClose} size="small">
              <CloseIcon sx={{ color: "rgb(33, 61, 112)" }} />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent>
          {/* Request Information */}
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
                { label: "FORM TYPE", value: "Manpower Requisition Form" },
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

          {/* Justification & Remarks */}
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
                    sx={{ color: "#000", fontSize: "13px", lineHeight: 1.4 }}>
                    {value}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>

          {/* Supporting Documents */}
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
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
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
                      sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                      <AttachFileIcon sx={{ color: "#1976d2", fontSize: 22 }} />
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
                      <Typography variant="caption" sx={{ fontWeight: 600 }}>
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
                <AttachFileIcon sx={{ color: "#bbb", fontSize: 32, mb: 0.5 }} />
                <Typography
                  sx={{ color: "#9ca3af", fontSize: "14px", fontWeight: 500 }}>
                  No supporting documents attached
                </Typography>
              </Box>
            )}
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
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
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
          sx={{ px: 4.4, pb: 2, pt: 2, justifyContent: "flex-end", gap: 2 }}>
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
                  "&:hover": { backgroundColor: "#c82333" },
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
                  "&:hover": { backgroundColor: "#218838" },
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

      {/* Confirm Dialog */}
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
              label="Reason for Rejection"
              placeholder="Please provide a reason for rejecting this form..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              multiline
              rows={3}
              fullWidth
              variant="outlined"
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
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

      {/* File Viewer Dialog */}
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

export default SubmissionDetailsDialog;
