import React, { useState, useEffect } from "react";
import {
  Button,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Box,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
} from "@mui/material";
import { useSnackbar } from "notistack";
import { useUpdatePositionMutation } from "../../../features/api/masterlist/positionsApi";
import { CONSTANT } from "../../../config";

export default function PositionEmpModal({
  open,
  handleClose,
  refetch,
  selectedPosition,
}) {
  const [employeeCode, setEmployeeCode] = useState("");
  const [employeeName, setEmployeeName] = useState("");
  const [positionCode, setPositionCode] = useState("");
  const [positionTitle, setPositionTitle] = useState("");
  const [schedule, setSchedule] = useState("");
  const [jobLevel, setJobLevel] = useState("");
  const [jobRate, setJobRate] = useState("");
  const [allowance, setAllowance] = useState("");
  const [salary, setSalary] = useState("");
  const [tools, setTools] = useState("");
  const [status, setStatus] = useState("active");
  const [errorMessage, setErrorMessage] = useState(null);
  const [errors, setErrors] = useState({
    employeeCode: false,
    positionCode: false,
    positionTitle: false,
    jobRate: false,
  });

  const [updatePosition, { isLoading: updating }] = useUpdatePositionMutation();
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    if (open && selectedPosition) {
      setEmployeeCode(selectedPosition?.employee?.employee_code || "");
      setEmployeeName(selectedPosition?.employee?.full_name || "");
      setPositionCode(selectedPosition?.position?.code || "");
      setPositionTitle(selectedPosition?.position?.title_id || "");
      setSchedule(selectedPosition?.schedule?.name || "");
      setJobLevel(selectedPosition?.job_level?.name || "");
      setJobRate(selectedPosition?.job_rate || "");
      setAllowance(selectedPosition?.allowance || "");
      setSalary(selectedPosition?.salary || "");
      setTools(
        selectedPosition?.additional_tools ||
          selectedPosition?.position?.tools?.join(", ") ||
          ""
      );
      setStatus(selectedPosition?.deleted_at ? "inactive" : "active");
      setErrorMessage(null);
      setErrors({
        employeeCode: false,
        positionCode: false,
        positionTitle: false,
        jobRate: false,
      });
    }
  }, [open, selectedPosition]);

  const handleSubmit = async () => {
    setErrorMessage(null);
    let newErrors = {
      employeeCode: false,
      positionCode: false,
      positionTitle: false,
      jobRate: false,
    };

    if (!employeeCode.trim()) newErrors.employeeCode = true;
    if (!positionCode.trim()) newErrors.positionCode = true;
    if (!positionTitle.trim()) newErrors.positionTitle = true;
    if (!jobRate || isNaN(jobRate) || Number(jobRate) <= 0)
      newErrors.jobRate = true;

    setErrors(newErrors);

    if (Object.values(newErrors).some((error) => error)) {
      setErrorMessage("Please fill out all required fields correctly.");
      return;
    }

    const payload = {
      employee_code: employeeCode.trim(),
      position_code: positionCode.trim(),
      position_title: positionTitle.trim(),
      schedule: schedule.trim() || null,
      job_level: jobLevel.trim() || null,
      job_rate: Number(jobRate),
      allowance: allowance ? Number(allowance) : null,
      salary: salary ? Number(salary) : null,
      additional_tools: tools.trim() || null,
      status: status,
    };

    try {
      await updatePosition({ id: selectedPosition.id, ...payload }).unwrap();
      enqueueSnackbar("Employee position updated successfully!", {
        variant: "success",
        autoHideDuration: 2000,
      });
      refetch();
      handleClose();
    } catch (error) {
      console.error("Error:", error);
      setErrorMessage(
        error?.data?.message || "An error occurred. Please try again."
      );
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle
        sx={{
          backgroundColor: "#E3F2FD",
          fontWeight: "bold",
          fontSize: "1.2rem",
          padding: "12px 16px",
        }}>
        <Box sx={{ marginLeft: "4px", display: "inline-block" }}>
          Edit Employee Position
        </Box>
      </DialogTitle>

      <DialogContent>
        <Box minWidth={400}>
          {errorMessage && (
            <Alert severity="error" sx={{ marginTop: 1, marginBottom: 2 }}>
              {errorMessage}
            </Alert>
          )}

          <Grid container spacing={2} sx={{ marginTop: 1 }}>
            {/* Employee Information */}
            <Grid item xs={12} md={6}>
              <TextField
                label="Employee Code *"
                variant="outlined"
                fullWidth
                value={employeeCode}
                onChange={(e) => setEmployeeCode(e.target.value)}
                disabled={updating}
                error={errors.employeeCode}
                helperText={
                  errors.employeeCode ? "Employee Code is required" : ""
                }
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                label="Employee Name"
                variant="outlined"
                fullWidth
                value={employeeName}
                disabled={true}
                sx={{ backgroundColor: "#f5f5f5" }}
                helperText="Auto-populated based on employee code"
              />
            </Grid>

            {/* Position Information */}
            <Grid item xs={12} md={6}>
              <TextField
                label="Position Code *"
                variant="outlined"
                fullWidth
                value={positionCode}
                onChange={(e) => setPositionCode(e.target.value)}
                disabled={updating}
                error={errors.positionCode}
                helperText={
                  errors.positionCode ? "Position Code is required" : ""
                }
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                label="Position Title *"
                variant="outlined"
                fullWidth
                value={positionTitle}
                onChange={(e) => setPositionTitle(e.target.value)}
                disabled={updating}
                error={errors.positionTitle}
                helperText={
                  errors.positionTitle ? "Position Title is required" : ""
                }
              />
            </Grid>

            {/* Schedule and Job Level */}
            <Grid item xs={12} md={6}>
              <TextField
                label="Schedule"
                variant="outlined"
                fullWidth
                value={schedule}
                onChange={(e) => setSchedule(e.target.value)}
                disabled={updating}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                label="Job Level"
                variant="outlined"
                fullWidth
                value={jobLevel}
                onChange={(e) => setJobLevel(e.target.value)}
                disabled={updating}
              />
            </Grid>

            {/* Financial Information */}
            <Grid item xs={12} md={4}>
              <TextField
                label="Job Rate *"
                variant="outlined"
                fullWidth
                type="number"
                value={jobRate}
                onChange={(e) => setJobRate(e.target.value)}
                disabled={updating}
                error={errors.jobRate}
                helperText={errors.jobRate ? "Valid job rate is required" : "₱"}
                InputProps={{
                  inputProps: { min: 0, step: 0.01 },
                }}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                label="Allowance"
                variant="outlined"
                fullWidth
                type="number"
                value={allowance}
                onChange={(e) => setAllowance(e.target.value)}
                disabled={updating}
                helperText="₱"
                InputProps={{
                  inputProps: { min: 0, step: 0.01 },
                }}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                label="Salary"
                variant="outlined"
                fullWidth
                type="number"
                value={salary}
                onChange={(e) => setSalary(e.target.value)}
                disabled={updating}
                helperText="₱"
                InputProps={{
                  inputProps: { min: 0, step: 0.01 },
                }}
              />
            </Grid>

            {/* Tools and Status */}
            <Grid item xs={12} md={8}>
              <TextField
                label="Tools"
                variant="outlined"
                fullWidth
                multiline
                rows={2}
                value={tools}
                onChange={(e) => setTools(e.target.value)}
                disabled={updating}
                helperText="Additional tools or equipment needed"
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={status}
                  label="Status"
                  onChange={(e) => setStatus(e.target.value)}
                  disabled={updating}>
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={handleClose} disabled={updating}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} variant="contained" disabled={updating}>
          {updating ? (
            "Updating..."
          ) : (
            <>
              {CONSTANT.BUTTONS.ADD.icon2}
              {CONSTANT.BUTTONS.ADD.label2}
            </>
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
