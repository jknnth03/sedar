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
  usePostTeamsMutation,
  useUpdateTeamsMutation,
} from "../../../features/api/extras/teamsApi";
import { CONSTANT } from "../../../config";

export default function TeamsModal({
  open,
  handleClose,
  refetch,
  showArchived,
  selectedTeam,
}) {
  const [teamName, setTeamName] = useState("");
  const [code, setCode] = useState("");
  const [errorMessage, setErrorMessage] = useState(null);
  const [errors, setErrors] = useState({ teamName: false, code: false });

  const [postTeam, { isLoading: adding }] = usePostTeamsMutation();
  const [updateTeam, { isLoading: updating }] = useUpdateTeamsMutation();
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    if (open) {
      setTeamName(selectedTeam?.name || "");
      setCode(selectedTeam?.code || "");
      setErrorMessage(null);
      setErrors({ teamName: false, code: false });
    }
  }, [open, selectedTeam]);

  const handleSubmit = async () => {
    setErrorMessage(null);
    let newErrors = { teamName: false, code: false };

    if (!teamName.trim()) newErrors.teamName = true;
    if (!code.trim()) newErrors.code = true;

    setErrors(newErrors);

    if (newErrors.teamName || newErrors.code) {
      setErrorMessage("Please fill out all required fields.");
      return;
    }

    const payload = {
      name: teamName.trim(),
      code: code.trim(),
      status: showArchived ? "inactive" : "active",
    };

    try {
      if (selectedTeam) {
        await updateTeam({ id: selectedTeam.id, ...payload }).unwrap();
        enqueueSnackbar("Team updated successfully!", {
          variant: "success",
          autoHideDuration: 2000,
        });
      } else {
        await postTeam(payload).unwrap();
        enqueueSnackbar("Team added successfully!", {
          variant: "success",
          autoHideDuration: 2000,
        });
      }
      refetch();
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
          {selectedTeam ? "EDIT TEAM" : "ADD TEAM"}
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
            label="Team Name"
            variant="outlined"
            fullWidth
            margin="dense"
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            disabled={adding || updating}
            error={errors.teamName}
            helperText={errors.teamName ? "Team Name is required" : ""}
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
              {selectedTeam
                ? CONSTANT.BUTTONS.ADD.icon2
                : CONSTANT.BUTTONS.ADD.icon1}
              {selectedTeam
                ? CONSTANT.BUTTONS.ADD.label2
                : CONSTANT.BUTTONS.ADD.label1}
            </>
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
