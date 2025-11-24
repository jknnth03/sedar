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
import AddIcon from "@mui/icons-material/Add";
import { FormProvider, useForm } from "react-hook-form";
import { useSnackbar } from "notistack";
import { styles } from "../manpowerform/FormSubmissionStyles";
import { daFormStyles } from "./DAFormStyles";

import { format, parseISO, isWithinInterval } from "date-fns";
import { useRememberQueryParams } from "../../../hooks/useRememberQueryParams";
import useDebounce from "../../../hooks/useDebounce";

import DAFormForApproval from "./DAFormForApproval";
import DAFormAwaitingResubmission from "./DAFormAwaitingResubmission";
import DAFormRejected from "./DAFormRejected";
import DAFormMDAForApproval from "./DAFormMDAForApproval";
import DAFormCancelled from "./DAFormCancelled";
import DAFormModal from "../../../components/modal/form/DAForm/DAFormModal";
import {
  useCreateDaMutation,
  useUpdateDaMutation,
} from "../../../features/api/forms/daformApi";
import { useCancelFormSubmissionMutation } from "../../../features/api/approvalsetting/formSubmissionApi";
import { useShowDashboardQuery } from "../../../features/api/usermanagement/dashboardApi";
import DAFormForMDAProcessing from "./DAFormForMDAProcessing";

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
      id={`daform-tabpanel-${index}`}
      aria-labelledby={`daform-tab-${index}`}
      style={daFormStyles.tabPanelContainer(value, index)}
      {...other}>
      {value === index && <Box sx={daFormStyles.tabPanelInner}>{children}</Box>}
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
      item.reference_number.toLowerCase().includes(query) ||
      item.employee_name.toLowerCase().includes(query) ||
      item.employee_code.toLowerCase().includes(query) ||
      item.action_type.toLowerCase().includes(query)
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
          <Box sx={daFormStyles.datePickerContainer}>
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

const DAForm = () => {
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
    3: "Cancelled",
    4: "ForMDAProcessing",
    5: "MDAInProgress",
  };

  const reverseTabMap = {
    ForApproval: 0,
    AwaitingResubmission: 1,
    Rejected: 2,
    Cancelled: 3,
    ForMDAProcessing: 4,
    MDAInProgress: 5,
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
  const [modalMode, setModalMode] = useState("create");
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

  const [createDASubmission] = useCreateDaMutation();
  const [updateDASubmission] = useUpdateDaMutation();
  const [cancelDASubmission] = useCancelFormSubmissionMutation();

  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  const daCounts = {
    forApproval: dashboardData?.result?.approval?.da_approval || 0,
    awaitingResubmission: 0,
    rejected: 0,
    cancelled: 0,
    forMDAProcessing: 0,
    mdaInProgress: 0,
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
    setModalOpen(true);
  }, [methods]);

  const handleCloseModal = useCallback(() => {
    setModalOpen(false);
    setSelectedEntry(null);
    setModalMode("create");
    setModalLoading(false);
    methods.reset();
  }, [methods]);

  const handleModeChange = useCallback((newMode) => {
    setModalMode(newMode);
  }, []);

  const handleCancel = useCallback(
    async (entryId, cancellationReason) => {
      try {
        await cancelDASubmission({
          id: entryId,
          cancellation_reason: cancellationReason,
        }).unwrap();

        enqueueSnackbar("DA Form cancelled successfully!", {
          variant: "success",
          autoHideDuration: 2000,
        });

        return true;
      } catch (error) {
        let errorMessage = "Failed to cancel DA Form. Please try again.";

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
    [cancelDASubmission, enqueueSnackbar]
  );

  const handleSave = useCallback(
    async (formData, mode, entryId) => {
      setModalLoading(true);

      try {
        let result;

        if (mode === "edit") {
          if (!entryId) {
            throw new Error("Entry ID is required for updating");
          }

          result = await updateDASubmission({
            id: entryId,
            data: formData,
          }).unwrap();

          enqueueSnackbar("DA Form updated successfully!", {
            variant: "success",
            autoHideDuration: 2000,
          });
        } else {
          result = await createDASubmission(formData).unwrap();

          enqueueSnackbar("DA Form created successfully!", {
            variant: "success",
            autoHideDuration: 2000,
          });
        }

        handleCloseModal();
      } catch (error) {
        let errorMessage =
          mode === "edit"
            ? "Failed to update DA Form. Please try again."
            : "Failed to create DA Form. Please try again.";

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
      }
    },
    [createDASubmission, updateDASubmission, enqueueSnackbar, handleCloseModal]
  );

  const tabsData = [
    {
      label: "For Approval",
      component: (
        <DAFormForApproval
          searchQuery={debouncedSearchQuery}
          dateFilters={dateFilters}
          filterDataByDate={filterDataByDate}
          filterDataBySearch={filterDataBySearch}
          setQueryParams={setQueryParams}
          currentParams={currentParams}
          onCancel={handleCancel}
        />
      ),
      badgeCount: daCounts.forApproval,
    },
    {
      label: "Awaiting Resubmission",
      component: (
        <DAFormAwaitingResubmission
          searchQuery={debouncedSearchQuery}
          dateFilters={dateFilters}
          filterDataByDate={filterDataByDate}
          filterDataBySearch={filterDataBySearch}
          setQueryParams={setQueryParams}
          currentParams={currentParams}
          onCancel={handleCancel}
        />
      ),
      badgeCount: daCounts.awaitingResubmission,
    },
    {
      label: "Rejected",
      component: (
        <DAFormRejected
          searchQuery={debouncedSearchQuery}
          dateFilters={dateFilters}
          filterDataByDate={filterDataByDate}
          filterDataBySearch={filterDataBySearch}
          setQueryParams={setQueryParams}
          currentParams={currentParams}
          onCancel={handleCancel}
        />
      ),
      badgeCount: daCounts.rejected,
    },
    {
      label: "Cancelled",
      component: (
        <DAFormCancelled
          searchQuery={debouncedSearchQuery}
          dateFilters={dateFilters}
          filterDataByDate={filterDataByDate}
          filterDataBySearch={filterDataBySearch}
          setQueryParams={setQueryParams}
          currentParams={currentParams}
        />
      ),
      badgeCount: daCounts.cancelled,
    },
    {
      label: "For MDA Processing",
      component: (
        <DAFormForMDAProcessing
          searchQuery={debouncedSearchQuery}
          dateFilters={dateFilters}
          filterDataByDate={filterDataByDate}
          filterDataBySearch={filterDataBySearch}
          setQueryParams={setQueryParams}
          currentParams={currentParams}
          onCancel={handleCancel}
        />
      ),
      badgeCount: daCounts.forMDAProcessing,
    },
    {
      label: "MDA In Progress",
      component: (
        <DAFormMDAForApproval
          searchQuery={debouncedSearchQuery}
          dateFilters={dateFilters}
          filterDataByDate={filterDataByDate}
          filterDataBySearch={filterDataBySearch}
          setQueryParams={setQueryParams}
          currentParams={currentParams}
          onCancel={handleCancel}
        />
      ),
      badgeCount: daCounts.mdaInProgress,
    },
  ];

  const a11yProps = (index) => {
    return {
      id: `daform-tab-${index}`,
      "aria-controls": `daform-tabpanel-${index}`,
    };
  };

  const isLoadingState = isLoading;
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

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <FormProvider {...methods}>
        <Box sx={daFormStyles.mainContainer}>
          <Box sx={daFormStyles.innerContainer}>
            <Box sx={daFormStyles.headerContainer(isMobile, isTablet)}>
              <Box
                sx={daFormStyles.headerLeftSection(
                  isMobile,
                  isTablet,
                  isVerySmall
                )}>
                <Typography
                  className="header"
                  sx={daFormStyles.headerTitle(isVerySmall, isMobile)}>
                  {isVerySmall ? "DA" : "DA Form"}
                </Typography>

                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={handleAddNew}
                  disabled={isLoadingState}
                  sx={daFormStyles.createButton(isVerySmall, isLoadingState)}>
                  {isVerySmall ? "" : "Create"}
                </Button>
              </Box>

              <Box sx={daFormStyles.headerRightSection(isVerySmall)}>
                {isVerySmall ? (
                  <IconButton
                    onClick={handleFilterClick}
                    disabled={isLoadingState}
                    size="small"
                    sx={daFormStyles.filterIconButton(
                      hasActiveFilters,
                      iconColor
                    )}>
                    <CalendarTodayIcon sx={daFormStyles.filterIcon} />
                    {hasActiveFilters && (
                      <Box sx={daFormStyles.filterBadge}>1</Box>
                    )}
                  </IconButton>
                ) : (
                  <Tooltip title="Click here to filter by date range" arrow>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={hasActiveFilters}
                          onChange={handleFilterClick}
                          disabled={isLoadingState}
                          icon={<CalendarTodayIcon sx={{ color: iconColor }} />}
                          checkedIcon={
                            <CalendarTodayIcon sx={{ color: iconColor }} />
                          }
                          size="small"
                        />
                      }
                      label={
                        <Box sx={daFormStyles.filterLabelBox}>
                          <span>{getFilterLabel()}</span>
                        </Box>
                      }
                      sx={daFormStyles.filterCheckboxLabel(hasActiveFilters)}
                    />
                  </Tooltip>
                )}

                <TextField
                  placeholder={isVerySmall ? "Search..." : "Search DA Form..."}
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  disabled={isLoadingState}
                  size="small"
                  InputProps={{
                    startAdornment: (
                      <SearchIcon
                        sx={daFormStyles.searchIcon(
                          isLoadingState,
                          isVerySmall
                        )}
                      />
                    ),
                    endAdornment: isLoadingState && (
                      <CircularProgress
                        size={16}
                        sx={daFormStyles.searchLoader}
                      />
                    ),
                    sx: daFormStyles.searchInputProps(
                      isLoadingState,
                      isVerySmall
                    ),
                  }}
                  sx={daFormStyles.searchField(isVerySmall)}
                />
              </Box>
            </Box>

            <StyledTabs
              value={activeTab}
              onChange={handleTabChange}
              aria-label="DA Form submissions tabs"
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
                        sx={daFormStyles.tabBadge}>
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

            <Box sx={daFormStyles.contentContainer}>
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

          <DAFormModal
            key={`${modalMode}-${selectedEntry?.result?.id || "new"}`}
            open={modalOpen}
            onClose={handleCloseModal}
            onSave={handleSave}
            selectedEntry={selectedEntry}
            isLoading={modalLoading}
            mode={modalMode}
            onModeChange={handleModeChange}
          />
        </Box>
      </FormProvider>
    </LocalizationProvider>
  );
};

export default DAForm;
