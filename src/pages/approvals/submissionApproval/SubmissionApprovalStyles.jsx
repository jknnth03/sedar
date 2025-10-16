import { alpha } from "@mui/material";

export const createSubmissionApprovalStyles = (theme) => ({
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

  headerLeft: {
    display: "flex",
    alignItems: "center",
    gap: 2,
  },

  searchContainer: {
    display: "flex",
    alignItems: "center",
    gap: 1.5,
  },

  archivedCheckbox: (showArchived) => ({
    margin: 0,
    border: `1px solid ${showArchived ? "#d32f2f" : "#ccc"}`,
    borderRadius: "8px",
    paddingLeft: "8px",
    paddingRight: "12px",
    height: "36px",
    backgroundColor: showArchived ? "rgba(211, 47, 47, 0.04)" : "white",
    transition: "all 0.2s ease-in-out",
    "&:hover": {
      backgroundColor: showArchived ? "rgba(211, 47, 47, 0.08)" : "#f5f5f5",
      borderColor: showArchived ? "#d32f2f" : "rgb(33, 61, 112)",
    },
    "& .MuiFormControlLabel-label": {
      fontSize: "12px",
      fontWeight: 600,
      color: showArchived ? "#d32f2f" : "rgb(33, 61, 112)",
      letterSpacing: "0.5px",
    },
  }),

  searchTextField: (isLoading) => ({
    "& .MuiInputBase-input": {
      fontSize: "14px",
      "&::placeholder": {
        opacity: 0.7,
      },
    },
    "& .MuiOutlinedInput-root": {
      height: "36px",
      width: "320px",
      backgroundColor: "white",
      transition: "all 0.2s ease-in-out",
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

  table: {
    minWidth: 1500,
  },

  idCell: {
    width: "80px",
    minWidth: "80px",
  },

  titleCell: {
    width: "250px",
    minWidth: "250px",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    fontWeight: 600,
  },

  submitterCell: {
    width: "200px",
    minWidth: "200px",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },

  formTypeCell: {
    width: "150px",
    minWidth: "150px",
    fontSize: "12px",
    backgroundColor: "#f8f9fa",
    borderRadius: "4px",
    padding: "4px 8px",
    margin: "0 4px",
    color: "rgb(33, 61, 112)",
  },

  statusCell: {
    width: "120px",
    minWidth: "120px",
  },

  dateCell: {
    width: "150px",
    minWidth: "150px",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },

  tableRow: (theme) => ({
    cursor: "pointer",
    "&:hover": {
      backgroundColor: alpha(theme.palette.primary.main, 0.04),
      "& .MuiTableCell-root": {
        backgroundColor: "transparent",
      },
    },
    transition: "background-color 0.2s ease",
  }),

  loadingCell: {
    py: 4,
  },

  loadingProgress: {
    color: "rgb(33, 61, 112)",
  },

  errorCell: {
    py: 4,
  },

  emptyStateContainer: {
    py: 8,
    borderBottom: "none",
    color: "#666",
    fontSize: "16px",
  },

  emptyStateBox: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 2,
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
  },

  paginationToolbar: {
    paddingLeft: "24px",
    paddingRight: "24px",
  },
});
