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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Chip,
  useTheme,
  alpha,
} from "@mui/material";
import {
  MoreVert as MoreVertIcon,
  Visibility as VisibilityIcon,
  Edit as EditIcon,
} from "@mui/icons-material";
import { useSnackbar } from "notistack";
import {
  useGetEmploymentTypesQuery,
  useUpdateEmploymentTypeMutation,
} from "../../features/api/employee/employeetypesApi";
import EmployeeWizardForm from "../../components/modal/employee/multiFormModal/EmployeeWizardForm";
import "../../pages/GeneralStyle.scss";
import "../../pages/GeneralTable.scss";
import { CONSTANT } from "../../config/index";
import { useLazyGetSingleEmployeeQuery } from "../../features/api/employee/mainApi";

const EmployeeTypes = ({ searchQuery, showArchived, debounceValue }) => {
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();

  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [menuAnchor, setMenuAnchor] = useState({});
  const [getSingleEmployee] = useLazyGetSingleEmployeeQuery();

  const [wizardOpen, setWizardOpen] = useState(false);
  const [wizardMode, setWizardMode] = useState("create");
  const [wizardInitialData, setWizardInitialData] = useState(null);

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
  } = useGetEmploymentTypesQuery(queryParams, {
    refetchOnMountOrArgChange: true,
  });

  const [updateEmploymentType] = useUpdateEmploymentTypeMutation();

  const { employmentTypeList, totalCount } = useMemo(() => {
    const result = apiResponse?.result;
    const data = result?.data || [];

    return {
      employmentTypeList: data,
      totalCount: result?.total || data.length,
    };
  }, [apiResponse]);

  const handleMenuOpen = useCallback((event, employmentTypeId) => {
    event.stopPropagation();
    setMenuAnchor((prev) => ({
      ...prev,
      [employmentTypeId]: event.currentTarget,
    }));
  }, []);

  const handleMenuClose = useCallback((employmentTypeId) => {
    setMenuAnchor((prev) => ({ ...prev, [employmentTypeId]: null }));
  }, []);

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
        enqueueSnackbar("Failed to load employee details", {
          variant: "error",
          autoHideDuration: 2000,
        });
      }
    },
    [getSingleEmployee, enqueueSnackbar]
  );

  const handleViewEmployee = useCallback(
    async (employmentType, event) => {
      if (event) event.stopPropagation();
      handleMenuClose(employmentType.id);
      await openWizard(employmentType, "view");
    },
    [handleMenuClose, openWizard]
  );

  const handleEditEmployee = useCallback(
    async (employmentType, event) => {
      if (event) event.stopPropagation();
      handleMenuClose(employmentType.id);
      await openWizard(employmentType, "edit");
    },
    [handleMenuClose, openWizard]
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
        return "success";
      case "contractual":
        return "info";
      case "temporary":
        return "secondary";
      default:
        return "default";
    }
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
          <Table stickyHeader sx={{ width: "100%", tableLayout: "fixed" }}>
            <TableHead>
              <TableRow>
                <TableCell className="table-header3" sx={{ width: "100px" }}>
                  ID
                </TableCell>
                <TableCell className="table-header" sx={{ width: "400px" }}>
                  EMPLOYEE
                </TableCell>
                <TableCell className="table-header" sx={{ width: "200px" }}>
                  EMPLOYMENT TYPE
                </TableCell>
                <TableCell className="table-header" sx={{ width: "140px" }}>
                  START DATE
                </TableCell>
                <TableCell className="table-header" sx={{ width: "140px" }}>
                  END DATE
                </TableCell>
                <TableCell className="table-header" sx={{ width: "250px" }}>
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
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" className="table-cell">
                    <Typography color="error">
                      Error: {error?.data?.message || "Failed to load data"}
                    </Typography>
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
                    <TableCell className="table-cell4" sx={{ width: "60px" }}>
                      {safelyDisplayValue(employmentType.id)}
                    </TableCell>
                    <TableCell
                      className="table-cell"
                      sx={{
                        width: "280px",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        fontWeight: 500,
                      }}>
                      {formatEmployeeName(employmentType.employee)}
                    </TableCell>
                    <TableCell className="table-cell2" sx={{ width: "160px" }}>
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
                    <TableCell className="table-cell" sx={{ width: "140px" }}>
                      {formatDate(
                        employmentType.employment_start_date ||
                          employmentType.start_date
                      )}
                    </TableCell>
                    <TableCell className="table-cell" sx={{ width: "140px" }}>
                      {formatDate(
                        employmentType.employment_end_date ||
                          employmentType.end_date
                      )}
                    </TableCell>
                    <TableCell className="table-cell" sx={{ width: "180px" }}>
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
                        {debounceValue
                          ? `No results for "${debounceValue}"`
                          : showArchived
                          ? "No archived employment types"
                          : "No active employment types"}
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
