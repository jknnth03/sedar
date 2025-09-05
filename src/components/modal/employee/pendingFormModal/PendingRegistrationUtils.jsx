import PendingAddressForm from "./pendingForms/PendingAddressForm.jsx";
import PendingPositionForm from "./pendingForms/PendingPositionForm.jsx";
import PendingEmploymentTypesForm from "./pendingForms/PendingEmploymentTypeForm.jsx";
import PendingAttainmentForm from "./pendingForms/PendingAttainmentForm.jsx";
import PendingAccountForm from "./pendingForms/PendingAccountForm.jsx";
import PendingContactForm from "./pendingForms/PendingContactForm.jsx";
import PendingFileForm from "./pendingForms/PendingFileForm.jsx";
import PendingGeneralInformationForm from "./pendingForms/PendingGeneralInformationForm.jsx";
import PendingReviewStep from "./pendingForms/PendingReviewStep.jsx";

import { getPendingValues } from "../pendingFormModal/PendingGetValues.jsx";
import { triggerRefetch } from "../../employee/multiFormModal/EmployeeWizardHelpers.js";

export const stepComponents = {
  0: PendingGeneralInformationForm,
  1: PendingAddressForm,
  2: PendingPositionForm,
  3: PendingEmploymentTypesForm,
  4: PendingAttainmentForm,
  5: PendingAccountForm,
  6: PendingContactForm,
  7: PendingFileForm,
  8: PendingReviewStep,
};

export const getEmployeeFullName = (data) => {
  if (!data) return "";

  const parts = [];

  const prefix = data.prefix || data.Prefix;
  const firstName = data.first_name || data.firstName || data.FirstName;
  const middleName = data.middle_name || data.middleName || data.MiddleName;
  const lastName = data.last_name || data.lastName || data.LastName;
  const suffix = data.suffix || data.Suffix;

  if (prefix) parts.push(prefix);
  if (firstName) parts.push(firstName);
  if (middleName) parts.push(middleName);
  if (lastName) parts.push(lastName);
  if (suffix) parts.push(suffix);

  return parts.join(" ").trim();
};

export const getPendingDialogTitle = (mode) => {
  switch (mode) {
    case "view":
      return "VIEW PENDING REGISTRATION";
    case "edit":
      return "EDIT PENDING REGISTRATION";
    default:
      return "PENDING REGISTRATION";
  }
};

export const shouldFetchPendingData = (submissionId, initialData) => {
  return Boolean(
    submissionId &&
      (!initialData ||
        typeof initialData === "number" ||
        typeof initialData === "string" ||
        !initialData.general_info)
  );
};

export const transformPendingEmployeeData = (formData) => {
  const transformedData = new FormData();

  const safeAppend = (key, value) => {
    if (value !== null && value !== undefined && value !== "") {
      transformedData.append(key, value);
    }
  };

  const extractId = (value) => {
    if (!value) return null;
    if (typeof value === "object" && value.id) return value.id;
    return value;
  };

  const safeAppendWithValidation = (key, value) => {
    if (value !== null && value !== undefined && value !== "" && value !== 0) {
      transformedData.append(key, value);
    }
  };

  safeAppend("_method", "PATCH");

  safeAppend("first_name", formData.first_name);
  safeAppend("middle_name", formData.middle_name);
  safeAppend("last_name", formData.last_name);
  safeAppend("employee_code", formData.employee_code);
  safeAppend("suffix", formData.suffix);
  safeAppendWithValidation("prefix_id", extractId(formData.prefix));
  safeAppend("id_number", formData.id_number);
  safeAppend("birth_date", formData.birth_date);
  safeAppendWithValidation("religion_id", extractId(formData.religion));
  safeAppend("civil_status", formData.civil_status);
  safeAppend("gender", formData.gender);
  safeAppendWithValidation("referrer_id", extractId(formData.referred_by));
  safeAppend("remarks", formData.remarks);

  safeAppendWithValidation("region_id", extractId(formData.region_id));
  safeAppendWithValidation("province_id", extractId(formData.province_id));
  safeAppendWithValidation(
    "city_municipality_id",
    extractId(formData.city_municipality_id)
  );
  safeAppend("sub_municipality", formData.sub_municipality);
  safeAppendWithValidation("barangay_id", extractId(formData.barangay_id));
  safeAppend("street", formData.street);
  safeAppend("zip_code", formData.zip_code);
  safeAppend("local_address", formData.local_address);
  safeAppend("foreign_address", formData.foreign_address);
  safeAppend("address_remarks", formData.address_remarks);

  const positionId = extractId(formData.position_id);
  if (positionId) {
    safeAppend("position_id", positionId);
  }

  const scheduleId = extractId(formData.schedule_id);
  if (scheduleId) {
    safeAppend("schedule_id", scheduleId);
  }

  const jobLevelId = extractId(formData.job_level_id);
  if (jobLevelId) {
    safeAppend("job_level_id", jobLevelId);
  }

  safeAppend("job_rate", formData.job_rate || 0);
  safeAppend("allowance", formData.allowance || 0);
  safeAppend("salary", formData.salary || 0);
  safeAppend("additional_rate", formData.additional_rate || 0);
  safeAppend("additional_rate_remarks", formData.additional_rate_remarks);
  safeAppend("additional_tools", formData.additional_tools);

  if (formData.employment_types && Array.isArray(formData.employment_types)) {
    formData.employment_types.forEach((employment, index) => {
      if (employment && typeof employment === "object") {
        if (employment.employment_type_label || employment.id) {
          if (employment.id) {
            transformedData.append(
              `employment_types[${index}][id]`,
              employment.id
            );
          }
          safeAppend(
            `employment_types[${index}][employment_type_label]`,
            employment.employment_type_label
          );
          safeAppend(
            `employment_types[${index}][employment_start_date]`,
            employment.employment_start_date
          );
          safeAppend(
            `employment_types[${index}][employment_end_date]`,
            employment.employment_end_date
          );
          safeAppend(
            `employment_types[${index}][regularization_date]`,
            employment.regularization_date
          );
        }
      }
    });
  }

  const attainmentId = extractId(formData.attainment_id);
  if (attainmentId) {
    transformedData.append("attainment_id", attainmentId);
  }

  const programId = extractId(formData.program_id);
  if (programId) {
    transformedData.append("program_id", programId);
  }

  const degreeId = extractId(formData.degree_id);
  if (degreeId) {
    transformedData.append("degree_id", degreeId);
  }

  const honorTitleId = extractId(formData.honor_title_id);
  if (honorTitleId) {
    transformedData.append("honor_title_id", honorTitleId);
  }

  safeAppend("academic_year_from", formData.academic_year_from);
  safeAppend("academic_year_to", formData.academic_year_to);
  safeAppend("gpa", formData.gpa);
  safeAppend("institution", formData.institution);
  safeAppend("attainment_remarks", formData.attainment_remarks);

  if (
    formData.attainment_attachment &&
    formData.attainment_attachment instanceof File
  ) {
    transformedData.append(
      "attainment_attachment",
      formData.attainment_attachment
    );
  }

  safeAppend("sss_number", formData.sss_number);
  safeAppend("pag_ibig_number", formData.pag_ibig_number);
  safeAppend("philhealth_number", formData.philhealth_number);
  safeAppend("tin_number", formData.tin_number);

  const bankId = extractId(formData.bank);
  if (bankId) {
    transformedData.append("bank_id", bankId);
  }

  safeAppend("bank_account_number", formData.bank_account_number);

  safeAppend("email_address", formData.email_address);
  safeAppend("mobile_number", formData.mobile_number);
  safeAppend("email_address_remarks", formData.email_address_remarks);
  safeAppend("mobile_number_remarks", formData.mobile_number_remarks);
  safeAppend("contact_remarks", formData.contact_remarks);

  return transformedData;
};

export const initializePendingFormData = (initialData) => {
  let formData;
  if (
    initialData &&
    typeof initialData === "object" &&
    !Array.isArray(initialData)
  ) {
    formData = getPendingValues({ mode: "view", initialData });
  } else {
    formData = getPendingValues({ mode: "view", initialData: null });
  }

  if (
    !formData.employment_types ||
    !Array.isArray(formData.employment_types) ||
    formData.employment_types.length === 0
  ) {
    formData.employment_types = [
      {
        id: null,
        employment_type_label: "REGULAR",
        employment_start_date: "",
        employment_end_date: "",
        regularization_date: "",
      },
    ];
  }

  return formData;
};

export const createEmploymentTypeChangeHandler = (setValue) => {
  return (employmentTypes) => {
    employmentTypes.forEach((employment, index) => {
      if (
        employment.employment_type_label === "PROBATIONARY" &&
        employment.employment_start_date &&
        !employment.employment_end_date
      ) {
        const startDate = new Date(employment.employment_start_date);
        if (!isNaN(startDate.getTime())) {
          const endDate = new Date(startDate);
          endDate.setMonth(endDate.getMonth() + 6);
          const calculatedEndDate = endDate.toISOString().split("T")[0];

          setValue(
            `employment_types.${index}.employment_end_date`,
            calculatedEndDate,
            {
              shouldValidate: false,
              shouldDirty: true,
            }
          );
        }
      }

      if (employment.employment_type_label === "REGULAR") {
        if (employment.employment_end_date) {
          setValue(`employment_types.${index}.employment_end_date`, "", {
            shouldValidate: false,
            shouldDirty: true,
          });
        }
        if (employment.employment_start_date) {
          setValue(`employment_types.${index}.employment_start_date`, "", {
            shouldValidate: false,
            shouldDirty: true,
          });
        }
      }
    });
  };
};

export const enhancedProcessFormSubmission = async ({
  data,
  submissionId,
  actualData,
  updateFormSubmission,
  onSubmitProp,
  currentMode,
  onRefetch,
  refetchQueries,
}) => {
  const transformedData = transformPendingEmployeeData(data);

  const submissionIdToUse =
    submissionId ||
    actualData?.submission_id ||
    actualData?.id ||
    actualData?.submittable?.id;

  if (!submissionIdToUse) {
    throw new Error("Submission ID is required for update mode");
  }

  try {
    const result = await updateFormSubmission({
      id: submissionIdToUse,
      data: transformedData,
    }).unwrap();

    if (onSubmitProp) {
      await onSubmitProp(transformedData, currentMode, result);
    }

    await triggerRefetch(onRefetch, refetchQueries);

    return result;
  } catch (apiError) {
    throw apiError;
  }
};

export const getSubmissionId = (initialData) => {
  if (!initialData) return null;

  if (typeof initialData === "number") return initialData;
  if (typeof initialData === "string") return initialData;

  if (initialData.submission_id) return initialData.submission_id;
  if (initialData.id) return initialData.id;
  if (initialData.submittable?.id) return initialData.submittable.id;

  return null;
};

export const getActualData = (fetchedData, initialData) => {
  if (fetchedData) {
    return fetchedData;
  }

  if (
    initialData &&
    typeof initialData === "object" &&
    !Array.isArray(initialData)
  ) {
    return initialData;
  }

  return null;
};

export const createInitialState = (initialStep = 0, mode = "view") => ({
  activeStep: initialStep,
  submissionResult: null,
  currentMode: mode,
  originalMode: mode,
  isProcessing: false,
  isClosing: false,
  blockAllInteractions: false,
  isFormInitialized: false,
  showUpdateConfirmDialog: false,
  pendingUpdateData: null,
});

export const shouldInitializeForm = (
  isInitializedRef,
  lastInitialDataRef,
  actualData,
  shouldFetchData
) => {
  const hasMeaningfulData =
    actualData &&
    typeof actualData === "object" &&
    (actualData.general_info ||
      actualData.first_name ||
      actualData.result ||
      actualData.id);

  const shouldInitialize =
    !isInitializedRef.current ||
    (!lastInitialDataRef.current && hasMeaningfulData) ||
    JSON.stringify(actualData) !== JSON.stringify(lastInitialDataRef.current);

  return shouldInitialize && (hasMeaningfulData || !shouldFetchData);
};

export const shouldEnableEditButton = (actualData, isSubmitting) => {
  if (!actualData || isSubmitting) {
    return false;
  }

  const status = actualData.status?.toLowerCase();
  return (
    status !== "pending" && status !== "cancelled" && status !== "approved"
  );
};

export const shouldEnableResubmitButton = (actualData, isSubmitting) => {
  if (!actualData || isSubmitting) return false;
  const resubmissionUpdatedAt = actualData.resubmission_data_updated_at;
  return (
    resubmissionUpdatedAt !== null &&
    resubmissionUpdatedAt !== undefined &&
    resubmissionUpdatedAt !== ""
  );
};

export const resetModalState = (
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
) => {
  setActiveStep(initialStep);
  setSubmissionResult(null);
  setCurrentMode(mode);
  setOriginalMode(mode);
  setIsProcessing(false);
  setIsClosing(false);
  setBlockAllInteractions(false);
  setIsFormInitialized(false);
  setShowUpdateConfirmDialog(false);
  setPendingUpdateData(null);
  isInitializedRef.current = false;
  lastInitialDataRef.current = null;
  clearErrors();
};

export const handleSuccessAndClose = (
  message,
  setSubmissionResult,
  setBlockAllInteractions,
  setIsClosing,
  handleClose,
  onRefetch,
  autoCloseAfterUpdate = true,
  delay = 1000
) => {
  setSubmissionResult({
    type: "success",
    message,
  });

  if (onRefetch) onRefetch();

  if (autoCloseAfterUpdate) {
    setBlockAllInteractions(true);
    setIsClosing(true);
    setTimeout(() => handleClose(), delay);
  } else {
    setTimeout(() => setSubmissionResult(null), 3000);
  }
};

export const handleResubmitLogic = async (
  shouldEnableResubmitButton,
  submissionId,
  resubmitFormSubmission,
  setIsProcessing,
  setSubmissionResult,
  setBlockAllInteractions,
  setIsClosing,
  handleClose,
  onRefetch
) => {
  if (!shouldEnableResubmitButton()) return;

  setIsProcessing(true);
  try {
    await resubmitFormSubmission(submissionId);

    handleSuccessAndClose(
      "Registration resubmitted successfully!",
      setSubmissionResult,
      setBlockAllInteractions,
      setIsClosing,
      handleClose,
      onRefetch
    );
  } catch (error) {
    const errorMessage =
      error?.message || "Failed to resubmit registration. Please try again.";
    setSubmissionResult({ type: "error", message: errorMessage });
  } finally {
    setIsProcessing(false);
  }
};

export const handleFormSubmission = async (
  data,
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
  autoCloseAfterUpdate = true
) => {
  setIsProcessing(true);
  setSubmissionResult(null);

  try {
    const result = await enhancedProcessFormSubmission({
      data,
      submissionId,
      actualData,
      updateFormSubmission,
      onSubmitProp,
      currentMode,
      onRefetch,
      refetchQueries,
    });

    handleSuccessAndClose(
      "Pending registration updated successfully!",
      setSubmissionResult,
      setBlockAllInteractions,
      setIsClosing,
      handleClose,
      onRefetch,
      autoCloseAfterUpdate
    );

    return result;
  } catch (error) {
    const errorMessage =
      error?.message ||
      "Failed to update pending registration. Please try again.";
    setSubmissionResult({ type: "error", message: errorMessage });
    throw error;
  } finally {
    setIsProcessing(false);
  }
};

export const handleEditModeToggle = (
  action,
  originalMode,
  setCurrentMode,
  setSubmissionResult,
  clearErrors,
  handleClose
) => {
  if (action === "enter") {
    setCurrentMode("edit");
    setSubmissionResult(null);
  } else if (action === "cancel") {
    if (originalMode === "view") {
      setCurrentMode("view");
    } else {
      handleClose();
    }
    setSubmissionResult(null);
    clearErrors();
  }
};

export const createLoadingDialog = (
  open,
  message = "Loading registration data..."
) => ({
  open,
  maxWidth: "lg",
  fullWidth: true,
  PaperProps: {
    sx: {
      height: "90vh",
      maxHeight: "90vh",
      display: "flex",
      flexDirection: "column",
    },
  },
  content: {
    sx: { p: 3, textAlign: "center" },
    message,
  },
});

export const createErrorDialog = (
  open,
  handleClose,
  error = "Failed to load registration data. Please try again."
) => ({
  open,
  maxWidth: "lg",
  fullWidth: true,
  PaperProps: {
    sx: {
      height: "90vh",
      maxHeight: "90vh",
      display: "flex",
      flexDirection: "column",
    },
  },
  content: {
    sx: { p: 3, textAlign: "center" },
    title: "Error Loading Data",
    message: error,
    onClose: handleClose,
  },
});

export const createNotificationConfig = (submissionResult) => {
  if (!submissionResult) return null;

  const isError = submissionResult.type === "error";

  return {
    show: true,
    type: submissionResult.type,
    message: submissionResult.message,
    sx: {
      mb: 2,
      display: "flex",
      alignItems: "center",
      gap: 1,
      px: 2,
      py: 1,
      backgroundColor: isError ? "#ffebee" : "#e8f5e8",
      borderRadius: 1,
      border: `1px solid ${isError ? "#ffcdd2" : "#c8e6c9"}`,
    },
    iconColor: isError ? "#d32f2f" : "#2e7d32",
    textColor: isError ? "#d32f2f" : "#2e7d32",
  };
};
