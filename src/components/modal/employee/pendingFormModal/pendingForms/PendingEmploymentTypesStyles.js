export const styles = {
  container: {
    p: 2,
  },

  loadingContainer: {
    p: 2,
    textAlign: "center",
  },

  errorAlert: {
    mb: 3,
  },

  employmentBox: {
    mb: 2,
    border: "1px solid #e0e0e0",
    borderRadius: 2,
    p: 2,
    paddingTop: 3,
  },

  gridContainer: {
    alignItems: "flex-start",
  },

  employmentTypeGrid: {
    minWidth: "346px",
    maxWidth: "346px",
  },

  dateFieldGrid: {
    minWidth: "346px",
    maxWidth: "346px",
  },

  regularizationGrid: {
    minWidth: "706px",
    maxWidth: "706px",
  },

  selectField: (lineDisabled) => ({
    borderRadius: 2,
    ...(lineDisabled && {
      backgroundColor: "#f5f5f5",
      "& .MuiOutlinedInput-notchedOutline": {
        borderColor: "#e0e0e0",
      },
    }),
  }),

  textField: (lineDisabled) => ({
    "& .MuiOutlinedInput-root": {
      borderRadius: 2,
      ...(lineDisabled && {
        backgroundColor: "#f5f5f5",
        "& .MuiOutlinedInput-notchedOutline": {
          borderColor: "#e0e0e0",
        },
      }),
    },
  }),

  buttonContainer: {
    display: "flex",
    gap: 1,
    mt: 2,
    width: "100%",
    justifyContent: "center !important",
  },

  removeButton: {
    backgroundColor: "rgb(220, 53, 69)",
    color: "#fff !important",
    width: "260px",
    height: "40px",
    "&:hover": {
      backgroundColor: "rgb(200, 35, 51)",
      color: "#fff !important",
    },
  },

  addButton: {
    backgroundColor: "rgb(40, 167, 69)",
    color: "#fff !important",
    width: "180px",
    height: "40px",
    "&:hover": {
      backgroundColor: "rgb(34, 142, 58)",
      color: "#fff !important",
    },
  },

  requiredAsterisk: {
    color: "red",
  },
};
