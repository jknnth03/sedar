import React, { useState, useCallback } from "react";
import { Controller, useFormContext } from "react-hook-form";
import {
  Box,
  TextField,
  FormControl,
  Grid,
  Button,
  Typography,
  IconButton,
  Autocomplete,
  FormHelperText,
  Dialog,
  DialogTitle,
  DialogContent,
  CircularProgress,
} from "@mui/material";
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Download as DownloadIcon,
  Visibility as VisibilityIcon,
  AttachFile,
  Close,
} from "@mui/icons-material";

import { useGetFileEmpAttachmentQuery } from "../../../../../features/api/employee/filesempApi";

const PendingFileFormTable = ({
  fileTypes,
  fileCabinets,
  fileTypesLoading,
  fileCabinetsLoading,
  isLoading,
  isReadOnly,
  watchedValues,
  handleDropdownFocus,
  getOptionLabel,
}) => {
  const {
    control,
    formState: { errors },
    setValue,
    watch,
  } = useFormContext();

  const [fileViewerOpen, setFileViewerOpen] = useState(false);
  const [currentAttachmentId, setCurrentAttachmentId] = useState(null);
  const [currentFileName, setCurrentFileName] = useState("");
  const [fileUrl, setFileUrl] = useState(null);

  const filesWatch = watch("files") || [];

  const {
    data: attachmentData,
    isLoading: isLoadingAttachment,
    error: attachmentError,
  } = useGetFileEmpAttachmentQuery(currentAttachmentId, {
    skip:
      !fileViewerOpen ||
      !currentAttachmentId ||
      currentAttachmentId === "undefined",
  });

  React.useEffect(() => {
    if (attachmentData) {
      const url = URL.createObjectURL(attachmentData);
      setFileUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [attachmentData]);

  const getEnhancedOptionLabel = (item, type) => {
    if (!item) return "";
    if (getOptionLabel && typeof getOptionLabel === "function") {
      return getOptionLabel(item, type);
    }
    if (item.name) return item.name;
    if (item.label) return item.label;
    if (item.id) return `${type} ${item.id}`;
    return "";
  };

  const addFileLine = () => {
    if (isReadOnly) return;

    const currentFiles = watch("files") || [];
    const newIndex = currentFiles.length;
    const newFile = {
      id: `pending_file_${Date.now()}_${newIndex}_${Math.random()
        .toString(36)
        .substr(2, 9)}`,
      original_file_id: null,
      employee_id: "",
      file_description: "",
      file_attachment: null,
      file_name: "",
      existing_file_name: null,
      existing_file_url: null,
      file_url: null,
      file_type: null,
      file_type_id: null,
      file_cabinet: null,
      file_cabinet_id: null,
      is_new_file: true,
      index: newIndex,
    };

    setValue("files", [...currentFiles, newFile]);
  };

  const removeFileLine = (index) => {
    if (isReadOnly) return;

    const currentFiles = watch("files") || [];
    const updatedFiles = currentFiles.filter((_, i) => i !== index);
    setValue(
      "files",
      updatedFiles.map((file, i) => ({ ...file, index: i }))
    );
  };

  const handleFileChange = (index, event) => {
    if (isReadOnly) return;

    const file = event.target.files[0];
    if (!file) return;

    const currentFiles = watch("files") || [];
    const updatedFiles = [...currentFiles];

    if (updatedFiles[index]) {
      updatedFiles[index] = {
        ...updatedFiles[index],
        file_attachment: file,
        file_name: file.name,
        existing_file_name: null,
        existing_file_url: null,
        file_url: null,
        is_new_file: true,
      };
      setValue("files", updatedFiles);
    }
  };

  const handleRemoveFile = (index) => {
    if (isReadOnly) return;

    const currentFiles = watch("files") || [];
    const updatedFiles = [...currentFiles];

    if (updatedFiles[index]) {
      updatedFiles[index] = {
        ...updatedFiles[index],
        file_attachment: null,
        file_name: "",
        existing_file_name: null,
        existing_file_url: null,
        file_url: null,
        is_new_file: true,
      };
      setValue("files", updatedFiles);
    }
  };

  const getFileAttachmentData = (fileData) => {
    const attachmentUrl = fileData?.existing_file_url || fileData?.file_url;
    const attachmentFilename =
      fileData?.existing_file_name || fileData?.file_name || "attachment.pdf";

    let attachmentId = null;

    if (
      fileData?.original_file_id &&
      typeof fileData.original_file_id === "number"
    ) {
      attachmentId = fileData.original_file_id;
    } else if (attachmentUrl) {
      const urlMatch = attachmentUrl.match(/\/files\/(\d+)\/attachment/);
      if (urlMatch && urlMatch[1]) {
        attachmentId = parseInt(urlMatch[1], 10);
      }
    }

    return {
      url: attachmentUrl,
      filename: attachmentFilename,
      id: attachmentId,
      isNewFile: fileData?.file_attachment instanceof File,
    };
  };

  const handleFileViewerOpen = useCallback((fileId, fileName) => {
    if (fileId && fileId !== "undefined" && fileId !== "null") {
      setCurrentAttachmentId(fileId);
      setCurrentFileName(fileName);
      setFileViewerOpen(true);
    } else {
      console.error("No valid file ID found");
    }
  }, []);

  const handleFileViewerClick = useCallback(
    (index) => {
      const currentFiles = watch("files") || [];
      const fileData = currentFiles[index];

      if (!fileData) return;

      const attachmentData = getFileAttachmentData(fileData);

      if (attachmentData.isNewFile && fileData.file_attachment) {
        const fileUrl = URL.createObjectURL(fileData.file_attachment);
        window.open(fileUrl, "_blank");
        setTimeout(() => URL.revokeObjectURL(fileUrl), 100);
        return;
      }

      if (
        attachmentData.id &&
        !isNaN(attachmentData.id) &&
        attachmentData.id > 0
      ) {
        handleFileViewerOpen(attachmentData.id, attachmentData.filename);
      } else {
        console.error("Invalid attachment ID:", attachmentData.id);
        alert("No valid attachment ID found.");
      }
    },
    [watch, handleFileViewerOpen]
  );

  const handleFileViewerClose = useCallback(() => {
    setFileViewerOpen(false);
    setCurrentAttachmentId(null);
    setCurrentFileName("");
    setFileUrl(null);
  }, []);

  const handleFileDownload = useCallback((url, filename) => {
    if (url && filename) {
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      alert("No attachment available to download");
    }
  }, []);

  const getFileName = (filename) => {
    if (!filename) return "attachment.pdf";
    return filename.split("/").pop() || filename;
  };

  const getDisplayFilename = (fileData) => {
    if (!fileData) return "No file attached";

    if (fileData.file_attachment instanceof File) {
      return fileData.file_attachment.name;
    }

    if (fileData.existing_file_name) {
      return getFileName(fileData.existing_file_name);
    }

    if (fileData.file_name) {
      return getFileName(fileData.file_name);
    }

    return "No file attached";
  };

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
          File Attachment - {currentFileName}
        </Typography>
        <Box sx={{ display: "flex", gap: 1 }}>
          {fileUrl && (
            <IconButton
              onClick={() => handleFileDownload(fileUrl, currentFileName)}
              size="small"
              sx={{
                color: "text.secondary",
                "&:hover": {
                  backgroundColor: "rgba(0, 0, 0, 0.04)",
                },
              }}
              title="Download file">
              <DownloadIcon />
            </IconButton>
          )}
          <IconButton
            onClick={handleFileViewerClose}
            size="small"
            sx={{
              color: "text.secondary",
              "&:hover": {
                backgroundColor: "rgba(0, 0, 0, 0.04)",
              },
            }}>
            <Close />
          </IconButton>
        </Box>
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
            {fileUrl ? (
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
                <AttachFile
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

  return (
    <>
      <Box className="file-form-container">
        {filesWatch.map((field, index) => (
          <Box
            key={field.id || index}
            className="file-line-container"
            sx={{ mb: 3, paddingTop: 2 }}>
            <Grid container spacing={1} className="general-form__grid">
              <Grid
                item
                xs={12}
                sm={6}
                sx={{ minWidth: "544px", maxWidth: "544px" }}>
                <Controller
                  name={`files.${index}.file_type_id`}
                  control={control}
                  render={({ field: controllerField, fieldState }) => (
                    <FormControl
                      fullWidth
                      error={!!fieldState.error}
                      disabled={isLoading || fileTypesLoading}>
                      <Autocomplete
                        {...controllerField}
                        onChange={(event, item) => {
                          if (!isReadOnly) {
                            controllerField.onChange(item);
                            const currentFiles = watch("files") || [];
                            const updatedFiles = [...currentFiles];
                            if (updatedFiles[index]) {
                              updatedFiles[index].file_type = item;
                              updatedFiles[index].file_type_id = item;
                            }
                            setValue("files", updatedFiles);
                            console.log(`File ${index} type updated:`, item);
                          }
                        }}
                        value={controllerField.value || null}
                        options={fileTypes ?? []}
                        loading={fileTypesLoading}
                        disabled={isLoading}
                        readOnly={isReadOnly}
                        getOptionLabel={(item) =>
                          getEnhancedOptionLabel(item, "file_type")
                        }
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
                                File Type{" "}
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

              <Grid item xs={12} md={6}>
                <Grid
                  item
                  xs={12}
                  sm={6}
                  sx={{ minWidth: "544px", maxWidth: "544px" }}></Grid>
                <Controller
                  name={`files.${index}.file_cabinet_id`}
                  control={control}
                  render={({ field: controllerField, fieldState }) => (
                    <FormControl
                      fullWidth
                      error={!!fieldState.error}
                      disabled={isLoading || fileCabinetsLoading}>
                      <Autocomplete
                        {...controllerField}
                        onChange={(event, item) => {
                          if (!isReadOnly) {
                            controllerField.onChange(item);
                            const currentFiles = watch("files") || [];
                            const updatedFiles = [...currentFiles];
                            if (updatedFiles[index]) {
                              updatedFiles[index].file_cabinet = item;
                              updatedFiles[index].file_cabinet_id = item;
                            }
                            setValue("files", updatedFiles);
                            console.log(`File ${index} cabinet updated:`, item);
                          }
                        }}
                        value={controllerField.value || null}
                        options={fileCabinets ?? []}
                        loading={fileCabinetsLoading}
                        disabled={isLoading}
                        readOnly={isReadOnly}
                        getOptionLabel={(item) =>
                          getEnhancedOptionLabel(item, "file_cabinet")
                        }
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

              <Grid item xs={12} md={6}>
                <Grid
                  item
                  xs={12}
                  sm={6}
                  sx={{ minWidth: "1097px", maxWidth: "1097px" }}></Grid>
                <Controller
                  name={`files.${index}.file_description`}
                  control={control}
                  render={({ field: controllerField, fieldState }) => (
                    <TextField
                      {...controllerField}
                      label="File Description"
                      variant="outlined"
                      fullWidth
                      disabled={isLoading}
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
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} md={12}>
                <Grid
                  item
                  xs={12}
                  sm={6}
                  sx={{ minWidth: "1097px", maxWidth: "1097px" }}></Grid>
                <Box className="file-upload-container">
                  {isReadOnly ? (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <TextField
                        label="File"
                        variant="outlined"
                        fullWidth
                        value={getDisplayFilename(filesWatch[index])}
                        disabled={true}
                        InputProps={{
                          readOnly: true,
                          endAdornment: getDisplayFilename(
                            filesWatch[index]
                          ) !== "No file attached" && (
                            <Box sx={{ display: "flex", gap: 0.5 }}>
                              <IconButton
                                size="small"
                                onClick={() => handleFileViewerClick(index)}
                                sx={{ mr: 0.5 }}
                                title="View file">
                                <VisibilityIcon fontSize="small" />
                              </IconButton>
                              <IconButton
                                size="small"
                                onClick={() => {
                                  const fileData = filesWatch[index];
                                  const attachmentData =
                                    getFileAttachmentData(fileData);
                                  handleFileDownload(
                                    attachmentData.url,
                                    attachmentData.filename
                                  );
                                }}
                                sx={{ mr: 1 }}
                                title="Download file">
                                <DownloadIcon fontSize="small" />
                              </IconButton>
                            </Box>
                          ),
                        }}
                        sx={{
                          height: "56px",
                          "& .MuiInputBase-input": {
                            height: "56px",
                            padding: "0 14px",
                            display: "flex",
                            alignItems: "center",
                            cursor:
                              getDisplayFilename(filesWatch[index]) !==
                              "No file attached"
                                ? "pointer"
                                : "default",
                            color:
                              getDisplayFilename(filesWatch[index]) !==
                              "No file attached"
                                ? "primary.main"
                                : "inherit",
                          },
                        }}
                        onClick={() => {
                          if (
                            getDisplayFilename(filesWatch[index]) !==
                            "No file attached"
                          ) {
                            handleFileViewerClick(index);
                          }
                        }}
                      />
                    </Box>
                  ) : (
                    <Box sx={{ display: "flex", alignItems: "center" }}>
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
                          disabled={isLoading}
                          className="file-upload-button"
                          sx={{ height: "56px" }}>
                          {filesWatch[index]?.file_attachment instanceof File
                            ? filesWatch[index].file_attachment.name
                            : filesWatch[index]?.existing_file_name
                            ? `${getFileName(
                                filesWatch[index].existing_file_name
                              )} - Replace file (optional)`
                            : "Choose file (optional)"}
                        </Button>
                      </label>

                      {filesWatch[index]?.existing_file_name && !isReadOnly && (
                        <Box sx={{ display: "flex", gap: 0.5, ml: 1 }}>
                          <IconButton
                            size="small"
                            onClick={() => handleFileViewerClick(index)}
                            disabled={isLoading}
                            color="primary"
                            sx={{
                              minWidth: "auto",
                              padding: "8px",
                              "&:hover": {
                                backgroundColor: "rgba(25, 118, 210, 0.08)",
                              },
                            }}
                            title="View file">
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => {
                              const fileData = filesWatch[index];
                              const attachmentData =
                                getFileAttachmentData(fileData);
                              handleFileDownload(
                                attachmentData.url,
                                attachmentData.filename
                              );
                            }}
                            disabled={isLoading}
                            color="info"
                            sx={{
                              minWidth: "auto",
                              padding: "8px",
                              "&:hover": {
                                backgroundColor: "rgba(2, 136, 209, 0.08)",
                              },
                            }}
                            title="Download file">
                            <DownloadIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      )}

                      {filesWatch[index]?.file_attachment && !isReadOnly && (
                        <IconButton
                          size="small"
                          onClick={() => handleRemoveFile(index)}
                          disabled={isLoading}
                          color="error"
                          sx={{
                            minWidth: "auto",
                            padding: "8px",
                            ml: filesWatch[index]?.existing_file_name ? 0 : 1,
                            "&:hover": {
                              backgroundColor: "rgba(211, 47, 47, 0.08)",
                            },
                          }}
                          title="Remove file">
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      )}
                    </Box>
                  )}

                  {errors.files?.[index]?.file_attachment && (
                    <Typography
                      color="error"
                      variant="caption"
                      className="file-upload-error">
                      {errors.files[index].file_attachment.message}
                    </Typography>
                  )}

                  {!isReadOnly && (
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      className="file-upload-caption">
                      {filesWatch[index]?.existing_file_name
                        ? "Leave empty to keep current file. Max size: 10MB"
                        : "Max size: 10MB"}
                    </Typography>
                  )}
                </Box>
              </Grid>

              {!isReadOnly && (
                <Grid item xs={12}>
                  <Box
                    className="file-line-actions"
                    sx={{ display: "flex", gap: 1, mt: 1 }}>
                    {filesWatch.length > 1 && (
                      <Button
                        onClick={() => removeFileLine(index)}
                        disabled={isLoading}
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
                    {index === filesWatch.length - 1 && (
                      <Button
                        onClick={addFileLine}
                        disabled={isLoading}
                        variant="contained"
                        size="small"
                        startIcon={<AddIcon />}
                        sx={{
                          width: "1097px",
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

      <FileViewerDialog />
    </>
  );
};

export default PendingFileFormTable;
