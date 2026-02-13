import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Box,
  IconButton,
  Chip,
  Tooltip,
  Skeleton,
  useTheme,
} from "@mui/material";
import RestoreIcon from "@mui/icons-material/Restore";
import dayjs from "dayjs";
import { styles } from "../../forms/manpowerform/FormSubmissionStyles";
import NoDataFound from "../../NoDataFound";
import ActivityHistoryDialog from "../../zzzreusable/ActivityHistoryDialog";

const MDAMonitoringTable = ({
  submissionsList,
  isLoadingState,
  error,
  handleRowClick,
  searchQuery,
  statusFilter,
  showRequestor = false,
}) => {
  const theme = useTheme();
  const [historyDialogOpen, setHistoryDialogOpen] = React.useState(false);
  const [selectedMdaHistory, setSelectedMdaHistory] = React.useState(null);

  const renderEmployee = (submission) => {
    if (!submission?.employee_name) return "-";
    return (
      <Box>
        <Typography variant="body2" sx={{ fontWeight: 600, fontSize: "16px" }}>
          {submission.employee_name}
        </Typography>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ fontSize: "14px" }}>
          {submission.employee_number || ""}
        </Typography>
      </Box>
    );
  };

  const getRequestor = (submission) => {
    if (!submission?.activity_log || submission.activity_log.length === 0) {
      return "-";
    }

    const requestorLog = submission.activity_log.find(
      (log) => log?.actor?.title === "Requestor",
    );

    if (!requestorLog?.actor?.full_name) {
      return "-";
    }

    return (
      <Typography variant="body2" sx={{ fontWeight: 600, fontSize: "16px" }}>
        {requestorLog.actor.full_name}
      </Typography>
    );
  };

  const renderStatusChip = (submission) => {
    const statusConfig = {
      pending: {
        color: "#f57c00",
        bgColor: "#fff8e1",
        label: "PENDING",
      },
      approved: {
        color: "#2e7d32",
        bgColor: "#e8f5e8",
        label: "APPROVED",
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
      returned: {
        color: "#d32f2f",
        bgColor: "#ffebee",
        label: "RETURNED",
      },
      awaiting_resubmission: {
        color: "#ed6c02",
        bgColor: "#fff4e5",
        label: "AWAITING RESUBMISSION",
      },
      "awaiting resubmission": {
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
  };

  const handleViewActivityClick = (e, submission) => {
    e.stopPropagation();
    setSelectedMdaHistory(submission);
    setHistoryDialogOpen(true);
  };

  const handleHistoryDialogClose = () => {
    setHistoryDialogOpen(false);
    setSelectedMdaHistory(null);
  };

  const renderActivityLog = (submission) => {
    return (
      <Tooltip title="View History" arrow>
        <IconButton
          onClick={(e) => handleViewActivityClick(e, submission)}
          size="small"
          sx={styles.historyIconButton(theme)}>
          <RestoreIcon sx={{ fontSize: "20px" }} />
        </IconButton>
      </Tooltip>
    );
  };

  const filteredSubmissions = React.useMemo(() => {
    if (!statusFilter) return submissionsList;

    const normalizedFilter = statusFilter.toUpperCase().replace(/_/g, " ");

    return submissionsList.filter((submission) => {
      const submissionStatus = submission.status
        ?.toUpperCase()
        .replace(/_/g, " ");
      return submissionStatus === normalizedFilter;
    });
  }, [submissionsList, statusFilter]);

  const getNoDataMessage = () => {
    if (statusFilter) {
      const statusLabels = {
        PENDING: "pending",
        APPROVED: "approved",
        REJECTED: "rejected",
        AWAITING_RESUBMISSION: "awaiting resubmission",
        "AWAITING RESUBMISSION": "awaiting resubmission",
        CANCELLED: "cancelled",
      };
      const statusLabel =
        statusLabels[statusFilter] || statusFilter.toLowerCase();
      return searchQuery
        ? `No ${statusLabel} submissions found for "${searchQuery}"`
        : `No ${statusLabel} submissions found`;
    }
    return searchQuery
      ? `No results for "${searchQuery}"`
      : "No submissions found";
  };

  const colSpan = 8;

  return (
    <>
      <TableContainer sx={styles.tableContainerStyles}>
        <Table
          stickyHeader
          sx={{
            minWidth: 1200,
            height: filteredSubmissions.length === 0 ? "100%" : "auto",
          }}>
          <TableHead>
            <TableRow>
              <TableCell sx={styles.columnStyles.id}>REQUESTOR</TableCell>
              <TableCell sx={styles.columnStyles.referenceNumber}>
                REFERENCE NO.
              </TableCell>
              <TableCell sx={styles.columnStyles.formName}>
                MOVEMENT TYPE
              </TableCell>
              <TableCell sx={styles.columnStyles.position}>EMPLOYEE</TableCell>
              <TableCell sx={styles.columnStyles.status}>STATUS</TableCell>
              <TableCell sx={styles.columnStyles.dateCreated}>
                EFFECTIVE DATE
              </TableCell>
              <TableCell align="center" sx={styles.columnStyles.history}>
                HISTORY
              </TableCell>
              <TableCell sx={styles.columnStyles.dateCreated}>
                DATE SUBMITTED
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody
            sx={{
              height: filteredSubmissions.length === 0 ? "100%" : "auto",
            }}>
            {isLoadingState ? (
              <>
                {[...Array(5)].map((_, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <Skeleton animation="wave" height={30} />
                    </TableCell>
                    <TableCell>
                      <Skeleton animation="wave" height={30} />
                    </TableCell>
                    <TableCell>
                      <Skeleton animation="wave" height={30} />
                    </TableCell>
                    <TableCell>
                      <Skeleton animation="wave" height={30} />
                      <Skeleton animation="wave" height={20} width="60%" />
                    </TableCell>
                    <TableCell>
                      <Skeleton
                        animation="wave"
                        height={24}
                        width={120}
                        sx={{ borderRadius: "12px" }}
                      />
                    </TableCell>
                    <TableCell>
                      <Skeleton animation="wave" height={30} />
                    </TableCell>
                    <TableCell align="center">
                      <Skeleton
                        animation="wave"
                        variant="circular"
                        width={32}
                        height={32}
                        sx={{ margin: "0 auto" }}
                      />
                    </TableCell>
                    <TableCell>
                      <Skeleton animation="wave" height={30} />
                    </TableCell>
                  </TableRow>
                ))}
              </>
            ) : error ? (
              <TableRow sx={{ height: "100%" }}>
                <TableCell
                  colSpan={colSpan}
                  align="center"
                  sx={{ py: 4, height: "100%", verticalAlign: "middle" }}>
                  <Typography color="error">
                    Error loading data: {error.message || "Unknown error"}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : filteredSubmissions.length > 0 ? (
              filteredSubmissions.map((submission) => {
                return (
                  <TableRow
                    key={submission.id}
                    onClick={() => handleRowClick(submission)}
                    sx={styles.tableRowHover(theme)}>
                    <TableCell
                      sx={{
                        ...styles.columnStyles.id,
                        ...styles.cellContentStyles,
                      }}>
                      {getRequestor(submission)}
                    </TableCell>
                    <TableCell
                      sx={{
                        ...styles.columnStyles.referenceNumber,
                        ...styles.cellContentStyles,
                        ...styles.referenceNumberCell,
                      }}>
                      {submission.reference_number || "-"}
                    </TableCell>
                    <TableCell
                      sx={{
                        ...styles.columnStyles.formName,
                        ...styles.cellContentStyles,
                      }}>
                      {submission.movement_type || "-"}
                    </TableCell>
                    <TableCell
                      sx={{
                        ...styles.columnStyles.position,
                        ...styles.cellContentStyles,
                      }}>
                      {renderEmployee(submission)}
                    </TableCell>
                    <TableCell sx={styles.columnStyles.status}>
                      {renderStatusChip(submission)}
                    </TableCell>
                    <TableCell
                      sx={{
                        ...styles.columnStyles.dateCreated,
                        ...styles.cellContentStyles,
                      }}>
                      {submission.effective_date
                        ? dayjs(submission.effective_date).format("MMM D, YYYY")
                        : "-"}
                    </TableCell>
                    <TableCell align="center" sx={styles.columnStyles.history}>
                      {renderActivityLog(submission)}
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
                  </TableRow>
                );
              })
            ) : (
              <TableRow
                sx={{
                  height: "100%",
                  pointerEvents: "none",
                  "&:hover": {
                    backgroundColor: "transparent !important",
                    cursor: "default !important",
                  },
                }}>
                <TableCell
                  colSpan={999}
                  rowSpan={999}
                  align="center"
                  sx={{
                    height: "100%",
                    verticalAlign: "middle",
                    border: "none",
                    borderBottom: "none",
                    padding: 0,
                    pointerEvents: "none",
                    "&:hover": {
                      backgroundColor: "transparent !important",
                      cursor: "default !important",
                    },
                  }}>
                  <Box
                    sx={{
                      position: "fixed",
                      left: "62%",
                      top: "64%",
                      transform: "translate(-50%, -50%)",
                      zIndex: 1,
                    }}>
                    <NoDataFound message="" subMessage={getNoDataMessage()} />
                  </Box>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <ActivityHistoryDialog
        open={historyDialogOpen}
        onClose={handleHistoryDialogClose}
        data={selectedMdaHistory}
        type="datachange"
        title="Activity Logs"
      />
    </>
  );
};

export default MDAMonitoringTable;
