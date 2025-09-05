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
} from "@mui/material";
import { useSnackbar } from "notistack";
import {
  usePostJobbandMutation,
  useUpdateJobbandMutation,
} from "../../../features/api/masterlist/jobbandsApi";
import { CONSTANT } from "../../../config";

export default function JobbandsModal({
  open,
  handleClose,
  refetch,
  showArchived,
  selectedJobband,
}) {
  const [jobbandName, setJobbandName] = useState("");
  const [jobbandCode, setJobbandCode] = useState("");
  const [subUnitBound, setSubUnitBound] = useState("");
  const [errorMessage, setErrorMessage] = useState(null);
  const [errors, setErrors] = useState({
    jobbandName: false,
    jobbandCode: false,
  });

  const [postJobband, { isLoading: adding }] = usePostJobbandMutation();
  const [updateJobband, { isLoading: updating }] = useUpdateJobbandMutation();
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    if (open && selectedJobband) {
      setJobbandName(selectedJobband?.name || "");
      setJobbandCode(selectedJobband?.code || "");
      setSubUnitBound(selectedJobband?.sub_unit_bound || "");
      setErrorMessage(null);
      setErrors({
        jobbandName: false,
        jobbandCode: false,
      });
    } else if (!selectedJobband) {
      setJobbandName("");
      setJobbandCode("");
      setSubUnitBound("");
      setErrorMessage(null);
      setErrors({
        jobbandName: false,
        jobbandCode: false,
      });
    }
  }, [open, selectedJobband]);

  const handleSubmit = async () => {
    setErrorMessage(null);
    let newErrors = {
      jobbandName: false,
      jobbandCode: false,
    };

    if (!jobbandName.trim()) newErrors.jobbandName = true;
    if (!jobbandCode.trim()) newErrors.jobbandCode = true;

    setErrors(newErrors);

    if (newErrors.jobbandName || newErrors.jobbandCode) {
      setErrorMessage("Please fill out all required fields.");
      return;
    }

    const payload = {
      code: jobbandCode.trim(),
      name: jobbandName.trim(),
      sub_unit_bound: subUnitBound.trim() || null,
      status: showArchived ? "inactive" : "active",
    };

    try {
      if (selectedJobband) {
        await updateJobband({ id: selectedJobband.id, ...payload }).unwrap();
        enqueueSnackbar("Jobband updated successfully!", {
          variant: "success",
          autoHideDuration: 2000,
        });
      } else {
        await postJobband(payload).unwrap();
        enqueueSnackbar("Jobband added successfully!", {
          variant: "success",
          autoHideDuration: 2000,
        });
      }
      refetch();
      handleClose();
    } catch (error) {
      console.error("Error:", error);
      setErrorMessage(
        error?.data?.errors?.name
          ? "The jobband name already exists. Please use a different name."
          : error?.data?.message || "An error occurred. Please try again."
      );
    }
  };

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle
        sx={{
          backgroundColor: "#E3F2FD",
          fontWeight: "bold",
          fontSize: "1.2rem",
          padding: "12px 16px",
        }}>
        <Box sx={{ marginLeft: "4px", display: "inline-block" }}>
          {selectedJobband ? "Edit Jobband" : "Add Job-Band"}
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
            label="Jobband Code"
            variant="outlined"
            fullWidth
            margin="dense"
            value={jobbandCode}
            onChange={(e) => setJobbandCode(e.target.value)}
            disabled={adding || updating}
            error={errors.jobbandCode}
            helperText={errors.jobbandCode ? "Jobband Code is required" : ""}
            sx={{ marginTop: 3 }}
          />
          <TextField
            label="Jobband Name"
            variant="outlined"
            fullWidth
            margin="dense"
            value={jobbandName}
            onChange={(e) => setJobbandName(e.target.value)}
            disabled={adding || updating}
            error={errors.jobbandName}
            helperText={errors.jobbandName ? "Jobband Name is required" : ""}
          />
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={handleClose} disabled={adding || updating}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={adding || updating}>
          {adding || updating ? (
            "Saving..."
          ) : (
            <>
              {selectedJobband
                ? CONSTANT.BUTTONS.ADD.icon2
                : CONSTANT.BUTTONS.ADD.icon1}
              {selectedJobband
                ? CONSTANT.BUTTONS.ADD.label2
                : CONSTANT.BUTTONS.ADD.label1}
            </>
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
