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
  useGetMyMdaApprovalsQuery,
  useGetMdaApprovalByIdQuery,
  useApproveMdaMutation,
  useRejectMdaMutation,
} from "../../../features/api/approving/mdaApprovalApi.js";
import { CONSTANT } from "../../../config";
import dayjs from "dayjs";
import { createRegistrationApprovalStyles } from "../registrationApproval/RegistrationApprovalStyles.jsx";
import MdaApprovalDialog from "./MdaApprovalDialog.jsx";

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
        placeholder={isVerySmall ? "Search..." : "Search MDA Approvals..."}
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

const MdaApproval = () => {
  const theme = useTheme();
  const styles = createRegistrationApprovalStyles(theme);
  const { enqueueSnackbar } = useSnackbar();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.between(600, 1038));
  const isVerySmall = useMediaQuery("(max-width:369px)");

  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [detailsDialog, setDetailsDialog] = useState({
    open: false,
    mdaId: null,
  });

  const methods = useForm({
    defaultValues: {
      status: "active",
    },
  });

  const debounceValue = useDebounce(searchQuery, 500);

  const [approveMda, { isLoading: approveLoading }] = useApproveMdaMutation();
  const [rejectMda, { isLoading: rejectLoading }] = useRejectMdaMutation();

  const queryParams = useMemo(() => {
    const params = {
      page,
      per_page: rowsPerPage,
      status: "active",
      approval_status: "PENDING",
      pagination: true,
    };

    if (debounceValue && debounceValue.trim() !== "") {
      params.search = debounceValue.trim();
    }

    return params;
  }, [debounceValue, page, rowsPerPage]);

  const {
    data: mdaApprovalsData,
    isLoading: queryLoading,
    isFetching,
    error,
  } = useGetMyMdaApprovalsQuery(queryParams, {
    refetchOnMountOrArgChange: true,
    skip: false,
  });

  const {
    data: mdaDetailData,
    isLoading: mdaDetailLoading,
    error: mdaDetailError,
  } = useGetMdaApprovalByIdQuery(detailsDialog.mdaId, {
    skip: !detailsDialog.mdaId || !detailsDialog.open,
  });

  const mdaApprovalsList = useMemo(
    () => mdaApprovalsData?.result?.data || [],
    [mdaApprovalsData]
  );

  const handleSearchChange = useCallback((newSearchQuery) => {
    setSearchQuery(newSearchQuery);
    setPage(1);
  }, []);

  const handleRowClick = useCallback((mda) => {
    setDetailsDialog({
      open: true,
      mdaId: mda.id,
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
      const { mdaId } = detailsDialog;
      try {
        const payload = {
          id: mdaId,
          comments,
          reason: "",
        };

        await approveMda(payload).unwrap();
        enqueueSnackbar("MDA approved successfully!", {
          variant: "success",
        });
        setDetailsDialog({ open: false, mdaId: null });
      } catch (error) {
        enqueueSnackbar(error?.data?.message || "Failed to approve MDA", {
          variant: "error",
        });
      }
    },
    [detailsDialog, approveMda, enqueueSnackbar]
  );

  const handleReject = useCallback(
    async ({ comments, reason }) => {
      const { mdaId } = detailsDialog;
      try {
        const payload = {
          id: mdaId,
          comments,
          reason,
        };

        await rejectMda(payload).unwrap();
        enqueueSnackbar("MDA rejected successfully!", {
          variant: "success",
        });
        setDetailsDialog({ open: false, mdaId: null });
      } catch (error) {
        enqueueSnackbar(error?.data?.message || "Failed to reject MDA", {
          variant: "error",
        });
      }
    },
    [detailsDialog, rejectMda, enqueueSnackbar]
  );

  const handleDetailsDialogClose = useCallback(() => {
    setDetailsDialog({ open: false, mdaId: null });
  }, []);

  const renderStatusChip = useCallback(
    (status) => {
      const statusLower = status?.toLowerCase() || "pending";
      return (
        <Chip
          label={status?.toUpperCase() || "PENDING"}
          size="small"
          sx={styles.statusChip(statusLower)}
        />
      );
    },
    [styles]
  );

  const isLoadingState = queryLoading || isFetching;

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
            <Typography className="header">
              {isVerySmall ? "MDA APPROVAL" : "MDA APPROVAL"}
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
                    {isVerySmall ? "REF NO" : "REF NUMBER"}
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
                    {isVerySmall ? "TYPE" : "MOVEMENT TYPE"}
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
                    DATE CREATED
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {isLoadingState ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                      <CircularProgress
                        size={32}
                        sx={{ color: "rgb(33, 61, 112)" }}
                      />
                    </TableCell>
                  </TableRow>
                ) : error ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                      <Typography
                        color="error"
                        sx={{ fontSize: isVerySmall ? "12px" : "14px" }}>
                        Error loading data: {error.message || "Unknown error"}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : mdaApprovalsList.length > 0 ? (
                  mdaApprovalsList.map((mda) => {
                    return (
                      <TableRow
                        key={mda.id}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleRowClick(mda);
                        }}
                        sx={{
                          cursor: "pointer",
                          "&:hover": {
                            backgroundColor: "#f8f9fa",
                          },
                        }}>
                        <TableCell align="left">{mda.id}</TableCell>
                        <TableCell
                          sx={{
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}>
                          {mda.reference_number || "-"}
                        </TableCell>
                        <TableCell
                          sx={{
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            fontWeight: 600,
                          }}>
                          {mda.employee_name || "-"}
                        </TableCell>
                        <TableCell
                          sx={{
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}>
                          {mda.movement_type || "-"}
                        </TableCell>
                        <TableCell
                          sx={{
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}>
                          {mda.requested_by || "-"}
                        </TableCell>
                        <TableCell
                          sx={{
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}>
                          {mda.created_at
                            ? dayjs(mda.created_at).format("MMM DD, YYYY")
                            : "-"}
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      align="center"
                      sx={{
                        py: 8,
                        color: "#666",
                        fontSize: isMobile ? "14px" : "16px",
                      }}>
                      <Box sx={styles.emptyStateBox}>
                        {CONSTANT.BUTTONS.NODATA.icon}
                        <Typography
                          variant="h6"
                          color="text.secondary"
                          sx={{ fontSize: isVerySmall ? "14px" : "16px" }}>
                          No MDA approvals found
                        </Typography>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ fontSize: isVerySmall ? "12px" : "14px" }}>
                          {searchQuery
                            ? `No results for "${searchQuery}"`
                            : "No pending MDAs"}
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
              count={mdaApprovalsData?.result?.total || 0}
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

        <MdaApprovalDialog
          open={detailsDialog.open}
          onClose={handleDetailsDialogClose}
          approval={mdaDetailData?.result}
          onApprove={handleApprove}
          onReject={handleReject}
          isLoading={approveLoading || rejectLoading || mdaDetailLoading}
        />
      </Box>
    </FormProvider>
  );
};

export default MdaApproval;
