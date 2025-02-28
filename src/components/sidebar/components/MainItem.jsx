import { Box, Collapse, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router";

const MenuItem = ({
  onClick,
  name,
  path,
  icon,
  active,
  isChild,
  className,
}) => {
  return (
    <Box
      key={name}
      className={`liststyle ${className} ${active ? "active" : ""}`}
      onClick={onClick}
      style={{ cursor: "pointer", paddingLeft: isChild ? "32px" : "16px" }}>
      <Box className={`icon ${active ? "active-icon" : ""}`}>
        {icon || <span className="sidebar__placeholder-icon">📄</span>}
      </Box>
      <Typography className={`text`}>{name}</Typography>
    </Box>
  );
};

export const MainItem = ({ name, subItem, path, icon, active, className }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const [openChildren, setOpenChildren] = useState(false);
  const [isParentActive, setIsParentActive] = useState(false);

  useEffect(() => {
    if (subItem) {
      const anyChildActive = Object.values(subItem).some(
        (item) => location.pathname === `/${item.path}`
      );
      setOpenChildren(anyChildActive);
      setIsParentActive(anyChildActive);
    } else {
      const parentIsActive =
        location.pathname.split("/")[1] === path.split("/")[1];
      setIsParentActive(parentIsActive);
    }
  }, [location.pathname, subItem, path]);

  const handleNavigation = (path) => {
    navigate(`../${path}`);
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
        subItem={subItem}
        path={path}
        icon={icon}
        active={isParentActive}
        onClick={handleChildren}
        className={`main-item ${isParentActive ? "active" : ""}`}
      />
      {subItem && (
        <Collapse in={openChildren}>
          {Object.values(subItem).map((subItem, subindex) => {
            const isSubItemActive = location.pathname === `/${subItem.path}`;
            return (
              <MenuItem
                key={subindex}
                name={subItem.name}
                subItem={subItem.subItem}
                path={subItem.path}
                icon={subItem.icon}
                active={isSubItemActive}
                isChild={true}
                onClick={() => handleNavigation(`${subItem.path}`)}
                className={`sub-item ${isSubItemActive ? "active" : ""}`}
              />
            );
          })}
        </Collapse>
      )}
    </>
  );
};
