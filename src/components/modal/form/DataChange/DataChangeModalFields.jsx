import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  IconButton,
  FormControl,
  Autocomplete,
  CircularProgress,
  Skeleton,
  Alert,
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
import { useGetAllMrfSubmissionsQuery } from "../../../../features/api/forms/mrfApi";
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
import { useGetAllShowSchedulesQuery } from "../../../../features/api/extras/schedulesApi";

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
  const watchedMovementType = watch("movement_type_id");

  const shouldLoadDropdowns = mode === "create" || mode === "edit";

  const [dropdownsLoaded, setDropdownsLoaded] = useState({
    forms: false,
    employees: false,
    movementTypes: false,
    positions: false,
    mrfSubmissions: false,
    schedules: false,
  });
  const [showSkeleton, setShowSkeleton] = useState(false);
  const [editModeEmployees, setEditModeEmployees] = useState([]);

  const { data: formsData, isLoading: formsLoading } =
    useGetAllApprovalFormsQuery(
      { page: 1, per_page: 1000, status: "active" },
      { skip: !shouldLoadDropdowns || mode !== "create" },
    );

  const [
    triggerGetEmployees,
    { data: employeesData, isLoading: employeesLoading },
  ] = useLazyGetAllDataChangeEmployeeQuery();

  const { data: movementTypesData, isLoading: movementTypesLoading } =
    useGetAllMovementTypesQuery(
      { page: 1, per_page: 1000, status: "active" },
      { skip: !shouldLoadDropdowns || !dropdownsLoaded.movementTypes },
    );

  const { data: positionsData, isLoading: positionsLoading } =
    useGetAllPositionsQuery(
      { page: 1, per_page: 1000, status: "active" },
      { skip: !shouldLoadDropdowns || !dropdownsLoaded.positions },
    );

  const { data: mrfSubmissionsData, isLoading: mrfSubmissionsLoading } =
    useGetAllMrfSubmissionsQuery(
      {
        status: "active",
        approval_status: "approved",
      },
      { skip: !shouldLoadDropdowns || !dropdownsLoaded.mrfSubmissions },
    );

  const { data: schedulesData, isLoading: schedulesLoading } =
    useGetAllShowSchedulesQuery(undefined, {
      skip: !shouldLoadDropdowns || !dropdownsLoaded.schedules,
    });

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
    [formsData, normalizeApiData],
  );

  const employees = useMemo(() => {
    return normalizeApiData(employeesData);
  }, [employeesData, normalizeApiData]);

  const movementTypes = useMemo(
    () => normalizeApiData(movementTypesData),
    [movementTypesData, normalizeApiData],
  );

  const positions = useMemo(
    () => normalizeApiData(positionsData),
    [positionsData, normalizeApiData],
  );

  const mrfSubmissions = useMemo(
    () => normalizeApiData(mrfSubmissionsData),
    [mrfSubmissionsData, normalizeApiData],
  );

  const schedules = useMemo(
    () => normalizeApiData(schedulesData),
    [schedulesData, normalizeApiData],
  );

  const getScheduleLabel = (item) => {
    if (!item) return "";
    if (typeof item === "string") return item;
    if (item?.label) return item.label;
    const name = item?.name || "";
    const restDay = item?.rest_day?.name || "";
    const workWeek = item?.work_week?.name || "";
    if (restDay && workWeek) return `${name} | ${restDay} | ${workWeek}`;
    if (restDay) return `${name} | ${restDay}`;
    return name;
  };

  const excludedMovementTypes = [
    "Position Alignment",
    "Merit Increase",
    "Re-evaluation of Existing Job",
    "Upgrading",
  ];

  const showMrfField = useMemo(() => {
    const movementTypeName =
      watchedMovementType?.name || watchedMovementType?.type_name;

    if (!movementTypeName) return false;

    const isExcluded = excludedMovementTypes.some(
      (excludedType) =>
        excludedType.toLowerCase() === movementTypeName.toLowerCase(),
    );

    return !isExcluded;
  }, [watchedMovementType]);

  const attachmentInstructions = useMemo(() => {
    const movementTypeName =
      watchedMovementType?.name || watchedMovementType?.type_name;

    if (!movementTypeName) return null;

    const normalizedName = movementTypeName.toLowerCase();

    const instructionMap = {
      "lateral transfer": ["1. Updated job description / Job Profiling"],
      "merit increase": ["1. Updated performance evaluation"],
      "position alignment": [
        "1. Updated organizational structure",
        "2. Updated job description / Job Profiling",
      ],
      downgrading: [
        "1. Employee's intent letter requesting a voluntary downgrade in job level, position, and salary.",
        "2. Updated job description / Job Profiling",
      ],
      promotion: ["1. CAT 1, 2 and PDP (from OD unit)"],
      "re-evaluation of existing job": [
        "1. Prior to processing the data change, a job evaluation must be conducted to determine the appropriate job level.",
      ],
      upgrading: [
        "1. Prior to processing the data change, a job evaluation must be conducted to determine the appropriate job level.",
      ],
    };

    return instructionMap[normalizedName] || null;
  }, [watchedMovementType]);

  const shouldHideAttachmentField = useMemo(() => {
    const movementTypeName =
      watchedMovementType?.name || watchedMovementType?.type_name;

    if (!movementTypeName) return false;

    const normalizedName = movementTypeName.toLowerCase();

    return normalizedName === "transfer due to promotion";
  }, [watchedMovementType]);

  useEffect(() => {
    if (!showMrfField) {
      setValue("approved_mrf_id", null, { shouldValidate: false });
    }
  }, [showMrfField, setValue]);

  const handleDropdownFocus = useCallback(
    (dropdownName) => {
      if (!shouldLoadDropdowns) return;

      if (!dropdownsLoaded[dropdownName]) {
        setDropdownsLoaded((prev) => ({ ...prev, [dropdownName]: true }));

        if (dropdownName === "employees") {
          const params = {
            page: 1,
            per_page: 1000,
            status: "active",
          };

          triggerGetEmployees(params);
        }
      }
    },
    [dropdownsLoaded, triggerGetEmployees, shouldLoadDropdowns],
  );

  useEffect(() => {
    if (mode === "create") {
      setValue("form_id", { id: 4 });
    }
  }, [setValue, mode]);

  useEffect(() => {
    if (mode === "edit" && selectedEntry?.result?.submittable) {
      setDropdownsLoaded({
        forms: true,
        employees: true,
        movementTypes: true,
        positions: true,
        mrfSubmissions: true,
        schedules: true,
      });

      triggerGetEmployees({ page: 1, per_page: 1000, status: "active" });

      const submittable = selectedEntry.result.submittable;

      if (submittable.employee_id) {
        const singleEmployee = {
          id: submittable.employee_id,
          employee_name:
            submittable.employee?.full_name ||
            submittable.employee?.employee_name ||
            selectedEntry.result.submitted_by?.full_name ||
            "Unknown Employee",
          position_id: submittable.from_position?.id,
          position_title: submittable.from_position?.title?.name || "N/A",
          charging: submittable.from_position?.charging?.name || "N/A",
          department:
            submittable.from_position?.charging?.department_name || "N/A",
          sub_unit: submittable.from_position?.charging?.sub_unit_name || "N/A",
          location: submittable.from_position?.charging?.location_name || "N/A",
          schedule:
            submittable.from_schedule?.label ||
            submittable.from_schedule?.name ||
            "N/A",
          job_rate: submittable.from_position?.job_rate || 0,
        };

        setValue("employee_id", singleEmployee, { shouldValidate: false });
      }

      if (submittable.movement_type) {
        setValue("movement_type_id", submittable.movement_type, {
          shouldValidate: false,
        });
      }

      if (submittable.effective_date) {
        setValue("effective_date", dayjs(submittable.effective_date), {
          shouldValidate: false,
        });
      }

      if (submittable.to_position) {
        setValue("to_position_id", submittable.to_position, {
          shouldValidate: false,
        });
      }

      if (submittable.to_schedule?.id) {
        setValue("to_schedule_id", submittable.to_schedule.id, {
          shouldValidate: false,
        });
      }

      if (submittable.approved_mrf_id) {
        setValue(
          "approved_mrf_id",
          { id: submittable.approved_mrf_id },
          {
            shouldValidate: false,
          },
        );
      }
    }
  }, [mode, selectedEntry, setValue, triggerGetEmployees]);

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

    if (values.to_schedule_id) {
      formData.append("to_schedule_id", values.to_schedule_id);
    }

    if (values.approved_mrf_id?.id && showMrfField) {
      formData.append("approved_mrf_id", values.approved_mrf_id.id);
    }

    if (values.attachments && Array.isArray(values.attachments)) {
      values.attachments.forEach((attachment, index) => {
        if (attachment) {
          if (attachment.file_attachment instanceof File) {
            formData.append("attachments[]", attachment.file_attachment);
          } else if (attachment.existing_file_id) {
            formData.append(
              "existing_attachments[]",
              attachment.existing_file_id,
            );
          }
        }
      });
    }

    return formData;
  }, [getValues, showMrfField]);

  useEffect(() => {
    if (onFormDataCreate) {
      onFormDataCreate(createFormData);
    }
  }, [createFormData, onFormDataCreate]);

  const isReadOnly = mode === "view";
  const isLoadingEmployeeData = mode === "edit" && showSkeleton;

  const displayEmployee =
    mode === "view" && selectedEntry?.result?.submittable
      ? watchedEmployee
      : watchedEmployee;

  const displayCharging =
    mode === "view" && selectedEntry?.result?.submittable
      ? selectedEntry.result.submittable.from_position?.charging?.name || "N/A"
      : displayEmployee?.charging || "N/A";

  const displayDepartment =
    mode === "view" && selectedEntry?.result?.submittable
      ? selectedEntry.result.submittable.from_position?.charging
          ?.department_name || "N/A"
      : displayEmployee?.department || "N/A";

  const displayLocation =
    mode === "view" && selectedEntry?.result?.submittable
      ? selectedEntry.result.submittable.from_position?.charging
          ?.location_name || "N/A"
      : displayEmployee?.location || "N/A";

  const displaySchedule =
    mode === "view" && selectedEntry?.result?.submittable
      ? selectedEntry.result.submittable.from_schedule?.label ||
        selectedEntry.result.submittable.from_schedule?.name ||
        "N/A"
      : displayEmployee?.schedule || "N/A";

  const displayPositionFrom =
    mode === "view" && selectedEntry?.result?.submittable
      ? selectedEntry.result.submittable.from_position?.title?.name || "N/A"
      : displayEmployee?.position_title || "N/A";

  const displaySubUnit =
    mode === "view" && selectedEntry?.result?.submittable
      ? selectedEntry.result.submittable.from_position?.charging
          ?.sub_unit_name || "N/A"
      : displayEmployee?.sub_unit || "N/A";

  const labelStyle = {
    fontWeight: "bold",
    color: "rgb(33, 61, 112)",
    marginBottom: 1.5,
    fontSize: "11px",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  };

  const valueStyle = {
    fontSize: "14px",
    fontWeight: 600,
    lineHeight: 1.3,
    color: "#1a1a1a",
    marginBottom: 2.5,
  };

  return (
    <Box>
      {(watchedEmployee && watchedEmployee.employee_name) ||
      isLoadingEmployeeData ? (
        <Box sx={{ mb: 3, px: 2 }}>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "1fr",
                md: "repeat(2, 1fr)",
              },
              "@media (min-width: 750px)": {
                gridTemplateColumns: "repeat(2, 1fr)",
              },
              gap: 2,
            }}>
            <Box sx={{ padding: 2, border: "none", borderRadius: "4px" }}>
              <Typography variant="subtitle2" sx={labelStyle}>
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
                <Typography variant="body2" sx={valueStyle}>
                  {displayDepartment}
                </Typography>
              )}

              <Typography variant="subtitle2" sx={labelStyle}>
                CHARGING
              </Typography>
              {isLoadingEmployeeData ? (
                <Skeleton
                  variant="text"
                  width="80%"
                  height={24}
                  sx={{ marginBottom: 2.5 }}
                />
              ) : (
                <Typography variant="body2" sx={valueStyle}>
                  {displayCharging}
                </Typography>
              )}

              <Typography variant="subtitle2" sx={labelStyle}>
                LOCATION
              </Typography>
              {isLoadingEmployeeData ? (
                <Skeleton variant="text" width="50%" height={24} />
              ) : (
                <Typography
                  variant="body2"
                  sx={{ ...valueStyle, marginBottom: 0 }}>
                  {displayLocation}
                </Typography>
              )}
            </Box>

            <Box sx={{ padding: 2, border: "none", borderRadius: "4px" }}>
              <Typography variant="subtitle2" sx={labelStyle}>
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
                <Typography variant="body2" sx={valueStyle}>
                  {displayPositionFrom}
                </Typography>
              )}

              <Typography variant="subtitle2" sx={labelStyle}>
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
                <Typography variant="body2" sx={valueStyle}>
                  {displaySubUnit}
                </Typography>
              )}

              <Typography variant="subtitle2" sx={labelStyle}>
                SCHEDULE
              </Typography>
              {isLoadingEmployeeData ? (
                <Skeleton variant="text" width="60%" height={24} />
              ) : (
                <Typography
                  variant="body2"
                  sx={{ ...valueStyle, marginBottom: 0 }}>
                  {displaySchedule}
                </Typography>
              )}
            </Box>
          </Box>
        </Box>
      ) : null}

      <Box sx={containerStyles.main}>
        <Controller
          name="form_id"
          control={control}
          render={({ field }) => (
            <input type="hidden" {...field} value={field.value?.id || 4} />
          )}
        />

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "1fr",
              md: "repeat(2, 1fr)",
            },
            "@media (min-width: 750px)": {
              gridTemplateColumns: "repeat(2, 1fr)",
            },
            gap: 2,
          }}>
          <Box>
            {isLoadingEmployeeData ? (
              <Skeleton variant="rounded" width="100%" height={56} />
            ) : (
              <Controller
                name="employee_id"
                control={control}
                rules={{ required: "Employee is required" }}
                render={({ field: { onChange, value } }) => (
                  <FormControl fullWidth error={!!errors.employee_id}>
                    {isReadOnly ? (
                      <TextField
                        label="Employee"
                        value={value?.employee_name || value?.full_name || ""}
                        fullWidth
                        disabled
                        sx={textFieldStyles.outlinedInput}
                      />
                    ) : (
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
                        disabled={isLoading}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label={
                              <span>
                                Employee{" "}
                                <span style={labelWithRequired}>*</span>
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
                                    <CircularProgress
                                      color="inherit"
                                      size={20}
                                    />
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
                    )}
                  </FormControl>
                )}
              />
            )}
          </Box>

          <Box>
            {isLoadingEmployeeData ? (
              <Skeleton variant="rounded" width="100%" height={56} />
            ) : (
              <Controller
                name="movement_type_id"
                control={control}
                rules={{ required: "Movement type is required" }}
                render={({ field: { onChange, value } }) => (
                  <FormControl fullWidth error={!!errors.movement_type_id}>
                    {isReadOnly ? (
                      <TextField
                        label="Movement Type"
                        value={value?.name || value?.type_name || ""}
                        fullWidth
                        disabled
                        sx={textFieldStyles.outlinedInput}
                      />
                    ) : (
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
                        disabled={isLoading}
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
                                    <CircularProgress
                                      color="inherit"
                                      size={20}
                                    />
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
                    )}
                  </FormControl>
                )}
              />
            )}
          </Box>

          <Box>
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
                    readOnly={isReadOnly}
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
          </Box>

          <Box>
            {isLoadingEmployeeData ? (
              <Skeleton variant="rounded" width="100%" height={56} />
            ) : (
              <Controller
                name="to_position_id"
                control={control}
                rules={{ required: "Position is required" }}
                render={({ field: { onChange, value } }) => (
                  <FormControl fullWidth error={!!errors.to_position_id}>
                    {isReadOnly ? (
                      <TextField
                        label="Position to"
                        value={
                          value?.title_with_unit ||
                          value?.title?.name ||
                          value?.name ||
                          value?.position_name ||
                          ""
                        }
                        fullWidth
                        disabled
                        sx={textFieldStyles.outlinedInput}
                      />
                    ) : (
                      <Autocomplete
                        value={value || null}
                        onChange={(event, item) => onChange(item)}
                        options={positions}
                        loading={positionsLoading}
                        getOptionLabel={(item) => {
                          if (typeof item === "string") return item;
                          return (
                            item?.title_with_unit ||
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
                        disabled={isLoading}
                        renderOption={(props, option) => (
                          <li {...props} key={option.id || option}>
                            <Box
                              sx={{ display: "flex", flexDirection: "column" }}>
                              <span style={{ fontSize: "0.875rem" }}>
                                {typeof option === "string"
                                  ? option
                                  : option?.title_with_unit ||
                                    option?.title?.name ||
                                    option?.name ||
                                    option?.position_name ||
                                    ""}
                              </span>
                              {option?.code && (
                                <span
                                  style={{
                                    fontSize: "0.75rem",
                                    color: "#888",
                                  }}>
                                  {option.code}
                                  {option?.charging?.name
                                    ? ` • ${option.charging.name}`
                                    : ""}
                                  {option?.team ? ` • ${option.team}` : ""}
                                </span>
                              )}
                            </Box>
                          </li>
                        )}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label={
                              <span>
                                Position to{" "}
                                <span style={labelWithRequired}>*</span>
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
                                    <CircularProgress
                                      color="inherit"
                                      size={20}
                                    />
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
                      />
                    )}
                  </FormControl>
                )}
              />
            )}
          </Box>

          <Box sx={{ gridColumn: "1 / -1" }}>
            {isLoadingEmployeeData ? (
              <Skeleton variant="rounded" width="100%" height={56} />
            ) : (
              <Controller
                name="to_schedule_id"
                control={control}
                render={({ field: { onChange, value } }) => (
                  <FormControl fullWidth>
                    {isReadOnly ? (
                      <TextField
                        label="Schedule To"
                        value={getScheduleLabel(
                          schedules.find((s) => s.id === value) ||
                            selectedEntry?.result?.submittable?.to_schedule ||
                            null,
                        )}
                        fullWidth
                        disabled
                        sx={textFieldStyles.outlinedInput}
                      />
                    ) : (
                      <Autocomplete
                        value={
                          schedules.find((s) => s.id === value) ||
                          (value &&
                          selectedEntry?.result?.submittable?.to_schedule
                            ?.id === value
                            ? selectedEntry.result.submittable.to_schedule
                            : null)
                        }
                        onChange={(event, item) => onChange(item?.id || null)}
                        options={schedules}
                        loading={schedulesLoading}
                        getOptionLabel={getScheduleLabel}
                        isOptionEqualToValue={(option, val) =>
                          option?.id === val?.id
                        }
                        onOpen={() => handleDropdownFocus("schedules")}
                        disabled={isLoading}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Schedule To"
                            fullWidth
                            sx={textFieldStyles.outlinedInput}
                            InputProps={{
                              ...params.InputProps,
                              endAdornment: (
                                <>
                                  {schedulesLoading && (
                                    <CircularProgress
                                      color="inherit"
                                      size={20}
                                    />
                                  )}
                                  {params.InputProps.endAdornment}
                                </>
                              ),
                            }}
                          />
                        )}
                        noOptionsText={
                          schedulesLoading
                            ? "Loading schedules..."
                            : "No schedules found"
                        }
                        renderOption={(props, option) => (
                          <li {...props} key={option.id}>
                            {getScheduleLabel(option)}
                          </li>
                        )}
                      />
                    )}
                  </FormControl>
                )}
              />
            )}
          </Box>

          {showMrfField && (
            <Box sx={{ gridColumn: "1 / -1" }}>
              {isLoadingEmployeeData ? (
                <Skeleton variant="rounded" width="100%" height={56} />
              ) : (
                <Controller
                  name="approved_mrf_id"
                  control={control}
                  rules={{ required: showMrfField ? "MRF is required" : false }}
                  render={({ field: { onChange, value } }) => (
                    <FormControl fullWidth error={!!errors.approved_mrf_id}>
                      {isReadOnly ? (
                        <TextField
                          label="MRF"
                          value={value?.submission_title || ""}
                          fullWidth
                          disabled
                          sx={textFieldStyles.outlinedInput}
                        />
                      ) : (
                        <Autocomplete
                          value={value || null}
                          onChange={(event, item) => onChange(item)}
                          options={mrfSubmissions}
                          loading={mrfSubmissionsLoading}
                          getOptionLabel={(item) => {
                            return item?.submission_title || "";
                          }}
                          isOptionEqualToValue={(option, value) =>
                            option?.id === value?.id
                          }
                          onOpen={() => handleDropdownFocus("mrfSubmissions")}
                          disabled={isLoading}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              label={
                                <span>
                                  MRF <span style={labelWithRequired}>*</span>
                                </span>
                              }
                              error={!!errors.approved_mrf_id}
                              helperText={errors.approved_mrf_id?.message}
                              fullWidth
                              sx={textFieldStyles.outlinedInput}
                              InputProps={{
                                ...params.InputProps,
                                endAdornment: (
                                  <>
                                    {mrfSubmissionsLoading && (
                                      <CircularProgress
                                        color="inherit"
                                        size={20}
                                      />
                                    )}
                                    {params.InputProps.endAdornment}
                                  </>
                                ),
                              }}
                            />
                          )}
                          noOptionsText={
                            mrfSubmissionsLoading
                              ? "Loading MRF submissions..."
                              : "No MRF submissions found"
                          }
                          renderOption={(props, option) => (
                            <li {...props} key={option.id}>
                              {option?.submission_title || ""}
                            </li>
                          )}
                        />
                      )}
                    </FormControl>
                  )}
                />
              )}
            </Box>
          )}

          {attachmentInstructions && (
            <Box sx={{ gridColumn: "1 / -1", mb: 1 }}>
              <Alert
                severity="info"
                sx={{
                  backgroundColor: "rgba(33, 61, 112, 0.08)",
                  border: "1px solid rgba(33, 61, 112, 0.2)",
                  "& .MuiAlert-icon": {
                    color: "rgb(33, 61, 112)",
                  },
                  "& .MuiAlert-message": {
                    color: "rgb(33, 61, 112)",
                  },
                }}>
                <Typography
                  variant="subtitle2"
                  sx={{ fontWeight: 600, mb: 0.5 }}>
                  Required Attachments:
                </Typography>
                {attachmentInstructions.map((instruction, index) => (
                  <Typography
                    key={index}
                    variant="body2"
                    sx={{ fontSize: "13px" }}>
                    {instruction}
                  </Typography>
                ))}
              </Alert>
            </Box>
          )}

          {!shouldHideAttachmentField && (
            <Box sx={{ gridColumn: "1 / -1" }}>
              <DataChangeAttachmentFields
                isLoading={isLoading}
                mode={mode}
                selectedEntry={selectedEntry}
              />
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default DataChangeModalFields;
