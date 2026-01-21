import React, {
  useState,
  useMemo,
  useCallback,
  useEffect,
  useRef,
} from "react";
import { Typography, Box, useTheme } from "@mui/material";
import { FormProvider, useForm } from "react-hook-form";
import { useSnackbar } from "notistack";
import "../../../pages/GeneralStyle.scss";
import {
  useGetEvaluationSubmissionsQuery,
  useLazyGetSingleEvaluationSubmissionQuery,
} from "../../../features/api/forms/mdaEvaluationRecommendationApi";
import {
  useCreateMdaEvaluationMutation,
  useUpdateMdaEvaluationMutation,
} from "../../../features/api/forms/mdaEvaluationRecommendationApi";
import { useRememberQueryParams } from "../../../hooks/useRememberQueryParams";
import EvaluationForMDAProcessingTable from "./EvaluationForMDAProcessingTable";
import ForEvaluationProcessingModal from "../../../components/modal/form/MDAEvaluationRecommendationModal/ForEvaluationProcessingModal";
import MDAEvaluationRecommendationModal from "../../../components/modal/form/MDAEvaluationRecommendationModal/MDAEvaluationRecommendationModal";
import CustomTablePagination from "../../zzzreusable/CustomTablePagination";

const EvaluationForMDAProcessing = ({ searchQuery, dateFilters, onCancel }) => {
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();

  const [queryParams, setQueryParams] = useRememberQueryParams();

  const [page, setPage] = useState(parseInt(queryParams?.page) || 1);
  const [rowsPerPage, setRowsPerPage] = useState(
    parseInt(queryParams?.rowsPerPage) || 10
  );

  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [viewModalMode, setViewModalMode] = useState("view");
  const [selectedSubmissionId, setSelectedSubmissionId] = useState(null);
  const [selectedSubmission, setSelectedSubmission] = useState(null);

  const [mdaModalOpen, setMdaModalOpen] = useState(false);
  const [mdaSubmissionId, setMdaSubmissionId] = useState(null);
  const [selectedMdaSubmission, setSelectedMdaSubmission] = useState(null);

  const [menuAnchor, setMenuAnchor] = useState({});

  const viewFormMethods = useForm({
    defaultValues: {
      reason_for_change: "",
      employee_id: null,
      new_position_id: null,
      remarks: "",
      objectives: [],
    },
  });

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
    const params = {
      page: page,
      per_page: rowsPerPage,
      status: "active",
      pagination: 1,
      approval_status: "PENDING MDA CREATION",
      search: searchQuery || "",
      view_mode: "hr",
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
  } = useGetEvaluationSubmissionsQuery(apiQueryParams, {
    refetchOnMountOrArgChange: true,
    skip: false,
  });

  const [
    triggerGetSubmission,
    { data: submissionDetails, isLoading: detailsLoading },
  ] = useLazyGetSingleEvaluationSubmissionQuery();

  const [createMdaEvaluation, { isLoading: isCreatingMdaEvaluation }] =
    useCreateMdaEvaluationMutation();
  const [updateMdaEvaluation, { isLoading: isUpdatingMdaEvaluation }] =
    useUpdateMdaEvaluationMutation();

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
      setSelectedSubmission(null);
      setSelectedSubmissionId(submission.id);
      setViewModalMode("view");
      setMenuAnchor({});

      try {
        const result = await triggerGetSubmission(submission.id).unwrap();
        if (result?.result) {
          setSelectedSubmission(result.result);
        }
        setViewModalOpen(true);
      } catch (error) {
        console.error("Error fetching submission:", error);
        enqueueSnackbar("Failed to load submission details", {
          variant: "error",
          autoHideDuration: 3000,
        });
      }
    },
    [triggerGetSubmission, enqueueSnackbar]
  );

  const handleEditSubmission = useCallback(
    async (submission) => {
      setSelectedSubmission(null);
      setSelectedSubmissionId(submission.id);
      setViewModalMode("edit");
      setMenuAnchor({});

      try {
        const result = await triggerGetSubmission(submission.id).unwrap();
        if (result?.result) {
          setSelectedSubmission(result.result);
        }
        setViewModalOpen(true);
      } catch (error) {
        console.error("Error fetching submission:", error);
        enqueueSnackbar("Failed to load submission details", {
          variant: "error",
          autoHideDuration: 3000,
        });
      }
    },
    [triggerGetSubmission, enqueueSnackbar]
  );

  const handleViewModalClose = useCallback(() => {
    setViewModalOpen(false);
    setSelectedSubmissionId(null);
    setSelectedSubmission(null);
    setViewModalMode("view");
    viewFormMethods.reset();
  }, [viewFormMethods]);

  const handleRefreshDetails = useCallback(() => {
    if (selectedSubmissionId) {
      triggerGetSubmission(selectedSubmissionId);
    }
  }, [selectedSubmissionId, triggerGetSubmission]);

  const handleCreateMDA = useCallback((submission) => {
    setMdaSubmissionId(submission.id);
    setSelectedMdaSubmission(submission);
    setMdaModalOpen(true);
  }, []);

  const handleMdaModalClose = useCallback(() => {
    setMdaModalOpen(false);
    setMdaSubmissionId(null);
    setSelectedMdaSubmission(null);
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
        if (mode === "create") {
          await createMdaEvaluation(data).unwrap();
          enqueueSnackbar("MDA (Evaluation) created successfully!", {
            variant: "success",
            autoHideDuration: 3000,
          });
          setMdaModalOpen(false);
          mdaFormMethods.reset();
          refetch();
        } else if (mode === "edit") {
          await updateMdaEvaluation({
            id: selectedMdaSubmission.id,
            data: data,
          }).unwrap();
          enqueueSnackbar("MDA (Evaluation) updated successfully!", {
            variant: "success",
            autoHideDuration: 3000,
          });
          setMdaModalOpen(false);
          refetch();
        }
      } catch (error) {
        console.error("Error saving MDA (Evaluation):", error);
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
      createMdaEvaluation,
      updateMdaEvaluation,
      selectedMdaSubmission,
      refetch,
      enqueueSnackbar,
      mdaFormMethods,
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
    setViewModalMode(newMode);
  }, []);

  const isLoadingState = queryLoading || isFetching;

  const totalCount = submissionsData?.result?.total || 0;

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
        <EvaluationForMDAProcessingTable
          submissionsList={filteredSubmissions}
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
          forMDAProcessing={true}
          onCreateMDA={handleCreateMDA}
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

      <FormProvider {...viewFormMethods}>
        <ForEvaluationProcessingModal
          open={viewModalOpen}
          onClose={handleViewModalClose}
          submissionId={selectedSubmissionId}
          selectedEntry={selectedSubmission}
          mode={viewModalMode}
          onModeChange={handleModeChange}
          isLoading={detailsLoading}
          onRefreshDetails={handleRefreshDetails}
          onCreateMDA={handleCreateMDA}
        />
      </FormProvider>

      <FormProvider {...mdaFormMethods}>
        <MDAEvaluationRecommendationModal
          open={mdaModalOpen}
          onClose={handleMdaModalClose}
          evaluationSubmissionId={mdaSubmissionId}
          onSave={handleSaveMDA}
          mode="create"
        />
      </FormProvider>
    </>
  );
};

export default EvaluationForMDAProcessing;
