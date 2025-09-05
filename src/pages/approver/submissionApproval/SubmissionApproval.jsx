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
  useGetMySubmissionApprovalsQuery,
  useApproveSubmissionMutation,
  useRejectSubmissionMutation,
} from "../../../features/api/approvalsetting/submissionApprovalApi";
import { CONSTANT } from "../../../config";
import dayjs from "dayjs";
import { createSubmissionApprovalStyles } from "./SubmissionApprovalStyles.jsx";
import SubmissionDetailsDialog from "./SubmissionDetailsDialog.jsx";

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
        placeholder="Search Submission Approvals..."
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

const SubmissionApproval = () => {
  const theme = useTheme();
  const styles = createSubmissionApprovalStyles(theme);
  const { enqueueSnackbar } = useSnackbar();

  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [detailsDialog, setDetailsDialog] = useState({
    open: false,
    submission: null,
  });

  const methods = useForm({
    defaultValues: {
      status: "active",
    },
  });

  const debounceValue = useDebounce(searchQuery, 500);

  const [approveSubmission, { isLoading: approveLoading }] =
    useApproveSubmissionMutation();
  const [rejectSubmission, { isLoading: rejectLoading }] =
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
    data: submissionApprovalsData,
    isLoading: queryLoading,
    isFetching,
    refetch,
    error,
  } = useGetMySubmissionApprovalsQuery(queryParams, {
    refetchOnMountOrArgChange: true,
    skip: false,
  });

  const submissionApprovalsList = useMemo(
    () => submissionApprovalsData?.result?.data || [],
    [submissionApprovalsData]
  );

  const handleSearchChange = useCallback((newSearchQuery) => {
    setSearchQuery(newSearchQuery);
    setPage(1);
  }, []);

  const handleRowClick = useCallback((submission) => {
    setDetailsDialog({
      open: true,
      submission,
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
      const { submission } = detailsDialog;
      try {
        const payload = {
          id: submission.id,
          comments,
          reason,
        };

        await approveSubmission(payload).unwrap();
        enqueueSnackbar("Submission approved successfully!", {
          variant: "success",
        });
        setDetailsDialog({ open: false, submission: null });
        refetch();
      } catch (error) {
        enqueueSnackbar(
          error?.data?.message || "Failed to approve submission",
          { variant: "error" }
        );
      }
    },
    [detailsDialog, approveSubmission, enqueueSnackbar, refetch]
  );

  const handleReject = useCallback(
    async ({ comments, reason }) => {
      const { submission } = detailsDialog;
      try {
        const payload = {
          id: submission.id,
          comments,
          reason,
        };

        await rejectSubmission(payload).unwrap();
        enqueueSnackbar("Submission returned successfully!", {
          variant: "success",
        });
        setDetailsDialog({ open: false, submission: null });
        refetch();
      } catch (error) {
        enqueueSnackbar(error?.data?.message || "Failed to return submission", {
          variant: "error",
        });
      }
    },
    [detailsDialog, rejectSubmission, enqueueSnackbar, refetch]
  );

  const handleDetailsDialogClose = useCallback(() => {
    setDetailsDialog({ open: false, submission: null });
  }, []);

  const renderStatusChip = useCallback(
    (submission) => {
      const status = submission?.status?.toLowerCase() || "pending";
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
            <Typography className="header">PENDING APPRROVAL</Typography>
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
                  <TableCell
                    align="left"
                    sx={{
                      ...styles.idCell,
                      width: "80px",
                      minWidth: "80px",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}>
                    ID
                  </TableCell>
                  <TableCell
                    sx={{
                      ...styles.referenceCell,
                      width: "180px",
                      minWidth: "180px",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}>
                    REFERENCE NUMBER
                  </TableCell>
                  <TableCell
                    sx={{
                      ...styles.titleCell,
                      width: "250px",
                      minWidth: "250px",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}>
                    POSITION
                  </TableCell>
                  <TableCell
                    sx={{
                      ...styles.nameCell,
                      width: "220px",
                      minWidth: "220px",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}>
                    REQUISITION TYPE
                  </TableCell>
                  <TableCell
                    sx={{
                      ...styles.submitterCell,
                      width: "250px",
                      minWidth: "250px",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}>
                    REQUESTED BY
                  </TableCell>
                  <TableCell
                    sx={{
                      ...styles.formTypeCell,
                      width: "180px",
                      minWidth: "180px",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}>
                    DEPARTMENT
                  </TableCell>
                  <TableCell
                    sx={{
                      ...styles.statusCell,
                      width: "120px",
                      minWidth: "120px",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}>
                    STATUS
                  </TableCell>
                  <TableCell
                    sx={{
                      ...styles.dateCell,
                      width: "150px",
                      minWidth: "150px",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}>
                    CREATED DATE
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {isLoadingState ? (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      align="center"
                      sx={styles.loadingCell}>
                      <CircularProgress size={32} sx={styles.loadingProgress} />
                    </TableCell>
                  </TableRow>
                ) : error ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={styles.errorCell}>
                      <Typography color="error">
                        Error loading data: {error.message || "Unknown error"}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : submissionApprovalsList.length > 0 ? (
                  submissionApprovalsList.map((submission) => {
                    const submissionData = submission.submission || submission;
                    return (
                      <TableRow
                        key={submission.id}
                        onClick={() => handleRowClick(submission)}
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
                        <TableCell
                          align="left"
                          sx={{
                            ...styles.idCell,
                            width: "80px",
                            minWidth: "80px",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}>
                          {submissionData.id}
                        </TableCell>
                        <TableCell
                          sx={{
                            ...styles.referenceCell,
                            width: "180px",
                            minWidth: "180px",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}>
                          {submissionData.form_details?.reference_number || "-"}
                        </TableCell>
                        <TableCell
                          sx={{
                            ...styles.titleCell,
                            width: "250px",
                            minWidth: "250px",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}>
                          {submissionData.form_details?.position?.title?.name ||
                            "Unknown Position"}
                        </TableCell>
                        <TableCell
                          sx={{
                            ...styles.nameCell,
                            width: "220px",
                            minWidth: "220px",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}>
                          {submissionData.form_details?.requisition_type
                            ?.name || "-"}
                        </TableCell>
                        <TableCell
                          sx={{
                            ...styles.submitterCell,
                            width: "250px",
                            minWidth: "250px",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}>
                          {submissionData.requested_by?.full_name ||
                            submissionData.requested_by?.first_name ||
                            "Unknown"}
                        </TableCell>
                        <TableCell
                          sx={{
                            ...styles.formTypeCell,
                            width: "180px",
                            minWidth: "180px",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}>
                          {submissionData.charging?.department_name || "-"}
                        </TableCell>
                        <TableCell
                          sx={{
                            ...styles.statusCell,
                            width: "120px",
                            minWidth: "120px",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}>
                          {renderStatusChip(submission)}
                        </TableCell>
                        <TableCell
                          sx={{
                            ...styles.dateCell,
                            width: "150px",
                            minWidth: "150px",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}>
                          {submissionData.created_at
                            ? dayjs(submissionData.created_at).format(
                                "MMM D, YYYY"
                              )
                            : "-"}
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      align="center"
                      sx={styles.emptyStateContainer}>
                      <Box sx={styles.emptyStateBox}>
                        {CONSTANT.BUTTONS.NODATA.icon}
                        <Typography variant="h6" color="text.secondary">
                          No submission approvals found
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {searchQuery
                            ? `No results for "${searchQuery}"`
                            : "No active submissions"}
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
              count={submissionApprovalsData?.result?.total || 0}
              rowsPerPage={rowsPerPage}
              page={Math.max(0, page - 1)}
              onPageChange={handlePageChange}
              onRowsPerPageChange={handleRowsPerPageChange}
              sx={styles.paginationToolbar}
            />
          </Box>
        </Box>

        <SubmissionDetailsDialog
          open={detailsDialog.open}
          onClose={handleDetailsDialogClose}
          submission={detailsDialog.submission}
          onApprove={handleApprove}
          onReject={handleReject}
          isLoading={approveLoading || rejectLoading}
          styles={styles}
        />
      </Box>
    </FormProvider>
  );
};

export default SubmissionApproval;
