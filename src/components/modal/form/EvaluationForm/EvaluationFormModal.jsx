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
} from "@mui/icons-material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import EvaluationFormModalFields from "./EvaluationFormModalFields";
import {
  getCreateModeInitialValues,
  getViewEditModeFormData,
} from "./EvaluationFieldsGetValues";
import * as styles from "./EvaluationFormModal.styles";

const EvaluationFormModal = ({
  open = false,
  onClose,
  onSave,
  onResubmit,
  selectedEntry = null,
  isLoading = false,
  mode = "create",
  submissionId = null,
}) => {
  const { reset, handleSubmit, watch } = useFormContext();
  const [currentMode, setCurrentMode] = useState(mode);
  const [originalMode, setOriginalMode] = useState(mode);
  const [hasInitialized, setHasInitialized] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [editingEntryId, setEditingEntryId] = useState(null);
  const [isFormReady, setIsFormReady] = useState(false);

  const prevOpenRef = useRef(open);
  const prevModeRef = useRef(mode);

  const formValues = watch();

  useEffect(() => {
    if (open && selectedEntry) {
      setEditingEntryId(selectedEntry.id || selectedEntry.result?.id);
    }
  }, [open, selectedEntry]);

  const shouldEnableEditButton = () => {
    const status = selectedEntry?.status || selectedEntry?.result?.status;
    if (status === "APPROVED" || status === "CANCELLED") return false;
    const actions =
      selectedEntry?.actions ||
      selectedEntry?.result?.actions ||
      selectedEntry?.result?.submittable?.actions;
    return actions?.can_update === true;
  };

  const shouldEnableResubmitButton = () => {
    const status = selectedEntry?.status || selectedEntry?.result?.status;
    if (status === "APPROVED" || status === "CANCELLED") return false;
    const actions =
      selectedEntry?.actions ||
      selectedEntry?.result?.actions ||
      selectedEntry?.result?.submittable?.actions;
    return actions?.can_resubmit === true;
  };

  useEffect(() => {
    if (!open) {
      setHasInitialized(false);
      setIsFormReady(false);
      prevOpenRef.current = false;
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
  }, [open, mode, hasInitialized, selectedEntry, reset]);

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
    if (selectedEntry) {
      const formData = getViewEditModeFormData(selectedEntry);
      reset(formData);
    }
  };

  const onSubmit = async (data) => {
    if (currentMode === "create") {
      if (!data.employee_id) {
        alert("Please select an Employee");
        return;
      }
      if (!data.probation_start_date) {
        alert("Probation Start Date is required");
        return;
      }
      if (!data.probation_end_date) {
        alert("Probation End Date is required");
        return;
      }
      if (!data.objectives || data.objectives.length === 0) {
        alert("Performance Objectives are required");
        return;
      }
    }

    const formattedData = {
      form_id: 8,
      employee_id: data.employee_id,
      evaluation_date: data.evaluation_date
        ? dayjs(data.evaluation_date).format("YYYY-MM-DD")
        : null,
      evaluator_id: data.evaluator_id,
      performance_rating: data.performance_rating,
      comments: data.comments,
      recommendation: data.recommendation,
      probation_start_date: data.probation_start_date
        ? dayjs(data.probation_start_date).format("YYYY-MM-DD")
        : null,
      probation_end_date: data.probation_end_date
        ? dayjs(data.probation_end_date).format("YYYY-MM-DD")
        : null,
      kpis: data.objectives || [],
    };

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
  };

  const handleResubmitClick = async () => {
    if (!editingEntryId) {
      const fallbackId = selectedEntry?.id || selectedEntry?.result?.id;
      if (!fallbackId) {
        alert("No submission ID found. Please close and reopen the modal.");
        return;
      }
      setEditingEntryId(fallbackId);
    }

    if (!onResubmit || typeof onResubmit !== "function") {
      alert("Resubmit function not available. Please refresh the page.");
      return;
    }

    const idToUse =
      editingEntryId || selectedEntry?.id || selectedEntry?.result?.id;
    await onResubmit(idToUse);
  };

  const handleClose = () => {
    reset();
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
      create: "CREATE PROBATIONARY EVALUATION",
      view: "VIEW PROBATIONARY EVALUATION",
      edit: "EDIT PROBATIONARY EVALUATION",
    };
    return titles[currentMode] || "Probationary Evaluation";
  };

  const showResubmitButton = () => {
    const status = selectedEntry?.status || selectedEntry?.result?.status;
    return currentMode === "view" && status === "AWAITING RESUBMISSION";
  };

  const isReadOnly = currentMode === "view";
  const isCreate = currentMode === "create";
  const isViewMode = currentMode === "view";
  const isEditMode = currentMode === "edit";
  const isProcessing = isLoading || isUpdating;

  const formKey = `evaluation-form-${
    open ? "open" : "closed"
  }-${mode}-${hasInitialized}`;

  return (
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
            {isViewMode && (
              <Tooltip title="EDIT EVALUATION" arrow placement="top">
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

        <form onSubmit={handleSubmit(onSubmit)} key={formKey}>
          <DialogContent sx={styles.dialogContentStyles}>
            {isFormReady ? (
              <EvaluationFormModalFields
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
                    <EditIcon />
                  )
                }
                sx={styles.saveButtonStyles}>
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
    </LocalizationProvider>
  );
};

export default EvaluationFormModal;
