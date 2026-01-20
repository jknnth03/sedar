import React, { useState, useMemo, useCallback, useEffect } from "react";
import { Box, useTheme } from "@mui/material";
import { FormProvider, useForm } from "react-hook-form";
import { useSnackbar } from "notistack";
import dayjs from "dayjs";
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

const DARecommendationForApproval = ({
  searchQuery,
  dateFilters,
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
    const params = {
      page: page,
      per_page: rowsPerPage,
      status: "active",
      approval_status: "PENDING RECOMMENDATION APPROVAL",
      pagination: 1,
      search: searchQuery || "",
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
  } = useGetDaSubmissionsQuery(apiQueryParams, {
    refetchOnMountOrArgChange: true,
    skip: false,
  });

  const [
    triggerGetSubmission,
    { data: submissionDetails, isLoading: detailsLoading },
  ] = useLazyGetSingleDaSubmissionQuery();

  const submissionsList = useMemo(() => {
    const data = submissionsData?.result?.data || [];
    return data;
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

  const handleSave = useCallback(
    async (formData, mode, entryId) => {
      console.log("handleSave called with:", { formData, mode, entryId });

      const submissionId = entryId || selectedSubmissionId;

      if (!submissionId) {
        enqueueSnackbar("Submission ID not found. Please try again.", {
          variant: "error",
          autoHideDuration: 2000,
        });
        return;
      }

      console.log("Using submission ID:", submissionId);

      if (formData.objectives && formData.objectives.length > 0) {
        const allHaveActualPerformance = formData.objectives.every(
          (obj) =>
            obj.actual_performance !== null &&
            obj.actual_performance !== undefined &&
            obj.actual_performance !== ""
        );

        if (!allHaveActualPerformance) {
          enqueueSnackbar("Please fill in all Actual Performance fields.", {
            variant: "error",
            autoHideDuration: 2000,
          });
          return;
        }

        try {
          setModalLoading(true);

          console.log("Sending to API:", { id: entryId, body: formData });

          await submitDaRecommendation({
            id: entryId,
            body: formData,
          }).unwrap();

          enqueueSnackbar("DA Recommendation updated successfully", {
            variant: "success",
            autoHideDuration: 2000,
          });

          handleModalClose();
          await refetch();
          await refetchDashboard();
        } catch (error) {
          console.error("API Error:", error);
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
        id: kpi.id || kpi.source_kpi_id,
        actual_performance: kpi.actual_performance,
        remarks: kpi.remarks || "",
      }));

      const payload = {
        final_recommendation: finalRecommendation,
        objectives: objectives,
      };

      if (formData.for_extension && formData.extension_end_date) {
        payload.extension_end_date = dayjs(formData.extension_end_date).format(
          "YYYY-MM-DD"
        );
      }

      try {
        setModalLoading(true);

        console.log("Sending to API:", { id: entryId, body: payload });

        await submitDaRecommendation({ id: entryId, body: payload }).unwrap();

        enqueueSnackbar("DA Recommendation updated successfully", {
          variant: "success",
          autoHideDuration: 2000,
        });

        handleModalClose();
        await refetch();
        await refetchDashboard();
      } catch (error) {
        console.error("API Error:", error);
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
      const submission = submissionsList.find((sub) => sub.id === submissionId);
      setSelectedSubmissionForAction(submission);
      setConfirmAction("resubmit");
      setConfirmOpen(true);
    },
    [submissionsList]
  );

  const handleCancel = useCallback(
    async (submissionId) => {
      const submission = submissionsList.find((sub) => sub.id === submissionId);
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
    [submissionsList, enqueueSnackbar]
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
        handleModalClose();
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

  const totalCount = submissionsData?.result?.total || 0;

  const normalizedSubmissionDetails = useMemo(() => {
    if (!submissionDetails) return null;

    if (submissionDetails.result) {
      return submissionDetails.result;
    }

    return submissionDetails;
  }, [submissionDetails]);

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
          submissionsList={submissionsList}
          isLoadingState={isLoadingState}
          error={error}
          handleRowClick={handleRowClick}
          handleMenuOpen={handleMenuOpen}
          handleMenuClose={handleMenuClose}
          menuAnchor={menuAnchor}
          searchQuery={searchQuery}
          statusFilter="PENDING RECOMMENDATION APPROVAL"
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
        onSave={handleSave}
        onSubmit={handleSave}
        selectedEntry={normalizedSubmissionDetails}
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
        module="DA Recommendation"
      />
    </FormProvider>
  );
};

export default DARecommendationForApproval;
