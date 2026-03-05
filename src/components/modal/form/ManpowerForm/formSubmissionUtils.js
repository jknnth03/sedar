import dayjs from "dayjs";

export const shouldEnableEditButton = (selectedEntry) => {
  if (!selectedEntry) return false;

  const entry = selectedEntry?.result || selectedEntry;
  const status = entry?.status?.toUpperCase() || "";

  if (
    status === "RECEIVED" ||
    status === "CANCELLED" ||
    status === "FOR RECEIVING"
  ) {
    return false;
  }

  return true;
};

export const shouldEnableResubmitButton = (selectedEntry) => {
  if (!selectedEntry || !selectedEntry.actions) return false;
  const status = selectedEntry.status?.toUpperCase() || "";
  if (status === "APPROVED" || status === "CANCELLED" || status === "RECEIVED")
    return false;
  return selectedEntry.actions.can_resubmit === true;
};

export const shouldShowResubmitButton = (selectedEntry) => {
  if (!selectedEntry) return false;
  const status = selectedEntry.status?.toUpperCase() || "";
  return status === "AWAITING RESUBMISSION";
};

export const isAdditionalManpower = (requisitionType) => {
  if (!requisitionType) return false;
  return requisitionType.name === "ADDITIONAL MANPOWER";
};

export const isReplacementDueToEmployeeMovement = (requisitionType) => {
  if (!requisitionType) return false;
  return requisitionType.name === "REPLACEMENT DUE TO EMPLOYEE MOVEMENT";
};

export const formatDateForPayload = (date) => {
  if (!date) return null;
  if (dayjs.isDayjs(date)) return date.format("YYYY-MM-DD");
  if (date instanceof Date) return dayjs(date).format("YYYY-MM-DD");
  if (typeof date === "string") return dayjs(date).format("YYYY-MM-DD");
  return null;
};

export const buildCreatePayload = (
  data,
  currentMode,
  attachments,
  requisitionType,
) => {
  const isAdditional = isAdditionalManpower(requisitionType);
  const isReplacement = isReplacementDueToEmployeeMovement(requisitionType);

  const formData = new FormData();

  formData.append("mode", currentMode);
  formData.append("form_id", "1");

  if (data.position_id?.id)
    formData.append("position_id", data.position_id.id.toString());
  if (data.job_level_id?.id)
    formData.append("job_level_id", data.job_level_id.id.toString());
  if (data.employment_type?.trim())
    formData.append("employment_type", data.employment_type);
  if (data.expected_salary)
    formData.append("expected_salary", data.expected_salary.toString());
  if (data.requisition_type_id?.id)
    formData.append(
      "requisition_type_id",
      data.requisition_type_id.id.toString(),
    );
  if (data.justification?.trim())
    formData.append("justification", data.justification);
  if (data.remarks?.trim()) formData.append("remarks", data.remarks);

  if (Array.isArray(attachments)) {
    attachments.forEach((attachment) => {
      if (attachment?.file_attachment instanceof File) {
        formData.append(
          "manpower_form_attachments[]",
          attachment.file_attachment,
        );
      }
    });
  }

  if (data.employee_to_be_replaced_id?.id && !isAdditional && !isReplacement) {
    formData.append(
      "employee_to_be_replaced_id",
      data.employee_to_be_replaced_id.id.toString(),
    );
  }

  if (isReplacement) {
    if (data.movement_employee_id?.id)
      formData.append("employee_id", data.movement_employee_id.id.toString());
    if (data.movement_new_position_id?.id)
      formData.append(
        "new_position_id",
        data.movement_new_position_id.id.toString(),
      );
    if (data.movement_reason_for_change?.trim())
      formData.append("reason_for_change", data.movement_reason_for_change);

    formData.append(
      "is_developmental_assignment",
      data.movement_is_da ? "1" : "0",
    );

    if (data.movement_is_da) {
      const formattedStartDate = formatDateForPayload(
        data.movement_da_start_date,
      );
      if (formattedStartDate)
        formData.append("movement_da_start_date", formattedStartDate);

      const formattedEndDate = formatDateForPayload(data.movement_da_end_date);
      if (formattedEndDate)
        formData.append("movement_da_end_date", formattedEndDate);
    }
  }

  return formData;
};

export const buildEditPayload = (
  data,
  selectedEntry,
  attachments,
  requisitionType,
) => {
  const isAdditional = isAdditionalManpower(requisitionType);
  const isReplacement = isReplacementDueToEmployeeMovement(requisitionType);

  const formData = new FormData();

  formData.append("_method", "PATCH");

  if (data.position_id?.id)
    formData.append("position_id", data.position_id.id.toString());
  if (data.job_level_id?.id)
    formData.append("job_level_id", data.job_level_id.id.toString());
  if (data.employment_type?.trim())
    formData.append("employment_type", data.employment_type);
  if (data.expected_salary)
    formData.append("expected_salary", data.expected_salary.toString());
  if (data.requisition_type_id?.id)
    formData.append(
      "requisition_type_id",
      data.requisition_type_id.id.toString(),
    );
  if (data.justification?.trim())
    formData.append("justification", data.justification);
  if (data.remarks?.trim()) formData.append("remarks", data.remarks);

  if (data.employee_to_be_replaced_id?.id && !isAdditional && !isReplacement) {
    formData.append(
      "employee_to_be_replaced_id",
      data.employee_to_be_replaced_id.id.toString(),
    );
  }

  if (isReplacement) {
    if (data.movement_employee_id?.id)
      formData.append(
        "employee_movement[employee_id]",
        data.movement_employee_id.id.toString(),
      );
    if (data.movement_new_position_id?.id)
      formData.append(
        "employee_movement[new_position_id]",
        data.movement_new_position_id.id.toString(),
      );
    if (data.movement_reason_for_change?.trim())
      formData.append(
        "employee_movement[reason_for_change]",
        data.movement_reason_for_change,
      );

    formData.append(
      "employee_movement[is_developmental_assignment]",
      data.movement_is_da ? "1" : "0",
    );

    if (data.movement_is_da) {
      const formattedStartDate = formatDateForPayload(
        data.movement_da_start_date,
      );
      if (formattedStartDate)
        formData.append("employee_movement[da_start_date]", formattedStartDate);

      const formattedEndDate = formatDateForPayload(data.movement_da_end_date);
      if (formattedEndDate)
        formData.append("employee_movement[da_end_date]", formattedEndDate);
    }
  }

  if (Array.isArray(attachments)) {
    attachments.forEach((attachment) => {
      if (attachment?.file_attachment instanceof File) {
        formData.append(
          "manpower_form_attachments[]",
          attachment.file_attachment,
        );
      } else if (
        attachment?.existing_file_id &&
        attachment?.keep_existing !== false
      ) {
        formData.append(
          "existing_attachments[]",
          attachment.existing_file_id.toString(),
        );
      }
    });
  }

  return formData;
};

export const buildResubmitPayload = (data, requisitionType) => {
  const isAdditional = isAdditionalManpower(requisitionType);
  const isReplacement = isReplacementDueToEmployeeMovement(requisitionType);

  const resubmitData = {};

  if (data.position_id?.id) resubmitData.position_id = data.position_id.id;
  if (data.job_level_id?.id) resubmitData.job_level_id = data.job_level_id.id;
  if (data.employment_type?.trim())
    resubmitData.employment_type = data.employment_type;
  if (data.expected_salary) resubmitData.expected_salary = data.expected_salary;
  if (data.requisition_type_id?.id)
    resubmitData.requisition_type_id = data.requisition_type_id.id;
  if (data.justification?.trim())
    resubmitData.justification = data.justification;
  if (data.remarks?.trim()) resubmitData.remarks = data.remarks;

  if (data.employee_to_be_replaced_id?.id && !isAdditional && !isReplacement) {
    resubmitData.employee_to_be_replaced_id =
      data.employee_to_be_replaced_id.id;
  }

  if (isReplacement) {
    if (data.movement_employee_id?.id)
      resubmitData.employee_id = data.movement_employee_id.id;
    if (data.movement_new_position_id?.id)
      resubmitData.new_position_id = data.movement_new_position_id.id;
    if (data.movement_reason_for_change?.trim())
      resubmitData.reason_for_change = data.movement_reason_for_change;

    resubmitData.is_developmental_assignment = data.movement_is_da || false;

    if (data.movement_is_da) {
      const formattedStartDate = formatDateForPayload(
        data.movement_da_start_date,
      );
      if (formattedStartDate) resubmitData.da_start_date = formattedStartDate;

      const formattedEndDate = formatDateForPayload(data.movement_da_end_date);
      if (formattedEndDate) resubmitData.da_end_date = formattedEndDate;
    }
  }

  return resubmitData;
};

export const safeRenderText = (text) => {
  if (typeof text === "string") return text;
  if (typeof text === "number") return text.toString();
  if (text && typeof text === "object") return "";
  return text || "";
};
