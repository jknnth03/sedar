import { CONSTANT } from "..";
import { MODULES } from "..";
import PrivateRoutes from "../../pages/index.jsx";
import Login from "../../pages/login/Login";
import Dashboard from "../../pages/dashboard/Dashboard";
import Location from "../../pages/masterlist/location/Location";
import BusinessUnit from "../../pages/masterlist/business-unit/business-unit.jsx";
import Subunit from "../../pages/masterlist/sub-units/sub-units.jsx";
import Positions from "../../pages/masterlist/positions/Positions.jsx";
import Units from "../../pages/masterlist/units/units.jsx";
import Companies from "../../pages/masterlist/companies/Companies.jsx";
import Departments from "../../pages/masterlist/department/departments.jsx";
import Titles from "../../pages/extras/Titles.jsx";
import Schedules from "../../pages/extras/Schedules.jsx";
import Teams from "../../pages/extras/Teams.jsx";
import Attainments from "../../pages/extras/Attainments.jsx";
import Banks from "../../pages/extras/Banks.jsx";
import Barangays from "../../pages/administrative/Barangays.jsx";
import Cabinets from "../../pages/extras/Cabinets.jsx";
import Degrees from "../../pages/extras/Degrees.jsx";
import FileTypes from "../../pages/extras/FileTypes.jsx";
import HonorTitles from "../../pages/extras/HonorTitles.jsx";
import Municipalities from "../../pages/administrative/Municipalities.jsx";
import SubMunicipalities from "../../pages/administrative/SubMunicipalities.jsx";
import Objectives from "../../pages/extras/Objectives.jsx";
import Prefixes from "../../pages/extras/Prefixes.jsx";
import Programs from "../../pages/extras/Programs.jsx";
import Provinces from "../../pages/administrative/Provinces.jsx";
import Regions from "../../pages/administrative/Regions.jsx";
import Tools from "../../pages/extras/Tools.jsx";
import Religions from "../../pages/extras/Religions.jsx";
import Roles from "../../pages/usermanagement/Roles.jsx";
import User from "../../pages/usermanagement/User.jsx";
import Unauthorized from "../../pages/Unauthorized.jsx";
import Changepass from "../../pages/login/Changepass.jsx";
import Jobbands from "../../pages/masterlist/job-bands/Jobbands.Jsx";
import Joblevels from "../../pages/masterlist/job-levels/JobLevels.jsx";
import Jobrates from "../../pages/masterlist/job-rates/JobRates.jsx";
import RequisitionTypes from "../../pages/extras/RequisitionTypes.jsx";
import GeneralInformation from "../../pages/employees/Generalinformation.jsx";
import Address from "../../pages/employees/Address.jsx";
import PositionsEmp from "../../pages/employees/Positionsemp.jsx";
import EMPLOYMENT_TYPES from "../../pages/employees/EmpTypes.jsx";
import STATUSES from "../../pages/employees/Statuses.jsx";
import CONTACTS from "../../pages/employees/Contacts.jsx";
import ATTAINMENTSEMP from "../../pages/employees/Attainmentsemp.jsx";
import ACCOUNTS from "../../pages/employees/Accounts.jsx";
import FILES from "../../pages/employees/Files.jsx";
import EMPLOYEEINFORMATION from "../../pages/employees/EmployeeInformation.jsx";

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
    path: CONSTANT.PAGES.CHANGEPASS.path,
    element: <Changepass />,
    id: CONSTANT.PAGES.CHANGEPASS.name,
  },
  {
    element: <PrivateRoutes />,
    children: [
      {
        id: MODULES.DASHBOARD.name,
        path: MODULES.DASHBOARD.path,
        element: <Dashboard />,
        handle: {
          permission: MODULES.DASHBOARD.name,
        },
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
        id: CONSTANT.PAGES.MASTERLIST.children.JOBBANDS.name,
        path: CONSTANT.PAGES.MASTERLIST.children.JOBBANDS.path,
        element: <Jobbands />,
        handle: {
          permission: CONSTANT.PAGES.MASTERLIST.children.JOBBANDS.name,
        },
      },
      {
        id: CONSTANT.PAGES.MASTERLIST.children.JOBLEVELS.name,
        path: CONSTANT.PAGES.MASTERLIST.children.JOBLEVELS.path,
        element: <Joblevels />,
        handle: {
          permission: CONSTANT.PAGES.MASTERLIST.children.JOBLEVELS.name,
        },
      },
      {
        id: CONSTANT.PAGES.MASTERLIST.children.JOBRATES.name,
        path: CONSTANT.PAGES.MASTERLIST.children.JOBRATES.path,
        element: <Jobrates />,
        handle: {
          permission: CONSTANT.PAGES.MASTERLIST.children.JOBRATES.name,
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
        id: CONSTANT.PAGES.ADMINISTRATIVEDIVISION.children.BARANGAYS.name,
        path: CONSTANT.PAGES.ADMINISTRATIVEDIVISION.children.BARANGAYS.path,
        element: <Barangays />,
        handle: {
          permission:
            CONSTANT.PAGES.ADMINISTRATIVEDIVISION.children.BARANGAYS.name,
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
        id: CONSTANT.PAGES.ADMINISTRATIVEDIVISION.children.MUNICIPALITIES.name,
        path: CONSTANT.PAGES.ADMINISTRATIVEDIVISION.children.MUNICIPALITIES
          .path,
        element: <Municipalities />,
        handle: {
          permission:
            CONSTANT.PAGES.ADMINISTRATIVEDIVISION.children.MUNICIPALITIES.name,
        },
      },
      {
        id: CONSTANT.PAGES.ADMINISTRATIVEDIVISION.children.SUBMUNICIPALITIES
          .name,
        path: CONSTANT.PAGES.ADMINISTRATIVEDIVISION.children.SUBMUNICIPALITIES
          .path,
        element: <SubMunicipalities />,
        handle: {
          permission:
            CONSTANT.PAGES.ADMINISTRATIVEDIVISION.children.SUBMUNICIPALITIES
              .name,
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
        id: CONSTANT.PAGES.ADMINISTRATIVEDIVISION.children.PROVINCES.name,
        path: CONSTANT.PAGES.ADMINISTRATIVEDIVISION.children.PROVINCES.path,
        element: <Provinces />,
        handle: {
          permission:
            CONSTANT.PAGES.ADMINISTRATIVEDIVISION.children.PROVINCES.name,
        },
      },
      {
        id: CONSTANT.PAGES.ADMINISTRATIVEDIVISION.children.REGIONS.name,
        path: CONSTANT.PAGES.ADMINISTRATIVEDIVISION.children.REGIONS.path,
        element: <Regions />,
        handle: {
          permission:
            CONSTANT.PAGES.ADMINISTRATIVEDIVISION.children.REGIONS.name,
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
      {
        id: CONSTANT.PAGES.EXTRAS.children.REQUISITION.name,
        path: CONSTANT.PAGES.EXTRAS.children.REQUISITION.path,
        element: <RequisitionTypes />,
        handle: {
          permission: CONSTANT.PAGES.EXTRAS.children.REQUISITION.name,
        },
      },
      {
        id: CONSTANT.PAGES.EMPLOYEES.children.EMPLOYEEINFORMATION.name,
        path: CONSTANT.PAGES.EMPLOYEES.children.EMPLOYEEINFORMATION.path,
        element: <EMPLOYEEINFORMATION />,
        handle: {
          permission:
            CONSTANT.PAGES.EMPLOYEES.children.EMPLOYEEINFORMATION.name,
        },
      },
      {
        id: CONSTANT.PAGES.EMPLOYEES.children.GENERAL_INFORMATION.name,
        path: CONSTANT.PAGES.EMPLOYEES.children.GENERAL_INFORMATION.path,
        element: <GeneralInformation />,
      },
      {
        id: CONSTANT.PAGES.EMPLOYEES.children.ADDRESS.name,
        path: CONSTANT.PAGES.EMPLOYEES.children.ADDRESS.path,
        element: <Address />,
      },
      {
        id: CONSTANT.PAGES.EMPLOYEES.children.POSITIONS.name,
        path: CONSTANT.PAGES.EMPLOYEES.children.POSITIONS.path,
        element: <PositionsEmp />,
      },
      {
        id: CONSTANT.PAGES.EMPLOYEES.children.EMPLOYMENT_TYPES.name,
        path: CONSTANT.PAGES.EMPLOYEES.children.EMPLOYMENT_TYPES.path,
        element: <EMPLOYMENT_TYPES />,
      },
      {
        id: CONSTANT.PAGES.EMPLOYEES.children.STATUSES.name,
        path: CONSTANT.PAGES.EMPLOYEES.children.STATUSES.path,
        element: <STATUSES />,
      },
      {
        id: CONSTANT.PAGES.EMPLOYEES.children.CONTACTS.name,
        path: CONSTANT.PAGES.EMPLOYEES.children.CONTACTS.path,
        element: <CONTACTS />,
      },
      {
        id: CONSTANT.PAGES.EMPLOYEES.children.ATTAINMENTSEMP.name,
        path: CONSTANT.PAGES.EMPLOYEES.children.ATTAINMENTSEMP.path,
        element: <ATTAINMENTSEMP />,
      },
      {
        id: CONSTANT.PAGES.EMPLOYEES.children.ACCOUNTS.name,
        path: CONSTANT.PAGES.EMPLOYEES.children.ACCOUNTS.path,
        element: <ACCOUNTS />,
      },
      {
        id: CONSTANT.PAGES.EMPLOYEES.children.FILES.name,
        path: CONSTANT.PAGES.EMPLOYEES.children.FILES.path,
        element: <FILES />,
      },
    ],
  },
];
