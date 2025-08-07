import React from "react";
import { DialogActions, Button, Box } from "@mui/material";
import ArrowCircleRightIcon from "@mui/icons-material/ArrowCircleRight";
import ArrowCircleLeftIcon from "@mui/icons-material/ArrowCircleLeft";
import { Edit as EditIcon } from "@mui/icons-material";

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

const EmployeeWizardActions = ({
  isEditMode,
  isViewMode,
  isCreateMode,
  isSubmitting,
  isFirstStep,
  isLastStep,
  hasErrors,
  handleUpdateAtStep,
  handleBack,
  handleNext,
  handleClose,
  handleSubmit,
  onSubmit,
  onError,
}) => {
  return (
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
        className="employee-wizard-actions__right-section"
        sx={{
          width: "100%",
          display: "flex",
          justifyContent: isEditMode ? "flex-end" : "space-between",
          alignItems: "center",
          gap: 1,
        }}>
        {isViewMode ? (
          <>
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
          </>
        ) : isEditMode ? (
          <>
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
          </>
        ) : !isLastStep ? (
          <>
            <Button
              onClick={handleBack}
              disabled={isFirstStep}
              sx={navigationButtonStyles}>
              <ArrowCircleLeftIcon />
            </Button>
            <Button
              onClick={handleNext}
              disabled={isSubmitting}
              sx={navigationButtonStyles}>
              <ArrowCircleRightIcon />
            </Button>
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
              disabled={isSubmitting}
              className="employee-wizard-button employee-wizard-button--submit">
              {isSubmitting
                ? "Processing..."
                : isCreateMode
                ? "Create Employee"
                : "Update Employee"}
            </Button>
          </>
        )}
      </Box>
    </DialogActions>
  );
};

export default EmployeeWizardActions;
