export const mdaMonitoringStyles = {
  filterDialog: {},
  filterDialogTitle: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  filterDialogTitleLeft: {
    display: "flex",
    alignItems: "center",
    gap: 1,
  },
  filterDialogTitleText: {},
  filterIcon: {
    fontSize: "18px",
  },
  selectAllButton: {},
  filterDialogContent: {
    display: "flex",
    flexDirection: "column",
    gap: 2,
    pt: 1,
  },
  filterDialogActions: {},
  dialogActionsContainer: {},
  dialogButtonsContainer: {},
  cancelButton: {},
  applyFiltersButton: {},
  searchBarContainer: {
    display: "flex",
    alignItems: "center",
    gap: 1.5,
  },
  searchBarContainerVerySmall: {
    gap: 1,
  },
  filterButton: {
    width: "36px",
    height: "36px",
    border: "1px solid #ccc",
    borderRadius: "8px",
    backgroundColor: "white",
    position: "relative",
    transition: "all 0.2s ease-in-out",
  },
  filterButtonActive: {
    borderColor: "rgba(0, 133, 49, 1)",
    backgroundColor: "rgba(0, 133, 49, 0.04)",
    "&:hover": {
      backgroundColor: "rgba(0, 133, 49, 0.08)",
      borderColor: "rgba(0, 133, 49, 1)",
    },
  },
  filterButtonInactive: {
    "&:hover": {
      backgroundColor: "#f5f5f5",
      borderColor: "rgb(33, 61, 112)",
    },
  },
  filterBadge: {
    position: "absolute",
    top: "-6px",
    right: "-6px",
    backgroundColor: "rgba(0, 133, 49, 1)",
    color: "white",
    borderRadius: "50%",
    width: "16px",
    height: "16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "10px",
    fontWeight: 600,
  },
  filterCheckboxIcon: {},
  filterFormControlLabel: {
    margin: 0,
    borderRadius: "8px",
    paddingLeft: "8px",
    paddingRight: "12px",
    height: "36px",
    transition: "all 0.2s ease-in-out",
  },
  filterFormControlLabelActive: {
    border: "1px solid rgba(0, 133, 49, 1)",
    backgroundColor: "rgba(0, 133, 49, 0.04)",
    "&:hover": {
      backgroundColor: "rgba(0, 133, 49, 0.08)",
      borderColor: "rgba(0, 133, 49, 1)",
    },
    "& .MuiFormControlLabel-label": {
      fontSize: "12px",
      fontWeight: 600,
      color: "rgba(0, 133, 49, 1)",
      letterSpacing: "0.5px",
    },
  },
  filterFormControlLabelInactive: {
    border: "1px solid #ccc",
    backgroundColor: "white",
    "&:hover": {
      backgroundColor: "#f5f5f5",
      borderColor: "rgb(33, 61, 112)",
    },
    "& .MuiFormControlLabel-label": {
      fontSize: "12px",
      fontWeight: 600,
      color: "rgb(33, 61, 112)",
      letterSpacing: "0.5px",
    },
  },
  filterLabelBox: {
    display: "flex",
    alignItems: "center",
    gap: 0.5,
  },
  searchTextField: {
    flex: "0 0 auto",
    "& .MuiInputBase-input": {
      fontSize: "14px",
      "&::placeholder": {
        opacity: 0.7,
      },
    },
  },
  searchTextFieldVerySmall: {
    flex: 1,
    "& .MuiInputBase-input": {
      fontSize: "13px",
    },
  },
  searchTextFieldInput: {
    height: "36px",
    width: "320px",
    minWidth: "200px",
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
  searchTextFieldInputVerySmall: {
    width: "100%",
    minWidth: "160px",
  },
  searchIcon: {
    color: "#666",
    marginRight: 1,
    fontSize: "20px",
  },
  searchIconVerySmall: {
    fontSize: "18px",
  },
  searchIconDisabled: {
    color: "#ccc",
    marginRight: 1,
  },
  searchProgress: {
    marginLeft: 1,
    color: "rgb(33, 61, 112)",
  },
  headerTitleTypography: {
    paddingRight: "14px",
  },
};
