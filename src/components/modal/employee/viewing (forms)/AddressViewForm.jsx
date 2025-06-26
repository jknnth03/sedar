import React, { useEffect, useState } from "react";
import { Box, Alert, Grid, TextField, Typography } from "@mui/material";
import "../../employee/forms/General.scss";

const AddressViewForm = ({ selectedAddress, employeeId, ...props }) => {
  const [addressData, setAddressData] = useState({
    region: "",
    province: "",
    city_municipality: "",
    sub_municipality: "",
    barangay: "",
    street: "",
    zip_code: "",
    local_address: "",
    foreign_address: "",
    remarks: "",
  });

  // Helper function to return "N/A" if value is empty or null
  const getDisplayValue = (value) => {
    return value && value.trim() !== "" ? value : "N/A";
  };

  // Update form data when selectedAddress prop changes
  useEffect(() => {
    if (selectedAddress) {
      setAddressData({
        region: selectedAddress.region?.name || selectedAddress.region || "",
        province:
          selectedAddress.province?.name || selectedAddress.province || "",
        city_municipality:
          selectedAddress.city_municipality?.name ||
          selectedAddress.city_municipality ||
          "",
        sub_municipality:
          selectedAddress.sub_municipality?.name ||
          selectedAddress.sub_municipality ||
          "",
        barangay:
          selectedAddress.barangay?.name || selectedAddress.barangay || "",
        street: selectedAddress.street || "",
        zip_code: selectedAddress.zip_code || "",
        local_address: selectedAddress.local_address || "",
        foreign_address: selectedAddress.foreign_address || "",
        remarks: selectedAddress.remarks || "",
      });
    }
  }, [selectedAddress]);

  // No address data
  if (!selectedAddress) {
    return (
      <Box className="general-form">
        <Alert severity="info" className="general-form__alert">
          No address information available for this employee.
        </Alert>
      </Box>
    );
  }

  return (
    <Box className="general-form">
      <Grid container spacing={2} className="general-form__grid">
        {/* Row 1: Region, Province, City/Municipality, Sub-Municipality */}
        <Grid item xs={3} className="general-form__grid-item">
          <TextField
            label="Region"
            name="region"
            variant="outlined"
            fullWidth
            value={getDisplayValue(addressData.region)}
            InputProps={{
              readOnly: true,
            }}
            placeholder="Not provided"
            className="general-form__text-field"
            sx={{
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
            label="Province"
            name="province"
            variant="outlined"
            fullWidth
            value={getDisplayValue(addressData.province)}
            InputProps={{
              readOnly: true,
            }}
            placeholder="Not provided"
            className="general-form__text-field"
            sx={{
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
            label="City/Municipality"
            name="city_municipality"
            variant="outlined"
            fullWidth
            value={getDisplayValue(addressData.city_municipality)}
            InputProps={{
              readOnly: true,
            }}
            placeholder="Not provided"
            className="general-form__text-field"
            sx={{
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
            label="Sub-Municipality"
            name="sub_municipality"
            variant="outlined"
            fullWidth
            value={getDisplayValue(addressData.sub_municipality)}
            InputProps={{
              readOnly: true,
            }}
            placeholder="Not provided"
            className="general-form__text-field"
            sx={{
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

        {/* Row 2: Barangay, Street, Zip Code */}
        <Grid item xs={3} className="general-form__grid-item">
          <TextField
            label="Barangay"
            name="barangay"
            variant="outlined"
            fullWidth
            value={getDisplayValue(addressData.barangay)}
            InputProps={{
              readOnly: true,
            }}
            placeholder="Not provided"
            className="general-form__text-field"
            sx={{
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
            label="Street"
            name="street"
            variant="outlined"
            fullWidth
            value={getDisplayValue(addressData.street)}
            InputProps={{
              readOnly: true,
            }}
            placeholder="Not provided"
            className="general-form__text-field"
            sx={{
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
            label="Zip Code"
            name="zip_code"
            variant="outlined"
            fullWidth
            value={getDisplayValue(addressData.zip_code)}
            InputProps={{
              readOnly: true,
            }}
            placeholder="Not provided"
            className="general-form__text-field"
            sx={{
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

        {/* Row 3: Full Local Address (spans 2 columns to match original width) */}
        <Grid item xs={6} className="general-form__grid-item">
          <TextField
            label="Full Local Address"
            name="local_address"
            variant="outlined"
            fullWidth
            value={getDisplayValue(addressData.local_address)}
            InputProps={{
              readOnly: true,
            }}
            placeholder="Not provided"
            sx={{
              width: "724px",
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

        {/* Row 5: Address Remarks (spans full width) */}
        <Grid item xs={12} className="general-form__grid-item">
          <TextField
            label="Address Remarks"
            name="remarks"
            variant="outlined"
            multiline
            rows={2}
            fullWidth
            value={getDisplayValue(addressData.remarks)}
            InputProps={{
              readOnly: true,
            }}
            placeholder="No remarks provided"
            sx={{
              width: "1096px",
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
      </Grid>
    </Box>
  );
};

AddressViewForm.displayName = "AddressViewForm";

export default AddressViewForm;
