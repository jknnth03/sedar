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
  Tabs,
  Tab,
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

const StyledTabs = styled(Tabs)(({ theme }) => ({
  backgroundColor: "#ffffff",
  borderRadius: "0",
  minHeight: 48,
  "& .MuiTabs-indicator": {
    backgroundColor: theme.palette.primary.main,
    height: 3,
  },
  "& .MuiTabs-flexContainer": {
    paddingLeft: 0,
    paddingRight: 0,
  },
}));

const StyledTab = styled(Tab)(({ theme }) => ({
  textTransform: "uppercase",
  fontWeight: 600,
  fontSize: "0.875rem",
  minHeight: 48,
  paddingTop: 12,
  paddingBottom: 12,
  paddingLeft: 20,
  paddingRight: 20,
  color: theme.palette.text.secondary,
  "&.Mui-selected": {
    color: theme.palette.primary.main,
  },
  "&:hover": {
    color: theme.palette.primary.main,
    backgroundColor: "rgba(33, 61, 112, 0.04)",
  },
  transition: theme.transitions.create(["color", "background-color"], {
    duration: theme.transitions.duration.standard,
  }),
}));

const TabPanel = ({ children, value, index, ...other }) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`submission-approval-tabpanel-${index}`}
      aria-labelledby={`submission-approval-tab-${index}`}
      style={{
        height: "100%",
        minWidth: 0,
        display: value === index ? "flex" : "none",
        flexDirection: "column",
      }}
      {...other}>
      {value === index && (
        <Box
          sx={{
            height: "100%",
            minWidth: 0,
            flex: 1,
            display: "flex",
            flexDirection: "column",
          }}>
          {children}
        </Box>
      )}
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
  styles,
}) => {
  const isVerySmall = useMediaQuery("(max-width:430px)");

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
          startAdornment: <SearchIcon sx={styles.searchIcon(isLoading)} />,
          endAdornment: isLoading && (
            <CircularProgress size={16} sx={styles.searchProgress} />
          ),
          sx: styles.searchInputProps(isLoading).sx,
        }}
        sx={styles.searchTextField(isLoading)}
      />
    </Box>
  );
};

const SubmissionApprovalTable = ({
  status,
  searchQuery,
  styles,
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
    <Box sx={styles.tableMainContainer}>
      <TableContainer sx={styles.tableContainer}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell sx={styles.headerCellReference}>
                {isVerySmall ? "REF #" : "REFERENCE NO."}
              </TableCell>
              <TableCell sx={styles.headerCellPosition}>POSITION</TableCell>
              <TableCell sx={styles.headerCellRequisition}>
                {isVerySmall ? "REQ TYPE" : "REQUISITION TYPE"}
              </TableCell>
              <TableCell sx={styles.headerCellRequested}>
                {isVerySmall ? "REQ BY" : "REQUESTED BY"}
              </TableCell>
              <TableCell sx={styles.headerCellDepartment}>
                {isVerySmall ? "DEPT" : "DEPARTMENT"}
              </TableCell>
              <TableCell sx={styles.headerCellDate}>
                {isVerySmall ? "DATE" : "DATE CREATED"}
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoadingState ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={styles.loadingCell}>
                  <CircularProgress size={32} sx={styles.loadingProgress} />
                </TableCell>
              </TableRow>
            ) : error ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={styles.errorCell}>
                  <Typography color="error" sx={styles.errorText}>
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
                    sx={styles.tableRow}>
                    <TableCell sx={styles.cellEllipsis}>
                      {submissionData.form_details?.reference_number || "-"}
                    </TableCell>
                    <TableCell sx={styles.cellPosition}>
                      {submissionData.form_details?.position?.title?.name ||
                        "Unknown Position"}
                    </TableCell>
                    <TableCell sx={styles.cellEllipsis}>
                      {submissionData.form_details?.requisition_type?.name ||
                        "-"}
                    </TableCell>
                    <TableCell sx={styles.cellEllipsis}>
                      {submissionData.requested_by?.full_name ||
                        submissionData.requested_by?.first_name ||
                        "Unknown"}
                    </TableCell>
                    <TableCell sx={styles.cellEllipsis}>
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
              <TableRow>
                <TableCell
                  colSpan={6}
                  align="center"
                  sx={styles.emptyStateContainer}>
                  <Box sx={styles.emptyStateBox}>
                    {CONSTANT.BUTTONS.NODATA.icon}
                    <Typography
                      variant="h6"
                      color="text.secondary"
                      sx={styles.emptyStateTitle}>
                      {status === "approved"
                        ? "No approved submissions found"
                        : "No submission approvals found"}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={styles.emptyStateSubtitle}>
                      {searchQuery
                        ? `No results for "${searchQuery}"`
                        : status === "approved"
                        ? "No approved submissions"
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
          sx={{
            "& .MuiTablePagination-toolbar": styles.paginationToolbar,
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

  const styles = useMemo(
    () =>
      createSubmissionApprovalStyles(theme, isMobile, isTablet, isVerySmall),
    [theme, isMobile, isTablet, isVerySmall]
  );

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
      label: "MRF For Approval",
      status: "pending",
      badgeCount: 0,
    },
    {
      label: "Approved MRF",
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
      <Box
        sx={{
          width: "100%",
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          backgroundColor: "#fafafa",
          minWidth: 0,
        }}>
        <Box
          sx={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            minWidth: 0,
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
              <Typography
                className="header"
                sx={{
                  fontSize: isVerySmall ? "18px" : isMobile ? "20px" : "24px",
                  fontWeight: 500,
                  color: "rgb(33, 61, 112)",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}>
                {isVerySmall ? "MRF APPROVAL" : "MRF Submission Approval"}
              </Typography>
            </Box>

            <CustomSearchBar
              searchQuery={searchQuery}
              setSearchQuery={handleSearchChange}
              isLoading={false}
              styles={styles}
            />
          </Box>

          <StyledTabs
            value={activeTab}
            onChange={handleTabChange}
            aria-label="MRF Submission Approval tabs"
            variant="scrollable"
            scrollButtons="auto"
            allowScrollButtonsMobile>
            {tabsData.map((tab, index) => (
              <StyledTab
                key={index}
                label={
                  tab.badgeCount > 0 ? (
                    <Badge
                      variant="dot"
                      color="error"
                      anchorOrigin={{
                        vertical: "top",
                        horizontal: "right",
                      }}
                      sx={{
                        "& .MuiBadge-badge": {
                          minWidth: "8px",
                          height: "8px",
                          borderRadius: "50%",
                          padding: 0,
                          top: "8px",
                          right: "-10px",
                        },
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

          <Box
            sx={{
              flex: 1,
              minWidth: 0,
              minHeight: 0,
              display: "flex",
              flexDirection: "column",
            }}>
            {tabsData.map((tab, index) => (
              <TabPanel key={index} value={activeTab} index={index}>
                <SubmissionApprovalTable
                  status={tab.status}
                  searchQuery={searchQuery}
                  styles={styles}
                  isMobile={isMobile}
                  isVerySmall={isVerySmall}
                  onRowClick={handleRowClick}
                />
              </TabPanel>
            ))}
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
