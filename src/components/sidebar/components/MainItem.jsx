import { Box, Collapse, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import PropTypes from "prop-types";

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
  return (
    <Box
      className={`liststyle ${className} ${active ? "active" : ""}`}
      onClick={onClick}
      sx={{
        cursor: "pointer",
        paddingLeft: isChild ? "32px" : "0px",
        paddingRight: "0px",
        display: "flex",
        alignItems: "center",
        justifyContent: sidebarOpen ? "flex-start" : "center",
        width: "100%",
      }}>
      <Box
        className="icon-container"
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          position: "relative",
        }}>
        <Box className={`icon ${active ? "active-icon" : ""}`}>
          {icon || <span className="sidebar__placeholder-icon">📄</span>}
        </Box>
        {!sidebarOpen && notificationCount > 0 && (
          <Box
            sx={{
              position: "absolute",
              top: "-2px",
              right: "-2px",
              backgroundColor: "#ff5252",
              width: "8px",
              height: "8px",
              borderRadius: "50%",
            }}
          />
        )}
      </Box>

      {sidebarOpen && (
        <Box
          className="label-container"
          sx={{
            display: "flex",
            alignItems: "center",
            flex: 1,
            minWidth: 0,
            overflow: "hidden",
            paddingRight: "16px",
          }}>
          <Typography
            className="text"
            sx={{
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              flex: 1,
              minWidth: 0,
              marginRight: "4px",
            }}>
            {name}
          </Typography>
          {notificationCount > 0 && (
            <Box sx={{ flexShrink: 0, marginLeft: "auto", marginRight: "4px" }}>
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
      )}
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
  onParentClick = () => {},
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
      onParentClick();
      if (sidebarOpen) {
        setOpenChildren((prev) => !prev);
      } else {
        setOpenChildren(true);
      }
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
  onParentClick: PropTypes.func,
};
