export const dialogPaperStyles = {
  minHeight: "80vh",
  maxHeight: "90vh",
  width: "770px",
  maxWidth: "770px",
};

export const dialogTitleStyles = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  pb: 1,
  backgroundColor: "#fff",
};

export const titleBoxStyles = {
  display: "flex",
  alignItems: "center",
  gap: 1,
};

export const descriptionIconStyles = {
  color: "rgb(33, 61, 112)",
};

export const titleTypographyStyles = {
  fontWeight: 600,
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

export const editIconStyles = (isLoading) => ({
  fontSize: "20px",
  "& path": {
    fill: isLoading ? "rgba(0, 0, 0, 0.26)" : "rgba(0, 136, 32, 1)",
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
  backgroundColor: "#ffffffff",
  pt: 2,
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
  minWidth: "346px",
  maxWidth: "346px",
};

export const gridItemExtraLargeStyles = {
  minWidth: "704px",
  maxWidth: "704px",
};

export const dialogActionsStyles = {
  px: 3,
  py: 2,
  backgroundColor: "#fff",
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
};
