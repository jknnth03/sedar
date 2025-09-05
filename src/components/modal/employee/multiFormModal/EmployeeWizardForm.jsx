import React, { useEffect } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  Typography,
  IconButton,
  Fade,
  LinearProgress,
  Tooltip,
  Stepper,
  Step,
  StepLabel,
  StepIcon,
  Backdrop,
  CircularProgress,
} from "@mui/material";
import {
  Close as CloseIcon,
  CheckCircle,
  Error,
  Edit as EditIcon,
  EditOff,
} from "@mui/icons-material";
import "./Employee.scss";

import { createFlattenedEmployeeSchema } from "../../../../schema/employees/FlattenedEmployeeSchema.js";
import {
  useCreateEmployeeMutation,
  useUpdateEmployeeMutation,
} from "../../../../features/api/employee/mainApi.js";
import { CustomStepIcon } from "./EmployeeWizardStyledComponents.jsx";
import {
  STEPS,
  initializeFormData,
  getDialogTitle,
} from "./EmployeeWizardHelpers.js";
import { getDefaultValues } from "./EmployeeUtils.js";
import EmployeeWizardActions from "./EmployeeWizardActions.jsx";

// Import all logic from the single consolidation file
import {
  useEmployeeWizardLogic,
  useEmploymentTypeHandler,
  useFormSubmission,
  useStepNavigation,
  getEmployeeFullName,
} from "./EmployeeWizardLogic.js";

// Import step components directly
import AddressForm from "./forms/AddressForm.jsx";
import PositionForm from "./forms/PositionForm.jsx";
import EmploymentTypeForm from "./forms/EmploymentTypesForm.jsx";
import AttainmentForm from "./forms/AttainmentForm.jsx";
import AccountForm from "./forms/AccountForm.jsx";
import ContactForm from "./forms/ContactForm.jsx";
import FileForm from "./forms/FileForm.jsx";
import ReviewStep from "./forms/ReviewStep";
import GeneralForm from "./forms/GeneralForm.jsx";

const EmployeeWizardForm = ({
  open,
  onClose,
  initialData = null,
  mode = "create",
  initialStep = 0,
  onSubmit: onSubmitProp,
  onRefetch,
  refetchQueries,
  autoCloseAfterUpdate = true,
}) => {
  // All state management consolidated
  const wizardLogic = useEmployeeWizardLogic(
    mode,
    initialStep,
    initialData,
    open
  );
  const {
    activeStep,
    setActiveStep,
    submissionResult,
    setSubmissionResult,
    currentMode,
    setCurrentMode,
    originalMode,
    isProcessing,
    isClosing,
    blockAllInteractions,
    isFormInitialized,
    setIsFormInitialized,
    isInitializedRef,
    lastInitialDataRef,
    resetState,
  } = wizardLogic;

  // API mutations
  const [createEmployee, { isLoading: isCreating }] =
    useCreateEmployeeMutation();
  const [updateEmployee, { isLoading: isUpdating }] =
    useUpdateEmployeeMutation();

  // Computed values
  const isSubmitting = (isCreating || isUpdating || isProcessing) && !isClosing;
  const isViewMode = currentMode === "view";
  const isEditMode = currentMode === "edit";
  const isCreateMode = currentMode === "create";
  const isViewOrEditMode = isViewMode || isEditMode;
  const isDisabled = isSubmitting || blockAllInteractions;

  // Form setup
  const methods = useForm({
    defaultValues: getDefaultValues({ mode, initialData }),
    resolver: yupResolver(createFlattenedEmployeeSchema()),
    mode: "onChange",
    reValidateMode: "onChange",
    shouldUnregister: false,
  });

  const {
    handleSubmit,
    reset,
    watch,
    setValue,
    clearErrors,
    getValues,
    formState: { errors },
  } = methods;

  // Custom hooks for specific logic
  const handleEmploymentTypeChange = useEmploymentTypeHandler(setValue);

  const handleClose = () => {
    resetState();
    if (onClose) onClose();
  };

  const { onSubmit, handleUpdateAtStep, onError } = useFormSubmission({
    isDisabled,
    isCreateMode,
    currentMode,
    initialData,
    onSubmitProp,
    onRefetch,
    refetchQueries,
    createEmployee,
    updateEmployee,
    setIsProcessing: wizardLogic.setIsProcessing,
    setSubmissionResult,
    setBlockAllInteractions: wizardLogic.setBlockAllInteractions,
    setIsClosing: wizardLogic.setIsClosing,
    handleClose,
    autoCloseAfterUpdate,
    getValues,
  });

  const { handleNext, handleBack, handleStepClick } = useStepNavigation(
    activeStep,
    setActiveStep,
    setSubmissionResult,
    isDisabled,
    isViewMode,
    getValues
  );

  // Form initialization effect
  useEffect(() => {
    if (!open) {
      resetState();
      return;
    }

    const shouldInitialize =
      !isInitializedRef.current ||
      JSON.stringify(initialData) !==
        JSON.stringify(lastInitialDataRef.current);

    if (shouldInitialize) {
      const formData = initializeFormData(initialData);

      if (mode === "create") {
        const currentFormData = getValues();
        const hasExistingData = Object.keys(currentFormData).some((key) => {
          const value = currentFormData[key];
          if (Array.isArray(value)) {
            return (
              value.length > 0 &&
              value.some(
                (item) =>
                  typeof item === "object" &&
                  Object.values(item).some(
                    (val) => val !== null && val !== undefined && val !== ""
                  )
              )
            );
          }
          return value !== null && value !== undefined && value !== "";
        });

        if (!hasExistingData || !isInitializedRef.current) reset(formData);
      } else {
        reset(formData);
      }

      setIsFormInitialized(true);
      setCurrentMode(mode);
      isInitializedRef.current = true;
      lastInitialDataRef.current = initialData;
    }
  }, [open, initialData, mode, initialStep, reset, getValues]);

  // Employment type watcher
  useEffect(() => {
    if (!isFormInitialized || isDisabled) return;

    const subscription = watch((value, { name }) => {
      if (
        name &&
        (name.includes("employment_type_label") ||
          name.includes("employment_start_date"))
      ) {
        handleEmploymentTypeChange(value.employment_types || []);
      }
    });

    return () => subscription.unsubscribe();
  }, [watch, handleEmploymentTypeChange, isFormInitialized, isDisabled]);

  // Mode switching handlers
  const handleEditClick = () => {
    if (isDisabled) return;
    setCurrentMode("edit");
    setSubmissionResult(null);
  };

  const handleCancelEdit = () => {
    if (isDisabled) return;
    setCurrentMode(originalMode === "view" ? "view" : "view");
    if (originalMode !== "view") handleClose();
    setSubmissionResult(null);
    clearErrors();
  };

  // Step components
  const stepComponents = {
    0: GeneralForm,
    1: AddressForm,
    2: PositionForm,
    3: EmploymentTypeForm,
    4: AttainmentForm,
    5: AccountForm,
    6: ContactForm,
    7: FileForm,
    8: ReviewStep,
  };
  const CurrentStepComponent = stepComponents[activeStep];
  const isLastStep = activeStep === STEPS.length - 1;
  const isFirstStep = activeStep === 0;
  const hasErrors = Object.keys(errors).length > 0;

  const renderStepIcon = (props) => {
    return isViewOrEditMode ? (
      <CustomStepIcon {...props} isViewOrEditMode={isViewOrEditMode} />
    ) : (
      <StepIcon {...props} />
    );
  };

  // Loading state
  if (!isFormInitialized && open) {
    return (
      <Dialog open={open} maxWidth="lg" fullWidth>
        <Box sx={{ p: 3, textAlign: "center" }}>
          <CircularProgress size={40} />
          <Typography variant="body1" sx={{ mt: 2 }}>
            Loading form...
          </Typography>
        </Box>
      </Dialog>
    );
  }

  return (
    <Dialog
      open={open}
      maxWidth="lg"
      fullWidth
      disableEscapeKeyDown={isDisabled}
      className="employee-wizard-dialog"
      PaperProps={{ className: "employee-wizard-dialog__paper" }}>
      <Backdrop
        sx={{
          color: "#fff",
          zIndex: (theme) => theme.zIndex.drawer + 1,
          position: "absolute",
          backgroundColor: "rgba(255, 255, 255, 0.8)",
        }}
        open={isSubmitting || blockAllInteractions}>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 2,
          }}>
          <CircularProgress size={40} />
          <Typography variant="body1" color="primary">
            {isCreateMode ? "Creating employee..." : "Updating employee..."}
          </Typography>
        </Box>
      </Backdrop>

      <DialogTitle
        className="employee-wizard-title"
        sx={{ position: "relative" }}>
        <Box className="employee-wizard-title__header">
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography variant="h5">{getDialogTitle(currentMode)}</Typography>

            {isViewMode && (
              <Tooltip title="EDIT EMPLOYEE">
                <IconButton
                  onClick={handleEditClick}
                  disabled={isDisabled}
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
                      "& path": { fill: "rgba(0, 136, 32, 1)" },
                    }}
                  />
                </IconButton>
              </Tooltip>
            )}

            {isEditMode && originalMode === "view" && (
              <Tooltip title="CANCEL EDIT">
                <IconButton
                  onClick={handleCancelEdit}
                  disabled={isDisabled}
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
                  <EditOff
                    sx={{
                      fontSize: "20px",
                      "& path": { fill: "rgba(235, 0, 0, 1)" },
                    }}
                  />
                </IconButton>
              </Tooltip>
            )}
          </Box>

          <Typography variant="body2">
            {isViewOrEditMode && initialData
              ? getEmployeeFullName(initialData) ||
                `Step ${activeStep + 1} of ${STEPS.length}: ${
                  STEPS[activeStep]
                }`
              : `Step ${activeStep + 1} of ${STEPS.length}: ${
                  STEPS[activeStep]
                }`}
          </Typography>
        </Box>

        <IconButton
          onClick={handleClose}
          disabled={isDisabled}
          sx={{ position: "absolute", right: 8, top: 8, zIndex: 1000 }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      {isSubmitting && <LinearProgress className="employee-wizard-progress" />}

      <DialogContent className="employee-wizard-content">
        <Box className="employee-wizard-content__inner">
          {/* Result Messages */}
          {submissionResult && (
            <Fade in={true} timeout={300}>
              <Box
                sx={{
                  mb: 2,
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  px: 2,
                  py: 1,
                  backgroundColor:
                    submissionResult.type === "error" ? "#ffebee" : "#e8f5e8",
                  borderRadius: 1,
                  border:
                    submissionResult.type === "error"
                      ? "1px solid #ffcdd2"
                      : "1px solid #c8e6c9",
                }}>
                {submissionResult.type === "error" ? (
                  <Error sx={{ color: "#d32f2f", fontSize: "20px" }} />
                ) : (
                  <CheckCircle sx={{ color: "#2e7d32", fontSize: "20px" }} />
                )}
                <Typography
                  variant="body2"
                  sx={{
                    color:
                      submissionResult.type === "error" ? "#d32f2f" : "#2e7d32",
                    fontWeight: 500,
                    flex: 1,
                  }}>
                  {submissionResult.message}
                </Typography>
              </Box>
            </Fade>
          )}

          {/* Stepper */}
          <Stepper
            activeStep={activeStep}
            alternativeLabel
            className="employee-wizard-stepper">
            {STEPS.map((label, index) => (
              <Step key={label}>
                <StepLabel
                  className={index === activeStep ? "active" : ""}
                  sx={{
                    cursor: isViewMode && !isDisabled ? "pointer" : "default",
                    "&:hover":
                      isViewMode && !isDisabled ? { opacity: 0.7 } : {},
                    opacity: isDisabled ? 0.6 : 1,
                  }}
                  onClick={() => handleStepClick(index)}
                  StepIconComponent={renderStepIcon}>
                  {label}
                </StepLabel>
              </Step>
            ))}
          </Stepper>

          {/* Form Content */}
          <FormProvider {...methods}>
            <Box
              className="employee-wizard-content__form-container"
              sx={{
                opacity: isDisabled ? 0.6 : 1,
                pointerEvents: isDisabled ? "none" : "auto",
              }}>
              {CurrentStepComponent ? (
                <CurrentStepComponent
                  selectedGeneral={activeStep === 0 ? initialData : undefined}
                  selectedAddress={activeStep === 1 ? initialData : undefined}
                  selectedPosition={activeStep === 2 ? initialData : undefined}
                  selectedEmploymentType={
                    activeStep === 3 ? initialData : undefined
                  }
                  selectedAttainment={
                    activeStep === 4 ? initialData : undefined
                  }
                  selectedAccount={activeStep === 5 ? initialData : undefined}
                  selectedContact={activeStep === 6 ? initialData : undefined}
                  selectedFiles={activeStep === 7 ? initialData : undefined}
                  initialData={initialData}
                  employeeData={initialData}
                  isLoading={isDisabled}
                  mode={currentMode}
                  isViewMode={isViewMode}
                  isEditMode={isEditMode}
                  isCreateMode={isCreateMode}
                  readOnly={isViewMode || isDisabled}
                  disabled={isViewMode || isDisabled}
                  showErrors={true}
                />
              ) : (
                <Box sx={{ p: 3, textAlign: "center" }}>
                  <Typography variant="h6" color="error">
                    Component not found for step {activeStep}
                  </Typography>
                </Box>
              )}
            </Box>
          </FormProvider>
        </Box>
      </DialogContent>

      <EmployeeWizardActions
        isEditMode={isEditMode}
        isViewMode={isViewMode}
        isCreateMode={isCreateMode}
        isSubmitting={isDisabled}
        isFirstStep={isFirstStep}
        isLastStep={isLastStep}
        hasErrors={hasErrors}
        handleUpdateAtStep={handleUpdateAtStep}
        handleBack={handleBack}
        handleNext={handleNext}
        handleClose={handleClose}
        handleSubmit={handleSubmit}
        onSubmit={onSubmit}
        onError={onError}
      />
    </Dialog>
  );
};

export default EmployeeWizardForm;
