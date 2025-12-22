import React, { useState, useMemo, useCallback, useEffect } from "react";
import { Box, useTheme } from "@mui/material";
import { FormProvider, useForm } from "react-hook-form";
import { useSnackbar } from "notistack";
import "../../../pages/GeneralStyle.scss";
import {
  useGetEvaluationSubmissionsQuery,
  useLazyGetSingleEvaluationSubmissionQuery,
  useSubmitEvaluationRecommendationMutation,
  useResubmitEvaluationSubmissionMutation,
  useCancelEvaluationSubmissionMutation,
} from "../../../features/api/forms/evaluationRecommendationApi";
import EvaluationRecommendationTable from "./EvaluationRecommendationTable";
import { useRememberQueryParams } from "../../../hooks/useRememberQueryParams";
import ConfirmationDialog from "../../../styles/ConfirmationDialog";
import EvaluationRecommendationModal from "../../../components/modal/form/EvaluationRecommendation/EvaluationRecommendationModal";
import CustomTablePagination from "../../zzzreusable/CustomTablePagination";

const EvaluationRecommendationAwaitingResubmission = ({
  searchQuery,
  dateFilters,
  filterDataByDate,
  filterDataBySearch,
}) => {
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();

  const [queryParams, setQueryParams] = useRememberQueryParams();

  const [page, setPage] = useState(parseInt(queryParams?.page) || 1);
  const [rowsPerPage, setRowsPerPage] = useState(
    parseInt(queryParams?.rowsPerPage) || 10
  );
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedSubmissionId, setSelectedSubmissionId] = useState(null);
  const [menuAnchor, setMenuAnchor] = useState({});
  const [modalMode, setModalMode] = useState("view");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [selectedSubmissionForAction, setSelectedSubmissionForAction] =
    useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);

  const methods = useForm({
    defaultValues: {},
  });

  const [submitEvaluationRecommendation] =
    useSubmitEvaluationRecommendationMutation();
  const [resubmitEvaluationSubmission] =
    useResubmitEvaluationSubmissionMutation();
  const [cancelEvaluationSubmission] = useCancelEvaluationSubmissionMutation();

  const apiQueryParams = useMemo(() => {
    return {
      page: page,
      per_page: rowsPerPage,
      status: "active",
      approval_status: "AWAITING RECOMMENDATION RESUBMISSION",
      pagination: 1,
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
  } = useGetEvaluationSubmissionsQuery(apiQueryParams, {
    refetchOnMountOrArgChange: true,
    skip: false,
  });

  const [
    triggerGetSubmission,
    { data: submissionDetails, isLoading: detailsLoading },
  ] = useLazyGetSingleEvaluationSubmissionQuery();

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
    const startIndex = (page - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    return filteredSubmissions.slice(startIndex, endIndex);
  }, [filteredSubmissions, page, rowsPerPage]);

  const handleRowClick = useCallback(
    async (submission) => {
      setSelectedSubmissionId(submission.id);
      setModalMode("view");
      setModalOpen(true);
      setMenuAnchor({});

      try {
        await triggerGetSubmission(submission.id);
      } catch (error) {
        console.error("Error fetching submission details:", error);
      }
    },
    [triggerGetSubmission]
  );

  const handleModalClose = useCallback(() => {
    setModalOpen(false);
    setSelectedSubmissionId(null);
    setModalLoading(false);
    setModalMode("view");
    methods.reset();
  }, [methods]);

  const handleRefreshDetails = useCallback(() => {
    if (selectedSubmissionId) {
      triggerGetSubmission(selectedSubmissionId);
    }
  }, [selectedSubmissionId, triggerGetSubmission]);

  const handleSubmitForRecommendation = useCallback(
    async (formattedData, entryId) => {
      setModalLoading(true);
      try {
        const response = await submitEvaluationRecommendation({
          id: entryId,
          body: formattedData,
        }).unwrap();

        enqueueSnackbar("Evaluation Recommendation submitted successfully", {
          variant: "success",
          autoHideDuration: 2000,
        });
        handleModalClose();
        await refetch();
      } catch (error) {
        console.error("Submit error:", error);
        const errorMessage =
          error?.data?.message ||
          "Failed to submit recommendation. Please try again.";
        enqueueSnackbar(errorMessage, {
          variant: "error",
          autoHideDuration: 2000,
        });
      } finally {
        setModalLoading(false);
      }
    },
    [submitEvaluationRecommendation, enqueueSnackbar, handleModalClose, refetch]
  );

  const handleUpdateEvaluation = useCallback(
    async (formattedData, mode, entryId) => {
      setModalLoading(true);
      try {
        const response = await submitEvaluationRecommendation({
          id: entryId,
          body: formattedData,
        }).unwrap();

        enqueueSnackbar("Evaluation Recommendation updated successfully", {
          variant: "success",
          autoHideDuration: 2000,
        });
        handleModalClose();
        await refetch();
      } catch (error) {
        console.error("Update error:", error);
        const errorMessage =
          error?.data?.message ||
          "Failed to update evaluation. Please try again.";
        enqueueSnackbar(errorMessage, {
          variant: "error",
          autoHideDuration: 2000,
        });
      } finally {
        setModalLoading(false);
      }
    },
    [submitEvaluationRecommendation, enqueueSnackbar, handleModalClose, refetch]
  );

  const handleResubmit = useCallback(
    async (submissionId) => {
      const submission = filteredSubmissions.find(
        (sub) => sub.id === submissionId
      );
      setSelectedSubmissionForAction(submission);
      setConfirmAction("resubmit");
      setConfirmOpen(true);
    },
    [filteredSubmissions]
  );

  const handleCancel = useCallback(
    async (submissionId) => {
      const submission = filteredSubmissions.find(
        (sub) => sub.id === submissionId
      );
      if (submission) {
        setSelectedSubmissionForAction(submission);
        setConfirmAction("cancel");
        setConfirmOpen(true);
      } else {
        enqueueSnackbar("Submission not found. Please try again.", {
          variant: "error",
          autoHideDuration: 2000,
        });
      }
    },
    [filteredSubmissions, enqueueSnackbar]
  );

  const handleActionConfirm = async () => {
    if (!confirmAction) return;

    setIsLoading(true);

    try {
      if (confirmAction === "cancel" && selectedSubmissionForAction) {
        await cancelEvaluationSubmission(
          selectedSubmissionForAction.id
        ).unwrap();
        enqueueSnackbar("Evaluation Recommendation cancelled successfully", {
          variant: "success",
          autoHideDuration: 2000,
        });
        refetch();
      } else if (confirmAction === "resubmit" && selectedSubmissionForAction) {
        await resubmitEvaluationSubmission(
          selectedSubmissionForAction.id
        ).unwrap();
        enqueueSnackbar("Evaluation Recommendation resubmitted successfully", {
          variant: "success",
          autoHideDuration: 2000,
        });
        handleModalClose();
        await refetch();
      }
    } catch (error) {
      const errorMessage =
        error?.data?.message ||
        `Failed to ${confirmAction} recommendation. Please try again.`;
      enqueueSnackbar(errorMessage, {
        variant: "error",
        autoHideDuration: 2000,
      });
    } finally {
      setConfirmOpen(false);
      setSelectedSubmissionForAction(null);
      setConfirmAction(null);
      setIsLoading(false);
    }
  };

  const handleConfirmationCancel = useCallback(() => {
    setConfirmOpen(false);
    setSelectedSubmissionForAction(null);
    setConfirmAction(null);
  }, []);

  const getSubmissionDisplayName = useCallback(() => {
    const submissionForAction =
      selectedSubmissionForAction?.reference_number ||
      "Evaluation Recommendation";
    return submissionForAction;
  }, [selectedSubmissionForAction]);

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
        <EvaluationRecommendationTable
          submissionsList={paginatedSubmissions}
          isLoadingState={isLoadingState}
          error={error}
          handleRowClick={handleRowClick}
          handleMenuOpen={handleMenuOpen}
          handleMenuClose={handleMenuClose}
          menuAnchor={menuAnchor}
          searchQuery={searchQuery}
          statusFilter="AWAITING RECOMMENDATION RESUBMISSION"
          onCancel={handleCancel}
        />

        <CustomTablePagination
          count={filteredSubmissions.length}
          page={Math.max(0, page - 1)}
          rowsPerPage={rowsPerPage}
          onPageChange={handlePageChange}
          onRowsPerPageChange={handleRowsPerPageChange}
        />
      </Box>

      <EvaluationRecommendationModal
        open={modalOpen}
        onClose={handleModalClose}
        onSave={handleUpdateEvaluation}
        onResubmit={handleResubmit}
        onSubmit={handleSubmitForRecommendation}
        selectedEntry={submissionDetails}
        isLoading={modalLoading || detailsLoading}
        mode={modalMode}
        submissionId={selectedSubmissionId}
      />

      <ConfirmationDialog
        open={confirmOpen}
        onClose={handleConfirmationCancel}
        onConfirm={handleActionConfirm}
        isLoading={isLoading}
        action={confirmAction}
        itemName={getSubmissionDisplayName()}
        module="Evaluation Recommendation"
      />
    </FormProvider>
  );
};

export default EvaluationRecommendationAwaitingResubmission;
