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
import Button from "@mui/material/Button";
import { useSnackbar } from "notistack";
import AddIcon from "@mui/icons-material/Add";
import { SearchBar } from "../masterlist/masterlistComponents";
import NoDataGIF from "../../assets/no-data.gif";
import Box from "@mui/material/Box";
import HelpIcon from "@mui/icons-material/Help";
import {
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import {
  useDeleteRequisitionsMutation,
  useGetShowRequisitionsQuery,
} from "../../features/api/extras/requisitionsApi";
import RequisitionsModal from "../../components/modal/extras/RequisitionsModal";
import useDebounce from "../../hooks/useDebounce";

const RequisitionTypes = () => {
  // State management
  const [page, setPage] = useState(1); // Start from 1 for API
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [showArchived, setShowArchived] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState({});
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedRequisitionType, setSelectedRequisitionType] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const { enqueueSnackbar } = useSnackbar();
  const debounceValue = useDebounce(searchQuery, 500);

  // API query
  const {
    data: requisitions,
    isLoading,
    isFetching,
    refetch,
  } = useGetShowRequisitionsQuery({
    search: debounceValue,
    page,
    per_page: rowsPerPage,
    status: showArchived ? "inactive" : "active",
  });

  const [deleteRequisition] = useDeleteRequisitionsMutation();
  const requisitionList = useMemo(
    () => requisitions?.result?.data || [],
    [requisitions]
  );

  // Menu handlers
  const handleMenuOpen = (event, requisitionId) => {
    setMenuAnchor({ [requisitionId]: event.currentTarget });
  };

  const handleMenuClose = () => {
    setMenuAnchor({});
  };

  // Archive/Restore handlers
  const handleArchiveRestoreClick = (requisition) => {
    setSelectedRequisitionType(requisition);
    setConfirmOpen(true);
    handleMenuClose();
  };

  const handleArchiveRestoreConfirm = async () => {
    if (!selectedRequisitionType) return;

    try {
      console.log("🟡 Archiving/Restoring:", selectedRequisitionType);
      await deleteRequisition(selectedRequisitionType.id).unwrap();
      console.log("🟢 API Success");

      enqueueSnackbar(
        selectedRequisitionType.deleted_at
          ? "Requisition Type restored successfully!"
          : "Requisition Type archived successfully!",
        { variant: "success", autoHideDuration: 2000 }
      );

      refetch();
    } catch (error) {
      console.error("❌ API Error:", error);
      enqueueSnackbar("Action failed. Please try again.", {
        variant: "error",
        autoHideDuration: 2000,
      });
    } finally {
      setConfirmOpen(false);
      setSelectedRequisitionType(null);
    }
  };

  // Modal handlers
  const handleAddRequisitionType = () => {
    setSelectedRequisitionType(null);
    setModalOpen(true);
  };

  const handleEditClick = (requisition) => {
    setSelectedRequisitionType(requisition);
    setModalOpen(true);
    handleMenuClose();
  };

  // Search and filter handlers
  const handleSearchChange = (newSearchQuery) => {
    setSearchQuery(newSearchQuery);
    setPage(1); // Reset to first page when search changes
  };

  const handleShowArchivedChange = (newShowArchived) => {
    setShowArchived(newShowArchived);
    setPage(1); // Reset to first page when filter changes
  };

  return (
    <>
      <div className="header-container">
        <Typography className="header">REQUISITION TYPES</Typography>
        <Button
          className="add-button"
          variant="contained"
          onClick={handleAddRequisitionType}
          startIcon={<AddIcon />}>
          CREATE
        </Button>
      </div>

      <Paper className="container">
        <div className="table-controls">
          <SearchBar
            searchQuery={searchQuery}
            setSearchQuery={handleSearchChange}
            showArchived={showArchived}
            setShowArchived={handleShowArchivedChange}
          />
        </div>

        <TableContainer className="table-container">
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell className="table-id">ID</TableCell>
                <TableCell className="table-id">CODE</TableCell>
                <TableCell className="table-header">REQUISITION TYPE</TableCell>
                <TableCell className="table-status">STATUS</TableCell>
                <TableCell className="table-status">ACTIONS</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading || isFetching ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    <CircularProgress size={24} />
                  </TableCell>
                </TableRow>
              ) : requisitionList.length > 0 ? (
                requisitionList.map((requisition) => (
                  <TableRow key={requisition.id}>
                    <TableCell className="table-cell-id">
                      {requisition.id}
                    </TableCell>
                    <TableCell className="table-cell-id2">
                      {requisition.code}
                    </TableCell>
                    <TableCell className="table-cell">
                      {requisition.name}
                    </TableCell>
                    <TableCell className="table-status">
                      <Chip
                        label={showArchived ? "INACTIVE" : "ACTIVE"}
                        color={showArchived ? "error" : "success"}
                        size="medium"
                        sx={{ "& .MuiChip-label": { fontSize: "0.68rem" } }}
                      />
                    </TableCell>

                    <TableCell className="table-status">
                      <IconButton
                        onClick={(e) => handleMenuOpen(e, requisition.id)}>
                        <MoreVertIcon />
                      </IconButton>
                      <Menu
                        anchorEl={menuAnchor[requisition.id]}
                        open={Boolean(menuAnchor[requisition.id])}
                        onClose={handleMenuClose}>
                        {!requisition.deleted_at && (
                          <MenuItem
                            onClick={() => handleEditClick(requisition)}>
                            <EditIcon fontSize="small" sx={{ mr: 1 }} /> Edit
                          </MenuItem>
                        )}
                        <MenuItem
                          onClick={() =>
                            handleArchiveRestoreClick(requisition)
                          }>
                          {requisition.deleted_at ? (
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
                  <TableCell colSpan={5} align="center">
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
          count={requisitions?.result?.total || 0}
          rowsPerPage={rowsPerPage}
          page={page - 1}
          onPageChange={(event, newPage) => setPage(newPage + 1)}
          onRowsPerPageChange={(event) => {
            setRowsPerPage(parseInt(event.target.value, 10));
            setPage(1);
          }}
        />
      </Paper>

      <RequisitionsModal
        open={modalOpen}
        handleClose={() => setModalOpen(false)}
        refetch={refetch}
        showArchived={showArchived}
        selectedRequisition={selectedRequisitionType}
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
              {selectedRequisitionType?.deleted_at ? "restore" : "archive"}
            </span>{" "}
            this requisition type?
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

export default RequisitionTypes;
