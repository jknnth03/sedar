import React from "react";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import InputBase from "@mui/material/InputBase";
import SearchIcon from "@mui/icons-material/Search";
import CircularProgress from "@mui/material/CircularProgress";
import AutorenewIcon from "@mui/icons-material/Autorenew";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import { styled } from "@mui/material/styles";
import { TablePagination } from "@mui/material";
import "../../pages/GeneralStyle.scss";

// Search Container - expands when input is focused
const Search = styled("div")(({ theme }) => ({
  position: "relative",
  borderRadius: theme.shape.borderRadius,
  backgroundColor: "rgb(233, 246, 255)", // ✅ Light blue background
  transition: "width 0.3s ease",
  marginLeft: "auto",
  width: "250px",
  height: "42px",
  display: "flex",
  alignItems: "center",
  "&:focus-within": {
    width: "300px",
  },
}));

// Icon inside the Search
const SearchIconWrapper = styled("div")(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: "100%",
  position: "absolute",
  pointerEvents: "none",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "rgb(33, 61, 112)", // Icon color
}));

// Input inside the Search
const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: "black",
  width: "100%",
  fontFamily: "'Helvetica Neue', Arial, sans-serif",
  "& .MuiInputBase-input": {
    padding: theme.spacing(1.5, 1, 1.5, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    height: "52px",
    boxSizing: "border-box",
    "&::placeholder": {
      color: "rgb(33, 61, 112)", // ✅ Placeholder text color
      opacity: 1, // Make sure it's not faded
    },
  },
}));

const ArchiveContainer = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  padding: "6px 12px",
  marginLeft: "-14px",
  border: "2px solid transparent",
  borderRadius: "6px",
  backgroundColor: "white",
  cursor: "pointer",
  transition: "background-color 0.2s ease-in-out",
  "&:hover": {
    backgroundColor: "#E0E0E0",
  },
  marginBottom: "-7px",
  fontFamily: "'Helvetica Neue', Arial, sans-serif",
}));

export const SearchBar = ({
  searchQuery,
  setSearchQuery,
  showArchived,
  setShowArchived,
}) => (
  <AppBar
    position="static"
    elevation={0}
    sx={{
      height: 60,
      boxShadow: "none",
      borderBottom: "none",
      backgroundColor: "transparent",
    }}>
    <Toolbar className="toolbar" style={{ borderBottom: "none", gap: "12px" }}>
      <ArchiveContainer onClick={() => setShowArchived(!showArchived)}>
        <Checkbox
          checked={showArchived}
          onChange={(e) => setShowArchived(e.target.checked)}
          sx={{
            padding: "0px",
            color: "rgb(33, 61, 112)",
            "&.Mui-checked": {
              color: "#FF4500",
            },
          }}
        />
        <span
          style={{
            marginLeft: "8px",
            color: "rgb(33, 61, 112)",
            fontWeight: 450,
            fontFamily: "'Helvetica Neue', Arial, sans-serif",
          }}>
          ARCHIVED
        </span>
      </ArchiveContainer>

      <Search>
        <SearchIconWrapper>
          <SearchIcon />
        </SearchIconWrapper>
        <StyledInputBase
          placeholder="Type here to search..."
          inputProps={{ "aria-label": "search" }}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </Search>
    </Toolbar>
  </AppBar>
);

export const SyncButton = ({ onSync, isFetching }) => (
  <Button
    variant="contained"
    color="success"
    onClick={onSync}
    className="sync-button"
    disabled={isFetching}
    startIcon={
      isFetching ? (
        <CircularProgress size={16} color="inherit" />
      ) : (
        <AutorenewIcon />
      )
    }>
    {isFetching ? "Syncing..." : "Sync"}
  </Button>
);
