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
  useGetMyDataChangeApprovalsQuery,
  useGetDataChangeApprovalByIdQuery,
  useApproveDataChangeMutation,
  useRejectDataChangeMutation,
} from "../../../features/api/approving/dataChangeApproval.js";
import { CONSTANT } from "../../../config";
import dayjs from "dayjs";
import { createSubmissionApprovalStyles } from "../mrfApproval/SubmissionApprovalStyles.jsx";
import DataChangeApprovalDialog from "./DataChangeApprovalDialog.jsx";

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
      id={`data-change-approval-tabpanel-${index}`}
      aria-labelledby={`data-change-approval-tab-${index}`}
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
          isVerySmall ? "Search..." : "Search Data Change Approvals..."
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

const DataChangeApprovalTable = ({
  approvalStatus,
  searchQuery,
  styles,
  isMobile,
  isVerySmall,
  onRowClick,
  renderStatusChip,
}) => {
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const debounceValue = useDebounce(searchQuery, 500);

  const queryParams = useMemo(() => {
    const params = {
      page,
      per_page: rowsPerPage,
      status: "active",
      approval_status: approvalStatus,
      pagination: true,
    };

    if (debounceValue && debounceValue.trim() !== "") {
      params.search = debounceValue.trim();
    }

    return params;
  }, [debounceValue, page, rowsPerPage, approvalStatus]);

  const {
    data: dataChangeApprovalsData,
    isLoading: queryLoading,
    isFetching,
    error,
  } = useGetMyDataChangeApprovalsQuery(queryParams, {
    refetchOnMountOrArgChange: true,
    skip: false,
  });

  const dataChangeApprovalsList = useMemo(
    () => dataChangeApprovalsData?.result?.data || [],
    [dataChangeApprovalsData]
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
              <TableCell align="center" sx={styles.headerCellStatus}>
                STATUS
              </TableCell>
              <TableCell sx={styles.headerCellReference}>
                {isVerySmall ? "REF #" : "REFERENCE NO."}
              </TableCell>
              <TableCell sx={styles.headerCellPosition}>
                EMPLOYEE NAME
              </TableCell>
              <TableCell sx={styles.headerCellRequisition}>
                {isVerySmall ? "MOVEMENT" : "MOVEMENT TYPE"}
              </TableCell>
              <TableCell sx={styles.headerCellRequested}>
                {isVerySmall ? "REQ BY" : "REQUESTED BY"}
              </TableCell>
              <TableCell sx={styles.headerCellDate}>
                {isVerySmall ? "DATE" : "DATE REQUESTED"}
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
            ) : dataChangeApprovalsList.length > 0 ? (
              dataChangeApprovalsList.map((approval) => {
                return (
                  <TableRow
                    key={approval.id}
                    onClick={() => onRowClick(approval)}
                    sx={styles.tableRow}>
                    <TableCell align="center">
                      {renderStatusChip(approvalStatus)}
                    </TableCell>
                    <TableCell sx={styles.cellEllipsis}>
                      {approval.reference_number || "-"}
                    </TableCell>
                    <TableCell sx={styles.cellPosition}>
                      {approval.employee_name || "-"}
                    </TableCell>
                    <TableCell sx={styles.cellEllipsis}>
                      {approval.movement_type || "-"}
                    </TableCell>
                    <TableCell sx={styles.cellEllipsis}>
                      {approval.requested_by || "-"}
                    </TableCell>
                    <TableCell>
                      {approval.created_at
                        ? dayjs(approval.created_at).format(
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
                      {approvalStatus === "approved"
                        ? "No approved data changes found"
                        : "No data change approvals found"}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={styles.emptyStateSubtitle}>
                      {searchQuery
                        ? `No results for "${searchQuery}"`
                        : approvalStatus === "approved"
                        ? "No approved data changes"
                        : "No active data changes"}
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
          count={dataChangeApprovalsData?.result?.total || 0}
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

const DataChangeApproval = () => {
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

  const [approveDataChange, { isLoading: approveLoading }] =
    useApproveDataChangeMutation();
  const [rejectDataChange, { isLoading: rejectLoading }] =
    useRejectDataChangeMutation();

  const { data: selectedApprovalData, isLoading: selectedApprovalLoading } =
    useGetDataChangeApprovalByIdQuery(selectedApprovalId, {
      skip: !selectedApprovalId,
    });

  const handleTabChange = useCallback((event, newValue) => {
    setActiveTab(newValue);
    setSearchQuery("");
  }, []);

  const handleSearchChange = useCallback((newSearchQuery) => {
    setSearchQuery(newSearchQuery);
  }, []);

  const handleRowClick = useCallback((approval) => {
    setSelectedApprovalId(approval.id);
    setDetailsDialog({
      open: true,
      submission: approval,
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

        await approveDataChange(payload).unwrap();
        enqueueSnackbar("Data change approved successfully!", {
          variant: "success",
        });
        setDetailsDialog({ open: false, submission: null });
        setSelectedApprovalId(null);
      } catch (error) {
        enqueueSnackbar(
          error?.data?.message || "Failed to approve data change",
          {
            variant: "error",
          }
        );
      }
    },
    [detailsDialog, approveDataChange, enqueueSnackbar]
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

        await rejectDataChange(payload).unwrap();
        enqueueSnackbar("Data change returned successfully!", {
          variant: "success",
        });
        setDetailsDialog({ open: false, submission: null });
        setSelectedApprovalId(null);
      } catch (error) {
        enqueueSnackbar(
          error?.data?.message || "Failed to return data change",
          {
            variant: "error",
          }
        );
      }
    },
    [detailsDialog, rejectDataChange, enqueueSnackbar]
  );

  const handleDetailsDialogClose = useCallback(() => {
    setDetailsDialog({ open: false, submission: null });
    setSelectedApprovalId(null);
  }, []);

  const renderStatusChip = useCallback(
    (approvalStatus) => {
      const status = approvalStatus === "approved" ? "approved" : "pending";
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

  const tabsData = [
    {
      label: "For Approval",
      approvalStatus: "pending",
      badgeCount: 0,
    },
    {
      label: "Approved",
      approvalStatus: "approved",
      badgeCount: 0,
    },
  ];

  const a11yProps = (index) => {
    return {
      id: `data-change-approval-tab-${index}`,
      "aria-controls": `data-change-approval-tabpanel-${index}`,
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
                {isVerySmall ? "DATA CHANGE" : "Data Change Approval"}
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
            aria-label="Data Change Approval tabs"
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
                <DataChangeApprovalTable
                  approvalStatus={tab.approvalStatus}
                  searchQuery={searchQuery}
                  styles={styles}
                  isMobile={isMobile}
                  isVerySmall={isVerySmall}
                  onRowClick={handleRowClick}
                  renderStatusChip={renderStatusChip}
                />
              </TabPanel>
            ))}
          </Box>
        </Box>

        <DataChangeApprovalDialog
          open={detailsDialog.open}
          onClose={handleDetailsDialogClose}
          approval={selectedApprovalData?.result || detailsDialog.submission}
          onApprove={handleApprove}
          onReject={handleReject}
          isLoading={approveLoading || rejectLoading}
          isLoadingData={selectedApprovalLoading}
          styles={styles}
        />
      </Box>
    </FormProvider>
  );
};

export default DataChangeApproval;
