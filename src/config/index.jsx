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
import RecordVoiceOverIcon from "@mui/icons-material/RecordVoiceOver";
import HowToRegIcon from "@mui/icons-material/HowToReg";
import CloudSyncIcon from "@mui/icons-material/CloudSync";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import VpnKeyIcon from "@mui/icons-material/VpnKey";
import LowPriorityIcon from "@mui/icons-material/LowPriority";

import NotificationBadge from "./NotificationBadge";
import { useShowDashboardQuery } from "../features/api/usermanagement/dashboardApi";
import moduleApi from "../features/api/usermanagement/dashboardApi";
import formSubmissionApi from "../features/api/approvalsetting/formSubmissionApi";

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
      (apiResult.approval?.registration_approval || 0),
    manpowerFormApprovals: apiResult.approval?.manpower_form || 0,
    registrationApprovals: apiResult.approval?.registration_approval || 0,

    pendingReceiving:
      (apiResult.receiving?.pending_mrfs || 0) +
      (apiResult.receiving?.pending_data_changes || 0),
    pendingMrfReceiving: apiResult.receiving?.pending_mrfs || 0,
    pendingDataChangeReceiving: apiResult.receiving?.pending_data_changes || 0,

    rejectedReturnedSubmissions: apiResult.requisition?.manpower_form || 0,
    rejectedDataChanges: apiResult.requisition?.["201_data_change"] || 0,
  };

  return {
    DASHBOARD: {
      name: "Dashboard",
      path: "/",
      icon: <DashboardIcon sx={{ marginRight: "5px", marginLeft: "6px" }} />,
      icon_on: null,
      children: null,
    },

    USERMANAGEMENT: {
      name: "User Management",
      path: "/usermanagement",
      icon: (
        <ManageAccountsIcon sx={{ marginRight: "5px", marginLeft: "6px" }} />
      ),
      icon_on: null,
      children: {
        USER: {
          name: "User",
          path: "user",
          icon: (
            <PersonAddIcon
              sx={{ marginRight: "10px", marginLeft: "10px", width: "20px" }}
            />
          ),
          icon_on: null,
        },
        ROLES: {
          name: "Roles",
          path: "roles",
          icon: (
            <FolderSharedIcon
              sx={{ marginRight: "10px", marginLeft: "10px", width: "20px" }}
            />
          ),
          icon_on: null,
        },
      },
    },
    EMPLOYEES: {
      name: "Employees",
      path: "/employees",
      icon: <FolderSharedIcon sx={{ marginRight: "5px", marginLeft: "6px" }} />,
      icon_on: null,
      notificationCount: counts.pendingRegistrations,
      children: {
        EMPLOYEEINFORMATION: {
          name: "Employee Information",
          path: "employeeinformation",
          icon: (
            <InfoIcon
              sx={{ marginRight: "10px", marginLeft: "10px", width: "18px" }}
            />
          ),
          icon_on: null,
        },
        PENDINGREGISTRATION: {
          name: "Pending Registration",
          path: "pendingregistration",
          icon: (
            <PendingActionsIcon
              sx={{ marginRight: "10px", marginLeft: "10px", width: "18px" }}
            />
          ),
          icon_on: null,
          notificationCount: counts.pendingRegistrations,
        },
      },
    },
    RECEIVING: {
      name: "Receiving",
      path: "/receiving",
      icon: (
        <ArchiveIcon
          sx={{
            marginRight: "5px",
            marginLeft: "6px",
            width: "22px",
            height: "22px",
          }}
        />
      ),
      icon_on: null,
      notificationCount: counts.pendingReceiving,
      children: {
        PENDINGFORMS: {
          name: "MRF Receiving",
          path: "pendingforms",
          icon: (
            <MarkAsUnreadIcon
              sx={{ marginRight: "10px", marginLeft: "10px", width: "18px" }}
            />
          ),
          icon_on: null,
          notificationCount: counts.pendingMrfReceiving,
        },
        DATACHANGERECEIVING: {
          name: "201 DC Receiving",
          path: "datachangereceiving",
          icon: (
            <CloudSyncIcon
              sx={{ marginRight: "10px", marginLeft: "10px", width: "18px" }}
            />
          ),
          icon_on: null,
          notificationCount: counts.pendingDataChangeReceiving,
        },
      },
    },

    APPROVALSETTINGS: {
      name: "Approval Settings",
      path: "/approvalsetting",
      icon: (
        <ApprovalIcon
          sx={{
            marginRight: "5px",
            marginLeft: "6px",
            width: "22px",
            height: "22px",
          }}
        />
      ),
      icon_on: null,
      children: {
        APPROVALFORM: {
          name: "Approval Form",
          path: "approvalform",
          icon: (
            <AssignmentTurnedInIcon
              sx={{ marginRight: "10px", marginLeft: "10px", width: "18px" }}
            />
          ),
          icon_on: null,
        },
        APPROVALFLOW: {
          name: "Approval Flow",
          path: "approvalflow",
          icon: (
            <DragIndicatorIcon
              sx={{ marginRight: "10px", marginLeft: "10px", width: "18px" }}
            />
          ),
          icon_on: null,
        },
        RECEIVER: {
          name: "Receiver",
          path: "receiver",
          icon: (
            <RecordVoiceOverIcon
              sx={{ marginRight: "10px", marginLeft: "10px", width: "18px" }}
            />
          ),
          icon_on: null,
        },
        APPROVER: {
          name: "Approver",
          path: "approver",
          icon: (
            <HowToRegIcon
              sx={{ marginRight: "10px", marginLeft: "10px", width: "18px" }}
            />
          ),
          icon_on: null,
        },
      },
    },

    APPROVING: {
      name: "Approval",
      path: "/approving",
      icon: (
        <GavelIcon
          sx={{
            marginRight: "5px",
            marginLeft: "6px",
            width: "20px",
            height: "20px",
          }}
        />
      ),
      icon_on: null,
      notificationCount: counts.pendingApprovals,
      children: {
        SUBMISSIONAPPROVAL: {
          name: "MRF Approval",
          path: "submissionapproval",
          icon: (
            <TaskIcon
              sx={{ marginRight: "10px", marginLeft: "10px", width: "18px" }}
            />
          ),
          icon_on: null,
          notificationCount: counts.manpowerFormApprovals,
        },
        REGISTRATIONAPPROVAL: {
          name: "Registration Approval",
          path: "registrationapproval",
          icon: (
            <HowToRegIcon
              sx={{ marginRight: "10px", marginLeft: "10px", width: "18px" }}
            />
          ),
          icon_on: null,
          notificationCount: counts.registrationApprovals,
        },
      },
    },

    REQUEST: {
      name: "Requisition",
      path: "/request",
      icon: (
        <PendingActionsIcon
          sx={{
            marginRight: "5px",
            marginLeft: "6px",
            width: "23px",
            height: "23px",
          }}
        />
      ),
      icon_on: null,
      notificationCount:
        counts.rejectedReturnedSubmissions + counts.rejectedDataChanges,
      children: {
        MRFMAINCONTAINER: {
          name: "Manpower Form",
          path: "mrfmaincontainer",
          icon: (
            <MarkEmailReadIcon
              sx={{ marginRight: "10px", marginLeft: "10px", width: "18px" }}
            />
          ),
          icon_on: null,
          notificationCount: counts.rejectedReturnedSubmissions,
        },
        DATACHANGEMAINCONTAINER: {
          name: "201 Datachange",
          path: "datachangemaincontainer",
          icon: (
            <CloudSyncIcon
              sx={{ marginRight: "10px", marginLeft: "10px", width: "18px" }}
            />
          ),
          icon_on: null,
          notificationCount: counts.rejectedDataChanges,
        },
      },
    },
    EVALUATION: {
      name: "Evaluation",
      path: "/evaluation",
      icon: (
        <TrendingUpIcon
          sx={{
            marginRight: "5px",
            marginLeft: "6px",
            width: "23px",
            height: "23px",
          }}
        />
      ),
      icon_on: null,
      notificationCount:
        counts.rejectedReturnedSubmissions + counts.rejectedDataChanges,
      children: {
        KPI: {
          name: "KPI",
          path: "kpi",
          icon: (
            <VpnKeyIcon
              sx={{ marginRight: "10px", marginLeft: "10px", width: "18px" }}
            />
          ),
          icon_on: null,
          notificationCount: counts.rejectedReturnedSubmissions,
        },
      },
    },
    MASTERLIST: {
      name: "Masterlist",
      path: "/masterlist",
      icon: (
        <SummarizeIcon
          sx={{
            marginRight: "5px",
            marginLeft: "6px",
            width: "23px",
            height: "23px",
          }}
        />
      ),
      icon_on: null,
      children: {
        ONERDF: {
          name: "Charging",
          path: "onerdf",
          icon: (
            <LocationOnIcon
              sx={{ marginRight: "10px", marginLeft: "10px", width: "18px" }}
            />
          ),
          icon_on: null,
        },
        POSITIONS: {
          name: "Position",
          path: "positions",
          icon: (
            <BadgeIcon
              sx={{ marginRight: "10px", marginLeft: "10px", width: "18px" }}
            />
          ),
          icon_on: null,
        },
        JOBBANDS: {
          name: "Job Bands",
          path: "jobbands",
          icon: (
            <WorkHistoryIcon
              sx={{ marginRight: "10px", marginLeft: "10px", width: "18px" }}
            />
          ),
          icon_on: null,
        },
        JOBLEVELS: {
          name: "Job Levels",
          path: "joblevels",
          icon: (
            <MilitaryTechIcon
              sx={{ marginRight: "10px", marginLeft: "10px", width: "18px" }}
            />
          ),
          icon_on: null,
        },
        JOBRATES: {
          name: "Job Rates",
          path: "jobrates",
          icon: (
            <StarIcon
              sx={{ marginRight: "10px", marginLeft: "10px", width: "18px" }}
            />
          ),
          icon_on: null,
        },
      },
    },

    ADMINISTRATIVEDIVISION: {
      name: "Administrative Divisions",
      path: "/administrative-divisions",
      icon: <ExploreIcon sx={{ marginRight: "5px", marginLeft: "6px" }} />,
      icon_on: null,
      children: {
        REGIONS: {
          name: "Regions",
          path: "regions",
          icon: (
            <ExploreIcon
              sx={{ marginRight: "10px", marginLeft: "10px", width: "18px" }}
            />
          ),
          icon_on: null,
        },
        PROVINCES: {
          name: "Provinces",
          path: "provinces",
          icon: (
            <LocationOnIcon
              sx={{ marginRight: "10px", marginLeft: "10px", width: "18px" }}
            />
          ),
          icon_on: null,
        },
        MUNICIPALITIES: {
          name: "Municipalities",
          path: "municipalities",
          icon: (
            <GavelIcon
              sx={{ marginRight: "10px", marginLeft: "10px", width: "18px" }}
            />
          ),
          icon_on: null,
        },
        SUBMUNICIPALITIES: {
          name: "Sub Municipalities",
          path: "submunicipalities",
          icon: (
            <CategoryIcon
              sx={{ marginRight: "10px", marginLeft: "10px", width: "18px" }}
            />
          ),
          icon_on: null,
        },
        BARANGAYS: {
          name: "Barangays",
          path: "barangays",
          icon: (
            <AccountBalanceIcon
              sx={{ marginRight: "10px", marginLeft: "10px", width: "18px" }}
            />
          ),
          icon_on: null,
        },
      },
    },

    EXTRAS: {
      name: "Extras",
      path: "/extras",
      icon: (
        <SettingsSuggestIcon sx={{ marginRight: "5px", marginLeft: "6px" }} />
      ),
      icon_on: null,
      children: {
        TITLES: {
          name: "Titles",
          path: "titles",
          icon: (
            <TitleIcon
              sx={{ marginRight: "10px", marginLeft: "10px", width: "18px" }}
            />
          ),
          icon_on: null,
        },
        SCHEDULES: {
          name: "Schedules",
          path: "schedules",
          icon: (
            <CalendarMonthIcon
              sx={{ marginRight: "10px", marginLeft: "10px", width: "18px" }}
            />
          ),
          icon_on: null,
        },
        TEAMS: {
          name: "Teams",
          path: "teams",
          icon: (
            <GroupsIcon
              sx={{ marginRight: "10px", marginLeft: "10px", width: "18px" }}
            />
          ),
          icon_on: null,
        },
        RELIGIONS: {
          name: "Religions",
          path: "religions",
          icon: (
            <ChurchIcon
              sx={{ marginRight: "10px", marginLeft: "10px", width: "18px" }}
            />
          ),
          icon_on: null,
        },
        PREFIXES: {
          name: "Prefixes",
          path: "prefixes",
          icon: (
            <ExtensionIcon
              sx={{ marginRight: "10px", marginLeft: "10px", width: "18px" }}
            />
          ),
          icon_on: null,
        },
        PROGRAMS: {
          name: "Programs",
          path: "programs",
          icon: (
            <FeaturedPlayListIcon
              sx={{ marginRight: "10px", marginLeft: "10px", width: "18px" }}
            />
          ),
          icon_on: null,
        },
        ATTAINMENTS: {
          name: "Attainments",
          path: "attainments",
          icon: (
            <WorkIcon
              sx={{ marginRight: "10px", marginLeft: "10px", width: "18px" }}
            />
          ),
          icon_on: null,
        },
        DEGREES: {
          name: "Degrees",
          path: "degrees",
          icon: (
            <SchoolIcon
              sx={{ marginRight: "10px", marginLeft: "10px", width: "18px" }}
            />
          ),
          icon_on: null,
        },
        HONORTITLES: {
          name: "Honor Titles",
          path: "honortitles",
          icon: (
            <MilitaryTechIcon
              sx={{ marginRight: "10px", marginLeft: "10px", width: "18px" }}
            />
          ),
          icon_on: null,
        },
        BANKS: {
          name: "Banks",
          path: "banks",
          icon: (
            <GroupsIcon
              sx={{ marginRight: "10px", marginLeft: "10px", width: "18px" }}
            />
          ),
          icon_on: null,
        },
        TOOLS: {
          name: "Tools",
          path: "tools",
          icon: (
            <ConstructionIcon
              sx={{ marginRight: "10px", marginLeft: "10px", width: "18px" }}
            />
          ),
          icon_on: null,
        },
        CABINETS: {
          name: "Cabinets",
          path: "cabinets",
          icon: (
            <KitchenIcon
              sx={{ marginRight: "10px", marginLeft: "10px", width: "18px" }}
            />
          ),
          icon_on: null,
        },
        FILETYPES: {
          name: "File Types",
          path: "filetypes",
          icon: (
            <FileOpenIcon
              sx={{ marginRight: "10px", marginLeft: "10px", width: "18px" }}
            />
          ),
          icon_on: null,
        },
        OBJECTIVES: {
          name: "Objectives",
          path: "objectives",
          icon: (
            <EmojiObjectsIcon
              sx={{ marginRight: "10px", marginLeft: "10px", width: "18px" }}
            />
          ),
          icon_on: null,
        },
        REQUISITION: {
          name: "Requisition Types",
          path: "requisition",
          icon: (
            <TextSnippetIcon
              sx={{ marginRight: "10px", marginLeft: "10px", width: "18px" }}
            />
          ),
          icon_on: null,
        },
        MOVEMENTTYPES: {
          name: "Movement Types",
          path: "movementtypes",
          icon: (
            <LowPriorityIcon
              sx={{ marginRight: "10px", marginLeft: "10px", width: "18px" }}
            />
          ),
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
      icon: (
        <img
          src={NoDataGIF}
          alt="No Data"
          style={{
            width: "365px",
            height: "auto",
            display: "block",
            margin: "0 auto",
          }}
        />
      ),
    },
    ADD: {
      label1: "Save",
      label2: "Update",
      icon1: (
        <SaveIcon
          sx={{
            marginRight: "5px",
            width: 16,
            height: 16,
          }}
        />
      ),
      icon2: (
        <EditIcon
          sx={{
            marginRight: "5px",
            width: 16,
            height: 16,
          }}
        />
      ),
      icon_on: null,
    },
    CANCEL: {
      label: "Cancel",
      icon: (
        <CancelIcon
          sx={{
            marginRight: "5px",
            width: 16,
            height: 16,
          }}
        />
      ),
      icon_on: null,
    },
    SYNC: {
      label: "Sync",
      icon: <SyncIcon sx={{ marginRight: "10px", marginLeft: "6px" }} />,
      icon_on: null,
    },
  },
};
