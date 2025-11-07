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
import { useGetEmploymentTypesQuery } from "../../features/api/employee/employeetypesApi";
import "../../pages/GeneralStyle.scss";
import "../../pages/GeneralTable.scss";
import { CONSTANT } from "../../config/index";
import { useRememberQueryParams } from "../../hooks/useRememberQueryParams";
import EmployeeWizardForm from "../../components/modal/employee/multiFormModal/EmployeeWizardForm";
import { useLazyGetSingleEmployeeQuery } from "../../features/api/employee/mainApi";

const EmployeeTypes = ({
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
    data: employmentTypes,
    isLoading,
    isFetching,
    refetch,
  } = useGetEmploymentTypesQuery(queryParams, {
    refetchOnMountOrArgChange: true,
  });

  const employmentTypeList = useMemo(
    () => employmentTypes?.result?.data || [],
    [employmentTypes]
  );

  const totalCount = useMemo(
    () => employmentTypes?.result?.total || 0,
    [employmentTypes]
  );

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
    async (employmentType, mode) => {
      try {
        const response = await getSingleEmployee(
          employmentType?.employee?.id,
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
    async (employmentType) => {
      await openWizard(employmentType, "view");
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

  const formatDate = useCallback((dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch (error) {
      return dateString;
    }
  }, []);

  const getEmploymentTypeChipColor = useCallback((type) => {
    switch (type?.toLowerCase()) {
      case "probationary":
        return "warning";
      case "regular":
        return "primary";
      case "contractual":
        return "info";
      case "temporary":
        return "secondary";
      default:
        return "default";
    }
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
          <Table
            stickyHeader
            sx={{ minWidth: 1400, width: "100%", tableLayout: "fixed" }}>
            <TableHead>
              <TableRow>
                <TableCell className="table-header" sx={{ width: "17%" }}>
                  EMPLOYEE
                </TableCell>
                <TableCell className="table-header" sx={{ width: "30%" }}>
                  CHARGING
                </TableCell>
                <TableCell className="table-header" sx={{ width: "15%" }}>
                  EMPLOYMENT TYPE
                </TableCell>
                <TableCell className="table-header" sx={{ width: "13%" }}>
                  START DATE
                </TableCell>
                <TableCell className="table-header" sx={{ width: "12%" }}>
                  END DATE
                </TableCell>
                <TableCell
                  className="table-header2"
                  sx={{ width: "15%", whiteSpace: "nowrap" }}>
                  REGULARIZATION DATE
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
                        Loading employment types...
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : employmentTypeList.length > 0 ? (
                employmentTypeList.map((employmentType) => (
                  <TableRow
                    key={employmentType.id}
                    onClick={() => handleRowClick(employmentType)}
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
                        width: "17%",
                      }}>
                      <Box>
                        <Typography
                          sx={{
                            fontWeight: 500,
                            fontSize: "0.875rem",
                            lineHeight: 1.4,
                          }}>
                          {formatEmployeeName(employmentType.employee)}
                        </Typography>
                        <Typography
                          sx={{
                            fontSize: "0.75rem",
                            color: "text.secondary",
                            lineHeight: 1.2,
                            mt: 0.3,
                          }}>
                          {safelyDisplayValue(
                            employmentType.employee?.employee_code
                          )}
                        </Typography>
                        <Box sx={{ mt: 0.5 }}>
                          <Chip
                            label={
                              employmentType.employee?.status === "ACTIVE"
                                ? "ACTIVE"
                                : "INACTIVE"
                            }
                            color={
                              employmentType.employee?.status === "ACTIVE"
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
                        width: "30%",
                        paddingY: 1.5,
                      }}>
                      <Box>
                        {formatCharging(employmentType.employee?.charging).map(
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
                        {formatCharging(employmentType.employee?.charging)
                          .length === 0 && (
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
                    <TableCell className="table-cell2" sx={{ width: "15%" }}>
                      <Chip
                        label={safelyDisplayValue(
                          employmentType.employment_type_label
                        )}
                        color={getEmploymentTypeChipColor(
                          employmentType.employment_type_label
                        )}
                        variant="outlined"
                        size="small"
                        sx={{ fontWeight: 500 }}
                      />
                    </TableCell>
                    <TableCell className="table-cell2" sx={{ width: "12%" }}>
                      {formatDate(
                        employmentType.employment_start_date ||
                          employmentType.start_date
                      )}
                    </TableCell>
                    <TableCell className="table-cell2" sx={{ width: "13%" }}>
                      {formatDate(
                        employmentType.employment_end_date ||
                          employmentType.end_date
                      )}
                    </TableCell>
                    <TableCell
                      sx={{
                        width: "13%",
                        whiteSpace: "nowrap",
                        fontSize: "1rem",
                      }}>
                      {formatDate(employmentType.regularization_date)}
                    </TableCell>
                  </TableRow>
                ))
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
                        No employment types found
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {searchQuery
                          ? `No results for "${searchQuery}"`
                          : Object.values(filters).some(
                              (v) => v && v !== "ACTIVE"
                            )
                          ? `No employment types with selected filters`
                          : "No employment types"}
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
        initialStep={3}
      />
    </Box>
  );
};

export default EmployeeTypes;
