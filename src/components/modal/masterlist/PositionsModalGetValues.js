export const setCreateModeValues = () => ({
  titles: "",
  code: "",
  superior_name: null,
  headcount: "",
  job_level: "",
  pay_frequency: "",
  expected_salary: "",
  tools: [],
  schedule: "",
  team: "",
  charging: "",
  position_attachment: null,
});

export const setFormValuesFromResponse = (apiResponse) => {
  if (!apiResponse) return setCreateModeValues();

  return {
    code: apiResponse.code || "",
    titles: apiResponse.title_id || "",
    superior_name: apiResponse.superior_id || null,
    headcount: apiResponse.headcount ?? "",
    job_level: apiResponse.job_level_id || apiResponse.job_level?.id || "",
    pay_frequency: apiResponse.pay_frequency || "",
    expected_salary: apiResponse.expected_salary ?? "",
    schedule: apiResponse.schedule_id || "",
    team: apiResponse.team_id || "",
    charging: apiResponse.charging?.id || "",
    tools: setToolsFromResponse(apiResponse.tools),
    position_attachment: setAttachmentFromResponse(
      apiResponse.position_attachment,
      apiResponse.position_attachment_filename,
    ),
  };
};

export const setToolsFromResponse = (toolsData) => {
  if (!Array.isArray(toolsData)) return [];

  return toolsData
    .map((tool) => {
      if (typeof tool === "string") return tool;
      return tool.name || "";
    })
    .filter(Boolean);
};

export const setAttachmentFromResponse = (
  attachmentUrl,
  attachmentFilename,
) => {
  if (!attachmentUrl) return null;

  return {
    name: attachmentFilename || attachmentUrl.split("/").pop().split("?")[0],
    original: attachmentUrl,
  };
};

export const setRequestorsFromResponse = (requestersData) => {
  if (!Array.isArray(requestersData)) return [];

  return requestersData.map((requester) => ({
    id: requester.id,
    name: requester.full_name || "Unknown User",
    position: requester.position || null,
    department_name: requester.department_name || null,
    position_name: requester.position?.position_name || null,
    position_department: requester.position?.department || null,
    employee_id: requester.employee_id,
    user_id: requester.id,
  }));
};

export const setInitialDropdownOptions = (apiResponse) => {
  if (!apiResponse)
    return {
      titlesList: [],
      schedulesList: [],
      teamsList: [],
      chargingList: [],
      usersList: [],
      jobLevelsList: [],
    };

  const options = {
    titlesList: [],
    schedulesList: [],
    teamsList: [],
    teamsList: [],
    chargingList: [],
    usersList: [],
    jobLevelsList: [],
  };

  if (apiResponse.title) {
    options.titlesList = [
      {
        id: apiResponse.title.id,
        name: apiResponse.title.name,
      },
    ];
  }

  if (apiResponse.schedule) {
    options.schedulesList = [
      {
        id: apiResponse.schedule.id,
        name: apiResponse.schedule.name,
      },
    ];
  }

  if (apiResponse.team) {
    options.teamsList = [
      {
        id: apiResponse.team.id,
        name: apiResponse.team.name,
      },
    ];
  }

  if (apiResponse.charging) {
    options.chargingList = [
      {
        id: apiResponse.charging.id,
        name: apiResponse.charging.name,
      },
    ];
  }

  if (apiResponse.superior) {
    options.usersList = [
      {
        id: apiResponse.superior.id,
        full_name: apiResponse.superior.full_name,
        // shown as the sub-line in the dropdown option
        employee_code: apiResponse.superior.employee_code,
        position_title: apiResponse.superior.position_title,
      },
    ];
  }

  if (apiResponse.job_level) {
    options.jobLevelsList = [
      {
        id: apiResponse.job_level.id,
        name: apiResponse.job_level.name,
        code: apiResponse.job_level.code,
        label:
          apiResponse.job_level.label ||
          [
            apiResponse.job_level.name,
            apiResponse.job_level.salary_structure,
            apiResponse.job_level.pay_frequency,
          ]
            .filter(Boolean)
            .join(" | "),
      },
    ];
  }

  return options;
};

export const setDisplayValuesFromResponse = (apiResponse) => {
  if (!apiResponse)
    return {
      displayTitle: "",
      displaySchedule: "",
      displayTeam: "",
      displayCharging: "",
      displaySuperior: "",
      displayTools: "",
    };

  return {
    displayTitle: apiResponse.title?.name || "",
    displaySchedule: apiResponse.schedule?.name || "",
    displayTeam: apiResponse.team?.name || "",
    displayCharging: apiResponse.charging?.name || "",
    displaySuperior: apiResponse.superior?.full_name || "",
    displayTools: Array.isArray(apiResponse.tools)
      ? apiResponse.tools
          .map((tool) => {
            if (typeof tool === "string") return tool;
            return tool.name || "";
          })
          .filter(Boolean)
          .join(", ")
      : "",
  };
};
