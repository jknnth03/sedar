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
  Skeleton,
  Tooltip,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import "../../../pages/GeneralStyle.scss";
import { useGetShowOneRdfQuery } from "../../../features/api/masterlist/realonerdfApi";
import CustomTablePagination from "../../../pages/zzzreusable/CustomTablePagination";
import NoDataFound from "../../../pages/NoDataFound";
import { styles } from "../../forms/manpowerform/formSubmissionStyles";
import dayjs from "dayjs";

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
        placeholder={isVerySmall ? "Search..." : "Search charging..."}
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

const OneRdf = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.between(600, 1038));
  const isVerySmall = useMediaQuery("(max-width:369px)");

  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
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
      status: "active",
      pagination: true,
    }),
    [debouncedSearchQuery, page, rowsPerPage]
  );

  const {
    data: oneRdfData,
    isFetching,
    error,
  } = useGetShowOneRdfQuery(queryParams, {
    refetchOnMountOrArgChange: true,
  });

  const oneRdfList = useMemo(
    () => oneRdfData?.result?.data || [],
    [oneRdfData]
  );
  const totalCount = oneRdfData?.result?.total || 0;

  const handleSearchChange = useCallback((newSearchQuery) => {
    setSearchQuery(newSearchQuery);
    setPage(1);
  }, []);

  const handlePageChange = useCallback((event, newPage) => {
    setPage(newPage + 1);
  }, []);

  const handleRowsPerPageChange = useCallback((event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(1);
  }, []);

  const isLoadingState = isFetching;

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
                CHARGING
              </Typography>
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
                    NAME
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{
                      ...styles.columnStyles.formName,
                      borderBottom: "none",
                    }}>
                    CODE
                  </TableCell>
                  {!isVerySmall && (
                    <TableCell
                      sx={{
                        ...styles.columnStyles.formName,
                        borderBottom: "none",
                      }}>
                      COMPANY
                    </TableCell>
                  )}
                  {!isMobile && (
                    <TableCell
                      sx={{
                        ...styles.columnStyles.formName,
                        borderBottom: "none",
                      }}>
                      BUSINESS UNIT
                    </TableCell>
                  )}
                  {!isMobile && (
                    <TableCell
                      sx={{
                        ...styles.columnStyles.formName,
                        borderBottom: "none",
                      }}>
                      DEPARTMENT
                    </TableCell>
                  )}
                  {!isMobile && !isTablet && (
                    <TableCell
                      sx={{
                        ...styles.columnStyles.formName,
                        borderBottom: "none",
                      }}>
                      UNIT
                    </TableCell>
                  )}
                  {!isMobile && !isTablet && (
                    <TableCell
                      sx={{
                        ...styles.columnStyles.formName,
                        borderBottom: "none",
                      }}>
                      SUB UNIT
                    </TableCell>
                  )}
                  {!isMobile && !isTablet && (
                    <TableCell
                      sx={{
                        ...styles.columnStyles.formName,
                        borderBottom: "none",
                      }}>
                      LOCATION
                    </TableCell>
                  )}
                  <TableCell
                    sx={{
                      ...styles.columnStyles.formName,
                      borderBottom: "none",
                    }}>
                    {isMobile ? "MODIFIED" : "LAST MODIFIED"}
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
                        {!isVerySmall && (
                          <TableCell>
                            <Skeleton animation="wave" height={30} />
                          </TableCell>
                        )}
                        {!isMobile && (
                          <>
                            <TableCell>
                              <Skeleton animation="wave" height={30} />
                            </TableCell>
                            <TableCell>
                              <Skeleton animation="wave" height={30} />
                            </TableCell>
                          </>
                        )}
                        {!isMobile && !isTablet && (
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
                          </>
                        )}
                        <TableCell>
                          <Skeleton animation="wave" height={30} />
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
                ) : oneRdfList.length > 0 ? (
                  oneRdfList.map((oneRdf) => (
                    <TableRow key={oneRdf.id} sx={styles.tableRowHover(theme)}>
                      <TableCell align="left">{oneRdf.id}</TableCell>
                      <TableCell sx={styles.formNameCell}>
                        <Tooltip title={oneRdf.name} placement="top">
                          <span style={styles.cellContentStyles}>
                            {oneRdf.name}
                          </span>
                        </Tooltip>
                      </TableCell>
                      <TableCell align="center" sx={styles.formNameCell}>
                        <Tooltip title={oneRdf.code} placement="top">
                          <span
                            style={{
                              ...styles.cellContentStyles,
                              fontFamily: "monospace",
                            }}>
                            {oneRdf.code}
                          </span>
                        </Tooltip>
                      </TableCell>
                      {!isVerySmall && (
                        <TableCell sx={styles.formNameCell}>
                          <Tooltip
                            title={oneRdf.company_name || "-"}
                            placement="top">
                            <span style={styles.cellContentStyles}>
                              {oneRdf.company_name || "-"}
                            </span>
                          </Tooltip>
                        </TableCell>
                      )}
                      {!isMobile && (
                        <TableCell sx={styles.formNameCell}>
                          <Tooltip
                            title={oneRdf.business_unit_name || "-"}
                            placement="top">
                            <span style={styles.cellContentStyles}>
                              {oneRdf.business_unit_name || "-"}
                            </span>
                          </Tooltip>
                        </TableCell>
                      )}
                      {!isMobile && (
                        <TableCell sx={styles.formNameCell}>
                          <Tooltip
                            title={oneRdf.department_name || "-"}
                            placement="top">
                            <span style={styles.cellContentStyles}>
                              {oneRdf.department_name || "-"}
                            </span>
                          </Tooltip>
                        </TableCell>
                      )}
                      {!isMobile && !isTablet && (
                        <TableCell sx={styles.formNameCell}>
                          <Tooltip
                            title={oneRdf.unit_name || "-"}
                            placement="top">
                            <span style={styles.cellContentStyles}>
                              {oneRdf.unit_name || "-"}
                            </span>
                          </Tooltip>
                        </TableCell>
                      )}
                      {!isMobile && !isTablet && (
                        <TableCell sx={styles.formNameCell}>
                          <Tooltip
                            title={oneRdf.sub_unit_name || "-"}
                            placement="top">
                            <span style={styles.cellContentStyles}>
                              {oneRdf.sub_unit_name || "-"}
                            </span>
                          </Tooltip>
                        </TableCell>
                      )}
                      {!isMobile && !isTablet && (
                        <TableCell sx={styles.formNameCell}>
                          <Tooltip
                            title={oneRdf.location_name || "-"}
                            placement="top">
                            <span style={styles.cellContentStyles}>
                              {oneRdf.location_name || "-"}
                            </span>
                          </Tooltip>
                        </TableCell>
                      )}
                      <TableCell sx={styles.formNameCell}>
                        <Tooltip
                          title={
                            oneRdf.updated_at
                              ? dayjs(oneRdf.updated_at).format("MMM D, YYYY")
                              : "-"
                          }
                          placement="top">
                          <span style={styles.cellContentStyles}>
                            {oneRdf.updated_at
                              ? dayjs(oneRdf.updated_at).format(
                                  isMobile ? "MMM D" : "MMM D, YYYY"
                                )
                              : "-"}
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
                            ? `No charging found for "${searchQuery}"`
                            : "No charging available"
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

export default OneRdf;
