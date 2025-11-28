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
  Chip,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Tooltip,
  TextField,
  Checkbox,
  FormControlLabel,
  Fade,
  Tabs,
  Tab,
  Badge,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import EditIcon from "@mui/icons-material/Edit";
import ArchiveIcon from "@mui/icons-material/Archive";
import RestoreIcon from "@mui/icons-material/Restore";
import SearchIcon from "@mui/icons-material/Search";
import HelpIcon from "@mui/icons-material/Help";
import { useSnackbar } from "notistack";
import UserModal from "../../components/modal/usermanagement/UserModal";
import PendingUserAccount from "./PendingUserAccount";
import "../GeneralStyle.scss";
import { useDispatch } from "react-redux";
import { setUserModal } from "../../features/slice/modalSlice";
import useDebounce from "../../hooks/useDebounce";
import { useRememberQueryParams } from "../../hooks/useRememberQueryParams";
import {
  useDeleteUserMutation,
  useGetShowUserQuery,
  useUpdatePendingRequestMutation,
} from "../../features/api/usermanagement/userApi";
import { CONSTANT } from "../../config";
import "../../pages/GeneralStyle.scss";
import "../../pages/GeneralTable.scss";
import {
  StyledTabs,
  StyledTab,
  searchBarStyles,
  layoutStyles,
  tableStyles,
  chipStyles,
  buttonStyles,
  paginationStyles,
  dialogStyles,
} from "./usermanagementStyles";

const CustomSearchBar = ({
  searchQuery,
  setSearchQuery,
  showArchived,
  setShowArchived,
  isLoading = false,
}) => {
  const iconColor = showArchived ? "#d32f2f" : "rgb(33, 61, 112)";

  return (
    <Box sx={searchBarStyles.container}>
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
        sx={searchBarStyles.archiveCheckbox(showArchived)}
      />

      <TextField
        placeholder="Search Users..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        disabled={isLoading}
        size="small"
        InputProps={{
          startAdornment: (
            <SearchIcon sx={searchBarStyles.searchIcon(isLoading)} />
          ),
          endAdornment: isLoading && (
            <CircularProgress size={16} sx={searchBarStyles.circularProgress} />
          ),
          sx: searchBarStyles.textFieldInput(isLoading),
        }}
        sx={searchBarStyles.textFieldBase}
      />
    </Box>
  );
};

const User = () => {
  const { enqueueSnackbar } = useSnackbar();
  const dispatch = useDispatch();

  const [currentParams, setQueryParams] = useRememberQueryParams();

  const tabMap = {
    0: "active",
    1: "pending",
  };

  const reverseTabMap = {
    active: 0,
    pending: 1,
  };

  const [activeTab, setActiveTab] = useState(
    reverseTabMap[currentParams?.tab] ?? 0
  );
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState(currentParams?.q ?? "");
  const [showArchived, setShowArchived] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  const activeQueryParams = useMemo(
    () => ({
      pagination: 1,
      page: page + 1,
      per_page: rowsPerPage,
      searchQuery: debouncedSearchQuery,
      status: showArchived ? "inactive" : "active",
    }),
    [page, rowsPerPage, debouncedSearchQuery, showArchived]
  );

  const {
    data: activeUserData = { data: [], totalCount: 0 },
    isLoading: activeQueryLoading,
    isFetching: activeIsFetching,
    refetch: refetchActive,
  } = useGetShowUserQuery(activeQueryParams, {
    skip: activeTab !== 0,
  });

  const userData = activeUserData;
  const queryLoading = activeQueryLoading;
  const isFetching = activeIsFetching;
  const refetch = refetchActive;

  const userList = useMemo(() => {
    if (!userData) return [];
    if (Array.isArray(userData)) return userData;
    if (userData.data && Array.isArray(userData.data)) return userData.data;
    return [];
  }, [userData]);

  const totalCount = useMemo(() => {
    if (userData?.totalCount !== undefined) return userData.totalCount;
    if (userData?.total !== undefined) return userData.total;
    return userList?.length || 0;
  }, [userData, userList]);

  const [deleteUser] = useDeleteUserMutation();
  const [updatePendingRequest] = useUpdatePendingRequestMutation();

  const handleTabChange = useCallback(
    (event, newValue) => {
      setActiveTab(newValue);
      setPage(0);
      setQueryParams(
        {
          tab: tabMap[newValue],
          q: searchQuery,
        },
        { retain: true }
      );
    },
    [setQueryParams, searchQuery, tabMap]
  );

  const handleSearchChange = useCallback(
    (query) => {
      setSearchQuery(query);
      setPage(0);
      setQueryParams(
        {
          tab: tabMap[activeTab],
          q: query,
        },
        { retain: true }
      );
    },
    [setQueryParams, activeTab, tabMap]
  );

  const handleEditUser = useCallback(
    (user) => {
      dispatch(setUserModal(true));
      setSelectedUser(user);
      setModalOpen(true);
    },
    [dispatch]
  );

  const handleModalClose = useCallback(() => {
    setModalOpen(false);
  }, []);

  const handleArchiveRestoreClick = useCallback((user) => {
    setSelectedUser(user);
    setConfirmOpen(true);
  }, []);

  const handleArchiveRestoreConfirm = useCallback(async () => {
    if (!selectedUser) return;
    setIsLoading(true);
    try {
      await deleteUser(selectedUser.id).unwrap();
      enqueueSnackbar(
        selectedUser.deleted_at
          ? "User restored successfully!"
          : "User archived successfully!",
        { variant: "success", autoHideDuration: 2000 }
      );
      refetch();
    } catch (error) {
      console.error("Archive/Restore error:", error);
      enqueueSnackbar("Action failed. Please try again.", {
        variant: "error",
        autoHideDuration: 2000,
      });
    } finally {
      setConfirmOpen(false);
      setSelectedUser(null);
      setIsLoading(false);
    }
  }, [deleteUser, enqueueSnackbar, refetch, selectedUser]);

  const handlePageChange = useCallback((event, newPage) => {
    setPage(newPage);
  }, []);

  const handleRowsPerPageChange = useCallback((event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  }, []);

  const handleConfirmClose = useCallback(() => {
    setConfirmOpen(false);
  }, []);

  const handleMenuOpen = (event, user) => {
    setMenuAnchor(event.currentTarget);
    setSelectedUser(user);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
  };

  const handleEditClick = () => {
    handleEditUser(selectedUser);
    handleMenuClose();
  };

  const handleArchiveRestoreMenuClick = () => {
    setConfirmOpen(true);
    handleMenuClose();
  };

  const renderStatusChip = useCallback((user) => {
    const isActive = !user.deleted_at;

    return (
      <Chip
        label={isActive ? "ACTIVE" : "INACTIVE"}
        size="small"
        sx={isActive ? chipStyles.active : chipStyles.inactive}
      />
    );
  }, []);

  const isLoadingState = queryLoading || isFetching || isLoading;

  const a11yProps = (index) => {
    return {
      id: `user-tab-${index}`,
      "aria-controls": `user-tabpanel-${index}`,
    };
  };

  return (
    <>
      <Box sx={layoutStyles.mainContainer}>
        <Box sx={layoutStyles.headerContainer}>
          <Box sx={layoutStyles.headerLeft}>
            <Typography className="header">USERS</Typography>
          </Box>

          <CustomSearchBar
            searchQuery={searchQuery}
            setSearchQuery={handleSearchChange}
            showArchived={showArchived}
            setShowArchived={setShowArchived}
            isLoading={isLoadingState}
          />
        </Box>

        <StyledTabs
          value={activeTab}
          onChange={handleTabChange}
          aria-label="User tabs"
          variant="scrollable"
          scrollButtons="auto"
          allowScrollButtonsMobile>
          <StyledTab label="Active User Account" {...a11yProps(0)} />
          <StyledTab label="Pending User Account" {...a11yProps(1)} />
        </StyledTabs>

        {activeTab === 0 ? (
          <Box sx={layoutStyles.contentContainer}>
            <TableContainer sx={tableStyles.container}>
              <Table stickyHeader sx={tableStyles.table}>
                <TableHead>
                  <TableRow>
                    <TableCell align="left" sx={tableStyles.cellId}>
                      ID
                    </TableCell>
                    <TableCell sx={tableStyles.cellUsername}>
                      USERNAME
                    </TableCell>
                    <TableCell sx={tableStyles.cellFullName}>
                      FULL NAME
                    </TableCell>
                    <TableCell sx={tableStyles.cellRole}>ROLE</TableCell>
                    <TableCell sx={tableStyles.cellStatus} align="center">
                      STATUS
                    </TableCell>
                    <TableCell align="center" sx={tableStyles.cellAction}>
                      ACTION
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {isLoadingState ? (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        align="center"
                        sx={tableStyles.loadingCell}>
                        <CircularProgress
                          size={32}
                          sx={buttonStyles.circularProgress}
                        />
                      </TableCell>
                    </TableRow>
                  ) : userList.length > 0 ? (
                    userList.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell align="left" sx={tableStyles.cellId}>
                          {user.id}
                        </TableCell>
                        <TableCell sx={tableStyles.cellUsername}>
                          <Tooltip
                            title={user.username || "N/A"}
                            placement="top">
                            <span>{user.username || "N/A"}</span>
                          </Tooltip>
                        </TableCell>
                        <TableCell sx={tableStyles.cellFullName}>
                          {user.full_name || "N/A"}
                        </TableCell>
                        <TableCell sx={tableStyles.cellRole}>
                          <Tooltip
                            title={user.role?.role_name || "N/A"}
                            placement="top">
                            <span>{user.role?.role_name || "N/A"}</span>
                          </Tooltip>
                        </TableCell>
                        <TableCell sx={tableStyles.cellStatus}>
                          {renderStatusChip(user)}
                        </TableCell>
                        <TableCell align="center" sx={tableStyles.cellAction}>
                          <IconButton
                            onClick={(e) => handleMenuOpen(e, user)}
                            size="small"
                            sx={buttonStyles.iconButton}>
                            <MoreVertIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        align="center"
                        sx={tableStyles.emptyCell}>
                        <Box sx={tableStyles.emptyContainer}>
                          {CONSTANT.BUTTONS.NODATA.icon}
                          <Typography variant="h6" color="text.secondary">
                            No users found
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {searchQuery
                              ? `No results for "${searchQuery}"`
                              : showArchived
                              ? "No archived users"
                              : "No active users"}
                          </Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            <Box sx={paginationStyles.container}>
              <TablePagination
                rowsPerPageOptions={[5, 10, 25, 50, 100]}
                component="div"
                count={totalCount}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handlePageChange}
                onRowsPerPageChange={handleRowsPerPageChange}
                sx={paginationStyles.toolbar}
              />
            </Box>
          </Box>
        ) : (
          <PendingUserAccount
            page={page}
            rowsPerPage={rowsPerPage}
            searchQuery={debouncedSearchQuery}
            showArchived={showArchived}
            onPageChange={handlePageChange}
            onRowsPerPageChange={handleRowsPerPageChange}
          />
        )}
      </Box>

      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}>
        {!selectedUser?.deleted_at && (
          <MenuItem onClick={handleEditClick}>
            <EditIcon fontSize="small" sx={{ mr: 1 }} /> Edit
          </MenuItem>
        )}
        <MenuItem onClick={handleArchiveRestoreMenuClick}>
          {selectedUser?.deleted_at ? (
            <>
              <RestoreIcon sx={{ mr: 1 }} /> Restore
            </>
          ) : (
            <>
              <ArchiveIcon sx={{ mr: 1 }} /> Archive
            </>
          )}
        </MenuItem>
      </Menu>

      {activeTab === 0 && (
        <UserModal
          open={modalOpen}
          handleClose={handleModalClose}
          refetch={refetch}
          selectedUser={selectedUser}
        />
      )}

      <Dialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: dialogStyles.paper,
        }}>
        <DialogTitle>
          <Box sx={dialogStyles.iconContainer}>
            <HelpIcon sx={dialogStyles.helpIcon} />
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
            <strong>{selectedUser?.deleted_at ? "restore" : "archive"}</strong>{" "}
            this user?
          </Typography>
          {selectedUser && (
            <Typography
              variant="body2"
              color="text.secondary"
              textAlign="center"
              sx={{ mt: 1 }}>
              {selectedUser.username}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Box sx={dialogStyles.actionsContainer}>
            <Button
              onClick={() => setConfirmOpen(false)}
              variant="outlined"
              color="error"
              sx={dialogStyles.cancelButton}>
              Cancel
            </Button>
            <Button
              onClick={handleArchiveRestoreConfirm}
              variant="contained"
              color="success"
              sx={dialogStyles.confirmButton}>
              Confirm
            </Button>
          </Box>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default User;
