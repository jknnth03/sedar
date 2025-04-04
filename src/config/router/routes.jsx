import { CONSTANT } from "..";
import { MODULES } from "..";
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
import Departments from "../../pages/masterlist/department/departments.jsx";
import Titles from "../../pages/extras/Titles.jsx";
import Schedules from "../../pages/extras/Schedules.jsx";
import Teams from "../../pages/extras/Teams.jsx";
import Attainments from "../../pages/extras/Attainments.jsx";
import Banks from "../../pages/extras/Banks.jsx";
import Barangays from "../../pages/extras/Barangays.jsx";
import Cabinets from "../../pages/extras/Cabinets.jsx";
import Degrees from "../../pages/extras/Degrees.jsx";
import FileTypes from "../../pages/extras/FileTypes.jsx";
import HonorTitles from "../../pages/extras/HonorTitles.jsx";
import Municipalites from "../../pages/extras/Municipalities.jsx";
import Objectives from "../../pages/extras/Objectives.jsx";
import Prefixes from "../../pages/extras/Prefixes.jsx";
import Programs from "../../pages/extras/Programs.jsx";
import Provinces from "../../pages/extras/Provinces.jsx";
import Regions from "../../pages/extras/Regions.jsx";
import Tools from "../../pages/extras/Tools.jsx";
import Religions from "../../pages/extras/Religions.jsx";
import Roles from "../../pages/usermanagement/Roles.jsx";
import User from "../../pages/usermanagement/User.jsx";
import Unauthorized from "../../pages/Unauthorized.jsx";

export const ROUTES = [
  {
    id: CONSTANT.PAGES.UNAUTHORIZED.name,
    path: CONSTANT.PAGES.UNAUTHORIZED.path,
    element: <Unauthorized />,
  },
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
        id: CONSTANT.PAGES.USERMANAGEMENT.children.USER.name,
        path: CONSTANT.PAGES.USERMANAGEMENT.children.USER.path,
        element: <User />,
        handle: {
          permission: CONSTANT.PAGES.USERMANAGEMENT.children.USER.name,
        },
      },
      {
        id: CONSTANT.PAGES.USERMANAGEMENT.children.ROLES.name,
        path: CONSTANT.PAGES.USERMANAGEMENT.children.ROLES.path,
        element: <Roles />,
        handle: {
          permission: CONSTANT.PAGES.USERMANAGEMENT.children.ROLES.name,
        },
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
        handle: {
          permission: CONSTANT.PAGES.MASTERLIST.children.COMPANIES.name,
        },
      },
      {
        id: CONSTANT.PAGES.MASTERLIST.children.LOCATION.name,
        path: CONSTANT.PAGES.MASTERLIST.children.LOCATION.path,
        element: <Location />,
        handle: {
          permission: CONSTANT.PAGES.MASTERLIST.children.LOCATION.name,
        },
      },
      {
        id: CONSTANT.PAGES.MASTERLIST.children.BUSINESS_UNIT.name,
        path: CONSTANT.PAGES.MASTERLIST.children.BUSINESS_UNIT.path,
        element: <BusinessUnit />,
        handle: {
          permission: CONSTANT.PAGES.MASTERLIST.children.BUSINESS_UNIT.name,
        },
      },
      {
        id: CONSTANT.PAGES.MASTERLIST.children.DEPARTMENTS.name,
        path: CONSTANT.PAGES.MASTERLIST.children.DEPARTMENTS.path,
        element: <Departments />,
        handle: {
          permission: CONSTANT.PAGES.MASTERLIST.children.DEPARTMENTS.name,
        },
      },
      {
        id: CONSTANT.PAGES.MASTERLIST.children.POSITIONS.name,
        path: CONSTANT.PAGES.MASTERLIST.children.POSITIONS.path,
        element: <Positions />,
        handle: {
          permission: CONSTANT.PAGES.MASTERLIST.children.POSITIONS.name,
        },
      },
      {
        id: CONSTANT.PAGES.MASTERLIST.children.SUB_UNITS.name,
        path: CONSTANT.PAGES.MASTERLIST.children.SUB_UNITS.path,
        element: <Subunit />,
        handle: {
          permission: CONSTANT.PAGES.MASTERLIST.children.SUB_UNITS.name,
        },
      },
      {
        id: CONSTANT.PAGES.MASTERLIST.children.UNITS.name,
        path: CONSTANT.PAGES.MASTERLIST.children.UNITS.path,
        element: <Units />,
        handle: {
          permission: CONSTANT.PAGES.MASTERLIST.children.UNITS.name,
        },
      },
      {
        id: CONSTANT.PAGES.EXTRAS.children.TITLES.name,
        path: CONSTANT.PAGES.EXTRAS.children.TITLES.path,
        element: <Titles />,
        handle: {
          permission: CONSTANT.PAGES.EXTRAS.children.TITLES.name,
        },
      },
      {
        id: CONSTANT.PAGES.EXTRAS.children.TEAMS.name,
        path: CONSTANT.PAGES.EXTRAS.children.TEAMS.path,
        element: <Teams />,
        handle: {
          permission: CONSTANT.PAGES.EXTRAS.children.TEAMS.name,
        },
      },
      {
        id: CONSTANT.PAGES.EXTRAS.children.RELIGIONS.name,
        path: CONSTANT.PAGES.EXTRAS.children.RELIGIONS.path,
        element: <Religions />,
        handle: {
          permission: CONSTANT.PAGES.EXTRAS.children.RELIGIONS.name,
        },
      },
      {
        id: CONSTANT.PAGES.EXTRAS.children.ATTAINMENTS.name,
        path: CONSTANT.PAGES.EXTRAS.children.ATTAINMENTS.path,
        element: <Attainments />,
        handle: {
          permission: CONSTANT.PAGES.EXTRAS.children.ATTAINMENTS.name,
        },
      },
      {
        id: CONSTANT.PAGES.EXTRAS.children.BANKS.name,
        path: CONSTANT.PAGES.EXTRAS.children.BANKS.path,
        element: <Banks />,
        handle: {
          permission: CONSTANT.PAGES.EXTRAS.children.BANKS.name,
        },
      },
      {
        id: CONSTANT.PAGES.EXTRAS.children.BARANGAYS.name,
        path: CONSTANT.PAGES.EXTRAS.children.BARANGAYS.path,
        element: <Barangays />,
        handle: {
          permission: CONSTANT.PAGES.EXTRAS.children.BARANGAYS.name,
        },
      },
      {
        id: CONSTANT.PAGES.EXTRAS.children.CABINETS.name,
        path: CONSTANT.PAGES.EXTRAS.children.CABINETS.path,
        element: <Cabinets />,
        handle: {
          permission: CONSTANT.PAGES.EXTRAS.children.CABINETS.name,
        },
      },
      {
        id: CONSTANT.PAGES.EXTRAS.children.DEGREES.name,
        path: CONSTANT.PAGES.EXTRAS.children.DEGREES.path,
        element: <Degrees />,
        handle: {
          permission: CONSTANT.PAGES.EXTRAS.children.DEGREES.name,
        },
      },
      {
        id: CONSTANT.PAGES.EXTRAS.children.FILETYPES.name,
        path: CONSTANT.PAGES.EXTRAS.children.FILETYPES.path,
        element: <FileTypes />,
        handle: {
          permission: CONSTANT.PAGES.EXTRAS.children.FILETYPES.name,
        },
      },
      {
        id: CONSTANT.PAGES.EXTRAS.children.HONORTITLES.name,
        path: CONSTANT.PAGES.EXTRAS.children.HONORTITLES.path,
        element: <HonorTitles />,
        handle: {
          permission: CONSTANT.PAGES.EXTRAS.children.HONORTITLES.name,
        },
      },
      {
        id: CONSTANT.PAGES.EXTRAS.children.MUNICIPALITIES.name,
        path: CONSTANT.PAGES.EXTRAS.children.MUNICIPALITIES.path,
        element: <Municipalites />,
        handle: {
          permission: CONSTANT.PAGES.EXTRAS.children.MUNICIPALITIES.name,
        },
      },
      {
        id: CONSTANT.PAGES.EXTRAS.children.OBJECTIVES.name,
        path: CONSTANT.PAGES.EXTRAS.children.OBJECTIVES.path,
        element: <Objectives />,
        handle: {
          permission: CONSTANT.PAGES.EXTRAS.children.OBJECTIVES.name,
        },
      },
      {
        id: CONSTANT.PAGES.EXTRAS.children.PREFIXES.name,
        path: CONSTANT.PAGES.EXTRAS.children.PREFIXES.path,
        element: <Prefixes />,
        handle: {
          permission: CONSTANT.PAGES.EXTRAS.children.PREFIXES.name,
        },
      },
      {
        id: CONSTANT.PAGES.EXTRAS.children.PROGRAMS.name,
        path: CONSTANT.PAGES.EXTRAS.children.PROGRAMS.path,
        element: <Programs />,
        handle: {
          permission: CONSTANT.PAGES.EXTRAS.children.PROGRAMS.name,
        },
      },
      {
        id: CONSTANT.PAGES.EXTRAS.children.PROVINCES.name,
        path: CONSTANT.PAGES.EXTRAS.children.PROVINCES.path,
        element: <Provinces />,
        handle: {
          permission: CONSTANT.PAGES.EXTRAS.children.PROVINCES.name,
        },
      },
      {
        id: CONSTANT.PAGES.EXTRAS.children.REGIONS.name,
        path: CONSTANT.PAGES.EXTRAS.children.REGIONS.path,
        element: <Regions />,
        handle: {
          permission: CONSTANT.PAGES.EXTRAS.children.REGIONS.name,
        },
      },
      {
        id: CONSTANT.PAGES.EXTRAS.children.SCHEDULES.name,
        path: CONSTANT.PAGES.EXTRAS.children.SCHEDULES.path,
        element: <Schedules />,
        handle: {
          permission: CONSTANT.PAGES.EXTRAS.children.SCHEDULES.name,
        },
      },
      {
        id: CONSTANT.PAGES.EXTRAS.children.TOOLS.name,
        path: CONSTANT.PAGES.EXTRAS.children.TOOLS.path,
        element: <Tools />,
        handle: {
          permission: CONSTANT.PAGES.EXTRAS.children.TOOLS.name,
        },
      },
    ],
  },
];
