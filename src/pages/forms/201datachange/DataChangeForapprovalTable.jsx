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
import RestoreIcon from "@mui/icons-material/Restore";
import CancelIcon from "@mui/icons-material/Cancel";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
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
      <Tooltip title="Restore" arrow>
        <IconButton
          onClick={(e) => handleViewActivityClick(e, submission)}
          size="small"
          sx={{
            color: "rgb(33, 61, 112)",
            padding: "4px",
            borderRadius: "6px",
            transition: "all 0.2s ease",
            "&:hover": {
              backgroundColor: alpha("rgb(33, 61, 112)", 0.1),
              transform: "translateY(-1px)",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            },
          }}>
          <RestoreIcon sx={{ fontSize: "20px" }} />
        </IconButton>
      </Tooltip>
    );
  };

  const totalColumns = 7;

  const styles = {
    tableContainerStyles: {
      flex: 1,
      overflowX: "auto",
      overflowY: "auto",
      backgroundColor: "#fafafa",
      width: "100%",
      minWidth: 0,
      "& .MuiTableCell-head": {
        backgroundColor: "#f8f9fa",
        fontWeight: 700,
        fontSize: "18px",
        color: "rgb(33, 61, 112)",
        textTransform: "uppercase",
        letterSpacing: "0.5px",
        borderBottom: "2px solid #e0e0e0",
        position: "sticky",
        top: 0,
        zIndex: 10,
        height: "48px",
        padding: "8px 16px",
        whiteSpace: "nowrap",
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
          "& .MuiTableCell-root": {
            backgroundColor: "transparent",
          },
        },
      },
    },
    columnStyles: {
      id: { width: "80px", minWidth: "80px" },
      referenceNo: { width: "150px", minWidth: "150px" },
      movementType: { width: "200px", minWidth: "200px" },
      employee: { width: "300px", minWidth: "300px" },
      history: { width: "80px", minWidth: "80px" },
      dateRequested: { width: "150px", minWidth: "150px" },
      actions: { width: "80px", minWidth: "80px" },
    },
    cellContentStyles: {
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
    },
    loadingCell: {
      py: 4,
      borderBottom: "none",
    },
    errorCell: {
      py: 4,
      borderBottom: "none",
    },
    noDataContainer: {
      py: 8,
      borderBottom: "none",
      color: "#666",
      fontSize: "16px",
    },
    noDataBox: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 2,
    },
    historyIconButton: (theme) => ({
      color: theme.palette.primary.main,
      padding: "4px",
      borderRadius: "6px",
      transition: "all 0.2s ease",
      "&:hover": {
        backgroundColor: alpha(theme.palette.primary.main, 0.1),
        transform: "translateY(-1px)",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
      },
    }),
    actionIconButton: (theme) => ({
      color: "rgb(33, 61, 112)",
      padding: "4px",
      borderRadius: "6px",
      transition: "all 0.2s ease",
      "&:hover": {
        backgroundColor: alpha("rgb(33, 61, 112)", 0.08),
        transform: "translateY(-1px)",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
      },
    }),
    actionMenu: (theme) => ({
      "& .MuiPaper-root": {
        borderRadius: "8px",
        boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        minWidth: "120px",
      },
      "& .MuiMenuItem-root": {
        fontSize: "0.875rem",
        padding: "8px 16px",
        transition: "all 0.2s ease",
        "&:hover": {
          backgroundColor: alpha(theme.palette.primary.main, 0.08),
        },
      },
    }),
    tableRowHover: (theme) => ({
      cursor: "pointer",
      "&:hover": {
        backgroundColor: alpha(theme.palette.primary.main, 0.04),
        "& .MuiTableCell-root": {
          backgroundColor: "transparent",
        },
      },
      transition: "background-color 0.2s ease",
    }),
  };

  return (
    <>
      <TableContainer sx={styles.tableContainerStyles}>
        <Table
          stickyHeader
          sx={{
            minWidth: 1040,
            width: "max-content",
            tableLayout: "fixed",
          }}>
          <TableHead>
            <TableRow>
              <TableCell align="left" sx={styles.columnStyles.id}>
                ID
              </TableCell>
              <TableCell sx={styles.columnStyles.referenceNo}>
                REFERENCE NO.
              </TableCell>
              <TableCell sx={styles.columnStyles.movementType}>
                MOVEMENT TYPE
              </TableCell>
              <TableCell sx={styles.columnStyles.employee}>EMPLOYEE</TableCell>
              <TableCell align="center" sx={styles.columnStyles.history}>
                HISTORY
              </TableCell>
              <TableCell sx={styles.columnStyles.dateRequested}>
                DATE REQUESTED
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
                  <CircularProgress
                    size={32}
                    sx={{ color: "rgb(33, 61, 112)" }}
                  />
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
                  <TableCell align="left" sx={styles.columnStyles.id}>
                    {submission.id}
                  </TableCell>
                  <TableCell
                    sx={{
                      ...styles.columnStyles.referenceNo,
                      ...styles.cellContentStyles,
                      fontWeight: 600,
                    }}>
                    {submission.reference_number}
                  </TableCell>
                  <TableCell
                    sx={{
                      ...styles.columnStyles.movementType,
                      ...styles.cellContentStyles,
                    }}>
                    {submission.action_type || "-"}
                  </TableCell>
                  <TableCell
                    sx={{
                      ...styles.columnStyles.employee,
                      ...styles.cellContentStyles,
                    }}>
                    {renderEmployee(
                      submission.employee_name,
                      submission.employee_code
                    )}
                  </TableCell>
                  <TableCell align="center" sx={styles.columnStyles.history}>
                    {renderActivityLog(submission)}
                  </TableCell>
                  <TableCell
                    sx={{
                      ...styles.columnStyles.dateRequested,
                      ...styles.cellContentStyles,
                    }}>
                    {submission.created_at
                      ? dayjs(submission.created_at).format("MMM D, YYYY")
                      : "-"}
                  </TableCell>
                  <TableCell align="center" sx={styles.columnStyles.actions}>
                    <Tooltip title="Actions">
                      <IconButton
                        onClick={(e) => handleMenuOpen(e, submission)}
                        size="small"
                        sx={{
                          color: "rgb(33, 61, 112)",
                          padding: "4px",
                          borderRadius: "6px",
                          transition: "all 0.2s ease",
                          "&:hover": {
                            backgroundColor: alpha("rgb(33, 61, 112)", 0.08),
                            transform: "translateY(-1px)",
                            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                          },
                        }}>
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
                        onClick={() => {
                          handleMenuClose(submission.id);
                        }}
                        sx={{
                          color: "#d32f2f",
                          "&:hover": {
                            backgroundColor: alpha("#d32f2f", 0.08),
                          },
                        }}>
                        <CancelIcon fontSize="small" sx={{ mr: 1 }} />
                        Cancel Request
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
