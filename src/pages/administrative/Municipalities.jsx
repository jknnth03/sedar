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

import { useGetCitiesQuery } from "../../features/api/masterlist/onerdfApi";
import {
  useGetShowMunicipalitiesQuery,
  usePostMunicipalitiesMutation,
} from "../../features/api/administrative/municipalitiesApi";
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
        placeholder={isVerySmall ? "Search..." : "Search municipalities..."}
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

const Municipalities = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.between(600, 1038));
  const isVerySmall = useMediaQuery("(max-width:369px)");

  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const { enqueueSnackbar } = useSnackbar();
  const [openDialog, setOpenDialog] = useState(false);
  const [openDialog1, setOpenDialog1] = useState(false);
  const [selectedMunicipalityDetails, setSelectedMunicipalityDetails] =
    useState({});
  const [selectedSubMunicipalityDetails, setSelectedSubMunicipalityDetails] =
    useState({});
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(searchQuery);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const { data: onerdfData, isFetching: onerdfFetching } = useGetCitiesQuery();

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
    data: municipalitiesData,
    refetch: refetchMunicipalities,
    isFetching: fetchingMunicipalities,
  } = useGetShowMunicipalitiesQuery(queryParams, {
    refetchOnMountOrArgChange: true,
  });

  const [postMunicipalities, { isLoading: syncing }] =
    usePostMunicipalitiesMutation();

  const municipalities = useMemo(
    () => municipalitiesData?.result?.data || [],
    [municipalitiesData]
  );
  const totalCount = municipalitiesData?.result?.total || 0;

  const handleSearchChange = useCallback((newSearchQuery) => {
    setSearchQuery(newSearchQuery);
    setPage(1);
  }, []);

  const onSync = async () => {
    try {
      const response = await postMunicipalities({ ...onerdfData });

      if (response.error) {
        enqueueSnackbar(`Sync failed: ${response.error.data?.message}`, {
          variant: "error",
        });
      } else {
        enqueueSnackbar("Successfully synced!", { variant: "success" });
        refetchMunicipalities();
      }
    } catch (error) {
      enqueueSnackbar("An error occurred while syncing!", { variant: "error" });
    }
  };

  const handleOpenDialog = (municipalityDetails) => {
    setSelectedMunicipalityDetails(municipalityDetails);
    setOpenDialog(true);
  };

  const handleOpenDialog1 = (municipalityDetails) => {
    setSelectedSubMunicipalityDetails(municipalityDetails);
    setOpenDialog1(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleCloseDialog1 = () => {
    setOpenDialog1(false);
  };

  const handlePageChange = useCallback((event, newPage) => {
    setPage(newPage + 1);
  }, []);

  const handleRowsPerPageChange = useCallback((event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(1);
  }, []);

  const isLoadingState = onerdfFetching || fetchingMunicipalities || syncing;

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
                MUNICIPALITIES
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
                    MUNICIPALITIES
                  </TableCell>
                  {!isVerySmall && (
                    <TableCell
                      sx={{
                        ...styles.columnStyles.status,
                        borderBottom: "none",
                      }}
                      align="center">
                      SUB-MUN
                    </TableCell>
                  )}
                  <TableCell
                    sx={{ ...styles.columnStyles.status, borderBottom: "none" }}
                    align="center">
                    BARANGAY
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
                        {!isVerySmall && (
                          <TableCell align="center">
                            <Skeleton
                              animation="wave"
                              variant="circular"
                              width={32}
                              height={32}
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
                ) : municipalities.length > 0 ? (
                  municipalities.map((municipality) => (
                    <TableRow
                      key={municipality.id}
                      sx={styles.tableRowHover(theme)}>
                      <TableCell align="left">{municipality.id}</TableCell>
                      {!isVerySmall && (
                        <TableCell sx={styles.formNameCell}>
                          <Tooltip title={municipality.psgc_id} placement="top">
                            <span style={styles.cellContentStyles}>
                              {municipality.psgc_id}
                            </span>
                          </Tooltip>
                        </TableCell>
                      )}
                      <TableCell sx={styles.formNameCell}>
                        <Tooltip title={municipality.name} placement="top">
                          <span style={styles.cellContentStyles}>
                            {municipality.name}
                          </span>
                        </Tooltip>
                      </TableCell>
                      {!isVerySmall && (
                        <TableCell align="center">
                          <Tooltip title="View Sub-municipalities">
                            <IconButton
                              size="small"
                              sx={styles.historyIconButton(theme)}
                              onClick={() => handleOpenDialog1(municipality)}>
                              <VisibilityIcon sx={{ fontSize: "20px" }} />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      )}
                      <TableCell align="center">
                        <Tooltip title="View Barangays">
                          <IconButton
                            size="small"
                            sx={styles.historyIconButton(theme)}
                            onClick={() => handleOpenDialog(municipality)}>
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
                            ? `No municipalities found for "${searchQuery}"`
                            : "No municipalities available"
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
        open={openDialog1}
        onClose={handleCloseDialog1}
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
            Sub-Municipalities
          </Typography>
        </DialogTitle>
        <DialogContent style={{ backgroundColor: "white" }}>
          <List>
            {selectedSubMunicipalityDetails?.sub_municipalities?.length > 0 ? (
              selectedSubMunicipalityDetails.sub_municipalities.map(
                (subMunicipality, index) => (
                  <ListItem
                    key={subMunicipality.id || index}
                    style={{
                      borderBottom: "1px solid #ccc",
                      fontFamily: "'Helvetica Neue', Arial, sans-serif",
                    }}>
                    <ListItemText
                      primary={subMunicipality.name}
                      primaryTypographyProps={{
                        style: {
                          fontFamily: "'Helvetica Neue', Arial, sans-serif",
                        },
                      }}
                    />
                  </ListItem>
                )
              )
            ) : (
              <ListItem>
                <ListItemText primary="No sub-municipalities found" />
              </ListItem>
            )}
          </List>
        </DialogContent>
        <DialogActions style={{ backgroundColor: "white" }}>
          <Button
            variant="contained"
            onClick={handleCloseDialog1}
            color="primary"
            style={{
              fontFamily: "'Helvetica Neue', Arial, sans-serif",
            }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

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
            Barangays
          </Typography>
        </DialogTitle>
        <DialogContent style={{ backgroundColor: "white" }}>
          <List>
            {selectedMunicipalityDetails?.barangays?.length > 0 ? (
              selectedMunicipalityDetails.barangays.map((barangay, index) => (
                <ListItem
                  key={barangay.id || index}
                  style={{
                    borderBottom: "1px solid #ccc",
                    fontFamily: "'Helvetica Neue', Arial, sans-serif",
                  }}>
                  <ListItemText
                    primary={barangay.name}
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
                <ListItemText primary="No barangays found" />
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

export default Municipalities;
