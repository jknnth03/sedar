import React, { useState, useMemo, useCallback, useEffect } from "react";
import {
  Typography,
  TablePagination,
  Box,
  useTheme,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  CircularProgress,
} from "@mui/material";
import { FormProvider, useForm } from "react-hook-form";
import { useSnackbar } from "notistack";
import "../../../pages/GeneralStyle.scss";
import {
  useGetDaSubmissionsQuery,
  useLazyGetSingleDaSubmissionQuery,
} from "../../../features/api/forms/mdaDaApi";
import {
  useCreateMdaDaMutation,
  useUpdateMdaDaMutation,
} from "../../../features/api/forms/mdaDaApi";
import { useRememberQueryParams } from "../../../hooks/useRememberQueryParams";
import DAForMDAProcessingTable from "./DAForMDAProcessingTable";
import DADataChangeModal from "../../../components/modal/form/MDADAForm/DAChangeModal";
import MDADAModal from "../../../components/modal/form/MDADAForm/MDADAModal";

const MDADAForMDAProcessing = ({
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

  // Modal for viewing/editing DA submissions
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [viewModalMode, setViewModalMode] = useState("view");
  const [selectedSubmissionId, setSelectedSubmissionId] = useState(null);
  const [selectedSubmission, setSelectedSubmission] = useState(null);

  // Modal for creating MDA from DA
  const [mdaModalOpen, setMdaModalOpen] = useState(false);
  const [mdaSubmissionId, setMdaSubmissionId] = useState(null);
  const [selectedMdaSubmission, setSelectedMdaSubmission] = useState(null);

  const [modalLoading, setModalLoading] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState({});
  const [selectedRowForMenu, setSelectedRowForMenu] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Form for viewing/editing DA submissions
  const viewFormMethods = useForm({
    defaultValues: {
      reason_for_change: "",
      employee_id: null,
      new_position_id: null,
      remarks: "",
    },
  });

  // Form for creating MDA
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
    return {
      page: page,
      per_page: rowsPerPage,
      status: "active",
      pagination: 1,
      approval_status: "PENDING MDA CREATION",
      search: searchQuery || "",
      view_mode: "hr",
    };
  }, [page, rowsPerPage, searchQuery]);

  useEffect(() => {
    const newPage = 1;
    setPage(newPage);
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

  const [createMdaDa, { isLoading: isCreatingMdaDa }] =
    useCreateMdaDaMutation();
  const [updateMdaDa, { isLoading: isUpdatingMdaDa }] =
    useUpdateMdaDaMutation();

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

  // Handle row click to view DA submission
  const handleRowClick = useCallback(
    async (submission) => {
      console.log("Opening view modal for submission:", submission);
      setSelectedSubmissionId(submission.id);
      setViewModalMode("view");
      setViewModalOpen(true);
      setMenuAnchor({});
      setSelectedRowForMenu(null);

      // Fetch full submission details
      try {
        await triggerGetSubmission(submission.id);
      } catch (error) {
        console.error("Error fetching submission details:", error);
      }
    },
    [triggerGetSubmission]
  );

  const handleEditSubmission = useCallback(
    async (submission) => {
      setSelectedSubmissionId(submission.id);
      setViewModalMode("edit");
      setViewModalOpen(true);
      setMenuAnchor({});
      setSelectedRowForMenu(null);

      // Fetch full submission details
      try {
        await triggerGetSubmission(submission.id);
      } catch (error) {
        console.error("Error fetching submission details:", error);
      }
    },
    [triggerGetSubmission]
  );

  // Handle closing view/edit modal
  const handleViewModalClose = useCallback(() => {
    setViewModalOpen(false);
    setSelectedSubmissionId(null);
    setModalLoading(false);
    setViewModalMode("view");
    viewFormMethods.reset();
  }, [viewFormMethods]);

  const handleRefreshDetails = useCallback(() => {
    if (selectedSubmissionId) {
      triggerGetSubmission(selectedSubmissionId);
    }
  }, [selectedSubmissionId, triggerGetSubmission]);

  // Handle creating MDA from DA submission
  const handleCreateMDA = useCallback((submission) => {
    const submissionIdForPrefill = submission.submittable?.id || submission.id;
    console.log("Opening MDA modal for submission ID:", submissionIdForPrefill);
    setMdaSubmissionId(submissionIdForPrefill);
    setSelectedMdaSubmission(submission);
    setMdaModalOpen(true);
  }, []);

  const handleMdaModalClose = useCallback(() => {
    setMdaModalOpen(false);
    setMdaSubmissionId(null);
    setSelectedMdaSubmission(null);
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
          const result = await createMdaDa(data).unwrap();
          enqueueSnackbar("MDA (DA) created successfully!", {
            variant: "success",
            autoHideDuration: 3000,
          });
          setMdaModalOpen(false);
          mdaFormMethods.reset();
          refetch();
        } else if (mode === "edit") {
          const result = await updateMdaDa({
            id: selectedMdaSubmission.id,
            data: data,
          }).unwrap();
          enqueueSnackbar("MDA (DA) updated successfully!", {
            variant: "success",
            autoHideDuration: 3000,
          });
          setMdaModalOpen(false);
          refetch();
        }
      } catch (error) {
        console.error("Error saving MDA (DA):", error);
        const errorMessage =
          error?.data?.message || "Failed to save MDA (DA). Please try again.";
        enqueueSnackbar(errorMessage, {
          variant: "error",
          autoHideDuration: 3000,
        });
      }
    },
    [
      createMdaDa,
      updateMdaDa,
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

  const isLoadingState = queryLoading || isFetching || isLoading;

  return (
    <>
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
          <DAForMDAProcessingTable
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
            hideStatusColumn={false}
            forMDAProcessing={true}
            onCreateMDA={handleCreateMDA}
            onCancel={onCancel}
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
              count={filteredSubmissions.length}
              rowsPerPage={rowsPerPage}
              page={Math.max(0, page - 1)}
              onPageChange={handlePageChange}
              onRowsPerPageChange={handleRowsPerPageChange}
            />
          </Box>
        </Box>
      </Box>

      <FormProvider {...viewFormMethods}>
        <DADataChangeModal
          open={viewModalOpen}
          onClose={handleViewModalClose}
          submissionId={selectedSubmissionId}
          mode={viewModalMode}
          onModeChange={handleModeChange}
          selectedEntry={submissionDetails}
          isLoading={modalLoading || detailsLoading}
          onRefreshDetails={handleRefreshDetails}
          onCreateMDA={handleCreateMDA}
        />
      </FormProvider>
      {/* MDA Modal for creating MDA from DA */}
      <FormProvider {...mdaFormMethods}>
        <MDADAModal
          open={mdaModalOpen}
          onClose={handleMdaModalClose}
          daSubmissionId={mdaSubmissionId}
          onSave={handleSaveMDA}
          mode="create"
        />
      </FormProvider>
    </>
  );
};

export default MDADAForMDAProcessing;
