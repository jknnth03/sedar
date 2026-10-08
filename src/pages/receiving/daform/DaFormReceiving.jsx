import React, { useState, useCallback, useMemo } from "react";
import {
  Box,
  Badge,
  Typography,
  TextField,
  Checkbox,
  FormControlLabel,
  Tooltip,
  CircularProgress,
  IconButton,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import { FormProvider, useForm } from "react-hook-form";
import { useSnackbar } from "notistack";
import {
  styles,
  StyledTabs,
  StyledTab,
} from "../../forms/manpowerform/FormSubmissionStyles";
import { parseISO, isWithinInterval } from "date-fns";
import { useRememberQueryParams } from "../../../hooks/useRememberQueryParams";
import useDebounce from "../../../hooks/useDebounce";
import DaFormForReceiving from "./DaFormForReceiving";
import DaFormReceivingForAssessment from "./DaFormReceivingForAssessment";
import DaFormReceivingCompleted from "./DaFormReceivingCompleted";
import { useStartDaSubmissionMutation } from "../../../features/api/receiving/daFormReceivingApi";
import DaFormReceivingModal from "../../../components/modal/receiving/DaFormReceivingModal";
import FilterDaFormsDialog from "./FilterDaFormsDialog";

const EMPTY_FILTERS = {
  department: "",
  unit: "",
  subUnit: "",
  chargingId: "",
  dateFrom: "",
  dateTo: "",
};

const TabPanel = ({ children, value, index, ...other }) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`da-receiving-tabpanel-${index}`}
      aria-labelledby={`da-receiving-tab-${index}`}
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
      item.action_type?.toLowerCase().includes(query),
  );
};

const CustomSearchBar = ({
  searchQuery,
  setSearchQuery,
  activeFilterCount,
  onFilterClick,
  isLoading = false,
}) => {
  const isVerySmall = useMediaQuery("(max-width:369px)");
  const hasActiveFilters = activeFilterCount > 0;

  const iconColor = hasActiveFilters
    ? "rgba(0, 133, 49, 1)"
    : "rgb(33, 61, 112)";

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
  };

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
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
          <FilterListIcon sx={{ fontSize: "18px" }} />
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
              {activeFilterCount}
            </Box>
          )}
        </IconButton>
      ) : (
        <Tooltip title="Click here to filter DA forms" arrow>
          <FormControlLabel
            control={
              <Checkbox
                checked={hasActiveFilters}
                onChange={onFilterClick}
                disabled={isLoading}
                icon={<FilterListIcon sx={{ color: iconColor }} />}
                checkedIcon={<FilterListIcon sx={{ color: iconColor }} />}
                size="small"
              />
            }
            label={
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                <span>FILTER</span>
                {hasActiveFilters && (
                  <Box
                    sx={{
                      backgroundColor: "rgba(0, 133, 49, 1)",
                      color: "white",
                      borderRadius: "50%",
                      width: "18px",
                      height: "18px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "10px",
                      fontWeight: 700,
                    }}>
                    {activeFilterCount}
                  </Box>
                )}
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
                fontSize: "20px",
              }}
            />
          ),
          endAdornment: isLoading && (
            <CircularProgress size={16} sx={{ marginLeft: 1 }} />
          ),
          sx: {
            height: "36px",
            width: "320px",
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
          "& .MuiInputBase-input": {
            fontSize: "14px",
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
    reverseTabMap[currentParams?.tab] ?? 0,
  );
  const [searchQuery, setSearchQuery] = useState(currentParams?.q ?? "");
  const [filters, setFilters] = useState(EMPTY_FILTERS);
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

  const activeFilterCount = useMemo(
    () => Object.values(filters).filter(Boolean).length,
    [filters],
  );

  const dateFilters = useMemo(
    () => ({
      startDate: filters.dateFrom ? parseISO(filters.dateFrom) : null,
      endDate: filters.dateTo ? parseISO(filters.dateTo) : null,
    }),
    [filters.dateFrom, filters.dateTo],
  );

  const apiFilters = useMemo(() => {
    const params = {};
    if (filters.department) params.department = filters.department;
    if (filters.unit) params.unit = filters.unit;
    if (filters.subUnit) params.sub_unit = filters.subUnit;
    if (filters.chargingId) params.charging_id = filters.chargingId;
    if (filters.dateFrom) params.from_date = filters.dateFrom;
    if (filters.dateTo) params.to_date = filters.dateTo;
    return params;
  }, [filters]);

  const handleTabChange = useCallback(
    (event, newValue) => {
      setActiveTab(newValue);
      setQueryParams(
        {
          tab: tabMap[newValue],
          q: searchQuery,
        },
        { retain: true },
      );
    },
    [setQueryParams, searchQuery],
  );

  const handleSearchChange = useCallback(
    (newSearchQuery) => {
      setSearchQuery(newSearchQuery);
      setQueryParams(
        {
          tab: tabMap[activeTab],
          q: newSearchQuery,
        },
        { retain: true },
      );
    },
    [setQueryParams, activeTab],
  );

  const handleFilterClick = useCallback(() => {
    setFilterDialogOpen(true);
  }, []);

  const handleFiltersApply = useCallback((newFilters) => {
    setFilters({ ...EMPTY_FILTERS, ...newFilters });
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
    [startDaSubmission, enqueueSnackbar],
  );

  const tabsData = [
    {
      label: "FOR RECEIVING",
      component: (
        <DaFormForReceiving
          searchQuery={debouncedSearchQuery}
          dateFilters={dateFilters}
          apiFilters={apiFilters}
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
      label: "FOR ASSESSMENT",
      component: (
        <DaFormReceivingForAssessment
          searchQuery={debouncedSearchQuery}
          dateFilters={dateFilters}
          apiFilters={apiFilters}
          filterDataByDate={filterDataByDate}
          filterDataBySearch={filterDataBySearch}
          setQueryParams={setQueryParams}
          currentParams={currentParams}
        />
      ),
      badgeCount: daFormCounts.forAssessment,
    },
    {
      label: "COMPLETED",
      component: (
        <DaFormReceivingCompleted
          searchQuery={debouncedSearchQuery}
          dateFilters={dateFilters}
          apiFilters={apiFilters}
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
                {isVerySmall ? "DA FORMS" : "DA FORM RECEIVING"}
              </Typography>
            </Box>

            <CustomSearchBar
              searchQuery={searchQuery}
              setSearchQuery={handleSearchChange}
              activeFilterCount={activeFilterCount}
              onFilterClick={handleFilterClick}
              isLoading={isLoadingState}
            />
          </Box>

          <Box sx={styles.tabsSection}>
            <StyledTabs
              value={activeTab}
              onChange={handleTabChange}
              aria-label="DA Form Receiving tabs"
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
          </Box>

          <Box sx={styles.tabsContainer}>
            {tabsData.map((tab, index) => (
              <TabPanel key={index} value={activeTab} index={index}>
                {tab.component}
              </TabPanel>
            ))}
          </Box>

          <FilterDaFormsDialog
            open={filterDialogOpen}
            onClose={() => setFilterDialogOpen(false)}
            onApply={handleFiltersApply}
            initialValues={filters}
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
