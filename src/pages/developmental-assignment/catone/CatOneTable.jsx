import React, { useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  Typography,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  CircularProgress,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import CancelIcon from "@mui/icons-material/Cancel";
import { format, parseISO } from "date-fns";
import { styles } from "../../forms/manpowerform/FormSubmissionStyles";

const CatOneTable = ({
  submissionsList = [],
  isLoadingState = false,
  error = null,
  handleRowClick,
  handleMenuOpen,
  handleMenuClose,
  handleEditSubmission,
  menuAnchor = {},
  searchQuery = "",
  selectedFilters = [],
  showArchived = false,
  hideStatusColumn = false,
  forApproval = false,
  forAssessment = false,
  useRootStatus = false,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));

  const getStatusColor = (status) => {
    const statusColors = {
      PENDING_VALIDATION: {
        bg: "#fff4e6",
        color: "#f57c00",
        label: "FOR APPROVAL",
      },
      FOR_ASSESSMENT: {
        bg: "#e3f2fd",
        color: "#1976d2",
        label: "FOR ASSESSMENT",
      },
      PENDING_SUPERIOR_INPUT: {
        bg: "#fff4e6",
        color: "#f57c00",
        label: "PENDING SUPERIOR INPUT",
      },
      PENDING_APPROVAL: {
        bg: "#fff4e6",
        color: "#f57c00",
        label: "PENDING APPROVAL",
      },
      APPROVED: { bg: "#e8f5e9", color: "#2e7d32", label: "APPROVED" },
      REJECTED: { bg: "#ffebee", color: "#d32f2f", label: "RETURNED" },
      CANCELLED: { bg: "#f5f5f5", color: "#757575", label: "CANCELLED" },
      AWAITING_RESUBMISSION: {
        bg: "#f3e5f5",
        color: "#9c27b0",
        label: "FOR SUBMISSION",
      },
      DA_IN_PROGRESS: {
        bg: "#e3f2fd",
        color: "#1976d2",
        label: "IN PROGRESS",
      },
      KICKOFF_COMPLETE: {
        bg: "#e8f5e9",
        color: "#2e7d32",
        label: "APPROVED",
      },
    };
    return (
      statusColors[status] || {
        bg: "#f5f5f5",
        color: "#757575",
        label: status?.replace(/_/g, " ")?.toUpperCase() || "UNKNOWN",
      }
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return format(parseISO(dateString), "MMM dd, yyyy");
    } catch (error) {
      return "Invalid Date";
    }
  };

  const tableColumns = useMemo(() => {
    const columns = [
      { id: "reference_number", label: "Reference Number", minWidth: 150 },
      { id: "employee_name", label: "Employee Name", minWidth: 200 },
      { id: "position_title", label: "Position", minWidth: 200 },
      { id: "department", label: "Department", minWidth: 200 },
      { id: "template_name", label: "Template Name", minWidth: 250 },
      { id: "start_date", label: "Start Date", minWidth: 130 },
      { id: "end_date", label: "End Date", minWidth: 130 },
    ];

    if (!hideStatusColumn || forAssessment) {
      columns.push({ id: "status", label: "Status", minWidth: 180 });
    }

    return columns;
  }, [hideStatusColumn, forAssessment]);

  const totalColumns = tableColumns.length;

  return (
    <TableContainer
      sx={{
        ...styles.tableContainerStyles,
        flex: 1,
        overflow: "auto",
        display: "flex",
        flexDirection: "column",
        position: "relative",
      }}>
      <Table
        stickyHeader
        sx={{
          minWidth: 1200,
          height: submissionsList.length === 0 ? "100%" : "auto",
        }}>
        <TableHead>
          <TableRow>
            {tableColumns.map((column) => (
              <TableCell
                key={column.id}
                align={column.align || "left"}
                sx={{
                  ...styles.columnStyles.id,
                  minWidth: isMobile ? "auto" : column.minWidth,
                }}>
                {column.label}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody
          sx={{ height: submissionsList.length === 0 ? "100%" : "auto" }}>
          {isLoadingState ? (
            <TableRow sx={{ height: "100%" }}>
              <TableCell
                colSpan={totalColumns}
                align="center"
                sx={{
                  ...styles.loadingCell,
                  height: "100%",
                  verticalAlign: "middle",
                }}>
                <CircularProgress size={32} sx={styles.loadingSpinner} />
              </TableCell>
            </TableRow>
          ) : error ? (
            <TableRow sx={{ height: "100%" }}>
              <TableCell
                colSpan={totalColumns}
                align="center"
                sx={{
                  ...styles.errorCell,
                  height: "100%",
                  verticalAlign: "middle",
                }}>
                <Typography color="error">
                  {error?.data?.message || "Failed to load CAT 1 submissions"}
                </Typography>
              </TableCell>
            </TableRow>
          ) : submissionsList.length > 0 ? (
            submissionsList.map((submission) => {
              const status = useRootStatus
                ? submission?.status
                : submission?.data_change?.status || submission?.status;
              const statusInfo = getStatusColor(status);
              return (
                <TableRow
                  key={submission.id}
                  onClick={() => handleRowClick(submission)}
                  sx={styles.tableRowHover(theme)}>
                  <TableCell
                    sx={{
                      ...styles.columnStyles.id,
                      ...styles.cellContentStyles,
                    }}>
                    {submission?.data_change?.reference_number || "N/A"}
                  </TableCell>
                  <TableCell
                    sx={{
                      ...styles.columnStyles.id,
                      ...styles.cellContentStyles,
                      fontWeight: 700,
                    }}>
                    {submission?.employee?.employee_name || "N/A"}
                  </TableCell>
                  <TableCell
                    sx={{
                      ...styles.columnStyles.formName,
                      ...styles.cellContentStyles,
                    }}>
                    {submission?.employee?.position_title || "N/A"}
                  </TableCell>
                  <TableCell
                    sx={{
                      ...styles.columnStyles.formName,
                      ...styles.cellContentStyles,
                    }}>
                    {submission?.employee?.department || "N/A"}
                  </TableCell>
                  <TableCell
                    sx={{
                      ...styles.columnStyles.formName,
                      ...styles.cellContentStyles,
                    }}>
                    {submission?.name || "N/A"}
                  </TableCell>
                  <TableCell
                    sx={{
                      ...styles.columnStyles.dateCreated,
                      ...styles.cellContentStyles,
                    }}>
                    {formatDate(submission?.data_change?.start_date)}
                  </TableCell>
                  <TableCell
                    sx={{
                      ...styles.columnStyles.dateCreated,
                      ...styles.cellContentStyles,
                    }}>
                    {formatDate(submission?.data_change?.end_date)}
                  </TableCell>
                  {(!hideStatusColumn || forAssessment) && (
                    <TableCell sx={styles.columnStyles.status}>
                      <Chip
                        label={statusInfo.label}
                        size="small"
                        sx={{
                          backgroundColor: statusInfo.bg,
                          color: statusInfo.color,
                          border: `1px solid ${statusInfo.color}`,
                          fontWeight: 600,
                          fontSize: "11px",
                          height: "24px",
                          borderRadius: "12px",
                          "& .MuiChip-label": {
                            padding: "0 8px",
                          },
                        }}
                      />
                    </TableCell>
                  )}
                </TableRow>
              );
            })
          ) : (
            <TableRow sx={{ height: "100%" }}>
              <TableCell
                colSpan={totalColumns}
                align="center"
                sx={{
                  ...styles.noDataContainer,
                  height: "100%",
                  verticalAlign: "middle",
                  border: "none",
                }}>
                <Box sx={styles.noDataBox}>
                  <ErrorOutlineIcon
                    sx={{
                      fontSize: 80,
                      color: "#ccc",
                      marginBottom: 2,
                    }}
                  />
                  <Typography variant="h6" color="text.secondary">
                    No CAT 1 submissions found
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {searchQuery
                      ? `No results for "${searchQuery}"`
                      : "No submissions found"}
                  </Typography>
                </Box>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default CatOneTable;
