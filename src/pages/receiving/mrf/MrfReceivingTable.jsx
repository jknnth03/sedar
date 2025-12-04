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
  CircularProgress,
  useTheme,
} from "@mui/material";
import RestoreIcon from "@mui/icons-material/Restore";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import dayjs from "dayjs";
import { CONSTANT } from "../../../config";
import { styles } from "../../forms/manpowerform/FormSubmissionStyles";
import MRFHistoryDialog from "../../forms/manpowerform/MRFHistoryDialog";

const MrfReceivingTable = ({
  submissionsList,
  isLoadingState,
  error,
  searchQuery,
  showArchived = false,
  onReceiveSubmission,
  onReturnSubmission,
}) => {
  const theme = useTheme();
  const [historyDialogOpen, setHistoryDialogOpen] = React.useState(false);
  const [selectedMrfHistory, setSelectedMrfHistory] = React.useState(null);

  const renderEmployee = (submission) => {
    if (!submission?.employee_name) return "-";
    return (
      <Box>
        <Typography variant="body2" sx={{ fontWeight: 600, fontSize: "16px" }}>
          {submission.employee_name}
        </Typography>
        {submission.employee_code && (
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ fontSize: "14px" }}>
            {submission.employee_code}
          </Typography>
        )}
      </Box>
    );
  };

  const renderStatusChip = (submission) => {
    const status = submission.status?.toUpperCase();

    const statusConfig = {
      RECEIVING: {
        color: "#f57c00",
        bgColor: "#fff4e6",
        label: "FOR RECEIVING",
      },
      RECEIVED: {
        color: "#2e7d32",
        bgColor: "#e8f5e9",
        label: "RECEIVED",
      },
      RETURNED: {
        color: "#d32f2f",
        bgColor: "#ffebee",
        label: "RETURNED",
      },
    };

    const config = statusConfig[status] || {
      color: "#757575",
      bgColor: "#f5f5f5",
      label: status || "UNKNOWN",
    };

    return (
      <Chip label={config.label} size="small" sx={styles.statusChip(config)} />
    );
  };

  const handleViewHistoryClick = (e, submission) => {
    e.stopPropagation();
    setSelectedMrfHistory(submission);
    setHistoryDialogOpen(true);
  };

  const handleHistoryDialogClose = () => {
    setHistoryDialogOpen(false);
    setSelectedMrfHistory(null);
  };

  const handleReceiveClick = (e, submission) => {
    e.stopPropagation();
    if (onReceiveSubmission) {
      onReceiveSubmission(submission.id, "");
    }
  };

  const handleReturnClick = (e, submission) => {
    e.stopPropagation();
    if (onReturnSubmission) {
      onReturnSubmission(submission.id, "");
    }
  };

  const renderActions = (submission) => {
    if (showArchived) {
      return null;
    }

    return (
      <Box sx={{ display: "flex", gap: 1, justifyContent: "center" }}>
        <Tooltip title="Receive Submission" arrow>
          <IconButton
            onClick={(e) => handleReceiveClick(e, submission)}
            size="small"
            sx={{
              color: "#2e7d32",
              "&:hover": {
                backgroundColor: "rgba(46, 125, 50, 0.08)",
              },
            }}>
            <CheckCircleIcon sx={{ fontSize: "20px" }} />
          </IconButton>
        </Tooltip>
        <Tooltip title="Return Submission" arrow>
          <IconButton
            onClick={(e) => handleReturnClick(e, submission)}
            size="small"
            sx={{
              color: "#d32f2f",
              "&:hover": {
                backgroundColor: "rgba(211, 47, 47, 0.08)",
              },
            }}>
            <CancelIcon sx={{ fontSize: "20px" }} />
          </IconButton>
        </Tooltip>
      </Box>
    );
  };

  const renderHistory = (submission) => {
    return (
      <Tooltip title="View History" arrow>
        <IconButton
          onClick={(e) => handleViewHistoryClick(e, submission)}
          size="small"
          sx={styles.historyIconButton(theme)}>
          <RestoreIcon sx={{ fontSize: "20px" }} />
        </IconButton>
      </Tooltip>
    );
  };

  const getNoDataMessage = () => {
    if (searchQuery) {
      return `No results for "${searchQuery}"`;
    }
    return showArchived
      ? "No received MRF submissions found"
      : "No MRF submissions ready for receiving";
  };

  return (
    <>
      <TableContainer sx={styles.tableContainerStyles}>
        <Table stickyHeader sx={{ minWidth: 1200 }}>
          <TableHead>
            <TableRow>
              <TableCell sx={styles.columnStyles.referenceNumber}>
                REFERENCE NO.
              </TableCell>
              <TableCell sx={styles.columnStyles.position}>EMPLOYEE</TableCell>
              <TableCell sx={styles.columnStyles.actionType}>
                ACTION TYPE
              </TableCell>
              <TableCell sx={styles.columnStyles.status}>STATUS</TableCell>
              {!showArchived && (
                <TableCell align="center" sx={styles.columnStyles.actions}>
                  ACTIONS
                </TableCell>
              )}
              <TableCell align="center" sx={styles.columnStyles.history}>
                HISTORY
              </TableCell>
              <TableCell sx={styles.columnStyles.dateCreated}>
                DATE SUBMITTED
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoadingState ? (
              <TableRow>
                <TableCell
                  colSpan={showArchived ? 6 : 7}
                  align="center"
                  sx={styles.loadingCell}>
                  <CircularProgress size={32} sx={styles.loadingSpinner} />
                </TableCell>
              </TableRow>
            ) : error ? (
              <TableRow>
                <TableCell
                  colSpan={showArchived ? 6 : 7}
                  align="center"
                  sx={styles.errorCell}>
                  <Typography color="error">
                    Error loading data: {error.message || "Unknown error"}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : submissionsList.length > 0 ? (
              submissionsList.map((submission) => {
                return (
                  <TableRow
                    key={submission.id}
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
                        ...styles.columnStyles.actionType,
                        ...styles.cellContentStyles,
                      }}>
                      {submission.action_type || "-"}
                    </TableCell>
                    <TableCell sx={styles.columnStyles.status}>
                      {renderStatusChip(submission)}
                    </TableCell>
                    {!showArchived && (
                      <TableCell
                        align="center"
                        sx={styles.columnStyles.actions}>
                        {renderActions(submission)}
                      </TableCell>
                    )}
                    <TableCell align="center" sx={styles.columnStyles.history}>
                      {renderHistory(submission)}
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
              <TableRow>
                <TableCell
                  colSpan={showArchived ? 6 : 7}
                  align="center"
                  sx={styles.noDataContainer}>
                  <Box sx={styles.noDataBox}>
                    {CONSTANT.BUTTONS.NODATA.icon}
                    <Typography variant="h6" color="text.secondary">
                      No MRF Submissions Found
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {getNoDataMessage()}
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <MRFHistoryDialog
        historyDialogOpen={historyDialogOpen}
        onHistoryDialogClose={handleHistoryDialogClose}
        selectedMrfHistory={selectedMrfHistory}
      />
    </>
  );
};

export default MrfReceivingTable;
