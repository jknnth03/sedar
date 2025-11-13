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
  Box,
  TextField,
  Checkbox,
  FormControlLabel,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useTheme,
  useMediaQuery,
  alpha,
  Fade,
  Chip,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ArchiveIcon from "@mui/icons-material/Archive";
import AddIcon from "@mui/icons-material/Add";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import RestoreIcon from "@mui/icons-material/Restore";
import HelpIcon from "@mui/icons-material/Help";
import EditIcon from "@mui/icons-material/Edit";
import { useSnackbar } from "notistack";
import "../GeneralStyle.scss";
import {
  useDeleteFileTypesMutation,
  useGetShowFileTypesQuery,
} from "../../features/api/extras/filetypesApi";
import FileTypeModal from "../../components/modal/extras/FileTypesModal";
import useDebounce from "../../hooks/useDebounce";

const CustomSearchBar = ({
  searchQuery,
  setSearchQuery,
  showArchived,
  setShowArchived,
  isLoading = false,
}) => {
  const theme = useTheme();
  const isVerySmall = useMediaQuery("(max-width:369px)");
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const iconColor = showArchived ? "#d32f2f" : "rgb(33, 61, 112)";
  const labelColor = showArchived ? "#d32f2f" : "rgb(33, 61, 112)";

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
            color: iconColor,
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
              icon={<ArchiveIcon sx={{ color: iconColor }} />}
              checkedIcon={<ArchiveIcon sx={{ color: iconColor }} />}
              size="small"
            />
          }
          label="ARCHIVED"
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
              color: labelColor,
              letterSpacing: "0.5px",
            },
          }}
        />
      )}

      <TextField
        placeholder={isVerySmall ? "Search..." : "Search File Types..."}
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
            width: isVerySmall ? "100%" : isMobile ? "280px" : "320px",
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

const FileTypes = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.between(600, 1038));
  const isVerySmall = useMediaQuery("(max-width:369px)");
  const { enqueueSnackbar } = useSnackbar();

  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [showArchived, setShowArchived] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState({});
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedFileType, setSelectedFileType] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const debounceValue = useDebounce(searchQuery, 500);

  const {
    data: fileTypes,
    isLoading: queryLoading,
    isFetching,
    refetch,
    error,
  } = useGetShowFileTypesQuery({
    search: debounceValue,
    page,
    per_page: rowsPerPage,
    status: showArchived ? "inactive" : "active",
  });

  const [deleteFileType] = useDeleteFileTypesMutation();

  const fileTypeList = useMemo(
    () => fileTypes?.result?.data || [],
    [fileTypes]
  );

  const handleSearchChange = useCallback((newSearchQuery) => {
    setSearchQuery(newSearchQuery);
    setPage(1);
  }, []);

  const handleChangeArchived = useCallback((newShowArchived) => {
    setShowArchived(newShowArchived);
    setPage(1);
  }, []);

  const handleMenuOpen = useCallback((event, fileType) => {
    event.stopPropagation();
    setMenuAnchor((prev) => ({ ...prev, [fileType.id]: event.currentTarget }));
  }, []);

  const handleMenuClose = useCallback((fileTypeId) => {
    setMenuAnchor((prev) => ({ ...prev, [fileTypeId]: null }));
  }, []);

  const handleArchiveRestoreClick = useCallback(
    (fileType, event) => {
      if (event) {
        event.stopPropagation();
      }
      setSelectedFileType(fileType);
      setConfirmOpen(true);
      handleMenuClose(fileType.id);
    },
    [handleMenuClose]
  );

  const handleArchiveRestoreConfirm = async () => {
    if (!selectedFileType) return;

    setIsLoading(true);
    try {
      await deleteFileType(selectedFileType.id).unwrap();
      enqueueSnackbar(
        selectedFileType.deleted_at
          ? "File type restored successfully!"
          : "File type archived successfully!",
        { variant: "success", autoHideDuration: 2000 }
      );
      refetch();
    } catch (error) {
      enqueueSnackbar("Action failed. Please try again.", {
        variant: "error",
        autoHideDuration: 2000,
      });
    } finally {
      setConfirmOpen(false);
      setSelectedFileType(null);
      setIsLoading(false);
    }
  };

  const handleAddFileType = useCallback(() => {
    setSelectedFileType(null);
    setModalOpen(true);
  }, []);

  const handleEditClick = useCallback(
    (fileType) => {
      setSelectedFileType(fileType);
      setModalOpen(true);
      handleMenuClose(fileType.id);
    },
    [handleMenuClose]
  );

  const handlePageChange = useCallback((event, newPage) => {
    setPage(newPage + 1);
  }, []);

  const handleRowsPerPageChange = useCallback((event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(1);
  }, []);

  const renderStatusChip = useCallback((fileType) => {
    const isActive = !fileType.deleted_at;

    return (
      <Chip
        label={isActive ? "ACTIVE" : "INACTIVE"}
        size="small"
        sx={{
          backgroundColor: isActive ? "#e8f5e8" : "#fff7f7ff",
          color: isActive ? "#2e7d32" : "#d32f2f",
          border: `1px solid ${isActive ? "#4caf50" : "#d32f2f"}`,
          fontWeight: 600,
          fontSize: "11px",
          height: "24px",
          borderRadius: "12px",
          "& .MuiChip-label": {
            padding: "0 8px",
          },
        }}
      />
    );
  }, []);

  const isLoadingState = queryLoading || isFetching || isLoading;

  return (
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
          justifyContent: isMobile || isTablet ? "flex-start" : "space-between",
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
            {isVerySmall ? "FILE TYPES" : "FILE TYPES"}
          </Typography>

          {isVerySmall ? (
            <IconButton
              onClick={handleAddFileType}
              disabled={isLoadingState}
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
            <Fade in={!isLoadingState}>
              <Button
                variant="contained"
                onClick={handleAddFileType}
                startIcon={<AddIcon />}
                disabled={isLoadingState}
                sx={{
                  backgroundColor: "rgb(33, 61, 112)",
                  height: isMobile ? "36px" : "38px",
                  width: isMobile ? "auto" : "160px",
                  minWidth: isMobile ? "120px" : "160px",
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
            </Fade>
          )}
        </Box>

        <CustomSearchBar
          searchQuery={searchQuery}
          setSearchQuery={handleSearchChange}
          showArchived={showArchived}
          setShowArchived={handleChangeArchived}
          isLoading={isLoadingState}
        />
      </Box>

      <Box
        sx={{
          flex: 1,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          backgroundColor: "white",
        }}>
        <TableContainer
          sx={{
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
              padding: isMobile ? "6px 12px" : "8px 16px",
            },
            "& .MuiTableCell-body": {
              fontSize: isVerySmall ? "12px" : isMobile ? "14px" : "16px",
              color: "#333",
              borderBottom: "1px solid #f0f0f0",
              padding: isMobile ? "6px 12px" : "8px 16px",
              height: isMobile ? "48px" : "52px",
              backgroundColor: "white",
            },
          }}>
          <Table stickyHeader sx={{ minWidth: isMobile ? 600 : 1200 }}>
            <TableHead>
              <TableRow>
                <TableCell
                  align="left"
                  sx={{
                    width: isVerySmall ? "40px" : "60px",
                    minWidth: isVerySmall ? "40px" : "60px",
                  }}>
                  ID
                </TableCell>
                <TableCell
                  sx={{
                    width: isVerySmall ? "70px" : isMobile ? "100px" : "150px",
                    minWidth: isVerySmall
                      ? "70px"
                      : isMobile
                      ? "100px"
                      : "150px",
                  }}>
                  CODE
                </TableCell>
                <TableCell
                  sx={{
                    width: isMobile ? "150px" : "300px",
                    minWidth: isMobile ? "120px" : "300px",
                  }}>
                  FILE TYPE
                </TableCell>
                {!isMobile && (
                  <TableCell sx={{ width: "100px", minWidth: "100px" }}>
                    STATUS
                  </TableCell>
                )}
                <TableCell
                  align="center"
                  sx={{
                    width: isMobile ? "80px" : "100px",
                    minWidth: isMobile ? "80px" : "100px",
                  }}>
                  ACTIONS
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoadingState ? (
                <TableRow>
                  <TableCell
                    colSpan={isMobile ? 4 : 5}
                    align="center"
                    sx={{ py: 4 }}>
                    <CircularProgress
                      size={32}
                      sx={{ color: "rgb(33, 61, 112)" }}
                    />
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell
                    colSpan={isMobile ? 4 : 5}
                    align="center"
                    sx={{ py: 4 }}>
                    <Typography color="error">
                      Error loading data: {error.message || "Unknown error"}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : fileTypeList.length > 0 ? (
                fileTypeList.map((fileType) => (
                  <TableRow key={fileType.id}>
                    <TableCell
                      align="left"
                      sx={{
                        width: isVerySmall ? "40px" : "60px",
                        minWidth: isVerySmall ? "40px" : "60px",
                      }}>
                      {fileType.id}
                    </TableCell>
                    <TableCell
                      sx={{
                        width: isVerySmall
                          ? "70px"
                          : isMobile
                          ? "100px"
                          : "150px",
                        minWidth: isVerySmall
                          ? "70px"
                          : isMobile
                          ? "100px"
                          : "150px",
                        fontSize: isVerySmall ? "10px" : "12px",
                        color: "#666",
                        fontFamily: "monospace",
                        overflow: "hidden",
                        whiteSpace: "nowrap",
                        textOverflow: "ellipsis",
                      }}>
                      {fileType.code}
                    </TableCell>
                    <TableCell
                      sx={{
                        width: isMobile ? "150px" : "300px",
                        minWidth: isMobile ? "120px" : "300px",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        fontWeight: 600,
                      }}>
                      {fileType.name}
                    </TableCell>
                    {!isMobile && (
                      <TableCell
                        sx={{
                          width: "100px",
                          minWidth: "100px",
                        }}>
                        {renderStatusChip(fileType)}
                      </TableCell>
                    )}
                    <TableCell
                      align="center"
                      sx={{
                        width: isMobile ? "80px" : "100px",
                        minWidth: isMobile ? "80px" : "100px",
                      }}>
                      <IconButton
                        onClick={(e) => handleMenuOpen(e, fileType)}
                        size="small"
                        sx={{
                          color: "rgb(33, 61, 112)",
                          "&:hover": {
                            backgroundColor: "rgba(33, 61, 112, 0.04)",
                          },
                        }}>
                        <MoreVertIcon fontSize="small" />
                      </IconButton>
                      <Menu
                        anchorEl={menuAnchor[fileType.id]}
                        open={Boolean(menuAnchor[fileType.id])}
                        onClose={() => handleMenuClose(fileType.id)}
                        transformOrigin={{
                          horizontal: "right",
                          vertical: "top",
                        }}
                        anchorOrigin={{
                          horizontal: "right",
                          vertical: "bottom",
                        }}>
                        {!fileType.deleted_at && (
                          <MenuItem
                            onClick={() => handleEditClick(fileType)}
                            sx={{
                              fontSize: "0.875rem",
                            }}>
                            <EditIcon fontSize="small" sx={{ mr: 1 }} />
                            Edit
                          </MenuItem>
                        )}
                        <MenuItem
                          onClick={(e) =>
                            handleArchiveRestoreClick(fileType, e)
                          }
                          sx={{
                            fontSize: "0.875rem",
                            color: fileType.deleted_at
                              ? theme.palette.success.main
                              : "#d32f2f",
                          }}>
                          {fileType.deleted_at ? (
                            <>
                              <RestoreIcon fontSize="small" sx={{ mr: 1 }} />
                              Restore
                            </>
                          ) : (
                            <>
                              <ArchiveIcon
                                fontSize="small"
                                sx={{ mr: 1, color: "#d32f2f" }}
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
                    colSpan={isMobile ? 4 : 5}
                    align="center"
                    sx={{
                      py: 8,
                      borderBottom: "none",
                      color: "#666",
                      fontSize: isMobile ? "14px" : "16px",
                    }}>
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 2,
                      }}>
                      <Typography variant="h6" color="text.secondary">
                        No file types found
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {searchQuery
                          ? `No results for "${searchQuery}"`
                          : showArchived
                          ? "No archived file types"
                          : "No active file types"}
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <Box
          sx={{
            borderTop: "1px solid #e0e0e0",
            backgroundColor: "#f8f9fa",
            flexShrink: 0,
            "& .MuiTablePagination-root": {
              color: "#666",
              "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows":
                {
                  fontSize: isMobile ? "12px" : "14px",
                  fontWeight: 500,
                },
              "& .MuiTablePagination-select": {
                fontSize: isMobile ? "12px" : "14px",
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
          }}>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25, 50, 100]}
            component="div"
            count={fileTypes?.result?.total || 0}
            rowsPerPage={rowsPerPage}
            page={Math.max(0, page - 1)}
            onPageChange={handlePageChange}
            onRowsPerPageChange={handleRowsPerPageChange}
            sx={{
              "& .MuiTablePagination-toolbar": {
                paddingLeft: isMobile ? "12px" : "24px",
                paddingRight: isMobile ? "12px" : "24px",
              },
            }}
          />
        </Box>
      </Box>

      <Dialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3 },
        }}>
        <DialogTitle>
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            mb={1}>
            <HelpIcon sx={{ fontSize: 60, color: "#ff4400" }} />
          </Box>
          <Typography
            variant="h6"
            fontWeight="bold"
            textAlign="center"
            color="rgb(33, 61, 112)">
            Confirmation
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" gutterBottom textAlign="center">
            Are you sure you want to{" "}
            <strong>
              {selectedFileType?.deleted_at ? "restore" : "archive"}
            </strong>{" "}
            this file type?
          </Typography>
          {selectedFileType && (
            <Typography
              variant="body2"
              color="text.secondary"
              textAlign="center"
              sx={{ mt: 1 }}>
              {selectedFileType.name}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Box
            display="flex"
            justifyContent="center"
            width="100%"
            gap={2}
            mb={2}>
            <Button
              onClick={() => setConfirmOpen(false)}
              variant="outlined"
              color="error"
              sx={{ borderRadius: 2, minWidth: 80 }}>
              Cancel
            </Button>
            <Button
              onClick={handleArchiveRestoreConfirm}
              variant="contained"
              color="success"
              sx={{ borderRadius: 2, minWidth: 80 }}>
              Confirm
            </Button>
          </Box>
        </DialogActions>
      </Dialog>

      <FileTypeModal
        open={modalOpen}
        handleClose={() => setModalOpen(false)}
        selectedFileType={selectedFileType}
        refetch={refetch}
      />
    </Box>
  );
};

export default FileTypes;
