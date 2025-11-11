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

  const isAdditionalManpower = () => {
    if (!watchedRequisitionType) return false;
    return watchedRequisitionType.name === "ADDITIONAL MANPOWER";
  };

  const isReplacementDueToEmployeeMovement = () => {
    if (!watchedRequisitionType) return false;
    return (
      watchedRequisitionType.name === "REPLACEMENT DUE TO EMPLOYEE MOVEMENT"
    );
  };

  const shouldEnableEditButton = () => {
    if (!selectedEntry) {
      return false;
    }

    const entry = selectedEntry?.result || selectedEntry;
    const status = entry?.status?.toUpperCase() || "";

    if (status === "RECEIVED" || status === "CANCELLED") {
      return false;
    }

    return true;
  };

  const shouldEnableResubmitButton = () => {
    if (!selectedEntry || !selectedEntry.actions) {
      return false;
    }
    const status = selectedEntry.status?.toUpperCase() || "";
    if (
      status === "APPROVED" ||
      status === "CANCELLED" ||
      status === "RECEIVED"
    ) {
      return false;
    }
    return selectedEntry.actions.can_resubmit === true;
  };

  const shouldShowResubmitButton = () => {
    if (!selectedEntry) return false;
    const status = selectedEntry.status?.toUpperCase() || "";
    return (
      status !== "COMPLETED" &&
      status !== "CANCELLED" &&
      status !== "APPROVED" &&
      status !== "RECEIVED"
    );
  };

  const initializeForm = () => {
    if (currentMode === "create") {
      reset(formSubmissionDefaultValues);
      setSelectedFile(null);
    }
  };

  const populateFormWithEntry = (entry) => {
    if (!entry) return;

    const submittable = entry.submittable || entry.data || entry;

    if (submittable.position_id || submittable.position) {
      setValue(
        "position_id",
        submittable.position || { id: submittable.position_id }
      );
    }

    if (submittable.job_level_id || submittable.job_level) {
      setValue(
        "job_level_id",
        submittable.job_level || { id: submittable.job_level_id }
      );
    }

    if (submittable.requisition_type_id || submittable.requisition_type) {
      setValue(
        "requisition_type_id",
        submittable.requisition_type || { id: submittable.requisition_type_id }
      );
    }

    if (
      submittable.employee_to_be_replaced_id ||
      submittable.employee_to_be_replaced
    ) {
      setValue(
        "employee_to_be_replaced_id",
        submittable.employee_to_be_replaced || {
          id: submittable.employee_to_be_replaced_id,
        }
      );
    }

    if (submittable.expected_salary) {
      setValue("expected_salary", submittable.expected_salary);
    }

    if (submittable.employment_type) {
      setValue("employment_type", submittable.employment_type);
    }

    if (submittable.justification) {
      setValue("justification", submittable.justification);
    }

    if (submittable.remarks) {
      setValue("remarks", submittable.remarks);
    }

    if (submittable.employee_movement_details) {
      const movement = submittable.employee_movement_details;

      if (movement.employee_id || movement.employee) {
        setValue(
          "movement_employee_id",
          movement.employee || { id: movement.employee_id }
        );
      }

      if (movement.new_position_id || movement.new_position) {
        setValue(
          "movement_new_position_id",
          movement.new_position || { id: movement.new_position_id }
        );
      }

      if (movement.reason_for_change) {
        setValue("movement_reason_for_change", movement.reason_for_change);
      }

      if (movement.is_developmental_assignment !== undefined) {
        setValue(
          "movement_is_da",
          Boolean(movement.is_developmental_assignment)
        );
      }

      if (movement.da_start_date) {
        setValue("movement_da_start_date", dayjs(movement.da_start_date));
      }

      if (movement.da_end_date) {
        setValue("movement_da_end_date", dayjs(movement.da_end_date));
      }
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
      populateFormWithEntry(selectedEntry);
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
      populateFormWithEntry(selectedEntry);
    }
  };

  const handleCancelEdit = () => {
    setCurrentMode(originalMode);
    if (onModeChange) {
      onModeChange(originalMode);
    }
    if (selectedEntry) {
      populateFormWithEntry(selectedEntry);
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
    if (isAdditionalManpower()) {
      setValue("employee_to_be_replaced_id", null);
    }
  }, [watchedRequisitionType, setValue]);

  const handleFileChange = (file) => {
    setSelectedFile(file);
    setValue("manpower_form_attachment", file);
  };

  const formatDateForPayload = (date) => {
    if (!date) return null;
    if (dayjs.isDayjs(date)) {
      return date.format("YYYY-MM-DD");
    }
    if (date instanceof Date) {
      return dayjs(date).format("YYYY-MM-DD");
    }
    if (typeof date === "string") {
      return dayjs(date).format("YYYY-MM-DD");
    }
    return null;
  };

  const onSubmit = (data) => {
    if (currentMode === "create") {
      const hasFile = selectedFile && selectedFile instanceof File;

      if (hasFile) {
        const formData = new FormData();

        formData.append("mode", currentMode);
        formData.append("form_id", "1");

        if (data.position_id?.id) {
          formData.append("position_id", data.position_id.id.toString());
        }

        if (data.job_level_id?.id) {
          formData.append("job_level_id", data.job_level_id.id.toString());
        }

        if (data.employment_type && data.employment_type.trim() !== "") {
          formData.append("employment_type", data.employment_type);
        }

        if (data.expected_salary) {
          formData.append("expected_salary", data.expected_salary.toString());
        }

        if (data.requisition_type_id?.id) {
          formData.append(
            "requisition_type_id",
            data.requisition_type_id.id.toString()
          );
        }

        if (data.justification && data.justification.trim() !== "") {
          formData.append("justification", data.justification);
        }

        if (data.remarks && data.remarks.trim() !== "") {
          formData.append("remarks", data.remarks);
        }

        formData.append("manpower_form_attachment", selectedFile);

        if (
          data.employee_to_be_replaced_id?.id &&
          !isAdditionalManpower() &&
          !isReplacementDueToEmployeeMovement()
        ) {
          formData.append(
            "employee_to_be_replaced_id",
            data.employee_to_be_replaced_id.id.toString()
          );
        }

        if (isReplacementDueToEmployeeMovement()) {
          if (data.movement_employee_id?.id) {
            formData.append(
              "employee_id",
              data.movement_employee_id.id.toString()
            );
          }

          if (data.movement_new_position_id?.id) {
            formData.append(
              "new_position_id",
              data.movement_new_position_id.id.toString()
            );
          }

          if (
            data.movement_reason_for_change &&
            data.movement_reason_for_change.trim() !== ""
          ) {
            formData.append(
              "reason_for_change",
              data.movement_reason_for_change
            );
          }

          formData.append(
            "is_developmental_assignment",
            data.movement_is_da ? "1" : "0"
          );

          if (data.movement_is_da) {
            const formattedStartDate = formatDateForPayload(
              data.movement_da_start_date
            );
            if (formattedStartDate) {
              formData.append("movement_da_start_date", formattedStartDate);
            }

            const formattedEndDate = formatDateForPayload(
              data.movement_da_end_date
            );
            if (formattedEndDate) {
              formData.append("movement_da_end_date", formattedEndDate);
            }
          }
        }

        if (onSave) {
          onSave(formData, currentMode);
        }
      } else {
        const jsonData = {
          mode: currentMode,
          form_id: 1,
        };

        if (data.position_id?.id) {
          jsonData.position_id = data.position_id.id;
        }

        if (data.job_level_id?.id) {
          jsonData.job_level_id = data.job_level_id.id;
        }

        if (data.employment_type && data.employment_type.trim() !== "") {
          jsonData.employment_type = data.employment_type;
        }

        if (data.expected_salary) {
          jsonData.expected_salary = data.expected_salary;
        }

        if (data.requisition_type_id?.id) {
          jsonData.requisition_type_id = data.requisition_type_id.id;
        }

        if (data.justification && data.justification.trim() !== "") {
          jsonData.justification = data.justification;
        }

        if (data.remarks && data.remarks.trim() !== "") {
          jsonData.remarks = data.remarks;
        }

        if (
          data.employee_to_be_replaced_id?.id &&
          !isAdditionalManpower() &&
          !isReplacementDueToEmployeeMovement()
        ) {
          jsonData.employee_to_be_replaced_id =
            data.employee_to_be_replaced_id.id;
        }

        if (isReplacementDueToEmployeeMovement()) {
          if (data.movement_employee_id?.id) {
            jsonData.employee_id = data.movement_employee_id.id;
          }

          if (data.movement_new_position_id?.id) {
            jsonData.new_position_id = data.movement_new_position_id.id;
          }

          if (
            data.movement_reason_for_change &&
            data.movement_reason_for_change.trim() !== ""
          ) {
            jsonData.reason_for_change = data.movement_reason_for_change;
          }

          jsonData.is_developmental_assignment = data.movement_is_da || false;

          if (data.movement_is_da) {
            const formattedStartDate = formatDateForPayload(
              data.movement_da_start_date
            );
            if (formattedStartDate) {
              jsonData.movement_da_start_date = formattedStartDate;
            }

            const formattedEndDate = formatDateForPayload(
              data.movement_da_end_date
            );
            if (formattedEndDate) {
              jsonData.movement_da_end_date = formattedEndDate;
            }
          }
        }

        if (onSave) {
          onSave(jsonData, currentMode);
        }
      }
    } else if (currentMode === "edit" && selectedEntry?.id) {
      const updateData = {
        _method: "PATCH",
      };

      if (data.position_id?.id) {
        updateData.to_position_id = data.position_id.id;
      }

      if (data.job_level_id?.id) {
        updateData.job_level_id = data.job_level_id.id;
      }

      if (data.employment_type && data.employment_type.trim() !== "") {
        updateData.employment_type = data.employment_type;
      }

      if (data.expected_salary) {
        updateData.expected_salary = data.expected_salary;
      }

      if (data.requisition_type_id?.id) {
        updateData.requisition_type_id = data.requisition_type_id.id;
      }

      if (data.justification && data.justification.trim() !== "") {
        updateData.justification = data.justification;
      }

      if (data.remarks && data.remarks.trim() !== "") {
        updateData.remarks = data.remarks;
      }

      if (
        data.employee_to_be_replaced_id?.id &&
        !isAdditionalManpower() &&
        !isReplacementDueToEmployeeMovement()
      ) {
        updateData.employee_id = data.employee_to_be_replaced_id.id;
      }

      if (isReplacementDueToEmployeeMovement()) {
        if (data.movement_employee_id?.id) {
          updateData.employee_id = data.movement_employee_id.id;
        }

        if (data.movement_new_position_id?.id) {
          updateData.to_position_id = data.movement_new_position_id.id;
        }

        if (
          data.movement_reason_for_change &&
          data.movement_reason_for_change.trim() !== ""
        ) {
          updateData.reason_for_change = data.movement_reason_for_change;
        }

        updateData.is_developmental_assignment = data.movement_is_da || false;

        if (data.movement_is_da) {
          const formattedStartDate = formatDateForPayload(
            data.movement_da_start_date
          );
          if (formattedStartDate) {
            updateData.da_start_date = formattedStartDate;
          }

          const formattedEndDate = formatDateForPayload(
            data.movement_da_end_date
          );
          if (formattedEndDate) {
            updateData.da_end_date = formattedEndDate;
          }
        }
      }

      if (selectedFile && selectedFile instanceof File) {
        const formData = new FormData();
        formData.append("id", selectedEntry.id);
        Object.keys(updateData).forEach((key) => {
          formData.append(key, updateData[key]);
        });
        formData.append("manpower_form_attachment", selectedFile);

        if (onSave) {
          onSave(formData, currentMode);
        }
      } else {
        if (onSave) {
          onSave({ id: selectedEntry.id, ...updateData }, currentMode);
        }
      }
    }
  };

  const handleResubmit = async () => {
    const isValid = await trigger();

    if (isValid) {
      const data = getValues();
      const submissionId = selectedEntry?.id || selectedEntry?.submittable?.id;

      const resubmitData = {};

      if (data.position_id?.id) {
        resubmitData.position_id = data.position_id.id;
      }

      if (data.job_level_id?.id) {
        resubmitData.job_level_id = data.job_level_id.id;
      }

      if (data.employment_type && data.employment_type.trim() !== "") {
        resubmitData.employment_type = data.employment_type;
      }

      if (data.expected_salary) {
        resubmitData.expected_salary = data.expected_salary;
      }

      if (data.requisition_type_id?.id) {
        resubmitData.requisition_type_id = data.requisition_type_id.id;
      }

      if (data.justification && data.justification.trim() !== "") {
        resubmitData.justification = data.justification;
      }

      if (data.remarks && data.remarks.trim() !== "") {
        resubmitData.remarks = data.remarks;
      }

      if (
        data.employee_to_be_replaced_id?.id &&
        !isAdditionalManpower() &&
        !isReplacementDueToEmployeeMovement()
      ) {
        resubmitData.employee_id = data.employee_to_be_replaced_id.id;
      }

      if (isReplacementDueToEmployeeMovement()) {
        if (data.movement_employee_id?.id) {
          resubmitData.employee_id = data.movement_employee_id.id;
        }

        if (data.movement_new_position_id?.id) {
          resubmitData.to_position_id = data.movement_new_position_id.id;
        }

        if (
          data.movement_reason_for_change &&
          data.movement_reason_for_change.trim() !== ""
        ) {
          resubmitData.reason_for_change = data.movement_reason_for_change;
        }

        resubmitData.is_developmental_assignment = data.movement_is_da || false;

        if (data.movement_is_da) {
          const formattedStartDate = formatDateForPayload(
            data.movement_da_start_date
          );
          if (formattedStartDate) {
            resubmitData.da_start_date = formattedStartDate;
          }

          const formattedEndDate = formatDateForPayload(
            data.movement_da_end_date
          );
          if (formattedEndDate) {
            resubmitData.da_end_date = formattedEndDate;
          }
        }
      }

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

  const safeRenderText = (text) => {
    if (typeof text === "string") return text;
    if (typeof text === "number") return text.toString();
    if (text && typeof text === "object") return "";
    return text || "";
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
          {isViewMode && shouldEnableEditButton() && (
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
        {isViewMode && shouldShowResubmitButton() && (
          <Button
            onClick={handleResubmit}
            variant="contained"
            disabled={!shouldEnableResubmitButton() || isProcessing}
            startIcon={
              isProcessing ? <CircularProgress size={16} /> : <SendIcon />
            }
            sx={{
              backgroundColor:
                shouldEnableResubmitButton() && !isProcessing
                  ? "rgb(33, 61, 112)"
                  : "rgba(33, 61, 112, 0.3)",
              "&:hover": {
                backgroundColor:
                  shouldEnableResubmitButton() && !isProcessing
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
