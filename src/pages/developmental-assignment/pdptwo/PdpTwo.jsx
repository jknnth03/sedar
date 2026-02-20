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
import {
  styles,
  StyledTabs,
  StyledTab,
} from "../../forms/manpowerform/FormSubmissionStyles";
import {
  useSavePdpTwoAsDraftMutation,
  useSubmitPdpTwoMutation,
} from "../../../features/api/da-task/pdpTwoApi";
import { useShowDashboardQuery } from "../../../features/api/usermanagement/dashboardApi";
import { format } from "date-fns";
import PdpTwoForAssessment from "./PdpTwoForAssessment";
import PdpTwoForSubmission from "./PdpTwoForSubmission";
import PdpTwoForApproval from "./PdpTwoForApproval";
import PdpTwoReturned from "./PdpTwoReturned";
import PdpTwoApproved from "./PdpTwoApproved";
import { useRememberQueryParams } from "../../../hooks/useRememberQueryParams";
import useDebounce from "../../../hooks/useDebounce";
import PdpTwoModal from "../../../components/modal/da-task/PdpTwoModal";
import ConfirmationDialog from "../../../styles/ConfirmationDialog";
import DateFilterDialog from "../../zzzreusable/DateFilterDialog";

const TabPanel = ({ children, value, index, ...other }) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`pdp-two-tabpanel-${index}`}
      aria-labelledby={`pdp-two-tab-${index}`}
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
    setSearchQuery(e.target.value);
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
        placeholder={isVerySmall ? "Search..." : "Search PDP 2..."}
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

const PdpTwo = () => {
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
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [pendingFormData, setPendingFormData] = useState(null);
  const [confirmItemName, setConfirmItemName] = useState("");

  const [savePdpTwoAsDraft] = useSavePdpTwoAsDraftMutation();
  const [submitPdpTwo] = useSubmitPdpTwoMutation();

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

  const pdpTwoCounts = {
    forAssessment:
      dashboardData?.result?.da_tasks?.pdp_two?.for_assessment || 0,
    forSubmission:
      dashboardData?.result?.da_tasks?.pdp_two?.for_submission || 0,
    forApproval: dashboardData?.result?.approval?.da?.pdp_two || 0,
    returned: dashboardData?.result?.da_tasks?.pdp_two?.returned || 0,
    approved: 0,
  };

  const pdpTwoOverdueCounts = {
    forAssessment:
      dashboardData?.result?.da_tasks?.pdp_two?.for_assessment_overdue || 0,
    forSubmission:
      dashboardData?.result?.da_tasks?.pdp_two?.for_submission_overdue || 0,
    forApproval: dashboardData?.result?.approval?.da?.pdp_two_overdue || 0,
    returned: dashboardData?.result?.da_tasks?.pdp_two?.returned_overdue || 0,
    approved: 0,
  };

  const handleTabChange = useCallback(
    (event, newValue) => {
      setActiveTab(newValue);
      setQueryParams(
        { tab: tabMap[newValue], q: searchQuery },
        { retain: true },
      );
    },
    [setQueryParams, searchQuery, tabMap],
  );

  const handleSearchChange = useCallback(
    (newSearchQuery) => {
      setSearchQuery(newSearchQuery);
      setQueryParams(
        { tab: tabMap[activeTab], q: newSearchQuery },
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
    setPendingFormData(null);
    setConfirmAction(null);
  }, []);

  const handleModalSave = useCallback(async (data, isDraft = false) => {
    setPendingFormData(data);
    setConfirmAction(isDraft ? "draft" : "update");
    setConfirmOpen(true);
    return false;
  }, []);

  const handleActionConfirm = async () => {
    if (!confirmAction || !pendingFormData) return;

    setIsLoading(true);

    try {
      const payload = {
        id: selectedEntry?.id,
        data: pendingFormData,
      };

      if (confirmAction === "draft") {
        await savePdpTwoAsDraft(payload).unwrap();
        enqueueSnackbar("PDP 2 saved as draft successfully!", {
          variant: "success",
          autoHideDuration: 2000,
        });
      } else if (
        confirmAction === "update" ||
        confirmAction === "submit" ||
        confirmAction === "approve" ||
        confirmAction === "reject" ||
        confirmAction === "resubmit"
      ) {
        await submitPdpTwo(payload).unwrap();
        enqueueSnackbar(
          `PDP 2 ${
            confirmAction === "update" ? "updated" : confirmAction + "ted"
          } successfully!`,
          {
            variant: "success",
            autoHideDuration: 2000,
          },
        );
      } else if (confirmAction === "cancel") {
        enqueueSnackbar("PDP 2 cancelled successfully!", {
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
      const errorMessage =
        error?.data?.message ||
        error?.message ||
        `Failed to ${confirmAction}. Please try again.`;

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

  const handleApprove = useCallback(async () => {
    try {
      handleRefreshDetails();
      return true;
    } catch {
      return false;
    }
  }, [handleRefreshDetails]);

  const handleReject = useCallback(async () => {
    try {
      handleRefreshDetails();
      return true;
    } catch {
      return false;
    }
  }, [handleRefreshDetails]);

  const handleCancel = useCallback(
    async (entryId, cancellationReason = "") => {
      try {
        enqueueSnackbar("PDP 2 cancelled successfully!", {
          variant: "success",
          autoHideDuration: 2000,
        });
        handleRefreshDetails();
        return true;
      } catch (error) {
        const errorMessage =
          error?.data?.message ||
          error?.message ||
          "Failed to cancel PDP 2. Please try again.";
        enqueueSnackbar(errorMessage, {
          variant: "error",
          autoHideDuration: 3000,
        });
        return false;
      }
    },
    [enqueueSnackbar, handleRefreshDetails],
  );

  const getSubmissionDisplayName = useCallback(() => {
    if (confirmItemName) return confirmItemName;
    return selectedEntry?.reference_number || "PDP 2 Submission";
  }, [selectedEntry, confirmItemName]);

  const tabsData = useMemo(
    () => [
      {
        label: "FOR ASSESSMENT",
        component: (
          <PdpTwoForAssessment
            key="for-assessment"
            searchQuery={debouncedSearchQuery}
            dateFilters={apiDateFilters}
            onCancel={handleCancel}
            onRowClick={handleRowClick}
          />
        ),
        badgeCount: pdpTwoCounts.forAssessment,
        overdueCount: pdpTwoOverdueCounts.forAssessment,
      },
      {
        label: "FOR SUBMISSION",
        component: (
          <PdpTwoForSubmission
            key="for-submission"
            searchQuery={debouncedSearchQuery}
            dateFilters={apiDateFilters}
            onCancel={handleCancel}
            onRowClick={handleRowClick}
          />
        ),
        badgeCount: pdpTwoCounts.forSubmission,
        overdueCount: pdpTwoOverdueCounts.forSubmission,
      },
      {
        label: "FOR APPROVAL",
        component: (
          <PdpTwoForApproval
            key="for-approval"
            searchQuery={debouncedSearchQuery}
            dateFilters={apiDateFilters}
            onCancel={handleCancel}
            onRowClick={handleRowClick}
            onApprove={handleApprove}
            onReject={handleReject}
          />
        ),
        badgeCount: pdpTwoCounts.forApproval,
        overdueCount: pdpTwoOverdueCounts.forApproval,
      },
      {
        label: "RETURNED",
        component: (
          <PdpTwoReturned
            key="returned"
            searchQuery={debouncedSearchQuery}
            dateFilters={apiDateFilters}
            onCancel={handleCancel}
            onRowClick={handleRowClick}
          />
        ),
        badgeCount: pdpTwoCounts.returned,
        overdueCount: pdpTwoOverdueCounts.returned,
      },
      {
        label: "APPROVED",
        component: (
          <PdpTwoApproved
            key="approved"
            searchQuery={debouncedSearchQuery}
            dateFilters={apiDateFilters}
            onCancel={handleCancel}
            onRowClick={handleRowClick}
          />
        ),
        badgeCount: pdpTwoCounts.approved,
        overdueCount: pdpTwoOverdueCounts.approved,
      },
    ],
    [
      debouncedSearchQuery,
      apiDateFilters,
      handleCancel,
      handleRowClick,
      handleApprove,
      handleReject,
      pdpTwoCounts,
      pdpTwoOverdueCounts,
    ],
  );

  const a11yProps = (index) => ({
    id: `pdp-two-tab-${index}`,
    "aria-controls": `pdp-two-tabpanel-${index}`,
  });

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
                PDP 2
              </Typography>
            </Box>

            <CustomSearchBar
              searchQuery={searchQuery}
              setSearchQuery={handleSearchChange}
              dateFilters={apiDateFilters}
              onFilterClick={handleFilterClick}
              isLoading={isLoading}
            />
          </Box>

          <Box sx={styles.tabsSection}>
            <StyledTabs
              value={activeTab}
              onChange={handleTabChange}
              aria-label="PDP 2 tabs"
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
                    <Box sx={{ position: "relative", display: "inline-flex" }}>
                      {tab.badgeCount > 0 ? (
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
                      )}
                    </Box>
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

          <PdpTwoModal
            open={modalOpen}
            onClose={handleModalClose}
            mode={modalMode}
            entry={selectedEntry}
            onSave={handleModalSave}
          />

          <ConfirmationDialog
            open={confirmOpen}
            onClose={handleConfirmationCancel}
            onConfirm={handleActionConfirm}
            isLoading={isLoading}
            action={confirmAction}
            itemName={getSubmissionDisplayName()}
            module="PDP 2 Submission"
          />
        </Box>
      </FormProvider>
    </LocalizationProvider>
  );
};

export default PdpTwo;
