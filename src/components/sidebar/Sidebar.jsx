import React from "react";
import { Box, Drawer, Paper } from "@mui/material";
import logo from "../../assets/sedar.png";
import icon from "../../assets/logo2.png";
import "../../components/sidebar/styles/Sidebar.scss";
import { MODULES } from "../../config/index";
import { MainItem } from "./components/MainItem";

const Sidebar = ({ open }) => {
  return (
    <Drawer variant="permanent" anchor="left" className="sidebar-drawer">
      <Paper elevation={3} className={`mainbox ${open ? "open" : "closed"}`}>
        {open ? (
          <img src={logo} alt="Logo" className="sidebar__logo" />
        ) : (
          <img src={icon} alt="Logo" className="sidebar__logo2" />
        )}

        <Box>
          {Object.values(MODULES).map((item, index) => (
            <div className="main-item-wrapper" key={index}>
              <MainItem
                name={item.name}
                subItem={item.children}
                path={item.path}
                icon={item.icon}
                className="main-item"
              />
            </div>
          ))}
        </Box>
      </Paper>
    </Drawer>
  );
};

export default Sidebar;
