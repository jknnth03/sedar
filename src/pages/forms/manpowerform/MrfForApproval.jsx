import React, { useState, useMemo, useCallback, useEffect } from "react";
import { Typography, TablePagination, Box, useTheme } from "@mui/material";
import { FormProvider, useForm } from "react-hook-form";
import { useSnackbar } from "notistack";
import "../../../pages/GeneralStyle.scss";
import { styles } from "../manpowerform/FormSubmissionStyles";
import {
  useGetMrfSubmissionsQuery,
  useCreateMrfSubmissionMutation,
  useUpdateMrfSubmissionMutation,
  useGetSingleMrfSubmissionQuery,
  useResubmitMrfSubmissionMutation,
  useCancelMrfSubmissionMutation,
} from "../../../features/api/forms/mrfApi";
import MrfTable from "./MrfTable";
import FormSubmissionModal from "../../../components/modal/form/ManpowerForm/FormSubmissionModal";
import ConfirmationDialog from "../../../styles/ConfirmationDialog";

const MrfForApproval = ({
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
  const [modalLoading, setModalLoading] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState({});
  const [selectedRowForMenu, setSelectedRowForMenu] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [selectedSubmissionForAction, setSelectedSubmissionForAction] =
    useState(null);
  const [pendingFormData, setPendingFormData] = useState(null);
  const [modalSuccessHandler, setModalSuccessHandler] = useState(null);

  const handleModalSuccessCallback = useCallback((successHandler) => {
    setModalSuccessHandler(() => successHandler);
  }, []);

  const methods = useForm({
    defaultValues: {
      position_id: null,
      job_level_id: null,
      expected_salary: "",
      employment_type: "",
      requisition_type_id: null,
      employee_to_be_replaced_id: null,
      justification: "",
      remarks: "",
    },
  });

  const queryParams = useMemo(() => {
    return {
      page: 1,
      per_page: 10,
      status: "active",
      pagination: true,
      approval_status: "pending",
    };
  }, []);

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
  } = useGetMrfSubmissionsQuery(queryParams, {
    refetchOnMountOrArgChange: true,
    skip: false,
  });

  const {
    data: submissionDetails,
    isLoading: detailsLoading,
    refetch: refetchDetails,
  } = useGetSingleMrfSubmissionQuery(selectedSubmissionId, {
    skip: !selectedSubmissionId,
    refetchOnMountOrArgChange: true,
  });

  const [createMrfSubmission] = useCreateMrfSubmissionMutation();
  const [updateMrfSubmission] = useUpdateMrfSubmissionMutation();
  const [resubmitMrfSubmission] = useResubmitMrfSubmissionMutation();
  const [cancelMrfSubmission] = useCancelMrfSubmissionMutation();

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

  const handleRowClick = useCallback((submission) => {
    setModalMode("view");
    setSelectedSubmissionId(submission.id);
    setMenuAnchor({});
    setSelectedRowForMenu(null);
    setModalOpen(true);
  }, []);

  const handleUpdateSubmission = useCallback((submission) => {
    setSelectedSubmissionId(submission.id);
    setMenuAnchor({});
    setSelectedRowForMenu(null);
    setModalMode("edit");
    setModalOpen(true);
  }, []);

  const handleResubmitSubmission = useCallback((submission) => {
    setSelectedSubmissionId(submission.id);
    setMenuAnchor({});
    setSelectedRowForMenu(null);
    setModalMode("resubmit");
    setModalOpen(true);
  }, []);

  const handleCancelSubmission = useCallback(
    async (submissionId) => {
      const submission = filteredSubmissions.find(
        (sub) => sub.id === submissionId
      );
      if (submission) {
        setSelectedSubmissionForAction(submission);
        setConfirmAction("cancel");
        setConfirmOpen(true);
      } else {
        enqueueSnackbar("Submission not found. Please try again.", {
          variant: "error",
          autoHideDuration: 2000,
        });
      }
    },
    [filteredSubmissions, enqueueSnackbar]
  );

  const handleModalClose = useCallback(() => {
    setModalOpen(false);
    setSelectedSubmissionId(null);
    setModalLoading(false);
    setModalMode("view");
  }, []);

  const handleRefreshDetails = useCallback(() => {
    if (selectedSubmissionId && refetchDetails) {
      refetchDetails();
    }
  }, [selectedSubmissionId, refetchDetails]);

  const handleModalSave = useCallback(
    async (submissionData, mode, submissionId) => {
      if (mode === "create") {
        setPendingFormData(submissionData);
        setConfirmAction("create");
        setConfirmOpen(true);
        return;
      }

      if (mode === "edit") {
        const submission =
          submissionDetails?.result ||
          filteredSubmissions.find((sub) => sub.id === submissionId);

        setSelectedSubmissionForAction(submission);
        setPendingFormData(submissionData);
        setConfirmAction("update");
        setConfirmOpen(true);
        return;
      }

      if (mode === "resubmit") {
        const submission =
          submissionDetails?.result ||
          filteredSubmissions.find((sub) => sub.id === submissionId);

        setSelectedSubmissionForAction(submission);
        setPendingFormData(submissionData);
        setConfirmAction("resubmit");
        setConfirmOpen(true);
        return;
      }

      try {
        await resubmitMrfSubmission(submissionData).unwrap();
        enqueueSnackbar("Submission processed successfully!", {
          variant: "success",
          autoHideDuration: 2000,
        });
        refetch();
        handleModalClose();
      } catch (error) {
        const errorMessage =
          error?.data?.message ||
          "Failed to save submission. Please try again.";
        enqueueSnackbar(errorMessage, {
          variant: "error",
          autoHideDuration: 2000,
        });
      }
    },
    [
      refetch,
      enqueueSnackbar,
      handleModalClose,
      submissionDetails,
      filteredSubmissions,
      resubmitMrfSubmission,
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

  const handleActionConfirm = async () => {
    if (!confirmAction) return;

    setIsLoading(true);

    try {
      if (confirmAction === "cancel" && selectedSubmissionForAction) {
        await cancelMrfSubmission(selectedSubmissionForAction.id).unwrap();
        enqueueSnackbar("MRF submission cancelled successfully!", {
          variant: "success",
          autoHideDuration: 2000,
        });
        refetch();
      } else if (confirmAction === "create" && pendingFormData) {
        await createMrfSubmission(pendingFormData).unwrap();
        enqueueSnackbar("MRF submission created successfully!", {
          variant: "success",
          autoHideDuration: 2000,
        });
        refetch();
        handleModalClose();
      } else if (
        confirmAction === "update" &&
        pendingFormData &&
        selectedSubmissionForAction
      ) {
        await updateMrfSubmission({
          id: selectedSubmissionForAction.id,
          body: pendingFormData,
        }).unwrap();

        enqueueSnackbar("MRF submission updated successfully!", {
          variant: "success",
          autoHideDuration: 2000,
        });
        refetch();
        handleModalClose();
      } else if (
        confirmAction === "resubmit" &&
        pendingFormData &&
        selectedSubmissionForAction
      ) {
        await resubmitMrfSubmission({
          id: selectedSubmissionForAction.id,
          data: pendingFormData,
        }).unwrap();
        enqueueSnackbar("MRF submission resubmitted successfully!", {
          variant: "success",
          autoHideDuration: 2000,
        });
        refetch();
        handleModalClose();
        if (modalSuccessHandler) {
          modalSuccessHandler();
        }
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
      setPendingFormData(null);
      setIsLoading(false);
    }
  };

  const handleConfirmationCancel = useCallback(() => {
    setConfirmOpen(false);
    setSelectedSubmissionForAction(null);
    setConfirmAction(null);
    setPendingFormData(null);
  }, []);

  const getSubmissionDisplayName = useCallback(() => {
    const submissionForAction =
      selectedSubmissionForAction?.reference_number ||
      "Manpower Requisition Form";
    return submissionForAction;
  }, [selectedSubmissionForAction]);

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
          <MrfTable
            submissionsList={paginatedSubmissions}
            isLoadingState={isLoadingState}
            error={error}
            handleRowClick={handleRowClick}
            handleMenuOpen={handleMenuOpen}
            handleMenuClose={handleMenuClose}
            menuAnchor={menuAnchor}
            searchQuery={searchQuery}
            hideActions={false}
            onCancel={handleCancelSubmission}
            onUpdate={handleUpdateSubmission}
            onResubmit={handleResubmitSubmission}
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

        <FormSubmissionModal
          open={modalOpen}
          onClose={handleModalClose}
          mode={modalMode}
          onModeChange={handleModeChange}
          selectedEntry={submissionDetails?.result || submissionDetails}
          isLoading={modalLoading || detailsLoading}
          onSave={handleModalSave}
          onResubmit={handleModalSave}
          onRefreshDetails={handleRefreshDetails}
          onSuccessfulSave={handleModalSuccessCallback}
        />

        <ConfirmationDialog
          open={confirmOpen}
          onClose={handleConfirmationCancel}
          onConfirm={handleActionConfirm}
          isLoading={isLoading}
          action={confirmAction}
          itemName={getSubmissionDisplayName()}
        />
      </Box>
    </FormProvider>
  );
};

export default MrfForApproval;
