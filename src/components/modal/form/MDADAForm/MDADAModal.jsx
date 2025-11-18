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
  Tooltip,
} from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import {
  Close as CloseIcon,
  Description as DescriptionIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Save as SaveIcon,
} from "@mui/icons-material";
import dayjs from "dayjs";
import { useSnackbar } from "notistack";
import {
  useGetMdaDaPrefillQuery,
  useCreateMdaDaMutation,
  useUpdateMdaDaMutation,
  useLazyGetSingleMdaDaSubmissionQuery,
} from "../../../../features/api/forms/mdaDaApi";
import {
  useGetAllJobLevelsQuery,
  useGetAllPositionsQuery,
} from "../../../../features/api/forms/mdaApi";
import MDADAModalFields from "./MDADAModalFields";
import * as styles from "../DAForm/DAFormModal.styles";

const MDADAModal = ({
  open = false,
  onClose,
  daSubmissionId = null,
  submissionId = null,
  mode = "create",
  selectedEntry = null,
  onModeChange,
  isLoading = false,
}) => {
  const { enqueueSnackbar } = useSnackbar();

  const methods = useForm({
    defaultValues: {
      form_id: 5,
      da_submission_id: null,
      employee_id: "",
      employee_name: "",
      employee_number: "",
      effective_date: null,
      action_type: "",
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
      from_position_id: null,
      from_position_title: "",
      from_job_level_id: null,
      from_job_level: "",
      from_department: "",
      from_sub_unit: "",
      from_job_rate: "",
      from_allowance: "",
      to_position_id: null,
      to_position_title: "",
      to_job_level_id: null,
      to_job_level: "",
      to_department: "",
      to_sub_unit: "",
      to_job_rate: "",
      to_allowance: "",
    },
  });

  const { reset, setValue, handleSubmit } = methods;
  const [formInitialized, setFormInitialized] = useState(false);
  const [currentMode, setCurrentMode] = useState(mode);

  const { data: jobLevelsData, isLoading: isJobLevelsLoading } =
    useGetAllJobLevelsQuery(undefined, {
      skip: !open,
      refetchOnMountOrArgChange: true,
    });
  const jobLevels = jobLevelsData?.result || [];

  const { data: positionsData, isLoading: isPositionsLoading } =
    useGetAllPositionsQuery(undefined, {
      skip: !open,
      refetchOnMountOrArgChange: true,
    });
  const positions = positionsData?.result || [];

  const {
    data: prefillData,
    isLoading: isPrefillLoading,
    isFetching: isPrefillFetching,
    error: prefillError,
  } = useGetMdaDaPrefillQuery(daSubmissionId, {
    skip: !open || !daSubmissionId || mode !== "create",
  });

  const [
    fetchSubmission,
    {
      data: submissionData,
      isLoading: isSubmissionLoading,
      error: submissionError,
    },
  ] = useLazyGetSingleMdaDaSubmissionQuery();

  const [createMdaDa, { isLoading: isCreating }] = useCreateMdaDaMutation();
  const [updateMdaDa, { isLoading: isUpdating }] = useUpdateMdaDaMutation();

  const showLoadingState =
    isPrefillLoading ||
    isPrefillFetching ||
    isJobLevelsLoading ||
    isPositionsLoading ||
    isSubmissionLoading;

  useEffect(() => {
    if (!open) {
      setFormInitialized(false);
      setCurrentMode(mode);
      reset();
    }
  }, [open, mode, reset]);

  useEffect(() => {
    if (open && submissionId && (mode === "view" || mode === "edit")) {
      setFormInitialized(false);
      fetchSubmission(submissionId);
    }
  }, [open, submissionId, mode, fetchSubmission]);

  useEffect(() => {
    if (
      open &&
      mode === "create" &&
      prefillData?.result &&
      !formInitialized &&
      !showLoadingState
    ) {
      const result = prefillData.result;

      const formData = {
        form_id: 5,
        da_submission_id: result.da_submission_id || null,
        employee_id: result.employee_id || "",
        employee_name: result.employee_name || "",
        employee_number: result.employee_number || "",
        effective_date: result.effective_date
          ? dayjs(result.effective_date)
          : null,
        action_type: result.movement_type || "",
        birth_date: result.birth_date ? dayjs(result.birth_date) : null,
        birth_place: result.birth_place || "",
        gender: result.gender || "",
        civil_status: result.civil_status || "",
        nationality: result.nationality || "",
        address: result.address || "",
        tin_number: result.tin_number || "",
        sss_number: result.sss_number || "",
        pag_ibig_number: result.pag_ibig_number || "",
        philhealth_number: result.philhealth_number || "",
        from_position_id: result.from?.position_id || null,
        from_position_title: result.from?.position_title || "",
        from_job_level_id: result.from?.job_level_id || null,
        from_job_level: result.from?.job_level || "",
        from_department: result.from?.department || "",
        from_sub_unit: result.from?.sub_unit || "",
        from_job_rate: result.from?.job_rate || "",
        from_allowance: result.from?.allowance || "",
        to_position_id: result.to?.position_id || null,
        to_position_title: result.to?.position_title || "",
        to_job_level_id: result.to?.job_level_id || null,
        to_job_level: result.to?.job_level || "",
        to_department: result.to?.department || "",
        to_sub_unit: result.to?.sub_unit || "",
        to_job_rate: result.to?.job_rate || "",
        to_allowance: result.to?.allowance || "",
      };

      Object.keys(formData).forEach((key) => {
        setValue(key, formData[key], { shouldValidate: false });
      });

      setFormInitialized(true);
    }
  }, [open, mode, prefillData, formInitialized, showLoadingState, setValue]);

  useEffect(() => {
    if (
      open &&
      (mode === "view" || mode === "edit") &&
      submissionData?.result &&
      !formInitialized &&
      !showLoadingState
    ) {
      const result = submissionData.result;
      const submittable = result.submittable;

      const formData = {
        form_id: 5,
        da_submission_id: result.id || null,
        employee_id: submittable?.employee_id || "",
        employee_name: submittable?.employee_name || "",
        employee_number: submittable?.employee_number || "",
        effective_date: submittable?.effective_date
          ? dayjs(submittable.effective_date)
          : null,
        action_type: submittable?.movement_type || "",
        birth_date: submittable?.birth_date
          ? dayjs(submittable.birth_date)
          : null,
        birth_place: submittable?.birth_place || "",
        gender: submittable?.gender || "",
        civil_status: submittable?.civil_status || "",
        nationality: submittable?.nationality || "",
        address: submittable?.address || "",
        tin_number: submittable?.tin_number || "",
        sss_number: submittable?.sss_number || "",
        pag_ibig_number: submittable?.pag_ibig_number || "",
        philhealth_number: submittable?.philhealth_number || "",
        from_position_id: submittable?.from_details?.position_id || null,
        from_position_title: submittable?.from_details?.position_title || "",
        from_job_level_id: submittable?.from_details?.job_level_id || null,
        from_job_level: submittable?.from_details?.job_level || "",
        from_department: submittable?.from_details?.department || "",
        from_sub_unit: submittable?.from_details?.sub_unit || "",
        from_job_rate: submittable?.from_details?.job_rate || "",
        from_allowance: submittable?.from_details?.allowance || "",
        to_position_id: submittable?.to_details?.position_id || null,
        to_position_title: submittable?.to_details?.position_title || "",
        to_job_level_id: submittable?.to_details?.job_level_id || null,
        to_job_level: submittable?.to_details?.job_level || "",
        to_department: submittable?.to_details?.department || "",
        to_sub_unit: submittable?.to_details?.sub_unit || "",
        to_job_rate: submittable?.to_details?.job_rate || "",
        to_allowance: submittable?.to_details?.allowance || "",
      };

      Object.keys(formData).forEach((key) => {
        setValue(key, formData[key], { shouldValidate: false });
      });

      setFormInitialized(true);
    }
  }, [open, mode, submissionData, formInitialized, showLoadingState, setValue]);

  const shouldEnableEditButton = () => {
    return currentMode === "view" && !isProcessing;
  };

  const handleClose = () => {
    setFormInitialized(false);
    setCurrentMode("view");
    reset();
    onClose();
  };

  const handleModeChange = (newMode) => {
    setCurrentMode(newMode);
    if (onModeChange) {
      onModeChange(newMode);
    }
  };

  const handleCancelEdit = () => {
    handleModeChange("view");
  };

  const onSubmit = async (data) => {
    try {
      const formattedData = {
        ...data,
        effective_date: data.effective_date
          ? dayjs(data.effective_date).format("YYYY-MM-DD")
          : null,
        birth_date: data.birth_date
          ? dayjs(data.birth_date).format("YYYY-MM-DD")
          : null,
      };

      if (currentMode === "create") {
        await createMdaDa(formattedData).unwrap();
        enqueueSnackbar("MDA (DA) created successfully!", {
          variant: "success",
          autoHideDuration: 3000,
        });
      } else if (currentMode === "edit") {
        await updateMdaDa({
          id: submissionId,
          data: formattedData,
        }).unwrap();
        enqueueSnackbar("MDA (DA) updated successfully!", {
          variant: "success",
          autoHideDuration: 3000,
        });
      }

      handleClose();
    } catch (error) {
      const errorMessage =
        error?.data?.message ||
        `Failed to ${
          currentMode === "create" ? "create" : "update"
        } MDA (DA). Please try again.`;
      enqueueSnackbar(errorMessage, {
        variant: "error",
        autoHideDuration: 3000,
      });
    }
  };

  const isProcessing = isLoading || isCreating || isUpdating;
  const formKey = `mdada-form-${open ? "open" : "closed"}-${currentMode}`;
  const isReadOnly = currentMode === "view";

  const getTitle = () => {
    if (currentMode === "create") return "CREATE MDA (FROM DA)";
    if (currentMode === "edit") return "EDIT MDA (FROM DA)";
    return "VIEW MDA (FROM DA)";
  };

  const getButtonText = () => {
    if (currentMode === "create")
      return isProcessing ? "Creating..." : "Create";
    if (currentMode === "edit") return isProcessing ? "Saving..." : "Save";
    return "Edit";
  };

  const getButtonIcon = () => {
    if (isProcessing) return <CircularProgress size={16} />;
    if (currentMode === "create") return <AddIcon />;
    if (currentMode === "edit") return <SaveIcon />;
    return <EditIcon />;
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <FormProvider {...methods}>
        <Dialog
          open={open}
          onClose={handleClose}
          maxWidth={false}
          PaperProps={{ sx: styles.dialogPaperStyles }}>
          <DialogTitle sx={styles.dialogTitleStyles}>
            <Box sx={styles.titleBoxStyles}>
              <DescriptionIcon sx={styles.descriptionIconStyles} />
              <Typography
                variant="h6"
                component="div"
                sx={styles.titleTypographyStyles}>
                {getTitle()}
              </Typography>
              {currentMode === "view" && (
                <Tooltip
                  title={
                    shouldEnableEditButton()
                      ? "EDIT FORM"
                      : "Edit not available"
                  }
                  arrow
                  placement="top">
                  <span>
                    <IconButton
                      onClick={() => handleModeChange("edit")}
                      disabled={!shouldEnableEditButton() || isProcessing}
                      size="small"
                      sx={{
                        ml: 1,
                        padding: "8px",
                        "&:hover": {
                          backgroundColor:
                            shouldEnableEditButton() && !isProcessing
                              ? "rgba(0, 136, 32, 0.08)"
                              : "transparent",
                          transform:
                            shouldEnableEditButton() && !isProcessing
                              ? "scale(1.1)"
                              : "none",
                          transition: "all 0.2s ease-in-out",
                        },
                      }}>
                      <EditIcon
                        sx={{
                          fontSize: "20px",
                          "& path": {
                            fill:
                              shouldEnableEditButton() && !isProcessing
                                ? "rgba(0, 136, 32, 1)"
                                : "rgba(0, 0, 0, 0.26)",
                          },
                        }}
                      />
                    </IconButton>
                  </span>
                </Tooltip>
              )}
            </Box>
            <IconButton onClick={handleClose} sx={styles.closeIconButtonStyles}>
              <CloseIcon sx={styles.closeIconStyles} />
            </IconButton>
          </DialogTitle>

          <form onSubmit={handleSubmit(onSubmit)} key={formKey}>
            <DialogContent sx={styles.dialogContentStyles}>
              {showLoadingState ? (
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
                    {isJobLevelsLoading || isPositionsLoading
                      ? "Loading form data..."
                      : "Loading employee data..."}
                  </Typography>
                </Box>
              ) : prefillError || submissionError ? (
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    minHeight: "400px",
                  }}>
                  <Typography color="error">
                    Failed to load prefill data. Please try again.
                  </Typography>
                </Box>
              ) : (
                <MDADAModalFields
                  key={formKey}
                  isCreate={currentMode === "create"}
                  isReadOnly={isReadOnly}
                  currentMode={currentMode}
                  positions={positions}
                  jobLevels={jobLevels}
                />
              )}
            </DialogContent>

            <DialogActions sx={styles.dialogActionsStyles}>
              {!showLoadingState && !prefillError && !submissionError && (
                <>
                  {currentMode === "edit" && (
                    <Button
                      onClick={handleCancelEdit}
                      variant="outlined"
                      disabled={isProcessing}
                      sx={{
                        ...styles.saveButtonStyles,
                        backgroundColor: "transparent",
                        color: "rgb(33, 61, 112)",
                        borderColor: "rgb(33, 61, 112)",
                        "&:hover": {
                          backgroundColor: "rgba(33, 61, 112, 0.04)",
                          borderColor: "rgb(33, 61, 112)",
                        },
                      }}>
                      Cancel
                    </Button>
                  )}
                  {(currentMode === "create" || currentMode === "edit") && (
                    <Button
                      type="submit"
                      variant="contained"
                      disabled={isProcessing || !formInitialized}
                      startIcon={getButtonIcon()}
                      sx={styles.saveButtonStyles}>
                      {getButtonText()}
                    </Button>
                  )}
                </>
              )}
            </DialogActions>
          </form>
        </Dialog>
      </FormProvider>
    </LocalizationProvider>
  );
};

export default MDADAModal;
