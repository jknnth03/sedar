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
import CancelIcon from "@mui/icons-material/Cancel";
import dayjs from "dayjs";
import { styles } from "../manpowerform/FormSubmissionStyles";
import DataChangeDialog from "./DataChangeDialog";
import NoDataFound from "../../NoDataFound";

const DataChangeForApprovalTable = ({
  submissionsList = [],
  isLoadingState,
  error,
  handleRowClick,
  handleMenuOpen,
  handleMenuClose,
  menuAnchor = {},
  searchQuery,
  statusFilter,
  forApproval = false,
  forCancelled = false,
  forReceived = false,
  hideActions = false,
  onCancel,
  forMDAProcessing = false,
  onCreateMDA,
}) => {
  const theme = useTheme();
  const [historyDialogOpen, setHistoryDialogOpen] = React.useState(false);
  const [selectedDataChangeHistory, setSelectedDataChangeHistory] =
    React.useState(null);

  const getMovementTypeLabel = (movementType) => {
    return movementType || "-";
  };

  const renderEmployee = (employeeName, employeeCode) => {
    if (!employeeName) return "-";
    return (
      <Box>
        <Typography variant="body2" sx={{ fontWeight: 600, fontSize: "16px" }}>
          {employeeName}
        </Typography>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ fontSize: "14px" }}>
          {employeeCode || ""}
        </Typography>
      </Box>
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
      completed: {
        color: "#1976d2",
        bgColor: "#e3f2fd",
        label: "COMPLETED",
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
      "for approval": {
        color: "#1976d2",
        bgColor: "#e3f2fd",
        label: "FOR APPROVAL",
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
      "awaiting approval": {
        color: "#9c27b0",
        bgColor: "#f3e5f5",
        label: "AWAITING APPROVAL",
      },
      "pending mda creation": {
        color: "#f57c00",
        bgColor: "#fff8e1",
        label: "PENDING MDA CREATION",
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
    setSelectedDataChangeHistory(submission);
    setHistoryDialogOpen(true);
  };

  const handleHistoryDialogClose = () => {
    setHistoryDialogOpen(false);
    setSelectedDataChangeHistory(null);
  };

  const handleCancelClick = (e, submission) => {
    e.stopPropagation();
    handleMenuClose(submission.id);
    if (onCancel) {
      onCancel(submission.id);
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
        submission.status?.toUpperCase() === statusFilter.toUpperCase()
    );
  }, [submissionsList, statusFilter]);

  const getNoDataMessage = () => {
    if (statusFilter) {
      const statusLabels = {
        PENDING: "pending",
        APPROVED: "approved",
        COMPLETED: "completed",
        RECEIVED: "received",
        REJECTED: "rejected",
        CANCELLED: "cancelled",
        "FOR APPROVAL": "for approval",
        SUBMITTED: "submitted",
        RESUBMITTED: "resubmitted",
        RETURNED: "returned",
        "AWAITING APPROVAL": "awaiting approval",
        "PENDING MDA CREATION": "pending MDA creation",
      };
      const statusLabel =
        statusLabels[statusFilter] || statusFilter.toLowerCase();
      return searchQuery
        ? `No ${statusLabel} data change requests found for "${searchQuery}"`
        : `No ${statusLabel} data change requests found`;
    }
  };

  const shouldHideActionsHeader = hideActions || forCancelled || forReceived;
  const shouldShowActionsColumn =
    !shouldHideActionsHeader &&
    filteredSubmissions.some(
      (submission) => submission.status !== "PENDING MDA CREATION"
    );
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
              <TableCell sx={styles.columnStyles.formName}>
                MOVEMENT TYPE
              </TableCell>
              <TableCell sx={styles.columnStyles.position}>EMPLOYEE</TableCell>
              <TableCell sx={styles.columnStyles.status}>STATUS</TableCell>
              <TableCell align="center" sx={styles.columnStyles.history}>
                HISTORY
              </TableCell>
              <TableCell sx={styles.columnStyles.dateCreated}>
                DATE REQUESTED
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
              filteredSubmissions.map((submission) => (
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
                    {submission.reference_number}
                  </TableCell>
                  <TableCell
                    sx={{
                      ...styles.columnStyles.formName,
                      ...styles.cellContentStyles,
                    }}>
                    {getMovementTypeLabel(submission.movement_type)}
                  </TableCell>
                  <TableCell
                    sx={{
                      ...styles.columnStyles.position,
                      ...styles.cellContentStyles,
                    }}>
                    {renderEmployee(
                      submission.employee_name,
                      submission.employee_code
                    )}
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
                  {!shouldHideActionsHeader &&
                    submission.status !== "PENDING MDA CREATION" && (
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
                            onClick={(e) => handleCancelClick(e, submission)}
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
              ))
            ) : (
              <TableRow
                sx={{
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
                    borderBottom: "none",
                    height: "400px",
                    verticalAlign: "middle",
                    "&:hover": {
                      backgroundColor: "transparent !important",
                      cursor: "default !important",
                    },
                  }}>
                  <NoDataFound message="" subMessage={getNoDataMessage()} />
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <DataChangeDialog
        historyDialogOpen={historyDialogOpen}
        onHistoryDialogClose={handleHistoryDialogClose}
        selectedDataChangeHistory={selectedDataChangeHistory}
      />
    </>
  );
};

export default DataChangeForApprovalTable;
