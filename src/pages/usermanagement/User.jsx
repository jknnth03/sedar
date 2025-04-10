import React, { useState, useMemo } from "react";
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
import NoDataGIF from "../../assets/no-data.gif";
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

const User = () => {
  const { enqueueSnackbar } = useSnackbar();
  const dispatch = useDispatch();

  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [showArchived, setShowArchived] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const debounceValue = useDebounce(searchQuery, 500);

  const { data, isLoading, isFetching, refetch } = useGetShowUserQuery({
    searchQuery: debounceValue,
    page,
    rowsPerPage,
    status: showArchived ? "inactive" : "active",
    pagination: 1,
  });

  const userList = useMemo(() => data || [], [data]);

  const handleSearchChange = (query) => {
    setSearchQuery(query);
  };

  const handleEditUser = (user) => {
    dispatch(setUserModal(true));
    setSelectedUser(user);
    setMenuAnchor(null);
    setModalOpen(true);
  };

  const handleMenuOpen = (event, user) => {
    setMenuAnchor(event.currentTarget);
    setSelectedUser(user);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
  };

  const [deleteUser] = useDeleteUserMutation();

  const handleArchiveRestoreClick = () => {
    if (!selectedUser) return;
    setConfirmOpen(true);
    handleMenuClose();
  };

  const handleArchiveRestoreConfirm = async () => {
    if (!selectedUser) return;
    try {
      await deleteUser(selectedUser.id).unwrap();
      enqueueSnackbar(
        selectedUser.deleted_at
          ? "User  restored successfully!"
          : "User  archived successfully!",
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
      setSelectedUser(null);
    }
  };

  return (
    <>
      <div className="header-container">
        <Typography className="header">User Management</Typography>
        <Button
          className="add-button"
          variant="contained"
          onClick={() => {
            setSelectedUser(null);
            dispatch(setUserModal(true));
            setModalOpen(true);
          }}
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

        <TableContainer
          className="table-container"
          style={{ maxHeight: "60vh" }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell align="center" className="table-header">
                  ID
                </TableCell>
                <TableCell align="center" className="table-header">
                  Username
                </TableCell>
                <TableCell align="center" className="table-header">
                  Full Name
                </TableCell>
                <TableCell align="center" className="table-header">
                  Position
                </TableCell>
                <TableCell align="center" className="table-header">
                  Role
                </TableCell>
                <TableCell
                  align="center"
                  sx={{
                    verticalAlign: "middle",
                    fontWeight: "bold",
                    fontSize: "1rem",
                  }}>
                  Status
                </TableCell>
                <TableCell
                  align="center"
                  sx={{
                    verticalAlign: "middle",
                    fontWeight: "bold",
                    fontSize: "1rem",
                  }}>
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading || isFetching ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <CircularProgress size={24} />
                  </TableCell>
                </TableRow>
              ) : userList.length > 0 ? (
                userList.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="table-cell">{user.id}</TableCell>
                    <TableCell className="table-cell">
                      {user.username || "N/A"}
                    </TableCell>
                    <TableCell className="table-cell">
                      {user.full_name || "N/A"}
                    </TableCell>
                    <TableCell className="table-cell">
                      {user.position?.position_name || "N/A"}
                    </TableCell>
                    <TableCell className="table-cell">
                      {user.role?.role_name || "N/A"}
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={showArchived ? "Inactive" : "Active"}
                        color={showArchived ? "error" : "success"}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <UserActions
                        user={user}
                        showArchived={showArchived}
                        handleEditUser={handleEditUser}
                        handleArchiveRestoreClick={handleArchiveRestoreClick}
                      />
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <img
                      src={NoDataGIF}
                      alt="No Data"
                      style={{ width: "365px" }}
                    />
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50, 100]}
          component="div"
          count={data?.result?.total || userList.length}
          rowsPerPage={rowsPerPage}
          page={page - 1}
          onPageChange={(event, newPage) => setPage(newPage + 1)}
          onRowsPerPageChange={(event) => {
            setRowsPerPage(parseInt(event.target.value, 10));
            setPage(1);
          }}
        />
      </Paper>
      <UserModal
        key={selectedUser?.id || "new-user"}
        open={modalOpen}
        handleClose={() => setModalOpen(false)}
        refetch={refetch}
        selectedUser={selectedUser}
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
          <Typography variant="h6" fontWeight="bold">
            Confirmation
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" gutterBottom>
            Are you sure you want to{" "}
            <strong>{showArchived ? "restore" : "archive"}</strong> this user?
          </Typography>
        </DialogContent>
        <DialogActions>
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
        </DialogActions>
      </Dialog>
    </>
  );
};

export default User;
