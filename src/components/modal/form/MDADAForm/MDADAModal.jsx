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
  Send as SendIcon,
} from "@mui/icons-material";
import EditOffIcon from "@mui/icons-material/EditOff";
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
import {
  getCreateModeInitialValues,
  setPrefillFormValues,
  setSubmissionFormValues,
} from "./MDADAFieldsGetValues";
import {
  dialogPaperStyles,
  dialogTitleStyles,
  titleBoxStyles,
  descriptionIconStyles,
  titleTypographyStyles,
  editIconButtonStyles,
  editIconStyles,
  cancelEditIconButtonStyles,
  editOffIconStyles,
  closeIconButtonStyles,
  closeIconStyles,
  dialogContentStyles,
  dialogActionsStyles,
  saveButtonStyles,
  resubmitButtonStyles,
} from "../mdaform/MDAFornModal.styles";

const MDADAModal = ({
  open = false,
  onClose,
  daSubmissionId = null,
  submissionId = null,
  mode = "create",
  selectedEntry = null,
  onModeChange,
  onResubmit,
  isLoading = false,
}) => {
  const { enqueueSnackbar } = useSnackbar();

  const methods = useForm({
    defaultValues: getCreateModeInitialValues(),
  });

  const { reset, setValue, handleSubmit } = methods;
  const [formInitialized, setFormInitialized] = useState(false);
  const [currentMode, setCurrentMode] = useState(mode);
  const [originalMode, setOriginalMode] = useState(mode);
  const [showResubmitConfirmation, setShowResubmitConfirmation] =
    useState(false);
  const [showUpdateConfirmation, setShowUpdateConfirmation] = useState(false);
  const [showCreateConfirmation, setShowCreateConfirmation] = useState(false);
  const [isConfirmingResubmit, setIsConfirmingResubmit] = useState(false);
  const [isConfirmingUpdate, setIsConfirmingUpdate] = useState(false);
  const [isConfirmingCreate, setIsConfirmingCreate] = useState(false);
  const [pendingFormData, setPendingFormData] = useState(null);

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
      setOriginalMode(mode);
      setShowResubmitConfirmation(false);
      setShowUpdateConfirmation(false);
      setShowCreateConfirmation(false);
      setPendingFormData(null);
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
      prefillData &&
      !formInitialized &&
      !showLoadingState
    ) {
      setPrefillFormValues(setValue, prefillData);
      setFormInitialized(true);
    }
  }, [open, mode, prefillData, formInitialized, showLoadingState, setValue]);

  useEffect(() => {
    if (
      open &&
      (mode === "view" || mode === "edit") &&
      submissionData &&
      !formInitialized &&
      !showLoadingState
    ) {
      setSubmissionFormValues(setValue, submissionData);
      setFormInitialized(true);
    }
  }, [open, mode, submissionData, formInitialized, showLoadingState, setValue]);

  const shouldEnableEditButton = () => {
    if (currentMode !== "view") return false;

    const status = selectedEntry?.result?.status || selectedEntry?.status;
    if (status === "APPROVED" || status === "CANCELLED") {
      return false;
    }

    const actions =
      selectedEntry?.result?.actions ||
      selectedEntry?.actions ||
      selectedEntry?.result?.submittable?.actions;

    return actions?.can_update === true && !isProcessing;
  };

  const shouldEnableResubmitButton = () => {
    const status = selectedEntry?.result?.status || selectedEntry?.status;
    if (status === "APPROVED" || status === "CANCELLED") {
      return false;
    }

    const actions =
      selectedEntry?.result?.actions ||
      selectedEntry?.actions ||
      selectedEntry?.result?.submittable?.actions;

    return actions?.can_resubmit === true;
  };

  const handleClose = () => {
    setFormInitialized(false);
    setCurrentMode(mode);
    setOriginalMode(mode);
    setShowResubmitConfirmation(false);
    setShowUpdateConfirmation(false);
    setShowCreateConfirmation(false);
    setIsConfirmingResubmit(false);
    setIsConfirmingUpdate(false);
    setIsConfirmingCreate(false);
    setPendingFormData(null);
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
    setCurrentMode(originalMode);
    if (submissionData) {
      setSubmissionFormValues(setValue, submissionData);
    }
  };

  const handleResubmitClick = () => {
    setShowResubmitConfirmation(true);
  };

  const handleConfirmResubmit = async () => {
    const idToUse =
      submissionId || selectedEntry?.result?.id || selectedEntry?.id;

    if (!idToUse) {
      enqueueSnackbar(
        "No submission ID found. Please close and reopen the modal.",
        {
          variant: "error",
          autoHideDuration: 3000,
        }
      );
      return;
    }

    if (!onResubmit || typeof onResubmit !== "function") {
      enqueueSnackbar(
        "Resubmit function not available. Please refresh the page.",
        {
          variant: "error",
          autoHideDuration: 3000,
        }
      );
      return;
    }

    setIsConfirmingResubmit(true);
    try {
      await onResubmit(idToUse);
      enqueueSnackbar("MDA (DA) resubmitted successfully!", {
        variant: "success",
        autoHideDuration: 3000,
      });
      setShowResubmitConfirmation(false);
      handleClose();
    } catch (error) {
      const errorMessage =
        error?.data?.message ||
        error?.message ||
        "An error occurred while resubmitting. Please try again.";
      enqueueSnackbar(errorMessage, {
        variant: "error",
        autoHideDuration: 3000,
      });
    } finally {
      setIsConfirmingResubmit(false);
    }
  };

  const handleCancelResubmit = () => {
    setShowResubmitConfirmation(false);
  };

  const handleConfirmUpdate = async () => {
    if (!pendingFormData) return;

    setIsConfirmingUpdate(true);
    try {
      await updateMdaDa({
        id: submissionId,
        data: pendingFormData,
      }).unwrap();
      enqueueSnackbar("MDA (DA) updated successfully!", {
        variant: "success",
        autoHideDuration: 3000,
      });
      setShowUpdateConfirmation(false);
      setPendingFormData(null);
      handleClose();
    } catch (error) {
      const errorMessage =
        error?.data?.message || "Failed to update MDA (DA). Please try again.";
      enqueueSnackbar(errorMessage, {
        variant: "error",
        autoHideDuration: 3000,
      });
    } finally {
      setIsConfirmingUpdate(false);
    }
  };

  const handleCancelUpdate = () => {
    setShowUpdateConfirmation(false);
    setPendingFormData(null);
  };

  const handleConfirmCreate = async () => {
    if (!pendingFormData) return;

    setIsConfirmingCreate(true);
    try {
      await createMdaDa(pendingFormData).unwrap();
      enqueueSnackbar("MDA (DA) created successfully!", {
        variant: "success",
        autoHideDuration: 3000,
      });
      setShowCreateConfirmation(false);
      setPendingFormData(null);
      handleClose();
    } catch (error) {
      const errorMessage =
        error?.data?.message || "Failed to create MDA (DA). Please try again.";
      enqueueSnackbar(errorMessage, {
        variant: "error",
        autoHideDuration: 3000,
      });
    } finally {
      setIsConfirmingCreate(false);
    }
  };

  const handleCancelCreate = () => {
    setShowCreateConfirmation(false);
    setPendingFormData(null);
  };

  const onSubmit = async (data) => {
    const formattedData = {
      ...data,
      effective_date: data.effective_date
        ? dayjs(data.effective_date).format("YYYY-MM-DD")
        : null,
      birth_date: data.birth_date
        ? dayjs(data.birth_date).format("YYYY-MM-DD")
        : null,
    };

    setPendingFormData(formattedData);

    if (currentMode === "create") {
      setShowCreateConfirmation(true);
    } else if (currentMode === "edit") {
      setShowUpdateConfirmation(true);
    }
  };

  const isProcessing =
    isLoading ||
    isCreating ||
    isUpdating ||
    isConfirmingResubmit ||
    isConfirmingUpdate ||
    isConfirmingCreate;
  const formKey = `mdada-form-${open ? "open" : "closed"}-${currentMode}`;
  const isReadOnly = currentMode === "view";
  const isViewMode = currentMode === "view";
  const isEditMode = currentMode === "edit";

  const getTitle = () => {
    if (currentMode === "create") return "CREATE MDA (DA)";
    if (currentMode === "edit") return "EDIT MDA (DA)";
    return "VIEW MDA (DA)";
  };

  const showResubmitButton = () => {
    const status = selectedEntry?.result?.status || selectedEntry?.status;
    return isViewMode && status !== "APPROVED" && status !== "CANCELLED";
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
                {getTitle()}
              </Typography>
              {isViewMode && (
                <Tooltip title="EDIT MDA" arrow placement="top">
                  <span>
                    <IconButton
                      onClick={() => handleModeChange("edit")}
                      disabled={!shouldEnableEditButton() || isProcessing}
                      size="small"
                      sx={editIconButtonStyles}>
                      <EditIcon
                        sx={editIconStyles(
                          !shouldEnableEditButton() || isProcessing
                        )}
                      />
                    </IconButton>
                  </span>
                </Tooltip>
              )}
              {isEditMode && originalMode === "view" && (
                <Tooltip title="CANCEL EDIT">
                  <span>
                    <IconButton
                      onClick={handleCancelEdit}
                      disabled={isProcessing}
                      size="small"
                      sx={cancelEditIconButtonStyles}>
                      <EditOffIcon sx={editOffIconStyles} />
                    </IconButton>
                  </span>
                </Tooltip>
              )}
            </Box>
            <IconButton onClick={handleClose} sx={closeIconButtonStyles}>
              <CloseIcon sx={closeIconStyles} />
            </IconButton>
          </DialogTitle>

          <form onSubmit={handleSubmit(onSubmit)} key={formKey}>
            <DialogContent sx={dialogContentStyles}>
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
                    Failed to load data. Please try again.
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

            <DialogActions sx={dialogActionsStyles}>
              {showResubmitButton() && !showLoadingState && (
                <Button
                  onClick={handleResubmitClick}
                  variant="contained"
                  disabled={!shouldEnableResubmitButton() || isProcessing}
                  startIcon={
                    isProcessing ? <CircularProgress size={16} /> : <SendIcon />
                  }
                  sx={resubmitButtonStyles(
                    shouldEnableResubmitButton(),
                    isProcessing
                  )}>
                  {isProcessing ? "Resubmitting..." : "Resubmit"}
                </Button>
              )}

              {!isReadOnly && !showLoadingState && (
                <Button
                  type="submit"
                  variant="contained"
                  disabled={isProcessing}
                  startIcon={
                    isProcessing ? (
                      <CircularProgress size={16} />
                    ) : currentMode === "create" ? (
                      <AddIcon />
                    ) : (
                      <EditIcon />
                    )
                  }
                  sx={saveButtonStyles}>
                  {isProcessing
                    ? "Saving..."
                    : currentMode === "create"
                    ? "Create"
                    : "Update"}
                </Button>
              )}
            </DialogActions>
          </form>
        </Dialog>

        <Dialog
          open={showResubmitConfirmation}
          onClose={handleCancelResubmit}
          maxWidth="xs"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 3,
              padding: 2,
              boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
              textAlign: "center",
            },
          }}>
          <DialogTitle sx={{ padding: 0, marginBottom: 2 }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                marginBottom: 2,
              }}>
              <Box
                sx={{
                  width: 60,
                  height: 60,
                  borderRadius: "50%",
                  backgroundColor: "#ff4400",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}>
                <Typography
                  sx={{
                    color: "white",
                    fontSize: "30px",
                    fontWeight: "normal",
                  }}>
                  ?
                </Typography>
              </Box>
            </Box>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 600,
                color: "rgb(25, 45, 84)",
                marginBottom: 0,
              }}>
              Confirmation
            </Typography>
          </DialogTitle>
          <DialogContent sx={{ padding: 0, textAlign: "center" }}>
            <Typography
              variant="body1"
              sx={{
                marginBottom: 2,
                fontSize: "16px",
                color: "#333",
                fontWeight: 400,
              }}>
              Are you sure you want to <strong>Resubmit</strong> this MDA Form?
            </Typography>
            {selectedEntry && (
              <Typography
                variant="body2"
                sx={{
                  fontSize: "14px",
                  color: "#666",
                  fontWeight: 500,
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}>
                {selectedEntry?.result?.reference_number ||
                  selectedEntry?.reference_number}
              </Typography>
            )}
          </DialogContent>
          <DialogActions
            sx={{
              justifyContent: "center",
              padding: 0,
              marginTop: 3,
              gap: 2,
            }}>
            <Button
              onClick={handleCancelResubmit}
              variant="outlined"
              sx={{
                textTransform: "uppercase",
                fontWeight: 600,
                borderColor: "#f44336",
                color: "#f44336",
                paddingX: 3,
                paddingY: 1,
                borderRadius: 2,
                "&:hover": {
                  borderColor: "#d32f2f",
                  backgroundColor: "rgba(244, 67, 54, 0.04)",
                },
              }}
              disabled={isConfirmingResubmit}>
              CANCEL
            </Button>
            <Button
              onClick={handleConfirmResubmit}
              variant="contained"
              sx={{
                textTransform: "uppercase",
                fontWeight: 600,
                backgroundColor: "#4caf50",
                paddingX: 3,
                paddingY: 1,
                borderRadius: 2,
                "&:hover": {
                  backgroundColor: "#388e3c",
                },
              }}
              disabled={isConfirmingResubmit}>
              {isConfirmingResubmit ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                "CONFIRM"
              )}
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog
          open={showUpdateConfirmation}
          onClose={handleCancelUpdate}
          maxWidth="xs"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 3,
              padding: 2,
              boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
              textAlign: "center",
            },
          }}>
          <DialogTitle sx={{ padding: 0, marginBottom: 2 }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                marginBottom: 2,
              }}>
              <Box
                sx={{
                  width: 60,
                  height: 60,
                  borderRadius: "50%",
                  backgroundColor: "#ff4400",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}>
                <Typography
                  sx={{
                    color: "white",
                    fontSize: "30px",
                    fontWeight: "normal",
                  }}>
                  ?
                </Typography>
              </Box>
            </Box>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 600,
                color: "rgb(25, 45, 84)",
                marginBottom: 0,
              }}>
              Confirmation
            </Typography>
          </DialogTitle>
          <DialogContent sx={{ padding: 0, textAlign: "center" }}>
            <Typography
              variant="body1"
              sx={{
                marginBottom: 2,
                fontSize: "16px",
                color: "#333",
                fontWeight: 400,
              }}>
              Are you sure you want to <strong>Update</strong> this MDA Form?
            </Typography>
            {selectedEntry && (
              <Typography
                variant="body2"
                sx={{
                  fontSize: "14px",
                  color: "#666",
                  fontWeight: 500,
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}>
                {selectedEntry?.result?.reference_number ||
                  selectedEntry?.reference_number}
              </Typography>
            )}
          </DialogContent>
          <DialogActions
            sx={{
              justifyContent: "center",
              padding: 0,
              marginTop: 3,
              gap: 2,
            }}>
            <Button
              onClick={handleCancelUpdate}
              variant="outlined"
              sx={{
                textTransform: "uppercase",
                fontWeight: 600,
                borderColor: "#f44336",
                color: "#f44336",
                paddingX: 3,
                paddingY: 1,
                borderRadius: 2,
                "&:hover": {
                  borderColor: "#d32f2f",
                  backgroundColor: "rgba(244, 67, 54, 0.04)",
                },
              }}
              disabled={isConfirmingUpdate}>
              CANCEL
            </Button>
            <Button
              onClick={handleConfirmUpdate}
              variant="contained"
              sx={{
                textTransform: "uppercase",
                fontWeight: 600,
                backgroundColor: "#4caf50",
                paddingX: 3,
                paddingY: 1,
                borderRadius: 2,
                "&:hover": {
                  backgroundColor: "#388e3c",
                },
              }}
              disabled={isConfirmingUpdate}>
              {isConfirmingUpdate ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                "CONFIRM"
              )}
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog
          open={showCreateConfirmation}
          onClose={handleCancelCreate}
          maxWidth="xs"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 3,
              padding: 2,
              boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
              textAlign: "center",
            },
          }}>
          <DialogTitle sx={{ padding: 0, marginBottom: 2 }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                marginBottom: 2,
              }}>
              <Box
                sx={{
                  width: 60,
                  height: 60,
                  borderRadius: "50%",
                  backgroundColor: "#ff4400",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}>
                <Typography
                  sx={{
                    color: "white",
                    fontSize: "30px",
                    fontWeight: "normal",
                  }}>
                  ?
                </Typography>
              </Box>
            </Box>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 600,
                color: "rgb(25, 45, 84)",
                marginBottom: 0,
              }}>
              Confirmation
            </Typography>
          </DialogTitle>
          <DialogContent sx={{ padding: 0, textAlign: "center" }}>
            <Typography
              variant="body1"
              sx={{
                marginBottom: 2,
                fontSize: "16px",
                color: "#333",
                fontWeight: 400,
              }}>
              Are you sure you want to <strong>Create</strong> this MDA Form?
            </Typography>
          </DialogContent>
          <DialogActions
            sx={{
              justifyContent: "center",
              padding: 0,
              marginTop: 3,
              gap: 2,
            }}>
            <Button
              onClick={handleCancelCreate}
              variant="outlined"
              sx={{
                textTransform: "uppercase",
                fontWeight: 600,
                borderColor: "#f44336",
                color: "#f44336",
                paddingX: 3,
                paddingY: 1,
                borderRadius: 2,
                "&:hover": {
                  borderColor: "#d32f2f",
                  backgroundColor: "rgba(244, 67, 54, 0.04)",
                },
              }}
              disabled={isConfirmingCreate}>
              CANCEL
            </Button>
            <Button
              onClick={handleConfirmCreate}
              variant="contained"
              sx={{
                textTransform: "uppercase",
                fontWeight: 600,
                backgroundColor: "#4caf50",
                paddingX: 3,
                paddingY: 1,
                borderRadius: 2,
                "&:hover": {
                  backgroundColor: "#388e3c",
                },
              }}
              disabled={isConfirmingCreate}>
              {isConfirmingCreate ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                "CONFIRM"
              )}
            </Button>
          </DialogActions>
        </Dialog>
      </FormProvider>
    </LocalizationProvider>
  );
};

export default MDADAModal;
