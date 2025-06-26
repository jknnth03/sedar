import React, { useEffect, useState, useMemo } from "react";
import {
  Box,
  Alert,
  TextField,
  Grid,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { useGetEmployeesQuery } from "../../../../features/api/employee/mainApi";
import "../../employee/forms/General.scss";

const GeneralViewForm = ({ employeeId, selectedGeneral }) => {
  const [generalData, setGeneralData] = useState({
    id_number: "",
    prefix: "",
    first_name: "",
    middle_name: "",
    last_name: "",
    suffix: "",
    birth_date: "",
    civil_status: "",
    religion: "",
    gender: "",
    referred_by: "",
    remarks: "",
  });

  const {
    data: employeesData,
    isLoading: employeesLoading,
    error: employeesError,
  } = useGetEmployeesQuery(undefined, {
    skip: !employeeId || selectedGeneral, // Skip API call if data is passed directly
  });

  const employee = useMemo(() => {
    // If selectedGeneral is passed directly, use it
    if (selectedGeneral) {
      return { general_info: selectedGeneral };
    }

    if (!employeesData || !employeeId) return null;

    let employees = [];
    if (Array.isArray(employeesData)) {
      employees = employeesData;
    } else if (
      employeesData.result &&
      Array.isArray(employeesData.result.data)
    ) {
      employees = employeesData.result.data;
    } else if (employeesData.data && Array.isArray(employeesData.data)) {
      employees = employeesData.data;
    }

    return employees.find((emp) => emp.id === employeeId);
  }, [employeesData, employeeId, selectedGeneral]);

  useEffect(() => {
    if (employee && employee.general_info) {
      // Fix the referred_by handling
      let referredByDisplay = "";
      if (employee.general_info.referred_by) {
        if (typeof employee.general_info.referred_by === "string") {
          referredByDisplay = employee.general_info.referred_by;
        } else if (typeof employee.general_info.referred_by === "object") {
          // Handle object case - extract full_name or construct from parts
          if (employee.general_info.referred_by.full_name) {
            referredByDisplay = employee.general_info.referred_by.full_name;
          } else if (
            employee.general_info.referred_by.first_name ||
            employee.general_info.referred_by.last_name
          ) {
            const firstName =
              employee.general_info.referred_by.first_name || "";
            const middleName =
              employee.general_info.referred_by.middle_name || "";
            const lastName = employee.general_info.referred_by.last_name || "";
            referredByDisplay = `${firstName} ${middleName} ${lastName}`.trim();
          } else {
            referredByDisplay =
              employee.general_info.referred_by.name ||
              employee.general_info.referred_by.title ||
              employee.general_info.referred_by.label ||
              "";
          }
        }
      }

      setGeneralData({
        id_number: employee.general_info.id_number || "N/A",
        prefix:
          employee.general_info.prefix?.name ||
          employee.general_info.prefix ||
          "N/A",
        first_name: employee.general_info.first_name || "N/A",
        middle_name: employee.general_info.middle_name || "N/A",
        last_name: employee.general_info.last_name || "N/A",
        suffix: employee.general_info.suffix || "N/A",
        birth_date: employee.general_info.birth_date || "N/A",
        civil_status: employee.general_info.civil_status || "N/A",
        religion:
          employee.general_info.religion?.name ||
          employee.general_info.religion ||
          "N/A",
        gender: employee.general_info.gender || "N/A",
        referred_by: referredByDisplay || "N/A",
        remarks: employee.general_info.remarks || "N/A",
      });
    }
  }, [employee]);

  if (employeesLoading && !selectedGeneral) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography>Loading general information...</Typography>
      </Box>
    );
  }

  if (employeesError && !selectedGeneral) {
    return (
      <Box sx={{ p: 2 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          Failed to load employee general information.
        </Alert>
      </Box>
    );
  }

  if (!employee) {
    return (
      <Box sx={{ p: 2 }}>
        <Alert severity="warning" sx={{ mb: 3 }}>
          Employee not found.
        </Alert>
      </Box>
    );
  }

  if (!employee.general_info) {
    return (
      <Box sx={{ p: 2 }}>
        <Alert severity="info" sx={{ mb: 3 }}>
          No general information available for this employee.
        </Alert>
      </Box>
    );
  }

  const textFieldStyles = {
    width: "355px",
    "& .MuiOutlinedInput-root": {
      borderRadius: 2,
      backgroundColor: "#f5f5f5",
    },
    "& .MuiInputBase-input": {
      color: "#666",
    },
  };

  return (
    <Box className="general-form">
      <Grid container spacing={2} className="general-form__grid">
        <Grid item xs={3} className="general-form__grid-item">
          <TextField
            label="First Name"
            name="first_name"
            variant="outlined"
            fullWidth
            value={generalData.first_name}
            InputProps={{
              readOnly: true,
            }}
            className="general-form__text-field"
            sx={textFieldStyles}
          />
        </Grid>

        <Grid item xs={3} className="general-form__grid-item">
          <TextField
            label="Middle Name"
            name="middle_name"
            variant="outlined"
            fullWidth
            value={generalData.middle_name}
            InputProps={{
              readOnly: true,
            }}
            className="general-form__text-field"
            sx={textFieldStyles}
          />
        </Grid>

        <Grid item xs={3} className="general-form__grid-item">
          <TextField
            label="Last Name"
            name="last_name"
            variant="outlined"
            fullWidth
            value={generalData.last_name}
            InputProps={{
              readOnly: true,
            }}
            className="general-form__text-field"
            sx={textFieldStyles}
          />
        </Grid>

        <Grid item xs={3} className="general-form__grid-item">
          <TextField
            label="Suffix"
            name="suffix"
            variant="outlined"
            fullWidth
            value={generalData.suffix}
            InputProps={{
              readOnly: true,
            }}
            className="general-form__text-field"
            sx={textFieldStyles}
          />
        </Grid>

        <Grid item xs={3} className="general-form__grid-item">
          <TextField
            label="Prefix"
            name="prefix"
            variant="outlined"
            fullWidth
            value={generalData.prefix}
            InputProps={{
              readOnly: true,
            }}
            className="general-form__text-field"
            sx={textFieldStyles}
          />
        </Grid>

        <Grid item xs={3} className="general-form__grid-item">
          <TextField
            label="ID Number"
            name="id_number"
            variant="outlined"
            fullWidth
            value={generalData.id_number}
            InputProps={{
              readOnly: true,
            }}
            className="general-form__text-field"
            sx={textFieldStyles}
          />
        </Grid>

        <Grid item xs={3} className="general-form__grid-item">
          <TextField
            label="Birth Date"
            name="birth_date"
            variant="outlined"
            fullWidth
            value={generalData.birth_date}
            InputProps={{
              readOnly: true,
            }}
            className="general-form__text-field"
            sx={textFieldStyles}
          />
        </Grid>

        <Grid item xs={3} className="general-form__grid-item">
          <TextField
            label="Gender"
            name="gender"
            variant="outlined"
            fullWidth
            value={generalData.gender}
            InputProps={{
              readOnly: true,
            }}
            className="general-form__text-field"
            sx={textFieldStyles}
          />
        </Grid>

        <Grid item xs={3} className="general-form__grid-item">
          <TextField
            label="Civil Status"
            name="civil_status"
            variant="outlined"
            fullWidth
            value={generalData.civil_status}
            InputProps={{
              readOnly: true,
            }}
            className="general-form__text-field"
            sx={textFieldStyles}
          />
        </Grid>

        <Grid item xs={3} className="general-form__grid-item">
          <TextField
            label="Religion"
            name="religion"
            variant="outlined"
            fullWidth
            value={generalData.religion}
            InputProps={{
              readOnly: true,
            }}
            className="general-form__text-field"
            sx={textFieldStyles}
          />
        </Grid>

        <Grid item xs={3} className="general-form__grid-item">
          <TextField
            label="Referred By"
            name="referred_by"
            variant="outlined"
            fullWidth
            value={generalData.referred_by}
            InputProps={{
              readOnly: true,
            }}
            className="general-form__text-field"
            sx={textFieldStyles}
          />
        </Grid>

        <Grid item xs={3} className="general-form__grid-item">
          <TextField
            label="Remarks"
            name="remarks"
            variant="outlined"
            fullWidth
            multiline
            rows={1}
            value={generalData.remarks}
            InputProps={{
              readOnly: true,
            }}
            className="general-form__multiline"
            sx={textFieldStyles}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

GeneralViewForm.displayName = "GeneralViewForm";

export default GeneralViewForm;
