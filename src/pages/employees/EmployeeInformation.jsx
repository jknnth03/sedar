import * as React from "react";
import Box from "@mui/material/Box";
import Tab from "@mui/material/Tab";
import TabContext from "@mui/lab/TabContext";
import TabList from "@mui/lab/TabList";
import TabPanel from "@mui/lab/TabPanel";
import {
  Button,
  Typography,
  TextField,
  Checkbox,
  FormControlLabel,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import ArchiveIcon from "@mui/icons-material/Archive";
import GeneralInformation from "../../pages/employees/Generalinformation.jsx";
import Address from "../../pages/employees/Address.jsx";
import PositionsEmp from "../../pages/employees/Positionsemp.jsx";
import EmpTypes from "../../pages/employees/EmpTypes.jsx";
import STATUSES from "../../pages/employees/Statuses.jsx";
import CONTACTS from "../../pages/employees/Contacts.jsx";
import ATTAINMENTSEMP from "../../pages/employees/Attainmentsemp.jsx";
import ACCOUNTS from "../../pages/employees/Accounts.jsx";
import FILES from "../../pages/employees/Files.jsx";
import MultiFormModal from "../../components/modal/employee/MultiFormModal.jsx";
import "../../pages/GeneralStyle.scss";
import "../../pages/GeneralTable.scss";
import { useRememberQueryParams } from "../../hooks/useRememberQueryParams.js";
import useDebounce from "../../hooks/useDebounce";
import EmployeeModal from "./components/EmployeeModal.jsx";

// Custom SearchBar Component
const CustomSearchBar = ({
  searchQuery,
  setSearchQuery,
  showArchived,
  setShowArchived,
}) => {
  const iconColor = showArchived ? "red" : "rgb(33, 61, 112)";
  const labelColor = showArchived ? "red" : "rgb(33, 61, 112)";

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
      <FormControlLabel
        control={
          <Checkbox
            checked={showArchived}
            onChange={(e) => setShowArchived(e.target.checked)}
            icon={<ArchiveIcon sx={{ color: iconColor }} />}
            checkedIcon={<ArchiveIcon sx={{ color: iconColor }} />}
          />
        }
        label="ARCHIVED"
        sx={{
          margin: 0,
          border: "1px solid #ccc",
          borderRadius: "8px",
          paddingLeft: "8px",
          paddingRight: "12px",
          height: "36px",
          backgroundColor: "white",
          "&:hover": {
            backgroundColor: "#f5f5f5",
          },
          "& .MuiFormControlLabel-label": {
            fontSize: "14px",
            fontWeight: 500,
            color: labelColor,
          },
        }}
      />

      <TextField
        placeholder="Type here to search..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        size="small"
        InputProps={{
          startAdornment: <SearchIcon sx={{ color: "#666", marginRight: 1 }} />,
          sx: {
            height: "36px",
            width: "320px",
            backgroundColor: "white",
            "& .MuiOutlinedInput-root": {
              height: "36px",
              "& fieldset": {
                borderColor: "#ccc",
              },
              "&:hover fieldset": {
                borderColor: "rgb(33, 61, 112)",
              },
              "&.Mui-focused fieldset": {
                borderColor: "rgb(33, 61, 112)",
                borderWidth: "2px",
              },
            },
          },
        }}
        sx={{
          "& .MuiInputBase-input": {
            fontSize: "14px",
          },
        }}
      />
    </Box>
  );
};

function EmployeeInformation() {
  const [currentParams, setQueryParams] = useRememberQueryParams();
  const [value, setValue] = React.useState(currentParams?.tab ?? "1");
  const [openModal, setOpenModal] = React.useState(false);

  const [searchQuery, setSearchQuery] = React.useState(currentParams?.q ?? "");
  const [showArchived, setShowArchived] = React.useState(
    currentParams?.archived === "true"
  );
  const debounceValue = useDebounce(searchQuery, 500);

  const handleChange = (event, newValue) => {
    setQueryParams(
      { tab: newValue, q: searchQuery, archived: showArchived },
      { retain: true }
    );
    setValue(newValue);
  };

  const handleOpenModal = () => {
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
  };

  const handleSearchChange = React.useCallback(
    (newSearchQuery) => {
      setSearchQuery(newSearchQuery);
      setQueryParams(
        { q: newSearchQuery, archived: showArchived, tab: value },
        { retain: true }
      );
    },
    [setQueryParams, showArchived, value]
  );

  const handleArchivedChange = React.useCallback(
    (newShowArchived) => {
      setShowArchived(newShowArchived);
      setQueryParams(
        { q: searchQuery, archived: newShowArchived, tab: value },
        { retain: true }
      );
    },
    [setQueryParams, searchQuery, value]
  );

  const sharedSearchProps = {
    searchQuery,
    showArchived,
    debounceValue,
    onSearchChange: handleSearchChange,
    onArchivedChange: handleArchivedChange,
  };

  return (
    <Box
      sx={{
        width: "100%",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexShrink: 0,
          minHeight: "60px",
        }}>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Typography className="header" sx={{ paddingRight: "1rem" }}>
            EMPLOYEE INFORMATION
          </Typography>
          <Button
            variant="contained"
            onClick={handleOpenModal}
            startIcon={<AddIcon />}
            sx={{
              backgroundColor: "rgb(33, 61, 112)",
              height: "36px",
              textTransform: "none",
              "&:hover": {
                backgroundColor: "rgb(25, 45, 84)",
              },
            }}>
            CREATE
          </Button>
        </Box>

        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-end",
            paddingLeft: "3px",
          }}>
          <CustomSearchBar
            searchQuery={searchQuery}
            setSearchQuery={handleSearchChange}
            showArchived={showArchived}
            setShowArchived={handleArchivedChange}
          />
        </Box>
      </Box>

      {/* <MultiFormModal open={openModal} onClose={handleCloseModal} /> */}
      <EmployeeModal isOpen={openModal} onClose={handleCloseModal} />

      <TabContext value={value}>
        <Box
          sx={{
            flexShrink: 0,
            minHeight: "48px",
            borderBottom: "1px solid #e0e0e0",
          }}>
          <TabList
            onChange={handleChange}
            aria-label="employee information tabs"
            sx={{
              "& .MuiTab-root": {
                textTransform: "none",
                fontWeight: 600,
                fontSize: "14px",
                minHeight: "48px",
              },
            }}>
            <Tab label="GENERAL INFO" value="1" />
            <Tab label="ADDRESS" value="2" />
            <Tab label="EMPLOYEE POSITION" value="3" />
            <Tab label="EMPLOYMENT TYPE" value="4" />
            <Tab label="STATUS" value="5" />
            <Tab label="ATTAINMENT" value="6" />
            <Tab label="ACCOUNT" value="7" />
            <Tab label="CONTACT" value="8" />
            <Tab label="FILE" value="9" />
          </TabList>
        </Box>

        <Box
          sx={{
            flex: 1,
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
          }}>
          <TabPanel value="1" sx={{ padding: 0, flex: 1, overflow: "auto" }}>
            <GeneralInformation {...sharedSearchProps} />
          </TabPanel>
          <TabPanel value="2" sx={{ padding: 0, flex: 1, overflow: "auto" }}>
            <Address {...sharedSearchProps} />
          </TabPanel>
          <TabPanel value="3" sx={{ padding: 0, flex: 1, overflow: "auto" }}>
            <PositionsEmp {...sharedSearchProps} />
          </TabPanel>
          <TabPanel value="4" sx={{ padding: 0, flex: 1, overflow: "auto" }}>
            <EmpTypes {...sharedSearchProps} />
          </TabPanel>
          <TabPanel value="5" sx={{ padding: 0, flex: 1, overflow: "auto" }}>
            <STATUSES {...sharedSearchProps} />
          </TabPanel>
          <TabPanel value="6" sx={{ padding: 0, flex: 1, overflow: "auto" }}>
            <ATTAINMENTSEMP {...sharedSearchProps} />
          </TabPanel>
          <TabPanel value="7" sx={{ padding: 0, flex: 1, overflow: "auto" }}>
            <ACCOUNTS {...sharedSearchProps} />
          </TabPanel>
          <TabPanel value="8" sx={{ padding: 0, flex: 1, overflow: "auto" }}>
            <CONTACTS {...sharedSearchProps} />
          </TabPanel>
          <TabPanel value="9" sx={{ padding: 0, flex: 1, overflow: "auto" }}>
            <FILES {...sharedSearchProps} />
          </TabPanel>
        </Box>
      </TabContext>
    </Box>
  );
}

export default EmployeeInformation;
