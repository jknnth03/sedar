import { styled } from "@mui/material/styles";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
} from "@mui/material";

export const StyledDialog = styled(Dialog)(({ theme }) => ({
  "& .MuiDialog-paper": {
    maxWidth: "1200px",
    width: "100%",
    height: "90vh",
    maxHeight: "90vh",
    display: "flex",
    flexDirection: "column",
    position: "relative",
  },
}));

export const StyledDialogTitle = styled(DialogTitle)(({ theme }) => ({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  backgroundColor: "#fff",
  flexShrink: 0,
  padding: "16px 24px",
  borderBottom: "1px solid #e0e0e0",
  "& .MuiTypography-root": {
    fontSize: "1.25rem",
    fontWeight: 600,
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
}));

export const StyledDialogContent = styled(DialogContent)(({ theme }) => ({
  backgroundColor: "#fafafa",
  flex: 1,
  padding: "24px",
  overflow: "auto",
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
}));

export const StyledDialogActions = styled(DialogActions)(({ theme }) => ({
  backgroundColor: "#fff",
  justifyContent: "flex-end",
  flexShrink: 0,
  padding: "16px 24px",
  borderTop: "1px solid #e0e0e0",
  position: "sticky",
  bottom: 0,
  zIndex: 1000,
}));

export const SubmitButton = styled(Button)(({ theme }) => ({
  backgroundColor: "#4CAF50 !important",
  color: "white !important",
  fontWeight: 600,
  textTransform: "uppercase",
  padding: "12px 20px",
  borderRadius: "8px",
  fontSize: "0.875rem",
  border: "none !important",
  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
  minWidth: "120px",
  height: "44px",
  display: "flex",
  alignItems: "center",
  gap: "8px",
  "&:hover": {
    backgroundColor: "#45a049 !important",
  },
  "&:disabled": {
    backgroundColor: "#cccccc !important",
    color: "#666666 !important",
  },
}));

export const DraftButton = styled(Button)(({ theme }) => ({
  backgroundColor: "#2196F3 !important",
  color: "white !important",
  fontWeight: 600,
  textTransform: "uppercase",
  padding: "12px 20px",
  borderRadius: "8px",
  fontSize: "0.875rem",
  border: "none !important",
  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
  minWidth: "120px",
  height: "44px",
  display: "flex",
  alignItems: "center",
  gap: "8px",
  "&:hover": {
    backgroundColor: "#1976D2 !important",
  },
  "&:disabled": {
    backgroundColor: "#cccccc !important",
    color: "#666666 !important",
  },
}));

export const InfoCard = styled(Box)(({ theme }) => ({
  backgroundColor: "white",
  borderRadius: "8px",
  padding: "20px",
  marginBottom: "20px",
  boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
}));

export const getStatusColor = (status) => {
  const statusColors = {
    FOR_ASSESSMENT: "#FF9800",
    FOR_SUBMISSION: "#2196F3",
    FOR_APPROVAL: "#FFC107",
    APPROVED: "#4CAF50",
    RETURNED: "#f44336",
    CANCELLED: "#9E9E9E",
    DRAFT: "#9E9E9E",
  };
  return statusColors[status] || "#9E9E9E";
};

export const getStatusLabel = (status) => {
  const labels = {
    FOR_ASSESSMENT: "For Assessment",
    FOR_SUBMISSION: "For Submission",
    FOR_APPROVAL: "For Approval",
    APPROVED: "Approved",
    RETURNED: "Returned",
    CANCELLED: "Cancelled",
    DRAFT: "Draft",
  };
  return labels[status] || status;
};
