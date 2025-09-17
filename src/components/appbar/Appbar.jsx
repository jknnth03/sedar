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

export default function Appbar({
  open = false, // Add default value and receive current open state
  setOpen = () => {},
  isMobileSidebarOpen = false,
  setMobileSidebarOpen = () => {},
}) {
  const [isMobile, setIsMobile] = React.useState(false);

  // Check if screen size is mobile (768px or below)
  React.useEffect(() => {
    const checkScreenSize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);

      // If switching from mobile to desktop, ensure mobile sidebar is closed
      if (!mobile && isMobileSidebarOpen) {
        setMobileSidebarOpen(false);
      }
    };

    // Check on mount
    checkScreenSize();

    // Add event listener for resize
    window.addEventListener("resize", checkScreenSize);

    // Cleanup
    return () => window.removeEventListener("resize", checkScreenSize);
  }, [isMobileSidebarOpen, setMobileSidebarOpen]);

  // Debug logging - remove this after fixing
  React.useEffect(() => {}, [isMobile, open, isMobileSidebarOpen]);

  const handleToggle = () => {
    if (isMobile) {
      // On mobile (768px and below), toggle the mobile sidebar overlay
      setMobileSidebarOpen((prev) => !prev);
    } else {
      // On desktop, toggle the regular sidebar expand/collapse
      setOpen((prev) => !prev);
    }
  };

  const userData = JSON.parse(localStorage.getItem("user")) || {};
  const firstName = userData.full_name
    ? userData.full_name.split(" ")[0]
    : "User";

  // Determine which icon to show based on screen size and state
  const getToggleIcon = () => {
    if (isMobile) {
      // On mobile (768px and below), always show MenuIcon (hamburger)
      return <MenuIcon />;
    } else {
      // On desktop, show MenuIcon when closed (to expand), KeyboardDoubleArrowLeftIcon when open (to collapse)
      // Make sure we're getting the correct open state
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

      <Typography
        className="appbar_text"
        sx={{
          color: "rgb(33, 61, 112)",
          fontSize: "16px",
          fontWeight: "bold",
        }}>
        <span style={{ color: "rgb(33, 61, 112)" }}>{firstName}</span>
      </Typography>

      {/* Commented out notification button - uncomment if needed */}
      {/* <Box sx={{ display: "flex", alignItems: "center" }}>
        <IconButton
          sx={{
            color: "#996515",
            transition: "background-color 0.3s",
            "&:hover": {
              backgroundColor: "rgba(33, 61, 112, 0.1)",
              cursor: "pointer",
            },
          }}>
          <NotificationsIcon />
        </IconButton>
      </Box> */}

      <Box className="account-menu" sx={{ zIndex: 2000, overflow: "visible" }}>
        <AccountMenu />
      </Box>
    </Toolbar>
  );
}
