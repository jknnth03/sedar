import React from "react";
import {
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  FormHelperText,
  Grid,
  InputAdornment,
  Card,
  CardContent,
  Typography,
  Box,
} from "@mui/material";
import { CalendarToday as CalendarIcon } from "@mui/icons-material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { STATUS_OPTIONS } from "./statusUtils";

const StatusModalFields = ({
  newStatusEntry,
  errors,
  fieldsVisibility,
  onInputChange,
}) => {
  return (
    <Box sx={{ ml: 2 }}>
      <Grid container spacing={2} sx={{ paddingTop: 2 }}>
        <Grid item xs={12} sm={6} sx={{ minWidth: "400px", maxWidth: "400px" }}>
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
        </Grid>

        {fieldsVisibility.startDate && (
          <Grid
            item
            xs={12}
            md={6}
            sx={{ minWidth: "400px", maxWidth: "400px" }}>
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
          </Grid>
        )}

        {fieldsVisibility.endDate && (
          <Grid
            item
            xs={12}
            md={6}
            sx={{ minWidth: "400px", maxWidth: "400px" }}>
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
          </Grid>
        )}

        {fieldsVisibility.effectivityDate && (
          <Grid
            item
            xs={12}
            md={6}
            sx={{ minWidth: "400px", maxWidth: "400px" }}>
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
          </Grid>
        )}

        <Grid item xs={12}>
          <Grid
            item
            xs={12}
            md={6}
            sx={{ minWidth: "816px", maxWidth: "816px" }}></Grid>
          <TextField
            type="file"
            fullWidth
            variant="outlined"
            label="Attachment"
            InputLabelProps={{ shrink: true }}
            inputProps={{
              accept: ".pdf,.doc,.docx,.jpg,.jpeg,.png",
            }}
            onChange={(e) =>
              onInputChange("employee_status_attachment", e.target.files[0])
            }
            helperText="Accepted formats: PDF, DOC, DOCX, JPG, JPEG, PNG"
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default StatusModalFields;
