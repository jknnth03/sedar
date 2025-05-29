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
  Autocomplete,
} from "@mui/material";
import { useSnackbar } from "notistack";
import {
  usePostJobrateMutation,
  useUpdateJobrateMutation,
} from "../../../features/api/masterlist/jobratesApi";
import { CONSTANT } from "../../../config";
import { useGetAllPositionsQuery } from "../../../features/api/masterlist/positionsApi";
import { useGetAllJobLevelsQuery } from "../../../features/api/masterlist/joblevelsApi";

export default function JobRatesModal({
  open,
  handleClose,
  refetch,
  showArchived,
  selectedJobRate,
}) {
  const [jobrateCode, setJobrateCode] = useState("");
  const [position, setPosition] = useState(null);
  const [jobLevel, setJobLevel] = useState(null);
  const [jobRate, setJobRate] = useState("");
  const [allowance, setAllowance] = useState("");
  const [errorMessage, setErrorMessage] = useState(null);
  const [error, setError] = useState(false);

  const [postJobrate, { isLoading: adding }] = usePostJobrateMutation();
  const [updateJobrate, { isLoading: updating }] = useUpdateJobrateMutation();
  const { enqueueSnackbar } = useSnackbar();
  const { data: positions, isLoading: positionsLoading } =
    useGetAllPositionsQuery();
  const { data: jobLevels, isLoading: jobLevelsLoading } =
    useGetAllJobLevelsQuery();

  useEffect(() => {
    if (open && selectedJobRate) {
      setJobrateCode(selectedJobRate?.code || "");
      setPosition(
        positions?.result?.find((p) => p.id === selectedJobRate?.position_id) ||
          null
      );
      setJobLevel(
        jobLevels?.result?.find(
          (jl) => jl.id === selectedJobRate?.job_level_id
        ) || null
      );
      setJobRate(selectedJobRate?.job_rate || "");
      setAllowance(selectedJobRate?.allowance || "");
      setError(false);
      setErrorMessage(null);
    } else if (!selectedJobRate) {
      setJobrateCode("");
      setPosition(null);
      setJobLevel(null);
      setJobRate("");
      setAllowance("");
      setError(false);
      setErrorMessage(null);
    }
  }, [open, selectedJobRate, positions, jobLevels]);

  const handleSubmit = async () => {
    if (
      !jobrateCode.trim() ||
      !position ||
      !jobLevel ||
      !jobRate ||
      !allowance
    ) {
      setError(true);
      setErrorMessage("All fields are required.");
      return;
    }

    const payload = {
      code: jobrateCode.trim(),
      position_id: position.id,
      job_level_id: jobLevel.id,
      job_rate: parseFloat(jobRate),
      allowance: parseFloat(allowance),
      status: showArchived ? "inactive" : "active",
    };

    try {
      if (selectedJobRate) {
        await updateJobrate({ id: selectedJobRate.id, ...payload }).unwrap();
        enqueueSnackbar("Job rate updated successfully!", {
          variant: "success",
          autoHideDuration: 2000,
        });
      } else {
        await postJobrate(payload).unwrap();
        enqueueSnackbar("Job rate added successfully!", {
          variant: "success",
          autoHideDuration: 2000,
        });
      }

      refetch();
      handleClose();
    } catch (error) {
      console.error("Error:", error);
      setErrorMessage(
        error?.data?.errors?.code
          ? "The job rate code already exists."
          : error?.data?.message || "An error occurred. Please try again."
      );
    }
  };

  const jobLevelOptions = Array.isArray(jobLevels?.result)
    ? jobLevels.result
    : [];
  const positionOptions = Array.isArray(positions?.result)
    ? positions.result
    : [];

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle className="dialog_title">
        <Box className="dialog_title_text">
          {selectedJobRate ? "EDIT JOB-RATE" : "ADD JOB-RATE"}
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box minWidth={300}>
          {errorMessage && (
            <Alert severity="error" sx={{ marginTop: 1 }}>
              {errorMessage}
            </Alert>
          )}

          <TextField
            label="Job Rate Code"
            variant="outlined"
            fullWidth
            margin="dense"
            value={jobrateCode}
            onChange={(e) => {
              setJobrateCode(e.target.value);
              setError(false);
              setErrorMessage(null);
            }}
            disabled={adding || updating}
            error={error}
            helperText={error ? "Job Rate Code is required" : ""}
            sx={{ marginTop: 3 }}
          />

          <Autocomplete
            value={position}
            onChange={(_, newPosition) => setPosition(newPosition)}
            options={positionOptions}
            getOptionLabel={(option) => option.title?.name || ""}
            loading={positionsLoading}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Position"
                margin="dense"
                error={error}
                helperText={error ? "Position is required" : ""}
                disabled={adding || updating}
              />
            )}
            isOptionEqualToValue={(option, value) => option.id === value?.id}
          />

          <Autocomplete
            value={jobLevel}
            onChange={(_, newJobLevel) => setJobLevel(newJobLevel)}
            options={jobLevelOptions}
            getOptionLabel={(option) => option.label || ""}
            loading={jobLevelsLoading}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Job Level"
                margin="dense"
                error={error}
                helperText={error ? "Job Level is required" : ""}
                disabled={adding || updating}
              />
            )}
            isOptionEqualToValue={(option, value) => option.id === value?.id}
          />

          <TextField
            label="Job Rate"
            variant="outlined"
            fullWidth
            margin="dense"
            value={jobRate}
            onChange={(e) => {
              setJobRate(e.target.value);
              setError(false);
              setErrorMessage(null);
            }}
            disabled={adding || updating}
            error={error}
            helperText={error ? "Job Rate is required" : ""}
          />

          <TextField
            label="Allowance"
            variant="outlined"
            fullWidth
            margin="dense"
            value={allowance}
            onChange={(e) => {
              setAllowance(e.target.value);
              setError(false);
              setErrorMessage(null);
            }}
            disabled={adding || updating}
            error={error}
            helperText={error ? "Allowance is required" : ""}
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button
          variant="contained"
          color="inherit"
          className="cancel_button"
          onClick={handleClose}
          size="medium"
          disabled={adding || updating}>
          <>
            {CONSTANT.BUTTONS.CANCEL.icon}
            {CONSTANT.BUTTONS.CANCEL.label}
          </>
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          size="medium"
          className="add_button"
          disabled={adding || updating}>
          {adding || updating ? (
            "Saving..."
          ) : (
            <>
              {selectedJobRate
                ? CONSTANT.BUTTONS.ADD.icon2
                : CONSTANT.BUTTONS.ADD.icon1}
              {selectedJobRate
                ? CONSTANT.BUTTONS.ADD.label2
                : CONSTANT.BUTTONS.ADD.label1}
            </>
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
