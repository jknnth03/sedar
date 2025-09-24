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
import {
  useGetAllEmployeesQuery,
  useGetAllPositionsQuery,
} from "../../../../features/api/employee/mainApi";
import { useGetAllMovementTypesQuery } from "../../../../features/api/extras/movementTypesApi";
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

let idCounter = 0;
const generateUniqueId = (prefix = "attachment") => {
  idCounter++;
  return `${prefix}_${Date.now()}_${idCounter}_${Math.random()
    .toString(36)
    .substr(2, 9)}`;
};

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

  const { fields, append, remove, replace } = useFieldArray({
    control,
    name: "attachments",
  });

  const watchedAttachments = watch("attachments");
  const [dropdownsLoaded, setDropdownsLoaded] = useState({
    forms: false,
    employees: false,
    movementTypes: false,
    positions: false,
  });

  const [dataPopulated, setDataPopulated] = useState(false);

  const { data: formsData, isLoading: formsLoading } =
    useGetAllApprovalFormsQuery(
      { page: 1, per_page: 1000, status: "active" },
      { skip: mode !== "create" || !dropdownsLoaded.forms }
    );

  const { data: employeesData, isLoading: employeesLoading } =
    useGetAllEmployeesQuery(
      { page: 1, per_page: 1000, status: "active" },
      { skip: mode !== "create" || !dropdownsLoaded.employees }
    );

  const { data: movementTypesData, isLoading: movementTypesLoading } =
    useGetAllMovementTypesQuery(
      { page: 1, per_page: 1000, status: "active" },
      { skip: mode !== "create" || !dropdownsLoaded.movementTypes }
    );

  const { data: positionsData, isLoading: positionsLoading } =
    useGetAllPositionsQuery(
      { page: 1, per_page: 1000, status: "active" },
      { skip: mode !== "create" || !dropdownsLoaded.positions }
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
      if (mode === "create" && !dropdownsLoaded[dropdownName]) {
        setDropdownsLoaded((prev) => ({ ...prev, [dropdownName]: true }));
      }
    },
    [dropdownsLoaded, mode]
  );

  const findEmployeeById = useCallback(
    (id) => {
      return employees.find((emp) => emp.id === id || emp.employee_id === id);
    },
    [employees]
  );

  const findPositionById = useCallback(
    (id) => {
      return positions.find((pos) => pos.id === id);
    },
    [positions]
  );

  const findMovementTypeByName = useCallback(
    (name) => {
      const searchTerms = ["promotion", "transfer", "demotion", "lateral"];
      const foundTerm = searchTerms.find((term) =>
        name?.toLowerCase().includes(term)
      );
      return movementTypes.find((mt) =>
        mt.name?.toLowerCase().includes(foundTerm || name?.toLowerCase() || "")
      );
    },
    [movementTypes]
  );

  const populateFormWithExistingData = useCallback(() => {
    if (
      !selectedEntry?.result?.submittable ||
      dataPopulated ||
      (mode !== "view" && mode !== "edit")
    ) {
      return;
    }

    const submittable = selectedEntry.result.submittable;
    const submittedBy = selectedEntry.result.submitted_by;

    const formData = {
      form_id: { id: selectedEntry.result.form?.id || 4 },
      employee_id: {
        id: submittable.employee_id,
        general_info: {
          full_name: submittedBy?.full_name || "Unknown Employee",
        },
        full_name: submittedBy?.full_name || "Unknown Employee",
      },
      movement_type_id: {
        id: 1,
        name: "Data Change",
      },
      effective_date: submittable.effective_date
        ? dayjs(submittable.effective_date)
        : null,
      to_position_id: submittable.to_position
        ? {
            id: submittable.to_position.id,
            title: {
              name: submittable.to_position.title?.name || "Unknown Position",
            },
            name: submittable.to_position.title?.name || "Unknown Position",
          }
        : null,
      to_job_rate: submittable.to_job_rate || "",
      justification: submittable.justification || "",
    };

    const attachmentsData = submittable.attachments || [];
    const attachmentFields =
      attachmentsData.length > 0
        ? attachmentsData.map((attachment) => ({
            id: generateUniqueId(),
            file_attachment: null,
            existing_file_name:
              attachment.original_filename ||
              attachment.file_path?.split("/").pop() ||
              "Unknown file",
            existing_file_path: attachment.file_path,
            is_new_file: false,
          }))
        : [
            {
              id: generateUniqueId(),
              file_attachment: null,
              existing_file_name: null,
              is_new_file: true,
            },
          ];

    replace(attachmentFields);
    setDataPopulated(true);
  }, [selectedEntry, setValue, replace, dataPopulated, mode]);

  const initializeAttachments = useCallback(() => {
    if (mode === "create") {
      const currentAttachments = getValues("attachments");
      if (!currentAttachments || currentAttachments.length === 0) {
        const emptyAttachment = {
          id: generateUniqueId(),
          file_attachment: null,
          existing_file_name: null,
          is_new_file: true,
        };
        replace([emptyAttachment]);
      }
    }
  }, [replace, getValues, mode]);

  useEffect(() => {
    if (mode === "create") {
      setValue("form_id", { id: 4 });
      setDataPopulated(false);
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
    }
  }, [mode]);

  useEffect(() => {
    if (mode === "view" && selectedEntry && !dataPopulated) {
      populateFormWithExistingData();
    }
  }, [mode, selectedEntry, populateFormWithExistingData, dataPopulated]);

  const createFormData = useCallback(() => {
    const formData = new FormData();
    const values = getValues();

    // Add form_id
    formData.append("form_id", 4);

    // Add other form fields
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

    if (values.justification) {
      formData.append("justification", values.justification);
    }

    if (values.attachments && Array.isArray(values.attachments)) {
      const validFiles = [];

      values.attachments.forEach((attachment, index) => {
        if (attachment && attachment.file_attachment instanceof File) {
          validFiles.push(attachment.file_attachment);
        }
      });

      if (validFiles.length > 0) {
        validFiles.forEach((file, index) => {
          formData.append("attachments[]", file);
        });
      } else {
        console.warn("No valid files found in attachments");
      }
    } else {
      console.warn("No attachments array found or not an array");
    }

    // Note: _method will be added by the API mutation itself
    return formData;
  }, [getValues]);

  useEffect(() => {
    if (onFormDataCreate) {
      onFormDataCreate(createFormData);
    }
  }, [createFormData, onFormDataCreate]);

  const handleFileChange = useCallback(
    (index, event) => {
      const file = event.target.files[0];

      if (file) {
        if (file.type !== "application/pdf") {
          alert("Only PDF files are allowed");
          return;
        }
        if (file.size > 10 * 1024 * 1024) {
          alert("File size must be less than 10MB");
          return;
        }

        setValue(`attachments.${index}.file_attachment`, file, {
          shouldValidate: true,
          shouldDirty: true,
        });
        setValue(`attachments.${index}.is_new_file`, true);
        setValue(`attachments.${index}.existing_file_name`, null);
      }
      event.target.value = "";
    },
    [setValue]
  );

  const handleUploadBoxClick = (index) => {
    document.getElementById(`attachment-upload-input-${index}`).click();
  };

  const replaceAttachment = useCallback((index) => {
    document.getElementById(`attachment-upload-input-${index}`).click();
  }, []);

  const addAttachmentLine = useCallback(() => {
    const newAttachment = {
      id: generateUniqueId(),
      file_attachment: null,
      existing_file_name: null,
      is_new_file: true,
    };
    append(newAttachment);
  }, [append]);

  const removeAttachmentLine = useCallback(
    (index) => {
      const currentAttachments = getValues("attachments") || [];
      if (currentAttachments.length > 1) {
        remove(index);
      }
    },
    [getValues, remove]
  );

  const getFileName = useCallback((fileData) => {
    if (!fileData) return null;
    if (fileData instanceof File) return fileData.name;
    if (typeof fileData === "string")
      return fileData.split("/").pop() || fileData;
    if (typeof fileData === "object") {
      return (
        fileData.name ||
        fileData.filename ||
        fileData.original_name ||
        "Unknown file"
      );
    }
    return "Unknown file";
  }, []);

  useEffect(() => {
    if (fields.length === 0 && mode === "create") {
      initializeAttachments();
    }
  }, [fields.length, initializeAttachments, mode]);

  const isReadOnly = mode === "view";

  return (
    <Box>
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
                      if (item?.general_info?.full_name) {
                        return item.general_info.full_name;
                      }
                      if (item?.full_name) {
                        return item.full_name;
                      }
                      if (item?.name) {
                        return item.name;
                      }
                      const firstName =
                        item?.general_info?.first_name ||
                        item?.first_name ||
                        "";
                      const lastName =
                        item?.general_info?.last_name || item?.last_name || "";
                      const fullName = `${firstName} ${lastName}`.trim();
                      return fullName || "Unknown Employee";
                    }}
                    isOptionEqualToValue={(option, value) => {
                      const optionId = option?.id || option?.general_info?.id;
                      const valueId = value?.id || value?.general_info?.id;
                      return optionId === valueId;
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
                        {option?.general_info?.full_name ||
                          option?.full_name ||
                          "Unknown Employee"}
                      </li>
                    )}
                  />
                </FormControl>
              )}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Grid item xs={12} sm={6} sx={gridItemStyles.xs12sm6}></Grid>
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
          </Grid>
          <Grid item xs={12} md={6}>
            <Grid item xs={12} sm={6} sx={gridItemStyles.xs12sm6}></Grid>
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
          </Grid>
          <Grid item xs={12} md={6}>
            <Grid item xs={12} sm={6} sx={gridItemStyles.xs12sm6}></Grid>
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
          </Grid>
          <Grid item xs={12} md={6}>
            <Grid item xs={12} sm={6} sx={gridItemStyles.xs12sm6}></Grid>
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
          </Grid>
          <Grid item xs={12} md={6}>
            <Grid item xs={12} sm={6} sx={gridItemStyles.xs12sm6}></Grid>
            <Controller
              name="justification"
              control={control}
              rules={{ required: "Justification is required" }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label={
                    <span>
                      Justification <span style={labelWithRequired}>*</span>
                    </span>
                  }
                  multiline
                  rows={2}
                  fullWidth
                  error={!!errors.justification}
                  helperText={errors.justification?.message}
                  disabled={isLoading || isReadOnly}
                  sx={textFieldStyles.outlinedInput}
                  InputLabelProps={{
                    shrink: !!field.value,
                  }}
                />
              )}
            />
          </Grid>
          <Grid item xs={12}>
            <Box sx={containerStyles.attachmentSection}>
              {fields.map((field, index) => {
                const hasFile =
                  watchedAttachments?.[index]?.file_attachment ||
                  watchedAttachments?.[index]?.existing_file_name;
                const fileName = hasFile
                  ? getFileName(
                      watchedAttachments[index]?.file_attachment ||
                        watchedAttachments[index]?.existing_file_name
                    )
                  : null;

                const isLastItem = index === fields.length - 1;
                const showAddButton = isLastItem && hasFile;
                const showDeleteButton = fields.length > 1;

                return (
                  <Box key={field.id} sx={containerStyles.attachmentItem}>
                    <input
                      accept=".pdf"
                      style={hiddenInputStyles}
                      id={`attachment-upload-input-${index}`}
                      type="file"
                      onChange={(e) => handleFileChange(index, e)}
                      disabled={isLoading || isReadOnly}
                    />

                    <AttachmentBox
                      hasFile={hasFile}
                      sx={attachmentBoxMainStyles}>
                      <Box
                        sx={attachmentBoxContentStyles}
                        onClick={() =>
                          !isReadOnly && handleUploadBoxClick(index)
                        }>
                        <CloudUploadIcon
                          sx={
                            hasFile
                              ? uploadIconWithFileStyles
                              : uploadIconNoFileStyles
                          }
                        />
                        <Box>
                          {hasFile ? (
                            <>
                              <Typography sx={fileNameStyles}>
                                File name:{" "}
                                <span style={labelWithRequired}>
                                  {fileName}
                                </span>
                              </Typography>
                              <Typography
                                sx={replaceAttachmentStyles}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (!isReadOnly) replaceAttachment(index);
                                }}>
                                Click to again the field to replace the
                                attachment
                              </Typography>
                            </>
                          ) : (
                            <>
                              <Typography sx={uploadAttachmentTitleStyles}>
                                UPLOAD ATTACHMENT (PDF ONLY) *
                              </Typography>
                              <Typography sx={uploadAttachmentSubtextStyles}>
                                Click to browse files or drag and drop
                              </Typography>
                            </>
                          )}
                        </Box>
                      </Box>

                      {!isReadOnly && (
                        <>
                          {showAddButton && (
                            <Button
                              variant="contained"
                              color="success"
                              size="small"
                              startIcon={<AddIcon />}
                              onClick={(e) => {
                                e.stopPropagation();
                                addAttachmentLine();
                              }}
                              sx={buttonStyles.addLine}>
                              ADD LINE
                            </Button>
                          )}
                          {showDeleteButton && !showAddButton && (
                            <Button
                              variant="contained"
                              color="error"
                              size="small"
                              startIcon={<DeleteIcon />}
                              onClick={(e) => {
                                e.stopPropagation();
                                removeAttachmentLine(index);
                              }}
                              sx={buttonStyles.deleteLine}>
                              DELETE LINE
                            </Button>
                          )}
                        </>
                      )}
                    </AttachmentBox>
                  </Box>
                );
              })}
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default DataChangeModalFields;
