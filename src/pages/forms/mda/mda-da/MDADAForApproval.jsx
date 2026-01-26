import React, { useState, useMemo, useCallback, useEffect } from "react";
import { Typography, Box, useTheme } from "@mui/material";
import { FormProvider, useForm } from "react-hook-form";
import { useSnackbar } from "notistack";
import "../../../../pages/GeneralStyle.scss";
import {
  useGetMdaDaSubmissionsQuery,
  useLazyGetSingleMdaDaSubmissionQuery,
} from "../../../../features/api/forms/mdaDaApi";
import { useRememberQueryParams } from "../../../../hooks/useRememberQueryParams";
import MDADATable from "./MDADATable";
import MDADAModal from "../../../../components/modal/form/MDADAForm/MDADAModal";
import CustomTablePagination from "../../../zzzreusable/CustomTablePagination";

const MDADAForApproval = ({ searchQuery, dateFilters, onCancel }) => {
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();

  const [queryParams, setQueryParams] = useRememberQueryParams();

  const [page, setPage] = useState(parseInt(queryParams?.page) || 1);
  const [rowsPerPage, setRowsPerPage] = useState(
    parseInt(queryParams?.rowsPerPage) || 10,
  );

  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [viewModalMode, setViewModalMode] = useState("view");
  const [selectedSubmissionId, setSelectedSubmissionId] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState({});
  const [selectedRowForMenu, setSelectedRowForMenu] = useState(null);

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
    const params = {
      pagination: 1,
      page: page,
      per_page: rowsPerPage,
      status: "active",
      approval_status: "PENDING",
      search: searchQuery || "",
      type: "da",
    };

    if (dateFilters?.start_date) {
      params.start_date = dateFilters.start_date;
    }
    if (dateFilters?.end_date) {
      params.end_date = dateFilters.end_date;
    }

    return params;
  }, [page, rowsPerPage, searchQuery, dateFilters]);

  useEffect(() => {
    setPage(1);
  }, [searchQuery, dateFilters]);

  const {
    data: submissionsData,
    isLoading: queryLoading,
    isFetching,
    refetch,
    error,
  } = useGetMdaDaSubmissionsQuery(apiQueryParams, {
    refetchOnMountOrArgChange: true,
    skip: false,
  });

  const [
    triggerGetSubmission,
    { data: submissionDetails, isLoading: detailsLoading },
  ] = useLazyGetSingleMdaDaSubmissionQuery();

  const filteredSubmissions = useMemo(() => {
    if (!submissionsData?.result) return [];

    const result = submissionsData.result;

    if (result.data && Array.isArray(result.data)) {
      return result.data;
    }

    if (Array.isArray(result)) {
      return result;
    }

    return [];
  }, [submissionsData]);

  const handleRowClick = useCallback(
    async (submission) => {
      setSelectedSubmissionId(submission.id);
      setViewModalMode("view");
      setViewModalOpen(true);
      setMenuAnchor({});
      setSelectedRowForMenu(null);

      try {
        await triggerGetSubmission(submission.id);
      } catch (error) {
        console.error("Error fetching submission details:", error);
      }
    },
    [triggerGetSubmission],
  );

  const handleEditSubmission = useCallback(
    async (submission) => {
      setSelectedSubmissionId(submission.id);
      setViewModalMode("edit");
      setViewModalOpen(true);
      setMenuAnchor({});
      setSelectedRowForMenu(null);

      try {
        await triggerGetSubmission(submission.id);
      } catch (error) {
        console.error("Error fetching submission details:", error);
      }
    },
    [triggerGetSubmission],
  );

  const handleViewModalClose = useCallback(() => {
    setViewModalOpen(false);
    setSelectedSubmissionId(null);
    setModalLoading(false);
    setViewModalMode("view");
    viewFormMethods.reset();
  }, [viewFormMethods]);

  const handleRefreshDetails = useCallback(() => {
    if (selectedSubmissionId) {
      triggerGetSubmission(selectedSubmissionId);
    }
  }, [selectedSubmissionId, triggerGetSubmission]);

  const handleCancelSubmission = useCallback(() => {
    refetch();
  }, [refetch]);

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
            ...queryParams,
            page: targetPage,
            rowsPerPage: rowsPerPage,
          },
          { retain: false },
        );
      }
    },
    [setQueryParams, rowsPerPage, queryParams],
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
          { retain: false },
        );
      }
    },
    [setQueryParams, queryParams],
  );

  const handleModeChange = useCallback((newMode) => {
    setViewModalMode(newMode);
  }, []);

  const isLoadingState = queryLoading || isFetching;

  const totalCount = submissionsData?.result?.total || 0;

  return (
    <FormProvider {...viewFormMethods}>
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
          <MDADATable
            submissionsList={filteredSubmissions}
            isLoadingState={isLoadingState}
            error={error}
            handleRowClick={handleRowClick}
            handleMenuOpen={handleMenuOpen}
            handleMenuClose={handleMenuClose}
            handleEditSubmission={handleEditSubmission}
            menuAnchor={menuAnchor}
            searchQuery={searchQuery}
            statusFilter="PENDING"
            onCancel={handleCancelSubmission}
          />

          <CustomTablePagination
            count={totalCount}
            page={Math.max(0, page - 1)}
            rowsPerPage={rowsPerPage}
            onPageChange={handlePageChange}
            onRowsPerPageChange={handleRowsPerPageChange}
          />
        </Box>
      </Box>

      <MDADAModal
        open={viewModalOpen}
        onClose={handleViewModalClose}
        submissionId={selectedSubmissionId}
        mode={viewModalMode}
        onModeChange={handleModeChange}
        selectedEntry={submissionDetails}
        isLoading={modalLoading || detailsLoading}
        onRefreshDetails={handleRefreshDetails}
      />
    </FormProvider>
  );
};

export default MDADAForApproval;
