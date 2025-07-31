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
  alpha,
  Dialog,
  DialogContent,
  Button,
  Paper,
  TablePagination,
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
import PendingIcon from "@mui/icons-material/Pending";
import dayjs from "dayjs";

const PendingRegistrationTable = ({
  pendingList = [],
  isLoadingState,
  error,
  searchQuery,
  handleRowClick,
  handleEditSubmission,
  handleActionClick,
  // Pagination props
  paginationData,
  onPageChange,
  onRowsPerPageChange,
}) => {
  const theme = useTheme();
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false);
  const [selectedRegistrationHistory, setSelectedRegistrationHistory] =
    useState(null);

  const handleHistoryClick = (registration, event) => {
    event.stopPropagation();
    setSelectedRegistrationHistory(registration);
    setHistoryDialogOpen(true);
  };

  const handleHistoryDialogClose = () => {
    setHistoryDialogOpen(false);
    setSelectedRegistrationHistory(null);
  };

  const renderStatusChip = useCallback((registration) => {
    const statusConfig = {
      pending: {
        color: "#f57c00",
        bgColor: "#fff8e1",
        label: "PENDING",
      },
      "awaiting resubmission": {
        color: "#4c00ffff",
        bgColor: "#f0f1ffff",
        label: "AWAITING RESUBMISSION",
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
      rejected: {
        color: "#d32f2f",
        bgColor: "#ffebee",
        label: "REJECTED",
      },
      returned: {
        color: "#d32f2f",
        bgColor: "#ffebee",
        label: "RETURNED",
      },
      approved: {
        color: "#2e7d32",
        bgColor: "#e8f5e8",
        label: "APPROVED",
      },
    };

    const status = registration?.status?.toLowerCase();
    const config = statusConfig[status] || {
      color: "#f57c00",
      bgColor: "#fff8e1",
      label: registration?.status?.toUpperCase() || "PENDING",
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

  const renderEmploymentTypeChip = useCallback((employmentTypes) => {
    if (
      !employmentTypes ||
      !Array.isArray(employmentTypes) ||
      employmentTypes.length === 0
    ) {
      return (
        <Chip
          label="N/A"
          size="small"
          sx={{
            backgroundColor: "#f5f5f5",
            color: "#666",
            fontWeight: 500,
            fontSize: "11px",
            height: "24px",
            borderRadius: "12px",
          }}
        />
      );
    }

    const employmentType = employmentTypes[0]?.employment_type_label;
    const label = employmentType?.toUpperCase() || "N/A";

    // Color coding for different employment types
    const getTypeConfig = (type) => {
      const typeConfigs = {
        "FULL-TIME": { color: "#2e7d32", bgColor: "#e8f5e8" },
        "PART-TIME": { color: "#1976d2", bgColor: "#e3f2fd" },
        CONTRACT: { color: "#f57c00", bgColor: "#fff8e1" },
        TEMPORARY: { color: "#9c27b0", bgColor: "#f3e5f5" },
        INTERN: { color: "#ff9800", bgColor: "#fff3e0" },
      };

      return typeConfigs[type] || { color: "#666", bgColor: "#f5f5f5" };
    };

    const config = getTypeConfig(label);

    return (
      <Chip
        label={label}
        size="small"
        sx={{
          backgroundColor: config.bgColor,
          color: config.color,
          border: `1px solid ${config.color}`,
          fontWeight: 500,
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

  const renderEmploymentType = useCallback((employmentTypes) => {
    if (
      !employmentTypes ||
      !Array.isArray(employmentTypes) ||
      employmentTypes.length === 0
    ) {
      return "N/A";
    }

    const employmentType = employmentTypes[0]?.employment_type_label;
    return employmentType?.toUpperCase() || "N/A";
  }, []);

  const getActionMenuItems = useCallback(
    (registration) => {
      const items = [];
      const status = registration?.status?.toLowerCase();

      if (
        status === "rejected" ||
        status === "returned" ||
        status === "awaiting resubmission"
      ) {
        items.push({
          label: "Edit",
          icon: <EditIcon fontSize="small" />,
          onClick: () => handleEditSubmission?.(registration),
          color: "primary",
        });
      }

      if (
        status === "rejected" ||
        status === "returned" ||
        status === "awaiting resubmission"
      ) {
        items.push({
          label: "Resubmit",
          icon: <RefreshIcon fontSize="small" />,
          onClick: (e) => handleActionClick?.(registration, "resubmit", e),
          color: "success",
        });
      }

      if (status === "pending" || status === "submitted") {
        items.push({
          label: "Cancel",
          icon: <CancelIcon fontSize="small" />,
          onClick: (e) => handleActionClick?.(registration, "cancel", e),
          color: "warning",
        });
      }

      return items;
    },
    [handleEditSubmission, handleActionClick]
  );

  // Updated table container styles with better header handling
  const tableContainerStyles = {
    flex: 1,
    overflow: "auto",
    backgroundColor: "#fafafa",
    maxHeight: "calc(100vh - 300px)", // Account for pagination
    "& .MuiTable-root": {
      minWidth: 950,
    },
    "& .MuiTableHead-root": {
      position: "sticky",
      top: 0,
      zIndex: 10,
    },
    "& .MuiTableCell-head": {
      backgroundColor: "#f8f9fa !important", // Force background color
      fontWeight: 700,
      fontSize: "18px",
      color: "rgb(33, 61, 112)",
      textTransform: "uppercase",
      letterSpacing: "0.5px",
      borderBottom: "2px solid #e0e0e0",
      height: "48px",
      padding: "8px 16px",
      position: "sticky",
      top: 0,
      zIndex: 11,
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
    employeeName: { width: "300px", minWidth: "300px" },
    position: { width: "300px", minWidth: "300px" },
    status: { width: "150px", minWidth: "150px" },
    dateCreated: { width: "130px", minWidth: "130px" },
    history: { width: "80px", minWidth: "80px" },
  };

  const cellContentStyles = {
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  };

  const formatDescription = (activity) => {
    const eventType = (
      activity?.event_type ||
      activity?.status ||
      activity?.action ||
      ""
    ).toLowerCase();
    const description = activity?.description;

    if ((eventType === "rejected" || eventType === "returned") && description) {
      return (
        <Box>
          <span style={{ color: "#d32f2f" }}>Reason: {description}</span>
        </Box>
      );
    }

    return description;
  };

  // Helper function to get proper full name
  const getFullName = (user) => {
    // First priority: use full_name if it exists and is not null/empty
    if (user?.full_name && user.full_name.trim() !== "") {
      return user.full_name;
    }

    // Second priority: construct from first_name and last_name
    const firstName = user?.first_name || "";
    const lastName = user?.last_name || "";

    if (firstName || lastName) {
      return `${firstName} ${lastName}`.trim();
    }

    // Fallback: use username or return N/A
    return user?.username || "N/A";
  };

  const HistoryDialog = () => {
    if (
      !selectedRegistrationHistory ||
      !selectedRegistrationHistory.activity_log ||
      !Array.isArray(selectedRegistrationHistory.activity_log)
    ) {
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
                    {formatDescription(activity)}
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
                  sx={{
                    color: "#333",
                    fontWeight: 600,
                    fontSize: "14px",
                  }}>
                  {getFullName(activity?.actor) || "System"}
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
                  Full Name
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    color: "#666",
                    fontSize: "16px",
                  }}>
                  {getFullName(selectedRegistrationHistory?.requested_by)}
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
                  sx={{
                    color: "#666",
                    fontSize: "16px",
                  }}>
                  {selectedRegistrationHistory?.charging?.code ||
                    selectedRegistrationHistory?.charging?.unit_name ||
                    "N/A"}
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
                  {selectedRegistrationHistory?.created_at
                    ? dayjs(selectedRegistrationHistory.created_at).format(
                        "MMM D, YYYY"
                      )
                    : "N/A"}
                </Typography>
              </Box>
            </Box>

            <Box sx={{ pl: 2 }}>
              {selectedRegistrationHistory.activity_log.map(
                (activity, index) => (
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
                )
              )}
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

  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}>
      <TableContainer sx={tableContainerStyles}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell align="left" sx={columnStyles.id}>
                ID
              </TableCell>
              <TableCell sx={columnStyles.employeeName}>FULL NAME</TableCell>
              <TableCell sx={columnStyles.position}>EMPLOYEE CODE</TableCell>
              <TableCell sx={columnStyles.status}>STATUS</TableCell>
              <TableCell sx={columnStyles.dateCreated}>DATE CREATED</TableCell>
              <TableCell sx={columnStyles.history} align="center">
                HISTORY
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoadingState ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                  <CircularProgress
                    size={32}
                    sx={{ color: "rgb(33, 61, 112)" }}
                  />
                </TableCell>
              </TableRow>
            ) : error ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                  <Typography color="error">
                    Error loading data: {error?.message || "Unknown error"}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : Array.isArray(pendingList) && pendingList.length > 0 ? (
              pendingList.map((registration) => (
                <TableRow
                  key={registration?.id}
                  onClick={() => handleRowClick?.(registration)}
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
                    {registration?.id}
                  </TableCell>
                  <TableCell
                    sx={{
                      ...columnStyles.employeeName,
                      ...cellContentStyles,
                      fontWeight: 600,
                    }}>
                    {getFullName(registration?.requested_by)}
                  </TableCell>
                  <TableCell
                    sx={{ ...columnStyles.position, ...cellContentStyles }}>
                    {registration?.charging?.code || registration?.id
                      ? `EMP-${registration.id}`
                      : "N/A"}
                  </TableCell>
                  <TableCell sx={columnStyles.status}>
                    {renderStatusChip(registration)}
                  </TableCell>
                  <TableCell
                    sx={{ ...columnStyles.dateCreated, ...cellContentStyles }}>
                    {registration?.created_at
                      ? dayjs(registration.created_at).format("MMM D, YYYY")
                      : "-"}
                  </TableCell>
                  <TableCell sx={columnStyles.history} align="center">
                    <Tooltip title="Click here to view history">
                      <IconButton
                        size="small"
                        onClick={(e) => handleHistoryClick(registration, e)}
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
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={6}
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
                    <PendingIcon sx={{ fontSize: 64, color: "#ccc" }} />
                    <Typography variant="h6" color="text.secondary">
                      No pending registrations found
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {searchQuery
                        ? `No results for "${searchQuery}"`
                        : "No pending registrations at the moment"}
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination Component */}
      {paginationData && (
        <TablePagination
          component="div"
          count={paginationData.total || 0}
          page={(paginationData.current_page || 1) - 1} // MUI uses 0-based indexing
          onPageChange={(event, newPage) => onPageChange?.(newPage + 1)} // Convert back to 1-based
          rowsPerPage={paginationData.per_page || 10}
          onRowsPerPageChange={(event) =>
            onRowsPerPageChange?.(parseInt(event.target.value, 10))
          }
          rowsPerPageOptions={[5, 10, 25, 50, 100]}
          sx={{
            backgroundColor: "#f8f9fa",
            borderTop: "1px solid #e0e0e0",
            "& .MuiTablePagination-toolbar": {
              minHeight: "52px",
            },
            "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows":
              {
                fontSize: "14px",
                fontWeight: 500,
                color: "rgb(33, 61, 112)",
              },
            "& .MuiTablePagination-select": {
              fontSize: "14px",
              fontWeight: 500,
            },
            "& .MuiIconButton-root": {
              color: "rgb(33, 61, 112)",
              "&:hover": {
                backgroundColor: alpha(theme.palette.primary.main, 0.1),
              },
            },
          }}
        />
      )}

      <HistoryDialog />
    </Box>
  );
};

export default PendingRegistrationTable;
