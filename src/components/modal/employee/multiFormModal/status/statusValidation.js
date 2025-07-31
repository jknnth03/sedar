import { getFieldsEnabledForStatus } from "./statusUtils";

export const validateStatusForm = (statusData) => {
  const newErrors = {};
  const fieldsEnabled = getFieldsEnabledForStatus(
    statusData.employee_status_label
  );

  if (!statusData.employee_status_label) {
    newErrors.employee_status_label = "Status is required";
  }

  if (fieldsEnabled.startDate && !statusData.employee_status_start_date) {
    newErrors.employee_status_start_date = "Start date is required";
  }

  if (
    fieldsEnabled.effectivityDate &&
    !statusData.employee_status_effectivity_date
  ) {
    newErrors.employee_status_effectivity_date = "Effectivity date is required";
  }

  if (
    fieldsEnabled.startDate &&
    fieldsEnabled.endDate &&
    statusData.employee_status_start_date &&
    statusData.employee_status_end_date
  ) {
    if (
      statusData.employee_status_end_date.isBefore(
        statusData.employee_status_start_date
      )
    ) {
      newErrors.employee_status_end_date =
        "End date cannot be before start date";
    }
  }

  if (
    fieldsEnabled.startDate &&
    fieldsEnabled.effectivityDate &&
    statusData.employee_status_start_date &&
    statusData.employee_status_effectivity_date
  ) {
    if (
      statusData.employee_status_effectivity_date.isBefore(
        statusData.employee_status_start_date
      )
    ) {
      newErrors.employee_status_effectivity_date =
        "Effectivity date cannot be before start date";
    }
  }

  return {
    errors: newErrors,
    isValid: Object.keys(newErrors).length === 0,
  };
};

export const validateAllEntries = (statusEntries) => {
  let allErrors = {};
  let isValid = true;

  statusEntries.forEach((entry) => {
    const { errors: entryErrors, isValid: entryValid } =
      validateStatusForm(entry);

    if (!entryValid) {
      isValid = false;
      Object.keys(entryErrors).forEach((field) => {
        allErrors[`${entry.id}_${field}`] = entryErrors[field];
      });
    }
  });

  return { errors: allErrors, isValid };
};
