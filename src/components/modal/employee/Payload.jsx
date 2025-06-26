export const extractFieldValue = (formSection, fieldVariations) => {
  if (!formSection) return null;

  for (const variation of fieldVariations) {
    // Handle nested object properties (e.g., "prefix.id", "selectedPrefix.id")
    if (variation.includes(".")) {
      const keys = variation.split(".");
      let value = formSection;
      for (const key of keys) {
        value = value?.[key];
        if (value === undefined) break;
      }
      if (value !== undefined && value !== null && value !== "") {
        return value;
      }
    } else {
      const value = formSection[variation];
      if (value !== undefined && value !== null && value !== "") {
        return value;
      }
    }
  }
  return null;
};

export const hasRequiredFields = (payload) => {
  const requiredFields = [
    "code",
    "first_name",
    "last_name",
    "prefix_id",
    "religion_id",
    "id_number",
    "birth_date",
    "civil_status",
    "gender",
    "position_id",
    "schedule_id",
    "job_level_id",
    "job_rate",
    "employment_type_label",
    "employment_start_date",
    "region_id",
    "province_id",
    "city_municipality_id",
    "barangay_id",
    "attainment_id",
  ];

  const missingFields = requiredFields.filter(
    (field) =>
      payload[field] === undefined ||
      payload[field] === null ||
      payload[field] === "" ||
      payload[field] === 0
  );

  if (missingFields.length > 0) {
    console.warn("Missing required fields:", missingFields);
    return { isValid: false, missingFields };
  }

  return { isValid: true, missingFields: [] };
};

export const validateContactDetails = (contacts) => {
  if (!Array.isArray(contacts)) return [];

  return contacts
    .filter(
      (contact) =>
        contact &&
        contact.contact_details &&
        contact.contact_details.trim() !== ""
    )
    .map((contact, index) => {
      const contactType = contact.contact_type || contact.contactType;
      let contactDetails = contact.contact_details || contact.contactDetails;

      if (!contactType || contactType.trim() === "") {
        throw new Error(`Contact type is required for contact #${index + 1}`);
      }

      // Enhanced phone number validation for Philippine numbers
      if (
        contactType === "mobile" ||
        contactType === "phone" ||
        contactType === "mobile phone" ||
        contactType.toLowerCase().includes("mobile") ||
        contactType.toLowerCase().includes("phone")
      ) {
        // Remove all non-digit characters
        let cleanedNumber = contactDetails.replace(/\D/g, "");

        // Handle different Philippine number formats
        if (cleanedNumber.startsWith("639")) {
          cleanedNumber = cleanedNumber.substring(2); // Remove country code +63
        } else if (cleanedNumber.startsWith("63")) {
          cleanedNumber = cleanedNumber.substring(2); // Remove country code 63
        }

        if (cleanedNumber.startsWith("0")) {
          cleanedNumber = cleanedNumber.substring(1); // Remove leading 0
        }

        // Validate Philippine mobile number format (9XXXXXXXXX)
        if (!/^9\d{9}$/.test(cleanedNumber)) {
          throw new Error(
            `Invalid mobile number format for contact #${
              index + 1
            }: "${contactDetails}". Must be exactly 10 digits starting with 9 (format: 9XX-XXX-XXXX)`
          );
        }

        // Format as 9XX-XXX-XXXX
        contactDetails = cleanedNumber.replace(
          /^(\d{3})(\d{3})(\d{4})$/,
          "$1-$2-$3"
        );
      }

      return {
        contact_type: contactType,
        contact_details: contactDetails,
        contact_remarks:
          contact.contact_remarks || contact.contactRemarks || "",
      };
    });
};

export const validateAndCleanFiles = (fileData) => {
  if (!fileData || !Array.isArray(fileData)) {
    return [];
  }

  return fileData.filter((fileItem) => {
    if (
      !fileItem ||
      !fileItem.file_attachment ||
      !(fileItem.file_attachment instanceof File)
    ) {
      return false;
    }

    if (!fileItem.file_type_id || fileItem.file_type_id === 0) {
      return false;
    }

    // Additional file validation
    const maxFileSize = 10 * 1024 * 1024; // 10MB
    if (fileItem.file_attachment.size > maxFileSize) {
      console.warn(
        `File ${fileItem.file_attachment.name} exceeds maximum size of 10MB`
      );
      return false;
    }

    return true;
  });
};

export const extractAddressData = (addressForm) => {
  if (!addressForm) return {};

  const safeIntOrNull = (value) => {
    if (value === "" || value === null || value === undefined) {
      return null;
    }
    const parsed = parseInt(value, 10);
    return isNaN(parsed) ? null : parsed;
  };

  const addressData = {
    region_id: safeIntOrNull(addressForm.region_id),
    city_municipality_id: safeIntOrNull(addressForm.city_municipality_id),
    barangay_id: safeIntOrNull(addressForm.barangay_id),
    street: addressForm.street?.trim() || null,
    zip_code: addressForm.zip_code?.trim() || null,
    province_id: safeIntOrNull(addressForm.province_id),
    sub_municipality_id: safeIntOrNull(addressForm.sub_municipality_id),
    address_remarks: addressForm.address_remarks?.trim() || null,
  };

  return addressData;
};

export const buildEmployeePayload = (formData) => {
  if (!formData) {
    throw new Error("Form data is required");
  }

  // Extract all required fields with better error handling
  const code = extractFieldValue(formData.general, [
    "code",
    "employee_code",
    "emp_code",
    "employee_number",
    "id_number",
  ]);

  const prefixId = extractFieldValue(formData.general, [
    "prefix_id",
    "prefixId",
    "prefix.id",
    "selectedPrefix.id",
    "selectedPrefix",
    "prefix",
  ]);

  const religionId = extractFieldValue(formData.general, [
    "religion_id",
    "religionId",
    "religion.id",
    "selectedReligion.id",
    "selectedReligion",
    "religion",
  ]);

  const firstName = extractFieldValue(formData.general, [
    "first_name",
    "firstName",
  ]);

  const lastName = extractFieldValue(formData.general, [
    "last_name",
    "lastName",
  ]);

  const idNumber = extractFieldValue(formData.general, [
    "id_number",
    "idNumber",
  ]);

  const birthDate = extractFieldValue(formData.general, [
    "birth_date",
    "birthDate",
  ]);

  const civilStatus = extractFieldValue(formData.general, [
    "civil_status",
    "civilStatus",
  ]);

  const gender = extractFieldValue(formData.general, ["gender"]);

  const positionId = extractFieldValue(formData.position, [
    "position_id",
    "positionId",
    "selectedPosition.id",
    "selectedPosition",
  ]);

  const scheduleId = extractFieldValue(formData.position, [
    "schedule_id",
    "scheduleId",
    "selectedSchedule.id",
    "selectedSchedule",
  ]);

  const jobLevelId = extractFieldValue(formData.position, [
    "job_level_id",
    "jobLevelId",
    "selectedJobLevel.id",
    "selectedJobLevel",
  ]);

  const jobRate = extractFieldValue(formData.position, ["job_rate", "jobRate"]);

  const employmentTypeLabel = extractFieldValue(formData.employmentType, [
    "employment_type_label",
    "employmentTypeLabel",
    "label",
  ]);

  const employmentStartDate = extractFieldValue(formData.employmentType, [
    "employment_start_date",
    "employmentStartDate",
    "startDate",
  ]);

  const attainmentId = extractFieldValue(formData.attainment, [
    "attainment_id",
    "attainmentId",
  ]);

  // Validation with specific error messages
  const requiredFields = [
    { value: code, name: "Employee code", field: "code" },
    { value: firstName, name: "First name", field: "first_name" },
    { value: lastName, name: "Last name", field: "last_name" },
    { value: prefixId, name: "Prefix selection", field: "prefix_id" },
    { value: religionId, name: "Religion selection", field: "religion_id" },
    { value: idNumber, name: "ID number", field: "id_number" },
    { value: birthDate, name: "Birth date", field: "birth_date" },
    { value: civilStatus, name: "Civil status", field: "civil_status" },
    { value: gender, name: "Gender", field: "gender" },
    { value: positionId, name: "Position selection", field: "position_id" },
    { value: scheduleId, name: "Schedule selection", field: "schedule_id" },
    { value: jobLevelId, name: "Job level selection", field: "job_level_id" },
    { value: jobRate, name: "Job rate", field: "job_rate" },
    {
      value: employmentTypeLabel,
      name: "Employment type label",
      field: "employment_type_label",
    },
    {
      value: employmentStartDate,
      name: "Employment start date",
      field: "employment_start_date",
    },
    {
      value: attainmentId,
      name: "Attainment selection",
      field: "attainment_id",
    },
  ];

  const missingFields = [];
  requiredFields.forEach(({ value, name, field }) => {
    if (
      !value ||
      (typeof value === "string" && value.trim() === "") ||
      value === 0
    ) {
      missingFields.push(name);
    }
  });

  if (missingFields.length > 0) {
    throw new Error(
      `The following required fields are missing: ${missingFields.join(", ")}`
    );
  }

  // Validate contacts
  let contactsPayload = [];
  if (formData.contact && Array.isArray(formData.contact)) {
    try {
      contactsPayload = validateContactDetails(formData.contact);
    } catch (error) {
      throw new Error(`Contact validation failed: ${error.message}`);
    }
  }

  // Validate address
  const addressData = extractAddressData(formData.address);
  const requiredAddressFields = [
    { value: addressData.region_id, name: "Region selection" },
    { value: addressData.province_id, name: "Province selection" },
    {
      value: addressData.city_municipality_id,
      name: "City/Municipality selection",
    },
    { value: addressData.barangay_id, name: "Barangay selection" },
  ];

  const missingAddressFields = [];
  requiredAddressFields.forEach(({ value, name }) => {
    if (!value || value === 0) {
      missingAddressFields.push(name);
    }
  });

  if (missingAddressFields.length > 0) {
    throw new Error(
      `The following required address fields are missing: ${missingAddressFields.join(
        ", "
      )}`
    );
  }

  // Helper function to safely parse integers
  const safeParseInt = (value) => {
    const parsed = parseInt(value, 10);
    return isNaN(parsed) ? null : parsed;
  };

  // Build the payload
  const employeePayload = {
    code: code.trim(),
    first_name: firstName.trim(),
    last_name: lastName.trim(),
    prefix_id: safeParseInt(prefixId),
    religion_id: safeParseInt(religionId),
    id_number: idNumber.trim(),
    birth_date: birthDate,
    civil_status: civilStatus,
    gender: gender,

    middle_name:
      extractFieldValue(formData.general, [
        "middle_name",
        "middleName",
      ])?.trim() || "",
    suffix: extractFieldValue(formData.general, ["suffix"])?.trim() || "",

    position_id: safeParseInt(positionId),
    schedule_id: safeParseInt(scheduleId),
    job_level_id: safeParseInt(jobLevelId),
    job_rate: parseFloat(jobRate) || 0,
    allowance:
      parseFloat(extractFieldValue(formData.position, ["allowance"])) || 0,

    employment_type_label: employmentTypeLabel,
    employment_start_date: employmentStartDate,
    employment_end_date:
      extractFieldValue(formData.employmentType, [
        "employment_end_date",
        "employmentEndDate",
        "endDate",
      ]) || null,

    ...addressData,

    program_id: safeParseInt(
      extractFieldValue(formData.attainment, ["program_id", "programId"])
    ),
    degree_id: safeParseInt(
      extractFieldValue(formData.attainment, ["degree_id", "degreeId"])
    ),
    honor_title_id: safeParseInt(
      extractFieldValue(formData.attainment, ["honor_title_id", "honorTitleId"])
    ),
    attainment_id: safeParseInt(attainmentId),
    academic_year_from:
      extractFieldValue(formData.attainment, [
        "academic_year_from",
        "academicYearFrom",
      ]) || null,
    academic_year_to:
      extractFieldValue(formData.attainment, [
        "academic_year_to",
        "academicYearTo",
      ]) || null,
    gpa: parseFloat(extractFieldValue(formData.attainment, ["gpa"])) || null,
    institution:
      extractFieldValue(formData.attainment, ["institution"])?.trim() || "",
    attainment_remarks:
      extractFieldValue(formData.attainment, [
        "attainment_remarks",
        "attainmentRemarks",
      ])?.trim() || "",

    sss_number:
      extractFieldValue(formData.account, [
        "sss_number",
        "sssNumber",
      ])?.trim() || null,
    pag_ibig_number:
      extractFieldValue(formData.account, [
        "pag_ibig_number",
        "pagIbigNumber",
      ])?.trim() || null,
    philhealth_number:
      extractFieldValue(formData.account, [
        "philhealth_number",
        "philhealthNumber",
      ])?.trim() || null,
    tin_number:
      extractFieldValue(formData.account, [
        "tin_number",
        "tinNumber",
      ])?.trim() || null,
    bank_id: safeParseInt(
      extractFieldValue(formData.account, ["bank_id", "bankId"])
    ),
    bank_account_number:
      extractFieldValue(formData.account, [
        "bank_account_number",
        "bankAccountNumber",
      ])?.trim() || null,

    contacts: contactsPayload,
  };

  return employeePayload;
};

export const buildEmployeeFormData = (formData) => {
  const formDataPayload = new FormData();

  try {
    const employeeData = buildEmployeePayload(formData);

    // Add regular fields to FormData
    Object.entries(employeeData).forEach(([key, value]) => {
      if (
        key !== "contacts" &&
        key !== "files" &&
        key !== "attainment_attachment"
      ) {
        if (value !== null && value !== undefined && value !== "") {
          formDataPayload.append(key, String(value));
        }
      }
    });

    // Add contacts
    if (employeeData.contacts && employeeData.contacts.length > 0) {
      employeeData.contacts.forEach((contact, index) => {
        formDataPayload.append(
          `contacts[${index}][contact_type]`,
          contact.contact_type
        );
        formDataPayload.append(
          `contacts[${index}][contact_details]`,
          contact.contact_details
        );
        formDataPayload.append(
          `contacts[${index}][contact_remarks]`,
          contact.contact_remarks || ""
        );
      });
    }

    // Add files
    const validFiles = validateAndCleanFiles(formData.file);
    if (validFiles.length > 0) {
      validFiles.forEach((fileItem, index) => {
        formDataPayload.append(
          `files[${index}][file_type_id]`,
          String(fileItem.file_type_id)
        );

        formDataPayload.append(
          `files[${index}][file_attachment]`,
          fileItem.file_attachment
        );

        // Add other file properties
        Object.entries(fileItem).forEach(([key, value]) => {
          if (
            key !== "file_attachment" &&
            key !== "file_type_id" &&
            value !== null &&
            value !== undefined &&
            value !== ""
          ) {
            formDataPayload.append(`files[${index}][${key}]`, String(value));
          }
        });
      });
    }

    // Add attainment attachment
    const attainmentAttachment = formData.attainment?.attainment_attachment;
    if (attainmentAttachment && attainmentAttachment instanceof File) {
      formDataPayload.append("attainment_attachment", attainmentAttachment);
    }

    return formDataPayload;
  } catch (error) {
    throw new Error(`Failed to build form data: ${error.message}`);
  }
};

export const cleanPayload = (payload) => {
  const cleanedPayload = Object.fromEntries(
    Object.entries(payload).filter(([key, value]) => {
      if (key === "contacts") {
        return Array.isArray(value) && value.length > 0;
      }
      if (typeof value === "number") return !isNaN(value);
      if (Array.isArray(value)) return value.length > 0;
      return value !== undefined && value !== null && value !== "";
    })
  );

  return cleanedPayload;
};

export const validateEmployeeData = (formData) => {
  const errors = [];

  if (!formData) {
    return { isValid: false, errors: ["Form data is required"] };
  }

  try {
    buildEmployeePayload(formData);
  } catch (error) {
    errors.push(error.message);
  }

  // Additional validation for address completeness
  if (formData.address) {
    const addressData = extractAddressData(formData.address);

    if (!addressData.street || addressData.street.trim() === "") {
      errors.push("Street address is required");
    }
    if (!addressData.zip_code || addressData.zip_code.trim() === "") {
      errors.push("Zip code is required");
    }
  } else {
    errors.push("Address information is required");
  }

  // Validate contacts if provided
  if (formData.contact && Array.isArray(formData.contact)) {
    try {
      validateContactDetails(formData.contact);
    } catch (error) {
      errors.push(error.message);
    }
  }

  // Validate files if provided
  if (formData.file && Array.isArray(formData.file)) {
    const validFiles = validateAndCleanFiles(formData.file);
    const originalFileCount = formData.file.filter(
      (f) => f && f.file_attachment
    ).length;
    if (originalFileCount > 0 && validFiles.length === 0) {
      errors.push(
        "All file entries must have valid file attachments and file types"
      );
    }
  }

  return {
    isValid: errors.length === 0,
    errors: errors,
  };
};

export const validateForServerSubmission = (formData) => {
  const errors = [];

  if (!formData) {
    return { isValid: false, errors: ["Form data is required"] };
  }

  try {
    const payload = buildEmployeePayload(formData);

    // Additional server-side validation
    if (!payload.street || payload.street.trim() === "") {
      errors.push("Street address is required");
    }

    if (!payload.zip_code || payload.zip_code.trim() === "") {
      errors.push("Zip code is required");
    }

    // Validate contact format for server submission
    if (payload.contacts && payload.contacts.length > 0) {
      payload.contacts.forEach((contact, index) => {
        if (
          contact.contact_type &&
          (contact.contact_type.toLowerCase().includes("mobile") ||
            contact.contact_type.toLowerCase().includes("phone"))
        ) {
          if (!/^9\d{2}-\d{3}-\d{4}$/.test(contact.contact_details)) {
            errors.push(
              `Contact #${
                index + 1
              }: Mobile number must be in format 9XX-XXX-XXXX`
            );
          }
        }
      });
    }

    // Validate files
    if (formData.file) {
      const validFiles = validateAndCleanFiles(formData.file);
      if (formData.file.length > 0 && validFiles.length === 0) {
        errors.push("Invalid file attachments detected");
      }
    }
  } catch (error) {
    errors.push(`Validation error: ${error.message}`);
  }

  return {
    isValid: errors.length === 0,
    errors: errors,
  };
};

export const debugFormData = (formDataPayload) => {
  if (!(formDataPayload instanceof FormData)) {
    return { error: "Invalid FormData object provided" };
  }

  const entries = [];
  const fileEntries = [];

  try {
    for (let [key, value] of formDataPayload.entries()) {
      if (value instanceof File) {
        const fileInfo = `${key}: File(${value.name}, ${value.size} bytes, ${value.type})`;
        entries.push(fileInfo);
        fileEntries.push(fileInfo);
      } else {
        entries.push(`${key}: ${value}`);
      }
    }

    const contacts = entries.filter((entry) => entry.startsWith("contacts["));
    const files = entries.filter((entry) => entry.startsWith("files["));
    const attainment = entries.filter((entry) =>
      entry.startsWith("attainment_attachment")
    );
    const addressFields = entries.filter(
      (entry) =>
        entry.startsWith("region_id") ||
        entry.startsWith("province_id") ||
        entry.startsWith("city_municipality_id") ||
        entry.startsWith("barangay_id") ||
        entry.startsWith("street") ||
        entry.startsWith("zip_code") ||
        entry.startsWith("address_remarks") ||
        entry.startsWith("sub_municipality_id")
    );
    const others = entries.filter(
      (entry) =>
        !entry.startsWith("contacts[") &&
        !entry.startsWith("files[") &&
        !entry.startsWith("attainment_attachment") &&
        !addressFields.some((addr) => entry.startsWith(addr.split(":")[0]))
    );

    return {
      totalEntries: entries.length,
      filesCount: fileEntries.length,
      contactsCount: contacts.length / 3, // Each contact has 3 fields
      attainmentCount: attainment.length,
      addressFieldsCount: addressFields.length,
      otherFieldsCount: others.length,
      hasFiles: fileEntries.length > 0,
      summary: {
        contacts: `${contacts.length / 3} contact(s)`,
        files: `${fileEntries.length} file(s)`,
        address: `${addressFields.length} address field(s)`,
        other: `${others.length} other field(s)`,
      },
      addressFields: addressFields,
      allEntries: entries,
    };
  } catch (error) {
    return { error: `Debug failed: ${error.message}` };
  }
};
