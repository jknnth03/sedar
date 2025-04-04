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
  usePostProvincesMutation,
  useUpdateProvincesMutation,
} from "../../../features/api/extras/provincesApi";

export default function ProvincesModal({
  open,
  handleClose,
  refetch,
  showArchived,
  selectedProvince,
}) {
  const [provinceName, setProvinceName] = useState("");
  const [code, setCode] = useState("");
  const [errorMessage, setErrorMessage] = useState(null);
  const [errors, setErrors] = useState({ provinceName: false, code: false });

  const [postProvince, { isLoading: adding }] = usePostProvincesMutation();
  const [updateProvince, { isLoading: updating }] =
    useUpdateProvincesMutation();
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    if (open) {
      setProvinceName(selectedProvince?.name || "");
      setCode(selectedProvince?.code || "");
      setErrorMessage(null);
      setErrors({ provinceName: false, code: false });
    }
  }, [open, selectedProvince]);

  const handleSubmit = async () => {
    setErrorMessage(null);
    let newErrors = { provinceName: false, code: false };

    if (!provinceName.trim()) newErrors.provinceName = true;
    if (!code.trim()) newErrors.code = true;

    setErrors(newErrors);

    if (newErrors.provinceName || newErrors.code) {
      setErrorMessage("Please fill out all required fields.");
      return;
    }

    const payload = {
      name: provinceName.trim(),
      code: code.trim(),
      status: showArchived ? "inactive" : "active",
    };

    try {
      if (selectedProvince) {
        await updateProvince({ id: selectedProvince.id, ...payload }).unwrap();
        enqueueSnackbar("Province updated successfully!", {
          variant: "success",
          autoHideDuration: 2000,
        });
      } else {
        await postProvince(payload).unwrap();
        enqueueSnackbar("Province added successfully!", {
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
          {selectedProvince ? "Edit Province" : "ADD PROVINCE"}
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
            label="Province Name"
            variant="outlined"
            fullWidth
            margin="dense"
            value={provinceName}
            onChange={(e) => setProvinceName(e.target.value)}
            disabled={adding || updating}
            error={errors.provinceName}
            helperText={errors.provinceName ? "Province Name is required" : ""}
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
            : selectedProvince
            ? "Update"
            : "Add"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
