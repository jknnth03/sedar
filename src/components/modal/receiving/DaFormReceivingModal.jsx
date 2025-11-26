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
  PlayArrow as PlayArrowIcon,
  EditOff as EditOffIcon,
} from "@mui/icons-material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import { useStartDaSubmissionMutation } from "../../../features/api/receiving/daFormReceivingApi";
import DaFormReceivingModalFields from "./DaFormReceivingModalFields";
import { getViewEditModeFormData } from "./DaFormGetValues";
import * as styles from "../form/DAForm/DAFormModal.styles";

const DaFormReceivingModal = ({
  open = false,
  onClose,
  selectedEntry = null,
  isLoading = false,
  mode = "view",
  submissionId = null,
  onModeChange,
  onRefreshDetails,
  isAssessmentMode = false,
  isCompletedMode = false,
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

  const [startDaSubmission, { isLoading: isStarting }] =
    useStartDaSubmissionMutation();

  const formValues = watch();

  useEffect(() => {
    if (open && selectedEntry) {
      setEditingEntryId(selectedEntry.id || selectedEntry.result?.id);
    }
  }, [open, selectedEntry]);

  useEffect(() => {
    if (mode !== currentMode) {
      setCurrentMode(mode);
    }
  }, [mode]);

  useEffect(() => {
    if (onModeChange) {
      onModeChange(currentMode);
    }
  }, [currentMode, onModeChange]);

  const shouldEnableEditButton = () => {
    const status = selectedEntry?.status || selectedEntry?.result?.status;
    if (
      status === "APPROVED" ||
      status === "CANCELLED" ||
      status === "COMPLETED"
    )
      return false;
    const actions =
      selectedEntry?.actions ||
      selectedEntry?.result?.actions ||
      selectedEntry?.result?.submittable?.actions;
    return actions?.can_update === true;
  };

  const shouldShowReceiveButton = () => {
    const status = selectedEntry?.status || selectedEntry?.result?.status;
    return (
      status === "READY FOR ASSESSMENT" &&
      currentMode === "view" &&
      !isAssessmentMode &&
      !isCompletedMode
    );
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
      if (
        (mode === "view" || mode === "edit" || mode === "assess") &&
        selectedEntry
      ) {
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

  const handleReceiveClick = async () => {
    const idToUse =
      editingEntryId || selectedEntry?.id || selectedEntry?.result?.id;

    if (!idToUse) {
      alert("No submission ID found. Please close and reopen the modal.");
      return;
    }

    try {
      setIsUpdating(true);
      await startDaSubmission(idToUse).unwrap();

      if (onRefreshDetails) {
        onRefreshDetails();
      }

      handleClose();
    } catch (error) {
      console.error("Error starting DA submission:", error);
      alert("Failed to start submission. Please try again.");
    } finally {
      setIsUpdating(false);
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
      view: "VIEW DA FORM",
      edit: "EDIT DA FORM",
      assess: "ASSESS DA FORM",
    };
    return titles[currentMode] || "DA Form";
  };

  const isReadOnly = currentMode === "view" || isCompletedMode;
  const isViewMode = currentMode === "view";
  const isEditMode = currentMode === "edit";
  const isAssessMode = currentMode === "assess";
  const isProcessing = isLoading || isUpdating || isStarting;

  const formKey = `da-form-receiving-${
    open ? "open" : "closed"
  }-${mode}-${hasInitialized}`;

  const receiveButtonStyles = {
    minWidth: 140,
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    backgroundColor: isProcessing
      ? "rgba(33, 61, 112, 0.3)"
      : "rgb(33, 61, 112)",
    color: "white",
    borderRadius: "8px",
    padding: "12px 20px",
    height: "44px",
    boxShadow: isProcessing ? "none" : "0 2px 4px rgba(0,0,0,0.1)",
    "&:hover": {
      backgroundColor: isProcessing
        ? "rgba(33, 61, 112, 0.3)"
        : "rgb(25, 45, 84)",
    },
    "&:disabled": {
      backgroundColor: "rgba(33, 61, 112, 0.3)",
      color: "rgba(255, 255, 255, 0.5)",
    },
  };

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
            {isViewMode && !isCompletedMode && (
              <Tooltip title="EDIT DA" arrow placement="top">
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
          {isFormReady ? (
            <DaFormReceivingModalFields
              key={formKey}
              isReadOnly={isReadOnly}
              submissionId={submissionId}
              currentMode={currentMode}
              isAssessmentMode={isAssessmentMode}
              isCompletedMode={isCompletedMode}
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
          {shouldShowReceiveButton() && (
            <Button
              onClick={handleReceiveClick}
              variant="contained"
              disabled={isProcessing}
              startIcon={isProcessing ? <CircularProgress size={16} /> : null}
              sx={receiveButtonStyles}>
              {isProcessing ? "Starting..." : "Receive"}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
};

export default DaFormReceivingModal;
