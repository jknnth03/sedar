import React, { useEffect, useState } from "react";
import { useForm, FormProvider, Controller } from "react-hook-form";
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
  Tooltip,
  Grid,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import {
  Close as CloseIcon,
  Description as DescriptionIcon,
  Add as AddIcon,
} from "@mui/icons-material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import { useLazyGetSingleDaSubmissionQuery } from "../../../../features/api/forms/mdaDaApi";
import MDADAModal from "./MDADAModal";
import * as styles from "../DAForm/DAFormModal.styles";

const DAChangeModal = ({
  open = false,
  onClose,
  submissionId = null,
  isLoading = false,
}) => {
  const methods = useForm({
    defaultValues: {
      employee_name: "",
      from_position_title: "",
      to_position_code: "",
      to_position_title: "",
      from_department: "",
      to_department: "",
      start_date: null,
      end_date: null,
      kpis: [],
    },
  });

  const { reset, control, watch } = methods;
  const [isFormReady, setIsFormReady] = useState(false);
  const [fetchSubmission, { isLoading: isFetching }] =
    useLazyGetSingleDaSubmissionQuery();
  const [kpisList, setKpisList] = useState([]);
  const [isMDAModalOpen, setIsMDAModalOpen] = useState(false);
  const [daSubmittableId, setDaSubmittableId] = useState(null);

  const formValues = watch();

  useEffect(() => {
    const loadSubmissionData = async () => {
      if (open && submissionId) {
        setIsFormReady(false);
        try {
          const response = await fetchSubmission(submissionId).unwrap();

          if (response?.result) {
            const data = response.result;
            const submittable = data.submittable;

            const formData = {
              employee_name: submittable?.employee?.full_name || "",
              from_position_title:
                submittable?.from_position?.title?.name || "",
              to_position_code: submittable?.to_position?.code || "",
              to_position_title: submittable?.to_position?.title?.name || "",
              from_department:
                submittable?.from_position?.charging?.department_name || "-",
              to_department:
                submittable?.to_position?.charging?.department_name || "-",
              start_date: submittable?.start_date
                ? dayjs(submittable.start_date)
                : null,
              end_date: submittable?.end_date
                ? dayjs(submittable.end_date)
                : null,
              kpis: submittable?.objectives || [],
            };

            reset(formData);
            setKpisList(submittable?.objectives || []);
            setDaSubmittableId(submittable?.id || null);

            setTimeout(() => {
              setIsFormReady(true);
            }, 50);
          }
        } catch (error) {
          alert("Failed to load DA submission data. Please try again.");
        }
      }
    };

    loadSubmissionData();
  }, [open, submissionId, fetchSubmission, reset]);

  const handleCreateMDA = () => {
    setIsMDAModalOpen(true);
  };

  const handleMDAModalClose = () => {
    setIsMDAModalOpen(false);
    handleClose();
  };

  const handleClose = () => {
    reset();
    setIsFormReady(false);
    setKpisList([]);
    setDaSubmittableId(null);
    onClose();
  };

  const formatDate = (date) => {
    if (!date) return "-";
    return dayjs(date).format("MMMM DD, YYYY");
  };

  const isProcessing = isLoading || isFetching;

  return (
    <>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <FormProvider {...methods}>
          <Dialog
            open={open}
            onClose={handleClose}
            maxWidth={false}
            PaperProps={{ sx: styles.dialogPaperStyles }}>
            <DialogTitle sx={styles.dialogTitleStyles}>
              <Box sx={styles.titleBoxStyles}>
                <DescriptionIcon sx={styles.descriptionIconStyles} />
                <Typography
                  variant="h6"
                  component="div"
                  sx={styles.titleTypographyStyles}>
                  VIEW DA FORM
                </Typography>
              </Box>
              <IconButton
                onClick={handleClose}
                sx={styles.closeIconButtonStyles}>
                <CloseIcon sx={styles.closeIconStyles} />
              </IconButton>
            </DialogTitle>

            <DialogContent sx={styles.dialogContentStyles}>
              {isFormReady ? (
                <Grid container spacing={3} sx={{ height: "100%" }}>
                  <Grid item xs={12}>
                    <Typography variant="h6" sx={styles.sectionTitleStyles}>
                      EMPLOYEE INFORMATION
                    </Typography>
                    <Box
                      sx={{
                        p: 3.5,
                        borderRadius: 2,
                      }}>
                      <Grid container spacing={2}>
                        <Grid item xs={12}>
                          <TextField
                            label="EMPLOYEE NAME"
                            value={formValues.employee_name || ""}
                            disabled
                            sx={{ bgcolor: "white", width: "348px" }}
                          />
                        </Grid>

                        <Grid item xs={12} md={6}>
                          <TextField
                            label="POSITION - FROM"
                            value={formValues.from_position_title || ""}
                            disabled
                            sx={{ bgcolor: "white", width: "348px" }}
                          />
                        </Grid>

                        <Grid item xs={12} md={6}>
                          <TextField
                            label="POSITION - TO"
                            value={
                              formValues.to_position_code &&
                              formValues.to_position_title
                                ? `${formValues.to_position_code} - ${formValues.to_position_title}`
                                : ""
                            }
                            disabled
                            sx={{ bgcolor: "white", width: "348px" }}
                          />
                        </Grid>

                        <Grid item xs={12} md={6}>
                          <TextField
                            label="DEPARTMENT - FROM"
                            value={formValues.from_department || "-"}
                            disabled
                            sx={{ bgcolor: "white", width: "348px" }}
                          />
                        </Grid>

                        <Grid item xs={12} md={6}>
                          <TextField
                            label="DEPARTMENT - TO"
                            value={formValues.to_department || "-"}
                            disabled
                            sx={{ bgcolor: "white", width: "348px" }}
                          />
                        </Grid>

                        <Grid item xs={12} md={6}>
                          <TextField
                            label="INCLUSIVE DATES - FROM"
                            value={formatDate(formValues.start_date)}
                            disabled
                            sx={{ bgcolor: "white", width: "348px" }}
                          />
                        </Grid>

                        <Grid item xs={12} md={6}>
                          <TextField
                            label="INCLUSIVE DATES - TO"
                            value={formatDate(formValues.end_date)}
                            disabled
                            sx={{ bgcolor: "white", width: "348px" }}
                          />
                        </Grid>
                      </Grid>
                    </Box>
                  </Grid>

                  <Grid item xs={12}>
                    <Typography variant="h6" sx={styles.sectionTitleStyles}>
                      PART I - SETTING OF OBJECTIVES
                    </Typography>

                    {kpisList.length > 0 ? (
                      <TableContainer
                        component={Paper}
                        sx={{
                          width: 1140,
                        }}>
                        <Table>
                          <TableHead>
                            <TableRow sx={{ bgcolor: "#f5f5f5" }}>
                              <TableCell
                                sx={{
                                  fontWeight: 700,
                                  width: "50%",
                                }}>
                                PERFORMANCE METRICS
                              </TableCell>
                              <TableCell
                                align="center"
                                sx={{
                                  fontWeight: 700,
                                  width: "50%",
                                }}>
                                ASSESSMENT
                                <br />
                                <span
                                  style={{
                                    fontSize: "0.75rem",
                                    fontStyle: "italic",
                                  }}>
                                  (to be filled up 30 days before end of DA)
                                </span>
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell
                                sx={{ borderRight: "1px solid #e0e0e0" }}>
                                <Box sx={{ display: "flex", gap: 1 }}>
                                  <Box sx={{ flex: 1, fontWeight: 600 }}>
                                    Key Performance Indicators
                                  </Box>
                                  <Box
                                    sx={{
                                      flex: 1,
                                      textAlign: "center",
                                      fontWeight: 600,
                                    }}>
                                    Target
                                  </Box>
                                </Box>
                              </TableCell>
                              <TableCell
                                sx={{ borderRight: "1px solid #e0e0e0" }}>
                                <Box sx={{ display: "flex", gap: 1 }}>
                                  <Box
                                    sx={{
                                      flex: 1,
                                      textAlign: "center",
                                      fontWeight: 600,
                                    }}>
                                    Actual
                                  </Box>
                                  <Box
                                    sx={{
                                      flex: 1,
                                      textAlign: "center",
                                      fontWeight: 600,
                                    }}>
                                    Remarks
                                  </Box>
                                </Box>
                              </TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {kpisList.map((kpi, index) => (
                              <TableRow key={index}>
                                <TableCell
                                  sx={{ borderRight: "1px solid #e0e0e0" }}>
                                  <Box sx={{ display: "flex", gap: 1 }}>
                                    <Box sx={{ flex: 1 }}>
                                      <Typography
                                        variant="body2"
                                        sx={{ fontWeight: 600, mb: 1 }}>
                                        {kpi.objective_name}
                                      </Typography>
                                      <Typography
                                        variant="caption"
                                        sx={{
                                          color: "text.secondary",
                                          display: "block",
                                        }}>
                                        {kpi.deliverable}
                                      </Typography>
                                      <Typography
                                        variant="caption"
                                        sx={{
                                          color: "text.secondary",
                                          display: "block",
                                          mt: 1,
                                        }}>
                                        Distribution:{" "}
                                        {kpi.distribution_percentage}%
                                      </Typography>
                                    </Box>
                                    <Box sx={{ flex: 1, textAlign: "center" }}>
                                      {kpi.target_percentage}%
                                    </Box>
                                  </Box>
                                </TableCell>
                                <TableCell
                                  sx={{ borderRight: "1px solid #e0e0e0" }}>
                                  <Box sx={{ display: "flex", gap: 1 }}>
                                    <Box sx={{ flex: 1, textAlign: "center" }}>
                                      {kpi.actual_performance !== null &&
                                      kpi.actual_performance !== undefined
                                        ? `${kpi.actual_performance}%`
                                        : "-"}
                                    </Box>
                                    <Box sx={{ flex: 1, textAlign: "center" }}>
                                      {kpi.remarks || "-"}
                                    </Box>
                                  </Box>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    ) : (
                      <Box
                        sx={{
                          textAlign: "center",
                          py: 6,
                          borderRadius: 2,
                          border: "2px dashed",
                          borderColor: "divider",
                          display: "flex",
                          flexDirection: "column",
                          justifyContent: "center",
                          alignItems: "center",
                          width: 1140,
                          minHeight: "50px",
                        }}>
                        <Typography
                          variant="body1"
                          sx={{ color: "text.secondary", fontWeight: 500 }}>
                          No KPIs available
                        </Typography>
                      </Box>
                    )}
                  </Grid>
                </Grid>
              ) : (
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    minHeight: "400px",
                  }}>
                  <CircularProgress />
                </Box>
              )}
            </DialogContent>

            <DialogActions sx={styles.dialogActionsStyles}>
              <Button
                onClick={handleCreateMDA}
                variant="contained"
                disabled={isProcessing || !isFormReady}
                startIcon={
                  isProcessing ? <CircularProgress size={16} /> : <AddIcon />
                }
                sx={styles.saveButtonStyles}>
                Create MDA
              </Button>
            </DialogActions>
          </Dialog>
        </FormProvider>
      </LocalizationProvider>

      <MDADAModal
        open={isMDAModalOpen}
        onClose={handleMDAModalClose}
        daSubmissionId={daSubmittableId}
        onSave={async (formData) => {
          try {
            handleMDAModalClose();
          } catch (error) {}
        }}
      />
    </>
  );
};

export default DAChangeModal;
