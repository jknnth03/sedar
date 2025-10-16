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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import RestoreIcon from "@mui/icons-material/Restore";
import CancelIcon from "@mui/icons-material/Cancel";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import dayjs from "dayjs";
import { CONSTANT } from "../../../config";
import { styles } from "../manpowerform/FormSubmissionStyles";
import MDAHistoryDialog from "./MDAHistoryDialog";

const MDAForApprovalTable = ({
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
  const [selectedMdaHistory, setSelectedMdaHistory] = React.useState(null);
  const [cancelDialogOpen, setCancelDialogOpen] = React.useState(false);
  const [selectedSubmissionToCancel, setSelectedSubmissionToCancel] =
    React.useState(null);
  const [isCancelling, setIsCancelling] = React.useState(false);

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

  const handleCancelClick = (submission) => {
    setSelectedSubmissionToCancel(submission);
    setCancelDialogOpen(true);
    handleMenuClose(submission.id);
  };

  const handleCancelDialogClose = () => {
    setCancelDialogOpen(false);
    setSelectedSubmissionToCancel(null);
    setIsCancelling(false);
  };

  const handleConfirmCancel = async () => {
    if (!selectedSubmissionToCancel) {
      return;
    }

    setIsCancelling(true);

    try {
      if (onCancel) {
        const success = await onCancel(selectedSubmissionToCancel.id);

        if (success) {
          handleCancelDialogClose();
        } else {
          setIsCancelling(false);
        }
      }
    } catch (error) {
      console.error("Error cancelling submission:", error);
      setIsCancelling(false);
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
        REJECTED: "rejected",
        AWAITING_RESUBMISSION: "awaiting resubmission",
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

  const shouldHideActions =
    statusFilter === "APPROVED" || statusFilter === "CANCELLED";

  const shouldShowActionsColumn = !shouldHideActions;
  const totalColumns = shouldShowActionsColumn ? 9 : 8;

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
            ) : filteredSubmissions.length > 0 ? (
              filteredSubmissions.map((submission) => {
                return (
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
              <TableRow>
                <TableCell
                  colSpan={totalColumns}
                  align="center"
                  sx={styles.noDataContainer}>
                  <Box sx={styles.noDataBox}>
                    {CONSTANT.BUTTONS.NODATA.icon}
                    <Typography variant="h6" color="text.secondary">
                      No MDA submissions found
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
        selectedMdaHistory={selectedMdaHistory}
      />

      <Dialog
        open={cancelDialogOpen}
        onClose={handleCancelDialogClose}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            padding: 2,
            boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
            textAlign: "center",
          },
        }}>
        <DialogTitle sx={{ padding: 0, marginBottom: 2 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              marginBottom: 2,
            }}>
            <Box
              sx={{
                width: 60,
                height: 60,
                borderRadius: "50%",
                backgroundColor: "#ff4400",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}>
              <Typography
                sx={{
                  color: "white",
                  fontSize: "30px",
                  fontWeight: "normal",
                }}>
                ?
              </Typography>
            </Box>
          </Box>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 600,
              color: "rgb(25, 45, 84)",
              marginBottom: 0,
            }}>
            Confirmation
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ padding: 0, textAlign: "center" }}>
          <Typography
            variant="body1"
            sx={{
              marginBottom: 2,
              fontSize: "16px",
              color: "#333",
              fontWeight: 400,
            }}>
            Are you sure you want to <strong>Cancel</strong> this Data Change
            Request?
          </Typography>
          {selectedSubmissionToCancel && (
            <Typography
              variant="body2"
              sx={{
                fontSize: "14px",
                color: "#666",
                fontWeight: 500,
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}>
              {selectedSubmissionToCancel?.reference_number}
            </Typography>
          )}
        </DialogContent>
        <DialogActions
          sx={{
            justifyContent: "center",
            padding: 0,
            marginTop: 3,
            gap: 2,
          }}>
          <Button
            onClick={handleCancelDialogClose}
            variant="outlined"
            sx={{
              textTransform: "uppercase",
              fontWeight: 600,
              borderColor: "#f44336",
              color: "#f44336",
              paddingX: 3,
              paddingY: 1,
              borderRadius: 2,
              "&:hover": {
                borderColor: "#d32f2f",
                backgroundColor: "rgba(244, 67, 54, 0.04)",
              },
            }}
            disabled={isCancelling}>
            CANCEL
          </Button>
          <Button
            onClick={handleConfirmCancel}
            variant="contained"
            sx={{
              textTransform: "uppercase",
              fontWeight: 600,
              backgroundColor: "#4caf50",
              paddingX: 3,
              paddingY: 1,
              borderRadius: 2,
              "&:hover": {
                backgroundColor: "#388e3c",
              },
            }}
            disabled={isCancelling}>
            {isCancelling ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              "CONFIRM"
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default MDAForApprovalTable;
