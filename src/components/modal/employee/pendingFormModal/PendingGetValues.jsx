export const getPendingValues = ({ mode, initialData }) => {
  if (!initialData) {
    return {
      id: null,
      employee_code: "",
      first_name: "",
      middle_name: "",
      last_name: "",
      suffix: "",
      prefix: null,
      id_number: "",
      birth_date: "",
      birth_place: "",
      nationality: "",
      religion: null,
      civil_status: "",
      gender: "",
      referred_by: null,
      remarks: "",

      region_id: null,
      province_id: null,
      city_municipality_id: null,
      sub_municipality: "",
      barangay_id: null,
      street: "",
      zip_code: "",
      local_address: "",
      foreign_address: "",
      address_remarks: "",

      position_id: null,
      schedule_id: null,
      job_level_id: null,
      position: null,
      schedule: null,
      job_level: null,
      job_rate: "",
      allowance: "",
      additional_rate: "",
      additional_rate_remarks: "",
      additional_tools: "",
      salary: "",

      employment_types: [
        {
          id: null,
          employment_type_label: "REGULAR",
          employment_start_date: "",
          employment_end_date: "",
          regularization_date: "",
        },
      ],

      attainment_id: null,
      program_id: null,
      degree_id: null,
      honor_title_id: null,
      attainment: null,
      program: null,
      degree: null,
      honor_title: null,
      academic_year_from: "",
      academic_year_to: "",
      gpa: "",
      institution: "",
      attainment_remarks: "",
      attainment_attachment: null,
      existing_attachment_url: "",
      existing_attachment_filename: "",

      sss_number: "",
      pag_ibig_number: "",
      philhealth_number: "",
      tin_number: "",
      bank: null,
      bank_id: null,
      bank_account_number: "",

      email_address: "",
      mobile_number: "",
      email_address_remarks: "",
      mobile_number_remarks: "",
      contact_remarks: "",

      files: [],
      file_description: "",
      file_attachment: null,
      file_type: null,
      file_cabinet: null,
      file_name: "",
    };
  }

  const firstAttainment = initialData.attainments?.[0];

  return {
    id: initialData.id || initialData.submission_id || null,
    employee_name: initialData.employee_name || "",
    current_status: initialData.current_status || "",

    employee_code: initialData.general_info?.employee_code || "",
    manpower_form_id: initialData.general_info?.linked_mrf_title || "",
    submission_title: {
      id: initialData.general_info?.linked_mrf_title || "",
      submission_title: initialData.general_info?.linked_mrf_title || "",
      name: initialData.general_info?.linked_mrf_title || "",
      title: initialData.general_info?.linked_mrf_title || "",
    },
    full_name: initialData.general_info?.full_name || "",
    first_name: initialData.general_info?.first_name || "",
    middle_name: initialData.general_info?.middle_name || "",
    last_name: initialData.general_info?.last_name || "",
    suffix: initialData.general_info?.suffix || "",
    prefix: initialData.general_info?.prefix || null,
    id_number: initialData.general_info?.id_number || "",
    birth_date: initialData.general_info?.birth_date
      ? new Date(initialData.general_info.birth_date)
          .toISOString()
          .split("T")[0]
      : "",
    birth_place: initialData.general_info?.birth_place || "",
    nationality: initialData.general_info?.nationality || "",
    religion: initialData.general_info?.religion || null,
    civil_status: initialData.general_info?.civil_status || "",
    gender: initialData.general_info?.gender || "",
    referred_by: initialData.general_info?.referred_by || null,
    remarks: initialData.general_info?.remarks || "",
    image_url: initialData.general_info?.image_url || "",

    region: initialData.address?.region || null,
    province: initialData.address?.province || null,
    city_municipality: initialData.address?.city_municipality || null,
    barangay: initialData.address?.barangay || null,
    region_id: initialData.address?.region?.id || null,
    province_id: initialData.address?.province?.id || null,
    city_municipality_id: initialData.address?.city_municipality?.id || null,
    sub_municipality: initialData.address?.sub_municipality || "",
    barangay_id: initialData.address?.barangay?.id || null,
    street: initialData.address?.street || "",
    zip_code: initialData.address?.zip_code || "",
    local_address: initialData.address?.local_address || "",
    foreign_address: initialData.address?.foreign_address || "",
    address_remarks: initialData.address?.remarks || "",

    position_id: initialData.position_details?.position || null,
    schedule_id: initialData.position_details?.schedule || null,
    job_level_id: initialData.position_details?.job_level || null,
    position: initialData.position_details?.position || null,
    schedule: initialData.position_details?.schedule || null,
    job_level: initialData.position_details?.job_level || null,
    job_rate: initialData.position_details?.job_rate || "",
    allowance: initialData.position_details?.allowance || "",
    additional_rate: initialData.position_details?.additional_rate || "",
    additional_rate_remarks:
      initialData.position_details?.additional_rate_remarks || "",
    additional_tools: initialData.position_details?.additional_tools || "",
    salary: initialData.position_details?.salary || "",

    employment_types: initialData.employment_types?.map((emp) => ({
      id: emp.id || null,
      employment_type_label: emp.employment_type_label || "",
      employment_start_date: emp.employment_start_date
        ? new Date(emp.employment_start_date).toISOString().split("T")[0]
        : "",
      employment_end_date: emp.employment_end_date
        ? new Date(emp.employment_end_date).toISOString().split("T")[0]
        : "",
      regularization_date: emp.regularization_date
        ? new Date(emp.regularization_date).toISOString().split("T")[0]
        : "",
    })) || [
      {
        id: null,
        employment_type_label: "REGULAR",
        employment_start_date: "",
        employment_end_date: "",
        regularization_date: "",
      },
    ],

    employee_status: initialData.statuses?.[0]?.employee_status || "",
    employee_status_label:
      initialData.statuses?.[0]?.employee_status_label || "",
    employee_status_start_date: initialData.statuses?.[0]
      ?.employee_status_start_date
      ? new Date(initialData.statuses[0].employee_status_start_date)
          .toISOString()
          .split("T")[0]
      : "",
    employee_status_end_date: initialData.statuses?.[0]
      ?.employee_status_end_date
      ? new Date(initialData.statuses[0].employee_status_end_date)
          .toISOString()
          .split("T")[0]
      : "",
    employee_status_effectivity_date: initialData.statuses?.[0]
      ?.employee_status_effectivity_date
      ? new Date(initialData.statuses[0].employee_status_effectivity_date)
          .toISOString()
          .split("T")[0]
      : "",
    employee_status_attachment: null,
    statuses: initialData.statuses || [],

    attainment_id: firstAttainment?.attainment || null,
    program_id: firstAttainment?.program || null,
    degree_id: firstAttainment?.degree || null,
    honor_title_id: firstAttainment?.honor_title || null,
    attainment: firstAttainment?.attainment || null,
    program: firstAttainment?.program || null,
    degree: firstAttainment?.degree || null,
    honor_title: firstAttainment?.honor_title || null,
    academic_year_from: firstAttainment?.academic_year_from || "",
    academic_year_to: firstAttainment?.academic_year_to || "",
    gpa: firstAttainment?.gpa || "",
    institution: firstAttainment?.institution || "",
    attainment_remarks: firstAttainment?.attainment_remarks || "",
    attainment_attachment: null,
    existing_attachment_url: firstAttainment?.attainment_attachment || "",
    existing_attachment_filename:
      firstAttainment?.attainment_attachment_filename || "",

    sss_number: initialData.account?.sss_number || "",
    pag_ibig_number: initialData.account?.pag_ibig_number || "",
    philhealth_number: initialData.account?.philhealth_number || "",
    tin_number: initialData.account?.tin_number || "",
    bank: initialData.account?.bank || null,
    bank_id: initialData.account?.bank?.id || null,
    bank_account_number: initialData.account?.bank_account_number || "",

    email_address: initialData.contacts?.email_address || "",
    mobile_number: initialData.contacts?.mobile_number || "",
    email_address_remarks: initialData.contacts?.email_address_remarks || "",
    mobile_number_remarks: initialData.contacts?.mobile_number_remarks || "",
    contact_remarks: initialData.contacts?.contact_remarks || "",

    files: initialData.files || [],
    file_description: initialData.files?.[0]?.file_description || "",
    file_attachment: initialData.files?.[0]?.file_attachment || "",
    file_type: initialData.files?.[0]?.file_type || null,
    file_cabinet: initialData.files?.[0]?.file_cabinet || null,
    file_name: initialData.files?.[0]?.file_name || "",
  };
};
