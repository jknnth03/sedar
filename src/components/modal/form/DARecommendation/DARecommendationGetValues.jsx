import dayjs from "dayjs";

export const getCreateModeInitialValues = () => ({
  form_id: 7,
  employee_id: null,
  employee_name: "",
  from_position_id: null,
  from_position_title: "",
  from_department: "",
  to_position_id: null,
  to_position_code: "",
  to_position_title: "",
  to_department: "",
  start_date: null,
  end_date: null,
  kpis: [],
});

export const getViewEditModeFormData = (selectedEntry) => {
  const submittable =
    selectedEntry?.submittable || selectedEntry?.result?.submittable;

  if (!submittable) return getCreateModeInitialValues();

  const employee = submittable.employee || {};
  const fromPosition = submittable.from_position || {};
  const toPosition = submittable.to_position || {};
  const objectives = submittable.objectives || [];

  return {
    form_id: selectedEntry?.form?.id || selectedEntry?.result?.form?.id || 7,
    employee_id: employee.id || null,
    employee_name: employee.full_name || "",
    from_position_id: fromPosition.id || null,
    from_position_title: fromPosition.title?.name || "",
    from_department: fromPosition.charging?.department_name || "",
    to_position_id: toPosition.id || null,
    to_position_code: toPosition.code || "",
    to_position_title: toPosition.title?.name || "",
    to_department: toPosition.charging?.department_name || "",
    start_date: submittable.start_date ? dayjs(submittable.start_date) : null,
    end_date: submittable.end_date ? dayjs(submittable.end_date) : null,
    kpis: objectives.map((obj) => ({
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
  };
};

export const formatFormDataForSubmission = (formData) => {
  const baseData = {
    form_id: formData.form_id || 7,
    employee_id: formData.employee_id,
    from_position_id: formData.from_position_id,
    to_position_id: formData.to_position_id,
    start_date: formData.start_date
      ? dayjs(formData.start_date).format("YYYY-MM-DD")
      : null,
    end_date: formData.end_date
      ? dayjs(formData.end_date).format("YYYY-MM-DD")
      : null,
  };

  if (formData.kpis?.length) {
    baseData.objectives = formData.kpis.map((kpi) => ({
      source_kpi_id: kpi.source_kpi_id,
      objective_id: kpi.objective_id,
      objective_name: kpi.objective_name || "",
      distribution_percentage: Number(kpi.distribution_percentage) || 0,
      deliverable: kpi.deliverable || "",
      target_percentage: Number(kpi.target_percentage) || 0,
      actual_performance: kpi.actual_performance
        ? Number(kpi.actual_performance)
        : null,
      remarks: kpi.remarks || "",
    }));
  }

  return baseData;
};

export const validateDARecommendationData = (formData) => {
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

  if (!formData.kpis?.length) {
    errors.push("At least one KPI is required");
  } else {
    formData.kpis.forEach((kpi, index) => {
      if (!kpi.source_kpi_id)
        errors.push(`KPI #${index + 1}: Source KPI is required`);
      if (!kpi.objective_id)
        errors.push(`KPI #${index + 1}: Objective is required`);
      if (
        kpi.distribution_percentage < 0 ||
        kpi.distribution_percentage > 100
      ) {
        errors.push(
          `KPI #${index + 1}: Distribution percentage must be between 0 and 100`
        );
      }
      if (kpi.target_percentage < 0 || kpi.target_percentage > 100) {
        errors.push(
          `KPI #${index + 1}: Target percentage must be between 0 and 100`
        );
      }
      if (
        kpi.actual_performance !== null &&
        (kpi.actual_performance < 0 || kpi.actual_performance > 100)
      ) {
        errors.push(
          `KPI #${index + 1}: Actual performance must be between 0 and 100`
        );
      }
    });

    const totalDistribution = formData.kpis.reduce(
      (sum, kpi) => sum + Number(kpi.distribution_percentage || 0),
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

export const calculateDADuration = (startDate, endDate) => {
  if (!startDate || !endDate) return 0;
  return dayjs(endDate).diff(dayjs(startDate), "month", true).toFixed(1);
};

export const getDARecommendationStatusColor = (status) => {
  const colors = {
    FOR_RECOMMENDATION: "info",
    PENDING_RECOMMENDATION: "warning",
    RECOMMENDATION_APPROVED: "success",
    RECOMMENDATION_REJECTED: "error",
    AWAITING_RECOMMENDATION_RESUBMISSION: "warning",
    CANCELLED: "default",
    COMPLETED: "success",
  };
  return colors[status] || "default";
};
