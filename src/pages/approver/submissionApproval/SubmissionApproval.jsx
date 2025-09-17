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
  useMediaQuery,
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
  const theme = useTheme();
  const isVerySmall = useMediaQuery("(max-width:369px)");

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
      <TextField
        placeholder={
          isVerySmall ? "Search..." : "Search Submission Approvals..."
        }
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        disabled={isLoading}
        size="small"
        InputProps={{
          startAdornment: (
            <SearchIcon
              sx={{
                color: isLoading ? "#ccc" : "#666",
                marginRight: 1,
                fontSize: isVerySmall ? "18px" : "20px",
              }}
            />
          ),
          endAdornment: isLoading && (
            <CircularProgress size={16} sx={{ marginLeft: 1 }} />
          ),
          sx: {
            height: "36px",
            width: isVerySmall ? "100%" : "380px",
            minWidth: isVerySmall ? "180px" : "280px",
            backgroundColor: "white",
            transition: "all 0.2s ease-in-out",
            "& .MuiOutlinedInput-root": {
              height: "36px",
              "& fieldset": {
                borderColor: "#ccc",
                transition: "border-color 0.2s ease-in-out",
              },
              "&:hover fieldset": {
                borderColor: "rgb(33, 61, 112)",
              },
              "&.Mui-focused fieldset": {
                borderColor: "rgb(33, 61, 112)",
                borderWidth: "2px",
              },
              "&.Mui-disabled": {
                backgroundColor: "#f5f5f5",
              },
            },
          },
        }}
        sx={{
          flex: isVerySmall ? 1 : "0 0 auto",
          "& .MuiInputBase-input": {
            fontSize: isVerySmall ? "13px" : "14px",
            "&::placeholder": {
              opacity: 0.7,
            },
          },
        }}
      />
    </Box>
  );
};

const SubmissionApproval = () => {
  const theme = useTheme();
  const styles = createSubmissionApprovalStyles(theme);
  const { enqueueSnackbar } = useSnackbar();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.between(600, 1038));
  const isVerySmall = useMediaQuery("(max-width:369px)");

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
      <Box
        sx={{
          width: "100%",
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          backgroundColor: "#fafafa",
        }}>
        <Box
          sx={{
            display: "flex",
            alignItems: isMobile || isTablet ? "flex-start" : "center",
            justifyContent:
              isMobile || isTablet ? "flex-start" : "space-between",
            flexDirection: isMobile || isTablet ? "column" : "row",
            flexShrink: 0,
            minHeight: isMobile || isTablet ? "auto" : "72px",
            padding: isMobile ? "12px 14px" : isTablet ? "16px" : "16px 14px",
            backgroundColor: "white",
            borderBottom: "1px solid #e0e0e0",
            boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
            gap: isMobile || isTablet ? "16px" : "0",
          }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: isVerySmall ? 1 : isMobile || isTablet ? 2 : 1.4,
              width: isMobile || isTablet ? "100%" : "auto",
              justifyContent: "flex-start",
            }}>
            <Typography className="header">
              {isVerySmall ? "PENDING APPROVAL" : "PENDING APPROVAL"}
            </Typography>
          </Box>

          <CustomSearchBar
            searchQuery={searchQuery}
            setSearchQuery={handleSearchChange}
            isLoading={isLoadingState}
            styles={styles}
          />
        </Box>

        <Box
          sx={{
            flex: 1,
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            backgroundColor: "white",
          }}>
          <Box sx={{ flex: 1, overflow: "auto", backgroundColor: "#fafafa" }}>
            <TableContainer sx={styles.tableContainer}>
              <Table stickyHeader sx={styles.table}>
                <TableHead>
                  <TableRow>
                    <TableCell
                      align="left"
                      sx={{
                        ...styles.idCell,
                        width: isVerySmall
                          ? "60px"
                          : isMobile
                          ? "70px"
                          : "80px",
                        minWidth: isVerySmall
                          ? "60px"
                          : isMobile
                          ? "70px"
                          : "80px",
                        fontSize: isVerySmall ? "11px" : "13px",
                        fontWeight: 600,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}>
                      ID
                    </TableCell>
                    <TableCell
                      sx={{
                        ...styles.referenceCell,
                        width: isVerySmall
                          ? "120px"
                          : isMobile
                          ? "150px"
                          : "180px",
                        minWidth: isVerySmall
                          ? "120px"
                          : isMobile
                          ? "150px"
                          : "180px",
                        fontSize: isVerySmall ? "11px" : "13px",
                        fontWeight: 600,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}>
                      {isVerySmall ? "REF #" : "REFERENCE NUMBER"}
                    </TableCell>
                    <TableCell
                      sx={{
                        ...styles.titleCell,
                        width: isVerySmall
                          ? "150px"
                          : isMobile
                          ? "200px"
                          : "250px",
                        minWidth: isVerySmall
                          ? "150px"
                          : isMobile
                          ? "200px"
                          : "250px",
                        fontSize: isVerySmall ? "11px" : "13px",
                        fontWeight: 600,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}>
                      POSITION
                    </TableCell>
                    <TableCell
                      sx={{
                        ...styles.nameCell,
                        width: isVerySmall
                          ? "120px"
                          : isMobile
                          ? "180px"
                          : "220px",
                        minWidth: isVerySmall
                          ? "120px"
                          : isMobile
                          ? "180px"
                          : "220px",
                        fontSize: isVerySmall ? "11px" : "13px",
                        fontWeight: 600,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}>
                      {isVerySmall ? "REQ TYPE" : "REQUISITION TYPE"}
                    </TableCell>
                    <TableCell
                      sx={{
                        ...styles.submitterCell,
                        width: isVerySmall
                          ? "150px"
                          : isMobile
                          ? "200px"
                          : "250px",
                        minWidth: isVerySmall
                          ? "150px"
                          : isMobile
                          ? "200px"
                          : "250px",
                        fontSize: isVerySmall ? "11px" : "13px",
                        fontWeight: 600,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}>
                      {isVerySmall ? "REQ BY" : "REQUESTED BY"}
                    </TableCell>
                    <TableCell
                      sx={{
                        ...styles.formTypeCell,
                        width: isVerySmall
                          ? "100px"
                          : isMobile
                          ? "140px"
                          : "180px",
                        minWidth: isVerySmall
                          ? "100px"
                          : isMobile
                          ? "140px"
                          : "180px",
                        fontSize: isVerySmall ? "11px" : "13px",
                        fontWeight: 600,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}>
                      {isVerySmall ? "DEPT" : "DEPARTMENT"}
                    </TableCell>
                    <TableCell
                      sx={{
                        ...styles.statusCell,
                        width: isVerySmall
                          ? "80px"
                          : isMobile
                          ? "100px"
                          : "120px",
                        minWidth: isVerySmall
                          ? "80px"
                          : isMobile
                          ? "100px"
                          : "120px",
                        fontSize: isVerySmall ? "11px" : "13px",
                        fontWeight: 600,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}>
                      STATUS
                    </TableCell>
                    <TableCell
                      sx={{
                        ...styles.dateCell,
                        width: isVerySmall
                          ? "100px"
                          : isMobile
                          ? "120px"
                          : "150px",
                        minWidth: isVerySmall
                          ? "100px"
                          : isMobile
                          ? "120px"
                          : "150px",
                        fontSize: isVerySmall ? "11px" : "13px",
                        fontWeight: 600,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}>
                      {isVerySmall ? "DATE" : "CREATED DATE"}
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {isLoadingState ? (
                    <TableRow>
                      <TableCell
                        colSpan={8}
                        align="center"
                        sx={{
                          ...styles.loadingCell,
                          padding: isMobile ? "20px" : "40px",
                        }}>
                        <CircularProgress
                          size={32}
                          sx={styles.loadingProgress}
                        />
                      </TableCell>
                    </TableRow>
                  ) : error ? (
                    <TableRow>
                      <TableCell
                        colSpan={8}
                        align="center"
                        sx={{
                          ...styles.errorCell,
                          padding: isMobile ? "20px" : "40px",
                        }}>
                        <Typography
                          color="error"
                          sx={{ fontSize: isVerySmall ? "12px" : "14px" }}>
                          Error loading data: {error.message || "Unknown error"}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : submissionApprovalsList.length > 0 ? (
                    submissionApprovalsList.map((submission) => {
                      const submissionData =
                        submission.submission || submission;
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
                              width: isVerySmall
                                ? "60px"
                                : isMobile
                                ? "70px"
                                : "80px",
                              minWidth: isVerySmall
                                ? "60px"
                                : isMobile
                                ? "70px"
                                : "80px",
                              fontSize: isVerySmall ? "11px" : "13px",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}>
                            {submissionData.id}
                          </TableCell>
                          <TableCell
                            sx={{
                              ...styles.referenceCell,
                              width: isVerySmall
                                ? "120px"
                                : isMobile
                                ? "150px"
                                : "180px",
                              minWidth: isVerySmall
                                ? "120px"
                                : isMobile
                                ? "150px"
                                : "180px",
                              fontSize: isVerySmall ? "11px" : "13px",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}>
                            {submissionData.form_details?.reference_number ||
                              "-"}
                          </TableCell>
                          <TableCell
                            sx={{
                              ...styles.titleCell,
                              width: isVerySmall
                                ? "150px"
                                : isMobile
                                ? "200px"
                                : "250px",
                              minWidth: isVerySmall
                                ? "150px"
                                : isMobile
                                ? "200px"
                                : "250px",
                              fontSize: isVerySmall ? "11px" : "13px",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}>
                            {submissionData.form_details?.position?.title
                              ?.name || "Unknown Position"}
                          </TableCell>
                          <TableCell
                            sx={{
                              ...styles.nameCell,
                              width: isVerySmall
                                ? "120px"
                                : isMobile
                                ? "180px"
                                : "220px",
                              minWidth: isVerySmall
                                ? "120px"
                                : isMobile
                                ? "180px"
                                : "220px",
                              fontSize: isVerySmall ? "11px" : "13px",
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
                              width: isVerySmall
                                ? "150px"
                                : isMobile
                                ? "200px"
                                : "250px",
                              minWidth: isVerySmall
                                ? "150px"
                                : isMobile
                                ? "200px"
                                : "250px",
                              fontSize: isVerySmall ? "11px" : "13px",
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
                              width: isVerySmall
                                ? "100px"
                                : isMobile
                                ? "140px"
                                : "180px",
                              minWidth: isVerySmall
                                ? "100px"
                                : isMobile
                                ? "140px"
                                : "180px",
                              fontSize: isVerySmall ? "11px" : "13px",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}>
                            {submissionData.charging?.department_name || "-"}
                          </TableCell>
                          <TableCell
                            sx={{
                              ...styles.statusCell,
                              width: isVerySmall
                                ? "80px"
                                : isMobile
                                ? "100px"
                                : "120px",
                              minWidth: isVerySmall
                                ? "80px"
                                : isMobile
                                ? "100px"
                                : "120px",
                              fontSize: isVerySmall ? "11px" : "13px",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}>
                            {renderStatusChip(submission)}
                          </TableCell>
                          <TableCell
                            sx={{
                              ...styles.dateCell,
                              width: isVerySmall
                                ? "100px"
                                : isMobile
                                ? "120px"
                                : "150px",
                              minWidth: isVerySmall
                                ? "100px"
                                : isMobile
                                ? "120px"
                                : "150px",
                              fontSize: isVerySmall ? "11px" : "13px",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}>
                            {submissionData.created_at
                              ? dayjs(submissionData.created_at).format(
                                  isVerySmall ? "M/D/YY" : "MMM D, YYYY"
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
                        sx={{
                          ...styles.emptyStateContainer,
                          padding: isMobile ? "20px" : "40px",
                        }}>
                        <Box sx={styles.emptyStateBox}>
                          {CONSTANT.BUTTONS.NODATA.icon}
                          <Typography
                            variant="h6"
                            color="text.secondary"
                            sx={{ fontSize: isVerySmall ? "14px" : "16px" }}>
                            No submission approvals found
                          </Typography>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ fontSize: isVerySmall ? "12px" : "14px" }}>
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

            <Box
              sx={{
                ...styles.paginationContainer,
                padding: isMobile ? "8px" : "16px",
              }}>
              <TablePagination
                rowsPerPageOptions={[5, 10, 25, 50, 100]}
                component="div"
                count={submissionApprovalsData?.result?.total || 0}
                rowsPerPage={rowsPerPage}
                page={Math.max(0, page - 1)}
                onPageChange={handlePageChange}
                onRowsPerPageChange={handleRowsPerPageChange}
                sx={{
                  ...styles.paginationToolbar,
                  "& .MuiTablePagination-toolbar": {
                    minHeight: isMobile ? "40px" : "52px",
                    paddingLeft: isMobile ? "8px" : "16px",
                    paddingRight: isMobile ? "8px" : "16px",
                  },
                  "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows":
                    {
                      fontSize: isVerySmall ? "12px" : "14px",
                    },
                  "& .MuiTablePagination-select": {
                    fontSize: isVerySmall ? "12px" : "14px",
                  },
                  "& .MuiIconButton-root": {
                    padding: isMobile ? "4px" : "8px",
                  },
                }}
              />
            </Box>
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
