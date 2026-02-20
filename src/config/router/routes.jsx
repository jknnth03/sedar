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
import SubmissionApproval from "../../pages/approvals/mrfApproval/SubmissionApproval.jsx";
import MrfReceiving from "../../pages/receiving/mrf/MrfReceiving.jsx";
import PENDINGREGISTRATION from "../../pages/pendingRegistration/PendingRegistration.jsx";
import RegistrationApproval from "../../pages/approvals/registrationApproval/RegistrationApproval.jsx";
import DATACHANGEMAINCONTAINER from "../../pages/forms/201datachange/DataChangeMainContainer.jsx";
import MrfMainContainer from "../../pages/forms/manpowerform/MrfMainContainer.jsx";
import DAForm from "../../pages/forms/developmentalAssignmentForm/daform/DAForm.jsx";
import KPI from "../../pages/masterlist/kpi/Kpi.jsx";
import MovementTypes from "../../pages/extras/MovementTypes.jsx";
import DataChangeApproval from "../../pages/approvals/dataChangeApproval/DataChangeApproval.jsx";
import MASTERDATAAUTHORITY from "../../pages/forms/mda/mdaform/MDA.jsx";
import EnableEdit from "../../components/modal/employee/multiFormModal/EnableEdit.jsx";
import Statuses from "../../pages/employees/Statuses.jsx";
import MRFMonitoring from "../../pages/monitoring/MRF/MRFMonitoring.jsx";
import DataChangeMonitoring from "../../pages/monitoring/datachange/DataChangeMonitoring.jsx";
import MDAMonitoring from "../../pages/monitoring/MDA/MDAMonitoring.jsx";
import CatOne from "../../pages/developmental-assignment/catone/CatOne.jsx";
import CatTwo from "../../pages/developmental-assignment/cattwo/CatTwo.jsx";
import Pdp from "../../pages/developmental-assignment/pdp/Pdp.jsx";
import CatOneApproval from "../../pages/approvals/da-task/CatOneApproval.jsx";
import CatTwoApproval from "../../pages/approvals/da-task/CatTwoApproval.jsx";
import PdpApproval from "../../pages/approvals/da-task/PdpApproval.jsx";
import WorkWeeks from "../../pages/extras/WorkWeeks.jsx";
import WorkHours from "../../pages/extras/WorkHours.jsx";
import RestDays from "../../pages/extras/RestDays.jsx";
import SeparationTypes from "../../pages/extras/SeparationTypes.jsx";
import SeparationReasons from "../../pages/extras/SeparationReasons.jsx";
import MDADA from "../../pages/forms/mda/mda-da/MDADA.jsx";
import DARecommendation from "../../pages/forms/developmentalAssignmentForm/darecommendation/DARecommendation.jsx";
import DaFormReceiving from "../../pages/receiving/daform/DaFormReceiving.jsx";
import Redirect from "../../pages/login/Redirect.jsx";
import CatOneTemplate from "../../pages/assessment-templates/CatOneTemplate.jsx";
import CatTwoTemplate from "../../pages/assessment-templates/CatTwoTemplate.jsx";
import PdpTemplate from "../../pages/assessment-templates/PDPTemplate.jsx";
import EVALUATIONFORM from "../../pages/forms/Evaluation/evaluation-form/EvaluationForm.jsx";
import MDARecommendation from "../../pages/forms/mda/mdarecommendation/MDARecommendation.jsx";
import EvaluationRecommendation from "../../pages/forms/Evaluation/evaluationRecommendation/EvaluationRecommendation.jsx";
import MDAEvaluationRecommendation from "../../pages/forms/mda/mdaEvaluationRecommendation/MDAEvaluationRecommendation.jsx";
import BiAnnualPerformance from "../../pages/forms/biAnnualPerformance/BiAnnualPerformance.jsx";
import BiAnnualTemplate from "../../pages/assessment-templates/BiAnnualTemplate.jsx";
import BiAnnualApproval from "../../pages/approvals/bi-annualApproval/BiAnnualApproval.jsx";
import Nationalities from "../../pages/extras/Nationalities.jsx";
import DevelopmentalAssignmentForm from "../../pages/forms/developmentalAssignmentForm/DevelopmentAssignmentForm.jsx";
import MasterDataAuthority from "../../pages/forms/mda/MasterDataAuthority.jsx";
import MdaApproval from "../../pages/approvals/mda/mdaApproval/MdaApproval.jsx";
import DAMDAApproval from "../../pages/approvals/mda/daMDAApproval/DAMDAApproval.jsx";
import MdaRecommendationApproval from "../../pages/approvals/mda/mdaRecommendation/MDARecommendationApproval.jsx";
import MDAEvaluationApproval from "../../pages/approvals/mda/mdaEvaluationRecommendationApproval/MDAEvaluationApproval.jsx";
import DAFormApproval from "../../pages/approvals/developmentalAssignment/daform/DAFormApproval.jsx";
import DaRecommendationApproval from "../../pages/approvals/developmentalAssignment/da-recommendation/DaRecommendationApproval.jsx";
import EvaluationApproval from "../../pages/approvals/evaluation/evaluationFormApproval/EvaluationApproval.jsx";
import EvaluationRecommendationApproval from "../../pages/approvals/evaluation/evaluationRecommendationApproval/EvaluationRecommendationApproval.jsx";
import MDA from "../../pages/approvals/mda/MDA.jsx";
import DevelopmentalAssignment from "../../pages/approvals/developmentalAssignment/DevelopmentalAssignment.jsx";
import Evaluation from "../../pages/approvals/evaluation/Evaluation.jsx";
import Status from "../../pages/extras/Status.jsx";
import PdpTwo from "../../pages/developmental-assignment/pdptwo/PdpTwo.jsx";
import RandFile from "../../pages/forms/biAnnualPerformance/rank/RankandFile.jsx";
import SupervisoryLevel from "../../pages/forms/biAnnualPerformance/supervisory/SupervisoryLevel.jsx";
import PdpTwoApproval from "../../pages/approvals/da-task/PdpTwoApproval.jsx";

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
    path: "/redirect",
    element: <Redirect />,
    id: "REDIRECT",
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
          permission: MODULES.DASHBOARD.permissionId,
        },
      },
      {
        id: "USERMANAGEMENT.USER",
        path: `${MODULES.USERMANAGEMENT.path}/${MODULES.USERMANAGEMENT.children.USER.path}`,
        element: <User />,
        handle: {
          permission: MODULES.USERMANAGEMENT.children.USER.permissionId,
        },
      },
      {
        id: "USERMANAGEMENT.ROLES",
        path: `${MODULES.USERMANAGEMENT.path}/${MODULES.USERMANAGEMENT.children.ROLES.path}`,
        element: <Roles />,
        handle: {
          permission: MODULES.USERMANAGEMENT.children.ROLES.permissionId,
        },
      },
      {
        id: "APPROVALSETTINGS.APPROVALFORM",
        path: `${MODULES.APPROVALSETTINGS.path}/${MODULES.APPROVALSETTINGS.children.APPROVALFORM.path}`,
        element: <ApprovalForm />,
        handle: {
          permission:
            MODULES.APPROVALSETTINGS.children.APPROVALFORM.permissionId,
        },
      },
      {
        id: "APPROVALSETTINGS.APPROVALFLOW",
        path: `${MODULES.APPROVALSETTINGS.path}/${MODULES.APPROVALSETTINGS.children.APPROVALFLOW.path}`,
        element: <ApprovalFlow />,
        handle: {
          permission:
            MODULES.APPROVALSETTINGS.children.APPROVALFLOW.permissionId,
        },
      },
      {
        id: "ASSESSMENTTEMPLATES.CATONETEMPLATE",
        path: `${MODULES.ASSESSMENTTEMPLATES.path}/${MODULES.ASSESSMENTTEMPLATES.children.CATONETEMPLATE.path}`,
        element: <CatOneTemplate />,
        handle: {
          permission:
            MODULES.ASSESSMENTTEMPLATES.children.CATONETEMPLATE.permissionId,
        },
      },
      {
        id: "ASSESSMENTTEMPLATES.CATTWOTEMPLATE",
        path: `${MODULES.ASSESSMENTTEMPLATES.path}/${MODULES.ASSESSMENTTEMPLATES.children.CATTWOTEMPLATE.path}`,
        element: <CatTwoTemplate />,
        handle: {
          permission:
            MODULES.ASSESSMENTTEMPLATES.children.CATTWOTEMPLATE.permissionId,
        },
      },
      {
        id: "ASSESSMENTTEMPLATES.PDPTEMPLATE",
        path: `${MODULES.ASSESSMENTTEMPLATES.path}/${MODULES.ASSESSMENTTEMPLATES.children.PDPTEMPLATE.path}`,
        element: <PdpTemplate />,
        handle: {
          permission:
            MODULES.ASSESSMENTTEMPLATES.children.PDPTEMPLATE.permissionId,
        },
      },
      {
        id: "ASSESSMENTTEMPLATES.BIANNUALTEMPLATE",
        path: `${MODULES.ASSESSMENTTEMPLATES.path}/${MODULES.ASSESSMENTTEMPLATES.children.BIANNUALTEMPLATE.path}`,
        element: <BiAnnualTemplate />,
        handle: {
          permission:
            MODULES.ASSESSMENTTEMPLATES.children.BIANNUALTEMPLATE.permissionId,
        },
      },
      {
        id: "REQUEST.MRFMAINCONTAINER",
        path: `${MODULES.REQUEST.path}/${MODULES.REQUEST.children.MRFMAINCONTAINER.path}`,
        element: <MrfMainContainer />,
        handle: {
          permission: MODULES.REQUEST.children.MRFMAINCONTAINER.permissionId,
        },
      },
      {
        id: "REQUEST.DEVELOPMENTALASSIGNMENTFORM",
        path: `${MODULES.REQUEST.path}/${MODULES.REQUEST.children.DEVELOPMENTALASSIGNMENTFORM.path}`,
        element: <DevelopmentalAssignmentForm />,
        handle: {
          permission:
            MODULES.REQUEST.children.DEVELOPMENTALASSIGNMENTFORM.permissionId,
        },
        children: [
          {
            id: "REQUEST.DEVELOPMENTALASSIGNMENTFORM.DAFORM",
            path: "daform",
            element: <DAForm />,
            handle: {
              permission:
                MODULES.REQUEST.children.DEVELOPMENTALASSIGNMENTFORM.children
                  .DAFORM.permissionId,
            },
          },
          {
            id: "REQUEST.DEVELOPMENTALASSIGNMENTFORM.DARECOMMENDATION",
            path: "darecommendation",
            element: <DARecommendation />,
            handle: {
              permission:
                MODULES.REQUEST.children.DEVELOPMENTALASSIGNMENTFORM.children
                  .DARECOMMENDATION.permissionId,
            },
          },
        ],
      },
      {
        id: "REQUEST.DATACHANGEMAINCONTAINER",
        path: `${MODULES.REQUEST.path}/${MODULES.REQUEST.children.DATACHANGEMAINCONTAINER.path}`,
        element: <DATACHANGEMAINCONTAINER />,
        handle: {
          permission:
            MODULES.REQUEST.children.DATACHANGEMAINCONTAINER.permissionId,
        },
      },
      {
        id: "REQUEST.MASTERDATAAUTHORITY",
        path: `${MODULES.REQUEST.path}/${MODULES.REQUEST.children.MASTERDATAAUTHORITY.path}`,
        element: <MasterDataAuthority />,
        handle: {
          permission: MODULES.REQUEST.children.MASTERDATAAUTHORITY.permissionId,
        },
        children: [
          {
            id: "REQUEST.MASTERDATAAUTHORITY.MDAFORM",
            path: "mdaform",
            element: <MASTERDATAAUTHORITY />,
            handle: {
              permission:
                MODULES.REQUEST.children.MASTERDATAAUTHORITY.children.MDAFORM
                  .permissionId,
            },
          },
          {
            id: "REQUEST.MASTERDATAAUTHORITY.MDADA",
            path: "mdada",
            element: <MDADA />,
            handle: {
              permission:
                MODULES.REQUEST.children.MASTERDATAAUTHORITY.children.MDADA
                  .permissionId,
            },
          },
          {
            id: "REQUEST.MASTERDATAAUTHORITY.MDARECOMMENDATION",
            path: "mdarecommendation",
            element: <MDARecommendation />,
            handle: {
              permission:
                MODULES.REQUEST.children.MASTERDATAAUTHORITY.children
                  .MDARECOMMENDATION.permissionId,
            },
          },
          {
            id: "REQUEST.MASTERDATAAUTHORITY.MDAEVALUATIONRECOMMENDATION",
            path: "mdaevaluationrecommendation",
            element: <MDAEvaluationRecommendation />,
            handle: {
              permission:
                MODULES.REQUEST.children.MASTERDATAAUTHORITY.children
                  .MDAEVALUATIONRECOMMENDATION.permissionId,
            },
          },
        ],
      },
      {
        id: "REQUEST.PENDINGREGISTRATION",
        path: `${MODULES.REQUEST.path}/${MODULES.REQUEST.children.PENDINGREGISTRATION.path}`,
        element: <PENDINGREGISTRATION />,
        handle: {
          permission: MODULES.REQUEST.children.PENDINGREGISTRATION.permissionId,
        },
      },
      {
        id: "REQUEST.EVALUATIONFORM",
        path: `${MODULES.REQUEST.path}/${MODULES.REQUEST.children.EVALUATIONFORM.path}`,
        element: <Evaluation />,
        handle: {
          permission: MODULES.REQUEST.children.EVALUATIONFORM.permissionId,
        },
        children: [
          {
            id: "REQUEST.EVALUATIONFORM.EVALUATIONFORMCHILD",
            path: "evaluationform",
            element: <EVALUATIONFORM />,
            handle: {
              permission:
                MODULES.REQUEST.children.EVALUATIONFORM.children
                  .EVALUATIONFORMCHILD.permissionId,
            },
          },
          {
            id: "REQUEST.EVALUATIONFORM.EVALUATIONRECOMMENDATION",
            path: "evaluationrecommendation",
            element: <EvaluationRecommendation />,
            handle: {
              permission:
                MODULES.REQUEST.children.EVALUATIONFORM.children
                  .EVALUATIONRECOMMENDATION.permissionId,
            },
          },
        ],
      },
      {
        id: "REQUEST.BIANNUALPERFORMANCE",
        path: `${MODULES.REQUEST.path}/${MODULES.REQUEST.children.BIANNUALPERFORMANCE.path}`,
        element: <BiAnnualPerformance />,
        handle: {
          permission: MODULES.REQUEST.children.BIANNUALPERFORMANCE.permissionId,
        },
        children: [
          {
            id: "REQUEST.BIANNUALPERFORMANCE.RANKANDFILE",
            path: "rankandfile",
            element: <RandFile />,
            handle: {
              permission:
                MODULES.REQUEST.children.BIANNUALPERFORMANCE.children
                  .RANKANDFILE.permissionId,
            },
          },
          {
            id: "REQUEST.BIANNUALPERFORMANCE.SUPERVISORYLEVEL",
            path: "supervisorylevel",
            element: <SupervisoryLevel />,
            handle: {
              permission:
                MODULES.REQUEST.children.BIANNUALPERFORMANCE.children
                  .SUPERVISORYLEVEL.permissionId,
            },
          },
        ],
      },
      {
        id: "REQUESTMONITORING.MRFMONITORING",
        path: `${MODULES.REQUESTMONITORING.path}/${MODULES.REQUESTMONITORING.children.MRFMONITORING.path}`,
        element: <MRFMonitoring />,
        handle: {
          permission:
            MODULES.REQUESTMONITORING.children.MRFMONITORING.permissionId,
        },
      },
      {
        id: "REQUESTMONITORING.DATACHANGEMONITORING",
        path: `${MODULES.REQUESTMONITORING.path}/${MODULES.REQUESTMONITORING.children.DATACHANGEMONITORING.path}`,
        element: <DataChangeMonitoring />,
        handle: {
          permission:
            MODULES.REQUESTMONITORING.children.DATACHANGEMONITORING
              .permissionId,
        },
      },
      {
        id: "REQUESTMONITORING.MDAMONITORING",
        path: `${MODULES.REQUESTMONITORING.path}/${MODULES.REQUESTMONITORING.children.MDAMONITORING.path}`,
        element: <MDAMonitoring />,
        handle: {
          permission:
            MODULES.REQUESTMONITORING.children.MDAMONITORING.permissionId,
        },
      },
      {
        id: "MASTERLIST.KPI",
        path: `${MODULES.MASTERLIST.path}/${MODULES.MASTERLIST.children.KPI.path}`,
        element: <KPI />,
        handle: {
          permission: MODULES.MASTERLIST.children.KPI.permissionId,
        },
      },
      {
        id: "APPROVING.SUBMISSIONAPPROVAL",
        path: `${MODULES.APPROVING.path}/${MODULES.APPROVING.children.SUBMISSIONAPPROVAL.path}`,
        element: <SubmissionApproval />,
        handle: {
          permission:
            MODULES.APPROVING.children.SUBMISSIONAPPROVAL.permissionId,
        },
      },
      {
        id: "APPROVING.REGISTRATIONAPPROVAL",
        path: `${MODULES.APPROVING.path}/${MODULES.APPROVING.children.REGISTRATIONAPPROVAL.path}`,
        element: <RegistrationApproval />,
        handle: {
          permission:
            MODULES.APPROVING.children.REGISTRATIONAPPROVAL.permissionId,
        },
      },
      {
        id: "APPROVING.DATACHANGEAPPROVAL",
        path: `${MODULES.APPROVING.path}/${MODULES.APPROVING.children.DATACHANGEAPPROVAL.path}`,
        element: <DataChangeApproval />,
        handle: {
          permission:
            MODULES.APPROVING.children.DATACHANGEAPPROVAL.permissionId,
        },
      },
      {
        id: "APPROVING.MDA",
        path: `${MODULES.APPROVING.path}/${MODULES.APPROVING.children.MDA.path}`,
        element: <MDA />,
        handle: {
          permission: MODULES.APPROVING.children.MDA.permissionId,
        },
        children: [
          {
            id: "APPROVING.MDA.MDAAPPROVAL",
            path: "mdaapproval",
            element: <MdaApproval />,
            handle: {
              permission:
                MODULES.APPROVING.children.MDA.children.MDAAPPROVAL
                  .permissionId,
            },
          },
          {
            id: "APPROVING.MDA.DAMDAAPPROVAL",
            path: "damdaapproval",
            element: <DAMDAApproval />,
            handle: {
              permission:
                MODULES.APPROVING.children.MDA.children.DAMDAAPPROVAL
                  .permissionId,
            },
          },
          {
            id: "APPROVING.MDA.MDARECOMMENDATIONAPPROVAL",
            path: "mdarecommendationapproval",
            element: <MdaRecommendationApproval />,
            handle: {
              permission:
                MODULES.APPROVING.children.MDA.children
                  .MDARECOMMENDATIONAPPROVAL.permissionId,
            },
          },
          {
            id: "APPROVING.MDA.MDAEVALUATIONAPPROVAL",
            path: "mdaevaluationapproval",
            element: <MDAEvaluationApproval />,
            handle: {
              permission:
                MODULES.APPROVING.children.MDA.children.MDAEVALUATIONAPPROVAL
                  .permissionId,
            },
          },
        ],
      },
      {
        id: "APPROVING.DEVELOPMENTALASSIGNMENT",
        path: `${MODULES.APPROVING.path}/${MODULES.APPROVING.children.DEVELOPMENTALASSIGNMENT.path}`,
        element: <DevelopmentalAssignment />,
        handle: {
          permission:
            MODULES.APPROVING.children.DEVELOPMENTALASSIGNMENT.permissionId,
        },
        children: [
          {
            id: "APPROVING.DEVELOPMENTALASSIGNMENT.DAFORMAPPROVAL",
            path: "daformapproval",
            element: <DAFormApproval />,
            handle: {
              permission:
                MODULES.APPROVING.children.DEVELOPMENTALASSIGNMENT.children
                  .DAFORMAPPROVAL.permissionId,
            },
          },
          {
            id: "APPROVING.DEVELOPMENTALASSIGNMENT.DARECOMMENDATIONAPPROVAL",
            path: "darecommendationapproval",
            element: <DaRecommendationApproval />,
            handle: {
              permission:
                MODULES.APPROVING.children.DEVELOPMENTALASSIGNMENT.children
                  .DARECOMMENDATIONAPPROVAL.permissionId,
            },
          },
        ],
      },
      {
        id: "APPROVING.EVALUATION",
        path: `${MODULES.APPROVING.path}/${MODULES.APPROVING.children.EVALUATION.path}`,
        element: <Evaluation />,
        handle: {
          permission: MODULES.APPROVING.children.EVALUATION.permissionId,
        },
        children: [
          {
            id: "APPROVING.EVALUATION.EVALUATIONAPPROVAL",
            path: "evaluationapproval",
            element: <EvaluationApproval />,
            handle: {
              permission:
                MODULES.APPROVING.children.EVALUATION.children
                  .EVALUATIONAPPROVAL.permissionId,
            },
          },
          {
            id: "APPROVING.EVALUATION.EVALUATIONRECOMMENDATIONAPPROVAL",
            path: "evaluationrecommendationapproval",
            element: <EvaluationRecommendationApproval />,
            handle: {
              permission:
                MODULES.APPROVING.children.EVALUATION.children
                  .EVALUATIONRECOMMENDATIONAPPROVAL.permissionId,
            },
          },
        ],
      },
      {
        id: "APPROVING.BIANNUALAPPROVAL",
        path: `${MODULES.APPROVING.path}/${MODULES.APPROVING.children.BIANNUALAPPROVAL.path}`,
        element: <BiAnnualApproval />,
        handle: {
          permission: MODULES.APPROVING.children.BIANNUALAPPROVAL.permissionId,
        },
      },
      {
        id: "APPROVING.CATONEAPPROVAL",
        path: `${MODULES.APPROVING.path}/${MODULES.APPROVING.children.CATONEAPPROVAL.path}`,
        element: <CatOneApproval />,
        handle: {
          permission: MODULES.APPROVING.children.CATONEAPPROVAL.permissionId,
        },
      },
      {
        id: "APPROVING.CATTWOAPPROVAL",
        path: `${MODULES.APPROVING.path}/${MODULES.APPROVING.children.CATTWOAPPROVAL.path}`,
        element: <CatTwoApproval />,
        handle: {
          permission: MODULES.APPROVING.children.CATTWOAPPROVAL.permissionId,
        },
      },
      {
        id: "APPROVING.PDPAPPROVAL",
        path: `${MODULES.APPROVING.path}/${MODULES.APPROVING.children.PDPAPPROVAL.path}`,
        element: <PdpApproval />,
        handle: {
          permission: MODULES.APPROVING.children.PDPAPPROVAL.permissionId,
        },
      },
      {
        id: "APPROVING.PDPTWOAPPROVAL",
        path: `${MODULES.APPROVING.path}/pdptwoapproval`,
        element: <PdpTwoApproval />,
        handle: {
          permission: "APPROVING.PDPTWOAPPROVAL",
        },
      },
      {
        id: "RECEIVING.PENDINGFORMS",
        path: `${MODULES.RECEIVING.path}/${MODULES.RECEIVING.children.PENDINGFORMS.path}`,
        element: <MrfReceiving />,
        handle: {
          permission: MODULES.RECEIVING.children.PENDINGFORMS.permissionId,
        },
      },
      {
        id: "RECEIVING.DAFORMRECEIVING",
        path: `${MODULES.RECEIVING.path}/${MODULES.RECEIVING.children.DAFORMRECEIVING.path}`,
        element: <DaFormReceiving />,
        handle: {
          permission: MODULES.RECEIVING.children.DAFORMRECEIVING.permissionId,
        },
      },
      {
        id: "MASTERLIST.ONERDF",
        path: `${MODULES.MASTERLIST.path}/${MODULES.MASTERLIST.children.ONERDF.path}`,
        element: <ONERDF />,
        handle: {
          permission: MODULES.MASTERLIST.children.ONERDF.permissionId,
        },
      },
      {
        id: "MASTERLIST.POSITIONS",
        path: `${MODULES.MASTERLIST.path}/${MODULES.MASTERLIST.children.POSITIONS.path}`,
        element: <Positions />,
        handle: {
          permission: MODULES.MASTERLIST.children.POSITIONS.permissionId,
        },
      },
      {
        id: "DEVELOPMENTALASSIGNMENT.CATONE",
        path: `${MODULES.DEVELOPMENTALASSIGNMENT.path}/${MODULES.DEVELOPMENTALASSIGNMENT.children.CATONE.path}`,
        element: <CatOne />,
        handle: {
          permission:
            MODULES.DEVELOPMENTALASSIGNMENT.children.CATONE.permissionId,
        },
      },
      {
        id: "DEVELOPMENTALASSIGNMENT.CATTWO",
        path: `${MODULES.DEVELOPMENTALASSIGNMENT.path}/${MODULES.DEVELOPMENTALASSIGNMENT.children.CATTWO.path}`,
        element: <CatTwo />,
        handle: {
          permission:
            MODULES.DEVELOPMENTALASSIGNMENT.children.CATTWO.permissionId,
        },
      },
      {
        id: "DEVELOPMENTALASSIGNMENT.PDP",
        path: `${MODULES.DEVELOPMENTALASSIGNMENT.path}/${MODULES.DEVELOPMENTALASSIGNMENT.children.PDP.path}`,
        element: <Pdp />,
        handle: {
          permission: MODULES.DEVELOPMENTALASSIGNMENT.children.PDP.permissionId,
        },
      },
      {
        id: "DEVELOPMENTALASSIGNMENT.PDPTWO",
        path: `${MODULES.DEVELOPMENTALASSIGNMENT.path}/${MODULES.DEVELOPMENTALASSIGNMENT.children.PDPTWO.path}`,
        element: <PdpTwo />,
        handle: {
          permission:
            MODULES.DEVELOPMENTALASSIGNMENT.children.PDPTWO.permissionId,
        },
      },
      {
        id: "EXTRAS.JOBBANDS",
        path: `${MODULES.EXTRAS.path}/${MODULES.EXTRAS.children.JOBBANDS.path}`,
        element: <Jobbands />,
        handle: {
          permission: MODULES.EXTRAS.children.JOBBANDS.permissionId,
        },
      },
      {
        id: "EXTRAS.JOBLEVELS",
        path: `${MODULES.EXTRAS.path}/${MODULES.EXTRAS.children.JOBLEVELS.path}`,
        element: <Joblevels />,
        handle: {
          permission: MODULES.EXTRAS.children.JOBLEVELS.permissionId,
        },
      },
      {
        id: "EXTRAS.JOBRATES",
        path: `${MODULES.EXTRAS.path}/${MODULES.EXTRAS.children.JOBRATES.path}`,
        element: <Jobrates />,
        handle: {
          permission: MODULES.EXTRAS.children.JOBRATES.permissionId,
        },
      },
      {
        id: "EXTRAS.TITLES",
        path: `${MODULES.EXTRAS.path}/${MODULES.EXTRAS.children.TITLES.path}`,
        element: <Titles />,
        handle: {
          permission: MODULES.EXTRAS.children.TITLES.permissionId,
        },
      },
      {
        id: "EXTRAS.TEAMS",
        path: `${MODULES.EXTRAS.path}/${MODULES.EXTRAS.children.TEAMS.path}`,
        element: <Teams />,
        handle: {
          permission: MODULES.EXTRAS.children.TEAMS.permissionId,
        },
      },
      {
        id: "EXTRAS.RELIGIONS",
        path: `${MODULES.EXTRAS.path}/${MODULES.EXTRAS.children.RELIGIONS.path}`,
        element: <Religions />,
        handle: {
          permission: MODULES.EXTRAS.children.RELIGIONS.permissionId,
        },
      },
      {
        id: "EXTRAS.ATTAINMENTS",
        path: `${MODULES.EXTRAS.path}/${MODULES.EXTRAS.children.ATTAINMENTS.path}`,
        element: <Attainments />,
        handle: {
          permission: MODULES.EXTRAS.children.ATTAINMENTS.permissionId,
        },
      },
      {
        id: "EXTRAS.BANKS",
        path: `${MODULES.EXTRAS.path}/${MODULES.EXTRAS.children.BANKS.path}`,
        element: <Banks />,
        handle: {
          permission: MODULES.EXTRAS.children.BANKS.permissionId,
        },
      },
      {
        id: "ADMINISTRATIVEDIVISION.BARANGAYS",
        path: `${MODULES.ADMINISTRATIVEDIVISION.path}/${MODULES.ADMINISTRATIVEDIVISION.children.BARANGAYS.path}`,
        element: <Barangays />,
        handle: {
          permission:
            MODULES.ADMINISTRATIVEDIVISION.children.BARANGAYS.permissionId,
        },
      },
      {
        id: "EXTRAS.CABINETS",
        path: `${MODULES.EXTRAS.path}/${MODULES.EXTRAS.children.CABINETS.path}`,
        element: <Cabinets />,
        handle: {
          permission: MODULES.EXTRAS.children.CABINETS.permissionId,
        },
      },
      {
        id: "EXTRAS.DEGREES",
        path: `${MODULES.EXTRAS.path}/${MODULES.EXTRAS.children.DEGREES.path}`,
        element: <Degrees />,
        handle: {
          permission: MODULES.EXTRAS.children.DEGREES.permissionId,
        },
      },
      {
        id: "EXTRAS.FILETYPES",
        path: `${MODULES.EXTRAS.path}/${MODULES.EXTRAS.children.FILETYPES.path}`,
        element: <FileTypes />,
        handle: {
          permission: MODULES.EXTRAS.children.FILETYPES.permissionId,
        },
      },
      {
        id: "EXTRAS.HONORTITLES",
        path: `${MODULES.EXTRAS.path}/${MODULES.EXTRAS.children.HONORTITLES.path}`,
        element: <HonorTitles />,
        handle: {
          permission: MODULES.EXTRAS.children.HONORTITLES.permissionId,
        },
      },
      {
        id: "EXTRAS.NATIONALITIES",
        path: `${MODULES.EXTRAS.path}/${MODULES.EXTRAS.children.NATIONALITIES.path}`,
        element: <Nationalities />,
        handle: {
          permission: MODULES.EXTRAS.children.NATIONALITIES.permissionId,
        },
      },
      {
        id: "ADMINISTRATIVEDIVISION.MUNICIPALITIES",
        path: `${MODULES.ADMINISTRATIVEDIVISION.path}/${MODULES.ADMINISTRATIVEDIVISION.children.MUNICIPALITIES.path}`,
        element: <Municipalities />,
        handle: {
          permission:
            MODULES.ADMINISTRATIVEDIVISION.children.MUNICIPALITIES.permissionId,
        },
      },
      {
        id: "ADMINISTRATIVEDIVISION.SUBMUNICIPALITIES",
        path: `${MODULES.ADMINISTRATIVEDIVISION.path}/${MODULES.ADMINISTRATIVEDIVISION.children.SUBMUNICIPALITIES.path}`,
        element: <SubMunicipalities />,
        handle: {
          permission:
            MODULES.ADMINISTRATIVEDIVISION.children.SUBMUNICIPALITIES
              .permissionId,
        },
      },
      {
        id: "EXTRAS.OBJECTIVES",
        path: `${MODULES.EXTRAS.path}/${MODULES.EXTRAS.children.OBJECTIVES.path}`,
        element: <Objectives />,
        handle: {
          permission: MODULES.EXTRAS.children.OBJECTIVES.permissionId,
        },
      },
      {
        id: "EXTRAS.PREFIXES",
        path: `${MODULES.EXTRAS.path}/${MODULES.EXTRAS.children.PREFIXES.path}`,
        element: <Prefixes />,
        handle: {
          permission: MODULES.EXTRAS.children.PREFIXES.permissionId,
        },
      },
      {
        id: "EXTRAS.PROGRAMS",
        path: `${MODULES.EXTRAS.path}/${MODULES.EXTRAS.children.PROGRAMS.path}`,
        element: <Programs />,
        handle: {
          permission: MODULES.EXTRAS.children.PROGRAMS.permissionId,
        },
      },
      {
        id: "ADMINISTRATIVEDIVISION.PROVINCES",
        path: `${MODULES.ADMINISTRATIVEDIVISION.path}/${MODULES.ADMINISTRATIVEDIVISION.children.PROVINCES.path}`,
        element: <Provinces />,
        handle: {
          permission:
            MODULES.ADMINISTRATIVEDIVISION.children.PROVINCES.permissionId,
        },
      },
      {
        id: "ADMINISTRATIVEDIVISION.REGIONS",
        path: `${MODULES.ADMINISTRATIVEDIVISION.path}/${MODULES.ADMINISTRATIVEDIVISION.children.REGIONS.path}`,
        element: <Regions />,
        handle: {
          permission:
            MODULES.ADMINISTRATIVEDIVISION.children.REGIONS.permissionId,
        },
      },
      {
        id: "EXTRAS.SCHEDULES",
        path: `${MODULES.EXTRAS.path}/${MODULES.EXTRAS.children.SCHEDULES.path}`,
        element: <Schedules />,
        handle: {
          permission: MODULES.EXTRAS.children.SCHEDULES.permissionId,
        },
      },
      {
        id: "EXTRAS.TOOLS",
        path: `${MODULES.EXTRAS.path}/${MODULES.EXTRAS.children.TOOLS.path}`,
        element: <Tools />,
        handle: {
          permission: MODULES.EXTRAS.children.TOOLS.permissionId,
        },
      },
      {
        id: "EXTRAS.REQUISITION",
        path: `${MODULES.EXTRAS.path}/${MODULES.EXTRAS.children.REQUISITION.path}`,
        element: <RequisitionTypes />,
        handle: {
          permission: MODULES.EXTRAS.children.REQUISITION.permissionId,
        },
      },
      {
        id: "EXTRAS.MOVEMENTTYPES",
        path: `${MODULES.EXTRAS.path}/${MODULES.EXTRAS.children.MOVEMENTTYPES.path}`,
        element: <MovementTypes />,
        handle: {
          permission: MODULES.EXTRAS.children.MOVEMENTTYPES.permissionId,
        },
      },
      {
        id: "EXTRAS.WORKWEEKS",
        path: `${MODULES.EXTRAS.path}/${MODULES.EXTRAS.children.WORKWEEKS.path}`,
        element: <WorkWeeks />,
        handle: {
          permission: MODULES.EXTRAS.children.WORKWEEKS.permissionId,
        },
      },
      {
        id: "EXTRAS.WORKHOURS",
        path: `${MODULES.EXTRAS.path}/${MODULES.EXTRAS.children.WORKHOURS.path}`,
        element: <WorkHours />,
        handle: {
          permission: MODULES.EXTRAS.children.WORKHOURS.permissionId,
        },
      },
      {
        id: "EXTRAS.RESTDAYS",
        path: `${MODULES.EXTRAS.path}/${MODULES.EXTRAS.children.RESTDAYS.path}`,
        element: <RestDays />,
        handle: {
          permission: MODULES.EXTRAS.children.RESTDAYS.permissionId,
        },
      },
      {
        id: "EXTRAS.SEPARATIONTYPES",
        path: `${MODULES.EXTRAS.path}/${MODULES.EXTRAS.children.SEPARATIONTYPES.path}`,
        element: <SeparationTypes />,
        handle: {
          permission: MODULES.EXTRAS.children.SEPARATIONTYPES.permissionId,
        },
      },
      {
        id: "EXTRAS.SEPARATIONREASONS",
        path: `${MODULES.EXTRAS.path}/${MODULES.EXTRAS.children.SEPARATIONREASONS.path}`,
        element: <SeparationReasons />,
        handle: {
          permission: MODULES.EXTRAS.children.SEPARATIONREASONS.permissionId,
        },
      },
      {
        id: "EXTRAS.STATUSES",
        path: `${MODULES.EXTRAS.path}/${MODULES.EXTRAS.children.STATUSES.path}`,
        element: <Status />,
        handle: {
          permission: MODULES.EXTRAS.children.STATUSES.permissionId,
        },
      },
      {
        id: "EMPLOYEES.EMPLOYEEINFORMATION",
        path: `${MODULES.EMPLOYEES.path}/${MODULES.EMPLOYEES.children.EMPLOYEEINFORMATION.path}`,
        element: <EMPLOYEEINFORMATION />,
        handle: {
          permission:
            MODULES.EMPLOYEES.children.EMPLOYEEINFORMATION.permissionId,
        },
      },
      {
        id: "EMPLOYEES.ENABLEEDIT",
        path: `${MODULES.EMPLOYEES.path}/${MODULES.EMPLOYEES.children.ENABLEEDIT.path}`,
        element: <EnableEdit />,
        handle: {
          permission: MODULES.EMPLOYEES.children.ENABLEEDIT.permissionId,
        },
      },
      {
        id: "EMPLOYEES.STATUS",
        path: `${MODULES.EMPLOYEES.path}/${MODULES.EMPLOYEES.children.STATUS.path}`,
        element: <Statuses />,
        handle: {
          permission: MODULES.EMPLOYEES.children.STATUS.permissionId,
        },
      },
    ],
  },
];
