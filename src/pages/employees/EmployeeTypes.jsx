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
import { Edit, MoreVert } from "@mui/icons-material";

import NoDataGIF from "../../assets/no-data.gif";
import { useSnackbar } from "notistack";
import "../../pages/masterlist/positions/Positions.scss";
import {
  useDeleteEmploymentTypeMutation,
  useGetEmploymentTypesQuery,
} from "../../features/api/employee/employeetypesApi";
import "../../pages/GeneralStyle.scss";

const EmployeeTypes = () => {
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [menuAnchor, setMenuAnchor] = useState({});
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedEmploymentType, setSelectedEmploymentType] = useState(null);

  const { enqueueSnackbar } = useSnackbar();

  const {
    data: apiResponse,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useGetEmploymentTypesQuery({
    page,
    per_page: rowsPerPage,
  });

  const [deleteEmploymentType] = useDeleteEmploymentTypeMutation();

  const { employmentTypeList, totalCount } = useMemo(() => {
    const result = apiResponse?.result;
    const data = result?.data || [];

    return {
      employmentTypeList: data,
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

  const handleArchiveRestoreClick = (employmentType) => {
    handleMenuClose(employmentType.id);
    setTimeout(() => {
      setSelectedEmploymentType(employmentType);
      setConfirmOpen(true);
    }, 200);
  };

  const handleArchiveRestoreConfirm = async () => {
    if (!selectedEmploymentType) return;

    try {
      await deleteEmploymentType(selectedEmploymentType.id).unwrap();
      enqueueSnackbar(
        selectedEmploymentType.deleted_at
          ? "Employment type restored successfully!"
          : "Employment type archived successfully!",
        { variant: "success" }
      );
      setConfirmOpen(false);
      setSelectedEmploymentType(null);
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
                <TableCell className="table-header">ID</TableCell>
                <TableCell className="table-header">Employee</TableCell>
                <TableCell className="table-header">
                  Employment Type Label
                </TableCell>
                <TableCell className="table-header">Employment Type</TableCell>
                <TableCell className="table-header">Start Date</TableCell>
                <TableCell className="table-header">End Date</TableCell>
                <TableCell className="table-header">
                  Regularization Date
                </TableCell>
                <TableCell className="table-header">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading || isFetching ? (
                <TableRow>
                  <TableCell colSpan={9} align="center">
                    <CircularProgress size={24} />
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={9} align="center">
                    <Typography color="error">
                      Error: {error?.data?.message || "Failed to load data"}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : employmentTypeList.length > 0 ? (
                employmentTypeList.map((item) => {
                  const isArchived = Boolean(item.deleted_at);

                  return (
                    <TableRow key={item.id}>
                      <TableCell>{item.id}</TableCell>
                      <TableCell>{item.employee?.full_name || "—"}</TableCell>
                      <TableCell>{item.employment_type_label || "—"}</TableCell>
                      <TableCell>{item.employment_type || "—"}</TableCell>
                      <TableCell>{item.start_date || "—"}</TableCell>
                      <TableCell>{item.end_date || "—"}</TableCell>
                      <TableCell>{item.regularization_date || "—"}</TableCell>
                      <TableCell>
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
                        </Menu>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={9} align="center">
                    <img src={NoDataGIF} alt="No data" style={{ width: 150 }} />
                    <Typography variant="body2">
                      No employment types found.
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
          {selectedEmploymentType?.deleted_at
            ? "Restore Employment Type"
            : "Archive Employment Type"}
        </DialogTitle>
        <DialogContent>
          <Typography align="center">
            Are you sure you want to{" "}
            <strong>
              {selectedEmploymentType?.deleted_at ? "restore" : "archive"}
            </strong>{" "}
            this employment type?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: "center", pb: 2 }}>
          <Button onClick={() => setConfirmOpen(false)}>Cancel</Button>
          <Button
            onClick={handleArchiveRestoreConfirm}
            variant="contained"
            color={selectedEmploymentType?.deleted_at ? "success" : "error"}>
            {selectedEmploymentType?.deleted_at ? "Restore" : "Archive"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default EmployeeTypes;
