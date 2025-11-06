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
import { styles } from "../../forms/manpowerform/FormSubmissionStyles";
import {
  useGetCatTwoTasksQuery,
  useGetCatTwoTaskByIdQuery,
  useSaveCatTwoAsDraftMutation,
  useSubmitCatTwoMutation,
} from "../../../features/api/da-task/catTwoApi";
import CatTwoTable from "./CatTwoTable";
import CatTwoModal from "../../../components/modal/da-task/CatTwoModal";
import { useCancelFormSubmissionMutation } from "../../../features/api/approvalsetting/formSubmissionApi";

const CatTwoReturned = ({
  searchQuery,
  dateFilters,
  filterDataByDate,
  filterDataBySearch,
  setQueryParams,
  currentParams,
  data,
  isLoading: externalIsLoading,
  page: externalPage,
  rowsPerPage: externalRowsPerPage,
  onPageChange,
  onRowsPerPageChange,
}) => {
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();

  const [page, setPage] = useState(
    externalPage || parseInt(currentParams?.page) || 1
  );
  const [rowsPerPage, setRowsPerPage] = useState(
    externalRowsPerPage || parseInt(currentParams?.rowsPerPage) || 10
  );
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("view");
  const [selectedSubmissionId, setSelectedSubmissionId] = useState(null);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
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
      template_id: null,
      employee_id: null,
      date_assessed: null,
      remarks: "",
    },
  });

  useEffect(() => {
    if (externalPage !== undefined) {
      setPage(externalPage);
    }
  }, [externalPage]);

  useEffect(() => {
    if (externalRowsPerPage !== undefined) {
      setRowsPerPage(externalRowsPerPage);
    }
  }, [externalRowsPerPage]);

  useEffect(() => {
    const newPage = 1;
    setPage(newPage);
    if (onPageChange) {
      onPageChange(newPage);
    }
  }, [searchQuery, dateFilters]);

  const {
    data: taskData,
    isLoading: queryLoading,
    isFetching,
    refetch,
    error,
  } = useGetCatTwoTasksQuery(
    {
      pagination: 1,
      page: page,
      per_page: rowsPerPage,
      status: "RETURNED",
    },
    {
      refetchOnMountOrArgChange: true,
      skip: false,
    }
  );

  const {
    data: catTwoDetails,
    isLoading: detailsLoading,
    refetch: refetchDetails,
  } = useGetCatTwoTaskByIdQuery(selectedSubmissionId, {
    skip: !selectedSubmissionId,
    refetchOnMountOrArgChange: true,
  });

  const submissionDetails = useMemo(() => {
    if (!catTwoDetails?.result) return null;
    return catTwoDetails;
  }, [catTwoDetails]);

  const [submitCatTwo] = useSubmitCatTwoMutation();
  const [saveCatTwoAsDraft] = useSaveCatTwoAsDraftMutation();
  const [cancelCatTwoSubmission] = useCancelFormSubmissionMutation();

  const submissionsData = useMemo(() => {
    const dataSource = data || taskData;
    if (!dataSource?.result) return [];

    const result = dataSource.result;

    if (Array.isArray(result)) {
      return result.filter((item) => item.status === "RETURNED");
    }

    if (result.status === "RETURNED") {
      return [result];
    }

    return [];
  }, [data, taskData]);

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
    setSelectedSubmission(null);
    setModalMode("view");
  }, []);

  const handleRefreshDetails = useCallback(() => {
    refetch();
    if (selectedSubmissionId) {
      refetchDetails();
    }
  }, [refetch, refetchDetails, selectedSubmissionId]);

  const handleModalSaveAsDraft = useCallback(
    async (submissionData, submissionId) => {
      try {
        setIsLoading(true);
        await saveCatTwoAsDraft({
          taskId: submissionId,
          ...submissionData,
        }).unwrap();
        enqueueSnackbar("CAT 2 assessment saved as draft successfully!", {
          variant: "success",
          autoHideDuration: 2000,
        });
        refetch();
        if (selectedSubmissionId) {
          refetchDetails();
        }
        if (modalSuccessHandler) {
          modalSuccessHandler();
        }
      } catch (error) {
        const errorMessage =
          error?.data?.message || "Failed to save as draft. Please try again.";
        enqueueSnackbar(errorMessage, {
          variant: "error",
          autoHideDuration: 2000,
        });
      } finally {
        setIsLoading(false);
      }
    },
    [
      saveCatTwoAsDraft,
      enqueueSnackbar,
      refetch,
      refetchDetails,
      selectedSubmissionId,
      modalSuccessHandler,
    ]
  );

  const handleModalSave = useCallback(
    async (submissionData, mode, submissionId) => {
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
        await submitCatTwo({
          taskId: submissionId,
          ...submissionData,
        }).unwrap();
        enqueueSnackbar("Assessment submitted successfully!", {
          variant: "success",
          autoHideDuration: 2000,
        });
        refetch();
        handleModalClose();
      } catch (error) {
        const errorMessage =
          error?.data?.message ||
          "Failed to submit assessment. Please try again.";
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
      submitCatTwo,
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
      if (onPageChange) {
        onPageChange(targetPage);
      }
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
    [onPageChange, setQueryParams, rowsPerPage, currentParams]
  );

  const handleRowsPerPageChange = useCallback(
    (event) => {
      const newRowsPerPage = parseInt(event.target.value, 10);
      const newPage = 1;
      setRowsPerPage(newRowsPerPage);
      setPage(newPage);
      if (onRowsPerPageChange) {
        onRowsPerPageChange(newRowsPerPage);
      }
      if (onPageChange) {
        onPageChange(newPage);
      }
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
    [onPageChange, onRowsPerPageChange, setQueryParams, currentParams]
  );

  const handleModeChange = useCallback((newMode) => {
    setModalMode(newMode);
  }, []);

  const handleActionConfirm = async () => {
    if (!confirmAction) return;

    setIsLoading(true);

    try {
      if (confirmAction === "cancel" && selectedSubmissionForAction) {
        await cancelCatTwoSubmission(selectedSubmissionForAction.id).unwrap();
        enqueueSnackbar("CAT 2 assessment cancelled successfully!", {
          variant: "success",
          autoHideDuration: 2000,
        });
        refetch();
      } else if (
        confirmAction === "update" &&
        pendingFormData &&
        selectedSubmissionForAction
      ) {
        try {
          const result = await saveCatTwoAsDraft({
            taskId: selectedSubmissionForAction.id,
            ...pendingFormData,
          }).unwrap();

          enqueueSnackbar("CAT 2 assessment updated successfully!", {
            variant: "success",
            autoHideDuration: 2000,
          });
          refetch();
          if (selectedSubmissionId) {
            refetchDetails();
          }
          handleModalClose();
        } catch (updateError) {
          throw updateError;
        }
      } else if (confirmAction === "resubmit" && pendingFormData) {
        await submitCatTwo({
          taskId: selectedSubmissionForAction.id,
          ...pendingFormData,
        }).unwrap();
        enqueueSnackbar("CAT 2 assessment resubmitted successfully!", {
          variant: "success",
          autoHideDuration: 2000,
        });
        refetch();
        if (modalSuccessHandler) {
          modalSuccessHandler();
        }
        handleModalClose();
      }
    } catch (error) {
      const errorMessage =
        error?.data?.message ||
        `Failed to ${confirmAction} assessment. Please try again.`;
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
    if (confirmAction === "cancel") {
      return (
        <>
          Are you sure you want to <strong>Cancel</strong> this CAT 2
          Assessment?
        </>
      );
    } else if (confirmAction === "update") {
      return (
        <>
          Are you sure you want to <strong>Update</strong> this CAT 2
          Assessment?
        </>
      );
    } else if (confirmAction === "resubmit") {
      return (
        <>
          Are you sure you want to <strong>Resubmit</strong> this CAT 2
          Assessment?
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
      selectedSubmissionForAction?.data_change?.reference_number ||
      selectedSubmissionForAction?.reference_number ||
      "CAT 2 Assessment";
    return submissionForAction;
  }, [selectedSubmissionForAction]);

  const getConfirmationIcon = useCallback(() => {
    const iconConfig = {
      cancel: { color: "#ff4400", icon: "?" },
      update: { color: "#2196f3", icon: "✎" },
      resubmit: { color: "#4caf50", icon: "↻" },
    };

    const config = iconConfig[confirmAction] || iconConfig.cancel;
    return config;
  }, [confirmAction]);

  const isLoadingState =
    externalIsLoading !== undefined
      ? externalIsLoading
      : queryLoading || isFetching || isLoading;

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
          <CatTwoTable
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
            hideStatusColumn={true}
            forReturned={true}
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
              count={filteredSubmissions.length}
              rowsPerPage={rowsPerPage}
              page={Math.max(0, page - 1)}
              onPageChange={handlePageChange}
              onRowsPerPageChange={handleRowsPerPageChange}
            />
          </Box>
        </Box>

        <CatTwoModal
          open={modalOpen}
          onClose={handleModalClose}
          mode={modalMode}
          onModeChange={handleModeChange}
          selectedEntry={submissionDetails?.result || selectedSubmission}
          isLoading={detailsLoading}
          onSave={handleModalSave}
          onSaveAsDraft={handleModalSaveAsDraft}
          onRefreshDetails={handleRefreshDetails}
          onSuccessfulSave={handleModalSuccessCallback}
          forReturned={true}
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
      </Box>
    </FormProvider>
  );
};

export default CatTwoReturned;
