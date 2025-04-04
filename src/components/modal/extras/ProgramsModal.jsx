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
  usePostProgramsMutation,
  useUpdateProgramsMutation,
} from "../../../features/api/extras/programsApi";

export default function ProgramsModal({
  open,
  handleClose,
  refetch,
  showArchived,
  selectedProgram,
}) {
  const [programName, setProgramName] = useState("");
  const [code, setCode] = useState("");
  const [errorMessage, setErrorMessage] = useState(null);
  const [errors, setErrors] = useState({ programName: false, code: false });

  const [postProgram, { isLoading: adding }] = usePostProgramsMutation();
  const [updateProgram, { isLoading: updating }] = useUpdateProgramsMutation();
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    if (open) {
      setProgramName(selectedProgram?.name || "");
      setCode(selectedProgram?.code || "");
      setErrorMessage(null);
      setErrors({ programName: false, code: false });
    }
  }, [open, selectedProgram]);

  const handleSubmit = async () => {
    setErrorMessage(null);
    let newErrors = { programName: false, code: false };

    if (!programName.trim()) newErrors.programName = true;
    if (!code.trim()) newErrors.code = true;

    setErrors(newErrors);

    if (newErrors.programName || newErrors.code) {
      setErrorMessage("Please fill out all required fields.");
      return;
    }

    const payload = {
      name: programName.trim(),
      code: code.trim(),
      status: showArchived ? "inactive" : "active",
    };

    try {
      if (selectedProgram) {
        await updateProgram({ id: selectedProgram.id, ...payload }).unwrap();
        enqueueSnackbar("Program updated successfully!", {
          variant: "success",
          autoHideDuration: 2000,
        });
      } else {
        await postProgram(payload).unwrap();
        enqueueSnackbar("Program added successfully!", {
          variant: "success",
          autoHideDuration: 2000,
        });
      }

      if (typeof refetch === "function") refetch();
      handleClose();
    } catch (error) {
      setErrorMessage(
        error?.data?.errors?.code
          ? "The code has already been taken. Please use a different code."
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
          {selectedProgram ? "Edit Program" : "ADD PROGRAM"}
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
            label="Code"
            variant="outlined"
            fullWidth
            margin="dense"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            disabled={adding || updating}
            error={errors.code}
            helperText={errors.code ? "Code is required" : ""}
            sx={{ marginTop: 3 }}
          />

          <TextField
            label="Program Name"
            variant="outlined"
            fullWidth
            margin="dense"
            value={programName}
            onChange={(e) => setProgramName(e.target.value)}
            disabled={adding || updating}
            error={errors.programName}
            helperText={errors.programName ? "Program Name is required" : ""}
          />
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} disabled={adding || updating}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={adding || updating}>
          {adding || updating
            ? "Saving..."
            : selectedProgram
            ? "Update"
            : "Add"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
