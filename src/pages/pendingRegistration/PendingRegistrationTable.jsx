import React, { useCallback, useState } from "react";
import { useDispatch } from "react-redux";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
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
  Skeleton,
} from "@mui/material";
import {
  MoreVert as MoreVertIcon,
  Cancel as CancelIcon,
  History as HistoryIcon,
} from "@mui/icons-material";
import ConfirmationDialog from "../../styles/ConfirmationDialog";
import { useCancelFormSubmissionMutation } from "../../features/api/approvalsetting/formSubmissionApi";
import pendingApi from "../../features/api/employee/pendingApi";
import mainApi from "../../features/api/employee/mainApi";
import moduleApi from "../../features/api/usermanagement/dashboardApi";
import dayjs from "dayjs";
import { styles } from "../forms/manpowerform/FormSubmissionStyles";
import NoDataFound from "../NoDataFound";
import ActivityHistoryDialog from "../zzzreusable/ActivityHistoryDialog";

const PendingRegistrationTable = ({
  pendingList = [],
  isLoadingState,
  error,
  searchQuery,
  handleRowClick,
  handleMenuOpen,
  handleMenuClose,
  menuAnchor = {},
  onRefetch,
  statusFilter = null,
}) => {
  const dispatch = useDispatch();
  const theme = useTheme();
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false);
  const [selectedRegistrationHistory, setSelectedRegistrationHistory] =
    useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showCancelConfirmDialog, setShowCancelConfirmDialog] = useState(false);
  const [pendingCancelRegistration, setPendingCancelRegistration] =
    useState(null);
  const [cancelRemarks, setCancelRemarks] = useState("");

  const [cancelFormSubmission, { isLoading: isCancelling }] =
    useCancelFormSubmissionMutation();

  const filteredPendingList = statusFilter
    ? pendingList.filter(
        (registration) =>
          registration?.status?.toLowerCase() === statusFilter.toLowerCase(),
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
    handleMenuOpen(event, registration);
  };

  const shouldEnableCancelButton = useCallback(
    (registration) => {
      if (!registration || isProcessing || isCancelling) return false;
      const status = registration.status?.toLowerCase();
      return status !== "cancelled" && status !== "approved";
    },
    [isProcessing, isCancelling],
  );

  const handleCancelRequest = async (registration) => {
    if (!shouldEnableCancelButton(registration)) return;
    handleMenuClose(registration.id);
    setPendingCancelRegistration(registration);
    setCancelRemarks("");
    setShowCancelConfirmDialog(true);
  };

  const handleCancelDialogClose = () => {
    setShowCancelConfirmDialog(false);
    setPendingCancelRegistration(null);
    setCancelRemarks("");
  };

  const handleConfirmCancel = async () => {
    if (!cancelRemarks || cancelRemarks.trim().length < 10) {
      return;
    }

    if (!pendingCancelRegistration?.id) {
      return;
    }

    setIsProcessing(true);

    try {
      await cancelFormSubmission({
        id: pendingCancelRegistration.id,
        remarks: cancelRemarks.trim(),
      }).unwrap();

      dispatch(pendingApi.util.invalidateTags(["PendingEmployees"]));
      dispatch(mainApi.util.invalidateTags(["employees"]));
      dispatch(moduleApi.util.invalidateTags(["dashboard"]));

      if (onRefetch) {
        onRefetch();
      }

      handleCancelDialogClose();
    } catch (error) {
      console.error("Error canceling registration:", error);
    } finally {
      setIsProcessing(false);
    }
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

      <Menu
        anchorEl={
          menuAnchor[Object.keys(menuAnchor).find((key) => menuAnchor[key])]
        }
        open={Object.values(menuAnchor).some(Boolean)}
        onClose={() => {
          const openKey = Object.keys(menuAnchor).find(
            (key) => menuAnchor[key],
          );
          if (openKey) handleMenuClose(openKey);
        }}
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
          onClick={() => {
            const selectedReg = pendingList.find((reg) => menuAnchor[reg.id]);
            if (selectedReg) handleCancelRequest(selectedReg);
          }}
          disabled={(() => {
            const selectedReg = pendingList.find((reg) => menuAnchor[reg.id]);
            return !shouldEnableCancelButton(selectedReg);
          })()}
          sx={(() => {
            const selectedReg = pendingList.find((reg) => menuAnchor[reg.id]);
            return shouldEnableCancelButton(selectedReg)
              ? styles.cancelMenuItem
              : styles.cancelMenuItemDisabled;
          })()}>
          <ListItemIcon>
            <CancelIcon
              fontSize="small"
              sx={{
                color: (() => {
                  const selectedReg = pendingList.find(
                    (reg) => menuAnchor[reg.id],
                  );
                  return shouldEnableCancelButton(selectedReg)
                    ? "#d32f2f"
                    : "rgba(0, 0, 0, 0.26)";
                })(),
              }}
            />
          </ListItemIcon>
          <ListItemText>Cancel Request</ListItemText>
        </MenuItem>
      </Menu>

      <ConfirmationDialog
        open={showCancelConfirmDialog}
        onClose={handleCancelDialogClose}
        isLoading={isProcessing}
        action="cancel"
        itemId={pendingCancelRegistration?.id}
        itemName={`${getFullName(pendingCancelRegistration)} - ID: ${
          pendingCancelRegistration?.id || "N/A"
        }`}
        module="Employee Registration"
        showRemarks={true}
        remarks={cancelRemarks}
        onRemarksChange={setCancelRemarks}
        remarksRequired={true}
        remarksLabel="Cancellation Remarks *"
        remarksPlaceholder="Please provide a reason for cancellation (minimum 10 characters)"
        onSuccess={handleConfirmCancel}
      />

      <ActivityHistoryDialog
        open={historyDialogOpen}
        onClose={handleHistoryDialogClose}
        data={selectedRegistrationHistory}
        type="datachange"
        title="Activity Logs"
      />
    </Box>
  );
};

export default PendingRegistrationTable;
