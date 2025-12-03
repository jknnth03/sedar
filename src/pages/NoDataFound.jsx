import React from "react";
import { Box, Typography, useTheme, useMediaQuery } from "@mui/material";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import NoDataFoundImage from "../assets/NoDataFound.jpg";

const NoDataFound = ({
  message = "No data found",
  subMessage = "",
  useIcon = false,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));

  const getResponsiveIconSize = () => {
    if (isMobile) return 60;
    if (isTablet) return 80;
    return 100;
  };

  const getResponsiveImageSize = () => {
    if (isMobile) return { width: "180px", height: "180px" };
    if (isTablet) return { width: "220px", height: "220px" };
    return { width: "280px", height: "280px" };
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: { xs: 2, sm: 3, md: 4 },
        minHeight: { xs: "200px", sm: "250px", md: "300px" },
        width: "100%",
      }}>
      {!useIcon ? (
        <Box
          component="img"
          src={NoDataFoundImage}
          alt="No data found"
          sx={{
            width: getResponsiveImageSize().width,
            height: getResponsiveImageSize().height,
            objectFit: "contain",
            marginBottom: { xs: 1, sm: 1.5, md: 2.5 },
            opacity: 0.85,
            maxWidth: "100%",
            maxHeight: "100%",
            filter: "brightness(1.05) contrast(1.1)",
            mixBlendMode: "multiply",
          }}
          onError={(e) => {
            console.error("Failed to load NoDataFound image");
            e.target.style.display = "none";
            const fallbackIcon =
              e.target.parentElement?.querySelector(".fallback-icon");
            if (fallbackIcon) {
              fallbackIcon.style.display = "block";
            }
          }}
        />
      ) : (
        <ErrorOutlineIcon
          className="fallback-icon"
          sx={{
            fontSize: getResponsiveIconSize(),
            color: "#ccc",
            marginBottom: { xs: 1.5, sm: 2, md: 2.5 },
          }}
        />
      )}
      {!useIcon && (
        <ErrorOutlineIcon
          className="fallback-icon"
          sx={{
            display: "none",
            fontSize: getResponsiveIconSize(),
            color: "#ccc",
            marginBottom: { xs: 1.5, sm: 2, md: 2.5 },
          }}
        />
      )}
    </Box>
  );
};

export default NoDataFound;
