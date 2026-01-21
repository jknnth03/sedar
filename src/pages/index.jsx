import React from "react";
import Layout from "./layout/Layout";
import { Outlet, Navigate, useLocation } from "react-router";
import { CONSTANT } from "../config";

const PrivateRoutes = () => {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));
  const location = useLocation();

  if (!token) {
    return <Navigate to={CONSTANT.PAGES.LOGIN.path} replace />;
  }

  if (user?.force_password_reset && location.pathname !== "/changepass") {
    return <Navigate to="/changepass" replace />;
  }

  return (
    <Layout>
      <Outlet />
    </Layout>
  );
};

export default PrivateRoutes;
