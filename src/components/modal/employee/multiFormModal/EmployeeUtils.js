export const getDefaultValues = ({ mode, initialData }) => {
  if ((mode === "edit" || mode === "view") && initialData) {
    const generalInfo = initialData.general_info || initialData;
    const addressInfo = initialData.address_info || initialData.address || {};
    const positionInfo =
      initialData.position_details || initialData.position || {};
    const employmentTypes = initialData.employment_types || [];

    const getLatestEmploymentType = (employmentTypes) => {
      if (!employmentTypes || employmentTypes.length === 0) return {};

      const sortedTypes = employmentTypes
        .filter((emp) => emp.employment_start_date)
        .sort(
          (a, b) =>
            new Date(b.employment_start_date) -
            new Date(a.employment_start_date)
        );

      return sortedTypes.length > 0 ? sortedTypes[0] : employmentTypes[0];
    };

    const employmentInfo = getLatestEmploymentType(employmentTypes);

    const attainmentInfo =
      initialData.attainment ||
      initialData.attainments ||
      (initialData.attainment && initialData.attainment[0]) ||
      {};
    const accountInfo = initialData.account || initialData.account_info || {};
    const contactInfo = initialData.contacts || initialData.contact_info || {};

    const filesArray = initialData.files || initialData.file_attachments || [];
    const firstFile =
      Array.isArray(filesArray) && filesArray.length > 0 ? filesArray[0] : {};

    const extractId = (value) => {
      if (!value) return "";
      if (typeof value === "object" && value.id) return value.id;
      if (typeof value === "string" || typeof value === "number") return value;
      return "";
    };

    const extractObject = (value) => {
      if (!value) return null;
      if (typeof value === "object" && value.id) return value;
      return null;
    };

    return {
      first_name: generalInfo.first_name || "",
      last_name: generalInfo.last_name || "",
      middle_name: generalInfo.middle_name || "",
      suffix: generalInfo.suffix || "",
      prefix: extractId(generalInfo.prefix) || "",
      id_number: generalInfo.id_number || "",
      birth_date: generalInfo.birth_date || "",
      gender: generalInfo.gender || "",
      civil_status: generalInfo.civil_status || "",
      religion: generalInfo.religion || null,
      referred_by: extractId(generalInfo.referred_by) || "",
      remarks: generalInfo.remarks || "",

      region_id: extractId(addressInfo.region) || addressInfo.region_id || "",
      province_id:
        extractId(addressInfo.province) || addressInfo.province_id || "",
      city_municipality_id:
        extractId(addressInfo.city_municipality) ||
        addressInfo.city_municipality_id ||
        "",
      sub_municipality: addressInfo.sub_municipality || "",
      barangay_id:
        extractId(addressInfo.barangay) || addressInfo.barangay_id || "",
      street: addressInfo.street || "",
      zip_code: addressInfo.zip_code || "",
      foreign_address: addressInfo.foreign_address || "",
      address_remarks: addressInfo.remarks || "",

      position_id: positionInfo.position_id || "",
      job_rate: positionInfo.job_rate || 0,
      allowance: positionInfo.allowance || 0,
      additional_rate: positionInfo.additional_rate || null,
      additional_tools: positionInfo.additional_tools || "",
      additional_rate_remarks: positionInfo.additional_rate_remarks || "",
      schedule_id: positionInfo.schedule_id || "",
      job_level_id: positionInfo.job_level_id || "",

      employment_types:
        employmentTypes.length > 0
          ? employmentTypes.map((emp, index) => ({
              id: emp.id || null,
              index: index,
              employment_type_label: emp.employment_type_label || "",
              employment_start_date: emp.employment_start_date || "",
              employment_end_date: emp.employment_end_date || "",
              regularization_date: emp.regularization_date || "",
            }))
          : [
              {
                id: null,
                index: 0,
                employment_type_label: "",
                employment_start_date: "",
                employment_end_date: "",
                regularization_date: "",
              },
            ],

      employment_type_label: employmentInfo.employment_type_label || "",
      employment_start_date: employmentInfo.employment_start_date || "",
      employment_end_date: employmentInfo.employment_end_date || "",
      regularization_date: employmentInfo.regularization_date || "",

      attainment_id: attainmentInfo.attainment_id || "",
      program_id: attainmentInfo.program_id || "",
      degree_id: attainmentInfo.degree_id || "",
      honor_title_id: attainmentInfo.honor_title_id || "",
      academic_year_from: attainmentInfo.academic_year_from || "",
      academic_year_to: attainmentInfo.academic_year_to || "",
      gpa: attainmentInfo.gpa || "",
      institution: attainmentInfo.institution || "",
      attainment_attachment: attainmentInfo.attainment_attachment || null,
      attainment_remarks: attainmentInfo.attainment_remarks || "",

      sss_number: accountInfo.sss_number || "",
      pag_ibig_number: accountInfo.pag_ibig_number || "",
      philhealth_number: accountInfo.philhealth_number || "",
      tin_number: accountInfo.tin_number || "",
      bank: accountInfo.bank || "",
      bank_account_number: accountInfo.bank_account_number || "",

      email_address: contactInfo.email_address || "",
      mobile_number: contactInfo.mobile_number || "",
      contact_remarks: contactInfo.contact_remarks || "",

      files: Array.isArray(filesArray)
        ? filesArray.map((file, index) => ({
            id: file.id || null,
            original_file_id: file.id || null,
            file_description: file.file_description || "",
            file_attachment: file.file_attachment || null,
            file_type_id: extractId(file.file_type) || file.file_type_id || "",
            file_cabinet_id:
              extractId(file.file_cabinet) || file.file_cabinet_id || "",
            file_type: extractObject(file.file_type) || file.file_type || null,
            file_cabinet:
              extractObject(file.file_cabinet) || file.file_cabinet || null,
            file_url:
              file.file_attachment ||
              file.attachment_url ||
              file.file_url ||
              null,
            file_name: file.file_name || file.name || null,
            index: index,
          }))
        : [],

      file_description: firstFile.file_description || "",
      file_attachment: firstFile.file_attachment || null,
      file_type_id:
        extractId(firstFile.file_type) || firstFile.file_type_id || "",
      file_cabinet_id:
        extractId(firstFile.file_cabinet) || firstFile.file_cabinet_id || "",

      file_type:
        extractObject(firstFile.file_type) || firstFile.file_type || null,
      file_cabinet:
        extractObject(firstFile.file_cabinet) || firstFile.file_cabinet || null,
    };
  }

  return {
    first_name: "",
    last_name: "",
    middle_name: "",
    suffix: "",
    prefix: "",
    id_number: "",
    birth_date: "",
    gender: "",
    civil_status: "",
    religion: null,
    referred_by: "",
    remarks: "",

    region_id: "",
    province_id: "",
    city_municipality_id: "",
    sub_municipality: "",
    barangay_id: "",
    street: "",
    zip_code: "",
    foreign_address: "",
    address_remarks: "",

    position_id: "",
    job_rate: 0,
    allowance: 0,
    additional_rate: null,
    additional_tools: "",
    additional_rate_remarks: "",
    schedule_id: "",
    job_level_id: "",

    employment_types: [
      {
        id: null,
        index: 0,
        employment_type_label: "",
        employment_start_date: "",
        employment_end_date: "",
        regularization_date: "",
      },
    ],

    employment_type_label: "",
    employment_start_date: "",
    employment_end_date: "",
    regularization_date: "",

    attainment_id: "",
    program_id: "",
    degree_id: "",
    honor_title_id: "",
    academic_year_from: "",
    academic_year_to: "",
    gpa: "",
    institution: "",
    attainment_attachment: null,
    attainment_remarks: "",

    sss_number: "",
    pag_ibig_number: "",
    philhealth_number: "",
    tin_number: "",
    bank: "",
    bank_account_number: "",

    email_address: "",
    mobile_number: "",
    contact_remarks: "",

    files: [],

    file_description: "",
    file_attachment: null,
    file_type_id: "",
    file_cabinet_id: "",
    file_type: null,
    file_cabinet: null,
  };
};
