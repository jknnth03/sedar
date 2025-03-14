import React from "react";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import InputBase from "@mui/material/InputBase";
import SearchIcon from "@mui/icons-material/Search";
import CircularProgress from "@mui/material/CircularProgress";
import AutorenewIcon from "@mui/icons-material/Autorenew";
import Button from "@mui/material/Button";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import { styled, alpha } from "@mui/material/styles";
import { TablePagination } from "@mui/material";
import "../../pages/masterlist/GeneralStyle_table.scss";

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

export const SearchBar = ({
  searchQuery,
  setSearchQuery,
  showArchived,
  setShowArchived,
}) => (
  <AppBar
    position="static"
    className="headbar"
    elevation={0} // Removes the shadow
    style={{
      boxShadow: "none",
      borderBottom: "none",
      backgroundColor: "transparent",
    }} // Remove border & background
  >
    <Toolbar className="toolbar" style={{ borderBottom: "none" }}>
      {/* Archived Checkbox */}
      <FormControlLabel
        control={
          <Checkbox
            checked={showArchived}
            onChange={(e) => setShowArchived(e.target.checked)}
            color="primary"
          />
        }
        label="Archived"
        className="checkbox-label"
        style={{ marginRight: "16px", color: "black" }}
      />

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
