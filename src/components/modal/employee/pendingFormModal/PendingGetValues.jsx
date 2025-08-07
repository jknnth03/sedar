export const getPendingValues = ({ mode, initialData }) => {
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

  const processEmploymentTypes = (employmentData) => {
    let employmentTypes = [];
    if (
      employmentData &&
      Array.isArray(employmentData) &&
      employmentData.length > 0
    ) {
      employmentTypes = employmentData.map((emp, index) => ({
        id: emp.id || null,
        index: emp.index !== undefined ? emp.index : index,
        employment_type_label: emp.employment_type_label || "",
        employment_start_date: formatDateForInput(emp.employment_start_date),
        employment_end_date: formatDateForInput(emp.employment_end_date),
        regularization_date: formatDateForInput(emp.regularization_date),
      }));
    }
    if (employmentTypes.length === 0) {
      employmentTypes = [
        {
          id: null,
          index: 0,
          employment_type_label: "REGULAR",
          employment_start_date: "",
          employment_end_date: "",
          regularization_date: "",
        },
      ];
    }
    return employmentTypes;
  };

  if (
    !initialData ||
    typeof initialData === "number" ||
    typeof initialData === "string"
  ) {
    const defaults = getDefaultPendingValues();
    defaults.employment_types = processEmploymentTypes([]);
    return defaults;
  }

  if ((mode === "edit" || mode === "view") && initialData) {
    const result = initialData.result || initialData;

    if (!result) {
      const defaults = getDefaultPendingValues();
      defaults.employment_types = processEmploymentTypes([]);
      return defaults;
    }

    if (!result.general_info && !result.first_name && !result.id) {
      const defaults = getDefaultPendingValues();
      defaults.employment_types = processEmploymentTypes([]);
      return defaults;
    }

    const generalInfo = result.general_info || result;
    const addressInfo = result.address || {};
    const positionInfo = result.position_details || {};
    const statusesArray = result.statuses || [];
    const attainmentsArray = result.attainments || [];
    const accountInfo = result.account || {};
    const contactInfo = result.contacts || {};
    const filesArray = result.files || [];

    let employmentTypesSource =
      result.employment_types ||
      result.employment ||
      statusesArray.filter((s) => s.employment_type_label) ||
      [];
    const processedEmploymentTypes = processEmploymentTypes(
      employmentTypesSource
    );

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

    const extractId = (value) => {
      if (!value) return "";
      if (typeof value === "object" && value.id) return value.id;
      if (typeof value === "string" || typeof value === "number") return value;
      return "";
    };

    const extractObject = (value) => {
      if (!value) return null;
      if (typeof value === "object" && value.id) {
        return {
          id: value.id,
          name: value.name || value.label || `Item ${value.id}`,
          ...value,
        };
      }
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

    const attainmentObject =
      result.attainment || extractObject(attainmentInfo.attainment);
    const programObject =
      result.program || extractObject(attainmentInfo.program);
    const degreeObject = result.degree || extractObject(attainmentInfo.degree);
    const honorTitleObject =
      result.honor_title || extractObject(attainmentInfo.honor_title);

    const processedFiles =
      Array.isArray(filesArray) && filesArray.length > 0
        ? filesArray.map((file, index) => {
            let fileTypeObj = null;
            let fileTypeId = null;

            if (file.file_type) {
              if (typeof file.file_type === "object" && file.file_type.id) {
                fileTypeObj = file.file_type;
                fileTypeId = file.file_type.id;
              } else if (
                typeof file.file_type === "number" ||
                typeof file.file_type === "string"
              ) {
                fileTypeId = file.file_type;
                fileTypeObj = {
                  id: fileTypeId,
                  name: `File Type ${fileTypeId}`,
                };
              }
            }

            let fileCabinetObj = null;
            let fileCabinetId = null;

            if (file.file_cabinet) {
              if (
                typeof file.file_cabinet === "object" &&
                file.file_cabinet.id
              ) {
                fileCabinetObj = file.file_cabinet;
                fileCabinetId = file.file_cabinet.id;
              } else if (
                typeof file.file_cabinet === "number" ||
                typeof file.file_cabinet === "string"
              ) {
                fileCabinetId = file.file_cabinet;
                fileCabinetObj = {
                  id: fileCabinetId,
                  name: `File Cabinet ${fileCabinetId}`,
                };
              }
            }

            return {
              id:
                file.id ||
                `pending_file_${Date.now()}_${index}_${Math.random()
                  .toString(36)
                  .substr(2, 9)}`,
              original_file_id: file.id || null,
              employee_id: file.employee_id || "",
              file_description: file.file_description || file.description || "",
              file_attachment: null,
              file_name: file.file_name || file.filename || "",
              existing_file_name: file.file_name || file.filename || null,
              existing_file_url: file.file_attachment || file.file_url || null,
              file_url: file.file_attachment || file.file_url || null,

              file_type_id: fileTypeObj,
              file_cabinet_id: fileCabinetObj,

              file_type: fileTypeObj,
              file_cabinet: fileCabinetObj,
              file_type_raw_id: fileTypeId,
              file_cabinet_raw_id: fileCabinetId,

              is_new_file: false,
              index: index,
            };
          })
        : [
            {
              id: `pending_file_${Date.now()}_0_${Math.random()
                .toString(36)
                .substr(2, 9)}`,
              original_file_id: null,
              employee_id: "",
              file_description: "",
              file_attachment: null,
              file_name: "",
              existing_file_name: null,
              existing_file_url: null,
              file_url: null,
              file_type: null,
              file_type_id: null,
              file_cabinet: null,
              file_cabinet_id: null,
              is_new_file: true,
              index: 0,
            },
          ];

    const createSubmissionTitleFromLinked = (linkedMrfTitle) => {
      if (!linkedMrfTitle) return null;

      const parts = linkedMrfTitle.split(" | ");
      const idPart = parts[0] || "";

      return {
        id: idPart,
        submission_title: linkedMrfTitle,
        name: linkedMrfTitle,
        title: linkedMrfTitle,
        ...generalInfo.submission_title,
      };
    };

    const pendingResult = {
      id: result.id || "",
      employee_name: result.employee_name || "",
      current_status: result.current_status || "",

      manpower_form_id:
        result.manpower_form_id ||
        generalInfo.manpower_form_id ||
        result.manpower_form?.id ||
        "",

      submission_title:
        createSubmissionTitleFromLinked(generalInfo.linked_mrf_title) ||
        extractObject(generalInfo.submission_title) ||
        null,

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
      referred_by: extractObject(generalInfo.referred_by) || null,
      remarks: generalInfo.remarks || "",

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

      employment_types: processedEmploymentTypes,

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

      attainment: attainmentObject,
      attainment_id: extractId(attainmentInfo.attainment) || "",
      program: programObject,
      program_id: extractId(attainmentInfo.program) || "",
      degree: degreeObject,
      degree_id: extractId(attainmentInfo.degree) || "",
      honor_title: honorTitleObject,
      honor_title_id: extractId(attainmentInfo.honor_title) || "",
      academic_year_from:
        attainmentInfo.academic_year_from || result.academic_year_from || "",
      academic_year_to:
        attainmentInfo.academic_year_to || result.academic_year_to || "",
      gpa: attainmentInfo.gpa || result.gpa || "",
      institution: attainmentInfo.institution || result.institution || "",
      attainment_attachment:
        attainmentInfo.attainment_attachment ||
        result.attainment_attachment ||
        null,
      existing_attachment_filename:
        attainmentInfo.attainment_attachment_filename ||
        result.existing_attachment_filename ||
        "",
      existing_attachment_url:
        attainmentInfo.attainment_attachment ||
        result.existing_attachment_url ||
        "",
      attainment_remarks:
        attainmentInfo.attainment_remarks || result.attainment_remarks || "",

      sss_number: accountInfo.sss_number || "",
      pag_ibig_number: accountInfo.pag_ibig_number || "",
      philhealth_number: accountInfo.philhealth_number || "",
      tin_number: accountInfo.tin_number || "",
      bank: bankObject,
      bank_id: bankIdValue,
      bank_account_number: accountInfo.bank_account_number || "",

      email_address: contactInfo.email_address || "",
      mobile_number: contactInfo.mobile_number || "",
      email_address_remarks: contactInfo.email_address_remarks || "",
      mobile_number_remarks: contactInfo.mobile_number_remarks || "",
      contact_remarks: contactInfo.contact_remarks || "",

      files: processedFiles,

      file_description:
        filesArray.length > 0 ? filesArray[0].file_description || "" : "",
      file_attachment:
        filesArray.length > 0 ? filesArray[0].file_attachment || null : null,
      file_name: filesArray.length > 0 ? filesArray[0].file_name || "" : "",
      file_type: filesArray.length > 0 ? filesArray[0].file_type || null : null,
      file_cabinet:
        filesArray.length > 0 ? filesArray[0].file_cabinet || null : null,
    };

    return pendingResult;
  }

  const defaults = getDefaultPendingValues();
  defaults.employment_types = processEmploymentTypes([]);
  return defaults;
};

const getDefaultPendingValues = () => {
  return {
    id: "",
    employee_name: "",
    current_status: "",

    manpower_form_id: "",

    submission_title: null,
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
    referred_by: null,
    remarks: "",

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

    employment_types: [
      {
        id: null,
        index: 0,
        employment_type_label: "REGULAR",
        employment_start_date: "",
        employment_end_date: "",
        regularization_date: "",
      },
    ],

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

    sss_number: "",
    pag_ibig_number: "",
    philhealth_number: "",
    tin_number: "",
    bank: null,
    bank_id: "",
    bank_account_number: "",

    email_address: "",
    mobile_number: "",
    email_address_remarks: "",
    mobile_number_remarks: "",
    contact_remarks: "",

    files: [
      {
        id: null,
        original_file_id: null,
        employee_id: "",
        file_description: "",
        file_attachment: null,
        file_name: "",
        existing_file_name: null,
        existing_file_url: null,
        file_url: null,
        file_type: null,
        file_type_id: null,
        file_cabinet: null,
        file_cabinet_id: null,
        is_new_file: true,
        index: 0,
      },
    ],

    file_description: "",
    file_attachment: null,
    file_name: "",
    file_type: null,
    file_cabinet: null,
  };
};

export const getDefaultValues = ({ mode, initialData }) => {
  return getPendingValues({ mode, initialData });
};
