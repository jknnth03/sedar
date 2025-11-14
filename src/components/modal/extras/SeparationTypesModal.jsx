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
  usePostSeparationTypeMutation,
  useUpdateSeparationTypeMutation,
} from "../../../features/api/extras/separationTypesApi";
import { CONSTANT } from "../../../config";
import EditIcon from "@mui/icons-material/Edit";

export default function SeparationTypeModal({
  open,
  handleClose,
  refetch,
  showArchived,
  selectedSeparationType,
}) {
  const [separationTypeName, setSeparationTypeName] = useState("");
  const [code, setCode] = useState("");
  const [errorMessage, setErrorMessage] = useState(null);

  const [postSeparationType, { isLoading: adding }] =
    usePostSeparationTypeMutation();
  const [updateSeparationType, { isLoading: updating }] =
    useUpdateSeparationTypeMutation();
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    if (open) {
      setSeparationTypeName(selectedSeparationType?.name || "");
      setCode(selectedSeparationType?.code || "");
      setErrorMessage(null);
    }
  }, [open, selectedSeparationType]);

  const handleSubmit = async () => {
    setErrorMessage(null);

    if (!separationTypeName.trim() || !code.trim()) {
      setErrorMessage("Both Separation Type Name and Code cannot be empty.");
      return;
    }

    const payload = {
      name: separationTypeName.trim(),
      code: code.trim(),
      status: showArchived ? "inactive" : "active",
    };

    try {
      if (selectedSeparationType) {
        await updateSeparationType({
          id: selectedSeparationType.id,
          ...payload,
        }).unwrap();
        enqueueSnackbar("Separation Type updated successfully!", {
          variant: "success",
        });
      } else {
        await postSeparationType(payload).unwrap();
        enqueueSnackbar("Separation Type added successfully!", {
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
          {selectedSeparationType
            ? "EDIT SEPARATION TYPE"
            : "ADD SEPARATION TYPE"}
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
            placeholder="e.g., ST-0001"
          />

          <TextField
            label="Separation Type Name"
            variant="outlined"
            fullWidth
            margin="dense"
            value={separationTypeName}
            onChange={(e) => setSeparationTypeName(e.target.value)}
            disabled={adding || updating}
            placeholder="e.g., Voluntary"
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
              {selectedSeparationType
                ? CONSTANT.BUTTONS.ADD.icon2
                : CONSTANT.BUTTONS.ADD.icon1}
              {selectedSeparationType
                ? CONSTANT.BUTTONS.ADD.label2
                : CONSTANT.BUTTONS.ADD.label1}
            </>
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
