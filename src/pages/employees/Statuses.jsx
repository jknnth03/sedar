import React, { useState, useMemo, useCallback } from "react";
import {
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  CircularProgress,
  TableRow,
  IconButton,
  Menu,
  MenuItem,
  Box,
  Chip,
  useTheme,
  alpha,
} from "@mui/material";
import {
  MoreVert as MoreVertIcon,
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Download as DownloadIcon,
} from "@mui/icons-material";
import { useSnackbar } from "notistack";
import { useGetStatusQuery } from "../../features/api/employee/statusApi";
import StatusModal from "../../components/modal/employee/StatusModal";
import "../../pages/GeneralStyle.scss";
import "../../pages/GeneralTable.scss";
import { CONSTANT } from "../../config/index";

const Status = ({ searchQuery, showArchived, debounceValue }) => {
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();

  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [menuAnchor, setMenuAnchor] = useState({});

  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [statusModalMode, setStatusModalMode] = useState("view");
  const [selectedEmployeeStatus, setSelectedEmployeeStatus] = useState(null);

  React.useEffect(() => {
    setPage(1);
  }, [debounceValue, showArchived]);

  const queryParams = useMemo(
    () => ({
      page,
      per_page: rowsPerPage,
      status: showArchived ? "inactive" : "active",
      search: debounceValue || "",
    }),
    [page, rowsPerPage, showArchived, debounceValue]
  );

  const {
    data: apiResponse,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useGetStatusQuery(queryParams, {
    refetchOnMountOrArgChange: true,
  });

  const validateDate = useCallback((dateString) => {
    if (
      !dateString ||
      dateString === "" ||
      dateString === "0000-00-00" ||
      dateString === "1900-01-01" ||
      dateString === "null" ||
      dateString === "undefined"
    ) {
      return null;
    }

    try {
      const date = new Date(dateString);
      if (
        isNaN(date.getTime()) ||
        date.getFullYear() < 1900 ||
        date.getFullYear() > 2100
      ) {
        return null;
      }
      return dateString;
    } catch (error) {
      return null;
    }
  }, []);

  const shouldShowDate = useCallback(
    (statusLabel, dateType, dateValue) => {
      if (!statusLabel) return false;

      if (!validateDate(dateValue)) return false;

      const status = statusLabel.toLowerCase();

      switch (dateType) {
        case "start_date":
          return [
            "extended",
            "probationary",
            "suspended",
            "maternity",
            "terminated",
            "resigned",
          ].includes(status);

        case "end_date":
          return [
            "extended",
            "probationary",
            "suspended",
            "maternity",
          ].includes(status);

        case "effectivity_date":
          return [
            "extended",
            "probationary",
            "suspended",
            "maternity",
            "terminated",
            "resigned",
          ].includes(status);

        default:
          return false;
      }
    },
    [validateDate]
  );

  const { employeeStatusList, totalCount } = useMemo(() => {
    const result = apiResponse?.result;
    const data = result?.data || [];

    const transformedData = data.map((item) => ({
      id: item.id,
      employee_id: item.employee?.id,
      employee: {
        id: item.employee?.id,
        employee_code: item.employee?.employee_code,
        full_name: item.employee?.full_name || formatFullName(item.employee),
        first_name: item.employee?.first_name,
        middle_name: item.employee?.middle_name,
        last_name: item.employee?.last_name,
        email: item.employee?.email,
        current_status: item.employee?.current_status,
      },
      employee_status_label: item.employee_status_label || "N/A",
      employee_status: item.employee_status || "active",
      employee_status_start_date: validateDate(item.employee_status_start_date),
      employee_status_end_date: validateDate(item.employee_status_end_date),
      employee_status_effectivity_date: validateDate(
        item.employee_status_effectivity_date
      ),
      employee_status_attachment: item.employee_status_attachment,
      employee_status_remarks: item.employee_status_remarks,
      is_current: item.is_current || false,
      created_at: item.created_at,
      updated_at: item.updated_at,
    }));

    return {
      employeeStatusList: transformedData,
      totalCount: result?.total || data.length,
    };
  }, [apiResponse, validateDate]);

  const formatFullName = useCallback((employee) => {
    if (!employee) return "N/A";
    if (employee.full_name) return employee.full_name;

    const parts = [
      employee.first_name,
      employee.middle_name,
      employee.last_name,
    ].filter(Boolean);

    return parts.length > 0 ? parts.join(" ") : "N/A";
  }, []);

  const handleMenuOpen = useCallback((event, statusId) => {
    event.stopPropagation();
    setMenuAnchor((prev) => ({
      ...prev,
      [statusId]: event.currentTarget,
    }));
  }, []);

  const handleMenuClose = useCallback((statusId) => {
    setMenuAnchor((prev) => ({ ...prev, [statusId]: null }));
  }, []);

  const openStatusModal = useCallback((employeeStatus, mode) => {
    setSelectedEmployeeStatus(employeeStatus);
    setStatusModalMode(mode);
    setStatusModalOpen(true);
  }, []);

  const handleViewStatus = useCallback(
    (employeeStatus, event) => {
      if (event) event.stopPropagation();
      handleMenuClose(employeeStatus.id);
      openStatusModal(employeeStatus, "view");
    },
    [handleMenuClose, openStatusModal]
  );

  const handleEditStatus = useCallback(
    (employeeStatus, event) => {
      if (event) event.stopPropagation();
      handleMenuClose(employeeStatus.id);
      openStatusModal(employeeStatus, "edit");
    },
    [handleMenuClose, openStatusModal]
  );

  const handleDownloadAttachment = useCallback(
    (employeeStatus, event) => {
      if (event) event.stopPropagation();
      handleMenuClose(employeeStatus.id);

      if (employeeStatus.employee_status_attachment) {
        const link = document.createElement("a");
        link.href = employeeStatus.employee_status_attachment;
        link.download = `employee_${employeeStatus.employee_id}_status_attachment`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        enqueueSnackbar("Attachment downloaded successfully!", {
          variant: "success",
          autoHideDuration: 3000,
        });
      } else {
        enqueueSnackbar("No attachment available", {
          variant: "warning",
          autoHideDuration: 3000,
        });
      }
    },
    [handleMenuClose, enqueueSnackbar]
  );

  const handleRowClick = useCallback(
    (employeeStatus) => {
      openStatusModal(employeeStatus, "view");
    },
    [openStatusModal]
  );

  const handleStatusModalClose = useCallback(() => {
    setStatusModalOpen(false);
    setStatusModalMode("view");
    setSelectedEmployeeStatus(null);
  }, []);

  const handleStatusModalSubmit = useCallback(
    async (data) => {
      try {
        await refetch();
        enqueueSnackbar("Employee status updated successfully!", {
          variant: "success",
          autoHideDuration: 3000,
        });
      } catch (error) {
        enqueueSnackbar("Failed to update employee status", {
          variant: "error",
          autoHideDuration: 3000,
        });
        throw error;
      }
    },
    [refetch, enqueueSnackbar]
  );

  const safelyDisplayValue = useCallback(
    (value) => (value === null || value === undefined ? "N/A" : String(value)),
    []
  );

  const formatEmployeeName = useCallback((employee) => {
    if (!employee) return "N/A";

    if (employee.full_name && employee.full_name !== "N/A") {
      return employee.full_name;
    }

    const parts = [
      employee.last_name,
      employee.first_name,
      employee.middle_name,
    ].filter(Boolean);

    return parts.length > 0
      ? parts.join(", ")
      : employee.employee_code || "N/A";
  }, []);

  const formatDate = useCallback((dateString) => {
    if (
      !dateString ||
      dateString === "" ||
      dateString === "0000-00-00" ||
      dateString === "1900-01-01" ||
      dateString === "null" ||
      dateString === "undefined"
    ) {
      return "N/A";
    }

    try {
      const date = new Date(dateString);

      if (
        isNaN(date.getTime()) ||
        date.getFullYear() < 1900 ||
        date.getFullYear() > 2100
      ) {
        return "N/A";
      }

      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch (error) {
      return "N/A";
    }
  }, []);

  const formatDateWithStatus = useCallback(
    (dateString, statusLabel, dateType) => {
      if (!shouldShowDate(statusLabel, dateType, dateString)) {
        return "N/A";
      }

      return formatDate(dateString);
    },
    [shouldShowDate, formatDate]
  );

  const getEmployeeStatusChipColor = useCallback((status) => {
    if (!status) return "default";

    switch (status.toLowerCase()) {
      case "probationary":
        return "warning";
      case "regular":
        return "success";
      case "active":
        return "success";
      case "inactive":
        return "error";
      case "suspended":
        return "warning";
      case "terminated":
        return "error";
      case "extended":
        return "primary";
      case "maternity":
        return "info";
      case "resigned":
        return "default";
      case "end of contract":
        return "default";
      case "blacklisted":
        return "error";
      case "dismissed":
        return "error";
      case "deceased":
        return "secondary";
      default:
        return "default";
    }
  }, []);

  const getNoDataMessage = useCallback(() => {
    if (debounceValue) {
      return `No results found for "${debounceValue}"`;
    }
    return showArchived
      ? "No archived employee statuses found"
      : "No active employee statuses found";
  }, [debounceValue, showArchived]);

  return (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        minHeight: 0,
      }}>
      <Paper
        className="container"
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          minHeight: 0,
          borderRadius: 2,
        }}>
        <TableContainer
          className="table-container"
          sx={{
            flex: 1,
            overflowX: "auto",
            overflowY: "auto",
            width: "100%",
            maxWidth: "100%",
            minHeight: 0,
          }}>
          <Table stickyHeader sx={{ width: "100%", tableLayout: "fixed" }}>
            <TableHead>
              <TableRow>
                <TableCell className="table-header3" sx={{ width: "80px" }}>
                  ID
                </TableCell>
                <TableCell className="table-header" sx={{ width: "120px" }}>
                  EMPLOYEE CODE
                </TableCell>
                <TableCell className="table-header" sx={{ width: "250px" }}>
                  EMPLOYEE NAME
                </TableCell>
                <TableCell className="table-header" sx={{ width: "140px" }}>
                  STATUS
                </TableCell>
                <TableCell className="table-header" sx={{ width: "120px" }}>
                  START DATE
                </TableCell>
                <TableCell className="table-header" sx={{ width: "120px" }}>
                  END DATE
                </TableCell>
                <TableCell className="table-header" sx={{ width: "140px" }}>
                  EFFECTIVITY DATE
                </TableCell>
                <TableCell className="table-header" sx={{ width: "120px" }}>
                  ATTACHMENT
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isFetching ? (
                <TableRow>
                  <TableCell colSpan={9} align="center">
                    <Box sx={{ py: 4 }}>
                      <CircularProgress size={32} />
                      <Typography variant="body2" sx={{ mt: 2 }}>
                        Loading employee statuses...
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={9} align="center" className="table-cell">
                    <Typography color="error">
                      Error: {error?.data?.message || "Failed to load data"}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : employeeStatusList.length > 0 ? (
                employeeStatusList.map((employeeStatus) => (
                  <TableRow
                    key={employeeStatus.id}
                    onClick={() => handleRowClick(employeeStatus)}
                    sx={{
                      cursor: "pointer",
                      "&:hover": {
                        backgroundColor: alpha(
                          theme.palette.primary.main,
                          0.04
                        ),
                        "& .MuiTableCell-root": {
                          backgroundColor: "transparent",
                        },
                      },
                      transition: "background-color 0.2s ease",
                    }}>
                    <TableCell className="table-cell4" sx={{ width: "80px" }}>
                      {safelyDisplayValue(employeeStatus.id)}
                    </TableCell>
                    <TableCell
                      className="table-cell"
                      sx={{
                        width: "120px",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}>
                      {safelyDisplayValue(
                        employeeStatus.employee?.employee_code
                      )}
                    </TableCell>
                    <TableCell
                      className="table-cell"
                      sx={{
                        width: "250px",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        fontWeight: 500,
                      }}
                      title={formatEmployeeName(employeeStatus.employee)}>
                      {formatEmployeeName(employeeStatus.employee)}
                    </TableCell>
                    <TableCell className="table-cell2" sx={{ width: "140px" }}>
                      <Chip
                        label={safelyDisplayValue(
                          employeeStatus.employee_status_label
                        )}
                        color={getEmployeeStatusChipColor(
                          employeeStatus.employee_status_label
                        )}
                        variant="outlined"
                        size="small"
                        sx={{
                          fontWeight: 500,
                          textTransform: "uppercase",
                        }}
                      />
                    </TableCell>
                    <TableCell className="table-cell" sx={{ width: "120px" }}>
                      {formatDateWithStatus(
                        employeeStatus.employee_status_start_date,
                        employeeStatus.employee_status_label,
                        "start_date"
                      )}
                    </TableCell>
                    <TableCell className="table-cell" sx={{ width: "120px" }}>
                      {formatDateWithStatus(
                        employeeStatus.employee_status_end_date,
                        employeeStatus.employee_status_label,
                        "end_date"
                      )}
                    </TableCell>
                    <TableCell className="table-cell" sx={{ width: "140px" }}>
                      {formatDateWithStatus(
                        employeeStatus.employee_status_effectivity_date,
                        employeeStatus.employee_status_label,
                        "effectivity_date"
                      )}
                    </TableCell>
                    <TableCell
                      className="table-cell"
                      sx={{
                        width: "120px",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}>
                      {employeeStatus.employee_status_attachment ? (
                        <Chip
                          label="Available"
                          color="info"
                          variant="outlined"
                          size="small"
                          sx={{ fontWeight: 500, cursor: "pointer" }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDownloadAttachment(employeeStatus, e);
                          }}
                        />
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          N/A
                        </Typography>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={9}
                    align="center"
                    sx={{ border: "none", py: 8 }}>
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 2,
                      }}>
                      {CONSTANT.BUTTONS.NODATA.icon}
                      <Typography variant="h6" color="text.secondary">
                        No employee statuses found
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

        <Box sx={{ flexShrink: 0 }}>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25, 50, 100]}
            component="div"
            count={totalCount}
            rowsPerPage={rowsPerPage}
            page={page - 1}
            onPageChange={(event, newPage) => setPage(newPage + 1)}
            onRowsPerPageChange={(event) => {
              setRowsPerPage(parseInt(event.target.value, 10));
              setPage(1);
            }}
            sx={{
              borderTop: `1px solid ${theme.palette.divider}`,
              backgroundColor: alpha(theme.palette.background.paper, 0.6),
              minHeight: "52px",
              "& .MuiTablePagination-toolbar": {
                paddingLeft: theme.spacing(2),
                paddingRight: theme.spacing(1),
              },
              "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows":
                {
                  margin: 0,
                  fontSize: "0.875rem",
                },
            }}
          />
        </Box>
      </Paper>

      <StatusModal
        open={statusModalOpen}
        onClose={handleStatusModalClose}
        employeeData={selectedEmployeeStatus}
        onSubmit={handleStatusModalSubmit}
        mode={statusModalMode}
        allowEdit={true}
      />
    </Box>
  );
};

export default Status;
