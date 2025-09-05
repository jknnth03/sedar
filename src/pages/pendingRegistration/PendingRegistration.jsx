import React, { useState, useMemo, useCallback, useEffect } from "react";
import {
  Box,
  Tabs,
  Tab,
  Paper,
  useTheme,
  Badge,
  Typography,
  Button,
  TextField,
  Checkbox,
  FormControlLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Fade,
  Tooltip,
  Chip,
  CircularProgress,
  FormGroup,
  TablePagination,
  Alert,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import SearchIcon from "@mui/icons-material/Search";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import AddIcon from "@mui/icons-material/Add";
import HelpIcon from "@mui/icons-material/Help";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import { FormProvider, useForm } from "react-hook-form";
import { useSnackbar } from "notistack";
import { styles } from "../../pages/forms/manpowerform/FormSubmissionStyles";
import { useGetPendingEmployeesQuery } from "../../features/api/employee/pendingApi";
import {
  useLazyGetSingleEmployeeQuery,
  useGetEmployeeRegistrationCountsQuery,
} from "../../features/api/employee/mainApi";
import PendingRegistrationForapproval from "./PendingRegistrationForapproval";
import PendingRegistrationAwaitingresubmission from "./PendingRegistrationAwaitingresubmission";
import PendingRegistrationRejected from "./PendingRegistrationRejected";
import PendingRegistrationCancelled from "./PendingRegistrationCancelled";
import PendingRegistrationModal from "../../components/modal/employee/pendingFormModal/PendingRegistrationModal";
import { format } from "date-fns";

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
      id={`pending-tabpanel-${index}`}
      aria-labelledby={`pending-tab-${index}`}
      style={{
        height: "100%",
        overflow: "hidden",
        minWidth: 0,
        display: value === index ? "flex" : "none",
        flexDirection: "column",
      }}
      {...other}>
      {value === index && (
        <Box
          sx={{
            height: "100%",
            overflow: "hidden",
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

const DateFilterDialog = ({
  open,
  onClose,
  dateFilters,
  onDateFiltersChange,
}) => {
  const [tempStartDate, setTempStartDate] = useState(dateFilters.startDate);
  const [tempEndDate, setTempEndDate] = useState(dateFilters.endDate);

  useEffect(() => {
    setTempStartDate(dateFilters.startDate);
    setTempEndDate(dateFilters.endDate);
  }, [dateFilters, open]);

  const handleApply = () => {
    onDateFiltersChange({
      startDate: tempStartDate,
      endDate: tempEndDate,
    });
    onClose();
  };

  const handleClear = () => {
    setTempStartDate(null);
    setTempEndDate(null);
  };

  const hasFilters = tempStartDate || tempEndDate;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: styles.filterDialog,
      }}>
      <DialogTitle>
        <Box sx={styles.filterDialogTitle}>
          <Box sx={styles.filterDialogTitleLeft}>
            <CalendarTodayIcon sx={styles.filterIcon} />
            <Typography variant="h6" sx={styles.filterDialogTitleText}>
              FILTER BY DATE
            </Typography>
          </Box>
          <Button
            size="small"
            variant="outlined"
            onClick={handleClear}
            disabled={!hasFilters}
            sx={styles.selectAllButton}>
            Clear All
          </Button>
        </Box>
      </DialogTitle>

      <DialogContent>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
            <DatePicker
              label="Start Date"
              value={tempStartDate}
              onChange={(newValue) => setTempStartDate(newValue)}
              renderInput={(params) => (
                <TextField {...params} fullWidth size="small" />
              )}
              maxDate={tempEndDate || new Date()}
            />
            <DatePicker
              label="End Date"
              value={tempEndDate}
              onChange={(newValue) => setTempEndDate(newValue)}
              renderInput={(params) => (
                <TextField {...params} fullWidth size="small" />
              )}
              minDate={tempStartDate}
              maxDate={new Date()}
            />
          </Box>
        </LocalizationProvider>
      </DialogContent>

      <DialogActions sx={styles.filterDialogActions}>
        <Box sx={styles.dialogActionsContainer}>
          <Box sx={styles.dialogButtonsContainer}>
            <Button
              onClick={onClose}
              variant="outlined"
              sx={styles.cancelButton}>
              CANCEL
            </Button>
            <Button
              onClick={handleApply}
              variant="contained"
              sx={styles.applyFiltersButton}>
              APPLY FILTERS
            </Button>
          </Box>
        </Box>
      </DialogActions>
    </Dialog>
  );
};

const CustomSearchBar = ({
  searchQuery,
  setSearchQuery,
  dateFilters,
  onFilterClick,
  isLoading = false,
}) => {
  const hasActiveFilters = dateFilters.startDate || dateFilters.endDate;

  const getFilterLabel = () => {
    if (dateFilters.startDate && dateFilters.endDate) {
      return `${format(dateFilters.startDate, "MMM dd")} - ${format(
        dateFilters.endDate,
        "MMM dd"
      )}`;
    }
    if (dateFilters.startDate) {
      return `From ${format(dateFilters.startDate, "MMM dd, yyyy")}`;
    }
    if (dateFilters.endDate) {
      return `Until ${format(dateFilters.endDate, "MMM dd, yyyy")}`;
    }
    return "FILTER";
  };

  return (
    <Box sx={styles.searchBarContainer}>
      <Tooltip title="Click here to filter by date range" arrow>
        <FormControlLabel
          control={
            <Checkbox
              checked={hasActiveFilters}
              onChange={onFilterClick}
              disabled={isLoading}
              icon={<CalendarTodayIcon />}
              checkedIcon={<CalendarTodayIcon />}
              size="small"
            />
          }
          label={
            <Box sx={styles.filterLabelBox}>
              <span>{getFilterLabel()}</span>
            </Box>
          }
          sx={styles.filterControlLabel(hasActiveFilters)}
        />
      </Tooltip>

      <TextField
        placeholder="Search employee..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        disabled={isLoading}
        size="small"
        InputProps={{
          startAdornment: <SearchIcon sx={styles.searchIcon(isLoading)} />,
          endAdornment: isLoading && (
            <CircularProgress size={16} sx={styles.searchProgress} />
          ),
          sx: styles.searchInputProps(isLoading),
        }}
        sx={styles.searchTextField}
      />
    </Box>
  );
};

const ErrorDisplay = ({ error, onRetry }) => {
  const getErrorMessage = () => {
    if (error?.status === 422) {
      return "Invalid request parameters. Please check the filters and try again.";
    }
    if (error?.status === 401) {
      return "Authentication required. Please log in again.";
    }
    if (error?.status === 403) {
      return "You don't have permission to access this resource.";
    }
    if (error?.status >= 500) {
      return "Server error. Please try again later.";
    }
    if (error?.message) {
      return error.message;
    }
    return "An unexpected error occurred. Please try again.";
  };

  return (
    <Box
      sx={{
        p: 4,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 2,
      }}>
      <ErrorOutlineIcon sx={{ fontSize: 64, color: "error.main" }} />
      <Typography variant="h6" color="error" align="center">
        Error Loading Data
      </Typography>
      <Typography variant="body2" color="text.secondary" align="center">
        {getErrorMessage()}
      </Typography>
      {error?.status && (
        <Typography variant="caption" color="text.disabled">
          Error Code: {error.status}
        </Typography>
      )}
      {onRetry && (
        <Button variant="outlined" onClick={onRetry}>
          Retry
        </Button>
      )}
    </Box>
  );
};

const PendingRegistration = () => {
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();
  const methods = useForm();

  const [activeTab, setActiveTab] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilters, setDateFilters] = useState({
    startDate: null,
    endDate: null,
  });
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("view");
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [selectedEmployeeForAction, setSelectedEmployeeForAction] =
    useState(null);
  const [pendingEmployeeData, setPendingEmployeeData] = useState(null);

  const [getSingleEmployee] = useLazyGetSingleEmployeeQuery();

  const { data: registrationCounts, isLoading: countsLoading } =
    useGetEmployeeRegistrationCountsQuery(undefined, {
      refetchOnMountOrArgChange: true,
      refetchOnFocus: true,
      refetchOnReconnect: true,
    });

  const debounceValue = useDebounce(searchQuery, 500);

  const formatDateForAPI = (date) => {
    return date ? format(date, "yyyy-MM-dd") : null;
  };

  const buildQueryParams = (additionalParams = {}) => {
    const baseParams = {
      pagination: true,
      page: 1,
      per_page: 10,
      ...additionalParams,
    };

    if (debounceValue) {
      baseParams.search = debounceValue;
    }

    if (dateFilters.startDate) {
      baseParams.date_from = formatDateForAPI(dateFilters.startDate);
    }
    if (dateFilters.endDate) {
      baseParams.date_to = formatDateForAPI(dateFilters.endDate);
    }

    return baseParams;
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    setApiError(null);
  };

  const handleSearchChange = useCallback((newSearchQuery) => {
    setSearchQuery(newSearchQuery);
    setApiError(null);
  }, []);

  const handleFilterClick = useCallback(() => {
    setFilterDialogOpen(true);
  }, []);

  const handleDateFiltersChange = useCallback((newDateFilters) => {
    setDateFilters(newDateFilters);
    setApiError(null);
  }, []);

  const handleCloseModal = useCallback(() => {
    setModalOpen(false);
    setSelectedEmployee(null);
    setModalMode("view");
    methods.reset();
    setPendingEmployeeData(null);
  }, [methods]);

  const handleModeChange = useCallback((newMode) => {
    setModalMode(newMode);
  }, []);

  const handleRowClick = useCallback(
    async (employee) => {
      setModalLoading(true);
      try {
        const submittableId = employee?.submittable?.id;

        if (!submittableId) {
          throw new Error("Submittable ID not found for this record");
        }

        const result = await getSingleEmployee(submittableId).unwrap();
        setSelectedEmployee(result?.result || employee);
        setModalMode("view");
        setModalOpen(true);
      } catch (error) {
        console.error("Failed to load employee details:", error);
        enqueueSnackbar("Failed to load employee details", {
          variant: "error",
          autoHideDuration: 3000,
        });
        setSelectedEmployee(employee);
        setModalMode("view");
        setModalOpen(true);
      } finally {
        setModalLoading(false);
      }
    },
    [getSingleEmployee, enqueueSnackbar]
  );

  const handleSave = useCallback(async (employeeData, mode) => {
    setPendingEmployeeData(employeeData);
    setConfirmOpen(true);
  }, []);

  const handleConfirmSave = useCallback(async () => {
    if (!pendingEmployeeData) return;

    setModalLoading(true);
    setConfirmOpen(false);

    try {
      enqueueSnackbar("Employee registration processed successfully!", {
        variant: "success",
        autoHideDuration: 2000,
      });

      handleCloseModal();
    } catch (error) {
      console.error("Save error:", error);
      let errorMessage =
        "Failed to process employee registration. Please try again.";

      if (error?.data?.message) {
        errorMessage = error.data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      }

      enqueueSnackbar(errorMessage, {
        variant: "error",
        autoHideDuration: 3000,
      });
    } finally {
      setModalLoading(false);
      setPendingEmployeeData(null);
    }
  }, [pendingEmployeeData, enqueueSnackbar, handleCloseModal]);

  const handleApiError = useCallback(
    (error) => {
      console.error("API Error:", error);
      setApiError(error);

      if (error?.status === 401) {
        enqueueSnackbar("Authentication required. Please log in again.", {
          variant: "error",
          autoHideDuration: 5000,
        });
      } else if (error?.status >= 500) {
        enqueueSnackbar("Server error. Please try again later.", {
          variant: "error",
          autoHideDuration: 5000,
        });
      }
    },
    [enqueueSnackbar]
  );

  const retryApiCall = useCallback(() => {
    setApiError(null);
    setActiveTab((prev) => prev);
  }, []);

  const getConfirmationMessage = useCallback(() => {
    if (!confirmAction)
      return "Are you sure you want to proceed with this action?";

    if (confirmAction === "approve") {
      return "Are you sure you want to approve this employee registration?";
    }
    if (confirmAction === "reject") {
      return "Are you sure you want to reject this employee registration?";
    }

    return "Are you sure you want to proceed with this action?";
  }, [confirmAction]);

  const getConfirmationTitle = useCallback(() => {
    if (!confirmAction) return "Confirmation";

    const titles = {
      approve: "Confirm Approval",
      reject: "Confirm Rejection",
    };

    return titles[confirmAction] || "Confirmation";
  }, [confirmAction]);

  const getConfirmButtonColor = useCallback(() => {
    if (!confirmAction) return "primary";

    const colors = {
      approve: "success",
      reject: "error",
    };

    return colors[confirmAction] || "primary";
  }, [confirmAction]);

  const getConfirmButtonText = useCallback(() => {
    if (!confirmAction) return "Confirm";

    const texts = {
      approve: "Approve",
      reject: "Reject",
    };

    return texts[confirmAction] || "Confirm";
  }, [confirmAction]);

  const getEmployeeDisplayName = useCallback(() => {
    return (
      selectedEmployeeForAction?.full_name ||
      selectedEmployeeForAction?.name ||
      "Employee"
    );
  }, [selectedEmployeeForAction]);

  const getEmployeeId = useCallback(() => {
    return selectedEmployeeForAction?.id || "Unknown";
  }, [selectedEmployeeForAction]);

  const tabsData = [
    {
      label: "For Approval",
      component: (
        <PendingRegistrationForapproval
          searchQuery={debounceValue}
          startDate={formatDateForAPI(dateFilters.startDate)}
          endDate={formatDateForAPI(dateFilters.endDate)}
          onError={handleApiError}
          queryParams={buildQueryParams({
            approval_status: "pending",
          })}
        />
      ),
      badgeCount: registrationCounts?.result?.pending || 0,
    },
    {
      label: "Awaiting Resubmission",
      component: (
        <PendingRegistrationAwaitingresubmission
          searchQuery={debounceValue}
          startDate={formatDateForAPI(dateFilters.startDate)}
          endDate={formatDateForAPI(dateFilters.endDate)}
          onError={handleApiError}
          queryParams={buildQueryParams({
            approval_status: "awaiting_resubmission",
          })}
        />
      ),
      badgeCount: registrationCounts?.result?.awaiting_resubmission || 0,
    },
    {
      label: "Rejected",
      component: (
        <PendingRegistrationRejected
          searchQuery={debounceValue}
          startDate={formatDateForAPI(dateFilters.startDate)}
          endDate={formatDateForAPI(dateFilters.endDate)}
          onError={handleApiError}
          queryParams={buildQueryParams({
            approval_status: "rejected",
          })}
        />
      ),
      badgeCount: registrationCounts?.result?.rejected || 0,
    },
    {
      label: "Cancelled",
      component: (
        <PendingRegistrationCancelled
          searchQuery={debounceValue}
          startDate={formatDateForAPI(dateFilters.startDate)}
          endDate={formatDateForAPI(dateFilters.endDate)}
          onError={handleApiError}
          queryParams={buildQueryParams({
            approval_status: "cancelled",
          })}
        />
      ),
      badgeCount: registrationCounts?.result?.cancelled || 0,
    },
  ];

  const a11yProps = (index) => {
    return {
      id: `pending-tab-${index}`,
      "aria-controls": `pending-tabpanel-${index}`,
    };
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <FormProvider {...methods}>
        <Box
          sx={{
            width: "100%",
            height: "100vh",
            display: "flex",
            flexDirection: "column",
            backgroundColor: "#fafafa",
            overflow: "hidden",
            minWidth: 0,
          }}>
          <Box
            sx={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              minWidth: 0,
            }}>
            <Paper
              elevation={0}
              sx={{
                borderRadius: "8px 8px 0 0",
                backgroundColor: "#ffffff",
              }}>
              <Box sx={styles.headerContainer}>
                <Box sx={styles.headerLeftSection}>
                  <Typography className="header">
                    PENDING REGISTRATIONS
                  </Typography>
                </Box>

                <CustomSearchBar
                  searchQuery={searchQuery}
                  setSearchQuery={handleSearchChange}
                  dateFilters={dateFilters}
                  onFilterClick={handleFilterClick}
                  isLoading={isLoading}
                />
              </Box>
            </Paper>

            <StyledTabs
              value={activeTab}
              onChange={handleTabChange}
              aria-label="Pending registration management tabs"
              variant="scrollable"
              scrollButtons="auto"
              allowScrollButtonsMobile>
              {tabsData.map((tab, index) => (
                <StyledTab
                  key={index}
                  label={
                    tab.badgeCount && tab.badgeCount > 0 ? (
                      <Badge
                        badgeContent={tab.badgeCount}
                        color="error"
                        sx={{
                          "& .MuiBadge-badge": {
                            fontSize: "0.55rem",
                            minWidth: 14,
                            height: 14,
                            borderRadius: "50%",
                            top: -2,
                            right: -6,
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
                overflow: "hidden",
                minWidth: 0,
                minHeight: 0,
                display: "flex",
                flexDirection: "column",
              }}>
              {apiError && (
                <Box sx={{ p: 2 }}>
                  <Alert
                    severity="error"
                    action={
                      <Button
                        color="inherit"
                        size="small"
                        onClick={retryApiCall}>
                        Retry
                      </Button>
                    }>
                    {apiError.status === 422
                      ? "Invalid request parameters. Please check your filters."
                      : "Failed to load data. Please try again."}
                  </Alert>
                </Box>
              )}

              {tabsData.map((tab, index) => (
                <TabPanel key={index} value={activeTab} index={index}>
                  {apiError ? (
                    <ErrorDisplay error={apiError} onRetry={retryApiCall} />
                  ) : (
                    tab.component
                  )}
                </TabPanel>
              ))}
            </Box>
          </Box>

          <DateFilterDialog
            open={filterDialogOpen}
            onClose={() => setFilterDialogOpen(false)}
            dateFilters={dateFilters}
            onDateFiltersChange={handleDateFiltersChange}
          />

          <Dialog
            open={confirmOpen}
            onClose={() => setConfirmOpen(false)}
            maxWidth="xs"
            fullWidth
            PaperProps={{
              sx: {
                borderRadius: 3,
                padding: 2,
                boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
                textAlign: "center",
              },
            }}>
            <DialogTitle sx={{ padding: 0, marginBottom: 2 }}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  marginBottom: 2,
                }}>
                <Box
                  sx={{
                    width: 60,
                    height: 60,
                    borderRadius: "50%",
                    backgroundColor: "#ff4400",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}>
                  <Typography
                    sx={{
                      color: "white",
                      fontSize: "30px",
                      fontWeight: "normal",
                    }}>
                    ?
                  </Typography>
                </Box>
              </Box>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 600,
                  color: "rgb(25, 45, 84)",
                  marginBottom: 0,
                }}>
                {getConfirmationTitle()}
              </Typography>
            </DialogTitle>
            <DialogContent sx={{ padding: 0, textAlign: "center" }}>
              <Typography
                variant="body1"
                sx={{
                  marginBottom: 2,
                  fontSize: "16px",
                  color: "#333",
                  fontWeight: 400,
                }}>
                {getConfirmationMessage()}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  fontSize: "14px",
                  color: "#666",
                  fontWeight: 500,
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}>
                {getEmployeeDisplayName()} - ID: {getEmployeeId()}
              </Typography>
            </DialogContent>
            <DialogActions
              sx={{
                justifyContent: "center",
                padding: 0,
                marginTop: 3,
                gap: 2,
              }}>
              <Button
                onClick={() => setConfirmOpen(false)}
                variant="outlined"
                sx={{
                  textTransform: "uppercase",
                  fontWeight: 600,
                  borderColor: "#f44336",
                  color: "#f44336",
                  paddingX: 3,
                  paddingY: 1,
                  borderRadius: 2,
                  "&:hover": {
                    borderColor: "#d32f2f",
                    backgroundColor: "rgba(244, 67, 54, 0.04)",
                  },
                }}
                disabled={modalLoading}>
                CANCEL
              </Button>
              <Button
                onClick={handleConfirmSave}
                variant="contained"
                sx={{
                  textTransform: "uppercase",
                  fontWeight: 600,
                  backgroundColor:
                    getConfirmButtonColor() === "success"
                      ? "#4caf50"
                      : "#f44336",
                  paddingX: 3,
                  paddingY: 1,
                  borderRadius: 2,
                  "&:hover": {
                    backgroundColor:
                      getConfirmButtonColor() === "success"
                        ? "#388e3c"
                        : "#d32f2f",
                  },
                }}
                disabled={modalLoading}>
                {modalLoading ? (
                  <CircularProgress size={20} color="inherit" />
                ) : (
                  getConfirmButtonText()
                )}
              </Button>
            </DialogActions>
          </Dialog>

          <PendingRegistrationModal
            open={modalOpen}
            onClose={handleCloseModal}
            onSave={handleSave}
            selectedEmployee={selectedEmployee}
            isLoading={modalLoading}
            mode={modalMode}
            onModeChange={handleModeChange}
          />
        </Box>
      </FormProvider>
    </LocalizationProvider>
  );
};

export default PendingRegistration;
