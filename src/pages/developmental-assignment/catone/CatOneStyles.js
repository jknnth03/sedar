export const catOneStyles = {
  mainContainer: {
    width: "100%",
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    backgroundColor: "#fafafa",
    minWidth: 0,
  },

  innerContainer: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    minWidth: 0,
  },

  headerContainer: (isMobile, isTablet) => ({
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
  }),

  titleContainer: (isVerySmall, isMobile, isTablet) => ({
    display: "flex",
    alignItems: "center",
    gap: isVerySmall ? 1 : isMobile || isTablet ? 2 : 1.4,
    width: isMobile || isTablet ? "100%" : "auto",
    justifyContent: "flex-start",
  }),

  title: (isVerySmall, isMobile) => ({
    fontSize: isVerySmall ? "18px" : isMobile ? "20px" : "24px",
    fontWeight: 500,
    color: "rgb(33, 61, 112)",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  }),

  tabsContainer: {
    flex: 1,
    minWidth: 0,
    minHeight: 0,
    display: "flex",
    flexDirection: "column",
  },

  tabPanel: (value, index) => ({
    height: "100%",
    minWidth: 0,
    display: value === index ? "flex" : "none",
    flexDirection: "column",
  }),

  tabPanelInner: {
    height: "100%",
    minWidth: 0,
    flex: 1,
    display: "flex",
    flexDirection: "column",
  },

  searchContainer: (isVerySmall) => ({
    display: "flex",
    alignItems: "center",
    gap: isVerySmall ? 1 : 1.5,
  }),

  filterButton: (hasActiveFilters) => ({
    width: "36px",
    height: "36px",
    border: `1px solid ${hasActiveFilters ? "rgba(0, 133, 49, 1)" : "#ccc"}`,
    borderRadius: "8px",
    backgroundColor: hasActiveFilters ? "rgba(0, 133, 49, 0.04)" : "white",
    color: hasActiveFilters ? "rgba(0, 133, 49, 1)" : "rgb(33, 61, 112)",
    position: "relative",
    transition: "all 0.2s ease-in-out",
    "&:hover": {
      backgroundColor: hasActiveFilters ? "rgba(0, 133, 49, 0.08)" : "#f5f5f5",
      borderColor: hasActiveFilters
        ? "rgba(0, 133, 49, 1)"
        : "rgb(33, 61, 112)",
    },
  }),

  filterIcon: {
    fontSize: "18px",
  },

  filterBadge: {
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
  },

  filterFormControl: (hasActiveFilters) => ({
    margin: 0,
    border: `1px solid ${hasActiveFilters ? "rgba(0, 133, 49, 1)" : "#ccc"}`,
    borderRadius: "8px",
    paddingLeft: "8px",
    paddingRight: "12px",
    height: "36px",
    backgroundColor: hasActiveFilters ? "rgba(0, 133, 49, 0.04)" : "white",
    transition: "all 0.2s ease-in-out",
    "&:hover": {
      backgroundColor: hasActiveFilters ? "rgba(0, 133, 49, 0.08)" : "#f5f5f5",
      borderColor: hasActiveFilters
        ? "rgba(0, 133, 49, 1)"
        : "rgb(33, 61, 112)",
    },
    "& .MuiFormControlLabel-label": {
      fontSize: "12px",
      fontWeight: 600,
      color: hasActiveFilters ? "rgba(0, 133, 49, 1)" : "rgb(33, 61, 112)",
      letterSpacing: "0.5px",
    },
  }),

  filterLabelBox: {
    display: "flex",
    alignItems: "center",
    gap: 0.5,
  },

  searchTextField: (isVerySmall, isLoading) => ({
    flex: isVerySmall ? 1 : "0 0 auto",
    "& .MuiInputBase-input": {
      fontSize: isVerySmall ? "13px" : "14px",
      "&::placeholder": {
        opacity: 0.7,
      },
    },
  }),

  searchInputProps: (isVerySmall, isLoading) => ({
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
  }),

  searchIcon: (isLoading, isVerySmall) => ({
    color: isLoading ? "#ccc" : "#666",
    marginRight: 1,
    fontSize: isVerySmall ? "18px" : "20px",
  }),

  searchProgress: {
    marginLeft: 1,
    color: "rgb(33, 61, 112)",
  },

  datePickerContainer: {
    display: "flex",
    flexDirection: "column",
    gap: 2,
    pt: 1,
  },

  badgeStyle: {
    "& .MuiBadge-badge": {
      fontSize: "0.75rem",
      minWidth: 18,
      height: 18,
    },
  },
};

export const styledTabsConfig = (theme) => ({
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
});

export const styledTabConfig = (theme) => ({
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
});
