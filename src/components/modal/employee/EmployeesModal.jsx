import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stepper,
  Step,
  StepLabel,
  Button,
  TextField,
  Grid,
  Box,
  Autocomplete,
  CircularProgress,
} from "@mui/material";
import { useGetAllShowPrefixesQuery } from "../../../features/api/extras/prefixesApi";
import { useGetAllPositionsQuery } from "../../../features/api/masterlist/positionsApi";
import { useGetAllShowProgramsQuery } from "../../../features/api/extras/programsApi";
import { useGetAllShowDegreesQuery } from "../../../features/api/extras/degreesApi";
import { useGetAllShowBanksQuery } from "../../../features/api/extras/banksApi";
import { useGetAllShowReligionsQuery } from "../../../features/api/extras/religionsApi";

const steps = [
  "General Info",
  "Position",
  "Employment Type",
  "Address",
  "Attainment",
  "Account",
  "Contact",
  "File",
];

const EmployeesModal = ({ open, onClose, employeeId, refetch }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: prefixes, isLoading: loadingPrefixes } =
    useGetAllShowPrefixesQuery();
  const { data: religions, isLoading: loadingReligions } =
    useGetAllShowReligionsQuery();
  const { data: positions, isLoading: loadingPositions } =
    useGetAllPositionsQuery();
  const { data: programs, isLoading: loadingPrograms } =
    useGetAllShowProgramsQuery();
  const { data: degrees, isLoading: loadingDegrees } =
    useGetAllShowDegreesQuery();
  const { data: banks, isLoading: loadingBanks } = useGetAllShowBanksQuery();
  const requiredFields = {
    0: [
      "first_name",
      "middle_name",
      "last_name",
      "code",
      "suffix",
      "prefix_id",
      "id_number",
      "birth_date",
      "civil_status",
      "gender",
    ],
    1: ["position_id", "job_level_id", "job_rate"],
  };

  const isValidStep = (stepIndex) => {
    return requiredFields[stepIndex].every((field) => formData[field]);
  };

  const handleNext = () => {
    if (isValidStep(activeStep)) {
      if (activeStep === steps.length - 1) {
        handleSubmit();
      } else {
        setActiveStep((prevStep) => prevStep + 1);
      }
    } else {
      alert("Please fill in all required fields.");
    }
  };
  const calculateAge = (birthDate) => {
    const today = new Date();
    const birthDateObj = new Date(birthDate);
    let age = today.getFullYear() - birthDateObj.getFullYear();
    const m = today.getMonth() - birthDateObj.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDateObj.getDate())) {
      age--;
    }
    return age;
  };
  const handleDateChange = (e) => {
    const selectedDate = e.target.value;
    const age = calculateAge(selectedDate); // Calculate the age
    setFormData((prevData) => ({
      ...prevData,
      birth_date: selectedDate,
      age: age, // Set the calculated age
    }));
  };

  useEffect(() => {
    if (employeeId) {
      setFormData({});
    }
  }, [employeeId]);

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleClose = () => {
    onClose();
    setActiveStep(0);
    setFormData({});
  };

  const handleSubmit = () => {
    setIsSubmitting(true);
    // Submit logic here
    setIsSubmitting(false);
    handleClose();
  };

  const handleChange = (e, overrideValue) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: overrideValue !== undefined ? overrideValue : value,
    }));
  };

  const renderStepContent = (stepIndex) => {
    switch (stepIndex) {
      case 0: // General Info
        return (
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <TextField
                label="First Name"
                name="first_name"
                value={formData.first_name || ""}
                onChange={handleChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                label="Middle Name"
                name="middle_name"
                value={formData.middle_name || ""}
                onChange={handleChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                label="Last Name"
                name="last_name"
                value={formData.last_name || ""}
                onChange={handleChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                label="Code"
                name="code"
                value={formData.code || ""}
                onChange={handleChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                label="Suffix"
                name="suffix"
                value={formData.suffix || ""}
                onChange={handleChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <Autocomplete
                options={prefixes?.result || []}
                getOptionLabel={(option) => option.name || ""}
                value={
                  prefixes?.result?.find((p) => p.id === formData.prefix_id) ||
                  null
                }
                onChange={(event, newValue) =>
                  handleChange(
                    { target: { name: "prefix_id" } },
                    newValue?.id || ""
                  )
                }
                renderInput={(params) => (
                  <TextField {...params} label="Prefix" />
                )}
                loading={loadingPrefixes}
                fullWidth
                isOptionEqualToValue={(option, value) => option.id === value.id}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                label="ID Number"
                name="id_number"
                value={formData.id_number || ""}
                onChange={handleChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                label="Birth Date"
                name="birth_date"
                type="date"
                value={formData.birth_date || ""}
                onChange={handleDateChange}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                label="Age"
                name="age"
                value={formData.age || ""}
                onChange={handleChange}
                fullWidth
                disabled
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <Autocomplete
                options={religions?.result || []}
                getOptionLabel={(option) => option.name || ""}
                value={
                  religions?.result?.find(
                    (r) => r.id === formData.religion_id
                  ) || null
                }
                onChange={(event, newValue) =>
                  handleChange(
                    { target: { name: "religion_id" } },
                    newValue?.id || ""
                  )
                }
                renderInput={(params) => (
                  <TextField {...params} label="Religion" />
                )}
                loading={loadingReligions}
                fullWidth
                isOptionEqualToValue={(option, value) => option.id === value.id}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <Autocomplete
                options={[{ label: "Single" }, { label: "Married" }]}
                getOptionLabel={(option) => option.label || ""}
                value={
                  formData.civil_status
                    ? { label: formData.civil_status }
                    : null
                }
                onChange={(event, newValue) =>
                  handleChange(
                    { target: { name: "civil_status" } },
                    newValue?.label || ""
                  )
                }
                renderInput={(params) => (
                  <TextField {...params} label="Civil Status" />
                )}
                fullWidth
                isOptionEqualToValue={(option, value) =>
                  option.label === value.label
                }
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <Autocomplete
                options={[{ label: "Male" }, { label: "Female" }]}
                getOptionLabel={(option) => option.label || ""}
                value={formData.gender ? { label: formData.gender } : null}
                onChange={(event, newValue) =>
                  handleChange(
                    { target: { name: "gender" } },
                    newValue?.label || ""
                  )
                }
                renderInput={(params) => (
                  <TextField {...params} label="Gender" />
                )}
                fullWidth
                isOptionEqualToValue={(option, value) =>
                  option.label === value.label
                }
              />
            </Grid>
          </Grid>
        );

      case 1: // Position
        return (
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Autocomplete
                options={positions?.result || []}
                getOptionLabel={(option) => option.title?.name || ""}
                value={
                  positions?.result?.find(
                    (p) => p.id === formData.position_id
                  ) || null
                }
                onChange={(event, newValue) =>
                  handleChange(
                    { target: { name: "position_id" } },
                    newValue?.id || ""
                  )
                }
                renderInput={(params) => (
                  <TextField {...params} label="Position" />
                )}
                renderOption={(props, option) => (
                  <li {...props} key={option.id}>
                    {option.title?.name || ""}
                  </li>
                )}
                loading={loadingPositions}
                fullWidth
                isOptionEqualToValue={(option, value) =>
                  option?.id === value?.id
                }
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Autocomplete
                options={positions?.result || []}
                getOptionLabel={(option) => option?.name || ""} // Display schedule name
                value={
                  positions?.result?.find(
                    (s) => s.id === formData.schedule_id
                  ) || null
                }
                onChange={(event, newValue) =>
                  handleChange(
                    { target: { name: "schedule_id" } },
                    newValue?.id || "" // Update the formData with selected schedule ID
                  )
                }
                renderInput={(params) => (
                  <TextField {...params} label="Schedule" />
                )}
                loading={loadingPositions} // Show loading state while fetching positions
                fullWidth
                disabled={!formData.position_id} // Disable until position is selected
                isOptionEqualToValue={(option, value) => option.id === value.id} // Ensure correct comparison
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Job Level"
                name="job_level_id"
                value={formData.job_level_id || ""}
                onChange={handleChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Job Rate"
                name="job_rate"
                value={formData.job_rate || ""}
                onChange={handleChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Allowance"
                name="allowance"
                value={formData.allowance || ""}
                onChange={handleChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Additional Rate"
                name="additional_rate"
                value={formData.additional_rate || ""}
                onChange={handleChange}
                fullWidth
              />
            </Grid>
          </Grid>
        );

      default:
        return <p>Step not yet implemented.</p>;
    }
  };

  const isLoading =
    loadingPrefixes ||
    loadingReligions ||
    loadingPositions ||
    loadingPrograms ||
    loadingDegrees ||
    loadingBanks;

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="md"
      PaperProps={{ sx: { borderRadius: 4 } }}>
      <DialogTitle
        sx={{
          backgroundColor: "#E3F2FD",
          fontWeight: "bold",
          fontSize: "1.2rem",
          padding: "12px 16px",
          marginBottom: "16px",
        }}>
        {employeeId ? "Edit Employee" : "Add New Employee"}
      </DialogTitle>
      <DialogContent>
        <Stepper activeStep={activeStep} alternativeLabel>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        <Box mt={2}>
          {isLoading ? (
            <Box display="flex" justifyContent="center" my={4}>
              <CircularProgress />
            </Box>
          ) : (
            renderStepContent(activeStep)
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ justifyContent: "space-between", px: 3, pb: 2 }}>
        <Button
          onClick={handleClose}
          variant="outlined"
          color="secondary"
          disabled={isSubmitting}>
          Cancel
        </Button>
        <Box>
          <Button disabled={activeStep === 0} onClick={handleBack}>
            Back
          </Button>
          <Button
            onClick={handleNext}
            color="primary"
            variant="contained"
            disabled={isSubmitting || !isValidStep(activeStep)}>
            {activeStep === steps.length - 1 ? "Submit" : "Next"}
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
};

export default EmployeesModal;
