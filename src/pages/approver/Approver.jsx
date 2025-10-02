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
import { useGetApproversQuery } from "../../features/api/approvalsetting/approverApi";
import { CONSTANT } from "../../config";
import ApproverModal from "../../components/modal/approvalsettings/ApproverModal";
import {
  useCreateApproverMutation,
  useDeleteApproverMutation,
} from "../../features/api/approvalsetting/approverApi";

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
        placeholder="Search Approvers..."
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

const Approver = () => {
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();

  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [showArchived, setShowArchived] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const [selectedApprover, setSelectedApprover] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

  const [menuAnchor, setMenuAnchor] = useState({});
  const [selectedRowForMenu, setSelectedRowForMenu] = useState(null);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedApproverForAction, setSelectedApproverForAction] =
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
          : "",
    };

    console.log("🔍 Query Params:", params);
    return params;
  }, [debounceValue, page, rowsPerPage, showArchived]);

  const {
    data: usersData,
    isLoading: queryLoading,
    isFetching,
    refetch,
    error,
  } = useGetApproversQuery(queryParams, {
    refetchOnMountOrArgChange: true,
    skip: false,
  });

  // Debug console logs
  console.log("📊 Raw API Response:", usersData);
  console.log("🔄 Query Loading:", queryLoading);
  console.log("🚀 Is Fetching:", isFetching);
  console.log("❌ Error:", error);

  const [createUser] = useCreateApproverMutation();
  const [deleteUser] = useDeleteApproverMutation();

  const approversList = useMemo(() => {
    console.log("🎯 Processing approversList with data:", usersData);

    // Check multiple possible data structures
    let dataArray = null;

    if (usersData?.result?.data) {
      // Original expected structure
      dataArray = usersData.result.data;
      console.log("📋 Using result.data structure");
    } else if (usersData?.result && Array.isArray(usersData.result)) {
      // New API structure based on your sample
      dataArray = usersData.result;
      console.log("📋 Using result array structure");
    } else if (Array.isArray(usersData)) {
      // Direct array structure
      dataArray = usersData;
      console.log("📋 Using direct array structure");
    } else {
      console.log("❌ No valid data structure found");
      return [];
    }

    if (!dataArray || !Array.isArray(dataArray)) {
      console.log("❌ Data array is not valid:", dataArray);
      return [];
    }

    console.log("✅ Found data array with length:", dataArray.length);
    console.log("📝 Sample item:", dataArray[0]);

    const mappedData = dataArray.map((approverItem, index) => {
      console.log(`🔄 Processing item ${index}:`, approverItem);

      return {
        id: approverItem.id,
        user_id: approverItem.user?.id || approverItem.id,
        deleted_at: approverItem.deleted_at,
        updated_at: approverItem.updated_at,
        username: approverItem.user?.username || approverItem.username,
        employee_id: approverItem.user?.employee_id || approverItem.employee_id,
        first_name: approverItem.user?.first_name || approverItem.first_name,
        middle_name: approverItem.user?.middle_name || approverItem.middle_name,
        last_name: approverItem.user?.last_name || approverItem.last_name,
        full_name: approverItem.user?.full_name || approverItem.full_name,
        role: approverItem.user?.role || approverItem.role,
        role_id: approverItem.user?.role_id || approverItem.role_id,
      };
    });

    console.log("✅ Mapped data:", mappedData);
    return mappedData;
  }, [usersData]);

  const handleSearchChange = useCallback((newSearchQuery) => {
    console.log("🔍 Search changed to:", newSearchQuery);
    setSearchQuery(newSearchQuery);
    setPage(1);
  }, []);

  const handleChangeArchived = useCallback((newShowArchived) => {
    console.log("📁 Archived filter changed to:", newShowArchived);
    setShowArchived(newShowArchived);
    setPage(1);
  }, []);

  const handleAddNew = useCallback(() => {
    setSelectedApprover(null);
    setModalMode("create");
    setModalOpen(true);
  }, []);

  const handleRowClick = useCallback((approver) => {
    console.log("👆 Row clicked:", approver);
    setSelectedApprover(approver);
    setModalMode("view");
    setModalOpen(true);
  }, []);

  const handleEditApprover = useCallback((approver) => {
    setSelectedApprover(approver);
    setModalMode("edit");
    setModalOpen(true);
  }, []);

  const handleModalClose = useCallback(() => {
    setModalOpen(false);
    setSelectedApprover(null);
    setModalMode("create");
  }, []);

  const handleModalSave = useCallback(
    async (formData, mode) => {
      setModalLoading(true);
      setIsLoading(true);

      try {
        if (mode === "create") {
          await createUser(formData).unwrap();
        }

        enqueueSnackbar(
          `Approver ${mode === "create" ? "created" : "updated"} successfully!`,
          { variant: "success", autoHideDuration: 2000 }
        );

        refetch();
        handleModalClose();
      } catch (error) {
        console.error("❌ Save error:", error);
        enqueueSnackbar("Failed to save approver. Please try again.", {
          variant: "error",
          autoHideDuration: 2000,
        });
      } finally {
        setModalLoading(false);
        setIsLoading(false);
      }
    },
    [refetch, selectedApprover, enqueueSnackbar, handleModalClose, createUser]
  );

  const handleMenuOpen = useCallback((event, approver) => {
    event.stopPropagation();
    setMenuAnchor((prev) => ({ ...prev, [approver.id]: event.currentTarget }));
    setSelectedRowForMenu(approver);
  }, []);

  const handleMenuClose = useCallback((approverId) => {
    setMenuAnchor((prev) => ({ ...prev, [approverId]: null }));
    setSelectedRowForMenu(null);
  }, []);

  const handleArchiveRestoreClick = useCallback(
    (approver, event) => {
      if (event) {
        event.stopPropagation();
      }
      setSelectedApproverForAction(approver);
      setConfirmOpen(true);
      handleMenuClose(approver.id);
    },
    [handleMenuClose]
  );

  const handleArchiveRestoreConfirm = async () => {
    if (!selectedApproverForAction) return;

    setIsLoading(true);
    try {
      await deleteUser(selectedApproverForAction.id).unwrap();

      enqueueSnackbar(
        selectedApproverForAction.deleted_at
          ? "Approver restored successfully!"
          : "Approver archived successfully!",
        { variant: "success", autoHideDuration: 2000 }
      );

      refetch();
    } catch (error) {
      console.error("❌ Archive/Restore error:", error);
      enqueueSnackbar("Action failed. Please try again.", {
        variant: "error",
        autoHideDuration: 2000,
      });
    } finally {
      setConfirmOpen(false);
      setSelectedApproverForAction(null);
      setIsLoading(false);
    }
  };

  const handlePageChange = useCallback((event, newPage) => {
    console.log("📄 Page changed to:", newPage + 1);
    setPage(newPage + 1);
  }, []);

  const handleRowsPerPageChange = useCallback((event) => {
    const newRowsPerPage = parseInt(event.target.value, 10);
    console.log("📊 Rows per page changed to:", newRowsPerPage);
    setRowsPerPage(newRowsPerPage);
    setPage(1);
  }, []);

  const getInitials = useCallback((firstName, lastName) => {
    return `${firstName?.charAt(0) || ""}${
      lastName?.charAt(0) || ""
    }`.toUpperCase();
  }, []);

  const renderStatusChip = useCallback((approver) => {
    const isActive = !approver.deleted_at;

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

  const isLoadingState = queryLoading || isFetching || isLoading;

  // Updated total count calculation
  const totalCount = useMemo(() => {
    let count = 0;

    if (usersData?.result?.total) {
      count = usersData.result.total;
    } else if (usersData?.result?.length) {
      count = usersData.result.length;
    } else if (Array.isArray(usersData)) {
      count = usersData.length;
    } else if (approversList?.length) {
      count = approversList.length;
    }

    console.log("📊 Total count calculated:", count);
    return count;
  }, [usersData, approversList]);

  console.log("🎭 Final render state:", {
    isLoadingState,
    approversListLength: approversList.length,
    totalCount,
    error: error?.message,
  });

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
            <Typography className="header">APPROVERS</Typography>
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
                ADD APPROVER
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
            <Table stickyHeader sx={{ minWidth: 800 }}>
              <TableHead>
                <TableRow>
                  <TableCell
                    align="left"
                    sx={{ width: "80px", minWidth: "80px" }}>
                    ID
                  </TableCell>
                  <TableCell sx={{ width: "300px", minWidth: "300px" }}>
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
                      <Typography sx={{ mt: 1 }}>
                        Loading approvers...
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : error ? (
                  <TableRow>
                    <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                      <Typography color="error">
                        Error loading data: {error.message || "Unknown error"}
                      </Typography>
                      <Button onClick={() => refetch()} sx={{ mt: 1 }}>
                        Retry
                      </Button>
                    </TableCell>
                  </TableRow>
                ) : approversList.length > 0 ? (
                  approversList.map((approver, index) => {
                    console.log(`🎨 Rendering row ${index}:`, approver);
                    return (
                      <TableRow
                        key={approver.id || index}
                        onClick={() => handleRowClick(approver)}
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
                          {approver.id}
                        </TableCell>
                        <TableCell
                          sx={{
                            width: "300px",
                            minWidth: "300px",
                            fontWeight: 600,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}>
                          {approver.full_name ||
                            `${approver.first_name || ""} ${
                              approver.last_name || ""
                            }`.trim() ||
                            "No Name"}
                        </TableCell>
                        <TableCell
                          sx={{
                            width: "120px",
                            minWidth: "120px",
                          }}>
                          {renderStatusChip(approver)}
                        </TableCell>
                        <TableCell
                          align="center"
                          sx={{ width: "100px", minWidth: "100px" }}>
                          <IconButton
                            onClick={(e) => handleMenuOpen(e, approver)}
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
                            anchorEl={menuAnchor[approver.id]}
                            open={Boolean(menuAnchor[approver.id])}
                            onClose={() => handleMenuClose(approver.id)}
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
                                handleArchiveRestoreClick(approver, e)
                              }
                              sx={{
                                fontSize: "0.875rem",
                                color: approver.deleted_at
                                  ? theme.palette.success.main
                                  : "#d32f2f",
                              }}>
                              {approver.deleted_at ? (
                                <>
                                  <RestoreIcon
                                    fontSize="small"
                                    sx={{ mr: 1 }}
                                  />
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
                    );
                  })
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
                        {CONSTANT?.BUTTONS?.NODATA?.icon || "📋"}
                        <Typography variant="h6" color="text.secondary">
                          No approvers found
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {searchQuery
                            ? `No results for "${searchQuery}"`
                            : showArchived
                            ? "No archived approvers"
                            : "No active approvers"}
                        </Typography>
                        <Button
                          onClick={() => refetch()}
                          variant="outlined"
                          size="small">
                          Refresh Data
                        </Button>
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
              page={Math.max(0, page - 1)}
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
                {selectedApproverForAction?.deleted_at ? "restore" : "archive"}
              </strong>{" "}
              this approver?
            </Typography>
            {selectedApproverForAction && (
              <Typography
                variant="body2"
                color="text.secondary"
                textAlign="center"
                sx={{ mt: 1 }}>
                {selectedApproverForAction.full_name ||
                  `${selectedApproverForAction.first_name} ${selectedApproverForAction.last_name}`}
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

        <ApproverModal
          open={modalOpen}
          onClose={handleModalClose}
          onSave={handleModalSave}
          selectedEntry={selectedApprover}
          isLoading={modalLoading}
          mode={modalMode}
        />
      </Box>
    </FormProvider>
  );
};

export default Approver;
