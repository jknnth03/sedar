export const getDefaultValues = ({ mode, initialData }) => {
  const formatDateForInput = (dateValue) => {
    if (!dateValue) return "";

    if (
      typeof dateValue === "string" &&
      /^\d{4}-\d{2}-\d{2}$/.test(dateValue)
    ) {
      return dateValue;
    }

    let date;
    if (typeof dateValue === "string") {
      if (!dateValue.includes("T") && !dateValue.includes(" ")) {
        const parts = dateValue.split("-");
        if (parts.length === 3) {
          date = new Date(
            parseInt(parts[0]),
            parseInt(parts[1]) - 1,
            parseInt(parts[2])
          );
        } else {
          date = new Date(dateValue);
        }
      } else {
        date = new Date(dateValue);
      }
    } else {
      date = new Date(dateValue);
    }

    if (isNaN(date.getTime())) return "";

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

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

    const attainmentsArray =
      initialData.attainments ||
      (initialData.result && initialData.result.attainments) ||
      [];
    const attainmentInfo =
      attainmentsArray.length > 0 ? attainmentsArray[0] : {};

    console.log("DEBUG getDefaultValues - initialData:", initialData);
    console.log("DEBUG getDefaultValues - attainmentsArray:", attainmentsArray);
    console.log("DEBUG getDefaultValues - attainmentInfo:", attainmentInfo);
    console.log(
      "DEBUG getDefaultValues - attainment_attachment_filename:",
      attainmentInfo.attainment_attachment_filename
    );

    const accountInfo =
      initialData.account || initialData.account_info || initialData || {};
    const contactInfo =
      initialData.contacts || initialData.contact_info || initialData || {};

    const filesArray = initialData.files || initialData.file_attachments || [];

    const extractId = (value) => {
      if (!value) return "";
      if (typeof value === "object" && value.id) return value.id;
      if (typeof value === "string" || typeof value === "number") return value;
      return "";
    };

    const extractObject = (value) => {
      if (!value) return null;
      if (typeof value === "object") return value;
      return null;
    };

    const extractBankId = (bankValue) => {
      if (!bankValue) return "";
      if (typeof bankValue === "object" && bankValue.id) return bankValue.id;
      if (typeof bankValue === "string" || typeof bankValue === "number")
        return bankValue;
      return "";
    };

    const extractBankObject = (bankValue) => {
      if (!bankValue) return null;
      if (typeof bankValue === "object" && bankValue.id) return bankValue;
      return null;
    };

    const processedEmploymentTypes =
      employmentTypes.length > 0
        ? employmentTypes.map((emp, arrayIndex) => ({
            id: emp.id || null,
            index: emp.index !== undefined ? emp.index : arrayIndex,
            employment_type_label: emp.employment_type_label || "",
            employment_start_date: formatDateForInput(
              emp.employment_start_date
            ),
            employment_end_date: formatDateForInput(emp.employment_end_date),
            regularization_date: formatDateForInput(emp.regularization_date),
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
          ];

    const bankValue =
      initialData.bank ||
      accountInfo.bank ||
      generalInfo.bank ||
      initialData.bank_id ||
      accountInfo.bank_id;

    const bankObject = extractBankObject(bankValue);
    const bankIdValue = extractBankId(bankValue);

    const result = {
      first_name: generalInfo.first_name || "",
      last_name: generalInfo.last_name || "",
      middle_name: generalInfo.middle_name || "",
      suffix: generalInfo.suffix || "",
      prefix: extractObject(generalInfo.prefix) || null,
      id_number: generalInfo.id_number || "",
      birth_date: formatDateForInput(generalInfo.birth_date) || "",
      gender: generalInfo.gender || "",
      civil_status: generalInfo.civil_status || "",
      religion: extractObject(generalInfo.religion) || null,
      referred_by: extractObject(generalInfo.referred_by) || null,
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

      employment_types: processedEmploymentTypes,

      employment_type_label: employmentInfo.employment_type_label || "",
      employment_start_date:
        formatDateForInput(employmentInfo.employment_start_date) || "",
      employment_end_date:
        formatDateForInput(employmentInfo.employment_end_date) || "",
      regularization_date:
        formatDateForInput(employmentInfo.regularization_date) || "",

      attainment_id: extractObject(attainmentInfo.attainment) || null,
      program_id: extractObject(attainmentInfo.program) || null,
      degree_id: extractObject(attainmentInfo.degree) || null,
      honor_title_id: extractObject(attainmentInfo.honor_title) || null,
      academic_year_from: attainmentInfo.academic_year_from || "",
      academic_year_to: attainmentInfo.academic_year_to || "",
      gpa: attainmentInfo.gpa || "",
      institution: attainmentInfo.institution || "",
      attainment_attachment: attainmentInfo.attainment_attachment || null,
      existing_attachment_filename:
        attainmentInfo.attainment_attachment_filename ||
        initialData.attainment_attachment_filename ||
        (initialData.result &&
          initialData.result.attainments &&
          initialData.result.attainments[0] &&
          initialData.result.attainments[0].attainment_attachment_filename) ||
        "dummy.pdf",
      existing_attachment_url: attainmentInfo.attainment_attachment || "",
      attainment_remarks:
        attainmentInfo.attainment_remarks || attainmentInfo.remarks || "",

      sss_number: initialData.sss_number || accountInfo.sss_number || "",
      pag_ibig_number:
        initialData.pag_ibig_number || accountInfo.pag_ibig_number || "",
      philhealth_number:
        initialData.philhealth_number || accountInfo.philhealth_number || "",
      tin_number: initialData.tin_number || accountInfo.tin_number || "",
      bank: bankObject,
      bank_id: bankIdValue,
      bank_account_number:
        initialData.bank_account_number ||
        accountInfo.bank_account_number ||
        "",

      email_address: contactInfo.email_address || "",
      mobile_number: contactInfo.mobile_number || "",
      contact_remarks: contactInfo.contact_remarks || "",

      files: Array.isArray(filesArray)
        ? filesArray.map((file, index) => ({
            id: file.id || null,
            original_file_id: file.id || null,
            file_description: file.file_description || "",
            file_attachment: file.file_attachment || null,
            file_type: file.file_type || null,
            file_cabinet: file.file_cabinet || null,
            file_type_id: file.file_type_id || file.file_type?.id || "",
            file_cabinet_id:
              file.file_cabinet_id || file.file_cabinet?.id || "",
            file_url:
              file.file_attachment ||
              file.attachment_url ||
              file.file_url ||
              null,
            file_name: file.file_name || file.name || null,
            index: index,
          }))
        : [],

      file_description:
        filesArray.length > 0 ? filesArray[0].file_description || "" : "",
      file_attachment:
        filesArray.length > 0 ? filesArray[0].file_attachment || null : null,
      file_type_id:
        filesArray.length > 0
          ? filesArray[0].file_type_id || filesArray[0].file_type?.id || ""
          : "",
      file_cabinet_id:
        filesArray.length > 0
          ? filesArray[0].file_cabinet_id ||
            filesArray[0].file_cabinet?.id ||
            ""
          : "",
      file_type: filesArray.length > 0 ? filesArray[0].file_type || null : null,
      file_cabinet:
        filesArray.length > 0 ? filesArray[0].file_cabinet || null : null,
    };

    console.log(
      "DEBUG getDefaultValues - result existing_attachment_filename:",
      result.existing_attachment_filename
    );
    return result;
  }

  return {
    first_name: "",
    last_name: "",
    middle_name: "",
    suffix: "",
    prefix: null,
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

    attainment_id: null,
    program_id: null,
    degree_id: null,
    honor_title_id: null,
    academic_year_from: "",
    academic_year_to: "",
    gpa: "",
    institution: "",
    attainment_attachment: null,
    existing_attachment_filename: "",
    existing_attachment_url: "",
    attainment_remarks: "",

    sss_number: "",
    pag_ibig_number: "",
    philhealth_number: "",
    tin_number: "",
    bank: null,
    bank_id: "",
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
