import React, { useEffect, useState, useMemo } from "react";
import {
  Box,
  Alert,
  TextField,
  Grid,
  Typography,
  InputAdornment,
} from "@mui/material";
import { CalendarToday as CalendarIcon } from "@mui/icons-material";
import "../../employee/forms/General.scss";

const EmploymentTypeViewForm = ({ employeeId, selectedEmploymentType }) => {
  const [employmentTypeData, setEmploymentTypeData] = useState({
    employment_type_label: "",
    employment_start_date: "",
    employment_end_date: "",
  });

  // Format date for display (same as your create form)
  const formatDateForInput = (dateString) => {
    if (!dateString) return "";

    // Handle different date formats from API
    let date;
    if (dateString.includes("/")) {
      // Handle "Jun 18, 2026" format
      date = new Date(dateString);
    } else if (dateString.includes("-")) {
      // Handle "2026-06-18" format
      date = new Date(dateString);
    } else {
      date = new Date(dateString);
    }

    if (isNaN(date.getTime())) return "";
    return date.toISOString().split("T")[0];
  };

  useEffect(() => {
    if (selectedEmploymentType) {
      // If we have selectedEmploymentType data passed from parent, use it
      setEmploymentTypeData({
        employment_type_label:
          selectedEmploymentType.employment_type_label || "",
        employment_start_date: selectedEmploymentType.start_date || "",
        employment_end_date: selectedEmploymentType.end_date || "",
      });
    }
  }, [selectedEmploymentType]);

  if (!selectedEmploymentType) {
    return (
      <Box sx={{ p: 2 }}>
        <Alert severity="info" sx={{ mb: 3 }}>
          No employment type information available for this employee.
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      {/* Form Layout - 3 Fields per Row (same as create form) */}
      <Grid container spacing={2}>
        {/* Row 1: Employment Type Label, Start Date, End Date */}
        <Grid item xs={4}>
          <TextField
            label="Employment Type Label"
            name="employment_type_label"
            variant="outlined"
            fullWidth
            value={employmentTypeData.employment_type_label}
            InputProps={{
              readOnly: true,
            }}
            placeholder="Not provided"
            className="general-form__text-field"
            sx={{
              width: "355px",
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
                backgroundColor: "#f5f5f5",
              },
              "& .MuiInputBase-input": {
                color: "#666",
              },
            }}
          />
        </Grid>

        <Grid item xs={4}>
          <TextField
            label="Employment Start Date"
            name="employment_start_date"
            type="date"
            variant="outlined"
            fullWidth
            value={formatDateForInput(employmentTypeData.employment_start_date)}
            InputProps={{
              readOnly: true,
              startAdornment: (
                <InputAdornment position="start">
                  <CalendarIcon />
                </InputAdornment>
              ),
            }}
            InputLabelProps={{
              shrink: true,
            }}
            placeholder="Not provided"
            className="general-form__text-field"
            sx={{
              width: "355px",
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
                backgroundColor: "#f5f5f5",
              },
              "& .MuiInputBase-input": {
                color: "#666",
              },
            }}
          />
        </Grid>

        <Grid item xs={4}>
          <TextField
            label="Employment End Date"
            name="employment_end_date"
            type="date"
            variant="outlined"
            fullWidth
            value={formatDateForInput(employmentTypeData.employment_end_date)}
            InputProps={{
              readOnly: true,
              startAdornment: (
                <InputAdornment position="start">
                  <CalendarIcon />
                </InputAdornment>
              ),
            }}
            InputLabelProps={{
              shrink: true,
            }}
            placeholder="Not provided"
            helperText={
              employmentTypeData.employment_type_label === "PROBATIONARY"
                ? "Auto-calculated (6 months after start date)"
                : employmentTypeData.employment_end_date
                ? ""
                : "No end date specified"
            }
            FormHelperTextProps={{
              sx: {
                color: "text.secondary",
              },
            }}
            className="general-form__text-field"
            sx={{
              width: "355px",
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
                backgroundColor: "#f5f5f5",
              },
              "& .MuiInputBase-input": {
                color: "#666",
              },
            }}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

EmploymentTypeViewForm.displayName = "EmploymentTypesViewForm";

export default EmploymentTypeViewForm;
