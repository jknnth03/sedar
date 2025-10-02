import { styled } from "@mui/material/styles";
import { Tabs, Tab } from "@mui/material";

export const StyledTabs = styled(Tabs)(({ theme }) => ({
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

export const StyledTab = styled(Tab)(({ theme }) => ({
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

export const pendingRegistrationStyles = {
  mainContainer: {
    width: "100%",
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    backgroundColor: "#fafafa",
    overflow: "hidden",
    minWidth: 0,
  },

  contentContainer: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    minWidth: 0,
  },

  headerContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    flexDirection: "row",
    flexShrink: 0,
    minHeight: "72px",
    padding: "16px 14px",
    backgroundColor: "white",
    borderBottom: "1px solid #e0e0e0",
    boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
    gap: "0",
  },

  headerContainerMobile: {
    alignItems: "flex-start",
    justifyContent: "flex-start",
    flexDirection: "column",
    minHeight: "auto",
    padding: "12px 14px",
    gap: "16px",
  },

  headerContainerTablet: {
    alignItems: "flex-start",
    justifyContent: "flex-start",
    flexDirection: "column",
    minHeight: "auto",
    padding: "16px",
    gap: "16px",
  },

  headerTitle: {
    display: "flex",
    alignItems: "center",
    width: "auto",
    justifyContent: "flex-start",
  },

  headerTitleMobile: {
    width: "100%",
  },

  headerTitleText: {
    fontSize: "24px",
    fontWeight: 500,
    color: "rgb(33, 61, 112)",
    letterSpacing: "0.5px",
  },

  headerTitleTextMobile: {
    fontSize: "20px",
  },

  headerTitleTextVerySmall: {
    fontSize: "18px",
  },

  headerPaper: {
    borderRadius: "8px 8px 0 0",
    backgroundColor: "#ffffff",
  },

  tabsSection: {
    flexShrink: 0,
    minHeight: "56px",
    backgroundColor: "white",
    borderBottom: "1px solid #e0e0e0",
  },

  tabsContainer: {
    flex: 1,
    overflow: "hidden",
    minWidth: 0,
    minHeight: 0,
    display: "flex",
    flexDirection: "column",
  },

  tabsStyled: {
    "& .MuiTab-root": {
      textTransform: "none",
      fontWeight: 600,
      fontSize: "13px",
      minHeight: "56px",
      padding: "12px 16px",
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
  },

  tabsStyledVerySmall: {
    "& .MuiTab-root": {
      fontSize: "11px",
      padding: "12px 8px",
    },
  },

  alertContainer: {
    p: 2,
  },

  tabPanel: {
    height: "100%",
    overflow: "hidden",
    minWidth: 0,
    display: "flex",
    flexDirection: "column",
  },

  tabBadge: {
    "& .MuiBadge-badge": {
      fontSize: "11px",
      minWidth: "18px",
      height: "18px",
      borderRadius: "50%",
      top: -2,
      right: -6,
    },
  },

  tabBadgeVerySmall: {
    "& .MuiBadge-badge": {
      fontSize: "10px",
      minWidth: "16px",
      height: "16px",
    },
  },

  errorContainer: {
    p: 4,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 2,
  },

  errorIcon: {
    fontSize: 64,
    color: "error.main",
  },

  searchBarContainer: {
    display: "flex",
    alignItems: "center",
    gap: 1.5,
    width: "auto",
    justifyContent: "flex-start",
  },

  searchBarContainerMobile: {
    width: "100%",
    justifyContent: "flex-end",
    gap: 1.5,
  },

  searchBarContainerTablet: {
    width: "100%",
    justifyContent: "flex-end",
    gap: 1.5,
  },

  searchBarContainerVerySmall: {
    gap: 1,
  },

  filterTooltip: {
    cursor: "pointer",
  },

  filterIconButton: (hasActiveFilters) => ({
    width: "36px",
    height: "36px",
    border: `1px solid ${hasActiveFilters ? "#1976d2" : "#ccc"}`,
    borderRadius: "8px",
    backgroundColor: hasActiveFilters ? "rgba(25, 118, 210, 0.04)" : "white",
    color: hasActiveFilters ? "#1976d2" : "#666",
    transition: "all 0.2s ease-in-out",
    "&:hover": {
      backgroundColor: hasActiveFilters
        ? "rgba(25, 118, 210, 0.08)"
        : "#f5f5f5",
      borderColor: hasActiveFilters ? "#1976d2" : "rgb(33, 61, 112)",
    },
  }),

  filterIconButtonIcon: {
    fontSize: "18px",
  },

  filterControlLabel: (hasActiveFilters) => ({
    margin: 0,
    border: `1px solid ${hasActiveFilters ? "#1976d2" : "#ccc"}`,
    borderRadius: "8px",
    paddingLeft: "8px",
    paddingRight: "12px",
    height: "36px",
    backgroundColor: hasActiveFilters ? "rgba(25, 118, 210, 0.04)" : "white",
    transition: "all 0.2s ease-in-out",
    "&:hover": {
      backgroundColor: hasActiveFilters
        ? "rgba(25, 118, 210, 0.08)"
        : "#f5f5f5",
      borderColor: hasActiveFilters ? "#1976d2" : "rgb(33, 61, 112)",
    },
    "& .MuiFormControlLabel-label": {
      fontSize: "12px",
      fontWeight: 600,
      color: hasActiveFilters ? "#1976d2" : "#666",
      letterSpacing: "0.5px",
    },
  }),

  filterLabelBox: {
    display: "flex",
    alignItems: "center",
    fontSize: "0.875rem",
    fontWeight: 500,
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },

  searchTextField: {
    flex: "0 0 auto",
    "& .MuiInputBase-input": {
      fontSize: "14px",
      "&::placeholder": {
        opacity: 0.7,
      },
    },
  },

  searchTextFieldVerySmall: {
    flex: 1,
    "& .MuiInputBase-input": {
      fontSize: "13px",
      "&::placeholder": {
        opacity: 0.7,
      },
    },
  },

  searchInputProps: (isLoading, isVerySmall, isMobile) => ({
    height: "36px",
    width: isVerySmall ? "100%" : isMobile ? "280px" : "320px",
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
    color: isLoading ? "action.disabled" : "action.active",
    fontSize: isVerySmall ? "18px" : "20px",
    marginRight: 1,
  }),

  searchProgress: {
    color: "primary.main",
    marginLeft: 1,
  },

  filterDialog: {
    borderRadius: 3,
    boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
  },

  filterDialogMobile: {
    margin: 0,
    width: "100%",
    maxHeight: "100%",
    borderRadius: 0,
  },

  filterDialogTitle: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 0,
    marginBottom: 1,
  },

  filterDialogTitleLeft: {
    display: "flex",
    alignItems: "center",
    gap: 1,
  },

  filterIcon: {
    fontSize: 20,
    color: "primary.main",
  },

  filterDialogTitleText: {
    fontWeight: 600,
    fontSize: "18px",
    color: "text.primary",
  },

  filterDialogTitleTextMobile: {
    fontSize: "16px",
  },

  selectAllButton: {
    textTransform: "uppercase",
    fontSize: "0.75rem",
    fontWeight: 600,
    padding: "4px 12px",
    borderRadius: 2,
    minWidth: "auto",
  },

  datePickerContainer: (isMobile) => ({
    gap: isMobile ? 2 : 3,
    flexDirection: isMobile ? "column" : "row",
    pt: 1,
    display: "flex",
  }),

  filterDialogContent: (isMobile) => ({
    padding: isMobile ? "16px 24px" : "20px 24px",
  }),

  filterDialogActions: (isMobile) => ({
    padding: isMobile ? "16px 24px 24px" : "8px 24px 20px",
    justifyContent: "space-between",
  }),

  dialogActionsContainer: {
    width: "100%",
    display: "flex",
    justifyContent: "flex-end",
  },

  dialogButtonsContainer: (isMobile) => ({
    flexDirection: isMobile ? "column" : "row",
    gap: isMobile ? 1 : 2,
    width: isMobile ? "100%" : "auto",
    display: "flex",
  }),

  cancelButton: (isMobile) => ({
    textTransform: "uppercase",
    fontWeight: 600,
    color: "text.secondary",
    borderColor: "divider",
    paddingX: 3,
    paddingY: 1,
    borderRadius: 2,
    width: isMobile ? "100%" : "auto",
    "&:hover": {
      borderColor: "text.secondary",
      backgroundColor: "action.hover",
    },
  }),

  applyFiltersButton: (isMobile) => ({
    textTransform: "uppercase",
    fontWeight: 600,
    paddingX: 3,
    paddingY: 1,
    borderRadius: 2,
    boxShadow: "none",
    width: isMobile ? "100%" : "auto",
    "&:hover": {
      boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
    },
  }),

  confirmDialog: {
    borderRadius: 3,
    padding: 2,
    boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
    textAlign: "center",
  },

  confirmIconContainer: {
    display: "flex",
    justifyContent: "center",
    marginBottom: 2,
  },

  confirmIcon: {
    width: 60,
    height: 60,
    borderRadius: "50%",
    backgroundColor: "#ff4400",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  confirmIconText: {
    color: "white",
    fontSize: "30px",
    fontWeight: "normal",
  },

  confirmTitle: {
    fontWeight: 600,
    color: "rgb(25, 45, 84)",
    marginBottom: 0,
  },

  confirmContent: {
    padding: 0,
    textAlign: "center",
  },

  confirmMessage: {
    marginBottom: 2,
    fontSize: "16px",
    color: "#333",
    fontWeight: 400,
  },

  confirmEmployeeInfo: {
    fontSize: "14px",
    color: "#666",
    fontWeight: 500,
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },

  confirmActions: {
    justifyContent: "center",
    padding: 0,
    marginTop: 3,
    gap: 2,
  },

  confirmCancelButton: {
    textTransform: "uppercase",
    fontWeight: 600,
    borderColor: "#f44336",
    color: "#f44336",
    paddingX: 3,
    paddingY: 1,
    borderRadius: 2,
    "&:hover": {
      borderColor: "#d32f2f",
      backgroundColor: "rgba(244, 67, 54, 0.04)",
    },
  },

  confirmActionButton: (buttonColor) => ({
    textTransform: "uppercase",
    fontWeight: 600,
    backgroundColor: buttonColor === "success" ? "#4caf50" : "#f44336",
    paddingX: 3,
    paddingY: 1,
    borderRadius: 2,
    "&:hover": {
      backgroundColor: buttonColor === "success" ? "#388e3c" : "#d32f2f",
    },
  }),
};
