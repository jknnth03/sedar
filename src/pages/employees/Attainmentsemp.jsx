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
import { useGetAllShowAttainmentsQuery } from "../../features/api/extras/attainmentsApi";
import "../../pages/GeneralStyle.scss";
import "../../pages/GeneralTable.scss";
import { CONSTANT } from "../../config/index";
import { useRememberQueryParams } from "../../hooks/useRememberQueryParams";
import EmployeeWizardForm from "../../components/modal/employee/multiFormModal/EmployeeWizardForm";
import { useLazyGetSingleEmployeeQuery } from "../../features/api/employee/mainApi";

const Attainmentsemp = ({
  searchQuery: parentSearchQuery,
  showArchived: parentShowArchived,
  debounceValue: parentDebounceValue,
  onSearchChange,
  onArchivedChange,
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
  const showArchived =
    parentShowArchived !== undefined ? parentShowArchived : false;
  const debounceValue =
    parentDebounceValue !== undefined ? parentDebounceValue : searchQuery;

  const [menuAnchor, setMenuAnchor] = useState({});
  const [getSingleEmployee] = useLazyGetSingleEmployeeQuery();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedAttainment, setSelectedAttainment] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const [wizardOpen, setWizardOpen] = useState(false);
  const [wizardMode, setWizardMode] = useState("create");
  const [wizardInitialData, setWizardInitialData] = useState(null);

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

    return attainmentId ? `Attainment ${attainmentId}` : "N/A";
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
                <TableCell className="table-header3">ID</TableCell>
                <TableCell className="table-header">EMPLOYEE</TableCell>
                <TableCell className="table-header">ATTAINMENT</TableCell>
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
                  <TableCell colSpan={12} align="center">
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
                  <TableCell colSpan={12} align="center" className="table-cell">
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
                    <TableCell className="table-cell4">
                      {safelyDisplayValue(attainment.id)}
                    </TableCell>
                    <TableCell
                      className="table-cell"
                      sx={{
                        width: "220px",
                        minWidth: "180px",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        fontWeight: 500,
                      }}>
                      {formatEmployeeName(attainment.employee)}
                    </TableCell>
                    <TableCell className="table-cell2">
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
                        "N/A"
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={12}
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
                        {debounceValue && debounceValue.trim() !== ""
                          ? `No results for "${debounceValue}"`
                          : showArchived
                          ? "No archived attainments"
                          : "No active attainments"}
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
            labelDisplayedRows={({ from, to, count }) => {
              if (debounceValue && debounceValue.trim() !== "") {
                return `${from}-${to} of ${count} (filtered)`;
              }
              return `${from}-${to} of ${count}`;
            }}
          />
        </Box>
      </Paper>

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
