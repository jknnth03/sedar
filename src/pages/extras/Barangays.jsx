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
import BarangaysModal from "../../components/modal/extras/BarangaysModal";
import NoDataGIF from "../../assets/no-data.gif";
import "../GeneralStyle.scss";
import {
  useDeleteBarangaysMutation,
  useGetBarangaysQuery,
} from "../../features/api/extras/barangaysApi";

const Barangays = () => {
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [showArchived, setShowArchived] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedBarangay, setSelectedBarangay] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  const {
    data: barangays,
    isLoading,
    isFetching,
    refetch,
  } = useGetBarangaysQuery({
    search: searchQuery,
    page,
    per_page: rowsPerPage,
    status: showArchived ? "inactive" : "active",
  });

  const [archiveBarangay] = useDeleteBarangaysMutation();

  const barangayList = useMemo(
    () => barangays?.result?.data || [],
    [barangays]
  );

  const handleMenuOpen = (event, barangay) => {
    setMenuAnchor({ anchorEl: event.currentTarget, barangay });
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
  };

  const handleArchiveRestoreClick = (barangay) => {
    setSelectedBarangay(barangay);
    setConfirmOpen(true);
    handleMenuClose();
  };

  const handleArchiveRestoreConfirm = async () => {
    if (!selectedBarangay) return;

    try {
      await archiveBarangay(selectedBarangay.id).unwrap();

      enqueueSnackbar(
        selectedBarangay.deleted_at
          ? "Barangay restored successfully!"
          : "Barangay archived successfully!",
        { variant: "success", autoHideDuration: 2000 }
      );

      setConfirmOpen(false);
      setSelectedBarangay(null);
      refetch();
    } catch (error) {
      enqueueSnackbar(
        error?.data?.message || "Action failed. Please try again.",
        { variant: "error", autoHideDuration: 2000 }
      );
    }
  };

  const handleAddBarangay = () => {
    setSelectedBarangay(null);
    setModalOpen(true);
  };

  const handleEditClick = (barangay) => {
    setSelectedBarangay(barangay);
    setModalOpen(true);
    handleMenuClose();
  };

  return (
    <>
      <div className="header-container">
        <Typography className="header">Barangays</Typography>
        <Button
          className="add-button"
          variant="contained"
          onClick={handleAddBarangay}
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
                  Code
                </TableCell>
                <TableCell align="center" className="table-header">
                  Barangay Name
                </TableCell>
                <TableCell align="center" className="table-header">
                  Status
                </TableCell>
                <TableCell align="center" className="table-header">
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
              ) : barangayList.length > 0 ? (
                barangayList.map((barangay) => (
                  <TableRow key={barangay.id}>
                    <TableCell className="table-cell">{barangay.id}</TableCell>
                    <TableCell className="table-cell">
                      {barangay.code}
                    </TableCell>
                    <TableCell className="table-cell">
                      {barangay.name}
                    </TableCell>
                    <TableCell className="table-cell">
                      {barangay.municipality_name}
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={barangay.deleted_at ? "Inactive" : "Active"}
                        color={barangay.deleted_at ? "error" : "success"}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <IconButton onClick={(e) => handleMenuOpen(e, barangay)}>
                        <MoreVertIcon />
                      </IconButton>
                      <Menu
                        anchorEl={menuAnchor?.anchorEl}
                        open={Boolean(
                          menuAnchor?.anchorEl &&
                            menuAnchor?.barangay?.id === barangay.id
                        )}
                        onClose={handleMenuClose}>
                        <MenuItem
                          onClick={() => handleEditClick(barangay)}
                          disabled={barangay.deleted_at !== null}>
                          <EditIcon fontSize="small" sx={{ mr: 1 }} /> Edit
                        </MenuItem>
                        <MenuItem
                          onClick={() => handleArchiveRestoreClick(barangay)}>
                          {barangay.deleted_at ? (
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
                  <Box colSpan={6} align="center">
                    <img
                      src={NoDataGIF}
                      alt="No Data"
                      style={{ width: "365px" }}
                    />
                  </Box>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50, 100]}
          component="div"
          count={barangays?.result?.total || 0}
          rowsPerPage={rowsPerPage}
          page={page - 1}
          onPageChange={(event, newPage) => setPage(newPage + 1)}
          onRowsPerPageChange={(event) =>
            setRowsPerPage(parseInt(event.target.value, 10))
          }
        />
      </Paper>

      <BarangaysModal
        open={modalOpen}
        handleClose={() => setModalOpen(false)}
        refetch={refetch}
        selectedBarangay={selectedBarangay}
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
            {selectedBarangay?.deleted_at ? "restore" : "archive"} this
            barangay?
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

export default Barangays;
