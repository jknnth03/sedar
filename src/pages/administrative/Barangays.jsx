import React, { useState, useMemo, useCallback } from "react";
import {
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  CircularProgress,
  TableRow,
  Button,
  IconButton,
  Box,
  TextField,
  Fade,
  useMediaQuery,
  useTheme,
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
import useDebounce from "../../hooks/useDebounce";

const CustomSearchBar = ({
  searchQuery,
  setSearchQuery,
  isLoading = false,
}) => {
  const theme = useTheme();
  const isVerySmall = useMediaQuery("(max-width:369px)");

  return (
    <Box
      sx={{ display: "flex", alignItems: "center", gap: isVerySmall ? 1 : 1.5 }}
      className="search-bar-container">
      <TextField
        placeholder={isVerySmall ? "Search..." : "Search barangays..."}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        disabled={isLoading}
        size="small"
        className="search-input"
        InputProps={{
          startAdornment: (
            <SearchIcon
              sx={{
                color: isLoading ? "#ccc" : "#666",
                marginRight: 1,
                fontSize: isVerySmall ? "18px" : "20px",
              }}
            />
          ),
          endAdornment: isLoading && (
            <CircularProgress size={16} sx={{ marginLeft: 1 }} />
          ),
          sx: {
            height: "36px",
            width: isVerySmall ? "100%" : "320px",
            minWidth: isVerySmall ? "160px" : "200px",
            backgroundColor: "white",
            transition: "all 0.2s ease-in-out",
            "& .MuiOutlinedInput-root": {
              height: "36px",
              "& fieldset": {
                borderColor: "#ccc",
                transition: "border-color 0.2s ease-in-out",
              },
              "&:hover fieldset": {
                borderColor: "rgb(33, 61, 112)",
              },
              "&.Mui-focused fieldset": {
                borderColor: "rgb(33, 61, 112)",
                borderWidth: "2px",
              },
              "&.Mui-disabled": {
                backgroundColor: "#f5f5f5",
              },
            },
          },
        }}
        sx={{
          flex: isVerySmall ? 1 : "0 0 auto",
          "& .MuiInputBase-input": {
            fontSize: isVerySmall ? "13px" : "14px",
            "&::placeholder": {
              opacity: 0.7,
            },
          },
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
  const [isSearching, setIsSearching] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  const debounceValue = useDebounce(searchQuery, 500);

  const { data: onerdfData, isFetching: onerdfFetching } =
    useGetBarangaysQuery();

  const queryParams = useMemo(
    () => ({
      search: debounceValue,
      page,
      per_page: rowsPerPage,
      status: "active",
    }),
    [debounceValue, page, rowsPerPage]
  );

  const {
    data: barangaysData,
    refetch: refetchBarangays,
    isFetching: fetchingBarangays,
  } = useGetShowBarangaysQuery(queryParams, {
    refetchOnMountOrArgChange: true,
    onQueryStarted: () => setIsSearching(true),
    onSettled: () => setIsSearching(false),
  });

  const [postBarangays, { isLoading: syncing }] = usePostBarangaysMutation();

  const barangays = useMemo(() => {
    return barangaysData?.result?.data || [];
  }, [barangaysData]);

  const handleSearchChange = useCallback((newSearchQuery) => {
    setSearchQuery(newSearchQuery);
    setPage(1);
  }, []);

  const onSync = async () => {
    try {
      if (!onerdfData) {
        enqueueSnackbar("No data available to sync!", { variant: "warning" });
        return;
      }

      let dataToSend;

      if (onerdfData.data) {
        dataToSend = { data: onerdfData.data };
      } else if (Array.isArray(onerdfData)) {
        dataToSend = { data: onerdfData };
      } else {
        dataToSend = { ...onerdfData };
      }

      const response = await postBarangays(dataToSend);

      if (response.error) {
        const errorType =
          response.error?.status || response.error?.error || "Unknown";
        const errorMessage =
          response.error?.data?.message ||
          response.error?.message ||
          `Server error (${errorType})`;

        if (errorType === "FETCH_ERROR") {
          refetchBarangays();
          enqueueSnackbar("Sync completed", {
            variant: "success",
          });
        } else {
          enqueueSnackbar(`Sync failed: ${errorMessage}`, { variant: "error" });
        }
      } else {
        enqueueSnackbar("Successfully synced!", { variant: "success" });
        refetchBarangays();
      }
    } catch (error) {
      refetchBarangays();
      enqueueSnackbar(
        `Sync completed with errors. Please verify if data was updated: ${
          error.message || "Unknown error"
        }`,
        {
          variant: "warning",
        }
      );
    }
  };

  const isLoadingState =
    onerdfFetching || fetchingBarangays || isSearching || syncing;

  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        backgroundColor: "white",
      }}>
      <Box
        sx={{
          display: "flex",
          alignItems: isMobile || isTablet ? "flex-start" : "center",
          justifyContent: isMobile || isTablet ? "flex-start" : "space-between",
          flexDirection: isMobile || isTablet ? "column" : "row",
          flexShrink: 0,
          minHeight: isMobile || isTablet ? "auto" : "60px",
          padding: isMobile ? "12px 14px" : isTablet ? "16px" : "12px 16px",
          backgroundColor: "white",
          borderBottom: "1px solid #e0e0e0",
          boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
          gap: isMobile || isTablet ? "16px" : "0",
        }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: isVerySmall ? 1 : isMobile || isTablet ? 2 : 1.4,
            width: isMobile || isTablet ? "100%" : "auto",
            justifyContent: "flex-start",
          }}>
          <Typography className="header">
            {isVerySmall ? "BARANGAYS" : "BARANGAYS"}
          </Typography>

          <Fade in={!isLoadingState}>
            {isVerySmall ? (
              <IconButton
                onClick={onSync}
                disabled={isLoadingState}
                sx={{
                  backgroundColor: "#4caf50",
                  color: "white",
                  width: "36px",
                  height: "36px",
                  borderRadius: "8px",
                  boxShadow: "0 2px 8px rgba(76, 175, 80, 0.2)",
                  transition: "all 0.2s ease-in-out",
                  "&:hover": {
                    backgroundColor: "#45a049",
                    boxShadow: "0 4px 12px rgba(76, 175, 80, 0.3)",
                    transform: "translateY(-1px)",
                  },
                  "&:disabled": {
                    backgroundColor: "#ccc",
                    boxShadow: "none",
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
                  backgroundColor: "#4caf50",
                  height: isMobile ? "36px" : "38px",
                  width: isMobile ? "auto" : "120px",
                  minWidth: isMobile ? "80px" : "120px",
                  padding: isMobile ? "0 16px" : "0 20px",
                  textTransform: "none",
                  fontWeight: 600,
                  fontSize: isMobile ? "12px" : "14px",
                  borderRadius: "8px",
                  boxShadow: "0 2px 8px rgba(76, 175, 80, 0.2)",
                  transition: "all 0.2s ease-in-out",
                  "& .MuiButton-startIcon": {
                    marginRight: isMobile ? "4px" : "8px",
                  },
                  "&:hover": {
                    backgroundColor: "#45a049",
                    boxShadow: "0 4px 12px rgba(76, 175, 80, 0.3)",
                    transform: "translateY(-1px)",
                  },
                  "&:disabled": {
                    backgroundColor: "#ccc",
                    boxShadow: "none",
                  },
                }}>
                SYNC
              </Button>
            )}
          </Fade>
        </Box>

        <CustomSearchBar
          searchQuery={searchQuery}
          setSearchQuery={handleSearchChange}
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
        <TableContainer
          sx={{
            flex: 1,
            overflow: "auto",
            "& .MuiTableCell-head": {
              backgroundColor: "#f8f9fa",
              fontWeight: 700,
              fontSize: isVerySmall ? "14px" : isMobile ? "16px" : "18px",
              color: "rgb(33, 61, 112)",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
              borderBottom: "2px solid #e0e0e0",
              position: "sticky",
              top: 0,
              zIndex: 10,
              height: isMobile ? "44px" : "48px",
              padding: isMobile ? "6px 12px" : "8px 16px",
            },
            "& .MuiTableCell-body": {
              fontSize: isVerySmall ? "12px" : isMobile ? "14px" : "16px",
              color: "#333",
              borderBottom: "1px solid #f0f0f0",
              padding: isMobile ? "6px 12px" : "8px 16px",
              height: isMobile ? "48px" : "52px",
            },
            "& .MuiTableRow-root": {
              transition: "background-color 0.2s ease-in-out",
              "&:hover": {
                backgroundColor: "#f8f9fa",
              },
            },
          }}>
          <Table stickyHeader sx={{ minWidth: isMobile ? 300 : 800 }}>
            <TableHead>
              <TableRow>
                <TableCell
                  align="left"
                  sx={{ width: isVerySmall ? "40px" : "80px" }}>
                  ID
                </TableCell>
                {!isVerySmall && (
                  <TableCell sx={{ width: isMobile ? "80px" : "150px" }}>
                    PSGC CODE
                  </TableCell>
                )}
                <TableCell sx={{ width: isMobile ? "120px" : "300px" }}>
                  BARANGAY
                </TableCell>
                {!isMobile && (
                  <TableCell sx={{ width: "300px" }}>MUNICIPALITY</TableCell>
                )}
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoadingState ? (
                <TableRow>
                  <TableCell
                    colSpan={isVerySmall ? 2 : isMobile ? 3 : 4}
                    align="center"
                    sx={{ py: 4 }}>
                    <CircularProgress
                      size={32}
                      sx={{ color: "rgb(33, 61, 112)" }}
                    />
                  </TableCell>
                </TableRow>
              ) : barangays.length > 0 ? (
                barangays.map((barangay) => (
                  <TableRow key={barangay.id}>
                    <TableCell
                      align="left"
                      sx={{ width: isVerySmall ? "40px" : "80px" }}>
                      {barangay.id}
                    </TableCell>
                    {!isVerySmall && (
                      <TableCell
                        sx={{
                          width: isMobile ? "80px" : "150px",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          fontWeight: 600,
                          fontFamily: "monospace",
                          fontSize: isVerySmall ? "10px" : "12px",
                        }}>
                        {barangay.psgc_id}
                      </TableCell>
                    )}
                    <TableCell
                      sx={{
                        width: isMobile ? "120px" : "300px",
                        minWidth: isMobile ? "100px" : "180px",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        fontWeight: 600,
                      }}>
                      {barangay.name}
                    </TableCell>
                    {!isMobile && (
                      <TableCell
                        sx={{
                          width: "300px",
                          minWidth: "180px",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          fontWeight: 500,
                        }}>
                        {barangay.city_municipality?.name || "N/A"}
                      </TableCell>
                    )}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={isVerySmall ? 2 : isMobile ? 3 : 4}
                    align="center"
                    sx={{
                      py: 8,
                      borderBottom: "none",
                      color: "#666",
                      fontSize: isMobile ? "14px" : "16px",
                    }}>
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 2,
                      }}>
                      {CONSTANT.BUTTONS.NODATA.icon}
                      <Typography variant="h6" color="text.secondary">
                        {searchQuery && !isLoadingState ? (
                          <Typography>
                            No results found for "{searchQuery}"
                          </Typography>
                        ) : (
                          <Typography>No data available</Typography>
                        )}
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <Box
          sx={{
            borderTop: "1px solid #e0e0e0",
            backgroundColor: "#f8f9fa",
            flexShrink: 0,
            "& .MuiTablePagination-root": {
              color: "#666",
              "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows":
                {
                  fontSize: isMobile ? "12px" : "14px",
                  fontWeight: 500,
                },
              "& .MuiTablePagination-select": {
                fontSize: isMobile ? "12px" : "14px",
              },
              "& .MuiIconButton-root": {
                color: "rgb(33, 61, 112)",
                "&:hover": {
                  backgroundColor: "rgba(33, 61, 112, 0.04)",
                },
                "&.Mui-disabled": {
                  color: "#ccc",
                },
              },
            },
          }}>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25, 50, 100]}
            component="div"
            count={barangaysData?.result?.total || 0}
            rowsPerPage={rowsPerPage}
            page={Math.max(0, page - 1)}
            onPageChange={(event, newPage) => setPage(newPage + 1)}
            onRowsPerPageChange={(event) => {
              setRowsPerPage(parseInt(event.target.value, 10));
              setPage(1);
            }}
            sx={{
              "& .MuiTablePagination-toolbar": {
                paddingLeft: isMobile ? "12px" : "24px",
                paddingRight: isMobile ? "12px" : "24px",
              },
            }}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default Barangays;
