import React, { useState, useEffect, useRef } from "react";
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
  Divider,
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
import DataChangeModalFields from "./DataChangeModalFields";

const StyledDialog = styled(Dialog)(({ theme }) => ({
  "& .MuiDialog-paper": {
    maxWidth: "880px",
    width: "100%",
    maxHeight: "90vh",
    display: "flex",
    flexDirection: "column",
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
  selectedEntry = null,
  isLoading = false,
  mode = "view",
  onModeChange,
  onRefreshDetails,
}) => {
  const {
    handleSubmit,
    reset,
    watch,
    trigger,
    setValue,
    getValues,
    formState: { isValid },
  } = useFormContext();

  const [getFormDataForSubmission, setGetFormDataForSubmission] =
    useState(null);
  const [currentMode, setCurrentMode] = useState(mode);
  const [originalMode, setOriginalMode] = useState(mode);
  const [formInitialized, setFormInitialized] = useState(false);
  const [lastEntryId, setLastEntryId] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // Add a ref to track the initial mode when modal opens
  const initialModeRef = useRef(mode);

  const watchedAttachments = watch("attachments");

  const shouldEnableEditButton = () => {
    if (!selectedEntry || !selectedEntry.result?.actions) {
      return false;
    }
    return selectedEntry.result.actions.can_update === true;
  };

  const shouldEnableResubmitButton = () => {
    if (!selectedEntry || !selectedEntry.result?.actions) {
      return false;
    }
    return selectedEntry.result.actions.can_resubmit === true;
  };

  const handleModeChange = (newMode) => {
    setCurrentMode(newMode);
    if (onModeChange) {
      onModeChange(newMode);
    }

    // Reset form initialization when switching to edit mode
    if (newMode === "edit" && selectedEntry) {
      setFormInitialized(false);
    }
  };

  const handleCancelEdit = () => {
    setCurrentMode(originalMode);
    if (onModeChange) {
      onModeChange(originalMode);
    }

    // Force re-initialization when canceling edit
    if (selectedEntry) {
      setFormInitialized(false);
    }
  };

  const handleClose = () => {
    // Reset all state completely
    setCurrentMode("view");
    setOriginalMode("view");
    setFormInitialized(false);
    setLastEntryId(null);
    setIsUpdating(false);
    initialModeRef.current = "view";
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
        return;
      }

      const isFormValid = await trigger();

      if (!isFormValid) {
        return;
      }

      if (!getFormDataForSubmission) {
        alert("Form data function not available. Please try again.");
        return;
      }

      const formData = getFormDataForSubmission();

      if (!formData) {
        alert("Failed to create form data. Please try again.");
        return;
      }

      await onSave(formData, currentMode, selectedEntry?.result?.id);

      // After successful save, handle mode switching and data refresh
      if (currentMode === "edit") {
        // Switch back to view mode and force data refresh
        setCurrentMode("view");
        setOriginalMode("view");
        setFormInitialized(false);

        if (onRefreshDetails) {
          // Small delay to ensure the API call completes before refetch
          setTimeout(() => {
            onRefreshDetails();
          }, 200);
        }
      }
    } catch (error) {
      alert("An error occurred while submitting the form. Please try again.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleResubmit = async () => {
    if (selectedEntry?.result?.id) {
      try {
        setIsUpdating(true);
        const formData = new FormData();
        formData.append("id", selectedEntry.result.id);
        formData.append("_method", "POST");

        await onSave(formData, "resubmit", selectedEntry.result.id);

        // Force refresh after resubmit
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

  const safeRenderText = (text) => {
    if (typeof text === "string") return text;
    if (typeof text === "number") return text.toString();
    if (text && typeof text === "object") return "";
    return text || "";
  };

  // FIXED: Reset form initialization and mode when modal opens
  useEffect(() => {
    if (open) {
      // Store the initial mode when modal opens
      initialModeRef.current = mode;
      setCurrentMode(mode);
      setOriginalMode(mode);

      // Always reset form initialization when modal opens with new props
      setFormInitialized(false);

      // Reset lastEntryId to force re-initialization
      setLastEntryId(null);
    }
  }, [open, mode]);

  // FIXED: Reset form initialization when selectedEntry changes or data updates
  useEffect(() => {
    if (!open) return; // Only run when modal is open

    const currentEntryId = selectedEntry?.result?.id;
    const currentUpdatedAt = selectedEntry?.result?.updated_at;

    // Reset form when entry changes or when data is updated
    if (currentEntryId !== lastEntryId || (currentEntryId && selectedEntry)) {
      setFormInitialized(false);
      setLastEntryId(currentEntryId);
    }
  }, [
    open,
    selectedEntry?.result?.id,
    selectedEntry?.result?.updated_at,
    lastEntryId,
  ]);

  // FIXED: Force re-initialization when switching back to view mode after edit
  useEffect(() => {
    if (open && currentMode === "view" && originalMode === "edit") {
      setFormInitialized(false);
    }
  }, [open, currentMode, originalMode]);

  // FIXED: Initialize form for create mode - only when modal is open and mode is create
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
      setFormInitialized(true);
    }
  }, [open, currentMode, formInitialized, reset]);

  // FIXED: Initialize form for view/edit modes - only when modal is open and has selectedEntry
  useEffect(() => {
    if (
      open &&
      (currentMode === "view" || currentMode === "edit") &&
      selectedEntry &&
      !formInitialized
    ) {
      const submittable = selectedEntry.result?.submittable;
      const submittedBy = selectedEntry.result?.submitted_by;

      if (submittable) {
        const formData = {
          form_id: { id: selectedEntry.result.form?.id || 4 },
          employee_id: {
            id: submittable.employee_id,
            general_info: {
              full_name: submittedBy?.full_name || "Unknown Employee",
            },
            full_name: submittedBy?.full_name || "Unknown Employee",
          },
          movement_type_id: {
            id: submittable.movement_type_id || 1,
            name: "Data Change",
          },
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
                is_new_file: false,
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
  }, [open, currentMode, selectedEntry, formInitialized, setValue]);

  const isReadOnly = currentMode === "view";
  const isCreateMode = currentMode === "create";
  const isEditMode = currentMode === "edit";
  const isViewMode = currentMode === "view";
  const isProcessing = isLoading || isUpdating;

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <StyledDialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <StyledDialogTitle>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <AssignmentIcon sx={{ color: "rgb(33, 61, 112)" }} />
            <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
              {safeRenderText(getModalTitle())}
            </Typography>
            {isViewMode && shouldEnableEditButton() && (
              <Tooltip title="EDIT FORM" arrow placement="top">
                <IconButton
                  onClick={() => handleModeChange("edit")}
                  disabled={isProcessing}
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
                        fill: isProcessing
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
        </StyledDialogTitle>

        <form
          onSubmit={handleSubmit(onSubmit)}
          style={{ display: "flex", flexDirection: "column", flex: 1 }}>
          <DialogContent
            sx={{
              backgroundColor: "#fff",
              flex: 1,
              padding: "0px 10px",
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
            }}>
            {!isCreateMode && selectedEntry && (
              <Box sx={{ mb: 2, p: 0.5, borderRadius: 1 }}>
                {selectedEntry.result?.updated_at && (
                  <Typography variant="body2" color="text.secondary">
                    Last Updated:{" "}
                    {dayjs(selectedEntry.result.updated_at).format(
                      "MMM DD, YYYY HH:mm"
                    )}
                  </Typography>
                )}
              </Box>
            )}

            <DataChangeModalFields
              isLoading={isProcessing}
              mode={currentMode}
              onFormDataCreate={handleFormDataCallback}
              selectedEntry={selectedEntry}
              formInitialized={formInitialized}
              key={`${selectedEntry?.result?.id}-${currentMode}-${formInitialized}-${selectedEntry?.result?.updated_at}`}
            />
          </DialogContent>

          <DialogActions
            sx={{
              px: 3,
              py: 2,
              backgroundColor: "#fff",
              justifyContent: "flex-end",
              flexShrink: 0,
              borderTop: "1px solid #e0e0e0",
            }}>
            {isViewMode && (
              <Box>
                <Button
                  onClick={handleResubmit}
                  variant="contained"
                  disabled={!shouldEnableResubmitButton() || isProcessing}
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
                  {safeRenderText("Resubmit")}
                </Button>
              </Box>
            )}

            {(isCreateMode || isEditMode) && (
              <CreateButton type="submit" disabled={isProcessing}>
                {isProcessing ? (
                  <CircularProgress size={16} />
                ) : (
                  <>
                    {isCreateMode ? (
                      <AddIcon sx={{ fontSize: 16 }} />
                    ) : (
                      <EditIcon sx={{ fontSize: 16 }} />
                    )}
                    {isEditMode ? "UPDATE" : "CREATE"}
                  </>
                )}
              </CreateButton>
            )}
          </DialogActions>
        </form>
      </StyledDialog>
    </LocalizationProvider>
  );
};

export default DataChangeModal;
