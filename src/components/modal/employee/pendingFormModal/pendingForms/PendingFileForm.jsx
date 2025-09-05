import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from "react";
import { useFormContext, useFieldArray } from "react-hook-form";
import {
  Box,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  Typography,
  IconButton,
} from "@mui/material";
import {
  Close as CloseIcon,
  AttachFile as AttachFileIcon,
} from "@mui/icons-material";
import { useSnackbar } from "notistack";
import { useLazyGetAllCabinetsQuery } from "../../../../../features/api/extras/cabinets";
import { useLazyGetAllFileTypesQuery } from "../../../../../features/api/extras/filetypesApi";
import { useGetFileEmpAttachmentQuery } from "../../../../../features/api/employee/filesempApi";
import PendingFileFormTable from "./PendingFileFormTable";

let idCounter = 0;
const generateUniqueId = (prefix = "pending_file") => {
  idCounter++;
  return `${prefix}_${Date.now()}_${idCounter}_${Math.random()
    .toString(36)
    .substr(2, 9)}`;
};

const PendingFileForm = ({
  onSubmit,
  selectedFiles = { files },
  showArchived,
  isLoading = false,
  employeeId,
  onValidationChange,
  pendingData,
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
  const [fileViewerOpen, setFileViewerOpen] = useState(false);
  const [fileUrl, setFileUrl] = useState(null);
  const [currentFileId, setCurrentFileId] = useState(null);
  const [currentFileName, setCurrentFileName] = useState("");

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

  const {
    data: attachmentData,
    isLoading: isLoadingAttachment,
    error: attachmentError,
  } = useGetFileEmpAttachmentQuery(currentFileId, {
    skip: !fileViewerOpen || !currentFileId || currentFileId === "undefined",
  });

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
          console.error("Error loading dropdown data:", error);
        }
      }
    };

    loadInitialData();
  }, [mode, isViewMode, triggerFileTypes, triggerFileCabinets]);

  useEffect(() => {
    if (attachmentData) {
      const url = URL.createObjectURL(attachmentData);
      setFileUrl(url);

      return () => URL.revokeObjectURL(url);
    }
  }, [attachmentData]);

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
      console.error("Error loading dropdown data:", error);
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

  const handleFileDownload = useCallback(
    (fileUrl, fileName) => {
      if (!fileUrl) {
        enqueueSnackbar("File URL not available", { variant: "error" });
        return;
      }

      try {
        const link = document.createElement("a");
        link.href = fileUrl;
        link.download = fileName || "download";
        link.target = "_blank";

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (error) {
        enqueueSnackbar("Error downloading file", { variant: "error" });
        window.open(fileUrl, "_blank");
      }
    },
    [enqueueSnackbar]
  );

  const handleFileViewerOpen = useCallback(
    (fileId, fileName) => {
      if (
        fileId &&
        fileId !== "undefined" &&
        fileId !== "null" &&
        fileId !== undefined &&
        fileId !== null
      ) {
        setCurrentFileId(String(fileId));
        setCurrentFileName(fileName || "attachment");
        setFileViewerOpen(true);
      } else {
        console.error(
          "Invalid fileId provided to handleFileViewerOpen:",
          fileId
        );
        enqueueSnackbar("Invalid file ID", { variant: "error" });
      }
    },
    [enqueueSnackbar]
  );

  const handleFileViewerClose = useCallback(() => {
    setFileViewerOpen(false);
    setCurrentFileId(null);
    setCurrentFileName("");
  }, []);

  const handleDownloadFromViewer = useCallback(() => {
    if (attachmentData) {
      handleFileDownload(attachmentData, currentFileName);
    }
  }, [attachmentData, currentFileName, handleFileDownload]);

  const initializeEmptyForm = useCallback(() => {
    const currentFiles = getValues("files");
    if (currentFiles && currentFiles.length > 0 && hasInitializedData.current) {
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
      is_new_file: true,
    };
    replace([emptyLine]);
    clearErrors("files");
    setErrorMessage(null);
    hasInitializedData.current = true;
  }, [replace, clearErrors, getValues]);

  const initializeWithPendingData = useCallback(
    (pendingData) => {
      if (hasInitializedData.current) return;

      if (
        pendingData?.files &&
        Array.isArray(pendingData.files) &&
        pendingData.files.length > 0
      ) {
        const newFileLines = pendingData.files.map((file, index) => {
          return {
            id: generateUniqueId(`pending_file_${index}`),
            index: index,
            file_type_id: file.file_type || null,
            file_cabinet_id: file.file_cabinet || null,
            file_description: file.file_description || "",
            file_attachment: null,
            file_name: file.file_name || file.existing_file_name || "",
            existing_file_name: file.file_name || file.existing_file_name || "",
            existing_file_url:
              file.file_attachment ||
              file.existing_file_url ||
              file.file_url ||
              "",
            file_url:
              file.file_attachment ||
              file.existing_file_url ||
              file.file_url ||
              "",
            is_new_file: file.is_new_file || false,
            original_file_id: file.id || file.original_file_id || null,
          };
        });

        replace(newFileLines);
      } else {
        initializeEmptyForm();
      }
      clearErrors("files");
      setErrorMessage(null);
      hasInitializedData.current = true;
    },
    [replace, clearErrors, initializeEmptyForm]
  );

  const initializeWithSelectedFiles = useCallback(
    (selectedFiles) => {
      if (hasInitializedData.current) return;

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

          let finalFileType = null;
          let finalFileCabinet = null;

          if (file.file_type && file.file_type.id) {
            finalFileType = file.file_type;
          } else if (fileTypeObj) {
            finalFileType = fileTypeObj;
          }

          if (file.file_cabinet && file.file_cabinet.id) {
            finalFileCabinet = file.file_cabinet;
          } else if (fileCabinetObj) {
            finalFileCabinet = fileCabinetObj;
          }

          return {
            id: generateUniqueId(`selected_file_${index}`),
            index: index,
            file_type_id: finalFileType,
            file_cabinet_id: finalFileCabinet,
            file_description: file.file_description || file.description || "",
            file_attachment: null,
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
      hasInitializedData.current = true;
    },
    [
      replace,
      clearErrors,
      initializeEmptyForm,
      processedFileTypes,
      processedFileCabinets,
    ]
  );

  useEffect(() => {
    hasInitializedData.current = false;
  }, [mode, employeeId]);

  useEffect(() => {
    if (hasInitializedData.current) return;

    if (mode === "create") {
      initializeEmptyForm();
      return;
    }

    if (mode === "edit" || mode === "view" || isViewMode) {
      const hasDropdownData =
        processedFileTypes.length > 0 && processedFileCabinets.length > 0;

      if (hasDropdownData) {
        if (pendingData && pendingData.files) {
          initializeWithPendingData(pendingData);
        } else if (selectedFiles && selectedFiles.length > 0) {
          initializeWithSelectedFiles(selectedFiles);
        } else {
          initializeEmptyForm();
        }
      }
    }
  }, [
    mode,
    isViewMode,
    pendingData,
    selectedFiles,
    processedFileTypes.length,
    processedFileCabinets.length,
    initializeWithPendingData,
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

        setValue(`files.${index}.file_attachment`, file, {
          shouldValidate: true,
          shouldDirty: true,
        });

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

      const fileInput = document.getElementById(
        `pending-file-upload-input-${index}`
      );
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
      id: generateUniqueId(`new_pending_file_${newIndex}`),
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

  const FileViewerDialog = () => (
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
          Attachment - {currentFileName}
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
            <Typography variant="body1" sx={{ mt: 2, color: "text.secondary" }}>
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
                  {currentFileName}
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

  if (
    (mode === "edit" || mode === "view" || isViewMode) &&
    !hasInitializedData.current &&
    (processedFileTypes.length === 0 || processedFileCabinets.length === 0)
  ) {
    return (
      <Box
        className="pending-file-form-container"
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box className="pending-file-form-container">
      {hasErrors && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Error loading dropdown data. Please try again.
        </Alert>
      )}

      {errorMessage && (
        <Alert severity="error" className="pending-file-form-alert">
          {errorMessage}
        </Alert>
      )}

      <PendingFileFormTable
        fields={fields}
        watchedFiles={watchedFiles}
        isReadOnly={isReadOnly}
        isFieldDisabled={isFieldDisabled}
        processedFileTypes={processedFileTypes}
        processedFileCabinets={processedFileCabinets}
        isLoadingFileTypes={isLoadingFileTypes}
        isLoadingFileCabinets={isLoadingFileCabinets}
        errors={errors}
        getFileTypeLabel={getFileTypeLabel}
        getFileCabinetLabel={getFileCabinetLabel}
        getFileName={getFileName}
        handleDropdownFocus={handleDropdownFocus}
        handleFileChange={handleFileChange}
        handleRemoveFile={handleRemoveFile}
        handleFileDownload={handleFileDownload}
        handleFileViewerOpen={handleFileViewerOpen}
        addFileLine={addFileLine}
        removeFileLine={removeFileLine}
      />

      <FileViewerDialog />
    </Box>
  );
};

PendingFileForm.displayName = "PendingFileForm";

export default PendingFileForm;
