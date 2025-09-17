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
  Chip,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Tooltip,
  TextField,
  Checkbox,
  FormControlLabel,
  Fade,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import EditIcon from "@mui/icons-material/Edit";
import ArchiveIcon from "@mui/icons-material/Archive";
import RestoreIcon from "@mui/icons-material/Restore";
import SearchIcon from "@mui/icons-material/Search";
import LockResetIcon from "@mui/icons-material/LockReset";
import { useSnackbar } from "notistack";
import { SearchBar, SyncButton } from "../masterlist/masterlistComponents";
import UserModal from "../../components/modal/usermanagement/UserModal";
import "../GeneralStyle.scss";
import { useDispatch } from "react-redux";
import { setUserModal } from "../../features/slice/modalSlice";
import HelpIcon from "@mui/icons-material/Help";
import useDebounce from "../../hooks/useDebounce";
import UserActions from "./UserActions";
import {
  useDeleteUserMutation,
  useGetShowUserQuery,
} from "../../features/api/usermanagement/userApi";
import { useResetPasswordMutation } from "../../features/api/changepassApi";
import { CONSTANT } from "../../config";
import "../../pages/GeneralStyle.scss";
import "../../pages/GeneralTable.scss";

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
        placeholder="Search Users..."
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

const User = () => {
  const { enqueueSnackbar } = useSnackbar();
  const dispatch = useDispatch();

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [showArchived, setShowArchived] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  const queryParams = useMemo(
    () => ({
      pagination: 1,
      page: page + 1,
      per_page: rowsPerPage,
      searchQuery: debouncedSearchQuery,
      status: showArchived ? "inactive" : "",
    }),
    [page, rowsPerPage, debouncedSearchQuery, showArchived]
  );

  const {
    data: userData = { data: [], totalCount: 0 },
    isLoading: queryLoading,
    isFetching,
    refetch,
  } = useGetShowUserQuery(queryParams);

  const userList = useMemo(() => {
    if (!userData) return [];
    if (Array.isArray(userData)) return userData;
    if (userData.data && Array.isArray(userData.data)) return userData.data;
    return [];
  }, [userData]);

  const totalCount = useMemo(() => {
    if (userData?.totalCount !== undefined) return userData.totalCount;
    if (userData?.total !== undefined) return userData.total;
    return userList?.length || 0;
  }, [userData, userList]);

  const handleSearchChange = useCallback((query) => {
    setSearchQuery(query);
    setPage(0);
  }, []);

  const handleEditUser = useCallback(
    (user) => {
      dispatch(setUserModal(true));
      setSelectedUser(user);
      setModalOpen(true);
    },
    [dispatch]
  );

  const handleCreateUser = useCallback(() => {
    setSelectedUser(null);
    dispatch(setUserModal(true));
    setModalOpen(true);
  }, [dispatch]);

  const handleModalClose = useCallback(() => {
    setModalOpen(false);
  }, []);

  const [deleteUser] = useDeleteUserMutation();
  const [resetPassword] = useResetPasswordMutation();

  const handleArchiveRestoreClick = useCallback((user) => {
    setSelectedUser(user);
    setConfirmOpen(true);
  }, []);

  const handleArchiveRestoreConfirm = useCallback(async () => {
    if (!selectedUser) return;
    setIsLoading(true);
    try {
      await deleteUser(selectedUser.id).unwrap();
      enqueueSnackbar(
        selectedUser.deleted_at
          ? "User restored successfully!"
          : "User archived successfully!",
        { variant: "success", autoHideDuration: 2000 }
      );
      refetch();
    } catch (error) {
      console.error("Archive/Restore error:", error);
      enqueueSnackbar("Action failed. Please try again.", {
        variant: "error",
        autoHideDuration: 2000,
      });
    } finally {
      setConfirmOpen(false);
      setSelectedUser(null);
      setIsLoading(false);
    }
  }, [deleteUser, enqueueSnackbar, refetch, selectedUser]);

  const handleResetPassword = useCallback(
    async (user) => {
      try {
        await resetPassword({ userId: user.id }).unwrap();
        enqueueSnackbar("Password reset successfully!", {
          variant: "success",
          autoHideDuration: 2000,
        });
      } catch (error) {
        enqueueSnackbar("Password reset failed. Please try again.", {
          variant: "error",
          autoHideDuration: 2000,
        });
      }
    },
    [enqueueSnackbar, resetPassword]
  );

  const handlePageChange = useCallback((event, newPage) => {
    setPage(newPage);
  }, []);

  const handleRowsPerPageChange = useCallback((event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  }, []);

  const handleConfirmClose = useCallback(() => {
    setConfirmOpen(false);
  }, []);

  const handleMenuOpen = (event, user) => {
    setMenuAnchor(event.currentTarget);
    setSelectedUser(user);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
  };

  const handleEditClick = () => {
    handleEditUser(selectedUser);
    handleMenuClose();
  };

  const handleArchiveRestoreMenuClick = () => {
    setConfirmOpen(true);
    handleMenuClose();
  };

  const handleResetPasswordClick = () => {
    handleResetPassword(selectedUser);
    handleMenuClose();
  };

  const renderStatusChip = useCallback((user) => {
    const isActive = !user.deleted_at;

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
            <Typography className="header">USERS</Typography>
            <Fade in={!isLoadingState}>
              <Button
                variant="contained"
                onClick={handleCreateUser}
                startIcon={<AddIcon />}
                disabled={isLoadingState}
                sx={{
                  backgroundColor: "rgb(33, 61, 112)",
                  height: "38px",
                  width: "120px",
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
                CREATE
              </Button>
            </Fade>
          </Box>

          <CustomSearchBar
            searchQuery={searchQuery}
            setSearchQuery={handleSearchChange}
            showArchived={showArchived}
            setShowArchived={setShowArchived}
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
            <Table stickyHeader sx={{ minWidth: 1000 }}>
              <TableHead>
                <TableRow>
                  <TableCell
                    align="left"
                    sx={{ width: "80px", minWidth: "80px" }}>
                    ID
                  </TableCell>
                  <TableCell sx={{ width: "200px", minWidth: "200px" }}>
                    USERNAME
                  </TableCell>
                  <TableCell sx={{ width: "200px", minWidth: "200px" }}>
                    FULL NAME
                  </TableCell>
                  <TableCell sx={{ width: "200px", minWidth: "200px" }}>
                    ROLE
                  </TableCell>
                  <TableCell
                    sx={{ width: "120px", minWidth: "120px" }}
                    align="center">
                    STATUS
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{ width: "100px", minWidth: "100px" }}>
                    ACTION
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {isLoadingState ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                      <CircularProgress
                        size={32}
                        sx={{ color: "rgb(33, 61, 112)" }}
                      />
                    </TableCell>
                  </TableRow>
                ) : userList.length > 0 ? (
                  userList.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell
                        align="left"
                        sx={{ width: "80px", minWidth: "80px" }}>
                        {user.id}
                      </TableCell>
                      <TableCell
                        sx={{
                          width: "200px",
                          minWidth: "200px",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          fontWeight: 600,
                        }}>
                        <Tooltip title={user.username || "N/A"} placement="top">
                          <span>{user.username || "N/A"}</span>
                        </Tooltip>
                      </TableCell>
                      <TableCell
                        sx={{
                          width: "200px",
                          minWidth: "200px",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}>
                        <Tooltip
                          title={user.full_name || "N/A"}
                          placement="top">
                          <span>{user.full_name || "N/A"}</span>
                        </Tooltip>
                      </TableCell>
                      <TableCell
                        sx={{
                          width: "200px",
                          minWidth: "200px",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}>
                        <Tooltip
                          title={user.role?.role_name || "N/A"}
                          placement="top">
                          <span>{user.role?.role_name || "N/A"}</span>
                        </Tooltip>
                      </TableCell>
                      <TableCell
                        sx={{
                          width: "120px",
                          minWidth: "120px",
                          textAlign: "center",
                        }}>
                        {renderStatusChip(user)}
                      </TableCell>
                      <TableCell
                        align="center"
                        sx={{ width: "100px", minWidth: "100px" }}>
                        <IconButton
                          onClick={(e) => handleMenuOpen(e, user)}
                          size="small"
                          sx={{
                            color: "rgb(33, 61, 112)",
                            "&:hover": {
                              backgroundColor: "rgba(33, 61, 112, 0.04)",
                            },
                          }}>
                          <MoreVertIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={6}
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
                          No users found
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {searchQuery
                            ? `No results for "${searchQuery}"`
                            : showArchived
                            ? "No archived users"
                            : "No active users"}
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
              page={page}
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
      </Box>

      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}>
        {!selectedUser?.deleted_at && (
          <MenuItem onClick={handleEditClick}>
            <EditIcon fontSize="small" sx={{ mr: 1 }} /> Edit
          </MenuItem>
        )}
        {!selectedUser?.deleted_at && (
          <MenuItem onClick={handleResetPasswordClick}>
            <LockResetIcon fontSize="small" sx={{ mr: 1 }} /> Reset Password
          </MenuItem>
        )}
        <MenuItem onClick={handleArchiveRestoreMenuClick}>
          {selectedUser?.deleted_at ? (
            <>
              <RestoreIcon sx={{ mr: 1 }} /> Restore
            </>
          ) : (
            <>
              <ArchiveIcon sx={{ mr: 1 }} /> Archive
            </>
          )}
        </MenuItem>
      </Menu>

      <UserModal
        key={selectedUser?.id || "new-user"}
        open={modalOpen}
        handleClose={handleModalClose}
        refetch={refetch}
        selectedUser={selectedUser}
      />

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
            <strong>{selectedUser?.deleted_at ? "restore" : "archive"}</strong>{" "}
            this user?
          </Typography>
          {selectedUser && (
            <Typography
              variant="body2"
              color="text.secondary"
              textAlign="center"
              sx={{ mt: 1 }}>
              {selectedUser.username}
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
    </>
  );
};

export default User;
