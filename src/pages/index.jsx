import React, { Children } from "react";
import Layout from "./layout/Layout";
import { Outlet, Navigate, useMatches, useLocation, Route } from "react-router";
import { CONSTANT } from "../config";
import { ROUTES } from "../config/router/routes";

const PrivateRoutes = () => {
  const token = localStorage.getItem("token");
  const userPermissions = JSON.parse(localStorage.getItem("permissions")) || [];
  const matches = useMatches();
  const location = useLocation();
  const currentMatch = matches?.at(-1);
  const requiredPermission = currentMatch?.handle?.permission;

  console.log("Current Route:", location.pathname);
  console.log("Required Permission:", requiredPermission);
  console.log("User Permissions:", userPermissions);
  console.log("matches", matches);

  if (!token) {
    return <Navigate to={CONSTANT.PAGES.LOGIN.path} replace />;
  }

  // if (requiredPermission && !userPermissions.includes(requiredPermission)) {
  //   return <Navigate to="/unauthorized" replace />;
  // }

  return (
    <Layout>
      <Outlet />
    </Layout>
  );
};

export default PrivateRoutes;
