import DashboardIcon from "@mui/icons-material/Dashboard";
import SummarizeIcon from "@mui/icons-material/Summarize";
import AddLocationAltIcon from "@mui/icons-material/AddLocationAlt";
import DomainAddIcon from "@mui/icons-material/DomainAdd";
import MapsHomeWorkIcon from "@mui/icons-material/MapsHomeWork";
import EmojiTransportationIcon from "@mui/icons-material/EmojiTransportation";
import MeetingRoomIcon from "@mui/icons-material/MeetingRoom";
import AccountTreeIcon from "@mui/icons-material/AccountTree";
import WorkHistoryIcon from "@mui/icons-material/WorkHistory";
import FolderSharedIcon from "@mui/icons-material/FolderShared";
import SyncIcon from "@mui/icons-material/Sync";
import MoreIcon from "@mui/icons-material/More";
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
import HomeIcon from "@mui/icons-material/Home";
import ControlCameraIcon from "@mui/icons-material/ControlCamera";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ContactPhoneIcon from "@mui/icons-material/ContactPhone";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import FolderZipIcon from "@mui/icons-material/FolderZip";

export const MODULES = {
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
    icon: <ManageAccountsIcon sx={{ marginRight: "5px", marginLeft: "6px" }} />,
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
      GENERAL_INFORMATION: {
        name: "General Information",
        path: "generalinformation",
        icon: (
          <InfoIcon
            sx={{ marginRight: "10px", marginLeft: "10px", width: "18px" }}
          />
        ),
        icon_on: null,
      },

      ADDRESS: {
        name: "Address",
        path: "address",
        icon: (
          <HomeIcon
            sx={{ marginRight: "10px", marginLeft: "10px", width: "18px" }}
          />
        ),
        icon_on: null,
      },
      POSITIONS: {
        name: "Employee Positions",
        path: "positionsemp",
        icon: (
          <ControlCameraIcon
            sx={{ marginRight: "10px", marginLeft: "10px", width: "18px" }}
          />
        ),
        icon_on: null,
      },
      EMPLOYMENT_TYPES: {
        name: "Employment Types",
        path: "employmentypes",
        icon: (
          <WorkIcon
            sx={{ marginRight: "10px", marginLeft: "10px", width: "18px" }}
          />
        ),
        icon_on: null,
      },
      STATUSES: {
        name: "Statuses",
        path: "statuses",
        icon: (
          <CheckCircleOutlineIcon
            sx={{ marginRight: "10px", marginLeft: "10px", width: "18px" }}
          />
        ),
        icon_on: null,
      },
      CONTACTS: {
        name: "Contacts",
        path: "contacts",
        icon: (
          <ContactPhoneIcon
            sx={{ marginRight: "10px", marginLeft: "10px", width: "18px" }}
          />
        ),
        icon_on: null,
      },
      ATTAINMENTSEMP: {
        name: "Employee Attainments",
        path: "Attainmentsemp",
        icon: (
          <SchoolIcon
            sx={{ marginRight: "10px", marginLeft: "10px", width: "18px" }}
          />
        ),
        icon_on: null,
      },
      ACCOUNTS: {
        name: "Accounts",
        path: "accounts",
        icon: (
          <AccountCircleIcon
            sx={{ marginRight: "10px", marginLeft: "10px", width: "18px" }}
          />
        ),
        icon_on: null,
      },
      FILES: {
        name: "Files",
        path: "files",
        icon: (
          <FolderZipIcon
            sx={{ marginRight: "10px", marginLeft: "10px", width: "18px" }}
          />
        ),
        icon_on: null,
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
      COMPANIES: {
        name: "Company",
        path: "companies",
        icon: (
          <EmojiTransportationIcon
            sx={{ marginRight: "10px", marginLeft: "10px", width: "20px" }}
          />
        ),
        icon_on: null,
      },
      BUSINESS_UNIT: {
        name: "Business Unit",
        path: "businessunit",
        icon: (
          <DomainAddIcon
            sx={{ marginRight: "10px", marginLeft: "10px", width: "20px" }}
          />
        ),
        icon_on: null,
      },
      DEPARTMENTS: {
        name: "Department",
        path: "department",
        icon: (
          <MeetingRoomIcon
            sx={{ marginRight: "10px", marginLeft: "10px", width: "18px" }}
          />
        ),
        icon_on: null,
      },
      UNITS: {
        name: "Unit",
        path: "units",
        icon: (
          <MapsHomeWorkIcon
            sx={{ marginRight: "10px", marginLeft: "10px", width: "18px" }}
          />
        ),
        icon_on: null,
      },
      SUB_UNITS: {
        name: "Sub-Unit",
        path: "subunits",
        icon: (
          <AccountTreeIcon
            sx={{ marginRight: "10px", marginLeft: "10px", width: "18px" }}
          />
        ),
        icon_on: null,
      },
      LOCATION: {
        name: "Location",
        path: "location",
        icon: (
          <AddLocationAltIcon
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
    icon: <MoreIcon sx={{ marginRight: "5px", marginLeft: "6px" }} />,
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
    },
  },
};

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
