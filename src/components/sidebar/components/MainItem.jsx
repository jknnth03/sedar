import { Box, Collapse, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import PropTypes from "prop-types";
import NotificationBadge from "../../../config/NotificationBadge";

const MenuItem = ({
  name = "",
  path = "",
  icon = null,
  active = false,
  isChild = false,
  onClick = () => {},
  className = "",
  sidebarOpen = false,
  notificationCount = 0,
}) => {
  const renderContent = () => {
    if (sidebarOpen) {
      // When sidebar is open, show badge next to text
      return (
        <NotificationBadge
          count={notificationCount}
          position="text"
          text={name}>
          <Box className={`icon ${active ? "active-icon" : ""}`}>
            {icon || <span className="sidebar__placeholder-icon">📄</span>}
          </Box>
        </NotificationBadge>
      );
    } else {
      // When sidebar is closed, show badge on icon
      return (
        <Box className={`icon ${active ? "active-icon" : ""}`}>
          <NotificationBadge count={notificationCount} position="icon">
            {icon || <span className="sidebar__placeholder-icon">📄</span>}
          </NotificationBadge>
        </Box>
      );
    }
  };

  // If sidebar is open but we want to preserve original typography
  if (sidebarOpen) {
    return (
      <Box
        className={`liststyle ${className} ${active ? "active" : ""}`}
        onClick={onClick}
        style={{
          cursor: "pointer",
          paddingLeft: isChild ? "32px" : "16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          width: "100%",
        }}>
        <Box style={{ display: "flex", alignItems: "center" }}>
          <Box className={`icon ${active ? "active-icon" : ""}`}>
            {icon || <span className="sidebar__placeholder-icon">📄</span>}
          </Box>
          <Typography className="text">{name}</Typography>
        </Box>
        {notificationCount > 0 && (
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
              {notificationCount > 99 ? "99+" : notificationCount}
            </Box>
          </Box>
        )}
      </Box>
    );
  }

  // When sidebar is closed, show badge on icon
  return (
    <Box
      className={`liststyle ${className} ${active ? "active" : ""}`}
      onClick={onClick}
      style={{
        cursor: "pointer",
        paddingLeft: isChild ? "32px" : "16px",
      }}>
      <Box className={`icon ${active ? "active-icon" : ""}`}>
        <NotificationBadge count={notificationCount} position="icon">
          {icon || <span className="sidebar__placeholder-icon">📄</span>}
        </NotificationBadge>
      </Box>
    </Box>
  );
};

MenuItem.propTypes = {
  name: PropTypes.string,
  path: PropTypes.string,
  icon: PropTypes.node,
  active: PropTypes.bool,
  isChild: PropTypes.bool,
  onClick: PropTypes.func,
  className: PropTypes.string,
  sidebarOpen: PropTypes.bool,
  notificationCount: PropTypes.number,
};

export const MainItem = ({
  name = "",
  subItem = null,
  path = "",
  icon = null,
  sidebarOpen = false,
  notificationCount = 0,
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  const [openChildren, setOpenChildren] = useState(false);
  const [isParentActive, setIsParentActive] = useState(false);

  useEffect(() => {
    if (subItem) {
      const anyChildActive = Object.values(subItem).some((item) =>
        location.pathname.startsWith(`/${item.path}`)
      );
      setOpenChildren(anyChildActive);
      setIsParentActive(anyChildActive);
    } else {
      const parentIsActive =
        location.pathname === path || location.pathname.startsWith(`${path}/`);

      setIsParentActive(parentIsActive);
    }
  }, [location.pathname, subItem, path]);

  const handleNavigation = (targetPath) => {
    navigate(targetPath);
  };

  const handleChildren = () => {
    if (subItem) {
      setOpenChildren((prev) => !prev);
    } else {
      handleNavigation(path);
    }
  };

  return (
    <>
      <MenuItem
        name={name}
        path={path}
        icon={icon}
        active={isParentActive}
        onClick={handleChildren}
        className="main-item"
        sidebarOpen={sidebarOpen}
        notificationCount={notificationCount}
      />
      {subItem && sidebarOpen && (
        <Collapse in={openChildren}>
          {Object.values(subItem).map(
            ({ name, path, icon, notificationCount = 0 }, subIndex) => {
              const isSubItemActive = location.pathname.startsWith(`/${path}`);

              return (
                <MenuItem
                  key={subIndex}
                  name={name}
                  path={path}
                  icon={icon}
                  active={isSubItemActive}
                  isChild={true}
                  onClick={() => handleNavigation(path)}
                  className="sub-item"
                  sidebarOpen={sidebarOpen}
                  notificationCount={notificationCount}
                />
              );
            }
          )}
        </Collapse>
      )}
    </>
  );
};

MainItem.propTypes = {
  name: PropTypes.string,
  subItem: PropTypes.object,
  path: PropTypes.string,
  icon: PropTypes.node,
  sidebarOpen: PropTypes.bool,
  notificationCount: PropTypes.number,
};
