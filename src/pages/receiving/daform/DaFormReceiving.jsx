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

import { format, parseISO, isWithinInterval } from "date-fns";
import { useRememberQueryParams } from "../../../hooks/useRememberQueryParams";
import useDebounce from "../../../hooks/useDebounce";

import DaFormForReceiving from "./DaFormForReceiving";
import DaFormReceivingForAssessment from "./DaFormReceivingForAssessment";
import DaFormReceivingCompleted from "./DaFormReceivingCompleted";
import { useStartDaSubmissionMutation } from "../../../features/api/receiving/daFormReceivingApi";
import { styles } from "../../forms/manpowerform/FormSubmissionStyles";
import DaFormReceivingModal from "../../../components/modal/receiving/DaFormReceivingModal";

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
      id={`da-receiving-tabpanel-${index}`}
      aria-labelledby={`da-receiving-tab-${index}`}
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
      item.reference_number?.toLowerCase().includes(query) ||
      item.employee_name?.toLowerCase().includes(query) ||
      item.employee_code?.toLowerCase().includes(query) ||
      item.action_type?.toLowerCase().includes(query)
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
        placeholder={isVerySmall ? "Search..." : "Search DA Forms..."}
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

const DaFormReceiving = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.between(600, 1038));
  const isVerySmall = useMediaQuery("(max-width:369px)");
  const { enqueueSnackbar } = useSnackbar();
  const methods = useForm();

  const [currentParams, setQueryParams] = useRememberQueryParams();

  const tabMap = {
    0: "ForReceiving",
    1: "ForAssessment",
    2: "Completed",
  };

  const reverseTabMap = {
    ForReceiving: 0,
    ForAssessment: 1,
    Completed: 2,
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
  const [modalLoading, setModalLoading] = useState(false);

  const [startDaSubmission] = useStartDaSubmissionMutation();

  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  const daFormCounts = {
    forReceiving: 0,
    forAssessment: 0,
    completed: 0,
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

  const handleCloseModal = useCallback(() => {
    setModalOpen(false);
    setSelectedEntry(null);
    setModalLoading(false);
    methods.reset();
  }, [methods]);

  const handleStartSubmission = useCallback(
    async (submissionId, onSuccess) => {
      try {
        if (!submissionId) {
          throw new Error("Invalid submission ID");
        }

        await startDaSubmission(submissionId).unwrap();

        enqueueSnackbar("DA Form submission started successfully!", {
          variant: "success",
          autoHideDuration: 2000,
        });

        if (onSuccess && typeof onSuccess === "function") {
          onSuccess();
        }

        return true;
      } catch (error) {
        let errorMessage =
          "Failed to start DA Form submission. Please try again.";

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
    [startDaSubmission, enqueueSnackbar]
  );

  const tabsData = [
    {
      label: "For Receiving",
      component: (
        <DaFormForReceiving
          searchQuery={debouncedSearchQuery}
          dateFilters={dateFilters}
          filterDataByDate={filterDataByDate}
          filterDataBySearch={filterDataBySearch}
          setQueryParams={setQueryParams}
          currentParams={currentParams}
          onStartSubmission={handleStartSubmission}
        />
      ),
      badgeCount: daFormCounts.forReceiving,
    },
    {
      label: "For Assessment",
      component: (
        <DaFormReceivingForAssessment
          searchQuery={debouncedSearchQuery}
          dateFilters={dateFilters}
          filterDataByDate={filterDataByDate}
          filterDataBySearch={filterDataBySearch}
          setQueryParams={setQueryParams}
          currentParams={currentParams}
        />
      ),
      badgeCount: daFormCounts.forAssessment,
    },
    {
      label: "Completed",
      component: (
        <DaFormReceivingCompleted
          searchQuery={debouncedSearchQuery}
          dateFilters={dateFilters}
          filterDataByDate={filterDataByDate}
          filterDataBySearch={filterDataBySearch}
          setQueryParams={setQueryParams}
          currentParams={currentParams}
        />
      ),
      badgeCount: daFormCounts.completed,
    },
  ];

  const a11yProps = (index) => {
    return {
      id: `da-receiving-tab-${index}`,
      "aria-controls": `da-receiving-tabpanel-${index}`,
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
                  {isVerySmall ? "DA FORMS" : "DA Form Receiving"}
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
              aria-label="DA Form Receiving tabs"
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
                        sx={{
                          "& .MuiBadge-badge": {
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

          <DaFormReceivingModal
            open={modalOpen}
            onClose={handleCloseModal}
            selectedEntry={selectedEntry}
            isLoading={modalLoading}
          />
        </Box>
      </FormProvider>
    </LocalizationProvider>
  );
};

export default DaFormReceiving;
