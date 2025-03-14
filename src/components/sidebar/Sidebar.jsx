import React from "react";
import { Box, Drawer, Paper } from "@mui/material";
import logo from "../../assets/sedar.png";
import icon from "../../assets/logo2.png";
import businessLogo from "../../assets/business.png";
import "../../components/sidebar/styles/Sidebar.scss";
import { MODULES } from "../../config/index";
import { MainItem } from "./components/MainItem";

const Sidebar = ({ open }) => {
  return (
    <Drawer variant="permanent" anchor="left" className="sidebar-drawer">
      <Paper
        elevation={24}
        className={`mainbox ${open ? "open" : "closed"}`}
        style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
        {open ? (
          <img src={logo} alt="Logo" className="sidebar__logo" />
        ) : (
          <img src={icon} alt="Logo" className="sidebar__logo2" />
        )}

        <Box
          className="sidebar-content"
          style={{ flexGrow: 1, overflowY: "auto" }}>
          {Object.values(MODULES).map((item, index) => (
            <div className="main-item-wrapper" key={index}>
              <MainItem
                name={item.name}
                subItem={item.children}
                path={item.path}
                icon={item.icon}
                sidebarOpen={open}
              />
            </div>
          ))}
        </Box>

        <Box
          className="sidebar_footer"
          style={{ textAlign: "center", padding: "10px 0" }}>
          <img
            src={businessLogo}
            alt="Business Logo"
            className="footer__logo"
          />
          {open && <span>Powered by MIS All rights reserved</span>}
          {open && <span>Copyright © 2025</span>}
        </Box>
      </Paper>
    </Drawer>
  );
};

export default Sidebar;
