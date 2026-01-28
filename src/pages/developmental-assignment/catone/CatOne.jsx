import React, { useState, useCallback, useEffect, useMemo } from "react";
import {
  Box,
  Badge,
  Typography,
  Button,
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
import {
  styles,
  StyledTabs,
  StyledTab,
} from "../../forms/manpowerform/FormSubmissionStyles";
import {
  useSaveCatOneAsDraftMutation,
  useSubmitCatOneMutation,
} from "../../../features/api/da-task/catOneApi";
import { useShowDashboardQuery } from "../../../features/api/usermanagement/dashboardApi";
import { format } from "date-fns";

import CatOneForAssessment from "./CatOneForAssessment";
import CatOneForApproval from "./CatOneForApproval";
import CatOneForSubmission from "./CatOneForSubmission";
import CatOneApproved from "./CatOneApproved";
import { useRememberQueryParams } from "../../../hooks/useRememberQueryParams";
import useDebounce from "../../../hooks/useDebounce";
import CatOneModal from "../../../components/modal/da-task/CatOneModal";
import CatOneReturned from "./CatOneReturned";
import DateFilterDialog from "../../zzzreusable/DateFilterDialog";

const TabPanel = ({ children, value, index, ...other }) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`catone-tabpanel-${index}`}
      aria-labelledby={`catone-tab-${index}`}
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
        "MMM dd",
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
        placeholder={isVerySmall ? "Search..." : "Search CAT 1..."}
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

const CatOne = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.between(600, 1038));
  const isVerySmall = useMediaQuery("(max-width:369px)");
  const { enqueueSnackbar } = useSnackbar();
  const methods = useForm();

  const { data: dashboardData } = useShowDashboardQuery();

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
    reverseTabMap[currentParams?.tab] ?? 0,
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

  const apiDateFilters = useMemo(() => {
    const filters = {
      start_date: dateFilters.startDate
        ? format(dateFilters.startDate, "yyyy-MM-dd")
        : undefined,
      end_date: dateFilters.endDate
        ? format(dateFilters.endDate, "yyyy-MM-dd")
        : undefined,
    };
    return filters;
  }, [dateFilters]);

  const catOneCounts = {
    forAssessment: dashboardData?.result?.da_tasks?.cat1?.for_assessment || 0,
    forSubmission: dashboardData?.result?.da_tasks?.cat1?.for_submission || 0,
    forApproval: dashboardData?.result?.approval?.da?.cat1 || 0,
    returned: dashboardData?.result?.da_tasks?.cat1?.returned || 0,
    approved: 0,
  };

  const handleTabChange = useCallback(
    (event, newValue) => {
      setActiveTab(newValue);
      setSelectedPage(1);
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
    [submitCatOne, enqueueSnackbar, handleRefreshDetails],
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
    [saveCatOneAsDraft, enqueueSnackbar, handleRefreshDetails],
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
    [enqueueSnackbar, handleRefreshDetails],
  );

  const tabsData = useMemo(
    () => [
      {
        label: "FOR ASSESSMENT",
        component: (
          <CatOneForAssessment
            key="for-assessment"
            searchQuery={debouncedSearchQuery}
            dateFilters={apiDateFilters}
            setQueryParams={setQueryParams}
            currentParams={currentParams}
            onCancel={handleCancel}
            onRowClick={handleRowClick}
          />
        ),
        badgeCount: catOneCounts.forAssessment,
      },
      {
        label: "FOR SUBMISSION",
        component: (
          <CatOneForSubmission
            key="for-submission"
            searchQuery={debouncedSearchQuery}
            dateFilters={apiDateFilters}
            setQueryParams={setQueryParams}
            currentParams={currentParams}
            onCancel={handleCancel}
            onRowClick={handleRowClick}
          />
        ),
        badgeCount: catOneCounts.forSubmission,
      },
      {
        label: "FOR APPROVAL",
        component: (
          <CatOneForApproval
            key="for-approval"
            searchQuery={debouncedSearchQuery}
            dateFilters={apiDateFilters}
            setQueryParams={setQueryParams}
            currentParams={currentParams}
            onCancel={handleCancel}
            onRowClick={handleRowClick}
          />
        ),
        badgeCount: catOneCounts.forApproval,
      },
      {
        label: "RETURNED",
        component: (
          <CatOneReturned
            key="returned"
            searchQuery={debouncedSearchQuery}
            dateFilters={apiDateFilters}
            setQueryParams={setQueryParams}
            currentParams={currentParams}
            onCancel={handleCancel}
            onRowClick={handleRowClick}
            onSave={handleModalSave}
            onSaveAsDraft={handleModalSaveAsDraft}
          />
        ),
        badgeCount: catOneCounts.returned,
      },
      {
        label: "APPROVED",
        component: (
          <CatOneApproved
            key="approved"
            searchQuery={debouncedSearchQuery}
            dateFilters={apiDateFilters}
            setQueryParams={setQueryParams}
            currentParams={currentParams}
            onCancel={handleCancel}
            onRowClick={handleRowClick}
          />
        ),
        badgeCount: catOneCounts.approved,
      },
    ],
    [
      debouncedSearchQuery,
      apiDateFilters,
      setQueryParams,
      currentParams,
      handleCancel,
      handleRowClick,
      handleModalSave,
      handleModalSaveAsDraft,
      catOneCounts,
    ],
  );

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

          <Box sx={styles.tabsSection}>
            <StyledTabs
              value={activeTab}
              onChange={handleTabChange}
              aria-label="CAT 1 tabs"
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

          <DateFilterDialog
            open={filterDialogOpen}
            onClose={() => setFilterDialogOpen(false)}
            dateFilters={dateFilters}
            onDateFiltersChange={handleDateFiltersChange}
            styles={styles}
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
