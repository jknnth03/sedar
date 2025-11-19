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
import VisibilityIcon from "@mui/icons-material/Visibility";
import dayjs from "dayjs";
import { CONSTANT } from "../../../config";
import { styles } from "../manpowerform/FormSubmissionStyles";
import DataChangeDialog from "./DataChangeDialog";

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

  const getMovementTypeLabel = (movementType) => {
    return movementType || "-";
  };

  const getMdaReferenceNumber = (submission) => {
    // Try to get MDA reference from different possible locations
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
        color: "#1976d2",
        bgColor: "#e3f2fd",
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
    if (onCancel) {
      onCancel(submission.id);
    }
    handleMenuClose(submission.id);
  };

  const canCancelSubmission = (submission) => {
    // Check if submission can be cancelled based on status and actions
    if (submission?.actions?.can_cancel === true) {
      return true;
    }

    // Additional logic: allow cancel if status is "MDA IN PROGRESS"
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

  const totalColumns = 7; // Including actions column

  return (
    <>
      <TableContainer sx={styles.tableContainerStyles}>
        <Table stickyHeader sx={{ minWidth: 1200 }}>
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
                      {searchQuery
                        ? `No results for "${searchQuery}"`
                        : statusFilter === "MDA IN PROGRESS"
                        ? "No MDA submissions in progress"
                        : "No MDA submissions pending creation"}
                    </Typography>
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
    </>
  );
};

export default DataChangeMDATable;
