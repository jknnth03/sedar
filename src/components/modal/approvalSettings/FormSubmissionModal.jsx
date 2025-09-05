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
import { useLazyGetAllPositionsQuery } from "../../../features/api/masterlist/positionsApi";
import { useLazyGetAllJobLevelsQuery } from "../../../features/api/masterlist/jobLevelsApi";
import { useGetAllEmployeesToBeReplacedQuery } from "../../../features/api/employee/mainApi";
import {
  createFormSubmissionSchema,
  formSubmissionDefaultValues,
} from "../../../schema/approver/formSubmissionSchema";
import FormSubmissionFields from "./FormSubmissionFields";

const ErrorDialog = ({ open, message, onClose }) => {
  if (!open) return null;

  return (
    <Box
      sx={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        paddingTop: "30vh",
        zIndex: 9999,
      }}>
      <Box
        sx={{
          backgroundColor: "white",
          borderRadius: "8px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
          p: 3,
          minWidth: "480px",
          maxWidth: "520px",
          minHeight: "120px",
          border: "1px solid #e0e0e0",
          position: "relative",
        }}>
        <IconButton
          onClick={onClose}
          sx={{
            position: "absolute",
            top: 8,
            right: 8,
            width: 24,
            height: 24,
            padding: 0,
            "&:hover": {
              backgroundColor: "#f5f5f5",
            },
          }}>
          <CloseIcon sx={{ fontSize: "16px", color: "#666" }} />
        </IconButton>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 2,
            pr: 4,
          }}>
          <Box
            sx={{
              width: 20,
              height: 20,
              borderRadius: "50%",
              backgroundColor: "#f44336",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}>
            <Typography
              sx={{
                color: "white",
                fontSize: "12px",
                fontWeight: "bold",
              }}>
              !
            </Typography>
          </Box>
          <Typography
            variant="body1"
            sx={{
              color: "#333",
              fontSize: "16px",
              textAlign: "center",
              width: "100%",
            }}>
            {message}
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
}) => {
  const {
    formState: { errors },
    setValue,
    watch,
    handleSubmit,
    getValues,
    trigger,
    clearErrors,
    setError,
  } = useFormContext();

  const [selectedFile, setSelectedFile] = useState(null);
  const [currentMode, setCurrentMode] = useState(mode);
  const [originalMode, setOriginalMode] = useState(mode);
  const [apiError, setApiError] = useState(null);
  const [showErrorDialog, setShowErrorDialog] = useState(false);

  const watchedRequisitionType = watch("requisition_type_id");
  const watchedPositionId = watch("position_id");

  const [
    getPositions,
    { data: positionsData = [], isLoading: positionsLoading },
  ] = useLazyGetAllPositionsQuery();
  const [
    getJobLevels,
    { data: jobLevelsData = [], isLoading: jobLevelsLoading },
  ] = useLazyGetAllJobLevelsQuery();

  const { data: employeesData = [] } = useGetAllEmployeesToBeReplacedQuery(
    {
      position_id: watchedPositionId?.id,
      requisition_type_id: watchedRequisitionType?.id,
      pagination: false,
    },
    {
      skip: !watchedPositionId?.id || !watchedRequisitionType?.id,
    }
  );

  useEffect(() => {
    getPositions()
      .unwrap()
      .catch((error) => {
        if (
          error?.data?.message ===
          "No requestable positions found for this user."
        ) {
          setApiError(error.data.message);
          setShowErrorDialog(true);
        }
      });
    getJobLevels();
  }, [getPositions, getJobLevels]);

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

  const requisitions = [];

  const employees = Array.isArray(employeesData?.result?.data)
    ? employeesData.result.data
    : Array.isArray(employeesData?.result)
    ? employeesData.result
    : Array.isArray(employeesData)
    ? employeesData
    : [];

  const isDataLoading = positionsLoading || jobLevelsLoading;
  const areDropdownsReady = positions.length > 0 && jobLevels.length > 0;

  const findOptionById = (options, id) => {
    if (!id || !options?.length) return null;
    return options.find((option) => option.id === id) || null;
  };

  const isAdditionalManpower = () => {
    if (!watchedRequisitionType) return false;
    return watchedRequisitionType.name === "ADDITIONAL MANPOWER";
  };

  const isEmployeeFieldEnabled = () => {
    const hasRequiredFields =
      watchedPositionId?.id && watchedRequisitionType?.id;

    if (isAdditionalManpower()) {
      return false;
    }

    return hasRequiredFields;
  };

  const shouldEnableEditButton = () => {
    if (!selectedEntry || !selectedEntry.actions) {
      return false;
    }
    return selectedEntry.actions.can_update === true;
  };

  const shouldEnableResubmitButton = () => {
    if (!selectedEntry || !selectedEntry.actions) {
      return false;
    }
    return selectedEntry.actions.can_resubmit === true;
  };

  const populateFormWithEntry = (entry) => {
    if (!entry || !positions.length || !jobLevels.length) {
      return;
    }

    let submittableData = null;

    if (entry.submittable) {
      submittableData = entry.submittable;
    } else if (entry.data) {
      submittableData = entry.data;
    } else if (entry.attributes) {
      submittableData = entry.attributes;
    } else {
      submittableData = entry;
    }

    if (!submittableData) {
      return;
    }

    const foundPosition = findOptionById(
      positions,
      submittableData.position_id
    );
    const foundJobLevel = findOptionById(
      jobLevels,
      submittableData.job_level_id
    );
    const foundRequisition = findOptionById(
      requisitions,
      submittableData.requisition_type_id
    );

    if (foundPosition)
      setValue("position_id", foundPosition, { shouldValidate: false });
    if (foundJobLevel)
      setValue("job_level_id", foundJobLevel, { shouldValidate: false });
    if (foundRequisition)
      setValue("requisition_type_id", foundRequisition, {
        shouldValidate: false,
      });

    setValue("employment_type", submittableData.employment_type || "", {
      shouldValidate: false,
    });
    setValue("expected_salary", submittableData.expected_salary || "", {
      shouldValidate: false,
    });
    setValue("justification", submittableData.justification || "", {
      shouldValidate: false,
    });
    setValue("remarks", submittableData.remarks || "", {
      shouldValidate: false,
    });

    if (
      currentMode === "view" &&
      submittableData.manpower_attachment_filename
    ) {
      setValue(
        "manpower_form_attachment",
        submittableData.manpower_attachment_filename || null,
        { shouldValidate: false }
      );
      setSelectedFile({
        name: submittableData.manpower_attachment_filename,
        url:
          submittableData.manpower_attachment ||
          submittableData.manpower_form_attachment,
      });
    } else if (currentMode === "edit") {
      setValue("manpower_form_attachment", null, { shouldValidate: false });
      setSelectedFile(null);
    }

    clearErrors();
  };

  const initializeForm = () => {
    if (currentMode === "create") {
      reset(formSubmissionDefaultValues);
      setSelectedFile(null);
    } else if (
      selectedEntry &&
      (currentMode === "view" || currentMode === "edit") &&
      positions.length > 0 &&
      jobLevels.length > 0
    ) {
      populateFormWithEntry(selectedEntry);
    }
  };

  useEffect(() => {
    setCurrentMode(mode);
    setOriginalMode(mode);
  }, [mode]);

  useEffect(() => {
    if (areDropdownsReady && !isDataLoading) {
      initializeForm();
    }
  }, [currentMode, areDropdownsReady, isDataLoading, selectedEntry?.id]);

  useEffect(() => {
    if (
      selectedEntry &&
      employees.length > 0 &&
      (currentMode === "view" || currentMode === "edit")
    ) {
      const submittableData =
        selectedEntry.submittable ||
        selectedEntry.data ||
        selectedEntry.attributes ||
        selectedEntry;
      const foundEmployee = findOptionById(
        employees,
        submittableData.employee_to_be_replaced_id
      );
      if (foundEmployee) {
        setValue("employee_to_be_replaced_id", foundEmployee, {
          shouldValidate: false,
        });
      }
    }
  }, [employees.length, selectedEntry, currentMode, setValue]);

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
    }
  };

  const handleCancelEdit = () => {
    setCurrentMode(originalMode);
    if (onModeChange) {
      onModeChange(originalMode);
    }

    if (selectedEntry && (originalMode === "view" || originalMode === "edit")) {
      populateFormWithEntry(selectedEntry);
    }
  };

  const handleClose = () => {
    setCurrentMode("create");
    setOriginalMode("create");
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
    } else if (!isEmployeeFieldEnabled()) {
      setValue("employee_to_be_replaced_id", null);
    }
  }, [
    watchedRequisitionType,
    watchedPositionId,
    setValue,
    isAdditionalManpower,
    isEmployeeFieldEnabled,
  ]);

  const handleFileChange = (file) => {
    setSelectedFile(file);
    setValue("manpower_form_attachment", file);
  };

  const onSubmit = (data) => {
    if (currentMode === "create") {
      const hasFile = selectedFile && selectedFile instanceof File;

      if (hasFile) {
        const formData = new FormData();

        formData.append("mode", currentMode);

        if (data.position_id?.id) {
          formData.append("position_id", data.position_id.id);
        }

        if (data.job_level_id?.id) {
          formData.append("job_level_id", data.job_level_id.id);
        }

        if (data.employment_type && data.employment_type.trim() !== "") {
          formData.append("employment_type", data.employment_type);
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

        formData.append("manpower_form_attachment", selectedFile);

        if (onSave) {
          onSave(formData, currentMode);
        }
      } else {
        const jsonData = {
          mode: currentMode,
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

        if (data.employee_to_be_replaced_id?.id && !isAdditionalManpower()) {
          jsonData.employee_to_be_replaced_id =
            data.employee_to_be_replaced_id.id;
        }

        if (data.justification && data.justification.trim() !== "") {
          jsonData.justification = data.justification;
        }

        if (data.remarks && data.remarks.trim() !== "") {
          jsonData.remarks = data.remarks;
        }

        if (onSave) {
          onSave(jsonData, currentMode);
        }
      }
    } else if (currentMode === "edit" && selectedEntry?.id) {
      const submissionData = {
        id: selectedEntry.id,
        data: {},
      };

      if (data.position_id?.id) {
        submissionData.data.position_id = data.position_id.id;
      }

      if (data.job_level_id?.id) {
        submissionData.data.job_level_id = data.job_level_id.id;
      }

      if (data.employment_type && data.employment_type.trim() !== "") {
        submissionData.data.employment_type = data.employment_type;
      }

      if (data.expected_salary) {
        submissionData.data.expected_salary = data.expected_salary;
      }

      if (data.requisition_type_id?.id) {
        submissionData.data.requisition_type_id = data.requisition_type_id.id;
      }

      if (data.employee_to_be_replaced_id?.id && !isAdditionalManpower()) {
        submissionData.data.employee_to_be_replaced_id =
          data.employee_to_be_replaced_id.id;
      }

      if (data.justification && data.justification.trim() !== "") {
        submissionData.data.justification = data.justification;
      }

      if (data.remarks && data.remarks.trim() !== "") {
        submissionData.data.remarks = data.remarks;
      }

      if (selectedFile && selectedFile instanceof File) {
        submissionData.data.manpower_form_attachment = selectedFile;
      }

      if (onSave) {
        onSave(submissionData, currentMode);
      }
    }
  };

  const handleResubmit = () => {
    if (onResubmit && selectedEntry) {
      onResubmit(selectedEntry.id);
    }
  };

  const handleSaveClick = async () => {
    const isValid = await trigger();

    if (isValid) {
      handleSubmit(onSubmit)();
    }
  };

  return (
    <>
      <ErrorDialog
        open={showErrorDialog}
        message={apiError}
        onClose={handleErrorDialogClose}
      />

      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          pb: 1,
          backgroundColor: "#fff",
        }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <AssignmentIcon sx={{ color: "rgb(33, 61, 112)" }} />
          <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
            {getModalTitle()}
          </Typography>
          {isViewMode && shouldEnableEditButton() && (
            <Tooltip title="EDIT FORM" arrow placement="top">
              <IconButton
                onClick={() => handleModeChange("edit")}
                disabled={isLoading}
                size="small"
                sx={{
                  ml: 1,
                  padding: "8px",
                  "&:hover": {
                    backgroundColor: "rgba(0, 136, 32, 0.08)",
                    transform: "scale(1.1)",
                    transition: "all 0.2s ease-in-out",
                  },
                }}>
                <EditIcon
                  sx={{
                    fontSize: "20px",
                    "& path": {
                      fill: isLoading
                        ? "rgba(0, 0, 0, 0.26)"
                        : "rgba(0, 136, 32, 1)",
                    },
                  }}
                />
              </IconButton>
            </Tooltip>
          )}
          {isEditMode && originalMode === "view" && (
            <Tooltip title="CANCEL EDIT">
              <IconButton
                onClick={handleCancelEdit}
                disabled={isLoading}
                size="small"
                sx={{
                  ml: 1,
                  padding: "8px",
                  "&:hover": {
                    backgroundColor: "rgba(235, 0, 0, 0.08)",
                    transform: "scale(1.1)",
                    transition: "all 0.2s ease-in-out",
                  },
                }}>
                <EditOffIcon
                  sx={{
                    fontSize: "20px",
                    "& path": {
                      fill: "rgba(235, 0, 0, 1)",
                    },
                  }}
                />
              </IconButton>
            </Tooltip>
          )}
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <IconButton
            onClick={handleClose}
            sx={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              backgroundColor: "#fff",
              "&:hover": {
                backgroundColor: "#f5f5f5",
              },
              transition: "all 0.2s ease-in-out",
            }}>
            <CloseIcon
              sx={{
                fontSize: "18px",
                color: "#333",
              }}
            />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent
        sx={{
          backgroundColor: "#fff",
          minHeight: "400px",
          position: "relative",
        }}>
        {hasBackendError && (
          <Box
            sx={{
              mb: 2,
              p: 2,
              backgroundColor: "#ffebee",
              border: "1px solid #f44336",
              borderRadius: 1,
            }}>
            <Typography variant="body2" color="error" sx={{ fontWeight: 500 }}>
              Error: The manpower form attachment field must be a file of type:
              pdf, doc, docx, jpg, png.
            </Typography>
          </Box>
        )}

        {!isCreateMode && selectedEntry && (
          <Box sx={{ mb: 2, p: 0.5, borderRadius: 1 }}>
            {selectedEntry.updated_at && (
              <Typography variant="body2" color="text.secondary">
                Last Updated:{" "}
                {dayjs(selectedEntry.updated_at).format("MMM DD, YYYY HH:mm")}
              </Typography>
            )}
          </Box>
        )}

        <FormSubmissionFields
          mode={currentMode}
          selectedEntry={selectedEntry}
          onFileChange={handleFileChange}
          selectedFile={selectedFile}
          disabled={isDataLoading || !areDropdownsReady}
          isEmployeeFieldEnabled={isEmployeeFieldEnabled()}
        />
      </DialogContent>

      <DialogActions
        sx={{
          px: 3,
          py: 2,
          backgroundColor: "#fff",
          justifyContent: "flex-end",
        }}>
        {isViewMode && (
          <Box>
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
          </Box>
        )}

        {(isCreateMode || isEditMode) && (
          <Box>
            <Button
              onClick={handleSaveClick}
              variant="contained"
              disabled={isLoading}
              startIcon={
                isLoading ? (
                  <CircularProgress size={16} />
                ) : isCreateMode ? (
                  <AddIcon />
                ) : (
                  <EditIcon />
                )
              }
              sx={{
                backgroundColor: "#4CAF50 !important",
                color: "white !important",
                fontWeight: 600,
                textTransform: "uppercase",
                px: 3,
                py: 1,
                borderRadius: "8px",
                border: "none !important",
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                "&:hover": {
                  backgroundColor: "#45a049 !important",
                  border: "none !important",
                },
                "&:disabled": {
                  backgroundColor: "#cccccc !important",
                  color: "#666666 !important",
                  border: "none !important",
                },
              }}>
              {isLoading ? "Saving..." : isCreateMode ? "Create" : "Update"}
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
    mode: "onChange",
  });

  const handleClose = () => {
    methods.reset(formSubmissionDefaultValues);
    onClose();
  };

  const handleModeChange = (newMode) => {
    if (newMode === "create") {
      methods.reset(formSubmissionDefaultValues);
    }

    if (onModeChange) {
      onModeChange(newMode);
    }
  };

  const handleResubmit = (submissionId) => {
    if (onResubmit) {
      onResubmit(submissionId);
    }
  };

  useEffect(() => {
    const hasFile =
      selectedEntry?.submittable?.manpower_attachment_filename ||
      selectedEntry?.data?.manpower_attachment_filename ||
      selectedEntry?.attributes?.manpower_attachment_filename ||
      selectedEntry?.manpower_attachment_filename
        ? true
        : false;
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
          sx: {
            minHeight: "70vh",
            maxHeight: "90vh",
          },
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
          />
        </FormProvider>
      </Dialog>
    </LocalizationProvider>
  );
};

FormSubmissionModal.displayName = "FormSubmissionModal";

export default FormSubmissionModal;
