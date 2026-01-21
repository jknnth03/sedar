import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  Box,
  Alert,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  InputAdornment,
  FormHelperText,
  Typography,
} from "@mui/material";
import { CalendarToday as CalendarIcon } from "@mui/icons-material";
import { useFormContext, Controller, useFieldArray } from "react-hook-form";
import { useSnackbar } from "notistack";
import EmployeeHeader from "./EmployeeHeader";
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

  let date;
  if (typeof dateValue === "string") {
    if (!dateValue.includes("T") && !dateValue.includes(" ")) {
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

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
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
    trigger,
    formState: { errors },
  } = useFormContext();

  const { fields, replace } = useFieldArray({
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

  const getEmploymentTypeLabelOptions = (mode) => {
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

  const getMinDateWithOneMonthBack = () => {
    const today = new Date();
    const oneMonthBack = new Date(today);
    oneMonthBack.setMonth(oneMonthBack.getMonth() - 1);
    return oneMonthBack.toISOString().split("T")[0];
  };

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

  const isDateBeforeMinAllowed = (dateString) => {
    if (!dateString) return false;
    const inputDate = new Date(dateString);
    const minDate = new Date(getMinDateWithOneMonthBack());
    minDate.setHours(0, 0, 0, 0);
    inputDate.setHours(0, 0, 0, 0);
    return inputDate < minDate;
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

    if (
      field === "employment_start_date" &&
      value &&
      isDateBeforeMinAllowed(value)
    ) {
      enqueueSnackbar(
        "Cannot select dates more than 1 month in the past for employment start date.",
        {
          variant: "error",
        }
      );
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

      if (isDateBeforeMinAllowed(value)) {
        enqueueSnackbar(
          "Cannot select dates more than 1 month in the past for regularization date.",
          {
            variant: "error",
          }
        );
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

  useEffect(() => {
    if (!hasInitializedData.current || shouldReinitialize()) {
      if (shouldReinitialize()) {
        setIsInitialized(false);
        hasInitializedData.current = false;
      }

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

  const isFormValid = React.useMemo(() => {
    const employmentTypes = watchedEmploymentTypes || [];
    if (employmentTypes.length === 0) return false;

    const allValid = employmentTypes.every((line) => {
      if (!line || !line.employment_type_label) return false;

      if (line.employment_type_label === "REGULAR") {
        return !!line.regularization_date;
      } else {
        const hasStartDate = !!line.employment_start_date;
        const needsEndDate = ["AGENCY HIRED", "PROJECT BASED"].includes(
          line.employment_type_label
        );
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
        <Typography>Loading employment data...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ width: "100%", maxWidth: "1200px", overflow: "0" }}>
      <EmployeeHeader getValues={getValues} selectedGeneral={employeeData} />
      {errorMessage && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {errorMessage}
        </Alert>
      )}

      <Box sx={{ px: 2 }}>
        {fields.map((field, index) => {
          const currentEmploymentType = watchedEmploymentTypes?.[index];
          const isRegular =
            currentEmploymentType?.employment_type_label === "REGULAR";
          const isNonRegular =
            currentEmploymentType?.employment_type_label && !isRegular;
          const isEndDateRequired =
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
              }}>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "1fr",
                    sm: "1fr",
                    md: "repeat(2, 1fr)",
                  },
                  "@media (min-width: 750px)": {
                    gridTemplateColumns: "repeat(2, 1fr)",
                  },
                  gap: 2,
                }}>
                <Box>
                  <Controller
                    name={`employment_types.${index}.employment_type_label`}
                    control={control}
                    render={({
                      field: { onChange, value, onBlur },
                      fieldState: { error },
                    }) => (
                      <FormControl
                        className="general-form__text-field"
                        fullWidth
                        variant="outlined"
                        disabled={isFieldDisabled || lineDisabled}
                        error={!!error}>
                        <InputLabel>
                          Employment Type Label{" "}
                          <span style={{ color: "red" }}>*</span>
                        </InputLabel>
                        <Select
                          onChange={(e) => {
                            if (!lineDisabled) {
                              onChange(e);
                              setTimeout(() => {
                                trigger(
                                  `employment_types.${index}.employment_type_label`
                                );
                                setForceUpdate((prev) => prev + 1);
                              }, 100);
                            }
                          }}
                          onBlur={onBlur}
                          value={value || ""}
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
                        {error && (
                          <FormHelperText error>{error.message}</FormHelperText>
                        )}
                      </FormControl>
                    )}
                  />
                </Box>

                {!isRegular && (
                  <Box>
                    <Controller
                      name={`employment_types.${index}.employment_start_date`}
                      control={control}
                      render={({
                        field: { onChange, value, onBlur },
                        fieldState: { error },
                      }) => (
                        <TextField
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
                              onChange(e);
                              setTimeout(() => {
                                trigger(
                                  `employment_types.${index}.employment_start_date`
                                );
                              }, 100);
                            }
                          }}
                          onBlur={onBlur}
                          value={value || ""}
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
                          error={!!error}
                          helperText={
                            error?.message ||
                            "Cannot select dates more than 1 month in the past"
                          }
                          inputProps={{
                            min: getMinDateWithOneMonthBack(),
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
                  </Box>
                )}

                {!isRegular && (
                  <Box>
                    <Controller
                      name={`employment_types.${index}.employment_end_date`}
                      control={control}
                      render={({
                        field: { onChange, value, onBlur },
                        fieldState: { error },
                      }) => (
                        <TextField
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
                              onChange(e);
                              setTimeout(() => {
                                trigger(
                                  `employment_types.${index}.employment_end_date`
                                );
                              }, 100);
                            }
                          }}
                          onBlur={onBlur}
                          value={value || ""}
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
                          error={!!error}
                          helperText={
                            error?.message ||
                            (isEndDateRequired
                              ? "Required and cannot be before start date"
                              : "Cannot be before start date")
                          }
                          inputProps={{
                            min:
                              currentEmploymentType?.employment_start_date ||
                              getMinDateWithOneMonthBack(),
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
                  </Box>
                )}

                {isRegular && (
                  <Box sx={{ gridColumn: "1 / -1" }}>
                    <Controller
                      name={`employment_types.${index}.regularization_date`}
                      control={control}
                      render={({
                        field: { onChange, value, onBlur },
                        fieldState: { error },
                      }) => (
                        <TextField
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
                              onChange(e);
                              setTimeout(() => {
                                trigger(
                                  `employment_types.${index}.regularization_date`
                                );
                              }, 100);
                            }
                          }}
                          onBlur={onBlur}
                          value={value || ""}
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
                          error={!!error}
                          helperText={
                            error?.message ||
                            (regularizationConstraints.probationaryStartDate
                              ? "Required and cannot be before probationary start date or more than 1 month in the past"
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
                  </Box>
                )}
              </Box>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
};

export default EmploymentTypesForm;
