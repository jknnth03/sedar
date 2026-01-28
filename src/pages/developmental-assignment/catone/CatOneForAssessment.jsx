import React, { useState, useMemo, useCallback, useEffect } from "react";
import { Typography, Box, useTheme } from "@mui/material";
import { FormProvider, useForm } from "react-hook-form";
import { useSnackbar } from "notistack";
import "../../../pages/GeneralStyle.scss";
import {
  useGetCatOneTaskQuery,
  useGetCatOneByIdQuery,
  useSaveCatOneAsDraftMutation,
  useSubmitCatOneMutation,
} from "../../../features/api/da-task/catOneApi";
import { useShowDashboardQuery } from "../../../features/api/usermanagement/dashboardApi";
import CatOneTable from "./CatOneTable";
import CatOneModal from "../../../components/modal/da-task/CatOneModal";
import CustomTablePagination from "../../zzzreusable/CustomTablePagination";
import { useCancelFormSubmissionMutation } from "../../../features/api/approvalsetting/formSubmissionApi";

const CatOneForAssessment = ({
  searchQuery,
  dateFilters,
  setQueryParams,
  currentParams,
}) => {
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();

  const [page, setPage] = useState(parseInt(currentParams?.page) || 1);
  const [rowsPerPage, setRowsPerPage] = useState(
    parseInt(currentParams?.rowsPerPage) || 10,
  );
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("view");
  const [selectedSubmissionId, setSelectedSubmissionId] = useState(null);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [menuAnchor, setMenuAnchor] = useState({});
  const [isLoading, setIsLoading] = useState(false);

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
      status: "FOR_ASSESSMENT",
      search: searchQuery || "",
    };

    if (
      dateFilters?.start_date !== undefined &&
      dateFilters?.start_date !== null
    ) {
      params.start_date = dateFilters.start_date;
    }
    if (dateFilters?.end_date !== undefined && dateFilters?.end_date !== null) {
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
  } = useGetCatOneTaskQuery(apiQueryParams, {
    refetchOnMountOrArgChange: true,
    skip: false,
  });

  const { refetch: refetchDashboard } = useShowDashboardQuery();

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
      return result.data;
    }

    return [];
  }, [taskData]);

  const handleRowClick = useCallback((submission) => {
    setModalMode("view");
    setSelectedSubmissionId(submission.id);
    setSelectedSubmission(submission);
    setMenuAnchor({});
    setModalOpen(true);
  }, []);

  const handleEditSubmission = useCallback((submission) => {
    setSelectedSubmissionId(submission.id);
    setSelectedSubmission(submission);
    setMenuAnchor({});
    setModalMode("edit");
    setModalOpen(true);
  }, []);

  const handleCancelSubmission = useCallback(
    async (submissionId) => {
      const submission = submissionsData.find((sub) => sub.id === submissionId);
      if (submission) {
        try {
          await cancelCatOneSubmission(submissionId).unwrap();
          enqueueSnackbar("CAT 1 assessment cancelled successfully!", {
            variant: "success",
            autoHideDuration: 2000,
          });
          refetch();
          refetchDashboard();
        } catch (error) {
          const errorMessage =
            error?.data?.message ||
            "Failed to cancel assessment. Please try again.";
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
    [
      submissionsData,
      enqueueSnackbar,
      cancelCatOneSubmission,
      refetch,
      refetchDashboard,
    ],
  );

  const handleModalClose = useCallback(() => {
    setModalOpen(false);
    setSelectedSubmissionId(null);
    setSelectedSubmission(null);
    setModalMode("view");
  }, []);

  const handleRefreshDetails = useCallback(() => {
    refetch();
    refetchDashboard();
    if (selectedSubmissionId) {
      refetchDetails();
    }
  }, [refetch, refetchDashboard, refetchDetails, selectedSubmissionId]);

  const handleModalSave = useCallback(
    async (formData, mode, entryId) => {
      try {
        if (!entryId) throw new Error("Entry ID is missing");

        const payload = { id: entryId, ...formData };
        await submitCatOne(payload).unwrap();

        enqueueSnackbar("CAT 1 assessment submitted successfully!", {
          variant: "success",
          autoHideDuration: 2000,
        });

        setModalOpen(false);
        setSelectedSubmissionId(null);
        setSelectedSubmission(null);
        refetch();
        refetchDashboard();
        return true;
      } catch (error) {
        const errorMessage =
          error?.data?.message ||
          "Failed to submit assessment. Please try again.";
        enqueueSnackbar(errorMessage, {
          variant: "error",
          autoHideDuration: 2000,
        });
        return false;
      }
    },
    [submitCatOne, enqueueSnackbar, refetch, refetchDashboard],
  );

  const handleModalSaveAsDraft = useCallback(
    async (formData, entryId) => {
      try {
        if (!entryId) throw new Error("Entry ID is missing");

        const payload = { id: entryId, ...formData };
        await saveCatOneAsDraft(payload).unwrap();

        enqueueSnackbar("CAT 1 assessment saved as draft successfully!", {
          variant: "success",
          autoHideDuration: 2000,
        });

        setModalOpen(false);
        setSelectedSubmissionId(null);
        setSelectedSubmission(null);
        refetch();
        refetchDashboard();
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
    [saveCatOneAsDraft, enqueueSnackbar, refetch, refetchDashboard],
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
            ...currentParams,
            page: targetPage,
            rowsPerPage: rowsPerPage,
          },
          { retain: false },
        );
      }
    },
    [setQueryParams, rowsPerPage, currentParams],
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
          { retain: false },
        );
      }
    },
    [setQueryParams, currentParams],
  );

  const handleModeChange = useCallback((newMode) => {
    setModalMode(newMode);
  }, []);

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
        <CatOneTable
          submissionsList={submissionsData}
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
          forAssessment={true}
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
    </FormProvider>
  );
};

export default CatOneForAssessment;
