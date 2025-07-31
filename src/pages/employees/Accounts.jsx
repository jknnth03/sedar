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

  const [menuAnchor, setMenuAnchor] = useState({});
  const [getSingleEmployee] = useLazyGetSingleEmployeeQuery();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);

  const [wizardOpen, setWizardOpen] = useState(false);
  const [wizardMode, setWizardMode] = useState("create");
  const [wizardInitialData, setWizardInitialData] = useState(null);

  const queryParams = useMemo(
    () => ({
      search: debounceValue,
      page,
      per_page: rowsPerPage,
      status: showArchived ? "inactive" : "active",
    }),
    [debounceValue, page, rowsPerPage, showArchived]
  );

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

  const handleMenuOpen = useCallback((event, accountId) => {
    event.stopPropagation();
    setMenuAnchor((prev) => ({ ...prev, [accountId]: event.currentTarget }));
  }, []);

  const handleMenuClose = useCallback((accountId) => {
    setMenuAnchor((prev) => ({ ...prev, [accountId]: null }));
  }, []);

  const handleArchiveRestoreClick = useCallback(
    (account, event) => {
      if (event) {
        event.stopPropagation();
      }
      setSelectedAccount(account);
      setConfirmOpen(true);
      handleMenuClose(account.id);
    },
    [handleMenuClose]
  );

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
      handleMenuClose(account.id);
      await openWizard(account, "view");
    },
    [handleMenuClose, openWizard]
  );

  const handleEditEmployee = useCallback(
    async (account, event) => {
      if (event) event.stopPropagation();
      handleMenuClose(account.id);
      await openWizard(account, "edit");
    },
    [handleMenuClose, openWizard]
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
            sx={{
              minWidth: 1200,
              width: "100%",
              tableLayout: "fixed", // This is key for fixed column widths
            }}>
            <TableHead>
              <TableRow>
                <TableCell
                  className="table-header3"
                  sx={{
                    width: "60px",
                    minWidth: "60px",
                    maxWidth: "60px",
                    textAlign: "center",
                  }}>
                  ID
                </TableCell>
                <TableCell
                  className="table-header"
                  sx={{
                    width: "220px",
                    minWidth: "220px",
                    maxWidth: "220px",
                  }}>
                  EMPLOYEE
                </TableCell>
                <TableCell
                  className="table-header"
                  sx={{
                    width: "140px",
                    minWidth: "140px",
                    maxWidth: "140px",
                  }}>
                  SSS
                </TableCell>
                <TableCell
                  className="table-header"
                  sx={{
                    width: "140px",
                    minWidth: "140px",
                    maxWidth: "140px",
                  }}>
                  PAG-IBIG
                </TableCell>
                <TableCell
                  className="table-header"
                  sx={{
                    width: "140px",
                    minWidth: "140px",
                    maxWidth: "140px",
                  }}>
                  PHILHEALTH
                </TableCell>
                <TableCell
                  className="table-header"
                  sx={{
                    width: "120px",
                    minWidth: "120px",
                    maxWidth: "120px",
                  }}>
                  TIN
                </TableCell>
                <TableCell
                  className="table-header"
                  sx={{
                    width: "120px",
                    minWidth: "120px",
                    maxWidth: "120px",
                  }}>
                  BANK
                </TableCell>
                <TableCell
                  className="table-header"
                  sx={{
                    width: "80px",
                    minWidth: "80px",
                    maxWidth: "80px",
                    textAlign: "center",
                  }}>
                  ACTIONS
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
                      className="table-cell4"
                      sx={{
                        width: "60px",
                        minWidth: "60px",
                        maxWidth: "60px",
                        textAlign: "center",
                        fontWeight: 500,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}>
                      {safelyDisplayValue(account.id)}
                    </TableCell>
                    <TableCell
                      className="table-cell"
                      sx={{
                        width: "220px",
                        minWidth: "220px",
                        maxWidth: "220px",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        fontWeight: 500,
                      }}>
                      {formatEmployeeName(account.employee)}
                    </TableCell>
                    <TableCell
                      className="table-cell2"
                      sx={{
                        width: "140px",
                        minWidth: "140px",
                        maxWidth: "140px",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}>
                      {safelyDisplayValue(account.sss_number)}
                    </TableCell>
                    <TableCell
                      className="table-cell2"
                      sx={{
                        width: "140px",
                        minWidth: "140px",
                        maxWidth: "140px",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}>
                      {safelyDisplayValue(account.pag_ibig_number)}
                    </TableCell>
                    <TableCell
                      className="table-cell"
                      sx={{
                        width: "140px",
                        minWidth: "140px",
                        maxWidth: "140px",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}>
                      {safelyDisplayValue(account.philhealth_number)}
                    </TableCell>
                    <TableCell
                      className="table-cell"
                      sx={{
                        width: "120px",
                        minWidth: "120px",
                        maxWidth: "120px",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}>
                      {safelyDisplayValue(account.tin_number)}
                    </TableCell>
                    <TableCell
                      className="table-cell"
                      sx={{
                        width: "120px",
                        minWidth: "120px",
                        maxWidth: "120px",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}>
                      {formatBankName(account.bank)}
                    </TableCell>
                    <TableCell
                      className="table-cell"
                      sx={{
                        width: "80px",
                        minWidth: "80px",
                        maxWidth: "80px",
                        textAlign: "center",
                      }}>
                      <IconButton
                        size="small"
                        onClick={(event) => handleMenuOpen(event, account.id)}
                        sx={{ color: theme.palette.grey[600] }}>
                        <MoreVertIcon fontSize="small" />
                      </IconButton>
                      <Menu
                        anchorEl={menuAnchor[account.id]}
                        open={Boolean(menuAnchor[account.id])}
                        onClose={() => handleMenuClose(account.id)}
                        anchorOrigin={{
                          vertical: "bottom",
                          horizontal: "right",
                        }}
                        transformOrigin={{
                          vertical: "top",
                          horizontal: "right",
                        }}>
                        <MenuItem
                          onClick={(event) =>
                            handleViewEmployee(account, event)
                          }
                          sx={{ fontSize: "0.875rem" }}>
                          <VisibilityIcon sx={{ mr: 1, fontSize: "1rem" }} />
                          View
                        </MenuItem>
                        <MenuItem
                          onClick={(event) =>
                            handleEditEmployee(account, event)
                          }
                          sx={{ fontSize: "0.875rem" }}>
                          <EditIcon sx={{ mr: 1, fontSize: "1rem" }} />
                          Edit
                        </MenuItem>
                        <MenuItem
                          onClick={(event) =>
                            handleArchiveRestoreClick(account, event)
                          }
                          sx={{ fontSize: "0.875rem" }}>
                          {account.deleted_at ? (
                            <RestoreIcon sx={{ mr: 1, fontSize: "1rem" }} />
                          ) : (
                            <ArchiveIcon sx={{ mr: 1, fontSize: "1rem" }} />
                          )}
                          {account.deleted_at ? "Restore" : "Archive"}
                        </MenuItem>
                      </Menu>
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
