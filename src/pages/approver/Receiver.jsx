import React, { useState, useMemo, useCallback, useEffect } from "react";
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
import { FormProvider, useForm } from "react-hook-form";
import { useSnackbar } from "notistack";
import "../../pages/GeneralStyle.scss";
import { useGetReceiversQuery } from "../../features/api/approvalsetting/receiverApi";
import { CONSTANT } from "../../config";
import ReceiverModal from "../../components/modal/approvalsettings/ReceiverModal";
import {
  useCreateReceiverMutation,
  useDeleteReceiverMutation,
} from "../../features/api/approvalsetting/receiverApi";

const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

const CustomSearchBar = ({
  searchQuery,
  setSearchQuery,
  showArchived,
  setShowArchived,
  isLoading = false,
}) => {
  const iconColor = showArchived ? "#d32f2f" : "rgb(33, 61, 112)";
  const labelColor = showArchived ? "#d32f2f" : "rgb(33, 61, 112)";

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
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

      <TextField
        placeholder="Search Receivers..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        disabled={isLoading}
        size="small"
        InputProps={{
          startAdornment: (
            <SearchIcon
              sx={{
                color: isLoading ? "#ccc" : "#666",
                marginRight: 1,
                fontSize: "20px",
              }}
            />
          ),
          endAdornment: isLoading && (
            <CircularProgress size={16} sx={{ marginLeft: 1 }} />
          ),
          sx: {
            height: "36px",
            width: "320px",
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
          "& .MuiInputBase-input": {
            fontSize: "14px",
            "&::placeholder": {
              opacity: 0.7,
            },
          },
        }}
      />
    </Box>
  );
};

const Receiver = () => {
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();

  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [showArchived, setShowArchived] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const [selectedReceiver, setSelectedReceiver] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

  const [menuAnchor, setMenuAnchor] = useState({});
  const [selectedRowForMenu, setSelectedRowForMenu] = useState(null);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedReceiverForAction, setSelectedReceiverForAction] =
    useState(null);

  const [isLoading, setIsLoading] = useState(false);

  const methods = useForm({
    defaultValues: {
      username: "",
      employee_id: "",
      first_name: "",
      middle_name: "",
      last_name: "",
      role_id: "",
    },
  });

  const debounceValue = useDebounce(searchQuery, 500);

  const queryParams = useMemo(() => {
    const params = {
      page,
      per_page: rowsPerPage,
      status: showArchived ? "inactive" : "active",
      pagination: true,
      search:
        debounceValue && debounceValue.trim() !== ""
          ? debounceValue.trim()
          : undefined,
    };

    return params;
  }, [debounceValue, page, rowsPerPage, showArchived]);

  const {
    data: receiversData,
    isLoading: queryLoading,
    isFetching,
    refetch,
    error,
  } = useGetReceiversQuery(queryParams, {
    refetchOnMountOrArgChange: true,
    skip: false,
  });

  const [createReceiver] = useCreateReceiverMutation();
  const [deleteReceiver] = useDeleteReceiverMutation();

  const receiversList = useMemo(() => {
    if (!receiversData?.result?.data) return [];
    return receiversData.result.data;
  }, [receiversData]);

  const handleSearchChange = useCallback((newSearchQuery) => {
    setSearchQuery(newSearchQuery);
    setPage(1);
  }, []);

  const handleChangeArchived = useCallback((newShowArchived) => {
    setShowArchived(newShowArchived);
    setPage(1);
  }, []);

  const handleAddNew = useCallback(() => {
    setSelectedReceiver(null);
    setModalMode("create");
    setModalOpen(true);
  }, []);

  const handleRowClick = useCallback((receiver) => {
    setSelectedReceiver(receiver);
    setModalMode("view");
    setModalOpen(true);
  }, []);

  const handleEditReceiver = useCallback((receiver) => {
    setSelectedReceiver(receiver);
    setModalMode("edit");
    setModalOpen(true);
  }, []);

  const handleModalClose = useCallback(() => {
    setModalOpen(false);
    setSelectedReceiver(null);
    setModalMode("create");
  }, []);

  const handleModalSave = useCallback(
    async (formData, mode) => {
      setModalLoading(true);
      setIsLoading(true);

      try {
        if (mode === "create") {
          await createReceiver(formData).unwrap();
        }

        enqueueSnackbar(
          `Receiver ${mode === "create" ? "created" : "updated"} successfully!`,
          { variant: "success", autoHideDuration: 2000 }
        );

        refetch();
        handleModalClose();
      } catch (error) {
        enqueueSnackbar("Failed to save receiver. Please try again.", {
          variant: "error",
          autoHideDuration: 2000,
        });
      } finally {
        setModalLoading(false);
        setIsLoading(false);
      }
    },
    [
      refetch,
      selectedReceiver,
      enqueueSnackbar,
      handleModalClose,
      createReceiver,
    ]
  );

  const handleMenuOpen = useCallback((event, receiver) => {
    event.stopPropagation();
    setMenuAnchor((prev) => ({ ...prev, [receiver.id]: event.currentTarget }));
    setSelectedRowForMenu(receiver);
  }, []);

  const handleMenuClose = useCallback((receiverId) => {
    setMenuAnchor((prev) => ({ ...prev, [receiverId]: null }));
    setSelectedRowForMenu(null);
  }, []);

  const handleArchiveRestoreClick = useCallback(
    (receiver, event) => {
      if (event) {
        event.stopPropagation();
      }
      setSelectedReceiverForAction(receiver);
      setConfirmOpen(true);
      handleMenuClose(receiver.id);
    },
    [handleMenuClose]
  );

  const handleArchiveRestoreConfirm = async () => {
    if (!selectedReceiverForAction) return;

    setIsLoading(true);
    try {
      await deleteReceiver(selectedReceiverForAction.id).unwrap();

      enqueueSnackbar(
        selectedReceiverForAction.deleted_at
          ? "Receiver restored successfully!"
          : "Receiver archived successfully!",
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
      setSelectedReceiverForAction(null);
      setIsLoading(false);
    }
  };

  const handlePageChange = useCallback((event, newPage) => {
    setPage(newPage + 1);
  }, []);

  const handleRowsPerPageChange = useCallback((event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(1);
  }, []);

  const getInitials = useCallback((firstName, lastName) => {
    return `${firstName?.charAt(0) || ""}${
      lastName?.charAt(0) || ""
    }`.toUpperCase();
  }, []);

  const renderStatusChip = useCallback((receiver) => {
    const isActive = !receiver.deleted_at;

    return (
      <Chip
        label={isActive ? "ACTIVE" : "INACTIVE"}
        size="small"
        sx={{
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
        }}
      />
    );
  }, []);

  // Helper function to get full name from receiver data
  const getFullName = useCallback((receiver) => {
    // First try to get full_name from user object
    if (receiver.user?.full_name) {
      return receiver.user.full_name;
    }

    // Fallback to constructing from first_name and last_name from user object
    if (receiver.user?.first_name || receiver.user?.last_name) {
      return `${receiver.user.first_name || ""} ${
        receiver.user.last_name || ""
      }`.trim();
    }

    // Fallback to top-level properties (if they exist)
    if (receiver.full_name) {
      return receiver.full_name;
    }

    if (receiver.first_name || receiver.last_name) {
      return `${receiver.first_name || ""} ${receiver.last_name || ""}`.trim();
    }

    return "N/A";
  }, []);

  const isLoadingState = queryLoading || isFetching || isLoading;

  // Get pagination info from API response
  const currentPage = receiversData?.result?.current_page || 1;
  const totalCount = receiversData?.result?.total || 0;
  const lastPage = receiversData?.result?.last_page || 1;

  return (
    <FormProvider {...methods}>
      <Box
        sx={{
          width: "100%",
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          backgroundColor: "#fafafa",
        }}>
        {/* Header Section */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexShrink: 0,
            minHeight: "72px",
            padding: "16px 14px",
            backgroundColor: "white",
            borderBottom: "1px solid #e0e0e0",
            boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
          }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.4 }}>
            <Typography className="header">RECEIVERS</Typography>
            <Fade in={!isLoadingState}>
              <Button
                variant="contained"
                onClick={handleAddNew}
                startIcon={<AddIcon />}
                disabled={isLoadingState}
                sx={{
                  backgroundColor: "rgb(33, 61, 112)",
                  height: "38px",
                  width: "200px",
                  textTransform: "none",
                  fontWeight: 600,
                  fontSize: "14px",
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
                ADD RECEIVER
              </Button>
            </Fade>
          </Box>

          <CustomSearchBar
            searchQuery={searchQuery}
            setSearchQuery={handleSearchChange}
            showArchived={showArchived}
            setShowArchived={handleChangeArchived}
            isLoading={isLoadingState}
          />
        </Box>

        {/* Table Section */}
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
                fontSize: "18px",
                color: "rgb(33, 61, 112)",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                borderBottom: "2px solid #e0e0e0",
                position: "sticky",
                top: 0,
                zIndex: 10,
                height: "48px",
                padding: "8px 16px",
              },
              "& .MuiTableCell-body": {
                fontSize: "16px",
                color: "#333",
                borderBottom: "1px solid #f0f0f0",
                padding: "8px 16px",
                height: "52px",
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
            }}>
            <Table stickyHeader sx={{ minWidth: 600 }}>
              <TableHead>
                <TableRow>
                  <TableCell
                    align="left"
                    sx={{ width: "80px", minWidth: "80px" }}>
                    ID
                  </TableCell>
                  <TableCell sx={{ width: "400px", minWidth: "400px" }}>
                    FULL NAME
                  </TableCell>
                  <TableCell sx={{ width: "120px", minWidth: "120px" }}>
                    STATUS
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{ width: "100px", minWidth: "100px" }}>
                    ACTIONS
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {isLoadingState ? (
                  <TableRow>
                    <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                      <CircularProgress
                        size={32}
                        sx={{ color: "rgb(33, 61, 112)" }}
                      />
                    </TableCell>
                  </TableRow>
                ) : error ? (
                  <TableRow>
                    <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                      <Typography color="error">
                        Error loading data: {error.message || "Unknown error"}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : receiversList.length > 0 ? (
                  receiversList.map((receiver) => (
                    <TableRow
                      key={receiver.id}
                      onClick={() => handleRowClick(receiver)}
                      sx={{
                        cursor: "pointer",
                        "&:hover": {
                          backgroundColor: alpha(
                            theme.palette.primary.main,
                            0.04
                          ),
                          "& .MuiTableCell-root": {
                            backgroundColor: "transparent",
                          },
                        },
                        transition: "background-color 0.2s ease",
                      }}>
                      <TableCell
                        align="left"
                        sx={{ width: "80px", minWidth: "80px" }}>
                        {receiver.id}
                      </TableCell>
                      <TableCell
                        sx={{
                          width: "400px",
                          minWidth: "400px",
                          fontWeight: 600,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}>
                        {getFullName(receiver)}
                      </TableCell>
                      <TableCell
                        sx={{
                          width: "120px",
                          minWidth: "120px",
                        }}>
                        {renderStatusChip(receiver)}
                      </TableCell>
                      <TableCell
                        align="center"
                        sx={{ width: "100px", minWidth: "100px" }}>
                        <IconButton
                          onClick={(e) => handleMenuOpen(e, receiver)}
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
                          anchorEl={menuAnchor[receiver.id]}
                          open={Boolean(menuAnchor[receiver.id])}
                          onClose={() => handleMenuClose(receiver.id)}
                          transformOrigin={{
                            horizontal: "right",
                            vertical: "top",
                          }}
                          anchorOrigin={{
                            horizontal: "right",
                            vertical: "bottom",
                          }}>
                          <MenuItem
                            onClick={(e) =>
                              handleArchiveRestoreClick(receiver, e)
                            }
                            sx={{
                              fontSize: "0.875rem",
                              color: receiver.deleted_at
                                ? theme.palette.success.main
                                : "#d32f2f",
                            }}>
                            {receiver.deleted_at ? (
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
                      colSpan={4}
                      align="center"
                      sx={{
                        py: 8,
                        borderBottom: "none",
                        color: "#666",
                        fontSize: "16px",
                      }}>
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          gap: 2,
                        }}>
                        {CONSTANT.BUTTONS.NODATA.icon}
                        <Typography variant="h6" color="text.secondary">
                          No receivers found
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {searchQuery
                            ? `No results for "${searchQuery}"`
                            : showArchived
                            ? "No archived receivers"
                            : "No active receivers"}
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination Section */}
          <Box
            sx={{
              borderTop: "1px solid #e0e0e0",
              backgroundColor: "#f8f9fa",
              flexShrink: 0,
              "& .MuiTablePagination-root": {
                color: "#666",
                "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows":
                  {
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
            }}>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25, 50, 100]}
              component="div"
              count={totalCount}
              rowsPerPage={rowsPerPage}
              page={Math.max(0, currentPage - 1)}
              onPageChange={handlePageChange}
              onRowsPerPageChange={handleRowsPerPageChange}
              sx={{
                "& .MuiTablePagination-toolbar": {
                  paddingLeft: "24px",
                  paddingRight: "24px",
                },
              }}
            />
          </Box>
        </Box>

        {/* Confirmation Dialog */}
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
                {selectedReceiverForAction?.deleted_at ? "restore" : "archive"}
              </strong>{" "}
              this receiver?
            </Typography>
            {selectedReceiverForAction && (
              <Typography
                variant="body2"
                color="text.secondary"
                textAlign="center"
                sx={{ mt: 1 }}>
                {getFullName(selectedReceiverForAction)}
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

        {/* Receiver Modal */}
        <ReceiverModal
          open={modalOpen}
          onClose={handleModalClose}
          onSave={handleModalSave}
          selectedEntry={selectedReceiver}
          isLoading={modalLoading}
          mode={modalMode}
        />
      </Box>
    </FormProvider>
  );
};

export default Receiver;
