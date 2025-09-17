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
    gap: 2,
    flexShrink: 0,
  },
  filterLabelBox: {
    fontSize: "0.75rem",
    fontWeight: 500,
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  filterControlLabel: (hasActiveFilters) => ({
    marginRight: 0,
    "& .MuiFormControlLabel-label": {
      fontSize: "0.75rem",
      fontWeight: 500,
      color: hasActiveFilters ? "#1976d2" : "#666",
    },
    "& .MuiCheckbox-root": {
      padding: "6px",
      color: hasActiveFilters ? "#1976d2" : "#666",
      "&:hover": {
        backgroundColor: "rgba(25, 118, 210, 0.04)",
      },
    },
  }),
  searchIcon: (isLoading) => ({
    color: isLoading ? "#ccc" : "#666",
    fontSize: 18,
    marginRight: 1,
  }),
  searchProgress: {
    color: "#1976d2",
    marginLeft: 1,
  },
  searchInputProps: (isLoading) => ({
    fontSize: "0.875rem",
    backgroundColor: isLoading ? "#f5f5f5" : "transparent",
    "& input": {
      padding: "8px 0px",
      "&::placeholder": {
        color: isLoading ? "#ccc" : "#999",
        opacity: 1,
      },
    },
  }),
  searchTextField: {
    minWidth: 250,
    "& .MuiOutlinedInput-root": {
      borderRadius: 2,
      backgroundColor: "#f8f9fa",
      "& fieldset": {
        borderColor: "#e0e0e0",
      },
      "&:hover fieldset": {
        borderColor: "#1976d2",
      },
      "&.Mui-focused fieldset": {
        borderColor: "#1976d2",
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
  headerLeftSection: {
    display: "flex",
    alignItems: "center",
    gap: 2,
  },
  createButton: {
    textTransform: "uppercase",
    fontWeight: 600,
    fontSize: "0.75rem",
    borderRadius: 2,
    paddingX: 3,
    paddingY: 1,
    backgroundColor: "#1976d2",
    "&:hover": {
      backgroundColor: "#1565c0",
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
