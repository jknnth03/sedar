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
  usePostWorkWeeksMutation,
  useUpdateWorkWeeksMutation,
} from "../../../features/api/extras/workweeksApi";
import { CONSTANT } from "../../../config";
import EditIcon from "@mui/icons-material/Edit";

export default function WorkWeeksModal({
  open,
  handleClose,
  refetch,
  showArchived,
  selectedWorkWeek,
}) {
  const [workWeekName, setWorkWeekName] = useState("");
  const [code, setCode] = useState("");
  const [errorMessage, setErrorMessage] = useState(null);

  const [postWorkWeek, { isLoading: adding }] = usePostWorkWeeksMutation();
  const [updateWorkWeek, { isLoading: updating }] =
    useUpdateWorkWeeksMutation();
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    if (open) {
      setWorkWeekName(selectedWorkWeek?.name || "");
      setCode(selectedWorkWeek?.code || "");
      setErrorMessage(null);
    }
  }, [open, selectedWorkWeek]);

  const handleSubmit = async () => {
    setErrorMessage(null);

    if (!workWeekName.trim() || !code.trim()) {
      setErrorMessage("Both Work Week Name and Code cannot be empty.");
      return;
    }

    const payload = {
      name: workWeekName.trim(),
      code: code.trim(),
      status: showArchived ? "inactive" : "active",
    };

    try {
      if (selectedWorkWeek) {
        await updateWorkWeek({ id: selectedWorkWeek.id, ...payload }).unwrap();
        enqueueSnackbar("Work Week updated successfully!", {
          variant: "success",
        });
      } else {
        await postWorkWeek(payload).unwrap();
        enqueueSnackbar("Work Week added successfully!", {
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
          {selectedWorkWeek ? "EDIT WORK WEEK" : "ADD WORK WEEK"}
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
            label="Work Week Name"
            variant="outlined"
            fullWidth
            margin="dense"
            value={workWeekName}
            onChange={(e) => setWorkWeekName(e.target.value)}
            disabled={adding || updating}
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
              {selectedWorkWeek
                ? CONSTANT.BUTTONS.ADD.icon2
                : CONSTANT.BUTTONS.ADD.icon1}
              {selectedWorkWeek
                ? CONSTANT.BUTTONS.ADD.label2
                : CONSTANT.BUTTONS.ADD.label1}
            </>
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
