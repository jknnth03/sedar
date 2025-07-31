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
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  FormHelperText,
  Divider,
  alpha,
  useTheme,
  Chip,
  Paper,
  Grid,
  InputAdornment,
  CircularProgress,
  Card,
  CardContent,
} from "@mui/material";
import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineOppositeContent,
} from "@mui/lab";
import {
  Close as CloseIcon,
  CalendarToday as CalendarIcon,
  Person as PersonIcon,
  Edit as EditIcon,
  Visibility as ViewIcon,
  Download as DownloadIcon,
  History as HistoryIcon,
  Add as AddIcon,
} from "@mui/icons-material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { useSnackbar } from "notistack";
import {
  useGetStatusesQuery,
  useCreateStatusMutation,
} from "../../../../../features/api/employee/statusApi";

import {
  STATUS_OPTIONS,
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
  const [newStatusEntry, setNewStatusEntry] = useState({
    employee_status_label: "",
    employee_status_start_date: null,
    employee_status_end_date: null,
    employee_status_effectivity_date: null,
    employee_status_attachment: null,
  });
  const [errors, setErrors] = useState({});

  const currentEmployeeId =
    employeeId || employeeData?.employee?.id || employeeData?.employee_id;

  const {
    data: apiResponse,
    isLoading: isLoadingStatus,
    error: apiError,
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

  // Helper function to determine which fields should be visible
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

  useEffect(() => {
    if (open && currentMode === "view") {
      let statusEntriesToMap = [];
      let dataSource = "none";

      if (apiResponse?.data && Array.isArray(apiResponse.data)) {
        statusEntriesToMap = apiResponse.data;
        dataSource = "apiResponse.data (array)";
      } else if (
        apiResponse?.data?.data &&
        Array.isArray(apiResponse.data.data)
      ) {
        statusEntriesToMap = apiResponse.data.data;
        dataSource = "apiResponse.data.data";
      } else if (
        apiResponse?.data?.statuses &&
        Array.isArray(apiResponse.data.statuses)
      ) {
        statusEntriesToMap = apiResponse.data.statuses;
        dataSource = "apiResponse.data.statuses";
      } else if (
        apiResponse?.data?.employee?.statuses &&
        Array.isArray(apiResponse.data.employee.statuses)
      ) {
        statusEntriesToMap = apiResponse.data.employee.statuses;
        dataSource = "apiResponse.data.employee.statuses";
      } else if (
        apiResponse?.result?.statuses &&
        Array.isArray(apiResponse.result.statuses)
      ) {
        statusEntriesToMap = apiResponse.result.statuses
          .map((item) => item.latest_status)
          .filter(Boolean);
        dataSource = "apiResponse.result.statuses.latest_status";
      } else if (
        apiResponse?.data?.result?.statuses &&
        Array.isArray(apiResponse.data.result.statuses)
      ) {
        statusEntriesToMap = apiResponse.data.result.statuses
          .map((item) => item.latest_status)
          .filter(Boolean);
        dataSource = "apiResponse.data.result.statuses.latest_status";
      } else if (
        employeeData?.statuses &&
        Array.isArray(employeeData.statuses)
      ) {
        statusEntriesToMap = employeeData.statuses;
        dataSource = "employeeData.statuses";
      } else if (
        employeeData?.employee_statuses &&
        Array.isArray(employeeData.employee_statuses)
      ) {
        statusEntriesToMap = employeeData.employee_statuses;
        dataSource = "employeeData.employee_statuses";
      }

      if (statusEntriesToMap.length > 0) {
        const sortedEntries = statusEntriesToMap.sort((a, b) => {
          if (a.created_at && b.created_at) {
            return new Date(b.created_at) - new Date(a.created_at);
          }
          if (a.updated_at && b.updated_at) {
            return new Date(b.updated_at) - new Date(a.updated_at);
          }
          if (a.id && b.id) {
            return b.id - a.id;
          }
          return 0;
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
  }, [open, currentMode, apiResponse, employeeData]);

  const handleInputChange = (field, value) => {
    setNewStatusEntry((prev) => {
      const updated = { ...prev, [field]: value };

      if (field === "employee_status_label") {
        const fieldsVisibility = getFieldsVisibility(value);
        // Clear fields that are not visible for the selected status
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
      console.error("Missing employee ID");
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

      const result = await createStatus({
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
      console.error("API Error Details:", error);

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
    setNewStatusEntry({
      employee_status_label: "",
      employee_status_start_date: null,
      employee_status_end_date: null,
      employee_status_effectivity_date: null,
      employee_status_attachment: null,
    });
    setErrors({});
    setCurrentMode(mode);
    onClose();
  };

  const handleModeToggle = () => {
    const newMode = currentMode === "view" ? "edit" : "view";
    setCurrentMode(newMode);
    setErrors({});
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
      <Timeline
        sx={{
          "& .MuiTimelineItem-root": {
            minHeight: "auto",
            "&:before": {
              display: "none",
            },
          },
          "& .MuiTimelineOppositeContent-root": {
            flex: 0.15,
            paddingLeft: 0,
            paddingRight: 1,
            maxWidth: "120px",
          },
          "& .MuiTimelineContent-root": {
            flex: 0.85,
            paddingLeft: 1,
            paddingRight: 0,
          },
        }}>
        {statusHistory.map((status, index) => {
          // Get field visibility for this status
          const fieldsVisibility = getFieldsVisibility(
            status.employee_status_label
          );

          return (
            <TimelineItem key={status.id || index}>
              <TimelineOppositeContent
                sx={{
                  marginTop: "auto",
                  marginBottom: "auto",
                  textAlign: "right",
                  pr: 2,
                }}
                variant="body2"
                color="text.secondary">
                {formatDate(status.created_at) ||
                  formatDate(status.updated_at) ||
                  `Entry ${index + 1}`}
              </TimelineOppositeContent>
              <TimelineSeparator>
                <TimelineDot
                  color={index === 0 ? "primary" : "grey"}
                  variant={index === 0 ? "filled" : "outlined"}
                />
                {index < statusHistory.length - 1 && <TimelineConnector />}
              </TimelineSeparator>
              <TimelineContent sx={{ py: "12px" }}>
                <Card variant="outlined" sx={{ width: "100%" }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 1 }}>
                      {status.employee_status_label}
                      {index === 0 && (
                        <Chip
                          label="Current"
                          size="small"
                          color="primary"
                          sx={{ ml: 1 }}
                        />
                      )}
                    </Typography>

                    <Grid container spacing={2} sx={{ mt: 1 }}>
                      {fieldsVisibility.startDate && (
                        <Grid item xs={12} md={6}>
                          <Typography variant="body2" color="text.secondary">
                            Start Date
                          </Typography>
                          <Typography variant="body1">
                            {formatDate(status.employee_status_start_date)}
                          </Typography>
                        </Grid>
                      )}

                      {fieldsVisibility.endDate && (
                        <Grid item xs={12} md={6}>
                          <Typography variant="body2" color="text.secondary">
                            End Date
                          </Typography>
                          <Typography variant="body1">
                            {formatDate(status.employee_status_end_date)}
                          </Typography>
                        </Grid>
                      )}

                      {fieldsVisibility.effectivityDate && (
                        <Grid item xs={12} md={6}>
                          <Typography variant="body2" color="text.secondary">
                            Effectivity Date
                          </Typography>
                          <Typography variant="body1">
                            {formatDate(
                              status.employee_status_effectivity_date
                            )}
                          </Typography>
                        </Grid>
                      )}

                      <Grid item xs={12} md={6}>
                        <Typography variant="body2" color="text.secondary">
                          Attachment
                        </Typography>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                          }}>
                          <Typography variant="body1">
                            {status.employee_status_attachment ||
                            status.employee_status_attachment_path
                              ? getAttachmentFilename(
                                  status.employee_status_attachment ||
                                    status.employee_status_attachment_path
                                )
                              : "No attachment"}
                          </Typography>
                          {(status.employee_status_attachment ||
                            status.employee_status_attachment_path) && (
                            <IconButton
                              size="small"
                              onClick={() =>
                                handleDownloadAttachment(
                                  status.employee_status_attachment ||
                                    status.employee_status_attachment_path,
                                  enqueueSnackbar
                                )
                              }
                              sx={{
                                color: theme.palette.primary.main,
                                "&:hover": {
                                  backgroundColor: alpha(
                                    theme.palette.primary.main,
                                    0.1
                                  ),
                                },
                              }}>
                              <DownloadIcon />
                            </IconButton>
                          )}
                        </Box>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </TimelineContent>
            </TimelineItem>
          );
        })}
      </Timeline>
    );
  };

  const renderNewStatusForm = () => {
    const fieldsVisibility = getFieldsVisibility(
      newStatusEntry.employee_status_label
    );

    return (
      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 3, fontWeight: 500 }}>
            Create New Status Entry
          </Typography>

          <Grid container spacing={2}>
            <Grid
              item
              xs={12}
              sm={6}
              sx={{ minWidth: "362px", maxWidth: "362px" }}>
              <FormControl fullWidth error={!!errors.employee_status_label}>
                <InputLabel>Employee Status *</InputLabel>
                <Select
                  value={newStatusEntry.employee_status_label}
                  onChange={(e) =>
                    handleInputChange("employee_status_label", e.target.value)
                  }
                  label="Employee Status *">
                  {STATUS_OPTIONS.map((status) => (
                    <MenuItem key={status} value={status}>
                      {status}
                    </MenuItem>
                  ))}
                </Select>
                {errors.employee_status_label && (
                  <FormHelperText>
                    {errors.employee_status_label}
                  </FormHelperText>
                )}
              </FormControl>
            </Grid>

            {fieldsVisibility.startDate && (
              <Grid
                item
                xs={12}
                md={6}
                sx={{ minWidth: "362px", maxWidth: "362px" }}>
                <DatePicker
                  label="Start Date *"
                  value={newStatusEntry.employee_status_start_date}
                  onChange={(date) =>
                    handleInputChange("employee_status_start_date", date)
                  }
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      error: !!errors.employee_status_start_date,
                      helperText: errors.employee_status_start_date,
                      InputProps: {
                        startAdornment: (
                          <InputAdornment position="start">
                            <CalendarIcon />
                          </InputAdornment>
                        ),
                      },
                    },
                  }}
                />
              </Grid>
            )}

            {fieldsVisibility.endDate && (
              <Grid
                item
                xs={12}
                md={6}
                sx={{ minWidth: "362px", maxWidth: "362px" }}>
                <DatePicker
                  label="End Date"
                  value={newStatusEntry.employee_status_end_date}
                  onChange={(date) =>
                    handleInputChange("employee_status_end_date", date)
                  }
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      error: !!errors.employee_status_end_date,
                      helperText: errors.employee_status_end_date,
                      InputProps: {
                        startAdornment: (
                          <InputAdornment position="start">
                            <CalendarIcon />
                          </InputAdornment>
                        ),
                      },
                    },
                  }}
                  minDate={newStatusEntry.employee_status_start_date}
                />
              </Grid>
            )}

            {fieldsVisibility.effectivityDate && (
              <Grid
                item
                xs={12}
                md={6}
                sx={{ minWidth: "362px", maxWidth: "362px" }}>
                <DatePicker
                  label="Effectivity Date *"
                  value={newStatusEntry.employee_status_effectivity_date}
                  onChange={(date) =>
                    handleInputChange("employee_status_effectivity_date", date)
                  }
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      error: !!errors.employee_status_effectivity_date,
                      helperText: errors.employee_status_effectivity_date,
                      InputProps: {
                        startAdornment: (
                          <InputAdornment position="start">
                            <CalendarIcon />
                          </InputAdornment>
                        ),
                      },
                    },
                  }}
                  minDate={newStatusEntry.employee_status_start_date}
                />
              </Grid>
            )}

            <Grid item xs={12}>
              <Grid
                item
                xs={12}
                md={6}
                sx={{ minWidth: "740px", maxWidth: "740px" }}></Grid>
              <TextField
                type="file"
                fullWidth
                variant="outlined"
                label="Attachment"
                InputLabelProps={{ shrink: true }}
                inputProps={{
                  accept: ".pdf,.doc,.docx,.jpg,.jpeg,.png",
                }}
                onChange={(e) =>
                  handleInputChange(
                    "employee_status_attachment",
                    e.target.files[0]
                  )
                }
                helperText="Accepted formats: PDF, DOC, DOCX, JPG, JPEG, PNG"
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    );
  };

  const isViewMode = currentMode === "view";
  const isEditMode = currentMode === "edit";

  const getTitle = () => {
    if (isViewMode) return "EMPLOYEE STATUS HISTORY";
    if (isEditMode) return "CREATE EMPLOYEE STATUS";
    return "EMPLOYEE STATUS";
  };

  const getIcon = () => {
    if (isViewMode)
      return <HistoryIcon sx={{ color: theme.palette.primary.main }} />;
    return <AddIcon sx={{ color: theme.palette.primary.main }} />;
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
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            minHeight: "60vh",
            maxHeight: "90vh",
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
            {isViewMode && allowEdit && (
              <IconButton
                onClick={handleModeToggle}
                size="small"
                sx={{
                  color: theme.palette.primary.main,
                  "&:hover": {
                    backgroundColor: alpha(theme.palette.primary.main, 0.1),
                  },
                }}>
                <AddIcon />
              </IconButton>
            )}
            {isEditMode && (
              <IconButton
                onClick={handleModeToggle}
                size="small"
                sx={{
                  color: theme.palette.primary.main,
                  "&:hover": {
                    backgroundColor: alpha(theme.palette.primary.main, 0.1),
                  },
                }}>
                <Typography sx={{ paddingRight: 1 }}>
                  {" "}
                  Back to viewing
                </Typography>
                <ViewIcon />
              </IconButton>
            )}
            <IconButton onClick={handleClose} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent>
          {(apiResponse?.result?.employee ||
            apiResponse?.data?.employee ||
            employeeData?.employee) && (
            <Box sx={{ mb: 1, paddingLeft: 1 }}>
              <Typography
                variant="h7"
                sx={{ fontWeight: 600, fontStyle: "italic" }}>
                {formatEmployeeName(
                  apiResponse?.result?.employee ||
                    apiResponse?.data?.employee ||
                    employeeData?.employee
                )}
              </Typography>
            </Box>
          )}

          {isViewMode ? renderStatusHistory() : renderNewStatusForm()}
        </DialogContent>

        <DialogActions
          sx={{
            p: 3,
            gap: 2,
          }}>
          {isViewMode ? (
            <>
              <Button
                onClick={handleClose}
                variant="outlined"
                sx={{ minWidth: 100, borderRadius: 2 }}>
                Close
              </Button>
              {allowEdit && (
                <Button
                  onClick={handleModeToggle}
                  variant="contained"
                  startIcon={<AddIcon />}
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
                Cancel
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
                {isCreating ? "Creating..." : "Create"}
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
};

export default StatusModal;
