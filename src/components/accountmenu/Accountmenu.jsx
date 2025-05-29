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

  // 🔤 Extract initials (first two letters from first and last name)
  const getInitial = () => {
    try {
      const storedUser = localStorage.getItem("user");
      if (!storedUser) return "";
      const user = JSON.parse(storedUser);

      const fullName = user.full_name || user.name || user.first_name || "";
      const nameParts = fullName.trim().split(" ");

      const firstInitial = nameParts[0]?.charAt(0).toUpperCase() || "";
      const secondInitial = nameParts[1]?.charAt(0).toUpperCase() || "";

      return firstInitial + secondInitial;
    } catch (e) {
      return "";
    }
  };

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
          sx={{ color: "yellow", ml: 2 }}
          className="logoutbutton"
          onClick={handleClick}
          size="small"
          aria-controls={open ? "account-menu" : undefined}
          aria-haspopup="true"
          aria-expanded={open ? "true" : undefined}>
          <Avatar
            sx={{
              width: 32,
              height: 32,
              bgcolor: "#FF4500",
              fontSize: "0.96rem",
            }}>
            {getInitial()}
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
