import React, { useEffect, useState } from "react";
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
import axios from "axios";
import { CONSTANT } from "../../../config";
import PositionModal from "../../../components/modal/PositionModal";
import NoDataGIF from "../../../assets/no-data.gif";
import "../positions/Postion.scss";

const columns = [
  { id: "positions", label: "Position" },
  { id: "department", label: "Department" },
  { id: "sub-units", label: "Sub-units" },
  { id: "jobBand", label: "Job Band" },
  { id: "immediatesuperior", label: "Immediate Superior" },
  { id: "payrate", label: "Payrate" },
  { id: "schedule", label: "Schedule" },
  { id: "team", label: "Team" },
  { id: "requiredtools", label: "Required Tools" },
  { id: "attachments", label: "Attachments" },
];

const Positions = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [rows, setRows] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("YOUR_API_ENDPOINT");
        setRows(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        setRows([]);
      }
    };
    fetchData();
  }, []);

  return (
    <>
      <div className="header-container">
        <Typography className="header-title">Positions</Typography>
        <Button
          className="add-button"
          variant="contained"
          onClick={() => setModalOpen(true)}>
          {CONSTANT.BUTTONS.ADD.label}
        </Button>
      </div>

      <Paper className="positions-container">
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
              {rows.length > 0 ? (
                rows
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((row, index) => (
                    <TableRow key={index} className="table-row">
                      {columns.map((column) => (
                        <TableCell key={column.id} className="table-cell">
                          {row[column.id] || "-"}
                        </TableCell>
                      ))}
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
          count={rows.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(event, newPage) => setPage(newPage)}
          onRowsPerPageChange={(event) => {
            setRowsPerPage(parseInt(event.target.value, 10));
            setPage(0);
          }}
        />
      </Paper>

      <PositionModal open={modalOpen} handleClose={() => setModalOpen(false)} />
    </>
  );
};

export default Positions;
