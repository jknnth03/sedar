import React, { useState, useMemo, useCallback, useEffect } from "react";
import { Typography, Box, useTheme } from "@mui/material";
import { FormProvider, useForm } from "react-hook-form";
import { useSnackbar } from "notistack";
import "../../../pages/GeneralStyle.scss";
import {
  useGetMdaSubmissionsQuery,
  useGetSingleMdaSubmissionQuery,
  useUpdateMdaMutation,
} from "../../../features/api/forms/mdaApi";
import MDAForApprovalTable from "./MDAForApprovalTable";
import { useRememberQueryParams } from "../../../hooks/useRememberQueryParams";
import MDAFormModal from "../../../components/modal/form/MDAForm/MDAFormModal";
import { useCancelFormSubmissionMutation } from "../../../features/api/approvalsetting/formSubmissionApi";
import CustomTablePagination from "../../zzzreusable/CustomTablePagination";

const MDARejected = ({
  searchQuery,
  dateFilters,
  filterDataByDate,
  filterDataBySearch,
  onCancel: onCancelProp,
}) => {
  const theme = useTheme();
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

  const [updateMdaSubmission] = useUpdateMdaMutation();
  const [cancelMdaSubmission] = useCancelFormSubmissionMutation();

  const apiQueryParams = useMemo(() => {
    return {
      page: page,
      per_page: rowsPerPage,
      approval_status: "REJECTED",
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
  } = useGetMdaSubmissionsQuery(apiQueryParams, {
    refetchOnMountOrArgChange: true,
    skip: false,
  });

  const {
    data: submissionDetails,
    isLoading: detailsLoading,
    refetch: refetchDetails,
  } = useGetSingleMdaSubmissionQuery(selectedSubmissionId, {
    skip: !selectedSubmissionId,
    refetchOnMountOrArgChange: true,
  });

  const filteredSubmissions = useMemo(() => {
    const rawData = submissionsData?.result?.data || [];

    let filtered = rawData.filter(
      (submission) => submission.status === "REJECTED"
    );

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
        console.log("Saving MDA submission:", formData, mode);

        if (mode === "edit" && selectedSubmissionId) {
          await updateMdaSubmission({
            id: selectedSubmissionId,
            data: formData,
          }).unwrap();

          enqueueSnackbar("MDA submission updated successfully", {
            variant: "success",
          });

          await refetchDetails();
          await refetch();

          handleModalClose();
        }
      } catch (error) {
        console.error("Error saving MDA submission:", error);
        enqueueSnackbar(
          error?.data?.message || "Failed to update MDA submission",
          {
            variant: "error",
          }
        );
      }
    },
    [
      selectedSubmissionId,
      updateMdaSubmission,
      enqueueSnackbar,
      refetchDetails,
      refetch,
      handleModalClose,
    ]
  );

  const handleCancel = useCallback(
    async (submissionId) => {
      try {
        console.log("Cancelling MDA submission:", submissionId);

        await cancelMdaSubmission(submissionId).unwrap();

        enqueueSnackbar("MDA submission cancelled successfully", {
          variant: "success",
          autoHideDuration: 2000,
        });

        await refetch();

        return true;
      } catch (error) {
        console.error("Error cancelling MDA submission:", error);

        let errorMessage = "Failed to cancel MDA submission";
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
    [cancelMdaSubmission, enqueueSnackbar, refetch]
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
        <MDAForApprovalTable
          submissionsList={paginatedSubmissions}
          isLoadingState={isLoadingState}
          error={error}
          handleRowClick={handleRowClick}
          handleMenuOpen={handleMenuOpen}
          handleMenuClose={handleMenuClose}
          menuAnchor={menuAnchor}
          searchQuery={searchQuery}
          forApproval={false}
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

      <MDAFormModal
        open={modalOpen}
        onClose={handleModalClose}
        onSave={handleSave}
        selectedEntry={selectedEntry}
        isLoading={detailsLoading}
        mode={modalMode}
        submissionId={selectedSubmissionId}
      />
    </FormProvider>
  );
};

export default MDARejected;
