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
  AttachFile as AttachFileIcon,
  Visibility as VisibilityIcon,
} from "@mui/icons-material";
import CloseIconMui from "@mui/icons-material/Close";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import { useLazyGetSingleDaSubmissionQuery } from "../../../../features/api/forms/mdaDaApi";
import { useGetKpiAttachmentQuery } from "../../../../features/api/evaluation/kpiApi";
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
  const [toPositionId, setToPositionId] = useState(null);
  const [attachmentFilename, setAttachmentFilename] =
    useState("KPI Attachment");

  const [fileViewerOpen, setFileViewerOpen] = useState(false);
  const [fetchAttachment, setFetchAttachment] = useState(false);
  const [fileUrl, setFileUrl] = useState(null);

  const formValues = watch();

  const {
    data: attachmentData,
    isLoading: attachmentLoading,
    error: attachmentFetchError,
  } = useGetKpiAttachmentQuery(toPositionId, {
    skip: !fetchAttachment || !toPositionId || !fileViewerOpen,
  });

  useEffect(() => {
    if (!fileViewerOpen) {
      if (fileUrl) {
        URL.revokeObjectURL(fileUrl);
        setFileUrl(null);
      }
      return;
    }
    if (attachmentLoading) return;
    if (attachmentFetchError) return;
    if (attachmentData instanceof Blob) {
      if (fileUrl) URL.revokeObjectURL(fileUrl);
      setFileUrl(URL.createObjectURL(attachmentData));
    }
  }, [fileViewerOpen, attachmentData, attachmentLoading, attachmentFetchError]);

  const handleViewFile = () => {
    if (!toPositionId) return;
    setFileUrl(null);
    setFetchAttachment(true);
    setFileViewerOpen(true);
  };

  const handleCloseViewer = () => {
    setFileViewerOpen(false);
    setFetchAttachment(false);
    if (fileUrl) {
      URL.revokeObjectURL(fileUrl);
      setFileUrl(null);
    }
  };

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
            setToPositionId(
              submittable?.to_position_id ||
                submittable?.to_position?.id ||
                null,
            );
            setAttachmentFilename(
              submittable?.kpis_attachment?.filename ||
                submittable?.to_position?.kpi_attachment_file_name ||
                "KPI Attachment",
            );

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
    setToPositionId(null);
    setAttachmentFilename("KPI Attachment");
    setFileViewerOpen(false);
    setFetchAttachment(false);
    if (fileUrl) {
      URL.revokeObjectURL(fileUrl);
      setFileUrl(null);
    }
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
                    <Box sx={{ p: 3.5, borderRadius: 2 }}>
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
                      KPI ATTACHMENT
                    </Typography>
                    <Box
                      sx={{
                        border: toPositionId
                          ? "2px solid #ddd"
                          : "2px dashed #ddd",
                        borderRadius: 2,
                        p: 2,
                        backgroundColor: toPositionId ? "#fff" : "#fafafa",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        width: 1140,
                      }}>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1.5,
                        }}>
                        <AttachFileIcon
                          sx={{
                            color: toPositionId ? "#1976d2" : "#bbb",
                            fontSize: 24,
                          }}
                        />
                        <Box>
                          {toPositionId ? (
                            <>
                              <Typography
                                sx={{
                                  fontWeight: 600,
                                  color: "rgb(33, 61, 112)",
                                  fontSize: "0.9rem",
                                }}>
                                File name:{" "}
                                <span style={{ color: "#f44336" }}>
                                  {attachmentFilename}
                                </span>
                              </Typography>
                              <Typography
                                variant="caption"
                                sx={{ color: "#666", fontSize: "11px" }}>
                                Click VIEW to preview the file
                              </Typography>
                            </>
                          ) : (
                            <Typography
                              sx={{
                                fontWeight: 600,
                                color: "#9ca3af",
                                fontSize: "0.9rem",
                              }}>
                              No KPI attachment available
                            </Typography>
                          )}
                        </Box>
                      </Box>

                      {toPositionId && (
                        <IconButton
                          size="small"
                          onClick={handleViewFile}
                          sx={{
                            border: "1px solid #1976d2",
                            color: "#1976d2",
                            borderRadius: 1,
                            px: 1.5,
                            gap: 0.5,
                            "&:hover": { backgroundColor: "#e3f2fd" },
                          }}>
                          <VisibilityIcon fontSize="small" />
                          <Typography
                            variant="caption"
                            sx={{ fontWeight: 600 }}>
                            VIEW
                          </Typography>
                        </IconButton>
                      )}
                    </Box>
                  </Grid>

                  <Grid item xs={12}>
                    <Typography variant="h6" sx={styles.sectionTitleStyles}>
                      PART I - SETTING OF OBJECTIVES
                    </Typography>

                    {kpisList.length > 0 ? (
                      <TableContainer component={Paper} sx={{ width: 1140 }}>
                        <Table>
                          <TableHead>
                            <TableRow sx={{ bgcolor: "#f5f5f5" }}>
                              <TableCell sx={{ fontWeight: 700, width: "50%" }}>
                                PERFORMANCE METRICS
                              </TableCell>
                              <TableCell
                                align="center"
                                sx={{ fontWeight: 700, width: "50%" }}>
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

      <Dialog
        open={fileViewerOpen}
        onClose={handleCloseViewer}
        maxWidth={false}
        PaperProps={{
          sx: {
            width: "77vw",
            height: "92vh",
            maxWidth: "80vw",
            maxHeight: "92vh",
            borderRadius: 2,
          },
        }}>
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: "1px solid",
            borderColor: "divider",
            py: 1.5,
            backgroundColor: "#f8f9fa",
          }}>
          <Typography variant="h6" sx={{ fontWeight: 600, fontSize: "1rem" }}>
            {attachmentFilename}
          </Typography>
          <IconButton size="small" onClick={handleCloseViewer}>
            <CloseIconMui />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 0, height: "100%", overflow: "hidden" }}>
          {attachmentLoading ? (
            <Box
              display="flex"
              justifyContent="center"
              alignItems="center"
              height="100%"
              flexDirection="column"
              gap={2}>
              <CircularProgress size={48} />
              <Typography variant="body1" color="text.secondary">
                Loading attachment...
              </Typography>
            </Box>
          ) : attachmentFetchError ? (
            <Box
              display="flex"
              justifyContent="center"
              alignItems="center"
              height="100%"
              flexDirection="column"
              gap={1}>
              <Typography variant="h6" color="error">
                Error loading attachment
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Unable to load the file. Please try again.
              </Typography>
            </Box>
          ) : fileUrl ? (
            <iframe
              src={fileUrl}
              width="100%"
              height="100%"
              style={{ border: "none" }}
              title="KPI Attachment"
            />
          ) : (
            <Box
              display="flex"
              justifyContent="center"
              alignItems="center"
              height="100%"
              flexDirection="column"
              gap={1}>
              <AttachFileIcon sx={{ fontSize: 64, color: "text.secondary" }} />
              <Typography variant="h6" color="text.secondary">
                {attachmentFilename}
              </Typography>
            </Box>
          )}
        </DialogContent>
      </Dialog>

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
