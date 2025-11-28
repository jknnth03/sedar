import React, { useState, useMemo, useCallback } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  CircularProgress,
  TableRow,
  Chip,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Tooltip,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import EditIcon from "@mui/icons-material/Edit";
import ArchiveIcon from "@mui/icons-material/Archive";
import RestoreIcon from "@mui/icons-material/Restore";
import HelpIcon from "@mui/icons-material/Help";
import { useSnackbar } from "notistack";
import { useDispatch } from "react-redux";
import { setUserModal } from "../../features/slice/modalSlice";
import {
  useGetPendingRequestsQuery,
  useDeleteUserMutation,
} from "../../features/api/usermanagement/userApi";
import PendingUserModal from "../../components/modal/usermanagement/PendingUserModal";
import { CONSTANT } from "../../config";
import {
  layoutStyles,
  tableStyles,
  chipStyles,
  buttonStyles,
  paginationStyles,
  dialogStyles,
} from "./usermanagementStyles";

const PendingUserAccount = ({
  page,
  rowsPerPage,
  searchQuery,
  showArchived,
  onPageChange,
  onRowsPerPageChange,
}) => {
  const { enqueueSnackbar } = useSnackbar();
  const dispatch = useDispatch();

  const [selectedUser, setSelectedUser] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const queryParams = useMemo(
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
    data: userData = { data: [], totalCount: 0 },
    isLoading: queryLoading,
    isFetching,
    refetch,
  } = useGetPendingRequestsQuery(queryParams);

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
      // Add debug logging
      console.log("handleEditUser called with user:", user);
      dispatch(setUserModal(true));
      setSelectedUser(user);
      setModalOpen(true);
    },
    [dispatch]
  );

  const handleModalClose = useCallback(() => {
    setModalOpen(false);
    setSelectedUser(null); // Clear selected user on close
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
    setSelectedUser(null);
  }, []);

  const handleMenuOpen = useCallback((event, user) => {
    // Add debug logging
    console.log("handleMenuOpen called with user:", user);
    setMenuAnchor(event.currentTarget);
    setSelectedUser(user);
  }, []);

  const handleMenuClose = useCallback(() => {
    setMenuAnchor(null);
    // Don't clear selectedUser here - wait until after action is taken
  }, []);

  const handleEditClick = useCallback(() => {
    // selectedUser is already set from handleMenuOpen
    if (selectedUser) {
      console.log("Edit clicked for user:", selectedUser);
      handleEditUser(selectedUser);
    }
    handleMenuClose();
  }, [selectedUser, handleEditUser, handleMenuClose]);

  const handleArchiveRestoreMenuClick = useCallback(() => {
    setConfirmOpen(true);
    handleMenuClose();
  }, [handleMenuClose]);

  const renderStatusChip = useCallback((user) => {
    const isActive = !user.deleted_at;

    return (
      <Chip
        label={isActive ? "ACTIVE" : "INACTIVE"}
        size="small"
        sx={isActive ? chipStyles.active : chipStyles.inactive}
      />
    );
  }, []);

  const isLoadingState = queryLoading || isFetching || isLoading;

  return (
    <>
      <Box sx={layoutStyles.contentContainer}>
        <TableContainer sx={tableStyles.container}>
          <Table stickyHeader sx={tableStyles.table}>
            <TableHead>
              <TableRow>
                <TableCell align="left" sx={tableStyles.cellId}>
                  ID
                </TableCell>
                <TableCell sx={tableStyles.cellUsername}>USERNAME</TableCell>
                <TableCell sx={tableStyles.cellFullName}>FULL NAME</TableCell>
                <TableCell sx={tableStyles.cellStatus} align="center">
                  STATUS
                </TableCell>
                <TableCell align="center" sx={tableStyles.cellAction}>
                  ACTION
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoadingState ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    align="center"
                    sx={tableStyles.loadingCell}>
                    <CircularProgress
                      size={32}
                      sx={buttonStyles.circularProgress}
                    />
                  </TableCell>
                </TableRow>
              ) : userList.length > 0 ? (
                userList.map((user) => {
                  const fullName =
                    user.last_name && user.first_name
                      ? `${user.last_name}, ${user.first_name}`
                      : user.full_name || "N/A";

                  return (
                    <TableRow key={user.id}>
                      <TableCell align="left" sx={tableStyles.cellId}>
                        {user.id}
                      </TableCell>
                      <TableCell sx={tableStyles.cellUsername}>
                        <Tooltip title={user.username || "N/A"} placement="top">
                          <span>{user.username || "N/A"}</span>
                        </Tooltip>
                      </TableCell>
                      <TableCell sx={tableStyles.cellFullName}>
                        {fullName}
                      </TableCell>
                      <TableCell sx={tableStyles.cellStatus}>
                        {renderStatusChip(user)}
                      </TableCell>
                      <TableCell align="center" sx={tableStyles.cellAction}>
                        <IconButton
                          onClick={(e) => handleMenuOpen(e, user)}
                          size="small"
                          sx={buttonStyles.iconButton}>
                          <MoreVertIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    align="center"
                    sx={tableStyles.emptyCell}>
                    <Box sx={tableStyles.emptyContainer}>
                      {CONSTANT.BUTTONS.NODATA.icon}
                      <Typography variant="h6" color="text.secondary">
                        No users found
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {searchQuery
                          ? `No results for "${searchQuery}"`
                          : showArchived
                          ? "No archived users"
                          : "No pending users"}
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <Box sx={paginationStyles.container}>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25, 50, 100]}
            component="div"
            count={totalCount}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={onPageChange}
            onRowsPerPageChange={onRowsPerPageChange}
            sx={paginationStyles.toolbar}
          />
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

      <PendingUserModal
        open={modalOpen}
        handleClose={handleModalClose}
        refetch={refetch}
        selectedUser={selectedUser}
      />

      <Dialog
        open={confirmOpen}
        onClose={handleConfirmClose}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: dialogStyles.paper,
        }}>
        <DialogTitle>
          <Box sx={dialogStyles.iconContainer}>
            <HelpIcon sx={dialogStyles.helpIcon} />
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
          <Box sx={dialogStyles.actionsContainer}>
            <Button
              onClick={handleConfirmClose}
              variant="outlined"
              color="error"
              sx={dialogStyles.cancelButton}>
              Cancel
            </Button>
            <Button
              onClick={handleArchiveRestoreConfirm}
              variant="contained"
              color="success"
              sx={dialogStyles.confirmButton}>
              Confirm
            </Button>
          </Box>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default PendingUserAccount;
