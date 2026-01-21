import React, { useState, useMemo, useCallback, useEffect } from "react";
import {
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
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
  Skeleton,
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
import KpiModal from "../../components/modal/evaluation/KpiModal";
import CustomTablePagination from "../zzzreusable/CustomTablePagination";
import { kpiStyles } from "./KpiStyles";
import NoDataFound from "../NoDataFound";

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
    <Box sx={kpiStyles.searchContainer(isVerySmall)}>
      <TextField
        placeholder={isVerySmall ? "Search..." : "Search Positions..."}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        disabled={isLoading}
        size="small"
        InputProps={{
          startAdornment: (
            <SearchIcon sx={kpiStyles.searchIcon(isLoading, isVerySmall)} />
          ),
          endAdornment: isLoading && (
            <CircularProgress size={16} sx={kpiStyles.searchProgress} />
          ),
          sx: kpiStyles.searchTextField(isVerySmall, isLoading),
        }}
        sx={kpiStyles.searchInput(isVerySmall)}
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
      return <CheckIcon sx={kpiStyles.metricsIcon(true, isMobile)} />;
    } else {
      return <CloseIcon sx={kpiStyles.metricsIcon(false, isMobile)} />;
    }
  };

  const getErrorMessage = (error) => {
    if (!error) return "Unknown error";

    if (typeof error === "string") return error;

    if (error.message) return String(error.message);

    if (error.data?.message) return String(error.data.message);

    return "An error occurred";
  };

  const getNoDataMessage = () => {
    return searchQuery
      ? `No positions found for "${searchQuery}"`
      : "No positions available";
  };

  const totalColumns = isVerySmall ? 3 : 4;

  return (
    <FormProvider {...methods}>
      <Box sx={kpiStyles.container}>
        <Box sx={kpiStyles.header(isMobile, isTablet)}>
          <Box sx={kpiStyles.headerContent(isMobile, isTablet, isVerySmall)}>
            <Typography
              className="header"
              sx={kpiStyles.headerTitle(isVerySmall, isMobile)}>
              {isVerySmall ? "KPI MGMT" : "KPI MANAGEMENT"}
            </Typography>
          </Box>

          <CustomSearchBar
            searchQuery={searchQuery}
            setSearchQuery={handleSearchChange}
            isLoading={isLoadingState}
          />
        </Box>

        <Box sx={kpiStyles.mainContent}>
          <TableContainer
            sx={{
              ...kpiStyles.tableContainer(isMobile),
              boxShadow: "none",
              border: "none",
            }}>
            <Table
              stickyHeader
              sx={{
                ...kpiStyles.table(isMobile),
                height: positionsList.length === 0 ? "100%" : "auto",
                "& .MuiTableCell-root": {
                  borderBottom: "none",
                },
                "& .MuiTableHead-root .MuiTableCell-root": {
                  backgroundColor: "#ffffff !important",
                  borderBottom: "none !important",
                },
              }}>
              <TableHead>
                <TableRow>
                  <TableCell
                    align="left"
                    sx={{
                      ...kpiStyles.tableHeaderCell(
                        isMobile,
                        isMobile ? "60px" : "80px"
                      ),
                      backgroundColor: "#ffffff",
                      borderBottom: "none",
                    }}>
                    ID
                  </TableCell>
                  <TableCell
                    sx={{
                      ...kpiStyles.tableHeaderCell(
                        isMobile,
                        isMobile ? "200px" : "400px"
                      ),
                      backgroundColor: "#ffffff",
                      borderBottom: "none",
                    }}>
                    POSITION NAME
                  </TableCell>
                  {!isVerySmall && (
                    <TableCell
                      sx={{
                        ...kpiStyles.tableHeaderCell(
                          isMobile,
                          isMobile ? "180px" : "300px"
                        ),
                        backgroundColor: "#ffffff",
                        borderBottom: "none",
                      }}>
                      SUPERIOR
                    </TableCell>
                  )}
                  <TableCell
                    align="center"
                    sx={{
                      ...kpiStyles.tableHeaderCell(
                        isMobile,
                        isMobile ? "80px" : "120px"
                      ),
                      backgroundColor: "#ffffff",
                      borderBottom: "none",
                    }}>
                    METRICS
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody
                sx={{
                  height: positionsList.length === 0 ? "100%" : "auto",
                }}>
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
                        {!isVerySmall && (
                          <TableCell>
                            <Skeleton animation="wave" height={30} />
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
                ) : error ? (
                  <TableRow>
                    <TableCell
                      colSpan={totalColumns}
                      align="center"
                      sx={kpiStyles.loadingCell}>
                      <Typography
                        color="error"
                        sx={kpiStyles.errorText(isMobile)}>
                        Error loading data: {getErrorMessage(error)}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : positionsList.length > 0 ? (
                  positionsList.map((position) => (
                    <TableRow
                      key={position?.id || Math.random()}
                      onClick={() => handleRowClick(position)}
                      sx={kpiStyles.tableRow(theme)}>
                      <TableCell align="left" sx={kpiStyles.idCell(isMobile)}>
                        {safelyDisplayValue(position?.id)}
                      </TableCell>
                      <TableCell sx={kpiStyles.positionCell(isMobile)}>
                        {getPositionName(position)}
                      </TableCell>
                      {!isVerySmall && (
                        <TableCell
                          sx={kpiStyles.superiorCell(
                            isMobile,
                            getSuperiorName(position) === "No superior assigned"
                          )}>
                          {getSuperiorName(position)}
                        </TableCell>
                      )}
                      <TableCell
                        align="center"
                        sx={kpiStyles.metricsCell(isMobile)}>
                        {renderMetricsIcon(position?.metrics)}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow
                    sx={{
                      "&:hover": {
                        backgroundColor: "transparent !important",
                        cursor: "default !important",
                      },
                    }}>
                    <TableCell
                      colSpan={999}
                      rowSpan={999}
                      align="center"
                      sx={{
                        borderBottom: "none",
                        height: "400px",
                        verticalAlign: "middle",
                        "&:hover": {
                          backgroundColor: "transparent !important",
                          cursor: "default !important",
                        },
                      }}>
                      <NoDataFound message="" subMessage={getNoDataMessage()} />
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <CustomTablePagination
            count={positionsData?.result?.total || 0}
            page={Math.max(0, page - 1)}
            rowsPerPage={rowsPerPage}
            onPageChange={handlePageChange}
            onRowsPerPageChange={handleRowsPerPageChange}
          />
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
            sx: kpiStyles.dialogPaper,
          }}>
          <DialogTitle>
            <Box sx={kpiStyles.dialogIconContainer}>
              <HelpIcon sx={kpiStyles.dialogIcon} />
            </Box>
            <Typography variant="h6" sx={kpiStyles.dialogTitle}>
              Confirmation
            </Typography>
          </DialogTitle>
          <DialogContent>
            <Typography
              variant="body1"
              gutterBottom
              sx={kpiStyles.dialogContent}>
              Are you sure you want to update KPIs for this position?
            </Typography>
            {selectedPositionForAction && (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ ...kpiStyles.dialogContent, ...kpiStyles.dialogSubtext }}>
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
            <Box sx={kpiStyles.dialogActions}>
              <Button
                onClick={() => setConfirmOpen(false)}
                variant="outlined"
                color="error"
                sx={kpiStyles.dialogButton}>
                Cancel
              </Button>
              <Button
                variant="contained"
                color="success"
                sx={kpiStyles.dialogButton}>
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
