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
import { useGetAllPositionsQuery } from "../../../../features/api/masterlist/positionsApi";
import {
  useLazyGetPositionKpisQuery,
  useGetAllEmployeesDaQuery,
} from "../../../../features/api/forms/daformApi";

const DARecommendationModalFields = ({ isCreate, isReadOnly, currentMode }) => {
  const {
    control,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext();

  const formValues = watch();
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [selectedToPosition, setSelectedToPosition] = useState(null);
  const [kpisList, setKpisList] = useState([]);
  const [shouldFetchEmployees, setShouldFetchEmployees] = useState(false);
  const [shouldFetchPositions, setShouldFetchPositions] = useState(false);
  const [isKpisLoading, setIsKpisLoading] = useState(false);

  const isInitialMount = useRef(true);
  const prevModeRef = useRef(currentMode);
  const updateTimeoutRef = useRef(null);

  const { data: employeesData, isLoading: isEmployeesLoading } =
    useGetAllEmployeesDaQuery(undefined, {
      skip: !shouldFetchEmployees,
    });
  const { data: positionsData, isLoading: isPositionsLoading } =
    useGetAllPositionsQuery(undefined, {
      skip: !shouldFetchPositions,
    });

  const [fetchPositionKpis] = useLazyGetPositionKpisQuery();

  const employees = Array.isArray(employeesData?.result?.data)
    ? employeesData.result.data
    : [];
  const positions = Array.isArray(positionsData?.result)
    ? positionsData.result
    : [];

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
    if (!isCreate && formValues.kpis && Array.isArray(formValues.kpis)) {
      if (isInitialMount.current && formValues.kpis.length > 0) {
        setKpisList(formValues.kpis);
        isInitialMount.current = false;
      }
    }
  }, [isCreate, formValues.kpis]);

  useEffect(() => {
    if (selectedEmployee) {
      setValue("employee_id", selectedEmployee.id);
      setValue("employee_name", selectedEmployee.employee_name);
      setValue("from_position_id", selectedEmployee.position_id);
      setValue("from_position_title", selectedEmployee.position_title);
      setValue("from_department", selectedEmployee.department || "-");
    }
  }, [selectedEmployee, setValue]);

  useEffect(() => {
    const loadPositionKpis = async () => {
      if (selectedToPosition) {
        setValue("to_position_id", selectedToPosition.id);
        setValue("to_position_code", selectedToPosition.code);
        setValue("to_position_title", selectedToPosition.title.name);

        if (selectedToPosition.charging) {
          setValue(
            "to_department",
            selectedToPosition.charging.department_name || "-"
          );
        } else {
          setValue("to_department", "-");
        }

        try {
          setIsKpisLoading(true);
          const kpisResponse = await fetchPositionKpis(
            selectedToPosition.id
          ).unwrap();

          if (kpisResponse?.result && kpisResponse.result.length > 0) {
            const autoFilledKpis = kpisResponse.result.map((kpi) => ({
              source_kpi_id: kpi.id,
              objective_id: kpi.objective_id,
              objective_name: kpi.objective_name,
              distribution_percentage: kpi.distribution_percentage,
              deliverable: kpi.deliverable,
              target_percentage: kpi.target_percentage,
              actual_performance: kpi.actual_performance || null,
              remarks: kpi.remarks || "",
            }));
            setKpisList(autoFilledKpis);
            setValue("kpis", autoFilledKpis);
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
    };

    loadPositionKpis();
  }, [selectedToPosition, setValue, fetchPositionKpis]);

  const handleKpiFieldChange = useCallback(
    (index, field, value) => {
      setKpisList((prevKpisList) => {
        const updatedKpis = [...prevKpisList];
        updatedKpis[index] = {
          ...updatedKpis[index],
          [field]: value,
        };

        setValue("kpis", updatedKpis, { shouldValidate: false });

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
              {isCreate ? (
                <Autocomplete
                  options={employees}
                  getOptionLabel={(option) => option.employee_name}
                  loading={isEmployeesLoading}
                  value={selectedEmployee}
                  onChange={(event, newValue) => {
                    setSelectedEmployee(newValue);
                  }}
                  onOpen={() => setShouldFetchEmployees(true)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="EMPLOYEE NAME"
                      error={!!errors.employee_id}
                      helperText={errors.employee_id?.message}
                      InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                          <>
                            {isEmployeesLoading ? (
                              <CircularProgress color="inherit" size={20} />
                            ) : null}
                            {params.InputProps.endAdornment}
                          </>
                        ),
                      }}
                      sx={{ bgcolor: "white", width: "348px" }}
                    />
                  )}
                  disabled={isReadOnly}
                  sx={{ width: "348px" }}
                />
              ) : (
                <TextField
                  label="EMPLOYEE NAME"
                  value={formValues.employee_name || ""}
                  disabled
                  sx={{ bgcolor: "white", width: "348px" }}
                />
              )}
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
              {isCreate ? (
                <Autocomplete
                  options={positions}
                  getOptionLabel={(option) =>
                    `${option.code} - ${option.title.name}`
                  }
                  loading={isPositionsLoading}
                  value={selectedToPosition}
                  onChange={(event, newValue) => {
                    setSelectedToPosition(newValue);
                  }}
                  onOpen={() => setShouldFetchPositions(true)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="POSITION - TO"
                      error={!!errors.to_position_id}
                      helperText={errors.to_position_id?.message}
                      InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                          <>
                            {isPositionsLoading || isKpisLoading ? (
                              <CircularProgress color="inherit" size={20} />
                            ) : null}
                            {params.InputProps.endAdornment}
                          </>
                        ),
                      }}
                      sx={{ bgcolor: "white", width: "348px" }}
                    />
                  )}
                  disabled={isReadOnly || !selectedEmployee}
                  sx={{ width: "348px" }}
                />
              ) : (
                <TextField
                  label="POSITION - TO"
                  value={
                    formValues.to_position_code && formValues.to_position_title
                      ? `${formValues.to_position_code} - ${formValues.to_position_title}`
                      : ""
                  }
                  disabled
                  sx={{ bgcolor: "white", width: "348px" }}
                />
              )}
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
              <Controller
                name="start_date"
                control={control}
                rules={{ required: "Start date is required" }}
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
                    onChange={(date) => {
                      field.onChange(date);
                      const endDate = watch("end_date");
                      if (
                        endDate &&
                        date &&
                        dayjs(date).isAfter(dayjs(endDate))
                      ) {
                        setValue("end_date", null);
                      }
                    }}
                    label="INCLUSIVE DATES - FROM"
                    disabled={isReadOnly}
                    slotProps={{
                      textField: {
                        error: !!errors.start_date,
                        helperText: errors.start_date?.message,
                        sx: { bgcolor: "white", width: "348px" },
                      },
                    }}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Controller
                name="end_date"
                control={control}
                rules={{
                  required: "End date is required",
                  validate: (value) => {
                    const startDate = watch("start_date");
                    if (startDate && value) {
                      return (
                        dayjs(value).isAfter(dayjs(startDate)) ||
                        "End date must be after start date"
                      );
                    }
                    return true;
                  },
                }}
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
                    minDate={
                      watch("start_date")
                        ? dayjs(watch("start_date")).add(1, "day")
                        : undefined
                    }
                    label="INCLUSIVE DATES - TO"
                    disabled={isReadOnly || !watch("start_date")}
                    slotProps={{
                      textField: {
                        error: !!errors.end_date,
                        helperText: errors.end_date?.message,
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
              Loading KPIs...
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
                      (to be filled up 30 days before end of DA)
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
                  </TableCell>
                  <TableCell
                    sx={{
                      textAlign: "center",
                      fontWeight: 600,
                      p: 2,
                    }}>
                    Remarks
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
                        value={kpi.actual_performance || ""}
                        onChange={(e) =>
                          handleKpiFieldChange(
                            index,
                            "actual_performance",
                            e.target.value ? Number(e.target.value) : null
                          )
                        }
                        inputProps={{
                          min: 0,
                          max: 100,
                          step: "any",
                        }}
                        placeholder="-"
                        sx={{ width: "100px" }}
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
                        placeholder="-"
                        multiline
                        maxRows={2}
                        sx={{ width: "100%" }}
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
              {isCreate && !selectedToPosition
                ? "Please select a TO Position to load KPIs"
                : "No KPIs available"}
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
          (To be accomplished 30 days before the end of DA)
        </Typography>
        <Box
          sx={{
            p: 3.5,
            borderRadius: 2,
          }}>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Please tick:
          </Typography>
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

export default DARecommendationModalFields;
