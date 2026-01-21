import React, { useState, useMemo, useCallback, useEffect } from "react";
import { Typography, Box, useTheme } from "@mui/material";
import { FormProvider, useForm } from "react-hook-form";
import { useSnackbar } from "notistack";
import "../../../pages/GeneralStyle.scss";
import {
  useGetRecommendationSubmissionsQuery,
  useLazyGetSingleRecommendationSubmissionQuery,
} from "../../../features/api/forms/mdaRecommendationApi";
import {
  useCreateMdaRecommendationMutation,
  useUpdateMdaRecommendationMutation,
} from "../../../features/api/forms/mdaRecommendationApi";
import { useRememberQueryParams } from "../../../hooks/useRememberQueryParams";
import DAForMDAProcessingTable from "./DAForMDAProcessingTable";
import ForMDAProcessingModal from "../../../components/modal/form/MDARecommendation/ForMDAProcessingModal";
import MDARecommendationModal from "../../../components/modal/form/MDARecommendation/MDARecommendationModal";
import CustomTablePagination from "../../zzzreusable/CustomTablePagination";

const DAForMDAProcessing = ({ searchQuery, dateFilters, onCancel }) => {
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();

  const [queryParams, setQueryParams] = useRememberQueryParams();

  const [page, setPage] = useState(parseInt(queryParams?.page) || 1);
  const [rowsPerPage, setRowsPerPage] = useState(
    parseInt(queryParams?.rowsPerPage) || 10
  );

  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [viewModalMode, setViewModalMode] = useState("view");
  const [selectedSubmissionId, setSelectedSubmissionId] = useState(null);
  const [selectedSubmission, setSelectedSubmission] = useState(null);

  const [mdaModalOpen, setMdaModalOpen] = useState(false);
  const [mdaSubmissionId, setMdaSubmissionId] = useState(null);
  const [selectedMdaSubmission, setSelectedMdaSubmission] = useState(null);
  const [mdaPrefillData, setMdaPrefillData] = useState(null);

  const [menuAnchor, setMenuAnchor] = useState({});

  const viewFormMethods = useForm({
    defaultValues: {
      reason_for_change: "",
      employee_id: null,
      new_position_id: null,
      remarks: "",
    },
  });

  const mdaFormMethods = useForm({
    defaultValues: {
      form_id: 5,
      employee_movement_id: null,
      employee_id: "",
      employee_name: "",
      employee_number: "",
      effective_date: null,
      action_type: "",
      birth_date: null,
      birth_place: "",
      gender: "",
      nationality: "",
      address: "",
      tin_number: "",
      sss_number: "",
      pag_ibig_number: "",
      philhealth_number: "",
      to_position_id: null,
      to_position_title: "",
      to_job_level: "",
      to_basic_salary: "",
      to_training_allowance: "",
    },
  });

  const apiQueryParams = useMemo(() => {
    const params = {
      page: page,
      per_page: rowsPerPage,
      status: "active",
      pagination: 1,
      approval_status: "PENDING FINAL MDA",
      search: searchQuery || "",
      view_mode: "hr",
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
  } = useGetRecommendationSubmissionsQuery(apiQueryParams, {
    refetchOnMountOrArgChange: true,
    skip: false,
  });

  const [
    triggerGetSubmission,
    { data: submissionDetails, isLoading: detailsLoading },
  ] = useLazyGetSingleRecommendationSubmissionQuery();

  const [createMdaRecommendation, { isLoading: isCreatingMdaRecommendation }] =
    useCreateMdaRecommendationMutation();
  const [updateMdaRecommendation, { isLoading: isUpdatingMdaRecommendation }] =
    useUpdateMdaRecommendationMutation();

  const filteredSubmissions = useMemo(() => {
    if (!submissionsData?.result) return [];

    const result = submissionsData.result;

    if (result.data && Array.isArray(result.data)) {
      return result.data;
    }

    if (Array.isArray(result)) {
      return result;
    }

    return [];
  }, [submissionsData]);

  const handleRowClick = useCallback(async (submission) => {
    setSelectedSubmissionId(submission.id);
    setSelectedSubmission(submission);
    setViewModalMode("view");
    setViewModalOpen(true);
    setMenuAnchor({});
  }, []);

  const handleEditSubmission = useCallback(async (submission) => {
    setSelectedSubmissionId(submission.id);
    setSelectedSubmission(submission);
    setViewModalMode("edit");
    setViewModalOpen(true);
    setMenuAnchor({});
  }, []);

  const handleViewModalClose = useCallback(() => {
    setViewModalOpen(false);
    setSelectedSubmissionId(null);
    setSelectedSubmission(null);
    setViewModalMode("view");
    viewFormMethods.reset();
  }, [viewFormMethods]);

  const handleRefreshDetails = useCallback(() => {
    if (selectedSubmissionId) {
      triggerGetSubmission(selectedSubmissionId);
    }
  }, [selectedSubmissionId, triggerGetSubmission]);

  const handleCreateMDA = useCallback((data) => {
    console.log("handleCreateMDA called with:", data);
    setViewModalOpen(false);
    setMdaSubmissionId(data.id);
    setMdaPrefillData(data.prefillData || null);
    setMdaModalOpen(true);
  }, []);

  const handleMdaModalClose = useCallback(() => {
    setMdaModalOpen(false);
    setMdaSubmissionId(null);
    setSelectedMdaSubmission(null);
    setMdaPrefillData(null);
    mdaFormMethods.reset({
      form_id: 5,
      employee_movement_id: null,
      employee_id: "",
      employee_name: "",
      employee_number: "",
      effective_date: null,
      action_type: "",
      birth_date: null,
      birth_place: "",
      gender: "",
      nationality: "",
      address: "",
      tin_number: "",
      sss_number: "",
      pag_ibig_number: "",
      philhealth_number: "",
      to_position_id: null,
      to_position_title: "",
      to_job_level: "",
      to_basic_salary: "",
      to_training_allowance: "",
    });
  }, [mdaFormMethods]);

  const handleSaveMDA = useCallback(
    async (data, mode) => {
      try {
        if (mode === "create") {
          await createMdaRecommendation(data).unwrap();
          enqueueSnackbar("MDA (Recommendation) created successfully!", {
            variant: "success",
            autoHideDuration: 3000,
          });
          setMdaModalOpen(false);
          mdaFormMethods.reset();
          refetch();
        } else if (mode === "edit") {
          await updateMdaRecommendation({
            id: selectedMdaSubmission.id,
            data: data,
          }).unwrap();
          enqueueSnackbar("MDA (Recommendation) updated successfully!", {
            variant: "success",
            autoHideDuration: 3000,
          });
          setMdaModalOpen(false);
          refetch();
        }
      } catch (error) {
        console.error("Error saving MDA (Recommendation):", error);
        const errorMessage =
          error?.data?.message ||
          "Failed to save MDA (Recommendation). Please try again.";
        enqueueSnackbar(errorMessage, {
          variant: "error",
          autoHideDuration: 3000,
        });
      }
    },
    [
      createMdaRecommendation,
      updateMdaRecommendation,
      selectedMdaSubmission,
      refetch,
      enqueueSnackbar,
      mdaFormMethods,
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
    setViewModalMode(newMode);
  }, []);

  const isLoadingState = queryLoading || isFetching;

  const totalCount = submissionsData?.result?.total || 0;

  return (
    <>
      <Box
        sx={{
          flex: 1,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          backgroundColor: "white",
        }}>
        <DAForMDAProcessingTable
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
          forMDAProcessing={true}
          onCreateMDA={handleCreateMDA}
          onCancel={onCancel}
        />

        <CustomTablePagination
          count={totalCount}
          page={Math.max(0, page - 1)}
          rowsPerPage={rowsPerPage}
          onPageChange={handlePageChange}
          onRowsPerPageChange={handleRowsPerPageChange}
        />
      </Box>

      <FormProvider {...viewFormMethods}>
        <ForMDAProcessingModal
          open={viewModalOpen}
          onClose={handleViewModalClose}
          submissionId={selectedSubmissionId}
          mode={viewModalMode}
          onModeChange={handleModeChange}
          isLoading={detailsLoading}
          onRefreshDetails={handleRefreshDetails}
          onCreateMDA={handleCreateMDA}
        />
      </FormProvider>

      <FormProvider {...mdaFormMethods}>
        <MDARecommendationModal
          open={mdaModalOpen}
          onClose={handleMdaModalClose}
          daSubmissionId={mdaSubmissionId}
          prefillData={mdaPrefillData}
          onSave={handleSaveMDA}
          mode="edit"
        />
      </FormProvider>
    </>
  );
};

export default DAForMDAProcessing;
