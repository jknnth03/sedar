import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Checkbox,
  FormControlLabel,
  Box,
  Typography,
  IconButton,
  Divider,
} from "@mui/material";
import FilterListIcon from "@mui/icons-material/FilterList";
import CloseIcon from "@mui/icons-material/Close";

const FilterStatusDialog = ({
  open,
  onClose,
  selectedStatuses = [],
  onStatusChange,
  onApplyFilters,
  onClearFilters,
}) => {
  const statusOptions = [
    "PROBATIONARY",
    "REGULAR",
    "AGENCY HIRED",
    "PROJECT BASED",
    "EXTENDED",
    "SUSPENDED",
    "MATERNITY",
    "RETURNED TO AGENCY",
    "TERMINATED",
    "RESIGNED",
    "ABSENT WITHOUT LEAVE",
    "END OF CONTRACT",
    "BLACKLISTED",
    "DISMISSED",
    "DECEASED",
    "BACK OUT",
  ];

  const handleStatusToggle = (status) => {
    console.log("Toggle status:", status);
    console.log("Current selected statuses:", selectedStatuses);

    const updatedStatuses = selectedStatuses.includes(status)
      ? selectedStatuses.filter((s) => s !== status)
      : [...selectedStatuses, status];

    console.log("Updated statuses:", updatedStatuses);
    onStatusChange(updatedStatuses);
  };

  const handleSelectAll = () => {
    if (selectedStatuses.length === statusOptions.length) {
      onStatusChange([]);
    } else {
      onStatusChange(statusOptions);
    }
  };

  const handleCancel = () => {
    onClose();
  };

  const handleApply = () => {
    console.log(
      "Apply button clicked with selected statuses:",
      selectedStatuses
    );
    onApplyFilters();
  };

  const handleClearAll = () => {
    onStatusChange([]);
    onClearFilters();
  };

  const isAllSelected = selectedStatuses.length === statusOptions.length;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: "12px",
          minHeight: "500px",
          maxWidth: "600px",
        },
      }}>
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "12px 20px 12px 24px",
          backgroundColor: "#f8f9fa",
        }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <FilterListIcon
            sx={{ color: "rgb(33, 61, 112)", fontSize: "20px" }}
          />
          <Typography
            variant="h5"
            sx={{
              fontWeight: 700,
              fontSize: "16px",
              color: "rgb(33, 61, 112)",
              letterSpacing: "0.5px",
            }}>
            FILTER BY STATUS
          </Typography>
        </Box>
        <IconButton
          onClick={onClose}
          sx={{
            color: "#666",
            "&:hover": {
              backgroundColor: "rgba(0, 0, 0, 0.08)",
            },
          }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <Divider />

      <DialogContent sx={{ paddingTop: "16px" }}>
        <Box sx={{ mb: 2, paddingLeft: "20px", display: "flex", gap: 2 }}>
          <Button
            variant="outlined"
            onClick={handleSelectAll}
            sx={{
              textTransform: "none",
              fontWeight: 600,
              fontSize: "12px",
              padding: "8px 16px",
              borderColor: "rgb(33, 61, 112)",
              color: "rgb(33, 61, 112)",
              borderRadius: "8px",
              "&:hover": {
                borderColor: "rgb(25, 45, 84)",
                backgroundColor: "rgba(33, 61, 112, 0.04)",
              },
            }}>
            {isAllSelected ? "Deselect All" : "Select All"}
          </Button>

          {selectedStatuses.length > 0 && (
            <Button
              variant="outlined"
              onClick={handleClearAll}
              sx={{
                textTransform: "none",
                fontWeight: 600,
                fontSize: "12px",
                padding: "8px 16px",
                borderColor: "#dc3545",
                color: "#dc3545",
                borderRadius: "8px",
                "&:hover": {
                  borderColor: "#c82333",
                  backgroundColor: "rgba(220, 53, 69, 0.04)",
                },
              }}>
              Clear All
            </Button>
          )}
        </Box>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: "4px",
            maxHeight: "320px",
            overflowY: "auto",
            padding: "4px",
          }}>
          {statusOptions.map((status) => (
            <FormControlLabel
              key={status}
              control={
                <Checkbox
                  checked={selectedStatuses.includes(status)}
                  onChange={() => handleStatusToggle(status)}
                  sx={{
                    color: "rgb(33, 61, 112)",
                    "&.Mui-checked": {
                      color: "rgb(33, 61, 112)",
                    },
                    "&:hover": {
                      backgroundColor: "rgba(33, 61, 112, 0.04)",
                    },
                  }}
                />
              }
              label={status}
              sx={{
                margin: 0,
                padding: "4px 8px",
                borderRadius: "8px",
                transition: "all 0.2s ease-in-out",
                "&:hover": {
                  backgroundColor: "rgba(33, 61, 112, 0.02)",
                },
                "& .MuiFormControlLabel-label": {
                  fontSize: "14px",
                  color: "#333",
                  fontWeight: 500,
                  userSelect: "none",
                },
              }}
            />
          ))}
        </Box>
      </DialogContent>

      <Divider />

      <DialogActions
        sx={{
          padding: "20px 24px",
          backgroundColor: "#f8f9fa",
          gap: 2,
          justifyContent: "right",
        }}>
        <Box sx={{ display: "flex", gap: 2 }}>
          <Button
            onClick={handleApply}
            variant="contained"
            sx={{
              textTransform: "none",
              fontWeight: 600,
              fontSize: "12px",
              backgroundColor: "rgb(33, 61, 112)",
              padding: "10px 24px",
              borderRadius: "8px",
              boxShadow: "0 2px 8px rgba(33, 61, 112, 0.3)",
              "&:hover": {
                backgroundColor: "rgb(25, 45, 84)",
                boxShadow: "0 4px 12px rgba(33, 61, 112, 0.4)",
              },
            }}>
            APPLY FILTERS
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
};

export default FilterStatusDialog;
