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
  useGetContactsQuery,
  useDeleteContactMutation,
} from "../../features/api/employee/contactsApi";
import "../../pages/GeneralStyle.scss";
import "../../pages/GeneralTable.scss";
import { CONSTANT } from "../../config/index";
import { useRememberQueryParams } from "../../hooks/useRememberQueryParams";
import EmployeeWizardForm from "../../components/modal/employee/multiFormModal/EmployeeWizardForm";
import { useLazyGetSingleEmployeeQuery } from "../../features/api/employee/mainApi";

const Contacts = ({
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
  const [selectedContact, setSelectedContact] = useState(null);

  const [wizardOpen, setWizardOpen] = useState(false);
  const [wizardMode, setWizardMode] = useState("create");
  const [wizardInitialData, setWizardInitialData] = useState(null);

  const queryParams = useMemo(
    () => ({
      search: debounceValue,
      page,
      per_page: rowsPerPage,
      // status: showArchived ? "inactive" : "active",
    }),
    [debounceValue, page, rowsPerPage]
  );

  const {
    data: contacts,
    isLoading,
    isFetching,
    refetch,
  } = useGetContactsQuery(queryParams, {
    refetchOnMountOrArgChange: true,
  });

  const [deleteContact] = useDeleteContactMutation();

  const contactList = useMemo(() => contacts?.result?.data || [], [contacts]);

  const handleMenuOpen = useCallback((event, contactId) => {
    event.stopPropagation();
    setMenuAnchor((prev) => ({ ...prev, [contactId]: event.currentTarget }));
  }, []);

  const handleMenuClose = useCallback((contactId) => {
    setMenuAnchor((prev) => ({ ...prev, [contactId]: null }));
  }, []);

  const handleArchiveRestoreClick = useCallback(
    (contact, event) => {
      if (event) {
        event.stopPropagation();
      }
      setSelectedContact(contact);
      setConfirmOpen(true);
      handleMenuClose(contact.id);
    },
    [handleMenuClose]
  );

  const handleArchiveRestoreConfirm = async () => {
    if (!selectedContact) return;

    try {
      await deleteContact(selectedContact.id).unwrap();
      enqueueSnackbar(
        selectedContact.deleted_at
          ? "Contact restored successfully!"
          : "Contact archived successfully!",
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
      setSelectedContact(null);
    }
  };

  const openWizard = useCallback(
    async (contact, mode) => {
      try {
        const response = await getSingleEmployee(
          contact?.employee?.id,
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
    async (contact, event) => {
      if (event) event.stopPropagation();
      handleMenuClose(contact.id);
      await openWizard(contact, "view");
    },
    [handleMenuClose, openWizard]
  );

  const handleEditEmployee = useCallback(
    async (contact, event) => {
      if (event) event.stopPropagation();
      handleMenuClose(contact.id);
      await openWizard(contact, "edit");
    },
    [handleMenuClose, openWizard]
  );

  const handleRowClick = useCallback(
    async (contact) => {
      await openWizard(contact, "view");
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
              minWidth: 1000,
              width: "100%",
              tableLayout: "fixed",
            }}>
            <TableHead>
              <TableRow>
                <TableCell
                  className="table-header3"
                  sx={{ width: "80px", minWidth: "80px" }}>
                  ID
                </TableCell>
                <TableCell
                  className="table-header"
                  sx={{ width: "400px", minWidth: "400px" }}>
                  EMPLOYEE
                </TableCell>
                <TableCell
                  className="table-header"
                  sx={{ width: "200px", minWidth: "200px" }}>
                  MOBILE NUMBER
                </TableCell>
                <TableCell
                  className="table-header"
                  sx={{ width: "220px", minWidth: "180px" }}>
                  EMAIL ADDRESS
                </TableCell>
                <TableCell
                  className="table-header"
                  sx={{ width: "180px", minWidth: "150px" }}>
                  EMAIL REMARKS
                </TableCell>
                <TableCell
                  className="table-header"
                  sx={{ width: "300x", minWidth: "300px" }}>
                  MOBILE REMARKS
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
                        Loading contacts...
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : contactList.length > 0 ? (
                contactList.map((contact) => (
                  <TableRow
                    key={contact.id}
                    onClick={() => handleRowClick(contact)}
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
                        width: "80px",
                        minWidth: "80px",
                        textAlign: "center",
                      }}>
                      {safelyDisplayValue(contact.id)}
                    </TableCell>
                    <TableCell
                      className="table-cell"
                      sx={{
                        width: "200px",
                        minWidth: "160px",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        fontWeight: 500,
                      }}
                      title={formatEmployeeName(contact.employee)}>
                      {formatEmployeeName(contact.employee)}
                    </TableCell>
                    <TableCell
                      className="table-cell2"
                      sx={{
                        width: "140px",
                        minWidth: "120px",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                      title={safelyDisplayValue(contact.mobile_number)}>
                      {safelyDisplayValue(contact.mobile_number)}
                    </TableCell>
                    <TableCell
                      className="table-cell2"
                      sx={{
                        width: "220px",
                        minWidth: "180px",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                      title={safelyDisplayValue(contact.email_address)}>
                      {safelyDisplayValue(contact.email_address)}
                    </TableCell>
                    <TableCell
                      className="table-cell"
                      sx={{
                        width: "180px",
                        minWidth: "150px",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                      title={safelyDisplayValue(contact.email_address_remarks)}>
                      {safelyDisplayValue(contact.email_address_remarks)}
                    </TableCell>
                    <TableCell
                      className="table-cell2"
                      sx={{
                        width: "180px",
                        minWidth: "150px",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                      title={safelyDisplayValue(contact.mobile_number_remarks)}>
                      {safelyDisplayValue(contact.mobile_number_remarks)}
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
                        No contacts found
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {searchQuery
                          ? `No results for "${searchQuery}"`
                          : showArchived
                          ? "No archived contacts"
                          : "No active contacts"}
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
            count={contacts?.result?.total || 0}
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
              {selectedContact?.deleted_at ? "restore" : "archive"}
            </strong>{" "}
            this contact?
          </Typography>
          {selectedContact && (
            <Typography
              variant="body2"
              color="text.secondary"
              textAlign="center"
              sx={{ mt: 1 }}>
              {formatEmployeeName(selectedContact.employee)}
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
        initialStep={6}
      />
    </Box>
  );
};

export default Contacts;
