import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
} from "@mui/material";
import { useSnackbar } from "notistack";
import {
  usePostBanksMutation,
  useUpdateBanksMutation,
} from "../../../features/api/extras/banksApi";

const BanksModal = ({ open, handleClose, refetch, selectedBank }) => {
  const { enqueueSnackbar } = useSnackbar();
  const [bankName, setBankName] = useState("");
  const [code, setCode] = useState("");
  const [errorMessage, setErrorMessage] = useState(null);

  const [createBank, { isLoading: isCreating }] = usePostBanksMutation();
  const [updateBank, { isLoading: isUpdating }] = useUpdateBanksMutation();

  // Set form data when modal opens
  useEffect(() => {
    console.log("Modal Opened. Selected Bank:", selectedBank);

    if (selectedBank) {
      setBankName(selectedBank.name || "");
      setCode(selectedBank.code || "");
    } else {
      setBankName("");
      setCode("");
    }

    setErrorMessage(null);
  }, [selectedBank]);

  // Handle Form Submission
  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!bankName.trim() || !code.trim()) {
      setErrorMessage("All fields are required.");
      return;
    }

    try {
      if (selectedBank) {
        await updateBank({
          id: selectedBank.id,
          name: bankName,
          code: code,
        }).unwrap();
        enqueueSnackbar("Bank updated successfully!", { variant: "success" });
      } else {
        await createBank({ name: bankName, code: code }).unwrap();
        enqueueSnackbar("Bank added successfully!", { variant: "success" });
      }

      refetch();
      handleClose();
    } catch (error) {
      setErrorMessage("Operation failed. Please try again.");
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>{selectedBank ? "Edit Bank" : "Add Bank"}</DialogTitle>
      <DialogContent>
        {errorMessage && (
          <Typography color="error" sx={{ mb: 2 }}>
            {errorMessage}
          </Typography>
        )}
        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            label="Bank Name"
            fullWidth
            value={bankName}
            onChange={(e) => setBankName(e.target.value)}
            margin="dense"
            required
          />
          <TextField
            label="Code"
            fullWidth
            value={code}
            onChange={(e) => setCode(e.target.value)}
            margin="dense"
            required
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="secondary">
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          color="primary"
          disabled={isCreating || isUpdating}>
          {isCreating || isUpdating ? "Saving..." : "Save"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default BanksModal;
