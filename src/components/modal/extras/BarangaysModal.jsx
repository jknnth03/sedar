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
  usePostBarangaysMutation,
  useUpdateBarangaysMutation,
} from "../../../features/api/extras/barangaysApi";

export default function BarangaysModal({
  open,
  handleClose,
  refetch,
  showArchived,
  selectedBarangay,
}) {
  const [barangayName, setBarangayName] = useState("");
  const [psgcCode, setPsgcCode] = useState("");
  const [barangayCode, setBarangayCode] = useState("");
  const [errorMessage, setErrorMessage] = useState(null);
  const [errors, setErrors] = useState({
    barangayName: false,
    psgcCode: false,
    barangayCode: false,
  });

  const [postBarangays, { isLoading: adding }] = usePostBarangaysMutation();
  const [updateBarangays, { isLoading: updating }] =
    useUpdateBarangaysMutation();
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    if (open) {
      setBarangayName(selectedBarangay?.name || "");
      setPsgcCode(selectedBarangay?.psgc_code || "");
      setBarangayCode(selectedBarangay?.code || "");
      setErrorMessage(null);
      setErrors({
        barangayName: false,
        psgcCode: false,
        barangayCode: false,
      });
    }
  }, [open, selectedBarangay]);

  const handleSubmit = async () => {
    setErrorMessage(null);
    let newErrors = {
      barangayName: !barangayName.trim(),
      psgcCode: !psgcCode.trim(),
      barangayCode: !barangayCode.trim(),
    };

    setErrors(newErrors);

    if (Object.values(newErrors).includes(true)) {
      setErrorMessage("Please fill out all required fields.");
      return;
    }

    const payload = {
      name: barangayName.trim(),
      psgc_code: psgcCode.trim(),
      code: barangayCode.trim(),
      status: showArchived ? "inactive" : "active",
    };

    try {
      if (selectedBarangay) {
        await updateBarangays({
          id: selectedBarangay.id,
          ...payload,
        }).unwrap();
        enqueueSnackbar("Barangay updated successfully!", {
          variant: "success",
          autoHideDuration: 2000,
        });
      } else {
        await postBarangays(payload).unwrap();
        enqueueSnackbar("Barangay added successfully!", {
          variant: "success",
          autoHideDuration: 2000,
        });
      }

      if (typeof refetch === "function") refetch();
      handleClose();
    } catch (error) {
      if (error?.data?.errors) {
        const apiErrors = error.data.errors;
        setErrors({
          barangayName: !!apiErrors.name,
          psgcCode: !!apiErrors.psgc_code,
          barangayCode: !!apiErrors.code,
        });

        setErrorMessage(
          apiErrors.psgc_code?.[0] ||
            apiErrors.name?.[0] ||
            apiErrors.code?.[0] ||
            "An error occurred. Please try again."
        );
      } else {
        setErrorMessage(
          error?.data?.message || "An error occurred. Please try again."
        );
      }
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
          {selectedBarangay ? "Edit Barangay" : "Add Barangay"}
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
            label="PSGC Code"
            variant="outlined"
            fullWidth
            margin="dense"
            value={psgcCode}
            onChange={(e) => setPsgcCode(e.target.value)}
            disabled={adding || updating}
            error={errors.psgcCode}
            helperText={
              errors.psgcCode
                ? "The PSGC Code has already been taken or is required."
                : ""
            }
            sx={{ marginTop: 3 }}
          />

          <TextField
            label="Barangay Code"
            variant="outlined"
            fullWidth
            margin="dense"
            value={barangayCode}
            onChange={(e) => setBarangayCode(e.target.value)}
            disabled={adding || updating}
            error={errors.barangayCode}
            helperText={errors.barangayCode ? "Barangay Code is required" : ""}
          />

          <TextField
            label="Barangay Name"
            variant="outlined"
            fullWidth
            margin="dense"
            value={barangayName}
            onChange={(e) => setBarangayName(e.target.value)}
            disabled={adding || updating}
            error={errors.barangayName}
            helperText={errors.barangayName ? "Barangay Name is required" : ""}
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
            : selectedBarangay
            ? "Update"
            : "Add"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
