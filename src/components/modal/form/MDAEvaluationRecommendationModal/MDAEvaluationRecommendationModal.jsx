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
  Edit as EditIcon,
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
  selectedEntry = null,
  onSave,
  mode = "create",
  onModeChange,
}) => {
  const { enqueueSnackbar } = useSnackbar();
  const [previousEvaluationSubmissionId, setPreviousEvaluationSubmissionId] =
    useState(null);
  const [currentMode, setCurrentMode] = useState(mode);

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

  const extractValue = (value) => {
    if (typeof value === "object" && value !== null) {
      return value.name || value.code || value.id || "";
    }
    return value || "";
  };

  useEffect(() => {
    if (!open) {
      reset();
      setPreviousEvaluationSubmissionId(null);
      setCurrentMode(mode);
    }
  }, [open, reset, mode]);

  useEffect(() => {
    if (open) {
      setCurrentMode(mode);
    }
  }, [open, mode]);

  useEffect(() => {
    if (
      open &&
      evaluationSubmissionId &&
      evaluationSubmissionId !== previousEvaluationSubmissionId &&
      mode === "create" &&
      !selectedEntry
    ) {
      setPreviousEvaluationSubmissionId(evaluationSubmissionId);
      fetchPrefillData(evaluationSubmissionId);
    }
  }, [
    open,
    evaluationSubmissionId,
    previousEvaluationSubmissionId,
    fetchPrefillData,
    mode,
    selectedEntry,
  ]);

  useEffect(() => {
    if (selectedEntry && open) {
      const data = selectedEntry.submittable || selectedEntry;
      const fromData = data.from_details || data.from;
      const toData = data.to_details || data.to;

      const formData = {
        form_id: 5,
        probationary_evaluation_id:
          selectedEntry.submission_id || evaluationSubmissionId || null,
        employee_id: data.employee_id || "",
        employee_name: extractValue(data.employee_name),
        employee_number: extractValue(data.employee_number),
        effective_date: data.effective_date ? dayjs(data.effective_date) : null,
        movement_type: extractValue(data.movement_type),
        birth_date: data.birth_date ? dayjs(data.birth_date) : null,
        birth_place: extractValue(data.birth_place),
        gender: extractValue(data.gender),
        nationality: extractValue(data.nationality),
        civil_status: extractValue(data.civil_status),
        address: extractValue(data.address),
        tin_number: extractValue(data.tin_number),
        sss_number: extractValue(data.sss_number),
        pag_ibig_number: extractValue(data.pag_ibig_number),
        philhealth_number: extractValue(data.philhealth_number),
        from_position_id: fromData?.position_id || null,
        from_position_title: extractValue(fromData?.position_title),
        from_department: extractValue(fromData?.department),
        from_sub_unit: extractValue(fromData?.sub_unit),
        from_job_level: extractValue(fromData?.job_level),
        from_job_level_id: fromData?.job_level_id || null,
        from_job_rate: extractValue(fromData?.job_rate),
        from_allowance: extractValue(fromData?.allowance),
        from_additional_rate: extractValue(fromData?.additional_rate),
        from_schedule: extractValue(fromData?.schedule),
        to_position_id: toData?.position_id || null,
        to_position_title: extractValue(toData?.position_title),
        to_department: extractValue(toData?.department),
        to_sub_unit: extractValue(toData?.sub_unit),
        to_job_level: extractValue(toData?.job_level),
        to_job_level_id: toData?.job_level_id || null,
        to_job_rate: extractValue(toData?.job_rate),
        to_allowance: extractValue(toData?.allowance),
        to_additional_rate: extractValue(toData?.additional_rate),
        to_schedule: extractValue(toData?.schedule),
        reference_number: extractValue(data.reference_number),
      };

      reset(formData);
    }
  }, [selectedEntry, open, reset, evaluationSubmissionId]);

  useEffect(() => {
    if (prefillData?.result && !selectedEntry) {
      const data = prefillData.result;

      const fromData = data.from;
      const toData = data.to;

      const formData = {
        form_id: 5,
        probationary_evaluation_id:
          data.probationary_evaluation_id || evaluationSubmissionId || null,
        employee_id: data.employee_id || "",
        employee_name: extractValue(data.employee_name),
        employee_number: extractValue(data.employee_number),
        effective_date: data.effective_date ? dayjs(data.effective_date) : null,
        movement_type: extractValue(data.movement_type),
        birth_date: data.birth_date ? dayjs(data.birth_date) : null,
        birth_place: extractValue(data.birth_place),
        gender: extractValue(data.gender),
        nationality: extractValue(data.nationality),
        civil_status: extractValue(data.civil_status),
        address: extractValue(data.address),
        tin_number: extractValue(data.tin_number),
        sss_number: extractValue(data.sss_number),
        pag_ibig_number: extractValue(data.pag_ibig_number),
        philhealth_number: extractValue(data.philhealth_number),
        from_position_id: fromData?.position_id || null,
        from_position_title: extractValue(fromData?.position_title),
        from_department: extractValue(fromData?.department),
        from_sub_unit: extractValue(fromData?.sub_unit),
        from_job_level: extractValue(fromData?.job_level),
        from_job_level_id: fromData?.job_level_id || null,
        from_job_rate: extractValue(fromData?.job_rate),
        from_allowance: extractValue(fromData?.allowance),
        from_additional_rate: extractValue(fromData?.additional_rate),
        from_schedule: extractValue(fromData?.schedule),
        to_position_id: toData?.position_id || null,
        to_position_title: extractValue(toData?.position_title),
        to_department: extractValue(toData?.department),
        to_sub_unit: extractValue(toData?.sub_unit),
        to_job_level: extractValue(toData?.job_level),
        to_job_level_id: toData?.job_level_id || null,
        to_job_rate: extractValue(toData?.job_rate),
        to_allowance: extractValue(toData?.allowance),
        to_additional_rate: extractValue(toData?.additional_rate),
        to_schedule: extractValue(toData?.schedule),
        reference_number: extractValue(data.reference_number),
      };

      reset(formData);
    }
  }, [prefillData, reset, evaluationSubmissionId, selectedEntry]);

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
    setCurrentMode(mode);
    onClose();
  };

  const handleEditClick = () => {
    setCurrentMode("edit");
    if (onModeChange) {
      onModeChange("edit");
    }
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

      const result = await onSave(
        submitData,
        currentMode === "edit" ? "edit" : currentMode
      );

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

  const isReadOnly = currentMode === "view";
  const isCreate = currentMode === "create";
  const isEdit = currentMode === "edit";
  const isLoading = isPrefillLoading;
  const hasError = prefillError;

  const getDialogTitle = () => {
    if (isCreate) return "CREATE MDA (EVALUATION)";
    if (isEdit) return "EDIT MDA (EVALUATION)";
    return "VIEW MDA (EVALUATION)";
  };

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
                {getDialogTitle()}
              </Typography>
              {isReadOnly && (
                <IconButton
                  onClick={handleEditClick}
                  disabled={isLoading}
                  size="small"
                  sx={{
                    marginLeft: 1,
                    color: "rgba(0, 136, 32, 1)",
                    "&:hover": {
                      backgroundColor: "rgba(0, 136, 32, 0.08)",
                    },
                    "&:disabled": {
                      color: "#cccccc",
                    },
                  }}>
                  <EditIcon sx={{ fontSize: "1.3rem" }} />
                </IconButton>
              )}
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
                currentMode={currentMode}
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
