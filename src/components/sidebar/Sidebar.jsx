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
              accessUserPermission?.includes(CHILD.name) &&
              CHILD.name !== "Enable Edit"
          );

          if (permittedChildren.length > 0) {
            return { ...MODULE, children: permittedChildren };
          }
        } else if (
          accessUserPermission?.includes(MODULE.name) &&
          MODULE.name !== "Enable Edit"
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
          {open ? (
            <div className="logo-container">
              <img src={icon} alt="Icon" className="sidebar__logo2" />
              <img src={logo} alt="Logo" className="sidebar__logo" />
            </div>
          ) : (
            <img src={icon} alt="Logo" className="sidebar__logo2" />
          )}

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
              <span className="font-helvetica">
                Powered by MIS All rights reserved
              </span>
            )}
            {open && <span className="font-helvetica">Copyright © 2025</span>}
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
          {open ? (
            <div className="logo-container">
              <img src={icon} alt="Icon" className="sidebar__logo2" />
              <img src={logo} alt="Logo" className="sidebar__logo" />
            </div>
          ) : (
            <img src={icon} alt="Logo" className="sidebar__logo2" />
          )}

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
              <span className="font-helvetica">
                Powered by MIS All rights reserved
              </span>
            )}
            {open && <span className="font-helvetica">Copyright © 2025</span>}
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

          <div className="logo-container">
            <img src={icon} alt="Icon" className="sidebar__logo2" />
            <img src={logo} alt="Logo" className="sidebar__logo" />
          </div>

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
            <span className="font-helvetica">
              Powered by MIS All rights reserved
            </span>
            <span className="font-helvetica">Copyright © 2025</span>
          </Box>
        </Paper>
      </Drawer>
    </>
  );
};

export default Sidebar;
