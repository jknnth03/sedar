import * as yup from "yup";

export const VALID_EMPLOYMENT_TYPES = [
  "PROBATIONARY",
  "AGENCY HIRED",
  "PROJECT BASED",
  "REGULAR",
];

export const STEPS = [
  "General Info",
  "Address",
  "Position",
  "Emp Type",
  "Attainment",
  "Account",
  "Contact",
  "Files",
  "Review",
];

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

const transformEmploymentType = (value, originalValue) => {
  if (originalValue === null || originalValue === undefined) {
    return undefined;
  }

  if (originalValue === "") {
    return "";
  }

  if (typeof originalValue === "string") {
    return originalValue;
  }

  if (typeof originalValue === "object" && originalValue !== null) {
    return (
      originalValue.employment_type_label ||
      originalValue.label ||
      originalValue.name ||
      ""
    );
  }

  return value;
};

const transformDateValue = (value, originalValue) => {
  if (
    !originalValue ||
    originalValue === "" ||
    originalValue === null ||
    originalValue === undefined
  ) {
    return null;
  }

  if (originalValue instanceof Date) {
    return originalValue;
  }

  if (typeof originalValue === "string") {
    const date = new Date(originalValue);
    return isNaN(date.getTime()) ? null : date;
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

const employmentTypeSchema = yup.object().shape({
  id: yup.string().nullable(),
  index: yup.number().nullable(),
  employment_type_label: yup
    .string()
    .transform(transformEmploymentType)
    .required("Employment type is required.")
    .test("valid-employment-type", "Invalid employment type", function (value) {
      return !value || VALID_EMPLOYMENT_TYPES.includes(value);
    }),
  employment_start_date: yup
    .date()
    .nullable()
    .transform(transformDateValue)
    .when("employment_type_label", {
      is: (val) => val && val !== "REGULAR",
      then: (schema) =>
        schema
          .required("Employment start date is required.")
          .typeError("Please provide a valid employment start date"),
      otherwise: (schema) => schema.nullable(),
    }),
  employment_end_date: yup
    .date()
    .nullable()
    .transform(transformDateValue)
    .when("employment_type_label", {
      is: (val) => val && ["AGENCY HIRED", "PROJECT BASED"].includes(val),
      then: (schema) =>
        schema
          .required("Employment end date is required.")
          .typeError("Please provide a valid employment end date"),
      otherwise: (schema) => schema.nullable(),
    })
    .test(
      "end-date-after-start",
      "Employment end date must be after employment start date",
      function (value) {
        const { employment_start_date } = this.parent || {};
        if (!value || !employment_start_date) return true;

        const startDate = new Date(employment_start_date);
        const endDate = new Date(value);

        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
          return true;
        }

        return endDate > startDate;
      }
    ),
  regularization_date: yup
    .date()
    .nullable()
    .transform(transformDateValue)
    .when("employment_type_label", {
      is: (val) => val === "REGULAR",
      then: (schema) =>
        schema
          .required("Regularization date is required.")
          .typeError("Please provide a valid regularization date"),
      otherwise: (schema) => schema.nullable(),
    }),
});

const fileSchema = yup.object().shape({
  id: yup.string().nullable(),
  index: yup.number().nullable(),
  file_type_id: yup
    .mixed()
    .required("File Type is required.")
    .test("is-valid-object", "File Type is required.", function (value) {
      if (!value || typeof value !== "object" || !value.id) {
        return false;
      }
      return true;
    })
    .transform(transformObjectField),
  file_cabinet_id: yup
    .mixed()
    .required("File Cabinet is required.")
    .test("is-valid-object", "File Cabinet is required.", function (value) {
      if (!value || typeof value !== "object" || !value.id) {
        return false;
      }
      return true;
    })
    .transform(transformObjectField),
  file_description: yup.string().nullable(),
  file_attachment: yup
    .mixed()
    .nullable()
    .test("file-required", "File attachment is required.", function (value) {
      const { existing_file_name } = this.parent || {};

      if (existing_file_name && existing_file_name.trim() !== "") {
        return true;
      }

      if (!value || value === null || value === undefined || value === "") {
        return false;
      }

      return true;
    })
    .test("isFile", "The file attachment field must be a file.", (value) => {
      if (!value || value === null || value === undefined || value === "") {
        return true;
      }

      if (value instanceof File) {
        return true;
      }

      if (typeof value === "string") {
        return true;
      }

      return false;
    })
    .test("fileType", "The file attachment must be a PDF file.", (value) => {
      if (!value || !(value instanceof File)) return true;

      const allowedTypes = ["application/pdf"];
      const allowedExtensions = [".pdf"];
      const fileName = value.name.toLowerCase();

      return (
        allowedTypes.includes(value.type) ||
        allowedExtensions.some((ext) => fileName.endsWith(ext))
      );
    })
    .test("fileSize", "File size must be less than 10MB", (value) => {
      if (!value || !(value instanceof File)) return true;
      return value.size <= 10 * 1024 * 1024;
    }),
  existing_file_name: yup.string().nullable(),
  is_new_file: yup.boolean().nullable(),
  original_file_id: yup.mixed().nullable(),
});

const fieldSchemas = {
  submission_title: yup
    .mixed()
    .nullable()
    .test("is-valid-submission", "Form is required.", function (value) {
      if (!value || typeof value !== "object") {
        return false;
      }
      return !!(value.id || value.submission_title || value.linked_mrf_title);
    }),
  first_name: yup.string().required("First name is required."),
  middle_name: yup.string().nullable(),
  last_name: yup.string().required("Last Name is required."),
  prefix: yup
    .mixed()
    .required("Prefix is required.")
    .test("is-valid-object", "Prefix is required.", function (value) {
      if (!value || typeof value !== "object" || !value.id) {
        return false;
      }
      return true;
    })
    .transform(transformObjectField),
  id_number: yup
    .string()
    .required("ID Number is required.")
    .test("id-number-valid", "ID Number is required.", function (value) {
      if (!value || value.trim() === "") {
        return false;
      }
      return true;
    }),
  suffix: yup.string().nullable(),
  birth_date: yup
    .date()
    .transform(transformDateValue)
    .required("Birth Date is required.")
    .max(new Date(), "Birth Date cannot be in the future.")
    .test("age", "Must be at least 18 years old", function (value) {
      if (!value) return false;
      const today = new Date();
      const birthDate = new Date(value);
      const age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (
        monthDiff < 0 ||
        (monthDiff === 0 && today.getDate() < birthDate.getDate())
      ) {
        return age - 1 >= 18;
      }
      return age >= 18;
    }),
  birth_place: yup.string().required("Birthplace is required."),
  nationality: yup
    .mixed()
    .required("Nationality is required.")
    .test("is-valid-object", "Nationality is required.", function (value) {
      if (!value || typeof value !== "object" || !value.id) {
        return false;
      }
      return true;
    })
    .transform(transformObjectField),
  gender: yup.string().required("Gender is required."),
  civil_status: yup.string().required("Civil Status is required."),
  religion: yup
    .mixed()
    .required("Religion is required.")
    .test("is-valid-object", "Religion is required.", function (value) {
      if (!value || typeof value !== "object" || !value.id) {
        return false;
      }
      return true;
    })
    .transform(transformObjectField),
  referred_by: yup
    .mixed()
    .nullable()
    .transform((value, originalValue) => {
      if (
        originalValue === "" ||
        originalValue === null ||
        originalValue === undefined
      ) {
        return null;
      }
      return value;
    }),
  remarks: yup.string().nullable(),
  region_id: yup
    .mixed()
    .required("Region is required.")
    .test("is-valid-object", "Region is required.", function (value) {
      if (!value || typeof value !== "object" || !value.id) {
        return false;
      }
      return true;
    })
    .transform(transformObjectField),
  province_id: yup
    .mixed()
    .nullable()
    .test("is-valid-object", "Province is required.", function (value) {
      if (!value) return true;
      if (typeof value !== "object" || !value.id) {
        return false;
      }
      return true;
    })
    .transform(transformObjectField),
  city_municipality_id: yup
    .mixed()
    .required("City/Municipality is required.")
    .test(
      "is-valid-object",
      "City/Municipality is required.",
      function (value) {
        if (!value || typeof value !== "object" || !value.id) {
          return false;
        }
        return true;
      }
    )
    .transform(transformObjectField),
  sub_municipality: yup.string().nullable(),
  barangay_id: yup
    .mixed()
    .required("Barangay is required.")
    .test("is-valid-object", "Barangay is required.", function (value) {
      if (!value || typeof value !== "object" || !value.id) {
        return false;
      }
      return true;
    })
    .transform(transformObjectField),
  street: yup.string().required("Street Address is required."),
  zip_code: yup.string().required("ZIP Code is required."),
  foreign_address: yup.string().nullable(),
  address_remarks: yup.string().nullable(),
  position_title: yup.string().required("Position Title is required."),
  job_rate: yup
    .number()
    .transform(transformNumberValue)
    .required("Job Rate is required.")
    .min(0, "Job Rate must be greater than or equal to 0."),
  schedule_id: yup
    .object()
    .shape({ id: yup.string(), name: yup.string() })
    .transform(transformObjectField)
    .required("Schedule is required.")
    .test("is-valid-object", "Schedule is required.", function (value) {
      if (!value || typeof value !== "object" || !value.id) {
        return false;
      }
      return true;
    }),
  job_level_id: yup
    .object()
    .shape({ id: yup.string(), name: yup.string() })
    .transform(transformObjectField)
    .required("Job Level is required.")
    .test("is-valid-object", "Job Level is required.", function (value) {
      if (!value || typeof value !== "object" || !value.id) {
        return false;
      }
      return true;
    }),
  allowance: yup
    .number()
    .nullable()
    .transform(transformNumberValue)
    .min(0, "Allowance must be greater than or equal to 0."),
  additional_rate: yup
    .number()
    .nullable()
    .transform(transformNumberValue)
    .min(0, "Additional Rate must be greater than or equal to 0."),
  employment_types: yup
    .array()
    .of(employmentTypeSchema)
    .min(1, "At least one employment type is required.")
    .required("Employment types are required."),
  employment_type_label: yup
    .string()
    .transform(transformEmploymentType)
    .nullable(),
  employment_start_date: yup.date().nullable().transform(transformDateValue),
  employment_end_date: yup.date().nullable().transform(transformDateValue),
  regularization_date: yup.date().nullable().transform(transformDateValue),
  attainment_id: yup
    .mixed()
    .nullable()
    .required("Educational Attainment is required.")
    .test(
      "is-valid-object",
      "Educational Attainment is required.",
      function (value) {
        if (!value || typeof value !== "object" || !value.id) {
          return false;
        }
        return true;
      }
    ),
  program_id: yup
    .mixed()
    .nullable()
    .required("Program is required.")
    .test("is-valid-object", "Program is required.", function (value) {
      if (!value || typeof value !== "object" || !value.id) {
        return false;
      }
      return true;
    }),
  degree_id: yup
    .mixed()
    .nullable()
    .required("Degree is required.")
    .test("is-valid-object", "Degree is required.", function (value) {
      if (!value || typeof value !== "object" || !value.id) {
        return false;
      }
      return true;
    }),
  honor_title_id: yup
    .mixed()
    .nullable()
    .required("Honor Title is required.")
    .test("is-valid-object", "Honor Title is required.", function (value) {
      if (!value || typeof value !== "object" || !value.id) {
        return false;
      }
      return true;
    }),
  academic_year_from: yup
    .string()
    .nullable()
    .transform((value, originalValue) => {
      if (!originalValue || originalValue === "") {
        return null;
      }
      return value;
    })
    .matches(/^\d{4}$/, "Academic Year must be a 4-digit year."),
  academic_year_to: yup
    .string()
    .nullable()
    .transform((value, originalValue) => {
      if (!originalValue || originalValue === "") {
        return null;
      }
      return value;
    })
    .matches(/^\d{4}$/, "Academic Year must be a 4-digit year.")
    .test(
      "year-order",
      "Academic Year To must be after Academic Year From",
      function (value) {
        const { academic_year_from } = this.parent || {};
        if (!value || !academic_year_from) return true;
        return parseInt(value) >= parseInt(academic_year_from);
      }
    ),
  gpa: yup
    .string()
    .nullable()
    .transform((value, originalValue) => {
      if (!originalValue || originalValue === "") {
        return null;
      }
      return value;
    })
    .matches(
      /^\d+(\.\d{1,2})?$/,
      "GPA must be a valid number with up to 2 decimal places."
    ),
  institution: yup.string().nullable(),
  attainment_attachment: yup
    .mixed()
    .nullable()
    .test(
      "isFile",
      "The attainment attachment field must be a file.",
      (value) => {
        if (!value || value === null || value === undefined || value === "") {
          return true;
        }

        if (value instanceof File) {
          return true;
        }

        if (typeof value === "string") {
          return true;
        }

        return false;
      }
    )
    .test(
      "fileType",
      "The attainment attachment must be a file of type: pdf, doc, docx, jpg, png",
      (value) => {
        if (!value || !(value instanceof File)) return true;

        const allowedTypes = [
          "application/pdf",
          "application/msword",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          "image/jpeg",
          "image/png",
        ];
        const allowedExtensions = [
          ".pdf",
          ".doc",
          ".docx",
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
      if (!value || !(value instanceof File)) return true;
      return value.size <= 10 * 1024 * 1024;
    }),
  attainment_remarks: yup.string().nullable(),
  sss_number: yup
    .string()
    .required("SSS Number is required.")
    .matches(
      /^\d{2}-\d{7}-\d{1}$/,
      "SSS Number format should be XX-XXXXXXX-X."
    ),
  pag_ibig_number: yup
    .string()
    .required("Pag-IBIG Number is required.")
    .matches(
      /^\d{4}-\d{4}-\d{4}$/,
      "Pag-IBIG Number format should be XXXX-XXXX-XXXX."
    ),
  philhealth_number: yup
    .string()
    .required("PhilHealth Number is required.")
    .matches(
      /^\d{2}-\d{9}-\d{1}$/,
      "PhilHealth Number format should be XX-XXXXXXXXX-X."
    ),
  tin_number: yup
    .string()
    .required("TIN Number is required.")
    .matches(/^\d{3}-\d{3}-\d{3}$/, "TIN Number format should be XXX-XXX-XXX."),
  bank: yup
    .mixed()
    .nullable()
    .transform((value, originalValue) => {
      if (originalValue === "" || originalValue === undefined) {
        return null;
      }
      if (
        typeof originalValue === "string" ||
        typeof originalValue === "number"
      ) {
        return originalValue;
      }
      if (
        typeof originalValue === "object" &&
        originalValue !== null &&
        originalValue.id
      ) {
        return originalValue.id;
      }
      return value;
    })
    .test("bank-format", "Bank must be selected", function (value) {
      if (value === null || value === undefined) {
        return true;
      }
      if (typeof value === "string" || typeof value === "number") {
        return value !== "" && value !== 0;
      }
      if (typeof value === "object" && value !== null) {
        return (
          (typeof value.id === "string" || typeof value.id === "number") &&
          typeof value.name === "string"
        );
      }
      return false;
    }),
  bank_account_number: yup.string().nullable(),
  email_address: yup
    .string()
    .required("Email Address is required.")
    .email("Please enter a valid email address."),
  mobile_number: yup
    .string()
    .required("Mobile Number is required.")
    .matches(
      /^\d{3}-\d{3}-\d{4}$/,
      "Mobile Number format should be XXX-XXX-XXXX."
    ),
  mobile_number_remarks: yup.string().nullable(),
  email_address_remarks: yup.string().nullable(),
  files: yup
    .array()
    .of(fileSchema)
    .min(1, "At least one file is required.")
    .required("Files are required."),
};

export const createFlattenedEmployeeSchema = () => {
  return yup.object().shape(fieldSchemas);
};

export const getStepValidationSchema = (stepIndex) => {
  const stepFieldMap = {
    0: [
      "submission_title",
      "first_name",
      "last_name",
      "middle_name",
      "prefix",
      "id_number",
      "suffix",
      "birth_date",
      "birth_place",
      "nationality",
      "gender",
      "civil_status",
      "religion",
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
      "position_title",
      "job_rate",
      "schedule_id",
      "job_level_id",
      "allowance",
      "additional_rate",
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
    6: [
      "email_address",
      "mobile_number",
      "mobile_number_remarks",
      "email_address_remarks",
    ],
    7: ["files"],
    8: [],
  };

  const fieldsForStep = stepFieldMap[stepIndex] || [];
  const schemaForStep = {};

  fieldsForStep.forEach((field) => {
    if (fieldSchemas[field]) {
      schemaForStep[field] = fieldSchemas[field];
    }
  });

  return yup.object().shape(schemaForStep);
};

export default {
  createFlattenedEmployeeSchema,
  getStepValidationSchema,
  VALID_EMPLOYMENT_TYPES,
  STEPS,
};
