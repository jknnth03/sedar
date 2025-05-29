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
  usePostAttainmentsMutation,
  useUpdateAttainmentsMutation,
} from "../../../features/api/extras/attainmentsApi";
import { CONSTANT } from "../../../config";
import EditIcon from "@mui/icons-material/Edit";

export default function AttainmentsModal({
  open,
  handleClose,
  refetch,
  showArchived,
  selectedAttainment,
}) {
  const [attainmentName, setAttainmentName] = useState("");
  const [code, setCode] = useState("");
  const [errorMessage, setErrorMessage] = useState(null);

  const [postAttainment, { isLoading: adding }] = usePostAttainmentsMutation();
  const [updateAttainment, { isLoading: updating }] =
    useUpdateAttainmentsMutation();
  const { enqueueSnackbar } = useSnackbar();

  const isEditing = Boolean(selectedAttainment);

  useEffect(() => {
    if (open) {
      if (selectedAttainment) {
        setAttainmentName(selectedAttainment.name || "");
        setCode(selectedAttainment.code || "");
      } else {
        setAttainmentName("");
        setCode("");
      }
      setErrorMessage(null);
    }
  }, [open, selectedAttainment]);

  const handleSubmit = async () => {
    setErrorMessage(null);

    if (!attainmentName.trim() || !code.trim()) {
      setErrorMessage("Both Attainment Name and Code cannot be empty.");
      return;
    }

    const payload = {
      name: attainmentName.trim(),
      code: code.trim(),
      status: showArchived ? "inactive" : "active",
    };

    try {
      if (isEditing) {
        await updateAttainment({
          id: selectedAttainment.id,
          ...payload,
        }).unwrap();
        enqueueSnackbar("Attainment updated successfully!", {
          variant: "success",
        });
      } else {
        await postAttainment(payload).unwrap();
        enqueueSnackbar("Attainment added successfully!", {
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
          {isEditing ? "EDIT ATTAINMENT" : "ADD ATTAINMENT"}
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
            label="Attainment Name"
            variant="outlined"
            fullWidth
            margin="dense"
            value={attainmentName}
            onChange={(e) => setAttainmentName(e.target.value)}
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
              {selectedAttainment
                ? CONSTANT.BUTTONS.ADD.icon2
                : CONSTANT.BUTTONS.ADD.icon1}
              {selectedAttainment
                ? CONSTANT.BUTTONS.ADD.label2
                : CONSTANT.BUTTONS.ADD.label1}
            </>
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
