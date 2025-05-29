import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Alert,
} from "@mui/material";
import { useSnackbar } from "notistack";
import {
  usePostRequisitionsMutation,
  useUpdateRequisitionsMutation,
} from "../../../features/api/extras/requisitionsApi";
import { CONSTANT } from "../../../config";

const RequisitionsModal = ({
  open,
  handleClose,
  refetch,
  showArchived,
  selectedRequisition,
}) => {
  const { enqueueSnackbar } = useSnackbar();

  const [requisitionName, setRequisitionName] = useState("");
  const [code, setCode] = useState("");
  const [errorMessage, setErrorMessage] = useState(null);
  const [errors, setErrors] = useState({
    requisitionName: false,
    code: false,
  });

  const [postRequisition, { isLoading: adding }] =
    usePostRequisitionsMutation();
  const [updateRequisition, { isLoading: updating }] =
    useUpdateRequisitionsMutation();

  useEffect(() => {
    if (open && selectedRequisition) {
      setRequisitionName(selectedRequisition?.name || "");
      setCode(selectedRequisition?.code || "");
      setErrorMessage(null);
      setErrors({
        requisitionName: false,
        code: false,
      });
    } else if (!selectedRequisition) {
      setRequisitionName("");
      setCode("");
      setErrorMessage(null);
      setErrors({
        requisitionName: false,
        code: false,
      });
    }
  }, [open, selectedRequisition]);

  const handleSubmit = async () => {
    setErrorMessage(null);

    // Validation
    let newErrors = {
      requisitionName: false,
      code: false,
    };

    if (!requisitionName.trim()) newErrors.requisitionName = true;
    if (!code.trim()) newErrors.code = true;

    setErrors(newErrors);

    if (newErrors.requisitionName || newErrors.code) {
      setErrorMessage("Please fill out all required fields.");
      return;
    }

    const payload = {
      name: requisitionName.trim(),
      code: code.trim(),
      status: showArchived ? "inactive" : "active",
    };

    try {
      if (selectedRequisition) {
        await updateRequisition({
          id: selectedRequisition.id,
          ...payload,
        }).unwrap();
        enqueueSnackbar("Requisition type updated successfully!", {
          variant: "success",
        });
      } else {
        await postRequisition(payload).unwrap();
        enqueueSnackbar("Requisition type created successfully!", {
          variant: "success",
        });
      }

      if (typeof refetch === "function") refetch();
      handleClose();
    } catch (error) {
      console.error("Error:", error);
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
          {selectedRequisition ? "EDIT REQUISITION" : "ADD REQUISITION"}
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
            label="Requisition Name"
            variant="outlined"
            fullWidth
            margin="dense"
            value={requisitionName}
            onChange={(e) => setRequisitionName(e.target.value)}
            disabled={adding || updating}
            error={errors.requisitionName}
            helperText={
              errors.requisitionName ? "Requisition Name is required" : ""
            }
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
              {selectedRequisition
                ? CONSTANT.BUTTONS.ADD.icon2
                : CONSTANT.BUTTONS.ADD.icon1}
              {selectedRequisition
                ? CONSTANT.BUTTONS.ADD.label2
                : CONSTANT.BUTTONS.ADD.label1}
            </>
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RequisitionsModal;
