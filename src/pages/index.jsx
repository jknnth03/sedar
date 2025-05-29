// import React from "react";
// import Layout from "./layout/Layout";
// import { Outlet, Navigate, useMatches } from "react-router";
// import { CONSTANT } from "../config";

// const PrivateRoutes = () => {
//   const token = localStorage.getItem("token");
//   // const userData = JSON.parse(localStorage.getItem("user")) || [];
//   // const matches = useMatches();
//   // const currentMatch = matches?.at(-1);
//   // const requiredPermission = currentMatch?.handle?.permission;
//   // const userPermission = userData?.role?.access_permissions?.map(
//   //   (item) => item
//   // );

//   if (!token) {
//     return <Navigate to={CONSTANT.PAGES.LOGIN.path} replace />;
//   }

//   // if (requiredPermission && !userPermission.includes(requiredPermission)) {
//   //   return <Navigate to="/unauthorized" replace />;
//   // }

//   return (
//     <Layout>
//       <Outlet />
//     </Layout>
//   );
// };

// export default PrivateRoutes;

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
