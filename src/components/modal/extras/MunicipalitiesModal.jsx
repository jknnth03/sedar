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
  usePostMunicipalityMutation,
  useUpdateMunicipalityMutation,
} from "../../../features/api/extras/municipalitiesApi";

export default function MunicipalitiesModal({
  open,
  handleClose,
  refetch,
  showArchived,
  selectedMunicipality,
}) {
  const [formData, setFormData] = useState({
    municipalityName: "",
    psgcCode: "",
    municipalityCode: "",
  });
  const [errorMessage, setErrorMessage] = useState(null);
  const [errors, setErrors] = useState({
    municipalityName: false,
    psgcCode: false,
    municipalityCode: false,
  });

  const [postMunicipality, { isLoading: adding }] =
    usePostMunicipalityMutation();
  const [updateMunicipality, { isLoading: updating }] =
    useUpdateMunicipalityMutation();
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    if (open) {
      setFormData({
        municipalityName: selectedMunicipality?.name || "",
        psgcCode: selectedMunicipality?.psgc_code || "",
        municipalityCode: selectedMunicipality?.code || "",
      });
      setErrorMessage(null);
      setErrors({
        municipalityName: false,
        psgcCode: false,
        municipalityCode: false,
      });
    }
  }, [open, selectedMunicipality]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    const newErrors = {
      municipalityName: !formData.municipalityName.trim(),
      psgcCode: !formData.psgcCode.trim(),
      municipalityCode: !formData.municipalityCode.trim(),
    };

    setErrors(newErrors);
    return !Object.values(newErrors).includes(true);
  };

  const handleSubmit = async () => {
    setErrorMessage(null);
    if (!validateForm()) {
      setErrorMessage("Please fill out all required fields.");
      return;
    }

    const payload = {
      name: formData.municipalityName.trim(),
      psgc_code: formData.psgcCode.trim(),
      code: formData.municipalityCode.trim(),
      status: showArchived ? "inactive" : "active",
    };

    try {
      if (selectedMunicipality) {
        await updateMunicipality({
          id: selectedMunicipality.id,
          ...payload,
        }).unwrap();
        enqueueSnackbar("Municipality updated successfully!", {
          variant: "success",
        });
      } else {
        await postMunicipality(payload).unwrap();
        enqueueSnackbar("Municipality added successfully!", {
          variant: "success",
        });
      }

      if (typeof refetch === "function") refetch();
      handleClose();
    } catch (error) {
      if (error?.data?.errors?.psgc_code) {
        setErrors((prev) => ({ ...prev, psgcCode: true }));
        setErrorMessage(
          "The PSGC Code has already been taken. Please use a different code."
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
        }}>
        {selectedMunicipality ? "Edit Municipality" : "Add Municipality"}
      </DialogTitle>

      <DialogContent>
        <Box minWidth={300}>
          {errorMessage && <Alert severity="error">{errorMessage}</Alert>}

          <TextField
            label="PSGC Code"
            name="psgcCode"
            variant="outlined"
            fullWidth
            margin="dense"
            value={formData.psgcCode}
            onChange={handleChange}
            disabled={adding || updating}
            error={errors.psgcCode}
            helperText={
              errors.psgcCode
                ? "The PSGC Code has already been taken or is required."
                : ""
            }
          />

          <TextField
            label="Municipality Code"
            name="municipalityCode"
            variant="outlined"
            fullWidth
            margin="dense"
            value={formData.municipalityCode}
            onChange={handleChange}
            disabled={adding || updating}
            error={errors.municipalityCode}
            helperText={
              errors.municipalityCode ? "Municipality Code is required." : ""
            }
          />

          <TextField
            label="Municipality Name"
            name="municipalityName"
            variant="outlined"
            fullWidth
            margin="dense"
            value={formData.municipalityName}
            onChange={handleChange}
            disabled={adding || updating}
            error={errors.municipalityName}
            helperText={
              errors.municipalityName ? "Municipality Name is required." : ""
            }
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
            : selectedMunicipality
            ? "Update"
            : "Add"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
