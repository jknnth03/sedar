import DashboardIcon from "@mui/icons-material/Dashboard";
import SummarizeIcon from "@mui/icons-material/Summarize";
import AddLocationAltIcon from "@mui/icons-material/AddLocationAlt";
import DomainAddIcon from "@mui/icons-material/DomainAdd";
import MapsHomeWorkIcon from "@mui/icons-material/MapsHomeWork";
import EmojiTransportationIcon from "@mui/icons-material/EmojiTransportation";
import MeetingRoomIcon from "@mui/icons-material/MeetingRoom";
import AccountTreeIcon from "@mui/icons-material/AccountTree";
import SubtitlesIcon from "@mui/icons-material/Subtitles";
import WorkHistoryIcon from "@mui/icons-material/WorkHistory";
import EngineeringIcon from "@mui/icons-material/Engineering";
import DataSaverOnIcon from "@mui/icons-material/DataSaverOn";

export const MODULES = {
  DASHBOARD: {
    name: "Dashboard",
    path: "/dashboard",
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
      DIVISION: {
        name: "Division",
        path: "division",
        icon: (
          <DomainAddIcon
            sx={{ marginRight: "10px", marginLeft: "10px", width: "18px" }}
          />
        ),
        icon_on: null,
      },
      DIVISION_CATEGORIES: {
        name: "Division Categories",
        path: "division-categories",
        icon: (
          <MapsHomeWorkIcon
            sx={{ marginRight: "10px", marginLeft: "10px", width: "18px" }}
          />
        ),
        icon_on: null,
      },
      COMPANIES: {
        name: "Companies",
        path: "companies",
        icon: (
          <EmojiTransportationIcon
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
      SUB_UNITS: {
        name: "Sub Units",
        path: "subunits",
        icon: (
          <AccountTreeIcon
            sx={{ marginRight: "10px", marginLeft: "10px", width: "18px" }}
          />
        ),
        icon_on: null,
      },
      TITLES: {
        name: "Titles",
        path: "titles",
        icon: (
          <SubtitlesIcon
            sx={{ marginRight: "10px", marginLeft: "10px", width: "18px" }}
          />
        ),
        icon_on: null,
      },
      JOB_BANDS: {
        name: "Job Bands",
        path: "jobbands",
        icon: (
          <WorkHistoryIcon
            sx={{ marginRight: "10px", marginLeft: "10px", width: "18px" }}
          />
        ),
        icon_on: null,
      },
      POSITIONS: {
        name: "Positions",
        path: "positions",
        icon: (
          <EngineeringIcon
            sx={{ marginRight: "10px", marginLeft: "10px", width: "18px" }}
          />
        ),
        icon_on: null,
      },
      EXTRAS: {
        name: "Extras",
        path: "extras",
        icon: (
          <DataSaverOnIcon
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
  },
};
