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
} from "@mui/icons-material";
import dayjs from "dayjs";
import { useSnackbar } from "notistack";
import MDARecommendationModalFields from "./MDARecommendationModalFields";
import {
  useUpdateMdaRecommendationMutation,
  useResubmitFormSubmissionMutation,
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
}) => {
  const { enqueueSnackbar } = useSnackbar();
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
    if (open && selectedEntry?.result?.submittable) {
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
  }, [open, selectedEntry, setValue]);

  const shouldEnableEditButton = () => {
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

  const isReadOnly = mode === "view" || isUpdating;
  const isProcessing = isLoading || isUpdating || isResubmitting;
  const shouldShowResubmit = showResubmitButton();

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
                {mode === "view" ? "VIEW" : "EDIT"} MDA (RECOMMENDATION)
              </Typography>
              {mode === "view" && (
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
            {isLoading || isUpdating ? (
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
                  {isUpdating
                    ? "Saving changes..."
                    : "Loading submission details..."}
                </Typography>
              </Box>
            ) : (
              <MDARecommendationModalFields
                isReadOnly={isReadOnly}
                currentMode={mode}
                submissionId={submissionId}
              />
            )}
          </DialogContent>

          <DialogActions sx={dialogActionsStyles}>
            {shouldShowResubmit && (
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

            {mode === "edit" && (
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
