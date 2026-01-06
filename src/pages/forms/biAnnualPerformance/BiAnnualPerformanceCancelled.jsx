import React, { useState, useMemo, useCallback, useEffect } from "react";
import { Box } from "@mui/material";
import { FormProvider, useForm } from "react-hook-form";
import { useSnackbar } from "notistack";
import "../../../pages/GeneralStyle.scss";
import {
  useGetPerformanceEvaluationsQuery,
  useGetSinglePerformanceEvaluationQuery,
  useCreatePerformanceEvaluationMutation,
  useUpdatePerformanceEvaluationMutation,
  useResubmitPerformanceEvaluationMutation,
  useCancelPerformanceEvaluationMutation,
} from "../../../features/api/forms/biAnnualPerformanceApi";
import BiAnnualPerformanceTable from "./BiAnnualPerformanceTable";
import { useRememberQueryParams } from "../../../hooks/useRememberQueryParams";
import BiAnnualPerformanceModal from "../../../components/modal/form/BiAnnualPerformanceModal/BiAnnualPerformanceModal";
import ConfirmationDialog from "../../../styles/ConfirmationDialog";
import CustomTablePagination from "../../zzzreusable/CustomTablePagination";

const BiAnnualPerformanceCancelled = ({
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
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [selectedSubmissionId, setSelectedSubmissionId] = useState(null);
  const [menuAnchor, setMenuAnchor] = useState({});
  const [modalMode, setModalMode] = useState("view");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [selectedSubmissionForAction, setSelectedSubmissionForAction] =
    useState(null);
  const [pendingFormData, setPendingFormData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const methods = useForm({
    defaultValues: {},
  });

  const [createPerformanceEvaluation] =
    useCreatePerformanceEvaluationMutation();
  const [updatePerformanceEvaluation] =
    useUpdatePerformanceEvaluationMutation();
  const [resubmitPerformanceEvaluation] =
    useResubmitPerformanceEvaluationMutation();
  const [cancelPerformanceEvaluation] =
    useCancelPerformanceEvaluationMutation();

  const apiQueryParams = useMemo(() => {
    return {
      page: page,
      per_page: rowsPerPage,
      status: "active",
      approval_status: "CANCELLED",
      pagination: true,
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
  } = useGetPerformanceEvaluationsQuery(apiQueryParams, {
    refetchOnMountOrArgChange: true,
    skip: false,
  });

  const {
    data: submissionDetails,
    isLoading: detailsLoading,
    refetch: refetchDetails,
  } = useGetSinglePerformanceEvaluationQuery(selectedSubmissionId, {
    skip: !selectedSubmissionId,
    refetchOnMountOrArgChange: true,
  });

  const submissionsList = useMemo(() => {
    const data = submissionsData?.result?.data || [];
    return data;
  }, [submissionsData]);

  const handleRowClick = useCallback((submission) => {
    setSelectedSubmissionId(submission.id);
    setMenuAnchor({});
    setModalMode("view");
    setModalOpen(true);
  }, []);

  useEffect(() => {
    if (submissionDetails?.result && modalOpen) {
      setSelectedEntry(submissionDetails.result);
    }
  }, [submissionDetails, modalOpen]);

  const handleModalClose = useCallback(() => {
    setModalOpen(false);
    setSelectedEntry(null);
    setSelectedSubmissionId(null);
    setModalMode("view");
  }, []);

  const handleSave = useCallback(
    async (formData, mode) => {
      if (mode === "create") {
        setIsLoading(true);
        try {
          await createPerformanceEvaluation(formData).unwrap();
          enqueueSnackbar("Performance Evaluation created successfully", {
            variant: "success",
            autoHideDuration: 2000,
          });
          refetch();
          handleModalClose();
        } catch (error) {
          const errorMessage =
            error?.data?.message ||
            "Failed to create Performance Evaluation. Please try again.";
          enqueueSnackbar(errorMessage, {
            variant: "error",
            autoHideDuration: 2000,
          });
        } finally {
          setIsLoading(false);
        }
      } else if (mode === "edit" && selectedSubmissionId) {
        const submission =
          submissionDetails?.result ||
          submissionsList.find((sub) => sub.id === selectedSubmissionId);
        setSelectedSubmissionForAction(submission);
        setPendingFormData(formData);
        setConfirmAction("update");
        setConfirmOpen(true);
      }
    },
    [
      selectedSubmissionId,
      submissionDetails,
      submissionsList,
      createPerformanceEvaluation,
      refetch,
      handleModalClose,
      enqueueSnackbar,
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
      setIsLoading(true);
      try {
        await cancelPerformanceEvaluation(submissionId).unwrap();
        enqueueSnackbar("Performance Evaluation cancelled successfully", {
          variant: "success",
          autoHideDuration: 2000,
        });
        refetch();
        return true;
      } catch (error) {
        const errorMessage =
          error?.data?.message ||
          "Failed to cancel submission. Please try again.";
        enqueueSnackbar(errorMessage, {
          variant: "error",
          autoHideDuration: 2000,
        });
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [cancelPerformanceEvaluation, enqueueSnackbar, refetch]
  );

  const handleActionConfirm = async () => {
    if (!confirmAction) return;

    setIsLoading(true);

    try {
      if (
        confirmAction === "update" &&
        pendingFormData &&
        selectedSubmissionId
      ) {
        await updatePerformanceEvaluation({
          id: selectedSubmissionId,
          data: pendingFormData,
        }).unwrap();
        enqueueSnackbar("Performance Evaluation updated successfully", {
          variant: "success",
          autoHideDuration: 2000,
        });
        await refetchDetails();
        await refetch();
        handleModalClose();
      } else if (confirmAction === "resubmit" && selectedSubmissionForAction) {
        await resubmitPerformanceEvaluation(
          selectedSubmissionForAction.id
        ).unwrap();
        enqueueSnackbar("Performance Evaluation resubmitted successfully", {
          variant: "success",
          autoHideDuration: 2000,
        });
        await refetchDetails();
        await refetch();
      }
    } catch (error) {
      const errorMessage =
        error?.data?.message ||
        `Failed to ${confirmAction} submission. Please try again.`;
      enqueueSnackbar(errorMessage, {
        variant: "error",
        autoHideDuration: 2000,
      });
    } finally {
      setConfirmOpen(false);
      setSelectedSubmissionForAction(null);
      setConfirmAction(null);
      setPendingFormData(null);
      setIsLoading(false);
    }
  };

  const handleConfirmationCancel = useCallback(() => {
    setConfirmOpen(false);
    setSelectedSubmissionForAction(null);
    setConfirmAction(null);
    setPendingFormData(null);
  }, []);

  const getSubmissionDisplayName = useCallback(() => {
    const submissionForAction =
      selectedSubmissionForAction?.reference_number || "Performance Evaluation";
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
        <BiAnnualPerformanceTable
          submissionsList={submissionsList}
          isLoadingState={isLoadingState}
          error={error}
          handleRowClick={handleRowClick}
          handleMenuOpen={handleMenuOpen}
          handleMenuClose={handleMenuClose}
          menuAnchor={menuAnchor}
          searchQuery={searchQuery}
          statusFilter="CANCELLED"
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

      <BiAnnualPerformanceModal
        open={modalOpen}
        onClose={handleModalClose}
        onSave={handleSave}
        onResubmit={handleResubmit}
        selectedEntry={selectedEntry}
        isLoading={detailsLoading || isLoading}
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

export default BiAnnualPerformanceCancelled;
