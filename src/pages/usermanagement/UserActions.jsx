import React from "react";
import {
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  Box,
  Typography,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import RestoreIcon from "@mui/icons-material/Restore";
import ArchiveIcon from "@mui/icons-material/Archive";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import LockResetIcon from "@mui/icons-material/LockReset"; // Reset password icon
import HelpIcon from "@mui/icons-material/Help"; // For the reset password dialog

export default function UserActions({
  user,
  showArchived,
  handleEditUser,
  handleArchiveRestoreClick,
  handleResetPasswordClick, // Reset password handler passed from parent
}) {
  const [anchor, setAnchor] = React.useState(null);
  const [dialogOpen, setDialogOpen] = React.useState(false); // State to control dialog visibility
  const [selectedUser, setSelectedUser] = React.useState(null); // To store user data for reset

  // Function to close the action menu
  const actionCloseHandler = () => {
    setAnchor(null);
  };

  // Function to open the action menu
  const actionOpenHandler = (e) => {
    setAnchor(e.currentTarget);
  };

  // Open the reset password dialog
  const handleResetPasswordDialogOpen = (user) => {
    setSelectedUser(user);
    setDialogOpen(true);
    actionCloseHandler(); // Close the menu when dialog opens
  };

  // Confirm reset password and call the handler function passed from parent
  const handleResetPasswordConfirm = () => {
    if (selectedUser && handleResetPasswordClick) {
      handleResetPasswordClick(selectedUser); // Call the parent reset password function
      setDialogOpen(false); // Close the dialog after confirmation
    }
  };

  // Close the reset password dialog without resetting
  const handleDialogClose = () => {
    setDialogOpen(false); // Close the dialog without resetting
  };

  return (
    <React.Fragment>
      <IconButton onClick={(e) => actionOpenHandler(e, user)}>
        <MoreVertIcon />
      </IconButton>
      <Menu
        anchorEl={anchor}
        open={Boolean(anchor)}
        onClose={actionCloseHandler}
        PaperProps={{
          elevation: 2,
          sx: {
            borderRadius: 2,
            boxShadow: "0px 2px 5px rgba(0,0,0,0.15)",
          },
        }}>
        {!showArchived && (
          <MenuItem
            onClick={() => {
              handleEditUser(user);
              actionCloseHandler();
            }}>
            <EditIcon fontSize="small" style={{ marginRight: 8 }} />
            Edit
          </MenuItem>
        )}

        <MenuItem
          onClick={() => {
            handleArchiveRestoreClick(user);
            actionCloseHandler();
          }}>
          {showArchived ? (
            <>
              <RestoreIcon fontSize="small" style={{ marginRight: 8 }} />
              Restore
            </>
          ) : (
            <>
              <ArchiveIcon fontSize="small" style={{ marginRight: 8 }} />
              Archive
            </>
          )}
        </MenuItem>

        {/* Reset Password option */}
        <MenuItem onClick={() => handleResetPasswordDialogOpen(user)}>
          <LockResetIcon fontSize="small" style={{ marginRight: 8 }} />
          Reset Password
        </MenuItem>
      </Menu>

      {/* Reset Password Confirmation Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={handleDialogClose}
        maxWidth="xs"
        fullWidth>
        <DialogTitle>
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            mb={1}>
            <HelpIcon sx={{ fontSize: 60, color: "#55b8ff" }} />
          </Box>
          <Typography variant="h6" fontWeight="bold">
            Reset Password Confirmation
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" gutterBottom>
            Are you sure you want to reset the password for this user?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose} variant="outlined" color="error">
            No
          </Button>
          <Button
            onClick={handleResetPasswordConfirm}
            variant="contained"
            color="success">
            Yes
          </Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
}
