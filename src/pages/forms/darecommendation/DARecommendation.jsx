import React, { useState, useCallback, useEffect, useMemo } from "react";
import {
  Box,
  Badge,
  Typography,
  Button,
  TextField,
  Checkbox,
  FormControlLabel,
  Fade,
  Tooltip,
  CircularProgress,
  IconButton,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import SearchIcon from "@mui/icons-material/Search";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import AddIcon from "@mui/icons-material/Add";
import { FormProvider, useForm } from "react-hook-form";
import { useSnackbar } from "notistack";
import {
  styles,
  StyledTabs,
  StyledTab,
} from "../manpowerform/FormSubmissionStyles";

import { format } from "date-fns";
import { useRememberQueryParams } from "../../../hooks/useRememberQueryParams";
import useDebounce from "../../../hooks/useDebounce";

import DAForRecommendation from "./DAForRecommendation";
import DARecommendationForApproval from "./DARecommendationForApproval";
import DARecommendationAwaitingResubmission from "./DARecommendationAwaitingResubmission";
import DARecommendationRejected from "./DARecommendationRejected";
import DARecommendationForMDAProcessing from "./DARecommendationForMDAProcessing";
import DARecommendationMDAInProgress from "./DARecommendationMDAInProgress";
import DARecommendationCompleted from "./DARecommendationCompleted";
import { useShowDashboardQuery } from "../../../features/api/usermanagement/dashboardApi";
import DateFilterDialog from "../../zzzreusable/DateFilterDialog";

const TabPanel = ({ children, value, index, ...other }) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`da-recommendation-tabpanel-${index}`}
      aria-labelledby={`da-recommendation-tab-${index}`}
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
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <span>{getFilterLabel()}</span>
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
        placeholder={isVerySmall ? "Search..." : "Search DA Recommendation..."}
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

const DARecommendation = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.between(600, 1038));
  const isVerySmall = useMediaQuery("(max-width:369px)");
  const { enqueueSnackbar } = useSnackbar();
  const methods = useForm();

  const { data: dashboardData } = useShowDashboardQuery();

  const [currentParams, setQueryParams] = useRememberQueryParams();

  const tabMap = {
    0: "ForRecommendation",
    1: "ForApproval",
    2: "AwaitingResubmission",
    3: "Rejected",
    4: "ForMDAProcessing",
    5: "MDAInProgress",
    6: "Completed",
  };

  const reverseTabMap = {
    ForRecommendation: 0,
    ForApproval: 1,
    AwaitingResubmission: 2,
    Rejected: 3,
    ForMDAProcessing: 4,
    MDAInProgress: 5,
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

  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  const apiDateFilters = useMemo(() => {
    return {
      start_date: dateFilters.startDate
        ? format(dateFilters.startDate, "yyyy-MM-dd")
        : undefined,
      end_date: dateFilters.endDate
        ? format(dateFilters.endDate, "yyyy-MM-dd")
        : undefined,
    };
  }, [dateFilters]);

  const daCounts = useMemo(() => {
    const approval = dashboardData?.result?.approval?.da || {};
    const requisition =
      dashboardData?.result?.requisition?.da_recommendation || {};

    return {
      forRecommendation: requisition.for_recommendation || 0,
      forApproval: approval.recommendation || 0,
      awaitingResubmission: requisition.awaiting_resubmission || 0,
      rejected: requisition.rejected || 0,
      forMDAProcessing: requisition.for_mda_processing || 0,
      mdaInProgress: requisition.mda_in_progress || 0,
      completed: 0,
    };
  }, [dashboardData]);

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

  const tabsData = useMemo(
    () => [
      {
        label: "FOR RECOMMENDATION",
        component: (
          <DAForRecommendation
            key="for-recommendation"
            searchQuery={debouncedSearchQuery}
            dateFilters={apiDateFilters}
            setQueryParams={setQueryParams}
            currentParams={currentParams}
          />
        ),
        badgeCount: daCounts.forRecommendation,
      },
      {
        label: "FOR APPROVAL",
        component: (
          <DARecommendationForApproval
            key="for-approval"
            searchQuery={debouncedSearchQuery}
            dateFilters={apiDateFilters}
            setQueryParams={setQueryParams}
            currentParams={currentParams}
          />
        ),
        badgeCount: daCounts.forApproval,
      },
      {
        label: "AWAITING RESUBMISSION",
        component: (
          <DARecommendationAwaitingResubmission
            key="awaiting-resubmission"
            searchQuery={debouncedSearchQuery}
            dateFilters={apiDateFilters}
            setQueryParams={setQueryParams}
            currentParams={currentParams}
          />
        ),
        badgeCount: daCounts.awaitingResubmission,
      },
      {
        label: "REJECTED",
        component: (
          <DARecommendationRejected
            key="rejected"
            searchQuery={debouncedSearchQuery}
            dateFilters={apiDateFilters}
            setQueryParams={setQueryParams}
            currentParams={currentParams}
          />
        ),
        badgeCount: daCounts.rejected,
      },
      {
        label: "FOR MDA PROCESSING",
        component: (
          <DARecommendationForMDAProcessing
            key="for-mda-processing"
            searchQuery={debouncedSearchQuery}
            dateFilters={apiDateFilters}
            setQueryParams={setQueryParams}
            currentParams={currentParams}
          />
        ),
        badgeCount: daCounts.forMDAProcessing,
      },
      {
        label: "MDA IN PROGRESS",
        component: (
          <DARecommendationMDAInProgress
            key="mda-in-progress"
            searchQuery={debouncedSearchQuery}
            dateFilters={apiDateFilters}
            setQueryParams={setQueryParams}
            currentParams={currentParams}
          />
        ),
        badgeCount: daCounts.mdaInProgress,
      },
      {
        label: "COMPLETED",
        component: (
          <DARecommendationCompleted
            key="completed"
            searchQuery={debouncedSearchQuery}
            dateFilters={apiDateFilters}
            setQueryParams={setQueryParams}
            currentParams={currentParams}
          />
        ),
        badgeCount: daCounts.completed,
      },
    ],
    [
      debouncedSearchQuery,
      apiDateFilters,
      setQueryParams,
      currentParams,
      daCounts,
    ]
  );

  const a11yProps = (index) => {
    return {
      id: `da-recommendation-tab-${index}`,
      "aria-controls": `da-recommendation-tabpanel-${index}`,
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
                {isVerySmall ? "DA REC" : "DA RECOMMENDATION"}
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

          <Box sx={{ ...styles.tabsSection, paddingLeft: 0 }}>
            <StyledTabs
              value={activeTab}
              onChange={handleTabChange}
              aria-label="DA Recommendation submissions tabs"
              variant="scrollable"
              scrollButtons={true}
              allowScrollButtonsMobile
              sx={{
                ...styles.tabsStyled,
                ...(isVerySmall && styles.tabsStyledVerySmall),
                paddingLeft: 0,
                "& .MuiTabs-scrollButtons": {
                  "&.Mui-disabled": {
                    opacity: 0.3,
                  },
                },
                "& .MuiTabs-scroller": {
                  paddingLeft: 0,
                },
                "& .MuiTab-root:first-of-type": {
                  paddingLeft: 0,
                  marginLeft: 0,
                },
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
                              .replace("FOR RECOMMENDATION", "FOR REC")
                              .replace("AWAITING ", "")
                              .replace("RESUBMISSION", "RESUB")
                              .replace("FOR MDA PROCESSING", "MDA PROC")
                              .replace("MDA IN PROGRESS", "MDA PROG")
                          : tab.label}
                      </Badge>
                    ) : isVerySmall && tab.label.length > 12 ? (
                      tab.label
                        .replace("FOR RECOMMENDATION", "FOR REC")
                        .replace("AWAITING ", "")
                        .replace("RESUBMISSION", "RESUB")
                        .replace("FOR MDA PROCESSING", "MDA PROC")
                        .replace("MDA IN PROGRESS", "MDA PROG")
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
            styles={styles}
          />
        </Box>
      </FormProvider>
    </LocalizationProvider>
  );
};

export default DARecommendation;
