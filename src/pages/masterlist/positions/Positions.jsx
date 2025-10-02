import React, { useState, useMemo, useCallback } from "react";
import {
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
  Box,
  Link,
  TextField,
  Checkbox,
  FormControlLabel,
  useMediaQuery,
  useTheme,
  Fade,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import EditIcon from "@mui/icons-material/Edit";
import ArchiveIcon from "@mui/icons-material/Archive";
import RestoreIcon from "@mui/icons-material/Restore";
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
import { useSnackbar } from "notistack";
import useDebounce from "../../../hooks/useDebounce";
import {
  positionStyles,
  searchBarStyles,
  tableStyles,
  headerStyles,
  mainContainerStyles,
  contentContainerStyles,
} from "./PositionStyles";

const CustomSearchBar = ({
  searchQuery,
  setSearchQuery,
  showArchived,
  setShowArchived,
  isLoading = false,
}) => {
  const theme = useTheme();
  const isVerySmall = useMediaQuery("(max-width:369px)");

  const iconColor = showArchived ? "#d32f2f" : "rgb(33, 61, 112)";
  const labelColor = showArchived ? "#d32f2f" : "rgb(33, 61, 112)";

  return (
    <Box sx={searchBarStyles.container} className="search-bar-container">
      {isVerySmall ? (
        <IconButton
          onClick={() => setShowArchived(!showArchived)}
          disabled={isLoading}
          size="small"
          sx={searchBarStyles.archivedIconButton(showArchived)}>
          <ArchiveIcon sx={{ fontSize: "18px" }} />
        </IconButton>
      ) : (
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
          sx={searchBarStyles.archivedCheckbox(showArchived)}
        />
      )}

      <TextField
        placeholder={isVerySmall ? "Search..." : "Search positions..."}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        disabled={isLoading}
        size="small"
        className="search-input"
        InputProps={{
          startAdornment: (
            <SearchIcon
              sx={{
                color: isLoading ? "#ccc" : "#666",
                marginRight: 1,
                fontSize: isVerySmall ? "18px" : "20px",
              }}
            />
          ),
          endAdornment: isLoading && (
            <CircularProgress size={16} sx={{ marginLeft: 1 }} />
          ),
          sx: {
            height: "36px",
            backgroundColor: "white",
          },
        }}
        sx={searchBarStyles.searchTextField(isVerySmall, isLoading)}
      />
    </Box>
  );
};

const Positions = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.between(600, 1038));
  const isVerySmall = useMediaQuery("(max-width:369px)");
  const { enqueueSnackbar } = useSnackbar();

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
  const [isLoading, setIsLoading] = useState(false);

  const debounceValue = useDebounce(searchQuery, 500);

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
    data: positions,
    isLoading: queryLoading,
    isFetching,
    refetch,
    error,
  } = useGetPositionsQuery(queryParams);

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

  const handleMenuOpen = useCallback((event, position) => {
    event.stopPropagation();
    setMenuAnchor((prev) => ({ ...prev, [position.id]: event.currentTarget }));
  }, []);

  const handleMenuClose = useCallback((positionId) => {
    setMenuAnchor((prev) => ({ ...prev, [positionId]: null }));
  }, []);

  const handleArchiveRestoreClick = useCallback(
    (position, event) => {
      if (event) {
        event.stopPropagation();
      }
      setSelectedPosition(position);
      setConfirmOpen(true);
      handleMenuClose(position.id);
    },
    [handleMenuClose]
  );

  const handleArchiveRestoreConfirm = async () => {
    if (!selectedPosition) return;

    setIsLoading(true);
    try {
      await archivePosition(selectedPosition.id).unwrap();
      enqueueSnackbar(
        selectedPosition.deleted_at
          ? "Position restored successfully!"
          : "Position archived successfully!",
        { variant: "success", autoHideDuration: 2000 }
      );
      refetch();
    } catch (error) {
      enqueueSnackbar(
        error?.data?.message || "Action failed. Please try again.",
        {
          variant: "error",
          autoHideDuration: 2000,
        }
      );
    } finally {
      setConfirmOpen(false);
      setSelectedPosition(null);
      setIsLoading(false);
    }
  };

  const handleAddPosition = useCallback(() => {
    setSelectedPosition({});
    setEdit(false);
    setModalOpen(true);
  }, []);

  const handleEditClick = useCallback(
    (position) => {
      setSelectedPosition(position);
      setEdit(true);
      setModalOpen(true);
      handleMenuClose(position.id);
    },
    [handleMenuClose]
  );

  const handleRowClick = (position) => {
    setSelectedPosition(position);
    setEdit("view");
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

  const handlePageChange = useCallback((event, newPage) => {
    setPage(newPage + 1);
  }, []);

  const handleRowsPerPageChange = useCallback((event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(1);
  }, []);

  const renderStatusChip = useCallback((position) => {
    const isActive = !position.deleted_at;

    return (
      <Chip
        label={isActive ? "ACTIVE" : "ARCHIVED"}
        size="small"
        sx={positionStyles.statusChip(position.deleted_at)}
      />
    );
  }, []);

  const isLoadingState = queryLoading || isFetching || isLoading;

  return (
    <>
      <Box sx={mainContainerStyles}>
        <Box sx={headerStyles.container}>
          <Box sx={headerStyles.titleContainer}>
            <Typography className="header">
              {isVerySmall ? "POSITIONS" : "POSITIONS"}
            </Typography>

            {isVerySmall ? (
              <IconButton
                onClick={handleAddPosition}
                disabled={isLoadingState}
                sx={headerStyles.addIconButton}>
                <AddIcon sx={{ fontSize: "18px" }} />
              </IconButton>
            ) : (
              <Fade in={!isLoadingState}>
                <Button
                  variant="contained"
                  onClick={handleAddPosition}
                  startIcon={<AddIcon />}
                  disabled={isLoadingState}
                  className="create-button"
                  sx={headerStyles.addButton}>
                  CREATE
                </Button>
              </Fade>
            )}
          </Box>

          <CustomSearchBar
            searchQuery={searchQuery}
            setSearchQuery={handleSearchChange}
            showArchived={showArchived}
            setShowArchived={handleChangeArchived}
            isLoading={isLoadingState}
          />
        </Box>

        <Box sx={contentContainerStyles}>
          <TableContainer sx={tableStyles.container}>
            <Table stickyHeader sx={{ minWidth: isMobile ? 800 : 1400 }}>
              <TableHead>
                <TableRow>
                  <TableCell
                    align="left"
                    sx={{
                      width: isVerySmall ? "40px" : isMobile ? "50px" : "60px",
                      minWidth: isVerySmall
                        ? "40px"
                        : isMobile
                        ? "50px"
                        : "60px",
                    }}>
                    ID
                  </TableCell>
                  <TableCell
                    sx={{
                      width: isVerySmall ? "70px" : isMobile ? "80px" : "100px",
                      minWidth: isVerySmall
                        ? "70px"
                        : isMobile
                        ? "80px"
                        : "100px",
                    }}>
                    CODE
                  </TableCell>
                  <TableCell
                    sx={{
                      width: isMobile ? "120px" : "180px",
                      minWidth: isMobile ? "120px" : "180px",
                    }}>
                    NAME
                  </TableCell>
                  <TableCell
                    sx={{
                      width: isMobile ? "100px" : "130px",
                      minWidth: isMobile ? "100px" : "130px",
                    }}>
                    CHARGING
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{
                      width: isVerySmall ? "50px" : isMobile ? "60px" : "70px",
                      minWidth: isVerySmall
                        ? "50px"
                        : isMobile
                        ? "60px"
                        : "70px",
                    }}>
                    COA
                  </TableCell>
                  <TableCell
                    sx={{
                      width: isMobile ? "100px" : "140px",
                      minWidth: isMobile ? "100px" : "140px",
                    }}>
                    SUPERIOR
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{
                      width: isVerySmall ? "60px" : isMobile ? "70px" : "80px",
                      minWidth: isVerySmall
                        ? "60px"
                        : isMobile
                        ? "70px"
                        : "80px",
                    }}>
                    REQ
                  </TableCell>
                  {!isMobile && (
                    <>
                      <TableCell
                        sx={{
                          width: "160px",
                          minWidth: "160px",
                        }}>
                        PAY FREQUENCY
                      </TableCell>
                      <TableCell
                        sx={{
                          width: "110px",
                          minWidth: "110px",
                        }}>
                        SCHEDULE
                      </TableCell>
                      <TableCell
                        sx={{
                          width: "100px",
                          minWidth: "100px",
                        }}>
                        TEAM
                      </TableCell>
                    </>
                  )}
                  <TableCell
                    align="center"
                    sx={{
                      width: isVerySmall ? "50px" : isMobile ? "60px" : "70px",
                      minWidth: isVerySmall
                        ? "50px"
                        : isMobile
                        ? "60px"
                        : "70px",
                    }}>
                    TOOLS
                  </TableCell>
                  {!isMobile && (
                    <TableCell
                      sx={{
                        width: "135px",
                        minWidth: "135px",
                      }}>
                      ATTACHMENTS
                    </TableCell>
                  )}
                  <TableCell
                    align="center"
                    sx={{
                      width: isVerySmall ? "70px" : isMobile ? "80px" : "90px",
                      minWidth: isVerySmall
                        ? "70px"
                        : isMobile
                        ? "80px"
                        : "90px",
                    }}>
                    STATUS
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{
                      width: isVerySmall ? "60px" : isMobile ? "70px" : "80px",
                      minWidth: isVerySmall
                        ? "60px"
                        : isMobile
                        ? "70px"
                        : "80px",
                    }}>
                    ACTION
                  </TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {isLoadingState ? (
                  <TableRow>
                    <TableCell
                      colSpan={isMobile ? 9 : 14}
                      align="center"
                      sx={{ py: 4 }}>
                      <CircularProgress
                        size={32}
                        sx={{ color: "rgb(33, 61, 112)" }}
                      />
                    </TableCell>
                  </TableRow>
                ) : error ? (
                  <TableRow>
                    <TableCell
                      colSpan={isMobile ? 9 : 14}
                      align="center"
                      sx={{ py: 4 }}>
                      <Typography color="error">
                        Error loading data: {error.message || "Unknown error"}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : positionList.length > 0 ? (
                  positionList.map((position) => (
                    <TableRow
                      key={position.id}
                      onClick={() => handleRowClick(position)}
                      sx={tableStyles.rowHover(theme)}>
                      <TableCell align="left">{position.id}</TableCell>
                      <TableCell
                        sx={{
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          fontSize: isVerySmall ? "10px" : "12px",
                          color: "#666",
                          fontFamily: "monospace",
                        }}>
                        {position.code}
                      </TableCell>
                      <TableCell
                        sx={{
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          fontWeight: 600,
                        }}>
                        {position.title?.name || "—"}
                      </TableCell>
                      <TableCell
                        sx={{
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
                              e.stopPropagation();
                              handleOpenCoaDialog(position);
                            }}
                            size="small"
                            sx={positionStyles.actionIconButton}>
                            <ShareLocationIcon
                              sx={{
                                fontSize: isVerySmall ? "16px" : "18px",
                              }}
                            />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                      <TableCell
                        sx={{
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
                              e.stopPropagation();
                              handleOpenRequestorsDialog(position);
                            }}
                            size="small"
                            sx={positionStyles.actionIconButton}>
                            <VisibilityIcon
                              sx={{
                                fontSize: isVerySmall ? "16px" : "18px",
                              }}
                            />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                      {!isMobile && (
                        <>
                          <TableCell
                            sx={{
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}>
                            {position.pay_frequency || "—"}
                          </TableCell>
                          <TableCell
                            sx={{
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}>
                            {position.schedule?.name || "—"}
                          </TableCell>
                          <TableCell
                            sx={{
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}>
                            {position.team?.name || "—"}
                          </TableCell>
                        </>
                      )}
                      <TableCell align="center">
                        <Tooltip title="View Tools">
                          <IconButton
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenToolsDialog(position);
                            }}
                            size="small"
                            sx={positionStyles.actionIconButton}>
                            <HomeRepairServiceIcon
                              sx={{
                                fontSize: isVerySmall ? "16px" : "18px",
                              }}
                            />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                      {!isMobile && (
                        <TableCell
                          sx={{
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}>
                          {getDisplayFileName(position) ? (
                            <Link
                              href={position.position_attachment}
                              target="_blank"
                              rel="noopener"
                              onClick={(e) => e.stopPropagation()}
                              sx={positionStyles.attachmentLink}>
                              {getDisplayFileName(position)}
                            </Link>
                          ) : (
                            "—"
                          )}
                        </TableCell>
                      )}
                      <TableCell align="center">
                        <Chip
                          label={position.deleted_at ? "ARCHIVED" : "ACTIVE"}
                          size="small"
                          sx={positionStyles.statusChip(position.deleted_at)}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <IconButton
                          onClick={(e) => handleMenuOpen(e, position)}
                          size="small"
                          sx={positionStyles.actionIconButton}>
                          <MoreVertIcon sx={{ fontSize: "20px" }} />
                        </IconButton>
                        <Menu
                          anchorEl={menuAnchor[position.id]}
                          open={Boolean(menuAnchor[position.id])}
                          onClose={() => handleMenuClose(position.id)}
                          onClick={(e) => e.stopPropagation()}>
                          <MenuItem onClick={() => handleEditClick(position)}>
                            <EditIcon
                              sx={{ marginRight: 1, fontSize: "18px" }}
                            />
                            Edit
                          </MenuItem>
                          <MenuItem
                            onClick={() => handleArchiveRestoreClick(position)}>
                            {position.deleted_at ? (
                              <>
                                <RestoreIcon
                                  sx={{ marginRight: 1, fontSize: "18px" }}
                                />
                                Restore
                              </>
                            ) : (
                              <>
                                <ArchiveIcon
                                  sx={{ marginRight: 1, fontSize: "18px" }}
                                />
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
                      colSpan={isMobile ? 9 : 14}
                      align="center"
                      sx={positionStyles.emptyRow}>
                      No positions found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            rowsPerPageOptions={[5, 10, 25, 50]}
            component="div"
            count={positions?.result?.total || 0}
            rowsPerPage={rowsPerPage}
            page={page - 1}
            onPageChange={handlePageChange}
            onRowsPerPageChange={handleRowsPerPageChange}
            sx={positionStyles.tablePagination}
          />
        </Box>
      </Box>

      <PositionsModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedPosition(null);
        }}
        edit={edit}
        position={selectedPosition}
        refetch={refetch}
      />

      <CoaDialog
        open={coaDialogOpen}
        onClose={handleCloseCoaDialog}
        position={selectedPosition}
      />

      <PositionDialog
        open={toolsDialogOpen}
        onClose={handleCloseToolsDialog}
        position={selectedPosition}
        type="tools"
      />

      <PositionDialog
        open={positionDialogOpen}
        onClose={handleClosePositionDialog}
        position={selectedPosition}
        type="position"
      />

      <PositionDialog
        open={requestorsDialogOpen}
        onClose={handleCloseRequestorsDialog}
        position={selectedPosition}
        type="requestors"
      />

      <Dialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        maxWidth="xs"
        fullWidth>
        <DialogTitle sx={positionStyles.dialogTitle}>
          {selectedPosition?.deleted_at
            ? "Restore Position"
            : "Archive Position"}
        </DialogTitle>
        <DialogContent sx={positionStyles.dialogContent}>
          <Typography>
            Are you sure you want to{" "}
            {selectedPosition?.deleted_at ? "restore" : "archive"} this
            position?
          </Typography>
        </DialogContent>
        <DialogActions sx={positionStyles.dialogActions}>
          <Button
            onClick={() => setConfirmOpen(false)}
            sx={positionStyles.cancelButton}>
            Cancel
          </Button>
          <Button
            onClick={handleArchiveRestoreConfirm}
            variant="contained"
            sx={positionStyles.confirmButton(selectedPosition?.deleted_at)}>
            {selectedPosition?.deleted_at ? "Restore" : "Archive"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Positions;
