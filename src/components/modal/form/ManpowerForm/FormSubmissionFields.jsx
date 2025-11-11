import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useFormContext, Controller } from "react-hook-form";
import {
  Grid,
  TextField,
  Autocomplete,
  MenuItem,
  FormControlLabel,
  Checkbox,
  CircularProgress,
  Skeleton,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { useLazyGetManpowerOptionsQuery } from "../../../../features/api/masterlist/positionsApi";
import { useLazyGetAllJobLevelsQuery } from "../../../../features/api/masterlist/jobLevelsApi";
import { useLazyGetAllRequisitionsQuery } from "../../../../features/api/extras/requisitionsApi";
import { useLazyGetAllEmployeesToBeReplacedQuery } from "../../../../features/api/employee/mainApi";
import { useLazyGetAllEmployeesQuery } from "../../../../features/api/approvalsetting/approvalFormApi";
import { expectedSalaryInputProps } from "../../../../schema/approver/formSubmissionSchema";
import FileViewerDialog from "./FileViewerDialog";
import AttachmentField from "./AttachmentField";
import { formStyles } from "./FormSubmissionFieldStyles";
import dayjs from "dayjs";

const safeStringRender = (value, fallback = "") => {
  if (typeof value === "string") return value;
  if (typeof value === "number") return value.toString();
  if (value && typeof value === "object") {
    return fallback;
  }
  return value || fallback;
};

const FormSubmissionFields = ({
  mode,
  selectedEntry,
  onFileChange,
  selectedFile,
  disabled = false,
  isEmployeeFieldEnabled = false,
  resetTrigger = 0,
}) => {
  const {
    control,
    formState: { errors },
    setValue,
    watch,
    clearErrors,
  } = useFormContext();

  const [fileViewerOpen, setFileViewerOpen] = useState(false);
  const [currentFormSubmissionId, setCurrentFormSubmissionId] = useState(null);
  const [dropdownsLoaded, setDropdownsLoaded] = useState({
    requisitions: false,
    positions: false,
    jobLevels: false,
    employees: false,
    allEmployees: false,
    movementPosition: false,
  });

  const watchedRequisitionType = watch("requisition_type_id");
  const watchedPositionId = watch("position_id");
  const watchedForDevelopmentalAssignment = watch("movement_is_da");

  const isReadOnly = mode === "view" || disabled;
  const isCreateMode = mode === "create";
  const isEditMode = mode === "edit";
  const isViewMode = mode === "view" || disabled;
  const shouldLoadDropdowns = mode === "create" || mode === "edit";

  const [
    triggerGetPositions,
    { data: positionsData, isLoading: positionsLoading },
  ] = useLazyGetManpowerOptionsQuery();

  const [
    triggerGetJobLevels,
    { data: jobLevelsData, isLoading: jobLevelsLoading },
  ] = useLazyGetAllJobLevelsQuery();

  const [
    triggerGetRequisitions,
    { data: requisitionsData, isLoading: requisitionsLoading },
  ] = useLazyGetAllRequisitionsQuery();

  const [
    triggerGetEmployees,
    { data: employeesData, isLoading: employeesLoading },
  ] = useLazyGetAllEmployeesToBeReplacedQuery();

  const [
    triggerGetAllEmployees,
    { data: allEmployeesData, isLoading: allEmployeesLoading },
  ] = useLazyGetAllEmployeesQuery();

  const normalizeApiData = useCallback((data) => {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    if (data.result && Array.isArray(data.result.data)) return data.result.data;
    if (data.result && Array.isArray(data.result)) return data.result;
    if (Array.isArray(data.data)) return data.data;
    return [];
  }, []);

  const positions = useMemo(
    () => normalizeApiData(positionsData),
    [positionsData, normalizeApiData]
  );
  const jobLevels = useMemo(
    () => normalizeApiData(jobLevelsData),
    [jobLevelsData, normalizeApiData]
  );
  const requisitions = useMemo(
    () => normalizeApiData(requisitionsData),
    [requisitionsData, normalizeApiData]
  );
  const employees = useMemo(
    () => normalizeApiData(employeesData),
    [employeesData, normalizeApiData]
  );
  const allEmployees = useMemo(
    () => normalizeApiData(allEmployeesData),
    [allEmployeesData, normalizeApiData]
  );

  const handleDropdownFocus = useCallback(
    (dropdownName) => {
      if (!shouldLoadDropdowns) return;

      if (!dropdownsLoaded[dropdownName]) {
        setDropdownsLoaded((prev) => ({ ...prev, [dropdownName]: true }));

        switch (dropdownName) {
          case "requisitions":
            triggerGetRequisitions();
            break;
          case "positions":
          case "movementPosition":
            triggerGetPositions();
            break;
          case "jobLevels":
            triggerGetJobLevels();
            break;
          case "employees":
            if (watchedPositionId?.id && watchedRequisitionType?.id) {
              triggerGetEmployees({
                position_id: watchedPositionId.id,
                requisition_type_id: watchedRequisitionType.id,
                ...(selectedEntry?.id && { current_mrf_id: selectedEntry.id }),
              });
            }
            break;
          case "allEmployees":
            triggerGetAllEmployees({
              pagination: false,
              status: "active",
            });
            break;
          default:
            break;
        }
      }
    },
    [
      dropdownsLoaded,
      shouldLoadDropdowns,
      watchedPositionId,
      watchedRequisitionType,
      selectedEntry,
      triggerGetRequisitions,
      triggerGetPositions,
      triggerGetJobLevels,
      triggerGetEmployees,
      triggerGetAllEmployees,
    ]
  );

  useEffect(() => {
    if ((mode === "view" || mode === "edit") && selectedEntry) {
      const submittable =
        selectedEntry.result?.submittable ||
        selectedEntry.submittable ||
        selectedEntry;

      if (submittable.requisition_type) {
        setValue("requisition_type_id", submittable.requisition_type, {
          shouldValidate: false,
        });
      }

      if (submittable.position) {
        setValue("position_id", submittable.position, {
          shouldValidate: false,
        });
      }

      if (submittable.job_level) {
        setValue("job_level_id", submittable.job_level, {
          shouldValidate: false,
        });
      }

      if (submittable.employee_to_be_replaced) {
        setValue(
          "employee_to_be_replaced_id",
          submittable.employee_to_be_replaced,
          { shouldValidate: false }
        );
      }

      if (submittable.expected_salary) {
        setValue("expected_salary", submittable.expected_salary, {
          shouldValidate: false,
        });
      }

      if (submittable.employment_type) {
        setValue("employment_type", submittable.employment_type, {
          shouldValidate: false,
        });
      }

      if (submittable.justification) {
        setValue("justification", submittable.justification, {
          shouldValidate: false,
        });
      }

      if (submittable.remarks) {
        setValue("remarks", submittable.remarks, { shouldValidate: false });
      }

      if (submittable.employee_movement_details) {
        const movement = submittable.employee_movement_details;

        if (movement.employee) {
          setValue("movement_employee_id", movement.employee, {
            shouldValidate: false,
          });
        }

        if (movement.new_position) {
          setValue("movement_new_position_id", movement.new_position, {
            shouldValidate: false,
          });
        }

        if (movement.reason_for_change) {
          setValue("movement_reason_for_change", movement.reason_for_change, {
            shouldValidate: false,
          });
        }

        if (movement.is_developmental_assignment !== undefined) {
          setValue(
            "movement_is_da",
            Boolean(movement.is_developmental_assignment),
            { shouldValidate: false }
          );
        }

        if (movement.da_start_date) {
          setValue("movement_da_start_date", dayjs(movement.da_start_date), {
            shouldValidate: false,
          });
        }

        if (movement.da_end_date) {
          setValue("movement_da_end_date", dayjs(movement.da_end_date), {
            shouldValidate: false,
          });
        }
      }
    }
  }, [mode, selectedEntry, setValue]);

  const isReplacementDueToEmployeeMovement = () => {
    if (!watchedRequisitionType) return false;
    return (
      watchedRequisitionType.name === "REPLACEMENT DUE TO EMPLOYEE MOVEMENT"
    );
  };

  const isAdditionalManpower = () => {
    if (!watchedRequisitionType) return false;
    return watchedRequisitionType.name === "ADDITIONAL MANPOWER";
  };

  const shouldShowMovementFields = () => {
    return isReplacementDueToEmployeeMovement();
  };

  const shouldShowDateFields = () => {
    return (
      isReplacementDueToEmployeeMovement() && watchedForDevelopmentalAssignment
    );
  };

  const shouldShowReasonForChange = () => {
    return isReplacementDueToEmployeeMovement();
  };

  const handleFileViewerOpen = () => {
    const formSubmissionId = selectedEntry?.id;
    if (formSubmissionId) {
      setCurrentFormSubmissionId(formSubmissionId);
      setFileViewerOpen(true);
    }
  };

  const handleFileViewerClose = () => {
    setFileViewerOpen(false);
    setCurrentFormSubmissionId(null);
  };

  const handleEmploymentTypeChange = (event) => {
    if (disabled) return;
    const value = event.target.value;
    setValue("employment_type", value);
    if (value && value !== "") {
      clearErrors("employment_type");
    }
  };

  const handleReasonForChangeChange = (event) => {
    if (disabled) return;
    const value = event.target.value;
    setValue("movement_reason_for_change", value);
    if (value && value !== "") {
      clearErrors("movement_reason_for_change");
    }
  };

  const getErrorMessage = (error) => {
    if (!error) return "";
    if (typeof error.message === "string") return error.message;
    if (typeof error === "string") return error;
    if (error && typeof error === "object") {
      return "Validation error";
    }
    return "";
  };

  const StyledTextField = ({ label, required = false, ...props }) => (
    <TextField
      {...props}
      label={
        required ? (
          <span>
            {safeStringRender(label)}{" "}
            <span style={formStyles?.requiredAsterisk?.(isViewMode) || {}}>
              *
            </span>
          </span>
        ) : (
          safeStringRender(label)
        )
      }
    />
  );

  const employmentTypeOptions = [
    "REGULAR",
    "PROBATIONARY",
    "PROJECT-BASED",
    "SEASONAL",
    "FIXED-TERM",
    "CASUAL",
  ];

  const reasonForChangeOptions = [
    "PROMOTION",
    "DEMOTION",
    "TRANSFER",
    "REASSIGNMENT",
    "LATERAL MOVE",
    "ACTING CAPACITY",
    "SECONDMENT",
  ];

  return (
    <>
      <Grid container spacing={1.2} sx={formStyles?.container || {}}>
        <Grid item xs={12} md={6}>
          <Controller
            name="requisition_type_id"
            control={control}
            render={({ field: { onChange, value } }) => (
              <Autocomplete
                onChange={(event, item) => {
                  if (isReadOnly || isEditMode) return;
                  onChange(item);
                  if (item) {
                    setValue("employee_to_be_replaced_id", null);
                    setValue("movement_employee_id", null);
                    setDropdownsLoaded((prev) => ({
                      ...prev,
                      employees: false,
                      allEmployees: false,
                    }));
                  }
                }}
                onOpen={() => handleDropdownFocus("requisitions")}
                value={value || null}
                disabled={isReadOnly || isEditMode}
                options={requisitions}
                loading={requisitionsLoading}
                getOptionLabel={(option) => safeStringRender(option?.name)}
                isOptionEqualToValue={(option, value) => {
                  if (!option || !value) return false;
                  return option.id === value.id;
                }}
                disablePortal
                renderInput={(params) => (
                  <StyledTextField
                    {...params}
                    label="Requisition Type"
                    required={true}
                    error={!!errors.requisition_type_id}
                    helperText={getErrorMessage(errors.requisition_type_id)}
                    sx={
                      formStyles?.autocompleteTextField?.(
                        isReadOnly,
                        isEditMode
                      ) || {}
                    }
                    InputProps={{
                      ...params.InputProps,
                      endAdornment: (
                        <>
                          {requisitionsLoading && (
                            <CircularProgress color="inherit" size={20} />
                          )}
                          {params.InputProps.endAdornment}
                        </>
                      ),
                    }}
                  />
                )}
                noOptionsText={
                  requisitionsLoading
                    ? "Loading requisitions..."
                    : "No requisitions found"
                }
              />
            )}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <Controller
            name="position_id"
            control={control}
            render={({ field: { onChange, value } }) => (
              <Autocomplete
                onChange={(event, item) => {
                  if (isReadOnly || isEditMode) return;
                  onChange(item);
                  setValue("employee_to_be_replaced_id", null);
                  setValue("movement_employee_id", null);
                  setDropdownsLoaded((prev) => ({
                    ...prev,
                    employees: false,
                    allEmployees: false,
                  }));
                }}
                onOpen={() => handleDropdownFocus("positions")}
                value={value || null}
                disabled={isReadOnly || isEditMode || !watchedRequisitionType}
                options={positions}
                loading={positionsLoading}
                getOptionLabel={(option) =>
                  safeStringRender(option?.title_with_unit)
                }
                isOptionEqualToValue={(option, value) => {
                  if (!option || !value) return false;
                  return option.id === value.id;
                }}
                disablePortal
                renderInput={(params) => (
                  <StyledTextField
                    {...params}
                    label="Position"
                    required={true}
                    error={!!errors.position_id}
                    helperText={getErrorMessage(errors.position_id)}
                    sx={
                      formStyles?.autocompleteTextField?.(
                        isReadOnly,
                        isEditMode
                      ) || {}
                    }
                    InputProps={{
                      ...params.InputProps,
                      endAdornment: (
                        <>
                          {positionsLoading && (
                            <CircularProgress color="inherit" size={20} />
                          )}
                          {params.InputProps.endAdornment}
                        </>
                      ),
                    }}
                  />
                )}
                noOptionsText={
                  positionsLoading
                    ? "Loading positions..."
                    : "No positions found"
                }
              />
            )}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          {isReplacementDueToEmployeeMovement() ? (
            <Controller
              name="movement_employee_id"
              control={control}
              render={({ field: { onChange, value } }) => (
                <Autocomplete
                  onChange={(event, item) => {
                    if (isReadOnly || isEditMode) return;
                    onChange(item);
                  }}
                  onOpen={() => handleDropdownFocus("employees")}
                  value={value || null}
                  disabled={
                    isReadOnly ||
                    isEditMode ||
                    !watchedPositionId ||
                    !watchedRequisitionType
                  }
                  options={employees}
                  loading={employeesLoading}
                  getOptionLabel={(option) =>
                    safeStringRender(
                      option?.full_name || option?.name || option?.employee_name
                    )
                  }
                  isOptionEqualToValue={(option, value) => {
                    if (!option || !value) return false;
                    return option.id === value.id;
                  }}
                  disablePortal
                  renderInput={(params) => (
                    <StyledTextField
                      {...params}
                      label="Select Employee"
                      required={true}
                      error={!!errors.movement_employee_id}
                      helperText={
                        getErrorMessage(errors.movement_employee_id) ||
                        (!watchedPositionId || !watchedRequisitionType
                          ? "Please select Position and Requisition Type first"
                          : "")
                      }
                      sx={
                        formStyles?.autocompleteTextField?.(
                          isReadOnly,
                          isEditMode
                        ) || {}
                      }
                      InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                          <>
                            {employeesLoading && (
                              <CircularProgress color="inherit" size={20} />
                            )}
                            {params.InputProps.endAdornment}
                          </>
                        ),
                      }}
                    />
                  )}
                  noOptionsText={
                    employeesLoading
                      ? "Loading employees..."
                      : !watchedPositionId || !watchedRequisitionType
                      ? "Select position and requisition type first"
                      : "No employees found"
                  }
                />
              )}
            />
          ) : (
            <Controller
              name="employee_to_be_replaced_id"
              control={control}
              render={({ field: { onChange, value } }) => (
                <Autocomplete
                  onChange={(event, item) => {
                    if (isReadOnly || isEditMode || isAdditionalManpower())
                      return;
                    onChange(item);
                  }}
                  onOpen={() => handleDropdownFocus("employees")}
                  value={value || null}
                  disabled={
                    isReadOnly ||
                    isEditMode ||
                    isAdditionalManpower() ||
                    !watchedPositionId ||
                    !watchedRequisitionType
                  }
                  options={employees}
                  loading={employeesLoading}
                  getOptionLabel={(option) =>
                    safeStringRender(
                      option?.full_name || option?.name || option?.employee_name
                    )
                  }
                  isOptionEqualToValue={(option, value) => {
                    if (!option || !value) return false;
                    return option.id === value.id;
                  }}
                  disablePortal
                  renderInput={(params) => (
                    <StyledTextField
                      {...params}
                      label="Employee to be Replaced"
                      required={!isAdditionalManpower()}
                      error={!!errors.employee_to_be_replaced_id}
                      helperText={
                        isAdditionalManpower()
                          ? "Not required for Additional Manpower"
                          : getErrorMessage(
                              errors.employee_to_be_replaced_id
                            ) ||
                            (!watchedPositionId || !watchedRequisitionType
                              ? "Please select Position and Requisition Type first"
                              : "")
                      }
                      sx={formStyles?.textField?.() || {}}
                      InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                          <>
                            {employeesLoading && (
                              <CircularProgress color="inherit" size={20} />
                            )}
                            {params.InputProps.endAdornment}
                          </>
                        ),
                      }}
                    />
                  )}
                  noOptionsText={
                    employeesLoading
                      ? "Loading employees..."
                      : !watchedPositionId || !watchedRequisitionType
                      ? "Select position and requisition type first"
                      : "No employees found"
                  }
                />
              )}
            />
          )}
        </Grid>

        {shouldShowMovementFields() && (
          <Grid item xs={12} md={6}>
            <Controller
              name="movement_new_position_id"
              control={control}
              render={({ field: { onChange, value } }) => (
                <Autocomplete
                  onChange={(event, item) => {
                    if (isReadOnly) return;
                    onChange(item);
                  }}
                  onOpen={() => handleDropdownFocus("movementPosition")}
                  value={value || null}
                  disabled={isReadOnly}
                  options={positions}
                  loading={positionsLoading}
                  getOptionLabel={(option) =>
                    safeStringRender(option?.title_with_unit)
                  }
                  isOptionEqualToValue={(option, value) => {
                    if (!option || !value) return false;
                    return option.id === value.id;
                  }}
                  disablePortal
                  renderInput={(params) => (
                    <StyledTextField
                      {...params}
                      label="New Position"
                      required={true}
                      error={!!errors.movement_new_position_id}
                      helperText={getErrorMessage(
                        errors.movement_new_position_id
                      )}
                      sx={formStyles?.textField?.(isReadOnly) || {}}
                      InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                          <>
                            {positionsLoading && (
                              <CircularProgress color="inherit" size={20} />
                            )}
                            {params.InputProps.endAdornment}
                          </>
                        ),
                      }}
                    />
                  )}
                  noOptionsText={
                    positionsLoading
                      ? "Loading positions..."
                      : "No positions found"
                  }
                />
              )}
            />
          </Grid>
        )}

        <Grid item xs={12} md={6}>
          <Controller
            name="job_level_id"
            control={control}
            render={({ field: { onChange, value } }) => (
              <Autocomplete
                onChange={(event, item) => {
                  if (isReadOnly) return;
                  onChange(item);
                }}
                onOpen={() => handleDropdownFocus("jobLevels")}
                value={value || null}
                disabled={isReadOnly}
                options={jobLevels}
                loading={jobLevelsLoading}
                getOptionLabel={(option) => safeStringRender(option?.label)}
                isOptionEqualToValue={(option, value) => {
                  if (!option || !value) return false;
                  return option.id === value.id;
                }}
                disablePortal
                renderInput={(params) => (
                  <StyledTextField
                    {...params}
                    label="Job Level"
                    required={true}
                    error={!!errors.job_level_id}
                    helperText={getErrorMessage(errors.job_level_id)}
                    sx={formStyles?.textField?.(isReadOnly) || {}}
                    InputProps={{
                      ...params.InputProps,
                      endAdornment: (
                        <>
                          {jobLevelsLoading && (
                            <CircularProgress color="inherit" size={20} />
                          )}
                          {params.InputProps.endAdornment}
                        </>
                      ),
                    }}
                  />
                )}
                noOptionsText={
                  jobLevelsLoading
                    ? "Loading job levels..."
                    : "No job levels found"
                }
              />
            )}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <Controller
            name="expected_salary"
            control={control}
            render={({ field }) => (
              <StyledTextField
                {...field}
                label="Expected Salary"
                required={true}
                fullWidth
                type="number"
                inputProps={expectedSalaryInputProps}
                error={!!errors.expected_salary}
                helperText={getErrorMessage(errors.expected_salary)}
                disabled={isReadOnly}
                sx={formStyles?.textField?.(isReadOnly) || {}}
              />
            )}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <Controller
            name="employment_type"
            control={control}
            render={({ field }) => (
              <StyledTextField
                select
                {...field}
                label="Employment Type"
                value={safeStringRender(field.value)}
                fullWidth
                required={true}
                error={!!errors.employment_type}
                helperText={getErrorMessage(errors.employment_type)}
                disabled={isReadOnly}
                sx={formStyles?.textField?.(isReadOnly) || {}}
                onChange={handleEmploymentTypeChange}>
                {employmentTypeOptions.map((option) => (
                  <MenuItem key={option} value={option}>
                    {safeStringRender(option)}
                  </MenuItem>
                ))}
              </StyledTextField>
            )}
          />
        </Grid>

        {(shouldShowReasonForChange() || shouldShowMovementFields()) && (
          <Grid item xs={12} md={6}>
            <Controller
              name="movement_reason_for_change"
              control={control}
              render={({ field }) => (
                <StyledTextField
                  select
                  {...field}
                  label="Reason for Change"
                  value={safeStringRender(field.value)}
                  fullWidth
                  required={true}
                  error={!!errors.movement_reason_for_change}
                  helperText={getErrorMessage(
                    errors.movement_reason_for_change
                  )}
                  disabled={isReadOnly}
                  sx={formStyles?.textField?.(isReadOnly) || {}}
                  onChange={handleReasonForChangeChange}>
                  {reasonForChangeOptions.map((option) => (
                    <MenuItem key={option} value={option}>
                      {safeStringRender(option)}
                    </MenuItem>
                  ))}
                </StyledTextField>
              )}
            />
          </Grid>
        )}

        <Grid item xs={12} md={6}>
          <Controller
            name="justification"
            control={control}
            render={({ field }) => (
              <StyledTextField
                {...field}
                label="Justification"
                required={true}
                fullWidth
                multiline
                rows={3}
                error={!!errors.justification}
                helperText={getErrorMessage(errors.justification)}
                disabled={isReadOnly}
                sx={formStyles?.textField?.(isReadOnly) || {}}
              />
            )}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <Controller
            name="remarks"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Remarks"
                fullWidth
                multiline
                rows={3}
                error={!!errors.remarks}
                helperText={getErrorMessage(errors.remarks)}
                disabled={isReadOnly}
                sx={formStyles?.textField?.(isReadOnly) || {}}
              />
            )}
          />
        </Grid>

        <Grid item xs={12} sx={formStyles?.attachmentContainer || {}}>
          <AttachmentField
            selectedEntry={selectedEntry}
            onFileChange={onFileChange}
            selectedFile={selectedFile}
            disabled={isViewMode}
            onFileViewerOpen={handleFileViewerOpen}
          />
        </Grid>

        {(shouldShowReasonForChange() || shouldShowMovementFields()) && (
          <Grid item xs={12} md={6} sx={formStyles?.checkboxContainer || {}}>
            <Controller
              name="movement_is_da"
              control={control}
              render={({ field }) => (
                <FormControlLabel
                  control={
                    <Checkbox
                      {...field}
                      checked={Boolean(field.value)}
                      disabled={isReadOnly}
                    />
                  }
                  label="FOR DEVELOPMENTAL ASSIGNMENT"
                  sx={formStyles?.checkboxLabel?.(isReadOnly) || {}}
                />
              )}
            />
          </Grid>
        )}

        {shouldShowDateFields() && (
          <>
            <Grid item xs={12} md={6} sx={{ pl: 4.4 }}>
              <Controller
                name="movement_da_start_date"
                control={control}
                render={({ field }) => (
                  <DatePicker
                    {...field}
                    label="Start Date"
                    disabled={isReadOnly}
                    renderInput={(params) => (
                      <StyledTextField
                        {...params}
                        required={true}
                        fullWidth
                        error={!!errors.movement_da_start_date}
                        helperText={getErrorMessage(
                          errors.movement_da_start_date
                        )}
                        sx={formStyles?.textField?.(isReadOnly) || {}}
                      />
                    )}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Controller
                name="movement_da_end_date"
                control={control}
                render={({ field }) => (
                  <DatePicker
                    {...field}
                    label="End Date"
                    disabled={isReadOnly}
                    minDate={
                      watch("movement_da_start_date")
                        ? watch("movement_da_start_date").add(1, "day")
                        : undefined
                    }
                    renderInput={(params) => (
                      <StyledTextField
                        {...params}
                        required={true}
                        fullWidth
                        error={!!errors.movement_da_end_date}
                        helperText={getErrorMessage(
                          errors.movement_da_end_date
                        )}
                        sx={formStyles?.textField?.(isReadOnly) || {}}
                      />
                    )}
                  />
                )}
              />
            </Grid>
          </>
        )}
      </Grid>

      <FileViewerDialog
        open={fileViewerOpen}
        onClose={handleFileViewerClose}
        selectedEntry={selectedEntry}
        selectedFile={selectedFile}
        currentFormSubmissionId={currentFormSubmissionId}
      />
    </>
  );
};

export default FormSubmissionFields;
