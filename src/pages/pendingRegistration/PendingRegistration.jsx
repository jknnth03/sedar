import React, { useState, useMemo, useCallback, useEffect } from "react";
import { useDispatch } from "react-redux";
import {
  Box,
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
import { useTheme } from "@mui/material/styles";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import SearchIcon from "@mui/icons-material/Search";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import AddIcon from "@mui/icons-material/Add";
import { FormProvider, useForm } from "react-hook-form";
import { useSnackbar } from "notistack";

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
import EmployeeWizardForm from "../../components/modal/employee/multiFormModal/employeeWizardForm.jsx";
import {
  DateFilterDialog,
  ConfirmationDialog,
} from "./PendingRegistrationDialog";
import { format } from "date-fns";
import { useRememberQueryParams } from "../../hooks/useRememberQueryParams";
import { useShowDashboardQuery } from "../../features/api/usermanagement/dashboardApi.js";
import {
  styles,
  StyledTabs,
  StyledTab,
} from "../forms/manpowerform/FormSubmissionStyles.jsx";

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
  dateFilters,
  onFilterClick,
  isLoading = false,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
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

  const iconColor = hasActiveFilters
    ? "rgba(0, 133, 49, 1)"
    : "rgb(33, 61, 112)";

  return (
    <Box
      sx={{
        ...styles.searchBarContainer,
        ...(isMobile && styles.searchBarContainerMobile),
        ...(isVerySmall && styles.searchBarContainerVerySmall),
      }}>
      <Tooltip title="Click here to filter by date range" arrow>
        {isSmallerThan450 ? (
          <IconButton
            onClick={onFilterClick}
            disabled={isLoading}
            size="small"
            sx={{
              width: "36px",
              height: "36px",
              border: `1px solid ${
                hasActiveFilters ? "rgba(0, 133, 49, 1)" : "#ccc"
              }`,
              borderRadius: "8px",
              backgroundColor: hasActiveFilters
                ? "rgba(0, 133, 49, 0.04)"
                : "white",
              color: iconColor,
              position: "relative",
              transition: "all 0.2s ease-in-out",
              "&:hover": {
                backgroundColor: hasActiveFilters
                  ? "rgba(0, 133, 49, 0.08)"
                  : "#f5f5f5",
                borderColor: hasActiveFilters
                  ? "rgba(0, 133, 49, 1)"
                  : "rgb(33, 61, 112)",
              },
            }}>
            <CalendarTodayIcon sx={{ fontSize: "18px" }} />
            {hasActiveFilters && (
              <Box
                sx={{
                  position: "absolute",
                  top: "-6px",
                  right: "-6px",
                  backgroundColor: "rgba(0, 133, 49, 1)",
                  color: "white",
                  borderRadius: "50%",
                  width: "16px",
                  height: "16px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "10px",
                  fontWeight: 600,
                }}>
                1
              </Box>
            )}
          </IconButton>
        ) : (
          <FormControlLabel
            control={
              <Checkbox
                checked={hasActiveFilters}
                onChange={onFilterClick}
                disabled={isLoading}
                icon={<CalendarTodayIcon sx={{ color: iconColor }} />}
                checkedIcon={<CalendarTodayIcon sx={{ color: iconColor }} />}
                size="small"
              />
            }
            label={
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <span>{getFilterLabel()}</span>
              </Box>
            }
            sx={{
              margin: 0,
              border: `1px solid ${hasActiveFilters ? "#4caf50" : "#ccc"}`,
              borderRadius: "8px",
              paddingLeft: "8px",
              paddingRight: "12px",
              height: "36px",
              backgroundColor: hasActiveFilters
                ? "rgba(76, 175, 80, 0.04)"
                : "white",
              transition: "all 0.2s ease-in-out",
              "&:hover": {
                backgroundColor: hasActiveFilters
                  ? "rgba(76, 175, 80, 0.08)"
                  : "#f5f5f5",
                borderColor: hasActiveFilters ? "#4caf50" : "rgb(33, 61, 112)",
              },
              "& .MuiFormControlLabel-label": {
                fontSize: "12px",
                fontWeight: 600,
                color: hasActiveFilters ? "#4caf50" : "rgb(33, 61, 112)",
                letterSpacing: "0.5px",
              },
            }}
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
            <SearchIcon sx={styles.searchIcon(isLoading, isVerySmall)} />
          ),
          endAdornment: isLoading && (
            <CircularProgress size={16} sx={styles.searchProgress} />
          ),
          sx: styles.searchInputProps(isLoading, isVerySmall, isMobile),
        }}
        sx={{
          ...styles.searchTextField,
          ...(isVerySmall && styles.searchTextFieldVerySmall),
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

  const handleCloseCreateModal = useCallback(() => {
    setCreateModalOpen(false);
    setCreateModalMode("create");
    setEditData(null);
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
        setCreateModalMode("view");
        setEditData(result?.result || employee);
        setCreateModalOpen(true);
      } catch (error) {
        enqueueSnackbar("Failed to load employee details", {
          variant: "error",
          autoHideDuration: 3000,
        });
        setCreateModalMode("view");
        setEditData(employee);
        setCreateModalOpen(true);
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

      handleCloseCreateModal();
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
  }, [pendingEmployeeData, enqueueSnackbar, handleCloseCreateModal]);

  const handleApiError = useCallback(
    (error) => {
      setApiError(error);

      if (error?.status === 401) {
        enqueueSnackbar("Authentication required. Please log in again.", {
          variant: "error",
          autoHideDuration: 5000,
        });
      } else if (error?.status >= 500) {
        enqueueSnackbar("Server try again later.", {
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
          onRowClick={handleRowClick}
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
          onRowClick={handleRowClick}
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
          onRowClick={handleRowClick}
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
          onRowClick={handleRowClick}
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

          <Box sx={styles.tabsSection}>
            <StyledTabs
              value={activeTab}
              onChange={handleTabChange}
              aria-label="Pending registration management tabs"
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
                    tab.badgeCount && tab.badgeCount > 0 ? (
                      <Badge
                        badgeContent={tab.badgeCount}
                        color="error"
                        sx={{
                          ...styles.tabBadge,
                          ...(isVerySmall && styles.tabBadgeVerySmall),
                        }}>
                        {isVerySmall && tab.label.length > 12
                          ? tab.label
                              .replace("AWAITING ", "")
                              .replace("RESUBMISSION", "RESUB")
                          : tab.label}
                      </Badge>
                    ) : isVerySmall && tab.label.length > 12 ? (
                      tab.label
                        .replace("AWAITING ", "")
                        .replace("RESUBMISSION", "RESUB")
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
            {apiError && (
              <Box sx={{ p: 2 }}>
                <Alert
                  severity="error"
                  action={
                    <Button color="inherit" size="small" onClick={retryApiCall}>
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

          <EmployeeWizardForm
            open={createModalOpen}
            onClose={handleCloseCreateModal}
            mode={createModalMode}
            initialData={editData}
            onSubmit={handleCreateSubmit}
          />
        </Box>
      </FormProvider>
    </LocalizationProvider>
  );
};

export default PendingRegistration;
