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
  usePostToolsMutation,
  useUpdateToolsMutation,
} from "../../../features/api/extras/toolsApi";

export default function ToolsModal({
  open,
  handleClose,
  refetch,
  showArchived,
  selectedTool,
}) {
  const [toolName, setToolName] = useState("");
  const [code, setCode] = useState("");
  const [errorMessage, setErrorMessage] = useState(null);

  const [postTool, { isLoading: adding }] = usePostToolsMutation();
  const [updateTool, { isLoading: updating }] = useUpdateToolsMutation();
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    if (open) {
      setToolName(selectedTool?.name || "");
      setCode(selectedTool?.code || "");
      setErrorMessage(null);
    }
  }, [open, selectedTool]);

  const handleSubmit = async () => {
    setErrorMessage(null);

    if (!toolName.trim() || !code.trim()) {
      setErrorMessage("Both Tool Name and Code cannot be empty.");
      return;
    }

    const payload = {
      name: toolName.trim(),
      code: code.trim(),
      status: showArchived ? "inactive" : "active",
    };

    try {
      if (selectedTool) {
        await updateTool({ id: selectedTool.id, ...payload }).unwrap();
        enqueueSnackbar("Tool updated successfully!", { variant: "success" });
      } else {
        await postTool(payload).unwrap();
        enqueueSnackbar("Tool added successfully!", { variant: "success" });
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
          {selectedTool ? "Edit Tool" : "Add Tool"}
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
            label="Tool Name"
            variant="outlined"
            fullWidth
            margin="dense"
            value={toolName}
            onChange={(e) => setToolName(e.target.value)}
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
          {adding || updating ? "Saving..." : selectedTool ? "Update" : "Add"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
