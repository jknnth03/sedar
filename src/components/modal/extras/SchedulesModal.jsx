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
  usePostSchedulesMutation,
  useUpdateSchedulesMutation,
} from "../../../features/api/extras/schedulesApi";
import { CONSTANT } from "../../../config";

export default function SchedulesModal({
  open,
  handleClose,
  selectedSchedule,
}) {
  const [scheduleName, setScheduleName] = useState("");
  const [code, setCode] = useState("");
  const [errorMessage, setErrorMessage] = useState(null);
  const [errors, setErrors] = useState({ scheduleName: false, code: false });

  const [postSchedule, { isLoading: adding }] = usePostSchedulesMutation();
  const [updateSchedule, { isLoading: updating }] =
    useUpdateSchedulesMutation();
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    if (open) {
      setScheduleName(selectedSchedule?.name || "");
      setCode(selectedSchedule?.code || "");
      setErrorMessage(null);
      setErrors({ scheduleName: false, code: false });
    }
  }, [open, selectedSchedule]);

  const handleSubmit = async () => {
    setErrorMessage(null);
    let newErrors = { scheduleName: false, code: false };

    if (!code.trim()) newErrors.code = true;

    setErrors(newErrors);

    if (newErrors.scheduleName || newErrors.code) {
      setErrorMessage("Please fill out all required fields.");
      return;
    }

    const payload = {
      name: scheduleName.trim(),
      code: code.trim(),
      status: selectedSchedule ? selectedSchedule.status : "active",
    };

    try {
      if (selectedSchedule) {
        await updateSchedule({ id: selectedSchedule.id, ...payload }).unwrap();
        enqueueSnackbar("Schedule updated successfully!", {
          variant: "success",
          autoHideDuration: 2000,
        });
      } else {
        await postSchedule(payload).unwrap();
        enqueueSnackbar("Schedule added successfully!", {
          variant: "success",
          autoHideDuration: 2000,
        });
      }

      handleClose();
    } catch (error) {
      const errorMsg = error?.data?.errors?.code
        ? "The code has already been taken. Please use a different code."
        : error?.data?.message || "An error occurred. Please try again.";
      setErrorMessage(errorMsg);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={!adding && !updating ? handleClose : undefined}>
      <DialogTitle className="dialog_title">
        <Box className="dialog_title_text">
          {selectedSchedule ? "EDIT SCHEDULE" : "ADD SCHEDULE"}
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
            label="Schedule Name"
            variant="outlined"
            fullWidth
            margin="dense"
            value={scheduleName}
            onChange={(e) => setScheduleName(e.target.value)}
            disabled={adding || updating}
            error={errors.scheduleName}
            helperText={errors.scheduleName ? "Schedule Name is required" : ""}
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
              {selectedSchedule
                ? CONSTANT.BUTTONS.ADD.icon2
                : CONSTANT.BUTTONS.ADD.icon1}
              {selectedSchedule
                ? CONSTANT.BUTTONS.ADD.label2
                : CONSTANT.BUTTONS.ADD.label1}
            </>
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
