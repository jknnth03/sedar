import React, { useState, useMemo, useCallback } from "react";
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
  IconButton,
  Menu,
  MenuItem,
  Box,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Link,
  useTheme,
  alpha,
} from "@mui/material";
import {
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  AttachFile as AttachFileIcon,
  Download as DownloadIcon,
  Close as CloseIcon,
  Help as HelpIcon,
  Archive as ArchiveIcon,
  Restore as RestoreIcon,
  Visibility as VisibilityIcon,
} from "@mui/icons-material";
import { useSnackbar } from "notistack";
import {
  useGetAttainmentsQuery,
  useDeleteAttainmentMutation,
} from "../../features/api/employee/attainmentsempApi";
import "../../pages/GeneralStyle.scss";
import "../../pages/GeneralTable.scss";
import { CONSTANT } from "../../config/index";
import { useRememberQueryParams } from "../../hooks/useRememberQueryParams";
import EmployeeWizardForm from "../../components/modal/employee/multiFormModal/EmployeeWizardForm";
import { useLazyGetSingleEmployeeQuery } from "../../features/api/employee/mainApi";
import AttainmentDialog from "./AttainmentDialog";

const Attainmentsemp = ({
  searchQuery: parentSearchQuery,
  debounceValue: parentDebounceValue,
  onSearchChange,
  filters = {},
  isLoading: parentIsLoading = false,
}) => {
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();

  const [currentParams, setQueryParams, removeQueryParams] =
    useRememberQueryParams();
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const searchQuery =
    parentSearchQuery !== undefined
      ? parentSearchQuery
      : currentParams?.q ?? "";
  const debounceValue =
    parentDebounceValue !== undefined ? parentDebounceValue : searchQuery;

  const [menuAnchor, setMenuAnchor] = useState({});
  const [getSingleEmployee] = useLazyGetSingleEmployeeQuery();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedAttainment, setSelectedAttainment] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const [attainmentDialogOpen, setAttainmentDialogOpen] = useState(false);

  const [wizardOpen, setWizardOpen] = useState(false);
  const [wizardMode, setWizardMode] = useState("create");
  const [wizardInitialData, setWizardInitialData] = useState(null);

  const queryParams = useMemo(() => {
    const params = {
      pagination: page,
      page: page,
      per_page: rowsPerPage,
      status: "all",
    };

    if (debounceValue && debounceValue.trim()) {
      params.search = debounceValue;
    }

    if (filters?.name) {
      params.employee_name = filters.name;
    }

    if (filters?.team) {
      params.team_name = filters.team;
    }

    if (filters?.idNumber) {
      params.id_number = filters.idNumber;
    }

    if (filters?.dateHiredFrom) {
      params.date_hired_from = filters.dateHiredFrom;
    }

    if (filters?.dateHiredTo) {
      params.date_hired_to = filters.dateHiredTo;
    }

    if (filters?.type) {
      params.employment_type = filters.type;
    }

    if (filters?.department) {
      params.department_name = filters.department;
    }

    if (filters?.manpower) {
      params.manpower_form = filters.manpower;
    }

    if (filters?.position) {
      params.position_title = filters.position;
    }

    return params;
  }, [debounceValue, page, rowsPerPage, filters]);

  const {
    data: apiResponse,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useGetAttainmentsQuery(queryParams, {
    refetchOnMountOrArgChange: true,
    skip: false,
  });

  const [deleteAttainment] = useDeleteAttainmentMutation();

  const attainmentList = useMemo(() => {
    if (!apiResponse) return [];

    let result;
    if (apiResponse.result) {
      result = apiResponse.result;
    } else if (apiResponse.data) {
      result = apiResponse.data;
    } else {
      result = apiResponse;
    }

    return Array.isArray(result) ? result : result?.data || [];
  }, [apiResponse]);

  const totalCount = useMemo(() => {
    if (!apiResponse) return 0;

    let result;
    if (apiResponse.result) {
      result = apiResponse.result;
    } else if (apiResponse.data) {
      result = apiResponse.data;
    } else {
      result = apiResponse;
    }

    return result?.total || result?.count || 0;
  }, [apiResponse]);

  const getDisplayFileName = (attainment) => {
    if (attainment.attainment_attachment_filename) {
      return attainment.attainment_attachment_filename;
    }

    if (attainment.attainment_attachment) {
      try {
        const urlParts = attainment.attainment_attachment.split("/");
        const filename = urlParts[urlParts.length - 1];
        return decodeURIComponent(filename);
      } catch (error) {
        return attainment.attainment_attachment;
      }
    }

    return null;
  };

  const handleSearchChange = useCallback(
    (event) => {
      const value = event.target.value;

      if (onSearchChange) {
        onSearchChange(value);
      } else {
        if (value.trim()) {
          setQueryParams({ q: value });
        } else {
          removeQueryParams(["q"]);
        }
      }

      setPage(1);
    },
    [onSearchChange, setQueryParams, removeQueryParams]
  );

  const handleMenuOpen = useCallback((event, attainmentId) => {
    event.stopPropagation();
    setMenuAnchor((prev) => ({ ...prev, [attainmentId]: event.currentTarget }));
  }, []);

  const handleMenuClose = useCallback((attainmentId) => {
    setMenuAnchor((prev) => ({ ...prev, [attainmentId]: null }));
  }, []);

  const handleArchiveRestoreClick = useCallback(
    (attainment, event) => {
      if (event) {
        event.stopPropagation();
      }
      setSelectedAttainment(attainment);
      setConfirmOpen(true);
      handleMenuClose(attainment.id);
    },
    [handleMenuClose]
  );

  const handleArchiveRestoreConfirm = async () => {
    if (!selectedAttainment) return;
    try {
      await deleteAttainment(selectedAttainment.id).unwrap();
      enqueueSnackbar(
        selectedAttainment.deleted_at
          ? "Attainment restored successfully!"
          : "Attainment archived successfully!",
        { variant: "success", autoHideDuration: 2000 }
      );
      refetch();
    } catch (error) {
      enqueueSnackbar(
        error?.data?.message || "Action failed. Please try again.",
        {
          variant: "error",
          autoHideDuration: 2000,
        }
      );
    } finally {
      setConfirmOpen(false);
      setSelectedAttainment(null);
    }
  };

  const openWizard = useCallback(
    async (attainment, mode) => {
      try {
        const response = await getSingleEmployee(
          attainment?.employee?.id,
          true
        ).unwrap();

        setWizardInitialData(response?.result);
        setWizardMode(mode);
        setWizardOpen(true);
      } catch (error) {
        console.error("Error loading employee details:", error);
        enqueueSnackbar("Failed to load employee details", {
          variant: "error",
          autoHideDuration: 2000,
        });
      }
    },
    [getSingleEmployee, enqueueSnackbar]
  );

  const handleViewEmployee = useCallback(
    async (attainment, event) => {
      if (event) event.stopPropagation();
      handleMenuClose(attainment.id);
      await openWizard(attainment, "view");
    },
    [handleMenuClose, openWizard]
  );

  const handleEditEmployee = useCallback(
    async (attainment, event) => {
      if (event) event.stopPropagation();
      handleMenuClose(attainment.id);
      await openWizard(attainment, "edit");
    },
    [handleMenuClose, openWizard]
  );

  const handleRowClick = useCallback(
    async (attainment) => {
      await openWizard(attainment, "view");
    },
    [openWizard]
  );

  const handleWizardClose = useCallback(() => {
    setWizardOpen(false);
    setWizardMode("create");
    setWizardInitialData(null);
  }, []);

  const handleWizardSubmit = useCallback(
    async (data, mode, result) => {
      await refetch();
      enqueueSnackbar(
        `Employee ${mode === "create" ? "created" : "updated"} successfully!`,
        { variant: "success", autoHideDuration: 3000 }
      );
    },
    [refetch, enqueueSnackbar]
  );

  const handleAddAttainment = () => {
    setSelectedAttainment(null);
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setSelectedAttainment(null);
  };

  const handleModalSuccess = () => {
    refetch();
    handleModalClose();
  };

  const handleOpenAttainmentDialog = (attainment) => {
    setSelectedAttainment(attainment);
    setAttainmentDialogOpen(true);
  };

  const handleCloseAttainmentDialog = () => {
    setSelectedAttainment(null);
    setAttainmentDialogOpen(false);
  };

  const handlePageChange = useCallback((event, newPage) => {
    setPage(newPage + 1);
  }, []);

  const handleRowsPerPageChange = useCallback((event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(1);
  }, []);

  const safelyDisplayValue = useCallback(
    (value) => (value === null || value === undefined ? "N/A" : String(value)),
    []
  );

  const formatEmployeeName = useCallback((employee) => {
    if (!employee) return "N/A";
    if (employee?.full_name) return employee.full_name;

    const parts = [
      employee?.last_name,
      employee?.first_name,
      employee?.middle_name,
    ].filter(Boolean);

    return parts.length > 0 ? parts.join(", ") : "N/A";
  }, []);

  const formatAcademicYears = (yearFrom, yearTo) => {
    const from = safelyDisplayValue(yearFrom);
    const to = safelyDisplayValue(yearTo);
    if (from === "N/A" && to === "N/A") return "N/A";
    return `${from} - ${to}`;
  };

  const formatNestedValue = (obj, field) => {
    if (typeof obj === "object" && obj?.[field]) {
      return obj[field];
    }
    if (typeof obj === "object" && obj?.name) {
      return obj.name;
    }
    return safelyDisplayValue(obj);
  };

  const formatAttainmentName = (attainment, attainmentId) => {
    if (attainment && typeof attainment === "object") {
      return (
        attainment.attainment_name ||
        attainment.name ||
        attainment.title ||
        attainment.display_name ||
        `Attainment ${attainmentId}`
      );
    }

    if (typeof attainment === "string" && attainment.trim() !== "") {
      return attainment;
    }

    return attainmentId ? `Attainment ${attainmentId}` : "N/A";
  };

  const formatCharging = useCallback((charging) => {
    if (!charging) return [];

    const chargingData = [
      { code: charging.code, name: charging.name },
      { code: charging.company_code, name: charging.company_name },
      { code: charging.business_unit_code, name: charging.business_unit_name },
      { code: charging.department_code, name: charging.department_name },
      { code: charging.unit_code, name: charging.unit_name },
      { code: charging.sub_unit_code, name: charging.sub_unit_name },
      { code: charging.location_code, name: charging.location_name },
    ];

    return chargingData.filter((item) => item.code && item.name);
  }, []);

  return (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        minHeight: 0,
      }}>
      <Paper
        className="container"
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          minHeight: 0,
          borderRadius: 2,
        }}>
        <TableContainer
          className="table-container"
          sx={{
            flex: 1,
            overflowX: "auto",
            overflowY: "auto",
            width: "100%",
            maxWidth: "100%",
            minHeight: 0,
          }}>
          <Table stickyHeader sx={{ minWidth: 1400, width: "max-content" }}>
            <TableHead>
              <TableRow>
                <TableCell className="table-header">EMPLOYEE</TableCell>
                <TableCell className="table-header">CHARGING</TableCell>
                <TableCell className="table-header2">ATTAINMENT</TableCell>
                <TableCell className="table-header">PROGRAM</TableCell>
                <TableCell className="table-header">DEGREE</TableCell>
                <TableCell className="table-header">HONOR TITLE</TableCell>
                <TableCell className="table-header">ACADEMIC YEARS</TableCell>
                <TableCell className="table-header">GPA</TableCell>
                <TableCell className="table-header">INSTITUTION</TableCell>
                <TableCell className="table-header">ATTACHMENT</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isFetching ? (
                <TableRow>
                  <TableCell colSpan={10} align="center">
                    <Box sx={{ py: 4 }}>
                      <CircularProgress size={32} />
                      <Typography variant="body2" sx={{ mt: 2 }}>
                        Loading attainments...
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={10} align="center" className="table-cell">
                    <Typography color="error">
                      Error: {error?.data?.message || "Failed to load data"}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : attainmentList.length > 0 ? (
                attainmentList.map((attainment) => (
                  <TableRow
                    key={attainment.id}
                    onClick={() => handleRowClick(attainment)}
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
                      className="table-cell"
                      sx={{
                        width: "280px",
                        minWidth: "250px",
                      }}>
                      <Box>
                        <Typography
                          sx={{
                            fontWeight: 500,
                            fontSize: "0.875rem",
                            lineHeight: 1.4,
                          }}>
                          {formatEmployeeName(attainment.employee)}
                        </Typography>
                        <Typography
                          sx={{
                            fontSize: "0.75rem",
                            color: "text.secondary",
                            lineHeight: 1.2,
                            mt: 0.3,
                          }}>
                          {safelyDisplayValue(
                            attainment.employee?.employee_code
                          )}
                        </Typography>
                        <Box sx={{ mt: 0.5 }}>
                          <Chip
                            label={
                              attainment.employee?.status === "ACTIVE"
                                ? "ACTIVE"
                                : "INACTIVE"
                            }
                            color={
                              attainment.employee?.status === "ACTIVE"
                                ? "success"
                                : "error"
                            }
                            size="small"
                            variant="outlined"
                            sx={{
                              height: "18px",
                              "& .MuiChip-label": {
                                fontSize: "0.65rem",
                                fontWeight: 600,
                                paddingX: "6px",
                              },
                            }}
                          />
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell
                      sx={{
                        width: "350px",
                        minWidth: "300px",
                        paddingY: 1.5,
                      }}>
                      <Box>
                        {formatCharging(attainment.employee?.charging).map(
                          (item, index) => (
                            <Typography
                              key={index}
                              sx={{
                                fontSize: "0.75rem",
                                lineHeight: 1.4,
                                color: "text.primary",
                              }}>
                              ({item.code}) - {item.name}
                            </Typography>
                          )
                        )}
                        {formatCharging(attainment.employee?.charging)
                          .length === 0 && (
                          <Typography
                            sx={{
                              fontSize: "0.75rem",
                              color: "text.secondary",
                            }}>
                            N/A
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell
                      sx={{
                        width: "300px",
                        minWidth: "300px",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}>
                      {formatAttainmentName(
                        attainment.attainment,
                        attainment.attainment_id
                      )}
                    </TableCell>
                    <TableCell className="table-cell">
                      {formatNestedValue(attainment.program)}
                    </TableCell>
                    <TableCell className="table-cell">
                      {formatNestedValue(attainment.degree)}
                    </TableCell>
                    <TableCell className="table-cell">
                      {formatNestedValue(attainment.honor_title)}
                    </TableCell>
                    <TableCell className="table-cell">
                      {formatAcademicYears(
                        attainment.academic_year_from,
                        attainment.academic_year_to
                      )}
                    </TableCell>
                    <TableCell className="table-cell">
                      {safelyDisplayValue(attainment.gpa)}
                    </TableCell>
                    <TableCell className="table-cell">
                      {safelyDisplayValue(attainment.institution)}
                    </TableCell>

                    <TableCell className="table-cell2">
                      {attainment.attainment_attachment ? (
                        <Link
                          component="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            handleOpenAttainmentDialog(attainment);
                          }}
                          underline="hover"
                          sx={{
                            color: "primary.main",
                            fontWeight: 500,
                            display: "block",
                            maxWidth: "150px",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            textAlign: "left",
                            border: "none",
                            background: "none",
                            cursor: "pointer",
                            padding: 0,
                            font: "inherit",
                          }}>
                          {getDisplayFileName(attainment)}
                        </Link>
                      ) : (
                        "N/A"
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={10}
                    align="center"
                    sx={{ border: "none", py: 8 }}>
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 2,
                      }}>
                      {CONSTANT.BUTTONS.NODATA.icon}
                      <Typography variant="h6" color="text.secondary">
                        No attainments found
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {searchQuery
                          ? `No results for "${searchQuery}"`
                          : Object.values(filters).some(
                              (v) => v && v !== "ACTIVE"
                            )
                          ? `No attainments with selected filters`
                          : "No attainments"}
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <Box sx={{ flexShrink: 0 }}>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25, 50, 100]}
            component="div"
            count={totalCount}
            rowsPerPage={rowsPerPage}
            page={page - 1}
            onPageChange={handlePageChange}
            onRowsPerPageChange={handleRowsPerPageChange}
            sx={{
              borderTop: `1px solid ${theme.palette.divider}`,
              backgroundColor: alpha(theme.palette.background.paper, 0.6),
              minHeight: "52px",
              "& .MuiTablePagination-toolbar": {
                paddingLeft: theme.spacing(2),
                paddingRight: theme.spacing(1),
              },
              "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows":
                {
                  margin: 0,
                  fontSize: "0.875rem",
                },
            }}
          />
        </Box>
      </Paper>

      <AttainmentDialog
        open={attainmentDialogOpen}
        onClose={handleCloseAttainmentDialog}
        attainment={selectedAttainment}
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
          <Typography variant="h6" align="center" gutterBottom>
            Confirm Action
          </Typography>
          <Typography variant="body2" align="center" color="text.secondary">
            Are you sure you want to{" "}
            {selectedAttainment?.deleted_at ? "restore" : "archive"} this
            attainment?
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" align="center">
            {selectedAttainment?.deleted_at
              ? "This will restore the attainment and make it active again."
              : "This will archive the attainment and remove it from the active list."}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: "center", pb: 3, gap: 1 }}>
          <Button
            onClick={() => setConfirmOpen(false)}
            variant="outlined"
            color="inherit"
            sx={{ minWidth: 100 }}>
            Cancel
          </Button>
          <Button
            onClick={handleArchiveRestoreConfirm}
            variant="contained"
            color={selectedAttainment?.deleted_at ? "success" : "warning"}
            sx={{ minWidth: 100 }}>
            {selectedAttainment?.deleted_at ? "Restore" : "Archive"}
          </Button>
        </DialogActions>
      </Dialog>

      <EmployeeWizardForm
        open={wizardOpen}
        onClose={handleWizardClose}
        initialData={wizardInitialData}
        mode={wizardMode}
        onSubmit={handleWizardSubmit}
        initialStep={4}
      />
    </Box>
  );
};

export default Attainmentsemp;
