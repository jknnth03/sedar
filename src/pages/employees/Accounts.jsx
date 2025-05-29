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
  useGetAccountsQuery,
  useDeleteAccountMutation,
} from "../../features/api/employee/accountsApi";
import "../../pages/GeneralStyle.scss";

const Accounts = () => {
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [showArchived, setShowArchived] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState({});
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);

  const { enqueueSnackbar } = useSnackbar();

  const {
    data: apiResponse,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useGetAccountsQuery({
    page,
    per_page: rowsPerPage,
    status: showArchived ? "inactive" : "active",
    search: searchQuery,
  });

  const [deleteAccount] = useDeleteAccountMutation();

  const { accountList, totalCount } = useMemo(() => {
    const result = apiResponse?.result;
    const data = result?.data || [];
    return {
      accountList: data,
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

  const handleArchiveRestoreClick = (account) => {
    handleMenuClose(account.id);
    setTimeout(() => {
      setSelectedAccount(account);
      setConfirmOpen(true);
    }, 200);
  };

  const handleArchiveRestoreConfirm = async () => {
    if (!selectedAccount) return;
    try {
      await deleteAccount(selectedAccount.id).unwrap();
      enqueueSnackbar(
        selectedAccount.deleted_at
          ? "Account restored successfully!"
          : "Account archived successfully!",
        { variant: "success" }
      );
      setConfirmOpen(false);
      setSelectedAccount(null);
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
      <div className="header-container">
        <Typography className="header">Employee Accounts</Typography>
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
                <TableCell>ID</TableCell>
                <TableCell>Employee</TableCell>
                <TableCell>SSS</TableCell>
                <TableCell>Pag-IBIG</TableCell>
                <TableCell>PhilHealth</TableCell>
                <TableCell>TIN</TableCell>
                <TableCell>Bank</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
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
              ) : accountList.length > 0 ? (
                accountList.map((item) => {
                  const isArchived = Boolean(item.deleted_at);
                  return (
                    <TableRow key={item.id}>
                      <TableCell>{item.id}</TableCell>
                      <TableCell>{item.employee?.full_name || "—"}</TableCell>
                      <TableCell>{item.sss_number || "—"}</TableCell>
                      <TableCell>{item.pag_ibig_number || "—"}</TableCell>
                      <TableCell>{item.philhealth_number || "—"}</TableCell>
                      <TableCell>{item.tin_number || "—"}</TableCell>
                      <TableCell>{item.bank?.name || "—"}</TableCell>
                      <TableCell>
                        <Chip
                          label={isArchived ? "Inactive" : "Active"}
                          color={isArchived ? "error" : "success"}
                          size="small"
                        />
                      </TableCell>
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
                  <TableCell colSpan={9} align="center">
                    <img src={NoDataGIF} alt="No data" style={{ width: 150 }} />
                    <Typography variant="body2">
                      {showArchived
                        ? "No archived accounts found."
                        : "No active accounts found."}
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
          {selectedAccount?.deleted_at ? "Restore Account" : "Archive Account"}
        </DialogTitle>
        <DialogContent>
          <Typography align="center">
            Are you sure you want to{" "}
            <strong>
              {selectedAccount?.deleted_at ? "restore" : "archive"}
            </strong>{" "}
            this account?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: "center", pb: 2 }}>
          <Button onClick={() => setConfirmOpen(false)}>Cancel</Button>
          <Button
            onClick={handleArchiveRestoreConfirm}
            variant="contained"
            color={selectedAccount?.deleted_at ? "success" : "error"}>
            {selectedAccount?.deleted_at ? "Restore" : "Archive"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Accounts;
