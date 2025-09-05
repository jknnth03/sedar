import * as yup from "yup";

const transformObjectField = (value, originalValue) => {
  if (
    originalValue === null ||
    originalValue === undefined ||
    originalValue === ""
  ) {
    return undefined;
  }

  if (
    typeof originalValue === "object" &&
    originalValue !== null &&
    originalValue.id
  ) {
    return originalValue;
  }

  return value;
};

const transformNumberValue = (value, originalValue) => {
  if (
    originalValue === "" ||
    originalValue === null ||
    originalValue === undefined
  ) {
    return originalValue === "" ? undefined : null;
  }
  const parsed = parseFloat(originalValue);
  return isNaN(parsed) ? (originalValue === "" ? undefined : null) : parsed;
};

export const createFormSubmissionSchema = (
  mode = "create",
  hasExistingFile = false
) => {
  return yup.object().shape({
    position_id: yup
      .mixed()
      .required("Position is required")
      .test("is-valid-object", "Position is required.", function (value) {
        if (!value || typeof value !== "object" || !value.id) {
          return false;
        }
        return true;
      })
      .transform(transformObjectField),

    job_level_id: yup
      .mixed()
      .required("Job Level is required")
      .test("is-valid-object", "Job Level is required.", function (value) {
        if (!value || typeof value !== "object" || !value.id) {
          return false;
        }
        return true;
      })
      .transform(transformObjectField),

    employment_type: yup
      .string()
      .required("The employment type field is required.")
      .oneOf(
        ["PROBATIONARY", "REGULAR", "PROJECT BASED", "AGENCY HIRED"],
        "Please select a valid employment type."
      ),

    expected_salary: yup
      .number()
      .transform(transformNumberValue)
      .required("Expected salary is required")
      .min(0, "Expected salary must be greater than or equal to 0.")
      .test(
        "decimal-places",
        "Expected salary must have at most 2 decimal places",
        function (value) {
          if (!value) return true;
          const decimalPlaces = (value.toString().split(".")[1] || "").length;
          return decimalPlaces <= 2;
        }
      ),

    requisition_type_id: yup
      .mixed()
      .required("Requisition type is required")
      .test(
        "is-valid-object",
        "Requisition type is required.",
        function (value) {
          if (!value || typeof value !== "object" || !value.id) {
            return false;
          }
          return true;
        }
      )
      .transform(transformObjectField),

    employee_to_be_replaced_id: yup
      .mixed()
      .nullable()
      .test(
        "is-valid-object",
        "Employee must be a valid object.",
        function (value) {
          if (!value) {
            return true;
          }
          if (typeof value !== "object" || !value.id) {
            return false;
          }
          return true;
        }
      )
      .transform(transformObjectField),

    justification: yup.string().required("Justification is required"),

    remarks: yup.string().nullable(),

    // Updated attachment validation - conditionally required
    manpower_form_attachment: (() => {
      // Base schema
      let schema = yup.mixed();

      // Make it required only if it's create mode OR edit mode without existing file
      if (mode === "create" || (mode === "edit" && !hasExistingFile)) {
        schema = schema.required(
          "The manpower form attachment field is required."
        );
      } else {
        // In edit mode with existing file, make it nullable
        schema = schema.nullable();
      }

      return schema
        .test(
          "isValidAttachment",
          "The manpower form attachment field must be a file.",
          function (value) {
            // If not required and no value provided, it's valid
            if (mode === "edit" && hasExistingFile && !value) {
              return true;
            }

            if (!value) return false;

            if (typeof value === "string") return true;

            return value instanceof File;
          }
        )
        .test(
          "fileType",
          "The manpower form attachment must be a file of type: pdf, doc, docx, xlsx, xls, jpg, jpeg, png",
          (value) => {
            if (!value || typeof value === "string") return true;

            if (!(value instanceof File)) return true;

            const allowedTypes = [
              "application/pdf",
              "application/msword",
              "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
              "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
              "application/vnd.ms-excel",
              "image/jpeg",
              "image/png",
            ];
            const allowedExtensions = [
              ".pdf",
              ".doc",
              ".docx",
              ".xlsx",
              ".xls",
              ".jpg",
              ".jpeg",
              ".png",
            ];
            const fileName = value.name.toLowerCase();

            return (
              allowedTypes.includes(value.type) ||
              allowedExtensions.some((ext) => fileName.endsWith(ext))
            );
          }
        )
        .test("fileSize", "File size must be less than 10MB", (value) => {
          if (!value || typeof value === "string") return true;

          if (!(value instanceof File)) return true;

          return value.size <= 10 * 1024 * 1024;
        });
    })(),
  });
};

export const formSubmissionDefaultValues = {
  position_id: null,
  job_level_id: null,
  employment_type: "",
  expected_salary: "",
  requisition_type_id: null,
  employee_to_be_replaced_id: null,
  justification: "",
  remarks: "",
  manpower_form_attachment: null,
};

export const fileInputConfig = {
  accept: ".pdf,.doc,.docx,.xlsx,.xls,.jpg,.jpeg,.png",
};

export const expectedSalaryInputProps = {
  step: "0.01",
  min: "0",
};

export default {
  createFormSubmissionSchema,
  formSubmissionDefaultValues,
  fileInputConfig,
  expectedSalaryInputProps,
};
