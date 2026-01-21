import * as React from "react";
import Box from "@mui/material/Box";
import {
  Button,
  Typography,
  TextField,
  Alert,
  Snackbar,
  CircularProgress,
  Badge,
  useMediaQuery,
  useTheme,
  IconButton,
} from "@mui/material";
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
import {
  styles,
  StyledTabs,
  StyledTab,
} from "../../pages/forms/manpowerform/FormSubmissionStyles.jsx";

const TabPanel = ({ children, value, index, ...other }) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`employee-tabpanel-${index}`}
      aria-labelledby={`employee-tab-${index}`}
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
  onOpenFilter,
  isLoading = false,
  activeFilterCount = 0,
}) => {
  const isVerySmall = useMediaQuery("(max-width:369px)");

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: isVerySmall ? 1 : 1.5,
      }}>
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

  const tabMap = {
    0: "general",
    1: "address",
    2: "position",
    3: "emptype",
    4: "attainment",
    5: "account",
    6: "contact",
    7: "file",
    8: "status",
  };

  const reverseTabMap = {
    general: 0,
    address: 1,
    position: 2,
    emptype: 3,
    attainment: 4,
    account: 5,
    contact: 6,
    file: 7,
    status: 8,
  };

  const [activeTab, setActiveTab] = React.useState(
    reverseTabMap[currentParams?.tab] ?? 0
  );
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

  const handleTabChange = React.useCallback(
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
          tab: tabMap[activeTab],
          ...filters,
        },
        { retain: true }
      );
    },
    [setQueryParams, activeTab, filters]
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
          tab: tabMap[activeTab],
          ...newFilters,
        },
        { retain: true }
      );
      setOpenFilterDialog(false);
    },
    [setQueryParams, searchQuery, activeTab]
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

  const tabsData = [
    {
      label: "GENERAL INFORMATION",
      component: <GeneralInformation {...sharedSearchProps} />,
    },
    {
      label: "ADDRESS",
      component: <Address {...sharedSearchProps} />,
    },
    {
      label: "EMPLOYEE POSITION",
      component: <PositionsEmp {...sharedSearchProps} />,
    },
    {
      label: "EMPLOYMENT TYPE",
      component: <EmpTypes {...sharedSearchProps} />,
    },
    {
      label: "ATTAINMENT",
      component: <ATTAINMENTSEMP {...sharedSearchProps} />,
    },
    {
      label: "ACCOUNT",
      component: <ACCOUNTS {...sharedSearchProps} />,
    },
    {
      label: "CONTACT",
      component: <CONTACTS {...sharedSearchProps} />,
    },
    {
      label: "FILE",
      component: <FILES {...sharedSearchProps} />,
    },
    {
      label: "STATUS",
      component: <Status {...sharedSearchProps} />,
    },
  ];

  const a11yProps = (index) => {
    return {
      id: `employee-tab-${index}`,
      "aria-controls": `employee-tabpanel-${index}`,
    };
  };

  return (
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

      <Box sx={styles.tabsSection}>
        <StyledTabs
          value={activeTab}
          onChange={handleTabChange}
          aria-label="employee information tabs"
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
                isVerySmall && tab.label.length > 12
                  ? tab.label
                      .replace("EMPLOYEE ", "EMP ")
                      .replace("INFORMATION", "INFO")
                      .replace("POSITION", "POS")
                      .replace("EMPLOYMENT ", "EMP ")
                  : tab.label
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
