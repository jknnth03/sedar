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
  showDotOnly = false,
}) => {
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
            {showDotOnly ? (
              <Box
                sx={{
                  backgroundColor: "#ff5252",
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                }}
              />
            ) : (
              <Box
                sx={{
                  backgroundColor: "#ff5252",
                  color: "white",
                  fontSize: isChild ? "0.6rem" : "0.65rem",
                  height: isChild ? "16px" : "18px",
                  minWidth: isChild ? "16px" : "18px",
                  borderRadius: isChild ? "8px" : "9px",
                  fontWeight: "bold",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "0 4px",
                }}>
                {notificationCount > 99 ? "99+" : notificationCount}
              </Box>
            )}
          </Box>
        )}
      </Box>
    );
  }

  return (
    <Box
      className={`liststyle ${className} ${active ? "active" : ""}`}
      onClick={onClick}
      style={{
        cursor: "pointer",
        paddingLeft: isChild ? "32px" : "16px",
        position: "relative",
      }}>
      <Box className={`icon ${active ? "active-icon" : ""}`}>
        {icon || <span className="sidebar__placeholder-icon">📄</span>}
        {notificationCount > 0 && (
          <Box
            sx={{
              position: "absolute",
              top: "8px",
              right: "8px",
              backgroundColor: "#ff5252",
              width: isChild ? "6px" : "8px",
              height: isChild ? "6px" : "8px",
              borderRadius: "50%",
            }}
          />
        )}
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
  showDotOnly: PropTypes.bool,
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

  const hasChildNotifications = subItem
    ? Object.values(subItem).some((item) => (item.notificationCount || 0) > 0)
    : false;

  const totalChildNotifications = subItem
    ? Object.values(subItem).reduce(
        (sum, item) => sum + (item.notificationCount || 0),
        0
      )
    : 0;

  const displayNotificationCount = subItem
    ? hasChildNotifications
      ? 1
      : 0
    : notificationCount;

  const showDotOnly = subItem && hasChildNotifications;

  useEffect(() => {
    if (subItem) {
      const anyChildActive = Object.values(subItem).some((item) => {
        const fullChildPath = `${path}/${item.path}`;
        return (
          location.pathname === fullChildPath ||
          location.pathname.startsWith(`${fullChildPath}/`)
        );
      });
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
        notificationCount={displayNotificationCount}
        showDotOnly={showDotOnly}
      />
      {subItem && sidebarOpen && (
        <Collapse in={openChildren}>
          {Object.values(subItem).map(
            (
              { name, path: childPath, icon, notificationCount = 0 },
              subIndex
            ) => {
              const fullChildPath = `${path}/${childPath}`;
              const isSubItemActive =
                location.pathname === fullChildPath ||
                location.pathname.startsWith(`${fullChildPath}/`);

              return (
                <MenuItem
                  key={subIndex}
                  name={name}
                  path={fullChildPath}
                  icon={icon}
                  active={isSubItemActive}
                  isChild={true}
                  onClick={() => handleNavigation(fullChildPath)}
                  className="sub-item"
                  sidebarOpen={sidebarOpen}
                  notificationCount={notificationCount}
                  showDotOnly={false}
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
