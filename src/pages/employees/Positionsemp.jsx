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
  useGetPositionQuery,
  useDeletePositionMutation,
} from "../../features/api/employee/positionsempApi";
import "../../pages/GeneralStyle.scss";
import "../../pages/GeneralTable.scss";
import { CONSTANT } from "../../config/index";
import { useRememberQueryParams } from "../../hooks/useRememberQueryParams";
import EmployeeWizardForm from "../../components/modal/employee/multiFormModal/EmployeeWizardForm";
import { useLazyGetSingleEmployeeQuery } from "../../features/api/employee/mainApi";

const Positions = ({
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
  const [selectedPosition, setSelectedPosition] = useState(null);

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
    data: positions,
    isLoading,
    isFetching,
    refetch,
  } = useGetPositionQuery(queryParams, {
    refetchOnMountOrArgChange: true,
  });

  const [deletePosition] = useDeletePositionMutation();

  const positionList = useMemo(
    () => positions?.result?.data || [],
    [positions]
  );

  const handleMenuOpen = useCallback((event, positionId) => {
    event.stopPropagation();
    setMenuAnchor((prev) => ({ ...prev, [positionId]: event.currentTarget }));
  }, []);

  const handleMenuClose = useCallback((positionId) => {
    setMenuAnchor((prev) => ({ ...prev, [positionId]: null }));
  }, []);

  const handleArchiveRestoreClick = useCallback(
    (position, event) => {
      if (event) {
        event.stopPropagation();
      }
      setSelectedPosition(position);
      setConfirmOpen(true);
      handleMenuClose(position.id);
    },
    [handleMenuClose]
  );

  const handleArchiveRestoreConfirm = async () => {
    if (!selectedPosition) return;

    try {
      await deletePosition(selectedPosition.id).unwrap();
      enqueueSnackbar(
        selectedPosition.deleted_at
          ? "Position restored successfully!"
          : "Position archived successfully!",
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
      setSelectedPosition(null);
    }
  };

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
        enqueueSnackbar("Failed to load employee details", {
          variant: "error",
          autoHideDuration: 2000,
        });
      }
    },
    [getSingleEmployee, enqueueSnackbar]
  );

  const handleViewEmployee = useCallback(
    async (position, event) => {
      if (event) event.stopPropagation();
      handleMenuClose(position.id);
      await openWizard(position, "view");
    },
    [handleMenuClose, openWizard]
  );

  const handleEditEmployee = useCallback(
    async (position, event) => {
      if (event) event.stopPropagation();
      handleMenuClose(position.id);
      await openWizard(position, "edit");
    },
    [handleMenuClose, openWizard]
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
                <TableCell className="table-header3">ID</TableCell>
                <TableCell className="table-header">EMPLOYEE</TableCell>
                <TableCell className="table-header2">POSITION TITLE</TableCell>
                <TableCell className="table-header">SCHEDULE</TableCell>
                <TableCell className="table-header">JOB LEVEL</TableCell>
                <TableCell className="table-header">JOB RATE</TableCell>
                <TableCell className="table-header">ALLOWANCE</TableCell>
                <TableCell className="table-header">SALARY</TableCell>
                <TableCell className="table-header">TOOLS</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isFetching ? (
                <TableRow>
                  <TableCell colSpan={12} align="center">
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
                    <TableCell>{safelyDisplayValue(position.id)}</TableCell>
                    <TableCell
                      className="table-cell"
                      sx={{
                        width: "340px",
                        minWidth: "340px",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        fontWeight: 500,
                      }}>
                      {formatEmployeeName(position.employee)}
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
                    <TableCell className="table-cell">
                      {safelyDisplayValue(position.schedule?.name)}
                    </TableCell>
                    <TableCell className="table-cell">
                      {safelyDisplayValue(position.job_level?.name)}
                    </TableCell>
                    <TableCell className="table-cell">
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
                    colSpan={12}
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
                          : showArchived
                          ? "No archived positions"
                          : "No active positions"}
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
            count={positions?.result?.total || 0}
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
              {selectedPosition?.deleted_at ? "restore" : "archive"}
            </strong>{" "}
            this position?
          </Typography>
          {selectedPosition && (
            <Typography
              variant="body2"
              color="text.secondary"
              textAlign="center"
              sx={{ mt: 1 }}>
              {formatEmployeeName(selectedPosition.employee)}
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
        initialStep={2}
      />
    </Box>
  );
};

export default Positions;
