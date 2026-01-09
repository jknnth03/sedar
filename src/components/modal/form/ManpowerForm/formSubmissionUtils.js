import dayjs from "dayjs";

export const shouldEnableEditButton = (selectedEntry) => {
  if (!selectedEntry) {
    return false;
  }

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
  if (!selectedEntry || !selectedEntry.actions) {
    return false;
  }
  const status = selectedEntry.status?.toUpperCase() || "";
  if (
    status === "APPROVED" ||
    status === "CANCELLED" ||
    status === "RECEIVED"
  ) {
    return false;
  }
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
  if (dayjs.isDayjs(date)) {
    return date.format("YYYY-MM-DD");
  }
  if (date instanceof Date) {
    return dayjs(date).format("YYYY-MM-DD");
  }
  if (typeof date === "string") {
    return dayjs(date).format("YYYY-MM-DD");
  }
  return null;
};

export const populateFormWithEntry = (entry, setValue) => {
  if (!entry) return;

  const submittable = entry.submittable || entry.data || entry;

  if (submittable.position_id || submittable.position) {
    setValue(
      "position_id",
      submittable.position || { id: submittable.position_id },
      { shouldValidate: false }
    );
  }

  if (submittable.job_level_id || submittable.job_level) {
    setValue(
      "job_level_id",
      submittable.job_level || { id: submittable.job_level_id },
      { shouldValidate: false }
    );
  }

  if (submittable.requisition_type_id || submittable.requisition_type) {
    setValue(
      "requisition_type_id",
      submittable.requisition_type || { id: submittable.requisition_type_id },
      { shouldValidate: false }
    );
  }

  if (
    submittable.employee_to_be_replaced_id ||
    submittable.employee_to_be_replaced
  ) {
    setValue(
      "employee_to_be_replaced_id",
      submittable.employee_to_be_replaced || {
        id: submittable.employee_to_be_replaced_id,
      },
      { shouldValidate: false }
    );
  }

  if (submittable.expected_salary) {
    setValue("expected_salary", submittable.expected_salary, {
      shouldValidate: false,
    });
  }

  if (submittable.employment_type) {
    setValue("employment_type", submittable.employment_type, {
      shouldValidate: false,
    });
  }

  if (submittable.justification) {
    setValue("justification", submittable.justification, {
      shouldValidate: false,
    });
  }

  if (submittable.remarks) {
    setValue("remarks", submittable.remarks, { shouldValidate: false });
  }

  if (submittable.employee_movement_details) {
    const movement = submittable.employee_movement_details;

    if (movement.employee_id || movement.employee) {
      setValue(
        "movement_employee_id",
        movement.employee || { id: movement.employee_id },
        { shouldValidate: false }
      );
    }

    if (movement.new_position_id || movement.new_position) {
      setValue(
        "movement_new_position_id",
        movement.new_position || { id: movement.new_position_id },
        { shouldValidate: false }
      );
    }

    if (movement.reason_for_change) {
      setValue("movement_reason_for_change", movement.reason_for_change, {
        shouldValidate: false,
      });
    }

    if (movement.is_developmental_assignment !== undefined) {
      setValue(
        "movement_is_da",
        Boolean(movement.is_developmental_assignment),
        {
          shouldValidate: false,
        }
      );
    }

    if (movement.da_start_date) {
      setValue("movement_da_start_date", dayjs(movement.da_start_date), {
        shouldValidate: false,
      });
    }

    if (movement.da_end_date) {
      setValue("movement_da_end_date", dayjs(movement.da_end_date), {
        shouldValidate: false,
      });
    }
  }
};

export const buildCreatePayload = (
  data,
  currentMode,
  selectedFile,
  requisitionType
) => {
  const hasFile = selectedFile && selectedFile instanceof File;
  const isAdditional = isAdditionalManpower(requisitionType);
  const isReplacement = isReplacementDueToEmployeeMovement(requisitionType);

  if (hasFile) {
    const formData = new FormData();

    formData.append("mode", currentMode);
    formData.append("form_id", "1");

    if (data.position_id?.id) {
      formData.append("position_id", data.position_id.id.toString());
    }

    if (data.job_level_id?.id) {
      formData.append("job_level_id", data.job_level_id.id.toString());
    }

    if (data.employment_type && data.employment_type.trim() !== "") {
      formData.append("employment_type", data.employment_type);
    }

    if (data.expected_salary) {
      formData.append("expected_salary", data.expected_salary.toString());
    }

    if (data.requisition_type_id?.id) {
      formData.append(
        "requisition_type_id",
        data.requisition_type_id.id.toString()
      );
    }

    if (data.justification && data.justification.trim() !== "") {
      formData.append("justification", data.justification);
    }

    if (data.remarks && data.remarks.trim() !== "") {
      formData.append("remarks", data.remarks);
    }

    formData.append("manpower_form_attachment", selectedFile);

    if (
      data.employee_to_be_replaced_id?.id &&
      !isAdditional &&
      !isReplacement
    ) {
      formData.append(
        "employee_to_be_replaced_id",
        data.employee_to_be_replaced_id.id.toString()
      );
    }

    if (isReplacement) {
      if (data.movement_employee_id?.id) {
        formData.append("employee_id", data.movement_employee_id.id.toString());
      }

      if (data.movement_new_position_id?.id) {
        formData.append(
          "new_position_id",
          data.movement_new_position_id.id.toString()
        );
      }

      if (
        data.movement_reason_for_change &&
        data.movement_reason_for_change.trim() !== ""
      ) {
        formData.append("reason_for_change", data.movement_reason_for_change);
      }

      formData.append(
        "is_developmental_assignment",
        data.movement_is_da ? "1" : "0"
      );

      if (data.movement_is_da) {
        const formattedStartDate = formatDateForPayload(
          data.movement_da_start_date
        );
        if (formattedStartDate) {
          formData.append("movement_da_start_date", formattedStartDate);
        }

        const formattedEndDate = formatDateForPayload(
          data.movement_da_end_date
        );
        if (formattedEndDate) {
          formData.append("movement_da_end_date", formattedEndDate);
        }
      }
    }

    return formData;
  } else {
    const jsonData = {
      mode: currentMode,
      form_id: 1,
    };

    if (data.position_id?.id) {
      jsonData.position_id = data.position_id.id;
    }

    if (data.job_level_id?.id) {
      jsonData.job_level_id = data.job_level_id.id;
    }

    if (data.employment_type && data.employment_type.trim() !== "") {
      jsonData.employment_type = data.employment_type;
    }

    if (data.expected_salary) {
      jsonData.expected_salary = data.expected_salary;
    }

    if (data.requisition_type_id?.id) {
      jsonData.requisition_type_id = data.requisition_type_id.id;
    }

    if (data.justification && data.justification.trim() !== "") {
      jsonData.justification = data.justification;
    }

    if (data.remarks && data.remarks.trim() !== "") {
      jsonData.remarks = data.remarks;
    }

    if (
      data.employee_to_be_replaced_id?.id &&
      !isAdditional &&
      !isReplacement
    ) {
      jsonData.employee_to_be_replaced_id = data.employee_to_be_replaced_id.id;
    }

    if (isReplacement) {
      if (data.movement_employee_id?.id) {
        jsonData.employee_id = data.movement_employee_id.id;
      }

      if (data.movement_new_position_id?.id) {
        jsonData.new_position_id = data.movement_new_position_id.id;
      }

      if (
        data.movement_reason_for_change &&
        data.movement_reason_for_change.trim() !== ""
      ) {
        jsonData.reason_for_change = data.movement_reason_for_change;
      }

      jsonData.is_developmental_assignment = data.movement_is_da || false;

      if (data.movement_is_da) {
        const formattedStartDate = formatDateForPayload(
          data.movement_da_start_date
        );
        if (formattedStartDate) {
          jsonData.movement_da_start_date = formattedStartDate;
        }

        const formattedEndDate = formatDateForPayload(
          data.movement_da_end_date
        );
        if (formattedEndDate) {
          jsonData.movement_da_end_date = formattedEndDate;
        }
      }
    }

    return jsonData;
  }
};

export const buildEditPayload = (
  data,
  selectedEntry,
  selectedFile,
  requisitionType
) => {
  const isAdditional = isAdditionalManpower(requisitionType);
  const isReplacement = isReplacementDueToEmployeeMovement(requisitionType);

  const updateData = {
    _method: "PATCH",
  };

  if (data.position_id?.id) {
    updateData.position_id = data.position_id.id;
  }

  if (data.job_level_id?.id) {
    updateData.job_level_id = data.job_level_id.id;
  }

  if (data.employment_type && data.employment_type.trim() !== "") {
    updateData.employment_type = data.employment_type;
  }

  if (data.expected_salary) {
    updateData.expected_salary = data.expected_salary;
  }

  if (data.requisition_type_id?.id) {
    updateData.requisition_type_id = data.requisition_type_id.id;
  }

  if (data.justification && data.justification.trim() !== "") {
    updateData.justification = data.justification;
  }

  if (data.remarks && data.remarks.trim() !== "") {
    updateData.remarks = data.remarks;
  }

  if (data.employee_to_be_replaced_id?.id && !isAdditional && !isReplacement) {
    updateData.employee_to_be_replaced_id = data.employee_to_be_replaced_id.id;
  }

  if (isReplacement) {
    if (data.movement_employee_id?.id) {
      updateData.employee_id = data.movement_employee_id.id;
    }

    if (data.movement_new_position_id?.id) {
      updateData.to_position_id = data.movement_new_position_id.id;
    }

    if (
      data.movement_reason_for_change &&
      data.movement_reason_for_change.trim() !== ""
    ) {
      updateData.reason_for_change = data.movement_reason_for_change;
    }

    updateData.is_developmental_assignment = data.movement_is_da || false;

    if (data.movement_is_da) {
      const formattedStartDate = formatDateForPayload(
        data.movement_da_start_date
      );
      if (formattedStartDate) {
        updateData.da_start_date = formattedStartDate;
      }

      const formattedEndDate = formatDateForPayload(data.movement_da_end_date);
      if (formattedEndDate) {
        updateData.da_end_date = formattedEndDate;
      }
    }
  }

  if (selectedFile && selectedFile instanceof File) {
    const formData = new FormData();
    formData.append("id", selectedEntry.id);
    Object.keys(updateData).forEach((key) => {
      formData.append(key, updateData[key]);
    });
    formData.append("manpower_form_attachment", selectedFile);
    return formData;
  } else {
    return { id: selectedEntry.id, ...updateData };
  }
};

export const buildResubmitPayload = (data, requisitionType) => {
  const isAdditional = isAdditionalManpower(requisitionType);
  const isReplacement = isReplacementDueToEmployeeMovement(requisitionType);

  const resubmitData = {};

  if (data.position_id?.id) {
    resubmitData.position_id = data.position_id.id;
  }

  if (data.job_level_id?.id) {
    resubmitData.job_level_id = data.job_level_id.id;
  }

  if (data.employment_type && data.employment_type.trim() !== "") {
    resubmitData.employment_type = data.employment_type;
  }

  if (data.expected_salary) {
    resubmitData.expected_salary = data.expected_salary;
  }

  if (data.requisition_type_id?.id) {
    resubmitData.requisition_type_id = data.requisition_type_id.id;
  }

  if (data.justification && data.justification.trim() !== "") {
    resubmitData.justification = data.justification;
  }

  if (data.remarks && data.remarks.trim() !== "") {
    resubmitData.remarks = data.remarks;
  }

  if (data.employee_to_be_replaced_id?.id && !isAdditional && !isReplacement) {
    resubmitData.employee_to_be_replaced_id =
      data.employee_to_be_replaced_id.id;
  }

  if (isReplacement) {
    if (data.movement_employee_id?.id) {
      resubmitData.employee_id = data.movement_employee_id.id;
    }

    if (data.movement_new_position_id?.id) {
      resubmitData.new_position_id = data.movement_new_position_id.id;
    }

    if (
      data.movement_reason_for_change &&
      data.movement_reason_for_change.trim() !== ""
    ) {
      resubmitData.reason_for_change = data.movement_reason_for_change;
    }

    resubmitData.is_developmental_assignment = data.movement_is_da || false;

    if (data.movement_is_da) {
      const formattedStartDate = formatDateForPayload(
        data.movement_da_start_date
      );
      if (formattedStartDate) {
        resubmitData.da_start_date = formattedStartDate;
      }

      const formattedEndDate = formatDateForPayload(data.movement_da_end_date);
      if (formattedEndDate) {
        resubmitData.da_end_date = formattedEndDate;
      }
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
