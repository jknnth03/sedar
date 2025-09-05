import React, { useEffect, useState } from "react";
import { useFormContext, Controller } from "react-hook-form";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  IconButton,
  Box,
  Grid,
  TextField,
  CircularProgress,
  Tooltip,
} from "@mui/material";
import {
  Close as CloseIcon,
  Edit as EditIcon,
  Add as AddIcon,
  Description as DescriptionIcon,
} from "@mui/icons-material";
import EditOffIcon from "@mui/icons-material/EditOff";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";

const FormModal = ({
  open = false,
  onClose,
  onSave,
  selectedEntry = null,
  isLoading = false,
  mode = "create",
}) => {
  const {
    control,
    formState: { errors },
    setValue,
    watch,
    reset,
    handleSubmit,
    getValues,
  } = useFormContext();

  const [currentMode, setCurrentMode] = useState(mode);
  const [originalMode, setOriginalMode] = useState(mode);

  useEffect(() => {
    if (open) {
      setCurrentMode(mode);
      setOriginalMode(mode);

      if (mode === "create") {
        reset({
          name: "",
          code: "",
          description: "",
        });
      } else if (selectedEntry && (mode === "view" || mode === "edit")) {
        reset({
          name: selectedEntry.name || "",
          code: selectedEntry.code || "",
          description: selectedEntry.description || "",
        });
      }
    }
  }, [open, mode, selectedEntry, reset]);

  const handleModeChange = (newMode) => {
    setCurrentMode(newMode);
  };

  const handleCancelEdit = () => {
    setCurrentMode(originalMode);
    if (selectedEntry) {
      reset({
        name: selectedEntry.name || "",
        code: selectedEntry.code || "",
        description: selectedEntry.description || "",
      });
    }
  };

  const onSubmit = (data) => {
    console.log("Form submitted:", data);

    if (onSave) {
      onSave(data, currentMode);
    }
  };

  const handleClose = () => {
    reset();
    setCurrentMode(mode);
    setOriginalMode(mode);
    onClose();
  };

  const getModalTitle = () => {
    switch (currentMode) {
      case "create":
        return "CREATE NEW FORM";
      case "view":
        return "VIEW FORM";
      case "edit":
        return "EDIT FORM";
      default:
        return "Form";
    }
  };

  const isReadOnly = currentMode === "view";
  const isCreate = currentMode === "create";
  const isViewMode = currentMode === "view";
  const isEditMode = currentMode === "edit";

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Dialog
        open={open}
        onClose={handleClose}
        PaperProps={{
          sx: {
            height: "60vh",
            width: "100%",
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
            <DescriptionIcon sx={{ color: "rgb(33, 61, 112)" }} />
            <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
              {getModalTitle()}
            </Typography>
            {isViewMode && (
              <Tooltip title="EDIT EMPLOYEE" arrow placement="top">
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

        <DialogContent sx={{ backgroundColor: "#fff", pt: 2 }}>
          {!isCreate && selectedEntry && (
            <Box sx={{ mb: 1, p: 0.5, borderRadius: 1 }}>
              {selectedEntry.updated_at && (
                <Typography variant="body2" color="text.secondary">
                  Last Updated:{" "}
                  {dayjs(selectedEntry.updated_at).format("MMM DD, YYYY HH:mm")}
                </Typography>
              )}
            </Box>
          )}

          <form onSubmit={handleSubmit(onSubmit)}>
            <Grid container spacing={2} sx={{ paddingTop: 2 }}>
              <Grid item xs={12} md={6}>
                <Grid
                  item
                  xs={12}
                  sm={4}
                  sx={{ minWidth: "548px", maxWidth: "548px" }}></Grid>
                <Controller
                  name="name"
                  control={control}
                  rules={{ required: "Form name is required" }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label={
                        <span>
                          Form Name <span style={{ color: "red" }}>*</span>
                        </span>
                      }
                      fullWidth
                      error={!!errors.name}
                      helperText={errors.name?.message}
                      disabled={isReadOnly}
                      sx={{
                        backgroundColor: isReadOnly ? "#f5f5f5" : "white",
                      }}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <Grid
                  item
                  xs={12}
                  sm={4}
                  sx={{ minWidth: "548px", maxWidth: "548px" }}></Grid>
                <Controller
                  name="code"
                  control={control}
                  rules={{ required: "Form code is required" }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label={
                        <span>
                          Form Code <span style={{ color: "red" }}>*</span>
                        </span>
                      }
                      fullWidth
                      error={!!errors.code}
                      helperText={errors.code?.message}
                      disabled={isReadOnly}
                      sx={{
                        backgroundColor: isReadOnly ? "#f5f5f5" : "white",
                      }}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12}>
                <Grid
                  item
                  xs={12}
                  sm={4}
                  sx={{ minWidth: "548px", maxWidth: "548px" }}></Grid>
                <Controller
                  name="description"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Description"
                      fullWidth
                      multiline
                      rows={4}
                      error={!!errors.description}
                      helperText={errors.description?.message}
                      disabled={isReadOnly}
                      sx={{
                        backgroundColor: isReadOnly ? "#f5f5f5" : "white",
                      }}
                    />
                  )}
                />
              </Grid>
            </Grid>
          </form>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2, backgroundColor: "#fff" }}>
          {!isReadOnly && (
            <Button
              onClick={handleSubmit(onSubmit)}
              variant="contained"
              disabled={isLoading}
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
    </LocalizationProvider>
  );
};

FormModal.displayName = "FormModal";

export default FormModal;
