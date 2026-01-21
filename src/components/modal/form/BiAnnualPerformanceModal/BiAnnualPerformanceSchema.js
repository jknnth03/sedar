import * as yup from "yup";

export const biAnnualPerformanceSchema = yup.object().shape({
  employee_id: yup.number().nullable().required("Employee is required"),

  employee_name: yup.string().required("Employee name is required"),

  employee_code: yup.string().required("Employee ID number is required"),

  position_title: yup.string().required("Position title is required"),

  evaluation_period_start_date: yup
    .mixed()
    .nullable()
    .required("Evaluation period start date is required"),

  evaluation_period_end_date: yup
    .mixed()
    .nullable()
    .required("Evaluation period end date is required"),

  kpis: yup
    .array()
    .of(
      yup.object().shape({
        source_kpi_id: yup.number().nullable(),
        objective_id: yup.number().nullable(),
        objective_name: yup.string().required("Objective name is required"),
        deliverable: yup.string().required("Deliverable is required"),
        distribution_percentage: yup
          .number()
          .required("Distribution percentage is required"),
        target_percentage: yup
          .number()
          .required("Target percentage is required"),
        actual_performance: yup
          .string()
          .required("Actual performance is required")
          .matches(/^[0-9]+(\.[0-9]+)?$/, "Only numbers are allowed"),
        remarks: yup.string().nullable(),
      })
    )
    .min(1, "At least one KPI is required")
    .required("KPIs are required"),

  demerits: yup.array().nullable(),

  strengths_discussion: yup
    .string()
    .required("Strengths discussion is required"),

  development_discussion: yup
    .string()
    .required("Development discussion is required"),

  learning_needs_discussion: yup
    .string()
    .required("Learning needs discussion is required"),

  competency_assessment: yup
    .object()
    .shape({
      template_id: yup
        .number()
        .nullable()
        .required("Competency template is required"),

      answers: yup
        .array()
        .of(
          yup.object().shape({
            template_item_id: yup
              .number()
              .required("Template item ID is required"),
            template_item_name: yup
              .string()
              .required("Template item name is required"),
            rating_scale_id: yup
              .number()
              .nullable()
              .required("Rating is required"),
            rating_scale_name: yup.string().nullable(),
          })
        )
        .min(1, "At least one competency rating is required")
        .test(
          "all-ratings-filled",
          "All competency items must have a rating",
          function (answers) {
            if (!answers || answers.length === 0) return false;
            return answers.every(
              (answer) =>
                answer.rating_scale_id !== null && answer.rating_scale_id !== ""
            );
          }
        )
        .required("Competency assessment is required"),
    })
    .required("Competency assessment is required"),
});
