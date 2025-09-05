import React, { useState, useEffect } from "react";
import { useFormContext, Controller } from "react-hook-form";
import {
  Grid,
  TextField,
  Autocomplete,
  CircularProgress,
  MenuItem,
} from "@mui/material";
import { useGetAllPositionsQuery } from "../../../features/api/masterlist/positionsApi";
import { useGetAllJobLevelsQuery } from "../../../features/api/masterlist/jobLevelsApi";
import { useGetAllRequisitionsQuery } from "../../../features/api/extras/requisitionsApi";
import { useGetAllEmployeesToBeReplacedQuery } from "../../../features/api/employee/mainApi";
import { expectedSalaryInputProps } from "../../../schema/approver/formSubmissionSchema";
import FileViewerDialog from "./FileViewerDialog";
import AttachmentField from "./AttachmentField";

const FormSubmissionFields = ({
  mode,
  selectedEntry,
  onFileChange,
  selectedFile,
  disabled = false,
  isEmployeeFieldEnabled = false,
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
  const [employeeValueSet, setEmployeeValueSet] = useState(false);

  const watchedRequisitionType = watch("requisition_type_id");
  const watchedPositionId = watch("position_id");
  const watchedEmploymentType = watch("employment_type");

  const { data: positionsData = [], isLoading: isLoadingPositions } =
    useGetAllPositionsQuery();
  const { data: jobLevelsData = [], isLoading: isLoadingJobLevels } =
    useGetAllJobLevelsQuery();
  const { data: requisitionsData = [], isLoading: isLoadingRequisitions } =
    useGetAllRequisitionsQuery();

  const employmentTypeOptions = [
    "PROBATIONARY",
    "REGULAR",
    "PROJECT BASED",
    "AGENCY HIRED",
  ];

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

  const isReadOnly = mode === "view" || disabled;
  const isCreateMode = mode === "create";
  const isEditMode = mode === "edit";
  const isViewMode = mode === "view" || disabled;

  const isAdditionalManpower = () => {
    if (!watchedRequisitionType) return false;
    return watchedRequisitionType.name === "ADDITIONAL MANPOWER";
  };

  const { data: employeesData = [], isLoading: isLoadingEmployees } =
    useGetAllEmployeesToBeReplacedQuery(
      {
        position_id: watchedPositionId?.id,
        requisition_type_id: watchedRequisitionType?.id,
        ...(selectedEntry?.id && { current_mrf_id: selectedEntry.id }),
      },
      {
        skip:
          !watchedPositionId?.id ||
          !watchedRequisitionType?.id ||
          isAdditionalManpower(),
      }
    );

  const employees = Array.isArray(employeesData?.result?.data)
    ? employeesData.result.data
    : Array.isArray(employeesData?.result)
    ? employeesData.result
    : Array.isArray(employeesData)
    ? employeesData
    : [];

  const shouldHideEmployeeReplacement = () => {
    return isAdditionalManpower();
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

  const handleEmploymentTypeChange = (event) => {
    if (disabled) return;

    const value = event.target.value;
    setValue("employment_type", value);

    if (value && value !== "") {
      clearErrors("employment_type");
    }
  };

  useEffect(() => {
    if (!isCreateMode) return;

    const updateFields = () => {
      if (watchedRequisitionType) {
        setValue("position_id", null, {
          shouldValidate: false,
          shouldDirty: false,
        });
        setValue("employee_to_be_replaced_id", null, {
          shouldValidate: false,
          shouldDirty: false,
        });
        clearErrors(["position_id", "employee_to_be_replaced_id"]);
      }
    };

    const rafId = requestAnimationFrame(updateFields);
    return () => cancelAnimationFrame(rafId);
  }, [watchedRequisitionType?.id, setValue, clearErrors, isCreateMode]);

  useEffect(() => {
    if (!isCreateMode || !watchedPositionId) return;

    const updateEmployee = () => {
      setValue("employee_to_be_replaced_id", null, {
        shouldValidate: false,
        shouldDirty: false,
      });
      clearErrors("employee_to_be_replaced_id");
    };

    const rafId = requestAnimationFrame(updateEmployee);
    return () => cancelAnimationFrame(rafId);
  }, [watchedPositionId?.id, setValue, clearErrors, isCreateMode]);

  useEffect(() => {
    if (isAdditionalManpower()) {
      setValue("employee_to_be_replaced_id", null);
      setEmployeeValueSet(false);
    }
  }, [watchedRequisitionType, setValue]);

  useEffect(() => {
    if (
      (mode === "edit" || mode === "view") &&
      selectedEntry?.submittable &&
      !isLoadingPositions &&
      !isLoadingJobLevels &&
      !isLoadingRequisitions &&
      positions.length > 0 &&
      jobLevels.length > 0 &&
      requisitions.length > 0
    ) {
      const submittableData = selectedEntry.submittable;

      const foundPosition =
        positions.find((p) => p.id === submittableData.position_id) || null;
      const foundJobLevel =
        jobLevels.find((jl) => jl.id === submittableData.job_level_id) || null;
      const foundRequisitionType =
        requisitions.find(
          (r) => r.id === submittableData.requisition_type_id
        ) || null;

      let employeeData = null;
      if (
        submittableData.employee_to_be_replaced_id &&
        !isAdditionalManpower()
      ) {
        if (employees.length > 0) {
          const foundEmployee = employees.find(
            (e) => e.id === submittableData.employee_to_be_replaced_id
          );
          if (foundEmployee) {
            employeeData = foundEmployee;
          }
        }

        if (!employeeData && submittableData.employee_to_be_replaced) {
          const employeeFromEntry = submittableData.employee_to_be_replaced;
          employeeData = {
            id: employeeFromEntry.id,
            full_name: employeeFromEntry.full_name,
            name: employeeFromEntry.full_name,
            employee_name: employeeFromEntry.full_name,
            employee_code: employeeFromEntry.employee_code || "",
          };
        }
      }

      const formValues = {
        position_id: foundPosition,
        job_level_id: foundJobLevel,
        employment_type: submittableData.employment_type || "",
        expected_salary: submittableData.expected_salary || "",
        requisition_type_id: foundRequisitionType,
        employee_to_be_replaced_id: employeeData,
        justification: submittableData.justification || "",
        remarks: submittableData.remarks || "",
        manpower_form_attachment:
          submittableData.manpower_form_attachment || "",
        manpower_attachment_filename:
          submittableData.manpower_attachment_filename || "",
      };

      setTimeout(() => {
        Object.entries(formValues).forEach(([key, value]) => {
          setValue(key, value, {
            shouldValidate: false,
            shouldDirty: false,
          });
        });

        setEmployeeValueSet(true);
        clearErrors();
      }, 50);
    }
  }, [
    mode,
    selectedEntry?.id,
    setValue,
    clearErrors,
    isLoadingPositions,
    isLoadingJobLevels,
    isLoadingRequisitions,
    positions.length,
    jobLevels.length,
    requisitions.length,
    employees.length,
  ]);

  useEffect(() => {
    if (mode === "create") {
      setEmployeeValueSet(false);
    }
    if (mode === "view" || mode === "edit") {
      setEmployeeValueSet(false);
    }
  }, [mode, selectedEntry?.id]);

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
            name="requisition_type_id"
            control={control}
            render={({ field }) => (
              <Autocomplete
                options={requisitions}
                getOptionLabel={(option) => option?.name || ""}
                value={field.value || null}
                onChange={(event, newValue) => {
                  if (!disabled && !isEditMode) field.onChange(newValue);
                }}
                isOptionEqualToValue={(option, value) =>
                  option?.id === value?.id
                }
                disabled={isReadOnly || isEditMode}
                renderInput={(params) => (
                  <StyledTextField
                    {...params}
                    label="Requisition Type"
                    required={true}
                    error={!!errors.requisition_type_id}
                    helperText={errors.requisition_type_id?.message}
                    sx={{
                      backgroundColor:
                        isReadOnly || isEditMode ? "#f5f5f5" : "white",
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
            name="position_id"
            control={control}
            render={({ field }) => (
              <Autocomplete
                options={positions}
                getOptionLabel={(option) => option?.title_with_unit || ""}
                value={field.value || null}
                onChange={(event, newValue) => {
                  if (!disabled && !isEditMode) field.onChange(newValue);
                }}
                isOptionEqualToValue={(option, value) =>
                  option?.id === value?.id
                }
                disabled={isReadOnly || isEditMode}
                renderInput={(params) => (
                  <StyledTextField
                    {...params}
                    label="Position"
                    required={true}
                    error={!!errors.position_id}
                    helperText={errors.position_id?.message}
                    sx={{
                      backgroundColor:
                        isReadOnly || isEditMode ? "#f5f5f5" : "white",
                    }}
                  />
                )}
              />
            )}
          />
        </Grid>

        <Grid
          item
          xs={12}
          md={6}
          sx={{
            visibility: shouldHideEmployeeReplacement() ? "hidden" : "visible",
          }}>
          <Grid
            item
            xs={12}
            sm={4}
            sx={{ minWidth: "412px", maxWidth: "412px" }}></Grid>
          <Controller
            name="employee_to_be_replaced_id"
            control={control}
            render={({ field }) => (
              <Autocomplete
                options={employees}
                getOptionLabel={(option) =>
                  option?.full_name ||
                  option?.name ||
                  option?.employee_name ||
                  ""
                }
                value={field.value || null}
                onChange={(event, newValue) => {
                  if (
                    !disabled &&
                    !isEditMode &&
                    (isEmployeeFieldEnabled ||
                      mode === "edit" ||
                      mode === "view")
                  )
                    field.onChange(newValue);
                }}
                isOptionEqualToValue={(option, value) =>
                  option?.id === value?.id
                }
                disabled={
                  isReadOnly ||
                  isEditMode ||
                  (!isEmployeeFieldEnabled && mode === "create")
                }
                loading={
                  !isViewMode &&
                  isLoadingEmployees &&
                  (isEmployeeFieldEnabled || mode === "edit" || mode === "view")
                }
                renderInput={(params) => (
                  <StyledTextField
                    {...params}
                    label="Employee to be Replaced"
                    required={true}
                    error={!!errors.employee_to_be_replaced_id}
                    helperText={
                      errors.employee_to_be_replaced_id?.message ||
                      (!isEmployeeFieldEnabled &&
                      mode === "create" &&
                      !isReadOnly
                        ? "Please select Position and Requisition Type first"
                        : "")
                    }
                    InputProps={{
                      ...params.InputProps,
                      endAdornment: (
                        <>
                          {!isViewMode &&
                          isLoadingEmployees &&
                          (isEmployeeFieldEnabled ||
                            mode === "edit" ||
                            mode === "view") ? (
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
            sx={{ minWidth: "412px", maxWidth: "412px" }}></Grid>
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
            sx={{ minWidth: "412px", maxWidth: "412px" }}></Grid>
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
            sx={{ minWidth: "840px", maxWidth: "840px" }}></Grid>
          <AttachmentField
            selectedEntry={selectedEntry}
            onFileChange={onFileChange}
            selectedFile={selectedFile}
            disabled={isViewMode}
            onFileViewerOpen={handleFileViewerOpen}
          />
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

export default FormSubmissionFields;
