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

    const manpowerFormId =
      result.manpower_form_id ||
      generalInfo.manpower_form_id ||
      extractId(result.manpower_form) ||
      extractId(result.approval_form) ||
      "";

    const manpowerFormObject =
      extractObject(result.manpower_form) ||
      extractObject(result.approval_form) ||
      extractObject(generalInfo.submission_title) ||
      null;

    const pendingResult = {
      id: result.id || "",
      employee_name: result.employee_name || "",
      current_status: result.current_status || "",

      manpower_form_id: manpowerFormId,
      approval_form: manpowerFormObject,

      submission_title:
        manpowerFormObject || extractObject(generalInfo.submission_title),
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
      attainment_id: attainmentObject,
      program: programObject,
      program_id: programObject,
      degree: degreeObject,
      degree_id: degreeObject,
      honor_title: honorTitleObject,
      honor_title_id: honorTitleObject,
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

export const transformPendingEmployeeData = (formData) => {
  const transformedData = new FormData();

  const safeAppend = (key, value) => {
    if (value !== null && value !== undefined && value !== "") {
      transformedData.append(key, value);
    }
  };

  const extractId = (value) => {
    if (!value) return null;
    if (typeof value === "object" && value.id) return value.id;
    if (typeof value === "number") return value.toString();
    return value;
  };

  transformedData.append("_method", "PATCH");

  const submissionTitleValue = formData.submission_title;
  const approvalFormValue = formData.approval_form;
  const manpowerFormIdValue = formData.manpower_form_id;

  let manpowerFormId = null;

  if (submissionTitleValue) {
    manpowerFormId = extractId(submissionTitleValue);
  } else if (approvalFormValue) {
    manpowerFormId = extractId(approvalFormValue);
  } else if (manpowerFormIdValue) {
    manpowerFormId = extractId(manpowerFormIdValue);
  }

  if (manpowerFormId) {
    transformedData.append("manpower_form_id", manpowerFormId);
  }

  safeAppend("first_name", formData.first_name);
  safeAppend("middle_name", formData.middle_name);
  safeAppend("last_name", formData.last_name);
  safeAppend("employee_code", formData.employee_code);
  safeAppend("suffix", formData.suffix);
  safeAppend("prefix_id", extractId(formData.prefix));
  safeAppend("id_number", formData.id_number);
  safeAppend("birth_date", formData.birth_date);
  safeAppend("religion_id", extractId(formData.religion));
  safeAppend("civil_status", formData.civil_status);
  safeAppend("gender", formData.gender);
  safeAppend("remarks", formData.remarks);

  safeAppend("referred_by_id", extractId(formData.referred_by));

  safeAppend(
    "region_id",
    extractId(formData.region) || extractId(formData.region_id)
  );
  safeAppend(
    "province_id",
    extractId(formData.province) || extractId(formData.province_id)
  );
  safeAppend(
    "city_municipality_id",
    extractId(formData.city_municipality) ||
      extractId(formData.city_municipality_id)
  );
  safeAppend(
    "barangay_id",
    extractId(formData.barangay) || extractId(formData.barangay_id)
  );
  safeAppend("sub_municipality", formData.sub_municipality);
  safeAppend("street", formData.street);
  safeAppend("zip_code", formData.zip_code);
  safeAppend("local_address", formData.local_address);
  safeAppend("foreign_address", formData.foreign_address);
  safeAppend("address_remarks", formData.address_remarks);

  safeAppend(
    "position_id",
    extractId(formData.position) || extractId(formData.position_id)
  );
  safeAppend(
    "schedule_id",
    extractId(formData.schedule) || extractId(formData.schedule_id)
  );
  safeAppend(
    "job_level_id",
    extractId(formData.job_level) || extractId(formData.job_level_id)
  );
  safeAppend("job_rate", formData.job_rate);
  safeAppend("allowance", formData.allowance);
  safeAppend("salary", formData.salary);
  safeAppend("additional_rate", formData.additional_rate);
  safeAppend("additional_rate_remarks", formData.additional_rate_remarks);
  safeAppend("additional_tools", formData.additional_tools);

  if (formData.employment_types && Array.isArray(formData.employment_types)) {
    formData.employment_types.forEach((emp, index) => {
      safeAppend(`employment_types[${index}][id]`, emp.id || "");
      safeAppend(
        `employment_types[${index}][employment_type_label]`,
        emp.employment_type_label || ""
      );
      safeAppend(
        `employment_types[${index}][employment_start_date]`,
        emp.employment_start_date || ""
      );
      safeAppend(
        `employment_types[${index}][employment_end_date]`,
        emp.employment_end_date || ""
      );
      safeAppend(
        `employment_types[${index}][regularization_date]`,
        emp.regularization_date || ""
      );
    });
  }

  if (formData.statuses && Array.isArray(formData.statuses)) {
    formData.statuses.forEach((status, index) => {
      safeAppend(`statuses[${index}][id]`, status.id || "");
      safeAppend(
        `statuses[${index}][employee_status_label]`,
        status.employee_status_label || ""
      );
      safeAppend(
        `statuses[${index}][employee_status]`,
        status.employee_status || ""
      );
      safeAppend(
        `statuses[${index}][employee_status_start_date]`,
        status.employee_status_start_date || ""
      );
      safeAppend(
        `statuses[${index}][employee_status_end_date]`,
        status.employee_status_end_date || ""
      );
      safeAppend(
        `statuses[${index}][employee_status_effectivity_date]`,
        status.employee_status_effectivity_date || ""
      );

      if (
        status.employee_status_attachment &&
        status.employee_status_attachment instanceof File
      ) {
        transformedData.append(
          `statuses[${index}][employee_status_attachment]`,
          status.employee_status_attachment
        );
      }
    });
  }

  safeAppend(
    "attainment_id",
    extractId(formData.attainment) || extractId(formData.attainment_id)
  );
  safeAppend(
    "program_id",
    extractId(formData.program) || extractId(formData.program_id)
  );
  safeAppend(
    "degree_id",
    extractId(formData.degree) || extractId(formData.degree_id)
  );
  safeAppend(
    "honor_title_id",
    extractId(formData.honor_title) || extractId(formData.honor_title_id)
  );
  safeAppend("academic_year_from", formData.academic_year_from);
  safeAppend("academic_year_to", formData.academic_year_to);
  safeAppend("gpa", formData.gpa);
  safeAppend("institution", formData.institution);
  safeAppend("attainment_remarks", formData.attainment_remarks);

  if (
    formData.attainment_attachment &&
    formData.attainment_attachment instanceof File
  ) {
    transformedData.append(
      "attainment_attachment",
      formData.attainment_attachment
    );
  }

  safeAppend("sss_number", formData.sss_number);
  safeAppend("pag_ibig_number", formData.pag_ibig_number);
  safeAppend("philhealth_number", formData.philhealth_number);
  safeAppend("tin_number", formData.tin_number);

  safeAppend(
    "bank_id",
    extractId(formData.bank) || extractId(formData.bank_id)
  );
  safeAppend("bank_account_number", formData.bank_account_number);

  safeAppend("email_address", formData.email_address);
  safeAppend("mobile_number", formData.mobile_number);
  safeAppend("email_address_remarks", formData.email_address_remarks);
  safeAppend("mobile_number_remarks", formData.mobile_number_remarks);
  safeAppend("contact_remarks", formData.contact_remarks);

  if (formData.files && Array.isArray(formData.files)) {
    formData.files.forEach((file, index) => {
      if (file.file_description || file.file_attachment || file.file_name) {
        safeAppend(
          `files[${index}][id]`,
          file.original_file_id || file.id || ""
        );
        safeAppend(`files[${index}][employee_id]`, file.employee_id || "");
        safeAppend(
          `files[${index}][file_description]`,
          file.file_description || ""
        );
        safeAppend(`files[${index}][file_name]`, file.file_name || "");

        safeAppend(
          `files[${index}][file_type_id]`,
          extractId(file.file_type) || extractId(file.file_type_id) || ""
        );
        safeAppend(
          `files[${index}][file_cabinet_id]`,
          extractId(file.file_cabinet) || extractId(file.file_cabinet_id) || ""
        );

        if (file.file_attachment && file.file_attachment instanceof File) {
          transformedData.append(
            `files[${index}][file_attachment]`,
            file.file_attachment
          );
        }
      }
    });
  }

  if (formData.file_attachment && formData.file_attachment instanceof File) {
    transformedData.append("file_attachment", formData.file_attachment);
  }
  safeAppend("file_description", formData.file_description);
  safeAppend("file_name", formData.file_name);
  safeAppend("file_type_id", extractId(formData.file_type));
  safeAppend("file_cabinet_id", extractId(formData.file_cabinet));

  return transformedData;
};
