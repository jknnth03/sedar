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
  Chip,
  Tooltip,
  ListItemText,
  ListItem,
  List,
  Box,
  Link,
  TextField,
  Checkbox,
  FormControlLabel,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import EditIcon from "@mui/icons-material/Edit";
import ArchiveIcon from "@mui/icons-material/Archive";
import RestoreIcon from "@mui/icons-material/Restore";
import HelpIcon from "@mui/icons-material/Help";
import AddIcon from "@mui/icons-material/Add";
import ShareLocationIcon from "@mui/icons-material/ShareLocation";
import SearchIcon from "@mui/icons-material/Search";
import HomeRepairServiceIcon from "@mui/icons-material/HomeRepairService";
import VisibilityIcon from "@mui/icons-material/Visibility";
import {
  useDeletePositionMutation,
  useGetPositionsQuery,
} from "../../../features/api/masterlist/positionsApi";
import PositionsModal from "../../../components/modal/masterlist/PositionsModal";
import PositionDialog from "./PositionDialog";
import CoaDialog from "./CoaDialog";
import "../../../pages/GeneralStyle.scss";
import "../../../pages/GeneralTable.scss";
import { useSnackbar } from "notistack";
import useDebounce from "../../../hooks/useDebounce";
import { CONSTANT } from "../../../config";

const CustomSearchBar = ({
  searchQuery,
  setSearchQuery,
  showArchived,
  setShowArchived,
  isLoading = false,
}) => {
  const iconColor = showArchived ? "#d32f2f" : "rgb(33, 61, 112)";
  const labelColor = showArchived ? "#d32f2f" : "rgb(33, 61, 112)";

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
      <FormControlLabel
        control={
          <Checkbox
            checked={showArchived}
            onChange={(e) => setShowArchived(e.target.checked)}
            disabled={isLoading}
            icon={<ArchiveIcon sx={{ color: iconColor }} />}
            checkedIcon={<ArchiveIcon sx={{ color: iconColor }} />}
            size="small"
          />
        }
        label="ARCHIVED"
        sx={{
          margin: 0,
          border: `1px solid ${showArchived ? "#d32f2f" : "#ccc"}`,
          borderRadius: "8px",
          paddingLeft: "8px",
          paddingRight: "12px",
          height: "36px",
          backgroundColor: showArchived ? "rgba(211, 47, 47, 0.04)" : "white",
          transition: "all 0.2s ease-in-out",
          "&:hover": {
            backgroundColor: showArchived
              ? "rgba(211, 47, 47, 0.08)"
              : "#f5f5f5",
            borderColor: showArchived ? "#d32f2f" : "rgb(33, 61, 112)",
          },
          "& .MuiFormControlLabel-label": {
            fontSize: "12px",
            fontWeight: 600,
            color: labelColor,
            letterSpacing: "0.5px",
          },
        }}
      />

      <TextField
        placeholder="Search..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        disabled={isLoading}
        size="small"
        InputProps={{
          startAdornment: (
            <SearchIcon
              sx={{
                color: isLoading ? "#ccc" : "#666",
                marginRight: 1,
                fontSize: "20px",
              }}
            />
          ),
          endAdornment: isLoading && (
            <CircularProgress size={16} sx={{ marginLeft: 1 }} />
          ),
          sx: {
            height: "36px",
            width: "320px",
            backgroundColor: "white",
            transition: "all 0.2s ease-in-out",
            "& .MuiOutlinedInput-root": {
              height: "36px",
              "& fieldset": {
                borderColor: "#ccc",
                transition: "border-color 0.2s ease-in-out",
              },
              "&:hover fieldset": {
                borderColor: "rgb(33, 61, 112)",
              },
              "&.Mui-focused fieldset": {
                borderColor: "rgb(33, 61, 112)",
                borderWidth: "2px",
              },
              "&.Mui-disabled": {
                backgroundColor: "#f5f5f5",
              },
            },
          },
        }}
        sx={{
          "& .MuiInputBase-input": {
            fontSize: "14px",
            "&::placeholder": {
              opacity: 0.7,
            },
          },
        }}
      />
    </Box>
  );
};

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
  const [positionDialogOpen, setPositionDialogOpen] = useState(false);
  const [requestorsDialogOpen, setRequestorsDialogOpen] = useState(false);
  const { enqueueSnackbar } = useSnackbar();
  const debounceValue = useDebounce(searchQuery, 500);

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

  const handleSearchChange = useCallback((newSearchQuery) => {
    setSearchQuery(newSearchQuery);
    setPage(1);
  }, []);

  const handleChangeArchived = useCallback((newShowArchived) => {
    setShowArchived(newShowArchived);
    setPage(1);
  }, []);

  const getDisplayFileName = (position) => {
    if (position.position_attachment_filename) {
      return position.position_attachment_filename;
    }

    if (position.position_attachment) {
      try {
        const urlParts = position.position_attachment.split("/");
        const filename = urlParts[urlParts.length - 1];
        return decodeURIComponent(filename);
      } catch (error) {
        return position.position_attachment;
      }
    }

    return null;
  };

  const handleMenuOpen = (event, positionId) => {
    event.stopPropagation(); // Prevent row click when opening menu
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
    setEdit(false);
    setModalOpen(true);
  };

  const handleEditClick = (position) => {
    setSelectedPosition(position);
    setEdit(true);
    setModalOpen(true);
    handleMenuClose(position.id);
  };

  // New handler for row clicks
  const handleRowClick = (position) => {
    setSelectedPosition(position);
    setEdit("view"); // Set to view mode
    setModalOpen(true);
  };

  const handleOpenCoaDialog = (position) => {
    setSelectedPosition(position);
    setCoaDialogOpen(true);
    handleMenuClose(position.id);
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

  const handleOpenPositionDialog = (position) => {
    setSelectedPosition(position);
    setPositionDialogOpen(true);
  };

  const handleClosePositionDialog = () => {
    setSelectedPosition(null);
    setPositionDialogOpen(false);
  };

  const handleOpenRequestorsDialog = (position) => {
    setSelectedPosition(position);
    setRequestorsDialogOpen(true);
  };

  const handleCloseRequestorsDialog = () => {
    setSelectedPosition(null);
    setRequestorsDialogOpen(false);
  };

  return (
    <>
      <Box
        sx={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          backgroundColor: "white",
        }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexShrink: 0,
            minHeight: "60px",
            padding: "12px 16px",
            backgroundColor: "white",
            borderBottom: "1px solid #e0e0e0",
          }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Typography className="header">POSITIONS</Typography>
            <Button
              variant="contained"
              onClick={handleAddPosition}
              startIcon={<AddIcon />}
              sx={{
                backgroundColor: "rgb(33, 61, 112)",
                "&:hover": {
                  backgroundColor: "rgb(25, 45, 85)",
                },
                textTransform: "none",
                fontWeight: 600,
                fontSize: "12px",
                height: "36px",
              }}>
              CREATE
            </Button>
          </Box>

          <CustomSearchBar
            searchQuery={searchQuery}
            setSearchQuery={handleSearchChange}
            showArchived={showArchived}
            setShowArchived={handleChangeArchived}
            isLoading={isLoading || isFetching}
          />
        </Box>

        <Box
          sx={{
            flex: 1,
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            backgroundColor: "white",
          }}>
          <TableContainer
            sx={{
              flex: 1,
              overflow: "auto",
              "& .MuiTableCell-head": {
                backgroundColor: "#f8f9fa",
                fontWeight: 700,
                fontSize: "18px",
                color: "rgb(33, 61, 112)",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                borderBottom: "2px solid #e0e0e0",
                position: "sticky",
                top: 0,
                zIndex: 10,
                height: "48px",
                padding: "8px 16px",
              },
              "& .MuiTableCell-body": {
                fontSize: "16px",
                color: "#333",
                borderBottom: "1px solid #f0f0f0",
                padding: "8px 16px",
                height: "52px",
              },
              "& .MuiTableRow-root": {
                transition: "background-color 0.2s ease-in-out",
                "&:hover": {
                  backgroundColor: "#f8f9fa",
                },
              },
            }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell align="left" sx={{ width: "60px" }}>
                    ID
                  </TableCell>
                  <TableCell sx={{ width: "300px" }}>CODE</TableCell>
                  <TableCell sx={{ width: "200px" }}>NAME</TableCell>
                  <TableCell sx={{ width: "300px" }}>CHARGING</TableCell>
                  <TableCell align="center" sx={{ width: "80px" }}>
                    COA
                  </TableCell>
                  <TableCell sx={{ width: "250px" }}>SUPERIOR</TableCell>
                  <TableCell align="center" sx={{ width: "100px" }}>
                    REQUESTORS
                  </TableCell>
                  <TableCell sx={{ width: "200px" }}>PAY FREQUENCY</TableCell>
                  <TableCell sx={{ width: "280px" }}>SCHEDULE</TableCell>
                  <TableCell sx={{ width: "250px" }}>TEAM</TableCell>
                  <TableCell align="center" sx={{ width: "80px" }}>
                    TOOLS
                  </TableCell>
                  <TableCell sx={{ width: "150px" }}>ATTACHMENTS</TableCell>
                  <TableCell align="center" sx={{ width: "100px" }}>
                    STATUS
                  </TableCell>
                  <TableCell align="center" sx={{ width: "80px" }}>
                    ACTION
                  </TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {isLoading || isFetching ? (
                  <TableRow>
                    <TableCell colSpan={14} align="center" sx={{ py: 4 }}>
                      <CircularProgress
                        size={32}
                        sx={{ color: "rgb(33, 61, 112)" }}
                      />
                    </TableCell>
                  </TableRow>
                ) : positionList.length > 0 ? (
                  positionList.map((position) => (
                    <TableRow
                      key={position.id}
                      onClick={() => handleRowClick(position)}
                      sx={{
                        cursor: "pointer",
                        "&:hover": {
                          backgroundColor: "#f5f5f5 !important",
                        },
                      }}>
                      <TableCell align="left">{position.id}</TableCell>
                      <TableCell
                        sx={{
                          minWidth: "100px",
                          width: "100px",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}>
                        {position.code}
                      </TableCell>
                      <TableCell
                        sx={{
                          fontWeight: 600,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}>
                        {position.title?.name || "—"}
                      </TableCell>
                      <TableCell
                        sx={{
                          minWidth: "300px",
                          width: "300px",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}>
                        {position.charging?.name || "—"}
                      </TableCell>
                      <TableCell align="center">
                        <Tooltip title="View COA">
                          <IconButton
                            onClick={(e) => {
                              e.stopPropagation(); // Prevent row click
                              handleOpenCoaDialog(position);
                            }}
                            size="small">
                            <ShareLocationIcon sx={{ color: "black" }} />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                      <TableCell
                        sx={{
                          minWidth: "250px",
                          width: "250px",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}>
                        {position.superior?.full_name || "—"}
                      </TableCell>
                      <TableCell align="center">
                        <Tooltip title="View Requestors">
                          <IconButton
                            onClick={(e) => {
                              e.stopPropagation(); // Prevent row click
                              handleOpenRequestorsDialog(position);
                            }}
                            size="small">
                            <VisibilityIcon sx={{ color: "black" }} />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                      <TableCell sx={{ minWidth: "200px", width: "200px" }}>
                        {position.pay_frequency || "—"}
                      </TableCell>
                      <TableCell sx={{ minWidth: "280px", width: "280px" }}>
                        {position.schedule?.name || "—"}
                      </TableCell>
                      <TableCell sx={{ minWidth: "250px", width: "250px" }}>
                        {position.team?.name || "—"}
                      </TableCell>
                      <TableCell align="center">
                        <Tooltip title="View Tools">
                          <IconButton
                            onClick={(e) => {
                              e.stopPropagation(); // Prevent row click
                              handleOpenToolsDialog(position);
                            }}
                            size="small">
                            <HomeRepairServiceIcon sx={{ color: "black" }} />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                      <TableCell>
                        {position.position_attachment ? (
                          <Link
                            component="button"
                            variant="body2"
                            onClick={(e) => {
                              e.stopPropagation(); // Prevent row click
                              handleOpenPositionDialog(position);
                            }}
                            underline="hover"
                            sx={{
                              color: "primary.main",
                              fontWeight: 500,
                              display: "block",
                              maxWidth: "150px",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                              textAlign: "left",
                              border: "none",
                              background: "none",
                              cursor: "pointer",
                            }}>
                            {getDisplayFileName(position)}
                          </Link>
                        ) : (
                          "—"
                        )}
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={position.deleted_at ? "Inactive" : "Active"}
                          color={position.deleted_at ? "error" : "success"}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <IconButton
                          onClick={(e) => handleMenuOpen(e, position.id)}
                          size="small">
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
                      colSpan={14}
                      align="center"
                      sx={{
                        py: 8,
                        borderBottom: "none",
                        color: "#666",
                        fontSize: "16px",
                      }}>
                      {searchQuery && !isLoading ? (
                        <Typography>
                          No results found for "{searchQuery}"
                        </Typography>
                      ) : (
                        CONSTANT.BUTTONS.NODATA.icon
                      )}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <Box
            sx={{
              borderTop: "1px solid #e0e0e0",
              backgroundColor: "#f8f9fa",
              flexShrink: 0,
              "& .MuiTablePagination-root": {
                color: "#666",
                "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows":
                  {
                    fontSize: "14px",
                    fontWeight: 500,
                  },
                "& .MuiTablePagination-select": {
                  fontSize: "14px",
                },
                "& .MuiIconButton-root": {
                  color: "rgb(33, 61, 112)",
                  "&:hover": {
                    backgroundColor: "rgba(33, 61, 112, 0.04)",
                  },
                  "&.Mui-disabled": {
                    color: "#ccc",
                  },
                },
              },
            }}>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25, 50, 100]}
              component="div"
              count={positions?.result?.total || 0}
              rowsPerPage={rowsPerPage}
              page={Math.max(0, page - 1)}
              onPageChange={(event, newPage) => setPage(newPage + 1)}
              onRowsPerPageChange={(event) => {
                setRowsPerPage(parseInt(event.target.value, 10));
                setPage(1);
              }}
              sx={{
                "& .MuiTablePagination-toolbar": {
                  paddingLeft: "24px",
                  paddingRight: "24px",
                },
              }}
            />
          </Box>
        </Box>
      </Box>

      <PositionDialog
        open={positionDialogOpen}
        onClose={handleClosePositionDialog}
        position={selectedPosition}
      />

      {/* Requestors Dialog */}
      <Dialog
        open={requestorsDialogOpen}
        onClose={handleCloseRequestorsDialog}
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
            Requestors for {selectedPosition?.title?.name || "Position"}
          </Typography>
        </DialogTitle>

        <DialogContent style={{ backgroundColor: "white" }}>
          <List>
            {selectedPosition?.requesters &&
            selectedPosition.requesters.length > 0 ? (
              selectedPosition.requesters.map((requestor, index) => (
                <ListItem
                  key={requestor.id}
                  style={{
                    borderBottom:
                      index < selectedPosition.requesters.length - 1
                        ? "1px solid #e0e0e0"
                        : "none",
                    fontFamily: "'Helvetica Neue', Arial, sans-serif",
                    paddingLeft: 0,
                  }}>
                  <ListItemText
                    primary={
                      <Typography
                        variant="body1"
                        style={{
                          fontWeight: "bold",
                          fontFamily: "'Helvetica Neue', Arial, sans-serif",
                          color: "#333",
                        }}>
                        {requestor.full_name}
                      </Typography>
                    }
                    secondary={
                      <Typography
                        variant="body2"
                        style={{
                          fontFamily: "'Helvetica Neue', Arial, sans-serif",
                          color: "#666",
                        }}>
                        Username: {requestor.username}
                      </Typography>
                    }
                  />
                </ListItem>
              ))
            ) : (
              <ListItem style={{ paddingLeft: 0 }}>
                <ListItemText
                  primary={
                    <Typography
                      variant="body1"
                      style={{
                        fontFamily: "'Helvetica Neue', Arial, sans-serif",
                        color: "#999",
                        fontStyle: "italic",
                      }}>
                      No requestors available
                    </Typography>
                  }
                />
              </ListItem>
            )}
          </List>
        </DialogContent>

        <DialogActions style={{ backgroundColor: "white" }}>
          <Button
            onClick={handleCloseRequestorsDialog}
            variant="contained"
            color="primary"
            style={{
              fontFamily: "'Helvetica Neue', Arial, sans-serif",
            }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

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

      <CoaDialog
        open={coaDialogOpen}
        onClose={handleCloseCoaDialog}
        selectedPosition={selectedPosition}
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
