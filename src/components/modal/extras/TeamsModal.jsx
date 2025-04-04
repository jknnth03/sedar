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
          {selectedTeam ? "Edit Team" : "ADD TEAM"}
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

      <DialogActions>
        <Button onClick={handleClose} disabled={adding || updating}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={adding || updating}>
          {adding || updating ? "Saving..." : selectedTeam ? "Update" : "Add"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
