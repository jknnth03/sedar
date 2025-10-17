import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  Typography,
  IconButton,
  Skeleton,
  TextField,
  Grid,
  FormControl,
} from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import {
  Close as CloseIcon,
  Assignment as AssignmentIcon,
} from "@mui/icons-material";
import { useFormContext, Controller } from "react-hook-form";
import { styled } from "@mui/material/styles";
import dayjs from "dayjs";
import DataChangeAttachmentFields from "../form/DataChange/DataChangeAttachmentFields";

const StyledDialog = styled(Dialog)(({ theme }) => ({
  "& .MuiDialog-paper": {
    maxWidth: "900px",
    width: "100%",
    height: "70vh",
    maxHeight: "70vh",
    display: "flex",
    flexDirection: "column",
    position: "relative",
  },
}));

const StyledDialogTitle = styled(DialogTitle)(({ theme }) => ({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  backgroundColor: "#fff",
  flexShrink: 0,
  padding: "16px 24px",
  "& .MuiTypography-root": {
    fontSize: "1.25rem",
    fontWeight: 600,
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
}));

const StyledDialogContent = styled(DialogContent)(({ theme }) => ({
  backgroundColor: "#fff",
  flex: 1,
  padding: "0px 10px",
  overflow: "auto",
  "&::-webkit-scrollbar": {
    width: "8px",
  },
  "&::-webkit-scrollbar-track": {
    backgroundColor: "#f1f1f1",
    borderRadius: "4px",
  },
  "&::-webkit-scrollbar-thumb": {
    backgroundColor: "#c1c1c1",
    borderRadius: "4px",
    "&:hover": {
      backgroundColor: "#a1a1a1",
    },
  },
}));

const generateUniqueId = (prefix = "attachment") => {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

const DataChangeMonitoringModal = ({
  open,
  onClose,
  submissionId,
  submissionData,
  isLoading,
}) => {
  const {
    reset,
    setValue,
    control,
    watch,
    formState: { errors },
  } = useFormContext();

  const [formInitialized, setFormInitialized] = useState(false);
  const watchedEmployee = watch("employee_id");
  const watchedAttachments = watch("attachments");

  const handleClose = () => {
    setFormInitialized(false);
    reset();
    onClose();
  };

  useEffect(() => {
    if (open) {
      setFormInitialized(false);
    }
  }, [open]);

  useEffect(() => {
    if (open && submissionData && !formInitialized && !isLoading) {
      const result = submissionData.result || submissionData;
      const submittable = result.submittable || result;
      const employee = submittable.employee;

      if (submittable) {
        const employeeName = employee?.full_name || "Unknown Employee";

        const formData = {
          form_id: { id: result.form?.id || 4 },
          employee_id: {
            id: submittable.employee_id || employee?.id,
            employee_name: employeeName,
            full_name: employeeName,
            position_title: submittable.from_position?.title?.name || "N/A",
            department:
              submittable.from_position?.charging?.department_name || "N/A",
            sub_unit:
              submittable.from_position?.charging?.sub_unit_name || "N/A",
            schedule: submittable.from_position?.schedule?.name || "N/A",
          },
          movement_type_id: submittable.movement_type
            ? {
                id: submittable.movement_type.id,
                name: submittable.movement_type.name,
              }
            : null,
          effective_date: submittable.effective_date
            ? dayjs(submittable.effective_date)
            : null,
          to_position_id: submittable.to_position
            ? {
                id: submittable.to_position.id,
                name: submittable.to_position.title?.name || "Unknown Position",
              }
            : null,
        };

        Object.keys(formData).forEach((key) => {
          setValue(key, formData[key], { shouldValidate: false });
        });

        const attachmentsData = submittable.attachments || [];
        const attachmentFieldsData =
          attachmentsData.length > 0
            ? attachmentsData.map((attachment) => ({
                id: generateUniqueId(),
                file_attachment: null,
                existing_file_name:
                  attachment.original_filename || "Unknown file",
                existing_file_path: attachment.file_path,
                existing_file_id: attachment.id,
                is_new_file: false,
                keep_existing: true,
              }))
            : [];

        setValue("attachments", attachmentFieldsData, {
          shouldValidate: false,
        });
        setFormInitialized(true);
      }
    }
  }, [open, submissionData, formInitialized, isLoading, setValue]);

  const isReadOnly = true;
  const isLoadingEmployeeData = false;

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <StyledDialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <StyledDialogTitle>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <AssignmentIcon sx={{ color: "rgb(33, 61, 112)" }} />
            <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
              VIEW DATA CHANGE
            </Typography>
          </Box>
          <IconButton
            onClick={handleClose}
            sx={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              backgroundColor: "#fff",
              "&:hover": { backgroundColor: "#f5f5f5" },
              transition: "all 0.2s ease-in-out",
            }}>
            <CloseIcon sx={{ fontSize: "18px", color: "#333" }} />
          </IconButton>
        </StyledDialogTitle>

        <StyledDialogContent>
          {isLoading || !formInitialized ? (
            <Box sx={{ p: 3 }}>
              <Skeleton variant="rectangular" height={60} sx={{ mb: 2 }} />
              <Skeleton variant="rectangular" height={60} sx={{ mb: 2 }} />
              <Skeleton variant="rectangular" height={60} sx={{ mb: 2 }} />
              <Skeleton variant="rectangular" height={60} sx={{ mb: 2 }} />
              <Skeleton variant="rectangular" height={100} />
            </Box>
          ) : (
            <Box>
              {(watchedEmployee && watchedEmployee.employee_name) ||
              isLoadingEmployeeData ? (
                <Box sx={{ marginLeft: 2.1 }}>
                  <Grid container spacing={0}>
                    <Grid item xs={12} md={6}>
                      <Box
                        sx={{
                          padding: 2,
                          border: "none",
                          borderRadius: "4px",
                          width: "403px",
                        }}>
                        <Typography
                          variant="subtitle2"
                          sx={{
                            fontWeight: "bold",
                            color: "rgb(33, 61, 112)",
                            marginBottom: 1.5,
                            fontSize: "11px",
                            textTransform: "uppercase",
                            letterSpacing: "0.5px",
                          }}>
                          DEPARTMENT
                        </Typography>
                        {isLoadingEmployeeData ? (
                          <Skeleton
                            variant="text"
                            width="70%"
                            height={24}
                            sx={{ marginBottom: 2.5 }}
                          />
                        ) : (
                          <Typography
                            variant="body2"
                            sx={{
                              fontSize: "14px",
                              fontWeight: 600,
                              lineHeight: 1.3,
                              color: "#1a1a1a",
                              marginBottom: 2.5,
                            }}>
                            {watchedEmployee.department ||
                              submissionData?.result?.submittable?.from_position
                                ?.charging?.department_name ||
                              "N/A"}
                          </Typography>
                        )}
                        <Typography
                          variant="subtitle2"
                          sx={{
                            fontWeight: "bold",
                            color: "rgb(33, 61, 112)",
                            marginBottom: 1.5,
                            fontSize: "11px",
                            textTransform: "uppercase",
                            letterSpacing: "0.5px",
                          }}>
                          SCHEDULE
                        </Typography>
                        {isLoadingEmployeeData ? (
                          <Skeleton variant="text" width="60%" height={24} />
                        ) : (
                          <Typography
                            variant="body2"
                            sx={{
                              fontSize: "14px",
                              fontWeight: 600,
                              lineHeight: 1.3,
                              color: "#1a1a1a",
                            }}>
                            {watchedEmployee.schedule ||
                              submissionData?.result?.submittable?.from_position
                                ?.schedule?.name ||
                              "N/A"}
                          </Typography>
                        )}
                      </Box>
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <Box
                        sx={{
                          padding: 2,
                          border: "none",
                          borderRadius: "4px",
                          width: "403px",
                        }}>
                        <Typography
                          variant="subtitle2"
                          sx={{
                            fontWeight: "bold",
                            color: "rgb(33, 61, 112)",
                            marginBottom: 1.5,
                            fontSize: "11px",
                            textTransform: "uppercase",
                            letterSpacing: "0.5px",
                          }}>
                          POSITION FROM
                        </Typography>
                        {isLoadingEmployeeData ? (
                          <Skeleton
                            variant="text"
                            width="85%"
                            height={24}
                            sx={{ marginBottom: 2.5 }}
                          />
                        ) : (
                          <Typography
                            variant="body2"
                            sx={{
                              fontSize: "14px",
                              fontWeight: 600,
                              lineHeight: 1.3,
                              color: "#1a1a1a",
                              marginBottom: 2.5,
                            }}>
                            {submissionData?.result?.submittable?.from_position
                              ?.title?.name ||
                              watchedEmployee.position_title ||
                              "N/A"}
                          </Typography>
                        )}

                        <Typography
                          variant="subtitle2"
                          sx={{
                            fontWeight: "bold",
                            color: "rgb(33, 61, 112)",
                            marginBottom: 1.5,
                            fontSize: "11px",
                            textTransform: "uppercase",
                            letterSpacing: "0.5px",
                          }}>
                          SUB UNIT
                        </Typography>
                        {isLoadingEmployeeData ? (
                          <Skeleton
                            variant="text"
                            width="65%"
                            height={24}
                            sx={{ marginBottom: 2.5 }}
                          />
                        ) : (
                          <Typography
                            variant="body2"
                            sx={{
                              fontSize: "14px",
                              fontWeight: 600,
                              lineHeight: 1.3,
                              color: "#1a1a1a",
                              marginBottom: 2.5,
                            }}>
                            {watchedEmployee.sub_unit ||
                              submissionData?.result?.submittable?.from_position
                                ?.charging?.sub_unit_name ||
                              "N/A"}
                          </Typography>
                        )}
                      </Box>
                    </Grid>
                  </Grid>
                </Box>
              ) : null}

              <Box
                sx={{
                  padding: "24px",
                  paddingLeft: "40px",
                  paddingRight: "40px",
                }}>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <Controller
                    name="form_id"
                    control={control}
                    render={({ field }) => (
                      <input
                        type="hidden"
                        {...field}
                        value={field.value?.id || 4}
                      />
                    )}
                  />

                  <Box sx={{ display: "flex", gap: 2 }}>
                    <Box sx={{ flex: 1 }}>
                      {isLoadingEmployeeData ? (
                        <Skeleton variant="rounded" width="100%" height={56} />
                      ) : (
                        <Controller
                          name="employee_id"
                          control={control}
                          render={({ field: { onChange, value } }) => (
                            <FormControl fullWidth>
                              <TextField
                                label={
                                  <span>
                                    Employee{" "}
                                    <span
                                      style={{
                                        color: "red",
                                        marginLeft: "2px",
                                      }}>
                                      *
                                    </span>
                                  </span>
                                }
                                value={value?.employee_name || ""}
                                fullWidth
                                disabled
                                sx={{
                                  "& .MuiOutlinedInput-root": {
                                    "&:hover fieldset": {
                                      borderColor: "rgba(0, 0, 0, 0.23)",
                                    },
                                    "&.Mui-focused fieldset": {
                                      borderColor: "#1976d2",
                                    },
                                  },
                                }}
                              />
                            </FormControl>
                          )}
                        />
                      )}
                    </Box>

                    <Box sx={{ flex: 1 }}>
                      {isLoadingEmployeeData ? (
                        <Skeleton variant="rounded" width="100%" height={56} />
                      ) : (
                        <Controller
                          name="movement_type_id"
                          control={control}
                          render={({ field: { onChange, value } }) => (
                            <FormControl fullWidth>
                              <TextField
                                label={
                                  <span>
                                    Movement Type{" "}
                                    <span
                                      style={{
                                        color: "red",
                                        marginLeft: "2px",
                                      }}>
                                      *
                                    </span>
                                  </span>
                                }
                                value={value?.name || ""}
                                fullWidth
                                disabled
                                sx={{
                                  "& .MuiOutlinedInput-root": {
                                    "&:hover fieldset": {
                                      borderColor: "rgba(0, 0, 0, 0.23)",
                                    },
                                    "&.Mui-focused fieldset": {
                                      borderColor: "#1976d2",
                                    },
                                  },
                                }}
                              />
                            </FormControl>
                          )}
                        />
                      )}
                    </Box>
                  </Box>

                  <Box sx={{ display: "flex", gap: 2 }}>
                    <Box sx={{ flex: 1 }}>
                      {isLoadingEmployeeData ? (
                        <Skeleton variant="rounded" width="100%" height={56} />
                      ) : (
                        <Controller
                          name="effective_date"
                          control={control}
                          render={({ field: { onChange, value } }) => (
                            <DatePicker
                              label={
                                <span>
                                  Effective Date{" "}
                                  <span
                                    style={{
                                      color: "red",
                                      marginLeft: "2px",
                                    }}>
                                    *
                                  </span>
                                </span>
                              }
                              value={value}
                              onChange={onChange}
                              disabled
                              slotProps={{
                                textField: {
                                  fullWidth: true,
                                  sx: {
                                    "& .MuiOutlinedInput-root": {
                                      "&:hover fieldset": {
                                        borderColor: "rgba(0, 0, 0, 0.23)",
                                      },
                                      "&.Mui-focused fieldset": {
                                        borderColor: "#1976d2",
                                      },
                                    },
                                  },
                                },
                              }}
                            />
                          )}
                        />
                      )}
                    </Box>

                    <Box sx={{ flex: 1 }}>
                      {isLoadingEmployeeData ? (
                        <Skeleton variant="rounded" width="100%" height={56} />
                      ) : (
                        <Controller
                          name="to_position_id"
                          control={control}
                          render={({ field: { onChange, value } }) => (
                            <FormControl fullWidth>
                              <TextField
                                label={
                                  <span>
                                    Position to{" "}
                                    <span
                                      style={{
                                        color: "red",
                                        marginLeft: "2px",
                                      }}>
                                      *
                                    </span>
                                  </span>
                                }
                                value={value?.name || ""}
                                fullWidth
                                disabled
                                sx={{
                                  "& .MuiOutlinedInput-root": {
                                    "&:hover fieldset": {
                                      borderColor: "rgba(0, 0, 0, 0.23)",
                                    },
                                    "&.Mui-focused fieldset": {
                                      borderColor: "#1976d2",
                                    },
                                  },
                                }}
                              />
                            </FormControl>
                          )}
                        />
                      )}
                    </Box>
                  </Box>

                  <Box sx={{ mt: 2 }}>
                    <DataChangeAttachmentFields
                      isLoading={isLoading}
                      mode="view"
                      selectedEntry={submissionData}
                    />
                  </Box>
                </Box>
              </Box>
            </Box>
          )}
        </StyledDialogContent>
      </StyledDialog>
    </LocalizationProvider>
  );
};

export default DataChangeMonitoringModal;
