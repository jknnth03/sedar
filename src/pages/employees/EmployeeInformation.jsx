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
  Checkbox,
  FormControlLabel,
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
import ArchiveIcon from "@mui/icons-material/Archive";
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

const CustomSearchBar = ({
  searchQuery,
  setSearchQuery,
  showArchived,
  setShowArchived,
  isLoading = false,
}) => {
  const theme = useTheme();
  const isVerySmall = useMediaQuery("(max-width:369px)");

  const archivedIconColor = showArchived ? "#d32f2f" : "rgb(33, 61, 112)";

  return (
    <Box
      sx={{ display: "flex", alignItems: "center", gap: isVerySmall ? 1 : 1.5 }}
      className="search-bar-container">
      {/* Archived Checkbox - Show only icon for very small screens */}
      {isVerySmall ? (
        <IconButton
          onClick={() => setShowArchived(!showArchived)}
          disabled={isLoading}
          size="small"
          sx={{
            width: "36px",
            height: "36px",
            border: `1px solid ${showArchived ? "#d32f2f" : "#ccc"}`,
            borderRadius: "8px",
            backgroundColor: showArchived ? "rgba(211, 47, 47, 0.04)" : "white",
            color: archivedIconColor,
            transition: "all 0.2s ease-in-out",
            "&:hover": {
              backgroundColor: showArchived
                ? "rgba(211, 47, 47, 0.08)"
                : "#f5f5f5",
              borderColor: showArchived ? "#d32f2f" : "rgb(33, 61, 112)",
            },
          }}>
          <ArchiveIcon sx={{ fontSize: "18px" }} />
        </IconButton>
      ) : (
        <FormControlLabel
          control={
            <Checkbox
              checked={showArchived}
              onChange={(e) => setShowArchived(e.target.checked)}
              disabled={isLoading}
              icon={<ArchiveIcon sx={{ color: archivedIconColor }} />}
              checkedIcon={<ArchiveIcon sx={{ color: archivedIconColor }} />}
              size="small"
            />
          }
          label="ARCHIVED"
          className="archived-checkbox"
          sx={{
            margin: 0,
            border: `1px solid ${showArchived ? "#d32f2f" : "#ccc"}`,
            borderRadius: "8px",
            paddingLeft: "8px",
            paddingRight: "12px",
            height: "36px",
            backgroundColor: showArchived ? "rgba(211, 47, 47, 0.04)" : "white",
            transition: "all 0.2s ease-in-out",
            "&:hover": {
              backgroundColor: showArchived
                ? "rgba(211, 47, 47, 0.08)"
                : "#f5f5f5",
              borderColor: showArchived ? "#d32f2f" : "rgb(33, 61, 112)",
            },
            "& .MuiFormControlLabel-label": {
              fontSize: "12px",
              fontWeight: 600,
              color: archivedIconColor,
              letterSpacing: "0.5px",
            },
          }}
        />
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
  const [showArchived, setShowArchived] = React.useState(
    currentParams?.archived === "true"
  );

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

  const handleChange = React.useCallback(
    (event, newValue) => {
      setQueryParams(
        {
          tab: newValue,
          q: searchQuery,
          archived: showArchived.toString(),
        },
        { retain: true }
      );
      setValue(newValue);
    },
    [setQueryParams, searchQuery, showArchived]
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
          archived: showArchived.toString(),
          tab: value,
        },
        { retain: true }
      );
    },
    [setQueryParams, showArchived, value]
  );

  const handleArchivedChange = React.useCallback(
    (newShowArchived) => {
      setShowArchived(newShowArchived);
      setQueryParams(
        {
          q: searchQuery,
          archived: newShowArchived.toString(),
          tab: value,
        },
        { retain: true }
      );
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
      showArchived,
      debounceValue: debouncedSearchQuery,
      onSearchChange: handleSearchChange,
      onArchivedChange: handleArchivedChange,
      onEdit: (employeeData) => handleOpenModal("update", employeeData),
      isLoading,
    }),
    [
      searchQuery,
      showArchived,
      debouncedSearchQuery,
      handleSearchChange,
      handleArchivedChange,
      handleOpenModal,
      isLoading,
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
          <Fade in={!isLoading}>
            <Badge
              badgeContent={openMrfsCount}
              color="error"
              anchorOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              sx={{
                "& .MuiBadge-badge": {
                  backgroundColor: "#ff4444",
                  color: "white",
                  fontSize: "11px",
                  fontWeight: "bold",
                  minWidth: "18px",
                  height: "18px",
                  transform: "translate(50%, -50%)",
                  border: "2px solid white",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.15)",
                },
              }}>
              {/* CREATE Button - Show only icon for very small screens */}
              {isVerySmall ? (
                <IconButton
                  onClick={() => handleOpenModal("create")}
                  disabled={isLoading}
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
                  onClick={() => handleOpenModal("create")}
                  startIcon={<AddIcon />}
                  disabled={isLoading}
                  className="create-button"
                  sx={{
                    backgroundColor: "rgb(33, 61, 112)",
                    height: isMobile ? "36px" : "38px",
                    width: isMobile ? "auto" : "140px",
                    minWidth: isMobile ? "100px" : "140px",
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
            </Badge>
          </Fade>
        </Box>

        <CustomSearchBar
          searchQuery={searchQuery}
          setSearchQuery={handleSearchChange}
          showArchived={showArchived}
          setShowArchived={handleArchivedChange}
          isLoading={isLoading}
        />
      </Box>

      <EmployeeWizardForm
        open={openModal}
        onClose={handleCloseModal}
        mode={modalMode}
        initialData={editData}
        onSubmit={handleSubmit}
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
                  color: "rgb(33, 61, 112) 78, ",
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
