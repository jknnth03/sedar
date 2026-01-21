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
  IconButton,
  Box,
  TextField,
  Fade,
  useMediaQuery,
  useTheme,
  Skeleton,
} from "@mui/material";
import { useSnackbar } from "notistack";
import SearchIcon from "@mui/icons-material/Search";
import SyncIcon from "@mui/icons-material/Sync";
import "../../pages/GeneralStyle.scss";

import { useGetBarangaysQuery } from "../../features/api/masterlist/onerdfApi";
import {
  useGetShowBarangaysQuery,
  usePostBarangaysMutation,
} from "../../features/api/administrative/barangaysApi";
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
        placeholder={isVerySmall ? "Search..." : "Search barangays..."}
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

const Barangays = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.between(600, 1038));
  const isVerySmall = useMediaQuery("(max-width:369px)");

  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const { enqueueSnackbar } = useSnackbar();
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(searchQuery);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const { data: onerdfData, isFetching: onerdfFetching } =
    useGetBarangaysQuery();

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
  } = useGetShowBarangaysQuery(queryParams, {
    refetchOnMountOrArgChange: true,
  });

  const [postBarangays, { isLoading: syncing }] = usePostBarangaysMutation();

  const barangays = useMemo(
    () => backendData?.result?.data || [],
    [backendData]
  );
  const totalCount = backendData?.result?.total || 0;

  const handleSearchChange = useCallback((newSearchQuery) => {
    setSearchQuery(newSearchQuery);
    setPage(1);
  }, []);

  const onSync = async () => {
    try {
      const response = await postBarangays({ ...onerdfData });

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
                BARANGAYS
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
                    BARANGAY
                  </TableCell>
                  {!isMobile && (
                    <TableCell
                      sx={{
                        ...styles.columnStyles.formName,
                        borderBottom: "none",
                      }}>
                      MUNICIPALITY
                    </TableCell>
                  )}
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
                        {!isMobile && (
                          <TableCell>
                            <Skeleton animation="wave" height={30} />
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </>
                ) : barangays.length > 0 ? (
                  barangays.map((barangay) => (
                    <TableRow
                      key={barangay.id}
                      sx={styles.tableRowHover(theme)}>
                      <TableCell align="left">{barangay.id}</TableCell>
                      {!isVerySmall && (
                        <TableCell sx={styles.formNameCell}>
                          <span style={styles.cellContentStyles}>
                            {barangay.psgc_id}
                          </span>
                        </TableCell>
                      )}
                      <TableCell sx={styles.formNameCell}>
                        <span style={styles.cellContentStyles}>
                          {barangay.name}
                        </span>
                      </TableCell>
                      {!isMobile && (
                        <TableCell sx={styles.formNameCell}>
                          <span style={styles.cellContentStyles}>
                            {barangay.city_municipality?.name || "N/A"}
                          </span>
                        </TableCell>
                      )}
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
                            ? `No barangays found for "${searchQuery}"`
                            : "No barangays available"
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
    </>
  );
};

export default Barangays;
