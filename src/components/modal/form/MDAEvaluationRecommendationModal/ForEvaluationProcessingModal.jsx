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
  Description as DescriptionIcon,
  CheckCircle as CheckCircleIcon,
  EditOff as EditOffIcon,
} from "@mui/icons-material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import ForEvaluationProcessingModalFields from "./ForEvaluationProcessingModalFields";
import * as styles from "../DAForm/DAFormModal.styles";

const ForEvaluationProcessingModal = ({
  open = false,
  onClose,
  submissionId = null,
  mode = "view",
  selectedEntry = null,
  onModeChange,
  isLoading = false,
  onCreateMDA,
  onRefreshDetails,
}) => {
  const { reset } = useFormContext();
  const [currentMode, setCurrentMode] = useState(mode);
  const [originalMode, setOriginalMode] = useState(mode);
  const [hasInitialized, setHasInitialized] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [editingEntryId, setEditingEntryId] = useState(null);
  const [isFormReady, setIsFormReady] = useState(false);

  const prevOpenRef = useRef(open);
  const prevModeRef = useRef(mode);
  const prevEntryIdRef = useRef(null);

  useEffect(() => {
    if (open && selectedEntry) {
      setEditingEntryId(selectedEntry.id || selectedEntry.result?.id);
    }
  }, [open, selectedEntry, onCreateMDA]);

  useEffect(() => {
    if (open && submissionId && onRefreshDetails) {
      onRefreshDetails();
    }
  }, [open, submissionId, onRefreshDetails]);

  const normalizeStatus = (status) => {
    if (!status) return "";
    return status.toUpperCase().replace(/[-_]/g, " ").trim();
  };

  const shouldEnableEditButton = () => {
    const status = selectedEntry?.status || selectedEntry?.result?.status;
    const normalizedStatus = normalizeStatus(status);

    const disabledStatuses = [
      "COMPLETED",
      "APPROVED",
      "CANCELLED",
      "PENDING FINAL MDA",
      "PENDING MDA CREATION",
    ];

    if (disabledStatuses.includes(normalizedStatus)) return false;

    return true;
  };

  const getStatus = () => {
    return selectedEntry?.status || selectedEntry?.result?.status || "";
  };

  const shouldShowCreateMDAButton = () => {
    if (!selectedEntry) {
      return false;
    }

    if (!onCreateMDA) {
      return false;
    }

    const status = getStatus();
    const normalizedStatus = normalizeStatus(status);

    const shouldShow =
      normalizedStatus === "PENDING FINAL MDA" ||
      normalizedStatus === "PENDING MDA CREATION";

    return shouldShow;
  };

  useEffect(() => {
    if (!open) {
      setHasInitialized(false);
      setIsFormReady(false);
      prevOpenRef.current = false;
      prevEntryIdRef.current = null;
      return;
    }

    if (!selectedEntry) {
      setHasInitialized(false);
      setIsFormReady(false);
      return;
    }

    const currentEntryId = selectedEntry.id || selectedEntry.result?.id;

    if (prevEntryIdRef.current !== currentEntryId) {
      setHasInitialized(false);
      setIsFormReady(false);
      prevEntryIdRef.current = currentEntryId;
    }

    if (
      hasInitialized &&
      prevOpenRef.current === open &&
      prevModeRef.current === mode
    ) {
      return;
    }

    const initializeForm = async () => {
      setCurrentMode(mode);
      setOriginalMode(mode);
      reset({});
      setTimeout(() => {
        setHasInitialized(true);
        setIsFormReady(true);
        prevOpenRef.current = true;
        prevModeRef.current = mode;
      }, 100);
    };

    initializeForm();
  }, [open, mode, selectedEntry, reset, hasInitialized]);

  const handleCancelEdit = () => {
    setCurrentMode(originalMode);
  };

  const handleCreateMDA = async () => {
    if (onCreateMDA && selectedEntry) {
      setIsUpdating(true);
      try {
        const evaluationSubmissionId =
          selectedEntry.submission_id ||
          selectedEntry.result?.submission_id ||
          selectedEntry.id;
        await onCreateMDA({ ...selectedEntry, id: evaluationSubmissionId });
        handleClose();
      } finally {
        setIsUpdating(false);
      }
    }
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
      view: "VIEW EVALUATION SUBMISSION",
      edit: "EDIT EVALUATION SUBMISSION",
    };
    return titles[currentMode] || "EVALUATION SUBMISSION";
  };

  const submissionData = selectedEntry;
  const isReadOnly = currentMode === "view";
  const isViewMode = currentMode === "view";
  const isEditMode = currentMode === "edit";
  const isProcessing = isLoading || isUpdating;

  const formKey = `evaluation-processing-${
    open ? "open" : "closed"
  }-${mode}-${hasInitialized}`;

  const showCreateButton = shouldShowCreateMDAButton();

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
              <Tooltip title="EDIT EVALUATION SUBMISSION" arrow placement="top">
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

        <DialogContent sx={styles.dialogContentStyles}>
          {isLoading || !submissionData ? (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                minHeight: "400px",
              }}>
              <CircularProgress />
            </Box>
          ) : isFormReady ? (
            <ForEvaluationProcessingModalFields
              key={formKey}
              isReadOnly={isReadOnly}
              submissionData={submissionData}
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

        <DialogActions
          sx={{
            ...styles.dialogActionsStyles,
            position: "sticky",
            bottom: 0,
            backgroundColor: "white",
            zIndex: 1300,
            borderTop: "1px solid #e0e0e0",
            padding: "16px 24px",
            minHeight: "70px",
          }}>
          <Box
            sx={{
              display: "flex",
              gap: 2,
              width: "100%",
              justifyContent: "flex-end",
            }}>
            {showCreateButton && (
              <Button
                onClick={handleCreateMDA}
                variant="contained"
                disabled={isProcessing}
                startIcon={
                  isProcessing ? (
                    <CircularProgress size={16} />
                  ) : (
                    <CheckCircleIcon />
                  )
                }
                sx={styles.saveButtonStyles}>
                {isProcessing ? "Creating..." : "Create MDA"}
              </Button>
            )}
          </Box>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
};

export default ForEvaluationProcessingModal;
