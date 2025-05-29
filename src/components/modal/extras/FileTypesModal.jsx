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
  usePostFileTypesMutation,
  useUpdateFileTypesMutation,
} from "../../../features/api/extras/filetypesApi";
import { CONSTANT } from "../../../config";

export default function FileTypeModal({
  open,
  handleClose,
  refetch,
  showArchived,
  selectedFileType,
}) {
  const [fileTypeName, setFileTypeName] = useState("");
  const [code, setCode] = useState("");
  const [errorMessage, setErrorMessage] = useState(null);
  const [errors, setErrors] = useState({
    fileTypeName: false,
    code: false,
  });

  const [postFileType, { isLoading: adding }] = usePostFileTypesMutation();
  const [updateFileType, { isLoading: updating }] =
    useUpdateFileTypesMutation();

  useEffect(() => {
    if (open && selectedFileType) {
      setFileTypeName(selectedFileType?.name || "");
      setCode(selectedFileType?.code || "");
      setErrorMessage(null);
      setErrors({ fileTypeName: false, code: false });
    } else if (!selectedFileType) {
      setFileTypeName("");
      setCode("");
      setErrorMessage(null);
      setErrors({ fileTypeName: false, code: false });
    }
  }, [open, selectedFileType]);

  const handleSubmit = async () => {
    setErrorMessage(null);
    const newErrors = {
      fileTypeName: false,
      code: false,
    };

    if (!fileTypeName.trim()) newErrors.fileTypeName = true;
    if (!code.trim()) newErrors.code = true;

    setErrors(newErrors);

    if (newErrors.fileTypeName || newErrors.code) {
      setErrorMessage("Please fill out all required fields.");
      return;
    }

    const payload = {
      name: fileTypeName.trim(),
      code: code.trim(),
      status: showArchived ? "inactive" : "active",
    };

    try {
      if (selectedFileType) {
        await updateFileType({ id: selectedFileType.id, ...payload }).unwrap();
      } else {
        await postFileType(payload).unwrap();
      }

      if (typeof refetch === "function") refetch();
      handleClose();
    } catch (error) {
      setErrorMessage(
        error?.data?.errors?.code
          ? "The code has already been taken. Please use a different one."
          : error?.data?.message || "An error occurred. Please try again."
      );
    }
  };

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle className="dialog_title">
        <Box className="dialog_title_text">
          {selectedFileType ? "EDIT FILE TYPE" : "ADD FILE TYPE"}
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
            label="File Type Name"
            variant="outlined"
            fullWidth
            margin="dense"
            value={fileTypeName}
            onChange={(e) => setFileTypeName(e.target.value)}
            disabled={adding || updating}
            error={errors.fileTypeName}
            helperText={errors.fileTypeName ? "File Type Name is required" : ""}
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
              {selectedFileType
                ? CONSTANT.BUTTONS.ADD.icon2
                : CONSTANT.BUTTONS.ADD.icon1}
              {selectedFileType
                ? CONSTANT.BUTTONS.ADD.label2
                : CONSTANT.BUTTONS.ADD.label1}
            </>
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
