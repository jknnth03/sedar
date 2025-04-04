import * as React from "react";
import PropTypes from "prop-types";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Brightness5Icon from "@mui/icons-material/Brightness5";
import img from "../../assets/welcome.png";
import "../../pages/dashboard/Dashboard.scss";
import { useSelector } from "react-redux";

function DashboardLayoutNavigationActions() {
  const [currentDate, setCurrentDate] = React.useState("");
  const token = useSelector((state) => state?.auth?.token);

  console.log(token);

  React.useEffect(() => {
    const now = new Date();
    const options = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    setCurrentDate(now.toLocaleDateString("en-US", options));
  }, []);

  return (
    <Box className="headerbox">
      <Typography className="header">Dashboard</Typography>
      <Box display="flex">
        <Box flexGrow={1}>
          <Box className="dashboard_box">
            <Brightness5Icon className="brightness_icon" />
            <Box>
              <Typography className="firstline">
                Fresh Morning, USER!
              </Typography>
              <Typography className="secondline">{currentDate}</Typography>
              <Typography>Welcome to Sedar 2.0</Typography>
              <Typography>
                Streamlining the procurement process, making it smoother and
                more productive.
              </Typography>
            </Box>
            <img src={img} alt="Welcome" className="welcome_img" />
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

DashboardLayoutNavigationActions.propTypes = {
  window: PropTypes.func,
};

export default DashboardLayoutNavigationActions;
