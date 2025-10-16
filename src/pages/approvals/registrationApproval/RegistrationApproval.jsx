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
  const theme = useTheme();
  const isVerySmall = useMediaQuery("(max-width:369px)");

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
      <TextField
        placeholder={
          isVerySmall ? "Search..." : "Search Registration Approvals..."
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

const RegistrationApproval = () => {
  const theme = useTheme();
  const styles = createRegistrationApprovalStyles(theme);
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
              {isVerySmall ? "REG APPROVAL" : "REGISTRATION APPROVAL"}
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
                    FULL NAME
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
                    {isVerySmall ? "ID #" : "ID NUMBER"}
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
                </TableRow>
              </TableHead>
              <TableBody>
                {isLoadingState ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                      <CircularProgress
                        size={32}
                        sx={{ color: "rgb(33, 61, 112)" }}
                      />
                    </TableCell>
                  </TableRow>
                ) : error ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                      <Typography
                        color="error"
                        sx={{ fontSize: isVerySmall ? "12px" : "14px" }}>
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
                          cursor: "pointer",
                          "&:hover": {
                            backgroundColor: "#f8f9fa",
                          },
                        }}>
                        <TableCell align="left">{registration.id}</TableCell>
                        <TableCell
                          sx={{
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            fontWeight: 600,
                          }}>
                          {generalInfo?.full_name ||
                            formDetails?.employee_name ||
                            "-"}
                        </TableCell>
                        <TableCell
                          sx={{
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}>
                          {generalInfo?.employee_code || "-"}
                        </TableCell>
                        <TableCell
                          sx={{
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}>
                          {charging?.department_name || "-"}
                        </TableCell>
                        <TableCell
                          sx={{
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}>
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
                          No registration approvals found
                        </Typography>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ fontSize: isVerySmall ? "12px" : "14px" }}>
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
              count={registrationApprovalsData?.result?.total || 0}
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
