import React, { useState, useMemo, useCallback, useEffect } from "react";
import { Typography, TablePagination, Box, useTheme } from "@mui/material";
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

const MDAForApproval = ({
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
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [selectedSubmissionId, setSelectedSubmissionId] = useState(null);
  const [menuAnchor, setMenuAnchor] = useState({});
  const [selectedRowForMenu, setSelectedRowForMenu] = useState(null);
  const [modalMode, setModalMode] = useState("view");

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
      approval_status: "PENDING",
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
    const data = submissionsData?.result?.data || [];
    return data;
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
      }
    },
    [resubmitMdaSubmission, enqueueSnackbar, refetchDetails, refetch]
  );

  const handleCancel = useCallback(
    async (submissionId) => {
      try {
        console.log("Cancelling MDA submission:", submissionId);

        await cancelMdaSubmission(submissionId).unwrap();

        enqueueSnackbar("MDA submission cancelled successfully", {
          variant: "success",
          autoHideDuration: 2000,
        });

        await refetch();

        return true;
      } catch (error) {
        console.error("Error cancelling MDA submission:", error);

        let errorMessage = "Failed to cancel MDA submission";
        if (error?.data?.message) {
          errorMessage = error.data.message;
        } else if (error?.message) {
          errorMessage = error.message;
        }

        enqueueSnackbar(errorMessage, {
          variant: "error",
          autoHideDuration: 3000,
        });

        return false;
      }
    },
    [cancelMdaSubmission, enqueueSnackbar, refetch]
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
            statusFilter="PENDING"
            onCancel={handleCancel}
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
      </Box>
    </FormProvider>
  );
};

export default MDAForApproval;
