import { styled } from "@mui/material/styles";
import {
  Box,
  TextField,
  FormControlLabel,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  TableContainer,
  TableCell,
  TableRow,
  Chip,
  Avatar,
} from "@mui/material";

export const MainContainer = styled(Box)(({ theme }) => ({
  width: "100%",
  height: "100vh",
  display: "flex",
  flexDirection: "column",
  overflow: "hidden",
  backgroundColor: "#fafafa",
}));

export const HeaderContainer = styled(Box)(({ theme, isMobile, isTablet }) => ({
  display: "flex",
  alignItems: isMobile || isTablet ? "flex-start" : "center",
  justifyContent: isMobile || isTablet ? "flex-start" : "space-between",
  flexDirection: isMobile || isTablet ? "column" : "row",
  flexShrink: 0,
  minHeight: isMobile || isTablet ? "auto" : "72px",
  padding: isMobile ? "12px 14px" : isTablet ? "16px" : "16px 14px",
  backgroundColor: "white",
  borderBottom: "1px solid #e0e0e0",
  boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
  gap: isMobile || isTablet ? "16px" : "0",
}));

export const HeaderContent = styled(Box)(
  ({ theme, isMobile, isTablet, isVerySmall }) => ({
    display: "flex",
    alignItems: "center",
    gap: isVerySmall
      ? theme.spacing(1)
      : isMobile || isTablet
      ? theme.spacing(2)
      : theme.spacing(1.4),
    width: isMobile || isTablet ? "100%" : "auto",
    justifyContent: "flex-start",
  })
);

export const SearchBarContainer = styled(Box)(({ theme, isVerySmall }) => ({
  display: "flex",
  alignItems: "center",
  gap: isVerySmall ? theme.spacing(1) : theme.spacing(1.5),
}));

export const ArchivedIconButton = styled(IconButton)(
  ({ theme, showArchived }) => ({
    width: "36px",
    height: "36px",
    border: `1px solid ${showArchived ? "#d32f2f" : "#ccc"}`,
    borderRadius: "8px",
    backgroundColor: showArchived ? "rgba(211, 47, 47, 0.04)" : "white",
    color: showArchived ? "#d32f2f" : "rgb(33, 61, 112)",
    transition: "all 0.2s ease-in-out",
    "&:hover": {
      backgroundColor: showArchived ? "rgba(211, 47, 47, 0.08)" : "#f5f5f5",
      borderColor: showArchived ? "#d32f2f" : "rgb(33, 61, 112)",
    },
  })
);

export const ArchivedFormControl = styled(FormControlLabel)(
  ({ theme, showArchived }) => ({
    margin: 0,
    border: `1px solid ${showArchived ? "#d32f2f" : "#ccc"}`,
    borderRadius: "8px",
    paddingLeft: "8px",
    paddingRight: "12px",
    height: "36px",
    backgroundColor: showArchived ? "rgba(211, 47, 47, 0.04)" : "white",
    transition: "all 0.2s ease-in-out",
    "&:hover": {
      backgroundColor: showArchived ? "rgba(211, 47, 47, 0.08)" : "#f5f5f5",
      borderColor: showArchived ? "#d32f2f" : "rgb(33, 61, 112)",
    },
    "& .MuiFormControlLabel-label": {
      fontSize: "12px",
      fontWeight: 600,
      color: showArchived ? "#d32f2f" : "rgb(33, 61, 112)",
      letterSpacing: "0.5px",
    },
  })
);

export const SearchTextField = styled(TextField)(
  ({ theme, isVerySmall, isLoading }) => ({
    flex: isVerySmall ? 1 : "0 0 auto",
    "& .MuiInputBase-input": {
      fontSize: isVerySmall ? "13px" : "14px",
      "&::placeholder": {
        opacity: 0.7,
      },
    },
    "& .MuiInputBase-root": {
      height: "36px",
      width: isVerySmall ? "100%" : "320px",
      minWidth: isVerySmall ? "160px" : "200px",
      backgroundColor: "white",
      transition: "all 0.2s ease-in-out",
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
  })
);

export const CreateButton = styled(Button)(({ theme, isMobile }) => ({
  backgroundColor: "rgb(33, 61, 112)",
  height: isMobile ? "36px" : "38px",
  width: isMobile ? "auto" : "160px",
  minWidth: isMobile ? "100px" : "160px",
  padding: isMobile ? "0 16px" : "0 20px",
  textTransform: "none",
  fontWeight: 600,
  fontSize: isMobile ? "12px" : "14px",
  borderRadius: "8px",
  boxShadow: "0 2px 8px rgba(33, 61, 112, 0.2)",
  transition: "all 0.2s ease-in-out",
  "& .MuiButton-startIcon": {
    marginRight: isMobile ? "4px" : "8px",
  },
  "&:hover": {
    backgroundColor: "rgb(25, 45, 84)",
    boxShadow: "0 4px 12px rgba(33, 61, 112, 0.3)",
    transform: "translateY(-1px)",
  },
  "&:disabled": {
    backgroundColor: "#ccc",
    boxShadow: "none",
  },
}));

export const CreateIconButton = styled(IconButton)(({ theme }) => ({
  backgroundColor: "rgb(33, 61, 112)",
  color: "white",
  width: "36px",
  height: "36px",
  borderRadius: "8px",
  boxShadow: "0 2px 8px rgba(33, 61, 112, 0.2)",
  transition: "all 0.2s ease-in-out",
  "&:hover": {
    backgroundColor: "rgb(25, 45, 84)",
    boxShadow: "0 4px 12px rgba(33, 61, 112, 0.3)",
    transform: "translateY(-1px)",
  },
  "&:disabled": {
    backgroundColor: "#ccc",
    boxShadow: "none",
  },
}));

export const TableContentContainer = styled(Box)(({ theme }) => ({
  flex: 1,
  overflow: "hidden",
  display: "flex",
  flexDirection: "column",
  backgroundColor: "white",
}));

export const StyledTableContainer = styled(TableContainer)(
  ({ theme, isMobile, isVerySmall }) => ({
    flex: 1,
    overflow: "auto",
    backgroundColor: "#fafafa",
    "& .MuiTableCell-head": {
      backgroundColor: "#f8f9fa",
      fontWeight: 700,
      fontSize: isVerySmall ? "14px" : isMobile ? "16px" : "18px",
      color: "rgb(33, 61, 112)",
      textTransform: "uppercase",
      letterSpacing: "0.5px",
      borderBottom: "2px solid #e0e0e0",
      position: "sticky",
      top: 0,
      zIndex: 10,
      height: isMobile ? "44px" : "48px",
      padding: isVerySmall ? "8px 8px" : isMobile ? "8px 12px" : "8px 16px",
    },
    "& .MuiTableCell-body": {
      fontSize: isVerySmall ? "12px" : isMobile ? "14px" : "16px",
      color: "#333",
      borderBottom: "1px solid #f0f0f0",
      padding: isVerySmall ? "8px 8px" : isMobile ? "8px 12px" : "8px 16px",
      height: isMobile ? "48px" : "52px",
      backgroundColor: "white",
    },
    "& .MuiTableRow-root": {
      transition: "background-color 0.2s ease-in-out",
      "&:hover": {
        backgroundColor: "#f8f9fa",
        cursor: "pointer",
        "& .MuiTableCell-root": {
          backgroundColor: "transparent",
        },
      },
    },
  })
);

export const StyledTableRow = styled(TableRow)(({ theme }) => ({
  cursor: "pointer",
  "&:hover": {
    backgroundColor: theme.palette.action.hover,
    "& .MuiTableCell-root": {
      backgroundColor: "transparent",
    },
  },
  transition: "background-color 0.2s ease",
}));

export const StatusChip = styled(Chip)(({ theme, isActive }) => ({
  backgroundColor: isActive ? "#e8f5e8" : "#fff3e0",
  color: isActive ? "#2e7d32" : "#ed6c02",
  border: `1px solid ${isActive ? "#4caf50" : "#ff9800"}`,
  fontWeight: 600,
  fontSize: "11px",
  height: "24px",
  borderRadius: "12px",
  "& .MuiChip-label": {
    padding: "0 8px",
  },
}));

export const PaginationContainer = styled(Box)(({ theme }) => ({
  borderTop: "1px solid #e0e0e0",
  backgroundColor: "#f8f9fa",
  flexShrink: 0,
  "& .MuiTablePagination-root": {
    color: "#666",
    "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows": {
      fontSize: "14px",
      fontWeight: 500,
    },
    "& .MuiTablePagination-select": {
      fontSize: "14px",
    },
    "& .MuiIconButton-root": {
      color: "rgb(33, 61, 112)",
      "&:hover": {
        backgroundColor: "rgba(33, 61, 112, 0.04)",
      },
      "&.Mui-disabled": {
        color: "#ccc",
      },
    },
  },
  "& .MuiTablePagination-toolbar": {
    paddingLeft: "24px",
    paddingRight: "24px",
  },
}));

export const NoDataContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: theme.spacing(2),
}));

export const StepsDialog = styled(Dialog)(({ theme }) => ({
  "& .MuiDialog-paper": {
    borderRadius: 3,
    minWidth: "500px",
    width: "90%",
    maxWidth: "600px",
    minHeight: "500px",
  },
}));

export const StepsDialogTitle = styled(DialogTitle)(({ theme }) => ({
  position: "relative",
  paddingBottom: theme.spacing(1),
}));

export const StepsDialogContent = styled(DialogContent)(({ theme }) => ({
  paddingTop: theme.spacing(3),
  paddingBottom: theme.spacing(4),
  paddingLeft: theme.spacing(3),
  paddingRight: theme.spacing(3),
  minHeight: "400px",
}));

export const StepContainer = styled(Box)(({ theme, isLast }) => ({
  display: "flex",
  alignItems: "center",
  marginBottom: isLast ? 0 : theme.spacing(4),
  paddingTop: theme.spacing(1),
  paddingBottom: theme.spacing(1),
}));

export const StepAvatar = styled(Avatar)(({ theme }) => ({
  backgroundColor: "#213D70",
  marginRight: theme.spacing(2),
  width: 48,
  height: 48,
}));

export const StepInfoContainer = styled(Box)(({ theme }) => ({
  flex: 1,
}));

export const StepHeaderContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(1),
  marginBottom: theme.spacing(0.5),
}));

export const ConfirmDialog = styled(Dialog)(({ theme }) => ({
  "& .MuiDialog-paper": {
    borderRadius: 3,
  },
}));

export const ConfirmDialogActions = styled(Box)(({ theme }) => ({
  display: "flex",
  justifyContent: "center",
  gap: theme.spacing(2),
  paddingBottom: theme.spacing(2),
}));

export const ActionIconButton = styled(IconButton)(({ theme }) => ({
  color: "rgb(33, 61, 112)",
  "&:hover": {
    backgroundColor: "rgba(33, 61, 112, 0.04)",
  },
}));

export const ViewStepsIconButton = styled(IconButton)(({ theme }) => ({
  color: "rgb(33, 61, 112)",
  "&:hover": {
    backgroundColor: "rgba(33, 61, 112, 0.08)",
  },
}));

export const MenuIconButton = styled(IconButton)(({ theme }) => ({
  color: "rgb(33, 61, 112)",
  "&:hover": {
    backgroundColor: "rgba(33, 61, 112, 0.04)",
  },
}));

export const CloseIconButton = styled(IconButton)(({ theme }) => ({
  position: "absolute",
  right: 8,
  top: 8,
  color: "#666",
  "&:hover": {
    backgroundColor: "rgba(0, 0, 0, 0.04)",
  },
}));

export const FlowNameContainer = styled(Box)(({ theme }) => ({
  textAlign: "center",
  marginTop: theme.spacing(1),
}));

export const EmptyStepsContainer = styled(Box)(({ theme }) => ({
  textAlign: "center",
  paddingTop: theme.spacing(4),
  paddingBottom: theme.spacing(4),
}));
