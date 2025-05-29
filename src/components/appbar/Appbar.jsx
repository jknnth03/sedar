import * as React from "react";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import KeyboardDoubleArrowLeftIcon from "@mui/icons-material/KeyboardDoubleArrowLeft";
import NotificationsIcon from "@mui/icons-material/Notifications";

import Typography from "@mui/material/Typography";
import AccountMenu from "../accountmenu/Accountmenu";
import "../appbar/Appbar.scss";

export default function Appbar({ setOpen = () => {} }) {
  const [isOpen, setIsOpen] = React.useState(false);

  const handleToggle = () => {
    setIsOpen((prev) => !prev);
    setOpen((prev) => !prev);
  };

  const userData = JSON.parse(localStorage.getItem("user")) || {};
  const firstName = userData.full_name
    ? userData.full_name.split(" ")[0]
    : "User";

  return (
    <Toolbar
      className="appbar"
      sx={{
        backgroundColor: "white",
        zIndex: 1100,
        width: "100%",
        boxShadow: "none",
        overflow: "visible",
        display: "flex",
        alignItems: "center",
        px: "16px",
      }}>
      <IconButton
        size="large"
        edge="start"
        aria-label="menu"
        onClick={handleToggle}
        sx={{ color: "#FF4500" }}>
        {isOpen ? <MenuIcon /> : <KeyboardDoubleArrowLeftIcon />}
      </IconButton>

      <Box sx={{ flexGrow: 1 }} />

      <Typography
        className="appbar_text"
        sx={{
          color: "rgb(33, 61, 112)",
          fontSize: "14px",
          fontWeight: "bold",
          paddingRight: "10px",
        }}>
        {`Fresh morning, `}
        <span style={{ color: "#FF4500" }}>{firstName} ❤</span>
      </Typography>

      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        {/* Notifications Icon */}
        <IconButton
          sx={{
            color: "rgb(33, 61, 112)",
            transition: "background-color 0.3s",
            "&:hover": {
              backgroundColor: "rgba(33, 61, 112, 0.1)",
              cursor: "pointer",
            },
          }}>
          <NotificationsIcon />
        </IconButton>
      </Box>

      <Box className="account-menu" sx={{ zIndex: 2000, overflow: "visible" }}>
        <AccountMenu />
      </Box>
    </Toolbar>
  );
}
