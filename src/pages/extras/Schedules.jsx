import React, { useState, useMemo } from "react";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TablePagination from "@mui/material/TablePagination";
import CircularProgress from "@mui/material/CircularProgress";
import TableRow from "@mui/material/TableRow";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import EditIcon from "@mui/icons-material/Edit";
import ArchiveIcon from "@mui/icons-material/Archive";
import RestoreIcon from "@mui/icons-material/Restore";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import { useSnackbar } from "notistack";
import AddIcon from "@mui/icons-material/Add";
import { SearchBar } from "../masterlist/masterlistComponents";
import ScheduleModal from "../../components/modal/extras/SchedulesModal";
import NoDataGIF from "../../assets/no-data.gif";
import "../GeneralStyle.scss";
import {
  useDeleteSchedulesMutation,
  useGetShowSchedulesQuery,
} from "../../features/api/extras/schedulesApi";
import Box from "@mui/material/Box";
import HelpIcon from "@mui/icons-material/Help";
import { Chip } from "@mui/material";
import useDebounce from "../../hooks/useDebounce";

const Schedule = () => {
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [showArchived, setShowArchived] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState({});
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const { enqueueSnackbar } = useSnackbar();
  const debounceValue = useDebounce(searchQuery, 500);

  const {
    data: schedules,
    isLoading,
    isFetching,
    refetch,
  } = useGetShowSchedulesQuery({
    search: debounceValue,
    page,
    per_page: rowsPerPage,
    status: showArchived ? "inactive" : "active",
  });

  const [deleteSchedule] = useDeleteSchedulesMutation();
  const scheduleList = useMemo(
    () => schedules?.result?.data || [],
    [schedules]
  );

  const handleMenuOpen = (event, scheduleId) => {
    setMenuAnchor({ [scheduleId]: event.currentTarget });
  };

  const handleMenuClose = (scheduleId) => {
    setMenuAnchor((prev) => ({ ...prev, [scheduleId]: null }));
  };

  const handleArchiveRestoreClick = (schedule) => {
    handleMenuClose(schedule.id);
    setSelectedSchedule(schedule);
    setConfirmOpen(true);
  };

  const handleArchiveRestoreConfirm = async () => {
    if (!selectedSchedule) return;
    try {
      await deleteSchedule(selectedSchedule.id).unwrap();
      enqueueSnackbar(
        selectedSchedule.deleted_at
          ? "Schedule restored successfully!"
          : "Schedule archived successfully!",
        { variant: "success", autoHideDuration: 2000 }
      );
      refetch();
    } catch (error) {
      enqueueSnackbar("Action failed. Please try again.", {
        variant: "error",
        autoHideDuration: 2000,
      });
    } finally {
      setSelectedSchedule(null);
      setConfirmOpen(false);
    }
  };

  const handleAddSchedule = () => {
    setSelectedSchedule(null);
    setModalOpen(true);
  };

  const handleEditClick = (schedule) => {
    setSelectedSchedule(schedule);
    setModalOpen(true);
    handleMenuClose(schedule.id);
  };

  return (
    <>
      <div className="header-container">
        <Typography className="header">SCHEDULES</Typography>
        <Button
          className="add-button"
          variant="contained"
          onClick={handleAddSchedule}
          startIcon={<AddIcon />}>
          CREATE
        </Button>
      </div>

      <Paper className="container">
        <div className="table-controls">
          <SearchBar
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            showArchived={showArchived}
            setShowArchived={setShowArchived}
          />
        </div>

        <TableContainer className="table-container">
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell className="table-id">ID</TableCell>
                <TableCell className="table-id">CODE</TableCell>
                <TableCell className="table-header">SCHEDULE</TableCell>
                <TableCell className="table-status">STATUS</TableCell>
                <TableCell className="table-status">ACTIONS</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading || isFetching ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <CircularProgress size={24} />
                  </TableCell>
                </TableRow>
              ) : scheduleList.length > 0 ? (
                scheduleList.map((schedule) => (
                  <TableRow key={schedule.id}>
                    <TableCell className="table-cell-id">
                      {schedule.id}
                    </TableCell>
                    <TableCell className="table-cell-id2">
                      {schedule.code}
                    </TableCell>
                    <TableCell className="table-cell">
                      {schedule.name}
                    </TableCell>
                    <TableCell className="table-status">
                      <Chip
                        label={showArchived ? "INACTIVE" : "ACTIVE"}
                        color={showArchived ? "error" : "success"}
                        size="medium"
                        sx={{ "& .MuiChip-label": { fontSize: "0.68rem" } }}
                      />
                    </TableCell>
                    <TableCell className="table-status2">
                      <IconButton
                        onClick={(e) => handleMenuOpen(e, schedule.id)}>
                        <MoreVertIcon />
                      </IconButton>
                      <Menu
                        anchorEl={menuAnchor[schedule.id]}
                        open={Boolean(menuAnchor[schedule.id])}
                        onClose={() => handleMenuClose(schedule.id)}>
                        {!schedule.deleted_at && (
                          <MenuItem onClick={() => handleEditClick(schedule)}>
                            <EditIcon fontSize="small" sx={{ mr: 1 }} /> Edit
                          </MenuItem>
                        )}
                        <MenuItem
                          onClick={() => handleArchiveRestoreClick(schedule)}>
                          {schedule.deleted_at ? (
                            <>
                              <RestoreIcon fontSize="small" sx={{ mr: 1 }} />{" "}
                              Restore
                            </>
                          ) : (
                            <>
                              <ArchiveIcon fontSize="small" sx={{ mr: 1 }} />{" "}
                              Archive
                            </>
                          )}
                        </MenuItem>
                      </Menu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <img
                      src={NoDataGIF}
                      alt="No Data"
                      style={{ width: "365px" }}
                    />
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50, 100]}
          component="div"
          count={schedules?.result?.total || 0}
          rowsPerPage={rowsPerPage}
          page={page - 1}
          onPageChange={(event, newPage) => setPage(newPage + 1)}
          onRowsPerPageChange={(event) => {
            setRowsPerPage(parseInt(event.target.value, 10));
            setPage(1);
          }}
        />
      </Paper>

      <ScheduleModal
        open={modalOpen}
        handleClose={() => setModalOpen(false)}
        selectedSchedule={selectedSchedule}
      />
      <Dialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        maxWidth="xs"
        PaperProps={{
          sx: { borderRadius: 3, padding: 2, textAlign: "center" },
        }}>
        <DialogTitle>
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            mb={1}>
            <HelpIcon sx={{ fontSize: 60, color: "#ff4400 " }} />
          </Box>
          <Typography
            variant="h6"
            fontWeight="bold"
            textAlign="center"
            color="rgb(33, 61, 112)">
            Confirmation
          </Typography>
        </DialogTitle>

        <DialogContent>
          <Typography variant="body1" gutterBottom>
            Are you sure you want to{" "}
            <span style={{ fontWeight: "bold" }}>
              {selectedSchedule?.deleted_at ? "restore" : "archive"}
            </span>{" "}
            this schedule?
          </Typography>
        </DialogContent>

        <DialogActions sx={{ justifyContent: "center" }}>
          <Button
            onClick={() => setConfirmOpen(false)}
            variant="outlined"
            color="error">
            No
          </Button>
          <Button
            onClick={handleArchiveRestoreConfirm}
            variant="contained"
            sx={{
              backgroundColor: "rgb(0, 151, 20)",
              color: "#fff",
              "&:hover": { backgroundColor: "rgb(0, 102, 14)" },
            }}>
            Yes
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Schedule;
