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
} from "@mui/material";

const ConfirmationDialog = ({
  open,
  onClose,
  onConfirm,
  isLoading = false,
  action = "",
  itemName = "",
}) => {
  const getActionText = () => {
    switch (action) {
      case "update":
        return "Update";
      case "resubmit":
        return "Resubmit";
      case "cancel":
        return "Cancel";
      default:
        return "";
    }
  };

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
              backgroundColor: "#ff6b35",
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
              ?
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
          Are you sure you want to <strong>{getActionText()}</strong> this
          Manpower Requisition Form?
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
            }}>
            {itemName}
          </Typography>
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
          disabled={isLoading}>
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
