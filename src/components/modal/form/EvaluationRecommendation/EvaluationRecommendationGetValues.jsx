import dayjs from "dayjs";

export const CDP_ROW_COUNT = 7;

const getEmptyCdpRow = () => ({
  competency: "",
  action_plan_types: [],
  action_plan_other: null,
  target_date: null,
  person_responsible: "",
  date_of_completion: null,
});

export const getCDPInitialValues = () => {
  return Array.from({ length: CDP_ROW_COUNT }, () => getEmptyCdpRow());
};

export const getCDPFromEntry = (selectedEntry) => {
  const submittable =
    selectedEntry?.submittable || selectedEntry?.result?.submittable;
  const cdpItems = submittable?.cdp_items || [];

  const rows = cdpItems.map((item) => ({
    competency: item.competency || "",
    action_plan_types: item.action_plan_types || [],
    action_plan_other: item.action_plan_other || null,
    target_date: item.target_date ? dayjs(item.target_date) : null,
    person_responsible: item.person_responsible || "",
    date_of_completion: item.date_of_completion
      ? dayjs(item.date_of_completion)
      : null,
  }));

  while (rows.length < CDP_ROW_COUNT) {
    rows.push(getEmptyCdpRow());
  }

  return rows;
};

export const isCompetencyAssessmentEvaluation = (selectedEntry) => {
  const submittable =
    selectedEntry?.submittable || selectedEntry?.result?.submittable;

  return submittable?.evaluation_number === 3;
};

export const getCompetencyAssessmentTemplate = (selectedEntry) => {
  if (!isCompetencyAssessmentEvaluation(selectedEntry)) return null;

  const submittable =
    selectedEntry?.submittable || selectedEntry?.result?.submittable;

  return submittable?.competency_assessment?.template || null;
};

export const getCompetencyAssessmentTemplateId = (selectedEntry) => {
  if (!isCompetencyAssessmentEvaluation(selectedEntry)) return null;

  const submittable =
    selectedEntry?.submittable || selectedEntry?.result?.submittable;

  return submittable?.competency_assessment?.assessment_template_id || null;
};

export const getCompetencyAssessmentInitialValues = (selectedEntry) => {
  const template = getCompetencyAssessmentTemplate(selectedEntry);
  if (!template) return {};

  const values = {};

  const collectItems = (items) => {
    items?.forEach((item) => {
      if (item.is_rateable) {
        values[item.id] = {
          rating_id: item.rating_id || null,
          comments: item.comments || "",
        };
      }
      if (item.children?.length) {
        collectItems(item.children);
      }
    });
  };

  template.sections?.forEach((section) => collectItems(section.items));

  return values;
};

export const buildCompetencyAssessmentPayload = (competencyAssessmentItems) => {
  const answers = Object.entries(competencyAssessmentItems || {})
    .filter(([, value]) => value?.rating_id)
    .map(([itemId, value]) => ({
      template_item_id: Number(itemId),
      rating_scale_id: value.rating_id,
      comments:
        value.comments && value.comments.trim() !== "" ? value.comments : null,
    }));

  return answers;
};

export const buildCdpItemsPayload = (cdpItems) => {
  return (cdpItems || [])
    .filter((item) => item.competency && item.competency.trim() !== "")
    .map((item) => ({
      competency: item.competency,
      action_plan_types: item.action_plan_types || [],
      action_plan_other: item.action_plan_other || null,
      target_date: item.target_date
        ? dayjs(item.target_date).format("YYYY-MM-DD")
        : null,
      person_responsible: item.person_responsible || "",
    }));
};

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
  recommendation_remarks: "",
  cdp_items: getCDPInitialValues(),
  competency_assessment_items: {},
});

export const getViewEditModeFormData = (selectedEntry) => {
  const submittable =
    selectedEntry?.submittable || selectedEntry?.result?.submittable;

  if (!submittable) return getCreateModeInitialValues();

  const employee = submittable.employee || {};
  const position = submittable.position || {};
  const objectives = submittable.objectives || [];
  const finalRecommendation = submittable.final_recommendation;

  const positionTitle =
    employee.position?.position?.title?.name ||
    position.title?.name ||
    position.position?.title?.name ||
    employee.position_title ||
    "";

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
    recommendation_remarks: submittable.recommendation_remarks || "",
    cdp_items: getCDPFromEntry(selectedEntry),
    competency_assessment_items:
      getCompetencyAssessmentInitialValues(selectedEntry),
  };
};

export const formatFormDataForSubmission = (formData, selectedEntry) => {
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

  baseData.recommendation_remarks = formData.recommendation_remarks || "";

  if (formData.cdp_items?.length) {
    baseData.cdp_items = buildCdpItemsPayload(formData.cdp_items);
  }

  if (isCompetencyAssessmentEvaluation(selectedEntry)) {
    baseData.competency_assessment = {
      template_id: getCompetencyAssessmentTemplateId(selectedEntry),
      answers: buildCompetencyAssessmentPayload(
        formData.competency_assessment_items,
      ),
    };
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
          }: Distribution percentage must be between 0 and 100`,
        );
      }
      if (obj.target_percentage < 0 || obj.target_percentage > 100) {
        errors.push(
          `Objective #${index + 1}: Target percentage must be between 0 and 100`,
        );
      }
      if (
        obj.actual_performance !== null &&
        (obj.actual_performance < 0 || obj.actual_performance > 100)
      ) {
        errors.push(
          `Objective #${
            index + 1
          }: Actual performance must be between 0 and 100`,
        );
      }
    });

    const totalDistribution = formData.objectives.reduce(
      (sum, obj) => sum + Number(obj.distribution_percentage || 0),
      0,
    );

    if (totalDistribution !== 100) {
      errors.push(
        `Total distribution percentage must equal 100% (current: ${totalDistribution}%)`,
      );
    }
  }

  if (
    !formData.for_permanent_appointment &&
    !formData.not_for_permanent_appointment &&
    !formData.for_extension
  ) {
    errors.push("Please select a recommendation option");
  }

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
