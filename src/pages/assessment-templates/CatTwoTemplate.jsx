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
  useMediaQuery,
  Skeleton,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import ArchiveIcon from "@mui/icons-material/Archive";
import RestoreIcon from "@mui/icons-material/Restore";
import HelpIcon from "@mui/icons-material/Help";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import { useSnackbar } from "notistack";
import CatTwoTemplateModal from "../../components/modal/assessment-templates/CatTwoTemplateModal";
import {
  useGetCatTwoTemplatesQuery,
  useUpdateCatTwoTemplateMutation,
} from "../../features/api/assessment-template/catTwoTemplateApi";
import { useRememberQueryParams } from "../../hooks/useRememberQueryParams";
import CustomTablePagination from "../../pages/zzzreusable/CustomTablePagination";
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
  const isTablet = useMediaQuery("(min-width:600px) and (max-width:1038px)");
  const archivedIconColor = showArchived ? "#d32f2f" : "rgb(33, 61, 112)";

  return (
    <Box
      sx={{
        ...styles.searchBarContainer,
        ...(isMobile && styles.searchBarContainerMobile),
        ...(isTablet && styles.searchBarContainerTablet),
        ...(isVerySmall && styles.searchBarContainerVerySmall),
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
            color: archivedIconColor,
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
              icon={<ArchiveIcon sx={{ color: archivedIconColor }} />}
              checkedIcon={<ArchiveIcon sx={{ color: archivedIconColor }} />}
              size="small"
              sx={{
                color: archivedIconColor,
                "&.Mui-checked": {
                  color: archivedIconColor,
                },
              }}
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
              color: showArchived ? "#d32f2f" : "#666",
              letterSpacing: "0.5px",
            },
          }}
        />
      )}

      <TextField
        placeholder={isVerySmall ? "Search..." : "Search Templates..."}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        disabled={isLoading}
        size="small"
        InputProps={{
          startAdornment: (
            <SearchIcon sx={styles.searchIcon(isLoading, isVerySmall)} />
          ),
          endAdornment: isLoading && (
            <CircularProgress size={16} sx={styles.searchProgress} />
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

const CatTwoTemplate = () => {
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
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
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
      per_page: rowsPerPage,
      search: debouncedSearchQuery,
      status: showArchived === false ? "active" : "inactive",
    }),
    [page, rowsPerPage, debouncedSearchQuery, showArchived]
  );

  const {
    data: templatesResponse = {},
    isLoading: queryLoading,
    isFetching,
    refetch,
  } = useGetCatTwoTemplatesQuery(queryParams);

  const templates = templatesResponse?.result?.data || [];
  const totalCount = templatesResponse?.result?.total || 0;

  const [updateTemplate] = useUpdateCatTwoTemplateMutation();

  const handleSearchChange = useCallback(
    (newSearchQuery) => {
      setSearchQuery(newSearchQuery);
      setPage(1);
      if (newSearchQuery.trim()) {
        setQueryParams(
          {
            q: newSearchQuery,
          },
          { retain: true }
        );
      } else {
        setQueryParams({}, { retain: false });
      }
    },
    [setQueryParams]
  );

  const handleChangeArchived = useCallback((newShowArchived) => {
    setShowArchived(newShowArchived);
    setPage(1);
  }, []);

  const handleMenuOpen = (event, template) => {
    event.stopPropagation();
    setMenuAnchor(event.currentTarget);
    setSelectedTemplate(template);
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
      await updateTemplate({
        id: selectedTemplate.id,
        _method: "DELETE",
      }).unwrap();
      enqueueSnackbar(
        selectedTemplate.deleted_at
          ? "Template restored successfully!"
          : "Template archived successfully!",
        { variant: "success" }
      );
      refetch();
    } catch (error) {
      enqueueSnackbar("Action failed. Please try again.", {
        variant: "error",
      });
    } finally {
      setConfirmOpen(false);
      setSelectedTemplate(null);
      setIsLoading(false);
    }
  };

  const handleRowClick = (template) => {
    setSelectedTemplate(template);
    setModalOpen(true);
  };

  const handleAddClick = () => {
    setSelectedTemplate(null);
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setSelectedTemplate(null);
  };

  const handlePageChange = useCallback((event, newPage) => {
    setPage(newPage + 1);
  }, []);

  const handleRowsPerPageChange = useCallback((event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(1);
  }, []);

  const renderStatusChip = useCallback((template) => {
    const isActive = !template.deleted_at;
    const config = isActive
      ? { bgColor: "#e8f5e9", color: "#2e7d32" }
      : { bgColor: "#ffebee", color: "#c62828" };

    return (
      <Chip
        label={isActive ? "ACTIVE" : "INACTIVE"}
        size="small"
        sx={styles.statusChip(config)}
      />
    );
  }, []);

  const formatDate = useCallback((dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    });
  }, []);

  const isLoadingState = queryLoading || isFetching || isLoading;

  return (
    <>
      <Box
        sx={{
          ...styles.mainContainer,
          backgroundColor: "white",
        }}>
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
                CAT II TEMPLATES
              </Typography>
              {isVerySmall ? (
                <IconButton
                  onClick={handleAddClick}
                  disabled={isLoadingState}
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
                  onClick={handleAddClick}
                  startIcon={<AddIcon />}
                  disabled={isLoadingState}
                  sx={styles.createButton}>
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
              border: "none",
              "& .MuiTable-root": {
                borderCollapse: "separate",
              },
            }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell
                    align="left"
                    sx={{
                      ...styles.columnStyles.id,
                      paddingLeft: "24px !important",
                    }}>
                    ID
                  </TableCell>
                  <TableCell sx={styles.columnStyles.formName}>
                    TEMPLATE NAME
                  </TableCell>
                  <TableCell sx={styles.columnStyles.status} align="center">
                    UPDATED AT
                  </TableCell>
                  <TableCell sx={styles.columnStyles.status} align="center">
                    STATUS
                  </TableCell>
                  <TableCell align="center" sx={styles.columnStyles.actions}>
                    ACTION
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
                        <TableCell align="center">
                          <Skeleton animation="wave" height={30} />
                        </TableCell>
                        <TableCell align="center">
                          <Skeleton
                            animation="wave"
                            height={32}
                            width={80}
                            sx={{
                              borderRadius: "16px",
                              margin: "0 auto",
                            }}
                          />
                        </TableCell>
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
                ) : templates.length > 0 ? (
                  templates.map((template) => (
                    <TableRow
                      key={template.id}
                      onClick={() => handleRowClick(template)}
                      sx={{
                        ...styles.tableRowHover(theme),
                        cursor: "pointer",
                      }}>
                      <TableCell
                        align="left"
                        sx={{
                          paddingLeft: "24px !important",
                        }}>
                        {template.id}
                      </TableCell>
                      <TableCell sx={styles.formNameCell}>
                        <Tooltip title={template.name} placement="top">
                          <span style={styles.cellContentStyles}>
                            {template.name}
                          </span>
                        </Tooltip>
                      </TableCell>
                      <TableCell align="center">
                        {formatDate(template.updated_at)}
                      </TableCell>
                      <TableCell align="center">
                        {renderStatusChip(template)}
                      </TableCell>
                      <TableCell align="center">
                        <IconButton
                          onClick={(e) => handleMenuOpen(e, template)}
                          size="small"
                          sx={styles.actionIconButton(theme)}>
                          <MoreVertIcon sx={{ fontSize: "20px" }} />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow
                    className="no-hover-row"
                    sx={{
                      backgroundColor: "white !important",
                      cursor: "default !important",
                      border: "none !important",
                      "&:hover": {
                        backgroundColor: "white !important",
                        cursor: "default !important",
                      },
                      "& .MuiTableCell-root": {
                        backgroundColor: "white !important",
                        cursor: "default !important",
                        border: "none !important",
                        borderBottom: "none !important",
                        "&:hover": {
                          backgroundColor: "white !important",
                          cursor: "default !important",
                        },
                      },
                    }}>
                    <TableCell
                      colSpan={999}
                      rowSpan={999}
                      align="center"
                      sx={{
                        border: "none !important",
                        borderBottom: "none !important",
                        height: "400px",
                        verticalAlign: "middle",
                        backgroundColor: "white !important",
                        cursor: "default !important",
                        "&:hover": {
                          backgroundColor: "white !important",
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
            sx={{
              borderTop: "none",
              "& .MuiToolbar-root": {
                borderTop: "none",
              },
            }}
          />
        </Box>
      </Box>

      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
        sx={styles.actionMenu(theme)}>
        <MenuItem onClick={handleArchiveRestoreClick}>
          {selectedTemplate?.deleted_at ? (
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
          sx: styles.confirmDialog,
        }}>
        <DialogTitle>
          <Box sx={styles.confirmDialogIconBox}>
            <HelpIcon
              sx={{
                ...styles.confirmDialogIcon,
                fontSize: isMobile ? 50 : 60,
              }}
            />
          </Box>
          <Typography
            variant={isMobile ? "body1" : "h6"}
            sx={styles.confirmDialogTitle}>
            Confirmation
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={styles.confirmDialogMessage}>
            Are you sure you want to{" "}
            <strong>
              {selectedTemplate?.deleted_at ? "restore" : "archive"}
            </strong>{" "}
            this template?
          </Typography>
          {selectedTemplate && (
            <Typography variant="body2" sx={styles.confirmDialogSubmissionInfo}>
              {selectedTemplate.name}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Box sx={styles.confirmDialogActionsBox}>
            <Button
              onClick={() => setConfirmOpen(false)}
              variant="outlined"
              color="error"
              sx={styles.confirmCancelButton}>
              Cancel
            </Button>
            <Button
              onClick={handleArchiveRestoreConfirm}
              variant="contained"
              color="success"
              sx={styles.confirmCancelButton}>
              Confirm
            </Button>
          </Box>
        </DialogActions>
      </Dialog>

      {modalOpen && (
        <CatTwoTemplateModal
          open={modalOpen}
          handleClose={handleModalClose}
          selectedTemplate={selectedTemplate}
          refetch={refetch}
        />
      )}
    </>
  );
};

export default CatTwoTemplate;
