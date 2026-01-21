import dayjs from "dayjs";

export const getCreateModeInitialValues = () => ({
  form_id: 8,
  employee_id: null,
  employee_name: "",
  employee_code: "",
  position_title: "",
  probation_start_date: null,
  probation_end_date: null,
  objectives: [],
  for_permanent_appointment: false,
  not_for_permanent_appointment: false,
  for_extension: false,
  extension_end_date: null,
});

export const getViewEditModeFormData = (selectedEntry) => {
  const submittable =
    selectedEntry?.submittable || selectedEntry?.result?.submittable;

  if (!submittable) return getCreateModeInitialValues();

  const employee = submittable.employee || {};
  const position = submittable.position || {};
  const objectives = submittable.objectives || [];
  const finalRecommendation = submittable.final_recommendation;

  // Extract position title from the nested structure
  const positionTitle =
    employee.position?.position?.title?.name ||
    position.title?.name ||
    position.position?.title?.name ||
    employee.position_title ||
    "";

  // Extract employee code
  const employeeCode =
    employee.code || employee.employee_code || submittable.employee_code || "";

  return {
    form_id: selectedEntry?.form?.id || selectedEntry?.result?.form?.id || 8,
    employee_id: employee.id || submittable.employee_id || null,
    employee_name: employee.full_name || employee.employee_name || "",
    employee_code: employeeCode,
    position_title: positionTitle,
    probation_start_date: submittable.probation_start_date
      ? dayjs(submittable.probation_start_date)
      : null,
    probation_end_date: submittable.probation_end_date
      ? dayjs(submittable.probation_end_date)
      : null,
    objectives: objectives.map((obj) => ({
      id: obj.id || null,
      source_kpi_id: obj.source_kpi_id || null,
      objective_id: obj.objective_id || null,
      objective_name: obj.objective_name || "",
      distribution_percentage: obj.distribution_percentage || 0,
      deliverable: obj.deliverable || "",
      target_percentage: obj.target_percentage || 0,
      actual_performance: obj.actual_performance || null,
      remarks: obj.remarks || "",
    })),
    for_permanent_appointment: finalRecommendation === "FOR PERMANENT",
    not_for_permanent_appointment: finalRecommendation === "NOT FOR PERMANENT",
    for_extension: finalRecommendation === "FOR EXTENSION",
    extension_end_date: submittable.extension_end_date
      ? dayjs(submittable.extension_end_date)
      : null,
  };
};

export const formatFormDataForSubmission = (formData) => {
  const baseData = {
    form_id: formData.form_id || 8,
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

  // Add recommendation fields
  if (formData.for_permanent_appointment) {
    baseData.final_recommendation = "FOR PERMANENT";
  } else if (formData.not_for_permanent_appointment) {
    baseData.final_recommendation = "NOT FOR PERMANENT";
  } else if (formData.for_extension) {
    baseData.final_recommendation = "FOR EXTENSION";
    baseData.extension_end_date = formData.extension_end_date
      ? dayjs(formData.extension_end_date).format("YYYY-MM-DD")
      : null;
  }

  return baseData;
};

export const validateEvaluationRecommendationData = (formData) => {
  const errors = [];

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

  // Validate recommendation selection
  if (
    !formData.for_permanent_appointment &&
    !formData.not_for_permanent_appointment &&
    !formData.for_extension
  ) {
    errors.push("Please select a recommendation option");
  }

  // Validate extension date if extension is selected
  if (formData.for_extension && !formData.extension_end_date) {
    errors.push("Extension end date is required when selecting extension");
  }

  return { isValid: errors.length === 0, errors };
};

export const calculateEvaluationDuration = (startDate, endDate) => {
  if (!startDate || !endDate) return 0;
  return dayjs(endDate).diff(dayjs(startDate), "month", true).toFixed(1);
};

export const getEvaluationRecommendationStatusColor = (status) => {
  const colors = {
    "FOR RECOMMENDATION": "warning",
    PENDING_RECOMMENDATION: "warning",
    RECOMMENDATION_APPROVED: "success",
    RECOMMENDATION_REJECTED: "error",
    AWAITING_RECOMMENDATION_RESUBMISSION: "warning",
    CANCELLED: "default",
    COMPLETED: "success",
  };
  return colors[status] || "default";
};
