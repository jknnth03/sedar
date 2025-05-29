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
  usePostReligionsMutation,
  useUpdateReligionsMutation,
} from "../../../features/api/extras/religionsApi";
import { CONSTANT } from "../../../config";
import EditIcon from "@mui/icons-material/Edit";

export default function ReligionsModal({
  open,
  handleClose,
  refetch,
  showArchived,
  selectedReligion,
}) {
  const [religionName, setReligionName] = useState("");
  const [code, setCode] = useState("");
  const [errorMessage, setErrorMessage] = useState(null);
  const [errors, setErrors] = useState({ religionName: false, code: false });

  const [postReligion, { isLoading: adding }] = usePostReligionsMutation();
  const [updateReligion, { isLoading: updating }] =
    useUpdateReligionsMutation();
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    if (open) {
      setReligionName(selectedReligion?.name || "");
      setCode(selectedReligion?.code || "");
      setErrorMessage(null);
      setErrors({ religionName: false, code: false });
    }
  }, [open, selectedReligion]);

  const handleSubmit = async () => {
    setErrorMessage(null);
    let newErrors = { religionName: false, code: false };

    if (!religionName.trim()) newErrors.religionName = true;
    if (!code.trim()) newErrors.code = true;

    setErrors(newErrors);

    if (newErrors.religionName || newErrors.code) {
      setErrorMessage("Please fill out all required fields.");
      return;
    }

    const payload = {
      name: religionName.trim(),
      code: code.trim(),
      status: showArchived ? "inactive" : "active",
    };

    try {
      if (selectedReligion) {
        await updateReligion({ id: selectedReligion.id, ...payload }).unwrap();
        enqueueSnackbar("Religion updated successfully!", {
          variant: "success",
          autoHideDuration: 2000,
        });
      } else {
        await postReligion(payload).unwrap();
        enqueueSnackbar("Religion added successfully!", {
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
      <DialogTitle className="dialog_title">
        <Box className="dialog_title_text">
          {selectedReligion ? "EDIT RELIGION" : "ADD RELIGION"}
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
            label="Religion Name"
            variant="outlined"
            fullWidth
            margin="dense"
            value={religionName}
            onChange={(e) => setReligionName(e.target.value)}
            disabled={adding || updating}
            error={errors.religionName}
            helperText={errors.religionName ? "Religion Name is required" : ""}
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
              {selectedReligion
                ? CONSTANT.BUTTONS.ADD.icon2
                : CONSTANT.BUTTONS.ADD.icon1}
              {selectedReligion
                ? CONSTANT.BUTTONS.ADD.label2
                : CONSTANT.BUTTONS.ADD.label1}
            </>
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
