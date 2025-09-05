import React, { useCallback, useState } from "react";
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
  alpha,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";
import {
  MoreVert as MoreVertIcon,
  Cancel as CancelIcon,
  Help as HelpIcon,
} from "@mui/icons-material";
import NoDataGIF from "../../assets/no-data.gif";
import PendingRegistrationDialog from "./PendingRegistrationDialog";
import { useCancelFormSubmissionMutation } from "../../features/api/approvalsetting/formSubmissionApi";
import dayjs from "dayjs";
import HistoryIcon from "@mui/icons-material/History";

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
}) => {
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

      console.log("Registration cancelled successfully!");

      if (onRefetch) {
        onRefetch();
      }
    } catch (error) {
      console.error("Error cancelling registration:", error);
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

    const status = registration?.status?.toLowerCase();
    const config = statusConfig[status] || {
      color: "#f57c00",
      bgColor: "#fff8e1",
      label: registration?.status?.toUpperCase() || "PENDING",
    };

    return (
      <Chip
        label={config.label}
        size="small"
        sx={{
          backgroundColor: config.bgColor,
          color: config.color,
          border: `1px solid ${config.color}`,
          fontWeight: 600,
          fontSize: "11px",
          height: "24px",
          borderRadius: "12px",
          "& .MuiChip-label": { padding: "0 8px" },
        }}
      />
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

  const tableContainerStyles = {
    overflow: "auto",
    backgroundColor: "white",
    height: "auto",
    minHeight: "200px",
    maxHeight: "calc(100vh - 200px)", // Dynamic height based on viewport
    "& .MuiTable-root": { minWidth: 1030 },
    "& .MuiTableHead-root": { position: "sticky", top: 0, zIndex: 10 },
    "& .MuiTableCell-head": {
      backgroundColor: "white !important",
      fontWeight: 700,
      fontSize: "18px",
      color: "rgb(33, 61, 112)",
      textTransform: "uppercase",
      letterSpacing: "0.5px",
      borderBottom: "none",
      height: "48px",
      padding: "8px 16px",
      position: "sticky",
      top: 0,
      zIndex: 11,
    },
    "& .MuiTableCell-body": {
      fontSize: "16px",
      color: "#333",
      borderBottom: "1px solid #f0f0f0",
      padding: "8px 16px",
      height: "52px",
      backgroundColor: "white",
    },
    "& .MuiTableRow-root": {
      transition: "background-color 0.2s ease-in-out",
      "&:hover": {
        backgroundColor: "#f8f9fa",
        cursor: "pointer",
        "& .MuiTableCell-root": { backgroundColor: "transparent" },
      },
    },
  };

  const columnStyles = {
    id: { width: "60px", minWidth: "60px" },
    employeeName: { width: "280px", minWidth: "280px" },
    position: { width: "280px", minWidth: "280px" },
    status: { width: "150px", minWidth: "150px" },
    dateCreated: { width: "130px", minWidth: "130px" },
    history: { width: "80px", minWidth: "80px" },
    actions: { width: "80px", minWidth: "80px" },
  };

  const cellContentStyles = {
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  };

  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "white",
        minHeight: 0, // Allow shrinking
      }}>
      <TableContainer sx={tableContainerStyles}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell align="left" sx={columnStyles.id}>
                ID
              </TableCell>
              <TableCell sx={columnStyles.employeeName}>FULL NAME</TableCell>
              <TableCell sx={columnStyles.position}>ID NUMBER</TableCell>
              <TableCell sx={columnStyles.status}>STATUS</TableCell>
              <TableCell sx={columnStyles.dateCreated}>DATE CREATED</TableCell>
              <TableCell sx={columnStyles.history} align="center">
                HISTORY
              </TableCell>
              <TableCell sx={columnStyles.actions} align="center">
                ACTIONS
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoadingState ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  align="center"
                  sx={{ py: 4, backgroundColor: "white" }}>
                  <CircularProgress
                    size={32}
                    sx={{ color: "rgb(33, 61, 112)" }}
                  />
                </TableCell>
              </TableRow>
            ) : error ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  align="center"
                  sx={{ py: 4, backgroundColor: "white" }}>
                  <Typography color="error">
                    Error loading data: {error?.message || "Unknown error"}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : Array.isArray(pendingList) && pendingList.length > 0 ? (
              pendingList.map((registration) => (
                <TableRow
                  key={registration?.id}
                  onClick={() => handleRowClick?.(registration)}
                  sx={{
                    cursor: "pointer",
                    "&:hover": {
                      backgroundColor: alpha(theme.palette.primary.main, 0.04),
                      "& .MuiTableCell-root": {
                        backgroundColor: "transparent",
                      },
                    },
                    transition: "background-color 0.2s ease",
                  }}>
                  <TableCell align="left" sx={columnStyles.id}>
                    {registration?.id}
                  </TableCell>
                  <TableCell
                    sx={{
                      ...columnStyles.employeeName,
                      ...cellContentStyles,
                      fontWeight: 600,
                    }}>
                    {getFullName(registration)}
                  </TableCell>
                  <TableCell
                    sx={{ ...columnStyles.position, ...cellContentStyles }}>
                    {getEmployeeCode(registration)}
                  </TableCell>
                  <TableCell sx={columnStyles.status}>
                    {renderStatusChip(registration)}
                  </TableCell>
                  <TableCell
                    sx={{ ...columnStyles.dateCreated, ...cellContentStyles }}>
                    {registration?.created_at
                      ? dayjs(registration.created_at).format("MMM D, YYYY")
                      : "-"}
                  </TableCell>
                  <TableCell sx={columnStyles.history} align="center">
                    <Tooltip title="Click here to view history">
                      <IconButton
                        size="small"
                        onClick={(e) => handleHistoryClick(registration, e)}
                        sx={{
                          color: "rgb(33, 61, 112)",
                          "&:hover": {
                            backgroundColor: alpha(
                              theme.palette.primary.main,
                              0.1
                            ),
                          },
                        }}>
                        <HistoryIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                  <TableCell sx={columnStyles.actions} align="center">
                    <IconButton
                      size="small"
                      onClick={(e) => handleActionsClick(e, registration)}
                      disabled={isProcessing || isCancelling}
                      sx={{
                        color: "rgb(33, 61, 112)",
                        "&:hover": {
                          backgroundColor: alpha(
                            theme.palette.primary.main,
                            0.1
                          ),
                        },
                        "&.Mui-disabled": {
                          opacity: 0.5,
                        },
                      }}>
                      <MoreVertIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                    }}>
                    <img
                      src={NoDataGIF}
                      alt="No Data"
                      style={{
                        width: "365px",
                        marginBottom: "16px",
                      }}
                    />
                  </Box>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

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
        sx={{
          "& .MuiMenu-paper": {
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
            border: "1px solid #e0e0e0",
            borderRadius: "8px",
            minWidth: "160px",
          },
        }}>
        <MenuItem
          onClick={() => handleCancelRequest(selectedRegistration)}
          disabled={!shouldEnableCancelButton(selectedRegistration)}
          sx={{
            color: shouldEnableCancelButton(selectedRegistration)
              ? "#d32f2f"
              : "rgba(0, 0, 0, 0.26)",
            "&:hover": {
              backgroundColor: shouldEnableCancelButton(selectedRegistration)
                ? "#ffebee"
                : "transparent",
            },
            "&.Mui-disabled": {
              opacity: 0.5,
            },
          }}>
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
          sx: { borderRadius: 3 },
        }}>
        <DialogTitle>
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            mb={1}>
            <HelpIcon sx={{ fontSize: 60, color: "#ff4400" }} />
          </Box>
          <Typography
            variant="h6"
            fontWeight="bold"
            textAlign="center"
            color="rgb(33, 61, 112)">
            Confirm Cancellation
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" gutterBottom textAlign="center">
            Are you sure you want to cancel this registration?
          </Typography>
          {pendingCancelRegistration && (
            <Typography
              variant="body2"
              color="text.secondary"
              textAlign="center"
              sx={{ mt: 1 }}>
              {getFullName(pendingCancelRegistration)} - ID:{" "}
              {pendingCancelRegistration?.id}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Box
            display="flex"
            justifyContent="center"
            width="100%"
            gap={2}
            mb={2}>
            <Button
              onClick={handleCancelDialogClose}
              variant="outlined"
              color="primary"
              disabled={isProcessing}
              sx={{ borderRadius: 2, minWidth: 80 }}>
              No, Keep It
            </Button>
            <Button
              onClick={handleConfirmCancel}
              variant="contained"
              color="error"
              disabled={isProcessing}
              sx={{ borderRadius: 2, minWidth: 80 }}>
              {isProcessing ? "Cancelling..." : "Yes, Cancel"}
            </Button>
          </Box>
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
