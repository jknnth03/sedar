import React, { useState, useMemo, useCallback, useEffect } from "react";
import {
  Paper,
  Typography,
  TablePagination,
  CircularProgress,
  Box,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useTheme,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { FormProvider, useForm } from "react-hook-form";
import { useSnackbar } from "notistack";
import "../../../pages/GeneralStyle.scss";
import formSubmissionApi, {
  useGetMrfSubmissionsQuery,
  useUpdateFormSubmissionMutation,
  useResubmitFormSubmissionMutation,
  useCancelFormSubmissionMutation,
} from "../../../features/api/approvalsetting/formSubmissionApi";
import FormSubmissionModal from "../../../components/modal/form/ManpowerForm/FormSubmissionModal";
import MrfReturnedTable from "./MrfReturnedTable";
import { styles } from "./FormSubmissionStyles";
import { useDispatch } from "react-redux";

const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

const MrfReturned = () => {
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();
  const dispatch = useDispatch();
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("view");
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState({});
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [selectedSubmissionForAction, setSelectedSubmissionForAction] =
    useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [pendingFormData, setPendingFormData] = useState(null);

  const methods = useForm();
  const debounceValue = useDebounce(searchQuery, 500);

  const queryParams = useMemo(() => {
    const params = {
      page,
      per_page: rowsPerPage,
      status: "active",
      pagination: true,
      approval_status: ["returned"], // Changed from "for receiving" to "returned"
    };

    if (debounceValue && debounceValue.trim() !== "") {
      params.search = debounceValue.trim();
    }

    return params;
  }, [debounceValue, page, rowsPerPage]);

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

  const [updateSubmission] = useUpdateFormSubmissionMutation();
  const [resubmitSubmission] = useResubmitFormSubmissionMutation();
  const [cancelSubmission] = useCancelFormSubmissionMutation();

  const submissionsList = useMemo(
    () => submissionsData?.result?.data || [],
    [submissionsData]
  );

  const canResubmitSubmission = useCallback((submission) => {
    if (!submission) return false;
    if (
      submission.actions &&
      typeof submission.actions.can_resubmit === "boolean"
    ) {
      return submission.actions.can_resubmit;
    }
    // Updated to focus on "RETURNED" status
    const resubmittableStatuses = ["REJECTED", "RETURNED"];
    return resubmittableStatuses.includes(submission?.status);
  }, []);

  const canEditSubmission = useCallback((submission) => {
    if (!submission) return false;
    if (
      submission.actions &&
      typeof submission.actions.can_update === "boolean"
    ) {
      return submission.actions.can_update;
    }
    // Updated to focus on "RETURNED" status
    const editableStatuses = ["REJECTED", "RETURNED"];
    return editableStatuses.includes(submission?.status);
  }, []);

  const canCancelSubmission = useCallback((submission) => {
    if (!submission) return false;
    if (
      submission.actions &&
      typeof submission.actions.can_cancel === "boolean"
    ) {
      return submission.actions.can_cancel;
    }
    // Updated to focus on "RETURNED" status
    const cancellableStatuses = ["REJECTED", "RETURNED", "PENDING"];
    return cancellableStatuses.includes(submission?.status);
  }, []);

  const handleSearchChange = useCallback((newSearchQuery) => {
    setSearchQuery(newSearchQuery);
    setPage(1);
  }, []);

  const handleRowClick = useCallback((submission) => {
    setSelectedSubmission(submission);
    setModalMode("view");
    setModalOpen(true);
  }, []);

  const handleEditSubmission = useCallback(
    (submission) => {
      if (canEditSubmission(submission)) {
        setSelectedSubmission(submission);
        setModalMode("edit");
        setModalOpen(true);
      } else {
        enqueueSnackbar(
          "This submission cannot be edited in its current status.",
          {
            variant: "warning",
            autoHideDuration: 3000,
          }
        );
      }
    },
    [canEditSubmission, enqueueSnackbar]
  );

  const handleModalClose = useCallback(() => {
    setModalOpen(false);
    setSelectedSubmission(null);
    setModalMode("view");
    methods.reset();
    setPendingFormData(null);
  }, [methods]);

  const handleModeChange = useCallback((newMode) => {
    setModalMode(newMode);
  }, []);

  const handleModalSave = useCallback(async (submissionData, mode) => {
    setPendingFormData(submissionData);
    setConfirmAction("update");
    setConfirmOpen(true);
  }, []);

  const handleResubmitSubmission = useCallback(
    async (submissionId) => {
      const submission = submissionsList.find((sub) => sub.id === submissionId);
      if (submission) {
        if (canResubmitSubmission(submission)) {
          setSelectedSubmissionForAction(submission);
          setConfirmAction("resubmit");
          setConfirmOpen(true);
        } else {
          enqueueSnackbar(
            "This submission cannot be resubmitted in its current status.",
            {
              variant: "warning",
              autoHideDuration: 3000,
            }
          );
        }
      } else {
        enqueueSnackbar("Submission not found. Please try again.", {
          variant: "error",
          autoHideDuration: 2000,
        });
      }
    },
    [submissionsList, canResubmitSubmission, enqueueSnackbar]
  );

  const handleCancelSubmission = useCallback(
    async (submissionId) => {
      const submission = submissionsList.find((sub) => sub.id === submissionId);
      if (submission) {
        if (canCancelSubmission(submission)) {
          setSelectedSubmissionForAction(submission);
          setConfirmAction("cancel");
          setConfirmOpen(true);
        } else {
          enqueueSnackbar(
            "This submission cannot be cancelled in its current status.",
            {
              variant: "warning",
              autoHideDuration: 3000,
            }
          );
        }
      } else {
        enqueueSnackbar("Submission not found. Please try again.", {
          variant: "error",
          autoHideDuration: 2000,
        });
      }
    },
    [submissionsList, canCancelSubmission, enqueueSnackbar]
  );

  const handleMenuOpen = useCallback((event, submission) => {
    event.stopPropagation();
    setMenuAnchor((prev) => ({
      ...prev,
      [submission.id]: event.currentTarget,
    }));
  }, []);

  const handleMenuClose = useCallback((submissionId) => {
    setMenuAnchor((prev) => ({ ...prev, [submissionId]: null }));
  }, []);

  const handleActionClick = useCallback(
    (submission, action, event) => {
      if (event) {
        event.stopPropagation();
      }

      if (action === "edit" && !canEditSubmission(submission)) {
        enqueueSnackbar(
          "This submission cannot be edited in its current status.",
          {
            variant: "warning",
            autoHideDuration: 3000,
          }
        );
        handleMenuClose(submission.id);
        return;
      }

      if (action === "resubmit" && !canResubmitSubmission(submission)) {
        enqueueSnackbar(
          "This submission cannot be resubmitted in its current status.",
          {
            variant: "warning",
            autoHideDuration: 3000,
          }
        );
        handleMenuClose(submission.id);
        return;
      }

      if (action === "cancel" && !canCancelSubmission(submission)) {
        enqueueSnackbar(
          "This submission cannot be cancelled in its current status.",
          {
            variant: "warning",
            autoHideDuration: 3000,
          }
        );
        handleMenuClose(submission.id);
        return;
      }

      setSelectedSubmissionForAction(submission);
      setConfirmAction(action);
      setConfirmOpen(true);
      handleMenuClose(submission.id);
    },
    [
      handleMenuClose,
      canEditSubmission,
      canResubmitSubmission,
      canCancelSubmission,
      enqueueSnackbar,
    ]
  );

  const handleActionConfirm = async () => {
    if (!confirmAction) return;

    setIsLoading(true);
    setModalLoading(true);

    try {
      let result;

      switch (confirmAction) {
        case "update":
          if (pendingFormData && selectedSubmission) {
            result = await updateSubmission({
              id: selectedSubmission.id,
              data: pendingFormData,
            }).unwrap();
            dispatch(formSubmissionApi.util.invalidateTags(["mrfSubmissions"]));
          }
          break;
        case "resubmit":
          if (selectedSubmissionForAction) {
            if (!canResubmitSubmission(selectedSubmissionForAction)) {
              throw new Error(
                "Submission cannot be resubmitted in its current status"
              );
            }
            result = await resubmitSubmission(
              selectedSubmissionForAction.id
            ).unwrap();
          }
          break;
        case "cancel":
          if (selectedSubmissionForAction) {
            if (!canCancelSubmission(selectedSubmissionForAction)) {
              throw new Error(
                "Submission cannot be cancelled in its current status"
              );
            }
            result = await cancelSubmission(
              selectedSubmissionForAction.id
            ).unwrap();
          }
          break;
        default:
          throw new Error("Unknown action");
      }

      const actionMessages = {
        update: "Manpower form updated successfully!",
        resubmit: "Manpower form resubmitted successfully!",
        cancel: "Manpower form cancelled successfully!",
      };

      enqueueSnackbar(actionMessages[confirmAction], {
        variant: "success",
        autoHideDuration: 2000,
      });

      refetch();
      handleModalClose();
    } catch (error) {
      let errorMessage = "Action failed. Please try again.";

      if (confirmAction === "update") {
        errorMessage =
          "An approval process for this request has not been configured. Please contact your administrator.";
      } else if (confirmAction === "resubmit") {
        if (error?.data?.message) {
          errorMessage = error.data.message;
        } else if (error?.message) {
          errorMessage = error.message;
        } else {
          errorMessage = "Failed to resubmit manpower form. Please try again.";
        }
      } else if (confirmAction === "cancel") {
        if (error?.data?.message) {
          errorMessage = error.data.message;
        } else if (error?.message) {
          errorMessage = error.message;
        } else {
          errorMessage = "Failed to cancel manpower form. Please try again.";
        }
      }

      enqueueSnackbar(errorMessage, {
        variant: "error",
        autoHideDuration: 3000,
      });
    } finally {
      setConfirmOpen(false);
      setSelectedSubmissionForAction(null);
      setConfirmAction(null);
      setIsLoading(false);
      setModalLoading(false);
      setPendingFormData(null);
    }
  };

  const handlePageChange = useCallback((event, newPage) => {
    setPage(newPage + 1);
  }, []);

  const handleRowsPerPageChange = useCallback((event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(1);
  }, []);

  const getConfirmationMessage = useCallback(() => {
    if (!confirmAction) return "";

    const messages = {
      update: "Are you sure you want to update this manpower form?",
      resubmit: "Are you sure you want to resubmit this manpower form?",
      cancel: (
        <>
          Are you sure you want to <strong>Cancel</strong> this Manpower Form?
        </>
      ),
    };

    return messages[confirmAction] || "";
  }, [confirmAction]);

  const getConfirmationTitle = useCallback(() => {
    if (!confirmAction) return "Confirmation";

    const titles = {
      update: "Confirmation",
      resubmit: "Confirmation",
      cancel: "Confirmation",
    };

    return titles[confirmAction] || "Confirmation";
  }, [confirmAction]);

  const getConfirmButtonText = useCallback(() => {
    if (!confirmAction) return "CONFIRM";

    const texts = {
      update: "CONFIRM",
      resubmit: "CONFIRM",
      cancel: "CONFIRM",
    };

    return texts[confirmAction] || "CONFIRM";
  }, []);

  const getSubmissionDisplayName = useCallback(() => {
    if (confirmAction === "update") {
      return selectedSubmission?.form?.name || "Manpower Form";
    }
    return selectedSubmissionForAction?.form?.name || "Untitled Submission";
  }, [confirmAction, selectedSubmission, selectedSubmissionForAction]);

  const isLoadingState = queryLoading || isFetching || isLoading;

  return (
    <FormProvider {...methods}>
      <Box sx={styles.mainContainer}>
        <Box sx={styles.contentContainer}>
          <MrfReturnedTable
            submissionsList={submissionsList}
            isLoadingState={isLoadingState}
            error={error}
            searchQuery={searchQuery}
            showArchived={false}
            handleRowClick={handleRowClick}
            handleEditSubmission={handleEditSubmission}
            handleActionClick={handleActionClick}
            handleMenuOpen={handleMenuOpen}
            handleMenuClose={handleMenuClose}
            menuAnchor={menuAnchor}
            canResubmitSubmission={canResubmitSubmission}
            canEditSubmission={canEditSubmission}
            canCancelSubmission={canCancelSubmission}
            onCancel={handleCancelSubmission}
          />

          <Box sx={styles.paginationContainer}>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25, 50, 100]}
              component="div"
              count={submissionsData?.result?.total || 0}
              rowsPerPage={rowsPerPage}
              page={Math.max(0, page - 1)}
              onPageChange={handlePageChange}
              onRowsPerPageChange={handleRowsPerPageChange}
            />
          </Box>
        </Box>

        <Dialog
          open={confirmOpen}
          onClose={() => setConfirmOpen(false)}
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
                  backgroundColor: "#ff4400",
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
                  ?
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
              onClick={() => setConfirmOpen(false)}
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

        <FormSubmissionModal
          open={modalOpen}
          onClose={handleModalClose}
          onSave={handleModalSave}
          onResubmit={handleResubmitSubmission}
          onCancel={handleCancelSubmission}
          selectedEntry={selectedSubmission}
          isLoading={modalLoading}
          mode={modalMode}
          onModeChange={handleModeChange}
          canResubmit={
            selectedSubmission
              ? canResubmitSubmission(selectedSubmission)
              : false
          }
          canEdit={
            selectedSubmission ? canEditSubmission(selectedSubmission) : false
          }
        />
      </Box>
    </FormProvider>
  );
};

export default MrfReturned;
