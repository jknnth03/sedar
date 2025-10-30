// Breakpoints matching your mixins.scss
const breakpoints = {
  xxs: 500,
  xs: 575.98,
  sm: 768,
  lm: 930.98,
  md: 991.98,
  lg: 1199.98,
  xl: 1399.98,
};

export const dialogPaperStyles = {
  width: "1100px",
  minWidth: "1100px",
  maxWidth: "1100px",
  height: "94vh",
  maxHeight: "820px",
  display: "flex",
  flexDirection: "column",
  position: "relative",

  // xl breakpoint
  [`@media (max-width: ${breakpoints.xl}px)`]: {
    width: "95vw",
    minWidth: "95vw",
    maxWidth: "95vw",
    height: "92vh",
    maxHeight: "92vh",
  },

  // lg breakpoint
  [`@media (max-width: ${breakpoints.lg}px)`]: {
    width: "96vw",
    minWidth: "96vw",
    maxWidth: "96vw",
    height: "90vh",
    maxHeight: "90vh",
  },

  // md breakpoint
  [`@media (max-width: ${breakpoints.md}px)`]: {
    width: "98vw",
    minWidth: "98vw",
    maxWidth: "98vw",
    height: "88vh",
    maxHeight: "88vh",
    margin: "16px",
  },

  // lm breakpoint
  [`@media (max-width: ${breakpoints.lm}px)`]: {
    width: "100vw",
    minWidth: "100vw",
    maxWidth: "100vw",
    height: "100vh",
    maxHeight: "100vh",
    margin: 0,
    borderRadius: 0,
  },

  // sm breakpoint
  [`@media (max-width: ${breakpoints.sm}px)`]: {
    width: "100vw",
    minWidth: "100vw",
    maxWidth: "100vw",
    height: "100vh",
    maxHeight: "100vh",
    margin: 0,
    borderRadius: 0,
  },

  // xs breakpoint
  [`@media (max-width: ${breakpoints.xs}px)`]: {
    width: "100vw",
    minWidth: "100vw",
    maxWidth: "100vw",
    height: "100vh",
    maxHeight: "100vh",
    margin: 0,
    borderRadius: 0,
  },
};

export const dialogTitleStyles = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  pb: 1,
  backgroundColor: "#fff",

  [`@media (max-width: ${breakpoints.lg}px)`]: {
    padding: "12px 16px",
  },

  [`@media (max-width: ${breakpoints.lm}px)`]: {
    padding: "10px 12px",
  },

  [`@media (max-width: ${breakpoints.sm}px)`]: {
    padding: "8px 10px",
  },

  [`@media (max-width: ${breakpoints.xs}px)`]: {
    padding: "6px 8px",
    flexWrap: "wrap",
  },

  [`@media (max-width: ${breakpoints.xxs}px)`]: {
    padding: "4px 6px",
  },
};

export const titleBoxStyles = {
  display: "flex",
  alignItems: "center",
  gap: 1,

  [`@media (max-width: ${breakpoints.lm}px)`]: {
    gap: "6px",
  },

  [`@media (max-width: ${breakpoints.sm}px)`]: {
    gap: "4px",
  },

  [`@media (max-width: ${breakpoints.xs}px)`]: {
    gap: "4px",
    flex: 1,
  },
};

export const descriptionIconStyles = {
  color: "rgb(33, 61, 112)",

  [`@media (max-width: ${breakpoints.md}px)`]: {
    fontSize: "20px",
  },

  [`@media (max-width: ${breakpoints.sm}px)`]: {
    fontSize: "18px",
  },

  [`@media (max-width: ${breakpoints.xs}px)`]: {
    fontSize: "16px",
  },
};

export const titleTypographyStyles = {
  fontWeight: 600,

  [`@media (max-width: ${breakpoints.md}px)`]: {
    fontSize: "1rem",
  },

  [`@media (max-width: ${breakpoints.lm}px)`]: {
    fontSize: "0.9rem",
  },

  [`@media (max-width: ${breakpoints.sm}px)`]: {
    fontSize: "0.85rem",
    lineHeight: 1.2,
  },

  [`@media (max-width: ${breakpoints.xs}px)`]: {
    fontSize: "0.8rem",
    lineHeight: 1.2,
    flex: 1,
  },

  [`@media (max-width: ${breakpoints.xxs}px)`]: {
    fontSize: "0.75rem",
    wordBreak: "break-word",
  },
};

export const editIconButtonStyles = {
  ml: 1,
  padding: "8px",
  "&:hover": {
    backgroundColor: "rgba(0, 136, 32, 0.08)",
    transform: "scale(1.1)",
    transition: "all 0.2s ease-in-out",
  },

  [`@media (max-width: ${breakpoints.lm}px)`]: {
    padding: "6px",
    "& .MuiSvgIcon-root": {
      fontSize: "18px",
    },
  },

  [`@media (max-width: ${breakpoints.sm}px)`]: {
    padding: "4px",
    marginLeft: "4px",
    "& .MuiSvgIcon-root": {
      fontSize: "16px",
    },
  },

  [`@media (max-width: ${breakpoints.xs}px)`]: {
    padding: "3px",
    marginLeft: "2px",
    "& .MuiSvgIcon-root": {
      fontSize: "14px",
    },
  },
};

export const editIconStyles = (isLoading) => ({
  fontSize: "20px",
  "& path": {
    fill: isLoading ? "rgba(0, 0, 0, 0.26)" : "rgba(0, 136, 32, 1)",
  },

  [`@media (max-width: ${breakpoints.lm}px)`]: {
    fontSize: "18px",
  },

  [`@media (max-width: ${breakpoints.sm}px)`]: {
    fontSize: "16px",
  },

  [`@media (max-width: ${breakpoints.xs}px)`]: {
    fontSize: "14px",
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

  [`@media (max-width: ${breakpoints.lm}px)`]: {
    padding: "6px",
  },

  [`@media (max-width: ${breakpoints.sm}px)`]: {
    padding: "4px",
    marginLeft: "4px",
  },

  [`@media (max-width: ${breakpoints.xs}px)`]: {
    padding: "3px",
    marginLeft: "2px",
  },
};

export const editOffIconStyles = {
  fontSize: "20px",
  "& path": {
    fill: "rgba(235, 0, 0, 1)",
  },

  [`@media (max-width: ${breakpoints.lm}px)`]: {
    fontSize: "18px",
  },

  [`@media (max-width: ${breakpoints.sm}px)`]: {
    fontSize: "16px",
  },

  [`@media (max-width: ${breakpoints.xs}px)`]: {
    fontSize: "14px",
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

  [`@media (max-width: ${breakpoints.sm}px)`]: {
    width: 28,
    height: 28,
    "& .MuiSvgIcon-root": {
      fontSize: "16px",
    },
  },

  [`@media (max-width: ${breakpoints.xs}px)`]: {
    width: 24,
    height: 24,
    "& .MuiSvgIcon-root": {
      fontSize: "14px",
    },
  },
};

export const closeIconStyles = {
  fontSize: "18px",
  color: "#333",

  [`@media (max-width: ${breakpoints.sm}px)`]: {
    fontSize: "16px",
  },

  [`@media (max-width: ${breakpoints.xs}px)`]: {
    fontSize: "14px",
  },
};

export const dialogContentStyles = {
  backgroundColor: "#ffffffff",
  pt: 2,

  [`@media (max-width: ${breakpoints.lg}px)`]: {
    padding: "16px",
  },

  [`@media (max-width: ${breakpoints.lm}px)`]: {
    padding: "12px",
  },

  [`@media (max-width: ${breakpoints.sm}px)`]: {
    padding: "10px",
  },

  [`@media (max-width: ${breakpoints.xs}px)`]: {
    padding: "8px",
  },

  [`@media (max-width: ${breakpoints.xxs}px)`]: {
    padding: "6px",
  },
};

export const lastUpdatedBoxStyles = {
  mb: 2,
  p: 1,
  backgroundColor: "#e3f2fd",
  borderRadius: 1,
};

export const sectionTitleStyles = {
  mb: 2,
  fontWeight: 600,
  color: "rgb(33, 61, 112)",
};

export const gridItemFullStyles = {
  paddingTop: 3,
};

export const gridItemLargeStyles = {
  minWidth: "248px",
  maxWidth: "248px",
};

export const gridItemExtraLargeStyles = {
  minWidth: "704px",
  maxWidth: "704px",
};

export const dialogActionsStyles = {
  px: 3,
  py: 2,
  backgroundColor: "#fff",

  [`@media (max-width: ${breakpoints.lg}px)`]: {
    padding: "12px 16px",
  },

  [`@media (max-width: ${breakpoints.lm}px)`]: {
    padding: "10px 12px",
    flexWrap: "wrap",
    gap: "8px",
    "& .MuiButton-root": {
      flex: 1,
      minWidth: "120px",
      margin: 0,
    },
  },

  [`@media (max-width: ${breakpoints.sm}px)`]: {
    padding: "8px 10px",
    flexDirection: "column",
    "& .MuiButton-root": {
      width: "100%",
      margin: 0,
      marginBottom: "8px",
      "&:last-child": {
        marginBottom: 0,
      },
    },
  },

  [`@media (max-width: ${breakpoints.xs}px)`]: {
    padding: "6px 8px",
    flexDirection: "column",
    "& .MuiButton-root": {
      width: "100%",
      padding: "10px",
      fontSize: "0.875rem",
    },
  },

  [`@media (max-width: ${breakpoints.xxs}px)`]: {
    padding: "4px 6px",
    "& .MuiButton-root": {
      padding: "8px",
      fontSize: "0.8rem",
    },
  },
};

export const saveButtonStyles = {
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

  [`@media (max-width: ${breakpoints.lm}px)`]: {
    flex: 1,
    minWidth: "120px",
    margin: 0,
  },

  [`@media (max-width: ${breakpoints.sm}px)`]: {
    width: "100%",
    margin: 0,
    marginBottom: "8px",
    "&:last-child": {
      marginBottom: 0,
    },
  },

  [`@media (max-width: ${breakpoints.xs}px)`]: {
    width: "100%",
    padding: "10px",
    fontSize: "0.875rem",
  },

  [`@media (max-width: ${breakpoints.xxs}px)`]: {
    padding: "8px",
    fontSize: "0.8rem",
  },
};

// Export the Print button styles for consistency
export const printIconButtonStyles = {
  ml: 1,
  padding: "8px",
  "&:hover": {
    backgroundColor: "rgba(33, 61, 112, 0.08)",
    transform: "scale(1.1)",
    transition: "all 0.2s ease-in-out",
  },

  [`@media (max-width: ${breakpoints.lm}px)`]: {
    padding: "6px",
    "& .MuiSvgIcon-root": {
      fontSize: "18px",
    },
  },

  [`@media (max-width: ${breakpoints.sm}px)`]: {
    padding: "4px",
    marginLeft: "4px",
    "& .MuiSvgIcon-root": {
      fontSize: "16px",
    },
  },

  [`@media (max-width: ${breakpoints.xs}px)`]: {
    padding: "3px",
    marginLeft: "2px",
    "& .MuiSvgIcon-root": {
      fontSize: "14px",
    },
  },
};

export const printIconStyles = {
  fontSize: "20px",
  "& path": {
    fill: "rgb(33, 61, 112)",
  },

  [`@media (max-width: ${breakpoints.lm}px)`]: {
    fontSize: "18px",
  },

  [`@media (max-width: ${breakpoints.sm}px)`]: {
    fontSize: "16px",
  },

  [`@media (max-width: ${breakpoints.xs}px)`]: {
    fontSize: "14px",
  },
};

// Export resubmit button responsive styles
export const resubmitButtonStyles = (shouldEnable, isProcessing) => ({
  backgroundColor:
    shouldEnable && !isProcessing
      ? "rgb(33, 61, 112)"
      : "rgba(33, 61, 112, 0.3)",
  "&:hover": {
    backgroundColor:
      shouldEnable && !isProcessing
        ? "rgb(25, 45, 84)"
        : "rgba(33, 61, 112, 0.3)",
  },
  "&:disabled": {
    backgroundColor: "rgba(33, 61, 112, 0.3)",
    color: "rgba(255, 255, 255, 0.5)",
  },
  mr: 2,

  [`@media (max-width: ${breakpoints.lm}px)`]: {
    flex: 1,
    minWidth: "120px",
    margin: 0,
  },

  [`@media (max-width: ${breakpoints.sm}px)`]: {
    width: "100%",
    margin: 0,
    marginBottom: "8px",
    marginRight: 0,
  },

  [`@media (max-width: ${breakpoints.xs}px)`]: {
    width: "100%",
    padding: "10px",
    fontSize: "0.875rem",
    marginRight: 0,
  },

  [`@media (max-width: ${breakpoints.xxs}px)`]: {
    padding: "8px",
    fontSize: "0.8rem",
  },
});
