import React, { useState, useMemo, useCallback, useEffect } from "react";
import {
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  CircularProgress,
  TableRow,
  Box,
  TextField,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useTheme,
  useMediaQuery,
  alpha,
  Fade,
  Chip,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import HelpIcon from "@mui/icons-material/Help";
import { FormProvider, useForm } from "react-hook-form";
import { useSnackbar } from "notistack";
import "../../pages/GeneralStyle.scss";
import {
  useGetTablePositionsQuery,
  useUpdatePositionKpisMutation,
  useGetPositionKpisQuery,
} from "../../features/api/evaluation/kpiApi";
import { CONSTANT } from "../../config";
import KpiModal from "../../components/modal/evaluation/KpiModal";

const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

const CustomSearchBar = ({
  searchQuery,
  setSearchQuery,
  isLoading = false,
}) => {
  const theme = useTheme();
  const isVerySmall = useMediaQuery("(max-width:430px)");

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: isVerySmall ? 1 : 1.5,
      }}>
      <TextField
        placeholder={isVerySmall ? "Search..." : "Search Positions..."}
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

const Kpi = () => {
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.between("sm", "md"));
  const isVerySmall = useMediaQuery("(max-width:430px)");

  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("view");
  const [selectedPosition, setSelectedPosition] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedPositionForAction, setSelectedPositionForAction] =
    useState(null);

  const [isLoading, setIsLoading] = useState(false);

  const methods = useForm({
    defaultValues: {
      kpis: [
        {
          objective: "",
          distribution: "",
          deliverable: "",
          target: "",
        },
      ],
    },
  });

  const debounceValue = useDebounce(searchQuery, 500);

  const queryParams = useMemo(() => {
    const params = {
      page,
      per_page: rowsPerPage,
      status: "active",
      pagination: true,
    };

    if (debounceValue && debounceValue.trim() !== "") {
      params.search = debounceValue.trim();
    }

    return params;
  }, [debounceValue, page, rowsPerPage]);

  const {
    data: positionsData,
    isLoading: queryLoading,
    isFetching,
    refetch,
    error,
  } = useGetTablePositionsQuery(queryParams, {
    refetchOnMountOrArgChange: true,
    skip: false,
  });

  const { data: positionKpisData, isLoading: kpisLoading } =
    useGetPositionKpisQuery(selectedPosition?.id, {
      skip: !selectedPosition?.id || !modalOpen,
    });

  const [updatePositionKpis] = useUpdatePositionKpisMutation();

  const positionsList = useMemo(() => {
    if (!positionsData) return [];

    const result = positionsData?.result;
    if (result && Array.isArray(result.data)) {
      return result.data;
    }

    if (Array.isArray(result)) {
      return result;
    }

    if (Array.isArray(positionsData.data)) {
      return positionsData.data;
    }

    if (Array.isArray(positionsData)) {
      return positionsData;
    }

    return [];
  }, [positionsData]);

  const handleSearchChange = useCallback((newSearchQuery) => {
    setSearchQuery(newSearchQuery);
    setPage(1);
  }, []);

  const handleRowClick = useCallback((position) => {
    setSelectedPosition(position);
    setModalMode("view");
    setModalOpen(true);
  }, []);

  const handleModalClose = useCallback(() => {
    setModalOpen(false);
    setSelectedPosition(null);
    setModalMode("view");
    methods.reset({
      kpis: [
        {
          objective: "",
          distribution: "",
          deliverable: "",
          target: "",
        },
      ],
    });
  }, [methods]);

  const handleModalSave = useCallback(
    async (formData, mode) => {
      setModalLoading(true);
      setIsLoading(true);

      try {
        if (mode === "edit") {
          await updatePositionKpis({
            id: selectedPosition.id,
            data: formData,
          }).unwrap();

          enqueueSnackbar("KPIs updated successfully!", {
            variant: "success",
            autoHideDuration: 2000,
          });
        }

        refetch();
        handleModalClose();
      } catch (error) {
        enqueueSnackbar("Failed to save KPIs. Please try again.", {
          variant: "error",
          autoHideDuration: 2000,
        });
      } finally {
        setModalLoading(false);
        setIsLoading(false);
      }
    },
    [
      refetch,
      selectedPosition,
      enqueueSnackbar,
      handleModalClose,
      updatePositionKpis,
    ]
  );

  const handlePageChange = useCallback((event, newPage) => {
    setPage(newPage + 1);
  }, []);

  const handleRowsPerPageChange = useCallback((event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(1);
  }, []);

  const safelyDisplayValue = useCallback((value, fallback = "N/A") => {
    if (value === null || value === undefined || value === "") {
      return fallback;
    }

    if (typeof value === "object" && value !== null) {
      if (value.name && typeof value.name === "string") {
        return value.name;
      }
      if (value.title && typeof value.title === "string") {
        return value.title;
      }
      if (value.code && typeof value.code === "string") {
        return value.code;
      }
      return fallback;
    }

    return String(value);
  }, []);

  const getPositionName = useCallback(
    (position) => {
      if (!position) return "Untitled Position";

      const name =
        safelyDisplayValue(position.title) !== "N/A"
          ? safelyDisplayValue(position.title)
          : safelyDisplayValue(position.name);

      return name !== "N/A" ? name : "Untitled Position";
    },
    [safelyDisplayValue]
  );

  const getSuperiorName = useCallback(
    (position) => {
      if (!position) return "No superior assigned";

      const superior =
        safelyDisplayValue(position.superior_name) !== "N/A"
          ? safelyDisplayValue(position.superior_name)
          : safelyDisplayValue(position.immediate_superior);

      return superior !== "N/A" ? superior : "No superior assigned";
    },
    [safelyDisplayValue]
  );

  const isLoadingState = queryLoading || isFetching || isLoading;

  const renderMetricsIcon = (hasMetrics) => {
    if (hasMetrics) {
      return (
        <CheckIcon
          sx={{
            color: "#4caf50",
            fontSize: isMobile ? "20px" : "24px",
          }}
        />
      );
    } else {
      return (
        <CloseIcon
          sx={{
            color: "#f44336",
            fontSize: isMobile ? "20px" : "24px",
          }}
        />
      );
    }
  };

  const renderNoDataIcon = () => {
    try {
      return CONSTANT?.BUTTONS?.NODATA?.icon || null;
    } catch {
      return null;
    }
  };

  const getErrorMessage = (error) => {
    if (!error) return "Unknown error";

    if (typeof error === "string") return error;

    if (error.message) return String(error.message);

    if (error.data?.message) return String(error.data.message);

    return "An error occurred";
  };

  return (
    <FormProvider {...methods}>
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
            alignItems: isMobile || isTablet ? "flex-start" : "center",
            justifyContent:
              isMobile || isTablet ? "flex-start" : "space-between",
            flexDirection: isMobile || isTablet ? "column" : "row",
            flexShrink: 0,
            minHeight: isMobile || isTablet ? "auto" : "72px",
            padding: isMobile ? "12px 14px" : isTablet ? "16px" : "16px 14px",
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
            <Typography
              className="header"
              sx={{
                fontSize: isVerySmall ? "16px" : isMobile ? "18px" : "24px",
                fontWeight: 700,
                color: "rgb(33, 61, 112)",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}>
              {isVerySmall ? "KPI MGMT" : "KPI MANAGEMENT"}
            </Typography>
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
              backgroundColor: "#fafafa",
              "& .MuiTableCell-head": {
                backgroundColor: "#f8f9fa",
                fontWeight: 700,
                fontSize: isMobile ? "14px" : "18px",
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
                fontSize: isMobile ? "14px" : "16px",
                color: "#333",
                borderBottom: "1px solid #f0f0f0",
                padding: isMobile ? "6px 12px" : "8px 16px",
                height: isMobile ? "48px" : "52px",
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
            <Table stickyHeader sx={{ minWidth: isMobile ? 600 : 800 }}>
              <TableHead>
                <TableRow>
                  <TableCell
                    align="left"
                    sx={{
                      width: isMobile ? "60px" : "80px",
                      minWidth: isMobile ? "60px" : "80px",
                    }}>
                    ID
                  </TableCell>
                  <TableCell
                    sx={{
                      width: isMobile ? "200px" : "400px",
                      minWidth: isMobile ? "200px" : "400px",
                    }}>
                    POSITION NAME
                  </TableCell>
                  {!isVerySmall && (
                    <TableCell
                      sx={{
                        width: isMobile ? "180px" : "300px",
                        minWidth: isMobile ? "180px" : "300px",
                      }}>
                      SUPERIOR
                    </TableCell>
                  )}
                  <TableCell
                    align="center"
                    sx={{
                      width: isMobile ? "80px" : "120px",
                      minWidth: isMobile ? "80px" : "120px",
                    }}>
                    METRICS
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
                ) : error ? (
                  <TableRow>
                    <TableCell
                      colSpan={isVerySmall ? 3 : 4}
                      align="center"
                      sx={{ py: 4 }}>
                      <Typography
                        color="error"
                        sx={{ fontSize: isMobile ? "14px" : "16px" }}>
                        Error loading data: {getErrorMessage(error)}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : positionsList.length > 0 ? (
                  positionsList.map((position) => (
                    <TableRow
                      key={position?.id || Math.random()}
                      onClick={() => handleRowClick(position)}
                      sx={{
                        cursor: "pointer",
                        "&:hover": {
                          backgroundColor: alpha(
                            theme.palette.primary.main,
                            0.04
                          ),
                          "& .MuiTableCell-root": {
                            backgroundColor: "transparent",
                          },
                        },
                        transition: "background-color 0.2s ease",
                      }}>
                      <TableCell
                        align="left"
                        sx={{
                          width: isMobile ? "60px" : "80px",
                          minWidth: isMobile ? "60px" : "80px",
                          fontWeight: 600,
                          color: "rgb(33, 61, 112)",
                        }}>
                        {safelyDisplayValue(position?.id)}
                      </TableCell>
                      <TableCell
                        sx={{
                          width: isMobile ? "200px" : "400px",
                          minWidth: isMobile ? "200px" : "400px",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          fontWeight: 600,
                        }}>
                        {getPositionName(position)}
                      </TableCell>
                      {!isVerySmall && (
                        <TableCell
                          sx={{
                            width: isMobile ? "180px" : "300px",
                            minWidth: isMobile ? "180px" : "300px",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            color: "#666",
                            fontStyle:
                              getSuperiorName(position) ===
                              "No superior assigned"
                                ? "italic"
                                : "normal",
                          }}>
                          {getSuperiorName(position)}
                        </TableCell>
                      )}
                      <TableCell
                        align="center"
                        sx={{
                          width: isMobile ? "80px" : "120px",
                          minWidth: isMobile ? "80px" : "120px",
                        }}>
                        {renderMetricsIcon(position?.metrics)}
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
                        {renderNoDataIcon()}
                        <Typography
                          variant="h6"
                          color="text.secondary"
                          sx={{ fontSize: isMobile ? "16px" : "18px" }}>
                          No positions found
                        </Typography>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ fontSize: isMobile ? "12px" : "14px" }}>
                          {searchQuery
                            ? `No results for "${searchQuery}"`
                            : "No positions available"}
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
              count={positionsData?.result?.total || 0}
              rowsPerPage={rowsPerPage}
              page={Math.max(0, page - 1)}
              onPageChange={handlePageChange}
              onRowsPerPageChange={handleRowsPerPageChange}
              sx={{
                "& .MuiTablePagination-toolbar": {
                  paddingLeft: isMobile ? "16px" : "24px",
                  paddingRight: isMobile ? "16px" : "24px",
                  minHeight: isMobile ? "48px" : "52px",
                },
              }}
            />
          </Box>
        </Box>

        <KpiModal
          open={modalOpen}
          onClose={handleModalClose}
          onSave={handleModalSave}
          selectedEntry={selectedPosition}
          mode={modalMode}
          positionKpisData={positionKpisData}
          isLoading={modalLoading || kpisLoading}
        />

        <Dialog
          open={confirmOpen}
          onClose={() => setConfirmOpen(false)}
          maxWidth="xs"
          fullWidth
          PaperProps={{
            sx: { borderRadius: 3 },
          }}>
          <DialogTitle>
            <Box
              display="flex"
              justifyContent="center"
              alignItems="center"
              mb={1}>
              <HelpIcon sx={{ fontSize: 60, color: "#ff4400" }} />
            </Box>
            <Typography
              variant="h6"
              fontWeight="bold"
              textAlign="center"
              color="rgb(33, 61, 112)">
              Confirmation
            </Typography>
          </DialogTitle>
          <DialogContent>
            <Typography variant="body1" gutterBottom textAlign="center">
              Are you sure you want to update KPIs for this position?
            </Typography>
            {selectedPositionForAction && (
              <Typography
                variant="body2"
                color="text.secondary"
                textAlign="center"
                sx={{ mt: 1 }}>
                {safelyDisplayValue(selectedPositionForAction?.name) !== "N/A"
                  ? safelyDisplayValue(selectedPositionForAction?.name)
                  : safelyDisplayValue(selectedPositionForAction?.title) !==
                    "N/A"
                  ? safelyDisplayValue(selectedPositionForAction?.title)
                  : "Unknown Position"}
              </Typography>
            )}
          </DialogContent>
          <DialogActions>
            <Box
              display="flex"
              justifyContent="center"
              width="100%"
              gap={2}
              mb={2}>
              <Button
                onClick={() => setConfirmOpen(false)}
                variant="outlined"
                color="error"
                sx={{ borderRadius: 2, minWidth: 80 }}>
                Cancel
              </Button>
              <Button
                variant="contained"
                color="success"
                sx={{ borderRadius: 2, minWidth: 80 }}>
                Confirm
              </Button>
            </Box>
          </DialogActions>
        </Dialog>
      </Box>
    </FormProvider>
  );
};

export default Kpi;
