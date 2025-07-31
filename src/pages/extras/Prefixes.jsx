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
import PrefixesModal from "../../components/modal/extras/PrefixesModal";
import NoDataGIF from "../../assets/no-data.gif";
import "../GeneralStyle.scss";

import Box from "@mui/material/Box";
import HelpIcon from "@mui/icons-material/Help";
import {
  useDeletePrefixesMutation,
  useGetShowPrefixesQuery,
} from "../../features/api/extras/prefixesApi";
import { Chip } from "@mui/material";
import useDebounce from "../../hooks/useDebounce";

const Prefixes = () => {
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [showArchived, setShowArchived] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState({});
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedPrefix, setSelectedPrefix] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const { enqueueSnackbar } = useSnackbar();
  const debounceValue = useDebounce(searchQuery, 500);

  const {
    data: prefixes,
    isLoading,
    isFetching,
    refetch,
  } = useGetShowPrefixesQuery({
    search: debounceValue,
    page,
    per_page: rowsPerPage,
    status: showArchived ? "inactive" : "active",
  });

  const [deletePrefix] = useDeletePrefixesMutation();
  const prefixList = useMemo(() => prefixes?.result?.data || [], [prefixes]);

  const handleMenuOpen = (event, prefixId) => {
    setMenuAnchor({ [prefixId]: event.currentTarget });
  };

  const handleMenuClose = (prefixId) => {
    setMenuAnchor((prev) => ({ ...prev, [prefixId]: null }));
  };

  const handleArchiveRestoreClick = (prefix) => {
    console.log("Clicked archive/restore for:", prefix);
    setSelectedPrefix(prefix);
    setConfirmOpen(true);
    handleMenuClose(prefix.id);
  };

  const handleArchiveRestoreConfirm = async () => {
    if (!selectedPrefix) return;
    try {
      await deletePrefix(selectedPrefix.id).unwrap();
      enqueueSnackbar(
        selectedPrefix.deleted_at
          ? "Prefix restored successfully!"
          : "Prefix archived successfully!",
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
      setSelectedPrefix(null);
    }
  };

  const handleAddPrefix = () => {
    setSelectedPrefix(null);
    setModalOpen(true);
  };

  const handleEditClick = (prefix) => {
    setSelectedPrefix(prefix);
    setModalOpen(true);
    handleMenuClose(prefix.id);
  };

  return (
    <>
      <div className="header-container">
        <Typography className="header">PREFIXES</Typography>
        <Button
          className="add-button"
          variant="contained"
          onClick={handleAddPrefix}
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
                <TableCell className="table-id2">CODE</TableCell>
                <TableCell className="table-header">PREFIX</TableCell>
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
              ) : prefixList.length > 0 ? (
                prefixList.map((prefix) => (
                  <TableRow key={prefix.id}>
                    <TableCell className="table-cell-id2">
                      {prefix.id}
                    </TableCell>
                    <TableCell className="table-cell-id2">
                      {prefix.code}
                    </TableCell>
                    <TableCell className="table-cell">{prefix.name}</TableCell>
                    <TableCell className="table-status2">
                      <Chip
                        label={showArchived ? "INACTIVE" : "ACTIVE"}
                        color={showArchived ? "error" : "success"}
                        size="medium"
                        sx={{ "& .MuiChip-label": { fontSize: "0.68rem" } }}
                      />
                    </TableCell>
                    <TableCell className="table-status2">
                      <IconButton onClick={(e) => handleMenuOpen(e, prefix.id)}>
                        <MoreVertIcon />
                      </IconButton>
                      <Menu
                        anchorEl={menuAnchor[prefix.id]}
                        open={Boolean(menuAnchor[prefix.id])}
                        onClose={() => handleMenuClose(prefix.id)}>
                        {!prefix.deleted_at && (
                          <MenuItem onClick={() => handleEditClick(prefix)}>
                            <EditIcon fontSize="small" sx={{ mr: 1 }} /> Edit
                          </MenuItem>
                        )}
                        <MenuItem
                          onClick={() => handleArchiveRestoreClick(prefix)}>
                          {prefix.deleted_at ? (
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
          count={prefixes?.result?.total || 0}
          rowsPerPage={rowsPerPage}
          page={page - 1}
          onPageChange={(event, newPage) => setPage(newPage + 1)}
          onRowsPerPageChange={(event) => {
            setRowsPerPage(parseInt(event.target.value, 10));
            setPage(1);
          }}
        />
      </Paper>

      <PrefixesModal
        open={modalOpen}
        handleClose={() => setModalOpen(false)}
        refetch={refetch}
        selectedPrefix={selectedPrefix}
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
              {selectedPrefix?.deleted_at ? "restore" : "archive"}
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
    </>
  );
};

export default Prefixes;
