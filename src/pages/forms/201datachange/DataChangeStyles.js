export const styles = {
  // Container styles
  mainContainer: {
    width: "100%",
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    backgroundColor: "#fafafa",
    minWidth: 0,
  },

  flexContainer: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    minWidth: 0,
  },

  // Header styles
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

  headerLeft: (isMobile, isTablet, isVerySmall) => ({
    display: "flex",
    alignItems: "center",
    gap: isVerySmall ? 1 : isMobile || isTablet ? 2 : 1.4,
    width: isMobile || isTablet ? "100%" : "auto",
    justifyContent: "flex-start",
  }),

  headerTitle: (isVerySmall, isMobile) => ({
    fontSize: isVerySmall ? "18px" : isMobile ? "20px" : "24px",
    fontWeight: 500,
    color: "rgb(33, 61, 112)",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  }),

  // Button styles
  addButtonIcon: {
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
  },

  addButtonIconSize: {
    fontSize: "18px",
  },

  addButton: (isMobile) => ({
    backgroundColor: "rgb(33, 61, 112)",
    height: isMobile ? "36px" : "38px",
    width: isMobile ? "auto" : "160px",
    minWidth: isMobile ? "120px" : "160px",
    padding: isMobile ? "0 16px" : "0 20px",
    fontSize: "12px",
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: "0.5px",
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
  }),

  // Search bar styles
  searchBarContainer: (isVerySmall) => ({
    display: "flex",
    alignItems: "center",
    gap: isVerySmall ? 1 : 1.5,
  }),

  filterIconButton: (hasActiveFilters) => ({
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

  filterIconSize: {
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

  filterCheckbox: (hasActiveFilters) => ({
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

  searchTextField: (isVerySmall) => ({
    flex: isVerySmall ? 1 : "0 0 auto",
    "& .MuiInputBase-input": {
      fontSize: isVerySmall ? "13px" : "14px",
      "&::placeholder": {
        opacity: 0.7,
      },
    },
  }),

  searchTextFieldInput: (isLoading, isVerySmall) => ({
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

  // Filter dialog styles
  filterDialog: {
    borderRadius: "12px",
    boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
  },

  filterDialogTitle: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
  },

  filterDialogTitleLeft: {
    display: "flex",
    alignItems: "center",
    gap: 1.5,
  },

  filterIcon: {
    color: "rgb(33, 61, 112)",
    fontSize: "24px",
  },

  filterDialogTitleText: {
    fontWeight: 600,
    color: "rgb(33, 61, 112)",
    fontSize: "18px",
    letterSpacing: "0.5px",
  },

  selectAllButton: {
    fontSize: "11px",
    fontWeight: 600,
    padding: "4px 12px",
    borderColor: "#ccc",
    color: "#666",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    "&:hover": {
      borderColor: "rgb(33, 61, 112)",
      backgroundColor: "rgba(33, 61, 112, 0.04)",
      color: "rgb(33, 61, 112)",
    },
    "&:disabled": {
      borderColor: "#e0e0e0",
      color: "#ccc",
    },
  },

  datePickerContainer: {
    display: "flex",
    flexDirection: "column",
    gap: 2,
    pt: 1,
  },

  filterDialogActions: {
    padding: "16px 24px",
    borderTop: "1px solid #e0e0e0",
  },

  dialogActionsContainer: {
    display: "flex",
    justifyContent: "flex-end",
    width: "100%",
  },

  dialogButtonsContainer: {
    display: "flex",
    gap: 1.5,
  },

  cancelButton: {
    fontSize: "12px",
    fontWeight: 600,
    padding: "8px 24px",
    borderColor: "#ccc",
    color: "#666",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    "&:hover": {
      borderColor: "rgb(33, 61, 112)",
      backgroundColor: "rgba(33, 61, 112, 0.04)",
      color: "rgb(33, 61, 112)",
    },
  },

  applyFiltersButton: {
    fontSize: "12px",
    fontWeight: 600,
    padding: "8px 24px",
    backgroundColor: "rgb(33, 61, 112)",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    boxShadow: "0 2px 8px rgba(33, 61, 112, 0.2)",
    "&:hover": {
      backgroundColor: "rgb(25, 45, 84)",
      boxShadow: "0 4px 12px rgba(33, 61, 112, 0.3)",
    },
  },

  // Tab panel styles
  tabPanelContainer: (value, index) => ({
    height: "100%",
    minWidth: 0,
    display: value === index ? "flex" : "none",
    flexDirection: "column",
  }),

  tabPanelBox: {
    height: "100%",
    minWidth: 0,
    flex: 1,
    display: "flex",
    flexDirection: "column",
  },

  contentContainer: {
    flex: 1,
    minWidth: 0,
    minHeight: 0,
    display: "flex",
    flexDirection: "column",
  },

  // Badge styles
  badgeDot: {
    "& .MuiBadge-dot": {
      minWidth: "8px",
      height: "8px",
      borderRadius: "50%",
      padding: 0,
      top: "8px",
      right: "-10px",
    },
  },
};
