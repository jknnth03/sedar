import React from "react";
import { Box, Typography, Paper } from "@mui/material";
import { BorderColor as BorderColorIcon } from "@mui/icons-material";

const EnableEdit = () => {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "70vh",
        p: 3,
      }}>
      <Paper
        elevation={3}
        sx={{
          p: 4,
          textAlign: "center",
          maxWidth: 600,
          borderRadius: 2,
        }}>
        <BorderColorIcon
          sx={{
            fontSize: 80,
            color: "rgb(33, 61, 112)",
            mb: 2,
          }}
        />
        <Typography variant="h5" gutterBottom fontWeight={600}>
          Enable Edit Permission
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
          This permission controls the ability to edit employee information.
          When enabled in your role, the edit button will be accessible in the
          employee wizard form.
        </Typography>
      </Paper>
    </Box>
  );
};

export default EnableEdit;
