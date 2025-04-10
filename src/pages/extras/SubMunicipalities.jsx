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

import NoDataGIF from "../../assets/no-data.gif";
import "../GeneralStyle.scss";
import {
  useDeleteSubMunicipalityMutation,
  useGetSubMunicipalitiesQuery,
} from "../../features/api/extras/subMunicipalitiesApi";
import SubMunicipalitiesModal from "../../components/modal/extras/SubMunicipalitesModal";

const SubMunicipalities = () => {
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [showArchived, setShowArchived] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState({});
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedSubMunicipality, setSelectedSubMunicipality] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  const {
    data: subMunicipalities,
    isLoading,
    isFetching,
    refetch,
  } = useGetSubMunicipalitiesQuery({
    search: searchQuery,
    page,
    per_page: rowsPerPage,
    status: showArchived ? "inactive" : "active",
  });

  const [archiveSubMunicipality] = useDeleteSubMunicipalityMutation();

  const subMunicipalityList = useMemo(
    () => subMunicipalities?.result?.data || [],
    [subMunicipalities]
  );

  const handleMenuOpen = (event, subMunicipalityId) => {
    setMenuAnchor({ [subMunicipalityId]: event.currentTarget });
  };

  const handleMenuClose = (subMunicipalityId) => {
    setMenuAnchor((prev) => {
      const updatedMenuAnchor = { ...prev };
      delete updatedMenuAnchor[subMunicipalityId];
      return updatedMenuAnchor;
    });
  };

  const handleArchiveRestoreClick = (subMunicipality) => {
    handleMenuClose(subMunicipality.id);
    setTimeout(() => {
      setSelectedSubMunicipality(subMunicipality);
      setConfirmOpen(true);
    }, 200);
  };

  const handleArchiveRestoreConfirm = async () => {
    if (!selectedSubMunicipality) return;

    try {
      await archiveSubMunicipality(selectedSubMunicipality.id).unwrap();

      enqueueSnackbar(
        selectedSubMunicipality.deleted_at
          ? "Sub-Municipality restored successfully!"
          : "Sub-Municipality archived successfully!",
        { variant: "success", autoHideDuration: 2000 }
      );

      setConfirmOpen(false);
      setSelectedSubMunicipality(null);
      refetch();
    } catch (error) {
      enqueueSnackbar(
        error?.data?.message || "Action failed. Please try again.",
        { variant: "error", autoHideDuration: 2000 }
      );
    }
  };

  const handleAddSubMunicipality = () => {
    setSelectedSubMunicipality(null);
    setModalOpen(true);
  };

  const handleEditClick = (subMunicipality) => {
    setSelectedSubMunicipality(subMunicipality);
    setModalOpen(true);
    handleMenuClose(subMunicipality.id);
  };

  return (
    <>
      <div className="header-container">
        <Typography className="header">Sub-Municipalities</Typography>
        <Button
          className="add-button"
          variant="contained"
          onClick={handleAddSubMunicipality}
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
                  Sub-Municipality Name
                </TableCell>
                <TableCell align="center" className="table-header">
                  Population
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
              ) : subMunicipalityList.length > 0 ? (
                subMunicipalityList.map((subMunicipality) => (
                  <TableRow key={subMunicipality.id}>
                    <TableCell className="table-cell">
                      {subMunicipality.id}
                    </TableCell>
                    <TableCell className="table-cell">
                      {subMunicipality.psgc_id}
                    </TableCell>
                    <TableCell className="table-cell">
                      {subMunicipality.name}
                    </TableCell>
                    <TableCell className="table-cell">
                      {subMunicipality.population}
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={
                          subMunicipality.deleted_at ? "Inactive" : "Active"
                        }
                        color={subMunicipality.deleted_at ? "error" : "success"}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <IconButton
                        onClick={(e) => handleMenuOpen(e, subMunicipality.id)}>
                        <MoreVertIcon />
                      </IconButton>
                      <Menu
                        anchorEl={menuAnchor[subMunicipality.id]}
                        open={Boolean(menuAnchor[subMunicipality.id])}
                        onClose={() => handleMenuClose(subMunicipality.id)}>
                        <MenuItem
                          onClick={() => handleEditClick(subMunicipality)}
                          disabled={subMunicipality.deleted_at !== null}>
                          <EditIcon fontSize="small" sx={{ mr: 1 }} /> Edit
                        </MenuItem>
                        <MenuItem
                          onClick={() =>
                            handleArchiveRestoreClick(subMunicipality)
                          }>
                          {subMunicipality.deleted_at ? (
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
          count={subMunicipalities?.result?.total || 0}
          rowsPerPage={rowsPerPage}
          page={page - 1}
          onPageChange={(event, newPage) => setPage(newPage + 1)}
          onRowsPerPageChange={(event) =>
            setRowsPerPage(parseInt(event.target.value, 10))
          }
        />
      </Paper>
      <SubMunicipalitiesModal
        open={modalOpen}
        handleClose={() => setModalOpen(false)}
        refetch={refetch}
        selectedSubMunicipality={selectedSubMunicipality}
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
            {selectedSubMunicipality?.deleted_at ? "restore" : "archive"} this
            sub-municipality?
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

export default SubMunicipalities;
