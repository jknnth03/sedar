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
import AttainmentsModal from "../../components/modal/extras/AttainmentsModal";
import NoDataGIF from "../../assets/no-data.gif";
import "../GeneralStyle.scss";
import HelpIcon from "@mui/icons-material/Help";
import { Box, Chip } from "@mui/material";
import {
  useDeleteAttainmentsMutation,
  useGetShowAttainmentsQuery,
} from "../../features/api/extras/attainmentsApi";

const Attainments = () => {
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [showArchived, setShowArchived] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [selectedAttainment, setSelectedAttainment] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  const {
    data: attainments,
    isLoading,
    isFetching,
    refetch,
  } = useGetShowAttainmentsQuery({
    search: searchQuery,
    page,
    per_page: rowsPerPage,
    status: showArchived ? "inactive" : "active",
  });

  const [deleteAttainment] = useDeleteAttainmentsMutation();

  const attainmentList = useMemo(
    () => attainments?.result?.data || [],
    [attainments]
  );

  const handleMenuOpen = (event, attainment) => {
    setMenuAnchor(event.currentTarget);
    setSelectedAttainment(attainment);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
  };

  const handleArchiveRestoreClick = () => {
    if (!selectedAttainment) return;
    setConfirmOpen(true);
    handleMenuClose();
  };

  const handleArchiveRestoreConfirm = async () => {
    if (!selectedAttainment) return;
    try {
      await deleteAttainment(selectedAttainment.id).unwrap();
      enqueueSnackbar(
        selectedAttainment.deleted_at
          ? "Attainment restored successfully!"
          : "Attainment archived successfully!",
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
      setSelectedAttainment(null);
    }
  };

  const handleEditClick = () => {
    setModalOpen(true);
    handleMenuClose();
  };

  return (
    <>
      {/* Header */}
      <div className="header-container">
        <Typography className="header">Attainments</Typography>
        <Button
          className="add-button"
          variant="contained"
          onClick={() => setModalOpen(true)}
          startIcon={<AddIcon />}>
          CREATE
        </Button>
      </div>

      {/* Table */}
      <Paper className="container">
        <div className="table-controls">
          <SearchBar
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            showArchived={showArchived}
            setShowArchived={setShowArchived}
          />
        </div>

        <TableContainer
          className="table-container"
          style={{ maxHeight: "60vh" }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell align="center" className="table-header">
                  ID
                </TableCell>
                <TableCell align="center" className="table-header">
                  Code
                </TableCell>
                <TableCell align="center" className="table-header">
                  Attainment Name
                </TableCell>
                <TableCell
                  align="center"
                  sx={{
                    verticalAlign: "middle",
                    fontWeight: "bold",
                    fontSize: "1rem",
                  }}>
                  Status
                </TableCell>
                <TableCell
                  align="center"
                  sx={{
                    verticalAlign: "middle",
                    fontWeight: "bold",
                    fontSize: "1rem",
                  }}>
                  Action
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading || isFetching ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <CircularProgress size={24} />
                  </TableCell>
                </TableRow>
              ) : attainmentList.length > 0 ? (
                attainmentList.map((attainment) => (
                  <TableRow key={attainment.id}>
                    <TableCell className="table-cell">
                      {attainment.id}
                    </TableCell>
                    <TableCell className="table-cell">
                      {attainment.code}
                    </TableCell>
                    <TableCell className="table-cell">
                      {attainment.name}
                    </TableCell>
                    <TableCell align="center" sx={{ verticalAlign: "middle" }}>
                      <Chip
                        label={attainment.deleted_at ? "Inactive" : "Active"}
                        color={attainment.deleted_at ? "error" : "success"}
                      />
                    </TableCell>
                    <TableCell align="center" sx={{ verticalAlign: "middle" }}>
                      <IconButton
                        onClick={(e) => handleMenuOpen(e, attainment)}>
                        <MoreVertIcon />
                      </IconButton>
                      <Menu
                        anchorEl={menuAnchor}
                        open={Boolean(menuAnchor)}
                        onClose={handleMenuClose}
                        sx={{
                          "& .MuiPaper-root": {
                            boxShadow: "0px 2px 6px rgba(0, 0, 0, 0.12)", // Lighter shadow
                            borderRadius: "8px", // Optional: Softer corners
                          },
                        }}>
                        <MenuItem onClick={handleEditClick}>
                          <EditIcon
                            fontSize="small"
                            style={{ marginRight: 8 }}
                          />
                          Edit
                        </MenuItem>
                        <MenuItem onClick={handleArchiveRestoreClick}>
                          {attainment.deleted_at ? (
                            <>
                              <RestoreIcon
                                fontSize="small"
                                style={{ marginRight: 8 }}
                              />
                              Restore
                            </>
                          ) : (
                            <>
                              <ArchiveIcon
                                fontSize="small"
                                style={{ marginRight: 8 }}
                              />
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
          count={attainments?.result?.total || 0}
          rowsPerPage={rowsPerPage}
          page={page - 1}
          onPageChange={(event, newPage) => setPage(newPage + 1)}
          onRowsPerPageChange={(event) => {
            setRowsPerPage(parseInt(event.target.value, 10));
            setPage(1);
          }}
        />
      </Paper>
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
            <HelpIcon sx={{ fontSize: 60, color: "#55b8ff" }} />
          </Box>
          <Typography variant="h6" fontWeight="bold" textAlign="center">
            Confirmation
          </Typography>
        </DialogTitle>

        <DialogContent>
          <Typography variant="body1" gutterBottom>
            Are you sure you want to{" "}
            <span style={{ fontWeight: "bold" }}>
              {setSelectedAttainment?.deleted_at ? "restore" : "archive"}
            </span>{" "}
            this title?
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
      <AttainmentsModal
        open={modalOpen}
        handleClose={() => setModalOpen(false)}
        refetch={refetch}
        selectedAttainment={selectedAttainment}
      />
    </>
  );
};

export default Attainments;
