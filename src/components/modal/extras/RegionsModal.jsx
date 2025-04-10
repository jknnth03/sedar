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
  usePostRegionsMutation,
  useUpdateRegionsMutation,
} from "../../../features/api/extras/regionsApi";

export default function RegionsModal({
  open,
  handleClose,
  refetch,
  showArchived,
  selectedRegion,
}) {
  const [regionName, setRegionName] = useState("");
  const [psgcCode, setPsgcCode] = useState("");
  const [regionCode, setRegionCode] = useState("");
  const [errorMessage, setErrorMessage] = useState(null);
  const [errors, setErrors] = useState({
    regionName: false,
    psgcCode: false,
    regionCode: false,
  });

  const [postRegion, { isLoading: adding }] = usePostRegionsMutation();
  const [updateRegion, { isLoading: updating }] = useUpdateRegionsMutation();
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    if (open) {
      setRegionName(selectedRegion?.name || "");
      setPsgcCode(selectedRegion?.psgc_id || "");
      setRegionCode(selectedRegion?.code || "");
      setErrorMessage(null);
      setErrors({ regionName: false, psgcCode: false, regionCode: false });
    }
  }, [open, selectedRegion]);

  const handleSubmit = async () => {
    setErrorMessage(null);
    let newErrors = { regionName: false, psgcCode: false, regionCode: false };

    if (!regionName.trim()) newErrors.regionName = true;
    if (!psgcCode.trim()) newErrors.psgcCode = true;
    if (!regionCode.trim()) newErrors.regionCode = true;

    setErrors(newErrors);

    if (newErrors.regionName || newErrors.psgcCode || newErrors.regionCode) {
      setErrorMessage("Please fill out all required fields.");
      return;
    }

    const payload = {
      name: regionName.trim(),
      psgc_code: psgcCode.trim(),
      code: regionCode.trim(),
      status: showArchived ? "inactive" : "active",
    };

    try {
      if (selectedRegion) {
        await updateRegion({ id: selectedRegion.id, ...payload }).unwrap();
        enqueueSnackbar("Region updated successfully!", {
          variant: "success",
          autoHideDuration: 2000,
        });
      } else {
        await postRegion(payload).unwrap();
        enqueueSnackbar("Region added successfully!", {
          variant: "success",
          autoHideDuration: 2000,
        });
      }

      if (typeof refetch === "function") refetch();
      handleClose();
    } catch (error) {
      setErrorMessage(
        error?.data?.errors?.psgc_code
          ? "The PSGC Code has already been taken. Please use a different code."
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
          {selectedRegion ? "Edit Region" : "Add Region"}
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
            helperText={errors.psgcCode ? "PSGC Code is required" : ""}
            sx={{ marginTop: 3 }}
          />

          <TextField
            label="Region Name"
            variant="outlined"
            fullWidth
            margin="dense"
            value={regionName}
            onChange={(e) => setRegionName(e.target.value)}
            disabled={adding || updating}
            error={errors.regionName}
            helperText={errors.regionName ? "Region Name is required" : ""}
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
          {adding || updating ? "Saving..." : selectedRegion ? "Update" : "Add"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
