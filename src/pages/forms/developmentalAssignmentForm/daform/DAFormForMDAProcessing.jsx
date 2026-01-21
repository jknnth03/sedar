import React, { useState, useMemo, useCallback, useEffect } from "react";
import { Box } from "@mui/material";
import { FormProvider, useForm } from "react-hook-form";
import { useSnackbar } from "notistack";
import "../../../../pages/GeneralStyle.scss";
import {
  useGetDaSubmissionsQuery,
  useGetSingleDaSubmissionQuery,
  useUpdateDaMutation,
} from "../../../../features/api/forms/daformApi";
import DAFormTable from "./DAFormTable";
import { useRememberQueryParams } from "../../../../hooks/useRememberQueryParams";
import {
  useResubmitFormSubmissionMutation,
  useCancelFormSubmissionMutation,
} from "../../../../features/api/approvalsetting/formSubmissionApi";
import CustomTablePagination from "../../../zzzreusable/CustomTablePagination";
import DAFormModal from "../../../../components/modal/form/DAForm/DAFormModal";

const DAFormMDAProcessing = ({ searchQuery, dateFilters, onCancel }) => {
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

  const methods = useForm({
    defaultValues: {},
  });

  const [updateDaSubmission] = useUpdateDaMutation();
  const [resubmitDaSubmission] = useResubmitFormSubmissionMutation();
  const [cancelDaSubmission] = useCancelFormSubmissionMutation();

  const apiQueryParams = useMemo(() => {
    const params = {
      page: page,
      per_page: rowsPerPage,
      status: "active",
      approval_status: "PENDING MDA CREATION",
      pagination: "true",
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

  const {
    data: submissionDetails,
    isLoading: detailsLoading,
    refetch: refetchDetails,
  } = useGetSingleDaSubmissionQuery(selectedSubmissionId, {
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
      try {
        if (mode === "edit" && selectedSubmissionId) {
          await updateDaSubmission({
            id: selectedSubmissionId,
            data: formData,
          }).unwrap();

          enqueueSnackbar("DA Form submission updated successfully", {
            variant: "success",
          });

          await refetchDetails();
          await refetch();

          handleModalClose();
        }
      } catch (error) {
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
      refetchDetails,
      refetch,
      handleModalClose,
    ]
  );

  const handleResubmit = useCallback(
    async (submissionId) => {
      try {
        await resubmitDaSubmission(submissionId).unwrap();

        enqueueSnackbar("DA Form submission resubmitted successfully", {
          variant: "success",
          autoHideDuration: 2000,
        });

        await refetchDetails();
        await refetch();
      } catch (error) {
        enqueueSnackbar(
          error?.data?.message || "Failed to resubmit DA Form submission",
          {
            variant: "error",
            autoHideDuration: 2000,
          }
        );
      }
    },
    [resubmitDaSubmission, enqueueSnackbar, refetchDetails, refetch]
  );

  const handleCancel = useCallback(
    async (submissionId) => {
      try {
        await cancelDaSubmission(submissionId).unwrap();

        enqueueSnackbar("DA Form submission cancelled successfully", {
          variant: "success",
          autoHideDuration: 2000,
        });

        await refetch();

        return true;
      } catch (error) {
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
        <DAFormTable
          submissionsList={submissionsList}
          isLoadingState={isLoadingState}
          error={error}
          handleRowClick={handleRowClick}
          handleMenuOpen={handleMenuOpen}
          handleMenuClose={handleMenuClose}
          menuAnchor={menuAnchor}
          searchQuery={searchQuery}
          statusFilter="PENDING MDA CREATION"
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

      <DAFormModal
        open={modalOpen}
        onClose={handleModalClose}
        onSave={handleSave}
        onResubmit={handleResubmit}
        selectedEntry={selectedEntry}
        isLoading={detailsLoading}
        mode={modalMode}
        submissionId={selectedSubmissionId}
      />
    </FormProvider>
  );
};

export default DAFormMDAProcessing;
