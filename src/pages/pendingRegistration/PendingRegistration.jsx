import React, { useState, useMemo, useCallback, useEffect } from "react";
import { useDispatch } from "react-redux";
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
  Tooltip,
  CircularProgress,
  Alert,
  useMediaQuery,
  IconButton,
  Fade,
} from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import SearchIcon from "@mui/icons-material/Search";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import AddIcon from "@mui/icons-material/Add";
import { FormProvider, useForm } from "react-hook-form";
import { useSnackbar } from "notistack";
import {
  pendingRegistrationStyles,
  StyledTabs,
  StyledTab,
} from "./PendingRegistrationStyles";
import {
  useLazyGetSingleEmployeeQuery,
  useGetEmployeeRegistrationCountsQuery,
} from "../../features/api/employee/mainApi";
import pendingApi from "../../features/api/employee/pendingApi";
import mainApi from "../../features/api/employee/mainApi";
import moduleApi from "../../features/api/usermanagement/dashboardApi";
import PendingRegistrationForapproval from "./PendingRegistrationForapproval";
import PendingRegistrationAwaitingresubmission from "./PendingRegistrationAwaitingresubmission";
import PendingRegistrationRejected from "./PendingRegistrationRejected";
import PendingRegistrationCancelled from "./PendingRegistrationCancelled";
import PendingRegistrationModal from "../../components/modal/employee/pendingFormModal/PendingRegistrationModal";
import EmployeeWizardForm from "../../components/modal/employee/multiFormModal/employeeWizardForm.jsx";
import {
  DateFilterDialog,
  ConfirmationDialog,
} from "./PendingRegistrationDialog";
import { format } from "date-fns";
import { useRememberQueryParams } from "../../hooks/useRememberQueryParams";
import { useShowDashboardQuery } from "../../features/api/usermanagement/dashboardApi.js";

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
  const dispatch = useDispatch();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.between(600, 1038));
  const isVerySmall = useMediaQuery("(max-width:369px)");
  const { enqueueSnackbar } = useSnackbar();
  const methods = useForm();
  const [currentParams, setQueryParams] = useRememberQueryParams();

  const tabLabels = [
    "ForApproval",
    "AwaitingResubmission",
    "Rejected",
    "Cancelled",
  ];

  const getTabIndexFromParam = (tabParam) => {
    const index = tabLabels.indexOf(tabParam);
    return index >= 0 ? index : 0;
  };

  const initialTab = getTabIndexFromParam(currentParams?.tab);
  const [activeTab, setActiveTab] = useState(initialTab);
  const [searchQuery, setSearchQuery] = useState(currentParams?.q || "");
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

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createModalMode, setCreateModalMode] = useState("create");
  const [editData, setEditData] = useState(null);

  const [getSingleEmployee] = useLazyGetSingleEmployeeQuery();

  const { data: registrationCounts, refetch: refetchCounts } =
    useGetEmployeeRegistrationCountsQuery(undefined, {
      refetchOnMountOrArgChange: true,
      refetchOnFocus: true,
      refetchOnReconnect: true,
    });

  const {
    data: dashboardData,
    isLoading: isDashboardLoading,
    refetch: refetchDashboard,
  } = useShowDashboardQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });

  const openMrfsCount = dashboardData?.result?.employees?.open_mrfs || 0;

  const debounceValue = useDebounce(searchQuery, 500);

  useEffect(() => {
    if (!currentParams?.tab) {
      setQueryParams(
        {
          tab: tabLabels[initialTab],
          q: searchQuery || "",
        },
        { retain: false }
      );
    }
  }, []);

  useEffect(() => {
    if (currentParams?.tab) {
      const tabIndex = getTabIndexFromParam(currentParams.tab);
      setActiveTab(tabIndex);
    }
    if (currentParams?.q !== undefined) {
      setSearchQuery(currentParams.q);
    }
  }, [currentParams?.tab, currentParams?.q]);

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
    setQueryParams(
      {
        tab: tabLabels[newValue],
        q: searchQuery,
      },
      { retain: true }
    );
  };

  const handleSearchChange = useCallback(
    (newSearchQuery) => {
      setSearchQuery(newSearchQuery);
      setApiError(null);
      setQueryParams(
        {
          q: newSearchQuery,
        },
        { retain: true }
      );
    },
    [setQueryParams]
  );

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

  const handleOpenCreateModal = useCallback((mode = "create", data = null) => {
    setCreateModalMode(mode);
    setEditData(data);
    setCreateModalOpen(true);
  }, []);

  const handleCloseCreateModal = useCallback(() => {
    setCreateModalOpen(false);
    setCreateModalMode("create");
    setEditData(null);
  }, []);

  const handleCreateSubmit = useCallback(
    async (data, mode) => {
      try {
        dispatch(pendingApi.util.invalidateTags(["pending"]));
        dispatch(mainApi.util.invalidateTags(["employees"]));
        dispatch(moduleApi.util.invalidateTags(["dashboard"]));

        await new Promise((resolve) => setTimeout(resolve, 500));

        await Promise.all([refetchCounts(), refetchDashboard()]);

        enqueueSnackbar(
          mode === "create"
            ? "Employee created successfully!"
            : "Employee updated successfully!",
          {
            variant: "success",
            autoHideDuration: 2000,
          }
        );

        handleCloseCreateModal();
      } catch (error) {
        enqueueSnackbar(`Failed to ${mode} employee. Please try again.`, {
          variant: "error",
          autoHideDuration: 3000,
        });
      }
    },
    [
      dispatch,
      refetchCounts,
      refetchDashboard,
      enqueueSnackbar,
      handleCloseCreateModal,
    ]
  );

  const tabsData = [
    {
      label: "FOR APPROVAL",
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
      label: "AWAITING RESUBMISSION",
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
      label: "REJECTED",
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
      label: "CANCELLED",
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
                  paddingRight: "14px",
                }}>
                {isVerySmall ? "REGSTR" : "REGISTRATIONS"}
              </Typography>

              <Fade in={!isLoading}>
                <Badge
                  badgeContent={openMrfsCount}
                  color="error"
                  anchorOrigin={{
                    vertical: "top",
                    horizontal: "right",
                  }}
                  sx={{
                    "& .MuiBadge-badge": {
                      backgroundColor: "#ff4444",
                      color: "white",
                      fontSize: "11px",
                      fontWeight: "bold",
                      minWidth: "18px",
                      height: "18px",
                      transform: "translate(50%, -50%)",
                      border: "2px solid white",
                      boxShadow: "0 2px 4px rgba(0,0,0,0.15)",
                    },
                  }}>
                  {isVerySmall ? (
                    <IconButton
                      onClick={() => handleOpenCreateModal("create")}
                      disabled={isLoading}
                      sx={{
                        backgroundColor: "rgb(33, 61, 112)",
                        color: "white",
                        width: "36px",
                        height: "36px",
                        borderRadius: "8px",
                        boxShadow: "0 2px 8px rgba(33, 61, 112, 0.2)",
                        transition: "all 0.2s ease-in-out",
                        "&:hover": {
                          backgroundColor: "rgb(25, 45, 84)",
                          boxShadow: "0 4px 12px rgba(33, 61, 112, 0.3)",
                          transform: "translateY(-1px)",
                        },
                        "&:disabled": {
                          backgroundColor: "#ccc",
                          boxShadow: "none",
                        },
                      }}>
                      <AddIcon sx={{ fontSize: "18px" }} />
                    </IconButton>
                  ) : (
                    <Button
                      variant="contained"
                      onClick={() => handleOpenCreateModal("create")}
                      startIcon={<AddIcon />}
                      disabled={isLoading}
                      sx={{
                        backgroundColor: "rgb(33, 61, 112)",
                        height: isMobile ? "36px" : "38px",
                        width: isMobile ? "auto" : "140px",
                        minWidth: isMobile ? "100px" : "140px",
                        padding: isMobile ? "0 16px" : "0 20px",
                        textTransform: "none",
                        fontWeight: 600,
                        fontSize: isMobile ? "12px" : "14px",
                        borderRadius: "8px",
                        boxShadow: "0 2px 8px rgba(33, 61, 112, 0.2)",
                        transition: "all 0.2s ease-in-out",
                        "& .MuiButton-startIcon": {
                          marginRight: isMobile ? "4px" : "8px",
                        },
                        "&:hover": {
                          backgroundColor: "rgb(25, 45, 84)",
                          boxShadow: "0 4px 12px rgba(33, 61, 112, 0.3)",
                          transform: "translateY(-1px)",
                        },
                        "&:disabled": {
                          backgroundColor: "#ccc",
                          boxShadow: "none",
                        },
                      }}>
                      CREATE
                    </Button>
                  )}
                </Badge>
              </Fade>
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

          <ConfirmationDialog
            open={confirmOpen}
            onClose={() => setConfirmOpen(false)}
            onConfirm={handleConfirmSave}
            confirmAction={confirmAction}
            selectedEmployeeForAction={selectedEmployeeForAction}
            modalLoading={modalLoading}
          />

          <PendingRegistrationModal
            open={modalOpen}
            onClose={handleCloseModal}
            onSave={handleSave}
            selectedEmployee={selectedEmployee}
            isLoading={modalLoading}
            mode={modalMode}
            onModeChange={handleModeChange}
          />

          <EmployeeWizardForm
            open={createModalOpen}
            onClose={handleCloseCreateModal}
            mode={createModalMode}
            initialData={editData}
            onSubmit={handleCreateSubmit}
            refetchQueries={[refetchCounts, refetchDashboard]}
          />
        </Box>
      </FormProvider>
    </LocalizationProvider>
  );
};

export default PendingRegistration;
