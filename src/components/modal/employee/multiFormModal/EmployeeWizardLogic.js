import { useState, useCallback, useRef } from "react";
import {
  createFlattenedEmployeeSchema,
  getStepValidationSchema,
} from "../../../../schema/employees/FlattenedEmployeeSchema.js";
import { transformEmployeeData } from "./EmployeeDataTransformer.js";
import { STEPS, triggerRefetch } from "./EmployeeWizardHelpers.js";

import AddressForm from "./forms/AddressForm.jsx";
import PositionForm from "./forms/PositionForm.jsx";
import EmploymentTypeForm from "./forms/EmploymentTypesForm.jsx";
import AttainmentForm from "./forms/AttainmentForm.jsx";
import AccountForm from "./forms/AccountForm.jsx";
import ContactForm from "./forms/ContactForm.jsx";
import FileForm from "./forms/FileForm.jsx";
import ReviewStep from "./forms/ReviewStep";
import GeneralForm from "./forms/GeneralForm.jsx";

export const getStepComponents = () => ({
  0: GeneralForm,
  1: AddressForm,
  2: PositionForm,
  3: EmploymentTypeForm,
  4: AttainmentForm,
  5: AccountForm,
  6: ContactForm,
  7: FileForm,
  8: ReviewStep,
});

export const transformEmploymentTypesForAPI = (employmentTypes) => {
  if (!employmentTypes || !Array.isArray(employmentTypes)) return [];

  const formatDateForAPI = (date) => {
    if (!date) return null;
    if (typeof date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(date))
      return date;

    let dateObj = date instanceof Date ? date : new Date(date);
    return isNaN(dateObj.getTime())
      ? null
      : dateObj.toISOString().split("T")[0];
  };

  return employmentTypes.map((employment) => {
    const transformed = {
      id:
        employment.id &&
        typeof employment.id === "string" &&
        employment.id.startsWith("employment_")
          ? null
          : employment.id && !isNaN(parseInt(employment.id))
          ? parseInt(employment.id)
          : null,
      employment_type_label: employment.employment_type_label || "",
    };

    [
      "employment_start_date",
      "employment_end_date",
      "regularization_date",
    ].forEach((field) => {
      if (employment[field]) {
        transformed[field] = formatDateForAPI(employment[field]);
      }
    });

    return transformed;
  });
};

export const getFieldStep = (fieldPath) => {
  const stepFieldMap = {
    0: [
      "first_name",
      "last_name",
      "middle_name",
      "prefix",
      "id_number",
      "birth_date",
      "gender",
      "civil_status",
      "religion",
      "suffix",
      "referred_by",
      "remarks",
    ],
    1: [
      "region_id",
      "province_id",
      "city_municipality_id",
      "barangay_id",
      "street",
      "zip_code",
      "sub_municipality",
      "foreign_address",
      "address_remarks",
    ],
    2: [
      "position_id",
      "job_rate",
      "allowance",
      "additional_rate",
      "additional_tools",
      "additional_rate_remarks",
      "schedule_id",
      "job_level_id",
    ],
    3: ["employment_types"],
    4: [
      "attainment_id",
      "program_id",
      "degree_id",
      "honor_title_id",
      "academic_year_from",
      "academic_year_to",
      "gpa",
      "institution",
      "attainment_attachment",
      "attainment_remarks",
    ],
    5: [
      "sss_number",
      "pag_ibig_number",
      "philhealth_number",
      "tin_number",
      "bank",
      "bank_account_number",
    ],
    6: ["email_address", "mobile_number", "contact_remarks"],
    7: ["files"],
    8: [],
  };

  for (const [step, fields] of Object.entries(stepFieldMap)) {
    if (fields.some((field) => fieldPath.includes(field))) {
      return parseInt(step);
    }
  }
  return -1;
};

export const getEmployeeFullName = (data) => {
  if (!data) return "";

  const parts = [];
  const prefix = data.prefix || data.Prefix;
  const firstName = data.first_name || data.firstName || data.FirstName;
  const middleName = data.middle_name || data.middleName || data.MiddleName;
  const lastName = data.last_name || data.lastName || data.LastName;
  const suffix = data.suffix || data.Suffix;

  [prefix, firstName, middleName, lastName, suffix].forEach((part) => {
    if (part) parts.push(part);
  });

  return parts.join(" ").trim();
};

export const useEmployeeWizardLogic = (
  mode,
  initialStep,
  initialData,
  open
) => {
  const [activeStep, setActiveStep] = useState(initialStep);
  const [submissionResult, setSubmissionResult] = useState(null);
  const [currentMode, setCurrentMode] = useState(mode);
  const [originalMode, setOriginalMode] = useState(mode);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [blockAllInteractions, setBlockAllInteractions] = useState(false);
  const [isFormInitialized, setIsFormInitialized] = useState(false);

  const isInitializedRef = useRef(false);
  const lastInitialDataRef = useRef(null);

  const resetState = useCallback(() => {
    setActiveStep(initialStep);
    setSubmissionResult(null);
    setCurrentMode(mode);
    setOriginalMode(mode);
    setIsProcessing(false);
    setIsClosing(false);
    setBlockAllInteractions(false);
    setIsFormInitialized(false);
    isInitializedRef.current = false;
    lastInitialDataRef.current = null;
  }, [initialStep, mode]);

  return {
    activeStep,
    setActiveStep,
    submissionResult,
    setSubmissionResult,
    currentMode,
    setCurrentMode,
    originalMode,
    setOriginalMode,
    isProcessing,
    setIsProcessing,
    isClosing,
    setIsClosing,
    blockAllInteractions,
    setBlockAllInteractions,
    isFormInitialized,
    setIsFormInitialized,
    isInitializedRef,
    lastInitialDataRef,
    resetState,
  };
};

export const useEmploymentTypeHandler = (setValue) => {
  return useCallback(
    (employmentTypes) => {
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
            setValue(
              `employment_types.${index}.employment_end_date`,
              endDate.toISOString().split("T")[0],
              { shouldValidate: false, shouldDirty: true }
            );
          }
        }

        if (employment.employment_type_label === "REGULAR") {
          ["employment_end_date", "employment_start_date"].forEach((field) => {
            if (employment[field]) {
              setValue(`employment_types.${index}.${field}`, "", {
                shouldValidate: false,
                shouldDirty: true,
              });
            }
          });
        }
      });
    },
    [setValue]
  );
};

export const useFormSubmission = ({
  isDisabled,
  isCreateMode,
  currentMode,
  initialData,
  onSubmitProp,
  onRefetch,
  refetchQueries,
  createEmployee,
  updateEmployee,
  setIsProcessing,
  setSubmissionResult,
  setBlockAllInteractions,
  setIsClosing,
  handleClose,
  autoCloseAfterUpdate,
  getValues,
  setError,
}) => {
  const handleBackendValidationErrors = (error) => {
    const errorData = error?.data || error?.response?.data;

    if (errorData?.errors) {
      const { errors, message } = errorData;

      Object.entries(errors).forEach(([fieldName, errorMessages]) => {
        setError(fieldName, {
          type: "backend",
          message: Array.isArray(errorMessages)
            ? errorMessages[0]
            : errorMessages,
        });
      });

      const errorCount = Object.keys(errors).length;
      return (
        message ||
        `Please fix ${errorCount} validation error${errorCount > 1 ? "s" : ""}`
      );
    }

    return null;
  };

  const processSubmission = async (data, isUpdate = false) => {
    const fullSchema = createFlattenedEmployeeSchema();
    await fullSchema.validate(data, { abortEarly: false });

    const transformedData = transformEmployeeData(data);
    Object.keys(transformedData).forEach((key) => {
      if (transformedData[key] === undefined) delete transformedData[key];
    });

    let result;
    if (isUpdate) {
      transformedData.set("_method", "PATCH");
      const employeeId = initialData?.id || initialData?.employee_id;
      if (!employeeId)
        throw new Error("Employee ID is required for update mode");
      result = await updateEmployee({
        id: employeeId,
        data: transformedData,
      }).unwrap();
    } else {
      transformedData.set("_method", "POST");
      result = await createEmployee(transformedData).unwrap();
    }

    // Refetch queries BEFORE calling onSubmitProp to ensure data is fresh
    if (refetchQueries && Array.isArray(refetchQueries)) {
      await Promise.all(
        refetchQueries.map(async (query) => {
          try {
            if (typeof query === "function") {
              await query();
            } else if (query && typeof query.refetch === "function") {
              await query.refetch();
            }
          } catch (error) {
            console.error("Error refetching query:", error);
          }
        })
      );
    }

    if (onRefetch) {
      await onRefetch();
    }

    if (onSubmitProp) {
      await onSubmitProp(transformedData, currentMode, result);
    }

    return result;
  };

  const formatValidationErrors = (error) => {
    if (!error.inner || error.inner.length === 0)
      return error.message || "Validation failed";

    const errorsByStep = {};
    error.inner.forEach((err) => {
      const stepIndex = getFieldStep(err.path);
      const stepName = stepIndex >= 0 ? STEPS[stepIndex] : "Unknown";

      if (!errorsByStep[stepName]) errorsByStep[stepName] = [];
      errorsByStep[stepName].push({
        field: err.path
          .split(".")
          .pop()
          .replace(/_/g, " ")
          .replace(/\b\w/g, (l) => l.toUpperCase()),
        message: err.message,
      });
    });

    const stepErrors = Object.entries(errorsByStep).map(
      ([step, fieldErrors]) => {
        const messages = fieldErrors.map(({ message }) => message);
        return `${step}: ${messages.join("; ")}`;
      }
    );

    return stepErrors.length === 1
      ? stepErrors[0]
      : `Please fix validation errors: ${stepErrors.join("; ")}`;
  };

  const onSubmit = async (data) => {
    if (isDisabled) return;

    setIsProcessing(true);
    setSubmissionResult(null);

    try {
      await processSubmission(data, !isCreateMode);

      setSubmissionResult({
        type: "success",
        message: `Employee ${
          isCreateMode ? "created" : "updated"
        } successfully!`,
      });

      setBlockAllInteractions(true);
      setIsClosing(true);

      setTimeout(() => handleClose(), 1500);
    } catch (error) {
      const backendErrorMessage = handleBackendValidationErrors(error);

      const errorMessage =
        backendErrorMessage ||
        formatValidationErrors(error) ||
        `Failed to ${
          isCreateMode ? "create" : "update"
        } employee. Please try again.`;

      setSubmissionResult({ type: "error", message: errorMessage });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUpdateAtStep = async () => {
    if (isDisabled) return;

    setIsProcessing(true);
    setSubmissionResult(null);

    try {
      const currentData = getValues();
      const fullSchema = createFlattenedEmployeeSchema();
      await fullSchema.validate(currentData, { abortEarly: false });
      await processSubmission(currentData, true);

      setSubmissionResult({
        type: "success",
        message: "Employee updated successfully!",
      });

      if (autoCloseAfterUpdate) {
        setBlockAllInteractions(true);
        setIsClosing(true);
        setTimeout(() => handleClose(), 1500);
      } else {
        setTimeout(() => setSubmissionResult(null), 3000);
      }
    } catch (error) {
      const backendErrorMessage = handleBackendValidationErrors(error);

      const errorMessage =
        backendErrorMessage ||
        formatValidationErrors(error) ||
        "Failed to update employee. Please try again.";

      setSubmissionResult({ type: "error", message: errorMessage });
    } finally {
      setIsProcessing(false);
    }
  };

  const onError = (errors) => {
    if (isDisabled) return;
    const errorCount = Object.keys(errors).length;
    const errorMessage =
      errorCount > 0
        ? `Please fix ${errorCount} validation error${
            errorCount > 1 ? "s" : ""
          } and try again.`
        : "Please fill in all required fields to continue.";
    setSubmissionResult({ type: "error", message: errorMessage });
  };

  return { processSubmission, onSubmit, handleUpdateAtStep, onError };
};

export const useStepNavigation = (
  activeStep,
  setActiveStep,
  setSubmissionResult,
  isDisabled,
  isViewMode,
  getValues
) => {
  const validateCurrentStep = async (stepIndex) => {
    try {
      const stepSchema = getStepValidationSchema(stepIndex);
      await stepSchema.validate(getValues(), { abortEarly: false });
      return true;
    } catch {
      return false;
    }
  };

  const handleNext = async () => {
    if (isViewMode || isDisabled) {
      if (isViewMode) setActiveStep((prev) => prev + 1);
      return;
    }

    setSubmissionResult(null);
    const stepValid = await validateCurrentStep(activeStep);
    if (!stepValid) {
      setSubmissionResult({
        type: "error",
        message: "Please fill in all required fields to continue.",
      });
      return;
    }
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    if (isDisabled) return;
    setSubmissionResult(null);
    setActiveStep((prev) => prev - 1);
  };

  const handleStepClick = (stepIndex) => {
    if (isDisabled || !isViewMode || stepIndex === activeStep) return;
    setActiveStep(stepIndex);
    setSubmissionResult(null);
  };

  return { handleNext, handleBack, handleStepClick };
};
