import { CONSTANT, MODULES } from "..";
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
import SubmissionApproval from "../../pages/approvals/submissionApproval/SubmissionApproval.jsx";
import PendingForms from "../../pages/receiving/PendingForms.jsx";
import PENDINGREGISTRATION from "../../pages/pendingRegistration/PendingRegistration.jsx";
import RegistrationApproval from "../../pages/approvals/registrationApproval/RegistrationApproval.jsx";
import DATACHANGEMAINCONTAINER from "../../pages/forms/201datachange/DataChangeMainContainer.jsx";
import MrfMainContainer from "../../pages/forms/manpowerform/MrfMainContainer.jsx";
import KPI from "../../pages/evaluation/Kpi.jsx";
import Evaluation from "../../pages/evaluation/Evaluation.jsx";
import MovementTypes from "../../pages/extras/MovementTypes.jsx";
import DataChangeApproval from "../../pages/approvals/dataChangeApproval/DataChangeApproval.jsx";
import MASTERDATAAUTHORITY from "../../pages/forms/mdaform/MDA.jsx";
import EnableEdit from "../../components/modal/employee/multiFormModal/EnableEdit.jsx";
import MRFMonitoring from "../../pages/monitoring/MRF/MRFMonitoring.jsx";
import DataChangeMonitoring from "../../pages/monitoring/datachange/DataChangeMonitoring.jsx";
import MDAMonitoring from "../../pages/monitoring/MDA/MDAMonitoring.jsx";
import MdaApproval from "../../pages/approvals/mdaApproval/MdaApproval.jsx";
import CatOne from "../../pages/masterlist/da-tasks/catone/CatOne.jsx";
import CatTwo from "../../pages/masterlist/da-tasks/cattwo/CatTwo.jsx";
import Pdp from "../../pages/masterlist/da-tasks/pdp/Pdp.jsx";

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
        id: MODULES.USERMANAGEMENT.children.USER.name,
        path: MODULES.USERMANAGEMENT.children.USER.path,
        element: <User />,
        handle: {
          permission: MODULES.USERMANAGEMENT.children.USER.name,
        },
      },
      {
        id: MODULES.USERMANAGEMENT.children.ROLES.name,
        path: MODULES.USERMANAGEMENT.children.ROLES.path,
        element: <Roles />,
        handle: {
          permission: MODULES.USERMANAGEMENT.children.ROLES.name,
        },
      },
      {
        id: MODULES.APPROVALSETTINGS.children.APPROVALFORM.name,
        path: MODULES.APPROVALSETTINGS.children.APPROVALFORM.path,
        element: <ApprovalForm />,
        handle: {
          permission: MODULES.APPROVALSETTINGS.children.APPROVALFORM.name,
        },
      },
      {
        id: MODULES.APPROVALSETTINGS.children.APPROVALFLOW.name,
        path: MODULES.APPROVALSETTINGS.children.APPROVALFLOW.path,
        element: <ApprovalFlow />,
        handle: {
          permission: MODULES.APPROVALSETTINGS.children.APPROVALFLOW.name,
        },
      },
      {
        id: MODULES.REQUEST.children.MRFMAINCONTAINER.name,
        path: MODULES.REQUEST.children.MRFMAINCONTAINER.path,
        element: <MrfMainContainer />,
        handle: {
          permission: MODULES.REQUEST.children.MRFMAINCONTAINER.name,
        },
      },
      {
        id: MODULES.REQUEST.children.DATACHANGEMAINCONTAINER.name,
        path: MODULES.REQUEST.children.DATACHANGEMAINCONTAINER.path,
        element: <DATACHANGEMAINCONTAINER />,
        handle: {
          permission: MODULES.REQUEST.children.DATACHANGEMAINCONTAINER.name,
        },
      },
      {
        id: MODULES.REQUEST.children.MASTERDATAAUTHORITY.name,
        path: MODULES.REQUEST.children.MASTERDATAAUTHORITY.path,
        element: <MASTERDATAAUTHORITY />,
        handle: {
          permission: MODULES.REQUEST.children.MASTERDATAAUTHORITY.name,
        },
      },
      {
        id: MODULES.REQUESTMONITORING.children.MRFMONITORING.name,
        path: MODULES.REQUESTMONITORING.children.MRFMONITORING.path,
        element: <MRFMonitoring />,
        handle: {
          permission: MODULES.REQUESTMONITORING.children.MRFMONITORING.name,
        },
      },
      {
        id: MODULES.REQUESTMONITORING.children.DATACHANGEMONITORING.name,
        path: MODULES.REQUESTMONITORING.children.DATACHANGEMONITORING.path,
        element: <DataChangeMonitoring />,
        handle: {
          permission:
            MODULES.REQUESTMONITORING.children.DATACHANGEMONITORING.name,
        },
      },
      {
        id: MODULES.REQUESTMONITORING.children.MDAMONITORING.name,
        path: MODULES.REQUESTMONITORING.children.MDAMONITORING.path,
        element: <MDAMonitoring />,
        handle: {
          permission: MODULES.REQUESTMONITORING.children.MDAMONITORING.name,
        },
      },
      {
        id: MODULES.EVALUATION.name,
        path: MODULES.EVALUATION.path,
        element: <Evaluation />,
        handle: {
          permission: MODULES.EVALUATION.name,
        },
      },
      {
        id: MODULES.EVALUATION.children.KPI.name,
        path: MODULES.EVALUATION.children.KPI.path,
        element: <KPI />,
        handle: {
          permission: MODULES.EVALUATION.children.KPI.name,
        },
      },
      {
        id: MODULES.APPROVING.children.SUBMISSIONAPPROVAL.name,
        path: MODULES.APPROVING.children.SUBMISSIONAPPROVAL.path,
        element: <SubmissionApproval />,
        handle: {
          permission: MODULES.APPROVING.children.SUBMISSIONAPPROVAL.name,
        },
      },
      {
        id: MODULES.APPROVING.children.REGISTRATIONAPPROVAL.name,
        path: MODULES.APPROVING.children.REGISTRATIONAPPROVAL.path,
        element: <RegistrationApproval />,
        handle: {
          permission: MODULES.APPROVING.children.REGISTRATIONAPPROVAL.name,
        },
      },
      {
        id: MODULES.APPROVING.children.DATACHANGEAPPROVAL.name,
        path: MODULES.APPROVING.children.DATACHANGEAPPROVAL.path,
        element: <DataChangeApproval />,
        handle: {
          permission: MODULES.APPROVING.children.DATACHANGEAPPROVAL.name,
        },
      },
      {
        id: MODULES.APPROVING.children.MDAAPPROVAL.name,
        path: MODULES.APPROVING.children.MDAAPPROVAL.path,
        element: <MdaApproval />,
        handle: {
          permission: MODULES.APPROVING.children.MDAAPPROVAL.name,
        },
      },
      {
        id: MODULES.RECEIVING.children.PENDINGFORMS.name,
        path: MODULES.RECEIVING.children.PENDINGFORMS.path,
        element: <PendingForms />,
        handle: {
          permission: MODULES.RECEIVING.children.PENDINGFORMS.name,
        },
      },
      {
        id: MODULES.MASTERLIST.children.ONERDF.name,
        path: MODULES.MASTERLIST.children.ONERDF.path,
        element: <ONERDF />,
        handle: {
          permission: MODULES.MASTERLIST.children.ONERDF.name,
        },
      },
      {
        id: MODULES.MASTERLIST.children.POSITIONS.name,
        path: MODULES.MASTERLIST.children.POSITIONS.path,
        element: <Positions />,
        handle: {
          permission: MODULES.MASTERLIST.children.POSITIONS.name,
        },
      },
      {
        id: MODULES.MASTERLIST.children.CATONE.name,
        path: MODULES.MASTERLIST.children.CATONE.path,
        element: <CatOne />,
        handle: {
          permission: MODULES.MASTERLIST.children.CATONE.name,
        },
      },
      {
        id: MODULES.MASTERLIST.children.CATTWO.name,
        path: MODULES.MASTERLIST.children.CATTWO.path,
        element: <CatTwo />,
        handle: {
          permission: MODULES.MASTERLIST.children.CATTWO.name,
        },
      },
      {
        id: MODULES.MASTERLIST.children.PDP.name,
        path: MODULES.MASTERLIST.children.PDP.path,
        element: <Pdp />,
        handle: {
          permission: MODULES.MASTERLIST.children.PDP.name,
        },
      },
      {
        id: MODULES.EXTRAS.children.JOBBANDS.name,
        path: MODULES.EXTRAS.children.JOBBANDS.path,
        element: <Jobbands />,
        handle: {
          permission: MODULES.EXTRAS.children.JOBBANDS.name,
        },
      },
      {
        id: MODULES.EXTRAS.children.JOBLEVELS.name,
        path: MODULES.EXTRAS.children.JOBLEVELS.path,
        element: <Joblevels />,
        handle: {
          permission: MODULES.EXTRAS.children.JOBLEVELS.name,
        },
      },
      {
        id: MODULES.EXTRAS.children.JOBRATES.name,
        path: MODULES.EXTRAS.children.JOBRATES.path,
        element: <Jobrates />,
        handle: {
          permission: MODULES.EXTRAS.children.JOBRATES.name,
        },
      },
      {
        id: MODULES.EXTRAS.children.TITLES.name,
        path: MODULES.EXTRAS.children.TITLES.path,
        element: <Titles />,
        handle: {
          permission: MODULES.EXTRAS.children.TITLES.name,
        },
      },
      {
        id: MODULES.EXTRAS.children.TEAMS.name,
        path: MODULES.EXTRAS.children.TEAMS.path,
        element: <Teams />,
        handle: {
          permission: MODULES.EXTRAS.children.TEAMS.name,
        },
      },
      {
        id: MODULES.EXTRAS.children.RELIGIONS.name,
        path: MODULES.EXTRAS.children.RELIGIONS.path,
        element: <Religions />,
        handle: {
          permission: MODULES.EXTRAS.children.RELIGIONS.name,
        },
      },
      {
        id: MODULES.EXTRAS.children.ATTAINMENTS.name,
        path: MODULES.EXTRAS.children.ATTAINMENTS.path,
        element: <Attainments />,
        handle: {
          permission: MODULES.EXTRAS.children.ATTAINMENTS.name,
        },
      },
      {
        id: MODULES.EXTRAS.children.BANKS.name,
        path: MODULES.EXTRAS.children.BANKS.path,
        element: <Banks />,
        handle: {
          permission: MODULES.EXTRAS.children.BANKS.name,
        },
      },
      {
        id: MODULES.ADMINISTRATIVEDIVISION.children.BARANGAYS.name,
        path: MODULES.ADMINISTRATIVEDIVISION.children.BARANGAYS.path,
        element: <Barangays />,
        handle: {
          permission: MODULES.ADMINISTRATIVEDIVISION.children.BARANGAYS.name,
        },
      },
      {
        id: MODULES.EXTRAS.children.CABINETS.name,
        path: MODULES.EXTRAS.children.CABINETS.path,
        element: <Cabinets />,
        handle: {
          permission: MODULES.EXTRAS.children.CABINETS.name,
        },
      },
      {
        id: MODULES.EXTRAS.children.DEGREES.name,
        path: MODULES.EXTRAS.children.DEGREES.path,
        element: <Degrees />,
        handle: {
          permission: MODULES.EXTRAS.children.DEGREES.name,
        },
      },
      {
        id: MODULES.EXTRAS.children.FILETYPES.name,
        path: MODULES.EXTRAS.children.FILETYPES.path,
        element: <FileTypes />,
        handle: {
          permission: MODULES.EXTRAS.children.FILETYPES.name,
        },
      },
      {
        id: MODULES.EXTRAS.children.HONORTITLES.name,
        path: MODULES.EXTRAS.children.HONORTITLES.path,
        element: <HonorTitles />,
        handle: {
          permission: MODULES.EXTRAS.children.HONORTITLES.name,
        },
      },
      {
        id: MODULES.ADMINISTRATIVEDIVISION.children.MUNICIPALITIES.name,
        path: MODULES.ADMINISTRATIVEDIVISION.children.MUNICIPALITIES.path,
        element: <Municipalities />,
        handle: {
          permission:
            MODULES.ADMINISTRATIVEDIVISION.children.MUNICIPALITIES.name,
        },
      },
      {
        id: MODULES.ADMINISTRATIVEDIVISION.children.SUBMUNICIPALITIES.name,
        path: MODULES.ADMINISTRATIVEDIVISION.children.SUBMUNICIPALITIES.path,
        element: <SubMunicipalities />,
        handle: {
          permission:
            MODULES.ADMINISTRATIVEDIVISION.children.SUBMUNICIPALITIES.name,
        },
      },
      {
        id: MODULES.EXTRAS.children.OBJECTIVES.name,
        path: MODULES.EXTRAS.children.OBJECTIVES.path,
        element: <Objectives />,
        handle: {
          permission: MODULES.EXTRAS.children.OBJECTIVES.name,
        },
      },
      {
        id: MODULES.EXTRAS.children.PREFIXES.name,
        path: MODULES.EXTRAS.children.PREFIXES.path,
        element: <Prefixes />,
        handle: {
          permission: MODULES.EXTRAS.children.PREFIXES.name,
        },
      },
      {
        id: MODULES.EXTRAS.children.PROGRAMS.name,
        path: MODULES.EXTRAS.children.PROGRAMS.path,
        element: <Programs />,
        handle: {
          permission: MODULES.EXTRAS.children.PROGRAMS.name,
        },
      },
      {
        id: MODULES.ADMINISTRATIVEDIVISION.children.PROVINCES.name,
        path: MODULES.ADMINISTRATIVEDIVISION.children.PROVINCES.path,
        element: <Provinces />,
        handle: {
          permission: MODULES.ADMINISTRATIVEDIVISION.children.PROVINCES.name,
        },
      },
      {
        id: MODULES.ADMINISTRATIVEDIVISION.children.REGIONS.name,
        path: MODULES.ADMINISTRATIVEDIVISION.children.REGIONS.path,
        element: <Regions />,
        handle: {
          permission: MODULES.ADMINISTRATIVEDIVISION.children.REGIONS.name,
        },
      },
      {
        id: MODULES.EXTRAS.children.SCHEDULES.name,
        path: MODULES.EXTRAS.children.SCHEDULES.path,
        element: <Schedules />,
        handle: {
          permission: MODULES.EXTRAS.children.SCHEDULES.name,
        },
      },
      {
        id: MODULES.EXTRAS.children.TOOLS.name,
        path: MODULES.EXTRAS.children.TOOLS.path,
        element: <Tools />,
        handle: {
          permission: MODULES.EXTRAS.children.TOOLS.name,
        },
      },
      {
        id: MODULES.EXTRAS.children.REQUISITION.name,
        path: MODULES.EXTRAS.children.REQUISITION.path,
        element: <RequisitionTypes />,
        handle: {
          permission: MODULES.EXTRAS.children.REQUISITION.name,
        },
      },
      {
        id: MODULES.EXTRAS.children.MOVEMENTTYPES.name,
        path: MODULES.EXTRAS.children.MOVEMENTTYPES.path,
        element: <MovementTypes />,
        handle: {
          permission: MODULES.EXTRAS.children.MOVEMENTTYPES.name,
        },
      },
      {
        id: MODULES.EMPLOYEES.children.EMPLOYEEINFORMATION.name,
        path: MODULES.EMPLOYEES.children.EMPLOYEEINFORMATION.path,
        element: <EMPLOYEEINFORMATION />,
        handle: {
          permission: MODULES.EMPLOYEES.children.EMPLOYEEINFORMATION.name,
        },
      },
      {
        id: MODULES.EMPLOYEES.children.PENDINGREGISTRATION.name,
        path: MODULES.EMPLOYEES.children.PENDINGREGISTRATION.path,
        element: <PENDINGREGISTRATION />,
        handle: {
          permission: MODULES.EMPLOYEES.children.PENDINGREGISTRATION.name,
        },
      },
      {
        id: MODULES.EMPLOYEES.children.ENABLEEDIT.name,
        path: MODULES.EMPLOYEES.children.ENABLEEDIT.path,
        element: <EnableEdit />,
        handle: {
          permission: MODULES.EMPLOYEES.children.ENABLEEDIT.name,
        },
      },
    ],
  },
];
