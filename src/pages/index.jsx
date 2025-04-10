import React, { Children } from "react";
import Layout from "./layout/Layout";
import { Outlet, Navigate, useMatches, useLocation, Route } from "react-router";
import { CONSTANT } from "../config";
import { ROUTES } from "../config/router/routes";

const PrivateRoutes = () => {
  const token = localStorage.getItem("token");
  const userData = JSON.parse(localStorage.getItem("user")) || [];
  const matches = useMatches();
  const location = useLocation();
  const currentMatch = matches?.at(-1);
  const requiredPermission = currentMatch?.handle?.permission;
  const userPermission = userData?.role?.access_permissions?.map(
    (item) => item
  );

  console.log("Current Route:", location.pathname);
  console.log("Required Permission:", requiredPermission);
  console.log("matches", matches);
  console.log("userData", userData);
  console.log(userPermission);

  if (!token) {
    return <Navigate to={CONSTANT.PAGES.LOGIN.path} replace />;
  }

  if (requiredPermission && !userPermission.includes(requiredPermission)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return (
    <Layout>
      <Outlet />
    </Layout>
  );
};

export default PrivateRoutes;
