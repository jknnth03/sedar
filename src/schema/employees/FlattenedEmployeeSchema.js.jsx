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

export const validateEmploymentTypes = (employmentTypes) => {
  if (!employmentTypes || employmentTypes.length === 0) {
    return "At least one employment type is required";
  }

  for (let i = 0; i < employmentTypes.length; i++) {
    const employment = employmentTypes[i];
    const entryNum = i + 1;

    if (!employment.employment_type_label?.trim()) {
      return `Employment type is required for entry ${entryNum}`;
    }

    if (!VALID_EMPLOYMENT_TYPES.includes(employment.employment_type_label)) {
      return `Invalid employment type for entry ${entryNum}`;
    }

    if (employment.employment_type_label === "REGULAR") {
      const regDate = employment.regularization_date;
      if (
        !regDate ||
        (typeof regDate === "string" && !regDate.trim()) ||
        (regDate instanceof Date && isNaN(regDate.getTime()))
      ) {
        return `Regularization date is required for REGULAR employment (entry ${entryNum})`;
      }
    } else {
      const startDate = employment.employment_start_date;
      if (
        !startDate ||
        (typeof startDate === "string" && !startDate.trim()) ||
        (startDate instanceof Date && isNaN(startDate.getTime()))
      ) {
        return `Employment start date is required for ${employment.employment_type_label} employment (entry ${entryNum})`;
      }

      if (
        ["AGENCY HIRED", "PROJECT BASED"].includes(
          employment.employment_type_label
        )
      ) {
        const endDate = employment.employment_end_date;
        if (
          !endDate ||
          (typeof endDate === "string" && !endDate.trim()) ||
          (endDate instanceof Date && isNaN(endDate.getTime()))
        ) {
          return `Employment end date is required for ${employment.employment_type_label} employment (entry ${entryNum})`;
        }
      }
    }

    if (employment.employment_start_date && employment.employment_end_date) {
      let startDate, endDate;

      if (typeof employment.employment_start_date === "string") {
        startDate = new Date(employment.employment_start_date);
      } else {
        startDate = employment.employment_start_date;
      }

      if (typeof employment.employment_end_date === "string") {
        endDate = new Date(employment.employment_end_date);
      } else {
        endDate = employment.employment_end_date;
      }

      if (
        !isNaN(startDate.getTime()) &&
        !isNaN(endDate.getTime()) &&
        endDate <= startDate
      ) {
        return `End date must be after start date for entry ${entryNum}`;
      }
    }
  }

  return null;
};

const employmentTypeSchema = yup.object().shape({
  id: yup.string().nullable(),
  index: yup.number().nullable(),
  employment_type_label: yup
    .string()
    .transform(transformEmploymentType)
    .required("Employment Type is required.")
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
          .required(
            "Employment start date is required for non-regular employees"
          )
          .typeError("Please provide a valid employment start date"),
      otherwise: (schema) => schema.nullable(),
    }),
  employment_end_date: yup
    .date()
    .nullable()
    .transform(transformDateValue)
    .when("employment_type_label", {
      is: (val) =>
        val && ["PROBATIONARY", "AGENCY HIRED", "PROJECT BASED"].includes(val),
      then: (schema) =>
        schema
          .required("Employment end date is required for temporary employees")
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
          .required("Regularization date is required for regular employees")
          .typeError("Please provide a valid regularization date"),
      otherwise: (schema) => schema.nullable(),
    }),
});

export const createFlattenedEmployeeSchema = () => {
  return yup.object().shape({
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
    id_number: yup.string().required("ID Number is required."),
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
    nationality: yup.string().required("Nationality is required."),
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
      .required("Employment types are required.")
      .test(
        "employment-types-validation",
        "Employment types validation failed",
        function (value) {
          const validationResult = validateEmploymentTypes(value);
          if (validationResult) {
            return this.createError({
              message: validationResult,
              path: this.path,
            });
          }
          return true;
        }
      ),

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
    // In FlattenedEmployeeSchema.js
    attainment_attachment: yup
      .mixed()
      .nullable()
      .test(
        "isFile",
        "The attainment attachment field must be a file.",
        (value) => {
          // Allow null, undefined, or empty string (for edit mode with existing files)
          if (!value || value === null || value === undefined || value === "") {
            return true;
          }

          // If it's a File object (new upload), that's valid
          if (value instanceof File) {
            return true;
          }

          // If it's a string (could be existing file path/URL), allow it
          if (typeof value === "string") {
            return true;
          }

          // Otherwise, it must be a File
          return false;
        }
      )
      .test(
        "fileType",
        "The attainment attachment must be a file of type: pdf, doc, docx, jpg, png",
        (value) => {
          // Only validate file type if it's a File object (new upload)
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
        // Only validate file size if it's a File object (new upload)
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
      .matches(
        /^\d{3}-\d{3}-\d{3}$/,
        "TIN Number format should be XXX-XXX-XXX."
      ),

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

    files: yup.array().of(
      yup.object().shape({
        file_type_id: yup
          .object()
          .shape({ id: yup.mixed(), name: yup.string() })
          .transform(transformObjectField)
          .nullable(),
        file_cabinet_id: yup
          .object()
          .shape({ id: yup.mixed(), name: yup.string() })
          .transform(transformObjectField)
          .nullable(),
        file_description: yup.string().nullable(),
        file_attachment: yup.mixed().nullable(),
        existing_file_name: yup.string().nullable(),
      })
    ),
  });
};

export const getStepValidationSchema = (stepIndex) => {
  const stepSchemas = {
    0: yup.object().shape({
      first_name: yup.string().required("First name is required."),
      last_name: yup.string().required("Last Name is required."),
      middle_name: yup.string().nullable(),
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
      id_number: yup.string().required("ID Number is required."),
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
      nationality: yup.string().required("Nationality is required."),
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
    }),

    1: yup.object().shape({
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
    }),

    2: yup.object().shape({
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
    }),

    3: yup.object().shape({
      employment_types: yup
        .array()
        .of(employmentTypeSchema)
        .min(1, "At least one employment type is required.")
        .required("Employment types are required.")
        .test(
          "employment-types-validation",
          "Employment types validation failed",
          function (value) {
            const validationResult = validateEmploymentTypes(value);
            if (validationResult) {
              return this.createError({
                message: validationResult,
                path: this.path,
              });
            }
            return true;
          }
        ),
    }),

    4: yup.object().shape({
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
            if (!value) return true;
            return value instanceof File;
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
    }),

    5: yup.object().shape({
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
        .matches(
          /^\d{3}-\d{3}-\d{3}$/,
          "TIN Number format should be XXX-XXX-XXX."
        ),
    }),

    6: yup.object().shape({
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
    }),

    7: yup.object().shape({
      files: yup.array().of(
        yup.object().shape({
          file_type_id: yup.object().transform(transformObjectField).nullable(),

          file_cabinet_id: yup
            .object()
            .transform(transformObjectField)
            .nullable(),
          file_description: yup.string().nullable(),
          file_attachment: yup.mixed().nullable(),
          existing_file_name: yup.string().nullable(),
        })
      ),
    }),

    8: yup.object().shape({}),
  };

  return stepSchemas[stepIndex] || yup.object().shape({});
};

export default {
  createFlattenedEmployeeSchema,
  getStepValidationSchema,
  validateEmploymentTypes,
  VALID_EMPLOYMENT_TYPES,
  STEPS,
};
