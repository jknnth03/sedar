import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogActions,
  Typography,
  Box,
  IconButton,
  Tooltip,
  Paper,
  Button,
  TextField,
  CircularProgress,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import EditIcon from "@mui/icons-material/Edit";
import RefreshIcon from "@mui/icons-material/Refresh";
import CancelIcon from "@mui/icons-material/Cancel";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import SendIcon from "@mui/icons-material/Send";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import PrintIcon from "@mui/icons-material/Print";
import ReceiptIcon from "@mui/icons-material/Receipt";
import AssignmentIcon from "@mui/icons-material/Assignment";
import TimelineIcon from "@mui/icons-material/Timeline";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import dayjs from "dayjs";
import { format } from "date-fns";
import { pendingRegistrationStyles } from "./PendingRegistrationStyles";

// Date Filter Dialog Component
export const DateFilterDialog = ({
  open,
  onClose,
  dateFilters,
  onDateFiltersChange,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [tempStartDate, setTempStartDate] = useState(dateFilters.startDate);
  const [tempEndDate, setTempEndDate] = useState(dateFilters.endDate);

  useEffect(() => {
    setTempStartDate(dateFilters.startDate);
    setTempEndDate(dateFilters.endDate);
  }, [dateFilters, open]);

  const handleApply = () => {
    onDateFiltersChange({
      startDate: tempStartDate,
      endDate: tempEndDate,
    });
    onClose();
  };

  const handleClear = () => {
    setTempStartDate(null);
    setTempEndDate(null);
  };

  const hasFilters = tempStartDate || tempEndDate;

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="xs"
        fullWidth={!isMobile}
        fullScreen={isMobile}
        PaperProps={{
          sx: {
            ...pendingRegistrationStyles.filterDialog,
            ...(isMobile && pendingRegistrationStyles.filterDialogMobile),
          },
        }}>
        <DialogTitle>
          <Box sx={pendingRegistrationStyles.filterDialogTitle}>
            <Box sx={pendingRegistrationStyles.filterDialogTitleLeft}>
              <CalendarTodayIcon sx={pendingRegistrationStyles.filterIcon} />
              <Typography
                variant="h6"
                sx={{
                  ...pendingRegistrationStyles.filterDialogTitleText,
                  ...(isMobile &&
                    pendingRegistrationStyles.filterDialogTitleTextMobile),
                }}>
                FILTER BY DATE
              </Typography>
            </Box>
            <Button
              size="small"
              variant="outlined"
              onClick={handleClear}
              disabled={!hasFilters}
              sx={pendingRegistrationStyles.selectAllButton}>
              Clear All
            </Button>
          </Box>
        </DialogTitle>

        <DialogContent
          sx={pendingRegistrationStyles.filterDialogContent(isMobile)}>
          <Box sx={pendingRegistrationStyles.datePickerContainer(isMobile)}>
            <DatePicker
              label="Start Date"
              value={tempStartDate}
              onChange={(newValue) => setTempStartDate(newValue)}
              renderInput={(params) => (
                <TextField {...params} fullWidth size="small" />
              )}
              maxDate={tempEndDate || new Date()}
            />
            <DatePicker
              label="End Date"
              value={tempEndDate}
              onChange={(newValue) => setTempEndDate(newValue)}
              renderInput={(params) => (
                <TextField {...params} fullWidth size="small" />
              )}
              minDate={tempStartDate}
              maxDate={new Date()}
            />
          </Box>
        </DialogContent>

        <DialogActions
          sx={pendingRegistrationStyles.filterDialogActions(isMobile)}>
          <Box sx={pendingRegistrationStyles.dialogActionsContainer}>
            <Box
              sx={pendingRegistrationStyles.dialogButtonsContainer(isMobile)}>
              <Button
                onClick={onClose}
                variant="outlined"
                sx={pendingRegistrationStyles.cancelButton(isMobile)}>
                CANCEL
              </Button>
              <Button
                onClick={handleApply}
                variant="contained"
                sx={pendingRegistrationStyles.applyFiltersButton(isMobile)}>
                APPLY FILTERS
              </Button>
            </Box>
          </Box>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
};

// Confirmation Dialog Component
export const ConfirmationDialog = ({
  open,
  onClose,
  onConfirm,
  confirmAction,
  selectedEmployeeForAction,
  modalLoading,
}) => {
  const getConfirmationMessage = () => {
    if (!confirmAction)
      return "Are you sure you want to proceed with this action?";

    if (confirmAction === "approve") {
      return "Are you sure you want to approve this employee registration?";
    }
    if (confirmAction === "reject") {
      return "Are you sure you want to reject this employee registration?";
    }

    return "Are you sure you want to proceed with this action?";
  };

  const getConfirmationTitle = () => {
    if (!confirmAction) return "Confirmation";

    const titles = {
      approve: "Confirm Approval",
      reject: "Confirm Rejection",
    };

    return titles[confirmAction] || "Confirmation";
  };

  const getConfirmButtonColor = () => {
    if (!confirmAction) return "primary";

    const colors = {
      approve: "success",
      reject: "error",
    };

    return colors[confirmAction] || "primary";
  };

  const getConfirmButtonText = () => {
    if (!confirmAction) return "Confirm";

    const texts = {
      approve: "Approve",
      reject: "Reject",
    };

    return texts[confirmAction] || "Confirm";
  };

  const getEmployeeDisplayName = () => {
    return (
      selectedEmployeeForAction?.full_name ||
      selectedEmployeeForAction?.name ||
      "Employee"
    );
  };

  const getEmployeeId = () => {
    return selectedEmployeeForAction?.id || "Unknown";
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: pendingRegistrationStyles.confirmDialog,
      }}>
      <DialogTitle sx={pendingRegistrationStyles.confirmTitle}>
        <Box sx={pendingRegistrationStyles.confirmIconContainer}>
          <Box sx={pendingRegistrationStyles.confirmIcon}>
            <Typography sx={pendingRegistrationStyles.confirmIconText}>
              ?
            </Typography>
          </Box>
        </Box>
        <Typography variant="h5" sx={pendingRegistrationStyles.confirmTitle}>
          {getConfirmationTitle()}
        </Typography>
      </DialogTitle>
      <DialogContent sx={pendingRegistrationStyles.confirmContent}>
        <Typography
          variant="body1"
          sx={pendingRegistrationStyles.confirmMessage}>
          {getConfirmationMessage()}
        </Typography>
        <Typography
          variant="body2"
          sx={pendingRegistrationStyles.confirmEmployeeInfo}>
          {getEmployeeDisplayName()} - ID: {getEmployeeId()}
        </Typography>
      </DialogContent>
      <DialogActions sx={pendingRegistrationStyles.confirmActions}>
        <Button
          onClick={onClose}
          variant="outlined"
          sx={pendingRegistrationStyles.confirmCancelButton}
          disabled={modalLoading}>
          CANCEL
        </Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          sx={pendingRegistrationStyles.confirmActionButton(
            getConfirmButtonColor(),
          )}
          disabled={modalLoading}>
          {modalLoading ? (
            <CircularProgress size={20} color="inherit" />
          ) : (
            getConfirmButtonText()
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Activity History Dialog Component
const ActivityHistoryDialog = ({
  historyDialogOpen,
  onHistoryDialogClose,
  selectedRegistrationHistory,
}) => {
  const getFullName = (registration) => {
    if (registration?.submittable?.employee_name) {
      return registration.submittable.employee_name;
    }

    if (registration?.submittable?.general_info?.full_name) {
      const fullName = registration.submittable.general_info.full_name;
      const statusWords = [
        "REJECTED",
        "APPROVED",
        "PENDING",
        "AWAITING",
        "RESUBMISSION",
        "SUBMITTED",
        "RETURNED",
        "CANCELLED",
      ];
      let cleanName = fullName;

      statusWords.forEach((status) => {
        const regex = new RegExp(`\\s+${status}\\s*$`, "i");
        cleanName = cleanName.replace(regex, "");
      });

      return cleanName.trim();
    }

    const user = registration?.requested_by;
    if (user?.full_name) return user.full_name;
    const firstName = user?.first_name || "";
    const lastName = user?.last_name || "";
    if (firstName || lastName) return `${firstName} ${lastName}`.trim();
    return user?.username || "N/A";
  };

  const getEmployeeCode = (registration) => {
    return (
      registration?.submittable?.general_info?.employee_code ||
      registration?.submittable?.employee_code ||
      registration?.charging?.code ||
      (registration?.id ? `EMP-${registration.id}` : "N/A")
    );
  };

  const getStatusColor = (status) => {
    const statusColors = {
      pending: "#f57c00",
      "in progress": "#4CAF50",
      requested: "#4CAF50",
      approved: "#4CAF50",
      rejected: "#f44336",
      cancelled: "#ff6b35",
      completed: "#4CAF50",
      upcoming: "#e0e0e0",
      submitted: "#4CAF50",
      printed: "#4CAF50",
      "item received": "#4CAF50",
      received: "#4CAF50",
      resubmitted: "#ff9800",
      returned: "#f44336",
      "data updated": "#2196f3",
      "awaiting resubmission": "#4c00ffff",
    };
    return statusColors[status?.toLowerCase()] || "#f57c00";
  };

  const getStatusIcon = (activity) => {
    const eventType = (
      activity?.event_type ||
      activity?.status ||
      activity?.action ||
      "PENDING"
    ).toLowerCase();
    let IconComponent;
    switch (eventType) {
      case "rejected":
        IconComponent = CloseIcon;
        break;
      case "approved":
        IconComponent = CheckIcon;
        break;
      case "submitted":
      case "resubmitted":
        IconComponent = SendIcon;
        break;
      case "returned":
        IconComponent = RefreshIcon;
        break;
      case "printed":
        IconComponent = PrintIcon;
        break;
      case "item received":
      case "received":
        IconComponent = ReceiptIcon;
        break;
      case "pending":
      case "in progress":
      case "awaiting resubmission":
        IconComponent = HourglassEmptyIcon;
        break;
      case "cancelled":
        IconComponent = CancelIcon;
        break;
      case "data updated":
        IconComponent = EditIcon;
        break;
      default:
        IconComponent = AssignmentIcon;
        break;
    }
    return IconComponent;
  };

  const TimelineStep = ({ activity, index, isLast, isCompleted }) => {
    const IconComponent = getStatusIcon(activity);
    const statusColor = getStatusColor(
      activity?.event_type || activity?.status || activity?.action,
    );

    return (
      <Box
        sx={{
          position: "relative",
          display: "flex",
          alignItems: "flex-start",
        }}>
        {!isLast && (
          <Box
            sx={{
              position: "absolute",
              left: "15px",
              top: "32px",
              width: "2px",
              height: "40px",
              backgroundColor: isCompleted
                ? (
                    activity?.event_type ||
                    activity?.status ||
                    activity?.action ||
                    ""
                  ).toLowerCase() === "rejected" ||
                  (
                    activity?.event_type ||
                    activity?.status ||
                    activity?.action ||
                    ""
                  ).toLowerCase() === "returned"
                  ? "#d32f2f"
                  : statusColor
                : "#e0e0e0",
              zIndex: 1,
            }}
          />
        )}

        <Box
          sx={{
            width: 32,
            height: 32,
            borderRadius: "50%",
            backgroundColor: isCompleted
              ? (
                  activity?.event_type ||
                  activity?.status ||
                  activity?.action ||
                  ""
                ).toLowerCase() === "rejected" ||
                (
                  activity?.event_type ||
                  activity?.status ||
                  activity?.action ||
                  ""
                ).toLowerCase() === "returned"
                ? "#d32f2f"
                : statusColor
              : "#e0e0e0",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            fontSize: "16px",
            fontWeight: "bold",
            zIndex: 2,
            position: "relative",
          }}>
          <IconComponent fontSize="small" />
        </Box>

        <Paper
          elevation={1}
          sx={{
            ml: 3,
            flex: 1,
            p: 2.5,
            backgroundColor: "#fff",
            borderRadius: 2,
            border: "1px solid #f0f0f0",
            transition: "all 0.2s ease-in-out",
            "&:hover": { boxShadow: "0 4px 12px rgba(0,0,0,0.1)" },
          }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
            }}>
            <Box>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 600,
                  color:
                    (
                      activity?.event_type ||
                      activity?.status ||
                      activity?.action ||
                      ""
                    ).toLowerCase() === "rejected" ||
                    (
                      activity?.event_type ||
                      activity?.status ||
                      activity?.action ||
                      ""
                    ).toLowerCase() === "returned"
                      ? "#d32f2f"
                      : "rgb(33, 61, 112)",
                  fontSize: "16px",
                  textTransform: "uppercase",
                  mb: 1,
                }}>
                {activity?.event_type ||
                  activity?.status ||
                  activity?.action ||
                  "PENDING"}
              </Typography>

              {activity?.description && (
                <Typography variant="body2" sx={{ color: "#666", mb: 1 }}>
                  {activity.description}
                </Typography>
              )}

              <Typography
                variant="body2"
                sx={{ color: "#999", fontSize: "13px" }}>
                {activity?.timestamp
                  ? dayjs(activity.timestamp).format("MMM D, YYYY • h:mm A")
                  : ""}
              </Typography>
            </Box>

            <Box sx={{ textAlign: "right" }}>
              <Typography
                variant="body1"
                sx={{ color: "#666", fontSize: "16px" }}>
                {activity?.actor?.full_name ||
                  activity?.actor?.username ||
                  "Unknown"}
              </Typography>

              {activity?.actor?.title && (
                <Typography
                  variant="caption"
                  sx={{
                    color: "rgb(33, 61, 112)",
                    display: "block",
                    fontSize: "14px",
                    fontWeight: 500,
                    mt: 0.5,
                  }}>
                  {activity.actor.title}
                </Typography>
              )}
            </Box>
          </Box>
        </Paper>
      </Box>
    );
  };

  if (
    !selectedRegistrationHistory ||
    !selectedRegistrationHistory.activity_log ||
    !Array.isArray(selectedRegistrationHistory.activity_log)
  ) {
    return null;
  }

  return (
    <Dialog
      open={historyDialogOpen}
      onClose={onHistoryDialogClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 3, minHeight: "600px", maxHeight: "90vh" },
      }}>
      <DialogContent
        sx={{ px: 4, py: 4, backgroundColor: "white", position: "relative" }}>
        <Tooltip title="Close">
          <IconButton
            onClick={onHistoryDialogClose}
            sx={{
              position: "absolute",
              right: 16,
              top: 16,
              color: "rgb(33, 61, 112)",
              "&:hover": { backgroundColor: "#f5f5f5" },
            }}>
            <CloseIcon />
          </IconButton>
        </Tooltip>

        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              color: "rgb(33, 61, 112)",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
              mb: 3,
              display: "flex",
              alignItems: "center",
              fontSize: "18px",
            }}>
            <Box
              sx={{
                width: 4,
                height: 24,
                backgroundColor: "#FF4500",
                borderRadius: 1,
                mr: 2,
              }}
            />
            ACTIVITY LOGS
            <TimelineIcon sx={{ color: "#FF4500", fontSize: 24, ml: 0.5 }} />
          </Typography>

          <Box
            sx={{
              mb: 4,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              pl: 3,
            }}>
            <Box sx={{ flex: 1, mr: 3 }}>
              <Typography
                variant="h6"
                sx={{
                  color: "rgb(33, 61, 112)",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.3px",
                  mb: 1,
                  fontSize: "14px",
                }}>
                Full Name
              </Typography>
              <Typography
                variant="body1"
                sx={{ color: "#666", fontSize: "16px" }}>
                {getFullName(selectedRegistrationHistory)}
              </Typography>
            </Box>

            <Box sx={{ flex: 1, mr: 3 }}>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 600,
                  color: "rgb(33, 61, 112)",
                  textTransform: "uppercase",
                  letterSpacing: "0.3px",
                  mb: 1,
                  fontSize: "14px",
                }}>
                ID NUMBER
              </Typography>
              <Typography
                variant="body1"
                sx={{ color: "#666", fontSize: "16px" }}>
                {getEmployeeCode(selectedRegistrationHistory)}
              </Typography>
            </Box>

            <Box sx={{ flex: 0.4 }}>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 600,
                  color: "rgb(33, 61, 112)",
                  textTransform: "uppercase",
                  letterSpacing: "0.3px",
                  mb: 1,
                  fontSize: "14px",
                }}>
                Date Created
              </Typography>
              <Typography
                variant="body1"
                sx={{ color: "#666", fontSize: "16px" }}>
                {selectedRegistrationHistory?.created_at
                  ? dayjs(selectedRegistrationHistory.created_at).format(
                      "MMM D, YYYY",
                    )
                  : "N/A"}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ pl: 2 }}>
            {selectedRegistrationHistory.activity_log.map((activity, index) => (
              <Box
                key={index}
                sx={{
                  mb:
                    index ===
                    selectedRegistrationHistory.activity_log.length - 1
                      ? 0
                      : 2,
                }}>
                <TimelineStep
                  activity={activity}
                  index={index}
                  isLast={
                    index ===
                    selectedRegistrationHistory.activity_log.length - 1
                  }
                  isCompleted={true}
                />
              </Box>
            ))}
          </Box>
        </Box>

        {selectedRegistrationHistory.activity_log.length === 0 && (
          <Box sx={{ textAlign: "center", py: 8 }}>
            <AssignmentIcon sx={{ fontSize: 64, color: "#ccc", mb: 2 }} />
            <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
              No Timeline History Available
            </Typography>
            <Typography variant="body2" color="text.secondary">
              This registration doesn't have any recorded activities yet.
            </Typography>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ActivityHistoryDialog;
