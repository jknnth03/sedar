export const dialogPaperStyles = {
  height: "80vh",
  maxHeight: "80vh",
  minHeight: "80vh",
  width: "100%",
  maxWidth: "900px",
  display: "flex",
  flexDirection: "column",
  borderRadius: "8px",
  overflow: "hidden",
};

export const dialogTitleStyles = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  pb: 1,
  backgroundColor: "#fff",
  flexShrink: 0,
  padding: "16px 24px",
  borderBottom: "none",
};

export const titleBoxStyles = {
  display: "flex",
  alignItems: "center",
  gap: 1,
  flex: 1,
};

export const assessmentIconStyles = {
  fontSize: 28,
  color: "rgb(33, 61, 112)",
};

export const titleTypographyStyles = {
  fontWeight: 600,
  fontSize: "1.25rem",
  color: "#333",
};

export const editIconButtonStyles = {
  ml: 1,
  padding: "8px",
  "&:hover": {
    backgroundColor: "rgba(0, 136, 32, 0.08)",
    transform: "scale(1.1)",
    transition: "all 0.2s ease-in-out",
  },
};

export const editIconStyles = (disabled) => ({
  fontSize: "20px",
  "& path": {
    fill: disabled ? "rgba(0, 0, 0, 0.26)" : "rgba(0, 136, 32, 1)",
  },
});

export const cancelEditIconButtonStyles = {
  ml: 1,
  padding: "8px",
  "&:hover": {
    backgroundColor: "rgba(235, 0, 0, 0.08)",
    transform: "scale(1.1)",
    transition: "all 0.2s ease-in-out",
  },
};

export const editOffIconStyles = {
  fontSize: "20px",
  "& path": {
    fill: "rgba(235, 0, 0, 1)",
  },
};

export const closeIconButtonStyles = {
  width: 32,
  height: 32,
  borderRadius: "50%",
  backgroundColor: "#fff",
  "&:hover": {
    backgroundColor: "#f5f5f5",
  },
  transition: "all 0.2s ease-in-out",
};

export const closeIconStyles = {
  fontSize: "18px",
  color: "#333",
};

export const dialogContentStyles = {
  backgroundColor: "#fff",
  flex: 1,
  overflow: "auto",
  padding: "16px 24px",
  maxHeight: "calc(80vh - 140px)",
  "&::-webkit-scrollbar": {
    width: "8px",
  },
  "&::-webkit-scrollbar-track": {
    backgroundColor: "#f1f1f1",
    borderRadius: "4px",
  },
  "&::-webkit-scrollbar-thumb": {
    backgroundColor: "#c1c1c1",
    borderRadius: "4px",
    "&:hover": {
      backgroundColor: "#a1a1a1",
    },
  },
};

export const dialogActionsStyles = {
  px: 3,
  py: 2,
  backgroundColor: "#fff",
  justifyContent: "flex-end",
  flexShrink: 0,
  borderTop: "none",
};

export const createButtonStyles = {
  backgroundColor: "#4CAF50 !important",
  color: "white !important",
  fontWeight: 600,
  textTransform: "uppercase",
  px: 3,
  py: 1,
  borderRadius: "8px",
  border: "none !important",
  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
  "&:hover": {
    backgroundColor: "#45a049 !important",
    border: "none !important",
  },
  "&:disabled": {
    backgroundColor: "#cccccc !important",
    color: "#666666 !important",
    border: "none !important",
  },
};

export const fieldsContainer = {
  display: "flex",
  flexDirection: "column",
  gap: 3,
  paddingTop: "12px",
};

export const formPaper = {
  padding: "24px 24px 24px 40px",
  backgroundColor: "white",
  borderRadius: "8px",
  boxShadow: "none",
  border: "1px solid #e0e0e0",
  marginBottom: 3,
};

export const textField = (isReadOnly = false) => ({
  backgroundColor: isReadOnly ? "#f5f5f5" : "white",
  minWidth: "380px",
  maxWidth: "380px",
  "& .MuiOutlinedInput-root": {
    backgroundColor: isReadOnly ? "#f5f5f5" : "white",
    borderRadius: "4px",
    "& fieldset": {
      borderColor: "#d0d7de",
    },
    "&:hover fieldset": {
      borderColor: "#1e3a5f",
    },
    "&.Mui-focused fieldset": {
      borderColor: "#1e3a5f",
      borderWidth: "2px",
    },
    "&.Mui-disabled": {
      backgroundColor: "#f5f5f5",
      "& fieldset": {
        borderColor: "#e0e0e0",
      },
    },
  },
  "& .MuiInputBase-input": {
    fontSize: "0.875rem",
    padding: "16.5px 14px",
    "&::placeholder": {
      color: "#999",
      opacity: 1,
    },
  },
  "& .MuiInputBase-input.Mui-disabled": {
    WebkitTextFillColor: "#666",
  },
  "& .MuiInputLabel-root": {
    top: 0,
  },
  "& .MuiInputLabel-shrink": {
    top: 0,
  },
});

export const descriptionField = (isReadOnly = false) => ({
  backgroundColor: isReadOnly ? "#f5f5f5" : "white",
  minWidth: "770px",
  maxWidth: "770px",
  "& .MuiOutlinedInput-root": {
    backgroundColor: isReadOnly ? "#f5f5f5" : "white",
    borderRadius: "4px",
    "& fieldset": {
      borderColor: "#d0d7de",
    },
    "&:hover fieldset": {
      borderColor: "#1e3a5f",
    },
    "&.Mui-focused fieldset": {
      borderColor: "#1e3a5f",
      borderWidth: "2px",
    },
    "&.Mui-disabled": {
      backgroundColor: "#f5f5f5",
      "& fieldset": {
        borderColor: "#e0e0e0",
      },
    },
  },
  "& .MuiInputBase-input": {
    fontSize: "0.875rem",
    padding: "10px 14px",
    "&::placeholder": {
      color: "#999",
      opacity: 1,
    },
  },
  "& .MuiInputBase-input.Mui-disabled": {
    WebkitTextFillColor: "#666",
  },
});

export const sectionTitle = {
  fontWeight: 600,
  color: "#333",
  fontSize: "1rem",
  marginBottom: 2,
};

export const sectionHeaderBox = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 2,
};

export const addButton = {
  backgroundColor: "rgb(33, 61, 112)",
  color: "white",
  textTransform: "uppercase",
  fontWeight: 600,
  fontSize: "0.75rem",
  padding: "6px 16px",
  borderRadius: "4px",
  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
  "&:hover": {
    backgroundColor: "rgb(25, 45, 84)",
  },
};

export const emptyStateText = {
  textAlign: "center",
  color: "#999",
  padding: "32px 24px",
  fontStyle: "italic",
  fontSize: "0.95rem",
};

export const accordion = {
  marginBottom: 2,
  border: "1px solid #e0e0e0",
  borderRadius: "4px !important",
  "&:before": {
    display: "none",
  },
  boxShadow: "none",
  "&.Mui-expanded": {
    margin: "0 0 16px 0",
  },
};

export const accordionSummaryBox = {
  display: "flex",
  alignItems: "center",
  gap: 2,
  width: "100%",
};

export const accordionTitle = {
  fontWeight: 600,
  flex: 1,
  color: "#333",
  fontSize: "0.95rem",
};

export const deleteIconButton = {
  color: "#d32f2f",
  padding: "6px",
  "&:hover": {
    backgroundColor: "rgba(211, 47, 47, 0.08)",
  },
};

export const itemsHeaderBox = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 2,
  paddingBottom: 1,
  borderBottom: "1px solid #e0e0e0",
};

export const itemsTitle = {
  fontWeight: 600,
  color: "#666",
  textTransform: "uppercase",
  fontSize: "0.75rem",
  letterSpacing: "0.5px",
};

export const addItemButton = {
  textTransform: "uppercase",
  fontSize: "0.7rem",
  fontWeight: 600,
  color: "rgb(33, 61, 112)",
  padding: "4px 12px",
  "&:hover": {
    backgroundColor: "rgba(33, 61, 112, 0.08)",
  },
};

export const childrenTitle = {
  fontWeight: 600,
  color: "#999",
  textTransform: "uppercase",
  fontSize: "0.7rem",
  letterSpacing: "0.5px",
};

export const addChildButton = {
  textTransform: "uppercase",
  fontSize: "0.65rem",
  fontWeight: 600,
  color: "#666",
  padding: "2px 8px",
  "&:hover": {
    backgroundColor: "rgba(0, 0, 0, 0.04)",
  },
};

export const templateNameField = (isReadOnly = false) => ({
  backgroundColor: isReadOnly ? "#f5f5f5" : "white",
  minWidth: "770px",
  maxWidth: "770px",
  "& .MuiOutlinedInput-root": {
    backgroundColor: isReadOnly ? "#f5f5f5" : "white",
    borderRadius: "4px",
    "& fieldset": {
      borderColor: "#d0d7de",
    },
    "&:hover fieldset": {
      borderColor: "#1e3a5f",
    },
    "&.Mui-focused fieldset": {
      borderColor: "#1e3a5f",
      borderWidth: "2px",
    },
    "&.Mui-disabled": {
      backgroundColor: "#f5f5f5",
      "& fieldset": {
        borderColor: "#e0e0e0",
      },
    },
  },
  "& .MuiInputBase-input": {
    fontSize: "0.875rem",
    padding: "16.5px 14px",
    "&::placeholder": {
      color: "#999",
      opacity: 1,
    },
  },
  "& .MuiInputBase-input.Mui-disabled": {
    WebkitTextFillColor: "#666",
  },
  "& .MuiInputLabel-root": {
    top: 0,
  },
  "& .MuiInputLabel-shrink": {
    top: 0,
  },
});
