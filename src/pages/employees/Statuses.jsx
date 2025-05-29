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
} from "@mui/material";
import { Edit, MoreVert, Archive, Restore } from "@mui/icons-material";
import NoDataGIF from "../../assets/no-data.gif";
import { useSnackbar } from "notistack";
import {
  useGetStatusQuery,
  useDeleteStatusMutation,
} from "../../features/api/employee/statusApi";
import "../../pages/GeneralStyle.scss";

const Statuses = () => {
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [menuAnchor, setMenuAnchor] = useState({});
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(null);

  const { enqueueSnackbar } = useSnackbar();

  const {
    data: apiResponse,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useGetStatusQuery({
    page,
    per_page: rowsPerPage,
    status: "active",
  });

  const [deleteEmployeeStatus] = useDeleteStatusMutation();

  const { statusList, totalCount } = useMemo(() => {
    const result = apiResponse?.result;
    const data = result?.data || [];
    return {
      statusList: data,
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

  const handleArchiveRestoreClick = (status) => {
    handleMenuClose(status.id);
    setTimeout(() => {
      setSelectedStatus(status);
      setConfirmOpen(true);
    }, 200);
  };

  const handleArchiveRestoreConfirm = async () => {
    if (!selectedStatus) return;
    try {
      await deleteEmployeeStatus(selectedStatus.id).unwrap();
      enqueueSnackbar(
        selectedStatus.deleted_at
          ? "Status restored successfully!"
          : "Status archived successfully!",
        { variant: "success" }
      );
      setConfirmOpen(false);
      setSelectedStatus(null);
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
        <TableContainer
          sx={{
            flexGrow: 1,
            display: "flex",
            flexDirection: "column",
            height: "calc(100vh - 18rem)",
            width: "calc(100vw - 20rem)",
            overflow: "auto",
            zIndex: 0,
            margin: "0 auto",
          }}>
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
                  Status Label
                </TableCell>
                <TableCell align="left" className="table-header">
                  Status
                </TableCell>
                <TableCell align="left" className="table-header">
                  Start Date
                </TableCell>
                <TableCell align="left" className="table-header">
                  End Date
                </TableCell>
                <TableCell align="left" className="table-header">
                  Effectivity Date
                </TableCell>
                <TableCell align="left" className="table-header">
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading || isFetching ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    <CircularProgress size={24} />
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    <Typography color="error">
                      Error: {error?.data?.message || "Failed to load data"}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : statusList.length > 0 ? (
                statusList.map((item) => {
                  const isArchived = Boolean(item.deleted_at);
                  return (
                    <TableRow key={item.id}>
                      <TableCell className="table-cell">{item.id}</TableCell>
                      <TableCell className="table-cell">
                        {item.employee?.full_name || "—"}
                      </TableCell>
                      <TableCell className="table-cell">
                        {item.employee_status_label || "—"}
                      </TableCell>
                      <TableCell className="table-cell">
                        {item.employee_status || "—"}
                      </TableCell>
                      <TableCell className="table-cell">
                        {item.employee_status_start_date || "—"}
                      </TableCell>
                      <TableCell className="table-cell">
                        {item.employee_status_end_date || "—"}
                      </TableCell>
                      <TableCell className="table-cell">
                        {item.employee_status_effectivity_date || "—"}
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
                  <TableCell colSpan={8} align="center">
                    <img src={NoDataGIF} alt="No data" style={{ width: 150 }} />
                    <Typography variant="body2">
                      No active statuses found.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
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
          {selectedStatus?.deleted_at ? "Restore Status" : "Archive Status"}
        </DialogTitle>
        <DialogContent>
          <Typography align="center">
            Are you sure you want to{" "}
            <strong>
              {selectedStatus?.deleted_at ? "restore" : "archive"}
            </strong>{" "}
            this status?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: "center", pb: 2 }}>
          <Button onClick={() => setConfirmOpen(false)}>Cancel</Button>
          <Button
            onClick={handleArchiveRestoreConfirm}
            variant="contained"
            color={selectedStatus?.deleted_at ? "success" : "error"}>
            {selectedStatus?.deleted_at ? "Restore" : "Archive"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Statuses;
