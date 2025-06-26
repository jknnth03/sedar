import { useState, useRef, useEffect } from "react";
import {
  useCreateEmployeeMutation,
  useUpdateEmployeeMutation,
} from "../../../features/api/employee/mainApi";
import {
  extractFieldValue,
  buildEmployeeFormData,
  validateForServerSubmission,
} from "./Payload";
import {
  extractEmployeeData,
  formatEmployeeDisplay,
  buildEmployeeUpdateData,
} from "./dataExtractor";

export const useMultiFormLogic = ({
  open,
  onClose,
  isEditMode = false,
  editEmployeeData = null,
  initialStep = 0,
}) => {
  const [currentStep, setCurrentStep] = useState(initialStep);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({});
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [validationError, setValidationError] = useState("");
  const [successSnackbar, setSuccessSnackbar] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [visitedSteps, setVisitedSteps] = useState(new Set());
  const [currentEmployeeId, setCurrentEmployeeId] = useState(null);

  const [createEmployee] = useCreateEmployeeMutation();
  const [updateEmployee] = useUpdateEmployeeMutation();

  const formRefs = {
    general: useRef(null),
    address: useRef(null),
    position: useRef(null),
    employmentTypes: useRef(null),
    attainment: useRef(null),
    account: useRef(null),
    contact: useRef(null),
    file: useRef(null),
  };

  const stepLabels = [
    "GENERAL INFOS",
    "ADDRESSES",
    "EMPLOYEE POSITIONS",
    "EMPLOYMENT TYPES",
    "ATTAINMENTS",
    "ACCOUNTS",
    "CONTACTS",
    "FILES",
    "SUMMARY",
  ];

  const stepDataKeys = [
    "general",
    "address",
    "position",
    "employmentType",
    "attainment",
    "account",
    "contact",
    "file",
  ];

  const formatDateToMySQLFormat = (dateString) => {
    if (!dateString) return null;
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) return dateString;

    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return null;
      }

      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    } catch (error) {
      return null;
    }
  };

  const extractEmployeeId = (data) => {
    if (!data) return null;

    const idFields = [
      "id",
      "employee_id",
      "employeeId",
      "emp_id",
      "empId",
      "general_info.id",
      "general_info.employee_id",
      "general_info.emp_id",
      "general.id",
      "general.employee_id",
      "general.emp_id",
      "data.id",
      "data.employee_id",
      "data.emp_id",
    ];

    for (const field of idFields) {
      let value = data;
      const keys = field.split(".");

      for (const key of keys) {
        if (value && typeof value === "object" && key in value) {
          value = value[key];
        } else {
          value = null;
          break;
        }
      }

      if (value !== null && value !== undefined) {
        const numericId = parseInt(value, 10);
        if (!isNaN(numericId) && numericId > 0) {
          return numericId;
        }
      }
    }
    return null;
  };

  const normalizeIdField = (value) => {
    // Handle null, undefined, empty string, or "0"
    if (value === null || value === undefined || value === "" || value === "0")
      return null;

    // Handle object with id property
    if (typeof value === "object" && value !== null) {
      if (value.id !== undefined) {
        const parsed = parseInt(value.id, 10);
        return !isNaN(parsed) && parsed > 0 ? parsed : null;
      }
      if (value.value !== undefined) {
        const parsed = parseInt(value.value, 10);
        return !isNaN(parsed) && parsed > 0 ? parsed : null;
      }
      return null;
    }

    // Handle string or number values
    const parsed = parseInt(value, 10);
    return !isNaN(parsed) && parsed > 0 ? parsed : null;
  };

  const normalizeEmploymentTypeData = (data) => {
    if (!data || typeof data !== "object") return data;

    const normalized = { ...data };
    normalized.employment_type_label =
      data.employment_type_label || data.employment_type || "";

    if (data.employment_start_date || data.start_date) {
      normalized.employment_start_date = formatDateToMySQLFormat(
        data.employment_start_date || data.start_date
      );
    }

    if (data.employment_end_date || data.end_date) {
      normalized.employment_end_date = formatDateToMySQLFormat(
        data.employment_end_date || data.end_date
      );
    }

    if (data.regularization_date) {
      normalized.regularization_date = formatDateToMySQLFormat(
        data.regularization_date
      );
    }

    delete normalized.start_date;
    delete normalized.end_date;
    delete normalized.employment_type;

    return normalized;
  };

  const normalizeFormData = (data, dataKey) => {
    if (!data || typeof data !== "object") return data;

    const normalized = { ...data };

    switch (dataKey) {
      case "general":
        normalized.prefix_id = normalizeIdField(data.prefix_id || data.prefix);
        normalized.suffix_id = normalizeIdField(data.suffix_id || data.suffix);
        normalized.religion_id = normalizeIdField(
          data.religion_id || data.religion
        );
        if (data.birth_date) {
          normalized.birth_date = formatDateToMySQLFormat(data.birth_date);
        }
        break;

      case "address":
        normalized.region_id = normalizeIdField(data.region_id || data.region);
        normalized.province_id = normalizeIdField(
          data.province_id || data.province
        );
        normalized.city_municipality_id = normalizeIdField(
          data.city_municipality_id || data.city_municipality
        );
        normalized.barangay_id = normalizeIdField(
          data.barangay_id || data.barangay
        );
        normalized.sub_municipality_id = normalizeIdField(
          data.sub_municipality_id || data.sub_municipality
        );
        break;

      case "position":
        normalized.position_id = normalizeIdField(
          data.position_id || data.position
        );
        normalized.schedule_id = normalizeIdField(
          data.schedule_id || data.schedule
        );
        normalized.job_level_id = normalizeIdField(
          data.job_level_id || data.job_level
        );
        break;

      case "employmentType":
        return normalizeEmploymentTypeData(data);

      case "attainment":
        normalized.attainment_id = normalizeIdField(
          data.attainment_id || data.attainment
        );
        normalized.program_id = normalizeIdField(
          data.program_id || data.program
        );
        normalized.degree_id = normalizeIdField(data.degree_id || data.degree);
        normalized.honor_title_id = normalizeIdField(
          data.honor_title_id || data.honor_title
        );

        if (
          data.attainment_attachment &&
          typeof data.attainment_attachment === "string" &&
          data.attainment_attachment.startsWith("http")
        ) {
          delete normalized.attainment_attachment;
        }
        break;

      case "account":
        normalized.bank_id = normalizeIdField(data.bank_id || data.bank);
        break;
    }

    return normalized;
  };

  const validateCurrentForm = async () => {
    const currentFormRef = getCurrentFormRef();
    if (!currentFormRef?.current) {
      return {
        isValid: false,
        data: null,
        error: "Please fill-in all required fields before proceeding!",
      };
    }

    const form = currentFormRef.current;
    let data = null;
    let isValid = false;

    try {
      if (typeof form.validateAndGetData === "function") {
        const validationResult = form.validateAndGetData();
        isValid = validationResult?.isValid ?? !!validationResult;
        data = validationResult?.data ?? validationResult;
      } else if (typeof form.validate === "function") {
        isValid = form.validate();
        data = form.getData?.() || form.getFormData?.();
      } else {
        data = form.getData?.() || form.getFormData?.();
        isValid = !!data && Object.keys(data).length > 0;
      }

      if (currentStep === 3) {
        if (!data) {
          return {
            isValid: false,
            data,
            error: "Employment type data is required!",
          };
        }

        if (!data.employment_type_label && !data.employment_type) {
          return {
            isValid: false,
            data,
            error: "Employment type label is required!",
          };
        }

        if (!data.employment_start_date && !data.start_date) {
          return {
            isValid: false,
            data,
            error: "Employment start date is required!",
          };
        }

        data = normalizeEmploymentTypeData(data);

        if (!data.employment_type_label) {
          return {
            isValid: false,
            data,
            error: "Employment type label is required!",
          };
        }

        if (!data.employment_start_date) {
          return {
            isValid: false,
            data,
            error: "Employment start date is required!",
          };
        }
      }

      if (currentStep === 0) {
        const validationResult = validateGeneralForm(data);
        if (!validationResult.isValid) {
          return { isValid: false, data, error: validationResult.error };
        }
      }

      if (!data || Object.keys(data).length === 0) {
        return {
          isValid: false,
          data,
          error: "Please fill-in all required fields!",
        };
      }
    } catch (error) {
      return {
        isValid: false,
        data,
        error: "Please fill-in all required fields!",
      };
    }

    return {
      isValid,
      data,
      error: isValid ? null : "Please fill-in all required fields!",
    };
  };

  const validateGeneralForm = (data) => {
    if (!data) {
      return {
        isValid: false,
        error: "General information is required and cannot be empty!",
      };
    }

    const requiredFields = [
      {
        keys: ["first_name", "firstName", "fname", "First_Name"],
        label: "First Name",
      },
      {
        keys: ["last_name", "lastName", "lname", "Last_Name"],
        label: "Last Name",
      },
      {
        keys: ["prefix_id", "prefixId", "prefix", "Prefix_Id", "prefix_value"],
        label: "Prefix",
      },
      {
        keys: [
          "religion_id",
          "religionId",
          "religion",
          "Religion_Id",
          "religion_value",
        ],
        label: "Religion",
      },
      {
        keys: ["id_number", "idNumber", "id_num", "ID_Number"],
        label: "ID Number",
      },
    ];

    const missingFields = requiredFields.filter((field) => {
      let value = null;
      for (const key of field.keys) {
        if (data.hasOwnProperty(key)) {
          value = data[key];
          break;
        }
      }

      if (value === null || value === undefined) return true;
      if (typeof value === "string" && value.trim() === "") return true;

      if (field.label === "Prefix" || field.label === "Religion") {
        if (typeof value === "number" && value > 0) return false;
        if (typeof value === "string" && value.trim() !== "" && value !== "0")
          return false;
        return true;
      }

      if (field.label === "ID Number") {
        if (typeof value === "string" && value.trim() !== "") return false;
        if (typeof value === "number" && value !== 0) return false;
        return true;
      }

      return false;
    });

    const codeKeys = ["code", "employee_code", "emp_code", "Code"];
    const codeExists = codeKeys.some(
      (key) =>
        data.hasOwnProperty(key) &&
        data[key] &&
        data[key].toString().trim() !== ""
    );

    if (!codeExists) {
      const prefixExists = requiredFields[2].keys.some((key) => data[key]);
      const idNumberExists = requiredFields[4].keys.some((key) => data[key]);

      if (!prefixExists || !idNumberExists) {
        missingFields.push({ label: "Code (Prefix + ID Number combination)" });
      }
    }

    if (missingFields.length > 0) {
      return {
        isValid: false,
        error: `Please fill in these required fields: ${missingFields
          .map((f) => f.label)
          .join(", ")}`,
      };
    }

    return { isValid: true };
  };

  useEffect(() => {
    if (isEditMode && editEmployeeData && open && !isInitialized) {
      const employeeId = extractEmployeeId(editEmployeeData);

      if (!employeeId) {
        console.error("Error: Cannot find employee ID");
        setValidationError(
          "Error: Cannot find employee ID. Please close and try again."
        );
        return;
      }

      setCurrentEmployeeId(employeeId);

      const extractedData = extractEmployeeData(editEmployeeData) || {
        general: editEmployeeData.general_info || editEmployeeData,
        address: editEmployeeData.address || editEmployeeData.addresses?.[0],
        position:
          editEmployeeData.position_details ||
          editEmployeeData.positions ||
          editEmployeeData.position,
        employmentType:
          editEmployeeData.employment_types?.[0] ||
          editEmployeeData.employmentType,
        attainment:
          editEmployeeData.attainments?.[0] || editEmployeeData.attainment,
        account: editEmployeeData.account || editEmployeeData.accounts,
        contact: editEmployeeData.contacts || editEmployeeData.contact || [],
        file: editEmployeeData.files || editEmployeeData.file || [],
      };

      const normalizedData = {};
      Object.keys(extractedData).forEach((key) => {
        if (key === "employmentType") {
          normalizedData[key] = normalizeEmploymentTypeData(extractedData[key]);
        } else {
          normalizedData[key] = normalizeFormData(extractedData[key], key);
        }
      });

      setFormData(normalizedData);
      setCurrentStep(initialStep);
      setIsInitialized(true);
    }
  }, [isEditMode, editEmployeeData, open, initialStep, isInitialized]);

  useEffect(() => {
    if (isEditMode && isInitialized && formData) {
      const formMappings = [
        { ref: formRefs.general, data: formData.general },
        { ref: formRefs.address, data: formData.address },
        { ref: formRefs.position, data: formData.position },
        { ref: formRefs.employmentTypes, data: formData.employmentType },
        { ref: formRefs.attainment, data: formData.attainment },
        { ref: formRefs.account, data: formData.account },
        { ref: formRefs.contact, data: formData.contact },
        { ref: formRefs.file, data: formData.file },
      ];

      formMappings.forEach(({ ref, data }) => {
        if (ref.current?.setFormData && data) {
          ref.current.setFormData(data);
        }
      });
    }
  }, [formData, isEditMode, isInitialized]);

  useEffect(() => {
    if (!open) {
      setCurrentStep(isEditMode ? initialStep : 0);
      setFormData({});
      setValidationError("");
      setConfirmOpen(false);
      setIsInitialized(false);
      setVisitedSteps(new Set());
      setCurrentEmployeeId(null);
    }
  }, [open, isEditMode, initialStep]);

  const getCurrentFormRef = () => {
    const refMap = [
      formRefs.general,
      formRefs.address,
      formRefs.position,
      formRefs.employmentTypes,
      formRefs.attainment,
      formRefs.account,
      formRefs.contact,
      formRefs.file,
    ];
    return refMap[currentStep];
  };

  const hasExistingDataForStep = (stepIndex) => {
    if (stepIndex >= stepDataKeys.length) return false;
    const dataKey = stepDataKeys[stepIndex];
    const data = formData[dataKey];

    if (!data) return false;
    if (Array.isArray(data)) return data.length > 0;
    if (typeof data === "object") return Object.keys(data).length > 0;
    return !!data;
  };

  const collectAllFormData = async () => {
    const allFormData = { ...formData };

    for (let stepIndex = 0; stepIndex < stepDataKeys.length; stepIndex++) {
      const dataKey = stepDataKeys[stepIndex];

      if (visitedSteps.has(stepIndex) || stepIndex === currentStep) {
        const refMap = [
          formRefs.general,
          formRefs.address,
          formRefs.position,
          formRefs.employmentTypes,
          formRefs.attainment,
          formRefs.account,
          formRefs.contact,
          formRefs.file,
        ];

        const formRef = refMap[stepIndex];
        if (formRef?.current) {
          try {
            let stepData = null;
            const form = formRef.current;

            if (typeof form.validateAndGetData === "function") {
              const validationResult = form.validateAndGetData();
              stepData = validationResult?.data ?? validationResult;
            } else if (typeof form.getData === "function") {
              stepData = form.getData();
            } else if (typeof form.getFormData === "function") {
              stepData = form.getFormData();
            }

            if (stepData && Object.keys(stepData).length > 0) {
              allFormData[dataKey] = normalizeFormData(stepData, dataKey);
            }
          } catch (error) {
            console.error(
              `Error collecting data for step ${stepIndex}:`,
              error
            );
          }
        }
      }
    }

    return allFormData;
  };

  const handleApiError = (error, action) => {
    // Don't show localhost errors or server validation errors as alerts
    console.error(`API Error during ${action}:`, error);

    // Only show user-friendly errors, not technical server errors
    const message = error?.data?.message || error?.message;

    // Skip showing alerts for validation errors that contain "localhost" or are server-side validation
    if (
      message &&
      !message.includes("localhost") &&
      !message.includes("field must be")
    ) {
      alert(`Failed to ${action} employee. Please try again.`);
    }

    // Set validation error for form display instead of alert
    if (
      message &&
      (message.includes("field must be") || message.includes("required"))
    ) {
      setValidationError(message);
    }
  };

  const handleCreateEmployee = async () => {
    try {
      setIsLoading(true);
      const completeFormData = await collectAllFormData();

      const validation = validateForServerSubmission(completeFormData);
      if (!validation.isValid) {
        const errorMessage = validation.errors.join("\n");
        setValidationError(
          `Please fix the following errors before submitting:\n\n${errorMessage}`
        );
        return;
      }

      const payload = buildEmployeeFormData(completeFormData);
      await createEmployee(payload).unwrap();

      setSuccessSnackbar(true);
      handleCancel();
    } catch (error) {
      handleApiError(error, "add");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateEmployee = async () => {
    try {
      setIsLoading(true);

      if (!currentEmployeeId) {
        setValidationError(
          "Error: Employee ID is missing. Please close and try again."
        );
        return;
      }

      const completeFormData = await collectAllFormData();
      const updatePayload = buildEmployeeUpdateData(completeFormData);

      const requestData = {
        ...updatePayload,
        id: currentEmployeeId,
      };

      await updateEmployee(requestData).unwrap();

      setSuccessSnackbar(true);
      handleCancel();
    } catch (error) {
      handleApiError(error, "update");
    } finally {
      setIsLoading(false);
    }
  };

  const handleNext = async () => {
    setValidationError("");
    setVisitedSteps((prev) => new Set([...prev, currentStep]));

    if (currentStep === stepLabels.length - 1) {
      if (!isEditMode) {
        const completeFormData = await collectAllFormData();
        const validation = validateForServerSubmission(completeFormData);
        if (!validation.isValid) {
          setValidationError(
            `Please fix the following errors:\n${validation.errors.join("\n")}`
          );
          return;
        }
      }
      setConfirmOpen(true);
      return;
    }

    const validation = await validateCurrentForm();
    if (!validation.isValid) {
      setValidationError(validation.error);
      return;
    }

    if (currentStep < stepDataKeys.length) {
      const dataKey = stepDataKeys[currentStep];
      setFormData((prev) => {
        const newFormData = { ...prev };
        if (validation.data && Object.keys(validation.data).length > 0) {
          newFormData[dataKey] = validation.data;
        }
        return newFormData;
      });
    }

    setCurrentStep(currentStep + 1);
  };

  const handleBack = async () => {
    if (currentStep > 0) {
      try {
        setVisitedSteps((prev) => new Set([...prev, currentStep]));

        const validation = await validateCurrentForm();
        if (validation.data && currentStep < stepDataKeys.length) {
          const dataKey = stepDataKeys[currentStep];
          setFormData((prev) => ({ ...prev, [dataKey]: validation.data }));
        }
      } catch (error) {
        console.error("Error in handleBack:", error);
      }
      setCurrentStep(currentStep - 1);
    }
  };

  const handleCancel = () => {
    setCurrentStep(isEditMode ? initialStep : 0);
    setFormData({});
    setConfirmOpen(false);
    setValidationError("");
    setIsInitialized(false);
    setVisitedSteps(new Set());
    setCurrentEmployeeId(null);
    onClose();
  };

  const handleSubmitConfirm = () => {
    setConfirmOpen(false);
    if (isEditMode) {
      handleUpdateEmployee();
    } else {
      handleCreateEmployee();
    }
  };

  const handleStepClick = async (stepIndex) => {
    if (isEditMode) {
      setVisitedSteps((prev) => new Set([...prev, currentStep]));

      if (currentStep < stepDataKeys.length) {
        try {
          const validation = await validateCurrentForm();
          if (validation.data) {
            const dataKey = stepDataKeys[currentStep];
            setFormData((prev) => ({ ...prev, [dataKey]: validation.data }));
          }
        } catch (error) {
          console.error("Error in handleStepClick:", error);
        }
      }
      setCurrentStep(stepIndex);
    }
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === "clickaway") return;
    setSuccessSnackbar(false);
  };

  return {
    currentStep,
    formData,
    confirmOpen,
    validationError,
    successSnackbar,
    isFormLoading: isLoading,
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
    currentEmployeeId,
    extractEmployeeId,
  };
};
