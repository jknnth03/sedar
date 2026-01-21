import { alpha } from "@mui/material";

export const positionStyles = {
  attachmentLink: {
    fontSize: "12px",
    color: "rgb(33, 61, 112)",
    textDecoration: "underline",
    "&:hover": {
      color: "rgb(25, 45, 84)",
    },
  },
  statusChip: (deleted_at) => ({
    backgroundColor: deleted_at ? "#fff3e0" : "#e8f5e8",
    color: deleted_at ? "#ed6c02" : "#2e7d32",
    border: `1px solid ${deleted_at ? "#ff9800" : "#4caf50"}`,
    fontWeight: 600,
    fontSize: "11px",
    height: "24px",
    borderRadius: "12px",
    "& .MuiChip-label": {
      padding: "0 8px",
    },
  }),
  emptyRow: {
    py: 4,
    textAlign: "center",
    color: "#999",
    fontStyle: "italic",
  },
  tablePagination: {
    borderTop: "1px solid #e0e0e0",
    backgroundColor: "white",
  },
  dialogTitle: {
    backgroundColor: "rgb(33, 61, 112)",
    color: "white",
    padding: "16px 24px",
  },
  dialogContent: {
    padding: "24px",
  },
  dialogActions: {
    padding: "16px 24px",
    gap: "8px",
  },
  cancelButton: {
    color: "rgb(33, 61, 112)",
    border: "1px solid #ccc",
  },
  confirmButton: (deleted_at) => ({
    backgroundColor: deleted_at ? "#ed6c02" : "#2e7d32",
    "&:hover": {
      backgroundColor: deleted_at ? "#d32f2f" : "#1b5e20",
    },
  }),
  actionIconButton: {
    color: "rgb(33, 61, 112)",
    "&:hover": {
      backgroundColor: "rgba(33, 61, 112, 0.04)",
    },
  },
};

export const searchBarStyles = {
  container: {
    display: "flex",
    alignItems: "center",
    gap: { xs: 1, sm: 1.5 },
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
  checkboxIcon: (showArchived) => ({
    color: showArchived ? "#d32f2f" : "rgb(33, 61, 112)",
  }),
  searchIcon: (isLoading, isVerySmall) => ({
    color: isLoading ? "#ccc" : "#666",
    marginRight: 1,
    fontSize: isVerySmall ? "18px" : "20px",
  }),
  inputProps: {
    height: "36px",
    backgroundColor: "white",
  },
  searchTextField: (isVerySmall, isLoading) => ({
    flex: isVerySmall ? 1 : "0 0 auto",
    "& .MuiInputBase-input": {
      fontSize: isVerySmall ? "13px" : "14px",
      "&::placeholder": {
        opacity: 0.7,
      },
    },
    "& .MuiOutlinedInput-root": {
      height: "36px",
      width: isVerySmall ? "100%" : "320px",
      minWidth: isVerySmall ? "160px" : "200px",
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
};

export const tableStyles = {
  container: {
    flex: 1,
    overflow: "auto",
    backgroundColor: { xs: "white", sm: "#fafafa" },
    "& .MuiTableCell-head": {
      backgroundColor: "#f8f9fa",
      fontWeight: 700,
      fontSize: { xs: "12px", sm: "14px", md: "16px" },
      color: "rgb(33, 61, 112)",
      textTransform: "uppercase",
      letterSpacing: "0.5px",
      borderBottom: "2px solid #e0e0e0",
      position: "sticky",
      top: 0,
      zIndex: 10,
      height: { xs: "44px", sm: "48px" },
      padding: { xs: "6px 8px", sm: "8px 12px" },
    },
    "& .MuiTableCell-body": {
      fontSize: { xs: "11px", sm: "12px", md: "14px" },
      color: "#333",
      borderBottom: "1px solid #f0f0f0",
      padding: { xs: "6px 8px", sm: "8px 12px" },
      height: { xs: "48px", sm: "52px" },
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
  rowHover: (theme) => ({
    cursor: "pointer",
    "&:hover": {
      backgroundColor: alpha(theme.palette.primary.main, 0.04),
      "& .MuiTableCell-root": {
        backgroundColor: "transparent",
      },
    },
    transition: "background-color 0.2s ease",
  }),
};

export const headerStyles = {
  container: {
    display: "flex",
    alignItems: { xs: "flex-start", sm: "center" },
    justifyContent: { xs: "flex-start", sm: "space-between" },
    flexDirection: { xs: "column", sm: "row" },
    flexShrink: 0,
    minHeight: { xs: "auto", sm: "72px" },
    padding: { xs: "12px 14px", sm: "16px", md: "16px 14px" },
    backgroundColor: "white",
    borderBottom: "1px solid #e0e0e0",
    boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
    gap: { xs: "16px", sm: "0" },
  },
  titleContainer: {
    display: "flex",
    alignItems: "center",
    gap: { xs: 1, sm: 2, md: 1.4 },
    width: { xs: "100%", sm: "auto" },
    justifyContent: "flex-start",
  },
  addButton: {
    backgroundColor: "rgb(33, 61, 112)",
    height: { xs: "36px", sm: "38px" },
    width: { xs: "auto", sm: "160px" },
    minWidth: { xs: "100px", sm: "160px" },
    padding: { xs: "0 16px", sm: "0 20px" },
    textTransform: "none",
    fontWeight: 600,
    fontSize: { xs: "12px", sm: "14px" },
    borderRadius: "8px",
    boxShadow: "0 2px 8px rgba(33, 61, 112, 0.2)",
    transition: "all 0.2s ease-in-out",
    "& .MuiButton-startIcon": {
      marginRight: { xs: "4px", sm: "8px" },
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
};

export const mainContainerStyles = {
  width: "100%",
  height: "100%",
  display: "flex",
  flexDirection: "column",
  overflow: "hidden",
  backgroundColor: "white",
};

export const contentContainerStyles = {
  flex: 1,
  overflow: "hidden",
  display: "flex",
  flexDirection: "column",
  backgroundColor: "white",
};

export const tableCellStyles = {
  id: (isVerySmall, isMobile) => ({
    width: isVerySmall ? "40px" : isMobile ? "50px" : "60px",
    minWidth: isVerySmall ? "40px" : isMobile ? "50px" : "60px",
  }),
  code: (isVerySmall, isMobile) => ({
    width: isVerySmall ? "70px" : isMobile ? "80px" : "100px",
    minWidth: isVerySmall ? "70px" : isMobile ? "80px" : "100px",
  }),
  name: (isMobile) => ({
    width: isMobile ? "120px" : "180px",
    minWidth: isMobile ? "120px" : "180px",
  }),
  charging: (isMobile) => ({
    width: isMobile ? "100px" : "130px",
    minWidth: isMobile ? "100px" : "130px",
  }),
  coa: (isVerySmall, isMobile) => ({
    width: isVerySmall ? "50px" : isMobile ? "60px" : "70px",
    minWidth: isVerySmall ? "50px" : isMobile ? "60px" : "70px",
  }),
  superior: (isMobile) => ({
    width: isMobile ? "100px" : "140px",
    minWidth: isMobile ? "100px" : "140px",
  }),
  req: (isVerySmall, isMobile) => ({
    width: isVerySmall ? "60px" : isMobile ? "70px" : "80px",
    minWidth: isVerySmall ? "60px" : isMobile ? "70px" : "80px",
  }),
  payFrequency: {
    width: "160px",
    minWidth: "160px",
  },
  schedule: {
    width: "110px",
    minWidth: "110px",
  },
  team: {
    width: "100px",
    minWidth: "100px",
  },
  tools: (isVerySmall, isMobile) => ({
    width: isVerySmall ? "50px" : isMobile ? "60px" : "70px",
    minWidth: isVerySmall ? "50px" : isMobile ? "60px" : "70px",
  }),
  attachments: {
    width: "135px",
    minWidth: "135px",
  },
  status: (isVerySmall, isMobile) => ({
    width: isVerySmall ? "70px" : isMobile ? "80px" : "90px",
    minWidth: isVerySmall ? "70px" : isMobile ? "80px" : "90px",
  }),
  action: (isVerySmall, isMobile) => ({
    width: isVerySmall ? "60px" : isMobile ? "70px" : "80px",
    minWidth: isVerySmall ? "60px" : isMobile ? "70px" : "80px",
  }),
  codeCell: (isVerySmall) => ({
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    fontSize: isVerySmall ? "10px" : "12px",
    color: "#666",
    fontFamily: "monospace",
  }),
  nameCell: {
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    fontWeight: 600,
  },
  ellipsisCell: {
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  iconSize: (isVerySmall) => ({
    fontSize: isVerySmall ? "16px" : "18px",
  }),
};
