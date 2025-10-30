import React, { useCallback, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Box,
  Chip,
  CircularProgress,
  Typography,
  useTheme,
  alpha,
  IconButton,
  Tooltip,
} from "@mui/material";
import FilterListIcon from "@mui/icons-material/FilterList";
import { CONSTANT } from "../../config/index";

const StatusesTable = ({
  employeeStatusList,
  isFetching,
  error,
  onRowClick,
  onFilterIconClick,
  hasActiveFilters,
  getNoDataMessage,
}) => {
  const theme = useTheme();

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
      employee.first_name,
      employee.middle_name,
      employee.last_name,
    ].filter(Boolean);

    return parts.length > 0 ? parts.join(" ") : employee.employee_code || "N/A";
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
            "regular",
            "suspended",
            "maternity",
            "terminated",
            "dismissed",
            "resigned",
            "blacklisted",
            "back out",
            "end of contract",
            "deceased",
            "returned to agency",
            "absent without leave",
          ].includes(status);

        case "end_date":
          return [
            "extended",
            "probationary",
            "suspended",
            "maternity",
            "terminated",
            "dismissed",
            "back out",
            "end of contract",
            "absent without leave",
          ].includes(status);

        case "effectivity_date":
          return [
            "extended",
            "probationary",
            "regular",
            "suspended",
            "maternity",
            "terminated",
            "dismissed",
            "resigned",
            "blacklisted",
            "back out",
            "end of contract",
            "deceased",
            "returned to agency",
            "absent without leave",
          ].includes(status);

        default:
          return false;
      }
    },
    [validateDate]
  );

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

  const getEmployeeStatusChipStyle = useCallback((status) => {
    if (!status) return {};

    const statusLower = status.toLowerCase();

    switch (statusLower) {
      case "pending":
        return {
          backgroundColor: "#FFF4E6",
          color: "#E65100",
          "&:hover": { backgroundColor: "#FFE0B2" },
        };
      case "probationary":
        return {
          backgroundColor: "#FFF3E0",
          color: "#F57C00",
          "&:hover": { backgroundColor: "#FFE0B2" },
        };
      case "regular":
      case "active":
        return {
          backgroundColor: "#E8F5E8",
          color: "#2E7D32",
          "&:hover": { backgroundColor: "#C8E6C9" },
        };
      case "inactive":
      case "terminated":
      case "blacklisted":
      case "dismissed":
        return {
          backgroundColor: "#FFEBEE",
          color: "#C62828",
          "&:hover": { backgroundColor: "#FFCDD2" },
        };
      case "suspended":
      case "back out":
        return {
          backgroundColor: "#FFF3E0",
          color: "#F57C00",
          "&:hover": { backgroundColor: "#FFE0B2" },
        };
      case "extended":
        return {
          backgroundColor: "#E3F2FD",
          color: "#1565C0",
          "&:hover": { backgroundColor: "#BBDEFB" },
        };
      case "maternity":
        return {
          backgroundColor: "#E0F2F1",
          color: "#00695C",
          "&:hover": { backgroundColor: "#B2DFDB" },
        };
      case "resigned":
      case "end of contract":
      case "deceased":
      case "returned to agency":
        return {
          backgroundColor: "#F5F5F5",
          color: "#616161",
          "&:hover": { backgroundColor: "#EEEEEE" },
        };
      case "absent without leave":
        return {
          backgroundColor: "#FFF3E0",
          color: "#F57C00",
          "&:hover": { backgroundColor: "#FFE0B2" },
        };
      default:
        return {
          backgroundColor: "#F5F5F5",
          color: "#616161",
          "&:hover": { backgroundColor: "#EEEEEE" },
        };
    }
  }, []);

  const handleRowClick = useCallback(
    (employeeStatus) => {
      onRowClick?.(employeeStatus);
    },
    [onRowClick]
  );

  const handleFilterIconClick = useCallback(
    (event) => {
      event.stopPropagation();
      onFilterIconClick?.(event);
    },
    [onFilterIconClick]
  );

  return (
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
      <Table stickyHeader sx={{ minWidth: 1400, width: "max-content" }}>
        <TableHead>
          <TableRow>
            <TableCell className="table-header" sx={{ width: "400px" }}>
              FULL NAME
            </TableCell>
            <TableCell className="table-header" sx={{ width: "350px" }}>
              CHARGING
            </TableCell>
            <TableCell className="table-header" sx={{ width: "220px" }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                STATUS
                <Tooltip title="Filter by Status" arrow>
                  <IconButton
                    size="small"
                    onClick={handleFilterIconClick}
                    sx={{
                      padding: "4px",
                      color: hasActiveFilters
                        ? "rgb(33, 61, 112)"
                        : "rgba(0, 0, 0, 0.54)",
                      backgroundColor: hasActiveFilters
                        ? "rgba(33, 61, 112, 0.1)"
                        : "transparent",
                      "&:hover": {
                        backgroundColor: "rgba(33, 61, 112, 0.1)",
                        color: "rgb(33, 61, 112)",
                      },
                      transition: "all 0.2s ease-in-out",
                    }}>
                    <FilterListIcon sx={{ fontSize: "18px" }} />
                  </IconButton>
                </Tooltip>
              </Box>
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
              <TableCell colSpan={6} align="center">
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
              <TableCell colSpan={6} align="center" className="table-cell">
                <Typography color="error">
                  Error: {error?.data?.message || "Failed to load data"}
                </Typography>
              </TableCell>
            </TableRow>
          ) : employeeStatusList.length > 0 ? (
            employeeStatusList.map((employeeStatus) => {
              const charging = employeeStatus.employee?.charging;

              return (
                <TableRow
                  key={employeeStatus.id}
                  onClick={() => handleRowClick(employeeStatus)}
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
                    className="table-cell"
                    sx={{
                      width: "400px",
                      minWidth: "350px",
                    }}>
                    <Box>
                      <Typography
                        sx={{
                          fontWeight: 500,
                          fontSize: "0.875rem",
                          lineHeight: 1.4,
                        }}>
                        {formatEmployeeName(employeeStatus.employee)}
                      </Typography>
                      <Typography
                        sx={{
                          fontSize: "0.75rem",
                          color: "text.secondary",
                          lineHeight: 1.2,
                          mt: 0.3,
                        }}>
                        {safelyDisplayValue(
                          employeeStatus.employee?.employee_code
                        )}
                      </Typography>
                    </Box>
                  </TableCell>

                  <TableCell
                    sx={{
                      width: "350px",
                      minWidth: "300px",
                      paddingY: 1.5,
                    }}>
                    <Box>
                      {charging ? (
                        <>
                          {charging.code && charging.name && (
                            <Typography
                              sx={{
                                fontSize: "0.75rem",
                                lineHeight: 1.4,
                                color: "text.primary",
                              }}>
                              ({charging.code}) - {charging.name}
                            </Typography>
                          )}
                          {charging.company_code && charging.company_name && (
                            <Typography
                              sx={{
                                fontSize: "0.75rem",
                                lineHeight: 1.4,
                                color: "text.primary",
                              }}>
                              ({charging.company_code}) -{" "}
                              {charging.company_name}
                            </Typography>
                          )}
                          {charging.business_unit_code &&
                            charging.business_unit_name && (
                              <Typography
                                sx={{
                                  fontSize: "0.75rem",
                                  lineHeight: 1.4,
                                  color: "text.primary",
                                }}>
                                ({charging.business_unit_code}) -{" "}
                                {charging.business_unit_name}
                              </Typography>
                            )}
                          {charging.department_code &&
                            charging.department_name && (
                              <Typography
                                sx={{
                                  fontSize: "0.75rem",
                                  lineHeight: 1.4,
                                  color: "text.primary",
                                }}>
                                ({charging.department_code}) -{" "}
                                {charging.department_name}
                              </Typography>
                            )}
                          {charging.unit_code && charging.unit_name && (
                            <Typography
                              sx={{
                                fontSize: "0.75rem",
                                lineHeight: 1.4,
                                color: "text.primary",
                              }}>
                              ({charging.unit_code}) - {charging.unit_name}
                            </Typography>
                          )}
                          {charging.sub_unit_code && charging.sub_unit_name && (
                            <Typography
                              sx={{
                                fontSize: "0.75rem",
                                lineHeight: 1.4,
                                color: "text.primary",
                              }}>
                              ({charging.sub_unit_code}) -{" "}
                              {charging.sub_unit_name}
                            </Typography>
                          )}
                          {charging.location_code && charging.location_name && (
                            <Typography
                              sx={{
                                fontSize: "0.75rem",
                                lineHeight: 1.4,
                                color: "text.primary",
                              }}>
                              ({charging.location_code}) -{" "}
                              {charging.location_name}
                            </Typography>
                          )}
                        </>
                      ) : (
                        <Typography
                          sx={{
                            fontSize: "0.75rem",
                            color: "text.secondary",
                          }}>
                          N/A
                        </Typography>
                      )}
                    </Box>
                  </TableCell>

                  <TableCell
                    className="table-cell2"
                    sx={{
                      width: "220px",
                      overflow: "hidden",
                    }}>
                    <Chip
                      label={safelyDisplayValue(
                        employeeStatus.employee_status_label
                      )}
                      variant="filled"
                      size="small"
                      sx={{
                        fontWeight: 500,
                        textTransform: "uppercase",
                        maxWidth: "100%",
                        borderRadius: "16px",
                        height: "24px",
                        fontSize: "0.75rem",
                        letterSpacing: "0.5px",
                        border: "none",
                        boxShadow: "none",
                        ...getEmployeeStatusChipStyle(
                          employeeStatus.employee_status_label
                        ),
                        "& .MuiChip-label": {
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          maxWidth: "180px",
                          padding: "0 12px",
                        },
                      }}
                    />
                  </TableCell>

                  <TableCell className="table-cell" sx={{ width: "160px" }}>
                    {formatDateWithStatus(
                      employeeStatus.employee_status_start_date,
                      employeeStatus.employee_status_label,
                      "start_date"
                    )}
                  </TableCell>
                  <TableCell className="table-cell" sx={{ width: "160px" }}>
                    {formatDateWithStatus(
                      employeeStatus.employee_status_end_date,
                      employeeStatus.employee_status_label,
                      "end_date"
                    )}
                  </TableCell>
                  <TableCell className="table-cell" sx={{ width: "220px" }}>
                    {formatDateWithStatus(
                      employeeStatus.employee_status_effectivity_date,
                      employeeStatus.employee_status_label,
                      "effectivity_date"
                    )}
                  </TableCell>
                </TableRow>
              );
            })
          ) : (
            <TableRow>
              <TableCell
                colSpan={6}
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
                    {getNoDataMessage?.()}
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

export default StatusesTable;
