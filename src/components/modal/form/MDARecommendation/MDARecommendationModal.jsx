import React, { useEffect, useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Button,
  Typography,
  IconButton,
  CircularProgress,
  Tooltip,
} from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import {
  Close as CloseIcon,
  Description as DescriptionIcon,
  Save as SaveIcon,
  Edit as EditIcon,
  Send as SendIcon,
  CheckCircle as CheckCircleIcon,
} from "@mui/icons-material";
import dayjs from "dayjs";
import { useSnackbar } from "notistack";
import MDARecommendationModalFields from "./MDARecommendationModalFields";
import {
  useUpdateMdaRecommendationMutation,
  useResubmitFormSubmissionMutation,
  useCreateMdaRecommendationMutation,
} from "../../../../features/api/forms/mdaRecommendationApi";
import {
  dialogPaperStyles,
  dialogTitleStyles,
  titleBoxStyles,
  descriptionIconStyles,
  titleTypographyStyles,
  closeIconButtonStyles,
  closeIconStyles,
  dialogContentStyles,
  dialogActionsStyles,
} from "../MDAForm/MDAFornModal.styles";
import ConfirmationDialog from "../../../../styles/ConfirmationDialog";

const MDARecommendationModal = ({
  open = false,
  onClose,
  submissionId = null,
  mode = "view",
  selectedEntry = null,
  onModeChange,
  isLoading = false,
  onRefreshDetails,
  onRefetch,
  prefillData = null,
  daSubmissionId = null,
}) => {
  const { enqueueSnackbar } = useSnackbar();
  const [createMdaRecommendation, { isLoading: isCreating }] =
    useCreateMdaRecommendationMutation();
  const [updateMdaRecommendation, { isLoading: isUpdating }] =
    useUpdateMdaRecommendationMutation();
  const [resubmitFormSubmission, { isLoading: isResubmitting }] =
    useResubmitFormSubmissionMutation();

  const [showResubmitConfirmation, setShowResubmitConfirmation] =
    useState(false);

  const methods = useForm({
    defaultValues: {
      employee_name: "",
      employee_number: "",
      birth_date: null,
      birth_place: "",
      gender: "",
      civil_status: "",
      nationality: "",
      address: "",
      tin_number: "",
      sss_number: "",
      pag_ibig_number: "",
      philhealth_number: "",
      effective_date: null,
      from_position_title: "",
      from_job_level: "",
      from_department: "",
      from_sub_unit: "",
      from_job_rate: "",
      from_allowance: "",
      from_additional_rate: "",
      to_position_title: "",
      to_job_level: "",
      to_department: "",
      to_sub_unit: "",
      to_job_rate: "",
      to_allowance: "",
      to_additional_rate: "",
    },
  });

  const { reset, setValue } = methods;

  useEffect(() => {
    if (!open) {
      reset();
      setShowResubmitConfirmation(false);
    }
  }, [open, reset]);

  useEffect(() => {
    console.log("Prefill Data Effect:", { open, prefillData, mode });

    if (open && prefillData) {
      console.log("Setting prefill data:", prefillData);

      setValue("employee_name", prefillData.employee_name || "");
      setValue("employee_number", prefillData.employee_number || "");
      setValue(
        "birth_date",
        prefillData.birth_date ? dayjs(prefillData.birth_date) : null
      );
      setValue("birth_place", prefillData.birth_place || "");
      setValue("gender", prefillData.gender || "");
      setValue("civil_status", prefillData.civil_status || "");
      setValue("nationality", prefillData.nationality || "");
      setValue("address", prefillData.address || "");
      setValue("tin_number", prefillData.tin_number || "");
      setValue("sss_number", prefillData.sss_number || "");
      setValue("pag_ibig_number", prefillData.pag_ibig_number || "");
      setValue("philhealth_number", prefillData.philhealth_number || "");
      setValue(
        "effective_date",
        prefillData.effective_date ? dayjs(prefillData.effective_date) : null
      );

      if (prefillData.from) {
        console.log("Setting FROM data:", prefillData.from);
        setValue("from_position_title", prefillData.from.position_title || "");
        setValue("from_job_level", prefillData.from.job_level || "");
        setValue("from_department", prefillData.from.department || "");
        setValue("from_sub_unit", prefillData.from.sub_unit || "");
        setValue("from_job_rate", prefillData.from.job_rate || "");
        setValue("from_allowance", prefillData.from.allowance || "");
        setValue(
          "from_additional_rate",
          prefillData.from.additional_rate || ""
        );
      }

      if (prefillData.to) {
        console.log("Setting TO data:", prefillData.to);
        setValue("to_position_title", prefillData.to.position_title || "");
        setValue("to_job_level", prefillData.to.job_level || "");
        setValue("to_department", prefillData.to.department || "");
        setValue("to_sub_unit", prefillData.to.sub_unit || "");
        setValue("to_job_rate", prefillData.to.job_rate || "");
        setValue("to_allowance", prefillData.to.allowance || "");
        setValue("to_additional_rate", prefillData.to.additional_rate || "");
      }

      console.log("All values set, current form state:", methods.getValues());
    }
  }, [open, prefillData, setValue, methods]);

  useEffect(() => {
    if (open && selectedEntry?.result?.submittable && !prefillData) {
      const data = selectedEntry.result.submittable;

      setValue("employee_name", data.employee_name || "");
      setValue("employee_number", data.employee_number || "");
      setValue("birth_date", data.birth_date ? dayjs(data.birth_date) : null);
      setValue("birth_place", data.birth_place || "");
      setValue("gender", data.gender || "");
      setValue("civil_status", data.civil_status || "");
      setValue("nationality", data.nationality || "");
      setValue("address", data.address || "");
      setValue("tin_number", data.tin_number || "");
      setValue("sss_number", data.sss_number || "");
      setValue("pag_ibig_number", data.pag_ibig_number || "");
      setValue("philhealth_number", data.philhealth_number || "");
      setValue(
        "effective_date",
        data.effective_date ? dayjs(data.effective_date) : null
      );

      if (data.from_details) {
        setValue("from_position_title", data.from_details.position_title || "");
        setValue("from_job_level", data.from_details.job_level || "");
        setValue("from_department", data.from_details.department || "");
        setValue("from_sub_unit", data.from_details.sub_unit || "");
        setValue("from_job_rate", data.from_details.job_rate || "");
        setValue("from_allowance", data.from_details.allowance || "");
        setValue(
          "from_additional_rate",
          data.from_details.additional_rate || ""
        );
      }

      if (data.to_details) {
        setValue("to_position_title", data.to_details.position_title || "");
        setValue("to_job_level", data.to_details.job_level || "");
        setValue("to_department", data.to_details.department || "");
        setValue("to_sub_unit", data.to_details.sub_unit || "");
        setValue("to_job_rate", data.to_details.job_rate || "");
        setValue("to_allowance", data.to_details.allowance || "");
        setValue("to_additional_rate", data.to_details.additional_rate || "");
      }
    }
  }, [open, selectedEntry, setValue, prefillData]);

  const shouldEnableEditButton = () => {
    if (prefillData) return false;

    const status = selectedEntry?.result?.status || selectedEntry?.status;

    if (status === "APPROVED" || status === "CANCELLED") {
      return false;
    }

    const actions =
      selectedEntry?.result?.actions ||
      selectedEntry?.actions ||
      selectedEntry?.result?.submittable?.actions;

    const canUpdate = actions?.can_update === true;

    return canUpdate;
  };

  const shouldEnableResubmitButton = () => {
    const status = selectedEntry?.result?.status || selectedEntry?.status;

    if (status === "APPROVED" || status === "CANCELLED") {
      return false;
    }

    if (status === "AWAITING RESUBMISSION") {
      return true;
    }

    const actions =
      selectedEntry?.result?.actions ||
      selectedEntry?.actions ||
      selectedEntry?.result?.submittable?.actions;

    const canResubmit = actions?.can_resubmit === true;

    return canResubmit;
  };

  const showResubmitButton = () => {
    const isViewMode = mode === "view";
    const status = selectedEntry?.result?.status || selectedEntry?.status;

    return isViewMode && status === "AWAITING RESUBMISSION";
  };

  const handleClose = () => {
    onClose();
  };

  const handleCreate = async () => {
    const isValid = await methods.trigger([
      "to_job_rate",
      "to_allowance",
      "to_additional_rate",
    ]);

    if (!isValid) {
      enqueueSnackbar("Please fill in all required fields correctly", {
        variant: "error",
      });
      return;
    }

    try {
      const formData = methods.getValues();

      const payload = {
        form_id: 5,
        da_submission_id: daSubmissionId || prefillData?.da_submission_id,
        employee_id: prefillData?.employee_id,
        employee_name: formData.employee_name,
        employee_number: formData.employee_number,
        birth_date: formData.birth_date
          ? dayjs(formData.birth_date).format("YYYY-MM-DD")
          : null,
        birth_place: formData.birth_place,
        gender: formData.gender,
        civil_status: formData.civil_status,
        nationality: formData.nationality,
        address: formData.address,
        tin_number: formData.tin_number,
        sss_number: formData.sss_number,
        pag_ibig_number: formData.pag_ibig_number,
        philhealth_number: formData.philhealth_number,
        effective_date: formData.effective_date
          ? dayjs(formData.effective_date).format("YYYY-MM-DD")
          : null,
        movement_type: prefillData?.movement_type || "Developmental Assignment",
        from_position_id: prefillData?.from?.position_id,
        from_position_title: formData.from_position_title,
        from_department: formData.from_department,
        from_sub_unit: formData.from_sub_unit,
        from_job_level_id: prefillData?.from?.job_level_id,
        from_job_level: formData.from_job_level,
        from_schedule: prefillData?.from?.schedule,
        from_job_rate: formData.from_job_rate,
        from_allowance: formData.from_allowance,
        from_additional_rate: formData.from_additional_rate,
        to_position_id: prefillData?.to?.position_id,
        to_position_title: formData.to_position_title,
        to_department: formData.to_department,
        to_sub_unit: formData.to_sub_unit,
        to_job_level_id: prefillData?.to?.job_level_id,
        to_job_level: formData.to_job_level,
        to_schedule: prefillData?.to?.schedule,
        to_job_rate: formData.to_job_rate,
        to_allowance: formData.to_allowance,
        to_additional_rate: formData.to_additional_rate,
      };

      await createMdaRecommendation(payload).unwrap();

      enqueueSnackbar("MDA Recommendation created successfully", {
        variant: "success",
      });

      if (onRefreshDetails) {
        await onRefreshDetails();
      }

      if (onRefetch) {
        await onRefetch();
      }

      onClose();
    } catch (error) {
      console.error("Error creating MDA Recommendation:", error);
      enqueueSnackbar(
        error?.data?.message || "Failed to create MDA Recommendation",
        { variant: "error" }
      );
    }
  };

  const handleSave = async () => {
    const isValid = await methods.trigger([
      "to_job_rate",
      "to_allowance",
      "to_additional_rate",
    ]);

    if (!isValid) {
      enqueueSnackbar("Please fill in all required fields correctly", {
        variant: "error",
      });
      return;
    }

    try {
      const formData = methods.getValues();

      const payload = {
        to_job_rate: formData.to_job_rate || null,
        to_allowance: formData.to_allowance || null,
        to_additional_rate: formData.to_additional_rate || null,
      };

      await updateMdaRecommendation({
        id: submissionId,
        data: payload,
      }).unwrap();

      enqueueSnackbar("MDA Recommendation updated successfully", {
        variant: "success",
      });

      if (onRefreshDetails) {
        await onRefreshDetails();
      }

      if (onRefetch) {
        await onRefetch();
      }

      onModeChange("view");
      onClose();
    } catch (error) {
      console.error("Error updating MDA Recommendation:", error);
      enqueueSnackbar(
        error?.data?.message || "Failed to update MDA Recommendation",
        { variant: "error" }
      );
    }
  };

  const handleResubmitClick = () => {
    setShowResubmitConfirmation(true);
  };

  const handleConfirmResubmit = async () => {
    if (!submissionId) {
      enqueueSnackbar("Submission ID not found", { variant: "error" });
      setShowResubmitConfirmation(false);
      return;
    }

    try {
      await resubmitFormSubmission(submissionId).unwrap();
      enqueueSnackbar("Resubmitted successfully", { variant: "success" });

      if (onRefreshDetails) {
        await onRefreshDetails();
      }

      if (onRefetch) {
        await onRefetch();
      }

      setShowResubmitConfirmation(false);
      handleClose();
    } catch (error) {
      console.error("Error resubmitting:", error);
      enqueueSnackbar(error?.data?.message || "Failed to resubmit", {
        variant: "error",
      });
      setShowResubmitConfirmation(false);
    }
  };

  const handleCancelResubmit = () => {
    setShowResubmitConfirmation(false);
  };

  const isReadOnly = mode === "view" || isUpdating || isCreating;
  const isProcessing = isLoading || isUpdating || isResubmitting || isCreating;
  const shouldShowResubmit = showResubmitButton();

  const displayMode = prefillData
    ? "CREATE"
    : mode === "view"
    ? "VIEW"
    : "EDIT";

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <FormProvider {...methods}>
        <Dialog
          open={open}
          onClose={handleClose}
          maxWidth={false}
          PaperProps={{ sx: dialogPaperStyles }}>
          <DialogTitle sx={dialogTitleStyles}>
            <Box sx={titleBoxStyles}>
              <DescriptionIcon sx={descriptionIconStyles} />
              <Typography
                variant="h6"
                component="div"
                sx={titleTypographyStyles}>
                {displayMode} MDA (RECOMMENDATION)
              </Typography>
              {mode === "view" && !prefillData && (
                <Tooltip title="EDIT MDA RECOMMENDATION" arrow placement="top">
                  <span>
                    <IconButton
                      onClick={() => onModeChange && onModeChange("edit")}
                      disabled={!shouldEnableEditButton() || isProcessing}
                      size="small"
                      sx={{ ml: 2 }}>
                      <EditIcon
                        sx={{
                          color:
                            !shouldEnableEditButton() || isProcessing
                              ? "rgba(0, 0, 0, 0.26)"
                              : "rgba(0, 136, 32, 1)",
                        }}
                      />
                    </IconButton>
                  </span>
                </Tooltip>
              )}
            </Box>
            <IconButton onClick={handleClose} sx={closeIconButtonStyles}>
              <CloseIcon sx={closeIconStyles} />
            </IconButton>
          </DialogTitle>

          <DialogContent sx={dialogContentStyles}>
            {isLoading || isUpdating || isCreating ? (
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  minHeight: "400px",
                  gap: 2,
                }}>
                <CircularProgress size={48} />
                <Typography variant="body1" color="text.secondary">
                  {isCreating
                    ? "Creating MDA..."
                    : isUpdating
                    ? "Saving changes..."
                    : "Loading submission details..."}
                </Typography>
              </Box>
            ) : (
              <MDARecommendationModalFields
                isReadOnly={prefillData ? false : isReadOnly}
                currentMode={prefillData ? "create" : mode}
                submissionId={submissionId}
              />
            )}
          </DialogContent>

          <DialogActions sx={dialogActionsStyles}>
            {shouldShowResubmit && !prefillData && (
              <Button
                onClick={handleResubmitClick}
                variant="contained"
                disabled={!shouldEnableResubmitButton() || isProcessing}
                startIcon={
                  isProcessing ? <CircularProgress size={16} /> : <SendIcon />
                }
                sx={{
                  backgroundColor: "#4caf50",
                  color: "white",
                  textTransform: "uppercase",
                  fontWeight: 600,
                  paddingX: 3,
                  paddingY: 1,
                  borderRadius: 2,
                  "&:hover": {
                    backgroundColor: "#388e3c",
                  },
                  "&:disabled": {
                    backgroundColor: "#cccccc",
                  },
                }}>
                {isProcessing ? "Resubmitting..." : "Resubmit"}
              </Button>
            )}

            {prefillData && (
              <Button
                onClick={handleCreate}
                variant="contained"
                startIcon={<CheckCircleIcon />}
                disabled={isCreating}
                sx={{
                  backgroundColor: "#4caf50",
                  color: "white",
                  textTransform: "uppercase",
                  fontWeight: 600,
                  paddingX: 3,
                  paddingY: 1,
                  borderRadius: 2,
                  "&:hover": {
                    backgroundColor: "#388e3c",
                  },
                  "&:disabled": {
                    backgroundColor: "#cccccc",
                  },
                }}>
                {isCreating ? "Creating..." : "Create MDA"}
              </Button>
            )}

            {mode === "edit" && !prefillData && (
              <Button
                onClick={handleSave}
                variant="contained"
                startIcon={<SaveIcon />}
                disabled={isUpdating}
                sx={{
                  backgroundColor: "#4caf50",
                  color: "white",
                  textTransform: "uppercase",
                  fontWeight: 600,
                  paddingX: 3,
                  paddingY: 1,
                  borderRadius: 2,
                  "&:hover": {
                    backgroundColor: "#388e3c",
                  },
                  "&:disabled": {
                    backgroundColor: "#cccccc",
                  },
                }}>
                {isUpdating ? "Saving..." : "Save Changes"}
              </Button>
            )}
          </DialogActions>
        </Dialog>

        <ConfirmationDialog
          open={showResubmitConfirmation}
          onClose={handleCancelResubmit}
          onConfirm={handleConfirmResubmit}
          isLoading={isResubmitting}
          action="resubmit"
          module="MDA (RECOMMENDATION)"
        />
      </FormProvider>
    </LocalizationProvider>
  );
};

export default MDARecommendationModal;
