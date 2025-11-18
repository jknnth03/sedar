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
  TextField,
} from "@mui/material";
import { FormProvider, useForm } from "react-hook-form";
import { useSnackbar } from "notistack";
import "../../../pages/GeneralStyle.scss";
import { styles } from "../../forms/manpowerform/FormSubmissionStyles";
import {
  useGetPdpListQuery,
  useSubmitPdpMutation,
} from "../../../features/api/da-task/pdpApi";
import PdpTable from "./PdpTable";

const PdpForApproval = ({
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
  onRowClick,
  onApprove: onApproveFromParent,
  onReject: onRejectFromParent,
}) => {
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();

  const [page, setPage] = useState(
    externalPage || parseInt(currentParams?.page) || 1
  );
  const [rowsPerPage, setRowsPerPage] = useState(
    externalRowsPerPage || parseInt(currentParams?.rowsPerPage) || 10
  );
  const [menuAnchor, setMenuAnchor] = useState({});
  const [selectedRowForMenu, setSelectedRowForMenu] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [selectedSubmissionForAction, setSelectedSubmissionForAction] =
    useState(null);
  const [remarks, setRemarks] = useState("");

  useEffect(() => {
    console.log("confirmOpen changed:", confirmOpen);
    console.log("confirmAction:", confirmAction);
    console.log("selectedSubmissionForAction:", selectedSubmissionForAction);
  }, [confirmOpen, confirmAction, selectedSubmissionForAction]);

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
  } = useGetPdpListQuery(
    {
      pagination: 1,
      page: page,
      per_page: rowsPerPage,
      status: "FOR_APPROVAL",
    },
    {
      refetchOnMountOrArgChange: true,
      skip: false,
    }
  );

  const [submitPdp] = useSubmitPdpMutation();

  const submissionsData = useMemo(() => {
    const dataSource = data || taskData;
    if (!dataSource?.result) return [];

    const result = dataSource.result;

    if (result.data && Array.isArray(result.data)) {
      return result.data.filter(
        (item) =>
          item.status === "FOR_APPROVAL" ||
          item.status === "PENDING_APPROVAL" ||
          item.status === "PENDING_VALIDATION"
      );
    }

    if (Array.isArray(result)) {
      return result.filter(
        (item) =>
          item.status === "FOR_APPROVAL" ||
          item.status === "PENDING_APPROVAL" ||
          item.status === "PENDING_VALIDATION"
      );
    }

    if (
      result.status === "FOR_APPROVAL" ||
      result.status === "PENDING_APPROVAL" ||
      result.status === "PENDING_VALIDATION"
    ) {
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

  const totalCount = useMemo(() => {
    const dataSource = data || taskData;
    if (!dataSource?.result) return 0;

    if (dataSource.result.total !== undefined) {
      return dataSource.result.total;
    }

    return filteredSubmissions.length;
  }, [data, taskData, filteredSubmissions]);

  const handleRowClick = useCallback(
    (submission) => {
      if (onRowClick) {
        onRowClick(submission);
      }
    },
    [onRowClick]
  );

  const handleViewSubmission = useCallback(
    (submission) => {
      setMenuAnchor({});
      setSelectedRowForMenu(null);
      if (onRowClick) {
        onRowClick(submission);
      }
    },
    [onRowClick]
  );

  const handleApproveSubmission = useCallback(
    async (submissionId) => {
      console.log("Approve clicked for ID:", submissionId);
      const submission = filteredSubmissions.find(
        (sub) => sub.id === submissionId
      );
      if (submission) {
        console.log("Opening approve confirmation");
        setSelectedSubmissionForAction(submission);
        setConfirmAction("approve");
        setRemarks("");
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

  const handleRejectSubmission = useCallback(
    async (submissionId) => {
      console.log("Reject clicked for ID:", submissionId);
      const submission = filteredSubmissions.find(
        (sub) => sub.id === submissionId
      );
      if (submission) {
        console.log("Opening reject confirmation");
        setSelectedSubmissionForAction(submission);
        setConfirmAction("reject");
        setRemarks("");
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

  const handleActionConfirm = async () => {
    if (!confirmAction || !selectedSubmissionForAction) return;

    if (confirmAction === "reject" && !remarks.trim()) {
      enqueueSnackbar("Please provide remarks for rejection.", {
        variant: "warning",
        autoHideDuration: 2000,
      });
      return;
    }

    setIsLoading(true);

    try {
      const payload = {
        id: selectedSubmissionForAction.id,
        data: {
          status: confirmAction === "approve" ? "APPROVED" : "REJECTED",
          remarks: remarks.trim() || undefined,
        },
      };

      await submitPdp(payload).unwrap();

      enqueueSnackbar(
        `PDP submission ${
          confirmAction === "approve" ? "approved" : "rejected"
        } successfully!`,
        {
          variant: "success",
          autoHideDuration: 2000,
        }
      );

      refetch();

      if (confirmAction === "approve" && onApproveFromParent) {
        onApproveFromParent(selectedSubmissionForAction.id);
      } else if (confirmAction === "reject" && onRejectFromParent) {
        onRejectFromParent(selectedSubmissionForAction.id);
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
      setRemarks("");
      setIsLoading(false);
    }
  };

  const handleConfirmationCancel = useCallback(() => {
    setConfirmOpen(false);
    setSelectedSubmissionForAction(null);
    setConfirmAction(null);
    setRemarks("");
  }, []);

  const getConfirmationMessage = useCallback(() => {
    if (confirmAction === "approve") {
      return "Are you sure you want to Approve this PDP Submission?";
    } else if (confirmAction === "reject") {
      return "Are you sure you want to Reject this PDP Submission?";
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
      selectedSubmissionForAction?.developmental_assignment?.reference_number ||
      selectedSubmissionForAction?.data_change?.reference_number ||
      selectedSubmissionForAction?.reference_number ||
      "PDP Submission";
    return submissionForAction;
  }, [selectedSubmissionForAction]);

  const getConfirmationIcon = useCallback(() => {
    const iconConfig = {
      approve: { color: "#4caf50", icon: "✓" },
      reject: { color: "#ff4400", icon: "✕" },
    };

    const config = iconConfig[confirmAction] || iconConfig.approve;
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
          <PdpTable
            submissionsList={filteredSubmissions}
            isLoadingState={isLoadingState}
            error={error}
            handleRowClick={handleRowClick}
            handleMenuOpen={handleMenuOpen}
            handleMenuClose={handleMenuClose}
            handleViewSubmission={handleViewSubmission}
            menuAnchor={menuAnchor}
            searchQuery={searchQuery}
            selectedFilters={[]}
            showArchived={false}
            hideStatusColumn={false}
            forApproval={true}
            onApprove={handleApproveSubmission}
            onReject={handleRejectSubmission}
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
                marginBottom: 2,
              }}>
              {getSubmissionDisplayName()}
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={3}
              label={
                confirmAction === "reject"
                  ? "Remarks (Required)"
                  : "Remarks (Optional)"
              }
              placeholder={
                confirmAction === "reject"
                  ? "Please provide reason for rejection..."
                  : "Add any additional remarks..."
              }
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              required={confirmAction === "reject"}
              error={confirmAction === "reject" && !remarks.trim()}
              helperText={
                confirmAction === "reject" && !remarks.trim()
                  ? "Remarks are required for rejection"
                  : ""
              }
              sx={{
                marginTop: 2,
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                },
              }}
            />
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

export default PdpForApproval;
