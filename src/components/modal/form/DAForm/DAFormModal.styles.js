export const dialogPaperStyles = {
  width: "90vw",
  maxWidth: "1200px",
  height: "90vh",
  maxHeight: "900px",
  m: 2,
  borderRadius: 1,
};

export const dialogTitleStyles = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  py: 1.5,
  px: 3,
  backgroundColor: "#fff",
  flexShrink: 0,
};

export const titleBoxStyles = {
  display: "flex",
  alignItems: "center",
  gap: 1.5,
};

export const descriptionIconStyles = {
  fontSize: "1.5rem",
  color: "rgb(33, 61, 112)",
};

export const titleTypographyStyles = {
  fontWeight: 600,
  fontSize: "1.25rem",
  letterSpacing: "0.5px",
  color: "#333",
  textTransform: "uppercase",
};

export const editIconButtonStyles = {
  color: "rgba(0, 136, 32, 1)",
  ml: 1,
  padding: "8px",
  "&:hover": {
    backgroundColor: "rgba(76, 175, 80, 0.08)",
    transform: "scale(1.1)",
    transition: "all 0.2s ease-in-out",
  },
};

export const editIconStyles = (disabled) => ({
  fontSize: "1.25rem",
  opacity: disabled ? 0.26 : 1,
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
  fontSize: "1.25rem",
  "& path": { fill: "rgba(235, 0, 0, 1)" },
};

export const closeIconButtonStyles = {
  width: 32,
  height: 32,
  borderRadius: "50%",
  backgroundColor: "#fff",
  "&:hover": {
    backgroundColor: "#ffffffff",
    transition: "all 0.2s ease-in-out",
  },
};

export const closeIconStyles = {
  fontSize: "1.125rem",
  color: "#333",
};

export const dialogContentStyles = {
  pt: 1,
  px: 3,
  pb: 2,
  overflowY: "auto",
  backgroundColor: "#fff",
  flex: 1,
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
  gap: 1.5,
  justifyContent: "flex-end",
  flexShrink: 0,
};

export const saveButtonStyles = {
  minWidth: 120,
  fontWeight: 600,
  textTransform: "uppercase",
  letterSpacing: "0.5px",
  backgroundColor: "#45a049",
  color: "white",
  borderRadius: "8px",
  padding: "12px 20px",
  height: "44px",
  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
  "&:hover": {
    backgroundColor: "#3d8b41",
  },
  "&:disabled": {
    backgroundColor: "#cccccc",
    color: "#666666",
  },
};

export const resubmitButtonStyles = (enabled, isProcessing) => ({
  minWidth: 140,
  fontWeight: 600,
  textTransform: "uppercase",
  letterSpacing: "0.5px",
  backgroundColor:
    enabled && !isProcessing ? "rgb(33, 61, 112)" : "rgba(33, 61, 112, 0.3)",
  color: "white",
  borderRadius: "8px",
  padding: "12px 20px",
  height: "44px",
  boxShadow: enabled && !isProcessing ? "0 2px 4px rgba(0,0,0,0.1)" : "none",
  "&:hover": {
    backgroundColor:
      enabled && !isProcessing ? "rgb(25, 45, 84)" : "rgba(33, 61, 112, 0.3)",
  },
  "&:disabled": {
    backgroundColor: "rgba(33, 61, 112, 0.3)",
    color: "rgba(255, 255, 255, 0.5)",
  },
});

export const sectionTitleStyles = {
  fontWeight: 700,
  color: "rgb(33, 61, 112)",
  mb: 1.5,
  fontSize: "1rem",
  letterSpacing: "0.5px",
  textTransform: "uppercase",
  paddingBottom: 1,
};

export const infoSectionContainerStyles = {
  display: "flex",
  flexDirection: "column",
  gap: 1.5,
  height: "100%",
};

export const infoSectionTitleStyles = {
  fontWeight: 700,
  color: "#1976d2",
  mb: 1.5,
  fontSize: "0.6875rem",
  textTransform: "uppercase",
  letterSpacing: "0.5px",
};

export const infoFieldContainerStyles = {
  display: "flex",
  flexDirection: "column",
  gap: 0.5,
};

export const infoFieldLabelStyles = {
  fontSize: "0.6875rem",
  color: "#1976d2",
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: "0.5px",
};

export const infoFieldValueStyles = {
  fontSize: "0.875rem",
  color: "#1a1a1a",
  fontWeight: 600,
  lineHeight: 1.3,
};

const baseInfoBox = {
  p: 2,
  border: "none",
  borderRadius: "4px",
  backgroundColor: "#fff",
  height: "100%",
};

const basePositionBox = {
  p: 2,
  border: "none",
  borderRadius: "4px",
  height: "100%",
};

export const infoBoxStyles = {
  employeeInfo1: baseInfoBox,
  employeeInfo2: baseInfoBox,
  employeeInfo3: baseInfoBox,
  positionInfo1: {
    ...basePositionBox,
    backgroundColor: "#fff",
  },
  positionInfo2: {
    ...basePositionBox,
    backgroundColor: "#fff",
  },
  kpiBox: {
    p: 2,
    border: "none",
    borderRadius: "4px",
    backgroundColor: "#fff",
  },
};

export const loadingContainerStyles = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  minHeight: "400px",
  gap: 2,
};
