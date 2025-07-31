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
  Box,
  Chip,
  useTheme,
  alpha,
} from "@mui/material";
import { useSnackbar } from "notistack";
import { useGetStatusesQuery } from "../../features/api/employee/statusApi";
import StatusModal from "../../components/modal/employee/multiFormModal/status/StatusModal";
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
  } = useGetStatusesQuery(queryParams, {
    refetchOnMountOrArgChange: true,
  });

  const getBaseUrl = useCallback(() => {
    return `${window.location.protocol}//${window.location.host}`;
  }, []);

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

  const { employeeStatusList, totalCount } = useMemo(() => {
    const result = apiResponse?.result;
    const data = result?.data || [];

    const transformedData = data.map((item) => {
      const latestStatus = item.latest_status || {};

      return {
        id: latestStatus.id || item.employee_id,
        employee_id: item.employee_id,
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
        employee_status_label: latestStatus.employee_status_label || "N/A",
        employee_status: latestStatus.employee_status || "active",
        employee_status_start_date: validateDate(
          latestStatus.employee_status_start_date
        ),
        employee_status_end_date: validateDate(
          latestStatus.employee_status_end_date
        ),
        employee_status_effectivity_date: validateDate(
          latestStatus.employee_status_effectivity_date
        ),
        employee_status_attachment: latestStatus.employee_status_attachment
          ? `${getBaseUrl()}/${latestStatus.employee_status_attachment}`
          : null,
        employee_status_attachment_path:
          latestStatus.employee_status_attachment,
        employee_status_remarks: latestStatus.employee_status_remarks,
        is_current: true,
        created_at: latestStatus.created_at || item.created_at,
        updated_at: latestStatus.updated_at || item.updated_at,
      };
    });

    return {
      employeeStatusList: transformedData,
      totalCount: result?.total || data.length,
    };
  }, [apiResponse, validateDate, getBaseUrl, formatFullName]);

  const handleMenuClose = useCallback((statusId) => {
    setMenuAnchor((prev) => ({ ...prev, [statusId]: null }));
  }, []);

  const openStatusModal = useCallback((employeeStatus, mode) => {
    setSelectedEmployeeStatus(employeeStatus);
    setStatusModalMode(mode);
    setStatusModalOpen(true);
  }, []);

  const handleDownloadAttachment = useCallback(
    (employeeStatus, event) => {
      if (event) event.stopPropagation();
      handleMenuClose(employeeStatus.id);

      if (employeeStatus.employee_status_attachment) {
        try {
          const link = document.createElement("a");
          link.href = employeeStatus.employee_status_attachment;
          link.download = `employee_${employeeStatus.employee_id}_status_attachment`;
          link.target = "_blank";
          link.rel = "noopener noreferrer";
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);

          enqueueSnackbar("Attachment downloaded successfully!", {
            variant: "success",
            autoHideDuration: 3000,
          });
        } catch (error) {
          enqueueSnackbar("Failed to download attachment", {
            variant: "error",
            autoHideDuration: 3000,
          });
        }
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

  const createFormData = useCallback((data) => {
    const formData = new FormData();

    if (data.status_entries && data.status_entries.length > 0) {
      data.status_entries.forEach((entry, index) => {
        formData.append(
          `status_entries[${index}][employee_id]`,
          entry.employee_id || ""
        );
        formData.append(
          `status_entries[${index}][employee_status_label]`,
          entry.employee_status_label || ""
        );
        formData.append(
          `status_entries[${index}][employee_status]`,
          entry.employee_status || "active"
        );
        formData.append(
          `status_entries[${index}][employee_status_start_date]`,
          entry.employee_status_start_date || ""
        );
        formData.append(
          `status_entries[${index}][employee_status_end_date]`,
          entry.employee_status_end_date || ""
        );
        formData.append(
          `status_entries[${index}][employee_status_effectivity_date]`,
          entry.employee_status_effectivity_date || ""
        );
        formData.append(
          `status_entries[${index}][employee_status_remarks]`,
          entry.employee_status_remarks || ""
        );
        formData.append(
          `status_entries[${index}][is_current]`,
          entry.is_current ? "1" : "0"
        );

        if (entry.employee_status_attachment) {
          if (entry.employee_status_attachment instanceof File) {
            formData.append(
              `status_entries[${index}][employee_status_attachment]`,
              entry.employee_status_attachment
            );
          } else if (
            entry.employee_status_attachment instanceof FileList &&
            entry.employee_status_attachment.length > 0
          ) {
            formData.append(
              `status_entries[${index}][employee_status_attachment]`,
              entry.employee_status_attachment[0]
            );
          }
        }
      });
    } else {
      formData.append("employee_id", data.employee_id || "");
      formData.append(
        "employee_status_label",
        data.employee_status_label || ""
      );
      formData.append("employee_status", data.employee_status || "active");
      formData.append(
        "employee_status_start_date",
        data.employee_status_start_date || ""
      );
      formData.append(
        "employee_status_end_date",
        data.employee_status_end_date || ""
      );
      formData.append(
        "employee_status_effectivity_date",
        data.employee_status_effectivity_date || ""
      );
      formData.append(
        "employee_status_remarks",
        data.employee_status_remarks || ""
      );
      formData.append("is_current", data.is_current ? "1" : "0");

      if (data.employee_status_attachment) {
        if (data.employee_status_attachment instanceof File) {
          formData.append(
            "employee_status_attachment",
            data.employee_status_attachment
          );
        } else if (
          data.employee_status_attachment instanceof FileList &&
          data.employee_status_attachment.length > 0
        ) {
          formData.append(
            "employee_status_attachment",
            data.employee_status_attachment[0]
          );
        }
      }
    }

    return formData;
  }, []);

  const handleStatusModalSubmit = useCallback(
    async (data) => {
      try {
        const formData = createFormData(data);

        const response = await fetch("/api/employee/status", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.message || "Failed to update employee status"
          );
        }

        await refetch();
        enqueueSnackbar("Employee status updated successfully!", {
          variant: "success",
          autoHideDuration: 3000,
        });
      } catch (error) {
        enqueueSnackbar(error.message || "Failed to update employee status", {
          variant: "error",
          autoHideDuration: 3000,
        });
        throw error;
      }
    },
    [createFormData, refetch, enqueueSnackbar]
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
      case "returned to agency":
        return "secondary";
      case "back out":
        return "warning";
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
                <TableCell className="table-header" sx={{ width: "300px" }}>
                  EMPLOYEE NAME
                </TableCell>
                <TableCell className="table-header" sx={{ width: "220px" }}>
                  LATEST STATUS
                </TableCell>
                <TableCell className="table-header" sx={{ width: "160px" }}>
                  START DATE
                </TableCell>
                <TableCell className="table-header" sx={{ width: "160px" }}>
                  END DATE
                </TableCell>
                <TableCell className="table-header" sx={{ width: "220px" }}>
                  EFFECTIVITY DATE
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isFetching ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
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
                  <TableCell colSpan={8} align="center" className="table-cell">
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
                        width: "280px",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        fontWeight: 500,
                      }}
                      title={formatEmployeeName(employeeStatus.employee)}>
                      {formatEmployeeName(employeeStatus.employee)}
                    </TableCell>

                    <TableCell
                      className="table-cell2"
                      sx={{
                        width: "180px",
                        overflow: "hidden",
                      }}>
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
                          maxWidth: "100%",
                          "& .MuiChip-label": {
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            maxWidth: "150px",
                          },
                        }}
                      />
                    </TableCell>

                    <TableCell className="table-cell" sx={{ width: "130px" }}>
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
                    <TableCell className="table-cell" sx={{ width: "160px" }}>
                      {formatDateWithStatus(
                        employeeStatus.employee_status_effectivity_date,
                        employeeStatus.employee_status_label,
                        "effectivity_date"
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={8}
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
