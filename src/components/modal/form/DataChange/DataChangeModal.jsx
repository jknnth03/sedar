import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Button,
  Typography,
  IconButton,
  CircularProgress,
  Tooltip,
} from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import {
  Close as CloseIcon,
  Assignment as AssignmentIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Send as SendIcon,
} from "@mui/icons-material";
import EditOffIcon from "@mui/icons-material/EditOff";
import { useFormContext } from "react-hook-form";
import { styled } from "@mui/material/styles";
import dayjs from "dayjs";
import { useLazyGetAllDataChangeEmployeeQuery } from "../../../../features/api/forms/datachangeApi";
import DataChangeModalFields from "./DataChangeModalFields";

const StyledDialog = styled(Dialog)(({ theme }) => ({
  "& .MuiDialog-paper": {
    maxWidth: "900px",
    width: "100%",
    height: "70vh",
    maxHeight: "70vh",
    display: "flex",
    flexDirection: "column",
    position: "relative",
  },
}));

const StyledDialogTitle = styled(DialogTitle)(({ theme }) => ({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  backgroundColor: "#fff",
  flexShrink: 0,
  padding: "16px 24px",
  "& .MuiTypography-root": {
    fontSize: "1.25rem",
    fontWeight: 600,
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
}));

const StyledDialogContent = styled(DialogContent)(({ theme }) => ({
  backgroundColor: "#fff",
  flex: 1,
  padding: "0px 10px",
  overflow: "auto",
  "&::-webkit-scrollbar": {
    width: "8px",
  },
  "&::-webkit-scrollbar-track": {
    backgroundColor: "#f1f1f1",
    borderRadius: "4px",
  },
  "&::-webkit-scrollbar-thumb": {
    backgroundColor: "#c1c1c1",
    borderRadius: "4px",
    "&:hover": {
      backgroundColor: "#a1a1a1",
    },
  },
}));

const StyledDialogActions = styled(DialogActions)(({ theme }) => ({
  backgroundColor: "#fff",
  justifyContent: "flex-end",
  flexShrink: 0,
  padding: "16px 24px",
  position: "sticky",
  bottom: 0,
  zIndex: 1000,
}));

const CreateButton = styled(Button)(({ theme }) => ({
  backgroundColor: "#4CAF50 !important",
  color: "white !important",
  fontWeight: 600,
  textTransform: "uppercase",
  padding: "12px 20px",
  borderRadius: "8px",
  fontSize: "0.875rem",
  border: "none !important",
  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
  minWidth: "120px",
  height: "44px",
  display: "flex",
  alignItems: "center",
  gap: "8px",
  "&:hover": {
    backgroundColor: "#45a049 !important",
    border: "none !important",
  },
  "&:disabled": {
    backgroundColor: "#cccccc !important",
    color: "#666666 !important",
    border: "none !important",
  },
}));

const generateUniqueId = (prefix = "attachment") => {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

const DataChangeModal = ({
  open,
  onClose,
  onSave,
  onResubmit,
  selectedEntry = null,
  isLoading = false,
  mode = "view",
  onModeChange,
  onRefreshDetails,
  onSuccessfulSave,
  onCreateMDA,
}) => {
  const { handleSubmit, reset, trigger, setValue } = useFormContext();

  const [getFormDataForSubmission, setGetFormDataForSubmission] =
    useState(null);
  const [currentMode, setCurrentMode] = useState(mode);
  const [originalMode, setOriginalMode] = useState(mode);
  const [formInitialized, setFormInitialized] = useState(false);
  const [lastEntryId, setLastEntryId] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [employeeData, setEmployeeData] = useState(null);
  const [editingEntryId, setEditingEntryId] = useState(null);

  const [triggerGetEmployee, { data: fetchedEmployeeData }] =
    useLazyGetAllDataChangeEmployeeQuery();

  useEffect(() => {
    if (open && selectedEntry?.result?.id) {
      setEditingEntryId(selectedEntry.result.id);
    }
  }, [open, selectedEntry?.result?.id]);

  const shouldEnableEditButton = () => {
    return selectedEntry?.result?.actions?.can_update === true;
  };

  const shouldEnableResubmitButton = () => {
    return selectedEntry?.result?.actions?.can_resubmit === true;
  };

  const shouldShowCreateMDAButton = () => {
    return selectedEntry?.result?.status === "PENDING MDA CREATION";
  };

  const handleModeChange = (newMode) => {
    setCurrentMode(newMode);
    if (onModeChange) {
      onModeChange(newMode);
    }
    if (newMode === "edit") {
      setFormInitialized(false);
    }
  };

  const handleCancelEdit = () => {
    setCurrentMode(originalMode);
    if (onModeChange) {
      onModeChange(originalMode);
    }
    setFormInitialized(false);
  };

  const handleClose = () => {
    setCurrentMode("view");
    setOriginalMode("view");
    setFormInitialized(false);
    setLastEntryId(null);
    setIsUpdating(false);
    setEmployeeData(null);
    setEditingEntryId(null);
    reset();
    onClose();
  };

  const handleFormDataCallback = (getFormDataFn) => {
    setGetFormDataForSubmission(() => getFormDataFn);
  };

  const getModalTitle = () => {
    switch (currentMode) {
      case "create":
        return "CREATE DATA CHANGE";
      case "view":
        return "VIEW DATA CHANGE";
      case "edit":
        return "EDIT DATA CHANGE";
      default:
        return "DATA CHANGE";
    }
  };

  const handleSuccessfulSaveComplete = () => {
    setCurrentMode("view");
    setOriginalMode("view");
    setFormInitialized(false);
    if (onRefreshDetails) {
      setTimeout(() => {
        onRefreshDetails();
      }, 200);
    }
  };

  useEffect(() => {
    if (onSuccessfulSave && typeof onSuccessfulSave === "function") {
      onSuccessfulSave(handleSuccessfulSaveComplete);
    }
  }, [onSuccessfulSave]);

  const onSubmit = async (data) => {
    try {
      setIsUpdating(true);

      const attachments = data.attachments || [];
      const hasValidAttachment = attachments.some(
        (att) =>
          att.file_attachment instanceof File ||
          (att.existing_file_name && !att.is_new_file)
      );

      if (!hasValidAttachment) {
        alert("Please upload at least one attachment before submitting.");
        setIsUpdating(false);
        return;
      }

      const isFormValid = await trigger();
      if (!isFormValid) {
        setIsUpdating(false);
        return;
      }

      if (!getFormDataForSubmission) {
        alert("Form data function not available. Please try again.");
        setIsUpdating(false);
        return;
      }

      const formData = getFormDataForSubmission();
      if (!formData) {
        alert("Failed to create form data. Please try again.");
        setIsUpdating(false);
        return;
      }

      const entryIdToUse =
        currentMode === "edit"
          ? editingEntryId || selectedEntry?.result?.id
          : null;

      await onSave(formData, currentMode, entryIdToUse);

      if (currentMode === "create") {
        handleSuccessfulSaveComplete();
      }
    } catch (error) {
      alert("An error occurred while submitting the form. Please try again.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleResubmit = async () => {
    if (editingEntryId && onResubmit) {
      try {
        setIsUpdating(true);
        await onResubmit(editingEntryId);
        setFormInitialized(false);
        if (onRefreshDetails) {
          setTimeout(() => {
            onRefreshDetails();
          }, 200);
        }
      } catch (error) {
        alert("An error occurred while resubmitting. Please try again.");
      } finally {
        setIsUpdating(false);
      }
    }
  };

  const handleCreateMDAClick = () => {
    if (onCreateMDA && selectedEntry?.result) {
      const submissionData = {
        ...selectedEntry.result,
        id: selectedEntry.result.submittable?.id || selectedEntry.result.id,
      };
      onCreateMDA(submissionData);
      setTimeout(() => {
        handleClose();
      }, 100);
    }
  };
  useEffect(() => {
    if (open) {
      setCurrentMode(mode);
      setOriginalMode(mode);
      setFormInitialized(false);
      setLastEntryId(null);
    }
  }, [open, mode]);

  useEffect(() => {
    if (!open) return;
    const currentId = selectedEntry?.result?.id;
    if (currentId !== lastEntryId) {
      setFormInitialized(false);
      setLastEntryId(currentId);
    }
  }, [open, selectedEntry?.result?.id, lastEntryId]);

  useEffect(() => {
    if (open && currentMode === "create" && !formInitialized) {
      reset({
        form_id: { id: 4 },
        employee_id: null,
        movement_type_id: null,
        effective_date: null,
        to_position_id: null,
        to_job_rate: null,
        justification: "",
        remarks: "",
        attachments: [],
      });
      setEditingEntryId(null);
      setFormInitialized(true);
    }
  }, [open, currentMode, formInitialized, reset]);

  useEffect(() => {
    if (
      open &&
      (currentMode === "view" || currentMode === "edit") &&
      selectedEntry &&
      !formInitialized
    ) {
      const submittable = selectedEntry.result?.submittable;
      const employeeId = submittable?.employee_id;
      if (employeeId && !employeeData) {
        triggerGetEmployee({
          page: 1,
          per_page: 1000,
          status: "active",
          employee_id: employeeId,
        });
      }
    }
  }, [
    open,
    currentMode,
    selectedEntry,
    formInitialized,
    employeeData,
    triggerGetEmployee,
  ]);

  useEffect(() => {
    if (fetchedEmployeeData && !employeeData) {
      const employees = Array.isArray(fetchedEmployeeData)
        ? fetchedEmployeeData
        : fetchedEmployeeData.result?.data ||
          fetchedEmployeeData.result ||
          fetchedEmployeeData.data ||
          [];
      if (employees.length > 0) {
        setEmployeeData(employees[0]);
      }
    }
  }, [fetchedEmployeeData, employeeData]);

  useEffect(() => {
    if (
      open &&
      (currentMode === "view" || currentMode === "edit") &&
      selectedEntry &&
      !formInitialized
    ) {
      const submittable = selectedEntry.result?.submittable;
      const submittedBy = selectedEntry.result?.submitted_by;
      const employee = selectedEntry.result?.employee;

      if (submittable) {
        const employeeInfo = employeeData || employee || submittedBy || {};
        const employeeName =
          employeeInfo.full_name ||
          employeeInfo.employee_name ||
          employeeInfo.name ||
          submittedBy?.full_name ||
          "Unknown Employee";

        const formData = {
          form_id: { id: selectedEntry.result.form?.id || 4 },
          employee_id: {
            id: submittable.employee_id || employeeInfo.id,
            employee_name: employeeName,
            full_name: employeeName,
            position_title:
              employeeData?.position_title ||
              employeeInfo.position_title ||
              "N/A",
            department:
              employeeData?.department || employeeInfo.department || "N/A",
            sub_unit: employeeData?.sub_unit || employeeInfo.sub_unit || "N/A",
            schedule: employeeData?.schedule || employeeInfo.schedule || "N/A",
            general_info: { full_name: employeeName },
          },
          movement_type_id: submittable.movement_type
            ? {
                id: submittable.movement_type.id,
                name:
                  submittable.movement_type.name ||
                  submittable.movement_type.type_name,
              }
            : null,
          effective_date: submittable.effective_date
            ? dayjs(submittable.effective_date)
            : null,
          to_position_id: submittable.to_position
            ? {
                id: submittable.to_position.id,
                title: {
                  name:
                    submittable.to_position.title?.name || "Unknown Position",
                },
                name: submittable.to_position.title?.name || "Unknown Position",
              }
            : null,
          to_job_rate: submittable.to_job_rate || "",
          justification: submittable.justification || "",
          remarks: submittable.remarks || "",
        };

        Object.keys(formData).forEach((key) => {
          setValue(key, formData[key], { shouldValidate: false });
        });

        const attachmentsData = submittable.attachments || [];
        const attachmentFields =
          attachmentsData.length > 0
            ? attachmentsData.map((attachment) => ({
                id: generateUniqueId(),
                file_attachment: null,
                existing_file_name:
                  attachment.original_filename ||
                  attachment.file_path?.split("/").pop() ||
                  "Unknown file",
                existing_file_path: attachment.file_path,
                existing_file_id: attachment.id,
                is_new_file: false,
                keep_existing: true,
              }))
            : [
                {
                  id: generateUniqueId(),
                  file_attachment: null,
                  existing_file_name: null,
                  is_new_file: true,
                },
              ];

        setValue("attachments", attachmentFields, { shouldValidate: false });
        setFormInitialized(true);
      }
    }
  }, [
    open,
    currentMode,
    selectedEntry,
    formInitialized,
    setValue,
    employeeData,
  ]);

  const isProcessing = isLoading || isUpdating;

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <StyledDialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <StyledDialogTitle>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <AssignmentIcon sx={{ color: "rgb(33, 61, 112)" }} />
            <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
              {getModalTitle()}
            </Typography>
            {currentMode === "view" && (
              <Tooltip
                title={
                  shouldEnableEditButton() ? "EDIT FORM" : "Edit not available"
                }
                arrow
                placement="top">
                <span>
                  <IconButton
                    onClick={() => handleModeChange("edit")}
                    disabled={!shouldEnableEditButton() || isProcessing}
                    size="small"
                    sx={{
                      ml: 1,
                      padding: "8px",
                      "&:hover": {
                        backgroundColor:
                          shouldEnableEditButton() && !isProcessing
                            ? "rgba(0, 136, 32, 0.08)"
                            : "transparent",
                        transform:
                          shouldEnableEditButton() && !isProcessing
                            ? "scale(1.1)"
                            : "none",
                        transition: "all 0.2s ease-in-out",
                      },
                    }}>
                    <EditIcon
                      sx={{
                        fontSize: "20px",
                        "& path": {
                          fill:
                            shouldEnableEditButton() && !isProcessing
                              ? "rgba(0, 136, 32, 1)"
                              : "rgba(0, 0, 0, 0.26)",
                        },
                      }}
                    />
                  </IconButton>
                </span>
              </Tooltip>
            )}
            {currentMode === "edit" && originalMode === "view" && (
              <Tooltip title="CANCEL EDIT">
                <IconButton
                  onClick={handleCancelEdit}
                  disabled={isProcessing}
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
                      "& path": { fill: "rgba(235, 0, 0, 1)" },
                    }}
                  />
                </IconButton>
              </Tooltip>
            )}
          </Box>
          <IconButton
            onClick={handleClose}
            sx={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              backgroundColor: "#fff",
              "&:hover": { backgroundColor: "#f5f5f5" },
              transition: "all 0.2s ease-in-out",
            }}>
            <CloseIcon sx={{ fontSize: "18px", color: "#333" }} />
          </IconButton>
        </StyledDialogTitle>

        <form
          onSubmit={handleSubmit(onSubmit)}
          style={{ display: "flex", flexDirection: "column", flex: 1 }}>
          <StyledDialogContent>
            <DataChangeModalFields
              isLoading={isProcessing}
              mode={currentMode}
              onFormDataCreate={handleFormDataCallback}
              selectedEntry={selectedEntry}
              formInitialized={formInitialized}
              key={`${selectedEntry?.result?.id}-${currentMode}-${formInitialized}-${selectedEntry?.result?.updated_at}`}
            />
          </StyledDialogContent>

          <StyledDialogActions>
            {currentMode === "view" && shouldShowCreateMDAButton() && (
              <Button
                onClick={handleCreateMDAClick}
                variant="contained"
                disabled={isProcessing}
                startIcon={
                  isProcessing ? <CircularProgress size={16} /> : <AddIcon />
                }
                sx={{
                  backgroundColor: "#4CAF50",
                  color: "white",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  "&:hover": {
                    backgroundColor: "#45a049",
                  },
                  "&:disabled": {
                    backgroundColor: "rgba(76, 175, 80, 0.3)",
                    color: "rgba(255, 255, 255, 0.5)",
                  },
                  mr: 2,
                }}>
                {isProcessing ? "Processing..." : "Create MDA Form"}
              </Button>
            )}

            {currentMode === "view" &&
              selectedEntry?.result?.status !== "PENDING MDA CREATION" && (
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

            {(currentMode === "create" || currentMode === "edit") && (
              <CreateButton type="submit" disabled={isProcessing}>
                {isProcessing ? (
                  <CircularProgress size={16} />
                ) : (
                  <>
                    {currentMode === "create" ? (
                      <AddIcon sx={{ fontSize: 16 }} />
                    ) : (
                      <EditIcon sx={{ fontSize: 16 }} />
                    )}
                    {currentMode === "edit" ? "UPDATE" : "CREATE"}
                  </>
                )}
              </CreateButton>
            )}
          </StyledDialogActions>
        </form>
      </StyledDialog>
    </LocalizationProvider>
  );
};

export default DataChangeModal;
