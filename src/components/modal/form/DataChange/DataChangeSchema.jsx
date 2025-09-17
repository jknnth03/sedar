import * as yup from "yup";

// Default values for the form
export const dataChangeDefaultValues = {
  form_id: null,
  employee_id: null,
  new_position_id: null,
  reason_for_change: "",
  remarks: "",
  data_change_attachment: null,
  data_change_attachment_filename: null,
};

// File validation helper
const fileValidation = (mode, hasExistingFile) => {
  // Allowed file types
  const allowedTypes = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "image/jpeg",
    "image/jpg",
    "image/png",
  ];

  // File extensions for display
  const allowedExtensions = ["pdf", "doc", "docx", "jpg", "jpeg", "png"];

  if (mode === "create") {
    // File is required for create mode
    return yup
      .mixed()
      .required("Attachment is required")
      .test(
        "fileType",
        `File must be one of: ${allowedExtensions.join(", ")}`,
        (value) => {
          if (!value) return false;

          // If it's a File object, check the type
          if (value instanceof File) {
            return allowedTypes.includes(value.type);
          }

          // If it's a string (filename), check extension
          if (typeof value === "string") {
            const extension = value.split(".").pop()?.toLowerCase();
            return allowedExtensions.includes(extension);
          }

          return false;
        }
      )
      .test("fileSize", "File size must be less than 10MB", (value) => {
        if (!value) return true; // Let required validation handle empty files

        // Only check size for File objects
        if (value instanceof File) {
          return value.size <= 10 * 1024 * 1024; // 10MB in bytes
        }

        return true; // Don't validate size for existing files (strings)
      });
  } else if (mode === "edit") {
    // File is optional for edit mode if there's an existing file
    if (hasExistingFile) {
      return yup
        .mixed()
        .nullable()
        .test(
          "fileType",
          `File must be one of: ${allowedExtensions.join(", ")}`,
          (value) => {
            if (!value) return true; // Optional when existing file present

            if (value instanceof File) {
              return allowedTypes.includes(value.type);
            }

            if (typeof value === "string") {
              const extension = value.split(".").pop()?.toLowerCase();
              return allowedExtensions.includes(extension);
            }

            return true;
          }
        )
        .test("fileSize", "File size must be less than 10MB", (value) => {
          if (!value || typeof value === "string") return true;

          if (value instanceof File) {
            return value.size <= 10 * 1024 * 1024;
          }

          return true;
        });
    } else {
      // If no existing file, attachment is required
      return yup
        .mixed()
        .required("Attachment is required")
        .test(
          "fileType",
          `File must be one of: ${allowedExtensions.join(", ")}`,
          (value) => {
            if (!value) return false;

            if (value instanceof File) {
              return allowedTypes.includes(value.type);
            }

            if (typeof value === "string") {
              const extension = value.split(".").pop()?.toLowerCase();
              return allowedExtensions.includes(extension);
            }

            return false;
          }
        )
        .test("fileSize", "File size must be less than 10MB", (value) => {
          if (!value) return true;

          if (value instanceof File) {
            return value.size <= 10 * 1024 * 1024;
          }

          return true;
        });
    }
  } else {
    // View mode - no validation needed
    return yup.mixed().nullable();
  }
};

// Object validation helper
const objectWithIdValidation = (fieldName) => {
  return yup
    .object()
    .nullable()
    .required(`${fieldName} is required`)
    .test("has-id", `${fieldName} must be selected`, (value) => {
      return value && value.id;
    });
};

// Main schema factory function
export const createDataChangeSchema = (
  mode = "create",
  hasExistingFile = false
) => {
  const isViewMode = mode === "view";

  // Base schema for all modes
  const baseSchema = {
    form_id: isViewMode
      ? yup.object().nullable()
      : objectWithIdValidation("Form"),

    employee_id: isViewMode
      ? yup.object().nullable()
      : objectWithIdValidation("Employee"),

    new_position_id: isViewMode
      ? yup.object().nullable()
      : objectWithIdValidation("New Position"),

    reason_for_change: isViewMode
      ? yup.string()
      : yup
          .string()
          .required("Reason for change is required")
          .min(10, "Reason must be at least 10 characters")
          .max(1000, "Reason must not exceed 1000 characters")
          .trim(),

    remarks: yup
      .string()
      .max(1000, "Remarks must not exceed 1000 characters")
      .trim(),

    data_change_attachment: fileValidation(mode, hasExistingFile),

    data_change_attachment_filename: yup.string().nullable(),
  };

  return yup.object().shape(baseSchema);
};

// Specific schema variations for convenience
export const dataChangeCreateSchema = createDataChangeSchema("create", false);
export const dataChangeEditSchemaWithFile = createDataChangeSchema(
  "edit",
  true
);
export const dataChangeEditSchemaWithoutFile = createDataChangeSchema(
  "edit",
  false
);
export const dataChangeViewSchema = createDataChangeSchema("view", false);

// Custom validation messages
export const validationMessages = {
  required: (field) => `${field} is required`,
  minLength: (field, min) => `${field} must be at least ${min} characters`,
  maxLength: (field, max) => `${field} must not exceed ${max} characters`,
  fileType: "File must be of type: pdf, doc, docx, jpg, png",
  fileSize: "File size must be less than 10MB",
  objectRequired: (field) => `${field} must be selected`,
};

// Helper function to get field labels
export const fieldLabels = {
  form_id: "Form",
  employee_id: "Employee",
  new_position_id: "New Position",
  reason_for_change: "Reason for Change",
  remarks: "Remarks",
  data_change_attachment: "Attachment",
};

// Helper function to validate form data before submission
export const validateFormData = async (data, mode, hasExistingFile) => {
  try {
    const schema = createDataChangeSchema(mode, hasExistingFile);
    await schema.validate(data, { abortEarly: false });
    return { isValid: true, errors: {} };
  } catch (error) {
    const errors = {};
    if (error.inner) {
      error.inner.forEach((err) => {
        errors[err.path] = err.message;
      });
    }
    return { isValid: false, errors };
  }
};

// Helper function to transform form data for API submission
export const transformFormDataForSubmission = (
  data,
  mode,
  selectedEntryId = null
) => {
  const formData = new FormData();

  // Add mode
  formData.append("mode", mode);

  // Add ID for edit mode
  if (mode === "edit" && selectedEntryId) {
    formData.append("id", selectedEntryId);
    formData.append("_method", "PATCH");
  }

  // Add form fields
  if (data.form_id?.id) {
    formData.append("form_id", data.form_id.id);
  }

  if (data.employee_id?.id) {
    formData.append("employee_id", data.employee_id.id);
  }

  if (data.new_position_id?.id) {
    formData.append("new_position_id", data.new_position_id.id);
  }

  if (data.reason_for_change?.trim()) {
    formData.append("reason_for_change", data.reason_for_change.trim());
  }

  if (data.remarks?.trim()) {
    formData.append("remarks", data.remarks.trim());
  }

  // Handle file attachment
  if (data.data_change_attachment) {
    if (data.data_change_attachment instanceof File) {
      formData.append("data_change_attachment", data.data_change_attachment);
    } else if (
      mode === "edit" &&
      typeof data.data_change_attachment === "string"
    ) {
      formData.append("existing_attachment", data.data_change_attachment);
    }
  }

  return formData;
};
