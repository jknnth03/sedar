import React, { useState, useCallback, useEffect } from "react";
import {
  Box,
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
  Tooltip,
  CircularProgress,
  IconButton,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
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
import { format, parseISO, isWithinInterval } from "date-fns";
import CatTwoForAssessment from "./CatTwoForAssessment";
import CatTwoForSubmission from "./CatTwoForSubmission";
import CatTwoForApproval from "./CatTwoForApproval";
import CatTwoReturned from "./CatTwoReturned";
import CatTwoApproved from "./CatTwoApproved";
import { useRememberQueryParams } from "../../../hooks/useRememberQueryParams";
import useDebounce from "../../../hooks/useDebounce";
import CatTwoModal from "../../../components/modal/da-task/CatTwoModal";
import ConfirmationDialog from "../../../styles/ConfirmationDialog";

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
      item.status?.toLowerCase().includes(query)
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
  const [modalMode, setModalMode] = useState("create");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [pendingFormData, setPendingFormData] = useState(null);
  const [confirmItemName, setConfirmItemName] = useState("");

  const [saveCatTwoAsDraft] = useSaveCatTwoAsDraftMutation();
  const [submitCatTwo] = useSubmitCatTwoMutation();

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
    []
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
    [submitCatTwo, enqueueSnackbar, handleRefreshDetails]
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
    [enqueueSnackbar, handleRefreshDetails]
  );

  const getSubmissionDisplayName = useCallback(() => {
    if (confirmItemName) return confirmItemName;
    return selectedEntry?.reference_number || "CAT 2 Submission";
  }, [selectedEntry, confirmItemName]);

  const tabsData = [
    {
      label: "FOR ASSESSMENT",
      component: (
        <CatTwoForAssessment
          searchQuery={debouncedSearchQuery}
          dateFilters={dateFilters}
          filterDataByDate={filterDataByDate}
          filterDataBySearch={filterDataBySearch}
          onCancel={handleCancel}
          onRowClick={handleRowClick}
          onConfirmationRequest={handleConfirmationRequest}
        />
      ),
      badgeCount: 0,
    },
    {
      label: "FOR SUBMISSION",
      component: (
        <CatTwoForSubmission
          searchQuery={debouncedSearchQuery}
          dateFilters={dateFilters}
          filterDataByDate={filterDataByDate}
          filterDataBySearch={filterDataBySearch}
          onCancel={handleCancel}
          onRowClick={handleRowClick}
          onConfirmationRequest={handleConfirmationRequest}
        />
      ),
      badgeCount: 0,
    },
    {
      label: "FOR APPROVAL",
      component: (
        <CatTwoForApproval
          searchQuery={debouncedSearchQuery}
          dateFilters={dateFilters}
          filterDataByDate={filterDataByDate}
          filterDataBySearch={filterDataBySearch}
          onCancel={handleCancel}
          onRowClick={handleRowClick}
          onConfirmationRequest={handleConfirmationRequest}
        />
      ),
      badgeCount: 0,
    },
    {
      label: "RETURNED",
      component: (
        <CatTwoReturned
          searchQuery={debouncedSearchQuery}
          dateFilters={dateFilters}
          filterDataByDate={filterDataByDate}
          filterDataBySearch={filterDataBySearch}
          onCancel={handleCancel}
          onRowClick={handleRowClick}
          onConfirmationRequest={handleConfirmationRequest}
        />
      ),
      badgeCount: 0,
    },
    {
      label: "APPROVED",
      component: (
        <CatTwoApproved
          searchQuery={debouncedSearchQuery}
          dateFilters={dateFilters}
          filterDataByDate={filterDataByDate}
          filterDataBySearch={filterDataBySearch}
          onCancel={handleCancel}
          onRowClick={handleRowClick}
          onConfirmationRequest={handleConfirmationRequest}
        />
      ),
      badgeCount: 0,
    },
  ];

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
              dateFilters={dateFilters}
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
