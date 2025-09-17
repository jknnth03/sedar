import React, { useState, useMemo } from "react";
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
  Box,
  TextField,
  Checkbox,
  FormControlLabel,
  Fade,
  Tooltip,
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

const CustomSearchBar = ({
  searchQuery,
  setSearchQuery,
  showArchived,
  setShowArchived,
  isLoading = false,
}) => {
  const iconColor = showArchived ? "#d32f2f" : "rgb(33, 61, 112)";
  const labelColor = showArchived ? "#d32f2f" : "rgb(33, 61, 112)";

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
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
        placeholder="Search Sub Municipalities..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        disabled={isLoading}
        size="small"
        InputProps={{
          startAdornment: (
            <SearchIcon
              sx={{
                color: isLoading ? "#ccc" : "#666",
                marginRight: 1,
                fontSize: "20px",
              }}
            />
          ),
          endAdornment: isLoading && (
            <CircularProgress size={16} sx={{ marginLeft: 1 }} />
          ),
          sx: {
            height: "36px",
            width: "320px",
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
          "& .MuiInputBase-input": {
            fontSize: "14px",
            "&::placeholder": {
              opacity: 0.7,
            },
          },
        }}
      />
    </Box>
  );
};

const SubMunicipalities = () => {
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [showArchived, setShowArchived] = useState(false);
  const { enqueueSnackbar } = useSnackbar();
  const status = showArchived ? "inactive" : "active";

  const { data: onerdfData, isFetching: onerdfFetching } =
    useGetSubmunicipalitiesQuery();

  const {
    data: subMunicipalitiesData,
    refetch: refetchSubMunicipalities,
    isFetching: fetchingSubMunicipalities,
  } = useGetShowSubMunicipalitiesQuery(
    { page, per_page: rowsPerPage, search: searchQuery, status },
    {
      refetchOnMountOrArgChange: true,
      onQueryStarted: () => setIsSearching(true),
      onSettled: () => setIsSearching(false),
    }
  );

  const [postSubMunicipalities, { isLoading: syncing }] =
    usePostSubMunicipalitiesMutation();

  const subMunicipalities = useMemo(() => {
    return subMunicipalitiesData?.result?.data || [];
  }, [subMunicipalitiesData]);

  const onSync = async () => {
    try {
      const response = await postSubMunicipalities({ ...onerdfData });

      if (response.error) {
        enqueueSnackbar(
          `Sync failed: ${response.error?.data?.message || "Unknown error"}`,
          { variant: "error" }
        );
      } else {
        enqueueSnackbar("Successfully synced!", { variant: "success" });
        refetchSubMunicipalities();
      }
    } catch (error) {
      enqueueSnackbar("An error occurred while syncing!", { variant: "error" });
    }
  };

  const isLoadingState =
    onerdfFetching || fetchingSubMunicipalities || isSearching || syncing;

  return (
    <>
      <Box
        sx={{
          width: "100%",
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          backgroundColor: "#fafafa",
        }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexShrink: 0,
            minHeight: "72px",
            padding: "16px 14px",
            backgroundColor: "white",
            borderBottom: "1px solid #e0e0e0",
            boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
          }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.4 }}>
            <Typography className="header">SUB MUNICIPALITIES</Typography>
            <Fade in={!isLoadingState}>
              <Button
                variant="contained"
                onClick={onSync}
                startIcon={<SyncIcon />}
                disabled={isLoadingState}
                sx={{
                  backgroundColor: "#4caf50",
                  height: "38px",
                  width: "120px",
                  textTransform: "none",
                  fontWeight: 600,
                  fontSize: "14px",
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
                SYNC
              </Button>
            </Fade>
          </Box>

          <CustomSearchBar
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            showArchived={showArchived}
            setShowArchived={setShowArchived}
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
              backgroundColor: "#fafafa",
              "& .MuiTableCell-head": {
                backgroundColor: "#f8f9fa",
                fontWeight: 700,
                fontSize: "18px",
                color: "rgb(33, 61, 112)",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                borderBottom: "2px solid #e0e0e0",
                position: "sticky",
                top: 0,
                zIndex: 10,
                height: "48px",
                padding: "8px 16px",
              },
              "& .MuiTableCell-body": {
                fontSize: "16px",
                color: "#333",
                borderBottom: "1px solid #f0f0f0",
                padding: "8px 16px",
                height: "52px",
                backgroundColor: "white",
              },
              "& .MuiTableRow-root": {
                transition: "background-color 0.2s ease-in-out",
                "&:hover": {
                  backgroundColor: "#f8f9fa",
                  cursor: "pointer",
                  "& .MuiTableCell-root": {
                    backgroundColor: "transparent",
                  },
                },
              },
            }}>
            <Table stickyHeader sx={{ tableLayout: "fixed", width: "100%" }}>
              <TableHead>
                <TableRow>
                  <TableCell align="left" sx={{ width: "8%" }}>
                    ID
                  </TableCell>
                  <TableCell sx={{ width: "25%" }}>PSGC CODE</TableCell>
                  <TableCell sx={{ width: "35%" }}>SUB MUNICIPALITY</TableCell>
                  <TableCell sx={{ width: "32%" }}>MUNICIPALITY</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {isLoadingState ? (
                  <TableRow>
                    <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                      <CircularProgress
                        size={32}
                        sx={{ color: "rgb(33, 61, 112)" }}
                      />
                    </TableCell>
                  </TableRow>
                ) : subMunicipalities.length > 0 ? (
                  subMunicipalities.map((subMunicipality) => (
                    <TableRow key={subMunicipality.id}>
                      <TableCell align="left">{subMunicipality.id}</TableCell>
                      <TableCell
                        sx={{
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          fontWeight: 600,
                        }}>
                        <Tooltip
                          title={subMunicipality.psgc_id}
                          placement="top">
                          <span>{subMunicipality.psgc_id}</span>
                        </Tooltip>
                      </TableCell>
                      <TableCell
                        sx={{
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          fontWeight: 600,
                        }}>
                        <Tooltip title={subMunicipality.name} placement="top">
                          <span>{subMunicipality.name}</span>
                        </Tooltip>
                      </TableCell>
                      <TableCell
                        sx={{
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          fontWeight: 600,
                        }}>
                        <Tooltip
                          title={
                            subMunicipality.city_municipality?.name || "N/A"
                          }
                          placement="top">
                          <span>
                            {subMunicipality.city_municipality?.name || "N/A"}
                          </span>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      align="center"
                      sx={{
                        py: 8,
                        borderBottom: "none",
                        color: "#666",
                        fontSize: "16px",
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
                          No sub municipalities found
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {searchQuery
                            ? `No results for "${searchQuery}"`
                            : showArchived
                            ? "No archived sub municipalities"
                            : "No active sub municipalities"}
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
                    fontSize: "14px",
                    fontWeight: 500,
                  },
                "& .MuiTablePagination-select": {
                  fontSize: "14px",
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
              count={subMunicipalitiesData?.result?.total || 0}
              rowsPerPage={rowsPerPage}
              page={page - 1}
              onPageChange={(e, newPage) => setPage(newPage + 1)}
              onRowsPerPageChange={(e) => {
                setRowsPerPage(parseInt(e.target.value, 10));
                setPage(1);
              }}
              sx={{
                "& .MuiTablePagination-toolbar": {
                  paddingLeft: "24px",
                  paddingRight: "24px",
                },
              }}
            />
          </Box>
        </Box>
      </Box>
    </>
  );
};

export default SubMunicipalities;
