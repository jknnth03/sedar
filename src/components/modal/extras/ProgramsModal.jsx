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
import { CONSTANT } from "../../../config";

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
      if (selectedProgram) {
        setProgramName(selectedProgram?.name || "");
        setCode(selectedProgram?.code || "");
      } else {
        setProgramName("");
        setCode("");
      }

      setErrorMessage(null);
      setErrors({ programName: false, code: false });
    }
  }, [open, selectedProgram]);

  const handleSubmit = async () => {
    setErrorMessage(null);

    const newErrors = {
      programName: !programName.trim(),
      code: !code.trim(),
    };
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
        });
      } else {
        await postProgram(payload).unwrap();
        enqueueSnackbar("Program created successfully!", {
          variant: "success",
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
      <DialogTitle className="dialog_title">
        <Box className="dialog_title_text">
          {selectedProgram ? "EDIT PROGRAM" : "ADD PROGRAM"}
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
              {selectedProgram
                ? CONSTANT.BUTTONS.ADD.icon2
                : CONSTANT.BUTTONS.ADD.icon1}
              {selectedProgram
                ? CONSTANT.BUTTONS.ADD.label2
                : CONSTANT.BUTTONS.ADD.label1}
            </>
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
