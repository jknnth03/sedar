import React, { useState, useMemo, useCallback, useEffect } from "react";
import { Box } from "@mui/material";
import { FormProvider, useForm } from "react-hook-form";
import { useSnackbar } from "notistack";
import "../../../pages/GeneralStyle.scss";
import {
  useGetProbationaryEvaluationsQuery,
  useGetSingleProbationaryEvaluationQuery,
  useUpdateProbationaryEvaluationMutation,
} from "../../../features/api/forms/evaluationFormApi";
import EvaluationFormTable from "./EvaluationFormTable";
import { useRememberQueryParams } from "../../../hooks/useRememberQueryParams";
import EvaluationFormModal from "../../../components/modal/form/EvaluationForm/EvaluationFormModal";
import { useResubmitFormSubmissionMutation } from "../../../features/api/approvalsetting/formSubmissionApi";
import ConfirmationDialog from "../../../styles/ConfirmationDialog";
import CustomTablePagination from "../../zzzreusable/CustomTablePagination";

const EvaluationFormForApproval = ({ searchQuery, dateFilters, onCancel }) => {
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

  const [updateProbationaryEvaluation] =
    useUpdateProbationaryEvaluationMutation();
  const [resubmitProbationaryEvaluation] = useResubmitFormSubmissionMutation();

  const apiQueryParams = useMemo(() => {
    return {
      page: page,
      per_page: rowsPerPage,
      status: "active",
      approval_status: "PENDING",
      pagination: true,
      search: searchQuery || "",
      start_date: dateFilters?.start_date,
      end_date: dateFilters?.end_date,
    };
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
  } = useGetProbationaryEvaluationsQuery(apiQueryParams, {
    refetchOnMountOrArgChange: true,
    skip: false,
  });

  const {
    data: submissionDetails,
    isLoading: detailsLoading,
    refetch: refetchDetails,
  } = useGetSingleProbationaryEvaluationQuery(selectedSubmissionId, {
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
      if (mode === "edit" && selectedSubmissionId) {
        const submission =
          submissionDetails?.result ||
          submissionsList.find((sub) => sub.id === selectedSubmissionId);
        setSelectedSubmissionForAction(submission);
        setPendingFormData(formData);
        setConfirmAction("update");
        setConfirmOpen(true);
      }
    },
    [selectedSubmissionId, submissionDetails, submissionsList]
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

  const handleCancelSubmission = useCallback(() => {
    refetch();
  }, [refetch]);

  const handleActionConfirm = async () => {
    if (!confirmAction) return;

    setIsLoading(true);

    try {
      if (
        confirmAction === "update" &&
        pendingFormData &&
        selectedSubmissionId
      ) {
        await updateProbationaryEvaluation({
          id: selectedSubmissionId,
          data: pendingFormData,
        }).unwrap();
        enqueueSnackbar("Probationary Evaluation updated successfully", {
          variant: "success",
          autoHideDuration: 2000,
        });
        await refetchDetails();
        await refetch();
        handleModalClose();
      } else if (confirmAction === "resubmit" && selectedSubmissionForAction) {
        await resubmitProbationaryEvaluation(
          selectedSubmissionForAction.id
        ).unwrap();
        enqueueSnackbar("Probationary Evaluation resubmitted successfully", {
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
      selectedSubmissionForAction?.reference_number ||
      "Probationary Evaluation";
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
        <EvaluationFormTable
          submissionsList={submissionsList}
          isLoadingState={isLoadingState}
          error={error}
          handleRowClick={handleRowClick}
          handleMenuOpen={handleMenuOpen}
          handleMenuClose={handleMenuClose}
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

      <EvaluationFormModal
        open={modalOpen}
        onClose={handleModalClose}
        onSave={handleSave}
        onResubmit={handleResubmit}
        selectedEntry={selectedEntry}
        isLoading={detailsLoading}
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

export default EvaluationFormForApproval;
