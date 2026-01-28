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
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import { FormProvider, useForm } from "react-hook-form";
import { useSnackbar } from "notistack";
import { format } from "date-fns";
import { useRememberQueryParams } from "../../../../hooks/useRememberQueryParams";
import useDebounce from "../../../../hooks/useDebounce";
import DataChangeForMDAProcessing from "./DataChangeForMDAProcessing";
import MDAForApproval from "./MDAForApproval";
import MDARejected from "./MDARejected";
import MDAAwaitingResubmission from "./MDAAwaitingResubmission";
import MDAApproved from "./MDAApproved";
import MDACancelled from "./MDACancelled";
import { useCancelFormSubmissionMutation } from "../../../../features/api/approvalsetting/formSubmissionApi";
import { useShowDashboardQuery } from "../../../../features/api/usermanagement/dashboardApi";
import ExportButton from "./ExportButton";
import DateFilterDialog from "../../../zzzreusable/DateFilterDialog";
import {
  StyledTab,
  StyledTabs,
  styles,
} from "../../manpowerform/formSubmissionStyles";

const TabPanel = ({ children, value, index, ...other }) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`mda-tabpanel-${index}`}
      aria-labelledby={`mda-tab-${index}`}
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
  const hasActiveFilters = dateFilters.start_date || dateFilters.end_date;

  const getFilterLabel = () => {
    if (dateFilters.start_date && dateFilters.end_date) {
      return `${dateFilters.start_date} - ${dateFilters.end_date}`;
    }
    if (dateFilters.start_date) {
      return `From ${dateFilters.start_date}`;
    }
    if (dateFilters.end_date) {
      return `Until ${dateFilters.end_date}`;
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
      <ExportButton isLoading={isLoading} />

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
        placeholder={isVerySmall ? "Search..." : "Search MDA..."}
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

const MDA = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.between(600, 1038));
  const isVerySmall = useMediaQuery("(max-width:369px)");
  const { enqueueSnackbar } = useSnackbar();
  const methods = useForm();

  const { data: dashboardData } = useShowDashboardQuery();

  const [currentParams, setQueryParams] = useRememberQueryParams();

  const tabMap = {
    0: "ForMDAProcessing",
    1: "ForApproval",
    2: "AwaitingResubmission",
    3: "Rejected",
    4: "Approved",
    5: "Cancelled",
  };

  const reverseTabMap = {
    ForMDAProcessing: 0,
    ForApproval: 1,
    AwaitingResubmission: 2,
    Rejected: 3,
    Approved: 4,
    Cancelled: 5,
  };

  const [activeTab, setActiveTab] = useState(
    reverseTabMap[currentParams?.tab] ?? 0,
  );
  const [searchQuery, setSearchQuery] = useState(currentParams?.q ?? "");
  const [dateFilters, setDateFilters] = useState({
    startDate: null,
    endDate: null,
  });
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [cancelMDASubmission] = useCancelFormSubmissionMutation();

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

  const mdaCounts = {
    forMDAProcessing:
      dashboardData?.result?.requisition?.data_change_for_mda_processing || 0,
    forApproval: dashboardData?.result?.approval?.mda_approval || 0,
    rejected: 0,
    awaitingResubmission: 0,
    approved: 0,
    cancelled: 0,
  };

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
    [setQueryParams, searchQuery, tabMap],
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
    [setQueryParams, activeTab, tabMap],
  );

  const handleFilterClick = useCallback(() => {
    setFilterDialogOpen(true);
  }, []);

  const handleDateFiltersChange = useCallback((newDateFilters) => {
    setDateFilters(newDateFilters);
  }, []);

  const handleCancel = useCallback(
    async (entryId, cancellationReason) => {
      try {
        await cancelMDASubmission({
          id: entryId,
          cancellation_reason: cancellationReason,
        }).unwrap();

        enqueueSnackbar("MDA cancelled successfully!", {
          variant: "success",
          autoHideDuration: 2000,
        });

        return true;
      } catch (error) {
        console.error("Error in handleCancel:", error);

        let errorMessage = "Failed to cancel MDA. Please try again.";

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
    [cancelMDASubmission, enqueueSnackbar],
  );

  const tabsData = useMemo(
    () => [
      {
        label: "FOR MDA PROCESSING",
        component: (
          <DataChangeForMDAProcessing
            key="for-mda-processing"
            searchQuery={debouncedSearchQuery}
            dateFilters={apiDateFilters}
            setQueryParams={setQueryParams}
            currentParams={currentParams}
            onCancel={handleCancel}
          />
        ),
        badgeCount: mdaCounts.forMDAProcessing,
      },
      {
        label: "FOR APPROVAL",
        component: (
          <MDAForApproval
            key="for-approval"
            searchQuery={debouncedSearchQuery}
            dateFilters={apiDateFilters}
            setQueryParams={setQueryParams}
            currentParams={currentParams}
            onCancel={handleCancel}
          />
        ),
        badgeCount: mdaCounts.forApproval,
      },
      {
        label: "AWAITING RESUBMISSION",
        component: (
          <MDAAwaitingResubmission
            key="awaiting-resubmission"
            searchQuery={debouncedSearchQuery}
            dateFilters={apiDateFilters}
            setQueryParams={setQueryParams}
            currentParams={currentParams}
            onCancel={handleCancel}
          />
        ),
        badgeCount: mdaCounts.awaitingResubmission,
      },
      {
        label: "REJECTED",
        component: (
          <MDARejected
            key="rejected"
            searchQuery={debouncedSearchQuery}
            dateFilters={apiDateFilters}
            setQueryParams={setQueryParams}
            currentParams={currentParams}
            onCancel={handleCancel}
          />
        ),
        badgeCount: mdaCounts.rejected,
      },
      {
        label: "APPROVED",
        component: (
          <MDAApproved
            key="approved"
            searchQuery={debouncedSearchQuery}
            dateFilters={apiDateFilters}
            setQueryParams={setQueryParams}
            currentParams={currentParams}
            onCancel={handleCancel}
          />
        ),
        badgeCount: mdaCounts.approved,
      },
      {
        label: "CANCELLED",
        component: (
          <MDACancelled
            key="cancelled"
            searchQuery={debouncedSearchQuery}
            dateFilters={apiDateFilters}
            setQueryParams={setQueryParams}
            currentParams={currentParams}
          />
        ),
        badgeCount: mdaCounts.cancelled,
      },
    ],
    [
      debouncedSearchQuery,
      apiDateFilters,
      setQueryParams,
      currentParams,
      handleCancel,
      mdaCounts,
    ],
  );

  const a11yProps = (index) => {
    return {
      id: `mda-tab-${index}`,
      "aria-controls": `mda-tabpanel-${index}`,
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
                {isVerySmall
                  ? "MDA (DATA CHANGE)"
                  : "MASTER DATA AUTHORITY (DATA CHANGE)"}
              </Typography>
            </Box>

            <CustomSearchBar
              searchQuery={searchQuery}
              setSearchQuery={handleSearchChange}
              dateFilters={apiDateFilters}
              onFilterClick={handleFilterClick}
              isLoading={isLoadingState}
            />
          </Box>
          <Box sx={styles.tabsSection}>
            <StyledTabs
              value={activeTab}
              onChange={handleTabChange}
              aria-label="MDA submissions tabs"
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
                        {isVerySmall && tab.label.length > 12
                          ? tab.label
                              .replace("AWAITING ", "")
                              .replace("RESUBMISSION", "RESUB")
                              .replace("FOR MDA PROCESSING", "MDA PROC")
                          : tab.label}
                      </Badge>
                    ) : isVerySmall && tab.label.length > 12 ? (
                      tab.label
                        .replace("AWAITING ", "")
                        .replace("RESUBMISSION", "RESUB")
                        .replace("FOR MDA PROCESSING", "MDA PROC")
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

export default MDA;
