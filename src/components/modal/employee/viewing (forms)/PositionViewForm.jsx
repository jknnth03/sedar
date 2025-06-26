import React, { useEffect, useState } from "react";
import { Box, Alert, TextField, Grid, InputAdornment } from "@mui/material";
import { useGetEmployeesQuery } from "../../../../features/api/employee/mainApi";
import "../../employee/forms/General.scss";

const PositionViewForm = ({ selectedPosition, employeeId, ...props }) => {
  const [positionData, setPositionData] = useState({
    position_name: "",
    schedule_name: "",
    job_level_label: "",
    job_rate: "",
    allowance: "",
    salary: "",
    additional_rate: "",
    additional_rate_remarks: "",
    additional_tools: "",
  });

  // Only fetch if we don't have selectedPosition data and we have employeeId
  const shouldSkipQuery = !!selectedPosition || !employeeId;

  const {
    data: employeeData,
    isLoading: employeeLoading,
    error: employeeError,
  } = useGetEmployeesQuery(
    {
      id: employeeId,
      pagination: 0,
    },
    {
      skip: shouldSkipQuery,
    }
  );

  // Helper function to safely extract position data from various possible structures
  const extractPositionData = (data) => {
    if (!data) return null;

    // Try different possible data structures
    const possiblePaths = [
      data,
      data.position_details,
      data.positions,
      data.position,
      data.result?.position_details,
      data.result?.positions,
      data.result?.position,
      data.data?.position_details,
      data.data?.positions,
      data.data?.position,
    ];

    for (const path of possiblePaths) {
      if (path && typeof path === "object") {
        // Check if this looks like position data
        if (path.position_name || path.position?.name || path.name) {
          return path;
        }
      }
    }

    return null;
  };

  // Helper function to clean values - replace "Not provided", "N/A", "-", etc. with empty string for display
  const cleanValue = (value) => {
    if (
      !value ||
      value === "Not provided" ||
      value === "N/A" ||
      value === "-" ||
      value.toString().trim() === ""
    ) {
      return "";
    }
    return value.toString();
  };

  // Helper function to display value or "N/A" if empty
  const displayValue = (value) => {
    const cleaned = cleanValue(value);
    return cleaned || "N/A";
  };

  // Helper function specifically for text fields (non-currency)
  const displayTextValue = (value) => {
    const cleaned = cleanValue(value);
    return cleaned || "N/A";
  };

  // Update form data when selectedPosition or employee data changes
  useEffect(() => {
    let positionDetails = null;

    // First priority: use selectedPosition if available
    if (selectedPosition) {
      positionDetails = extractPositionData(selectedPosition);
    }
    // Second priority: use fetched employee data
    else if (employeeData) {
      positionDetails = extractPositionData(employeeData);
    }

    if (positionDetails) {
      setPositionData({
        position_name: displayValue(
          positionDetails.position_name ||
            positionDetails.position?.name ||
            positionDetails.name ||
            ""
        ),
        schedule_name: displayValue(
          positionDetails.schedule_name || positionDetails.schedule?.name || ""
        ),
        job_level_label: displayValue(
          positionDetails.job_level_label ||
            positionDetails.job_level?.label ||
            ""
        ),
        job_rate: displayValue(positionDetails.job_rate || ""),
        allowance: displayValue(positionDetails.allowance || ""),
        salary: displayValue(positionDetails.salary || ""),
        additional_rate: displayValue(positionDetails.additional_rate || ""),
        additional_rate_remarks: displayTextValue(
          positionDetails.additional_rate_remarks || ""
        ),
        additional_tools: displayTextValue(
          positionDetails.additional_tools || ""
        ),
      });
    } else {
      // Reset to N/A if no data found
      setPositionData({
        position_name: "N/A",
        schedule_name: "N/A",
        job_level_label: "N/A",
        job_rate: "N/A",
        allowance: "N/A",
        salary: "N/A",
        additional_rate: "N/A",
        additional_rate_remarks: "N/A",
        additional_tools: "N/A",
      });
    }
  }, [selectedPosition, employeeData]);

  // Loading state - only show if we're actually fetching data
  if (employeeLoading && !shouldSkipQuery) {
    return (
      <Box className="general-form">
        <Alert severity="info" className="general-form__alert">
          Loading position information...
        </Alert>
      </Box>
    );
  }

  // Error state - only show if we actually tried to fetch and failed
  if (employeeError && !shouldSkipQuery) {
    return (
      <Box className="general-form">
        <Alert severity="error" className="general-form__alert">
          Failed to load position information from server.
          <br />
          Error: {employeeError?.message || "Unknown error"}
        </Alert>
      </Box>
    );
  }

  // Check if we have any position data at all (excluding N/A values)
  const hasAnyPositionData = Object.values(positionData).some(
    (value) => value && value.toString().trim() !== "" && value !== "N/A"
  );

  // Only show "no data" message if we've tried all sources and found nothing
  if (!hasAnyPositionData && !employeeLoading) {
    return (
      <Box className="general-form">
        <Alert severity="info" className="general-form__alert">
          No position information available for this employee.
        </Alert>
      </Box>
    );
  }

  return (
    <Box className="general-form">
      <Grid container spacing={2} className="general-form__grid">
        {/* Row 1: Position Title, Schedule, Job Level, Job Rate */}
        <Grid item xs={3} className="general-form__grid-item">
          <TextField
            label="Position Title"
            name="position_name"
            variant="outlined"
            fullWidth
            value={positionData.position_name}
            InputProps={{
              readOnly: true,
            }}
            placeholder="N/A"
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

        <Grid item xs={3} className="general-form__grid-item">
          <TextField
            label="Schedule"
            name="schedule_name"
            variant="outlined"
            fullWidth
            value={positionData.schedule_name}
            InputProps={{
              readOnly: true,
            }}
            placeholder="N/A"
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

        <Grid item xs={3} className="general-form__grid-item">
          <TextField
            label="Job Level"
            name="job_level_label"
            variant="outlined"
            fullWidth
            value={positionData.job_level_label}
            InputProps={{
              readOnly: true,
            }}
            placeholder="N/A"
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

        <Grid item xs={3} className="general-form__grid-item">
          <TextField
            label="Job Rate"
            name="job_rate"
            variant="outlined"
            fullWidth
            value={positionData.job_rate}
            InputProps={{
              readOnly: true,
              startAdornment: (
                <InputAdornment position="start">₱</InputAdornment>
              ),
            }}
            placeholder="N/A"
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

        {/* Row 2: Allowance, Additional Rate, Additional Rate Remarks, Additional Tools */}
        <Grid item xs={3} className="general-form__grid-item">
          <TextField
            label="Allowance"
            name="allowance"
            variant="outlined"
            fullWidth
            value={positionData.allowance}
            InputProps={{
              readOnly: true,
              startAdornment: (
                <InputAdornment position="start">₱</InputAdornment>
              ),
            }}
            placeholder="N/A"
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

        <Grid item xs={3} className="general-form__grid-item">
          <TextField
            label="Additional Rate"
            name="additional_rate"
            variant="outlined"
            fullWidth
            value={positionData.additional_rate}
            InputProps={{
              readOnly: true,
              startAdornment: (
                <InputAdornment position="start">₱</InputAdornment>
              ),
            }}
            placeholder="N/A"
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

        <Grid item xs={3} className="general-form__grid-item">
          <TextField
            label="Additional Rate Remarks"
            name="additional_rate_remarks"
            variant="outlined"
            fullWidth
            value={positionData.additional_rate_remarks || "N/A"}
            InputProps={{
              readOnly: true,
            }}
            placeholder="N/A"
            className="general-form__text-field"
            sx={{
              width: "540px",
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

        <Grid item xs={3} className="general-form__grid-item">
          <TextField
            label="Additional Tools"
            name="additional_tools"
            variant="outlined"
            fullWidth
            value={positionData.additional_tools || "N/A"}
            InputProps={{
              readOnly: true,
            }}
            placeholder="N/A"
            className="general-form__text-field"
            sx={{
              width: "540px",
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
                backgroundColor: "#f5f5f5",
              },
              "& .MuiInputBase-input": {
                color: "#666",
              },
              "& .MuiInputLabel-root": {
                color: "rgb(33, 61, 112)",
                "&.Mui-focused": {
                  color: "rgb(33, 61, 112)",
                },
              },
              "& .MuiFormLabel-root": {
                color: "rgb(33, 61, 112)",
                "&.Mui-focused": {
                  color: "rgb(33, 61, 112)",
                },
              },
            }}
          />
        </Grid>

        {/* Row 3: Salary (calculated field) */}
        <Grid item xs={3} className="general-form__grid-item">
          <TextField
            label="Total Salary"
            name="salary"
            variant="outlined"
            fullWidth
            value={positionData.salary}
            InputProps={{
              readOnly: true,
              startAdornment: (
                <InputAdornment position="start">₱</InputAdornment>
              ),
            }}
            placeholder="N/A"
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

PositionViewForm.displayName = "PositionViewForm";

export default PositionViewForm;
