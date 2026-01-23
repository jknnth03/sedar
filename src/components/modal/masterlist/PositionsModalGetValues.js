export const setCreateModeValues = () => ({
  titles: "",
  code: "",
  superior_name: null,
  pay_frequency: "",
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
    pay_frequency: apiResponse.pay_frequency || "",
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
    position: requester.position?.position_name || "No Position",
    department: "No Department",
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
    };

  const options = {
    titlesList: [],
    schedulesList: [],
    teamsList: [],
    chargingList: [],
    usersList: [],
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
