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
import {
  usePostCabinetsMutation,
  useUpdateCabinetsMutation,
} from "../../../features/api/extras/cabinets";
import { CONSTANT } from "../../../config";

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
  const [errors, setErrors] = useState({
    cabinetName: false,
    code: false,
  });

  const [postCabinet, { isLoading: adding }] = usePostCabinetsMutation();
  const [updateCabinet, { isLoading: updating }] = useUpdateCabinetsMutation();

  useEffect(() => {
    if (open && selectedCabinet) {
      setCabinetName(selectedCabinet?.name || "");
      setCode(selectedCabinet?.code || "");
      setErrorMessage(null);
      setErrors({
        cabinetName: false,
        code: false,
      });
    } else if (!selectedCabinet) {
      setCabinetName("");
      setCode("");
      setErrorMessage(null);
      setErrors({
        cabinetName: false,
        code: false,
      });
    }
  }, [open, selectedCabinet]);

  const handleSubmit = async () => {
    setErrorMessage(null);
    let newErrors = {
      cabinetName: false,
      code: false,
    };

    if (!cabinetName.trim()) newErrors.cabinetName = true;
    if (!code.trim()) newErrors.code = true;

    setErrors(newErrors);

    if (newErrors.cabinetName || newErrors.code) {
      setErrorMessage("Please fill out all required fields.");
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
      } else {
        await postCabinet(payload).unwrap();
      }

      if (typeof refetch === "function") refetch();
      handleClose();
    } catch (error) {
      console.error("Error:", error);
      setErrorMessage(
        error?.data?.errors?.code
          ? "The code has already been taken. Please use a different code."
          : error?.data?.message || "An error occurred. Please try again."
      );
    }
  };

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle className="dialog_title">
        <Box className="dialog_title_text">
          {selectedCabinet ? "EDIT CABINET" : "ADD CABINET"}
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
            label="Cabinet Name"
            variant="outlined"
            fullWidth
            margin="dense"
            value={cabinetName}
            onChange={(e) => setCabinetName(e.target.value)}
            disabled={adding || updating}
            error={errors.cabinetName}
            helperText={errors.cabinetName ? "Cabinet Name is required" : ""}
            sx={{ marginTop: 2 }}
          />
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button
          variant="contained"
          color="inherit"
          className="cancel_button"
          onClick={handleClose}
          size="medium"
          disabled={adding || updating}>
          <>
            {CONSTANT.BUTTONS.CANCEL.icon}
            {CONSTANT.BUTTONS.CANCEL.label}
          </>
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          size="medium"
          className="add_button"
          disabled={adding || updating}>
          {adding || updating ? (
            "Saving..."
          ) : (
            <>
              {selectedCabinet
                ? CONSTANT.BUTTONS.ADD.icon2
                : CONSTANT.BUTTONS.ADD.icon1}
              {selectedCabinet
                ? CONSTANT.BUTTONS.ADD.label2
                : CONSTANT.BUTTONS.ADD.label1}
            </>
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
