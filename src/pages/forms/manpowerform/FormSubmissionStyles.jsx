import { alpha } from "@mui/material";

export const styles = {
  mainContainer: {
    width: "100%",
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    backgroundColor: "#fafafa",
  },

  headerContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    flexShrink: 0,
    minHeight: "72px",
    padding: "16px 14px",
    backgroundColor: "white",
    borderBottom: "1px solid #e0e0e0",
    boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
  },

  headerLeftSection: {
    display: "flex",
    alignItems: "center",
    gap: 1.4,
  },

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

  contentContainer: {
    flex: 1,
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    backgroundColor: "white",
  },

  paginationContainer: {
    borderTop: "1px solid #e0e0e0",
    backgroundColor: "#f8f9fa",
    flexShrink: 0,
    "& .MuiTablePagination-root": {
      color: "#666",
      "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows":
        {
          fontSize: "14px",
          fontWeight: 500,
        },
      "& .MuiTablePagination-select": {
        fontSize: "14px",
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
      paddingLeft: "24px",
      paddingRight: "24px",
    },
  },

  filterDialog: {
    borderRadius: 2,
    minHeight: "350px",
    width: "400px",
    maxWidth: "400px",
  },

  filterDialogTitle: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },

  filterDialogTitleLeft: {
    display: "flex",
    alignItems: "center",
    gap: 1,
  },

  filterIcon: {
    color: "rgb(33, 61, 112)",
  },

  filterDialogTitleText: {
    fontWeight: "bold",
    color: "rgb(33, 61, 112)",
  },

  selectAllButton: {
    textTransform: "none",
    minWidth: "100px",
    height: "32px",
    borderColor: "rgb(33, 61, 112)",
    color: "rgb(33, 61, 112)",
    "&:hover": {
      borderColor: "rgb(25, 45, 84)",
      backgroundColor: "rgba(33, 61, 112, 0.04)",
    },
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
    textTransform: "none",
    borderRadius: 2,
    minWidth: 80,
  },

  applyFiltersButton: {
    backgroundColor: "rgb(33, 61, 112)",
    textTransform: "none",
    borderRadius: 2,
    minWidth: 80,
    "&:hover": {
      backgroundColor: "rgb(25, 45, 84)",
    },
  },

  searchBarContainer: {
    display: "flex",
    alignItems: "center",
    gap: 1.5,
  },

  filterControlLabel: (hasActiveFilters) => ({
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

  filterLabelBox: {
    display: "flex",
    alignItems: "center",
    gap: 0.5,
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
    "& .MuiInputBase-input": {
      fontSize: "14px",
      "&::placeholder": {
        opacity: 0.7,
      },
    },
  },

  searchInputProps: (isLoading) => ({
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

  searchIcon: (isLoading) => ({
    color: isLoading ? "#ccc" : "#666",
    marginRight: 1,
    fontSize: "20px",
  }),

  searchProgress: {
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
    backgroundColor: "#fafafa",
    "& .MuiTableCell-head": {
      backgroundColor: "#f8f9fa",
      fontWeight: 700,
      fontSize: "18px",
      color: "rgb(33, 61, 112)",
      textTransform: "uppercase",
      letterSpacing: "0.5px",
      borderBottom: "2px solid #e0e0e0",
      position: "sticky",
      top: 0,
      zIndex: 10,
      height: "48px",
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
      "&:hover": {
        backgroundColor: "#f8f9fa",
        cursor: "pointer",
        "& .MuiTableCell-root": {
          backgroundColor: "transparent",
        },
      },
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
