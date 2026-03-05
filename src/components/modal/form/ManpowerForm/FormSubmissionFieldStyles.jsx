import { styled } from "@mui/material/styles";
import { Box } from "@mui/material";

export const AttachmentBox = styled(Box)(({ theme, hasFile, isReadOnly }) => ({
  border: hasFile ? "2px solid #ddd" : "2px dashed #ddd",
  borderRadius: 8,
  padding: "16px",
  textAlign: "center",
  cursor: isReadOnly ? "default" : "pointer",
  transition: "all 0.3s ease",
  backgroundColor: hasFile ? "#fff" : "#fafafa",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  "&:hover": !isReadOnly
    ? {
        borderColor: "#1976d2",
        backgroundColor: hasFile ? "#f9f9f9" : "#f0f7ff",
      }
    : {},
}));

export const fileNameStyles = {
  fontWeight: 600,
  color: "#333",
  fontSize: "0.9rem",
};

export const uploadAttachmentSubtextStyles = {
  fontSize: "0.75rem",
  color: "#666",
  mt: 0.5,
};

export const attachmentBoxContentStyles = {
  display: "flex",
  alignItems: "center",
  flex: 1,
  cursor: "pointer",
};

export const attachmentBoxMainStyles = {
  width: "100%",
  minWidth: "100%",
};

const uploadIconStyles = {
  mr: 2,
  fontSize: 24,
};

export const uploadIconWithFileStyles = {
  ...uploadIconStyles,
  color: "#1976d2",
};

export const uploadIconNoFileStyles = {
  ...uploadIconStyles,
  color: "#bbb",
};

export const buttonStyles = {
  addLine: {
    textTransform: "none",
    fontSize: "0.75rem",
    px: 2,
    py: 0.5,
  },
  deleteLine: {
    ml: 2,
    textTransform: "none",
    fontSize: "0.75rem",
    px: 2,
    py: 0.5,
  },
};

export const containerStyles = {
  main: {
    p: 2,
  },
  attachmentSection: {
    mt: 0,
  },
  attachmentItem: {
    mb: 1,
  },
};

export const hiddenInputStyles = {
  display: "none",
};

export const modalStyles = {
  dialogTitle: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    pb: 1,
    backgroundColor: "#fff",
    flexShrink: 0,
  },

  titleContainer: {
    display: "flex",
    alignItems: "center",
    gap: 1,
  },

  titleIcon: {
    color: "rgb(33, 61, 112)",
  },

  titleText: {
    fontWeight: 600,
  },

  editButton: (isLoading) => ({
    ml: 1,
    padding: "8px",
    "&:hover": {
      backgroundColor: "rgba(0, 136, 32, 0.08)",
      transform: "scale(1.1)",
      transition: "all 0.2s ease-in-out",
    },
  }),

  editIcon: (isLoading) => ({
    fontSize: "20px",
    "& path": {
      fill: isLoading ? "rgba(0, 0, 0, 0.26)" : "rgba(0, 136, 32, 1)",
    },
  }),

  cancelEditButton: (isLoading) => ({
    ml: 1,
    padding: "8px",
    "&:hover": {
      backgroundColor: "rgba(235, 0, 0, 0.08)",
      transform: "scale(1.1)",
      transition: "all 0.2s ease-in-out",
    },
  }),

  cancelEditIcon: {
    fontSize: "20px",
    "& path": {
      fill: "rgba(235, 0, 0, 1)",
    },
  },

  closeButtonContainer: {
    display: "flex",
    alignItems: "center",
    gap: 1,
  },

  closeButton: {
    width: 32,
    height: 32,
    borderRadius: "50%",
    backgroundColor: "#fff",
    "&:hover": {
      backgroundColor: "#f5f5f5",
    },
    transition: "all 0.2s ease-in-out",
  },

  closeIcon: {
    fontSize: "18px",
    color: "#333",
  },

  dialogContent: {
    backgroundColor: "#fff",
    flex: 1,
    overflow: "auto",
    padding: "16px 24px",
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
  },

  errorBanner: {
    mb: 2,
    p: 2,
    backgroundColor: "#ffebee",
    border: "1px solid #f44336",
    borderRadius: 1,
  },

  errorText: {
    fontWeight: 500,
  },

  metadataContainer: {
    mb: 2,
    p: 0.5,
    borderRadius: 1,
  },

  dialogActions: {
    px: 3,
    py: 2,
    backgroundColor: "#fff",
    justifyContent: "flex-end",
    flexShrink: 0,
  },

  resubmitButton: (enabled) => ({
    backgroundColor: enabled ? "rgb(33, 61, 112)" : "rgba(33, 61, 112, 0.3)",
    "&:hover": {
      backgroundColor: enabled ? "rgb(25, 45, 84)" : "rgba(33, 61, 112, 0.3)",
    },
    "&:disabled": {
      backgroundColor: "rgba(33, 61, 112, 0.3)",
      color: "rgba(255, 255, 255, 0.5)",
    },
  }),

  saveButton: {
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
  },

  dialogPaper: {
    height: "80vh",
    maxHeight: "80vh",
    minHeight: "80vh",
    width: "100%",
    maxWidth: "900px",
    display: "flex",
    flexDirection: "column",
  },
};

export const formStyles = {
  container: {
    paddingTop: "12px",
  },

  textField: (isReadOnly) => ({
    backgroundColor: isReadOnly ? "#f5f5f5" : "white",
    minWidth: "412px",
    maxWidth: "412px",
  }),

  autocompleteTextField: (isReadOnly, isEditMode) => ({
    backgroundColor: isReadOnly || isEditMode ? "#f5f5f5" : "white",
    minWidth: "412px",
    maxWidth: "412px",
  }),

  checkboxContainer: {
    display: "flex",
    alignItems: "center",
  },

  checkboxLabel: (isReadOnly) => ({
    color: isReadOnly ? "#666" : "inherit",
    "& .MuiFormControlLabel-label": {
      fontSize: "0.875rem",
      fontWeight: 500,
    },
  }),

  attachmentContainer: {
    minWidth: "834px",
    maxWidth: "834px",
  },

  requiredAsterisk: (isViewMode) => ({
    color: isViewMode ? "gray" : "red",
  }),
};
