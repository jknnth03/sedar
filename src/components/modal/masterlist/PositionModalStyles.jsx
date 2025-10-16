export const styles = {
  dialogTitle: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    pb: 1,
    backgroundColor: "#fff",
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

  actionsContainer: {
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

  alertContainer: {
    mb: 2,
  },

  loadingContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: 4,
  },

  formGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 1.5,
    paddingTop: "14px",
  },

  fullWidthColumn: {
    gridColumn: "span 2",
  },

  attachmentField: {
    "& .MuiInputBase-input": {
      cursor: "default",
      caretColor: "transparent",
    },
  },

  attachmentButton: {
    ml: 1,
    minWidth: "120px",
  },

  dialogActions: {
    px: 3,
    pb: 3,
  },
};

export const getEditIconStyle = (isLoading) => {
  return isLoading ? styles.editIconDisabled : styles.editIcon;
};
