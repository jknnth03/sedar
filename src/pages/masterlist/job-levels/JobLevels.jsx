import React, { useState, useMemo, useEffect, useCallback } from "react";
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
  Edit as EditIcon,
  Archive as ArchiveIcon,
  Restore as RestoreIcon,
  MoreVert as MoreVertIcon,
  Add as AddIcon,
  Help as HelpIcon,
} from "@mui/icons-material";
import { useSnackbar } from "notistack";
import { SearchBar } from "../masterlistComponents";
import "../../../pages/GeneralStyle.scss";
import {
  useDeleteJoblevelMutation,
  useGetJoblevelsQuery,
} from "../../../features/api/masterlist/joblevelsApi";
import JoblevelsModal from "../../../components/modal/masterlist/JoblevelsModal";
import { CONSTANT } from "../../../config";
import useDebounce from "../../../hooks/useDebounce";

const JobLevels = () => {
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [showArchived, setShowArchived] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState({});
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedJoblevel, setSelectedJoblevel] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const debounceValue = useDebounce(searchQuery, 500);
  const { enqueueSnackbar } = useSnackbar();

  // Create a memoized query parameters object
  const queryParams = useMemo(
    () => ({
      search: debounceValue,
      page,
      per_page: rowsPerPage,
      status: showArchived ? "inactive" : "active",
    }),
    [debounceValue, page, rowsPerPage, showArchived]
  );

  const {
    data: joblevels,
    isLoading,
    isFetching,
    refetch,
  } = useGetJoblevelsQuery(queryParams, {
    refetchOnMountOrArgChange: true,
  });

  const [deleteJoblevel] = useDeleteJoblevelMutation();

  const joblevelList = useMemo(
    () => joblevels?.result?.data || [],
    [joblevels]
  );

  const handleMenuOpen = (event, joblevelId) => {
    setMenuAnchor((prev) => ({ ...prev, [joblevelId]: event.currentTarget }));
  };

  const handleMenuClose = (joblevelId) => {
    setMenuAnchor((prev) => ({ ...prev, [joblevelId]: null }));
  };

  const handleArchiveRestoreClick = (joblevel) => {
    setSelectedJoblevel(joblevel);
    setConfirmOpen(true);
    handleMenuClose(joblevel.id);
  };

  const handleArchiveRestoreConfirm = async () => {
    if (!selectedJoblevel) return;
    try {
      await deleteJoblevel(selectedJoblevel.id).unwrap();
      enqueueSnackbar(
        selectedJoblevel.deleted_at
          ? "Joblevel restored successfully!"
          : "Joblevel archived successfully!",
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
      setSelectedJoblevel(null);
    }
  };

  const handleAddJoblevel = () => {
    setSelectedJoblevel(null);
    setModalOpen(true);
  };

  const handleEditClick = (joblevel) => {
    setSelectedJoblevel(joblevel);
    setModalOpen(true);
    handleMenuClose(joblevel.id);
  };

  const handleSearchChange = useCallback((newSearchQuery) => {
    setSearchQuery(newSearchQuery);
  }, []);

  const handleChangeArchived = useCallback((newShowArchived) => {
    setShowArchived(newShowArchived);
  }, []);

  return (
    <>
      <div className="header-container">
        <Typography className="header">JOB LEVELS</Typography>
        <Button
          className="add-button"
          variant="contained"
          onClick={handleAddJoblevel}
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
            setShowArchived={handleChangeArchived}
          />
        </div>

        <TableContainer className="table-container">
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell className="table-id">ID</TableCell>
                <TableCell className="table-id">LEVEL</TableCell>
                <TableCell className="table-id">CODE</TableCell>
                <TableCell className="table-header">SALARY STRUCTURE</TableCell>
                <TableCell className="table-header">PAY FREQUENCY</TableCell>
                <TableCell className="table-status">STATUS</TableCell>
                <TableCell className="table-status">ACTIONS</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading || isFetching ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <CircularProgress size={24} />
                  </TableCell>
                </TableRow>
              ) : joblevelList.length > 0 ? (
                joblevelList.map((joblevel) => (
                  <TableRow key={joblevel.id}>
                    <TableCell className="table-cell-id">
                      {joblevel.id}
                    </TableCell>
                    <TableCell className="table-cell-id2">
                      {joblevel.name}
                    </TableCell>
                    <TableCell className="table-cell-id2">
                      {joblevel.code}
                    </TableCell>
                    <TableCell className="table-cell2">
                      {joblevel.salary_structure || "-"}
                    </TableCell>
                    <TableCell className="table-cell2">
                      {joblevel.pay_frequency || "-"}
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
                        onClick={(e) => handleMenuOpen(e, joblevel.id)}>
                        <MoreVertIcon />
                      </IconButton>
                      <Menu
                        anchorEl={menuAnchor[joblevel.id]}
                        open={Boolean(menuAnchor[joblevel.id])}
                        onClose={() => handleMenuClose(joblevel.id)}>
                        {!joblevel.deleted_at && (
                          <MenuItem onClick={() => handleEditClick(joblevel)}>
                            <EditIcon fontSize="small" sx={{ mr: 1 }} />
                            Edit
                          </MenuItem>
                        )}
                        <MenuItem
                          onClick={() => handleArchiveRestoreClick(joblevel)}>
                          {joblevel.deleted_at ? (
                            <>
                              <RestoreIcon fontSize="small" sx={{ mr: 1 }} />
                              Restore
                            </>
                          ) : (
                            <>
                              <ArchiveIcon fontSize="small" sx={{ mr: 1 }} />
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
                  <TableCell
                    colSpan={7}
                    align="center"
                    borderBottom="none"
                    className="table-cell">
                    {CONSTANT.BUTTONS.NODATA.icon}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <div>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25, 50, 100]}
            component="div"
            count={joblevels?.result?.total || 0}
            rowsPerPage={rowsPerPage}
            page={Math.max(0, page - 1)}
            onPageChange={(event, newPage) => setPage(newPage + 1)}
            onRowsPerPageChange={(event) => {
              setRowsPerPage(parseInt(event.target.value, 10));
              setPage(1);
            }}
          />
        </div>
      </Paper>

      <JoblevelsModal
        open={modalOpen}
        handleClose={() => setModalOpen(false)}
        refetch={refetch}
        selectedJoblevel={selectedJoblevel}
      />

      <Dialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        maxWidth="xs"
        fullWidth>
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
          <Typography variant="body1" gutterBottom textAlign="center">
            Are you sure you want to{" "}
            <strong>
              {selectedJoblevel?.deleted_at ? "restore" : "archive"}
            </strong>{" "}
            this joblevel?
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
    </>
  );
};

export default JobLevels;
