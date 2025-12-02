import { alpha } from "@mui/material";

export const createSubmissionApprovalStyles = (
  theme,
  isMobile,
  isTablet,
  isVerySmall
) => ({
  mainContainer: {
    width: "100%",
    height: "100%",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    backgroundColor: "white",
  },

  headerContainer: {
    display: "flex",
    alignItems: isMobile || isTablet ? "flex-start" : "center",
    justifyContent: isMobile || isTablet ? "flex-start" : "space-between",
    flexDirection: isMobile || isTablet ? "column" : "row",
    flexShrink: 0,
    minHeight: isMobile || isTablet ? "auto" : "60px",
    padding: isMobile ? "12px 14px" : isTablet ? "16px" : "12px 16px",
    backgroundColor: "white",
    borderBottom: "1px solid #e0e0e0",
    boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
    gap: isMobile || isTablet ? "16px" : "0",
  },

  headerLeft: {
    display: "flex",
    alignItems: "center",
    gap: isVerySmall ? 1 : isMobile || isTablet ? 2 : 1.4,
    width: isMobile || isTablet ? "100%" : "auto",
    justifyContent: "flex-start",
  },

  searchContainer: {
    display: "flex",
    alignItems: "center",
    gap: 1.5,
  },

  searchTextField: (isLoading) => ({
    flex: isVerySmall ? 1 : "0 0 auto",
    "& .MuiInputBase-input": {
      fontSize: isVerySmall ? "13px" : "14px",
      "&::placeholder": {
        opacity: 0.7,
      },
    },
  }),

  searchInputProps: (isLoading) => ({
    startAdornment: (SearchIcon) => SearchIcon,
    endAdornment: (LoadingIcon) => (isLoading ? LoadingIcon : null),
    sx: {
      height: "36px",
      width: isVerySmall ? "100%" : "380px",
      minWidth: isVerySmall ? "180px" : "280px",
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
  }),

  searchIcon: (isLoading) => ({
    color: isLoading ? "#ccc" : "#666",
    marginRight: 1,
    fontSize: isVerySmall ? "18px" : "20px",
  }),

  searchProgress: {
    marginLeft: 1,
  },

  tableMainContainer: {
    flex: 1,
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    backgroundColor: "white",
  },

  tableContainer: {
    flex: 1,
    overflow: "auto",
    "& .MuiTableCell-head": {
      backgroundColor: "#f8f9fa",
      fontWeight: 700,
      fontSize: isVerySmall ? "14px" : isMobile ? "16px" : "18px",
      color: "rgb(33, 61, 112)",
      textTransform: "uppercase",
      letterSpacing: "0.5px",
      borderBottom: "2px solid #e0e0e0",
      position: "sticky",
      top: 0,
      zIndex: 10,
      height: isMobile ? "44px" : "48px",
      padding: isMobile ? "6px 12px" : "8px 16px",
    },
    "& .MuiTableCell-body": {
      fontSize: isVerySmall ? "12px" : isMobile ? "14px" : "16px",
      color: "#333",
      borderBottom: "1px solid #f0f0f0",
      padding: isMobile ? "6px 12px" : "8px 16px",
      height: isMobile ? "48px" : "52px",
    },
    "& .MuiTableRow-root": {
      transition: "background-color 0.2s ease-in-out",
      "&:hover": {
        backgroundColor: "#f8f9fa",
      },
    },
  },

  headerCellId: {
    width: isVerySmall ? "60px" : isMobile ? "70px" : "80px",
    minWidth: isVerySmall ? "60px" : isMobile ? "70px" : "80px",
  },

  headerCellReference: {
    width: isVerySmall ? "120px" : isMobile ? "150px" : "180px",
    minWidth: isVerySmall ? "120px" : isMobile ? "150px" : "180px",
  },

  headerCellPosition: {
    width: isVerySmall ? "150px" : isMobile ? "200px" : "250px",
    minWidth: isVerySmall ? "150px" : isMobile ? "200px" : "250px",
  },

  headerCellRequisition: {
    width: isVerySmall ? "120px" : isMobile ? "180px" : "220px",
    minWidth: isVerySmall ? "120px" : isMobile ? "180px" : "220px",
  },

  headerCellRequested: {
    width: isVerySmall ? "150px" : isMobile ? "200px" : "250px",
    minWidth: isVerySmall ? "150px" : isMobile ? "200px" : "250px",
  },

  headerCellDepartment: {
    width: isVerySmall ? "100px" : isMobile ? "140px" : "180px",
    minWidth: isVerySmall ? "100px" : isMobile ? "140px" : "180px",
  },

  headerCellStatus: {
    width: "120px",
    minWidth: "120px",
  },

  headerCellDate: {
    width: isVerySmall ? "100px" : isMobile ? "120px" : "150px",
    minWidth: isVerySmall ? "100px" : isMobile ? "120px" : "150px",
  },

  tableRow: {
    cursor: "pointer",
    "&:hover": {
      backgroundColor: "#f8f9fa",
    },
  },

  cellEllipsis: {
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },

  cellPosition: {
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    fontWeight: 600,
  },

  loadingCell: {
    py: 4,
  },

  loadingProgress: {
    color: "rgb(33, 61, 112)",
  },

  errorCell: {
    py: 4,
  },

  errorText: {
    fontSize: isVerySmall ? "12px" : "14px",
  },

  emptyStateContainer: {
    py: 8,
    borderBottom: "none",
    color: "#666",
    fontSize: isMobile ? "14px" : "16px",
  },

  emptyStateBox: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 2,
  },

  emptyStateTitle: {
    fontSize: isVerySmall ? "14px" : "16px",
  },

  emptyStateSubtitle: {
    fontSize: isVerySmall ? "12px" : "14px",
  },

  statusChip: (status) => {
    const chipProps = {
      pending: {
        backgroundColor: "#fff3e0",
        color: "#ed6c02",
        borderColor: "#ff9800",
      },
      approved: {
        backgroundColor: "#e8f5e8",
        color: "#2e7d32",
        borderColor: "#4caf50",
      },
      rejected: {
        backgroundColor: "#ffebee",
        color: "#d32f2f",
        borderColor: "#f44336",
      },
    };

    const props = chipProps[status] || chipProps.pending;

    return {
      backgroundColor: props.backgroundColor,
      color: props.color,
      border: `1px solid ${props.borderColor}`,
      fontWeight: 600,
      fontSize: "11px",
      height: "24px",
      borderRadius: "12px",
      "& .MuiChip-label": {
        padding: "0 8px",
      },
    };
  },

  paginationContainer: {
    borderTop: "1px solid #e0e0e0",
    backgroundColor: "#f8f9fa",
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
  },

  paginationToolbar: {
    paddingLeft: isMobile ? "12px" : "24px",
    paddingRight: isMobile ? "12px" : "24px",
  },
});
