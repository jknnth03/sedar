import dayjs from "dayjs";

export const getCreateModeInitialValues = () => {
  return {
    employee_id: null,
    employee_name: "",
    employee_code: "",
    employee_position_history_id: null,
    kpi_position_id: null,
    kpi_attachment_url: null,
    kpi_attachment_filename: null,
    position_title: "",
    year: null,
    start_date: "",
    end_date: "",
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
    return getCreateModeInitialValues();
  }

  const employee = submittable.employee || {};

  const employeeCode =
    employee.id_number || employee.code || employee.employee_code || "";
  const employeeName =
    employee.name || employee.full_name || employee.employee_name || "";
  const positionTitle =
    typeof employee.position === "string"
      ? employee.position
      : employee.position?.title?.name || employee.position_title || "";

  const year = submittable.evaluation_year
    ? dayjs(`${submittable.evaluation_year}`, "YYYY")
    : null;

  // Extract position_id from kpis_attachment download_url
  // URL pattern: /api/positions/{id}/kpi-attachment
  const kpiAttachmentUrl = submittable.kpis_attachment?.download_url || null;
  const kpiAttachmentFilename = submittable.kpis_attachment?.filename || null;
  const kpiPositionIdMatch = kpiAttachmentUrl?.match(
    /\/positions\/(\d+)\/kpi-attachment/,
  );
  const kpiPositionId = kpiPositionIdMatch
    ? parseInt(kpiPositionIdMatch[1])
    : null;

  const kpis = Array.isArray(submittable.kpis)
    ? submittable.kpis.map((kpi) => ({
        source_kpi_id: kpi.source_kpi_id || kpi.id || null,
        objective_id: kpi.objective_id || null,
        objective_name: kpi.objective_name || "",
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
      compAssessment.template_id ||
      compAssessment.assessment_template_id ||
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
      template: {
        ...(compAssessment.template || {}),
        rating_scale:
          compAssessment.rating_scale ||
          compAssessment.template?.rating_scale ||
          [],
      },
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
    employee_position_history_id:
      submittable.history_id ||
      submittable.position_history_id ||
      submittable.employee_position_history_id ||
      null,
    kpi_position_id: kpiPositionId,
    kpi_attachment_url: kpiAttachmentUrl,
    kpi_attachment_filename: kpiAttachmentFilename,
    position_title: positionTitle,
    year: year,
    start_date: submittable.period_start || submittable.start_date || "",
    end_date: submittable.period_end || submittable.end_date || "",
    kpis: kpis,
    strengths_discussion:
      submittable.discussions?.strengths ||
      submittable.discussions?.strengths_areas ||
      submittable.strengths_discussion ||
      "",
    development_discussion:
      submittable.discussions?.development_areas ||
      submittable.discussions?.development_needs ||
      submittable.development_discussion ||
      "",
    learning_needs_discussion:
      submittable.discussions?.learning_needs ||
      submittable.learning_needs_discussion ||
      "",
    competency_assessment: competencyAssessment,
    demerits: demerits,
  };
};

export const formatFormDataForSubmission = (formData) => {
  const yearValue = formData.year
    ? dayjs.isDayjs(formData.year)
      ? formData.year.year()
      : Number(formData.year)
    : null;

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
    evaluation_year: yearValue,
    employee_position_history_id: formData.employee_position_history_id || null,
    kpis: formattedKpis,
    discussions: {
      strengths: formData.strengths_discussion || "",
      development_areas: formData.development_discussion || "",
      learning_needs: formData.learning_needs_discussion || "",
    },
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

  if (!formData.year) {
    errors.push("Year is required");
  }

  if (!formData.employee_position_history_id) {
    errors.push("Position is required");
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
      employee_position_history_id: null,
      kpi_position_id: null,
      kpi_attachment_url: null,
      kpi_attachment_filename: null,
      position_title: "",
      year: null,
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
