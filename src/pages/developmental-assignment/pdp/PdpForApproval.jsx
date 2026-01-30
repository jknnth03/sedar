import React, { useState, useMemo, useCallback, useEffect } from "react";
import { Box, useTheme } from "@mui/material";
import { FormProvider, useForm } from "react-hook-form";
import { useSnackbar } from "notistack";
import "../../../pages/GeneralStyle.scss";
import {
  useGetPdpListQuery,
  useSubmitPdpMutation,
} from "../../../features/api/da-task/pdpApi";
import { useShowDashboardQuery } from "../../../features/api/usermanagement/dashboardApi";
import { useRememberQueryParams } from "../../../hooks/useRememberQueryParams";
import PdpTable from "./PdpTable";
import CustomTablePagination from "../../zzzreusable/CustomTablePagination";
import ConfirmationDialog from "../../../styles/ConfirmationDialog";

const PdpForApproval = ({
  searchQuery,
  dateFilters,
  onRowClick,
  onApprove: onApproveFromParent,
  onReject: onRejectFromParent,
}) => {
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();

  const [queryParams, setQueryParams] = useRememberQueryParams();

  const [page, setPage] = useState(parseInt(queryParams?.page) || 1);
  const [rowsPerPage, setRowsPerPage] = useState(
    parseInt(queryParams?.rowsPerPage) || 10,
  );

  const [menuAnchor, setMenuAnchor] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [selectedSubmissionForAction, setSelectedSubmissionForAction] =
    useState(null);

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
      status: "FOR_APPROVAL",
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
    data: taskData,
    isLoading: queryLoading,
    isFetching,
    refetch,
    error,
  } = useGetPdpListQuery(apiQueryParams, {
    refetchOnMountOrArgChange: true,
    skip: false,
  });

  const { refetch: refetchDashboard } = useShowDashboardQuery();

  const [submitPdp] = useSubmitPdpMutation();

  const submissionsData = useMemo(() => {
    if (!taskData?.result) return [];

    const result = taskData.result;

    if (result.data && Array.isArray(result.data)) {
      return result.data;
    }

    if (Array.isArray(result)) {
      return result;
    }

    return [];
  }, [taskData]);

  const handleRowClick = useCallback(
    (submission) => {
      if (onRowClick) {
        onRowClick(submission);
      }
    },
    [onRowClick],
  );

  const handleViewSubmission = useCallback(
    (submission) => {
      setMenuAnchor({});
      if (onRowClick) {
        onRowClick(submission);
      }
    },
    [onRowClick],
  );

  const handleApproveSubmission = useCallback(
    async (submissionId) => {
      const submission = submissionsData.find((sub) => sub.id === submissionId);
      if (submission) {
        setSelectedSubmissionForAction(submission);
        setConfirmAction("approve");
        setConfirmOpen(true);
      } else {
        enqueueSnackbar("Submission not found. Please try again.", {
          variant: "error",
          autoHideDuration: 2000,
        });
      }
    },
    [submissionsData, enqueueSnackbar],
  );

  const handleRejectSubmission = useCallback(
    async (submissionId) => {
      const submission = submissionsData.find((sub) => sub.id === submissionId);
      if (submission) {
        setSelectedSubmissionForAction(submission);
        setConfirmAction("reject");
        setConfirmOpen(true);
      } else {
        enqueueSnackbar("Submission not found. Please try again.", {
          variant: "error",
          autoHideDuration: 2000,
        });
      }
    },
    [submissionsData, enqueueSnackbar],
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

  const handleActionConfirm = async () => {
    if (!confirmAction || !selectedSubmissionForAction) return;

    setIsLoading(true);

    try {
      const payload = {
        id: selectedSubmissionForAction.id,
        data: {
          status: confirmAction === "approve" ? "APPROVED" : "REJECTED",
        },
      };

      await submitPdp(payload).unwrap();

      enqueueSnackbar(
        `PDP submission ${
          confirmAction === "approve" ? "approved" : "rejected"
        } successfully!`,
        {
          variant: "success",
          autoHideDuration: 2000,
        },
      );

      refetch();
      refetchDashboard();

      if (confirmAction === "approve" && onApproveFromParent) {
        onApproveFromParent(selectedSubmissionForAction.id);
      } else if (confirmAction === "reject" && onRejectFromParent) {
        onRejectFromParent(selectedSubmissionForAction.id);
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
      selectedSubmissionForAction?.developmental_assignment?.reference_number ||
      selectedSubmissionForAction?.data_change?.reference_number ||
      selectedSubmissionForAction?.reference_number ||
      "PDP Submission";
    return submissionForAction;
  }, [selectedSubmissionForAction]);

  const isLoadingState = queryLoading || isFetching || isLoading;

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
        <PdpTable
          submissionsList={submissionsData}
          isLoadingState={isLoadingState}
          error={error}
          handleRowClick={handleRowClick}
          handleMenuOpen={handleMenuOpen}
          handleMenuClose={handleMenuClose}
          handleViewSubmission={handleViewSubmission}
          menuAnchor={menuAnchor}
          searchQuery={searchQuery}
          selectedFilters={[]}
          showArchived={false}
          hideStatusColumn={false}
        />

        <CustomTablePagination
          count={totalCount}
          page={Math.max(0, page - 1)}
          rowsPerPage={rowsPerPage}
          onPageChange={handlePageChange}
          onRowsPerPageChange={handleRowsPerPageChange}
        />
      </Box>

      <ConfirmationDialog
        open={confirmOpen}
        onClose={handleConfirmationCancel}
        onConfirm={handleActionConfirm}
        isLoading={isLoading}
        action={confirmAction}
        itemName={getSubmissionDisplayName()}
        module="PDP Submission"
      />
    </FormProvider>
  );
};

export default PdpForApproval;
