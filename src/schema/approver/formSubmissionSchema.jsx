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

export const createFormSubmissionSchema = (mode = "create") => {
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
        "Please select a valid employment type.",
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
        },
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
        },
      )
      .transform(transformObjectField),

    employee_to_be_replaced_id: yup
      .mixed()
      .nullable()
      .test(
        "is-valid-object",
        "Employee must be a valid object.",
        function (value) {
          if (!value) return true;
          if (typeof value !== "object" || !value.id) return false;
          return true;
        },
      )
      .transform(transformObjectField),

    justification: yup.string().required("Justification is required"),

    remarks: yup.string().nullable(),

    attachments: yup
      .array()
      .test(
        "at-least-one-file",
        "At least one attachment is required.",
        function (value) {
          if (mode === "view" || mode === "resubmit") return true;

          if (!value || value.length === 0) return false;

          const hasValidAttachment = value.some(
            (att) =>
              att?.file_attachment instanceof File ||
              (att?.existing_file_id && att?.keep_existing !== false) ||
              att?.existing_file_name,
          );

          return hasValidAttachment;
        },
      )
      .test(
        "valid-file-types",
        "All attachments must be a file of type: pdf, doc, docx, xlsx, xls, jpg, jpeg, png",
        function (value) {
          if (!value) return true;

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

          return value.every((att) => {
            if (
              !att?.file_attachment ||
              !(att.file_attachment instanceof File)
            ) {
              return true;
            }
            const file = att.file_attachment;
            const fileName = file.name.toLowerCase();
            return (
              allowedTypes.includes(file.type) ||
              allowedExtensions.some((ext) => fileName.endsWith(ext))
            );
          });
        },
      )
      .test(
        "valid-file-sizes",
        "Each file size must be less than 10MB",
        function (value) {
          if (!value) return true;
          return value.every((att) => {
            if (
              !att?.file_attachment ||
              !(att.file_attachment instanceof File)
            ) {
              return true;
            }
            return att.file_attachment.size <= 10 * 1024 * 1024;
          });
        },
      ),
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
  attachments: [],
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
