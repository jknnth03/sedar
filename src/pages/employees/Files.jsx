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

const Files = ({ searchQuery, showArchived, debounceValue }) => {
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

  // Add the lazy query hook
  const [getSingleEmployee] = useLazyGetSingleEmployeeQuery();

  React.useEffect(() => {
    setPage(1);
  }, [debounceValue, showArchived]);

  const queryParams = useMemo(() => {
    const params = {
      page,
      per_page: rowsPerPage,
      status: showArchived ? "inactive" : "active",
    };

    if (debounceValue && debounceValue.trim() !== "") {
      params.search = debounceValue.trim();
    }

    return params;
  }, [page, rowsPerPage, showArchived, debounceValue]);

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

  // Move employeeList definition before the useEffect that uses it
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
  }, [apiResponse, debounceValue]);

  // Remove the old useEffect and replace with the new openWizard function
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

  // Now this useEffect can safely access employeeList
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
    value === null || value === undefined ? "—" : String(value);

  const formatEmployeeName = (employee) => {
    if (!employee) return "—";

    return (
      employee.full_name ||
      employee.name ||
      employee.first_name ||
      `${employee.first_name} ${employee.last_name}`.trim() ||
      employee.display_name ||
      "—"
    );
  };

  const formatFileType = (fileType) => {
    if (!fileType) return "—";

    if (typeof fileType === "string") return fileType;
    if (typeof fileType === "object") {
      return fileType.name || fileType.type || fileType.title || "—";
    }

    return "—";
  };

  const formatFileCabinet = (fileCabinet) => {
    if (!fileCabinet) return "—";

    if (typeof fileCabinet === "string") return fileCabinet;
    if (typeof fileCabinet === "object") {
      return (
        fileCabinet.name || fileCabinet.cabinet || fileCabinet.title || "—"
      );
    }

    return "—";
  };

  const getFileAttachmentUrl = (attachment) => {
    if (!attachment) return null;
    return `${import.meta.env.VITE_API_BASE_URL}/${attachment}`;
  };

  const filteredEmployeeList = useMemo(() => {
    if (!debounceValue || debounceValue.trim() === "") {
      return employeeList;
    }

    const searchTerm = debounceValue.toLowerCase().trim();
    return employeeList.filter((employeeRecord) => {
      const employeeName = formatEmployeeName(
        employeeRecord.employee
      ).toLowerCase();
      const employeeCode = (
        employeeRecord.employee?.employee_code || ""
      ).toLowerCase();
      const employeeId = (employeeRecord.employee?.id || "")
        .toString()
        .toLowerCase();

      const fileMatches = employeeRecord.files.some((file) => {
        const fileType = formatFileType(file.file_type).toLowerCase();
        const fileCabinet = formatFileCabinet(file.file_cabinet).toLowerCase();
        const description = (file.file_description || "").toLowerCase();
        const fileId = (file.id || "").toString().toLowerCase();

        return (
          fileType.includes(searchTerm) ||
          fileCabinet.includes(searchTerm) ||
          description.includes(searchTerm) ||
          fileId.includes(searchTerm)
        );
      });

      return (
        employeeName.includes(searchTerm) ||
        employeeCode.includes(searchTerm) ||
        employeeId.includes(searchTerm) ||
        fileMatches
      );
    });
  }, [employeeList, debounceValue]);

  const displayList = filteredEmployeeList;
  const displayCount =
    debounceValue && debounceValue.trim() !== ""
      ? filteredEmployeeList.length
      : totalCount;

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
          <Table stickyHeader sx={{ width: "100%", minWidth: "800px" }}>
            <TableHead>
              <TableRow>
                <TableCell
                  className="table-id"
                  sx={{ minWidth: 80, width: 80, whiteSpace: "nowrap" }}>
                  ID
                </TableCell>
                <TableCell
                  className="table-header"
                  sx={{
                    width: "250px",
                    minWidth: "200px",
                  }}>
                  EMPLOYEE NAME
                </TableCell>
                <TableCell
                  className="table-header"
                  sx={{
                    width: "120px",
                    minWidth: "100px",
                    textAlign: "center",
                  }}>
                  FILE COUNT
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isFetching ? (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    <CircularProgress size={24} />
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={4} align="center" className="table-cell">
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
                          backgroundColor: "#f5f5f5",
                          "& .MuiTableCell-root": {
                            backgroundColor: "transparent",
                          },
                        },
                        transition: "background-color 0.2s ease",
                      }}>
                      <TableCell
                        className="table-cell-id"
                        sx={{ whiteSpace: "nowrap" }}>
                        {safelyDisplayValue(employeeRecord.employee.id)}
                      </TableCell>
                      <TableCell
                        className="table-cell"
                        sx={{
                          width: "250px",
                          minWidth: "200px",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}>
                        {formatEmployeeName(employeeRecord.employee)}
                      </TableCell>
                      <TableCell
                        className="table-cell"
                        sx={{
                          width: "120px",
                          minWidth: "100px",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          textAlign: "center",
                          fontWeight: "bold",
                          color:
                            employeeRecord.file_count > 0
                              ? "primary.main"
                              : "text.secondary",
                        }}>
                        {employeeRecord.file_count}
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    align="center"
                    sx={{ borderBottom: "none" }}
                    className="table-cell">
                    {CONSTANT?.BUTTONS?.NODATA?.icon || (
                      <>
                        <img
                          src={NoDataGIF}
                          alt="No data"
                          style={{ width: 150 }}
                        />
                        <Typography
                          variant="body2"
                          color="textSecondary"
                          sx={{ mt: 1 }}>
                          {debounceValue && debounceValue.trim() !== ""
                            ? `No employees found for "${debounceValue}"`
                            : showArchived
                            ? "No archived employees found."
                            : "No active employees found."}
                        </Typography>
                      </>
                    )}
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
            page={Math.min(
              page - 1,
              Math.max(0, Math.ceil(displayCount / rowsPerPage) - 1)
            )}
            onPageChange={(event, newPage) => setPage(newPage + 1)}
            onRowsPerPageChange={(event) => {
              setRowsPerPage(parseInt(event.target.value, 10));
              setPage(1);
            }}
            sx={{
              borderTop: "1px solid #e0e0e0",
              backgroundColor: "#fafafa",
              minHeight: "52px",
            }}
            labelDisplayedRows={({ from, to, count }) => {
              if (debounceValue && debounceValue.trim() !== "") {
                return `${from}-${to} of ${count} (filtered)`;
              }
              return `${from}-${to} of ${count}`;
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
            color: "rgb(33, 61, 112) ",
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
                  <strong>Employee Code:</strong>{" "}
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
                                {file.file_type?.code || "—"}
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
                                {file.file_cabinet?.code || "—"}
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
