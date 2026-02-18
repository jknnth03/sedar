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
import AssignmentIcon from "@mui/icons-material/Assignment";
import TimelineIcon from "@mui/icons-material/Timeline";
import dayjs from "dayjs";

const EvaluationFormHistoryDialog = ({
  historyDialogOpen,
  onHistoryDialogClose,
  selectedEvaluationHistory,
}) => {
  const getEmployeeName = (evaluation) => {
    return evaluation?.employee_name || "N/A";
  };

  const getEmployeeCode = (evaluation) => {
    return evaluation?.employee_code || "N/A";
  };

  const getReferenceNumber = (evaluation) => {
    return evaluation?.reference_number || "N/A";
  };

  const getPositionName = (evaluation) => {
    return evaluation?.position_name || "N/A";
  };

  const getStatusColor = (status) => {
    const statusColors = {
      pending: "#f57c00",
      "pending mda creation": "#f57c00",
      "for mda processing": "#1976d2",
      "mda for approval": "#9c27b0",
      completed: "#4CAF50",
      approved: "#4CAF50",
      received: "#4CAF50",
      rejected: "#f44336",
      cancelled: "#757575",
      returned: "#f44336",
      "awaiting approval": "#9c27b0",
      "awaiting resubmission": "#9c27b0",
      submitted: "#4CAF50",
      resubmitted: "#ff9800",
      "data updated": "#2196f3",
      upcoming: "#e0e0e0",
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
      case "completed":
      case "received":
        IconComponent = CheckIcon;
        break;
      case "submitted":
      case "resubmitted":
        IconComponent = SendIcon;
        break;
      case "returned":
        IconComponent = RefreshIcon;
        break;
      case "pending":
      case "pending mda creation":
      case "for mda processing":
      case "mda for approval":
      case "awaiting approval":
      case "awaiting resubmission":
      case "upcoming":
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

              <Typography
                variant="body2"
                sx={{ color: "#999", fontSize: "13px" }}>
                {activity?.timestamp
                  ? dayjs(activity.timestamp).format("MMM D, YYYY • h:mm A")
                  : activity?.event_type?.toLowerCase() === "upcoming"
                  ? "Pending"
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
    !selectedEvaluationHistory ||
    !selectedEvaluationHistory.activity_log ||
    !Array.isArray(selectedEvaluationHistory.activity_log)
  ) {
    return null;
  }

  const sortedActivityLog = [...selectedEvaluationHistory.activity_log].sort(
    (a, b) => {
      const eventTypeA = (
        a?.event_type ||
        a?.status ||
        a?.action ||
        ""
      ).toLowerCase();
      const eventTypeB = (
        b?.event_type ||
        b?.status ||
        b?.action ||
        ""
      ).toLowerCase();

      if (eventTypeA === "upcoming" && eventTypeB !== "upcoming") return -1;
      if (eventTypeA !== "upcoming" && eventTypeB === "upcoming") return 1;

      const dateA = new Date(a.timestamp || 0);
      const dateB = new Date(b.timestamp || 0);
      return dateB - dateA;
    }
  );

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
            PROBATIONARY EVALUATION ACTIVITY LOGS
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
                Employee Name
              </Typography>
              <Typography
                variant="body1"
                sx={{ color: "#666", fontSize: "16px" }}>
                {getEmployeeName(selectedEvaluationHistory)}
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
                Employee #
              </Typography>
              <Typography
                variant="body1"
                sx={{ color: "#666", fontSize: "16px" }}>
                {getEmployeeCode(selectedEvaluationHistory)}
              </Typography>
            </Box>

            <Box sx={{ flex: 1 }}>
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
                {getReferenceNumber(selectedEvaluationHistory)}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ mb: 4, pl: 3 }}>
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
              Position
            </Typography>
            <Typography
              variant="body1"
              sx={{ color: "#666", fontSize: "16px" }}>
              {getPositionName(selectedEvaluationHistory)}
            </Typography>
          </Box>

          <Box sx={{ pl: 2 }}>
            {sortedActivityLog.map((activity, index) => (
              <Box
                key={activity.id || index}
                sx={{
                  mb: index === sortedActivityLog.length - 1 ? 0 : 2,
                }}>
                <TimelineStep
                  activity={activity}
                  index={index}
                  isLast={index === sortedActivityLog.length - 1}
                  isCompleted={true}
                />
              </Box>
            ))}
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default EvaluationFormHistoryDialog;
