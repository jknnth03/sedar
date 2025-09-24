import React, { useState, useMemo, useCallback } from "react";
import {
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  CircularProgress,
  TableRow,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Chip,
  Tooltip,
  ListItemText,
  ListItem,
  List,
  Box,
  Link,
  TextField,
  Checkbox,
  FormControlLabel,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import EditIcon from "@mui/icons-material/Edit";
import ArchiveIcon from "@mui/icons-material/Archive";
import RestoreIcon from "@mui/icons-material/Restore";
import HelpIcon from "@mui/icons-material/Help";
import AddIcon from "@mui/icons-material/Add";
import ShareLocationIcon from "@mui/icons-material/ShareLocation";
import SearchIcon from "@mui/icons-material/Search";
import HomeRepairServiceIcon from "@mui/icons-material/HomeRepairService";
import VisibilityIcon from "@mui/icons-material/Visibility";
import {
  useDeletePositionMutation,
  useGetPositionsQuery,
} from "../../../features/api/masterlist/positionsApi";
import PositionsModal from "../../../components/modal/masterlist/PositionsModal";
import PositionDialog from "./PositionDialog";
import CoaDialog from "./CoaDialog";
import "../../../pages/GeneralStyle.scss";
import "../../../pages/GeneralTable.scss";
import { useSnackbar } from "notistack";
import useDebounce from "../../../hooks/useDebounce";
import { CONSTANT } from "../../../config";

const CustomSearchBar = ({
  searchQuery,
  setSearchQuery,
  showArchived,
  setShowArchived,
  isLoading = false,
}) => {
  const theme = useTheme();
  const isVerySmall = useMediaQuery("(max-width:369px)");

  const archivedIconColor = showArchived ? "#d32f2f" : "rgb(33, 61, 112)";

  return (
    <Box
      sx={{ display: "flex", alignItems: "center", gap: isVerySmall ? 1 : 1.5 }}
      className="search-bar-container">
      {isVerySmall ? (
        <IconButton
          onClick={() => setShowArchived(!showArchived)}
          disabled={isLoading}
          size="small"
          sx={{
            width: "36px",
            height: "36px",
            border: `1px solid ${showArchived ? "#d32f2f" : "#ccc"}`,
            borderRadius: "8px",
            backgroundColor: showArchived ? "rgba(211, 47, 47, 0.04)" : "white",
            color: archivedIconColor,
            transition: "all 0.2s ease-in-out",
            "&:hover": {
              backgroundColor: showArchived
                ? "rgba(211, 47, 47, 0.08)"
                : "#f5f5f5",
              borderColor: showArchived ? "#d32f2f" : "rgb(33, 61, 112)",
            },
          }}>
          <ArchiveIcon sx={{ fontSize: "18px" }} />
        </IconButton>
      ) : (
        <FormControlLabel
          control={
            <Checkbox
              checked={showArchived}
              onChange={(e) => setShowArchived(e.target.checked)}
              disabled={isLoading}
              icon={<ArchiveIcon sx={{ color: archivedIconColor }} />}
              checkedIcon={<ArchiveIcon sx={{ color: archivedIconColor }} />}
              size="small"
            />
          }
          label="ARCHIVED"
          className="archived-checkbox"
          sx={{
            margin: 0,
            border: `1px solid ${showArchived ? "#d32f2f" : "#ccc"}`,
            borderRadius: "8px",
            paddingLeft: "8px",
            paddingRight: "12px",
            height: "36px",
            backgroundColor: showArchived ? "rgba(211, 47, 47, 0.04)" : "white",
            transition: "all 0.2s ease-in-out",
            "&:hover": {
              backgroundColor: showArchived
                ? "rgba(211, 47, 47, 0.08)"
                : "#f5f5f5",
              borderColor: showArchived ? "#d32f2f" : "rgb(33, 61, 112)",
            },
            "& .MuiFormControlLabel-label": {
              fontSize: "12px",
              fontWeight: 600,
              color: archivedIconColor,
              letterSpacing: "0.5px",
            },
          }}
        />
      )}

      <TextField
        placeholder={isVerySmall ? "Search..." : "Search positions..."}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        disabled={isLoading}
        size="small"
        className="search-input"
        InputProps={{
          startAdornment: (
            <SearchIcon
              sx={{
                color: isLoading ? "#ccc" : "#666",
                marginRight: 1,
                fontSize: isVerySmall ? "18px" : "20px",
              }}
            />
          ),
          endAdornment: isLoading && (
            <CircularProgress size={16} sx={{ marginLeft: 1 }} />
          ),
          sx: {
            height: "36px",
            width: isVerySmall ? "100%" : "320px",
            minWidth: isVerySmall ? "160px" : "200px",
            backgroundColor: "white",
            transition: "all 0.2s ease-in-out",
            "& .MuiOutlinedInput-root": {
              height: "36px",
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
          },
        }}
        sx={{
          flex: isVerySmall ? 1 : "0 0 auto",
          "& .MuiInputBase-input": {
            fontSize: isVerySmall ? "13px" : "14px",
            "&::placeholder": {
              opacity: 0.7,
            },
          },
        }}
      />
    </Box>
  );
};

const Positions = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.between(600, 1038));
  const isVerySmall = useMediaQuery("(max-width:369px)");

  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [showArchived, setShowArchived] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState({});
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [edit, setEdit] = useState(false);
  const [coaDialogOpen, setCoaDialogOpen] = useState(false);
  const [toolsDialogOpen, setToolsDialogOpen] = useState(false);
  const [positionDialogOpen, setPositionDialogOpen] = useState(false);
  const [requestorsDialogOpen, setRequestorsDialogOpen] = useState(false);
  const { enqueueSnackbar } = useSnackbar();
  const debounceValue = useDebounce(searchQuery, 500);

  const {
    data: positions,
    isLoading,
    isFetching,
    refetch,
  } = useGetPositionsQuery({
    search: debounceValue,
    page,
    per_page: rowsPerPage,
    status: showArchived ? "inactive" : "active",
  });

  const [archivePosition] = useDeletePositionMutation();

  const positionList = useMemo(
    () => positions?.result?.data || [],
    [positions]
  );

  const handleSearchChange = useCallback((newSearchQuery) => {
    setSearchQuery(newSearchQuery);
    setPage(1);
  }, []);

  const handleChangeArchived = useCallback((newShowArchived) => {
    setShowArchived(newShowArchived);
    setPage(1);
  }, []);

  const getDisplayFileName = (position) => {
    if (position.position_attachment_filename) {
      return position.position_attachment_filename;
    }

    if (position.position_attachment) {
      try {
        const urlParts = position.position_attachment.split("/");
        const filename = urlParts[urlParts.length - 1];
        return decodeURIComponent(filename);
      } catch (error) {
        return position.position_attachment;
      }
    }

    return null;
  };

  const handleMenuOpen = (event, positionId) => {
    event.stopPropagation();
    setMenuAnchor({ [positionId]: event.currentTarget });
  };

  const handleMenuClose = (positionId) => {
    setMenuAnchor((prev) => {
      const { [positionId]: _, ...rest } = prev;
      return rest;
    });
  };

  const handleArchiveRestoreClick = (position) => {
    handleMenuClose(position.id);
    setTimeout(() => {
      setSelectedPosition(position);
      setConfirmOpen(true);
    }, 200);
  };

  const handleArchiveRestoreConfirm = async () => {
    if (!selectedPosition) return;
    try {
      await archivePosition(selectedPosition.id).unwrap();
      enqueueSnackbar(
        selectedPosition.deleted_at
          ? "Position restored successfully!"
          : "Position archived successfully!",
        { variant: "success", autoHideDuration: 2000 }
      );
      setConfirmOpen(false);
      setSelectedPosition(null);
      refetch();
    } catch (error) {
      enqueueSnackbar(
        error?.data?.message || "Action failed. Please try again.",
        {
          variant: "error",
          autoHideDuration: 2000,
        }
      );
    }
  };

  const handleAddPosition = () => {
    setSelectedPosition({});
    setEdit(false);
    setModalOpen(true);
  };

  const handleEditClick = (position) => {
    setSelectedPosition(position);
    setEdit(true);
    setModalOpen(true);
    handleMenuClose(position.id);
  };

  const handleRowClick = (position) => {
    setSelectedPosition(position);
    setEdit("view");
    setModalOpen(true);
  };

  const handleOpenCoaDialog = (position) => {
    setSelectedPosition(position);
    setCoaDialogOpen(true);
    handleMenuClose(position.id);
  };

  const handleCloseCoaDialog = () => {
    setSelectedPosition(null);
    setCoaDialogOpen(false);
  };

  const handleOpenToolsDialog = (position) => {
    setSelectedPosition(position);
    setToolsDialogOpen(true);
  };

  const handleCloseToolsDialog = () => {
    setSelectedPosition(null);
    setToolsDialogOpen(false);
  };

  const handleOpenPositionDialog = (position) => {
    setSelectedPosition(position);
    setPositionDialogOpen(true);
  };

  const handleClosePositionDialog = () => {
    setSelectedPosition(null);
    setPositionDialogOpen(false);
  };

  const handleOpenRequestorsDialog = (position) => {
    setSelectedPosition(position);
    setRequestorsDialogOpen(true);
  };

  const handleCloseRequestorsDialog = () => {
    setSelectedPosition(null);
    setRequestorsDialogOpen(false);
  };

  return (
    <>
      <Box
        sx={{
          width: "100%",
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          backgroundColor: "#fafafa",
        }}>
        <Box
          sx={{
            display: "flex",
            alignItems: isMobile || isTablet ? "flex-start" : "center",
            justifyContent:
              isMobile || isTablet ? "flex-start" : "space-between",
            flexDirection: isMobile || isTablet ? "column" : "row",
            flexShrink: 0,
            minHeight: isMobile || isTablet ? "auto" : "72px",
            padding: isMobile ? "12px 14px" : isTablet ? "16px" : "16px 14px",
            backgroundColor: "white",
            borderBottom: "1px solid #e0e0e0",
            boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
            gap: isMobile || isTablet ? "16px" : "0",
          }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: isVerySmall ? 1 : isMobile || isTablet ? 2 : 1.4,
              width: isMobile || isTablet ? "100%" : "auto",
              justifyContent: "flex-start",
            }}>
            <Typography className="header">
              {isVerySmall ? "POSITIONS" : "POSITIONS"}
            </Typography>
            {isVerySmall ? (
              <IconButton
                onClick={handleAddPosition}
                disabled={isLoading}
                sx={{
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
                }}>
                <AddIcon sx={{ fontSize: "18px" }} />
              </IconButton>
            ) : (
              <Button
                variant="contained"
                onClick={handleAddPosition}
                startIcon={<AddIcon />}
                disabled={isLoading}
                className="create-button"
                sx={{
                  backgroundColor: "rgb(33, 61, 112)",
                  height: isMobile ? "36px" : "38px",
                  width: isMobile ? "auto" : "140px",
                  minWidth: isMobile ? "100px" : "140px",
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
                }}>
                CREATE
              </Button>
            )}
          </Box>

          <CustomSearchBar
            searchQuery={searchQuery}
            setSearchQuery={handleSearchChange}
            showArchived={showArchived}
            setShowArchived={handleChangeArchived}
            isLoading={isLoading || isFetching}
          />
        </Box>

        <Box
          sx={{
            flex: 1,
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            backgroundColor: "white",
            margin: isMobile ? "8px" : "16px",
            borderRadius: "8px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          }}>
          <TableContainer
            sx={{
              flex: 1,
              overflow: "auto",
              "& .MuiTable-root": {
                minWidth: isMobile ? "800px" : "100%",
              },
            }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell
                    align="left"
                    sx={{
                      backgroundColor: "#f8f9fa",
                      fontWeight: 700,
                      fontSize: isMobile ? "11px" : "12px",
                      color: "rgb(33, 61, 112)",
                      letterSpacing: "0.5px",
                      borderBottom: "2px solid #e0e0e0",
                      padding: isMobile ? "8px 12px" : "12px 16px",
                      minWidth: "60px",
                      maxWidth: "80px",
                      width: "70px",
                    }}>
                    ID
                  </TableCell>
                  <TableCell
                    sx={{
                      backgroundColor: "#f8f9fa",
                      fontWeight: 700,
                      fontSize: isMobile ? "11px" : "12px",
                      color: "rgb(33, 61, 112)",
                      letterSpacing: "0.5px",
                      borderBottom: "2px solid #e0e0e0",
                      padding: isMobile ? "8px 12px" : "12px 16px",
                      minWidth: "100px",
                      maxWidth: "120px",
                      width: "110px",
                    }}>
                    CODE
                  </TableCell>
                  <TableCell
                    sx={{
                      backgroundColor: "#f8f9fa",
                      fontWeight: 700,
                      fontSize: isMobile ? "11px" : "12px",
                      color: "rgb(33, 61, 112)",
                      letterSpacing: "0.5px",
                      borderBottom: "2px solid #e0e0e0",
                      padding: isMobile ? "8px 12px" : "12px 16px",
                      minWidth: "150px",
                      maxWidth: "200px",
                      width: "180px",
                    }}>
                    NAME
                  </TableCell>
                  <TableCell
                    sx={{
                      backgroundColor: "#f8f9fa",
                      fontWeight: 700,
                      fontSize: isMobile ? "11px" : "12px",
                      color: "rgb(33, 61, 112)",
                      letterSpacing: "0.5px",
                      borderBottom: "2px solid #e0e0e0",
                      padding: isMobile ? "8px 12px" : "12px 16px",
                      minWidth: "120px",
                      maxWidth: "150px",
                      width: "130px",
                    }}>
                    CHARGING
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{
                      backgroundColor: "#f8f9fa",
                      fontWeight: 700,
                      fontSize: isMobile ? "11px" : "12px",
                      color: "rgb(33, 61, 112)",
                      letterSpacing: "0.5px",
                      borderBottom: "2px solid #e0e0e0",
                      padding: isMobile ? "8px 12px" : "12px 16px",
                      minWidth: "80px",
                      maxWidth: "100px",
                      width: "90px",
                    }}>
                    COA
                  </TableCell>
                  <TableCell
                    sx={{
                      backgroundColor: "#f8f9fa",
                      fontWeight: 700,
                      fontSize: isMobile ? "11px" : "12px",
                      color: "rgb(33, 61, 112)",
                      letterSpacing: "0.5px",
                      borderBottom: "2px solid #e0e0e0",
                      padding: isMobile ? "8px 12px" : "12px 16px",
                      minWidth: "120px",
                      maxWidth: "150px",
                      width: "140px",
                    }}>
                    SUPERIOR
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{
                      backgroundColor: "#f8f9fa",
                      fontWeight: 700,
                      fontSize: isMobile ? "11px" : "12px",
                      color: "rgb(33, 61, 112)",
                      letterSpacing: "0.5px",
                      borderBottom: "2px solid #e0e0e0",
                      padding: isMobile ? "8px 12px" : "12px 16px",
                      minWidth: "110px",
                      maxWidth: "130px",
                      width: "120px",
                    }}>
                    REQUESTORS
                  </TableCell>
                  <TableCell
                    sx={{
                      backgroundColor: "#f8f9fa",
                      fontWeight: 700,
                      fontSize: isMobile ? "11px" : "12px",
                      color: "rgb(33, 61, 112)",
                      letterSpacing: "0.5px",
                      borderBottom: "2px solid #e0e0e0",
                      padding: isMobile ? "8px 12px" : "12px 16px",
                      minWidth: "120px",
                      maxWidth: "140px",
                      width: "130px",
                    }}>
                    PAY FREQUENCY
                  </TableCell>
                  <TableCell
                    sx={{
                      backgroundColor: "#f8f9fa",
                      fontWeight: 700,
                      fontSize: isMobile ? "11px" : "12px",
                      color: "rgb(33, 61, 112)",
                      letterSpacing: "0.5px",
                      borderBottom: "2px solid #e0e0e0",
                      padding: isMobile ? "8px 12px" : "12px 16px",
                      minWidth: "100px",
                      maxWidth: "120px",
                      width: "110px",
                    }}>
                    SCHEDULE
                  </TableCell>
                  <TableCell
                    sx={{
                      backgroundColor: "#f8f9fa",
                      fontWeight: 700,
                      fontSize: isMobile ? "11px" : "12px",
                      color: "rgb(33, 61, 112)",
                      letterSpacing: "0.5px",
                      borderBottom: "2px solid #e0e0e0",
                      padding: isMobile ? "8px 12px" : "12px 16px",
                      minWidth: "90px",
                      maxWidth: "110px",
                      width: "100px",
                    }}>
                    TEAM
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{
                      backgroundColor: "#f8f9fa",
                      fontWeight: 700,
                      fontSize: isMobile ? "11px" : "12px",
                      color: "rgb(33, 61, 112)",
                      letterSpacing: "0.5px",
                      borderBottom: "2px solid #e0e0e0",
                      padding: isMobile ? "8px 12px" : "12px 16px",
                      minWidth: "80px",
                      maxWidth: "100px",
                      width: "90px",
                    }}>
                    TOOLS
                  </TableCell>
                  <TableCell
                    sx={{
                      backgroundColor: "#f8f9fa",
                      fontWeight: 700,
                      fontSize: isMobile ? "11px" : "12px",
                      color: "rgb(33, 61, 112)",
                      letterSpacing: "0.5px",
                      borderBottom: "2px solid #e0e0e0",
                      padding: isMobile ? "8px 12px" : "12px 16px",
                      minWidth: "120px",
                      maxWidth: "150px",
                      width: "135px",
                    }}>
                    ATTACHMENTS
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{
                      backgroundColor: "#f8f9fa",
                      fontWeight: 700,
                      fontSize: isMobile ? "11px" : "12px",
                      color: "rgb(33, 61, 112)",
                      letterSpacing: "0.5px",
                      borderBottom: "2px solid #e0e0e0",
                      padding: isMobile ? "8px 12px" : "12px 16px",
                      minWidth: "90px",
                      maxWidth: "110px",
                      width: "100px",
                    }}>
                    STATUS
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{
                      backgroundColor: "#f8f9fa",
                      fontWeight: 700,
                      fontSize: isMobile ? "11px" : "12px",
                      color: "rgb(33, 61, 112)",
                      letterSpacing: "0.5px",
                      borderBottom: "2px solid #e0e0e0",
                      padding: isMobile ? "8px 12px" : "12px 16px",
                      minWidth: "80px",
                      maxWidth: "100px",
                      width: "90px",
                    }}>
                    ACTION
                  </TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {isLoading || isFetching ? (
                  <TableRow>
                    <TableCell
                      colSpan={14}
                      align="center"
                      sx={{
                        padding: "40px 20px",
                        borderBottom: "none",
                      }}>
                      <CircularProgress
                        size={32}
                        sx={{ color: "rgb(33, 61, 112)" }}
                      />
                    </TableCell>
                  </TableRow>
                ) : positionList.length > 0 ? (
                  positionList.map((position) => (
                    <TableRow
                      key={position.id}
                      onClick={() => handleRowClick(position)}
                      sx={{
                        cursor: "pointer",
                        transition: "all 0.2s ease-in-out",
                        "&:hover": {
                          backgroundColor: "rgba(33, 61, 112, 0.04)",
                        },
                        "&:nth-of-type(even)": {
                          backgroundColor: "#fafafa",
                        },
                        "&:nth-of-type(even):hover": {
                          backgroundColor: "rgba(33, 61, 112, 0.04)",
                        },
                      }}>
                      <TableCell
                        align="left"
                        sx={{
                          fontSize: isMobile ? "12px" : "13px",
                          padding: isMobile ? "8px 12px" : "12px 16px",
                          color: "#333",
                        }}>
                        {position.id}
                      </TableCell>
                      <TableCell
                        sx={{
                          fontSize: isMobile ? "12px" : "13px",
                          padding: isMobile ? "8px 12px" : "12px 16px",
                          color: "#333",
                          maxWidth: "120px",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}>
                        {position.code}
                      </TableCell>
                      <TableCell
                        sx={{
                          fontSize: isMobile ? "12px" : "13px",
                          padding: isMobile ? "8px 12px" : "12px 16px",
                          color: "#333",
                          fontWeight: 600,
                          maxWidth: "200px",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}>
                        {position.title?.name || "—"}
                      </TableCell>
                      <TableCell
                        sx={{
                          fontSize: isMobile ? "12px" : "13px",
                          padding: isMobile ? "8px 12px" : "12px 16px",
                          color: "#333",
                          maxWidth: "150px",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}>
                        {position.charging?.name || "—"}
                      </TableCell>
                      <TableCell align="center">
                        <Tooltip title="View COA">
                          <IconButton
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenCoaDialog(position);
                            }}
                            size="small"
                            sx={{
                              color: "rgb(33, 61, 112)",
                              "&:hover": {
                                backgroundColor: "rgba(33, 61, 112, 0.1)",
                              },
                            }}>
                            <ShareLocationIcon sx={{ fontSize: "20px" }} />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                      <TableCell
                        sx={{
                          fontSize: isMobile ? "12px" : "13px",
                          padding: isMobile ? "8px 12px" : "12px 16px",
                          color: "#333",
                          maxWidth: "150px",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}>
                        {position.superior?.name || "—"}
                      </TableCell>
                      <TableCell align="center">
                        <Tooltip title="View Requestors">
                          <IconButton
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenRequestorsDialog(position);
                            }}
                            size="small"
                            sx={{
                              color: "rgb(33, 61, 112)",
                              "&:hover": {
                                backgroundColor: "rgba(33, 61, 112, 0.1)",
                              },
                            }}>
                            <VisibilityIcon sx={{ fontSize: "20px" }} />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                      <TableCell
                        sx={{
                          fontSize: isMobile ? "12px" : "13px",
                          padding: isMobile ? "8px 12px" : "12px 16px",
                          color: "#333",
                          maxWidth: "140px",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}>
                        {position.pay_frequency?.name || "—"}
                      </TableCell>
                      <TableCell
                        sx={{
                          fontSize: isMobile ? "12px" : "13px",
                          padding: isMobile ? "8px 12px" : "12px 16px",
                          color: "#333",
                          maxWidth: "120px",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}>
                        {position.schedule?.name || "—"}
                      </TableCell>
                      <TableCell
                        sx={{
                          fontSize: isMobile ? "12px" : "13px",
                          padding: isMobile ? "8px 12px" : "12px 16px",
                          color: "#333",
                          maxWidth: "110px",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}>
                        {position.team?.name || "—"}
                      </TableCell>
                      <TableCell align="center">
                        <Tooltip title="View Tools">
                          <IconButton
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenToolsDialog(position);
                            }}
                            size="small"
                            sx={{
                              color: "rgb(33, 61, 112)",
                              "&:hover": {
                                backgroundColor: "rgba(33, 61, 112, 0.1)",
                              },
                            }}>
                            <HomeRepairServiceIcon sx={{ fontSize: "20px" }} />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                      <TableCell
                        sx={{
                          fontSize: isMobile ? "12px" : "13px",
                          padding: isMobile ? "8px 12px" : "12px 16px",
                          color: "#333",
                          maxWidth: "150px",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}>
                        {getDisplayFileName(position) ? (
                          <Link
                            href={position.position_attachment}
                            target="_blank"
                            rel="noopener"
                            onClick={(e) => e.stopPropagation()}
                            sx={{
                              color: "rgb(33, 61, 112)",
                              textDecoration: "none",
                              "&:hover": {
                                textDecoration: "underline",
                              },
                            }}>
                            {getDisplayFileName(position)}
                          </Link>
                        ) : (
                          "—"
                        )}
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={position.deleted_at ? "ARCHIVED" : "ACTIVE"}
                          size="small"
                          sx={{
                            fontWeight: 600,
                            fontSize: "11px",
                            backgroundColor: position.deleted_at
                              ? "rgba(211, 47, 47, 0.1)"
                              : "rgba(76, 175, 80, 0.1)",
                            color: position.deleted_at ? "#d32f2f" : "#2e7d32",
                            minWidth: "70px",
                          }}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <IconButton
                          onClick={(e) => handleMenuOpen(e, position.id)}
                          size="small"
                          sx={{
                            color: "rgb(33, 61, 112)",
                            "&:hover": {
                              backgroundColor: "rgba(33, 61, 112, 0.1)",
                            },
                          }}>
                          <MoreVertIcon sx={{ fontSize: "20px" }} />
                        </IconButton>
                        <Menu
                          anchorEl={menuAnchor[position.id]}
                          open={Boolean(menuAnchor[position.id])}
                          onClose={() => handleMenuClose(position.id)}
                          onClick={(e) => e.stopPropagation()}>
                          <MenuItem onClick={() => handleEditClick(position)}>
                            <EditIcon
                              sx={{ marginRight: 1, fontSize: "18px" }}
                            />
                            Edit
                          </MenuItem>
                          <MenuItem
                            onClick={() => handleArchiveRestoreClick(position)}>
                            {position.deleted_at ? (
                              <>
                                <RestoreIcon
                                  sx={{ marginRight: 1, fontSize: "18px" }}
                                />
                                Restore
                              </>
                            ) : (
                              <>
                                <ArchiveIcon
                                  sx={{ marginRight: 1, fontSize: "18px" }}
                                />
                                Archive
                              </>
                            )}
                          </MenuItem>
                        </Menu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={14}
                      align="center"
                      sx={{
                        padding: "40px 20px",
                        borderBottom: "none",
                        color: "#666",
                        fontSize: "14px",
                      }}>
                      No positions found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            rowsPerPageOptions={[5, 10, 25, 50]}
            component="div"
            count={positions?.result?.total || 0}
            rowsPerPage={rowsPerPage}
            page={page - 1}
            onPageChange={(event, newPage) => setPage(newPage + 1)}
            onRowsPerPageChange={(event) => {
              setRowsPerPage(parseInt(event.target.value, 10));
              setPage(1);
            }}
            sx={{
              borderTop: "1px solid #e0e0e0",
              "& .MuiTablePagination-toolbar": {
                minHeight: "52px",
                padding: "0 16px",
              },
              "& .MuiTablePagination-selectLabel": {
                fontSize: "13px",
              },
              "& .MuiTablePagination-displayedRows": {
                fontSize: "13px",
              },
            }}
          />
        </Box>
      </Box>

      <PositionsModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedPosition(null);
        }}
        edit={edit}
        position={selectedPosition}
        refetch={refetch}
      />

      <CoaDialog
        open={coaDialogOpen}
        onClose={handleCloseCoaDialog}
        position={selectedPosition}
      />

      <PositionDialog
        open={toolsDialogOpen}
        onClose={handleCloseToolsDialog}
        position={selectedPosition}
        type="tools"
      />

      <PositionDialog
        open={positionDialogOpen}
        onClose={handleClosePositionDialog}
        position={selectedPosition}
        type="position"
      />

      <PositionDialog
        open={requestorsDialogOpen}
        onClose={handleCloseRequestorsDialog}
        position={selectedPosition}
        type="requestors"
      />

      <Dialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        maxWidth="xs"
        fullWidth>
        <DialogTitle sx={{ fontWeight: 600, padding: "20px 24px 16px" }}>
          {selectedPosition?.deleted_at
            ? "Restore Position"
            : "Archive Position"}
        </DialogTitle>
        <DialogContent sx={{ padding: "0 24px 8px" }}>
          <Typography>
            Are you sure you want to{" "}
            {selectedPosition?.deleted_at ? "restore" : "archive"} this
            position?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ padding: "16px 24px 20px" }}>
          <Button
            onClick={() => setConfirmOpen(false)}
            sx={{ color: "#666", fontWeight: 600 }}>
            Cancel
          </Button>
          <Button
            onClick={handleArchiveRestoreConfirm}
            variant="contained"
            sx={{
              backgroundColor: selectedPosition?.deleted_at
                ? "#2e7d32"
                : "#d32f2f",
              fontWeight: 600,
              "&:hover": {
                backgroundColor: selectedPosition?.deleted_at
                  ? "#1b5e20"
                  : "#b71c1c",
              },
            }}>
            {selectedPosition?.deleted_at ? "Restore" : "Archive"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Positions;
