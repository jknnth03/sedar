import CancelIcon from "@mui/icons-material/Cancel";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import RestoreIcon from "@mui/icons-material/Restore";
import {
  Box,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import dayjs from "dayjs";
import React from "react";
import ConfirmationDialog from "../../../../styles/ConfirmationDialog";
import NoDataFound from "../../../NoDataFound";
import { styles } from "../manpowerform/FormSubmissionStyles";
import DAFormHistoryDialog from "./DAFormHistoryDialog";

const DAFormTable = ({
  submissionsList,
  isLoadingState,
  error,
  handleRowClick,
  handleMenuOpen,
  handleMenuClose,
  menuAnchor,
  searchQuery,
  statusFilter,
  onCancel,
}) => {
  const theme = useTheme();
  const [historyDialogOpen, setHistoryDialogOpen] = React.useState(false);
  const [selectedDaHistory, setSelectedDaHistory] = React.useState(null);
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
          {submission.employee_code || ""}
        </Typography>
      </Box>
    );
  };

  const renderStatusChip = (submission) => {
    const statusConfig = {
      "pending mda creation": {
        color: "#f57c00",
        bgColor: "#fff4e6",
        label: "PENDING MDA CREATION",
      },
      pending: {
        color: "#f57c00",
        bgColor: "#fff4e6",
        label: "FOR APPROVAL",
      },
      "for mda processing": {
        color: "#1976d2",
        bgColor: "#e3f2fd",
        label: "FOR MDA PROCESSING",
      },
      "mda for approval": {
        color: "#9c27b0",
        bgColor: "#f3e5f5",
        label: "MDA FOR APPROVAL",
      },
      completed: {
        color: "#2e7d32",
        bgColor: "#e8f5e9",
        label: "COMPLETED",
      },
      approved: {
        color: "#2e7d32",
        bgColor: "#e8f5e9",
        label: "APPROVED",
      },
      received: {
        color: "#2e7d32",
        bgColor: "#e8f5e9",
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
      "awaiting approval": {
        color: "#9c27b0",
        bgColor: "#f3e5f5",
        label: "AWAITING APPROVAL",
      },
      "awaiting resubmission": {
        color: "#9c27b0",
        bgColor: "#f3e5f5",
        label: "FOR SUBMISSION",
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
    setSelectedDaHistory(submission);
    setHistoryDialogOpen(true);
  };

  const handleHistoryDialogClose = () => {
    setHistoryDialogOpen(false);
    setSelectedDaHistory(null);
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

  const filteredSubmissions = React.useMemo(() => {
    if (!statusFilter) return submissionsList;
    return submissionsList.filter(
      (submission) =>
        submission.status?.toUpperCase() === statusFilter.toUpperCase(),
    );
  }, [submissionsList, statusFilter]);

  const getNoDataMessage = () => {
    if (statusFilter) {
      const statusLabels = {
        PENDING: "pending",
        "PENDING MDA CREATION": "pending mda creation",
        "FOR MDA PROCESSING": "for mda processing",
        "MDA FOR APPROVAL": "mda for approval",
        COMPLETED: "completed",
        APPROVED: "approved",
        REJECTED: "rejected",
        CANCELLED: "cancelled",
        RETURNED: "returned",
        "AWAITING APPROVAL": "awaiting approval",
        "AWAITING RESUBMISSION": "awaiting resubmission",
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

  const shouldHideActions =
    statusFilter === "CANCELLED" ||
    statusFilter === "COMPLETED" ||
    statusFilter === "PENDING MDA CREATION" ||
    statusFilter === "MDA FOR APPROVAL" ||
    statusFilter === "FOR MDA PROCESSING" ||
    statusFilter === "MDA IN PROGRESS";
  const shouldShowActionsColumn = !shouldHideActions;
  const totalColumns = shouldShowActionsColumn ? 7 : 6;

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
              <TableCell sx={styles.columnStyles.status}>STATUS</TableCell>
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
        selectedDaHistory={selectedDaHistory}
      />

      <ConfirmationDialog
        open={cancelDialogOpen}
        onClose={handleCancelDialogClose}
        action="cancel"
        itemId={selectedSubmissionToCancel?.id}
        itemName={selectedSubmissionToCancel?.reference_number || "N/A"}
        module="DA Form Request"
        showRemarks={true}
        remarks={cancelRemarks}
        onRemarksChange={setCancelRemarks}
        remarksRequired={true}
        remarksLabel="Cancellation Remarks *"
        remarksPlaceholder="Please provide a reason for cancellation"
        onSuccess={handleCancelSuccess}
      />
    </>
  );
};

export default DAFormTable;
