import React, { useState, useCallback, useEffect } from "react";
import {
  Box,
  Tabs,
  Tab,
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
  useSaveCatTwoAsDraftMutation,
  useSubmitCatTwoMutation,
} from "../../../features/api/da-task/catTwoApi";
import { format, parseISO, isWithinInterval } from "date-fns";
import CatTwoForAssessment from "./CatTwoForAssessment";
import CatTwoForSubmission from "./CatTwoForSubmission";
import CatTwoForApproval from "./CatTwoForApproval";
import CatTwoReturned from "./CatTwoReturned";
import CatTwoApproved from "./CatTwoApproved";
import { useRememberQueryParams } from "../../../hooks/useRememberQueryParams";
import useDebounce from "../../../hooks/useDebounce";
import CatTwoModal from "../../../components/modal/da-task/CatTwoModal";
import ConfirmationDialog from "../../../styles/ConfirmationDialog";
import {
  catTwoStyles,
  styledTabsConfig,
  styledTabConfig,
} from "./CatTwoStyles";

const StyledTabs = styled(Tabs)(({ theme }) => styledTabsConfig(theme));

const StyledTab = styled(Tab)(({ theme }) => styledTabConfig(theme));

const TabPanel = ({ children, value, index, ...other }) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`cattwo-tabpanel-${index}`}
      aria-labelledby={`cattwo-tab-${index}`}
      style={{
        height: "100%",
        minWidth: 0,
        display: value === index ? "flex" : "none",
        flexDirection: "column",
      }}
      {...other}>
      {value === index && <Box sx={catTwoStyles.tabPanelInner}>{children}</Box>}
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
        sx: catTwoStyles.filterDialog,
      }}>
      <DialogTitle>
        <Box sx={catTwoStyles.filterDialogTitle}>
          <Box sx={catTwoStyles.filterDialogTitleLeft}>
            <CalendarTodayIcon sx={catTwoStyles.filterIcon} />
            <Typography variant="h6" sx={catTwoStyles.filterDialogTitleText}>
              FILTER BY DATE
            </Typography>
          </Box>
          <Button
            size="small"
            variant="outlined"
            onClick={handleClear}
            disabled={!hasFilters}
            sx={catTwoStyles.selectAllButton}>
            Clear All
          </Button>
        </Box>
      </DialogTitle>

      <DialogContent>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <Box sx={catTwoStyles.datePickerContainer}>
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

      <DialogActions sx={catTwoStyles.filterDialogActions}>
        <Box sx={catTwoStyles.dialogActionsContainer}>
          <Box sx={catTwoStyles.dialogButtonsContainer}>
            <Button
              onClick={onClose}
              variant="outlined"
              sx={catTwoStyles.cancelButton}>
              CANCEL
            </Button>
            <Button
              onClick={handleApply}
              variant="contained"
              sx={catTwoStyles.applyFiltersButton}>
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
    <Box sx={catTwoStyles.searchBarContainer(isVerySmall)}>
      {isVerySmall ? (
        <IconButton
          onClick={onFilterClick}
          disabled={isLoading}
          size="small"
          sx={catTwoStyles.filterIconButton(hasActiveFilters, iconColor)}>
          <CalendarTodayIcon sx={catTwoStyles.filterCalendarIcon} />
          {hasActiveFilters && <Box sx={catTwoStyles.filterBadge}>1</Box>}
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
              <Box sx={catTwoStyles.filterLabelBox}>
                <span>{getFilterLabel()}</span>
              </Box>
            }
            sx={catTwoStyles.filterCheckboxLabel(hasActiveFilters)}
          />
        </Tooltip>
      )}

      <TextField
        placeholder={isVerySmall ? "Search..." : "Search CAT 2..."}
        value={searchQuery}
        onChange={handleSearchChange}
        disabled={isLoading}
        size="small"
        InputProps={{
          startAdornment: (
            <SearchIcon sx={catTwoStyles.searchIcon(isLoading, isVerySmall)} />
          ),
          endAdornment: isLoading && (
            <CircularProgress size={16} sx={catTwoStyles.searchProgress} />
          ),
          sx: catTwoStyles.searchInputProps(isVerySmall),
        }}
        sx={catTwoStyles.searchTextField(isVerySmall)}
      />
    </Box>
  );
};

const CatTwo = () => {
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
  const [modalMode, setModalMode] = useState("create");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [pendingFormData, setPendingFormData] = useState(null);
  const [confirmItemName, setConfirmItemName] = useState("");

  const [saveCatTwoAsDraft] = useSaveCatTwoAsDraftMutation();
  const [submitCatTwo] = useSubmitCatTwoMutation();

  const debouncedSearchQuery = useDebounce(searchQuery, 500);

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
    setPendingFormData(null);
    setConfirmAction(null);
  }, []);

  const handleModalSave = useCallback(async (formData, mode, entryId) => {
    setPendingFormData({ formData, mode, entryId });
    setConfirmAction("submit");
    setConfirmOpen(true);
    return false;
  }, []);

  const handleSaveAsDraft = useCallback(async (data, entryId) => {
    setPendingFormData({ data, entryId });
    setConfirmAction("draft");
    setConfirmOpen(true);
    return false;
  }, []);

  const handleConfirmationRequest = useCallback(
    (action, itemName, formData) => {
      console.log("Confirmation Request:", { action, itemName, formData });
      setConfirmAction(action);
      setConfirmItemName(itemName);
      setPendingFormData(formData);
      setConfirmOpen(true);
    },
    []
  );

  const handleActionConfirm = async () => {
    if (!confirmAction || !pendingFormData) return;

    setIsLoading(true);

    try {
      console.log("Confirming action:", confirmAction);
      console.log("Pending form data:", pendingFormData);

      if (confirmAction === "draft") {
        await saveCatTwoAsDraft({
          taskId: pendingFormData.entryId || pendingFormData.taskId,
          ...(pendingFormData.data || pendingFormData.formData),
        }).unwrap();
        enqueueSnackbar("CAT 2 saved as draft successfully!", {
          variant: "success",
          autoHideDuration: 2000,
        });
      } else if (confirmAction === "submit") {
        await submitCatTwo({
          taskId: pendingFormData.entryId || pendingFormData.taskId,
          ...(pendingFormData.data || pendingFormData.formData),
        }).unwrap();
        enqueueSnackbar("CAT 2 submitted successfully!", {
          variant: "success",
          autoHideDuration: 2000,
        });
      } else if (confirmAction === "update") {
        console.log("Update data being sent:", {
          taskId: pendingFormData.taskId,
          ...pendingFormData.data,
        });
        await submitCatTwo({
          taskId: pendingFormData.taskId,
          ...pendingFormData.data,
        }).unwrap();
        enqueueSnackbar("CAT 2 updated successfully!", {
          variant: "success",
          autoHideDuration: 2000,
        });
      } else if (confirmAction === "approve") {
        await submitCatTwo({
          taskId: pendingFormData.taskId,
          ...pendingFormData.data,
        }).unwrap();
        enqueueSnackbar("CAT 2 approved successfully!", {
          variant: "success",
          autoHideDuration: 2000,
        });
      } else if (confirmAction === "reject") {
        await submitCatTwo({
          taskId: pendingFormData.taskId,
          ...pendingFormData.data,
        }).unwrap();
        enqueueSnackbar("CAT 2 rejected successfully!", {
          variant: "success",
          autoHideDuration: 2000,
        });
      } else if (confirmAction === "resubmit") {
        await submitCatTwo({
          taskId: pendingFormData.taskId,
          ...(pendingFormData.data || pendingFormData.formData),
        }).unwrap();
        enqueueSnackbar("CAT 2 resubmitted successfully!", {
          variant: "success",
          autoHideDuration: 2000,
        });
      } else if (confirmAction === "cancel") {
        enqueueSnackbar("CAT 2 cancelled successfully!", {
          variant: "success",
          autoHideDuration: 2000,
        });
      }

      handleRefreshDetails();
      setModalOpen(false);
      setSelectedEntry(null);

      if (pendingFormData.onSuccess) {
        pendingFormData.onSuccess();
      }
    } catch (error) {
      let errorMessage = `Failed to ${confirmAction}. Please try again.`;

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
      setConfirmOpen(false);
      setPendingFormData(null);
      setConfirmAction(null);
      setConfirmItemName("");
      setIsLoading(false);
    }
  };

  const handleConfirmationCancel = useCallback(() => {
    setConfirmOpen(false);
    setPendingFormData(null);
    setConfirmAction(null);
    setConfirmItemName("");
  }, []);

  const handleResubmit = useCallback(
    async (entryId) => {
      try {
        await submitCatTwo({
          taskId: entryId,
          action: "resubmit",
        }).unwrap();
        enqueueSnackbar("CAT 2 resubmitted successfully!", {
          variant: "success",
          autoHideDuration: 2000,
        });
        handleRefreshDetails();
        return true;
      } catch (error) {
        enqueueSnackbar("Failed to resubmit. Please try again.", {
          variant: "error",
          autoHideDuration: 3000,
        });
        return false;
      }
    },
    [submitCatTwo, enqueueSnackbar, handleRefreshDetails]
  );

  const handleCancel = useCallback(
    async (entryId, cancellationReason = "") => {
      try {
        enqueueSnackbar("CAT 2 cancelled successfully!", {
          variant: "success",
          autoHideDuration: 2000,
        });

        handleRefreshDetails();
        return true;
      } catch (error) {
        let errorMessage = "Failed to cancel CAT 2. Please try again.";

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

  const getSubmissionDisplayName = useCallback(() => {
    if (confirmItemName) return confirmItemName;
    return selectedEntry?.reference_number || "CAT 2 Submission";
  }, [selectedEntry, confirmItemName]);

  const tabsData = [
    {
      label: "For Assessment",
      component: (
        <CatTwoForAssessment
          searchQuery={debouncedSearchQuery}
          dateFilters={dateFilters}
          filterDataByDate={filterDataByDate}
          filterDataBySearch={filterDataBySearch}
          setQueryParams={setQueryParams}
          currentParams={currentParams}
          onCancel={handleCancel}
          onRowClick={handleRowClick}
          onConfirmationRequest={handleConfirmationRequest}
        />
      ),
      badgeCount: null,
    },
    {
      label: "For Submission",
      component: (
        <CatTwoForSubmission
          searchQuery={debouncedSearchQuery}
          dateFilters={dateFilters}
          filterDataByDate={filterDataByDate}
          filterDataBySearch={filterDataBySearch}
          setQueryParams={setQueryParams}
          currentParams={currentParams}
          onCancel={handleCancel}
          onRowClick={handleRowClick}
          onConfirmationRequest={handleConfirmationRequest}
        />
      ),
      badgeCount: null,
    },
    {
      label: "For Approval",
      component: (
        <CatTwoForApproval
          searchQuery={debouncedSearchQuery}
          dateFilters={dateFilters}
          filterDataByDate={filterDataByDate}
          filterDataBySearch={filterDataBySearch}
          setQueryParams={setQueryParams}
          currentParams={currentParams}
          onCancel={handleCancel}
          onRowClick={handleRowClick}
          onConfirmationRequest={handleConfirmationRequest}
        />
      ),
      badgeCount: null,
    },
    {
      label: "Returned",
      component: (
        <CatTwoReturned
          searchQuery={debouncedSearchQuery}
          dateFilters={dateFilters}
          filterDataByDate={filterDataByDate}
          filterDataBySearch={filterDataBySearch}
          setQueryParams={setQueryParams}
          currentParams={currentParams}
          onCancel={handleCancel}
          onRowClick={handleRowClick}
          onConfirmationRequest={handleConfirmationRequest}
        />
      ),
      badgeCount: null,
    },
    {
      label: "Approved",
      component: (
        <CatTwoApproved
          searchQuery={debouncedSearchQuery}
          dateFilters={dateFilters}
          filterDataByDate={filterDataByDate}
          filterDataBySearch={filterDataBySearch}
          setQueryParams={setQueryParams}
          currentParams={currentParams}
          onCancel={handleCancel}
          onRowClick={handleRowClick}
          onConfirmationRequest={handleConfirmationRequest}
        />
      ),
      badgeCount: null,
    },
  ];

  const a11yProps = (index) => {
    return {
      id: `cattwo-tab-${index}`,
      "aria-controls": `cattwo-tabpanel-${index}`,
    };
  };

  const isLoadingState = isLoading;

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <FormProvider {...methods}>
        <Box sx={catTwoStyles.mainContainer}>
          <Box sx={catTwoStyles.innerContainer}>
            <Box sx={catTwoStyles.headerContainer(isMobile, isTablet)}>
              <Typography
                className="header"
                sx={catTwoStyles.headerTitle(isVerySmall, isMobile)}>
                CAT 2
              </Typography>

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
              aria-label="CAT 2 tabs"
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
                        sx={catTwoStyles.badgeStyle}>
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

            <Box sx={catTwoStyles.tabPanelContainer}>
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

          <CatTwoModal
            open={modalOpen}
            onClose={handleModalClose}
            onSave={handleModalSave}
            onSaveAsDraft={handleSaveAsDraft}
            onResubmit={handleResubmit}
            selectedEntry={selectedEntry}
            isLoading={isLoading}
            mode={modalMode}
            onModeChange={setModalMode}
            onRefreshDetails={handleRefreshDetails}
          />

          <ConfirmationDialog
            open={confirmOpen}
            onClose={handleConfirmationCancel}
            onConfirm={handleActionConfirm}
            isLoading={isLoading}
            action={confirmAction}
            itemName={getSubmissionDisplayName()}
            module="CAT 2 Assessment"
          />
        </Box>
      </FormProvider>
    </LocalizationProvider>
  );
};

export default CatTwo;
