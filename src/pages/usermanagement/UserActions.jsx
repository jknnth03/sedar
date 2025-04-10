import { IconButton, Menu, MenuItem } from "@mui/material";
import React from "react";
import EditIcon from "@mui/icons-material/Edit";
import RestoreIcon from "@mui/icons-material/Restore";
import ArchiveIcon from "@mui/icons-material/Archive";
import MoreVertIcon from "@mui/icons-material/MoreVert";

export default function UserActions({
  user,
  showArchived,
  handleEditUser,
  handleArchiveRestoreClick,
}) {
  const [anchor, setAnchor] = React.useState(null);
  const actionCloseHandler = () => {
    setAnchor(null);
  };
  const actionOpenHandler = (e) => {
    setAnchor(e.currentTarget);
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
      </Menu>
    </React.Fragment>
  );
}
