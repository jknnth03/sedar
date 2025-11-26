import dayjs from "dayjs";

export const getViewEditModeFormData = (selectedEntry) => {
  const submittable =
    selectedEntry?.submittable || selectedEntry?.result?.submittable;

  if (!submittable) return getDefaultFormData();

  const employee = submittable.employee || {};
  const fromPosition = submittable.from_position || {};
  const toPosition = submittable.to_position || {};
  const objectives = submittable.objectives || [];
  const daAssessments = submittable.da_assessments || [];
  const daPdp = submittable.da_pdp || null;

  return {
    form_id: selectedEntry?.form?.id || selectedEntry?.result?.form?.id || 5,
    da_submission_id: submittable.id || null,
    employee_id: employee.id || null,
    employee_name: employee.full_name || "",
    employee_number: employee.code || "",
    effective_date: submittable.start_date
      ? dayjs(submittable.start_date)
      : null,
    action_type: submittable.is_developmental_assignment ? "DA" : "",
    birth_date: employee.birth_date ? dayjs(employee.birth_date) : null,
    birth_place: employee.birth_place || "",
    gender: employee.gender || "",
    civil_status: employee.civil_status || "",
    nationality: employee.nationality || "",
    address: "",
    tin_number: "",
    sss_number: "",
    pag_ibig_number: "",
    philhealth_number: "",
    from_position_id: fromPosition.id || null,
    from_position_title: fromPosition.title?.name || "",
    from_job_level_id: fromPosition.job_band_id || null,
    from_job_level: "",
    from_department: fromPosition.charging?.department_name || "",
    from_sub_unit: fromPosition.charging?.sub_unit_name || "",
    from_job_rate: "",
    from_allowance: "",
    to_position_id: toPosition.id || null,
    to_position_title: toPosition.title?.name || "",
    to_job_level_id: toPosition.job_band_id || null,
    to_job_level: "",
    to_department: toPosition.charging?.department_name || "",
    to_sub_unit: toPosition.charging?.sub_unit_name || "",
    to_job_rate: "",
    to_allowance: "",
    start_date: submittable.start_date ? dayjs(submittable.start_date) : null,
    end_date: submittable.end_date ? dayjs(submittable.end_date) : null,
    extension_end_date: submittable.extension_end_date
      ? dayjs(submittable.extension_end_date)
      : null,
    reference_number: submittable.reference_number || "",
    status: submittable.status || "",
    final_recommendation: submittable.final_recommendation || "",
    objectives: objectives.map((obj) => ({
      id: obj.id || null,
      da_submission_id: obj.da_submission_id || null,
      source_kpi_id: obj.source_kpi_id || null,
      objective_id: obj.objective_id || null,
      objective_name: obj.objective_name || "",
      distribution_percentage: obj.distribution_percentage || 0,
      deliverable: obj.deliverable || "",
      target_percentage: obj.target_percentage || 0,
      actual_performance: obj.actual_performance || null,
      remarks: obj.remarks || "",
    })),
    da_assessments: daAssessments.map((assessment) => ({
      id: assessment.id || null,
      da_submission_id: assessment.da_submission_id || null,
      assessment_template_id: assessment.assessment_template_id || null,
      type: assessment.type || "",
      assessor_user_id: assessment.assessor_user_id || null,
      status: assessment.status || "",
      total_score_percentage: assessment.total_score_percentage || null,
      subtotal_scores: assessment.subtotal_scores || null,
      date_assessed: assessment.date_assessed
        ? dayjs(assessment.date_assessed)
        : null,
      signed_document_path: assessment.signed_document_path || null,
      correction_remarks: assessment.correction_remarks || null,
      template: assessment.template || null,
    })),
    da_pdp: daPdp
      ? {
          id: daPdp.id || null,
          da_submission_id: daPdp.da_submission_id || null,
          assessor_user_id: daPdp.assessor_user_id || null,
          status: daPdp.status || "",
          development_plan_objective: daPdp.development_plan_objective || "",
          signed_document_path: daPdp.signed_document_path || null,
          correction_remarks: daPdp.correction_remarks || null,
        }
      : null,
  };
};

export const getDefaultFormData = () => ({
  form_id: 5,
  da_submission_id: null,
  employee_id: null,
  employee_name: "",
  employee_number: "",
  effective_date: null,
  action_type: "",
  birth_date: null,
  birth_place: "",
  gender: "",
  civil_status: "",
  nationality: "",
  address: "",
  tin_number: "",
  sss_number: "",
  pag_ibig_number: "",
  philhealth_number: "",
  from_position_id: null,
  from_position_title: "",
  from_job_level_id: null,
  from_job_level: "",
  from_department: "",
  from_sub_unit: "",
  from_job_rate: "",
  from_allowance: "",
  to_position_id: null,
  to_position_title: "",
  to_job_level_id: null,
  to_job_level: "",
  to_department: "",
  to_sub_unit: "",
  to_job_rate: "",
  to_allowance: "",
  start_date: null,
  end_date: null,
  extension_end_date: null,
  reference_number: "",
  status: "",
  final_recommendation: "",
  objectives: [],
  da_assessments: [],
  da_pdp: null,
});

export const formatFormDataForSubmission = (formData) => {
  const baseData = {
    form_id: formData.form_id || 5,
    employee_id: formData.employee_id,
    from_position_id: formData.from_position_id,
    to_position_id: formData.to_position_id,
    start_date: formData.start_date
      ? dayjs(formData.start_date).format("YYYY-MM-DD")
      : null,
    end_date: formData.end_date
      ? dayjs(formData.end_date).format("YYYY-MM-DD")
      : null,
    extension_end_date: formData.extension_end_date
      ? dayjs(formData.extension_end_date).format("YYYY-MM-DD")
      : null,
  };

  if (formData.objectives?.length) {
    baseData.objectives = formData.objectives.map((obj) => ({
      source_kpi_id: obj.source_kpi_id,
      objective_id: obj.objective_id,
      objective_name: obj.objective_name || "",
      distribution_percentage: Number(obj.distribution_percentage) || 0,
      deliverable: obj.deliverable || "",
      target_percentage: Number(obj.target_percentage) || 0,
      actual_performance: obj.actual_performance
        ? Number(obj.actual_performance)
        : null,
      remarks: obj.remarks || "",
    }));
  }

  return baseData;
};

export const validateDaFormData = (formData) => {
  const errors = [];

  if (!formData.employee_id) errors.push("Employee is required");
  if (!formData.to_position_id) errors.push("Position - TO is required");
  if (!formData.start_date) errors.push("Start date is required");
  if (!formData.end_date) errors.push("End date is required");

  if (formData.start_date && formData.end_date) {
    if (dayjs(formData.end_date).isBefore(dayjs(formData.start_date))) {
      errors.push("End date must be after start date");
    }
  }

  if (!formData.objectives?.length) {
    errors.push("At least one objective is required");
  } else {
    formData.objectives.forEach((obj, index) => {
      if (!obj.source_kpi_id)
        errors.push(`Objective #${index + 1}: Source KPI is required`);
      if (!obj.objective_id)
        errors.push(`Objective #${index + 1}: Objective is required`);
      if (
        obj.distribution_percentage < 0 ||
        obj.distribution_percentage > 100
      ) {
        errors.push(
          `Objective #${
            index + 1
          }: Distribution percentage must be between 0 and 100`
        );
      }
      if (obj.target_percentage < 0 || obj.target_percentage > 100) {
        errors.push(
          `Objective #${index + 1}: Target percentage must be between 0 and 100`
        );
      }
    });

    const totalDistribution = formData.objectives.reduce(
      (sum, obj) => sum + Number(obj.distribution_percentage || 0),
      0
    );

    if (totalDistribution !== 100) {
      errors.push(
        `Total distribution percentage must equal 100% (current: ${totalDistribution}%)`
      );
    }
  }

  return { isValid: errors.length === 0, errors };
};

export const calculateDaDuration = (startDate, endDate) => {
  if (!startDate || !endDate) return 0;
  return dayjs(endDate).diff(dayjs(startDate), "month", true).toFixed(1);
};

export const getDaStatusColor = (status) => {
  const colors = {
    PENDING: "warning",
    PENDING_APPROVAL: "info",
    APPROVED: "success",
    REJECTED: "error",
    CANCELLED: "default",
    COMPLETED: "success",
    IN_PROGRESS: "primary",
    "READY FOR ASSESSMENT": "info",
    "ONGOING ASSESSMENT": "warning",
    "FOR RECOMMENDATION": "warning",
  };
  return colors[status] || "default";
};

export const getAssessmentTypeLabel = (type) => {
  const labels = {
    CAT1: "CAT 1",
    CAT2: "CAT 2",
    CAT3: "CAT 3",
  };
  return labels[type] || type;
};

export const getAssessmentPhaseLabel = (phase) => {
  const labels = {
    KICKOFF: "Kickoff Phase",
    MIDPOINT: "Midpoint Phase",
    FINAL: "Final Phase",
  };
  return labels[phase] || phase;
};

export const getAssessmentStatusLabel = (status) => {
  const labels = {
    PENDING: "Pending",
    KICKOFF_COMPLETE: "Kickoff Complete",
    FOR_APPROVAL: "For Approval",
    APPROVED: "Approved",
    REJECTED: "Rejected",
    IN_PROGRESS: "In Progress",
  };
  return labels[status] || status;
};
