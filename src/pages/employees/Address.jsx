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
  useGetAddressQuery,
  useDeleteAddressMutation,
} from "../../features/api/employee/addressApi";
import "../../pages/GeneralStyle.scss";
import "../../pages/GeneralTable.scss";
import { CONSTANT } from "../../config/index";
import { useRememberQueryParams } from "../../hooks/useRememberQueryParams";
import EmployeeWizardForm from "../../components/modal/employee/multiFormModal/EmployeeWizardForm";
import { useLazyGetSingleEmployeeQuery } from "../../features/api/employee/mainApi";

const Address = ({
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
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(null);

  const [wizardOpen, setWizardOpen] = useState(false);
  const [wizardMode, setWizardMode] = useState("create");
  const [wizardInitialData, setWizardInitialData] = useState(null);

  const queryParams = useMemo(
    () => ({
      search: debounceValue,
      page,
      per_page: rowsPerPage,
      status: showArchived ? "inactive" : "active",
      statuses: selectedStatuses,
    }),
    [debounceValue, page, rowsPerPage, showArchived, selectedStatuses]
  );

  const {
    data: addresses,
    isLoading,
    isFetching,
    refetch,
  } = useGetAddressQuery(queryParams, {
    refetchOnMountOrArgChange: true,
  });

  const [deleteAddress] = useDeleteAddressMutation();
  const [getSingleEmployee] = useLazyGetSingleEmployeeQuery();
  const addressList = useMemo(() => addresses?.result?.data || [], [addresses]);

  const handleMenuOpen = useCallback((event, addressId) => {
    event.stopPropagation();
    setMenuAnchor((prev) => ({ ...prev, [addressId]: event.currentTarget }));
  }, []);

  const handleMenuClose = useCallback((addressId) => {
    setMenuAnchor((prev) => ({ ...prev, [addressId]: null }));
  }, []);

  const handleArchiveRestoreClick = useCallback(
    (address, event) => {
      if (event) event.stopPropagation();
      setSelectedAddress(address);
      setConfirmOpen(true);
      handleMenuClose(address.id);
    },
    [handleMenuClose]
  );

  const handleArchiveRestoreConfirm = async () => {
    if (!selectedAddress) return;
    try {
      await deleteAddress(selectedAddress.id).unwrap();
      enqueueSnackbar(
        selectedAddress.deleted_at
          ? "Address restored successfully!"
          : "Address archived successfully!",
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
      setSelectedAddress(null);
    }
  };

  const openWizard = useCallback(
    async (address, mode) => {
      try {
        const response = await getSingleEmployee(
          address?.employee_id,
          true
        ).unwrap();

        setWizardInitialData(response?.result);
        setWizardMode(mode);
        setWizardOpen(true);
      } catch (error) {
        console.error("ERROR", error);
        enqueueSnackbar("Failed to load employee details", {
          variant: "error",
          autoHideDuration: 2000,
        });
      }
    },
    [getSingleEmployee, enqueueSnackbar]
  );

  const handleViewEmployee = useCallback(
    async (address, event) => {
      if (event) event.stopPropagation();
      handleMenuClose(address.id);
      await openWizard(address, "view");
    },
    [handleMenuClose, openWizard]
  );

  const handleEditEmployee = useCallback(
    async (address, event) => {
      if (event) event.stopPropagation();
      handleMenuClose(address.id);
      await openWizard(address, "edit");
    },
    [handleMenuClose, openWizard]
  );

  const handleRowClick = useCallback(
    async (address) => {
      await openWizard(address, "view");
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

  const formatLocation = useCallback((address, field) => {
    const value = address[field];
    if (!value) return "N/A";
    if (typeof value === "object" && value.name) return value.name;
    if (typeof value === "string") return value;
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
          <Table stickyHeader sx={{ width: "100%", tableLayout: "fixed" }}>
            <TableHead>
              <TableRow>
                <TableCell className="table-header3" sx={{ width: "80px" }}>
                  ID
                </TableCell>
                <TableCell className="table-header" sx={{ width: "400px" }}>
                  EMPLOYEE
                </TableCell>
                <TableCell className="table-header" sx={{ width: "200px" }}>
                  STREET
                </TableCell>
                <TableCell className="table-header" sx={{ width: "180px" }}>
                  BARANGAY
                </TableCell>
                <TableCell className="table-header" sx={{ width: "200px" }}>
                  CITY/MUNICIPALITY
                </TableCell>
                <TableCell className="table-header" sx={{ width: "200px" }}>
                  SUB-MUNICIPALITY
                </TableCell>
                <TableCell className="table-header" sx={{ width: "160px" }}>
                  PROVINCE
                </TableCell>
                <TableCell className="table-header" sx={{ width: "300px" }}>
                  REGION
                </TableCell>
                <TableCell className="table-header" sx={{ width: "120px" }}>
                  ZIP CODE
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isFetching ? (
                <TableRow>
                  <TableCell colSpan={9} align="center">
                    <Box sx={{ py: 4 }}>
                      <CircularProgress size={32} />
                      <Typography variant="body2" sx={{ mt: 2 }}>
                        Loading addresses...
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : addressList.length > 0 ? (
                addressList.map((address) => (
                  <TableRow
                    key={address.id}
                    onClick={() => handleRowClick(address)}
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
                      {safelyDisplayValue(address.id)}
                    </TableCell>
                    <TableCell
                      className="table-cell"
                      sx={{
                        width: "300px",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        fontWeight: 500,
                      }}>
                      {formatEmployeeName(address.employee)}
                    </TableCell>
                    <TableCell
                      className="table-cell2"
                      sx={{
                        width: "200px",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}>
                      {safelyDisplayValue(address.street)}
                    </TableCell>
                    <TableCell
                      className="table-cell2"
                      sx={{
                        width: "180px",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}>
                      {formatLocation(address, "barangay")}
                    </TableCell>
                    <TableCell
                      className="table-cell2"
                      sx={{
                        width: "200px",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}>
                      {formatLocation(address, "city_municipality")}
                    </TableCell>
                    <TableCell
                      className="table-cell"
                      sx={{
                        width: "180px",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}>
                      {formatLocation(address, "sub_municipality")}
                    </TableCell>
                    <TableCell
                      className="table-cell"
                      sx={{
                        width: "160px",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}>
                      {formatLocation(address, "province")}
                    </TableCell>
                    <TableCell
                      className="table-cell"
                      sx={{
                        width: "200px",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}>
                      {formatLocation(address, "region")}
                    </TableCell>
                    <TableCell
                      className="table-cell"
                      sx={{
                        width: "120px",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        textAlign: "center",
                      }}>
                      {safelyDisplayValue(address.zip_code)}
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
                        No addresses found
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {searchQuery
                          ? `No results for "${searchQuery}"`
                          : showArchived
                          ? "No archived addresses"
                          : selectedStatuses.length > 0
                          ? `No addresses with selected status filters`
                          : "No active addresses"}
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
            count={addresses?.result?.total || 0}
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
                { margin: 0, fontSize: "0.875rem" },
            }}
          />
        </Box>
      </Paper>

      <Dialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}>
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
              {selectedAddress?.deleted_at ? "restore" : "archive"}
            </strong>{" "}
            this address?
          </Typography>
          {selectedAddress && (
            <Typography
              variant="body2"
              color="text.secondary"
              textAlign="center"
              sx={{ mt: 1 }}>
              {formatEmployeeName(selectedAddress.employee)}
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
        initialStep={1}
      />
    </Box>
  );
};

export default Address;
