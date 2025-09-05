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
  Menu,
  MenuItem,
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
import MoreVertIcon from "@mui/icons-material/MoreVert";
import BadgeIcon from "@mui/icons-material/Badge";
import dayjs from "dayjs";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import { CONSTANT } from "../../../config";

const MrfForreceivingTable = ({
  submissionsList,
  isLoadingState,
  error,
  searchQuery,
  showArchived,
  handleRowClick,
  handleEditSubmission,
  handleActionClick,
  handleMenuOpen,
  handleMenuClose,
  menuAnchor,
  onCancel,
  canResubmitSubmission,
  canEditSubmission,
  canCancelSubmission,
}) => {
  const theme = useTheme();
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false);
  const [selectedSubmissionHistory, setSelectedSubmissionHistory] =
    useState(null);
  const [actionMenuAnchor, setActionMenuAnchor] = useState(null);
  const [selectedSubmissionForAction, setSelectedSubmissionForAction] =
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

  const handleActionMenuClick = (submission, event) => {
    event.stopPropagation();
    setActionMenuAnchor(event.currentTarget);
    setSelectedSubmissionForAction(submission);
  };

  const handleActionMenuClose = () => {
    setActionMenuAnchor(null);
    setSelectedSubmissionForAction(null);
  };

  const handleCancelRequest = (submission) => {
    if (onCancel && submission) {
      onCancel(submission.id);
    }
    handleActionMenuClose();
  };

  const handleResubmitRequest = (submission) => {
    if (handleActionClick && submission) {
      handleActionClick(submission, "resubmit");
    }
    handleActionMenuClose();
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
      <Chip
        label={config.label}
        size="small"
        sx={{
          backgroundColor: config.bgColor,
          color: config.color,
          border: `1px solid ${config.color}`,
          fontWeight: 600,
          fontSize: "11px",
          height: "24px",
          borderRadius: "12px",
          "& .MuiChip-label": {
            padding: "0 8px",
          },
        }}
      />
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

  const tableContainerStyles = {
    flex: 1,
    overflow: "auto",
    backgroundColor: "#fafafa",
    "& .MuiTableCell-head": {
      backgroundColor: "#f8f9fa",
      fontWeight: 700,
      fontSize: "18px",
      color: "rgb(33, 61, 112)",
      textTransform: "uppercase",
      letterSpacing: "0.5px",
      borderBottom: "2px solid #e0e0e0",
      position: "sticky",
      top: 0,
      zIndex: 10,
      height: "48px",
      padding: "8px 16px",
    },
    "& .MuiTableCell-body": {
      fontSize: "16px",
      color: "#333",
      borderBottom: "1px solid #f0f0f0",
      padding: "8px 16px",
      height: "52px",
      backgroundColor: "white",
    },
    "& .MuiTableRow-root": {
      transition: "background-color 0.2s ease-in-out",
      "&:hover": {
        backgroundColor: "#f8f9fa",
        cursor: "pointer",
        "& .MuiTableCell-root": {
          backgroundColor: "transparent",
        },
      },
    },
  };

  const columnStyles = {
    id: { width: "60px", minWidth: "60px" },
    formName: { width: "200px", minWidth: "200px" },
    position: { width: "250px", minWidth: "250px" },
    employmentType: { width: "150px", minWidth: "150px" },
    status: { width: "150px", minWidth: "150px" },
    dateCreated: { width: "130px", minWidth: "130px" },
    history: { width: "80px", minWidth: "80px" },
    actions: { width: "80px", minWidth: "80px" },
  };

  const cellContentStyles = {
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  };

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
          <span style={{ color: "#d32f2f" }}>Reason: {description}</span>
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
                      activity.event_type ||
                      activity.status ||
                      activity.action ||
                      ""
                    ).toLowerCase() === "rejected" ||
                    (
                      activity.event_type ||
                      activity.status ||
                      activity.action ||
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
                    activity.event_type ||
                    activity.status ||
                    activity.action ||
                    ""
                  ).toLowerCase() === "rejected" ||
                  (
                    activity.event_type ||
                    activity.status ||
                    activity.action ||
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
              "&:hover": {
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              },
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
                        activity.event_type ||
                        activity.status ||
                        activity.action ||
                        ""
                      ).toLowerCase() === "rejected" ||
                      (
                        activity.event_type ||
                        activity.status ||
                        activity.action ||
                        ""
                      ).toLowerCase() === "returned"
                        ? "#d32f2f"
                        : "rgb(33, 61, 112)",
                    fontSize: "16px",
                    textTransform: "uppercase",
                    mb: 1,
                  }}>
                  {activity.event_type ||
                    activity.status ||
                    activity.action ||
                    "PENDING"}
                </Typography>

                {(activity.details || activity.description) && (
                  <Typography variant="body2" sx={{ color: "#666", mb: 1 }}>
                    {formatDescription(activity)}
                  </Typography>
                )}

                <Typography
                  variant="body2"
                  sx={{ color: "#999", fontSize: "13px" }}>
                  {activity.timestamp
                    ? dayjs(activity.timestamp).format("MMM D, YYYY • h:mm A")
                    : activity.created_at
                    ? dayjs(activity.created_at).format("MMM D, YYYY • h:mm A")
                    : ""}
                </Typography>

                {activity.vladmir_tag && (
                  <Typography
                    variant="caption"
                    sx={{
                      color: "#666",
                      display: "block",
                      mt: 0.5,
                      fontFamily: "monospace",
                    }}>
                    Vladimir Tag: {activity.vladmir_tag}
                  </Typography>
                )}
              </Box>

              <Box sx={{ textAlign: "right" }}>
                <Typography
                  variant="body1"
                  sx={{
                    color: "#333",
                    fontWeight: 600,
                    fontSize: "14px",
                  }}>
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
                    sx={{
                      color: "rgb(33, 61, 112)",
                      display: "block",
                      fontSize: "14px",
                      fontWeight: 500,
                      mt: 0.5,
                    }}>
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
          sx: {
            borderRadius: 3,
            minHeight: "600px",
            maxHeight: "90vh",
          },
        }}>
        <DialogContent
          sx={{ px: 4, py: 4, backgroundColor: "white", position: "relative" }}>
          <Tooltip title="Close">
            <IconButton
              onClick={handleHistoryDialogClose}
              sx={{
                position: "absolute",
                right: 16,
                top: 16,
                color: "rgb(33, 61, 112)",
                "&:hover": {
                  backgroundColor: "#f5f5f5",
                },
              }}>
              <CloseIcon />
            </IconButton>
          </Tooltip>

          <Box sx={{ mb: 4 }}>
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
                    backgroundColor: " #FF4500",
                    borderRadius: 1,
                    mr: 2,
                  }}
                />
                ACTIVITY LOGS
                <TimelineIcon
                  sx={{
                    color: "#FF4500",
                    fontSize: 24,
                    ml: 0.5,
                  }}
                />
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
                    Form Name
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      color: "#666",
                      fontSize: "16px",
                    }}>
                    {selectedSubmissionHistory?.form?.name || "N/A"}
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
                    Position
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      color: "#666",
                      fontSize: "16px",
                    }}>
                    {selectedSubmissionHistory?.submittable?.position?.title
                      ?.name || "N/A"}
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
                    sx={{
                      color: "#666",
                      fontSize: "16px",
                    }}>
                    {selectedSubmissionHistory?.created_at
                      ? dayjs(selectedSubmissionHistory.created_at).format(
                          "MMM D, YYYY"
                        )
                      : "N/A"}
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ pl: 2 }}>
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
            <Box sx={{ textAlign: "center", py: 8 }}>
              <AssignmentIcon sx={{ fontSize: 64, color: "#ccc", mb: 2 }} />
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
      <TableContainer sx={tableContainerStyles}>
        <Table stickyHeader sx={{ minWidth: 1000 }}>
          <TableHead>
            <TableRow>
              <TableCell align="left" sx={columnStyles.id}>
                ID
              </TableCell>
              <TableCell sx={columnStyles.formName}>FORM NAME</TableCell>
              <TableCell sx={columnStyles.position}>POSITION</TableCell>
              <TableCell sx={columnStyles.employmentType}>
                EMPLOYMENT TYPE
              </TableCell>
              <TableCell sx={columnStyles.status}>STATUS</TableCell>
              <TableCell sx={columnStyles.dateCreated}>DATE CREATED</TableCell>
              <TableCell sx={columnStyles.history} align="center">
                HISTORY
              </TableCell>
              <TableCell sx={columnStyles.actions} align="center">
                ACTIONS
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoadingState ? (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                  <CircularProgress
                    size={32}
                    sx={{ color: "rgb(33, 61, 112)" }}
                  />
                </TableCell>
              </TableRow>
            ) : error ? (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
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
                  sx={{
                    cursor: "pointer",
                    "&:hover": {
                      backgroundColor: alpha(theme.palette.primary.main, 0.04),
                      "& .MuiTableCell-root": {
                        backgroundColor: "transparent",
                      },
                    },
                    transition: "background-color 0.2s ease",
                  }}>
                  <TableCell align="left" sx={columnStyles.id}>
                    {submission.id}
                  </TableCell>
                  <TableCell
                    sx={{
                      ...columnStyles.formName,
                      ...cellContentStyles,
                      fontWeight: 600,
                    }}>
                    {submission.form?.name || "N/A"}
                  </TableCell>
                  <TableCell
                    sx={{ ...columnStyles.position, ...cellContentStyles }}>
                    {submission.submittable?.position?.title?.name || "N/A"}
                  </TableCell>
                  <TableCell
                    sx={{
                      ...columnStyles.employmentType,
                      ...cellContentStyles,
                    }}>
                    {formatEmploymentType(
                      submission.submittable?.employment_type
                    )}
                  </TableCell>
                  <TableCell sx={columnStyles.status}>
                    {renderStatusChip(submission)}
                  </TableCell>
                  <TableCell
                    sx={{ ...columnStyles.dateCreated, ...cellContentStyles }}>
                    {submission.created_at
                      ? dayjs(submission.created_at).format("MMM D, YYYY")
                      : "-"}
                  </TableCell>
                  <TableCell sx={columnStyles.history} align="center">
                    <Tooltip title="Click here to view history">
                      <IconButton
                        size="small"
                        onClick={(e) => handleHistoryClick(submission, e)}
                        sx={{
                          color: "rgb(33, 61, 112)",
                          "&:hover": {
                            backgroundColor: alpha(
                              theme.palette.primary.main,
                              0.1
                            ),
                          },
                        }}>
                        <HistoryIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                  <TableCell sx={columnStyles.actions} align="center">
                    <Tooltip title="Actions">
                      <IconButton
                        size="small"
                        onClick={(e) => handleActionMenuClick(submission, e)}
                        sx={{
                          color: "rgb(33, 61, 112)",
                          "&:hover": {
                            backgroundColor: alpha(
                              theme.palette.primary.main,
                              0.1
                            ),
                          },
                        }}>
                        <MoreVertIcon fontSize="small" />
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
                  sx={{
                    py: 8,
                    borderBottom: "none",
                    color: "#666",
                    fontSize: "16px",
                  }}>
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 2,
                    }}>
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

      <Menu
        anchorEl={actionMenuAnchor}
        open={Boolean(actionMenuAnchor)}
        onClose={handleActionMenuClose}
        PaperProps={{
          sx: {
            minWidth: 150,
            "& .MuiMenuItem-root": {
              fontSize: "14px",
              padding: "8px 16px",
              "&:hover": {
                backgroundColor: alpha(theme.palette.primary.main, 0.08),
              },
            },
          },
        }}>
        {selectedSubmissionForAction &&
          canResubmitSubmission &&
          canResubmitSubmission(selectedSubmissionForAction) && (
            <MenuItem
              onClick={() => handleResubmitRequest(selectedSubmissionForAction)}
              sx={{
                color: "#ed6c02",
                "&:hover": {
                  backgroundColor: alpha("#ed6c02", 0.08),
                },
              }}>
              <RefreshIcon sx={{ mr: 1, fontSize: 16 }} />
              Resubmit
            </MenuItem>
          )}
        <MenuItem
          onClick={() => handleCancelRequest(selectedSubmissionForAction)}
          disabled={
            !selectedSubmissionForAction ||
            !canCancelSubmission ||
            !canCancelSubmission(selectedSubmissionForAction)
          }
          sx={{
            color:
              selectedSubmissionForAction &&
              canCancelSubmission &&
              canCancelSubmission(selectedSubmissionForAction)
                ? "#d32f2f"
                : "rgba(0, 0, 0, 0.26)",
            "&:hover": {
              backgroundColor:
                selectedSubmissionForAction &&
                canCancelSubmission &&
                canCancelSubmission(selectedSubmissionForAction)
                  ? alpha("#d32f2f", 0.08)
                  : "transparent",
            },
          }}>
          <CancelIcon sx={{ mr: 1, fontSize: 16 }} />
          Cancel Request
        </MenuItem>
      </Menu>

      <HistoryDialog />
    </>
  );
};

export default MrfForreceivingTable;
