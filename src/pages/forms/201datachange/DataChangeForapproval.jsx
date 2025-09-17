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
  useCreateDataChangeSubmissionMutation,
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
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

  const [menuAnchor, setMenuAnchor] = useState({});
  const [selectedRowForMenu, setSelectedRowForMenu] = useState(null);

  const [isLoading, setIsLoading] = useState(false);

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
      approval_status: "pending", // Only show pending requests
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

  const [createDataChangeSubmission] = useCreateDataChangeSubmissionMutation();

  const submissionsList = useMemo(
    () => submissionsData?.result?.data || [],
    [submissionsData]
  );

  const handleRowClick = useCallback((submission) => {
    console.log("Row clicked, submission:", submission);
    console.log("Setting mode to view");

    // Clear any existing state first
    setModalOpen(false);
    setMenuAnchor({});
    setSelectedRowForMenu(null);

    // Reset state completely
    setSelectedSubmission(null);
    setModalMode("view");

    // Now set the correct state
    setTimeout(() => {
      setSelectedSubmission(submission);
      setModalMode("view");
      console.log("Mode set to view, opening modal");
      setModalOpen(true);
    }, 50);
  }, []);

  const handleEditSubmission = useCallback((submission) => {
    setMenuAnchor({});
    setSelectedRowForMenu(null);
    setSelectedSubmission(submission);
    setModalMode("edit");
    setModalOpen(true);
  }, []);

  const handleModalClose = useCallback(() => {
    console.log("Modal closing");
    setModalOpen(false);
    setSelectedSubmission(null);
    setModalMode("view");
    setModalLoading(false);
  }, []);

  const handleModalSave = useCallback(
    async (submissionData, mode) => {
      setModalLoading(true);
      setIsLoading(true);

      try {
        if (mode === "create") {
          await createDataChangeSubmission(submissionData).unwrap();
        }

        enqueueSnackbar(
          `Submission ${
            mode === "create" ? "created" : "updated"
          } successfully!`,
          { variant: "success", autoHideDuration: 2000 }
        );

        refetch();
        handleModalClose();
      } catch (error) {
        enqueueSnackbar("Failed to save submission. Please try again.", {
          variant: "error",
          autoHideDuration: 2000,
        });
      } finally {
        setModalLoading(false);
        setIsLoading(false);
      }
    },
    [refetch, enqueueSnackbar, handleModalClose, createDataChangeSubmission]
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

  const isLoadingState = queryLoading || isFetching || isLoading;

  return (
    <FormProvider {...methods}>
      <Box
        sx={{
          width: "100%",
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          backgroundColor: "#fafafa",
        }}>
        <Box
          sx={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            backgroundColor: "white",
            overflow: "auto", // Allow scrolling here
            minHeight: 0, // Important for flex containers
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
            hideStatusColumn={true} // New prop to hide status column
            forApproval={true} // New prop to indicate this is for approval view
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
          selectedEntry={selectedSubmission}
          isLoading={modalLoading}
          onSave={handleModalSave}
        />
      </Box>
    </FormProvider>
  );
};

export default DataChangeForApproval;
