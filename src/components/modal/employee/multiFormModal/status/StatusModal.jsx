import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  IconButton,
  Typography,
  useTheme,
  CircularProgress,
  Card,
  CardContent,
  Stack,
  Alert,
} from "@mui/material";
import {
  Close as CloseIcon,
  History as HistoryIcon,
  Add as AddIcon,
  Visibility as VisibilityIcon,
} from "@mui/icons-material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { useSnackbar } from "notistack";
import {
  useGetStatusesQuery,
  useCreateStatusMutation,
} from "../../../../../features/api/employee/statusApi";
import { useLazyGetAllShowSeparationTypesQuery } from "../../../../../features/api/extras/separationTypesApi";
import { useLazyGetAllShowSeparationReasonsQuery } from "../../../../../features/api/extras/separationReasonsApi";
import StatusModalFields from "./StatusModalFields";
import StatusAttachmentDialog from "./StatusAttachmentDialog";
import {
  formatEmployeeName,
  formatDate,
  getAttachmentFilename,
} from "./statusUtils";
import { validateStatusForm } from "./statusValidation";

const StatusModal = ({
  open,
  onClose,
  employeeData,
  employeeId,
  statusId,
  mode = "view",
  allowEdit = true,
}) => {
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();
  const [createStatus, { isLoading: isCreating }] = useCreateStatusMutation();
  const [
    getAllSeparationTypes,
    {
      data: separationTypesData,
      isLoading: isLoadingSeparationTypes,
      error: separationTypesError,
      isError: hasSeparationTypesError,
    },
  ] = useLazyGetAllShowSeparationTypesQuery();

  const [
    getAllSeparationReasons,
    {
      data: separationReasonsData,
      isLoading: isLoadingSeparationReasons,
      error: separationReasonsError,
      isError: hasSeparationReasonsError,
    },
  ] = useLazyGetAllShowSeparationReasonsQuery();

  const [currentMode, setCurrentMode] = useState(mode);
  const [statusHistory, setStatusHistory] = useState([]);
  const [currentEmployee, setCurrentEmployee] = useState(null);
  const [newStatusEntry, setNewStatusEntry] = useState({
    separation_type: null,
    separation_reason: null,
    employee_status_effectivity_date: null,
    employee_status_attachment: null,
  });
  const [errors, setErrors] = useState({});

  const [attachmentDialogOpen, setAttachmentDialogOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [hasFetchedSeparationTypes, setHasFetchedSeparationTypes] =
    useState(false);
  const [hasFetchedSeparationReasons, setHasFetchedSeparationReasons] =
    useState(false);

  const currentEmployeeId =
    employeeId || employeeData?.employee?.id || employeeData?.employee_id;

  const separationTypeOptions = React.useMemo(() => {
    if (!separationTypesData) return [];

    if (Array.isArray(separationTypesData?.result?.data)) {
      return separationTypesData.result.data;
    }
    if (Array.isArray(separationTypesData?.data)) {
      return separationTypesData.data;
    }
    if (Array.isArray(separationTypesData?.result)) {
      return separationTypesData.result;
    }
    if (Array.isArray(separationTypesData)) {
      return separationTypesData;
    }

    return [];
  }, [separationTypesData]);

  const separationReasonOptions = React.useMemo(() => {
    if (!separationReasonsData) return [];

    if (Array.isArray(separationReasonsData?.result?.data)) {
      return separationReasonsData.result.data;
    }
    if (Array.isArray(separationReasonsData?.data)) {
      return separationReasonsData.data;
    }
    if (Array.isArray(separationReasonsData?.result)) {
      return separationReasonsData.result;
    }
    if (Array.isArray(separationReasonsData)) {
      return separationReasonsData;
    }

    return [];
  }, [separationReasonsData]);

  const {
    data: apiResponse,
    isLoading: isLoadingStatus,
    refetch,
  } = useGetStatusesQuery(
    {
      employeeId: currentEmployeeId,
      pagination: 0,
    },
    {
      skip: !open || !currentEmployeeId,
      refetchOnMountOrArgChange: true,
    },
  );

  useEffect(() => {
    if (!open) {
      setHasFetchedSeparationTypes(false);
      setHasFetchedSeparationReasons(false);
    }
  }, [open]);

  const handleFetchSeparationTypes = () => {
    if (!hasFetchedSeparationTypes) {
      getAllSeparationTypes();
      setHasFetchedSeparationTypes(true);
    }
  };

  const handleFetchSeparationReasons = () => {
    if (!hasFetchedSeparationReasons) {
      getAllSeparationReasons();
      setHasFetchedSeparationReasons(true);
    }
  };

  const extractStatusHistory = (apiResponse, employeeData) => {
    let statusEntriesToMap = [];
    let employee = null;

    if (apiResponse?.result?.data && Array.isArray(apiResponse.result.data)) {
      const employeeRecord = apiResponse.result.data.find(
        (item) =>
          item.employee_id === currentEmployeeId ||
          item.employee?.id === currentEmployeeId,
      );

      if (employeeRecord) {
        employee = employeeRecord.employee;

        if (
          employeeRecord.status_history &&
          Array.isArray(employeeRecord.status_history)
        ) {
          statusEntriesToMap = employeeRecord.status_history;
        } else if (employeeRecord.latest_status) {
          statusEntriesToMap = [employeeRecord.latest_status];
        }
      }
    } else if (
      apiResponse?.result?.status_history &&
      Array.isArray(apiResponse.result.status_history)
    ) {
      statusEntriesToMap = apiResponse.result.status_history;
      employee = apiResponse.result.employee;
    } else if (
      apiResponse?.data?.data &&
      Array.isArray(apiResponse.data.data)
    ) {
      const employeeRecord = apiResponse.data.data.find(
        (item) =>
          item.employee_id === currentEmployeeId ||
          item.employee?.id === currentEmployeeId,
      );

      if (employeeRecord) {
        employee = employeeRecord.employee;
        if (
          employeeRecord.status_history &&
          Array.isArray(employeeRecord.status_history)
        ) {
          statusEntriesToMap = employeeRecord.status_history;
        } else if (employeeRecord.latest_status) {
          statusEntriesToMap = [employeeRecord.latest_status];
        }
      }
    } else if (apiResponse?.data && Array.isArray(apiResponse.data)) {
      const employeeRecord = apiResponse.data.find(
        (item) =>
          item.employee_id === currentEmployeeId ||
          item.employee?.id === currentEmployeeId,
      );

      if (employeeRecord) {
        employee = employeeRecord.employee;
        if (
          employeeRecord.status_history &&
          Array.isArray(employeeRecord.status_history)
        ) {
          statusEntriesToMap = employeeRecord.status_history;
        } else if (employeeRecord.latest_status) {
          statusEntriesToMap = [employeeRecord.latest_status];
        }
      }
    } else if (
      apiResponse?.data?.statuses &&
      Array.isArray(apiResponse.data.statuses)
    ) {
      statusEntriesToMap = apiResponse.data.statuses;
      employee = apiResponse.data.employee;
    } else if (
      apiResponse?.data?.employee?.statuses &&
      Array.isArray(apiResponse.data.employee.statuses)
    ) {
      statusEntriesToMap = apiResponse.data.employee.statuses;
      employee = apiResponse.data.employee;
    } else if (
      apiResponse?.result?.statuses &&
      Array.isArray(apiResponse.result.statuses)
    ) {
      statusEntriesToMap = apiResponse.result.statuses
        .map((item) => item.latest_status)
        .filter(Boolean);
    } else if (
      apiResponse?.data?.result?.statuses &&
      Array.isArray(apiResponse.data.result.statuses)
    ) {
      statusEntriesToMap = apiResponse.data.result.statuses
        .map((item) => item.latest_status)
        .filter(Boolean);
    }

    if (statusEntriesToMap.length === 0 && employeeData) {
      if (employeeData.statuses && Array.isArray(employeeData.statuses)) {
        statusEntriesToMap = employeeData.statuses;
        employee = employeeData.employee;
      } else if (
        employeeData.employee_statuses &&
        Array.isArray(employeeData.employee_statuses)
      ) {
        statusEntriesToMap = employeeData.employee_statuses;
        employee = employeeData.employee;
      } else if (employeeData.latest_status) {
        statusEntriesToMap = [employeeData.latest_status];
        employee = employeeData.employee;
      }
    }

    if (!employee && employeeData?.employee) {
      employee = employeeData.employee;
    }

    return { statusEntriesToMap, employee };
  };

  useEffect(() => {
    if (open && currentMode === "view") {
      const { statusEntriesToMap, employee } = extractStatusHistory(
        apiResponse,
        employeeData,
      );

      setCurrentEmployee(employee);

      if (statusEntriesToMap.length > 0) {
        const sortedEntries = [...statusEntriesToMap].sort((a, b) => {
          const getCompareDate = (item) => {
            if (item.employee_status_effectivity_date) {
              return new Date(item.employee_status_effectivity_date);
            }
            if (item.created_at) {
              return new Date(item.created_at);
            }
            if (item.updated_at) {
              return new Date(item.updated_at);
            }
            return new Date(0);
          };

          const dateA = getCompareDate(a);
          const dateB = getCompareDate(b);

          return dateB - dateA;
        });

        setStatusHistory(sortedEntries);
      } else {
        setStatusHistory([]);
      }
    }

    if (open && currentMode === "edit") {
      setNewStatusEntry({
        separation_type: null,
        separation_reason: null,
        employee_status_effectivity_date: null,
        employee_status_attachment: null,
      });
      setErrors({});
    }
  }, [open, currentMode, apiResponse, employeeData, currentEmployeeId]);

  const handleInputChange = (field, value) => {
    setNewStatusEntry((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (errors[field]) {
      const updatedErrors = { ...errors };
      delete updatedErrors[field];
      setErrors(updatedErrors);
    }
  };

  const handleSubmit = async () => {
    const { errors: validationErrors, isValid } =
      validateStatusForm(newStatusEntry);

    if (!isValid) {
      setErrors(validationErrors);
      enqueueSnackbar("Please fix the errors before submitting", {
        variant: "error",
        autoHideDuration: 3000,
      });
      return;
    }

    if (!currentEmployeeId) {
      enqueueSnackbar("Missing employee ID", {
        variant: "error",
        autoHideDuration: 3000,
      });
      return;
    }

    try {
      const formData = new FormData();

      formData.append(
        "employee_status_label",
        newStatusEntry.separation_type?.name || "",
      );

      formData.append(
        "separation_type_id",
        newStatusEntry.separation_type?.id || "",
      );

      formData.append(
        "separation_reason_id",
        newStatusEntry.separation_reason?.id || "",
      );

      if (newStatusEntry.employee_status_effectivity_date) {
        formData.append(
          "employee_status_effectivity_date",
          newStatusEntry.employee_status_effectivity_date.format("YYYY-MM-DD"),
        );
      }

      if (newStatusEntry.employee_status_attachment instanceof File) {
        formData.append(
          "employee_status_attachment",
          newStatusEntry.employee_status_attachment,
        );
      }

      await createStatus({
        employeeId: currentEmployeeId,
        data: formData,
      }).unwrap();

      enqueueSnackbar("Employee status created successfully", {
        variant: "success",
        autoHideDuration: 3000,
      });

      refetch();
      setCurrentMode("view");

      setNewStatusEntry({
        separation_type: null,
        separation_reason: null,
        employee_status_effectivity_date: null,
        employee_status_attachment: null,
      });
      setErrors({});
    } catch (error) {
      let errorMessage = "Failed to create employee status";

      if (error.data?.errors) {
        const backendErrors = {};
        Object.keys(error.data.errors).forEach((key) => {
          backendErrors[key] = error.data.errors[key][0];
        });
        setErrors(backendErrors);
        errorMessage = error.data.message || "Validation failed";
      } else if (error.data?.message) {
        errorMessage += `: ${error.data.message}`;
      } else if (error.message) {
        errorMessage += `: ${error.message}`;
      } else if (error.status) {
        errorMessage += ` (Status: ${error.status})`;
      }

      enqueueSnackbar(errorMessage, {
        variant: "error",
        autoHideDuration: 5000,
      });
    }
  };

  const handleClose = () => {
    setStatusHistory([]);
    setCurrentEmployee(null);
    setNewStatusEntry({
      separation_type: null,
      separation_reason: null,
      employee_status_effectivity_date: null,
      employee_status_attachment: null,
    });
    setErrors({});
    setCurrentMode(mode);
    setAttachmentDialogOpen(false);
    setSelectedStatus(null);
    setHasFetchedSeparationTypes(false);
    setHasFetchedSeparationReasons(false);
    onClose();
  };

  const handleModeToggle = () => {
    const newMode = currentMode === "view" ? "edit" : "view";
    setCurrentMode(newMode);
    setErrors({});
  };

  const handleAttachmentClick = (status) => {
    setSelectedStatus(status);
    setAttachmentDialogOpen(true);
  };

  const handleAttachmentDialogClose = () => {
    setAttachmentDialogOpen(false);
    setSelectedStatus(null);
  };

  const renderStatusHistory = () => {
    if (statusHistory.length === 0) {
      return (
        <Box sx={{ textAlign: "center", py: 4 }}>
          <HistoryIcon
            sx={{ fontSize: 48, color: theme.palette.grey[400], mb: 2 }}
          />
          <Typography variant="h6" color="text.secondary">
            No Status History
          </Typography>
          <Typography variant="body2" color="text.secondary">
            This employee has no status records yet.
          </Typography>
        </Box>
      );
    }

    return (
      <Box sx={{ mt: 2, position: "relative" }}>
        <Stack spacing={2}>
          {statusHistory.map((status, index) => {
            const displayDate =
              status.employee_status_effectivity_date ||
              status.created_at ||
              status.updated_at;

            const hasAttachment =
              status.employee_status_attachment ||
              status.employee_status_attachment_filename ||
              status.status_attachment ||
              status.status_attachment_filename;

            return (
              <Box
                key={status.id || index}
                sx={{ display: "flex", gap: 2, position: "relative" }}>
                <Box
                  sx={{
                    width: "120px",
                    flexShrink: 0,
                    pt: 0.5,
                    pl: 2,
                  }}>
                  <Typography
                    variant="body2"
                    sx={{
                      color: "#213D70",
                      fontWeight: 500,
                      textAlign: "left",
                      lineHeight: 1.2,
                      fontSize: "0.75rem",
                    }}>
                    Date Added:
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: "#636363ff",
                      fontWeight: 400,
                      textAlign: "left",
                      lineHeight: 1.2,
                      whiteSpace: "nowrap",
                      fontSize: "0.75rem",
                    }}>
                    {formatDate(displayDate) || `Entry ${index + 1}`}
                  </Typography>
                </Box>

                <Card
                  variant="outlined"
                  sx={{
                    flex: 1,
                    borderRadius: 2,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                  }}>
                  <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 600,
                        color: "#213D70",
                        mb: 1.5,
                        fontSize: "1rem",
                      }}>
                      {status.employee_status_label ||
                        status.separation_type?.name ||
                        "-"}
                    </Typography>

                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 3,
                        flexWrap: "wrap",
                      }}>
                      <Box sx={{ minWidth: "140px" }}>
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: 600,
                            color: "#FE5313",
                            mb: 0.5,
                            textTransform: "uppercase",
                            fontSize: "0.7rem",
                          }}>
                          SEPARATION REASON
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: 500,
                            color: "#213D70",
                            fontSize: "0.875rem",
                          }}>
                          {status.separation_reason?.name || "-"}
                        </Typography>
                      </Box>

                      <Box sx={{ minWidth: "140px" }}>
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: 600,
                            color: "#FE5313",
                            mb: 0.5,
                            textTransform: "uppercase",
                            fontSize: "0.7rem",
                          }}>
                          EFFECTIVITY DATE
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: 500,
                            color: "#213D70",
                            fontSize: "0.875rem",
                          }}>
                          {status.employee_status_effectivity_date
                            ? formatDate(
                                status.employee_status_effectivity_date,
                              )
                            : "-"}
                        </Typography>
                      </Box>

                      <Box sx={{ flex: 1, minWidth: "150px" }}>
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: 600,
                            color: "#FE5313",
                            mb: 0.5,
                            textTransform: "uppercase",
                            fontSize: "0.7rem",
                          }}>
                          ATTACHMENT
                        </Typography>
                        {hasAttachment ? (
                          <Box
                            sx={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 0.5,
                            }}>
                            <Typography
                              variant="body2"
                              sx={{
                                fontWeight: 500,
                                color: "#213D70",
                                fontSize: "0.875rem",
                              }}>
                              {status.employee_status_attachment_filename ||
                                status.status_attachment_filename ||
                                getAttachmentFilename(
                                  status.employee_status_attachment ||
                                    status.status_attachment,
                                )}
                            </Typography>
                            <IconButton
                              size="small"
                              onClick={() => handleAttachmentClick(status)}
                              sx={{
                                color: theme.palette.primary.main,
                                padding: "2px",
                                "&:hover": {
                                  backgroundColor: "rgba(33, 150, 243, 0.08)",
                                },
                              }}>
                              <VisibilityIcon sx={{ fontSize: 16 }} />
                            </IconButton>
                          </Box>
                        ) : (
                          <Typography
                            variant="body2"
                            sx={{
                              fontWeight: 500,
                              color: "#213D70",
                              fontSize: "0.875rem",
                            }}>
                            -
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Box>
            );
          })}
        </Stack>
      </Box>
    );
  };

  const isViewMode = currentMode === "view";
  const isEditMode = currentMode === "edit";

  const getTitle = () => {
    if (isViewMode)
      return <span style={{ color: "#213D70" }}>EMPLOYEE STATUS HISTORY</span>;
    if (isEditMode)
      return <span style={{ color: "#213D70" }}>CREATE EMPLOYEE STATUS</span>;
    return <span style={{ color: "#213D70" }}>EMPLOYEE STATUS</span>;
  };

  const getIcon = () => {
    if (isViewMode) return <HistoryIcon sx={{ color: "#FE5313" }} />;
    return <AddIcon sx={{ color: "#FE5313" }} />;
  };

  if (open && isLoadingStatus && isViewMode) {
    return (
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            minHeight: "30vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          },
        }}>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 2,
            p: 4,
          }}>
          <CircularProgress size={40} />
          <Typography variant="body1" color="text.secondary">
            Loading status history...
          </Typography>
        </Box>
      </Dialog>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth={false}
        PaperProps={{
          sx: {
            borderRadius: 2,
            width: "900px",
            height: "600px",
            maxWidth: "90vw",
            maxHeight: "80vh",
          },
        }}>
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            pb: 1.5,
            pt: 2,
          }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {getIcon()}
            <Typography variant="h6" component="span" sx={{ fontWeight: 600 }}>
              {getTitle()}
            </Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <IconButton onClick={handleClose} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent sx={{ pt: 1 }}>
          {currentEmployee && (
            <Box sx={{ mb: 2, pl: 2 }}>
              <Typography
                sx={{ fontWeight: 800, color: "#213D70", fontSize: "0.95rem" }}>
                {formatEmployeeName(currentEmployee)}
              </Typography>
              {currentEmployee?.employee_code && (
                <Typography
                  sx={{
                    color: "#494949ff",
                    fontWeight: 500,
                    fontSize: "0.8rem",
                  }}>
                  {currentEmployee.employee_code}
                </Typography>
              )}
            </Box>
          )}

          {isEditMode &&
            (hasSeparationTypesError || hasSeparationReasonsError) && (
              <Alert severity="error" sx={{ mb: 2, ml: 2 }}>
                Failed to load options. Please try again or contact support.
              </Alert>
            )}

          {isViewMode ? (
            renderStatusHistory()
          ) : (
            <StatusModalFields
              newStatusEntry={newStatusEntry}
              errors={errors}
              onInputChange={handleInputChange}
              separationTypeOptions={separationTypeOptions}
              separationReasonOptions={separationReasonOptions}
              isLoadingSeparationTypes={isLoadingSeparationTypes}
              isLoadingSeparationReasons={isLoadingSeparationReasons}
              onFetchSeparationTypes={handleFetchSeparationTypes}
              onFetchSeparationReasons={handleFetchSeparationReasons}
            />
          )}
        </DialogContent>

        <DialogActions
          sx={{
            p: 2.5,
            justifyContent: "space-between",
          }}>
          {isViewMode ? (
            <>
              {allowEdit && (
                <Button
                  onClick={handleModeToggle}
                  variant="contained"
                  sx={{
                    minWidth: 120,
                    borderRadius: 2,
                    backgroundColor: theme.palette.primary.main,
                    "&:hover": {
                      backgroundColor: theme.palette.primary.dark,
                    },
                  }}>
                  ADD STATUS
                </Button>
              )}
            </>
          ) : (
            <>
              <Button
                onClick={handleModeToggle}
                variant="outlined"
                sx={{ minWidth: 100, borderRadius: 2 }}
                disabled={isCreating}>
                BACK TO VIEWING
              </Button>
              <Button
                onClick={handleSubmit}
                variant="contained"
                sx={{
                  minWidth: 100,
                  borderRadius: 2,
                  backgroundColor: theme.palette.primary.main,
                  "&:hover": {
                    backgroundColor: theme.palette.primary.dark,
                  },
                }}
                disabled={isCreating}>
                {isCreating ? "Adding.." : "ADD STATUS"}
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>

      <StatusAttachmentDialog
        open={attachmentDialogOpen}
        onClose={handleAttachmentDialogClose}
        status={selectedStatus}
      />
    </LocalizationProvider>
  );
};

export default StatusModal;
