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
import DAForm from "../../pages/forms/daform/DAForm.jsx";
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
import CatOne from "../../pages/developmental-assignment/catone/CatOne.jsx";
import CatTwo from "../../pages/developmental-assignment/cattwo/CatTwo.jsx";
import Pdp from "../../pages/developmental-assignment/pdp/Pdp.jsx";
import CatOneApproval from "../../pages/approvals/da-task/CatOneApproval.jsx";
import CatTwoApproval from "../../pages/approvals/da-task/CatTwoApproval.jsx";
import PdpApproval from "../../pages/approvals/da-task/PdpApproval.jsx";
import DAFormApproval from "../../pages/approvals/daform/DAFormApproval.jsx";
import WorkWeeks from "../../pages/extras/WorkWeeks.jsx";
import WorkHours from "../../pages/extras/WorkHours.jsx";
import RestDays from "../../pages/extras/RestDays.jsx";
import SeparationTypes from "../../pages/extras/SeparationTypes.jsx";
import SeparationReasons from "../../pages/extras/SeparationReasons.jsx";

export const ROUTES = [
  {
    id: "UNAUTHORIZED",
    path: CONSTANT.PAGES.UNAUTHORIZED.path,
    element: <Unauthorized />,
  },
  {
    path: CONSTANT.PAGES.LOGIN.path,
    element: <Login />,
    id: "LOGIN",
  },
  {
    path: CONSTANT.PAGES.CHANGEPASS.path,
    element: <Changepass />,
    id: "CHANGEPASS",
  },
  {
    element: <PrivateRoutes />,
    children: [
      {
        id: "DASHBOARD",
        path: MODULES.DASHBOARD.path,
        element: <Dashboard />,
        handle: {
          permission: MODULES.DASHBOARD.name,
        },
      },
      {
        id: "USERMANAGEMENT.USER",
        path: `${MODULES.USERMANAGEMENT.path}/${MODULES.USERMANAGEMENT.children.USER.path}`,
        element: <User />,
        handle: {
          permission: MODULES.USERMANAGEMENT.children.USER.name,
        },
      },
      {
        id: "USERMANAGEMENT.ROLES",
        path: `${MODULES.USERMANAGEMENT.path}/${MODULES.USERMANAGEMENT.children.ROLES.path}`,
        element: <Roles />,
        handle: {
          permission: MODULES.USERMANAGEMENT.children.ROLES.name,
        },
      },
      {
        id: "APPROVALSETTINGS.APPROVALFORM",
        path: `${MODULES.APPROVALSETTINGS.path}/${MODULES.APPROVALSETTINGS.children.APPROVALFORM.path}`,
        element: <ApprovalForm />,
        handle: {
          permission: MODULES.APPROVALSETTINGS.children.APPROVALFORM.name,
        },
      },
      {
        id: "APPROVALSETTINGS.APPROVALFLOW",
        path: `${MODULES.APPROVALSETTINGS.path}/${MODULES.APPROVALSETTINGS.children.APPROVALFLOW.path}`,
        element: <ApprovalFlow />,
        handle: {
          permission: MODULES.APPROVALSETTINGS.children.APPROVALFLOW.name,
        },
      },
      {
        id: "REQUEST.MRFMAINCONTAINER",
        path: `${MODULES.REQUEST.path}/${MODULES.REQUEST.children.MRFMAINCONTAINER.path}`,
        element: <MrfMainContainer />,
        handle: {
          permission: MODULES.REQUEST.children.MRFMAINCONTAINER.name,
        },
      },
      {
        id: "REQUEST.DAFORM",
        path: `${MODULES.REQUEST.path}/${MODULES.REQUEST.children.DAFORM.path}`,
        element: <DAForm />,
        handle: {
          permission: MODULES.REQUEST.children.DAFORM.name,
        },
      },
      {
        id: "REQUEST.DATACHANGEMAINCONTAINER",
        path: `${MODULES.REQUEST.path}/${MODULES.REQUEST.children.DATACHANGEMAINCONTAINER.path}`,
        element: <DATACHANGEMAINCONTAINER />,
        handle: {
          permission: MODULES.REQUEST.children.DATACHANGEMAINCONTAINER.name,
        },
      },
      {
        id: "REQUEST.MASTERDATAAUTHORITY",
        path: `${MODULES.REQUEST.path}/${MODULES.REQUEST.children.MASTERDATAAUTHORITY.path}`,
        element: <MASTERDATAAUTHORITY />,
        handle: {
          permission: MODULES.REQUEST.children.MASTERDATAAUTHORITY.name,
        },
      },
      {
        id: "REQUEST.PENDINGREGISTRATION",
        path: `${MODULES.REQUEST.path}/${MODULES.REQUEST.children.PENDINGREGISTRATION.path}`,
        element: <PENDINGREGISTRATION />,
        handle: {
          permission: MODULES.REQUEST.children.PENDINGREGISTRATION.name,
        },
      },
      {
        id: "REQUESTMONITORING.MRFMONITORING",
        path: `${MODULES.REQUESTMONITORING.path}/${MODULES.REQUESTMONITORING.children.MRFMONITORING.path}`,
        element: <MRFMonitoring />,
        handle: {
          permission: MODULES.REQUESTMONITORING.children.MRFMONITORING.name,
        },
      },
      {
        id: "REQUESTMONITORING.DATACHANGEMONITORING",
        path: `${MODULES.REQUESTMONITORING.path}/${MODULES.REQUESTMONITORING.children.DATACHANGEMONITORING.path}`,
        element: <DataChangeMonitoring />,
        handle: {
          permission:
            MODULES.REQUESTMONITORING.children.DATACHANGEMONITORING.name,
        },
      },
      {
        id: "REQUESTMONITORING.MDAMONITORING",
        path: `${MODULES.REQUESTMONITORING.path}/${MODULES.REQUESTMONITORING.children.MDAMONITORING.path}`,
        element: <MDAMonitoring />,
        handle: {
          permission: MODULES.REQUESTMONITORING.children.MDAMONITORING.name,
        },
      },
      {
        id: "EVALUATION",
        path: MODULES.EVALUATION.path,
        element: <Evaluation />,
        handle: {
          permission: MODULES.EVALUATION.name,
        },
      },
      {
        id: "EVALUATION.KPI",
        path: `${MODULES.EVALUATION.path}/${MODULES.EVALUATION.children.KPI.path}`,
        element: <KPI />,
        handle: {
          permission: MODULES.EVALUATION.children.KPI.name,
        },
      },
      {
        id: "APPROVING.SUBMISSIONAPPROVAL",
        path: `${MODULES.APPROVING.path}/${MODULES.APPROVING.children.SUBMISSIONAPPROVAL.path}`,
        element: <SubmissionApproval />,
        handle: {
          permission: MODULES.APPROVING.children.SUBMISSIONAPPROVAL.name,
        },
      },
      {
        id: "APPROVING.REGISTRATIONAPPROVAL",
        path: `${MODULES.APPROVING.path}/${MODULES.APPROVING.children.REGISTRATIONAPPROVAL.path}`,
        element: <RegistrationApproval />,
        handle: {
          permission: MODULES.APPROVING.children.REGISTRATIONAPPROVAL.name,
        },
      },
      {
        id: "APPROVING.DATACHANGEAPPROVAL",
        path: `${MODULES.APPROVING.path}/${MODULES.APPROVING.children.DATACHANGEAPPROVAL.path}`,
        element: <DataChangeApproval />,
        handle: {
          permission: MODULES.APPROVING.children.DATACHANGEAPPROVAL.name,
        },
      },
      {
        id: "APPROVING.MDAAPPROVAL",
        path: `${MODULES.APPROVING.path}/${MODULES.APPROVING.children.MDAAPPROVAL.path}`,
        element: <MdaApproval />,
        handle: {
          permission: MODULES.APPROVING.children.MDAAPPROVAL.name,
        },
      },
      {
        id: "APPROVING.DAFORMAPPROVAL",
        path: `${MODULES.APPROVING.path}/${MODULES.APPROVING.children.DAFORMAPPROVAL.path}`,
        element: <DAFormApproval />,
        handle: {
          permission: MODULES.APPROVING.children.DAFORMAPPROVAL.name,
        },
      },
      {
        id: "APPROVING.CATONEAPPROVAL",
        path: `${MODULES.APPROVING.path}/${MODULES.APPROVING.children.CATONEAPPROVAL.path}`,
        element: <CatOneApproval />,
        handle: {
          permission: MODULES.APPROVING.children.CATONEAPPROVAL.name,
        },
      },
      {
        id: "APPROVING.CATTWOAPPROVAL",
        path: `${MODULES.APPROVING.path}/${MODULES.APPROVING.children.CATTWOAPPROVAL.path}`,
        element: <CatTwoApproval />,
        handle: {
          permission: MODULES.APPROVING.children.CATTWOAPPROVAL.name,
        },
      },
      {
        id: "APPROVING.PDPAPPROVAL",
        path: `${MODULES.APPROVING.path}/${MODULES.APPROVING.children.PDPAPPROVAL.path}`,
        element: <PdpApproval />,
        handle: {
          permission: MODULES.APPROVING.children.PDPAPPROVAL.name,
        },
      },
      {
        id: "RECEIVING.PENDINGFORMS",
        path: `${MODULES.RECEIVING.path}/${MODULES.RECEIVING.children.PENDINGFORMS.path}`,
        element: <PendingForms />,
        handle: {
          permission: MODULES.RECEIVING.children.PENDINGFORMS.name,
        },
      },
      {
        id: "MASTERLIST.ONERDF",
        path: `${MODULES.MASTERLIST.path}/${MODULES.MASTERLIST.children.ONERDF.path}`,
        element: <ONERDF />,
        handle: {
          permission: MODULES.MASTERLIST.children.ONERDF.name,
        },
      },
      {
        id: "MASTERLIST.POSITIONS",
        path: `${MODULES.MASTERLIST.path}/${MODULES.MASTERLIST.children.POSITIONS.path}`,
        element: <Positions />,
        handle: {
          permission: MODULES.MASTERLIST.children.POSITIONS.name,
        },
      },
      {
        id: "DEVELOPMENTALASSIGNMENT.CATONE",
        path: `${MODULES.DEVELOPMENTALASSIGNMENT.path}/${MODULES.DEVELOPMENTALASSIGNMENT.children.CATONE.path}`,
        element: <CatOne />,
        handle: {
          permission: MODULES.DEVELOPMENTALASSIGNMENT.children.CATONE.name,
        },
      },
      {
        id: "DEVELOPMENTALASSIGNMENT.CATTWO",
        path: `${MODULES.DEVELOPMENTALASSIGNMENT.path}/${MODULES.DEVELOPMENTALASSIGNMENT.children.CATTWO.path}`,
        element: <CatTwo />,
        handle: {
          permission: MODULES.DEVELOPMENTALASSIGNMENT.children.CATTWO.name,
        },
      },
      {
        id: "DEVELOPMENTALASSIGNMENT.PDP",
        path: `${MODULES.DEVELOPMENTALASSIGNMENT.path}/${MODULES.DEVELOPMENTALASSIGNMENT.children.PDP.path}`,
        element: <Pdp />,
        handle: {
          permission: MODULES.DEVELOPMENTALASSIGNMENT.children.PDP.name,
        },
      },
      {
        id: "EXTRAS.JOBBANDS",
        path: `${MODULES.EXTRAS.path}/${MODULES.EXTRAS.children.JOBBANDS.path}`,
        element: <Jobbands />,
        handle: {
          permission: MODULES.EXTRAS.children.JOBBANDS.name,
        },
      },
      {
        id: "EXTRAS.JOBLEVELS",
        path: `${MODULES.EXTRAS.path}/${MODULES.EXTRAS.children.JOBLEVELS.path}`,
        element: <Joblevels />,
        handle: {
          permission: MODULES.EXTRAS.children.JOBLEVELS.name,
        },
      },
      {
        id: "EXTRAS.JOBRATES",
        path: `${MODULES.EXTRAS.path}/${MODULES.EXTRAS.children.JOBRATES.path}`,
        element: <Jobrates />,
        handle: {
          permission: MODULES.EXTRAS.children.JOBRATES.name,
        },
      },
      {
        id: "EXTRAS.TITLES",
        path: `${MODULES.EXTRAS.path}/${MODULES.EXTRAS.children.TITLES.path}`,
        element: <Titles />,
        handle: {
          permission: MODULES.EXTRAS.children.TITLES.name,
        },
      },
      {
        id: "EXTRAS.TEAMS",
        path: `${MODULES.EXTRAS.path}/${MODULES.EXTRAS.children.TEAMS.path}`,
        element: <Teams />,
        handle: {
          permission: MODULES.EXTRAS.children.TEAMS.name,
        },
      },
      {
        id: "EXTRAS.RELIGIONS",
        path: `${MODULES.EXTRAS.path}/${MODULES.EXTRAS.children.RELIGIONS.path}`,
        element: <Religions />,
        handle: {
          permission: MODULES.EXTRAS.children.RELIGIONS.name,
        },
      },
      {
        id: "EXTRAS.ATTAINMENTS",
        path: `${MODULES.EXTRAS.path}/${MODULES.EXTRAS.children.ATTAINMENTS.path}`,
        element: <Attainments />,
        handle: {
          permission: MODULES.EXTRAS.children.ATTAINMENTS.name,
        },
      },
      {
        id: "EXTRAS.BANKS",
        path: `${MODULES.EXTRAS.path}/${MODULES.EXTRAS.children.BANKS.path}`,
        element: <Banks />,
        handle: {
          permission: MODULES.EXTRAS.children.BANKS.name,
        },
      },
      {
        id: "ADMINISTRATIVEDIVISION.BARANGAYS",
        path: `${MODULES.ADMINISTRATIVEDIVISION.path}/${MODULES.ADMINISTRATIVEDIVISION.children.BARANGAYS.path}`,
        element: <Barangays />,
        handle: {
          permission: MODULES.ADMINISTRATIVEDIVISION.children.BARANGAYS.name,
        },
      },
      {
        id: "EXTRAS.CABINETS",
        path: `${MODULES.EXTRAS.path}/${MODULES.EXTRAS.children.CABINETS.path}`,
        element: <Cabinets />,
        handle: {
          permission: MODULES.EXTRAS.children.CABINETS.name,
        },
      },
      {
        id: "EXTRAS.DEGREES",
        path: `${MODULES.EXTRAS.path}/${MODULES.EXTRAS.children.DEGREES.path}`,
        element: <Degrees />,
        handle: {
          permission: MODULES.EXTRAS.children.DEGREES.name,
        },
      },
      {
        id: "EXTRAS.FILETYPES",
        path: `${MODULES.EXTRAS.path}/${MODULES.EXTRAS.children.FILETYPES.path}`,
        element: <FileTypes />,
        handle: {
          permission: MODULES.EXTRAS.children.FILETYPES.name,
        },
      },
      {
        id: "EXTRAS.HONORTITLES",
        path: `${MODULES.EXTRAS.path}/${MODULES.EXTRAS.children.HONORTITLES.path}`,
        element: <HonorTitles />,
        handle: {
          permission: MODULES.EXTRAS.children.HONORTITLES.name,
        },
      },
      {
        id: "ADMINISTRATIVEDIVISION.MUNICIPALITIES",
        path: `${MODULES.ADMINISTRATIVEDIVISION.path}/${MODULES.ADMINISTRATIVEDIVISION.children.MUNICIPALITIES.path}`,
        element: <Municipalities />,
        handle: {
          permission:
            MODULES.ADMINISTRATIVEDIVISION.children.MUNICIPALITIES.name,
        },
      },
      {
        id: "ADMINISTRATIVEDIVISION.SUBMUNICIPALITIES",
        path: `${MODULES.ADMINISTRATIVEDIVISION.path}/${MODULES.ADMINISTRATIVEDIVISION.children.SUBMUNICIPALITIES.path}`,
        element: <SubMunicipalities />,
        handle: {
          permission:
            MODULES.ADMINISTRATIVEDIVISION.children.SUBMUNICIPALITIES.name,
        },
      },
      {
        id: "EXTRAS.OBJECTIVES",
        path: `${MODULES.EXTRAS.path}/${MODULES.EXTRAS.children.OBJECTIVES.path}`,
        element: <Objectives />,
        handle: {
          permission: MODULES.EXTRAS.children.OBJECTIVES.name,
        },
      },
      {
        id: "EXTRAS.PREFIXES",
        path: `${MODULES.EXTRAS.path}/${MODULES.EXTRAS.children.PREFIXES.path}`,
        element: <Prefixes />,
        handle: {
          permission: MODULES.EXTRAS.children.PREFIXES.name,
        },
      },
      {
        id: "EXTRAS.PROGRAMS",
        path: `${MODULES.EXTRAS.path}/${MODULES.EXTRAS.children.PROGRAMS.path}`,
        element: <Programs />,
        handle: {
          permission: MODULES.EXTRAS.children.PROGRAMS.name,
        },
      },
      {
        id: "ADMINISTRATIVEDIVISION.PROVINCES",
        path: `${MODULES.ADMINISTRATIVEDIVISION.path}/${MODULES.ADMINISTRATIVEDIVISION.children.PROVINCES.path}`,
        element: <Provinces />,
        handle: {
          permission: MODULES.ADMINISTRATIVEDIVISION.children.PROVINCES.name,
        },
      },
      {
        id: "ADMINISTRATIVEDIVISION.REGIONS",
        path: `${MODULES.ADMINISTRATIVEDIVISION.path}/${MODULES.ADMINISTRATIVEDIVISION.children.REGIONS.path}`,
        element: <Regions />,
        handle: {
          permission: MODULES.ADMINISTRATIVEDIVISION.children.REGIONS.name,
        },
      },
      {
        id: "EXTRAS.SCHEDULES",
        path: `${MODULES.EXTRAS.path}/${MODULES.EXTRAS.children.SCHEDULES.path}`,
        element: <Schedules />,
        handle: {
          permission: MODULES.EXTRAS.children.SCHEDULES.name,
        },
      },
      {
        id: "EXTRAS.TOOLS",
        path: `${MODULES.EXTRAS.path}/${MODULES.EXTRAS.children.TOOLS.path}`,
        element: <Tools />,
        handle: {
          permission: MODULES.EXTRAS.children.TOOLS.name,
        },
      },
      {
        id: "EXTRAS.REQUISITION",
        path: `${MODULES.EXTRAS.path}/${MODULES.EXTRAS.children.REQUISITION.path}`,
        element: <RequisitionTypes />,
        handle: {
          permission: MODULES.EXTRAS.children.REQUISITION.name,
        },
      },
      {
        id: "EXTRAS.MOVEMENTTYPES",
        path: `${MODULES.EXTRAS.path}/${MODULES.EXTRAS.children.MOVEMENTTYPES.path}`,
        element: <MovementTypes />,
        handle: {
          permission: MODULES.EXTRAS.children.MOVEMENTTYPES.name,
        },
      },
      {
        id: "EXTRAS.WORKWEEKS",
        path: `${MODULES.EXTRAS.path}/${MODULES.EXTRAS.children.WORKWEEKS.path}`,
        element: <WorkWeeks />,
        handle: {
          permission: MODULES.EXTRAS.children.WORKWEEKS.name,
        },
      },
      {
        id: "EXTRAS.WORKHOURS",
        path: `${MODULES.EXTRAS.path}/${MODULES.EXTRAS.children.WORKHOURS.path}`,
        element: <WorkHours />,
        handle: {
          permission: MODULES.EXTRAS.children.WORKHOURS.name,
        },
      },
      {
        id: "EXTRAS.RESTDAYS",
        path: `${MODULES.EXTRAS.path}/${MODULES.EXTRAS.children.RESTDAYS.path}`,
        element: <RestDays />,
        handle: {
          permission: MODULES.EXTRAS.children.RESTDAYS.name,
        },
      },
      {
        id: "EXTRAS.SEPARATIONTYPES",
        path: `${MODULES.EXTRAS.path}/${MODULES.EXTRAS.children.SEPARATIONTYPES.path}`,
        element: <SeparationTypes />,
        handle: {
          permission: MODULES.EXTRAS.children.SEPARATIONTYPES.name,
        },
      },
      {
        id: "EXTRAS.SEPARATIONREASONS",
        path: `${MODULES.EXTRAS.path}/${MODULES.EXTRAS.children.SEPARATIONREASONS.path}`,
        element: <SeparationReasons />,
        handle: {
          permission: MODULES.EXTRAS.children.SEPARATIONREASONS.name,
        },
      },
      {
        id: "EMPLOYEES.EMPLOYEEINFORMATION",
        path: `${MODULES.EMPLOYEES.path}/${MODULES.EMPLOYEES.children.EMPLOYEEINFORMATION.path}`,
        element: <EMPLOYEEINFORMATION />,
        handle: {
          permission: MODULES.EMPLOYEES.children.EMPLOYEEINFORMATION.name,
        },
      },
      {
        id: "EMPLOYEES.ENABLEEDIT",
        path: `${MODULES.EMPLOYEES.path}/${MODULES.EMPLOYEES.children.ENABLEEDIT.path}`,
        element: <EnableEdit />,
        handle: {
          permission: MODULES.EMPLOYEES.children.ENABLEEDIT.name,
        },
      },
    ],
  },
];
