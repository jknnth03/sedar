import React, { useState, useMemo, useCallback, useEffect } from "react";
import { useDispatch } from "react-redux";
import { Box, TablePagination, useTheme } from "@mui/material";
import { FormProvider, useForm } from "react-hook-form";
import { useSnackbar } from "notistack";
import "../../pages/GeneralStyle.scss";
import { useGetPendingEmployeesQuery } from "../../features/api/employee/pendingApi";
import { useLazyGetSingleEmployeeQuery } from "../../features/api/employee/mainApi";
import pendingApi from "../../features/api/employee/pendingApi";
import mainApi from "../../features/api/employee/mainApi";
import moduleApi from "../../features/api/usermanagement/dashboardApi";
import PendingRegistrationModal from "../../components/modal/employee/pendingFormModal/PendingRegistrationModal";
import PendingRegistrationTable from "./PendingRegistrationTable";
import { styles } from "../forms/manpowerform/FormSubmissionStyles";

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

const PendingRegistrationCancelled = ({ searchQuery, startDate, endDate }) => {
  const dispatch = useDispatch();
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();

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
      approval_status: "cancelled",
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

  const employeesList = useMemo(() => {
    const data = employeesData?.result?.data || employeesData?.data || [];
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
          throw new Error("Submittable ID not found for this record");
        }

        const result = await getSingleEmployee(submittableId).unwrap();
        setSelectedEmployee(result?.result || employee);
        setModalMode("view");
        setModalOpen(true);
      } catch (error) {
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

  const handlePageChange = useCallback((event, newPage) => {
    setPage(newPage + 1);
  }, []);

  const handleRowsPerPageChange = useCallback((event) => {
    const newRowsPerPage = parseInt(event.target.value, 10);
    setRowsPerPage(newRowsPerPage);
    setPage(1);
  }, []);

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

        <PendingRegistrationModal
          open={modalOpen}
          onClose={handleModalClose}
          initialData={selectedEmployee}
          isLoading={modalLoading}
          mode={modalMode}
          onModeChange={handleModeChange}
          onRefetch={refetch}
        />
      </Box>
    </FormProvider>
  );
};

export default PendingRegistrationCancelled;
