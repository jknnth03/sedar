import React, { useEffect, useState, useRef } from "react";
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
import {
  infoSectionContainerStyles,
  infoSectionTitleStyles,
  infoFieldContainerStyles,
  infoFieldLabelStyles,
  infoFieldValueStyles,
  infoBoxStyles,
  addressGridStyles,
} from "./MDAFormModalFields.styles";
import { FromPositionFields } from "./MDAFormModalFromPosition";
import { ToPositionFields } from "./MDAFormModalToPosition";

const InfoSection = ({ title, children }) => (
  <Box sx={infoSectionContainerStyles}>
    {title && (
      <Typography variant="subtitle2" sx={infoSectionTitleStyles}>
        {title}
      </Typography>
    )}
    {children}
  </Box>
);

const InfoField = ({ label, value }) => (
  <Box sx={infoFieldContainerStyles}>
    <Typography variant="subtitle2" sx={infoFieldLabelStyles}>
      {label}
    </Typography>
    <Typography variant="body2" sx={infoFieldValueStyles}>
      {value || "-"}
    </Typography>
  </Box>
);

const MDAFormModalFields = ({
  isCreate,
  isReadOnly,
  submissionId,
  employeeMovements = [],
  isPrefillLoading,
  setSelectedMovementId,
  currentMode,
  positions = [],
  jobLevels = [],
}) => {
  const {
    control,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext();

  const formValues = watch();
  const [selectedMovement, setSelectedMovement] = useState(null);
  const [movementSearchInput, setMovementSearchInput] = useState("");
  const [isAutocompleteOpen, setIsAutocompleteOpen] = useState(false);

  const isInitialMount = useRef(true);
  const prevModeRef = useRef(currentMode);

  useEffect(() => {
    if (!isCreate && currentMode !== prevModeRef.current) {
      isInitialMount.current = true;
      prevModeRef.current = currentMode;
    }
  }, [currentMode, isCreate]);

  useEffect(() => {
    if (
      isCreate &&
      Array.isArray(employeeMovements) &&
      employeeMovements.length > 0
    ) {
      const movementId = watch("employee_movement_id");
      if (movementId) {
        const movement = employeeMovements.find((m) => m.id === movementId);
        if (movement) {
          setSelectedMovement(movement);
          setMovementSearchInput(
            movement.employee_name
              ? `${movement.employee_name} - ${movement.action_type || "N/A"}`
              : ""
          );
        }
      }
    }
  }, [isCreate, employeeMovements, watch]);

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

  const handleMovementChange = (event, newValue) => {
    setSelectedMovement(newValue);
    if (newValue) {
      setValue("employee_movement_id", newValue.id);
      setSelectedMovementId(newValue.id);
    } else {
      setValue("employee_movement_id", null);
      setSelectedMovementId(null);
      setSelectedMovement(null);
    }
  };

  const shouldShowSummary = Boolean(
    (isCreate && formValues.employee_movement_id) || (!isCreate && submissionId)
  );

  const movementOptions = Array.isArray(employeeMovements)
    ? employeeMovements
    : [];

  return (
    <>
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
              render={({ field }) => (
                <Autocomplete
                  {...field}
                  options={movementOptions}
                  getOptionLabel={(option) =>
                    option.employee_name
                      ? `${option.employee_name} - ${
                          option.action_type || "N/A"
                        }`
                      : ""
                  }
                  value={selectedMovement}
                  onChange={handleMovementChange}
                  inputValue={movementSearchInput}
                  onInputChange={(event, newInputValue) => {
                    setMovementSearchInput(newInputValue);
                  }}
                  onOpen={() => setIsAutocompleteOpen(true)}
                  onClose={() => setIsAutocompleteOpen(false)}
                  loading={isPrefillLoading}
                  isOptionEqualToValue={(option, value) =>
                    option?.id === value?.id
                  }
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
                  <Box sx={infoBoxStyles.employeeInfo1}>
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
                  <Box sx={infoBoxStyles.employeeInfo2}>
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
              <Box sx={infoBoxStyles.birthPlaceInfo}>
                <InfoSection>
                  <InfoField
                    label="Birth Place"
                    value={formValues.birth_place}
                  />
                  <InfoField label="SSS Number" value={formValues.sss_number} />
                  <InfoField
                    label="PhilHealth Number"
                    value={formValues.philhealth_number}
                  />
                </InfoSection>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={infoBoxStyles.tinInfo}>
                <InfoSection>
                  <InfoField label="TIN Number" value={formValues.tin_number} />
                  <InfoField
                    label="Pag-IBIG Number"
                    value={formValues.pag_ibig_number}
                  />
                </InfoSection>
              </Box>
            </Grid>

            <Grid item xs={12} sx={addressGridStyles}>
              <InfoSection>
                <InfoField label="Address" value={formValues.address} />
              </InfoSection>
            </Grid>

            <Grid item xs={12}>
              <FromPositionFields
                control={control}
                errors={errors}
                isReadOnly={isReadOnly}
                isCreate={isCreate}
                showSummary={false}
                formValues={formValues}
                formatCurrency={formatCurrency}
                currentMode={currentMode}
              />
            </Grid>

            <Grid item xs={12}>
              <ToPositionFields
                control={control}
                errors={errors}
                isReadOnly={isReadOnly}
                isCreate={isCreate}
                showSummary={false}
                formValues={formValues}
                currentMode={currentMode}
                positions={positions}
                jobLevels={jobLevels}
              />
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
      </Grid>
      {!shouldShowSummary && (
        <Box sx={{ mt: 2 }}>
          <FromPositionFields
            control={control}
            errors={errors}
            isReadOnly={isReadOnly}
            isCreate={isCreate}
            showSummary={false}
            formValues={formValues}
            formatCurrency={formatCurrency}
            currentMode={currentMode}
          />

          <ToPositionFields
            control={control}
            errors={errors}
            isReadOnly={isReadOnly}
            isCreate={isCreate}
            showSummary={false}
            formValues={formValues}
            currentMode={currentMode}
            positions={positions}
            jobLevels={jobLevels}
          />
        </Box>
      )}
    </>
  );
};

export default MDAFormModalFields;
