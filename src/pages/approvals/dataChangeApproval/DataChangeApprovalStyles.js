export const dialogPaperStyles = {
  borderRadius: 2,
  boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
};

export const dialogTitleStyles = {
  padding: "18px 26px",
};

export const titleBoxStyles = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
};

export const titleInnerBoxStyles = {
  display: "flex",
  alignItems: "center",
  gap: 1,
};

export const titleTextStyles = {
  fontWeight: 600,
  color: "rgb(33, 61, 112)",
  fontSize: "16px",
};

export const closeIconStyles = {
  color: "rgb(33, 61, 112)",
};

export const sectionBoxStyles = {
  backgroundColor: "#ffffff",
  border: "1px solid #dee2e6",
  borderRadius: 2,
  p: 3,
  mb: 2,
};

export const sectionTitleStyles = {
  fontWeight: 600,
  color: "rgb(33, 61, 112)",
  mb: 2,
  fontSize: "14px",
};

export const fieldContainerStyles = {
  display: "flex",
  gap: 6,
  mb: 1.5,
};

export const lastFieldContainerStyles = {
  display: "flex",
  gap: 6,
};

export const fieldBoxStyles = {
  flex: 1,
  minHeight: "60px",
};

export const fieldLabelStyles = {
  color: "rgb(33, 61, 112)",
  fontSize: "11px",
  fontWeight: 600,
  display: "block",
  mb: 0.5,
};

export const fieldValueStyles = {
  color: "#000000ff",
  fontSize: "13px",
};

export const attachmentSectionTitleStyles = {
  fontWeight: 600,
  color: "rgb(33, 61, 112)",
  mb: 1.5,
  fontSize: "14px",
};

export const attachmentContainerStyles = {
  display: "flex",
  flexDirection: "column",
  gap: 1.5,
};

export const attachmentItemStyles = {
  border: "2px dashed #d1d5db",
  borderRadius: 2,
  p: 2.5,
  textAlign: "center",
  backgroundColor: "#ffffff",
  cursor: "pointer",
  transition: "all 0.2s ease",
  "&:hover": {
    backgroundColor: "#f8f9fa",
    borderColor: "#007bff",
  },
};

export const attachmentInnerBoxStyles = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 1,
};

export const attachmentIconStyles = {
  color: "#007bff",
  fontSize: 24,
};

export const attachmentFilenameStyles = {
  color: "#007bff",
  fontSize: "14px",
  fontWeight: 500,
  textDecoration: "underline",
  cursor: "pointer",
};

export const attachmentHintStyles = {
  color: "#666",
  fontSize: "11px",
  display: "block",
  mt: 0.5,
};

export const processedBoxStyles = {
  textAlign: "center",
  py: 2,
  backgroundColor: "#ffffff",
  borderRadius: 2,
};

export const processedTextStyles = {
  fontSize: "16px",
};

export const dialogActionsStyles = {
  px: 4.4,
  pb: 2,
  pt: 2,
  justifyContent: "flex-end",
  gap: 2,
};

export const rejectButtonStyles = {
  backgroundColor: "#dc3545",
  color: "white",
  minWidth: "100px",
  height: "40px",
  fontSize: "14px",
  fontWeight: 600,
  textTransform: "uppercase",
  borderRadius: 1,
  "&:hover": {
    backgroundColor: "#c82333",
  },
};

export const approveButtonStyles = {
  backgroundColor: "#28a745",
  color: "white",
  minWidth: "100px",
  height: "40px",
  fontSize: "14px",
  fontWeight: 600,
  textTransform: "uppercase",
  borderRadius: 1,
  "&:hover": {
    backgroundColor: "#218838",
  },
};

export const confirmDialogTitleStyles = {
  textAlign: "center",
  pt: 3,
};

export const confirmIconBoxStyles = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  mb: 2,
};

export const confirmIconStyles = {
  fontSize: 60,
  color: "#ff4400",
};

export const confirmTitleStyles = {
  color: "#213d70",
  fontSize: "18px",
};

export const confirmContentStyles = {
  textAlign: "center",
  px: 3,
};

export const confirmMessageStyles = {
  fontSize: "14px",
  mb: 2,
};

export const confirmIdStyles = {
  fontSize: "13px",
  mb: 3,
};

export const confirmTextFieldStyles = {
  "& .MuiOutlinedInput-root": {
    borderRadius: 2,
  },
};

export const confirmActionsStyles = {
  justifyContent: "center",
  pb: 3,
  px: 3,
};

export const confirmButtonBoxStyles = {
  display: "flex",
  gap: 2,
};

export const cancelButtonStyles = {
  borderRadius: 2,
  minWidth: 80,
  height: "40px",
  borderColor: "#dc3545",
  color: "#dc3545",
  "&:hover": {
    borderColor: "#c82333",
    backgroundColor: "rgba(220, 53, 69, 0.04)",
  },
};

export const confirmActionButtonStyles = (confirmAction) => ({
  borderRadius: 2,
  minWidth: 80,
  height: "40px",
  backgroundColor: confirmAction === "approve" ? "#28a745" : "#dc3545",
  "&:hover": {
    backgroundColor: confirmAction === "approve" ? "#218838" : "#c82333",
  },
});

export const fileViewerPaperStyles = {
  width: "80vw",
  height: "90vh",
  maxWidth: "none",
  maxHeight: "none",
  margin: 0,
  borderRadius: 2,
  boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
};

export const fileViewerTitleStyles = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  borderBottom: 1,
  borderColor: "divider",
  padding: "12px 24px",
  backgroundColor: "#f8f9fa",
};

export const fileViewerTitleTextStyles = {
  fontWeight: 600,
  fontSize: "16px",
};

export const fileViewerContentStyles = {
  p: 0,
  height: "calc(90vh - 64px)",
  overflow: "hidden",
};

export const loadingBoxStyles = {
  width: "100%",
  height: "100%",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  backgroundColor: "#f5f5f5",
  flexDirection: "column",
};

export const loadingTextStyles = {
  mt: 2,
  color: "text.secondary",
};

export const errorTitleStyles = {
  color: "error",
};

export const errorMessageStyles = {
  color: "text.secondary",
};

export const fileViewerBoxStyles = {
  width: "100%",
  height: "100%",
  backgroundColor: "#f5f5f5",
};

export const iframeStyles = {
  border: "none",
  borderRadius: "0 0 8px 8px",
};

export const noPreviewBoxStyles = {
  width: "100%",
  height: "100%",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  backgroundColor: "#f5f5f5",
};

export const noPreviewIconStyles = {
  fontSize: 64,
  color: "text.secondary",
  mb: 2,
};

export const noPreviewTitleStyles = {
  fontSize: "18px",
};

export const noPreviewMessageStyles = {
  mt: 1,
  fontSize: "14px",
};
