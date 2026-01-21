export const getCreateModeInitialValues = () => ({
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

export const getViewEditModeFormData = (positionData) => {
  if (!positionData) return getCreateModeInitialValues();

  return {
    code: positionData.code || "",
    superior_name:
      positionData.superior?.id || positionData.superior_id || null,
    pay_frequency: positionData.pay_frequency || "",
    tools: Array.isArray(positionData.tools) ? positionData.tools : [],
    titles: positionData.title?.id || positionData.title_id || "",
    schedule: positionData.schedule?.id || positionData.schedule_id || "",
    team: positionData.team?.id || positionData.team_id || "",
    charging: positionData.charging?.id || positionData.charging_id || "",
    position_attachment: positionData.position_attachment
      ? {
          name:
            positionData.position_attachment_filename ||
            positionData.position_attachment.split("/").pop().split("?")[0],
          original: positionData.position_attachment,
        }
      : null,
  };
};

export const getRequestorSequenceData = (positionData) => {
  if (!positionData) return [];

  if (positionData.requesters && Array.isArray(positionData.requesters)) {
    return positionData.requesters.map((requestor) => ({
      id: requestor.id,
      name: requestor.full_name || "Unknown User",
      position: requestor.position?.position_name || "No Position",
      department: "No Department",
      employee_id: requestor.employee_id,
      user_id: requestor.id,
    }));
  }

  return [];
};

export const getDisplayValues = (positionData) => {
  if (!positionData)
    return {
      displayTitle: "",
      displaySchedule: "",
      displayTeam: "",
      displayCharging: "",
      displaySuperior: "",
      displayTools: "",
    };

  return {
    displayTitle:
      positionData.title?.name ||
      (typeof positionData.title === "string" ? positionData.title : ""),
    displaySchedule:
      positionData.schedule?.name ||
      (typeof positionData.schedule === "string" ? positionData.schedule : ""),
    displayTeam:
      positionData.team?.name ||
      (typeof positionData.team === "string" ? positionData.team : ""),
    displayCharging:
      positionData.charging?.name ||
      (typeof positionData.charging === "string" ? positionData.charging : ""),
    displaySuperior:
      positionData.superior?.full_name ||
      (typeof positionData.superior === "string" ? positionData.superior : ""),
    displayTools: Array.isArray(positionData.tools)
      ? positionData.tools.join(", ")
      : "",
  };
};

export const getInitialDropdownOptions = (positionData) => {
  if (!positionData)
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

  if (positionData.title && typeof positionData.title === "object") {
    options.titlesList = [
      {
        id: positionData.title.id,
        name: positionData.title.name,
      },
    ];
  }

  if (positionData.schedule && typeof positionData.schedule === "object") {
    options.schedulesList = [
      {
        id: positionData.schedule.id,
        name: positionData.schedule.name,
      },
    ];
  }

  if (positionData.team && typeof positionData.team === "object") {
    options.teamsList = [
      {
        id: positionData.team.id,
        name: positionData.team.name,
      },
    ];
  }

  if (positionData.charging && typeof positionData.charging === "object") {
    options.chargingList = [
      {
        id: positionData.charging.id,
        name: positionData.charging.name,
      },
    ];
  }

  if (positionData.superior && typeof positionData.superior === "object") {
    options.usersList = [
      {
        id: positionData.superior.id,
        full_name: positionData.superior.full_name,
      },
    ];
  }

  return options;
};

export const mergeDropdownOptions = (existingList, initialOptions) => {
  if (!initialOptions || initialOptions.length === 0) return existingList;
  if (!existingList || existingList.length === 0) return initialOptions;

  const existingIds = new Set(existingList.map((item) => item.id));
  const uniqueInitialOptions = initialOptions.filter(
    (item) => !existingIds.has(item.id)
  );

  return [...initialOptions, ...existingList];
};
