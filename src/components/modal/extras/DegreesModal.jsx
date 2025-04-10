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
  usePostDegreesMutation,
  useUpdateDegreesMutation,
} from "../../../features/api/extras/degreesApi";

export default function DegreesModal({
  open,
  handleClose,
  refetch,
  showArchived,
  selectedDegree,
}) {
  const [degreeName, setDegreeName] = useState("");
  const [code, setCode] = useState("");
  const [errorMessage, setErrorMessage] = useState(null);

  const [postDegree, { isLoading: adding }] = usePostDegreesMutation();
  const [updateDegree, { isLoading: updating }] = useUpdateDegreesMutation();
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    if (open) {
      setDegreeName(selectedDegree?.name || "");
      setCode(selectedDegree?.code || "");
      setErrorMessage(null);
    }
  }, [open, selectedDegree]);

  const handleSubmit = async () => {
    setErrorMessage(null);

    if (!degreeName.trim() || !code.trim()) {
      setErrorMessage("Both Degree Name and Code cannot be empty.");
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
        enqueueSnackbar("Degree updated successfully!", { variant: "success" });
      } else {
        await postDegree(payload).unwrap();
        enqueueSnackbar("Degree added successfully!", { variant: "success" });
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
          {selectedDegree ? "Edit Degree" : "Add Degree"}
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
            label="Degree Name"
            variant="outlined"
            fullWidth
            margin="dense"
            value={degreeName}
            onChange={(e) => setDegreeName(e.target.value)}
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
          {adding || updating ? "Saving..." : selectedDegree ? "Update" : "Add"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
