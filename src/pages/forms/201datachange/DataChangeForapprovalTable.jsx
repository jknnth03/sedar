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
  alpha,
  useTheme,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import EditIcon from "@mui/icons-material/Edit";
import VisibilityIcon from "@mui/icons-material/Visibility";
import dayjs from "dayjs";
import { CONSTANT } from "../../../config";
import DataChangeDialog from "./DataChangeDialog";

const DataChangeForApprovalTable = ({
  submissionsList,
  isLoadingState,
  error,
  handleRowClick,
  handleMenuOpen,
  handleMenuClose,
  handleEditSubmission,
  handleViewActivity,
  menuAnchor,
  searchQuery,
  showArchived,
  forApproval = false,
}) => {
  const theme = useTheme();
  const [historyDialogOpen, setHistoryDialogOpen] = React.useState(false);
  const [selectedDataChangeHistory, setSelectedDataChangeHistory] =
    React.useState(null);

  const renderEmployee = (employeeName, employeeCode) => {
    if (!employeeName) return "-";
    return (
      <Box>
        <Typography variant="body2" sx={{ fontWeight: 600, fontSize: "13px" }}>
          {employeeName}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {employeeCode || ""}
        </Typography>
      </Box>
    );
  };

  const renderCharging = (chargingName) => {
    if (!chargingName) return "-";
    return (
      <Typography variant="body2" sx={{ fontWeight: 600, fontSize: "13px" }}>
        {chargingName}
      </Typography>
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

  const renderActivityLog = (submission) => {
    return (
      <Tooltip title="View activity log" arrow>
        <IconButton
          onClick={(e) => handleViewActivityClick(e, submission)}
          sx={{
            color: "rgb(33, 61, 112)",
            "&:hover": {
              backgroundColor: "rgba(33, 61, 112, 0.08)",
            },
          }}>
          <VisibilityIcon sx={{ fontSize: "20px" }} />
        </IconButton>
      </Tooltip>
    );
  };

  // Keep all submissions, just hide the status column

  // Total columns without status column
  const totalColumns = 8;

  // Define column styles - removed status column
  const columnStyles = {
    id: { width: "60px", minWidth: "60px" },
    referenceNo: { width: "120px", minWidth: "120px" },
    submissionTitle: { width: "350px", minWidth: "350px" }, // Slightly wider since we removed status column
    employee: { width: "250px", minWidth: "250px" },
    charging: { width: "320px", minWidth: "320px" }, // Slightly wider
    history: { width: "80px", minWidth: "80px" },
    dateRequested: { width: "130px", minWidth: "130px" },
    actions: { width: "80px", minWidth: "80px" },
  };

  const cellContentStyles = {
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  };

  const tableContainerStyles = {
    flex: 1,
    overflowX: "auto",
    overflowY: "auto",
    backgroundColor: "#fafafa",
    width: "100%",
    minWidth: 0, // Important for flex children
    "& .MuiTableCell-head": {
      backgroundColor: "#f8f9fa",
      fontWeight: 700,
      fontSize: "14px",
      color: "rgb(33, 61, 112)",
      textTransform: "uppercase",
      letterSpacing: "0.5px",
      borderBottom: "2px solid #e0e0e0",
      position: "sticky",
      top: 0,
      zIndex: 10,
      height: "48px",
      padding: "8px 16px",
      whiteSpace: "nowrap", // Prevent header text wrapping
    },
    "& .MuiTableCell-body": {
      fontSize: "13px",
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
        "& .MuiTableCell-root": {
          backgroundColor: "transparent",
        },
      },
    },
  };

  return (
    <>
      <TableContainer sx={tableContainerStyles}>
        <Table
          stickyHeader
          sx={{
            minWidth: 1200, // Reduced from 1350 since we removed status column
            width: "max-content",
            tableLayout: "fixed", // Force fixed layout for consistent column widths
          }}>
          <TableHead>
            <TableRow>
              <TableCell align="left" sx={columnStyles.id}>
                ID
              </TableCell>
              <TableCell sx={columnStyles.referenceNo}>REFERENCE NO.</TableCell>
              <TableCell sx={columnStyles.submissionTitle}>
                SUBMISSION TITLE
              </TableCell>
              <TableCell sx={columnStyles.employee}>EMPLOYEE</TableCell>
              <TableCell sx={columnStyles.charging}>CHARGING</TableCell>
              <TableCell align="center" sx={columnStyles.history}>
                HISTORY
              </TableCell>
              <TableCell sx={columnStyles.dateRequested}>
                DATE REQUESTED
              </TableCell>
              <TableCell align="center" sx={columnStyles.actions}>
                ACTIONS
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoadingState ? (
              <TableRow>
                <TableCell colSpan={totalColumns} align="center" sx={{ py: 4 }}>
                  <CircularProgress
                    size={32}
                    sx={{ color: "rgb(33, 61, 112)" }}
                  />
                </TableCell>
              </TableRow>
            ) : error ? (
              <TableRow>
                <TableCell colSpan={totalColumns} align="center" sx={{ py: 4 }}>
                  <Typography color="error">
                    Error loading data: {error.message || "Unknown error"}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : submissionsList.length > 0 ? (
              submissionsList.map((submission) => (
                <TableRow
                  key={submission.id}
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
                  <TableCell
                    align="left"
                    onClick={() => handleRowClick(submission)}
                    sx={columnStyles.id}>
                    {submission.id}
                  </TableCell>
                  <TableCell
                    onClick={() => handleRowClick(submission)}
                    sx={{
                      ...columnStyles.referenceNo,
                      ...cellContentStyles,
                    }}>
                    <Typography sx={{ fontWeight: 600, fontSize: "12px" }}>
                      {submission.reference_number}
                    </Typography>
                  </TableCell>
                  <TableCell
                    onClick={() => handleRowClick(submission)}
                    sx={{
                      ...columnStyles.submissionTitle,
                      ...cellContentStyles,
                    }}>
                    <Typography sx={{ fontWeight: 600, fontSize: "13px" }}>
                      {submission.submission_title}
                    </Typography>
                  </TableCell>
                  <TableCell
                    onClick={() => handleRowClick(submission)}
                    sx={{
                      ...columnStyles.employee,
                      ...cellContentStyles,
                    }}>
                    {renderEmployee(
                      submission.employee_name,
                      submission.employee_code
                    )}
                  </TableCell>
                  <TableCell
                    onClick={() => handleRowClick(submission)}
                    sx={{
                      ...columnStyles.charging,
                      ...cellContentStyles,
                    }}>
                    {renderCharging(submission.charging_name)}
                  </TableCell>
                  <TableCell align="center" sx={columnStyles.history}>
                    {renderActivityLog(submission)}
                  </TableCell>
                  <TableCell
                    onClick={() => handleRowClick(submission)}
                    sx={{
                      ...columnStyles.dateRequested,
                      ...cellContentStyles,
                    }}>
                    <Typography variant="body2" sx={{ fontSize: "12px" }}>
                      {submission.date_requested
                        ? dayjs(submission.date_requested).format("MMM D, YYYY")
                        : "-"}
                    </Typography>
                  </TableCell>
                  <TableCell align="center" sx={columnStyles.actions}>
                    <IconButton
                      onClick={(e) => handleMenuOpen(e, submission)}
                      size="small"
                      sx={{
                        color: "rgb(33, 61, 112)",
                        "&:hover": {
                          backgroundColor: "rgba(33, 61, 112, 0.04)",
                        },
                      }}>
                      <MoreVertIcon fontSize="small" />
                    </IconButton>
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
                      sx={{
                        zIndex: 10000,
                      }}>
                      {submission.actions?.can_update && (
                        <MenuItem
                          onClick={() => {
                            handleEditSubmission(submission);
                            handleMenuClose(submission.id);
                          }}
                          sx={{ fontSize: "0.875rem" }}>
                          <EditIcon fontSize="small" sx={{ mr: 1 }} />
                          Edit
                        </MenuItem>
                      )}
                    </Menu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={totalColumns}
                  align="center"
                  sx={{
                    py: 8,
                    borderBottom: "none",
                    color: "#666",
                    fontSize: "16px",
                  }}>
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 2,
                    }}>
                    {CONSTANT.BUTTONS.NODATA.icon}
                    <Typography variant="h6" color="text.secondary">
                      No pending data change submissions found
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {searchQuery
                        ? `No pending results for "${searchQuery}"`
                        : "No pending submissions require approval"}
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

export default DataChangeForApprovalTable;
