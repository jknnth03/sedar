import React, { useState, useMemo, useCallback } from "react";
import {
  Typography,
  Box,
  IconButton,
  Tooltip,
  TextField,
  Checkbox,
  FormControlLabel,
  Badge,
  useMediaQuery,
  CircularProgress,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import ArchiveIcon from "@mui/icons-material/Archive";
import SearchIcon from "@mui/icons-material/Search";
import PendingUserAccount from "./PendingUserAccount";
import ActiveUserAccount from "./ActiveUserAccount";
import "../GeneralStyle.scss";
import useDebounce from "../../hooks/useDebounce";
import { useRememberQueryParams } from "../../hooks/useRememberQueryParams";
import "../../pages/GeneralStyle.scss";
import "../../pages/GeneralTable.scss";
import {
  styles,
  StyledTabs,
  StyledTab,
} from "../forms/manpowerform/FormSubmissionStyles";

const CustomSearchBar = ({
  searchQuery,
  setSearchQuery,
  showArchived,
  onFilterClick,
  isLoading = false,
}) => {
  const isVerySmall = useMediaQuery("(max-width:369px)");
  const hasActiveFilters = showArchived;

  const iconColor = hasActiveFilters
    ? "rgba(211, 47, 47, 1)"
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
              hasActiveFilters ? "rgba(211, 47, 47, 1)" : "#ccc"
            }`,
            borderRadius: "8px",
            backgroundColor: hasActiveFilters
              ? "rgba(211, 47, 47, 0.04)"
              : "white",
            color: iconColor,
            position: "relative",
            transition: "all 0.2s ease-in-out",
            "&:hover": {
              backgroundColor: hasActiveFilters
                ? "rgba(211, 47, 47, 0.08)"
                : "#f5f5f5",
              borderColor: hasActiveFilters
                ? "rgba(211, 47, 47, 1)"
                : "rgb(33, 61, 112)",
            },
          }}>
          <ArchiveIcon sx={{ fontSize: "18px" }} />
          {hasActiveFilters && (
            <Box
              sx={{
                position: "absolute",
                top: "-6px",
                right: "-6px",
                backgroundColor: "rgba(211, 47, 47, 1)",
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
        <Tooltip title="Click here to view archived users" arrow>
          <FormControlLabel
            control={
              <Checkbox
                checked={hasActiveFilters}
                onChange={onFilterClick}
                disabled={isLoading}
                icon={<ArchiveIcon sx={{ color: iconColor }} />}
                checkedIcon={<ArchiveIcon sx={{ color: iconColor }} />}
                size="small"
              />
            }
            label={
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <span>ARCHIVED</span>
              </Box>
            }
            sx={{
              margin: 0,
              border: `1px solid ${hasActiveFilters ? "#d32f2f" : "#ccc"}`,
              borderRadius: "8px",
              paddingLeft: "8px",
              paddingRight: "12px",
              height: "36px",
              backgroundColor: hasActiveFilters
                ? "rgba(211, 47, 47, 0.04)"
                : "white",
              transition: "all 0.2s ease-in-out",
              "&:hover": {
                backgroundColor: hasActiveFilters
                  ? "rgba(211, 47, 47, 0.08)"
                  : "#f5f5f5",
                borderColor: hasActiveFilters ? "#d32f2f" : "rgb(33, 61, 112)",
              },
              "& .MuiFormControlLabel-label": {
                fontSize: "12px",
                fontWeight: 600,
                color: hasActiveFilters ? "#d32f2f" : "rgb(33, 61, 112)",
                letterSpacing: "0.5px",
              },
            }}
          />
        </Tooltip>
      )}

      <TextField
        placeholder={isVerySmall ? "Search..." : "Search Users..."}
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

const TabPanel = ({ children, value, index, ...other }) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`user-tabpanel-${index}`}
      aria-labelledby={`user-tab-${index}`}
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

const User = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.between(600, 1038));
  const isVerySmall = useMediaQuery("(max-width:369px)");

  const [currentParams, setQueryParams] = useRememberQueryParams();

  const tabMap = {
    0: "active",
    1: "pending",
  };

  const reverseTabMap = {
    active: 0,
    pending: 1,
  };

  const [activeTab, setActiveTab] = useState(
    reverseTabMap[currentParams?.tab] ?? 0
  );
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState(currentParams?.q ?? "");
  const [showArchived, setShowArchived] = useState(false);

  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  const handleTabChange = useCallback(
    (event, newValue) => {
      setActiveTab(newValue);
      setPage(0);
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
    (query) => {
      setSearchQuery(query);
      setPage(0);
      setQueryParams(
        {
          tab: tabMap[activeTab],
          q: query,
        },
        { retain: true }
      );
    },
    [setQueryParams, activeTab]
  );

  const handleFilterClick = useCallback(() => {
    setShowArchived((prev) => !prev);
    setPage(0);
  }, []);

  const handlePageChange = useCallback((event, newPage) => {
    setPage(newPage);
  }, []);

  const handleRowsPerPageChange = useCallback((event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  }, []);

  const a11yProps = (index) => {
    return {
      id: `user-tab-${index}`,
      "aria-controls": `user-tabpanel-${index}`,
    };
  };

  const tabsData = [
    {
      label: "ACTIVE USER ACCOUNT",
      badgeCount: 0,
    },
    {
      label: "PENDING USER ACCOUNT",
      badgeCount: 0,
    },
  ];

  return (
    <>
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
              USERS
            </Typography>
          </Box>

          <CustomSearchBar
            searchQuery={searchQuery}
            setSearchQuery={handleSearchChange}
            showArchived={showArchived}
            onFilterClick={handleFilterClick}
            isLoading={false}
          />
        </Box>

        <Box sx={styles.tabsSection}>
          <StyledTabs
            value={activeTab}
            onChange={handleTabChange}
            aria-label="User tabs"
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
          <TabPanel value={activeTab} index={0}>
            <ActiveUserAccount
              page={page}
              rowsPerPage={rowsPerPage}
              searchQuery={debouncedSearchQuery}
              showArchived={showArchived}
              onPageChange={handlePageChange}
              onRowsPerPageChange={handleRowsPerPageChange}
            />
          </TabPanel>

          <TabPanel value={activeTab} index={1}>
            <PendingUserAccount
              page={page}
              rowsPerPage={rowsPerPage}
              searchQuery={debouncedSearchQuery}
              showArchived={showArchived}
              onPageChange={handlePageChange}
              onRowsPerPageChange={handleRowsPerPageChange}
            />
          </TabPanel>
        </Box>
      </Box>
    </>
  );
};

export default User;
