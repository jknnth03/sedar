import React, { useState, useMemo, useCallback, useEffect } from "react";
import { useDispatch } from "react-redux";
import { Box, TablePagination } from "@mui/material";
import { FormProvider, useForm } from "react-hook-form";
import { useSnackbar } from "notistack";
import "../../pages/GeneralStyle.scss";
import { useGetPendingEmployeesQuery } from "../../features/api/employee/pendingApi";
import { useLazyGetSingleEmployeeQuery } from "../../features/api/employee/mainApi";
import pendingApi from "../../features/api/employee/pendingApi";
import mainApi from "../../features/api/employee/mainApi";
import moduleApi from "../../features/api/usermanagement/dashboardApi";
import PendingRegistrationTable from "./PendingRegistrationTable";
import { styles } from "../forms/manpowerform/FormSubmissionStyles";
import CustomTablePagination from "../zzzreusable/CustomTablePagination";

const PendingRegistrationForapproval = ({
  searchQuery,
  dateFilters,
  setQueryParams,
  currentParams,
  onRowClick,
}) => {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();

  const [page, setPage] = useState(parseInt(currentParams?.page) || 1);
  const [rowsPerPage, setRowsPerPage] = useState(
    parseInt(currentParams?.rowsPerPage) || 10
  );
  const [menuAnchor, setMenuAnchor] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const methods = useForm();

  const queryParams = useMemo(() => {
    const params = {
      page: page,
      per_page: rowsPerPage,
      pagination: true,
      approval_status: "pending",
      search: searchQuery || "",
    };

    if (dateFilters?.start_date) {
      params.created_from = dateFilters.start_date;
      params.date_from = dateFilters.start_date;
      params.start_date = dateFilters.start_date;
    }

    if (dateFilters?.end_date) {
      params.created_to = dateFilters.end_date;
      params.date_to = dateFilters.end_date;
      params.end_date = dateFilters.end_date;
    }

    return params;
  }, [page, rowsPerPage, searchQuery, dateFilters]);

  useEffect(() => {
    setPage(1);
  }, [searchQuery, dateFilters]);

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
    return Array.isArray(data) ? data : [];
  }, [employeesData]);

  const totalCount = useMemo(() => {
    const resultData = employeesData?.result || employeesData;
    return resultData?.total || 0;
  }, [employeesData]);

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

  const handlePageChange = useCallback(
    (event, newPage) => {
      const targetPage = newPage + 1;
      setPage(targetPage);
      if (setQueryParams) {
        setQueryParams(
          {
            ...currentParams,
            page: targetPage,
            rowsPerPage: rowsPerPage,
          },
          { retain: false }
        );
      }
    },
    [setQueryParams, rowsPerPage, currentParams]
  );

  const handleRowsPerPageChange = useCallback(
    (event) => {
      const newRowsPerPage = parseInt(event.target.value, 10);
      const newPage = 1;
      setRowsPerPage(newRowsPerPage);
      setPage(newPage);
      if (setQueryParams) {
        setQueryParams(
          {
            ...currentParams,
            page: newPage,
            rowsPerPage: newRowsPerPage,
          },
          { retain: false }
        );
      }
    },
    [setQueryParams, currentParams]
  );

  const isLoadingState = queryLoading || isFetching || isLoading;

  return (
    <FormProvider {...methods}>
      <Box
        sx={{
          flex: 1,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          backgroundColor: "white",
        }}>
        <PendingRegistrationTable
          pendingList={employeesList}
          isLoadingState={isLoadingState}
          error={error}
          searchQuery={searchQuery}
          handleRowClick={onRowClick}
          handleMenuOpen={handleMenuOpen}
          handleMenuClose={handleMenuClose}
          menuAnchor={menuAnchor}
          onRefetch={refetch}
        />

        <CustomTablePagination
          count={totalCount}
          page={Math.max(0, page - 1)}
          rowsPerPage={rowsPerPage}
          onPageChange={handlePageChange}
          onRowsPerPageChange={handleRowsPerPageChange}
        />
      </Box>
    </FormProvider>
  );
};

export default PendingRegistrationForapproval;
