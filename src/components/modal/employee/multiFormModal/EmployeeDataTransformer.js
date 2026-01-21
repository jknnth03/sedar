import { FourGPlusMobiledataSharp } from "@mui/icons-material";

const formatDateForAPI = (date) => {
  if (!date) return null;

  if (typeof date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return date;
  }

  let dateObj;
  if (date instanceof Date) {
    dateObj = date;
  } else {
    dateObj = new Date(date);
  }

  if (isNaN(dateObj.getTime())) {
    return null;
  }

  return dateObj.toISOString().split("T")[0];
};

const extractIdFromObject = (value) => {
  if (typeof value === "object" && value !== null && value?.id) {
    return value.id;
  }
  if (typeof value === "object" && value !== null) {
    return null;
  }
  return value;
};

const cleanBankData = (data) => {
  const bankValue = data.bank || data.bank_id;
  const accountNumber =
    data.bank_account_number || data.back_account_number || "";

  const extractedBankId = extractIdFromObject(bankValue);

  const cleanedResult = {
    bank_id:
      extractedBankId &&
      extractedBankId !== "undefined" &&
      extractedBankId !== ""
        ? extractedBankId
        : null,
    bank_account_number:
      accountNumber && accountNumber.trim() !== ""
        ? accountNumber.trim()
        : null,
  };

  return cleanedResult;
};

const transformEmploymentTypesForAPI = (employmentTypes) => {
  if (!employmentTypes || !Array.isArray(employmentTypes)) {
    return [];
  }

  return employmentTypes.map((employment) => {
    const transformedEmployment = {
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

    if (employment.employment_start_date) {
      transformedEmployment.employment_start_date = formatDateForAPI(
        employment.employment_start_date
      );
    }

    if (employment.employment_end_date) {
      transformedEmployment.employment_end_date = formatDateForAPI(
        employment.employment_end_date
      );
    }

    if (employment.regularization_date) {
      transformedEmployment.regularization_date = formatDateForAPI(
        employment.regularization_date
      );
    }

    return transformedEmployment;
  });
};

const transformFilesForAPI = (files) => {
  if (!files || !Array.isArray(files)) {
    return [];
  }

  return files
    .filter((file) => {
      return file.file_type_id && file.file_cabinet_id;
    })
    .map((file) => {
      const transformedFile = {
        file_description: file.file_description || "",
        file_type_id: extractIdFromObject(file.file_type_id),
        file_cabinet_id: extractIdFromObject(file.file_cabinet_id),
      };

      if (file.original_file_id && !file.is_new_file) {
        transformedFile.id = file.original_file_id;
      }

      if (file.file_attachment instanceof File) {
        transformedFile.file_attachment = file.file_attachment;
      }

      return transformedFile;
    });
};

const extractManpowerFormId = (formData) => {
  const approvalForm = formData.approval_form || formData.submission_title;

  if (!approvalForm) {
    return null;
  }

  if (typeof approvalForm === "string" || typeof approvalForm === "number") {
    return approvalForm.toString();
  }

  if (typeof approvalForm === "object" && approvalForm !== null) {
    if (approvalForm.id) {
      return approvalForm.id.toString();
    }

    if (approvalForm.submission_id) {
      return approvalForm.submission_id.toString();
    }

    if (approvalForm.form_id) {
      return approvalForm.form_id.toString();
    }
  }

  return null;
};

const extractPositionId = (formData) => {
  if (
    formData.position_id !== null &&
    formData.position_id !== undefined &&
    formData.position_id !== ""
  ) {
    const extracted = extractIdFromObject(formData.position_id);
    if (extracted !== null && extracted !== undefined) {
      return extracted;
    }
  }

  if (
    formData.position &&
    typeof formData.position === "object" &&
    formData.position.id
  ) {
    return formData.position.id;
  }

  const approvalForm = formData.approval_form || formData.submission_title;

  if (approvalForm && typeof approvalForm === "object") {
    if (approvalForm.position_id) {
      return approvalForm.position_id;
    }

    if (approvalForm.position && approvalForm.position.id) {
      return approvalForm.position.id;
    }

    if (approvalForm.submittable) {
      if (approvalForm.submittable.position_id) {
        return approvalForm.submittable.position_id;
      }

      if (
        approvalForm.submittable.position &&
        approvalForm.submittable.position.id
      ) {
        return approvalForm.submittable.position.id;
      }
    }
  }

  if (formData.approvalFormData && formData.approvalFormData.position_id) {
    return formData.approvalFormData.position_id;
  }

  return null;
};

const processAttainmentAttachment = (attainmentAttachment) => {
  if (attainmentAttachment instanceof File) {
    return attainmentAttachment;
  }

  if (typeof attainmentAttachment === "string") {
    return null;
  }

  return null;
};

export const transformEmployeeData = (formData) => {
  const cleanedData = {
    ...formData,
    ...cleanBankData(formData),
  };

  const manpowerFormId = extractManpowerFormId(cleanedData);
  const positionId = extractPositionId(cleanedData);

  let processedImage = null;
  if (cleanedData.image instanceof File) {
    processedImage = cleanedData.image;
  } else if (
    cleanedData.image_data_url &&
    typeof cleanedData.image_data_url === "string" &&
    cleanedData.image_data_url.startsWith("data:")
  ) {
    processedImage = cleanedData.image_data_url;
  } else if (cleanedData.image && typeof cleanedData.image === "string") {
    processedImage = cleanedData.image;
  }

  const transformedData = {
    code: cleanedData.id_number || `EMP-${Date.now()}`,
    first_name: cleanedData.first_name,
    last_name: cleanedData.last_name,
    middle_name: cleanedData.middle_name || "",
    suffix: cleanedData.suffix || "",
    prefix_id: extractIdFromObject(cleanedData.prefix),
    id_number: cleanedData.id_number,
    birth_date: formatDateForAPI(cleanedData.birth_date),
    birth_place: cleanedData.birth_place || "",
    nationality_id: extractIdFromObject(cleanedData.nationality),
    gender: cleanedData.gender,
    civil_status: cleanedData.civil_status,
    religion_id: extractIdFromObject(cleanedData.religion),
    referrer_id: extractIdFromObject(cleanedData.referred_by),
    remarks: cleanedData.remarks || "",
    image: processedImage,
    region_id: extractIdFromObject(cleanedData.region_id),
    province_id: extractIdFromObject(cleanedData.province_id),
    city_municipality_id: extractIdFromObject(cleanedData.city_municipality_id),
    sub_municipality_id:
      extractIdFromObject(cleanedData.sub_municipality) || "",
    barangay_id: extractIdFromObject(cleanedData.barangay_id),
    street: cleanedData.street || "",
    zip_code: cleanedData.zip_code || "",
    foreign_address: cleanedData.foreign_address || "",
    address_remarks: cleanedData.address_remarks || "",

    position_id: positionId,
    job_rate: cleanedData.job_rate,
    allowance: cleanedData.allowance || 0,
    additional_rate: cleanedData.additional_rate || "",
    additional_tools: cleanedData.additional_tools || "",
    additional_rate_remarks: cleanedData.additional_rate_remarks || "",
    schedule_id: extractIdFromObject(cleanedData.schedule_id),
    job_level_id: extractIdFromObject(cleanedData.job_level_id),

    employment_types: transformEmploymentTypesForAPI(
      cleanedData.employment_types
    ),

    attainment_id: extractIdFromObject(cleanedData.attainment_id),
    program_id: extractIdFromObject(cleanedData.program_id),
    degree_id: extractIdFromObject(cleanedData.degree_id),
    honor_title_id: extractIdFromObject(cleanedData.honor_title_id),
    academic_year_from: cleanedData.academic_year_from || "",
    academic_year_to: cleanedData.academic_year_to || "",
    gpa: cleanedData.gpa || "",
    institution: cleanedData.institution || "",
    attainment_attachment: processAttainmentAttachment(
      cleanedData.attainment_attachment
    ),
    attainment_remarks: cleanedData.attainment_remarks || "",

    sss_number: cleanedData.sss_number || "",
    pag_ibig_number: cleanedData.pag_ibig_number || "",
    philhealth_number: cleanedData.philhealth_number || "",
    tin_number: cleanedData.tin_number || "",
    bank_id: cleanedData.bank_id,
    bank_account_number: cleanedData.bank_account_number,

    email_address: cleanedData.email_address || "",
    mobile_number: cleanedData.mobile_number || "",
    email_address_remarks: cleanedData.email_address_remarks || "",
    mobile_number_remarks: cleanedData.mobile_number_remarks || "",

    manpower_form_id: manpowerFormId,

    files: transformFilesForAPI(cleanedData.files),
  };

  const employmentStartDate = formatDateForAPI(
    cleanedData.employment_start_date
  );
  const employmentEndDate = formatDateForAPI(cleanedData.employment_end_date);
  const regularizationDate = formatDateForAPI(cleanedData.regularization_date);

  if (employmentStartDate && !transformedData.employment_types.length) {
    transformedData.employment_start_date = employmentStartDate;
  }

  if (employmentEndDate && !transformedData.employment_types.length) {
    transformedData.employment_end_date = employmentEndDate;
  }

  if (regularizationDate && !transformedData.employment_types.length) {
    transformedData.regularization_date = regularizationDate;
  }

  const formDatas = new FormData();

  const alwaysRequiredFields = [
    "mobile_number_remarks",
    "email_address_remarks",
  ];

  const requiredBackendFields = [
    "nationality_id",
    "prefix_id",
    "religion_id",
    "referrer_id",
  ];

  Object.entries(transformedData).forEach(([key, value]) => {
    if (value === null || value === undefined) {
      if (
        alwaysRequiredFields.includes(key) ||
        requiredBackendFields.includes(key)
      ) {
        formDatas.append(key, "");
      }
      return;
    }

    if (
      value === "" &&
      !alwaysRequiredFields.includes(key) &&
      !requiredBackendFields.includes(key)
    ) {
      return;
    }

    if (Array.isArray(value)) {
      if (key === "employment_types") {
        value.forEach((item, index) => {
          Object.entries(item).forEach(([subKey, subValue]) => {
            if (subValue !== undefined && subValue !== null) {
              formDatas.append(
                `employment_types[${index}][${subKey}]`,
                subValue
              );
            }
          });
        });
      } else if (key === "files") {
        value.forEach((item, index) => {
          Object.entries(item).forEach(([subKey, subValue]) => {
            if (subValue !== undefined && subValue !== null) {
              formDatas.append(`files[${index}][${subKey}]`, subValue);
            }
          });
        });
      } else {
        value.forEach((item, index) => {
          formDatas.append(`${key}[${index}]`, item);
        });
      }
    } else {
      formDatas.append(key, value);
    }
  });

  return formDatas;
};
