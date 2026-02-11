export const validateStatusForm = (formData) => {
  const errors = {};

  if (!formData.separation_type) {
    errors.separation_type = "Separation Type is required";
  }

  if (!formData.separation_reason) {
    errors.separation_reason = "Separation Reason is required";
  }

  if (!formData.employee_status_effectivity_date) {
    errors.employee_status_effectivity_date = "Effectivity Date is required";
  }

  const isValid = Object.keys(errors).length === 0;

  return { errors, isValid };
};
