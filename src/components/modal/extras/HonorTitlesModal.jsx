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
  usePostHonorTitlesMutation,
  useUpdateHonorTitlesMutation,
} from "../../../features/api/extras/honortitlesApi";
import { CONSTANT } from "../../../config";

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
  const [errors, setErrors] = useState({
    honorTitleName: false,
    code: false,
  });

  const [postHonorTitle, { isLoading: adding }] = usePostHonorTitlesMutation();
  const [updateHonorTitle, { isLoading: updating }] =
    useUpdateHonorTitlesMutation();

  useEffect(() => {
    if (open && selectedHonorTitle) {
      setHonorTitleName(selectedHonorTitle?.name || "");
      setCode(selectedHonorTitle?.code || "");
      setErrorMessage(null);
      setErrors({ honorTitleName: false, code: false });
    } else if (!selectedHonorTitle) {
      setHonorTitleName("");
      setCode("");
      setErrorMessage(null);
      setErrors({ honorTitleName: false, code: false });
    }
  }, [open, selectedHonorTitle]);

  const handleSubmit = async () => {
    setErrorMessage(null);
    const newErrors = {
      honorTitleName: false,
      code: false,
    };

    if (!honorTitleName.trim()) newErrors.honorTitleName = true;
    if (!code.trim()) newErrors.code = true;

    setErrors(newErrors);

    if (newErrors.honorTitleName || newErrors.code) {
      setErrorMessage("Please fill out all required fields.");
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
      } else {
        await postHonorTitle(payload).unwrap();
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
          {selectedHonorTitle ? "EDIT HONOR TITLE" : "ADD HONOR TITLE"}
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
            label="Honor Title Name"
            variant="outlined"
            fullWidth
            margin="dense"
            value={honorTitleName}
            onChange={(e) => setHonorTitleName(e.target.value)}
            disabled={adding || updating}
            error={errors.honorTitleName}
            helperText={
              errors.honorTitleName ? "Honor Title Name is required" : ""
            }
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
              {selectedHonorTitle
                ? CONSTANT.BUTTONS.ADD.icon2
                : CONSTANT.BUTTONS.ADD.icon1}
              {selectedHonorTitle
                ? CONSTANT.BUTTONS.ADD.label2
                : CONSTANT.BUTTONS.ADD.label1}
            </>
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
