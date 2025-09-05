import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  IconButton,
  CircularProgress,
  Divider,
  Chip,
  Fade,
  InputAdornment,
  MenuItem,
  FormControl,
  Select,
  InputLabel,
  FormHelperText,
} from "@mui/material";
import {
  Close as CloseIcon,
  Person as PersonIcon,
  Save as SaveIcon,
  Add as AddIcon,
  AccountCircle as AccountCircleIcon,
} from "@mui/icons-material";
import { useForm, Controller } from "react-hook-form";
import { useSnackbar } from "notistack";
import { useGetAllUsersQuery } from "../../../features/api/usermanagement/userApi";

const ReceiverModal = ({
  open,
  onClose,
  onSave,
  selectedEntry,
  isLoading = false,
  mode = "create",
}) => {
  const { enqueueSnackbar } = useSnackbar();
  const [localLoading, setLocalLoading] = useState(false);

  // Fetch users data
  const {
    data: usersData,
    isLoading: isUsersLoading,
    error: usersError,
  } = useGetAllUsersQuery();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isDirty, isValid },
  } = useForm({
    defaultValues: {
      user_id: "",
    },
    mode: "onChange",
  });

  // Reset form when modal opens/closes or selectedEntry changes
  useEffect(() => {
    if (open) {
      if (selectedEntry && mode === "view") {
        // Fixed: Use the receiver's ID directly since the selectedEntry IS the user/receiver
        const userId = selectedEntry.id || "";
        console.log(
          "Setting user_id for view mode:",
          userId,
          "from selectedEntry:",
          selectedEntry
        );
        reset({
          user_id: userId.toString(), // Convert to string to match select value type
        });
      } else {
        reset({
          user_id: "",
        });
      }
    }
  }, [open, selectedEntry, mode, reset]);

  const handleClose = () => {
    if (!isLoading && !localLoading) {
      reset();
      onClose();
    }
  };

  const onSubmit = async (data) => {
    setLocalLoading(true);
    try {
      await onSave(data, mode);
    } catch (error) {
      enqueueSnackbar("Failed to save receiver. Please try again.", {
        variant: "error",
        autoHideDuration: 3000,
      });
    } finally {
      setLocalLoading(false);
    }
  };

  const renderStatusChip = () => {
    if (mode === "create") return null;

    const isActive = selectedEntry && !selectedEntry.deleted_at;
    return (
      <Chip
        label={isActive ? "ACTIVE" : "INACTIVE"}
        size="small"
        sx={{
          backgroundColor: isActive ? "#e8f5e8" : "#fff3e0",
          color: isActive ? "#2e7d32" : "#ed6c02",
          border: `1px solid ${isActive ? "#4caf50" : "#ff9800"}`,
          fontWeight: 600,
          fontSize: "11px",
          height: "24px",
          borderRadius: "12px",
        }}
      />
    );
  };

  const getModalTitle = () => {
    switch (mode) {
      case "create":
        return "Add New Receiver";
      case "view":
        return "Receiver Details";
      default:
        return "Receiver";
    }
  };

  const getModalIcon = () => {
    switch (mode) {
      case "create":
        return <AddIcon sx={{ color: "rgb(33, 61, 112)" }} />;
      case "view":
        return <PersonIcon sx={{ color: "rgb(33, 61, 112)" }} />;
      default:
        return <PersonIcon sx={{ color: "rgb(33, 61, 112)" }} />;
    }
  };

  const isReadOnly = mode === "view";
  const showSaveButton = mode === "create";
  const isFormLoading = isLoading || localLoading;

  // Handle users data loading and errors
  if (usersError) {
    enqueueSnackbar("Failed to load users. Please try again.", {
      variant: "error",
      autoHideDuration: 3000,
    });
  }

  // Fixed: Handle nested API response structure
  const users =
    usersData?.result?.data ||
    usersData?.result ||
    usersData?.data ||
    usersData ||
    [];

  // Debug logging
  useEffect(() => {
    if (mode === "view" && selectedEntry) {
      console.log("View mode - selectedEntry:", selectedEntry);
      console.log("Available users:", users);
      console.log("Selected user ID:", selectedEntry.id);
    }
  }, [mode, selectedEntry, users]);

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          minHeight: "300px",
          maxHeight: "90vh",
          overflow: "hidden",
        },
      }}
      disableEscapeKeyDown={isFormLoading}>
      <DialogTitle
        sx={{
          bgcolor: "#f8f9fa",
          borderBottom: "1px solid #e0e0e0",
          padding: "20px 24px",
          position: "relative",
        }}>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center" gap={2}>
            {getModalIcon()}
            <Typography
              variant="h5"
              fontWeight="bold"
              color="rgb(33, 61, 112)"
              sx={{ fontSize: "1.25rem" }}>
              {getModalTitle()}
            </Typography>
            {renderStatusChip()}
          </Box>
          <IconButton
            onClick={handleClose}
            disabled={isFormLoading}
            sx={{
              color: "#666",
              "&:hover": {
                backgroundColor: "rgba(0, 0, 0, 0.04)",
              },
              "&:disabled": {
                color: "#ccc",
              },
            }}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent
        sx={{
          padding: "24px",
          overflow: "auto",
          backgroundColor: "white",
        }}>
        <form onSubmit={handleSubmit(onSubmit)} style={{ paddingTop: "16px" }}>
          <Controller
            name="user_id"
            control={control}
            rules={{
              required: "Please select a user",
            }}
            render={({ field }) => (
              <FormControl
                fullWidth
                error={!!errors.user_id}
                disabled={isReadOnly || isFormLoading || isUsersLoading}>
                <InputLabel id="user-select-label">Select User</InputLabel>
                <Select
                  {...field}
                  labelId="user-select-label"
                  label="Select User"
                  sx={{
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#d0d0d0",
                    },
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                      borderColor: "rgb(33, 61, 112)",
                    },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      borderColor: "rgb(33, 61, 112)",
                    },
                  }}>
                  {isUsersLoading ? (
                    <MenuItem disabled>
                      <Box display="flex" alignItems="center" gap={1}>
                        <CircularProgress size={16} />
                        <Typography>Loading users...</Typography>
                      </Box>
                    </MenuItem>
                  ) : users?.length > 0 ? (
                    users.map((user) => (
                      <MenuItem key={user.id} value={user.id.toString()}>
                        <Box display="flex" alignItems="center" gap={2}>
                          <AccountCircleIcon sx={{ color: "#666" }} />
                          <Box>
                            <Typography variant="body2" fontWeight="medium">
                              {user.full_name}
                              {user.full_id_number
                                ? ` (${user.full_id_number})`
                                : ""}
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                              {user.username}
                            </Typography>
                          </Box>
                        </Box>
                      </MenuItem>
                    ))
                  ) : (
                    <MenuItem disabled>
                      <Typography color="textSecondary">
                        No users available
                      </Typography>
                    </MenuItem>
                  )}
                </Select>
                {errors.user_id && (
                  <FormHelperText>{errors.user_id.message}</FormHelperText>
                )}
              </FormControl>
            )}
          />
        </form>
      </DialogContent>

      <DialogActions
        sx={{
          padding: "16px 24px",
          borderTop: "1px solid #e0e0e0",
          backgroundColor: "#f8f9fa",
          gap: 1,
        }}>
        {showSaveButton && (
          <Fade in={!isFormLoading}>
            <Button
              type="submit"
              onClick={handleSubmit(onSubmit)}
              disabled={isFormLoading || isUsersLoading || !isValid}
              variant="contained"
              startIcon={
                isFormLoading ? (
                  <CircularProgress size={16} color="inherit" />
                ) : (
                  <SaveIcon />
                )
              }
              sx={{
                minWidth: 120,
                backgroundColor: "rgb(33, 61, 112)",
                "&:hover": {
                  backgroundColor: "rgb(25, 45, 84)",
                },
                "&:disabled": {
                  backgroundColor: "#ccc",
                },
              }}>
              {isFormLoading ? "Saving..." : "Create"}
            </Button>
          </Fade>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default ReceiverModal;
