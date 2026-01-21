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
  usePostNationalitiesMutation,
  useUpdateNationalitiesMutation,
} from "../../../features/api/extras/nationalitiesApi";
import { CONSTANT } from "../../../config";

export default function NationalitiesModal({
  open,
  handleClose,
  refetch,
  showArchived,
  selectedNationality,
}) {
  const [nationalityName, setNationalityName] = useState("");
  const [code, setCode] = useState("");
  const [errorMessage, setErrorMessage] = useState(null);

  const [postNationality, { isLoading: adding }] =
    usePostNationalitiesMutation();
  const [updateNationality, { isLoading: updating }] =
    useUpdateNationalitiesMutation();
  const { enqueueSnackbar } = useSnackbar();

  const isEditing = Boolean(selectedNationality);

  useEffect(() => {
    if (open) {
      if (selectedNationality) {
        setNationalityName(selectedNationality.name || "");
        setCode(selectedNationality.code || "");
      } else {
        setNationalityName("");
        setCode("");
      }
      setErrorMessage(null);
    }
  }, [open, selectedNationality]);

  const handleSubmit = async () => {
    setErrorMessage(null);

    if (!nationalityName.trim() || !code.trim()) {
      setErrorMessage("Both Nationality Name and Code cannot be empty.");
      return;
    }

    const payload = {
      name: nationalityName.trim(),
      code: code.trim(),
      status: showArchived ? "inactive" : "active",
    };

    try {
      if (isEditing) {
        await updateNationality({
          id: selectedNationality.id,
          ...payload,
        }).unwrap();
        enqueueSnackbar("Nationality updated successfully!", {
          variant: "success",
        });
      } else {
        await postNationality(payload).unwrap();
        enqueueSnackbar("Nationality added successfully!", {
          variant: "success",
        });
      }

      refetch?.();
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
          {isEditing ? "EDIT NATIONALITY" : "ADD NATIONALITY"}
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
          />

          <TextField
            label="Nationality Name"
            variant="outlined"
            fullWidth
            margin="dense"
            value={nationalityName}
            onChange={(e) => setNationalityName(e.target.value)}
            disabled={adding || updating}
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
              {selectedNationality
                ? CONSTANT.BUTTONS.ADD.icon2
                : CONSTANT.BUTTONS.ADD.icon1}
              {selectedNationality
                ? CONSTANT.BUTTONS.ADD.label2
                : CONSTANT.BUTTONS.ADD.label1}
            </>
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
