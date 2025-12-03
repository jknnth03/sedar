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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  CircularProgress,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import RestoreIcon from "@mui/icons-material/Restore";
import CancelIcon from "@mui/icons-material/Cancel";
import VisibilityIcon from "@mui/icons-material/Visibility";
import dayjs from "dayjs";
import { CONSTANT } from "../../../config";
import { styles } from "../manpowerform/FormSubmissionStyles";
import DataChangeDialog from "./DataChangeDialog";
import NoDataFound from "../../NoDataFound";

const DataChangeMDATable = ({
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
  const [selectedDataChangeHistory, setSelectedDataChangeHistory] =
    React.useState(null);
  const [cancelDialogOpen, setCancelDialogOpen] = React.useState(false);
  const [selectedSubmissionToCancel, setSelectedSubmissionToCancel] =
    React.useState(null);
  const [isCancelling, setIsCancelling] = React.useState(false);

  const getMovementTypeLabel = (movementType) => {
    return movementType || "-";
  };

  const getMdaReferenceNumber = (submission) => {
    return (
      submission.mda_reference_number ||
      submission.mda_reference ||
      submission.reference_number ||
      "-"
    );
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
      "pending mda creation": {
        color: "#f57c00",
        bgColor: "#fff8e1",
        label: "PENDING MDA CREATION",
      },
      "mda in progress": {
        color: "#1976d2",
        bgColor: "#e3f2fd",
        label: "MDA IN PROGRESS",
      },
      "mda completed": {
        color: "#2e7d32",
        bgColor: "#e8f5e8",
        label: "MDA COMPLETED",
      },
      "mda cancelled": {
        color: "#d32f2f",
        bgColor: "#ffebee",
        label: "MDA CANCELLED",
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
      completed: {
        color: "#2e7d32",
        bgColor: "#e8f5e8",
        label: "COMPLETED",
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
      "in progress": {
        color: "#1976d2",
        bgColor: "#e3f2fd",
        label: "IN PROGRESS",
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
      } else {
        setIsCancelling(false);
        handleCancelDialogClose();
      }
    } catch (error) {
      setIsCancelling(false);
    }
  };

  const canCancelSubmission = (submission) => {
    if (submission?.actions?.can_cancel === true) {
      return true;
    }

    const status = submission.status?.toLowerCase();
    return status === "mda in progress";
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
    if (statusFilter) {
      const statusLabels = {
        "PENDING MDA CREATION": "pending MDA creation",
        "MDA IN PROGRESS": "MDA in progress",
        "MDA COMPLETED": "MDA completed",
        "MDA CANCELLED": "MDA cancelled",
      };
      const statusLabel =
        statusLabels[statusFilter] || statusFilter.toLowerCase();
      return searchQuery
        ? `No ${statusLabel} submissions found for "${searchQuery}"`
        : `No ${statusLabel} submissions found`;
    }
    return searchQuery
      ? `No results found for "${searchQuery}"`
      : "No MDA submissions found";
  };

  const totalColumns = 7;

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
              <TableCell sx={styles.columnStyles.referenceNumber}>
                MDA REFERENCE NO.
              </TableCell>
              <TableCell sx={styles.columnStyles.formName}>
                MOVEMENT TYPE
              </TableCell>
              <TableCell sx={styles.columnStyles.position}>EMPLOYEE</TableCell>
              <TableCell sx={styles.columnStyles.status}>STATUS</TableCell>
              <TableCell align="center" sx={styles.columnStyles.history}>
                HISTORY
              </TableCell>
              <TableCell align="center" sx={styles.columnStyles.actions}>
                ACTIONS
              </TableCell>
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
                    <TableCell align="center">
                      <Skeleton
                        animation="wave"
                        variant="circular"
                        width={32}
                        height={32}
                        sx={{ margin: "0 auto" }}
                      />
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
            ) : submissionsList.length > 0 ? (
              submissionsList.map((submission) => (
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
                      ...styles.columnStyles.referenceNumber,
                      ...styles.cellContentStyles,
                      ...styles.referenceNumberCell,
                    }}>
                    {getMdaReferenceNumber(submission)}
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
                  <TableCell align="center" sx={styles.columnStyles.actions}>
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
                          handleRowClick(submission);
                          handleMenuClose(submission.id);
                        }}
                        sx={styles.viewMenuItem}>
                        <VisibilityIcon fontSize="small" sx={{ mr: 1 }} />
                        View Details
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
                        Cancel MDA
                      </MenuItem>
                    </Menu>
                  </TableCell>
                </TableRow>
              ))
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

      <DataChangeDialog
        historyDialogOpen={historyDialogOpen}
        onHistoryDialogClose={handleHistoryDialogClose}
        selectedDataChangeHistory={selectedDataChangeHistory}
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
            Are you sure you want to <strong>Cancel</strong> this MDA Request?
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

export default DataChangeMDATable;
