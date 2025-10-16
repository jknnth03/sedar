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
  useGetMdaSubmissionsQuery,
  useGetSingleMdaSubmissionQuery,
  useUpdateMdaMutation,
} from "../../../features/api/forms/mdaApi";
import MDAForApprovalTable from "./MDAForApprovalTable";
import { useRememberQueryParams } from "../../../hooks/useRememberQueryParams";
import MDAFormModal from "../../../components/modal/form/MDAForm/MDAFormModal";
import {
  useResubmitFormSubmissionMutation,
  useCancelFormSubmissionMutation,
} from "../../../features/api/approvalsetting/formSubmissionApi";

const MDAAwaitingResubmission = ({
  searchQuery,
  dateFilters,
  filterDataByDate,
  filterDataBySearch,
}) => {
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();

  const [queryParams, setQueryParams] = useRememberQueryParams();

  const [page, setPage] = useState(parseInt(queryParams?.page) || 1);
  const [rowsPerPage, setRowsPerPage] = useState(
    parseInt(queryParams?.rowsPerPage) || 10
  );
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [selectedSubmissionId, setSelectedSubmissionId] = useState(null);
  const [menuAnchor, setMenuAnchor] = useState({});
  const [selectedRowForMenu, setSelectedRowForMenu] = useState(null);
  const [modalMode, setModalMode] = useState("view");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [selectedSubmissionForAction, setSelectedSubmissionForAction] =
    useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const methods = useForm({
    defaultValues: {},
  });

  const [updateMdaSubmission] = useUpdateMdaMutation();
  const [resubmitMdaSubmission] = useResubmitFormSubmissionMutation();
  const [cancelMdaSubmission] = useCancelFormSubmissionMutation();

  const apiQueryParams = useMemo(() => {
    return {
      page: page,
      per_page: rowsPerPage,
      status: "active",
      approval_status: "AWAITING RESUBMISSION",
      pagination: true,
      search: searchQuery || "",
    };
  }, [page, rowsPerPage, searchQuery]);

  useEffect(() => {
    setPage(1);
  }, [searchQuery, dateFilters]);

  const {
    data: submissionsData,
    isLoading: queryLoading,
    isFetching,
    refetch,
    error,
  } = useGetMdaSubmissionsQuery(apiQueryParams, {
    refetchOnMountOrArgChange: true,
    skip: false,
  });

  const {
    data: submissionDetails,
    isLoading: detailsLoading,
    refetch: refetchDetails,
  } = useGetSingleMdaSubmissionQuery(selectedSubmissionId, {
    skip: !selectedSubmissionId,
    refetchOnMountOrArgChange: true,
  });

  const submissionsList = useMemo(() => {
    return submissionsData?.result?.data || [];
  }, [submissionsData]);

  const handleRowClick = useCallback((submission) => {
    setSelectedSubmissionId(submission.id);
    setMenuAnchor({});
    setSelectedRowForMenu(null);
    setModalMode("view");
    setModalOpen(true);
  }, []);

  useEffect(() => {
    if (submissionDetails?.result && modalOpen) {
      setSelectedEntry(submissionDetails.result);
    }
  }, [submissionDetails, modalOpen]);

  const handleModalClose = useCallback(() => {
    setModalOpen(false);
    setSelectedEntry(null);
    setSelectedSubmissionId(null);
    setModalMode("view");
  }, []);

  const handleSave = useCallback(
    async (formData, mode) => {
      try {
        console.log("Saving MDA submission:", formData, mode);

        if (mode === "edit" && selectedSubmissionId) {
          const response = await updateMdaSubmission({
            id: selectedSubmissionId,
            data: formData,
          }).unwrap();

          enqueueSnackbar("MDA submission updated successfully", {
            variant: "success",
          });

          await refetchDetails();
          await refetch();

          handleModalClose();
        }
      } catch (error) {
        console.error("Error saving MDA submission:", error);
        enqueueSnackbar(
          error?.data?.message || "Failed to update MDA submission",
          {
            variant: "error",
          }
        );
      }
    },
    [
      selectedSubmissionId,
      updateMdaSubmission,
      enqueueSnackbar,
      refetchDetails,
      refetch,
      handleModalClose,
    ]
  );

  const handleResubmit = useCallback(
    async (submissionId) => {
      try {
        console.log("Resubmitting MDA submission:", submissionId);

        await resubmitMdaSubmission(submissionId).unwrap();

        enqueueSnackbar("MDA submission resubmitted successfully", {
          variant: "success",
          autoHideDuration: 2000,
        });

        await refetchDetails();
        await refetch();
      } catch (error) {
        console.error("Error resubmitting MDA submission:", error);
        enqueueSnackbar(
          error?.data?.message || "Failed to resubmit MDA submission",
          {
            variant: "error",
            autoHideDuration: 2000,
          }
        );
        throw error;
      }
    },
    [resubmitMdaSubmission, enqueueSnackbar, refetchDetails, refetch]
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

  const handleActionConfirm = async () => {
    if (!confirmAction) return;

    setIsLoading(true);

    try {
      if (confirmAction === "cancel" && selectedSubmissionForAction) {
        await cancelMdaSubmission(selectedSubmissionForAction.id).unwrap();
        enqueueSnackbar("MDA submission cancelled successfully!", {
          variant: "success",
          autoHideDuration: 2000,
        });
        refetch();
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
      setIsLoading(false);
    }
  };

  const handleConfirmationCancel = useCallback(() => {
    setConfirmOpen(false);
    setSelectedSubmissionForAction(null);
    setConfirmAction(null);
  }, []);

  const getConfirmationMessage = useCallback(() => {
    if (confirmAction === "cancel") {
      return (
        <>
          Are you sure you want to <strong>Cancel</strong> this MDA Request?
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
      selectedSubmissionForAction?.reference_number || "MDA Request";
    return submissionForAction;
  }, [selectedSubmissionForAction]);

  const getConfirmationIcon = useCallback(() => {
    const iconConfig = {
      cancel: { color: "#ff4400", icon: "?" },
    };

    const config = iconConfig[confirmAction] || iconConfig.cancel;
    return config;
  }, [confirmAction]);

  const isLoadingState = queryLoading || isFetching || isLoading;

  const totalCount = submissionsData?.result?.total || 0;

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
          <MDAForApprovalTable
            submissionsList={submissionsList}
            isLoadingState={isLoadingState}
            error={error}
            handleRowClick={handleRowClick}
            handleMenuOpen={handleMenuOpen}
            handleMenuClose={handleMenuClose}
            menuAnchor={menuAnchor}
            searchQuery={searchQuery}
            forApproval={false}
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
              count={totalCount}
              rowsPerPage={rowsPerPage}
              page={Math.max(0, page - 1)}
              onPageChange={handlePageChange}
              onRowsPerPageChange={handleRowsPerPageChange}
            />
          </Box>
        </Box>

        <MDAFormModal
          open={modalOpen}
          onClose={handleModalClose}
          onSave={handleSave}
          onResubmit={handleResubmit}
          selectedEntry={selectedEntry}
          isLoading={detailsLoading}
          mode={modalMode}
          submissionId={selectedSubmissionId}
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

export default MDAAwaitingResubmission;
