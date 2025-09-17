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
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import AddIcon from "@mui/icons-material/Add";
import { FormProvider, useForm } from "react-hook-form";
import { useSnackbar } from "notistack";
import { styles } from "../manpowerform/FormSubmissionStyles";
import {
  useGetDataChangeSubmissionsQuery,
  useCreateDataChangeSubmissionMutation,
} from "../../../features/api/forms/datachangeApi";

import DataChangeForapproval from "./DataChangeForapproval";
import DataChangeRejected from "./DataChangeRejected";
import DataChangeForreceiving from "./DataChangeForreceiving";
import DataChangeReturned from "./DataChangeReturned";
import DataChangeReceived from "./DataChangeReceived";
import DataChangeCancelled from "./DataChangeCancelled";
import DataChangeModal from "../../../components/modal/form/DataChange/DataChangeModal";

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
      id={`datachange-tabpanel-${index}`}
      aria-labelledby={`datachange-tab-${index}`}
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

const dataChangeStatusOptions = [
  { value: "for_approval", label: "For Approval" },
  { value: "rejected", label: "Rejected" },
  { value: "for_receiving", label: "For Receiving" },
  { value: "returned", label: "Returned" },
  { value: "received", label: "Received" },
  { value: "cancelled", label: "Cancelled" },
];

const FilterDialog = ({ open, onClose, selectedFilters, onFiltersChange }) => {
  const [tempFilters, setTempFilters] = useState(selectedFilters);

  useEffect(() => {
    setTempFilters(selectedFilters);
  }, [selectedFilters, open]);

  const handleFilterToggle = (filterValue) => {
    setTempFilters((prev) =>
      prev.includes(filterValue)
        ? prev.filter((f) => f !== filterValue)
        : [...prev, filterValue]
    );
  };

  const handleApply = () => {
    onFiltersChange(tempFilters);
    onClose();
  };

  const handleClear = () => {
    setTempFilters([]);
  };

  const handleSelectAll = () => {
    setTempFilters(dataChangeStatusOptions.map((option) => option.value));
  };

  const handleToggleAll = () => {
    if (tempFilters.length === dataChangeStatusOptions.length) {
      handleClear();
    } else {
      handleSelectAll();
    }
  };

  const isAllSelected = tempFilters.length === dataChangeStatusOptions.length;

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
            <FilterListIcon sx={styles.filterIcon} />
            <Typography variant="h6" sx={styles.filterDialogTitleText}>
              FILTER BY STATUS
            </Typography>
          </Box>
          <Button
            size="small"
            variant="outlined"
            onClick={handleToggleAll}
            sx={{
              ...styles.selectAllButton,
              ...(isAllSelected && styles.unselectAllButton),
            }}>
            {isAllSelected ? "Unselect All" : "Select All"}
          </Button>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Box sx={styles.filterDialogContent}>
          {dataChangeStatusOptions.map((option) => (
            <FormControlLabel
              key={option.value}
              control={
                <Checkbox
                  checked={tempFilters.includes(option.value)}
                  onChange={() => handleFilterToggle(option.value)}
                  sx={styles.filterCheckbox}
                />
              }
              label={option.label}
              sx={styles.filterFormControlLabel}
            />
          ))}
        </Box>
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
  selectedFilters,
  onFilterClick,
  isLoading = false,
}) => {
  const hasActiveFilters = selectedFilters.length > 0;
  const iconColor = hasActiveFilters
    ? "rgba(0, 133, 49, 1)"
    : "rgb(33, 61, 112)";

  return (
    <Box sx={styles.searchBarContainer}>
      <Tooltip title="Click here to filter by status" arrow>
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
            <Box sx={styles.filterLabelBox}>
              <span>FILTER</span>
              {hasActiveFilters && (
                <Chip
                  label={selectedFilters.length}
                  size="small"
                  sx={styles.filterCountChip}
                />
              )}
            </Box>
          }
          sx={styles.filterControlLabel(hasActiveFilters)}
        />
      </Tooltip>

      <TextField
        placeholder="Search 201 data change..."
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
                fontSize: "20px",
              }}
            />
          ),
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

const DataChangeMainContainer = () => {
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();
  const methods = useForm();

  const [activeTab, setActiveTab] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilters, setSelectedFilters] = useState([]);
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingFormData, setPendingFormData] = useState(null);

  const [createDataChangeSubmission] = useCreateDataChangeSubmissionMutation();

  const debounceValue = useDebounce(searchQuery, 500);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleSearchChange = useCallback((newSearchQuery) => {
    setSearchQuery(newSearchQuery);
  }, []);

  const handleFilterClick = useCallback(() => {
    setFilterDialogOpen(true);
  }, []);

  const handleFiltersChange = useCallback((newFilters) => {
    setSelectedFilters(newFilters);
  }, []);

  const handleAddNew = useCallback(() => {
    setSelectedEntry(null);
    setModalMode("create");
    setModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setModalOpen(false);
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

    setModalLoading(true);
    setConfirmOpen(false);

    try {
      const result = await createDataChangeSubmission(pendingFormData).unwrap();

      enqueueSnackbar("201 data change created successfully!", {
        variant: "success",
        autoHideDuration: 2000,
      });

      handleCloseModal();
    } catch (error) {
      let errorMessage = "Failed to create 201 data change. Please try again.";

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
      setModalLoading(false);
      setPendingFormData(null);
    }
  }, [
    pendingFormData,
    createDataChangeSubmission,
    enqueueSnackbar,
    handleCloseModal,
  ]);

  const tabsData = [
    {
      label: "For Approval",
      component: (
        <DataChangeForapproval
          searchQuery={debounceValue}
          selectedFilters={selectedFilters}
        />
      ),
      badgeCount: null,
    },
    {
      label: "Rejected",
      component: (
        <DataChangeRejected
          searchQuery={debounceValue}
          selectedFilters={selectedFilters}
        />
      ),
      badgeCount: null,
    },
    {
      label: "For Receiving",
      component: (
        <DataChangeForreceiving
          searchQuery={debounceValue}
          selectedFilters={selectedFilters}
        />
      ),
      badgeCount: null,
    },
    {
      label: "Returned",
      component: (
        <DataChangeReturned
          searchQuery={debounceValue}
          selectedFilters={selectedFilters}
        />
      ),
      badgeCount: null,
    },
    {
      label: "Received",
      component: (
        <DataChangeReceived
          searchQuery={debounceValue}
          selectedFilters={selectedFilters}
        />
      ),
      badgeCount: null,
    },
    {
      label: "Cancelled",
      component: (
        <DataChangeCancelled
          searchQuery={debounceValue}
          selectedFilters={selectedFilters}
        />
      ),
      badgeCount: null,
    },
  ];

  const a11yProps = (index) => {
    return {
      id: `datachange-tab-${index}`,
      "aria-controls": `datachange-tabpanel-${index}`,
    };
  };

  return (
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
          <Paper elevation={0} sx={styles.paperHeader}>
            <Box sx={styles.headerContainer}>
              <Box sx={styles.headerLeftSection}>
                <Typography className="header" sx={styles.headerTitle}>
                  201 DATA CHANGE
                </Typography>
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
                selectedFilters={selectedFilters}
                onFilterClick={handleFilterClick}
                isLoading={isLoading}
              />
            </Box>
          </Paper>

          <StyledTabs
            value={activeTab}
            onChange={handleTabChange}
            aria-label="Data change submissions tabs"
            variant="scrollable"
            scrollButtons="auto"
            allowScrollButtonsMobile>
            {tabsData.map((tab, index) => (
              <StyledTab
                key={index}
                label={
                  tab.badgeCount ? (
                    <Badge
                      badgeContent={tab.badgeCount}
                      color="error"
                      sx={{
                        "& .MuiBadge-badge": {
                          fontSize: "0.75rem",
                          minWidth: 18,
                          height: 18,
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

        <FilterDialog
          open={filterDialogOpen}
          onClose={() => setFilterDialogOpen(false)}
          selectedFilters={selectedFilters}
          onFiltersChange={handleFiltersChange}
        />

        <Dialog
          open={confirmOpen}
          onClose={() => setConfirmOpen(false)}
          maxWidth="xs"
          fullWidth
          PaperProps={{
            sx: styles.confirmDialog,
          }}>
          <DialogTitle sx={{ padding: 0, marginBottom: 2 }}>
            <Box sx={styles.confirmDialogIconBox}>
              <Box sx={styles.confirmDialogIcon}>
                <Typography sx={styles.confirmDialogIconText}>?</Typography>
              </Box>
            </Box>
            <Typography variant="h5" sx={styles.confirmDialogTitle}>
              Confirmation
            </Typography>
          </DialogTitle>
          <DialogContent sx={styles.confirmDialogContent}>
            <Typography variant="body1" sx={styles.confirmDialogMessage}>
              Are you sure you want to create this 201 data change?
            </Typography>
            <Typography variant="body2" sx={styles.confirmDialogSubmissionInfo}>
              New 201 Data Change
            </Typography>
          </DialogContent>
          <DialogActions sx={styles.confirmDialogActions}>
            <Button
              onClick={() => setConfirmOpen(false)}
              variant="outlined"
              sx={styles.confirmCancelButton}
              disabled={modalLoading}>
              CANCEL
            </Button>
            <Button
              onClick={handleConfirmSave}
              variant="contained"
              sx={styles.confirmActionButton}
              disabled={modalLoading}>
              {modalLoading ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                "CONFIRM"
              )}
            </Button>
          </DialogActions>
        </Dialog>

        <DataChangeModal
          open={modalOpen}
          onClose={handleCloseModal}
          onSave={handleSave}
          selectedEntry={selectedEntry}
          isLoading={modalLoading}
          mode={modalMode}
          onModeChange={handleModeChange}
        />
      </Box>
    </FormProvider>
  );
};

export default DataChangeMainContainer;
