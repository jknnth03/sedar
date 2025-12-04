import React, { useState, useMemo, useCallback, useEffect } from "react";
import {
  Box,
  useTheme,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  CircularProgress,
  Typography,
} from "@mui/material";
import { FormProvider, useForm } from "react-hook-form";
import { useSnackbar } from "notistack";
import "../../../pages/GeneralStyle.scss";
import {
  useGetDataChangeSubmissionsQuery,
  useLazyGetDataChangeSubmissionDetailsQuery,
  useCreateDataChangeSubmissionMutation,
  useUpdateDataChangeSubmissionMutation,
  useResubmitDataChangeSubmissionMutation,
} from "../../../features/api/forms/datachangeApi";
import DataChangeForapprovalTable from "./DataChangeForapprovalTable";
import DataChangeModal from "../../../components/modal/form/DataChange/DataChangeModal";
import { useRememberQueryParams } from "../../../hooks/useRememberQueryParams";
import CustomTablePagination from "../../zzzreusable/CustomTablePagination";

const DataChangeAwaitingResubmission = ({
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
  const [modalMode, setModalMode] = useState("view");
  const [selectedSubmissionId, setSelectedSubmissionId] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState({});
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
      reason_for_change: "",
      employee_id: null,
      new_position_id: null,
      remarks: "",
    },
  });

  const apiQueryParams = useMemo(() => {
    return {
      page: 1,
      per_page: 10,
      status: "active",
      approval_status: "awaiting resubmission",
      pagination: 1,
      search: searchQuery || "",
    };
  }, [searchQuery]);

  useEffect(() => {
    setPage(1);
  }, [searchQuery, dateFilters]);

  const {
    data: submissionsData,
    isLoading: queryLoading,
    isFetching,
    refetch,
    error,
  } = useGetDataChangeSubmissionsQuery(apiQueryParams, {
    refetchOnMountOrArgChange: true,
    skip: false,
  });

  const [
    triggerGetSubmission,
    { data: submissionDetails, isLoading: detailsLoading },
  ] = useLazyGetDataChangeSubmissionDetailsQuery();

  const [createDataChangeSubmission] = useCreateDataChangeSubmissionMutation();
  const [updateDataChangeSubmission] = useUpdateDataChangeSubmissionMutation();
  const [resubmitDataChangeSubmission] =
    useResubmitDataChangeSubmissionMutation();

  const filteredSubmissions = useMemo(() => {
    const rawData = submissionsData?.result?.data || [];

    let filtered = rawData.filter(
      (item) =>
        item.status?.toUpperCase() === "AWAITING RESUBMISSION" ||
        item.status?.toLowerCase() === "awaiting resubmission" ||
        item.status?.toLowerCase() === "awaiting_resubmission"
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

  const handleRowClick = useCallback(
    async (submission) => {
      setModalMode("view");
      setSelectedSubmissionId(submission.id);
      setMenuAnchor({});
      setModalOpen(true);

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
      setMenuAnchor({});
      setModalMode("edit");
      setModalOpen(true);

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
  }, []);

  const handleRefreshDetails = useCallback(() => {
    if (selectedSubmissionId) {
      triggerGetSubmission(selectedSubmissionId);
    }
  }, [selectedSubmissionId, triggerGetSubmission]);

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
        await resubmitDataChangeSubmission(submissionData).unwrap();
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
      resubmitDataChangeSubmission,
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
    setModalMode(newMode);
  }, []);

  const handleActionConfirm = async () => {
    if (!confirmAction) return;

    setIsLoading(true);

    try {
      if (confirmAction === "create" && pendingFormData) {
        await createDataChangeSubmission(pendingFormData).unwrap();
        enqueueSnackbar("Data change submission created successfully!", {
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
        await updateDataChangeSubmission({
          id: selectedSubmissionForAction.id,
          data: pendingFormData,
        }).unwrap();
        enqueueSnackbar("Data change submission updated successfully!", {
          variant: "success",
          autoHideDuration: 2000,
        });
        refetch();
        handleModalClose();
      } else if (confirmAction === "resubmit" && pendingFormData) {
        await resubmitDataChangeSubmission(pendingFormData).unwrap();
        enqueueSnackbar("Data change submission resubmitted successfully!", {
          variant: "success",
          autoHideDuration: 2000,
        });
        refetch();
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

  const getConfirmationMessage = useCallback(() => {
    if (confirmAction === "create") {
      return (
        <>
          Are you sure you want to <strong>Create</strong> this Data Change
          Request?
        </>
      );
    } else if (confirmAction === "update") {
      return (
        <>
          Are you sure you want to <strong>Update</strong> this Data Change
          Request?
        </>
      );
    } else if (confirmAction === "resubmit") {
      return (
        <>
          Are you sure you want to <strong>Resubmit</strong> this Data Change
          Request?
        </>
      );
    }
    return "";
  }, [confirmAction]);

  const getConfirmationTitle = useCallback(() => {
    return "Confirmation";
  }, []);

  const getConfirmButtonText = useCallback(() => {
    return "CONFIRM";
  }, []);

  const getSubmissionDisplayName = useCallback(() => {
    const submissionForAction =
      selectedSubmissionForAction?.reference_number || "Data Change Request";
    return submissionForAction;
  }, [selectedSubmissionForAction]);

  const getConfirmationIcon = useCallback(() => {
    const iconConfig = {
      create: { color: "#4caf50", icon: "+" },
      update: { color: "#2196f3", icon: "✎" },
      resubmit: { color: "#ff9800", icon: "↻" },
    };

    const config = iconConfig[confirmAction] || iconConfig.create;
    return config;
  }, [confirmAction]);

  const isLoadingState = queryLoading || isFetching || isLoading;

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
        <DataChangeForapprovalTable
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
          hideStatusColumn={true}
          forApproval={true}
          onCancel={onCancel}
        />

        <CustomTablePagination
          count={filteredSubmissions.length}
          page={Math.max(0, page - 1)}
          rowsPerPage={rowsPerPage}
          onPageChange={handlePageChange}
          onRowsPerPageChange={handleRowsPerPageChange}
        />
      </Box>

      <DataChangeModal
        open={modalOpen}
        onClose={handleModalClose}
        mode={modalMode}
        onModeChange={handleModeChange}
        selectedEntry={submissionDetails}
        isLoading={modalLoading || detailsLoading}
        onSave={handleModalSave}
        onResubmit={async (entryId) => {
          console.log("onResubmit called with ID:", entryId);
          try {
            const result = await resubmitDataChangeSubmission(entryId).unwrap();
            console.log("Resubmit result:", result);
            enqueueSnackbar("Data change resubmitted successfully!", {
              variant: "success",
              autoHideDuration: 2000,
            });
            refetch();
            handleModalClose();
            return true;
          } catch (error) {
            console.error("Resubmit error:", error);
            const errorMessage =
              error?.data?.message || "Failed to resubmit. Please try again.";
            enqueueSnackbar(errorMessage, {
              variant: "error",
              autoHideDuration: 2000,
            });
            return false;
          }
        }}
      />

      <Dialog
        open={confirmOpen}
        onClose={handleConfirmationCancel}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            padding: 2,
            boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
            textAlign: "center",
          },
        }}>
        <DialogTitle sx={{ padding: 0, marginBottom: 2 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              marginBottom: 2,
            }}>
            <Box
              sx={{
                width: 60,
                height: 60,
                borderRadius: "50%",
                backgroundColor: getConfirmationIcon().color,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}>
              <Typography
                sx={{
                  color: "white",
                  fontSize: "30px",
                  fontWeight: "normal",
                }}>
                {getConfirmationIcon().icon}
              </Typography>
            </Box>
          </Box>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 600,
              color: "rgb(25, 45, 84)",
              marginBottom: 0,
            }}>
            {getConfirmationTitle()}
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ padding: 0, textAlign: "center" }}>
          <Typography
            variant="body1"
            sx={{
              marginBottom: 2,
              fontSize: "16px",
              color: "#333",
              fontWeight: 400,
            }}>
            {getConfirmationMessage()}
          </Typography>
          <Typography
            variant="body2"
            sx={{
              fontSize: "14px",
              color: "#666",
              fontWeight: 500,
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}>
            {getSubmissionDisplayName()}
          </Typography>
        </DialogContent>
        <DialogActions
          sx={{
            justifyContent: "center",
            padding: 0,
            marginTop: 3,
            gap: 2,
          }}>
          <Button
            onClick={handleConfirmationCancel}
            variant="outlined"
            sx={{
              textTransform: "uppercase",
              fontWeight: 600,
              borderColor: "#f44336",
              color: "#f44336",
              paddingX: 3,
              paddingY: 1,
              borderRadius: 2,
              "&:hover": {
                borderColor: "#d32f2f",
                backgroundColor: "rgba(244, 67, 54, 0.04)",
              },
            }}
            disabled={isLoading}>
            CANCEL
          </Button>
          <Button
            onClick={handleActionConfirm}
            variant="contained"
            sx={{
              textTransform: "uppercase",
              fontWeight: 600,
              backgroundColor: "#4caf50",
              paddingX: 3,
              paddingY: 1,
              borderRadius: 2,
              "&:hover": {
                backgroundColor: "#388e3c",
              },
            }}
            disabled={isLoading}>
            {isLoading ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              getConfirmButtonText()
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </FormProvider>
  );
};

export default DataChangeAwaitingResubmission;
