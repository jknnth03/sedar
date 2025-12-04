import React, { useState, useMemo, useCallback, useEffect } from "react";
import { Box, useTheme } from "@mui/material";
import { FormProvider, useForm } from "react-hook-form";
import { useSnackbar } from "notistack";
import "../../../pages/GeneralStyle.scss";
import {
  useGetDaSubmissionsQuery,
  useLazyGetSingleDaSubmissionQuery,
  useUpdateDaMutation,
} from "../../../features/api/forms/daformApi";
import DAFormTable from "./DAFormTable";
import { useRememberQueryParams } from "../../../hooks/useRememberQueryParams";
import DAFormModal from "../../../components/modal/form/DAForm/DAFormModal";
import {
  useResubmitFormSubmissionMutation,
  useCancelFormSubmissionMutation,
} from "../../../features/api/approvalsetting/formSubmissionApi";
import CustomTablePagination from "../../zzzreusable/CustomTablePagination";

const DAFormMDAForApproval = ({
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
  const [modalLoading, setModalLoading] = useState(false);

  const methods = useForm({
    defaultValues: {},
  });

  const [updateDaSubmission] = useUpdateDaMutation();
  const [resubmitDaSubmission] = useResubmitFormSubmissionMutation();
  const [cancelDaSubmission] = useCancelFormSubmissionMutation();

  const apiQueryParams = useMemo(() => {
    return {
      page: page,
      per_page: rowsPerPage,
      status: "active",
      approval_status: "MDA IN PROGRESS",
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
    async (formData, mode) => {
      try {
        console.log("Saving DA Form submission:", formData, mode);

        if (mode === "edit" && selectedSubmissionId) {
          const response = await updateDaSubmission({
            id: selectedSubmissionId,
            data: formData,
          }).unwrap();

          enqueueSnackbar("DA Form submission updated successfully", {
            variant: "success",
          });

          await handleRefreshDetails();
          await refetch();

          handleModalClose();
        }
      } catch (error) {
        console.error("Error saving DA Form submission:", error);
        enqueueSnackbar(
          error?.data?.message || "Failed to update DA Form submission",
          {
            variant: "error",
          }
        );
      }
    },
    [
      selectedSubmissionId,
      updateDaSubmission,
      enqueueSnackbar,
      handleRefreshDetails,
      refetch,
      handleModalClose,
    ]
  );

  const handleResubmit = useCallback(
    async (submissionId) => {
      try {
        console.log("Resubmitting DA Form submission:", submissionId);

        await resubmitDaSubmission(submissionId).unwrap();

        enqueueSnackbar("DA Form submission resubmitted successfully", {
          variant: "success",
          autoHideDuration: 2000,
        });

        await handleRefreshDetails();
        await refetch();
      } catch (error) {
        console.error("Error resubmitting DA Form submission:", error);
        enqueueSnackbar(
          error?.data?.message || "Failed to resubmit DA Form submission",
          {
            variant: "error",
            autoHideDuration: 2000,
          }
        );
      }
    },
    [resubmitDaSubmission, enqueueSnackbar, handleRefreshDetails, refetch]
  );

  const handleCancel = useCallback(
    async (submissionId) => {
      try {
        console.log("Cancelling DA Form submission:", submissionId);

        await cancelDaSubmission(submissionId).unwrap();

        enqueueSnackbar("DA Form submission cancelled successfully", {
          variant: "success",
          autoHideDuration: 2000,
        });

        await refetch();

        return true;
      } catch (error) {
        console.error("Error cancelling DA Form submission:", error);

        let errorMessage = "Failed to cancel DA Form submission";
        if (error?.data?.message) {
          errorMessage = error.data.message;
        } else if (error?.message) {
          errorMessage = error.message;
        }

        enqueueSnackbar(errorMessage, {
          variant: "error",
          autoHideDuration: 3000,
        });

        return false;
      }
    },
    [cancelDaSubmission, enqueueSnackbar, refetch]
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

  const isLoadingState = queryLoading || isFetching;

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
        <DAFormTable
          submissionsList={paginatedSubmissions}
          isLoadingState={isLoadingState}
          error={error}
          handleRowClick={handleRowClick}
          handleMenuOpen={handleMenuOpen}
          handleMenuClose={handleMenuClose}
          menuAnchor={menuAnchor}
          searchQuery={searchQuery}
          statusFilter="MDA FOR APPROVAL"
          onCancel={handleCancel}
        />

        <CustomTablePagination
          count={filteredSubmissions.length}
          page={Math.max(0, page - 1)}
          rowsPerPage={rowsPerPage}
          onPageChange={handlePageChange}
          onRowsPerPageChange={handleRowsPerPageChange}
        />
      </Box>

      <DAFormModal
        open={modalOpen}
        onClose={handleModalClose}
        onSave={handleSave}
        onResubmit={handleResubmit}
        selectedEntry={submissionDetails}
        isLoading={modalLoading || detailsLoading}
        mode={modalMode}
        submissionId={selectedSubmissionId}
      />
    </FormProvider>
  );
};

export default DAFormMDAForApproval;
