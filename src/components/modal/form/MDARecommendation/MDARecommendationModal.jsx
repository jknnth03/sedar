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
import { useLazyGetMdaRecommendationPrefillQuery } from "../../../../features/api/forms/mdaRecommendationApi";
import MDARecommendationModalFields from "./MDARecommendationModalFields";
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

const MDARecommendationModal = ({
  open = false,
  onClose,
  daSubmissionId = null,
  onSave,
  mode = "create",
}) => {
  const { enqueueSnackbar } = useSnackbar();
  const [previousDaSubmissionId, setPreviousDaSubmissionId] = useState(null);

  const methods = useForm({
    defaultValues: {
      form_id: 5,
      employee_movement_id: null,
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
  ] = useLazyGetMdaRecommendationPrefillQuery();

  useEffect(() => {
    if (!open) {
      reset();
      setPreviousDaSubmissionId(null);
    }
  }, [open, reset]);

  useEffect(() => {
    if (
      open &&
      daSubmissionId &&
      mode === "create" &&
      daSubmissionId !== previousDaSubmissionId
    ) {
      console.log("Fetching prefill data for DA submission:", daSubmissionId);
      setPreviousDaSubmissionId(daSubmissionId);
      fetchPrefillData(daSubmissionId);
    }
  }, [open, daSubmissionId, mode, previousDaSubmissionId]);

  useEffect(() => {
    if (prefillData?.result) {
      const data = prefillData.result;

      console.log("Prefill data received:", data);

      const formData = {
        form_id: 5,
        employee_movement_id: data.da_submission_id || null,
        employee_id: data.employee_id || "",
        employee_name: data.employee_name || "",
        employee_number: data.employee_number || "",
        effective_date: data.effective_date ? dayjs(data.effective_date) : null,
        movement_type: "Developmental Assignment",
        birth_date: data.birth_date || null,
        birth_place: data.birth_place || "",
        gender: data.gender || "",
        nationality: data.nationality || "",
        civil_status: data.civil_status || "",
        address: data.address || "",
        tin_number: data.tin_number || "",
        sss_number: data.sss_number || "",
        pag_ibig_number: data.pag_ibig_number || "",
        philhealth_number: data.philhealth_number || "",
        from_position_id: data.from?.position_id || null,
        from_position_title: data.from?.position_title || "",
        from_department: data.from?.department || "",
        from_sub_unit: data.from?.sub_unit || "",
        from_job_level: data.from?.job_level || "",
        from_job_level_id: data.from?.job_level_id || null,
        from_job_rate: data.from?.job_rate || "",
        from_allowance: data.from?.allowance || "",
        from_additional_rate: data.from?.additional_rate || "",
        from_schedule: data.from?.schedule || "",
        to_position_id: data.to?.position_id || null,
        to_position_title: data.to?.position_title || "",
        to_department: data.to?.department || "",
        to_sub_unit: data.to?.sub_unit || "",
        to_job_level: data.to?.job_level || "",
        to_job_level_id: data.to?.job_level_id || null,
        to_job_rate: data.to?.job_rate || "",
        to_allowance: data.to?.allowance || "",
        to_additional_rate: data.to?.additional_rate || "",
        to_schedule: data.to?.schedule || "",
        reference_number: data.reference_number || "",
      };

      console.log("Form data after mapping:", formData);

      reset(formData);
    }
  }, [prefillData, reset]);

  useEffect(() => {
    if (prefillError) {
      console.error("Error fetching prefill data:", prefillError);
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
    console.log("Form data before submit:", data);

    try {
      const submitData = {
        ...data,
        da_submission_id: data.employee_movement_id,
        movement_type: "Developmental Assignment",
        effective_date: data.effective_date
          ? dayjs(data.effective_date).format("YYYY-MM-DD")
          : null,
      };

      delete submitData.employee_movement_id;

      console.log("Submit data being sent:", submitData);

      const result = await onSave(submitData, mode);

      console.log("API result:", result);

      if (result?.error) {
        const errorData = result.error?.data || result.error;
        const errorMessage =
          errorData?.message || "Failed to save MDA. Please try again.";
        const errors = errorData?.errors || {};

        console.error("API error:", errorData);

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
      console.error("Error submitting MDA:", error);

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
                {isCreate
                  ? "CREATE MDA (RECOMMENDATION)"
                  : "VIEW MDA (RECOMMENDATION)"}
              </Typography>
            </Box>
            <IconButton onClick={handleClose} sx={closeIconButtonStyles}>
              <CloseIcon sx={closeIconStyles} />
            </IconButton>
          </DialogTitle>

          <DialogContent sx={dialogContentStyles}>
            {isPrefillLoading ? (
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
            ) : prefillError ? (
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
              <MDARecommendationModalFields
                isCreate={isCreate}
                isReadOnly={isReadOnly}
                currentMode={mode}
                submissionId={daSubmissionId}
              />
            )}
          </DialogContent>

          <DialogActions sx={dialogActionsStyles}>
            {!isReadOnly && (
              <Button
                onClick={handleSubmit(onSubmit)}
                variant="contained"
                disabled={isPrefillLoading}
                startIcon={
                  isPrefillLoading ? (
                    <CircularProgress size={16} />
                  ) : (
                    <SaveIcon />
                  )
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

export default MDARecommendationModal;
