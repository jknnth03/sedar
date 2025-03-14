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
import TitleIcon from "@mui/icons-material/Title"; // Added icon for Titles

export const MODULES = {
  DASHBOARD: {
    name: "Dashboard",
    path: "/",
    icon: <DashboardIcon sx={{ marginRight: "10px", marginLeft: "6px" }} />,
    icon_on: null,
    children: null,
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
            sx={{ marginRight: "10px", marginLeft: "10px", width: "18px" }}
          />
        ),
        icon_on: null,
      },
      BUSINESS_UNIT: {
        name: "Business Unit",
        path: "businessunit",
        icon: (
          <DomainAddIcon
            sx={{ marginRight: "10px", marginLeft: "10px", width: "18px" }}
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
    icon: <MoreIcon sx={{ marginRight: "10px", marginLeft: "6px" }} />,
    icon_on: null,
    children: {
      TITLES: {
        name: "Titles",
        path: "titles", // Fixed missing quote
        icon: (
          <TitleIcon
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
