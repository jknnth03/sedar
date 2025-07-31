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
  usePostDegreesMutation,
  useUpdateDegreesMutation,
} from "../../../features/api/extras/degreesApi";
import { CONSTANT } from "../../../config";

export default function DegreesModal({
  open,
  onClose,
  refetch,
  showArchived,
  selectedDegree,
}) {
  const [degreeName, setDegreeName] = useState("");
  const [code, setCode] = useState("");
  const [errorMessage, setErrorMessage] = useState(null);
  const [errors, setErrors] = useState({
    degreeName: false,
    code: false,
  });

  const [postDegree, { isLoading: adding }] = usePostDegreesMutation();
  const [updateDegree, { isLoading: updating }] = useUpdateDegreesMutation();

  useEffect(() => {
    if (open && selectedDegree) {
      setDegreeName(selectedDegree?.name || "");
      setCode(selectedDegree?.code || "");
      setErrorMessage(null);
      setErrors({ degreeName: false, code: false });
    } else if (!selectedDegree) {
      setDegreeName("");
      setCode("");
      setErrorMessage(null);
      setErrors({ degreeName: false, code: false });
    }
  }, [open, selectedDegree]);

  const handleClose = () => {
    if (typeof onClose === "function") onClose();
  };

  const handleSubmit = async () => {
    setErrorMessage(null);
    let newErrors = {
      degreeName: false,
      code: false,
    };

    if (!degreeName.trim()) newErrors.degreeName = true;
    if (!code.trim()) newErrors.code = true;

    setErrors(newErrors);

    if (newErrors.degreeName || newErrors.code) {
      setErrorMessage("Please fill out all required fields.");
      return;
    }

    const payload = {
      name: degreeName.trim(),
      code: code.trim(),
      status: showArchived ? "inactive" : "active",
    };

    try {
      if (selectedDegree) {
        await updateDegree({ id: selectedDegree.id, ...payload }).unwrap();
      } else {
        await postDegree(payload).unwrap();
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
    <Dialog
      open={open}
      onClose={(event, reason) => {
        if (reason !== "backdropClick") handleClose();
      }}>
      <DialogTitle className="dialog_title">
        <Box className="dialog_title_text">
          {selectedDegree ? "EDIT DEGREE" : "ADD DEGREE"}
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
            label="Degree Name"
            variant="outlined"
            fullWidth
            margin="dense"
            value={degreeName}
            onChange={(e) => setDegreeName(e.target.value)}
            disabled={adding || updating}
            error={errors.degreeName}
            helperText={errors.degreeName ? "Degree Name is required" : ""}
            sx={{ marginTop: 2 }}
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
              {selectedDegree
                ? CONSTANT.BUTTONS.ADD.icon2
                : CONSTANT.BUTTONS.ADD.icon1}
              {selectedDegree
                ? CONSTANT.BUTTONS.ADD.label2
                : CONSTANT.BUTTONS.ADD.label1}
            </>
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
