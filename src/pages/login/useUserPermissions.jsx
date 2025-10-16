import { useEffect, useState } from "react";

export const useUserPermissions = () => {
  const [permissions, setPermissions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedRole = localStorage.getItem("userRole");
    if (storedRole) {
      try {
        const roleData = JSON.parse(storedRole);
        setPermissions(roleData.accessPermissions || []);
      } catch (error) {
        console.error("Error parsing user role:", error);
        setPermissions([]);
      }
    }
    setIsLoading(false);
  }, []);

  const hasPermission = (permission) => {
    return permissions.includes(permission);
  };

  const hasAnyPermission = (permissionList) => {
    return permissionList.some((permission) =>
      permissions.includes(permission)
    );
  };

  const hasAllPermissions = (permissionList) => {
    return permissionList.every((permission) =>
      permissions.includes(permission)
    );
  };

  return {
    permissions,
    isLoading,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
  };
};

export default useUserPermissions;
