import React from "react";
import { Controller, useFormContext } from "react-hook-form";
import {
  Grid,
  TextField,
  Typography,
  Autocomplete,
  CircularProgress,
  Box,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import {
  sectionTitleStyles,
  gridItemFullStyles,
  gridItemLargeStyles,
  gridItemExtraLargeStyles,
} from "./MDAFornModal.styles";

const InfoSection = ({ title, children }) => (
  <Box
    sx={{
      padding: 2,
      border: "none",
      borderRadius: "4px",
      minHeight: "120px",
      height: "auto",
    }}>
    {title && (
      <Typography
        variant="subtitle2"
        sx={{
          fontWeight: "bold",
          color: "rgb(33, 61, 112)",
          marginBottom: 1.5,
          fontSize: "11px",
          textTransform: "uppercase",
          letterSpacing: "0.5px",
        }}>
        {title}
      </Typography>
    )}
    {children}
  </Box>
);

const InfoField = ({ label, value }) => (
  <Box sx={{ mb: 2 }}>
    <Typography
      variant="subtitle2"
      sx={{
        fontWeight: "bold",
        color: "rgb(33, 61, 112)",
        marginBottom: 0.5,
        fontSize: "11px",
        textTransform: "uppercase",
        letterSpacing: "0.5px",
      }}>
      {label}
    </Typography>
    <Typography
      variant="body2"
      sx={{
        fontSize: "14px",
        fontWeight: 600,
        lineHeight: 1.3,
        color: "#1a1a1a",
        overflow: "hidden",
        textOverflow: "ellipsis",
        display: "-webkit-box",
        WebkitLineClamp: 2,
        WebkitBoxOrient: "vertical",
      }}>
      {value || "-"}
    </Typography>
  </Box>
);

const MDAFormModalFields = ({
  isCreate,
  isReadOnly,
  submissionId,
  employeeMovements,
  isPrefillLoading,
  setSelectedMovementId,
}) => {
  const {
    control,
    watch,
    formState: { errors },
  } = useFormContext();

  const formValues = watch();

  const formatDate = (date) => {
    if (!date) return "-";
    const d = new Date(date);
    return d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return "-";
    return `₱${parseFloat(amount).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const shouldShowSummary = Boolean(
    (isCreate && formValues.employee_movement_id) || (!isCreate && submissionId)
  );

  return (
    <Grid container spacing={2}>
      {isCreate && !submissionId && (
        <Grid item xs={12}>
          <Typography variant="h6" sx={sectionTitleStyles}>
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
                    ? `${option.employee_name} - ${option.action_type || "N/A"}`
                    : ""
                }
                value={employeeMovements.find((m) => m.id === value) || null}
                onChange={(_, newValue) => {
                  onChange(newValue?.id || null);
                  setSelectedMovementId(newValue?.id || null);
                }}
                loading={isPrefillLoading}
                disabled={isReadOnly}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Employee Movement"
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

      {shouldShowSummary ? (
        <>
          <Grid item xs={12}>
            <Grid container spacing={0}>
              <Grid item xs={12} md={6}>
                <Box sx={{ width: "210px" }}>
                  <InfoSection>
                    <InfoField
                      label="Employee Code"
                      value={formValues.employee_number}
                    />
                    <InfoField label="Gender" value={formValues.gender} />
                    <InfoField
                      label="Nationality"
                      value={formValues.nationality}
                    />
                  </InfoSection>
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box sx={{ width: "360px" }}>
                  <InfoSection>
                    <InfoField
                      label="Full Name"
                      value={formValues.employee_name}
                    />
                    <InfoField
                      label="Birth Date"
                      value={formatDate(formValues.birth_date)}
                    />
                    <InfoField
                      label="Civil Status"
                      value={formValues.civil_status}
                    />
                  </InfoSection>
                </Box>
              </Grid>
            </Grid>
          </Grid>

          <Grid item xs={12}>
            <Box sx={{ width: "220px" }}>
              <InfoSection>
                <InfoField label="Birth Place" value={formValues.birth_place} />
                <InfoField label="SSS Number" value={formValues.sss_number} />
                <InfoField
                  label="PhilHealth Number"
                  value={formValues.philhealth_number}
                />
              </InfoSection>
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ width: "210px" }}>
              <InfoSection>
                <InfoField label="TIN Number" value={formValues.tin_number} />
                <InfoField
                  label="Pag-IBIG Number"
                  value={formValues.pag_ibig_number}
                />
              </InfoSection>
            </Box>
          </Grid>

          <Grid item xs={12} sx={{ marginTop: -5, marginBottom: -6 }}>
            <InfoSection>
              <InfoField label="Address" value={formValues.address} />
            </InfoSection>
          </Grid>
          <Grid item xs={12}>
            <Typography
              variant="h6"
              sx={{
                ...sectionTitleStyles,
                marginTop: -1,
                marginBottom: 0,
                marginLeft: 2,
              }}>
              FROM POSITION
            </Typography>
            <Grid container spacing={0}>
              <Grid item xs={12} md={4}>
                <Box sx={{ width: "500px" }}>
                  <InfoSection>
                    <InfoField
                      label="Position"
                      value={formValues.from_position_title}
                    />
                    <InfoField
                      label="Department"
                      value={formValues.from_department}
                    />
                    <InfoField
                      label="Sub Unit"
                      value={formValues.from_sub_unit}
                    />
                  </InfoSection>
                </Box>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box sx={{ width: "300px" }}>
                  <InfoSection>
                    <InfoField
                      label="Job Level"
                      value={formValues.from_job_level}
                    />
                    <InfoField
                      label="Job Rate"
                      value={formatCurrency(formValues.from_job_rate)}
                    />
                    <InfoField
                      label="Allowance"
                      value={formatCurrency(formValues.from_allowance)}
                    />
                  </InfoSection>
                </Box>
              </Grid>
            </Grid>
          </Grid>

          <Grid item xs={12}>
            <Typography
              variant="h6"
              sx={{
                ...sectionTitleStyles,
                marginTop: -3,
                marginBottom: 0,
                marginLeft: 2,
              }}>
              TO POSITION
            </Typography>
            <Grid container spacing={0}>
              <Grid item xs={12} md={4}>
                <Box sx={{ width: "500px" }}>
                  <InfoSection>
                    <InfoField
                      label="Position"
                      value={formValues.to_position_title}
                    />
                    <InfoField
                      label="Department"
                      value={formValues.to_department}
                    />
                  </InfoSection>
                  <Controller
                    name="to_job_rate"
                    control={control}
                    rules={{
                      required: "Job rate is required",
                      pattern: {
                        value: /^\d+(\.\d{1,2})?$/,
                        message: "Please enter a valid amount",
                      },
                    }}
                    render={({ field }) => (
                      <TextField
                        sx={{ width: "320px", marginLeft: 1.5 }}
                        {...field}
                        label="Job Rate To *"
                        type="number"
                        error={!!errors.to_job_rate}
                        helperText={errors.to_job_rate?.message}
                        disabled={isReadOnly}
                        inputProps={{
                          step: "0.01",
                          min: "0",
                        }}
                      />
                    )}
                  />
                </Box>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box sx={{ width: "300px" }}>
                  <InfoSection>
                    <InfoField
                      label="Job Level"
                      value={formValues.to_job_level}
                    />
                    <InfoField
                      label="Sub Unit"
                      value={formValues.to_sub_unit}
                    />
                  </InfoSection>
                  <Controller
                    name="to_allowance"
                    control={control}
                    rules={{
                      pattern: {
                        value: /^\d+(\.\d{1,2})?$/,
                        message: "Please enter a valid amount",
                      },
                    }}
                    render={({ field }) => (
                      <TextField
                        sx={{ width: "320px", marginLeft: 1.5 }}
                        {...field}
                        label="Allowance To *"
                        fullWidth
                        type="number"
                        error={!!errors.to_allowance}
                        helperText={errors.to_allowance?.message}
                        disabled={isReadOnly}
                        inputProps={{
                          step: "0.01",
                          min: "0",
                        }}
                      />
                    )}
                  />
                </Box>
              </Grid>
            </Grid>
          </Grid>
        </>
      ) : (
        !shouldShowSummary &&
        submissionId && (
          <Grid item xs={12} sx={gridItemFullStyles}>
            <Grid container spacing={1.6}>
              <Grid item xs={12} sm={4} sx={gridItemLargeStyles}>
                <Controller
                  name="employee_name"
                  control={control}
                  rules={{ required: "Employee name is required" }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Employee Name"
                      fullWidth
                      error={!!errors.employee_name}
                      helperText={errors.employee_name?.message}
                      disabled={isReadOnly || isCreate}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={4} sx={gridItemLargeStyles}>
                <Controller
                  name="employee_id"
                  control={control}
                  rules={{ required: "Employee ID is required" }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Employee ID"
                      fullWidth
                      error={!!errors.employee_id}
                      helperText={errors.employee_id?.message}
                      disabled={isReadOnly || isCreate}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={4} sx={gridItemLargeStyles}>
                <Controller
                  name="employee_number"
                  control={control}
                  rules={{ required: "Employee number is required" }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Employee Number"
                      fullWidth
                      error={!!errors.employee_number}
                      helperText={errors.employee_number?.message}
                      disabled={isReadOnly || isCreate}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={4} sx={gridItemLargeStyles}>
                <Controller
                  name="effective_date"
                  control={control}
                  rules={{ required: "Effective date is required" }}
                  render={({ field }) => (
                    <DatePicker
                      {...field}
                      label="Effective Date"
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
              <Grid item xs={12} sm={4} sx={gridItemLargeStyles}>
                <Controller
                  name="action_type"
                  control={control}
                  rules={{ required: "Action type is required" }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Action Type"
                      fullWidth
                      error={!!errors.action_type}
                      helperText={errors.action_type?.message}
                      disabled={isReadOnly || isCreate}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={4} sx={gridItemLargeStyles}>
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
              <Grid item xs={12} sm={4} sx={gridItemLargeStyles}>
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
              <Grid item xs={12} sm={4} sx={gridItemLargeStyles}>
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
              <Grid item xs={12} sm={4} sx={gridItemLargeStyles}>
                <Controller
                  name="civil_status"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Civil Status"
                      fullWidth
                      error={!!errors.civil_status}
                      helperText={errors.civil_status?.message}
                      disabled={isReadOnly || isCreate}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={4} sx={gridItemLargeStyles}>
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
              <Grid item xs={12} sm={8} sx={gridItemExtraLargeStyles}>
                <Controller
                  name="address"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Address"
                      fullWidth
                      multiline
                      error={!!errors.address}
                      helperText={errors.address?.message}
                      disabled={isReadOnly || isCreate}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={3} sx={gridItemLargeStyles}>
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
              <Grid item xs={12} sm={3} sx={gridItemLargeStyles}>
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
              <Grid item xs={12} sm={3} sx={gridItemLargeStyles}>
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
              <Grid item xs={12} sm={3} sx={gridItemLargeStyles}>
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
            </Grid>
          </Grid>
        )
      )}

      {!shouldShowSummary && (
        <>
          <Grid item xs={12} sx={gridItemFullStyles}>
            <Typography variant="h6" sx={sectionTitleStyles}>
              FROM POSITION
            </Typography>
            <Grid container spacing={1.6}>
              <Grid item xs={12} sm={4} sx={gridItemLargeStyles}>
                <Controller
                  name="from_position_title"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Position Title From"
                      fullWidth
                      error={!!errors.from_position_title}
                      helperText={errors.from_position_title?.message}
                      disabled={isReadOnly || isCreate}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={4} sx={gridItemLargeStyles}>
                <Controller
                  name="from_department"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Department From"
                      fullWidth
                      error={!!errors.from_department}
                      helperText={errors.from_department?.message}
                      disabled={isReadOnly || isCreate}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={4} sx={gridItemLargeStyles}>
                <Controller
                  name="from_sub_unit"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Sub Unit From"
                      fullWidth
                      error={!!errors.from_sub_unit}
                      helperText={errors.from_sub_unit?.message}
                      disabled={isReadOnly || isCreate}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={4} sx={gridItemLargeStyles}>
                <Controller
                  name="from_job_level"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Job Level From"
                      fullWidth
                      error={!!errors.from_job_level}
                      helperText={errors.from_job_level?.message}
                      disabled={isReadOnly || isCreate}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={4} sx={gridItemLargeStyles}></Grid>
              <Grid item xs={12} sm={4} sx={gridItemLargeStyles}>
                <Controller
                  name="from_job_rate"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Job Rate From"
                      fullWidth
                      type="number"
                      error={!!errors.from_job_rate}
                      helperText={errors.from_job_rate?.message}
                      disabled={isReadOnly || isCreate}
                      inputProps={{
                        step: "0.01",
                        min: "0",
                      }}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={4} sx={gridItemLargeStyles}>
                <Controller
                  name="from_allowance"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Allowance From"
                      fullWidth
                      type="number"
                      error={!!errors.from_allowance}
                      helperText={errors.from_allowance?.message}
                      disabled={isReadOnly || isCreate}
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

          <Grid item xs={12} sx={gridItemFullStyles}>
            <Typography variant="h6" sx={sectionTitleStyles}>
              TO POSITION
            </Typography>
            <Grid container spacing={1.6}>
              <Grid item xs={12} sm={4} sx={gridItemLargeStyles}>
                <Controller
                  name="to_position_title"
                  control={control}
                  rules={{ required: "Position title is required" }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Position Title To"
                      fullWidth
                      error={!!errors.to_position_title}
                      helperText={errors.to_position_title?.message}
                      disabled={isReadOnly || isCreate}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={4} sx={gridItemLargeStyles}>
                <Controller
                  name="to_department"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Department To"
                      fullWidth
                      error={!!errors.to_department}
                      helperText={errors.to_department?.message}
                      disabled={isReadOnly || isCreate}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={4} sx={gridItemLargeStyles}>
                <Controller
                  name="to_sub_unit"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Sub Unit To"
                      fullWidth
                      error={!!errors.to_sub_unit}
                      helperText={errors.to_sub_unit?.message}
                      disabled={isReadOnly || isCreate}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={4} sx={gridItemLargeStyles}>
                <Controller
                  name="to_job_level"
                  control={control}
                  rules={{ required: "Job level is required" }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Job Level To"
                      fullWidth
                      error={!!errors.to_job_level}
                      helperText={errors.to_job_level?.message}
                      disabled={isReadOnly || isCreate}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={4} sx={gridItemLargeStyles}></Grid>
              <Grid item xs={12} sm={4} sx={gridItemLargeStyles}>
                <Controller
                  name="to_job_rate"
                  control={control}
                  rules={{
                    required: "Job rate is required",
                    pattern: {
                      value: /^\d+(\.\d{1,2})?$/,
                      message: "Please enter a valid amount",
                    },
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Job Rate To *"
                      fullWidth
                      type="number"
                      error={!!errors.to_job_rate}
                      helperText={errors.to_job_rate?.message}
                      disabled={isReadOnly}
                      inputProps={{
                        step: "0.01",
                        min: "0",
                      }}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={4} sx={gridItemLargeStyles}>
                <Controller
                  name="to_allowance"
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
                      label="Allowance To *"
                      fullWidth
                      type="number"
                      error={!!errors.to_allowance}
                      helperText={errors.to_allowance?.message}
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
        </>
      )}
    </Grid>
  );
};

export default MDAFormModalFields;
