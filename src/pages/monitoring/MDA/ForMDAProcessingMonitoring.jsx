import React, { useState, useMemo, useCallback, useEffect } from "react";
import { TablePagination, Box, useTheme } from "@mui/material";
import { FormProvider, useForm } from "react-hook-form";
import "../../../pages/GeneralStyle.scss";
import { useRememberQueryParams } from "../../../hooks/useRememberQueryParams";
import ForMDAProcessingMonitoringTable from "./ForMDAProcessingMonitoringTable";
import {
  useGetDataChangeSubmissionDetailsQuery,
  useGetDataChangeSubmissionsQuery,
} from "../../../features/api/forms/datachangeApi";
import MDAForMDAProcessingModal from "../../../components/modal/monitoring/MDAForMDAProcessingModal";

const ForMDAProcessingMonitoring = ({
  searchQuery,
  dateFilters,
  filterDataByDate,
  filterDataBySearch,
}) => {
  const theme = useTheme();

  const [queryParams, setQueryParams] = useRememberQueryParams();

  const [page, setPage] = useState(parseInt(queryParams?.page) || 1);
  const [rowsPerPage, setRowsPerPage] = useState(
    parseInt(queryParams?.rowsPerPage) || 10
  );
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedSubmissionId, setSelectedSubmissionId] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

  const methods = useForm({
    defaultValues: {
      reason_for_change: "",
      employee_id: null,
      new_position_id: null,
      remarks: "",
    },
  });

  const apiQueryParams = useMemo(() => {
    return {
      page: page,
      per_page: rowsPerPage,
      status: "active",
      pagination: 1,
      approval_status: "PENDING MDA CREATION",
      search: searchQuery || "",
      view_mode: "hr",
    };
  }, [page, rowsPerPage, searchQuery]);

  useEffect(() => {
    const newPage = 1;
    setPage(newPage);
  }, [searchQuery, dateFilters]);

  const {
    data: submissionsData,
    isLoading: queryLoading,
    isFetching,
    error,
  } = useGetDataChangeSubmissionsQuery(apiQueryParams, {
    refetchOnMountOrArgChange: true,
    skip: false,
  });

  const { data: submissionDetails, isLoading: detailsLoading } =
    useGetDataChangeSubmissionDetailsQuery(selectedSubmissionId, {
      skip: !selectedSubmissionId,
      refetchOnMountOrArgChange: true,
    });

  const filteredSubmissions = useMemo(() => {
    const rawData = submissionsData?.result?.data || [];

    let filtered = rawData;

    filtered = filtered.filter(
      (submission) => submission.status === "PENDING MDA CREATION"
    );

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

  const paginatedSubmissions = useMemo(() => {
    const startIndex = (page - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    return filteredSubmissions.slice(startIndex, endIndex);
  }, [filteredSubmissions, page, rowsPerPage]);

  const handleRowClick = useCallback((submission) => {
    setSelectedSubmissionId(submission.id);
    setModalOpen(true);
  }, []);

  const handleModalClose = useCallback(() => {
    setModalOpen(false);
    setSelectedSubmissionId(null);
    setModalLoading(false);
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
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          backgroundColor: "#fafafa",
        }}>
        <Box
          sx={{
            flex: 1,
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            backgroundColor: "white",
          }}>
          <ForMDAProcessingMonitoringTable
            submissionsList={paginatedSubmissions}
            isLoadingState={isLoadingState}
            error={error}
            handleRowClick={handleRowClick}
            searchQuery={searchQuery}
          />

          <Box
            sx={{
              borderTop: "1px solid #e0e0e0",
              backgroundColor: "#f8f9fa",
              flexShrink: 0,
              "& .MuiTablePagination-root": {
                color: "#666",
                "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows":
                  {
                    fontSize: "14px",
                    fontWeight: 500,
                  },
                "& .MuiTablePagination-select": {
                  fontSize: "14px",
                },
                "& .MuiIconButton-root": {
                  color: "rgb(33, 61, 112)",
                  "&:hover": {
                    backgroundColor: "rgba(33, 61, 112, 0.04)",
                  },
                  "&.Mui-disabled": {
                    color: "#ccc",
                  },
                },
              },
              "& .MuiTablePagination-toolbar": {
                paddingLeft: "24px",
                paddingRight: "24px",
              },
            }}>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25, 50, 100]}
              component="div"
              count={filteredSubmissions.length}
              rowsPerPage={rowsPerPage}
              page={Math.max(0, page - 1)}
              onPageChange={handlePageChange}
              onRowsPerPageChange={handleRowsPerPageChange}
            />
          </Box>
        </Box>

        {/* DataChange Modal - View Only */}
        <MDAForMDAProcessingModal
          open={modalOpen}
          onClose={handleModalClose}
          mode="view"
          onModeChange={null}
          selectedEntry={submissionDetails}
          isLoading={modalLoading || detailsLoading}
          onSave={null}
          onRefreshDetails={null}
          onSuccessfulSave={null}
          onCreateMDA={null}
          viewOnly={true}
        />
      </Box>
    </FormProvider>
  );
};

export default ForMDAProcessingMonitoring;
