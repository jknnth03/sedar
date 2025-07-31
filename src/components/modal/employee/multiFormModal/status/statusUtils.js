import dayjs from "dayjs";

export const STATUS_OPTIONS = [
  "EXTENDED",
  "SUSPENDED",
  "MATERNITY",
  "RETURNED TO AGENCY",
  "TERMINATED",
  "RESIGNED",
  "ABSENT WITHOUT LEAVE",
  "END OF CONTRACT",
  "BLACKLISTED",
  "DISMISSED",
  "DECEASED",
  "BACK OUT",
];

export const STATUS_WITH_START_END_DATES = [
  "EXTENDED",
  "SUSPENDED",
  "MATERNITY",
];
export const STATUS_WITH_EFFECTIVITY_DATE = [
  "RETURNED TO AGENCY",
  "TERMINATED",
  "RESIGNED",
  "ABSENT WITHOUT LEAVE",
  "END OF CONTRACT",
  "BLACKLISTED",
  "DISMISSED",
  "DECEASED",
  "BACK OUT",
];
export const STATUS_WITH_MINIMAL_DATA = ["REGULAR"];

export const formatEmployeeName = (employee) => {
  if (!employee) return "Unknown Employee";
  if (employee?.full_name) return employee.full_name;
  const parts = [
    employee?.last_name,
    employee?.first_name,
    employee?.middle_name,
  ].filter(Boolean);
  return parts.length > 0 ? parts.join(", ") : "Unknown Employee";
};

export const formatDate = (date) => {
  if (!date) return "";
  return dayjs(date).format("MMM DD, YYYY");
};

export const getFieldsEnabledForStatus = (status) => {
  if (STATUS_WITH_START_END_DATES.includes(status)) {
    return { startDate: true, endDate: true, effectivityDate: false };
  } else if (STATUS_WITH_EFFECTIVITY_DATE.includes(status)) {
    return { startDate: false, endDate: false, effectivityDate: true };
  } else if (STATUS_WITH_MINIMAL_DATA.includes(status)) {
    return { startDate: true, endDate: false, effectivityDate: false };
  }
  return { startDate: true, endDate: true, effectivityDate: true };
};

export const getFullAttachmentUrl = (attachmentPath) => {
  if (!attachmentPath) return null;
  if (attachmentPath.startsWith("http")) return attachmentPath;
  const baseUrl = process.env.REACT_APP_API_BASE_URL || window.location.origin;
  return `${baseUrl}/${attachmentPath}`;
};

export const getAttachmentFilename = (attachmentPath) => {
  if (!attachmentPath) return null;
  if (typeof attachmentPath === "string") {
    const pathParts = attachmentPath.split("/");
    return pathParts[pathParts.length - 1];
  }
  if (attachmentPath instanceof File) return attachmentPath.name;
  return "attachment";
};

export const handleDownloadAttachment = (attachment, enqueueSnackbar) => {
  if (attachment) {
    const fullUrl = getFullAttachmentUrl(attachment);
    const filename = getAttachmentFilename(attachment);
    const link = document.createElement("a");
    link.href = fullUrl;
    link.download = filename;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    enqueueSnackbar("Downloading attachment...", {
      variant: "info",
      autoHideDuration: 2000,
    });
  }
};

export const createEmptyStatusEntry = () => ({
  id: Date.now() + Math.random(),
  employee_status_label: "",
  employee_status_start_date: null,
  employee_status_end_date: null,
  employee_status_effectivity_date: null,
  employee_status_attachment: null,
  employee_status_attachment_path: "",
  isNew: true,
  canRemove: true,
  isEditable: true,
});
