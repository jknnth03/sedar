import { alpha, styled } from "@mui/material";
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
  paddingTop: 8,
  paddingBottom: 8,
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

  headerContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    flexDirection: "row",
    flexShrink: 0,
    minHeight: "72px",
    padding: "12px 14px",
    backgroundColor: "white",
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

  headerLeftSection: {
    display: "flex",
    alignItems: "center",
    gap: 1,
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

  createButtonFull: (isMobile) => ({
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
  }),

  createButton: {
    backgroundColor: "rgb(33, 61, 112)",
    height: "38px",
    width: "140px",
    textTransform: "none",
    fontWeight: 600,
    fontSize: "14px",
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

  tabsSection: {
    flexShrink: 0,
    minHeight: "48px",
    backgroundColor: "white",
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

  paginationContainer: {
    backgroundColor: "#f8f9fa",
    flexShrink: 0,
    display: "flex",
    justifyContent: "center",
    "& .MuiTablePagination-root": {
      color: "rgb(33, 61, 112)",
      "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows":
        {
          fontSize: "14px",
          fontWeight: 500,
          color: "rgb(33, 61, 112)",
        },
      "& .MuiTablePagination-select": {
        fontSize: "14px",
        color: "rgb(33, 61, 112)",
      },
      "& .MuiSelect-icon": {
        color: "rgb(33, 61, 112)",
      },
      "& .MuiIconButton-root": {
        color: "rgb(33, 61, 112)",
        "&:hover": {
          backgroundColor: "rgba(33, 61, 112, 0.04)",
        },
        "&.Mui-disabled": {
          color: "#ccc",
        },
      },
    },
    "& .MuiTablePagination-toolbar": {
      justifyContent: "center",
      paddingLeft: "24px",
      paddingRight: "24px",
    },
    "& .MuiTablePagination-spacer": {
      display: "none",
    },
  },

  filterDialog: {
    borderRadius: 3,
    boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
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

  selectAllButton: {
    textTransform: "uppercase",
    fontSize: "0.75rem",
    fontWeight: 600,
    padding: "4px 12px",
    borderRadius: 2,
    minWidth: "auto",
  },

  unselectAllButton: {
    borderColor: "#f44336",
    color: "#f44336",
    "&:hover": {
      borderColor: "#d32f2f",
      backgroundColor: "rgba(244, 67, 54, 0.04)",
    },
  },

  selectedChipBottom: {
    position: "absolute",
    left: "20px",
    display: "flex",
    alignItems: "center",
  },

  selectedCountChip: {
    backgroundColor: "#4caf50",
    color: "white",
    fontSize: "14px",
    fontWeight: 600,
    height: "28px",
    "& .MuiChip-label": {
      px: 1.5,
      fontSize: "14px",
    },
  },

  filterDialogContent: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 1,
    mt: 1,
  },

  filterCheckbox: {
    color: "rgb(33, 61, 112)",
    "&.Mui-checked": {
      color: "rgb(33, 61, 112)",
    },
  },

  filterFormControlLabel: {
    "& .MuiFormControlLabel-label": {
      fontSize: "14px",
      fontWeight: 500,
    },
    margin: 0,
  },

  filterDialogActions: {
    p: 2.5,
    pt: 1,
    position: "relative",
  },

  dialogActionsContainer: {
    width: "100%",
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "center",
  },

  dialogButtonsContainer: {
    display: "flex",
    gap: 2,
  },

  cancelButton: {
    textTransform: "uppercase",
    fontWeight: 600,
    color: "text.secondary",
    borderColor: "divider",
    paddingX: 3,
    paddingY: 1,
    borderRadius: 2,
    "&:hover": {
      borderColor: "text.secondary",
      backgroundColor: "action.hover",
    },
  },

  applyFiltersButton: {
    textTransform: "uppercase",
    fontWeight: 600,
    paddingX: 3,
    paddingY: 1,
    borderRadius: 2,
    boxShadow: "none",
    "&:hover": {
      boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
    },
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

  filterCountChip: {
    height: 16,
    width: 16,
    fontSize: "10px",
    backgroundColor: "#4caf50",
    color: "white",
    "& .MuiChip-label": {
      px: 0.5,
    },
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

  confirmDialog: {
    borderRadius: 3,
  },

  confirmDialogIconBox: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    mb: 1,
  },

  confirmDialogIcon: {
    fontSize: 60,
    color: "#ff4400",
  },

  confirmDialogTitle: {
    fontWeight: "bold",
    textAlign: "center",
    color: "rgb(33, 61, 112)",
  },

  confirmDialogMessage: {
    gutterBottom: true,
    textAlign: "center",
  },

  confirmDialogSubmissionInfo: {
    color: "text.secondary",
    textAlign: "center",
    mt: 1,
  },

  confirmDialogActionsBox: {
    display: "flex",
    justifyContent: "center",
    width: "100%",
    gap: 2,
    mb: 2,
  },

  confirmCancelButton: {
    borderRadius: 2,
    minWidth: 80,
  },

  confirmActionButton: (confirmAction) => ({
    borderRadius: 2,
    minWidth: 80,
    ...(confirmAction === "update" && {
      backgroundColor: "rgba(0, 133, 49, 1)",
      "&:hover": {
        backgroundColor: "rgba(0, 100, 37, 1)",
      },
    }),
  }),

  tableContainerStyles: {
    flex: 1,
    overflow: "auto",
    backgroundColor: "#white",
    "& .MuiTableCell-head": {
      backgroundColor: "white",
      fontWeight: 700,
      fontSize: "18px",
      color: "rgb(33, 61, 112)",
      textTransform: "uppercase",
      letterSpacing: "0.5px",
      borderBottom: "none",
      position: "sticky",
      top: 0,
      zIndex: 10,
      height: "60px",
      padding: "8px 16px",
      whiteSpace: "nowrap",
    },
    "& .MuiTableCell-body": {
      fontSize: "16px",
      color: "#333",
      borderBottom: "1px solid #f0f0f0",
      padding: "8px 16px",
      height: "52px",
      backgroundColor: "white",
    },
    "& .MuiTableRow-root": {
      transition: "background-color 0.2s ease-in-out",
    },
    "& .MuiTableBody-root .MuiTableRow-root:hover": {
      backgroundColor: "#f8f9fa",
      cursor: "pointer",
      "& .MuiTableCell-root": {
        backgroundColor: "transparent",
      },
    },
    "& .MuiTableHead-root .MuiTableRow-root:hover": {
      backgroundColor: "transparent",
      cursor: "default",
    },
  },

  columnStyles: {
    id: { width: "60px", minWidth: "60px" },
    referenceNumber: { width: "160px", minWidth: "160px" },
    formName: { width: "200px", minWidth: "200px" },
    position: { width: "250px", minWidth: "250px" },
    employmentType: { width: "180px", minWidth: "180px" },
    status: { width: "150px", minWidth: "150px" },
    dateCreated: { width: "160px", minWidth: "160px" },
    history: { width: "80px", minWidth: "80px" },
    actions: { width: "80px", minWidth: "80px" },
  },

  cellContentStyles: {
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },

  statusChip: (config) => ({
    backgroundColor: config.bgColor,
    color: config.color,
    border: `1px solid ${config.color}`,
    fontWeight: 600,
    fontSize: "11px",
    height: "24px",
    borderRadius: "12px",
    "& .MuiChip-label": {
      padding: "0 8px",
    },
  }),

  tableRowHover: (theme) => ({
    cursor: "pointer",
    "&:hover": {
      backgroundColor: alpha(theme.palette.primary.main, 0.04),
      "& .MuiTableCell-root": {
        backgroundColor: "transparent",
      },
    },
    transition: "background-color 0.2s ease",
  }),

  referenceNumberCell: {
    fontWeight: 600,
    color: "#1976d2",
  },

  formNameCell: {
    fontWeight: 600,
  },

  historyIconButton: (theme) => ({
    color: "rgb(33, 61, 112)",
    "&:hover": {
      backgroundColor: alpha(theme.palette.primary.main, 0.1),
    },
  }),

  actionIconButton: (theme) => ({
    color: "rgb(33, 61, 112)",
    "&:hover": {
      backgroundColor: alpha(theme.palette.primary.main, 0.1),
    },
  }),

  actionMenu: (theme) => ({
    minWidth: 150,
    "& .MuiMenuItem-root": {
      fontSize: "14px",
      padding: "8px 16px",
      "&:hover": {
        backgroundColor: alpha(theme.palette.primary.main, 0.08),
      },
    },
  }),

  cancelMenuItem: {
    color: "#d32f2f",
    "&:hover": {
      backgroundColor: alpha("#d32f2f", 0.08),
    },
  },

  cancelMenuItemDisabled: {
    color: "rgba(0, 0, 0, 0.26)",
    "&:hover": {
      backgroundColor: "transparent",
    },
  },

  noDataContainer: {
    py: 8,
    borderBottom: "none",
    color: "#666",
    fontSize: "16px",
  },

  noDataBox: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    height: "100%",
    justifyContent: "center",
    gap: 2,
  },

  historyDialog: {
    borderRadius: 3,
    minHeight: "600px",
    maxHeight: "90vh",
  },

  historyDialogContent: {
    px: 4,
    py: 4,
    backgroundColor: "white",
    position: "relative",
  },

  historyCloseButton: {
    position: "absolute",
    right: 16,
    top: 16,
    color: "rgb(33, 61, 112)",
    "&:hover": {
      backgroundColor: "#f5f5f5",
    },
  },

  historyTitle: {
    fontWeight: 700,
    color: "rgb(33, 61, 112)",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    mb: 3,
    display: "flex",
    alignItems: "center",
    fontSize: "18px",
  },

  historyTitleAccent: {
    width: 4,
    height: 24,
    backgroundColor: "#FF4500",
    borderRadius: 1,
    mr: 2,
  },

  historyTimelineIcon: {
    color: "#FF4500",
    fontSize: 24,
    ml: 0.5,
  },

  historyInfoContainer: {
    mb: 4,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    pl: 3,
  },

  historyInfoBox: {
    flex: 1,
    mr: 3,
  },

  historyInfoBoxLast: {
    flex: 0.4,
  },

  historyInfoTitle: {
    color: "rgb(33, 61, 112)",
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: "0.3px",
    mb: 1,
    fontSize: "14px",
  },

  historyInfoText: {
    color: "#666",
    fontSize: "16px",
  },

  timelineContainer: {
    pl: 2,
  },

  timelineStepContainer: {
    position: "relative",
    display: "flex",
    alignItems: "flex-start",
  },

  timelineConnector: (isCompleted, activity) => ({
    position: "absolute",
    left: "15px",
    top: "32px",
    width: "2px",
    height: "40px",
    backgroundColor: isCompleted
      ? (
          activity.event_type ||
          activity.status ||
          activity.action ||
          ""
        ).toLowerCase() === "rejected" ||
        (
          activity.event_type ||
          activity.status ||
          activity.action ||
          ""
        ).toLowerCase() === "returned"
        ? "#d32f2f"
        : "#4CAF50"
      : "#e0e0e0",
    zIndex: 1,
  }),

  timelineIcon: (isCompleted, activity, statusColor) => ({
    width: 32,
    height: 32,
    borderRadius: "50%",
    backgroundColor: isCompleted
      ? (
          activity.event_type ||
          activity.status ||
          activity.action ||
          ""
        ).toLowerCase() === "rejected" ||
        (
          activity.event_type ||
          activity.status ||
          activity.action ||
          ""
        ).toLowerCase() === "returned"
        ? "#d32f2f"
        : statusColor
      : "#e0e0e0",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "white",
    fontSize: "16px",
    fontWeight: "bold",
    zIndex: 2,
    position: "relative",
  }),

  timelineContent: {
    ml: 3,
    flex: 1,
    p: 2.5,
    backgroundColor: "#fff",
    borderRadius: 2,
    border: "1px solid #f0f0f0",
    transition: "all 0.2s ease-in-out",
    "&:hover": {
      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    },
  },

  timelineContentHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },

  timelineEventType: (activity) => ({
    fontWeight: 600,
    color:
      (
        activity.event_type ||
        activity.status ||
        activity.action ||
        ""
      ).toLowerCase() === "rejected" ||
      (
        activity.event_type ||
        activity.status ||
        activity.action ||
        ""
      ).toLowerCase() === "returned"
        ? "#d32f2f"
        : "rgb(33, 61, 112)",
    fontSize: "16px",
    textTransform: "uppercase",
    mb: 1,
  }),

  timelineDescription: {
    color: "#666",
    mb: 1,
  },

  timelineTimestamp: {
    color: "#999",
    fontSize: "13px",
  },

  timelineVladmirTag: {
    color: "#666",
    display: "block",
    mt: 0.5,
    fontFamily: "monospace",
  },

  timelineActorInfo: {
    textAlign: "right",
  },

  timelineActorName: {
    color: "#333",
    fontWeight: 600,
    fontSize: "14px",
  },

  timelineActorPosition: {
    color: "rgb(33, 61, 112)",
    display: "block",
    fontSize: "14px",
    fontWeight: 500,
    mt: 0.5,
  },

  timelineDescriptionReason: {
    color: "#d32f2f",
  },

  noHistoryContainer: {
    textAlign: "center",
    py: 8,
  },

  noHistoryIcon: {
    fontSize: 64,
    color: "#ccc",
    mb: 2,
  },

  loadingCell: {
    py: 4,
  },

  loadingSpinner: {
    color: "rgb(33, 61, 112)",
  },

  errorCell: {
    py: 4,
  },
};
