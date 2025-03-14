import React, { useState } from "react";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import InputBase from "@mui/material/InputBase";
import SearchIcon from "@mui/icons-material/Search";
import Button from "@mui/material/Button";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import TitleModal from "../../components/modal/TitleModal.jsx";
import NoDataGIF from "../../assets/no-data.gif";
import "./GeneralStyles_Extras.scss";
import { CONSTANT } from "../../config/index.jsx";
import { useGetShowTitlesQuery } from "../../features/api/extra.js";

const columns = [
  { id: "title", label: "Title" },
  { id: "status", label: "Status" },
  { id: "actions", label: "Actions" },
];

const Titles = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [modalOpen, setModalOpen] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [selectedTitle, setSelectedTitle] = useState(null);

  const { data: titlesData = [] } = useGetShowTitlesQuery();

  const handleMenuClick = (event, title) => {
    setMenuAnchor(event.currentTarget);
    setSelectedTitle(title);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
    setSelectedTitle(null);
  };

  return (
    <>
      <div className="header-container">
        <Typography className="header-title">Titles</Typography>
        <Button
          className="add-button"
          variant="contained"
          onClick={() => setModalOpen(true)}>
          {CONSTANT.BUTTONS.ADD.label}
        </Button>
      </div>

      <Paper className="titles-container">
        <AppBar position="static" className="table-appbar">
          <Toolbar className="table-toolbar">
            <div className="search-bar">
              <SearchIcon className="search-icon" />
              <InputBase
                placeholder="Search…"
                className="search-input"
                inputProps={{ "aria-label": "search" }}
              />
            </div>
          </Toolbar>
        </AppBar>

        <TableContainer className="table-container">
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                {columns.map((column) => (
                  <TableCell key={column.id} className="table-header">
                    {column.label}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {titlesData.length > 0 ? (
                titlesData.map((title, index) => (
                  <TableRow key={index} className="table-row">
                    <TableCell className="table-cell">{title.title}</TableCell>
                    <TableCell className="table-cell">{title.status}</TableCell>
                    <TableCell className="table-cell">
                      <Button
                        onClick={(event) => handleMenuClick(event, title)}>
                        <MoreHorizIcon />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="no-data-cell">
                    <div className="no-data">
                      <img
                        src={NoDataGIF}
                        alt="No Data"
                        className="no-data-img"
                      />
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          className="table-pagination"
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={titlesData.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(event, newPage) => setPage(newPage)}
          onRowsPerPageChange={(event) => {
            setRowsPerPage(parseInt(event.target.value, 10));
            setPage(0);
          }}
        />
      </Paper>

      <TitleModal open={modalOpen} handleClose={() => setModalOpen(false)} />

      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}>
        <MenuItem onClick={() => console.log("Edit", selectedTitle)}>
          Edit
        </MenuItem>
        <MenuItem onClick={() => console.log("Archive", selectedTitle)}>
          Archive
        </MenuItem>
      </Menu>
    </>
  );
};

export default Titles;
