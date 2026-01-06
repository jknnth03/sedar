import React, { useState, useMemo, useCallback, useEffect } from "react";
import {
  Box,
  Badge,
  Paper,
  useTheme,
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
  CircularProgress,
  IconButton,
  useMediaQuery,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import SearchIcon from "@mui/icons-material/Search";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import AddIcon from "@mui/icons-material/Add";
import { FormProvider, useForm } from "react-hook-form";
import { useSnackbar } from "notistack";
import { styles, StyledTabs, StyledTab } from "./FormSubmissionStyles";
import { useCreateFormSubmissionMutation } from "../../../features/api/approvalsetting/formSubmissionApi";
import { useShowDashboardQuery } from "../../../features/api/usermanagement/dashboardApi";
import MrfForApproval from "./MrfForApproval";
import MrfRejected from "./MrfRejected";
import MrfAwaitingResubmission from "./MrfAwaitingResubmission";
import MrfForreceiving from "./MrfForreceiving";
import MrfReturned from "./MrfReturned";
import MrfReceived from "./MrfReceived";
import MrfCancelled from "./MrfCancelled";
import FormSubmissionModal from "../../../components/modal/form/ManpowerForm/FormSubmissionModal";
import { format } from "date-fns";
import { useRememberQueryParams } from "../../../hooks/useRememberQueryParams";

const TabPanel = ({ children, value, index, ...other }) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`mrf-tabpanel-${index}`}
      aria-labelledby={`mrf-tab-${index}`}
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
          <Box sx={styles.datePickerContainer}>
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
  const isVerySmall = useMediaQuery("(max-width:369px)");
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

  const iconColor = hasActiveFilters
    ? "rgba(0, 133, 49, 1)"
    : "rgb(33, 61, 112)";

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
  };

  return (
    <Box sx={styles.searchBarContainer}>
      {isVerySmall ? (
        <IconButton
          onClick={onFilterClick}
          disabled={isLoading}
          size="small"
          sx={{
            ...styles.filterIconButton,
            ...(hasActiveFilters && styles.filterIconButtonActive),
          }}>
          <CalendarTodayIcon sx={{ fontSize: "18px" }} />
          {hasActiveFilters && <Box sx={styles.filterBadge}>1</Box>}
        </IconButton>
      ) : (
        <Tooltip title="Click here to filter by date range" arrow>
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
              ...styles.filterFormControlLabel,
              ...(hasActiveFilters && styles.filterFormControlLabelActive),
            }}
          />
        </Tooltip>
      )}

      <TextField
        placeholder={isVerySmall ? "Search..." : "Search form..."}
        value={searchQuery}
        onChange={handleSearchChange}
        disabled={isLoading}
        size="small"
        InputProps={{
          startAdornment: (
            <SearchIcon
              sx={{
                ...styles.searchIcon,
                ...(isLoading && styles.searchIconLoading),
              }}
            />
          ),
          endAdornment: isLoading && (
            <CircularProgress size={16} sx={{ marginLeft: 1 }} />
          ),
          sx: styles.searchInputPropsStyle,
        }}
        sx={styles.searchTextField}
      />
    </Box>
  );
};

const MrfMainContainer = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.between(600, 1038));
  const isVerySmall = useMediaQuery("(max-width:369px)");
  const { enqueueSnackbar } = useSnackbar();
  const methods = useForm();

  const { data: dashboardData } = useShowDashboardQuery();

  const [currentParams, setQueryParams] = useRememberQueryParams();

  const tabMap = {
    0: "ForApproval",
    1: "AwaitingResubmission",
    2: "Rejected",
    3: "ForReceiving",
    4: "Returned",
    5: "Received",
    6: "Cancelled",
  };

  const reverseTabMap = {
    ForApproval: 0,
    AwaitingResubmission: 1,
    Rejected: 2,
    ForReceiving: 3,
    Returned: 4,
    Received: 5,
    Cancelled: 6,
  };

  const [activeTab, setActiveTab] = useState(
    reverseTabMap[currentParams?.tab] ?? 0
  );
  const [searchQuery, setSearchQuery] = useState(currentParams?.q ?? "");
  const [dateFilters, setDateFilters] = useState({
    startDate: null,
    endDate: null,
  });
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [formIsLoading, setFormIsLoading] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingFormData, setPendingFormData] = useState(null);

  const [createSubmission] = useCreateFormSubmissionMutation();

  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  const mrfCounts = {
    forApproval: dashboardData?.result?.approval?.manpower_form || 0,
    awaitingResubmission:
      dashboardData?.result?.requisition
        ?.manpower_form_awaiting_for_resubmission || 0,
    rejected: dashboardData?.result?.requisition?.manpower_form_rejected || 0,
    forReceiving: dashboardData?.result?.receiving?.pending_mrfs || 0,
    returned: dashboardData?.result?.requisition?.manpower_form_returned || 0,
    received: 0,
    cancelled: 0,
  };

  const formatDateForAPI = (date) => {
    return date ? format(date, "yyyy-MM-dd") : null;
  };

  const handleTabChange = useCallback(
    (event, newValue) => {
      setActiveTab(newValue);
      setQueryParams(
        {
          tab: tabMap[newValue],
          q: searchQuery,
        },
        { retain: true }
      );
    },
    [setQueryParams, searchQuery]
  );

  const handleSearchChange = useCallback(
    (newSearchQuery) => {
      setSearchQuery(newSearchQuery);
      setQueryParams(
        {
          tab: tabMap[activeTab],
          q: newSearchQuery,
        },
        { retain: true }
      );
    },
    [setQueryParams, activeTab]
  );

  const handleFilterClick = useCallback(() => {
    setFilterDialogOpen(true);
  }, []);

  const handleDateFiltersChange = useCallback((newDateFilters) => {
    setDateFilters(newDateFilters);
  }, []);

  const handleAddNew = useCallback(() => {
    setSelectedEntry(null);
    setModalMode("create");
    methods.reset();
    setFormModalOpen(true);
  }, [methods]);

  const handleCloseModal = useCallback(() => {
    setFormModalOpen(false);
    setSelectedEntry(null);
    setModalMode("create");
    setFormIsLoading(false);
    methods.reset();
    setPendingFormData(null);
  }, [methods]);

  const handleModeChange = useCallback((newMode) => {
    setModalMode(newMode);
  }, []);

  const handleSave = useCallback(async (formData, mode) => {
    setPendingFormData(formData);
    setConfirmOpen(true);
  }, []);

  const handleConfirmSave = useCallback(async () => {
    if (!pendingFormData) return;

    setFormIsLoading(true);
    setConfirmOpen(false);

    try {
      const result = await createSubmission(pendingFormData).unwrap();

      enqueueSnackbar("Manpower form created successfully!", {
        variant: "success",
        autoHideDuration: 2000,
      });

      handleCloseModal();
    } catch (error) {
      let errorMessage = "Failed to create manpower form. Please try again.";

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
      setFormIsLoading(false);
      setPendingFormData(null);
    }
  }, [pendingFormData, createSubmission, enqueueSnackbar, handleCloseModal]);

  const handleResubmit = useCallback(
    async (submissionId) => {
      setFormIsLoading(true);

      try {
        await new Promise((resolve) => setTimeout(resolve, 1000));

        enqueueSnackbar("Form resubmitted successfully!", {
          variant: "success",
        });

        setFormModalOpen(false);
        setSelectedEntry(null);
        setModalMode("create");
      } catch (error) {
        enqueueSnackbar("Failed to resubmit form. Please try again.", {
          variant: "error",
        });
      } finally {
        setFormIsLoading(false);
      }
    },
    [enqueueSnackbar]
  );

  const tabsData = [
    {
      label: "FOR APPROVAL",
      component: (
        <MrfForApproval
          searchQuery={debouncedSearchQuery}
          startDate={formatDateForAPI(dateFilters.startDate)}
          endDate={formatDateForAPI(dateFilters.endDate)}
        />
      ),
      badgeCount: mrfCounts.forApproval,
    },
    {
      label: "AWAITING RESUBMISSION",
      component: (
        <MrfAwaitingResubmission
          searchQuery={debouncedSearchQuery}
          startDate={formatDateForAPI(dateFilters.startDate)}
          endDate={formatDateForAPI(dateFilters.endDate)}
        />
      ),
      badgeCount: mrfCounts.awaitingResubmission,
    },
    {
      label: "REJECTED",
      component: (
        <MrfRejected
          searchQuery={debouncedSearchQuery}
          startDate={formatDateForAPI(dateFilters.startDate)}
          endDate={formatDateForAPI(dateFilters.endDate)}
        />
      ),
      badgeCount: mrfCounts.rejected,
    },
    {
      label: "FOR RECEIVING",
      component: (
        <MrfForreceiving
          searchQuery={debouncedSearchQuery}
          startDate={formatDateForAPI(dateFilters.startDate)}
          endDate={formatDateForAPI(dateFilters.endDate)}
        />
      ),
      badgeCount: mrfCounts.forReceiving,
    },
    {
      label: "RETURNED",
      component: (
        <MrfReturned
          searchQuery={debouncedSearchQuery}
          startDate={formatDateForAPI(dateFilters.startDate)}
          endDate={formatDateForAPI(dateFilters.endDate)}
        />
      ),
      badgeCount: mrfCounts.returned,
    },
    {
      label: "RECEIVED",
      component: (
        <MrfReceived
          searchQuery={debouncedSearchQuery}
          startDate={formatDateForAPI(dateFilters.startDate)}
          endDate={formatDateForAPI(dateFilters.endDate)}
        />
      ),
      badgeCount: mrfCounts.received,
    },
    {
      label: "CANCELLED",
      component: (
        <MrfCancelled
          searchQuery={debouncedSearchQuery}
          startDate={formatDateForAPI(dateFilters.startDate)}
          endDate={formatDateForAPI(dateFilters.endDate)}
        />
      ),
      badgeCount: mrfCounts.cancelled,
    },
  ];

  const a11yProps = (index) => {
    return {
      id: `mrf-tab-${index}`,
      "aria-controls": `mrf-tabpanel-${index}`,
    };
  };

  const isLoadingState = isLoading;

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
                {isVerySmall ? "MRF" : "MANPOWER FORM"}
              </Typography>

              <Fade in={!isLoading}>
                <Box>
                  {isVerySmall ? (
                    <IconButton
                      onClick={handleAddNew}
                      disabled={isLoading}
                      sx={styles.createIconButton}>
                      <AddIcon sx={{ fontSize: "18px" }} />
                    </IconButton>
                  ) : (
                    <Button
                      variant="contained"
                      onClick={handleAddNew}
                      startIcon={<AddIcon />}
                      disabled={isLoading}
                      sx={{
                        ...styles.createButton,
                        ...(isMobile && styles.createButtonMobile),
                      }}>
                      CREATE
                    </Button>
                  )}
                </Box>
              </Fade>
            </Box>

            <CustomSearchBar
              searchQuery={searchQuery}
              setSearchQuery={handleSearchChange}
              dateFilters={dateFilters}
              onFilterClick={handleFilterClick}
              isLoading={isLoadingState}
            />
          </Box>

          <Box sx={styles.tabsSection}>
            <StyledTabs
              value={activeTab}
              onChange={handleTabChange}
              aria-label="MRF management tabs"
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
                        {isVerySmall && tab.label.length > 12
                          ? tab.label
                              .replace("AWAITING ", "")
                              .replace("RESUBMISSION", "RESUB")
                              .replace("FOR APPROVAL", "APPROVAL")
                              .replace("FOR RECEIVING", "RECEIVING")
                          : tab.label}
                      </Badge>
                    ) : isVerySmall && tab.label.length > 12 ? (
                      tab.label
                        .replace("AWAITING ", "")
                        .replace("RESUBMISSION", "RESUB")
                        .replace("FOR APPROVAL", "APPROVAL")
                        .replace("FOR RECEIVING", "RECEIVING")
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
                {tab.component}
              </TabPanel>
            ))}
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
              sx: styles.confirmDialog,
            }}>
            <DialogTitle sx={styles.confirmDialogTitle}>
              <Box sx={styles.confirmIconContainer}>
                <Box sx={styles.confirmIcon}>
                  <Typography sx={styles.confirmIconText}>?</Typography>
                </Box>
              </Box>
              <Typography variant="h5" sx={styles.confirmTitle}>
                Confirmation
              </Typography>
            </DialogTitle>
            <DialogContent sx={styles.confirmDialogContent}>
              <Typography variant="body1" sx={styles.confirmMessage}>
                Are you sure you want to create this manpower form?
              </Typography>
              <Typography variant="body2" sx={styles.confirmSubMessage}>
                New Manpower Form
              </Typography>
            </DialogContent>
            <DialogActions sx={styles.confirmDialogActions}>
              <Button
                onClick={() => setConfirmOpen(false)}
                variant="outlined"
                sx={styles.confirmCancelButton}
                disabled={formIsLoading}>
                CANCEL
              </Button>
              <Button
                onClick={handleConfirmSave}
                variant="contained"
                sx={styles.confirmSubmitButton}
                disabled={formIsLoading}>
                {formIsLoading ? (
                  <CircularProgress size={20} color="inherit" />
                ) : (
                  "CONFIRM"
                )}
              </Button>
            </DialogActions>
          </Dialog>
          <FormSubmissionModal
            open={formModalOpen}
            onClose={handleCloseModal}
            onSave={handleSave}
            onResubmit={handleResubmit}
            selectedEntry={selectedEntry}
            isLoading={formIsLoading}
            mode={modalMode}
            onModeChange={handleModeChange}
          />
        </Box>
      </FormProvider>
    </LocalizationProvider>
  );
};

export default MrfMainContainer;
