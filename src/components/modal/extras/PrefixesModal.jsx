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
  usePostPrefixesMutation,
  useUpdatePrefixesMutation,
} from "../../../features/api/extras/prefixesApi";

export default function PrefixesModal({
  open,
  handleClose,
  refetch,
  showArchived,
  selectedPrefix,
}) {
  const [prefixName, setPrefixName] = useState("");
  const [code, setCode] = useState("");
  const [errorMessage, setErrorMessage] = useState(null);
  const [errors, setErrors] = useState({ prefixName: false, code: false });

  const [postPrefix, { isLoading: adding }] = usePostPrefixesMutation();
  const [updatePrefix, { isLoading: updating }] = useUpdatePrefixesMutation();
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    if (open) {
      setPrefixName(selectedPrefix?.name || "");
      setCode(selectedPrefix?.code || "");
      setErrorMessage(null);
      setErrors({ prefixName: false, code: false });
    }
  }, [open, selectedPrefix]);

  const handleSubmit = async () => {
    setErrorMessage(null);
    let newErrors = { prefixName: false, code: false };

    if (!prefixName.trim()) newErrors.prefixName = true;
    if (!code.trim()) newErrors.code = true;

    setErrors(newErrors);

    if (newErrors.prefixName || newErrors.code) {
      setErrorMessage("Please fill out all required fields.");
      return;
    }

    const payload = {
      name: prefixName.trim(),
      code: code.trim(),
      status: showArchived ? "inactive" : "active",
    };

    try {
      if (selectedPrefix) {
        await updatePrefix({ id: selectedPrefix.id, ...payload }).unwrap();
        enqueueSnackbar("Prefix updated successfully!", {
          variant: "success",
          autoHideDuration: 2000,
        });
      } else {
        await postPrefix(payload).unwrap();
        enqueueSnackbar("Prefix added successfully!", {
          variant: "success",
          autoHideDuration: 2000,
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
          {selectedPrefix ? "Edit Prefix" : "ADD PREFIX"}
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
            label="Prefix Name"
            variant="outlined"
            fullWidth
            margin="dense"
            value={prefixName}
            onChange={(e) => setPrefixName(e.target.value)}
            disabled={adding || updating}
            error={errors.prefixName}
            helperText={errors.prefixName ? "Prefix Name is required" : ""}
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
          {adding || updating ? "Saving..." : selectedPrefix ? "Update" : "Add"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
