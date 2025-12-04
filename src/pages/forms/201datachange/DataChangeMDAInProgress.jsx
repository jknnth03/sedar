import React, { useState, useMemo, useCallback, useEffect } from "react";
import { Typography, Box, useTheme } from "@mui/material";
import { FormProvider, useForm } from "react-hook-form";
import { useSnackbar } from "notistack";
import "../../../pages/GeneralStyle.scss";
import {
  useGetMyDataChangeSubmissionsQuery,
  useGetDataChangeSubmissionDetailsQuery,
  useUpdateDataChangeSubmissionMutation,
  useResubmitDataChangeSubmissionMutation,
} from "../../../features/api/forms/datachangeApi";
import DataChangeMDATable from "./DataChangeMDATable";
import CustomTablePagination from "../../zzzreusable/CustomTablePagination";
import { useRememberQueryParams } from "../../../hooks/useRememberQueryParams";
import DataChangeModal from "../../../components/modal/form/DataChange/DataChangeModal";

const DataChangeMDAInProgress = ({
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

  const methods = useForm({
    defaultValues: {},
  });

  const [updateDataChangeSubmission] = useUpdateDataChangeSubmissionMutation();
  const [resubmitDataChangeSubmission] =
    useResubmitDataChangeSubmissionMutation();

  const apiQueryParams = useMemo(() => {
    return {
      pagination: 1,
      page: page,
      per_page: rowsPerPage,
      status: "active",
      approval_status: "MDA IN PROGRESS",
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
  } = useGetMyDataChangeSubmissionsQuery(apiQueryParams, {
    refetchOnMountOrArgChange: true,
    skip: false,
  });

  const {
    data: submissionDetails,
    isLoading: detailsLoading,
    refetch: refetchDetails,
  } = useGetDataChangeSubmissionDetailsQuery(selectedSubmissionId, {
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

  const handleModalClose = useCallback(() => {
    setModalOpen(false);
    setSelectedSubmissionId(null);
    setModalMode("view");
  }, []);

  const handleModeChange = useCallback((newMode) => {
    setModalMode(newMode);
  }, []);

  const handleRefreshDetails = useCallback(() => {
    if (selectedSubmissionId) {
      refetchDetails();
    }
  }, [selectedSubmissionId, refetchDetails]);

  const handleSave = useCallback(
    async (formData, mode, entryId) => {
      try {
        if (mode === "edit" && entryId) {
          const response = await updateDataChangeSubmission({
            id: entryId,
            data: formData,
          }).unwrap();

          enqueueSnackbar("Data Change submission updated successfully", {
            variant: "success",
          });

          await refetchDetails();
          await refetch();
        }
      } catch (error) {
        enqueueSnackbar(
          error?.data?.message || "Failed to update Data Change submission",
          {
            variant: "error",
          }
        );
      }
    },
    [updateDataChangeSubmission, enqueueSnackbar, refetchDetails, refetch]
  );

  const handleResubmit = useCallback(
    async (entryId) => {
      try {
        const response = await resubmitDataChangeSubmission(entryId).unwrap();

        enqueueSnackbar("Data Change submission resubmitted successfully", {
          variant: "success",
        });

        await refetchDetails();
        await refetch();

        return true;
      } catch (error) {
        enqueueSnackbar(
          error?.data?.message || "Failed to resubmit Data Change submission",
          {
            variant: "error",
          }
        );
        return false;
      }
    },
    [resubmitDataChangeSubmission, enqueueSnackbar, refetchDetails, refetch]
  );

  const handleCancel = useCallback(async (submissionId) => {
    return false;
  }, []);

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
        <DataChangeMDATable
          submissionsList={submissionsList}
          isLoadingState={isLoadingState}
          error={error}
          handleRowClick={handleRowClick}
          handleMenuOpen={handleMenuOpen}
          handleMenuClose={handleMenuClose}
          menuAnchor={menuAnchor}
          searchQuery={searchQuery}
          statusFilter="MDA IN PROGRESS"
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

      <DataChangeModal
        open={modalOpen}
        onClose={handleModalClose}
        onSave={handleSave}
        onResubmit={handleResubmit}
        selectedEntry={submissionDetails}
        isLoading={detailsLoading}
        mode={modalMode}
        onModeChange={handleModeChange}
        onRefreshDetails={handleRefreshDetails}
      />
    </FormProvider>
  );
};

export default DataChangeMDAInProgress;
