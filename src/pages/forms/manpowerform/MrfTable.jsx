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
  Menu,
  MenuItem,
  Chip,
  Tooltip,
  CircularProgress,
  useTheme,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import RestoreIcon from "@mui/icons-material/Restore";
import CancelIcon from "@mui/icons-material/Cancel";
import EditIcon from "@mui/icons-material/Edit";
import dayjs from "dayjs";
import { CONSTANT } from "../../../config";
import { styles } from "../manpowerform/FormSubmissionStyles";
import MrfHistoryDialog from "./MrfHistoryDialog";

const MrfTable = ({
  submissionsList,
  isLoadingState,
  error,
  handleRowClick,
  handleMenuOpen,
  handleMenuClose,
  menuAnchor,
  searchQuery,
  hideActions = false,
  onCancel,
  onUpdate,
  onResubmit,
}) => {
  const theme = useTheme();
  const [historyDialogOpen, setHistoryDialogOpen] = React.useState(false);
  const [selectedMrfHistory, setSelectedMrfHistory] = React.useState(null);

  const renderPosition = (positionTitle, jobLevel) => {
    if (!positionTitle) return "-";
    return (
      <Box>
        <Typography variant="body2" sx={{ fontWeight: 600, fontSize: "16px" }}>
          {positionTitle}
        </Typography>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ fontSize: "14px" }}>
          {jobLevel || ""}
        </Typography>
      </Box>
    );
  };

  const renderStatusChip = (submission) => {
    const statusConfig = {
      pending: {
        color: "#f57c00",
        bgColor: "#fff8e1",
        label: "FOR APPROVAL",
      },
      "data updated": {
        color: "#9c27b0",
        bgColor: "#f3e5f5",
        label: "AWAITING RESUBMISSION",
      },
      rejected: {
        color: "#d32f2f",
        bgColor: "#ffebee",
        label: "REJECTED",
      },
      approved: {
        color: "#1976d2",
        bgColor: "#e3f2fd",
        label: "FOR RECEIVING",
      },
      returned: {
        color: "#d32f2f",
        bgColor: "#ffebee",
        label: "RETURNED",
      },
      received: {
        color: "#2e7d32",
        bgColor: "#e8f5e8",
        label: "RECEIVED",
      },
      cancelled: {
        color: "#757575",
        bgColor: "#f5f5f5",
        label: "CANCELLED",
      },
    };

    const latestActivity = submission.activity_log?.[0];
    const status = latestActivity?.event_type?.toLowerCase() || "unknown";

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
    setSelectedMrfHistory(submission);
    setHistoryDialogOpen(true);
  };

  const handleHistoryDialogClose = () => {
    setHistoryDialogOpen(false);
    setSelectedMrfHistory(null);
  };

  const handleCancelClick = (submission) => {
    if (onCancel) {
      onCancel(submission.id);
    }
    handleMenuClose(submission.id);
  };

  const handleUpdateClick = (submission) => {
    if (onUpdate) {
      onUpdate(submission);
    }
    handleMenuClose(submission.id);
  };

  const handleResubmitClick = (submission) => {
    if (onResubmit) {
      onResubmit(submission);
    }
    handleMenuClose(submission.id);
  };

  const canCancelSubmission = (submission) => {
    const status = submission?.status?.toUpperCase() || "";

    if (status === "RECEIVED" || status === "CANCELLED") {
      return false;
    }

    return submission?.actions?.can_cancel === true;
  };

  const canUpdateSubmission = (submission) => {
    const status = submission?.status?.toUpperCase() || "";

    if (
      status === "RECEIVED" ||
      status === "CANCELLED" ||
      status === "RETURNED"
    ) {
      return false;
    }

    return true;
  };

  const canResubmitSubmission = (submission) => {
    const status = submission?.status?.toUpperCase() || "";

    if (status === "RECEIVED" || status === "CANCELLED") {
      return false;
    }

    return submission?.actions?.can_resubmit === true;
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

  const shouldShowActionsColumn =
    !hideActions &&
    submissionsList.some(
      (submission) =>
        canCancelSubmission(submission) ||
        canUpdateSubmission(submission) ||
        canResubmitSubmission(submission)
    );
  const totalColumns = shouldShowActionsColumn ? 7 : 6;

  return (
    <>
      <TableContainer sx={styles.tableContainerStyles}>
        <Table stickyHeader sx={{ minWidth: 1200 }}>
          <TableHead>
            <TableRow>
              <TableCell align="left" sx={styles.columnStyles.id}>
                ID
              </TableCell>
              <TableCell sx={styles.columnStyles.referenceNumber}>
                REFERENCE NO.
              </TableCell>
              <TableCell sx={styles.columnStyles.position}>POSITION</TableCell>
              <TableCell sx={styles.columnStyles.formName}>
                REQUISITION TYPE
              </TableCell>
              <TableCell sx={styles.columnStyles.status}>STATUS</TableCell>
              <TableCell align="center" sx={styles.columnStyles.history}>
                HISTORY
              </TableCell>
              {shouldShowActionsColumn && (
                <TableCell align="center" sx={styles.columnStyles.actions}>
                  ACTIONS
                </TableCell>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoadingState ? (
              <TableRow>
                <TableCell
                  colSpan={totalColumns}
                  align="center"
                  sx={styles.loadingCell}>
                  <CircularProgress size={32} sx={styles.loadingSpinner} />
                </TableCell>
              </TableRow>
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
                    {submission.reference_number}
                  </TableCell>
                  <TableCell
                    sx={{
                      ...styles.columnStyles.position,
                      ...styles.cellContentStyles,
                    }}>
                    {renderPosition(
                      submission.position_title,
                      submission.job_level
                    )}
                  </TableCell>
                  <TableCell
                    sx={{
                      ...styles.columnStyles.formName,
                      ...styles.cellContentStyles,
                    }}>
                    {submission.requisition_type || "-"}
                  </TableCell>
                  <TableCell sx={styles.columnStyles.status}>
                    {renderStatusChip(submission)}
                  </TableCell>
                  <TableCell align="center" sx={styles.columnStyles.history}>
                    {renderActivityLog(submission)}
                  </TableCell>
                  {shouldShowActionsColumn && (
                    <TableCell align="center" sx={styles.columnStyles.actions}>
                      {(canCancelSubmission(submission) ||
                        canUpdateSubmission(submission) ||
                        canResubmitSubmission(submission)) && (
                        <>
                          <Tooltip title="Actions">
                            <IconButton
                              onClick={(e) => handleMenuOpen(e, submission)}
                              size="small"
                              sx={styles.actionIconButton(theme)}>
                              <MoreVertIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Menu
                            anchorEl={menuAnchor[submission.id]}
                            open={Boolean(menuAnchor[submission.id])}
                            onClose={() => handleMenuClose(submission.id)}
                            transformOrigin={{
                              horizontal: "right",
                              vertical: "top",
                            }}
                            anchorOrigin={{
                              horizontal: "right",
                              vertical: "bottom",
                            }}
                            PaperProps={{
                              sx: styles.actionMenu(theme),
                            }}
                            sx={{
                              zIndex: 10000,
                            }}>
                            {canUpdateSubmission(submission) && (
                              <MenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleUpdateClick(submission);
                                }}
                                sx={styles.editMenuItem}>
                                <EditIcon fontSize="small" sx={{ mr: 1 }} />
                                Update Request
                              </MenuItem>
                            )}
                            {canResubmitSubmission(submission) && (
                              <MenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleResubmitClick(submission);
                                }}
                                sx={styles.editMenuItem}>
                                <RestoreIcon fontSize="small" sx={{ mr: 1 }} />
                                Resubmit Request
                              </MenuItem>
                            )}
                            {canCancelSubmission(submission) && (
                              <MenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCancelClick(submission);
                                }}
                                sx={styles.cancelMenuItem}>
                                <CancelIcon fontSize="small" sx={{ mr: 1 }} />
                                Cancel Request
                              </MenuItem>
                            )}
                          </Menu>
                        </>
                      )}
                    </TableCell>
                  )}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={totalColumns}
                  align="center"
                  sx={styles.noDataContainer}>
                  <Box sx={styles.noDataBox}>
                    {CONSTANT.BUTTONS.NODATA.icon}
                    <Typography variant="h6" color="text.secondary">
                      No MRF submissions found
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {searchQuery
                        ? `No results for "${searchQuery}"`
                        : "No submissions found"}
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <MrfHistoryDialog
        historyDialogOpen={historyDialogOpen}
        onHistoryDialogClose={handleHistoryDialogClose}
        selectedMrfHistory={selectedMrfHistory}
      />
    </>
  );
};

export default MrfTable;
