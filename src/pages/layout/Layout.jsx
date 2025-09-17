import React, { useState } from "react";
import Sidebar from "../../components/sidebar/Sidebar";
import Appbar from "../../components/appbar/Appbar";
import { Box } from "@mui/material";
import "../layout/Layout.scss";

const Layout = ({ children }) => {
  const [open, setOpen] = useState(true); // Desktop sidebar state
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false); // Mobile sidebar state

  // Handle closing mobile sidebar when clicking backdrop
  const handleCloseMobileSidebar = () => {
    setMobileSidebarOpen(false);
  };

  return (
    <Box className="layout_color">
      <Box sx={{ zIndex: 1300 }}>
        <Sidebar
          open={open}
          mobileSidebarOpen={mobileSidebarOpen}
          onCloseMobile={handleCloseMobileSidebar}
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
            open={open} // ← Added this missing prop
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
