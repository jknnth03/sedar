import React, { useEffect, useState, useCallback } from "react";
import { Controller, useFormContext } from "react-hook-form";
import {
  TextField,
  Box,
  Autocomplete,
  CircularProgress,
  Typography,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
} from "@mui/material";
import {
  Visibility as VisibilityIcon,
  Close as CloseIcon,
  AttachFile as AttachFileIcon,
} from "@mui/icons-material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";
import {
  useGetProbationaryEmployeesQuery,
  useLazyGetPerformanceEvaluationPrefillQuery,
  useLazyGetPerformanceEvaluationPositionsQuery,
} from "../../../../features/api/forms/biAnnualPerformanceApi";
import { useGetKpiAttachmentQuery } from "../../../../features/api/evaluation/kpiApi";
import { useLazyGetPositionKpisQuery } from "../../../../features/api/forms/daformApi";
import FormSection, { KpiTable, CompetencyTable } from "./FormSection";

const BiAnnualPerformanceModalFields = ({
  isCreate,
  isReadOnly,
  currentMode,
}) => {
  const {
    control,
    watch,
    setValue,
    clearErrors,
    formState: { errors },
  } = useFormContext();

  const formValues = watch();
  const [kpisList, setKpisList] = useState([]);
  const [competencyItems, setCompetencyItems] = useState([]);
  const [ratingScales, setRatingScales] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [selectedPosition, setSelectedPosition] = useState(null);
  const [positionOptions, setPositionOptions] = useState([]);
  const [employeeSearchInput, setEmployeeSearchInput] = useState("");
  const [isAutocompleteOpen, setIsAutocompleteOpen] = useState(false);
  const [templateId, setTemplateId] = useState(null);
  const [kpiErrors, setKpiErrors] = useState({});
  const [isLoadingData, setIsLoadingData] = useState(false);

  // Attachment viewer state
  const [fileViewerOpen, setFileViewerOpen] = useState(false);
  const [fileUrl, setFileUrl] = useState(null);
  const [fetchAttachment, setFetchAttachment] = useState(false);

  const { data: employeesData, isLoading: isLoadingEmployees } =
    useGetProbationaryEmployeesQuery(undefined, {
      skip: !isCreate || !isAutocompleteOpen,
    });

  const selectedEmployeeId = isCreate
    ? watch("employee_id")
    : formValues.employee_id;

  const selectedYear = watch("year");

  const [fetchPrefill, { data: prefillData, isLoading: isLoadingPrefill }] =
    useLazyGetPerformanceEvaluationPrefillQuery();

  const [
    fetchPositions,
    { data: positionsData, isLoading: isLoadingPositions },
  ] = useLazyGetPerformanceEvaluationPositionsQuery();

  const [fetchPositionKpis] = useLazyGetPositionKpisQuery();

  // KPI Attachment via RTK Query — same as KpiModal & DAFormModalFields
  const positionId = formValues.kpi_position_id || null;
  const {
    data: attachmentData,
    isLoading: attachmentLoading,
    error: attachmentFetchError,
  } = useGetKpiAttachmentQuery(positionId, {
    skip: !fetchAttachment || !positionId || !fileViewerOpen,
  });

  // Blob URL management for attachment viewer
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

  useEffect(() => {
    if (isCreate && selectedEmployeeId && selectedYear) {
      setIsLoadingData(true);
      const year = dayjs.isDayjs(selectedYear)
        ? selectedYear.year()
        : selectedYear;
      fetchPositions({ employee_id: selectedEmployeeId, year }).finally(() => {
        setIsLoadingData(false);
      });
    }
  }, [isCreate, selectedEmployeeId, selectedYear, fetchPositions]);

  useEffect(() => {
    if (positionsData?.result && Array.isArray(positionsData.result)) {
      setPositionOptions(positionsData.result);
      setSelectedPosition(null);
      setValue("employee_position_history_id", null);
      setValue("kpi_position_id", null);
      setValue("kpi_attachment_url", null);
      setValue("kpi_attachment_filename", null);
      setValue("position_title", "");
      setValue("start_date", "");
      setValue("end_date", "");
    }
  }, [positionsData, setValue]);

  useEffect(() => {
    if (!isCreate && formValues.kpis && Array.isArray(formValues.kpis)) {
      setKpisList(formValues.kpis);
    }
  }, [isCreate, formValues.kpis]);

  useEffect(() => {
    if (!isCreate && formValues.competency_assessment) {
      const compAssessment = formValues.competency_assessment;

      if (compAssessment.assessment_template_id) {
        setTemplateId(compAssessment.assessment_template_id);
      } else if (compAssessment.template_id) {
        setTemplateId(compAssessment.template_id);
      }

      if (compAssessment.template?.rating_scale) {
        setRatingScales(compAssessment.template.rating_scale);
      }

      if (compAssessment.sections && Array.isArray(compAssessment.sections)) {
        const allItems = [];
        compAssessment.sections.forEach((section) => {
          if (section.items && Array.isArray(section.items)) {
            section.items.forEach((item) => {
              if (item.children && Array.isArray(item.children)) {
                item.children.forEach((child) => {
                  if (child.is_ratable) {
                    allItems.push({
                      saved_answer_id: child.saved_answer?.id || null,
                      template_item_id:
                        child.source_template_item_id || child.id,
                      pa_item_id: child.id,
                      template_item_name: child.text,
                      rating_scale_id:
                        child.saved_answer?.rating_scale_id || null,
                      rating_scale_name:
                        child.saved_answer?.rating_scale?.label || null,
                    });
                  }
                });
              }
            });
          }
        });
        if (allItems.length > 0) {
          setCompetencyItems(allItems);
        }
      } else if (
        compAssessment.answers &&
        Array.isArray(compAssessment.answers) &&
        compAssessment.answers.length > 0
      ) {
        setCompetencyItems(compAssessment.answers);
      }
    }
  }, [isCreate, formValues.competency_assessment]);

  useEffect(() => {
    if (prefillData?.result && isCreate) {
      if (prefillData.result.employee) {
        const empData = prefillData.result.employee;
        setValue("employee_code", empData.code || empData.id_number || "");
        setValue("employee_name", empData.full_name);
      }

      if (prefillData.result.kpis && Array.isArray(prefillData.result.kpis)) {
        const formattedKpis = prefillData.result.kpis.map((kpi) => ({
          source_kpi_id: kpi.source_kpi_id,
          objective_id: kpi.objective_id,
          objective_name: kpi.objective_name || "",
          deliverable: kpi.deliverable || "",
          distribution_percentage: kpi.distribution_percentage || 0,
          target_percentage: kpi.target_percentage || 0,
          actual_performance: "",
          remarks: "",
        }));
        setKpisList(formattedKpis);
        setValue("kpis", formattedKpis);
      }

      setValue("demerits", []);

      if (prefillData.result.competency_template) {
        const template = prefillData.result.competency_template;
        const compTemplateId = template.id;
        setTemplateId(compTemplateId);

        if (template.rating_scale && Array.isArray(template.rating_scale)) {
          setRatingScales(template.rating_scale);
        }

        if (template.sections) {
          const allItems = [];
          template.sections.forEach((section) => {
            if (section.items && Array.isArray(section.items)) {
              section.items.forEach((item) => {
                if (item.children && Array.isArray(item.children)) {
                  item.children.forEach((child) => {
                    if (child.is_ratable) {
                      allItems.push({
                        template_item_id: child.id,
                        template_item_name: child.text,
                        rating_scale_id: null,
                        rating_scale_name: null,
                      });
                    }
                  });
                }
              });
            }
          });
          setCompetencyItems(allItems);
          setValue("competency_assessment", {
            template_id: compTemplateId,
            answers: allItems,
          });
        }
      }
    }
  }, [prefillData, setValue, isCreate]);

  useEffect(() => {
    if (prefillData?.result && !isCreate) {
      if (prefillData.result.competency_template?.rating_scale) {
        setRatingScales(prefillData.result.competency_template.rating_scale);
      }
    }
  }, [prefillData, isCreate]);

  const handleEmployeeChange = (event, newValue) => {
    setSelectedEmployee(newValue);
    setSelectedPosition(null);
    setPositionOptions([]);
    setValue("employee_position_history_id", null);
    setValue("kpi_position_id", null);
    setValue("kpi_attachment_url", null);
    setValue("kpi_attachment_filename", null);
    setValue("position_title", "");
    setValue("start_date", "");
    setValue("end_date", "");
    setKpisList([]);
    setCompetencyItems([]);
    setRatingScales([]);
    setTemplateId(null);
    setKpiErrors({});

    if (newValue) {
      setValue("employee_id", newValue.id);
      setValue("employee_name", newValue.employee_name || newValue.full_name);
      setValue("employee_code", newValue.code || newValue.id_number || "");
      setValue("kpis", []);
      setValue("demerits", []);
    } else {
      setValue("employee_id", null);
      setValue("employee_name", "");
      setValue("employee_code", "");
      setValue("kpis", []);
      setValue("demerits", []);
      setSelectedEmployee(null);
    }
  };

  const handlePositionChange = (event, newValue) => {
    setSelectedPosition(newValue);
    // Reset attachment when position changes
    setValue("kpi_position_id", null);
    setValue("kpi_attachment_url", null);
    setValue("kpi_attachment_filename", null);
    setFetchAttachment(false);

    if (newValue) {
      setValue("employee_position_history_id", newValue.history_id);
      setValue("kpi_position_id", newValue.position_id); // ← store position_id for KPI attachment
      setValue("position_title", newValue.position_title);
      setValue("start_date", newValue.start_date);
      setValue("end_date", newValue.end_date);

      if (selectedEmployeeId) {
        setIsLoadingData(true);
        // Fetch prefill (KPIs, competency) and position KPI attachment in parallel
        fetchPrefill({
          employee_id: selectedEmployeeId,
          employee_position_history_id: newValue.history_id,
        }).finally(() => setIsLoadingData(false));

        // Separately fetch position KPIs for attachment metadata (same as DA form)
        fetchPositionKpis(newValue.position_id)
          .unwrap()
          .then((kpisResponse) => {
            // API shape: { result: { kpi_download_url, kpi_attachment_file_name, kpis: [...] } }
            setValue(
              "kpi_attachment_url",
              kpisResponse?.result?.kpi_download_url || null,
            );
            setValue(
              "kpi_attachment_filename",
              kpisResponse?.result?.kpi_attachment_file_name || null,
            );
          })
          .catch(() => {
            setValue("kpi_attachment_url", null);
            setValue("kpi_attachment_filename", null);
          });
      }
    } else {
      setValue("employee_position_history_id", null);
      setValue("position_title", "");
      setValue("start_date", "");
      setValue("end_date", "");
      setKpisList([]);
      setCompetencyItems([]);
      setRatingScales([]);
      setTemplateId(null);
      setValue("kpis", []);
      setValue("competency_assessment", { template_id: null, answers: [] });
    }
  };

  const validateNumericInput = (value) => {
    if (value === "" || value === null || value === undefined) return true;
    return /^[0-9]+(\.[0-9]+)?$/.test(value);
  };

  const handleKpiFieldChange = useCallback(
    (index, field, value) => {
      if (field === "actual_performance") {
        const isValid = validateNumericInput(value);
        setKpiErrors((prev) => {
          const newErrors = { ...prev };
          if (!newErrors[index]) newErrors[index] = {};
          newErrors[index].actual_performance =
            value !== "" && !isValid ? "Only numbers are allowed" : null;
          return newErrors;
        });
        if (value !== "" && !isValid) return;
        if (isValid || value === "")
          clearErrors(`kpis.${index}.actual_performance`);
      }

      const updatedKpis = [...kpisList];
      updatedKpis[index] = { ...updatedKpis[index], [field]: value };
      setKpisList(updatedKpis);
      setValue("kpis", updatedKpis, { shouldValidate: false });
    },
    [kpisList, setValue, clearErrors],
  );

  const handleCompetencyRatingChange = useCallback(
    (index, ratingScaleId) => {
      const parsedId = ratingScaleId === "" ? null : parseInt(ratingScaleId);
      const selectedRating = ratingScales.find((r) => r.id === parsedId);

      setCompetencyItems((prevItems) => {
        const updatedItems = [...prevItems];
        updatedItems[index] = {
          ...updatedItems[index],
          rating_scale_id: parsedId,
          rating_scale_name: selectedRating?.label || null,
        };
        setValue(
          "competency_assessment",
          { template_id: templateId, answers: updatedItems },
          { shouldValidate: false },
        );
        return updatedItems;
      });
    },
    [setValue, ratingScales, templateId],
  );

  const employeeOptions = Array.isArray(employeesData?.result?.data)
    ? employeesData.result.data
    : Array.isArray(employeesData?.result)
      ? employeesData.result
      : [];

  const getKpiErrorMessage = () => {
    if (
      errors?.kpis &&
      typeof errors.kpis === "object" &&
      !Array.isArray(errors.kpis) &&
      errors.kpis.message
    ) {
      return errors.kpis.message;
    }
    return null;
  };

  const getCompetencyErrorMessage = () => {
    if (
      errors?.competency_assessment?.answers &&
      typeof errors.competency_assessment.answers === "object" &&
      !Array.isArray(errors.competency_assessment.answers) &&
      errors.competency_assessment.answers.message
    ) {
      return errors.competency_assessment.answers.message;
    }
    return null;
  };

  const attachmentUrl = formValues.kpi_attachment_url;
  const attachmentFilename =
    formValues.kpi_attachment_filename || "KPI Attachment";

  return (
    <Box sx={{ height: "100%" }}>
      <FormSection title="EMPLOYEE INFORMATION">
        <Box sx={{ p: 0, pb: 0, borderRadius: 2 }}>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                "@media (min-width: 900px)": "repeat(2, 1fr)",
              },
              gap: 2,
              mb: 2,
            }}>
            <Box>
              {isCreate ? (
                <Controller
                  name="employee_id"
                  control={control}
                  rules={{ required: "Employee is required" }}
                  render={({ field }) => (
                    <Autocomplete
                      {...field}
                      options={employeeOptions}
                      getOptionLabel={(option) => {
                        const name = option?.employee_name || "";
                        const code = option?.code || option?.id_number || "";
                        return code ? `${name} - ${code}` : name;
                      }}
                      value={selectedEmployee}
                      onChange={handleEmployeeChange}
                      inputValue={employeeSearchInput}
                      onInputChange={(event, newInputValue) => {
                        setEmployeeSearchInput(newInputValue);
                      }}
                      onOpen={() => setIsAutocompleteOpen(true)}
                      onClose={() => setIsAutocompleteOpen(false)}
                      loading={isLoadingEmployees}
                      isOptionEqualToValue={(option, value) =>
                        option?.id === value?.id
                      }
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label={
                            <span>
                              Employee Name{" "}
                              <span style={{ color: "red" }}>*</span>
                            </span>
                          }
                          error={!!errors.employee_id}
                          helperText={errors.employee_id?.message}
                          fullWidth
                          sx={{ bgcolor: "white" }}
                          InputProps={{
                            ...params.InputProps,
                            endAdornment: (
                              <>
                                {isLoadingEmployees ? (
                                  <CircularProgress size={20} />
                                ) : null}
                                {params.InputProps.endAdornment}
                              </>
                            ),
                          }}
                        />
                      )}
                      disabled={isReadOnly}
                    />
                  )}
                />
              ) : (
                <TextField
                  label="Employee Name"
                  value={
                    formValues.employee_name && formValues.employee_code
                      ? `${formValues.employee_name} - ${formValues.employee_code}`
                      : formValues.employee_name || ""
                  }
                  disabled
                  fullWidth
                  sx={{ bgcolor: "white" }}
                />
              )}
            </Box>

            <Box>
              {isCreate ? (
                <Controller
                  name="year"
                  control={control}
                  rules={{ required: "Year is required" }}
                  render={({ field }) => (
                    <DatePicker
                      {...field}
                      views={["year"]}
                      value={
                        field.value && dayjs.isDayjs(field.value)
                          ? field.value
                          : field.value
                            ? dayjs().year(field.value)
                            : null
                      }
                      onChange={(date) => {
                        field.onChange(date);
                        setSelectedPosition(null);
                        setValue("employee_position_history_id", null);
                        setValue("kpi_position_id", null);
                        setValue("kpi_attachment_url", null);
                        setValue("kpi_attachment_filename", null);
                        setValue("position_title", "");
                        setValue("start_date", "");
                        setValue("end_date", "");
                        setKpisList([]);
                        setCompetencyItems([]);
                        setRatingScales([]);
                        setTemplateId(null);
                        setValue("kpis", []);
                        setValue("competency_assessment", {
                          template_id: null,
                          answers: [],
                        });
                      }}
                      label={
                        <span>
                          Year <span style={{ color: "red" }}>*</span>
                        </span>
                      }
                      disabled={isReadOnly}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          error: !!errors.year,
                          helperText: errors.year?.message,
                          sx: { bgcolor: "white" },
                        },
                      }}
                    />
                  )}
                />
              ) : (
                <TextField
                  label="Year"
                  value={
                    formValues.year
                      ? dayjs.isDayjs(formValues.year)
                        ? formValues.year.year()
                        : formValues.year
                      : ""
                  }
                  disabled
                  fullWidth
                  sx={{ bgcolor: "white" }}
                />
              )}
            </Box>
          </Box>

          <Box>
            {isCreate ? (
              <Controller
                name="employee_position_history_id"
                control={control}
                rules={{ required: "Position is required" }}
                render={({ field }) => (
                  <Autocomplete
                    {...field}
                    options={positionOptions}
                    getOptionLabel={(option) =>
                      option?.position_title
                        ? `${option.position_title} (${option.period_label})`
                        : ""
                    }
                    value={selectedPosition}
                    onChange={handlePositionChange}
                    loading={isLoadingPositions || isLoadingData}
                    isOptionEqualToValue={(option, value) =>
                      option?.history_id === value?.history_id
                    }
                    disabled={
                      isReadOnly || !selectedEmployeeId || !selectedYear
                    }
                    noOptionsText={
                      !selectedEmployeeId || !selectedYear
                        ? "Select an employee and year first"
                        : "No positions available"
                    }
                    clearIcon={null}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label={
                          <span>
                            Position <span style={{ color: "red" }}>*</span>
                          </span>
                        }
                        error={!!errors.employee_position_history_id}
                        helperText={
                          errors.employee_position_history_id?.message
                        }
                        fullWidth
                        sx={{ bgcolor: "white" }}
                        InputProps={{
                          ...params.InputProps,
                          endAdornment: (
                            <>
                              {isLoadingPositions || isLoadingData ? (
                                <CircularProgress size={20} />
                              ) : null}
                              {params.InputProps.endAdornment}
                            </>
                          ),
                        }}
                      />
                    )}
                  />
                )}
              />
            ) : (
              <TextField
                label="Position"
                value={formValues.position_title || ""}
                disabled
                fullWidth
                sx={{ bgcolor: "white" }}
              />
            )}
          </Box>
        </Box>
      </FormSection>

      {/* KPI Attachment — same pattern as DAFormModalFields */}
      <FormSection title="KPI ATTACHMENT">
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
              ) : isLoadingData || isLoadingPrefill ? (
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
                  {isCreate && !selectedPosition
                    ? "Select a position to load KPI attachment"
                    : "No KPI attachment available"}
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
      </FormSection>

      <FormSection
        title="PART I - KEY PERFORMANCE INDICATORS"
        isLoading={isLoadingPrefill || isLoadingData}
        loadingMessage="Loading Key Performance Indicators..."
        isEmpty={kpisList.length === 0}
        emptyMessage={
          isCreate && !selectedEmployee
            ? "Please select an employee to load KPIs"
            : "No Key Performance Indicators available"
        }
        error={getKpiErrorMessage()}>
        <KpiTable
          kpisList={kpisList}
          isReadOnly={isReadOnly}
          onFieldChange={handleKpiFieldChange}
          errors={errors}
          kpiErrors={kpiErrors}
        />
      </FormSection>

      <FormSection title="PART II - DISCUSSIONS">
        <Box sx={{ p: 0, pb: 0, borderRadius: 2 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Box>
              <Controller
                name="strengths_discussion"
                control={control}
                rules={{ required: "Strengths is required" }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label={
                      <span>
                        Strengths <span style={{ color: "red" }}>*</span>
                      </span>
                    }
                    multiline
                    rows={2}
                    disabled={isReadOnly}
                    fullWidth
                    error={!!errors.strengths_discussion}
                    helperText={errors.strengths_discussion?.message}
                    sx={{ bgcolor: "white" }}
                  />
                )}
              />
            </Box>
            <Box>
              <Controller
                name="development_discussion"
                control={control}
                rules={{ required: "Development areas is required" }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label={
                      <span>
                        Development Areas{" "}
                        <span style={{ color: "red" }}>*</span>
                      </span>
                    }
                    multiline
                    rows={2}
                    disabled={isReadOnly}
                    fullWidth
                    error={!!errors.development_discussion}
                    helperText={errors.development_discussion?.message}
                    sx={{ bgcolor: "white" }}
                  />
                )}
              />
            </Box>
            <Box>
              <Controller
                name="learning_needs_discussion"
                control={control}
                rules={{ required: "Learning needs is required" }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label={
                      <span>
                        Learning Needs <span style={{ color: "red" }}>*</span>
                      </span>
                    }
                    multiline
                    rows={2}
                    disabled={isReadOnly}
                    fullWidth
                    error={!!errors.learning_needs_discussion}
                    helperText={errors.learning_needs_discussion?.message}
                    sx={{ bgcolor: "white" }}
                  />
                )}
              />
            </Box>
          </Box>
        </Box>
      </FormSection>

      <FormSection
        title="PART III - COMPETENCY ASSESSMENT"
        isLoading={isLoadingPrefill || isLoadingData}
        loadingMessage="Loading Competency Assessment..."
        isEmpty={competencyItems.length === 0}
        emptyMessage={
          isCreate && !selectedEmployee
            ? "Please select an employee and evaluation period"
            : "No Competency Assessment available"
        }
        error={getCompetencyErrorMessage()}>
        <CompetencyTable
          competencyItems={competencyItems}
          isReadOnly={isReadOnly}
          ratingScales={ratingScales}
          onRatingChange={handleCompetencyRatingChange}
          errors={errors}
        />
      </FormSection>

      {/* File Viewer Dialog */}
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

export default BiAnnualPerformanceModalFields;
