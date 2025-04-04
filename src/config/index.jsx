import DashboardIcon from "@mui/icons-material/Dashboard";
import SummarizeIcon from "@mui/icons-material/Summarize";
import AddLocationAltIcon from "@mui/icons-material/AddLocationAlt";
import DomainAddIcon from "@mui/icons-material/DomainAdd";
import MapsHomeWorkIcon from "@mui/icons-material/MapsHomeWork";
import EmojiTransportationIcon from "@mui/icons-material/EmojiTransportation";
import MeetingRoomIcon from "@mui/icons-material/MeetingRoom";
import AccountTreeIcon from "@mui/icons-material/AccountTree";
import WorkHistoryIcon from "@mui/icons-material/WorkHistory";
import AddToPhotosIcon from "@mui/icons-material/AddToPhotos";
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

export const MODULES = {
  DASHBOARD: {
    name: "Dashboard",
    path: "/",
    icon: <DashboardIcon sx={{ marginRight: "10px", marginLeft: "6px" }} />,
    icon_on: null,
    children: null,
  },
  USERMANAGEMENT: {
    name: "User Management",
    path: "/usermanagement",
    icon: (
      <ManageAccountsIcon sx={{ marginRight: "10px", marginLeft: "6px" }} />
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

  MASTERLIST: {
    name: "Masterlist",
    path: "/masterlist",
    icon: <SummarizeIcon sx={{ marginRight: "10px", marginLeft: "6px" }} />,
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
          <WorkHistoryIcon
            sx={{ marginRight: "10px", marginLeft: "10px", width: "18px" }}
          />
        ),
        icon_on: null,
      },
    },
  },
  EMPLOYEES: {
    name: "Employee",
    path: "/employees",
    icon: <FolderSharedIcon sx={{ marginRight: "10px", marginLeft: "6px" }} />,
    icon_on: null,
    children: null,
  },
  EXTRAS: {
    name: "Extras",
    path: "/extras",
    icon: (
      <MoreIcon
        sx={{ marginRight: "10px", marginLeft: "6px", width: "19px" }}
      />
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
        path: "programss",
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
    ADD: {
      label: "Add",
      icon: <AddToPhotosIcon sx={{ marginRight: "10px", marginLeft: "6px" }} />,
      icon_on: null,
    },
    SYNC: {
      label: "Sync",
      icon: <SyncIcon sx={{ marginRight: "10px", marginLeft: "6px" }} />,
      icon_on: null,
    },
  },
};
