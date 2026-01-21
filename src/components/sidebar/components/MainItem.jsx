import { Box, Collapse, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import PropTypes from "prop-types";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";

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
  level = 0,
  hasChildren = false,
  isExpanded = false,
}) => {
  let paddingLeft = "0px";

  if (level === 0) {
    paddingLeft = "8px";
  } else if (level === 1) {
    paddingLeft = "32px";
  } else {
    paddingLeft = `${32 + (level - 1) * 16}px`;
  }

  return (
    <Box
      className={`liststyle ${className} ${active ? "active" : ""}`}
      onClick={onClick}
      sx={{
        cursor: "pointer",
        paddingLeft: paddingLeft,
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
        {level >= 2 && (
          <Box
            sx={{
              width: "6px",
              height: "6px",
              borderRadius: "50%",
              backgroundColor: active
                ? "rgb(33, 61, 112)"
                : "rgba(33, 61, 112, 0.5)",
              marginRight: "8px",
              flexShrink: 0,
            }}
          />
        )}
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
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              width: "24px",
              justifyContent: "center",
              flexShrink: 0,
            }}>
            {hasChildren && sidebarOpen && (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  color: active ? "inherit" : "rgb(33, 61, 112)",
                }}>
                {isExpanded ? (
                  <KeyboardArrowUpIcon sx={{ fontSize: "20px" }} />
                ) : (
                  <KeyboardArrowDownIcon sx={{ fontSize: "20px" }} />
                )}
              </Box>
            )}
          </Box>
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
  level: PropTypes.number,
  hasChildren: PropTypes.bool,
  isExpanded: PropTypes.bool,
};

export const MainItem = ({
  name = "",
  subItem = null,
  path = "",
  icon = null,
  sidebarOpen = false,
  notificationCount = 0,
  onParentClick = () => {},
  level = 0,
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  const [openChildren, setOpenChildren] = useState(false);
  const [isParentActive, setIsParentActive] = useState(false);

  const checkChildrenActive = (children, basePath) => {
    if (!children) return false;

    return Object.values(children).some((item) => {
      const fullChildPath = `${basePath}/${item.path}`;
      const isActive =
        location.pathname === fullChildPath ||
        location.pathname.startsWith(`${fullChildPath}/`);

      if (item.children) {
        return isActive || checkChildrenActive(item.children, fullChildPath);
      }

      return isActive;
    });
  };

  const checkNestedNotifications = (children) => {
    if (!children) return false;

    return Object.values(children).some((item) => {
      const directNotif = (item.notificationCount || 0) > 0;
      const nestedNotif = item.children
        ? checkNestedNotifications(item.children)
        : false;
      return directNotif || nestedNotif;
    });
  };

  const hasChildNotifications = subItem
    ? checkNestedNotifications(subItem)
    : false;

  const displayNotificationCount = subItem
    ? hasChildNotifications
      ? 1
      : 0
    : notificationCount;

  const showDotOnly = subItem && hasChildNotifications;

  useEffect(() => {
    if (subItem) {
      const anyChildActive = checkChildrenActive(subItem, path);
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
        className={level === 0 ? "main-item" : "sub-item"}
        sidebarOpen={sidebarOpen}
        notificationCount={displayNotificationCount}
        showDotOnly={showDotOnly}
        level={level}
        isChild={level > 0}
        hasChildren={!!subItem}
        isExpanded={openChildren}
      />
      {subItem && sidebarOpen && (
        <Collapse in={openChildren}>
          {Object.values(subItem).map((item, subIndex) => {
            const fullChildPath = `${path}/${item.path}`;

            if (item.children) {
              return (
                <MainItem
                  key={subIndex}
                  name={item.name}
                  subItem={item.children}
                  path={fullChildPath}
                  icon={item.icon}
                  sidebarOpen={sidebarOpen}
                  notificationCount={item.notificationCount || 0}
                  onParentClick={onParentClick}
                  level={level + 1}
                />
              );
            }

            const isSubItemActive =
              location.pathname === fullChildPath ||
              location.pathname.startsWith(`${fullChildPath}/`);

            return (
              <MenuItem
                key={subIndex}
                name={item.name}
                path={fullChildPath}
                icon={item.icon}
                active={isSubItemActive}
                isChild={true}
                onClick={() => handleNavigation(fullChildPath)}
                className="sub-item"
                sidebarOpen={sidebarOpen}
                notificationCount={item.notificationCount || 0}
                showDotOnly={false}
                level={level + 1}
              />
            );
          })}
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
  level: PropTypes.number,
};
