import React from "react";
import Layout from "./layout/Layout";
import { Outlet, Navigate } from "react-router";
import { CONSTANT } from "../config";

const PrivateRoutes = () => {
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to={CONSTANT.PAGES.LOGIN.path} replace />;
  }

  return (
    <div>
      <Layout>
        <Outlet />
      </Layout>
    </div>
  );
};

export default PrivateRoutes;
