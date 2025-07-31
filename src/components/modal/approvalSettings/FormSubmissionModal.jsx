import React, { useEffect, useState } from "react";
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
  Divider,
  CircularProgress,
  Tooltip,
} from "@mui/material";
import {
  Close as CloseIcon,
  Edit as EditIcon,
  Assignment as AssignmentIcon,
  Send as SendIcon,
  Cancel as CancelIcon,
} from "@mui/icons-material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { yupResolver } from "@hookform/resolvers/yup";
import dayjs from "dayjs";
import { useGetAllApprovalFormsQuery } from "../../../features/api/approvalsetting/approvalFormApi";
import { useGetAllPositionsQuery } from "../../../features/api/masterlist/positionsApi";
import { useGetAllJobLevelsQuery } from "../../../features/api/masterlist/jobLevelsApi";
import { useGetAllRequisitionsQuery } from "../../../features/api/extras/requisitionsApi";
import { useGetEmployeesQuery } from "../../../features/api/employee/mainApi";
import {
  createFormSubmissionSchema,
  formSubmissionDefaultValues,
} from "../../../schema/approver/formSubmissionSchema";
import FormSubmissionFields from "./FormSubmissionFields";

const FormContent = ({
  onSave,
  onResubmit,
  onCancel,
  selectedEntry,
  isLoading,
  mode,
  onClose,
  onModeChange,
}) => {
  const {
    formState: { errors },
    setValue,
    watch,
    reset,
    handleSubmit,
    getValues,
    trigger,
    clearErrors,
  } = useFormContext();

  const [selectedFile, setSelectedFile] = useState(null);

  const watchedRequisitionType = watch("requisition_type_id");

  const { data: approvalFormsData = [] } = useGetAllApprovalFormsQuery();
  const { data: positionsData = [] } = useGetAllPositionsQuery();
  const { data: jobLevelsData = [] } = useGetAllJobLevelsQuery();
  const { data: requisitionsData = [] } = useGetAllRequisitionsQuery();
  const { data: employeesData = [] } = useGetEmployeesQuery({
    pagination: false,
  });

  const approvalForms = Array.isArray(approvalFormsData?.result?.data)
    ? approvalFormsData.result.data
    : Array.isArray(approvalFormsData?.result)
    ? approvalFormsData.result
    : Array.isArray(approvalFormsData)
    ? approvalFormsData
    : [];

  const positions = Array.isArray(positionsData?.result)
    ? positionsData.result
    : Array.isArray(positionsData)
    ? positionsData
    : [];

  const jobLevels = Array.isArray(jobLevelsData?.result)
    ? jobLevelsData.result
    : Array.isArray(jobLevelsData)
    ? jobLevelsData
    : [];

  const requisitions = Array.isArray(requisitionsData?.result)
    ? requisitionsData.result
    : Array.isArray(requisitionsData)
    ? requisitionsData
    : [];

  const employees = Array.isArray(employeesData?.result?.data)
    ? employeesData.result.data
    : Array.isArray(employeesData?.result)
    ? employeesData.result
    : Array.isArray(employeesData)
    ? employeesData
    : [];

  const findOptionById = (options, id) => {
    return options.find((option) => option.id === id) || null;
  };

  const findManpowerRequisitionForm = () => {
    return (
      approvalForms.find((form) => form.name === "Manpower Requisition Form") ||
      null
    );
  };

  const isAdditionalManpower = () => {
    if (!watchedRequisitionType) return false;
    return watchedRequisitionType.name === "ADDITIONAL MANPOWER";
  };

  const shouldEnableEditButton = () => {
    if (!selectedEntry) {
      return false;
    }
    const status = selectedEntry.status;
    return (
      status === "AWAITING_RESUBMISSION" ||
      status === "AWAITING RESUBMISSION" ||
      status === "REJECTED" ||
      status === "RETURNED"
    );
  };

  const shouldEnableResubmitButton = () => {
    if (!selectedEntry) {
      return false;
    }

    const status = selectedEntry.status;

    const canResubmit =
      status === "AWAITING_RESUBMISSION" || status === "AWAITING RESUBMISSION";

    return canResubmit;
  };

  const shouldEnableCancelButton = () => {
    if (!selectedEntry) {
      return false;
    }
    const status = selectedEntry.status;
    return (
      status === "AWAITING_RESUBMISSION" ||
      status === "AWAITING RESUBMISSION" ||
      status === "REJECTED" ||
      status === "RETURNED"
    );
  };

  const getModalTitle = () => {
    switch (mode) {
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

  const isReadOnly = mode === "view";
  const isCreateMode = mode === "create";
  const isEditMode = mode === "edit";
  const isViewMode = mode === "view";

  useEffect(() => {
    if (approvalForms.length > 0) {
      const manpowerForm = findManpowerRequisitionForm();
      if (manpowerForm) {
        setValue("form_id", manpowerForm);
      }
    }
  }, [approvalForms, setValue]);

  useEffect(() => {
    if (mode === "create") {
      reset(formSubmissionDefaultValues);
      setSelectedFile(null);
      if (approvalForms.length > 0) {
        const manpowerForm = findManpowerRequisitionForm();
        if (manpowerForm) {
          setValue("form_id", manpowerForm);
        }
      }
    } else if (selectedEntry && (mode === "view" || mode === "edit")) {
      if (
        approvalForms.length > 0 &&
        positions.length > 0 &&
        jobLevels.length > 0 &&
        requisitions.length > 0 &&
        employees.length > 0
      ) {
        const submittableData = selectedEntry.submittable || {};

        const formValues = {
          form_id: findOptionById(approvalForms, selectedEntry.form?.id),
          position_id: findOptionById(positions, submittableData.position_id),
          job_level_id: findOptionById(jobLevels, submittableData.job_level_id),
          employment_type: submittableData.employment_type || "",
          expected_salary: submittableData.expected_salary || "",
          requisition_type_id: findOptionById(
            requisitions,
            submittableData.requisition_type_id
          ),
          employee_to_be_replaced_id: findOptionById(
            employees,
            submittableData.employee_to_be_replaced_id
          ),
          justification: submittableData.justification || "",
          remarks: submittableData.remarks || "",
          manpower_form_attachment:
            submittableData.manpower_attachment_filename || null,
        };

        reset(formValues);
        setSelectedFile(submittableData.manpower_attachment_filename || null);

        if (submittableData.manpower_attachment_filename) {
          setValue(
            "manpower_form_attachment",
            submittableData.manpower_attachment_filename
          );
          clearErrors("manpower_form_attachment");
        }
      }
    }
  }, [
    mode,
    selectedEntry,
    reset,
    approvalForms.length,
    positions.length,
    jobLevels.length,
    requisitions.length,
    employees.length,
    getValues,
    setValue,
    clearErrors,
  ]);

  useEffect(() => {
    if (isAdditionalManpower()) {
      setValue("employee_to_be_replaced_id", null);
    }
  }, [watchedRequisitionType, setValue]);

  const handleModeChange = (newMode) => {
    if (onModeChange) {
      onModeChange(newMode);
    }
  };

  const handleFileChange = (file) => {
    setSelectedFile(file);
    setValue("manpower_form_attachment", file);
  };

  const onSubmit = (data) => {
    console.log("Form data before submission:", data);

    const formData = new FormData();

    formData.append("mode", mode);

    if (mode === "edit" && selectedEntry?.id) {
      formData.append("id", selectedEntry.id);
      formData.append("_method", "PATCH");
    }

    const manpowerForm = findManpowerRequisitionForm();
    if (manpowerForm?.id) {
      formData.append("form_id", manpowerForm.id);
    } else if (data.form_id?.id) {
      formData.append("form_id", data.form_id.id);
    }

    if (data.position_id?.id) {
      formData.append("position_id", data.position_id.id);
    }

    if (data.job_level_id?.id) {
      formData.append("job_level_id", data.job_level_id.id);
    }

    if (data.employment_type && data.employment_type.trim() !== "") {
      formData.append("employment_type", data.employment_type);
      console.log("Employment type being sent:", data.employment_type);
    } else {
      console.warn(
        "Employment type is missing or empty:",
        data.employment_type
      );
    }

    if (data.expected_salary) {
      formData.append("expected_salary", data.expected_salary);
    }

    if (data.requisition_type_id?.id) {
      formData.append("requisition_type_id", data.requisition_type_id.id);
    }

    if (data.employee_to_be_replaced_id?.id && !isAdditionalManpower()) {
      formData.append(
        "employee_to_be_replaced_id",
        data.employee_to_be_replaced_id.id
      );
    }

    if (data.justification && data.justification.trim() !== "") {
      formData.append("justification", data.justification);
    }

    if (data.remarks && data.remarks.trim() !== "") {
      formData.append("remarks", data.remarks);
    }

    if (selectedFile) {
      if (selectedFile instanceof File) {
        formData.append("manpower_form_attachment", selectedFile);
      } else if (mode === "edit" && typeof selectedFile === "string") {
        formData.append("existing_attachment", selectedFile);
      }
    }

    console.log("FormData entries:");
    for (let [key, value] of formData.entries()) {
      console.log(key, value);
    }

    if (onSave) {
      onSave(formData, mode);
    }
  };

  const handleResubmit = () => {
    if (onResubmit && selectedEntry) {
      onResubmit(selectedEntry.id);
    }
  };

  const handleCancel = () => {
    if (onCancel && selectedEntry) {
      onCancel(selectedEntry.id);
    }
  };

  const handleSaveClick = async () => {
    if (mode === "edit" && selectedFile && typeof selectedFile === "string") {
      setValue("manpower_form_attachment", selectedFile);
      clearErrors("manpower_form_attachment");
    }

    const isValid = await trigger();
    console.log("Form validation result:", isValid);
    console.log("Form errors:", errors);

    if (isValid) {
      handleSubmit(onSubmit)();
    } else {
      console.log("Form validation failed with errors:", errors);
    }
  };

  return (
    <>
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          pb: 2,
          backgroundColor: "#f8f9fa",
        }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <AssignmentIcon sx={{ color: "rgb(33, 61, 112)" }} />
          <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
            {getModalTitle()}
          </Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {isViewMode && (
            <Tooltip
              title={
                shouldEnableEditButton()
                  ? "Click to edit form submission"
                  : "Edit not available for this status"
              }>
              <span>
                <IconButton
                  onClick={() => handleModeChange("edit")}
                  disabled={!shouldEnableEditButton()}
                  size="small"
                  sx={{
                    width: 40,
                    height: 40,
                    color: shouldEnableEditButton() ? "#008000" : "#9ca3af",
                    border: `1px solid ${
                      shouldEnableEditButton()
                        ? "rgba(33, 61, 112, 0.3)"
                        : "#e5e7eb"
                    }`,
                    "&:hover": {
                      backgroundColor: shouldEnableEditButton()
                        ? "rgba(33, 61, 112, 0.04)"
                        : "transparent",
                      border: `1px solid ${
                        shouldEnableEditButton() ? "#008000" : "#e5e7eb"
                      }`,
                    },
                    "&:disabled": {
                      color: "#9ca3af",
                      border: "1px solid #e5e7eb",
                    },
                  }}>
                  <EditIcon />
                </IconButton>
              </span>
            </Tooltip>
          )}
          <Tooltip title="Close">
            <IconButton
              onClick={onClose}
              size="small"
              sx={{
                width: 40,
                height: 40,
                color: "#d32f2f",
                border: "1px solid rgba(211, 47, 47, 0.3)",
                "&:hover": {
                  backgroundColor: "rgba(211, 47, 47, 0.04)",
                  border: "1px solid #d32f2f",
                },
              }}>
              <CloseIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </DialogTitle>

      <Divider />

      <DialogContent sx={{ pt: 2 }}>
        {!isCreateMode && selectedEntry && (
          <Box sx={{ mb: 2, p: 1, borderRadius: 1 }}>
            {selectedEntry.updated_at && (
              <Typography variant="body2" color="text.secondary">
                Last Updated:{" "}
                {dayjs(selectedEntry.updated_at).format("MMM DD, YYYY HH:mm")}
              </Typography>
            )}
          </Box>
        )}

        <FormSubmissionFields
          mode={mode}
          selectedEntry={selectedEntry}
          onFileChange={handleFileChange}
          selectedFile={selectedFile}
          disabled={false}
        />
      </DialogContent>

      <Divider />

      <DialogActions sx={{ px: 3, py: 2 }}>
        {isViewMode && (
          <>
            <Button
              onClick={handleCancel}
              variant="contained"
              disabled={!shouldEnableCancelButton()}
              startIcon={<CancelIcon />}
              sx={{
                backgroundColor: shouldEnableCancelButton()
                  ? "#d32f2f"
                  : "rgba(211, 47, 47, 0.3)",
                "&:hover": {
                  backgroundColor: shouldEnableCancelButton()
                    ? "#b71c1c"
                    : "rgba(211, 47, 47, 0.3)",
                },
                "&:disabled": {
                  backgroundColor: "rgba(211, 47, 47, 0.3)",
                  color: "rgba(255, 255, 255, 0.5)",
                },
                mr: 1,
              }}>
              Cancel Submission
            </Button>
            <Button
              onClick={handleResubmit}
              variant="contained"
              disabled={!shouldEnableResubmitButton()}
              startIcon={<SendIcon />}
              sx={{
                backgroundColor: shouldEnableResubmitButton()
                  ? "rgb(33, 61, 112)"
                  : "rgba(33, 61, 112, 0.3)",
                "&:hover": {
                  backgroundColor: shouldEnableResubmitButton()
                    ? "rgb(25, 45, 84)"
                    : "rgba(33, 61, 112, 0.3)",
                },
                "&:disabled": {
                  backgroundColor: "rgba(33, 61, 112, 0.3)",
                  color: "rgba(255, 255, 255, 0.5)",
                },
              }}>
              Resubmit
            </Button>
          </>
        )}

        {(isCreateMode || isEditMode) && (
          <>
            <Button
              onClick={handleSaveClick}
              variant="contained"
              disabled={isLoading}
              startIcon={
                isLoading ? <CircularProgress size={16} /> : <EditIcon />
              }
              sx={{
                backgroundColor: "rgb(33, 61, 112)",
                "&:hover": { backgroundColor: "rgb(25, 45, 84)" },
                "&:disabled": { backgroundColor: "rgba(33, 61, 112, 0.3)" },
              }}>
              {isLoading ? "Saving..." : isCreateMode ? "Create" : "Update"}
            </Button>
          </>
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
  onCancel,
  selectedEntry = null,
  isLoading = false,
  mode = "create",
  onModeChange,
}) => {
  const [internalMode, setInternalMode] = useState(mode);

  const currentMode = onModeChange ? mode : internalMode;
  const hasExistingFile = selectedEntry?.submittable
    ?.manpower_attachment_filename
    ? true
    : false;

  const methods = useForm({
    defaultValues: formSubmissionDefaultValues,
    resolver: yupResolver(
      createFormSubmissionSchema(currentMode, hasExistingFile)
    ),
  });

  const handleClose = () => {
    methods.reset(formSubmissionDefaultValues);
    setInternalMode(mode);
    onClose();
  };

  const handleModeChange = (newMode) => {
    if (newMode === "create") {
      methods.reset(formSubmissionDefaultValues);
    }

    if (onModeChange) {
      onModeChange(newMode);
    } else {
      setInternalMode(newMode);
    }
  };

  const handleResubmit = (submissionId) => {
    if (onResubmit) {
      onResubmit(submissionId);
    }
  };

  const handleCancel = (submissionId) => {
    if (onCancel) {
      onCancel(submissionId);
    }
  };

  useEffect(() => {
    if (onModeChange) {
      setInternalMode(mode);
    }
  }, [mode, onModeChange]);

  useEffect(() => {
    const hasFile = selectedEntry?.submittable?.manpower_attachment_filename
      ? true
      : false;
    methods.clearErrors();
    const newResolver = yupResolver(
      createFormSubmissionSchema(currentMode, hasFile)
    );
  }, [currentMode, selectedEntry, methods]);

  if (!open) return null;

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            minHeight: "70vh",
            maxHeight: "90vh",
          },
        }}>
        <FormProvider {...methods}>
          <FormContent
            onSave={onSave}
            onResubmit={handleResubmit}
            onCancel={handleCancel}
            selectedEntry={selectedEntry}
            isLoading={isLoading}
            mode={currentMode}
            onClose={handleClose}
            onModeChange={handleModeChange}
          />
        </FormProvider>
      </Dialog>
    </LocalizationProvider>
  );
};

FormSubmissionModal.displayName = "FormSubmissionModal";

export default FormSubmissionModal;
