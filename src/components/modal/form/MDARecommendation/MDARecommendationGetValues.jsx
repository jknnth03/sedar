import dayjs from "dayjs";

export const getCreateModeInitialValues = () => ({
  form_id: 5,
  da_submission_id: null,
  employee_id: null,
  employee_name: "",
  employee_number: "",
  birth_date: "",
  birth_place: "",
  gender: "",
  nationality: "",
  civil_status: "",
  address: "",
  tin_number: "",
  sss_number: "",
  pag_ibig_number: "",
  philhealth_number: "",
  effective_date: null,
  movement_type: "",
  from_position_id: null,
  from_position_title: "",
  from_department: "",
  from_sub_unit: "",
  from_job_level_id: null,
  from_job_level: "",
  from_schedule: "",
  from_job_rate: "",
  from_allowance: "",
  from_additional_rate: "",
  to_position_id: null,
  to_position_title: "",
  to_department: "",
  to_sub_unit: "",
  to_job_level_id: null,
  to_job_level: "",
  to_schedule: "",
  to_job_rate: "",
  to_allowance: "",
  to_additional_rate: "",
});

export const getViewEditModeFormData = (selectedEntry) => {
  const submittable =
    selectedEntry?.submittable || selectedEntry?.result?.submittable;

  if (!submittable) return getCreateModeInitialValues();

  const fromDetails = submittable.from_details || {};
  const toDetails = submittable.to_details || {};

  return {
    form_id: selectedEntry?.form?.id || selectedEntry?.result?.form?.id || 5,
    reference_number: submittable.reference_number || "",
    da_submission_id: submittable.da_submission_id || null,
    employee_id: submittable.employee_id || null,
    employee_name: submittable.employee_name || "",
    employee_number: submittable.employee_number || "",
    birth_date: submittable.birth_date || "",
    birth_place: submittable.birth_place || "",
    gender: submittable.gender || "",
    nationality: submittable.nationality || "",
    civil_status: submittable.civil_status || "",
    address: submittable.address || "",
    tin_number: submittable.tin_number || "",
    sss_number: submittable.sss_number || "",
    pag_ibig_number: submittable.pag_ibig_number || "",
    philhealth_number: submittable.philhealth_number || "",
    effective_date: submittable.effective_date
      ? dayjs(submittable.effective_date)
      : null,
    movement_type: submittable.movement_type || "",
    from_position_id: fromDetails.position_id || null,
    from_position_title: fromDetails.position_title || "",
    from_department: fromDetails.department || "",
    from_sub_unit: fromDetails.sub_unit || "",
    from_job_level_id: fromDetails.job_level_id || null,
    from_job_level: fromDetails.job_level || "",
    from_schedule: fromDetails.schedule || "",
    from_job_rate: fromDetails.job_rate || "",
    from_allowance: fromDetails.allowance || "",
    from_additional_rate: fromDetails.additional_rate || "",
    to_position_id: toDetails.position_id || null,
    to_position_title: toDetails.position_title || "",
    to_department: toDetails.department || "",
    to_sub_unit: toDetails.sub_unit || "",
    to_job_level_id: toDetails.job_level_id || null,
    to_job_level: toDetails.job_level || "",
    to_schedule: toDetails.schedule || "",
    to_job_rate: toDetails.job_rate || "",
    to_allowance: toDetails.allowance || "",
    to_additional_rate: toDetails.additional_rate || "",
  };
};

export const formatFormDataForSubmission = (formData) => {
  const baseData = {
    form_id: formData.form_id || 5,
    employee_id: formData.employee_id,
    employee_name: formData.employee_name,
    employee_number: formData.employee_number,
    birth_date: formData.birth_date,
    birth_place: formData.birth_place,
    gender: formData.gender,
    nationality: formData.nationality,
    civil_status: formData.civil_status,
    address: formData.address,
    tin_number: formData.tin_number,
    sss_number: formData.sss_number,
    pag_ibig_number: formData.pag_ibig_number,
    philhealth_number: formData.philhealth_number,
    effective_date: formData.effective_date
      ? dayjs(formData.effective_date).format("YYYY-MM-DD")
      : null,
    movement_type: formData.movement_type,
    from_position_id: formData.from_position_id,
    from_position_title: formData.from_position_title,
    from_department: formData.from_department,
    from_sub_unit: formData.from_sub_unit || "",
    from_job_level_id: formData.from_job_level_id || null,
    from_job_level: formData.from_job_level || "",
    from_schedule: formData.from_schedule || "",
    from_job_rate: formData.from_job_rate,
    from_allowance: formData.from_allowance || "",
    from_additional_rate: formData.from_additional_rate || "",
    to_position_id: formData.to_position_id,
    to_position_title: formData.to_position_title,
    to_department: formData.to_department,
    to_sub_unit: formData.to_sub_unit || "",
    to_job_level_id: formData.to_job_level_id || null,
    to_job_level: formData.to_job_level || "",
    to_schedule: formData.to_schedule || "",
    to_job_rate: formData.to_job_rate,
    to_allowance: formData.to_allowance || "",
    to_additional_rate: formData.to_additional_rate || "",
  };

  // Add da_submission_id if it exists (for creating MDA from DA)
  if (formData.da_submission_id) {
    baseData.da_submission_id = formData.da_submission_id;
  }

  return baseData;
};

export const validateMDARecommendationData = (formData) => {
  const errors = [];

  // Employee Information Validation
  if (!formData.employee_id) errors.push("Employee is required");
  if (!formData.employee_number) errors.push("Employee number is required");
  if (!formData.birth_date) errors.push("Birth date is required");
  if (!formData.birth_place) errors.push("Birth place is required");
  if (!formData.gender) errors.push("Gender is required");
  if (!formData.nationality) errors.push("Nationality is required");
  if (!formData.civil_status) errors.push("Civil status is required");
  if (!formData.address) errors.push("Address is required");
  if (!formData.tin_number) errors.push("TIN number is required");
  if (!formData.sss_number) errors.push("SSS number is required");
  if (!formData.pag_ibig_number) errors.push("Pag-IBIG number is required");
  if (!formData.philhealth_number) errors.push("PhilHealth number is required");

  // Movement Details Validation
  if (!formData.effective_date) errors.push("Effective date is required");
  if (!formData.movement_type) errors.push("Movement type is required");

  // Position Validation
  if (!formData.from_position_id) errors.push("FROM Position is required");
  if (!formData.to_position_id) errors.push("TO Position is required");

  // Rate Validation
  if (formData.to_job_rate && formData.to_job_rate < 0) {
    errors.push("Job rate cannot be negative");
  }
  if (formData.to_additional_rate && formData.to_additional_rate < 0) {
    errors.push("Additional rate cannot be negative");
  }
  if (formData.to_allowance && formData.to_allowance < 0) {
    errors.push("Allowance cannot be negative");
  }

  return { isValid: errors.length === 0, errors };
};

export const getMDAStatusColor = (status) => {
  const normalizedStatus = status?.toUpperCase().replace(/[-_]/g, " ").trim();

  const colors = {
    PENDING: "warning",
    "FOR APPROVAL": "info",
    APPROVED: "success",
    REJECTED: "error",
    CANCELLED: "default",
    COMPLETED: "success",
    "FOR REVISION": "warning",
    "FOR RESUBMISSION": "warning",
  };

  return colors[normalizedStatus] || "default";
};

export const getMDAStatusLabel = (status) => {
  if (!status) return "Unknown";
  return status.toUpperCase().replace(/[-_]/g, " ").trim();
};

export const formatMDAReference = (referenceNumber) => {
  if (!referenceNumber) return "N/A";
  return referenceNumber;
};

export const getMovementTypeColor = (movementType) => {
  const colors = {
    Promotion: "success",
    Transfer: "info",
    Demotion: "error",
    "Developmental Assignment (DA)": "primary",
    "Special Assignment": "warning",
    "Re-assignment": "info",
  };

  return colors[movementType] || "default";
};

export const calculateRateDifference = (fromRate, toRate) => {
  const from = parseFloat(fromRate) || 0;
  const to = parseFloat(toRate) || 0;
  const difference = to - from;

  return {
    difference: difference,
    percentage: from > 0 ? ((difference / from) * 100).toFixed(2) : 0,
    isIncrease: difference > 0,
    isDecrease: difference < 0,
    isNoChange: difference === 0,
  };
};

export const formatCurrency = (amount) => {
  if (!amount) return "₱0.00";
  return `₱${parseFloat(amount).toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

export const parseMDAActivityLog = (activityLog) => {
  if (!activityLog || !Array.isArray(activityLog)) return [];

  return activityLog
    .map((log) => ({
      id: log.id,
      eventType: log.event_type,
      description: log.description,
      timestamp: log.timestamp ? dayjs(log.timestamp) : null,
      actor: log.actor
        ? {
            id: log.actor.id,
            fullName: log.actor.full_name,
            username: log.actor.username,
            title: log.actor.title,
          }
        : null,
      context: log.context || null,
    }))
    .sort((a, b) => {
      if (!a.timestamp || !b.timestamp) return 0;
      return b.timestamp.diff(a.timestamp);
    });
};

export const getMDAFormActions = (actions) => {
  if (!actions)
    return {
      canUpdate: false,
      canResubmit: false,
      canCancel: false,
      canArchive: false,
      canRecommend: false,
    };

  return {
    canUpdate: actions.can_update || false,
    canResubmit: actions.can_resubmit || false,
    canCancel: actions.can_cancel || false,
    canArchive: actions.can_archive || false,
    canRecommend: actions.can_recommend || false,
  };
};
