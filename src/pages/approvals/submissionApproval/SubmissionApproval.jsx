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
          height: "100%",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          backgroundColor: "white",
        }}>
        <Box
          sx={{
            display: "flex",
            alignItems: isMobile || isTablet ? "flex-start" : "center",
            justifyContent:
              isMobile || isTablet ? "flex-start" : "space-between",
            flexDirection: isMobile || isTablet ? "column" : "row",
            flexShrink: 0,
            minHeight: isMobile || isTablet ? "auto" : "60px",
            padding: isMobile ? "12px 14px" : isTablet ? "16px" : "12px 16px",
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
            <Typography className="header">MRF APPROVAL</Typography>
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
          <TableContainer
            sx={{
              flex: 1,
              overflow: "auto",
              "& .MuiTableCell-head": {
                backgroundColor: "#f8f9fa",
                fontWeight: 700,
                fontSize: isVerySmall ? "14px" : isMobile ? "16px" : "18px",
                color: "rgb(33, 61, 112)",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                borderBottom: "2px solid #e0e0e0",
                position: "sticky",
                top: 0,
                zIndex: 10,
                height: isMobile ? "44px" : "48px",
                padding: isMobile ? "6px 12px" : "8px 16px",
              },
              "& .MuiTableCell-body": {
                fontSize: isVerySmall ? "12px" : isMobile ? "14px" : "16px",
                color: "#333",
                borderBottom: "1px solid #f0f0f0",
                padding: isMobile ? "6px 12px" : "8px 16px",
                height: isMobile ? "48px" : "52px",
              },
              "& .MuiTableRow-root": {
                transition: "background-color 0.2s ease-in-out",
                "&:hover": {
                  backgroundColor: "#f8f9fa",
                },
              },
            }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell
                    align="left"
                    sx={{
                      width: isVerySmall ? "60px" : isMobile ? "70px" : "80px",
                      minWidth: isVerySmall
                        ? "60px"
                        : isMobile
                        ? "70px"
                        : "80px",
                    }}>
                    ID
                  </TableCell>
                  <TableCell
                    sx={{
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
                    }}>
                    {isVerySmall ? "REF #" : "REFERENCE NO."}
                  </TableCell>
                  <TableCell
                    sx={{
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
                    }}>
                    POSITION
                  </TableCell>
                  <TableCell
                    sx={{
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
                    }}>
                    {isVerySmall ? "REQ TYPE" : "REQUISITION TYPE"}
                  </TableCell>
                  <TableCell
                    sx={{
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
                    }}>
                    {isVerySmall ? "REQ BY" : "REQUESTED BY"}
                  </TableCell>
                  <TableCell
                    sx={{
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
                    }}>
                    {isVerySmall ? "DEPT" : "DEPARTMENT"}
                  </TableCell>
                  {!isMobile && (
                    <TableCell
                      align="center"
                      sx={{
                        width: "120px",
                        minWidth: "120px",
                      }}>
                      STATUS
                    </TableCell>
                  )}
                  <TableCell
                    sx={{
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
                    }}>
                    {isVerySmall ? "DATE" : "DATE CREATED"}
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {isLoadingState ? (
                  <TableRow>
                    <TableCell
                      colSpan={isMobile ? 7 : 8}
                      align="center"
                      sx={{ py: 4 }}>
                      <CircularProgress
                        size={32}
                        sx={{ color: "rgb(33, 61, 112)" }}
                      />
                    </TableCell>
                  </TableRow>
                ) : error ? (
                  <TableRow>
                    <TableCell
                      colSpan={isMobile ? 7 : 8}
                      align="center"
                      sx={{ py: 4 }}>
                      <Typography
                        color="error"
                        sx={{ fontSize: isVerySmall ? "12px" : "14px" }}>
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
                          cursor: "pointer",
                          "&:hover": {
                            backgroundColor: "#f8f9fa",
                          },
                        }}>
                        <TableCell align="left">{submissionData.id}</TableCell>
                        <TableCell
                          sx={{
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}>
                          {submissionData.form_details?.reference_number || "-"}
                        </TableCell>
                        <TableCell
                          sx={{
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            fontWeight: 600,
                          }}>
                          {submissionData.form_details?.position?.title?.name ||
                            "Unknown Position"}
                        </TableCell>
                        <TableCell
                          sx={{
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}>
                          {submissionData.form_details?.requisition_type
                            ?.name || "-"}
                        </TableCell>
                        <TableCell
                          sx={{
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
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}>
                          {submissionData.charging?.department_name || "-"}
                        </TableCell>
                        {!isMobile && (
                          <TableCell align="center">
                            {renderStatusChip(submission)}
                          </TableCell>
                        )}
                        <TableCell>
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
                      colSpan={isMobile ? 7 : 8}
                      align="center"
                      sx={{
                        py: 8,
                        borderBottom: "none",
                        color: "#666",
                        fontSize: isMobile ? "14px" : "16px",
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
              borderTop: "1px solid #e0e0e0",
              backgroundColor: "#f8f9fa",
              flexShrink: 0,
              "& .MuiTablePagination-root": {
                color: "#666",
                "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows":
                  {
                    fontSize: isMobile ? "12px" : "14px",
                    fontWeight: 500,
                  },
                "& .MuiTablePagination-select": {
                  fontSize: isMobile ? "12px" : "14px",
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
              count={submissionApprovalsData?.result?.total || 0}
              rowsPerPage={rowsPerPage}
              page={Math.max(0, page - 1)}
              onPageChange={handlePageChange}
              onRowsPerPageChange={handleRowsPerPageChange}
              sx={{
                "& .MuiTablePagination-toolbar": {
                  paddingLeft: isMobile ? "12px" : "24px",
                  paddingRight: isMobile ? "12px" : "24px",
                },
              }}
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
