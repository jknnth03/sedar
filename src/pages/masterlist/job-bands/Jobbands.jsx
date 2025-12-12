import React, { useState, useMemo, useCallback } from "react";
import {
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Box,
  TextField,
  Checkbox,
  FormControlLabel,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useTheme,
  useMediaQuery,
  Chip,
  Skeleton,
  Tooltip,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ArchiveIcon from "@mui/icons-material/Archive";
import AddIcon from "@mui/icons-material/Add";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import RestoreIcon from "@mui/icons-material/Restore";
import HelpIcon from "@mui/icons-material/Help";
import EditIcon from "@mui/icons-material/Edit";
import { useSnackbar } from "notistack";
import "../../../pages/GeneralStyle.scss";
import {
  useDeleteJobbandMutation,
  useGetJobbandsQuery,
} from "../../../features/api/masterlist/jobbandsApi";
import JobbandsModal from "../../../components/modal/masterlist/JobbandsModal";
import CustomTablePagination from "../../../pages/zzzreusable/CustomTablePagination";
import NoDataFound from "../../../pages/NoDataFound";
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
        placeholder={isVerySmall ? "Search..." : "Search job bands..."}
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

const Jobbands = () => {
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
  const [selectedJobband, setSelectedJobband] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
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
    data: backendData,
    isFetching: backendFetching,
    refetch,
    error,
  } = useGetJobbandsQuery(queryParams, {
    refetchOnMountOrArgChange: true,
  });

  const [deleteJobband] = useDeleteJobbandMutation();

  const jobbands = useMemo(
    () => backendData?.result?.data || [],
    [backendData]
  );
  const totalCount = backendData?.result?.total || 0;

  const handleSearchChange = useCallback((newSearchQuery) => {
    setSearchQuery(newSearchQuery);
    setPage(1);
  }, []);

  const handleChangeArchived = useCallback((newShowArchived) => {
    setShowArchived(newShowArchived);
    setPage(1);
  }, []);

  const handleMenuOpen = useCallback((event, jobband) => {
    event.stopPropagation();
    setMenuAnchor((prev) => ({ ...prev, [jobband.id]: event.currentTarget }));
  }, []);

  const handleMenuClose = useCallback((jobbandId) => {
    setMenuAnchor((prev) => ({ ...prev, [jobbandId]: null }));
  }, []);

  const handleArchiveRestoreClick = useCallback(
    (jobband, event) => {
      if (event) {
        event.stopPropagation();
      }
      setSelectedJobband(jobband);
      setConfirmOpen(true);
      handleMenuClose(jobband.id);
    },
    [handleMenuClose]
  );

  const handleArchiveRestoreConfirm = async () => {
    if (!selectedJobband) return;

    setIsLoading(true);
    try {
      await deleteJobband(selectedJobband.id).unwrap();
      enqueueSnackbar(
        selectedJobband.deleted_at
          ? "Job band restored successfully!"
          : "Job band archived successfully!",
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
      setSelectedJobband(null);
      setIsLoading(false);
    }
  };

  const handleAddJobband = useCallback(() => {
    setSelectedJobband(null);
    setModalOpen(true);
  }, []);

  const handleEditClick = useCallback(
    (jobband) => {
      setSelectedJobband(jobband);
      setModalOpen(true);
      handleMenuClose(jobband.id);
    },
    [handleMenuClose]
  );

  const handlePageChange = useCallback((event, newPage) => {
    setPage(newPage + 1);
  }, []);

  const handleRowsPerPageChange = useCallback((event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(1);
  }, []);

  const renderStatusChip = useCallback((jobband) => {
    const isActive = !jobband.deleted_at;

    return (
      <Chip
        label={isActive ? "ACTIVE" : "INACTIVE"}
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

  const isLoadingState = backendFetching || isLoading;

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
                JOB BANDS
              </Typography>
              {isVerySmall ? (
                <IconButton
                  onClick={handleAddJobband}
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
                  onClick={handleAddJobband}
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
          <TableContainer
            sx={{
              ...styles.tableContainerStyles,
              backgroundColor: "white",
            }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell
                    align="left"
                    sx={{ ...styles.columnStyles.id, borderBottom: "none" }}>
                    ID
                  </TableCell>
                  <TableCell
                    sx={{
                      ...styles.columnStyles.formName,
                      borderBottom: "none",
                    }}>
                    JOB BAND
                  </TableCell>
                  <TableCell
                    sx={{
                      ...styles.columnStyles.formName,
                      borderBottom: "none",
                    }}>
                    CODE
                  </TableCell>
                  {!isMobile && (
                    <TableCell
                      sx={{
                        ...styles.columnStyles.status,
                        borderBottom: "none",
                      }}
                      align="center">
                      STATUS
                    </TableCell>
                  )}
                  <TableCell
                    sx={{
                      ...styles.columnStyles.status,
                      borderBottom: "none",
                    }}
                    align="center">
                    ACTIONS
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {isLoadingState ? (
                  <>
                    {[...Array(5)].map((_, index) => (
                      <TableRow key={index}>
                        <TableCell align="left">
                          <Skeleton animation="wave" height={30} />
                        </TableCell>
                        <TableCell>
                          <Skeleton animation="wave" height={30} />
                        </TableCell>
                        <TableCell>
                          <Skeleton animation="wave" height={30} />
                        </TableCell>
                        {!isMobile && (
                          <TableCell align="center">
                            <Skeleton
                              animation="wave"
                              variant="rounded"
                              width={80}
                              height={24}
                              sx={{ margin: "0 auto" }}
                            />
                          </TableCell>
                        )}
                        <TableCell align="center">
                          <Skeleton
                            animation="wave"
                            variant="circular"
                            width={32}
                            height={32}
                            sx={{ margin: "0 auto" }}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </>
                ) : error ? (
                  <TableRow
                    sx={{
                      borderBottom: "none",
                      "&:hover": {
                        backgroundColor: "transparent !important",
                        cursor: "default !important",
                      },
                    }}>
                    <TableCell
                      colSpan={999}
                      align="center"
                      sx={{
                        ...styles.noDataContainer,
                        borderBottom: "none",
                        "&:hover": {
                          backgroundColor: "transparent !important",
                        },
                      }}>
                      <NoDataFound
                        message="Error loading data"
                        subMessage={error.message || "Unknown error"}
                      />
                    </TableCell>
                  </TableRow>
                ) : jobbands.length > 0 ? (
                  jobbands.map((jobband) => (
                    <TableRow key={jobband.id} sx={styles.tableRowHover(theme)}>
                      <TableCell align="left">{jobband.id}</TableCell>
                      <TableCell sx={styles.formNameCell}>
                        <Tooltip title={jobband.name} placement="top">
                          <span style={styles.cellContentStyles}>
                            {jobband.name}
                          </span>
                        </Tooltip>
                      </TableCell>
                      <TableCell sx={styles.formNameCell}>
                        <Tooltip title={jobband.code} placement="top">
                          <span style={styles.cellContentStyles}>
                            {jobband.code}
                          </span>
                        </Tooltip>
                      </TableCell>
                      {!isMobile && (
                        <TableCell align="center">
                          {renderStatusChip(jobband)}
                        </TableCell>
                      )}
                      <TableCell align="center">
                        <IconButton
                          onClick={(e) => handleMenuOpen(e, jobband)}
                          size="small">
                          <MoreVertIcon />
                        </IconButton>
                        <Menu
                          anchorEl={menuAnchor[jobband.id]}
                          open={Boolean(menuAnchor[jobband.id])}
                          onClose={() => handleMenuClose(jobband.id)}>
                          {!jobband.deleted_at && (
                            <MenuItem onClick={() => handleEditClick(jobband)}>
                              <EditIcon fontSize="small" sx={{ mr: 1 }} />
                              Edit
                            </MenuItem>
                          )}
                          <MenuItem
                            onClick={(e) =>
                              handleArchiveRestoreClick(jobband, e)
                            }>
                            {jobband.deleted_at ? (
                              <>
                                <RestoreIcon fontSize="small" sx={{ mr: 1 }} />
                                Restore
                              </>
                            ) : (
                              <>
                                <ArchiveIcon fontSize="small" sx={{ mr: 1 }} />
                                Archive
                              </>
                            )}
                          </MenuItem>
                        </Menu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow
                    sx={{
                      borderBottom: "none",
                      "&:hover": {
                        backgroundColor: "transparent !important",
                        cursor: "default !important",
                      },
                    }}>
                    <TableCell
                      colSpan={999}
                      align="center"
                      sx={{
                        ...styles.noDataContainer,
                        borderBottom: "none",
                        "&:hover": {
                          backgroundColor: "transparent !important",
                        },
                      }}>
                      <NoDataFound
                        message=""
                        subMessage={
                          searchQuery
                            ? `No job bands found for "${searchQuery}"`
                            : "No job bands available"
                        }
                      />
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <CustomTablePagination
            count={totalCount}
            page={Math.max(0, page - 1)}
            rowsPerPage={rowsPerPage}
            onPageChange={handlePageChange}
            onRowsPerPageChange={handleRowsPerPageChange}
          />
        </Box>
      </Box>

      <Dialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3 },
        }}>
        <DialogTitle>
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            mb={1}>
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
              {selectedJobband?.deleted_at ? "restore" : "archive"}
            </strong>{" "}
            this job band?
          </Typography>
          {selectedJobband && (
            <Typography
              variant="body2"
              color="text.secondary"
              textAlign="center"
              sx={{ mt: 1 }}>
              {selectedJobband.name}
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

      <JobbandsModal
        open={modalOpen}
        handleClose={() => setModalOpen(false)}
        selectedJobband={selectedJobband}
        showArchived={showArchived}
        refetch={refetch}
      />
    </>
  );
};

export default Jobbands;
