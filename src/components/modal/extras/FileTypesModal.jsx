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
  usePostFileTypesMutation,
  useUpdateFileTypesMutation,
} from "../../../features/api/extras/filetypesApi";

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

  const [postFileType, { isLoading: adding }] = usePostFileTypesMutation();
  const [updateFileType, { isLoading: updating }] =
    useUpdateFileTypesMutation();
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    if (open) {
      setFileTypeName(selectedFileType?.name || "");
      setCode(selectedFileType?.code || "");
      setErrorMessage(null);
    }
  }, [open, selectedFileType]);

  const handleSubmit = async () => {
    setErrorMessage(null);

    if (!fileTypeName.trim() || !code.trim()) {
      setErrorMessage("Both File Type Name and Code cannot be empty.");
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
        enqueueSnackbar("File type updated successfully!", {
          variant: "success",
        });
      } else {
        await postFileType(payload).unwrap();
        enqueueSnackbar("File type added successfully!", {
          variant: "success",
        });
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
      <DialogTitle
        sx={{
          backgroundColor: "#E3F2FD",
          fontWeight: "bold",
          fontSize: "1.2rem",
          padding: "12px 16px",
        }}>
        <Box sx={{ marginLeft: "4px", display: "inline-block" }}>
          {selectedFileType ? "Edit File Type" : "Add File Type"}
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
            : selectedFileType
            ? "Update"
            : "Add"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
