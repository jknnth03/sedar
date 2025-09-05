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

let idCounter = 0;
const generateUniqueId = (prefix = "pending_employment") => {
  idCounter++;
  return `${prefix}_${Date.now()}_${idCounter}_${Math.random()
    .toString(36)
    .substr(2, 9)}`;
};

const formatDateForInput = (dateValue) => {
  if (!dateValue) return "";

  // If it's already in YYYY-MM-DD format, return as is
  if (typeof dateValue === "string" && /^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
    return dateValue;
  }

  // Try to parse the date - FIX: Handle timezone issues
  let date;
  if (typeof dateValue === "string") {
    // Handle comma-separated dates from getPendingValues
    if (dateValue.includes(",")) {
      date = new Date(dateValue);
    } else if (!dateValue.includes("T") && !dateValue.includes(" ")) {
      // For date-only strings, create date in local timezone
      const parts = dateValue.split("-");
      if (parts.length === 3) {
        date = new Date(
          parseInt(parts[0]),
          parseInt(parts[1]) - 1,
          parseInt(parts[2])
        );
      } else {
        date = new Date(dateValue);
      }
    } else {
      date = new Date(dateValue);
    }
  } else {
    date = new Date(dateValue);
  }

  if (isNaN(date.getTime())) return "";

  // Use local date methods to avoid timezone conversion
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const PendingEmployeeTypeForm = ({
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
  const lastEmployeeId = useRef(null);
  const watchedEmploymentTypes = watch("employment_types");

  const getEmploymentTypeLabelOptions = (mode, isAddingLine = false) => {
    if (mode === "create") {
      return ["PROBATIONARY", "AGENCY HIRED", "PROJECT BASED"];
    }
    if (mode === "edit") {
      return ["PROBATIONARY", "AGENCY HIRED", "PROJECT BASED", "REGULAR"];
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
    const currentEmploymentTypes = watchedEmploymentTypes || [];
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

  const hasRegularEmploymentType = () => {
    const currentEmploymentTypes = watchedEmploymentTypes || [];
    return currentEmploymentTypes.some(
      (emp) => emp.employment_type_label === "REGULAR"
    );
  };

  const canAddLine = () => {
    if (mode !== "edit") return false;

    if (hasRegularEmploymentType()) return false;

    if (fields.length >= 2) return false;

    return true;
  };

  const canRemoveLine = () => {
    if (mode !== "edit") return false;

    if (fields.length <= 1) return false;

    return true;
  };

  const getAvailableEmploymentTypes = (currentIndex) => {
    const baseOptions = getEmploymentTypeLabelOptions(mode);
    return baseOptions;
  };

  const isLineDisabled = (index) => {
    if (mode === "view") return true;
    if (mode === "create") return false;
    if (mode === "edit") {
      if (index === 0) return true;

      const currentEmploymentTypes = watchedEmploymentTypes || [];
      const currentLineType =
        currentEmploymentTypes[index]?.employment_type_label;

      if (currentLineType === "REGULAR") {
        return false;
      }

      const hasRegularInOtherLine = currentEmploymentTypes.some(
        (emp, idx) => idx !== index && emp.employment_type_label === "REGULAR"
      );

      return hasRegularInOtherLine;
    }
    return false;
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
      const currentEmploymentTypes = watchedEmploymentTypes || [];
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
      // Extract employment_types from the data structure returned by getPendingValues
      let employmentTypesData = [];

      if (
        employeeData?.employment_types &&
        Array.isArray(employeeData.employment_types)
      ) {
        employmentTypesData = employeeData.employment_types;
      } else if (
        employeeData?.result?.employment_types &&
        Array.isArray(employeeData.result.employment_types)
      ) {
        employmentTypesData = employeeData.result.employment_types;
      }

      if (employmentTypesData.length > 0) {
        const newEmploymentLines = employmentTypesData.map(
          (employment, index) => ({
            id:
              employment.id || generateUniqueId(`pending_employment_${index}`),
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

  const shouldReinitialize = useCallback(() => {
    const currentEmployeeId =
      employeeData?.id || employeeData?.employee_id || null;
    if (currentEmployeeId !== lastEmployeeId.current) {
      lastEmployeeId.current = currentEmployeeId;
      return true;
    }

    if (isInitialized && lastInitializedMode.current === mode) {
      if (mode === "edit" || mode === "view") {
        const currentDataString = JSON.stringify(
          employeeData?.employment_types ||
            employeeData?.result?.employment_types ||
            []
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

  useEffect(() => {
    if (!hasInitializedData.current || shouldReinitialize()) {
      if (shouldReinitialize()) {
        setIsInitialized(false);
        hasInitializedData.current = false;
      }

      if (mode === "create") {
        initializeEmptyForm();
      } else if (mode === "edit" || mode === "view") {
        if (
          employeeData &&
          (employeeData.employment_types ||
            employeeData.result?.employment_types)
        ) {
          initializeWithEmployeeData(employeeData);
        } else {
          initializeEmptyForm();
        }
      }

      hasInitializedData.current = true;
      lastInitializedMode.current = mode;
      lastInitializedData.current =
        employeeData?.employment_types ||
        employeeData?.result?.employment_types ||
        [];
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
    if (!canAddLine()) return;

    const currentEmploymentTypes = watchedEmploymentTypes || [];
    const newIndex = currentEmploymentTypes.length;
    const newLine = {
      id: generateUniqueId(`new_pending_employment_${newIndex}`),
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
  }, [watchedEmploymentTypes, append, trigger]);

  const removeEmploymentLine = useCallback(
    (index) => {
      if (!canRemoveLine()) return;
      if (index === fields.length - 1) {
        remove(index);
        setTimeout(() => {
          trigger("employment_types");
        }, 100);
      }
    },
    [remove, trigger, fields.length]
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
    if (employmentTypes.length === 0) return false;

    const allValid = employmentTypes.every((line) => {
      if (!line || !line.employment_type_label) return false;

      if (line.employment_type_label === "REGULAR") {
        return !!line.regularization_date;
      } else {
        const hasStartDate = !!line.employment_start_date;
        const needsEndDate = [
          "PROBATIONARY",
          "AGENCY HIRED",
          "PROJECT BASED",
        ].includes(line.employment_type_label);
        const hasEndDate = !!line.employment_end_date;

        return hasStartDate && (!needsEndDate || hasEndDate);
      }
    });

    return allValid;
  }, [watchedEmploymentTypes]);

  useEffect(() => {
    if (onValidationChange) {
      onValidationChange(isFormValid);
    }
  }, [isFormValid, onValidationChange]);

  const [forceUpdate, setForceUpdate] = useState(0);
  useEffect(() => {
    setForceUpdate((prev) => prev + 1);
  }, [watchedEmploymentTypes]);

  if (!isInitialized && (mode === "edit" || mode === "view")) {
    return (
      <Box sx={{ p: 2, textAlign: "center" }}>
        <Typography>Loading pending employment data...</Typography>
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
        const lineDisabled = isLineDisabled(index);

        return (
          <Box
            key={field.id}
            sx={{
              mb: 2,
              border: "1px solid #e0e0e0",
              borderRadius: 2,
              p: 2,
              paddingTop: 3,
            }}>
            <Grid container spacing={2} sx={{ alignItems: "flex-start" }}>
              {/* Employment Type Label */}
              <Grid
                item
                xs={12}
                sm={3}
                sx={{ minWidth: "346px", maxWidth: "346px" }}>
                <Controller
                  name={`employment_types.${index}.employment_type_label`}
                  control={control}
                  rules={{ required: "Employment type is required" }}
                  render={({ field: controllerField, fieldState }) => (
                    <FormControl
                      className="general-form__text-field"
                      fullWidth
                      variant="outlined"
                      disabled={isFieldDisabled || lineDisabled}
                      error={!!fieldState.error}>
                      <InputLabel>
                        Employment Type Label{" "}
                        <span style={{ color: "red" }}>*</span>
                      </InputLabel>
                      <Select
                        {...controllerField}
                        label="Employment Type Label *"
                        readOnly={isReadOnly || lineDisabled}
                        sx={{
                          borderRadius: 2,
                          ...(lineDisabled && {
                            backgroundColor: "#f5f5f5",
                            "& .MuiOutlinedInput-notchedOutline": {
                              borderColor: "#e0e0e0",
                            },
                          }),
                        }}
                        onChange={(e) => {
                          if (!lineDisabled) {
                            controllerField.onChange(e);
                            setTimeout(() => {
                              trigger(
                                `employment_types.${index}.employment_type_label`
                              );
                              setForceUpdate((prev) => prev + 1);
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

              {/* Employment Start Date - for non-regular types */}
              {!isRegular && (
                <Grid item xs={12} sm={4}>
                  <Grid
                    item
                    xs={12}
                    sm={3}
                    sx={{ minWidth: "346px", maxWidth: "346px" }}></Grid>
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
                        disabled={isFieldDisabled || lineDisabled}
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
                          readOnly: isReadOnly || lineDisabled,
                        }}
                        onChange={(e) => {
                          if (
                            !isReadOnly &&
                            !lineDisabled &&
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
                            ...(lineDisabled && {
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

              {/* Employment End Date - for non-regular types */}
              {!isRegular && (
                <Grid item xs={12} sm={4}>
                  <Grid
                    item
                    xs={12}
                    sm={3}
                    sx={{ minWidth: "346px", maxWidth: "346px" }}></Grid>
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
                        disabled={isFieldDisabled || lineDisabled}
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
                          readOnly: isReadOnly || lineDisabled,
                        }}
                        onChange={(e) => {
                          if (
                            !isReadOnly &&
                            !lineDisabled &&
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
                            ...(lineDisabled && {
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

              {/* Regularization Date - for regular type */}
              {isRegular && (
                <Grid item xs={12} sm={8}>
                  <Grid
                    item
                    xs={12}
                    sx={{ minWidth: "706px", maxWidth: "706px" }}></Grid>
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
                        disabled={isFieldDisabled || lineDisabled}
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
                          readOnly: isReadOnly || lineDisabled,
                        }}
                        onChange={(e) => {
                          if (
                            !isReadOnly &&
                            !lineDisabled &&
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
                            ...(lineDisabled && {
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

              {/* Action Buttons */}
              {!isReadOnly && (
                <Grid item xs={12}>
                  <Box
                    sx={{
                      display: "flex",
                      gap: 1,
                      mt: 2,
                      width: "100%",
                      justifyContent: "center !important",
                    }}>
                    {canRemoveLine() && index === fields.length - 1 && (
                      <Button
                        onClick={() => removeEmploymentLine(index)}
                        disabled={isFieldDisabled}
                        variant="contained"
                        size="small"
                        startIcon={<DeleteIcon />}
                        sx={{
                          backgroundColor: "rgb(220, 53, 69)",
                          color: "#fff !important",
                          width: "260px", // Set specific width
                          height: "40px", // Set specific height
                          "&:hover": {
                            backgroundColor: "rgb(200, 35, 51)",
                            color: "#fff !important",
                          },
                        }}
                        title="Remove this employment line">
                        Remove Line
                      </Button>
                    )}
                    {canAddLine() && index === fields.length - 1 && (
                      <Button
                        onClick={addEmploymentLine}
                        disabled={isFieldDisabled}
                        variant="contained"
                        size="small"
                        startIcon={<AddIcon />}
                        sx={{
                          backgroundColor: "rgb(40, 167, 69)",
                          color: "#fff !important",
                          width: "180px", // Added matching width
                          height: "40px", // Added matching height
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

export default PendingEmployeeTypeForm;
