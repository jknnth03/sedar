import * as yup from "yup";

export const pdpValidationSchema = yup.object().shape({
  development_plan_objective: yup
    .string()
    .required("Development plan objective is required")
    .min(10, "Must be at least 10 characters"),

  goals: yup
    .array()
    .of(
      yup.object().shape({
        description: yup.string().required("Goal description is required"),
        target_date: yup.date().nullable().required("Target date is required"),
      })
    )
    .min(1, "At least one goal is required"),

  actions: yup.array().of(
    yup.object().shape({
      activity: yup.string().required("Activity is required"),
      due_date: yup.date().nullable().required("Due date is required"),
      date_accomplished: yup.date().nullable(),
      pdp_goal_id: yup.string().required("Linked goal is required"),
      expected_progress: yup.string().required("Expected progress is required"),
    })
  ),

  resources: yup.array().of(
    yup.object().shape({
      resource_item: yup.string().required("Resource item is required"),
      description: yup.string().required("Description is required"),
      person_in_charge: yup.string().required("Person in charge is required"),
      due_date: yup.date().nullable().required("Due date is required"),
      pdp_goal_id: yup.string().required("Linked goal is required"),
    })
  ),

  coaching_sessions: yup.array().of(
    yup.object().shape({
      month_label: yup.string().required("Month label is required"),
      session_date: yup.date().nullable().required("Session date is required"),
      commitment: yup.string().required("Commitment is required"),
    })
  ),
});

export const getFieldError = (errors, fieldName) => {
  const keys = fieldName.split(".");
  let error = errors;

  for (const key of keys) {
    if (!error) return null;
    error = error[key];
  }

  return error?.message || null;
};
