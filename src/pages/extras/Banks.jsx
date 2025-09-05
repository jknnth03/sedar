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
} from "@mui/icons-material";
import { useSnackbar } from "notistack";
import { SearchBar } from "../masterlist/masterlistComponents";
import BanksModal from "../../components/modal/extras/BanksModal";
import NoDataGIF from "../../assets/no-data.gif";
import "../GeneralStyle.scss";
import {
  useDeleteBanksMutation,
  useGetShowBanksQuery,
} from "../../features/api/extras/banksApi";
import HelpIcon from "@mui/icons-material/Help";
import useDebounce from "../../hooks/useDebounce";

const Banks = () => {
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [showArchived, setShowArchived] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedBank, setSelectedBank] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const { enqueueSnackbar } = useSnackbar();
  const debounceValue = useDebounce(searchQuery, 500);

  const {
    data: banks,
    isLoading,
    isFetching,
    refetch,
  } = useGetShowBanksQuery({
    search: debounceValue,
    page,
    per_page: rowsPerPage,
    status: showArchived ? "inactive" : "active",
  });

  const [deleteBank] = useDeleteBanksMutation();
  const bankList = useMemo(() => banks?.result?.data || [], [banks]);

  const handleMenuOpen = (event, bank) => {
    setMenuAnchor(event.currentTarget);
    setSelectedBank(bank);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
  };

  const handleArchiveRestoreClick = () => {
    setConfirmOpen(true);
    handleMenuClose();
  };

  const handleArchiveRestoreConfirm = async () => {
    if (!selectedBank) return;

    try {
      await deleteBank(selectedBank.id).unwrap();
      enqueueSnackbar(
        selectedBank.deleted_at
          ? "Bank restored successfully!"
          : "Bank archived successfully!",
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
      setSelectedBank(null);
    }
  };

  const handleAddBank = () => {
    setSelectedBank(null);
    setModalOpen(true);
  };

  const handleEditClick = () => {
    setModalOpen(true);
    handleMenuClose();
  };

  return (
    <>
      <div className="header-container">
        <Typography className="header">BANKS</Typography>
        <Button
          className="add-button"
          variant="contained"
          onClick={handleAddBank}
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
                <TableCell className="table-header">BANK</TableCell>
                <TableCell className="table-status">STATUS</TableCell>
                <TableCell className="table-status">ACTIONS</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading || isFetching ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <CircularProgress size={24} />
                  </TableCell>
                </TableRow>
              ) : bankList.length > 0 ? (
                bankList.map((bank) => (
                  <TableRow key={bank.id}>
                    <TableCell className="table-cell-id">{bank.id}</TableCell>
                    <TableCell className="table-cell-id2">
                      {bank.code}
                    </TableCell>
                    <TableCell className="table-cell">{bank.name}</TableCell>
                    <TableCell className="table-status">
                      <Chip
                        label={showArchived ? "INACTIVE" : "ACTIVE"}
                        color={showArchived ? "error" : "success"}
                        size="medium"
                        sx={{ "& .MuiChip-label": { fontSize: "0.68rem" } }}
                      />
                    </TableCell>
                    <TableCell className="table-status">
                      <IconButton onClick={(e) => handleMenuOpen(e, bank)}>
                        <MoreVertIcon />
                      </IconButton>
                      <Menu
                        anchorEl={menuAnchor}
                        open={Boolean(menuAnchor)}
                        onClose={handleMenuClose}
                        PaperProps={{
                          elevation: 2,
                          sx: {
                            borderRadius: 2,
                            boxShadow: "0px 2px 5px rgba(0,0,0,0.15)",
                          },
                        }}>
                        {!bank.deleted_at && (
                          <MenuItem onClick={() => handleEditClick(bank)}>
                            <EditIcon fontSize="small" sx={{ mr: 1 }} /> Edit
                          </MenuItem>
                        )}
                        <MenuItem onClick={() => handleArchiveRestoreClick()}>
                          {bank.deleted_at ? (
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

        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50, 100]}
          component="div"
          count={banks?.result?.total || 0}
          rowsPerPage={rowsPerPage}
          page={page - 1}
          onPageChange={(event, newPage) => setPage(newPage + 1)}
          onRowsPerPageChange={(event) => {
            setRowsPerPage(parseInt(event.target.value, 10));
            setPage(1);
          }}
        />
      </Paper>

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
              {selectedBank?.deleted_at ? "restore" : "archive"}
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

      <BanksModal
        open={modalOpen}
        handleClose={() => setModalOpen(false)}
        refetch={refetch}
        selectedBank={selectedBank}
      />
    </>
  );
};

export default Banks;
