import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useFormContext, Controller } from "react-hook-form";
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
  Typography,
} from "@mui/material";
import {
  Phone as PhoneIcon,
  Email as EmailIcon,
  ContactPhone as ContactIcon,
} from "@mui/icons-material";
import EmployeeHeader from "./EmployeeHeader";

const ContactForm = ({
  selectedContacts = {},
  isLoading = false,
  mode = "create",
  employeeData,
}) => {
  const {
    control,
    formState: { errors },
    setValue,
    watch,
    getValues,
  } = useFormContext();

  const watchedValues = watch();

  const isReadOnly = mode === "view";

  const formatPhoneNumber = useCallback((value) => {
    const digits = value.replace(/\D/g, "");
    const limited = digits.slice(0, 10);
    if (limited.length <= 3) return limited;
    if (limited.length <= 6)
      return `${limited.slice(0, 3)}-${limited.slice(3)}`;
    return `${limited.slice(0, 3)}-${limited.slice(3, 6)}-${limited.slice(6)}`;
  }, []);

  const formatPhoneNumberWithAutoNine = useCallback((value) => {
    const digits = value.replace(/\D/g, "");

    if (!digits) return "9";

    let processedDigits = digits;
    if (digits.length > 0 && digits[0] !== "9") {
      processedDigits = "9" + digits.slice(1);
    }

    const limited = processedDigits.slice(0, 10);

    if (limited.length <= 3) return limited;
    if (limited.length <= 6)
      return `${limited.slice(0, 3)}-${limited.slice(3)}`;
    return `${limited.slice(0, 3)}-${limited.slice(3, 6)}-${limited.slice(6)}`;
  }, []);

  const getBackendFormat = useCallback((formattedValue) => {
    const digits = formattedValue.replace(/\D/g, "");
    if (!digits) return "";
    if (formattedValue.startsWith("+63")) {
      return formattedValue;
    }
    return `+63${digits}`;
  }, []);

  const getContactIcon = useCallback((contactType) => {
    switch (contactType) {
      case "MOBILE NUMBER":
        return <PhoneIcon />;
      case "EMAIL ADDRESS":
        return <EmailIcon />;
      default:
        return <ContactIcon />;
    }
  }, []);

  useEffect(() => {
    if (selectedContacts && mode === "edit") {
      if (selectedContacts.mobile_number) {
        let displayDetails = selectedContacts.mobile_number;
        if (displayDetails.startsWith("+63")) {
          displayDetails = displayDetails.substring(3);
          displayDetails = formatPhoneNumber(displayDetails);
        }
        setValue("mobile_number", displayDetails);
      }

      if (selectedContacts.email_address) {
        setValue("email_address", selectedContacts.email_address);
      }

      if (selectedContacts.contact_remarks) {
        setValue("contact_remarks", selectedContacts.contact_remarks);
      }
    }
  }, [selectedContacts, mode, setValue, formatPhoneNumber]);

  const handlePhoneChange = (field, value) => {
    if (isReadOnly) return;

    const formattedValue = formatPhoneNumberWithAutoNine(value);
    field.onChange(formattedValue);
  };

  return (
    <Box
      className="contact-form"
      sx={{ width: "100%", maxWidth: "1200px", p: 2 }}>
      <EmployeeHeader getValues={getValues} selectedGeneral={employeeData} />

      <Grid container spacing={1.3} className="general-form__grid">
        <Grid item xs={12} sm={6} sx={{ minWidth: "547px", maxWidth: "547px" }}>
          <Controller
            name="mobile_number"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label={
                  <>
                    Mobile Number <span style={{ color: "red" }}>*</span>
                  </>
                }
                variant="outlined"
                fullWidth
                onChange={(e) => handlePhoneChange(field, e.target.value)}
                disabled={isLoading || isReadOnly}
                error={!!errors.mobile_number}
                helperText={errors.mobile_number?.message}
                placeholder="9xx-xxx-xxxx"
                inputProps={{
                  maxLength: 12,
                  readOnly: isReadOnly,
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">+63</InputAdornment>
                  ),
                  readOnly: isReadOnly,
                }}
                className="general-form__text-field"
              />
            )}
          />
        </Grid>

        <Grid item xs={12} sm={6} sx={{ minWidth: "547px", maxWidth: "547px" }}>
          <Controller
            name="mobile_remarks"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Mobile Remarks (Optional)"
                variant="outlined"
                fullWidth
                disabled={isLoading || isReadOnly}
                placeholder="Mobile contact remarks (Optional)"
                multiline
                rows={1}
                InputProps={{
                  readOnly: isReadOnly,
                }}
                className="general-form__text-field"
              />
            )}
          />
        </Grid>

        <Grid item xs={12} sm={6} sx={{ minWidth: "547px", maxWidth: "547px" }}>
          <Controller
            name="email_address"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label={
                  <>
                    Email Address <span style={{ color: "red" }}>*</span>
                  </>
                }
                variant="outlined"
                fullWidth
                disabled={isLoading || isReadOnly}
                error={!!errors.email_address}
                helperText={errors.email_address?.message}
                placeholder="Enter email address"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon />
                    </InputAdornment>
                  ),
                  readOnly: isReadOnly,
                }}
                className="general-form__text-field"
              />
            )}
          />
        </Grid>

        <Grid item xs={12} sm={6} sx={{ minWidth: "547px", maxWidth: "547px" }}>
          <Controller
            name="email_remarks"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Email Remarks (Optional)"
                variant="outlined"
                fullWidth
                disabled={isLoading || isReadOnly}
                placeholder="Email contact remarks (Optional)"
                multiline
                rows={1}
                InputProps={{
                  readOnly: isReadOnly,
                }}
                className="general-form__text-field"
              />
            )}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

ContactForm.displayName = "ContactForm";

export default ContactForm;
