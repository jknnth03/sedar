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
import { useGetMRFSubmissionByIdQuery } from "../../../features/api/monitoring/mrfMonitoringApi";
import MonitoringAttachmentField from "./MonitoringAttachmentFields";

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

const MrfMonitoringModal = ({
  open,
  onClose,
  submissionId,
  submissionData,
  isLoading: externalLoading,
}) => {
  const { reset, setValue, control, watch } = useFormContext();

  const [formInitialized, setFormInitialized] = useState(false);
  const watchedPosition = watch("position_id");

  const {
    data: fetchedData,
    isLoading: isFetchingData,
    isFetching,
  } = useGetMRFSubmissionByIdQuery(submissionId, {
    skip: !open || !submissionId,
  });

  const effectiveSubmissionData = fetchedData || submissionData;
  const isLoading = externalLoading || isFetchingData || isFetching;

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
    if (open && effectiveSubmissionData && !formInitialized && !isLoading) {
      const result = effectiveSubmissionData.result || effectiveSubmissionData;
      const submittable = result.submittable || result;

      if (submittable) {
        const formData = {
          form_id: { id: result.form?.id || 1 },
          position_id: submittable.position
            ? {
                id: submittable.position.id,
                name: submittable.position.title?.name || "Unknown Position",
                department:
                  submittable.position.charging?.department_name || "N/A",
                sub_unit: submittable.position.charging?.sub_unit_name || "N/A",
                schedule: submittable.position.schedule?.name || "N/A",
              }
            : null,
          requisition_type_id: submittable.requisition_type
            ? {
                id: submittable.requisition_type.id,
                name: submittable.requisition_type.name,
              }
            : null,
          job_level_id: submittable.job_level
            ? {
                id: submittable.job_level.id,
                label: submittable.job_level.label,
              }
            : null,
          expected_salary: submittable.expected_salary || "",
          employment_type: submittable.employment_type || "",
          justification: submittable.justification || "",
          remarks: submittable.remarks || "",
        };

        Object.keys(formData).forEach((key) => {
          setValue(key, formData[key], { shouldValidate: false });
        });

        setFormInitialized(true);
      }
    }
  }, [open, effectiveSubmissionData, formInitialized, isLoading, setValue]);

  const isLoadingPositionData = false;

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <StyledDialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <StyledDialogTitle>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <AssignmentIcon sx={{ color: "rgb(33, 61, 112)" }} />
            <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
              VIEW MRF SUBMISSION
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
              {(watchedPosition && watchedPosition.name) ||
              isLoadingPositionData ? (
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
                        {isLoadingPositionData ? (
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
                            {watchedPosition.department ||
                              effectiveSubmissionData?.result?.submittable
                                ?.position?.charging?.department_name ||
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
                        {isLoadingPositionData ? (
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
                            {watchedPosition.schedule ||
                              effectiveSubmissionData?.result?.submittable
                                ?.position?.schedule?.name ||
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
                          POSITION
                        </Typography>
                        {isLoadingPositionData ? (
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
                            {effectiveSubmissionData?.result?.submittable
                              ?.position?.title?.name ||
                              watchedPosition.name ||
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
                        {isLoadingPositionData ? (
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
                            {watchedPosition.sub_unit ||
                              effectiveSubmissionData?.result?.submittable
                                ?.position?.charging?.sub_unit_name ||
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
                        value={field.value?.id || 1}
                      />
                    )}
                  />

                  <Box sx={{ display: "flex", gap: 2 }}>
                    <Box sx={{ flex: 1 }}>
                      {isLoadingPositionData ? (
                        <Skeleton variant="rounded" width="100%" height={56} />
                      ) : (
                        <Controller
                          name="requisition_type_id"
                          control={control}
                          render={({ field: { onChange, value } }) => (
                            <FormControl fullWidth>
                              <TextField
                                label={
                                  <span>
                                    Requisition Type{" "}
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

                    <Box sx={{ flex: 1 }}>
                      {isLoadingPositionData ? (
                        <Skeleton variant="rounded" width="100%" height={56} />
                      ) : (
                        <Controller
                          name="position_id"
                          control={control}
                          render={({ field: { onChange, value } }) => (
                            <FormControl fullWidth>
                              <TextField
                                label={
                                  <span>
                                    Position{" "}
                                    <span
                                      style={{
                                        color: "red",
                                        marginLeft: "2px",
                                      }}>
                                      *
                                    </span>
                                  </span>
                                }
                                value={
                                  value?.title_with_unit || value?.name || ""
                                }
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
                      {isLoadingPositionData ? (
                        <Skeleton variant="rounded" width="100%" height={56} />
                      ) : (
                        <Controller
                          name="job_level_id"
                          control={control}
                          render={({ field: { onChange, value } }) => (
                            <FormControl fullWidth>
                              <TextField
                                label={
                                  <span>
                                    Job Level{" "}
                                    <span
                                      style={{
                                        color: "red",
                                        marginLeft: "2px",
                                      }}>
                                      *
                                    </span>
                                  </span>
                                }
                                value={value?.label || value?.name || ""}
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
                      {isLoadingPositionData ? (
                        <Skeleton variant="rounded" width="100%" height={56} />
                      ) : (
                        <Controller
                          name="expected_salary"
                          control={control}
                          render={({ field: { onChange, value } }) => (
                            <FormControl fullWidth>
                              <TextField
                                label={
                                  <span>
                                    Expected Salary{" "}
                                    <span
                                      style={{
                                        color: "red",
                                        marginLeft: "2px",
                                      }}>
                                      *
                                    </span>
                                  </span>
                                }
                                value={value || ""}
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
                      {isLoadingPositionData ? (
                        <Skeleton variant="rounded" width="100%" height={56} />
                      ) : (
                        <Controller
                          name="employment_type"
                          control={control}
                          render={({ field: { onChange, value } }) => (
                            <FormControl fullWidth>
                              <TextField
                                label={
                                  <span>
                                    Employment Type{" "}
                                    <span
                                      style={{
                                        color: "red",
                                        marginLeft: "2px",
                                      }}>
                                      *
                                    </span>
                                  </span>
                                }
                                value={value || ""}
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
                      {isLoadingPositionData ? (
                        <Skeleton variant="rounded" width="100%" height={56} />
                      ) : (
                        <Controller
                          name="justification"
                          control={control}
                          render={({ field: { onChange, value } }) => (
                            <FormControl fullWidth>
                              <TextField
                                label={
                                  <span>
                                    Justification{" "}
                                    <span
                                      style={{
                                        color: "red",
                                        marginLeft: "2px",
                                      }}>
                                      *
                                    </span>
                                  </span>
                                }
                                value={value || ""}
                                fullWidth
                                multiline
                                rows={2}
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

                  <Box sx={{ flex: 1 }}>
                    {isLoadingPositionData ? (
                      <Skeleton variant="rounded" width="100%" height={120} />
                    ) : (
                      <Controller
                        name="remarks"
                        control={control}
                        render={({ field: { onChange, value } }) => (
                          <FormControl fullWidth>
                            <TextField
                              label="Remarks"
                              value={value || ""}
                              fullWidth
                              multiline
                              rows={3}
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

                  <Box sx={{ mt: 2 }}>
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
                      ATTACHMENT
                    </Typography>
                    <MonitoringAttachmentField
                      submissionData={effectiveSubmissionData}
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

export default MrfMonitoringModal;
