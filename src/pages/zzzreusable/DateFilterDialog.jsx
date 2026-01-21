import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";

/**
 * Reusable Date Filter Dialog Component
 *
 * @param {Object} props
 * @param {boolean} props.open - Controls dialog visibility
 * @param {Function} props.onClose - Callback when dialog closes
 * @param {Object} props.dateFilters - Current date filters { startDate, endDate }
 * @param {Function} props.onDateFiltersChange - Callback when filters are applied
 * @param {Object} props.styles - Optional custom styles object
 * @param {string} props.title - Optional custom title (default: "FILTER BY DATE")
 * @param {Date} props.maxDate - Optional max date for date pickers (default: new Date())
 * @param {Date} props.minDate - Optional min date for date pickers
 */
const DateFilterDialog = ({
  open,
  onClose,
  dateFilters,
  onDateFiltersChange,
  styles = {},
  title = "FILTER BY DATE",
  maxDate = new Date(),
  minDate = null,
}) => {
  const [tempStartDate, setTempStartDate] = useState(dateFilters.startDate);
  const [tempEndDate, setTempEndDate] = useState(dateFilters.endDate);

  useEffect(() => {
    setTempStartDate(dateFilters.startDate);
    setTempEndDate(dateFilters.endDate);
  }, [dateFilters, open]);

  const handleApply = () => {
    onDateFiltersChange({
      startDate: tempStartDate,
      endDate: tempEndDate,
    });
    onClose();
  };

  const handleClear = () => {
    setTempStartDate(null);
    setTempEndDate(null);
  };

  const hasFilters = tempStartDate || tempEndDate;

  // Default styles
  const defaultStyles = {
    filterDialog: {
      borderRadius: "12px",
      ...styles.filterDialog,
    },
    filterDialogTitle: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      ...styles.filterDialogTitle,
    },
    filterDialogTitleLeft: {
      display: "flex",
      alignItems: "center",
      gap: 1,
      ...styles.filterDialogTitleLeft,
    },
    filterIcon: {
      color: "rgb(33, 61, 112)",
      fontSize: "20px",
      ...styles.filterIcon,
    },
    filterDialogTitleText: {
      fontWeight: 600,
      fontSize: "16px",
      color: "rgb(33, 61, 112)",
      ...styles.filterDialogTitleText,
    },
    selectAllButton: {
      textTransform: "none",
      fontSize: "12px",
      fontWeight: 600,
      ...styles.selectAllButton,
    },
    filterDialogActions: {
      padding: "16px 24px",
      ...styles.filterDialogActions,
    },
    dialogActionsContainer: {
      width: "100%",
      display: "flex",
      justifyContent: "flex-end",
      ...styles.dialogActionsContainer,
    },
    dialogButtonsContainer: {
      display: "flex",
      gap: 1,
      ...styles.dialogButtonsContainer,
    },
    cancelButton: {
      textTransform: "none",
      fontWeight: 600,
      fontSize: "14px",
      ...styles.cancelButton,
    },
    applyFiltersButton: {
      textTransform: "none",
      fontWeight: 600,
      fontSize: "14px",
      backgroundColor: "rgb(33, 61, 112)",
      "&:hover": {
        backgroundColor: "rgb(23, 51, 102)",
      },
      ...styles.applyFiltersButton,
    },
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: defaultStyles.filterDialog,
      }}>
      <DialogTitle>
        <Box sx={defaultStyles.filterDialogTitle}>
          <Box sx={defaultStyles.filterDialogTitleLeft}>
            <CalendarTodayIcon sx={defaultStyles.filterIcon} />
            <Typography variant="h6" sx={defaultStyles.filterDialogTitleText}>
              {title}
            </Typography>
          </Box>
          <Button
            size="small"
            variant="outlined"
            onClick={handleClear}
            disabled={!hasFilters}
            sx={defaultStyles.selectAllButton}>
            Clear All
          </Button>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
          <DatePicker
            label="Start Date"
            value={tempStartDate}
            onChange={(newValue) => setTempStartDate(newValue)}
            renderInput={(params) => (
              <TextField {...params} fullWidth size="small" />
            )}
            maxDate={tempEndDate || maxDate}
            minDate={minDate}
          />
          <DatePicker
            label="End Date"
            value={tempEndDate}
            onChange={(newValue) => setTempEndDate(newValue)}
            renderInput={(params) => (
              <TextField {...params} fullWidth size="small" />
            )}
            minDate={tempStartDate || minDate}
            maxDate={maxDate}
          />
        </Box>
      </DialogContent>

      <DialogActions sx={defaultStyles.filterDialogActions}>
        <Box sx={defaultStyles.dialogActionsContainer}>
          <Box sx={defaultStyles.dialogButtonsContainer}>
            <Button
              onClick={onClose}
              variant="outlined"
              sx={defaultStyles.cancelButton}>
              CANCEL
            </Button>
            <Button
              onClick={handleApply}
              variant="contained"
              sx={defaultStyles.applyFiltersButton}>
              APPLY FILTERS
            </Button>
          </Box>
        </Box>
      </DialogActions>
    </Dialog>
  );
};

export default DateFilterDialog;
