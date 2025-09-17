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
