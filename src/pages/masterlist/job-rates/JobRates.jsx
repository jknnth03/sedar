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
  useDeleteJobrateMutation,
  useGetJobratesQuery,
} from "../../../features/api/masterlist/jobratesApi";
import JobRatesModal from "../../../components/modal/masterlist/JobRatesModal";
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
        placeholder={isVerySmall ? "Search..." : "Search job rates..."}
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

const JobRates = () => {
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
  const [selectedJobRate, setSelectedJobRate] = useState(null);
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
  } = useGetJobratesQuery(queryParams, {
    refetchOnMountOrArgChange: true,
  });

  const [deleteJobRate] = useDeleteJobrateMutation();

  const jobrates = useMemo(
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

  const handleMenuOpen = useCallback((event, jobrate) => {
    event.stopPropagation();
    setMenuAnchor((prev) => ({ ...prev, [jobrate.id]: event.currentTarget }));
  }, []);

  const handleMenuClose = useCallback((jobrateId) => {
    setMenuAnchor((prev) => ({ ...prev, [jobrateId]: null }));
  }, []);

  const handleArchiveRestoreClick = useCallback(
    (jobrate, event) => {
      if (event) {
        event.stopPropagation();
      }
      setSelectedJobRate(jobrate);
      setConfirmOpen(true);
      handleMenuClose(jobrate.id);
    },
    [handleMenuClose]
  );

  const handleArchiveRestoreConfirm = async () => {
    if (!selectedJobRate) return;

    setIsLoading(true);
    try {
      await deleteJobRate(selectedJobRate.id).unwrap();
      enqueueSnackbar(
        selectedJobRate.deleted_at
          ? "Job rate restored successfully!"
          : "Job rate archived successfully!",
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
      setSelectedJobRate(null);
      setIsLoading(false);
    }
  };

  const handleAddJobRate = useCallback(() => {
    setSelectedJobRate(null);
    setModalOpen(true);
  }, []);

  const handleEditClick = useCallback(
    (jobrate) => {
      setSelectedJobRate(jobrate);
      setModalOpen(true);
      handleMenuClose(jobrate.id);
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

  const renderStatusChip = useCallback((jobrate) => {
    const isActive = !jobrate.deleted_at;

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

  const formatCurrency = (value) => {
    if (value === null || value === undefined) return "-";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "PHP",
      minimumFractionDigits: 2,
    }).format(value);
  };

  const getPositionTitle = (jobrate) => jobrate?.position?.title?.name || "-";
  const getJobLevelName = (jobrate) => jobrate?.job_level?.label || "-";

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
                JOB RATES
              </Typography>
              {isVerySmall ? (
                <IconButton
                  onClick={handleAddJobRate}
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
                  onClick={handleAddJobRate}
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
                    POSITION
                  </TableCell>
                  <TableCell
                    sx={{
                      ...styles.columnStyles.formName,
                      borderBottom: "none",
                    }}>
                    LEVEL
                  </TableCell>
                  {!isMobile && (
                    <>
                      <TableCell
                        sx={{
                          ...styles.columnStyles.formName,
                          borderBottom: "none",
                        }}>
                        JOB RATE
                      </TableCell>
                      <TableCell
                        sx={{
                          ...styles.columnStyles.formName,
                          borderBottom: "none",
                        }}>
                        ALLOWANCE
                      </TableCell>
                      <TableCell
                        sx={{
                          ...styles.columnStyles.formName,
                          borderBottom: "none",
                        }}>
                        TOTAL SALARY
                      </TableCell>
                    </>
                  )}
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
                          <>
                            <TableCell>
                              <Skeleton animation="wave" height={30} />
                            </TableCell>
                            <TableCell>
                              <Skeleton animation="wave" height={30} />
                            </TableCell>
                            <TableCell>
                              <Skeleton animation="wave" height={30} />
                            </TableCell>
                            <TableCell align="center">
                              <Skeleton
                                animation="wave"
                                variant="rounded"
                                width={80}
                                height={24}
                                sx={{ margin: "0 auto" }}
                              />
                            </TableCell>
                          </>
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
                ) : jobrates.length > 0 ? (
                  jobrates.map((jobrate) => (
                    <TableRow key={jobrate.id} sx={styles.tableRowHover(theme)}>
                      <TableCell align="left">{jobrate.id}</TableCell>
                      <TableCell sx={styles.formNameCell}>
                        <Tooltip
                          title={getPositionTitle(jobrate)}
                          placement="top">
                          <span style={styles.cellContentStyles}>
                            {getPositionTitle(jobrate)}
                          </span>
                        </Tooltip>
                      </TableCell>
                      <TableCell sx={styles.formNameCell}>
                        <Tooltip
                          title={getJobLevelName(jobrate)}
                          placement="top">
                          <span style={styles.cellContentStyles}>
                            {getJobLevelName(jobrate)}
                          </span>
                        </Tooltip>
                      </TableCell>
                      {!isMobile && (
                        <>
                          <TableCell sx={styles.formNameCell}>
                            <Tooltip
                              title={formatCurrency(jobrate.job_rate)}
                              placement="top">
                              <span style={styles.cellContentStyles}>
                                {formatCurrency(jobrate.job_rate)}
                              </span>
                            </Tooltip>
                          </TableCell>
                          <TableCell sx={styles.formNameCell}>
                            <Tooltip
                              title={formatCurrency(jobrate.allowance)}
                              placement="top">
                              <span style={styles.cellContentStyles}>
                                {formatCurrency(jobrate.allowance)}
                              </span>
                            </Tooltip>
                          </TableCell>
                          <TableCell sx={styles.formNameCell}>
                            <Tooltip
                              title={formatCurrency(jobrate.total_salary)}
                              placement="top">
                              <span style={styles.cellContentStyles}>
                                {formatCurrency(jobrate.total_salary)}
                              </span>
                            </Tooltip>
                          </TableCell>
                          <TableCell align="center">
                            {renderStatusChip(jobrate)}
                          </TableCell>
                        </>
                      )}
                      <TableCell align="center">
                        <IconButton
                          onClick={(e) => handleMenuOpen(e, jobrate)}
                          size="small">
                          <MoreVertIcon />
                        </IconButton>
                        <Menu
                          anchorEl={menuAnchor[jobrate.id]}
                          open={Boolean(menuAnchor[jobrate.id])}
                          onClose={() => handleMenuClose(jobrate.id)}>
                          {!jobrate.deleted_at && (
                            <MenuItem onClick={() => handleEditClick(jobrate)}>
                              <EditIcon fontSize="small" sx={{ mr: 1 }} />
                              Edit
                            </MenuItem>
                          )}
                          <MenuItem
                            onClick={(e) =>
                              handleArchiveRestoreClick(jobrate, e)
                            }>
                            {jobrate.deleted_at ? (
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
                            ? `No job rates found for "${searchQuery}"`
                            : "No job rates available"
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
              {selectedJobRate?.deleted_at ? "restore" : "archive"}
            </strong>{" "}
            this job rate?
          </Typography>
          {selectedJobRate && (
            <Typography
              variant="body2"
              color="text.secondary"
              textAlign="center"
              sx={{ mt: 1 }}>
              {getPositionTitle(selectedJobRate)} -{" "}
              {getJobLevelName(selectedJobRate)}
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

      <JobRatesModal
        open={modalOpen}
        handleClose={() => setModalOpen(false)}
        selectedJobRate={selectedJobRate}
        showArchived={showArchived}
        refetch={refetch}
      />
    </>
  );
};

export default JobRates;
