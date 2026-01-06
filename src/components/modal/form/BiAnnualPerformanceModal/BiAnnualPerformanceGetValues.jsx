import dayjs from "dayjs";

const validateNumericValue = (value) => {
  if (value === "" || value === null || value === undefined) {
    return "";
  }
  const numericRegex = /^[0-9]+(\.[0-9]+)?$/;
  return numericRegex.test(String(value)) ? String(value) : "";
};

export const getCreateModeInitialValues = () => ({
  form_id: 9,
  employee_id: null,
  employee_name: "",
  employee_code: "",
  position_title: "",
  evaluation_period_start_date: null,
  evaluation_period_end_date: null,
  kpis: [],
  demerits: [],
  strengths_discussion: "",
  development_discussion: "",
  learning_needs_discussion: "",
  competency_assessment: {
    template_id: null,
    answers: [],
  },
});

export const getViewEditModeFormData = (selectedEntry) => {
  const submittable =
    selectedEntry?.submittable || selectedEntry?.result?.submittable;

  if (!submittable) return getCreateModeInitialValues();

  const employee = submittable.employee || {};
  const position = submittable.position || {};
  const kpis = submittable.objectives || [];
  const demerits = submittable.demerits || [];
  const competencyAssessment = submittable.competency_assessment || {};

  const positionTitle =
    employee.position?.position?.title?.name ||
    position.title?.name ||
    position.position?.title?.name ||
    employee.position_title ||
    "";

  const employeeCode =
    employee.id_number ||
    employee.code ||
    employee.employee_code ||
    submittable.employee_code ||
    "";

  let competencyAnswers = [];

  console.log("Processing competency assessment:", competencyAssessment);

  if (
    competencyAssessment.sections &&
    Array.isArray(competencyAssessment.sections)
  ) {
    console.log("Found sections:", competencyAssessment.sections.length);
    competencyAssessment.sections.forEach((section) => {
      if (section.items && Array.isArray(section.items)) {
        section.items.forEach((item) => {
          if (item.children && Array.isArray(item.children)) {
            item.children.forEach((child) => {
              if (child.is_ratable) {
                const answerData = {
                  saved_answer_id: child.saved_answer?.id || null,
                  template_item_id: child.source_template_item_id || child.id,
                  pa_item_id: child.id,
                  template_item_name: child.text,
                  rating_scale_id: child.saved_answer?.rating_scale_id || null,
                  rating_scale_name:
                    child.saved_answer?.rating_scale?.label || null,
                };
                console.log(
                  "Creating answer with saved_answer_id:",
                  answerData.saved_answer_id,
                  "template_item_id:",
                  answerData.template_item_id,
                  "from child:",
                  child
                );
                competencyAnswers.push(answerData);
              }
            });
          }
        });
      }
    });
    console.log("Processed competency answers:", competencyAnswers);
  } else if (
    competencyAssessment.answers &&
    Array.isArray(competencyAssessment.answers)
  ) {
    console.log("Loading from answers array:", competencyAssessment.answers);
    competencyAnswers = competencyAssessment.answers.map((answer) => {
      console.log("Processing answer:", answer);
      return {
        saved_answer_id: answer.saved_answer_id || answer.id || null,
        template_item_id: answer.template_item_id || null,
        template_item_name:
          answer.item?.text || answer.template_item_name || "",
        rating_scale_id: answer.rating_scale_id || null,
        rating_scale_name:
          answer.rating_scale?.label || answer.rating_scale_name || "",
      };
    });
    console.log("Processed answers with saved_answer_id:", competencyAnswers);
  }

  return {
    form_id: selectedEntry?.form?.id || selectedEntry?.result?.form?.id || 9,
    employee_id: employee.id || submittable.employee_id || null,
    employee_name: employee.full_name || employee.employee_name || "",
    employee_code: employeeCode,
    position_title: positionTitle,
    evaluation_period_start_date: submittable.evaluation_period_start_date
      ? dayjs(submittable.evaluation_period_start_date)
      : null,
    evaluation_period_end_date: submittable.evaluation_period_end_date
      ? dayjs(submittable.evaluation_period_end_date)
      : null,
    kpis: kpis.map((kpi) => ({
      id: kpi.id || null,
      source_kpi_id: kpi.source_kpi_id || null,
      objective_id: kpi.objective_id || null,
      objective_name: kpi.objective_name || "",
      distribution_percentage: kpi.distribution_percentage || 0,
      deliverable: kpi.deliverable || "",
      target_percentage: kpi.target_percentage || 0,
      actual_performance: validateNumericValue(kpi.actual_performance),
      remarks: kpi.remarks || "",
    })),
    demerits: demerits.map((demerit) => ({
      violation: demerit.violation || "",
      weight: demerit.weight || 0,
      score: demerit.score || 0,
    })),
    strengths_discussion: submittable.strengths_discussion || "",
    development_discussion: submittable.development_discussion || "",
    learning_needs_discussion: submittable.learning_needs_discussion || "",
    competency_assessment: {
      template_id:
        competencyAssessment.assessment_template_id ||
        competencyAssessment.template_id ||
        null,
      assessment_template_id:
        competencyAssessment.assessment_template_id || null,
      template: competencyAssessment.template || null,
      sections: competencyAssessment.sections || null,
      answers: competencyAnswers,
    },
  };
};

export const formatFormDataForSubmission = (formData) => {
  const baseData = {
    evaluation_period_start_date: formData.evaluation_period_start_date
      ? dayjs(formData.evaluation_period_start_date).format("YYYY-MM-DD")
      : null,
    evaluation_period_end_date: formData.evaluation_period_end_date
      ? dayjs(formData.evaluation_period_end_date).format("YYYY-MM-DD")
      : null,
  };

  if (formData.kpis?.length) {
    baseData.kpis = formData.kpis.map((kpi) => ({
      source_kpi_id: kpi.source_kpi_id,
      objective_id: kpi.objective_id,
      objective_name: kpi.objective_name || "",
      distribution_percentage: Number(kpi.distribution_percentage) || 0,
      deliverable: kpi.deliverable || "",
      target_percentage: Number(kpi.target_percentage) || 0,
      actual_performance: validateNumericValue(kpi.actual_performance),
      remarks: kpi.remarks || "",
    }));
  }

  baseData.demerits = [];

  baseData.discussions = {
    strengths_discussion: formData.strengths_discussion || "",
    development_discussion: formData.development_discussion || "",
    learning_needs_discussion: formData.learning_needs_discussion || "",
  };

  if (formData.competency_assessment) {
    baseData.competency_assessment = {
      template_id: formData.competency_assessment.template_id || null,
      answers:
        formData.competency_assessment.answers?.map((answer) => {
          console.log("Processing answer:", answer);
          const payload = {
            template_item_id: answer.template_item_id,
            rating_scale_id: answer.rating_scale_id,
          };

          if (
            answer.saved_answer_id !== null &&
            answer.saved_answer_id !== undefined
          ) {
            console.log("Adding id:", answer.saved_answer_id);
            payload.id = answer.saved_answer_id;
          } else {
            console.log("No saved_answer_id found");
          }

          return payload;
        }) || [],
    };
  }

  console.log("Formatted submission data:", JSON.stringify(baseData, null, 2));
  return baseData;
};

export const validateBiAnnualPerformanceData = (formData) => {
  const errors = [];

  if (!formData.employee_id) {
    errors.push("Employee is required");
  }

  if (!formData.evaluation_period_start_date) {
    errors.push("Evaluation period start date is required");
  }

  if (!formData.evaluation_period_end_date) {
    errors.push("Evaluation period end date is required");
  }

  if (!formData.kpis?.length) {
    errors.push("At least one KPI is required");
  }

  return { isValid: errors.length === 0, errors };
};

export const calculateEvaluationDuration = (startDate, endDate) => {
  if (!startDate || !endDate) return 0;
  return dayjs(endDate).diff(dayjs(startDate), "month", true).toFixed(1);
};

export const getBiAnnualPerformanceStatusColor = (status) => {
  const colors = {
    PENDING: "warning",
    APPROVED: "success",
    REJECTED: "error",
    CANCELLED: "default",
    COMPLETED: "success",
  };
  return colors[status] || "default";
};
