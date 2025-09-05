import { CONSTANT } from "..";
import { MODULES } from "..";
import PrivateRoutes from "../../pages/index.jsx";
import Login from "../../pages/login/Login";
import Dashboard from "../../pages/dashboard/Dashboard";
import Positions from "../../pages/masterlist/positions/Positions.jsx";
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
import EMPLOYEEINFORMATION from "../../pages/employees/EmployeeInformation.jsx";
import ONERDF from "../../pages/masterlist/one-rdf/oneRdf.jsx";
import ApprovalFlow from "../../pages/approver/ApprovalFlow.jsx";
import ApprovalForm from "../../pages/approver/ApprovalForm.jsx";
import SubmissionApproval from "../../pages/approver/submissionApproval/SubmissionApproval.jsx";
import PendingForms from "../../pages/receiving/PendingForms.jsx";
import Receiver from "../../pages/approver/Receiver.jsx";
import Approver from "../../pages/approver/Approver.jsx";
import PENDINGREGISTRATION from "../../pages/pendingRegistration/PendingRegistration.jsx";
import RegistrationApproval from "../../pages/approver/registrationApproval/RegistrationApproval.jsx";
import DATACHANGEMAINCONTAINER from "../../pages/forms/201datachange/DataChangeMainContainer.jsx";
import DataChangeReceiving from "../../pages/receiving/DataChangeReceiving";
import MrfMainContainer from "../../pages/forms/manpowerform/MrfMainContainer.jsx";

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
        id: CONSTANT.PAGES.APPROVALSETTINGS.children.APPROVALFORM.name,
        path: CONSTANT.PAGES.APPROVALSETTINGS.children.APPROVALFORM.path,
        element: <ApprovalForm />,
        handle: {
          permission:
            CONSTANT.PAGES.APPROVALSETTINGS.children.APPROVALFORM.name,
        },
      },
      {
        id: CONSTANT.PAGES.APPROVALSETTINGS.children.APPROVALFLOW.name,
        path: CONSTANT.PAGES.APPROVALSETTINGS.children.APPROVALFLOW.path,
        element: <ApprovalFlow />,
        handle: {
          permission:
            CONSTANT.PAGES.APPROVALSETTINGS.children.APPROVALFLOW.name,
        },
      },
      {
        id: CONSTANT.PAGES.APPROVALSETTINGS.children.RECEIVER.name,
        path: CONSTANT.PAGES.APPROVALSETTINGS.children.RECEIVER.path,
        element: <Receiver />,
        handle: {
          permission: CONSTANT.PAGES.APPROVALSETTINGS.children.RECEIVER.name,
        },
      },
      {
        id: CONSTANT.PAGES.APPROVALSETTINGS.children.APPROVER.name,
        path: CONSTANT.PAGES.APPROVALSETTINGS.children.APPROVER.path,
        element: <Approver />,
        handle: {
          permission: CONSTANT.PAGES.APPROVALSETTINGS.children.APPROVER.name,
        },
      },
      {
        id: CONSTANT.PAGES.REQUEST.children.MRFMAINCONTAINER.name,
        path: CONSTANT.PAGES.REQUEST.children.MRFMAINCONTAINER.path,
        element: <MrfMainContainer />,
        handle: {
          permission: CONSTANT.PAGES.REQUEST.children.MRFMAINCONTAINER.name,
        },
      },
      {
        id: CONSTANT.PAGES.REQUEST.children.DATACHANGEMAINCONTAINER.name,
        path: CONSTANT.PAGES.REQUEST.children.DATACHANGEMAINCONTAINER.path,
        element: <DATACHANGEMAINCONTAINER />,
        handle: {
          permission:
            CONSTANT.PAGES.REQUEST.children.DATACHANGEMAINCONTAINER.name,
        },
      },
      {
        id: CONSTANT.PAGES.APPROVING.children.SUBMISSIONAPPROVAL.name,
        path: CONSTANT.PAGES.APPROVING.children.SUBMISSIONAPPROVAL.path,
        element: <SubmissionApproval />,
        handle: {
          permission: CONSTANT.PAGES.APPROVING.children.SUBMISSIONAPPROVAL.name,
        },
      },
      {
        id: CONSTANT.PAGES.APPROVING.children.REGISTRATIONAPPROVAL.name,
        path: CONSTANT.PAGES.APPROVING.children.REGISTRATIONAPPROVAL.path,
        element: <RegistrationApproval />,
        handle: {
          permission:
            CONSTANT.PAGES.APPROVING.children.REGISTRATIONAPPROVAL.name,
        },
      },
      {
        id: CONSTANT.PAGES.RECEIVING.children.PENDINGFORMS.name,
        path: CONSTANT.PAGES.RECEIVING.children.PENDINGFORMS.path,
        element: <PendingForms />,
        handle: {
          permission: CONSTANT.PAGES.RECEIVING.children.PENDINGFORMS.name,
        },
      },
      {
        id: CONSTANT.PAGES.RECEIVING.children.DATACHANGERECEIVING.name,
        path: CONSTANT.PAGES.RECEIVING.children.DATACHANGERECEIVING.path,
        element: <DataChangeReceiving />,
        handle: {
          permission:
            CONSTANT.PAGES.RECEIVING.children.DATACHANGERECEIVING.name,
        },
      },
      {
        id: CONSTANT.PAGES.MASTERLIST.children.ONERDF.name,
        path: CONSTANT.PAGES.MASTERLIST.children.ONERDF.path,
        element: <ONERDF />,
        handle: {
          permission: CONSTANT.PAGES.MASTERLIST.children.ONERDF.name,
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
        id: CONSTANT.PAGES.EMPLOYEES.children.PENDINGREGISTRATION.name,
        path: CONSTANT.PAGES.EMPLOYEES.children.PENDINGREGISTRATION.path,
        element: <PENDINGREGISTRATION />,
        handle: {
          permission:
            CONSTANT.PAGES.EMPLOYEES.children.PENDINGREGISTRATION.name,
        },
      },
    ],
  },
];
