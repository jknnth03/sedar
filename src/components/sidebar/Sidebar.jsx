import React from "react";
import { Box, Drawer, Paper, CircularProgress } from "@mui/material";
import logo from "../../assets/sedar.png";
import icon from "../../assets/logo2.png";
import businessLogo from "../../assets/business.png";
import "../../components/sidebar/styles/Sidebar.scss";
import { useEnhancedModules } from "../../config/index"; // Import the enhanced modules hook
import { MainItem } from "./components/MainItem";

const Sidebar = ({ open }) => {
  const userData = JSON.parse(localStorage.getItem("user")) || [];
  const accessUserPermission = userData?.role?.access_permissions;

  // Use the enhanced modules with notification badges
  const { modules, isLoading, error } = useEnhancedModules();

  // Filter modules based on user permissions (same logic as before)
  const getPermittedModules = () => {
    if (!modules) return [];

    return Object.values(modules)
      .map((MODULE) => {
        if (MODULE.children) {
          const permittedChildren = Object.values(MODULE.children).filter(
            (CHILD) => accessUserPermission?.includes(CHILD.name)
          );

          if (permittedChildren.length > 0) {
            return { ...MODULE, children: permittedChildren };
          }
        } else if (accessUserPermission?.includes(MODULE.name)) {
          return MODULE;
        }
        return null;
      })
      .filter(Boolean);
  };

  const PermittedModules = getPermittedModules();

  // Loading state
  if (isLoading) {
    return (
      <Drawer variant="permanent" anchor="left" className="sidebar-drawer">
        <Paper
          elevation={24}
          className={`mainbox ${open ? "open" : "closed"}`}
          style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
          {/* Logo section */}
          {open ? (
            <div className="logo-container">
              <img src={icon} alt="Icon" className="sidebar__logo2" />
              <img src={logo} alt="Logo" className="sidebar__logo" />
            </div>
          ) : (
            <img src={icon} alt="Logo" className="sidebar__logo2" />
          )}

          {/* Loading spinner */}
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

          {/* Footer */}
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

  // Error state - fallback to modules without badges
  if (error) {
    console.error("Error loading dashboard data for notifications:", error);
    // The component will still work, just without notification badges
  }

  return (
    <Drawer variant="permanent" anchor="left" className="sidebar-drawer">
      <Paper
        elevation={24}
        className={`mainbox ${open ? "open" : "closed"}`}
        style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
        {/* Logo section */}
        {open ? (
          <div className="logo-container">
            <img src={icon} alt="Icon" className="sidebar__logo2" />
            <img src={logo} alt="Logo" className="sidebar__logo" />
          </div>
        ) : (
          <img src={icon} alt="Logo" className="sidebar__logo2" />
        )}

        {/* Navigation items with notification badges */}
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

        {/* Footer */}
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
};

export default Sidebar;
