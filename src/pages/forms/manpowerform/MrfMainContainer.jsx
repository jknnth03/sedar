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
  CircularProgress,
  useMediaQuery,
  IconButton,
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
import {
  styles,
  styledTabsConfig,
  styledTabConfig,
} from "./MrfMainContainerStyles";
import {
  useCreateFormSubmissionMutation,
  useGetMrfSubmissionsQuery,
  useGetMrfSubmissionsCountsQuery,
} from "../../../features/api/approvalsetting/formSubmissionApi";
import FormSubmission from "./FormSubmission";
import MrfRejected from "./MrfRejected";
import MrfAwaiting from "./MrfAwaiting";
import MrfForreceiving from "./MrfForreceiving";
import MrfReturned from "./MrfReturned";
import MrfReceived from "./MrfReceived";
import MrfCancelled from "./MrfCancelled";
import FormSubmissionModal from "../../../components/modal/form/ManpowerForm/FormSubmissionModal";
import { format } from "date-fns";

const StyledTabs = styled(Tabs)(({ theme }) => styledTabsConfig(theme));

const StyledTab = styled(Tab)(({ theme }) => styledTabConfig(theme));

const TabPanel = ({ children, value, index, ...other }) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`mrf-tabpanel-${index}`}
      aria-labelledby={`mrf-tab-${index}`}
      style={styles.tabPanel}
      {...other}>
      {value === index && <Box sx={styles.tabPanelBox}>{children}</Box>}
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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isVerySmall = useMediaQuery("(max-width:369px)");

  const hasActiveFilters = dateFilters.startDate || dateFilters.endDate;
  const filterIconColor = hasActiveFilters ? "#1976d2" : "#666";

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
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: isVerySmall ? 1 : 1.5,
        width: isMobile ? "100%" : "auto",
      }}>
      <Tooltip title="Click here to filter by date range" arrow>
        {isVerySmall ? (
          <IconButton
            onClick={onFilterClick}
            disabled={isLoading}
            size="small"
            sx={{
              width: "36px",
              height: "36px",
              border: `1px solid ${hasActiveFilters ? "#1976d2" : "#ccc"}`,
              borderRadius: "8px",
              backgroundColor: hasActiveFilters
                ? "rgba(25, 118, 210, 0.04)"
                : "white",
              color: filterIconColor,
              transition: "all 0.2s ease-in-out",
              "&:hover": {
                backgroundColor: hasActiveFilters
                  ? "rgba(25, 118, 210, 0.08)"
                  : "#f5f5f5",
                borderColor: hasActiveFilters ? "#1976d2" : "#1976d2",
              },
            }}>
            <CalendarTodayIcon sx={{ fontSize: "18px" }} />
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
              <Box sx={styles.filterLabelBox}>
                <span>{getFilterLabel()}</span>
              </Box>
            }
            sx={{
              margin: 0,
              border: `1px solid ${hasActiveFilters ? "#1976d2" : "#ccc"}`,
              borderRadius: "8px",
              paddingLeft: "8px",
              paddingRight: "12px",
              height: "36px",
              backgroundColor: hasActiveFilters
                ? "rgba(25, 118, 210, 0.04)"
                : "white",
              transition: "all 0.2s ease-in-out",
              "&:hover": {
                backgroundColor: hasActiveFilters
                  ? "rgba(25, 118, 210, 0.08)"
                  : "#f5f5f5",
                borderColor: hasActiveFilters ? "#1976d2" : "#1976d2",
              },
              "& .MuiFormControlLabel-label": {
                fontSize: "12px",
                fontWeight: 600,
                color: filterIconColor,
                letterSpacing: "0.5px",
              },
              "& .MuiCheckbox-root": {
                padding: "6px",
                color: filterIconColor,
                "&:hover": {
                  backgroundColor: "rgba(25, 118, 210, 0.04)",
                },
              },
            }}
          />
        )}
      </Tooltip>

      <TextField
        placeholder={isVerySmall ? "Search..." : "Search form..."}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
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
            <CircularProgress size={16} sx={{ marginLeft: 1 }} />
          ),
          sx: {
            height: "36px",
            width: isVerySmall ? "100%" : isMobile ? "100%" : "320px",
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
                borderColor: "#1976d2",
              },
              "&.Mui-focused fieldset": {
                borderColor: "#1976d2",
                borderWidth: "2px",
              },
              "&.Mui-disabled": {
                backgroundColor: "#f5f5f5",
              },
            },
          },
        }}
        sx={{
          flex: isVerySmall || isMobile ? 1 : "0 0 auto",
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

const MrfMainContainer = () => {
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();
  const methods = useForm();

  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.between(600, 1038));
  const isVerySmall = useMediaQuery("(max-width:369px)");

  const [activeTab, setActiveTab] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
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
  const { data: countsData, isLoading: countsLoading } =
    useGetMrfSubmissionsCountsQuery();

  const debounceValue = useDebounce(searchQuery, 500);

  const formatDateForAPI = (date) => {
    return date ? format(date, "yyyy-MM-dd") : null;
  };

  const mrfQueryParams = useMemo(
    () => ({
      pagination: false,
      search: debounceValue,
      start_date: formatDateForAPI(dateFilters.startDate),
      end_date: formatDateForAPI(dateFilters.endDate),
    }),
    [debounceValue, dateFilters.startDate, dateFilters.endDate]
  );

  const {
    data: mrfSubmissions,
    isLoading: mrfSubmissionsLoading,
    refetch: refetchMrfSubmissions,
  } = useGetMrfSubmissionsQuery(mrfQueryParams);

  useEffect(() => {
    setIsLoading(mrfSubmissionsLoading);
  }, [mrfSubmissionsLoading]);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleSearchChange = useCallback((newSearchQuery) => {
    setSearchQuery(newSearchQuery);
  }, []);

  const handleFilterClick = useCallback(() => {
    setFilterDialogOpen(true);
  }, []);

  const handleDateFiltersChange = useCallback((newDateFilters) => {
    setDateFilters(newDateFilters);
  }, []);

  const handleAddNew = useCallback(() => {
    setSelectedEntry(null);
    setModalMode("create");
    setFormModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setFormModalOpen(false);
    setSelectedEntry(null);
    setModalMode("create");
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

      refetchMrfSubmissions();
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
  }, [
    pendingFormData,
    createSubmission,
    enqueueSnackbar,
    handleCloseModal,
    refetchMrfSubmissions,
  ]);

  const handleResubmit = useCallback(
    async (submissionId) => {
      setFormIsLoading(true);

      try {
        await new Promise((resolve) => setTimeout(resolve, 1000));

        enqueueSnackbar("Form resubmitted successfully!", {
          variant: "success",
        });

        refetchMrfSubmissions();
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
    [enqueueSnackbar, refetchMrfSubmissions]
  );

  const getBadgeCount = useCallback(
    (status) => {
      if (!countsData?.result) return null;
      return countsData.result[status] || null;
    },
    [countsData]
  );

  const getFilteredSubmissionsByStatus = useCallback(
    (status) => {
      if (!mrfSubmissions?.data) return [];
      return mrfSubmissions.data.filter((submission) => {
        if (status === "pending") {
          return submission.approval_status === "pending";
        }
        if (status === "awaiting_resubmission") {
          return submission.approval_status === "awaiting_resubmission";
        }
        if (status === "rejected") {
          return submission.approval_status === "rejected";
        }
        if (status === "for_receiving") {
          return (
            submission.approval_status === "approved" &&
            submission.status !== "received"
          );
        }
        if (status === "returned") {
          return submission.approval_status === "returned";
        }
        if (status === "received") {
          return submission.status === "received";
        }
        if (status === "cancelled") {
          return submission.status === "cancelled";
        }
        return false;
      });
    },
    [mrfSubmissions]
  );

  const tabsData = [
    {
      label: "For Approval",
      component: (
        <FormSubmission
          searchQuery={debounceValue}
          startDate={formatDateForAPI(dateFilters.startDate)}
          endDate={formatDateForAPI(dateFilters.endDate)}
          submissions={getFilteredSubmissionsByStatus("pending")}
          isLoading={mrfSubmissionsLoading}
        />
      ),
      badgeCount: getBadgeCount("pending"),
    },
    {
      label: "Awaiting Resubmission",
      component: (
        <MrfAwaiting
          searchQuery={debounceValue}
          startDate={formatDateForAPI(dateFilters.startDate)}
          endDate={formatDateForAPI(dateFilters.endDate)}
          submissions={getFilteredSubmissionsByStatus("awaiting_resubmission")}
          isLoading={mrfSubmissionsLoading}
        />
      ),
      badgeCount: getBadgeCount("awaiting_resubmission"),
    },
    {
      label: "Rejected",
      component: (
        <MrfRejected
          searchQuery={debounceValue}
          startDate={formatDateForAPI(dateFilters.startDate)}
          endDate={formatDateForAPI(dateFilters.endDate)}
          submissions={getFilteredSubmissionsByStatus("rejected")}
          isLoading={mrfSubmissionsLoading}
        />
      ),
      badgeCount: getBadgeCount("rejected"),
    },
    {
      label: "For Receiving",
      component: (
        <MrfForreceiving
          searchQuery={debounceValue}
          startDate={formatDateForAPI(dateFilters.startDate)}
          endDate={formatDateForAPI(dateFilters.endDate)}
          submissions={getFilteredSubmissionsByStatus("for_receiving")}
          isLoading={mrfSubmissionsLoading}
        />
      ),
      badgeCount: getBadgeCount("for_receiving"),
    },
    {
      label: "Returned",
      component: (
        <MrfReturned
          searchQuery={debounceValue}
          startDate={formatDateForAPI(dateFilters.startDate)}
          endDate={formatDateForAPI(dateFilters.endDate)}
          submissions={getFilteredSubmissionsByStatus("returned")}
          isLoading={mrfSubmissionsLoading}
        />
      ),
      badgeCount: getBadgeCount("returned"),
    },
    {
      label: "Received",
      component: (
        <MrfReceived
          searchQuery={debounceValue}
          startDate={formatDateForAPI(dateFilters.startDate)}
          endDate={formatDateForAPI(dateFilters.endDate)}
          submissions={getFilteredSubmissionsByStatus("received")}
          isLoading={mrfSubmissionsLoading}
        />
      ),
      badgeCount: getBadgeCount("received"),
    },
    {
      label: "Cancelled",
      component: (
        <MrfCancelled
          searchQuery={debounceValue}
          startDate={formatDateForAPI(dateFilters.startDate)}
          endDate={formatDateForAPI(dateFilters.endDate)}
          submissions={getFilteredSubmissionsByStatus("cancelled")}
          isLoading={mrfSubmissionsLoading}
        />
      ),
      badgeCount: getBadgeCount("cancelled"),
    },
  ];

  const a11yProps = (index) => {
    return {
      id: `mrf-tab-${index}`,
      "aria-controls": `mrf-tabpanel-${index}`,
    };
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <FormProvider {...methods}>
        <Box sx={styles.mainContainer}>
          <Box sx={styles.contentContainer}>
            <Paper elevation={0} sx={styles.headerPaper}>
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
                    : "16px 24px",
                  backgroundColor: "white",
                  borderBottom: "1px solid #e0e0e0",
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
                  <Typography className="header">
                    {isVerySmall ? "MANPOWER FORM" : "MANPOWER FORM"}
                  </Typography>
                  <Fade in={!isLoading}>
                    {isVerySmall ? (
                      <IconButton
                        onClick={handleAddNew}
                        disabled={isLoading}
                        sx={{
                          backgroundColor: "#1976d2",
                          color: "white",
                          width: "36px",
                          height: "36px",
                          borderRadius: "8px",
                          boxShadow: "0 2px 8px rgba(25, 118, 210, 0.2)",
                          transition: "all 0.2s ease-in-out",
                          "&:hover": {
                            backgroundColor: "#1565c0",
                            boxShadow: "0 4px 12px rgba(25, 118, 210, 0.3)",
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
                        disabled={isLoading}
                        sx={{
                          backgroundColor: "#1976d2",
                          height: isMobile ? "36px" : "38px",
                          width: isMobile ? "auto" : "140px",
                          minWidth: isMobile ? "100px" : "140px",
                          padding: isMobile ? "0 16px" : "0 20px",
                          textTransform: "uppercase",
                          fontWeight: 600,
                          fontSize: isMobile ? "12px" : "14px",
                          borderRadius: "8px",
                          boxShadow: "0 2px 8px rgba(25, 118, 210, 0.2)",
                          transition: "all 0.2s ease-in-out",
                          "& .MuiButton-startIcon": {
                            marginRight: isMobile ? "4px" : "8px",
                          },
                          "&:hover": {
                            backgroundColor: "#1565c0",
                            boxShadow: "0 4px 12px rgba(25, 118, 210, 0.3)",
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
            </Paper>

            <StyledTabs
              value={activeTab}
              onChange={handleTabChange}
              aria-label="MRF management tabs"
              variant="scrollable"
              scrollButtons="auto"
              allowScrollButtonsMobile
              sx={{
                "& .MuiTab-root": {
                  fontSize: isVerySmall ? "11px" : "13px",
                  minHeight: "56px",
                  padding: isVerySmall ? "12px 8px" : "12px 16px",
                },
              }}>
              {tabsData.map((tab, index) => (
                <StyledTab
                  key={index}
                  label={
                    tab.badgeCount && tab.badgeCount > 0 ? (
                      <Badge
                        badgeContent={tab.badgeCount}
                        color="error"
                        sx={styles.badgeTab}>
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

            <Box sx={styles.tabsContainer}>
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
