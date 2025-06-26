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
  Box,
  Chip,
} from "@mui/material";
import {
  Edit as EditIcon,
  MoreVert as MoreVertIcon,
} from "@mui/icons-material";
import { useSnackbar } from "notistack";
import {
  useGetEmploymentTypesQuery,
  useUpdateEmploymentTypeMutation,
} from "../../features/api/employee/employeetypesApi";

import ViewEmployeeModal from "../../components/modal/employee/ViewEmployeeModal";
import MultiFormModal from "../../components/modal/employee/MultiFormModal";
import "../../pages/GeneralStyle.scss";
import "../../pages/GeneralTable.scss";
import { CONSTANT } from "../../config/index";

const EmployeeTypes = ({ searchQuery, showArchived, debounceValue }) => {
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [menuAnchor, setMenuAnchor] = useState({});
  const [selectedEmploymentType, setSelectedEmploymentType] = useState(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingEmploymentType, setEditingEmploymentType] = useState(null);

  // New state for view modal functionality
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(null);

  // New state for multi-form modal functionality
  const [multiFormModalOpen, setMultiFormModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editEmployeeData, setEditEmployeeData] = useState(null);
  const [initialStep, setInitialStep] = useState(0);

  const { enqueueSnackbar } = useSnackbar();

  // Reset page when search changes
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

  const handleMenuOpen = (event, employmentTypeId) => {
    event.stopPropagation(); // Prevent row click when opening menu
    setMenuAnchor((prev) => ({
      ...prev,
      [employmentTypeId]: event.currentTarget,
    }));
  };

  const handleMenuClose = (employmentTypeId) => {
    setMenuAnchor((prev) => ({ ...prev, [employmentTypeId]: null }));
  };

  const handleEditClick = (employmentType) => {
    setEditingEmploymentType(employmentType);
    setModalOpen(true);
    handleMenuClose(employmentType.id);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setEditingEmploymentType(null);
  };

  const handleModalSuccess = () => {
    setModalOpen(false);
    setEditingEmploymentType(null);
    refetch();
    enqueueSnackbar("Employment type updated successfully!", {
      variant: "success",
      autoHideDuration: 2000,
    });
  };

  // New function to handle row clicks
  const handleRowClick = (employmentType) => {
    if (employmentType.employee?.id) {
      setSelectedEmployeeId(employmentType.employee.id);
      setViewModalOpen(true);
    } else {
      enqueueSnackbar("No employee data found for this employment type", {
        variant: "warning",
        autoHideDuration: 3000,
      });
    }
  };

  // New function to handle view modal close
  const handleViewModalClose = () => {
    setViewModalOpen(false);
    setSelectedEmployeeId(null);
  };

  // New function to handle edit employee from view modal
  const handleEditEmployee = (employeeData, editStep = 2) => {
    // Default to step 3 (index 2)
    setViewModalOpen(false);
    setSelectedEmployeeId(null);

    setIsEditMode(true);
    setEditEmployeeData(employeeData);
    setInitialStep(editStep);
    setMultiFormModalOpen(true);
  };

  // New function to handle multi-form modal close
  const handleMultiFormModalClose = () => {
    setMultiFormModalOpen(false);
    setIsEditMode(false);
    setEditEmployeeData(null);
    setInitialStep(0);
    refetch();
  };

  const safelyDisplayValue = (value) =>
    value === null || value === undefined ? "—" : String(value);

  const formatEmployeeName = (employee) => {
    if (!employee) return "—";
    return (
      employee?.full_name ||
      employee?.name ||
      employee?.first_name ||
      `${employee.first_name} ${employee.last_name}`.trim() ||
      employee?.display_name ||
      "—"
    );
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
          <Table stickyHeader sx={{ minWidth: "fit-content", width: "100%" }}>
            <TableHead>
              <TableRow>
                <TableCell
                  className="table-id"
                  sx={{ minWidth: 80, width: 80, whiteSpace: "nowrap" }}>
                  ID
                </TableCell>
                <TableCell
                  className="table-header"
                  sx={{ minWidth: 200, width: 200, whiteSpace: "nowrap" }}>
                  EMPLOYEE
                </TableCell>
                <TableCell
                  className="table-header"
                  sx={{ minWidth: 180, width: 180, whiteSpace: "nowrap" }}>
                  EMPLOYMENT TYPE LABEL
                </TableCell>
                <TableCell
                  className="table-header"
                  sx={{ minWidth: 150, width: 150, whiteSpace: "nowrap" }}>
                  EMPLOYMENT TYPE
                </TableCell>
                <TableCell
                  className="table-header"
                  sx={{ minWidth: 120, width: 120, whiteSpace: "nowrap" }}>
                  START DATE
                </TableCell>
                <TableCell
                  className="table-header"
                  sx={{ minWidth: 120, width: 120, whiteSpace: "nowrap" }}>
                  END DATE
                </TableCell>
                <TableCell
                  className="table-header"
                  sx={{ minWidth: 150, width: 150, whiteSpace: "nowrap" }}>
                  REGULARIZATION DATE
                </TableCell>
                <TableCell
                  className="table-status"
                  sx={{ minWidth: 110, width: 110, whiteSpace: "nowrap" }}>
                  STATUS
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isFetching ? (
                <TableRow>
                  <TableCell colSpan={9} align="center">
                    <CircularProgress size={24} />
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={9} align="center" className="table-cell">
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
                      {safelyDisplayValue(employmentType.id)}
                    </TableCell>
                    <TableCell
                      className="table-cell"
                      sx={{ whiteSpace: "nowrap" }}>
                      {formatEmployeeName(employmentType.employee)}
                    </TableCell>
                    <TableCell
                      className="table-cell"
                      sx={{ whiteSpace: "nowrap" }}>
                      {safelyDisplayValue(employmentType.employment_type_label)}
                    </TableCell>
                    <TableCell
                      className="table-cell"
                      sx={{ whiteSpace: "nowrap" }}>
                      {safelyDisplayValue(employmentType.employment_type)}
                    </TableCell>
                    <TableCell
                      className="table-cell"
                      sx={{ whiteSpace: "nowrap" }}>
                      {safelyDisplayValue(employmentType.start_date)}
                    </TableCell>
                    <TableCell
                      className="table-cell"
                      sx={{ whiteSpace: "nowrap" }}>
                      {safelyDisplayValue(employmentType.end_date)}
                    </TableCell>
                    <TableCell
                      className="table-cell"
                      sx={{ whiteSpace: "nowrap" }}>
                      {safelyDisplayValue(employmentType.regularization_date)}
                    </TableCell>
                    <TableCell
                      className="table-status"
                      sx={{ whiteSpace: "nowrap" }}>
                      <Chip
                        label={showArchived ? "ARCHIVED" : "ACTIVE"}
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
                    colSpan={9}
                    align="center"
                    borderBottom="none"
                    className="table-cell">
                    {CONSTANT?.BUTTONS?.NODATA?.icon || (
                      <Typography
                        variant="body2"
                        color="textSecondary"
                        sx={{ mt: 1 }}>
                        {debounceValue
                          ? `No employment types found for "${debounceValue}"`
                          : showArchived
                          ? "No archived employment types found."
                          : "No employment types available"}
                      </Typography>
                    )}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Fixed pagination */}
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

      {/* View Employee Modal */}
      <ViewEmployeeModal
        open={viewModalOpen}
        onClose={handleViewModalClose}
        employeeId={selectedEmployeeId}
        defaultStep={3} // Step 3 (index 2) for employment types
        onEdit={handleEditEmployee}
      />

      {/* Multi-Form Modal for Employee Editing */}
      <MultiFormModal
        open={multiFormModalOpen}
        onClose={handleMultiFormModalClose}
        isEditMode={isEditMode}
        editEmployeeData={editEmployeeData}
        initialStep={initialStep}
      />
    </Box>
  );
};

export default EmployeeTypes;
