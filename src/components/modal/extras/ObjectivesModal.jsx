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
import {
  usePostObjectiveMutation,
  useUpdateObjectiveMutation,
} from "../../../features/api/extras/objectivesApi";
import { CONSTANT } from "../../../config";

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

  useEffect(() => {
    if (open && selectedObjective) {
      setObjectiveName(selectedObjective?.name || "");
      setCode(selectedObjective?.code || "");
      setErrorMessage(null);
      setErrors({ objectiveName: false, code: false });
    } else if (!selectedObjective) {
      setObjectiveName("");
      setCode("");
      setErrorMessage(null);
      setErrors({ objectiveName: false, code: false });
    }
  }, [open, selectedObjective]);

  const handleSubmit = async () => {
    setErrorMessage(null);
    const newErrors = { objectiveName: false, code: false };

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
      } else {
        await postObjective(payload).unwrap();
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
          {selectedObjective ? "EDIT OBJECTIVE" : "ADD OBJECTIVE"}
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
              {selectedObjective
                ? CONSTANT.BUTTONS.ADD.icon2
                : CONSTANT.BUTTONS.ADD.icon1}
              {selectedObjective
                ? CONSTANT.BUTTONS.ADD.label2
                : CONSTANT.BUTTONS.ADD.label1}
            </>
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
