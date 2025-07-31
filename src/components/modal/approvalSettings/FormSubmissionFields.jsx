import React, { useState, useEffect } from "react";
import { useFormContext, Controller } from "react-hook-form";
import {
  Grid,
  TextField,
  Autocomplete,
  CircularProgress,
  Box,
  Typography,
  FormControl,
  FormHelperText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  MenuItem,
} from "@mui/material";
import {
  CloudUpload as CloudUploadIcon,
  AttachFile as AttachFileIcon,
  Close as CloseIcon,
  Download as DownloadIcon,
} from "@mui/icons-material";
import { useGetAllApprovalFormsQuery } from "../../../features/api/approvalsetting/approvalFormApi";
import { useGetAllPositionsQuery } from "../../../features/api/masterlist/positionsApi";
import { useGetAllJobLevelsQuery } from "../../../features/api/masterlist/jobLevelsApi";
import { useGetAllRequisitionsQuery } from "../../../features/api/extras/requisitionsApi";
import { useGetEmployeesQuery } from "../../../features/api/employee/mainApi";
import { useGetFormSubmissionAttachmentQuery } from "../../../features/api/approvalsetting/formSubmissionApi";
import {
  fileInputConfig,
  expectedSalaryInputProps,
} from "../../../schema/approver/formSubmissionSchema";

const FormSubmissionFields = ({
  mode,
  selectedEntry,
  onFileChange,
  selectedFile,
  disabled = false,
}) => {
  const {
    control,
    formState: { errors },
    setValue,
    watch,
    clearErrors,
  } = useFormContext();

  const [fileViewerOpen, setFileViewerOpen] = useState(false);
  const [fileUrl, setFileUrl] = useState(null);
  const [currentFormSubmissionId, setCurrentFormSubmissionId] = useState(null);

  const watchedRequisitionType = watch("requisition_type_id");
  const watchedAttachmentFilename = watch("manpower_attachment_filename");
  const watchedFormAttachment = watch("manpower_form_attachment");
  const watchedEmploymentType = watch("employment_type");

  const { data: approvalFormsData = [], isLoading: isLoadingForms } =
    useGetAllApprovalFormsQuery();
  const { data: positionsData = [], isLoading: isLoadingPositions } =
    useGetAllPositionsQuery();
  const { data: jobLevelsData = [], isLoading: isLoadingJobLevels } =
    useGetAllJobLevelsQuery();
  const { data: requisitionsData = [], isLoading: isLoadingRequisitions } =
    useGetAllRequisitionsQuery();
  const { data: employeesData = [], isLoading: isLoadingEmployees } =
    useGetEmployeesQuery({ pagination: false });

  const {
    data: attachmentData,
    isLoading: isLoadingAttachment,
    error: attachmentError,
  } = useGetFormSubmissionAttachmentQuery(currentFormSubmissionId, {
    skip: !fileViewerOpen || !currentFormSubmissionId,
  });

  const employmentTypeOptions = [
    "PROBATIONARY",
    "REGULAR",
    "PROJECT BASED",
    "AGENCY HIRED",
  ];

  const approvalForms = Array.isArray(approvalFormsData?.result?.data)
    ? approvalFormsData.result.data
    : Array.isArray(approvalFormsData?.result)
    ? approvalFormsData.result
    : Array.isArray(approvalFormsData)
    ? approvalFormsData
    : [];

  const positions = Array.isArray(positionsData?.result)
    ? positionsData.result
    : Array.isArray(positionsData)
    ? positionsData
    : [];

  const jobLevels = Array.isArray(jobLevelsData?.result)
    ? jobLevelsData.result
    : Array.isArray(jobLevelsData)
    ? jobLevelsData
    : [];

  const requisitions = Array.isArray(requisitionsData?.result)
    ? requisitionsData.result
    : Array.isArray(requisitionsData)
    ? requisitionsData
    : [];

  const employees = Array.isArray(employeesData?.result?.data)
    ? employeesData.result.data
    : Array.isArray(employeesData?.result)
    ? employeesData.result
    : Array.isArray(employeesData)
    ? employeesData
    : [];

  const isReadOnly = mode === "view" || disabled;
  const isCreateMode = mode === "create";
  const isEditMode = mode === "edit";
  const isViewMode = mode === "view" || disabled;

  const isAdditionalManpower = () => {
    if (!watchedRequisitionType) return false;
    return watchedRequisitionType.name === "ADDITIONAL MANPOWER";
  };

  const shouldDisableEmployeeReplacement = () => {
    return isReadOnly || isAdditionalManpower();
  };

  const handleFileDownload = (fileUrl, filename) => {
    const link = document.createElement("a");
    link.href = fileUrl;
    link.download = filename || "attachment";
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileViewerOpen = () => {
    const formSubmissionId = selectedEntry?.id;
    if (formSubmissionId) {
      setCurrentFormSubmissionId(formSubmissionId);
      setFileViewerOpen(true);
    }
  };

  const handleFileViewerClose = () => {
    setFileViewerOpen(false);
    setCurrentFormSubmissionId(null);
  };

  const handleDownloadFromViewer = () => {
    if (attachmentData) {
      const filename = getDisplayFilename();
      handleFileDownload(attachmentData, filename);
    } else {
      handleFileDownload(getDownloadUrl(), getDisplayFilename());
    }
  };

  const handleFileChange = (event) => {
    if (disabled) return;

    const file = event.target.files[0];
    if (file) {
      setValue("manpower_form_attachment", file);
      setValue("manpower_attachment_filename", "");

      if (onFileChange) {
        onFileChange(file);
      }
    }
  };

  const handleEmploymentTypeChange = (event) => {
    if (disabled) return;

    const value = event.target.value;
    setValue("employment_type", value);

    if (value && value !== "") {
      clearErrors("employment_type");
    }
  };

  useEffect(() => {
    if (isAdditionalManpower()) {
      setValue("employee_to_be_replaced_id", null);
    }
  }, [watchedRequisitionType, setValue]);

  useEffect(() => {
    if (mode === "edit" && selectedEntry) {
      const formData = {
        position_id: selectedEntry.submittable?.position || null,
        job_level_id: selectedEntry.submittable?.job_level || null,
        employment_type: selectedEntry.submittable?.employment_type || "",
        expected_salary: selectedEntry.submittable?.expected_salary || "",
        requisition_type_id:
          selectedEntry.submittable?.requisition_type || null,
        employee_to_be_replaced_id:
          selectedEntry.submittable?.employee_to_be_replaced || null,
        justification: selectedEntry.submittable?.justification || "",
        remarks: selectedEntry.submittable?.remarks || "",
        manpower_form_attachment: selectedEntry.manpower_form_attachment || "",
        manpower_attachment_filename:
          selectedEntry.manpower_attachment_filename || "",
      };

      Object.entries(formData).forEach(([key, value]) => {
        setValue(key, value, { shouldValidate: false, shouldDirty: false });
      });

      setTimeout(() => {
        clearErrors();
      }, 100);
    }
  }, [mode, selectedEntry, setValue, clearErrors]);

  useEffect(() => {
    if (attachmentData) {
      const url = URL.createObjectURL(attachmentData);
      setFileUrl(url);

      return () => URL.revokeObjectURL(url);
    }
  }, [attachmentData]);

  const StyledTextField = ({ label, required = false, ...props }) => (
    <TextField
      {...props}
      label={
        required ? (
          <span>
            {label}{" "}
            <span style={{ color: isViewMode ? "gray" : "red" }}>*</span>
          </span>
        ) : (
          label
        )
      }
    />
  );

  const hasExistingFile = () => {
    if (selectedFile && selectedFile instanceof File) {
      return false;
    }

    if (selectedFile && typeof selectedFile === "string") {
      return true;
    }

    if (watchedFormAttachment && typeof watchedFormAttachment === "string") {
      return true;
    }

    if (selectedEntry?.manpower_form_attachment && !selectedFile) {
      return true;
    }

    return false;
  };

  const getDisplayFilename = () => {
    if (selectedFile && selectedFile instanceof File) {
      return selectedFile.name;
    }

    if (selectedFile && typeof selectedFile === "string") {
      return selectedFile;
    }

    if (watchedAttachmentFilename) {
      return watchedAttachmentFilename;
    }

    if (selectedEntry?.manpower_attachment_filename) {
      return selectedEntry.manpower_attachment_filename;
    }

    if (selectedEntry?.manpower_form_attachment) {
      return selectedEntry.manpower_form_attachment.split("/").pop();
    }

    if (watchedFormAttachment && typeof watchedFormAttachment === "string") {
      return watchedFormAttachment.split("/").pop();
    }

    return "Download File";
  };

  const getDownloadUrl = () => {
    if (selectedEntry?.manpower_form_attachment) {
      return selectedEntry.manpower_form_attachment;
    }

    if (watchedFormAttachment && typeof watchedFormAttachment === "string") {
      return watchedFormAttachment;
    }

    return "";
  };

  const hasNewFileSelected = () => {
    return selectedFile && selectedFile instanceof File;
  };

  const canViewFile = () => {
    return hasExistingFile() && selectedEntry?.id && !hasNewFileSelected();
  };

  const FileViewerDialog = () => {
    return (
      <Dialog
        open={fileViewerOpen}
        onClose={handleFileViewerClose}
        maxWidth={false}
        fullWidth={false}
        PaperProps={{
          sx: {
            width: "77vw",
            height: "96vh",
            maxWidth: "80vw",
            maxHeight: "96vh",
            margin: "0",
            position: "fixed",
            top: "2vh",
            left: "320px",
            transform: "none",
            borderRadius: 2,
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
          },
        }}
        BackdropProps={{
          sx: {
            backgroundColor: "rgba(0, 0, 0, 0.7)",
          },
        }}>
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: 1,
            borderColor: "divider",
            padding: "12px 24px",
            backgroundColor: "#f8f9fa",
          }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Attachment - {getDisplayFilename()}
          </Typography>
          <IconButton
            onClick={handleFileViewerClose}
            size="small"
            sx={{
              color: "text.secondary",
              "&:hover": {
                backgroundColor: "rgba(0, 0, 0, 0.04)",
              },
            }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent
          sx={{
            p: 0,
            position: "relative",
            height: "calc(90vh - 140px)",
            overflow: "hidden",
          }}>
          {isLoadingAttachment ? (
            <Box
              display="flex"
              justifyContent="center"
              alignItems="center"
              height="100%"
              flexDirection="column">
              <CircularProgress size={48} />
              <Typography
                variant="body1"
                sx={{ mt: 2, color: "text.secondary" }}>
                Loading attachment...
              </Typography>
            </Box>
          ) : attachmentError ? (
            <Box
              display="flex"
              justifyContent="center"
              alignItems="center"
              height="100%"
              flexDirection="column">
              <Typography variant="h6" color="error" gutterBottom>
                Error loading attachment
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Unable to load the attachment. Please try again.
              </Typography>
            </Box>
          ) : (
            <Box
              sx={{
                width: "100%",
                height: "100%",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: "#f5f5f5",
              }}>
              {attachmentData ? (
                <iframe
                  src={fileUrl}
                  width="100%"
                  height="100%"
                  style={{
                    border: "none",
                    borderRadius: "0 0 8px 8px",
                  }}
                  title="File Attachment"
                />
              ) : (
                <Box textAlign="center">
                  <AttachFileIcon
                    sx={{ fontSize: 64, color: "text.secondary", mb: 2 }}
                  />
                  <Typography variant="h6" color="text.secondary">
                    {getDisplayFilename()}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mt: 1 }}>
                    File preview not available
                  </Typography>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
      </Dialog>
    );
  };

  return (
    <>
      <Grid container spacing={1.2}>
        <Grid item xs={12} md={6}>
          <Grid
            item
            xs={12}
            sm={4}
            sx={{ minWidth: "416px", maxWidth: "416px" }}></Grid>
          <Controller
            name="position_id"
            control={control}
            render={({ field }) => (
              <Autocomplete
                options={positions}
                getOptionLabel={(option) => option?.title_with_unit || ""}
                value={field.value || null}
                onChange={(event, newValue) => {
                  if (!disabled) field.onChange(newValue);
                }}
                isOptionEqualToValue={(option, value) =>
                  option?.id === value?.id
                }
                disabled={isReadOnly}
                loading={!isViewMode && isLoadingPositions}
                renderInput={(params) => (
                  <StyledTextField
                    {...params}
                    label="Position"
                    required={true}
                    error={!!errors.position_id}
                    helperText={errors.position_id?.message}
                    sx={{
                      backgroundColor: isReadOnly ? "#f5f5f5" : "white",
                    }}
                    InputProps={{
                      ...params.InputProps,
                      endAdornment: (
                        <>
                          {!isViewMode && isLoadingPositions ? (
                            <CircularProgress color="inherit" size={20} />
                          ) : null}
                          {params.InputProps.endAdornment}
                        </>
                      ),
                    }}
                  />
                )}
              />
            )}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <Grid
            item
            xs={12}
            sm={4}
            sx={{ minWidth: "416px", maxWidth: "416px" }}></Grid>
          <Controller
            name="job_level_id"
            control={control}
            render={({ field }) => (
              <Autocomplete
                options={jobLevels}
                getOptionLabel={(option) => option?.label || ""}
                value={field.value || null}
                onChange={(event, newValue) => {
                  if (!disabled) field.onChange(newValue);
                }}
                isOptionEqualToValue={(option, value) =>
                  option?.id === value?.id
                }
                disabled={isReadOnly}
                loading={!isViewMode && isLoadingJobLevels}
                renderInput={(params) => (
                  <StyledTextField
                    {...params}
                    label="Job Level"
                    required={true}
                    error={!!errors.job_level_id}
                    helperText={errors.job_level_id?.message}
                    sx={{
                      backgroundColor: isReadOnly ? "#f5f5f5" : "white",
                    }}
                    InputProps={{
                      ...params.InputProps,
                      endAdornment: (
                        <>
                          {!isViewMode && isLoadingJobLevels ? (
                            <CircularProgress color="inherit" size={20} />
                          ) : null}
                          {params.InputProps.endAdornment}
                        </>
                      ),
                    }}
                  />
                )}
              />
            )}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <Grid
            item
            xs={12}
            sm={4}
            sx={{ minWidth: "416px", maxWidth: "416px" }}></Grid>
          <Controller
            name="employment_type"
            control={control}
            render={({ field }) => (
              <StyledTextField
                select
                {...field}
                label="Employment Type"
                value={field.value || ""}
                fullWidth
                required={true}
                error={!!errors.employment_type}
                helperText={errors.employment_type?.message}
                disabled={isReadOnly}
                sx={{
                  backgroundColor: isReadOnly ? "#f5f5f5" : "white",
                }}
                onChange={handleEmploymentTypeChange}>
                {employmentTypeOptions.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </StyledTextField>
            )}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <Grid
            item
            xs={12}
            sm={4}
            sx={{ minWidth: "416px", maxWidth: "416px" }}></Grid>
          <Controller
            name="expected_salary"
            control={control}
            render={({ field }) => (
              <StyledTextField
                {...field}
                label="Expected Salary"
                required={true}
                fullWidth
                type="number"
                inputProps={expectedSalaryInputProps}
                error={!!errors.expected_salary}
                helperText={errors.expected_salary?.message}
                disabled={isReadOnly}
                sx={{
                  backgroundColor: isReadOnly ? "#f5f5f5" : "white",
                }}
              />
            )}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <Grid
            item
            xs={12}
            sm={4}
            sx={{ minWidth: "416px", maxWidth: "416px" }}></Grid>
          <Controller
            name="requisition_type_id"
            control={control}
            render={({ field }) => (
              <Autocomplete
                options={requisitions}
                getOptionLabel={(option) => option?.name || ""}
                value={field.value || null}
                onChange={(event, newValue) => {
                  if (!disabled) field.onChange(newValue);
                }}
                isOptionEqualToValue={(option, value) =>
                  option?.id === value?.id
                }
                disabled={isReadOnly}
                loading={!isViewMode && isLoadingRequisitions}
                renderInput={(params) => (
                  <StyledTextField
                    {...params}
                    label="Requisition Type"
                    required={true}
                    error={!!errors.requisition_type_id}
                    helperText={errors.requisition_type_id?.message}
                    sx={{
                      backgroundColor: isReadOnly ? "#f5f5f5" : "white",
                    }}
                    InputProps={{
                      ...params.InputProps,
                      endAdornment: (
                        <>
                          {!isViewMode && isLoadingRequisitions ? (
                            <CircularProgress color="inherit" size={20} />
                          ) : null}
                          {params.InputProps.endAdornment}
                        </>
                      ),
                    }}
                  />
                )}
              />
            )}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <Grid
            item
            xs={12}
            sm={4}
            sx={{ minWidth: "416px", maxWidth: "416px" }}></Grid>
          <Controller
            name="employee_to_be_replaced_id"
            control={control}
            render={({ field }) => (
              <Autocomplete
                options={employees}
                getOptionLabel={(option) => option?.employee_name || ""}
                value={field.value || null}
                onChange={(event, newValue) => {
                  if (!disabled) field.onChange(newValue);
                }}
                isOptionEqualToValue={(option, value) =>
                  option?.id === value?.id
                }
                disabled={shouldDisableEmployeeReplacement()}
                loading={!isViewMode && isLoadingEmployees}
                renderInput={(params) => (
                  <StyledTextField
                    {...params}
                    label="Employee to be Replaced"
                    required={true}
                    error={!!errors.employee_to_be_replaced_id}
                    sx={{
                      backgroundColor: shouldDisableEmployeeReplacement()
                        ? "#f5f5f5"
                        : "white",
                    }}
                    InputProps={{
                      ...params.InputProps,
                      endAdornment: (
                        <>
                          {!isViewMode && isLoadingEmployees ? (
                            <CircularProgress color="inherit" size={20} />
                          ) : null}
                          {params.InputProps.endAdornment}
                        </>
                      ),
                    }}
                  />
                )}
              />
            )}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <Grid
            item
            xs={12}
            sm={4}
            sx={{ minWidth: "416px", maxWidth: "416px" }}></Grid>
          <Controller
            name="justification"
            control={control}
            render={({ field }) => (
              <StyledTextField
                {...field}
                label="Justification"
                required={true}
                fullWidth
                multiline
                rows={3}
                error={!!errors.justification}
                helperText={errors.justification?.message}
                disabled={isReadOnly}
                sx={{
                  backgroundColor: isReadOnly ? "#f5f5f5" : "white",
                }}
              />
            )}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <Grid
            item
            xs={12}
            sm={4}
            sx={{ minWidth: "416px", maxWidth: "416px" }}></Grid>
          <Controller
            name="remarks"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Remarks"
                fullWidth
                multiline
                rows={3}
                error={!!errors.remarks}
                helperText={errors.remarks?.message}
                disabled={isReadOnly}
                sx={{
                  backgroundColor: isReadOnly ? "#f5f5f5" : "white",
                }}
              />
            )}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <Grid
            item
            xs={12}
            sm={4}
            sx={{ minWidth: "840px", maxWidth: "840px" }}></Grid>

          <FormControl fullWidth error={!!errors.manpower_form_attachment}>
            <Box
              sx={{
                border: "2px dashed #d1d5db",
                borderRadius: 2,
                p: 3,
                textAlign: "center",
                backgroundColor: isReadOnly ? "#f5f5f5" : "#fafafa",
                cursor: isReadOnly ? "not-allowed" : "pointer",
                "&:hover": {
                  borderColor: isReadOnly ? "#d1d5db" : "#6b7280",
                  backgroundColor: isReadOnly ? "#f5f5f5" : "#f3f4f6",
                },
              }}
              component={isReadOnly ? "div" : "label"}
              htmlFor={isReadOnly ? undefined : "file-upload"}>
              {!isReadOnly && (
                <input
                  id="file-upload"
                  type="file"
                  hidden
                  onChange={handleFileChange}
                  accept={fileInputConfig.accept}
                  disabled={isReadOnly}
                />
              )}

              {hasNewFileSelected() ? (
                <>
                  <CloudUploadIcon
                    sx={{
                      fontSize: 30,
                      color: "#22c55e",
                    }}
                  />
                  <Typography
                    variant="body1"
                    sx={{
                      color: "#374151",
                      fontWeight: 500,
                      mb: 1,
                    }}>
                    New file selected: {selectedFile.name}
                    <span style={{ color: isViewMode ? "gray" : "red" }}>
                      {" "}
                      *
                    </span>
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: "#22c55e",
                      fontStyle: "italic",
                    }}>
                    This file will replace the current attachment when saved
                  </Typography>
                </>
              ) : hasExistingFile() ? (
                <>
                  <AttachFileIcon sx={{ color: "#6b7280", fontSize: 30 }} />
                  <Typography
                    onClick={
                      canViewFile()
                        ? handleFileViewerOpen
                        : () =>
                            handleFileDownload(
                              getDownloadUrl(),
                              getDisplayFilename()
                            )
                    }
                    sx={{
                      color: "#1976d2",
                      textDecoration: "none",
                      "&:hover": {
                        textDecoration: "underline",
                      },
                      cursor: "pointer",
                      fontWeight: 500,
                      mb: 1,
                    }}>
                    {getDisplayFilename()}
                  </Typography>
                  {canViewFile() && (
                    <Typography
                      variant="body2"
                      sx={{
                        color: "#6b7280",
                        mt: 1,
                      }}>
                      Click to view file •{" "}
                      {!isViewMode && "Upload new file to replace"}
                    </Typography>
                  )}
                  {!canViewFile() && !isViewMode && (
                    <Typography
                      variant="body2"
                      sx={{
                        color: "#6b7280",
                        mt: 1,
                      }}>
                      Click to download • Upload new file to replace
                    </Typography>
                  )}
                </>
              ) : (
                <>
                  <CloudUploadIcon
                    sx={{
                      fontSize: 30,
                      color: isReadOnly ? "#9ca3af" : "#6b7280",
                    }}
                  />
                  <Typography
                    variant="body1"
                    sx={{
                      color: isReadOnly ? "#9ca3af" : "#374151",
                      fontWeight: 500,
                      mb: 1,
                    }}>
                    UPLOAD ATTACHMENT (PDF, DOC, DOCX, JPG, PNG)
                    <span style={{ color: isViewMode ? "gray" : "red" }}>
                      {" "}
                      *
                    </span>
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: isReadOnly ? "#9ca3af" : "#6b7280",
                    }}>
                    Click to browse files or drag and drop
                  </Typography>
                </>
              )}
            </Box>
            {errors.manpower_form_attachment && (
              <FormHelperText>
                {errors.manpower_form_attachment.message}
              </FormHelperText>
            )}
          </FormControl>
        </Grid>
      </Grid>

      <FileViewerDialog />
    </>
  );
};

export default FormSubmissionFields;
