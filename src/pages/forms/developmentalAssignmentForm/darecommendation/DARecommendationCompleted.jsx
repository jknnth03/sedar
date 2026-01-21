import React, { useState, useMemo, useCallback, useEffect } from "react";
import { Box, useTheme } from "@mui/material";
import { FormProvider, useForm } from "react-hook-form";
import { useSnackbar } from "notistack";
import "../../../../pages/GeneralStyle.scss";
import {
  useGetDaSubmissionsQuery,
  useLazyGetSingleDaSubmissionQuery,
  useCancelDaSubmissionMutation,
  useResubmitDaSubmissionMutation,
} from "../../../../features/api/forms/daRecommentdationApi";
import DARecommendationTable from "./DARecommendationTable";
import { useRememberQueryParams } from "../../../../hooks/useRememberQueryParams";
import ConfirmationDialog from "../../../../styles/ConfirmationDialog";
import DARecommendationModal from "../../../../components/modal/form/DARecommendation/DARecommendationModal";
import CustomTablePagination from "../../../zzzreusable/CustomTablePagination";

const DARecommendationCompleted = ({ searchQuery, dateFilters, onCancel }) => {
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

  const apiQueryParams = useMemo(() => {
    const params = {
      page: page,
      per_page: rowsPerPage,
      status: "active",
      approval_status: "COMPLETED",
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
        refetch();
      } else if (confirmAction === "resubmit" && selectedSubmissionForAction) {
        await resubmitDaSubmission(selectedSubmissionForAction.id).unwrap();
        enqueueSnackbar("DA Recommendation resubmitted successfully", {
          variant: "success",
          autoHideDuration: 2000,
        });
        await handleRefreshDetails();
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
          submissionsList={submissionsList}
          isLoadingState={isLoadingState}
          error={error}
          handleRowClick={handleRowClick}
          handleMenuOpen={handleMenuOpen}
          handleMenuClose={handleMenuClose}
          menuAnchor={menuAnchor}
          searchQuery={searchQuery}
          statusFilter="COMPLETED"
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

export default DARecommendationCompleted;
