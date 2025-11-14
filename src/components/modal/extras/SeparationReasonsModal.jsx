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
  usePostSeparationReasonMutation,
  useUpdateSeparationReasonMutation,
} from "../../../features/api/extras/separationReasonsApi";
import { CONSTANT } from "../../../config";
import EditIcon from "@mui/icons-material/Edit";

export default function SeparationReasonModal({
  open,
  handleClose,
  refetch,
  showArchived,
  selectedSeparationReason,
}) {
  const [separationReasonName, setSeparationReasonName] = useState("");
  const [code, setCode] = useState("");
  const [errorMessage, setErrorMessage] = useState(null);

  const [postSeparationReason, { isLoading: adding }] =
    usePostSeparationReasonMutation();
  const [updateSeparationReason, { isLoading: updating }] =
    useUpdateSeparationReasonMutation();
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    if (open) {
      setSeparationReasonName(selectedSeparationReason?.name || "");
      setCode(selectedSeparationReason?.code || "");
      setErrorMessage(null);
    }
  }, [open, selectedSeparationReason]);

  const handleSubmit = async () => {
    setErrorMessage(null);

    if (!separationReasonName.trim() || !code.trim()) {
      setErrorMessage("Both Separation Reason Name and Code cannot be empty.");
      return;
    }

    const payload = {
      name: separationReasonName.trim(),
      code: code.trim(),
      status: showArchived ? "inactive" : "active",
    };

    try {
      if (selectedSeparationReason) {
        await updateSeparationReason({
          id: selectedSeparationReason.id,
          ...payload,
        }).unwrap();
        enqueueSnackbar("Separation Reason updated successfully!", {
          variant: "success",
        });
      } else {
        await postSeparationReason(payload).unwrap();
        enqueueSnackbar("Separation Reason added successfully!", {
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
          {selectedSeparationReason
            ? "EDIT SEPARATION REASON"
            : "ADD SEPARATION REASON"}
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
            sx={{ marginTop: 3 }}
            placeholder="e.g., SR-0001"
          />

          <TextField
            label="Separation Reason Name"
            variant="outlined"
            fullWidth
            margin="dense"
            value={separationReasonName}
            onChange={(e) => setSeparationReasonName(e.target.value)}
            disabled={adding || updating}
            placeholder="e.g., Resignation"
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
              {selectedSeparationReason
                ? CONSTANT.BUTTONS.ADD.icon2
                : CONSTANT.BUTTONS.ADD.icon1}
              {selectedSeparationReason
                ? CONSTANT.BUTTONS.ADD.label2
                : CONSTANT.BUTTONS.ADD.label1}
            </>
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
