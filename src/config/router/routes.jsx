import { CONSTANT } from "..";
import { MODULES } from "..";
import PrivateRoutes from "../../pages";
import Login from "../../pages/login/Login";
import Dashboard from "../../pages/dashboard/Dashboard";
import Location from "../../pages/masterlist/location/Location";
export const ROUTES = [
  {
    path: CONSTANT.PAGES.LOGIN.path,
    element: <Login />,
    id: CONSTANT.PAGES.LOGIN.name,
  },
  {
    element: <PrivateRoutes />,
    children: [
      {
        id: MODULES.DASHBOARD.name,
        path: MODULES.DASHBOARD.path,
        element: <Dashboard />,
      },
      {
        id: CONSTANT.PAGES.MASTERLIST.children.LOCATION.name,
        path: CONSTANT.PAGES.MASTERLIST.children.LOCATION.path,
        element: <Location />,
      },
    ],
  },
];
