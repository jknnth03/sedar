import React, { useState, useMemo, useCallback, useEffect } from "react";
import { Box } from "@mui/material";
import { FormProvider, useForm } from "react-hook-form";
import { useSnackbar } from "notistack";
import "../../../pages/GeneralStyle.scss";
import {
  useGetDataChangeSubmissionsQuery,
  useGetDataChangeSubmissionDetailsQuery,
  useCreateDataChangeSubmissionMutation,
  useUpdateDataChangeSubmissionMutation,
  useResubmitDataChangeSubmissionMutation,
} from "../../../features/api/forms/datachangeApi";
import { useShowDashboardQuery } from "../../../features/api/usermanagement/dashboardApi";
import { useCancelFormSubmissionMutation } from "../../../features/api/approvalsetting/formSubmissionApi";
import { useRememberQueryParams } from "../../../hooks/useRememberQueryParams";
import DataChangeForapprovalTable from "./DataChangeForapprovalTable";
import DataChangeModal from "../../../components/modal/form/DataChange/DataChangeModal";
import ConfirmationDialog from "../../../styles/ConfirmationDialog";
import CustomTablePagination from "../../zzzreusable/CustomTablePagination";

const DataChangeRejected = ({
  searchQuery,
  dateFilters,
  filterDataByDate,
  filterDataBySearch,
}) => {
  const { enqueueSnackbar } = useSnackbar();

  const [queryParams, setQueryParams] = useRememberQueryParams();

  const [page, setPage] = useState(parseInt(queryParams?.page) || 1);
  const [rowsPerPage, setRowsPerPage] = useState(
    parseInt(queryParams?.rowsPerPage) || 10
  );
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("view");
  const [selectedSubmissionId, setSelectedSubmissionId] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [selectedSubmissionForAction, setSelectedSubmissionForAction] =
    useState(null);
  const [pendingFormData, setPendingFormData] = useState(null);
  const [modalSuccessHandler, setModalSuccessHandler] = useState(null);

  const handleModalSuccessCallback = useCallback((successHandler) => {
    setModalSuccessHandler(() => successHandler);
  }, []);

  const methods = useForm({
    defaultValues: {
      reason_for_change: "",
      employee_id: null,
      new_position_id: null,
      remarks: "",
    },
  });

  const apiQueryParams = useMemo(() => {
    return {
      page: page,
      per_page: rowsPerPage,
      status: "active",
      pagination: 1,
      approval_status: "rejected",
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
  } = useGetDataChangeSubmissionsQuery(apiQueryParams, {
    refetchOnMountOrArgChange: true,
    skip: false,
  });

  const { refetch: refetchDashboard } = useShowDashboardQuery();

  const {
    data: submissionDetails,
    isLoading: detailsLoading,
    refetch: refetchDetails,
  } = useGetDataChangeSubmissionDetailsQuery(selectedSubmissionId, {
    skip: !selectedSubmissionId,
    refetchOnMountOrArgChange: true,
  });

  const [createDataChangeSubmission] = useCreateDataChangeSubmissionMutation();
  const [updateDataChangeSubmission] = useUpdateDataChangeSubmissionMutation();
  const [resubmitDataChangeSubmission] =
    useResubmitDataChangeSubmissionMutation();
  const [cancelDataChangeSubmission] = useCancelFormSubmissionMutation();

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

  const handleRowClick = useCallback((submission) => {
    setModalMode("view");
    setSelectedSubmissionId(submission.id);
    setMenuAnchor({});
    setModalOpen(true);
  }, []);

  const handleEditSubmission = useCallback((submission) => {
    setSelectedSubmissionId(submission.id);
    setMenuAnchor({});
    setModalMode("edit");
    setModalOpen(true);
  }, []);

  const handleResubmitSubmission = useCallback((submission) => {
    setSelectedSubmissionId(submission.id);
    setMenuAnchor({});
    setModalMode("resubmit");
    setModalOpen(true);
  }, []);

  const handleCancelSubmission = useCallback(
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

  const handleModalClose = useCallback(() => {
    setModalOpen(false);
    setSelectedSubmissionId(null);
    setModalLoading(false);
    setModalMode("view");
  }, []);

  const handleRefreshDetails = useCallback(() => {
    if (selectedSubmissionId && refetchDetails) {
      refetchDetails();
    }
  }, [selectedSubmissionId, refetchDetails]);

  const handleModalSave = useCallback(
    async (submissionData, mode, submissionId) => {
      if (mode === "create") {
        setPendingFormData(submissionData);
        setConfirmAction("create");
        setConfirmOpen(true);
        return;
      }

      if (mode === "edit") {
        const submission =
          submissionDetails?.result ||
          filteredSubmissions.find((sub) => sub.id === submissionId);

        setSelectedSubmissionForAction(submission);
        setPendingFormData(submissionData);
        setConfirmAction("update");
        setConfirmOpen(true);
        return;
      }

      if (mode === "resubmit") {
        const submission =
          submissionDetails?.result ||
          filteredSubmissions.find((sub) => sub.id === submissionId);

        setSelectedSubmissionForAction(submission);
        setPendingFormData(submissionData);
        setConfirmAction("resubmit");
        setConfirmOpen(true);
        return;
      }

      try {
        await resubmitDataChangeSubmission(submissionData).unwrap();
        enqueueSnackbar("Submission processed successfully!", {
          variant: "success",
          autoHideDuration: 2000,
        });
        refetch();
        refetchDashboard();
        handleModalClose();
      } catch (error) {
        const errorMessage =
          error?.data?.message ||
          "Failed to save submission. Please try again.";
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
      filteredSubmissions,
      resubmitDataChangeSubmission,
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
    setModalMode(newMode);
  }, []);

  const handleActionConfirm = async () => {
    if (!confirmAction) return;

    setIsLoading(true);

    try {
      if (confirmAction === "cancel" && selectedSubmissionForAction) {
        await cancelDataChangeSubmission(
          selectedSubmissionForAction.id
        ).unwrap();
        enqueueSnackbar("Data change submission cancelled successfully!", {
          variant: "success",
          autoHideDuration: 2000,
        });
        refetch();
        refetchDashboard();
      } else if (confirmAction === "create" && pendingFormData) {
        await createDataChangeSubmission(pendingFormData).unwrap();
        enqueueSnackbar("Data change submission created successfully!", {
          variant: "success",
          autoHideDuration: 2000,
        });
        refetch();
        refetchDashboard();
        handleModalClose();
      } else if (
        confirmAction === "update" &&
        pendingFormData &&
        selectedSubmissionForAction
      ) {
        await updateDataChangeSubmission({
          id: selectedSubmissionForAction.id,
          data: pendingFormData,
        }).unwrap();

        enqueueSnackbar("Data change submission updated successfully!", {
          variant: "success",
          autoHideDuration: 2000,
        });
        refetch();
        refetchDashboard();
        handleModalClose();
      } else if (
        confirmAction === "resubmit" &&
        pendingFormData &&
        selectedSubmissionForAction
      ) {
        await resubmitDataChangeSubmission({
          id: selectedSubmissionForAction.id,
          data: pendingFormData,
        }).unwrap();
        enqueueSnackbar("Data change submission resubmitted successfully!", {
          variant: "success",
          autoHideDuration: 2000,
        });
        refetch();
        refetchDashboard();
        handleModalClose();
        if (modalSuccessHandler) {
          modalSuccessHandler();
        }
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
      selectedSubmissionForAction?.reference_number || "Data Change Request";
    return submissionForAction;
  }, [selectedSubmissionForAction]);

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
        <DataChangeForapprovalTable
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
          hideStatusColumn={true}
          forApproval={true}
          onCancel={handleCancelSubmission}
          onUpdate={handleEditSubmission}
          onResubmit={handleResubmitSubmission}
        />

        <CustomTablePagination
          count={filteredSubmissions.length}
          page={Math.max(0, page - 1)}
          rowsPerPage={rowsPerPage}
          onPageChange={handlePageChange}
          onRowsPerPageChange={handleRowsPerPageChange}
        />
      </Box>

      <DataChangeModal
        open={modalOpen}
        onClose={handleModalClose}
        mode={modalMode}
        onModeChange={handleModeChange}
        selectedEntry={submissionDetails}
        isLoading={modalLoading || detailsLoading}
        onSave={handleModalSave}
        onRefreshDetails={handleRefreshDetails}
        onSuccessfulSave={handleModalSuccessCallback}
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

export default DataChangeRejected;
