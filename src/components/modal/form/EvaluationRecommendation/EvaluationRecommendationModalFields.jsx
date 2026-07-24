import React, {
  useEffect,
  useState,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { Controller, useFormContext } from "react-hook-form";
import {
  TextField,
  Typography,
  Box,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  FormControlLabel,
  Checkbox,
  RadioGroup,
  Radio,
  FormControl,
  FormLabel,
  Divider,
  LinearProgress,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";
import { sectionTitleStyles } from "../DAForm/DAFormModal.styles";
import {
  getCompetencyAssessmentTemplate,
  isCompetencyAssessmentEvaluation,
} from "./EvaluationRecommendationGetValues";

const CDP_ACTION_PLAN_OPTIONS = [
  { value: "coaching", label: "Coaching" },
  { value: "training", label: "Training" },
  { value: "shadowing", label: "Shadowing/Buddy System" },
  { value: "others", label: "Others" },
];

const EvaluationRecommendationModalFields = ({
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
  const [kpisList, setKpisList] = useState([]);
  const [isKpisLoading, setIsKpisLoading] = useState(false);

  const isInitialMount = useRef(true);
  const prevModeRef = useRef(currentMode);
  const updateTimeoutRef = useRef(null);

  const forPermanentAppointment = watch("for_permanent_appointment");
  const notForPermanentAppointment = watch("not_for_permanent_appointment");
  const forExtension = watch("for_extension");
  const cdpItems = watch("cdp_items") || [];
  const competencyAssessmentItems = watch("competency_assessment_items") || {};

  const isViewMode = isReadOnly;

  const showCompetencyAndCdp = useMemo(
    () => isCreate || isCompetencyAssessmentEvaluation(selectedEntry),
    [isCreate, selectedEntry],
  );

  const competencyTemplate = useMemo(
    () => getCompetencyAssessmentTemplate(selectedEntry),
    [selectedEntry],
  );

  useEffect(() => {
    if (!isCreate && currentMode !== prevModeRef.current) {
      isInitialMount.current = true;
      prevModeRef.current = currentMode;
    }
  }, [currentMode, isCreate]);

  useEffect(() => {
    if (
      !isCreate &&
      formValues.objectives &&
      Array.isArray(formValues.objectives)
    ) {
      if (isInitialMount.current && formValues.objectives.length > 0) {
        setKpisList(formValues.objectives);
        isInitialMount.current = false;
      }
    }
  }, [isCreate, formValues.objectives]);

  const handleKpiFieldChange = useCallback(
    (index, field, value) => {
      setKpisList((prevKpisList) => {
        const updatedKpis = [...prevKpisList];

        if (field === "actual_performance") {
          let numValue = value === "" || value === null ? null : Number(value);

          if (numValue !== null) {
            if (numValue < 0) numValue = 0;
            if (numValue > 100) numValue = 100;
          }

          updatedKpis[index] = {
            ...updatedKpis[index],
            [field]: numValue,
          };
        } else {
          updatedKpis[index] = {
            ...updatedKpis[index],
            [field]: value,
          };
        }

        setValue("objectives", updatedKpis, { shouldValidate: false });

        return updatedKpis;
      });
    },
    [setValue],
  );

  const handleCheckboxChange = (field, value) => {
    if (field === "for_permanent_appointment" && value) {
      setValue("not_for_permanent_appointment", false);
      setValue("for_extension", false);
      setValue("extension_end_date", null);
    } else if (field === "not_for_permanent_appointment" && value) {
      setValue("for_permanent_appointment", false);
      setValue("for_extension", false);
      setValue("extension_end_date", null);
    } else if (field === "for_extension" && value) {
      setValue("for_permanent_appointment", false);
      setValue("not_for_permanent_appointment", false);
    } else if (field === "for_extension" && !value) {
      setValue("extension_end_date", null);
    }
  };

  const handleCdpActionPlanChange = (index, value, checked) => {
    const current = cdpItems[index]?.action_plan_types || [];
    let updated;

    if (checked) {
      updated = [...current, value];
    } else {
      updated = current.filter((v) => v !== value);
      if (value === "others") {
        setValue(`cdp_items.${index}.action_plan_other`, null);
      }
    }

    setValue(`cdp_items.${index}.action_plan_types`, updated, {
      shouldValidate: false,
    });
  };

  const getRatingForItem = (itemId) => {
    return competencyAssessmentItems?.[itemId]?.rating_id || null;
  };

  const getCommentsForItem = (itemId) => {
    return competencyAssessmentItems?.[itemId]?.comments || "";
  };

  const handleRatingChange = (itemId, ratingId) => {
    setValue(`competency_assessment_items.${itemId}.rating_id`, ratingId, {
      shouldValidate: false,
    });
  };

  const handleCommentsChange = (itemId, value) => {
    setValue(`competency_assessment_items.${itemId}.comments`, value, {
      shouldValidate: false,
    });
  };

  const calculateSectionProgress = (sectionItems) => {
    let totalRateable = 0;
    let totalAnswered = 0;

    const countItems = (items) => {
      items.forEach((item) => {
        if (item.is_rateable) {
          totalRateable++;
          if (getRatingForItem(item.id) !== null) {
            totalAnswered++;
          }
        }
        if (item.children && item.children.length > 0) {
          countItems(item.children);
        }
      });
    };

    countItems(sectionItems);
    return totalRateable > 0 ? (totalAnswered / totalRateable) * 100 : 0;
  };

  useEffect(() => {
    return () => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
    };
  }, []);

  const renderCompetencyItem = (item, level = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isRateable = item.is_rateable;

    return (
      <Box key={item.id} sx={{ mb: isRateable ? 2 : 1 }}>
        {isRateable ? (
          <Paper
            elevation={0}
            sx={{
              p: 3,
              border: "1px solid #e0e0e0",
              backgroundColor: isViewMode ? "#fafafa" : "white",
            }}>
            <FormControl component="fieldset" fullWidth disabled={isViewMode}>
              <FormLabel
                component="legend"
                sx={{
                  fontWeight: 500,
                  fontSize: "0.95rem",
                  color: "text.primary",
                  mb: 2,
                  "&.Mui-focused": {
                    color: "text.primary",
                  },
                }}>
                {item.text}
              </FormLabel>
              <RadioGroup
                row
                value={getRatingForItem(item.id) || ""}
                onChange={(e) =>
                  handleRatingChange(item.id, parseInt(e.target.value))
                }
                sx={{
                  gap: 3,
                  flexWrap: "wrap",
                  justifyContent: "flex-start",
                }}>
                {competencyTemplate?.rating_scale?.map((scale) => (
                  <FormControlLabel
                    key={scale.id}
                    value={scale.id}
                    control={
                      <Radio
                        sx={{
                          color: isViewMode ? "#9e9e9e" : "rgb(33, 61, 112)",
                          "&.Mui-checked": {
                            color: isViewMode ? "#757575" : "rgb(33, 61, 112)",
                          },
                        }}
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {scale.label}
                        </Typography>
                      </Box>
                    }
                    sx={{
                      border: "1px solid #e0e0e0",
                      borderRadius: "8px",
                      px: 4,
                      py: 2,
                      m: 0,
                      minWidth: "180px",
                      flex: "1 1 auto",
                      maxWidth: "240px",
                      backgroundColor:
                        getRatingForItem(item.id) === scale.id
                          ? isViewMode
                            ? "#e0e0e0"
                            : "rgba(33, 61, 112, 0.08)"
                          : "white",
                      "&:hover": {
                        backgroundColor: !isViewMode
                          ? "rgba(33, 61, 112, 0.04)"
                          : undefined,
                      },
                    }}
                  />
                ))}
              </RadioGroup>
              <TextField
                value={getCommentsForItem(item.id)}
                onChange={(e) => handleCommentsChange(item.id, e.target.value)}
                fullWidth
                size="small"
                placeholder="Comments (optional)"
                disabled={isViewMode}
                sx={{
                  mt: 2,
                  "& .MuiOutlinedInput-root": {
                    backgroundColor: isViewMode ? "#f5f5f5" : "white",
                  },
                }}
              />
            </FormControl>
          </Paper>
        ) : (
          <Typography
            variant="body1"
            sx={{
              fontWeight: 600,
              color: "text.primary",
              mb: 2,
              pl: level * 2,
            }}>
            {item.text}
          </Typography>
        )}

        {hasChildren && (
          <Box sx={{ pl: 3 }}>
            {item.children.map((child) =>
              renderCompetencyItem(child, level + 1),
            )}
          </Box>
        )}
      </Box>
    );
  };

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
                sm: "1fr",
                md: "repeat(3, 1fr)",
              },
              "@media (min-width: 900px)": {
                gridTemplateColumns: "repeat(3, 1fr)",
              },
              gap: 2,
              mb: 2,
            }}>
            <Box>
              <TextField
                label="EMPLOYEE NAME"
                value={formValues.employee_name || ""}
                disabled
                fullWidth
                sx={{ bgcolor: "white" }}
              />
            </Box>

            <Box>
              <TextField
                label="ID NUMBER"
                value={formValues.employee_code || ""}
                disabled
                fullWidth
                sx={{ bgcolor: "white" }}
              />
            </Box>

            <Box>
              <TextField
                label="POSITION"
                value={formValues.position_title || ""}
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
                sm: "1fr",
                md: "repeat(2, 1fr)",
              },
              "@media (min-width: 750px)": {
                gridTemplateColumns: "repeat(2, 1fr)",
              },
              gap: 2,
            }}>
            <Box>
              <Controller
                name="probation_start_date"
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
                    onChange={(date) => field.onChange(date)}
                    label="PROBATION START DATE"
                    disabled={isReadOnly}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        error: !!errors.probation_start_date,
                        helperText: errors.probation_start_date?.message,
                        sx: { bgcolor: "white" },
                      },
                    }}
                  />
                )}
              />
            </Box>

            <Box>
              <Controller
                name="probation_end_date"
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
                    onChange={(date) => field.onChange(date)}
                    label="PROBATION END DATE"
                    disabled={isReadOnly}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        error: !!errors.probation_end_date,
                        helperText: errors.probation_end_date?.message,
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
          PART I - PERFORMANCE OBJECTIVES
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
              Loading Performance Objectives...
            </Typography>
          </Box>
        ) : kpisList.length > 0 ? (
          <TableContainer component={Paper} sx={{ width: "100%" }}>
            <Table sx={{ tableLayout: "fixed", width: "100%" }}>
              <colgroup>
                <col style={{ width: "420px" }} />
                <col style={{ width: "150px" }} />
                <col style={{ width: "150px" }} />
                <col style={{ width: "420px" }} />
              </colgroup>
              <TableHead>
                <TableRow sx={{ bgcolor: "#f5f5f5" }}>
                  <TableCell
                    colSpan={2}
                    sx={{
                      fontWeight: 700,
                      textAlign: "center",
                      borderRight: "1px solid #e0e0e0",
                    }}>
                    PERFORMANCE METRICS
                  </TableCell>
                  <TableCell
                    colSpan={2}
                    align="center"
                    sx={{
                      fontWeight: 700,
                    }}>
                    ASSESSMENT
                    <br />
                    <span style={{ fontSize: "0.75rem", fontStyle: "italic" }}>
                      (to be filled up 30 days before end of probation)
                    </span>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell
                    sx={{
                      fontWeight: 600,
                      p: 2,
                      borderRight: "1px solid #e0e0e0",
                    }}>
                    Key Performance Indicators
                  </TableCell>
                  <TableCell
                    sx={{
                      textAlign: "center",
                      fontWeight: 600,
                      p: 2,
                      borderRight: "1px solid #e0e0e0",
                    }}>
                    Target
                  </TableCell>
                  <TableCell
                    sx={{
                      textAlign: "center",
                      fontWeight: 600,
                      p: 2,
                      borderRight: "1px solid #e0e0e0",
                    }}>
                    Actual
                    {!isReadOnly && (
                      <span style={{ color: "#d32f2f", marginLeft: "4px" }}>
                        *
                      </span>
                    )}
                  </TableCell>
                  <TableCell
                    sx={{
                      textAlign: "center",
                      fontWeight: 600,
                      p: 2,
                    }}>
                    Remarks
                    <span
                      style={{
                        fontSize: "0.75rem",
                        fontStyle: "italic",
                        fontWeight: 400,
                      }}>
                      {" "}
                      (Optional)
                    </span>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {kpisList.map((kpi, index) => (
                  <TableRow key={index}>
                    <TableCell
                      sx={{
                        p: 2,
                        verticalAlign: "top",
                        borderRight: "1px solid #e0e0e0",
                      }}>
                      <Typography
                        variant="body2"
                        sx={{ fontWeight: 600, mb: 1 }}>
                        {kpi.objective_name}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{ color: "text.secondary", display: "block" }}>
                        {kpi.deliverable}
                      </Typography>
                    </TableCell>
                    <TableCell
                      sx={{
                        p: 2,
                        verticalAlign: "top",
                        textAlign: "center",
                        borderRight: "1px solid #e0e0e0",
                      }}>
                      <TextField
                        size="small"
                        type="number"
                        value={kpi.target_percentage}
                        inputProps={{
                          min: 0,
                          max: 100,
                          step: "any",
                        }}
                        sx={{ width: "100px" }}
                        disabled
                      />
                    </TableCell>
                    <TableCell
                      sx={{
                        p: 2,
                        verticalAlign: "top",
                        textAlign: "center",
                        borderRight: "1px solid #e0e0e0",
                      }}>
                      <TextField
                        size="small"
                        type="number"
                        value={kpi.actual_performance ?? ""}
                        onChange={(e) =>
                          handleKpiFieldChange(
                            index,
                            "actual_performance",
                            e.target.value,
                          )
                        }
                        inputProps={{
                          min: 0,
                          max: 100,
                          step: "any",
                        }}
                        placeholder={isReadOnly ? "-" : "Enter %"}
                        error={
                          !isReadOnly &&
                          (kpi.actual_performance === null ||
                            kpi.actual_performance === undefined ||
                            kpi.actual_performance === "")
                        }
                        helperText={
                          !isReadOnly &&
                          (kpi.actual_performance === null ||
                            kpi.actual_performance === undefined ||
                            kpi.actual_performance === "")
                            ? "Required"
                            : ""
                        }
                        sx={{
                          width: "100px",
                          "& .MuiOutlinedInput-root": {
                            backgroundColor: isReadOnly
                              ? "transparent"
                              : kpi.actual_performance !== null &&
                                  kpi.actual_performance !== undefined &&
                                  kpi.actual_performance !== ""
                                ? "#f1f8f4"
                                : "#fffef7",
                            "& fieldset": {
                              borderColor: isReadOnly
                                ? "#e0e0e0"
                                : kpi.actual_performance !== null &&
                                    kpi.actual_performance !== undefined &&
                                    kpi.actual_performance !== ""
                                  ? "#4caf50"
                                  : "#ffa726",
                              borderWidth: isReadOnly ? "1px" : "2px",
                            },
                            "&:hover fieldset": {
                              borderColor: isReadOnly
                                ? "#e0e0e0"
                                : kpi.actual_performance !== null &&
                                    kpi.actual_performance !== undefined &&
                                    kpi.actual_performance !== ""
                                  ? "#45a049"
                                  : "#ff9800",
                            },
                            "&.Mui-focused fieldset": {
                              borderColor: isReadOnly
                                ? "#e0e0e0"
                                : kpi.actual_performance !== null &&
                                    kpi.actual_performance !== undefined &&
                                    kpi.actual_performance !== ""
                                  ? "#45a049"
                                  : "#ff9800",
                            },
                            "&.Mui-error fieldset": {
                              borderColor: "#d32f2f",
                            },
                          },
                        }}
                        disabled={isReadOnly}
                      />
                    </TableCell>
                    <TableCell sx={{ p: 2, verticalAlign: "top" }}>
                      <TextField
                        size="small"
                        value={kpi.remarks || ""}
                        onChange={(e) =>
                          handleKpiFieldChange(index, "remarks", e.target.value)
                        }
                        placeholder={isReadOnly ? "-" : "Optional remarks"}
                        multiline
                        maxRows={2}
                        sx={{
                          width: "100%",
                          "& .MuiOutlinedInput-root": {
                            backgroundColor: "white",
                            "& fieldset": {
                              borderColor: "#e0e0e0",
                            },
                            "&:hover fieldset": {
                              borderColor: isReadOnly ? "#e0e0e0" : "#bdbdbd",
                            },
                            "&.Mui-focused fieldset": {
                              borderColor: isReadOnly ? "#e0e0e0" : "#1976d2",
                            },
                          },
                        }}
                        disabled={isReadOnly}
                      />
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
              No Performance Objectives available
            </Typography>
          </Box>
        )}
      </Box>

      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" sx={sectionTitleStyles}>
          PART II - RECOMMENDATION
        </Typography>
        <Typography
          variant="caption"
          sx={{
            fontStyle: "italic",
            color: "text.secondary",
            display: "block",
            mb: 2,
          }}>
          (To be accomplished 30 days before the end of probation)
        </Typography>
        <Box sx={{ p: 3.5, borderRadius: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
            <Typography variant="body2">Please tick:</Typography>
            {!isReadOnly && (
              <span style={{ color: "#d32f2f", fontWeight: 600 }}>*</span>
            )}
          </Box>
          {!isReadOnly &&
            !forPermanentAppointment &&
            !notForPermanentAppointment &&
            !forExtension && (
              <Typography
                variant="caption"
                sx={{
                  color: "#d32f2f",
                  display: "block",
                  mb: 2,
                  fontWeight: 500,
                }}>
                Please select a recommendation option
              </Typography>
            )}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Controller
              name="for_permanent_appointment"
              control={control}
              defaultValue={false}
              render={({ field }) => (
                <FormControlLabel
                  control={
                    <Checkbox
                      {...field}
                      checked={field.value || false}
                      onChange={(e) => {
                        field.onChange(e.target.checked);
                        handleCheckboxChange(
                          "for_permanent_appointment",
                          e.target.checked,
                        );
                      }}
                      disabled={isReadOnly}
                    />
                  }
                  label="For Permanent Appointment"
                />
              )}
            />

            <Controller
              name="not_for_permanent_appointment"
              control={control}
              defaultValue={false}
              render={({ field }) => (
                <FormControlLabel
                  control={
                    <Checkbox
                      {...field}
                      checked={field.value || false}
                      onChange={(e) => {
                        field.onChange(e.target.checked);
                        handleCheckboxChange(
                          "not_for_permanent_appointment",
                          e.target.checked,
                        );
                      }}
                      disabled={isReadOnly}
                    />
                  }
                  label="NOT for permanent appointment at this time"
                />
              )}
            />

            <Controller
              name="for_extension"
              control={control}
              defaultValue={false}
              render={({ field }) => (
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        {...field}
                        checked={field.value || false}
                        onChange={(e) => {
                          field.onChange(e.target.checked);
                          handleCheckboxChange(
                            "for_extension",
                            e.target.checked,
                          );
                        }}
                        disabled={isReadOnly}
                      />
                    }
                    label="For extension until"
                  />
                  {forExtension && (
                    <Controller
                      name="extension_end_date"
                      control={control}
                      render={({ field: dateField }) => (
                        <DatePicker
                          {...dateField}
                          value={
                            dateField.value && dayjs.isDayjs(dateField.value)
                              ? dateField.value
                              : dateField.value
                                ? dayjs(dateField.value)
                                : null
                          }
                          onChange={(date) => dateField.onChange(date)}
                          disabled={isReadOnly}
                          slotProps={{
                            textField: {
                              size: "small",
                              error: !!errors.extension_end_date,
                              helperText: errors.extension_end_date?.message,
                              sx: { bgcolor: "white", width: "200px" },
                            },
                          }}
                        />
                      )}
                    />
                  )}
                </Box>
              )}
            />
          </Box>

          <Box sx={{ mt: 2 }}>
            <Controller
              name="recommendation_remarks"
              control={control}
              defaultValue=""
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Recommendation Remarks"
                  fullWidth
                  multiline
                  minRows={3}
                  disabled={isReadOnly}
                  placeholder="Optional remarks about the recommendation"
                  sx={{ bgcolor: "white" }}
                />
              )}
            />
          </Box>
        </Box>
      </Box>

      {showCompetencyAndCdp && competencyTemplate && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" sx={sectionTitleStyles}>
            PART III - COMPETENCY ASSESSMENT
          </Typography>
          <Typography
            variant="body2"
            sx={{ fontWeight: 500, color: "text.secondary", mb: 2 }}>
            {competencyTemplate.name}
          </Typography>

          <Divider sx={{ my: 2 }} />

          {competencyTemplate.sections?.map((section) => (
            <Box key={section.id} sx={{ mb: 4 }}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 2,
                }}>
                <Typography
                  variant="subtitle1"
                  sx={{
                    fontWeight: 600,
                    color: "rgb(33, 61, 112)",
                    backgroundColor: "#f0f4f8",
                    padding: "8px 16px",
                    borderRadius: "4px",
                    flex: 1,
                  }}>
                  {section.title}
                </Typography>
                {!isReadOnly && (
                  <Box sx={{ ml: 2, minWidth: "120px" }}>
                    <Typography variant="caption" color="text.secondary">
                      Progress:{" "}
                      {calculateSectionProgress(section.items).toFixed(0)}%
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={calculateSectionProgress(section.items)}
                      sx={{
                        height: 6,
                        borderRadius: 3,
                        backgroundColor: "#e0e0e0",
                        "& .MuiLinearProgress-bar": {
                          backgroundColor: "#4CAF50",
                        },
                      }}
                    />
                  </Box>
                )}
              </Box>

              {section.items.map((item) => renderCompetencyItem(item))}
            </Box>
          ))}
        </Box>
      )}

      {showCompetencyAndCdp && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" sx={sectionTitleStyles}>
            PART IV - CAREER DEVELOPMENT PLAN
          </Typography>
          <TableContainer component={Paper} sx={{ width: "100%" }}>
            <Table sx={{ tableLayout: "fixed", width: "100%" }}>
              <TableHead>
                <TableRow sx={{ bgcolor: "#3d4a5c" }}>
                  <TableCell sx={{ color: "#fff", fontWeight: 600 }}>
                    Needs Improvement
                    <br />
                    <span style={{ fontSize: "0.7rem", fontStyle: "italic" }}>
                      (Competency related to the CAT that needs to be improved)
                    </span>
                  </TableCell>
                  <TableCell sx={{ color: "#fff", fontWeight: 600 }}>
                    Action Plan
                    <br />
                    <span style={{ fontSize: "0.7rem", fontStyle: "italic" }}>
                      (e.g. Training, Coaching, Shadowing, etc.)
                    </span>
                  </TableCell>
                  <TableCell sx={{ color: "#fff", fontWeight: 600 }}>
                    Target Date
                    <br />
                    <span style={{ fontSize: "0.7rem", fontStyle: "italic" }}>
                      (Should be within 30 days after the CAT Form Completion)
                    </span>
                  </TableCell>
                  <TableCell sx={{ color: "#fff", fontWeight: 600 }}>
                    Person Responsible
                    <br />
                    <span style={{ fontSize: "0.7rem", fontStyle: "italic" }}>
                      (e.g. Immediate Superior, External/Internal Providers)
                    </span>
                  </TableCell>
                  <TableCell sx={{ color: "#fff", fontWeight: 600 }}>
                    Date of Completion
                    <br />
                    <span style={{ fontSize: "0.7rem", fontStyle: "italic" }}>
                      (Note: to be accomplished by HR)
                    </span>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {cdpItems.map((row, index) => {
                  const actionPlanTypes = row?.action_plan_types || [];
                  const hasOthers = actionPlanTypes.includes("others");

                  return (
                    <TableRow key={index}>
                      <TableCell sx={{ verticalAlign: "top" }}>
                        <Controller
                          name={`cdp_items.${index}.competency`}
                          control={control}
                          render={({ field }) => (
                            <TextField
                              {...field}
                              fullWidth
                              multiline
                              minRows={2}
                              size="small"
                              disabled={isReadOnly}
                              sx={{ bgcolor: "white" }}
                            />
                          )}
                        />
                      </TableCell>

                      <TableCell sx={{ verticalAlign: "top" }}>
                        {CDP_ACTION_PLAN_OPTIONS.map((opt) => (
                          <Box key={opt.value}>
                            <FormControlLabel
                              control={
                                <Checkbox
                                  size="small"
                                  checked={actionPlanTypes.includes(opt.value)}
                                  disabled={isReadOnly}
                                  onChange={(e) =>
                                    handleCdpActionPlanChange(
                                      index,
                                      opt.value,
                                      e.target.checked,
                                    )
                                  }
                                />
                              }
                              label={opt.label}
                            />
                          </Box>
                        ))}
                        {hasOthers && (
                          <Controller
                            name={`cdp_items.${index}.action_plan_other`}
                            control={control}
                            render={({ field }) => (
                              <TextField
                                {...field}
                                value={field.value || ""}
                                fullWidth
                                size="small"
                                disabled={isReadOnly}
                                sx={{ mt: 1, bgcolor: "white" }}
                              />
                            )}
                          />
                        )}
                      </TableCell>

                      <TableCell sx={{ verticalAlign: "top" }}>
                        <Controller
                          name={`cdp_items.${index}.target_date`}
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
                              onChange={(date) => field.onChange(date)}
                              disabled={isReadOnly}
                              slotProps={{
                                textField: {
                                  size: "small",
                                  fullWidth: true,
                                  sx: { bgcolor: "white" },
                                },
                              }}
                            />
                          )}
                        />
                      </TableCell>

                      <TableCell sx={{ verticalAlign: "top" }}>
                        <Controller
                          name={`cdp_items.${index}.person_responsible`}
                          control={control}
                          render={({ field }) => (
                            <TextField
                              {...field}
                              fullWidth
                              size="small"
                              disabled={isReadOnly}
                              sx={{ bgcolor: "white" }}
                            />
                          )}
                        />
                      </TableCell>

                      <TableCell sx={{ verticalAlign: "top" }}>
                        <Controller
                          name={`cdp_items.${index}.date_of_completion`}
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
                              onChange={(date) => field.onChange(date)}
                              disabled
                              slotProps={{
                                textField: {
                                  size: "small",
                                  fullWidth: true,
                                  sx: { bgcolor: "#f5f5f5" },
                                },
                              }}
                            />
                          )}
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}
    </Box>
  );
};

export default EvaluationRecommendationModalFields;
