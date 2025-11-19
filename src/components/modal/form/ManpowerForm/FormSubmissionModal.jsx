import React, { useEffect, useState, useRef } from "react";
import { useForm, FormProvider, useFormContext } from "react-hook-form";
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
  Assignment as AssignmentIcon,
  Send as SendIcon,
} from "@mui/icons-material";
import EditOffIcon from "@mui/icons-material/EditOff";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { yupResolver } from "@hookform/resolvers/yup";
import dayjs from "dayjs";
import {
  createFormSubmissionSchema,
  formSubmissionDefaultValues,
} from "../../../../schema/approver/formSubmissionSchema";
import FormSubmissionFields from "./FormSubmissionFields";
import { modalStyles } from "./FormSubmissionFieldStyles";
import {
  shouldEnableEditButton,
  shouldEnableResubmitButton,
  shouldShowResubmitButton,
  isAdditionalManpower,
  isReplacementDueToEmployeeMovement,
  populateFormWithEntry,
  buildCreatePayload,
  buildEditPayload,
  buildResubmitPayload,
  safeRenderText,
} from "./formSubmissionUtils";

const ErrorDialog = ({ open, message, onClose }) => {
  if (!open) return null;

  return (
    <Box sx={modalStyles.errorDialogOverlay}>
      <Box sx={modalStyles.errorDialogBox}>
        <IconButton onClick={onClose} sx={modalStyles.errorDialogCloseButton}>
          <CloseIcon sx={modalStyles.errorDialogCloseIcon} />
        </IconButton>
        <Box sx={modalStyles.errorDialogContent}>
          <Box sx={modalStyles.errorDialogIconContainer}>
            <Typography sx={modalStyles.errorDialogIconText}>!</Typography>
          </Box>
          <Typography variant="body1" sx={modalStyles.errorDialogMessage}>
            {typeof message === "string" ? message : "An error occurred"}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

const FormContent = ({
  onSave,
  onResubmit,
  selectedEntry,
  isLoading,
  mode,
  onClose,
  onModeChange,
  reset,
  backendErrors = {},
  resetKey,
}) => {
  const {
    formState: { errors },
    setValue,
    watch,
    handleSubmit,
    trigger,
    setError,
    getValues,
  } = useFormContext();

  const [selectedFile, setSelectedFile] = useState(null);
  const [currentMode, setCurrentMode] = useState(mode);
  const [originalMode, setOriginalMode] = useState(mode);
  const [apiError, setApiError] = useState(null);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const watchedRequisitionType = watch("requisition_type_id");
  const watchedPositionId = watch("position_id");

  useEffect(() => {
    setSelectedFile(null);
    setCurrentMode(mode);
    setOriginalMode(mode);
    setApiError(null);
    setShowErrorDialog(false);
  }, [resetKey, mode]);

  const initializeForm = () => {
    if (currentMode === "create") {
      reset(formSubmissionDefaultValues);
      setSelectedFile(null);
    }
  };

  useEffect(() => {
    setCurrentMode(mode);
    setOriginalMode(mode);
  }, [mode]);

  useEffect(() => {
    if (currentMode === "create") {
      initializeForm();
    } else if (
      (currentMode === "view" || currentMode === "edit") &&
      selectedEntry
    ) {
      populateFormWithEntry(selectedEntry, setValue);
    }
  }, [currentMode, selectedEntry]);

  useEffect(() => {
    if (backendErrors && Object.keys(backendErrors).length > 0) {
      Object.entries(backendErrors).forEach(([field, messages]) => {
        if (Array.isArray(messages) && messages.length > 0) {
          setError(field, {
            type: "server",
            message: messages[0],
          });
        }
      });
    }
  }, [backendErrors, setError]);

  const hasBackendError =
    backendErrors && Object.keys(backendErrors).length > 0;

  const handleModeChange = (newMode) => {
    setCurrentMode(newMode);
    if (onModeChange) {
      onModeChange(newMode);
    }

    if (newMode === "edit" && selectedEntry) {
      setSelectedFile(null);
      setValue("manpower_form_attachment", null, { shouldValidate: false });
      populateFormWithEntry(selectedEntry, setValue);
    }
  };

  const handleCancelEdit = () => {
    setCurrentMode(originalMode);
    if (onModeChange) {
      onModeChange(originalMode);
    }
    if (selectedEntry) {
      populateFormWithEntry(selectedEntry, setValue);
    }
  };

  const handleClose = () => {
    setCurrentMode("create");
    setOriginalMode("create");
    setSelectedFile(null);
    if (reset) {
      reset();
    }
    onClose();
  };

  const handleErrorDialogClose = () => {
    setShowErrorDialog(false);
    handleClose();
  };

  const getModalTitle = () => {
    switch (currentMode) {
      case "create":
        return "CREATE MANPOWER FORM";
      case "view":
        return "VIEW MANPOWER FORM";
      case "edit":
        return "EDIT MANPOWER FORM";
      default:
        return "MANPOWER FORM";
    }
  };

  const isReadOnly = currentMode === "view";
  const isCreateMode = currentMode === "create";
  const isEditMode = currentMode === "edit";
  const isViewMode = currentMode === "view";

  useEffect(() => {
    if (isAdditionalManpower(watchedRequisitionType)) {
      setValue("employee_to_be_replaced_id", null);
    }
  }, [watchedRequisitionType, setValue]);

  const handleFileChange = (file) => {
    setSelectedFile(file);
    setValue("manpower_form_attachment", file);
  };

  const onSubmit = (data) => {
    if (currentMode === "create") {
      const payload = buildCreatePayload(
        data,
        currentMode,
        selectedFile,
        watchedRequisitionType
      );
      if (onSave) {
        onSave(payload, currentMode);
      }
    } else if (currentMode === "edit" && selectedEntry?.id) {
      const payload = buildEditPayload(
        data,
        selectedEntry,
        selectedFile,
        watchedRequisitionType
      );
      if (onSave) {
        onSave(payload, currentMode);
      }
    }
  };

  const handleResubmit = async () => {
    const isValid = await trigger();

    if (isValid) {
      const data = getValues();
      const submissionId = selectedEntry?.id || selectedEntry?.submittable?.id;
      const resubmitData = buildResubmitPayload(data, watchedRequisitionType);

      if (onResubmit && submissionId) {
        onResubmit(resubmitData, "resubmit", submissionId);
      }
    }
  };

  const handleSaveClick = async () => {
    const isValid = await trigger();

    if (isValid) {
      handleSubmit(onSubmit)();
    }
  };

  const isProcessing = isLoading || isUpdating;

  return (
    <>
      <ErrorDialog
        open={showErrorDialog}
        message={apiError}
        onClose={handleErrorDialogClose}
      />

      <DialogTitle sx={modalStyles.dialogTitle}>
        <Box sx={modalStyles.titleContainer}>
          <AssignmentIcon sx={modalStyles.titleIcon} />
          <Typography variant="h6" component="div" sx={modalStyles.titleText}>
            {safeRenderText(getModalTitle())}
          </Typography>
          {isViewMode && shouldEnableEditButton(selectedEntry) && (
            <Tooltip title="EDIT FORM" arrow placement="top">
              <IconButton
                onClick={() => handleModeChange("edit")}
                disabled={isProcessing}
                size="small"
                sx={modalStyles.editButton(isProcessing)}>
                <EditIcon sx={modalStyles.editIcon(isProcessing)} />
              </IconButton>
            </Tooltip>
          )}
          {isEditMode && originalMode === "view" && (
            <Tooltip title="CANCEL EDIT">
              <IconButton
                onClick={handleCancelEdit}
                disabled={isProcessing}
                size="small"
                sx={modalStyles.cancelEditButton(isProcessing)}>
                <EditOffIcon sx={modalStyles.cancelEditIcon} />
              </IconButton>
            </Tooltip>
          )}
        </Box>
        <Box sx={modalStyles.closeButtonContainer}>
          <IconButton onClick={handleClose} sx={modalStyles.closeButton}>
            <CloseIcon sx={modalStyles.closeIcon} />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={modalStyles.dialogContent}>
        {hasBackendError && (
          <Box sx={modalStyles.errorBanner}>
            <Typography
              variant="body2"
              color="error"
              sx={modalStyles.errorText}>
              Error: The manpower form attachment field must be a file of type:
              pdf, doc, docx, jpg, png.
            </Typography>
          </Box>
        )}

        {!isCreateMode && selectedEntry && (
          <Box sx={modalStyles.metadataContainer}>
            {selectedEntry.updated_at && (
              <Typography variant="body2" color="text.secondary">
                Last Updated:{" "}
                {dayjs(selectedEntry.updated_at).format("MMM DD, YYYY HH:mm")}
              </Typography>
            )}
          </Box>
        )}

        <FormSubmissionFields
          key={resetKey}
          mode={currentMode}
          selectedEntry={selectedEntry}
          onFileChange={handleFileChange}
          selectedFile={selectedFile}
          resetTrigger={resetKey}
        />
      </DialogContent>

      <DialogActions sx={modalStyles.dialogActions}>
        {isViewMode && shouldShowResubmitButton(selectedEntry) && (
          <Button
            onClick={handleResubmit}
            variant="contained"
            disabled={
              !shouldEnableResubmitButton(selectedEntry) || isProcessing
            }
            startIcon={
              isProcessing ? <CircularProgress size={16} /> : <SendIcon />
            }
            sx={{
              backgroundColor:
                shouldEnableResubmitButton(selectedEntry) && !isProcessing
                  ? "rgb(33, 61, 112)"
                  : "rgba(33, 61, 112, 0.3)",
              "&:hover": {
                backgroundColor:
                  shouldEnableResubmitButton(selectedEntry) && !isProcessing
                    ? "rgb(25, 45, 84)"
                    : "rgba(33, 61, 112, 0.3)",
              },
              "&:disabled": {
                backgroundColor: "rgba(33, 61, 112, 0.3)",
                color: "rgba(255, 255, 255, 0.5)",
              },
              mr: 2,
            }}>
            {isProcessing ? "Resubmitting..." : "Resubmit"}
          </Button>
        )}

        {(isCreateMode || isEditMode) && (
          <Box>
            <Button
              onClick={handleSaveClick}
              variant="contained"
              disabled={isProcessing}
              startIcon={
                isProcessing ? (
                  <CircularProgress size={16} />
                ) : isCreateMode ? (
                  <AddIcon />
                ) : (
                  <EditIcon />
                )
              }
              sx={modalStyles.saveButton}>
              {safeRenderText(
                isProcessing ? "Saving..." : isCreateMode ? "Create" : "Update"
              )}
            </Button>
          </Box>
        )}
      </DialogActions>
    </>
  );
};

const FormSubmissionModal = ({
  open = false,
  onClose,
  onSave,
  onResubmit,
  selectedEntry = null,
  isLoading = false,
  mode = "create",
  onModeChange,
  backendErrors = {},
}) => {
  const [resetKey, setResetKey] = useState(0);
  const prevOpenRef = useRef(open);

  const hasExistingFile =
    selectedEntry?.submittable?.manpower_attachment_filename ||
    selectedEntry?.data?.manpower_attachment_filename ||
    selectedEntry?.attributes?.manpower_attachment_filename ||
    selectedEntry?.manpower_attachment_filename
      ? true
      : false;

  const methods = useForm({
    defaultValues: formSubmissionDefaultValues,
    resolver: yupResolver(createFormSubmissionSchema(mode, hasExistingFile)),
    mode: "onSubmit",
  });

  useEffect(() => {
    if (prevOpenRef.current !== open) {
      if (open) {
        if (mode === "create") {
          methods.reset(formSubmissionDefaultValues);
        }
        setResetKey(Date.now());
      } else {
        setTimeout(() => {
          methods.reset(formSubmissionDefaultValues);
          setResetKey(Date.now());
        }, 100);
      }
      prevOpenRef.current = open;
    }
  }, [open, methods, mode]);

  const handleClose = () => {
    methods.reset(formSubmissionDefaultValues);
    onClose();
  };

  const handleModeChange = (newMode) => {
    if (newMode === "create") {
      methods.reset(formSubmissionDefaultValues);
      setResetKey((prev) => prev + 1);
    }

    if (onModeChange) {
      onModeChange(newMode);
    }
  };

  const handleResubmit = (formData, mode, submissionId) => {
    if (onResubmit) {
      onResubmit(formData, mode, submissionId);
    }
  };

  useEffect(() => {
    methods.clearErrors();
  }, [mode, selectedEntry, methods]);

  if (!open) return null;

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: modalStyles.dialogPaper,
        }}>
        <FormProvider {...methods}>
          <FormContent
            onSave={onSave}
            onResubmit={handleResubmit}
            selectedEntry={selectedEntry}
            isLoading={isLoading}
            mode={mode}
            onClose={handleClose}
            onModeChange={handleModeChange}
            reset={methods.reset}
            backendErrors={backendErrors}
            resetKey={resetKey}
          />
        </FormProvider>
      </Dialog>
    </LocalizationProvider>
  );
};

FormSubmissionModal.displayName = "FormSubmissionModal";

export default FormSubmissionModal;
