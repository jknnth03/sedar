import React, { useState, useMemo, useCallback, useEffect } from "react";
import {
  Paper,
  Typography,
  TablePagination,
  CircularProgress,
  Box,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useTheme,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { FormProvider, useForm } from "react-hook-form";
import { useSnackbar } from "notistack";
import { useDispatch } from "react-redux";
import "../../pages/GeneralStyle.scss";
import pendingApi, {
  useGetPendingEmployeesQuery,
  useUpdateFormSubmissionMutation,
} from "../../features/api/employee/pendingApi";
import mainApi, {
  useLazyGetSingleEmployeeQuery,
} from "../../features/api/employee/mainApi";
import PendingRegistrationModal from "../../components/modal/employee/pendingFormModal/PendingRegistrationModal";
import PendingRegistrationTable from "./PendingRegistrationTable";
import { styles } from "../forms/manpowerform/FormSubmissionStyles";
import { format } from "date-fns";
import moduleApi from "../../features/api/usermanagement/dashboardApi";

const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

const PendingRegistrationRejected = ({ searchQuery, startDate, endDate }) => {
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();
  const dispatch = useDispatch();

  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [localSearchQuery, setLocalSearchQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("view");
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState({});
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [selectedEmployeeForAction, setSelectedEmployeeForAction] =
    useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [pendingFormData, setPendingFormData] = useState(null);

  const methods = useForm();

  const effectiveSearchQuery =
    searchQuery !== undefined ? searchQuery : localSearchQuery;
  const debounceValue = useDebounce(effectiveSearchQuery, 500);

  useEffect(() => {
    setPage(1);
  }, [debounceValue, startDate, endDate]);

  const queryParams = useMemo(() => {
    const params = {
      page,
      per_page: rowsPerPage,
      pagination: true,
      approval_status: "rejected",
    };

    if (debounceValue && debounceValue.trim() !== "") {
      params.search = debounceValue.trim();
    }

    if (startDate) {
      params.created_from = startDate;
      params.date_from = startDate;
      params.start_date = startDate;
    }

    if (endDate) {
      params.created_to = endDate;
      params.date_to = endDate;
      params.end_date = endDate;
    }

    console.log("Query Params:", params);
    return params;
  }, [debounceValue, page, rowsPerPage, startDate, endDate]);

  const {
    data: employeesData,
    isLoading: queryLoading,
    isFetching,
    refetch,
    error,
  } = useGetPendingEmployeesQuery(queryParams, {
    refetchOnMountOrArgChange: true,
    skip: false,
  });

  const [getSingleEmployee] = useLazyGetSingleEmployeeQuery();
  const [updateFormSubmission] = useUpdateFormSubmissionMutation();

  const employeesList = useMemo(() => {
    const data = employeesData?.result?.data || employeesData?.data || [];
    console.log("Employees List (Rejected):", data);
    return data;
  }, [employeesData]);

  const paginationData = useMemo(() => {
    if (!employeesData) return null;

    const resultData = employeesData?.result || employeesData;
    const pagination = {
      total: resultData?.total || 0,
      current_page: resultData?.current_page || 1,
      per_page: resultData?.per_page || 10,
      last_page: resultData?.last_page || 1,
    };

    return pagination;
  }, [employeesData]);

  const canApproveEmployee = useCallback((employee) => {
    if (!employee) return false;

    if (employee.actions && typeof employee.actions.can_approve === "boolean") {
      return employee.actions.can_approve;
    }

    if (employee.actions && typeof employee.actions.can_update === "boolean") {
      return employee.actions.can_update;
    }

    const approvableStatuses = ["REJECTED", "rejected"];
    const currentStatus = employee?.approval_status || employee?.status;
    return approvableStatuses.includes(currentStatus?.toLowerCase());
  }, []);

  const canRejectEmployee = useCallback((employee) => {
    if (!employee) return false;

    if (employee.actions && typeof employee.actions.can_reject === "boolean") {
      return employee.actions.can_reject;
    }

    if (employee.actions && typeof employee.actions.can_update === "boolean") {
      return employee.actions.can_update;
    }

    const rejectableStatuses = ["REJECTED", "rejected"];
    const currentStatus = employee?.approval_status || employee?.status;
    return rejectableStatuses.includes(currentStatus?.toLowerCase());
  }, []);

  const canEditEmployee = useCallback((employee) => {
    if (!employee) return false;

    if (employee.actions && typeof employee.actions.can_edit === "boolean") {
      return employee.actions.can_edit;
    }

    if (employee.actions && typeof employee.actions.can_update === "boolean") {
      return employee.actions.can_update;
    }

    const editableStatuses = [
      "REJECTED",
      "rejected",
      "PENDING",
      "pending",
      "RETURNED",
      "returned",
    ];
    const currentStatus = employee?.approval_status || employee?.status;
    return editableStatuses.includes(currentStatus?.toLowerCase());
  }, []);

  const handleSearchChange = useCallback((newSearchQuery) => {
    setLocalSearchQuery(newSearchQuery);
    setPage(1);
  }, []);

  const handleRowClick = useCallback(
    async (employee) => {
      setModalLoading(true);
      try {
        const submittableId = employee?.submittable?.id;

        if (!submittableId) {
          console.warn("No submittable ID found for employee:", employee);
          throw new Error("Submittable ID not found for this record");
        }

        const result = await getSingleEmployee(submittableId).unwrap();
        setSelectedEmployee(result?.result || employee);
        setModalMode("view");
        setModalOpen(true);
      } catch (error) {
        console.error("Error loading employee details:", error);
        enqueueSnackbar("Failed to load employee details", {
          variant: "error",
          autoHideDuration: 3000,
        });
        setSelectedEmployee(employee);
        setModalMode("view");
        setModalOpen(true);
      } finally {
        setModalLoading(false);
      }
    },
    [getSingleEmployee, enqueueSnackbar]
  );

  const handleEditEmployee = useCallback(
    (employee) => {
      if (canEditEmployee(employee)) {
        const submittableId = employee?.submittable?.id;
        if (!submittableId) {
          enqueueSnackbar("Submittable ID not found for this employee.", {
            variant: "error",
            autoHideDuration: 3000,
          });
          return;
        }

        setSelectedEmployee({ ...employee, editId: submittableId });
        setModalMode("edit");
        setModalOpen(true);
      } else {
        enqueueSnackbar(
          "This employee registration cannot be edited in its current status.",
          {
            variant: "warning",
            autoHideDuration: 3000,
          }
        );
      }
    },
    [canEditEmployee, enqueueSnackbar]
  );

  const handleModalClose = useCallback(() => {
    setModalOpen(false);
    setSelectedEmployee(null);
    setModalMode("view");
    methods.reset();
    setPendingFormData(null);
  }, [methods]);

  const handleModeChange = useCallback((newMode) => {
    setModalMode(newMode);
  }, []);

  const handleModalSave = useCallback(async (employeeData, mode) => {
    console.log("Modal save requested:", { employeeData, mode });
    setPendingFormData(employeeData);
    setConfirmAction("update");
    setConfirmOpen(true);
  }, []);

  const handleApproveEmployee = useCallback(
    async (employeeId) => {
      const employee = employeesList.find((emp) => emp.id === employeeId);
      if (employee) {
        if (canApproveEmployee(employee)) {
          const submittableId = employee?.submittable?.id;
          if (!submittableId) {
            enqueueSnackbar("Submittable ID not found for this employee.", {
              variant: "error",
              autoHideDuration: 2000,
            });
            return;
          }

          setSelectedEmployeeForAction({
            ...employee,
            actionId: submittableId,
          });
          setConfirmAction("approve");
          setConfirmOpen(true);
        } else {
          enqueueSnackbar(
            "This employee cannot be approved in its current status.",
            {
              variant: "warning",
              autoHideDuration: 3000,
            }
          );
        }
      } else {
        enqueueSnackbar("Employee not found. Please try again.", {
          variant: "error",
          autoHideDuration: 2000,
        });
      }
    },
    [employeesList, canApproveEmployee, enqueueSnackbar]
  );

  const handleRejectEmployee = useCallback(
    async (employeeId) => {
      const employee = employeesList.find((emp) => emp.id === employeeId);
      if (employee) {
        if (canRejectEmployee(employee)) {
          const submittableId = employee?.submittable?.id;
          if (!submittableId) {
            enqueueSnackbar("Submittable ID not found for this employee.", {
              variant: "error",
              autoHideDuration: 2000,
            });
            return;
          }

          setSelectedEmployeeForAction({
            ...employee,
            actionId: submittableId,
          });
          setConfirmAction("reject");
          setConfirmOpen(true);
        } else {
          enqueueSnackbar(
            "This employee cannot be rejected in its current status.",
            {
              variant: "warning",
              autoHideDuration: 3000,
            }
          );
        }
      } else {
        enqueueSnackbar("Employee not found. Please try again.", {
          variant: "error",
          autoHideDuration: 2000,
        });
      }
    },
    [employeesList, canRejectEmployee, enqueueSnackbar]
  );

  const handleMenuOpen = useCallback((event, employee) => {
    event.stopPropagation();
    setMenuAnchor((prev) => ({
      ...prev,
      [employee.id]: event.currentTarget,
    }));
  }, []);

  const handleMenuClose = useCallback((employeeId) => {
    setMenuAnchor((prev) => ({ ...prev, [employeeId]: null }));
  }, []);

  const handleActionClick = useCallback(
    (employee, action, event) => {
      if (event) {
        event.stopPropagation();
      }

      if (action === "edit" && !canEditEmployee(employee)) {
        enqueueSnackbar(
          "This employee registration cannot be edited in its current status.",
          {
            variant: "warning",
            autoHideDuration: 3000,
          }
        );
        handleMenuClose(employee.id);
        return;
      }

      if (action === "approve" && !canApproveEmployee(employee)) {
        enqueueSnackbar(
          "This employee cannot be approved in its current status.",
          {
            variant: "warning",
            autoHideDuration: 3000,
          }
        );
        handleMenuClose(employee.id);
        return;
      }

      if (action === "reject" && !canRejectEmployee(employee)) {
        enqueueSnackbar(
          "This employee cannot be rejected in its current status.",
          {
            variant: "warning",
            autoHideDuration: 3000,
          }
        );
        handleMenuClose(employee.id);
        return;
      }

      setSelectedEmployeeForAction(employee);
      setConfirmAction(action);
      setConfirmOpen(true);
      handleMenuClose(employee.id);
    },
    [
      handleMenuClose,
      canEditEmployee,
      canApproveEmployee,
      canRejectEmployee,
      enqueueSnackbar,
    ]
  );

  const handleActionConfirm = async () => {
    if (!confirmAction) return;

    setIsLoading(true);
    setModalLoading(true);

    try {
      let result;
      let successMessage = "";

      switch (confirmAction) {
        case "update":
          if (pendingFormData && selectedEmployee) {
            result = await updateFormSubmission({
              id: selectedEmployee.editId || selectedEmployee.id,
              data: pendingFormData,
            }).unwrap();
            dispatch(pendingApi.util.invalidateTags(["pending"]));
            dispatch(moduleApi.util.invalidateTags(["dashboard"]));
            dispatch(mainApi.util.invalidateTags(["employees"]));
            successMessage = "Employee registration updated successfully!";
          }
          break;
        case "approve":
          enqueueSnackbar(
            "Approve functionality not available for rejected registrations.",
            { variant: "info", autoHideDuration: 3000 }
          );
          break;
        case "reject":
          enqueueSnackbar("This registration is already rejected.", {
            variant: "info",
            autoHideDuration: 3000,
          });
          break;
        default:
          throw new Error("Unknown action");
      }

      if (successMessage) {
        enqueueSnackbar(successMessage, {
          variant: "success",
          autoHideDuration: 2000,
        });
      }

      refetch();
      handleModalClose();
    } catch (error) {
      console.error("Action failed:", error);

      let errorMessage = "Action failed. Please try again.";

      if (confirmAction === "update") {
        if (error?.data?.message) {
          errorMessage = error.data.message;
        } else if (error?.message) {
          errorMessage = error.message;
        } else {
          errorMessage =
            "Failed to update employee registration. Please try again.";
        }
      }

      enqueueSnackbar(errorMessage, {
        variant: "error",
        autoHideDuration: 3000,
      });
    } finally {
      setConfirmOpen(false);
      setSelectedEmployeeForAction(null);
      setConfirmAction(null);
      setIsLoading(false);
      setModalLoading(false);
      setPendingFormData(null);
    }
  };

  const handlePageChange = useCallback((event, newPage) => {
    setPage(newPage + 1);
  }, []);

  const handleRowsPerPageChange = useCallback((event) => {
    const newRowsPerPage = parseInt(event.target.value, 10);
    setRowsPerPage(newRowsPerPage);
    setPage(1);
  }, []);

  const getConfirmationMessage = useCallback(() => {
    if (!confirmAction) return "";

    const messages = {
      update: "Are you sure you want to update this employee registration?",
      approve:
        "Are you sure you want to approve this employee registration? This will move it from rejected to approved status.",
      reject: (
        <>
          Are you sure you want to <strong>Reject</strong> this Employee
          Registration? This will permanently reject the registration.
        </>
      ),
    };

    return messages[confirmAction] || "";
  }, [confirmAction]);

  const getConfirmationTitle = useCallback(() => {
    if (!confirmAction) return "Confirmation";

    const titles = {
      update: "Update Confirmation",
      approve: "Approve Registration",
      reject: "Reject Registration",
    };

    return titles[confirmAction] || "Confirmation";
  }, [confirmAction]);

  const getConfirmButtonText = useCallback(() => {
    if (!confirmAction) return "CONFIRM";

    const texts = {
      update: "UPDATE",
      approve: "APPROVE",
      reject: "REJECT",
    };

    return texts[confirmAction] || "CONFIRM";
  }, [confirmAction]);

  const getEmployeeDisplayName = useCallback(() => {
    if (confirmAction === "update") {
      return (
        selectedEmployee?.submittable?.general_info?.full_name ||
        selectedEmployee?.full_name ||
        selectedEmployee?.name ||
        "Employee Registration"
      );
    }
    return (
      selectedEmployeeForAction?.submittable?.general_info?.full_name ||
      selectedEmployeeForAction?.full_name ||
      selectedEmployeeForAction?.name ||
      "Employee"
    );
  }, [confirmAction, selectedEmployee, selectedEmployeeForAction]);

  const getEmployeeId = useCallback(() => {
    if (confirmAction === "update") {
      return selectedEmployee?.id || "Unknown";
    }
    return selectedEmployeeForAction?.id || "Unknown";
  }, [confirmAction, selectedEmployee, selectedEmployeeForAction]);

  const isLoadingState = queryLoading || isFetching || isLoading;

  return (
    <FormProvider {...methods}>
      <Box sx={styles.mainContainer}>
        <Box sx={styles.contentContainer}>
          <PendingRegistrationTable
            pendingList={employeesList}
            isLoadingState={isLoadingState}
            error={error}
            searchQuery={effectiveSearchQuery}
            handleRowClick={handleRowClick}
            handleEditSubmission={handleEditEmployee}
            handleActionClick={handleActionClick}
            handleMenuOpen={handleMenuOpen}
            handleMenuClose={handleMenuClose}
            menuAnchor={menuAnchor}
            canApproveEmployee={canApproveEmployee}
            canRejectEmployee={canRejectEmployee}
            canEditEmployee={canEditEmployee}
            onApprove={handleApproveEmployee}
            onReject={handleRejectEmployee}
            paginationData={paginationData}
            onPageChange={handlePageChange}
            onRowsPerPageChange={handleRowsPerPageChange}
            onRefetch={refetch}
          />

          <Box sx={styles.paginationContainer}>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25, 50, 100]}
              component="div"
              count={paginationData?.total || 0}
              rowsPerPage={rowsPerPage}
              page={Math.max(0, page - 1)}
              onPageChange={handlePageChange}
              onRowsPerPageChange={handleRowsPerPageChange}
              showFirstButton
              showLastButton
            />
          </Box>
        </Box>

        <Dialog
          open={confirmOpen}
          onClose={() => !isLoading && setConfirmOpen(false)}
          maxWidth="xs"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 3,
              padding: 2,
              boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
              textAlign: "center",
            },
          }}>
          <DialogTitle sx={{ padding: 0, marginBottom: 2 }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                marginBottom: 2,
              }}>
              <Box
                sx={{
                  width: 60,
                  height: 60,
                  borderRadius: "50%",
                  backgroundColor: "#ff4400",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}>
                <Typography
                  sx={{
                    color: "white",
                    fontSize: "30px",
                    fontWeight: "normal",
                  }}>
                  ?
                </Typography>
              </Box>
            </Box>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 600,
                color: "rgb(25, 45, 84)",
                marginBottom: 0,
              }}>
              {getConfirmationTitle()}
            </Typography>
          </DialogTitle>
          <DialogContent sx={{ padding: 0, textAlign: "center" }}>
            <Typography
              variant="body1"
              sx={{
                marginBottom: 2,
                fontSize: "16px",
                color: "#333",
                fontWeight: 400,
              }}>
              {getConfirmationMessage()}
            </Typography>
            <Typography
              variant="body2"
              sx={{
                fontSize: "14px",
                color: "#666",
                fontWeight: 500,
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}>
              {getEmployeeDisplayName()} - ID: {getEmployeeId()}
            </Typography>
          </DialogContent>
          <DialogActions
            sx={{
              justifyContent: "center",
              padding: 0,
              marginTop: 3,
              gap: 2,
            }}>
            <Button
              onClick={() => setConfirmOpen(false)}
              variant="outlined"
              sx={{
                textTransform: "uppercase",
                fontWeight: 600,
                borderColor: "#f44336",
                color: "#f44336",
                paddingX: 3,
                paddingY: 1,
                borderRadius: 2,
                "&:hover": {
                  borderColor: "#d32f2f",
                  backgroundColor: "rgba(244, 67, 54, 0.04)",
                },
              }}
              disabled={isLoading}>
              CANCEL
            </Button>
            <Button
              onClick={handleActionConfirm}
              variant="contained"
              sx={{
                textTransform: "uppercase",
                fontWeight: 600,
                backgroundColor: "#4caf50",
                paddingX: 3,
                paddingY: 1,
                borderRadius: 2,
                "&:hover": {
                  backgroundColor: "#388e3c",
                },
              }}
              disabled={isLoading}>
              {isLoading ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                getConfirmButtonText()
              )}
            </Button>
          </DialogActions>
        </Dialog>

        <PendingRegistrationModal
          open={modalOpen}
          onClose={handleModalClose}
          onSave={handleModalSave}
          onApprove={handleApproveEmployee}
          onReject={handleRejectEmployee}
          initialData={selectedEmployee}
          isLoading={modalLoading}
          mode={modalMode}
          onModeChange={handleModeChange}
          canApprove={
            selectedEmployee ? canApproveEmployee(selectedEmployee) : false
          }
          canReject={
            selectedEmployee ? canRejectEmployee(selectedEmployee) : false
          }
          canEdit={selectedEmployee ? canEditEmployee(selectedEmployee) : false}
          onRefetch={refetch}
        />
      </Box>
    </FormProvider>
  );
};

export default PendingRegistrationRejected;
