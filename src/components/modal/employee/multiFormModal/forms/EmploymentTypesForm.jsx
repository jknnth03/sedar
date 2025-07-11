import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  Box,
  Alert,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Grid,
  InputAdornment,
  FormHelperText,
  Button,
  IconButton,
  Typography,
} from "@mui/material";
import {
  CalendarToday as CalendarIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import { useFormContext, Controller, useFieldArray } from "react-hook-form";
import { useSnackbar } from "notistack";
import "./General.scss";

let idCounter = 0;
const generateUniqueId = (prefix = "employment") => {
  idCounter++;
  return `${prefix}_${Date.now()}_${idCounter}_${Math.random()
    .toString(36)
    .substr(2, 9)}`;
};

const formatDateForInput = (dateValue) => {
  if (!dateValue) return "";

  if (typeof dateValue === "string" && /^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
    return dateValue;
  }

  const date = new Date(dateValue);
  if (isNaN(date.getTime())) return "";

  return date.toISOString().split("T")[0];
};

const EmploymentTypesForm = ({
  selectedEmploymentType,
  isLoading = false,
  mode = "create",
  employeeData,
  onValidationChange,
}) => {
  const { enqueueSnackbar } = useSnackbar();
  const {
    control,
    watch,
    setValue,
    getValues,
    clearErrors,
    setError,
    trigger,
    formState: { errors },
  } = useFormContext();

  const { fields, append, remove, replace } = useFieldArray({
    control,
    name: "employment_types",
  });

  const [errorMessage, setErrorMessage] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const hasInitializedData = useRef(false);
  const lastInitializedMode = useRef(null);
  const lastInitializedData = useRef(null);
  const watchedEmploymentTypes = watch("employment_types");

  // Modified employment type options based on mode
  const getEmploymentTypeLabelOptions = (mode) => {
    if (mode === "create") {
      // Remove "REGULAR" option for create mode
      return ["PROBATIONARY", "AGENCY HIRED", "PROJECT BASED"];
    }
    return ["PROBATIONARY", "AGENCY HIRED", "PROJECT BASED", "REGULAR"];
  };

  const isReadOnly = mode === "view";
  const isFieldDisabled = isLoading || isReadOnly;

  const getCurrentDate = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };

  const getMaxDate = () => {
    const today = new Date();
    const nextYear = today.getFullYear() + 1;
    return `${nextYear}-12-31`;
  };

  const isDateBeyondNextYear = (dateString) => {
    if (!dateString) return false;
    const inputDate = new Date(dateString);
    const currentYear = new Date().getFullYear();
    const nextYear = currentYear + 1;
    return inputDate.getFullYear() > nextYear;
  };

  const isDateInPast = (dateString) => {
    if (!dateString) return false;
    const inputDate = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return inputDate < today;
  };

  const isDateBeforeStartDate = (dateString, startDate) => {
    if (!dateString || !startDate) return false;
    const inputDate = new Date(dateString);
    const startDateObj = new Date(startDate);
    return inputDate < startDateObj;
  };

  const getProbationaryStartDate = () => {
    const currentEmploymentTypes = getValues("employment_types") || [];
    const probationaryEntry = currentEmploymentTypes.find(
      (emp) => emp.employment_type_label === "PROBATIONARY"
    );
    return probationaryEntry?.employment_start_date || null;
  };

  const getRegularizationDateConstraints = () => {
    const probationaryStartDate = getProbationaryStartDate();
    const today = getCurrentDate();

    let minDate = today;
    if (probationaryStartDate) {
      minDate = probationaryStartDate > today ? probationaryStartDate : today;
    }

    return {
      min: minDate,
      max: getMaxDate(),
      probationaryStartDate,
    };
  };

  const getAvailableEmploymentTypes = (currentIndex) => {
    const currentEmploymentTypes = getValues("employment_types") || [];
    const baseOptions = getEmploymentTypeLabelOptions(mode);

    const usedTypes = currentEmploymentTypes
      .map((emp, index) => {
        if (index !== currentIndex && emp.employment_type_label) {
          return emp.employment_type_label;
        }
        return null;
      })
      .filter(Boolean);

    return baseOptions.filter((type) => !usedTypes.includes(type));
  };

  const handleDateValidation = (value, field, index) => {
    if (isReadOnly) return true;

    if (value && isDateBeyondNextYear(value)) {
      const currentYear = new Date().getFullYear();
      const nextYear = currentYear + 1;
      enqueueSnackbar(
        `Cannot select dates beyond ${nextYear}. Current year is ${currentYear}.`,
        { variant: "error" }
      );
      return false;
    }

    if (field === "employment_start_date" && value && isDateInPast(value)) {
      enqueueSnackbar("Cannot select past dates for employment start date.", {
        variant: "error",
      });
      return false;
    }

    if (field === "employment_end_date" && value && index !== undefined) {
      const currentEmploymentTypes = getValues("employment_types") || [];
      const startDate = currentEmploymentTypes[index]?.employment_start_date;
      if (startDate && isDateBeforeStartDate(value, startDate)) {
        enqueueSnackbar("End date cannot be before start date.", {
          variant: "error",
        });
        return false;
      }
    }

    if (field === "regularization_date" && value) {
      const probationaryStartDate = getProbationaryStartDate();

      if (isDateInPast(value)) {
        enqueueSnackbar("Cannot select past dates for regularization date.", {
          variant: "error",
        });
        return false;
      }

      if (
        probationaryStartDate &&
        isDateBeforeStartDate(value, probationaryStartDate)
      ) {
        enqueueSnackbar(
          "Regularization date cannot be before probationary start date.",
          { variant: "error" }
        );
        return false;
      }

      if (!probationaryStartDate) {
        enqueueSnackbar(
          "Please add a probationary employment entry first to set regularization date constraints.",
          { variant: "warning" }
        );
      }
    }

    return true;
  };

  const initializeEmptyForm = useCallback(() => {
    // Only initialize empty form if there's no existing data
    const currentEmploymentTypes = getValues("employment_types") || [];
    const hasValidData = currentEmploymentTypes.some(
      (emp) =>
        emp.employment_type_label ||
        emp.employment_start_date ||
        emp.employment_end_date ||
        emp.regularization_date
    );

    if (!hasValidData) {
      const emptyLine = {
        id: generateUniqueId(),
        index: 0,
        employment_type_label: "",
        employment_start_date: "",
        employment_end_date: "",
        regularization_date: "",
      };
      replace([emptyLine]);
    }

    clearErrors("employment_types");
    setErrorMessage(null);
    setIsInitialized(true);
  }, [replace, clearErrors, getValues]);

  const initializeWithEmployeeData = useCallback(
    (employeeData) => {
      if (
        employeeData?.employment_types &&
        Array.isArray(employeeData.employment_types) &&
        employeeData.employment_types.length > 0
      ) {
        const newEmploymentLines = employeeData.employment_types.map(
          (employment, index) => ({
            id:
              employment.id || generateUniqueId(`employee_employment_${index}`),
            index: index,
            employment_type_label: employment.employment_type_label || "",
            employment_start_date: formatDateForInput(
              employment.employment_start_date
            ),
            employment_end_date: formatDateForInput(
              employment.employment_end_date
            ),
            regularization_date: formatDateForInput(
              employment.regularization_date
            ),
          })
        );
        replace(newEmploymentLines);
      } else {
        initializeEmptyForm();
      }
      clearErrors("employment_types");
      setErrorMessage(null);
      setIsInitialized(true);
    },
    [replace, clearErrors, initializeEmptyForm]
  );

  // Check if we need to reinitialize based on mode or data changes
  const shouldReinitialize = useCallback(() => {
    // Don't reinitialize if we're already initialized and in the same mode
    if (isInitialized && lastInitializedMode.current === mode) {
      // For edit/view modes, check if the employee data has actually changed
      if (mode === "edit" || mode === "view") {
        const currentDataString = JSON.stringify(
          employeeData?.employment_types || []
        );
        const lastDataString = JSON.stringify(
          lastInitializedData.current || []
        );
        return currentDataString !== lastDataString;
      }
      return false;
    }
    return true;
  }, [isInitialized, mode, employeeData]);

  // Initialize form data on mount and when necessary
  useEffect(() => {
    if (!hasInitializedData.current || shouldReinitialize()) {
      console.log("Initializing employment form:", {
        mode,
        hasData: !!employeeData,
      });

      if (mode === "create") {
        initializeEmptyForm();
      } else if (mode === "edit" || mode === "view") {
        if (employeeData && employeeData.employment_types) {
          initializeWithEmployeeData(employeeData);
        } else {
          initializeEmptyForm();
        }
      }

      hasInitializedData.current = true;
      lastInitializedMode.current = mode;
      lastInitializedData.current = employeeData?.employment_types || [];
    }
  }, [
    mode,
    employeeData,
    initializeEmptyForm,
    initializeWithEmployeeData,
    shouldReinitialize,
  ]);

  useEffect(() => {
    if (!isReadOnly && watchedEmploymentTypes && isInitialized) {
      watchedEmploymentTypes.forEach((employment, index) => {
        const employmentTypeLabel = employment?.employment_type_label;

        if (employmentTypeLabel && employmentTypeLabel !== "REGULAR") {
          const currentRegularizationDate = employment?.regularization_date;
          if (currentRegularizationDate) {
            setValue(`employment_types.${index}.regularization_date`, "", {
              shouldValidate: false,
            });
          }
        }

        if (employmentTypeLabel === "REGULAR") {
          const currentStartDate = employment?.employment_start_date;
          const currentEndDate = employment?.employment_end_date;
          if (currentStartDate) {
            setValue(`employment_types.${index}.employment_start_date`, "", {
              shouldValidate: false,
            });
          }
          if (currentEndDate) {
            setValue(`employment_types.${index}.employment_end_date`, "", {
              shouldValidate: false,
            });
          }
        }
      });
    }
  }, [watchedEmploymentTypes, setValue, isReadOnly, isInitialized]);

  const addEmploymentLine = useCallback(() => {
    if (isReadOnly || mode === "create") return; // Prevent adding lines in create mode

    const currentEmploymentTypes = getValues("employment_types") || [];
    const newIndex = currentEmploymentTypes.length;
    const newLine = {
      id: generateUniqueId(`new_employment_${newIndex}`),
      index: newIndex,
      employment_type_label: "",
      employment_start_date: "",
      employment_end_date: "",
      regularization_date: "",
    };
    append(newLine);

    setTimeout(() => {
      trigger("employment_types");
    }, 100);
  }, [getValues, append, isReadOnly, mode, trigger]);

  const removeEmploymentLine = useCallback(
    (index) => {
      if (isReadOnly) return;

      // In edit mode, prevent removal of the first line (index 0)
      if (mode === "edit" && index === 0) return;

      const currentEmploymentTypes = getValues("employment_types") || [];
      if (currentEmploymentTypes.length > 1) {
        remove(index);

        setTimeout(() => {
          trigger("employment_types");
        }, 100);
      }
    },
    [getValues, remove, isReadOnly, mode, trigger]
  );

  const validateEmploymentLine = useCallback((line) => {
    if (!line || !line.employment_type_label) return false;

    if (line.employment_type_label === "REGULAR") {
      return !!line.regularization_date;
    } else {
      return !!line.employment_start_date;
    }
  }, []);

  const isFormValid = React.useMemo(() => {
    const employmentTypes = watchedEmploymentTypes || [];
    return (
      employmentTypes.length > 0 &&
      employmentTypes.every(validateEmploymentLine)
    );
  }, [watchedEmploymentTypes, validateEmploymentLine]);

  useEffect(() => {
    if (onValidationChange) {
      onValidationChange(isFormValid);
    }
  }, [isFormValid, onValidationChange]);

  useEffect(() => {
    console.log("EmploymentTypesForm - Current state:", {
      isInitialized,
      mode,
      fieldsCount: fields.length,
      watchedData: watchedEmploymentTypes,
      hasInitializedData: hasInitializedData.current,
    });
  }, [isInitialized, mode, fields.length, watchedEmploymentTypes]);

  if (!isInitialized && (mode === "edit" || mode === "view")) {
    return (
      <Box sx={{ p: 2, textAlign: "center" }}>
        <Typography>Loading employment data...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      {errorMessage && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {errorMessage}
        </Alert>
      )}

      {fields.map((field, index) => {
        const currentEmploymentType = watchedEmploymentTypes?.[index];
        const isRegular =
          currentEmploymentType?.employment_type_label === "REGULAR";
        const isNonRegular =
          currentEmploymentType?.employment_type_label && !isRegular;
        const isEndDateRequired =
          currentEmploymentType?.employment_type_label === "PROBATIONARY" ||
          currentEmploymentType?.employment_type_label === "AGENCY HIRED" ||
          currentEmploymentType?.employment_type_label === "PROJECT BASED";

        const regularizationConstraints = getRegularizationDateConstraints();
        const availableEmploymentTypes = getAvailableEmploymentTypes(index);

        // Check if this is the first line in edit mode
        const isFirstLineInEdit = mode === "edit" && index === 0;

        return (
          <Box
            key={field.id}
            sx={{ mb: 2, border: "1px solid #e0e0e0", borderRadius: 2, p: 2 }}>
            <Grid container spacing={2} sx={{ alignItems: "flex-start" }}>
              <Grid
                item
                xs={12}
                sm={3}
                sx={{ minWidth: "520px", maxWidth: "520px" }}>
                <Controller
                  name={`employment_types.${index}.employment_type_label`}
                  control={control}
                  rules={{ required: "Employment type is required" }}
                  render={({ field: controllerField, fieldState }) => (
                    <FormControl
                      className="general-form__text-field"
                      fullWidth
                      variant="outlined"
                      disabled={isFieldDisabled || isFirstLineInEdit}
                      error={!!fieldState.error}>
                      <InputLabel>
                        Employment Type Label{" "}
                        <span style={{ color: "red" }}>*</span>
                      </InputLabel>
                      <Select
                        {...controllerField}
                        label="Employment Type Label *"
                        readOnly={isReadOnly || isFirstLineInEdit}
                        sx={{
                          borderRadius: 2,
                          ...(isFirstLineInEdit && {
                            backgroundColor: "#f5f5f5",
                            "& .MuiOutlinedInput-notchedOutline": {
                              borderColor: "#e0e0e0",
                            },
                          }),
                        }}
                        onChange={(e) => {
                          if (!isFirstLineInEdit) {
                            controllerField.onChange(e);
                            // Trigger validation after a short delay
                            setTimeout(() => {
                              trigger(
                                `employment_types.${index}.employment_type_label`
                              );
                            }, 100);
                          }
                        }}>
                        <MenuItem value="">
                          <em>Select Employment Type</em>
                        </MenuItem>
                        {availableEmploymentTypes.map((label) => (
                          <MenuItem key={label} value={label}>
                            {label}
                          </MenuItem>
                        ))}
                      </Select>
                      {fieldState.error && (
                        <FormHelperText error>
                          {fieldState.error.message}
                        </FormHelperText>
                      )}
                    </FormControl>
                  )}
                />
              </Grid>

              {!isRegular && (
                <Grid item xs={12} sm={4}>
                  <Controller
                    name={`employment_types.${index}.employment_start_date`}
                    control={control}
                    rules={{
                      required: "Employment start date is required",
                    }}
                    render={({ field: controllerField, fieldState }) => (
                      <TextField
                        {...controllerField}
                        className="general-form__text-field"
                        label={
                          <>
                            Employment Start Date{" "}
                            <span style={{ color: "red" }}>*</span>
                          </>
                        }
                        type="date"
                        variant="outlined"
                        fullWidth
                        disabled={isFieldDisabled || isFirstLineInEdit}
                        error={!!fieldState.error}
                        helperText={
                          fieldState.error?.message ||
                          "Cannot select past dates"
                        }
                        inputProps={{
                          min: getCurrentDate(),
                          max: getMaxDate(),
                        }}
                        InputLabelProps={{
                          shrink: true,
                        }}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <CalendarIcon />
                            </InputAdornment>
                          ),
                          readOnly: isReadOnly || isFirstLineInEdit,
                        }}
                        onChange={(e) => {
                          if (
                            !isReadOnly &&
                            !isFirstLineInEdit &&
                            handleDateValidation(
                              e.target.value,
                              "employment_start_date",
                              index
                            )
                          ) {
                            controllerField.onChange(e);
                            setTimeout(() => {
                              trigger(
                                `employment_types.${index}.employment_start_date`
                              );
                            }, 100);
                          }
                        }}
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            borderRadius: 2,
                            ...(isFirstLineInEdit && {
                              backgroundColor: "#f5f5f5",
                              "& .MuiOutlinedInput-notchedOutline": {
                                borderColor: "#e0e0e0",
                              },
                            }),
                          },
                        }}
                      />
                    )}
                  />
                </Grid>
              )}

              {!isRegular && (
                <Grid item xs={12} sm={4}>
                  <Controller
                    name={`employment_types.${index}.employment_end_date`}
                    control={control}
                    rules={{
                      required: isEndDateRequired
                        ? "Employment end date is required"
                        : false,
                    }}
                    render={({ field: controllerField, fieldState }) => (
                      <TextField
                        {...controllerField}
                        className="general-form__text-field"
                        label={
                          <>
                            Employment End Date{" "}
                            {isEndDateRequired && (
                              <span style={{ color: "red" }}>*</span>
                            )}
                          </>
                        }
                        type="date"
                        variant="outlined"
                        fullWidth
                        disabled={isFieldDisabled || isFirstLineInEdit}
                        error={!!fieldState.error}
                        helperText={
                          fieldState.error?.message ||
                          (isEndDateRequired
                            ? "Required and cannot be before start date"
                            : "Cannot be before start date")
                        }
                        inputProps={{
                          min:
                            currentEmploymentType?.employment_start_date ||
                            getCurrentDate(),
                          max: getMaxDate(),
                        }}
                        InputLabelProps={{
                          shrink: true,
                        }}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <CalendarIcon />
                            </InputAdornment>
                          ),
                          readOnly: isReadOnly || isFirstLineInEdit,
                        }}
                        onChange={(e) => {
                          if (
                            !isReadOnly &&
                            !isFirstLineInEdit &&
                            handleDateValidation(
                              e.target.value,
                              "employment_end_date",
                              index
                            )
                          ) {
                            controllerField.onChange(e);
                            setTimeout(() => {
                              trigger(
                                `employment_types.${index}.employment_end_date`
                              );
                            }, 100);
                          }
                        }}
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            borderRadius: 2,
                            ...(isFirstLineInEdit && {
                              backgroundColor: "#f5f5f5",
                              "& .MuiOutlinedInput-notchedOutline": {
                                borderColor: "#e0e0e0",
                              },
                            }),
                          },
                        }}
                      />
                    )}
                  />
                </Grid>
              )}

              {isRegular && (
                <Grid item xs={12} sm={4}>
                  <Controller
                    name={`employment_types.${index}.regularization_date`}
                    control={control}
                    rules={{
                      required: "Regularization date is required",
                    }}
                    render={({ field: controllerField, fieldState }) => (
                      <TextField
                        {...controllerField}
                        className="general-form__text-field"
                        label={
                          <>
                            Regularization Date{" "}
                            <span style={{ color: "red" }}>*</span>
                          </>
                        }
                        type="date"
                        variant="outlined"
                        fullWidth
                        disabled={isFieldDisabled || isFirstLineInEdit}
                        error={!!fieldState.error}
                        helperText={
                          fieldState.error?.message ||
                          (regularizationConstraints.probationaryStartDate
                            ? "Required and cannot be before probationary start date or in the past"
                            : "Required for regular employees. Add probationary employment first for proper validation.")
                        }
                        inputProps={{
                          min: regularizationConstraints.min,
                          max: regularizationConstraints.max,
                        }}
                        InputLabelProps={{
                          shrink: true,
                        }}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <CalendarIcon />
                            </InputAdornment>
                          ),
                          readOnly: isReadOnly || isFirstLineInEdit,
                        }}
                        onChange={(e) => {
                          if (
                            !isReadOnly &&
                            !isFirstLineInEdit &&
                            handleDateValidation(
                              e.target.value,
                              "regularization_date",
                              index
                            )
                          ) {
                            controllerField.onChange(e);
                            setTimeout(() => {
                              trigger(
                                `employment_types.${index}.regularization_date`
                              );
                            }, 100);
                          }
                        }}
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            borderRadius: 2,
                            ...(isFirstLineInEdit && {
                              backgroundColor: "#f5f5f5",
                              "& .MuiOutlinedInput-notchedOutline": {
                                borderColor: "#e0e0e0",
                              },
                            }),
                          },
                        }}
                      />
                    )}
                  />
                </Grid>
              )}

              {!isReadOnly && (
                <Grid item xs={12}>
                  <Box
                    sx={{
                      display: "flex",
                      gap: 1,
                      mt: 2,
                      justifyContent: "flex-start",
                    }}>
                    {/* Remove Line Button - only show if not first line in edit mode and has more than 1 line */}
                    {fields.length > 1 && !(mode === "edit" && index === 0) && (
                      <Button
                        onClick={() => removeEmploymentLine(index)}
                        disabled={isFieldDisabled}
                        variant="contained"
                        size="small"
                        startIcon={<DeleteIcon />}
                        sx={{
                          width: "1056px",
                          height: "50px",
                          backgroundColor: "rgb(220, 53, 69)",
                          color: "#fff !important",
                          "&:hover": {
                            backgroundColor: "rgb(200, 35, 51)",
                            color: "#fff !important",
                          },
                        }}
                        title="Remove this employment line">
                        Remove Line
                      </Button>
                    )}
                    {/* Add Line Button - only show in edit mode on last line and if there are available types */}
                    {mode === "edit" &&
                      index === fields.length - 1 &&
                      availableEmploymentTypes.length > 0 && (
                        <Button
                          onClick={addEmploymentLine}
                          disabled={isFieldDisabled}
                          variant="contained"
                          size="small"
                          startIcon={<AddIcon />}
                          sx={{
                            width: "1056px",
                            height: "50px",
                            backgroundColor: "rgb(40, 167, 69)",
                            color: "#fff !important",
                            "&:hover": {
                              backgroundColor: "rgb(34, 142, 58)",
                              color: "#fff !important",
                            },
                          }}
                          title="Add new employment line">
                          Add Line
                        </Button>
                      )}
                  </Box>
                </Grid>
              )}
            </Grid>
          </Box>
        );
      })}
    </Box>
  );
};

export default EmploymentTypesForm;
