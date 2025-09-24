import { styled } from "@mui/material/styles";
import { Box } from "@mui/material";

export const UploadBox = styled(Box)(({ theme }) => ({
  border: "2px dashed #ddd",
  borderRadius: 12,
  padding: "50px 10px",
  textAlign: "center",
  cursor: "pointer",
  transition: "all 0.3s ease",
  backgroundColor: "#fafafa",
  "&:hover": {
    borderColor: "#1976d2",
    backgroundColor: "#f0f7ff",
  },
  "& .upload-icon": {
    fontSize: 48,
    color: "#bbb",
    marginBottom: 12,
  },
  "& .upload-text": {
    color: "#666",
    fontSize: "0.875rem",
    fontWeight: 500,
  },
}));

export const AttachmentBox = styled(Box)(({ theme, hasFile }) => ({
  border: hasFile ? "2px solid #ddd" : "2px dashed #ddd",
  borderRadius: 8,
  padding: "16px",
  textAlign: "center",
  cursor: "pointer",
  transition: "all 0.3s ease",
  backgroundColor: hasFile ? "#fff" : "#fafafa",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  "&:hover": {
    borderColor: "#1976d2",
    backgroundColor: hasFile ? "#f9f9f9" : "#f0f7ff",
  },
}));

export const gridItemStyles = {
  xs12sm6: {
    minWidth: "405px",
    maxWidth: "405px",
  },
};

export const textFieldStyles = {
  outlinedInput: {
    "& .MuiOutlinedInput-root": {
      borderRadius: "8px",
      backgroundColor: "#fff",
    },
  },
};

export const labelWithRequired = {
  color: "#f44336",
};

export const fileNameStyles = {
  fontWeight: 600,
  color: "#333",
  fontSize: "0.9rem",
};

export const replaceAttachmentStyles = {
  fontSize: "0.75rem",
  color: "#f44336",
  cursor: "pointer",
  mt: 0.5,
  "&:hover": { textDecoration: "underline" },
};

export const uploadAttachmentTitleStyles = {
  fontWeight: 600,
  color: "#f44336",
  fontSize: "0.9rem",
};

export const uploadAttachmentSubtextStyles = {
  fontSize: "0.75rem",
  color: "#666",
  mt: 0.5,
};

export const attachmentBoxContentStyles = {
  display: "flex",
  alignItems: "center",
  flex: 1,
  cursor: "pointer",
};

export const attachmentBoxMainStyles = {
  width: "100%",
  minWidth: "824px",
};

export const uploadIconStyles = {
  mr: 2,
  fontSize: 24,
};

export const uploadIconWithFileStyles = {
  ...uploadIconStyles,
  color: "#1976d2",
};

export const uploadIconNoFileStyles = {
  ...uploadIconStyles,
  color: "#bbb",
};

export const buttonStyles = {
  addLine: {
    ml: 2,
    textTransform: "none",
    fontSize: "0.75rem",
    px: 2,
    py: 0.5,
  },
  deleteLine: {
    ml: 2,
    textTransform: "none",
    fontSize: "0.75rem",
    px: 2,
    py: 0.5,
  },
};

export const containerStyles = {
  main: {
    p: 2,
  },
  attachmentSection: {
    mt: 2,
  },
  attachmentItem: {
    mb: 1,
  },
};

export const hiddenInputStyles = {
  display: "none",
};
