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
              {isVerySmall ? "REG APPROVAL" : "PENDING REGISTRATION APPROVAL"}
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
                        ...styles.nameCell,
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
                      FULL NAME
                    </TableCell>
                    <TableCell
                      sx={{
                        ...styles.idNumberCell,
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
                      {isVerySmall ? "ID #" : "ID NUMBER"}
                    </TableCell>
                    <TableCell
                      sx={{
                        ...styles.departmentCell,
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
                        ...styles.requestByCell,
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
                  </TableRow>
                </TableHead>
                <TableBody>
                  {isLoadingState ? (
                    <TableRow>
                      <TableCell
                        colSpan={5}
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
                        colSpan={5}
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
                  ) : registrationApprovalsList.length > 0 ? (
                    registrationApprovalsList.map((registration) => {
                      const formDetails =
                        registration?.submission?.form_details;
                      const generalInfo = formDetails?.general_info;
                      const charging = registration?.submission?.charging;
                      const requestedBy =
                        registration?.submission?.requested_by;

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
                            {registration.id}
                          </TableCell>
                          <TableCell
                            sx={{
                              ...styles.nameCell,
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
                            {generalInfo?.full_name ||
                              formDetails?.employee_name ||
                              "-"}
                          </TableCell>
                          <TableCell
                            sx={{
                              ...styles.idNumberCell,
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
                            {generalInfo?.employee_code || "-"}
                          </TableCell>
                          <TableCell
                            sx={{
                              ...styles.departmentCell,
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
                            {charging?.department_name || "-"}
                          </TableCell>
                          <TableCell
                            sx={{
                              ...styles.requestByCell,
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
                          ...styles.emptyStateContainer,
                          padding: isMobile ? "20px" : "40px",
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
                ...styles.paginationContainer,
                padding: isMobile ? "8px" : "16px",
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
