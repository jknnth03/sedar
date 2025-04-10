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

  useEffect(() => {
    if (open) {
      setAttainmentName(selectedAttainment?.name || "");
      setCode(selectedAttainment?.code || "");
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
      if (selectedAttainment) {
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
          {selectedAttainment ? "Edit Attainment" : "Add Attainment"}
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
            : selectedAttainment
            ? "Update"
            : "Add"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
