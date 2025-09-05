import React, { useState, useCallback } from "react";
import { Controller, useFormContext } from "react-hook-form";
import {
  TextField,
  Grid,
  Box,
  FormControl,
  FormHelperText,
  Button,
  IconButton,
  Autocomplete,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  CircularProgress,
} from "@mui/material";
import {
  CloudUpload,
  Delete,
  AttachFile,
  Visibility,
  Download,
  Close,
} from "@mui/icons-material";

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
  handleFileRemove,
  getOptionLabel,
  selectedAttainment,
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

  const {
    data: attachmentData,
    isLoading: isLoadingAttachment,
    error: attachmentError,
  } = useGetAttainmentAttachmentQuery(currentAttachmentId, {
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

  const handleInternalFileChange = useCallback(
    (event) => {
      const file = event.target.files?.[0];
      if (file) {
        setValue("attainment_attachment", file);
        setValue("attachment_filename", file.name);
        setValue("existing_attachment_filename", null);
        setValue("attachment_url", null);
        setValue("existing_attachment_url", null);

        if (handleFileChange) {
          handleFileChange(event);
        }
      }
      event.target.value = "";
    },
    [setValue, handleFileChange]
  );

  const handleFileViewerOpen = useCallback(() => {
    const attachmentData = getAttachmentData();

    if (attachmentData.isNewFile) {
      const fileUrl = URL.createObjectURL(watchedValues.attainment_attachment);
      setFileUrl(fileUrl);
      setCurrentFileName(watchedValues.attainment_attachment.name);
      setFileViewerOpen(true);
      return;
    }

    if (
      attachmentData.id &&
      !isNaN(attachmentData.id) &&
      attachmentData.id > 0
    ) {
      setCurrentAttachmentId(attachmentData.id);
      setCurrentFileName(attachmentData.filename);
      setFileViewerOpen(true);
    }
  }, [watchedValues, selectedAttainment]);

  const handleFileViewerClose = useCallback(() => {
    setFileViewerOpen(false);
    setCurrentAttachmentId(null);
    setCurrentFileName("");
  }, []);

  const handleFileDownload = useCallback(async () => {
    const attachmentData = getAttachmentData();

    if (attachmentData.isNewFile) {
      const url = URL.createObjectURL(watchedValues.attainment_attachment);
      const link = document.createElement("a");
      link.href = url;
      link.download =
        watchedValues.attainment_attachment.name || attachmentData.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      return;
    }

    if (attachmentData && fileUrl) {
      const link = document.createElement("a");
      link.href = fileUrl;
      link.download = attachmentData.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }, [watchedValues, attachmentData, fileUrl]);

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
      watchedValues.attachment_filename.toLowerCase() !== "dummy.pdf"
    ) {
      return watchedValues.attachment_filename;
    }

    if (
      watchedValues?.existing_attachment_filename &&
      watchedValues.existing_attachment_filename.toLowerCase() !== "dummy.pdf"
    ) {
      return watchedValues.existing_attachment_filename;
    }

    if (watchedValues?.attainment_attachment?.name) {
      return watchedValues.attainment_attachment.name;
    }

    if (watchedValues?.attainment_attachment instanceof File) {
      return watchedValues.attainment_attachment.name;
    }

    return "dummy.pdf";
  };

  const hasExistingFile = () => {
    if (watchedValues?.attainment_attachment) return true;

    if (
      watchedValues?.attachment_filename &&
      watchedValues.attachment_filename.toLowerCase() !== "dummy.pdf"
    ) {
      return true;
    }

    if (
      watchedValues?.existing_attachment_filename &&
      watchedValues.existing_attachment_filename.toLowerCase() !== "dummy.pdf"
    ) {
      return true;
    }

    const attachmentData = getAttachmentData();
    return !!attachmentData.id;
  };

  const getFileName = (filename) => {
    if (!filename) {
      if (
        watchedValues?.attachment_filename &&
        watchedValues.attachment_filename.toLowerCase() !== "dummy.pdf"
      ) {
        return watchedValues.attachment_filename;
      }
      if (
        watchedValues?.existing_attachment_filename &&
        watchedValues.existing_attachment_filename.toLowerCase() !== "dummy.pdf"
      ) {
        return watchedValues.existing_attachment_filename;
      }
      if (watchedValues?.attainment_attachment?.name) {
        return watchedValues.attainment_attachment.name;
      }
      if (watchedValues?.attainment_attachment instanceof File) {
        return watchedValues.attainment_attachment.name;
      }
      return "dummy.pdf";
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
            <Box
              onClick={
                hasExistingFile() && isReadOnly
                  ? handleFileViewerOpen
                  : undefined
              }
              sx={{
                border: "1px dotted",
                borderColor: errors.attainment_attachment
                  ? "error.main"
                  : "#ccc",
                borderRadius: 1,
                p: 1.5,
                backgroundColor: "#fff",
                width: "1094px",
                minHeight: "60px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                cursor: hasExistingFile() && isReadOnly ? "pointer" : "default",
                transition: "all 0.2s ease-in-out",
                "&:hover":
                  hasExistingFile() && isReadOnly
                    ? {
                        borderColor: "#1976d2",
                        backgroundColor: "#f8f9fa",
                      }
                    : {},
              }}>
              {hasExistingFile() ? (
                <>
                  <Box
                    sx={{ display: "flex", flexDirection: "column", flex: 1 }}>
                    <Typography
                      variant="body1"
                      sx={{
                        color: "#333",
                        fontWeight: 600,
                        textAlign: "left",
                        wordBreak: "break-word",
                        textTransform: "uppercase",
                        fontSize: "0.875rem",
                        mb: 0.5,
                      }}>
                      {getFileName(getDisplayFilename())}
                    </Typography>

                    {isReadOnly && (
                      <Typography
                        variant="body2"
                        sx={{
                          color: "#666",
                          fontSize: "0.75rem",
                          textAlign: "left",
                        }}>
                        CLICK ANYWHERE INSIDE THE BOX TO VIEW ATTACHMENT
                      </Typography>
                    )}
                  </Box>

                  {!isReadOnly ? (
                    <Box sx={{ display: "flex", gap: 1 }}>
                      <Button
                        variant="outlined"
                        size="small"
                        disabled={isLoading}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleFileViewerOpen();
                        }}
                        sx={{
                          textTransform: "none",
                          borderColor: "#ccc",
                          color: "#666",
                          "&:hover": {
                            borderColor: "#1976d2",
                            color: "#1976d2",
                          },
                        }}>
                        VIEW FILE
                      </Button>

                      <input
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                        style={{ display: "none" }}
                        id="attainment-file-input"
                        type="file"
                        onChange={handleInternalFileChange}
                        disabled={isLoading}
                      />
                      <Button
                        variant="outlined"
                        size="small"
                        disabled={isLoading}
                        onClick={(e) => {
                          e.stopPropagation();
                          document
                            .getElementById("attainment-file-input")
                            .click();
                        }}
                        sx={{
                          textTransform: "none",
                          borderColor: "#ccc",
                          color: "#666",
                          "&:hover": {
                            borderColor: "#1976d2",
                            color: "#1976d2",
                          },
                        }}>
                        REPLACE FILE
                      </Button>
                    </Box>
                  ) : null}
                </>
              ) : (
                <>
                  {!isReadOnly ? (
                    <>
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          flex: 1,
                        }}>
                        <Typography
                          variant="body1"
                          sx={{
                            color: "#666",
                            fontWeight: 500,
                            textAlign: "left",
                            fontSize: "0.875rem",
                            mb: 0.5,
                          }}>
                          NO FILE SELECTED
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{
                            color: "#999",
                            fontSize: "0.75rem",
                            textAlign: "left",
                          }}>
                          SUPPORTED FORMATS: PDF, DOC, DOCX, JPG, PNG
                        </Typography>
                      </Box>

                      <input
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                        style={{ display: "none" }}
                        id="attainment-file-input-new"
                        type="file"
                        onChange={handleInternalFileChange}
                        disabled={isLoading}
                      />
                      <Button
                        variant="outlined"
                        size="small"
                        disabled={isLoading}
                        onClick={(e) => {
                          e.stopPropagation();
                          document
                            .getElementById("attainment-file-input-new")
                            .click();
                        }}
                        sx={{
                          textTransform: "none",
                          borderColor: "#ccc",
                          color: "#666",
                          "&:hover": {
                            borderColor: "#1976d2",
                            color: "#1976d2",
                          },
                        }}>
                        CHOOSE FILE
                      </Button>
                    </>
                  ) : (
                    <Typography
                      variant="body2"
                      sx={{
                        color: "#666",
                        fontSize: "0.875rem",
                        fontWeight: 500,
                      }}>
                      NO ATTACHMENT AVAILABLE
                    </Typography>
                  )}
                </>
              )}
            </Box>

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
