import React, { useState } from "react";
import Sidebar from "../../components/sidebar/Sidebar";
import Appbar from "../../components/appbar/Appbar";
import { Box } from "@mui/material";
import "../layout/Layout.scss";

const Layout = ({ children }) => {
  const [open, setOpen] = useState(true);

  return (
    <Box className="layout_color">
      <Box sx={{ zIndex: 1300 }}>
        <Sidebar open={open} />
      </Box>

      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          flex: 1,
          overflow: "hidden",
        }}>
        <Box sx={{ zIndex: 1000, position: "relative" }}>
          <Appbar setOpen={setOpen} />
        </Box>

        <Box className="layout_content">{children}</Box>
      </Box>
    </Box>
  );
};

export default Layout;
