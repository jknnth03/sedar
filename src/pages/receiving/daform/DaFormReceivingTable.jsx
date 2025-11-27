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
import dayjs from "dayjs";
import { CONSTANT } from "../../../config";
import { styles } from "../../forms/manpowerform/FormSubmissionStyles";
import MDAHistoryDialog from "../../forms/mdaform/MDAHistoryDialog";

const DaFormReceivingTable = ({
  submissionsList,
  isLoadingState,
  error,
  handleRowClick,
  searchQuery,
  isAssessmentMode = false,
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
        {submission.employee_number && (
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ fontSize: "14px" }}>
            {submission.employee_number}
          </Typography>
        )}
      </Box>
    );
  };

  const renderStatusChip = (submission) => {
    const assessmentStatus =
      submission.assessment_progress_status?.toUpperCase();

    const statusConfig = {
      PENDING: {
        color: "#f57c00",
        bgColor: "#fff4e6",
        label: "FOR RECEIVING",
      },
      ONGOING: {
        color: "#9c27b0",
        bgColor: "#f3e5f5",
        label: "ONGOING",
      },
      COMPLETED: {
        color: "#2e7d32",
        bgColor: "#e8f5e9",
        label: "COMPLETED",
      },
    };

    const config = statusConfig[assessmentStatus] || {
      color: "#757575",
      bgColor: "#f5f5f5",
      label: assessmentStatus || "UNKNOWN",
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

  const getNoDataMessage = () => {
    if (searchQuery) {
      return `No results for "${searchQuery}"`;
    }
    return isAssessmentMode
      ? "No DA submissions currently in assessment"
      : "No DA submissions ready for assessment";
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
              <TableCell sx={styles.columnStyles.status}>STATUS</TableCell>
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
                <TableCell colSpan={5} align="center" sx={styles.loadingCell}>
                  <CircularProgress size={32} sx={styles.loadingSpinner} />
                </TableCell>
              </TableRow>
            ) : error ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={styles.errorCell}>
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
                    onClick={() => {
                      handleRowClick(submission);
                    }}
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
              <TableRow>
                <TableCell
                  colSpan={5}
                  align="center"
                  sx={styles.noDataContainer}>
                  <Box sx={styles.noDataBox}>
                    {CONSTANT.BUTTONS.NODATA.icon}
                    <Typography variant="h6" color="text.secondary">
                      No DA Submissions Found
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

      <MDAHistoryDialog
        historyDialogOpen={historyDialogOpen}
        onHistoryDialogClose={handleHistoryDialogClose}
        selectedDaHistory={selectedDaHistory}
      />
    </>
  );
};

export default DaFormReceivingTable;
