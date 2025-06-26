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
  Typography,
} from "@mui/material";
import {
  Phone as PhoneIcon,
  Email as EmailIcon,
  ContactPhone as ContactIcon,
} from "@mui/icons-material";
import { useGetEmployeesQuery } from "../../../../features/api/employee/mainApi";
import "../../employee/forms/General.scss";

const ContactViewForm = ({ employeeId }) => {
  const [contactLines, setContactLines] = useState([
    {
      id: "mobile_view",
      index: 0,
      contact_type: "MOBILE NUMBER",
      contact_details: "N/A",
      contact_remarks: "N/A",
    },
    {
      id: "email_view",
      index: 1,
      contact_type: "EMAIL ADDRESS",
      contact_details: "N/A",
      contact_remarks: "N/A",
    },
  ]);

  const {
    data: employeesData,
    isLoading: employeesLoading,
    error: employeesError,
  } = useGetEmployeesQuery(undefined, {
    skip: !employeeId,
  });

  const employee = useMemo(() => {
    if (!employeesData || !employeeId) return null;

    console.log("Raw employeesData:", employeesData); // Debug log

    let employee = null;

    // Handle different possible data structures
    if (employeesData.result && employeesData.result.id) {
      // Single employee object in result (like your JSON data)
      employee = employeesData.result;
    } else if (Array.isArray(employeesData)) {
      // Direct array of employees
      employee = employeesData.find((emp) => emp.id === employeeId);
    } else if (
      employeesData.result &&
      Array.isArray(employeesData.result.data)
    ) {
      // Array nested in result.data
      employee = employeesData.result.data.find((emp) => emp.id === employeeId);
    } else if (employeesData.data && Array.isArray(employeesData.data)) {
      // Array nested in data
      employee = employeesData.data.find((emp) => emp.id === employeeId);
    } else if (employeesData.result && Array.isArray(employeesData.result)) {
      // Array directly in result
      employee = employeesData.result.find((emp) => emp.id === employeeId);
    }

    console.log("Found employee:", employee); // Debug log
    return employee;
  }, [employeesData, employeeId]);

  const contactTypeOptions = [
    { value: "MOBILE NUMBER", label: "Mobile Number" },
    { value: "EMAIL ADDRESS", label: "Email Address" },
  ];

  const formatPhoneNumber = (phoneNumber) => {
    if (!phoneNumber || phoneNumber.trim() === "") return "N/A";

    // Remove +63 prefix if present
    let digits = phoneNumber.replace(/^\+63/, "").replace(/\D/g, "");

    // Return N/A if no digits
    if (!digits || digits.trim() === "") return "N/A";

    // Format as XXX-XXX-XXXX
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
    return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
  };

  // Enhanced helper function to ensure N/A is displayed for empty values
  const getDisplayValue = (value) => {
    if (
      value === null ||
      value === undefined ||
      value === "" ||
      (typeof value === "string" && value.trim() === "") ||
      (typeof value === "string" && value.toLowerCase() === "null") ||
      (typeof value === "string" && value.toLowerCase() === "undefined")
    ) {
      return "N/A";
    }
    return value;
  };

  const getContactIcon = (contactType) => {
    switch (contactType) {
      case "MOBILE NUMBER":
        return <PhoneIcon />;
      case "EMAIL ADDRESS":
        return <EmailIcon />;
      default:
        return <ContactIcon />;
    }
  };

  useEffect(() => {
    console.log("useEffect triggered, employee:", employee); // Debug log

    // Always start with N/A values
    const newContactLines = [
      {
        id: "mobile_view",
        index: 0,
        contact_type: "MOBILE NUMBER",
        contact_details: "N/A",
        contact_remarks: "N/A",
      },
      {
        id: "email_view",
        index: 1,
        contact_type: "EMAIL ADDRESS",
        contact_details: "N/A",
        contact_remarks: "N/A",
      },
    ];

    if (employee && employee.contacts && Array.isArray(employee.contacts)) {
      console.log("Processing contacts:", employee.contacts); // Debug log

      // Populate with employee contacts data
      employee.contacts.forEach((contact) => {
        console.log("Processing contact:", contact); // Debug log

        if (contact?.contact_type === "MOBILE NUMBER") {
          // Handle mobile number
          const contactDetails = getDisplayValue(contact?.contact_details);
          if (contactDetails !== "N/A") {
            let displayDetails = contactDetails;
            if (displayDetails.startsWith("+63")) {
              displayDetails = displayDetails.substring(3);
            }
            const formattedPhone = formatPhoneNumber(displayDetails);
            newContactLines[0].contact_details = formattedPhone;
          }

          // Handle mobile remarks
          newContactLines[0].contact_remarks = getDisplayValue(
            contact?.contact_remarks
          );
        } else if (contact?.contact_type === "EMAIL ADDRESS") {
          // Handle email address
          newContactLines[1].contact_details = getDisplayValue(
            contact?.contact_details
          );

          // Handle email remarks
          newContactLines[1].contact_remarks = getDisplayValue(
            contact?.contact_remarks
          );
        }
      });
    }

    console.log("Final contact lines:", newContactLines); // Debug log
    setContactLines(newContactLines);
  }, [employee]);

  if (employeesLoading) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography>Loading contact information...</Typography>
      </Box>
    );
  }

  if (employeesError) {
    return (
      <Box sx={{ p: 2 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          Failed to load employee contact information.
          <br />
          Error: {JSON.stringify(employeesError)}
        </Alert>
      </Box>
    );
  }

  if (!employee) {
    return (
      <Box sx={{ p: 2 }}>
        <Alert severity="warning" sx={{ mb: 3 }}>
          Employee not found. Employee ID: {employeeId}
          <br />
          Data structure: {JSON.stringify(employeesData, null, 2)}
        </Alert>
      </Box>
    );
  }

  return (
    <Box className="general-form" sx={{ p: 2 }}>
      {/* Debug info - remove in production */}
      <Alert severity="info" sx={{ mb: 2 }}>
        <Typography variant="body2">
          Debug: Employee found -{" "}
          {employee.general_info?.full_name || employee.employee_name}
          <br />
          Contacts: {employee.contacts?.length || 0} found
        </Typography>
      </Alert>

      {(!employee.contacts || employee.contacts.length === 0) && (
        <Alert severity="info" sx={{ mb: 3 }}>
          No contact information available for this employee.
        </Alert>
      )}

      {contactLines.map((line, index) => (
        <Box key={String(line.id)} className="contact-line" sx={{ mb: 2 }}>
          <Grid
            container
            spacing={2}
            className="general-form__grid"
            alignItems="center">
            <Grid item xs={1.5} className="general-form__grid-item">
              <FormControl
                fullWidth
                variant="outlined"
                disabled={true}
                className="general-form__select">
                <InputLabel>Contact Type</InputLabel>
                <Select
                  name="contact_type"
                  value={line.contact_type}
                  label="Contact Type"
                  IconComponent={() => null}
                  sx={{
                    "& .MuiSelect-select": {
                      color: "rgba(0, 0, 0, 0.6)",
                    },
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: "rgba(0, 0, 0, 0.23)",
                    },
                    "& .MuiOutlinedInput-root": {
                      backgroundColor: "#f5f5f5",
                      "&:hover .MuiOutlinedInput-notchedOutline": {
                        borderColor: "rgba(0, 0, 0, 0.23)",
                      },
                      "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                        borderColor: "rgba(0, 0, 0, 0.23)",
                        borderWidth: "1px",
                      },
                    },
                  }}>
                  {contactTypeOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      <Box display="flex" alignItems="center" gap={1}>
                        {getContactIcon(option.value)}
                        {option.label}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={2} className="general-form__grid-item">
              <TextField
                label="Contact Details"
                name="contact_details"
                variant="outlined"
                fullWidth
                value={line.contact_details || "N/A"}
                InputProps={{
                  readOnly: true,
                  ...(line.contact_type === "MOBILE NUMBER"
                    ? line.contact_details !== "N/A"
                      ? {
                          startAdornment: (
                            <InputAdornment position="start">
                              +63
                            </InputAdornment>
                          ),
                        }
                      : {}
                    : {
                        startAdornment: (
                          <InputAdornment position="start">
                            {getContactIcon(line.contact_type)}
                          </InputAdornment>
                        ),
                      }),
                }}
                placeholder="N/A"
                className="general-form__text-field"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 1,
                    backgroundColor: "#f5f5f5",
                  },
                  "& .MuiInputBase-input": {
                    color: "#666",
                  },
                }}
              />
            </Grid>

            <Grid item xs={8.5} className="general-form__grid-item">
              <TextField
                label="Contact Remarks (Optional)"
                name="contact_remarks"
                variant="outlined"
                fullWidth
                value={line.contact_remarks || "N/A"}
                InputProps={{
                  readOnly: true,
                }}
                placeholder="N/A"
                multiline
                rows={1}
                className="general-form__text-field"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 1,
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
      ))}
    </Box>
  );
};

ContactViewForm.displayName = "ContactViewForm";

export default ContactViewForm;
