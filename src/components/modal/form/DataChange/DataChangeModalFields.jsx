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
  });
  const [showSkeleton, setShowSkeleton] = useState(false);
  const [editModeEmployees, setEditModeEmployees] = useState([]);

  const { data: formsData, isLoading: formsLoading } =
    useGetAllApprovalFormsQuery(
      { page: 1, per_page: 1000, status: "active" },
      { skip: !shouldLoadDropdowns || mode !== "create" }
    );

  const [
    triggerGetEmployees,
    { data: employeesData, isLoading: employeesLoading },
  ] = useLazyGetAllDataChangeEmployeeQuery();

  const { data: movementTypesData, isLoading: movementTypesLoading } =
    useGetAllMovementTypesQuery(
      { page: 1, per_page: 1000, status: "active" },
      { skip: !shouldLoadDropdowns || !dropdownsLoaded.movementTypes }
    );

  const { data: positionsData, isLoading: positionsLoading } =
    useGetAllPositionsQuery(
      { page: 1, per_page: 1000, status: "active" },
      { skip: !shouldLoadDropdowns || !dropdownsLoaded.positions }
    );

  const { data: mrfSubmissionsData, isLoading: mrfSubmissionsLoading } =
    useGetAllMrfSubmissionsQuery(
      {
        status: "active",
        approval_status: "approved",
      },
      { skip: !shouldLoadDropdowns || !dropdownsLoaded.mrfSubmissions }
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

  const employees = useMemo(() => {
    return normalizeApiData(employeesData);
  }, [employeesData, normalizeApiData]);

  const movementTypes = useMemo(
    () => normalizeApiData(movementTypesData),
    [movementTypesData, normalizeApiData]
  );

  const positions = useMemo(
    () => normalizeApiData(positionsData),
    [positionsData, normalizeApiData]
  );

  const mrfSubmissions = useMemo(
    () => normalizeApiData(mrfSubmissionsData),
    [mrfSubmissionsData, normalizeApiData]
  );

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
        excludedType.toLowerCase() === movementTypeName.toLowerCase()
    );

    return !isExcluded;
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
    [dropdownsLoaded, triggerGetEmployees, shouldLoadDropdowns]
  );

  useEffect(() => {
    if (mode === "create") {
      setValue("form_id", { id: 4 });
    }
  }, [setValue, mode]);

  useEffect(() => {
    if (mode === "edit" && selectedEntry?.result?.submittable) {
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
          schedule: submittable.from_position?.schedule?.name || "N/A",
          job_rate: submittable.from_position?.job_rate || 0,
        };

        setValue("employee_id", singleEmployee, { shouldValidate: false });
      }
    }
  }, [mode, selectedEntry, setValue]);

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
              attachment.existing_file_id
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

  const displayDepartment =
    mode === "view" && selectedEntry?.result?.submittable
      ? selectedEntry.result.submittable.from_position?.charging
          ?.department_name || "N/A"
      : displayEmployee?.department || "N/A";

  const displaySchedule =
    mode === "view" && selectedEntry?.result?.submittable
      ? selectedEntry.result.submittable.from_position?.schedule?.name || "N/A"
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
            <Box
              sx={{
                padding: 2,
                border: "none",
                borderRadius: "4px",
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
                  {displayDepartment}
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
                  {displaySchedule}
                </Typography>
              )}
            </Box>

            <Box
              sx={{
                padding: 2,
                border: "none",
                borderRadius: "4px",
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
                  {displayPositionFrom}
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
                  {displaySubUnit}
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

          <Box sx={{ gridColumn: "1 / -1" }}>
            <DataChangeAttachmentFields
              isLoading={isLoading}
              mode={mode}
              selectedEntry={selectedEntry}
            />
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default DataChangeModalFields;
