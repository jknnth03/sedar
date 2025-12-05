import React, { useState, useMemo, useCallback, useEffect } from "react";
import { Box } from "@mui/material";
import { FormProvider, useForm } from "react-hook-form";
import { useSnackbar } from "notistack";
import "../../../pages/GeneralStyle.scss";
import { useGetReceiverTasksQuery } from "../../../features/api/receiving/receivingApi";
import { useRememberQueryParams } from "../../../hooks/useRememberQueryParams";
import CustomTablePagination from "../../zzzreusable/CustomTablePagination";
import MrfReceivingTable from "./MrfReceivingTable";
import ReceivingDialog from "./ReceivingDialog";

const MrfForReceiving = ({
  searchQuery,
  dateFilters,
  filterDataByDate,
  filterDataBySearch,
  onReceiveSubmission,
  onReturnSubmission,
}) => {
  const { enqueueSnackbar } = useSnackbar();

  const [queryParams, setQueryParams] = useRememberQueryParams();

  const [page, setPage] = useState(parseInt(queryParams?.page) || 1);
  const [rowsPerPage, setRowsPerPage] = useState(
    parseInt(queryParams?.rowsPerPage) || 10
  );
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const methods = useForm();

  const apiQueryParams = useMemo(() => {
    return {
      pagination: 1,
      page: page,
      per_page: rowsPerPage,
      status: "receiving",
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
  } = useGetReceiverTasksQuery(apiQueryParams, {
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

  const handleReceiveSubmission = useCallback(
    async (submission) => {
      setIsProcessing(true);
      try {
        await onReceiveSubmission(submission.id, "", refetch);
        setDialogOpen(false);
        setSelectedSubmission(null);
      } catch (error) {
        console.error("Error receiving submission:", error);
      } finally {
        setIsProcessing(false);
      }
    },
    [onReceiveSubmission, refetch]
  );

  const handleReturnSubmission = useCallback(
    async (submission, reason) => {
      setIsProcessing(true);
      try {
        await onReturnSubmission(submission.id, reason, refetch);
        setDialogOpen(false);
        setSelectedSubmission(null);
      } catch (error) {
        console.error("Error returning submission:", error);
      } finally {
        setIsProcessing(false);
      }
    },
    [onReturnSubmission, refetch]
  );

  const handleReceiveClick = useCallback(
    async (e, submission) => {
      e.stopPropagation();
      setIsProcessing(true);
      try {
        await onReceiveSubmission(submission.id, "", refetch);
      } catch (error) {
        console.error("Error receiving submission:", error);
      } finally {
        setIsProcessing(false);
      }
    },
    [onReceiveSubmission, refetch]
  );

  const handleReturnClick = useCallback(
    async (e, submission) => {
      e.stopPropagation();
      setIsProcessing(true);
      try {
        await onReturnSubmission(submission.id, "", refetch);
      } catch (error) {
        console.error("Error returning submission:", error);
      } finally {
        setIsProcessing(false);
      }
    },
    [onReturnSubmission, refetch]
  );

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
          showArchived={false}
          onReceiveSubmission={handleReceiveClick}
          onReturnSubmission={handleReturnClick}
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
          onReceive={handleReceiveSubmission}
          onReturn={handleReturnSubmission}
          isLoading={isProcessing}
        />
      </Box>
    </FormProvider>
  );
};

export default MrfForReceiving;
