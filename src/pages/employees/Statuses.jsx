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
  Box,
  Chip,
} from "@mui/material";
import { useSnackbar } from "notistack";
import {
  useGetStatusQuery,
  useDeleteStatusMutation,
} from "../../features/api/employee/statusApi";

import ViewEmployeeModal from "../../components/modal/employee/ViewEmployeeModal";
// import MultiFormModal from "../../components/modal/employee/MultiFormModal";
import "../../pages/GeneralStyle.scss";
import "../../pages/GeneralTable.scss";
import { CONSTANT } from "../../config/index";

const Statuses = ({ searchQuery, showArchived, debounceValue }) => {
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [statusToEdit, setStatusToEdit] = useState(null);

  // New state for view modal functionality
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(null);

  // New state for multi-form modal functionality
  const [multiFormModalOpen, setMultiFormModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editEmployeeData, setEditEmployeeData] = useState(null);
  const [initialStep, setInitialStep] = useState(0);

  const { enqueueSnackbar } = useSnackbar();

  React.useEffect(() => {
    setPage(1);
  }, [debounceValue, showArchived]);

  const queryParams = useMemo(() => {
    const params = {
      page,
      per_page: rowsPerPage,
      status: showArchived ? "inactive" : "active",
    };

    if (debounceValue && debounceValue.trim() !== "") {
      params.search = debounceValue.trim();
    }

    console.log("Statuses Query Params:", params);
    return params;
  }, [page, rowsPerPage, showArchived, debounceValue]);

  const {
    data: apiResponse,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useGetStatusQuery(queryParams, {
    refetchOnMountOrArgChange: true,
    skip: false,
  });

  const [deleteEmployeeStatus] = useDeleteStatusMutation();

  const { statusList, totalCount } = useMemo(() => {
    console.log("API Response:", apiResponse);

    if (!apiResponse) {
      return { statusList: [], totalCount: 0 };
    }

    let result;
    if (apiResponse.result) {
      result = apiResponse.result;
    } else if (apiResponse.data) {
      result = apiResponse.data;
    } else {
      result = apiResponse;
    }

    const data = Array.isArray(result) ? result : result?.data || [];
    const total = result?.total || result?.count || data.length;

    console.log("Processed data:", {
      data: data.length,
      total,
      firstItem: data[0],
      searchTerm: debounceValue,
    });

    return {
      statusList: data,
      totalCount: total,
    };
  }, [apiResponse, debounceValue]);

  // New handlers for row click functionality
  const handleRowClick = (status) => {
    if (status.employee?.id) {
      setSelectedEmployeeId(status.employee.id);
      setViewModalOpen(true);
    } else {
      enqueueSnackbar("No employee data found for this status", {
        variant: "warning",
        autoHideDuration: 3000,
      });
    }
  };

  const handleViewModalClose = () => {
    setViewModalOpen(false);
    setSelectedEmployeeId(null);
  };

  const handleEditEmployee = (employeeData, editStep = 4) => {
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

  // Missing handler functions for StatusModal - COMMENTED OUT FOR NOW
  // const handleEditModalClose = () => {
  //   setEditModalOpen(false);
  //   setStatusToEdit(null);
  // };

  // const handleStatusUpdateSuccess = () => {
  //   enqueueSnackbar("Status updated successfully", {
  //     variant: "success",
  //     autoHideDuration: 3000,
  //   });
  //   setEditModalOpen(false);
  //   setStatusToEdit(null);
  //   refetch(); // Refresh the data
  // };

  const safelyDisplayValue = (value) =>
    value === null || value === undefined ? "—" : String(value);

  const formatEmployeeName = (employee) => {
    if (!employee) return "—";

    return (
      employee.full_name ||
      employee.name ||
      employee.first_name ||
      `${employee.first_name} ${employee.last_name}`.trim() ||
      employee.display_name ||
      "—"
    );
  };

  const formatDateForDisplay = (dateString) => {
    if (!dateString || dateString === "N/A") return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "2-digit",
      });
    } catch (error) {
      return dateString;
    }
  };

  const getStatusChipColor = (status) => {
    switch (status?.toLowerCase()) {
      case "regular":
        return "success";
      case "probationary":
        return "warning";
      case "contractual":
        return "info";
      case "terminated":
      case "resigned":
        return "error";
      default:
        return "default";
    }
  };

  const filteredStatusList = useMemo(() => {
    if (!debounceValue || debounceValue.trim() === "") {
      return statusList;
    }

    const searchTerm = debounceValue.toLowerCase().trim();
    return statusList.filter((status) => {
      const employeeName = formatEmployeeName(status.employee).toLowerCase();
      const statusLabel = (status.employee_status_label || "").toLowerCase();
      const employeeStatus = (status.employee_status || "").toLowerCase();
      const remarks = (status.employee_status_remarks || "").toLowerCase();

      return (
        employeeName.includes(searchTerm) ||
        statusLabel.includes(searchTerm) ||
        employeeStatus.includes(searchTerm) ||
        remarks.includes(searchTerm)
      );
    });
  }, [statusList, debounceValue]);

  const displayList = filteredStatusList;
  const displayCount =
    debounceValue && debounceValue.trim() !== ""
      ? filteredStatusList.length
      : totalCount;

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
          <Table stickyHeader sx={{ minWidth: 1300, width: "max-content" }}>
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
                  sx={{ minWidth: 150, whiteSpace: "nowrap" }}>
                  STATUS LABEL
                </TableCell>
                <TableCell
                  className="table-header"
                  sx={{ minWidth: 130, whiteSpace: "nowrap" }}>
                  EMPLOYEE STATUS
                </TableCell>
                <TableCell
                  className="table-header"
                  sx={{ minWidth: 130, whiteSpace: "nowrap" }}>
                  START DATE
                </TableCell>
                <TableCell
                  className="table-header"
                  sx={{ minWidth: 120, whiteSpace: "nowrap" }}>
                  END DATE
                </TableCell>
                <TableCell
                  className="table-header"
                  sx={{ minWidth: 140, whiteSpace: "nowrap" }}>
                  EFFECTIVITY DATE
                </TableCell>
                <TableCell
                  className="table-header"
                  sx={{ minWidth: 150, whiteSpace: "nowrap" }}>
                  REMARKS
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
              ) : displayList.length > 0 ? (
                displayList.map((status) => (
                  <TableRow
                    key={status.id}
                    onClick={() => handleRowClick(status)}
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
                      {safelyDisplayValue(status.id)}
                    </TableCell>
                    <TableCell
                      className="table-cell"
                      sx={{ whiteSpace: "nowrap" }}>
                      {formatEmployeeName(status.employee)}
                    </TableCell>
                    <TableCell
                      className="table-cell"
                      sx={{ whiteSpace: "nowrap" }}>
                      <Chip
                        label={safelyDisplayValue(status.employee_status_label)}
                        size="small"
                        variant="outlined"
                        sx={{
                          "& .MuiChip-label": { fontSize: "0.75rem" },
                          fontWeight: "medium",
                        }}
                      />
                    </TableCell>
                    <TableCell
                      className="table-cell"
                      sx={{ whiteSpace: "nowrap" }}>
                      <Chip
                        label={safelyDisplayValue(
                          status.employee_status
                        ).toUpperCase()}
                        size="small"
                        color={getStatusChipColor(status.employee_status)}
                        sx={{
                          "& .MuiChip-label": { fontSize: "0.75rem" },
                          fontWeight: "medium",
                        }}
                      />
                    </TableCell>
                    <TableCell
                      className="table-cell"
                      sx={{ whiteSpace: "nowrap" }}>
                      {formatDateForDisplay(status.employee_status_start_date)}
                    </TableCell>
                    <TableCell
                      className="table-cell"
                      sx={{ whiteSpace: "nowrap" }}>
                      {formatDateForDisplay(status.employee_status_end_date)}
                    </TableCell>
                    <TableCell
                      className="table-cell"
                      sx={{ whiteSpace: "nowrap" }}>
                      {formatDateForDisplay(
                        status.employee_status_effectivity_date
                      )}
                    </TableCell>
                    <TableCell
                      className="table-cell"
                      sx={{
                        whiteSpace: "nowrap",
                        maxWidth: 150,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}>
                      {safelyDisplayValue(status.employee_status_remarks)}
                    </TableCell>
                    <TableCell
                      className="table-status"
                      sx={{ whiteSpace: "nowrap" }}>
                      <Chip
                        label={showArchived ? "ARCHIVED" : "ACTIVE"}
                        color={showArchived ? "error" : "success"}
                        size="small"
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
                    sx={{ borderBottom: "none" }}
                    className="table-cell">
                    {CONSTANT.BUTTONS.NODATA.icon}
                    <Typography
                      variant="body2"
                      color="textSecondary"
                      sx={{ mt: 1 }}>
                      {debounceValue && debounceValue.trim() !== ""
                        ? `No statuses found for "${debounceValue}"`
                        : showArchived
                        ? "No archived statuses found"
                        : "No active statuses found"}
                    </Typography>
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
            count={displayCount}
            rowsPerPage={rowsPerPage}
            page={Math.min(
              page - 1,
              Math.max(0, Math.ceil(displayCount / rowsPerPage) - 1)
            )}
            onPageChange={(event, newPage) => setPage(newPage + 1)}
            onRowsPerPageChange={(event) => {
              setRowsPerPage(parseInt(event.target.value, 10));
              setPage(1);
            }}
            sx={{
              borderTop: "1px solid #e0e0e0",
              backgroundColor: "#fafafa",
              minHeight: "52px", // Ensure minimum height
            }}
            labelDisplayedRows={({ from, to, count }) => {
              if (debounceValue && debounceValue.trim() !== "") {
                return `${from}-${to} of ${count} (filtered)`;
              }
              return `${from}-${to} of ${count}`;
            }}
          />
        </Box>
      </Paper>

      {/* Status Edit Modal - COMMENTED OUT FOR NOW */}
      {/* <StatusModal
        open={editModalOpen}
        onClose={handleEditModalClose}
        employeeStatus={statusToEdit}
        onSuccess={handleStatusUpdateSuccess}
      /> */}

      {/* View Employee Modal */}
      <ViewEmployeeModal
        open={viewModalOpen}
        onClose={handleViewModalClose}
        employeeId={selectedEmployeeId}
        defaultStep={4} // Status step
        onEdit={handleEditEmployee}
      />

      {/* Multi-Form Modal for editing employee */}
      {/* <MultiFormModal
        open={multiFormModalOpen}
        onClose={handleMultiFormModalClose}
        isEditMode={isEditMode}
        editEmployeeData={editEmployeeData}
        initialStep={initialStep}
      /> */}
    </Box>
  );
};

export default Statuses;
