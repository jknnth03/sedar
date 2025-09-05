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
import HelpIcon from "@mui/icons-material/Help";
import PersonIcon from "@mui/icons-material/Person";
import BasicInfoSection from "./BasicInfoSection";

const RegistrationApprovalDialog = ({
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

  const isReasonRequired = actionType === "reject";
  const canProceed =
    actionType === "approve" || (actionType === "reject" && comments.trim());

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
      submissionData.form_details?.general_info?.full_name ||
      "Employee Registration"
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

  if (!submission) return null;

  const submissionData = submission.submission || submission;
  const status = submission?.status?.toLowerCase() || "pending";
  const isProcessed = status === "approved" || status === "rejected";

  return (
    <>
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="lg"
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
              <PersonIcon sx={{ color: "rgb(33, 61, 112)" }} />
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 600,
                  color: "rgb(33, 61, 112)",
                  fontSize: "16px",
                }}>
                VIEW EMPLOYEE REGISTRATION
              </Typography>
            </Box>
            <IconButton onClick={handleClose} size="small">
              <CloseIcon sx={{ color: "rgb(33, 61, 112)" }} />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent>
          <BasicInfoSection submissionData={submissionData} />

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
    </>
  );
};

export default RegistrationApprovalDialog;
