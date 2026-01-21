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
  Box,
  TextField,
  Checkbox,
  FormControlLabel,
  Fade,
  Tooltip,
  useMediaQuery,
  useTheme,
  Skeleton,
} from "@mui/material";
import { useSnackbar } from "notistack";
import SearchIcon from "@mui/icons-material/Search";
import ArchiveIcon from "@mui/icons-material/Archive";
import SyncIcon from "@mui/icons-material/Sync";
import "../../pages/GeneralStyle.scss";

import {
  useGetShowSubMunicipalitiesQuery,
  usePostSubMunicipalitiesMutation,
} from "../../features/api/administrative/subMunicipalitiesApi";
import { useGetSubmunicipalitiesQuery } from "../../features/api/masterlist/onerdfApi";
import { CONSTANT } from "../../config";
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
  const iconColor = showArchived ? "#d32f2f" : "rgb(33, 61, 112)";
  const labelColor = showArchived ? "#d32f2f" : "rgb(33, 61, 112)";

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: isVerySmall ? 1 : 1.5,
      }}>
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

      <TextField
        placeholder={isVerySmall ? "Search..." : "Search sub municipalities..."}
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

const SubMunicipalities = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.between(600, 1038));
  const isVerySmall = useMediaQuery("(max-width:369px)");

  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [showArchived, setShowArchived] = useState(false);
  const { enqueueSnackbar } = useSnackbar();
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(searchQuery);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const status = showArchived ? "inactive" : "active";

  const { data: onerdfData, isFetching: onerdfFetching } =
    useGetSubmunicipalitiesQuery();

  const queryParams = useMemo(
    () => ({
      search: debouncedSearchQuery,
      page,
      per_page: rowsPerPage,
      status,
    }),
    [debouncedSearchQuery, page, rowsPerPage, status]
  );

  const {
    data: subMunicipalitiesData,
    refetch: refetchSubMunicipalities,
    isFetching: fetchingSubMunicipalities,
  } = useGetShowSubMunicipalitiesQuery(queryParams, {
    refetchOnMountOrArgChange: true,
  });

  const [postSubMunicipalities, { isLoading: syncing }] =
    usePostSubMunicipalitiesMutation();

  const subMunicipalities = useMemo(
    () => subMunicipalitiesData?.result?.data || [],
    [subMunicipalitiesData]
  );
  const totalCount = subMunicipalitiesData?.result?.total || 0;

  const handleSearchChange = useCallback((newSearchQuery) => {
    setSearchQuery(newSearchQuery);
    setPage(1);
  }, []);

  const onSync = async () => {
    try {
      const response = await postSubMunicipalities({ ...onerdfData });

      if (response.error) {
        enqueueSnackbar(`Sync failed: ${response.error.data?.message}`, {
          variant: "error",
        });
      } else {
        enqueueSnackbar("Successfully synced!", { variant: "success" });
        refetchSubMunicipalities();
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

  const isLoadingState = onerdfFetching || fetchingSubMunicipalities || syncing;

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
                SUB MUNICIPALITIES
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
            showArchived={showArchived}
            setShowArchived={setShowArchived}
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
                    SUB MUNICIPALITY
                  </TableCell>
                  <TableCell
                    sx={{
                      ...styles.columnStyles.formName,
                      borderBottom: "none",
                    }}>
                    MUNICIPALITY
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
                        <TableCell>
                          <Skeleton animation="wave" height={30} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </>
                ) : subMunicipalities.length > 0 ? (
                  subMunicipalities.map((subMunicipality) => (
                    <TableRow
                      key={subMunicipality.id}
                      sx={styles.tableRowHover(theme)}>
                      <TableCell align="left">{subMunicipality.id}</TableCell>
                      {!isVerySmall && (
                        <TableCell sx={styles.formNameCell}>
                          <Tooltip
                            title={subMunicipality.psgc_id}
                            placement="top">
                            <span style={styles.cellContentStyles}>
                              {subMunicipality.psgc_id}
                            </span>
                          </Tooltip>
                        </TableCell>
                      )}
                      <TableCell sx={styles.formNameCell}>
                        <Tooltip title={subMunicipality.name} placement="top">
                          <span style={styles.cellContentStyles}>
                            {subMunicipality.name}
                          </span>
                        </Tooltip>
                      </TableCell>
                      <TableCell sx={styles.formNameCell}>
                        <Tooltip
                          title={
                            subMunicipality.city_municipality?.name || "N/A"
                          }
                          placement="top">
                          <span style={styles.cellContentStyles}>
                            {subMunicipality.city_municipality?.name || "N/A"}
                          </span>
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
                            ? `No sub municipalities found for "${searchQuery}"`
                            : showArchived
                            ? "No archived sub municipalities"
                            : "No sub municipalities available"
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

export default SubMunicipalities;
