import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from "react";
import {
  Box,
  Alert,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  FormHelperText,
  Grid,
  Button,
  Typography,
  CircularProgress,
  IconButton,
} from "@mui/material";
import { Add as AddIcon, Delete as DeleteIcon } from "@mui/icons-material";
import { useSnackbar } from "notistack";
import { useGetAllCabinetsQuery } from "../../../../features/api/extras/cabinets";
import { useGetAllFileTypesQuery } from "../../../../features/api/extras/filetypesApi";
import "./File.scss";

let idCounter = 0;
const generateUniqueId = (prefix = "file") => {
  idCounter++;
  return `${prefix}_${Date.now()}_${idCounter}_${Math.random()
    .toString(36)
    .substr(2, 9)}`;
};

const FileForm = React.forwardRef(
  (
    {
      onSubmit,
      selectedFiles = [],
      showArchived,
      isLoading = false,
      employeeId,
      onValidationChange,
      employeeData,
    },
    ref
  ) => {
    const { enqueueSnackbar } = useSnackbar();
    const [fileLines, setFileLines] = useState([]);
    const [errors, setErrors] = useState({});
    const [errorMessage, setErrorMessage] = useState(null);
    const [isInitialized, setIsInitialized] = useState(false);

    const {
      data: fileTypesData,
      isLoading: isLoadingFileTypes,
      error: fileTypesError,
    } = useGetAllFileTypesQuery({
      page: 1,
      per_page: 1000,
      status: "active",
    });

    const {
      data: fileCabinetsData,
      isLoading: isLoadingFileCabinets,
      error: fileCabinetsError,
    } = useGetAllCabinetsQuery({
      page: 1,
      per_page: 1000,
      status: "active",
    });

    const getDropdownOptions = (data, dataType = "unknown") => {
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

    const getFileTypeLabel = (option) => {
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
    };

    const getFileCabinetLabel = (option) => {
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
    };

    const getFileName = (fileData) => {
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
    };

    const processedFileTypes = useMemo(() => {
      return getDropdownOptions(fileTypesData, "file_types");
    }, [fileTypesData]);

    const processedFileCabinets = useMemo(() => {
      return getDropdownOptions(fileCabinetsData, "file_cabinets");
    }, [fileCabinetsData]);

    // Initialize empty form
    const initializeEmptyForm = useCallback(() => {
      setFileLines([
        {
          id: generateUniqueId(),
          index: 0,
          file_type_id: "",
          file_cabinet_id: "",
          file_description: "",
          file_attachment: null,
          existing_file_name: null,
        },
      ]);
      setErrors({});
      setErrorMessage(null);
      setIsInitialized(true);
    }, []);

    // Initialize with employee data
    const initializeWithEmployeeData = useCallback(
      (employeeData) => {
        if (
          employeeData?.files &&
          Array.isArray(employeeData.files) &&
          employeeData.files.length > 0
        ) {
          const newFileLines = employeeData.files.map((file, index) => ({
            id: generateUniqueId(`employee_file_${index}`),
            index: index,
            file_type_id: String(file.file_type_id || file.file_type?.id || ""),
            file_cabinet_id: String(
              file.file_cabinet_id ||
                file.file_cabinet?.id ||
                file.cabinet?.id ||
                file.cabinet_id ||
                ""
            ),
            file_description: file.file_description || file.description || "",
            file_attachment: null,
            existing_file_name:
              file.file_attachment ||
              file.attachment ||
              file.file_name ||
              file.filename ||
              file.original_name ||
              null,
          }));
          setFileLines(newFileLines);
        } else {
          initializeEmptyForm();
        }
        setErrors({});
        setErrorMessage(null);
        setIsInitialized(true);
      },
      [initializeEmptyForm]
    );

    // Initialize with selected files
    const initializeWithSelectedFiles = useCallback(
      (selectedFiles) => {
        if (
          selectedFiles &&
          Array.isArray(selectedFiles) &&
          selectedFiles.length > 0
        ) {
          const newFileLines = selectedFiles.map((file, index) => ({
            id: generateUniqueId(`selected_file_${index}`),
            index: index,
            file_type_id: String(file.file_type_id || file.file_type?.id || ""),
            file_cabinet_id: String(
              file.file_cabinet_id ||
                file.file_cabinet?.id ||
                file.cabinet?.id ||
                file.cabinet_id ||
                ""
            ),
            file_description: file.file_description || file.description || "",
            file_attachment: null,
            existing_file_name:
              file.file_attachment ||
              file.attachment ||
              file.file_name ||
              file.filename ||
              file.original_name ||
              null,
          }));
          setFileLines(newFileLines);
        } else {
          initializeEmptyForm();
        }
        setErrors({});
        setErrorMessage(null);
        setIsInitialized(true);
      },
      [initializeEmptyForm]
    );

    // Main initialization effect
    useEffect(() => {
      // Reset when employeeId changes
      if (employeeId) {
        setIsInitialized(false);
      }
    }, [employeeId]);

    useEffect(() => {
      if (!isInitialized) {
        if (employeeData && employeeData.files) {
          initializeWithEmployeeData(employeeData);
        } else if (selectedFiles && selectedFiles.length > 0) {
          initializeWithSelectedFiles(selectedFiles);
        } else {
          initializeEmptyForm();
        }
      }
    }, [
      isInitialized,
      employeeData,
      selectedFiles,
      initializeWithEmployeeData,
      initializeWithSelectedFiles,
      initializeEmptyForm,
    ]);

    const validateFileLine = useCallback((line) => {
      if (!line.file_type_id || !line.file_cabinet_id) return false;
      const fileTypeId = parseInt(line.file_type_id);
      const fileCabinetId = parseInt(line.file_cabinet_id);
      return !(
        isNaN(fileTypeId) ||
        fileTypeId <= 0 ||
        isNaN(fileCabinetId) ||
        fileCabinetId <= 0
      );
    }, []);

    const isFormValid = useMemo(() => {
      return fileLines.length > 0 && fileLines.every(validateFileLine);
    }, [fileLines, validateFileLine]);

    useEffect(() => {
      if (onValidationChange) onValidationChange(isFormValid);
    }, [isFormValid, onValidationChange]);

    useEffect(() => {
      if (fileTypesError) {
        enqueueSnackbar(
          `Failed to load file types: ${
            fileTypesError.status || "Unknown error"
          }`,
          {
            variant: "error",
            autoHideDuration: 5000,
          }
        );
      }
    }, [fileTypesError, enqueueSnackbar]);

    useEffect(() => {
      if (fileCabinetsError) {
        enqueueSnackbar(
          `Failed to load file cabinets: ${
            fileCabinetsError.status || "Unknown error"
          }`,
          {
            variant: "error",
            autoHideDuration: 5000,
          }
        );
      }
    }, [fileCabinetsError, enqueueSnackbar]);

    const handleChange = useCallback(
      (lineId, field, value) => {
        const safeLineId = String(lineId);
        setFileLines((prev) =>
          prev.map((line) => {
            if (String(line.id) === safeLineId) {
              return { ...line, [field]: value };
            }
            return line;
          })
        );

        const errorKey = `${safeLineId}_${field}`;
        setErrors((prev) => {
          if (prev[errorKey]) {
            const newErrors = { ...prev };
            delete newErrors[errorKey];
            return newErrors;
          }
          return prev;
        });

        if (errorMessage) setErrorMessage(null);
      },
      [errorMessage]
    );

    const handleFileChange = useCallback((lineId, event) => {
      const file = event.target.files[0];
      const safeLineId = String(lineId);

      if (file) {
        if (file.size > 10 * 1024 * 1024) {
          setErrors((prev) => ({
            ...prev,
            [`${safeLineId}_file_attachment`]: [
              "File size must be less than 10MB",
            ],
          }));
          return;
        }

        setFileLines((prev) =>
          prev.map((line) =>
            String(line.id) === safeLineId
              ? { ...line, file_attachment: file }
              : line
          )
        );

        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[`${safeLineId}_file_attachment`];
          return newErrors;
        });
      }
    }, []);

    const handleRemoveFile = useCallback((lineId) => {
      const safeLineId = String(lineId);
      setFileLines((prev) =>
        prev.map((line) =>
          String(line.id) === safeLineId
            ? { ...line, file_attachment: null }
            : line
        )
      );

      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[`${safeLineId}_file_attachment`];
        return newErrors;
      });

      const fileInput = document.getElementById(`file-upload-input-${lineId}`);
      if (fileInput) {
        fileInput.value = "";
      }
    }, []);

    const addFileLine = useCallback(() => {
      setFileLines((prev) => {
        const newIndex = prev.length;
        const newLine = {
          id: generateUniqueId(`new_file_${newIndex}`),
          index: newIndex,
          file_type_id: "",
          file_cabinet_id: "",
          file_description: "",
          file_attachment: null,
          existing_file_name: null,
        };
        return [...prev, newLine];
      });
    }, []);

    const removeFileLine = useCallback((lineId) => {
      const safeLineId = String(lineId);
      setFileLines((prevLines) => {
        if (prevLines.length > 1) {
          const filteredLines = prevLines.filter(
            (line) => String(line.id) !== safeLineId
          );
          return filteredLines.map((line, index) => ({
            ...line,
            index: index,
          }));
        }
        return prevLines;
      });

      setErrors((prev) => {
        const newErrors = { ...prev };
        Object.keys(newErrors).forEach((key) => {
          if (key.startsWith(`${safeLineId}_`)) {
            delete newErrors[key];
          }
        });
        return newErrors;
      });
    }, []);

    const validateForm = useCallback(() => {
      const newErrors = {};

      fileLines.forEach((line) => {
        const linePrefix = `${String(line.id)}_`;

        if (!line.file_type_id) {
          newErrors[`${linePrefix}file_type_id`] = true;
        }
        if (!line.file_cabinet_id) {
          newErrors[`${linePrefix}file_cabinet_id`] = true;
        }

        if (line.file_type_id) {
          const fileTypeId = parseInt(line.file_type_id);
          if (isNaN(fileTypeId) || fileTypeId <= 0) {
            newErrors[`${linePrefix}file_type_id`] = true;
          }
        }

        if (line.file_cabinet_id) {
          const fileCabinetId = parseInt(line.file_cabinet_id);
          if (isNaN(fileCabinetId) || fileCabinetId <= 0) {
            newErrors[`${linePrefix}file_cabinet_id`] = true;
          }
        }
      });

      setErrors(newErrors);

      if (Object.keys(newErrors).length > 0) {
        setErrorMessage("Please fill in all required fields correctly.");
        return false;
      }

      return true;
    }, [fileLines]);

    React.useImperativeHandle(
      ref,
      () => ({
        validateAndGetData: () => {
          if (validateForm()) {
            const formData = fileLines
              .filter(
                (line) =>
                  line.file_type_id ||
                  line.file_cabinet_id ||
                  line.file_description?.trim() ||
                  line.file_attachment
              )
              .map((line) => {
                const lineData = { ...line };
                delete lineData.id;
                return lineData;
              });
            return formData;
          }
          return null;
        },
        isFormValid: () => isFormValid,
        getFormData: () => {
          const formData = fileLines
            .filter(
              (line) =>
                line.file_type_id ||
                line.file_cabinet_id ||
                line.file_description?.trim() ||
                line.file_attachment
            )
            .map((line) => {
              const lineData = { ...line };
              delete lineData.id;
              return lineData;
            });
          return formData;
        },
        setFormData: (data) => {
          if (Array.isArray(data)) {
            const formattedData = data.map((item, index) => ({
              ...item,
              id: generateUniqueId(`set_file_${index}`),
              index: index,
            }));
            setFileLines(formattedData);
            setIsInitialized(true);
          }
        },
        resetForm: () => {
          initializeEmptyForm();
        },
        validateForm,
        setErrors,
        setErrorMessage,
      }),
      [validateForm, isFormValid, fileLines, initializeEmptyForm]
    );

    // Show loading state while initializing
    if (!isInitialized) {
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
        {errorMessage && (
          <Alert severity="error" className="file-form-alert">
            {errorMessage}
          </Alert>
        )}

        {fileTypesError && (
          <Alert severity="warning" className="file-form-alert">
            Failed to load file types from server.
          </Alert>
        )}

        {fileCabinetsError && (
          <Alert severity="warning" className="file-form-alert">
            Failed to load file cabinets from server.
          </Alert>
        )}

        {fileLines.map((line, index) => (
          <Box
            key={String(
              line.id || `file-${index}-${line.file_type_id || "empty"}`
            )}
            className="file-line-container">
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={6}>
                <FormControl
                  fullWidth
                  error={!!errors[`${String(line.id)}_file_type_id`]}
                  disabled={isLoading || isLoadingFileTypes}
                  className="file-type-select">
                  <InputLabel>
                    File Type <span style={{ color: "red" }}>*</span>
                  </InputLabel>
                  <Select
                    name="file_type_id"
                    value={line.file_type_id || ""}
                    label="File Type *"
                    onChange={(e) =>
                      handleChange(
                        String(line.id),
                        "file_type_id",
                        e.target.value
                      )
                    }>
                    {isLoadingFileTypes ? (
                      <MenuItem disabled>
                        <Box className="loading-item">
                          <CircularProgress size={20} />
                          <span>Loading file types...</span>
                        </Box>
                      </MenuItem>
                    ) : fileTypesError ? (
                      <MenuItem disabled>
                        <Typography color="error">
                          Error loading file types
                        </Typography>
                      </MenuItem>
                    ) : processedFileTypes.length === 0 ? (
                      <MenuItem disabled>
                        <Typography color="text.secondary">
                          No file types available
                        </Typography>
                      </MenuItem>
                    ) : (
                      processedFileTypes.map((type) => (
                        <MenuItem key={type.id} value={type.id?.toString()}>
                          {getFileTypeLabel(type)}
                        </MenuItem>
                      ))
                    )}
                  </Select>
                  {errors[`${String(line.id)}_file_type_id`] && (
                    <FormHelperText>File type is required</FormHelperText>
                  )}
                </FormControl>
              </Grid>

              <Grid item xs={6}>
                <FormControl
                  fullWidth
                  error={!!errors[`${String(line.id)}_file_cabinet_id`]}
                  disabled={isLoading || isLoadingFileCabinets}
                  className="file-cabinet-select">
                  <InputLabel>
                    File Cabinet <span style={{ color: "red" }}>*</span>
                  </InputLabel>
                  <Select
                    name="file_cabinet_id"
                    value={line.file_cabinet_id || ""}
                    label="File Cabinet *"
                    onChange={(e) =>
                      handleChange(
                        String(line.id),
                        "file_cabinet_id",
                        e.target.value
                      )
                    }>
                    {isLoadingFileCabinets ? (
                      <MenuItem disabled>
                        <Box className="loading-item">
                          <CircularProgress size={20} />
                          <span>Loading file cabinets...</span>
                        </Box>
                      </MenuItem>
                    ) : fileCabinetsError ? (
                      <MenuItem disabled>
                        <Typography color="error">
                          Error loading file cabinets
                        </Typography>
                      </MenuItem>
                    ) : processedFileCabinets.length === 0 ? (
                      <MenuItem disabled>
                        <Typography color="text.secondary">
                          No file cabinets available
                        </Typography>
                      </MenuItem>
                    ) : (
                      processedFileCabinets.map((cabinet) => (
                        <MenuItem
                          key={cabinet.id}
                          value={cabinet.id?.toString()}>
                          {getFileCabinetLabel(cabinet)}
                        </MenuItem>
                      ))
                    )}
                  </Select>
                  {errors[`${String(line.id)}_file_cabinet_id`] && (
                    <FormHelperText>File cabinet is required</FormHelperText>
                  )}
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  label="File Description"
                  name="file_description"
                  variant="outlined"
                  fullWidth
                  value={line.file_description}
                  onChange={(e) =>
                    handleChange(
                      String(line.id),
                      "file_description",
                      e.target.value
                    )
                  }
                  disabled={isLoading}
                  error={!!errors[`${String(line.id)}_file_description`]}
                  helperText={
                    errors[`${String(line.id)}_file_description`]
                      ? Array.isArray(
                          errors[`${String(line.id)}_file_description`]
                        )
                        ? errors[`${String(line.id)}_file_description`][0]
                        : errors[`${String(line.id)}_file_description`]
                      : ""
                  }
                  className="file-description-field"
                  placeholder="Enter file description"
                />
              </Grid>

              <Grid item xs={line.existing_file_name ? 6 : 12}>
                <Box className="file-upload-container">
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <input
                      accept="*/*"
                      style={{ display: "none" }}
                      id={`file-upload-input-${line.id}`}
                      type="file"
                      onChange={(e) => handleFileChange(line.id, e)}
                    />
                    <label
                      htmlFor={`file-upload-input-${line.id}`}
                      style={{ flex: 1 }}>
                      <Button
                        variant="outlined"
                        component="span"
                        fullWidth
                        disabled={isLoading}
                        className="file-upload-button">
                        {line.file_attachment
                          ? line.file_attachment.name
                          : line.existing_file_name
                          ? "Replace file (optional)"
                          : "Choose new file (optional)"}
                      </Button>
                    </label>
                    {line.file_attachment && (
                      <IconButton
                        size="small"
                        onClick={() => handleRemoveFile(line.id)}
                        disabled={isLoading}
                        color="error"
                        sx={{
                          minWidth: "auto",
                          padding: "4px",
                          "&:hover": {
                            backgroundColor: "rgba(211, 47, 47, 0.08)",
                          },
                        }}
                        title="Remove file">
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    )}
                  </Box>
                  {errors[`${String(line.id)}_file_attachment`] && (
                    <Typography
                      color="error"
                      variant="caption"
                      className="file-upload-error">
                      {Array.isArray(
                        errors[`${String(line.id)}_file_attachment`]
                      )
                        ? errors[`${String(line.id)}_file_attachment`][0]
                        : errors[`${String(line.id)}_file_attachment`]}
                    </Typography>
                  )}
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    className="file-upload-caption">
                    {line.existing_file_name
                      ? "Leave empty to keep current file. Max size: 10MB"
                      : "Max size: 10MB"}
                  </Typography>
                </Box>
              </Grid>

              {line.existing_file_name && (
                <Grid item xs={6}>
                  <Box className="current-file-display">
                    <Typography
                      variant="subtitle2"
                      color="text.secondary"
                      gutterBottom>
                      Current File:
                    </Typography>
                    <Typography variant="body2">
                      {getFileName(line.existing_file_name)}
                    </Typography>
                  </Box>
                </Grid>
              )}

              <Grid item xs={12}>
                <Box className="file-line-actions">
                  {fileLines.length > 1 && (
                    <IconButton
                      onClick={() => removeFileLine(line.id)}
                      disabled={isLoading}
                      color="error"
                      size="small"
                      title="Remove this file line">
                      <DeleteIcon />
                    </IconButton>
                  )}
                  {index === fileLines.length - 1 && (
                    <IconButton
                      onClick={addFileLine}
                      disabled={isLoading}
                      color="primary"
                      size="small"
                      title="Add another file line">
                      <AddIcon />
                    </IconButton>
                  )}
                </Box>
              </Grid>
            </Grid>
          </Box>
        ))}
      </Box>
    );
  }
);

FileForm.displayName = "FileForm";

export default FileForm;
