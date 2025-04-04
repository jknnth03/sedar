import React from "react";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import InputBase from "@mui/material/InputBase";
import SearchIcon from "@mui/icons-material/Search";
import CircularProgress from "@mui/material/CircularProgress";
import AutorenewIcon from "@mui/icons-material/Autorenew";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import { styled, alpha } from "@mui/material/styles";
import { TablePagination } from "@mui/material";
import "../../pages/GeneralStyle.scss";

// Styled components for SearchBar
const Search = styled("div")(({ theme }) => ({
  position: "relative",
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.black, 0.05),
  "&:hover": {
    backgroundColor: alpha(theme.palette.common.black, 0.1),
  },
  marginLeft: "auto",
  width: "100%",
  [theme.breakpoints.up("sm")]: {
    width: "auto",
  },
}));

const SearchIconWrapper = styled("div")(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: "100%",
  position: "absolute",
  pointerEvents: "none",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: "inherit",
  width: "100%",
  fontFamily: "'Helvetica Neue', Arial, sans-serif",
  "& .MuiInputBase-input": {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create("width"),
    [theme.breakpoints.up("sm")]: {
      width: "12ch",
      "&:focus": {
        width: "20ch",
      },
    },
  },
}));

// Style for the Archive Checkbox Container
const ArchiveContainer = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  padding: "6px 12px",
  marginLeft: "10px",
  border: "2px solid transparent", // Invisible border
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
    className="headbar"
    elevation={0}
    style={{
      boxShadow: "none",
      borderBottom: "none",
      backgroundColor: "transparent",
    }}>
    <Toolbar className="toolbar" style={{ borderBottom: "none", gap: "12px" }}>
      {/* Archive Checkbox inside a Button-like Container */}
      <ArchiveContainer onClick={() => setShowArchived(!showArchived)}>
        <Checkbox
          checked={showArchived}
          onChange={(e) => setShowArchived(e.target.checked)}
          sx={{
            padding: "0px",
            color: "rgb(135, 135, 135)",
            "&.Mui-checked": {
              color: "rgb(33, 61, 112)",
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
          Archived
        </span>
      </ArchiveContainer>

      {/* Search Box */}
      <Search className="search">
        <SearchIconWrapper>
          <SearchIcon className="search-icon" />
        </SearchIconWrapper>
        <StyledInputBase
          placeholder="Search…"
          inputProps={{ "aria-label": "search" }}
          sx={{ color: "black" }}
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

export const PaginationComponent = ({
  count,
  rowsPerPage,
  page,
  onPageChange,
  onRowsPerPageChange,
}) => (
  <div className="footer">
    <TablePagination
      rowsPerPageOptions={[10, 25, 50]}
      component="div"
      count={count}
      rowsPerPage={rowsPerPage}
      page={page}
      onPageChange={onPageChange}
      onRowsPerPageChange={onRowsPerPageChange}
      className="table-pagination"
    />
  </div>
);
