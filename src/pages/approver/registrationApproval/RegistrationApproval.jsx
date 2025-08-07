import React, { useState, useMemo, useCallback, useEffect } from "react";

import {
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  CircularProgress,
  TableRow,
  Box,
  TextField,
  useTheme,
  alpha,
  Chip,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { FormProvider, useForm } from "react-hook-form";
import { useSnackbar } from "notistack";
import "../../../pages/GeneralStyle.scss";
import {
  useGetMyRegistrationApprovalsQuery,
  useApproveSubmissionMutation,
  useRejectSubmissionMutation,
} from "../../../features/api/approvalsetting/submissionApprovalApi.js";
import { CONSTANT } from "../../../config";
import dayjs from "dayjs";
import { createRegistrationApprovalStyles } from "./RegistrationApprovalStyles.jsx";
import RegistrationDetailsDialog from "./RegistrationApprovalDialog.jsx";

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

const CustomSearchBar = ({
  searchQuery,
  setSearchQuery,
  isLoading = false,
  styles,
}) => {
  return (
    <Box sx={styles.searchContainer}>
      <TextField
        placeholder="Search Registration Approvals..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        disabled={isLoading}
        size="small"
        InputProps={{
          startAdornment: <SearchIcon sx={styles.searchIcon(isLoading)} />,
          endAdornment: isLoading && (
            <CircularProgress size={16} sx={styles.searchProgress} />
          ),
        }}
        sx={styles.searchTextField(isLoading)}
      />
    </Box>
  );
};

const RegistrationApproval = () => {
  const theme = useTheme();
  const styles = createRegistrationApprovalStyles(theme);
  const { enqueueSnackbar } = useSnackbar();

  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [detailsDialog, setDetailsDialog] = useState({
    open: false,
    registration: null,
  });

  const methods = useForm({
    defaultValues: {
      status: "active",
    },
  });

  const debounceValue = useDebounce(searchQuery, 500);

  const [approveRegistration, { isLoading: approveLoading }] =
    useApproveSubmissionMutation();
  const [rejectRegistration, { isLoading: rejectLoading }] =
    useRejectSubmissionMutation();

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

    return params;
  }, [debounceValue, page, rowsPerPage]);

  const {
    data: registrationApprovalsData,
    isLoading: queryLoading,
    isFetching,
    refetch,
    error,
  } = useGetMyRegistrationApprovalsQuery(queryParams, {
    refetchOnMountOrArgChange: true,
    skip: false,
  });

  const registrationApprovalsList = useMemo(
    () => registrationApprovalsData?.result?.data || [],
    [registrationApprovalsData]
  );

  const handleSearchChange = useCallback((newSearchQuery) => {
    setSearchQuery(newSearchQuery);
    setPage(1);
  }, []);

  const handleRowClick = useCallback((registration) => {
    setDetailsDialog({
      open: true,
      registration,
    });
  }, []);

  const handlePageChange = useCallback((event, newPage) => {
    setPage(newPage + 1);
  }, []);

  const handleRowsPerPageChange = useCallback((event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(1);
  }, []);

  const handleApprove = useCallback(
    async ({ comments, reason }) => {
      const { registration } = detailsDialog;
      try {
        const payload = {
          id: registration.id,
          comments,
          reason,
        };

        await approveRegistration(payload).unwrap();
        enqueueSnackbar("Registration approved successfully!", {
          variant: "success",
        });
        setDetailsDialog({ open: false, registration: null });
        refetch();
      } catch (error) {
        enqueueSnackbar(
          error?.data?.message || "Failed to approve registration",
          { variant: "error" }
        );
      }
    },
    [detailsDialog, approveRegistration, enqueueSnackbar, refetch]
  );

  const handleReject = useCallback(
    async ({ comments, reason }) => {
      const { registration } = detailsDialog;
      try {
        const payload = {
          id: registration.id,
          comments,
          reason,
        };

        await rejectRegistration(payload).unwrap();
        enqueueSnackbar("Registration returned successfully!", {
          variant: "success",
        });
        setDetailsDialog({ open: false, registration: null });
        refetch();
      } catch (error) {
        enqueueSnackbar(
          error?.data?.message || "Failed to return registration",
          {
            variant: "error",
          }
        );
      }
    },
    [detailsDialog, rejectRegistration, enqueueSnackbar, refetch]
  );

  const handleDetailsDialogClose = useCallback(() => {
    setDetailsDialog({ open: false, registration: null });
  }, []);

  const renderStatusChip = useCallback(
    (registration) => {
      const status = registration?.status?.toLowerCase() || "pending";
      return (
        <Chip
          label={status.toUpperCase()}
          size="small"
          sx={styles.statusChip(status)}
        />
      );
    },
    [styles]
  );

  const isLoadingState = queryLoading || isFetching || isLoading;

  return (
    <FormProvider {...methods}>
      <Box sx={styles.mainContainer}>
        <Box sx={styles.headerContainer}>
          <Box sx={styles.headerLeft}>
            <Typography className="header">
              PENDING REGISTRATION APPROVAL
            </Typography>
          </Box>
          <CustomSearchBar
            searchQuery={searchQuery}
            setSearchQuery={handleSearchChange}
            isLoading={isLoadingState}
            styles={styles}
          />
        </Box>

        <Box sx={styles.tableMainContainer}>
          <TableContainer sx={styles.tableContainer}>
            <Table stickyHeader sx={styles.table}>
              <TableHead>
                <TableRow>
                  <TableCell align="left" sx={styles.idCell}>
                    ID
                  </TableCell>
                  <TableCell sx={styles.nameCell}>FULL NAME</TableCell>
                  <TableCell sx={styles.idNumberCell}>ID NUMBER</TableCell>
                  <TableCell sx={styles.departmentCell}>DEPARTMENT</TableCell>
                  <TableCell sx={styles.requestByCell}>REQUESTED BY</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {isLoadingState ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      align="center"
                      sx={styles.loadingCell}>
                      <CircularProgress size={32} sx={styles.loadingProgress} />
                    </TableCell>
                  </TableRow>
                ) : error ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={styles.errorCell}>
                      <Typography color="error">
                        Error loading data: {error.message || "Unknown error"}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : registrationApprovalsList.length > 0 ? (
                  registrationApprovalsList.map((registration) => {
                    const formDetails = registration?.submission?.form_details;
                    const generalInfo = formDetails?.general_info;
                    const charging = registration?.submission?.charging;
                    const requestedBy = registration?.submission?.requested_by;

                    return (
                      <TableRow
                        key={registration.id}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleRowClick(registration);
                        }}
                        sx={{
                          ...styles.tableRow(theme),
                          cursor: "pointer",
                          "&:hover": {
                            backgroundColor: alpha(
                              theme.palette.primary.main,
                              0.04
                            ),
                          },
                        }}>
                        <TableCell align="left" sx={styles.idCell}>
                          {registration.id}
                        </TableCell>
                        <TableCell sx={styles.nameCell}>
                          {generalInfo?.full_name ||
                            formDetails?.employee_name ||
                            "-"}
                        </TableCell>
                        <TableCell sx={styles.idNumberCell}>
                          {generalInfo?.employee_code || "-"}
                        </TableCell>
                        <TableCell sx={styles.departmentCell}>
                          {charging?.department_name || "-"}
                        </TableCell>
                        <TableCell sx={styles.requestByCell}>
                          {requestedBy?.full_name || "-"}
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      align="center"
                      sx={styles.emptyStateContainer}>
                      <Box sx={styles.emptyStateBox}>
                        {CONSTANT.BUTTONS.NODATA.icon}
                        <Typography variant="h6" color="text.secondary">
                          No registration approvals found
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {searchQuery
                            ? `No results for "${searchQuery}"`
                            : "No active registrations"}
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <Box sx={styles.paginationContainer}>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25, 50, 100]}
              component="div"
              count={registrationApprovalsData?.result?.total || 0}
              rowsPerPage={rowsPerPage}
              page={Math.max(0, page - 1)}
              onPageChange={handlePageChange}
              onRowsPerPageChange={handleRowsPerPageChange}
              sx={styles.paginationToolbar}
            />
          </Box>
        </Box>

        <RegistrationDetailsDialog
          open={detailsDialog.open}
          onClose={handleDetailsDialogClose}
          submission={detailsDialog.registration?.submission}
          onApprove={handleApprove}
          onReject={handleReject}
          isLoading={approveLoading || rejectLoading}
          styles={styles}
        />
      </Box>
    </FormProvider>
  );
};

export default RegistrationApproval;
