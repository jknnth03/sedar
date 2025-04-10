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
import RegionsModal from "../../components/modal/extras/RegionsModal";
import NoDataGIF from "../../assets/no-data.gif";
import "../GeneralStyle.scss";

import Box from "@mui/material/Box";
import HelpIcon from "@mui/icons-material/Help";
import {
  useDeleteRegionsMutation,
  useGetShowRegionsQuery,
} from "../../features/api/extras/regionsApi";
import { Chip } from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";

const Regions = () => {
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [showArchived, setShowArchived] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState({});
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const { enqueueSnackbar } = useSnackbar();
  const [viewProvincesOpen, setViewProvincesOpen] = useState(false);

  const {
    data: regions,
    isLoading,
    isFetching,
    refetch,
  } = useGetShowRegionsQuery({
    search: searchQuery,
    page,
    per_page: rowsPerPage,
    status: showArchived ? "inactive" : "active",
  });

  const [deleteRegion] = useDeleteRegionsMutation();
  const regionList = useMemo(() => regions?.result?.data || [], [regions]);

  const handleMenuOpen = (event, regionId) => {
    setMenuAnchor({ [regionId]: event.currentTarget });
  };

  const handleMenuClose = (regionId) => {
    setMenuAnchor((prev) => ({ ...prev, [regionId]: null }));
  };

  const handleArchiveRestoreClick = (region) => {
    setSelectedRegion(region);
    setConfirmOpen(true);
  };

  const handleArchiveRestoreConfirm = async () => {
    if (!selectedRegion) return;
    try {
      await deleteRegion(selectedRegion.id).unwrap();
      enqueueSnackbar(
        selectedRegion.deleted_at
          ? "Region restored successfully!"
          : "Region archived successfully!",
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
      setSelectedRegion(null);
    }
  };

  const handleAddRegion = () => {
    setSelectedRegion(null);
    setModalOpen(true);
  };

  const handleEditClick = (region) => {
    setSelectedRegion(region);
    setModalOpen(true);
    handleMenuClose(region.id);
  };

  return (
    <>
      <div className="header-container">
        <Typography className="header">Regions</Typography>
        <Button
          className="add-button"
          variant="contained"
          onClick={handleAddRegion}
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
                  Region Name
                </TableCell>
                <TableCell
                  align="center"
                  sx={{
                    verticalAlign: "middle",
                    fontWeight: "bold",
                    fontSize: "1rem",
                  }}>
                  Provinces
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
              ) : regionList.length > 0 ? (
                regionList.map((region) => (
                  <TableRow key={region.id}>
                    <TableCell className="table-cell">{region.id}</TableCell>
                    <TableCell className="table-cell">
                      {region.psgc_id}
                    </TableCell>
                    <TableCell className="table-cell">{region.name}</TableCell>
                    <TableCell align="center">
                      <IconButton
                        onClick={() => {
                          setSelectedRegion(region);
                          setViewProvincesOpen(true);
                        }}>
                        <VisibilityIcon style={{ color: "black" }} />
                      </IconButton>
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={region.deleted_at ? "Inactive" : "Active"}
                        color={region.deleted_at ? "error" : "success"}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <IconButton onClick={(e) => handleMenuOpen(e, region.id)}>
                        <MoreVertIcon />
                      </IconButton>
                      <Menu
                        anchorEl={menuAnchor[region.id]}
                        open={Boolean(menuAnchor[region.id])}
                        onClose={() => handleMenuClose(region.id)}>
                        <MenuItem
                          onClick={() => handleEditClick(region)}
                          disabled={region.deleted_at !== null}>
                          <EditIcon fontSize="small" sx={{ mr: 1 }} /> Edit
                        </MenuItem>
                        <MenuItem
                          onClick={() => handleArchiveRestoreClick(region)}>
                          {region.deleted_at ? (
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
          count={regions?.result?.total || 0}
          rowsPerPage={rowsPerPage}
          page={page - 1}
          onPageChange={(event, newPage) => setPage(newPage + 1)}
          onRowsPerPageChange={(event) => {
            setRowsPerPage(parseInt(event.target.value, 10));
            setPage(1);
          }}
        />
      </Paper>

      <RegionsModal
        open={modalOpen}
        handleClose={() => setModalOpen(false)}
        refetch={refetch}
        selectedRegion={selectedRegion}
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
          <Typography variant="body1">
            Are you sure you want to{" "}
            <strong>
              {selectedRegion?.deleted_at ? "restore" : "archive"}
            </strong>{" "}
            this region?
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
      <Dialog
        open={viewProvincesOpen}
        onClose={() => {
          setViewProvincesOpen(false);
          setSelectedRegion(null);
        }}
        fullWidth
        maxWidth="sm">
        <DialogTitle style={{ backgroundColor: "rgb(233, 246, 255)" }}>
          <Typography
            variant="h6"
            style={{
              fontWeight: "bold",
              fontFamily: "'Helvetica Neue', Arial, sans-serif", // Apply Helvetica Neue font
            }}>
            Provinces in {selectedRegion?.name}
          </Typography>
        </DialogTitle>
        <DialogContent style={{ backgroundColor: "white" }}>
          {selectedRegion?.provinces?.length > 0 ? (
            <div style={{ paddingTop: "1rem" }}>
              {selectedRegion.provinces.map((province) => (
                <div
                  key={province.id}
                  style={{
                    borderBottom: "1px solid #ccc",
                    padding: "0.5rem 0",
                    fontFamily: "'Helvetica Neue', Arial, sans-serif", // Apply Helvetica Neue font
                    fontSize: "1rem", // Set font size
                    color: "#333", // Set font color
                  }}>
                  {province.name}
                </div>
              ))}
            </div>
          ) : (
            <Typography
              style={{
                marginTop: "0.5rem",
                marginBottom: "0.5rem",
                padding: "0.5rem",
                fontFamily: "'Helvetica Neue', Arial, sans-serif", // Apply Helvetica Neue font
                fontSize: "1rem", // Set font size
                color: "#333", // Set font color
              }}>
              No provinces found.
            </Typography>
          )}
        </DialogContent>
        <DialogActions style={{ backgroundColor: "white" }}>
          <Button
            onClick={() => {
              setViewProvincesOpen(false);
              setSelectedRegion(null);
            }}
            variant="contained"
            color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Regions;
