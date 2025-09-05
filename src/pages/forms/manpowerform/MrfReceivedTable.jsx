import React, { useCallback, useMemo, useState } from "react";
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
  alpha,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemText,
  Divider,
  Paper,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import RefreshIcon from "@mui/icons-material/Refresh";
import CancelIcon from "@mui/icons-material/Cancel";
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
import dayjs from "dayjs";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import { CONSTANT } from "../../../config";
import { styles } from "./FormSubmissionStyles";

const MrfReceivedTable = ({
  submissionsList,
  isLoadingState,
  error,
  searchQuery,
  showArchived,
  handleRowClick,
  handleEditSubmission,
  handleMenuOpen,
  handleMenuClose,
  menuAnchor,
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
      pending: {
        color: "#f57c00",
        bgColor: "#fff8e1",
        label: "PENDING",
      },
      approved: {
        color: "#2e7d32",
        bgColor: "#e8f5e8",
        label: "RECEIVED",
      },
      received: {
        color: "#2e7d32",
        bgColor: "#e8f5e8",
        label: "RECEIVED",
      },
      rejected: {
        color: "#d32f2f",
        bgColor: "#ffebee",
        label: "REJECTED",
      },
      cancelled: {
        color: "#757575",
        bgColor: "#f5f5f5",
        label: "CANCELLED",
      },
      "for receiving": {
        color: "#1976d2",
        bgColor: "#e3f2fd",
        label: "FOR RECEIVING",
      },
      submitted: {
        color: "#1976d2",
        bgColor: "#e3f2fd",
        label: "SUBMITTED",
      },
      resubmitted: {
        color: "#ed6c02",
        bgColor: "#fff3e0",
        label: "RESUBMITTED",
      },
      returned: {
        color: "#d32f2f",
        bgColor: "#ffebee",
        label: "RETURNED",
      },
      "awaiting resubmission": {
        color: "#9c27b0",
        bgColor: "#f3e5f5",
        label: "AWAITING RESUBMISSION",
      },
      awaiting_resubmission: {
        color: "#9c27b0",
        bgColor: "#f3e5f5",
        label: "AWAITING RESUBMISSION",
      },
    };

    const status = submission.status?.toLowerCase();
    const config = statusConfig[status] || {
      color: "#757575",
      bgColor: "#f5f5f5",
      label: status?.toUpperCase() || "UNKNOWN",
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
    const eventType = (
      activity.event_type ||
      activity.status ||
      activity.action ||
      ""
    ).toLowerCase();
    const description = activity.details || activity.description;

    if ((eventType === "rejected" || eventType === "returned") && description) {
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

  const HistoryDialog = () => {
    if (!selectedSubmissionHistory || !selectedSubmissionHistory.activity_log) {
      return null;
    }

    const getStatusColor = (status) => {
      const statusColors = {
        pending: "#f57c00",
        "in progress": "#4CAF50",
        requested: "#4CAF50",
        approved: "#4CAF50",
        rejected: "#f44336",
        cancelled: "#9e9e9e",
        completed: "#4CAF50",
        upcoming: "#e0e0e0",
        submitted: "#4CAF50",
        printed: "#4CAF50",
        "item received": "#4CAF50",
        received: "#4CAF50",
        resubmitted: "#ff9800",
        returned: "#ff9800",
        "data updated": "#2196f3",
        hired: "#4CAF50",
      };
      return statusColors[status?.toLowerCase()] || "#4CAF50";
    };

    const getStatusIcon = (activity) => {
      const eventType = (
        activity.event_type ||
        activity.status ||
        activity.action ||
        "PENDING"
      ).toLowerCase();

      let IconComponent;
      switch (eventType) {
        case "hired":
          IconComponent = BadgeIcon;
          break;
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
        activity.event_type || activity.status || activity.action
      );

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
                <Typography
                  variant="h6"
                  sx={styles.timelineEventType(activity)}>
                  {activity.event_type ||
                    activity.status ||
                    activity.action ||
                    "PENDING"}
                </Typography>

                {(activity.details || activity.description) && (
                  <Typography variant="body2" sx={styles.timelineDescription}>
                    {formatDescription(activity)}
                  </Typography>
                )}

                <Typography variant="body2" sx={styles.timelineTimestamp}>
                  {activity.timestamp
                    ? dayjs(activity.timestamp).format("MMM D, YYYY • h:mm A")
                    : activity.created_at
                    ? dayjs(activity.created_at).format("MMM D, YYYY • h:mm A")
                    : ""}
                </Typography>

                {activity.vladmir_tag && (
                  <Typography variant="caption" sx={styles.timelineVladmirTag}>
                    Vladimir Tag: {activity.vladmir_tag}
                  </Typography>
                )}
              </Box>

              <Box sx={styles.timelineActorInfo}>
                <Typography variant="body1" sx={styles.timelineActorName}>
                  {activity.full_name ||
                    (activity.actor
                      ? activity.actor.full_name
                      : activity.user
                      ? `${activity.user.last_name}, ${activity.user.first_name}`
                      : "") ||
                    "System"}
                </Typography>

                {(activity.actor?.title ||
                  activity.actor?.position ||
                  activity.user?.position ||
                  activity.title) && (
                  <Typography
                    variant="caption"
                    sx={styles.timelineActorPosition}>
                    {activity.actor?.title ||
                      activity.actor?.position ||
                      activity.user?.position ||
                      activity.title}
                  </Typography>
                )}
              </Box>
            </Box>
          </Paper>
        </Box>
      );
    };

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
                ACTIVITY LOGS - RECEIVED
                <ReceiptIcon sx={styles.historyTimelineIcon} />
              </Typography>
              <Box sx={styles.historyInfoContainer}>
                <Box sx={styles.historyInfoBox}>
                  <Typography variant="h6" sx={styles.historyInfoTitle}>
                    Form Name
                  </Typography>
                  <Typography variant="body1" sx={styles.historyInfoText}>
                    {selectedSubmissionHistory?.form?.name || "N/A"}
                  </Typography>
                </Box>

                <Box sx={styles.historyInfoBox}>
                  <Typography variant="h6" sx={styles.historyInfoTitle}>
                    Position
                  </Typography>
                  <Typography variant="body1" sx={styles.historyInfoText}>
                    {selectedSubmissionHistory?.submittable?.position?.title
                      ?.name || "N/A"}
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
                      key={index}
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
              <TableCell sx={styles.columnStyles.formName}>FORM NAME</TableCell>
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
                <TableCell colSpan={8} align="center" sx={styles.loadingCell}>
                  <CircularProgress size={32} sx={styles.loadingSpinner} />
                </TableCell>
              </TableRow>
            ) : error ? (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={styles.errorCell}>
                  <Typography color="error">
                    Error loading data: {error.message || "Unknown error"}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : submissionsList.length > 0 ? (
              submissionsList.map((submission) => (
                <TableRow
                  key={submission.id}
                  onClick={() => handleRowClick(submission)}
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
                    {submission.submittable?.reference_number || "N/A"}
                  </TableCell>
                  <TableCell
                    sx={{
                      ...styles.columnStyles.formName,
                      ...styles.cellContentStyles,
                      ...styles.formNameCell,
                    }}>
                    {submission.form?.name || "N/A"}
                  </TableCell>
                  <TableCell
                    sx={{
                      ...styles.columnStyles.position,
                      ...styles.cellContentStyles,
                    }}>
                    {submission.submittable?.position?.title?.name || "N/A"}
                  </TableCell>
                  <TableCell
                    sx={{
                      ...styles.columnStyles.employmentType,
                      ...styles.cellContentStyles,
                    }}>
                    {formatEmploymentType(
                      submission.submittable?.employment_type
                    )}
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
                  colSpan={8}
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
                        : showArchived
                        ? "No archived submissions"
                        : "No submissions yet"}
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

export default MrfReceivedTable;
