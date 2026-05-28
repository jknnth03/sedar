import * as React from "react";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import KeyboardDoubleArrowLeftIcon from "@mui/icons-material/KeyboardDoubleArrowLeft";
import AccountMenu from "../accountmenu/Accountmenu";
import "../appbar/Appbar.scss";

export default function Appbar({
  open = false,
  setOpen = () => {},
  isMobileSidebarOpen = false,
  setMobileSidebarOpen = () => {},
}) {
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const checkScreenSize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (!mobile && isMobileSidebarOpen) {
        setMobileSidebarOpen(false);
      }
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, [isMobileSidebarOpen, setMobileSidebarOpen]);

  const handleToggle = () => {
    if (isMobile) {
      setMobileSidebarOpen((prev) => !prev);
    } else {
      setOpen((prev) => !prev);
    }
  };

  const getToggleIcon = () => {
    if (isMobile) {
      return <MenuIcon />;
    } else {
      return open ? <KeyboardDoubleArrowLeftIcon /> : <MenuIcon />;
    }
  };

  return (
    <Toolbar
      className="appbar"
      sx={{
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
        sx={{ color: "rgb(33, 61, 112)" }}
        className="menu-toggle-btn">
        {getToggleIcon()}
      </IconButton>

      <Box sx={{ flexGrow: 1 }} />

      <Box className="account-menu" sx={{ zIndex: 2000, overflow: "visible" }}>
        <AccountMenu />
      </Box>
    </Toolbar>
  );
}
