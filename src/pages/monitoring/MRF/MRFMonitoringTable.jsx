import React, { useCallback, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Typography,
  Box,
  IconButton,
  Chip,
  Tooltip,
  useTheme,
  Dialog,
  DialogContent,
  Paper,
} from "@mui/material";
import HistoryIcon from "@mui/icons-material/History";
import TimelineIcon from "@mui/icons-material/Timeline";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import SendIcon from "@mui/icons-material/Send";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import PrintIcon from "@mui/icons-material/Print";
import ReceiptIcon from "@mui/icons-material/Receipt";
import AssignmentIcon from "@mui/icons-material/Assignment";
import BadgeIcon from "@mui/icons-material/Badge";
import EditIcon from "@mui/icons-material/Edit";
import RefreshIcon from "@mui/icons-material/Refresh";
import CancelIcon from "@mui/icons-material/Cancel";
import dayjs from "dayjs";
import { CONSTANT } from "../../../config";
import { styles } from "../../forms/manpowerform/FormSubmissionStyles";

const MRFMonitoringTable = ({
  submissionsList,
  isLoadingState,
  error,
  searchQuery,
  handleRowClick,
}) => {
  const theme = useTheme();
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false);
  const [selectedSubmissionHistory, setSelectedSubmissionHistory] =
    useState(null);

  const handleHistoryClick = (submission, event) => {
    event.stopPropagation();
    setSelectedSubmissionHistory(submission);
    setHistoryDialogOpen(true);
  };

  const handleHistoryDialogClose = () => {
    setHistoryDialogOpen(false);
    setSelectedSubmissionHistory(null);
  };

  const renderStatusChip = useCallback((submission) => {
    const statusConfig = {
      PENDING: {
        color: "#f57c00",
        bgColor: "#fff8e1",
        label: "PENDING",
      },
      APPROVED: {
        color: "#1976d2",
        bgColor: "#e3f2fd",
        label: "APPROVED",
      },
      RECEIVED: {
        color: "#2e7d32",
        bgColor: "#e8f5e8",
        label: "RECEIVED",
      },
      REJECTED: {
        color: "#d32f2f",
        bgColor: "#ffebee",
        label: "REJECTED",
      },
      CANCELLED: {
        color: "#757575",
        bgColor: "#f5f5f5",
        label: "CANCELLED",
      },
      "AWAITING RESUBMISSION": {
        color: "#9c27b0",
        bgColor: "#f3e5f5",
        label: "AWAITING RESUBMISSION",
      },
      AWAITING_RESUBMISSION: {
        color: "#9c27b0",
        bgColor: "#f3e5f5",
        label: "AWAITING RESUBMISSION",
      },
    };

    let displayStatus = submission.status?.toUpperCase();

    const normalizedStatus = displayStatus?.replace(/[\s_-]+/g, " ");

    if (normalizedStatus === "AWAITING RESUBMISSION") {
      displayStatus = "AWAITING RESUBMISSION";
    } else {
      const hasReceivedEvent = submission.activity_log?.some(
        (log) => log.event_type === "RECEIVED"
      );

      const hasRejectedEvent = submission.activity_log?.some(
        (log) => log.event_type === "REJECTED"
      );

      if (hasReceivedEvent) {
        displayStatus = "RECEIVED";
      } else if (hasRejectedEvent) {
        displayStatus = "REJECTED";
      }
    }

    const config = statusConfig[displayStatus] || {
      color: "#757575",
      bgColor: "#f5f5f5",
      label: displayStatus || "UNKNOWN",
    };

    return (
      <Chip label={config.label} size="small" sx={styles.statusChip(config)} />
    );
  }, []);

  const formatEmploymentType = useCallback((employmentType) => {
    if (!employmentType) {
      return "N/A";
    }

    return employmentType
      .split(/[\s_-]+/)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  }, []);

  const formatDescription = (activity) => {
    const eventType = (activity.event_type || "").toUpperCase();
    const description = activity.description;

    if ((eventType === "REJECTED" || eventType === "RETURNED") && description) {
      return (
        <Box>
          <span style={styles.timelineDescriptionReason}>
            Reason: {description}
          </span>
        </Box>
      );
    }

    return description;
  };

  const getStatusColor = (status) => {
    const statusColors = {
      PENDING: "#f57c00",
      APPROVED: "#4CAF50",
      REJECTED: "#f44336",
      CANCELLED: "#9e9e9e",
      UPCOMING: "#e0e0e0",
      SUBMITTED: "#4CAF50",
      RECEIVED: "#4CAF50",
      RETURNED: "#ff9800",
    };
    return statusColors[status?.toUpperCase()] || "#4CAF50";
  };

  const getStatusIcon = (activity) => {
    const eventType = (activity.event_type || "PENDING").toUpperCase();

    let IconComponent;
    switch (eventType) {
      case "REJECTED":
        IconComponent = CloseIcon;
        break;
      case "APPROVED":
        IconComponent = CheckIcon;
        break;
      case "SUBMITTED":
        IconComponent = SendIcon;
        break;
      case "RETURNED":
        IconComponent = RefreshIcon;
        break;
      case "RECEIVED":
        IconComponent = ReceiptIcon;
        break;
      case "PENDING":
      case "UPCOMING":
        IconComponent = HourglassEmptyIcon;
        break;
      case "CANCELLED":
        IconComponent = CancelIcon;
        break;
      default:
        IconComponent = AssignmentIcon;
        break;
    }

    return IconComponent;
  };

  const TimelineStep = ({ activity, index, isLast, isCompleted }) => {
    const IconComponent = getStatusIcon(activity);
    const statusColor = getStatusColor(activity.event_type);

    return (
      <Box sx={styles.timelineStepContainer}>
        {!isLast && (
          <Box sx={styles.timelineConnector(isCompleted, activity)} />
        )}

        <Box sx={styles.timelineIcon(isCompleted, activity, statusColor)}>
          <IconComponent fontSize="small" />
        </Box>

        <Paper elevation={1} sx={styles.timelineContent}>
          <Box sx={styles.timelineContentHeader}>
            <Box>
              <Typography variant="h6" sx={styles.timelineEventType(activity)}>
                {activity.event_type || "PENDING"}
              </Typography>

              {activity.description && (
                <Typography variant="body2" sx={styles.timelineDescription}>
                  {formatDescription(activity)}
                </Typography>
              )}

              <Typography variant="body2" sx={styles.timelineTimestamp}>
                {activity.timestamp
                  ? dayjs(activity.timestamp).format("MMM D, YYYY • h:mm A")
                  : ""}
              </Typography>
            </Box>

            <Box sx={styles.timelineActorInfo}>
              <Typography variant="body1" sx={styles.timelineActorName}>
                {activity.actor?.full_name || "System"}
              </Typography>

              {activity.actor?.title && (
                <Typography variant="caption" sx={styles.timelineActorPosition}>
                  {activity.actor.title}
                </Typography>
              )}
            </Box>
          </Box>
        </Paper>
      </Box>
    );
  };

  const HistoryDialog = () => {
    if (!selectedSubmissionHistory || !selectedSubmissionHistory.activity_log) {
      return null;
    }

    return (
      <Dialog
        open={historyDialogOpen}
        onClose={handleHistoryDialogClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: styles.historyDialog,
        }}>
        <DialogContent sx={styles.historyDialogContent}>
          <Tooltip title="Close">
            <IconButton
              onClick={handleHistoryDialogClose}
              sx={styles.historyCloseButton}>
              <CloseIcon />
            </IconButton>
          </Tooltip>

          <Box sx={{ mb: 4 }}>
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" sx={styles.historyTitle}>
                <Box sx={styles.historyTitleAccent} />
                ACTIVITY LOGS
                <TimelineIcon sx={styles.historyTimelineIcon} />
              </Typography>
              <Box sx={styles.historyInfoContainer}>
                <Box sx={styles.historyInfoBox}>
                  <Typography variant="h6" sx={styles.historyInfoTitle}>
                    Reference Number
                  </Typography>
                  <Typography variant="body1" sx={styles.historyInfoText}>
                    {selectedSubmissionHistory?.reference_number || "N/A"}
                  </Typography>
                </Box>

                <Box sx={styles.historyInfoBox}>
                  <Typography variant="h6" sx={styles.historyInfoTitle}>
                    Position
                  </Typography>
                  <Typography variant="body1" sx={styles.historyInfoText}>
                    {selectedSubmissionHistory?.position_title || "N/A"}
                  </Typography>
                </Box>

                <Box sx={styles.historyInfoBoxLast}>
                  <Typography variant="h6" sx={styles.historyInfoTitle}>
                    Date Created
                  </Typography>
                  <Typography variant="body1" sx={styles.historyInfoText}>
                    {selectedSubmissionHistory?.created_at
                      ? dayjs(selectedSubmissionHistory.created_at).format(
                          "MMM D, YYYY"
                        )
                      : "N/A"}
                  </Typography>
                </Box>
              </Box>
              <Box sx={styles.timelineContainer}>
                {selectedSubmissionHistory.activity_log.map(
                  (activity, index) => (
                    <Box
                      key={activity.id || index}
                      sx={{
                        mb:
                          index ===
                          selectedSubmissionHistory.activity_log.length - 1
                            ? 0
                            : 2,
                      }}>
                      <TimelineStep
                        activity={activity}
                        index={index}
                        isLast={
                          index ===
                          selectedSubmissionHistory.activity_log.length - 1
                        }
                        isCompleted={true}
                      />
                    </Box>
                  )
                )}
              </Box>
            </Box>
          </Box>

          {selectedSubmissionHistory.activity_log.length === 0 && (
            <Box sx={styles.noHistoryContainer}>
              <AssignmentIcon sx={styles.noHistoryIcon} />
              <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                No Timeline History Available
              </Typography>
              <Typography variant="body2" color="text.secondary">
                This submission doesn't have any recorded activities yet.
              </Typography>
            </Box>
          )}
        </DialogContent>
      </Dialog>
    );
  };

  return (
    <>
      <TableContainer sx={styles.tableContainerStyles}>
        <Table stickyHeader sx={{ minWidth: 1000 }}>
          <TableHead>
            <TableRow>
              <TableCell align="left" sx={styles.columnStyles.id}>
                ID
              </TableCell>
              <TableCell sx={styles.columnStyles.referenceNumber}>
                REFERENCE NO.
              </TableCell>
              <TableCell sx={styles.columnStyles.position}>POSITION</TableCell>
              <TableCell sx={styles.columnStyles.employmentType}>
                EMPLOYMENT TYPE
              </TableCell>
              <TableCell sx={styles.columnStyles.status}>STATUS</TableCell>
              <TableCell sx={styles.columnStyles.dateCreated}>
                DATE CREATED
              </TableCell>
              <TableCell sx={styles.columnStyles.history} align="center">
                HISTORY
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoadingState ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={styles.loadingCell}>
                  <CircularProgress size={32} sx={styles.loadingSpinner} />
                </TableCell>
              </TableRow>
            ) : error ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={styles.errorCell}>
                  <Typography color="error">
                    Error loading data: {error.message || "Unknown error"}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : submissionsList && submissionsList.length > 0 ? (
              submissionsList.map((submission) => (
                <TableRow
                  key={submission.id}
                  onClick={() => handleRowClick && handleRowClick(submission)}
                  sx={styles.tableRowHover(theme)}>
                  <TableCell align="left" sx={styles.columnStyles.id}>
                    {submission.id}
                  </TableCell>
                  <TableCell
                    sx={{
                      ...styles.columnStyles.referenceNumber,
                      ...styles.cellContentStyles,
                      ...styles.referenceNumberCell,
                    }}>
                    {submission.reference_number || "N/A"}
                  </TableCell>
                  <TableCell
                    sx={{
                      ...styles.columnStyles.position,
                      ...styles.cellContentStyles,
                    }}>
                    {submission.position_title || "N/A"}
                  </TableCell>
                  <TableCell
                    sx={{
                      ...styles.columnStyles.employmentType,
                      ...styles.cellContentStyles,
                    }}>
                    {formatEmploymentType(submission.employment_type)}
                  </TableCell>
                  <TableCell sx={styles.columnStyles.status}>
                    {renderStatusChip(submission)}
                  </TableCell>
                  <TableCell
                    sx={{
                      ...styles.columnStyles.dateCreated,
                      ...styles.cellContentStyles,
                    }}>
                    {submission.created_at
                      ? dayjs(submission.created_at).format("MMM D, YYYY")
                      : "-"}
                  </TableCell>
                  <TableCell sx={styles.columnStyles.history} align="center">
                    <Tooltip title="Click here to view history">
                      <IconButton
                        size="small"
                        onClick={(e) => handleHistoryClick(submission, e)}
                        sx={styles.historyIconButton(theme)}>
                        <HistoryIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={7}
                  align="center"
                  sx={styles.noDataContainer}>
                  <Box sx={styles.noDataBox}>
                    {CONSTANT.BUTTONS.NODATA.icon}
                    <Typography variant="h6" color="text.secondary">
                      No form submissions found
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {searchQuery
                        ? `No results for "${searchQuery}"`
                        : "No submissions available"}
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <HistoryDialog />
    </>
  );
};

export default MRFMonitoringTable;
