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
import NoDataGIF from "../../assets/no-data.gif";
import { useSnackbar } from "notistack";
import {
  useGetContactsQuery,
  useDeleteContactMutation,
} from "../../features/api/employee/contactsApi";
import "../../pages/GeneralStyle.scss";

const Contacts = () => {
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [menuAnchor, setMenuAnchor] = useState({});
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);

  const { enqueueSnackbar } = useSnackbar();

  const {
    data: apiResponse,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useGetContactsQuery({
    page,
    per_page: rowsPerPage,
    status: "active",
    search: "",
  });

  const [deleteContact] = useDeleteContactMutation();

  const { contactList, totalCount } = useMemo(() => {
    const result = apiResponse?.result;
    const data = result?.data || [];
    return {
      contactList: data,
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

  const handleArchiveRestoreClick = (contact) => {
    handleMenuClose(contact.id);
    setTimeout(() => {
      setSelectedContact(contact);
      setConfirmOpen(true);
    }, 200);
  };

  const handleArchiveRestoreConfirm = async () => {
    if (!selectedContact) return;
    try {
      await deleteContact(selectedContact.id).unwrap();
      enqueueSnackbar(
        selectedContact.deleted_at
          ? "Contact restored successfully!"
          : "Contact archived successfully!",
        { variant: "success" }
      );
      setConfirmOpen(false);
      setSelectedContact(null);
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
        <TableContainer className="table-container">
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell align="left" className="table-id">
                  ID
                </TableCell>
                <TableCell align="left" className="table-header">
                  Employee
                </TableCell>
                <TableCell align="left" className="table-header">
                  Contact Type
                </TableCell>
                <TableCell align="left" className="table-header">
                  Contact Details
                </TableCell>
                <TableCell align="left" className="table-header">
                  Remarks
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
                  <TableCell colSpan={7} align="center">
                    <CircularProgress size={24} />
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <Typography color="error">
                      Error: {error?.data?.message || "Failed to load data"}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : contactList.length > 0 ? (
                contactList.map((item) => {
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
                        {item.contact_type || "—"}
                      </TableCell>
                      <TableCell className="table-cell">
                        {item.contact_details || "—"}
                      </TableCell>
                      <TableCell className="table-cell">
                        {item.contact_remarks || "—"}
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
                  <TableCell colSpan={7} align="center">
                    <img src={NoDataGIF} alt="No data" style={{ width: 150 }} />
                    <Typography variant="body2">
                      No active contacts found.
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
          {selectedContact?.deleted_at ? "Restore Contact" : "Archive Contact"}
        </DialogTitle>
        <DialogContent>
          <Typography align="center">
            Are you sure you want to{" "}
            <strong>
              {selectedContact?.deleted_at ? "restore" : "archive"}
            </strong>{" "}
            this contact?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: "center", pb: 2 }}>
          <Button onClick={() => setConfirmOpen(false)}>Cancel</Button>
          <Button
            onClick={handleArchiveRestoreConfirm}
            variant="contained"
            color={selectedContact?.deleted_at ? "success" : "error"}>
            {selectedContact?.deleted_at ? "Restore" : "Archive"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Contacts;
