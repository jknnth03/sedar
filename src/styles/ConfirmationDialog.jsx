import React from "react";
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

const ConfirmationDialog = ({
  open,
  onClose,
  onConfirm,
  isLoading = false,
  action = "",
  itemName = "",
  module = "Manpower Requisition Form",
  showRemarks = false,
  remarks = "",
  onRemarksChange = () => {},
  remarksRequired = false,
  remarksLabel = "Remarks (Optional)",
  remarksPlaceholder = "Add any additional remarks...",
}) => {
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
  const hasRemarksError = remarksRequired && !remarks.trim();

  return (
    <Dialog
      open={open}
      onClose={onClose}
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
            onChange={(e) => onRemarksChange(e.target.value)}
            required={remarksRequired}
            error={hasRemarksError}
            helperText={
              hasRemarksError ? "Remarks are required for rejection" : ""
            }
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
          onClick={onClose}
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
          disabled={isLoading}>
          CANCEL
        </Button>
        <Button
          onClick={onConfirm}
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
          disabled={isLoading || hasRemarksError}>
          {isLoading ? (
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
