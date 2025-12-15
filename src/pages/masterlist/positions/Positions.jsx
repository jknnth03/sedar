import React, { useState, useMemo, useCallback } from "react";
import {
  Typography,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Chip,
  Box,
  TextField,
  Checkbox,
  FormControlLabel,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import ArchiveIcon from "@mui/icons-material/Archive";
import SearchIcon from "@mui/icons-material/Search";
import HelpIcon from "@mui/icons-material/Help";
import {
  useDeletePositionMutation,
  useGetPositionsQuery,
  useLazyGetPositionByIdQuery,
} from "../../../features/api/masterlist/positionsApi";
import PositionsModal from "../../../components/modal/masterlist/PositionsModal";
import PositionDialog from "./PositionDialog";
import CoaDialog from "./CoaDialog";
import PositionsTable from "./PositionsTable";
import "../../../pages/GeneralStyle.scss";
import { useSnackbar } from "notistack";
import CustomTablePagination from "../../../pages/zzzreusable/CustomTablePagination";
import { styles } from "../../forms/manpowerform/formSubmissionStyles";

const CustomSearchBar = ({
  searchQuery,
  setSearchQuery,
  showArchived,
  setShowArchived,
  isLoading = false,
}) => {
  const isVerySmall = useMediaQuery("(max-width:369px)");
  const isMobile = useMediaQuery("(max-width:600px)");

  const iconColor = showArchived ? "#d32f2f" : "rgb(33, 61, 112)";
  const labelColor = showArchived ? "#d32f2f" : "rgb(33, 61, 112)";

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: isVerySmall ? 1 : 1.5,
      }}>
      {isVerySmall ? (
        <IconButton
          onClick={() => setShowArchived(!showArchived)}
          disabled={isLoading}
          size="small"
          sx={{
            width: "36px",
            height: "36px",
            border: `1px solid ${showArchived ? "#d32f2f" : "#ccc"}`,
            borderRadius: "8px",
            backgroundColor: showArchived ? "rgba(211, 47, 47, 0.04)" : "white",
            color: iconColor,
            transition: "all 0.2s ease-in-out",
            "&:hover": {
              backgroundColor: showArchived
                ? "rgba(211, 47, 47, 0.08)"
                : "#f5f5f5",
              borderColor: showArchived ? "#d32f2f" : "rgb(33, 61, 112)",
            },
          }}>
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
      )}

      <TextField
        placeholder={isVerySmall ? "Search..." : "Search positions..."}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        disabled={isLoading}
        size="small"
        InputProps={{
          startAdornment: (
            <SearchIcon sx={styles.searchIcon(isLoading, isVerySmall)} />
          ),
          sx: styles.searchInputProps(isLoading, isVerySmall, isMobile),
        }}
        sx={{
          ...(isVerySmall
            ? styles.searchTextFieldVerySmall
            : styles.searchTextField),
        }}
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
  const [attachmentDialogOpen, setAttachmentDialogOpen] = useState(false);
  const [requestorsDialogOpen, setRequestorsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(searchQuery);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const queryParams = useMemo(
    () => ({
      search: debouncedSearchQuery,
      page,
      per_page: rowsPerPage,
      status: showArchived ? "inactive" : "active",
    }),
    [debouncedSearchQuery, page, rowsPerPage, showArchived]
  );

  const {
    data: positions,
    isFetching,
    refetch,
    error,
  } = useGetPositionsQuery(queryParams, {
    refetchOnMountOrArgChange: true,
  });

  const [getPositionById] = useLazyGetPositionByIdQuery();

  const [archivePosition] = useDeletePositionMutation();

  const positionList = useMemo(
    () => positions?.result?.data || [],
    [positions]
  );
  const totalCount = positions?.result?.total || 0;

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
        return decodeURIComponent(filename.split("?")[0]);
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
      handleMenuClose(position.id);
      setSelectedPosition(position);
      setEdit(true);
      setModalOpen(true);
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

  const handleOpenAttachmentDialog = (position) => {
    setSelectedPosition(position);
    setAttachmentDialogOpen(true);
  };

  const handleCloseAttachmentDialog = () => {
    setSelectedPosition(null);
    setAttachmentDialogOpen(false);
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
        sx={{
          backgroundColor: isActive ? "#e8f5e8" : "#fff7f7ff",
          color: isActive ? "#2e7d32" : "#d32f2f",
          border: `1px solid ${isActive ? "#4caf50" : "#d32f2f"}`,
          fontWeight: 600,
          fontSize: "11px",
          height: "24px",
          borderRadius: "12px",
          "& .MuiChip-label": {
            padding: "0 8px",
          },
        }}
      />
    );
  }, []);

  const isLoadingState = isFetching || isLoading;

  return (
    <>
      <Box sx={styles.mainContainer}>
        <Box
          sx={{
            ...styles.headerContainer,
            ...(isMobile && styles.headerContainerMobile),
            ...(isTablet && styles.headerContainerTablet),
          }}>
          <Box
            sx={{
              ...styles.headerTitle,
              ...(isMobile && styles.headerTitleMobile),
            }}>
            <Box sx={styles.headerLeftSection}>
              <Typography
                className="header"
                sx={{
                  ...styles.headerTitleText,
                  ...(isMobile && styles.headerTitleTextMobile),
                  ...(isVerySmall && styles.headerTitleTextVerySmall),
                }}>
                POSITIONS
              </Typography>
              {isVerySmall ? (
                <IconButton
                  onClick={handleAddPosition}
                  sx={{
                    width: "36px",
                    height: "36px",
                    backgroundColor: "rgb(33, 61, 112)",
                    color: "white",
                    borderRadius: "8px",
                    "&:hover": {
                      backgroundColor: "rgb(25, 45, 84)",
                    },
                    "&:disabled": {
                      backgroundColor: "#ccc",
                    },
                  }}>
                  <AddIcon sx={{ fontSize: "18px" }} />
                </IconButton>
              ) : (
                <Button
                  variant="contained"
                  onClick={handleAddPosition}
                  startIcon={<AddIcon />}
                  sx={{
                    ...styles.createButton,
                    backgroundColor: "rgb(33, 61, 112)",
                    "&:hover": {
                      backgroundColor: "rgb(25, 45, 84)",
                    },
                  }}>
                  CREATE
                </Button>
              )}
            </Box>
          </Box>

          <CustomSearchBar
            searchQuery={searchQuery}
            setSearchQuery={handleSearchChange}
            showArchived={showArchived}
            setShowArchived={handleChangeArchived}
            isLoading={isLoadingState}
          />
        </Box>

        <Box sx={styles.tabsContainer}>
          <PositionsTable
            positionList={positionList}
            isLoadingState={isLoadingState}
            error={error}
            searchQuery={searchQuery}
            isMobile={isMobile}
            menuAnchor={menuAnchor}
            handleMenuOpen={handleMenuOpen}
            handleMenuClose={handleMenuClose}
            handleRowClick={handleRowClick}
            handleOpenCoaDialog={handleOpenCoaDialog}
            handleOpenRequestorsDialog={handleOpenRequestorsDialog}
            handleOpenToolsDialog={handleOpenToolsDialog}
            handleOpenAttachmentDialog={handleOpenAttachmentDialog}
            handleEditClick={handleEditClick}
            handleArchiveRestoreClick={handleArchiveRestoreClick}
            getDisplayFileName={getDisplayFileName}
            renderStatusChip={renderStatusChip}
          />

          <CustomTablePagination
            count={totalCount}
            page={Math.max(0, page - 1)}
            rowsPerPage={rowsPerPage}
            onPageChange={handlePageChange}
            onRowsPerPageChange={handleRowsPerPageChange}
          />
        </Box>
      </Box>

      {modalOpen && (
        <PositionsModal
          open={modalOpen}
          onClose={() => {
            setModalOpen(false);
            setSelectedPosition(null);
          }}
          edit={edit}
          position={selectedPosition}
          refetch={refetch}
          showArchived={showArchived}
        />
      )}

      {coaDialogOpen && (
        <CoaDialog
          open={coaDialogOpen}
          onClose={handleCloseCoaDialog}
          position={selectedPosition}
        />
      )}

      {toolsDialogOpen && (
        <PositionDialog
          open={toolsDialogOpen}
          onClose={handleCloseToolsDialog}
          position={selectedPosition}
          type="tools"
        />
      )}

      {attachmentDialogOpen && (
        <PositionDialog
          open={attachmentDialogOpen}
          onClose={handleCloseAttachmentDialog}
          position={selectedPosition}
        />
      )}

      {requestorsDialogOpen && (
        <PositionDialog
          open={requestorsDialogOpen}
          onClose={handleCloseRequestorsDialog}
          position={selectedPosition}
          type="requestors"
        />
      )}

      <Dialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3 },
        }}>
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <HelpIcon sx={{ fontSize: 60, color: "#55b8ff" }} />
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
              {selectedPosition?.deleted_at ? "restore" : "archive"}
            </strong>{" "}
            this position?
          </Typography>
          {selectedPosition && (
            <Typography
              variant="body2"
              color="text.secondary"
              textAlign="center"
              sx={{ mt: 1 }}>
              {selectedPosition.code} - {selectedPosition.title || ""}
            </Typography>
          )}
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
