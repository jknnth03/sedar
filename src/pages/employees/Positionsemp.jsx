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
import { useGetPositionQuery } from "../../features/api/employee/positionsempApi";
import "../../pages/GeneralStyle.scss";
import "../../pages/GeneralTable.scss";
import { CONSTANT } from "../../config/index";
import { useRememberQueryParams } from "../../hooks/useRememberQueryParams";
import EmployeeWizardForm from "../../components/modal/employee/multiFormModal/EmployeeWizardForm";
import { useLazyGetSingleEmployeeQuery } from "../../features/api/employee/mainApi";

const Positions = ({
  searchQuery: parentSearchQuery,
  debounceValue: parentDebounceValue,
  onSearchChange,
  filters = {},
  isLoading: parentIsLoading = false,
}) => {
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();

  const [currentParams, setQueryParams, removeQueryParams] =
    useRememberQueryParams();
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const searchQuery =
    parentSearchQuery !== undefined
      ? parentSearchQuery
      : currentParams?.q ?? "";
  const debounceValue =
    parentDebounceValue !== undefined ? parentDebounceValue : searchQuery;

  const [wizardOpen, setWizardOpen] = useState(false);
  const [wizardMode, setWizardMode] = useState("create");
  const [wizardInitialData, setWizardInitialData] = useState(null);

  const [getSingleEmployee] = useLazyGetSingleEmployeeQuery();

  const queryParams = useMemo(() => {
    const params = {
      pagination: page,
      page: page,
      per_page: rowsPerPage,
    };

    if (debounceValue && debounceValue.trim()) {
      params.search = debounceValue;
    }

    // Add this block ⬇️
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

  const {
    data: positions,
    isLoading,
    isFetching,
    refetch,
  } = useGetPositionQuery(queryParams, {
    refetchOnMountOrArgChange: true,
  });

  const positionList = useMemo(
    () => positions?.result?.data || [],
    [positions]
  );

  const totalCount = useMemo(() => positions?.result?.total || 0, [positions]);

  const handleSearchChange = useCallback(
    (event) => {
      const value = event.target.value;

      if (onSearchChange) {
        onSearchChange(value);
      } else {
        if (value.trim()) {
          setQueryParams({ q: value });
        } else {
          removeQueryParams(["q"]);
        }
      }

      setPage(1);
    },
    [onSearchChange, setQueryParams, removeQueryParams]
  );

  const openWizard = useCallback(
    async (position, mode) => {
      try {
        const response = await getSingleEmployee(
          position?.employee?.id,
          true
        ).unwrap();

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
    async (position) => {
      await openWizard(position, "view");
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

  const handlePageChange = useCallback((event, newPage) => {
    setPage(newPage + 1);
  }, []);

  const handleRowsPerPageChange = useCallback((event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(1);
  }, []);

  const safelyDisplayValue = useCallback(
    (value) => (value === null || value === undefined ? "N/A" : String(value)),
    []
  );

  const formatEmployeeName = useCallback((employee) => {
    if (!employee) return "N/A";
    if (employee?.full_name) return employee.full_name;
    const parts = [
      employee?.last_name,
      employee?.first_name,
      employee?.middle_name,
    ].filter(Boolean);
    return parts.length > 0 ? parts.join(", ") : "N/A";
  }, []);

  const formatCurrency = useCallback((amount) => {
    return amount ? `₱${amount.toLocaleString()}` : "N/A";
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
                <TableCell className="table-header">EMPLOYEE</TableCell>
                <TableCell className="table-header">CHARGING</TableCell>
                <TableCell className="table-header2">POSITION TITLE</TableCell>
                <TableCell
                  className="table-header"
                  sx={{ whiteSpace: "nowrap" }}>
                  SCHEDULE
                </TableCell>
                <TableCell
                  className="table-header"
                  sx={{ whiteSpace: "nowrap" }}>
                  JOB LEVEL
                </TableCell>
                <TableCell
                  className="table-header"
                  sx={{ whiteSpace: "nowrap" }}>
                  JOB RATE
                </TableCell>
                <TableCell className="table-header">ALLOWANCE</TableCell>
                <TableCell className="table-header">SALARY</TableCell>
                <TableCell className="table-header">TOOLS</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isFetching ? (
                <TableRow>
                  <TableCell colSpan={9} align="center">
                    <Box sx={{ py: 4 }}>
                      <CircularProgress size={32} />
                      <Typography variant="body2" sx={{ mt: 2 }}>
                        Loading positions...
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : positionList.length > 0 ? (
                positionList.map((position) => (
                  <TableRow
                    key={position.id}
                    onClick={() => handleRowClick(position)}
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
                          {formatEmployeeName(position.employee)}
                        </Typography>
                        <Typography
                          sx={{
                            fontSize: "0.75rem",
                            color: "text.secondary",
                            lineHeight: 1.2,
                            mt: 0.3,
                          }}>
                          {safelyDisplayValue(position.employee?.employee_code)}
                        </Typography>
                        <Box sx={{ mt: 0.5 }}>
                          <Chip
                            label={
                              position.employee?.status === "ACTIVE"
                                ? "ACTIVE"
                                : "INACTIVE"
                            }
                            color={
                              position.employee?.status === "ACTIVE"
                                ? "success"
                                : "error"
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
                        {formatCharging(position.employee?.charging).map(
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
                        {formatCharging(position.employee?.charging).length ===
                          0 && (
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
                      className="table-cell"
                      sx={{
                        width: "340px",
                        minWidth: "340px",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}>
                      {safelyDisplayValue(position.position?.name)}
                    </TableCell>
                    <TableCell
                      className="table-cell"
                      sx={{ minWidth: "280px", whiteSpace: "nowrap" }}>
                      {safelyDisplayValue(position.schedule?.name)}
                    </TableCell>
                    <TableCell
                      className="table-cell"
                      sx={{ minWidth: "150px" }}>
                      {safelyDisplayValue(position.job_level?.name)}
                    </TableCell>
                    <TableCell
                      className="table-cell"
                      sx={{ minWidth: "130px" }}>
                      {formatCurrency(position.job_rate)}
                    </TableCell>
                    <TableCell className="table-cell">
                      {formatCurrency(position.allowance)}
                    </TableCell>
                    <TableCell className="table-cell">
                      {formatCurrency(position.salary)}
                    </TableCell>
                    <TableCell
                      className="table-cell"
                      sx={{
                        width: "150px",
                        minWidth: "150px",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}>
                      {safelyDisplayValue(position.additional_tools)}
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
                        No positions found
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {searchQuery
                          ? `No results for "${searchQuery}"`
                          : Object.values(filters).some(
                              (v) => v && v !== "ACTIVE"
                            )
                          ? `No positions with selected filters`
                          : "No positions"}
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
            onPageChange={handlePageChange}
            onRowsPerPageChange={handleRowsPerPageChange}
            sx={{
              borderTop: `1px solid ${theme.palette.divider}`,
              backgroundColor: alpha(theme.palette.background.paper, 0.6),
              minHeight: "52px",
              "& .MuiTablePagination-toolbar": {
                paddingLeft: theme.spacing(2),
                paddingRight: theme.spacing(1),
              },
              "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows":
                { margin: 0, fontSize: "0.875rem" },
            }}
          />
        </Box>
      </Paper>

      <EmployeeWizardForm
        open={wizardOpen}
        onClose={handleWizardClose}
        initialData={wizardInitialData}
        mode={wizardMode}
        onSubmit={handleWizardSubmit}
        initialStep={2}
      />
    </Box>
  );
};

export default Positions;
