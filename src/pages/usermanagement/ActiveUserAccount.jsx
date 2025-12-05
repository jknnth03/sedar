import React, { useState, useMemo, useCallback } from "react";
import {
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
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
  Skeleton,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import EditIcon from "@mui/icons-material/Edit";
import ArchiveIcon from "@mui/icons-material/Archive";
import RestoreIcon from "@mui/icons-material/Restore";
import HelpIcon from "@mui/icons-material/Help";
import { useSnackbar } from "notistack";
import UserModal from "../../components/modal/usermanagement/UserModal";
import NoDataFound from "../../pages/NoDataFound";
import CustomTablePagination from "../../pages/zzzreusable/CustomTablePagination";
import { useDispatch } from "react-redux";
import { setUserModal } from "../../features/slice/modalSlice";
import {
  useDeleteUserMutation,
  useGetShowUserQuery,
} from "../../features/api/usermanagement/userApi";
import { styles } from "../forms/manpowerform/FormSubmissionStyles";

const ActiveUserAccount = ({
  page,
  rowsPerPage,
  searchQuery,
  showArchived,
  onPageChange,
  onRowsPerPageChange,
}) => {
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();
  const dispatch = useDispatch();

  const [selectedUser, setSelectedUser] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const activeQueryParams = useMemo(
    () => ({
      pagination: 1,
      page: page + 1,
      per_page: rowsPerPage,
      searchQuery: searchQuery,
      status: showArchived ? "inactive" : "active",
    }),
    [page, rowsPerPage, searchQuery, showArchived]
  );

  const {
    data: activeUserData = { data: [], totalCount: 0 },
    isLoading: activeQueryLoading,
    isFetching: activeIsFetching,
    error: activeError,
    refetch: refetchActive,
  } = useGetShowUserQuery(activeQueryParams);

  const userData = activeUserData;
  const queryLoading = activeQueryLoading;
  const isFetching = activeIsFetching;
  const error = activeError;
  const refetch = refetchActive;

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

  const [deleteUser] = useDeleteUserMutation();

  const handleEditUser = useCallback(
    (user) => {
      dispatch(setUserModal(true));
      setSelectedUser(user);
      setModalOpen(true);
    },
    [dispatch]
  );

  const handleModalClose = useCallback(() => {
    setModalOpen(false);
  }, []);

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

  const renderStatusChip = useCallback((user) => {
    const isActive = !user.deleted_at;

    const config = isActive
      ? {
          color: "#2e7d32",
          bgColor: "#e8f5e9",
          label: "ACTIVE",
        }
      : {
          color: "#d32f2f",
          bgColor: "#ffebee",
          label: "INACTIVE",
        };

    return (
      <Chip
        label={config.label}
        size="small"
        sx={{
          fontWeight: 600,
          fontSize: "11px",
          letterSpacing: "0.5px",
          backgroundColor: config.bgColor,
          color: config.color,
          border: `1px solid ${config.color}33`,
        }}
      />
    );
  }, []);

  const isLoadingState = queryLoading || isFetching || isLoading;

  return (
    <>
      <Box
        sx={{
          flex: 1,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          backgroundColor: "white",
        }}>
        <TableContainer sx={styles.tableContainerStyles}>
          <Table
            stickyHeader
            sx={{
              minWidth: 1200,
              height: userList.length === 0 ? "100%" : "auto",
            }}>
            <TableHead>
              <TableRow>
                <TableCell sx={styles.columnStyles.referenceNumber}>
                  ID
                </TableCell>
                <TableCell sx={styles.columnStyles.position}>
                  USERNAME
                </TableCell>
                <TableCell sx={styles.columnStyles.position}>
                  FULL NAME
                </TableCell>
                <TableCell sx={styles.columnStyles.position}>ROLE</TableCell>
                <TableCell sx={styles.columnStyles.status}>STATUS</TableCell>
                <TableCell sx={styles.columnStyles.action}>ACTION</TableCell>
              </TableRow>
            </TableHead>
            <TableBody
              sx={{
                height: userList.length === 0 ? "100%" : "auto",
              }}>
              {isLoadingState ? (
                <>
                  {[...Array(5)].map((_, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Skeleton animation="wave" height={30} />
                      </TableCell>
                      <TableCell>
                        <Skeleton animation="wave" height={30} />
                      </TableCell>
                      <TableCell>
                        <Skeleton animation="wave" height={30} />
                      </TableCell>
                      <TableCell>
                        <Skeleton animation="wave" height={30} />
                      </TableCell>
                      <TableCell>
                        <Skeleton
                          animation="wave"
                          height={24}
                          width={120}
                          sx={{ borderRadius: "12px" }}
                        />
                      </TableCell>
                      <TableCell>
                        <Skeleton
                          animation="wave"
                          height={30}
                          width={30}
                          variant="circular"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </>
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={styles.errorCell}>
                    <Typography color="error">
                      Error loading data: {error.message || "Unknown error"}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : userList.length > 0 ? (
                userList.map((user) => (
                  <TableRow
                    key={user.id}
                    sx={{
                      ...styles.tableRowHover(theme),
                      cursor: "pointer",
                      "&:hover": {
                        backgroundColor: theme.palette.action.hover,
                      },
                    }}>
                    <TableCell
                      sx={{
                        ...styles.columnStyles.referenceNumber,
                        ...styles.cellContentStyles,
                        ...styles.referenceNumberCell,
                      }}>
                      {user.id}
                    </TableCell>
                    <TableCell
                      sx={{
                        ...styles.columnStyles.position,
                        ...styles.cellContentStyles,
                      }}>
                      <Tooltip title={user.username || "N/A"} placement="top">
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: 600,
                            fontSize: "16px",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}>
                          {user.username || "N/A"}
                        </Typography>
                      </Tooltip>
                    </TableCell>
                    <TableCell
                      sx={{
                        ...styles.columnStyles.position,
                        ...styles.cellContentStyles,
                      }}>
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 600,
                          fontSize: "16px",
                        }}>
                        {user.full_name || "N/A"}
                      </Typography>
                    </TableCell>
                    <TableCell
                      sx={{
                        ...styles.columnStyles.position,
                        ...styles.cellContentStyles,
                      }}>
                      <Tooltip
                        title={user.role?.role_name || "N/A"}
                        placement="top">
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: 600,
                            fontSize: "16px",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}>
                          {user.role?.role_name || "N/A"}
                        </Typography>
                      </Tooltip>
                    </TableCell>
                    <TableCell sx={styles.columnStyles.status}>
                      {renderStatusChip(user)}
                    </TableCell>
                    <TableCell sx={styles.columnStyles.action}>
                      <IconButton
                        onClick={(e) => handleMenuOpen(e, user)}
                        size="small"
                        sx={{
                          color: "rgb(33, 61, 112)",
                          "&:hover": {
                            backgroundColor: "rgba(33, 61, 112, 0.08)",
                          },
                        }}>
                        <MoreVertIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow
                  sx={{
                    "&:hover": {
                      backgroundColor: "transparent !important",
                      cursor: "default !important",
                    },
                  }}>
                  <TableCell
                    colSpan={999}
                    rowSpan={999}
                    align="center"
                    sx={{
                      borderBottom: "none",
                      height: "400px",
                      verticalAlign: "middle",
                      "&:hover": {
                        backgroundColor: "transparent !important",
                        cursor: "default !important",
                      },
                    }}>
                    <NoDataFound message="" subMessage="" />
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <CustomTablePagination
          count={totalCount}
          page={page}
          rowsPerPage={rowsPerPage}
          onPageChange={onPageChange}
          onRowsPerPageChange={onRowsPerPageChange}
        />
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
          sx: {
            borderRadius: "12px",
            padding: "8px",
          },
        }}>
        <DialogTitle>
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              marginBottom: 1,
            }}>
            <HelpIcon
              sx={{
                fontSize: 48,
                color: "rgb(33, 61, 112)",
              }}
            />
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
            sx={{
              display: "flex",
              gap: 2,
              width: "100%",
              justifyContent: "center",
              padding: "0 16px 8px",
            }}>
            <Button
              onClick={() => setConfirmOpen(false)}
              variant="outlined"
              color="error"
              sx={{
                minWidth: "120px",
                fontWeight: 600,
                textTransform: "uppercase",
              }}>
              Cancel
            </Button>
            <Button
              onClick={handleArchiveRestoreConfirm}
              variant="contained"
              color="success"
              sx={{
                minWidth: "120px",
                fontWeight: 600,
                textTransform: "uppercase",
              }}>
              Confirm
            </Button>
          </Box>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ActiveUserAccount;
