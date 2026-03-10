import React, { useEffect, useState, useRef } from "react";
import { Controller, useFormContext } from "react-hook-form";
import {
  TextField,
  Typography,
  Box,
  Autocomplete,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import {
  Visibility as VisibilityIcon,
  Close as CloseIcon,
  AttachFile as AttachFileIcon,
} from "@mui/icons-material";
import dayjs from "dayjs";
import { sectionTitleStyles } from "./DAFormModal.styles";
import {
  useLazyGetPositionKpisQuery,
  useGetAllEmployeesDaQuery,
} from "../../../../features/api/forms/daformApi";
import { useGetAllEmployeeMovementSubmissionsQuery } from "../../../../features/api/approvalsetting/formSubmissionApi";
import { useGetKpiAttachmentQuery } from "../../../../features/api/evaluation/kpiApi";

const DAFormModalFields = ({
  isCreate,
  isReadOnly,
  currentMode,
  selectedEntry,
}) => {
  const {
    control,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext();

  const formValues = watch();
  const [selectedMrf, setSelectedMrf] = useState(null);
  const [kpisList, setKpisList] = useState([]);
  const [shouldFetchMrf, setShouldFetchMrf] = useState(false);
  const [isKpisLoading, setIsKpisLoading] = useState(false);
  const [hasSyncedMrf, setHasSyncedMrf] = useState(false);

  const [fileViewerOpen, setFileViewerOpen] = useState(false);
  const [fileUrl, setFileUrl] = useState(null);
  const [fetchAttachment, setFetchAttachment] = useState(false);

  const isInitialMount = useRef(true);
  const prevModeRef = useRef(currentMode);
  const prevSelectedMrfRef = useRef(null);

  const { data: mrfData, isLoading: isMrfLoading } =
    useGetAllEmployeeMovementSubmissionsQuery(
      { status: "active" },
      { skip: !shouldFetchMrf },
    );

  const [fetchPositionKpis] = useLazyGetPositionKpisQuery();

  const positionId = formValues.to_position_id || null;
  const {
    data: attachmentData,
    isLoading: attachmentLoading,
    error: attachmentFetchError,
  } = useGetKpiAttachmentQuery(positionId, {
    skip: !fetchAttachment || !positionId || !fileViewerOpen,
  });

  const mrfSubmissions = Array.isArray(mrfData?.result?.data)
    ? mrfData.result.data
    : Array.isArray(mrfData?.result)
      ? mrfData.result
      : [];

  useEffect(() => {
    if (!isCreate) {
      setShouldFetchMrf(true);
    }
  }, [isCreate]);

  useEffect(() => {
    if (!isCreate && currentMode !== prevModeRef.current) {
      isInitialMount.current = true;
      setHasSyncedMrf(false);
      prevModeRef.current = currentMode;
    }
  }, [currentMode, isCreate]);

  useEffect(() => {
    if (!isCreate && formValues.kpis && Array.isArray(formValues.kpis)) {
      if (isInitialMount.current && formValues.kpis.length > 0) {
        setKpisList(formValues.kpis);
        isInitialMount.current = false;
      }
    }
  }, [isCreate, formValues.kpis]);

  useEffect(() => {
    if (
      !isCreate &&
      formValues.approved_mrf_id &&
      mrfSubmissions.length > 0 &&
      !hasSyncedMrf
    ) {
      let matchingMrf = mrfSubmissions.find(
        (mrf) => mrf.id === formValues.approved_mrf_id,
      );

      if (!matchingMrf && selectedEntry) {
        const mrfDetails =
          selectedEntry?.mrf_details || selectedEntry?.result?.mrf_details;
        if (mrfDetails && mrfDetails.id === formValues.approved_mrf_id) {
          matchingMrf = {
            id: mrfDetails.id,
            submission_title:
              mrfDetails.linked_mrf_title || mrfDetails.reference_number,
          };
        }
      }

      if (matchingMrf) {
        setSelectedMrf(matchingMrf);
        setHasSyncedMrf(true);
      }
    }
  }, [
    isCreate,
    currentMode,
    formValues.approved_mrf_id,
    mrfSubmissions,
    hasSyncedMrf,
    selectedEntry,
  ]);

  useEffect(() => {
    const loadMrfData = async () => {
      const mrfChanged =
        prevSelectedMrfRef.current !== null &&
        prevSelectedMrfRef.current?.id !== selectedMrf?.id;

      if (selectedMrf && (isCreate || (!isReadOnly && mrfChanged))) {
        setValue("approved_mrf_id", selectedMrf.id);
        setValue("mrf_reference_number", selectedMrf.submission_title || "");
        setValue("employee_id", selectedMrf.employee_id || "");
        setValue("employee_name", selectedMrf.employee_name || "");
        setValue("from_position_id", selectedMrf.from_position?.id || "");
        setValue("from_position_title", selectedMrf.from_position?.title || "");
        setValue(
          "from_department",
          selectedMrf.from_position?.department || "-",
        );
        setValue("to_position_id", selectedMrf.to_position?.id || "");
        setValue("to_position_title", selectedMrf.to_position?.title || "");
        setValue("to_department", selectedMrf.to_position?.department || "-");

        if (selectedMrf.da_start_date) {
          setValue("start_date", dayjs(selectedMrf.da_start_date));
        }
        if (selectedMrf.da_end_date) {
          setValue("end_date", dayjs(selectedMrf.da_end_date));
        }

        if (selectedMrf.to_position?.id) {
          try {
            setIsKpisLoading(true);
            const kpisResponse = await fetchPositionKpis(
              selectedMrf.to_position.id,
            ).unwrap();

            const kpisData = kpisResponse?.result?.kpis || [];
            const attachmentUrl =
              kpisResponse?.result?.kpi_download_url || null;
            const attachmentFileName =
              kpisResponse?.result?.kpi_attachment_file_name || null;

            setValue("kpi_attachment_url", attachmentUrl);
            setValue("kpi_attachment_filename", attachmentFileName);

            if (kpisData.length > 0) {
              const mappedKpis = kpisData.map((kpi) => ({
                source_kpi_id: kpi.id,
                objective_id: kpi.objective_id,
                objective_name: kpi.objective_name,
                distribution_percentage: kpi.distribution_percentage,
                deliverable: kpi.deliverable,
                target_percentage: kpi.target_percentage,
              }));
              setKpisList(mappedKpis);
              setValue("kpis", mappedKpis);
            } else {
              setKpisList([]);
              setValue("kpis", []);
            }
          } catch (error) {
            setKpisList([]);
            setValue("kpis", []);
          } finally {
            setIsKpisLoading(false);
          }
        }
      }

      prevSelectedMrfRef.current = selectedMrf;
    };

    loadMrfData();
  }, [selectedMrf, setValue, fetchPositionKpis, isCreate, isReadOnly]);

  useEffect(() => {
    if (!isCreate && formValues.kpis?.length > 0 && kpisList.length === 0) {
      setKpisList(formValues.kpis);
    }
  }, [isCreate, formValues.kpis]);

  const handleMrfOpen = () => {
    setShouldFetchMrf(true);
  };

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
    if (!formValues.kpi_attachment_url) return;
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

  const attachmentUrl = formValues.kpi_attachment_url;
  const attachmentFilename =
    formValues.kpi_attachment_filename || "KPI Attachment";

  return (
    <Box sx={{ height: "100%" }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" sx={sectionTitleStyles}>
          EMPLOYEE INFORMATION
        </Typography>
        <Box sx={{ p: 0, pb: 0, borderRadius: 2 }}>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                "@media (min-width: 750px)": "repeat(2, 1fr)",
              },
              gap: 2,
            }}>
            <Box>
              {!isReadOnly ? (
                <Autocomplete
                  options={mrfSubmissions}
                  getOptionLabel={(option) => option.submission_title || ""}
                  loading={isMrfLoading}
                  value={selectedMrf}
                  onChange={(event, newValue) => setSelectedMrf(newValue)}
                  onOpen={handleMrfOpen}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label={
                        <span>
                          MRF <span style={{ color: "red" }}>*</span>
                        </span>
                      }
                      fullWidth
                      error={!!errors.approved_mrf_id}
                      helperText={errors.approved_mrf_id?.message}
                      InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                          <>
                            {isMrfLoading ? (
                              <CircularProgress color="inherit" size={20} />
                            ) : null}
                            {params.InputProps.endAdornment}
                          </>
                        ),
                      }}
                      sx={{ bgcolor: "white" }}
                    />
                  )}
                />
              ) : (
                <TextField
                  label="MRF"
                  value={formValues.mrf_reference_number || ""}
                  disabled
                  fullWidth
                  sx={{ bgcolor: "white" }}
                />
              )}
            </Box>

            <Box>
              <TextField
                label="Employee Name"
                value={formValues.employee_name || ""}
                disabled
                fullWidth
                sx={{ bgcolor: "white" }}
              />
            </Box>

            <Box>
              <TextField
                label="Position - From"
                value={formValues.from_position_title || ""}
                disabled
                fullWidth
                sx={{ bgcolor: "white" }}
              />
            </Box>

            <Box>
              <TextField
                label="Position - To"
                value={formValues.to_position_title || ""}
                disabled
                fullWidth
                sx={{ bgcolor: "white" }}
              />
            </Box>

            <Box>
              <TextField
                label="Department - From"
                value={formValues.from_department || "-"}
                disabled
                fullWidth
                sx={{ bgcolor: "white" }}
              />
            </Box>

            <Box>
              <TextField
                label="Department - To"
                value={formValues.to_department || "-"}
                disabled
                fullWidth
                sx={{ bgcolor: "white" }}
              />
            </Box>
          </Box>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                "@media (min-width: 750px)": "repeat(2, 1fr)",
              },
              gap: 3,
              mt: 2,
            }}>
            <Box>
              <Controller
                name="start_date"
                control={control}
                render={({ field }) => (
                  <DatePicker
                    {...field}
                    value={
                      field.value && dayjs.isDayjs(field.value)
                        ? field.value
                        : field.value
                          ? dayjs(field.value)
                          : null
                    }
                    label={
                      <span>
                        Inclusive Dates - From{" "}
                        <span style={{ color: "red" }}>*</span>
                      </span>
                    }
                    disabled
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        error: !!errors.start_date,
                        helperText: errors.start_date?.message,
                        sx: { bgcolor: "white" },
                      },
                    }}
                  />
                )}
              />
            </Box>

            <Box>
              <Controller
                name="end_date"
                control={control}
                render={({ field }) => (
                  <DatePicker
                    {...field}
                    value={
                      field.value && dayjs.isDayjs(field.value)
                        ? field.value
                        : field.value
                          ? dayjs(field.value)
                          : null
                    }
                    label={
                      <span>
                        Inclusive Dates - To{" "}
                        <span style={{ color: "red" }}>*</span>
                      </span>
                    }
                    disabled
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        error: !!errors.end_date,
                        helperText: errors.end_date?.message,
                        sx: { bgcolor: "white" },
                      },
                    }}
                  />
                )}
              />
            </Box>
          </Box>
        </Box>
      </Box>

      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" sx={sectionTitleStyles}>
          KPI ATTACHMENT
        </Typography>
        <Box
          sx={{
            border: attachmentUrl ? "2px solid #ddd" : "2px dashed #ddd",
            borderRadius: 2,
            p: 2,
            backgroundColor: attachmentUrl ? "#fff" : "#fafafa",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <AttachFileIcon
              sx={{ color: attachmentUrl ? "#1976d2" : "#bbb", fontSize: 24 }}
            />
            <Box>
              {attachmentUrl ? (
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
              ) : isKpisLoading ? (
                <Typography sx={{ color: "#666", fontSize: "0.9rem" }}>
                  Loading attachment...
                </Typography>
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

          {attachmentUrl && (
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
              <Typography variant="caption" sx={{ fontWeight: 600 }}>
                VIEW
              </Typography>
            </IconButton>
          )}
        </Box>
      </Box>

      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" sx={sectionTitleStyles}>
          PART I - SETTING OF OBJECTIVES
        </Typography>

        {isKpisLoading ? (
          <Box
            sx={{
              textAlign: "center",
              py: 6,
              borderRadius: 2,
              border: "2px dashed",
              borderColor: "divider",
              minHeight: "200px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
            }}>
            <CircularProgress />
            <Typography
              variant="body1"
              sx={{ color: "text.secondary", fontWeight: 500, mt: 2 }}>
              Loading KPIs...
            </Typography>
          </Box>
        ) : kpisList.length > 0 ? (
          <TableContainer component={Paper} sx={{ width: "100%" }}>
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
                    <span style={{ fontSize: "0.75rem", fontStyle: "italic" }}>
                      (to be filled up 30 days before end of DA)
                    </span>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ borderRight: "1px solid #e0e0e0" }}>
                    <Box sx={{ display: "flex", gap: 1 }}>
                      <Box sx={{ flex: 1, fontWeight: 600 }}>
                        Key Performance Indicators
                      </Box>
                      <Box
                        sx={{ flex: 1, textAlign: "center", fontWeight: 600 }}>
                        Target
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell sx={{ borderRight: "1px solid #e0e0e0" }}>
                    <Box sx={{ display: "flex", gap: 1 }}>
                      <Box
                        sx={{ flex: 1, textAlign: "center", fontWeight: 600 }}>
                        Actual
                      </Box>
                      <Box
                        sx={{ flex: 1, textAlign: "center", fontWeight: 600 }}>
                        Remarks
                      </Box>
                    </Box>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {kpisList.map((kpi, index) => (
                  <TableRow key={kpi.source_kpi_id || index}>
                    <TableCell sx={{ borderRight: "1px solid #e0e0e0" }}>
                      <Box sx={{ display: "flex", gap: 1 }}>
                        <Box sx={{ flex: 1 }}>
                          <Typography
                            variant="body2"
                            sx={{ fontWeight: 600, mb: 0.5 }}>
                            {kpi.objective_name}
                          </Typography>
                          <Typography
                            variant="caption"
                            sx={{ color: "text.secondary", display: "block" }}>
                            {kpi.deliverable}
                          </Typography>
                          <Typography
                            variant="caption"
                            sx={{
                              color: "#1976d2",
                              display: "block",
                              mt: 0.5,
                            }}>
                            Distribution: {kpi.distribution_percentage}%
                          </Typography>
                        </Box>
                        <Box
                          sx={{
                            flex: 1,
                            textAlign: "center",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}>
                          <TextField
                            size="small"
                            type="number"
                            value={kpi.target_percentage}
                            inputProps={{ min: 0, max: 100, step: "any" }}
                            sx={{ width: "80px" }}
                            disabled
                          />
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ borderRight: "1px solid #e0e0e0" }}>
                      <Box sx={{ display: "flex", gap: 1 }}>
                        <Box
                          sx={{
                            flex: 1,
                            textAlign: "center",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}>
                          {kpi.actual_performance !== null &&
                          kpi.actual_performance !== undefined
                            ? `${kpi.actual_performance}%`
                            : "-"}
                        </Box>
                        <Box
                          sx={{
                            flex: 1,
                            textAlign: "center",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}>
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
              minHeight: "50px",
            }}>
            <Typography
              variant="body1"
              sx={{ color: "text.secondary", fontWeight: 500 }}>
              {isCreate && !selectedMrf
                ? "Please select an MRF to load KPIs"
                : "No KPIs available"}
            </Typography>
          </Box>
        )}
      </Box>

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
            <CloseIcon />
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
    </Box>
  );
};

export default DAFormModalFields;
