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
} from "@mui/material";
import {
  Close as CloseIcon,
  CalendarToday as CalendarIcon,
  Person as PersonIcon,
  Edit as EditIcon,
  Visibility as ViewIcon,
  Download as DownloadIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { useSnackbar } from "notistack";
import dayjs from "dayjs";

const STATUS_OPTIONS = [
  "REGULAR",
  "EXTENDED",
  "SUSPENDED",
  "MATERNITY",
  "RETURNED TO AGENCY",
  "TERMINATED",
  "RESIGNED",
  "ABSENT WITHOUT LEAVE",
  "END OF CONTRACT",
  "BLACKLISTED",
  "DISMISSED",
  "DECEASED",
  "BACK OUT",
];

const STATUS_WITH_START_END_DATES = ["EXTENDED", "SUSPENDED", "MATERNITY"];
const STATUS_WITH_EFFECTIVITY_DATE = [
  "RETURNED TO AGENCY",
  "TERMINATED",
  "RESIGNED",
  "ABSENT WITHOUT LEAVE",
  "END OF CONTRACT",
  "BLACKLISTED",
  "DISMISSED",
  "DECEASED",
  "BACK OUT",
];
const STATUS_WITH_MINIMAL_DATA = ["REGULAR"];

let idCounter = 0;
const generateUniqueId = (prefix = "status") => {
  idCounter++;
  return `${prefix}_${Date.now()}_${idCounter}_${Math.random()
    .toString(36)
    .substr(2, 9)}`;
};

const StatusModal = ({
  open,
  onClose,
  employeeData,
  onSubmit,
  mode = "view",
  allowEdit = true,
}) => {
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();

  const [currentMode, setCurrentMode] = useState(mode);
  const [statusLines, setStatusLines] = useState([]);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getFieldsEnabledForStatus = (status) => {
    if (STATUS_WITH_START_END_DATES.includes(status)) {
      return {
        startDate: true,
        endDate: true,
        effectivityDate: false,
      };
    } else if (STATUS_WITH_EFFECTIVITY_DATE.includes(status)) {
      return {
        startDate: false,
        endDate: false,
        effectivityDate: true,
      };
    } else if (STATUS_WITH_MINIMAL_DATA.includes(status)) {
      return {
        startDate: true,
        endDate: false,
        effectivityDate: false,
      };
    }
    return {
      startDate: true,
      endDate: true,
      effectivityDate: true,
    };
  };

  useEffect(() => {
    if (open) {
      if (employeeData) {
        const statusData = {
          id: employeeData.id || generateUniqueId(),
          index: 0,
          employee_status_label: employeeData.employee_status_label || "",
          employee_status_start_date: employeeData.employee_status_start_date
            ? dayjs(employeeData.employee_status_start_date)
            : null,
          employee_status_end_date: employeeData.employee_status_end_date
            ? dayjs(employeeData.employee_status_end_date)
            : null,
          employee_status_effectivity_date:
            employeeData.employee_status_effectivity_date
              ? dayjs(employeeData.employee_status_effectivity_date)
              : null,
          employee_status_attachment:
            employeeData.employee_status_attachment || null,
        };
        setStatusLines([statusData]);
      } else {
        const emptyLine = {
          id: generateUniqueId(),
          index: 0,
          employee_status_label: "",
          employee_status_start_date: null,
          employee_status_end_date: null,
          employee_status_effectivity_date: null,
          employee_status_attachment: null,
        };
        setStatusLines([emptyLine]);
      }
      setErrors({});
      setCurrentMode(mode);
    }
  }, [open, employeeData, mode]);

  const validateForm = () => {
    const newErrors = {};

    statusLines.forEach((line, index) => {
      const lineErrors = {};
      const fieldsEnabled = getFieldsEnabledForStatus(
        line.employee_status_label
      );

      if (!line.employee_status_label) {
        lineErrors.employee_status_label = "Status is required";
      }

      if (fieldsEnabled.startDate && !line.employee_status_start_date) {
        lineErrors.employee_status_start_date = "Start date is required";
      }

      if (
        fieldsEnabled.effectivityDate &&
        !line.employee_status_effectivity_date
      ) {
        lineErrors.employee_status_effectivity_date =
          "Effectivity date is required";
      }

      if (
        fieldsEnabled.startDate &&
        fieldsEnabled.endDate &&
        line.employee_status_start_date &&
        line.employee_status_end_date
      ) {
        if (
          line.employee_status_end_date.isBefore(
            line.employee_status_start_date
          )
        ) {
          lineErrors.employee_status_end_date =
            "End date cannot be before start date";
        }
      }

      if (
        fieldsEnabled.startDate &&
        fieldsEnabled.effectivityDate &&
        line.employee_status_start_date &&
        line.employee_status_effectivity_date
      ) {
        if (
          line.employee_status_effectivity_date.isBefore(
            line.employee_status_start_date
          )
        ) {
          lineErrors.employee_status_effectivity_date =
            "Effectivity date cannot be before start date";
        }
      }

      if (Object.keys(lineErrors).length > 0) {
        newErrors[index] = lineErrors;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (index, field, value) => {
    const updatedLines = [...statusLines];
    updatedLines[index] = {
      ...updatedLines[index],
      [field]: value,
    };

    if (field === "employee_status_label") {
      const fieldsEnabled = getFieldsEnabledForStatus(value);

      if (!fieldsEnabled.startDate) {
        updatedLines[index].employee_status_start_date = null;
      }
      if (!fieldsEnabled.endDate) {
        updatedLines[index].employee_status_end_date = null;
      }
      if (!fieldsEnabled.effectivityDate) {
        updatedLines[index].employee_status_effectivity_date = null;
      }
    }

    setStatusLines(updatedLines);

    if (errors[index]?.[field]) {
      const updatedErrors = { ...errors };
      if (updatedErrors[index]) {
        delete updatedErrors[index][field];
        if (Object.keys(updatedErrors[index]).length === 0) {
          delete updatedErrors[index];
        }
      }
      setErrors(updatedErrors);
    }
  };

  const addStatusLine = () => {
    const newLine = {
      id: generateUniqueId(`new_status_${statusLines.length}`),
      index: statusLines.length,
      employee_status_label: "",
      employee_status_start_date: null,
      employee_status_end_date: null,
      employee_status_effectivity_date: null,
      employee_status_attachment: null,
    };
    setStatusLines([...statusLines, newLine]);
  };

  const removeStatusLine = (index) => {
    if (statusLines.length > 1) {
      const updatedLines = statusLines.filter((_, i) => i !== index);
      const reIndexedLines = updatedLines.map((line, i) => ({
        ...line,
        index: i,
      }));
      setStatusLines(reIndexedLines);

      const updatedErrors = { ...errors };
      delete updatedErrors[index];
      const reIndexedErrors = {};
      Object.keys(updatedErrors).forEach((key) => {
        const errorIndex = parseInt(key);
        if (errorIndex < index) {
          reIndexedErrors[errorIndex] = updatedErrors[key];
        } else if (errorIndex > index) {
          reIndexedErrors[errorIndex - 1] = updatedErrors[key];
        }
      });
      setErrors(reIndexedErrors);
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      enqueueSnackbar("Please fix the errors before submitting", {
        variant: "error",
        autoHideDuration: 3000,
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const submitData = {
        employee_statuses: statusLines.map((line) => ({
          ...line,
          employee_status_start_date: line.employee_status_start_date
            ? line.employee_status_start_date.format("YYYY-MM-DD")
            : null,
          employee_status_end_date: line.employee_status_end_date
            ? line.employee_status_end_date.format("YYYY-MM-DD")
            : null,
          employee_status_effectivity_date:
            line.employee_status_effectivity_date
              ? line.employee_status_effectivity_date.format("YYYY-MM-DD")
              : null,
        })),
        _method: currentMode === "create" ? "POST" : "PATCH",
      };

      await onSubmit(submitData);
      handleClose();
    } catch (error) {
      enqueueSnackbar(
        `Failed to ${
          currentMode === "create" ? "create" : "update"
        } employee status`,
        {
          variant: "error",
          autoHideDuration: 3000,
        }
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setStatusLines([]);
    setErrors({});
    setIsSubmitting(false);
    setCurrentMode(mode);
    onClose();
  };

  const handleEditToggle = () => {
    setCurrentMode(currentMode === "view" ? "edit" : "view");
    setErrors({});
  };

  const handleDownloadAttachment = (attachment) => {
    if (attachment) {
      const link = document.createElement("a");
      link.href = attachment;
      link.download = `attachment_${Date.now()}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const formatEmployeeName = (employee) => {
    if (!employee) return "Unknown Employee";
    if (employee?.full_name) return employee.full_name;

    const parts = [
      employee?.last_name,
      employee?.first_name,
      employee?.middle_name,
    ].filter(Boolean);

    return parts.length > 0 ? parts.join(", ") : "Unknown Employee";
  };

  const formatDate = (date) => {
    if (!date) return "Not set";
    return dayjs(date).format("MMM DD, YYYY");
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "EXTENDED":
        return "primary";
      case "SUSPENDED":
        return "warning";
      case "MATERNITY":
        return "info";
      case "TERMINATED":
      case "DISMISSED":
      case "BLACKLISTED":
        return "error";
      case "RESIGNED":
      case "END OF CONTRACT":
        return "default";
      case "DECEASED":
        return "secondary";
      default:
        return "default";
    }
  };

  const isViewMode = currentMode === "view";
  const isEditMode = currentMode === "edit";
  const isCreateMode = currentMode === "create";
  const isReadOnly = isViewMode;

  const getTitle = () => {
    if (isViewMode) return "VIEW EMPLOYEE STATUS";
    if (isEditMode) return "UPDATE EMPLOYEE STATUS";
    return "CREATE EMPLOYEE STATUS";
  };

  const getIcon = () => {
    if (isViewMode)
      return <ViewIcon sx={{ color: theme.palette.primary.main }} />;
    return <PersonIcon sx={{ color: theme.palette.primary.main }} />;
  };

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
            borderBottom: `1px solid ${theme.palette.divider}`,
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
                onClick={handleEditToggle}
                size="small"
                sx={{
                  color: theme.palette.primary.main,
                  "&:hover": {
                    backgroundColor: alpha(theme.palette.primary.main, 0.1),
                  },
                }}>
                <EditIcon />
              </IconButton>
            )}
            <IconButton onClick={handleClose} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent sx={{ p: 3 }}>
          {employeeData?.employee && (
            <Box sx={{ mb: 3 }}>
              <Typography
                variant="subtitle2"
                color="text.secondary"
                gutterBottom>
                Employee
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 500 }}>
                {formatEmployeeName(employeeData.employee)}
              </Typography>
              <Divider sx={{ mt: 2, mb: 3 }} />
            </Box>
          )}

          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {statusLines.map((line, index) => {
              const fieldsEnabled = getFieldsEnabledForStatus(
                line.employee_status_label
              );

              return (
                <Box
                  key={line.id}
                  sx={{
                    border: "1px solid #e0e0e0",
                    borderRadius: 2,
                    p: 2,
                    backgroundColor: alpha(theme.palette.background.paper, 0.8),
                  }}>
                  <Grid container spacing={2} sx={{ alignItems: "flex-start" }}>
                    <Grid item xs={12} md={6}>
                      {isViewMode ? (
                        <Box>
                          <Typography
                            variant="subtitle2"
                            color="text.secondary"
                            gutterBottom>
                            Employee Status
                          </Typography>
                          <Chip
                            label={line.employee_status_label || "Not set"}
                            color={getStatusColor(line.employee_status_label)}
                            size="medium"
                            sx={{ fontWeight: 500 }}
                          />
                        </Box>
                      ) : (
                        <FormControl
                          fullWidth
                          error={!!errors[index]?.employee_status_label}>
                          <InputLabel>Employee Status *</InputLabel>
                          <Select
                            value={line.employee_status_label}
                            onChange={(e) =>
                              handleInputChange(
                                index,
                                "employee_status_label",
                                e.target.value
                              )
                            }
                            label="Employee Status *">
                            {STATUS_OPTIONS.map((status) => (
                              <MenuItem key={status} value={status}>
                                {status}
                              </MenuItem>
                            ))}
                          </Select>
                          {errors[index]?.employee_status_label && (
                            <FormHelperText>
                              {errors[index].employee_status_label}
                            </FormHelperText>
                          )}
                        </FormControl>
                      )}
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                          {isViewMode ? (
                            <Box>
                              <Typography
                                variant="subtitle2"
                                color="text.secondary"
                                gutterBottom>
                                Start Date
                              </Typography>
                              <Typography
                                variant="body1"
                                sx={{ fontWeight: 500 }}>
                                {formatDate(line.employee_status_start_date)}
                              </Typography>
                            </Box>
                          ) : (
                            <DatePicker
                              label="Start Date *"
                              value={line.employee_status_start_date}
                              onChange={(date) =>
                                handleInputChange(
                                  index,
                                  "employee_status_start_date",
                                  date
                                )
                              }
                              disabled={!fieldsEnabled.startDate}
                              slotProps={{
                                textField: {
                                  fullWidth: true,
                                  error:
                                    !!errors[index]?.employee_status_start_date,
                                  helperText:
                                    errors[index]?.employee_status_start_date ||
                                    (!fieldsEnabled.startDate
                                      ? "Disabled for this status"
                                      : ""),
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
                          )}
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          {isViewMode ? (
                            <Box>
                              <Typography
                                variant="subtitle2"
                                color="text.secondary"
                                gutterBottom>
                                End Date
                              </Typography>
                              <Typography
                                variant="body1"
                                sx={{ fontWeight: 500 }}>
                                {fieldsEnabled.endDate
                                  ? formatDate(line.employee_status_end_date)
                                  : "N/A"}
                              </Typography>
                            </Box>
                          ) : (
                            <DatePicker
                              label="End Date"
                              value={line.employee_status_end_date}
                              onChange={(date) =>
                                handleInputChange(
                                  index,
                                  "employee_status_end_date",
                                  date
                                )
                              }
                              disabled={!fieldsEnabled.endDate}
                              slotProps={{
                                textField: {
                                  fullWidth: true,
                                  error:
                                    !!errors[index]?.employee_status_end_date,
                                  helperText:
                                    errors[index]?.employee_status_end_date ||
                                    (!fieldsEnabled.endDate
                                      ? "Disabled for this status"
                                      : ""),
                                  InputProps: {
                                    startAdornment: (
                                      <InputAdornment position="start">
                                        <CalendarIcon />
                                      </InputAdornment>
                                    ),
                                  },
                                },
                              }}
                              minDate={line.employee_status_start_date}
                            />
                          )}
                        </Grid>
                      </Grid>
                    </Grid>

                    <Grid item xs={12} md={6}>
                      {isViewMode ? (
                        <Paper
                          variant="outlined"
                          sx={{
                            p: 2,
                            backgroundColor: alpha(
                              theme.palette.secondary.main,
                              0.02
                            ),
                          }}>
                          <Typography
                            variant="subtitle2"
                            color="text.secondary"
                            gutterBottom>
                            Effectivity Date
                          </Typography>
                          <Typography variant="body1" sx={{ fontWeight: 500 }}>
                            {fieldsEnabled.effectivityDate
                              ? formatDate(
                                  line.employee_status_effectivity_date
                                )
                              : "N/A"}
                          </Typography>
                        </Paper>
                      ) : (
                        <DatePicker
                          label="Effectivity Date *"
                          value={line.employee_status_effectivity_date}
                          onChange={(date) =>
                            handleInputChange(
                              index,
                              "employee_status_effectivity_date",
                              date
                            )
                          }
                          disabled={!fieldsEnabled.effectivityDate}
                          slotProps={{
                            textField: {
                              fullWidth: true,
                              error:
                                !!errors[index]
                                  ?.employee_status_effectivity_date,
                              helperText:
                                errors[index]
                                  ?.employee_status_effectivity_date ||
                                (!fieldsEnabled.effectivityDate
                                  ? "Disabled for this status"
                                  : ""),
                              InputProps: {
                                startAdornment: (
                                  <InputAdornment position="start">
                                    <CalendarIcon />
                                  </InputAdornment>
                                ),
                              },
                            },
                          }}
                          minDate={line.employee_status_start_date}
                        />
                      )}
                    </Grid>

                    <Grid item xs={12} md={6}>
                      {isViewMode ? (
                        <Box>
                          <Typography
                            variant="subtitle2"
                            color="text.secondary"
                            gutterBottom>
                            Attachment
                          </Typography>
                          {line.employee_status_attachment ? (
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                              }}>
                              <Typography variant="body2">
                                {typeof line.employee_status_attachment ===
                                "string"
                                  ? line.employee_status_attachment
                                  : line.employee_status_attachment.name ||
                                    "Attachment available"}
                              </Typography>
                              <IconButton
                                size="small"
                                onClick={() =>
                                  handleDownloadAttachment(
                                    line.employee_status_attachment
                                  )
                                }
                                sx={{ color: theme.palette.primary.main }}>
                                <DownloadIcon />
                              </IconButton>
                            </Box>
                          ) : (
                            <Typography variant="body2" color="text.secondary">
                              No attachment
                            </Typography>
                          )}
                        </Box>
                      ) : (
                        <Box>
                          <Typography variant="subtitle2" gutterBottom>
                            Attachment
                          </Typography>
                          <TextField
                            type="file"
                            fullWidth
                            variant="outlined"
                            inputProps={{
                              accept: ".pdf,.doc,.docx,.jpg,.jpeg,.png",
                            }}
                            onChange={(e) =>
                              handleInputChange(
                                index,
                                "employee_status_attachment",
                                e.target.files[0]
                              )
                            }
                            helperText="Accepted formats: PDF, DOC, DOCX, JPG, JPEG, PNG"
                          />
                        </Box>
                      )}
                    </Grid>

                    {!isReadOnly && (
                      <Grid item xs={12}>
                        <Box sx={{ display: "flex", gap: 1, mt: 2 }}>
                          {statusLines.length > 1 && (
                            <Button
                              onClick={() => removeStatusLine(index)}
                              variant="contained"
                              size="small"
                              startIcon={<DeleteIcon />}
                              sx={{
                                backgroundColor: "rgb(220, 53, 69)",
                                color: "#fff",
                                "&:hover": {
                                  backgroundColor: "rgb(200, 35, 51)",
                                },
                              }}>
                              Remove Status
                            </Button>
                          )}
                          {index === statusLines.length - 1 && (
                            <Button
                              onClick={addStatusLine}
                              variant="contained"
                              size="small"
                              startIcon={<AddIcon />}
                              sx={{
                                backgroundColor: "rgb(40, 167, 69)",
                                color: "#fff",
                                "&:hover": {
                                  backgroundColor: "rgb(34, 142, 58)",
                                },
                              }}>
                              Add Status
                            </Button>
                          )}
                        </Box>
                      </Grid>
                    )}
                  </Grid>
                </Box>
              );
            })}
          </Box>
        </DialogContent>

        <DialogActions
          sx={{
            p: 3,
            borderTop: `1px solid ${theme.palette.divider}`,
            gap: 2,
          }}>
          {isViewMode ? (
            <>
              <Button
                onClick={handleClose}
                variant="outlined"
                sx={{
                  minWidth: 100,
                  borderRadius: 2,
                }}>
                Close
              </Button>
              {allowEdit && (
                <Button
                  onClick={handleEditToggle}
                  variant="contained"
                  startIcon={<EditIcon />}
                  sx={{
                    minWidth: 100,
                    borderRadius: 2,
                    backgroundColor: theme.palette.primary.main,
                    "&:hover": {
                      backgroundColor: theme.palette.primary.dark,
                    },
                  }}>
                  Edit
                </Button>
              )}
            </>
          ) : (
            <>
              <Button
                onClick={isEditMode ? handleEditToggle : handleClose}
                variant="outlined"
                sx={{
                  minWidth: 100,
                  borderRadius: 2,
                }}
                disabled={isSubmitting}>
                {isEditMode ? "Cancel" : "Cancel"}
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
                disabled={isSubmitting}>
                {isSubmitting
                  ? isCreateMode
                    ? "Creating..."
                    : "Updating..."
                  : isCreateMode
                  ? "Create"
                  : "Update"}
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
};

export default StatusModal;
