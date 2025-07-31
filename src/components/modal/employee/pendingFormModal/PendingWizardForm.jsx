// import React, { useState, useCallback, useEffect, useRef } from "react";
// import { useForm, FormProvider } from "react-hook-form";
// import { yupResolver } from "@hookform/resolvers/yup";
// import {
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   Stepper,
//   Step,
//   StepLabel,
//   Box,
//   Typography,
//   IconButton,
//   Fade,
//   LinearProgress,
//   Tooltip,
//   StepIcon,
//   Backdrop,
//   CircularProgress,
// } from "@mui/material";
// import {
//   Close as CloseIcon,
//   CheckCircle,
//   Error,
//   Edit as EditIcon,
//   Cancel as CancelIcon,
// } from "@mui/icons-material";
// import "./Employee.scss";

// import {
//   createFlattenedPendingEmployeeSchema,
//   getStepValidationSchema,
// } from "../../../../schema/employees/FlattenedEmployeeSchema.js.jsx";
// import { useUpdateFormSubmissionMutation } from "../../../../features/api/employee/mainApi.js";
// import { transformPendingFormData } from "./PendingFormDataTransformer.jsx";
// import { CustomStepIcon } from "./EmployeeWizardStyledComponents.jsx";
// import {
//   STEPS,
//   initializeFormData,
//   validateStep,
//   getDialogTitle,
//   triggerRefetch,
// } from "./PendingFormHelper.js";

// import PendingAddressForm from "./forms/PendingAddressForm.jsx";
// import PendingPositionForm from "./forms/PendingPositionForm.jsx";
// import PendingEmploymentTypeForm from "./forms/PendingEmploymentTypesForm.jsx";
// import PendingAttainmentForm from "./forms/PendingAttainmentForm.jsx";
// import PendingAccountForm from "./forms/PendingAccountForm.jsx";
// import PendingContactForm from "./forms/PendingContactForm.jsx";
// import PendingFileForm from "./forms/PendingFileForm.jsx";
// import PendingReviewStep from "./forms/PendingReviewStep";
// import PendingGeneralForm from "./forms/PendingGeneralForm.jsx";
// import PendingWizardActions from "./PendingFormActions.jsx";
// import { getDefaultValues } from "./PendingGetvalues.jsx";

// const transformEmploymentTypesForAPI = (employmentTypes) => {
//   if (!employmentTypes || !Array.isArray(employmentTypes)) {
//     return [];
//   }

//   const formatDateForAPI = (date) => {
//     if (!date) return null;

//     if (typeof date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
//       return date;
//     }

//     let dateObj;
//     if (date instanceof Date) {
//       dateObj = date;
//     } else {
//       dateObj = new Date(date);
//     }

//     if (isNaN(dateObj.getTime())) {
//       return null;
//     }

//     return dateObj.toISOString().split("T")[0];
//   };

//   return employmentTypes.map((employment) => {
//     const transformedEmployment = {
//       id:
//         employment.id &&
//         typeof employment.id === "string" &&
//         employment.id.startsWith("employment_")
//           ? null
//           : employment.id && !isNaN(parseInt(employment.id))
//           ? parseInt(employment.id)
//           : null,
//       employment_type_label: employment.employment_type_label || "",
//     };

//     if (employment.employment_start_date) {
//       transformedEmployment.employment_start_date = formatDateForAPI(
//         employment.employment_start_date
//       );
//     }

//     if (employment.employment_end_date) {
//       transformedEmployment.employment_end_date = formatDateForAPI(
//         employment.employment_end_date
//       );
//     }

//     if (employment.regularization_date) {
//       transformedEmployment.regularization_date = formatDateForAPI(
//         employment.regularization_date
//       );
//     }

//     return transformedEmployment;
//   });
// };

// const getFieldStep = (fieldPath) => {
//   const stepFieldMap = {
//     0: [
//       "first_name",
//       "last_name",
//       "middle_name",
//       "prefix",
//       "id_number",
//       "birth_date",
//       "gender",
//       "civil_status",
//       "religion",
//       "suffix",
//       "referred_by",
//       "remarks",
//     ],
//     1: [
//       "region_id",
//       "province_id",
//       "city_municipality_id",
//       "barangay_id",
//       "street",
//       "zip_code",
//       "sub_municipality",
//       "foreign_address",
//       "address_remarks",
//     ],
//     2: [
//       "position_id",
//       "job_rate",
//       "allowance",
//       "additional_rate",
//       "additional_tools",
//       "additional_rate_remarks",
//       "schedule_id",
//       "job_level_id",
//     ],
//     3: ["employment_types"],
//     4: [
//       "attainment_id",
//       "program_id",
//       "degree_id",
//       "honor_title_id",
//       "academic_year_from",
//       "academic_year_to",
//       "gpa",
//       "institution",
//       "attainment_attachment",
//       "attainment_remarks",
//     ],
//     5: [
//       "sss_number",
//       "pag_ibig_number",
//       "philhealth_number",
//       "tin_number",
//       "bank",
//       "bank_account_number",
//     ],
//     6: ["email_address", "mobile_number", "contact_remarks"],
//     7: ["files"],
//     8: [],
//   };

//   for (const [step, fields] of Object.entries(stepFieldMap)) {
//     if (fields.some((field) => fieldPath.includes(field))) {
//       return parseInt(step);
//     }
//   }
//   return -1;
// };

// const getPendingEmployeeFullName = (data) => {
//   if (!data) return "";

//   const parts = [];

//   const prefix = data.prefix || data.Prefix;
//   const firstName = data.first_name || data.firstName || data.FirstName;
//   const middleName = data.middle_name || data.middleName || data.MiddleName;
//   const lastName = data.last_name || data.lastName || data.LastName;
//   const suffix = data.suffix || data.Suffix;

//   if (prefix) parts.push(prefix);
//   if (firstName) parts.push(firstName);
//   if (middleName) parts.push(middleName);
//   if (lastName) parts.push(lastName);
//   if (suffix) parts.push(suffix);

//   return parts.join(" ").trim();
// };

// const PendingWizardForm = ({
//   open,
//   onClose,
//   initialData = null,
//   mode = "edit",
//   initialStep = 0,
//   onSubmit: onSubmitProp,
//   onRefetch,
//   refetchQueries,
//   autoCloseAfterUpdate = true,
// }) => {
//   const [activeStep, setActiveStep] = useState(initialStep);
//   const [submissionResult, setSubmissionResult] = useState(null);
//   const [currentMode, setCurrentMode] = useState(mode);
//   const [originalMode, setOriginalMode] = useState(mode);
//   const [isProcessing, setIsProcessing] = useState(false);
//   const [isClosing, setIsClosing] = useState(false);
//   const [blockAllInteractions, setBlockAllInteractions] = useState(false);
//   const [isFormInitialized, setIsFormInitialized] = useState(false);

//   const isInitializedRef = useRef(false);
//   const lastInitialDataRef = useRef(null);

//   const [updateFormSubmission, { isLoading: isUpdating }] =
//     useUpdateFormSubmissionMutation();

//   const isSubmitting = (isUpdating || isProcessing) && !isClosing;
//   const isViewMode = currentMode === "view";
//   const isEditMode = currentMode === "edit";
//   const isCreateMode = currentMode === "create";
//   const isViewOrEditMode = isViewMode || isEditMode;
//   const isDisabled = isSubmitting || blockAllInteractions;

//   const methods = useForm({
//     defaultValues: getDefaultValues({ mode, initialData }),
//     resolver: yupResolver(createFlattenedPendingEmployeeSchema()),
//     mode: "onChange",
//     reValidateMode: "onChange",
//     shouldUnregister: false,
//   });

//   const {
//     handleSubmit,
//     reset,
//     watch,
//     setValue,
//     clearErrors,
//     getValues,
//     trigger,
//     formState: { errors },
//   } = methods;

//   const stepComponents = {
//     0: PendingGeneralForm,
//     1: PendingAddressForm,
//     2: PendingPositionForm,
//     3: PendingEmploymentTypeForm,
//     4: PendingAttainmentForm,
//     5: PendingAccountForm,
//     6: PendingContactForm,
//     7: PendingFileForm,
//     8: PendingReviewStep,
//   };

//   useEffect(() => {
//     if (!open) {
//       setActiveStep(initialStep);
//       setSubmissionResult(null);
//       setCurrentMode(mode);
//       setOriginalMode(mode);
//       setIsProcessing(false);
//       setIsClosing(false);
//       setBlockAllInteractions(false);
//       setIsFormInitialized(false);
//       isInitializedRef.current = false;
//       lastInitialDataRef.current = null;
//       return;
//     }

//     const shouldInitialize =
//       !isInitializedRef.current ||
//       JSON.stringify(initialData) !==
//         JSON.stringify(lastInitialDataRef.current);

//     if (shouldInitialize) {
//       const formData = initializeFormData(initialData);
//       reset(formData);
//       setIsFormInitialized(true);
//       setCurrentMode(mode);
//       setOriginalMode(mode);
//       isInitializedRef.current = true;
//       lastInitialDataRef.current = initialData;
//     }
//   }, [open, initialData, mode, initialStep, reset]);

//   const handleEmploymentTypeChange = useCallback(
//     (employmentTypes) => {
//       employmentTypes.forEach((employment, index) => {
//         if (
//           employment.employment_type_label === "PROBATIONARY" &&
//           employment.employment_start_date &&
//           !employment.employment_end_date
//         ) {
//           const startDate = new Date(employment.employment_start_date);
//           if (!isNaN(startDate.getTime())) {
//             const endDate = new Date(startDate);
//             endDate.setMonth(endDate.getMonth() + 6);
//             const calculatedEndDate = endDate.toISOString().split("T")[0];

//             setValue(
//               `employment_types.${index}.employment_end_date`,
//               calculatedEndDate,
//               {
//                 shouldValidate: false,
//                 shouldDirty: true,
//               }
//             );
//           }
//         }

//         if (employment.employment_type_label === "REGULAR") {
//           if (employment.employment_end_date) {
//             setValue(`employment_types.${index}.employment_end_date`, "", {
//               shouldValidate: false,
//               shouldDirty: true,
//             });
//           }
//           if (employment.employment_start_date) {
//             setValue(`employment_types.${index}.employment_start_date`, "", {
//               shouldValidate: false,
//               shouldDirty: true,
//             });
//           }
//         }
//       });
//     },
//     [setValue]
//   );

//   useEffect(() => {
//     if (!isFormInitialized || isDisabled) return;

//     const subscription = watch((value, { name }) => {
//       if (
//         name &&
//         (name.includes("employment_type_label") ||
//           name.includes("employment_start_date"))
//       ) {
//         const employmentTypes = value.employment_types || [];
//         handleEmploymentTypeChange(employmentTypes);
//       }
//     });

//     return () => subscription.unsubscribe();
//   }, [watch, handleEmploymentTypeChange, isFormInitialized, isDisabled]);

//   const validateCurrentStep = async (stepIndex) => {
//     try {
//       const stepSchema = getStepValidationSchema(stepIndex);
//       const currentData = getValues();

//       await stepSchema.validate(currentData, { abortEarly: false });
//       return true;
//     } catch (error) {
//       return false;
//     }
//   };

//   const handleNext = async () => {
//     if (isViewMode || isDisabled) {
//       if (isViewMode) {
//         setActiveStep((prev) => prev + 1);
//       }
//       return;
//     }

//     setSubmissionResult(null);

//     const stepValid = await validateCurrentStep(activeStep);
//     if (!stepValid) {
//       setSubmissionResult({
//         type: "error",
//         message: "Please fill in all required fields to continue.",
//       });
//       return;
//     }

//     setActiveStep((prev) => prev + 1);
//   };

//   const handleBack = () => {
//     if (isDisabled) return;
//     setSubmissionResult(null);
//     setActiveStep((prev) => prev - 1);
//   };

//   const handleStepClick = (stepIndex) => {
//     if (isDisabled || !isViewMode || stepIndex === activeStep) return;
//     setActiveStep(stepIndex);
//     setSubmissionResult(null);
//   };

//   const handleEditClick = () => {
//     if (isDisabled) return;
//     setCurrentMode("edit");
//     setSubmissionResult(null);
//   };

//   const handleCancelEdit = () => {
//     if (isDisabled) return;
//     if (originalMode === "view") {
//       setCurrentMode("view");
//     } else {
//       handleClose();
//     }
//     setSubmissionResult(null);
//     clearErrors();
//   };

//   const processSubmission = async (data) => {
//     const fullSchema = createFlattenedPendingEmployeeSchema();
//     await fullSchema.validate(data, { abortEarly: false });

//     const transformedData = transformPendingFormData(data);

//     Object.keys(transformedData).forEach((key) => {
//       if (transformedData[key] === undefined) {
//         delete transformedData[key];
//       }
//     });

//     transformedData.set("_method", "PATCH");
//     const formSubmissionId = initialData?.id || initialData?.form_submission_id;
//     if (!formSubmissionId) {
//       throw new Error("Form Submission ID is required for update mode");
//     }
//     const result = await updateFormSubmission({
//       id: formSubmissionId,
//       data: transformedData,
//     }).unwrap();

//     if (onSubmitProp) {
//       await onSubmitProp(transformedData, currentMode, result);
//     }

//     await triggerRefetch(onRefetch, refetchQueries);

//     return result;
//   };

//   const onSubmit = async (data) => {
//     if (isDisabled) return;

//     setIsProcessing(true);
//     setSubmissionResult(null);

//     try {
//       await processSubmission(data);

//       setSubmissionResult({
//         type: "success",
//         message: "Pending employee updated successfully!",
//       });

//       setBlockAllInteractions(true);
//       setIsClosing(true);
//       setTimeout(() => handleClose(), 1000);
//     } catch (error) {
//       let errorMessage = "Failed to update pending employee. Please try again.";

//       if (error.inner && error.inner.length > 0) {
//         const errorsByStep = {};

//         error.inner.forEach((err) => {
//           const stepIndex = getFieldStep(err.path);
//           const stepName = stepIndex >= 0 ? STEPS[stepIndex] : "Unknown";

//           if (!errorsByStep[stepName]) {
//             errorsByStep[stepName] = [];
//           }

//           const fieldName = err.path
//             .split(".")
//             .pop()
//             .replace(/_/g, " ")
//             .replace(/\b\w/g, (l) => l.toUpperCase());
//           errorsByStep[stepName].push(fieldName);
//         });

//         const stepErrors = Object.entries(errorsByStep).map(
//           ([step, fields]) => {
//             if (fields.length === 1) {
//               return `${step}: ${fields[0]} is required`;
//             } else {
//               return `${step}: ${fields.join(", ")} are required`;
//             }
//           }
//         );

//         if (stepErrors.length === 1) {
//           errorMessage = stepErrors[0];
//         } else {
//           errorMessage = `Please complete required fields in: ${stepErrors.join(
//             "; "
//           )}`;
//         }
//       } else if (error.message) {
//         errorMessage = error.message;
//       }

//       setSubmissionResult({ type: "error", message: errorMessage });
//     } finally {
//       setIsProcessing(false);
//     }
//   };

//   const handleUpdateAtStep = async () => {
//     if (isDisabled) return;

//     setIsProcessing(true);
//     setSubmissionResult(null);

//     try {
//       const currentData = getValues();

//       const fullSchema = createFlattenedPendingEmployeeSchema();
//       await fullSchema.validate(currentData, { abortEarly: false });

//       await processSubmission(currentData);

//       setSubmissionResult({
//         type: "success",
//         message: "Pending employee updated successfully!",
//       });

//       if (autoCloseAfterUpdate) {
//         setBlockAllInteractions(true);
//         setIsClosing(true);
//         setTimeout(() => handleClose(), 1000);
//       } else {
//         setTimeout(() => setSubmissionResult(null), 3000);
//       }
//     } catch (error) {
//       let errorMessage = "Failed to update pending employee. Please try again.";

//       if (error.inner && error.inner.length > 0) {
//         const errorsByStep = {};

//         error.inner.forEach((err) => {
//           const stepIndex = getFieldStep(err.path);
//           const stepName = stepIndex >= 0 ? STEPS[stepIndex] : "Unknown";

//           if (!errorsByStep[stepName]) {
//             errorsByStep[stepName] = [];
//           }

//           const fieldName = err.path
//             .split(".")
//             .pop()
//             .replace(/_/g, " ")
//             .replace(/\b\w/g, (l) => l.toUpperCase());
//           errorsByStep[stepName].push(fieldName);
//         });

//         const stepErrors = Object.entries(errorsByStep).map(
//           ([step, fields]) => {
//             if (fields.length === 1) {
//               return `${step}: ${fields[0]} is required`;
//             } else {
//               return `${step}: ${fields.join(", ")} are required`;
//             }
//           }
//         );

//         if (stepErrors.length === 1) {
//           errorMessage = stepErrors[0];
//         } else {
//           errorMessage = `Please complete required fields in: ${stepErrors.join(
//             "; "
//           )}`;
//         }
//       } else if (error.message) {
//         errorMessage = error.message;
//       }

//       setSubmissionResult({ type: "error", message: errorMessage });
//     } finally {
//       setIsProcessing(false);
//     }
//   };

//   const onError = (errors) => {
//     if (isDisabled) return;

//     let errorMessage = "Please fill in all required fields to continue.";
//     const errorCount = Object.keys(errors).length;

//     if (errorCount > 0) {
//       errorMessage = `Please fix ${errorCount} validation error${
//         errorCount > 1 ? "s" : ""
//       } and try again.`;
//     }

//     setSubmissionResult({ type: "error", message: errorMessage });
//   };

//   const handleClose = useCallback(() => {
//     setActiveStep(initialStep);
//     setSubmissionResult(null);
//     setCurrentMode(mode);
//     setOriginalMode(mode);
//     setIsProcessing(false);
//     setIsClosing(false);
//     setBlockAllInteractions(false);
//     setIsFormInitialized(false);
//     isInitializedRef.current = false;
//     lastInitialDataRef.current = null;

//     if (onClose) {
//       onClose();
//     }
//   }, [initialStep, mode, onClose]);

//   const CurrentStepComponent = stepComponents[activeStep];
//   const isLastStep = activeStep === STEPS.length - 1;
//   const isFirstStep = activeStep === 0;
//   const hasErrors = Object.keys(errors).length > 0;

//   const renderStepIcon = (props) => {
//     const { active, completed, icon } = props;
//     return isViewOrEditMode ? (
//       <CustomStepIcon
//         active={active}
//         completed={completed}
//         icon={icon}
//         isViewOrEditMode={isViewOrEditMode}
//       />
//     ) : (
//       <StepIcon {...props} />
//     );
//   };

//   if (!isFormInitialized && open) {
//     return (
//       <Dialog open={open} maxWidth="lg" fullWidth>
//         <Box sx={{ p: 3, textAlign: "center" }}>
//           <CircularProgress size={40} />
//           <Typography variant="body1" sx={{ mt: 2 }}>
//             Loading form...
//           </Typography>
//         </Box>
//       </Dialog>
//     );
//   }

//   return (
//     <Dialog
//       open={open}
//       maxWidth="lg"
//       fullWidth
//       disableEscapeKeyDown={isDisabled}
//       className="employee-wizard-dialog"
//       PaperProps={{
//         className: "employee-wizard-dialog__paper",
//       }}>
//       <Backdrop
//         sx={{
//           color: "#fff",
//           zIndex: (theme) => theme.zIndex.drawer + 1,
//           position: "absolute",
//           backgroundColor: "rgba(255, 255, 255, 0.8)",
//         }}
//         open={isSubmitting || blockAllInteractions}>
//         <Box
//           sx={{
//             display: "flex",
//             flexDirection: "column",
//             alignItems: "center",
//             gap: 2,
//           }}>
//           <CircularProgress size={40} />
//           <Typography variant="body1" color="primary">
//             Updating pending employee...
//           </Typography>
//         </Box>
//       </Backdrop>

//       <DialogTitle
//         className="employee-wizard-title"
//         sx={{ position: "relative" }}>
//         <Box className="employee-wizard-title__header">
//           <Typography variant="h5">{getDialogTitle(currentMode)}</Typography>
//           <Typography variant="body2">
//             {isViewOrEditMode && initialData
//               ? getPendingEmployeeFullName(initialData) ||
//                 `Step ${activeStep + 1} of ${STEPS.length}: ${
//                   STEPS[activeStep]
//                 }`
//               : `Step ${activeStep + 1} of ${STEPS.length}: ${
//                   STEPS[activeStep]
//                 }`}
//           </Typography>
//         </Box>

//         <Box
//           sx={{
//             position: "absolute",
//             right: 56,
//             top: 8,
//             display: "flex",
//             gap: 1,
//           }}>
//           {isViewMode && (
//             <Tooltip title="Edit Pending Employee">
//               <IconButton onClick={handleEditClick} disabled={isDisabled}>
//                 <EditIcon />
//               </IconButton>
//             </Tooltip>
//           )}

//           {isEditMode && originalMode === "view" && (
//             <Tooltip title="Cancel Edit">
//               <IconButton onClick={handleCancelEdit} disabled={isDisabled}>
//                 <CancelIcon />
//               </IconButton>
//             </Tooltip>
//           )}
//         </Box>

//         <IconButton
//           onClick={handleClose}
//           disabled={isDisabled}
//           sx={{ position: "absolute", right: 8, top: 8, zIndex: 1000 }}>
//           <CloseIcon />
//         </IconButton>
//       </DialogTitle>

//       {isSubmitting && <LinearProgress className="employee-wizard-progress" />}

//       <DialogContent className="employee-wizard-content">
//         <Box className="employee-wizard-content__inner">
//           {submissionResult && submissionResult.type === "error" && (
//             <Fade in={true} timeout={300}>
//               <Box
//                 sx={{
//                   mb: 2,
//                   display: "flex",
//                   alignItems: "center",
//                   gap: 1,
//                   px: 2,
//                   py: 1,
//                   backgroundColor: "#ffebee",
//                   borderRadius: 1,
//                   border: "1px solid #ffcdd2",
//                 }}>
//                 <Error sx={{ color: "#d32f2f", fontSize: "20px" }} />
//                 <Typography
//                   variant="body2"
//                   sx={{
//                     color: "#d32f2f",
//                     fontWeight: 500,
//                     flex: 1,
//                   }}>
//                   {submissionResult.message}
//                 </Typography>
//               </Box>
//             </Fade>
//           )}

//           {submissionResult && submissionResult.type === "success" && (
//             <Fade in={true} timeout={300}>
//               <Box
//                 sx={{
//                   mb: 2,
//                   display: "flex",
//                   alignItems: "center",
//                   gap: 1,
//                   px: 2,
//                   py: 1,
//                   backgroundColor: "#e8f5e8",
//                   borderRadius: 1,
//                   border: "1px solid #c8e6c9",
//                 }}>
//                 <CheckCircle sx={{ color: "#2e7d32", fontSize: "20px" }} />
//                 <Typography
//                   variant="body2"
//                   sx={{
//                     color: "#2e7d32",
//                     fontWeight: 500,
//                     flex: 1,
//                   }}>
//                   {submissionResult.message}
//                 </Typography>
//               </Box>
//             </Fade>
//           )}

//           <Stepper
//             activeStep={activeStep}
//             alternativeLabel
//             className="employee-wizard-stepper">
//             {STEPS.map((label, index) => (
//               <Step key={label}>
//                 <StepLabel
//                   className={index === activeStep ? "active" : ""}
//                   sx={{
//                     cursor: isViewMode && !isDisabled ? "pointer" : "default",
//                     "&:hover":
//                       isViewMode && !isDisabled ? { opacity: 0.7 } : {},
//                     opacity: isDisabled ? 0.6 : 1,
//                   }}
//                   onClick={() => handleStepClick(index)}
//                   StepIconComponent={renderStepIcon}>
//                   {label}
//                 </StepLabel>
//               </Step>
//             ))}
//           </Stepper>

//           <FormProvider {...methods}>
//             <Box
//               className="employee-wizard-content__form-container"
//               sx={{
//                 opacity: isDisabled ? 0.6 : 1,
//                 pointerEvents: isDisabled ? "none" : "auto",
//               }}>
//               {CurrentStepComponent ? (
//                 <CurrentStepComponent
//                   selectedGeneral={activeStep === 0 ? "general" : undefined}
//                   selectedAddress={activeStep === 1 ? "address" : undefined}
//                   selectedPosition={activeStep === 2 ? "position" : undefined}
//                   selectedEmploymentType={
//                     activeStep === 3 ? "employment" : undefined
//                   }
//                   selectedAttainment={
//                     activeStep === 4 ? "attainment" : undefined
//                   }
//                   selectedAccount={activeStep === 5 ? "account" : undefined}
//                   selectedContact={activeStep === 6 ? "contact" : undefined}
//                   selectedFiles={activeStep === 7 ? "files" : undefined}
//                   initialData={initialData}
//                   employeeData={initialData}
//                   isLoading={isDisabled}
//                   mode={currentMode}
//                   isViewMode={isViewMode}
//                   isEditMode={isEditMode}
//                   isCreateMode={isCreateMode}
//                   readOnly={isViewMode || isDisabled}
//                   disabled={isViewMode || isDisabled}
//                   showErrors={true}
//                 />
//               ) : (
//                 <Box sx={{ p: 3, textAlign: "center" }}>
//                   <Typography variant="h6" color="error">
//                     Component not found for step {activeStep}
//                   </Typography>
//                 </Box>
//               )}
//             </Box>
//           </FormProvider>
//         </Box>
//       </DialogContent>

//       <PendingWizardActions
//         isEditMode={isEditMode}
//         isViewMode={isViewMode}
//         isCreateMode={isCreateMode}
//         isSubmitting={isDisabled}
//         isFirstStep={isFirstStep}
//         isLastStep={isLastStep}
//         hasErrors={hasErrors}
//         handleUpdateAtStep={handleUpdateAtStep}
//         handleBack={handleBack}
//         handleNext={handleNext}
//         handleClose={handleClose}
//         handleSubmit={handleSubmit}
//         onSubmit={onSubmit}
//         onError={onError}
//       />
//     </Dialog>
//   );
// };

// export default PendingWizardForm;

import React from "react";

function PendingWizardForm() {
  return <div>PendingWizardForm</div>;
}

export default PendingWizardForm;
