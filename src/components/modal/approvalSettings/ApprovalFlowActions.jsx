import React, { useState, useEffect } from "react";
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
  Add as AddIcon,
  AccountTree as FlowIcon,
  Lock as LockIcon,
} from "@mui/icons-material";
import EditOffIcon from "@mui/icons-material/EditOff";
import dayjs from "dayjs";

const ApprovalFlowActions = ({
  open,
  onClose,
  currentMode: propCurrentMode,
  onModeChange,
  onSubmit,
  isLoading,
  isFlowInUse,
  selectedEntry,
  isCreate,
  approverSequence,
  isUsersLoading,
  handleSubmit,
  reset,
  children,
}) => {
  const [currentMode, setCurrentMode] = useState(propCurrentMode);
  const [originalMode, setOriginalMode] = useState(propCurrentMode);

  useEffect(() => {
    if (open) {
      setCurrentMode(propCurrentMode);
      setOriginalMode(propCurrentMode);
    }
  }, [open, propCurrentMode]);

  const handleModeChange = (newMode) => {
    setCurrentMode(newMode);
    if (onModeChange) {
      onModeChange(newMode);
    }
  };

  const handleCancelEdit = () => {
    setCurrentMode(originalMode);
    if (onModeChange) {
      onModeChange(originalMode);
    }
    // Reset form data if reset function is provided
    if (reset && selectedEntry) {
      reset({
        name: selectedEntry.name || "",
        description: selectedEntry.description || "",
        // Add other fields as needed
      });
    }
  };

  const handleClose = () => {
    // Reset mode states
    setCurrentMode(propCurrentMode);
    setOriginalMode(propCurrentMode);
    if (reset) {
      reset();
    }
    onClose();
  };

  const getModalTitle = () => {
    switch (currentMode) {
      case "create":
        return "CREATE APPROVAL FLOW";
      case "view":
        return "VIEW APPROVAL FLOW";
      case "edit":
        return "EDIT APPROVAL FLOW";
      default:
        return "Approval Flow";
    }
  };

  const isReadOnly = currentMode === "view" || isFlowInUse;
  const isViewMode = currentMode === "view";
  const isEditMode = currentMode === "edit";

  return (
    <Dialog
      open={open}
      onClose={handleClose}
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
          pb: 1,
          backgroundColor: "#fff",
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
          {isViewMode && !isFlowInUse && (
            <Tooltip title="EDIT FLOW" arrow placement="top">
              <IconButton
                onClick={() => handleModeChange("edit")}
                disabled={isLoading}
                size="small"
                sx={{
                  ml: 1,
                  padding: "8px",
                  "&:hover": {
                    backgroundColor: "rgba(0, 136, 32, 0.08)",
                    transform: "scale(1.1)",
                    transition: "all 0.2s ease-in-out",
                  },
                }}>
                <EditIcon
                  sx={{
                    fontSize: "20px",
                    "& path": {
                      fill: isLoading
                        ? "rgba(0, 0, 0, 0.26)"
                        : "rgba(0, 136, 32, 1)",
                    },
                  }}
                />
              </IconButton>
            </Tooltip>
          )}
          {isEditMode && originalMode === "view" && (
            <Tooltip title="CANCEL EDIT">
              <IconButton
                onClick={handleCancelEdit}
                disabled={isLoading}
                size="small"
                sx={{
                  ml: 1,
                  padding: "8px",
                  "&:hover": {
                    backgroundColor: "rgba(235, 0, 0, 0.08)",
                    transform: "scale(1.1)",
                    transition: "all 0.2s ease-in-out",
                  },
                }}>
                <EditOffIcon
                  sx={{
                    fontSize: "20px",
                    "& path": {
                      fill: "rgba(235, 0, 0, 1)",
                    },
                  }}
                />
              </IconButton>
            </Tooltip>
          )}
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <IconButton
            onClick={handleClose}
            sx={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              backgroundColor: "#fff",
              "&:hover": {
                backgroundColor: "#f5f5f5",
              },
              transition: "all 0.2s ease-in-out",
            }}>
            <CloseIcon
              sx={{
                fontSize: "18px",
                color: "#333",
              }}
            />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ backgroundColor: "#fff" }}>
        {!isCreate && selectedEntry && (
          <Box sx={{ p: 0.5, borderRadius: 1 }}>
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

      <DialogActions sx={{ px: 3, py: 2, backgroundColor: "#fff" }}>
        {!isReadOnly && (
          <Button
            onClick={handleSubmit(onSubmit)}
            variant="contained"
            disabled={
              isLoading ||
              approverSequence.length === 0 ||
              isUsersLoading ||
              isFlowInUse
            }
            startIcon={
              isLoading ? (
                <CircularProgress size={16} />
              ) : currentMode === "create" ? (
                <AddIcon />
              ) : (
                <EditIcon />
              )
            }
            sx={{
              backgroundColor: "#4CAF50 !important",
              color: "white !important",
              fontWeight: 600,
              textTransform: "uppercase",
              px: 3,
              py: 1,
              borderRadius: "8px",
              border: "none !important",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
              "&:hover": {
                backgroundColor: "#45a049 !important",
                border: "none !important",
              },
              "&:disabled": {
                backgroundColor: "#cccccc !important",
                color: "#666666 !important",
                border: "none !important",
              },
            }}>
            {isLoading
              ? "Saving..."
              : currentMode === "create"
              ? "Create"
              : "Update"}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default ApprovalFlowActions;
