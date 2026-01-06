import React, { useState } from "react";
import Sidebar from "../../components/sidebar/Sidebar";
import Appbar from "../../components/appbar/Appbar";
import { Box } from "@mui/material";
import "../layout/Layout.scss";

const Layout = ({ children }) => {
  const [open, setOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const handleCloseMobileSidebar = () => {
    setMobileSidebarOpen(false);
  };

  const handleToggleSidebar = () => {
    setOpen(!open);
  };

  return (
    <Box className="layout_color">
      <Box sx={{ zIndex: 1300 }}>
        <Sidebar
          open={open}
          mobileSidebarOpen={mobileSidebarOpen}
          onCloseMobile={handleCloseMobileSidebar}
          onToggleSidebar={handleToggleSidebar}
        />
      </Box>

      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          flex: 1,
          overflow: "hidden",
        }}>
        <Box sx={{ zIndex: 1000, position: "relative" }}>
          <Appbar
            open={open}
            setOpen={setOpen}
            isMobileSidebarOpen={mobileSidebarOpen}
            setMobileSidebarOpen={setMobileSidebarOpen}
          />
        </Box>

        <Box className="layout_content">{children}</Box>
      </Box>
    </Box>
  );
};

export default Layout;
