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
  TextField,
  InputAdornment,
  Switch,
  FormControlLabel,
  Toolbar,
  useTheme,
  alpha,
} from "@mui/material";
import {
  MoreVert as MoreVertIcon,
  Archive as ArchiveIcon,
  Restore as RestoreIcon,
  Help as HelpIcon,
} from "@mui/icons-material";
import { useSnackbar } from "notistack";
import {
  useGetGeneralsQuery,
  useDeleteGeneralMutation,
} from "../../features/api/employee/generalApi";
import { useRememberQueryParams } from "../../hooks/useRememberQueryParams";
import { CONSTANT } from "../../config/index";
import EmployeeWizardForm from "../../components/modal/employee/multiFormModal/EmployeeWizardForm";
import "../../pages/GeneralStyle.scss";
import { useLazyGetSingleEmployeeQuery } from "../../features/api/employee/mainApi";

const General = ({
  searchQuery: parentSearchQuery,
  showArchived: parentShowArchived,
  selectedStatuses: parentSelectedStatuses = [],
  debounceValue: parentDebounceValue,
  onSearchChange,
  onArchivedChange,
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
  const showArchived =
    parentShowArchived !== undefined ? parentShowArchived : false;
  const selectedStatuses =
    parentSelectedStatuses !== undefined ? parentSelectedStatuses : [];
  const debounceValue =
    parentDebounceValue !== undefined ? parentDebounceValue : searchQuery;

  const [menuAnchor, setMenuAnchor] = useState({});
  const [getSingleEmployee] = useLazyGetSingleEmployeeQuery();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  const [wizardOpen, setWizardOpen] = useState(false);
  const [wizardMode, setWizardMode] = useState("create");
  const [wizardInitialData, setWizardInitialData] = useState(null);

  const queryParams = useMemo(
    () => ({
      search: debounceValue,
      page,
      per_page: rowsPerPage,
      status: "all",
      statuses: selectedStatuses,
    }),
    [debounceValue, page, rowsPerPage, selectedStatuses]
  );

  const {
    data: employees,
    isLoading,
    isFetching,
    refetch,
  } = useGetGeneralsQuery(queryParams, {
    refetchOnMountOrArgChange: true,
  });

  const [deleteEmployee] = useDeleteGeneralMutation();

  const employeeList = useMemo(
    () => employees?.result?.data || [],
    [employees]
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

  const handleArchivedToggle = useCallback(
    (event) => {
      const checked = event.target.checked;

      if (onArchivedChange) {
        onArchivedChange(checked);
      }

      setPage(1);
    },
    [onArchivedChange]
  );

  const handleMenuOpen = useCallback((event, employeeId) => {
    event.stopPropagation();
    setMenuAnchor((prev) => ({ ...prev, [employeeId]: event.currentTarget }));
  }, []);

  const handleMenuClose = useCallback((employeeId) => {
    setMenuAnchor((prev) => ({ ...prev, [employeeId]: null }));
  }, []);

  const handleArchiveRestoreClick = useCallback(
    (employee, event) => {
      if (event) {
        event.stopPropagation();
      }
      setSelectedEmployee(employee);
      setConfirmOpen(true);
      handleMenuClose(employee.id);
    },
    [handleMenuClose]
  );

  const handleArchiveRestoreConfirm = async () => {
    if (!selectedEmployee) return;

    try {
      await deleteEmployee(selectedEmployee.id).unwrap();
      enqueueSnackbar(
        selectedEmployee.deleted_at
          ? "Employee restored successfully!"
          : "Employee archived successfully!",
        { variant: "success", autoHideDuration: 2000 }
      );
      refetch();
    } catch (error) {
      enqueueSnackbar("Action failed. Please try again.", {
        variant: "error",
        autoHideDuration: 2000,
      });
    } finally {
      setConfirmOpen(false);
      setSelectedEmployee(null);
    }
  };

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

  const handleViewEmployee = useCallback(
    async (general, event) => {
      if (event) event.stopPropagation();
      handleMenuClose(general.id);
      await openWizard(general, "view");
    },
    [handleMenuClose, openWizard]
  );

  const handleEditEmployee = useCallback(
    async (general, event) => {
      if (event) event.stopPropagation();
      handleMenuClose(general.id);
      await openWizard(general, "edit");
    },
    [handleMenuClose, openWizard]
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

  const formatEmployeeId = useCallback((id) => {
    return id ? `RDFFLFI-${String(id).padStart(5, "0")}` : "N/A";
  }, []);

  const formatFullName = useCallback((employee) => {
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
                <TableCell className="table-status">STATUS</TableCell>
                <TableCell className="table-header">FULL NAME</TableCell>
                <TableCell className="table-header">ID NUMBER</TableCell>
                <TableCell className="table-header">BIRTH DATE</TableCell>
                <TableCell className="table-header">CIVIL STATUS</TableCell>
                <TableCell className="table-header">RELIGION</TableCell>
                <TableCell className="table-header">GENDER</TableCell>
                <TableCell className="table-header2">REFERRED BY</TableCell>
                <TableCell className="table-header">REMARKS</TableCell>
                <TableCell className="table-status">ACTIONS</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isFetching ? (
                <TableRow>
                  <TableCell colSpan={10} align="center">
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
                    <TableCell className="table-status">
                      <Chip
                        label={employee.deleted_at ? "INACTIVE" : "ACTIVE"}
                        color={employee.deleted_at ? "error" : "success"}
                        size="small"
                        variant="outlined"
                        sx={{
                          "& .MuiChip-label": {
                            fontSize: "0.68rem",
                            fontWeight: 600,
                          },
                        }}
                      />
                    </TableCell>
                    <TableCell
                      className="table-cell"
                      sx={{
                        width: "220px",
                        minWidth: "180px",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        fontWeight: 500,
                      }}>
                      {formatFullName(employee)}
                    </TableCell>
                    <TableCell className="table-cell2">
                      {safelyDisplayValue(employee.employee_code)}
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

                    <TableCell className="table-status">
                      <IconButton
                        onClick={(e) => handleMenuOpen(e, employee.id)}
                        size="small"
                        sx={{
                          "&:hover": {
                            backgroundColor: alpha(
                              theme.palette.action.hover,
                              0.1
                            ),
                          },
                        }}>
                        <MoreVertIcon />
                      </IconButton>
                      <Menu
                        anchorEl={menuAnchor[employee.id]}
                        open={Boolean(menuAnchor[employee.id])}
                        onClose={() => handleMenuClose(employee.id)}
                        transformOrigin={{
                          horizontal: "right",
                          vertical: "top",
                        }}
                        anchorOrigin={{
                          horizontal: "right",
                          vertical: "bottom",
                        }}>
                        <MenuItem
                          onClick={(e) =>
                            handleArchiveRestoreClick(employee, e)
                          }
                          sx={{
                            fontSize: "0.875rem",
                            color: employee.deleted_at
                              ? theme.palette.success.main
                              : theme.palette.warning.main,
                          }}>
                          {employee.deleted_at ? (
                            <>
                              <RestoreIcon fontSize="small" sx={{ mr: 1 }} />
                              Restore
                            </>
                          ) : (
                            <>
                              <ArchiveIcon fontSize="small" sx={{ mr: 1 }} />
                              Archive
                            </>
                          )}
                        </MenuItem>
                      </Menu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={10}
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
                          : showArchived
                          ? "No archived employees"
                          : selectedStatuses.length > 0
                          ? `No employees with selected status filters`
                          : "No active employees"}
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
            count={employees?.result?.total || 0}
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
                {
                  margin: 0,
                  fontSize: "0.875rem",
                },
            }}
          />
        </Box>
      </Paper>

      <Dialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3 },
        }}>
        <DialogTitle>
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            mb={1}>
            <HelpIcon sx={{ fontSize: 60, color: "#ff4400" }} />
          </Box>
          <Typography
            variant="h6"
            fontWeight="bold"
            textAlign="center"
            color="rgb(33, 61, 112)">
            Confirmation
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" gutterBottom textAlign="center">
            Are you sure you want to{" "}
            <strong>
              {selectedEmployee?.deleted_at ? "restore" : "archive"}
            </strong>{" "}
            this employee?
          </Typography>
          {selectedEmployee && (
            <Typography
              variant="body2"
              color="text.secondary"
              textAlign="center"
              sx={{ mt: 1 }}>
              {formatFullName(selectedEmployee)}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Box
            display="flex"
            justifyContent="center"
            width="100%"
            gap={2}
            mb={2}>
            <Button
              onClick={() => setConfirmOpen(false)}
              variant="outlined"
              color="error"
              sx={{ borderRadius: 2, minWidth: 80 }}>
              Cancel
            </Button>
            <Button
              onClick={handleArchiveRestoreConfirm}
              variant="contained"
              color="success"
              sx={{ borderRadius: 2, minWidth: 80 }}>
              Confirm
            </Button>
          </Box>
        </DialogActions>
      </Dialog>

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
