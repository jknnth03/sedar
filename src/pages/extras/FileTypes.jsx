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
import {
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Archive as ArchiveIcon,
  Restore as RestoreIcon,
  Add as AddIcon,
  Help as HelpIcon,
} from "@mui/icons-material";
import { useSnackbar } from "notistack";
import { SearchBar } from "../masterlist/masterlistComponents";
import NoDataGIF from "../../assets/no-data.gif";
import "../GeneralStyle.scss";
import {
  useDeleteFileTypesMutation,
  useGetShowFileTypesQuery,
} from "../../features/api/extras/filetypesApi";
import FileTypeModal from "../../components/modal/extras/FileTypesModal";
import useDebounce from "../../hooks/useDebounce";

const FileTypes = () => {
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [showArchived, setShowArchived] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedFileType, setSelectedFileType] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const { enqueueSnackbar } = useSnackbar();
  const debounceValue = useDebounce(searchQuery, 500);

  const {
    data: fileTypes,
    isLoading,
    isFetching,
    refetch,
  } = useGetShowFileTypesQuery({
    search: debounceValue,
    page,
    per_page: rowsPerPage,
    status: showArchived ? "inactive" : "active",
  });

  const [deleteFileType] = useDeleteFileTypesMutation();

  const fileTypeList = useMemo(
    () => fileTypes?.result?.data || [],
    [fileTypes]
  );

  const handleMenuOpen = (event, fileType) => {
    setMenuAnchor(event.currentTarget);
    setSelectedFileType(fileType);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
  };

  const handleArchiveRestoreClick = () => {
    if (selectedFileType) {
      setConfirmOpen(true);
    }
    handleMenuClose();
  };

  const handleArchiveRestoreConfirm = async () => {
    if (!selectedFileType) return;
    try {
      await deleteFileType(selectedFileType.id).unwrap();
      enqueueSnackbar(
        selectedFileType.deleted_at
          ? "File type restored successfully!"
          : "File type archived successfully!",
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
      setSelectedFileType(null);
    }
  };

  const handleAddFileType = () => {
    setSelectedFileType(null);
    setModalOpen(true);
  };

  const handleEditClick = (fileType) => {
    setSelectedFileType(fileType);
    setModalOpen(true);
    handleMenuClose();
  };

  return (
    <>
      <div className="header-container">
        <Typography className="header">FILE TYPES</Typography>
        <Button
          className="add-button"
          variant="contained"
          onClick={handleAddFileType}
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
                <TableCell className="table-header">FILE TYPE</TableCell>
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
              ) : fileTypeList.length > 0 ? (
                fileTypeList.map((fileType) => (
                  <TableRow key={fileType.id}>
                    <TableCell className="table-cell-id">
                      {fileType.id}
                    </TableCell>
                    <TableCell className="table-cell-id2">
                      {fileType.code}
                    </TableCell>
                    <TableCell className="table-cell">
                      {fileType.name}
                    </TableCell>
                    <TableCell className="table-status">
                      <Chip
                        label={showArchived ? "INACTIVE" : "ACTIVE"}
                        color={showArchived ? "error" : "success"}
                        size="medium"
                        sx={{ "& .MuiChip-label": { fontSize: "0.68rem" } }}
                      />
                    </TableCell>
                    <TableCell className="table-status2">
                      <IconButton onClick={(e) => handleMenuOpen(e, fileType)}>
                        <MoreVertIcon />
                      </IconButton>
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
          count={fileTypes?.result?.total || 0}
          rowsPerPage={rowsPerPage}
          page={page - 1}
          onPageChange={(event, newPage) => setPage(newPage + 1)}
          onRowsPerPageChange={(event) => {
            setRowsPerPage(parseInt(event.target.value, 10));
            setPage(1);
          }}
        />
      </Paper>

      {/* ✅ Fixed null crash */}
      {selectedFileType && (
        <Menu
          anchorEl={menuAnchor}
          open={Boolean(menuAnchor)}
          onClose={handleMenuClose}>
          {!selectedFileType.deleted_at && (
            <MenuItem onClick={() => handleEditClick(selectedFileType)}>
              <EditIcon fontSize="small" sx={{ mr: 1 }} /> Edit
            </MenuItem>
          )}
          <MenuItem onClick={handleArchiveRestoreClick}>
            {selectedFileType.deleted_at ? (
              <>
                <RestoreIcon fontSize="small" sx={{ mr: 1 }} /> Restore
              </>
            ) : (
              <>
                <ArchiveIcon fontSize="small" sx={{ mr: 1 }} /> Archive
              </>
            )}
          </MenuItem>
        </Menu>
      )}

      <FileTypeModal
        open={modalOpen}
        handleClose={() => {
          setModalOpen(false);
          setSelectedFileType(null);
        }}
        refetch={refetch}
        showArchived={showArchived}
        selectedFileType={selectedFileType}
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
              {selectedFileType?.deleted_at ? "restore" : "archive"}
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

export default FileTypes;
