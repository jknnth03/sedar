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
  Chip,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import EditIcon from "@mui/icons-material/Edit";
import ArchiveIcon from "@mui/icons-material/Archive";
import RestoreIcon from "@mui/icons-material/Restore";
import AddIcon from "@mui/icons-material/Add";
import HelpIcon from "@mui/icons-material/Help";
import { useSnackbar } from "notistack";
import { SearchBar } from "../masterlist/masterlistComponents";
import MunicipalitiesModal from "../../components/modal/extras/MunicipalitiesModal";
import NoDataGIF from "../../assets/no-data.gif";
import "../GeneralStyle.scss";
import {
  useDeleteMunicipalityMutation,
  useGetMunicipalitiesQuery,
} from "../../features/api/extras/municipalitiesApi";

const Municipalities = () => {
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [showArchived, setShowArchived] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState({});
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedMunicipality, setSelectedMunicipality] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  const {
    data: municipalities,
    isLoading,
    isFetching,
    refetch,
  } = useGetMunicipalitiesQuery({
    search: searchQuery,
    page,
    per_page: rowsPerPage,
    status: showArchived ? "inactive" : "active",
  });

  const [archiveMunicipality] = useDeleteMunicipalityMutation();

  const municipalityList = useMemo(
    () => municipalities?.result?.data || [],
    [municipalities]
  );

  const handleMenuOpen = (event, municipalityId) => {
    setMenuAnchor({ [municipalityId]: event.currentTarget });
  };

  const handleMenuClose = (municipalityId) => {
    setMenuAnchor((prev) => {
      const updatedMenuAnchor = { ...prev };
      delete updatedMenuAnchor[municipalityId];
      return updatedMenuAnchor;
    });
  };

  const handleArchiveRestoreClick = (municipality) => {
    handleMenuClose(municipality.id);
    setTimeout(() => {
      setSelectedMunicipality(municipality);
      setConfirmOpen(true);
    }, 200);
  };

  const handleArchiveRestoreConfirm = async () => {
    if (!selectedMunicipality) return;

    try {
      await archiveMunicipality(selectedMunicipality.id).unwrap();

      enqueueSnackbar(
        selectedMunicipality.deleted_at
          ? "Municipality restored successfully!"
          : "Municipality archived successfully!",
        { variant: "success", autoHideDuration: 2000 }
      );

      setConfirmOpen(false);
      setSelectedMunicipality(null);
      refetch();
    } catch (error) {
      enqueueSnackbar(
        error?.data?.message || "Action failed. Please try again.",
        { variant: "error", autoHideDuration: 2000 }
      );
    }
  };

  const handleAddMunicipality = () => {
    setSelectedMunicipality(null);
    setModalOpen(true);
  };

  const handleEditClick = (municipality) => {
    setSelectedMunicipality(municipality);
    setModalOpen(true);
    handleMenuClose(municipality.id);
  };

  return (
    <>
      <div className="header-container">
        <Typography className="header">Municipalities</Typography>
        <Button
          className="add-button"
          variant="contained"
          onClick={handleAddMunicipality}
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
                  PSG Code
                </TableCell>
                <TableCell align="center" className="table-header">
                  Municipality Name
                </TableCell>
                <TableCell align="center" className="table-header">
                  Province Name {/* Added header for Province Name */}
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
              ) : municipalityList.length > 0 ? (
                municipalityList.map((municipality) => (
                  <TableRow key={municipality.id}>
                    <TableCell className="table-cell">
                      {municipality.id}
                    </TableCell>
                    <TableCell className="table-cell">
                      {municipality.psgc_id}
                    </TableCell>
                    <TableCell className="table-cell">
                      {municipality.name}
                    </TableCell>
                    <TableCell className="table-cell">
                      {municipality.province?.name}{" "}
                      {/* Access the province name safely */}
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={municipality.deleted_at ? "Inactive" : "Active"}
                        color={municipality.deleted_at ? "error" : "success"}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <IconButton
                        onClick={(e) => handleMenuOpen(e, municipality.id)}>
                        <MoreVertIcon />
                      </IconButton>
                      <Menu
                        anchorEl={menuAnchor[municipality.id]}
                        open={Boolean(menuAnchor[municipality.id])}
                        onClose={() => handleMenuClose(municipality.id)}>
                        <MenuItem
                          onClick={() => handleEditClick(municipality)}
                          disabled={municipality.deleted_at !== null}>
                          <EditIcon fontSize="small" sx={{ mr: 1 }} /> Edit
                        </MenuItem>
                        <MenuItem
                          onClick={() =>
                            handleArchiveRestoreClick(municipality)
                          }>
                          {municipality.deleted_at ? (
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
          count={municipalities?.result?.total || 0}
          rowsPerPage={rowsPerPage}
          page={page - 1}
          onPageChange={(event, newPage) => setPage(newPage + 1)}
          onRowsPerPageChange={(event) =>
            setRowsPerPage(parseInt(event.target.value, 10))
          }
        />
      </Paper>
      <MunicipalitiesModal
        open={modalOpen}
        handleClose={() => setModalOpen(false)}
        refetch={refetch}
        selectedMunicipality={selectedMunicipality}
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
            <HelpIcon sx={{ fontSize: 60, color: "#55b8ff" }} />
          </Box>
          <Typography variant="h6" fontWeight="bold">
            Confirmation
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to{" "}
            {selectedMunicipality?.deleted_at ? "restore" : "archive"} this
            municipality?
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

export default Municipalities;
