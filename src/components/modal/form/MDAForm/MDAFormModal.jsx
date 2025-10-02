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
  Autocomplete,
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
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";
import { useLazyGetMdaPrefillQuery } from "../../../../features/api/forms/mdaApi";

const MDAFormModal = ({
  open = false,
  onClose,
  onSave,
  selectedEntry = null,
  isLoading = false,
  mode = "create",
  employeeMovements = [],
  positions = [],
  submissionId = null,
}) => {
  const {
    control,
    formState: { errors },
    setValue,
    watch,
    reset,
    handleSubmit,
  } = useFormContext();

  const [currentMode, setCurrentMode] = useState(mode);
  const [originalMode, setOriginalMode] = useState(mode);
  const [selectedMovementId, setSelectedMovementId] = useState(null);

  const watchedMovementId = watch("employee_movement_id");

  const [
    triggerPrefill,
    { data: prefillData, isLoading: isPrefillLoading, refetch },
  ] = useLazyGetMdaPrefillQuery();

  useEffect(() => {
    if (open && currentMode === "create" && submissionId) {
      triggerPrefill(submissionId, false).then(() => {});
    }
  }, [open, currentMode, submissionId, triggerPrefill]);

  useEffect(() => {
    if (open) {
      setCurrentMode(mode);
      setOriginalMode(mode);

      if (mode === "create") {
        reset({
          form_id: 5,
          employee_movement_id: null,
          employee_id: "",
          employee_name: "",
          employee_number: "",
          effective_date: null,
          action_type: "",
          birth_date: null,
          birth_place: "",
          gender: "",
          nationality: "",
          address: "",
          tin_number: "",
          sss_number: "",
          pag_ibig_number: "",
          philhealth_number: "",
          to_position_id: null,
          to_position_title: "",
          to_job_level: "",
          to_basic_salary: "",
          to_training_allowance: "",
        });
      } else if (selectedEntry && (mode === "view" || mode === "edit")) {
        reset({
          form_id: selectedEntry.form_id || 5,
          employee_movement_id: selectedEntry.employee_movement_id || null,
          employee_id: selectedEntry.employee_id || "",
          employee_name: selectedEntry.employee_name || "",
          employee_number: selectedEntry.employee_number || "",
          effective_date: selectedEntry.effective_date
            ? dayjs(selectedEntry.effective_date)
            : null,
          action_type: selectedEntry.action_type || "",
          birth_date: selectedEntry.birth_date
            ? dayjs(selectedEntry.birth_date)
            : null,
          birth_place: selectedEntry.birth_place || "",
          gender: selectedEntry.gender || "",
          nationality: selectedEntry.nationality || "",
          address: selectedEntry.address || "",
          tin_number: selectedEntry.tin_number || "",
          sss_number: selectedEntry.sss_number || "",
          pag_ibig_number: selectedEntry.pag_ibig_number || "",
          philhealth_number: selectedEntry.philhealth_number || "",
          to_position_id: selectedEntry.to_position_id || null,
          to_position_title: selectedEntry.to_position_title || "",
          to_job_level: selectedEntry.to_job_level || "",
          to_basic_salary: selectedEntry.to_basic_salary || "",
          to_training_allowance: selectedEntry.to_training_allowance || "",
        });
      }
    }
  }, [open, mode, selectedEntry, reset]);

  useEffect(() => {
    if (prefillData?.result && currentMode === "create") {
      const data = prefillData.result;
      setValue("employee_movement_id", data.employee_movement_id || null);
      setValue("employee_id", data.employee_id || "");
      setValue("employee_name", data.employee_name || "");
      setValue("employee_number", data.employee_number || "");
      setValue(
        "effective_date",
        data.effective_date ? dayjs(data.effective_date) : null
      );
      setValue("action_type", data.movement_type || "");
      setValue("birth_date", data.birth_date ? dayjs(data.birth_date) : null);
      setValue("birth_place", data.birth_place || "");
      setValue("gender", data.gender || "");
      setValue("nationality", data.nationality || "");
      setValue("address", data.address || "");
      setValue("tin_number", data.tin_number || "");
      setValue("sss_number", data.sss_number || "");
      setValue("pag_ibig_number", data.pag_ibig_number || "");
      setValue("philhealth_number", data.philhealth_number || "");

      if (data.to) {
        setValue("to_position_id", data.to.position_id || null);
        setValue("to_position_title", data.to.position_title || "");
      }
    }
  }, [prefillData, currentMode, setValue]);

  const handleModeChange = (newMode) => {
    setCurrentMode(newMode);
  };

  const handleCancelEdit = () => {
    setCurrentMode(originalMode);
    if (selectedEntry) {
      reset({
        form_id: selectedEntry.form_id || 5,
        employee_movement_id: selectedEntry.employee_movement_id || null,
        employee_id: selectedEntry.employee_id || "",
        employee_name: selectedEntry.employee_name || "",
        employee_number: selectedEntry.employee_number || "",
        effective_date: selectedEntry.effective_date
          ? dayjs(selectedEntry.effective_date)
          : null,
        action_type: selectedEntry.action_type || "",
        birth_date: selectedEntry.birth_date
          ? dayjs(selectedEntry.birth_date)
          : null,
        birth_place: selectedEntry.birth_place || "",
        gender: selectedEntry.gender || "",
        nationality: selectedEntry.nationality || "",
        address: selectedEntry.address || "",
        tin_number: selectedEntry.tin_number || "",
        sss_number: selectedEntry.sss_number || "",
        pag_ibig_number: selectedEntry.pag_ibig_number || "",
        philhealth_number: selectedEntry.philhealth_number || "",
        to_position_id: selectedEntry.to_position_id || null,
        to_position_title: selectedEntry.to_position_title || "",
        to_job_level: selectedEntry.to_job_level || "",
        to_basic_salary: selectedEntry.to_basic_salary || "",
        to_training_allowance: selectedEntry.to_training_allowance || "",
      });
    }
  };

  const onSubmit = async (data) => {
    const formattedData = {
      ...data,
      effective_date: data.effective_date
        ? dayjs(data.effective_date).format("YYYY-MM-DD")
        : null,
      birth_date: data.birth_date
        ? dayjs(data.birth_date).format("YYYY-MM-DD")
        : null,
    };

    if (onSave) {
      await onSave(formattedData, currentMode);
      if (submissionId) {
        triggerPrefill(submissionId);
      }
    }
  };

  const handleClose = () => {
    reset();
    setCurrentMode(mode);
    setOriginalMode(mode);
    setSelectedMovementId(null);
    if (submissionId) {
      triggerPrefill(submissionId);
    }
    onClose();
  };

  const getModalTitle = () => {
    switch (currentMode) {
      case "create":
        return "CREATE MDA FORM";
      case "view":
        return "VIEW MDA FORM";
      case "edit":
        return "EDIT MDA FORM";
      default:
        return "MDA Form";
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
        maxWidth={false}
        PaperProps={{
          sx: {
            minHeight: "80vh",
            maxHeight: "90vh",
            width: "770px",
            maxWidth: "770px",
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
              <Tooltip title="EDIT MDA" arrow placement="top">
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
        </DialogTitle>

        <DialogContent sx={{ backgroundColor: "#ffffffff", pt: 2 }}>
          {!isCreate && selectedEntry && selectedEntry.updated_at && (
            <Box
              sx={{ mb: 2, p: 1, backgroundColor: "#e3f2fd", borderRadius: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Last Updated:{" "}
                {dayjs(selectedEntry.updated_at).format("MMM DD, YYYY HH:mm")}
              </Typography>
            </Box>
          )}

          <form onSubmit={handleSubmit(onSubmit)}>
            <Grid container spacing={2}>
              {isCreate && !submissionId && (
                <Grid item xs={12}>
                  <Typography
                    variant="h6"
                    sx={{
                      mb: 2,
                      fontWeight: 600,
                      color: "rgb(33, 61, 112)",
                    }}>
                    SELECT EMPLOYEE MOVEMENT
                  </Typography>
                  <Controller
                    name="employee_movement_id"
                    control={control}
                    rules={{ required: "Employee Movement is required" }}
                    render={({ field: { onChange, value, ...field } }) => (
                      <Autocomplete
                        {...field}
                        options={employeeMovements}
                        getOptionLabel={(option) =>
                          option.employee_name
                            ? `${option.employee_name} - ${
                                option.action_type || "N/A"
                              }`
                            : ""
                        }
                        value={
                          employeeMovements.find((m) => m.id === value) || null
                        }
                        onChange={(_, newValue) => {
                          onChange(newValue?.id || null);
                          setSelectedMovementId(newValue?.id || null);
                        }}
                        loading={isPrefillLoading}
                        disabled={isReadOnly}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Employee Movement *"
                            error={!!errors.employee_movement_id}
                            helperText={errors.employee_movement_id?.message}
                            InputProps={{
                              ...params.InputProps,
                              endAdornment: (
                                <>
                                  {isPrefillLoading ? (
                                    <CircularProgress size={20} />
                                  ) : null}
                                  {params.InputProps.endAdornment}
                                </>
                              ),
                            }}
                          />
                        )}
                      />
                    )}
                  />
                </Grid>
              )}

              <Grid item xs={12} sx={{ paddingTop: 3 }}>
                <Grid container spacing={1.6}>
                  <Grid
                    item
                    xs={12}
                    sm={4}
                    sx={{ minWidth: "346px", maxWidth: "346px" }}>
                    <Controller
                      name="employee_name"
                      control={control}
                      rules={{ required: "Employee name is required" }}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Employee Name *"
                          fullWidth
                          error={!!errors.employee_name}
                          helperText={errors.employee_name?.message}
                          disabled={isReadOnly || isCreate}
                        />
                      )}
                    />
                  </Grid>
                  <Grid
                    item
                    xs={12}
                    sm={4}
                    sx={{ minWidth: "346px", maxWidth: "346px" }}>
                    <Controller
                      name="employee_id"
                      control={control}
                      rules={{ required: "Employee name is required" }}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Employee ID #"
                          fullWidth
                          error={!!errors.employee_id}
                          helperText={errors.employee_id?.message}
                          disabled={isReadOnly || isCreate}
                        />
                      )}
                    />
                  </Grid>
                  <Grid
                    item
                    xs={12}
                    sm={4}
                    sx={{ minWidth: "346px", maxWidth: "346px" }}>
                    <Controller
                      name="employee_number"
                      control={control}
                      rules={{ required: "Employee number is required" }}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Employee Number *"
                          fullWidth
                          error={!!errors.employee_number}
                          helperText={errors.employee_number?.message}
                          disabled={isReadOnly || isCreate}
                        />
                      )}
                    />
                  </Grid>
                  <Grid
                    item
                    xs={12}
                    sm={4}
                    sx={{ minWidth: "346px", maxWidth: "346px" }}>
                    <Controller
                      name="effective_date"
                      control={control}
                      rules={{ required: "Effective date is required" }}
                      render={({ field }) => (
                        <DatePicker
                          {...field}
                          label="Effective Date *"
                          disabled={isReadOnly || isCreate}
                          slotProps={{
                            textField: {
                              fullWidth: true,
                              error: !!errors.effective_date,
                              helperText: errors.effective_date?.message,
                            },
                          }}
                        />
                      )}
                    />
                  </Grid>
                  <Grid
                    item
                    xs={12}
                    sm={4}
                    sx={{ minWidth: "346px", maxWidth: "346px" }}>
                    <Controller
                      name="action_type"
                      control={control}
                      rules={{ required: "Action type is required" }}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Action Type *"
                          fullWidth
                          error={!!errors.action_type}
                          helperText={errors.action_type?.message}
                          disabled={isReadOnly || isCreate}
                        />
                      )}
                    />
                  </Grid>
                  <Grid
                    item
                    xs={12}
                    sm={4}
                    sx={{ minWidth: "346px", maxWidth: "346px" }}>
                    <Controller
                      name="birth_date"
                      control={control}
                      render={({ field }) => (
                        <DatePicker
                          {...field}
                          label="Birth Date"
                          disabled={isReadOnly || isCreate}
                          slotProps={{
                            textField: {
                              fullWidth: true,
                              error: !!errors.birth_date,
                              helperText: errors.birth_date?.message,
                            },
                          }}
                        />
                      )}
                    />
                  </Grid>
                  <Grid
                    item
                    xs={12}
                    sm={4}
                    sx={{ minWidth: "346px", maxWidth: "346px" }}>
                    <Controller
                      name="birth_place"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Birth Place"
                          fullWidth
                          error={!!errors.birth_place}
                          helperText={errors.birth_place?.message}
                          disabled={isReadOnly || isCreate}
                        />
                      )}
                    />
                  </Grid>
                  <Grid
                    item
                    xs={12}
                    sm={4}
                    sx={{ minWidth: "346px", maxWidth: "346px" }}>
                    <Controller
                      name="gender"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Gender"
                          fullWidth
                          error={!!errors.gender}
                          helperText={errors.gender?.message}
                          disabled={isReadOnly || isCreate}
                        />
                      )}
                    />
                  </Grid>
                  <Grid
                    item
                    xs={12}
                    sm={4}
                    sx={{ minWidth: "346px", maxWidth: "346px" }}>
                    <Controller
                      name="nationality"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Nationality"
                          fullWidth
                          error={!!errors.nationality}
                          helperText={errors.nationality?.message}
                          disabled={isReadOnly || isCreate}
                        />
                      )}
                    />
                  </Grid>
                  <Grid
                    item
                    xs={12}
                    sm={4}
                    sx={{ minWidth: "704px", maxWidth: "704px" }}>
                    <Controller
                      name="address"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Address"
                          fullWidth
                          multiline
                          rows={2}
                          error={!!errors.address}
                          helperText={errors.address?.message}
                          disabled={isReadOnly || isCreate}
                        />
                      )}
                    />
                  </Grid>
                  <Grid
                    item
                    xs={12}
                    sm={4}
                    sx={{ minWidth: "346px", maxWidth: "346px" }}>
                    <Controller
                      name="tin_number"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="TIN Number"
                          fullWidth
                          error={!!errors.tin_number}
                          helperText={errors.tin_number?.message}
                          disabled={isReadOnly || isCreate}
                        />
                      )}
                    />
                  </Grid>
                  <Grid
                    item
                    xs={12}
                    sm={4}
                    sx={{ minWidth: "346px", maxWidth: "346px" }}>
                    <Controller
                      name="sss_number"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="SSS Number"
                          fullWidth
                          error={!!errors.sss_number}
                          helperText={errors.sss_number?.message}
                          disabled={isReadOnly || isCreate}
                        />
                      )}
                    />
                  </Grid>
                  <Grid
                    item
                    xs={12}
                    sm={4}
                    sx={{ minWidth: "346px", maxWidth: "346px" }}>
                    <Controller
                      name="pag_ibig_number"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Pag-IBIG Number"
                          fullWidth
                          error={!!errors.pag_ibig_number}
                          helperText={errors.pag_ibig_number?.message}
                          disabled={isReadOnly || isCreate}
                        />
                      )}
                    />
                  </Grid>
                  <Grid
                    item
                    xs={12}
                    sm={4}
                    sx={{ minWidth: "346px", maxWidth: "346px" }}>
                    <Controller
                      name="philhealth_number"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="PhilHealth Number"
                          fullWidth
                          error={!!errors.philhealth_number}
                          helperText={errors.philhealth_number?.message}
                          disabled={isReadOnly || isCreate}
                        />
                      )}
                    />
                  </Grid>

                  <Grid
                    item
                    xs={12}
                    sm={4}
                    sx={{ minWidth: "346px", maxWidth: "346px" }}>
                    <Controller
                      name="to_job_level"
                      control={control}
                      rules={{ required: "Job level is required" }}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Job level *"
                          fullWidth
                          error={!!errors.to_job_level}
                          helperText={errors.to_job_level?.message}
                          disabled={isReadOnly || isCreate}
                        />
                      )}
                    />
                  </Grid>
                  <Grid
                    item
                    xs={12}
                    sm={4}
                    sx={{ minWidth: "346px", maxWidth: "346px" }}>
                    <Controller
                      name="to_basic_salary"
                      control={control}
                      rules={{
                        required: "Basic salary is required",
                        pattern: {
                          value: /^\d+(\.\d{1,2})?$/,
                          message: "Please enter a valid amount",
                        },
                      }}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Basic Salary *"
                          fullWidth
                          type="number"
                          error={!!errors.to_basic_salary}
                          helperText={errors.to_basic_salary?.message}
                          disabled={isReadOnly}
                          inputProps={{
                            step: "0.01",
                            min: "0",
                          }}
                        />
                      )}
                    />
                  </Grid>
                  <Grid
                    item
                    xs={12}
                    sm={4}
                    sx={{ minWidth: "346px", maxWidth: "346px" }}>
                    <Controller
                      name="to_training_allowance"
                      control={control}
                      rules={{
                        pattern: {
                          value: /^\d+(\.\d{1,2})?$/,
                          message: "Please enter a valid amount",
                        },
                      }}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Training Allowance"
                          fullWidth
                          type="number"
                          error={!!errors.to_training_allowance}
                          helperText={errors.to_training_allowance?.message}
                          disabled={isReadOnly}
                          inputProps={{
                            step: "0.01",
                            min: "0",
                          }}
                        />
                      )}
                    />
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </form>
        </DialogContent>

        <DialogActions
          sx={{
            px: 3,
            py: 2,
            backgroundColor: "#fff",
          }}>
          {!isReadOnly && (
            <Button
              onClick={handleSubmit(onSubmit)}
              variant="contained"
              disabled={isLoading || isPrefillLoading}
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

MDAFormModal.displayName = "MDAFormModal";

export default MDAFormModal;
