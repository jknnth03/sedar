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
import ToolsModal from "../../components/modal/extras/ToolsModal";
import NoDataGIF from "../../assets/no-data.gif";
import "../GeneralStyle.scss";
import {
  useDeleteToolsMutation,
  useGetShowToolsQuery,
} from "../../features/api/extras/toolsApi";

const Tools = () => {
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [showArchived, setShowArchived] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedTool, setSelectedTool] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  const {
    data: tools,
    isLoading,
    isFetching,
    refetch,
  } = useGetShowToolsQuery({
    search: searchQuery,
    page,
    per_page: rowsPerPage,
    status: showArchived ? "inactive" : "active",
  });

  const [deleteTool] = useDeleteToolsMutation();
  const toolList = useMemo(() => tools?.result?.data || [], [tools]);

  const handleMenuOpen = (event, tool) => {
    setMenuAnchor(event.currentTarget);
    setSelectedTool(tool);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
  };

  const handleArchiveRestoreClick = () => {
    setConfirmOpen(true);
    handleMenuClose();
  };

  const handleArchiveRestoreConfirm = async () => {
    if (!selectedTool) return;
    try {
      await deleteTool(selectedTool.id).unwrap();
      enqueueSnackbar(
        selectedTool.deleted_at
          ? "Tool restored successfully!"
          : "Tool archived successfully!",
        { variant: "success", autoHideDuration: 2000 }
      );
      refetch();
    } catch (error) {
      enqueueSnackbar("Action failed. Please try again.", {
        variant: "error",
        autoHideDuration: 2000,
      });
    }
    setConfirmOpen(false);
    setSelectedTool(null);
  };

  const handleAddTool = () => {
    setSelectedTool(null);
    setModalOpen(true);
  };

  const handleEditClick = () => {
    setModalOpen(true);
    handleMenuClose();
  };

  return (
    <>
      {/* Header */}
      <div className="header-container">
        <Typography className="header">Tools</Typography>
        <Button
          className="add-button"
          variant="contained"
          onClick={handleAddTool}
          startIcon={<AddIcon />}>
          CREATE
        </Button>
      </div>

      {/* Table Container */}
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
                  Tool Name
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
              ) : toolList.length > 0 ? (
                toolList.map((tool) => (
                  <TableRow key={tool.id}>
                    <TableCell className="table-cell">{tool.id}</TableCell>
                    <TableCell className="table-cell">{tool.code}</TableCell>
                    <TableCell className="table-cell">{tool.name}</TableCell>
                    <TableCell align="center" sx={{ verticalAlign: "middle" }}>
                      <Chip
                        label={tools.deleted_at ? "Inactive" : "Active"}
                        color={tools.deleted_at ? "error" : "success"}
                      />
                    </TableCell>
                    <TableCell className="table-cell">
                      <IconButton onClick={(e) => handleMenuOpen(e, tool)}>
                        <MoreVertIcon />
                      </IconButton>
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

        {/* Pagination */}
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50, 100]}
          component="div"
          count={tools?.result?.total || 0}
          rowsPerPage={rowsPerPage}
          page={page - 1}
          onPageChange={(event, newPage) => setPage(newPage + 1)}
          onRowsPerPageChange={(event) => {
            setRowsPerPage(parseInt(event.target.value, 10));
            setPage(1);
          }}
        />
      </Paper>

      {/* Action Menu */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}>
        <MenuItem
          onClick={handleEditClick}
          disabled={selectedTool?.deleted_at !== null}>
          <EditIcon fontSize="small" sx={{ mr: 1 }} /> Edit
        </MenuItem>
        <MenuItem onClick={handleArchiveRestoreClick}>
          {selectedTool?.deleted_at ? (
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

      {/* Confirmation Dialog */}
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
            <strong>{selectedTool?.deleted_at ? "restore" : "archive"}</strong>{" "}
            this tool?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: "center", pb: 2 }}>
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
        </DialogActions>
      </Dialog>

      {/* Tool Modal */}
      <ToolsModal
        open={modalOpen}
        handleClose={() => setModalOpen(false)}
        refetch={refetch}
        selectedTool={selectedTool}
      />
    </>
  );
};

export default Tools;
