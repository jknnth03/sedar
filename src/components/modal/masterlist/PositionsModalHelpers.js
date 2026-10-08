export const mergeDropdownOptions = (existingList, initialOptions) => {
  if (!initialOptions || initialOptions.length === 0) return existingList || [];
  if (!existingList || existingList.length === 0) return initialOptions;

  const existingIds = new Set(existingList.map((item) => item.id));
  const uniqueInitialOptions = initialOptions.filter(
    (item) => !existingIds.has(item.id),
  );

  return [...uniqueInitialOptions, ...existingList];
};

// NEW HELPER FUNCTIONS

export const normalizeData = (data) => {
  if (!data) return [];
  const result = data.result?.data || data.result || [];
  return result;
};

export const getToolsForPayload = (formData, toolsList) => {
  if (!formData.tools || formData.tools.length === 0) return [];

  return formData.tools
    .map((toolName) => {
      const tool = toolsList.find((t) => t.name === toolName);
      return tool ? tool.id : null;
    })
    .filter((id) => id !== null);
};

export const getAttachmentDisplayName = (attachment) => {
  if (!attachment) return "";

  if (attachment instanceof File) {
    return attachment.name;
  } else if (typeof attachment === "object" && attachment !== null) {
    return attachment.name || "Attached Document";
  } else if (typeof attachment === "string") {
    return attachment.split("/").pop() || "Attached Document";
  }
  return "";
};

export const validatePositionForm = (formData, currentMode) => {
  const newErrors = {
    titles: !formData.titles,
    code: !formData.code || !formData.code.trim(),
    job_level: !formData.job_level,
    pay_frequency: !formData.pay_frequency,
    schedule: !formData.schedule,
    team: !formData.team,
    charging: !formData.charging,
    tools: formData.tools.length === 0,
    // expected_salary is optional for now. To make it required, uncomment:
    // expected_salary:
    //   formData.expected_salary === "" ||
    //   formData.expected_salary === null ||
    //   formData.expected_salary === undefined,
    // headcount is optional for now. To make it required, uncomment:
    // headcount:
    //   formData.headcount === "" ||
    //   formData.headcount === null ||
    //   formData.headcount === undefined,
  };

  if (
    currentMode !== true &&
    currentMode !== "edit" &&
    currentMode !== "view"
  ) {
    newErrors.position_attachment =
      !formData.position_attachment ||
      (formData.position_attachment instanceof FileList &&
        formData.position_attachment.length === 0);
  }

  return {
    errors: newErrors,
    isValid: !Object.values(newErrors).some(Boolean),
  };
};

export const buildFormDataPayload = (
  formData,
  toolsList,
  showArchived,
  currentMode,
) => {
  const formDataToSend = new FormData();

  formDataToSend.append("code", formData.code);
  formDataToSend.append("title_id", formData.titles);
  if (formData.superior_name) {
    formDataToSend.append("superior_id", formData.superior_name);
  }
  formDataToSend.append("headcount", formData.headcount ?? "");
  formDataToSend.append("job_level_id", formData.job_level);
  formDataToSend.append("pay_frequency", formData.pay_frequency);
  formDataToSend.append("expected_salary", formData.expected_salary ?? "");
  formDataToSend.append("schedule_id", formData.schedule);
  formDataToSend.append("team_id", formData.team);
  formDataToSend.append("charging_id", formData.charging);
  formDataToSend.append("status", showArchived ? "inactive" : "active");

  // Tools
  const toolIds = getToolsForPayload(formData, toolsList);
  toolIds.forEach((toolId) => {
    formDataToSend.append("tools[]", toolId);
  });

  // Attachment
  if (formData.position_attachment instanceof File) {
    formDataToSend.append("position_attachment", formData.position_attachment);
  } else if (
    (currentMode === true || currentMode === "edit") &&
    formData.position_attachment?.original
  ) {
    formDataToSend.append(
      "position_attachment",
      formData.position_attachment.original,
    );
  }

  // Add _method for update
  if (currentMode === true || currentMode === "edit") {
    formDataToSend.append("_method", "PATCH");
  }

  return formDataToSend;
};

export const getModalTitle = (currentMode) => {
  switch (currentMode) {
    case false:
      return "ADD POSITION";
    case "view":
      return "VIEW POSITION";
    case true:
    case "edit":
      return "EDIT POSITION";
    default:
      return "Position";
  }
};

export const hasExistingAttachment = (fullPositionData, position, formData) => {
  const dataToUse = fullPositionData || position;
  return !!(
    dataToUse?.position_attachment || formData.position_attachment?.original
  );
};
