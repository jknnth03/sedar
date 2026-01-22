export const kpiStyles = {
  container: {
    width: "100%",
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    backgroundColor: "#ffffff",
  },

  header: (isMobile, isTablet) => ({
    display: "flex",
    alignItems: isMobile || isTablet ? "flex-start" : "center",
    justifyContent: isMobile || isTablet ? "flex-start" : "space-between",
    flexDirection: isMobile || isTablet ? "column" : "row",
    flexShrink: 0,
    minHeight: isMobile || isTablet ? "auto" : "72px",
    padding: isMobile ? "12px 14px" : isTablet ? "16px" : "16px 14px",
    backgroundColor: "white",
    borderBottom: "none",
    boxShadow: "none",
    gap: isMobile || isTablet ? "16px" : "0",
  }),

  headerContent: (isMobile, isTablet, isVerySmall) => ({
    display: "flex",
    alignItems: "center",
    gap: isVerySmall ? 1 : isMobile || isTablet ? 2 : 1.4,
    width: isMobile || isTablet ? "100%" : "auto",
    justifyContent: "flex-start",
  }),

  headerTitle: (isVerySmall, isMobile) => ({
    fontSize: isVerySmall ? "16px" : isMobile ? "18px" : "24px",
    fontWeight: 500,
    color: "rgb(33, 61, 112)",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  }),

  searchContainer: (isVerySmall) => ({
    display: "flex",
    alignItems: "center",
    gap: isVerySmall ? 1 : 1.5,
  }),

  searchTextField: (isVerySmall, isLoading) => ({
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
  },

  searchInput: (isVerySmall) => ({
    flex: isVerySmall ? 1 : "0 0 auto",
    "& .MuiInputBase-input": {
      fontSize: isVerySmall ? "13px" : "14px",
      "&::placeholder": {
        opacity: 0.7,
      },
    },
  }),

  mainContent: {
    flex: 1,
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    backgroundColor: "white",
  },

  tableContainer: (isMobile) => ({
    flex: 1,
    overflow: "auto",
    backgroundColor: "#ffffff",
    "& .MuiTableCell-head": {
      backgroundColor: "#ffffff",
      fontWeight: 700,
      fontSize: isMobile ? "14px" : "18px",
      color: "rgb(33, 61, 112)",
      textTransform: "uppercase",
      letterSpacing: "0.5px",
      borderBottom: "none",
      position: "sticky",
      top: 0,
      zIndex: 10,
      height: isMobile ? "44px" : "48px",
      padding: isMobile ? "6px 12px" : "8px 16px",
    },
    "& .MuiTableCell-body": {
      fontSize: isMobile ? "14px" : "16px",
      color: "#333",
      borderBottom: "1px solid #f0f0f0",
      padding: isMobile ? "6px 12px" : "8px 16px",
      height: isMobile ? "48px" : "52px",
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
  }),

  table: (isMobile) => ({
    minWidth: isMobile ? 600 : 800,
  }),

  tableHeaderCell: (isMobile, width) => ({
    width: width,
    minWidth: width,
  }),

  loadingCell: {
    py: 4,
  },

  loadingSpinner: {
    color: "rgb(33, 61, 112)",
  },

  errorText: (isMobile) => ({
    fontSize: isMobile ? "14px" : "16px",
  }),

  tableRow: (theme) => ({
    cursor: "pointer",
    "&:hover": {
      backgroundColor: theme.palette.primary.main
        ? `${theme.palette.primary.main}0A`
        : "rgba(33, 61, 112, 0.04)",
      "& .MuiTableCell-root": {
        backgroundColor: "transparent",
      },
    },
    transition: "background-color 0.2s ease",
  }),

  idCell: (isMobile) => ({
    width: isMobile ? "60px" : "80px",
    minWidth: isMobile ? "60px" : "80px",
    fontWeight: 600,
    color: "rgb(33, 61, 112)",
  }),

  positionCell: (isMobile) => ({
    width: isMobile ? "200px" : "400px",
    minWidth: isMobile ? "200px" : "400px",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    fontWeight: 600,
  }),

  superiorCell: (isMobile, isNoSuperior) => ({
    width: isMobile ? "180px" : "300px",
    minWidth: isMobile ? "180px" : "300px",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    color: "#666",
    fontStyle: isNoSuperior ? "italic" : "normal",
  }),

  metricsCell: (isMobile) => ({
    width: isMobile ? "80px" : "120px",
    minWidth: isMobile ? "80px" : "120px",
  }),

  metricsIcon: (hasMetrics, isMobile) => ({
    color: hasMetrics ? "#4caf50" : "#f44336",
    fontSize: isMobile ? "20px" : "24px",
  }),

  noDataCell: (isMobile) => ({
    py: 8,
    borderBottom: "none",
    color: "#666",
    fontSize: isMobile ? "14px" : "16px",
  }),

  noDataContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 2,
  },

  noDataTitle: (isMobile) => ({
    fontSize: isMobile ? "16px" : "18px",
  }),

  noDataSubtitle: (isMobile) => ({
    fontSize: isMobile ? "12px" : "14px",
  }),

  paginationContainer: (isMobile) => ({
    borderTop: "none",
    backgroundColor: "#ffffff",
    flexShrink: 0,
    "& .MuiTablePagination-root": {
      color: "#666",
      "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows":
        {
          fontSize: isMobile ? "12px" : "14px",
          fontWeight: 500,
        },
      "& .MuiTablePagination-select": {
        fontSize: isMobile ? "12px" : "14px",
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
  }),

  paginationToolbar: (isMobile) => ({
    "& .MuiTablePagination-toolbar": {
      paddingLeft: isMobile ? "16px" : "24px",
      paddingRight: isMobile ? "16px" : "24px",
      minHeight: isMobile ? "48px" : "52px",
    },
  }),

  dialogPaper: {
    borderRadius: 3,
  },

  dialogIconContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    mb: 1,
  },

  dialogIcon: {
    fontSize: 60,
    color: "#ff4400",
  },

  dialogTitle: {
    fontWeight: "bold",
    textAlign: "center",
    color: "rgb(33, 61, 112)",
  },

  dialogContent: {
    textAlign: "center",
  },

  dialogSubtext: {
    mt: 1,
  },

  dialogActions: {
    display: "flex",
    justifyContent: "center",
    width: "100%",
    gap: 2,
    mb: 2,
  },

  dialogButton: {
    borderRadius: 2,
    minWidth: 80,
  },
};
