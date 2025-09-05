import React, { useState, useEffect } from "react";
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
  Tooltip,
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
import {
  useDeleteRoleMutation,
  useGetShowRolesQuery,
} from "../../features/api/usermanagement/rolesApi";
import "../../pages/GeneralStyle.scss";
import "../../pages/GeneralTable.scss";
import { CONSTANT } from "../../config";

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
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(searchQuery);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const {
    data: rolesResponse = {},
    isLoading,
    isFetching,
    refetch,
  } = useGetShowRolesQuery({
    page: page,
    rowsPerPage,
    searchQuery: debouncedSearchQuery,
    status: showArchived === false ? "active" : "inactive",
  });

  // Extract roles data from the response structure
  const roles = rolesResponse?.data || [];
  const totalCount = rolesResponse?.total || 0;

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

  const handleAddClick = () => {
    setSelectedRole(null);
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setSelectedRole(null);
  };

  return (
    <>
      {/* Header */}
      <div className="header-container">
        <Typography className="header">ROLES</Typography>
        <Button
          className="add-button"
          variant="contained"
          onClick={handleAddClick}
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
        </div>

        <TableContainer className="table-container">
          <Table stickyHeader sx={{ tableLayout: "fixed", width: "100%" }}>
            <TableHead>
              <TableRow>
                <TableCell
                  className="table-id"
                  sx={{
                    width: "10%",
                    minWidth: "60px",
                    padding: "8px 12px",
                  }}>
                  ID
                </TableCell>
                <TableCell
                  className="table-id"
                  sx={{
                    width: "35%",
                    minWidth: "150px",
                    padding: "8px 12px",
                  }}>
                  ROLE
                </TableCell>
                <TableCell
                  className="table-status"
                  sx={{
                    width: "20%",
                    minWidth: "120px",
                    textAlign: "center",
                    padding: "8px 12px",
                  }}>
                  ACCESS PERMISSION
                </TableCell>
                <TableCell
                  className="table-status"
                  sx={{
                    width: "20%",
                    minWidth: "100px",
                    textAlign: "center",
                    padding: "8px 12px",
                  }}>
                  STATUS
                </TableCell>
                <TableCell
                  className="table-status"
                  sx={{
                    width: "15%",
                    minWidth: "80px",
                    textAlign: "center",
                    padding: "8px 12px",
                  }}>
                  ACTION
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
                    <TableCell
                      className="table-cell-id"
                      sx={{
                        width: "8%",
                        padding: "8px 12px",
                        wordBreak: "break-word",
                      }}>
                      {role.id}
                    </TableCell>
                    <TableCell
                      className="table-cell-id"
                      sx={{
                        width: "10%",
                        padding: "8px 12px",
                        wordBreak: "break-word",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}>
                      <Tooltip title={role.role_name} placement="top">
                        <span>{role.role_name}</span>
                      </Tooltip>
                    </TableCell>
                    <TableCell
                      className="table-status"
                      sx={{
                        width: "20%",
                        textAlign: "center",
                        padding: "8px 12px",
                      }}>
                      <Tooltip title="View Permissions">
                        <IconButton
                          size="small"
                          sx={{
                            backgroundColor: "transparent",
                            transition: "background-color 150ms ease",
                            "&:hover": {
                              backgroundColor: "#e0e0e0",
                            },
                          }}
                          onClick={() => {
                            setSelectedRole(role);
                            setViewPermissionsOpen(true);
                          }}>
                          <VisibilityIcon
                            sx={{ color: "rgb(33, 61, 112)", fontSize: "20px" }}
                          />
                        </IconButton>
                      </Tooltip>
                    </TableCell>

                    <TableCell
                      className="table-status"
                      sx={{
                        width: "22%",
                        textAlign: "center",
                        padding: "8px 12px",
                      }}>
                      <Chip
                        label={showArchived ? "INACTIVE" : "ACTIVE"}
                        color={showArchived ? "error" : "success"}
                        size="small"
                        sx={{ "& .MuiChip-label": { fontSize: "0.68rem" } }}
                      />
                    </TableCell>
                    <TableCell
                      className="table-status"
                      sx={{
                        width: "20%",
                        textAlign: "center",
                        padding: "8px 12px",
                      }}>
                      <IconButton
                        size="small"
                        onClick={(e) => handleMenuOpen(e, role)}>
                        <MoreVertIcon sx={{ fontSize: "20px" }} />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    align="center"
                    borderBottom="none"
                    className="table-cell">
                    {CONSTANT.BUTTONS.NODATA.icon}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <div>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25, 50, 100]}
            component="div"
            count={totalCount}
            rowsPerPage={rowsPerPage}
            page={page - 1}
            onPageChange={(e, newPage) => setPage(newPage + 1)}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(1);
            }}
          />
        </div>
      </Paper>

      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}>
        {!selectedRole?.deleted_at && (
          <MenuItem onClick={handleEditClick}>
            <EditIcon fontSize="small" sx={{ mr: 1 }} /> Edit
          </MenuItem>
        )}
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
            <HelpIcon sx={{ fontSize: 60, color: "#ff4400 " }} />
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
                  }}>
                  <Typography variant="body1">{perm}</Typography>
                </div>
              ))}
            </div>
          ) : (
            <Typography>No permissions assigned to this role.</Typography>
          )}
        </DialogContent>
        <DialogActions sx={{ justifyContent: "right", pb: 2, pr: 2 }}>
          <Button
            onClick={() => setViewPermissionsOpen(false)}
            variant="contained">
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {modalOpen && (
        <RolesModal
          open={modalOpen}
          handleClose={handleModalClose}
          selectedRole={selectedRole}
          refetch={refetch}
        />
      )}
    </>
  );
};

export default Roles;
