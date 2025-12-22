import React, { useState, useMemo, useCallback, useEffect } from "react";
import { Box } from "@mui/material";
import { FormProvider, useForm } from "react-hook-form";
import { useSnackbar } from "notistack";
import "../../../pages/GeneralStyle.scss";
import {
  useLazyGetMdaEvaluationSubmissionsQuery,
  useLazyGetSingleMdaEvaluationSubmissionQuery,
} from "../../../features/api/forms/mdaEvaluationRecommendationApi";
import { useUpdateMdaEvaluationMutation } from "../../../features/api/forms/mdaEvaluationRecommendationApi";
import { useRememberQueryParams } from "../../../hooks/useRememberQueryParams";
import MDAEvaluationRecommendationTable from "./MDAEvaluationRecommendationTable";
import MDAEvaluationRecommendationModal from "../../../components/modal/form/MDAEvaluationRecommendationModal/MDAEvaluationRecommendationModal";
import CustomTablePagination from "../../zzzreusable/CustomTablePagination";

const MDAEvaluationForApproval = ({
  searchQuery,
  dateFilters,
  filterDataByDate,
  filterDataBySearch,
  onCancel,
}) => {
  const { enqueueSnackbar } = useSnackbar();

  const [queryParams, setQueryParams] = useRememberQueryParams();

  const [page, setPage] = useState(parseInt(queryParams?.page) || 1);
  const [rowsPerPage, setRowsPerPage] = useState(
    parseInt(queryParams?.rowsPerPage) || 10
  );

  const [mdaModalOpen, setMdaModalOpen] = useState(false);
  const [mdaModalMode, setMdaModalMode] = useState("view");
  const [selectedSubmissionId, setSelectedSubmissionId] = useState(null);
  const [selectedSubmission, setSelectedSubmission] = useState(null);

  const [menuAnchor, setMenuAnchor] = useState({});

  const mdaFormMethods = useForm({
    defaultValues: {
      form_id: 5,
      employee_movement_id: null,
      employee_id: "",
      employee_name: "",
      employee_number: "",
      effective_date: null,
      action_type: "",
      birth_date: null,
      birth_place: "",
      gender: "",
      nationality: "",
      address: "",
      tin_number: "",
      sss_number: "",
      pag_ibig_number: "",
      philhealth_number: "",
      to_position_id: null,
      to_position_title: "",
      to_job_level: "",
      to_basic_salary: "",
      to_training_allowance: "",
    },
  });

  const apiQueryParams = useMemo(() => {
    return {
      page: page,
      per_page: rowsPerPage,
      status: "active",
      pagination: 1,
      approval_status: "PENDING",
      search: searchQuery || "",
      type: "probationary-evaluation",
    };
  }, [page, rowsPerPage, searchQuery]);

  useEffect(() => {
    setPage(1);
  }, [searchQuery, dateFilters]);

  const [
    triggerGetSubmissions,
    { data: submissionsData, isLoading: queryLoading, isFetching, error },
  ] = useLazyGetMdaEvaluationSubmissionsQuery();

  const [
    triggerGetSubmission,
    { data: submissionDetails, isLoading: detailsLoading },
  ] = useLazyGetSingleMdaEvaluationSubmissionQuery();

  const [updateMdaEvaluation] = useUpdateMdaEvaluationMutation();

  useEffect(() => {
    triggerGetSubmissions(apiQueryParams);
  }, [apiQueryParams, triggerGetSubmissions]);

  useEffect(() => {
    if (submissionDetails?.result) {
      setSelectedSubmission(submissionDetails.result);
    }
  }, [submissionDetails]);

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

  const paginatedSubmissions = useMemo(() => {
    return filteredSubmissions;
  }, [filteredSubmissions]);

  const handleRowClick = useCallback(
    async (submission) => {
      setSelectedSubmissionId(submission.id);
      setMdaModalMode("view");
      setMdaModalOpen(true);
      setMenuAnchor({});
      triggerGetSubmission(submission.id);
    },
    [triggerGetSubmission]
  );

  const handleEditSubmission = useCallback(
    async (submission) => {
      setSelectedSubmissionId(submission.id);
      setMdaModalMode("edit");
      setMdaModalOpen(true);
      setMenuAnchor({});
      triggerGetSubmission(submission.id);
    },
    [triggerGetSubmission]
  );

  const handleMdaModalClose = useCallback(() => {
    setMdaModalOpen(false);
    setSelectedSubmissionId(null);
    setSelectedSubmission(null);
    setMdaModalMode("view");
    mdaFormMethods.reset({
      form_id: 5,
      employee_movement_id: null,
      employee_id: "",
      employee_name: "",
      employee_number: "",
      effective_date: null,
      action_type: "",
      birth_date: null,
      birth_place: "",
      gender: "",
      nationality: "",
      address: "",
      tin_number: "",
      sss_number: "",
      pag_ibig_number: "",
      philhealth_number: "",
      to_position_id: null,
      to_position_title: "",
      to_job_level: "",
      to_basic_salary: "",
      to_training_allowance: "",
    });
  }, [mdaFormMethods]);

  const handleSaveMDA = useCallback(
    async (data, mode) => {
      try {
        if (mode === "edit") {
          await updateMdaEvaluation({
            id: selectedSubmissionId,
            data: data,
          }).unwrap();
          enqueueSnackbar("MDA (Evaluation) updated successfully!", {
            variant: "success",
            autoHideDuration: 3000,
          });
          setMdaModalOpen(false);
          triggerGetSubmissions(apiQueryParams);
        }
      } catch (error) {
        const errorMessage =
          error?.data?.message ||
          "Failed to save MDA (Evaluation). Please try again.";
        enqueueSnackbar(errorMessage, {
          variant: "error",
          autoHideDuration: 3000,
        });
      }
    },
    [
      updateMdaEvaluation,
      selectedSubmissionId,
      apiQueryParams,
      triggerGetSubmissions,
      enqueueSnackbar,
    ]
  );

  const handleMenuOpen = useCallback((event, submission) => {
    event.stopPropagation();
    event.preventDefault();
    setMenuAnchor((prev) => ({
      ...prev,
      [submission.id]: event.currentTarget,
    }));
  }, []);

  const handleMenuClose = useCallback((submissionId) => {
    setMenuAnchor((prev) => ({ ...prev, [submissionId]: null }));
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

  const handleModeChange = useCallback((newMode) => {
    setMdaModalMode(newMode);
  }, []);

  const isLoadingState = queryLoading || isFetching;

  const totalCount =
    submissionsData?.result?.total || filteredSubmissions.length;

  return (
    <>
      <Box
        sx={{
          flex: 1,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          backgroundColor: "white",
        }}>
        <MDAEvaluationRecommendationTable
          submissionsList={paginatedSubmissions}
          isLoadingState={isLoadingState}
          error={error}
          handleRowClick={handleRowClick}
          handleMenuOpen={handleMenuOpen}
          handleMenuClose={handleMenuClose}
          handleEditSubmission={handleEditSubmission}
          menuAnchor={menuAnchor}
          searchQuery={searchQuery}
          selectedFilters={[]}
          showArchived={false}
          hideStatusColumn={false}
          onCancel={onCancel}
        />

        <CustomTablePagination
          count={totalCount}
          page={Math.max(0, page - 1)}
          rowsPerPage={rowsPerPage}
          onPageChange={handlePageChange}
          onRowsPerPageChange={handleRowsPerPageChange}
        />
      </Box>

      <FormProvider {...mdaFormMethods}>
        <MDAEvaluationRecommendationModal
          open={mdaModalOpen}
          onClose={handleMdaModalClose}
          evaluationSubmissionId={selectedSubmissionId}
          selectedEntry={selectedSubmission}
          onSave={handleSaveMDA}
          mode={mdaModalMode}
          onModeChange={handleModeChange}
          isLoading={detailsLoading}
        />
      </FormProvider>
    </>
  );
};

export default MDAEvaluationForApproval;
