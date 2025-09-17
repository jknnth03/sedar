export const positionStyles = {
  // Main container styles
  mainContainer: {
    width: "100%",
    height: "100%",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    backgroundColor: "white",
  },

  // Header section styles
  headerContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    flexShrink: 0,
    minHeight: "60px",
    padding: "12px 16px",
    backgroundColor: "white",
    borderBottom: "1px solid #e0e0e0",
  },

  headerLeftSection: {
    display: "flex",
    alignItems: "center",
    gap: 2,
  },

  createButton: {
    backgroundColor: "rgb(33, 61, 112)",
    "&:hover": {
      backgroundColor: "rgb(25, 45, 85)",
    },
    textTransform: "none",
    fontWeight: 600,
    fontSize: "12px",
    height: "36px",
  },

  // Search bar styles
  searchBarContainer: {
    display: "flex",
    alignItems: "center",
    gap: 1.5,
  },

  archiveCheckbox: (showArchived) => ({
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

  searchProgressSpinner: {
    marginLeft: 1,
  },

  // Table container styles
  tableContainer: {
    flex: 1,
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    backgroundColor: "white",
  },

  tableContainerStyles: {
    flex: 1,
    overflow: "auto",
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
    },
    "& .MuiTableRow-root": {
      transition: "background-color 0.2s ease-in-out",
      "&:hover": {
        backgroundColor: "#f8f9fa",
      },
    },
  },

  // Table header cell styles
  tableHeaderCell: (width, align = "left") => ({
    width: width,
    ...(align === "center" && { textAlign: "center" }),
    ...(align === "left" && { textAlign: "left" }),
  }),

  // Table row styles
  tableRow: {
    cursor: "pointer",
    "&:hover": {
      backgroundColor: "#f5f5f5 !important",
    },
  },

  // Table cell styles
  tableCellEllipsis: (minWidth, width) => ({
    minWidth: minWidth,
    width: width,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  }),

  tableCellBold: {
    fontWeight: 600,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },

  tableCellFixed: (minWidth, width) => ({
    minWidth: minWidth,
    width: width,
  }),

  // Loading and empty state styles
  loadingCell: {
    py: 4,
  },

  loadingSpinner: {
    color: "rgb(33, 61, 112)",
  },

  emptyStateCell: {
    py: 8,
    borderBottom: "none",
    color: "#666",
    fontSize: "16px",
  },

  // Icon styles
  iconButton: {
    color: "black",
  },

  // Link styles
  attachmentLink: {
    color: "primary.main",
    fontWeight: 500,
    display: "block",
    maxWidth: "150px",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    textAlign: "left",
    border: "none",
    background: "none",
    cursor: "pointer",
  },

  // Status chip styles
  statusChip: {
    size: "small",
  },

  // Pagination styles
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
    "& .MuiTablePagination-toolbar": {
      paddingLeft: "24px",
      paddingRight: "24px",
    },
  },

  // Dialog styles
  dialogTitle: {
    backgroundColor: "rgb(233, 246, 255)",
  },

  dialogTitleText: {
    fontWeight: "bold",
    fontFamily: "'Helvetica Neue', Arial, sans-serif",
  },

  dialogContent: {
    backgroundColor: "white",
  },

  dialogActions: {
    backgroundColor: "white",
  },

  dialogButton: {
    fontFamily: "'Helvetica Neue', Arial, sans-serif",
  },

  // List item styles
  listItem: (isLast) => ({
    borderBottom: !isLast ? "1px solid #e0e0e0" : "none",
    fontFamily: "'Helvetica Neue', Arial, sans-serif",
    paddingLeft: 0,
  }),

  listItemTextPrimary: {
    fontWeight: "bold",
    fontFamily: "'Helvetica Neue', Arial, sans-serif",
    color: "#333",
  },

  listItemTextSecondary: {
    fontFamily: "'Helvetica Neue', Arial, sans-serif",
    color: "#666",
  },

  listItemTextEmpty: {
    fontFamily: "'Helvetica Neue', Arial, sans-serif",
    color: "#999",
    fontStyle: "italic",
  },

  toolsListItem: {
    borderBottom: "1px solid #ccc",
    fontFamily: "'Helvetica Neue', Arial, sans-serif",
  },

  toolsListItemText: {
    fontFamily: "'Helvetica Neue', Arial, sans-serif",
  },

  // Confirmation dialog styles
  confirmDialogIcon: {
    fontSize: 60,
    color: "#55b8ff",
  },

  confirmDialogTitle: {
    variant: "h6",
    fontWeight: "bold",
    textAlign: "center",
  },

  confirmDialogContent: {
    variant: "body1",
    gutterBottom: true,
    textAlign: "center",
  },

  confirmDialogActions: {
    display: "flex",
    justifyContent: "center",
    width: "100%",
    gap: 2,
    mb: 2,
  },

  confirmDialogCancelButton: {
    variant: "outlined",
    color: "error",
  },

  confirmDialogConfirmButton: {
    variant: "contained",
    color: "success",
  },
};

// Helper functions for dynamic styles
export const getIconColor = (showArchived) => {
  return showArchived ? "#d32f2f" : "rgb(33, 61, 112)";
};

export const getLabelColor = (showArchived) => {
  return showArchived ? "#d32f2f" : "rgb(33, 61, 112)";
};

// Column width configurations
export const columnWidths = {
  id: "60px",
  code: "300px",
  name: "200px",
  charging: "300px",
  coa: "80px",
  superior: "250px",
  requestors: "100px",
  payFrequency: "200px",
  schedule: "280px",
  team: "250px",
  tools: "80px",
  attachments: "150px",
  status: "100px",
  action: "80px",
};

export default positionStyles;
