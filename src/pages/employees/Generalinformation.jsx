import React, { useState, useMemo } from "react";
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
  Chip,
  Box,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import EditIcon from "@mui/icons-material/Edit";
import ArchiveIcon from "@mui/icons-material/Archive";
import NoDataGIF from "../../assets/no-data.gif";
import EmployeesModal from "../../components/modal/employee/EmployeesModal";
import { useSnackbar } from "notistack";
import {
  useGetGeneralsQuery,
  useDeleteGeneralMutation,
} from "../../features/api/employee/generalApi";
import "../../pages/GeneralStyle.scss";

const GeneralInformation = () => {
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [menuAnchor, setMenuAnchor] = useState({});
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  const {
    data: apiResponse,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useGetGeneralsQuery({
    page,
    per_page: rowsPerPage,
    status: "active",
  });

  const [archiveEmployee] = useDeleteGeneralMutation();

  const { employeeList, totalCount } = useMemo(() => {
    const result = apiResponse?.result;
    const data = result?.data || [];
    return {
      employeeList: data,
      totalCount: result?.total_count || data.length,
    };
  }, [apiResponse]);

  const handleMenuOpen = (event, employeeId) => {
    setMenuAnchor({ [employeeId]: event.currentTarget });
  };

  const handleMenuClose = (employeeId) => {
    setMenuAnchor((prev) => {
      const { [employeeId]: _, ...rest } = prev;
      return rest;
    });
  };

  const handleEditClick = (employee) => {
    setSelectedEmployee(employee);
    setModalOpen(true);
    handleMenuClose(employee.id);
  };

  const handleArchive = async (employee) => {
    try {
      await archiveEmployee(employee.id).unwrap();
      enqueueSnackbar("Employee archived successfully", { variant: "success" });
      refetch();
    } catch (err) {
      enqueueSnackbar("Failed to archive employee", { variant: "error" });
    } finally {
      handleMenuClose(employee.id);
    }
  };

  const formatEmployeeId = (id) => {
    return id ? `RDFFLFI-${String(id).padStart(5, "0")}` : "—";
  };

  const formatFullName = (employee) => {
    if (employee.full_name) return employee.full_name;

    const parts = [
      employee.last_name,
      employee.first_name,
      employee.middle_name,
    ].filter(Boolean);

    return parts.length > 0 ? parts.join(", ") : "—";
  };

  const formatDate = (dateString) => {
    if (!dateString) return "—";
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return dateString;
    }
  };

  return (
    <>
      <Paper className="container">
        <TableContainer className="table-container">
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell className="table-header">ID</TableCell>
                <TableCell className="table-header">ID NUMBER</TableCell>
                <TableCell className="table-header">FULL NAME</TableCell>
                <TableCell className="table-header">BIRTH DATE</TableCell>
                <TableCell className="table-header">CIVIL STATUS</TableCell>
                <TableCell className="table-header">RELIGION</TableCell>
                <TableCell className="table-header">GENDER</TableCell>
                <TableCell className="table-header">REFERRED BY</TableCell>
                <TableCell className="table-header">REMARKS</TableCell>
                <TableCell className="table-header">STATUS</TableCell>
                <TableCell className="table-header">ACTIONS</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading || isFetching ? (
                <TableRow>
                  <TableCell colSpan={11} align="center" sx={{ py: 4 }}>
                    <CircularProgress size={32} />
                    <Typography
                      variant="body2"
                      sx={{ mt: 2, color: "text.secondary" }}>
                      Loading employees...
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={11} align="center" sx={{ py: 4 }}>
                    <Typography color="error" variant="body1">
                      Error:{" "}
                      {error?.data?.message || "Failed to load employee data"}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mt: 1 }}>
                      Please try refreshing the page
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : employeeList.length > 0 ? (
                employeeList.map((employee) => (
                  <TableRow key={employee.id}>
                    <TableCell className="table-cell">{employee.id}</TableCell>

                    <TableCell className="table-cell">
                      {formatEmployeeId(employee.id)}
                    </TableCell>

                    <TableCell className="table-cell">
                      {formatFullName(employee)}
                    </TableCell>

                    <TableCell className="table-cell">
                      {formatDate(employee.birth_date)}
                    </TableCell>

                    <TableCell className="table-cell">
                      {employee.civil_status || "—"}
                    </TableCell>

                    <TableCell className="table-cell">
                      {employee.religion || "—"}
                    </TableCell>

                    <TableCell className="table-cell">
                      {employee.gender || "—"}
                    </TableCell>

                    <TableCell className="table-cell">
                      {employee.referred_by || "—"}
                    </TableCell>

                    <TableCell className="table-cell">
                      {employee.remarks}
                    </TableCell>

                    <TableCell className="table-cell">
                      <Chip
                        label="Active"
                        color="success"
                        size="small"
                        variant="filled"
                      />
                    </TableCell>

                    <TableCell className="table-cell">
                      <IconButton
                        size="small"
                        onClick={(e) => handleMenuOpen(e, employee.id)}
                        sx={{
                          color: "rgb(33, 61, 112)",
                          "&:hover": {
                            backgroundColor: "rgba(33, 61, 112, 0.04)",
                          },
                        }}>
                        <MoreVertIcon fontSize="small" />
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
                        <MenuItem onClick={() => handleEditClick(employee)}>
                          <EditIcon fontSize="small" sx={{ mr: 1 }} />
                          Edit Employee
                        </MenuItem>
                        <MenuItem
                          onClick={() => handleArchive(employee)}
                          sx={{ color: "error.main" }}>
                          <ArchiveIcon fontSize="small" sx={{ mr: 1 }} />
                          Archive Employee
                        </MenuItem>
                      </Menu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={11} align="center" sx={{ py: 6 }}>
                    <Box className="no-data-container">
                      <img src={NoDataGIF} alt="No employees found" />
                      <Typography variant="body1" color="text.secondary">
                        No active employees found
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mt: 1 }}>
                        Try adjusting your filters or add new employees
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          className="table-pagination"
          rowsPerPageOptions={[5, 10, 25, 50, 100]}
          component="div"
          count={totalCount}
          rowsPerPage={rowsPerPage}
          page={page - 1}
          onPageChange={(_, newPage) => setPage(newPage + 1)}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(1);
          }}
          showFirstButton
          showLastButton
        />
      </Paper>

      <EmployeesModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        selectedData={selectedEmployee}
        refetch={refetch}
      />
    </>
  );
};

export default GeneralInformation;
