import { CONSTANT } from "..";
import { MODULES } from "..";
import * as React from "react";
import PrivateRoutes from "../../pages/index.jsx";
import Login from "../../pages/login/Login";
import Dashboard from "../../pages/dashboard/Dashboard";
import Location from "../../pages/masterlist/location/Location";
import Employees from "../../pages/employees/Employees.jsx";
import BusinessUnit from "../../pages/masterlist/business-unit/business-unit.jsx";
import Subunit from "../../pages/masterlist/sub-units/sub-units.jsx";
import Positions from "../../pages/masterlist/positions/positions.jsx";
import Units from "../../pages/masterlist/units/units.jsx";
import Companies from "../../pages/masterlist/companies/Companies.jsx";
import Departments from "../../pages/masterlist/coa/department/departments.jsx";
import Titles from "../../pages/extras/Titles.jsx";

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
        id: MODULES.EMPLOYEES.name,
        path: MODULES.EMPLOYEES.path,
        element: <Employees />,
      },
      {
        id: CONSTANT.PAGES.MASTERLIST.children.COMPANIES.name,
        path: CONSTANT.PAGES.MASTERLIST.children.COMPANIES.path,
        element: <Companies />,
      },
      {
        id: CONSTANT.PAGES.MASTERLIST.children.LOCATION.name,
        path: CONSTANT.PAGES.MASTERLIST.children.LOCATION.path,
        element: <Location />,
      },
      {
        id: CONSTANT.PAGES.MASTERLIST.children.BUSINESS_UNIT.name,
        path: CONSTANT.PAGES.MASTERLIST.children.BUSINESS_UNIT.path,
        element: <BusinessUnit />,
      },
      {
        id: CONSTANT.PAGES.MASTERLIST.children.DEPARTMENTS.name,
        path: CONSTANT.PAGES.MASTERLIST.children.DEPARTMENTS.path,
        element: <Departments />,
      },
      {
        id: CONSTANT.PAGES.MASTERLIST.children.POSITIONS.name,
        path: CONSTANT.PAGES.MASTERLIST.children.POSITIONS.path,
        element: <Positions />,
      },
      {
        id: CONSTANT.PAGES.MASTERLIST.children.SUB_UNITS.name,
        path: CONSTANT.PAGES.MASTERLIST.children.SUB_UNITS.path,
        element: <Subunit />,
      },
      {
        id: CONSTANT.PAGES.MASTERLIST.children.UNITS.name,
        path: CONSTANT.PAGES.MASTERLIST.children.UNITS.path,
        element: <Units />,
      },
      {
        id: CONSTANT.PAGES.EXTRAS.children.TITLES.name,
        path: CONSTANT.PAGES.EXTRAS.children.TITLES.path,
        element: <Titles />,
      },
    ],
  },
];
