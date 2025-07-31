import React from "react";
import { DialogActions, Button, Box } from "@mui/material";

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
          variant="outlined"
          onClick={handleUpdateAtStep}
          disabled={isSubmitting}
          className="employee-wizard-button employee-wizard-button--update">
          {isSubmitting ? "Updating..." : "Update"}
        </Button>
      )}
      <Box
        className="employee-wizard-actions__right-section"
        sx={{
          width: "100%",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}>
        {isViewMode ? (
          <>
            <Button
              variant="outlined"
              onClick={handleBack}
              disabled={isSubmitting || isFirstStep}
              className="employee-wizard-button employee-wizard-button--back">
              Back
            </Button>
            <Box sx={{ display: "flex", gap: 1 }}>
              {!isLastStep && (
                <Button
                  variant="contained"
                  onClick={handleNext}
                  disabled={isSubmitting}
                  style={{ color: "white", fontWeight: "bold" }}
                  className="employee-wizard-button employee-wizard-button--next">
                  Next
                </Button>
              )}
              {isLastStep && (
                <Button
                  variant="outlined"
                  onClick={handleClose}
                  disabled={isSubmitting}
                  className="employee-wizard-button employee-wizard-button--close">
                  Close
                </Button>
              )}
            </Box>
          </>
        ) : !isLastStep ? (
          <>
            <Button
              variant="outlined"
              onClick={handleBack}
              disabled={isSubmitting || isFirstStep}
              className="employee-wizard-button employee-wizard-button--back">
              Back
            </Button>
            <Button
              variant="contained"
              onClick={handleNext}
              disabled={isSubmitting}
              style={{ color: "white", fontWeight: "bold" }}
              className="employee-wizard-button employee-wizard-button--next">
              Next
            </Button>
          </>
        ) : (
          <>
            <Button
              variant="outlined"
              onClick={handleBack}
              disabled={isSubmitting || isFirstStep}
              className="employee-wizard-button employee-wizard-button--back">
              Back
            </Button>
            <Button
              type="button"
              variant="contained"
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
