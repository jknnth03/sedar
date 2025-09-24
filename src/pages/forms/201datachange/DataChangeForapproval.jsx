import React, { useState, useMemo, useCallback, useEffect } from "react";
import {
  Paper,
  Typography,
  TablePagination,
  CircularProgress,
  Box,
  Button,
  useTheme,
  alpha,
  Fade,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
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
import { CONSTANT } from "../../../config";
import dayjs from "dayjs";
import DataChangeForapprovalTable from "./DataChangeForapprovalTable";
import DataChangeModal from "../../../components/modal/form/DataChange/DataChangeModal";

const useDebounceInternal = (value, delay) => {
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

const DataChangeForApproval = () => {
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();

  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("view");
  const [selectedSubmissionId, setSelectedSubmissionId] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

  const [menuAnchor, setMenuAnchor] = useState({});
  const [selectedRowForMenu, setSelectedRowForMenu] = useState(null);

  const [isLoading, setIsLoading] = useState(false);
  const [detailsRefetchTrigger, setDetailsRefetchTrigger] = useState(0);

  const methods = useForm({
    defaultValues: {
      reason_for_change: "",
      employee_id: null,
      new_position_id: null,
      remarks: "",
    },
  });

  const debounceValue = useDebounceInternal("", 500);

  const queryParams = useMemo(() => {
    const params = {
      page,
      per_page: rowsPerPage,
      status: "active",
      pagination: 1,
      approval_status: "pending",
    };

    return params;
  }, [page, rowsPerPage]);

  const {
    data: submissionsData,
    isLoading: queryLoading,
    isFetching,
    refetch,
    error,
  } = useGetDataChangeSubmissionsQuery(queryParams, {
    refetchOnMountOrArgChange: true,
    skip: false,
  });

  const {
    data: submissionDetails,
    isLoading: detailsLoading,
    error: detailsError,
    refetch: refetchDetails,
  } = useGetDataChangeSubmissionDetailsQuery(selectedSubmissionId, {
    skip: !selectedSubmissionId,
    refetchOnMountOrArgChange: true,
  });

  const [createDataChangeSubmission] = useCreateDataChangeSubmissionMutation();
  const [updateDataChangeSubmission] = useUpdateDataChangeSubmissionMutation();
  const [resubmitDataChangeSubmission] =
    useResubmitDataChangeSubmissionMutation();

  const submissionsList = useMemo(
    () => submissionsData?.result?.data || [],
    [submissionsData]
  );

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

  const handleModalClose = useCallback(() => {
    setModalOpen(false);
    setSelectedSubmissionId(null);
    // setModalMode("view");
    setModalLoading(false);
  }, []);

  const handleRefreshDetails = useCallback(() => {
    if (selectedSubmissionId && refetchDetails) {
      refetchDetails();
      setDetailsRefetchTrigger((prev) => prev + 1);
    }
  }, [selectedSubmissionId, refetchDetails]);

  const handleModalSave = useCallback(
    async (submissionData, mode, submissionId) => {
      setModalLoading(true);
      setIsLoading(true);

      try {
        if (mode === "create") {
          await createDataChangeSubmission(submissionData).unwrap();
          enqueueSnackbar("Submission created successfully!", {
            variant: "success",
            autoHideDuration: 2000,
          });
        } else if (mode === "edit") {
          await updateDataChangeSubmission({
            id: submissionId,
            body: submissionData,
          }).unwrap();
          enqueueSnackbar("Submission updated successfully!", {
            variant: "success",
            autoHideDuration: 2000,
          });
        } else if (mode === "resubmit") {
          await resubmitDataChangeSubmission(submissionData).unwrap();
          enqueueSnackbar("Submission resubmitted successfully!", {
            variant: "success",
            autoHideDuration: 2000,
          });
        }

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
      } finally {
        setModalLoading(false);
        setIsLoading(false);
      }
    },
    [
      refetch,
      enqueueSnackbar,
      handleModalClose,
      createDataChangeSubmission,
      updateDataChangeSubmission,
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

  const handlePageChange = useCallback((event, newPage) => {
    setPage(newPage + 1);
  }, []);

  const handleRowsPerPageChange = useCallback((event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(1);
  }, []);

  const handleModeChange = useCallback((newMode) => {
    setModalMode(newMode);
  }, []);

  const isLoadingState = queryLoading || isFetching || isLoading;

  return (
    <FormProvider {...methods}>
      <Box
        sx={{
          width: "100%",
          height: "100%",
          minHeight: "calc(100vh - 180px)",
          display: "flex",
          flexDirection: "column",
          backgroundColor: "#fafafa",
          position: "relative",
        }}>
        <Box
          sx={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            backgroundColor: "white",
            minHeight: 0,
            height: "100%",
          }}>
          <Box
            sx={{
              flex: 1,
              minHeight: 0,
              height: 0,
              display: "flex",
              flexDirection: "column",
            }}>
            <Box
              sx={{
                flex: 1,
                overflowY: "auto",
                overflowX: "auto",
                minHeight: "400px",
                maxHeight: "calc(100vh - 250px)",
                backgroundColor: "white",
                "& .MuiTable-root": {
                  minWidth: "100%",
                },
                "&::-webkit-scrollbar": {
                  width: "8px",
                  height: "8px",
                },
                "&::-webkit-scrollbar-track": {
                  backgroundColor: "#f1f1f1",
                },
                "&::-webkit-scrollbar-thumb": {
                  backgroundColor: "#c1c1c1",
                  borderRadius: "4px",
                  "&:hover": {
                    backgroundColor: "#a1a1a1",
                  },
                },
              }}>
              <DataChangeForapprovalTable
                submissionsList={submissionsList}
                isLoadingState={isLoadingState}
                error={error}
                handleRowClick={handleRowClick}
                handleMenuOpen={handleMenuOpen}
                handleMenuClose={handleMenuClose}
                handleEditSubmission={handleEditSubmission}
                menuAnchor={menuAnchor}
                searchQuery=""
                showArchived={false}
                hideStatusColumn={true}
                forApproval={true}
              />
            </Box>
          </Box>

          <Box
            sx={{
              borderTop: "1px solid #e0e0e0",
              backgroundColor: "#f8f9fa",
              flexShrink: 0,
              minHeight: "64px",
              display: "flex",
              alignItems: "center",
              position: "sticky",
              bottom: 0,
              zIndex: 10,
              "& .MuiTablePagination-root": {
                color: "#666",
                width: "100%",
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
            }}>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25, 50, 100]}
              component="div"
              count={submissionsData?.result?.total || 0}
              rowsPerPage={rowsPerPage}
              page={Math.max(0, page - 1)}
              onPageChange={handlePageChange}
              onRowsPerPageChange={handleRowsPerPageChange}
              sx={{
                width: "100%",
                "& .MuiTablePagination-toolbar": {
                  minHeight: "56px",
                  paddingLeft: "24px",
                  paddingRight: "24px",
                },
              }}
            />
          </Box>
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
        />
      </Box>
    </FormProvider>
  );
};

export default DataChangeForApproval;
