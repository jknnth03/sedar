export const getPendingValues = ({ mode, initialData }) => {
  const formatDateForInput = (dateValue) => {
    if (!dateValue) return "";

    // If already in YYYY-MM-DD format, return as is
    if (
      typeof dateValue === "string" &&
      /^\d{4}-\d{2}-\d{2}$/.test(dateValue)
    ) {
      return dateValue;
    }

    let date;
    if (typeof dateValue === "string") {
      // Handle API date format like "Jun 17, 2007"
      if (dateValue.includes(",")) {
        date = new Date(dateValue);
      } else if (!dateValue.includes("T") && !dateValue.includes(" ")) {
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

  // Handle case where initialData is just an ID or null/undefined
  if (
    !initialData ||
    typeof initialData === "number" ||
    typeof initialData === "string"
  ) {
    console.log(
      "getPendingValues: No data or only ID provided, returning defaults"
    );
    return getDefaultPendingValues();
  }

  if ((mode === "edit" || mode === "view") && initialData) {
    const result = initialData.result || initialData;

    // Check if we have the expected nested structure
    if (!result.general_info && !result.first_name) {
      console.log(
        "getPendingValues: Data structure not as expected, returning defaults"
      );
      return getDefaultPendingValues();
    }

    const generalInfo = result.general_info || result;
    const addressInfo = result.address || {};
    const positionInfo = result.position_details || {};
    const statusesArray = result.statuses || [];
    const attainmentsArray = result.attainments || [];
    const accountInfo = result.account || {};
    const contactInfo = result.contacts || {};
    const filesArray = result.files || [];

    // ... rest of your existing logic for processing the data ...
    // (keeping all the existing processing code)

    const getLatestStatus = (statuses) => {
      if (!statuses || statuses.length === 0) return {};

      const sortedStatuses = statuses
        .filter((status) => status.employee_status_start_date)
        .sort(
          (a, b) =>
            new Date(b.employee_status_start_date) -
            new Date(a.employee_status_start_date)
        );

      return sortedStatuses.length > 0 ? sortedStatuses[0] : statuses[0];
    };

    const statusInfo = getLatestStatus(statusesArray);
    const attainmentInfo =
      attainmentsArray.length > 0 ? attainmentsArray[0] : {};

    // Add debugging logs
    console.log("DEBUG getPendingValues - initialData:", initialData);
    console.log("DEBUG getPendingValues - result:", result);
    console.log("DEBUG getPendingValues - generalInfo:", generalInfo);

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

    const processedStatuses =
      statusesArray.length > 0
        ? statusesArray.map((status, arrayIndex) => ({
            id: status.id || null,
            index: status.index !== undefined ? status.index : arrayIndex,
            employee_status_label: status.employee_status_label || "",
            employee_status: status.employee_status || "",
            employee_status_start_date: formatDateForInput(
              status.employee_status_start_date
            ),
            employee_status_end_date: formatDateForInput(
              status.employee_status_end_date
            ),
            employee_status_effectivity_date: formatDateForInput(
              status.employee_status_effectivity_date
            ),
            employee_status_attachment:
              status.employee_status_attachment || null,
          }))
        : [
            {
              id: null,
              index: 0,
              employee_status_label: "",
              employee_status: "",
              employee_status_start_date: "",
              employee_status_end_date: "",
              employee_status_effectivity_date: "",
              employee_status_attachment: null,
            },
          ];

    const bankValue = accountInfo.bank;
    const bankObject = extractBankObject(bankValue);
    const bankIdValue = extractBankId(bankValue);

    const pendingResult = {
      // Employee ID and basic info
      id: result.id || "",
      employee_name: result.employee_name || "",
      current_status: result.current_status || "",

      // General Information
      employee_code: generalInfo.employee_code || "",
      full_name: generalInfo.full_name || "",
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
      image_url: generalInfo.image_url || "",
      referred_by: generalInfo.referred_by || "",
      remarks: generalInfo.remarks || "",

      // Address Information
      region: extractObject(addressInfo.region) || null,
      region_id: extractId(addressInfo.region) || "",
      province: extractObject(addressInfo.province) || null,
      province_id: extractId(addressInfo.province) || "",
      city_municipality: extractObject(addressInfo.city_municipality) || null,
      city_municipality_id: extractId(addressInfo.city_municipality) || "",
      sub_municipality: addressInfo.sub_municipality || "",
      barangay: extractObject(addressInfo.barangay) || null,
      barangay_id: extractId(addressInfo.barangay) || "",
      street: addressInfo.street || "",
      zip_code: addressInfo.zip_code || "",
      local_address: addressInfo.local_address || "",
      foreign_address: addressInfo.foreign_address || "",
      address_remarks: addressInfo.remarks || "",

      // Position Details
      job_rate: positionInfo.job_rate || 0,
      allowance: positionInfo.allowance || 0,
      salary: positionInfo.salary || 0,
      additional_rate: positionInfo.additional_rate || null,
      additional_tools: positionInfo.additional_tools || "",
      additional_rate_remarks: positionInfo.additional_rate_remarks || "",
      position: extractObject(positionInfo.position) || null,
      position_id: extractId(positionInfo.position) || "",
      schedule: extractObject(positionInfo.schedule) || null,
      schedule_id: extractId(positionInfo.schedule) || "",
      job_level: extractObject(positionInfo.job_level) || null,
      job_level_id: extractId(positionInfo.job_level) || "",

      // Employment Types (empty array based on your data)
      employment_types: [],

      // Status Information
      statuses: processedStatuses,
      employee_status_label: statusInfo.employee_status_label || "",
      employee_status: statusInfo.employee_status || "",
      employee_status_start_date:
        formatDateForInput(statusInfo.employee_status_start_date) || "",
      employee_status_end_date:
        formatDateForInput(statusInfo.employee_status_end_date) || "",
      employee_status_effectivity_date:
        formatDateForInput(statusInfo.employee_status_effectivity_date) || "",
      employee_status_attachment: statusInfo.employee_status_attachment || null,

      // Educational Attainment
      attainment: extractObject(attainmentInfo.attainment) || null,
      attainment_id: extractId(attainmentInfo.attainment) || "",
      program: extractObject(attainmentInfo.program) || null,
      program_id: extractId(attainmentInfo.program) || "",
      degree: extractObject(attainmentInfo.degree) || null,
      degree_id: extractId(attainmentInfo.degree) || "",
      honor_title: extractObject(attainmentInfo.honor_title) || null,
      honor_title_id: extractId(attainmentInfo.honor_title) || "",
      academic_year_from: attainmentInfo.academic_year_from || "",
      academic_year_to: attainmentInfo.academic_year_to || "",
      gpa: attainmentInfo.gpa || "",
      institution: attainmentInfo.institution || "",
      attainment_attachment: attainmentInfo.attainment_attachment || null,
      existing_attachment_filename:
        attainmentInfo.attainment_attachment_filename || "",
      existing_attachment_url: attainmentInfo.attainment_attachment || "",
      attainment_remarks: attainmentInfo.attainment_remarks || "",

      // Account Information
      sss_number: accountInfo.sss_number || "",
      pag_ibig_number: accountInfo.pag_ibig_number || "",
      philhealth_number: accountInfo.philhealth_number || "",
      tin_number: accountInfo.tin_number || "",
      bank: bankObject,
      bank_id: bankIdValue,
      bank_account_number: accountInfo.bank_account_number || "",

      // Contact Information
      email_address: contactInfo.email_address || "",
      mobile_number: contactInfo.mobile_number || "",
      email_address_remarks: contactInfo.email_address_remarks || "",
      mobile_number_remarks: contactInfo.mobile_number_remarks || "",
      contact_remarks: contactInfo.contact_remarks || "",

      // Files
      files: Array.isArray(filesArray)
        ? filesArray.map((file, index) => ({
            id: file.id || null,
            original_file_id: file.id || null,
            employee_id: file.employee_id || "",
            file_description: file.file_description || "",
            file_attachment: file.file_attachment || null,
            file_name: file.file_name || "",
            file_type: file.file_type || null,
            file_type_id: file.file_type?.id || "",
            file_cabinet: file.file_cabinet || null,
            file_cabinet_id: file.file_cabinet?.id || "",
            file_url: file.file_attachment || null,
            index: index,
          }))
        : [],

      // Single file fields (for backward compatibility)
      file_description:
        filesArray.length > 0 ? filesArray[0].file_description || "" : "",
      file_attachment:
        filesArray.length > 0 ? filesArray[0].file_attachment || null : null,
      file_name: filesArray.length > 0 ? filesArray[0].file_name || "" : "",
      file_type_id:
        filesArray.length > 0 ? filesArray[0].file_type?.id || "" : "",
      file_cabinet_id:
        filesArray.length > 0 ? filesArray[0].file_cabinet?.id || "" : "",
      file_type: filesArray.length > 0 ? filesArray[0].file_type || null : null,
      file_cabinet:
        filesArray.length > 0 ? filesArray[0].file_cabinet || null : null,
    };

    console.log("DEBUG getPendingValues - final pendingResult:", pendingResult);
    return pendingResult;
  }

  // Default values for create mode or when no data is available
  return getDefaultPendingValues();
};

// Helper function for default values
const getDefaultPendingValues = () => {
  return {
    // Employee ID and basic info
    id: "",
    employee_name: "",
    current_status: "",

    // General Information
    employee_code: "",
    full_name: "",
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
    image_url: "",
    referred_by: "",
    remarks: "",

    // Address Information
    region: null,
    region_id: "",
    province: null,
    province_id: "",
    city_municipality: null,
    city_municipality_id: "",
    sub_municipality: "",
    barangay: null,
    barangay_id: "",
    street: "",
    zip_code: "",
    local_address: "",
    foreign_address: "",
    address_remarks: "",

    // Position Details
    job_rate: 0,
    allowance: 0,
    salary: 0,
    additional_rate: null,
    additional_tools: "",
    additional_rate_remarks: "",
    position: null,
    position_id: "",
    schedule: null,
    schedule_id: "",
    job_level: null,
    job_level_id: "",

    // Employment Types
    employment_types: [],

    // Status Information
    statuses: [
      {
        id: null,
        index: 0,
        employee_status_label: "",
        employee_status: "",
        employee_status_start_date: "",
        employee_status_end_date: "",
        employee_status_effectivity_date: "",
        employee_status_attachment: null,
      },
    ],
    employee_status_label: "",
    employee_status: "",
    employee_status_start_date: "",
    employee_status_end_date: "",
    employee_status_effectivity_date: "",
    employee_status_attachment: null,

    // Educational Attainment
    attainment: null,
    attainment_id: "",
    program: null,
    program_id: "",
    degree: null,
    degree_id: "",
    honor_title: null,
    honor_title_id: "",
    academic_year_from: "",
    academic_year_to: "",
    gpa: "",
    institution: "",
    attainment_attachment: null,
    existing_attachment_filename: "",
    existing_attachment_url: "",
    attainment_remarks: "",

    // Account Information
    sss_number: "",
    pag_ibig_number: "",
    philhealth_number: "",
    tin_number: "",
    bank: null,
    bank_id: "",
    bank_account_number: "",

    // Contact Information
    email_address: "",
    mobile_number: "",
    email_address_remarks: "",
    mobile_number_remarks: "",
    contact_remarks: "",

    // Files
    files: [],

    // Single file fields
    file_description: "",
    file_attachment: null,
    file_name: "",
    file_type_id: "",
    file_cabinet_id: "",
    file_type: null,
    file_cabinet: null,
  };
};
