import dayjs from "dayjs";

export const getCreateModeInitialValues = () => {
  return {
    form_id: 8,
    employee_id: null,
    employee_name: "",
    employee_code: "",
    position_title: "",
    evaluation_date: null,
    evaluator_id: null,
    evaluator_name: "",
    performance_rating: "",
    comments: "",
    recommendation: "",
    probation_start_date: null,
    probation_end_date: null,
    extension_end_date: null,
    recommendation_remarks: "",
    objectives: [],
  };
};

export const getViewEditModeFormData = (selectedEntry) => {
  const submittable =
    selectedEntry?.submittable || selectedEntry?.result?.submittable;

  if (!submittable) return getCreateModeInitialValues();

  const employee = submittable.employee || {};
  const position = employee.position?.position || {};
  const objectives = submittable.objectives || [];

  return {
    form_id: selectedEntry?.form?.id || selectedEntry?.result?.form?.id || 8,
    employee_id: employee.id || null,
    employee_name: employee.full_name || "",
    employee_code: employee.code || employee.employee_code || "",
    position_title: position.title?.name || "",
    evaluation_date: submittable.probation_start_date
      ? dayjs(submittable.probation_start_date)
      : null,
    evaluator_id: submittable.evaluator_id || null,
    evaluator_name: submittable.evaluator?.full_name || "",
    performance_rating: submittable.performance_rating || "",
    comments: submittable.comments || "",
    recommendation: submittable.final_recommendation || "",
    probation_start_date: submittable.probation_start_date
      ? dayjs(submittable.probation_start_date)
      : null,
    probation_end_date: submittable.probation_end_date
      ? dayjs(submittable.probation_end_date)
      : null,
    extension_end_date: submittable.extension_end_date
      ? dayjs(submittable.extension_end_date)
      : null,
    recommendation_remarks: submittable.recommendation_remarks || "",
    objectives: objectives.map((obj) => ({
      id: obj.id || null,
      source_kpi_id: obj.source_kpi_id || null,
      objective_id: obj.objective_id || null,
      objective_name: obj.objective_name || "",
      distribution_percentage: obj.distribution_percentage || 0,
      deliverable: obj.deliverable || "",
      target_percentage: obj.target_percentage || 0,
      actual_performance: obj.actual_performance || null,
      rating: obj.rating || null,
      remarks: obj.remarks || "",
    })),
  };
};
