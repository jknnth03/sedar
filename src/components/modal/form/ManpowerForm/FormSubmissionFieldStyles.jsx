export const modalStyles = {
  // Dialog Title Styles
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

  // Dialog Content Styles
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

  // Dialog Actions Styles
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

  // Error Dialog Styles
  errorDialogOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "center",
    paddingTop: "30vh",
    zIndex: 9999,
  },

  errorDialogBox: {
    backgroundColor: "white",
    borderRadius: "8px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
    p: 3,
    minWidth: "480px",
    maxWidth: "520px",
    minHeight: "120px",
    border: "1px solid #e0e0e0",
    position: "relative",
  },

  errorDialogCloseButton: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    padding: 0,
    "&:hover": {
      backgroundColor: "#f5f5f5",
    },
  },

  errorDialogCloseIcon: {
    fontSize: "16px",
    color: "#666",
  },

  errorDialogContent: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
    pr: 4,
  },

  errorDialogIconContainer: {
    width: 20,
    height: 20,
    borderRadius: "50%",
    backgroundColor: "#f44336",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  errorDialogIconText: {
    color: "white",
    fontSize: "12px",
    fontWeight: "bold",
  },

  errorDialogMessage: {
    color: "#333",
    fontSize: "16px",
    textAlign: "center",
    width: "100%",
  },

  // Dialog Paper Props
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

// Field Styles (original from FormSubmissionFieldStyles)
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
