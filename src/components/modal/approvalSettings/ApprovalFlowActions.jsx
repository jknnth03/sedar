import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  IconButton,
  Box,
  Divider,
  CircularProgress,
  Chip,
  Alert,
  Tooltip,
} from "@mui/material";
import {
  Close as CloseIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  AccountTree as FlowIcon,
  Lock as LockIcon,
} from "@mui/icons-material";
import dayjs from "dayjs";

const ApprovalFlowActions = ({
  open,
  onClose,
  currentMode,
  onModeChange,
  onSubmit,
  isLoading,
  isFlowInUse,
  selectedEntry,
  isCreate,
  approverSequence,
  isUsersLoading,
  handleSubmit,
  children,
}) => {
  const getModalTitle = () => {
    switch (currentMode) {
      case "create":
        return "Create New Approval Flow";
      case "view":
        return "VIEW APPROVAL FLOW";
      case "edit":
        return "EDIT APPROVAL FLOW";
      default:
        return "Approval Flow";
    }
  };

  const isReadOnly = currentMode === "view" || isFlowInUse;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          minHeight: "70vh",
          maxHeight: "90vh",
          width: "1000px",
          maxWidth: "1000px",
        },
      }}>
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          pb: 2,
          backgroundColor: "#f8f9fa",
        }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <FlowIcon sx={{ color: "rgb(33, 61, 112)" }} />
          <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
            {getModalTitle()}
          </Typography>
          {isFlowInUse && (
            <Chip
              icon={<LockIcon />}
              label="In Use"
              size="small"
              sx={{
                backgroundColor: "#ff5722",
                color: "white",
                fontWeight: 600,
                ml: 1,
              }}
            />
          )}
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {currentMode === "view" && (
            <Tooltip title="Click here to edit Flow" arrow>
              <span>
                <IconButton
                  onClick={() => onModeChange("edit")}
                  disabled={isFlowInUse}
                  size="small"
                  sx={{
                    border: "1px solid",
                    borderColor: isFlowInUse ? "#ccc" : "green",
                    color: isFlowInUse ? "#ccc" : "green",
                    backgroundColor: "white",
                    "&:hover": {
                      backgroundColor: isFlowInUse
                        ? "white"
                        : "rgba(0,128,0,0.04)",
                    },
                  }}>
                  <EditIcon />
                </IconButton>
              </span>
            </Tooltip>
          )}
          <Tooltip title="Click here to close" arrow>
            <IconButton
              onClick={onClose}
              size="small"
              sx={{
                border: "1px solid red",
                color: "red",
                backgroundColor: "white",
                "&:hover": {
                  backgroundColor: "rgba(255,0,0,0.04)",
                },
              }}>
              <CloseIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </DialogTitle>

      <Divider />

      <DialogContent sx={{ pt: 2 }}>
        {!isCreate && selectedEntry && (
          <Box sx={{ mb: 2, p: 1, bgcolor: "grey.50", borderRadius: 1 }}>
            {selectedEntry.updated_at && (
              <Typography variant="body2" color="text.secondary">
                Last Updated:{" "}
                {dayjs(selectedEntry.updated_at).format("MMM DD, YYYY HH:mm")}
              </Typography>
            )}
          </Box>
        )}

        {children}
      </DialogContent>

      <Divider />

      <DialogActions sx={{ px: 3, py: 2 }}>
        {!isReadOnly && (
          <Button
            onClick={handleSubmit(onSubmit)}
            variant="contained"
            color="primary"
            disabled={
              isLoading ||
              approverSequence.length === 0 ||
              isUsersLoading ||
              isFlowInUse
            }
            startIcon={
              isLoading ? <CircularProgress size={16} /> : <SaveIcon />
            }
            sx={{
              backgroundColor: isFlowInUse ? "#ccc" : "rgb(33, 61, 112)",
              "&:hover": {
                backgroundColor: isFlowInUse ? "#ccc" : "rgb(25, 45, 85)",
              },
              textTransform: "none",
            }}>
            {isLoading
              ? "Saving..."
              : currentMode === "create"
              ? "CREATE FLOW"
              : "SAVE CHANGES"}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default ApprovalFlowActions;
