import React, { useState, useMemo } from "react";
import {
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
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
  Chip,
  TablePagination,
  Box,
} from "@mui/material";
import {
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Archive as ArchiveIcon,
  Restore as RestoreIcon,
  Add as AddIcon,
} from "@mui/icons-material";
import { useSnackbar } from "notistack";
import { SearchBar } from "../masterlist/masterlistComponents";
import HonorTitleModal from "../../components/modal/extras/HonorTitlesModal";
import NoDataGIF from "../../assets/no-data.gif";
import {
  useDeleteHonorTitlesMutation,
  useGetShowHonorTitlesQuery,
} from "../../features/api/extras/honortitlesApi";
import HelpIcon from "@mui/icons-material/Help";

const HonorTitles = () => {
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
    data: honorTitles,
    isLoading,
    isFetching,
    refetch,
  } = useGetShowHonorTitlesQuery({
    search: searchQuery,
    page,
    per_page: rowsPerPage,
    status: showArchived ? "inactive" : "active",
  });

  const [deleteHonorTitle] = useDeleteHonorTitlesMutation();
  const honorTitleList = useMemo(
    () => honorTitles?.result?.data || [],
    [honorTitles]
  );

  const handleMenuOpen = (event, titleId) => {
    setMenuAnchor({ [titleId]: event.currentTarget });
  };

  const handleMenuClose = (titleId) => {
    setMenuAnchor((prev) => ({ ...prev, [titleId]: null }));
  };

  const handleArchiveRestoreClick = (title) => {
    setSelectedTitle(title);
    setConfirmOpen(true);
  };

  const handleArchiveRestoreConfirm = async () => {
    if (!selectedTitle) return;
    try {
      await deleteHonorTitle({
        id: selectedTitle.id,
        restore: !!selectedTitle.deleted_at,
      }).unwrap();

      enqueueSnackbar(
        selectedTitle.deleted_at
          ? "Honor title restored successfully!"
          : "Honor title archived successfully!",
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
    setSelectedTitle(null); // ✅ Clear selected title for adding
    setModalOpen(true);
  };

  const handleEditClick = (title) => {
    setSelectedTitle(title); // ✅ Set selected title for editing
    setModalOpen(true);
    handleMenuClose(title.id);
  };

  return (
    <>
      <div className="header-container">
        <Typography className="header">Honor Titles</Typography>
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

        <TableContainer className="table-container">
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell className="table-header" align="center">
                  ID
                </TableCell>
                <TableCell className="table-header" align="center">
                  Code
                </TableCell>
                <TableCell className="table-header" align="center">
                  Honor Title
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
                  <TableCell colSpan={5} align="center">
                    <CircularProgress size={24} />
                  </TableCell>
                </TableRow>
              ) : honorTitleList.length > 0 ? (
                honorTitleList.map((title) => (
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
          count={honorTitles?.result?.total || 0}
          rowsPerPage={rowsPerPage}
          page={page - 1}
          onPageChange={(event, newPage) => setPage(newPage + 1)}
          onRowsPerPageChange={(event) => {
            setRowsPerPage(parseInt(event.target.value, 10));
            setPage(1);
          }}
        />
      </Paper>

      <HonorTitleModal
        open={modalOpen}
        handleClose={() => setModalOpen(false)}
        refetch={refetch}
        showArchived={showArchived}
        selectedHonorTitle={selectedTitle}
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

export default HonorTitles;
