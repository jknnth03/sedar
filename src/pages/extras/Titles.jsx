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
import TitleModal from "../../components/modal/extras/TitleModal";
import NoDataGIF from "../../assets/no-data.gif";
import "../GeneralStyle.scss";
import {
  useDeleteTitleMutation,
  useGetShowTitlesQuery,
} from "../../features/api/extras/titleApi";
import Box from "@mui/material/Box";
import HelpIcon from "@mui/icons-material/Help";
import { Chip } from "@mui/material";

const Titles = () => {
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [showArchived, setShowArchived] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState({});
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedTitle, setSelectedTitle] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  const {
    data: titles,
    isLoading,
    isFetching,
    refetch,
  } = useGetShowTitlesQuery({
    search: searchQuery,
    page,
    per_page: rowsPerPage,
    status: showArchived ? "inactive" : "active",
  });

  const [deleteTitle] = useDeleteTitleMutation();
  const businessUnits = useMemo(() => titles?.result?.data || [], [titles]);

  const handleMenuOpen = (event, titleId) => {
    setMenuAnchor({ [titleId]: event.currentTarget });
  };

  const handleMenuClose = (titleId) => {
    setMenuAnchor((prev) => ({ ...prev, [titleId]: null }));
  };

  const handleArchiveRestoreClick = (title) => {
    handleMenuClose(title.id);
    setSelectedTitle(title);
    setConfirmOpen(true);
  };

  const handleArchiveRestoreConfirm = async () => {
    if (!selectedTitle) return;
    try {
      await deleteTitle(selectedTitle.id).unwrap();
      enqueueSnackbar(
        selectedTitle.deleted_at
          ? "Title restored successfully!"
          : "Title archived successfully!",
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
      setSelectedTitle(null);
    }
  };

  const handleAddTitle = () => {
    setSelectedTitle(null);
    setModalOpen(true);
  };

  const handleEditClick = (title) => {
    setSelectedTitle(title);
    setModalOpen(true);
    handleMenuClose(title.id);
  };

  return (
    <>
      <div className="header-container">
        <Typography className="header">Titles</Typography>
        <Button
          className="add-button"
          variant="contained"
          onClick={handleAddTitle}
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
                  Code
                </TableCell>
                <TableCell align="center" className="table-header">
                  Title Name
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
              ) : businessUnits.length > 0 ? (
                businessUnits.map((title) => (
                  <TableRow key={title.id}>
                    <TableCell className="table-cell">{title.id}</TableCell>
                    <TableCell className="table-cell">{title.code}</TableCell>
                    <TableCell className="table-cell">{title.name}</TableCell>
                    <TableCell align="center" sx={{ verticalAlign: "middle" }}>
                      <Chip
                        label={title.deleted_at ? "Inactive" : "Active"}
                        color={title.deleted_at ? "error" : "success"}
                      />
                    </TableCell>

                    <TableCell align="center">
                      <IconButton onClick={(e) => handleMenuOpen(e, title.id)}>
                        <MoreVertIcon />
                      </IconButton>
                      <Menu
                        anchorEl={menuAnchor[title.id]}
                        open={Boolean(menuAnchor[title.id])}
                        onClose={() => handleMenuClose(title.id)}>
                        <MenuItem
                          onClick={() => handleEditClick(title)}
                          disabled={title.deleted_at !== null}>
                          <EditIcon fontSize="small" sx={{ mr: 1 }} /> Edit
                        </MenuItem>
                        <MenuItem
                          onClick={() => handleArchiveRestoreClick(title)}>
                          {title.deleted_at ? (
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
          count={titles?.result?.total || 0}
          rowsPerPage={rowsPerPage}
          page={page - 1}
          onPageChange={(event, newPage) => setPage(newPage + 1)}
          onRowsPerPageChange={(event) => {
            setRowsPerPage(parseInt(event.target.value, 10));
            setPage(1);
          }}
        />
      </Paper>

      <TitleModal
        open={modalOpen}
        handleClose={() => setModalOpen(false)}
        refetch={refetch}
        selectedTitle={selectedTitle}
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
          <Typography variant="h6" fontWeight="bold" textAlign="center">
            Confirmation
          </Typography>
        </DialogTitle>

        <DialogContent>
          <Typography variant="body1" gutterBottom>
            Are you sure you want to{" "}
            <span style={{ fontWeight: "bold" }}>
              {selectedTitle?.deleted_at ? "restore" : "archive"}
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

export default Titles;
