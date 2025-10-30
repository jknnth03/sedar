import * as React from "react";
import Box from "@mui/material/Box";
import Tab from "@mui/material/Tab";
import TabContext from "@mui/lab/TabContext";
import TabList from "@mui/lab/TabList";
import TabPanel from "@mui/lab/TabPanel";
import {
  Button,
  Typography,
  TextField,
  Alert,
  Snackbar,
  Fade,
  CircularProgress,
  Badge,
  useMediaQuery,
  useTheme,
  IconButton,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import GeneralInformation from "./Generalinformation.jsx";
import Address from "./Address.jsx";
import PositionsEmp from "../../pages/employees/Positionsemp.jsx";
import EmpTypes from "../../pages/employees/EmpTypes.jsx";
import CONTACTS from "../../pages/employees/Contacts.jsx";
import ATTAINMENTSEMP from "../../pages/employees/Attainmentsemp.jsx";
import ACCOUNTS from "../../pages/employees/Accounts.jsx";
import FILES from "../../pages/employees/Files.jsx";
import "../../pages/GeneralStyle.scss";
import "../../pages/GeneralTable.scss";
import "../../styles/mixins.scss";
import { useRememberQueryParams } from "../../hooks/useRememberQueryParams.js";
import useDebounce from "../../hooks/useDebounce";
import EmployeeWizardForm from "../../components/modal/employee/multiFormModal/employeeWizardForm.jsx";
import Status from "./Statuses.jsx";
import { useShowDashboardQuery } from "../../features/api/usermanagement/dashboardApi.js";
import FilterDialog from "./FilterDialog.jsx";

const CustomSearchBar = ({
  searchQuery,
  setSearchQuery,
  onOpenFilter,
  isLoading = false,
  activeFilterCount = 0,
}) => {
  const theme = useTheme();
  const isVerySmall = useMediaQuery("(max-width:369px)");

  return (
    <Box
      sx={{ display: "flex", alignItems: "center", gap: isVerySmall ? 1 : 1.5 }}
      className="search-bar-container">
      {isVerySmall ? (
        <IconButton
          onClick={onOpenFilter}
          disabled={isLoading}
          size="small"
          sx={{
            width: "36px",
            height: "36px",
            border: "1px solid rgb(33, 61, 112)",
            borderRadius: "8px",
            backgroundColor:
              activeFilterCount > 0 ? "rgba(33, 61, 112, 0.04)" : "white",
            color: "rgb(33, 61, 112)",
            transition: "all 0.2s ease-in-out",
            position: "relative",
            "&:hover": {
              backgroundColor: "rgba(33, 61, 112, 0.08)",
              borderColor: "rgb(33, 61, 112)",
            },
          }}>
          <FilterListIcon sx={{ fontSize: "18px" }} />
          {activeFilterCount > 0 && (
            <Box
              sx={{
                position: "absolute",
                top: -4,
                right: -4,
                backgroundColor: "rgb(33, 61, 112)",
                color: "white",
                borderRadius: "50%",
                width: "16px",
                height: "16px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "10px",
                fontWeight: "bold",
                border: "2px solid white",
              }}>
              {activeFilterCount}
            </Box>
          )}
        </IconButton>
      ) : (
        <Button
          variant="outlined"
          onClick={onOpenFilter}
          startIcon={<FilterListIcon />}
          disabled={isLoading}
          sx={{
            margin: 0,
            border: "1px solid rgb(33, 61, 112)",
            borderRadius: "8px",
            paddingLeft: "12px",
            paddingRight: "16px",
            height: "36px",
            minWidth: "100px",
            backgroundColor:
              activeFilterCount > 0 ? "rgba(33, 61, 112, 0.04)" : "white",
            color: "rgb(33, 61, 112)",
            transition: "all 0.2s ease-in-out",
            textTransform: "none",
            fontWeight: 600,
            fontSize: "12px",
            letterSpacing: "0.5px",
            position: "relative",
            "&:hover": {
              backgroundColor: "rgba(33, 61, 112, 0.08)",
              borderColor: "rgb(33, 61, 112)",
            },
            "& .MuiButton-startIcon": {
              marginRight: "6px",
            },
          }}>
          FILTER
          {activeFilterCount > 0 && (
            <Box
              sx={{
                marginLeft: "8px",
                backgroundColor: "rgb(33, 61, 112)",
                color: "white",
                borderRadius: "10px",
                padding: "2px 6px",
                fontSize: "11px",
                fontWeight: "bold",
                minWidth: "20px",
                textAlign: "center",
              }}>
              {activeFilterCount}
            </Box>
          )}
        </Button>
      )}

      <TextField
        placeholder={isVerySmall ? "Search..." : "Search employees..."}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        disabled={isLoading}
        size="small"
        className="search-input"
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
            <CircularProgress size={16} sx={{ marginLeft: 1 }} />
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

function EmployeeInformation() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.between(600, 1038));
  const isVerySmall = useMediaQuery("(max-width:369px)");

  const [currentParams, setQueryParams] = useRememberQueryParams();

  const [value, setValue] = React.useState(currentParams?.tab ?? "1");
  const [openModal, setOpenModal] = React.useState(false);
  const [modalMode, setModalMode] = React.useState("create");
  const [editData, setEditData] = React.useState(null);
  const [searchQuery, setSearchQuery] = React.useState(currentParams?.q ?? "");

  const [openFilterDialog, setOpenFilterDialog] = React.useState(false);
  const [filters, setFilters] = React.useState({
    name: null,
    team: null,
    idNumber: null,
    dateHiredFrom: null,
    dateHiredTo: null,
    status: "ACTIVE",
    type: null,
    department: null,
    manpower: null,
    position: null,
  });

  const [isLoading, setIsLoading] = React.useState(false);
  const [notification, setNotification] = React.useState({
    open: false,
    message: "",
    severity: "success",
  });

  const { data: dashboardData, isLoading: isDashboardLoading } =
    useShowDashboardQuery();

  const openMrfsCount = dashboardData?.result?.employees?.open_mrfs || 0;

  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  const activeFilterCount = React.useMemo(() => {
    let count = 0;
    const defaultFilters = {
      name: null,
      team: null,
      idNumber: null,
      dateHiredFrom: null,
      dateHiredTo: null,
      status: "ACTIVE",
      type: null,
      department: null,
      manpower: null,
      position: null,
    };

    Object.keys(filters).forEach((key) => {
      if (filters[key] !== defaultFilters[key] && filters[key] !== null) {
        count++;
      }
    });
    return count;
  }, [filters]);

  const handleChange = React.useCallback(
    (event, newValue) => {
      setQueryParams(
        {
          tab: newValue,
          q: searchQuery,
          ...filters,
        },
        { retain: true }
      );
      setValue(newValue);
    },
    [setQueryParams, searchQuery, filters]
  );

  const handleOpenModal = React.useCallback((mode = "create", data = null) => {
    setModalMode(mode);
    setEditData(data);
    setOpenModal(true);
  }, []);

  const handleCloseModal = React.useCallback(() => {
    setOpenModal(false);
    setModalMode("create");
    setEditData(null);
  }, []);

  const handleSubmit = React.useCallback(
    async (data, mode) => {
      setIsLoading(true);

      try {
        if (mode === "create") {
          setNotification({
            open: true,
            message: "Employee created successfully!",
            severity: "success",
          });
        } else {
          setNotification({
            open: true,
            message: "Employee updated successfully!",
            severity: "success",
          });
        }

        handleCloseModal();
      } catch (error) {
        setNotification({
          open: true,
          message: `Failed to ${mode} employee. Please try again.`,
          severity: "error",
        });
      } finally {
        setIsLoading(false);
      }
    },
    [editData, handleCloseModal]
  );

  const handleSearchChange = React.useCallback(
    (newSearchQuery) => {
      setSearchQuery(newSearchQuery);
      setQueryParams(
        {
          q: newSearchQuery,
          tab: value,
          ...filters,
        },
        { retain: true }
      );
    },
    [setQueryParams, value, filters]
  );

  const handleOpenFilterDialog = React.useCallback(() => {
    setOpenFilterDialog(true);
  }, []);

  const handleCloseFilterDialog = React.useCallback(() => {
    setOpenFilterDialog(false);
  }, []);

  const handleApplyFilters = React.useCallback(
    (newFilters) => {
      setFilters(newFilters);
      setQueryParams(
        {
          q: searchQuery,
          tab: value,
          ...newFilters,
        },
        { retain: true }
      );
      setOpenFilterDialog(false);
    },
    [setQueryParams, searchQuery, value]
  );

  const handleCloseNotification = React.useCallback((event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setNotification((prev) => ({ ...prev, open: false }));
  }, []);

  const sharedSearchProps = React.useMemo(
    () => ({
      searchQuery,
      debounceValue: debouncedSearchQuery,
      onSearchChange: handleSearchChange,
      onEdit: (employeeData) => handleOpenModal("update", employeeData),
      isLoading,
      filters,
    }),
    [
      searchQuery,
      debouncedSearchQuery,
      handleSearchChange,
      handleOpenModal,
      isLoading,
      filters,
    ]
  );

  const tabs = [
    { label: "GENERAL INFORMATION", value: "1", component: GeneralInformation },
    { label: "ADDRESS", value: "2", component: Address },
    { label: "EMPLOYEE POSITION", value: "3", component: PositionsEmp },
    { label: "EMPLOYMENT TYPE", value: "4", component: EmpTypes },
    { label: "ATTAINMENT", value: "5", component: ATTAINMENTSEMP },
    { label: "ACCOUNT", value: "6", component: ACCOUNTS },
    { label: "CONTACT", value: "7", component: CONTACTS },
    { label: "FILE", value: "8", component: FILES },
    { label: "STATUS", value: "9", component: Status },
  ];

  return (
    <Box
      sx={{
        width: "100%",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        backgroundColor: "#fafafa",
      }}>
      <Box
        sx={{
          display: "flex",
          alignItems: isMobile || isTablet ? "flex-start" : "center",
          justifyContent: isMobile || isTablet ? "flex-start" : "space-between",
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
          <Typography className="header">
            {isVerySmall ? "EMPLOYEE INFO" : "EMPLOYEE INFORMATION"}
          </Typography>
        </Box>

        <CustomSearchBar
          searchQuery={searchQuery}
          setSearchQuery={handleSearchChange}
          onOpenFilter={handleOpenFilterDialog}
          isLoading={isLoading}
          activeFilterCount={activeFilterCount}
        />
      </Box>

      <EmployeeWizardForm
        open={openModal}
        onClose={handleCloseModal}
        mode={modalMode}
        initialData={editData}
        onSubmit={handleSubmit}
      />

      <FilterDialog
        open={openFilterDialog}
        onClose={handleCloseFilterDialog}
        filters={filters}
        onApplyFilters={handleApplyFilters}
      />

      <TabContext value={value}>
        <Box
          sx={{
            flexShrink: 0,
            minHeight: "56px",
            backgroundColor: "white",
            borderBottom: "1px solid #e0e0e0",
          }}>
          <TabList
            onChange={handleChange}
            aria-label="employee information tabs"
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              "& .MuiTab-root": {
                textTransform: "none",
                fontWeight: 600,
                fontSize: isVerySmall ? "11px" : "13px",
                minHeight: "56px",
                padding: isVerySmall ? "12px 8px" : "12px 16px",
                color: "#666",
                transition: "all 0.2s ease-in-out",
                "&.Mui-selected": {
                  color: "rgb(33, 61, 112)",
                  fontWeight: 700,
                },
                "&:hover": {
                  color: "rgb(33, 61, 112)",
                  backgroundColor: "rgba(33, 61, 112, 0.04)",
                },
              },
              "& .MuiTabs-indicator": {
                backgroundColor: "rgb(33, 61, 112)",
                height: "3px",
              },
            }}>
            {tabs.map((tab) => (
              <Tab
                key={tab.value}
                label={
                  isVerySmall && tab.label.length > 12
                    ? tab.label
                        .replace("EMPLOYEE ", "EMP ")
                        .replace("INFORMATION", "INFO")
                    : tab.label
                }
                value={tab.value}
              />
            ))}
          </TabList>
        </Box>

        <Box
          sx={{
            flex: 1,
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            backgroundColor: "white",
          }}>
          {tabs.map((tab) => {
            const Component = tab.component;
            return (
              <TabPanel
                key={tab.value}
                value={tab.value}
                sx={{
                  padding: 0,
                  flex: 1,
                  overflow: "auto",
                  backgroundColor: "#fafafa",
                }}>
                <Component {...sharedSearchProps} />
              </TabPanel>
            );
          })}
        </Box>
      </TabContext>

      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}>
        <Alert
          onClose={handleCloseNotification}
          severity={notification.severity}
          variant="filled"
          sx={{
            width: "100%",
            fontWeight: 500,
            "& .MuiAlert-message": {
              fontSize: "14px",
            },
          }}>
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default EmployeeInformation;
