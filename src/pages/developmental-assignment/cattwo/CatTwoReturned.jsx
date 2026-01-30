import React, { useState, useMemo, useCallback, useEffect } from "react";
import { Box, useTheme } from "@mui/material";
import { FormProvider, useForm } from "react-hook-form";
import { useSnackbar } from "notistack";
import "../../../pages/GeneralStyle.scss";
import {
  useGetCatTwoTasksQuery,
  useGetCatTwoTaskByIdQuery,
  useSaveCatTwoAsDraftMutation,
  useSubmitCatTwoMutation,
} from "../../../features/api/da-task/catTwoApi";
import { useShowDashboardQuery } from "../../../features/api/usermanagement/dashboardApi";
import { useRememberQueryParams } from "../../../hooks/useRememberQueryParams";
import CatTwoTable from "./CatTwoTable";
import CatTwoModal from "../../../components/modal/da-task/CatTwoModal";
import CustomTablePagination from "../../zzzreusable/CustomTablePagination";
import { useCancelFormSubmissionMutation } from "../../../features/api/approvalsetting/formSubmissionApi";

const CatTwoReturned = ({
  searchQuery,
  dateFilters,
  onConfirmationRequest,
}) => {
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();

  const [queryParams, setQueryParams] = useRememberQueryParams();

  const [page, setPage] = useState(parseInt(queryParams?.page) || 1);
  const [rowsPerPage, setRowsPerPage] = useState(
    parseInt(queryParams?.rowsPerPage) || 10,
  );

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("view");
  const [selectedSubmissionId, setSelectedSubmissionId] = useState(null);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [menuAnchor, setMenuAnchor] = useState({});
  const [modalSuccessHandler, setModalSuccessHandler] = useState(null);

  const handleModalSuccessCallback = useCallback((successHandler) => {
    setModalSuccessHandler(() => successHandler);
  }, []);

  const methods = useForm({
    defaultValues: {
      template_id: null,
      employee_id: null,
      date_assessed: null,
      remarks: "",
    },
  });

  const apiQueryParams = useMemo(() => {
    const params = {
      pagination: 1,
      page: page,
      per_page: rowsPerPage,
      status: "RETURNED",
      search: searchQuery || "",
    };

    if (
      dateFilters?.start_date !== undefined &&
      dateFilters?.start_date !== null
    ) {
      params.start_date = dateFilters.start_date;
    }
    if (dateFilters?.end_date !== undefined && dateFilters?.end_date !== null) {
      params.end_date = dateFilters.end_date;
    }

    return params;
  }, [page, rowsPerPage, searchQuery, dateFilters]);

  useEffect(() => {
    setPage(1);
  }, [searchQuery, dateFilters]);

  const {
    data: taskData,
    isLoading: queryLoading,
    isFetching,
    refetch,
    error,
  } = useGetCatTwoTasksQuery(apiQueryParams, {
    refetchOnMountOrArgChange: true,
    skip: false,
  });

  const { refetch: refetchDashboard } = useShowDashboardQuery();

  const {
    data: catTwoDetails,
    isLoading: detailsLoading,
    refetch: refetchDetails,
  } = useGetCatTwoTaskByIdQuery(selectedSubmissionId, {
    skip: !selectedSubmissionId,
    refetchOnMountOrArgChange: true,
  });

  const submissionDetails = useMemo(() => {
    if (!catTwoDetails?.result) return null;
    return catTwoDetails;
  }, [catTwoDetails]);

  const [submitCatTwo] = useSubmitCatTwoMutation();
  const [saveCatTwoAsDraft] = useSaveCatTwoAsDraftMutation();
  const [cancelCatTwoSubmission] = useCancelFormSubmissionMutation();

  const submissionsData = useMemo(() => {
    if (!taskData?.result) return [];

    const result = taskData.result;

    if (result.data && Array.isArray(result.data)) {
      return result.data;
    }

    return [];
  }, [taskData]);

  const handleRowClick = useCallback((submission) => {
    setModalMode("view");
    setSelectedSubmissionId(submission.id);
    setSelectedSubmission(submission);
    setMenuAnchor({});
    setModalOpen(true);
  }, []);

  const handleEditSubmission = useCallback((submission) => {
    setSelectedSubmissionId(submission.id);
    setSelectedSubmission(submission);
    setMenuAnchor({});
    setModalMode("edit");
    setModalOpen(true);
  }, []);

  const handleCancelSubmission = useCallback(
    async (submissionId) => {
      const submission = submissionsData.find((sub) => sub.id === submissionId);
      if (submission) {
        const itemName =
          submission?.developmental_assignment?.reference_number ||
          submission?.reference_number ||
          "CAT 2 Assessment";

        onConfirmationRequest("cancel", itemName, {
          taskId: submissionId,
          onSuccess: () => {
            refetch();
            refetchDashboard();
          },
        });
      } else {
        enqueueSnackbar("Submission not found. Please try again.", {
          variant: "error",
          autoHideDuration: 2000,
        });
      }
    },
    [
      submissionsData,
      enqueueSnackbar,
      onConfirmationRequest,
      refetch,
      refetchDashboard,
    ],
  );

  const handleModalClose = useCallback(() => {
    setModalOpen(false);
    setSelectedSubmissionId(null);
    setSelectedSubmission(null);
    setModalMode("view");
  }, []);

  const handleRefreshDetails = useCallback(() => {
    refetch();
    refetchDashboard();
    if (selectedSubmissionId) {
      refetchDetails();
    }
  }, [refetch, refetchDashboard, refetchDetails, selectedSubmissionId]);

  const handleModalSaveAsDraft = useCallback(
    async (submissionData, submissionId) => {
      const submission =
        submissionDetails?.result ||
        submissionsData.find((sub) => sub.id === submissionId);

      const itemName =
        submission?.developmental_assignment?.reference_number ||
        submission?.reference_number ||
        "CAT 2 Assessment";

      onConfirmationRequest("draft", itemName, {
        taskId: submissionId,
        data: submissionData,
        onSuccess: () => {
          refetch();
          refetchDashboard();
          if (selectedSubmissionId) {
            refetchDetails();
          }
          if (modalSuccessHandler) {
            modalSuccessHandler();
          }
          handleModalClose();
        },
      });
    },
    [
      submissionDetails,
      submissionsData,
      onConfirmationRequest,
      refetch,
      refetchDashboard,
      selectedSubmissionId,
      refetchDetails,
      modalSuccessHandler,
      handleModalClose,
    ],
  );

  const handleModalSave = useCallback(
    async (submissionData, mode, submissionId) => {
      const submission =
        submissionDetails?.result ||
        submissionsData.find((sub) => sub.id === submissionId);

      const itemName =
        submission?.developmental_assignment?.reference_number ||
        submission?.reference_number ||
        "CAT 2 Assessment";

      if (mode === "edit") {
        onConfirmationRequest("update", itemName, {
          taskId: submissionId,
          data: submissionData,
          onSuccess: () => {
            refetch();
            refetchDashboard();
            if (selectedSubmissionId) {
              refetchDetails();
            }
            handleModalClose();
          },
        });
        return;
      }

      if (mode === "resubmit") {
        onConfirmationRequest("resubmit", itemName, {
          taskId: submissionId,
          data: submissionData,
          onSuccess: () => {
            refetch();
            refetchDashboard();
            if (modalSuccessHandler) {
              modalSuccessHandler();
            }
            handleModalClose();
          },
        });
        return;
      }

      try {
        await submitCatTwo({
          taskId: submissionId,
          ...submissionData,
        }).unwrap();
        enqueueSnackbar("Assessment submitted successfully!", {
          variant: "success",
          autoHideDuration: 2000,
        });
        refetch();
        refetchDashboard();
        handleModalClose();
      } catch (error) {
        const errorMessage =
          error?.data?.message ||
          "Failed to submit assessment. Please try again.";
        enqueueSnackbar(errorMessage, {
          variant: "error",
          autoHideDuration: 2000,
        });
      }
    },
    [
      refetch,
      refetchDashboard,
      enqueueSnackbar,
      handleModalClose,
      submissionDetails,
      submissionsData,
      submitCatTwo,
      onConfirmationRequest,
      selectedSubmissionId,
      refetchDetails,
      modalSuccessHandler,
    ],
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
    setModalMode(newMode);
  }, []);

  const isLoadingState = queryLoading || isFetching;

  const totalCount = taskData?.result?.total || 0;

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
        <CatTwoTable
          submissionsList={submissionsData}
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
          forReturned={true}
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

      <CatTwoModal
        open={modalOpen}
        onClose={handleModalClose}
        mode={modalMode}
        onModeChange={handleModeChange}
        selectedEntry={submissionDetails?.result || selectedSubmission}
        isLoading={detailsLoading}
        onSave={handleModalSave}
        onSaveAsDraft={handleModalSaveAsDraft}
        onRefreshDetails={handleRefreshDetails}
        onSuccessfulSave={handleModalSuccessCallback}
        forReturned={true}
      />
    </FormProvider>
  );
};

export default CatTwoReturned;
