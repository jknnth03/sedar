import dayjs from "dayjs";

export const getCreateModeInitialValues = () => {
  return {
    employee_id: null,
    employee_name: "",
    employee_code: "",
    position_title: "",
    evaluation_period_start_date: null,
    evaluation_period_end_date: null,
    kpis: [],
    strengths_discussion: "",
    development_discussion: "",
    learning_needs_discussion: "",
    competency_assessment: {
      template_id: null,
      answers: [],
    },
    demerits: [],
  };
};

export const getViewEditModeFormData = (selectedEntry) => {
  const entry = selectedEntry?.result || selectedEntry;
  const submittable = entry?.submittable || entry;

  if (!submittable) {
    console.warn("No submittable data found in selectedEntry");
    return getCreateModeInitialValues();
  }

  const employee = submittable.employee || {};

  const employeeCode =
    employee.code || employee.employee_code || employee.id_number || "";
  const employeeName = employee.full_name || employee.employee_name || "";
  const positionTitle =
    employee.position?.position?.title?.name ||
    employee.position_title ||
    employee.current_position?.title ||
    employee.position?.title?.name ||
    "";

  const startDate = submittable.evaluation_period_start_date
    ? dayjs(submittable.evaluation_period_start_date)
    : null;
  const endDate = submittable.evaluation_period_end_date
    ? dayjs(submittable.evaluation_period_end_date)
    : null;

  const kpis = Array.isArray(submittable.objectives)
    ? submittable.objectives.map((kpi) => ({
        source_kpi_id: kpi.source_kpi_id || kpi.id || null,
        objective_id: kpi.objective_id || null,
        objective_name: kpi.objective_name || kpi.objective?.name || "",
        deliverable: kpi.deliverable || "",
        distribution_percentage: kpi.distribution_percentage || 0,
        target_percentage: kpi.target_percentage || 0,
        actual_performance: kpi.actual_performance || "",
        remarks: kpi.remarks || "",
      }))
    : [];

  let competencyAssessment = {
    template_id: null,
    answers: [],
  };

  if (submittable.competency_assessment) {
    const compAssessment = submittable.competency_assessment;

    const templateId =
      compAssessment.assessment_template_id ||
      compAssessment.template_id ||
      compAssessment.template?.id ||
      null;

    let answers = [];

    if (compAssessment.sections && Array.isArray(compAssessment.sections)) {
      compAssessment.sections.forEach((section) => {
        if (section.items && Array.isArray(section.items)) {
          section.items.forEach((item) => {
            if (item.children && Array.isArray(item.children)) {
              item.children.forEach((child) => {
                if (child.is_ratable) {
                  const savedAnswer = child.saved_answer;
                  answers.push({
                    saved_answer_id: savedAnswer?.id || null,
                    template_item_id: child.source_template_item_id || child.id,
                    pa_item_id: child.id,
                    template_item_name: child.text || "",
                    rating_scale_id: savedAnswer?.rating_scale_id || null,
                    rating_scale_name: savedAnswer?.rating_scale?.label || null,
                  });
                }
              });
            }
          });
        }
      });
    } else if (
      compAssessment.answers &&
      Array.isArray(compAssessment.answers)
    ) {
      answers = compAssessment.answers.map((answer) => ({
        saved_answer_id: answer.saved_answer_id || answer.id || null,
        template_item_id:
          answer.template_item_id || answer.source_template_item_id || null,
        pa_item_id: answer.pa_item_id || answer.id || null,
        template_item_name: answer.template_item_name || answer.text || "",
        rating_scale_id: answer.rating_scale_id || null,
        rating_scale_name:
          answer.rating_scale_name || answer.rating_scale?.label || null,
      }));
    }

    competencyAssessment = {
      template_id: templateId,
      answers: answers,
      assessment_template_id: compAssessment.assessment_template_id || null,
      template: compAssessment.template || null,
      sections: compAssessment.sections || null,
    };
  }

  const demerits = Array.isArray(submittable.demerits)
    ? submittable.demerits
    : [];

  return {
    employee_id: submittable.employee_id || employee.id || null,
    employee_name: employeeName,
    employee_code: employeeCode,
    position_title: positionTitle,
    evaluation_period_start_date: startDate,
    evaluation_period_end_date: endDate,
    kpis: kpis,
    strengths_discussion: submittable.strengths_discussion || "",
    development_discussion: submittable.development_discussion || "",
    learning_needs_discussion: submittable.learning_needs_discussion || "",
    competency_assessment: competencyAssessment,
    demerits: demerits,
  };
};

export const formatFormDataForSubmission = (formData) => {
  const formatDate = (date) => {
    if (!date) return null;
    if (dayjs.isDayjs(date)) {
      return date.format("YYYY-MM-DD");
    }
    return dayjs(date).format("YYYY-MM-DD");
  };

  const formattedKpis = Array.isArray(formData.kpis)
    ? formData.kpis.map((kpi) => ({
        source_kpi_id: kpi.source_kpi_id || null,
        objective_id: kpi.objective_id || null,
        objective_name: kpi.objective_name || "",
        deliverable: kpi.deliverable || "",
        distribution_percentage: kpi.distribution_percentage || 0,
        target_percentage: kpi.target_percentage || 0,
        actual_performance: kpi.actual_performance || "",
        remarks: kpi.remarks || "",
      }))
    : [];

  const formattedCompetencyAnswers = Array.isArray(
    formData.competency_assessment?.answers,
  )
    ? formData.competency_assessment.answers.map((answer) => ({
        template_item_id: answer.template_item_id || null,
        rating_scale_id: answer.rating_scale_id || null,
      }))
    : [];

  const payload = {
    employee_id: formData.employee_id,
    evaluation_period_start_date: formatDate(
      formData.evaluation_period_start_date,
    ),
    evaluation_period_end_date: formatDate(formData.evaluation_period_end_date),
    kpis: formattedKpis,
    strengths_discussion: formData.strengths_discussion || "",
    development_discussion: formData.development_discussion || "",
    learning_needs_discussion: formData.learning_needs_discussion || "",
    competency_assessment: {
      template_id: formData.competency_assessment?.template_id || null,
      answers: formattedCompetencyAnswers,
    },
  };

  return payload;
};

export const safeGet = (obj, path, defaultValue = null) => {
  try {
    return (
      path.split(".").reduce((acc, part) => acc && acc[part], obj) ??
      defaultValue
    );
  } catch {
    return defaultValue;
  }
};

export const validateFormData = (formData) => {
  const errors = [];

  if (!formData.employee_id) {
    errors.push("Employee is required");
  }

  if (!formData.evaluation_period_start_date) {
    errors.push("Evaluation start date is required");
  }

  if (!formData.evaluation_period_end_date) {
    errors.push("Evaluation end date is required");
  }

  if (!Array.isArray(formData.kpis) || formData.kpis.length === 0) {
    errors.push("At least one KPI is required");
  }

  if (!formData.strengths_discussion?.trim()) {
    errors.push("Strengths discussion is required");
  }

  if (!formData.development_discussion?.trim()) {
    errors.push("Development discussion is required");
  }

  if (!formData.learning_needs_discussion?.trim()) {
    errors.push("Learning needs discussion is required");
  }

  if (
    !formData.competency_assessment?.template_id ||
    !Array.isArray(formData.competency_assessment?.answers) ||
    formData.competency_assessment.answers.length === 0
  ) {
    errors.push("Competency assessment is required");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const hasUnsavedChanges = (currentData, originalData) => {
  return JSON.stringify(currentData) !== JSON.stringify(originalData);
};

export const resetFormSection = (section) => {
  const resetValues = {
    employee: {
      employee_id: null,
      employee_name: "",
      employee_code: "",
      position_title: "",
    },
    dates: {
      evaluation_period_start_date: null,
      evaluation_period_end_date: null,
    },
    kpis: {
      kpis: [],
    },
    discussions: {
      strengths_discussion: "",
      development_discussion: "",
      learning_needs_discussion: "",
    },
    competency: {
      competency_assessment: {
        template_id: null,
        answers: [],
      },
    },
    demerits: {
      demerits: [],
    },
  };

  return resetValues[section] || {};
};
