import dayjs from "dayjs";

export const getCreateModeInitialValues = () => ({
  form_id: 8,
  employee_id: null,
  employee_name: "",
  position_title: "",
  evaluation_date: null,
  evaluator_id: null,
  evaluator_name: "",
  performance_rating: "",
  comments: "",
  recommendation: "",
  objectives: [],
});

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

export const formatFormDataForSubmission = (formData) => {
  const baseData = {
    form_id: formData.form_id || 8,
    employee_id: formData.employee_id,
    evaluation_date: formData.evaluation_date
      ? dayjs(formData.evaluation_date).format("YYYY-MM-DD")
      : null,
    evaluator_id: formData.evaluator_id,
    performance_rating: formData.performance_rating,
    comments: formData.comments || "",
    recommendation: formData.recommendation,
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
      rating: obj.rating ? Number(obj.rating) : null,
      remarks: obj.remarks || "",
    }));
  }

  return baseData;
};

export const validateEvaluationFormData = (formData) => {
  const errors = [];

  if (!formData.employee_id) errors.push("Employee is required");
  if (!formData.evaluation_date) errors.push("Evaluation date is required");
  if (!formData.evaluator_id) errors.push("Evaluator is required");
  if (!formData.performance_rating)
    errors.push("Performance rating is required");
  if (!formData.recommendation) errors.push("Recommendation is required");

  if (!formData.objectives?.length) {
    errors.push("At least one performance objective is required");
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
      if (
        obj.actual_performance !== null &&
        (obj.actual_performance < 0 || obj.actual_performance > 100)
      ) {
        errors.push(
          `Objective #${
            index + 1
          }: Actual performance must be between 0 and 100`
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

export const calculateProbationDuration = (startDate, endDate) => {
  if (!startDate || !endDate) return 0;
  return dayjs(endDate).diff(dayjs(startDate), "month", true).toFixed(1);
};

export const getEvaluationStatusColor = (status) => {
  const colors = {
    PENDING: "warning",
    PENDING_APPROVAL: "info",
    APPROVED: "success",
    REJECTED: "error",
    CANCELLED: "default",
    COMPLETED: "success",
    IN_PROGRESS: "primary",
  };
  return colors[status] || "default";
};

export const getPerformanceRatingColor = (rating) => {
  const colors = {
    OUTSTANDING: "success",
    VERY_SATISFACTORY: "success",
    SATISFACTORY: "info",
    NEEDS_IMPROVEMENT: "warning",
    UNSATISFACTORY: "error",
  };
  return colors[rating] || "default";
};

export const getRecommendationColor = (recommendation) => {
  const colors = {
    REGULARIZATION: "success",
    EXTENSION: "warning",
    TERMINATION: "error",
  };
  return colors[recommendation] || "default";
};

export const calculateOverallPerformance = (objectives) => {
  if (!objectives?.length) return 0;

  const totalWeightedScore = objectives.reduce((sum, obj) => {
    const actualPerformance = Number(obj.actual_performance) || 0;
    const weight = Number(obj.distribution_percentage) || 0;
    return sum + (actualPerformance * weight) / 100;
  }, 0);

  return totalWeightedScore.toFixed(2);
};
