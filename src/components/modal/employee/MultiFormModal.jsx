import React from "react";
import GeneralForm from "./forms/GeneralForm.jsx";
import PositionForm from "./forms/PositionForm";
import EmploymentTypesForm from "./forms/EmploymentTypesForm";
import AddressForm from "./forms/AddressForm";
import AttainmentForm from "./forms/AttainmentForm";
import AccountForm from "./forms/AccountForm";
import ContactForm from "./forms/ContactForm";
import FileForm from "./forms/FileForm";
import SummaryForm from "./forms/SummaryForm";
import {
  Dialog,
  DialogContent,
  DialogActions,
  Box,
  Stepper,
  Step,
  StepLabel,
  Button,
  Typography,
  Alert,
  IconButton,
  Snackbar,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import AddBoxIcon from "@mui/icons-material/AddBox";
import EditIcon from "@mui/icons-material/Edit";
import HelpIcon from "@mui/icons-material/Help";
import ErrorIcon from "@mui/icons-material/Error";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import "./MultiForm.scss";
import { useMultiFormLogic } from "./useMultiFormLogic";
import { useSelector } from "react-redux";

const MultiFormModal = ({
  open,
  onClose,
  isEditMode = false,
  editEmployeeData = null,
  initialStep = 0,
}) => {
  const {
    currentStep,
    formData,
    confirmOpen,
    validationError,
    successSnackbar,
    isFormLoading,
    formRefs,
    stepLabels,
    formatEmployeeDisplay,
    handleNext,
    handleBack,
    handleCancel,
    handleSubmitConfirm,
    handleStepClick,
    handleSnackbarClose,
    setConfirmOpen,
    extractFieldValue,
    handleUpdateEmployee,
  } = useMultiFormLogic({
    open,
    onClose,
    isEditMode,
    editEmployeeData,
    initialStep,
  });
  const sampl̥le = useSelector((state) => state.api.queries["getEmployees"]);
  console.log("sample", sampl̥le);
  const steps = stepLabels.map((label, index) => (
    <span key={index} style={{ fontWeight: "bold", color: "rgb(33, 61, 112)" }}>
      {label}
    </span>
  ));
  console.log("editEmployeeData", editEmployeeData);

  const renderStepContent = (step) => {
    const employeeAlert = formData.general && (
      <Alert severity="info" className="employee-info-alert">
        <strong>Employee:</strong> {formatEmployeeDisplay(formData.general)}
      </Alert>
    );

    const stepComponents = [
      <GeneralForm
        key={null}
        ref={formRefs.general}
        selectedGeneral={formData.general}
        isLoading={isFormLoading}
        employeeData={editEmployeeData}
      />,
      <>
        {employeeAlert}
        <AddressForm
          ref={formRefs.address}
          selectedAddress={editEmployeeData?.id}
          isLoading={isFormLoading}
          employeeData={editEmployeeData}
        />
      </>,
      <>
        {employeeAlert}
        <PositionForm
          ref={formRefs.position}
          selectedPosition={formData.position}
          isLoading={isFormLoading}
          employeeData={editEmployeeData}
        />
      </>,
      <>
        {employeeAlert}
        <EmploymentTypesForm
          ref={formRefs.employmentTypes}
          selectedEmploymentType={formData.employmentType}
          isLoading={isFormLoading}
          employeeData={editEmployeeData}
        />
      </>,
      <>
        {employeeAlert}
        <AttainmentForm
          ref={formRefs.attainment}
          selectedAttainment={formData.attainment}
          isLoading={isFormLoading}
          employeeData={editEmployeeData}
        />
      </>,
      <>
        {employeeAlert}
        <AccountForm
          ref={formRefs.account}
          selectedAccount={formData.account}
          isLoading={isFormLoading}
          employeeId={formData.general?.id || editEmployeeData?.id}
          employeeData={editEmployeeData}
        />
      </>,
      <>
        {employeeAlert}
        <ContactForm
          ref={formRefs.contact}
          selectedContacts={formData.contact}
          isLoading={isFormLoading}
          employeeId={formData.general?.id || editEmployeeData?.id}
          employeeData={editEmployeeData}
        />
      </>,
      <>
        {employeeAlert}
        <FileForm
          ref={formRefs.file}
          selectedFile={formData.file}
          isLoading={isFormLoading}
          employeeId={formData.general?.id || editEmployeeData?.id}
          employeeData={editEmployeeData}
        />
      </>,
      <SummaryForm
        formData={formData}
        formatEmployeeDisplay={formatEmployeeDisplay}
        extractFieldValue={extractFieldValue}
      />,
    ];

    return (
      <Box className="multiform-modal__form-step">{stepComponents[step]}</Box>
    );
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={() => {}}
        disableEscapeKeyDown
        maxWidth="lg"
        fullWidth
        className="multiform-modal">
        <Box className="multiform-modal__header" sx={{ position: "relative" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {isEditMode ? (
              <EditIcon sx={{ color: "rgb(33, 61, 112)" }} />
            ) : (
              <AddBoxIcon sx={{ color: "rgb(33, 61, 112)" }} />
            )}
            <Typography sx={{ color: "rgb(33, 61, 112)", fontWeight: "bold" }}>
              {isEditMode ? "EDIT EMPLOYEE" : "ADD NEW EMPLOYEE"}
            </Typography>
          </Box>
          <IconButton
            onClick={handleCancel}
            sx={{ position: "absolute", right: 8, top: 8 }}
            disabled={isFormLoading}>
            <CloseIcon />
          </IconButton>
        </Box>

        <DialogContent className="multiform-modal__content">
          <Box className="multiform-modal__step-content">
            <Stepper activeStep={currentStep} alternativeLabel>
              {steps.map((label, index) => (
                <Step
                  key={index}
                  sx={{ cursor: isEditMode ? "pointer" : "default" }}
                  onClick={() => isEditMode && handleStepClick(index)}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>

            {validationError && (
              <Alert
                severity="error"
                sx={{ mt: 2, mb: 2 }}
                icon={<ErrorIcon />}>
                {validationError}
              </Alert>
            )}

            {renderStepContent(currentStep)}
          </Box>
        </DialogContent>

        <DialogActions className="multiform-modal__actions">
          <Button
            variant="outlined"
            onClick={handleBack}
            disabled={currentStep === 0 || isFormLoading}>
            Back
          </Button>
          <Button
            sx={{ backgroundColor: "green" }}
            variant="contained"
            onClick={handleSubmitConfirm}
            disabled={isFormLoading}>
            Update
          </Button>
          <Button
            variant="contained"
            onClick={handleNext}
            disabled={isFormLoading}>
            {currentStep === steps.length - 1
              ? isEditMode
                ? "UPDATE EMPLOYEE"
                : "ADD EMPLOYEE"
              : "NEXT"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirmation Dialog */}
      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <Box display="flex" justifyContent="center" mb={1} pt={2}>
          <HelpIcon sx={{ fontSize: 60, color: "#ff4400" }} />
        </Box>
        <Typography variant="h6" fontWeight="bold" textAlign="center">
          Confirmation
        </Typography>
        <DialogContent>
          <Typography textAlign="center">
            Are you sure you want to {isEditMode ? "update" : "add"} this
            employee?
          </Typography>
          {formData.general && (
            <Typography textAlign="center" color="text.secondary">
              {formatEmployeeDisplay(formData.general)}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Box
            display="flex"
            justifyContent="center"
            width="100%"
            gap={2}
            mb={2}>
            <Button
              onClick={() => setConfirmOpen(false)}
              variant="outlined"
              color="error">
              No
            </Button>
            <Button
              onClick={handleSubmitConfirm}
              variant="contained"
              color="success"
              disabled={isFormLoading}>
              Yes
            </Button>
          </Box>
        </DialogActions>
      </Dialog>

      {/* Success Snackbar */}
      <Snackbar
        open={successSnackbar}
        autoHideDuration={4000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}>
        <Alert
          onClose={handleSnackbarClose}
          severity="success"
          variant="filled"
          icon={<CheckCircleIcon />}
          sx={{ width: "100%" }}>
          Employee {isEditMode ? "updated" : "added"} successfully!
        </Alert>
      </Snackbar>
    </>
  );
};

export default MultiFormModal;
