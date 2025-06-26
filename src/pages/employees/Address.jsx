import React, { useState, useMemo, useEffect } from "react";
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
import ViewEmployeeModal from "../../components/modal/employee/ViewEmployeeModal";
import MultiFormModal from "../../components/modal/employee/MultiFormModal";
import { useLazyGetAddressQuery } from "../../features/api/employee/addressApi";
import "../../pages/GeneralStyle.scss";
import "../../pages/GeneralTable.scss";
import { CONSTANT } from "../../config/index";

const Address = ({ searchQuery, showArchived, debounceValue }) => {
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(null);

  const [multiFormModalOpen, setMultiFormModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editEmployeeData, setEditEmployeeData] = useState(null);
  const [initialStep, setInitialStep] = useState(0);

  const { enqueueSnackbar } = useSnackbar();

  const queryParams = useMemo(() => {
    const params = {
      page,
      per_page: rowsPerPage,
      status: showArchived ? "inactive" : "active",
    };

    if (debounceValue && debounceValue.trim() !== "") {
      params.search = debounceValue.trim();
    }

    return params;
  }, [page, rowsPerPage, showArchived, debounceValue]);

  // THIS IS THE KEY CHANGE - useLazyGetAddressQuery returns a trigger function
  const [triggerGetAddress, { data: addresses, isLoading, isFetching, error }] =
    useLazyGetAddressQuery();

  // Auto-trigger the query when component mounts or params change
  useEffect(() => {
    triggerGetAddress(queryParams);
  }, [triggerGetAddress, queryParams]);

  // Reset page when search or archive filter changes
  useEffect(() => {
    setPage(1);
  }, [debounceValue, showArchived]);

  const safelyDisplayValue = (value) =>
    value === null || value === undefined ? "N/A" : String(value);

  const formatEmployeeName = (employee) => {
    if (!employee) return "N/A";
    return (
      employee?.full_name ||
      employee?.name ||
      employee?.first_name ||
      `${employee.first_name} ${employee.last_name}`.trim() ||
      employee?.display_name ||
      "N/A"
    );
  };

  const formatLocation = (address, field) => {
    const value = address[field];
    if (typeof value === "object" && value?.name) {
      return value.name;
    }
    return safelyDisplayValue(value);
  };

  const { addressList, totalCount } = useMemo(() => {
    if (!addresses) {
      return { addressList: [], totalCount: 0 };
    }

    let result;
    if (addresses.result) {
      result = addresses.result;
    } else if (addresses.data) {
      result = addresses.data;
    } else {
      result = addresses;
    }

    const data = Array.isArray(result) ? result : result?.data || [];
    const total = result?.total || result?.count || data.length;

    return {
      addressList: data,
      totalCount: total,
    };
  }, [addresses]);

  const filteredAddressList = useMemo(() => {
    if (!debounceValue || debounceValue.trim() === "") {
      return addressList;
    }

    const searchTerm = debounceValue.toLowerCase().trim();
    return addressList.filter((address) => {
      const employeeName = formatEmployeeName(address.employee).toLowerCase();
      const street = (address.street || "").toLowerCase();
      const barangay = formatLocation(address, "barangay").toLowerCase();
      const city = formatLocation(address, "city_municipality").toLowerCase();
      const subMunicipality = formatLocation(
        address,
        "sub_municipality"
      ).toLowerCase();
      const province = formatLocation(address, "province").toLowerCase();
      const region = formatLocation(address, "region").toLowerCase();
      const zipCode = (address.zip_code || "").toString().toLowerCase();

      return (
        employeeName.includes(searchTerm) ||
        street.includes(searchTerm) ||
        barangay.includes(searchTerm) ||
        city.includes(searchTerm) ||
        subMunicipality.includes(searchTerm) ||
        province.includes(searchTerm) ||
        region.includes(searchTerm) ||
        zipCode.includes(searchTerm)
      );
    });
  }, [addressList, debounceValue]);

  const displayList = filteredAddressList;
  const displayCount =
    debounceValue && debounceValue.trim() !== ""
      ? filteredAddressList.length
      : totalCount;

  const handleEditEmployee = (employeeData, editStep = 1) => {
    setViewModalOpen(false);
    setSelectedEmployeeId(null);

    setIsEditMode(true);
    setEditEmployeeData(employeeData);
    setInitialStep(editStep);
    setMultiFormModalOpen(true);
    console.log("employeeData", employeeData);
  };

  const handleMultiFormModalClose = () => {
    setMultiFormModalOpen(false);
    setIsEditMode(false);
    setEditEmployeeData(null);
    setInitialStep(0);
    // Refetch data by triggering the query again
    triggerGetAddress(queryParams);
  };

  const handleRowClick = (address) => {
    if (address.employee?.id) {
      setSelectedEmployeeId(address.employee.id);
      setViewModalOpen(true);
    } else {
      enqueueSnackbar("No employee data found for this address", {
        variant: "warning",
        autoHideDuration: 3000,
      });
    }
  };

  const handleViewModalClose = () => {
    setViewModalOpen(false);
    setSelectedEmployeeId(null);
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
                  STREET
                </TableCell>
                <TableCell
                  className="table-header"
                  sx={{ minWidth: 120, whiteSpace: "nowrap" }}>
                  BARANGAY
                </TableCell>
                <TableCell
                  className="table-header"
                  sx={{ minWidth: 120, whiteSpace: "nowrap" }}>
                  CITY/MUNICIPALITY
                </TableCell>
                <TableCell
                  className="table-header"
                  sx={{ minWidth: 120, whiteSpace: "nowrap" }}>
                  SUB-MUNICIPALITY
                </TableCell>
                <TableCell
                  className="table-header"
                  sx={{ minWidth: 120, whiteSpace: "nowrap" }}>
                  PROVINCE
                </TableCell>
                <TableCell
                  className="table-header"
                  sx={{ minWidth: 150, whiteSpace: "nowrap" }}>
                  REGION
                </TableCell>
                <TableCell
                  className="table-header"
                  sx={{ minWidth: 100, whiteSpace: "nowrap" }}>
                  ZIP CODE
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
                  <TableCell colSpan={10} align="center">
                    <CircularProgress size={24} />
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={10} align="center" className="table-cell">
                    <Typography color="error">
                      Error: {error?.data?.message || "Failed to load data"}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : displayList.length > 0 ? (
                displayList.map((address) => (
                  <TableRow
                    key={address.id}
                    onClick={() => handleRowClick(address)}
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
                      {safelyDisplayValue(address.id)}
                    </TableCell>
                    <TableCell
                      className="table-cell"
                      sx={{ whiteSpace: "nowrap" }}>
                      {formatEmployeeName(address.employee)}
                    </TableCell>
                    <TableCell
                      className="table-cell"
                      sx={{ whiteSpace: "nowrap" }}>
                      {safelyDisplayValue(address.street)}
                    </TableCell>
                    <TableCell
                      className="table-cell"
                      sx={{ whiteSpace: "nowrap" }}>
                      {formatLocation(address, "barangay")}
                    </TableCell>
                    <TableCell
                      className="table-cell"
                      sx={{ whiteSpace: "nowrap" }}>
                      {formatLocation(address, "city_municipality")}
                    </TableCell>
                    <TableCell
                      className="table-cell"
                      sx={{ whiteSpace: "nowrap" }}>
                      {formatLocation(address, "sub_municipality")}
                    </TableCell>
                    <TableCell
                      className="table-cell"
                      sx={{ whiteSpace: "nowrap" }}>
                      {formatLocation(address, "province")}
                    </TableCell>
                    <TableCell
                      className="table-cell"
                      sx={{ whiteSpace: "nowrap" }}>
                      {formatLocation(address, "region")}
                    </TableCell>
                    <TableCell
                      className="table-cell"
                      sx={{ whiteSpace: "nowrap" }}>
                      {safelyDisplayValue(address.zip_code)}
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
                    colSpan={10}
                    align="center"
                    borderBottom="none"
                    className="table-cell">
                    {CONSTANT?.BUTTONS?.NODATA?.icon || (
                      <Typography
                        variant="body2"
                        color="textSecondary"
                        sx={{ mt: 1 }}>
                        {debounceValue && debounceValue.trim() !== ""
                          ? `No addresses found for "${debounceValue}"`
                          : showArchived
                          ? "No archived addresses found."
                          : "No active addresses found."}
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
              minHeight: "52px",
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

      <ViewEmployeeModal
        open={viewModalOpen}
        onClose={handleViewModalClose}
        employeeId={selectedEmployeeId}
        defaultStep={1}
        onEdit={handleEditEmployee}
      />

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

export default Address;
