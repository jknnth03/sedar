import React, { useState, useMemo, useCallback, useEffect } from "react";
import { Typography, TablePagination, Box, useTheme } from "@mui/material";
import { FormProvider, useForm } from "react-hook-form";
import { useSnackbar } from "notistack";
import "../../../pages/GeneralStyle.scss";
import {
  useGetCatOneTaskQuery,
  useGetCatOneByIdQuery,
  useSaveCatOneAsDraftMutation,
  useSubmitCatOneMutation,
} from "../../../features/api/da-task/catOneApi";
import CatOneTable from "./CatOneTable";
import CatOneModal from "../../../components/modal/da-task/CatOneModal";
import { useCancelFormSubmissionMutation } from "../../../features/api/approvalsetting/formSubmissionApi";

const CatOneForSubmission = ({
  searchQuery,
  dateFilters,
  filterDataByDate,
  filterDataBySearch,
  setQueryParams,
  currentParams,
}) => {
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();

  const [page, setPage] = useState(parseInt(currentParams?.page) || 1);
  const [rowsPerPage, setRowsPerPage] = useState(
    parseInt(currentParams?.rowsPerPage) || 10
  );
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("view");
  const [selectedSubmissionId, setSelectedSubmissionId] = useState(null);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [menuAnchor, setMenuAnchor] = useState({});
  const [selectedRowForMenu, setSelectedRowForMenu] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const methods = useForm({
    defaultValues: {
      template_id: null,
      employee_id: null,
      date_assessed: null,
      remarks: "",
    },
  });

  useEffect(() => {
    const newPage = 1;
    setPage(newPage);
  }, [searchQuery, dateFilters]);

  const {
    data: taskData,
    isLoading: queryLoading,
    isFetching,
    refetch,
    error,
  } = useGetCatOneTaskQuery(
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
    data: catOneDetails,
    isLoading: detailsLoading,
    refetch: refetchDetails,
  } = useGetCatOneByIdQuery(selectedSubmissionId, {
    skip: !selectedSubmissionId,
    refetchOnMountOrArgChange: true,
  });

  const submissionDetails = useMemo(() => {
    if (!catOneDetails?.result) return null;
    return catOneDetails;
  }, [catOneDetails]);

  const [submitCatOne] = useSubmitCatOneMutation();
  const [saveCatOneAsDraft] = useSaveCatOneAsDraftMutation();
  const [cancelCatOneSubmission] = useCancelFormSubmissionMutation();

  const submissionsData = useMemo(() => {
    if (!taskData?.result) return [];

    const result = taskData.result;

    if (result.data && Array.isArray(result.data)) {
      return result.data.filter(
        (item) =>
          item.status === "FOR_SUBMISSION" ||
          item.status === "AWAITING_RESUBMISSION"
      );
    }

    if (Array.isArray(result)) {
      return result.filter(
        (item) =>
          item.status === "FOR_SUBMISSION" ||
          item.status === "AWAITING_RESUBMISSION"
      );
    }

    if (
      result.status === "FOR_SUBMISSION" ||
      result.status === "AWAITING_RESUBMISSION"
    ) {
      return [result];
    }

    return [];
  }, [taskData]);

  const totalCount = useMemo(() => {
    if (taskData?.result?.total) {
      return taskData.result.total;
    }
    return submissionsData.length;
  }, [taskData, submissionsData.length]);

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
    setSelectedRowForMenu(null);
    setModalOpen(true);
  }, []);

  const handleEditSubmission = useCallback((submission) => {
    setSelectedSubmissionId(submission.id);
    setSelectedSubmission(submission);
    setMenuAnchor({});
    setSelectedRowForMenu(null);
    setModalMode("edit");
    setModalOpen(true);
  }, []);

  const handleCancelSubmission = useCallback(
    async (submissionId) => {
      const submission = filteredSubmissions.find(
        (sub) => sub.id === submissionId
      );
      if (submission) {
        try {
          await cancelCatOneSubmission(submissionId).unwrap();
          enqueueSnackbar("CAT 1 submission cancelled successfully!", {
            variant: "success",
            autoHideDuration: 2000,
          });
          refetch();
        } catch (error) {
          const errorMessage =
            error?.data?.message ||
            "Failed to cancel submission. Please try again.";
          enqueueSnackbar(errorMessage, {
            variant: "error",
            autoHideDuration: 2000,
          });
        }
      } else {
        enqueueSnackbar("Submission not found. Please try again.", {
          variant: "error",
          autoHideDuration: 2000,
        });
      }
    },
    [filteredSubmissions, enqueueSnackbar, cancelCatOneSubmission, refetch]
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

  const handleModalSave = useCallback(
    async (formData, mode, entryId) => {
      try {
        if (!entryId) throw new Error("Entry ID is missing");

        const payload = { id: entryId, ...formData };
        await submitCatOne(payload).unwrap();

        enqueueSnackbar("CAT 1 submitted successfully!", {
          variant: "success",
          autoHideDuration: 2000,
        });

        setModalOpen(false);
        setSelectedSubmissionId(null);
        setSelectedSubmission(null);
        refetch();
        return true;
      } catch (error) {
        const errorMessage =
          error?.data?.message || "Failed to submit CAT 1. Please try again.";
        enqueueSnackbar(errorMessage, {
          variant: "error",
          autoHideDuration: 2000,
        });
        return false;
      }
    },
    [submitCatOne, enqueueSnackbar, refetch]
  );

  const handleModalSaveAsDraft = useCallback(
    async (formData, entryId) => {
      try {
        if (!entryId) throw new Error("Entry ID is missing");

        const payload = { id: entryId, ...formData };
        await saveCatOneAsDraft(payload).unwrap();

        enqueueSnackbar("CAT 1 saved as draft successfully!", {
          variant: "success",
          autoHideDuration: 2000,
        });

        setModalOpen(false);
        setSelectedSubmissionId(null);
        setSelectedSubmission(null);
        refetch();
        return true;
      } catch (error) {
        const errorMessage =
          error?.data?.message || "Failed to save draft. Please try again.";
        enqueueSnackbar(errorMessage, {
          variant: "error",
          autoHideDuration: 2000,
        });
        return false;
      }
    },
    [saveCatOneAsDraft, enqueueSnackbar, refetch]
  );

  const handleMenuOpen = useCallback((event, submission) => {
    event.stopPropagation();
    event.preventDefault();
    setMenuAnchor((prev) => ({
      ...prev,
      [submission.id]: event.currentTarget,
    }));
    setSelectedRowForMenu(submission);
  }, []);

  const handleMenuClose = useCallback((submissionId) => {
    setMenuAnchor((prev) => ({ ...prev, [submissionId]: null }));
    setSelectedRowForMenu(null);
  }, []);

  const handlePageChange = useCallback(
    (event, newPage) => {
      const targetPage = newPage + 1;
      setPage(targetPage);
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
    [setQueryParams, rowsPerPage, currentParams]
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
            ...currentParams,
            page: newPage,
            rowsPerPage: newRowsPerPage,
          },
          { retain: false }
        );
      }
    },
    [setQueryParams, currentParams]
  );

  const handleModeChange = useCallback((newMode) => {
    setModalMode(newMode);
  }, []);

  const isLoadingState = queryLoading || isFetching || isLoading;

  return (
    <FormProvider {...methods}>
      <Box
        sx={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          backgroundColor: "#fafafa",
        }}>
        <Box
          sx={{
            flex: 1,
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            backgroundColor: "white",
          }}>
          <CatOneTable
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
            forApproval={false}
            forAssessment={false}
            onCancel={handleCancelSubmission}
          />

          <Box
            sx={{
              borderTop: "1px solid #e0e0e0",
              backgroundColor: "#f8f9fa",
              flexShrink: 0,
              "& .MuiTablePagination-root": {
                color: "#666",
                "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows":
                  {
                    fontSize: "14px",
                    fontWeight: 500,
                  },
                "& .MuiTablePagination-select": {
                  fontSize: "14px",
                },
                "& .MuiIconButton-root": {
                  color: "rgb(33, 61, 112)",
                  "&:hover": {
                    backgroundColor: "rgba(33, 61, 112, 0.04)",
                  },
                  "&.Mui-disabled": {
                    color: "#ccc",
                  },
                },
              },
              "& .MuiTablePagination-toolbar": {
                paddingLeft: "24px",
                paddingRight: "24px",
              },
            }}>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25, 50, 100]}
              component="div"
              count={totalCount}
              rowsPerPage={rowsPerPage}
              page={Math.max(0, page - 1)}
              onPageChange={handlePageChange}
              onRowsPerPageChange={handleRowsPerPageChange}
            />
          </Box>
        </Box>

        <CatOneModal
          open={modalOpen}
          onClose={handleModalClose}
          mode={modalMode}
          onModeChange={handleModeChange}
          selectedEntry={submissionDetails?.result || selectedSubmission}
          isLoading={detailsLoading}
          onSave={handleModalSave}
          onSaveAsDraft={handleModalSaveAsDraft}
          onRefreshDetails={handleRefreshDetails}
        />
      </Box>
    </FormProvider>
  );
};

export default CatOneForSubmission;
