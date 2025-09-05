// import React, { useState, useMemo, useCallback, useEffect } from "react";
// import {
//   Paper,
//   Typography,
//   TablePagination,
//   CircularProgress,
//   Box,
//   TextField,
//   Checkbox,
//   FormControlLabel,
//   Button,
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   DialogActions,
//   useTheme,
//   Fade,
//   Tooltip,
//   FormGroup,
//   Chip,
// } from "@mui/material";
// import SearchIcon from "@mui/icons-material/Search";
// import FilterListIcon from "@mui/icons-material/FilterList";
// import HelpIcon from "@mui/icons-material/Help";
// import { FormProvider, useForm } from "react-hook-form";
// import { useSnackbar } from "notistack";
// import "../../pages/GeneralStyle.scss";
// import { useGetPendingEmployeesQuery } from "../../features/api/employee/pendingApi";
// import { useLazyGetSingleEmployeeQuery } from "../../features/api/employee/mainApi";
// import PendingRegistrationModal from "../../components/modal/employee/pendingFormModal/PendingRegistrationModal";
// import PendingRegistrationTable from "./PendingRegistrationTable";
// import { styles } from "../forms/manpowerform/FormSubmissionStyles";

// const useDebounce = (value, delay) => {
//   const [debouncedValue, setDebouncedValue] = useState(value);

//   useEffect(() => {
//     const handler = setTimeout(() => {
//       setDebouncedValue(value);
//     }, delay);

//     return () => {
//       clearTimeout(handler);
//     };
//   }, [value, delay]);

//   return debouncedValue;
// };

// const statusOptions = [
//   { value: "pending", label: "Pending" },
//   { value: "approved", label: "Approved" },
//   { value: "rejected", label: "Rejected" },
//   { value: "returned", label: "Returned" },
//   { value: "for receiving", label: "For Receiving" },
//   { value: "awaiting resubmission", label: "Awaiting Resubmission" },
//   { value: "cancelled", label: "Cancelled" },
// ];

// const FilterDialog = ({ open, onClose, selectedFilters, onFiltersChange }) => {
//   const [tempFilters, setTempFilters] = useState(selectedFilters);

//   useEffect(() => {
//     setTempFilters(selectedFilters);
//   }, [selectedFilters, open]);

//   const handleFilterToggle = (filterValue) => {
//     setTempFilters((prev) =>
//       prev.includes(filterValue)
//         ? prev.filter((f) => f !== filterValue)
//         : [...prev, filterValue]
//     );
//   };

//   const handleApply = () => {
//     onFiltersChange(tempFilters);
//     onClose();
//   };

//   const handleClear = () => {
//     setTempFilters([]);
//   };

//   const handleSelectAll = () => {
//     setTempFilters(statusOptions.map((option) => option.value));
//   };

//   const handleToggleAll = () => {
//     if (tempFilters.length === statusOptions.length) {
//       handleClear();
//     } else {
//       handleSelectAll();
//     }
//   };

//   const isAllSelected = tempFilters.length === statusOptions.length;

//   return (
//     <Dialog
//       open={open}
//       onClose={onClose}
//       maxWidth="xs"
//       fullWidth
//       PaperProps={{
//         sx: styles.filterDialog,
//       }}>
//       <DialogTitle>
//         <Box sx={styles.filterDialogTitle}>
//           <Box sx={styles.filterDialogTitleLeft}>
//             <FilterListIcon sx={styles.filterIcon} />
//             <Typography variant="h6" sx={styles.filterDialogTitleText}>
//               FILTER BY STATUS
//             </Typography>
//           </Box>
//           <Button
//             size="small"
//             variant="outlined"
//             onClick={handleToggleAll}
//             sx={{
//               ...styles.selectAllButton,
//               ...(isAllSelected && styles.unselectAllButton),
//             }}>
//             {isAllSelected ? "Unselect All" : "Select All"}
//           </Button>
//         </Box>
//       </DialogTitle>

//       <DialogContent>
//         <Box sx={styles.filterDialogContent}>
//           {statusOptions.map((option) => (
//             <FormControlLabel
//               key={option.value}
//               control={
//                 <Checkbox
//                   checked={tempFilters.includes(option.value)}
//                   onChange={() => handleFilterToggle(option.value)}
//                   sx={styles.filterCheckbox}
//                 />
//               }
//               label={option.label}
//               sx={styles.filterFormControlLabel}
//             />
//           ))}
//         </Box>
//       </DialogContent>

//       <DialogActions sx={styles.filterDialogActions}>
//         <Box sx={styles.dialogActionsContainer}>
//           <Box sx={styles.dialogButtonsContainer}>
//             <Button
//               onClick={onClose}
//               variant="outlined"
//               sx={styles.cancelButton}>
//               CANCEL
//             </Button>
//             <Button
//               onClick={handleApply}
//               variant="contained"
//               sx={styles.applyFiltersButton}>
//               APPLY FILTERS
//             </Button>
//           </Box>
//         </Box>
//       </DialogActions>
//     </Dialog>
//   );
// };

// const CustomSearchBar = ({
//   searchQuery,
//   setSearchQuery,
//   selectedFilters,
//   onFilterClick,
//   isLoading = false,
// }) => {
//   const hasActiveFilters = selectedFilters.length > 0;
//   const iconColor = hasActiveFilters
//     ? "rgba(0, 133, 49, 1)"
//     : "rgb(33, 61, 112)";

//   return (
//     <Box sx={styles.searchBarContainer}>
//       <Tooltip title="Click here to filter by status" arrow>
//         <FormControlLabel
//           control={
//             <Checkbox
//               checked={hasActiveFilters}
//               onChange={onFilterClick}
//               disabled={isLoading}
//               icon={<FilterListIcon sx={{ color: iconColor }} />}
//               checkedIcon={<FilterListIcon sx={{ color: iconColor }} />}
//               size="small"
//             />
//           }
//           label={
//             <Box sx={styles.filterLabelBox}>
//               <span>FILTER</span>
//               {hasActiveFilters && (
//                 <Chip
//                   label={selectedFilters.length}
//                   size="small"
//                   sx={styles.filterCountChip}
//                 />
//               )}
//             </Box>
//           }
//           sx={styles.filterControlLabel(hasActiveFilters)}
//         />
//       </Tooltip>

//       <TextField
//         placeholder="Search employee..."
//         value={searchQuery}
//         onChange={(e) => setSearchQuery(e.target.value)}
//         disabled={isLoading}
//         size="small"
//         InputProps={{
//           startAdornment: <SearchIcon sx={styles.searchIcon(isLoading)} />,
//           endAdornment: isLoading && (
//             <CircularProgress size={16} sx={styles.searchProgress} />
//           ),
//           sx: styles.searchInputProps(isLoading),
//         }}
//         sx={styles.searchTextField}
//       />
//     </Box>
//   );
// };

// const Pending = () => {
//   const theme = useTheme();
//   const { enqueueSnackbar } = useSnackbar();

//   const [page, setPage] = useState(1);
//   const [rowsPerPage, setRowsPerPage] = useState(10);
//   const [searchQuery, setSearchQuery] = useState("");
//   const [selectedFilters, setSelectedFilters] = useState([]);
//   const [filterDialogOpen, setFilterDialogOpen] = useState(false);
//   const [modalOpen, setModalOpen] = useState(false);
//   const [modalMode, setModalMode] = useState("view");
//   const [selectedEmployee, setSelectedEmployee] = useState(null);
//   const [modalLoading, setModalLoading] = useState(false);
//   const [menuAnchor, setMenuAnchor] = useState({});
//   const [confirmOpen, setConfirmOpen] = useState(false);
//   const [confirmAction, setConfirmAction] = useState(null);
//   const [selectedEmployeeForAction, setSelectedEmployeeForAction] =
//     useState(null);
//   const [isLoading, setIsLoading] = useState(false);

//   const methods = useForm();
//   const debounceValue = useDebounce(searchQuery, 500);

//   const queryParams = useMemo(() => {
//     const params = {
//       page,
//       per_page: rowsPerPage,
//       pagination: true,
//       status: "active",
//     };

//     if (debounceValue && debounceValue.trim() !== "") {
//       params.search = debounceValue.trim();
//     }

//     if (selectedFilters.length > 0) {
//       params.approval_status = selectedFilters.join(",");
//     }

//     return params;
//   }, [debounceValue, page, rowsPerPage, selectedFilters]);

//   const {
//     data: employeesData,
//     isLoading: queryLoading,
//     isFetching,
//     refetch,
//     error,
//   } = useGetPendingEmployeesQuery(queryParams, {
//     refetchOnMountOrArgChange: true,
//     skip: false,
//   });

//   const [getSingleEmployee] = useLazyGetSingleEmployeeQuery();

//   const employeesList = useMemo(
//     () => employeesData?.result?.data || employeesData?.data || [],
//     [employeesData]
//   );

//   const paginationData = useMemo(() => {
//     if (!employeesData) return null;

//     const resultData = employeesData?.result || employeesData;
//     return {
//       total: resultData?.total || 0,
//       current_page: resultData?.current_page || 1,
//       per_page: resultData?.per_page || 10,
//       last_page: resultData?.last_page || 1,
//     };
//   }, [employeesData]);

//   const canEditEmployee = useCallback((employee) => {
//     const editableStatuses = [
//       "pending",
//       "awaiting resubmission",
//       "returned",
//       "rejected",
//     ];
//     return editableStatuses.includes(employee?.status?.toLowerCase());
//   }, []);

//   const handleSearchChange = useCallback((newSearchQuery) => {
//     setSearchQuery(newSearchQuery);
//     setPage(1);
//   }, []);

//   const handleFilterClick = useCallback(() => {
//     setFilterDialogOpen(true);
//   }, []);

//   const handleFiltersChange = useCallback((newFilters) => {
//     setSelectedFilters(newFilters);
//     setPage(1);
//   }, []);

//   const handleModalClose = useCallback(() => {
//     setModalOpen(false);
//     setSelectedEmployee(null);
//     setModalMode("view");
//   }, []);

//   const handleRowClick = useCallback(
//     async (employee) => {
//       setModalLoading(true);
//       try {
//         const submittableId = employee?.submittable?.id;

//         if (!submittableId) {
//           throw new Error("Submittable ID not found for this record");
//         }

//         const result = await getSingleEmployee(submittableId).unwrap();
//         setSelectedEmployee(result?.result || employee);
//         setModalMode("view");
//         setModalOpen(true);
//       } catch (error) {
//         enqueueSnackbar("Failed to load employee details", {
//           variant: "error",
//           autoHideDuration: 3000,
//         });
//         setSelectedEmployee(employee);
//         setModalMode("view");
//         setModalOpen(true);
//       } finally {
//         setModalLoading(false);
//       }
//     },
//     [getSingleEmployee, enqueueSnackbar]
//   );

//   const handleApproveEmployee = useCallback(
//     async (employeeId) => {
//       const employee = employeesList.find((emp) => emp.id === employeeId);
//       if (employee) {
//         const submittableId = employee?.submittable?.id;
//         if (!submittableId) {
//           enqueueSnackbar("Submittable ID not found for this employee.", {
//             variant: "error",
//             autoHideDuration: 2000,
//           });
//           return;
//         }

//         setSelectedEmployeeForAction({ ...employee, actionId: submittableId });
//         setConfirmAction("approve");
//         setConfirmOpen(true);
//       } else {
//         enqueueSnackbar("Employee not found. Please try again.", {
//           variant: "error",
//           autoHideDuration: 2000,
//         });
//       }
//     },
//     [employeesList, enqueueSnackbar]
//   );

//   const handleRejectEmployee = useCallback(
//     async (employeeId) => {
//       const employee = employeesList.find((emp) => emp.id === employeeId);
//       if (employee) {
//         const submittableId = employee?.submittable?.id;
//         if (!submittableId) {
//           enqueueSnackbar("Submittable ID not found for this employee.", {
//             variant: "error",
//             autoHideDuration: 2000,
//           });
//           return;
//         }

//         setSelectedEmployeeForAction({ ...employee, actionId: submittableId });
//         setConfirmAction("reject");
//         setConfirmOpen(true);
//       } else {
//         enqueueSnackbar("Employee not found. Please try again.", {
//           variant: "error",
//           autoHideDuration: 2000,
//         });
//       }
//     },
//     [employeesList, enqueueSnackbar]
//   );

//   const handleEditEmployee = useCallback(
//     (employee) => {
//       if (canEditEmployee(employee)) {
//         const submittableId = employee?.submittable?.id;
//         if (!submittableId) {
//           enqueueSnackbar("Submittable ID not found for this employee.", {
//             variant: "error",
//             autoHideDuration: 3000,
//           });
//           return;
//         }

//         setSelectedEmployee({ ...employee, editId: submittableId });
//         setModalMode("edit");
//         setModalOpen(true);
//       } else {
//         enqueueSnackbar(
//           "This employee registration cannot be edited in its current status.",
//           {
//             variant: "warning",
//             autoHideDuration: 3000,
//           }
//         );
//       }
//     },
//     [canEditEmployee, enqueueSnackbar]
//   );

//   const handleMenuOpen = useCallback((event, employee) => {
//     event.stopPropagation();
//     setMenuAnchor((prev) => ({
//       ...prev,
//       [employee.id]: event.currentTarget,
//     }));
//   }, []);

//   const handleMenuClose = useCallback((employeeId) => {
//     setMenuAnchor((prev) => ({ ...prev, [employeeId]: null }));
//   }, []);

//   const handleActionClick = useCallback(
//     (employee, action, event = null) => {
//       if (event) {
//         event.stopPropagation();
//       }

//       if (action === "edit" && !canEditEmployee(employee)) {
//         enqueueSnackbar(
//           "This employee registration cannot be edited in its current status.",
//           {
//             variant: "warning",
//             autoHideDuration: 3000,
//           }
//         );
//         handleMenuClose(employee.id);
//         return;
//       }

//       setSelectedEmployeeForAction(employee);
//       setConfirmAction(action);
//       setConfirmOpen(true);
//       handleMenuClose(employee.id);
//     },
//     [handleMenuClose, canEditEmployee, enqueueSnackbar]
//   );

//   const handleActionConfirm = async () => {
//     if (!confirmAction) return;

//     setIsLoading(true);
//     setModalLoading(true);

//     try {
//       let result;

//       switch (confirmAction) {
//         case "approve":
//           if (selectedEmployeeForAction) {
//             enqueueSnackbar("Employee approved successfully!", {
//               variant: "success",
//               autoHideDuration: 2000,
//             });
//           }
//           break;
//         case "reject":
//           if (selectedEmployeeForAction) {
//             enqueueSnackbar("Employee rejected successfully!", {
//               variant: "success",
//               autoHideDuration: 2000,
//             });
//           }
//           break;
//         default:
//           throw new Error("Unknown action");
//       }

//       refetch();

//       if (confirmAction === "approve" || confirmAction === "reject") {
//         handleModalClose();
//       }
//     } catch (error) {
//       let errorMessage = "Action failed. Please try again.";

//       if (confirmAction === "approve") {
//         errorMessage = "Failed to approve employee. Please try again.";
//       } else if (confirmAction === "reject") {
//         errorMessage = "Failed to reject employee. Please try again.";
//       }

//       enqueueSnackbar(errorMessage, {
//         variant: "error",
//         autoHideDuration: 3000,
//       });
//     } finally {
//       setConfirmOpen(false);
//       setSelectedEmployeeForAction(null);
//       setConfirmAction(null);
//       setIsLoading(false);
//       setModalLoading(false);
//     }
//   };

//   const handlePageChange = useCallback((event, newPage) => {
//     setPage(newPage + 1);
//   }, []);

//   const handleRowsPerPageChange = useCallback((event) => {
//     setRowsPerPage(parseInt(event.target.value, 10));
//     setPage(1);
//   }, []);

//   const getConfirmationMessage = useCallback(() => {
//     if (!confirmAction) return "";

//     const messages = {
//       approve: "Are you sure you want to approve this employee registration?",
//       reject: "Are you sure you want to reject this employee registration?",
//     };

//     return messages[confirmAction] || "";
//   }, [confirmAction]);

//   const getConfirmationTitle = useCallback(() => {
//     if (!confirmAction) return "Confirmation";

//     const titles = {
//       approve: "Confirm Approval",
//       reject: "Confirm Rejection",
//     };

//     return titles[confirmAction] || "Confirmation";
//   }, [confirmAction]);

//   const getConfirmButtonColor = useCallback(() => {
//     if (!confirmAction) return "primary";

//     const colors = {
//       approve: "success",
//       reject: "error",
//     };

//     return colors[confirmAction] || "primary";
//   }, [confirmAction]);

//   const getConfirmButtonText = useCallback(() => {
//     if (!confirmAction) return "Confirm";

//     const texts = {
//       approve: "Approve",
//       reject: "Reject",
//     };

//     return texts[confirmAction] || "Confirm";
//   }, [confirmAction]);

//   const getEmployeeDisplayName = useCallback(() => {
//     return (
//       selectedEmployeeForAction?.full_name ||
//       selectedEmployeeForAction?.name ||
//       "Employee"
//     );
//   }, [selectedEmployeeForAction]);

//   const getEmployeeId = useCallback(() => {
//     return selectedEmployeeForAction?.id || "Unknown";
//   }, [selectedEmployeeForAction]);

//   const isLoadingState = queryLoading || isFetching || isLoading;

//   return (
//     <FormProvider {...methods}>
//       <Box sx={styles.mainContainer}>
//         <Box sx={styles.headerContainer}>
//           <Box sx={styles.headerLeftSection}>
//             <Typography className="header">PENDING REGISTRATIONS</Typography>
//           </Box>

//           <CustomSearchBar
//             searchQuery={searchQuery}
//             setSearchQuery={handleSearchChange}
//             selectedFilters={selectedFilters}
//             onFilterClick={handleFilterClick}
//             isLoading={isLoadingState}
//           />
//         </Box>

//         <Box sx={styles.contentContainer}>
//           <PendingTable
//             pendingList={employeesList}
//             isLoadingState={isLoadingState}
//             error={error}
//             searchQuery={searchQuery}
//             handleRowClick={handleRowClick}
//             handleEditSubmission={handleEditEmployee}
//             handleActionClick={handleActionClick}
//             paginationData={paginationData}
//             onPageChange={handlePageChange}
//             onRowsPerPageChange={handleRowsPerPageChange}
//             onRefetch={refetch}
//           />

//           <Box sx={styles.paginationContainer}>
//             <TablePagination
//               rowsPerPageOptions={[5, 10, 25, 50, 100]}
//               component="div"
//               count={paginationData?.total || 0}
//               rowsPerPage={rowsPerPage}
//               page={Math.max(0, page - 1)}
//               onPageChange={handlePageChange}
//               onRowsPerPageChange={handleRowsPerPageChange}
//             />
//           </Box>
//         </Box>

//         <FilterDialog
//           open={filterDialogOpen}
//           onClose={() => setFilterDialogOpen(false)}
//           selectedFilters={selectedFilters}
//           onFiltersChange={handleFiltersChange}
//         />

//         {selectedEmployee && (
//           <PendingModal
//             open={modalOpen}
//             onClose={handleModalClose}
//             initialData={selectedEmployee}
//             mode={modalMode}
//             isLoading={modalLoading}
//             onRefetch={refetch}
//           />
//         )}

//         <Dialog
//           open={confirmOpen}
//           onClose={() => setConfirmOpen(false)}
//           maxWidth="xs"
//           fullWidth
//           PaperProps={{
//             sx: styles.confirmDialog,
//           }}>
//           <DialogTitle>
//             <Box sx={styles.confirmDialogIconBox}>
//               <HelpIcon sx={styles.confirmDialogIcon} />
//             </Box>
//             <Typography variant="h6" sx={styles.confirmDialogTitle}>
//               {getConfirmationTitle()}
//             </Typography>
//           </DialogTitle>
//           <DialogContent>
//             <Typography variant="body1" sx={styles.confirmDialogMessage}>
//               {getConfirmationMessage()}
//             </Typography>
//             <Typography variant="body2" sx={styles.confirmDialogSubmissionInfo}>
//               {getEmployeeDisplayName()} - ID: {getEmployeeId()}
//             </Typography>
//           </DialogContent>
//           <DialogActions>
//             <Box sx={styles.confirmDialogActionsBox}>
//               <Button
//                 onClick={() => setConfirmOpen(false)}
//                 variant="outlined"
//                 color="error"
//                 sx={styles.confirmCancelButton}
//                 disabled={isLoading}>
//                 Cancel
//               </Button>
//               <Button
//                 onClick={handleActionConfirm}
//                 variant="contained"
//                 color={getConfirmButtonColor()}
//                 sx={styles.confirmActionButton(confirmAction)}
//                 disabled={isLoading}>
//                 {isLoading ? (
//                   <CircularProgress size={20} color="inherit" />
//                 ) : (
//                   getConfirmButtonText()
//                 )}
//               </Button>
//             </Box>
//           </DialogActions>
//         </Dialog>
//       </Box>
//     </FormProvider>
//   );
// };

// export default Pending;
