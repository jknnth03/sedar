export const styles = {
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

  headerLeftSection: {
    display: "flex",
    alignItems: "center",
    gap: 1.4,
  },

  createButton: {
    backgroundColor: "rgb(33, 61, 112)",
    height: "38px",
    width: "210px",
    textTransform: "none",
    fontWeight: 600,
    fontSize: "14px",
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

  contentContainer: {
    flex: 1,
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    backgroundColor: "white",
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
    "& .MuiTablePagination-toolbar": {
      paddingLeft: "24px",
      paddingRight: "24px",
    },
  },

  filterDialog: {
    borderRadius: 2,
    minHeight: "350px",
    width: "400px",
    maxWidth: "400px",
  },

  filterDialogTitle: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },

  filterDialogTitleLeft: {
    display: "flex",
    alignItems: "center",
    gap: 1,
  },

  filterIcon: {
    color: "rgb(33, 61, 112)",
  },

  filterDialogTitleText: {
    fontWeight: "bold",
    color: "rgb(33, 61, 112)",
  },

  selectAllButton: {
    textTransform: "none",
    minWidth: "100px",
    height: "32px",
    borderColor: "rgb(33, 61, 112)",
    color: "rgb(33, 61, 112)",
    "&:hover": {
      borderColor: "rgb(25, 45, 84)",
      backgroundColor: "rgba(33, 61, 112, 0.04)",
    },
  },

  unselectAllButton: {
    borderColor: "#f44336",
    color: "#f44336",
    "&:hover": {
      borderColor: "#d32f2f",
      backgroundColor: "rgba(244, 67, 54, 0.04)",
    },
  },

  selectedChipBottom: {
    position: "absolute",
    left: "20px",
    display: "flex",
    alignItems: "center",
  },

  selectedCountChip: {
    backgroundColor: "#4caf50",
    color: "white",
    fontSize: "14px",
    fontWeight: 600,
    height: "28px",
    "& .MuiChip-label": {
      px: 1.5,
      fontSize: "14px",
    },
  },

  filterDialogContent: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 1,
    mt: 1,
  },

  filterCheckbox: {
    color: "rgb(33, 61, 112)",
    "&.Mui-checked": {
      color: "rgb(33, 61, 112)",
    },
  },

  filterFormControlLabel: {
    "& .MuiFormControlLabel-label": {
      fontSize: "14px",
      fontWeight: 500,
    },
    margin: 0,
  },

  filterDialogActions: {
    p: 2.5,
    pt: 1,
    position: "relative",
  },

  dialogActionsContainer: {
    width: "100%",
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "center",
  },

  dialogButtonsContainer: {
    display: "flex",
    gap: 2,
  },

  cancelButton: {
    textTransform: "none",
    borderRadius: 2,
    minWidth: 80,
  },

  applyFiltersButton: {
    backgroundColor: "rgb(33, 61, 112)",
    textTransform: "none",
    borderRadius: 2,
    minWidth: 80,
    "&:hover": {
      backgroundColor: "rgb(25, 45, 84)",
    },
  },

  searchBarContainer: {
    display: "flex",
    alignItems: "center",
    gap: 1.5,
  },

  filterControlLabel: (hasActiveFilters) => ({
    margin: 0,
    border: `1px solid ${hasActiveFilters ? "#4caf50" : "#ccc"}`,
    borderRadius: "8px",
    paddingLeft: "8px",
    paddingRight: "12px",
    height: "36px",
    backgroundColor: hasActiveFilters ? "rgba(76, 175, 80, 0.04)" : "white",
    transition: "all 0.2s ease-in-out",
    "&:hover": {
      backgroundColor: hasActiveFilters ? "rgba(76, 175, 80, 0.08)" : "#f5f5f5",
      borderColor: hasActiveFilters ? "#4caf50" : "rgb(33, 61, 112)",
    },
    "& .MuiFormControlLabel-label": {
      fontSize: "12px",
      fontWeight: 600,
      color: hasActiveFilters ? "#4caf50" : "rgb(33, 61, 112)",
      letterSpacing: "0.5px",
    },
  }),

  filterLabelBox: {
    display: "flex",
    alignItems: "center",
    gap: 0.5,
  },

  filterCountChip: {
    height: 16,
    width: 16,
    fontSize: "10px",
    backgroundColor: "#4caf50",
    color: "white",
    "& .MuiChip-label": {
      px: 0.5,
    },
  },

  searchTextField: {
    "& .MuiInputBase-input": {
      fontSize: "14px",
      "&::placeholder": {
        opacity: 0.7,
      },
    },
  },

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

  searchProgress: {
    marginLeft: 1,
  },

  confirmDialog: {
    borderRadius: 3,
  },

  confirmDialogIconBox: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    mb: 1,
  },

  confirmDialogIcon: {
    fontSize: 60,
    color: "#ff4400",
  },

  confirmDialogTitle: {
    fontWeight: "bold",
    textAlign: "center",
    color: "rgb(33, 61, 112)",
  },

  confirmDialogMessage: {
    gutterBottom: true,
    textAlign: "center",
  },

  confirmDialogSubmissionInfo: {
    color: "text.secondary",
    textAlign: "center",
    mt: 1,
  },

  confirmDialogActionsBox: {
    display: "flex",
    justifyContent: "center",
    width: "100%",
    gap: 2,
    mb: 2,
  },

  confirmCancelButton: {
    borderRadius: 2,
    minWidth: 80,
  },

  confirmActionButton: (confirmAction) => ({
    borderRadius: 2,
    minWidth: 80,
    ...(confirmAction === "update" && {
      backgroundColor: "rgba(0, 133, 49, 1)",
      "&:hover": {
        backgroundColor: "rgba(0, 100, 37, 1)",
      },
    }),
  }),
};
