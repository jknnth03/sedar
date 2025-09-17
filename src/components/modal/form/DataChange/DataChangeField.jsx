import React, { useState, useEffect } from "react";
import { useFormContext, Controller } from "react-hook-form";
import {
  Grid,
  TextField,
  Autocomplete,
  CircularProgress,
  Button,
  Box,
  Typography,
} from "@mui/material";
import {
  CloudUpload,
  Visibility,
  Delete,
  AttachFile,
} from "@mui/icons-material";
import { useGetAllApprovalFormsQuery } from "../../../../features/api/approvalsetting/approvalFormApi";
import { useGetAllPositionsQuery } from "../../../../features/api/masterlist/positionsApi";
import { useLazyGetAllDataChangeOptionsQuery } from "../../../../features/api/forms/datachangeApi";
import FileViewerDialog from "../ManpowerForm/FileViewerDialog";

const DataChangeFields = ({
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
  const [currentFormSubmissionId, setCurrentFormSubmissionId] = useState(null);
  const [employeeDropdownOpen, setEmployeeDropdownOpen] = useState(false);
  const [positionDropdownOpen, setPositionDropdownOpen] = useState(false);

  const watchedEmployeeId = watch("employee_id");
  const watchedAttachment = watch("data_change_attachment");
  const watchedAttachmentFilename = watch("data_change_attachment_filename");

  const { data: approvalFormsData = [], isLoading: isLoadingForms } =
    useGetAllApprovalFormsQuery();
  const { data: positionsData = [], isLoading: isLoadingPositions } =
    useGetAllPositionsQuery();

  const [
    triggerEmployees,
    { data: employeesData = [], isLoading: isLoadingEmployees },
  ] = useLazyGetAllDataChangeOptionsQuery();

  useEffect(() => {
    triggerEmployees();
  }, [triggerEmployees]);

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

  const employees = Array.isArray(employeesData?.result?.data)
    ? employeesData.result.data
    : Array.isArray(employeesData?.result)
    ? employeesData.result
    : Array.isArray(employeesData)
    ? employeesData
    : [];

  const isDataReady =
    !isLoadingEmployees &&
    !isLoadingPositions &&
    employees.length > 0 &&
    positions.length > 0;

  const isReadOnly = mode === "view" || disabled;
  const isCreateMode = mode === "create";
  const isEditMode = mode === "edit";
  const isViewMode = mode === "view" || disabled;

  const createEmployeeFromSelectedEntry = () => {
    if (!selectedEntry) return null;

    return {
      id: selectedEntry.employee_id || "selected_entry",
      employee_name: selectedEntry.employee_name,
      full_name: selectedEntry.employee_name,
      employee_code: selectedEntry.employee_code,
      isFromSelectedEntry: true,
    };
  };

  const getEmployeeOptions = () => {
    const baseEmployees = [...employees];

    if (selectedEntry && (isViewMode || isEditMode)) {
      const entryEmployee = createEmployeeFromSelectedEntry();
      if (entryEmployee) {
        const existsInDropdown = employees.find(
          (emp) =>
            emp.id === entryEmployee.id ||
            emp.employee_name === entryEmployee.employee_name
        );

        if (!existsInDropdown) {
          return [entryEmployee, ...baseEmployees];
        }
      }
    }

    return baseEmployees;
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

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setValue("data_change_attachment", file);
      setValue("data_change_attachment_filename", file.name);
      if (onFileChange) {
        onFileChange(file);
      }
    }
  };

  const handleFileRemove = () => {
    setValue("data_change_attachment", "");
    setValue("data_change_attachment_filename", "");
    if (onFileChange) {
      onFileChange(null);
    }
  };

  const handleViewFile = () => {
    if (selectedFile || watchedAttachment) {
      handleFileViewerOpen();
    }
  };

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

  return (
    <>
      <Grid container spacing={1.2} sx={{ paddingTop: "12px" }}>
        <Grid item xs={12} md={6}>
          <Grid
            item
            xs={12}
            sm={4}
            sx={{ minWidth: "412px", maxWidth: "412px" }}></Grid>
          <Controller
            name="employee_id"
            control={control}
            render={({ field }) => (
              <Autocomplete
                options={isDataReady ? getEmployeeOptions() : []}
                getOptionLabel={(option) => {
                  if (option?.isFromSelectedEntry) {
                    return `${option.employee_name} (From Submission)`;
                  }
                  return (
                    option?.full_name ||
                    option?.name ||
                    option?.employee_name ||
                    ""
                  );
                }}
                value={field.value || null}
                onChange={(event, newValue) => {
                  if (!disabled && isDataReady) {
                    field.onChange(newValue);
                    setEmployeeDropdownOpen(false);
                  }
                }}
                onInputChange={(event, newInputValue, reason) => {
                  if (reason === "clear" && isDataReady) {
                    field.onChange(null);
                  }
                  if (reason === "input" && newInputValue) {
                    triggerEmployees({ search: newInputValue });
                  }
                }}
                open={employeeDropdownOpen && isDataReady}
                onOpen={() => {
                  if (!isReadOnly && isDataReady) {
                    setPositionDropdownOpen(false);
                    setEmployeeDropdownOpen(true);
                  }
                }}
                onClose={(event, reason) => {
                  setEmployeeDropdownOpen(false);
                }}
                isOptionEqualToValue={(option, value) =>
                  option?.id === value?.id
                }
                disabled={isReadOnly || !isDataReady}
                loading={isLoadingEmployees}
                disableCloseOnSelect={false}
                blurOnSelect={true}
                clearOnBlur={true}
                renderOption={(props, option) => (
                  <li {...props}>
                    <Box>
                      <Typography variant="body2">
                        {option?.employee_name ||
                          option?.full_name ||
                          option?.name ||
                          ""}
                      </Typography>
                      {option?.isFromSelectedEntry && (
                        <Typography
                          variant="caption"
                          color="primary"
                          sx={{ fontStyle: "italic" }}>
                          From current submission
                        </Typography>
                      )}
                    </Box>
                  </li>
                )}
                renderInput={(params) => (
                  <StyledTextField
                    {...params}
                    label="Employee"
                    required={true}
                    error={!!errors.employee_id}
                    helperText={errors.employee_id?.message}
                    sx={{
                      backgroundColor: isReadOnly ? "#f5f5f5" : "white",
                    }}
                    InputProps={{
                      ...params.InputProps,
                      endAdornment: (
                        <>
                          {isLoadingEmployees ? (
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
            sx={{ minWidth: "412px", maxWidth: "412px" }}></Grid>
          <Controller
            name="new_position_id"
            control={control}
            render={({ field }) => (
              <Autocomplete
                options={isDataReady ? positions : []}
                getOptionLabel={(option) => option?.title_with_unit || ""}
                value={field.value || null}
                onChange={(event, newValue) => {
                  if (!disabled && isDataReady) {
                    field.onChange(newValue);
                    setPositionDropdownOpen(false);
                  }
                }}
                onInputChange={(event, newInputValue, reason) => {
                  if (reason === "clear" && isDataReady) {
                    field.onChange(null);
                  }
                }}
                open={positionDropdownOpen && isDataReady}
                onOpen={() => {
                  if (!isReadOnly && isDataReady) {
                    setEmployeeDropdownOpen(false);
                    setPositionDropdownOpen(true);
                  }
                }}
                onClose={(event, reason) => {
                  setPositionDropdownOpen(false);
                }}
                isOptionEqualToValue={(option, value) =>
                  option?.id === value?.id
                }
                disabled={isReadOnly || !isDataReady}
                loading={isLoadingPositions}
                disableCloseOnSelect={false}
                blurOnSelect={true}
                clearOnBlur={true}
                renderInput={(params) => (
                  <StyledTextField
                    {...params}
                    label="New Position"
                    required={true}
                    error={!!errors.new_position_id}
                    helperText={errors.new_position_id?.message}
                    sx={{
                      backgroundColor: isReadOnly ? "#f5f5f5" : "white",
                    }}
                    InputProps={{
                      ...params.InputProps,
                      endAdornment: (
                        <>
                          {isLoadingPositions ? (
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
            sx={{ minWidth: "412px", maxWidth: "412px" }}></Grid>
          <Controller
            name="reason_for_change"
            control={control}
            render={({ field }) => (
              <StyledTextField
                {...field}
                label="Reason for Change"
                required={true}
                fullWidth
                multiline
                rows={3}
                error={!!errors.reason_for_change}
                helperText={errors.reason_for_change?.message}
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
            sx={{ minWidth: "412px", maxWidth: "412px" }}></Grid>
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
            sx={{ minWidth: "836px", maxWidth: "836px" }}></Grid>
          <Box sx={{ width: "100%", maxWidth: "100%", mt: 2 }}>
            {!isReadOnly ? (
              <Box
                sx={{
                  border: "2px dashed #d0d7de",
                  borderRadius: "8px",
                  padding: "30px 40px",
                  textAlign: "center",
                  backgroundColor: "#f9f9fb",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  maxWidth: "100%",
                  width: "100%",
                  minHeight: "150px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  "&:hover": {
                    borderColor: "#1976d2",
                    backgroundColor: "#f0f7ff",
                  },
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  const files = e.dataTransfer.files;
                  if (files.length > 0) {
                    const file = files[0];
                    setValue("data_change_attachment", file);
                    setValue("data_change_attachment_filename", file.name);
                    if (onFileChange) {
                      onFileChange(file);
                    }
                  }
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                }}
                onClick={() => {
                  document
                    .getElementById("data-change-attachment-upload")
                    ?.click();
                }}>
                <input
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  style={{ display: "none" }}
                  id="data-change-attachment-upload"
                  type="file"
                  onChange={handleFileUpload}
                />

                {!(watchedAttachmentFilename || selectedFile?.name) && (
                  <>
                    <CloudUpload
                      sx={{ fontSize: 32, color: "#6b7280", mb: 1 }}
                    />
                    <Typography
                      variant="body1"
                      sx={{ mb: 1, fontWeight: 500, color: "#374151" }}>
                      UPLOAD ATTACHMENT <span style={{ color: "red" }}>*</span>
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Click to browse files or drag and drop
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Supported formats: PDF, DOC, DOCX, JPG, PNG
                    </Typography>
                  </>
                )}

                {(watchedAttachmentFilename || selectedFile?.name) && (
                  <>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        mb: 2,
                      }}>
                      <CloudUpload
                        sx={{ fontSize: 32, color: "#4caf50", mr: 1 }}
                      />
                      <Typography
                        variant="h6"
                        sx={{ fontWeight: 600, color: "#4caf50" }}>
                        File selected:{" "}
                        {watchedAttachmentFilename || selectedFile?.name}
                      </Typography>
                    </Box>

                    {isEditMode && (
                      <Typography
                        variant="body2"
                        sx={{
                          color: "#4caf50",
                          fontStyle: "italic",
                        }}>
                        This file will replace the current attachment when saved
                      </Typography>
                    )}
                  </>
                )}
              </Box>
            ) : (
              <Box
                sx={{
                  border: "1px solid #e0e0e0",
                  borderRadius: "8px",
                  padding: "20px",
                  backgroundColor: "#f5f5f5",
                }}>
                <Typography
                  variant="body2"
                  sx={{ mb: 1, fontWeight: 500, color: "#6b7280" }}>
                  ATTACHMENT
                </Typography>

                {watchedAttachmentFilename || selectedFile?.name ? (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <AttachFile sx={{ color: "#6b7280" }} />
                    <Typography variant="body2" sx={{ flexGrow: 1 }}>
                      {watchedAttachmentFilename || selectedFile?.name}
                    </Typography>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<Visibility />}
                      onClick={handleViewFile}
                      sx={{
                        borderColor: "rgb(33, 61, 112)",
                        color: "rgb(33, 61, 112)",
                        "&:hover": {
                          backgroundColor: "rgba(33, 61, 112, 0.04)",
                          borderColor: "rgb(33, 61, 112)",
                        },
                      }}>
                      View
                    </Button>
                  </Box>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No attachment
                  </Typography>
                )}
              </Box>
            )}

            {errors.data_change_attachment && (
              <Typography
                variant="caption"
                color="error"
                sx={{ mt: 1, display: "block" }}>
                {errors.data_change_attachment?.message}
              </Typography>
            )}
          </Box>
        </Grid>
      </Grid>

      <FileViewerDialog
        open={fileViewerOpen}
        onClose={handleFileViewerClose}
        selectedEntry={selectedEntry}
        selectedFile={selectedFile}
        currentFormSubmissionId={currentFormSubmissionId}
      />
    </>
  );
};

export default DataChangeFields;
