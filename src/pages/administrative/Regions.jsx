import React, { useState, useMemo, useCallback } from "react";
import {
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  Tooltip,
  IconButton,
  Box,
  TextField,
  Fade,
  useMediaQuery,
  useTheme,
  Skeleton,
} from "@mui/material";
import { useSnackbar } from "notistack";
import VisibilityIcon from "@mui/icons-material/Visibility";
import SearchIcon from "@mui/icons-material/Search";
import SyncIcon from "@mui/icons-material/Sync";
import "../../pages/GeneralStyle.scss";

import { useGetRegionsQuery } from "../../features/api/masterlist/onerdfApi";
import {
  useGetShowRegionsQuery,
  usePostRegionsMutation,
} from "../../features/api/administrative/regionsApi";
import { CONSTANT } from "../../config";
import CustomTablePagination from "../../pages/zzzreusable/CustomTablePagination";
import NoDataFound from "../../pages/NoDataFound";
import { styles } from "../forms/manpowerform/formSubmissionStyles";

const CustomSearchBar = ({
  searchQuery,
  setSearchQuery,
  isLoading = false,
}) => {
  const isVerySmall = useMediaQuery("(max-width:369px)");
  const isMobile = useMediaQuery("(max-width:600px)");

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: isVerySmall ? 1 : 1.5,
      }}>
      <TextField
        placeholder={isVerySmall ? "Search..." : "Search regions..."}
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

const Regions = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.between(600, 1038));
  const isVerySmall = useMediaQuery("(max-width:369px)");

  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const { enqueueSnackbar } = useSnackbar();
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedProvinces, setSelectedProvinces] = useState([]);
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(searchQuery);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const { data: onerdfData, isFetching: onerdfFetching } = useGetRegionsQuery();

  const queryParams = useMemo(
    () => ({
      search: debouncedSearchQuery,
      page,
      per_page: rowsPerPage,
      status: "active",
    }),
    [debouncedSearchQuery, page, rowsPerPage]
  );

  const {
    data: backendData,
    refetch: refetchBackend,
    isFetching: backendFetching,
  } = useGetShowRegionsQuery(queryParams, {
    refetchOnMountOrArgChange: true,
  });

  const [postRegions, { isLoading: syncing }] = usePostRegionsMutation();

  const regions = useMemo(() => backendData?.result?.data || [], [backendData]);
  const totalCount = backendData?.result?.total || 0;

  const handleSearchChange = useCallback((newSearchQuery) => {
    setSearchQuery(newSearchQuery);
    setPage(1);
  }, []);

  const onSync = async () => {
    try {
      const response = await postRegions({ ...onerdfData });

      if (response.error) {
        enqueueSnackbar(`Sync failed: ${response.error.data?.message}`, {
          variant: "error",
        });
      } else {
        enqueueSnackbar("Successfully synced!", { variant: "success" });
        refetchBackend();
      }
    } catch (error) {
      enqueueSnackbar("An error occurred while syncing!", { variant: "error" });
    }
  };

  const handleOpenDialog = (provinces) => {
    setSelectedProvinces(provinces || []);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handlePageChange = useCallback((event, newPage) => {
    setPage(newPage + 1);
  }, []);

  const handleRowsPerPageChange = useCallback((event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(1);
  }, []);

  const isLoadingState = onerdfFetching || backendFetching || syncing;

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
                REGIONS
              </Typography>
              {isVerySmall ? (
                <IconButton
                  onClick={onSync}
                  disabled={isLoadingState}
                  sx={{
                    width: "36px",
                    height: "36px",
                    backgroundColor: "#4caf50",
                    color: "white",
                    borderRadius: "8px",
                    "&:hover": {
                      backgroundColor: "#45a049",
                    },
                    "&:disabled": {
                      backgroundColor: "#ccc",
                    },
                  }}>
                  <SyncIcon sx={{ fontSize: "18px" }} />
                </IconButton>
              ) : (
                <Button
                  variant="contained"
                  onClick={onSync}
                  startIcon={<SyncIcon />}
                  disabled={isLoadingState}
                  sx={{
                    ...styles.createButton,
                    backgroundColor: "#4caf50",
                    "&:hover": {
                      backgroundColor: "#45a049",
                    },
                  }}>
                  SYNC
                </Button>
              )}
            </Box>
          </Box>

          <CustomSearchBar
            searchQuery={searchQuery}
            setSearchQuery={handleSearchChange}
            isLoading={isLoadingState}
          />
        </Box>

        <Box sx={styles.tabsContainer}>
          <TableContainer
            sx={{
              ...styles.tableContainerStyles,
              backgroundColor: "white",
              "& .MuiTableBody-root .MuiTableRow-root:last-child .MuiTableCell-root":
                {
                  borderBottom: "none",
                },
            }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell
                    align="left"
                    sx={{ ...styles.columnStyles.id, borderBottom: "none" }}>
                    ID
                  </TableCell>
                  {!isVerySmall && (
                    <TableCell
                      sx={{
                        ...styles.columnStyles.formName,
                        borderBottom: "none",
                      }}>
                      PSGC CODE
                    </TableCell>
                  )}
                  <TableCell
                    sx={{
                      ...styles.columnStyles.formName,
                      borderBottom: "none",
                    }}>
                    REGION
                  </TableCell>
                  <TableCell
                    sx={{ ...styles.columnStyles.status, borderBottom: "none" }}
                    align="center">
                    PROVINCES
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
                        {!isVerySmall && (
                          <TableCell>
                            <Skeleton animation="wave" height={30} />
                          </TableCell>
                        )}
                        <TableCell>
                          <Skeleton animation="wave" height={30} />
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
                ) : regions.length > 0 ? (
                  regions.map((region) => (
                    <TableRow key={region.id} sx={styles.tableRowHover(theme)}>
                      <TableCell align="left">{region.id}</TableCell>
                      {!isVerySmall && (
                        <TableCell sx={styles.formNameCell}>
                          <Tooltip title={region.psgc_id} placement="top">
                            <span style={styles.cellContentStyles}>
                              {region.psgc_id}
                            </span>
                          </Tooltip>
                        </TableCell>
                      )}
                      <TableCell sx={styles.formNameCell}>
                        <Tooltip title={region.name} placement="top">
                          <span style={styles.cellContentStyles}>
                            {region.name}
                          </span>
                        </Tooltip>
                      </TableCell>
                      <TableCell align="center">
                        <Tooltip title="View Provinces">
                          <IconButton
                            size="small"
                            sx={styles.historyIconButton(theme)}
                            onClick={() =>
                              handleOpenDialog(region.provinces || [])
                            }>
                            <VisibilityIcon sx={{ fontSize: "20px" }} />
                          </IconButton>
                        </Tooltip>
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
                            ? `No regions found for "${searchQuery}"`
                            : "No regions available"
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
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3 },
        }}>
        <DialogTitle style={{ backgroundColor: "rgb(233, 246, 255)" }}>
          <Typography
            variant="h6"
            style={{
              fontWeight: "bold",
              fontFamily: "'Helvetica Neue', Arial, sans-serif",
            }}>
            Provinces
          </Typography>
        </DialogTitle>
        <DialogContent style={{ backgroundColor: "white" }}>
          <List>
            {selectedProvinces.length > 0 ? (
              selectedProvinces.map((province, index) => (
                <ListItem
                  key={province.id || index}
                  style={{
                    borderBottom: "1px solid #ccc",
                    fontFamily: "'Helvetica Neue', Arial, sans-serif",
                  }}>
                  <ListItemText
                    primary={province.name}
                    primaryTypographyProps={{
                      style: {
                        fontFamily: "'Helvetica Neue', Arial, sans-serif",
                      },
                    }}
                  />
                </ListItem>
              ))
            ) : (
              <ListItem>
                <ListItemText primary="No provinces found" />
              </ListItem>
            )}
          </List>
        </DialogContent>
        <DialogActions style={{ backgroundColor: "white" }}>
          <Button
            variant="contained"
            onClick={handleCloseDialog}
            color="primary"
            style={{
              fontFamily: "'Helvetica Neue', Arial, sans-serif",
            }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Regions;
