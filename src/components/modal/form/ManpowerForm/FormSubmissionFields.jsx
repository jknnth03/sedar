import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from "react";
import { useFormContext, Controller } from "react-hook-form";
import {
  Grid,
  TextField,
  Autocomplete,
  MenuItem,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { useGetManpowerOptionsQuery } from "../../../../features/api/masterlist/positionsApi";
import { useGetAllJobLevelsQuery } from "../../../../features/api/masterlist/jobLevelsApi";
import { useGetAllRequisitionsQuery } from "../../../../features/api/extras/requisitionsApi";
import { useLazyGetAllEmployeesToBeReplacedQuery } from "../../../../features/api/employee/mainApi";
import { useGetAllEmployeesQuery } from "../../../../features/api/approvalsetting/approvalFormApi";
import { expectedSalaryInputProps } from "../../../../schema/approver/formSubmissionSchema";
import FileViewerDialog from "./FileViewerDialog";
import AttachmentField from "./AttachmentField";
import {
  usePositions,
  useJobLevels,
  useRequisitions,
  useEmployees,
  useAllEmployees,
  useUnifiedFormLogic,
  useDropdownState,
  useFormOptions,
} from "./FormSubmissionFieldFunctions";
import { formStyles } from "./FormSubmissionFieldStyles";

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

  useEffect(() => {
    const subscription = watch((data) => {
      Object.entries(data).forEach(([key, value]) => {
        if (
          value &&
          typeof value === "object" &&
          !Array.isArray(value) &&
          key !== "movement_da_start_date" &&
          key !== "movement_da_end_date"
        ) {
        }
      });
    });

    return () => subscription.unsubscribe();
  }, [watch]);

  const [fileViewerOpen, setFileViewerOpen] = useState(false);
  const [currentFormSubmissionId, setCurrentFormSubmissionId] = useState(null);

  const watchedRequisitionType = watch("requisition_type_id");
  const watchedPositionId = watch("position_id");
  const watchedForDevelopmentalAssignment = watch("movement_is_da");

  const isReadOnly = mode === "view" || disabled;
  const isCreateMode = mode === "create";
  const isEditMode = mode === "edit";
  const isViewMode = mode === "view" || disabled;

  const {
    isInitialized,
    employeesDataFetched,
    setEmployeesDataFetched,
    isReplacementDueToEmployeeMovement,
    isAdditionalManpower,
    shouldHideEmployeeReplacement,
    shouldShowSelectEmployee,
    shouldShowReasonForChange,
    handleRequisitionTypeChange,
    handlePositionChange,
  } = useUnifiedFormLogic(mode, selectedEntry);

  const {
    data: positionsData,
    isLoading: positionsLoading,
    error: positionsError,
    isFetching: positionsFetching,
  } = useGetManpowerOptionsQuery(undefined, {
    skip: false,
  });

  const {
    data: jobLevelsData,
    isLoading: jobLevelsLoading,
    error: jobLevelsError,
    isFetching: jobLevelsFetching,
  } = useGetAllJobLevelsQuery(undefined, {
    skip: false,
  });

  const {
    data: requisitionsData,
    isLoading: requisitionsLoading,
    error: requisitionsError,
    isFetching: requisitionsFetching,
  } = useGetAllRequisitionsQuery(undefined, {
    skip: false,
  });

  const [
    triggerEmployees,
    {
      data: employeesData,
      isLoading: employeesLoading,
      isFetching: employeesFetching,
    },
  ] = useLazyGetAllEmployeesToBeReplacedQuery();

  const {
    data: allEmployeesData,
    isLoading: allEmployeesLoading,
    error: allEmployeesError,
    isFetching: allEmployeesFetching,
  } = useGetAllEmployeesQuery(
    {
      pagination: false,
      status: "active",
    },
    {
      skip:
        !watchedRequisitionType ||
        watchedRequisitionType.name !== "REPLACEMENT DUE TO EMPLOYEE MOVEMENT",
    }
  );

  const positions = usePositions(mode, positionsData, selectedEntry);
  const jobLevels = useJobLevels(mode, jobLevelsData, selectedEntry);
  const requisitions = useRequisitions(mode, requisitionsData, selectedEntry);
  const employees = useEmployees(mode, employeesData, selectedEntry);
  const allEmployees = useAllEmployees(mode, allEmployeesData, selectedEntry);

  const {
    isAnyDropdownOpen,
    activeDropdown,
    handleDropdownOpen,
    handleDropdownClose,
    isDropdownDisabled,
  } = useDropdownState();

  const { employmentTypeOptions, reasonForChangeOptions } = useFormOptions();

  const isEssentialDataLoading =
    positionsLoading ||
    jobLevelsLoading ||
    requisitionsLoading ||
    positionsFetching ||
    jobLevelsFetching ||
    requisitionsFetching;

  const ensureArray = (data) => {
    return Array.isArray(data) ? data : [];
  };

  const safeRequisitionsOptions = useMemo(() => {
    return ensureArray(requisitions);
  }, [requisitions]);

  const safePositionsOptions = useMemo(() => {
    return ensureArray(positions);
  }, [positions]);

  const safeJobLevelsOptions = useMemo(() => {
    return ensureArray(jobLevels);
  }, [jobLevels]);

  const safeEmployeesOptions = useMemo(() => {
    return ensureArray(employees);
  }, [employees]);

  const safeAllEmployeesOptions = useMemo(() => {
    return ensureArray(allEmployees);
  }, [allEmployees]);

  const handleDropdownOpenWrapper = (dropdownName) => {
    return handleDropdownOpen(
      dropdownName,
      isEssentialDataLoading,
      employeesLoading,
      employeesFetching,
      allEmployeesLoading,
      allEmployeesFetching
    );
  };

  const isDropdownDisabledWrapper = (dropdownName) => {
    return isDropdownDisabled(
      dropdownName,
      isEssentialDataLoading,
      employeesLoading,
      employeesFetching,
      allEmployeesLoading,
      allEmployeesFetching
    );
  };

  const isReplacementDueToEmployeeMovementType = () => {
    return (
      watchedRequisitionType?.name === "REPLACEMENT DUE TO EMPLOYEE MOVEMENT"
    );
  };

  const shouldShowMovementFields = () => {
    return isReplacementDueToEmployeeMovementType();
  };

  const shouldShowDateFields = () => {
    return (
      isReplacementDueToEmployeeMovementType() &&
      watchedForDevelopmentalAssignment
    );
  };

  useEffect(() => {
    if (
      !isReadOnly &&
      !employeesDataFetched &&
      watchedPositionId?.id &&
      watchedRequisitionType?.id &&
      watchedRequisitionType.name !== "ADDITIONAL MANPOWER" &&
      watchedRequisitionType.name !== "REPLACEMENT DUE TO EMPLOYEE MOVEMENT"
    ) {
      triggerEmployees({
        position_id: watchedPositionId.id,
        requisition_type_id: watchedRequisitionType.id,
        ...(selectedEntry?.id && { current_mrf_id: selectedEntry.id }),
      });
      setEmployeesDataFetched(true);
    }
  }, [
    watchedPositionId?.id,
    watchedRequisitionType?.id,
    watchedRequisitionType?.name,
    isReadOnly,
    employeesDataFetched,
    triggerEmployees,
    selectedEntry?.id,
  ]);

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
    if (disabled || isEssentialDataLoading) return;
    const value = event.target.value;
    setValue("employment_type", value);
    if (value && value !== "") {
      clearErrors("employment_type");
    }
  };

  const handleReasonForChangeChange = (event) => {
    if (disabled || isEssentialDataLoading) return;
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
                  if (!isReadOnly && !isEditMode) {
                    onChange(item);
                    handleRequisitionTypeChange(item);
                  }
                }}
                onOpen={() => handleDropdownOpenWrapper("requisition")}
                onClose={handleDropdownClose}
                value={value || null}
                disabled={
                  isReadOnly ||
                  isEditMode ||
                  isDropdownDisabledWrapper("requisition")
                }
                options={safeRequisitionsOptions}
                loading={requisitionsLoading || requisitionsFetching}
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
                      readOnly: isReadOnly || isEditMode,
                    }}
                  />
                )}
                noOptionsText={
                  requisitionsLoading || requisitionsFetching
                    ? "Loading requisitions..."
                    : requisitionsError
                    ? "Error loading requisitions"
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
                  if (!isReadOnly && !isEditMode) {
                    onChange(item);
                    handlePositionChange(item);
                  }
                }}
                onOpen={() => handleDropdownOpenWrapper("position")}
                onClose={handleDropdownClose}
                value={value || null}
                disabled={
                  isReadOnly ||
                  isEditMode ||
                  !watchedRequisitionType ||
                  isDropdownDisabledWrapper("position")
                }
                options={safePositionsOptions}
                loading={positionsLoading || positionsFetching}
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
                      readOnly: isReadOnly || isEditMode,
                    }}
                  />
                )}
                noOptionsText={
                  positionsLoading || positionsFetching
                    ? "Loading positions..."
                    : positionsError
                    ? "Error loading positions"
                    : "No positions found"
                }
              />
            )}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          {watchedRequisitionType?.name ===
          "REPLACEMENT DUE TO EMPLOYEE MOVEMENT" ? (
            <Controller
              name="movement_employee_id"
              control={control}
              render={({ field: { onChange, value } }) => (
                <Autocomplete
                  onChange={(event, item) => {
                    if (!isReadOnly && !isEditMode) {
                      onChange(item);
                    }
                  }}
                  onOpen={() => handleDropdownOpenWrapper("allEmployees")}
                  onClose={handleDropdownClose}
                  value={value || null}
                  disabled={
                    isReadOnly ||
                    isEditMode ||
                    !watchedRequisitionType ||
                    isDropdownDisabledWrapper("allEmployees")
                  }
                  options={safeAllEmployeesOptions}
                  loading={allEmployeesLoading || allEmployeesFetching}
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
                        (!watchedRequisitionType
                          ? "Please select Requisition Type first"
                          : "") ||
                        (safeAllEmployeesOptions.length === 0 &&
                        !allEmployeesLoading &&
                        !allEmployeesFetching &&
                        watchedRequisitionType
                          ? "No employees available"
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
                        readOnly: isReadOnly || isEditMode,
                      }}
                    />
                  )}
                />
              )}
            />
          ) : watchedRequisitionType?.name !== "ADDITIONAL MANPOWER" ? (
            <Controller
              name="employee_to_be_replaced_id"
              control={control}
              render={({ field: { onChange, value } }) => (
                <Autocomplete
                  onChange={(event, item) => {
                    if (!isReadOnly && !isEditMode) {
                      onChange(item);
                    }
                  }}
                  onOpen={() => handleDropdownOpenWrapper("employee")}
                  onClose={handleDropdownClose}
                  value={value || null}
                  disabled={
                    isReadOnly ||
                    isEditMode ||
                    !watchedPositionId ||
                    !watchedRequisitionType ||
                    isDropdownDisabledWrapper("employee")
                  }
                  options={safeEmployeesOptions}
                  loading={employeesLoading || employeesFetching}
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
                      required={true}
                      error={!!errors.employee_to_be_replaced_id}
                      helperText={
                        getErrorMessage(errors.employee_to_be_replaced_id) ||
                        (!watchedPositionId || !watchedRequisitionType
                          ? "Please select Position and Requisition Type first"
                          : "") ||
                        (safeEmployeesOptions.length === 0 &&
                        !employeesLoading &&
                        !employeesFetching &&
                        watchedPositionId &&
                        watchedRequisitionType
                          ? "No employees available for replacement"
                          : "")
                      }
                      sx={formStyles?.textField?.() || {}}
                      InputProps={{
                        ...params.InputProps,
                        readOnly: isReadOnly || isEditMode,
                      }}
                    />
                  )}
                  noOptionsText={
                    employeesLoading || employeesFetching
                      ? "Loading employees..."
                      : !watchedPositionId || !watchedRequisitionType
                      ? "Select position and requisition type first"
                      : "No employees found"
                  }
                />
              )}
            />
          ) : null}
        </Grid>

        {shouldShowMovementFields() && (
          <Grid item xs={12} md={6}>
            <Controller
              name="movement_new_position_id"
              control={control}
              render={({ field: { onChange, value } }) => (
                <Autocomplete
                  onChange={(event, item) => {
                    if (!isReadOnly) {
                      onChange(item);
                    }
                  }}
                  onOpen={() => handleDropdownOpenWrapper("movementPosition")}
                  onClose={handleDropdownClose}
                  value={value || null}
                  disabled={
                    isReadOnly || isDropdownDisabledWrapper("movementPosition")
                  }
                  options={safePositionsOptions}
                  loading={positionsLoading || positionsFetching}
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
                        readOnly: isReadOnly,
                      }}
                    />
                  )}
                  noOptionsText={
                    positionsLoading || positionsFetching
                      ? "Loading positions..."
                      : positionsError
                      ? "Error loading positions"
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
                  if (!isReadOnly) {
                    onChange(item);
                  }
                }}
                onOpen={() => handleDropdownOpenWrapper("jobLevel")}
                onClose={handleDropdownClose}
                value={value || null}
                disabled={isReadOnly || isDropdownDisabledWrapper("jobLevel")}
                options={safeJobLevelsOptions}
                loading={jobLevelsLoading || jobLevelsFetching}
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
                      readOnly: isReadOnly,
                    }}
                  />
                )}
                noOptionsText={
                  jobLevelsLoading || jobLevelsFetching
                    ? "Loading job levels..."
                    : jobLevelsError
                    ? "Error loading job levels"
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
