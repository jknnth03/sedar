import React from "react";
import {
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  FormHelperText,
  InputAdornment,
  Typography,
  Box,
  IconButton,
  Button,
} from "@mui/material";
import {
  CalendarToday as CalendarIcon,
  CloudUpload as CloudUploadIcon,
  Delete as DeleteIcon,
  AttachFile as AttachFileIcon,
} from "@mui/icons-material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { STATUS_OPTIONS } from "./statusUtils";

const StatusModalFields = ({
  newStatusEntry,
  errors,
  fieldsVisibility,
  onInputChange,
}) => {
  const [selectedFileName, setSelectedFileName] = React.useState("");
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
          <FormControl fullWidth error={!!errors.employee_status_label}>
            <InputLabel>Employee Status *</InputLabel>
            <Select
              value={newStatusEntry.employee_status_label}
              onChange={(e) =>
                onInputChange("employee_status_label", e.target.value)
              }
              label="Employee Status *">
              {STATUS_OPTIONS.map((status) => (
                <MenuItem key={status} value={status}>
                  {status}
                </MenuItem>
              ))}
            </Select>
            {errors.employee_status_label && (
              <FormHelperText>{errors.employee_status_label}</FormHelperText>
            )}
          </FormControl>
        </Box>

        {fieldsVisibility.startDate && (
          <Box>
            <DatePicker
              label="Start Date *"
              value={newStatusEntry.employee_status_start_date}
              onChange={(date) =>
                onInputChange("employee_status_start_date", date)
              }
              slotProps={{
                textField: {
                  fullWidth: true,
                  error: !!errors.employee_status_start_date,
                  helperText: errors.employee_status_start_date,
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
        )}

        {fieldsVisibility.endDate && (
          <Box>
            <DatePicker
              label="End Date"
              value={newStatusEntry.employee_status_end_date}
              onChange={(date) =>
                onInputChange("employee_status_end_date", date)
              }
              slotProps={{
                textField: {
                  fullWidth: true,
                  error: !!errors.employee_status_end_date,
                  helperText: errors.employee_status_end_date,
                  InputProps: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <CalendarIcon />
                      </InputAdornment>
                    ),
                  },
                },
              }}
              minDate={newStatusEntry.employee_status_start_date}
            />
          </Box>
        )}

        {fieldsVisibility.effectivityDate && (
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
              minDate={newStatusEntry.employee_status_start_date}
            />
          </Box>
        )}

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
