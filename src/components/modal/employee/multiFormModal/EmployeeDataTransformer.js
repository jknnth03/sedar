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
  if (typeof value === "object" && value?.id) {
    return value.id;
  }
  return value;
};

const cleanBankData = (data) => {
  const hasBank = data.bank && data.bank !== "";
  return {
    bank: hasBank ? data.bank : null,
    bank_account_number: hasBank ? data.bank_account_number : null,
  };
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

export const transformEmployeeData = (formData) => {
  const cleanedData = {
    ...formData,
    ...cleanBankData(formData),
  };

  const transformedData = {
    code: cleanedData.id_number || `EMP-${Date.now()}`,
    first_name: cleanedData.first_name,
    last_name: cleanedData.last_name,
    middle_name: cleanedData.middle_name,
    suffix: cleanedData.suffix,
    prefix_id: extractIdFromObject(cleanedData.prefix),
    id_number: cleanedData.id_number,
    birth_date: formatDateForAPI(cleanedData.birth_date),
    gender: cleanedData.gender,
    civil_status: cleanedData.civil_status,
    religion_id: extractIdFromObject(cleanedData.religion),
    referred_by: cleanedData.referred_by,
    remarks: cleanedData.remarks,

    region_id: extractIdFromObject(cleanedData.region_id),
    province_id: extractIdFromObject(cleanedData.province_id),
    city_municipality_id: extractIdFromObject(cleanedData.city_municipality_id),
    sub_municipality: cleanedData.sub_municipality,
    barangay_id: extractIdFromObject(cleanedData.barangay_id),
    street: cleanedData.street,
    zip_code: cleanedData.zip_code,
    foreign_address: cleanedData.foreign_address,
    address_remarks: cleanedData.address_remarks,

    position_id: extractIdFromObject(cleanedData.position_id),
    job_rate: cleanedData.job_rate,
    allowance: cleanedData.allowance || 0,
    additional_rate: cleanedData.additional_rate,
    additional_tools: cleanedData.additional_tools,
    additional_rate_remarks: cleanedData.additional_rate_remarks,
    schedule_id: extractIdFromObject(cleanedData.schedule_id),
    job_level_id: extractIdFromObject(cleanedData.job_level_id),

    employment_types: transformEmploymentTypesForAPI(
      cleanedData.employment_types
    ),

    attainment_id: extractIdFromObject(cleanedData.attainment_id),
    program_id: extractIdFromObject(cleanedData.program_id),
    degree_id: extractIdFromObject(cleanedData.degree_id),
    honor_title_id: extractIdFromObject(cleanedData.honor_title_id),
    academic_year_from: cleanedData.academic_year_from,
    academic_year_to: cleanedData.academic_year_to,
    gpa: cleanedData.gpa,
    institution: cleanedData.institution,
    attainment_attachment: cleanedData.attainment_attachment,
    attainment_remarks: cleanedData.attainment_remarks,

    sss_number: cleanedData.sss_number,
    pag_ibig_number: cleanedData.pag_ibig_number,
    philhealth_number: cleanedData.philhealth_number,
    tin_number: cleanedData.tin_number,
    bank: cleanedData.bank,
    bank_account_number: cleanedData.bank_account_number,

    email_address: cleanedData.email_address,
    mobile_number: cleanedData.mobile_number,
    contact_remarks: cleanedData.contact_remarks,
    files: [
      {
        file_description: cleanedData.file_description,
        file_attachment: cleanedData.file_attachment,
        file_type_id: cleanedData.file_type_id,
        file_cabinet_id: cleanedData.file_cabinet_id,
      },
    ],
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

  Object.entries(transformedData).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
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
    }
  });

  for (let [key, value] of formDatas.entries()) {
    console.log(key, value);
  }

  return formDatas;
};
