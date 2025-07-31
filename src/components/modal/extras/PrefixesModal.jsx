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
  usePostPrefixesMutation,
  useUpdatePrefixesMutation,
} from "../../../features/api/extras/prefixesApi";
import { CONSTANT } from "../../../config";

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

  useEffect(() => {
    if (open && selectedPrefix) {
      setPrefixName(selectedPrefix?.name || "");
      setCode(selectedPrefix?.code || "");
    } else if (!selectedPrefix) {
      setPrefixName("");
      setCode("");
    }

    setErrorMessage(null);
    setErrors({ prefixName: false, code: false });
  }, [open, selectedPrefix]);

  const handleSubmit = async () => {
    setErrorMessage(null);
    const newErrors = {
      prefixName: !prefixName.trim(),
      code: !code.trim(),
    };
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
      } else {
        await postPrefix(payload).unwrap();
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
      <DialogTitle className="dialog_title">
        <Box className="dialog_title_text">
          {selectedPrefix ? "EDIT PREFIX" : "ADD PREFIX"}
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
              {selectedPrefix
                ? CONSTANT.BUTTONS.ADD.icon2
                : CONSTANT.BUTTONS.ADD.icon1}
              {selectedPrefix
                ? CONSTANT.BUTTONS.ADD.label2
                : CONSTANT.BUTTONS.ADD.label1}
            </>
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
