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

export const searchBarStyles = {
  container: {
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
  textFieldInput: (isLoading) => ({
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
  textFieldBase: {
    "& .MuiInputBase-input": {
      fontSize: "14px",
      "&::placeholder": {
        opacity: 0.7,
      },
    },
  },
  searchIcon: (isLoading) => ({
    color: isLoading ? "#ccc" : "#666",
    marginRight: 1,
    fontSize: "20px",
  }),
  circularProgress: {
    marginLeft: 1,
  },
};

export const layoutStyles = {
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
    gap: 1.4,
  },
  contentContainer: {
    flex: 1,
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    backgroundColor: "white",
  },
};

export const tableStyles = {
  container: {
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
    },
  },
  table: {
    minWidth: 1000,
  },
  cellId: {
    width: "80px",
    minWidth: "80px",
  },
  cellUsername: {
    width: "200px",
    minWidth: "200px",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    fontWeight: 600,
  },
  cellFullName: {
    width: "200px",
    minWidth: "200px",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  cellRole: {
    width: "200px",
    minWidth: "200px",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  cellStatus: {
    width: "120px",
    minWidth: "120px",
    textAlign: "center",
  },
  cellAction: {
    width: "100px",
    minWidth: "100px",
  },
  loadingCell: {
    py: 4,
  },
  emptyCell: {
    py: 8,
    borderBottom: "none",
    color: "#666",
    fontSize: "16px",
  },
  emptyContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 2,
  },
};

export const chipStyles = {
  active: {
    backgroundColor: "#e8f5e8",
    color: "#2e7d32",
    border: "1px solid #4caf50",
    fontWeight: 600,
    fontSize: "11px",
    height: "24px",
    borderRadius: "12px",
    "& .MuiChip-label": {
      padding: "0 8px",
    },
  },
  inactive: {
    backgroundColor: "#fff3e0",
    color: "#ed6c02",
    border: "1px solid #ff9800",
    fontWeight: 600,
    fontSize: "11px",
    height: "24px",
    borderRadius: "12px",
    "& .MuiChip-label": {
      padding: "0 8px",
    },
  },
};

export const buttonStyles = {
  iconButton: {
    color: "rgb(33, 61, 112)",
    "&:hover": {
      backgroundColor: "rgba(33, 61, 112, 0.04)",
    },
  },
  circularProgress: {
    color: "rgb(33, 61, 112)",
  },
};

export const paginationStyles = {
  container: {
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
  toolbar: {
    "& .MuiTablePagination-toolbar": {
      paddingLeft: "24px",
      paddingRight: "24px",
    },
  },
};

export const dialogStyles = {
  paper: {
    borderRadius: 3,
  },
  iconContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    mb: 1,
  },
  helpIcon: (isMobile) => ({
    fontSize: isMobile ? 50 : 60,
    color: "#ff4400",
  }),
  title: (isMobile) => ({
    variant: isMobile ? "body1" : "h6",
    fontWeight: "bold",
    textAlign: "center",
    color: "rgb(33, 61, 112)",
    fontSize: isMobile ? "14px" : "16px",
  }),
  content: (isMobile) => ({
    fontSize: isMobile ? "14px" : "16px",
  }),
  contentSecondary: (isMobile) => ({
    mt: 1,
    fontSize: isMobile ? "12px" : "14px",
  }),
  actionsContainer: {
    display: "flex",
    justifyContent: "center",
    width: "100%",
    gap: 2,
    mb: 2,
  },
  cancelButton: (isMobile) => ({
    borderRadius: 2,
    minWidth: 80,
    fontSize: isMobile ? "12px" : "14px",
  }),
  confirmButton: (isMobile) => ({
    borderRadius: 2,
    minWidth: 80,
    fontSize: isMobile ? "12px" : "14px",
  }),
};

export const rolesStyles = {
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
  addIconButton: {
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
  createButton: (isMobile) => ({
    backgroundColor: "rgb(33, 61, 112)",
    height: isMobile ? "36px" : "38px",
    width: isMobile ? "auto" : "120px",
    minWidth: isMobile ? "100px" : "120px",
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
  tableContainer: (isMobile) => ({
    flex: 1,
    overflow: "auto",
    backgroundColor: "#fafafa",
    "& .MuiTableCell-head": {
      backgroundColor: "#f8f9fa",
      fontWeight: 700,
      fontSize: isMobile ? "14px" : "18px",
      color: "rgb(33, 61, 112)",
      textTransform: "uppercase",
      letterSpacing: "0.5px",
      borderBottom: "2px solid #e0e0e0",
      position: "sticky",
      top: 0,
      zIndex: 10,
      height: isMobile ? "44px" : "48px",
      padding: isMobile ? "8px 12px" : "8px 16px",
    },
    "& .MuiTableCell-body": {
      fontSize: isMobile ? "13px" : "16px",
      color: "#333",
      borderBottom: "1px solid #f0f0f0",
      padding: isMobile ? "8px 12px" : "8px 16px",
      height: isMobile ? "48px" : "52px",
      backgroundColor: "white",
    },
  }),
  table: (isMobile) => ({
    minWidth: isMobile ? 600 : 1000,
  }),
  cellIdRole: (isMobile) => ({
    width: isMobile ? "60px" : "80px",
    minWidth: isMobile ? "60px" : "80px",
  }),
  cellRoleName: (isMobile) => ({
    width: isMobile ? "200px" : "300px",
    minWidth: isMobile ? "200px" : "300px",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    fontWeight: 600,
  }),
  cellPermission: (isMobile, isVerySmall) => ({
    width: isMobile ? "80px" : "120px",
    minWidth: isMobile ? "80px" : "120px",
    textAlign: "center",
    padding: isMobile ? "8px 12px" : "8px 16px",
    display: isVerySmall ? "none" : "table-cell",
  }),
  cellStatusRole: (isMobile) => ({
    width: isMobile ? "90px" : "120px",
    minWidth: isMobile ? "90px" : "120px",
    textAlign: "center",
  }),
  cellActionRole: (isMobile) => ({
    width: isMobile ? "80px" : "100px",
    minWidth: isMobile ? "80px" : "100px",
  }),
  viewPermissionButton: {
    backgroundColor: "transparent",
    transition: "background-color 150ms ease",
    "&:hover": {
      backgroundColor: "#e0e0e0",
    },
  },
  viewPermissionIcon: (isMobile) => ({
    color: "rgb(33, 61, 112)",
    fontSize: isMobile ? "18px" : "20px",
  }),
  moreVertIcon: (isMobile) => ({
    fontSize: isMobile ? "18px" : "20px",
  }),
  paginationContainer: (isMobile) => ({
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
  }),
  paginationToolbar: (isMobile) => ({
    "& .MuiTablePagination-toolbar": {
      paddingLeft: isMobile ? "16px" : "24px",
      paddingRight: isMobile ? "16px" : "24px",
    },
  }),
  emptyTypography: (isMobile) => ({
    variant: isMobile ? "body1" : "h6",
  }),
  emptySecondaryText: (isMobile) => ({
    fontSize: isMobile ? "12px" : "14px",
  }),
};

export const searchBarRolesStyles = {
  container: (isVerySmall) => ({
    display: "flex",
    alignItems: "center",
    gap: isVerySmall ? 1 : 1.5,
  }),
  archivedIconButton: (showArchived) => ({
    width: "36px",
    height: "36px",
    border: `1px solid ${showArchived ? "#d32f2f" : "#ccc"}`,
    borderRadius: "8px",
    backgroundColor: showArchived ? "rgba(211, 47, 47, 0.04)" : "white",
    color: showArchived ? "#d32f2f" : "rgb(33, 61, 112)",
    transition: "all 0.2s ease-in-out",
    "&:hover": {
      backgroundColor: showArchived ? "rgba(211, 47, 47, 0.08)" : "#f5f5f5",
      borderColor: showArchived ? "#d32f2f" : "rgb(33, 61, 112)",
    },
  }),
  archivedCheckbox: (showArchived, archivedIconColor) => ({
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
      color: archivedIconColor,
      letterSpacing: "0.5px",
    },
  }),
  searchInput: (isVerySmall, isLoading) => ({
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
  searchTextField: (isVerySmall) => ({
    flex: isVerySmall ? 1 : "0 0 auto",
    "& .MuiInputBase-input": {
      fontSize: isVerySmall ? "13px" : "14px",
      "&::placeholder": {
        opacity: 0.7,
      },
    },
  }),
  searchIconAdornment: (isVerySmall, isLoading) => ({
    color: isLoading ? "#ccc" : "#666",
    marginRight: 1,
    fontSize: isVerySmall ? "18px" : "20px",
  }),
};
