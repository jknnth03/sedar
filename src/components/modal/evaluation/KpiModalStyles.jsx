export const kpiModalStyles = {
  dialog: {
    height: "80vh",
    width: "100%",
  },
  dialogTitle: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    pb: 1,
    backgroundColor: "#fff",
  },
  titleBox: {
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
  editButton: {
    ml: 1,
    padding: "8px",
    "&:hover": {
      backgroundColor: "rgba(0, 136, 32, 0.08)",
      transform: "scale(1.1)",
      transition: "all 0.2s ease-in-out",
    },
  },
  editIcon: {
    fontSize: "20px",
    "& path": {
      fill: "rgba(0, 136, 32, 1)",
    },
  },
  editIconDisabled: {
    fontSize: "20px",
    "& path": {
      fill: "rgba(0, 0, 0, 0.26)",
    },
  },
  cancelEditButton: {
    ml: 1,
    padding: "8px",
    "&:hover": {
      backgroundColor: "rgba(235, 0, 0, 0.08)",
      transform: "scale(1.1)",
      transition: "all 0.2s ease-in-out",
    },
  },
  cancelEditIcon: {
    fontSize: "20px",
    "& path": {
      fill: "rgba(235, 0, 0, 1)",
    },
  },
  closeButtonBox: {
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
    pt: 2,
  },
  infoBox: {
    mb: 3,
    p: 2,
    backgroundColor: "#f8f9fa",
    borderRadius: 2,
  },
  infoSubtitle: {
    variant: "subtitle2",
    color: "text.secondary",
    gutterBottom: true,
  },
  infoText: {
    variant: "body1",
    fontWeight: 600,
  },
  distributionBox: {
    mb: 2,
    display: "flex",
    alignItems: "center",
    gap: 2,
  },
  distributionText: {
    variant: "body1",
    fontWeight: 600,
  },
  distributionStatus: (isValid) => ({
    px: 2,
    py: 0.5,
    borderRadius: 1,
    backgroundColor: isValid ? "#e8f5e8" : "#ffebee",
    color: isValid ? "#2e7d32" : "#c62828",
    fontWeight: 600,
    fontSize: "0.875rem",
  }),
  tableContainer: {
    maxHeight: 400,
  },
  tableHeader: {
    fontWeight: 600,
    backgroundColor: "#f5f5f5",
  },
  tableHeaderDistribution: {
    fontWeight: 600,
    backgroundColor: "#f5f5f5",
    width: "140px",
    whiteSpace: "nowrap",
  },
  tableHeaderTarget: {
    fontWeight: 600,
    backgroundColor: "#f5f5f5",
    width: "120px",
  },
  tableHeaderActions: {
    fontWeight: 600,
    backgroundColor: "#f5f5f5",
    width: "80px",
  },
  selectField: (isReadOnly) => ({
    backgroundColor: isReadOnly ? "#f5f5f5" : "white",
  }),
  textField: (isReadOnly) => ({
    backgroundColor: isReadOnly ? "#f5f5f5" : "white",
  }),
  percentageField: (isReadOnly) => ({
    backgroundColor: isReadOnly ? "#f5f5f5" : "white",
    "& .MuiInputBase-root": {
      paddingRight: "8px",
    },
    "& .MuiInputAdornment-root": {
      marginLeft: "4px",
    },
  }),
  addButtonBox: {
    mt: 2,
    display: "flex",
    justifyContent: "flex-start",
  },
  addButton: {
    borderColor: "rgb(33, 61, 112)",
    color: "rgb(33, 61, 112)",
    "&:hover": {
      borderColor: "rgb(33, 61, 112)",
      backgroundColor: "rgba(33, 61, 112, 0.08)",
    },
  },
  dialogActions: {
    px: 3,
    py: 2,
    backgroundColor: "#fff",
  },
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
};
