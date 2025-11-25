import React, { useState, useMemo, useCallback, useEffect } from "react";
import { Typography, TablePagination, Box, useTheme } from "@mui/material";
import { FormProvider, useForm } from "react-hook-form";
import { useSnackbar } from "notistack";
import "../../../pages/GeneralStyle.scss";
import { styles } from "../../forms/manpowerform/FormSubmissionStyles";
import {
  useGetCatTwoTasksQuery,
  useGetCatTwoTaskByIdQuery,
  useSubmitCatTwoMutation,
} from "../../../features/api/da-task/catTwoApi";
import CatTwoTable from "./CatTwoTable";
import CatTwoModal from "../../../components/modal/da-task/CatTwoModal";

const CatTwoForApproval = ({
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
  onConfirmationRequest,
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
      status: "FOR_APPROVAL",
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

  const submissionsData = useMemo(() => {
    const dataSource = data || taskData;
    if (!dataSource?.result) return [];

    const result = dataSource.result;

    if (result.data && Array.isArray(result.data)) {
      return result.data.filter((item) => item.status === "FOR_APPROVAL");
    }

    if (Array.isArray(result)) {
      return result.filter((item) => item.status === "FOR_APPROVAL");
    }

    if (result.status === "FOR_APPROVAL") {
      return [result];
    }

    return [];
  }, [data, taskData]);

  const totalCount = useMemo(() => {
    const dataSource = data || taskData;
    if (dataSource?.result?.total) {
      return dataSource.result.total;
    }
    return submissionsData.length;
  }, [data, taskData, submissionsData.length]);

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

  const handleModalSave = useCallback(
    async (submissionData, mode, submissionId) => {
      const submission =
        submissionDetails?.result ||
        filteredSubmissions.find((sub) => sub.id === submissionId);

      const itemName = "CAT 2 REQUEST";

      onConfirmationRequest("update", itemName, {
        taskId: submissionId,
        data: submissionData,
        onSuccess: () => {
          refetch();
          if (modalSuccessHandler) {
            modalSuccessHandler();
          }
          handleModalClose();
        },
      });
    },
    [
      submissionDetails,
      filteredSubmissions,
      onConfirmationRequest,
      refetch,
      modalSuccessHandler,
    ]
  );

  const handleApproveSubmission = useCallback(
    (submission) => {
      const displayName =
        submission?.data_change?.reference_number ||
        submission?.reference_number ||
        "CAT 2 Assessment";

      onConfirmationRequest("approve", displayName, {
        taskId: submission.id,
        data: { action: "approve" },
        onSuccess: () => {
          refetch();
          handleModalClose();
        },
      });
    },
    [onConfirmationRequest, refetch]
  );

  const handleRejectSubmission = useCallback(
    (submission) => {
      const displayName =
        submission?.data_change?.reference_number ||
        submission?.reference_number ||
        "CAT 2 Assessment";

      onConfirmationRequest("reject", displayName, {
        taskId: submission.id,
        data: { action: "reject" },
        onSuccess: () => {
          refetch();
          handleModalClose();
        },
      });
    },
    [onConfirmationRequest, refetch]
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

  const isLoadingState =
    externalIsLoading !== undefined
      ? externalIsLoading
      : queryLoading || isFetching;

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

        <CatTwoModal
          open={modalOpen}
          onClose={handleModalClose}
          onSave={handleModalSave}
          mode={modalMode}
          onModeChange={handleModeChange}
          selectedEntry={submissionDetails?.result || selectedSubmission}
          isLoading={detailsLoading}
          onRefreshDetails={handleRefreshDetails}
          forApproval={true}
          onApprove={handleApproveSubmission}
          onReject={handleRejectSubmission}
          onSuccessfulSave={handleModalSuccessCallback}
        />
      </Box>
    </FormProvider>
  );
};

export default CatTwoForApproval;
