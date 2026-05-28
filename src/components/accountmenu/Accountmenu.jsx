import * as React from "react";
import { useNavigate } from "react-router";
import IconButton from "@mui/material/IconButton";
import Avatar from "@mui/material/Avatar";
import Tooltip from "@mui/material/Tooltip";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import Logout from "@mui/icons-material/Logout";
import InfoIcon from "@mui/icons-material/Info";
import "../accountmenu/accountmenu.scss";

export default function AccountMenu() {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  const navigate = useNavigate();

  const getUserData = () => {
    try {
      const storedUser = localStorage.getItem("user");
      if (!storedUser) return { initials: "", displayName: "" };
      const user = JSON.parse(storedUser);

      const firstName = user.first_name?.trim() || "";
      const lastName = user.last_name?.trim() || "";

      const initials = (firstName.charAt(0) || "") + (lastName.charAt(0) || "");

      const displayName =
        firstName && lastName
          ? `${firstName} ${lastName}`
          : user.full_name || "";

      return {
        initials: initials.toUpperCase(),
        displayName: displayName.toUpperCase(),
      };
    } catch (e) {
      return { initials: "", displayName: "" };
    }
  };

  const { initials, displayName } = getUserData();

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    handleClose();
    navigate("/login", { state: { loggedOut: true } });
  };

  return (
    <React.Fragment>
      <Tooltip title="Account">
        <IconButton
          sx={{
            color: "yellow",
            ml: 2,
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
          className="logoutbutton"
          onClick={handleClick}
          size="small"
          aria-controls={open ? "account-menu" : undefined}
          aria-haspopup="true"
          aria-expanded={open ? "true" : undefined}>
          <span
            style={{
              color: "rgb(33, 61, 112)",
              fontWeight: "bold",
              fontSize: "0.85rem",
              whiteSpace: "nowrap",
            }}>
            {displayName}
          </span>
          <Avatar
            sx={{
              width: 32,
              height: 32,
              bgcolor: "#FF4500",
              fontSize: "0.96rem",
            }}>
            {initials}
          </Avatar>
        </IconButton>
      </Tooltip>
      <Menu
        anchorEl={anchorEl}
        id="account-menu"
        open={open}
        onClose={handleClose}
        onClick={handleClose}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}>
        <MenuItem onClick={handleClose} sx={{ fontSize: "1rem" }}>
          <ListItemIcon>
            <InfoIcon fontSize="small" sx={{ color: "darkblue" }} />
          </ListItemIcon>
          Info
        </MenuItem>
        <MenuItem onClick={handleLogout} sx={{ fontSize: "0.99rem" }}>
          <ListItemIcon>
            <Logout fontSize="extra-small" sx={{ color: "red" }} />
          </ListItemIcon>
          Logout
        </MenuItem>
      </Menu>
    </React.Fragment>
  );
}
