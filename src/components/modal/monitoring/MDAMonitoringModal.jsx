import React, { useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  IconButton,
  Box,
  CircularProgress,
  Grid,
} from "@mui/material";
import {
  Close as CloseIcon,
  Description as DescriptionIcon,
  Print as PrintIcon,
} from "@mui/icons-material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import {
  dialogTitleStyles,
  titleBoxStyles,
  descriptionIconStyles,
  titleTypographyStyles,
  closeIconButtonStyles,
  closeIconStyles,
  dialogContentStyles,
  sectionTitleStyles,
} from "../../../components/modal/form/MDAForm/MDAFornModal.styles";
import { useGetSingleMdaSubmissionQuery } from "../../../features/api/forms/mdaApi";
import MDAFormPrinting from "../form/MDAForm/MDAFormPrinting";

const InfoSection = ({ title, children }) => (
  <Box
    sx={{
      padding: 1,
      border: "none",
      borderRadius: "4px",
      minHeight: "120px",
      height: "auto",
    }}>
    {title && (
      <Typography
        variant="subtitle2"
        sx={{
          fontWeight: "bold",
          color: "rgb(33, 61, 112)",
          marginBottom: 1.5,
          fontSize: "11px",
          textTransform: "uppercase",
          letterSpacing: "0.5px",
        }}>
        {title}
      </Typography>
    )}
    {children}
  </Box>
);

const InfoField = ({ label, value }) => (
  <Box sx={{ mb: 2 }}>
    <Typography
      variant="subtitle2"
      sx={{
        fontWeight: "bold",
        color: "rgb(33, 61, 112)",
        marginBottom: 0.5,
        fontSize: "11px",
        textTransform: "uppercase",
        letterSpacing: "0.5px",
      }}>
      {label}
    </Typography>
    <Typography
      variant="body2"
      sx={{
        fontSize: "14px",
        fontWeight: 600,
        lineHeight: 1.3,
        color: "#1a1a1a",
        overflow: "hidden",
        textOverflow: "ellipsis",
        display: "-webkit-box",
        WebkitLineClamp: 2,
        WebkitBoxOrient: "vertical",
      }}>
      {value || "-"}
    </Typography>
  </Box>
);

const MDAMonitoringModal = ({
  open = false,
  onClose,
  selectedEntry = null,
  isLoading = false,
  submissionId = null,
}) => {
  const { reset } = useFormContext();

  const [movementType, setMovementType] = useState("");
  const [formValues, setFormValues] = useState({});
  const [showPrintDialog, setShowPrintDialog] = useState(false);
  const [printData, setPrintData] = useState(null);
  const [isPrintLoading, setIsPrintLoading] = useState(false);

  const [triggerGetSubmission] = useGetSingleMdaSubmissionQuery();

  const shouldShowPrintButton = () => {
    const status = selectedEntry?.result?.status || selectedEntry?.status;
    return status === "APPROVED";
  };

  useEffect(() => {
    if (open && selectedEntry) {
      const dataSource = selectedEntry.submittable || selectedEntry;
      const fromDetails = dataSource.from_details || {};
      const toDetails = dataSource.to_details || {};

      setMovementType(dataSource.movement_type || "");

      const data = {
        form_id: selectedEntry.form?.id || 5,
        employee_movement_id: dataSource.id || null,
        employee_id: dataSource.employee_id || "",
        employee_name: dataSource.employee_name || "",
        employee_number: dataSource.employee_number || "",
        effective_date: dataSource.effective_date
          ? dayjs(dataSource.effective_date)
          : null,
        action_type: dataSource.movement_type || "",
        birth_date: dataSource.birth_date ? dayjs(dataSource.birth_date) : null,
        birth_place: dataSource.birth_place || "",
        gender: dataSource.gender || "",
        civil_status: dataSource.civil_status || "",
        nationality: dataSource.nationality || "",
        address: dataSource.address || "",
        tin_number: dataSource.tin_number || "",
        sss_number: dataSource.sss_number || "",
        pag_ibig_number: dataSource.pag_ibig_number || "",
        philhealth_number: dataSource.philhealth_number || "",
        from_position_id: fromDetails.position_id || null,
        from_position_title: fromDetails.position_title || "",
        from_department: fromDetails.department || "",
        from_sub_unit: fromDetails.sub_unit || "",
        from_job_level: fromDetails.job_level || "",
        from_schedule: fromDetails.schedule || "",
        from_job_rate: fromDetails.job_rate || "",
        from_allowance: fromDetails.allowance || "",
        to_position_id: toDetails.position_id || null,
        to_position_title: toDetails.position_title || "",
        to_department: toDetails.department || "",
        to_sub_unit: toDetails.sub_unit || "",
        to_job_level: toDetails.job_level || "",
        to_schedule: toDetails.schedule || "",
        to_job_rate: toDetails.job_rate || "",
        to_allowance: toDetails.allowance || "",
      };

      setFormValues(data);
      reset(data);
    }
  }, [open, selectedEntry, reset]);

  const formatDate = (date) => {
    if (!date) return "-";
    const d = new Date(date);
    return d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return "-";
    return `₱${parseFloat(amount).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const handlePrintClick = async () => {
    try {
      setIsPrintLoading(true);
      const submissionId = selectedEntry?.result?.id || selectedEntry?.id;

      if (!submissionId) {
        alert("Submission ID not found");
        setIsPrintLoading(false);
        return;
      }

      const response = await triggerGetSubmission(submissionId).unwrap();

      if (response) {
        setPrintData(response);
        setShowPrintDialog(true);
      }
    } catch (error) {
      alert("Failed to fetch submission data. Please try again.");
    } finally {
      setIsPrintLoading(false);
    }
  };

  const handleClosePrintDialog = () => {
    setShowPrintDialog(false);
    setPrintData(null);
  };

  const handleClose = () => {
    reset();
    setMovementType("");
    setFormValues({});
    setShowPrintDialog(false);
    setPrintData(null);
    setIsPrintLoading(false);
    onClose();
  };

  const getModalTitle = () => {
    return movementType
      ? `VIEW MDA FORM - ${movementType.toUpperCase()}`
      : "VIEW MDA FORM";
  };

  const isProcessing = isLoading || isPrintLoading;

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth={false}
        PaperProps={{
          sx: {
            width: "90vw",
            height: "90vh",
            maxWidth: "1200px",
            maxHeight: "900px",
            overflow: "hidden",
          },
        }}>
        <DialogTitle sx={dialogTitleStyles}>
          <Box sx={titleBoxStyles}>
            <DescriptionIcon sx={descriptionIconStyles} />
            <Typography variant="h6" component="div" sx={titleTypographyStyles}>
              {getModalTitle()}
            </Typography>
            {shouldShowPrintButton() && (
              <IconButton
                onClick={handlePrintClick}
                disabled={isProcessing}
                size="small"
                sx={{
                  ml: 1,
                  padding: "8px",
                  "&:hover": {
                    backgroundColor: !isProcessing
                      ? "rgba(33, 61, 112, 0.08)"
                      : "transparent",
                    transform: !isProcessing ? "scale(1.1)" : "none",
                    transition: "all 0.2s ease-in-out",
                  },
                }}>
                {isPrintLoading ? (
                  <CircularProgress size={20} />
                ) : (
                  <PrintIcon
                    sx={{
                      fontSize: "20px",
                      "& path": {
                        fill: "rgb(33, 61, 112)",
                      },
                    }}
                  />
                )}
              </IconButton>
            )}
          </Box>

          <IconButton onClick={handleClose} sx={closeIconButtonStyles}>
            <CloseIcon sx={closeIconStyles} />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={dialogContentStyles}>
          {isLoading ? (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                minHeight: "400px",
                gap: 2,
              }}>
              <CircularProgress size={48} />
              <Typography variant="body1" color="text.secondary">
                Loading MDA data...
              </Typography>
            </Box>
          ) : (
            <Grid container spacing={2}>
              <Grid item xs={12} sx={{ paddingTop: 2 }}>
                <Grid container spacing={20}>
                  <Grid item xs={12} md={3}>
                    <InfoSection>
                      <InfoField
                        label="Employee Code"
                        value={formValues.employee_number}
                      />
                      <InfoField label="Gender" value={formValues.gender} />
                      <InfoField
                        label="Nationality"
                        value={formValues.nationality}
                      />
                    </InfoSection>
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <InfoSection>
                      <InfoField
                        label="Full Name"
                        value={formValues.employee_name}
                      />
                      <InfoField
                        label="Birth Date"
                        value={formatDate(formValues.birth_date)}
                      />
                      <InfoField
                        label="Civil Status"
                        value={formValues.civil_status}
                      />
                    </InfoSection>
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <InfoSection>
                      <InfoField
                        label="Birth Place"
                        value={formValues.birth_place}
                      />
                      <InfoField
                        label="SSS Number"
                        value={formValues.sss_number}
                      />
                      <InfoField
                        label="PhilHealth Number"
                        value={formValues.philhealth_number}
                      />
                    </InfoSection>
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <InfoSection>
                      <InfoField
                        label="TIN Number"
                        value={formValues.tin_number}
                      />
                      <InfoField
                        label="Pag-IBIG Number"
                        value={formValues.pag_ibig_number}
                      />
                    </InfoSection>
                  </Grid>
                </Grid>
              </Grid>

              <Grid item xs={12} sx={{ marginTop: -3, marginBottom: -6 }}>
                <InfoSection>
                  <InfoField label="Address" value={formValues.address} />
                </InfoSection>
              </Grid>

              <Grid item xs={12}>
                <Box sx={{ display: "flex", gap: 3 }}>
                  <Box sx={{ width: "600px" }}>
                    <Typography
                      variant="h6"
                      sx={{
                        ...sectionTitleStyles,
                        marginBottom: 1,
                        marginLeft: 1,
                      }}>
                      FROM POSITION
                    </Typography>
                    <Box sx={{ display: "flex", gap: 1 }}>
                      <Box sx={{ width: "400px" }}>
                        <InfoSection>
                          <InfoField
                            label="Position"
                            value={formValues.from_position_title}
                          />
                          <InfoField
                            label="Department"
                            value={formValues.from_department}
                          />
                          <InfoField
                            label="Sub Unit"
                            value={formValues.from_sub_unit}
                          />
                        </InfoSection>
                      </Box>
                      <Box sx={{ width: "270px" }}>
                        <InfoSection>
                          <InfoField
                            label="Job Level"
                            value={formValues.from_job_level}
                          />
                          <InfoField
                            label="Job Rate"
                            value={formatCurrency(formValues.from_job_rate)}
                          />
                          <InfoField
                            label="Allowance"
                            value={formatCurrency(formValues.from_allowance)}
                          />
                        </InfoSection>
                      </Box>
                    </Box>
                  </Box>

                  <Box sx={{ width: "550px" }}>
                    <Typography
                      variant="h6"
                      sx={{
                        ...sectionTitleStyles,
                        marginBottom: 1,
                        marginLeft: 1,
                      }}>
                      TO POSITION
                    </Typography>
                    <Box sx={{ display: "flex", gap: 1 }}>
                      <Box sx={{ width: "400px" }}>
                        <InfoSection>
                          <InfoField
                            label="Position"
                            value={formValues.to_position_title}
                          />
                          <InfoField
                            label="Department"
                            value={formValues.to_department}
                          />
                          <InfoField
                            label="Sub Unit"
                            value={formValues.to_sub_unit}
                          />
                        </InfoSection>
                      </Box>
                      <Box sx={{ width: "270px" }}>
                        <InfoSection>
                          <InfoField
                            label="Job Level"
                            value={formValues.to_job_level}
                          />
                          <InfoField
                            label="Job Rate"
                            value={formatCurrency(formValues.to_job_rate)}
                          />
                          <InfoField
                            label="Allowance"
                            value={formatCurrency(formValues.to_allowance)}
                          />
                        </InfoSection>
                      </Box>
                    </Box>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          )}
        </DialogContent>

        <DialogActions
          sx={{
            padding: "16px 24px",
            borderTop: "1px solid #e0e0e0",
            backgroundColor: "#f8f9fa",
          }}>
          <Button
            onClick={handleClose}
            variant="outlined"
            sx={{
              textTransform: "uppercase",
              fontWeight: 600,
              borderColor: "rgb(33, 61, 112)",
              color: "rgb(33, 61, 112)",
              paddingX: 3,
              paddingY: 1,
              borderRadius: 2,
              "&:hover": {
                borderColor: "rgb(25, 45, 84)",
                backgroundColor: "rgba(33, 61, 112, 0.04)",
              },
            }}>
            CLOSE
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={showPrintDialog}
        onClose={handleClosePrintDialog}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            width: "90vw",
            height: "90vh",
            maxWidth: "1200px",
            maxHeight: "900px",
          },
        }}>
        <DialogTitle>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}>
            <IconButton onClick={handleClosePrintDialog}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ padding: 0, overflow: "hidden" }}>
          {printData && <MDAFormPrinting data={printData} />}
        </DialogContent>
      </Dialog>
    </LocalizationProvider>
  );
};

export default MDAMonitoringModal;
