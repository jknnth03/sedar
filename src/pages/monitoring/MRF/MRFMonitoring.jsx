import React, { useState, useMemo, useCallback, useEffect } from "react";
import {
  Box,
  Tabs,
  Tab,
  Paper,
  useTheme,
  Typography,
  TextField,
  Checkbox,
  FormControlLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
  Button,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import SearchIcon from "@mui/icons-material/Search";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import { format } from "date-fns";
import { useRememberQueryParams } from "../../../hooks/useRememberQueryParams";
import MRFMonitoringForApproval from "./MRFMonitoringForApproval";
import MRFMonitoringAwaitingResubmission from "./MRFMonitoringAwaitingResubmission";
import MRFMonitoringRejected from "./MRFMonitoringRejected";
import MRFMonitoringForReceiving from "./MRFMonitoringForReceiving";
import MRFMonitoringReturned from "./MRFMonitoringReturned";
import MRFMonitoringReceived from "./MRFMonitoringReceived";
import MRFMonitoringCancelled from "./MRFMonitoringCancelled";
import { styles } from "../../../pages/forms/manpowerform/FormSubmissionStyles";

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

const DialogClose = styled(Button)(({ theme }) => ({
  textTransform: "uppercase",
  fontWeight: 600,
  fontSize: "0.75rem",
  padding: "8px 16px",
  color: theme.palette.text.secondary,
  borderColor: theme.palette.text.secondary,
  "&:hover": {
    backgroundColor: "rgba(0, 0, 0, 0.04)",
    borderColor: theme.palette.text.secondary,
  },
}));

const DialogApply = styled(Button)(({ theme }) => ({
  textTransform: "uppercase",
  fontWeight: 600,
  fontSize: "0.75rem",
  padding: "8px 16px",
  backgroundColor: theme.palette.primary.main,
  color: "#ffffff",
  "&:hover": {
    backgroundColor: theme.palette.primary.dark,
  },
}));

const TabPanel = ({ children, value, index, ...other }) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`mrf-monitoring-tabpanel-${index}`}
      aria-labelledby={`mrf-monitoring-tab-${index}`}
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
            <DialogClose
              onClick={onClose}
              variant="outlined"
              sx={styles.cancelButton}>
              CANCEL
            </DialogClose>
            <DialogApply
              onClick={handleApply}
              variant="contained"
              sx={styles.applyFiltersButton}>
              APPLY FILTERS
            </DialogApply>
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
        placeholder="Search form..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        size="small"
        InputProps={{
          startAdornment: <SearchIcon sx={styles.searchIcon(false)} />,
          sx: styles.searchInputProps(false),
        }}
        sx={styles.searchTextField}
      />
    </Box>
  );
};

const MRFMonitoring = () => {
  const theme = useTheme();
  const [currentParams, setQueryParams, removeQueryParams] =
    useRememberQueryParams();

  const tabLabels = [
    "ForApproval",
    "AwaitingResubmission",
    "Rejected",
    "ForReceiving",
    "Returned",
    "Received",
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
    return date ? format(date, "yyyy-MM-dd") : "";
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
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
  }, []);

  const tabsData = [
    {
      label: "For Approval",
      component: (
        <MRFMonitoringForApproval
          searchQuery={debounceValue}
          startDate={formatDateForAPI(dateFilters.startDate)}
          endDate={formatDateForAPI(dateFilters.endDate)}
        />
      ),
    },
    {
      label: "Awaiting Resubmission",
      component: (
        <MRFMonitoringAwaitingResubmission
          searchQuery={debounceValue}
          startDate={formatDateForAPI(dateFilters.startDate)}
          endDate={formatDateForAPI(dateFilters.endDate)}
        />
      ),
    },
    {
      label: "Rejected",
      component: (
        <MRFMonitoringRejected
          searchQuery={debounceValue}
          startDate={formatDateForAPI(dateFilters.startDate)}
          endDate={formatDateForAPI(dateFilters.endDate)}
        />
      ),
    },
    {
      label: "For Receiving",
      component: (
        <MRFMonitoringForReceiving
          searchQuery={debounceValue}
          startDate={formatDateForAPI(dateFilters.startDate)}
          endDate={formatDateForAPI(dateFilters.endDate)}
        />
      ),
    },
    {
      label: "Returned",
      component: (
        <MRFMonitoringReturned
          searchQuery={debounceValue}
          startDate={formatDateForAPI(dateFilters.startDate)}
          endDate={formatDateForAPI(dateFilters.endDate)}
        />
      ),
    },
    {
      label: "Received",
      component: (
        <MRFMonitoringReceived
          searchQuery={debounceValue}
          startDate={formatDateForAPI(dateFilters.startDate)}
          endDate={formatDateForAPI(dateFilters.endDate)}
        />
      ),
    },
    {
      label: "Cancelled",
      component: (
        <MRFMonitoringCancelled
          searchQuery={debounceValue}
          startDate={formatDateForAPI(dateFilters.startDate)}
          endDate={formatDateForAPI(dateFilters.endDate)}
        />
      ),
    },
  ];

  const a11yProps = (index) => {
    return {
      id: `mrf-monitoring-tab-${index}`,
      "aria-controls": `mrf-monitoring-tabpanel-${index}`,
    };
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
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
                  MANPOWER FORM MONITORING
                </Typography>
              </Box>

              <CustomSearchBar
                searchQuery={searchQuery}
                setSearchQuery={handleSearchChange}
                dateFilters={dateFilters}
                onFilterClick={handleFilterClick}
              />
            </Box>
          </Paper>

          <StyledTabs
            value={activeTab}
            onChange={handleTabChange}
            aria-label="MRF monitoring tabs"
            variant="scrollable"
            scrollButtons="auto"
            allowScrollButtonsMobile>
            {tabsData.map((tab, index) => (
              <StyledTab key={index} label={tab.label} {...a11yProps(index)} />
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
            {tabsData.map((tab, index) => (
              <TabPanel key={index} value={activeTab} index={index}>
                {tab.component}
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
      </Box>
    </LocalizationProvider>
  );
};

export default MRFMonitoring;
