import {
  createFlattenedEmployeeSchema,
  getStepValidationSchema,
} from "../../../../schema/employees/FlattenedEmployeeSchema.js";
import { STEPS } from "../../employee/multiFormModal/EmployeeWizardHelpers.js";

export const STEP_FIELD_MAP = {
  0: [
    "first_name",
    "last_name",
    "middle_name",
    "prefix",
    "id_number",
    "birth_date",
    "birth_place",
    "nationality",
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

export const FIELDS_TO_CONVERT_TO_OBJECT = [
  "region_id",
  "province_id",
  "city_municipality_id",
  "barangay_id",
  "position_id",
  "schedule_id",
  "job_level_id",
  "attainment_id",
  "program_id",
  "degree_id",
  "honor_title_id",
  "prefix",
  "religion",
  "referred_by",
  "bank",
];

export const REQUIRED_STRING_FIELDS = [
  "first_name",
  "last_name",
  "birth_date",
  "birth_place",
  "nationality",
  "gender",
  "civil_status",
];

export const REQUIRED_ID_FIELDS = [
  "region_id",
  "province_id",
  "city_municipality_id",
  "barangay_id",
  "position_id",
  "schedule_id",
  "job_level_id",
];

export const REQUIRED_ADDRESS_FIELDS = [
  "region_id",
  "province_id",
  "city_municipality_id",
  "barangay_id",
];

const extractFieldValue = (data, fieldName) => {
  const value = data[fieldName];

  if (typeof value === "string" || typeof value === "number") {
    return value;
  }

  if (value && typeof value === "object" && value.id !== undefined) {
    return value.id;
  }

  if (fieldName.endsWith("_id")) {
    const alternateField = fieldName.replace("_id", "");
    const alternateValue = data[alternateField];

    if (
      typeof alternateValue === "string" ||
      typeof alternateValue === "number"
    ) {
      return alternateValue;
    }

    if (
      alternateValue &&
      typeof alternateValue === "object" &&
      alternateValue.id !== undefined
    ) {
      return alternateValue.id;
    }
  }

  return value;
};

const validateFieldValue = (value, fieldName) => {
  if (value === null || value === undefined || value === "") {
    return false;
  }

  if (typeof value === "number") {
    return true;
  }

  if (typeof value === "string") {
    return value.trim() !== "";
  }

  if (typeof value === "object" && value.id !== undefined) {
    return value.id !== null && value.id !== undefined && value.id !== "";
  }

  return false;
};

export const getFieldStep = (fieldPath) => {
  for (const [step, fields] of Object.entries(STEP_FIELD_MAP)) {
    if (fields.some((field) => fieldPath.includes(field))) {
      return parseInt(step);
    }
  }
  return -1;
};

export const validateAndFixFormData = (data, label = "Form Data") => {
  const fixedData = { ...data };
  const validationResults = {
    isValid: true,
    errors: [],
    warnings: [],
    fixes: [],
    stepErrors: {},
    fieldDetails: {},
  };

  if (
    !fixedData.employment_types ||
    !Array.isArray(fixedData.employment_types) ||
    fixedData.employment_types.length === 0
  ) {
    fixedData.employment_types = [
      {
        id: null,
        employment_type_label: "REGULAR",
        employment_start_date: "",
        employment_end_date: "",
        regularization_date: "",
      },
    ];
    validationResults.fixes.push("Added default REGULAR employment type");
  }

  if (
    fixedData.attainment_attachment &&
    typeof fixedData.attainment_attachment === "string"
  ) {
    validationResults.warnings.push(
      "attainment_attachment is an existing file URL"
    );
  }

  FIELDS_TO_CONVERT_TO_OBJECT.forEach((field) => {
    if (fixedData[field] && typeof fixedData[field] === "number") {
      fixedData[field] = { id: fixedData[field] };
      validationResults.fixes.push(`Converted ${field} from number to object`);
    }
  });

  return { fixedData, validationResults };
};

export const createCustomValidationSchema = (mode = "edit") => {
  return {
    validate: (data) => {
      const errors = [];

      REQUIRED_STRING_FIELDS.forEach((field) => {
        const value = extractFieldValue(data, field);
        if (!validateFieldValue(value, field)) {
          errors.push(`${field} is required`);
        }
      });

      REQUIRED_ID_FIELDS.forEach((field) => {
        const value = extractFieldValue(data, field);
        if (!validateFieldValue(value, field)) {
          errors.push(`${field} is required`);
        }
      });

      if (
        !data.employment_types ||
        !Array.isArray(data.employment_types) ||
        data.employment_types.length === 0
      ) {
        errors.push("employment_types must have at least one entry");
      }

      if (!data.attainment_attachment) {
        errors.push("attainment_attachment is required");
      } else if (typeof data.attainment_attachment === "string") {
        if (!data.attainment_attachment.startsWith("http")) {
          errors.push("attainment_attachment must be a valid file or URL");
        }
      } else if (!(data.attainment_attachment instanceof File)) {
        errors.push("attainment_attachment must be a File object or valid URL");
      }

      return {
        isValid: errors.length === 0,
        errors,
      };
    },
  };
};

export const validateCurrentStep = async (stepIndex, getValues) => {
  try {
    const currentData = getValues();
    if (stepIndex === 1) {
      const addressErrors = [];

      for (const field of REQUIRED_ADDRESS_FIELDS) {
        const value = extractFieldValue(currentData, field);
        if (!validateFieldValue(value, field)) {
          addressErrors.push(field);
        }
      }
      if (addressErrors.length > 0) {
        return false;
      }
      return true;
    }

    if (stepIndex === 0) {
      const generalErrors = [];

      for (const field of REQUIRED_STRING_FIELDS) {
        const value = extractFieldValue(currentData, field);
        if (!validateFieldValue(value, field)) {
          generalErrors.push(field);
        }
      }

      if (generalErrors.length > 0) {
        return false;
      }
      return true;
    }

    if (stepIndex === 2) {
      const positionErrors = [];
      const positionRequiredFields = [
        "position_id",
        "schedule_id",
        "job_level_id",
      ];

      for (const field of positionRequiredFields) {
        const value = extractFieldValue(currentData, field);
        if (!validateFieldValue(value, field)) {
          positionErrors.push(field);
        }
      }

      if (positionErrors.length > 0) {
        return false;
      }
      return true;
    }

    if (
      stepIndex === 3 ||
      stepIndex === 4 ||
      stepIndex === 5 ||
      stepIndex === 6 ||
      stepIndex === 7
    ) {
      return true;
    }

    const transformedData = { ...currentData };
    FIELDS_TO_CONVERT_TO_OBJECT.forEach((field) => {
      const value = extractFieldValue(currentData, field);
      if (value !== null && value !== undefined) {
        transformedData[field] = value;
      }
    });

    const stepSchema = getStepValidationSchema(stepIndex);
    await stepSchema.validate(transformedData, { abortEarly: false });
    return true;
  } catch (error) {
    console.log("Error details:", error.inner || error.message);
    return false;
  }
};

export const generateErrorMessage = (error) => {
  let errorMessage = "Failed to update pending registration. Please try again.";

  if (error.inner && error.inner.length > 0) {
    const errorsByStep = {};

    error.inner.forEach((err) => {
      const stepIndex = getFieldStep(err.path);
      const stepName = stepIndex >= 0 ? STEPS[stepIndex] : "Unknown";

      if (!errorsByStep[stepName]) {
        errorsByStep[stepName] = [];
      }

      const fieldName = err.path
        .split(".")
        .pop()
        .replace(/_/g, " ")
        .replace(/\b\w/g, (l) => l.toUpperCase());
      errorsByStep[stepName].push(fieldName);
    });

    const stepErrors = Object.entries(errorsByStep).map(([step, fields]) => {
      if (fields.length === 1) {
        return `${step}: ${fields[0]} is required`;
      } else {
        return `${step}: ${fields.join(", ")} are required`;
      }
    });

    if (stepErrors.length === 1) {
      errorMessage = stepErrors[0];
    } else {
      errorMessage = `Please complete required fields in: ${stepErrors.join(
        "; "
      )}`;
    }
  } else if (error.message) {
    errorMessage = error.message;
  }

  return errorMessage;
};

export const handleStepNavigation = async (
  direction,
  currentStep,
  isViewMode,
  isDisabled,
  getValues,
  setActiveStep,
  setSubmissionResult
) => {
  if (isDisabled) return false;

  if (direction === "back") {
    setSubmissionResult(null);
    setActiveStep((prev) => prev - 1);
    return true;
  }

  if (isViewMode) {
    setActiveStep((prev) => prev + 1);
    return true;
  }

  setSubmissionResult(null);

  const stepValid = await validateCurrentStep(currentStep, getValues);
  if (!stepValid) {
    let errorMessage = "Please fill in all required fields to continue.";

    if (currentStep === 0) {
      errorMessage = "Please complete all required general information fields.";
    } else if (currentStep === 1) {
      errorMessage =
        "Please complete all required address fields (Region, Province, City/Municipality, Barangay).";
    } else if (currentStep === 2) {
      errorMessage =
        "Please complete all required position fields (Position, Schedule, Job Level).";
    }

    setSubmissionResult({
      type: "error",
      message: errorMessage,
    });
    return false;
  }

  setActiveStep((prev) => prev + 1);
  return true;
};

export const createFormErrorHandler = (setSubmissionResult) => {
  return (errors) => {
    let errorMessage = "Please fill in all required fields to continue.";
    const errorCount = Object.keys(errors).length;

    if (errorCount > 0) {
      errorMessage = `Please fix ${errorCount} validation error${
        errorCount > 1 ? "s" : ""
      } and try again.`;
    }

    setSubmissionResult({ type: "error", message: errorMessage });
  };
};

export const createStepperConfig = (
  activeStep,
  isViewMode,
  isDisabled,
  handleStepClick
) => ({
  activeStep,
  alternativeLabel: true,
  className: "employee-wizard-stepper",
  sx: {
    mb: 3,
    "& .MuiStepIcon-root": {
      "&.MuiStepIcon-active": {
        color: "rgb(33, 61, 112) !important",
      },
      "&.MuiStepIcon-completed": {
        color: "#ff4400 !important",
      },
    },
  },
  steps: STEPS.map((label, index) => ({
    key: label,
    label,
    stepProps: {
      sx: {
        cursor: isViewMode && !isDisabled ? "pointer" : "default",
        "&:hover": isViewMode && !isDisabled ? { opacity: 0.7 } : {},
        opacity: isDisabled ? 0.6 : 1,
      },
      onClick: () => handleStepClick(index),
    },
  })),
});
