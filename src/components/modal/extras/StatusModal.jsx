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

import { CONSTANT } from "../../../config";
import EditIcon from "@mui/icons-material/Edit";
import {
  usePostStatusMutation,
  useUpdateStatusMutation,
} from "../../../features/api/extras/statusExtrasApi";

export default function StatusModal({
  open,
  handleClose,
  refetch,
  showArchived,
  selectedStatus,
}) {
  const [statusName, setStatusName] = useState("");
  const [code, setCode] = useState("");
  const [errorMessage, setErrorMessage] = useState(null);

  const [postStatus, { isLoading: adding }] = usePostStatusMutation();
  const [updateStatus, { isLoading: updating }] = useUpdateStatusMutation();
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    if (open) {
      setStatusName(selectedStatus?.name || "");
      setCode(selectedStatus?.code || "");
      setErrorMessage(null);
    }
  }, [open, selectedStatus]);

  const handleSubmit = async () => {
    setErrorMessage(null);

    if (!statusName.trim() || !code.trim()) {
      setErrorMessage("Both Status Name and Code cannot be empty.");
      return;
    }

    const payload = {
      name: statusName.trim(),
      code: code.trim(),
      status: showArchived ? "inactive" : "active",
    };

    try {
      if (selectedStatus) {
        await updateStatus({ id: selectedStatus.id, ...payload }).unwrap();
        enqueueSnackbar("Status updated successfully!", {
          variant: "success",
        });
      } else {
        await postStatus(payload).unwrap();
        enqueueSnackbar("Status added successfully!", {
          variant: "success",
        });
      }

      if (typeof refetch === "function") refetch();
      handleClose();
    } catch (error) {
      setErrorMessage(
        error?.data?.errors?.code
          ? "The code has already been taken. Please use a different code."
          : error?.data?.message || "An error occurred. Please try again.",
      );
    }
  };

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle className="dialog_title">
        <Box className="dialog_title_text">
          {selectedStatus ? "EDIT STATUS" : "ADD STATUS"}
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
            placeholder="e.g., ST-0001"
          />

          <TextField
            label="Status Name"
            variant="outlined"
            fullWidth
            margin="dense"
            value={statusName}
            onChange={(e) => setStatusName(e.target.value)}
            disabled={adding || updating}
            placeholder="e.g., Active, Pending"
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
              {selectedStatus
                ? CONSTANT.BUTTONS.ADD.icon2
                : CONSTANT.BUTTONS.ADD.icon1}
              {selectedStatus
                ? CONSTANT.BUTTONS.ADD.label2
                : CONSTANT.BUTTONS.ADD.label1}
            </>
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
