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
  Chip,
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  useTheme,
  alpha,
} from "@mui/material";
import {
  Close as CloseIcon,
  Download as DownloadIcon,
} from "@mui/icons-material";
import NoDataGIF from "../../assets/no-data.gif";
import { useSnackbar } from "notistack";
import {
  useGetShowFileTypesEmpQuery,
  useDeleteFileTypesEmpMutation,
} from "../../features/api/employee/filesempApi";
import { useLazyGetSingleEmployeeQuery } from "../../features/api/employee/mainApi";
import EmployeeWizardForm from "../../components/modal/employee/multiFormModal/EmployeeWizardForm";
import "../../pages/GeneralStyle.scss";
import "../../pages/GeneralTable.scss";
import { CONSTANT } from "../../config/index";

const Files = ({
  searchQuery,
  showArchived,
  debounceValue,
  filters = {},
  isLoading: parentIsLoading = false,
}) => {
  const theme = useTheme();
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [employeeDetails, setEmployeeDetails] = useState(null);

  const [selectedEmployeeId, setSelectedEmployeeId] = useState(null);

  const [isEditMode, setIsEditMode] = useState(false);
  const [editEmployeeData, setEditEmployeeData] = useState(null);
  const [initialStep, setInitialStep] = useState(0);

  const [wizardOpen, setWizardOpen] = useState(false);
  const [wizardMode, setWizardMode] = useState("view");
  const [wizardInitialData, setWizardInitialData] = useState(null);

  const { enqueueSnackbar } = useSnackbar();

  const [getSingleEmployee] = useLazyGetSingleEmployeeQuery();

  React.useEffect(() => {
    setPage(1);
  }, [debounceValue, showArchived]);

  const queryParams = useMemo(() => {
    const params = {
      pagination: page,
      page: page,
      per_page: rowsPerPage,
    };

    if (debounceValue && debounceValue.trim()) {
      params.search = debounceValue;
    }

    if (filters?.status) {
      params.employment_status = filters.status;
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

    console.log("Files Query Params:", params);
    console.log("Filters object:", filters);

    return params;
  }, [debounceValue, page, rowsPerPage, filters]);

  const {
    data: apiResponse,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useGetShowFileTypesEmpQuery(queryParams, {
    refetchOnMountOrArgChange: true,
    skip: false,
  });

  const [deleteFile] = useDeleteFileTypesEmpMutation();

  const { employeeList, totalCount } = useMemo(() => {
    if (!apiResponse) {
      return { employeeList: [], totalCount: 0 };
    }

    let result;
    if (apiResponse.result) {
      result = apiResponse.result;
    } else if (apiResponse.data) {
      result = apiResponse.data;
    } else {
      result = apiResponse;
    }

    const data = Array.isArray(result) ? result : result?.data || [];

    const employeeMap = new Map();

    data.forEach((employeeRecord) => {
      const employee = employeeRecord.employee || employeeRecord;
      const employeeId = employee.id;

      if (!employeeMap.has(employeeId)) {
        employeeMap.set(employeeId, {
          employee: employee,
          files: [],
          file_count: 0,
        });
      }

      const employeeEntry = employeeMap.get(employeeId);

      if (employeeRecord.files && Array.isArray(employeeRecord.files)) {
        employeeRecord.files.forEach((file) => {
          const fileWithEmployee = {
            ...file,
            employee: employee,
            employee_id: employeeId,
          };
          employeeEntry.files.push(fileWithEmployee);
        });
      } else if (employeeRecord.file_type || employeeRecord.file_cabinet) {
        const fileWithEmployee = {
          ...employeeRecord,
          employee: employee,
          employee_id: employeeId,
        };
        employeeEntry.files.push(fileWithEmployee);
      }

      employeeEntry.file_count = employeeEntry.files.length;
    });

    const combinedEmployees = Array.from(employeeMap.values());
    const total = result?.total || result?.count || combinedEmployees.length;

    return {
      employeeList: combinedEmployees,
      totalCount: total,
    };
  }, [apiResponse]);

  const openWizard = useCallback(
    async (employeeRecord, mode) => {
      try {
        const response = await getSingleEmployee(
          employeeRecord?.employee?.id,
          true
        ).unwrap();

        setWizardInitialData(response?.result);
        setWizardMode(mode);
        setWizardOpen(true);
      } catch (error) {
        enqueueSnackbar("Failed to load employee details", {
          variant: "error",
          autoHideDuration: 2000,
        });
      }
    },
    [getSingleEmployee, enqueueSnackbar]
  );

  React.useEffect(() => {
    if (selectedEmployeeId && employeeList.length > 0) {
      const selectedEmployee = employeeList.find(
        (emp) => emp.employee?.id === selectedEmployeeId
      );
      if (selectedEmployee) {
        openWizard(selectedEmployee, "view");
      }
    }
  }, [selectedEmployeeId, employeeList, openWizard]);

  const handleRowClick = useCallback(
    (employeeRecord) => {
      if (employeeRecord.employee?.id) {
        setSelectedEmployeeId(employeeRecord.employee.id);
      } else {
        enqueueSnackbar("No employee data found for this record", {
          variant: "warning",
          autoHideDuration: 3000,
        });
      }
    },
    [enqueueSnackbar]
  );

  const handleEditEmployee = useCallback((employeeData, editStep = 8) => {
    setSelectedEmployeeId(null);

    setIsEditMode(true);
    setEditEmployeeData(employeeData);
    setInitialStep(editStep);
  }, []);

  const handleWizardClose = useCallback(() => {
    setWizardOpen(false);
    setSelectedEmployeeId(null);
    setWizardInitialData(null);
    setWizardMode("view");
  }, []);

  const handleWizardSubmit = useCallback(
    async (formData) => {
      try {
        enqueueSnackbar("Employee updated successfully!", {
          variant: "success",
          autoHideDuration: 3000,
        });
        refetch();
        handleWizardClose();
      } catch (error) {
        enqueueSnackbar("Failed to update employee. Please try again.", {
          variant: "error",
          autoHideDuration: 3000,
        });
      }
    },
    [enqueueSnackbar, refetch, handleWizardClose]
  );

  const handleDetailsDialogClose = () => {
    setDetailsDialogOpen(false);
    setEmployeeDetails(null);
  };

  const handleDownloadFile = async (file) => {
    if (!file.file_attachment) {
      enqueueSnackbar("No file attachment available for download", {
        variant: "error",
        autoHideDuration: 3000,
      });
      return;
    }

    try {
      const fileUrl = getFileAttachmentUrl(file.file_attachment);

      const link = document.createElement("a");
      link.href = fileUrl;

      const fileName = file.file_attachment.split("/").pop() || "download";
      link.download = fileName;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      enqueueSnackbar("File download started", {
        variant: "success",
        autoHideDuration: 2000,
      });
    } catch (error) {
      enqueueSnackbar("Failed to download file. Please try again.", {
        variant: "error",
        autoHideDuration: 3000,
      });
    }
  };

  const safelyDisplayValue = (value) =>
    value === null || value === undefined ? "N/A" : String(value);

  const formatEmployeeName = (employee) => {
    if (!employee) return "N/A";

    return (
      employee.full_name ||
      employee.name ||
      employee.first_name ||
      `${employee.first_name} ${employee.last_name}`.trim() ||
      employee.display_name ||
      "N/A"
    );
  };

  const formatFileType = (fileType) => {
    if (!fileType) return "N/A";

    if (typeof fileType === "string") return fileType;
    if (typeof fileType === "object") {
      return fileType.name || fileType.type || fileType.title || "N/A";
    }

    return "N/A";
  };

  const formatFileCabinet = (fileCabinet) => {
    if (!fileCabinet) return "N/A";

    if (typeof fileCabinet === "string") return fileCabinet;
    if (typeof fileCabinet === "object") {
      return (
        fileCabinet.name || fileCabinet.cabinet || fileCabinet.title || "N/A"
      );
    }

    return "N/A";
  };

  const getFileAttachmentUrl = (attachment) => {
    if (!attachment) return null;
    return `${import.meta.env.VITE_API_BASE_URL}/${attachment}`;
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

  const displayList = employeeList;
  const displayCount = totalCount;

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
                <TableCell className="table-header">FILE COUNT</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isFetching ? (
                <TableRow>
                  <TableCell colSpan={3} align="center">
                    <Box sx={{ py: 4 }}>
                      <CircularProgress size={32} />
                      <Typography variant="body2" sx={{ mt: 2 }}>
                        Loading files...
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={3} align="center" className="table-cell">
                    <Typography color="error">
                      Error: {error?.data?.message || "Failed to load data"}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : displayList.length > 0 ? (
                displayList.map((employeeRecord) => {
                  return (
                    <TableRow
                      key={employeeRecord.employee.id}
                      onClick={() => handleRowClick(employeeRecord)}
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
                          width: "400px",
                          minWidth: "400px",
                        }}>
                        <Box>
                          <Typography
                            sx={{
                              fontWeight: 500,
                              fontSize: "0.875rem",
                              lineHeight: 1.4,
                            }}>
                            {formatEmployeeName(employeeRecord.employee)}
                          </Typography>
                          <Typography
                            sx={{
                              fontSize: "0.75rem",
                              color: "text.secondary",
                              lineHeight: 1.2,
                              mt: 0.3,
                            }}>
                            {safelyDisplayValue(
                              employeeRecord.employee?.employee_code
                            )}
                          </Typography>
                          <Box sx={{ mt: 0.5 }}>
                            <Chip
                              label={
                                employeeRecord.employee?.status === "ACTIVE"
                                  ? "ACTIVE"
                                  : "INACTIVE"
                              }
                              color={
                                employeeRecord.employee?.status === "ACTIVE"
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
                          width: "640px",
                          minWidth: "640px",
                          paddingY: 1.5,
                        }}>
                        <Box>
                          {formatCharging(
                            employeeRecord.employee?.charging
                          ).map((item, index) => (
                            <Typography
                              key={index}
                              sx={{
                                fontSize: "0.75rem",
                                lineHeight: 1.4,
                                color: "text.primary",
                              }}>
                              ({item.code}) - {item.name}
                            </Typography>
                          ))}
                          {formatCharging(employeeRecord.employee?.charging)
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
                      <TableCell className="table-cell">
                        {employeeRecord.file_count}
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={3}
                    align="center"
                    sx={{ border: "none", py: 8 }}>
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 2,
                      }}>
                      {CONSTANT?.BUTTONS?.NODATA?.icon || (
                        <>
                          <img
                            src={NoDataGIF}
                            alt="No data"
                            style={{ width: 150 }}
                          />
                        </>
                      )}
                      <Typography variant="h6" color="text.secondary">
                        No files found
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {debounceValue && debounceValue.trim() !== ""
                          ? `No results for "${debounceValue}"`
                          : Object.values(filters).some(
                              (v) => v && v !== "ACTIVE"
                            )
                          ? `No files with selected filters`
                          : "No files"}
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
            count={displayCount}
            rowsPerPage={rowsPerPage}
            page={page - 1}
            onPageChange={(event, newPage) => setPage(newPage + 1)}
            onRowsPerPageChange={(event) => {
              setRowsPerPage(parseInt(event.target.value, 10));
              setPage(1);
            }}
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

      <EmployeeWizardForm
        open={wizardOpen}
        onClose={handleWizardClose}
        initialData={wizardInitialData}
        mode={wizardMode}
        onSubmit={handleWizardSubmit}
        initialStep={7}
      />

      <Dialog
        open={detailsDialogOpen}
        onClose={handleDetailsDialogClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            minHeight: "400px",
            maxHeight: "90vh",
          },
        }}>
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            pb: 2,
            color: "rgb(33, 61, 112)",
            fontWeight: "bold",
          }}>
          <Typography variant="h6" component="div">
            EMPLOYEE FILES DETAILS
          </Typography>
          <IconButton
            onClick={handleDetailsDialogClose}
            sx={{
              color: "grey.500",
              "&:hover": {
                backgroundColor: "grey.100",
              },
            }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ maxHeight: "70vh", overflowY: "auto" }}>
          {employeeDetails && (
            <Box sx={{ display: "flex", flexDirection: "column" }}>
              <Box sx={{ mb: 2 }}>
                <Typography>
                  <strong>Employee:</strong>{" "}
                  {formatEmployeeName(employeeDetails.employee)} (
                  {safelyDisplayValue(employeeDetails.employee?.employee_code)})
                </Typography>
              </Box>

              <Box>
                {employeeDetails.files.length > 0 ? (
                  <Box
                    sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    {employeeDetails.files.map((file, index) => (
                      <Box
                        key={file.id || index}
                        sx={{ border: "1px solid #e0e0e0", borderRadius: 1 }}>
                        <Box
                          sx={{
                            backgroundColor: "#f8f9fa",
                            p: 2,
                            borderBottom: "1px solid #e0e0e0",
                            display: "flex",
                            alignItems: "center",
                            gap: 2,
                          }}>
                          <Typography variant="subtitle2" fontWeight="bold">
                            File #{file.id || index + 1}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {formatFileType(file.file_type)}
                          </Typography>
                          {file.deleted_at && (
                            <Chip label="ARCHIVED" color="error" size="small" />
                          )}
                        </Box>
                        <Box sx={{ p: 2 }}>
                          <Box
                            sx={{
                              display: "flex",
                              flexDirection: "column",
                              gap: 2,
                            }}>
                            <Box
                              sx={{
                                display: "grid",
                                gridTemplateColumns: "1fr 1fr",
                                gap: 2,
                              }}>
                              <Typography
                                variant="body2"
                                color="text.secondary">
                                <strong>File Type:</strong>{" "}
                                {formatFileType(file.file_type)}
                              </Typography>
                              <Typography
                                variant="body2"
                                color="text.secondary">
                                <strong>File Type Code:</strong>{" "}
                                {file.file_type?.code || "N/A"}
                              </Typography>
                              <Typography
                                variant="body2"
                                color="text.secondary">
                                <strong>Cabinet:</strong>{" "}
                                {formatFileCabinet(file.file_cabinet)}
                              </Typography>
                              <Typography
                                variant="body2"
                                color="text.secondary">
                                <strong>Cabinet Code:</strong>{" "}
                                {file.file_cabinet?.code || "N/A"}
                              </Typography>
                            </Box>

                            <Typography variant="body2" color="text.secondary">
                              <strong>Description:</strong>{" "}
                              {file.file_description ||
                                "No description available"}
                            </Typography>

                            <Box>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                                gutterBottom>
                                <strong>File Attachment:</strong>
                              </Typography>
                              {file.file_attachment ? (
                                <Box
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 2,
                                    flexWrap: "wrap",
                                  }}>
                                  <Button
                                    variant="contained"
                                    color="primary"
                                    size="small"
                                    href={getFileAttachmentUrl(
                                      file.file_attachment
                                    )}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    sx={{ textTransform: "none" }}>
                                    View File
                                  </Button>
                                  <Button
                                    variant="contained"
                                    size="small"
                                    onClick={() => handleDownloadFile(file)}
                                    startIcon={<DownloadIcon />}
                                    sx={{
                                      textTransform: "none",
                                      backgroundColor: "rgb(98, 141, 11)",
                                      "&:hover": {
                                        backgroundColor: "rgb(134, 182, 46)",
                                      },
                                    }}>
                                    Download
                                  </Button>
                                  <Typography
                                    variant="body2"
                                    color="text.secondary">
                                    {file.file_attachment.split("/").pop() ||
                                      "Attached file"}
                                  </Typography>
                                </Box>
                              ) : (
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                  sx={{ fontStyle: "italic" }}>
                                  No file attachment available
                                </Typography>
                              )}
                            </Box>
                          </Box>
                        </Box>
                      </Box>
                    ))}
                  </Box>
                ) : (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ fontStyle: "italic" }}>
                    No files available for this employee.
                  </Typography>
                )}
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={handleDetailsDialogClose}
            variant="outlined"
            sx={{ textTransform: "none" }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Files;
