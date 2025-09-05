import React from "react";
import {
  Dialog,
  DialogContent,
  Typography,
  Box,
  IconButton,
  Tooltip,
  Paper,
} from "@mui/material";
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
import dayjs from "dayjs";

const DataChangeDialog = ({
  historyDialogOpen,
  onHistoryDialogClose,
  selectedDataChangeHistory,
}) => {
  const getFullName = (dataChange) => {
    if (dataChange?.employee_name) {
      return dataChange.employee_name;
    }

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
    let cleanName = dataChange?.employee_name || "";

    statusWords.forEach((status) => {
      const regex = new RegExp(`\\s+${status}\\s*$`, "i");
      cleanName = cleanName.replace(regex, "");
    });

    return cleanName.trim() || "N/A";
  };

  const getEmployeeCode = (dataChange) => {
    return dataChange?.employee_code || "N/A";
  };

  const getReferenceNumber = (dataChange) => {
    return dataChange?.reference_number || "N/A";
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
      activity?.event_type || activity?.status || activity?.action
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

              {activity?.context && (
                <Typography
                  variant="body2"
                  sx={{ color: "#888", fontSize: "12px", mb: 1 }}>
                  Step {activity.context.step}, Round {activity.context.round}
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
    !selectedDataChangeHistory ||
    !selectedDataChangeHistory.activity_log ||
    !Array.isArray(selectedDataChangeHistory.activity_log)
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
            DATA CHANGE ACTIVITY LOGS
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
                {getFullName(selectedDataChangeHistory)}
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
                Employee Code
              </Typography>
              <Typography
                variant="body1"
                sx={{ color: "#666", fontSize: "16px" }}>
                {getEmployeeCode(selectedDataChangeHistory)}
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
                Reference Number
              </Typography>
              <Typography
                variant="body1"
                sx={{ color: "#666", fontSize: "16px" }}>
                {getReferenceNumber(selectedDataChangeHistory)}
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
                Date Requested
              </Typography>
              <Typography
                variant="body1"
                sx={{ color: "#666", fontSize: "16px" }}>
                {selectedDataChangeHistory?.date_requested
                  ? dayjs(selectedDataChangeHistory.date_requested).format(
                      "MMM D, YYYY"
                    )
                  : "N/A"}
              </Typography>
            </Box>
          </Box>

          {selectedDataChangeHistory?.submission_title && (
            <Box sx={{ pl: 3, mb: 3 }}>
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
                Submission Title
              </Typography>
              <Typography
                variant="body1"
                sx={{ color: "#666", fontSize: "16px" }}>
                {selectedDataChangeHistory.submission_title}
              </Typography>
            </Box>
          )}

          <Box sx={{ pl: 2 }}>
            {selectedDataChangeHistory.activity_log
              .slice()
              .reverse()
              .map((activity, index) => (
                <Box
                  key={activity.id || index}
                  sx={{
                    mb:
                      index ===
                      selectedDataChangeHistory.activity_log.length - 1
                        ? 0
                        : 2,
                  }}>
                  <TimelineStep
                    activity={activity}
                    index={index}
                    isLast={
                      index ===
                      selectedDataChangeHistory.activity_log.length - 1
                    }
                    isCompleted={true}
                  />
                </Box>
              ))}
          </Box>
        </Box>

        {selectedDataChangeHistory.activity_log.length === 0 && (
          <Box sx={{ textAlign: "center", py: 8 }}>
            <AssignmentIcon sx={{ fontSize: 64, color: "#ccc", mb: 2 }} />
            <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
              No Timeline History Available
            </Typography>
            <Typography variant="body2" color="text.secondary">
              This data change request doesn't have any recorded activities yet.
            </Typography>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default DataChangeDialog;
