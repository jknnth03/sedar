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
  Chip,
  Tooltip,
  ListItemText,
  ListItem,
  List,
  Box,
  Link,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import EditIcon from "@mui/icons-material/Edit";
import ArchiveIcon from "@mui/icons-material/Archive";
import RestoreIcon from "@mui/icons-material/Restore";
import HelpIcon from "@mui/icons-material/Help";
import AddIcon from "@mui/icons-material/Add";
import ShareLocationIcon from "@mui/icons-material/ShareLocation";
import { SearchBar } from "../masterlistComponents";
import {
  useDeletePositionMutation,
  useGetPositionsQuery,
} from "../../../features/api/masterlist/positionsApi";
import PositionsModal from "../../../components/modal/masterlist/PositionsModal";
import "../../../pages/GeneralStyle.scss";
import "../../../pages/GeneralTable.scss";
import { useSnackbar } from "notistack";
import HomeRepairServiceIcon from "@mui/icons-material/HomeRepairService";
import useDebounce from "../../../hooks/useDebounce";
import { CONSTANT } from "../../../config";

const Positions = () => {
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [showArchived, setShowArchived] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState({});
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [edit, setEdit] = useState(false);
  const [coaDialogOpen, setCoaDialogOpen] = useState(false);
  const [toolsDialogOpen, setToolsDialogOpen] = useState(false);
  const { enqueueSnackbar } = useSnackbar();
  const debounceValue = useDebounce(searchQuery, 500);
  console.log("selectedPosition", selectedPosition);

  const {
    data: positions,
    isLoading,
    isFetching,
    refetch,
  } = useGetPositionsQuery({
    search: debounceValue,
    page,
    per_page: rowsPerPage,
    status: showArchived ? "inactive" : "active",
  });

  const [archivePosition] = useDeletePositionMutation();

  const positionList = useMemo(
    () => positions?.result?.data || [],
    [positions]
  );

  console.log("positionList", positionList);

  // Function to extract filename from URL
  const getFileNameFromUrl = (url) => {
    if (!url) return null;
    try {
      const urlParts = url.split("/");
      const filename = urlParts[urlParts.length - 1];
      // Decode URL encoding if present
      return decodeURIComponent(filename);
    } catch (error) {
      return url; // Return original URL if parsing fails
    }
  };

  const handleMenuOpen = (event, positionId) => {
    setMenuAnchor({ [positionId]: event.currentTarget });
  };

  const handleMenuClose = (positionId) => {
    setMenuAnchor((prev) => {
      const { [positionId]: _, ...rest } = prev;
      return rest;
    });
  };

  const handleArchiveRestoreClick = (position) => {
    handleMenuClose(position.id);
    setTimeout(() => {
      setSelectedPosition(position);
      setConfirmOpen(true);
    }, 200);
  };

  const handleArchiveRestoreConfirm = async () => {
    if (!selectedPosition) return;
    try {
      await archivePosition(selectedPosition.id).unwrap();
      enqueueSnackbar(
        selectedPosition.deleted_at
          ? "Position restored successfully!"
          : "Position archived successfully!",
        { variant: "success", autoHideDuration: 2000 }
      );
      setConfirmOpen(false);
      setSelectedPosition(null);
      refetch();
    } catch (error) {
      enqueueSnackbar(
        error?.data?.message || "Action failed. Please try again.",
        {
          variant: "error",
          autoHideDuration: 2000,
        }
      );
    }
  };

  const handleAddPosition = () => {
    setSelectedPosition({});
    setModalOpen(true);
  };

  const handleEditClick = (position) => {
    setSelectedPosition(position);
    setModalOpen(true);
    setEdit(true);
    handleMenuClose(position.id);
  };

  const handleOpenCoaDialog = (position) => {
    setSelectedPosition(position);
    setCoaDialogOpen(true);
  };

  const handleCloseCoaDialog = () => {
    setSelectedPosition(null);
    setCoaDialogOpen(false);
  };

  const handleOpenToolsDialog = (position) => {
    setSelectedPosition(position);
    setToolsDialogOpen(true);
  };

  const handleCloseToolsDialog = () => {
    setSelectedPosition(null);
    setToolsDialogOpen(false);
  };

  return (
    <>
      <div className="header-container">
        <Typography
          className="header"
          onClick={handleOpenToolsDialog}
          style={{ cursor: "pointer" }}>
          Positions
        </Typography>
        <Button
          className="add-button"
          variant="contained"
          onClick={handleAddPosition}
          startIcon={<AddIcon />}>
          CREATE
        </Button>
      </div>

      {/* Tools Dialog */}
      <Dialog
        open={toolsDialogOpen}
        onClose={handleCloseToolsDialog}
        maxWidth="sm"
        fullWidth>
        <DialogTitle
          style={{
            backgroundColor: "rgb(233, 246, 255)",
          }}>
          <Typography
            variant="h6"
            style={{
              fontWeight: "bold",
              fontFamily: "'Helvetica Neue', Arial, sans-serif",
            }}>
            Tools for {selectedPosition?.title?.name || "Position"}
          </Typography>
        </DialogTitle>

        <DialogContent style={{ backgroundColor: "white" }}>
          <List>
            <ListItem
              style={{
                borderBottom: "1px solid #ccc",
                fontFamily: "'Helvetica Neue', Arial, sans-serif",
              }}>
              <ListItemText
                primary={<strong>Tools:</strong>}
                secondary={
                  Array.isArray(selectedPosition?.tools)
                    ? selectedPosition?.tools.join(", ")
                    : "No tools available"
                }
                primaryTypographyProps={{
                  style: {
                    fontFamily: "'Helvetica Neue', Arial, sans-serif",
                  },
                }}
              />
            </ListItem>
          </List>
        </DialogContent>

        <DialogActions style={{ backgroundColor: "white" }}>
          <Button
            onClick={handleCloseToolsDialog}
            variant="contained"
            color="primary"
            style={{
              fontFamily: "'Helvetica Neue', Arial, sans-serif",
            }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Existing Positions Table */}
      <Paper className="container">
        <div className="table-controls">
          <SearchBar
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            showArchived={showArchived}
            setShowArchived={setShowArchived}
          />
        </div>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell className="table-id2">ID</TableCell>
                <TableCell className="table-id2">CODE</TableCell>
                <TableCell className="table-header2">NAME</TableCell>
                <TableCell className="table-status">COA</TableCell>
                <TableCell className="table-header2">PAY FREQUENCY</TableCell>
                <TableCell className="table-header2">SCHEDULE</TableCell>
                <TableCell className="table-header">TEAM</TableCell>
                <TableCell className="table-status">TOOLS</TableCell>
                <TableCell className="table-header2">ATTACHMENTS</TableCell>
                <TableCell className="table-status">STATUS</TableCell>
                <TableCell className="table-status">ACTION</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {positionList.length > 0 ? (
                positionList.map((position) => (
                  <TableRow key={position.id}>
                    <TableCell className="table-cell-id">
                      {position.id}
                    </TableCell>
                    <TableCell className="table-cell-id2">
                      {position.code}
                    </TableCell>
                    <TableCell className="table-cell2">
                      {position.title?.name || "—"}
                    </TableCell>

                    <TableCell className="table-status">
                      <Tooltip title="View COA">
                        <IconButton
                          onClick={() => handleOpenCoaDialog(position)}>
                          <ShareLocationIcon sx={{ color: "black" }} />
                        </IconButton>
                      </Tooltip>
                    </TableCell>

                    <TableCell className="table-cell2">
                      {position.pay_frequency || "—"}
                    </TableCell>

                    <TableCell className="table-cell3">
                      {position.schedule?.name || "—"}
                    </TableCell>

                    <TableCell className="table-cell2">
                      {position.team?.name || "—"}
                    </TableCell>

                    <TableCell className="table-status">
                      <Tooltip title="View Tools">
                        <IconButton
                          onClick={() => handleOpenToolsDialog(position)}>
                          <HomeRepairServiceIcon sx={{ color: "black" }} />
                        </IconButton>
                      </Tooltip>
                    </TableCell>

                    <TableCell className="table-cell2">
                      {position.position_attachment ? (
                        <Link
                          href={position.position_attachment}
                          target="_blank"
                          rel="noopener noreferrer"
                          underline="hover"
                          sx={{
                            color: "primary.main",
                            fontWeight: 500,
                            display: "block",
                            maxWidth: "150px",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}>
                          {getFileNameFromUrl(position.position_attachment)}
                        </Link>
                      ) : (
                        "—"
                      )}
                    </TableCell>

                    <TableCell className="table-status">
                      <Chip
                        label={position.deleted_at ? "Inactive" : "Active"}
                        color={position.deleted_at ? "error" : "success"}
                      />
                    </TableCell>

                    <TableCell className="table-status">
                      <IconButton
                        onClick={(e) => handleMenuOpen(e, position.id)}>
                        <MoreVertIcon />
                      </IconButton>
                      <Menu
                        anchorEl={menuAnchor[position.id]}
                        open={Boolean(menuAnchor[position.id])}
                        onClose={() => handleMenuClose(position.id)}>
                        {!position.deleted_at && (
                          <MenuItem onClick={() => handleEditClick(position)}>
                            <EditIcon fontSize="small" sx={{ mr: 1 }} /> Edit
                          </MenuItem>
                        )}
                        <MenuItem
                          onClick={() => handleArchiveRestoreClick(position)}>
                          {position.deleted_at ? (
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
                  <TableCell
                    colSpan={11}
                    align="center"
                    sx={{ borderBottom: "none" }}
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
            count={positions?.result?.total || 0}
            rowsPerPage={rowsPerPage}
            page={page - 1}
            onPageChange={(event, newPage) => setPage(newPage + 1)}
            onRowsPerPageChange={(event) => {
              setRowsPerPage(parseInt(event.target.value, 10));
              setPage(1);
            }}
          />
        </div>
      </Paper>

      <PositionsModal
        open={modalOpen}
        handleClose={() => {
          setModalOpen(false);
          setSelectedPosition({});
          setEdit(false);
        }}
        refetch={refetch}
        selectedPosition={selectedPosition}
        edit={edit}
      />

      {/* COA Dialog */}
      <Dialog
        open={coaDialogOpen}
        onClose={handleCloseCoaDialog}
        maxWidth="sm"
        fullWidth>
        <DialogTitle
          style={{
            backgroundColor: "rgb(233, 246, 255)",
          }}>
          <Typography
            variant="h6"
            style={{
              fontWeight: "bold",
              fontFamily: "'Helvetica Neue', Arial, sans-serif",
            }}>
            COA Details
          </Typography>
        </DialogTitle>

        <DialogContent style={{ backgroundColor: "white" }}>
          <List>
            <ListItem
              style={{
                borderBottom: "1px solid #ccc",
                fontFamily: "'Helvetica Neue', Arial, sans-serif",
              }}>
              <ListItemText
                primary={<strong>Company:</strong>}
                secondary={selectedPosition?.company?.name || "—"}
                secondaryTypographyProps={{
                  style: { color: "#666", fontSize: "0.9rem" },
                }}
                primaryTypographyProps={{
                  style: {
                    fontFamily: "'Helvetica Neue', Arial, sans-serif",
                  },
                }}
              />
              <Typography variant="body2" color="textSecondary">
                {selectedPosition?.company?.sync_id || "—"}
              </Typography>
            </ListItem>

            <ListItem
              style={{
                borderBottom: "1px solid #ccc",
                fontFamily: "'Helvetica Neue', Arial, sans-serif",
              }}>
              <ListItemText
                primary={<strong>Business Unit:</strong>}
                secondary={selectedPosition?.business_unit?.name || "—"}
                secondaryTypographyProps={{
                  style: { color: "#666", fontSize: "0.9rem" },
                }}
              />
              <Typography variant="body2" color="textSecondary">
                {selectedPosition?.business_unit?.sync_id || "—"}
              </Typography>
            </ListItem>

            <ListItem
              style={{
                borderBottom: "1px solid #ccc",
                fontFamily: "'Helvetica Neue', Arial, sans-serif",
              }}>
              <ListItemText
                primary={<strong>Department:</strong>}
                secondary={selectedPosition?.department?.name || "—"}
                secondaryTypographyProps={{
                  style: { color: "#666", fontSize: "0.9rem" },
                }}
              />
              <Typography variant="body2" color="textSecondary">
                {selectedPosition?.department?.sync_id || "—"}
              </Typography>
            </ListItem>

            <ListItem
              style={{
                borderBottom: "1px solid #ccc",
                fontFamily: "'Helvetica Neue', Arial, sans-serif",
              }}>
              <ListItemText
                primary={<strong>Unit:</strong>}
                secondary={selectedPosition?.unit?.name || "—"}
                secondaryTypographyProps={{
                  style: { color: "#666", fontSize: "0.9rem" },
                }}
              />
              <Typography variant="body2" color="textSecondary">
                {selectedPosition?.unit?.sync_id || "—"}
              </Typography>
            </ListItem>

            <ListItem
              style={{
                borderBottom: "1px solid #ccc",
                fontFamily: "'Helvetica Neue', Arial, sans-serif",
              }}>
              <ListItemText
                primary={<strong>Sub-Unit:</strong>}
                secondary={selectedPosition?.sub_unit?.name || "—"}
                secondaryTypographyProps={{
                  style: { color: "#666", fontSize: "0.9rem" },
                }}
              />
              <Typography variant="body2" color="textSecondary">
                {selectedPosition?.sub_unit?.sync_id || "—"}
              </Typography>
            </ListItem>

            <ListItem
              style={{
                borderBottom: "1px solid #ccc",
                fontFamily: "'Helvetica Neue', Arial, sans-serif",
              }}>
              <ListItemText
                primary={<strong>Location:</strong>}
                secondary={selectedPosition?.location?.name || "—"}
                secondaryTypographyProps={{
                  style: { color: "#666", fontSize: "0.9rem" },
                }}
              />
              <Typography variant="body2" color="textSecondary">
                {selectedPosition?.location?.sync_id || "—"}
              </Typography>
            </ListItem>
          </List>
        </DialogContent>

        <DialogActions style={{ backgroundColor: "white" }}>
          <Button
            onClick={handleCloseCoaDialog}
            variant="contained"
            color="primary"
            style={{
              fontFamily: "'Helvetica Neue', Arial, sans-serif",
            }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirmation Dialog */}
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
            <HelpIcon sx={{ fontSize: 60, color: "#55b8ff" }} />
          </Box>
          <Typography variant="h6" fontWeight="bold" textAlign="center">
            Confirmation
          </Typography>
        </DialogTitle>

        <DialogContent>
          <Typography variant="body1" gutterBottom textAlign="center">
            Are you sure you want to{" "}
            <strong>
              {selectedPosition?.deleted_at ? "restore" : "archive"}
            </strong>{" "}
            this position?
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

export default Positions;
