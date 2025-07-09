import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from "react";
import { useFormContext, Controller, useFieldArray } from "react-hook-form";
import {
  Box,
  Alert,
  TextField,
  FormControl,
  Grid,
  Button,
  Typography,
  CircularProgress,
  IconButton,
  Autocomplete,
  FormHelperText,
} from "@mui/material";
import { Add as AddIcon, Delete as DeleteIcon } from "@mui/icons-material";
import { useSnackbar } from "notistack";
import { useLazyGetAllCabinetsQuery } from "../../../../../features/api/extras/cabinets";
import { useLazyGetAllFileTypesQuery } from "../../../../../features/api/extras/filetypesApi";

let idCounter = 0;
const generateUniqueId = (prefix = "file") => {
  idCounter++;
  return `${prefix}_${Date.now()}_${idCounter}_${Math.random()
    .toString(36)
    .substr(2, 9)}`;
};

const FileForm = ({
  onSubmit,
  selectedFiles = [],
  showArchived,
  isLoading = false,
  employeeId,
  onValidationChange,
  employeeData,
  mode = "create",
  isViewMode = false,
  readOnly = false,
  disabled = false,
}) => {
  const { enqueueSnackbar } = useSnackbar();
  const {
    control,
    formState: { errors },
    setValue,
    watch,
    getValues,
    trigger,
    clearErrors,
    setError,
  } = useFormContext();
  const { fields, append, remove, replace } = useFieldArray({
    control,
    name: "files",
  });

  const watchedFiles = watch("files");
  const isInitialMount = useRef(true);
  const hasInitializedData = useRef(false);

  const [errorMessage, setErrorMessage] = useState(null);

  const [dropdownsLoaded, setDropdownsLoaded] = useState({
    fileTypes: false,
    fileCabinets: false,
  });

  const [
    triggerFileTypes,
    {
      data: fileTypesData,
      isLoading: isLoadingFileTypes,
      error: fileTypesError,
    },
  ] = useLazyGetAllFileTypesQuery();

  const [
    triggerFileCabinets,
    {
      data: fileCabinetsData,
      isLoading: isLoadingFileCabinets,
      error: fileCabinetsError,
    },
  ] = useLazyGetAllCabinetsQuery();

  const isReadOnly = mode === "view" || isViewMode;
  const isFieldDisabled = isLoading || isReadOnly || readOnly || disabled;

  useEffect(() => {
    const loadInitialData = async () => {
      if (mode === "edit" || mode === "view" || isViewMode) {
        const fetchParams = { page: 1, per_page: 1000, status: "active" };

        try {
          const promises = [
            triggerFileTypes(fetchParams),
            triggerFileCabinets(fetchParams),
          ];

          await Promise.allSettled(promises);

          setDropdownsLoaded({
            fileTypes: true,
            fileCabinets: true,
          });
        } catch (error) {
          // Error will be handled by individual query error states
        }
      }
    };

    loadInitialData();
  }, [mode, isViewMode, triggerFileTypes, triggerFileCabinets]);

  const handleDropdownFocus = async (dropdownName) => {
    if (dropdownsLoaded[dropdownName] || isReadOnly) return;

    const fetchParams = { page: 1, per_page: 1000, status: "active" };

    try {
      switch (dropdownName) {
        case "fileTypes":
          await triggerFileTypes(fetchParams);
          break;
        case "fileCabinets":
          await triggerFileCabinets(fetchParams);
          break;
        default:
          return;
      }

      setDropdownsLoaded((prev) => ({ ...prev, [dropdownName]: true }));
    } catch (error) {
      // Error will be handled by individual query error states
    }
  };

  const normalizeApiData = (data) => {
    if (!data) return [];

    let options = [];
    if (data?.result?.data && Array.isArray(data.result.data)) {
      options = data.result.data;
    } else if (data?.data?.data && Array.isArray(data.data.data)) {
      options = data.data.data;
    } else if (data?.data && Array.isArray(data.data)) {
      options = data.data;
    } else if (Array.isArray(data)) {
      options = data;
    } else if (data?.results && Array.isArray(data.results)) {
      options = data.results;
    } else if (data?.items && Array.isArray(data.items)) {
      options = data.items;
    } else if (data?.content && Array.isArray(data.content)) {
      options = data.content;
    } else {
      const keys = Object.keys(data);
      for (const key of keys) {
        if (Array.isArray(data[key])) {
          options = data[key];
          break;
        }
      }
    }
    return options;
  };

  const processedFileTypes = useMemo(() => {
    return normalizeApiData(fileTypesData);
  }, [fileTypesData]);

  const processedFileCabinets = useMemo(() => {
    return normalizeApiData(fileCabinetsData);
  }, [fileCabinetsData]);

  const getFileTypeLabel = useCallback((option) => {
    if (!option) return "Unknown";
    const code =
      option?.code ||
      option?.file_type_code ||
      option?.type_code ||
      option?.id?.toString() ||
      "";
    const name =
      option?.name ||
      option?.file_type_name ||
      option?.type_name ||
      option?.description ||
      option?.title ||
      "";
    return code && name
      ? `${code} - ${name}`
      : name || code || `ID: ${option?.id || "Unknown"}`;
  }, []);

  const getFileCabinetLabel = useCallback((option) => {
    if (!option) return "Unknown";
    const code =
      option?.code ||
      option?.cabinet_code ||
      option?.file_cabinet_code ||
      option?.id?.toString() ||
      "";
    const name =
      option?.name ||
      option?.cabinet_name ||
      option?.file_cabinet_name ||
      option?.description ||
      option?.title ||
      "";
    return code && name
      ? `${code} - ${name}`
      : name || code || `ID: ${option?.id || "Unknown"}`;
  }, []);

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
        fileData.file_name ||
        "Unknown file"
      );
    }
    return "Unknown file";
  }, []);

  const initializeEmptyForm = useCallback(() => {
    const currentFiles = getValues("files");
    if (currentFiles && currentFiles.length > 0) {
      return;
    }

    const emptyLine = {
      id: generateUniqueId(),
      index: 0,
      file_type_id: null,
      file_cabinet_id: null,
      file_description: "",
      file_attachment: null,
      existing_file_name: null,
      // Add field to track if this is a new file upload
      is_new_file: true,
    };
    replace([emptyLine]);
    clearErrors("files");
    setErrorMessage(null);
  }, [replace, clearErrors, getValues]);

  const initializeWithEmployeeData = useCallback(
    (employeeData) => {
      const currentFiles = getValues("files");
      if (
        currentFiles &&
        currentFiles.length > 0 &&
        hasInitializedData.current
      ) {
        return;
      }

      if (
        employeeData?.files &&
        Array.isArray(employeeData.files) &&
        employeeData.files.length > 0
      ) {
        const newFileLines = employeeData.files.map((file, index) => {
          const fileTypeId = file.file_type_id || file.file_type?.id;
          const fileCabinetId =
            file.file_cabinet_id ||
            file.file_cabinet?.id ||
            file.cabinet?.id ||
            file.cabinet_id;

          const fileTypeObj = processedFileTypes.find(
            (ft) => ft.id == fileTypeId
          );
          const fileCabinetObj = processedFileCabinets.find(
            (fc) => fc.id == fileCabinetId
          );

          return {
            id: generateUniqueId(`employee_file_${index}`),
            index: index,
            file_type_id: fileTypeObj || null,
            file_cabinet_id: fileCabinetObj || null,
            file_description: file.file_description || file.description || "",
            file_attachment: null, // Don't show existing file in upload field
            existing_file_name:
              file.file_name || file.filename || file.original_name || null,
            existing_file_url: file.file_attachment || file.attachment || null,
            // Track that this is existing data
            is_new_file: false,
            original_file_id: file.id, // Keep reference to original file
          };
        });
        replace(newFileLines);
      } else {
        initializeEmptyForm();
      }
      clearErrors("files");
      setErrorMessage(null);
    },
    [
      replace,
      clearErrors,
      initializeEmptyForm,
      processedFileTypes,
      processedFileCabinets,
      getValues,
    ]
  );

  const initializeWithSelectedFiles = useCallback(
    (selectedFiles) => {
      const currentFiles = getValues("files");
      if (
        currentFiles &&
        currentFiles.length > 0 &&
        hasInitializedData.current
      ) {
        return;
      }

      if (
        selectedFiles &&
        Array.isArray(selectedFiles) &&
        selectedFiles.length > 0
      ) {
        const newFileLines = selectedFiles.map((file, index) => {
          const fileTypeId = file.file_type_id || file.file_type?.id;
          const fileCabinetId =
            file.file_cabinet_id ||
            file.file_cabinet?.id ||
            file.cabinet?.id ||
            file.cabinet_id;

          const fileTypeObj = processedFileTypes.find(
            (ft) => ft.id == fileTypeId
          );
          const fileCabinetObj = processedFileCabinets.find(
            (fc) => fc.id == fileCabinetId
          );

          return {
            id: generateUniqueId(`selected_file_${index}`),
            index: index,
            file_type_id: fileTypeObj || null,
            file_cabinet_id: fileCabinetObj || null,
            file_description: file.file_description || file.description || "",
            file_attachment: null, // Don't show existing file in upload field
            existing_file_name:
              file.file_name || file.filename || file.original_name || null,
            existing_file_url: file.file_attachment || file.attachment || null,
            is_new_file: false,
            original_file_id: file.id,
          };
        });
        replace(newFileLines);
      } else {
        initializeEmptyForm();
      }
      clearErrors("files");
      setErrorMessage(null);
    },
    [
      replace,
      clearErrors,
      initializeEmptyForm,
      processedFileTypes,
      processedFileCabinets,
      getValues,
    ]
  );

  useEffect(() => {
    if (mode === "create") {
      hasInitializedData.current = false;
    }
  }, [mode]);

  useEffect(() => {
    if (employeeId && mode === "edit") {
      hasInitializedData.current = false;
    }
  }, [employeeId, mode]);

  useEffect(() => {
    if (mode === "edit" && !hasInitializedData.current) {
      if (processedFileTypes.length > 0 && processedFileCabinets.length > 0) {
        if (employeeData && employeeData.files) {
          initializeWithEmployeeData(employeeData);
        } else if (selectedFiles && selectedFiles.length > 0) {
          initializeWithSelectedFiles(selectedFiles);
        } else {
          initializeEmptyForm();
        }
        hasInitializedData.current = true;
      }
    } else if (mode === "create" && !hasInitializedData.current) {
      initializeEmptyForm();
      hasInitializedData.current = true;
    }
  }, [
    mode,
    employeeData,
    selectedFiles,
    processedFileTypes.length,
    processedFileCabinets.length,
    initializeWithEmployeeData,
    initializeWithSelectedFiles,
    initializeEmptyForm,
  ]);

  const validateFileLine = useCallback((line) => {
    if (!line || !line.file_type_id || !line.file_cabinet_id) return false;
    const fileTypeId = line.file_type_id?.id || line.file_type_id;
    const fileCabinetId = line.file_cabinet_id?.id || line.file_cabinet_id;
    return !(
      !fileTypeId ||
      fileTypeId <= 0 ||
      !fileCabinetId ||
      fileCabinetId <= 0
    );
  }, []);

  const isFormValid = useMemo(() => {
    const files = watchedFiles || [];
    return files.length > 0 && files.every(validateFileLine);
  }, [watchedFiles, validateFileLine]);

  useEffect(() => {
    if (onValidationChange) {
      onValidationChange(isFormValid);
    }
  }, [isFormValid, onValidationChange]);

  const handleFileChange = useCallback(
    (index, event) => {
      if (isReadOnly) return;

      const file = event.target.files[0];

      if (file) {
        if (file.size > 10 * 1024 * 1024) {
          setError(`files.${index}.file_attachment`, {
            message: "File size must be less than 10MB",
          });
          return;
        }

        // Set the actual File object
        setValue(`files.${index}.file_attachment`, file, {
          shouldValidate: true,
          shouldDirty: true,
        });

        // Mark as new file
        setValue(`files.${index}.is_new_file`, true, {
          shouldValidate: true,
          shouldDirty: true,
        });

        clearErrors(`files.${index}.file_attachment`);
      }
    },
    [setValue, clearErrors, setError, isReadOnly]
  );
  const handleRemoveFile = useCallback(
    (index) => {
      if (isReadOnly) return;

      setValue(`files.${index}.file_attachment`, null, {
        shouldValidate: false,
      });
      clearErrors(`files.${index}.file_attachment`);

      const fileInput = document.getElementById(`file-upload-input-${index}`);
      if (fileInput) {
        fileInput.value = "";
      }
    },
    [setValue, clearErrors, isReadOnly]
  );

  const addFileLine = useCallback(() => {
    if (isReadOnly) return;

    const currentFiles = getValues("files") || [];
    const newIndex = currentFiles.length;
    const newLine = {
      id: generateUniqueId(`new_file_${newIndex}`),
      index: newIndex,
      file_type_id: null,
      file_cabinet_id: null,
      file_description: "",
      file_attachment: null,
      existing_file_name: null,
      is_new_file: true,
    };
    append(newLine);
  }, [getValues, append, isReadOnly]);

  const removeFileLine = useCallback(
    (index) => {
      if (isReadOnly) return;

      const currentFiles = getValues("files") || [];
      if (currentFiles.length > 1) {
        remove(index);
      }
    },
    [getValues, remove, isReadOnly]
  );

  const validateForm = useCallback(() => {
    const files = getValues("files") || [];
    let hasErrors = false;

    files.forEach((line, index) => {
      if (!line.file_type_id) {
        setError(`files.${index}.file_type_id`, {
          message: "File type is required",
        });
        hasErrors = true;
      }
      if (!line.file_cabinet_id) {
        setError(`files.${index}.file_cabinet_id`, {
          message: "File cabinet is required",
        });
        hasErrors = true;
      }

      if (line.file_type_id) {
        const fileTypeId = line.file_type_id?.id || line.file_type_id;
        if (!fileTypeId || fileTypeId <= 0) {
          setError(`files.${index}.file_type_id`, {
            message: "Invalid file type",
          });
          hasErrors = true;
        }
      }

      if (line.file_cabinet_id) {
        const fileCabinetId = line.file_cabinet_id?.id || line.file_cabinet_id;
        if (!fileCabinetId || fileCabinetId <= 0) {
          setError(`files.${index}.file_cabinet_id`, {
            message: "Invalid file cabinet",
          });
          hasErrors = true;
        }
      }
    });

    if (hasErrors) {
      setErrorMessage("Please fill in all required fields correctly.");
      return false;
    }

    return true;
  }, [getValues, setError]);

  const hasErrors = fileTypesError || fileCabinetsError;

  if (
    mode === "edit" &&
    !hasInitializedData.current &&
    (processedFileTypes.length === 0 || processedFileCabinets.length === 0)
  ) {
    return (
      <Box
        className="file-form-container"
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }
  return (
    <Box className="file-form-container">
      {hasErrors && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Error loading dropdown data. Please try again.
        </Alert>
      )}

      {errorMessage && (
        <Alert severity="error" className="file-form-alert">
          {errorMessage}
        </Alert>
      )}

      {fields.map((field, index) => (
        <Box key={field.id} className="file-line-container" sx={{ mb: 3 }}>
          <Grid container spacing={2} alignItems="flex-start">
            <Grid
              item
              xs={12}
              sm={3}
              sx={{ minWidth: "353px", maxWidth: "350px" }}>
              <Controller
                name={`files.${index}.file_type_id`}
                control={control}
                rules={{ required: "File type is required" }}
                render={({ field: controllerField, fieldState }) => (
                  <FormControl
                    fullWidth
                    error={!!fieldState.error}
                    disabled={isFieldDisabled || isLoadingFileTypes}
                    sx={{
                      width: "100%",
                      "& .MuiFormHelperText-root": {
                        marginTop: "4px",
                      },
                    }}>
                    <Autocomplete
                      {...controllerField}
                      onChange={(event, item) => {
                        if (!isReadOnly) {
                          controllerField.onChange(item);
                        }
                      }}
                      value={controllerField.value || null}
                      options={processedFileTypes ?? []}
                      loading={isLoadingFileTypes}
                      disabled={isFieldDisabled}
                      readOnly={isReadOnly}
                      getOptionLabel={(item) => getFileTypeLabel(item)}
                      isOptionEqualToValue={(option, value) => {
                        if (!option || !value) return false;
                        return option.id === value.id;
                      }}
                      onFocus={() => {
                        if (!isReadOnly) {
                          handleDropdownFocus("fileTypes");
                        }
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label={
                            <>
                              File Type <span style={{ color: "red" }}>*</span>
                            </>
                          }
                          error={!!fieldState.error}
                          helperText={fieldState.error?.message}
                          InputProps={{
                            ...params.InputProps,
                            readOnly: isReadOnly,
                          }}
                        />
                      )}
                    />

                    {fieldState.error && (
                      <FormHelperText>
                        {fieldState.error.message}
                      </FormHelperText>
                    )}
                  </FormControl>
                )}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <Grid
                item
                xs={12}
                sm={3}
                sx={{ minWidth: "353px", maxWidth: "350px" }}></Grid>
              <Controller
                name={`files.${index}.file_cabinet_id`}
                control={control}
                rules={{ required: "File cabinet is required" }}
                render={({ field: controllerField, fieldState }) => (
                  <FormControl
                    fullWidth
                    error={!!fieldState.error}
                    disabled={isFieldDisabled || isLoadingFileCabinets}
                    sx={{
                      width: "100%",
                      "& .MuiFormHelperText-root": {
                        marginTop: "4px",
                      },
                    }}>
                    <Autocomplete
                      {...controllerField}
                      onChange={(event, item) => {
                        if (!isReadOnly) {
                          controllerField.onChange(item);
                        }
                      }}
                      value={controllerField.value || null}
                      options={processedFileCabinets ?? []}
                      loading={isLoadingFileCabinets}
                      disabled={isFieldDisabled}
                      readOnly={isReadOnly}
                      getOptionLabel={(item) => getFileCabinetLabel(item)}
                      isOptionEqualToValue={(option, value) => {
                        if (!option || !value) return false;
                        return option.id === value.id;
                      }}
                      onFocus={() => {
                        if (!isReadOnly) {
                          handleDropdownFocus("fileCabinets");
                        }
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label={
                            <>
                              File Cabinet{" "}
                              <span style={{ color: "red" }}>*</span>
                            </>
                          }
                          error={!!fieldState.error}
                          helperText={fieldState.error?.message}
                          InputProps={{
                            ...params.InputProps,
                            readOnly: isReadOnly,
                          }}
                        />
                      )}
                    />
                    {fieldState.error && (
                      <FormHelperText>
                        {fieldState.error.message}
                      </FormHelperText>
                    )}
                  </FormControl>
                )}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <Grid
                item
                xs={12}
                sm={3}
                sx={{ minWidth: "353px", maxWidth: "350px" }}></Grid>
              <Controller
                name={`files.${index}.file_description`}
                control={control}
                render={({ field: controllerField, fieldState }) => (
                  <TextField
                    {...controllerField}
                    label="File Description"
                    variant="outlined"
                    fullWidth
                    disabled={isFieldDisabled}
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                    className="file-description-field"
                    placeholder="Enter file description"
                    InputProps={{
                      readOnly: isReadOnly,
                    }}
                    onChange={(e) => {
                      if (!isReadOnly) {
                        controllerField.onChange(e);
                      }
                    }}
                    sx={{ width: "100%" }}
                  />
                )}
              />
            </Grid>

            <Grid
              item
              xs={12}
              md={watchedFiles?.[index]?.existing_file_name ? 8 : 12}>
              <Grid
                item
                xs={12}
                sm={3}
                sx={{ minWidth: "1091px", maxWidth: "1091px" }}></Grid>
              <Box className="file-upload-container">
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <input
                    accept="*/*"
                    style={{ display: "none" }}
                    id={`file-upload-input-${index}`}
                    type="file"
                    onChange={(e) => handleFileChange(index, e)}
                    disabled={isReadOnly}
                  />
                  <label
                    htmlFor={`file-upload-input-${index}`}
                    style={{ flex: 1 }}>
                    <Button
                      variant="outlined"
                      component="span"
                      fullWidth
                      disabled={isFieldDisabled}
                      className="file-upload-button"
                      sx={{ height: "56px" }}>
                      {watchedFiles?.[index]?.file_attachment instanceof File
                        ? watchedFiles[index].file_attachment.name
                        : watchedFiles?.[index]?.existing_file_name
                        ? "Replace file (optional)"
                        : "Choose file (optional)"}
                    </Button>
                  </label>
                  {watchedFiles?.[index]?.file_attachment && !isReadOnly && (
                    <IconButton
                      size="small"
                      onClick={() => handleRemoveFile(index)}
                      disabled={isFieldDisabled}
                      color="red"
                      sx={{
                        minWidth: "auto",
                        padding: "8px",
                        "&:hover": {
                          backgroundColor: "rgba(211, 47, 47, 0.08)",
                        },
                      }}
                      title="Remove file">
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  )}
                </Box>
                {errors.files?.[index]?.file_attachment && (
                  <Typography
                    color="error"
                    variant="caption"
                    className="file-upload-error">
                    {errors.files[index].file_attachment.message}
                  </Typography>
                )}
                <Typography
                  variant="caption"
                  color="text.secondary"
                  className="file-upload-caption">
                  {watchedFiles?.[index]?.existing_file_name
                    ? "Leave empty to keep current file. Max size: 10MB"
                    : "Max size: 10MB"}
                </Typography>
              </Box>
            </Grid>

            {watchedFiles?.[index]?.existing_file_name && (
              <Grid item xs={12} md={4}>
                <Box className="current-file-display">
                  <Typography
                    variant="subtitle2"
                    color="text.secondary"
                    gutterBottom>
                    Current File:
                  </Typography>
                  <Typography variant="body2">
                    {getFileName(watchedFiles[index].existing_file_name)}
                  </Typography>
                </Box>
              </Grid>
            )}

            {!isReadOnly && (
              <Grid item xs={12}>
                <Box
                  className="file-line-actions"
                  sx={{ display: "flex", gap: 1, mt: 1 }}>
                  {fields.length > 1 && (
                    <Button
                      onClick={() => removeFileLine(index)}
                      disabled={isFieldDisabled}
                      variant="contained"
                      size="small"
                      startIcon={<DeleteIcon />}
                      sx={{
                        width: "1090px",
                        height: "50px",
                        backgroundColor: "rgb(220, 53, 69)",
                        color: "#fff !important",
                        "&:hover": {
                          backgroundColor: "rgb(200, 35, 51)",
                          color: "#fff !important",
                        },
                      }}
                      title="Remove this file line">
                      Remove Line
                    </Button>
                  )}
                  {index === fields.length - 1 && (
                    <Button
                      onClick={addFileLine}
                      disabled={isFieldDisabled}
                      variant="contained"
                      size="small"
                      startIcon={<AddIcon />}
                      sx={{
                        width: "1090px",
                        height: "50px",
                        backgroundColor: "rgb(40, 167, 69)",
                        color: "#fff !important",
                        "&:hover": {
                          backgroundColor: "rgb(34, 142, 58)",
                          color: "#fff !important",
                        },
                      }}
                      title="Add new file line">
                      Add Line
                    </Button>
                  )}
                </Box>
              </Grid>
            )}
          </Grid>
        </Box>
      ))}
    </Box>
  );
};

FileForm.displayName = "FileForm";

export default FileForm;
