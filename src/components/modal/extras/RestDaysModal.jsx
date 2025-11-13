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
  usePostRestDaysMutation,
  useUpdateRestDaysMutation,
} from "../../../features/api/extras/restdaysApi";
import { CONSTANT } from "../../../config";
import EditIcon from "@mui/icons-material/Edit";

export default function RestDaysModal({
  open,
  handleClose,
  refetch,
  showArchived,
  selectedRestDay,
}) {
  const [restDayName, setRestDayName] = useState("");
  const [code, setCode] = useState("");
  const [errorMessage, setErrorMessage] = useState(null);

  const [postRestDay, { isLoading: adding }] = usePostRestDaysMutation();
  const [updateRestDay, { isLoading: updating }] = useUpdateRestDaysMutation();
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    if (open) {
      setRestDayName(selectedRestDay?.name || "");
      setCode(selectedRestDay?.code || "");
      setErrorMessage(null);
    }
  }, [open, selectedRestDay]);

  const handleSubmit = async () => {
    setErrorMessage(null);

    if (!restDayName.trim() || !code.trim()) {
      setErrorMessage("Both Rest Day Name and Code cannot be empty.");
      return;
    }

    const payload = {
      name: restDayName.trim(),
      code: code.trim(),
      status: showArchived ? "inactive" : "active",
    };

    try {
      if (selectedRestDay) {
        await updateRestDay({ id: selectedRestDay.id, ...payload }).unwrap();
        enqueueSnackbar("Rest Day updated successfully!", {
          variant: "success",
        });
      } else {
        await postRestDay(payload).unwrap();
        enqueueSnackbar("Rest Day added successfully!", {
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
          {selectedRestDay ? "EDIT REST DAY" : "ADD REST DAY"}
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
            placeholder="e.g., RD-0001"
          />

          <TextField
            label="Rest Day Name"
            variant="outlined"
            fullWidth
            margin="dense"
            value={restDayName}
            onChange={(e) => setRestDayName(e.target.value)}
            disabled={adding || updating}
            placeholder="e.g., MONDAY"
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
              {selectedRestDay
                ? CONSTANT.BUTTONS.ADD.icon2
                : CONSTANT.BUTTONS.ADD.icon1}
              {selectedRestDay
                ? CONSTANT.BUTTONS.ADD.label2
                : CONSTANT.BUTTONS.ADD.label1}
            </>
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
