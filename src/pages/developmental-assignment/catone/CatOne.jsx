import React, { useState, useCallback, useEffect } from "react";
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
  CircularProgress,
  IconButton,
  useMediaQuery,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import SearchIcon from "@mui/icons-material/Search";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import { FormProvider, useForm } from "react-hook-form";
import { useSnackbar } from "notistack";
import {
  useSaveCatOneAsDraftMutation,
  useSubmitCatOneMutation,
} from "../../../features/api/da-task/catOneApi";
import { format, parseISO, isWithinInterval } from "date-fns";

import CatOneForAssessment from "./CatOneForAssessment";
import CatOneForApproval from "./CatOneForApproval";
import CatOneForSubmission from "./CatOneForSubmission";
import CatOneApproved from "./CatOneApproved";
import { styles } from "../../forms/manpowerform/FormSubmissionStyles";
import { useRememberQueryParams } from "../../../hooks/useRememberQueryParams";
import useDebounce from "../../../hooks/useDebounce";
import CatOneModal from "../../../components/modal/da-task/CatOneModal";
import CatOneReturned from "./CatOneReturned";
import {
  catOneStyles,
  styledTabsConfig,
  styledTabConfig,
} from "./CatOneStyles";

const StyledTabs = styled(Tabs)(({ theme }) => styledTabsConfig(theme));

const StyledTab = styled(Tab)(({ theme }) => styledTabConfig(theme));

const TabPanel = ({ children, value, index, ...other }) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`catone-tabpanel-${index}`}
      aria-labelledby={`catone-tab-${index}`}
      style={catOneStyles.tabPanel(value, index)}
      {...other}>
      {value === index && <Box sx={catOneStyles.tabPanelInner}>{children}</Box>}
    </div>
  );
};

const filterDataByDate = (data, startDate, endDate) => {
  if (!startDate && !endDate) return data;

  return data.filter((item) => {
    const createdAt = parseISO(item.created_at);

    if (startDate && endDate) {
      return isWithinInterval(createdAt, {
        start: startDate,
        end: new Date(endDate.getTime() + 24 * 60 * 60 * 1000 - 1),
      });
    }

    if (startDate) {
      return createdAt >= startDate;
    }

    if (endDate) {
      return createdAt <= new Date(endDate.getTime() + 24 * 60 * 60 * 1000 - 1);
    }

    return true;
  });
};

const filterDataBySearch = (data, searchQuery) => {
  if (!searchQuery.trim()) return data;

  const query = searchQuery.toLowerCase();
  return data.filter(
    (item) =>
      item.reference_number?.toLowerCase().includes(query) ||
      item.employee_name?.toLowerCase().includes(query) ||
      item.employee_code?.toLowerCase().includes(query) ||
      item.status?.toLowerCase().includes(query)
  );
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
          <Box sx={catOneStyles.datePickerContainer}>
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
    <Box sx={catOneStyles.searchContainer(isVerySmall)}>
      {isVerySmall ? (
        <IconButton
          onClick={onFilterClick}
          disabled={isLoading}
          size="small"
          sx={catOneStyles.filterButton(hasActiveFilters)}>
          <CalendarTodayIcon sx={catOneStyles.filterIcon} />
          {hasActiveFilters && <Box sx={catOneStyles.filterBadge}>1</Box>}
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
              <Box sx={catOneStyles.filterLabelBox}>
                <span>{getFilterLabel()}</span>
              </Box>
            }
            sx={catOneStyles.filterFormControl(hasActiveFilters)}
          />
        </Tooltip>
      )}

      <TextField
        placeholder={isVerySmall ? "Search..." : "Search CAT 1..."}
        value={searchQuery}
        onChange={handleSearchChange}
        disabled={isLoading}
        size="small"
        InputProps={{
          startAdornment: (
            <SearchIcon sx={catOneStyles.searchIcon(isLoading, isVerySmall)} />
          ),
          endAdornment: isLoading && (
            <CircularProgress size={16} sx={catOneStyles.searchProgress} />
          ),
          sx: catOneStyles.searchInputProps(isVerySmall, isLoading),
        }}
        sx={catOneStyles.searchTextField(isVerySmall, isLoading)}
      />
    </Box>
  );
};

const CatOne = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.between(600, 1038));
  const isVerySmall = useMediaQuery("(max-width:369px)");
  const { enqueueSnackbar } = useSnackbar();
  const methods = useForm();

  const [currentParams, setQueryParams] = useRememberQueryParams();

  const tabMap = {
    0: "ForAssessment",
    1: "ForSubmission",
    2: "ForApproval",
    3: "Returned",
    4: "Approved",
  };

  const reverseTabMap = {
    ForAssessment: 0,
    ForSubmission: 1,
    ForApproval: 2,
    Returned: 3,
    Approved: 4,
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
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [modalMode, setModalMode] = useState("view");
  const [selectedPage, setSelectedPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [saveCatOneAsDraft] = useSaveCatOneAsDraftMutation();
  const [submitCatOne] = useSubmitCatOneMutation();

  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  const handleTabChange = useCallback(
    (event, newValue) => {
      setActiveTab(newValue);
      setSelectedPage(1);
      setQueryParams(
        {
          tab: tabMap[newValue],
          q: searchQuery,
        },
        { retain: true }
      );
    },
    [setQueryParams, searchQuery, tabMap]
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
    [setQueryParams, activeTab, tabMap]
  );

  const handleFilterClick = useCallback(() => {
    setFilterDialogOpen(true);
  }, []);

  const handleDateFiltersChange = useCallback((newDateFilters) => {
    setDateFilters(newDateFilters);
  }, []);

  const handleRefreshDetails = useCallback(() => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 500);
  }, []);

  const handleRowClick = useCallback((entry) => {
    setSelectedEntry(entry);
    setModalMode("view");
    setModalOpen(true);
  }, []);

  const handleModalClose = useCallback(() => {
    setModalOpen(false);
    setSelectedEntry(null);
  }, []);

  const handleModalSave = useCallback(
    async (formData, mode, entryId) => {
      try {
        if (!entryId) throw new Error("Entry ID is missing");

        const payload = { id: entryId, ...formData };
        await submitCatOne(payload).unwrap();

        enqueueSnackbar("CAT 1 submitted successfully!", {
          variant: "success",
          autoHideDuration: 2000,
        });

        setModalOpen(false);
        setSelectedEntry(null);
        handleRefreshDetails();
        return true;
      } catch (error) {
        let errorMessage = "Failed to submit CAT 1. Please try again.";

        if (error?.data?.message) {
          errorMessage = error.data.message;
        } else if (error?.message) {
          errorMessage = error.message;
        }

        enqueueSnackbar(errorMessage, {
          variant: "error",
          autoHideDuration: 3000,
        });
        return false;
      }
    },
    [submitCatOne, enqueueSnackbar, handleRefreshDetails]
  );

  const handleModalSaveAsDraft = useCallback(
    async (formData, entryId) => {
      try {
        if (!entryId) throw new Error("Entry ID is missing");

        const payload = { id: entryId, ...formData };
        await saveCatOneAsDraft(payload).unwrap();

        enqueueSnackbar("CAT 1 saved as draft successfully!", {
          variant: "success",
          autoHideDuration: 2000,
        });

        setModalOpen(false);
        setSelectedEntry(null);
        handleRefreshDetails();
        return true;
      } catch (error) {
        let errorMessage = "Failed to save draft. Please try again.";

        if (error?.data?.message) {
          errorMessage = error.data.message;
        } else if (error?.message) {
          errorMessage = error.message;
        }

        enqueueSnackbar(errorMessage, {
          variant: "error",
          autoHideDuration: 3000,
        });
        return false;
      }
    },
    [saveCatOneAsDraft, enqueueSnackbar, handleRefreshDetails]
  );

  const handleCancel = useCallback(
    async (entryId, cancellationReason = "") => {
      try {
        enqueueSnackbar("CAT 1 cancelled successfully!", {
          variant: "success",
          autoHideDuration: 2000,
        });

        handleRefreshDetails();
        return true;
      } catch (error) {
        let errorMessage = "Failed to cancel CAT 1. Please try again.";

        if (error?.data?.message) {
          errorMessage = error.data.message;
        } else if (error?.message) {
          errorMessage = error.message;
        }

        enqueueSnackbar(errorMessage, {
          variant: "error",
          autoHideDuration: 3000,
        });

        return false;
      }
    },
    [enqueueSnackbar, handleRefreshDetails]
  );

  const tabsData = [
    {
      label: "For Assessment",
      component: (
        <CatOneForAssessment
          searchQuery={debouncedSearchQuery}
          dateFilters={dateFilters}
          filterDataByDate={filterDataByDate}
          filterDataBySearch={filterDataBySearch}
          setQueryParams={setQueryParams}
          currentParams={currentParams}
          onCancel={handleCancel}
          onRowClick={handleRowClick}
          data={null}
          isLoading={false}
          page={selectedPage}
          rowsPerPage={rowsPerPage}
          onPageChange={setSelectedPage}
          onRowsPerPageChange={setRowsPerPage}
        />
      ),
      badgeCount: null,
    },
    {
      label: "For Submission",
      component: (
        <CatOneForSubmission
          searchQuery={debouncedSearchQuery}
          dateFilters={dateFilters}
          filterDataByDate={filterDataByDate}
          filterDataBySearch={filterDataBySearch}
          setQueryParams={setQueryParams}
          currentParams={currentParams}
          onCancel={handleCancel}
          onRowClick={handleRowClick}
          data={null}
          isLoading={false}
          page={selectedPage}
          rowsPerPage={rowsPerPage}
          onPageChange={setSelectedPage}
          onRowsPerPageChange={setRowsPerPage}
        />
      ),
      badgeCount: null,
    },
    {
      label: "For Approval",
      component: (
        <CatOneForApproval
          searchQuery={debouncedSearchQuery}
          dateFilters={dateFilters}
          filterDataByDate={filterDataByDate}
          filterDataBySearch={filterDataBySearch}
          setQueryParams={setQueryParams}
          currentParams={currentParams}
          onCancel={handleCancel}
          onRowClick={handleRowClick}
          data={null}
          isLoading={false}
          page={selectedPage}
          rowsPerPage={rowsPerPage}
          onPageChange={setSelectedPage}
          onRowsPerPageChange={setRowsPerPage}
        />
      ),
      badgeCount: null,
    },
    {
      label: "Returned",
      component: (
        <CatOneReturned
          searchQuery={debouncedSearchQuery}
          dateFilters={dateFilters}
          filterDataByDate={filterDataByDate}
          filterDataBySearch={filterDataBySearch}
          setQueryParams={setQueryParams}
          currentParams={currentParams}
          onCancel={handleCancel}
          onRowClick={handleRowClick}
          onSave={handleModalSave}
          onSaveAsDraft={handleModalSaveAsDraft}
          data={null}
          isLoading={false}
          page={selectedPage}
          rowsPerPage={rowsPerPage}
          onPageChange={setSelectedPage}
          onRowsPerPageChange={setRowsPerPage}
        />
      ),
      badgeCount: null,
    },
    {
      label: "Approved",
      component: (
        <CatOneApproved
          searchQuery={debouncedSearchQuery}
          dateFilters={dateFilters}
          filterDataByDate={filterDataByDate}
          filterDataBySearch={filterDataBySearch}
          setQueryParams={setQueryParams}
          currentParams={currentParams}
          onCancel={handleCancel}
          onRowClick={handleRowClick}
          data={null}
          isLoading={false}
          page={selectedPage}
          rowsPerPage={rowsPerPage}
          onPageChange={setSelectedPage}
          onRowsPerPageChange={setRowsPerPage}
        />
      ),
      badgeCount: null,
    },
  ];

  const a11yProps = (index) => {
    return {
      id: `catone-tab-${index}`,
      "aria-controls": `catone-tabpanel-${index}`,
    };
  };

  const isLoadingState = isLoading;

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <FormProvider {...methods}>
        <Box sx={catOneStyles.mainContainer}>
          <Box sx={catOneStyles.innerContainer}>
            <Box sx={catOneStyles.headerContainer(isMobile, isTablet)}>
              <Box
                sx={catOneStyles.titleContainer(
                  isVerySmall,
                  isMobile,
                  isTablet
                )}>
                <Typography
                  className="header"
                  sx={catOneStyles.title(isVerySmall, isMobile)}>
                  CAT 1
                </Typography>
              </Box>

              <CustomSearchBar
                searchQuery={searchQuery}
                setSearchQuery={handleSearchChange}
                dateFilters={dateFilters}
                onFilterClick={handleFilterClick}
                isLoading={isLoadingState}
              />
            </Box>

            <StyledTabs
              value={activeTab}
              onChange={handleTabChange}
              aria-label="CAT 1 tabs"
              variant="scrollable"
              scrollButtons="auto"
              allowScrollButtonsMobile>
              {tabsData.map((tab, index) => (
                <StyledTab
                  key={index}
                  label={
                    tab.badgeCount ? (
                      <Badge
                        badgeContent={tab.badgeCount}
                        color="error"
                        sx={catOneStyles.badgeStyle}>
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

            <Box sx={catOneStyles.tabsContainer}>
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

          <CatOneModal
            open={modalOpen}
            onClose={handleModalClose}
            mode={modalMode}
            selectedEntry={selectedEntry}
            onSave={handleModalSave}
            onSaveAsDraft={handleModalSaveAsDraft}
            onRefreshDetails={handleRefreshDetails}
            isLoading={isLoading}
          />
        </Box>
      </FormProvider>
    </LocalizationProvider>
  );
};

export default CatOne;
