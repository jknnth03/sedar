import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Box,
  Button,
  TextField,
  Grid,
  Typography,
  IconButton,
  FormControl,
  Autocomplete,
  CircularProgress,
  Skeleton,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  CloudUpload as CloudUploadIcon,
} from "@mui/icons-material";
import { useFormContext, Controller, useFieldArray } from "react-hook-form";
import dayjs from "dayjs";
import { useGetAllApprovalFormsQuery } from "../../../../features/api/approvalsetting/formSubmissionApi";
import { useGetAllPositionsQuery } from "../../../../features/api/employee/mainApi";
import { useLazyGetAllDataChangeEmployeeQuery } from "../../../../features/api/forms/datachangeApi";
import { useGetAllMovementTypesQuery } from "../../../../features/api/extras/movementTypesApi";
import DataChangeAttachmentFields from "./DataChangeAttachmentFields";
import {
  UploadBox,
  AttachmentBox,
  gridItemStyles,
  textFieldStyles,
  labelWithRequired,
  fileNameStyles,
  replaceAttachmentStyles,
  uploadAttachmentTitleStyles,
  uploadAttachmentSubtextStyles,
  attachmentBoxContentStyles,
  attachmentBoxMainStyles,
  uploadIconWithFileStyles,
  uploadIconNoFileStyles,
  buttonStyles,
  containerStyles,
  hiddenInputStyles,
} from "./DataChangeModalStyles";

const DataChangeModalFields = ({
  isLoading = false,
  mode = "create",
  onFormDataCreate,
  selectedEntry = null,
}) => {
  const {
    control,
    formState: { errors },
    setValue,
    watch,
    getValues,
    reset,
  } = useFormContext();

  const watchedEmployee = watch("employee_id");
  const [dropdownsLoaded, setDropdownsLoaded] = useState({
    forms: false,
    employees: false,
    movementTypes: false,
    positions: false,
  });
  const [showSkeleton, setShowSkeleton] = useState(false);

  const { data: formsData, isLoading: formsLoading } =
    useGetAllApprovalFormsQuery(
      { page: 1, per_page: 1000, status: "active" },
      { skip: mode !== "create" || !dropdownsLoaded.forms }
    );

  const [
    triggerGetEmployees,
    { data: employeesData, isLoading: employeesLoading },
  ] = useLazyGetAllDataChangeEmployeeQuery();

  const { data: movementTypesData, isLoading: movementTypesLoading } =
    useGetAllMovementTypesQuery(
      { page: 1, per_page: 1000, status: "active" },
      { skip: !dropdownsLoaded.movementTypes }
    );

  const { data: positionsData, isLoading: positionsLoading } =
    useGetAllPositionsQuery(
      { page: 1, per_page: 1000, status: "active" },
      { skip: !dropdownsLoaded.positions }
    );

  const normalizeApiData = useCallback((data) => {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    if (data.result && Array.isArray(data.result.data)) return data.result.data;
    if (data.result && Array.isArray(data.result)) return data.result;
    if (Array.isArray(data.data)) return data.data;
    return [];
  }, []);

  const forms = useMemo(
    () => normalizeApiData(formsData),
    [formsData, normalizeApiData]
  );
  const employees = useMemo(
    () => normalizeApiData(employeesData),
    [employeesData, normalizeApiData]
  );
  const movementTypes = useMemo(
    () => normalizeApiData(movementTypesData),
    [movementTypesData, normalizeApiData]
  );
  const positions = useMemo(
    () => normalizeApiData(positionsData),
    [positionsData, normalizeApiData]
  );

  const handleDropdownFocus = useCallback(
    (dropdownName) => {
      if (!dropdownsLoaded[dropdownName]) {
        setDropdownsLoaded((prev) => ({ ...prev, [dropdownName]: true }));

        if (dropdownName === "employees") {
          const params = {
            page: 1,
            per_page: 1000,
            status: "active",
          };

          if (
            (mode === "view" || mode === "edit") &&
            selectedEntry?.result?.submittable?.employee_id
          ) {
            params.employee_id_to_include =
              selectedEntry.result.submittable.employee_id;
          }

          triggerGetEmployees(params);
        }
      }
    },
    [dropdownsLoaded, mode, selectedEntry, triggerGetEmployees]
  );

  useEffect(() => {
    if (mode === "create") {
      setValue("form_id", { id: 4 });
    }
  }, [setValue, mode]);

  useEffect(() => {
    if (mode !== "create") {
      setDropdownsLoaded({
        forms: true,
        employees: true,
        movementTypes: true,
        positions: true,
      });

      const params = {
        page: 1,
        per_page: 1000,
        status: "active",
      };

      if (
        (mode === "view" || mode === "edit") &&
        selectedEntry?.result?.submittable?.employee_id
      ) {
        params.employee_id_to_include =
          selectedEntry.result.submittable.employee_id;
      }

      setShowSkeleton(true);
      const skeletonTimer = setTimeout(() => {
        setShowSkeleton(false);
      }, 1000);

      triggerGetEmployees(params);

      return () => clearTimeout(skeletonTimer);
    }
  }, [mode, selectedEntry, triggerGetEmployees]);

  useEffect(() => {
    if (
      (mode === "view" || mode === "edit") &&
      selectedEntry &&
      watchedEmployee
    ) {
      const submittable = selectedEntry.result?.submittable;
      const submittedBy = selectedEntry.result?.submitted_by;
      const employee = selectedEntry.result?.employee;

      if (
        submittable?.employee_id &&
        watchedEmployee.id &&
        submittable.employee_id === watchedEmployee.id
      ) {
        const currentEmployeeData = employees.find(
          (emp) => emp.id === submittable.employee_id
        );

        if (currentEmployeeData) {
          const updatedEmployeeData = {
            ...watchedEmployee,
            employee_name:
              currentEmployeeData.employee_name ||
              currentEmployeeData.full_name ||
              watchedEmployee.employee_name,
            position_title:
              submittable.from_position?.title?.name ||
              currentEmployeeData.position_title ||
              watchedEmployee.position_title ||
              "N/A",
            department:
              submittable.from_position?.charging?.department_name ||
              currentEmployeeData.department ||
              watchedEmployee.department ||
              "N/A",
            sub_unit:
              submittable.from_position?.charging?.sub_unit_name ||
              currentEmployeeData.sub_unit ||
              watchedEmployee.sub_unit ||
              "N/A",
            schedule:
              submittable.from_position?.schedule?.name ||
              currentEmployeeData.schedule ||
              watchedEmployee.schedule ||
              "N/A",
            job_rate:
              submittable.from_position?.job_rate ||
              currentEmployeeData.job_rate ||
              watchedEmployee.job_rate,
          };

          setValue("employee_id", updatedEmployeeData, {
            shouldValidate: false,
          });
        }
      }
    }
  }, [mode, selectedEntry, watchedEmployee, employees, setValue]);

  const createFormData = useCallback(() => {
    const formData = new FormData();
    const values = getValues();

    formData.append("form_id", 4);

    if (values.employee_id?.id) {
      formData.append("employee_id", values.employee_id.id);
    }

    if (values.movement_type_id?.id) {
      formData.append("movement_type_id", values.movement_type_id.id);
    }

    if (values.effective_date) {
      const formattedDate = dayjs(values.effective_date).format("YYYY-MM-DD");
      formData.append("effective_date", formattedDate);
    }

    if (values.to_position_id?.id) {
      formData.append("to_position_id", values.to_position_id.id);
    }

    if (values.to_job_rate) {
      formData.append("to_job_rate", values.to_job_rate);
    }

    if (values.attachments && Array.isArray(values.attachments)) {
      values.attachments.forEach((attachment, index) => {
        if (attachment) {
          if (attachment.file_attachment instanceof File) {
            formData.append("attachments[]", attachment.file_attachment);
          } else if (attachment.existing_file_id) {
            formData.append(
              "existing_attachments[]",
              attachment.existing_file_id
            );
          }
        }
      });
    }

    return formData;
  }, [getValues]);

  useEffect(() => {
    if (onFormDataCreate) {
      onFormDataCreate(createFormData);
    }
  }, [createFormData, onFormDataCreate]);

  const isReadOnly = mode === "view";
  const isLoadingEmployeeData =
    (mode === "view" || mode === "edit") && (employeesLoading || showSkeleton);

  return (
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
                    marginBottom: 1,
                    fontSize: "11px",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }}>
                  FULL NAME
                </Typography>
                {isLoadingEmployeeData ? (
                  <Skeleton
                    variant="text"
                    width="80%"
                    height={24}
                    sx={{ marginBottom: 2 }}
                  />
                ) : (
                  <Typography
                    variant="body2"
                    sx={{
                      fontSize: "14px",
                      fontWeight: 600,
                      lineHeight: 1.3,
                      color: "#1a1a1a",
                      marginBottom: 2,
                    }}>
                    {watchedEmployee.employee_name ||
                      watchedEmployee.full_name ||
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
                      selectedEntry?.result?.submittable?.from_position
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
                      selectedEntry?.result?.submittable?.from_position
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
                    {selectedEntry?.result?.submittable?.from_position?.title
                      ?.name ||
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
                      selectedEntry?.result?.submittable?.from_position
                        ?.charging?.sub_unit_name ||
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
                  JOB RATE
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
                    {watchedEmployee.job_rate
                      ? `₱${watchedEmployee.job_rate.toLocaleString("en-PH", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}`
                      : selectedEntry?.result?.submittable?.from_position
                          ?.job_rate
                      ? `₱${selectedEntry.result.submittable.from_position.job_rate.toLocaleString(
                          "en-PH",
                          {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          }
                        )}`
                      : "N/A"}
                  </Typography>
                )}
              </Box>
            </Grid>
          </Grid>
        </Box>
      ) : null}

      <Box sx={containerStyles.main}>
        <Grid container spacing={2}>
          <Controller
            name="form_id"
            control={control}
            render={({ field }) => (
              <input type="hidden" {...field} value={field.value?.id || 4} />
            )}
          />

          <Grid item xs={12} sm={6} sx={gridItemStyles.xs12sm6}>
            {isLoadingEmployeeData ? (
              <Skeleton variant="rounded" width="100%" height={56} />
            ) : (
              <Controller
                name="employee_id"
                control={control}
                rules={{ required: "Employee is required" }}
                render={({ field: { onChange, value } }) => (
                  <FormControl fullWidth error={!!errors.employee_id}>
                    <Autocomplete
                      value={value || null}
                      onChange={(event, item) => onChange(item)}
                      options={employees}
                      loading={employeesLoading}
                      getOptionLabel={(item) => {
                        return item?.employee_name || "Unknown Employee";
                      }}
                      isOptionEqualToValue={(option, value) => {
                        return option?.id === value?.id;
                      }}
                      onOpen={() => handleDropdownFocus("employees")}
                      disabled={isLoading || isReadOnly}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label={
                            <span>
                              Employee <span style={labelWithRequired}>*</span>
                            </span>
                          }
                          error={!!errors.employee_id}
                          helperText={errors.employee_id?.message}
                          fullWidth
                          sx={textFieldStyles.outlinedInput}
                          InputProps={{
                            ...params.InputProps,
                            endAdornment: (
                              <>
                                {employeesLoading && (
                                  <CircularProgress color="inherit" size={20} />
                                )}
                                {params.InputProps.endAdornment}
                              </>
                            ),
                          }}
                        />
                      )}
                      noOptionsText={
                        employeesLoading
                          ? "Loading employees..."
                          : "No employees found"
                      }
                      renderOption={(props, option) => (
                        <li {...props} key={option.id}>
                          {option?.employee_name || "Unknown Employee"}
                        </li>
                      )}
                    />
                  </FormControl>
                )}
              />
            )}
          </Grid>

          <Grid item xs={12} sm={6} sx={gridItemStyles.xs12sm6}>
            {isLoadingEmployeeData ? (
              <Skeleton variant="rounded" width="100%" height={56} />
            ) : (
              <Controller
                name="movement_type_id"
                control={control}
                rules={{ required: "Movement type is required" }}
                render={({ field: { onChange, value } }) => (
                  <FormControl fullWidth error={!!errors.movement_type_id}>
                    <Autocomplete
                      value={value || null}
                      onChange={(event, item) => onChange(item)}
                      options={movementTypes}
                      loading={movementTypesLoading}
                      getOptionLabel={(item) =>
                        item?.name || item?.type_name || ""
                      }
                      isOptionEqualToValue={(option, value) =>
                        option?.id === value?.id
                      }
                      onOpen={() => handleDropdownFocus("movementTypes")}
                      disabled={isLoading || isReadOnly}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label={
                            <span>
                              Movement Type{" "}
                              <span style={labelWithRequired}>*</span>
                            </span>
                          }
                          error={!!errors.movement_type_id}
                          helperText={errors.movement_type_id?.message}
                          fullWidth
                          sx={textFieldStyles.outlinedInput}
                          InputProps={{
                            ...params.InputProps,
                            endAdornment: (
                              <>
                                {movementTypesLoading && (
                                  <CircularProgress color="inherit" size={20} />
                                )}
                                {params.InputProps.endAdornment}
                              </>
                            ),
                          }}
                        />
                      )}
                      noOptionsText={
                        movementTypesLoading
                          ? "Loading movement types..."
                          : "No movement types found"
                      }
                    />
                  </FormControl>
                )}
              />
            )}
          </Grid>

          <Grid item xs={12} sm={6} sx={gridItemStyles.xs12sm6}>
            {isLoadingEmployeeData ? (
              <Skeleton variant="rounded" width="100%" height={56} />
            ) : (
              <Controller
                name="effective_date"
                control={control}
                rules={{ required: "Effective date is required" }}
                render={({ field: { onChange, value } }) => (
                  <DatePicker
                    label={
                      <span>
                        Effective Date <span style={labelWithRequired}>*</span>
                      </span>
                    }
                    value={value}
                    onChange={onChange}
                    disabled={isLoading || isReadOnly}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        error: !!errors.effective_date,
                        helperText: errors.effective_date?.message,
                        sx: textFieldStyles.outlinedInput,
                      },
                    }}
                  />
                )}
              />
            )}
          </Grid>

          <Grid item xs={12} sm={6} sx={gridItemStyles.xs12sm6}>
            {isLoadingEmployeeData ? (
              <Skeleton variant="rounded" width="100%" height={56} />
            ) : (
              <Controller
                name="to_position_id"
                control={control}
                rules={{ required: "Position is required" }}
                render={({ field: { onChange, value } }) => (
                  <FormControl fullWidth error={!!errors.to_position_id}>
                    <Autocomplete
                      value={value || null}
                      onChange={(event, item) => onChange(item)}
                      options={positions}
                      loading={positionsLoading}
                      getOptionLabel={(item) => {
                        if (typeof item === "string") return item;
                        return (
                          item?.title?.name ||
                          item?.name ||
                          item?.position_name ||
                          item?.title ||
                          ""
                        );
                      }}
                      isOptionEqualToValue={(option, value) =>
                        option?.id === value?.id
                      }
                      onOpen={() => handleDropdownFocus("positions")}
                      disabled={isLoading || isReadOnly}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label={
                            <span>
                              Position <span style={labelWithRequired}>*</span>
                            </span>
                          }
                          error={!!errors.to_position_id}
                          helperText={errors.to_position_id?.message}
                          fullWidth
                          sx={textFieldStyles.outlinedInput}
                          InputProps={{
                            ...params.InputProps,
                            endAdornment: (
                              <>
                                {positionsLoading && (
                                  <CircularProgress color="inherit" size={20} />
                                )}
                                {params.InputProps.endAdornment}
                              </>
                            ),
                          }}
                        />
                      )}
                      noOptionsText={
                        positionsLoading
                          ? "Loading positions..."
                          : "No positions found"
                      }
                      renderOption={(props, option) => (
                        <li {...props} key={option.id || option}>
                          {typeof option === "string"
                            ? option
                            : option?.title?.name ||
                              option?.name ||
                              option?.position_name ||
                              ""}
                        </li>
                      )}
                    />
                  </FormControl>
                )}
              />
            )}
          </Grid>

          <Grid item xs={12} sm={6} sx={gridItemStyles.xs12sm6}>
            {isLoadingEmployeeData ? (
              <Skeleton variant="rounded" width="100%" height={56} />
            ) : (
              <Controller
                name="to_job_rate"
                control={control}
                rules={{
                  required: "Job Rate is required",
                  pattern: {
                    value: /^[0-9]+\.?[0-9]*$/,
                    message: "Job Rate must be a valid number",
                  },
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label={
                      <span>
                        Job Rate <span style={labelWithRequired}>*</span>
                      </span>
                    }
                    fullWidth
                    error={!!errors.to_job_rate}
                    helperText={errors.to_job_rate?.message}
                    disabled={isLoading || isReadOnly}
                    sx={textFieldStyles.outlinedInput}
                    type="number"
                    inputProps={{
                      step: "0.01",
                      min: "0",
                    }}
                    InputLabelProps={{
                      shrink: !!field.value || field.value === 0,
                    }}
                  />
                )}
              />
            )}
          </Grid>

          <Grid item xs={12} sx={gridItemStyles.attachmentFullWidth}>
            <DataChangeAttachmentFields
              isLoading={isLoading}
              mode={mode}
              selectedEntry={selectedEntry}
            />
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default DataChangeModalFields;
