import React, { useState, useMemo } from "react";
import {
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  CircularProgress,
  TableRow,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import EditIcon from "@mui/icons-material/Edit";
import HelpIcon from "@mui/icons-material/Help";
import NoDataGIF from "../../assets/no-data.gif";
import PositionEmpModal from "../../components/modal/employee/PositionsEmpModal";
import { useSnackbar } from "notistack";
import {
  useUpdatePositionMutation,
  useGetPositionQuery,
} from "../../features/api/employee/positionsempApi";
import "../../pages/GeneralStyle.scss";

const Positions = () => {
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [menuAnchor, setMenuAnchor] = useState({});
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState(null);
  const { enqueueSnackbar } = useSnackbar();

  const {
    data: apiResponse,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useGetPositionQuery({
    page,
    per_page: rowsPerPage,
  });

  const { positionList, totalCount } = useMemo(() => {
    const result = apiResponse?.result;
    const data = result?.data || [];

    return {
      positionList: data,
      totalCount: result?.total || data.length,
    };
  }, [apiResponse]);

  const handleMenuOpen = (event, positionId) => {
    setMenuAnchor({ [positionId]: event.currentTarget });
  };

  const handleMenuClose = (positionId) => {
    setMenuAnchor((prev) => {
      const { [positionId]: _, ...rest } = prev;
      return rest;
    });
  };

  const handleEditClick = (position) => {
    setSelectedPosition(position);
    setModalOpen(true);
    handleMenuClose(position.id);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setSelectedPosition(null);
  };

  return (
    <>
      <Paper className="container">
        <TableContainer
          sx={{
            flexGrow: 1,
            display: "flex",
            flexDirection: "column",
            height: "calc(100vh - 18rem)",
            width: "calc(100vw - 20rem)",
            overflow: "auto",
            zIndex: 0,
            margin: "0 auto",
          }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell align="left" className="table-header">
                  ID
                </TableCell>
                <TableCell align="left" className="table-header">
                  Employee
                </TableCell>
                <TableCell align="left" className="table-header">
                  Position Code
                </TableCell>
                <TableCell align="left" className="table-header">
                  Position Title
                </TableCell>
                <TableCell align="left" className="table-header">
                  Schedule
                </TableCell>
                <TableCell align="left" className="table-header">
                  Job Level
                </TableCell>
                <TableCell align="left" className="table-header">
                  Job Rate
                </TableCell>
                <TableCell align="left" className="table-header">
                  Allowance
                </TableCell>
                <TableCell align="left" className="table-header">
                  Salary
                </TableCell>
                <TableCell align="left" className="table-header">
                  Tools
                </TableCell>
                <TableCell align="left" className="table-header">
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading || isFetching ? (
                <TableRow>
                  <TableCell colSpan={11} align="center">
                    <CircularProgress size={24} />
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={11} align="center">
                    <Typography color="error">
                      Error: {error?.data?.message || "Failed to load data"}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : positionList.length > 0 ? (
                positionList.map((position) => (
                  <TableRow key={position.id}>
                    <TableCell className="table-cell">{position.id}</TableCell>
                    <TableCell className="table-name-cell">
                      {position.employee?.full_name || "—"}
                    </TableCell>
                    <TableCell className="table-cell">
                      {position.position?.code || "—"}
                    </TableCell>
                    <TableCell className="table-cell">
                      {position.position?.title.name || "—"}
                    </TableCell>
                    <TableCell className="table-cell">
                      {position.schedule?.name || "—"}
                    </TableCell>
                    <TableCell className="table-cell">
                      {position.job_level?.name || "—"}
                    </TableCell>
                    <TableCell className="table-cell">
                      {position.job_rate
                        ? `₱${position.job_rate.toLocaleString()}`
                        : "—"}
                    </TableCell>
                    <TableCell className="table-cell">
                      {position.allowance
                        ? `₱${position.allowance.toLocaleString()}`
                        : "—"}
                    </TableCell>
                    <TableCell className="table-cell">
                      {position.salary
                        ? `₱${position.salary.toLocaleString()}`
                        : "—"}
                    </TableCell>
                    <TableCell className="table-cell">
                      {position.additional_tools ||
                        position.position?.tools?.join(", ") ||
                        "—"}
                    </TableCell>
                    <TableCell className="table-cell">
                      <IconButton
                        onClick={(e) => handleMenuOpen(e, position.id)}>
                        <MoreVertIcon />
                      </IconButton>
                      <Menu
                        anchorEl={menuAnchor[position.id]}
                        open={Boolean(menuAnchor[position.id])}
                        onClose={() => handleMenuClose(position.id)}>
                        <MenuItem onClick={() => handleEditClick(position)}>
                          <EditIcon fontSize="small" sx={{ mr: 1 }} /> Edit
                        </MenuItem>
                      </Menu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={11} align="center">
                    <img src={NoDataGIF} alt="No data" style={{ width: 150 }} />
                    <Typography variant="body2">No positions found.</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={totalCount}
          rowsPerPage={rowsPerPage}
          page={page - 1}
          onPageChange={(_, newPage) => setPage(newPage + 1)}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(1);
          }}
        />
      </Paper>

      {/* Position Update Modal */}
      <PositionEmpModal
        open={modalOpen}
        handleClose={handleModalClose}
        refetch={refetch}
        selectedPosition={selectedPosition}
      />
    </>
  );
};

export default Positions;
