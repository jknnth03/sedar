import React, { useState, useMemo, useCallback, useEffect } from "react";
import {
  Paper,
  Typography,
  TablePagination,
  CircularProgress,
  Box,
  TextField,
  Checkbox,
  FormControlLabel,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useTheme,
  Fade,
  Tooltip,
  FormGroup,
  Chip,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import AddIcon from "@mui/icons-material/Add";
import HelpIcon from "@mui/icons-material/Help";
import { FormProvider, useForm } from "react-hook-form";
import { useSnackbar } from "notistack";
import "../../pages/GeneralStyle.scss";
import {
  useGetMrfSubmissionsQuery,
  useCreateFormSubmissionMutation,
  useUpdateFormSubmissionMutation,
  useResubmitFormSubmissionMutation,
  useCancelFormSubmissionMutation,
} from "../../features/api/approvalsetting/formSubmissionApi";
import FormSubmissionModal from "../../components/modal/approvalSettings/formSubmissionModal";
import FormSubmissionTable from "./FormSubmissionTable";
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

const approvalStatusOptions = [
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
  { value: "returned", label: "Returned" },
  { value: "for receiving", label: "For Receiving" },
  { value: "awaiting resubmission", label: "Awaiting Resubmission" },
  { value: "cancelled", label: "Cancelled" },
];

const FilterDialog = ({ open, onClose, selectedFilters, onFiltersChange }) => {
  const [tempFilters, setTempFilters] = useState(selectedFilters);

  useEffect(() => {
    setTempFilters(selectedFilters);
  }, [selectedFilters, open]);

  const handleFilterToggle = (filterValue) => {
    setTempFilters((prev) =>
      prev.includes(filterValue)
        ? prev.filter((f) => f !== filterValue)
        : [...prev, filterValue]
    );
  };

  const handleApply = () => {
    onFiltersChange(tempFilters);
    onClose();
  };

  const handleClear = () => {
    setTempFilters([]);
  };

  const handleSelectAll = () => {
    setTempFilters(approvalStatusOptions.map((option) => option.value));
  };

  const handleToggleAll = () => {
    if (tempFilters.length === approvalStatusOptions.length) {
      handleClear();
    } else {
      handleSelectAll();
    }
  };

  const isAllSelected = tempFilters.length === approvalStatusOptions.length;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: styles.filterDialog,
      }}>
      <DialogTitle>
        <Box sx={styles.filterDialogTitle}>
          <Box sx={styles.filterDialogTitleLeft}>
            <FilterListIcon sx={styles.filterIcon} />
            <Typography variant="h6" sx={styles.filterDialogTitleText}>
              FILTER BY STATUS
            </Typography>
          </Box>
          <Button
            size="small"
            variant="outlined"
            onClick={handleToggleAll}
            sx={{
              ...styles.selectAllButton,
              ...(isAllSelected && styles.unselectAllButton),
            }}>
            {isAllSelected ? "Unselect All" : "Select All"}
          </Button>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Box sx={styles.filterDialogContent}>
          {approvalStatusOptions.map((option) => (
            <FormControlLabel
              key={option.value}
              control={
                <Checkbox
                  checked={tempFilters.includes(option.value)}
                  onChange={() => handleFilterToggle(option.value)}
                  sx={styles.filterCheckbox}
                />
              }
              label={option.label}
              sx={styles.filterFormControlLabel}
            />
          ))}
        </Box>
      </DialogContent>

      <DialogActions sx={styles.filterDialogActions}>
        <Box sx={styles.dialogActionsContainer}>
          <Box sx={styles.dialogButtonsContainer}>
            <Button
              onClick={onClose}
              variant="outlined"
              sx={styles.cancelButton}>
              CANCEL
            </Button>
            <Button
              onClick={handleApply}
              variant="contained"
              sx={styles.applyFiltersButton}>
              APPLY FILTERS
            </Button>
          </Box>
        </Box>
      </DialogActions>
    </Dialog>
  );
};

const CustomSearchBar = ({
  searchQuery,
  setSearchQuery,
  selectedFilters,
  onFilterClick,
  isLoading = false,
}) => {
  const hasActiveFilters = selectedFilters.length > 0;
  const iconColor = hasActiveFilters
    ? "rgba(0, 133, 49, 1)"
    : "rgb(33, 61, 112)";

  return (
    <Box sx={styles.searchBarContainer}>
      <Tooltip title="Click here to filter by approval status" arrow>
        <FormControlLabel
          control={
            <Checkbox
              checked={hasActiveFilters}
              onChange={onFilterClick}
              disabled={isLoading}
              icon={<FilterListIcon sx={{ color: iconColor }} />}
              checkedIcon={<FilterListIcon sx={{ color: iconColor }} />}
              size="small"
            />
          }
          label={
            <Box sx={styles.filterLabelBox}>
              <span>FILTER</span>
              {hasActiveFilters && (
                <Chip
                  label={selectedFilters.length}
                  size="small"
                  sx={styles.filterCountChip}
                />
              )}
            </Box>
          }
          sx={styles.filterControlLabel(hasActiveFilters)}
        />
      </Tooltip>

      <TextField
        placeholder="Search form..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        disabled={isLoading}
        size="small"
        InputProps={{
          startAdornment: <SearchIcon sx={styles.searchIcon(isLoading)} />,
          endAdornment: isLoading && (
            <CircularProgress size={16} sx={styles.searchProgress} />
          ),
          sx: styles.searchInputProps(isLoading),
        }}
        sx={styles.searchTextField}
      />
    </Box>
  );
};

const FormSubmission = () => {
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();

  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilters, setSelectedFilters] = useState([]);
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState({});
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [selectedSubmissionForAction, setSelectedSubmissionForAction] =
    useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [pendingFormData, setPendingFormData] = useState(null);
  const [pendingMode, setPendingMode] = useState(null);

  const methods = useForm();
  const debounceValue = useDebounce(searchQuery, 500);

  const queryParams = useMemo(() => {
    const params = {
      page,
      per_page: rowsPerPage,
      status: "active",
      pagination: true,
    };

    if (debounceValue && debounceValue.trim() !== "") {
      params.search = debounceValue.trim();
    }

    if (selectedFilters.length > 0) {
      params.approval_status = selectedFilters.join(",");
    }

    return params;
  }, [debounceValue, page, rowsPerPage, selectedFilters]);

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

  const [createSubmission] = useCreateFormSubmissionMutation();
  const [updateSubmission] = useUpdateFormSubmissionMutation();
  const [resubmitSubmission] = useResubmitFormSubmissionMutation();
  const [cancelSubmission] = useCancelFormSubmissionMutation();

  const submissionsList = useMemo(
    () => submissionsData?.result?.data || [],
    [submissionsData]
  );

  const canResubmitSubmission = useCallback((submission) => {
    const resubmittableStatuses = [
      "AWAITING_RESUBMISSION",
      "AWAITING RESUBMISSION",
      "REJECTED",
      "RETURNED",
    ];
    return resubmittableStatuses.includes(submission?.status);
  }, []);

  const canEditSubmission = useCallback((submission) => {
    const editableStatuses = [
      "AWAITING_RESUBMISSION",
      "AWAITING RESUBMISSION",
      "REJECTED",
      "RETURNED",
    ];
    return editableStatuses.includes(submission?.status);
  }, []);

  const handleSearchChange = useCallback((newSearchQuery) => {
    setSearchQuery(newSearchQuery);
    setPage(1);
  }, []);

  const handleFilterClick = useCallback(() => {
    setFilterDialogOpen(true);
  }, []);

  const handleFiltersChange = useCallback((newFilters) => {
    setSelectedFilters(newFilters);
    setPage(1);
  }, []);

  const handleAddNew = useCallback(() => {
    setSelectedSubmission(null);
    setModalMode("create");
    setModalOpen(true);
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
    setModalMode("create");
    methods.reset();
    setPendingFormData(null);
    setPendingMode(null);
  }, [methods]);

  const handleModeChange = useCallback((newMode) => {
    setModalMode(newMode);
  }, []);

  const handleModalSave = useCallback(async (submissionData, mode) => {
    setPendingFormData(submissionData);
    setPendingMode(mode);
    setConfirmAction(mode === "create" ? "create" : "update");
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
    [submissionsList, enqueueSnackbar]
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

      setSelectedSubmissionForAction(submission);
      setConfirmAction(action);
      setConfirmOpen(true);
      handleMenuClose(submission.id);
    },
    [handleMenuClose, canEditSubmission, canResubmitSubmission, enqueueSnackbar]
  );

  const handleActionConfirm = async () => {
    if (!confirmAction) return;

    setIsLoading(true);
    setModalLoading(true);

    try {
      let result;

      switch (confirmAction) {
        case "create":
          if (pendingFormData) {
            result = await createSubmission(pendingFormData).unwrap();
          }
          break;
        case "update":
          if (pendingFormData && selectedSubmission) {
            result = await updateSubmission({
              id: selectedSubmission.id,
              data: pendingFormData,
            }).unwrap();
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
            result = await cancelSubmission(
              selectedSubmissionForAction.id
            ).unwrap();
          }
          break;
        default:
          throw new Error("Unknown action");
      }

      const actionMessages = {
        create: "Manpower form created successfully!",
        update: "Manpower form updated successfully!",
        resubmit: "Manpower form resubmitted successfully!",
        cancel: "Manpower form cancelled successfully!",
      };

      enqueueSnackbar(actionMessages[confirmAction], {
        variant: "success",
        autoHideDuration: 2000,
      });

      refetch();

      if (confirmAction === "create" || confirmAction === "update") {
        handleModalClose();
      } else if (confirmAction === "resubmit" || confirmAction === "cancel") {
        handleModalClose();
      }
    } catch (error) {
      console.error(`${confirmAction} error:`, error);

      let errorMessage = "Action failed. Please try again.";

      if (confirmAction === "create" || confirmAction === "update") {
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
        errorMessage = "Failed to cancel manpower form. Please try again.";
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
      setPendingMode(null);
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
      create: "Are you sure you want to create this manpower form?",
      update: "Are you sure you want to update this manpower form?",
      resubmit: "Are you sure you want to resubmit this manpower form?",
      cancel: "Are you sure you want to cancel this manpower form?",
    };

    return messages[confirmAction] || "";
  }, [confirmAction]);

  const getConfirmationTitle = useCallback(() => {
    if (!confirmAction) return "Confirmation";

    const titles = {
      create: "Confirm Creation",
      update: "Confirm Update",
      resubmit: "Confirm Resubmission",
      cancel: "Confirm Cancellation",
    };

    return titles[confirmAction] || "Confirmation";
  }, [confirmAction]);

  const getConfirmButtonColor = useCallback(() => {
    if (!confirmAction) return "primary";

    const colors = {
      create: "primary",
      update: "success",
      resubmit: "primary",
      cancel: "warning",
    };

    return colors[confirmAction] || "primary";
  }, [confirmAction]);

  const getConfirmButtonText = useCallback(() => {
    if (!confirmAction) return "Confirm";

    const texts = {
      create: "Create",
      update: "Update",
      resubmit: "Resubmit",
      cancel: "Cancel Submission",
    };

    return texts[confirmAction] || "Confirm";
  }, [confirmAction]);

  const getSubmissionDisplayName = useCallback(() => {
    if (confirmAction === "create" || confirmAction === "update") {
      return selectedSubmission?.form?.name || "New Manpower Form";
    }
    return selectedSubmissionForAction?.form?.name || "Untitled Submission";
  }, [confirmAction, selectedSubmission, selectedSubmissionForAction]);

  const getSubmissionId = useCallback(() => {
    if (confirmAction === "create") {
      return "New";
    }
    if (confirmAction === "update") {
      return selectedSubmission?.id || "Unknown";
    }
    return selectedSubmissionForAction?.id || "Unknown";
  }, [confirmAction, selectedSubmission, selectedSubmissionForAction]);

  const isLoadingState = queryLoading || isFetching || isLoading;

  return (
    <FormProvider {...methods}>
      <Box sx={styles.mainContainer}>
        <Box sx={styles.headerContainer}>
          <Box sx={styles.headerLeftSection}>
            <Typography className="header">MANPOWER FORM</Typography>
            <Fade in={!isLoadingState}>
              <Button
                variant="contained"
                onClick={handleAddNew}
                startIcon={<AddIcon />}
                disabled={isLoadingState}
                sx={styles.createButton}>
                CREATE REQUEST
              </Button>
            </Fade>
          </Box>

          <CustomSearchBar
            searchQuery={searchQuery}
            setSearchQuery={handleSearchChange}
            selectedFilters={selectedFilters}
            onFilterClick={handleFilterClick}
            isLoading={isLoadingState}
          />
        </Box>

        <Box sx={styles.contentContainer}>
          <FormSubmissionTable
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

        <FilterDialog
          open={filterDialogOpen}
          onClose={() => setFilterDialogOpen(false)}
          selectedFilters={selectedFilters}
          onFiltersChange={handleFiltersChange}
        />

        <Dialog
          open={confirmOpen}
          onClose={() => setConfirmOpen(false)}
          maxWidth="xs"
          fullWidth
          PaperProps={{
            sx: styles.confirmDialog,
          }}>
          <DialogTitle>
            <Box sx={styles.confirmDialogIconBox}>
              <HelpIcon sx={styles.confirmDialogIcon} />
            </Box>
            <Typography variant="h6" sx={styles.confirmDialogTitle}>
              {getConfirmationTitle()}
            </Typography>
          </DialogTitle>
          <DialogContent>
            <Typography variant="body1" sx={styles.confirmDialogMessage}>
              {getConfirmationMessage()}
            </Typography>
            <Typography variant="body2" sx={styles.confirmDialogSubmissionInfo}>
              {getSubmissionDisplayName()} - ID: {getSubmissionId()}
            </Typography>
          </DialogContent>
          <DialogActions>
            <Box sx={styles.confirmDialogActionsBox}>
              <Button
                onClick={() => setConfirmOpen(false)}
                variant="outlined"
                color="error"
                sx={styles.confirmCancelButton}
                disabled={isLoading}>
                Cancel
              </Button>
              <Button
                onClick={handleActionConfirm}
                variant="contained"
                color={getConfirmButtonColor()}
                sx={styles.confirmActionButton(confirmAction)}
                disabled={isLoading}>
                {isLoading ? (
                  <CircularProgress size={20} color="inherit" />
                ) : (
                  getConfirmButtonText()
                )}
              </Button>
            </Box>
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

export default FormSubmission;
