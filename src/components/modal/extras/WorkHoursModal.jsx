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
  usePostWorkHoursMutation,
  useUpdateWorkHoursMutation,
} from "../../../features/api/extras/workhoursApi";
import { CONSTANT } from "../../../config";
import EditIcon from "@mui/icons-material/Edit";

export default function WorkHoursModal({
  open,
  handleClose,
  refetch,
  showArchived,
  selectedWorkHour,
}) {
  const [workHourName, setWorkHourName] = useState("");
  const [code, setCode] = useState("");
  const [errorMessage, setErrorMessage] = useState(null);

  const [postWorkHour, { isLoading: adding }] = usePostWorkHoursMutation();
  const [updateWorkHour, { isLoading: updating }] =
    useUpdateWorkHoursMutation();
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    if (open) {
      setWorkHourName(selectedWorkHour?.name || "");
      setCode(selectedWorkHour?.code || "");
      setErrorMessage(null);
    }
  }, [open, selectedWorkHour]);

  const handleSubmit = async () => {
    setErrorMessage(null);

    if (!workHourName.trim() || !code.trim()) {
      setErrorMessage("Both Work Hour Name and Code cannot be empty.");
      return;
    }

    const payload = {
      name: workHourName.trim(),
      code: code.trim(),
      status: showArchived ? "inactive" : "active",
    };

    try {
      if (selectedWorkHour) {
        await updateWorkHour({ id: selectedWorkHour.id, ...payload }).unwrap();
        enqueueSnackbar("Work Hour updated successfully!", {
          variant: "success",
        });
      } else {
        await postWorkHour(payload).unwrap();
        enqueueSnackbar("Work Hour added successfully!", {
          variant: "success",
        });
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
          {selectedWorkHour ? "EDIT WORK HOUR" : "ADD WORK HOUR"}
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
            placeholder="e.g., WH-0001"
          />

          <TextField
            label="Work Hour Name"
            variant="outlined"
            fullWidth
            margin="dense"
            value={workHourName}
            onChange={(e) => setWorkHourName(e.target.value)}
            disabled={adding || updating}
            placeholder="e.g., 6:00 AM - 3:30 PM"
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
              {selectedWorkHour
                ? CONSTANT.BUTTONS.ADD.icon2
                : CONSTANT.BUTTONS.ADD.icon1}
              {selectedWorkHour
                ? CONSTANT.BUTTONS.ADD.label2
                : CONSTANT.BUTTONS.ADD.label1}
            </>
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
