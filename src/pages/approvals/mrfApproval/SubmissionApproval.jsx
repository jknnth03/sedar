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
  Checkbox,
  FormControlLabel,
  IconButton,
  Badge,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import SearchIcon from "@mui/icons-material/Search";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { FormProvider, useForm } from "react-hook-form";
import { useSnackbar } from "notistack";
import "../../../pages/GeneralStyle.scss";
import {
  useGetMySubmissionApprovalsQuery,
  useApproveSubmissionMutation,
  useRejectSubmissionMutation,
} from "../../../features/api/approvalsetting/submissionApprovalApi.js";
import { CONSTANT } from "../../../config/index.jsx";
import dayjs from "dayjs";
import { createSubmissionApprovalStyles } from "./SubmissionApprovalStyles.jsx";
import SubmissionDetailsDialog from "./SubmissionDetailsDialog.jsx";
import NoDataFound from "../../NoDataFound";
import {
  styles,
  StyledTabs,
  StyledTab,
} from "../../forms/manpowerform/FormSubmissionStyles";

const TabPanel = ({ children, value, index, ...other }) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`submission-approval-tabpanel-${index}`}
      aria-labelledby={`submission-approval-tab-${index}`}
      style={{
        height: "100%",
        overflow: "hidden",
        minWidth: 0,
        display: value === index ? "flex" : "none",
        flexDirection: "column",
      }}
      {...other}>
      {value === index && <Box sx={styles.tabPanel}>{children}</Box>}
    </div>
  );
};

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
}) => {
  const isVerySmall = useMediaQuery("(max-width:369px)");

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: isVerySmall ? 1 : 1.5,
      }}>
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
            width: isVerySmall ? "100%" : "320px",
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

const SubmissionApprovalTable = ({
  status,
  searchQuery,
  isMobile,
  isVerySmall,
  onRowClick,
}) => {
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const debounceValue = useDebounce(searchQuery, 500);

  const queryParams = useMemo(() => {
    const params = {
      page,
      per_page: rowsPerPage,
      status: status,
      pagination: true,
    };

    if (debounceValue && debounceValue.trim() !== "") {
      params.search = debounceValue.trim();
    }

    return params;
  }, [debounceValue, page, rowsPerPage, status]);

  const {
    data: submissionApprovalsData,
    isLoading: queryLoading,
    isFetching,
    error,
  } = useGetMySubmissionApprovalsQuery(queryParams, {
    refetchOnMountOrArgChange: true,
    skip: false,
  });

  const submissionApprovalsList = useMemo(
    () => submissionApprovalsData?.result?.data || [],
    [submissionApprovalsData]
  );

  const handlePageChange = useCallback((event, newPage) => {
    setPage(newPage + 1);
  }, []);

  const handleRowsPerPageChange = useCallback((event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(1);
  }, []);

  const isLoadingState = queryLoading || isFetching;

  return (
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
            backgroundColor: "white",
            fontWeight: 700,
            fontSize: isVerySmall ? "14px" : isMobile ? "16px" : "18px",
            color: "rgb(33, 61, 112)",
            textTransform: "uppercase",
            letterSpacing: "0.5px",
            borderBottom: "none",
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
            height: submissionApprovalsList.length === 0 ? "100%" : "auto",
          }}>
          <TableHead>
            <TableRow>
              <TableCell
                sx={{
                  width: isVerySmall ? "120px" : isMobile ? "150px" : "180px",
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
                  width: isVerySmall ? "180px" : isMobile ? "220px" : "280px",
                  minWidth: isVerySmall
                    ? "180px"
                    : isMobile
                    ? "220px"
                    : "280px",
                }}>
                POSITION
              </TableCell>
              <TableCell
                sx={{
                  width: isVerySmall ? "150px" : isMobile ? "180px" : "220px",
                  minWidth: isVerySmall
                    ? "150px"
                    : isMobile
                    ? "180px"
                    : "220px",
                }}>
                {isVerySmall ? "REQ TYPE" : "REQUISITION TYPE"}
              </TableCell>
              <TableCell
                sx={{
                  width: isVerySmall ? "150px" : isMobile ? "180px" : "220px",
                  minWidth: isVerySmall
                    ? "150px"
                    : isMobile
                    ? "180px"
                    : "220px",
                }}>
                {isVerySmall ? "REQ BY" : "REQUESTED BY"}
              </TableCell>
              <TableCell
                sx={{
                  width: isVerySmall ? "120px" : isMobile ? "150px" : "180px",
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
                  width: isVerySmall ? "120px" : isMobile ? "140px" : "170px",
                  minWidth: isVerySmall
                    ? "120px"
                    : isMobile
                    ? "140px"
                    : "170px",
                }}>
                {isVerySmall ? "DATE" : "DATE CREATED"}
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody
            sx={{
              height: submissionApprovalsList.length === 0 ? "100%" : "auto",
            }}>
            {isLoadingState ? (
              <TableRow sx={{ height: "100%" }}>
                <TableCell
                  colSpan={6}
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
                  colSpan={6}
                  align="center"
                  sx={{ py: 4, height: "100%", verticalAlign: "middle" }}>
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
                    onClick={() => onRowClick(submission)}
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
                      {submissionData.form_details?.reference_number || "-"}
                    </TableCell>
                    <TableCell
                      sx={{
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
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
                      {submissionData.form_details?.requisition_type?.name ||
                        "-"}
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
              <TableRow
                sx={{
                  height: "100%",
                  pointerEvents: "none",
                  "&:hover": {
                    backgroundColor: "transparent !important",
                    cursor: "default !important",
                  },
                }}>
                <TableCell
                  colSpan={999}
                  rowSpan={999}
                  align="center"
                  sx={{
                    height: "100%",
                    verticalAlign: "middle",
                    border: "none",
                    borderBottom: "none",
                    padding: 0,
                    pointerEvents: "none",
                    "&:hover": {
                      backgroundColor: "transparent !important",
                      cursor: "default !important",
                    },
                  }}>
                  <Box
                    sx={{
                      position: "fixed",
                      left: "56%",
                      top: "60%",
                      transform: "translate(-50%, -50%)",
                      zIndex: 1,
                    }}>
                    <NoDataFound message="" subMessage="" />
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
              paddingLeft: isMobile ? "16px" : "24px",
              paddingRight: isMobile ? "16px" : "24px",
              minHeight: isMobile ? "48px" : "52px",
            },
          }}
        />
      </Box>
    </Box>
  );
};

const SubmissionApproval = () => {
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.between(600, 1038));
  const isVerySmall = useMediaQuery("(max-width:369px)");

  const [activeTab, setActiveTab] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [detailsDialog, setDetailsDialog] = useState({
    open: false,
    submission: null,
  });

  const methods = useForm({
    defaultValues: {
      status: "active",
    },
  });

  const [approveSubmission, { isLoading: approveLoading }] =
    useApproveSubmissionMutation();
  const [rejectSubmission, { isLoading: rejectLoading }] =
    useRejectSubmissionMutation();

  const handleTabChange = useCallback((event, newValue) => {
    setActiveTab(newValue);
    setSearchQuery("");
  }, []);

  const handleSearchChange = useCallback((newSearchQuery) => {
    setSearchQuery(newSearchQuery);
  }, []);

  const handleRowClick = useCallback((submission) => {
    setDetailsDialog({
      open: true,
      submission,
    });
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
      } catch (error) {
        enqueueSnackbar(
          error?.data?.message || "Failed to approve submission",
          {
            variant: "error",
          }
        );
      }
    },
    [detailsDialog, approveSubmission, enqueueSnackbar]
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
      } catch (error) {
        enqueueSnackbar(error?.data?.message || "Failed to return submission", {
          variant: "error",
        });
      }
    },
    [detailsDialog, rejectSubmission, enqueueSnackbar]
  );

  const handleDetailsDialogClose = useCallback(() => {
    setDetailsDialog({ open: false, submission: null });
  }, []);

  const tabsData = [
    {
      label: "FOR APPROVAL",
      status: "pending",
      badgeCount: 0,
    },
    {
      label: "APPROVED",
      status: "approved",
      badgeCount: 0,
    },
  ];

  const a11yProps = (index) => {
    return {
      id: `submission-approval-tab-${index}`,
      "aria-controls": `submission-approval-tabpanel-${index}`,
    };
  };

  return (
    <FormProvider {...methods}>
      <Box sx={styles.mainContainer}>
        <Box
          sx={{
            ...styles.headerContainer,
            ...(isMobile && styles.headerContainerMobile),
            ...(isTablet && styles.headerContainerTablet),
          }}>
          <Box
            sx={{
              ...styles.headerTitle,
              ...(isMobile && styles.headerTitleMobile),
            }}>
            <Typography
              className="header"
              sx={{
                ...styles.headerTitleText,
                ...(isMobile && styles.headerTitleTextMobile),
                ...(isVerySmall && styles.headerTitleTextVerySmall),
                paddingRight: "14px",
              }}>
              {isVerySmall ? "MRF APPROVAL" : "MRF SUBMISSION APPROVAL"}
            </Typography>
          </Box>

          <CustomSearchBar
            searchQuery={searchQuery}
            setSearchQuery={handleSearchChange}
            isLoading={false}
          />
        </Box>

        <Box sx={styles.tabsSection}>
          <StyledTabs
            value={activeTab}
            onChange={handleTabChange}
            aria-label="MRF Submission Approval tabs"
            variant="scrollable"
            scrollButtons="auto"
            allowScrollButtonsMobile
            sx={{
              ...styles.tabsStyled,
              ...(isVerySmall && styles.tabsStyledVerySmall),
            }}>
            {tabsData.map((tab, index) => (
              <StyledTab
                key={index}
                label={
                  tab.badgeCount > 0 ? (
                    <Badge
                      badgeContent={tab.badgeCount}
                      color="error"
                      sx={{
                        ...styles.tabBadge,
                        ...(isVerySmall && styles.tabBadgeVerySmall),
                      }}>
                      {tab.label}
                    </Badge>
                  ) : (
                    tab.label
                  )
                }
                {...a11yProps(index)}
              />
            ))}
          </StyledTabs>
        </Box>

        <Box sx={styles.tabsContainer}>
          {tabsData.map((tab, index) => (
            <TabPanel key={index} value={activeTab} index={index}>
              <SubmissionApprovalTable
                status={tab.status}
                searchQuery={searchQuery}
                isMobile={isMobile}
                isVerySmall={isVerySmall}
                onRowClick={handleRowClick}
              />
            </TabPanel>
          ))}
        </Box>

        <SubmissionDetailsDialog
          open={detailsDialog.open}
          onClose={handleDetailsDialogClose}
          submission={detailsDialog.submission}
          onApprove={handleApprove}
          onReject={handleReject}
          isLoading={approveLoading || rejectLoading}
        />
      </Box>
    </FormProvider>
  );
};

export default SubmissionApproval;
