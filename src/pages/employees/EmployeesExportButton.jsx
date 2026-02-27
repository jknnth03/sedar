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
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { format } from "date-fns";
import { useLazyGetExportAlphalistQuery } from "../../features/api/employee/generalApi";
import { useSnackbar } from "notistack";

const EmployeesExportButton = ({ isLoading = false }) => {
  const isVerySmall = useMediaQuery("(max-width:369px)");
  const { enqueueSnackbar } = useSnackbar();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [isExporting, setIsExporting] = useState(false);

  const [
    triggerExport,
    { data: exportData, isLoading: isExportLoading, isSuccess, isError, error },
  ] = useLazyGetExportAlphalistQuery();

  useEffect(() => {
    if (isSuccess && exportData) {
      const url = window.URL.createObjectURL(exportData);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Alphalist_Export_${format(
        new Date(),
        "yyyy-MM-dd_HHmmss",
      )}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      enqueueSnackbar("Alphalist exported successfully!", {
        variant: "success",
        autoHideDuration: 2000,
      });

      setIsExporting(false);
      handleCloseDialog();
    }
  }, [isSuccess, exportData]);

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
  }, [isError, error]);

  const handleOpenDialog = () => {
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedMonth(null);
  };

  const handleExport = async () => {
    if (!selectedMonth) {
      enqueueSnackbar("Please select a month", {
        variant: "warning",
        autoHideDuration: 2000,
      });
      return;
    }

    setIsExporting(true);

    const params = {
      year: format(selectedMonth, "yyyy"),
      month: format(selectedMonth, "MMMM").toLowerCase(),
    };

    await triggerExport(params);
  };

  const dialogContent = (
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
            EXPORT DATA (ALPHA LIST)
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
            <DatePicker
              label="Month"
              value={selectedMonth}
              onChange={(newValue) => setSelectedMonth(newValue)}
              views={["year", "month"]}
              openTo="month"
              maxDate={new Date()}
              renderInput={(params) => (
                <TextField {...params} fullWidth size="small" />
              )}
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
            disabled={!selectedMonth || isExporting}
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
  );

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
        {dialogContent}
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
      {dialogContent}
    </>
  );
};

export default EmployeesExportButton;
