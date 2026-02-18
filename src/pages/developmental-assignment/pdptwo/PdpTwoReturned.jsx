import React, { useState, useMemo, useCallback, useEffect } from "react";
import { Box, useTheme } from "@mui/material";
import { FormProvider, useForm } from "react-hook-form";
import { useSnackbar } from "notistack";
import "../../../pages/GeneralStyle.scss";
import {
  useGetPdpTwoListQuery,
  useSubmitPdpTwoMutation,
} from "../../../features/api/da-task/pdpTwoApi";
import { useShowDashboardQuery } from "../../../features/api/usermanagement/dashboardApi";
import { useRememberQueryParams } from "../../../hooks/useRememberQueryParams";
import PdpTwoTable from "./PdpTwoTable";
import CustomTablePagination from "../../zzzreusable/CustomTablePagination";
import ConfirmationDialog from "../../../styles/ConfirmationDialog";

const PdpTwoReturned = ({
  searchQuery,
  dateFilters,
  onRowClick,
  onCancel: onCancelFromParent,
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
      status: "RETURNED",
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
  } = useGetPdpTwoListQuery(apiQueryParams, {
    refetchOnMountOrArgChange: true,
    skip: false,
  });

  const { refetch: refetchDashboard } = useShowDashboardQuery();

  const [submitPdpTwo] = useSubmitPdpTwoMutation();

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
          status: confirmAction === "cancel" ? "CANCELLED" : undefined,
        },
      };

      await submitPdpTwo(payload).unwrap();

      enqueueSnackbar(`PDP 2 submission ${confirmAction}ed successfully!`, {
        variant: "success",
        autoHideDuration: 2000,
      });

      refetch();
      refetchDashboard();

      if (confirmAction === "cancel" && onCancelFromParent) {
        onCancelFromParent(selectedSubmissionForAction.id);
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
      "PDP 2 Submission";
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
        <PdpTwoTable
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
        module="PDP 2 Submission"
      />
    </FormProvider>
  );
};

export default PdpTwoReturned;
