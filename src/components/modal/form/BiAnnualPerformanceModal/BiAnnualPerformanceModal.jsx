import React, { useEffect, useState, useRef } from "react";
import { useFormContext } from "react-hook-form";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  IconButton,
  Box,
  CircularProgress,
  Tooltip,
} from "@mui/material";
import {
  Close as CloseIcon,
  Edit as EditIcon,
  Add as AddIcon,
  Description as DescriptionIcon,
  Send as SendIcon,
  EditOff as EditOffIcon,
  Print as PrintIcon,
} from "@mui/icons-material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import BiAnnualPerformanceModalFields from "./BiAnnualPerformanceModalFields";
import {
  getCreateModeInitialValues,
  getViewEditModeFormData,
  formatFormDataForSubmission,
} from "./BiAnnualPerformanceGetValues";
import { biAnnualPerformanceSchema } from "./BiAnnualPerformanceSchema";
import * as styles from "../DAForm/DAFormModal.styles";
import BiAnnualPrintingDialog from "./BiAnnualPrintingDialog";
import {
  useLazyPrintPerformanceEvaluationQuery,
  useLazyGetPerformanceEvaluationPrefillQuery,
} from "../../../../features/api/forms/biAnnualPerformanceApi";

const BiAnnualPerformanceModal = ({
  open = false,
  onClose,
  onSave,
  onResubmit,
  selectedEntry = null,
  isLoading = false,
  mode = "view",
  submissionId = null,
  onPrint,
  approvalStatus = null,
}) => {
  const { reset, handleSubmit, watch, setError, clearErrors } =
    useFormContext();
  const [currentMode, setCurrentMode] = useState(mode);
  const [originalMode, setOriginalMode] = useState(mode);
  const [hasInitialized, setHasInitialized] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [editingEntryId, setEditingEntryId] = useState(null);
  const [isFormReady, setIsFormReady] = useState(false);
  const [showPrintDialog, setShowPrintDialog] = useState(false);
  const [printData, setPrintData] = useState(null);

  const [fetchPrintData, { isLoading: isPrintDataLoading }] =
    useLazyPrintPerformanceEvaluationQuery();
  const [fetchPrefillData] = useLazyGetPerformanceEvaluationPrefillQuery();

  const prevOpenRef = useRef(open);
  const prevModeRef = useRef(mode);

  const formValues = watch();

  useEffect(() => {
    if (open && selectedEntry) {
      setEditingEntryId(selectedEntry.id || selectedEntry.result?.id);
    }
  }, [open, selectedEntry]);

  const normalizeStatus = (status) => {
    if (!status) return "";
    return status.toUpperCase().replace(/[-_]/g, " ").trim();
  };

  const shouldEnableEditButton = () => {
    const status = selectedEntry?.status || selectedEntry?.result?.status;
    const normalizedStatus = normalizeStatus(status);
    const disabledStatuses = ["COMPLETED", "APPROVED", "CANCELLED"];
    if (disabledStatuses.includes(normalizedStatus)) return false;
    return true;
  };

  const shouldEnableResubmitButton = () => {
    const status = selectedEntry?.status || selectedEntry?.result?.status;
    const normalizedStatus = normalizeStatus(status);
    const disabledStatuses = ["COMPLETED", "APPROVED", "CANCELLED"];
    if (disabledStatuses.includes(normalizedStatus)) return false;
    return true;
  };

  const isApprovedStatus = () => {
    const status = normalizeStatus(approvalStatus);
    return status === "APPROVED";
  };

  useEffect(() => {
    if (!open) {
      setHasInitialized(false);
      setIsFormReady(false);
      prevOpenRef.current = false;
      clearErrors();
      return;
    }

    if (hasInitialized && prevOpenRef.current === open) return;

    const initializeForm = async () => {
      if (mode === "create") {
        setCurrentMode(mode);
        setOriginalMode(mode);
        const initialValues = getCreateModeInitialValues();
        reset(initialValues);
        setHasInitialized(true);
        setIsFormReady(true);
        prevOpenRef.current = true;
        prevModeRef.current = mode;
        return;
      }

      if ((mode === "view" || mode === "edit") && selectedEntry) {
        setCurrentMode(mode);
        setOriginalMode(mode);

        // PRE-LOAD prefill data before setting form data
        const submittable =
          selectedEntry.submittable || selectedEntry.result?.submittable;
        if (submittable?.employee_id) {
          try {
            await fetchPrefillData({ employee_id: submittable.employee_id });
          } catch (error) {
            console.error("Error preloading prefill data:", error);
          }
        }

        const formData = getViewEditModeFormData(selectedEntry);
        reset(formData);
        setTimeout(() => {
          setHasInitialized(true);
          setIsFormReady(true);
          prevOpenRef.current = true;
          prevModeRef.current = mode;
        }, 50);
      }
    };

    initializeForm();
  }, [
    open,
    mode,
    hasInitialized,
    selectedEntry,
    reset,
    clearErrors,
    fetchPrefillData,
  ]);

  useEffect(() => {
    if (
      open &&
      currentMode === "edit" &&
      originalMode === "view" &&
      selectedEntry &&
      prevModeRef.current !== currentMode
    ) {
      const formData = getViewEditModeFormData(selectedEntry);
      reset(formData);
      prevModeRef.current = currentMode;
    }
  }, [currentMode, open, originalMode, selectedEntry, reset]);

  const handleCancelEdit = () => {
    setCurrentMode(originalMode);
    clearErrors();
    if (selectedEntry) {
      const formData = getViewEditModeFormData(selectedEntry);
      reset(formData);
    }
  };

  const handleFormSubmit = async (data) => {
    try {
      clearErrors();
      await biAnnualPerformanceSchema.validate(data, { abortEarly: false });

      const formattedData = formatFormDataForSubmission(data);

      if (onSave) {
        const entryId =
          currentMode === "edit"
            ? editingEntryId ||
              selectedEntry?.id ||
              selectedEntry?.result?.id ||
              null
            : null;
        await onSave(formattedData, currentMode, entryId);
      }
    } catch (error) {
      if (error.name === "ValidationError") {
        error.inner.forEach((err) => {
          const path = err.path;
          const message = err.message;

          if (path.includes("kpis[")) {
            const match = path.match(/kpis\[(\d+)\]\.(.+)/);
            if (match) {
              const index = match[1];
              const field = match[2];
              setError(`kpis.${index}.${field}`, {
                type: "manual",
                message: message,
              });
            }
          } else if (path === "kpis") {
            setError("kpis", {
              type: "manual",
              message: message,
            });
          } else if (path.includes("competency_assessment.answers[")) {
            const match = path.match(
              /competency_assessment\.answers\[(\d+)\]\.(.+)/
            );
            if (match) {
              const index = match[1];
              const field = match[2];
              setError(`competency_assessment.answers.${index}.${field}`, {
                type: "manual",
                message: message,
              });
            }
          } else if (
            path === "competency_assessment.answers" ||
            path === "competency_assessment"
          ) {
            setError("competency_assessment.answers", {
              type: "manual",
              message: message,
            });
          } else {
            setError(path, {
              type: "manual",
              message: message,
            });
          }
        });

        const firstErrorElement = document.querySelector(
          '[aria-invalid="true"]'
        );
        if (firstErrorElement) {
          firstErrorElement.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        }
      } else {
        console.error("Form submission error:", error);
        setError("root.serverError", {
          type: "manual",
          message: "An error occurred while submitting the form.",
        });
      }
    }
  };

  const handleResubmitClick = async () => {
    if (!editingEntryId) {
      const fallbackId = selectedEntry?.id || selectedEntry?.result?.id;
      if (!fallbackId) {
        setError("root.resubmit", {
          type: "manual",
          message: "No submission ID found. Please close and reopen the modal.",
        });
        return;
      }
      setEditingEntryId(fallbackId);
    }

    if (!onResubmit || typeof onResubmit !== "function") {
      setError("root.resubmit", {
        type: "manual",
        message: "Resubmit function not available. Please refresh the page.",
      });
      return;
    }

    const idToUse =
      editingEntryId || selectedEntry?.id || selectedEntry?.result?.id;
    await onResubmit(idToUse);
  };

  const handlePrintClick = async () => {
    const evaluationId = selectedEntry?.id || selectedEntry?.result?.id;
    if (!evaluationId) {
      setError("root.print", {
        type: "manual",
        message: "No evaluation ID found.",
      });
      return;
    }

    try {
      const response = await fetchPrintData(evaluationId).unwrap();
      setPrintData(response);
      setShowPrintDialog(true);
    } catch (error) {
      console.error("Error fetching print data:", error);
      setError("root.print", {
        type: "manual",
        message: "Failed to fetch print data.",
      });
    }
  };

  const handleClosePrintDialog = () => {
    setShowPrintDialog(false);
    setPrintData(null);
  };

  const handleClose = () => {
    reset();
    clearErrors();
    setCurrentMode(mode);
    setOriginalMode(mode);
    setIsUpdating(false);
    setEditingEntryId(null);
    setHasInitialized(false);
    setIsFormReady(false);
    prevOpenRef.current = false;
    onClose();
  };

  const getModalTitle = () => {
    const titles = {
      create: "CREATE BI-ANNUAL PERFORMANCE EVALUATION",
      view: "VIEW BI-ANNUAL PERFORMANCE EVALUATION",
      edit: "EDIT BI-ANNUAL PERFORMANCE EVALUATION",
    };
    return titles[currentMode] || "Bi-Annual Performance Evaluation";
  };

  const showResubmitButton = () => {
    const status = selectedEntry?.status || selectedEntry?.result?.status;
    const normalizedStatus = normalizeStatus(status);
    return (
      currentMode === "view" && normalizedStatus === "AWAITING RESUBMISSION"
    );
  };

  const isReadOnly = currentMode === "view";
  const isCreate = currentMode === "create";
  const isViewMode = currentMode === "view";
  const isEditMode = currentMode === "edit";
  const isProcessing = isLoading || isUpdating;

  const getButtonLabel = () => {
    if (currentMode === "create") {
      return isProcessing ? "Creating..." : "Create";
    }
    return isProcessing ? "Updating..." : "Update";
  };

  const formKey = `bi-annual-performance-${
    open ? "open" : "closed"
  }-${mode}-${hasInitialized}`;

  return (
    <>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
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
                {getModalTitle()}
              </Typography>
              {isViewMode && !isApprovedStatus() && (
                <Tooltip
                  title="EDIT BI-ANNUAL PERFORMANCE EVALUATION"
                  arrow
                  placement="top">
                  <span>
                    <IconButton
                      onClick={() => setCurrentMode("edit")}
                      disabled={!shouldEnableEditButton() || isProcessing}
                      size="small"
                      sx={styles.editIconButtonStyles}>
                      <EditIcon
                        sx={styles.editIconStyles(
                          !shouldEnableEditButton() || isProcessing
                        )}
                      />
                    </IconButton>
                  </span>
                </Tooltip>
              )}
              {isViewMode && isApprovedStatus() && (
                <Tooltip
                  title="PRINT BI-ANNUAL PERFORMANCE EVALUATION"
                  arrow
                  placement="top">
                  <span>
                    <IconButton
                      onClick={handlePrintClick}
                      disabled={isProcessing || isPrintDataLoading}
                      size="small"
                      sx={styles.editIconButtonStyles}>
                      {isPrintDataLoading ? (
                        <CircularProgress size={20} />
                      ) : (
                        <PrintIcon sx={styles.editIconStyles(isProcessing)} />
                      )}
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
                      sx={styles.cancelEditIconButtonStyles}>
                      <EditOffIcon sx={styles.editOffIconStyles} />
                    </IconButton>
                  </span>
                </Tooltip>
              )}
            </Box>
            <IconButton onClick={handleClose} sx={styles.closeIconButtonStyles}>
              <CloseIcon sx={styles.closeIconStyles} />
            </IconButton>
          </DialogTitle>

          <form onSubmit={handleSubmit(handleFormSubmit)} key={formKey}>
            <DialogContent sx={styles.dialogContentStyles}>
              {isFormReady ? (
                <BiAnnualPerformanceModalFields
                  key={formKey}
                  isCreate={isCreate}
                  isReadOnly={isReadOnly}
                  submissionId={submissionId}
                  currentMode={currentMode}
                />
              ) : (
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    minHeight: "400px",
                  }}>
                  <CircularProgress />
                </Box>
              )}
            </DialogContent>

            <DialogActions sx={styles.dialogActionsStyles}>
              {showResubmitButton() && (
                <Button
                  onClick={handleResubmitClick}
                  variant="contained"
                  disabled={!shouldEnableResubmitButton() || isProcessing}
                  startIcon={
                    isProcessing ? <CircularProgress size={16} /> : <SendIcon />
                  }
                  sx={styles.resubmitButtonStyles(
                    shouldEnableResubmitButton(),
                    isProcessing
                  )}>
                  {isProcessing ? "Resubmitting..." : "Resubmit"}
                </Button>
              )}
              {!isReadOnly && (
                <Button
                  type="submit"
                  variant="contained"
                  disabled={isProcessing || !isFormReady}
                  startIcon={
                    isProcessing ? (
                      <CircularProgress size={16} />
                    ) : currentMode === "create" ? (
                      <AddIcon />
                    ) : (
                      <SendIcon />
                    )
                  }
                  sx={styles.saveButtonStyles}>
                  {getButtonLabel()}
                </Button>
              )}
            </DialogActions>
          </form>
        </Dialog>
      </LocalizationProvider>

      <Dialog
        open={showPrintDialog}
        onClose={handleClosePrintDialog}
        maxWidth="lg"
        fullWidth>
        <DialogContent sx={{ p: 0 }}>
          {isPrintDataLoading ? (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                minHeight: "400px",
              }}>
              <CircularProgress />
            </Box>
          ) : (
            printData && <BiAnnualPrintingDialog data={printData} />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default BiAnnualPerformanceModal;
