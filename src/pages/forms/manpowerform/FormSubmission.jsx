import React, { useState, useMemo, useCallback, useEffect } from "react";
import {
  Paper,
  Typography,
  TablePagination,
  CircularProgress,
  Box,
  TextField,
  Button,
  useTheme,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { FormProvider, useForm } from "react-hook-form";
import { useSnackbar } from "notistack";
import "../../../pages/GeneralStyle.scss";
import {
  useGetMrfSubmissionsQuery,
  useUpdateFormSubmissionMutation,
  useResubmitFormSubmissionMutation,
  useCancelFormSubmissionMutation,
} from "../../../features/api/approvalsetting/formSubmissionApi";
import FormSubmissionModal from "../../../components/modal/form/ManpowerForm/FormSubmissionModal";
import FormSubmissionTable from "./FormSubmissionTable";
import ConfirmationDialog from "./ConfirmationDialog";
import { styles } from "./FormSubmissionStyles";

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

const FormSubmission = ({ searchQuery, startDate, endDate }) => {
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();

  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [localSearchQuery, setLocalSearchQuery] = useState("");
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
  const effectiveSearchQuery =
    searchQuery !== undefined ? searchQuery : localSearchQuery;
  const debounceValue = useDebounce(effectiveSearchQuery, 500);

  const queryParams = useMemo(() => {
    const params = {
      page,
      per_page: rowsPerPage,
      status: "active",
      pagination: true,
      approval_status: "pending",
    };

    if (debounceValue && debounceValue.trim() !== "") {
      params.search = debounceValue.trim();
    }

    if (startDate) {
      params.start_date = startDate;
    }

    if (endDate) {
      params.end_date = endDate;
    }

    return params;
  }, [debounceValue, page, rowsPerPage, startDate, endDate]);

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
    const resubmittableStatuses = [
      "AWAITING_RESUBMISSION",
      "AWAITING RESUBMISSION",
      "REJECTED",
      "RETURNED",
    ];
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
    const editableStatuses = [
      "AWAITING_RESUBMISSION",
      "AWAITING RESUBMISSION",
      "REJECTED",
      "RETURNED",
    ];
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
    const cancellableStatuses = [
      "AWAITING_RESUBMISSION",
      "AWAITING RESUBMISSION",
      "REJECTED",
      "RETURNED",
      "PENDING",
    ];
    return cancellableStatuses.includes(submission?.status);
  }, []);

  const handleSearchChange = useCallback((newSearchQuery) => {
    setLocalSearchQuery(newSearchQuery);
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
          if (pendingFormData) {
            result = await updateSubmission(pendingFormData).unwrap();
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

  const getSubmissionDisplayName = useCallback(() => {
    if (confirmAction === "update") {
      const formName =
        selectedSubmission?.form?.name ||
        selectedSubmission?.form ||
        "Manpower Form";
      return typeof formName === "string" ? formName : "Manpower Form";
    }

    const submissionForAction =
      selectedSubmissionForAction?.form?.name ||
      selectedSubmissionForAction?.form ||
      "Untitled Submission";
    return typeof submissionForAction === "string"
      ? submissionForAction
      : "Untitled Submission";
  }, [confirmAction, selectedSubmission, selectedSubmissionForAction]);

  const isLoadingState = queryLoading || isFetching || isLoading;

  return (
    <FormProvider {...methods}>
      <Box sx={styles.mainContainer}>
        <Box sx={styles.contentContainer}>
          <FormSubmissionTable
            submissionsList={submissionsList}
            isLoadingState={isLoadingState}
            error={error}
            searchQuery={effectiveSearchQuery}
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

        <ConfirmationDialog
          open={confirmOpen}
          onClose={() => setConfirmOpen(false)}
          onConfirm={handleActionConfirm}
          isLoading={isLoading}
          action={confirmAction}
          itemName={getSubmissionDisplayName()}
        />

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

export default FormSubmission;
