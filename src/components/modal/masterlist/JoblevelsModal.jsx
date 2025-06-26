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
  Autocomplete,
} from "@mui/material";
import { useSnackbar } from "notistack";
import { CONSTANT } from "../../../config";
import {
  usePostJoblevelMutation,
  useUpdateJoblevelMutation,
} from "../../../features/api/masterlist/joblevelsApi";
import "../../../pages/GeneralStyle.scss";

export default function JoblevelsModal({
  open,
  handleClose,
  refetch,
  showArchived,
  selectedJoblevel,
}) {
  const [joblevelName, setJoblevelName] = useState("");
  const [joblevelCode, setJoblevelCode] = useState("");
  const [salaryStructure, setSalaryStructure] = useState(null);
  const [payFrequency, setPayFrequency] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [errors, setErrors] = useState({
    joblevelName: false,
    joblevelCode: false,
    salaryStructure: false,
    payFrequency: false,
  });

  const [postJoblevel, { isLoading: adding }] = usePostJoblevelMutation();
  const [updateJoblevel, { isLoading: updating }] = useUpdateJoblevelMutation();
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    if (open && selectedJoblevel) {
      setJoblevelName(selectedJoblevel?.name || "");
      setJoblevelCode(selectedJoblevel?.code || "");
      setSalaryStructure(selectedJoblevel?.salary_structure || null);
      setPayFrequency(selectedJoblevel?.pay_frequency || null);
      setErrorMessage(null);
      setErrors({
        joblevelName: false,
        joblevelCode: false,
        salaryStructure: false,
        payFrequency: false,
      });
    } else if (!selectedJoblevel) {
      setJoblevelName("");
      setJoblevelCode("");
      setSalaryStructure(null);
      setPayFrequency(null);
      setErrorMessage(null);
      setErrors({
        joblevelName: false,
        joblevelCode: false,
        salaryStructure: false,
        payFrequency: false,
      });
    }
  }, [open, selectedJoblevel]);

  const handleSubmit = async () => {
    setErrorMessage(null);
    let newErrors = {
      joblevelName: false,
      joblevelCode: false,
      salaryStructure: false,
      payFrequency: false,
    };

    if (!joblevelName.trim()) newErrors.joblevelName = true;
    if (!joblevelCode.trim()) newErrors.joblevelCode = true;
    if (!salaryStructure) newErrors.salaryStructure = true;
    if (!payFrequency) newErrors.payFrequency = true;

    setErrors(newErrors);

    if (
      newErrors.joblevelName ||
      newErrors.joblevelCode ||
      newErrors.salaryStructure ||
      newErrors.payFrequency
    ) {
      setErrorMessage("Please fill out all required fields.");
      return;
    }

    const payload = {
      code: joblevelCode.trim(),
      name: joblevelName.trim(),
      salary_structure: salaryStructure,
      pay_frequency: payFrequency,
      status: showArchived ? "inactive" : "active",
    };

    try {
      if (selectedJoblevel) {
        await updateJoblevel({ id: selectedJoblevel.id, ...payload }).unwrap();
        enqueueSnackbar("Joblevel updated successfully!", {
          variant: "success",
          autoHideDuration: 2000,
        });
      } else {
        await postJoblevel(payload).unwrap();
        enqueueSnackbar("Joblevel added successfully!", {
          variant: "success",
          autoHideDuration: 2000,
        });
      }
      refetch();
      handleClose();
    } catch (error) {
      console.error("Error:", error);
      setErrorMessage(
        error?.data?.errors?.name
          ? "The joblevel name already exists. Please use a different name."
          : error?.data?.message || "An error occurred. Please try again."
      );
    }
  };

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle className="dialog_title">
        {selectedJoblevel ? "EDIT JOB LEVEL" : "ADD JOB-LEVEL"}
      </DialogTitle>

      <DialogContent>
        <Box minWidth={300}>
          {errorMessage && (
            <Alert severity="error" sx={{ marginTop: 1 }}>
              {errorMessage}
            </Alert>
          )}

          <TextField
            label="Joblevel Code"
            variant="outlined"
            fullWidth
            margin="dense"
            value={joblevelCode}
            onChange={(e) => setJoblevelCode(e.target.value)}
            disabled={adding || updating}
            error={errors.joblevelCode}
            helperText={errors.joblevelCode ? "Joblevel Code is required" : ""}
            sx={{ marginTop: 3 }}
          />
          <TextField
            label="Joblevel Name"
            variant="outlined"
            fullWidth
            margin="dense"
            value={joblevelName}
            onChange={(e) => setJoblevelName(e.target.value)}
            disabled={adding || updating}
            error={errors.joblevelName}
            helperText={errors.joblevelName ? "Joblevel Name is required" : ""}
          />

          <Autocomplete
            options={["MINIMUM", "MIDPOINT", "MAXIMUM"]}
            value={salaryStructure}
            onChange={(e, newValue) => setSalaryStructure(newValue)}
            disabled={adding || updating}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Choose Salary Structure"
                variant="outlined"
                error={errors.salaryStructure}
                helperText={
                  errors.salaryStructure ? "Salary Structure is required" : ""
                }
                margin="dense"
              />
            )}
          />

          <Autocomplete
            options={["MONTHLY PAID", "DAILY PAID", "HOURLY PAID"]}
            value={payFrequency}
            onChange={(e, newValue) => setPayFrequency(newValue)}
            disabled={adding || updating}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Choose Pay Frequency"
                variant="outlined"
                error={errors.payFrequency}
                helperText={
                  errors.payFrequency ? "Pay Frequency is required" : ""
                }
                margin="dense"
              />
            )}
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
              {selectedJoblevel
                ? CONSTANT.BUTTONS.ADD.icon2
                : CONSTANT.BUTTONS.ADD.icon1}
              {selectedJoblevel
                ? CONSTANT.BUTTONS.ADD.label2
                : CONSTANT.BUTTONS.ADD.label1}
            </>
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
