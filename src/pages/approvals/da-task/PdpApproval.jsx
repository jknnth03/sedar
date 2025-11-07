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
  Chip,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import { FormProvider, useForm } from "react-hook-form";
import { useSnackbar } from "notistack";
import "../../../pages/GeneralStyle.scss";
import {
  useGetPdpApprovalsQuery,
  useGetPdpTaskByIdQuery,
  useApprovePdpMutation,
  useReturnPdpMutation,
} from "../../../features/api/approving/pdpApproval.js";
import { CONSTANT } from "../../../config";
import dayjs from "dayjs";
import { createSubmissionApprovalStyles } from "../submissionApproval/SubmissionApprovalStyles.jsx";
import PdpApprovalDialog from "./PdpApprovalDialog.jsx";

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
  const isVerySmall = window.innerWidth <= 369;
  const isMobile = window.innerWidth <= 600;

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
      <TextField
        placeholder={isVerySmall ? "Search..." : "Search PDP Approvals..."}
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

const PdpApproval = () => {
  const styles = createSubmissionApprovalStyles();
  const { enqueueSnackbar } = useSnackbar();
  const isMobile = window.innerWidth <= 600;
  const isTablet = window.innerWidth > 600 && window.innerWidth <= 1038;
  const isVerySmall = window.innerWidth <= 369;

  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedApprovalId, setSelectedApprovalId] = useState(null);
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

  const [approvePdp, { isLoading: approveLoading }] = useApprovePdpMutation();
  const [returnPdp, { isLoading: returnLoading }] = useReturnPdpMutation();

  const queryParams = useMemo(() => {
    const params = {
      page,
      per_page: rowsPerPage,
      status: "active",
      pagination: 1,
    };

    if (debounceValue && debounceValue.trim() !== "") {
      params.search = debounceValue.trim();
    }

    return params;
  }, [debounceValue, page, rowsPerPage]);

  const {
    data: pdpApprovalsData,
    isLoading: queryLoading,
    isFetching,
    refetch,
    error,
  } = useGetPdpApprovalsQuery(queryParams, {
    refetchOnMountOrArgChange: true,
    skip: false,
  });

  const { data: selectedApprovalData, isLoading: selectedApprovalLoading } =
    useGetPdpTaskByIdQuery(selectedApprovalId, {
      skip: !selectedApprovalId,
    });

  const pdpApprovalsList = useMemo(
    () => pdpApprovalsData?.result?.data || [],
    [pdpApprovalsData]
  );

  const handleSearchChange = useCallback((newSearchQuery) => {
    setSearchQuery(newSearchQuery);
    setPage(1);
  }, []);

  const handleRowClick = useCallback((approval) => {
    setSelectedApprovalId(approval.id);
    setDetailsDialog({
      open: true,
      submission: approval,
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
    async ({ comments }) => {
      const { submission } = detailsDialog;
      try {
        const payload = {
          id: submission.id,
          comments,
        };

        await approvePdp(payload).unwrap();
        enqueueSnackbar("PDP approved successfully!", {
          variant: "success",
        });
        setDetailsDialog({ open: false, submission: null });
        setSelectedApprovalId(null);
        refetch();
      } catch (error) {
        enqueueSnackbar(error?.data?.message || "Failed to approve PDP", {
          variant: "error",
        });
      }
    },
    [detailsDialog, approvePdp, enqueueSnackbar, refetch]
  );

  const handleReturn = useCallback(
    async ({ correction_remarks }) => {
      const { submission } = detailsDialog;
      try {
        const payload = {
          id: submission.id,
          correction_remarks,
        };

        await returnPdp(payload).unwrap();
        enqueueSnackbar("PDP returned successfully!", {
          variant: "success",
        });
        setDetailsDialog({ open: false, submission: null });
        setSelectedApprovalId(null);
        refetch();
      } catch (error) {
        enqueueSnackbar(error?.data?.message || "Failed to return PDP", {
          variant: "error",
        });
      }
    },
    [detailsDialog, returnPdp, enqueueSnackbar, refetch]
  );

  const handleDetailsDialogClose = useCallback(() => {
    setDetailsDialog({ open: false, submission: null });
    setSelectedApprovalId(null);
  }, []);

  const renderStatusChip = useCallback((status) => {
    const statusLower = status?.toLowerCase() || "pending";
    const statusConfig = {
      for_approval: { label: "FOR APPROVAL", color: "#ff9800" },
      approved: { label: "APPROVED", color: "#4caf50" },
      returned: { label: "RETURNED", color: "#f44336" },
      pending: { label: "PENDING", color: "#2196f3" },
    };

    const config = statusConfig[statusLower] || statusConfig.pending;

    return (
      <Chip
        label={config.label}
        size="small"
        sx={{
          backgroundColor: config.color,
          color: "white",
          fontWeight: 600,
          fontSize: "12px",
        }}
      />
    );
  }, []);

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
            <Typography className="header">PDP APPROVAL</Typography>
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
            <Table
              stickyHeader
              sx={{
                height: pdpApprovalsList.length === 0 ? "100%" : "auto",
              }}>
              <TableHead>
                <TableRow>
                  <TableCell
                    sx={{
                      width: isVerySmall
                        ? "180px"
                        : isMobile
                        ? "220px"
                        : "280px",
                      minWidth: isVerySmall
                        ? "180px"
                        : isMobile
                        ? "220px"
                        : "280px",
                    }}>
                    {isVerySmall ? "NAME" : "TEMPLATE NAME"}
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
                    EMPLOYEE NAME
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
                    {isVerySmall ? "DEPT" : "DEPARTMENT"}
                  </TableCell>
                  <TableCell
                    sx={{
                      width: isVerySmall
                        ? "150px"
                        : isMobile
                        ? "180px"
                        : "220px",
                      minWidth: isVerySmall
                        ? "150px"
                        : isMobile
                        ? "180px"
                        : "220px",
                    }}>
                    {isVerySmall ? "SUPERIOR" : "SUPERIOR NAME"}
                  </TableCell>
                  <TableCell
                    sx={{
                      width: isVerySmall
                        ? "120px"
                        : isMobile
                        ? "140px"
                        : "170px",
                      minWidth: isVerySmall
                        ? "120px"
                        : isMobile
                        ? "140px"
                        : "170px",
                    }}>
                    {isVerySmall ? "SUBMITTED" : "SUBMITTED AT"}
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody
                sx={{
                  height: pdpApprovalsList.length === 0 ? "100%" : "auto",
                }}>
                {isLoadingState ? (
                  <TableRow sx={{ height: "100%" }}>
                    <TableCell
                      colSpan={5}
                      align="center"
                      sx={{ py: 4, height: "100%", verticalAlign: "middle" }}>
                      <CircularProgress
                        size={32}
                        sx={{ color: "rgb(33, 61, 112)" }}
                      />
                    </TableCell>
                  </TableRow>
                ) : error ? (
                  <TableRow sx={{ height: "100%" }}>
                    <TableCell
                      colSpan={5}
                      align="center"
                      sx={{ py: 4, height: "100%", verticalAlign: "middle" }}>
                      <Typography
                        color="error"
                        sx={{ fontSize: isVerySmall ? "12px" : "14px" }}>
                        Error loading data: {error.message || "Unknown error"}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : pdpApprovalsList.length > 0 ? (
                  pdpApprovalsList.map((approval) => {
                    return (
                      <TableRow
                        key={approval.id}
                        onClick={() => handleRowClick(approval)}
                        sx={{
                          cursor: "pointer",
                          "&:hover": {
                            backgroundColor: "#f8f9fa",
                          },
                        }}>
                        <TableCell
                          sx={{
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            fontWeight: 600,
                          }}>
                          {approval.name || "-"}
                        </TableCell>
                        <TableCell
                          sx={{
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}>
                          {approval.employee?.employee_name || "-"}
                        </TableCell>
                        <TableCell
                          sx={{
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}>
                          {approval.employee?.department || "-"}
                        </TableCell>
                        <TableCell
                          sx={{
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}>
                          {approval.superior?.name || "-"}
                        </TableCell>
                        <TableCell>
                          {approval.submitted_at
                            ? dayjs(approval.submitted_at).format(
                                isVerySmall ? "M/D/YY" : "MMM D, YYYY"
                              )
                            : "-"}
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow sx={{ height: "100%" }}>
                    <TableCell
                      colSpan={5}
                      align="center"
                      sx={{
                        py: 8,
                        height: "100%",
                        verticalAlign: "middle",
                        border: "none",
                      }}>
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "center",
                          textAlign: "center",
                        }}>
                        <ErrorOutlineIcon
                          sx={{
                            fontSize: 80,
                            color: "#ccc",
                            marginBottom: 2,
                          }}
                        />
                        <Typography variant="h6" color="text.secondary">
                          No PDP for approval found
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {searchQuery
                            ? `No results for "${searchQuery}"`
                            : "No submissions found"}
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
              count={pdpApprovalsData?.result?.total || 0}
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

        <PdpApprovalDialog
          open={detailsDialog.open}
          onClose={handleDetailsDialogClose}
          approval={selectedApprovalData?.result || detailsDialog.submission}
          onApprove={handleApprove}
          onReturn={handleReturn}
          isLoading={approveLoading || returnLoading || selectedApprovalLoading}
          styles={styles}
        />
      </Box>
    </FormProvider>
  );
};

export default PdpApproval;
