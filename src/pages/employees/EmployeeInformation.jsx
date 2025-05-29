import * as React from "react";
import Box from "@mui/material/Box";
import Tab from "@mui/material/Tab";
import TabContext from "@mui/lab/TabContext";
import TabList from "@mui/lab/TabList";
import TabPanel from "@mui/lab/TabPanel";
import { Button, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import GeneralInformation from "../../pages/employees/Generalinformation.jsx";
import Address from "../../pages/employees/Address.jsx";
import PositionsEmp from "../../pages/employees/Positionsemp.jsx";
import EMPLOYMENT_TYPES from "../../pages/employees/EmployeeTypes.jsx";
import STATUSES from "../../pages/employees/Statuses.jsx";
import CONTACTS from "../../pages/employees/Contacts.jsx";
import ATTAINMENTSEMP from "../../pages/employees/Attainmentsemp.jsx";
import ACCOUNTS from "../../pages/employees/Accounts.jsx";
import FILES from "../../pages/employees/Files.jsx";
import "../../pages/GeneralStyle.scss";

function EmployeeInformation() {
  const [value, setValue] = React.useState("1");

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const handleAddEmployee = () => {
    console.log("Add employee clicked from parent");
  };

  return (
    <Box sx={{ width: "100%", typography: "body1" }}>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          px: 2,
        }}>
        <div className="header-container">
          <Typography className="header">Employee Positions</Typography>
        </div>
        <Button
          variant="contained"
          onClick={handleAddEmployee}
          startIcon={<AddIcon />}
          sx={{
            backgroundColor: "rgb(33, 61, 112)",
            "&:hover": {
              backgroundColor: "rgb(25, 45, 84)",
            },
          }}>
          CREATE
        </Button>
      </Box>

      <TabContext value={value}>
        <Box
          sx={{
            borderBottom: 1,
            borderColor: "divider",
            px: 2,
          }}>
          <TabList
            onChange={handleChange}
            aria-label="employee information tabs"
            sx={{
              "& .MuiTab-root": {
                textTransform: "none",
                fontWeight: 600,
                fontSize: "14px",
                marginLeft: 0.5,
              },
            }}>
            <Tab label="General Information" value="1" />
            <Tab label="Address" value="2" />
            <Tab label="Employee Position" value="3" />
            <Tab label="Employment Types" value="4" />
            <Tab label="Statuses" value="5" />
            <Tab label="Contacts" value="6" />
            <Tab label="Attainments" value="7" />
            <Tab label="Accounts" value="8" />
            <Tab label="Files" value="9" />
          </TabList>
        </Box>

        <TabPanel value="1" sx={{ p: 0 }}>
          <GeneralInformation />
        </TabPanel>
        <TabPanel value="2" sx={{ p: 2 }}>
          <Typography>
            <Address />
          </Typography>
        </TabPanel>
        <TabPanel value="3" sx={{ p: 2 }}>
          <Typography>
            <PositionsEmp />
          </Typography>
        </TabPanel>
        <TabPanel value="4" sx={{ p: 2 }}>
          <Typography>
            <EMPLOYMENT_TYPES />
          </Typography>
        </TabPanel>
        <TabPanel value="5" sx={{ p: 2 }}>
          <Typography>
            <STATUSES />
          </Typography>
        </TabPanel>
        <TabPanel value="6" sx={{ p: 2 }}>
          <Typography>
            <CONTACTS />
          </Typography>
        </TabPanel>
        <TabPanel value="7" sx={{ p: 2 }}>
          <Typography>
            <ATTAINMENTSEMP />
          </Typography>
        </TabPanel>
        <TabPanel value="8" sx={{ p: 2 }}>
          <Typography>
            <ACCOUNTS />
          </Typography>
        </TabPanel>
        <TabPanel value="9" sx={{ p: 2 }}>
          <Typography>
            <FILES />
          </Typography>
        </TabPanel>
      </TabContext>
    </Box>
  );
}

export default EmployeeInformation;
