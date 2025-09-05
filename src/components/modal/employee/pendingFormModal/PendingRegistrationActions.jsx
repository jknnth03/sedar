import React, { useState } from "react";
import {
  DialogActions,
  Button,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  Typography,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  Help as HelpIcon,
  Edit as EditIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import ArrowCircleRightIcon from "@mui/icons-material/ArrowCircleRight";
import ArrowCircleLeftIcon from "@mui/icons-material/ArrowCircleLeft";
import EditOffIcon from "@mui/icons-material/EditOff";

export const ConfirmationDialog = ({
  open,
  onClose,
  onConfirm,
  title,
  message,
  submissionId,
  isProcessing,
  confirmText = "CONFIRM",
  processingText = "Processing...",
  iconColor = "#ff4400",
}) => (
  <Dialog
    open={open}
    onClose={onClose}
    maxWidth="xs"
    fullWidth
    PaperProps={{ sx: { borderRadius: 3 } }}>
    <DialogTitle>
      <Box display="flex" justifyContent="center" alignItems="center" mb={1}>
        <HelpIcon sx={{ fontSize: 60, color: iconColor }} />
      </Box>
      <Typography
        variant="h6"
        fontWeight="bold"
        textAlign="center"
        color="rgb(33, 61, 112)">
        {title}
      </Typography>
    </DialogTitle>
    <DialogContent>
      <Typography variant="body1" gutterBottom textAlign="center">
        {message}
      </Typography>
      {submissionId && (
        <Typography
          variant="body2"
          color="text.secondary"
          textAlign="center"
          sx={{ mt: 1 }}>
          Pending Registration - ID: {submissionId}
        </Typography>
      )}
    </DialogContent>
    <DialogActions>
      <Box display="flex" justifyContent="center" width="100%" gap={2} mb={2}>
        <Button
          onClick={onClose}
          variant="outlined"
          color="error"
          disabled={isProcessing}
          sx={{ borderRadius: 2, minWidth: 80 }}>
          CANCEL
        </Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          color="success"
          disabled={isProcessing}
          sx={{ borderRadius: 2, minWidth: 80 }}>
          {isProcessing ? processingText : confirmText}
        </Button>
      </Box>
    </DialogActions>
  </Dialog>
);

export const EditButton = ({
  isViewMode,
  shouldEnableEditButton,
  isDisabled,
  handleEditClick,
}) => {
  if (!isViewMode) return null;

  const editButtonEnabled = shouldEnableEditButton();
  const editButtonDisabled = isDisabled || !editButtonEnabled;

  return (
    <Tooltip
      title={
        editButtonEnabled ? "EDIT EMPLOYEE" : "Cannot edit pending registration"
      }
      arrow
      placement="top">
      <IconButton
        onClick={handleEditClick}
        disabled={editButtonDisabled}
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
              fill: editButtonDisabled
                ? "rgba(0, 0, 0, 0.26)"
                : "rgba(0, 136, 32, 1)",
            },
          }}
        />
      </IconButton>
    </Tooltip>
  );
};

export const CancelEditButton = ({
  isEditMode,
  originalMode,
  handleCancelEdit,
  isDisabled,
}) => {
  if (!isEditMode || originalMode !== "view") return null;

  return (
    <Tooltip title="CANCEL EDIT">
      <IconButton
        onClick={handleCancelEdit}
        disabled={isDisabled}
        size="small"
        sx={{
          position: "absolute",
          right: 56,
          top: 8,
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
  );
};

const navigationButtonStyles = {
  minWidth: 44,
  minHeight: 44,
  width: 44,
  height: 44,
  borderRadius: "50%",
  border: "none",
  backgroundColor: "transparent",
  boxShadow: "none",
  padding: 0,
  "&:hover": {
    backgroundColor: "rgba(0, 0, 0, 0.04)",
    boxShadow: "none",
  },
  "&:disabled": {
    backgroundColor: "transparent",
    opacity: 0.3,
  },
  "& .MuiSvgIcon-root": {
    fontSize: 32,
    color: "rgb(33, 61, 112) !important",
  },
  "&:disabled .MuiSvgIcon-root": {
    color: "rgb(33, 61, 112) !important",
    opacity: 0.3,
  },
};

export const NavigationButtons = ({
  isFirstStep,
  isLastStep,
  handleBack,
  handleNext,
  isSubmitting,
}) => (
  <Box sx={{ display: "flex", gap: 1 }}>
    <Button
      onClick={handleBack}
      disabled={isFirstStep}
      sx={navigationButtonStyles}>
      <ArrowCircleLeftIcon />
    </Button>
    {!isLastStep && (
      <Button
        onClick={handleNext}
        disabled={isSubmitting}
        sx={navigationButtonStyles}>
        <ArrowCircleRightIcon />
      </Button>
    )}
  </Box>
);

const EmployeeWizardActions = ({
  isEditMode,
  isViewMode,
  isSubmitting,
  isFirstStep,
  isLastStep,
  handleUpdateAtStep,
  handleBack,
  handleNext,
  handleSubmit,
  onSubmit,
  onError,
  showUpdateConfirmDialog,
  onConfirmUpdate,
  onCancelUpdate,
  submissionId,
  isProcessing,
  handleResubmit,
  shouldEnableResubmitButton,
}) => {
  const [showResubmitConfirmDialog, setShowResubmitConfirmDialog] =
    useState(false);

  const resubmitButtonEnabled = shouldEnableResubmitButton();

  const handleResubmitClick = () => {
    if (resubmitButtonEnabled && !isSubmitting) {
      setShowResubmitConfirmDialog(true);
    }
  };

  const handleConfirmResubmit = () => {
    setShowResubmitConfirmDialog(false);
    handleResubmit();
  };

  const handleCancelResubmitDialog = () => {
    setShowResubmitConfirmDialog(false);
  };

  return (
    <>
      <DialogActions className="employee-wizard-actions">
        {isEditMode && (
          <Button
            variant="contained"
            onClick={handleUpdateAtStep}
            disabled={isSubmitting}
            startIcon={<EditIcon />}
            sx={{
              backgroundColor: "#2e7d32",
              color: "#fff !important",
              fontWeight: "bold",
              minWidth: 120,
              "& .MuiButton-startIcon": { color: "#fff !important" },
              "&:hover": {
                backgroundColor: "#1b5e20",
                color: "#fff !important",
                "& .MuiButton-startIcon": { color: "#fff !important" },
              },
              "&:disabled": {
                backgroundColor: "rgba(0, 0, 0, 0.12) !important",
                color: "rgba(0, 0, 0, 0.26) !important",
                opacity: 1,
                "& .MuiButton-startIcon": {
                  color: "rgba(0, 0, 0, 0.26) !important",
                },
              },
            }}
            className="employee-wizard-button employee-wizard-button--update">
            {isSubmitting ? "Updating..." : "UPDATE"}
          </Button>
        )}

        <Box
          sx={{
            width: "100%",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}>
          {isViewMode ? (
            <>
              <Button
                onClick={handleResubmitClick}
                variant="contained"
                disabled={isSubmitting || !resubmitButtonEnabled}
                sx={{
                  backgroundColor: "rgb(33, 61, 112)",
                  color: "#fff !important",
                  fontWeight: "bold",
                  minWidth: 140,
                  "&:hover": { backgroundColor: "rgba(26, 49, 92, 1)" },
                  "&:disabled": {
                    backgroundColor: "rgba(0, 0, 0, 0.12) !important",
                    color: "rgba(0, 0, 0, 0.26) !important",
                    cursor: "not-allowed",
                  },
                }}>
                RESUBMIT
              </Button>
              <NavigationButtons
                isFirstStep={isFirstStep}
                isLastStep={isLastStep}
                handleBack={handleBack}
                handleNext={handleNext}
                isSubmitting={isSubmitting}
              />
            </>
          ) : !isLastStep ? (
            <>
              <Box />
              <NavigationButtons
                isFirstStep={isFirstStep}
                isLastStep={isLastStep}
                handleBack={handleBack}
                handleNext={handleNext}
                isSubmitting={isSubmitting}
              />
            </>
          ) : (
            <>
              <Button
                onClick={handleBack}
                disabled={isFirstStep}
                sx={navigationButtonStyles}>
                <ArrowCircleLeftIcon />
              </Button>
              <Button
                type="button"
                variant="outlined"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleSubmit(onSubmit, onError)(e);
                }}
                disabled={isSubmitting}>
                {isSubmitting ? "Processing..." : "Update Employee"}
              </Button>
            </>
          )}
        </Box>
      </DialogActions>

      <ConfirmationDialog
        open={showUpdateConfirmDialog}
        onClose={onCancelUpdate}
        onConfirm={onConfirmUpdate}
        sss
        title="Confirm Update"
        message="Are you sure you want to update this pending registration?"
        submissionId={submissionId}
        isProcessing={isProcessing}
        processingText="Updating..."
      />

      <ConfirmationDialog
        open={showResubmitConfirmDialog}
        onClose={handleCancelResubmitDialog}
        onConfirm={handleConfirmResubmit}
        title="Confirm Resubmit"
        message="Are you sure you want to resubmit this pending registration?"
        submissionId={submissionId}
        isProcessing={isProcessing}
        processingText="Resubmitting..."
      />
    </>
  );
};

export default EmployeeWizardActions;
