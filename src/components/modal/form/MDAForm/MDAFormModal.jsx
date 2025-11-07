import React, { useEffect, useState } from "react";
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
  Print as PrintIcon,
} from "@mui/icons-material";
import EditOffIcon from "@mui/icons-material/EditOff";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import {
  useLazyGetMdaPrefillQuery,
  useLazyGetSingleMdaSubmissionQuery,
  useGetAllJobLevelsQuery,
  useGetAllPositionsQuery,
} from "../../../../features/api/forms/mdaApi";
import MDAFormModalFields from "./MDAFormModalFields";
import {
  UpdateConfirmationDialog,
  ResubmitConfirmationDialog,
  PrintDialog,
} from "./MDAFormsDialogs";
import {
  setPrefillFormValues,
  getCreateModeInitialValues,
  getViewEditModeFormData,
} from "./MDAFieldsGetValues";
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
  printIconButtonStyles,
  printIconStyles,
  resubmitButtonStyles,
} from "./MDAFornModal.styles";

const MDAFormModal = ({
  open = false,
  onClose,
  onSave,
  onResubmit,
  selectedEntry = null,
  isLoading = false,
  mode = "create",
  employeeMovements = [],
  positions = [],
  submissionId = null,
}) => {
  const { setValue, reset, handleSubmit, formState } = useFormContext();
  const { errors } = formState;

  const shouldLoadJobLevels = open;
  const { data: jobLevelsData, isLoading: isJobLevelsLoading } =
    useGetAllJobLevelsQuery(undefined, {
      skip: !shouldLoadJobLevels,
      refetchOnMountOrArgChange: true,
    });
  const jobLevels = jobLevelsData?.result || [];

  const shouldLoadPositions = open;
  const { data: positionsData, isLoading: isPositionsLoading } =
    useGetAllPositionsQuery(undefined, {
      skip: !shouldLoadPositions,
      refetchOnMountOrArgChange: true,
    });
  const positionsFromApi = positionsData?.result || [];

  const [currentMode, setCurrentMode] = useState(mode);
  const [originalMode, setOriginalMode] = useState(mode);
  const [hasInitialized, setHasInitialized] = useState(false);
  const [selectedMovementId, setSelectedMovementId] = useState(null);
  const [movementType, setMovementType] = useState("");
  const [showUpdateConfirmation, setShowUpdateConfirmation] = useState(false);
  const [showResubmitConfirmation, setShowResubmitConfirmation] =
    useState(false);
  const [pendingFormData, setPendingFormData] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [editingEntryId, setEditingEntryId] = useState(null);
  const [isConfirmingUpdate, setIsConfirmingUpdate] = useState(false);
  const [isConfirmingResubmit, setIsConfirmingResubmit] = useState(false);
  const [showPrintDialog, setShowPrintDialog] = useState(false);
  const [printData, setPrintData] = useState(null);
  const [isPrintLoading, setIsPrintLoading] = useState(false);

  const [triggerPrefill, { data: prefillData, isLoading: isPrefillLoading }] =
    useLazyGetMdaPrefillQuery();
  const [triggerGetSubmission] = useLazyGetSingleMdaSubmissionQuery();

  useEffect(() => {
    if (open && selectedEntry) {
      const entryId = selectedEntry.result?.id || selectedEntry.id;
      setEditingEntryId(entryId);
    }
  }, [open, selectedEntry]);

  const shouldEnableEditButton = () => {
    const status = selectedEntry?.result?.status || selectedEntry?.status;
    if (status === "APPROVED" || status === "CANCELLED") {
      return false;
    }

    const actions =
      selectedEntry?.result?.actions ||
      selectedEntry?.actions ||
      selectedEntry?.result?.submittable?.actions;

    const canUpdate = actions?.can_update === true;

    return canUpdate;
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

    const canResubmit = actions?.can_resubmit === true;

    return canResubmit;
  };

  const shouldShowPrintButton = () => {
    const status = selectedEntry?.result?.status || selectedEntry?.status;
    return status === "APPROVED";
  };

  useEffect(() => {
    if (open && currentMode === "create" && submissionId) {
      triggerPrefill(submissionId, false).then(() => {});
    }
  }, [open, currentMode, submissionId, triggerPrefill]);

  useEffect(() => {
    if (!open) {
      setHasInitialized(false);
      return;
    }

    if (hasInitialized) {
      return;
    }

    if (mode === "create") {
      setCurrentMode(mode);
      setOriginalMode(mode);
      setHasInitialized(true);
      reset(getCreateModeInitialValues());
      return;
    }

    if ((mode === "view" || mode === "edit") && selectedEntry) {
      if (isJobLevelsLoading || jobLevels.length === 0) {
        return;
      }

      setCurrentMode(mode);
      setOriginalMode(mode);
      setHasInitialized(true);

      const formData = getViewEditModeFormData(selectedEntry, jobLevels);
      reset(formData);
    }
  }, [
    open,
    mode,
    hasInitialized,
    selectedEntry,
    jobLevels,
    isJobLevelsLoading,
    reset,
  ]);

  useEffect(() => {
    if (
      open &&
      currentMode === "edit" &&
      originalMode === "view" &&
      selectedEntry &&
      jobLevels.length > 0
    ) {
      const formData = getViewEditModeFormData(selectedEntry, jobLevels);
      reset(formData);
    }
  }, [currentMode, open, originalMode, selectedEntry, jobLevels, reset]);

  useEffect(() => {
    if (prefillData?.result && currentMode === "create") {
      const data = prefillData.result;
      setMovementType(data.movement_type || "");
      setPrefillFormValues(setValue, data);
    }
  }, [prefillData, currentMode, setValue]);

  const handleModeChange = (newMode) => {
    setCurrentMode(newMode);
  };

  const handleCancelEdit = () => {
    setCurrentMode(originalMode);
    if (selectedEntry) {
      const formData = getViewEditModeFormData(selectedEntry, jobLevels);
      reset(formData);
    }
  };

  const onSubmit = async (data) => {
    if (currentMode === "create") {
      if (!data.employee_movement_id) {
        alert("Please select an Employee Movement");
        return;
      }
      if (!data.to_position_id) {
        alert("Please select a To Position");
        return;
      }
      if (!data.to_job_level_id) {
        alert("Please select a To Job Level");
        return;
      }
      if (!data.to_job_rate) {
        alert("Please enter a To Job Rate");
        return;
      }
    }

    const formattedData = {
      ...data,
      movement_type: data.action_type,
      effective_date: data.effective_date
        ? dayjs(data.effective_date).format("YYYY-MM-DD")
        : null,
      birth_date: data.birth_date
        ? dayjs(data.birth_date).format("YYYY-MM-DD")
        : null,
    };

    if (currentMode === "edit") {
      setPendingFormData(formattedData);
      setShowUpdateConfirmation(true);
    } else {
      if (onSave) {
        await onSave(formattedData, currentMode);
        if (submissionId) {
          triggerPrefill(submissionId);
        }
      }
    }
  };

  const handleConfirmUpdate = async () => {
    setIsConfirmingUpdate(true);
    try {
      if (onSave && pendingFormData) {
        await onSave(pendingFormData, currentMode);
        if (submissionId) {
          triggerPrefill(submissionId);
        }
        setShowUpdateConfirmation(false);
        setPendingFormData(null);
      }
    } catch (error) {
      console.error("Update failed:", error);
    } finally {
      setIsConfirmingUpdate(false);
    }
  };

  const handleCancelUpdate = () => {
    setShowUpdateConfirmation(false);
    setPendingFormData(null);
  };

  const handleResubmitClick = () => {
    setShowResubmitConfirmation(true);
  };

  const handleConfirmResubmit = async () => {
    if (!editingEntryId) {
      const fallbackId = selectedEntry?.result?.id || selectedEntry?.id;

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
      editingEntryId || selectedEntry?.result?.id || selectedEntry?.id;

    setIsConfirmingResubmit(true);
    try {
      setIsUpdating(true);
      await onResubmit(idToUse);
      setShowResubmitConfirmation(false);
      handleClose();
    } catch (error) {
      const errorMessage =
        error?.data?.message ||
        error?.message ||
        "An error occurred while resubmitting.";
      alert(`${errorMessage} Please try again.`);
    } finally {
      setIsUpdating(false);
      setIsConfirmingResubmit(false);
    }
  };

  const handleCancelResubmit = () => {
    setShowResubmitConfirmation(false);
  };

  const handlePrintClick = async () => {
    try {
      setIsPrintLoading(true);
      const submissionId = selectedEntry?.result?.id || selectedEntry?.id;

      if (!submissionId) {
        alert("Submission ID not found");
        setIsPrintLoading(false);
        return;
      }

      const response = await triggerGetSubmission(submissionId).unwrap();

      if (response) {
        setPrintData(response);
        setShowPrintDialog(true);
      }
    } catch (error) {
      alert("Failed to fetch submission data. Please try again.");
    } finally {
      setIsPrintLoading(false);
    }
  };

  const handleClosePrintDialog = () => {
    setShowPrintDialog(false);
    setPrintData(null);
  };

  const handleClose = () => {
    reset();
    setCurrentMode(mode);
    setOriginalMode(mode);
    setSelectedMovementId(null);
    setMovementType("");
    setShowUpdateConfirmation(false);
    setShowResubmitConfirmation(false);
    setPendingFormData(null);
    setIsUpdating(false);
    setEditingEntryId(null);
    setIsConfirmingUpdate(false);
    setIsConfirmingResubmit(false);
    setShowPrintDialog(false);
    setPrintData(null);
    setIsPrintLoading(false);
    setHasInitialized(false);
    if (submissionId) {
      triggerPrefill(submissionId);
    }
    onClose();
  };

  const getModalTitle = () => {
    switch (currentMode) {
      case "create":
        return movementType
          ? `CREATE MDA FORM - ${movementType.toUpperCase()}`
          : "CREATE MDA FORM";
      case "view":
        return "VIEW MDA FORM";
      case "edit":
        return "EDIT MDA FORM";
      default:
        return "MDA Form";
    }
  };

  const showResubmitButton = () => {
    const isViewMode = currentMode === "view";
    const status = selectedEntry?.result?.status || selectedEntry?.status;
    return isViewMode && status !== "APPROVED" && status !== "CANCELLED";
  };

  const isReadOnly = currentMode === "view";
  const isCreate = currentMode === "create";
  const isViewMode = currentMode === "view";
  const isEditMode = currentMode === "edit";
  const showLoadingState =
    (isPrefillLoading && isCreate && submissionId) ||
    (isJobLevelsLoading && (mode === "view" || mode === "edit")) ||
    (isPositionsLoading && (mode === "edit" || mode === "create"));
  const isProcessing = isLoading || isUpdating || isPrintLoading;

  const formKey = `mda-form-${currentMode}-${open ? "open" : "closed"}`;

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth={false}
        PaperProps={{
          sx: dialogPaperStyles,
        }}>
        <DialogTitle sx={dialogTitleStyles}>
          <Box sx={titleBoxStyles}>
            <DescriptionIcon sx={descriptionIconStyles} />
            <Typography variant="h6" component="div" sx={titleTypographyStyles}>
              {getModalTitle()}
            </Typography>
            {isViewMode && (
              <>
                <Tooltip title="EDIT MDA" arrow placement="top">
                  <span>
                    <IconButton
                      onClick={() => {
                        handleModeChange("edit");
                      }}
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
                {shouldShowPrintButton() && (
                  <Tooltip title="PRINT NOTICE" arrow placement="top">
                    <IconButton
                      onClick={handlePrintClick}
                      disabled={isProcessing}
                      size="small"
                      sx={printIconButtonStyles}>
                      {isPrintLoading ? (
                        <CircularProgress size={20} />
                      ) : (
                        <PrintIcon sx={printIconStyles} />
                      )}
                    </IconButton>
                  </Tooltip>
                )}
              </>
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
            ) : (
              <MDAFormModalFields
                key={formKey}
                isCreate={isCreate}
                isReadOnly={isReadOnly}
                submissionId={submissionId}
                employeeMovements={employeeMovements}
                isPrefillLoading={isPrefillLoading}
                setSelectedMovementId={setSelectedMovementId}
                currentMode={currentMode}
                positions={positionsFromApi}
                jobLevels={jobLevels}
              />
            )}
          </DialogContent>

          <DialogActions sx={dialogActionsStyles}>
            {showResubmitButton() && (
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

      <UpdateConfirmationDialog
        open={showUpdateConfirmation}
        isConfirming={isConfirmingUpdate}
        selectedEntry={selectedEntry}
        onConfirm={handleConfirmUpdate}
        onCancel={handleCancelUpdate}
      />

      <ResubmitConfirmationDialog
        open={showResubmitConfirmation}
        isConfirming={isConfirmingResubmit}
        selectedEntry={selectedEntry}
        onConfirm={handleConfirmResubmit}
        onCancel={handleCancelResubmit}
      />

      <PrintDialog
        open={showPrintDialog}
        printData={printData}
        onClose={handleClosePrintDialog}
      />
    </LocalizationProvider>
  );
};

export default MDAFormModal;
