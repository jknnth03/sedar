import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
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
  Tooltip,
  TextField,
  Checkbox,
  FormControlLabel,
  useTheme,
  Fade,
  useMediaQuery,
  Skeleton,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import EditIcon from "@mui/icons-material/Edit";
import ArchiveIcon from "@mui/icons-material/Archive";
import RestoreIcon from "@mui/icons-material/Restore";
import HelpIcon from "@mui/icons-material/Help";
import AddIcon from "@mui/icons-material/Add";
import VisibilityIcon from "@mui/icons-material/Visibility";
import SearchIcon from "@mui/icons-material/Search";
import { useSnackbar } from "notistack";
import RolesModal from "../../components/modal/usermanagement/RolesModal";
import {
  useDeleteRoleMutation,
  useGetShowRolesQuery,
} from "../../features/api/usermanagement/rolesApi";
import { useRememberQueryParams } from "../../hooks/useRememberQueryParams";
import CustomTablePagination from "../../pages/zzzreusable/CustomTablePagination";
import NoDataFound from "../../pages/NoDataFound";
import "../../pages/GeneralStyle.scss";
import "../../pages/GeneralTable.scss";
import {
  chipStyles,
  buttonStyles,
  layoutStyles,
  dialogStyles,
  rolesStyles,
  searchBarRolesStyles,
} from "./usermanagementStyles";

const CustomSearchBar = ({
  searchQuery,
  setSearchQuery,
  showArchived,
  setShowArchived,
  isLoading = false,
}) => {
  const isVerySmall = useMediaQuery("(max-width:369px)");
  const archivedIconColor = showArchived ? "#d32f2f" : "rgb(33, 61, 112)";

  return (
    <Box
      sx={searchBarRolesStyles.container(isVerySmall)}
      className="search-bar-container">
      {isVerySmall ? (
        <IconButton
          onClick={() => setShowArchived(!showArchived)}
          disabled={isLoading}
          size="small"
          sx={searchBarRolesStyles.archivedIconButton(showArchived)}>
          <ArchiveIcon sx={{ fontSize: "18px" }} />
        </IconButton>
      ) : (
        <FormControlLabel
          control={
            <Checkbox
              checked={showArchived}
              onChange={(e) => setShowArchived(e.target.checked)}
              disabled={isLoading}
              icon={<ArchiveIcon sx={{ color: archivedIconColor }} />}
              checkedIcon={<ArchiveIcon sx={{ color: archivedIconColor }} />}
              size="small"
            />
          }
          label="ARCHIVED"
          className="archived-checkbox"
          sx={searchBarRolesStyles.archivedCheckbox(
            showArchived,
            archivedIconColor
          )}
        />
      )}

      <TextField
        placeholder={isVerySmall ? "Search..." : "Search Roles..."}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        disabled={isLoading}
        size="small"
        className="search-input"
        InputProps={{
          startAdornment: (
            <SearchIcon
              sx={searchBarRolesStyles.searchIconAdornment(
                isVerySmall,
                isLoading
              )}
            />
          ),
          endAdornment: isLoading && (
            <CircularProgress size={16} sx={{ marginLeft: 1 }} />
          ),
          sx: searchBarRolesStyles.searchInput(isVerySmall, isLoading),
        }}
        sx={searchBarRolesStyles.searchTextField(isVerySmall)}
      />
    </Box>
  );
};

const Roles = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.between(600, 1038));
  const isVerySmall = useMediaQuery("(max-width:369px)");

  const [currentParams, setQueryParams] = useRememberQueryParams();

  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState(currentParams?.q ?? "");
  const [showArchived, setShowArchived] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [selectedRole, setSelectedRole] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [isViewMode, setIsViewMode] = useState(false);
  const { enqueueSnackbar } = useSnackbar();
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(searchQuery);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const queryParams = useMemo(
    () => ({
      page: page,
      rowsPerPage,
      searchQuery: debouncedSearchQuery,
      status: showArchived === false ? "active" : "inactive",
    }),
    [page, rowsPerPage, debouncedSearchQuery, showArchived]
  );

  const {
    data: rolesResponse = {},
    isLoading: queryLoading,
    isFetching,
    refetch,
  } = useGetShowRolesQuery(queryParams);

  const roles = rolesResponse?.data || [];
  const totalCount = rolesResponse?.total || 0;

  const [deleteRole] = useDeleteRoleMutation();

  const handleSearchChange = useCallback(
    (newSearchQuery) => {
      setSearchQuery(newSearchQuery);
      setPage(1);
      setQueryParams(
        {
          q: newSearchQuery,
        },
        { retain: true }
      );
    },
    [setQueryParams]
  );

  const handleChangeArchived = useCallback((newShowArchived) => {
    setShowArchived(newShowArchived);
    setPage(1);
  }, []);

  const handleMenuOpen = (event, role) => {
    setMenuAnchor(event.currentTarget);
    setSelectedRole(role);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
  };

  const handleArchiveRestoreClick = () => {
    setConfirmOpen(true);
    handleMenuClose();
  };

  const handleArchiveRestoreConfirm = async () => {
    setIsLoading(true);
    try {
      await deleteRole(selectedRole.id).unwrap();
      enqueueSnackbar(
        selectedRole.deleted_at
          ? "Role restored successfully!"
          : "Role archived successfully!",
        { variant: "success" }
      );
      refetch();
    } catch (error) {
      enqueueSnackbar("Action failed. Please try again.", {
        variant: "error",
      });
    } finally {
      setConfirmOpen(false);
      setSelectedRole(null);
      setIsLoading(false);
    }
  };

  const handleEditClick = () => {
    setIsViewMode(false);
    setModalOpen(true);
    handleMenuClose();
  };

  const handleViewPermissionsClick = (role) => {
    setSelectedRole(role);
    setIsViewMode(true);
    setModalOpen(true);
  };

  const handleAddClick = () => {
    setSelectedRole(null);
    setIsViewMode(false);
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setSelectedRole(null);
    setIsViewMode(false);
  };

  const handlePageChange = useCallback((event, newPage) => {
    setPage(newPage + 1);
  }, []);

  const handleRowsPerPageChange = useCallback((event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(1);
  }, []);

  const renderStatusChip = useCallback((role) => {
    const isActive = !role.deleted_at;
    return (
      <Chip
        label={isActive ? "ACTIVE" : "INACTIVE"}
        size="small"
        sx={isActive ? chipStyles.active : chipStyles.inactive}
      />
    );
  }, []);

  const isLoadingState = queryLoading || isFetching || isLoading;

  return (
    <>
      <Box sx={layoutStyles.mainContainer}>
        <Box sx={rolesStyles.headerContainer(isMobile, isTablet)}>
          <Box sx={rolesStyles.headerLeft(isMobile, isTablet, isVerySmall)}>
            <Typography className="header">
              {isVerySmall ? "ROLES" : "ROLES"}
            </Typography>
            <Fade in={!isLoadingState}>
              {isVerySmall ? (
                <IconButton
                  onClick={handleAddClick}
                  disabled={isLoadingState}
                  sx={rolesStyles.addIconButton}>
                  <AddIcon sx={{ fontSize: "18px" }} />
                </IconButton>
              ) : (
                <Button
                  variant="contained"
                  onClick={handleAddClick}
                  startIcon={<AddIcon />}
                  disabled={isLoadingState}
                  className="create-button"
                  sx={rolesStyles.createButton(isMobile)}>
                  CREATE
                </Button>
              )}
            </Fade>
          </Box>

          <CustomSearchBar
            searchQuery={searchQuery}
            setSearchQuery={handleSearchChange}
            showArchived={showArchived}
            setShowArchived={handleChangeArchived}
            isLoading={isLoadingState}
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
          <TableContainer sx={rolesStyles.tableContainer(isMobile)}>
            <Table
              stickyHeader
              sx={{
                minWidth: 1200,
                height: roles.length === 0 ? "100%" : "auto",
              }}>
              <TableHead>
                <TableRow>
                  <TableCell align="left" sx={rolesStyles.cellIdRole(isMobile)}>
                    ID
                  </TableCell>
                  <TableCell sx={rolesStyles.cellRoleName(isMobile)}>
                    ROLE
                  </TableCell>
                  <TableCell
                    sx={rolesStyles.cellPermission(isMobile, isVerySmall)}
                    align="center">
                    PERMISSION
                  </TableCell>
                  <TableCell
                    sx={rolesStyles.cellStatusRole(isMobile)}
                    align="center">
                    STATUS
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={rolesStyles.cellActionRole(isMobile)}>
                    ACTION
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody
                sx={{
                  height: roles.length === 0 ? "100%" : "auto",
                }}>
                {isLoadingState ? (
                  <>
                    {[...Array(5)].map((_, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <Skeleton animation="wave" height={30} />
                        </TableCell>
                        <TableCell>
                          <Skeleton animation="wave" height={30} />
                        </TableCell>
                        <TableCell>
                          <Skeleton
                            animation="wave"
                            height={30}
                            width={30}
                            variant="circular"
                          />
                        </TableCell>
                        <TableCell>
                          <Skeleton
                            animation="wave"
                            height={24}
                            width={120}
                            sx={{ borderRadius: "12px" }}
                          />
                        </TableCell>
                        <TableCell>
                          <Skeleton
                            animation="wave"
                            height={30}
                            width={30}
                            variant="circular"
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </>
                ) : roles.length > 0 ? (
                  roles.map((role) => (
                    <TableRow key={role.id}>
                      <TableCell
                        align="left"
                        sx={rolesStyles.cellIdRole(isMobile)}>
                        {role.id}
                      </TableCell>
                      <TableCell sx={rolesStyles.cellRoleName(isMobile)}>
                        <Tooltip title={role.role_name} placement="top">
                          <span>{role.role_name}</span>
                        </Tooltip>
                      </TableCell>
                      <TableCell
                        sx={rolesStyles.cellPermission(isMobile, isVerySmall)}>
                        <Tooltip title="View Permissions">
                          <IconButton
                            size="small"
                            sx={rolesStyles.viewPermissionButton}
                            onClick={() => handleViewPermissionsClick(role)}>
                            <VisibilityIcon
                              sx={rolesStyles.viewPermissionIcon(isMobile)}
                            />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                      <TableCell sx={rolesStyles.cellStatusRole(isMobile)}>
                        {renderStatusChip(role)}
                      </TableCell>
                      <TableCell
                        align="center"
                        sx={rolesStyles.cellActionRole(isMobile)}>
                        <IconButton
                          onClick={(e) => handleMenuOpen(e, role)}
                          size="small"
                          sx={buttonStyles.iconButton}>
                          <MoreVertIcon
                            sx={rolesStyles.moreVertIcon(isMobile)}
                          />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow
                    sx={{
                      "&:hover": {
                        backgroundColor: "transparent !important",
                        cursor: "default !important",
                      },
                    }}>
                    <TableCell
                      colSpan={999}
                      rowSpan={999}
                      align="center"
                      sx={{
                        borderBottom: "none",
                        height: "400px",
                        verticalAlign: "middle",
                        "&:hover": {
                          backgroundColor: "transparent !important",
                          cursor: "default !important",
                        },
                      }}>
                      <NoDataFound message="" subMessage="" />
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

      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}>
        {!selectedRole?.deleted_at && (
          <MenuItem onClick={handleEditClick}>
            <EditIcon fontSize="small" sx={{ mr: 1 }} /> Edit
          </MenuItem>
        )}
        <MenuItem onClick={handleArchiveRestoreClick}>
          {selectedRole?.deleted_at ? (
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
            <HelpIcon sx={dialogStyles.helpIcon(isMobile)} />
          </Box>
          <Typography
            variant={isMobile ? "body1" : "h6"}
            fontWeight="bold"
            textAlign="center"
            color="rgb(33, 61, 112)">
            Confirmation
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Typography
            variant="body1"
            gutterBottom
            textAlign="center"
            sx={dialogStyles.content(isMobile)}>
            Are you sure you want to{" "}
            <strong>{selectedRole?.deleted_at ? "restore" : "archive"}</strong>{" "}
            this role?
          </Typography>
          {selectedRole && (
            <Typography
              variant="body2"
              color="text.secondary"
              textAlign="center"
              sx={dialogStyles.contentSecondary(isMobile)}>
              {selectedRole.role_name}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Box sx={dialogStyles.actionsContainer}>
            <Button
              onClick={() => setConfirmOpen(false)}
              variant="outlined"
              color="error"
              sx={dialogStyles.cancelButton(isMobile)}>
              Cancel
            </Button>
            <Button
              onClick={handleArchiveRestoreConfirm}
              variant="contained"
              color="success"
              sx={dialogStyles.confirmButton(isMobile)}>
              Confirm
            </Button>
          </Box>
        </DialogActions>
      </Dialog>

      {modalOpen && (
        <RolesModal
          open={modalOpen}
          handleClose={handleModalClose}
          selectedRole={selectedRole}
          refetch={refetch}
          isViewMode={isViewMode}
        />
      )}
    </>
  );
};

export default Roles;
