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
import EvaluationRecommendationModalFields from "./EvaluationRecommendationModalFields";
import {
  getCreateModeInitialValues,
  getViewEditModeFormData,
} from "./EvaluationRecommendationGetValues";
import * as styles from "../DAForm/DAFormModal.styles";

const EvaluationRecommendationModal = ({
  open = false,
  onClose,
  onSave,
  onResubmit,
  onSubmit,
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

  const shouldEnableSubmitButton = () => {
    const status = selectedEntry?.status || selectedEntry?.result?.status;
    const normalizedStatus = normalizeStatus(status);

    const disabledStatuses = ["COMPLETED", "APPROVED", "CANCELLED"];

    if (disabledStatuses.includes(normalizedStatus)) return false;

    return true;
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

  const handleFormSubmit = async (data) => {
    const status = selectedEntry?.status || selectedEntry?.result?.status;
    const normalizedStatus = normalizeStatus(status);

    if (currentMode === "create") {
      if (!data.employee_id) {
        alert("Please select an Employee");
        return;
      }
      if (!data.to_position_id) {
        alert("Please select a TO Position");
        return;
      }
      if (!data.objectives || data.objectives.length === 0) {
        alert("Please add at least one objective");
        return;
      }
      const totalDistribution = data.objectives.reduce(
        (sum, obj) => sum + Number(obj.distribution_percentage || 0),
        0
      );
      if (totalDistribution !== 100) {
        alert(
          `Total distribution percentage must equal 100%. Current total: ${totalDistribution}%`
        );
        return;
      }
    }

    let finalRecommendation = null;
    if (data.for_permanent_appointment) {
      finalRecommendation = "FOR PERMANENT";
    } else if (data.not_for_permanent_appointment) {
      finalRecommendation = "NOT FOR PERMANENT";
    } else if (data.for_extension) {
      finalRecommendation = "FOR EXTENSION";
    }

    if (
      normalizedStatus === "FOR RECOMMENDATION" ||
      normalizedStatus === "PENDING RECOMMENDATION APPROVAL"
    ) {
      if (!finalRecommendation) {
        alert("Please select a recommendation option");
        return;
      }

      const invalidObjectives = [];
      data.objectives.forEach((obj, index) => {
        const actualPerf = obj.actual_performance;
        if (
          actualPerf === null ||
          actualPerf === undefined ||
          actualPerf === "" ||
          isNaN(Number(actualPerf))
        ) {
          invalidObjectives.push(index + 1);
        }
      });

      if (invalidObjectives.length > 0) {
        alert(
          `Please fill in the Actual Performance for objective(s) #${invalidObjectives.join(
            ", "
          )} before submitting.`
        );
        return;
      }

      const objectives = data.objectives.map((obj) => ({
        id: obj.id,
        actual_performance: Number(obj.actual_performance),
        remarks: obj.remarks || "",
      }));

      const formattedData = {
        final_recommendation: finalRecommendation,
        objectives: objectives,
      };

      if (data.for_extension && data.extension_end_date) {
        formattedData.extension_end_date = dayjs(
          data.extension_end_date
        ).format("YYYY-MM-DD");
      }

      console.log("=== SUBMITTING TO API ===");
      console.log("Formatted Data:", JSON.stringify(formattedData, null, 2));

      if (normalizedStatus === "FOR RECOMMENDATION" && onSubmit) {
        const entryId =
          editingEntryId ||
          selectedEntry?.id ||
          selectedEntry?.result?.id ||
          null;
        await onSubmit(formattedData, entryId);
      } else if (
        normalizedStatus === "PENDING RECOMMENDATION APPROVAL" &&
        onSave
      ) {
        const entryId =
          editingEntryId ||
          selectedEntry?.id ||
          selectedEntry?.result?.id ||
          null;
        await onSave(formattedData, currentMode, entryId);
      }
      return;
    }

    const formattedData = {
      form_id: 8,
      employee_id: data.employee_id,
      from_position_id: data.from_position_id,
      to_position_id: data.to_position_id,
      start_date: data.start_date
        ? dayjs(data.start_date).format("YYYY-MM-DD")
        : null,
      end_date: data.end_date
        ? dayjs(data.end_date).format("YYYY-MM-DD")
        : null,
      objective: data.objective,
      objectives: data.objectives.map((obj) => ({
        source_kpi_id: obj.source_kpi_id,
        objective_id: obj.objective_id,
        objective_name: obj.objective_name,
        distribution_percentage: Number(obj.distribution_percentage),
        deliverable: obj.deliverable,
        target_percentage: Number(obj.target_percentage),
        actual_performance: obj.actual_performance || null,
        remarks: obj.remarks || "",
      })),
      final_recommendation: finalRecommendation,
      extension_end_date:
        data.extension_end_date && data.for_extension
          ? dayjs(data.extension_end_date).format("YYYY-MM-DD")
          : null,
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
      create: "CREATE EVALUATION RECOMMENDATION",
      view: "VIEW EVALUATION RECOMMENDATION",
      edit: "EDIT EVALUATION RECOMMENDATION",
    };
    return titles[currentMode] || "Evaluation Recommendation";
  };

  const showResubmitButton = () => {
    const status = selectedEntry?.status || selectedEntry?.result?.status;
    const normalizedStatus = normalizeStatus(status);

    const disabledStatuses = [
      "COMPLETED",
      "APPROVED",
      "CANCELLED",
      "FOR RECOMMENDATION",
      "PENDING RECOMMENDATION APPROVAL",
    ];

    return (
      currentMode === "view" && !disabledStatuses.includes(normalizedStatus)
    );
  };

  const isReadOnly = currentMode === "view";
  const isCreate = currentMode === "create";
  const isViewMode = currentMode === "view";
  const isEditMode = currentMode === "edit";
  const isProcessing = isLoading || isUpdating;

  const getButtonLabel = () => {
    const status = selectedEntry?.status || selectedEntry?.result?.status;
    const normalizedStatus = normalizeStatus(status);

    if (currentMode === "create") {
      return isProcessing ? "Creating..." : "Create";
    }

    if (normalizedStatus === "FOR RECOMMENDATION") {
      return isProcessing ? "Submitting..." : "Submit";
    }

    if (normalizedStatus === "PENDING RECOMMENDATION APPROVAL") {
      return isProcessing ? "Updating..." : "Update";
    }

    return isProcessing ? "Updating..." : "Update";
  };

  const formKey = `evaluation-recommendation-${
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
              <Tooltip
                title="EDIT EVALUATION RECOMMENDATION"
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
              <EvaluationRecommendationModalFields
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
  );
};

export default EvaluationRecommendationModal;
