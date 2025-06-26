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
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Archive as ArchiveIcon,
  Restore as RestoreIcon,
  Help as HelpIcon,
} from "@mui/icons-material";
import { useSnackbar } from "notistack";
import MultiFormModal from "../../components/modal/employee/MultiFormModal";
import ViewEmployeeModal from "../../components/modal/employee/ViewEmployeeModal";
import {
  useGetGeneralsQuery,
  useDeleteGeneralMutation,
} from "../../features/api/employee/generalApi";
import "../../pages/GeneralStyle.scss";
import { CONSTANT } from "../../config/index";
import { useRememberQueryParams } from "../../hooks/useRememberQueryParams";

const GeneralInformation = ({
  searchQuery: parentSearchQuery,
  showArchived: parentShowArchived,
  debounceValue: parentDebounceValue,
  onSearchChange,
  onArchivedChange,
}) => {
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
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  const [multiFormModalOpen, setMultiFormModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editEmployeeData, setEditEmployeeData] = useState(null);
  const [initialStep, setInitialStep] = useState(0);

  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(null);

  const { enqueueSnackbar } = useSnackbar();

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

  const handleMenuOpen = (event, employeeId) => {
    event.stopPropagation();
    setMenuAnchor((prev) => ({ ...prev, [employeeId]: event.currentTarget }));
  };

  const handleMenuClose = (employeeId) => {
    setMenuAnchor((prev) => ({ ...prev, [employeeId]: null }));
  };

  const handleArchiveRestoreClick = (employee, event) => {
    if (event) {
      event.stopPropagation();
    }
    setSelectedEmployee(employee);
    setConfirmOpen(true);
    handleMenuClose(employee.id);
  };

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

  const handleAddEmployee = () => {
    setIsEditMode(false);
    setEditEmployeeData(null);
    setInitialStep(0);
    setMultiFormModalOpen(true);
  };

  const handleEditClick = (employee, event) => {
    if (event) {
      event.stopPropagation();
    }
    setIsEditMode(true);
    setEditEmployeeData(employee);
    setInitialStep(0);
    setMultiFormModalOpen(true);
    handleMenuClose(employee.id);
  };

  const handleRowClick = (employee) => {
    setSelectedEmployeeId(employee.id);
    setViewModalOpen(true);
  };

  const handleViewModalClose = () => {
    setViewModalOpen(false);
    setSelectedEmployeeId(null);
  };

  const handleEditEmployee = (employeeData, editStep = 0) => {
    setViewModalOpen(false);
    setSelectedEmployeeId(null);

    setIsEditMode(true);
    setEditEmployeeData(employeeData);
    setInitialStep(editStep);
    setMultiFormModalOpen(true);
  };

  const handleMultiFormModalClose = () => {
    setMultiFormModalOpen(false);
    setIsEditMode(false);
    setEditEmployeeData(null);
    setInitialStep(0);
    refetch();
  };

  const safelyDisplayValue = (value) =>
    value === null || value === undefined ? "N/A" : String(value);

  const formatEmployeeId = (id) => {
    return id ? `RDFFLFI-${String(id).padStart(5, "0")}` : "N/A";
  };

  const formatFullName = (employee) => {
    if (employee?.full_name) return employee.full_name;

    const parts = [
      employee?.last_name,
      employee?.first_name,
      employee?.middle_name,
    ].filter(Boolean);

    return parts.length > 0 ? parts.join(", ") : "N/A";
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return dateString;
    }
  };

  const formatReligion = (religion) => {
    if (!religion) return "N/A";
    if (typeof religion === "object" && religion.name) {
      return religion.name;
    }
    if (typeof religion === "string") {
      return religion;
    }
    return "N/A";
  };

  const formatReferredBy = (referredBy) => {
    if (!referredBy) return "N/A";
    if (typeof referredBy === "object" && referredBy.full_name) {
      return referredBy.full_name;
    }
    if (typeof referredBy === "string") {
      return referredBy;
    }
    return "N/A";
  };

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
                <TableCell className="table-header3">ID</TableCell>
                <TableCell className="table-header">ID NUMBER</TableCell>
                <TableCell className="table-header">FULL NAME</TableCell>
                <TableCell className="table-header">BIRTH DATE</TableCell>
                <TableCell className="table-header">CIVIL STATUS</TableCell>
                <TableCell className="table-header">RELIGION</TableCell>
                <TableCell className="table-header">GENDER</TableCell>
                <TableCell className="table-header">REFERRED BY</TableCell>
                <TableCell className="table-header">REMARKS</TableCell>
                <TableCell className="table-status">STATUS</TableCell>
                <TableCell className="table-status">ACTIONS</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isFetching ? (
                <TableRow>
                  <TableCell colSpan={11} align="center">
                    <CircularProgress size={24} />
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
                        backgroundColor: "#f5f5f5",
                        "& .MuiTableCell-root": {
                          backgroundColor: "transparent",
                        },
                      },
                      transition: "background-color 0.2s ease",
                    }}>
                    <TableCell className="table-cell4">
                      {safelyDisplayValue(employee.id)}
                    </TableCell>
                    <TableCell className="table-cell2">
                      {formatEmployeeId(employee.id)}
                    </TableCell>
                    <TableCell
                      className="table-cell"
                      sx={{
                        width: "220px",
                        minWidth: "180px",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}>
                      {formatFullName(employee)}
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
                      className="table-cell"
                      sx={{ width: 100, minWidth: 90, whiteSpace: "nowrap" }}>
                      {formatReferredBy(employee.referred_by)}
                    </TableCell>
                    <TableCell className="table-cell">
                      {safelyDisplayValue(employee.remarks)}
                    </TableCell>
                    <TableCell className="table-status">
                      <Chip
                        label={showArchived ? "INACTIVE" : "ACTIVE"}
                        color={showArchived ? "error" : "success"}
                        size="medium"
                        sx={{ "& .MuiChip-label": { fontSize: "0.68rem" } }}
                      />
                    </TableCell>
                    <TableCell className="table-status">
                      <IconButton
                        onClick={(e) => handleMenuOpen(e, employee.id)}>
                        <MoreVertIcon />
                      </IconButton>
                      <Menu
                        anchorEl={menuAnchor[employee.id]}
                        open={Boolean(menuAnchor[employee.id])}
                        onClose={() => handleMenuClose(employee.id)}>
                        {!employee.deleted_at && (
                          <MenuItem
                            onClick={(e) => handleEditClick(employee, e)}>
                            <EditIcon fontSize="small" sx={{ mr: 1 }} />
                            Edit
                          </MenuItem>
                        )}
                        <MenuItem
                          onClick={(e) =>
                            handleArchiveRestoreClick(employee, e)
                          }>
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
                    colSpan={11}
                    align="center"
                    borderBottom="none"
                    className="table-cell">
                    {CONSTANT.BUTTONS.NODATA.icon}
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

      <MultiFormModal
        open={multiFormModalOpen}
        onClose={handleMultiFormModalClose}
        isEditMode={isEditMode}
        editEmployeeData={editEmployeeData}
        initialStep={initialStep}
      />

      <ViewEmployeeModal
        open={viewModalOpen}
        onClose={handleViewModalClose}
        employeeId={selectedEmployeeId}
        onEdit={handleEditEmployee}
      />

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
              {selectedEmployee?.deleted_at ? "restore" : "archive"}
            </strong>{" "}
            this employee?
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

export default GeneralInformation;
