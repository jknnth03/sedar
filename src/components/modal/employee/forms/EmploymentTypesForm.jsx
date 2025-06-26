import React, { useEffect, useState, useMemo } from "react";
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
} from "@mui/material";
import { CalendarToday as CalendarIcon } from "@mui/icons-material";
import { useSnackbar } from "notistack";
import "./General.scss";

const EmploymentTypesForm = React.forwardRef(
  (
    {
      onSubmit,
      selectedEmploymentType,
      showArchived,
      isLoading = false,
      onValidationChange,
    },
    ref
  ) => {
    const { enqueueSnackbar } = useSnackbar();

    const [form, setForm] = useState({
      employment_type_label: "",
      employment_start_date: "",
      employment_end_date: "",
    });

    const [errors, setErrors] = useState({});
    const [errorMessage, setErrorMessage] = useState(null);

    const employmentTypeLabelOptions = [
      "PROBATIONARY",
      "AGENCY HIRED",
      "PROJECT BASED",
    ];

    const getCurrentDate = () => {
      const today = new Date();
      return today.toISOString().split("T")[0];
    };

    const getMaxDate = () => {
      const today = new Date();
      const nextYear = today.getFullYear() + 1;
      return `${nextYear}-12-31`;
    };

    const calculateSixMonthsAfter = (startDate) => {
      if (!startDate) return "";
      const date = new Date(startDate);
      date.setMonth(date.getMonth() + 6);
      return date.toISOString().split("T")[0];
    };

    const isDateBeyondNextYear = (dateString) => {
      if (!dateString) return false;
      const inputDate = new Date(dateString);
      const currentYear = new Date().getFullYear();
      const nextYear = currentYear + 1;
      return inputDate.getFullYear() > nextYear;
    };

    const formatDateForInput = (dateString) => {
      if (!dateString) return "";

      if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
        return dateString;
      }

      try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
          return "";
        }
        return date.toISOString().split("T")[0];
      } catch (error) {
        return "";
      }
    };

    useEffect(() => {
      if (selectedEmploymentType) {
        const initialForm = {
          employment_type_label:
            selectedEmploymentType?.employment_type_label ||
            selectedEmploymentType?.employment_type ||
            "",
          employment_start_date: formatDateForInput(
            selectedEmploymentType?.employment_start_date ||
              selectedEmploymentType?.start_date ||
              ""
          ),
          employment_end_date: formatDateForInput(
            selectedEmploymentType?.employment_end_date ||
              selectedEmploymentType?.end_date ||
              ""
          ),
        };

        if (
          initialForm.employment_type_label === "PROBATIONARY" &&
          initialForm.employment_start_date
        ) {
          initialForm.employment_end_date = calculateSixMonthsAfter(
            initialForm.employment_start_date
          );
        }

        setForm(initialForm);
        setErrorMessage(null);
        setErrors({});
      }
    }, [selectedEmploymentType]);

    useEffect(() => {
      if (onValidationChange) {
        onValidationChange();
      }
    }, [form, onValidationChange]);

    const handleChange = (e) => {
      const { name, value } = e.target;

      if (
        (name === "employment_start_date" || name === "employment_end_date") &&
        value
      ) {
        if (isDateBeyondNextYear(value)) {
          const currentYear = new Date().getFullYear();
          const nextYear = currentYear + 1;
          enqueueSnackbar(
            `Cannot select dates beyond ${nextYear}. Current year is ${currentYear}.`,
            {
              variant: "error",
            }
          );
          return;
        }
      }

      setForm((prev) => {
        const newForm = { ...prev, [name]: value };

        if (name === "employment_type_label") {
          if (value === "PROBATIONARY" && newForm.employment_start_date) {
            newForm.employment_end_date = calculateSixMonthsAfter(
              newForm.employment_start_date
            );
          } else if (value !== "PROBATIONARY") {
            newForm.employment_end_date = "";
          }
        }

        if (
          name === "employment_start_date" &&
          newForm.employment_type_label === "PROBATIONARY"
        ) {
          const calculatedEndDate = calculateSixMonthsAfter(value);
          newForm.employment_end_date = calculatedEndDate;
        }

        return newForm;
      });

      if (errors[name]) {
        setErrors((prev) => ({ ...prev, [name]: false }));
      }

      if (errorMessage) {
        setErrorMessage(null);
      }
    };

    const isFormValid = () => {
      const requiredFields = ["employment_type_label", "employment_start_date"];

      const isFieldsValid = requiredFields.every((field) => {
        return form[field] && form[field].toString().trim() !== "";
      });

      if (!isFieldsValid) return false;

      if (
        isDateBeyondNextYear(form.employment_start_date) ||
        isDateBeyondNextYear(form.employment_end_date)
      ) {
        return false;
      }

      const startDate = new Date(form.employment_start_date);
      const endDate = form.employment_end_date
        ? new Date(form.employment_end_date)
        : null;

      if (
        (form.employment_type_label === "AGENCY HIRED" ||
          form.employment_type_label === "PROJECT BASED") &&
        endDate &&
        endDate <= startDate
      ) {
        return false;
      }

      if (
        endDate &&
        endDate <= startDate &&
        form.employment_type_label !== "PROBATIONARY"
      ) {
        return false;
      }

      return true;
    };

    const validateForm = () => {
      const requiredFields = ["employment_type_label", "employment_start_date"];

      const newErrors = {};
      const missingFields = [];

      requiredFields.forEach((field) => {
        if (!form[field] || form[field].toString().trim() === "") {
          newErrors[field] = true;
          missingFields.push(field.replace("_", " ").toUpperCase());
        }
      });

      if (isDateBeyondNextYear(form.employment_start_date)) {
        newErrors.employment_start_date = true;
      }
      if (isDateBeyondNextYear(form.employment_end_date)) {
        newErrors.employment_end_date = true;
      }

      const startDate = new Date(form.employment_start_date);
      const endDate = form.employment_end_date
        ? new Date(form.employment_end_date)
        : null;

      if (
        (form.employment_type_label === "AGENCY HIRED" ||
          form.employment_type_label === "PROJECT BASED") &&
        endDate &&
        endDate <= startDate
      ) {
        newErrors.employment_end_date = true;
      }

      if (
        endDate &&
        endDate <= startDate &&
        form.employment_type_label !== "PROBATIONARY"
      ) {
        newErrors.employment_end_date = true;
      }

      setErrors(newErrors);

      if (Object.keys(newErrors).length > 0) {
        setErrorMessage("");
        return false;
      }

      return true;
    };

    const isEndDateDisabled =
      form.employment_type_label === "PROBATIONARY" || isLoading;

    React.useImperativeHandle(ref, () => ({
      validateAndGetData: () => {
        if (validateForm()) {
          const formData = {
            employment_type_label: form.employment_type_label || "",
            employment_start_date: form.employment_start_date || "",
            employment_end_date: form.employment_end_date || "",
          };

          if (!formData.employment_type_label.trim()) {
            return null;
          }

          if (!formData.employment_start_date.trim()) {
            return null;
          }

          if (formData.employment_end_date === "") {
            formData.employment_end_date = null;
          }

          return formData;
        }
        return null;
      },
      isFormValid,
      getData: () => {
        const formData = {
          employment_type_label: form.employment_type_label || "",
          employment_start_date: form.employment_start_date || "",
          employment_end_date: form.employment_end_date || "",
        };

        if (formData.employment_end_date === "") {
          formData.employment_end_date = null;
        }

        return formData;
      },
      getFormData: () => {
        const formData = {
          employment_type_label: form.employment_type_label || "",
          employment_start_date: form.employment_start_date || "",
          employment_end_date: form.employment_end_date || "",
        };

        if (formData.employment_end_date === "") {
          formData.employment_end_date = null;
        }

        return formData;
      },
      setFormData: (data) => {
        if (data) {
          const formattedData = {
            employment_type_label:
              data.employment_type_label || data.employment_type || "",
            employment_start_date: formatDateForInput(
              data.employment_start_date || data.start_date || ""
            ),
            employment_end_date: formatDateForInput(
              data.employment_end_date || data.end_date || ""
            ),
          };

          if (
            formattedData.employment_type_label === "PROBATIONARY" &&
            formattedData.employment_start_date
          ) {
            formattedData.employment_end_date = calculateSixMonthsAfter(
              formattedData.employment_start_date
            );
          }

          setForm(formattedData);
        }
      },
      resetForm: () => {
        setForm({
          employment_type_label: "",
          employment_start_date: "",
          employment_end_date: "",
        });
        setErrors({});
        setErrorMessage(null);
      },
      validateForm,
      setErrors,
      setErrorMessage,
    }));

    return (
      <Box sx={{ p: 2 }}>
        {errorMessage && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {errorMessage}
          </Alert>
        )}

        <Grid container spacing={2}>
          <Grid item xs={4}>
            <FormControl
              className="general-form__text-field"
              fullWidth
              variant="outlined"
              disabled={isLoading}
              error={!!errors.employment_type_label}
              sx={{ width: "355px" }}>
              <InputLabel>
                Employment Type Label <span style={{ color: "red" }}>*</span>
              </InputLabel>
              <Select
                name="employment_type_label"
                value={form.employment_type_label}
                onChange={handleChange}
                label="Employment Type Label *"
                sx={{ borderRadius: 2 }}>
                <MenuItem value="">
                  <em>Select Employment Type</em>
                </MenuItem>
                {employmentTypeLabelOptions.map((label) => (
                  <MenuItem key={label} value={label}>
                    {label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={4}>
            <TextField
              className="general-form__text-field"
              label={
                <>
                  Employment Start Date <span style={{ color: "red" }}>*</span>
                </>
              }
              name="employment_start_date"
              type="date"
              variant="outlined"
              fullWidth
              value={form.employment_start_date}
              onChange={handleChange}
              disabled={isLoading}
              error={!!errors.employment_start_date}
              inputProps={{
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
              }}
              sx={{
                width: "355px",
                "& .MuiOutlinedInput-root": { borderRadius: 2 },
              }}
            />
          </Grid>

          <Grid item xs={4}>
            <TextField
              className="general-form__text-field"
              label="Employment End Date"
              name="employment_end_date"
              type="date"
              variant="outlined"
              fullWidth
              value={form.employment_end_date}
              onChange={handleChange}
              disabled={isEndDateDisabled}
              error={!!errors.employment_end_date}
              inputProps={{
                max: getMaxDate(),
              }}
              helperText={
                form.employment_type_label === "PROBATIONARY"
                  ? "Auto-calculated (6 months after start date)"
                  : "Leave empty if no end date"
              }
              FormHelperTextProps={{
                sx: {
                  color:
                    form.employment_type_label === "PROBATIONARY"
                      ? "text.secondary"
                      : "text.secondary",
                },
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
              }}
              sx={{
                width: "355px",
                "& .MuiOutlinedInput-root": { borderRadius: 2 },
              }}
            />
          </Grid>
        </Grid>
      </Box>
    );
  }
);

EmploymentTypesForm.displayName = "EmploymentTypesForm";

export default EmploymentTypesForm;
