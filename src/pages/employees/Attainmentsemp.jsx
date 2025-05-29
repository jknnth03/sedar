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
  Chip,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";
import { Edit, MoreVert, Archive, Restore } from "@mui/icons-material";
import { SearchBar } from "../../pages/masterlist/masterlistComponents";
import NoDataGIF from "../../assets/no-data.gif";
import { useSnackbar } from "notistack";
import {
  useGetAttainmentsQuery,
  useDeleteAttainmentMutation,
} from "../../features/api/employee/attainmentsempApi";
import "../../pages/GeneralStyle.scss";

const Attainmentsemp = () => {
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [showArchived, setShowArchived] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState({});
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedAttainment, setSelectedAttainment] = useState(null);

  const { enqueueSnackbar } = useSnackbar();

  const {
    data: apiResponse,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useGetAttainmentsQuery({
    page,
    per_page: rowsPerPage,
    status: showArchived ? "inactive" : "active",
    search: searchQuery,
  });

  const [deleteAttainment] = useDeleteAttainmentMutation();

  const { attainmentList, totalCount } = useMemo(() => {
    const result = apiResponse?.result;
    const data = result?.data || [];
    return {
      attainmentList: data,
      totalCount: result?.total || data.length,
    };
  }, [apiResponse]);

  const handleMenuOpen = (event, id) => {
    setMenuAnchor({ [id]: event.currentTarget });
  };

  const handleMenuClose = (id) => {
    setMenuAnchor((prev) => {
      const { [id]: _, ...rest } = prev;
      return rest;
    });
  };

  const handleArchiveRestoreClick = (attainment) => {
    handleMenuClose(attainment.id);
    setTimeout(() => {
      setSelectedAttainment(attainment);
      setConfirmOpen(true);
    }, 200);
  };

  const handleArchiveRestoreConfirm = async () => {
    if (!selectedAttainment) return;
    try {
      await deleteAttainment(selectedAttainment.id).unwrap();
      enqueueSnackbar(
        selectedAttainment.deleted_at
          ? "Attainment restored successfully!"
          : "Attainment archived successfully!",
        { variant: "success" }
      );
      setConfirmOpen(false);
      setSelectedAttainment(null);
      refetch();
    } catch (err) {
      enqueueSnackbar(
        err?.data?.message || "Action failed. Please try again.",
        { variant: "error" }
      );
    }
  };

  return (
    <>
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
                <TableCell align="left" className="table-header">
                  ID
                </TableCell>
                <TableCell align="left" className="table-header">
                  Employee
                </TableCell>
                <TableCell align="left" className="table-header">
                  Attainment
                </TableCell>
                <TableCell align="left" className="table-header">
                  Program
                </TableCell>
                <TableCell align="left" className="table-header">
                  Degree
                </TableCell>
                <TableCell align="left" className="table-header">
                  Honor Title
                </TableCell>
                <TableCell align="left" className="table-header">
                  Academic Years
                </TableCell>
                <TableCell align="left" className="table-header">
                  GPA
                </TableCell>
                <TableCell align="left" className="table-header">
                  Institution
                </TableCell>
                <TableCell align="left" className="table-header">
                  Status
                </TableCell>
                <TableCell align="left" className="table-header">
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading || isFetching ? (
                <TableRow>
                  <TableCell colSpan={11} align="center">
                    <CircularProgress size={24} />
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={11} align="center">
                    <Typography color="error">
                      Error: {error?.data?.message || "Failed to load data"}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : attainmentList.length > 0 ? (
                attainmentList.map((item) => {
                  const isArchived = Boolean(item.deleted_at);
                  const statusLabel = isArchived ? "Inactive" : "Active";
                  const statusColor = isArchived ? "error" : "success";
                  return (
                    <TableRow key={item.id}>
                      <TableCell className="table-cell">{item.id}</TableCell>
                      <TableCell className="table-cell">
                        {item.employee?.full_name || "—"}
                      </TableCell>
                      <TableCell className="table-cell">
                        {item.attainment?.name || "—"}
                      </TableCell>
                      <TableCell className="table-cell">
                        {item.program?.name || "—"}
                      </TableCell>
                      <TableCell className="table-cell">
                        {item.degree?.name || "—"}
                      </TableCell>
                      <TableCell className="table-cell">
                        {item.honor_title?.name || "—"}
                      </TableCell>
                      <TableCell className="table-cell">
                        {item.academic_year_from} - {item.academic_year_to}
                      </TableCell>
                      <TableCell className="table-cell">
                        {item.gpa || "—"}
                      </TableCell>
                      <TableCell className="table-cell">
                        {item.institution || "—"}
                      </TableCell>
                      <TableCell className="table-cell">
                        <Chip
                          label={statusLabel}
                          color={statusColor}
                          size="small"
                        />
                      </TableCell>
                      <TableCell className="table-cell">
                        <IconButton onClick={(e) => handleMenuOpen(e, item.id)}>
                          <MoreVert />
                        </IconButton>
                        <Menu
                          anchorEl={menuAnchor[item.id]}
                          open={Boolean(menuAnchor[item.id])}
                          onClose={() => handleMenuClose(item.id)}>
                          {!isArchived && (
                            <MenuItem
                              onClick={() => console.log("Edit", item.id)}>
                              <Edit fontSize="small" sx={{ mr: 1 }} /> Edit
                            </MenuItem>
                          )}
                          <MenuItem
                            onClick={() => handleArchiveRestoreClick(item)}>
                            {isArchived ? (
                              <>
                                <Restore fontSize="small" sx={{ mr: 1 }} />
                                Restore
                              </>
                            ) : (
                              <>
                                <Archive fontSize="small" sx={{ mr: 1 }} />
                                Archive
                              </>
                            )}
                          </MenuItem>
                        </Menu>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={11} align="center">
                    <img src={NoDataGIF} alt="No data" style={{ width: 150 }} />
                    <Typography variant="body2">
                      {showArchived
                        ? "No archived attainments found."
                        : "No active attainments found."}
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          className="pagination"
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={totalCount}
          rowsPerPage={rowsPerPage}
          page={page - 1}
          onPageChange={(_, newPage) => setPage(newPage + 1)}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(1);
          }}
        />
      </Paper>

      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle sx={{ textAlign: "center" }}>
          {selectedAttainment?.deleted_at
            ? "Restore Attainment"
            : "Archive Attainment"}
        </DialogTitle>
        <DialogContent>
          <Typography align="center">
            Are you sure you want to{" "}
            <strong>
              {selectedAttainment?.deleted_at ? "restore" : "archive"}
            </strong>{" "}
            this attainment?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: "center", pb: 2 }}>
          <Button onClick={() => setConfirmOpen(false)}>Cancel</Button>
          <Button
            onClick={handleArchiveRestoreConfirm}
            variant="contained"
            color={selectedAttainment?.deleted_at ? "success" : "error"}>
            {selectedAttainment?.deleted_at ? "Restore" : "Archive"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Attainmentsemp;
