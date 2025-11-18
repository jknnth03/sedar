import React, { useEffect, useState, useRef } from "react";
import { Controller, useFormContext } from "react-hook-form";
import {
  Grid,
  TextField,
  Typography,
  Box,
  Divider,
  Autocomplete,
  Button,
  IconButton,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { Add as AddIcon, Delete as DeleteIcon } from "@mui/icons-material";
import dayjs from "dayjs";
import {
  sectionTitleStyles,
  infoSectionContainerStyles,
  infoSectionTitleStyles,
  infoFieldContainerStyles,
  infoFieldLabelStyles,
  infoFieldValueStyles,
  infoBoxStyles,
} from "./DAFormModal.styles";
import { useGetAllPositionsQuery } from "../../../../features/api/masterlist/positionsApi";
import {
  useLazyGetPositionKpisQuery,
  useGetAllEmployeesDaQuery,
} from "../../../../features/api/forms/daformApi";

const InfoSection = ({ title, children }) => (
  <Box sx={infoSectionContainerStyles}>
    {title && (
      <Typography variant="subtitle2" sx={infoSectionTitleStyles}>
        {title}
      </Typography>
    )}
    {children}
  </Box>
);

const InfoField = ({ label, value }) => (
  <Box sx={infoFieldContainerStyles}>
    <Typography variant="subtitle2" sx={infoFieldLabelStyles}>
      {label}
    </Typography>
    <Typography variant="body2" sx={infoFieldValueStyles}>
      {value || "-"}
    </Typography>
  </Box>
);

const DAFormModalFields = ({ isCreate, isReadOnly, currentMode }) => {
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

  // Add refs to prevent infinite loops and track initialization
  const isInitialMount = useRef(true);
  const prevModeRef = useRef(currentMode);

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

  // Reset on modal close/open or mode change
  useEffect(() => {
    if (!isCreate && currentMode !== prevModeRef.current) {
      // Mode changed, reset to allow re-initialization
      isInitialMount.current = true;
      prevModeRef.current = currentMode;
    }
  }, [currentMode, isCreate]);

  // Initialize KPIs only once when form values are loaded
  useEffect(() => {
    if (!isCreate && formValues.kpis && Array.isArray(formValues.kpis)) {
      // Only update if we haven't initialized yet OR if the data actually changed
      if (isInitialMount.current && formValues.kpis.length > 0) {
        console.log("Initializing KPIs from form values:", formValues.kpis);
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
            }));
            setKpisList(autoFilledKpis);
            // Directly set form value here to avoid additional effect
            setValue("kpis", autoFilledKpis);
          } else {
            setKpisList([]);
            setValue("kpis", []);
          }
        } catch (error) {
          console.error("Error fetching KPIs:", error);
          setKpisList([]);
          setValue("kpis", []);
        } finally {
          setIsKpisLoading(false);
        }
      }
    };

    loadPositionKpis();
  }, [selectedToPosition, setValue, fetchPositionKpis]);

  // Remove the problematic useEffect that was causing the loop
  // This effect was syncing kpisList to form values constantly
  // Now we only update form values when kpisList changes via user interaction

  const handleKpiChange = (index, field, value) => {
    const updatedKpis = kpisList.map((kpi, i) => {
      if (i === index) {
        return { ...kpi, [field]: value };
      }
      return kpi;
    });

    setKpisList(updatedKpis);
    // Update form value immediately when user makes changes
    setValue("kpis", updatedKpis);
  };

  const formatDate = (date) => {
    if (!date) return "-";
    return dayjs(date).format("MMMM DD, YYYY");
  };

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
                    value={field.value ? dayjs(field.value) : null}
                    onChange={(date) => {
                      field.onChange(date);
                      const endDate = watch("end_date");
                      if (endDate && dayjs(date).isAfter(dayjs(endDate))) {
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
                    value={field.value ? dayjs(field.value) : null}
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
                  <TableRow key={index}>
                    <TableCell sx={{ borderRight: "1px solid #e0e0e0" }}>
                      <Box sx={{ display: "flex", gap: 1 }}>
                        <Box sx={{ flex: 1 }}>
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
                          {!isReadOnly && (
                            <TextField
                              fullWidth
                              size="small"
                              type="number"
                              label="Distribution %"
                              value={kpi.distribution_percentage}
                              onChange={(e) =>
                                handleKpiChange(
                                  index,
                                  "distribution_percentage",
                                  Number(e.target.value)
                                )
                              }
                              inputProps={{ min: 0, max: 100 }}
                              sx={{ mt: 1 }}
                              disabled={isReadOnly}
                            />
                          )}
                          {isReadOnly && (
                            <Typography
                              variant="caption"
                              sx={{
                                color: "text.secondary",
                                display: "block",
                                mt: 1,
                              }}>
                              Distribution: {kpi.distribution_percentage}%
                            </Typography>
                          )}
                        </Box>
                        <Box sx={{ flex: 1, textAlign: "center" }}>
                          {!isReadOnly ? (
                            <TextField
                              size="small"
                              type="number"
                              value={kpi.target_percentage}
                              onChange={(e) =>
                                handleKpiChange(
                                  index,
                                  "target_percentage",
                                  Number(e.target.value)
                                )
                              }
                              inputProps={{ min: 0, max: 100 }}
                              sx={{ width: "80px" }}
                              disabled={isReadOnly}
                            />
                          ) : (
                            `${kpi.target_percentage}%`
                          )}
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ borderRight: "1px solid #e0e0e0" }}>
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
              {isCreate && !selectedToPosition
                ? "Please select a TO Position to load KPIs"
                : "No KPIs available"}
            </Typography>
          </Box>
        )}
      </Grid>
    </Grid>
  );
};

export default DAFormModalFields;
