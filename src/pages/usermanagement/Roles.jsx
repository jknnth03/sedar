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
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Chip,
  Checkbox,
  FormControlLabel,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import EditIcon from "@mui/icons-material/Edit";
import ArchiveIcon from "@mui/icons-material/Archive";
import RestoreIcon from "@mui/icons-material/Restore";
import HelpIcon from "@mui/icons-material/Help";
import AddIcon from "@mui/icons-material/Add";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { useSnackbar } from "notistack";
import { SearchBar } from "../masterlist/masterlistComponents";
import RolesModal from "../../components/modal/usermanagement/RolesModal";
import NoDataGIF from "../../assets/no-data.gif";
import {
  useDeleteRoleMutation,
  useGetShowRolesQuery,
} from "../../features/api/usermanagement/rolesApi";
import "../GeneralStyle.scss";

const Roles = () => {
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [showArchived, setShowArchived] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [selectedRole, setSelectedRole] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [viewPermissionsOpen, setViewPermissionsOpen] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  const {
    data: roles = [],
    isLoading,
    isFetching,
    refetch,
  } = useGetShowRolesQuery({
    page: page,
    rowsPerPage,
    searchQuery,
    status: showArchived === false ? "active" : "inactive",
  });

  console.log("Fetched Roles:", roles);

  const [deleteRole] = useDeleteRoleMutation();

  const handleMenuOpen = (event, role) => {
    setMenuAnchor(event.currentTarget);
    setSelectedRole(role);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
  };

  const handleArchiveRestoreClick = () => {
    setConfirmOpen(true);
    handleMenuClose();
  };

  const handleArchiveRestoreConfirm = async () => {
    try {
      await deleteRole(selectedRole.id).unwrap();
      enqueueSnackbar(
        selectedRole.deleted_at
          ? "Role restored successfully!"
          : "Role archived successfully!",
        { variant: "success" }
      );
      refetch();
    } catch (error) {
      enqueueSnackbar("Action failed. Please try again.", {
        variant: "error",
      });
    } finally {
      setConfirmOpen(false);
      setSelectedRole(null);
    }
  };

  const handleEditClick = () => {
    setModalOpen(true);
    handleMenuClose();
  };

  return (
    <>
      {/* Header */}
      <div className="header-container">
        <Typography className="header">Roles</Typography>
        <Button
          className="add-button"
          variant="contained"
          onClick={() => {
            setSelectedRole(null);
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
            setSearchQuery={setSearchQuery}
            showArchived={showArchived}
            setShowArchived={setShowArchived}
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={showArchived}
                onChange={(e) => setShowArchived(e.target.checked)}
              />
            }
            label="Show Archived Roles"
          />
        </div>

        <TableContainer
          className="table-container"
          style={{ maxHeight: "60vh" }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell className="table-header">ID</TableCell>
                <TableCell className="table-header">Role Name</TableCell>
                <TableCell
                  align="center"
                  sx={{
                    verticalAlign: "middle",
                    fontWeight: "bold",
                    fontSize: "1rem",
                  }}>
                  Access Permission
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
                  Action
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading || isFetching ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    <CircularProgress size={24} />
                  </TableCell>
                </TableRow>
              ) : roles.length > 0 ? (
                roles.map((role) => (
                  <TableRow key={role.id}>
                    <TableCell className="table-cell">{role.id}</TableCell>
                    <TableCell className="table-cell">
                      {role.role_name}
                    </TableCell>
                    <TableCell align="center">
                      <IconButton
                        onClick={() => {
                          setSelectedRole(role);
                          setViewPermissionsOpen(true);
                        }}>
                        <VisibilityIcon style={{ color: "black" }} />
                      </IconButton>
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={role.deleted_at ? "Inactive" : "Active"}
                        color={role.deleted_at ? "error" : "success"}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <IconButton onClick={(e) => handleMenuOpen(e, role)}>
                        <MoreVertIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} align="center">
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
          count={length}
          rowsPerPage={rowsPerPage}
          page={page - 1}
          onPageChange={(e, newPage) => setPage(newPage + 1)}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(1);
          }}
        />
      </Paper>

      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}>
        <MenuItem onClick={handleEditClick}>
          <EditIcon sx={{ mr: 1 }} /> Edit
        </MenuItem>
        <MenuItem onClick={handleArchiveRestoreClick}>
          {selectedRole?.deleted_at ? (
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

      <Dialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        maxWidth="xs"
        PaperProps={{
          sx: { borderRadius: 3, padding: 2, textAlign: "center" },
        }}>
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
          <Typography variant="body1">
            Are you sure you want to{" "}
            <span style={{ fontWeight: "bold" }}>
              {selectedRole?.deleted_at ? "restore" : "archive"}
            </span>{" "}
            this role?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: "center" }}>
          <Button
            onClick={() => setConfirmOpen(false)}
            variant="outlined"
            color="error">
            No
          </Button>
          <Button
            onClick={handleArchiveRestoreConfirm}
            variant="contained"
            sx={{
              backgroundColor: "rgb(0, 151, 20)",
              color: "#fff",
              "&:hover": { backgroundColor: "rgb(0, 102, 14)" },
            }}>
            Yes
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={viewPermissionsOpen}
        onClose={() => setViewPermissionsOpen(false)}
        maxWidth="sm"
        fullWidth>
        <DialogTitle style={{ backgroundColor: "rgb(233, 246, 255)" }}>
          <Typography variant="h6" style={{ fontWeight: "bold" }}>
            Access Permissions
          </Typography>
        </DialogTitle>
        <DialogContent style={{ backgroundColor: "white" }}>
          {selectedRole?.access_permissions?.length ? (
            <div style={{ paddingTop: "1rem" }}>
              {selectedRole.access_permissions.map((perm, idx) => (
                <div
                  key={idx}
                  style={{
                    borderBottom: "1px solid #ccc",
                    padding: "0.5rem 0",
                    fontFamily: "'Helvetica Neue', Arial, sans-serif", // Apply Helvetica Neue font
                    fontSize: "1rem", // Change font size
                    color: "#333", // Change font color
                  }}>
                  {perm}
                </div>
              ))}
            </div>
          ) : (
            <Typography
              style={{
                marginTop: "0.5rem",
                marginBottom: "0.5rem",
                padding: "0.5rem",
                fontFamily: "'Helvetica Neue', Arial, sans-serif", // Apply Helvetica Neue font
              }}>
              No permissions assigned.
            </Typography>
          )}
        </DialogContent>
        <DialogActions style={{ backgroundColor: "white" }}>
          <Button
            onClick={() => setViewPermissionsOpen(false)}
            variant="contained"
            color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>

      <RolesModal
        open={modalOpen}
        handleClose={() => setModalOpen(false)}
        refetch={refetch}
        selectedRole={selectedRole}
        showArchived={showArchived}
      />
    </>
  );
};

export default Roles;
