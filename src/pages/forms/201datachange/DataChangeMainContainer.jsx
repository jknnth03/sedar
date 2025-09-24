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
  IconButton,
  useMediaQuery,
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
  const theme = useTheme();
  const isVerySmall = useMediaQuery("(max-width:369px)");
  const hasActiveFilters = selectedFilters.length > 0;
  const iconColor = hasActiveFilters
    ? "rgba(0, 133, 49, 1)"
    : "rgb(33, 61, 112)";

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
              {selectedFilters.length}
            </Box>
          )}
        </IconButton>
      ) : (
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
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 0.5,
                }}>
                <span>FILTER</span>
                {hasActiveFilters && (
                  <Chip
                    label={selectedFilters.length}
                    size="small"
                    sx={{
                      backgroundColor: "rgba(0, 133, 49, 1)",
                      color: "white",
                      height: "16px",
                      fontSize: "10px",
                      fontWeight: 600,
                      "& .MuiChip-label": {
                        padding: "0 4px",
                      },
                    }}
                  />
                )}
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
        placeholder={isVerySmall ? "Search..." : "Search 201 data change..."}
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

const DataChangeMainContainer = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.between(600, 1038));
  const isVerySmall = useMediaQuery("(max-width:369px)");
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
    methods.reset();
    setModalOpen(true);
  }, [methods]);

  const handleCloseModal = useCallback(() => {
    setModalOpen(false);
    setSelectedEntry(null);
    setModalMode("create");
    setModalLoading(false);
    methods.reset();
  }, [methods]);

  const handleModeChange = useCallback((newMode) => {
    setModalMode(newMode);
  }, []);

  const handleSave = useCallback(
    async (formData, mode) => {
      setModalLoading(true);

      try {
        const result = await createDataChangeSubmission(formData).unwrap();

        enqueueSnackbar("201 data change created successfully!", {
          variant: "success",
          autoHideDuration: 2000,
        });

        handleCloseModal();
      } catch (error) {
        let errorMessage =
          "Failed to create 201 data change. Please try again.";

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
      }
    },
    [createDataChangeSubmission, enqueueSnackbar, handleCloseModal]
  );

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

  const isLoadingState = isLoading;

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
          <Box
            sx={{
              display: "flex",
              alignItems: isMobile || isTablet ? "flex-start" : "center",
              justifyContent:
                isMobile || isTablet ? "flex-start" : "space-between",
              flexDirection: isMobile || isTablet ? "column" : "row",
              flexShrink: 0,
              minHeight: isMobile || isTablet ? "auto" : "72px",
              padding: isMobile ? "12px 14px" : isTablet ? "16px" : "16px 14px",
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
                {isVerySmall ? "DATA CHANGE" : "201 DATA CHANGE"}
              </Typography>
              <Fade in={!isLoadingState}>
                {isVerySmall ? (
                  <IconButton
                    onClick={handleAddNew}
                    disabled={isLoadingState}
                    sx={{
                      backgroundColor: "rgb(33, 61, 112)",
                      color: "white",
                      width: "36px",
                      height: "36px",
                      borderRadius: "8px",
                      boxShadow: "0 2px 8px rgba(33, 61, 112, 0.2)",
                      transition: "all 0.2s ease-in-out",
                      "&:hover": {
                        backgroundColor: "rgb(25, 45, 84)",
                        boxShadow: "0 4px 12px rgba(33, 61, 112, 0.3)",
                        transform: "translateY(-1px)",
                      },
                      "&:disabled": {
                        backgroundColor: "#ccc",
                        boxShadow: "none",
                      },
                    }}>
                    <AddIcon sx={{ fontSize: "18px" }} />
                  </IconButton>
                ) : (
                  <Button
                    variant="contained"
                    onClick={handleAddNew}
                    startIcon={<AddIcon />}
                    disabled={isLoadingState}
                    sx={{
                      backgroundColor: "rgb(33, 61, 112)",
                      height: isMobile ? "36px" : "38px",
                      width: isMobile ? "auto" : "160px",
                      minWidth: isMobile ? "120px" : "160px",
                      padding: isMobile ? "0 16px" : "0 20px",
                      textTransform: "none",
                      fontWeight: 600,
                      fontSize: isMobile ? "12px" : "14px",
                      borderRadius: "8px",
                      boxShadow: "0 2px 8px rgba(33, 61, 112, 0.2)",
                      transition: "all 0.2s ease-in-out",
                      "& .MuiButton-startIcon": {
                        marginRight: isMobile ? "4px" : "8px",
                      },
                      "&:hover": {
                        backgroundColor: "rgb(25, 45, 84)",
                        boxShadow: "0 4px 12px rgba(33, 61, 112, 0.3)",
                        transform: "translateY(-1px)",
                      },
                      "&:disabled": {
                        backgroundColor: "#ccc",
                        boxShadow: "none",
                      },
                    }}>
                    CREATE
                  </Button>
                )}
              </Fade>
            </Box>

            <CustomSearchBar
              searchQuery={searchQuery}
              setSearchQuery={handleSearchChange}
              selectedFilters={selectedFilters}
              onFilterClick={handleFilterClick}
              isLoading={isLoadingState}
            />
          </Box>

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

        <DataChangeModal
          key={`${modalMode}-${selectedEntry?.id || "new"}`}
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
