import React, { useState } from "react";
import {
  TextField,
  InputAdornment,
  Typography,
  Box,
  IconButton,
  Button,
  Autocomplete,
  CircularProgress,
} from "@mui/material";
import {
  CalendarToday as CalendarIcon,
  CloudUpload as CloudUploadIcon,
  Delete as DeleteIcon,
  AttachFile as AttachFileIcon,
} from "@mui/icons-material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";

const StatusModalFields = ({
  newStatusEntry,
  errors,
  onInputChange,
  separationTypeOptions,
  separationReasonOptions,
  isLoadingSeparationTypes,
  isLoadingSeparationReasons,
  onFetchSeparationTypes,
  onFetchSeparationReasons,
}) => {
  const [selectedFileName, setSelectedFileName] = useState("");
  const fileInputRef = React.useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFileName(file.name);
      onInputChange("employee_status_attachment", file);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFileName("");
    onInputChange("employee_status_attachment", null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <Box sx={{ ml: 2 }}>
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
          paddingTop: 2,
        }}>
        <Box>
          <Autocomplete
            key={`separation-type-autocomplete-${separationTypeOptions.length}`}
            options={separationTypeOptions}
            getOptionLabel={(option) => option?.name || ""}
            value={newStatusEntry.separation_type}
            onChange={(event, newValue) => {
              onInputChange("separation_type", newValue);
            }}
            onOpen={onFetchSeparationTypes}
            loading={isLoadingSeparationTypes}
            disabled={isLoadingSeparationTypes}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Separation Type *"
                error={!!errors.separation_type}
                helperText={errors.separation_type}
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {isLoadingSeparationTypes ? (
                        <CircularProgress color="inherit" size={20} />
                      ) : null}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
              />
            )}
            isOptionEqualToValue={(option, value) => option?.id === value?.id}
            noOptionsText={
              isLoadingSeparationTypes
                ? "Loading options..."
                : "No options available"
            }
            fullWidth
          />
        </Box>

        <Box>
          <Autocomplete
            key={`separation-reason-autocomplete-${separationReasonOptions.length}`}
            options={separationReasonOptions}
            getOptionLabel={(option) => option?.name || ""}
            value={newStatusEntry.separation_reason}
            onChange={(event, newValue) => {
              onInputChange("separation_reason", newValue);
            }}
            onOpen={onFetchSeparationReasons}
            loading={isLoadingSeparationReasons}
            disabled={isLoadingSeparationReasons}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Separation Reason *"
                error={!!errors.separation_reason}
                helperText={errors.separation_reason}
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {isLoadingSeparationReasons ? (
                        <CircularProgress color="inherit" size={20} />
                      ) : null}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
              />
            )}
            isOptionEqualToValue={(option, value) => option?.id === value?.id}
            noOptionsText={
              isLoadingSeparationReasons
                ? "Loading options..."
                : "No options available"
            }
            fullWidth
          />
        </Box>

        <Box>
          <DatePicker
            label="Effectivity Date *"
            value={newStatusEntry.employee_status_effectivity_date}
            onChange={(date) =>
              onInputChange("employee_status_effectivity_date", date)
            }
            slotProps={{
              textField: {
                fullWidth: true,
                error: !!errors.employee_status_effectivity_date,
                helperText: errors.employee_status_effectivity_date,
                InputProps: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <CalendarIcon />
                    </InputAdornment>
                  ),
                },
              },
            }}
          />
        </Box>

        <Box sx={{ gridColumn: "1 / -1" }}>
          <Box
            sx={{
              border: "1px solid",
              borderColor: errors.employee_status_attachment
                ? "error.main"
                : "rgba(0, 0, 0, 0.23)",
              borderRadius: 1,
              padding: 2,
              backgroundColor: "#fafafa",
              transition: "all 0.2s",
              minHeight: "56px",
              display: "flex",
              alignItems: "center",
              "&:hover": {
                borderColor: errors.employee_status_attachment
                  ? "error.main"
                  : "rgba(0, 0, 0, 0.87)",
              },
            }}>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              onChange={handleFileChange}
              style={{ display: "none" }}
              id="status-attachment-upload"
            />

            {!selectedFileName ? (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  width: "100%",
                }}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                  }}>
                  <CloudUploadIcon
                    sx={{
                      fontSize: 24,
                      color: "text.secondary",
                    }}
                  />
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 500,
                      color: "text.secondary",
                    }}>
                    Upload Attachment
                  </Typography>
                </Box>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={handleUploadClick}
                  startIcon={<CloudUploadIcon />}
                  sx={{
                    textTransform: "none",
                  }}>
                  Choose File
                </Button>
              </Box>
            ) : (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  width: "100%",
                }}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    flex: 1,
                    minWidth: 0,
                  }}>
                  <AttachFileIcon
                    sx={{
                      fontSize: 24,
                      color: "primary.main",
                      flexShrink: 0,
                    }}
                  />
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 500,
                      color: "text.primary",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}>
                    {selectedFileName}
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", gap: 1, flexShrink: 0 }}>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={handleUploadClick}
                    startIcon={<CloudUploadIcon />}
                    sx={{
                      textTransform: "none",
                    }}>
                    Replace
                  </Button>
                  <IconButton
                    onClick={handleRemoveFile}
                    size="small"
                    sx={{
                      color: "error.main",
                      "&:hover": {
                        backgroundColor: "error.lighter",
                      },
                    }}>
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </Box>
            )}

            {errors.employee_status_attachment && (
              <Typography
                variant="caption"
                sx={{
                  color: "error.main",
                  display: "block",
                  mt: 1,
                }}>
                {errors.employee_status_attachment}
              </Typography>
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default StatusModalFields;
