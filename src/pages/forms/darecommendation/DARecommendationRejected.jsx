import React, { useState, useMemo, useCallback, useEffect } from "react";
import { Box, useTheme } from "@mui/material";
import { FormProvider, useForm } from "react-hook-form";
import { useSnackbar } from "notistack";
import "../../../pages/GeneralStyle.scss";
import {
  useGetDaSubmissionsQuery,
  useLazyGetSingleDaSubmissionQuery,
  useCancelDaSubmissionMutation,
  useResubmitDaSubmissionMutation,
  useSubmitDaRecommendationMutation,
} from "../../../features/api/forms/daRecommentdationApi";
import { useShowDashboardQuery } from "../../../features/api/usermanagement/dashboardApi";
import DARecommendationTable from "./DARecommendationTable";
import { useRememberQueryParams } from "../../../hooks/useRememberQueryParams";
import ConfirmationDialog from "../../../styles/ConfirmationDialog";
import DARecommendationModal from "../../../components/modal/form/DARecommendation/DARecommendationModal";
import CustomTablePagination from "../../zzzreusable/CustomTablePagination";

const DARecommendationRejected = ({
  searchQuery,
  dateFilters,
  filterDataByDate,
  filterDataBySearch,
  onCancel,
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

  const [resubmitDaSubmission] = useResubmitDaSubmissionMutation();
  const [cancelDaSubmission] = useCancelDaSubmissionMutation();
  const [submitDaRecommendation] = useSubmitDaRecommendationMutation();

  const { refetch: refetchDashboard } = useShowDashboardQuery();

  const apiQueryParams = useMemo(() => {
    return {
      page: page,
      per_page: rowsPerPage,
      status: "active",
      approval_status: "RECOMMENDATION REJECTED",
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
  } = useGetDaSubmissionsQuery(apiQueryParams, {
    refetchOnMountOrArgChange: true,
    skip: false,
  });

  const [
    triggerGetSubmission,
    { data: submissionDetails, isLoading: detailsLoading },
  ] = useLazyGetSingleDaSubmissionQuery();

  const submissions = useMemo(() => {
    return submissionsData?.result?.data || [];
  }, [submissionsData]);

  const totalCount = useMemo(() => {
    return submissionsData?.result?.total || 0;
  }, [submissionsData]);

  const handleRowClick = useCallback(
    async (submission) => {
      setSelectedSubmissionId(submission.id);
      setModalMode("view");
      setModalOpen(true);
      setMenuAnchor({});

      try {
        await triggerGetSubmission(submission.id);
      } catch (error) {
        enqueueSnackbar("Error fetching submission details", {
          variant: "error",
          autoHideDuration: 2000,
        });
      }
    },
    [triggerGetSubmission, enqueueSnackbar]
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

  const handleSubmit = useCallback(
    async (formData, entryId) => {
      if (!entryId) {
        enqueueSnackbar("Submission ID not found. Please try again.", {
          variant: "error",
          autoHideDuration: 2000,
        });
        return;
      }

      try {
        setModalLoading(true);

        await submitDaRecommendation({ id: entryId, body: formData }).unwrap();

        enqueueSnackbar("DA Recommendation submitted successfully", {
          variant: "success",
          autoHideDuration: 2000,
        });

        handleModalClose();
        await refetch();
        await refetchDashboard();
      } catch (error) {
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
    [
      submitDaRecommendation,
      enqueueSnackbar,
      handleModalClose,
      refetch,
      refetchDashboard,
    ]
  );

  const handleSave = useCallback(
    async (formData, mode, entryId) => {
      if (!entryId) {
        enqueueSnackbar("Submission ID not found. Please try again.", {
          variant: "error",
          autoHideDuration: 2000,
        });
        return;
      }

      if (!formData.kpis || formData.kpis.length === 0) {
        enqueueSnackbar("Please add at least one objective/KPI.", {
          variant: "error",
          autoHideDuration: 2000,
        });
        return;
      }

      let finalRecommendation = null;
      if (formData.for_permanent_appointment) {
        finalRecommendation = "FOR PERMANENT";
      } else if (formData.not_for_permanent_appointment) {
        finalRecommendation = "NOT FOR PERMANENT";
      } else if (formData.for_extension) {
        finalRecommendation = "FOR EXTENSION";
      }

      if (!finalRecommendation) {
        enqueueSnackbar("Please select a recommendation option.", {
          variant: "error",
          autoHideDuration: 2000,
        });
        return;
      }

      const hasAllActualPerformance = formData.kpis.every(
        (kpi) =>
          kpi.actual_performance !== null &&
          kpi.actual_performance !== undefined &&
          kpi.actual_performance !== ""
      );

      if (!hasAllActualPerformance) {
        enqueueSnackbar("Please fill in all Actual Performance fields.", {
          variant: "error",
          autoHideDuration: 2000,
        });
        return;
      }

      const objectives = formData.kpis.map((kpi) => ({
        id: kpi.id,
        actual_performance: kpi.actual_performance,
        remarks: kpi.remarks || "",
      }));

      const payload = {
        final_recommendation: finalRecommendation,
        objectives: objectives,
      };

      try {
        setModalLoading(true);

        await submitDaRecommendation({ id: entryId, body: payload }).unwrap();

        enqueueSnackbar("DA Recommendation updated successfully", {
          variant: "success",
          autoHideDuration: 2000,
        });

        handleModalClose();
        await refetch();
        await refetchDashboard();
      } catch (error) {
        const errorMessage =
          error?.data?.message ||
          "Failed to update recommendation. Please try again.";
        enqueueSnackbar(errorMessage, {
          variant: "error",
          autoHideDuration: 2000,
        });
      } finally {
        setModalLoading(false);
      }
    },
    [
      submitDaRecommendation,
      enqueueSnackbar,
      handleModalClose,
      refetch,
      refetchDashboard,
    ]
  );

  const handleResubmit = useCallback(
    async (submissionId) => {
      const submission = submissions.find((sub) => sub.id === submissionId);
      setSelectedSubmissionForAction(submission);
      setConfirmAction("resubmit");
      setConfirmOpen(true);
    },
    [submissions]
  );

  const handleCancel = useCallback(
    async (submissionId) => {
      const submission = submissions.find((sub) => sub.id === submissionId);
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
    [submissions, enqueueSnackbar]
  );

  const handleActionConfirm = async () => {
    if (!confirmAction) return;

    setIsLoading(true);

    try {
      if (confirmAction === "cancel" && selectedSubmissionForAction) {
        await cancelDaSubmission(selectedSubmissionForAction.id).unwrap();
        enqueueSnackbar("DA Recommendation cancelled successfully", {
          variant: "success",
          autoHideDuration: 2000,
        });
        refetch();
        refetchDashboard();
      } else if (confirmAction === "resubmit" && selectedSubmissionForAction) {
        await resubmitDaSubmission(selectedSubmissionForAction.id).unwrap();
        enqueueSnackbar("DA Recommendation resubmitted successfully", {
          variant: "success",
          autoHideDuration: 2000,
        });
        await handleRefreshDetails();
        await refetch();
        await refetchDashboard();
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
      selectedSubmissionForAction?.reference_number || "DA Recommendation";
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
        <DARecommendationTable
          submissionsList={submissions}
          isLoadingState={isLoadingState}
          error={error}
          handleRowClick={handleRowClick}
          handleMenuOpen={handleMenuOpen}
          handleMenuClose={handleMenuClose}
          menuAnchor={menuAnchor}
          searchQuery={searchQuery}
          statusFilter="RECOMMENDATION REJECTED"
          onCancel={handleCancel}
        />

        <CustomTablePagination
          count={totalCount}
          page={Math.max(0, page - 1)}
          rowsPerPage={rowsPerPage}
          onPageChange={handlePageChange}
          onRowsPerPageChange={handleRowsPerPageChange}
        />
      </Box>

      <DARecommendationModal
        open={modalOpen}
        onClose={handleModalClose}
        onResubmit={handleResubmit}
        onSubmit={handleSubmit}
        onSave={handleSave}
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
      />
    </FormProvider>
  );
};

export default DARecommendationRejected;
