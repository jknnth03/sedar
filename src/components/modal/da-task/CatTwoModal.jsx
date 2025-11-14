import React, { useState, useEffect, useCallback } from "react";
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
  Edit as EditIcon,
  Send as SendIcon,
  Save as SaveIcon,
} from "@mui/icons-material";
import EditOffIcon from "@mui/icons-material/EditOff";
import { useFormContext } from "react-hook-form";
import { styled } from "@mui/material/styles";
import dayjs from "dayjs";
import CatTwoModalFields from "./CatTwoModalFields";

const StyledDialog = styled(Dialog)(({ theme }) => ({
  "& .MuiDialog-paper": {
    maxWidth: "920px",
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

const SubmitButton = styled(Button)(({ theme }) => ({
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

const DraftButton = styled(Button)(({ theme }) => ({
  backgroundColor: "#2196F3 !important",
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
    backgroundColor: "#1976D2 !important",
    border: "none !important",
  },
  "&:disabled": {
    backgroundColor: "#cccccc !important",
    color: "#666666 !important",
    border: "none !important",
  },
}));

const CatTwoModal = ({
  open,
  onClose,
  onSave,
  onSaveAsDraft,
  onResubmit,
  selectedEntry = null,
  isLoading = false,
  mode = "view",
  onModeChange,
  onRefreshDetails,
  onSuccessfulSave,
}) => {
  const { handleSubmit, reset, trigger, setValue, getValues } =
    useFormContext();

  const [getFormDataForSubmission, setGetFormDataForSubmission] =
    useState(null);
  const [currentMode, setCurrentMode] = useState(mode);
  const [originalMode, setOriginalMode] = useState(mode);
  const [formInitialized, setFormInitialized] = useState(false);
  const [lastEntryId, setLastEntryId] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [editingEntryId, setEditingEntryId] = useState(null);

  useEffect(() => {
    if (open && selectedEntry?.id) {
      setEditingEntryId(selectedEntry.id);
    }
  }, [open, selectedEntry?.id]);

  const shouldShowEditButton = () => {
    const status = selectedEntry?.status;
    if (
      status === "APPROVED" ||
      status === "CANCELLED" ||
      status === "FINAL_COMPLETE" ||
      status === "FOR_APPROVAL"
    ) {
      return false;
    }
    return true;
  };

  const shouldShowResubmitButton = () => {
    const status = selectedEntry?.status;
    return status === "AWAITING_RESUBMISSION";
  };

  const shouldShowActionButtons = () => {
    const status = selectedEntry?.status;
    return status !== "FOR_APPROVAL";
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
    setEditingEntryId(null);
    setGetFormDataForSubmission(null);
    reset();
    onClose();
  };

  const handleFormDataCallback = useCallback((getFormDataFn) => {
    setGetFormDataForSubmission(() => getFormDataFn);
  }, []);

  const getModalTitle = () => {
    switch (currentMode) {
      case "view":
        return "VIEW CAT 2 SUBMISSION";
      case "edit":
        return "EDIT CAT 2 SUBMISSION";
      default:
        return "CAT 2 SUBMISSION";
    }
  };

  const handleSuccessfulSaveComplete = useCallback(() => {
    setCurrentMode("view");
    setOriginalMode("view");
    setFormInitialized(false);
    if (onRefreshDetails) {
      setTimeout(() => {
        onRefreshDetails();
      }, 200);
    }
  }, [onRefreshDetails]);

  useEffect(() => {
    if (onSuccessfulSave && typeof onSuccessfulSave === "function") {
      onSuccessfulSave(handleSuccessfulSaveComplete);
    }
  }, [onSuccessfulSave, handleSuccessfulSaveComplete]);

  const onSubmit = async (formValues) => {
    try {
      setIsUpdating(true);

      const isFormValid = await trigger();
      if (!isFormValid) {
        console.error("Form validation failed");
        setIsUpdating(false);
        return;
      }

      if (!getFormDataForSubmission) {
        console.error("Form data function not available");
        alert("Form data function not available. Please try again.");
        setIsUpdating(false);
        return;
      }

      const formData = getFormDataForSubmission();

      if (!formData) {
        console.error("Failed to create form data");
        alert("Failed to create form data. Please try again.");
        setIsUpdating(false);
        return;
      }

      console.log("Submitting form data:", formData);

      const entryIdToUse = editingEntryId || selectedEntry?.id;
      console.log("Entry ID:", entryIdToUse);

      if (onSave) {
        await onSave(formData, currentMode, entryIdToUse);
      }
    } catch (error) {
      console.error("Submit error:", error);
      alert("An error occurred while submitting the form. Please try again.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSaveAsDraft = async () => {
    try {
      setIsUpdating(true);

      if (!getFormDataForSubmission) {
        console.error("Form data function not available");
        alert("Form data function not available. Please try again.");
        setIsUpdating(false);
        return;
      }

      const formData = getFormDataForSubmission();

      if (!formData) {
        console.error("Failed to create form data");
        alert("Failed to create form data. Please try again.");
        setIsUpdating(false);
        return;
      }

      const draftData = {
        ...formData,
        action: "save_draft",
      };

      console.log("Saving draft data:", draftData);

      const entryIdToUse = editingEntryId || selectedEntry?.id;
      console.log("Entry ID for draft:", entryIdToUse);

      if (onSaveAsDraft) {
        const success = await onSaveAsDraft(draftData, entryIdToUse);
        if (success) {
          handleClose();
        }
      }
    } catch (error) {
      console.error("Save draft error:", error);
      alert("An error occurred while saving as draft. Please try again.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleResubmit = async () => {
    const entryId = selectedEntry?.id;

    if (entryId && onResubmit) {
      try {
        setIsUpdating(true);
        const success = await onResubmit(entryId);
        if (success) {
          setFormInitialized(false);
          if (onRefreshDetails) {
            setTimeout(() => {
              onRefreshDetails();
            }, 200);
          }
        }
      } catch (error) {
        console.error("Resubmit error:", error);
      } finally {
        setIsUpdating(false);
      }
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
    const currentId = selectedEntry?.id;
    if (currentId !== lastEntryId) {
      setFormInitialized(false);
      setLastEntryId(currentId);
    }
  }, [open, selectedEntry?.id, lastEntryId]);

  useEffect(() => {
    if (
      open &&
      (currentMode === "view" || currentMode === "edit") &&
      selectedEntry &&
      !formInitialized
    ) {
      const formData = {
        date_assessed: selectedEntry.date_assessed
          ? dayjs(selectedEntry.date_assessed)
          : null,
        answers: selectedEntry.answers || [],
      };

      Object.keys(formData).forEach((key) => {
        setValue(key, formData[key], { shouldValidate: false });
      });

      setFormInitialized(true);
    }
  }, [open, currentMode, selectedEntry, formInitialized, setValue]);

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
            {currentMode === "view" && shouldShowEditButton() && (
              <Tooltip title="EDIT FORM" arrow placement="top">
                <IconButton
                  onClick={() => handleModeChange("edit")}
                  disabled={isProcessing}
                  size="small"
                  sx={{
                    ml: 1,
                    padding: "8px",
                    "&:hover": {
                      backgroundColor: !isProcessing
                        ? "rgba(0, 136, 32, 0.08)"
                        : "transparent",
                      transform: !isProcessing ? "scale(1.1)" : "none",
                      transition: "all 0.2s ease-in-out",
                    },
                  }}>
                  <EditIcon
                    sx={{
                      fontSize: "20px",
                      "& path": {
                        fill: !isProcessing
                          ? "rgba(0, 136, 32, 1)"
                          : "rgba(0, 0, 0, 0.26)",
                      },
                    }}
                  />
                </IconButton>
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
            <CatTwoModalFields
              isLoading={isProcessing}
              mode={currentMode}
              onFormDataCreate={handleFormDataCallback}
              selectedEntry={selectedEntry}
              formInitialized={formInitialized}
              key={`${
                selectedEntry?.id || "new"
              }-${currentMode}-${formInitialized}-${
                selectedEntry?.updated_at || ""
              }`}
            />
          </StyledDialogContent>

          <StyledDialogActions>
            {currentMode === "view" && shouldShowResubmitButton() && (
              <Button
                onClick={handleResubmit}
                variant="contained"
                disabled={isProcessing}
                startIcon={
                  isProcessing ? <CircularProgress size={16} /> : <SendIcon />
                }
                sx={{
                  backgroundColor: !isProcessing
                    ? "rgb(33, 61, 112)"
                    : "rgba(33, 61, 112, 0.3)",
                  "&:hover": {
                    backgroundColor: !isProcessing
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

            {currentMode === "edit" && shouldShowActionButtons() && (
              <>
                <DraftButton
                  onClick={handleSaveAsDraft}
                  disabled={isProcessing}
                  sx={{ mr: 2 }}>
                  {isProcessing ? (
                    <CircularProgress size={16} />
                  ) : (
                    <>
                      <SaveIcon sx={{ fontSize: 16 }} />
                      SAVE AS DRAFT
                    </>
                  )}
                </DraftButton>
                <SubmitButton type="submit" disabled={isProcessing}>
                  {isProcessing ? (
                    <CircularProgress size={16} />
                  ) : (
                    <>
                      <SendIcon sx={{ fontSize: 16 }} />
                      SUBMIT
                    </>
                  )}
                </SubmitButton>
              </>
            )}
          </StyledDialogActions>
        </form>
      </StyledDialog>
    </LocalizationProvider>
  );
};

export default CatTwoModal;
