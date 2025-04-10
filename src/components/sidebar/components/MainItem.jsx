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
}) => {
  return (
    <Box
      className={`liststyle ${className} ${active ? "active" : ""}`}
      onClick={onClick}
      style={{
        cursor: "pointer",
        paddingLeft: isChild ? "32px" : "16px",
      }}>
      <Box className={`icon ${active ? "active-icon" : ""}`}>
        {icon || <span className="sidebar__placeholder-icon">📄</span>}
      </Box>
      {sidebarOpen && <Typography className="text">{name}</Typography>}
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
};

export const MainItem = ({
  name = "",
  subItem = null,
  path = "",
  icon = null,
  sidebarOpen = false,
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
      />
      {subItem && sidebarOpen && (
        <Collapse in={openChildren}>
          {Object.values(subItem).map(({ name, path, icon }, subIndex) => {
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
};
