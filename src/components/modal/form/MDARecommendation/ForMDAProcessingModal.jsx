import React, { useState, useEffect } from "react";
import { useForm, FormProvider } from "react-hook-form";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Button,
  Typography,
  IconButton,
  CircularProgress,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  Checkbox,
  FormControlLabel,
} from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import {
  Close as CloseIcon,
  Description as DescriptionIcon,
  CheckCircle as CheckCircleIcon,
  Edit as EditIcon,
} from "@mui/icons-material";
import dayjs from "dayjs";
import { useSnackbar } from "notistack";
import {
  useGetSingleRecommendationSubmissionQuery,
  useLazyGetMdaRecommendationPrefillQuery,
} from "../../../../features/api/forms/mdaRecommendationApi";
import {
  dialogPaperStyles,
  dialogTitleStyles,
  titleBoxStyles,
  descriptionIconStyles,
  titleTypographyStyles,
  closeIconButtonStyles,
  closeIconStyles,
  dialogContentStyles,
  dialogActionsStyles,
  sectionTitleStyles,
} from "../MDAForm/MDAFornModal.styles";

const ForMDAProcessingModal = ({
  open = false,
  onClose,
  submissionId = null,
  mode = "view",
  selectedEntry = null,
  onModeChange,
  isLoading = false,
  onCreateMDA,
}) => {
  const { enqueueSnackbar } = useSnackbar();
  const [previousSubmissionId, setPreviousSubmissionId] = useState(null);
  const [getMdaRecommendationPrefill] =
    useLazyGetMdaRecommendationPrefillQuery();

  const methods = useForm({
    defaultValues: {},
  });

  const { reset } = methods;

  const shouldSkip = !open || !submissionId;

  const {
    data: fetchedSubmissionData,
    isLoading: isSubmissionLoading,
    error: submissionError,
    refetch,
  } = useGetSingleRecommendationSubmissionQuery(submissionId, {
    skip: shouldSkip,
  });

  console.log("Query state:", {
    open,
    submissionId,
    previousSubmissionId,
    hasData: !!fetchedSubmissionData,
    isLoading: isSubmissionLoading,
    error: !!submissionError,
    shouldSkip,
  });

  useEffect(() => {
    if (!open) {
      reset();
      setPreviousSubmissionId(null);
    }
  }, [open, reset]);

  useEffect(() => {
    if (open && submissionId && submissionId !== previousSubmissionId) {
      console.log("Refetching for new submission ID:", submissionId);
      setPreviousSubmissionId(submissionId);
      refetch();
    }
  }, [open, submissionId, previousSubmissionId, refetch]);

  const handleClose = () => {
    onClose();
  };

  const handleCreateMDA = async () => {
    if (fetchedSubmissionData?.result?.submittable) {
      const submittableId = fetchedSubmissionData.result.submittable.id;

      try {
        const prefillResponse = await getMdaRecommendationPrefill(
          submittableId
        ).unwrap();

        if (onCreateMDA) {
          onCreateMDA({
            id: submittableId,
            reference_number:
              fetchedSubmissionData.result.submittable.reference_number,
            prefillData: prefillResponse?.result || null,
          });
        }

        handleClose();
      } catch (error) {
        console.error("Error fetching prefill data:", error);
        enqueueSnackbar("Failed to load prefill data", { variant: "error" });
      }
    }
  };

  const showLoadingState = isSubmissionLoading || isLoading;
  const submissionData = fetchedSubmissionData?.result;

  const getRecommendationCheckbox = () => {
    const recommendation = submissionData?.submittable?.final_recommendation;
    return {
      forPermanent:
        recommendation === "FOR PERMANENT" ||
        recommendation === "For Permanent",
      notForPermanent:
        recommendation === "NOT FOR PERMANENT" ||
        recommendation === "Not for Permanent",
      forExtension:
        recommendation === "FOR EXTENSION" ||
        recommendation === "For Extension",
    };
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <FormProvider {...methods}>
        <Dialog
          open={open}
          onClose={handleClose}
          maxWidth={false}
          PaperProps={{ sx: dialogPaperStyles }}>
          <DialogTitle sx={dialogTitleStyles}>
            <Box sx={titleBoxStyles}>
              <DescriptionIcon sx={descriptionIconStyles} />
              <Typography
                variant="h6"
                component="div"
                sx={titleTypographyStyles}>
                VIEW DA RECOMMENDATION
              </Typography>
              {mode === "view" && (
                <IconButton
                  onClick={() => onModeChange && onModeChange("edit")}
                  size="small"
                  sx={{ ml: 2 }}>
                  <EditIcon />
                </IconButton>
              )}
            </Box>
            <IconButton onClick={handleClose} sx={closeIconButtonStyles}>
              <CloseIcon sx={closeIconStyles} />
            </IconButton>
          </DialogTitle>

          <DialogContent sx={dialogContentStyles}>
            {showLoadingState ? (
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
                  Loading submission details...
                </Typography>
              </Box>
            ) : submissionError ? (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  minHeight: "400px",
                }}>
                <Typography color="error">
                  Failed to load data. Please try again.
                </Typography>
              </Box>
            ) : submissionData ? (
              <Grid container spacing={3} sx={{ height: "100%" }}>
                <Grid item xs={12}>
                  <Typography variant="h6" sx={sectionTitleStyles}>
                    EMPLOYEE INFORMATION
                  </Typography>
                  <Box
                    sx={{
                      p: 3.5,
                      borderRadius: 2,
                    }}>
                    <TextField
                      label="EMPLOYEE NAME"
                      value={
                        submissionData.submittable?.employee?.full_name || ""
                      }
                      disabled
                      fullWidth
                      sx={{ bgcolor: "white", mb: 2 }}
                    />

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
                      }}>
                      <Box>
                        <TextField
                          label="POSITION - FROM"
                          value={
                            submissionData.submittable?.from_position?.title
                              ?.name || ""
                          }
                          disabled
                          fullWidth
                          sx={{ bgcolor: "white" }}
                        />

                        <TextField
                          label="DEPARTMENT - FROM"
                          value={
                            submissionData.submittable?.from_position?.charging
                              ?.department_name || "-"
                          }
                          disabled
                          fullWidth
                          sx={{ bgcolor: "white", mt: 2 }}
                        />

                        <TextField
                          label="INCLUSIVE DATES - FROM"
                          value={
                            submissionData.submittable?.start_date
                              ? dayjs(
                                  submissionData.submittable.start_date
                                ).format("MM/DD/YYYY")
                              : ""
                          }
                          disabled
                          fullWidth
                          sx={{ bgcolor: "white", mt: 2 }}
                        />
                      </Box>

                      <Box>
                        <TextField
                          label="POSITION - TO"
                          value={
                            submissionData.submittable?.to_position?.code &&
                            submissionData.submittable?.to_position?.title?.name
                              ? `${submissionData.submittable.to_position.code} - ${submissionData.submittable.to_position.title.name}`
                              : ""
                          }
                          disabled
                          fullWidth
                          sx={{ bgcolor: "white" }}
                        />

                        <TextField
                          label="DEPARTMENT - TO"
                          value={
                            submissionData.submittable?.to_position?.charging
                              ?.department_name || "-"
                          }
                          disabled
                          fullWidth
                          sx={{ bgcolor: "white", mt: 2 }}
                        />

                        <TextField
                          label="INCLUSIVE DATES - TO"
                          value={
                            submissionData.submittable?.end_date
                              ? dayjs(
                                  submissionData.submittable.end_date
                                ).format("MM/DD/YYYY")
                              : ""
                          }
                          disabled
                          fullWidth
                          sx={{ bgcolor: "white", mt: 2 }}
                        />
                      </Box>
                    </Box>
                  </Box>
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="h6" sx={sectionTitleStyles}>
                    PART I - SETTING OF OBJECTIVES
                  </Typography>

                  {submissionData.submittable?.objectives &&
                  submissionData.submittable.objectives.length > 0 ? (
                    <TableContainer
                      component={Paper}
                      sx={{
                        width: "100%",
                        overflowX: "auto",
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
                          {submissionData.submittable.objectives.map(
                            (objective, index) => (
                              <TableRow key={objective.id}>
                                <TableCell
                                  sx={{
                                    borderRight: "1px solid #e0e0e0",
                                  }}>
                                  <Box sx={{ display: "flex", gap: 1 }}>
                                    <Box sx={{ flex: 1 }}>
                                      <Typography
                                        variant="body2"
                                        sx={{ fontWeight: 600, mb: 1 }}>
                                        {objective.objective_name}
                                      </Typography>
                                      <Typography
                                        variant="caption"
                                        sx={{
                                          color: "text.secondary",
                                          display: "block",
                                        }}>
                                        {objective.deliverable}
                                      </Typography>
                                    </Box>
                                    <Box sx={{ flex: 1, textAlign: "center" }}>
                                      <TextField
                                        size="small"
                                        type="number"
                                        value={objective.target_percentage}
                                        inputProps={{
                                          min: 0,
                                          max: 100,
                                          step: "any",
                                        }}
                                        sx={{ width: "80px" }}
                                        disabled
                                      />
                                    </Box>
                                  </Box>
                                </TableCell>
                                <TableCell
                                  sx={{
                                    borderRight: "1px solid #e0e0e0",
                                  }}>
                                  <Box sx={{ display: "flex", gap: 1 }}>
                                    <Box sx={{ flex: 1, textAlign: "center" }}>
                                      <TextField
                                        size="small"
                                        type="number"
                                        value={
                                          objective.actual_performance || ""
                                        }
                                        inputProps={{
                                          min: 0,
                                          max: 100,
                                          step: "any",
                                        }}
                                        sx={{ width: "80px" }}
                                        disabled
                                      />
                                    </Box>
                                    <Box sx={{ flex: 1, textAlign: "center" }}>
                                      <TextField
                                        size="small"
                                        value={objective.remarks || ""}
                                        sx={{ width: "100%" }}
                                        disabled
                                        multiline
                                      />
                                    </Box>
                                  </Box>
                                </TableCell>
                              </TableRow>
                            )
                          )}
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
                        width: "100%",
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

                <Grid item xs={12}>
                  <Typography variant="h6" sx={sectionTitleStyles}>
                    PART II - RECOMMENDATION
                  </Typography>
                  <Box
                    sx={{
                      p: 3.5,
                      borderRadius: 2,
                    }}>
                    <Typography
                      variant="body2"
                      sx={{
                        fontStyle: "italic",
                        color: "text.secondary",
                        mb: 2,
                      }}>
                      (To be accomplished 30 days before the end of DA)
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 2, fontWeight: 600 }}>
                      Please tick:
                    </Typography>
                    <Box
                      sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={getRecommendationCheckbox().forPermanent}
                            disabled
                          />
                        }
                        label="For Permanent Appointment"
                      />
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={
                              getRecommendationCheckbox().notForPermanent
                            }
                            disabled
                          />
                        }
                        label="NOT for permanent appointment at this time"
                      />
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={getRecommendationCheckbox().forExtension}
                            disabled
                          />
                        }
                        label="For extension until"
                      />
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            ) : null}
          </DialogContent>

          <DialogActions sx={dialogActionsStyles}>
            {submissionData?.status === "PENDING FINAL MDA" && (
              <Button
                onClick={handleCreateMDA}
                variant="contained"
                startIcon={<CheckCircleIcon />}
                sx={{
                  backgroundColor: "#4caf50",
                  color: "white",
                  textTransform: "uppercase",
                  fontWeight: 600,
                  paddingX: 3,
                  paddingY: 1,
                  borderRadius: 2,
                  "&:hover": {
                    backgroundColor: "#388e3c",
                  },
                }}>
                Create MDA
              </Button>
            )}
          </DialogActions>
        </Dialog>
      </FormProvider>
    </LocalizationProvider>
  );
};

export default ForMDAProcessingModal;
