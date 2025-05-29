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

import { CONSTANT } from "../../../config";
import EditIcon from "@mui/icons-material/Edit";
import {
  usePostBanksMutation,
  useUpdateBanksMutation,
} from "../../../features/api/extras/banksApi";

const BanksModal = ({
  open,
  handleClose,
  refetch,
  showArchived,
  selectedBank,
}) => {
  const { enqueueSnackbar } = useSnackbar();

  const [bankName, setBankName] = useState("");
  const [code, setCode] = useState("");
  const [errorMessage, setErrorMessage] = useState(null);
  const [errors, setErrors] = useState({
    bankName: false,
    code: false,
  });

  const [postBank, { isLoading: adding }] = usePostBanksMutation();
  const [updateBank, { isLoading: updating }] = useUpdateBanksMutation();

  useEffect(() => {
    if (open && selectedBank) {
      setBankName(selectedBank?.name || "");
      setCode(selectedBank?.code || "");
      setErrorMessage(null);
      setErrors({ bankName: false, code: false });
    } else if (!selectedBank) {
      setBankName("");
      setCode("");
      setErrorMessage(null);
      setErrors({ bankName: false, code: false });
    }
  }, [open, selectedBank]);

  const handleSubmit = async () => {
    setErrorMessage(null);

    const newErrors = {
      bankName: !bankName.trim(),
      code: !code.trim(),
    };

    setErrors(newErrors);

    if (newErrors.bankName || newErrors.code) {
      setErrorMessage("Please fill out all required fields.");
      return;
    }

    const payload = {
      name: bankName.trim(),
      code: code.trim(),
      status: showArchived ? "inactive" : "active",
    };

    try {
      if (selectedBank) {
        await updateBank({
          id: selectedBank.id,
          ...payload,
        }).unwrap();
        enqueueSnackbar("Bank updated successfully!", {
          variant: "success",
        });
      } else {
        await postBank(payload).unwrap();
        enqueueSnackbar("Bank created successfully!", {
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
          {selectedBank ? "EDIT BANK" : "ADD BANK"}
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box minWidth={300}>
          {errorMessage && (
            <Alert severity="error" sx={{ mt: 1 }}>
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
            sx={{ mt: 3 }}
          />

          <TextField
            label="Bank Name"
            variant="outlined"
            fullWidth
            margin="dense"
            value={bankName}
            onChange={(e) => setBankName(e.target.value)}
            disabled={adding || updating}
            error={errors.bankName}
            helperText={errors.bankName ? "Bank name is required" : ""}
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
              {selectedBank
                ? CONSTANT.BUTTONS.ADD.icon2
                : CONSTANT.BUTTONS.ADD.icon1}
              {selectedBank
                ? CONSTANT.BUTTONS.ADD.label2
                : CONSTANT.BUTTONS.ADD.label1}
            </>
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default BanksModal;
