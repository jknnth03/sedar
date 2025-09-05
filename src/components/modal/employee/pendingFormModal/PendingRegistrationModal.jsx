import React, { useState, useCallback, useEffect, useRef } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useDispatch } from "react-redux";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Button,
  Stepper,
  Step,
  StepLabel,
  Box,
  Typography,
  IconButton,
  Fade,
  LinearProgress,
  Backdrop,
  CircularProgress,
  StepIcon,
} from "@mui/material";
import {
  Close as CloseIcon,
  CheckCircle,
  Error as ErrorIcon,
} from "@mui/icons-material";
import "../../employee/multiFormModal/Employee.scss";

import { createFlattenedEmployeeSchema } from "../../../../schema/employees/FlattenedEmployeeSchema.js";
import pendingApi, {
  useUpdateFormSubmissionMutation,
  useGetPendingEmployeesQuery,
} from "../../../../features/api/employee/pendingApi.js";
import { useResubmitFormSubmissionMutation } from "../../../../features/api/approvalsetting/formSubmissionApi.js";
import { CustomStepIcon } from "../../employee/multiFormModal/EmployeeWizardStyledComponents.jsx";
import { STEPS } from "../../employee/multiFormModal/EmployeeWizardHelpers.js";

import EmployeeWizardActions from "./PendingRegistrationActions.jsx";
import { getPendingValues } from "../pendingFormModal/PendingGetValues.jsx";
import { EditButton, CancelEditButton } from "./PendingRegistrationActions.jsx";

import {
  validateCurrentStep,
  handleStepNavigation,
  createFormErrorHandler,
  generateErrorMessage,
  validateAndFixFormData,
} from "./PendingFormStepValidation.jsx";

import {
  stepComponents,
  getEmployeeFullName,
  getPendingDialogTitle,
  shouldFetchPendingData,
  createEmploymentTypeChangeHandler,
  getSubmissionId,
  getActualData,
  createInitialState,
  shouldInitializeForm,
  shouldEnableEditButton,
  shouldEnableResubmitButton,
  resetModalState,
  handleSuccessAndClose,
  handleFormSubmission,
  handleEditModeToggle,
  createLoadingDialog,
  createErrorDialog,
  createNotificationConfig,
} from "./PendingRegistrationUtils.jsx";
import moduleApi from "../../../../features/api/usermanagement/dashboardApi.js";
import mainApi from "../../../../features/api/employee/mainApi.js";

const PendingRegistrationModal = ({
  open,
  onClose,
  initialData = null,
  mode = "view",
  initialStep = 0,
  onSubmit: onSubmitProp,
  onRefetch,
  refetchQueries,
  autoCloseAfterUpdate = true,
}) => {
  const dispatch = useDispatch();
  const initialState = createInitialState(initialStep, mode);
  const [activeStep, setActiveStep] = useState(initialState.activeStep);
  const [submissionResult, setSubmissionResult] = useState(
    initialState.submissionResult
  );
  const [currentMode, setCurrentMode] = useState(initialState.currentMode);
  const [originalMode, setOriginalMode] = useState(initialState.originalMode);
  const [isProcessing, setIsProcessing] = useState(initialState.isProcessing);
  const [isClosing, setIsClosing] = useState(initialState.isClosing);
  const [blockAllInteractions, setBlockAllInteractions] = useState(
    initialState.blockAllInteractions
  );
  const [isFormInitialized, setIsFormInitialized] = useState(
    initialState.isFormInitialized
  );
  const [showUpdateConfirmDialog, setShowUpdateConfirmDialog] = useState(
    initialState.showUpdateConfirmDialog
  );
  const [pendingUpdateData, setPendingUpdateData] = useState(
    initialState.pendingUpdateData
  );

  const isInitializedRef = useRef(false);
  const lastInitialDataRef = useRef(null);

  const submissionId = React.useMemo(
    () => getSubmissionId(initialData),
    [initialData]
  );
  const shouldFetchData = shouldFetchPendingData(submissionId, initialData);

  const {
    data: fetchedData,
    isLoading: isFetchingData,
    error: fetchError,
  } = useGetPendingEmployeesQuery(submissionId, {
    skip: !shouldFetchData || !open,
  });

  const actualData = React.useMemo(
    () => getActualData(fetchedData, initialData),
    [fetchedData, initialData]
  );

  const [updateFormSubmission, { isLoading: isUpdating }] =
    useUpdateFormSubmissionMutation();
  const [resubmitFormSubmission, { isLoading: isResubmitting }] =
    useResubmitFormSubmissionMutation();

  const isSubmitting =
    (isUpdating || isProcessing || isResubmitting) && !isClosing;
  const isViewMode = currentMode === "view";
  const isEditMode = currentMode === "edit";
  const isViewOrEditMode = isViewMode || isEditMode;
  const isDisabled = isSubmitting || blockAllInteractions;

  const initializePendingFormData = useCallback(
    (data) => {
      const formData = getPendingValues({
        mode: currentMode || mode,
        initialData: data,
      });

      const { fixedData, validationResults } = validateAndFixFormData(
        formData,
        "Initial Form Data"
      );

      if (validationResults.fixes.length > 0) {
        console.log("Applied form data fixes:", validationResults.fixes);
      }
      if (validationResults.warnings.length > 0) {
        console.warn("Form data warnings:", validationResults.warnings);
      }

      return fixedData;
    },
    [currentMode, mode]
  );

  const methods = useForm({
    defaultValues: getPendingValues({ mode, initialData: null }),
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

  const handleFormErrors = useCallback(
    createFormErrorHandler(setSubmissionResult),
    []
  );

  const handleResubmit = useCallback(async () => {
    if (!shouldEnableResubmitButton(actualData, isSubmitting)) {
      return;
    }

    setIsProcessing(true);
    setBlockAllInteractions(true);

    try {
      await resubmitFormSubmission(submissionId).unwrap();

      dispatch(mainApi.util.invalidateTags(["employees"]));
      dispatch(moduleApi.util.invalidateTags(["dashboard"]));

      setSubmissionResult({
        type: "success",
        message: "Registration resubmitted successfully!",
      });

      if (onRefetch) {
        onRefetch();
      }

      setTimeout(() => {
        setIsClosing(true);
        setTimeout(() => {
          handleClose();
        }, 500);
      }, 1500);
    } catch (error) {
      console.error("Resubmit failed:", error);
      setSubmissionResult({
        type: "error",
        message: "Failed to resubmit registration. Please try again.",
      });
    } finally {
      setIsProcessing(false);
      setBlockAllInteractions(false);
    }
  }, [
    actualData,
    isSubmitting,
    submissionId,
    resubmitFormSubmission,
    dispatch,
    onRefetch,
  ]);

  const handleClose = useCallback(() => {
    if (isDisabled && !isClosing) return;

    resetModalState(
      initialStep,
      mode,
      clearErrors,
      setActiveStep,
      setSubmissionResult,
      setCurrentMode,
      setOriginalMode,
      setIsProcessing,
      setIsClosing,
      setBlockAllInteractions,
      setIsFormInitialized,
      setShowUpdateConfirmDialog,
      setPendingUpdateData,
      isInitializedRef,
      lastInitialDataRef
    );

    if (onClose) onClose();
  }, [isDisabled, isClosing, initialStep, mode, clearErrors, onClose]);

  const onError = useCallback((errors) => {
    const errorMessage = generateErrorMessage({
      inner: Object.values(errors).flat(),
    });
    setSubmissionResult({
      type: "error",
      message: errorMessage,
    });
  }, []);

  useEffect(() => {
    if (!open) {
      resetModalState(
        initialStep,
        mode,
        clearErrors,
        setActiveStep,
        setSubmissionResult,
        setCurrentMode,
        setOriginalMode,
        setIsProcessing,
        setIsClosing,
        setBlockAllInteractions,
        setIsFormInitialized,
        setShowUpdateConfirmDialog,
        setPendingUpdateData,
        isInitializedRef,
        lastInitialDataRef
      );
      return;
    }

    if (isFetchingData) return;

    if (
      shouldInitializeForm(
        isInitializedRef,
        lastInitialDataRef,
        actualData,
        shouldFetchData
      )
    ) {
      const formData = initializePendingFormData(actualData);
      reset(formData);
      setIsFormInitialized(true);
      setCurrentMode(mode);
      setOriginalMode(mode);
      isInitializedRef.current = true;
      lastInitialDataRef.current = actualData;
    }
  }, [
    open,
    actualData,
    mode,
    initialStep,
    reset,
    isFetchingData,
    shouldFetchData,
    initializePendingFormData,
  ]);

  const handleEmploymentTypeChange = useCallback(
    createEmploymentTypeChangeHandler(setValue),
    [setValue]
  );

  useEffect(() => {
    if (!isFormInitialized || isDisabled) return;

    const subscription = watch((value, { name }) => {
      if (
        name &&
        (name.includes("employment_type_label") ||
          name.includes("employment_start_date"))
      ) {
        const employmentTypes = value.employment_types || [];
        handleEmploymentTypeChange(employmentTypes);
      }
    });

    return () => subscription.unsubscribe();
  }, [watch, handleEmploymentTypeChange, isFormInitialized, isDisabled]);

  const handleNext = async () => {
    const success = await handleStepNavigation(
      "next",
      activeStep,
      isViewMode,
      isDisabled,
      getValues,
      setActiveStep,
      setSubmissionResult
    );

    if (!success && !isViewMode) {
      handleFormErrors(errors);
    }
  };

  const handleBack = () => {
    handleStepNavigation(
      "back",
      activeStep,
      isViewMode,
      isDisabled,
      getValues,
      setActiveStep,
      setSubmissionResult
    );
  };

  const handleStepClick = (stepIndex) => {
    if (isDisabled || !isViewMode || stepIndex === activeStep) return;
    setActiveStep(stepIndex);
    setSubmissionResult(null);
  };

  const handleEditClick = () => {
    const editButtonEnabled = shouldEnableEditButton(actualData, isSubmitting);
    if (isDisabled || !editButtonEnabled) return;
    handleEditModeToggle(
      "enter",
      originalMode,
      setCurrentMode,
      setSubmissionResult,
      clearErrors,
      handleClose
    );
  };

  const handleCancelEdit = () => {
    if (isDisabled) return;
    handleEditModeToggle(
      "cancel",
      originalMode,
      setCurrentMode,
      setSubmissionResult,
      clearErrors,
      handleClose
    );
  };

  const onSubmit = async (data) => {
    if (isDisabled) return;

    const { fixedData, validationResults } = validateAndFixFormData(
      data,
      "Submission Data"
    );

    if (!validationResults.isValid) {
      setSubmissionResult({
        type: "error",
        message: validationResults.errors.join(", "),
      });
      return;
    }

    await handleFormSubmission(
      fixedData,
      submissionId,
      actualData,
      updateFormSubmission,
      onSubmitProp,
      currentMode,
      onRefetch,
      refetchQueries,
      setIsProcessing,
      setSubmissionResult,
      setBlockAllInteractions,
      setIsClosing,
      handleClose,
      autoCloseAfterUpdate,
      dispatch
    );
  };

  const handleUpdateAtStep = async () => {
    if (isDisabled) return;

    const stepValid = await validateCurrentStep(activeStep, getValues);

    if (!stepValid && !isViewMode) {
      setSubmissionResult({
        type: "error",
        message: "Please fill in all required fields before updating.",
      });
      return;
    }

    const currentData = getValues();
    const { fixedData } = validateAndFixFormData(currentData, "Update Data");
    setPendingUpdateData(fixedData);
    setShowUpdateConfirmDialog(true);
  };

  const handleConfirmUpdate = async () => {
    if (!pendingUpdateData || isDisabled) return;

    setShowUpdateConfirmDialog(false);

    await handleFormSubmission(
      pendingUpdateData,
      submissionId,
      actualData,
      updateFormSubmission,
      onSubmitProp,
      currentMode,
      onRefetch,
      refetchQueries,
      setIsProcessing,
      setSubmissionResult,
      setBlockAllInteractions,
      setIsClosing,
      handleClose,
      autoCloseAfterUpdate,
      dispatch
    );

    setPendingUpdateData(null);
  };

  const handleCancelUpdate = () => {
    setShowUpdateConfirmDialog(false);
    setPendingUpdateData(null);
  };

  const CurrentStepComponent = stepComponents[activeStep];
  const isLastStep = activeStep === STEPS.length - 1;
  const isFirstStep = activeStep === 0;
  const hasErrors = Object.keys(errors).length > 0;

  const renderStepIcon = (props) => {
    const { active, completed, icon } = props;
    return isViewOrEditMode ? (
      <CustomStepIcon
        active={active}
        completed={completed}
        icon={icon}
        isViewOrEditMode={isViewOrEditMode}
      />
    ) : (
      <StepIcon {...props} />
    );
  };

  const loadingDialogConfig = createLoadingDialog(
    !isFormInitialized && (isFetchingData || (open && shouldFetchData)),
    "Loading registration data..."
  );

  const errorDialogConfig = createErrorDialog(
    fetchError && open,
    handleClose,
    "Failed to load registration data. Please try again."
  );

  const initializingDialogConfig = createLoadingDialog(
    !isFormInitialized && open && !isFetchingData && !shouldFetchData,
    "Initializing form..."
  );

  if (
    loadingDialogConfig.open ||
    errorDialogConfig.open ||
    initializingDialogConfig.open
  ) {
    const config = loadingDialogConfig.open
      ? loadingDialogConfig
      : errorDialogConfig.open
      ? errorDialogConfig
      : initializingDialogConfig;

    return (
      <Dialog
        open={config.open}
        maxWidth="lg"
        fullWidth
        PaperProps={config.PaperProps}>
        <Box sx={config.content.sx}>
          {config.content.title && (
            <Typography variant="h6" color="error" sx={{ mb: 2 }}>
              {config.content.title}
            </Typography>
          )}
          {!config.content.title && <CircularProgress size={40} />}
          <Typography variant="body1" sx={{ mt: 2 }}>
            {config.content.message}
          </Typography>
          {config.content.onClose && (
            <Button
              variant="contained"
              onClick={config.content.onClose}
              sx={{ mt: 2 }}>
              Close
            </Button>
          )}
        </Box>
      </Dialog>
    );
  }

  const notificationConfig = createNotificationConfig(submissionResult);

  return (
    <Dialog
      open={open}
      maxWidth="lg"
      fullWidth
      disableEscapeKeyDown={isDisabled}
      className="employee-wizard-dialog"
      PaperProps={{
        sx: {
          height: "90vh",
          maxHeight: "90vh",
        },
      }}>
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
            Updating pending registration...
          </Typography>
        </Box>
      </Backdrop>

      <DialogTitle
        className="employee-wizard-title"
        sx={{ position: "relative", flexShrink: 0 }}>
        <Box
          className="employee-wizard-title__header"
          sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Typography
                variant="h5"
                sx={{
                  color: "rgb(33, 61, 112) !important",
                  fontWeight: "bold !important",
                  "&.MuiTypography-root": {
                    color: "rgb(33, 61, 112) !important",
                  },
                }}>
                {getPendingDialogTitle(currentMode)}
              </Typography>

              <EditButton
                isViewMode={isViewMode}
                shouldEnableEditButton={() =>
                  shouldEnableEditButton(actualData, isSubmitting)
                }
                isDisabled={isDisabled}
                handleEditClick={handleEditClick}
              />
            </Box>

            <Typography variant="body2">
              {isViewOrEditMode && actualData
                ? getEmployeeFullName(actualData) ||
                  `Step ${activeStep + 1} of ${STEPS.length}: ${
                    STEPS[activeStep]
                  }`
                : `Step ${activeStep + 1} of ${STEPS.length}: ${
                    STEPS[activeStep]
                  }`}
            </Typography>
          </Box>
        </Box>

        <CancelEditButton
          isEditMode={isEditMode}
          originalMode={originalMode}
          handleCancelEdit={handleCancelEdit}
          isDisabled={isDisabled}
        />

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
          {notificationConfig && (
            <Fade in={true} timeout={300}>
              <Box sx={notificationConfig.sx}>
                {notificationConfig.type === "error" ? (
                  <ErrorIcon
                    sx={{
                      color: notificationConfig.iconColor,
                      fontSize: "20px",
                    }}
                  />
                ) : (
                  <CheckCircle
                    sx={{
                      color: notificationConfig.iconColor,
                      fontSize: "20px",
                    }}
                  />
                )}
                <Typography
                  variant="body2"
                  sx={{
                    color: notificationConfig.textColor,
                    fontWeight: 500,
                    flex: 1,
                  }}>
                  {notificationConfig.message}
                </Typography>
              </Box>
            </Fade>
          )}

          <Stepper
            activeStep={activeStep}
            alternativeLabel
            className="employee-wizard-stepper"
            sx={{
              mb: 3,
              "& .MuiStepIcon-root": {
                "&.MuiStepIcon-active": {
                  color: "rgb(33, 61, 112) !important",
                },
                "&.MuiStepIcon-completed": { color: "#ff4400 !important" },
              },
              "& .css-tbmob9": {
                backgroundColor: "rgb(33, 61, 112) !important",
                color: "white !important",
                fontSize: "0.7rem !important",
              },
              "& .css-1aixvs7": {
                backgroundColor: "#ff4400 !important",
                color: "white !important",
                fontSize: "0.7rem !important",
              },
              '& div[style*="background-color: rgb(0, 223, 11)"]': {
                backgroundColor: "rgb(33, 61, 112) !important",
                color: "white !important",
                fontSize: "0.7rem !important",
              },
              '& div[style*="background-color: rgb(255, 230, 0)"]': {
                backgroundColor: "#ff4400 !important",
                color: "white !important",
                fontSize: "0.7rem !important",
              },
            }}>
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

          <FormProvider {...methods}>
            <Box
              className="employee-wizard-content__form-container"
              sx={{
                opacity: isDisabled ? 0.6 : 1,
                pointerEvents: isDisabled ? "none" : "auto",
              }}>
              {CurrentStepComponent ? (
                <CurrentStepComponent
                  selectedGeneral={activeStep === 0 ? "general" : undefined}
                  selectedAddress={activeStep === 1 ? "address" : undefined}
                  selectedPosition={activeStep === 2 ? "position" : undefined}
                  selectedEmploymentType={
                    activeStep === 3 ? "employment" : undefined
                  }
                  selectedAttainment={
                    activeStep === 4 ? "attainment" : undefined
                  }
                  selectedAccount={activeStep === 5 ? "account" : undefined}
                  selectedContact={activeStep === 6 ? "contact" : undefined}
                  selectedFiles={activeStep === 7 ? "files" : undefined}
                  initialData={actualData}
                  employeeData={actualData}
                  isLoading={isDisabled}
                  mode={currentMode}
                  isViewMode={isViewMode}
                  isEditMode={isEditMode}
                  readOnly={isViewMode || isDisabled}
                  disabled={isViewMode || isDisabled}
                  showErrors={true}
                  pendingData={actualData}
                  filesData={actualData?.files || []}
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
        isCreateMode={false}
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
        showUpdateConfirmDialog={showUpdateConfirmDialog}
        onConfirmUpdate={handleConfirmUpdate}
        onCancelUpdate={handleCancelUpdate}
        submissionId={submissionId}
        isProcessing={isProcessing}
        handleResubmit={handleResubmit}
        shouldEnableResubmitButton={() =>
          shouldEnableResubmitButton(actualData, isSubmitting)
        }
        shouldEnableEditButton={() =>
          shouldEnableEditButton(actualData, isSubmitting)
        }
      />
    </Dialog>
  );
};

export default PendingRegistrationModal;
