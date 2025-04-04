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
  usePostObjectiveMutation,
  useUpdateObjectiveMutation,
} from "../../../features/api/extras/objectivesApi";

export default function ObjectivesModal({
  open,
  handleClose,
  refetch,
  showArchived,
  selectedObjective,
}) {
  const [objectiveName, setObjectiveName] = useState("");
  const [code, setCode] = useState("");
  const [errorMessage, setErrorMessage] = useState(null);
  const [errors, setErrors] = useState({ objectiveName: false, code: false });

  const [postObjective, { isLoading: adding }] = usePostObjectiveMutation();
  const [updateObjective, { isLoading: updating }] =
    useUpdateObjectiveMutation();
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    if (open) {
      setObjectiveName(selectedObjective?.name || "");
      setCode(selectedObjective?.code || "");
      setErrorMessage(null);
      setErrors({ objectiveName: false, code: false });
    }
  }, [open, selectedObjective]);

  const handleSubmit = async () => {
    setErrorMessage(null);
    let newErrors = { objectiveName: false, code: false };

    if (!objectiveName.trim()) newErrors.objectiveName = true;
    if (!code.trim()) newErrors.code = true;

    setErrors(newErrors);

    if (newErrors.objectiveName || newErrors.code) {
      setErrorMessage("Please fill out all required fields.");
      return;
    }

    const payload = {
      name: objectiveName.trim(),
      code: code.trim(),
      status: showArchived ? "inactive" : "active",
    };

    try {
      if (selectedObjective) {
        await updateObjective({
          id: selectedObjective.id,
          ...payload,
        }).unwrap();
        enqueueSnackbar("Objective updated successfully!", {
          variant: "success",
          autoHideDuration: 2000,
        });
      } else {
        await postObjective(payload).unwrap();
        enqueueSnackbar("Objective added successfully!", {
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
          {selectedObjective ? "Edit Objective" : "ADD OBJECTIVE"}
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
            label="Objective Name"
            variant="outlined"
            fullWidth
            margin="dense"
            value={objectiveName}
            onChange={(e) => setObjectiveName(e.target.value)}
            disabled={adding || updating}
            error={errors.objectiveName}
            helperText={
              errors.objectiveName ? "Objective Name is required" : ""
            }
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
            : selectedObjective
            ? "Update"
            : "Add"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
