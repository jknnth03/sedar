import React from "react";
import Layout from "./layout/Layout";
import { Outlet } from "react-router";

const PrivateRoutes = () => {
  return (
    <div>
      <Layout>
        <Outlet />
      </Layout>
    </div>
  );
};

export default PrivateRoutes;
