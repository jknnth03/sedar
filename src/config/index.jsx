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
import moduleApi from "../features/api/usermanagement/dashboardApi";
import formSubmissionApi from "../features/api/approvalsetting/formSubmissionApi";
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

export const updateDashboardNotifications = (dispatch) => {
  dispatch(moduleApi.util.invalidateTags(["dashboard"]));
  dispatch(formSubmissionApi.util.invalidateTags(["mrfSubmissions"]));
  dispatch(formSubmissionApi.util.invalidateTags(["formSubmissions"]));
};

export const useNotificationUpdater = () => {
  const dispatch = useDispatch();

  return {
    updateNotifications: () => updateDashboardNotifications(dispatch),
  };
};

export const createEnhancedModules = (dashboardData = {}) => {
  const apiResult = dashboardData?.result || {};

  const counts = {
    pendingRegistrations: apiResult.employees?.pending_registrations || 0,

    pendingApprovals:
      (apiResult.approval?.manpower_form || 0) +
      (apiResult.approval?.registration_approval || 0) +
      (apiResult.approval?.data_change_approval || 0) +
      (apiResult.approval?.mda_approval || 0) +
      (apiResult.approval?.da_form_approval || 0) +
      (apiResult.approval?.cat_one_approval || 0) +
      (apiResult.approval?.cat_two_approval || 0) +
      (apiResult.approval?.pdp_approval || 0),
    manpowerFormApprovals: apiResult.approval?.manpower_form || 0,
    registrationApprovals: apiResult.approval?.registration_approval || 0,
    dataChangeApprovals: apiResult.approval?.data_change_approval || 0,
    mdaApprovals: apiResult.approval?.mda_approval || 0,
    daFormApprovals: apiResult.approval?.da_form_approval || 0,
    catOneApprovals: apiResult.approval?.cat_one_approval || 0,
    catTwoApprovals: apiResult.approval?.cat_two_approval || 0,
    pdpApprovals: apiResult.approval?.pdp_approval || 0,

    pendingReceiving:
      (apiResult.receiving?.pending_mrfs || 0) +
      (apiResult.receiving?.pending_data_changes || 0),
    pendingMrfReceiving: apiResult.receiving?.pending_mrfs || 0,
    pendingDataChangeReceiving: apiResult.receiving?.pending_data_changes || 0,

    manpowerFormRejected: apiResult.requisition?.manpower_form_rejected || 0,
    manpowerFormReturned: apiResult.requisition?.manpower_form_returned || 0,
    manpowerFormAwaiting:
      apiResult.requisition?.manpower_form_awaiting_for_resubmission || 0,
    dataChangeRejected: apiResult.requisition?.data_change_rejected || 0,
    dataChangeForMdaProcessing:
      apiResult.requisition?.data_change_for_mda_processing || 0,

    totalRequisitionCount:
      (apiResult.requisition?.manpower_form_rejected || 0) +
      (apiResult.requisition?.manpower_form_returned || 0) +
      (apiResult.requisition?.manpower_form_awaiting_for_resubmission || 0) +
      (apiResult.requisition?.data_change_rejected || 0) +
      (apiResult.requisition?.data_change_for_mda_processing || 0) +
      (apiResult.employees?.pending_registrations || 0),
  };

  return {
    DASHBOARD: {
      name: "Dashboard",
      path: "/",
      icon: <DashboardIcon sx={iconStyles.main} />,
      icon_on: null,
      children: null,
    },

    USERMANAGEMENT: {
      name: "User Management",
      path: "/usermanagement",
      icon: <ManageAccountsIcon sx={iconStyles.main} />,
      icon_on: null,
      children: {
        USER: {
          name: "User",
          path: "user",
          icon: <PersonAddIcon sx={iconStyles.child} />,
          icon_on: null,
        },
        ROLES: {
          name: "Roles",
          path: "roles",
          icon: <FolderSharedIcon sx={iconStyles.child} />,
          icon_on: null,
        },
      },
    },
    EMPLOYEES: {
      name: "Employees",
      path: "/employees",
      icon: <FolderSharedIcon sx={iconStyles.main} />,
      icon_on: null,
      notificationCount: 0,
      children: {
        EMPLOYEEINFORMATION: {
          name: "Employee Information",
          path: "employeeinformation",
          icon: <InfoIcon sx={iconStyles.child} />,
          icon_on: null,
        },
        ENABLEEDIT: {
          name: "Enable Edit",
          path: "enableedit",
          icon: <BorderColorIcon sx={iconStyles.child} />,
          icon_on: null,
        },
      },
    },
    RECEIVING: {
      name: "Receiving",
      path: "/receiving",
      icon: <ArchiveIcon sx={iconStyles.mainLarge} />,
      icon_on: null,
      notificationCount: counts.pendingReceiving,
      children: {
        PENDINGFORMS: {
          name: "MRF Receiving",
          path: "pendingforms",
          icon: <MarkAsUnreadIcon sx={iconStyles.child} />,
          icon_on: null,
          notificationCount: counts.pendingMrfReceiving,
        },
      },
    },

    APPROVALSETTINGS: {
      name: "Approval Settings",
      path: "/approvalsetting",
      icon: <ApprovalIcon sx={iconStyles.mainLarge} />,
      icon_on: null,
      children: {
        APPROVALFORM: {
          name: "Approval Form",
          path: "approvalform",
          icon: <AssignmentTurnedInIcon sx={iconStyles.child} />,
          icon_on: null,
        },
        APPROVALFLOW: {
          name: "Approval Flow",
          path: "approvalflow",
          icon: <DragIndicatorIcon sx={iconStyles.child} />,
          icon_on: null,
        },
      },
    },

    APPROVING: {
      name: "Approval",
      path: "/approving",
      icon: <GavelIcon sx={iconStyles.mainMedium} />,
      icon_on: null,
      notificationCount: counts.pendingApprovals,
      children: {
        SUBMISSIONAPPROVAL: {
          name: "MRF",
          path: "submissionapproval",
          icon: <TaskIcon sx={iconStyles.child} />,
          icon_on: null,
          notificationCount: counts.manpowerFormApprovals,
        },
        REGISTRATIONAPPROVAL: {
          name: "Registration",
          path: "registrationapproval",
          icon: <HowToRegIcon sx={iconStyles.child} />,
          icon_on: null,
          notificationCount: counts.registrationApprovals,
        },
        DATACHANGEAPPROVAL: {
          name: "Data Change",
          path: "datachangeapproval",
          icon: <PublishedWithChangesIcon sx={iconStyles.child} />,
          icon_on: null,
          notificationCount: counts.dataChangeApprovals,
        },
        MDAAPPROVAL: {
          name: "MDA",
          path: "mdaapproval",
          icon: <VerifiedIcon sx={iconStyles.child} />,
          icon_on: null,
          notificationCount: counts.mdaApprovals,
        },
        DAFORMAPPROVAL: {
          name: "DA Form",
          path: "daformapproval",
          icon: <DescriptionIcon sx={iconStyles.child} />,
          icon_on: null,
          notificationCount: counts.daFormApprovals,
        },
        CATONEAPPROVAL: {
          name: "Cat One",
          path: "catoneapproval",
          icon: <LooksOneIcon sx={iconStyles.child} />,
          icon_on: null,
          notificationCount: counts.catOneApprovals,
        },
        CATTWOAPPROVAL: {
          name: "Cat Two",
          path: "cattwoapproval",
          icon: <LooksTwoIcon sx={iconStyles.child} />,
          icon_on: null,
          notificationCount: counts.catTwoApprovals,
        },
        PDPAPPROVAL: {
          name: "PDP",
          path: "pdpapproval",
          icon: <AssessmentIcon sx={iconStyles.child} />,
          icon_on: null,
          notificationCount: counts.pdpApprovals,
        },
      },
    },

    REQUEST: {
      name: "Requisition",
      path: "/request",
      icon: <PendingActionsIcon sx={iconStyles.mainExtraLarge} />,
      icon_on: null,
      notificationCount: counts.totalRequisitionCount,
      children: {
        MRFMAINCONTAINER: {
          name: "Manpower Form",
          path: "mrfmaincontainer",
          icon: <MarkEmailReadIcon sx={iconStyles.child} />,
          icon_on: null,
          notificationCount:
            counts.manpowerFormRejected +
            counts.manpowerFormReturned +
            counts.manpowerFormAwaiting,
        },
        DAFORM: {
          name: "DA Form",
          path: "daform",
          icon: <DescriptionIcon sx={iconStyles.child} />,
          icon_on: null,
          notificationCount: 0,
        },
        DATACHANGEMAINCONTAINER: {
          name: "201 Datachange",
          path: "datachangemaincontainer",
          icon: <CloudSyncIcon sx={iconStyles.child} />,
          icon_on: null,
          notificationCount: counts.dataChangeRejected,
        },
        MASTERDATAAUTHORITY: {
          name: "Master Data Authority",
          path: "masterdataauthority",
          icon: <CreateNewFolderIcon sx={iconStyles.child} />,
          icon_on: null,
          notificationCount: counts.dataChangeForMdaProcessing,
        },
        PENDINGREGISTRATION: {
          name: "Pending Registration",
          path: "pendingregistration",
          icon: <PendingActionsIcon sx={iconStyles.child} />,
          icon_on: null,
          notificationCount: counts.pendingRegistrations,
        },
      },
    },
    REQUESTMONITORING: {
      name: "Request Monitoring",
      path: "/requestmonitoring",
      icon: <MonitorIcon sx={iconStyles.mainExtraLarge} />,
      icon_on: null,
      notificationCount: 0,
      children: {
        MRFMONITORING: {
          name: "MRF (HR)",
          path: "mrfmonitoring",
          icon: <MarkEmailReadIcon sx={iconStyles.child} />,
          icon_on: null,
          notificationCount: 0,
        },
        DATACHANGEMONITORING: {
          name: "Data Change (HR)",
          path: "datachangemonitoring",
          icon: <CloudSyncIcon sx={iconStyles.child} />,
          icon_on: null,
          notificationCount: 0,
        },
        MDAMONITORING: {
          name: "MDA (HR)",
          path: "mdamonitoring",
          icon: <VerifiedIcon sx={iconStyles.child} />,
          icon_on: null,
          notificationCount: 0,
        },
      },
    },
    EVALUATION: {
      name: "Evaluation",
      path: "/evaluation",
      icon: <TrendingUpIcon sx={iconStyles.mainExtraLarge} />,
      icon_on: null,
      notificationCount: 0,
      children: {
        KPI: {
          name: "KPI",
          path: "kpi",
          icon: <VpnKeyIcon sx={iconStyles.child} />,
          icon_on: null,
          notificationCount: 0,
        },
      },
    },
    MASTERLIST: {
      name: "Masterlist",
      path: "/masterlist",
      icon: <SummarizeIcon sx={iconStyles.mainExtraLarge} />,
      icon_on: null,
      children: {
        ONERDF: {
          name: "Charging",
          path: "onerdf",
          icon: <LocationOnIcon sx={iconStyles.child} />,
          icon_on: null,
        },
        POSITIONS: {
          name: "Position",
          path: "positions",
          icon: <BadgeIcon sx={iconStyles.child} />,
          icon_on: null,
        },
      },
    },

    DEVELOPMENTALASSIGNMENT: {
      name: "DA Tasks",
      path: "/developmental-assignment",
      icon: <AssignmentIcon sx={iconStyles.mainExtraLarge} />,
      icon_on: null,
      children: {
        CATONE: {
          name: "Cat One",
          path: "catone",
          icon: <LooksOneIcon sx={iconStyles.child} />,
          icon_on: null,
        },
        CATTWO: {
          name: "Cat Two",
          path: "cattwo",
          icon: <LooksTwoIcon sx={iconStyles.child} />,
          icon_on: null,
        },
        PDP: {
          name: "PDP",
          path: "pdp",
          icon: <AssessmentIcon sx={iconStyles.child} />,
          icon_on: null,
        },
      },
    },

    ADMINISTRATIVEDIVISION: {
      name: "Administrative Divisions",
      path: "/administrative-divisions",
      icon: <ExploreIcon sx={iconStyles.main} />,
      icon_on: null,
      children: {
        REGIONS: {
          name: "Regions",
          path: "regions",
          icon: <ExploreIcon sx={iconStyles.child} />,
          icon_on: null,
        },
        PROVINCES: {
          name: "Provinces",
          path: "provinces",
          icon: <LocationOnIcon sx={iconStyles.child} />,
          icon_on: null,
        },
        MUNICIPALITIES: {
          name: "Municipalities",
          path: "municipalities",
          icon: <GavelIcon sx={iconStyles.child} />,
          icon_on: null,
        },
        SUBMUNICIPALITIES: {
          name: "Sub Municipalities",
          path: "submunicipalities",
          icon: <CategoryIcon sx={iconStyles.child} />,
          icon_on: null,
        },
        BARANGAYS: {
          name: "Barangays",
          path: "barangays",
          icon: <AccountBalanceIcon sx={iconStyles.child} />,
          icon_on: null,
        },
      },
    },

    EXTRAS: {
      name: "Extras",
      path: "/extras",
      icon: <SettingsSuggestIcon sx={iconStyles.main} />,
      icon_on: null,
      children: {
        TITLES: {
          name: "Titles",
          path: "titles",
          icon: <TitleIcon sx={iconStyles.child} />,
          icon_on: null,
        },
        SCHEDULES: {
          name: "Schedules",
          path: "schedules",
          icon: <CalendarMonthIcon sx={iconStyles.child} />,
          icon_on: null,
        },
        TEAMS: {
          name: "Teams",
          path: "teams",
          icon: <GroupsIcon sx={iconStyles.child} />,
          icon_on: null,
        },
        RELIGIONS: {
          name: "Religions",
          path: "religions",
          icon: <ChurchIcon sx={iconStyles.child} />,
          icon_on: null,
        },
        PREFIXES: {
          name: "Prefixes",
          path: "prefixes",
          icon: <ExtensionIcon sx={iconStyles.child} />,
          icon_on: null,
        },
        PROGRAMS: {
          name: "Programs",
          path: "programs",
          icon: <FeaturedPlayListIcon sx={iconStyles.child} />,
          icon_on: null,
        },
        ATTAINMENTS: {
          name: "Attainments",
          path: "attainments",
          icon: <WorkIcon sx={iconStyles.child} />,
          icon_on: null,
        },
        DEGREES: {
          name: "Degrees",
          path: "degrees",
          icon: <SchoolIcon sx={iconStyles.child} />,
          icon_on: null,
        },
        HONORTITLES: {
          name: "Honor Titles",
          path: "honortitles",
          icon: <MilitaryTechIcon sx={iconStyles.child} />,
          icon_on: null,
        },
        BANKS: {
          name: "Banks",
          path: "banks",
          icon: <GroupsIcon sx={iconStyles.child} />,
          icon_on: null,
        },
        TOOLS: {
          name: "Tools",
          path: "tools",
          icon: <ConstructionIcon sx={iconStyles.child} />,
          icon_on: null,
        },
        CABINETS: {
          name: "Cabinets",
          path: "cabinets",
          icon: <KitchenIcon sx={iconStyles.child} />,
          icon_on: null,
        },
        FILETYPES: {
          name: "File Types",
          path: "filetypes",
          icon: <FileOpenIcon sx={iconStyles.child} />,
          icon_on: null,
        },
        OBJECTIVES: {
          name: "Objectives",
          path: "objectives",
          icon: <EmojiObjectsIcon sx={iconStyles.child} />,
          icon_on: null,
        },
        REQUISITION: {
          name: "Requisition Types",
          path: "requisition",
          icon: <TextSnippetIcon sx={iconStyles.child} />,
          icon_on: null,
        },
        MOVEMENTTYPES: {
          name: "Movement Types",
          path: "movementtypes",
          icon: <LowPriorityIcon sx={iconStyles.child} />,
          icon_on: null,
        },
        WORKWEEKS: {
          name: "Work Weeks",
          path: "workweeks",
          icon: <EventAvailableIcon sx={iconStyles.child} />,
          icon_on: null,
        },
        WORKHOURS: {
          name: "Work Hours",
          path: "workhours",
          icon: <AccessTimeIcon sx={iconStyles.child} />,
          icon_on: null,
        },
        RESTDAYS: {
          name: "Rest Days",
          path: "restdays",
          icon: <WeekendIcon sx={iconStyles.child} />,
          icon_on: null,
        },
        JOBBANDS: {
          name: "Job Bands",
          path: "jobbands",
          icon: <WorkHistoryIcon sx={iconStyles.child} />,
          icon_on: null,
        },
        JOBLEVELS: {
          name: "Job Levels",
          path: "joblevels",
          icon: <MilitaryTechIcon sx={iconStyles.child} />,
          icon_on: null,
        },
        JOBRATES: {
          name: "Job Rates",
          path: "jobrates",
          icon: <StarIcon sx={iconStyles.child} />,
          icon_on: null,
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
      path: "/login",
      icon: null,
      icon_on: "sampleicon",
      children: null,
    },
    UNAUTHORIZED: {
      name: "Unauthorized",
      path: "/unauthorized",
      icon: null,
      icon_on: null,
      children: null,
    },
    CHANGEPASS: {
      name: "Changepass",
      path: "/changepass",
      icon: null,
      icon_on: null,
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
      icon_on: null,
    },
    CANCEL: {
      label: "Cancel",
      icon: <CancelIcon sx={iconStyles.button} />,
      icon_on: null,
    },
    SYNC: {
      label: "Sync",
      icon: <SyncIcon sx={iconStyles.sync} />,
      icon_on: null,
    },
  },
};
export default CONSTANT;
