import React, { useState, useEffect } from "react";
import {
  Button,
  CircularProgress,
  useMediaQuery,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  TextField,
} from "@mui/material";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import IconButton from "@mui/material/IconButton";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { format } from "date-fns";
import { useLazyExportSubmissionsQuery } from "../../../features/api/approvalsetting/formSubmissionApi";
import { useSnackbar } from "notistack";

const ExportButton = ({ isLoading = false }) => {
  const isVerySmall = useMediaQuery("(max-width:369px)");
  const { enqueueSnackbar } = useSnackbar();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [isExporting, setIsExporting] = useState(false);

  const [
    triggerExport,
    { data: exportData, isLoading: isExportLoading, isSuccess, isError, error },
  ] = useLazyExportSubmissionsQuery();

  useEffect(() => {
    if (isSuccess && exportData) {
      const url = window.URL.createObjectURL(exportData);
      const link = document.createElement("a");
      link.href = url;
      link.download = `MRF_Export_${format(
        new Date(),
        "yyyy-MM-dd_HHmmss"
      )}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      enqueueSnackbar("Data exported successfully!", {
        variant: "success",
        autoHideDuration: 2000,
      });

      setIsExporting(false);
      handleCloseDialog();
    }
  }, [isSuccess, exportData, enqueueSnackbar]);

  useEffect(() => {
    if (isError) {
      let errorMessage = "Failed to export data. Please try again.";

      if (error?.data?.message) {
        errorMessage = error.data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      }

      enqueueSnackbar(errorMessage, {
        variant: "error",
        autoHideDuration: 3000,
      });

      setIsExporting(false);
    }
  }, [isError, error, enqueueSnackbar]);

  const handleOpenDialog = () => {
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setStartDate(null);
    setEndDate(null);
  };

  const handleClear = () => {
    setStartDate(null);
    setEndDate(null);
  };

  const handleExport = async () => {
    if (!startDate || !endDate) {
      enqueueSnackbar("Please select both start and end dates", {
        variant: "warning",
        autoHideDuration: 2000,
      });
      return;
    }

    setIsExporting(true);

    const params = {
      form_code: "mrf",
      start_date: format(startDate, "yyyy-MM-dd"),
      end_date: format(endDate, "yyyy-MM-dd"),
    };

    await triggerExport(params);
  };

  const hasFilters = startDate || endDate;

  if (isVerySmall) {
    return (
      <>
        <IconButton
          onClick={handleOpenDialog}
          disabled={isLoading || isExporting}
          size="small"
          sx={{
            width: "36px",
            height: "36px",
            border: "1px solid #ccc",
            borderRadius: "8px",
            backgroundColor: "white",
            color: "rgb(33, 61, 112)",
            transition: "all 0.2s ease-in-out",
            "&:hover": {
              backgroundColor: "#f5f5f5",
              borderColor: "rgb(33, 61, 112)",
            },
            "&:disabled": {
              backgroundColor: "#f5f5f5",
              borderColor: "#e0e0e0",
            },
          }}>
          {isExporting ? (
            <CircularProgress size={16} sx={{ color: "rgb(33, 61, 112)" }} />
          ) : (
            <FileDownloadIcon sx={{ fontSize: "18px" }} />
          )}
        </IconButton>

        <Dialog
          open={dialogOpen}
          onClose={handleCloseDialog}
          maxWidth="xs"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: "12px",
              padding: "8px",
            },
          }}>
          <DialogTitle>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <FileDownloadIcon
                  sx={{ color: "rgb(33, 61, 112)", fontSize: "24px" }}
                />
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 600,
                    color: "rgb(33, 61, 112)",
                    fontSize: "18px",
                  }}>
                  EXPORT DATA
                </Typography>
              </Box>
              <Button
                size="small"
                variant="outlined"
                onClick={handleClear}
                disabled={!hasFilters}
                sx={{
                  minWidth: "70px",
                  height: "32px",
                  fontSize: "11px",
                  fontWeight: 600,
                  textTransform: "none",
                  borderRadius: "6px",
                  borderColor: "#ccc",
                  color: "rgb(33, 61, 112)",
                  "&:hover": {
                    borderColor: "rgb(33, 61, 112)",
                    backgroundColor: "#f5f5f5",
                  },
                  "&:disabled": {
                    borderColor: "#e0e0e0",
                    color: "#999",
                  },
                }}>
                Clear All
              </Button>
            </Box>
          </DialogTitle>

          <DialogContent>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 2,
                  pt: 1,
                }}>
                <DatePicker
                  label="Start Date"
                  value={startDate}
                  onChange={(newValue) => setStartDate(newValue)}
                  renderInput={(params) => (
                    <TextField {...params} fullWidth size="small" />
                  )}
                  maxDate={endDate || new Date()}
                />
                <DatePicker
                  label="End Date"
                  value={endDate}
                  onChange={(newValue) => setEndDate(newValue)}
                  renderInput={(params) => (
                    <TextField {...params} fullWidth size="small" />
                  )}
                  minDate={startDate}
                  maxDate={new Date()}
                />
              </Box>
            </LocalizationProvider>
          </DialogContent>

          <DialogActions sx={{ padding: "16px 24px" }}>
            <Box sx={{ display: "flex", gap: 1, width: "100%" }}>
              <Button
                onClick={handleCloseDialog}
                variant="outlined"
                fullWidth
                sx={{
                  height: "40px",
                  textTransform: "none",
                  fontWeight: 600,
                  fontSize: "14px",
                  borderRadius: "8px",
                  borderColor: "#ccc",
                  color: "rgb(33, 61, 112)",
                  "&:hover": {
                    borderColor: "rgb(33, 61, 112)",
                    backgroundColor: "#f5f5f5",
                  },
                }}>
                CANCEL
              </Button>
              <Button
                onClick={handleExport}
                variant="contained"
                fullWidth
                disabled={!startDate || !endDate || isExporting}
                sx={{
                  height: "40px",
                  textTransform: "none",
                  fontWeight: 600,
                  fontSize: "14px",
                  borderRadius: "8px",
                  backgroundColor: "rgb(33, 61, 112)",
                  "&:hover": {
                    backgroundColor: "rgb(25, 45, 84)",
                  },
                  "&:disabled": {
                    backgroundColor: "#ccc",
                  },
                }}>
                {isExporting ? "EXPORTING..." : "EXPORT"}
              </Button>
            </Box>
          </DialogActions>
        </Dialog>
      </>
    );
  }

  return (
    <>
      <Button
        variant="outlined"
        onClick={handleOpenDialog}
        disabled={isLoading || isExporting}
        startIcon={
          isExporting ? (
            <CircularProgress size={16} sx={{ color: "rgb(33, 61, 112)" }} />
          ) : (
            <FileDownloadIcon />
          )
        }
        sx={{
          height: "36px",
          minWidth: "100px",
          border: "1px solid #ccc",
          borderRadius: "8px",
          backgroundColor: "white",
          color: "rgb(33, 61, 112)",
          fontSize: "12px",
          fontWeight: 600,
          letterSpacing: "0.5px",
          textTransform: "none",
          paddingLeft: "12px",
          paddingRight: "12px",
          transition: "all 0.2s ease-in-out",
          "&:hover": {
            backgroundColor: "#f5f5f5",
            borderColor: "rgb(33, 61, 112)",
          },
          "&:disabled": {
            backgroundColor: "#f5f5f5",
            borderColor: "#e0e0e0",
            color: "#999",
          },
          "& .MuiButton-startIcon": {
            marginRight: "6px",
          },
        }}>
        {isExporting ? "Exporting..." : "EXPORT"}
      </Button>

      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: "12px",
            padding: "8px",
          },
        }}>
        <DialogTitle>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <FileDownloadIcon
                sx={{ color: "rgb(33, 61, 112)", fontSize: "24px" }}
              />
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 600,
                  color: "rgb(33, 61, 112)",
                  fontSize: "18px",
                }}>
                EXPORT DATA
              </Typography>
            </Box>
            <Button
              size="small"
              variant="outlined"
              onClick={handleClear}
              disabled={!hasFilters}
              sx={{
                minWidth: "70px",
                height: "32px",
                fontSize: "11px",
                fontWeight: 600,
                textTransform: "none",
                borderRadius: "6px",
                borderColor: "#ccc",
                color: "rgb(33, 61, 112)",
                "&:hover": {
                  borderColor: "rgb(33, 61, 112)",
                  backgroundColor: "#f5f5f5",
                },
                "&:disabled": {
                  borderColor: "#e0e0e0",
                  color: "#999",
                },
              }}>
              Clear All
            </Button>
          </Box>
        </DialogTitle>

        <DialogContent>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Box
              sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
              <DatePicker
                label="Start Date"
                value={startDate}
                onChange={(newValue) => setStartDate(newValue)}
                renderInput={(params) => (
                  <TextField {...params} fullWidth size="small" />
                )}
                maxDate={endDate || new Date()}
              />
              <DatePicker
                label="End Date"
                value={endDate}
                onChange={(newValue) => setEndDate(newValue)}
                renderInput={(params) => (
                  <TextField {...params} fullWidth size="small" />
                )}
                minDate={startDate}
                maxDate={new Date()}
              />
            </Box>
          </LocalizationProvider>
        </DialogContent>

        <DialogActions sx={{ padding: "16px 24px" }}>
          <Box sx={{ display: "flex", gap: 1, width: "100%" }}>
            <Button
              onClick={handleCloseDialog}
              variant="outlined"
              fullWidth
              sx={{
                height: "40px",
                textTransform: "none",
                fontWeight: 600,
                fontSize: "14px",
                borderRadius: "8px",
                borderColor: "#ccc",
                color: "rgb(33, 61, 112)",
                "&:hover": {
                  borderColor: "rgb(33, 61, 112)",
                  backgroundColor: "#f5f5f5",
                },
              }}>
              CANCEL
            </Button>
            <Button
              onClick={handleExport}
              variant="contained"
              fullWidth
              disabled={!startDate || !endDate || isExporting}
              sx={{
                height: "40px",
                textTransform: "none",
                fontWeight: 600,
                fontSize: "14px",
                borderRadius: "8px",
                backgroundColor: "rgb(33, 61, 112)",
                "&:hover": {
                  backgroundColor: "rgb(25, 45, 84)",
                },
                "&:disabled": {
                  backgroundColor: "#ccc",
                },
              }}>
              {isExporting ? "EXPORTING..." : "EXPORT"}
            </Button>
          </Box>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ExportButton;
