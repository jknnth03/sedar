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
  usePostSubMunicipalityMutation,
  useUpdateSubMunicipalityMutation,
} from "../../../features/api/extras/subMunicipalitiesApi";

export default function SubMunicipalitiesModal({
  open,
  handleClose,
  refetch,
  showArchived,
  selectedSubMunicipality,
}) {
  const [formData, setFormData] = useState({
    subMunicipalityName: "",
    subMunicipalityCode: "",
    parentMunicipality: "",
  });
  const [errorMessage, setErrorMessage] = useState(null);
  const [errors, setErrors] = useState({
    subMunicipalityName: false,
    subMunicipalityCode: false,
    parentMunicipality: false,
  });

  const [postSubMunicipality, { isLoading: adding }] =
    usePostSubMunicipalityMutation();
  const [updateSubMunicipality, { isLoading: updating }] =
    useUpdateSubMunicipalityMutation();
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    if (open) {
      setFormData({
        subMunicipalityName: selectedSubMunicipality?.name || "",
        subMunicipalityCode: selectedSubMunicipality?.code || "",
        parentMunicipality: selectedSubMunicipality?.municipality_id || "",
      });
      setErrorMessage(null);
      setErrors({
        subMunicipalityName: false,
        subMunicipalityCode: false,
        parentMunicipality: false,
      });
    }
  }, [open, selectedSubMunicipality]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    const newErrors = {
      subMunicipalityName: !formData.subMunicipalityName.trim(),
      subMunicipalityCode: !formData.subMunicipalityCode.trim(),
      parentMunicipality: !formData.parentMunicipality.trim(),
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
      name: formData.subMunicipalityName.trim(),
      code: formData.subMunicipalityCode.trim(),
      municipality_id: formData.parentMunicipality.trim(),
      status: showArchived ? "inactive" : "active",
    };

    try {
      if (selectedSubMunicipality) {
        await updateSubMunicipality({
          id: selectedSubMunicipality.id,
          ...payload,
        }).unwrap();
        enqueueSnackbar("Sub-Municipality updated successfully!", {
          variant: "success",
        });
      } else {
        await postSubMunicipality(payload).unwrap();
        enqueueSnackbar("Sub-Municipality added successfully!", {
          variant: "success",
        });
      }

      if (typeof refetch === "function") refetch();
      handleClose();
    } catch (error) {
      if (error?.data?.errors?.code) {
        setErrors((prev) => ({ ...prev, subMunicipalityCode: true }));
        setErrorMessage(
          "The Sub-Municipality Code has already been taken. Please use a different code."
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
        {selectedSubMunicipality
          ? "Edit Sub-Municipality"
          : "Add Sub-Municipality"}
      </DialogTitle>

      <DialogContent>
        <Box minWidth={300}>
          {errorMessage && <Alert severity="error">{errorMessage}</Alert>}

          <TextField
            label="Sub-Municipality Code"
            name="subMunicipalityCode"
            variant="outlined"
            fullWidth
            margin="dense"
            value={formData.subMunicipalityCode}
            onChange={handleChange}
            disabled={adding || updating}
            error={errors.subMunicipalityCode}
            helperText={
              errors.subMunicipalityCode
                ? "Sub-Municipality Code is required."
                : ""
            }
          />

          <TextField
            label="Sub-Municipality Name"
            name="subMunicipalityName"
            variant="outlined"
            fullWidth
            margin="dense"
            value={formData.subMunicipalityName}
            onChange={handleChange}
            disabled={adding || updating}
            error={errors.subMunicipalityName}
            helperText={
              errors.subMunicipalityName
                ? "Sub-Municipality Name is required."
                : ""
            }
          />

          <TextField
            label="Parent Municipality"
            name="parentMunicipality"
            variant="outlined"
            fullWidth
            margin="dense"
            value={formData.parentMunicipality}
            onChange={handleChange}
            disabled={adding || updating}
            error={errors.parentMunicipality}
            helperText={
              errors.parentMunicipality
                ? "Parent Municipality is required."
                : ""
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
            : selectedSubMunicipality
            ? "Update"
            : "Add"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
