import React, { useState, useMemo, useCallback, useEffect } from "react";
import { Typography, TablePagination, Box, useTheme } from "@mui/material";
import { FormProvider, useForm } from "react-hook-form";
import "../../../pages/GeneralStyle.scss";
import {
  useGetMDAMonitoringQuery,
  useGetMDAMonitoringByIdQuery,
} from "../../../features/api/monitoring/mdaMonitoringApi";
import MDAForApprovalTable from "./MDAForApprovalTable";
import { useRememberQueryParams } from "../../../hooks/useRememberQueryParams";
import MDAMonitoringModal from "../../../components/modal/monitoring/MDAMonitoringModal";

const MDAForApproval = ({
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
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [selectedSubmissionId, setSelectedSubmissionId] = useState(null);

  const methods = useForm({
    defaultValues: {},
  });

  useEffect(() => {
    setPage(1);
  }, [searchQuery, dateFilters]);

  const apiQueryParams = useMemo(() => {
    return {
      page,
      per_page: rowsPerPage,
      status: "active",
      approval_status: "pending",
      search: searchQuery || "",
    };
  }, [page, rowsPerPage, searchQuery]);

  const {
    data: submissionsData,
    isLoading: queryLoading,
    isFetching,
    error,
  } = useGetMDAMonitoringQuery(apiQueryParams, {
    refetchOnMountOrArgChange: true,
    skip: false,
  });

  const { data: submissionDetails, isLoading: detailsLoading } =
    useGetMDAMonitoringByIdQuery(selectedSubmissionId, {
      skip: !selectedSubmissionId,
      refetchOnMountOrArgChange: true,
    });

  const submissionsList = useMemo(() => {
    const data = submissionsData?.result?.data || [];
    return data;
  }, [submissionsData]);

  const handleRowClick = useCallback((submission) => {
    setSelectedSubmissionId(submission.id);
    setModalOpen(true);
  }, []);

  useEffect(() => {
    if (submissionDetails?.result && modalOpen) {
      setSelectedEntry(submissionDetails.result);
    }
  }, [submissionDetails, modalOpen]);

  const handleModalClose = useCallback(() => {
    setModalOpen(false);
    setSelectedEntry(null);
    setSelectedSubmissionId(null);
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

  const totalCount = submissionsData?.result?.total || 0;

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
          <MDAForApprovalTable
            submissionsList={submissionsList}
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
              count={totalCount}
              rowsPerPage={rowsPerPage}
              page={Math.max(0, page - 1)}
              onPageChange={handlePageChange}
              onRowsPerPageChange={handleRowsPerPageChange}
            />
          </Box>
        </Box>

        <MDAMonitoringModal
          open={modalOpen}
          onClose={handleModalClose}
          selectedEntry={selectedEntry}
          isLoading={detailsLoading}
          mode="view"
          submissionId={selectedSubmissionId}
        />
      </Box>
    </FormProvider>
  );
};

export default MDAForApproval;
