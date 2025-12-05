import React, { useState, useMemo, useCallback, useEffect } from "react";
import { Box } from "@mui/material";
import { FormProvider, useForm } from "react-hook-form";
import { useSnackbar } from "notistack";
import "../../../pages/GeneralStyle.scss";
import { useGetReceiverHistoryQuery } from "../../../features/api/receiving/receivingApi";
import { useRememberQueryParams } from "../../../hooks/useRememberQueryParams";
import MrfReceivingTable from "./MrfReceivingTable";
import CustomTablePagination from "../../zzzreusable/CustomTablePagination";
import ReceivingDialog from "./ReceivingDialog";

const MrfReceived = ({
  searchQuery,
  dateFilters,
  filterDataByDate,
  filterDataBySearch,
}) => {
  const { enqueueSnackbar } = useSnackbar();

  const [queryParams, setQueryParams] = useRememberQueryParams();

  const [page, setPage] = useState(parseInt(queryParams?.page) || 1);
  const [rowsPerPage, setRowsPerPage] = useState(
    parseInt(queryParams?.rowsPerPage) || 10
  );
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const methods = useForm();

  const apiQueryParams = useMemo(() => {
    return {
      pagination: 1,
      page: page,
      per_page: rowsPerPage,
      status: "received",
      search: searchQuery || "",
    };
  }, [page, rowsPerPage, searchQuery]);

  useEffect(() => {
    setPage(1);
  }, [searchQuery, dateFilters]);

  const {
    data: submissionsData,
    isLoading: queryLoading,
    isFetching,
    refetch,
    error,
  } = useGetReceiverHistoryQuery(apiQueryParams, {
    refetchOnMountOrArgChange: true,
    skip: false,
  });

  const filteredSubmissions = useMemo(() => {
    const rawData = submissionsData?.result?.data || [];

    let filtered = rawData;

    if (dateFilters && filterDataByDate) {
      filtered = filterDataByDate(
        filtered,
        dateFilters.startDate,
        dateFilters.endDate
      );
    }

    if (searchQuery && filterDataBySearch) {
      filtered = filterDataBySearch(filtered, searchQuery);
    }

    return filtered;
  }, [
    submissionsData,
    dateFilters,
    searchQuery,
    filterDataByDate,
    filterDataBySearch,
  ]);

  const handleRowClick = useCallback((submission) => {
    setSelectedSubmission(submission);
    setDialogOpen(true);
  }, []);

  const handleDialogClose = useCallback(() => {
    setDialogOpen(false);
    setSelectedSubmission(null);
  }, []);

  const handlePageChange = useCallback(
    (event, newPage) => {
      const targetPage = newPage + 1;
      setPage(targetPage);
      if (setQueryParams) {
        setQueryParams(
          {
            ...queryParams,
            page: targetPage,
            rowsPerPage: rowsPerPage,
          },
          { retain: false }
        );
      }
    },
    [setQueryParams, rowsPerPage, queryParams]
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
            ...queryParams,
            page: newPage,
            rowsPerPage: newRowsPerPage,
          },
          { retain: false }
        );
      }
    },
    [setQueryParams, queryParams]
  );

  const isLoadingState = queryLoading || isFetching;

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
        <MrfReceivingTable
          submissionsList={filteredSubmissions}
          isLoadingState={isLoadingState}
          error={error}
          searchQuery={searchQuery}
          showArchived={true}
          onRowClick={handleRowClick}
        />

        <CustomTablePagination
          count={filteredSubmissions.length}
          page={Math.max(0, page - 1)}
          rowsPerPage={rowsPerPage}
          onPageChange={handlePageChange}
          onRowsPerPageChange={handleRowsPerPageChange}
        />

        <ReceivingDialog.SubmissionDialog
          open={dialogOpen}
          onClose={handleDialogClose}
          submission={selectedSubmission}
          onReceive={() => {}}
          onReturn={() => {}}
        />
      </Box>
    </FormProvider>
  );
};

export default MrfReceived;
