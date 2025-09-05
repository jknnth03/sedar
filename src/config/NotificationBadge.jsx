import React from "react";
import { Badge, Box } from "@mui/material";

// Reusable Notification Badge Component
const NotificationBadge = ({
  count = 0,
  children,
  color = "error",
  max = 99,
  showZero = false,
  position = "icon", // "icon" or "text"
  text = "",
}) => {
  const shouldShowBadge = showZero ? count >= 0 : count > 0;

  if (position === "text") {
    // Badge positioned at the end of text
    return (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          width: "100%",
        }}>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          {children}
          <span
            style={{
              marginLeft: "10px",
              fontFamily: "inherit",
              fontSize: "inherit",
              fontWeight: "inherit",
              color: "inherit",
            }}>
            {text}
          </span>
        </Box>
        {shouldShowBadge && (
          <Box sx={{ marginRight: "8px" }}>
            <Box
              sx={{
                backgroundColor: "#ff5252",
                color: "white",
                fontSize: "0.65rem",
                height: "18px",
                minWidth: "18px",
                borderRadius: "9px",
                fontWeight: "bold",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "0 4px",
              }}>
              {count > max ? `${max}+` : count}
            </Box>
          </Box>
        )}
      </Box>
    );
  }

  // Original icon badge behavior
  return (
    <Badge
      badgeContent={shouldShowBadge ? count : null}
      color={color}
      max={max}
      sx={{
        "& .MuiBadge-badge": {
          backgroundColor: "#ff5252",
          color: "white",
          fontSize: "0.65rem",
          height: "16px",
          minWidth: "16px",
          borderRadius: "8px",
          right: 4,
          top: 4,
          fontWeight: "bold",
          zIndex: 1,
        },
      }}>
      {children}
    </Badge>
  );
};

export default NotificationBadge;
