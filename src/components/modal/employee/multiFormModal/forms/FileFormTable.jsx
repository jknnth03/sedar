import React, { useCallback } from "react";
import { useFormContext, Controller } from "react-hook-form";
import {
  Box,
  TextField,
  FormControl,
  Button,
  Typography,
  IconButton,
  Autocomplete,
  FormHelperText,
} from "@mui/material";
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
} from "@mui/icons-material";

const FileFormTable = ({
  fields,
  watchedFiles,
  isReadOnly,
  isFieldDisabled,
  processedFileTypes,
  processedFileCabinets,
  isLoadingFileTypes,
  isLoadingFileCabinets,
  errors,
  getFileTypeLabel,
  getFileCabinetLabel,
  getFileName,
  handleDropdownFocus,
  handleFileChange,
  handleRemoveFile,
  handleFileViewerOpen,
  addFileLine,
  removeFileLine,
}) => {
  const { control } = useFormContext();

  const handleFileViewerClick = useCallback(
    (index) => {
      handleFileViewerOpen(index);
    },
    [handleFileViewerOpen]
  );

  return (
    <Box sx={{ width: "100%", maxWidth: "1200px", overflow: "0" }}>
      {fields.map((field, index) => (
        <Box key={field.id} sx={{ mb: 3 }}>
          <Box
            sx={{
              border: "1px solid #e0e0e0",
              borderRadius: 2,
              p: 2,
            }}>
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
                mb: 2,
              }}>
              <Box>
                <Controller
                  name={`files.${index}.file_type_id`}
                  control={control}
                  render={({ field: controllerField, fieldState }) => (
                    <FormControl
                      fullWidth
                      error={!!fieldState.error}
                      disabled={isFieldDisabled || isLoadingFileTypes}
                      sx={{
                        width: "100%",
                        "& .MuiOutlinedInput-root": { borderRadius: 2 },
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
                    </FormControl>
                  )}
                />
              </Box>

              <Box>
                <Controller
                  name={`files.${index}.file_cabinet_id`}
                  control={control}
                  render={({ field: controllerField, fieldState }) => (
                    <FormControl
                      fullWidth
                      error={!!fieldState.error}
                      disabled={isFieldDisabled || isLoadingFileCabinets}
                      sx={{
                        width: "100%",
                        "& .MuiOutlinedInput-root": { borderRadius: 2 },
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
                    </FormControl>
                  )}
                />
              </Box>
            </Box>

            <Box sx={{ mb: 2 }}>
              <Controller
                name={`files.${index}.file_description`}
                control={control}
                render={({ field: controllerField, fieldState }) => (
                  <TextField
                    {...controllerField}
                    value={controllerField.value || ""}
                    label="File Description (optional)"
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
                    sx={{
                      width: "100%",
                      "& .MuiOutlinedInput-root": { borderRadius: 2 },
                    }}
                  />
                )}
              />
            </Box>

            <Box className="file-upload-container">
              {isReadOnly ? (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <TextField
                    label="File"
                    variant="outlined"
                    fullWidth
                    value={
                      watchedFiles?.[index]?.existing_file_name
                        ? getFileName(watchedFiles[index].existing_file_name)
                        : "No file attached"
                    }
                    disabled={true}
                    InputProps={{
                      readOnly: true,
                      endAdornment: watchedFiles?.[index]
                        ?.existing_file_name && (
                        <Box sx={{ display: "flex", gap: 0.5 }}>
                          <IconButton
                            size="small"
                            onClick={() => handleFileViewerClick(index)}
                            sx={{ mr: 0.5 }}
                            title="View file">
                            <VisibilityIcon fontSize="small" />
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
                        cursor: watchedFiles?.[index]?.existing_file_name
                          ? "pointer"
                          : "default",
                        color: watchedFiles?.[index]?.existing_file_name
                          ? "primary.main"
                          : "inherit",
                      },
                      "& .MuiOutlinedInput-root": { borderRadius: 2 },
                    }}
                    onClick={() => {
                      if (watchedFiles?.[index]?.existing_file_name) {
                        handleFileViewerClick(index);
                      }
                    }}
                  />
                </Box>
              ) : (
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <input
                    accept="application/pdf"
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
                      sx={{
                        height: "56px",
                        borderRadius: 2,
                        borderColor: errors.files?.[index]?.file_attachment
                          ? "#d32f2f"
                          : undefined,
                        "&:hover": {
                          borderColor: errors.files?.[index]?.file_attachment
                            ? "#d32f2f"
                            : undefined,
                        },
                      }}>
                      {watchedFiles?.[index]?.file_attachment instanceof File
                        ? watchedFiles[index].file_attachment.name
                        : watchedFiles?.[index]?.existing_file_name
                        ? `${getFileName(
                            watchedFiles[index].existing_file_name
                          )} - Replace file *`
                        : "Choose file *"}
                    </Button>
                  </label>

                  {(watchedFiles?.[index]?.file_attachment instanceof File ||
                    watchedFiles?.[index]?.existing_file_name) &&
                    !isReadOnly && (
                      <Box sx={{ display: "flex", gap: 0.5, ml: 1 }}>
                        <IconButton
                          size="small"
                          onClick={() => handleFileViewerClick(index)}
                          disabled={isFieldDisabled}
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
                      </Box>
                    )}

                  {watchedFiles?.[index]?.file_attachment && !isReadOnly && (
                    <IconButton
                      size="small"
                      onClick={() => handleRemoveFile(index)}
                      disabled={isFieldDisabled}
                      color="error"
                      sx={{
                        minWidth: "auto",
                        padding: "8px",
                        ml: 0,
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
                <FormHelperText error sx={{ ml: 2, mt: 0.5 }}>
                  {errors.files[index].file_attachment.message}
                </FormHelperText>
              )}

              {!errors.files?.[index]?.file_attachment && !isReadOnly && (
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ display: "block", ml: 2, mt: 0.5 }}
                  className="file-upload-caption">
                  {watchedFiles?.[index]?.existing_file_name
                    ? "Leave empty to keep current file. Max size: 10MB. Only PDF files allowed."
                    : "Max size: 10MB. Only PDF files allowed."}
                </Typography>
              )}
            </Box>

            {!isReadOnly && (
              <Box sx={{ display: "flex", gap: 1, mt: 2 }}>
                {fields.length > 1 && (
                  <Button
                    onClick={() => removeFileLine(index)}
                    disabled={isFieldDisabled}
                    variant="contained"
                    size="small"
                    startIcon={<DeleteIcon />}
                    fullWidth
                    sx={{
                      height: "50px",
                      backgroundColor: "rgb(220, 53, 69)",
                      color: "#fff !important",
                      borderRadius: 2,
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
                    fullWidth
                    sx={{
                      height: "50px",
                      backgroundColor: "rgb(40, 167, 69)",
                      color: "#fff !important",
                      borderRadius: 2,
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
            )}
          </Box>
        </Box>
      ))}
    </Box>
  );
};

FileFormTable.displayName = "FileFormTable";

export default FileFormTable;
