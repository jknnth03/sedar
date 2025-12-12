import React from "react";
import {
  Box,
  Drawer,
  Paper,
  CircularProgress,
  IconButton,
} from "@mui/material";
import KeyboardDoubleArrowLeftIcon from "@mui/icons-material/KeyboardDoubleArrowLeft";
import logo from "../../assets/sedar.png";
import icon from "../../assets/logo2.png";
import businessLogo from "../../assets/business.png";
import "../../components/sidebar/styles/Sidebar.scss";
import { useEnhancedModules } from "../../config/index";
import { MainItem } from "./components/MainItem";

const Sidebar = ({
  open,
  mobileSidebarOpen = false,
  onCloseMobile = () => {},
  onToggleSidebar, // Add this prop to control sidebar open/close from parent
}) => {
  const userData = JSON.parse(localStorage.getItem("user")) || [];
  const accessUserPermission = userData?.role?.access_permissions;

  const { modules, isLoading, error } = useEnhancedModules();

  const getPermittedModules = () => {
    if (!modules) return [];

    return Object.values(modules)
      .map((MODULE) => {
        if (MODULE.children) {
          const permittedChildren = Object.values(MODULE.children).filter(
            (CHILD) =>
              accessUserPermission?.includes(CHILD.permissionId) &&
              CHILD.permissionId !== "EMPLOYEES.ENABLEEDIT"
          );

          if (permittedChildren.length > 0) {
            return { ...MODULE, children: permittedChildren };
          }
        } else if (
          accessUserPermission?.includes(MODULE.permissionId) &&
          MODULE.permissionId !== "EMPLOYEES.ENABLEEDIT"
        ) {
          return MODULE;
        }
        return null;
      })
      .filter(Boolean);
  };

  const PermittedModules = getPermittedModules();

  const handleMobileItemClick = () => {
    onCloseMobile();
  };

  // Handler for when a parent item with children is clicked
  const handleParentItemClick = (hasChildren) => {
    // If sidebar is closed and the item has children, open the sidebar
    if (!open && hasChildren && onToggleSidebar) {
      onToggleSidebar();
    }
  };

  if (isLoading) {
    return (
      <Drawer
        variant="permanent"
        anchor="left"
        className={`sidebar-drawer ${mobileSidebarOpen ? "mobile-open" : ""}`}
        sx={{
          "@media (max-width: 768px)": {
            display: "none",
          },
          "@media (min-width: 769px)": {
            display: "block",
          },
        }}>
        <Paper
          elevation={24}
          className={`mainbox ${open ? "open" : "closed"} ${
            mobileSidebarOpen ? "mobile-open" : ""
          }`}
          style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
          <Box className="sidebar__logo-container">
            {open ? (
              <>
                <img src={icon} alt="Icon" className="sidebar__logo2" />
                <img src={logo} alt="Logo" className="sidebar__logo" />
              </>
            ) : (
              <img src={icon} alt="Icon" className="sidebar__logo2" />
            )}
          </Box>

          <Box
            className="sidebar-content"
            style={{
              flexGrow: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}>
            <CircularProgress size={24} />
          </Box>

          <Box className="sidebar_footer">
            <img
              src={businessLogo}
              alt="Business Logo"
              className="footer__logo"
            />
            {open && (
              <span className="footer-text">
                Powered by MIS All rights reserved
              </span>
            )}
            {open && <span className="footer-text">Copyright © 2025</span>}
          </Box>
        </Paper>
      </Drawer>
    );
  }

  if (error) {
    console.error("Error loading dashboard data for notifications:", error);
  }

  return (
    <>
      <Drawer
        variant="permanent"
        anchor="left"
        className="sidebar-drawer"
        sx={{
          "@media (max-width: 768px)": {
            display: "none",
          },
          "@media (min-width: 769px)": {
            display: "block",
          },
        }}>
        <Paper
          elevation={24}
          className={`mainbox ${open ? "open" : "closed"}`}
          style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
          <Box className="sidebar__logo-container">
            {open ? (
              <>
                <img src={icon} alt="Icon" className="sidebar__logo2" />
                <img src={logo} alt="Logo" className="sidebar__logo" />
              </>
            ) : (
              <img src={icon} alt="Icon" className="sidebar__logo2" />
            )}
          </Box>

          <Box
            className="sidebar-content"
            style={{ flexGrow: 1, overflowY: "auto" }}>
            {PermittedModules.map((item, index) => (
              <div className="main-item-wrapper" key={index}>
                <MainItem
                  name={item.name}
                  subItem={item.children}
                  path={item.path}
                  icon={item.icon}
                  sidebarOpen={open}
                  notificationCount={item.notificationCount || 0}
                  onParentClick={() => handleParentItemClick(!!item.children)}
                />
              </div>
            ))}
          </Box>

          <Box className="sidebar_footer">
            <img
              src={businessLogo}
              alt="Business Logo"
              className="footer__logo"
            />
            {open && (
              <span className="footer-text">
                Powered by MIS All rights reserved
              </span>
            )}
            {open && <span className="footer-text">Copyright © 2025</span>}
          </Box>
        </Paper>
      </Drawer>

      <Drawer
        variant="temporary"
        anchor="left"
        open={mobileSidebarOpen}
        onClose={onCloseMobile}
        className="mobile-sidebar-drawer"
        sx={{
          "@media (min-width: 769px)": {
            display: "none",
          },
          "@media (max-width: 768px)": {
            display: "block",
          },
          "& .MuiDrawer-paper": {
            width: 280,
            boxSizing: "border-box",
            boxShadow: "2px 0 8px rgba(0, 0, 0, 0.15)",
          },
        }}
        ModalProps={{
          keepMounted: true,
        }}>
        <Paper
          elevation={0}
          className="mainbox mobile-open"
          style={{
            display: "flex",
            flexDirection: "column",
            height: "100vh",
            width: "100%",
            position: "relative",
          }}>
          <Box
            className="mobile-close-button"
            sx={{
              position: "absolute",
              top: 8,
              right: 8,
              zIndex: 1400,
            }}>
            <IconButton
              onClick={onCloseMobile}
              size="small"
              sx={{
                backgroundColor: "rgba(255, 255, 255, 0.1)",
                color: "rgb(33, 61, 112)",
                "&:hover": {
                  backgroundColor: "rgba(33, 61, 112, 0.2)",
                },
              }}>
              <KeyboardDoubleArrowLeftIcon fontSize="small" />
            </IconButton>
          </Box>

          <Box className="sidebar__logo-container">
            <img src={icon} alt="Icon" className="sidebar__logo2" />
            <img src={logo} alt="Logo" className="sidebar__logo" />
          </Box>

          <Box
            className="sidebar-content"
            style={{ flexGrow: 1, overflowY: "auto" }}>
            {PermittedModules.map((item, index) => (
              <div className="main-item-wrapper" key={index}>
                <MainItem
                  name={item.name}
                  subItem={item.children}
                  path={item.path}
                  icon={item.icon}
                  sidebarOpen={true}
                  notificationCount={item.notificationCount || 0}
                  onNavigate={() => {
                    if (!item.children || item.children.length === 0) {
                      onCloseMobile();
                    }
                  }}
                />
              </div>
            ))}
          </Box>

          <Box className="sidebar_footer">
            <img
              src={businessLogo}
              alt="Business Logo"
              className="footer__logo"
            />
            <span className="footer-text">
              Powered by MIS All rights reserved
            </span>
            <span className="footer-text">Copyright © 2025</span>
          </Box>
        </Paper>
      </Drawer>
    </>
  );
};

export default Sidebar;
