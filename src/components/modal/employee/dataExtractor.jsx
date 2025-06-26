// dataExtractor.js - Handles all data extraction and processing logic

export const getNestedValue = (obj, path, defaultValue = null) => {
  if (!obj || typeof obj !== "object") return defaultValue;

  const keys = path.split(".");
  let current = obj;

  for (const key of keys) {
    if (current && typeof current === "object" && key in current) {
      current = current[key];
    } else {
      return defaultValue;
    }
  }

  return current !== null && current !== undefined ? current : defaultValue;
};

export const extractPositionData = (dataSource) => {
  if (!dataSource) return null;

  const positionPaths = [
    "employee_position",
    "employee_positions",
    "position_details",
    "positionDetails",
    "positions",
    "position",
    "position_info",
    "positionInfo",
    "job_position",
    "jobPosition",
  ];

  let positionData = null;

  for (const path of positionPaths) {
    const data = getNestedValue(dataSource, path);
    if (data) {
      positionData = Array.isArray(data) ? data[0] : data;
      break;
    }
  }

  if (!positionData) {
    const hasPositionFields = [
      "position_id",
      "positionId",
      "schedule_id",
      "scheduleId",
      "job_level_id",
      "jobLevelId",
      "job_rate",
      "jobRate",
    ].some((field) => dataSource.hasOwnProperty(field));

    if (hasPositionFields) positionData = dataSource;
  }

  if (!positionData) return null;

  const fieldMappings = {
    position_id: [
      "position_id",
      "positionId",
      "position.id",
      "position.position_id",
      "id",
    ],
    schedule_id: [
      "schedule_id",
      "scheduleId",
      "schedule.id",
      "schedule.schedule_id",
    ],
    job_level_id: ["job_level_id", "jobLevelId", "jobLevel.id", "job_level.id"],
    job_rate: [
      "job_rate",
      "jobRate",
      "rate",
      "salary",
      "basic_rate",
      "basicRate",
    ],
    allowance: ["allowance", "allowances", "daily_allowance", "dailyAllowance"],
    additional_rate: [
      "additional_rate",
      "additionalRate",
      "extra_rate",
      "extraRate",
    ],
    additional_rate_remarks: [
      "additional_rate_remarks",
      "additionalRateRemarks",
      "rate_remarks",
      "rateRemarks",
      "remarks",
    ],
    additional_tools: [
      "additional_tools",
      "additionalTools",
      "tools",
      "equipment",
    ],
  };

  const extractedPosition = {};
  let hasValidData = false;

  for (const [fieldName, paths] of Object.entries(fieldMappings)) {
    let value = "";
    for (const path of paths) {
      const extractedValue = getNestedValue(positionData, path);
      if (
        extractedValue !== null &&
        extractedValue !== undefined &&
        extractedValue !== "" &&
        extractedValue !== "0"
      ) {
        value = extractedValue.toString();
        hasValidData = true;
        break;
      }
    }
    extractedPosition[fieldName] = value;
  }

  return hasValidData ? extractedPosition : null;
};

export const extractEmployeeData = (employeeData) => {
  if (!employeeData) return null;

  const possibleDataSources = [
    employeeData,
    employeeData.data,
    employeeData.result,
    employeeData.employee,
  ].filter(Boolean);

  for (const dataSource of possibleDataSources) {
    const extractedData = {
      general: null,
      address: null,
      position: null,
      employmentType: null,
      attainment: null,
      account: null,
      contact: null,
      file: null,
    };

    // Extract general info
    const generalSources = [
      dataSource.general_info,
      dataSource.generalInfo,
      dataSource.general,
      dataSource,
    ].filter(Boolean);

    for (const source of generalSources) {
      if (
        source &&
        (source.first_name ||
          source.firstName ||
          source.id_number ||
          source.idNumber)
      ) {
        extractedData.general = source;
        break;
      }
    }

    // Extract address
    const addressSources = [
      dataSource.address,
      dataSource.addresses,
      dataSource.address_info,
      dataSource.addressInfo,
    ].filter(Boolean);

    for (const source of addressSources) {
      if (source) {
        if (Array.isArray(source) && source.length > 0) {
          extractedData.address = source[0];
        } else if (source && typeof source === "object") {
          const hasAddressFields = [
            "street",
            "zip_code",
            "barangay_id",
            "city_municipality_id",
            "province_id",
            "region_id",
            "street_address",
            "zipCode",
            "postal_code",
            "barangayId",
            "cityMunicipalityId",
            "provinceId",
            "regionId",
          ].some((field) => source.hasOwnProperty(field));

          if (hasAddressFields) extractedData.address = source;
        }
        if (extractedData.address) break;
      }
    }

    // Extract position
    const positionData = extractPositionData(dataSource);
    if (positionData) extractedData.position = positionData;

    // Extract employment type
    const employmentTypeSources = [
      dataSource.employment_types,
      dataSource.employmentTypes,
      dataSource.employment_type,
      dataSource.employmentType,
    ].filter(Boolean);

    for (const source of employmentTypeSources) {
      if (source) {
        if (Array.isArray(source) && source.length > 0) {
          extractedData.employmentType = source[0];
        } else if (source.employment_type_id || source.employmentTypeId) {
          extractedData.employmentType = source;
        }
        break;
      }
    }

    // Extract attainment
    const attainmentSources = [
      dataSource.attainments,
      dataSource.attainment,
      dataSource.educational_attainment,
      dataSource.educationalAttainment,
    ].filter(Boolean);

    for (const source of attainmentSources) {
      if (source) {
        if (Array.isArray(source) && source.length > 0) {
          extractedData.attainment = source[0];
        } else if (
          source.attainment_id ||
          source.attainmentId ||
          source.education_level
        ) {
          extractedData.attainment = source;
        }
        break;
      }
    }

    // Extract account
    const accountSources = [
      dataSource.account,
      dataSource.accounts,
      dataSource.account_info,
      dataSource.accountInfo,
    ].filter(Boolean);

    for (const source of accountSources) {
      if (source) {
        if (Array.isArray(source) && source.length > 0) {
          extractedData.account = source[0];
        } else if (source.username || source.email || source.account_id) {
          extractedData.account = source;
        }
        break;
      }
    }

    // Extract contact
    const contactSources = [
      dataSource.contacts,
      dataSource.contact,
      dataSource.contact_info,
      dataSource.contactInfo,
    ].filter(Boolean);

    for (const source of contactSources) {
      if (source) {
        if (Array.isArray(source)) {
          extractedData.contact = source;
        } else if (source.phone || source.email || source.contact_type) {
          extractedData.contact = [source];
        }
        break;
      }
    }

    // Extract files
    const fileSources = [
      dataSource.files,
      dataSource.file,
      dataSource.documents,
      dataSource.attachments,
      dataSource.file_uploads,
    ].filter(Boolean);

    for (const source of fileSources) {
      if (source) {
        if (Array.isArray(source)) {
          extractedData.file = source;
        } else if (source.file_name || source.fileName || source.file_path) {
          extractedData.file = [source];
        }
        break;
      }
    }

    const hasData = Object.values(extractedData).some(
      (value) => value !== null
    );
    if (hasData) return extractedData;
  }

  return null;
};

export const formatEmployeeDisplay = (generalData) => {
  if (!generalData) return "";

  const firstName = generalData.first_name || generalData.firstName || "";
  const lastName = generalData.last_name || generalData.lastName || "";
  const idNumber = generalData.id_number || generalData.idNumber || "";
  const fullName = `${firstName} ${lastName}`.toUpperCase();

  const isValidString = (value) => {
    return (
      value && typeof value === "string" && value !== "-" && value.trim() !== ""
    );
  };

  let prefixName = "";
  const prefixFields = [
    "prefix_display_name",
    "prefix_name",
    "prefix_label",
    "prefix_text",
    "prefix",
  ];

  for (const field of prefixFields) {
    if (isValidString(generalData[field])) {
      prefixName = generalData[field];
      break;
    }
  }

  if (
    !prefixName &&
    generalData.prefix &&
    typeof generalData.prefix === "string" &&
    generalData.prefix !== "-" &&
    generalData.prefix.trim() !== "" &&
    isNaN(generalData.prefix)
  ) {
    prefixName = generalData.prefix;
  }

  return prefixName && prefixName.trim() !== ""
    ? `${fullName} (${prefixName} - ${idNumber})`
    : `${fullName} (${idNumber})`;
};

export const buildEmployeeUpdateData = (formData) => {
  const payload = {};

  Object.keys(formData).forEach((sectionKey) => {
    const sectionData = formData[sectionKey];

    if (Array.isArray(sectionData) && sectionData.length > 0) {
      payload[sectionKey] = sectionData;
    } else if (sectionData && typeof sectionData === "object") {
      Object.keys(sectionData).forEach((field) => {
        const value = sectionData[field];
        if (
          value !== null &&
          value !== undefined &&
          value !== "" &&
          !(Array.isArray(value) && value.length === 0)
        ) {
          if (field === "prefix") {
            payload["prefix_id"] = value;
          } else if (field === "religion") {
            payload["religion_id"] = value;
          } else if (
            field === "employment_start_date" ||
            field === "employment_end_date"
          ) {
            const dateValue = new Date(value);
            payload[field] = !isNaN(dateValue.getTime())
              ? dateValue.toISOString().split("T")[0]
              : value;
          } else {
            payload[field] = value;
          }
        }
      });
    }
  });

  if (!payload.code) {
    payload.code = String(payload.employee_id || payload.id_number || "");
  }

  return payload;
};
