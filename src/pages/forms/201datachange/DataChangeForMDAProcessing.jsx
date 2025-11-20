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
import {
  useGetMyDataChangeSubmissionsQuery,
  useLazyGetDataChangeSubmissionDetailsQuery,
} from "../../../features/api/forms/datachangeApi";
import {
  useCreateMdaMutation,
  useUpdateMdaMutation,
} from "../../../features/api/forms/mdaApi";
import DataChangeModal from "../../../components/modal/form/DataChange/DataChangeModal";
import { useRememberQueryParams } from "../../../hooks/useRememberQueryParams";
import MDAFormModal from "../../../components/modal/form/MDAForm/MDAFormModal";
import DataChangeForApprovalTable from "../201datachange/DataChangeForapprovalTable";

const DataChangeForMDAProcessing = ({
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
  const [selectedSubmissionId, setSelectedSubmissionId] = useState(null);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState({});
  const [selectedRowForMenu, setSelectedRowForMenu] = useState(null);
  const [mdaModalOpen, setMdaModalOpen] = useState(false);
  const [mdaSubmissionId, setMdaSubmissionId] = useState(null);
  const [selectedMdaSubmission, setSelectedMdaSubmission] = useState(null);

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
    return {
      pagination: 1,
      page: page,
      per_page: rowsPerPage,
      status: "active",
      approval_status: "PENDING MDA CREATION",
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
  } = useGetMyDataChangeSubmissionsQuery(apiQueryParams, {
    refetchOnMountOrArgChange: true,
    skip: false,
  });

  const [createMda, { isLoading: isCreatingMda }] = useCreateMdaMutation();
  const [updateMda, { isLoading: isUpdatingMda }] = useUpdateMdaMutation();
  const [getSubmissionDetails] = useLazyGetDataChangeSubmissionDetailsQuery();

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

  const handleRowClick = useCallback(
    async (submission) => {
      setSelectedSubmissionId(submission.id);
      setModalLoading(true);
      setModalOpen(true);

      try {
        const { data } = await getSubmissionDetails(submission.id);
        if (data) {
          setSelectedSubmission(data);
        }
      } catch (error) {
        enqueueSnackbar("Failed to load submission details", {
          variant: "error",
          autoHideDuration: 2000,
        });
      } finally {
        setModalLoading(false);
      }

      setMenuAnchor({});
      setSelectedRowForMenu(null);
    },
    [getSubmissionDetails, enqueueSnackbar]
  );

  const handleEditSubmission = useCallback(
    async (submission) => {
      setSelectedSubmissionId(submission.id);
      setModalLoading(true);
      setModalOpen(true);

      try {
        const { data } = await getSubmissionDetails(submission.id);
        if (data) {
          setSelectedSubmission(data);
        }
      } catch (error) {
        enqueueSnackbar("Failed to load submission details", {
          variant: "error",
          autoHideDuration: 2000,
        });
      } finally {
        setModalLoading(false);
      }

      setMenuAnchor({});
      setSelectedRowForMenu(null);
    },
    [getSubmissionDetails, enqueueSnackbar]
  );

  const handleResubmitSubmission = useCallback(
    async (submission) => {
      setSelectedSubmissionId(submission.id);
      setModalLoading(true);
      setModalOpen(true);

      try {
        const { data } = await getSubmissionDetails(submission.id);
        if (data) {
          setSelectedSubmission(data);
        }
      } catch (error) {
        enqueueSnackbar("Failed to load submission details", {
          variant: "error",
          autoHideDuration: 2000,
        });
      } finally {
        setModalLoading(false);
      }

      setMenuAnchor({});
      setSelectedRowForMenu(null);
    },
    [getSubmissionDetails, enqueueSnackbar]
  );

  const handleModalClose = useCallback(() => {
    setModalOpen(false);
    setSelectedSubmissionId(null);
    setSelectedSubmission(null);
    setModalLoading(false);
  }, []);

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
          await createMda(data).unwrap();
          enqueueSnackbar("MDA created successfully!", {
            variant: "success",
            autoHideDuration: 3000,
          });
          setMdaModalOpen(false);
          mdaFormMethods.reset();
          refetch();
        } else if (mode === "edit") {
          await updateMda({
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

  const isLoadingState = queryLoading || isFetching;

  const positions = [
    { id: 10, title: "JUNIOR DEVELOPER" },
    { id: 11, title: "SENIOR DEVELOPER" },
    { id: 12, title: "TEAM LEAD" },
    { id: 13, title: "PROJECT MANAGER" },
  ];

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
          <DataChangeForApprovalTable
            submissionsList={filteredSubmissions}
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

        <DataChangeModal
          open={modalOpen}
          onClose={handleModalClose}
          mode="view"
          onModeChange={() => {}}
          selectedEntry={selectedSubmission}
          isLoading={modalLoading}
          onSave={() => {}}
          onRefreshDetails={() => refetch()}
          onSuccessfulSave={() => {}}
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
      </Box>
    </FormProvider>
  );
};

export default DataChangeForMDAProcessing;
