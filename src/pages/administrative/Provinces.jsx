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
} from "@mui/material";
import { useSnackbar } from "notistack";
import VisibilityIcon from "@mui/icons-material/Visibility";
import SearchIcon from "@mui/icons-material/Search";
import SyncIcon from "@mui/icons-material/Sync";
import "../../pages/GeneralStyle.scss";

import { useGetProvincesQuery } from "../../features/api/masterlist/onerdfApi";
import {
  useGetShowProvincesQuery,
  usePostProvincesMutation,
} from "../../features/api/administrative/provincesApi";
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
        placeholder={isVerySmall ? "Search..." : "Search provinces..."}
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

const Provinces = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.between(600, 1038));
  const isVerySmall = useMediaQuery("(max-width:369px)");

  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const { enqueueSnackbar } = useSnackbar();
  const [isSearching, setIsSearching] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedMunicipalities, setSelectedMunicipalities] = useState([]);

  const debounceValue = useDebounce(searchQuery, 500);

  const { data: onerdfData, isFetching: onerdfFetching } =
    useGetProvincesQuery();

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
    data: backendData,
    refetch: refetchBackend,
    isFetching: backendFetching,
  } = useGetShowProvincesQuery(queryParams, {
    refetchOnMountOrArgChange: true,
    onQueryStarted: () => setIsSearching(true),
    onSettled: () => setIsSearching(false),
  });

  const [postProvinces, { isLoading: syncing }] = usePostProvincesMutation();

  const provinces = useMemo(
    () => backendData?.result?.data || [],
    [backendData]
  );

  const handleSearchChange = useCallback((newSearchQuery) => {
    setSearchQuery(newSearchQuery);
    setPage(1);
  }, []);

  const onSync = async () => {
    try {
      const response = await postProvinces({ ...onerdfData });

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

  const handleOpenDialog = (municipalities) => {
    setSelectedMunicipalities(municipalities || []);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const isLoadingState =
    onerdfFetching || backendFetching || isSearching || syncing;

  return (
    <>
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
            justifyContent:
              isMobile || isTablet ? "flex-start" : "space-between",
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
              {isVerySmall ? "PROVINCES" : "PROVINCES"}
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
                  cursor: "pointer",
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
                    PROVINCE
                  </TableCell>
                  <TableCell
                    sx={{ width: isMobile ? "80px" : "120px" }}
                    align="center">
                    MUNICIPALITIES
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {isLoadingState ? (
                  <TableRow>
                    <TableCell
                      colSpan={isVerySmall ? 3 : 4}
                      align="center"
                      sx={{ py: 4 }}>
                      <CircularProgress
                        size={32}
                        sx={{ color: "rgb(33, 61, 112)" }}
                      />
                    </TableCell>
                  </TableRow>
                ) : provinces.length > 0 ? (
                  provinces.map((province) => (
                    <TableRow key={province.id}>
                      <TableCell
                        align="left"
                        sx={{ width: isVerySmall ? "40px" : "80px" }}>
                        {province.id}
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
                          <Tooltip title={province.psgc_id} placement="top">
                            <span>{province.psgc_id}</span>
                          </Tooltip>
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
                        <Tooltip title={province.name} placement="top">
                          <span>{province.name}</span>
                        </Tooltip>
                      </TableCell>
                      <TableCell
                        sx={{
                          width: isMobile ? "80px" : "120px",
                          textAlign: "center",
                          padding: isMobile ? "6px 12px" : "8px 16px",
                        }}>
                        <Tooltip title="View Municipalities">
                          <IconButton
                            size="small"
                            sx={{
                              backgroundColor: "transparent",
                              transition: "background-color 150ms ease",
                              "&:hover": {
                                backgroundColor: "#e0e0e0",
                              },
                            }}
                            onClick={() =>
                              handleOpenDialog(
                                province.cities_and_municipalities
                              )
                            }>
                            <VisibilityIcon
                              sx={{
                                color: "rgb(33, 61, 112)",
                                fontSize: isMobile ? "18px" : "20px",
                              }}
                            />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={isVerySmall ? 3 : 4}
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
              count={backendData?.result?.total || 0}
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
            Municipalities in the Province
          </Typography>
        </DialogTitle>

        <DialogContent style={{ backgroundColor: "white" }}>
          <List>
            {selectedMunicipalities.length > 0 ? (
              selectedMunicipalities.map((municipality, index) => (
                <ListItem
                  key={index}
                  style={{ borderBottom: "1px solid #ccc" }}>
                  <ListItemText
                    primary={municipality.name}
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
                <ListItemText primary="No municipalities found" />
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

export default Provinces;
