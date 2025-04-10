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
  usePostHonorTitlesMutation,
  useUpdateHonorTitlesMutation,
} from "../../../features/api/extras/honortitlesApi";

export default function HonorTitleModal({
  open,
  handleClose,
  refetch,
  showArchived,
  selectedHonorTitle,
}) {
  const [honorTitleName, setHonorTitleName] = useState("");
  const [code, setCode] = useState("");
  const [errorMessage, setErrorMessage] = useState(null);

  const [postHonorTitle, { isLoading: adding }] = usePostHonorTitlesMutation();
  const [updateHonorTitle, { isLoading: updating }] =
    useUpdateHonorTitlesMutation();
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    if (open) {
      setHonorTitleName(selectedHonorTitle?.name || "");
      setCode(selectedHonorTitle?.code || "");
      setErrorMessage(null);
    }
  }, [open, selectedHonorTitle]);

  const handleSubmit = async () => {
    setErrorMessage(null);

    if (!honorTitleName.trim() || !code.trim()) {
      setErrorMessage("Both Honor Title Name and Code cannot be empty.");
      return;
    }

    const payload = {
      name: honorTitleName.trim(),
      code: code.trim(),
      status: showArchived ? "inactive" : "active",
    };

    try {
      if (selectedHonorTitle) {
        await updateHonorTitle({
          id: selectedHonorTitle.id,
          ...payload,
        }).unwrap();
        enqueueSnackbar("Honor Title updated successfully!", {
          variant: "success",
        });
      } else {
        await postHonorTitle(payload).unwrap();
        enqueueSnackbar("Honor Title added successfully!", {
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
          {selectedHonorTitle ? "Edit Honor Title" : "Add Honor Title"}
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
            label="Honor Title Name"
            variant="outlined"
            fullWidth
            margin="dense"
            value={honorTitleName}
            onChange={(e) => setHonorTitleName(e.target.value)}
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
            : selectedHonorTitle
            ? "Update"
            : "Add"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
