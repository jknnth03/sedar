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
  usePostCabinetsMutation,
  useUpdateCabinetsMutation,
} from "../../../features/api/extras/cabinets";

export default function CabinetsModal({
  open,
  handleClose,
  refetch,
  showArchived,
  selectedCabinet,
}) {
  const [cabinetName, setCabinetName] = useState("");
  const [code, setCode] = useState("");
  const [errorMessage, setErrorMessage] = useState(null);

  const [postCabinet, { isLoading: adding }] = usePostCabinetsMutation();
  const [updateCabinet, { isLoading: updating }] = useUpdateCabinetsMutation();
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    if (open) {
      console.log("Editing Cabinet:", selectedCabinet);
      setCabinetName(selectedCabinet?.name || "");
      setCode(selectedCabinet?.code || "");
      setErrorMessage(null);
    }
  }, [open, selectedCabinet]);

  const handleSubmit = async () => {
    setErrorMessage(null);

    if (!cabinetName.trim() || !code.trim()) {
      setErrorMessage("Both Cabinet Name and Code cannot be empty.");
      return;
    }

    const payload = {
      name: cabinetName.trim(),
      code: code.trim(),
      status: showArchived ? "inactive" : "active",
    };

    try {
      if (selectedCabinet?.id) {
        await updateCabinet({ id: selectedCabinet.id, ...payload }).unwrap();
        enqueueSnackbar("Cabinet updated successfully!", {
          variant: "success",
        });
      } else {
        await postCabinet(payload).unwrap();
        enqueueSnackbar("Cabinet added successfully!", { variant: "success" });
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
          {selectedCabinet ? "Edit Cabinet" : "Add Cabinet"}
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
            label="Cabinet Name"
            variant="outlined"
            fullWidth
            margin="dense"
            value={cabinetName}
            onChange={(e) => setCabinetName(e.target.value)}
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
            : selectedCabinet
            ? "Update"
            : "Add"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
