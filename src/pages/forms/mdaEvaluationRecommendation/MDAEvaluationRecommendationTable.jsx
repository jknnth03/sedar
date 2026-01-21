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
  Skeleton,
  useTheme,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import RestoreIcon from "@mui/icons-material/Restore";
import EditIcon from "@mui/icons-material/Edit";
import CancelIcon from "@mui/icons-material/Cancel";
import dayjs from "dayjs";
import { styles } from "../manpowerform/FormSubmissionStyles";
import DAFormHistoryDialog from "../developmentalAssignmentForm/daform/DAFormHistoryDialog";
import ConfirmationDialog from "../../../styles/ConfirmationDialog";
import NoDataFound from "../../NoDataFound";

const MDAEvaluationRecommendationTable = ({
  submissionsList,
  isLoadingState,
  error,
  handleRowClick,
  handleMenuOpen,
  handleMenuClose,
  handleEditSubmission,
  menuAnchor,
  searchQuery,
  selectedFilters,
  showArchived,
  hideStatusColumn,
  onCancel,
}) => {
  const theme = useTheme();
  const [historyDialogOpen, setHistoryDialogOpen] = React.useState(false);
  const [selectedEvaluationHistory, setSelectedEvaluationHistory] =
    React.useState(null);
  const [cancelDialogOpen, setCancelDialogOpen] = React.useState(false);
  const [selectedSubmissionToCancel, setSelectedSubmissionToCancel] =
    React.useState(null);
  const [cancelRemarks, setCancelRemarks] = React.useState("");

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
          {submission.employee_number || submission.employee_code || ""}
        </Typography>
      </Box>
    );
  };

  const renderPosition = (submission) => {
    if (!submission?.position_title) return "-";
    return (
      <Box>
        <Typography variant="body2" sx={{ fontSize: "14px" }}>
          {submission.position_title}
        </Typography>
      </Box>
    );
  };

  const renderStatusChip = (submission) => {
    const statusConfig = {
      "for approval": {
        color: "#1976d2",
        bgColor: "#e3f2fd",
        label: "FOR APPROVAL",
      },
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
      rejected: {
        color: "#d32f2f",
        bgColor: "#ffebee",
        label: "REJECTED",
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

    const status =
      submission.approval_status?.toLowerCase() ||
      submission.status?.toLowerCase();
    const config = statusConfig[status] || {
      color: "#757575",
      bgColor: "#f5f5f5",
      label: (
        submission.approval_status ||
        submission.status ||
        "UNKNOWN"
      ).toUpperCase(),
    };

    return (
      <Chip label={config.label} size="small" sx={styles.statusChip(config)} />
    );
  };

  const renderEffectiveDate = (submission) => {
    if (!submission.effective_date) return "-";
    return (
      <Typography
        variant="body2"
        sx={{
          fontSize: "14px",
        }}>
        {dayjs(submission.effective_date).format("MMM D, YYYY")}
      </Typography>
    );
  };

  const handleViewActivityClick = (e, submission) => {
    e.stopPropagation();
    setSelectedEvaluationHistory(submission);
    setHistoryDialogOpen(true);
  };

  const handleHistoryDialogClose = () => {
    setHistoryDialogOpen(false);
    setSelectedEvaluationHistory(null);
  };

  const handleEditClick = (e, submission) => {
    e.stopPropagation();
    handleMenuClose(submission.id);
    if (handleEditSubmission) {
      handleEditSubmission(submission);
    }
  };

  const handleCancelClick = (submission) => {
    setSelectedSubmissionToCancel(submission);
    setCancelRemarks("");
    setCancelDialogOpen(true);
    handleMenuClose(submission.id);
  };

  const handleCancelDialogClose = () => {
    setCancelDialogOpen(false);
    setSelectedSubmissionToCancel(null);
    setCancelRemarks("");
  };

  const handleCancelSuccess = () => {
    handleCancelDialogClose();
    if (onCancel) {
      onCancel();
    }
  };

  const canEditSubmission = (submission) => {
    return submission?.actions?.can_edit === true;
  };

  const canCancelSubmission = (submission) => {
    return submission?.actions?.can_cancel === true;
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
      return `No MDA evaluations found for "${searchQuery}"`;
    }
    return showArchived
      ? "No archived MDA evaluations found"
      : "No MDA evaluations found";
  };

  const shouldShowActionsColumn = !showArchived;

  const totalColumns = shouldShowActionsColumn
    ? hideStatusColumn
      ? 7
      : 8
    : hideStatusColumn
    ? 6
    : 7;

  return (
    <>
      <TableContainer sx={styles.tableContainerStyles}>
        <Table
          stickyHeader
          sx={{
            minWidth: 1200,
            height: submissionsList.length === 0 ? "100%" : "auto",
          }}>
          <TableHead>
            <TableRow>
              <TableCell sx={styles.columnStyles.referenceNumber}>
                REFERENCE NO.
              </TableCell>
              <TableCell sx={styles.columnStyles.position}>EMPLOYEE</TableCell>
              <TableCell sx={styles.columnStyles.position}>POSITION</TableCell>
              <TableCell sx={styles.columnStyles.formName}>
                EFFECTIVE DATE
              </TableCell>
              {!hideStatusColumn && (
                <TableCell sx={styles.columnStyles.status}>STATUS</TableCell>
              )}
              <TableCell align="center" sx={styles.columnStyles.history}>
                HISTORY
              </TableCell>
              <TableCell sx={styles.columnStyles.dateCreated}>
                DATE SUBMITTED
              </TableCell>
              {shouldShowActionsColumn && (
                <TableCell align="center" sx={styles.columnStyles.actions}>
                  ACTIONS
                </TableCell>
              )}
            </TableRow>
          </TableHead>
          <TableBody
            sx={{
              height: submissionsList.length === 0 ? "100%" : "auto",
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
                      <Skeleton animation="wave" height={20} width="60%" />
                    </TableCell>
                    <TableCell>
                      <Skeleton animation="wave" height={30} />
                    </TableCell>
                    {!hideStatusColumn && (
                      <TableCell>
                        <Skeleton
                          animation="wave"
                          height={24}
                          width={120}
                          sx={{ borderRadius: "12px" }}
                        />
                      </TableCell>
                    )}
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
                    {shouldShowActionsColumn && (
                      <TableCell align="center">
                        <Skeleton
                          animation="wave"
                          variant="circular"
                          width={32}
                          height={32}
                          sx={{ margin: "0 auto" }}
                        />
                      </TableCell>
                    )}
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
            ) : submissionsList.length > 0 ? (
              submissionsList.map((submission) => {
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
                        ...styles.columnStyles.position,
                        ...styles.cellContentStyles,
                      }}>
                      {renderPosition(submission)}
                    </TableCell>
                    <TableCell
                      sx={{
                        ...styles.columnStyles.formName,
                        ...styles.cellContentStyles,
                      }}>
                      {renderEffectiveDate(submission)}
                    </TableCell>
                    {!hideStatusColumn && (
                      <TableCell sx={styles.columnStyles.status}>
                        {renderStatusChip(submission)}
                      </TableCell>
                    )}
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
                    {shouldShowActionsColumn && (
                      <TableCell
                        align="center"
                        sx={styles.columnStyles.actions}>
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
                          <MenuItem
                            onClick={(e) => handleEditClick(e, submission)}
                            disabled={!canEditSubmission(submission)}
                            sx={
                              canEditSubmission(submission)
                                ? styles.editMenuItem
                                : styles.editMenuItemDisabled
                            }>
                            <EditIcon fontSize="small" sx={{ mr: 1 }} />
                            Edit
                          </MenuItem>
                          <MenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCancelClick(submission);
                            }}
                            disabled={!canCancelSubmission(submission)}
                            sx={
                              canCancelSubmission(submission)
                                ? styles.cancelMenuItem
                                : styles.cancelMenuItemDisabled
                            }>
                            <CancelIcon fontSize="small" sx={{ mr: 1 }} />
                            Cancel Request
                          </MenuItem>
                        </Menu>
                      </TableCell>
                    )}
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

      <DAFormHistoryDialog
        historyDialogOpen={historyDialogOpen}
        onHistoryDialogClose={handleHistoryDialogClose}
        selectedDaHistory={selectedEvaluationHistory}
      />

      <ConfirmationDialog
        open={cancelDialogOpen}
        onClose={handleCancelDialogClose}
        action="cancel"
        itemId={selectedSubmissionToCancel?.id}
        itemName={selectedSubmissionToCancel?.reference_number || "N/A"}
        module="MDA Evaluation"
        showRemarks={true}
        remarks={cancelRemarks}
        onRemarksChange={setCancelRemarks}
        remarksRequired={true}
        remarksLabel="Cancellation Remarks *"
        remarksPlaceholder="Please provide a reason for cancellation (minimum 10 characters)"
        remarksMinLength={10}
        onSuccess={handleCancelSuccess}
      />
    </>
  );
};

export default MDAEvaluationRecommendationTable;
