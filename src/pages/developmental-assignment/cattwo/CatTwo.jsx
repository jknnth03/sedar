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
  useSaveCatTwoAsDraftMutation,
  useSubmitCatTwoMutation,
} from "../../../features/api/da-task/catTwoApi";
import { useShowDashboardQuery } from "../../../features/api/usermanagement/dashboardApi";
import { format } from "date-fns";
import CatTwoForAssessment from "./CatTwoForAssessment";
import CatTwoForSubmission from "./CatTwoForSubmission";
import CatTwoForApproval from "./CatTwoForApproval";
import CatTwoReturned from "./CatTwoReturned";
import CatTwoApproved from "./CatTwoApproved";
import { useRememberQueryParams } from "../../../hooks/useRememberQueryParams";
import useDebounce from "../../../hooks/useDebounce";
import CatTwoModal from "../../../components/modal/da-task/CatTwoModal";
import ConfirmationDialog from "../../../styles/ConfirmationDialog";
import DateFilterDialog from "../../zzzreusable/DateFilterDialog";

const TabPanel = ({ children, value, index, ...other }) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`cattwo-tabpanel-${index}`}
      aria-labelledby={`cattwo-tab-${index}`}
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
        placeholder={isVerySmall ? "Search..." : "Search CAT 2..."}
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

const CatTwo = () => {
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
  const [modalMode, setModalMode] = useState("create");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [pendingFormData, setPendingFormData] = useState(null);
  const [confirmItemName, setConfirmItemName] = useState("");

  const [saveCatTwoAsDraft] = useSaveCatTwoAsDraftMutation();
  const [submitCatTwo] = useSubmitCatTwoMutation();

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

  const catTwoCounts = {
    forAssessment: dashboardData?.result?.da_tasks?.cat2?.for_assessment || 0,
    forSubmission: dashboardData?.result?.da_tasks?.cat2?.for_submission || 0,
    forApproval: dashboardData?.result?.approval?.da?.cat2 || 0,
    returned: dashboardData?.result?.da_tasks?.cat2?.returned || 0,
    approved: 0,
  };

  const catTwoOverdueCounts = {
    forAssessment:
      dashboardData?.result?.da_tasks?.cat2?.for_assessment_overdue || 0,
    forSubmission:
      dashboardData?.result?.da_tasks?.cat2?.for_submission_overdue || 0,
    forApproval: dashboardData?.result?.approval?.da?.cat2_overdue || 0,
    returned: dashboardData?.result?.da_tasks?.cat2?.returned_overdue || 0,
    approved: 0,
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
      setConfirmAction(action);
      setConfirmItemName(itemName);
      setPendingFormData(formData);
      setConfirmOpen(true);
    },
    [],
  );

  const handleActionConfirm = async () => {
    if (!confirmAction || !pendingFormData) return;

    setIsLoading(true);

    try {
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
      } else if (confirmAction === "assess") {
        await submitCatTwo({
          taskId: pendingFormData.taskId,
          ...pendingFormData.data,
        }).unwrap();
        enqueueSnackbar("CAT 2 assessed successfully!", {
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
    [submitCatTwo, enqueueSnackbar, handleRefreshDetails],
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
    [enqueueSnackbar, handleRefreshDetails],
  );

  const getSubmissionDisplayName = useCallback(() => {
    if (confirmItemName) return confirmItemName;
    return selectedEntry?.reference_number || "CAT 2 Submission";
  }, [selectedEntry, confirmItemName]);

  const tabsData = useMemo(
    () => [
      {
        label: "FOR ASSESSMENT",
        component: (
          <CatTwoForAssessment
            key="for-assessment"
            searchQuery={debouncedSearchQuery}
            dateFilters={apiDateFilters}
            setQueryParams={setQueryParams}
            currentParams={currentParams}
            onCancel={handleCancel}
            onRowClick={handleRowClick}
            onConfirmationRequest={handleConfirmationRequest}
          />
        ),
        badgeCount: catTwoCounts.forAssessment,
        overdueCount: catTwoOverdueCounts.forAssessment,
      },
      {
        label: "FOR SUBMISSION",
        component: (
          <CatTwoForSubmission
            key="for-submission"
            searchQuery={debouncedSearchQuery}
            dateFilters={apiDateFilters}
            setQueryParams={setQueryParams}
            currentParams={currentParams}
            onCancel={handleCancel}
            onRowClick={handleRowClick}
            onConfirmationRequest={handleConfirmationRequest}
          />
        ),
        badgeCount: catTwoCounts.forSubmission,
        overdueCount: catTwoOverdueCounts.forSubmission,
      },
      {
        label: "FOR APPROVAL",
        component: (
          <CatTwoForApproval
            key="for-approval"
            searchQuery={debouncedSearchQuery}
            dateFilters={apiDateFilters}
            onCancel={handleCancel}
            onRowClick={handleRowClick}
            onConfirmationRequest={handleConfirmationRequest}
          />
        ),
        badgeCount: catTwoCounts.forApproval,
        overdueCount: catTwoOverdueCounts.forApproval,
      },
      {
        label: "RETURNED",
        component: (
          <CatTwoReturned
            key="returned"
            searchQuery={debouncedSearchQuery}
            dateFilters={apiDateFilters}
            onCancel={handleCancel}
            onRowClick={handleRowClick}
            onConfirmationRequest={handleConfirmationRequest}
          />
        ),
        badgeCount: catTwoCounts.returned,
        overdueCount: catTwoOverdueCounts.returned,
      },
      {
        label: "APPROVED",
        component: (
          <CatTwoApproved
            key="approved"
            searchQuery={debouncedSearchQuery}
            dateFilters={apiDateFilters}
            onCancel={handleCancel}
            onRowClick={handleRowClick}
            onConfirmationRequest={handleConfirmationRequest}
          />
        ),
        badgeCount: catTwoCounts.approved,
        overdueCount: catTwoOverdueCounts.approved,
      },
    ],
    [
      debouncedSearchQuery,
      apiDateFilters,
      currentParams,
      handleCancel,
      handleRowClick,
      handleConfirmationRequest,
      catTwoCounts,
      catTwoOverdueCounts,
    ],
  );

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
                CAT 2
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
              aria-label="CAT 2 tabs"
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
