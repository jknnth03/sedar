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
  usePostTitlesMutation,
  useUpdateTitlesMutation,
} from "../../../features/api/extras/titleApi";
import { CONSTANT } from "../../../config";

export default function TitleModal({
  open,
  handleClose,
  refetch,
  showArchived,
  selectedTitle,
}) {
  const [titleName, setTitleName] = useState("");
  const [code, setCode] = useState("");
  const [errorMessage, setErrorMessage] = useState(null);
  const [errors, setErrors] = useState({ titleName: false, code: false });

  const [postTitle, { isLoading: adding }] = usePostTitlesMutation();
  const [updateTitle, { isLoading: updating }] = useUpdateTitlesMutation();
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    if (open) {
      setTitleName(selectedTitle?.name || "");
      setCode(selectedTitle?.code || "");
      setErrorMessage(null);
      setErrors({ titleName: false, code: false });
    }
  }, [open, selectedTitle]);

  const handleSubmit = async () => {
    setErrorMessage(null);
    let newErrors = { titleName: false, code: false };

    if (!titleName.trim()) newErrors.titleName = true;
    if (!code.trim()) newErrors.code = true;

    setErrors(newErrors);

    if (newErrors.titleName || newErrors.code) {
      setErrorMessage("Please fill out all required fields.");
      return;
    }

    const payload = {
      name: titleName.trim(),
      code: code.trim(),
      status: showArchived ? "inactive" : "active",
    };

    try {
      if (selectedTitle) {
        await updateTitle({ id: selectedTitle.id, ...payload }).unwrap();
        enqueueSnackbar("Title updated successfully!", {
          variant: "success",
          autoHideDuration: 2000,
        });
      } else {
        await postTitle(payload).unwrap();
        enqueueSnackbar("Title added successfully!", {
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
          {selectedTitle ? "EDIT TITLE" : "ADD TITLE"}
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
            label="Title Name"
            variant="outlined"
            fullWidth
            margin="dense"
            value={titleName}
            onChange={(e) => setTitleName(e.target.value)}
            disabled={adding || updating}
            error={errors.titleName}
            helperText={errors.titleName ? "Title Name is required" : ""}
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
              {selectedTitle
                ? CONSTANT.BUTTONS.ADD.icon2
                : CONSTANT.BUTTONS.ADD.icon1}
              {selectedTitle
                ? CONSTANT.BUTTONS.ADD.label2
                : CONSTANT.BUTTONS.ADD.label1}
            </>
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
