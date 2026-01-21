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
    if (isMobile) return { width: "220px", height: "220px" };
    if (isTablet) return { width: "280px", height: "280px" };
    return { width: "350px", height: "350px" };
  };

  const imageSize = getResponsiveImageSize();

  return (
    <Box
      sx={{
        position: "sticky",
        left: `calc(50% - (${imageSize.width} / 2))`,
        minHeight: imageSize.height,
        height: imageSize.height,
        width: imageSize.width,
      }}>
      {!useIcon ? (
        <Box
          component="img"
          src={NoDataFoundImage}
          alt="No data found"
          sx={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
            opacity: 0.85,
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
