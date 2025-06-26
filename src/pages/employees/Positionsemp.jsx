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
} from "@mui/material";
import {
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Archive as ArchiveIcon,
  Restore as RestoreIcon,
  Help as HelpIcon,
} from "@mui/icons-material";
import { useSnackbar } from "notistack";
import ViewEmployeeModal from "../../components/modal/employee/ViewEmployeeModal";
import MultiFormModal from "../../components/modal/employee/MultiFormModal"; // Added MultiFormModal import
import {
  useGetPositionQuery,
  useDeletePositionMutation,
} from "../../features/api/employee/positionsempApi";
import "../../pages/GeneralStyle.scss";
import "../../pages/GeneralTable.scss";
import { CONSTANT } from "../../config/index";

const Positions = ({
  searchQuery: parentSearchQuery,
  showArchived: parentShowArchived,
  debounceValue: parentDebounceValue,
  onSearchChange,
  onArchivedChange,
}) => {
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Use parent props or fallback to defaults
  const searchQuery = parentSearchQuery !== undefined ? parentSearchQuery : "";
  const showArchived =
    parentShowArchived !== undefined ? parentShowArchived : false;
  const debounceValue =
    parentDebounceValue !== undefined ? parentDebounceValue : searchQuery;

  const [menuAnchor, setMenuAnchor] = useState({});
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState(null);

  // State for ViewEmployeeModal
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(null);

  // State for MultiFormModal (Edit Modal) - following Address pattern
  const [multiFormModalOpen, setMultiFormModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editEmployeeData, setEditEmployeeData] = useState(null);
  const [initialStep, setInitialStep] = useState(0);

  const { enqueueSnackbar } = useSnackbar();

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
  } = useGetPositionQuery(queryParams, {
    refetchOnMountOrArgChange: true,
  });

  const [deletePosition] = useDeletePositionMutation();

  const { positionList, totalCount } = useMemo(() => {
    const result = apiResponse?.result;
    const data = result?.data || [];

    return {
      positionList: data,
      totalCount: result?.total || data.length,
    };
  }, [apiResponse]);

  const handleMenuOpen = useCallback((event, positionId) => {
    event.stopPropagation();
    setMenuAnchor((prev) => ({ ...prev, [positionId]: event.currentTarget }));
  }, []);

  const handleMenuClose = useCallback((positionId) => {
    setMenuAnchor((prev) => ({ ...prev, [positionId]: null }));
  }, []);

  // Updated edit handler to use MultiFormModal - following Address pattern
  const handleEditClick = useCallback(
    (position, event) => {
      if (event) {
        event.stopPropagation();
      }

      console.log("Edit clicked for position:", position);

      if (!position.employee) {
        enqueueSnackbar("No employee data found for this position", {
          variant: "warning",
          autoHideDuration: 3000,
        });
        handleMenuClose(position.id);
        return;
      }

      // Use the employee data directly, just like in Address
      setIsEditMode(true);
      setEditEmployeeData(position.employee); // Pass the employee data directly
      setInitialStep(2); // Step 2 is positions (0-indexed)
      setMultiFormModalOpen(true);

      handleMenuClose(position.id);
    },
    [handleMenuClose, enqueueSnackbar]
  );

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

  // Function to handle edit action from ViewEmployeeModal
  const handleEditEmployee = (employeeData, editStep = 2) => {
    console.log("Edit requested for employee:", employeeData);
    console.log("Edit step:", editStep);

    // Close the view modal first
    setViewModalOpen(false);
    setSelectedEmployeeId(null);

    // Set the employee data and initial step for editing - following Address pattern
    setIsEditMode(true);
    setEditEmployeeData(employeeData);
    setInitialStep(editStep); // This will be 2 for positions step
    setMultiFormModalOpen(true);
  };

  // Simplified modal close handler - following Address pattern
  const handleMultiFormModalClose = () => {
    setMultiFormModalOpen(false);
    setIsEditMode(false);
    setEditEmployeeData(null);
    setInitialStep(0);
    refetch();
  };

  const handleRowClick = (position) => {
    // Set the employee ID from the position data
    if (position.employee?.id) {
      setSelectedEmployeeId(position.employee.id);
      setViewModalOpen(true);
      console.log("Position clicked, opening employee:", position.employee);
    } else {
      console.warn("No employee data found for this position");
      enqueueSnackbar("No employee data found for this position", {
        variant: "warning",
        autoHideDuration: 3000,
      });
    }
  };

  const handleViewModalClose = () => {
    setViewModalOpen(false);
    setSelectedEmployeeId(null);
  };

  const safelyDisplayValue = (value) =>
    value === null || value === undefined ? "N/A" : String(value);

  const formatCurrency = (amount) =>
    amount ? `₱${amount.toLocaleString()}` : "N/A";

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
                <TableCell
                  className="table-id"
                  sx={{ minWidth: 80, whiteSpace: "nowrap" }}>
                  ID
                </TableCell>
                <TableCell
                  className="table-header"
                  sx={{ minWidth: 200, whiteSpace: "nowrap" }}>
                  EMPLOYEE
                </TableCell>
                <TableCell
                  className="table-header"
                  sx={{ minWidth: 120, whiteSpace: "nowrap" }}>
                  POSITION CODE
                </TableCell>
                <TableCell
                  className="table-header"
                  sx={{ minWidth: 180, whiteSpace: "nowrap" }}>
                  POSITION TITLE
                </TableCell>
                <TableCell
                  className="table-header"
                  sx={{ minWidth: 120, whiteSpace: "nowrap" }}>
                  SCHEDULE
                </TableCell>
                <TableCell
                  className="table-header"
                  sx={{ minWidth: 120, whiteSpace: "nowrap" }}>
                  JOB LEVEL
                </TableCell>
                <TableCell
                  className="table-header"
                  sx={{ minWidth: 120, whiteSpace: "nowrap" }}>
                  JOB RATE
                </TableCell>
                <TableCell
                  className="table-header"
                  sx={{ minWidth: 120, whiteSpace: "nowrap" }}>
                  ALLOWANCE
                </TableCell>
                <TableCell
                  className="table-header"
                  sx={{ minWidth: 120, whiteSpace: "nowrap" }}>
                  SALARY
                </TableCell>
                <TableCell
                  className="table-header"
                  sx={{ minWidth: 200, whiteSpace: "nowrap" }}>
                  TOOLS
                </TableCell>
                <TableCell
                  className="table-status"
                  sx={{ minWidth: 110, whiteSpace: "nowrap" }}>
                  STATUS
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isFetching ? (
                <TableRow>
                  <TableCell colSpan={12} align="center">
                    <CircularProgress size={24} />
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={12} align="center" className="table-cell">
                    <Typography color="error">
                      Error: {error?.data?.message || "Failed to load data"}
                    </Typography>
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
                        backgroundColor: "#f5f5f5",
                        "& .MuiTableCell-root": {
                          backgroundColor: "transparent",
                        },
                      },
                      transition: "background-color 0.2s ease",
                    }}>
                    <TableCell
                      className="table-cell-id"
                      sx={{ whiteSpace: "nowrap" }}>
                      {safelyDisplayValue(position.id)}
                    </TableCell>
                    <TableCell
                      className="table-cell"
                      sx={{ whiteSpace: "nowrap" }}>
                      {safelyDisplayValue(position.employee?.full_name)}
                    </TableCell>
                    <TableCell
                      className="table-cell"
                      sx={{ whiteSpace: "nowrap" }}>
                      {safelyDisplayValue(position.position?.code)}
                    </TableCell>
                    <TableCell
                      className="table-cell"
                      sx={{ whiteSpace: "nowrap" }}>
                      {safelyDisplayValue(position.position?.name)}
                    </TableCell>
                    <TableCell
                      className="table-cell"
                      sx={{ whiteSpace: "nowrap" }}>
                      {safelyDisplayValue(position.schedule?.name)}
                    </TableCell>
                    <TableCell
                      className="table-cell"
                      sx={{ whiteSpace: "nowrap" }}>
                      {safelyDisplayValue(position.job_level?.name)}
                    </TableCell>
                    <TableCell
                      className="table-cell"
                      sx={{ whiteSpace: "nowrap" }}>
                      {formatCurrency(position.job_rate)}
                    </TableCell>
                    <TableCell
                      className="table-cell"
                      sx={{ whiteSpace: "nowrap" }}>
                      {formatCurrency(position.allowance)}
                    </TableCell>
                    <TableCell
                      className="table-cell"
                      sx={{ whiteSpace: "nowrap" }}>
                      {formatCurrency(position.salary)}
                    </TableCell>
                    <TableCell
                      className="table-cell"
                      sx={{ whiteSpace: "nowrap" }}>
                      {safelyDisplayValue(position.additional_tools || "N/A")}
                    </TableCell>
                    <TableCell
                      className="table-status"
                      sx={{ whiteSpace: "nowrap" }}>
                      <Chip
                        label={showArchived ? "INACTIVE" : "ACTIVE"}
                        color={showArchived ? "error" : "success"}
                        size="medium"
                        sx={{ "& .MuiChip-label": { fontSize: "0.68rem" } }}
                      />
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={12}
                    align="center"
                    borderBottom="none"
                    className="table-cell">
                    {CONSTANT?.BUTTONS?.NODATA?.icon || (
                      <Typography
                        variant="body2"
                        color="textSecondary"
                        sx={{ mt: 1 }}>
                        {debounceValue
                          ? `No positions found for "${debounceValue}"`
                          : "No positions available"}
                      </Typography>
                    )}
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
              borderTop: "1px solid #e0e0e0",
              backgroundColor: "#fafafa",
              minHeight: "52px",
            }}
          />
        </Box>
      </Paper>

      {/* ViewEmployeeModal - Modal for viewing employee details */}
      <ViewEmployeeModal
        open={viewModalOpen}
        onClose={handleViewModalClose}
        employeeId={selectedEmployeeId}
        defaultStep={2} // Step 2 is the "POSITIONS" step (0-indexed)
        onEdit={handleEditEmployee} // This handles edit from view modal
      />

      {/* MultiFormModal - Modal for editing employee - following Address pattern */}
      <MultiFormModal
        open={multiFormModalOpen}
        onClose={handleMultiFormModalClose}
        isEditMode={isEditMode}
        editEmployeeData={editEmployeeData}
        initialStep={initialStep}
      />

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        maxWidth="xs"
        fullWidth>
        <DialogTitle>
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            mb={1}>
            <HelpIcon sx={{ fontSize: 60, color: "#ff4400 " }} />
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
              color="error">
              No
            </Button>
            <Button
              onClick={handleArchiveRestoreConfirm}
              variant="contained"
              color="success">
              Yes
            </Button>
          </Box>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Positions;
