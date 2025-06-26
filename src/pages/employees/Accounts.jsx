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
  Chip,
  Box,
} from "@mui/material";
import NoDataGIF from "../../assets/no-data.gif";
import { useSnackbar } from "notistack";
import {
  useGetAccountsQuery,
  useDeleteAccountMutation,
} from "../../features/api/employee/accountsApi";
import ViewEmployeeModal from "../../components/modal/employee/ViewEmployeeModal";
import MultiFormModal from "../../components/modal/employee/MultiFormModal";
import "../../pages/GeneralStyle.scss";
import "../../pages/GeneralTable.scss";
import { CONSTANT } from "../../config/index";

const Accounts = ({ searchQuery, showArchived, debounceValue }) => {
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // State for ViewEmployeeModal
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(null);

  // State for MultiFormModal (Edit Modal)
  const [multiFormModalOpen, setMultiFormModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editEmployeeData, setEditEmployeeData] = useState(null);
  const [initialStep, setInitialStep] = useState(0);

  const { enqueueSnackbar } = useSnackbar();

  // Reset page to 1 when search changes
  React.useEffect(() => {
    setPage(1);
  }, [debounceValue, showArchived]);

  // 🔧 FIX 1: Ensure search parameter is only included when there's a valid search term
  const queryParams = useMemo(() => {
    const params = {
      page,
      per_page: rowsPerPage,
      status: showArchived ? "inactive" : "active",
    };

    // Only add search parameter if there's a meaningful search value
    if (debounceValue && debounceValue.trim() !== "") {
      params.search = debounceValue.trim();
    }

    console.log("Accounts Query Params:", params);
    return params;
  }, [page, rowsPerPage, showArchived, debounceValue]);

  const {
    data: apiResponse,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useGetAccountsQuery(queryParams, {
    refetchOnMountOrArgChange: true,
    skip: false,
  });

  const [deleteAccount] = useDeleteAccountMutation();

  // 🔧 FIX 2: Better data structure handling with more robust error checking
  const { accountList, totalCount } = useMemo(() => {
    console.log("API Response:", apiResponse);

    if (!apiResponse) {
      return { accountList: [], totalCount: 0 };
    }

    // Handle different possible response structures
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
      accountList: data,
      totalCount: total,
    };
  }, [apiResponse, debounceValue]);

  // Handle row click to open ViewEmployeeModal
  const handleRowClick = useCallback(
    (account) => {
      // Set the employee ID from the account data
      if (account.employee?.id) {
        setSelectedEmployeeId(account.employee.id);
        setViewModalOpen(true);
        console.log("Account clicked, opening employee:", account.employee);
      } else {
        console.warn("No employee data found for this account");
        enqueueSnackbar("No employee data found for this account", {
          variant: "warning",
          autoHideDuration: 3000,
        });
      }
    },
    [enqueueSnackbar]
  );

  // Function to handle edit action from ViewEmployeeModal
  const handleEditEmployee = useCallback((employeeData, editStep = 6) => {
    console.log("Edit requested for employee:", employeeData);
    console.log("Edit step:", editStep);

    // Close the view modal first
    setViewModalOpen(false);
    setSelectedEmployeeId(null);

    // Set the employee data and initial step for editing
    setIsEditMode(true);
    setEditEmployeeData(employeeData);
    setInitialStep(editStep); // This will be 7 for accounts step
    setMultiFormModalOpen(true);
  }, []);

  // Modal close handlers
  const handleViewModalClose = useCallback(() => {
    setViewModalOpen(false);
    setSelectedEmployeeId(null);
  }, []);

  const handleMultiFormModalClose = useCallback(() => {
    setMultiFormModalOpen(false);
    setIsEditMode(false);
    setEditEmployeeData(null);
    setInitialStep(0);
    refetch();
  }, [refetch]);

  const safelyDisplayValue = (value) =>
    value === null || value === undefined ? "—" : String(value);

  // 🔧 FIX 3: Improved employee name formatting with more fallback options
  const formatEmployeeName = (employee) => {
    if (!employee) return "—";

    // Try different possible name fields
    return (
      employee.full_name ||
      employee.name ||
      employee.first_name ||
      `${employee.first_name} ${employee.last_name}`.trim() ||
      employee.display_name ||
      "—"
    );
  };

  const formatBankName = (bank) => {
    return bank?.name || "—";
  };

  // 🔧 FIX 4: Add client-side filtering as a fallback (in case backend search isn't working properly)
  const filteredAccountList = useMemo(() => {
    if (!debounceValue || debounceValue.trim() === "") {
      return accountList;
    }

    const searchTerm = debounceValue.toLowerCase().trim();
    return accountList.filter((account) => {
      const employeeName = formatEmployeeName(account.employee).toLowerCase();
      const sssNumber = (account.sss_number || "").toLowerCase();
      const pagIbigNumber = (account.pag_ibig_number || "").toLowerCase();
      const philHealthNumber = (account.philhealth_number || "").toLowerCase();
      const tinNumber = (account.tin_number || "").toLowerCase();
      const bankName = formatBankName(account.bank).toLowerCase();

      return (
        employeeName.includes(searchTerm) ||
        sssNumber.includes(searchTerm) ||
        pagIbigNumber.includes(searchTerm) ||
        philHealthNumber.includes(searchTerm) ||
        tinNumber.includes(searchTerm) ||
        bankName.includes(searchTerm)
      );
    });
  }, [accountList, debounceValue]);

  // 🔧 FIX 5: Use filtered list for display
  const displayList = filteredAccountList;
  const displayCount =
    debounceValue && debounceValue.trim() !== ""
      ? filteredAccountList.length
      : totalCount;

  return (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        minHeight: 0, // Important for flex containers
      }}>
      <Paper
        className="container"
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          minHeight: 0, // Important for flex containers
        }}>
        <TableContainer
          className="table-container"
          sx={{
            flex: 1,
            overflowX: "auto",
            overflowY: "auto",
            width: "100%",
            maxWidth: "100%",
            minHeight: 0, // Important: allows container to shrink
          }}>
          {/* 🔧 FIXED: Updated table layout without ACTIONS column */}
          <Table stickyHeader sx={{ width: "100%", minWidth: "1150px" }}>
            <TableHead>
              <TableRow>
                <TableCell
                  className="table-id"
                  sx={{
                    width: "80px",
                    minWidth: "80px",
                    maxWidth: "80px",
                  }}>
                  ID
                </TableCell>
                <TableCell
                  className="table-header"
                  sx={{
                    width: "180px",
                    minWidth: "150px",
                  }}>
                  EMPLOYEE
                </TableCell>
                <TableCell
                  className="table-header"
                  sx={{
                    width: "150px",
                    minWidth: "130px",
                  }}>
                  SSS
                </TableCell>
                <TableCell
                  className="table-header"
                  sx={{
                    width: "150px",
                    minWidth: "130px",
                  }}>
                  PAG-IBIG
                </TableCell>
                <TableCell
                  className="table-header"
                  sx={{
                    width: "160px",
                    minWidth: "140px",
                  }}>
                  PHILHEALTH
                </TableCell>
                <TableCell
                  className="table-header"
                  sx={{
                    width: "150px",
                    minWidth: "130px",
                  }}>
                  TIN
                </TableCell>
                <TableCell
                  className="table-header"
                  sx={{
                    width: "220px",
                    minWidth: "180px",
                  }}>
                  BANK
                </TableCell>
                <TableCell
                  className="table-status"
                  sx={{
                    width: "100px",
                    minWidth: "100px",
                    maxWidth: "100px",
                  }}>
                  STATUS
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isFetching ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    <CircularProgress size={24} />
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" className="table-cell">
                    <Typography color="error">
                      Error: {error?.data?.message || "Failed to load data"}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : displayList.length > 0 ? (
                displayList.map((account) => {
                  return (
                    <TableRow
                      key={account.id}
                      onClick={() => handleRowClick(account)}
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
                        sx={{
                          width: "80px",
                          minWidth: "80px",
                          maxWidth: "80px",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          textAlign: "center",
                        }}>
                        {safelyDisplayValue(account.id)}
                      </TableCell>
                      <TableCell
                        className="table-cell"
                        sx={{
                          width: "180px",
                          minWidth: "150px",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}>
                        {formatEmployeeName(account.employee)}
                      </TableCell>
                      <TableCell
                        className="table-cell"
                        sx={{
                          width: "150px",
                          minWidth: "130px",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}>
                        {safelyDisplayValue(account.sss_number)}
                      </TableCell>
                      <TableCell
                        className="table-cell"
                        sx={{
                          width: "150px",
                          minWidth: "130px",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}>
                        {safelyDisplayValue(account.pag_ibig_number)}
                      </TableCell>
                      <TableCell
                        className="table-cell"
                        sx={{
                          width: "160px",
                          minWidth: "140px",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}>
                        {safelyDisplayValue(account.philhealth_number)}
                      </TableCell>
                      <TableCell
                        className="table-cell"
                        sx={{
                          width: "150px",
                          minWidth: "130px",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}>
                        {safelyDisplayValue(account.tin_number)}
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
                        {formatBankName(account.bank)}
                      </TableCell>
                      <TableCell
                        className="table-status"
                        sx={{
                          width: "100px",
                          minWidth: "100px",
                          maxWidth: "100px",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}>
                        <Chip
                          label={showArchived ? "ARCHIVED" : "ACTIVE"}
                          color={showArchived ? "error" : "success"}
                          size="small"
                          sx={{
                            "& .MuiChip-label": {
                              fontSize: "0.65rem",
                              fontWeight: "500",
                            },
                          }}
                        />
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    align="center"
                    sx={{ borderBottom: "none" }}
                    className="table-cell">
                    {CONSTANT?.BUTTONS?.NODATA?.icon || (
                      <>
                        <img
                          src={NoDataGIF}
                          alt="No data"
                          style={{ width: 150 }}
                        />
                        <Typography
                          variant="body2"
                          color="textSecondary"
                          sx={{ mt: 1 }}>
                          {debounceValue && debounceValue.trim() !== ""
                            ? `No accounts found for "${debounceValue}"`
                            : showArchived
                            ? "No archived accounts found."
                            : "No active accounts found."}
                        </Typography>
                      </>
                    )}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* 🔧 FIX 6: Updated pagination to use display count */}
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

      {/* ViewEmployeeModal - Modal for viewing employee details */}
      <ViewEmployeeModal
        open={viewModalOpen}
        onClose={handleViewModalClose}
        employeeId={selectedEmployeeId}
        defaultStep={6} // Step 7 is the "ACCOUNTS" step (0-indexed)
        onEdit={handleEditEmployee} // This handles edit from view modal
      />

      {/* MultiFormModal - Modal for editing employee */}
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

export default Accounts;
