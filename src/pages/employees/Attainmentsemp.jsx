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
} from "@mui/material";
import {
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  AttachFile as AttachFileIcon,
  Download as DownloadIcon,
  Close as CloseIcon,
  Help as HelpIcon,
} from "@mui/icons-material";
import { useSnackbar } from "notistack";
import ViewEmployeeModal from "../../components/modal/employee/ViewEmployeeModal";
import MultiFormModal from "../../components/modal/employee/MultiFormModal";
import {
  useGetAttainmentsQuery,
  useDeleteAttainmentMutation,
} from "../../features/api/employee/attainmentsempApi";
import { useGetAllShowAttainmentsQuery } from "../../features/api/extras/attainmentsApi";
import "../../pages/GeneralStyle.scss";
import "../../pages/GeneralTable.scss";
import { CONSTANT } from "../../config/index";

const Attainmentsemp = ({ searchQuery, showArchived, debounceValue }) => {
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [menuAnchor, setMenuAnchor] = useState({});
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedAttainment, setSelectedAttainment] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(null);

  const [multiFormModalOpen, setMultiFormModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editEmployeeData, setEditEmployeeData] = useState(null);
  const [initialStep, setInitialStep] = useState(0);

  const { enqueueSnackbar } = useSnackbar();

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
  } = useGetAttainmentsQuery(queryParams, {
    refetchOnMountOrArgChange: true,
    skip: false,
  });

  const {
    data: attainmentsListData,
    isLoading: attainmentsLoading,
    error: attainmentsError,
  } = useGetAllShowAttainmentsQuery({
    page: 1,
    per_page: 1000,
    status: "active",
  });

  const [deleteAttainment] = useDeleteAttainmentMutation();

  const attainmentsList = useMemo(() => {
    if (!attainmentsListData) return [];

    const getDropdownOptions = (data) => {
      if (!data) return [];
      if (Array.isArray(data)) return data;
      if (data.result && Array.isArray(data.result)) return data.result;
      if (data.data && Array.isArray(data.data)) return data.data;
      if (data.result?.data && Array.isArray(data.result.data))
        return data.result.data;
      if (data.data?.data && Array.isArray(data.data.data))
        return data.data.data;
      if (data.items && Array.isArray(data.items)) return data.items;
      if (data.results && Array.isArray(data.results)) return data.results;
      return [];
    };

    return getDropdownOptions(attainmentsListData);
  }, [attainmentsListData]);

  const { attainmentList, totalCount } = useMemo(() => {
    if (!apiResponse) {
      return { attainmentList: [], totalCount: 0 };
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
    const total = result?.total || result?.count || data.length;

    return {
      attainmentList: data,
      totalCount: total,
    };
  }, [apiResponse, debounceValue]);

  const handleMenuOpen = useCallback((event, attainmentId) => {
    event.stopPropagation();
    setMenuAnchor((prev) => ({ ...prev, [attainmentId]: event.currentTarget }));
  }, []);

  const handleMenuClose = useCallback((attainmentId) => {
    setMenuAnchor((prev) => ({ ...prev, [attainmentId]: null }));
  }, []);

  const handleArchiveRestoreClick = (attainment) => {
    setSelectedAttainment(attainment);
    setConfirmOpen(true);
    handleMenuClose(attainment.id);
  };

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

  const handleAddAttainment = () => {
    setSelectedAttainment(null);
    setModalOpen(true);
  };

  const handleEditClick = useCallback(
    (attainment, event) => {
      if (event) {
        event.stopPropagation();
      }

      if (!attainment.employee) {
        enqueueSnackbar("No employee data found for this attainment", {
          variant: "warning",
          autoHideDuration: 3000,
        });
        handleMenuClose(attainment.id);
        return;
      }

      setIsEditMode(true);
      setEditEmployeeData(attainment.employee);
      setInitialStep(5);
      setMultiFormModalOpen(true);

      handleMenuClose(attainment.id);
    },
    [handleMenuClose, enqueueSnackbar]
  );

  const handleModalClose = () => {
    setModalOpen(false);
    setSelectedAttainment(null);
  };

  const handleModalSuccess = () => {
    refetch();
    handleModalClose();
  };

  const handleEditEmployee = (employeeData, editStep = 5) => {
    setViewModalOpen(false);
    setSelectedEmployeeId(null);

    setIsEditMode(true);
    setEditEmployeeData(employeeData);
    setInitialStep(editStep);
    setMultiFormModalOpen(true);
  };

  const handleMultiFormModalClose = () => {
    setMultiFormModalOpen(false);
    setIsEditMode(false);
    setEditEmployeeData(null);
    setInitialStep(0);
    refetch();
  };

  const handleRowClick = (attainment) => {
    if (attainment.employee?.id) {
      setSelectedEmployeeId(attainment.employee.id);
      setViewModalOpen(true);
    } else {
      enqueueSnackbar("No employee data found for this attainment", {
        variant: "warning",
        autoHideDuration: 3000,
      });
    }
  };

  const handleViewModalClose = () => {
    setViewModalOpen(false);
    setSelectedEmployeeId(null);
  };

  const getAttachmentUrl = (attachmentPath) => {
    if (!attachmentPath) return null;

    if (
      attachmentPath.startsWith("http://") ||
      attachmentPath.startsWith("https://")
    ) {
      return attachmentPath;
    }

    let cleanPath = attachmentPath;
    if (cleanPath.startsWith("/")) {
      cleanPath = cleanPath.substring(1);
    }

    if (cleanPath.startsWith("storage/")) {
      cleanPath = cleanPath.substring(8);
    }

    const getBackendUrl = () => {
      if (process.env.REACT_APP_API_URL) {
        return process.env.REACT_APP_API_URL;
      }

      if (window.__RUNTIME_CONFIG__?.REACT_APP_API_URL) {
        return window.__RUNTIME_CONFIG__.REACT_APP_API_URL;
      }

      try {
        const apiSlice = window.__REDUX_STORE__?.getState()?.api;
        if (apiSlice?.config?.baseUrl) {
          return apiSlice.config.baseUrl;
        }
      } catch (e) {}

      const protocol = window.location.protocol;
      const hostname = window.location.hostname;
      const port = window.location.port;

      if (hostname === "localhost" || hostname === "127.0.0.1") {
        const commonPorts = ["8000", "8080", "80"];

        if (port && commonPorts.includes(port)) {
          return `${protocol}//${hostname}:8000`;
        }

        return `${protocol}//${hostname}:8000`;
      }

      if (hostname.includes("your-domain.com")) {
        return `${protocol}//api.${hostname}`;
      }

      return `${protocol}//${hostname}${port ? `:${port}` : ""}`;
    };

    const BACKEND_URL = getBackendUrl();
    const fullUrl = `${BACKEND_URL}/storage/${cleanPath}`;

    return fullUrl;
  };

  const handleFileDownload = async (attachmentPath) => {
    if (!attachmentPath) return;

    let cleanPath = attachmentPath;
    if (cleanPath.startsWith("/")) {
      cleanPath = cleanPath.substring(1);
    }
    if (cleanPath.startsWith("storage/")) {
      cleanPath = cleanPath.substring(8);
    }

    try {
      const url = getAttachmentUrl(attachmentPath);

      const response = await fetch(url, { method: "HEAD" });

      if (!response.ok) {
        const alternativeUrls = [
          `${window.location.origin}/storage/${cleanPath}`,
          `${window.location.protocol}//${window.location.hostname}:8080/storage/${cleanPath}`,
          `${window.location.protocol}//${window.location.hostname}:3001/storage/${cleanPath}`,
          `${window.location.protocol}//${window.location.hostname}:8000/storage/${cleanPath}`,
          `${window.location.origin}/${cleanPath}`,
          `${window.location.protocol}//${window.location.hostname}:8000/${cleanPath}`,
        ];

        for (const altUrl of alternativeUrls) {
          try {
            const altResponse = await fetch(altUrl, { method: "HEAD" });
            if (altResponse.ok) {
              window.open(altUrl, "_blank");
              return;
            }
          } catch (e) {
            continue;
          }
        }

        throw new Error("File not accessible");
      }

      window.open(url, "_blank");
    } catch (error) {
      enqueueSnackbar(
        "Unable to access file. Please check if the file exists or contact support.",
        {
          variant: "error",
          autoHideDuration: 4000,
        }
      );
    }
  };

  const getFileNameFromUrl = (url) => {
    if (!url) return null;
    try {
      const urlParts = url.split("/");
      const filename = urlParts[urlParts.length - 1];
      const decoded = decodeURIComponent(filename);

      if (decoded.length > 25) {
        const extension = decoded.split(".").pop();
        const nameWithoutExt = decoded.substring(0, decoded.lastIndexOf("."));
        const truncatedName = nameWithoutExt.substring(0, 20) + "...";
        return `${truncatedName}.${extension}`;
      }

      return decoded;
    } catch (error) {
      return url;
    }
  };

  const getFileExtension = (filename) => {
    if (!filename) return "";
    return filename.split(".").pop().toLowerCase();
  };

  const getFileName = (attachmentPath) => {
    if (!attachmentPath) return "";
    const parts = attachmentPath.split("/");
    return parts[parts.length - 1];
  };

  const getDisplayFileName = (attachmentPath) => {
    if (!attachmentPath) return "";

    try {
      const urlParts = attachmentPath.split("/");
      const filename = urlParts[urlParts.length - 1];
      const decodedFilename = decodeURIComponent(filename);

      if (decodedFilename.length > 25) {
        const extension = getFileExtension(decodedFilename);
        const nameWithoutExt = decodedFilename.substring(
          0,
          decodedFilename.lastIndexOf(".")
        );
        const truncatedName = nameWithoutExt.substring(0, 20) + "...";
        return `${truncatedName}.${extension}`;
      }

      return decodedFilename;
    } catch (error) {
      return attachmentPath;
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
      `${employee.first_name || ""} ${employee.last_name || ""}`.trim() ||
      employee.display_name ||
      "—"
    );
  };

  const formatAcademicYears = (yearFrom, yearTo) => {
    const from = safelyDisplayValue(yearFrom);
    const to = safelyDisplayValue(yearTo);
    if (from === "—" && to === "—") return "—";
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

    if (attainmentId && attainmentsList && attainmentsList.length > 0) {
      const foundAttainment = attainmentsList.find(
        (att) => att.id === attainmentId
      );
      if (foundAttainment) {
        return (
          foundAttainment.attainment_name ||
          foundAttainment.name ||
          foundAttainment.title ||
          foundAttainment.display_name ||
          `Attainment ${attainmentId}`
        );
      }
    }

    return attainmentId ? `Attainment ${attainmentId}` : "—";
  };

  const filteredAttainmentList = useMemo(() => {
    if (!debounceValue || debounceValue.trim() === "") {
      return attainmentList;
    }

    const searchTerm = debounceValue.toLowerCase().trim();
    return attainmentList.filter((attainment) => {
      const employeeName = formatEmployeeName(
        attainment.employee
      ).toLowerCase();
      const attainmentName = formatAttainmentName(
        attainment.attainment,
        attainment.attainment_id
      ).toLowerCase();
      const program = formatNestedValue(attainment.program).toLowerCase();
      const degree = formatNestedValue(attainment.degree).toLowerCase();
      const honorTitle = formatNestedValue(
        attainment.honor_title
      ).toLowerCase();
      const institution = safelyDisplayValue(
        attainment.institution
      ).toLowerCase();
      const gpa = safelyDisplayValue(attainment.gpa).toLowerCase();

      return (
        employeeName.includes(searchTerm) ||
        attainmentName.includes(searchTerm) ||
        program.includes(searchTerm) ||
        degree.includes(searchTerm) ||
        honorTitle.includes(searchTerm) ||
        institution.includes(searchTerm) ||
        gpa.includes(searchTerm)
      );
    });
  }, [attainmentList, debounceValue, attainmentsList]);

  const displayList = filteredAttainmentList;
  const displayCount =
    debounceValue && debounceValue.trim() !== ""
      ? filteredAttainmentList.length
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
          <Table stickyHeader sx={{ minWidth: 1400, width: "max-content" }}>
            <TableHead>
              <TableRow>
                <TableCell
                  className="table-id"
                  sx={{ minWidth: 80, whiteSpace: "nowrap" }}>
                  ID
                </TableCell>
                <TableCell
                  className="table-header"
                  sx={{ minWidth: 200, whiteSpace: "nowrap" }}>
                  EMPLOYEE
                </TableCell>
                <TableCell
                  className="table-header"
                  sx={{ minWidth: 150, whiteSpace: "nowrap" }}>
                  ATTAINMENT
                </TableCell>
                <TableCell
                  className="table-header"
                  sx={{ minWidth: 150, whiteSpace: "nowrap" }}>
                  PROGRAM
                </TableCell>
                <TableCell
                  className="table-header"
                  sx={{ minWidth: 120, whiteSpace: "nowrap" }}>
                  DEGREE
                </TableCell>
                <TableCell
                  className="table-header"
                  sx={{ minWidth: 120, whiteSpace: "nowrap" }}>
                  HONOR TITLE
                </TableCell>
                <TableCell
                  className="table-header"
                  sx={{ minWidth: 140, whiteSpace: "nowrap" }}>
                  ACADEMIC YEARS
                </TableCell>
                <TableCell
                  className="table-header"
                  sx={{ minWidth: 80, whiteSpace: "nowrap" }}>
                  GPA
                </TableCell>
                <TableCell
                  className="table-header"
                  sx={{ minWidth: 200, whiteSpace: "nowrap" }}>
                  INSTITUTION
                </TableCell>
                <TableCell
                  className="table-header"
                  sx={{ minWidth: 200, whiteSpace: "nowrap" }}>
                  ATTACHMENT
                </TableCell>
                <TableCell
                  className="table-status"
                  sx={{ minWidth: 110, whiteSpace: "nowrap" }}>
                  STATUS
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isFetching ? (
                <TableRow>
                  <TableCell colSpan={11} align="center">
                    <CircularProgress size={24} />
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={11} align="center" className="table-cell">
                    <Typography color="error">
                      Error: {error?.data?.message || "Failed to load data"}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : displayList.length > 0 ? (
                displayList.map((attainment) => (
                  <TableRow
                    key={attainment.id}
                    onClick={() => handleRowClick(attainment)}
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
                      {safelyDisplayValue(attainment.id)}
                    </TableCell>
                    <TableCell
                      className="table-cell"
                      sx={{ whiteSpace: "nowrap" }}>
                      {formatEmployeeName(attainment.employee)}
                    </TableCell>
                    <TableCell
                      className="table-cell"
                      sx={{ whiteSpace: "nowrap" }}>
                      {formatAttainmentName(
                        attainment.attainment,
                        attainment.attainment_id
                      )}
                    </TableCell>
                    <TableCell
                      className="table-cell"
                      sx={{ whiteSpace: "nowrap" }}>
                      {formatNestedValue(attainment.program)}
                    </TableCell>
                    <TableCell
                      className="table-cell"
                      sx={{ whiteSpace: "nowrap" }}>
                      {formatNestedValue(attainment.degree)}
                    </TableCell>
                    <TableCell
                      className="table-cell"
                      sx={{ whiteSpace: "nowrap" }}>
                      {formatNestedValue(attainment.honor_title)}
                    </TableCell>
                    <TableCell
                      className="table-cell"
                      sx={{ whiteSpace: "nowrap" }}>
                      {formatAcademicYears(
                        attainment.academic_year_from,
                        attainment.academic_year_to
                      )}
                    </TableCell>
                    <TableCell
                      className="table-cell"
                      sx={{ whiteSpace: "nowrap" }}>
                      {safelyDisplayValue(attainment.gpa)}
                    </TableCell>
                    <TableCell
                      className="table-cell"
                      sx={{ whiteSpace: "nowrap" }}>
                      {safelyDisplayValue(attainment.institution)}
                    </TableCell>

                    <TableCell className="table-cell2">
                      {attainment.attainment_attachment ? (
                        <Link
                          component="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            handleFileDownload(
                              attainment.attainment_attachment
                            );
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
                          {getFileNameFromUrl(attainment.attainment_attachment)}
                        </Link>
                      ) : (
                        "—"
                      )}
                    </TableCell>

                    <TableCell
                      className="table-status"
                      sx={{ whiteSpace: "nowrap" }}>
                      <Chip
                        label={showArchived ? "ARCHIVED" : "ACTIVE"}
                        color={showArchived ? "error" : "success"}
                        size="medium"
                        sx={{ "& .MuiChip-label": { fontSize: "0.68rem" } }}
                      />
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={11}
                    align="center"
                    sx={{ borderBottom: "none" }}
                    className="table-cell">
                    {CONSTANT.BUTTONS.NODATA.icon}
                    <Typography
                      variant="body2"
                      color="textSecondary"
                      sx={{ mt: 1 }}>
                      {debounceValue && debounceValue.trim() !== ""
                        ? `No attainments found for "${debounceValue}"`
                        : "No attainments available"}
                    </Typography>
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

      <ViewEmployeeModal
        open={viewModalOpen}
        onClose={handleViewModalClose}
        employeeId={selectedEmployeeId}
        defaultStep={5}
        onEdit={handleEditEmployee}
      />

      <MultiFormModal
        open={multiFormModalOpen}
        onClose={handleMultiFormModalClose}
        isEditMode={isEditMode}
        editEmployeeData={editEmployeeData}
        initialStep={initialStep}
      />

      <Dialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        maxWidth="xs"
        fullWidth>
        <DialogTitle>
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            mb={1}>
            <HelpIcon sx={{ fontSize: 60, color: "#ff4400 " }} />
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
            Are you sure you want to{" "}
            <strong>
              {selectedAttainment?.deleted_at ? "restore" : "archive"}
            </strong>{" "}
            this attainment?
          </Typography>
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
              color="error">
              No
            </Button>
            <Button
              onClick={handleArchiveRestoreConfirm}
              variant="contained"
              color="success">
              Yes
            </Button>
          </Box>
        </DialogActions>
      </Dialog>

      <Box
        sx={{
          position: "fixed",
          bottom: 16,
          right: 16,
          zIndex: 1000,
        }}>
        <IconButton
          color="primary"
          onClick={handleAddAttainment}
          aria-label="add attainment"
          sx={{
            backgroundColor: "#1976d2",
            color: "#fff",
            "&:hover": {
              backgroundColor: "#115293",
            },
          }}>
          <AttachFileIcon />
        </IconButton>
      </Box>
    </Box>
  );
};

export default Attainmentsemp;
