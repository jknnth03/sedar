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
import { styles } from "./FormSubmissionStyles";
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
import FormSubmissionModal from "../../../components/modal/approvalSettings/FormSubmissionModal";
import { format } from "date-fns";

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
          sx={styles.filterControlLabel(hasActiveFilters)}
        />
      </Tooltip>

      <TextField
        placeholder="Search form..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        disabled={isLoading}
        size="small"
        InputProps={{
          startAdornment: <SearchIcon sx={styles.searchIcon(isLoading)} />,
          endAdornment: isLoading && (
            <CircularProgress size={16} sx={styles.searchProgress} />
          ),
          sx: styles.searchInputProps(isLoading),
        }}
        sx={styles.searchTextField}
      />
    </Box>
  );
};

const MrfMainContainer = () => {
  const theme = useTheme();
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
                  <Typography className="header">MANPOWER FORM</Typography>
                  <Fade in={!isLoading}>
                    <Button
                      variant="contained"
                      onClick={handleAddNew}
                      startIcon={<AddIcon />}
                      disabled={isLoading}
                      sx={styles.createButton}>
                      CREATE
                    </Button>
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
              allowScrollButtonsMobile>
              {tabsData.map((tab, index) => (
                <StyledTab
                  key={index}
                  label={
                    tab.badgeCount && tab.badgeCount > 0 ? (
                      <Badge
                        badgeContent={tab.badgeCount}
                        color="error"
                        sx={{
                          "& .MuiBadge-badge": {
                            fontSize: "0.55rem",
                            minWidth: 14,
                            height: 14,
                            borderRadius: "50%",
                            top: -2,
                            right: -6,
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

          <Dialog
            open={confirmOpen}
            onClose={() => setConfirmOpen(false)}
            maxWidth="xs"
            fullWidth
            PaperProps={{
              sx: {
                borderRadius: 3,
                padding: 2,
                boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
                textAlign: "center",
              },
            }}>
            <DialogTitle sx={{ padding: 0, marginBottom: 2 }}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  marginBottom: 2,
                }}>
                <Box
                  sx={{
                    width: 60,
                    height: 60,
                    borderRadius: "50%",
                    backgroundColor: "#ff4400",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}>
                  <Typography
                    sx={{
                      color: "white",
                      fontSize: "30px",
                      fontWeight: "normal",
                    }}>
                    ?
                  </Typography>
                </Box>
              </Box>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 600,
                  color: "rgb(25, 45, 84)",
                  marginBottom: 0,
                }}>
                Confirmation
              </Typography>
            </DialogTitle>
            <DialogContent sx={{ padding: 0, textAlign: "center" }}>
              <Typography
                variant="body1"
                sx={{
                  marginBottom: 2,
                  fontSize: "16px",
                  color: "#333",
                  fontWeight: 400,
                }}>
                Are you sure you want to create this manpower form?
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  fontSize: "14px",
                  color: "#666",
                  fontWeight: 500,
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}>
                New Manpower Form
              </Typography>
            </DialogContent>
            <DialogActions
              sx={{
                justifyContent: "center",
                padding: 0,
                marginTop: 3,
                gap: 2,
              }}>
              <Button
                onClick={() => setConfirmOpen(false)}
                variant="outlined"
                sx={{
                  textTransform: "uppercase",
                  fontWeight: 600,
                  borderColor: "#f44336",
                  color: "#f44336",
                  paddingX: 3,
                  paddingY: 1,
                  borderRadius: 2,
                  "&:hover": {
                    borderColor: "#d32f2f",
                    backgroundColor: "rgba(244, 67, 54, 0.04)",
                  },
                }}
                disabled={formIsLoading}>
                CANCEL
              </Button>
              <Button
                onClick={handleConfirmSave}
                variant="contained"
                sx={{
                  textTransform: "uppercase",
                  fontWeight: 600,
                  backgroundColor: "#4caf50",
                  paddingX: 3,
                  paddingY: 1,
                  borderRadius: 2,
                  "&:hover": {
                    backgroundColor: "#388e3c",
                  },
                }}
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
