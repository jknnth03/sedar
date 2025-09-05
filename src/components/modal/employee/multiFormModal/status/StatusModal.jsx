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
  Divider,
  useTheme,
  CircularProgress,
  Card,
  CardContent,
  Stack,
} from "@mui/material";
import {
  Close as CloseIcon,
  History as HistoryIcon,
  Add as AddIcon,
} from "@mui/icons-material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { useSnackbar } from "notistack";
import {
  useGetStatusesQuery,
  useCreateStatusMutation,
} from "../../../../../features/api/employee/statusApi";
import StatusModalFields from "./StatusModalFields";
import StatusAttachmentDialog from "./StatusAttachmentDialog";
import {
  STATUS_WITH_START_END_DATES,
  STATUS_WITH_EFFECTIVITY_DATE,
  STATUS_WITH_MINIMAL_DATA,
  formatEmployeeName,
  formatDate,
  getAttachmentFilename,
  handleDownloadAttachment,
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

  const [currentMode, setCurrentMode] = useState(mode);
  const [statusHistory, setStatusHistory] = useState([]);
  const [currentEmployee, setCurrentEmployee] = useState(null);
  const [newStatusEntry, setNewStatusEntry] = useState({
    employee_status_label: "",
    employee_status_start_date: null,
    employee_status_end_date: null,
    employee_status_effectivity_date: null,
    employee_status_attachment: null,
  });
  const [errors, setErrors] = useState({});

  const [attachmentDialogOpen, setAttachmentDialogOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(null);

  const currentEmployeeId =
    employeeId || employeeData?.employee?.id || employeeData?.employee_id;

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
    }
  );

  const getFieldsVisibility = (status) => {
    if (STATUS_WITH_START_END_DATES.includes(status)) {
      return { startDate: true, endDate: true, effectivityDate: false };
    } else if (STATUS_WITH_EFFECTIVITY_DATE.includes(status)) {
      return { startDate: false, endDate: false, effectivityDate: true };
    } else if (STATUS_WITH_MINIMAL_DATA.includes(status)) {
      return { startDate: true, endDate: false, effectivityDate: false };
    }
    return { startDate: true, endDate: true, effectivityDate: true };
  };

  const extractStatusHistory = (apiResponse, employeeData) => {
    let statusEntriesToMap = [];
    let employee = null;

    if (apiResponse?.result?.data && Array.isArray(apiResponse.result.data)) {
      const employeeRecord = apiResponse.result.data.find(
        (item) =>
          item.employee_id === currentEmployeeId ||
          item.employee?.id === currentEmployeeId
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
          item.employee?.id === currentEmployeeId
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
          item.employee?.id === currentEmployeeId
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
        employeeData
      );

      setCurrentEmployee(employee);

      if (statusEntriesToMap.length > 0) {
        const sortedEntries = [...statusEntriesToMap].sort((a, b) => {
          const getCompareDate = (item) => {
            if (item.employee_status_start_date) {
              return new Date(item.employee_status_start_date);
            }
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
        employee_status_label: "",
        employee_status_start_date: null,
        employee_status_end_date: null,
        employee_status_effectivity_date: null,
        employee_status_attachment: null,
      });
      setErrors({});
    }
  }, [open, currentMode, apiResponse, employeeData, currentEmployeeId]);

  const handleInputChange = (field, value) => {
    setNewStatusEntry((prev) => {
      const updated = { ...prev, [field]: value };

      if (field === "employee_status_label") {
        const fieldsVisibility = getFieldsVisibility(value);
        if (!fieldsVisibility.startDate)
          updated.employee_status_start_date = null;
        if (!fieldsVisibility.endDate) updated.employee_status_end_date = null;
        if (!fieldsVisibility.effectivityDate)
          updated.employee_status_effectivity_date = null;
      }

      return updated;
    });

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
        newStatusEntry.employee_status_label
      );

      if (newStatusEntry.employee_status_start_date) {
        formData.append(
          "employee_status_start_date",
          newStatusEntry.employee_status_start_date.format("YYYY-MM-DD")
        );
      }

      if (newStatusEntry.employee_status_end_date) {
        formData.append(
          "employee_status_end_date",
          newStatusEntry.employee_status_end_date.format("YYYY-MM-DD")
        );
      }

      if (newStatusEntry.employee_status_effectivity_date) {
        formData.append(
          "employee_status_effectivity_date",
          newStatusEntry.employee_status_effectivity_date.format("YYYY-MM-DD")
        );
      }

      if (newStatusEntry.employee_status_attachment instanceof File) {
        formData.append(
          "employee_status_attachment",
          newStatusEntry.employee_status_attachment
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
        employee_status_label: "",
        employee_status_start_date: null,
        employee_status_end_date: null,
        employee_status_effectivity_date: null,
        employee_status_attachment: null,
      });
      setErrors({});
    } catch (error) {
      let errorMessage = "Failed to create employee status";
      if (error.data?.message) {
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
      employee_status_label: "",
      employee_status_start_date: null,
      employee_status_end_date: null,
      employee_status_effectivity_date: null,
      employee_status_attachment: null,
    });
    setErrors({});
    setCurrentMode(mode);
    setAttachmentDialogOpen(false);
    setSelectedStatus(null);
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
        <Stack spacing={3}>
          {statusHistory.map((status, index) => {
            const fieldsVisibility = getFieldsVisibility(
              status.employee_status_label
            );

            const displayDate =
              status.employee_status_start_date ||
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
                {/* Date Added section - wider with only 2 lines */}
                <Box
                  sx={{
                    width: "120px", // Increased width
                    flexShrink: 0,
                    pt: 1,
                    pl: 2,
                  }}>
                  <Typography
                    variant="body2"
                    sx={{
                      color: "#213D70",
                      fontWeight: 500,
                      textAlign: "left",
                      lineHeight: 1.2,
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
                      whiteSpace: "nowrap", // Prevent wrapping
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
                  <CardContent sx={{ p: 3 }}>
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 600,
                        color: "#213D70",
                        mb: 3,
                      }}>
                      {status.employee_status_label}
                    </Typography>

                    {/* Updated layout - all fields in one row */}
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 4, // Gap between sections
                        flexWrap: "nowrap", // Keep everything in one line
                      }}>
                      {/* Start Date */}
                      <Box sx={{ flex: "0 0 15%" }}>
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: 600,
                            color: "#FE5313",
                            mb: 1,
                            textTransform: "uppercase",
                            fontSize: "0.75rem",
                          }}>
                          START DATE
                        </Typography>
                        <Typography
                          variant="body1"
                          sx={{
                            fontWeight: 500,
                            color: "#213D70",
                          }}>
                          {status.employee_status_start_date
                            ? formatDate(status.employee_status_start_date)
                            : "-"}
                        </Typography>
                      </Box>

                      {/* End Date */}
                      <Box sx={{ flex: "0 0 15%" }}>
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: 600,
                            color: "#FE5313",
                            mb: 1,
                            textTransform: "uppercase",
                            fontSize: "0.75rem",
                          }}>
                          END DATE
                        </Typography>
                        <Typography
                          variant="body1"
                          sx={{
                            fontWeight: 500,
                            color: "#213D70",
                          }}>
                          {status.employee_status_end_date
                            ? formatDate(status.employee_status_end_date)
                            : "-"}
                        </Typography>
                      </Box>

                      {/* Effectivity Date */}
                      <Box sx={{ flex: "0 0 20%" }}>
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: 600,
                            color: "#FE5313",
                            mb: 1,
                            textTransform: "uppercase",
                            fontSize: "0.75rem",
                          }}>
                          EFFECTIVITY DATE
                        </Typography>
                        <Typography
                          variant="body1"
                          sx={{
                            fontWeight: 500,
                            color: "#213D70",
                          }}>
                          {status.employee_status_effectivity_date
                            ? formatDate(
                                status.employee_status_effectivity_date
                              )
                            : "-"}
                        </Typography>
                      </Box>

                      {/* Attachment */}
                      <Box sx={{ flex: "1 1 auto" }}>
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: 600,
                            color: "#FE5313",
                            mb: 1,
                            textTransform: "uppercase",
                            fontSize: "0.75rem",
                          }}>
                          ATTACHMENT
                        </Typography>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                          }}>
                          {hasAttachment ? (
                            <>
                              <Typography
                                variant="body1"
                                sx={{
                                  fontWeight: 500,
                                  color: theme.palette.primary.main,
                                  cursor: "pointer",
                                  textDecoration: "underline",
                                  "&:hover": {
                                    color: theme.palette.primary.dark,
                                  },
                                }}
                                onClick={() => handleAttachmentClick(status)}>
                                {status.employee_status_attachment_filename ||
                                  status.status_attachment_filename ||
                                  getAttachmentFilename(
                                    status.employee_status_attachment ||
                                      status.status_attachment
                                  )}
                              </Typography>
                            </>
                          ) : (
                            <Typography
                              variant="body1"
                              sx={{
                                fontWeight: 500,
                                color: "#213D70",
                              }}>
                              -
                            </Typography>
                          )}
                        </Box>
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
            pb: 2,
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

        <DialogContent>
          {currentEmployee && (
            <Box sx={{ mb: 3, pl: 2 }}>
              <Typography sx={{ fontWeight: 800, color: "#213D70" }}>
                {formatEmployeeName(currentEmployee)}
              </Typography>
              {currentEmployee?.employee_code && (
                <Typography
                  sx={{
                    color: "#494949ff",
                    fontWeight: 500,
                    fontSize: "0.875rem",
                  }}>
                  {currentEmployee.employee_code}
                </Typography>
              )}
            </Box>
          )}

          {isViewMode ? (
            renderStatusHistory()
          ) : (
            <StatusModalFields
              newStatusEntry={newStatusEntry}
              errors={errors}
              fieldsVisibility={getFieldsVisibility(
                newStatusEntry.employee_status_label
              )}
              onInputChange={handleInputChange}
            />
          )}
        </DialogContent>

        <DialogActions
          sx={{
            p: 3,
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
