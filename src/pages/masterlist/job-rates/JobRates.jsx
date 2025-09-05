import React, { useState, useMemo, useCallback } from "react";
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
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Archive as ArchiveIcon,
  Restore as RestoreIcon,
  Help as HelpIcon,
} from "@mui/icons-material";
import { useSnackbar } from "notistack";
import JobRatesModal from "../../../components/modal/masterlist/JobRatesModal";
import { SearchBar } from "../masterlistComponents";
import {
  useDeleteJobrateMutation,
  useGetJobratesQuery,
} from "../../../features/api/masterlist/jobratesApi";
import "../../../pages/GeneralStyle.scss";
import "../../../pages/GeneralTable.scss";
import { CONSTANT } from "../../../config/index";
import useDebounce from "../../../hooks/useDebounce";

const JobRates = () => {
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [showArchived, setShowArchived] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState({});
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedJobRate, setSelectedJobRate] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const debounceValue = useDebounce(searchQuery, 500);
  const { enqueueSnackbar } = useSnackbar();

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
    data: jobrates,
    isLoading,
    isFetching,
    refetch,
  } = useGetJobratesQuery(queryParams, {
    refetchOnMountOrArgChange: true,
  });

  const [deleteJobRate] = useDeleteJobrateMutation();

  const jobRateList = useMemo(() => jobrates?.result?.data || [], [jobrates]);

  const handleMenuOpen = (event, jobRateId) => {
    setMenuAnchor((prev) => ({ ...prev, [jobRateId]: event.currentTarget }));
  };

  const handleMenuClose = (jobRateId) => {
    setMenuAnchor((prev) => ({ ...prev, [jobRateId]: null }));
  };

  const handleArchiveRestoreClick = (jobRate) => {
    setSelectedJobRate(jobRate);
    setConfirmOpen(true);
    handleMenuClose(jobRate.id);
  };

  const handleArchiveRestoreConfirm = async () => {
    if (!selectedJobRate) return;
    try {
      await deleteJobRate(selectedJobRate.id).unwrap();
      enqueueSnackbar(
        selectedJobRate.deleted_at
          ? "Job rate restored successfully!"
          : "Job rate archived successfully!",
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
      setSelectedJobRate(null);
    }
  };

  const handleAddJobRate = () => {
    setSelectedJobRate(null);
    setModalOpen(true);
  };

  const handleEditClick = (jobRate) => {
    setSelectedJobRate(jobRate);
    setModalOpen(true);
    handleMenuClose(jobRate.id);
  };

  const handleSearchChange = useCallback((newSearchQuery) => {
    setSearchQuery(newSearchQuery);
  }, []);

  const handleChangeArchived = useCallback((newShowArchived) => {
    setShowArchived(newShowArchived);
  }, []);

  const safelyDisplayValue = (value) =>
    value === null || value === undefined ? "N/A" : String(value);

  const formatCurrency = (value) => {
    if (value === null || value === undefined) return "N/A";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "PHP",
      minimumFractionDigits: 2,
    }).format(value);
  };

  const getPositionTitle = (jobRate) => jobRate?.position?.title?.name || "N/A";

  const getJobLevelName = (jobRate) => jobRate?.job_level?.label || "N/A";

  return (
    <>
      <div className="header-container">
        <Typography className="header">JOB RATES</Typography>
        <Button
          className="add-button"
          variant="contained"
          onClick={handleAddJobRate}
          startIcon={<AddIcon />}>
          CREATE
        </Button>
      </div>

      <Paper
        className="container"
        sx={{
          display: "flex",
          flexDirection: "column",
          height: "calc(100vh - 180px)",
          overflow: "hidden",
        }}>
        <Box className="table-controls">
          <SearchBar
            searchQuery={searchQuery}
            setSearchQuery={handleSearchChange}
            showArchived={showArchived}
            setShowArchived={handleChangeArchived}
          />
        </Box>

        <TableContainer className="table-container">
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell className="table-id">ID</TableCell>
                <TableCell className="table-header">POSITION</TableCell>
                <TableCell className="table-header">JOB LEVEL</TableCell>
                <TableCell className="table-header2">JOB RATE</TableCell>
                <TableCell className="table-header2">ALLOWANCE</TableCell>
                <TableCell className="table-header2">TOTAL SALARY</TableCell>
                <TableCell className="table-status">STATUS</TableCell>
                <TableCell className="table-status">ACTIONS</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isFetching ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    <CircularProgress size={24} />
                  </TableCell>
                </TableRow>
              ) : jobRateList.length > 0 ? (
                jobRateList.map((jobRate) => (
                  <TableRow key={jobRate.id}>
                    <TableCell className="table-cell-id">
                      {safelyDisplayValue(jobRate.id)}
                    </TableCell>
                    <TableCell className="table-cell3">
                      {getPositionTitle(jobRate)}
                    </TableCell>
                    <TableCell className="table-cell3">
                      {getJobLevelName(jobRate)}
                    </TableCell>
                    <TableCell className="table-cell2">
                      {formatCurrency(jobRate.job_rate)}
                    </TableCell>
                    <TableCell className="table-cell2">
                      {formatCurrency(jobRate.allowance)}
                    </TableCell>
                    <TableCell className="table-cell2">
                      {formatCurrency(jobRate.total_salary)}
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
                      <IconButton
                        onClick={(e) => handleMenuOpen(e, jobRate.id)}>
                        <MoreVertIcon />
                      </IconButton>
                      <Menu
                        anchorEl={menuAnchor[jobRate.id]}
                        open={Boolean(menuAnchor[jobRate.id])}
                        onClose={() => handleMenuClose(jobRate.id)}>
                        {!jobRate.deleted_at && (
                          <MenuItem onClick={() => handleEditClick(jobRate)}>
                            <EditIcon fontSize="small" sx={{ mr: 1 }} />
                            Edit
                          </MenuItem>
                        )}
                        <MenuItem
                          onClick={() => handleArchiveRestoreClick(jobRate)}>
                          {jobRate.deleted_at ? (
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
                    colSpan={8}
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

        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50, 100]}
          component="div"
          count={jobrates?.result?.total || 0}
          rowsPerPage={rowsPerPage}
          page={page - 1}
          onPageChange={(event, newPage) => setPage(newPage + 1)}
          onRowsPerPageChange={(event) => {
            setRowsPerPage(parseInt(event.target.value, 10));
            setPage(1);
          }}
        />
      </Paper>

      <JobRatesModal
        open={modalOpen}
        handleClose={() => setModalOpen(false)}
        refetch={refetch}
        selectedJobRate={selectedJobRate}
        showArchived={showArchived}
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
              {selectedJobRate?.deleted_at ? "restore" : "archive"}
            </strong>{" "}
            this job rate?
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

export default JobRates;
