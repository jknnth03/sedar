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
  Archive as ArchiveIcon,
  Restore as RestoreIcon,
  Help as HelpIcon,
  Visibility as VisibilityIcon,
  Edit as EditIcon,
} from "@mui/icons-material";
import { useSnackbar } from "notistack";
import {
  useGetAccountsQuery,
  useDeleteAccountMutation,
} from "../../features/api/employee/accountsApi";
import "../../pages/GeneralStyle.scss";
import "../../pages/GeneralTable.scss";
import { CONSTANT } from "../../config/index";
import { useRememberQueryParams } from "../../hooks/useRememberQueryParams";
import EmployeeWizardForm from "../../components/modal/employee/multiFormModal/EmployeeWizardForm";
import { useLazyGetSingleEmployeeQuery } from "../../features/api/employee/mainApi";

const Accounts = ({
  searchQuery: parentSearchQuery,
  showArchived: parentShowArchived,
  debounceValue: parentDebounceValue,
  onSearchChange,
  onArchivedChange,
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
  const showArchived =
    parentShowArchived !== undefined ? parentShowArchived : false;
  const debounceValue =
    parentDebounceValue !== undefined ? parentDebounceValue : searchQuery;

  const [getSingleEmployee] = useLazyGetSingleEmployeeQuery();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);

  const [wizardOpen, setWizardOpen] = useState(false);
  const [wizardMode, setWizardMode] = useState("create");
  const [wizardInitialData, setWizardInitialData] = useState(null);

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
    data: accounts,
    isLoading,
    isFetching,
    refetch,
  } = useGetAccountsQuery(queryParams, {
    refetchOnMountOrArgChange: true,
  });

  const [deleteAccount] = useDeleteAccountMutation();

  const accountList = useMemo(() => accounts?.result?.data || [], [accounts]);

  const handleArchiveRestoreClick = useCallback((account, event) => {
    if (event) {
      event.stopPropagation();
    }
    setSelectedAccount(account);
    setConfirmOpen(true);
  }, []);

  const handleArchiveRestoreConfirm = async () => {
    if (!selectedAccount) return;

    try {
      await deleteAccount(selectedAccount.id).unwrap();
      enqueueSnackbar(
        selectedAccount.deleted_at
          ? "Account restored successfully!"
          : "Account archived successfully!",
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
      setSelectedAccount(null);
    }
  };

  const openWizard = useCallback(
    async (account, mode) => {
      try {
        const response = await getSingleEmployee(
          account?.employee?.id,
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
    async (account, event) => {
      if (event) event.stopPropagation();
      await openWizard(account, "view");
    },
    [openWizard]
  );

  const handleEditEmployee = useCallback(
    async (account, event) => {
      if (event) event.stopPropagation();
      await openWizard(account, "edit");
    },
    [openWizard]
  );

  const handleRowClick = useCallback(
    async (account) => {
      try {
        const response = await getSingleEmployee(
          account?.employee?.id,
          true
        ).unwrap();

        setWizardInitialData(response?.result);
        setWizardMode("view");
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

  const formatBankName = useCallback((bank) => {
    return bank?.name || "N/A";
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
          <Table stickyHeader sx={{ minWidth: 1200, width: "max-content" }}>
            <TableHead>
              <TableRow>
                <TableCell className="table-header">EMPLOYEE</TableCell>
                <TableCell className="table-header">CHARGING</TableCell>
                <TableCell className="table-header">SSS</TableCell>
                <TableCell className="table-header">PAG-IBIG</TableCell>
                <TableCell className="table-header">PHILHEALTH</TableCell>
                <TableCell className="table-header">TIN</TableCell>
                <TableCell className="table-header">BANK</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isFetching ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <Box sx={{ py: 4 }}>
                      <CircularProgress size={32} />
                      <Typography variant="body2" sx={{ mt: 2 }}>
                        Loading accounts...
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : accountList.length > 0 ? (
                accountList.map((account) => (
                  <TableRow
                    key={account.id}
                    onClick={() => handleRowClick(account)}
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
                          {formatEmployeeName(account.employee)}
                        </Typography>
                        <Typography
                          sx={{
                            fontSize: "0.75rem",
                            color: "text.secondary",
                            lineHeight: 1.2,
                            mt: 0.3,
                          }}>
                          {safelyDisplayValue(account.employee?.employee_code)}
                        </Typography>
                        <Box sx={{ mt: 0.5 }}>
                          <Chip
                            label={
                              account.employee?.status === "ACTIVE"
                                ? "ACTIVE"
                                : "INACTIVE"
                            }
                            color={
                              account.employee?.status === "ACTIVE"
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
                        {formatCharging(account.employee?.charging).map(
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
                        {formatCharging(account.employee?.charging).length ===
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
                    <TableCell className="table-cell">
                      {safelyDisplayValue(account.sss_number)}
                    </TableCell>
                    <TableCell className="table-cell">
                      {safelyDisplayValue(account.pag_ibig_number)}
                    </TableCell>
                    <TableCell className="table-cell">
                      {safelyDisplayValue(account.philhealth_number)}
                    </TableCell>
                    <TableCell className="table-cell">
                      {safelyDisplayValue(account.tin_number)}
                    </TableCell>
                    <TableCell className="table-cell">
                      {formatBankName(account.bank)}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={7}
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
                        No accounts found
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {searchQuery
                          ? `No results for "${searchQuery}"`
                          : showArchived
                          ? "No archived accounts"
                          : "No active accounts"}
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
            count={accounts?.result?.total || 0}
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
              {selectedAccount?.deleted_at ? "restore" : "archive"}
            </strong>{" "}
            this account?
          </Typography>
          {selectedAccount && (
            <Typography
              variant="body2"
              color="text.secondary"
              textAlign="center"
              sx={{ mt: 1 }}>
              {formatEmployeeName(selectedAccount.employee)}
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
        initialStep={5}
      />
    </Box>
  );
};

export default Accounts;
