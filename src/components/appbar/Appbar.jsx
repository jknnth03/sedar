import * as React from "react";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import KeyboardDoubleArrowLeftIcon from "@mui/icons-material/KeyboardDoubleArrowLeft";

import AccountMenu from "../accountmenu/AccountMenu";
import Typography from "@mui/material/Typography";
import "../appbar/Appbar.scss";

export default function Appbar({ setOpen = () => {} }) {
  const [isOpen, setIsOpen] = React.useState(false);

  const handleToggle = () => {
    setIsOpen((prev) => !prev);
    setOpen((prev) => !prev); // Keeps original sidebar toggle logic
  };
  const userData = JSON.parse(localStorage.getItem("user")) || [];
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
        sx={{ color: "rgb(33, 61, 112)" }}>
        {isOpen ? <MenuIcon /> : <KeyboardDoubleArrowLeftIcon />}
      </IconButton>

      <Box sx={{ flexGrow: 1 }} />

      <Typography
        className="appbar_text"
        sx={{
          color: "rgb(33, 61, 112)",
          fontSize: "14px",
          fontWeight: "bold",
        }}>
        {`Fresh morning, ${userData.username}!`}
      </Typography>

      <Box className="account-menu" sx={{ zIndex: 2000, overflow: "visible" }}>
        <AccountMenu />
      </Box>
    </Toolbar>
  );
}
