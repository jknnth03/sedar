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
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { useSnackbar } from "notistack";
import { SearchBar } from "../masterlist/masterlistComponents";
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

  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  // Query parameters memo - match API expectations
  const queryParams = useMemo(
    () => ({
      pagination: 1, // API expects this parameter
      page: page + 1, // Convert to 1-based for API
      per_page: rowsPerPage, // API expects per_page, not rowsPerPage
      searchQuery: debouncedSearchQuery,
      status: showArchived ? "inactive" : "",
    }),
    [page, rowsPerPage, debouncedSearchQuery, showArchived]
  );

  const {
    data: userData = { data: [], totalCount: 0 },
    isLoading,
    isFetching,
    refetch,
  } = useGetShowUserQuery(queryParams);

  const userList = useMemo(() => {
    if (!userData) return [];
    if (Array.isArray(userData)) return userData;
    if (userData.data && Array.isArray(userData.data)) return userData.data;
    return [];
  }, [userData]);

  // Get total count - since transformResponse only returns data array,
  // we need to get totalCount from the original response
  const totalCount = useMemo(() => {
    // The API transformResponse is only returning the data array
    // You might need to modify the API to return the full response
    // or get totalCount from a different source
    if (userData?.totalCount !== undefined) return userData.totalCount;
    if (userData?.total !== undefined) return userData.total;
    // Fallback - this won't be accurate for pagination
    return userList?.length || 0;
  }, [userData, userList]);

  const handleSearchChange = useCallback((query) => {
    setSearchQuery(query);
    setPage(0); // Reset to first page (0-based) on new search
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

  // Page change handler
  const handlePageChange = useCallback((event, newPage) => {
    setPage(newPage);
  }, []);

  const handleRowsPerPageChange = useCallback((event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0); // Reset to first page when changing rows per page
  }, []);

  const handleConfirmClose = useCallback(() => {
    setConfirmOpen(false);
  }, []);

  const renderTableBody = () => {
    if (isLoading || isFetching) {
      return (
        <TableRow>
          <TableCell colSpan={7} align="center">
            <CircularProgress size={24} />
          </TableCell>
        </TableRow>
      );
    }

    if (userList.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={7} align="center">
            {CONSTANT.BUTTONS.NODATA.icon}
          </TableCell>
        </TableRow>
      );
    }

    return userList.map((user) => (
      <TableRow key={user.id}>
        <TableCell className="table-cell">{user.id}</TableCell>
        <TableCell className="table-cell">{user.username || "N/A"}</TableCell>
        <TableCell className="table-cell">{user.full_name || "N/A"}</TableCell>
        <TableCell className="table-cell">
          {user.role?.role_name || "N/A"}
        </TableCell>
        <TableCell className="table-status">
          <Chip
            label={showArchived ? "INACTIVE" : "ACTIVE"}
            color={showArchived ? "error" : "success"}
            size="medium"
            sx={{ "& .MuiChip-label": { fontSize: "0.68rem" } }}
          />
        </TableCell>
        <TableCell className="table-status">
          <UserActions
            user={user}
            showArchived={showArchived}
            handleEditUser={showArchived ? null : () => handleEditUser(user)}
            handleArchiveRestoreClick={() => handleArchiveRestoreClick(user)}
            handleResetPasswordClick={
              showArchived ? null : () => handleResetPassword(user)
            }
          />
        </TableCell>
      </TableRow>
    ));
  };

  return (
    <>
      <div className="header-container">
        <Typography className="header">USERS</Typography>
        <Button
          className="add-button"
          variant="contained"
          onClick={handleCreateUser}
          startIcon={<AddIcon />}>
          CREATE
        </Button>
      </div>

      {/* Table */}
      <Paper className="container">
        <div className="table-controls">
          <SearchBar
            searchQuery={searchQuery}
            setSearchQuery={handleSearchChange}
            showArchived={showArchived}
            setShowArchived={setShowArchived}
          />
        </div>

        <TableContainer className="table-container">
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell className="table-id">ID</TableCell>
                <TableCell className="table-id">USERNAME</TableCell>
                <TableCell className="table-header">FULL NAME</TableCell>
                <TableCell className="table-id">ROLE</TableCell>
                <TableCell className="table-status">STATUS</TableCell>
                <TableCell className="table-status">ACTIONS</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>{renderTableBody()}</TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50, 100]}
          component="div"
          count={totalCount}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handlePageChange}
          onRowsPerPageChange={handleRowsPerPageChange}
        />
      </Paper>

      {/* User Modal */}
      <UserModal
        key={selectedUser?.id || "new-user"}
        open={modalOpen}
        handleClose={handleModalClose}
        refetch={refetch}
        selectedUser={selectedUser}
      />

      {/* Confirmation Dialog */}
      <Dialog open={confirmOpen} onClose={handleConfirmClose} maxWidth="xs">
        <DialogTitle>
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            mb={1}>
            <HelpIcon sx={{ fontSize: 60, color: "#55b8ff" }} />
          </Box>
          <Typography variant="h6" fontWeight="bold">
            Confirmation
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" gutterBottom>
            Are you sure you want to{" "}
            <strong>{selectedUser?.deleted_at ? "restore" : "archive"}</strong>{" "}
            this user?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleConfirmClose} variant="outlined" color="error">
            No
          </Button>
          <Button
            onClick={handleArchiveRestoreConfirm}
            variant="contained"
            color="success">
            Yes
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default User;
