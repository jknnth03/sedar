import React, { useState, useMemo, useCallback, useEffect } from "react";
import { Typography, TablePagination, Box, useTheme } from "@mui/material";
import { FormProvider, useForm } from "react-hook-form";
import { useSnackbar } from "notistack";
import "../../../pages/GeneralStyle.scss";
import {
  useGetDaSubmissionsForReceivingQuery,
  useLazyGetSingleDaSubmissionForReceivingQuery,
} from "../../../features/api/receiving/daFormReceivingApi";
import { useRememberQueryParams } from "../../../hooks/useRememberQueryParams";
import DaFormReceivingTable from "./DaFormReceivingTable";
import DaFormReceivingModal from "../../../components/modal/receiving/DaFormReceivingModal";

const DaFormReceivingForAssessment = ({
  searchQuery,
  dateFilters,
  filterDataByDate,
  filterDataBySearch,
  setQueryParams,
  currentParams,
  onCompleteAssessment,
}) => {
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();

  const [queryParams, setQueryParamsLocal] = useRememberQueryParams();

  const [page, setPage] = useState(parseInt(currentParams?.page) || 1);
  const [rowsPerPage, setRowsPerPage] = useState(
    parseInt(currentParams?.rowsPerPage) || 10
  );

  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [viewModalMode, setViewModalMode] = useState("assess");
  const [selectedSubmissionId, setSelectedSubmissionId] = useState(null);
  const [selectedSubmission, setSelectedSubmission] = useState(null);

  const [modalLoading, setModalLoading] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState({});
  const [selectedRowForMenu, setSelectedRowForMenu] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const viewFormMethods = useForm({
    defaultValues: {
      form_id: 5,
      da_submission_id: null,
      employee_id: "",
      employee_name: "",
      employee_number: "",
      effective_date: null,
      action_type: "",
      birth_date: null,
      birth_place: "",
      gender: "",
      civil_status: "",
      nationality: "",
      address: "",
      tin_number: "",
      sss_number: "",
      pag_ibig_number: "",
      philhealth_number: "",
      from_position_id: null,
      from_position_title: "",
      from_job_level_id: null,
      from_job_level: "",
      from_department: "",
      from_sub_unit: "",
      from_job_rate: "",
      from_allowance: "",
      to_position_id: null,
      to_position_title: "",
      to_job_level_id: null,
      to_job_level: "",
      to_department: "",
      to_sub_unit: "",
      to_job_rate: "",
      to_allowance: "",
    },
  });

  const apiQueryParams = useMemo(() => {
    return {
      pagination: 1,
      page: page,
      per_page: rowsPerPage,
      status: "active",
      search: searchQuery || "",
      assessment_progress_status: "ONGOING",
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
    refetch,
    error,
  } = useGetDaSubmissionsForReceivingQuery(apiQueryParams, {
    refetchOnMountOrArgChange: true,
    skip: false,
  });

  const [
    triggerGetSubmission,
    { data: submissionDetails, isLoading: detailsLoading },
  ] = useLazyGetSingleDaSubmissionForReceivingQuery();

  const totalCount = submissionsData?.result?.total || 0;

  const submissionsList = useMemo(() => {
    return submissionsData?.result?.data || [];
  }, [submissionsData]);

  const handleRowClick = useCallback(
    async (submission) => {
      setSelectedSubmissionId(submission.id);
      setSelectedSubmission(submission);
      setViewModalMode("assess");
      setViewModalOpen(true);
      setMenuAnchor({});
      setSelectedRowForMenu(null);

      try {
        await triggerGetSubmission(submission.id);
      } catch (error) {
        console.error("Error fetching submission details:", error);
      }
    },
    [triggerGetSubmission]
  );

  const handleCompleteAssessment = useCallback(
    async (submission) => {
      setMenuAnchor({});
      setSelectedRowForMenu(null);

      const success = await onCompleteAssessment(submission.id, () => {
        refetch();
      });

      if (success) {
      }
    },
    [onCompleteAssessment, refetch]
  );

  const handleViewModalClose = useCallback(() => {
    setViewModalOpen(false);
    setSelectedSubmissionId(null);
    setModalLoading(false);
    setViewModalMode("assess");
    viewFormMethods.reset();
  }, [viewFormMethods]);

  const handleRefreshDetails = useCallback(() => {
    if (selectedSubmissionId) {
      triggerGetSubmission(selectedSubmissionId);
    }
  }, [selectedSubmissionId, triggerGetSubmission]);

  const handleMenuOpen = useCallback((event, submission) => {
    event.stopPropagation();
    event.preventDefault();
    setMenuAnchor((prev) => ({
      ...prev,
      [submission.id]: event.currentTarget,
    }));
    setSelectedRowForMenu(submission);
  }, []);

  const handleMenuClose = useCallback((submissionId) => {
    setMenuAnchor((prev) => ({ ...prev, [submissionId]: null }));
    setSelectedRowForMenu(null);
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
          { retain: true }
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
          { retain: true }
        );
      }
    },
    [setQueryParams, currentParams]
  );

  const handleModeChange = useCallback((newMode) => {
    setViewModalMode(newMode);
  }, []);

  const isLoadingState = queryLoading || isFetching || isLoading;

  return (
    <>
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
          <DaFormReceivingTable
            submissionsList={submissionsList}
            isLoadingState={isLoadingState}
            error={error}
            handleRowClick={handleRowClick}
            handleMenuOpen={handleMenuOpen}
            handleMenuClose={handleMenuClose}
            handleCompleteAssessment={handleCompleteAssessment}
            menuAnchor={menuAnchor}
            searchQuery={searchQuery}
            onRefetch={refetch}
            isAssessmentMode={true}
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
      </Box>

      <FormProvider {...viewFormMethods}>
        <DaFormReceivingModal
          open={viewModalOpen}
          onClose={handleViewModalClose}
          submissionId={selectedSubmissionId}
          mode={viewModalMode}
          onModeChange={handleModeChange}
          selectedEntry={submissionDetails}
          isLoading={modalLoading || detailsLoading}
          onRefreshDetails={handleRefreshDetails}
          isAssessmentMode={true}
        />
      </FormProvider>
    </>
  );
};

export default DaFormReceivingForAssessment;
