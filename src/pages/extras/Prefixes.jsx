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
  useMediaQuery,
  useTheme,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ArchiveIcon from "@mui/icons-material/Archive";
import AddIcon from "@mui/icons-material/Add";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import EditIcon from "@mui/icons-material/Edit";
import RestoreIcon from "@mui/icons-material/Restore";
import HelpIcon from "@mui/icons-material/Help";
import { useSnackbar } from "notistack";
import "../GeneralStyle.scss";
import useDebounce from "../../hooks/useDebounce";
import {
  useDeletePrefixesMutation,
  useGetShowPrefixesQuery,
} from "../../features/api/extras/prefixesApi";
import PrefixesModal from "../../components/modal/extras/PrefixesModal";

const CustomSearchBar = ({
  searchQuery,
  setSearchQuery,
  showArchived,
  setShowArchived,
  isLoading = false,
}) => {
  const theme = useTheme();
  const isVerySmall = useMediaQuery("(max-width:369px)");

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
        placeholder={isVerySmall ? "Search..." : "Search prefixes..."}
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

const Prefixes = () => {
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
  const [selectedPrefix, setSelectedPrefix] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const debounceValue = useDebounce(searchQuery, 500);

  const queryParams = useMemo(
    () => ({
      search: debounceValue,
      page,
      per_page: rowsPerPage,
      status: showArchived ? "inactive" : "active",
    }),
    [debounceValue, page, rowsPerPage, showArchived]
  );

  const {
    data: prefixes,
    isLoading: queryLoading,
    isFetching,
    refetch,
    error,
  } = useGetShowPrefixesQuery(queryParams);

  const [deletePrefix] = useDeletePrefixesMutation();

  const prefixList = useMemo(() => prefixes?.result?.data || [], [prefixes]);

  const handleSearchChange = useCallback((newSearchQuery) => {
    setSearchQuery(newSearchQuery);
    setPage(1);
  }, []);

  const handleChangeArchived = useCallback((newShowArchived) => {
    setShowArchived(newShowArchived);
    setPage(1);
  }, []);

  const handleMenuOpen = (event, prefixId) => {
    setMenuAnchor({ [prefixId]: event.currentTarget });
  };

  const handleMenuClose = (prefixId) => {
    setMenuAnchor((prev) => ({ ...prev, [prefixId]: null }));
  };

  const handleArchiveRestoreClick = (prefix) => {
    console.log("Clicked archive/restore for:", prefix);
    setSelectedPrefix(prefix);
    setConfirmOpen(true);
    handleMenuClose(prefix.id);
  };

  const handleArchiveRestoreConfirm = async () => {
    if (!selectedPrefix) return;

    setIsLoading(true);
    try {
      await deletePrefix(selectedPrefix.id).unwrap();
      enqueueSnackbar(
        selectedPrefix.deleted_at
          ? "Prefix restored successfully!"
          : "Prefix archived successfully!",
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
      setSelectedPrefix(null);
      setIsLoading(false);
    }
  };

  const handleAddPrefix = () => {
    setSelectedPrefix(null);
    setModalOpen(true);
  };

  const handleEditClick = (prefix) => {
    setSelectedPrefix(prefix);
    setModalOpen(true);
    handleMenuClose(prefix.id);
  };

  const isLoadingState = queryLoading || isFetching || isLoading;

  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        backgroundColor: "white",
      }}>
      <Box
        sx={{
          display: "flex",
          alignItems: isMobile || isTablet ? "flex-start" : "center",
          justifyContent: isMobile || isTablet ? "flex-start" : "space-between",
          flexDirection: isMobile || isTablet ? "column" : "row",
          flexShrink: 0,
          minHeight: isMobile || isTablet ? "auto" : "60px",
          padding: isMobile ? "12px 14px" : isTablet ? "16px" : "12px 16px",
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
            {isVerySmall ? "PREFIXES" : "PREFIXES"}
          </Typography>

          {isVerySmall ? (
            <IconButton
              onClick={handleAddPrefix}
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
              startIcon={<AddIcon />}
              onClick={handleAddPrefix}
              className="create-button"
              disabled={isLoadingState}
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
            },
            "& .MuiTableRow-root": {
              transition: "background-color 0.2s ease-in-out",
              "&:hover": {
                backgroundColor: "#f8f9fa",
              },
            },
          }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell
                  align="left"
                  sx={{ width: isVerySmall ? "40px" : "60px" }}>
                  ID
                </TableCell>
                <TableCell
                  align="left"
                  sx={{
                    width: isVerySmall ? "70px" : isMobile ? "80px" : "100px",
                    minWidth: isVerySmall
                      ? "70px"
                      : isMobile
                      ? "80px"
                      : "100px",
                  }}>
                  CODE
                </TableCell>
                <TableCell
                  align="left"
                  sx={{ width: isMobile ? "120px" : "300px" }}>
                  PREFIX
                </TableCell>
                {!isMobile && (
                  <TableCell align="center" sx={{ width: "140px" }}>
                    STATUS
                  </TableCell>
                )}
                <TableCell
                  align="center"
                  sx={{ width: isMobile ? "80px" : "100px" }}>
                  ACTION
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
              ) : prefixList.length > 0 ? (
                prefixList.map((prefix) => (
                  <TableRow key={prefix.id}>
                    <TableCell align="left">{prefix.id}</TableCell>
                    <TableCell
                      align="left"
                      sx={{
                        width: isVerySmall
                          ? "70px"
                          : isMobile
                          ? "80px"
                          : "100px",
                        minWidth: isVerySmall
                          ? "70px"
                          : isMobile
                          ? "80px"
                          : "100px",
                        fontFamily: "monospace",
                        fontSize: isVerySmall ? "10px" : "12px",
                        overflow: "hidden",
                        whiteSpace: "nowrap",
                        textOverflow: "ellipsis",
                      }}>
                      {prefix.code}
                    </TableCell>
                    <TableCell
                      align="left"
                      sx={{
                        width: isMobile ? "120px" : "300px",
                        minWidth: isMobile ? "100px" : "180px",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        fontWeight: 600,
                      }}>
                      {prefix.name}
                    </TableCell>
                    {!isMobile && (
                      <TableCell align="center">
                        <Chip
                          label={prefix.deleted_at ? "Inactive" : "Active"}
                          color={prefix.deleted_at ? "error" : "success"}
                          size="small"
                        />
                      </TableCell>
                    )}
                    <TableCell align="center">
                      <IconButton
                        onClick={(e) => handleMenuOpen(e, prefix.id)}
                        size="small">
                        <MoreVertIcon />
                      </IconButton>
                      <Menu
                        anchorEl={menuAnchor[prefix.id]}
                        open={Boolean(menuAnchor[prefix.id])}
                        onClose={() => handleMenuClose(prefix.id)}>
                        {!prefix.deleted_at && (
                          <MenuItem onClick={() => handleEditClick(prefix)}>
                            <EditIcon fontSize="small" sx={{ mr: 1 }} /> Edit
                          </MenuItem>
                        )}
                        <MenuItem
                          onClick={() => handleArchiveRestoreClick(prefix)}>
                          {prefix.deleted_at ? (
                            <>
                              <RestoreIcon fontSize="small" sx={{ mr: 1 }} />{" "}
                              Restore
                            </>
                          ) : (
                            <>
                              <ArchiveIcon fontSize="small" sx={{ mr: 1 }} />{" "}
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
                    {searchQuery && !isLoadingState ? (
                      <Typography>
                        No results found for "{searchQuery}"
                      </Typography>
                    ) : (
                      <Typography>No data available</Typography>
                    )}
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
            count={prefixes?.result?.total || 0}
            rowsPerPage={rowsPerPage}
            page={Math.max(0, page - 1)}
            onPageChange={(event, newPage) => setPage(newPage + 1)}
            onRowsPerPageChange={(event) => {
              setRowsPerPage(parseInt(event.target.value, 10));
              setPage(1);
            }}
            sx={{
              "& .MuiTablePagination-toolbar": {
                paddingLeft: isMobile ? "12px" : "24px",
                paddingRight: isMobile ? "12px" : "24px",
              },
            }}
          />
        </Box>
      </Box>

      <PrefixesModal
        open={modalOpen}
        handleClose={() => setModalOpen(false)}
        refetch={refetch}
        selectedPrefix={selectedPrefix}
      />

      <Dialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        maxWidth="xs">
        <DialogTitle>
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            mb={1}>
            <HelpIcon sx={{ fontSize: 60, color: "#55b8ff" }} />
          </Box>
          <Typography variant="h6" fontWeight="bold" textAlign="center">
            Confirmation
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" gutterBottom>
            Are you sure you want to{" "}
            <strong>
              {selectedPrefix?.deleted_at ? "restore" : "archive"}
            </strong>{" "}
            this prefix?
          </Typography>
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
              color="error">
              No
            </Button>
            <Button
              onClick={handleArchiveRestoreConfirm}
              variant="contained"
              color="success">
              Yes
            </Button>
          </Box>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Prefixes;
