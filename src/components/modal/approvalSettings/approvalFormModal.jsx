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
  Divider,
  CircularProgress,
  Tooltip,
} from "@mui/material";
import {
  Close as CloseIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Description as DescriptionIcon,
} from "@mui/icons-material";
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

  useEffect(() => {
    if (open) {
      setCurrentMode(mode);

      if (mode === "create") {
        // Reset form for create mode
        reset({
          name: "",
          code: "",
          slug: "",
          description: "",
        });
      } else if (selectedEntry && (mode === "view" || mode === "edit")) {
        // Populate form with existing data
        reset({
          name: selectedEntry.name || "",
          code: selectedEntry.code || "",
          slug: selectedEntry.slug || "",
          description: selectedEntry.description || "",
        });
      }
    }
  }, [open, mode, selectedEntry, reset]);

  const handleModeChange = (newMode) => {
    setCurrentMode(newMode);
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
    onClose();
  };

  const getModalTitle = () => {
    switch (currentMode) {
      case "create":
        return "Create New Form";
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

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            minHeight: "60vh",
            maxHeight: "90vh",
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
            <DescriptionIcon sx={{ color: "rgb(33, 61, 112)" }} />
            <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
              {getModalTitle()}
            </Typography>
            {/* Edit button - only show in view mode */}
            {currentMode === "view" && (
              <Button
                onClick={() => handleModeChange("edit")}
                variant="contained"
                startIcon={<EditIcon />}
                sx={{
                  backgroundColor: "#008000",
                  color: "white",
                  textTransform: "none",
                  fontWeight: 500,
                  fontSize: "0.875rem",
                  px: 4,
                  ml: 0,
                  "&:hover": {
                    backgroundColor: "#006600",
                  },
                }}>
                EDIT
              </Button>
            )}
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Tooltip title="Close">
              <IconButton
                onClick={handleClose}
                size="small"
                sx={{
                  width: 40,
                  height: 40,
                  color: "#d32f2f",
                  border: "1px solid rgba(211, 47, 47, 0.3)",
                  "&:hover": {
                    backgroundColor: "rgba(211, 47, 47, 0.04)",
                    border: "1px solid #d32f2f",
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

          <form onSubmit={handleSubmit(onSubmit)}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Grid
                  item
                  xs={12}
                  sm={4}
                  sx={{ minWidth: "850px", maxWidth: "850px" }}></Grid>
                <Controller
                  name="name"
                  control={control}
                  rules={{ required: "Form name is required" }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Form Name *"
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

              {/* Form Code and Slug */}
              <Grid item xs={12} md={6}>
                <Grid
                  item
                  xs={12}
                  sm={4}
                  sx={{ minWidth: "416px", maxWidth: "416px" }}></Grid>
                <Controller
                  name="code"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Form Code"
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

              <Grid item xs={12} md={6}>
                <Grid
                  item
                  xs={12}
                  sm={4}
                  sx={{ minWidth: "416px", maxWidth: "416px" }}></Grid>
                <Controller
                  name="slug"
                  control={control}
                  rules={{ required: "Slug is required" }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Slug *"
                      fullWidth
                      error={!!errors.slug}
                      helperText={errors.slug?.message}
                      disabled={isReadOnly}
                      sx={{
                        backgroundColor: isReadOnly ? "#f5f5f5" : "white",
                      }}
                    />
                  )}
                />
              </Grid>

              {/* Description */}
              <Grid item xs={12} md={6}>
                <Grid
                  item
                  xs={12}
                  sm={4}
                  sx={{ minWidth: "850px", maxWidth: "850px" }}></Grid>
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

        <Divider />

        <DialogActions sx={{ px: 3, py: 2 }}>
          {!isReadOnly && (
            <Button
              onClick={handleSubmit(onSubmit)}
              variant="outlined"
              disabled={isLoading}
              startIcon={
                isLoading ? <CircularProgress size={16} /> : <SaveIcon />
              }
              sx={{
                borderColor: "#008000",
                color: "#008000",
                "&:hover": {
                  backgroundColor: "rgba(0, 82, 37, 0.04)",
                  borderColor: "#008000",
                },
                "&:disabled": {
                  borderColor: "rgba(33, 61, 112, 0.3)",
                  color: "rgba(33, 61, 112, 0.3)",
                },
              }}>
              {isLoading
                ? "Saving..."
                : currentMode === "create"
                ? "Create"
                : "update"}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
};

FormModal.displayName = "FormModal";

export default FormModal;
