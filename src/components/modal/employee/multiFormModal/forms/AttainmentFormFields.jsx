import React, { useState, useCallback, useRef, useEffect } from "react";
import { Controller, useFormContext } from "react-hook-form";
import {
  TextField,
  Grid,
  Box,
  FormControl,
  FormHelperText,
  Button,
  Autocomplete,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  CircularProgress,
  IconButton,
} from "@mui/material";
import { Close, AttachFile, Visibility } from "@mui/icons-material";
import { useSnackbar } from "notistack";

import { useGetAttainmentAttachmentQuery } from "../../../../../features/api/employee/attainmentsEmpApi";

const AttainmentFormFields = ({
  programs,
  degrees,
  honors,
  attainments,
  programsLoading,
  degreesLoading,
  honorsLoading,
  attainmentsLoading,
  isLoading,
  isReadOnly,
  watchedValues,
  handleDropdownFocus,
  handleFileChange,
  getOptionLabel,
  selectedAttainment,
}) => {
  const {
    control,
    formState: { errors },
    setValue,
    setError,
    clearErrors,
  } = useFormContext();

  const { enqueueSnackbar } = useSnackbar();

  const [fileViewerOpen, setFileViewerOpen] = useState(false);
  const [currentAttachmentId, setCurrentAttachmentId] = useState(null);
  const [currentFileName, setCurrentFileName] = useState("");
  const [fileUrl, setFileUrl] = useState(null);
  const [isNewFile, setIsNewFile] = useState(false);
  const [isPreparingFile, setIsPreparingFile] = useState(false);
  const fileUrlRef = useRef(null);

  const { data: attachmentData, isLoading: isLoadingAttachment } =
    useGetAttainmentAttachmentQuery(currentAttachmentId, {
      skip: !currentAttachmentId || isNewFile || !fileViewerOpen,
    });

  useEffect(() => {
    if (attachmentData && !isNewFile && currentAttachmentId && fileViewerOpen) {
      if (fileUrlRef.current) {
        URL.revokeObjectURL(fileUrlRef.current);
      }

      const url = URL.createObjectURL(attachmentData);
      fileUrlRef.current = url;
      setFileUrl(url);
      setIsPreparingFile(false);
    }
  }, [attachmentData, isNewFile, currentAttachmentId, fileViewerOpen]);

  useEffect(() => {
    return () => {
      if (fileUrlRef.current) {
        URL.revokeObjectURL(fileUrlRef.current);
        fileUrlRef.current = null;
      }
    };
  }, []);

  const getAttachmentData = () => {
    const attachmentUrl =
      watchedValues?.attachment_url ||
      watchedValues?.existing_attachment_url ||
      watchedValues?.attainment_attachment;
    const attachmentFilename =
      watchedValues?.attachment_filename ||
      watchedValues?.existing_attachment_filename ||
      watchedValues?.attainment_attachment?.name ||
      "attachment.pdf";

    let attachmentId = null;

    if (selectedAttainment?.id && typeof selectedAttainment.id === "number") {
      attachmentId = selectedAttainment.id;
    } else if (watchedValues?.id && typeof watchedValues.id === "number") {
      attachmentId = watchedValues.id;
    } else if (attachmentUrl && typeof attachmentUrl === "string") {
      const urlMatch = attachmentUrl.match(/\/attainments\/(\d+)\/attachment/);
      if (urlMatch && urlMatch[1]) {
        attachmentId = parseInt(urlMatch[1], 10);
      }
    }

    return {
      url: attachmentUrl,
      filename: attachmentFilename,
      id: attachmentId,
      isNewFile: watchedValues?.attainment_attachment instanceof File,
    };
  };

  const validateFile = (file) => {
    const allowedTypes = ["application/pdf"];
    const maxSize = 10 * 1024 * 1024;

    if (!allowedTypes.includes(file.type)) {
      return {
        isValid: false,
        message: "Only PDF files are allowed",
      };
    }

    if (file.size > maxSize) {
      return {
        isValid: false,
        message: "File size must be less than 10MB",
      };
    }

    return { isValid: true };
  };

  const handleInternalFileChange = useCallback(
    (event) => {
      const file = event.target.files?.[0];
      if (file) {
        const validation = validateFile(file);

        if (!validation.isValid) {
          setError("attainment_attachment", {
            message: validation.message,
          });
          enqueueSnackbar(validation.message, { variant: "error" });
          event.target.value = "";
          return;
        }

        setValue("attainment_attachment", file);
        setValue("attachment_filename", file.name);
        setValue("existing_attachment_filename", null);
        setValue("attachment_url", null);
        setValue("existing_attachment_url", null);
        clearErrors("attainment_attachment");

        if (handleFileChange) {
          handleFileChange(event);
        }
      }
      event.target.value = "";
    },
    [setValue, handleFileChange, setError, clearErrors, enqueueSnackbar]
  );

  const handleFileViewerOpen = useCallback(() => {
    const attachmentData = getAttachmentData();

    if (attachmentData.isNewFile) {
      setIsPreparingFile(true);
      if (fileUrlRef.current) {
        URL.revokeObjectURL(fileUrlRef.current);
      }
      const url = URL.createObjectURL(watchedValues.attainment_attachment);
      fileUrlRef.current = url;
      setFileUrl(url);
      setCurrentFileName(watchedValues.attainment_attachment.name);
      setIsNewFile(true);
      setFileViewerOpen(true);
      setTimeout(() => setIsPreparingFile(false), 100);
      return;
    }

    if (
      attachmentData.id &&
      !isNaN(attachmentData.id) &&
      attachmentData.id > 0
    ) {
      setIsPreparingFile(true);
      setIsNewFile(false);
      setFileUrl(null);
      setCurrentFileName(attachmentData.filename);
      setCurrentAttachmentId(attachmentData.id);
      setFileViewerOpen(true);
    }
  }, [watchedValues]);

  const handleFileViewerClose = useCallback(() => {
    setFileViewerOpen(false);

    if (fileUrlRef.current) {
      URL.revokeObjectURL(fileUrlRef.current);
      fileUrlRef.current = null;
    }

    setFileUrl(null);
    setCurrentAttachmentId(null);
    setCurrentFileName("");
    setIsNewFile(false);
    setIsPreparingFile(false);
  }, []);

  const currentYear = new Date().getFullYear();

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

  const getDisplayFilename = () => {
    if (
      watchedValues?.attachment_filename &&
      watchedValues.attachment_filename.toLowerCase() !==
        "no attachment attached"
    ) {
      return watchedValues.attachment_filename;
    }
    if (
      watchedValues?.existing_attachment_filename &&
      watchedValues.existing_attachment_filename.toLowerCase() !==
        "no attachment attached"
    ) {
      return watchedValues.existing_attachment_filename;
    }
    if (watchedValues?.attainment_attachment?.name) {
      return watchedValues.attainment_attachment.name;
    }
    if (watchedValues?.attainment_attachment instanceof File) {
      return watchedValues.attainment_attachment.name;
    }
    return "No attachment attached";
  };

  const hasExistingFile = () => {
    if (watchedValues?.attainment_attachment instanceof File) return true;

    if (
      selectedAttainment?.attachment_url ||
      selectedAttainment?.attachment_filename
    ) {
      const filename = selectedAttainment.attachment_filename;
      if (filename && typeof filename === "string" && filename.trim()) {
        const lowerFilename = filename.toLowerCase().trim();
        if (
          lowerFilename !== "no attachment attached" &&
          lowerFilename !== "no file attached" &&
          lowerFilename !== "no attachment" &&
          lowerFilename !== "no file"
        ) {
          return true;
        }
      }
    }

    const filename =
      watchedValues?.attachment_filename ||
      watchedValues?.existing_attachment_filename;

    if (filename && typeof filename === "string" && filename.trim()) {
      const lowerFilename = filename.toLowerCase().trim();
      if (
        lowerFilename === "no attachment attached" ||
        lowerFilename === "no file attached" ||
        lowerFilename === "no attachment" ||
        lowerFilename === "no file"
      ) {
        return false;
      }
      return true;
    }

    const attachmentUrl =
      watchedValues?.attachment_url || watchedValues?.existing_attachment_url;

    if (
      attachmentUrl &&
      typeof attachmentUrl === "string" &&
      attachmentUrl.trim()
    ) {
      const lowerUrl = attachmentUrl.toLowerCase().trim();
      if (
        lowerUrl === "no attachment attached" ||
        lowerUrl === "no file attached" ||
        lowerUrl === "no attachment" ||
        lowerUrl === "no file"
      ) {
        return false;
      }
      return true;
    }

    return false;
  };

  const getFileName = (filename) => {
    if (!filename) {
      if (
        watchedValues?.attachment_filename &&
        watchedValues.attachment_filename.toLowerCase() !==
          "no attachment attached"
      ) {
        return watchedValues.attachment_filename;
      }
      if (
        watchedValues?.existing_attachment_filename &&
        watchedValues.existing_attachment_filename.toLowerCase() !==
          "no attachment attached"
      ) {
        return watchedValues.existing_attachment_filename;
      }
      if (watchedValues?.attainment_attachment?.name) {
        return watchedValues.attainment_attachment.name;
      }
      if (watchedValues?.attainment_attachment instanceof File) {
        return watchedValues.attainment_attachment.name;
      }
      return "No attachment attached";
    }
    return filename.split("/").pop() || filename;
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
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent
        sx={{
          p: 0,
          position: "relative",
          height: "calc(90vh - 140px)",
          overflow: "hidden",
        }}>
        {isLoadingAttachment || isPreparingFile ? (
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
      <Grid container spacing={1} className="general-form__grid">
        <Grid item xs={12} sm={3} sx={{ minWidth: "362px", maxWidth: "362px" }}>
          <Controller
            name="program_id"
            control={control}
            render={({ field: { onChange, value } }) => (
              <FormControl
                fullWidth
                variant="outlined"
                disabled={isLoading || programsLoading || isReadOnly}
                error={!!errors.program_id}
                sx={{ width: "355px" }}>
                <Autocomplete
                  onChange={(event, item) => {
                    if (!isReadOnly) onChange(item);
                  }}
                  value={value || null}
                  options={programs ?? []}
                  loading={programsLoading}
                  disabled={isLoading || isReadOnly}
                  getOptionLabel={(item) =>
                    getEnhancedOptionLabel(item, "program")
                  }
                  isOptionEqualToValue={(option, value) => {
                    if (!option || !value) return false;
                    return option.id === value.id;
                  }}
                  onOpen={() => {
                    if (!isReadOnly) handleDropdownFocus("programs");
                  }}
                  readOnly={isReadOnly}
                  noOptionsText="No programs available"
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label={
                        <>
                          Program <span style={{ color: "red" }}>*</span>
                        </>
                      }
                      error={!!errors.program_id}
                      helperText={errors.program_id?.message}
                      sx={{ borderRadius: 2 }}
                      InputProps={{
                        ...params.InputProps,
                        readOnly: isReadOnly,
                      }}
                    />
                  )}
                />
              </FormControl>
            )}
          />
        </Grid>

        <Grid item xs={12} sm={3} sx={{ minWidth: "362px", maxWidth: "362px" }}>
          <Controller
            name="degree_id"
            control={control}
            render={({ field: { onChange, value } }) => (
              <FormControl
                fullWidth
                variant="outlined"
                disabled={isLoading || degreesLoading || isReadOnly}
                error={!!errors.degree_id}
                sx={{ width: "355px" }}>
                <Autocomplete
                  onChange={(event, item) => {
                    if (!isReadOnly) onChange(item);
                  }}
                  value={value || null}
                  options={degrees ?? []}
                  loading={degreesLoading}
                  disabled={isLoading || isReadOnly}
                  getOptionLabel={(item) =>
                    getEnhancedOptionLabel(item, "degree")
                  }
                  isOptionEqualToValue={(option, value) => {
                    if (!option || !value) return false;
                    return option.id === value.id;
                  }}
                  onOpen={() => {
                    if (!isReadOnly) handleDropdownFocus("degrees");
                  }}
                  readOnly={isReadOnly}
                  noOptionsText="No degrees available"
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label={
                        <>
                          Degree <span style={{ color: "red" }}>*</span>
                        </>
                      }
                      error={!!errors.degree_id}
                      helperText={errors.degree_id?.message}
                      sx={{ borderRadius: 2 }}
                      InputProps={{
                        ...params.InputProps,
                        readOnly: isReadOnly,
                      }}
                    />
                  )}
                />
              </FormControl>
            )}
          />
        </Grid>

        <Grid item xs={12} sm={3} sx={{ minWidth: "362px", maxWidth: "362px" }}>
          <Controller
            name="honor_title_id"
            control={control}
            render={({ field: { onChange, value } }) => (
              <FormControl
                fullWidth
                variant="outlined"
                disabled={isLoading || honorsLoading || isReadOnly}
                error={!!errors.honor_title_id}
                sx={{ width: "355px" }}>
                <Autocomplete
                  onChange={(event, item) => {
                    if (!isReadOnly) onChange(item);
                  }}
                  value={value || null}
                  options={honors ?? []}
                  loading={honorsLoading}
                  disabled={isLoading || isReadOnly}
                  getOptionLabel={(item) =>
                    getEnhancedOptionLabel(item, "honor")
                  }
                  isOptionEqualToValue={(option, value) => {
                    if (!option || !value) return false;
                    return option.id === value.id;
                  }}
                  onOpen={() => {
                    if (!isReadOnly) handleDropdownFocus("honors");
                  }}
                  readOnly={isReadOnly}
                  noOptionsText="No honors available"
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label={
                        <>
                          Honor Title <span style={{ color: "red" }}>*</span>
                        </>
                      }
                      error={!!errors.honor_title_id}
                      helperText={errors.honor_title_id?.message}
                      sx={{ borderRadius: 2 }}
                      InputProps={{
                        ...params.InputProps,
                        readOnly: isReadOnly,
                      }}
                    />
                  )}
                />
              </FormControl>
            )}
          />
        </Grid>

        <Grid item xs={12} sm={3} sx={{ minWidth: "362px", maxWidth: "362px" }}>
          <Controller
            name="attainment_id"
            control={control}
            render={({ field: { onChange, value } }) => (
              <FormControl
                fullWidth
                variant="outlined"
                disabled={isLoading || attainmentsLoading || isReadOnly}
                error={!!errors.attainment_id}
                sx={{ width: "355px" }}>
                <Autocomplete
                  onChange={(event, item) => {
                    if (!isReadOnly) onChange(item);
                  }}
                  value={value || null}
                  options={attainments ?? []}
                  loading={attainmentsLoading}
                  disabled={isLoading || isReadOnly}
                  getOptionLabel={(item) =>
                    getEnhancedOptionLabel(item, "attainment")
                  }
                  isOptionEqualToValue={(option, value) => {
                    if (!option || !value) return false;
                    return option.id === value.id;
                  }}
                  onOpen={() => {
                    if (!isReadOnly) handleDropdownFocus("attainments");
                  }}
                  readOnly={isReadOnly}
                  noOptionsText="No attainments available"
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label={
                        <>
                          Attainment <span style={{ color: "red" }}>*</span>
                        </>
                      }
                      error={!!errors.attainment_id}
                      helperText={errors.attainment_id?.message}
                      sx={{ borderRadius: 2 }}
                      InputProps={{
                        ...params.InputProps,
                        readOnly: isReadOnly,
                      }}
                    />
                  )}
                />
              </FormControl>
            )}
          />
        </Grid>

        <Grid item xs={12} sm={3} sx={{ minWidth: "362px", maxWidth: "362px" }}>
          <Controller
            name="academic_year_from"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Academic Year From (Optional)"
                type="number"
                variant="outlined"
                fullWidth
                disabled={isLoading || isReadOnly}
                error={!!errors.academic_year_from}
                helperText={errors.academic_year_from?.message}
                inputProps={{
                  min: 1900,
                  max: currentYear,
                  readOnly: isReadOnly,
                }}
                className="general-form__text-field"
              />
            )}
          />
        </Grid>

        <Grid item xs={12} sm={3} sx={{ minWidth: "362px", maxWidth: "362px" }}>
          <Controller
            name="academic_year_to"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Academic Year To (Optional)"
                type="number"
                variant="outlined"
                fullWidth
                disabled={isLoading || isReadOnly}
                error={!!errors.academic_year_to}
                helperText={errors.academic_year_to?.message}
                inputProps={{
                  min: watchedValues.academic_year_from || 1900,
                  max: new Date().getFullYear() + 10,
                  readOnly: isReadOnly,
                }}
                className="general-form__text-field"
              />
            )}
          />
        </Grid>

        <Grid item xs={12} sm={3} sx={{ minWidth: "362px", maxWidth: "362px" }}>
          <Controller
            name="gpa"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="GPA (Optional)"
                type="number"
                variant="outlined"
                fullWidth
                disabled={isLoading || isReadOnly}
                error={!!errors.gpa}
                helperText={errors.gpa?.message}
                inputProps={{
                  min: 0,
                  max: 5,
                  step: 0.01,
                  readOnly: isReadOnly,
                }}
                className="general-form__text-field"
              />
            )}
          />
        </Grid>

        <Grid item xs={12} sm={3} sx={{ minWidth: "732px", maxWidth: "732px" }}>
          <Controller
            name="institution"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Institution (Optional)"
                variant="outlined"
                fullWidth
                disabled={isLoading || isReadOnly}
                error={!!errors.institution}
                helperText={errors.institution?.message}
                className="general-form__text-field"
                InputProps={{
                  readOnly: isReadOnly,
                }}
              />
            )}
          />
        </Grid>

        <Grid
          item
          xs={12}
          sm={3}
          sx={{ minWidth: "1102px", maxWidth: "1102px" }}>
          <Controller
            name="attainment_remarks"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Attainment Remarks (Optional)"
                variant="outlined"
                fullWidth
                disabled={isLoading || isReadOnly}
                placeholder="Optional: Additional notes about this attainment"
                InputProps={{
                  readOnly: isReadOnly,
                }}
              />
            )}
          />
        </Grid>

        <Grid
          item
          xs={12}
          sm={3}
          sx={{ minWidth: "1102px", maxWidth: "1102px" }}>
          <Box sx={{ display: "flex", flexDirection: "column" }}>
            {!isReadOnly ? (
              <>
                {hasExistingFile() ? (
                  <Box
                    sx={{
                      border: "2px solid",
                      borderColor: errors.attainment_attachment
                        ? "error.main"
                        : "#1976d2",
                      borderRadius: 1,
                      p: 2,
                      backgroundColor: "#f0f7ff",
                      width: "1094px",
                      minHeight: "60px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}>
                    <Typography
                      variant="body1"
                      sx={{
                        color: "#1976d2",
                        fontWeight: 600,
                        textAlign: "left",
                        wordBreak: "break-word",
                        fontSize: "0.95rem",
                        flex: 1,
                      }}>
                      {getFileName(getDisplayFilename())}
                    </Typography>

                    <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                      <IconButton
                        onClick={handleFileViewerOpen}
                        disabled={isLoading}
                        sx={{
                          color: "#1976d2",
                          "&:hover": {
                            backgroundColor: "rgba(25, 118, 210, 0.08)",
                          },
                        }}>
                        <Visibility />
                      </IconButton>

                      <input
                        accept=".pdf"
                        style={{ display: "none" }}
                        id="attainment-file-input-replace"
                        type="file"
                        onChange={handleInternalFileChange}
                        disabled={isLoading}
                      />
                      <label htmlFor="attainment-file-input-replace">
                        <Button
                          variant="outlined"
                          size="medium"
                          component="span"
                          disabled={isLoading}
                          sx={{
                            textTransform: "none",
                            borderColor: "#1976d2",
                            color: "#1976d2",
                            fontWeight: 600,
                            px: 3,
                            "&:hover": {
                              borderColor: "#1565c0",
                              backgroundColor: "#f0f7ff",
                            },
                          }}>
                          Replace File
                        </Button>
                      </label>
                    </Box>
                  </Box>
                ) : (
                  <>
                    <input
                      accept=".pdf"
                      style={{ display: "none" }}
                      id="attainment-file-input"
                      type="file"
                      onChange={handleInternalFileChange}
                      disabled={isLoading}
                    />
                    <label htmlFor="attainment-file-input" style={{ flex: 1 }}>
                      <Button
                        variant="outlined"
                        component="span"
                        disabled={isLoading}
                        sx={{
                          height: "60px",
                          width: "1094px",
                          borderRadius: 1,
                          borderWidth: 2,
                          borderStyle: "dashed",
                          borderColor: errors.attainment_attachment
                            ? "error.main"
                            : "#1976d2",
                          color: errors.attainment_attachment
                            ? "error.main"
                            : "#1976d2",
                          backgroundColor: "#fff",
                          textTransform: "none",
                          justifyContent: "flex-start",
                          padding: "0 20px",
                          "&:hover": {
                            borderColor: errors.attainment_attachment
                              ? "error.dark"
                              : "#1565c0",
                            backgroundColor: "#f0f7ff",
                          },
                        }}>
                        <Box
                          sx={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "flex-start",
                            width: "100%",
                          }}>
                          <Typography
                            variant="body1"
                            sx={{
                              color: "#1976d2",
                              fontWeight: 600,
                              fontSize: "0.95rem",
                              mb: 0.5,
                            }}>
                            No File Selected
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{
                              color: "#666",
                              fontSize: "0.8rem",
                            }}>
                            Supported format: PDF only (Max: 10MB)
                          </Typography>
                        </Box>
                      </Button>
                    </label>
                  </>
                )}
              </>
            ) : (
              <Box
                sx={{
                  border: "2px solid #e0e0e0",
                  borderRadius: 1,
                  p: 2,
                  backgroundColor: "#fafafa",
                  width: "1094px",
                  minHeight: "60px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}>
                {hasExistingFile() ? (
                  <>
                    <Typography
                      variant="body1"
                      sx={{
                        color: "#666",
                        fontWeight: 600,
                        fontSize: "0.95rem",
                        flex: 1,
                      }}>
                      {getFileName(getDisplayFilename())}
                    </Typography>
                    <IconButton
                      onClick={handleFileViewerOpen}
                      sx={{
                        color: "#1976d2",
                        "&:hover": {
                          backgroundColor: "rgba(25, 118, 210, 0.08)",
                        },
                      }}>
                      <Visibility />
                    </IconButton>
                  </>
                ) : (
                  <Typography
                    variant="body2"
                    sx={{
                      color: "#999",
                      fontSize: "0.9rem",
                      fontWeight: 500,
                    }}>
                    No attachment available
                  </Typography>
                )}
              </Box>
            )}

            {errors.attainment_attachment && (
              <FormHelperText error sx={{ mt: 0.5 }}>
                {errors.attainment_attachment.message ||
                  "Invalid file format or size"}
              </FormHelperText>
            )}
          </Box>
        </Grid>
      </Grid>

      <FileViewerDialog />
    </>
  );
};

export default AttainmentFormFields;
