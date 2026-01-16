import { useState, useMemo, useCallback, useEffect } from "react";
import { useFormContext, Controller } from "react-hook-form";
import {
  Box,
  TextField,
  Autocomplete,
  MenuItem,
  FormControlLabel,
  Checkbox,
  CircularProgress,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs"; // IMPORTANT: Import dayjs
import { useLazyGetManpowerOptionsQuery } from "../../../../features/api/masterlist/positionsApi";
import { useLazyGetAllJobLevelsQuery } from "../../../../features/api/masterlist/jobLevelsApi";
import { useLazyGetAllRequisitionsQuery } from "../../../../features/api/extras/requisitionsApi";
import { useLazyGetAllEmployeesToBeReplacedQuery } from "../../../../features/api/employee/mainApi";
import { expectedSalaryInputProps } from "../../../../schema/approver/formSubmissionSchema";
import FileViewerDialog from "./FileViewerDialog";
import AttachmentField from "./AttachmentField";
import { formStyles } from "./FormSubmissionFieldStyles";

const safeStringRender = (value, fallback = "") => {
  if (typeof value === "string") return value;
  if (typeof value === "number") return value.toString();
  if (value && typeof value === "object") return fallback;
  return value || fallback;
};

// Helper function to convert string dates to dayjs objects
const parseDateValue = (value) => {
  if (!value) return null;
  if (dayjs.isDayjs(value)) return value;
  const parsed = dayjs(value);
  return parsed.isValid() ? parsed : null;
};

const FormSubmissionFields = ({
  mode,
  selectedEntry,
  onFileChange,
  selectedFile,
  disabled = false,
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
    movementPosition: false,
  });

  const watchedRequisitionType = watch("requisition_type_id");
  const watchedPositionId = watch("position_id");
  const watchedForDevelopmentalAssignment = watch("movement_is_da");

  const isReadOnly = mode === "view" || disabled;
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

  useEffect(() => {
    if (mode === "view" && selectedEntry?.submittable) {
      const submittable = selectedEntry.submittable;
      const replacementInfo = submittable.replacement_info;

      if (submittable.position_id || submittable.position) {
        setValue(
          "position_id",
          submittable.position || { id: submittable.position_id },
          { shouldValidate: false }
        );
      }

      if (submittable.job_level_id || submittable.job_level) {
        setValue(
          "job_level_id",
          submittable.job_level || { id: submittable.job_level_id },
          { shouldValidate: false }
        );
      }

      if (submittable.requisition_type_id || submittable.requisition_type) {
        setValue(
          "requisition_type_id",
          submittable.requisition_type || {
            id: submittable.requisition_type_id,
          },
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

      if (submittable.position_id && submittable.requisition_type_id) {
        triggerGetEmployees({
          position_id: submittable.position_id,
          requisition_type_id: submittable.requisition_type_id,
          ...(selectedEntry?.id && { current_mrf_id: selectedEntry.id }),
        });
      }

      if (
        replacementInfo?.type === "employee_movement" &&
        replacementInfo.details
      ) {
        const employeeData = replacementInfo.details.employee;
        const newPositionData = replacementInfo.details.new_position;

        if (employeeData) {
          setValue("movement_employee_id", {
            id: employeeData.id,
            full_name: employeeData.full_name,
            employee_code: employeeData.employee_code,
          });
        }

        if (newPositionData) {
          setValue("movement_new_position_id", {
            id: newPositionData.id,
            code: newPositionData.code,
            title: newPositionData.title,
            title_with_unit: newPositionData.title_with_unit,
          });
        }

        if (replacementInfo.details.reason_for_change) {
          setValue(
            "movement_reason_for_change",
            replacementInfo.details.reason_for_change
          );
        }

        // FIXED: Convert string dates to dayjs objects
        if (replacementInfo.details.da_start_date) {
          const startDate = parseDateValue(
            replacementInfo.details.da_start_date
          );
          setValue("movement_da_start_date", startDate, {
            shouldValidate: false,
          });
        }

        if (replacementInfo.details.da_end_date) {
          const endDate = parseDateValue(replacementInfo.details.da_end_date);
          setValue("movement_da_end_date", endDate, { shouldValidate: false });
        }

        if (
          replacementInfo.details.da_start_date ||
          replacementInfo.details.da_end_date
        ) {
          setValue("movement_is_da", true);
        }
      } else if (
        replacementInfo?.type === "direct_replacement" &&
        replacementInfo.details?.employee
      ) {
        const employeeData = replacementInfo.details.employee;
        setValue("employee_to_be_replaced_id", {
          id: employeeData.id,
          full_name: employeeData.full_name,
          employee_code: employeeData.employee_code,
        });
      }
    }
  }, [mode, selectedEntry, setValue, triggerGetEmployees]);

  const handleDropdownFocus = useCallback(
    (dropdownName) => {
      if (!shouldLoadDropdowns || dropdownsLoaded[dropdownName]) return;

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
        default:
          break;
      }
    },
    [
      dropdownsLoaded,
      shouldLoadDropdowns,
      watchedPositionId,
      watchedRequisitionType,
      selectedEntry?.id,
      triggerGetRequisitions,
      triggerGetPositions,
      triggerGetJobLevels,
      triggerGetEmployees,
    ]
  );

  const isReplacementDueToEmployeeMovement = useCallback(() => {
    if (!watchedRequisitionType) return false;
    return (
      watchedRequisitionType.name === "REPLACEMENT DUE TO EMPLOYEE MOVEMENT"
    );
  }, [watchedRequisitionType]);

  const isAdditionalManpower = useCallback(() => {
    if (!watchedRequisitionType) return false;
    return watchedRequisitionType.name === "ADDITIONAL MANPOWER";
  }, [watchedRequisitionType]);

  const shouldShowMovementFields = useCallback(() => {
    return isReplacementDueToEmployeeMovement();
  }, [isReplacementDueToEmployeeMovement]);

  const shouldShowDateFields = useCallback(() => {
    return (
      isReplacementDueToEmployeeMovement() && watchedForDevelopmentalAssignment
    );
  }, [isReplacementDueToEmployeeMovement, watchedForDevelopmentalAssignment]);

  const shouldShowReasonForChange = useCallback(() => {
    return isReplacementDueToEmployeeMovement();
  }, [isReplacementDueToEmployeeMovement]);

  const handleFileViewerOpen = useCallback(() => {
    const formSubmissionId = selectedEntry?.id;
    if (formSubmissionId) {
      setCurrentFormSubmissionId(formSubmissionId);
      setFileViewerOpen(true);
    }
  }, [selectedEntry?.id]);

  const handleFileViewerClose = useCallback(() => {
    setFileViewerOpen(false);
    setCurrentFormSubmissionId(null);
  }, []);

  const handleEmploymentTypeChange = useCallback(
    (event) => {
      if (disabled) return;
      const value = event.target.value;
      setValue("employment_type", value, { shouldValidate: false });
      if (value && value !== "") {
        clearErrors("employment_type");
      }
    },
    [disabled, setValue, clearErrors]
  );

  const handleReasonForChangeChange = useCallback(
    (event) => {
      if (disabled) return;
      const value = event.target.value;
      setValue("movement_reason_for_change", value, { shouldValidate: false });
      if (value && value !== "") {
        clearErrors("movement_reason_for_change");
      }
    },
    [disabled, setValue, clearErrors]
  );

  const getErrorMessage = useCallback((error) => {
    if (!error) return "";
    if (typeof error.message === "string") return error.message;
    if (typeof error === "string") return error;
    if (error && typeof error === "object") return "Validation error";
    return "";
  }, []);

  const StyledTextField = useCallback(
    ({ label, required = false, ...props }) => (
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
    ),
    [isViewMode]
  );

  const employmentTypeOptions = useMemo(
    () => [
      "REGULAR",
      "PROBATIONARY",
      "PROJECT-BASED",
      "SEASONAL",
      "FIXED-TERM",
      "CASUAL",
    ],
    []
  );

  const reasonForChangeOptions = useMemo(
    () => [
      "PROMOTION",
      "DEMOTION",
      "TRANSFER",
      "REASSIGNMENT",
      "LATERAL MOVE",
      "ACTING CAPACITY",
      "SECONDMENT",
    ],
    []
  );

  return (
    <>
      <Box sx={{ width: "100%", ...(formStyles?.container || {}) }}>
        <Box sx={{ mb: 3 }}>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)" },
              gap: 2,
            }}>
            <Box>
              <Controller
                name="requisition_type_id"
                control={control}
                render={({ field: { onChange, value } }) => (
                  <Autocomplete
                    onChange={(event, item) => {
                      if (isReadOnly || isEditMode) return;
                      onChange(item);
                      if (item) {
                        setValue("employee_to_be_replaced_id", null, {
                          shouldValidate: false,
                        });
                        setValue("movement_employee_id", null, {
                          shouldValidate: false,
                        });
                        setDropdownsLoaded((prev) => ({
                          ...prev,
                          employees: false,
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
                        fullWidth
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
            </Box>

            <Box>
              <Controller
                name="position_id"
                control={control}
                render={({ field: { onChange, value } }) => (
                  <Autocomplete
                    onChange={(event, item) => {
                      if (isReadOnly || isEditMode) return;
                      onChange(item);
                      setValue("employee_to_be_replaced_id", null, {
                        shouldValidate: false,
                      });
                      setValue("movement_employee_id", null, {
                        shouldValidate: false,
                      });
                      setDropdownsLoaded((prev) => ({
                        ...prev,
                        employees: false,
                      }));
                    }}
                    onOpen={() => handleDropdownFocus("positions")}
                    value={value || null}
                    disabled={
                      isReadOnly || isEditMode || !watchedRequisitionType
                    }
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
                        fullWidth
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
            </Box>

            <Box>
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
                          option?.full_name ||
                            option?.name ||
                            option?.employee_name
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
                          fullWidth
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
                          option?.full_name ||
                            option?.name ||
                            option?.employee_name
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
                          fullWidth
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
            </Box>

            {shouldShowMovementFields() && (
              <Box>
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
                          fullWidth
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
              </Box>
            )}

            <Box>
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
                        fullWidth
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
            </Box>
          </Box>
        </Box>

        <Box sx={{ mb: 3 }}>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)" },
              gap: 2,
            }}>
            <Box>
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
            </Box>

            <Box>
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
            </Box>

            {(shouldShowReasonForChange() || shouldShowMovementFields()) && (
              <Box>
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
              </Box>
            )}

            <Box>
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
            </Box>

            <Box>
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
            </Box>

            {(shouldShowReasonForChange() || shouldShowMovementFields()) && (
              <Box
                sx={{
                  gridColumn: "1 / -1",
                  ...(formStyles?.checkboxContainer || {}),
                }}>
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
              </Box>
            )}

            {shouldShowDateFields() && (
              <Box sx={{ pl: { sm: 4.4 } }}>
                <Controller
                  name="movement_da_start_date"
                  control={control}
                  render={({ field }) => (
                    <DatePicker
                      {...field}
                      label="Start Date"
                      disabled={isReadOnly}
                      value={field.value || null}
                      onChange={(newValue) => {
                        field.onChange(newValue);
                      }}
                      slotProps={{
                        textField: {
                          required: true,
                          fullWidth: true,
                          error: !!errors.movement_da_start_date,
                          helperText: getErrorMessage(
                            errors.movement_da_start_date
                          ),
                          sx: formStyles?.textField?.(isReadOnly) || {},
                        },
                      }}
                    />
                  )}
                />
              </Box>
            )}

            {shouldShowDateFields() && (
              <Box>
                <Controller
                  name="movement_da_end_date"
                  control={control}
                  render={({ field }) => (
                    <DatePicker
                      {...field}
                      label="End Date"
                      disabled={isReadOnly}
                      value={field.value || null}
                      onChange={(newValue) => {
                        field.onChange(newValue);
                      }}
                      minDate={
                        watch("movement_da_start_date")
                          ? dayjs(watch("movement_da_start_date")).add(1, "day")
                          : undefined
                      }
                      slotProps={{
                        textField: {
                          required: true,
                          fullWidth: true,
                          error: !!errors.movement_da_end_date,
                          helperText: getErrorMessage(
                            errors.movement_da_end_date
                          ),
                          sx: formStyles?.textField?.(isReadOnly) || {},
                        },
                      }}
                    />
                  )}
                />
              </Box>
            )}
          </Box>
        </Box>

        <Box sx={{ mb: 3, ...(formStyles?.attachmentContainer || {}) }}>
          <AttachmentField
            selectedEntry={selectedEntry}
            onFileChange={onFileChange}
            selectedFile={selectedFile}
            disabled={isViewMode}
            onFileViewerOpen={handleFileViewerOpen}
          />
        </Box>
      </Box>

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
