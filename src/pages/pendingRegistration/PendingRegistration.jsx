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
  useMediaQuery,
  IconButton,
} from "@mui/material";
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
import {
  pendingRegistrationStyles,
  StyledTabs,
  StyledTab,
} from "./PendingRegistrationStyles";
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
        <Box sx={pendingRegistrationStyles.tabPanel}>{children}</Box>
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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
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
      fullWidth={!isMobile}
      fullScreen={isMobile}
      PaperProps={{
        sx: {
          ...pendingRegistrationStyles.filterDialog,
          ...(isMobile && pendingRegistrationStyles.filterDialogMobile),
        },
      }}>
      <DialogTitle>
        <Box sx={pendingRegistrationStyles.filterDialogTitle}>
          <Box sx={pendingRegistrationStyles.filterDialogTitleLeft}>
            <CalendarTodayIcon sx={pendingRegistrationStyles.filterIcon} />
            <Typography
              variant="h6"
              sx={{
                ...pendingRegistrationStyles.filterDialogTitleText,
                ...(isMobile &&
                  pendingRegistrationStyles.filterDialogTitleTextMobile),
              }}>
              FILTER BY DATE
            </Typography>
          </Box>
          <Button
            size="small"
            variant="outlined"
            onClick={handleClear}
            disabled={!hasFilters}
            sx={pendingRegistrationStyles.selectAllButton}>
            Clear All
          </Button>
        </Box>
      </DialogTitle>

      <DialogContent
        sx={pendingRegistrationStyles.filterDialogContent(isMobile)}>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <Box sx={pendingRegistrationStyles.datePickerContainer(isMobile)}>
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

      <DialogActions
        sx={pendingRegistrationStyles.filterDialogActions(isMobile)}>
        <Box sx={pendingRegistrationStyles.dialogActionsContainer}>
          <Box sx={pendingRegistrationStyles.dialogButtonsContainer(isMobile)}>
            <Button
              onClick={onClose}
              variant="outlined"
              sx={pendingRegistrationStyles.cancelButton(isMobile)}>
              CANCEL
            </Button>
            <Button
              onClick={handleApply}
              variant="contained"
              sx={pendingRegistrationStyles.applyFiltersButton(isMobile)}>
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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.between(600, 1038));
  const isVerySmall = useMediaQuery("(max-width:369px)");
  const isSmallerThan450 = useMediaQuery("(max-width:450px)");
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
    return isVerySmall ? "DATE" : "FILTER";
  };

  return (
    <Box
      sx={{
        ...pendingRegistrationStyles.searchBarContainer,
        ...(isMobile && pendingRegistrationStyles.searchBarContainerMobile),
        ...(isTablet && pendingRegistrationStyles.searchBarContainerTablet),
        ...(isVerySmall &&
          pendingRegistrationStyles.searchBarContainerVerySmall),
      }}>
      <Tooltip title="Click here to filter by date range" arrow>
        {isSmallerThan450 ? (
          <IconButton
            onClick={onFilterClick}
            disabled={isLoading}
            size="small"
            sx={pendingRegistrationStyles.filterIconButton(hasActiveFilters)}>
            <CalendarTodayIcon
              sx={pendingRegistrationStyles.filterIconButtonIcon}
            />
          </IconButton>
        ) : (
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
              <Box sx={pendingRegistrationStyles.filterLabelBox}>
                <span>{getFilterLabel()}</span>
              </Box>
            }
            sx={pendingRegistrationStyles.filterControlLabel(hasActiveFilters)}
          />
        )}
      </Tooltip>

      <TextField
        placeholder={isVerySmall ? "Search..." : "Search employee..."}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        disabled={isLoading}
        size="small"
        InputProps={{
          startAdornment: (
            <SearchIcon
              sx={pendingRegistrationStyles.searchIcon(isLoading, isVerySmall)}
            />
          ),
          endAdornment: isLoading && (
            <CircularProgress
              size={16}
              sx={pendingRegistrationStyles.searchProgress}
            />
          ),
          sx: pendingRegistrationStyles.searchInputProps(
            isLoading,
            isVerySmall,
            isMobile
          ),
        }}
        sx={{
          ...pendingRegistrationStyles.searchTextField,
          ...(isVerySmall &&
            pendingRegistrationStyles.searchTextFieldVerySmall),
        }}
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
    <Box sx={pendingRegistrationStyles.errorContainer}>
      <ErrorOutlineIcon sx={pendingRegistrationStyles.errorIcon} />
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
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.between(600, 1038));
  const isVerySmall = useMediaQuery("(max-width:369px)");
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
        <Box sx={pendingRegistrationStyles.mainContainer}>
          <Box
            sx={{
              ...pendingRegistrationStyles.headerContainer,
              ...(isMobile && pendingRegistrationStyles.headerContainerMobile),
              ...(isTablet && pendingRegistrationStyles.headerContainerTablet),
            }}>
            <Box
              sx={{
                ...pendingRegistrationStyles.headerTitle,
                ...(isMobile && pendingRegistrationStyles.headerTitleMobile),
              }}>
              <Typography
                className="header"
                sx={{
                  ...pendingRegistrationStyles.headerTitleText,
                  ...(isMobile &&
                    pendingRegistrationStyles.headerTitleTextMobile),
                  ...(isVerySmall &&
                    pendingRegistrationStyles.headerTitleTextVerySmall),
                }}>
                {isVerySmall ? "PENDING REGS" : "PENDING REGISTRATIONS"}
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

          <Box sx={pendingRegistrationStyles.tabsSection}>
            <StyledTabs
              value={activeTab}
              onChange={handleTabChange}
              aria-label="Pending registration management tabs"
              variant="scrollable"
              scrollButtons="auto"
              allowScrollButtonsMobile
              sx={{
                ...pendingRegistrationStyles.tabsStyled,
                ...(isVerySmall &&
                  pendingRegistrationStyles.tabsStyledVerySmall),
              }}>
              {tabsData.map((tab, index) => (
                <StyledTab
                  key={index}
                  label={
                    tab.badgeCount && tab.badgeCount > 0 ? (
                      <Badge
                        badgeContent={tab.badgeCount}
                        color="error"
                        sx={{
                          ...pendingRegistrationStyles.tabBadge,
                          ...(isVerySmall &&
                            pendingRegistrationStyles.tabBadgeVerySmall),
                        }}>
                        {isVerySmall && tab.label.length > 12
                          ? tab.label
                              .replace("Awaiting ", "")
                              .replace("Resubmission", "Resub")
                          : tab.label}
                      </Badge>
                    ) : isVerySmall && tab.label.length > 12 ? (
                      tab.label
                        .replace("Awaiting ", "")
                        .replace("Resubmission", "Resub")
                    ) : (
                      tab.label
                    )
                  }
                  {...a11yProps(index)}
                />
              ))}
            </StyledTabs>

            <Box sx={pendingRegistrationStyles.tabsContainer}>
              {apiError && (
                <Box sx={pendingRegistrationStyles.alertContainer}>
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
              sx: pendingRegistrationStyles.confirmDialog,
            }}>
            <DialogTitle sx={pendingRegistrationStyles.confirmTitle}>
              <Box sx={pendingRegistrationStyles.confirmIconContainer}>
                <Box sx={pendingRegistrationStyles.confirmIcon}>
                  <Typography sx={pendingRegistrationStyles.confirmIconText}>
                    ?
                  </Typography>
                </Box>
              </Box>
              <Typography
                variant="h5"
                sx={pendingRegistrationStyles.confirmTitle}>
                {getConfirmationTitle()}
              </Typography>
            </DialogTitle>
            <DialogContent sx={pendingRegistrationStyles.confirmContent}>
              <Typography
                variant="body1"
                sx={pendingRegistrationStyles.confirmMessage}>
                {getConfirmationMessage()}
              </Typography>
              <Typography
                variant="body2"
                sx={pendingRegistrationStyles.confirmEmployeeInfo}>
                {getEmployeeDisplayName()} - ID: {getEmployeeId()}
              </Typography>
            </DialogContent>
            <DialogActions sx={pendingRegistrationStyles.confirmActions}>
              <Button
                onClick={() => setConfirmOpen(false)}
                variant="outlined"
                sx={pendingRegistrationStyles.confirmCancelButton}
                disabled={modalLoading}>
                CANCEL
              </Button>
              <Button
                onClick={handleConfirmSave}
                variant="contained"
                sx={pendingRegistrationStyles.confirmActionButton(
                  getConfirmButtonColor()
                )}
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
