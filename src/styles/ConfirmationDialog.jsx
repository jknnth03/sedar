import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  CircularProgress,
  TextField,
} from "@mui/material";
import { useCancelFormSubmissionMutation } from "../features/api/approvalsetting/formSubmissionApi";
import { useSnackbar } from "notistack";

const ConfirmationDialog = ({
  open,
  onClose,
  onConfirm,
  isLoading = false,
  action = "",
  itemName = "",
  itemId = null,
  module = "Manpower Requisition Form",
  showRemarks = false,
  remarks = "",
  onRemarksChange = () => {},
  remarksRequired = false,
  remarksLabel = "Remarks (Optional)",
  remarksPlaceholder = "Add any additional remarks...",
  remarksMinLength = 0,
  onSuccess = () => {},
}) => {
  const { enqueueSnackbar } = useSnackbar();
  const [cancelFormSubmission, { isLoading: isCancelling }] =
    useCancelFormSubmissionMutation();
  const [remarksError, setRemarksError] = useState("");

  const getActionConfig = () => {
    switch (action) {
      case "approve":
        return { text: "Approve", icon: "?", iconColor: "#ff6b35" };
      case "reject":
        return { text: "Reject", icon: "?", iconColor: "#ff6b35" };
      case "update":
        return { text: "Update", icon: "?", iconColor: "#ff6b35" };
      case "resubmit":
        return { text: "Resubmit", icon: "?", iconColor: "#ff6b35" };
      case "cancel":
        return { text: "Cancel", icon: "?", iconColor: "#ff6b35" };
      case "delete":
        return { text: "Delete", icon: "?", iconColor: "#ff6b35" };
      case "submit":
        return { text: "Submit", icon: "?", iconColor: "#ff6b35" };
      case "draft":
        return { text: "Save as Draft", icon: "?", iconColor: "#ff6b35" };
      case "create":
        return { text: "Create", icon: "?", iconColor: "#ff6b35" };
      default:
        return { text: "proceed with", icon: "?", iconColor: "#ff6b35" };
    }
  };

  const actionConfig = getActionConfig();
  const hasRemarksError =
    remarksRequired && (!remarks || remarks.trim().length < remarksMinLength);

  const handleRemarksChange = (value) => {
    if (onRemarksChange) {
      onRemarksChange(value);
    }
    if (remarksError) {
      setRemarksError("");
    }
  };

  const handleClose = () => {
    if (!isLoading && !isCancelling) {
      setRemarksError("");
      onClose();
    }
  };

  const handleConfirm = async () => {
    if (
      remarksRequired &&
      (!remarks || remarks.trim().length < remarksMinLength)
    ) {
      setRemarksError(
        remarksMinLength > 0
          ? `Remarks must be at least ${remarksMinLength} characters`
          : "Remarks are required"
      );
      return;
    }

    try {
      if (action === "cancel" && itemId) {
        await cancelFormSubmission({
          id: itemId,
          reason: remarks.trim(),
        }).unwrap();

        enqueueSnackbar("Request cancelled successfully!", {
          variant: "success",
          autoHideDuration: 2000,
        });

        if (onSuccess && typeof onSuccess === "function") {
          await onSuccess();
        }

        handleClose();
      } else if (onConfirm && typeof onConfirm === "function") {
        await onConfirm();
      } else if (onSuccess && typeof onSuccess === "function") {
        await onSuccess();
      }
    } catch (error) {
      const errorMessage =
        error?.data?.message || "Failed to process request. Please try again.";
      enqueueSnackbar(errorMessage, {
        variant: "error",
        autoHideDuration: 2000,
      });
    }
  };

  const isProcessing = isLoading || isCancelling;

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          padding: 2,
          boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
          textAlign: "center",
        },
      }}>
      <DialogTitle sx={{ padding: 0, marginBottom: 2 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            marginBottom: 2,
          }}>
          <Box
            sx={{
              width: 60,
              height: 60,
              borderRadius: "50%",
              backgroundColor: actionConfig.iconColor,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}>
            <Typography
              sx={{
                color: "white",
                fontSize: "30px",
                fontWeight: "normal",
              }}>
              {actionConfig.icon}
            </Typography>
          </Box>
        </Box>
        <Typography
          variant="h5"
          sx={{
            fontWeight: 600,
            color: "rgb(25, 45, 84)",
            marginBottom: 0,
          }}>
          Confirmation
        </Typography>
      </DialogTitle>
      <DialogContent sx={{ padding: 0, textAlign: "center" }}>
        <Typography
          variant="body1"
          sx={{
            marginBottom: 2,
            fontSize: "16px",
            color: "#333",
            fontWeight: 400,
          }}>
          Are you sure you want to <b>{actionConfig.text.toLowerCase()}</b> this{" "}
          {module}?
        </Typography>
        {itemName && (
          <Typography
            variant="body2"
            sx={{
              fontSize: "14px",
              color: "#666",
              fontWeight: 500,
              textTransform: "uppercase",
              letterSpacing: "0.5px",
              marginBottom: showRemarks ? 2 : 0,
            }}>
            {itemName}
          </Typography>
        )}
        {showRemarks && (
          <TextField
            fullWidth
            multiline
            rows={3}
            label={remarksLabel}
            placeholder={remarksPlaceholder}
            value={remarks}
            onChange={(e) => handleRemarksChange(e.target.value)}
            required={remarksRequired}
            error={!!remarksError || hasRemarksError}
            helperText={
              remarksError ||
              (hasRemarksError && remarksMinLength > 0
                ? `Remarks must be at least ${remarksMinLength} characters`
                : hasRemarksError
                ? "Remarks are required"
                : `${remarks.length} characters`)
            }
            disabled={isProcessing}
            sx={{
              marginTop: 2,
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
              },
            }}
          />
        )}
      </DialogContent>
      <DialogActions
        sx={{
          justifyContent: "center",
          padding: 0,
          marginTop: 3,
          gap: 2,
        }}>
        <Button
          onClick={handleClose}
          variant="outlined"
          sx={{
            textTransform: "uppercase",
            fontWeight: 600,
            borderColor: "#f44336",
            color: "#f44336",
            paddingX: 3,
            paddingY: 1,
            borderRadius: 2,
            "&:hover": {
              borderColor: "#d32f2f",
              backgroundColor: "rgba(244, 67, 54, 0.04)",
            },
          }}
          disabled={isProcessing}>
          CANCEL
        </Button>
        <Button
          onClick={handleConfirm}
          variant="contained"
          sx={{
            textTransform: "uppercase",
            fontWeight: 600,
            backgroundColor: "#4caf50",
            paddingX: 3,
            paddingY: 1,
            borderRadius: 2,
            "&:hover": {
              backgroundColor: "#388e3c",
            },
          }}
          disabled={isProcessing || hasRemarksError}>
          {isProcessing ? (
            <CircularProgress size={20} color="inherit" />
          ) : (
            "CONFIRM"
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmationDialog;
