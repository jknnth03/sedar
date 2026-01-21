import React, { useState, useMemo, useCallback, useEffect } from "react";
import {
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  CircularProgress,
  TableRow,
  Box,
  Chip,
  useTheme,
  alpha,
} from "@mui/material";
import { useSnackbar } from "notistack";
import { useGetGeneralsQuery } from "../../features/api/employee/generalApi";
import { useRememberQueryParams } from "../../hooks/useRememberQueryParams";
import { CONSTANT } from "../../config/index";
import EmployeeWizardForm from "../../components/modal/employee/multiFormModal/EmployeeWizardForm";
import "../../pages/GeneralStyle.scss";
import { useLazyGetSingleEmployeeQuery } from "../../features/api/employee/mainApi";
import CustomTablePagination from "../zzzreusable/CustomTablePagination";

const General = ({
  searchQuery: parentSearchQuery,
  debounceValue: parentDebounceValue,
  onSearchChange,
  filters = {},
  isLoading: parentIsLoading = false,
}) => {
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();

  const [queryParams, setQueryParams] = useRememberQueryParams();

  const [page, setPage] = useState(parseInt(queryParams?.page) || 1);
  const [rowsPerPage, setRowsPerPage] = useState(
    parseInt(queryParams?.rowsPerPage) || 10
  );

  const searchQuery =
    parentSearchQuery !== undefined ? parentSearchQuery : queryParams?.q ?? "";
  const debounceValue =
    parentDebounceValue !== undefined ? parentDebounceValue : searchQuery;

  const [getSingleEmployee] = useLazyGetSingleEmployeeQuery();

  const [wizardOpen, setWizardOpen] = useState(false);
  const [wizardMode, setWizardMode] = useState("create");
  const [wizardInitialData, setWizardInitialData] = useState(null);

  const apiQueryParams = useMemo(() => {
    const params = {
      pagination: page,
      page: page,
      per_page: rowsPerPage,
    };

    if (debounceValue && debounceValue.trim()) {
      params.search = debounceValue;
    }

    if (filters?.status) {
      params.employment_status = filters.status;
    }

    if (filters?.name) {
      params.employee_name = filters.name;
    }

    if (filters?.team) {
      params.team_name = filters.team;
    }

    if (filters?.idNumber) {
      params.id_number = filters.idNumber;
    }

    if (filters?.dateHiredFrom) {
      params.date_hired_from = filters.dateHiredFrom;
    }

    if (filters?.dateHiredTo) {
      params.date_hired_to = filters.dateHiredTo;
    }

    if (filters?.type) {
      params.employment_type = filters.type;
    }

    if (filters?.department) {
      params.department_name = filters.department;
    }

    if (filters?.manpower) {
      params.manpower_form = filters.manpower;
    }

    if (filters?.position) {
      params.position_title = filters.position;
    }

    return params;
  }, [debounceValue, page, rowsPerPage, filters]);

  useEffect(() => {
    setPage(1);
  }, [searchQuery, filters]);

  const {
    data: employees,
    isLoading,
    isFetching,
    refetch,
  } = useGetGeneralsQuery(apiQueryParams);

  const employeeList = useMemo(
    () => employees?.result?.data || [],
    [employees]
  );

  const totalCount = useMemo(() => employees?.result?.total || 0, [employees]);

  const handleSearchChange = useCallback(
    (event) => {
      const value = event.target.value;

      if (onSearchChange) {
        onSearchChange(value);
      }

      setPage(1);
    },
    [onSearchChange]
  );

  const openWizard = useCallback(
    async (general, mode) => {
      try {
        const response = await getSingleEmployee(general?.id, true).unwrap();

        setWizardInitialData(response?.result);
        setWizardMode(mode);
        setWizardOpen(true);
      } catch (error) {
        console.error("Error loading employee details:", error);
        enqueueSnackbar("Failed to load employee details", {
          variant: "error",
          autoHideDuration: 2000,
        });
      }
    },
    [getSingleEmployee, enqueueSnackbar]
  );

  const handleRowClick = useCallback(
    async (general) => {
      await openWizard(general, "view");
    },
    [openWizard]
  );

  const handleWizardClose = useCallback(() => {
    setWizardOpen(false);
    setWizardMode("create");
    setWizardInitialData(null);
  }, []);

  const handleWizardSubmit = useCallback(
    async (data, mode, result) => {
      await refetch();
      enqueueSnackbar(
        `Employee ${mode === "create" ? "created" : "updated"} successfully!`,
        { variant: "success", autoHideDuration: 3000 }
      );
    },
    [refetch, enqueueSnackbar]
  );

  const handlePageChange = useCallback(
    (event, newPage) => {
      const targetPage = newPage + 1;
      setPage(targetPage);
      if (setQueryParams) {
        setQueryParams(
          {
            ...queryParams,
            page: targetPage,
            rowsPerPage: rowsPerPage,
          },
          { retain: false }
        );
      }
    },
    [setQueryParams, rowsPerPage, queryParams]
  );

  const handleRowsPerPageChange = useCallback(
    (event) => {
      const newRowsPerPage = parseInt(event.target.value, 10);
      const newPage = 1;
      setRowsPerPage(newRowsPerPage);
      setPage(newPage);
      if (setQueryParams) {
        setQueryParams(
          {
            ...queryParams,
            page: newPage,
            rowsPerPage: newRowsPerPage,
          },
          { retain: false }
        );
      }
    },
    [setQueryParams, queryParams]
  );

  const safelyDisplayValue = useCallback(
    (value) => (value === null || value === undefined ? "N/A" : String(value)),
    []
  );

  const formatDate = useCallback((dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return dateString;
    }
  }, []);

  const formatReligion = useCallback((religion) => {
    if (!religion) return "N/A";
    if (typeof religion === "object" && religion.name) {
      return religion.name;
    }
    if (typeof religion === "string") {
      return religion;
    }
    return "N/A";
  }, []);

  const formatReferredBy = useCallback((referredBy) => {
    if (!referredBy) return "N/A";
    if (typeof referredBy === "object" && referredBy.full_name) {
      return referredBy.full_name;
    }
    if (typeof referredBy === "string") {
      return referredBy;
    }
    return "N/A";
  }, []);

  const formatCharging = useCallback((charging) => {
    if (!charging) return [];

    const chargingData = [
      { code: charging.code, name: charging.name },
      { code: charging.company_code, name: charging.company_name },
      { code: charging.business_unit_code, name: charging.business_unit_name },
      { code: charging.department_code, name: charging.department_name },
      { code: charging.unit_code, name: charging.unit_name },
      { code: charging.sub_unit_code, name: charging.sub_unit_name },
      { code: charging.location_code, name: charging.location_name },
    ];

    return chargingData.filter((item) => item.code && item.name);
  }, []);

  const isLoadingState = isLoading || isFetching;

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
          <Table stickyHeader sx={{ minWidth: 1400, width: "max-content" }}>
            <TableHead>
              <TableRow>
                <TableCell className="table-header">FULL NAME</TableCell>
                <TableCell className="table-header">CHARGING</TableCell>
                <TableCell className="table-header">BIRTH DATE</TableCell>
                <TableCell className="table-header">CIVIL STATUS</TableCell>
                <TableCell className="table-header">RELIGION</TableCell>
                <TableCell className="table-header">GENDER</TableCell>
                <TableCell className="table-header2">REFERRED BY</TableCell>
                <TableCell className="table-header">REMARKS</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoadingState ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    <Box sx={{ py: 4 }}>
                      <CircularProgress size={32} />
                      <Typography variant="body2" sx={{ mt: 2 }}>
                        Loading employees...
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : employeeList.length > 0 ? (
                employeeList.map((employee) => (
                  <TableRow
                    key={employee.id}
                    onClick={() => handleRowClick(employee)}
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
                    <TableCell
                      className="table-cell"
                      sx={{
                        width: "280px",
                        minWidth: "250px",
                      }}>
                      <Box>
                        <Typography
                          sx={{
                            fontWeight: 500,
                            fontSize: "0.875rem",
                            lineHeight: 1.4,
                          }}>
                          {employee.full_name || "N/A"}
                        </Typography>
                        <Typography
                          sx={{
                            fontSize: "0.75rem",
                            color: "text.secondary",
                            lineHeight: 1.2,
                            mt: 0.3,
                          }}>
                          {safelyDisplayValue(employee.employee_code)}
                        </Typography>
                        <Box sx={{ mt: 0.5 }}>
                          <Chip
                            label={
                              employee.status === "ACTIVE"
                                ? "ACTIVE"
                                : "INACTIVE"
                            }
                            color={
                              employee.status === "ACTIVE" ? "success" : "error"
                            }
                            size="small"
                            variant="outlined"
                            sx={{
                              height: "18px",
                              "& .MuiChip-label": {
                                fontSize: "0.65rem",
                                fontWeight: 600,
                                paddingX: "6px",
                              },
                            }}
                          />
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell
                      sx={{
                        width: "350px",
                        minWidth: "300px",
                        paddingY: 1.5,
                      }}>
                      <Box>
                        {formatCharging(employee.charging).map(
                          (item, index) => (
                            <Typography
                              key={index}
                              sx={{
                                fontSize: "0.75rem",
                                lineHeight: 1.4,
                                color: "text.primary",
                              }}>
                              ({item.code}) - {item.name}
                            </Typography>
                          )
                        )}
                        {formatCharging(employee.charging).length === 0 && (
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
                    <TableCell className="table-cell2">
                      {formatDate(employee.birth_date)}
                    </TableCell>
                    <TableCell className="table-cell2">
                      {safelyDisplayValue(employee.civil_status)}
                    </TableCell>
                    <TableCell
                      className="table-cell"
                      sx={{
                        width: "300px",
                        minWidth: "300px",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}>
                      {formatReligion(employee.religion)}
                    </TableCell>
                    <TableCell className="table-cell">
                      {safelyDisplayValue(employee.gender)}
                    </TableCell>
                    <TableCell
                      sx={{
                        width: 100,
                        minWidth: 90,
                        whiteSpace: "nowrap",
                        fontSize: "1rem",
                      }}>
                      {formatReferredBy(employee.referred_by)}
                    </TableCell>
                    <TableCell
                      sx={{
                        width: 100,
                        minWidth: 90,
                        whiteSpace: "nowrap",
                        fontSize: "1rem",
                      }}>
                      {safelyDisplayValue(employee.remarks)}
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
                        No employees found
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {searchQuery
                          ? `No results for "${searchQuery}"`
                          : Object.values(filters).some(
                              (v) => v && v !== "ACTIVE"
                            )
                          ? `No employees with selected filters`
                          : "No employees"}
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <CustomTablePagination
          count={totalCount}
          page={Math.max(0, page - 1)}
          rowsPerPage={rowsPerPage}
          onPageChange={handlePageChange}
          onRowsPerPageChange={handleRowsPerPageChange}
        />
      </Paper>

      <EmployeeWizardForm
        open={wizardOpen}
        onClose={handleWizardClose}
        initialData={wizardInitialData}
        mode={wizardMode}
        onSubmit={handleWizardSubmit}
        initialStep={0}
      />
    </Box>
  );
};

export default General;
