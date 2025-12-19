import React, { useEffect, useState, useRef, useCallback } from "react";
import { Controller, useFormContext } from "react-hook-form";
import {
  Grid,
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
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";
import { sectionTitleStyles } from "../DAForm/DAFormModal.styles";

const EvaluationRecommendationModalFields = ({
  isCreate,
  isReadOnly,
  currentMode,
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
    [setValue]
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

  useEffect(() => {
    return () => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
    };
  }, []);

  return (
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
                label="ID NUMBER"
                value={formValues.employee_code || ""}
                disabled
                sx={{ bgcolor: "white", width: "348px" }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                label="POSITION"
                value={formValues.position_title || ""}
                disabled
                sx={{ bgcolor: "white", width: "348px" }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Controller
                name="probation_start_date"
                control={control}
                render={({ field }) => (
                  <DatePicker
                    {...field}
                    label="PROBATION START DATE"
                    value={field.value ? dayjs(field.value) : null}
                    onChange={(newValue) => field.onChange(newValue)}
                    disabled={isReadOnly}
                    slotProps={{
                      textField: {
                        error: !!errors.probation_start_date,
                        helperText: errors.probation_start_date?.message,
                        sx: { bgcolor: "white", width: "348px" },
                      },
                    }}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Controller
                name="probation_end_date"
                control={control}
                render={({ field }) => (
                  <DatePicker
                    {...field}
                    label="PROBATION END DATE"
                    value={field.value ? dayjs(field.value) : null}
                    onChange={(newValue) => field.onChange(newValue)}
                    disabled={isReadOnly}
                    slotProps={{
                      textField: {
                        error: !!errors.probation_end_date,
                        helperText: errors.probation_end_date?.message,
                        sx: { bgcolor: "white", width: "348px" },
                      },
                    }}
                  />
                )}
              />
            </Grid>
          </Grid>
        </Box>
      </Grid>

      <Grid item xs={12}>
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
              width: 1140,
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
          <TableContainer component={Paper} sx={{ width: 1140 }}>
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
                            e.target.value
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
              width: 1140,
              minHeight: "50px",
            }}>
            <Typography
              variant="body1"
              sx={{ color: "text.secondary", fontWeight: 500 }}>
              No Performance Objectives available
            </Typography>
          </Box>
        )}
      </Grid>

      <Grid item xs={12}>
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
        <Box
          sx={{
            p: 3.5,
            borderRadius: 2,
          }}>
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
          <Grid container spacing={2}>
            <Grid item xs={12}>
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
                            e.target.checked
                          );
                        }}
                        disabled={isReadOnly}
                      />
                    }
                    label="For Permanent Appointment"
                  />
                )}
              />
            </Grid>

            <Grid item xs={12}>
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
                            e.target.checked
                          );
                        }}
                        disabled={isReadOnly}
                      />
                    }
                    label="NOT for permanent appointment at this time"
                  />
                )}
              />
            </Grid>

            <Grid item xs={12}>
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
                              e.target.checked
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
            </Grid>
          </Grid>
        </Box>
      </Grid>
    </Grid>
  );
};

export default EvaluationRecommendationModalFields;
