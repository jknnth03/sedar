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
import { SearchBar } from "../masterlistComponents";
import JobbandsModal from "../../../components/modal/masterlist/JobbandsModal";
import NoDataGIF from "../../../assets/no-data.gif";
import "../../../pages/GeneralStyle.scss";
import Box from "@mui/material/Box";
import HelpIcon from "@mui/icons-material/Help";
import { Chip } from "@mui/material";
import {
  useDeleteJobbandMutation,
  useGetJobbandsQuery,
} from "../../../features/api/masterlist/jobbandsApi";

const Jobbands = () => {
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [showArchived, setShowArchived] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState({});
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedJobband, setSelectedJobband] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  const {
    data: jobbands,
    isLoading,
    isFetching,
    refetch,
  } = useGetJobbandsQuery({
    search: searchQuery,
    page,
    per_page: rowsPerPage,
    status: showArchived ? "inactive" : "active",
  });

  const [deleteJobband] = useDeleteJobbandMutation();

  const jobbandList = useMemo(() => jobbands?.result?.data || [], [jobbands]);

  const handleMenuOpen = (event, jobbandId) => {
    setMenuAnchor({ [jobbandId]: event.currentTarget });
  };

  const handleMenuClose = (jobbandId) => {
    setMenuAnchor((prev) => ({ ...prev, [jobbandId]: null }));
  };

  const handleArchiveRestoreClick = (jobband) => {
    setSelectedJobband(jobband);
    setConfirmOpen(true);
    handleMenuClose(jobband.id);
  };

  const handleArchiveRestoreConfirm = async () => {
    if (!selectedJobband) return;
    try {
      await deleteJobband(selectedJobband.id).unwrap();
      enqueueSnackbar(
        selectedJobband.deleted_at
          ? "Jobband restored successfully!"
          : "Jobband archived successfully!",
        { variant: "success", autoHideDuration: 2000 }
      );
      refetch();
    } catch (error) {
      enqueueSnackbar("Action failed. Please try again.", {
        variant: "error",
        autoHideDuration: 2000,
      });
    } finally {
      setConfirmOpen(false);
      setSelectedJobband(null);
    }
  };

  const handleAddJobband = () => {
    setSelectedJobband(null);
    setModalOpen(true);
  };

  const handleEditClick = (jobband) => {
    setSelectedJobband(jobband);
    setModalOpen(true);
    handleMenuClose(jobband.id);
  };

  return (
    <>
      <div className="header-container">
        <Typography className="header">JOB BANDS</Typography>
        <Button
          className="add-button"
          variant="contained"
          onClick={handleAddJobband}
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
                <TableCell className="table-header">JOB BAND</TableCell>
                <TableCell className="table-header">CODE</TableCell>
                <TableCell className="table-status">STATUS</TableCell>
                <TableCell className="table-status">ACTION</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isFetching ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <CircularProgress size={24} />
                  </TableCell>
                </TableRow>
              ) : jobbandList.length > 0 ? (
                jobbandList.map((jobband) => (
                  <TableRow key={jobband.id}>
                    <TableCell className="table-cell">{jobband.id}</TableCell>
                    <TableCell className="table-cell">{jobband.name}</TableCell>
                    <TableCell className="table-cell">{jobband.code}</TableCell>
                    <TableCell sx={{ paddingLeft: "48px" }}>
                      <Chip
                        label={jobband.deleted_at ? "Inactive" : "Active"}
                        color={jobband.deleted_at ? "error" : "success"}
                      />
                    </TableCell>
                    <TableCell sx={{ paddingLeft: "56px" }}>
                      <IconButton
                        onClick={(e) => handleMenuOpen(e, jobband.id)}>
                        <MoreVertIcon />
                      </IconButton>
                      <Menu
                        anchorEl={menuAnchor[jobband.id]}
                        open={Boolean(menuAnchor[jobband.id])}
                        onClose={() => handleMenuClose(jobband.id)}>
                        {!jobband.deleted_at && (
                          <MenuItem onClick={() => handleEditClick(jobband)}>
                            <EditIcon fontSize="small" sx={{ mr: 1 }} /> Edit
                          </MenuItem>
                        )}
                        <MenuItem
                          onClick={() => handleArchiveRestoreClick(jobband)}>
                          {jobband.deleted_at ? (
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
          count={jobbands?.result?.total || 0}
          rowsPerPage={rowsPerPage}
          page={page - 1}
          onPageChange={(event, newPage) => setPage(newPage + 1)}
          onRowsPerPageChange={(event) => {
            setRowsPerPage(parseInt(event.target.value, 10));
            setPage(1);
          }}
        />
      </Paper>

      <JobbandsModal
        open={modalOpen}
        handleClose={() => setModalOpen(false)}
        refetch={refetch}
        selectedJobband={selectedJobband}
      />

      <Dialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        maxWidth="xs">
        <DialogTitle>
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            mb={1}>
            <HelpIcon sx={{ fontSize: 60, color: "#55b8ff" }} />
          </Box>
          <Typography variant="h6" fontWeight="bold" textAlign="center">
            Confirmation
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" gutterBottom>
            Are you sure you want to{" "}
            <strong>
              {selectedJobband?.deleted_at ? "restore" : "archive"}
            </strong>{" "}
            this job-band?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Box
            display="flex"
            justifyContent="center"
            width="100%"
            gap={2}
            mb={2}>
            <Button
              onClick={() => setConfirmOpen(false)}
              variant="outlined"
              color="error">
              No
            </Button>
            <Button
              onClick={handleArchiveRestoreConfirm}
              variant="contained"
              color="success">
              Yes
            </Button>
          </Box>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Jobbands;
