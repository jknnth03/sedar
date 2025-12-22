import React, { useState, useEffect } from "react";
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
} from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import {
  Close as CloseIcon,
  Description as DescriptionIcon,
  Save as SaveIcon,
} from "@mui/icons-material";
import dayjs from "dayjs";
import { useSnackbar } from "notistack";
import MDAEvaluationRecommendationModalFields from "./MDAEvaluationRecommendationModalFields";
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
import { useLazyGetMdaEvaluationPrefillQuery } from "../../../../features/api/forms/mdaEvaluationRecommendationApi";

const MDAEvaluationRecommendationModal = ({
  open = false,
  onClose,
  evaluationSubmissionId = null,
  onSave,
  mode = "create",
}) => {
  const { enqueueSnackbar } = useSnackbar();
  const [previousEvaluationSubmissionId, setPreviousEvaluationSubmissionId] =
    useState(null);

  const methods = useForm({
    defaultValues: {
      form_id: 5,
      probationary_evaluation_id: null,
      employee_id: "",
      employee_name: "",
      employee_number: "",
      effective_date: null,
      movement_type: "",
      birth_date: null,
      birth_place: "",
      gender: "",
      nationality: "",
      civil_status: "",
      address: "",
      tin_number: "",
      sss_number: "",
      pag_ibig_number: "",
      philhealth_number: "",
      from_position_id: null,
      from_position_title: "",
      from_department: "",
      from_sub_unit: "",
      from_job_level: "",
      from_job_level_id: null,
      from_job_rate: "",
      from_allowance: "",
      from_additional_rate: "",
      from_schedule: "",
      to_position_id: null,
      to_position_title: "",
      to_department: "",
      to_sub_unit: "",
      to_job_level: "",
      to_job_level_id: null,
      to_job_rate: "",
      to_allowance: "",
      to_additional_rate: "",
      to_schedule: "",
      reference_number: "",
    },
  });

  const { reset, handleSubmit } = methods;

  const [
    fetchPrefillData,
    { data: prefillData, isLoading: isPrefillLoading, error: prefillError },
  ] = useLazyGetMdaEvaluationPrefillQuery();

  useEffect(() => {
    if (!open) {
      reset();
      setPreviousEvaluationSubmissionId(null);
    }
  }, [open, reset]);

  useEffect(() => {
    if (
      open &&
      evaluationSubmissionId &&
      evaluationSubmissionId !== previousEvaluationSubmissionId
    ) {
      setPreviousEvaluationSubmissionId(evaluationSubmissionId);
      fetchPrefillData(evaluationSubmissionId);
    }
  }, [
    open,
    evaluationSubmissionId,
    previousEvaluationSubmissionId,
    fetchPrefillData,
  ]);

  useEffect(() => {
    if (prefillData?.result) {
      const data = prefillData.result;

      console.log("Prefill Data:", data);
      console.log("Mode:", mode);

      const fromData = data.from;
      const toData = data.to;

      console.log("From Data:", fromData);
      console.log("To Data:", toData);

      const formData = {
        form_id: 5,
        probationary_evaluation_id:
          data.probationary_evaluation_id || evaluationSubmissionId || null,
        employee_id: data.employee_id || "",
        employee_name: data.employee_name || "",
        employee_number: data.employee_number || "",
        effective_date: data.effective_date ? dayjs(data.effective_date) : null,
        movement_type: data.movement_type || "",
        birth_date: data.birth_date ? dayjs(data.birth_date) : null,
        birth_place: data.birth_place || "",
        gender: data.gender || "",
        nationality: data.nationality || "",
        civil_status: data.civil_status || "",
        address: data.address || "",
        tin_number: data.tin_number || "",
        sss_number: data.sss_number || "",
        pag_ibig_number: data.pag_ibig_number || "",
        philhealth_number: data.philhealth_number || "",
        from_position_id: fromData?.position_id || null,
        from_position_title: fromData?.position_title || "",
        from_department: fromData?.department || "",
        from_sub_unit: fromData?.sub_unit || "",
        from_job_level: fromData?.job_level || "",
        from_job_level_id: fromData?.job_level_id || null,
        from_job_rate: fromData?.job_rate || "",
        from_allowance: fromData?.allowance || "",
        from_additional_rate: fromData?.additional_rate || "",
        from_schedule: fromData?.schedule || "",
        to_position_id: toData?.position_id || null,
        to_position_title: toData?.position_title || "",
        to_department: toData?.department || "",
        to_sub_unit: toData?.sub_unit || "",
        to_job_level: toData?.job_level || "",
        to_job_level_id: toData?.job_level_id || null,
        to_job_rate: toData?.job_rate || "",
        to_allowance: toData?.allowance || "",
        to_additional_rate: toData?.additional_rate || "",
        to_schedule: toData?.schedule || "",
        reference_number: data.reference_number || "",
      };

      console.log("Form Data to Reset:", formData);

      reset(formData);
    }
  }, [prefillData, reset, evaluationSubmissionId, mode]);

  useEffect(() => {
    if (prefillError) {
      enqueueSnackbar("Failed to load MDA data. Please try again.", {
        variant: "error",
        autoHideDuration: 3000,
      });
    }
  }, [prefillError, enqueueSnackbar]);

  const handleClose = () => {
    reset();
    onClose();
  };

  const onSubmit = async (data) => {
    try {
      const submitData = {
        ...data,
        effective_date: data.effective_date
          ? dayjs(data.effective_date).format("YYYY-MM-DD")
          : null,
        birth_date: data.birth_date
          ? dayjs(data.birth_date).format("YYYY-MM-DD")
          : null,
      };

      const result = await onSave(submitData, mode);

      if (result?.error) {
        const errorData = result.error?.data || result.error;
        const errorMessage =
          errorData?.message || "Failed to save MDA. Please try again.";
        const errors = errorData?.errors || {};

        let detailedMessage = errorMessage;
        if (Object.keys(errors).length > 0) {
          const errorList = Object.entries(errors)
            .map(([field, messages]) => {
              const msgArray = Array.isArray(messages) ? messages : [messages];
              return `• ${field}: ${msgArray.join(", ")}`;
            })
            .join("\n");
          detailedMessage = `${errorMessage}\n\n${errorList}`;
        }

        enqueueSnackbar(detailedMessage, {
          variant: "error",
          autoHideDuration: 6000,
          style: { whiteSpace: "pre-line" },
        });
        return;
      }

      enqueueSnackbar("MDA saved successfully!", {
        variant: "success",
        autoHideDuration: 3000,
      });
      handleClose();
    } catch (error) {
      const errorData = error?.response?.data || error?.data || {};
      const errorMessage =
        errorData?.message ||
        error?.message ||
        "An unexpected error occurred. Please try again.";
      const errors = errorData?.errors || {};

      let detailedMessage = errorMessage;
      if (Object.keys(errors).length > 0) {
        const errorList = Object.entries(errors)
          .map(([field, messages]) => {
            const msgArray = Array.isArray(messages) ? messages : [messages];
            return `• ${field}: ${msgArray.join(", ")}`;
          })
          .join("\n");
        detailedMessage = `${errorMessage}\n\n${errorList}`;
      }

      enqueueSnackbar(detailedMessage, {
        variant: "error",
        autoHideDuration: 6000,
        style: { whiteSpace: "pre-line" },
      });
    }
  };

  const isReadOnly = mode === "view";
  const isCreate = mode === "create";
  const isLoading = isPrefillLoading;
  const hasError = prefillError;

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
                {isCreate ? "CREATE MDA (EVALUATION)" : "VIEW MDA (EVALUATION)"}
              </Typography>
            </Box>
            <IconButton onClick={handleClose} sx={closeIconButtonStyles}>
              <CloseIcon sx={closeIconStyles} />
            </IconButton>
          </DialogTitle>

          <DialogContent sx={dialogContentStyles}>
            {isLoading ? (
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
                  Loading MDA data...
                </Typography>
              </Box>
            ) : hasError ? (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  minHeight: "400px",
                }}>
                <Typography color="error">
                  Failed to load data. Please try again.
                </Typography>
              </Box>
            ) : (
              <MDAEvaluationRecommendationModalFields
                isCreate={isCreate}
                isReadOnly={isReadOnly}
                currentMode={mode}
                submissionId={evaluationSubmissionId}
              />
            )}
          </DialogContent>

          <DialogActions sx={dialogActionsStyles}>
            {!isReadOnly && (
              <Button
                onClick={handleSubmit(onSubmit)}
                variant="contained"
                disabled={isLoading}
                startIcon={
                  isLoading ? <CircularProgress size={16} /> : <SaveIcon />
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
                {isCreate ? "Create MDA" : "Update MDA"}
              </Button>
            )}
          </DialogActions>
        </Dialog>
      </FormProvider>
    </LocalizationProvider>
  );
};

export default MDAEvaluationRecommendationModal;
