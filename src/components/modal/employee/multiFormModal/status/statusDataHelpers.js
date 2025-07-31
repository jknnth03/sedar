import dayjs from "dayjs";

// Initialize status data from API response or employee data
export const initializeStatusData = (apiResponse, employeeData) => {
  if (apiResponse?.data) {
    return {
      employee_status_label: apiResponse.data.employee_status_label || "",
      employee_status_start_date: apiResponse.data.employee_status_start_date
        ? dayjs(apiResponse.data.employee_status_start_date)
        : null,
      employee_status_end_date: apiResponse.data.employee_status_end_date
        ? dayjs(apiResponse.data.employee_status_end_date)
        : null,
      employee_status_effectivity_date: apiResponse.data
        .employee_status_effectivity_date
        ? dayjs(apiResponse.data.employee_status_effectivity_date)
        : null,
      employee_status_attachment:
        apiResponse.data.employee_status_attachment || null,
      employee_status_attachment_path:
        apiResponse.data.employee_status_attachment || null,
    };
  } else if (employeeData) {
    return {
      employee_status_label: employeeData.employee_status_label || "",
      employee_status_start_date: employeeData.employee_status_start_date
        ? dayjs(employeeData.employee_status_start_date)
        : null,
      employee_status_end_date: employeeData.employee_status_end_date
        ? dayjs(employeeData.employee_status_end_date)
        : null,
      employee_status_effectivity_date:
        employeeData.employee_status_effectivity_date
          ? dayjs(employeeData.employee_status_effectivity_date)
          : null,
      employee_status_attachment:
        employeeData.employee_status_attachment || null,
      employee_status_attachment_path:
        employeeData.employee_status_attachment_path ||
        employeeData.employee_status_attachment ||
        null,
    };
  }

  return {
    employee_status_label: "",
    employee_status_start_date: null,
    employee_status_end_date: null,
    employee_status_effectivity_date: null,
    employee_status_attachment: null,
    employee_status_attachment_path: null,
  };
};

// Prepare data for API update
export const prepareUpdateData = (statusData) => {
  const hasFile = statusData.employee_status_attachment instanceof File;
  const updateData = {
    employee_status_label: statusData.employee_status_label,
  };

  if (statusData.employee_status_start_date) {
    updateData.employee_status_start_date =
      statusData.employee_status_start_date.format("YYYY-MM-DD");
  }

  if (statusData.employee_status_end_date) {
    updateData.employee_status_end_date =
      statusData.employee_status_end_date.format("YYYY-MM-DD");
  }

  if (statusData.employee_status_effectivity_date) {
    updateData.employee_status_effectivity_date =
      statusData.employee_status_effectivity_date.format("YYYY-MM-DD");
  }

  if (hasFile) {
    updateData.employee_status_attachment =
      statusData.employee_status_attachment;
  } else if (
    statusData.employee_status_attachment &&
    typeof statusData.employee_status_attachment === "string"
  ) {
    updateData.employee_status_attachment =
      statusData.employee_status_attachment;
  }

  return updateData;
};
