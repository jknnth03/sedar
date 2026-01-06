import { styled } from "@mui/material/styles";
import { Tabs, Tab } from "@mui/material";

export const styles = {
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
  headerPaper: {
    borderRadius: "8px 8px 0 0",
    backgroundColor: "#ffffff",
  },
  searchBarContainer: {
    display: "flex",
    alignItems: "center",
    gap: 1.5,
  },
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
  filterFormControlLabel: (hasActiveFilters) => ({
    margin: 0,
    border: `1px solid ${hasActiveFilters ? "#4caf50" : "#ccc"}`,
    borderRadius: "8px",
    paddingLeft: "8px",
    paddingRight: "12px",
    height: "36px",
    backgroundColor: hasActiveFilters ? "rgba(76, 175, 80, 0.04)" : "white",
    transition: "all 0.2s ease-in-out",
    "&:hover": {
      backgroundColor: hasActiveFilters ? "rgba(76, 175, 80, 0.08)" : "#f5f5f5",
      borderColor: hasActiveFilters ? "#4caf50" : "rgb(33, 61, 112)",
    },
    "& .MuiFormControlLabel-label": {
      fontSize: "12px",
      fontWeight: 600,
      color: hasActiveFilters ? "#4caf50" : "rgb(33, 61, 112)",
      letterSpacing: "0.5px",
    },
  }),
  searchIcon: (isLoading) => ({
    color: isLoading ? "#ccc" : "#666",
    marginRight: 1,
    fontSize: "20px",
  }),
  searchProgress: {
    color: "#1976d2",
    marginLeft: 1,
  },
  searchInputPropsStyle: (isLoading) => ({
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
  }),
  searchTextField: {
    "& .MuiInputBase-input": {
      fontSize: "14px",
      "&::placeholder": {
        opacity: 0.7,
      },
    },
  },
  headerContainer: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px 24px",
    borderBottom: "1px solid #e0e0e0",
  },
  headerContainerMobile: {
    flexDirection: "column",
    gap: 2,
    alignItems: "stretch",
  },
  headerContainerTablet: {
    flexDirection: "column",
    gap: 2,
    alignItems: "stretch",
  },
  headerLeftSection: {
    display: "flex",
    alignItems: "center",
    gap: 2,
  },
  headerTitle: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
  },
  headerTitleMobile: {
    width: "100%",
  },
  headerTitleText: {
    fontSize: "1.25rem",
    fontWeight: 600,
    color: "rgb(33, 61, 112)",
  },
  headerTitleTextMobile: {
    fontSize: "1rem",
  },
  headerTitleTextVerySmall: {
    fontSize: "0.875rem",
  },
  createIconButton: {
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
  createButton: {
    backgroundColor: "rgb(33, 61, 112)",
    height: "38px",
    width: "140px",
    minWidth: "140px",
    padding: "0 20px",
    textTransform: "none",
    fontWeight: 600,
    fontSize: "14px",
    borderRadius: "8px",
    boxShadow: "0 2px 8px rgba(33, 61, 112, 0.2)",
    transition: "all 0.2s ease-in-out",
    "& .MuiButton-startIcon": {
      marginRight: "8px",
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
  },
  createButtonMobile: {
    height: "36px",
    width: "auto",
    minWidth: "100px",
    padding: "0 16px",
    fontSize: "12px",
    "& .MuiButton-startIcon": {
      marginRight: "4px",
    },
  },
  tabsSection: {
    borderBottom: 1,
    borderColor: "divider",
  },
  tabsStyled: {
    minHeight: 48,
  },
  tabsStyledVerySmall: {
    minHeight: 40,
  },
  tabBadge: {
    "& .MuiBadge-badge": {
      right: -3,
      top: -3,
    },
  },
  tabBadgeVerySmall: {
    "& .MuiBadge-badge": {
      fontSize: "0.55rem",
      minWidth: 14,
      height: 14,
    },
  },
  tabsContainer: {
    flex: 1,
    overflow: "hidden",
    minWidth: 0,
    minHeight: 0,
    display: "flex",
    flexDirection: "column",
  },
  tabPanel: {
    height: "100%",
    overflow: "hidden",
    minWidth: 0,
    flex: 1,
    display: "flex",
    flexDirection: "column",
  },
  tabPanelBox: {
    height: "100%",
    overflow: "hidden",
    minWidth: 0,
    flex: 1,
    display: "flex",
    flexDirection: "column",
  },
  badgeTab: {
    "& .MuiBadge-badge": {
      fontSize: "0.55rem",
      minWidth: 14,
      height: 14,
      borderRadius: "50%",
      top: -2,
      right: -6,
    },
  },
  filterDialog: {
    borderRadius: 3,
    padding: 0,
  },
  filterDialogTitle: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 0,
  },
  filterDialogTitleLeft: {
    display: "flex",
    alignItems: "center",
    gap: 1,
  },
  filterIcon: {
    color: "#1976d2",
    fontSize: 20,
  },
  filterDialogTitleText: {
    fontWeight: 600,
    fontSize: "1rem",
    color: "#333",
  },
  selectAllButton: {
    textTransform: "uppercase",
    fontSize: "0.75rem",
    fontWeight: 600,
    borderColor: "#e0e0e0",
    color: "#666",
    "&:hover": {
      borderColor: "#1976d2",
      color: "#1976d2",
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
    backgroundColor: "#fafafa",
  },
  dialogActionsContainer: {
    display: "flex",
    justifyContent: "flex-end",
    width: "100%",
  },
  dialogButtonsContainer: {
    display: "flex",
    gap: 2,
  },
  cancelButton: {
    textTransform: "uppercase",
    fontWeight: 600,
    borderColor: "#e0e0e0",
    color: "#666",
    paddingX: 3,
    paddingY: 1,
    "&:hover": {
      borderColor: "#1976d2",
      color: "#1976d2",
    },
  },
  applyFiltersButton: {
    textTransform: "uppercase",
    fontWeight: 600,
    backgroundColor: "#1976d2",
    paddingX: 3,
    paddingY: 1,
    "&:hover": {
      backgroundColor: "#1565c0",
    },
  },
  confirmDialog: {
    borderRadius: 3,
    padding: 2,
    boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
    textAlign: "center",
  },
  confirmDialogTitle: {
    padding: 0,
    marginBottom: 2,
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
  confirmDialogContent: {
    padding: 0,
    textAlign: "center",
  },
  confirmMessage: {
    marginBottom: 2,
    fontSize: "16px",
    color: "#333",
    fontWeight: 400,
  },
  confirmSubMessage: {
    fontSize: "14px",
    color: "#666",
    fontWeight: 500,
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  confirmDialogActions: {
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
  confirmSubmitButton: {
    textTransform: "uppercase",
    fontWeight: 600,
    backgroundColor: "#4caf50",
    paddingX: 3,
    paddingY: 1,
    borderRadius: 2,
    "&:hover": {
      backgroundColor: "#388e3c",
    },
  },
};

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
