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
import TeamsModal from "../../components/modal/extras/TeamsModal";
import NoDataGIF from "../../assets/no-data.gif";
import "../GeneralStyle.scss";

import Box from "@mui/material/Box";
import HelpIcon from "@mui/icons-material/Help";
import {
  useDeleteTeamsMutation,
  useGetShowTeamsQuery,
} from "../../features/api/extras/teamsApi";
import { Chip } from "@mui/material";
import useDebounce from "../../hooks/useDebounce";

const Teams = () => {
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [showArchived, setShowArchived] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState({});
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const { enqueueSnackbar } = useSnackbar();
  const debounceValue = useDebounce(searchQuery, 500);

  const {
    data: teams,
    isLoading,
    isFetching,
    refetch,
  } = useGetShowTeamsQuery({
    search: debounceValue,
    page,
    per_page: rowsPerPage,
    status: showArchived ? "inactive" : "active",
  });

  const [deleteTeam] = useDeleteTeamsMutation();

  const handleMenuOpen = (event, teamId) => {
    setMenuAnchor({ [teamId]: event.currentTarget });
  };

  const handleMenuClose = (teamId) => {
    setMenuAnchor((prev) => ({ ...prev, [teamId]: null }));
  };

  const handleArchiveRestoreClick = (team) => {
    setSelectedTeam(team);
    setConfirmOpen(true);
    handleMenuClose(team.id);
  };

  const handleArchiveRestoreConfirm = async () => {
    if (!selectedTeam) return;
    try {
      await deleteTeam(selectedTeam.id).unwrap();
      enqueueSnackbar(
        selectedTeam.deleted_at
          ? "Team restored successfully!"
          : "Team archived successfully!",
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
      setSelectedTeam(null);
    }
  };

  const handleAddTeam = () => {
    setSelectedTeam(null);
    setModalOpen(true);
  };

  const handleEditClick = (team) => {
    setSelectedTeam(team);
    setModalOpen(true);
    handleMenuClose(team.id);
  };

  return (
    <>
      <div className="header-container">
        <Typography className="header">TEAMS</Typography>
        <Button
          className="add-button"
          variant="contained"
          onClick={handleAddTeam}
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
                <TableCell className="table-header">TEAM</TableCell>
                <TableCell className="table-status">STATUS</TableCell>
                <TableCell className="table-status">ACTIONS</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isFetching ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <CircularProgress size={24} />
                  </TableCell>
                </TableRow>
              ) : teams?.result?.data.length > 0 ? (
                teams?.result?.data.map((team) => (
                  <TableRow key={team.id}>
                    <TableCell className="table-cell-id">{team.id}</TableCell>
                    <TableCell className="table-cell-id2">
                      {team.code}
                    </TableCell>
                    <TableCell className="table-cell">{team.name}</TableCell>
                    <TableCell className="table-status">
                      <Chip
                        label={showArchived ? "INACTIVE" : "ACTIVE"}
                        color={showArchived ? "error" : "success"}
                        size="medium"
                        sx={{ "& .MuiChip-label": { fontSize: "0.68rem" } }}
                      />
                    </TableCell>
                    <TableCell className="table-status2">
                      <IconButton onClick={(e) => handleMenuOpen(e, team.id)}>
                        <MoreVertIcon />
                      </IconButton>
                      <Menu
                        anchorEl={menuAnchor[team.id]}
                        open={Boolean(menuAnchor[team.id])}
                        onClose={() => handleMenuClose(team.id)}>
                        {!team.deleted_at && (
                          <MenuItem onClick={() => handleEditClick(team)}>
                            <EditIcon fontSize="small" sx={{ mr: 1 }} /> Edit
                          </MenuItem>
                        )}
                        <MenuItem
                          onClick={() => handleArchiveRestoreClick(team)}>
                          {team.deleted_at ? (
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
          count={teams?.result?.total || 0}
          rowsPerPage={rowsPerPage}
          page={page - 1}
          onPageChange={(event, newPage) => setPage(newPage + 1)}
          onRowsPerPageChange={(event) => {
            setRowsPerPage(parseInt(event.target.value, 5));
            setPage(1);
          }}
        />
      </Paper>

      <TeamsModal
        open={modalOpen}
        handleClose={() => setModalOpen(false)}
        refetch={() => {}}
        selectedTeam={selectedTeam}
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
            <strong>{selectedTeam?.deleted_at ? "restore" : "archive"}</strong>{" "}
            this team?
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

export default Teams;
