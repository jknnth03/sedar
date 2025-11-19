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
import {
  useCreateDataChangeSubmissionMutation,
  useUpdateDataChangeSubmissionMutation,
  useResubmitDataChangeSubmissionMutation,
} from "../../../features/api/forms/datachangeApi";
import { useShowDashboardQuery } from "../../../features/api/usermanagement/dashboardApi";
import { useCancelFormSubmissionMutation } from "../../../features/api/approvalsetting/formSubmissionApi";
import { format, parseISO, isWithinInterval } from "date-fns";
import { useRememberQueryParams } from "../../../hooks/useRememberQueryParams";
import useDebounce from "../../../hooks/useDebounce";

import DataChangeForapproval from "./DataChangeForapproval";
import DataChangeAwaitingResubmission from "./DataChangeAwaitingResubmission";
import DataChangeRejected from "./DataChangeRejected";
import DataChangeCompleted from "./DataChangeCompleted";
import DataChangeCancelled from "./DataChangeCancelled";
import DataChangeModal from "../../../components/modal/form/DataChange/DataChangeModal";
import DataChangeForMDAProcessing from "./DataChangeForMDAProcessing";
import DataChangeMDAInProgress from "./DataChangeMDAInProgress";

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

const StyledTab = styled((props) => <Tab disableRipple {...props} />)(
  ({ theme }) => ({
    textTransform: "uppercase",
    minWidth: 0,
    fontWeight: 600,
    fontSize: "0.875rem",
    marginRight: theme.spacing(1),
    color: "#666",
    padding: "12px 16px",
    "&:hover": {
      color: theme.palette.primary.main,
      opacity: 1,
    },
    "&.Mui-selected": {
      color: theme.palette.primary.main,
      fontWeight: 700,
    },
    "&.Mui-focusVisible": {
      backgroundColor: "rgba(100, 95, 228, 0.32)",
    },
  })
);

const TabPanel = ({ children, value, index, ...other }) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`datachange-tabpanel-${index}`}
      aria-labelledby={`datachange-tab-${index}`}
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
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: isVerySmall ? 1 : 1.5,
      }}>
      {isVerySmall ? (
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
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 0.5,
                }}>
                <span>{getFilterLabel()}</span>
              </Box>
            }
            sx={{
              margin: 0,
              border: `1px solid ${
                hasActiveFilters ? "rgba(0, 133, 49, 1)" : "#ccc"
              }`,
              borderRadius: "8px",
              paddingLeft: "8px",
              paddingRight: "12px",
              height: "36px",
              backgroundColor: hasActiveFilters
                ? "rgba(0, 133, 49, 0.04)"
                : "white",
              transition: "all 0.2s ease-in-out",
              "&:hover": {
                backgroundColor: hasActiveFilters
                  ? "rgba(0, 133, 49, 0.08)"
                  : "#f5f5f5",
                borderColor: hasActiveFilters
                  ? "rgba(0, 133, 49, 1)"
                  : "rgb(33, 61, 112)",
              },
              "& .MuiFormControlLabel-label": {
                fontSize: "12px",
                fontWeight: 600,
                color: hasActiveFilters
                  ? "rgba(0, 133, 49, 1)"
                  : "rgb(33, 61, 112)",
                letterSpacing: "0.5px",
              },
            }}
          />
        </Tooltip>
      )}

      <TextField
        placeholder={isVerySmall ? "Search..." : "Search 201 data change..."}
        value={searchQuery}
        onChange={handleSearchChange}
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
            <CircularProgress
              size={16}
              sx={{ marginLeft: 1, color: "rgb(33, 61, 112)" }}
            />
          ),
          sx: {
            height: "36px",
            width: isVerySmall ? "100%" : "320px",
            minWidth: isVerySmall ? "160px" : "200px",
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

const DataChangeMainContainer = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.between(600, 1038));
  const isVerySmall = useMediaQuery("(max-width:369px)");
  const { enqueueSnackbar } = useSnackbar();
  const methods = useForm();

  const [currentParams, setQueryParams] = useRememberQueryParams();

  const { data: dashboardData } = useShowDashboardQuery();
  const dataChangeCounts = {
    forApproval: dashboardData?.result?.requisition?.data_change_approval || 0,
    awaitingResubmission:
      dashboardData?.result?.requisition?.data_change_awaiting_resubmission ||
      0,
    rejected: dashboardData?.result?.requisition?.data_change_rejected || 0,
    cancelled: 0,
    forMDAProcessing:
      dashboardData?.result?.requisition?.data_change_for_mda_processing || 0,
    mdaForApproval: dashboardData?.result?.approval?.mda_approval || 0,
    completed: 0,
  };

  const tabMap = {
    0: "ForApproval",
    1: "AwaitingResubmission",
    2: "Rejected",
    3: "Cancelled",
    4: "ForMDAProcessing",
    5: "MDAForApproval",
    6: "Completed",
  };

  const reverseTabMap = {
    ForApproval: 0,
    AwaitingResubmission: 1,
    Rejected: 2,
    Cancelled: 3,
    ForMDAProcessing: 4,
    MDAForApproval: 5,
    Completed: 6,
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

  const [createDataChangeSubmission] = useCreateDataChangeSubmissionMutation();
  const [updateDataChangeSubmission] = useUpdateDataChangeSubmissionMutation();
  const [cancelDataChangeSubmission] = useCancelFormSubmissionMutation();
  const [resubmitDataChangeSubmission] =
    useResubmitDataChangeSubmissionMutation();

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

  const handleRefreshDetails = useCallback(() => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 500);
  }, []);

  const handleRowClick = useCallback((entry) => {
    setSelectedEntry({ result: entry });
    setModalMode("view");
    setModalOpen(true);
  }, []);

  const handleCancel = useCallback(
    async (entryId, cancellationReason = "") => {
      try {
        await cancelDataChangeSubmission(entryId).unwrap();

        enqueueSnackbar("201 data change cancelled successfully!", {
          variant: "success",
          autoHideDuration: 2000,
        });

        handleRefreshDetails();
        return true;
      } catch (error) {
        let errorMessage =
          "Failed to cancel 201 data change. Please try again.";

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
    [cancelDataChangeSubmission, enqueueSnackbar, handleRefreshDetails]
  );

  const handleResubmit = useCallback(
    async (entryId) => {
      try {
        await resubmitDataChangeSubmission(entryId).unwrap();

        enqueueSnackbar("201 data change resubmitted successfully!", {
          variant: "success",
          autoHideDuration: 2000,
        });

        handleRefreshDetails();
        handleCloseModal();
        return true;
      } catch (error) {
        let errorMessage =
          "Failed to resubmit 201 data change. Please try again.";

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
    [
      resubmitDataChangeSubmission,
      enqueueSnackbar,
      handleRefreshDetails,
      handleCloseModal,
    ]
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

          result = await updateDataChangeSubmission({
            id: entryId,
            data: formData,
          }).unwrap();

          enqueueSnackbar("201 data change updated successfully!", {
            variant: "success",
            autoHideDuration: 2000,
          });
        } else {
          result = await createDataChangeSubmission(formData).unwrap();

          enqueueSnackbar("201 data change created successfully!", {
            variant: "success",
            autoHideDuration: 2000,
          });
        }

        handleCloseModal();
        handleRefreshDetails();
      } catch (error) {
        let errorMessage =
          mode === "edit"
            ? "Failed to update 201 data change. Please try again."
            : "Failed to create 201 data change. Please try again.";

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
    [
      createDataChangeSubmission,
      updateDataChangeSubmission,
      enqueueSnackbar,
      handleCloseModal,
      handleRefreshDetails,
    ]
  );

  const tabsData = [
    {
      label: "For Approval",
      component: (
        <DataChangeForapproval
          searchQuery={debouncedSearchQuery}
          dateFilters={dateFilters}
          filterDataByDate={filterDataByDate}
          filterDataBySearch={filterDataBySearch}
          setQueryParams={setQueryParams}
          currentParams={currentParams}
          onCancel={handleCancel}
          onRowClick={handleRowClick}
        />
      ),
      badgeCount: dataChangeCounts.forApproval,
    },
    {
      label: "Awaiting Resubmission",
      component: (
        <DataChangeAwaitingResubmission
          searchQuery={debouncedSearchQuery}
          dateFilters={dateFilters}
          filterDataByDate={filterDataByDate}
          filterDataBySearch={filterDataBySearch}
          setQueryParams={setQueryParams}
          currentParams={currentParams}
          onCancel={handleCancel}
          onRowClick={handleRowClick}
        />
      ),
      badgeCount: dataChangeCounts.awaitingResubmission,
    },
    {
      label: "Rejected",
      component: (
        <DataChangeRejected
          searchQuery={debouncedSearchQuery}
          dateFilters={dateFilters}
          filterDataByDate={filterDataByDate}
          filterDataBySearch={filterDataBySearch}
          setQueryParams={setQueryParams}
          currentParams={currentParams}
          onCancel={handleCancel}
          onRowClick={handleRowClick}
        />
      ),
      badgeCount: dataChangeCounts.rejected,
    },
    {
      label: "Cancelled",
      component: (
        <DataChangeCancelled
          searchQuery={debouncedSearchQuery}
          dateFilters={dateFilters}
          filterDataByDate={filterDataByDate}
          filterDataBySearch={filterDataBySearch}
          setQueryParams={setQueryParams}
          currentParams={currentParams}
          onRowClick={handleRowClick}
        />
      ),
      badgeCount: dataChangeCounts.cancelled,
    },
    {
      label: "For MDA Processing",
      component: (
        <DataChangeForMDAProcessing
          searchQuery={debouncedSearchQuery}
          dateFilters={dateFilters}
          filterDataByDate={filterDataByDate}
          filterDataBySearch={filterDataBySearch}
          setQueryParams={setQueryParams}
          currentParams={currentParams}
          onCancel={handleCancel}
          onRowClick={handleRowClick}
        />
      ),
      badgeCount: dataChangeCounts.forMDAProcessing,
    },
    {
      label: "MDA In Progress",
      component: (
        <DataChangeMDAInProgress
          searchQuery={debouncedSearchQuery}
          dateFilters={dateFilters}
          filterDataByDate={filterDataByDate}
          filterDataBySearch={filterDataBySearch}
          setQueryParams={setQueryParams}
          currentParams={currentParams}
          onCancel={handleCancel}
          onRowClick={handleRowClick}
        />
      ),
      badgeCount: dataChangeCounts.mdaForApproval,
    },
    {
      label: "Completed",
      component: (
        <DataChangeCompleted
          searchQuery={debouncedSearchQuery}
          dateFilters={dateFilters}
          filterDataByDate={filterDataByDate}
          filterDataBySearch={filterDataBySearch}
          setQueryParams={setQueryParams}
          currentParams={currentParams}
          onCancel={handleCancel}
          onRowClick={handleRowClick}
        />
      ),
      badgeCount: dataChangeCounts.completed,
    },
  ];

  const a11yProps = (index) => {
    return {
      id: `datachange-tab-${index}`,
      "aria-controls": `datachange-tabpanel-${index}`,
    };
  };

  const isLoadingState = isLoading;

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
                padding: isMobile
                  ? "12px 14px"
                  : isTablet
                  ? "16px"
                  : "16px 14px",
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
                  {isVerySmall ? "DATA CHANGE" : "201 DATA CHANGE"}
                </Typography>
                <Fade in={!isLoadingState}>
                  {isVerySmall ? (
                    <IconButton
                      onClick={handleAddNew}
                      disabled={isLoadingState}
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
                      onClick={handleAddNew}
                      startIcon={<AddIcon />}
                      disabled={isLoadingState}
                      sx={{
                        backgroundColor: "rgb(33, 61, 112)",
                        height: isMobile ? "36px" : "38px",
                        width: isMobile ? "auto" : "160px",
                        minWidth: isMobile ? "120px" : "160px",
                        padding: isMobile ? "0 16px" : "0 20px",
                        fontSize: "12px",
                        fontWeight: 600,
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
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
                      {isMobile ? "NEW" : "NEW ENTRY"}
                    </Button>
                  )}
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

            <StyledTabs
              value={activeTab}
              onChange={handleTabChange}
              aria-label="MDA submissions tabs"
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
                        sx={{
                          "& .MuiBadge-dot": {
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

          <DataChangeModal
            open={modalOpen}
            onClose={handleCloseModal}
            mode={modalMode}
            onModeChange={handleModeChange}
            selectedEntry={selectedEntry}
            onSave={handleSave}
            onCancel={handleCancel}
            onResubmit={handleResubmit}
            isLoading={modalLoading}
            methods={methods}
          />
        </Box>
      </FormProvider>
    </LocalizationProvider>
  );
};

export default DataChangeMainContainer;
