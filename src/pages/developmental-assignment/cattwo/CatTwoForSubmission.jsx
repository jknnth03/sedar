import React, { useState, useMemo, useCallback, useEffect } from "react";
import { Typography, Box, useTheme } from "@mui/material";
import { FormProvider, useForm } from "react-hook-form";
import { useSnackbar } from "notistack";
import "../../../pages/GeneralStyle.scss";
import {
  useGetCatTwoTasksQuery,
  useGetCatTwoTaskByIdQuery,
  useSaveCatTwoAsDraftMutation,
  useSubmitCatTwoMutation,
} from "../../../features/api/da-task/catTwoApi";
import CatTwoTable from "./CatTwoTable";
import CatTwoModal from "../../../components/modal/da-task/CatTwoModal";
import CustomTablePagination from "../../zzzreusable/CustomTablePagination";
import { useCancelFormSubmissionMutation } from "../../../features/api/approvalsetting/formSubmissionApi";

const CatTwoForSubmission = ({
  searchQuery,
  dateFilters,
  filterDataByDate,
  filterDataBySearch,
  setQueryParams,
  currentParams,
  data,
  isLoading: externalIsLoading,
  page: externalPage,
  rowsPerPage: externalRowsPerPage,
  onPageChange,
  onRowsPerPageChange,
  onConfirmationRequest,
}) => {
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();

  const [page, setPage] = useState(
    externalPage || parseInt(currentParams?.page) || 1
  );
  const [rowsPerPage, setRowsPerPage] = useState(
    externalRowsPerPage || parseInt(currentParams?.rowsPerPage) || 10
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

  useEffect(() => {
    if (externalPage !== undefined) {
      setPage(externalPage);
    }
  }, [externalPage]);

  useEffect(() => {
    if (externalRowsPerPage !== undefined) {
      setRowsPerPage(externalRowsPerPage);
    }
  }, [externalRowsPerPage]);

  useEffect(() => {
    const newPage = 1;
    setPage(newPage);
    if (onPageChange) {
      onPageChange(newPage);
    }
  }, [searchQuery, dateFilters]);

  const {
    data: taskData,
    isLoading: queryLoading,
    isFetching,
    refetch,
    error,
  } = useGetCatTwoTasksQuery(
    {
      pagination: 1,
      page: page,
      per_page: rowsPerPage,
      status: "FOR_SUBMISSION",
    },
    {
      refetchOnMountOrArgChange: true,
      skip: false,
    }
  );

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
    const dataSource = data || taskData;
    if (!dataSource?.result) return [];

    const result = dataSource.result;

    if (result.data && Array.isArray(result.data)) {
      return result.data.filter((item) => item.status === "FOR_SUBMISSION");
    }

    if (Array.isArray(result)) {
      return result.filter((item) => item.status === "FOR_SUBMISSION");
    }

    if (result.status === "FOR_SUBMISSION") {
      return [result];
    }

    return [];
  }, [data, taskData]);

  const totalCount = useMemo(() => {
    const dataSource = data || taskData;
    if (dataSource?.result?.total) {
      return dataSource.result.total;
    }
    return submissionsData.length;
  }, [data, taskData, submissionsData.length]);

  const filteredSubmissions = useMemo(() => {
    let filtered = submissionsData;

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
      const submission = filteredSubmissions.find(
        (sub) => sub.id === submissionId
      );
      if (submission) {
        const itemName =
          submission?.developmental_assignment?.reference_number ||
          submission?.reference_number ||
          "CAT 2 Assessment";

        onConfirmationRequest("cancel", itemName, {
          taskId: submissionId,
          onSuccess: () => {
            refetch();
          },
        });
      } else {
        enqueueSnackbar("Submission not found. Please try again.", {
          variant: "error",
          autoHideDuration: 2000,
        });
      }
    },
    [filteredSubmissions, enqueueSnackbar, onConfirmationRequest, refetch]
  );

  const handleModalClose = useCallback(() => {
    setModalOpen(false);
    setSelectedSubmissionId(null);
    setSelectedSubmission(null);
    setModalMode("view");
  }, []);

  const handleRefreshDetails = useCallback(() => {
    refetch();
    if (selectedSubmissionId) {
      refetchDetails();
    }
  }, [refetch, refetchDetails, selectedSubmissionId]);

  const handleModalSaveAsDraft = useCallback(
    async (submissionData, submissionId) => {
      const submission =
        submissionDetails?.result ||
        filteredSubmissions.find((sub) => sub.id === submissionId);

      const itemName =
        submission?.developmental_assignment?.reference_number ||
        submission?.reference_number ||
        "CAT 2 Assessment";

      onConfirmationRequest("draft", itemName, {
        taskId: submissionId,
        data: submissionData,
        onSuccess: () => {
          refetch();
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
      filteredSubmissions,
      onConfirmationRequest,
      refetch,
      selectedSubmissionId,
      refetchDetails,
      modalSuccessHandler,
      handleModalClose,
    ]
  );

  const handleModalSave = useCallback(
    async (submissionData, mode, submissionId) => {
      const submission =
        submissionDetails?.result ||
        filteredSubmissions.find((sub) => sub.id === submissionId);

      const itemName =
        submission?.developmental_assignment?.reference_number ||
        submission?.reference_number ||
        "CAT 2 Assessment";

      onConfirmationRequest("submit", itemName, {
        taskId: submissionId,
        data: submissionData,
        onSuccess: () => {
          refetch();
          if (modalSuccessHandler) {
            modalSuccessHandler();
          }
          handleModalClose();
        },
      });
    },
    [
      submissionDetails,
      filteredSubmissions,
      onConfirmationRequest,
      refetch,
      modalSuccessHandler,
      handleModalClose,
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
      if (onPageChange) {
        onPageChange(targetPage);
      }
      if (setQueryParams) {
        setQueryParams(
          {
            ...currentParams,
            page: targetPage,
            rowsPerPage: rowsPerPage,
          },
          { retain: false }
        );
      }
    },
    [onPageChange, setQueryParams, rowsPerPage, currentParams]
  );

  const handleRowsPerPageChange = useCallback(
    (event) => {
      const newRowsPerPage = parseInt(event.target.value, 10);
      const newPage = 1;
      setRowsPerPage(newRowsPerPage);
      setPage(newPage);
      if (onRowsPerPageChange) {
        onRowsPerPageChange(newRowsPerPage);
      }
      if (onPageChange) {
        onPageChange(newPage);
      }
      if (setQueryParams) {
        setQueryParams(
          {
            ...currentParams,
            page: newPage,
            rowsPerPage: newRowsPerPage,
          },
          { retain: false }
        );
      }
    },
    [onPageChange, onRowsPerPageChange, setQueryParams, currentParams]
  );

  const handleModeChange = useCallback((newMode) => {
    setModalMode(newMode);
  }, []);

  const isLoadingState =
    externalIsLoading !== undefined
      ? externalIsLoading
      : queryLoading || isFetching;

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
          forSubmission={true}
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
      />
    </FormProvider>
  );
};

export default CatTwoForSubmission;
