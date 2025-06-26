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
  Box,
  Chip,
} from "@mui/material";
import { useSnackbar } from "notistack";

import ViewEmployeeModal from "../../components/modal/employee/ViewEmployeeModal";
import MultiFormModal from "../../components/modal/employee/MultiFormModal";
import {
  useGetContactsQuery,
  useDeleteContactMutation,
} from "../../features/api/employee/contactsApi";
import "../../pages/GeneralStyle.scss";
import "../../pages/GeneralTable.scss";
import { CONSTANT } from "../../config/index";

const Contacts = ({ searchQuery, showArchived, debounceValue }) => {
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [menuAnchor, setMenuAnchor] = useState({});
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  // New state for view modal functionality
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(null);

  // New state for multi-form modal functionality
  const [multiFormModalOpen, setMultiFormModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editEmployeeData, setEditEmployeeData] = useState(null);
  const [initialStep, setInitialStep] = useState(0);

  const { enqueueSnackbar } = useSnackbar();

  // Reset page to 1 when search changes
  React.useEffect(() => {
    setPage(1);
  }, [debounceValue, showArchived]);

  // Build query parameters
  const queryParams = useMemo(() => {
    const params = {
      page,
      per_page: rowsPerPage,
      status: showArchived ? "inactive" : "active",
    };

    if (debounceValue && debounceValue.trim() !== "") {
      params.search = debounceValue.trim();
    }

    console.log("Contacts Query Params:", params);
    return params;
  }, [page, rowsPerPage, showArchived, debounceValue]);

  const {
    data: apiResponse,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useGetContactsQuery(queryParams, {
    refetchOnMountOrArgChange: true,
    skip: false,
  });

  const [deleteContact] = useDeleteContactMutation();

  // Process API response and handle the nested contact structure
  const { contactList, totalCount, currentPage, lastPage } = useMemo(() => {
    console.log("API Response:", apiResponse);

    if (!apiResponse) {
      return { contactList: [], totalCount: 0, currentPage: 1, lastPage: 1 };
    }

    // The API response structure: { message, result: { current_page, data, ... } }
    const result = apiResponse.result || apiResponse;
    const data = result.data || [];

    // Extract pagination info
    const total = result.total || result.count || data.length;
    const current = result.current_page || 1;
    const last = result.last_page || Math.ceil(total / rowsPerPage);

    // Transform the nested contact structure into flat records
    const transformedData = data.map((contact) => {
      // Extract mobile number details
      const mobileNumber = contact.mobile_number || {};
      const emailAddress = contact.email_address || {};

      return {
        id: contact.id,
        employee_id: contact.employee_id,
        employee: contact.employee,
        // Mobile number fields
        mobile_id: mobileNumber.id,
        mobile_details: mobileNumber.details,
        mobile_remarks: mobileNumber.remarks,
        mobile_deleted_at: mobileNumber.deleted_at,
        mobile_updated_at: mobileNumber.updated_at,
        // Email address fields
        email_id: emailAddress.id,
        email_details: emailAddress.details,
        email_remarks: emailAddress.remarks,
        email_deleted_at: emailAddress.deleted_at,
        email_updated_at: emailAddress.updated_at,
        // Main contact fields
        deleted_at: contact.deleted_at,
        updated_at: contact.updated_at,
      };
    });

    console.log("Processed data:", {
      data: transformedData.length,
      total,
      currentPage: current,
      lastPage: last,
      firstItem: transformedData[0],
      searchTerm: debounceValue,
    });

    return {
      contactList: transformedData,
      totalCount: total,
      currentPage: current,
      lastPage: last,
    };
  }, [apiResponse, debounceValue, rowsPerPage]);

  const handleMenuOpen = (event, contactId) => {
    event.stopPropagation(); // Prevent row click when opening menu
    setMenuAnchor((prev) => ({ ...prev, [contactId]: event.currentTarget }));
  };

  const handleMenuClose = (contactId) => {
    setMenuAnchor((prev) => ({ ...prev, [contactId]: null }));
  };

  const handleArchiveRestoreClick = (contact) => {
    setSelectedContact(contact);
    setConfirmOpen(true);
    handleMenuClose(contact.id);
  };

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
      enqueueSnackbar(
        error?.data?.message || "Action failed. Please try again.",
        {
          variant: "error",
          autoHideDuration: 2000,
        }
      );
    } finally {
      setConfirmOpen(false);
      setSelectedContact(null);
    }
  };

  const handleAddContact = () => {
    setSelectedContact(null);
    setModalOpen(true);
  };

  const handleEditClick = (contact) => {
    console.log("Edit clicked for contact:", contact);
    setSelectedContact(contact);
    setModalOpen(true);
    handleMenuClose(contact.id);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setSelectedContact(null);
  };

  const handleModalSuccess = () => {
    refetch();
    handleModalClose();
  };

  // New function to handle row clicks
  const handleRowClick = (contact) => {
    if (contact.employee?.id) {
      setSelectedEmployeeId(contact.employee.id);
      setViewModalOpen(true);
    } else {
      enqueueSnackbar("No employee data found for this contact", {
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
  const handleEditEmployee = (employeeData, editStep = 4) => {
    // Default to step 5 (index 4) for contacts
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
    value === null || value === undefined ? "N/A" : String(value);

  // Format employee name with fallback options
  const formatEmployeeName = (employee) => {
    if (!employee) return "N/A";

    return (
      employee.full_name ||
      employee.name ||
      `${employee.first_name || ""} ${employee.last_name || ""}`.trim() ||
      employee.display_name ||
      employee.first_name ||
      "N/A"
    );
  };

  // Client-side filtering as fallback
  const filteredContactList = useMemo(() => {
    if (!debounceValue || debounceValue.trim() === "") {
      return contactList;
    }

    const searchTerm = debounceValue.toLowerCase().trim();
    return contactList.filter((contact) => {
      const employeeName = formatEmployeeName(contact.employee).toLowerCase();
      const mobileDetails = (contact.mobile_details || "").toLowerCase();
      const emailDetails = (contact.email_details || "").toLowerCase();
      const mobileRemarks = (contact.mobile_remarks || "").toLowerCase();
      const emailRemarks = (contact.email_remarks || "").toLowerCase();

      return (
        employeeName.includes(searchTerm) ||
        mobileDetails.includes(searchTerm) ||
        emailDetails.includes(searchTerm) ||
        mobileRemarks.includes(searchTerm) ||
        emailRemarks.includes(searchTerm)
      );
    });
  }, [contactList, debounceValue]);

  // Use filtered list for display, but respect server-side pagination for non-search scenarios
  const displayList =
    debounceValue && debounceValue.trim() !== ""
      ? filteredContactList
      : contactList;

  const displayCount =
    debounceValue && debounceValue.trim() !== ""
      ? filteredContactList.length
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
          <Table stickyHeader sx={{ minWidth: 1000, width: "max-content" }}>
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
                  MOBILE NUMBER
                </TableCell>
                <TableCell
                  className="table-header"
                  sx={{ minWidth: 200, whiteSpace: "nowrap" }}>
                  EMAIL ADDRESS
                </TableCell>
                <TableCell
                  className="table-header"
                  sx={{ minWidth: 200, whiteSpace: "nowrap" }}>
                  REMARKS (MOBILE)
                </TableCell>
                <TableCell
                  className="table-header"
                  sx={{ minWidth: 200, whiteSpace: "nowrap" }}>
                  REMARKS (EMAIL)
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
                displayList.map((contact) => (
                  <TableRow
                    key={contact.id}
                    onClick={() => handleRowClick(contact)}
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
                      {safelyDisplayValue(contact.id)}
                    </TableCell>
                    <TableCell
                      className="table-cell"
                      sx={{ whiteSpace: "nowrap" }}>
                      {formatEmployeeName(contact.employee)}
                    </TableCell>
                    <TableCell
                      className="table-cell"
                      sx={{ whiteSpace: "nowrap" }}>
                      {safelyDisplayValue(contact.mobile_details)}
                    </TableCell>
                    <TableCell
                      className="table-cell"
                      sx={{ whiteSpace: "nowrap" }}>
                      {safelyDisplayValue(contact.email_details)}
                    </TableCell>
                    <TableCell
                      className="table-cell"
                      sx={{ whiteSpace: "nowrap" }}>
                      {safelyDisplayValue(contact.mobile_remarks)}
                    </TableCell>
                    <TableCell
                      className="table-cell"
                      sx={{ whiteSpace: "nowrap" }}>
                      {safelyDisplayValue(contact.email_remarks)}
                    </TableCell>
                    <TableCell
                      className="table-status"
                      sx={{ whiteSpace: "nowrap" }}>
                      <Chip
                        label={
                          showArchived || contact.deleted_at
                            ? "ARCHIVED"
                            : "ACTIVE"
                        }
                        color={
                          showArchived || contact.deleted_at
                            ? "error"
                            : "success"
                        }
                        size="medium"
                        sx={{ "& .MuiChip-label": { fontSize: "0.68rem" } }}
                      />
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    align="center"
                    sx={{ borderBottom: "none" }}
                    className="table-cell">
                    {CONSTANT.BUTTONS.NODATA.icon}
                    <Typography
                      variant="body2"
                      color="textSecondary"
                      sx={{ mt: 1 }}>
                      {debounceValue && debounceValue.trim() !== ""
                        ? `No contacts found for "${debounceValue}"`
                        : "No contacts available"}
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
              minHeight: "52px",
            }}
            labelDisplayedRows={({ from, to, count }) => {
              if (debounceValue && debounceValue.trim() !== "") {
                return `${from}-${to} of ${count} (filtered)`;
              }
              return `${from}-${to} of ${count}`;
            }}
            showFirstButton
            showLastButton
          />
        </Box>
      </Paper>

      {/* View Employee Modal */}
      <ViewEmployeeModal
        open={viewModalOpen}
        onClose={handleViewModalClose}
        employeeId={selectedEmployeeId}
        defaultStep={7} // Step 5 (index 4) for contacts
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

export default Contacts;
