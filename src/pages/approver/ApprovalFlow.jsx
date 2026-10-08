import React, { useState, useMemo, useCallback } from "react";
import {
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
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
import MoreVertIcon from "@mui/icons-material/MoreVert";
import RestoreIcon from "@mui/icons-material/Restore";
import HelpIcon from "@mui/icons-material/Help";
import EditIcon from "@mui/icons-material/Edit";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { useSnackbar } from "notistack";
import "../../pages/GeneralStyle.scss";
import {
  useGetApprovalFlowsQuery,
  useDeleteApprovalFlowMutation,
} from "../../features/api/approvalsetting/approvalFlowApi";
import ApprovalFlowModal from "../../components/modal/approvalsettings/approvalFlowModal";
import ApproversDialog from "./approversDialog";
import NoDataFound from "../../pages/NoDataFound";
import { styles } from "../forms/manpowerform/formSubmissionStyles";

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
        placeholder={isVerySmall ? "Search..." : "Search approval flows..."}
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

// "NOT_SET" -> "NOT SET"
const formatStatusLabel = (status) =>
  status ? String(status).replace(/_/g, " ") : "-";

const ApprovalFlow = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.between(600, 1038));
  const isVerySmall = useMediaQuery("(max-width:369px)");
  const { enqueueSnackbar } = useSnackbar();

  const [searchQuery, setSearchQuery] = useState("");
  const [showArchived, setShowArchived] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState({});
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedFlow, setSelectedFlow] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  // Default mode is "view" (view / edit lang ang meron)
  const [modalMode, setModalMode] = useState("view");
  const [isLoading, setIsLoading] = useState(false);
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(searchQuery);

  // Approvers dialog state
  const [approversOpen, setApproversOpen] = useState(false);
  const [approversFlow, setApproversFlow] = useState(null);

  // Pagination state (MUI TablePagination is 0-based, API is 1-based)
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
      // Balik sa page 1 kapag nagbago ang search
      setPage(0);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const queryParams = useMemo(
    () => ({
      search: debouncedSearchQuery,
      status: showArchived ? "inactive" : "active",
      // Pagination is enabled (was "none")
      pagination: true,
      page: page + 1,
      per_page: rowsPerPage,
    }),
    [debouncedSearchQuery, showArchived, page, rowsPerPage],
  );

  const {
    data: backendData,
    isFetching: backendFetching,
    refetch,
    error,
  } = useGetApprovalFlowsQuery(queryParams, {
    refetchOnMountOrArgChange: true,
  });

  const [deleteApprovalFlow] = useDeleteApprovalFlowMutation();

  // Supports both a plain array and the paginated response
  // (result.data + result.total)
  const approvalFlowsList = useMemo(() => {
    const result = backendData?.result;
    if (Array.isArray(result)) return result;
    return result?.data || [];
  }, [backendData]);

  // Total number of records for the pagination footer
  const totalCount = useMemo(() => {
    const result = backendData?.result;
    return (
      result?.total ??
      backendData?.total ??
      backendData?.meta?.total ??
      approvalFlowsList.length
    );
  }, [backendData, approvalFlowsList]);

  // Kung nasa page na wala nang laman (hal. na-archive lahat ng nasa last page), umatras
  React.useEffect(() => {
    if (backendFetching) return;
    if (page > 0 && page * rowsPerPage >= totalCount) {
      setPage(Math.max(0, Math.ceil(totalCount / rowsPerPage) - 1));
    }
  }, [backendFetching, page, rowsPerPage, totalCount]);

  const handleSearchChange = useCallback((newSearchQuery) => {
    setSearchQuery(newSearchQuery);
  }, []);

  const handleChangeArchived = useCallback((newShowArchived) => {
    setShowArchived(newShowArchived);
    // Balik sa page 1 kapag nag-toggle ng archived
    setPage(0);
  }, []);

  // Pagination handlers
  const handleChangePage = useCallback((event, newPage) => {
    setPage(newPage);
  }, []);

  const handleChangeRowsPerPage = useCallback((event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  }, []);

  const handleMenuOpen = useCallback((event, flow) => {
    event.stopPropagation();
    setMenuAnchor((prev) => ({ ...prev, [flow.id]: event.currentTarget }));
  }, []);

  const handleMenuClose = useCallback((flowId) => {
    setMenuAnchor((prev) => ({ ...prev, [flowId]: null }));
  }, []);

  // Open approvers dialog (stopPropagation para hindi ma-trigger ang row click)
  const handleViewApprovers = useCallback((event, flow) => {
    event.stopPropagation();
    setApproversFlow(flow);
    setApproversOpen(true);
  }, []);

  const handleCloseApprovers = useCallback(() => {
    setApproversOpen(false);
    setApproversFlow(null);
  }, []);

  const handleArchiveRestoreClick = useCallback(
    (flow, event) => {
      if (event) {
        event.stopPropagation();
      }
      setSelectedFlow(flow);
      setConfirmOpen(true);
      handleMenuClose(flow.id);
    },
    [handleMenuClose],
  );

  const handleArchiveRestoreConfirm = async () => {
    if (!selectedFlow) return;

    // Walang deleted_at sa response, kaya gamitin din ang Archived toggle
    const isRestore = Boolean(selectedFlow.deleted_at) || showArchived;

    setIsLoading(true);
    try {
      await deleteApprovalFlow(selectedFlow.id).unwrap();
      enqueueSnackbar(
        isRestore
          ? "Flow restored successfully!"
          : "Flow archived successfully!",
        { variant: "success", autoHideDuration: 2000 },
      );
      refetch();
    } catch (error) {
      enqueueSnackbar("Action failed. Please try again.", {
        variant: "error",
        autoHideDuration: 2000,
      });
    } finally {
      setConfirmOpen(false);
      setSelectedFlow(null);
      setIsLoading(false);
    }
  };

  const handleEditClick = useCallback(
    (flow) => {
      setSelectedFlow(flow);
      setModalMode("edit");
      setModalOpen(true);
      handleMenuClose(flow.id);
    },
    [handleMenuClose],
  );

  const handleRowClick = useCallback((flow) => {
    setSelectedFlow(flow);
    setModalMode("view");
    setModalOpen(true);
  }, []);

  // Status chip follows the API `status` field (e.g. "NOT_SET")
  const renderStatusChip = useCallback((flow) => {
    const isSet = Boolean(flow.status) && flow.status !== "NOT_SET";

    return (
      <Chip
        label={formatStatusLabel(flow.status)}
        size="small"
        sx={{
          backgroundColor: isSet ? "#e8f5e8" : "#fff4e5",
          color: isSet ? "#2e7d32" : "#ed6c02",
          border: `1px solid ${isSet ? "#4caf50" : "#ff9800"}`,
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

  // Para sa Restore/Archive label sa menu at dialog
  const isRestoreAction = (flow) => Boolean(flow?.deleted_at) || showArchived;

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
                APPROVAL FLOWS
              </Typography>
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
              {/* Columns follow the API response
                  (id, code, title, charging, approvers, status) */}
              <TableHead>
                <TableRow>
                  <TableCell
                    align="left"
                    sx={{ ...styles.columnStyles.id, borderBottom: "none" }}>
                    ID
                  </TableCell>
                  {!isMobile && (
                    <TableCell
                      sx={{
                        ...styles.columnStyles.formName,
                        borderBottom: "none",
                      }}>
                      CODE
                    </TableCell>
                  )}
                  <TableCell
                    sx={{
                      ...styles.columnStyles.formName,
                      borderBottom: "none",
                    }}>
                    POSITION
                  </TableCell>
                  {!isMobile && !isTablet && (
                    <TableCell
                      sx={{
                        ...styles.columnStyles.formName,
                        borderBottom: "none",
                      }}>
                      CHARGING
                    </TableCell>
                  )}
                  {!isMobile && (
                    <TableCell
                      sx={{
                        ...styles.columnStyles.status,
                        borderBottom: "none",
                      }}
                      align="center">
                      APPROVERS
                    </TableCell>
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
                        {!isMobile && (
                          <TableCell>
                            <Skeleton animation="wave" height={30} />
                          </TableCell>
                        )}
                        <TableCell>
                          <Skeleton animation="wave" height={30} />
                        </TableCell>
                        {!isMobile && !isTablet && (
                          <TableCell>
                            <Skeleton animation="wave" height={30} />
                          </TableCell>
                        )}
                        {!isMobile && (
                          <>
                            {/* Approvers is an icon button */}
                            <TableCell align="center">
                              <Skeleton
                                animation="wave"
                                variant="circular"
                                width={32}
                                height={32}
                                sx={{ margin: "0 auto" }}
                              />
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
                ) : approvalFlowsList.length > 0 ? (
                  approvalFlowsList.map((flow) => (
                    <TableRow
                      key={flow.id}
                      onClick={() => handleRowClick(flow)}
                      sx={styles.tableRowHover(theme)}>
                      <TableCell align="left">{flow.id}</TableCell>
                      {!isMobile && (
                        <TableCell sx={styles.formNameCell}>
                          <Tooltip title={flow.code || "-"} placement="top">
                            <span style={styles.cellContentStyles}>
                              {flow.code || "-"}
                            </span>
                          </Tooltip>
                        </TableCell>
                      )}
                      <TableCell sx={styles.formNameCell}>
                        <Tooltip title={flow.title || "-"} placement="top">
                          <span style={styles.cellContentStyles}>
                            {flow.title || "-"}
                          </span>
                        </Tooltip>
                      </TableCell>
                      {!isMobile && !isTablet && (
                        <TableCell sx={styles.formNameCell}>
                          <Tooltip title={flow.charging || "-"} placement="top">
                            <span style={styles.cellContentStyles}>
                              {flow.charging || "-"}
                            </span>
                          </Tooltip>
                        </TableCell>
                      )}
                      {/* Eye icon, bubukas ang ApproversDialog */}
                      {!isMobile && (
                        <TableCell align="center">
                          <Tooltip title="View approvers" placement="top">
                            <IconButton
                              onClick={(e) => handleViewApprovers(e, flow)}
                              size="small"
                              sx={{ color: "rgb(33, 61, 112)" }}>
                              <VisibilityIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      )}
                      {!isMobile && (
                        <TableCell align="center">
                          {renderStatusChip(flow)}
                        </TableCell>
                      )}
                      <TableCell align="center">
                        <IconButton
                          onClick={(e) => handleMenuOpen(e, flow)}
                          size="small">
                          <MoreVertIcon />
                        </IconButton>
                        <Menu
                          anchorEl={menuAnchor[flow.id]}
                          open={Boolean(menuAnchor[flow.id])}
                          onClose={() => handleMenuClose(flow.id)}>
                          {!isRestoreAction(flow) && (
                            <MenuItem onClick={() => handleEditClick(flow)}>
                              <EditIcon fontSize="small" sx={{ mr: 1 }} />
                              Edit
                            </MenuItem>
                          )}
                          <MenuItem
                            onClick={(e) => handleArchiveRestoreClick(flow, e)}>
                            {isRestoreAction(flow) ? (
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
                            ? `No approval flows found for "${searchQuery}"`
                            : "No approval flows available"
                        }
                      />
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination footer */}
          {!error && (
            <TablePagination
              component="div"
              count={totalCount}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              rowsPerPageOptions={[5, 10, 25, 50]}
              labelRowsPerPage={isMobile ? "Rows:" : "Rows per page:"}
              sx={{ backgroundColor: "white" }}
            />
          )}
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
              {isRestoreAction(selectedFlow) ? "restore" : "archive"}
            </strong>{" "}
            this approval flow?
          </Typography>
          {selectedFlow && (
            <Typography
              variant="body2"
              color="text.secondary"
              textAlign="center"
              sx={{ mt: 1 }}>
              {/* `title` (+ code) imbes na `name` */}
              {selectedFlow.code
                ? `${selectedFlow.code} - ${selectedFlow.title}`
                : selectedFlow.title}
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

      {/* Approvers dialog (separate component) */}
      <ApproversDialog
        open={approversOpen}
        onClose={handleCloseApprovers}
        position={approversFlow}
      />

      <ApprovalFlowModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedFlow(null);
          setModalMode("view");
        }}
        onSave={() => {
          refetch();
          setModalOpen(false);
          setSelectedFlow(null);
          setModalMode("view");
        }}
        selectedEntry={selectedFlow}
        mode={modalMode}
      />
    </>
  );
};

export default ApprovalFlow;
