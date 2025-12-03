import React, { useCallback, useState } from "react";
import { useDispatch } from "react-redux";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  CircularProgress,
  Typography,
  Box,
  IconButton,
  Chip,
  Tooltip,
  useTheme,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Skeleton,
} from "@mui/material";
import {
  MoreVert as MoreVertIcon,
  Cancel as CancelIcon,
  History as HistoryIcon,
} from "@mui/icons-material";
import PendingRegistrationDialog from "./PendingRegistrationDialog";
import { useCancelFormSubmissionMutation } from "../../features/api/approvalsetting/formSubmissionApi";
import pendingApi from "../../features/api/employee/pendingApi";
import mainApi from "../../features/api/employee/mainApi";
import moduleApi from "../../features/api/usermanagement/dashboardApi";
import dayjs from "dayjs";
import { styles } from "../forms/manpowerform/FormSubmissionStyles";
import NoDataFound from "../NoDataFound";

const PendingRegistrationTable = ({
  pendingList = [],
  isLoadingState,
  error,
  searchQuery,
  handleRowClick,
  handleEditSubmission,
  handleActionClick,
  paginationData,
  onPageChange,
  onRowsPerPageChange,
  onRefetch,
  statusFilter = null,
}) => {
  const dispatch = useDispatch();
  const theme = useTheme();
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false);
  const [selectedRegistrationHistory, setSelectedRegistrationHistory] =
    useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedRegistration, setSelectedRegistration] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showCancelConfirmDialog, setShowCancelConfirmDialog] = useState(false);
  const [pendingCancelRegistration, setPendingCancelRegistration] =
    useState(null);

  const [cancelFormSubmission, { isLoading: isCancelling }] =
    useCancelFormSubmissionMutation();

  const filteredPendingList = statusFilter
    ? pendingList.filter(
        (registration) =>
          registration?.status?.toLowerCase() === statusFilter.toLowerCase()
      )
    : pendingList;

  const handleHistoryClick = (registration, event) => {
    event.stopPropagation();
    setSelectedRegistrationHistory(registration);
    setHistoryDialogOpen(true);
  };

  const handleHistoryDialogClose = () => {
    setHistoryDialogOpen(false);
    setSelectedRegistrationHistory(null);
  };

  const handleActionsClick = (event, registration) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setSelectedRegistration(registration);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedRegistration(null);
  };

  const shouldEnableCancelButton = useCallback(
    (registration) => {
      if (!registration || isProcessing || isCancelling) return false;
      const status = registration.status?.toLowerCase();
      return status !== "cancelled" && status !== "approved";
    },
    [isProcessing, isCancelling]
  );

  const handleCancelRequest = async (registration) => {
    if (!shouldEnableCancelButton(registration)) return;
    handleMenuClose();
    setPendingCancelRegistration(registration);
    setShowCancelConfirmDialog(true);
  };

  const handleConfirmCancel = async () => {
    if (!pendingCancelRegistration) return;

    setIsProcessing(true);
    setShowCancelConfirmDialog(false);

    try {
      const submissionId =
        pendingCancelRegistration?.id ||
        pendingCancelRegistration?.submission_id;
      await cancelFormSubmission(submissionId).unwrap();

      dispatch(pendingApi.util.invalidateTags(["PendingEmployees"]));
      dispatch(mainApi.util.invalidateTags(["employees"]));
      dispatch(moduleApi.util.invalidateTags(["dashboard"]));

      if (onRefetch) {
        onRefetch();
      }
    } catch (error) {
    } finally {
      setIsProcessing(false);
      setPendingCancelRegistration(null);
    }
  };

  const handleCancelDialogClose = () => {
    setShowCancelConfirmDialog(false);
    setPendingCancelRegistration(null);
  };

  const renderStatusChip = useCallback((registration) => {
    const statusConfig = {
      pending: {
        color: "#f57c00",
        bgColor: "#fff8e1",
        label: "PENDING",
      },
      "awaiting resubmission": {
        color: "#4c00ffff",
        bgColor: "#f0f1ffff",
        label: "AWAITING RESUBMISSION",
      },
      awaiting_resubmission: {
        color: "#4c00ffff",
        bgColor: "#f0f1ffff",
        label: "AWAITING RESUBMISSION",
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
      rejected: {
        color: "#d32f2f",
        bgColor: "#ffebee",
        label: "REJECTED",
      },
      returned: {
        color: "#d32f2f",
        bgColor: "#ffebee",
        label: "RETURNED",
      },
      approved: {
        color: "#2e7d32",
        bgColor: "#e8f5e8",
        label: "APPROVED",
      },
      cancelled: {
        color: "#5f5f5fff",
        bgColor: "#eeeeeeff",
        label: "CANCELLED",
      },
    };

    const status = registration?.status?.toLowerCase().replace(/ /g, "_");
    const config = statusConfig[status] ||
      statusConfig[registration?.status?.toLowerCase()] || {
        color: "#f57c00",
        bgColor: "#fff8e1",
        label: registration?.status?.toUpperCase() || "PENDING",
      };

    return (
      <Chip label={config.label} size="small" sx={styles.statusChip(config)} />
    );
  }, []);

  const getFullName = (registration) => {
    if (registration?.submittable?.employee_name) {
      return registration.submittable.employee_name;
    }

    if (registration?.submittable?.general_info?.full_name) {
      const fullName = registration.submittable.general_info.full_name;
      const statusWords = [
        "REJECTED",
        "APPROVED",
        "PENDING",
        "AWAITING",
        "RESUBMISSION",
        "SUBMITTED",
        "RETURNED",
        "CANCELLED",
      ];
      let cleanName = fullName;

      statusWords.forEach((status) => {
        const regex = new RegExp(`\\s+${status}\\s*$`, "i");
        cleanName = cleanName.replace(regex, "");
      });

      return cleanName.trim();
    }

    const user = registration?.requested_by;
    if (user?.full_name) return user.full_name;
    const firstName = user?.first_name || "";
    const lastName = user?.last_name || "";
    if (firstName || lastName) return `${firstName} ${lastName}`.trim();
    return user?.username || "N/A";
  };

  const getEmployeeCode = (registration) => {
    return (
      registration?.submittable?.general_info?.employee_code ||
      registration?.submittable?.employee_code ||
      registration?.charging?.code ||
      (registration?.id ? `EMP-${registration.id}` : "N/A")
    );
  };

  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "white",
        minHeight: 0,
      }}>
      <TableContainer sx={styles.tableContainerStyles}>
        <Table
          stickyHeader
          sx={{
            minWidth: 1030,
            height: filteredPendingList.length === 0 ? "100%" : "auto",
          }}>
          <TableHead>
            <TableRow>
              <TableCell sx={styles.columnStyles.employeeName}>
                FULL NAME
              </TableCell>
              <TableCell sx={styles.columnStyles.position}>ID NUMBER</TableCell>
              <TableCell sx={styles.columnStyles.status}>STATUS</TableCell>
              <TableCell sx={styles.columnStyles.dateCreated}>
                DATE CREATED
              </TableCell>
              <TableCell sx={styles.columnStyles.history} align="center">
                HISTORY
              </TableCell>
              <TableCell sx={styles.columnStyles.actions} align="center">
                ACTIONS
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody
            sx={{
              height: filteredPendingList.length === 0 ? "100%" : "auto",
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
                <TableCell colSpan={6} align="center" sx={styles.errorCell}>
                  <Typography color="error">
                    Error loading data: {error?.message || "Unknown error"}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : Array.isArray(filteredPendingList) &&
              filteredPendingList.length > 0 ? (
              filteredPendingList.map((registration) => (
                <TableRow
                  key={registration?.id}
                  onClick={() => handleRowClick?.(registration)}
                  sx={styles.tableRowHover(theme)}>
                  <TableCell
                    sx={{
                      ...styles.columnStyles.employeeName,
                      ...styles.cellContentStyles,
                      fontWeight: 600,
                    }}>
                    {getFullName(registration)}
                  </TableCell>
                  <TableCell
                    sx={{
                      ...styles.columnStyles.position,
                      ...styles.cellContentStyles,
                    }}>
                    {getEmployeeCode(registration)}
                  </TableCell>
                  <TableCell sx={styles.columnStyles.status}>
                    {renderStatusChip(registration)}
                  </TableCell>
                  <TableCell
                    sx={{
                      ...styles.columnStyles.dateCreated,
                      ...styles.cellContentStyles,
                    }}>
                    {registration?.created_at
                      ? dayjs(registration.created_at).format("MMM D, YYYY")
                      : "-"}
                  </TableCell>
                  <TableCell sx={styles.columnStyles.history} align="center">
                    <Tooltip title="View History">
                      <IconButton
                        size="small"
                        onClick={(e) => handleHistoryClick(registration, e)}
                        sx={styles.historyIconButton(theme)}>
                        <HistoryIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                  <TableCell sx={styles.columnStyles.actions} align="center">
                    <Tooltip title="Actions">
                      <IconButton
                        size="small"
                        onClick={(e) => handleActionsClick(e, registration)}
                        disabled={isProcessing || isCancelling}
                        sx={{
                          ...styles.actionIconButton(theme),
                          "&.Mui-disabled": {
                            opacity: 0.5,
                          },
                        }}>
                        <MoreVertIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
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
                    <NoDataFound message="" subMessage="" />
                  </Box>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {!isLoadingState &&
        !error &&
        filteredPendingList.length > 0 &&
        paginationData && (
          <Box sx={styles.paginationContainer}>
            <TablePagination
              component="div"
              count={paginationData?.total || 0}
              page={(paginationData?.current_page || 1) - 1}
              onPageChange={onPageChange}
              rowsPerPage={paginationData?.per_page || 10}
              onRowsPerPageChange={onRowsPerPageChange}
              rowsPerPageOptions={[5, 10, 25, 50]}
              labelRowsPerPage="Rows per page:"
              labelDisplayedRows={({ from, to, count }) =>
                `${from}-${to} of ${count !== -1 ? count : `more than ${to}`}`
              }
            />
          </Box>
        )}

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        PaperProps={{
          sx: styles.actionMenu(theme),
        }}>
        <MenuItem
          onClick={() => handleCancelRequest(selectedRegistration)}
          disabled={!shouldEnableCancelButton(selectedRegistration)}
          sx={
            shouldEnableCancelButton(selectedRegistration)
              ? styles.cancelMenuItem
              : styles.cancelMenuItemDisabled
          }>
          <ListItemIcon>
            <CancelIcon
              fontSize="small"
              sx={{
                color: shouldEnableCancelButton(selectedRegistration)
                  ? "#d32f2f"
                  : "rgba(0, 0, 0, 0.26)",
              }}
            />
          </ListItemIcon>
          <ListItemText>Cancel Request</ListItemText>
        </MenuItem>
      </Menu>

      <Dialog
        open={showCancelConfirmDialog}
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
            Are you sure you want to <strong>Cancel</strong> this registration?
          </Typography>
          {pendingCancelRegistration && (
            <Typography
              variant="body2"
              sx={{
                fontSize: "14px",
                color: "#666",
                fontWeight: 500,
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}>
              {getFullName(pendingCancelRegistration)} - ID:{" "}
              {pendingCancelRegistration?.id}
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
            disabled={isProcessing}>
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
            disabled={isProcessing}>
            {isProcessing ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              "CONFIRM"
            )}
          </Button>
        </DialogActions>
      </Dialog>

      <PendingRegistrationDialog
        historyDialogOpen={historyDialogOpen}
        onHistoryDialogClose={handleHistoryDialogClose}
        selectedRegistrationHistory={selectedRegistrationHistory}
      />
    </Box>
  );
};

export default PendingRegistrationTable;
