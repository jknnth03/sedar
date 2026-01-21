import React from "react";
import { useDispatch } from "react-redux";
import DashboardIcon from "@mui/icons-material/Dashboard";
import SummarizeIcon from "@mui/icons-material/Summarize";
import WorkHistoryIcon from "@mui/icons-material/WorkHistory";
import FolderSharedIcon from "@mui/icons-material/FolderShared";
import SyncIcon from "@mui/icons-material/Sync";
import TitleIcon from "@mui/icons-material/Title";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import GroupsIcon from "@mui/icons-material/Groups";
import ExtensionIcon from "@mui/icons-material/Extension";
import FeaturedPlayListIcon from "@mui/icons-material/FeaturedPlayList";
import ExploreIcon from "@mui/icons-material/Explore";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import SchoolIcon from "@mui/icons-material/School";
import GavelIcon from "@mui/icons-material/Gavel";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import WorkIcon from "@mui/icons-material/Work";
import MilitaryTechIcon from "@mui/icons-material/MilitaryTech";
import ConstructionIcon from "@mui/icons-material/Construction";
import KitchenIcon from "@mui/icons-material/Kitchen";
import FileOpenIcon from "@mui/icons-material/FileOpen";
import EmojiObjectsIcon from "@mui/icons-material/EmojiObjects";
import ChurchIcon from "@mui/icons-material/Church";
import ManageAccountsIcon from "@mui/icons-material/ManageAccounts";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import CategoryIcon from "@mui/icons-material/Category";
import BadgeIcon from "@mui/icons-material/Badge";
import SaveIcon from "@mui/icons-material/Save";
import TextSnippetIcon from "@mui/icons-material/TextSnippet";
import StarIcon from "@mui/icons-material/Star";
import EditIcon from "@mui/icons-material/Edit";
import NoDataGIF from "../assets/no-data.gif";
import CancelIcon from "@mui/icons-material/Cancel";
import InfoIcon from "@mui/icons-material/Info";
import SettingsSuggestIcon from "@mui/icons-material/SettingsSuggest";
import ApprovalIcon from "@mui/icons-material/Approval";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import MarkEmailReadIcon from "@mui/icons-material/MarkEmailRead";
import TaskIcon from "@mui/icons-material/Task";
import PendingActionsIcon from "@mui/icons-material/PendingActions";
import ArchiveIcon from "@mui/icons-material/Archive";
import MarkAsUnreadIcon from "@mui/icons-material/MarkAsUnread";
import HowToRegIcon from "@mui/icons-material/HowToReg";
import CloudSyncIcon from "@mui/icons-material/CloudSync";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import VpnKeyIcon from "@mui/icons-material/VpnKey";
import LowPriorityIcon from "@mui/icons-material/LowPriority";
import PublishedWithChangesIcon from "@mui/icons-material/PublishedWithChanges";
import CreateNewFolderIcon from "@mui/icons-material/CreateNewFolder";
import MonitorIcon from "@mui/icons-material/Monitor";
import { useShowDashboardQuery } from "../features/api/usermanagement/dashboardApi";
import BorderColorIcon from "@mui/icons-material/BorderColor";
import VerifiedIcon from "@mui/icons-material/Verified";
import { iconStyles, imageStyles } from "./iconStyles";
import LooksOneIcon from "@mui/icons-material/LooksOne";
import LooksTwoIcon from "@mui/icons-material/LooksTwo";
import AssessmentIcon from "@mui/icons-material/Assessment";
import AssignmentIcon from "@mui/icons-material/Assignment";
import DescriptionIcon from "@mui/icons-material/Description";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import WeekendIcon from "@mui/icons-material/Weekend";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import RecommendIcon from "@mui/icons-material/Recommend";
import FactCheckIcon from "@mui/icons-material/FactCheck";
import RateReviewIcon from "@mui/icons-material/RateReview";
import { calculateCounts } from "./NotificationBadge";
import PublicIcon from "@mui/icons-material/Public";

export const createEnhancedModules = (dashboardData = {}) => {
  const counts = calculateCounts(dashboardData);

  return {
    DASHBOARD: {
      name: "Dashboard",
      permissionId: "DASHBOARD",
      displayName: "Dashboard",
      path: "/",
      icon: <DashboardIcon sx={iconStyles.main} />,
      children: null,
    },

    USERMANAGEMENT: {
      name: "User Management",
      permissionId: "USERMANAGEMENT",
      displayName: "User Management",
      path: "/usermanagement",
      icon: <ManageAccountsIcon sx={iconStyles.main} />,
      children: {
        USER: {
          name: "User",
          permissionId: "USERMANAGEMENT.USER",
          displayName: "User",
          path: "user",
          icon: <PersonAddIcon sx={iconStyles.child} />,
        },
        ROLES: {
          name: "Roles",
          permissionId: "USERMANAGEMENT.ROLES",
          displayName: "Roles",
          path: "roles",
          icon: <FolderSharedIcon sx={iconStyles.child} />,
        },
      },
    },
    EMPLOYEES: {
      name: "Employees",
      permissionId: "EMPLOYEES",
      displayName: "Employees",
      path: "/employees",
      icon: <FolderSharedIcon sx={iconStyles.main} />,
      notificationCount: 0,
      children: {
        EMPLOYEEINFORMATION: {
          name: "Employee Information",
          permissionId: "EMPLOYEES.EMPLOYEEINFORMATION",
          displayName: "Employee Information",
          path: "employeeinformation",
          icon: <InfoIcon sx={iconStyles.child} />,
        },
        ENABLEEDIT: {
          name: "Enable Edit",
          permissionId: "EMPLOYEES.ENABLEEDIT",
          displayName: "Enable Edit",
          path: "enableedit",
          icon: <BorderColorIcon sx={iconStyles.child} />,
        },
      },
    },
    RECEIVING: {
      name: "Receiving",
      permissionId: "RECEIVING",
      displayName: "Receiving",
      path: "/receiving",
      icon: <ArchiveIcon sx={iconStyles.mainLarge} />,
      notificationCount: counts.pendingReceiving,
      children: {
        PENDINGFORMS: {
          name: "MRF Receiving",
          permissionId: "RECEIVING.PENDINGFORMS",
          displayName: "MRF Receiving",
          path: "pendingforms",
          icon: <MarkAsUnreadIcon sx={iconStyles.child} />,

          notificationCount: counts.pendingMrfReceiving,
        },
        DAFORMRECEIVING: {
          name: "DA Form Receiving",
          permissionId: "RECEIVING.DAFORMRECEIVING",
          displayName: "DA Form Receiving",
          path: "daformreceiving",
          icon: <DescriptionIcon sx={iconStyles.child} />,

          notificationCount: counts.daReceiving,
        },
      },
    },

    APPROVALSETTINGS: {
      name: "Approval Settings",
      permissionId: "APPROVALSETTINGS",
      displayName: "Approval Settings",
      path: "/approvalsetting",
      icon: <ApprovalIcon sx={iconStyles.mainLarge} />,
      children: {
        APPROVALFORM: {
          name: "Approval Form",
          permissionId: "APPROVALSETTINGS.APPROVALFORM",
          displayName: "Approval Form",
          path: "approvalform",
          icon: <AssignmentTurnedInIcon sx={iconStyles.child} />,
        },
        APPROVALFLOW: {
          name: "Approval Flow",
          permissionId: "APPROVALSETTINGS.APPROVALFLOW",
          displayName: "Approval Flow",
          path: "approvalflow",
          icon: <DragIndicatorIcon sx={iconStyles.child} />,
        },
      },
    },

    ASSESSMENTTEMPLATES: {
      name: "Assessment Templates",
      permissionId: "ASSESSMENTTEMPLATES",
      displayName: "Assessment Templates",
      path: "/assessment-templates",
      icon: <FactCheckIcon sx={iconStyles.mainLarge} />,
      children: {
        CATONETEMPLATE: {
          name: "Cat I Template",
          permissionId: "ASSESSMENTTEMPLATES.CATONETEMPLATE",
          displayName: "Cat I Template",
          path: "cat-one-template",
          icon: <LooksOneIcon sx={iconStyles.child} />,
        },
        CATTWOTEMPLATE: {
          name: "Cat II Template",
          permissionId: "ASSESSMENTTEMPLATES.CATTWOTEMPLATE",
          displayName: "Cat II Template",
          path: "cat-two-template",
          icon: <LooksTwoIcon sx={iconStyles.child} />,
        },
        PDPTEMPLATE: {
          name: "PDP",
          permissionId: "ASSESSMENTTEMPLATES.PDPTEMPLATE",
          displayName: "PDP",
          path: "pdp-template",
          icon: <AssessmentIcon sx={iconStyles.child} />,
        },
        BIANNUALTEMPLATE: {
          name: "Bi-Annual Template",
          permissionId: "ASSESSMENTTEMPLATES.BIANNUALTEMPLATE",
          displayName: "Bi-Annual Template",
          path: "bi-annual-template",
          icon: <AssessmentIcon sx={iconStyles.child} />,
        },
      },
    },

    APPROVING: {
      name: "Approval",
      permissionId: "APPROVING",
      displayName: "Approval",
      path: "/approving",
      icon: <GavelIcon sx={iconStyles.mainMedium} />,
      notificationCount: counts.pendingApprovals,
      children: {
        SUBMISSIONAPPROVAL: {
          name: "MRF",
          permissionId: "APPROVING.SUBMISSIONAPPROVAL",
          displayName: "MRF",
          path: "submissionapproval",
          icon: <TaskIcon sx={iconStyles.child} />,

          notificationCount: counts.manpowerFormApprovals,
        },
        REGISTRATIONAPPROVAL: {
          name: "Registration",
          permissionId: "APPROVING.REGISTRATIONAPPROVAL",
          displayName: "Registration",
          path: "registrationapproval",
          icon: <HowToRegIcon sx={iconStyles.child} />,

          notificationCount: counts.registrationApprovals,
        },
        DATACHANGEAPPROVAL: {
          name: "Data Change",
          permissionId: "APPROVING.DATACHANGEAPPROVAL",
          displayName: "Data Change",
          path: "datachangeapproval",
          icon: <PublishedWithChangesIcon sx={iconStyles.child} />,

          notificationCount: counts.dataChangeFormApprovals,
        },
        DAFORMAPPROVAL: {
          name: "DA Form",
          permissionId: "APPROVING.DAFORMAPPROVAL",
          displayName: "DA Form",
          path: "daformapproval",
          icon: <DescriptionIcon sx={iconStyles.child} />,

          notificationCount: counts.daFormApprovals,
        },
        DARECOMMENDATIONAPPROVAL: {
          name: "DA Recommendation",
          permissionId: "APPROVING.DARECOMMENDATIONAPPROVAL",
          displayName: "DA Recommendation",
          path: "darecommendationapproval",
          icon: <DescriptionIcon sx={iconStyles.child} />,

          notificationCount: counts.daRecommendationApprovals,
        },
        EVALUATIONAPPROVAL: {
          name: "Evaluation Form",
          permissionId: "APPROVING.EVALUATIONAPPROVAL",
          displayName: "Evaluation Form",
          path: "evaluationapproval",
          icon: <RateReviewIcon sx={iconStyles.child} />,

          notificationCount: counts.probationaryFormApprovals,
        },
        EVALUATIONRECOMMENDATIONAPPROVAL: {
          name: "Evaluation Recommendation",
          permissionId: "APPROVING.EVALUATIONRECOMMENDATIONAPPROVAL",
          displayName: "Evaluation Recommendation",
          path: "evaluationrecommendationapproval",
          icon: <RecommendIcon sx={iconStyles.child} />,

          notificationCount: counts.probationaryRecommendationApprovals,
        },
        MDAEVALUATIONAPPROVAL: {
          name: "MDA (For Evaluation)",
          permissionId: "APPROVING.MDAEVALUATIONAPPROVAL",
          displayName: "MDA (For Evaluation)",
          path: "mdaevaluationapproval",
          icon: <RateReviewIcon sx={iconStyles.child} />,

          notificationCount: counts.probationaryMdaApprovals,
        },
        MDAAPPROVAL: {
          name: "MDA (For Data Change)",
          permissionId: "APPROVING.MDAAPPROVAL",
          displayName: "MDA (For Data Change)",
          path: "mdaapproval",
          icon: <VerifiedIcon sx={iconStyles.child} />,

          notificationCount: counts.mdaApprovals,
        },
        DAMDAAPPROVAL: {
          name: "MDA (For DA)",
          permissionId: "APPROVING.DAMDAAPPROVAL",
          displayName: "MDA (For DA)",
          path: "damdaapproval",
          icon: <VerifiedIcon sx={iconStyles.child} />,

          notificationCount: counts.daMdaApprovals,
        },
        MDARECOMMENDATIONAPPROVAL: {
          name: "MDA (Recommendation)",
          permissionId: "APPROVING.MDARECOMMENDATIONAPPROVAL",
          displayName: "MDA (Recommendation)",
          path: "mdarecommendationapproval",
          icon: <DescriptionIcon sx={iconStyles.child} />,

          notificationCount: 0,
        },
        BIANNUALAPPROVAL: {
          name: "Bi-Annual Approval",
          permissionId: "APPROVING.BIANNUALAPPROVAL",
          displayName: "Bi-Annual Approval",
          path: "biannualapproval",
          icon: <AssessmentIcon sx={iconStyles.child} />,

          notificationCount: counts.performanceApprovals,
        },
        CATONEAPPROVAL: {
          name: "CAT I",
          permissionId: "APPROVING.CATONEAPPROVAL",
          displayName: "CAT I",
          path: "catoneapproval",
          icon: <LooksOneIcon sx={iconStyles.child} />,
          notificationCount: counts.catOneApprovals,
        },
        CATTWOAPPROVAL: {
          name: "CAT II",
          permissionId: "APPROVING.CATTWOAPPROVAL",
          displayName: "CAT II",
          path: "cattwoapproval",
          icon: <LooksTwoIcon sx={iconStyles.child} />,
          notificationCount: counts.catTwoApprovals,
        },
        PDPAPPROVAL: {
          name: "PDP",
          permissionId: "APPROVING.PDPAPPROVAL",
          displayName: "PDP",
          path: "pdpapproval",
          icon: <AssessmentIcon sx={iconStyles.child} />,
          notificationCount: counts.pdpApprovals,
        },
      },
    },

    REQUEST: {
      name: "Requisition",
      permissionId: "REQUEST",
      displayName: "Requisition",
      path: "/request",
      icon: <PendingActionsIcon sx={iconStyles.mainExtraLarge} />,
      notificationCount: counts.totalRequisitionCount,
      children: {
        MRFMAINCONTAINER: {
          name: "Manpower Form",
          permissionId: "REQUEST.MRFMAINCONTAINER",
          displayName: "Manpower Form",
          path: "mrfmaincontainer",
          icon: <MarkEmailReadIcon sx={iconStyles.child} />,
          notificationCount: counts.manpowerTotal,
        },
        DATACHANGEMAINCONTAINER: {
          name: "201 Datachange",
          permissionId: "REQUEST.DATACHANGEMAINCONTAINER",
          displayName: "201 Datachange",
          path: "datachangemaincontainer",
          icon: <CloudSyncIcon sx={iconStyles.child} />,
          notificationCount: counts.dataChangeTotal,
        },
        DEVELOPMENTALASSIGNMENTFORM: {
          name: "Developmental Assignment Form",
          permissionId: "REQUEST.DEVELOPMENTALASSIGNMENTFORM",
          displayName: "Developmental Assignment Form",
          path: "developmentalassignmentform",
          icon: <DescriptionIcon sx={iconStyles.child} />,
          notificationCount: counts.daFormTotal || 0,
          children: {
            DAFORM: {
              name: "DA Form",
              permissionId: "REQUEST.DEVELOPMENTALASSIGNMENTFORM.DAFORM",
              displayName: "DA Form",
              path: "daform",
              icon: <DescriptionIcon sx={iconStyles.child} />,
              notificationCount: counts.daFormApprovals || 0,
            },
            DARECOMMENDATION: {
              name: "DA Recommendation",
              permissionId:
                "REQUEST.DEVELOPMENTALASSIGNMENTFORM.DARECOMMENDATION",
              displayName: "DA Recommendation",
              path: "darecommendation",
              icon: <RecommendIcon sx={iconStyles.child} />,
              notificationCount: counts.daRecommendationApprovals || 0,
            },
          },
        },
        MASTERDATAAUTHORITY: {
          name: "MDA (For Data Change)",
          permissionId: "REQUEST.MASTERDATAAUTHORITY",
          displayName: "MDA (For Data Change)",
          path: "masterdataauthority",
          icon: <CreateNewFolderIcon sx={iconStyles.child} />,
          notificationCount: counts.mdaDataChangeTotal,
        },
        MDADA: {
          name: "MDA (For DA)",
          permissionId: "REQUEST.MDADA",
          displayName: "MDA (For DA)",
          path: "mdada",
          icon: <VerifiedIcon sx={iconStyles.child} />,
          notificationCount: counts.mdaDaTotal,
        },
        MDARECOMMENDATION: {
          name: "MDA (For Recommendation)",
          permissionId: "REQUEST.MDARECOMMENDATION",
          displayName: "MDA (For Recommendation)",
          path: "mdarecommendation",
          icon: <VerifiedIcon sx={iconStyles.child} />,
          notificationCount: 0,
        },
        MDAEVALUATIONRECOMMENDATION: {
          name: "MDA (For Evaluation)",
          permissionId: "REQUEST.MDAEVALUATIONRECOMMENDATION",
          displayName: "MDA (For Evaluation)",
          path: "mdaevaluationrecommendation",
          icon: <VerifiedIcon sx={iconStyles.child} />,
          notificationCount: counts.mdaProbationaryTotal,
        },
        PENDINGREGISTRATION: {
          name: "Registration",
          permissionId: "REQUEST.PENDINGREGISTRATION",
          displayName: "Registration",
          path: "pendingregistration",
          icon: <PendingActionsIcon sx={iconStyles.child} />,
          notificationCount: counts.pendingRegistrations,
        },
        EVALUATIONFORM: {
          name: "Evaluation Form",
          permissionId: "REQUEST.EVALUATIONFORM",
          displayName: "Evaluation Form",
          path: "evaluationform",
          icon: <RateReviewIcon sx={iconStyles.child} />,
          notificationCount: counts.evaluationFormTotal || 0,
        },
        EVALUATIONRECOMMENDATION: {
          name: "Evaluation Recommendation",
          permissionId: "REQUEST.EVALUATIONRECOMMENDATION",
          displayName: "Evaluation Recommendation",
          path: "evaluationrecommendation",
          icon: <RecommendIcon sx={iconStyles.child} />,
          notificationCount: counts.evaluationRecommendationTotal || 0,
        },
        BIANNUALPERFORMANCE: {
          name: "Bi-Annual Performance",
          permissionId: "REQUEST.BIANNUALPERFORMANCE",
          displayName: "Bi-Annual Performance",
          path: "biannualperformance",
          icon: <AssessmentIcon sx={iconStyles.child} />,
          notificationCount: counts.performanceTotal,
        },
      },
    },
    REQUESTMONITORING: {
      name: "Request Monitoring",
      permissionId: "REQUESTMONITORING",
      displayName: "Request Monitoring",
      path: "/requestmonitoring",
      icon: <MonitorIcon sx={iconStyles.mainExtraLarge} />,
      notificationCount: counts.totalHrProcessing,
      children: {
        MRFMONITORING: {
          name: "MRF (HR)",
          permissionId: "REQUESTMONITORING.MRFMONITORING",
          displayName: "MRF (HR)",
          path: "mrfmonitoring",
          icon: <MarkEmailReadIcon sx={iconStyles.child} />,

          notificationCount: 0,
        },
        DATACHANGEMONITORING: {
          name: "Data Change (HR)",
          permissionId: "REQUESTMONITORING.DATACHANGEMONITORING",
          displayName: "Data Change (HR)",
          path: "datachangemonitoring",
          icon: <CloudSyncIcon sx={iconStyles.child} />,

          notificationCount: counts.hrDataChangeMda,
        },
        MDAMONITORING: {
          name: "MDA (HR)",
          permissionId: "REQUESTMONITORING.MDAMONITORING",
          displayName: "MDA (HR)",
          path: "mdamonitoring",
          icon: <VerifiedIcon sx={iconStyles.child} />,

          notificationCount: counts.hrDaMda + counts.hrEvaluationMda,
        },
      },
    },
    EVALUATION: {
      name: "Evaluation",
      permissionId: "EVALUATION",
      displayName: "Evaluation",
      path: "/evaluation",
      icon: <TrendingUpIcon sx={iconStyles.mainExtraLarge} />,
      notificationCount: 0,
      children: {
        KPI: {
          name: "KPI",
          permissionId: "EVALUATION.KPI",
          displayName: "KPI",
          path: "kpi",
          icon: <VpnKeyIcon sx={iconStyles.child} />,

          notificationCount: 0,
        },
      },
    },
    MASTERLIST: {
      name: "Masterlist",
      permissionId: "MASTERLIST",
      displayName: "Masterlist",
      path: "/masterlist",
      icon: <SummarizeIcon sx={iconStyles.mainExtraLarge} />,
      children: {
        ONERDF: {
          name: "Charging",
          permissionId: "MASTERLIST.ONERDF",
          displayName: "Charging",
          path: "onerdf",
          icon: <LocationOnIcon sx={iconStyles.child} />,
        },
        POSITIONS: {
          name: "Position",
          permissionId: "MASTERLIST.POSITIONS",
          displayName: "Position",
          path: "positions",
          icon: <BadgeIcon sx={iconStyles.child} />,
        },
      },
    },

    DEVELOPMENTALASSIGNMENT: {
      name: "DA Tasks",
      permissionId: "DEVELOPMENTALASSIGNMENT",
      displayName: "DA Tasks",
      path: "/developmental-assignment",
      icon: <AssignmentIcon sx={iconStyles.mainExtraLarge} />,
      children: {
        CATONE: {
          name: "CAT I",
          permissionId: "DEVELOPMENTALASSIGNMENT.CATONE",
          displayName: "CAT I",
          path: "catone",
          icon: <LooksOneIcon sx={iconStyles.child} />,
          notificationCount: counts.catOneTotal,
        },
        CATTWO: {
          name: "CAT II",
          permissionId: "DEVELOPMENTALASSIGNMENT.CATTWO",
          displayName: "CAT II",
          path: "cattwo",
          icon: <LooksTwoIcon sx={iconStyles.child} />,
          notificationCount: counts.catTwoTotal,
        },
        PDP: {
          name: "PDP",
          permissionId: "DEVELOPMENTALASSIGNMENT.PDP",
          displayName: "PDP",
          path: "pdp",
          icon: <AssessmentIcon sx={iconStyles.child} />,
          notificationCount: counts.pdpTotal,
        },
      },
    },

    ADMINISTRATIVEDIVISION: {
      name: "Administrative Divisions",
      permissionId: "ADMINISTRATIVEDIVISION",
      displayName: "Administrative Divisions",
      path: "/administrative-divisions",
      icon: <ExploreIcon sx={iconStyles.main} />,
      children: {
        REGIONS: {
          name: "Regions",
          permissionId: "ADMINISTRATIVEDIVISION.REGIONS",
          displayName: "Regions",
          path: "regions",
          icon: <ExploreIcon sx={iconStyles.child} />,
        },
        PROVINCES: {
          name: "Provinces",
          permissionId: "ADMINISTRATIVEDIVISION.PROVINCES",
          displayName: "Provinces",
          path: "provinces",
          icon: <LocationOnIcon sx={iconStyles.child} />,
        },
        MUNICIPALITIES: {
          name: "Municipalities",
          permissionId: "ADMINISTRATIVEDIVISION.MUNICIPALITIES",
          displayName: "Municipalities",
          path: "municipalities",
          icon: <GavelIcon sx={iconStyles.child} />,
        },
        SUBMUNICIPALITIES: {
          name: "Sub Municipalities",
          permissionId: "ADMINISTRATIVEDIVISION.SUBMUNICIPALITIES",
          displayName: "Sub Municipalities",
          path: "submunicipalities",
          icon: <CategoryIcon sx={iconStyles.child} />,
        },
        BARANGAYS: {
          name: "Barangays",
          permissionId: "ADMINISTRATIVEDIVISION.BARANGAYS",
          displayName: "Barangays",
          path: "barangays",
          icon: <AccountBalanceIcon sx={iconStyles.child} />,
        },
      },
    },

    EXTRAS: {
      name: "Extras",
      permissionId: "EXTRAS",
      displayName: "Extras",
      path: "/extras",
      icon: <SettingsSuggestIcon sx={iconStyles.main} />,
      children: {
        TITLES: {
          name: "Titles",
          permissionId: "EXTRAS.TITLES",
          displayName: "Titles",
          path: "titles",
          icon: <TitleIcon sx={iconStyles.child} />,
        },
        SCHEDULES: {
          name: "Schedules",
          permissionId: "EXTRAS.SCHEDULES",
          displayName: "Schedules",
          path: "schedules",
          icon: <CalendarMonthIcon sx={iconStyles.child} />,
        },
        TEAMS: {
          name: "Teams",
          permissionId: "EXTRAS.TEAMS",
          displayName: "Teams",
          path: "teams",
          icon: <GroupsIcon sx={iconStyles.child} />,
        },
        RELIGIONS: {
          name: "Religions",
          permissionId: "EXTRAS.RELIGIONS",
          displayName: "Religions",
          path: "religions",
          icon: <ChurchIcon sx={iconStyles.child} />,
        },
        PREFIXES: {
          name: "Prefixes",
          permissionId: "EXTRAS.PREFIXES",
          displayName: "Prefixes",
          path: "prefixes",
          icon: <ExtensionIcon sx={iconStyles.child} />,
        },
        PROGRAMS: {
          name: "Programs",
          permissionId: "EXTRAS.PROGRAMS",
          displayName: "Programs",
          path: "programs",
          icon: <FeaturedPlayListIcon sx={iconStyles.child} />,
        },
        ATTAINMENTS: {
          name: "Attainments",
          permissionId: "EXTRAS.ATTAINMENTS",
          displayName: "Attainments",
          path: "attainments",
          icon: <WorkIcon sx={iconStyles.child} />,
        },
        DEGREES: {
          name: "Degrees",
          permissionId: "EXTRAS.DEGREES",
          displayName: "Degrees",
          path: "degrees",
          icon: <SchoolIcon sx={iconStyles.child} />,
        },
        HONORTITLES: {
          name: "Honor Titles",
          permissionId: "EXTRAS.HONORTITLES",
          displayName: "Honor Titles",
          path: "honortitles",
          icon: <MilitaryTechIcon sx={iconStyles.child} />,
        },
        BANKS: {
          name: "Banks",
          permissionId: "EXTRAS.BANKS",
          displayName: "Banks",
          path: "banks",
          icon: <GroupsIcon sx={iconStyles.child} />,
        },
        TOOLS: {
          name: "Tools",
          permissionId: "EXTRAS.TOOLS",
          displayName: "Tools",
          path: "tools",
          icon: <ConstructionIcon sx={iconStyles.child} />,
        },
        CABINETS: {
          name: "Cabinets",
          permissionId: "EXTRAS.CABINETS",
          displayName: "Cabinets",
          path: "cabinets",
          icon: <KitchenIcon sx={iconStyles.child} />,
        },
        FILETYPES: {
          name: "File Types",
          permissionId: "EXTRAS.FILETYPES",
          displayName: "File Types",
          path: "filetypes",
          icon: <FileOpenIcon sx={iconStyles.child} />,
        },
        OBJECTIVES: {
          name: "Objectives",
          permissionId: "EXTRAS.OBJECTIVES",
          displayName: "Objectives",
          path: "objectives",
          icon: <EmojiObjectsIcon sx={iconStyles.child} />,
        },
        REQUISITION: {
          name: "Requisition Types",
          permissionId: "EXTRAS.REQUISITION",
          displayName: "Requisition Types",
          path: "requisition",
          icon: <TextSnippetIcon sx={iconStyles.child} />,
        },
        MOVEMENTTYPES: {
          name: "Movement Types",
          permissionId: "EXTRAS.MOVEMENTTYPES",
          displayName: "Movement Types",
          path: "movementtypes",
          icon: <LowPriorityIcon sx={iconStyles.child} />,
        },
        WORKWEEKS: {
          name: "Work Weeks",
          permissionId: "EXTRAS.WORKWEEKS",
          displayName: "Work Weeks",
          path: "workweeks",
          icon: <EventAvailableIcon sx={iconStyles.child} />,
        },
        WORKHOURS: {
          name: "Work Hours",
          permissionId: "EXTRAS.WORKHOURS",
          displayName: "Work Hours",
          path: "workhours",
          icon: <AccessTimeIcon sx={iconStyles.child} />,
        },
        RESTDAYS: {
          name: "Rest Days",
          permissionId: "EXTRAS.RESTDAYS",
          displayName: "Rest Days",
          path: "restdays",
          icon: <WeekendIcon sx={iconStyles.child} />,
        },
        SEPARATIONTYPES: {
          name: "Separation Types",
          permissionId: "EXTRAS.SEPARATIONTYPES",
          displayName: "Separation Types",
          path: "separationtypes",
          icon: <ExitToAppIcon sx={iconStyles.child} />,
        },
        SEPARATIONREASONS: {
          name: "Separation Reasons",
          permissionId: "EXTRAS.SEPARATIONREASONS",
          displayName: "Separation Reasons",
          path: "separationreasons",
          icon: <HelpOutlineIcon sx={iconStyles.child} />,
        },
        JOBBANDS: {
          name: "Job Bands",
          permissionId: "EXTRAS.JOBBANDS",
          displayName: "Job Bands",
          path: "jobbands",
          icon: <WorkHistoryIcon sx={iconStyles.child} />,
        },
        JOBLEVELS: {
          name: "Job Levels",
          permissionId: "EXTRAS.JOBLEVELS",
          displayName: "Job Levels",
          path: "joblevels",
          icon: <MilitaryTechIcon sx={iconStyles.child} />,
        },
        JOBRATES: {
          name: "Job Rates",
          permissionId: "EXTRAS.JOBRATES",
          displayName: "Job Rates",
          path: "jobrates",
          icon: <StarIcon sx={iconStyles.child} />,
        },
        NATIONALITIES: {
          name: "Nationalities",
          permissionId: "EXTRAS.NATIONALITIES",
          displayName: "Nationalities",
          path: "nationalities",
          icon: <PublicIcon sx={iconStyles.child} />,
        },
      },
    },
  };
};

export const useEnhancedModules = () => {
  const { data: dashboardData, isLoading, error } = useShowDashboardQuery();

  return {
    modules: createEnhancedModules(dashboardData),
    isLoading,
    error,
    dashboardData,
  };
};

export const MODULES = createEnhancedModules();

export const CONSTANT = {
  PAGES: {
    ...MODULES,
    LOGIN: {
      name: "Login",
      permissionId: "LOGIN",
      displayName: "Login",
      path: "/login",
      icon: null,
      icon_on: "sampleicon",
      children: null,
    },
    UNAUTHORIZED: {
      name: "Unauthorized",
      permissionId: "UNAUTHORIZED",
      displayName: "Unauthorized",
      path: "/unauthorized",
      icon: null,
      children: null,
    },
    CHANGEPASS: {
      name: "Changepass",
      permissionId: "CHANGEPASS",
      displayName: "Changepass",
      path: "/changepass",
      icon: null,
      children: null,
    },
  },

  FIELDS: {
    USERNAME: {
      label: "Username",
      placeholder: "Type your username here",
    },
    PASSWORD: {
      label: "Password",
      placeholder: "Type your password here",
    },
  },

  BUTTONS: {
    LOGIN: {
      label: "Log In",
    },
    NODATA: {
      icon: <img src={NoDataGIF} alt="No Data" style={imageStyles.noData} />,
    },
    ADD: {
      label1: "Save",
      label2: "Update",
      icon1: <SaveIcon sx={iconStyles.button} />,
      icon2: <EditIcon sx={iconStyles.button} />,
    },
    CANCEL: {
      label: "Cancel",
      icon: <CancelIcon sx={iconStyles.button} />,
    },
    SYNC: {
      label: "Sync",
      icon: <SyncIcon sx={iconStyles.sync} />,
    },
  },
};
export default CONSTANT;
