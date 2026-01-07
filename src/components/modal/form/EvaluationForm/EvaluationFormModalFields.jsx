import React, { useEffect, useState, useRef, useCallback } from "react";
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
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";
import { sectionTitleStyles } from "./EvaluationFormModal.styles";
import {
  useGetEmployeesProbationaryQuery,
  useLazyGetPositionKpisQuery,
  useLazyGetSingleEmployeeQuery,
} from "../../../../features/api/forms/evaluationFormApi";

const EvaluationFormModalFields = ({
  isCreate,
  isReadOnly,
  currentMode,
  submissionId,
}) => {
  const {
    control,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext();

  const formValues = watch();
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [kpisList, setKpisList] = useState([]);
  const [shouldFetchEmployees, setShouldFetchEmployees] = useState(false);
  const [isKpisLoading, setIsKpisLoading] = useState(false);

  const isInitialMount = useRef(true);
  const prevModeRef = useRef(currentMode);
  const updateTimeoutRef = useRef(null);

  const { data: employeesData, isLoading: isEmployeesLoading } =
    useGetEmployeesProbationaryQuery(undefined, {
      skip: !shouldFetchEmployees,
    });

  const [fetchPositionKpis] = useLazyGetPositionKpisQuery();
  const [fetchSingleEmployee] = useLazyGetSingleEmployeeQuery();

  const employees = Array.isArray(employeesData?.result?.data)
    ? employeesData.result.data
    : Array.isArray(employeesData?.result)
    ? employeesData.result
    : [];

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

  useEffect(() => {
    const loadEmployeeKpis = async () => {
      if (selectedEmployee) {
        setValue("employee_id", selectedEmployee.id);
        setValue(
          "employee_name",
          selectedEmployee.full_name || selectedEmployee.employee_name
        );
        setValue("employee_code", selectedEmployee.code || "");

        if (selectedEmployee.probation_start_date) {
          setValue(
            "probation_start_date",
            dayjs(selectedEmployee.probation_start_date)
          );
        }
        if (selectedEmployee.probation_end_date) {
          setValue(
            "probation_end_date",
            dayjs(selectedEmployee.probation_end_date)
          );
        }

        let positionId =
          selectedEmployee.position?.position?.id ||
          selectedEmployee.position_id;

        if (!positionId) {
          try {
            const employeeDetails = await fetchSingleEmployee(
              selectedEmployee.id
            ).unwrap();

            const positionDetailsObj =
              employeeDetails?.result?.position_details;
            const positionObj = positionDetailsObj?.position;
            const extractedId = positionObj?.id;

            if (extractedId) {
              positionId = extractedId;
            } else {
              positionId =
                employeeDetails?.result?.position?.id ||
                employeeDetails?.result?.position_id ||
                employeeDetails?.position_details?.position?.id ||
                employeeDetails?.position?.id ||
                employeeDetails?.position_id;
            }
          } catch (error) {}
        }

        const positionTitle =
          selectedEmployee.position?.position?.title?.name ||
          selectedEmployee.position_title ||
          "";

        setValue("position_title", positionTitle);

        if (positionId) {
          try {
            setIsKpisLoading(true);
            const kpisResponse = await fetchPositionKpis(positionId).unwrap();

            if (kpisResponse?.result && kpisResponse.result.length > 0) {
              const autoFilledKpis = kpisResponse.result.map((kpi) => ({
                source_kpi_id: kpi.id,
                objective_id: kpi.objective_id,
                objective_name: kpi.objective_name,
                distribution_percentage: kpi.distribution_percentage,
                deliverable: kpi.deliverable,
                target_percentage: kpi.target_percentage,
                actual_performance: kpi.actual_performance || null,
                rating: kpi.rating || null,
                remarks: kpi.remarks || "",
              }));
              setKpisList(autoFilledKpis);
              setValue("objectives", autoFilledKpis);
            } else {
              setKpisList([]);
              setValue("objectives", []);
            }
          } catch (error) {
            setKpisList([]);
            setValue("objectives", []);
          } finally {
            setIsKpisLoading(false);
          }
        }
      }
    };

    loadEmployeeKpis();
  }, [selectedEmployee, setValue, fetchPositionKpis, fetchSingleEmployee]);

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
        } else if (field === "rating") {
          let numValue = value === "" || value === null ? null : Number(value);

          if (numValue !== null) {
            if (numValue < 0) numValue = 0;
            if (numValue > 5) numValue = 5;
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

  useEffect(() => {
    return () => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
    };
  }, []);

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
              {isCreate ? (
                <Autocomplete
                  options={employees}
                  getOptionLabel={(option) =>
                    option.full_name || option.employee_name
                  }
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
                      fullWidth
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
                      sx={{ bgcolor: "white" }}
                    />
                  )}
                  disabled={isReadOnly}
                />
              ) : (
                <TextField
                  label="EMPLOYEE NAME"
                  value={formValues.employee_name || ""}
                  disabled
                  fullWidth
                  sx={{ bgcolor: "white" }}
                />
              )}
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
                    disabled
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
                    disabled
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
          PERFORMANCE OBJECTIVES
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
                          readOnly: true,
                        }}
                        placeholder="-"
                        sx={{
                          width: "100px",
                          "& .MuiOutlinedInput-root": {
                            backgroundColor: "white",
                            "& fieldset": {
                              borderColor: "#e0e0e0",
                            },
                            "&:hover fieldset": {
                              borderColor: "#e0e0e0",
                            },
                            "&.Mui-focused fieldset": {
                              borderColor: "#e0e0e0",
                            },
                          },
                        }}
                        disabled
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
                        inputProps={{
                          readOnly: true,
                        }}
                        sx={{
                          width: "100%",
                          "& .MuiOutlinedInput-root": {
                            backgroundColor: "white",
                            "& fieldset": {
                              borderColor: "#e0e0e0",
                            },
                            "&:hover fieldset": {
                              borderColor: "#e0e0e0",
                            },
                            "&.Mui-focused fieldset": {
                              borderColor: "#e0e0e0",
                            },
                          },
                        }}
                        disabled
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
              {isCreate && !selectedEmployee
                ? "Please select an Employee to load Performance Objectives"
                : "No Performance Objectives available"}
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default EvaluationFormModalFields;
