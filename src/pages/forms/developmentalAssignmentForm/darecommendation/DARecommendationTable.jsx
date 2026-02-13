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
import { styles } from "../../manpowerform/FormSubmissionStyles";
import NoDataFound from "../../../NoDataFound";
import ActivityHistoryDialog from "../../../zzzreusable/ActivityHistoryDialog";

const DARecommendationTable = ({
  submissionsList,
  isLoadingState,
  error,
  handleRowClick,
  searchQuery,
  statusFilter,
}) => {
  const theme = useTheme();
  const [historyDialogOpen, setHistoryDialogOpen] = React.useState(false);
  const [selectedDaHistory, setSelectedDaHistory] = React.useState(null);

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
          {submission.employee_code || ""}
        </Typography>
      </Box>
    );
  };

  const renderRecommendation = (submission) => {
    const recommendation = submission.recommendation || "-";
    return (
      <Typography
        variant="body2"
        sx={{
          fontWeight: 700,
          fontSize: "14px",
          textTransform: "uppercase",
        }}>
        {recommendation}
      </Typography>
    );
  };

  const renderStatusChip = (submission) => {
    const statusConfig = {
      "for recommendation": {
        color: "#1976d2",
        bgColor: "#e3f2fd",
        label: "FOR RECOMMENDATION",
      },
      "for submission": {
        color: "#0288d1",
        bgColor: "#e1f5fe",
        label: "FOR SUBMISSION",
      },
      "pending recommendation": {
        color: "#f57c00",
        bgColor: "#fff8e1",
        label: "PENDING",
      },
      "pending recommendation approval": {
        color: "#f57c00",
        bgColor: "#fff8e1",
        label: "PENDING",
      },
      pending: {
        color: "#f57c00",
        bgColor: "#fff8e1",
        label: "PENDING",
      },
      "recommendation approved": {
        color: "#2e7d32",
        bgColor: "#e8f5e8",
        label: "APPROVED",
      },
      "recommendation rejected": {
        color: "#d32f2f",
        bgColor: "#ffebee",
        label: "REJECTED",
      },
      "awaiting recommendation resubmission": {
        color: "#9c27b0",
        bgColor: "#f3e5f5",
        label: "AWAITING RESUBMISSION",
      },
      "mda in progress": {
        color: "#f57c00",
        bgColor: "#fff8e1",
        label: "MDA IN PROGRESS",
      },
      completed: {
        color: "#2e7d32",
        bgColor: "#e8f5e8",
        label: "COMPLETED",
      },
      cancelled: {
        color: "#757575",
        bgColor: "#f5f5f5",
        label: "CANCELLED",
      },
    };

    const status = submission.status?.toLowerCase();
    const config = statusConfig[status] || {
      color: "#757575",
      bgColor: "#f5f5f5",
      label: submission.status?.toUpperCase() || "UNKNOWN",
    };

    return (
      <Chip label={config.label} size="small" sx={styles.statusChip(config)} />
    );
  };

  const handleViewActivityClick = (e, submission) => {
    e.stopPropagation();
    setSelectedDaHistory(submission);
    setHistoryDialogOpen(true);
  };

  const handleHistoryDialogClose = () => {
    setHistoryDialogOpen(false);
    setSelectedDaHistory(null);
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

    const normalizedFilter = statusFilter.replace(/_/g, " ").toUpperCase();

    return submissionsList.filter((submission) => {
      const submissionStatus = submission.status
        ?.replace(/_/g, " ")
        .toUpperCase();
      return submissionStatus === normalizedFilter;
    });
  }, [submissionsList, statusFilter]);

  const getNoDataMessage = () => {
    if (statusFilter) {
      const statusLabels = {
        "FOR RECOMMENDATION": "for recommendation",
        "FOR SUBMISSION": "for submission",
        "PENDING RECOMMENDATION": "pending",
        "PENDING RECOMMENDATION APPROVAL": "pending",
        PENDING: "pending",
        "RECOMMENDATION APPROVED": "approved",
        "RECOMMENDATION REJECTED": "rejected",
        "AWAITING RECOMMENDATION RESUBMISSION": "awaiting resubmission",
        "MDA IN PROGRESS": "MDA in progress",
        COMPLETED: "completed",
        CANCELLED: "cancelled",
      };
      const normalizedFilter = statusFilter.replace(/_/g, " ").toUpperCase();
      const statusLabel =
        statusLabels[normalizedFilter] || normalizedFilter.toLowerCase();
      return searchQuery
        ? `No ${statusLabel} recommendations found for "${searchQuery}"`
        : `No ${statusLabel} recommendations found`;
    }
  };

  const totalColumns = 7;

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
              <TableCell sx={styles.columnStyles.referenceNumber}>
                REFERENCE NO.
              </TableCell>
              <TableCell sx={styles.columnStyles.position}>EMPLOYEE</TableCell>
              <TableCell sx={styles.columnStyles.formName}>
                CHARGING NAME
              </TableCell>
              <TableCell sx={styles.columnStyles.recommendation}>
                RECOMMENDATION
              </TableCell>
              <TableCell sx={styles.columnStyles.status}>STATUS</TableCell>
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
                      <Skeleton animation="wave" height={20} width="60%" />
                    </TableCell>
                    <TableCell>
                      <Skeleton animation="wave" height={30} />
                    </TableCell>
                    <TableCell>
                      <Skeleton animation="wave" height={30} />
                    </TableCell>
                    <TableCell>
                      <Skeleton
                        animation="wave"
                        height={24}
                        width={120}
                        sx={{ borderRadius: "12px" }}
                      />
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
              <TableRow>
                <TableCell
                  colSpan={totalColumns}
                  align="center"
                  sx={styles.errorCell}>
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
                        ...styles.columnStyles.referenceNumber,
                        ...styles.cellContentStyles,
                        ...styles.referenceNumberCell,
                      }}>
                      {submission.reference_number || "-"}
                    </TableCell>
                    <TableCell
                      sx={{
                        ...styles.columnStyles.position,
                        ...styles.cellContentStyles,
                      }}>
                      {renderEmployee(submission)}
                    </TableCell>
                    <TableCell
                      sx={{
                        ...styles.columnStyles.formName,
                        ...styles.cellContentStyles,
                      }}>
                      {submission.charging_name || "-"}
                    </TableCell>
                    <TableCell
                      sx={{
                        ...styles.columnStyles.recommendation,
                        ...styles.cellContentStyles,
                      }}>
                      {renderRecommendation(submission)}
                    </TableCell>
                    <TableCell sx={styles.columnStyles.status}>
                      {renderStatusChip(submission)}
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
                  height: 0,
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
                    height: 0,
                    padding: 0,
                    border: "none",
                    borderBottom: "none",
                    pointerEvents: "none",
                    position: "relative",
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
        data={selectedDaHistory}
        type="datachange"
        title="Activity Logs"
      />
    </>
  );
};

export default DARecommendationTable;
