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
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import {
  usePostMovementTypesMutation,
  useUpdateMovementTypesMutation,
} from "../../../features/api/extras/movementTypesApi";
import { CONSTANT } from "../../../config";

export default function MovementTypesModal({
  open,
  handleClose,
  refetch,
  showArchived,
  selectedMovementType,
}) {
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [requiresMrf, setRequiresMrf] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [errors, setErrors] = useState({ name: false, code: false });

  const [postMovementTypes, { isLoading: adding }] =
    usePostMovementTypesMutation();
  const [updateMovementTypes, { isLoading: updating }] =
    useUpdateMovementTypesMutation();

  useEffect(() => {
    if (open && selectedMovementType) {
      setName(selectedMovementType?.name || "");
      setCode(selectedMovementType?.code || "");
      setRequiresMrf(selectedMovementType?.requires_mrf || false);
      setErrorMessage(null);
      setErrors({ name: false, code: false });
    } else if (!selectedMovementType) {
      setName("");
      setCode("");
      setRequiresMrf(false);
      setErrorMessage(null);
      setErrors({ name: false, code: false });
    }
  }, [open, selectedMovementType]);

  const handleSubmit = async () => {
    setErrorMessage(null);
    const newErrors = { name: false, code: false };

    if (!name.trim()) newErrors.name = true;
    if (!code.trim()) newErrors.code = true;

    setErrors(newErrors);

    if (newErrors.name || newErrors.code) {
      setErrorMessage("Please fill out all required fields.");
      return;
    }

    const payload = {
      name: name.trim(),
      code: code.trim(),
      requires_mrf: requiresMrf,
    };

    try {
      if (selectedMovementType) {
        await updateMovementTypes({
          id: selectedMovementType.id,
          ...payload,
        }).unwrap();
      } else {
        await postMovementTypes(payload).unwrap();
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
          {selectedMovementType ? "EDIT MOVEMENT TYPE" : "ADD MOVEMENT TYPE"}
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
            label="Movement Type Name"
            variant="outlined"
            fullWidth
            margin="dense"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={adding || updating}
            error={errors.name}
            helperText={errors.name ? "Movement Type Name is required" : ""}
          />

          <FormControlLabel
            control={
              <Checkbox
                checked={requiresMrf}
                onChange={(e) => setRequiresMrf(e.target.checked)}
                disabled={adding || updating}
                color="primary"
              />
            }
            label="Requires MRF"
            sx={{ marginTop: 2, marginLeft: 0 }}
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
              {selectedMovementType
                ? CONSTANT.BUTTONS.ADD.icon2
                : CONSTANT.BUTTONS.ADD.icon1}
              {selectedMovementType
                ? CONSTANT.BUTTONS.ADD.label2
                : CONSTANT.BUTTONS.ADD.label1}
            </>
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
