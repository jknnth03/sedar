import React, { useState, useMemo, useCallback, useEffect } from "react";
import { Typography, Box, useTheme } from "@mui/material";
import { FormProvider, useForm } from "react-hook-form";
import { useSnackbar } from "notistack";
import "../../../pages/GeneralStyle.scss";
import {
  useGetDataChangeSubmissionsQuery,
  useGetDataChangeSubmissionDetailsQuery,
  useCreateDataChangeSubmissionMutation,
  useUpdateDataChangeSubmissionMutation,
  useResubmitDataChangeSubmissionMutation,
} from "../../../features/api/forms/datachangeApi";
import {
  useCreateMdaMutation,
  useUpdateMdaMutation,
} from "../../../features/api/forms/mdaApi";
import DataChangeModal from "../../../components/modal/form/DataChange/DataChangeModal";
import { useRememberQueryParams } from "../../../hooks/useRememberQueryParams";
import MDAFormModal from "../../../components/modal/form/MDAForm/MDAFormModal";
import DataChangeForApprovalTable from "../201datachange/DataChangeForapprovalTable";
import CustomTablePagination from "../../zzzreusable/CustomTablePagination";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  CircularProgress,
} from "@mui/material";

const DataChangeForMDAProcessing = ({
  searchQuery,
  dateFilters,
  filterDataByDate,
  filterDataBySearch,
  employeeIdToInclude,
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
  const [selectedRowForMenu, setSelectedRowForMenu] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [selectedSubmissionForAction, setSelectedSubmissionForAction] =
    useState(null);
  const [pendingFormData, setPendingFormData] = useState(null);
  const [modalSuccessHandler, setModalSuccessHandler] = useState(null);
  const [mdaModalOpen, setMdaModalOpen] = useState(false);
  const [mdaSubmissionId, setMdaSubmissionId] = useState(null);
  const [selectedMdaSubmission, setSelectedMdaSubmission] = useState(null);

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
      to_job_grade: "",
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
      approval_status: "PENDING MDA CREATION",
      search: searchQuery || "",
      view_mode: "hr",
    };

    if (employeeIdToInclude) {
      params.employee_id_to_include = employeeIdToInclude;
    }

    return params;
  }, [page, rowsPerPage, searchQuery, employeeIdToInclude]);

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
  } = useGetDataChangeSubmissionsQuery(apiQueryParams, {
    refetchOnMountOrArgChange: true,
    skip: false,
  });

  const {
    data: submissionDetails,
    isLoading: detailsLoading,
    refetch: refetchDetails,
  } = useGetDataChangeSubmissionDetailsQuery(selectedSubmissionId, {
    skip: !selectedSubmissionId,
    refetchOnMountOrArgChange: true,
  });

  const [createDataChangeSubmission] = useCreateDataChangeSubmissionMutation();
  const [updateDataChangeSubmission] = useUpdateDataChangeSubmissionMutation();
  const [resubmitDataChangeSubmission] =
    useResubmitDataChangeSubmissionMutation();
  const [createMda, { isLoading: isCreatingMda }] = useCreateMdaMutation();
  const [updateMda, { isLoading: isUpdatingMda }] = useUpdateMdaMutation();

  const filteredSubmissions = useMemo(() => {
    const rawData = submissionsData?.result?.data || [];

    let filtered = rawData;

    filtered = filtered.filter(
      (submission) => submission.status === "PENDING MDA CREATION"
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

  const handleRowClick = useCallback((submission) => {
    setModalMode("view");
    setSelectedSubmissionId(submission.id);
    setMenuAnchor({});
    setSelectedRowForMenu(null);
    setModalOpen(true);
  }, []);

  const handleEditSubmission = useCallback((submission) => {
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
    setSelectedSubmissionForAction(submission);
    setModalMode("resubmit");
    setModalOpen(true);
  }, []);

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

  const handleCreateMDA = useCallback((submission) => {
    const submissionIdForPrefill = submission.submittable?.id || submission.id;

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
          const result = await createMda(data).unwrap();
          enqueueSnackbar("MDA created successfully!", {
            variant: "success",
            autoHideDuration: 3000,
          });
          setMdaModalOpen(false);
          mdaFormMethods.reset();
          refetch();
        } else if (mode === "edit") {
          const result = await updateMda({
            id: selectedMdaSubmission.id,
            data: data,
          }).unwrap();
          enqueueSnackbar("MDA updated successfully!", {
            variant: "success",
            autoHideDuration: 3000,
          });
          setMdaModalOpen(false);
          refetch();
        }
      } catch (error) {
        console.error("Error saving MDA:", error);
        const errorMessage =
          error?.data?.message || "Failed to save MDA. Please try again.";
        enqueueSnackbar(errorMessage, {
          variant: "error",
          autoHideDuration: 3000,
        });
      }
    },
    [
      createMda,
      updateMda,
      selectedMdaSubmission,
      refetch,
      enqueueSnackbar,
      mdaFormMethods,
    ]
  );

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
          submissionDetails ||
          filteredSubmissions.find((sub) => sub.id === submissionId);
        setSelectedSubmissionForAction(submission);
        setPendingFormData(submissionData);
        setConfirmAction("update");
        setConfirmOpen(true);
        return;
      }

      if (mode === "resubmit") {
        const submission =
          submissionDetails ||
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
          body: pendingFormData,
        }).unwrap();
        enqueueSnackbar("Data change submission updated successfully!", {
          variant: "success",
          autoHideDuration: 2000,
        });
        refetch();
        if (modalSuccessHandler) {
          modalSuccessHandler();
        }
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

  const positions = [
    { id: 10, title: "JUNIOR DEVELOPER" },
    { id: 11, title: "SENIOR DEVELOPER" },
    { id: 12, title: "TEAM LEAD" },
    { id: 13, title: "PROJECT MANAGER" },
  ];

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
        <DataChangeForApprovalTable
          submissionsList={paginatedSubmissions}
          isLoadingState={isLoadingState}
          error={error}
          handleRowClick={handleRowClick}
          handleMenuOpen={handleMenuOpen}
          handleMenuClose={handleMenuClose}
          handleEditSubmission={handleEditSubmission}
          handleResubmitSubmission={handleResubmitSubmission}
          menuAnchor={menuAnchor}
          searchQuery={searchQuery}
          selectedFilters={[]}
          showArchived={false}
          hideStatusColumn={false}
          forMDAProcessing={true}
          onCreateMDA={handleCreateMDA}
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
        onRefreshDetails={handleRefreshDetails}
        onSuccessfulSave={handleModalSuccessCallback}
        onCreateMDA={handleCreateMDA}
      />

      <FormProvider {...mdaFormMethods} key={mdaSubmissionId}>
        <MDAFormModal
          open={mdaModalOpen}
          onClose={handleMdaModalClose}
          onSave={handleSaveMDA}
          selectedEntry={null}
          isLoading={isCreatingMda || isUpdatingMda}
          mode="create"
          employeeMovements={[]}
          positions={positions}
          submissionId={mdaSubmissionId}
          key={`mda-${mdaSubmissionId}-${mdaModalOpen}`}
        />
      </FormProvider>

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

export default DataChangeForMDAProcessing;
