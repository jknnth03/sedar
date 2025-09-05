import React from "react";
import { Box, Typography } from "@mui/material";

const Unauthorized = () => {
  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="100vh">
      <Typography variant="h4" color="error">
        403 - Unauthorized Access
      </Typography>
    </Box>
  );
};

export default Unauthorized;
