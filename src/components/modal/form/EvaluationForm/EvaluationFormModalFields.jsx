import React, { useEffect, useState, useRef } from "react";
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
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";
import { sectionTitleStyles } from "./EvaluationFormModal.styles";
import {
  useGetEmployeesProbationaryQuery,
  useLazyGetPositionKpisQuery,
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

  const { data: employeesData, isLoading: isEmployeesLoading } =
    useGetEmployeesProbationaryQuery(undefined, {
      skip: !shouldFetchEmployees,
    });

  const [fetchPositionKpis] = useLazyGetPositionKpisQuery();

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

        const positionId =
          selectedEmployee.position?.position?.id ||
          selectedEmployee.position_id;
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
                actual_performance: null,
                rating: null,
                remarks: null,
              }));
              setKpisList(autoFilledKpis);
              setValue("objectives", autoFilledKpis);
            } else {
              setKpisList([]);
              setValue("objectives", []);
            }
          } catch (error) {
            console.error("Error fetching KPIs:", error);
            setKpisList([]);
            setValue("objectives", []);
          } finally {
            setIsKpisLoading(false);
          }
        }
      }
    };

    loadEmployeeKpis();
  }, [selectedEmployee, setValue, fetchPositionKpis]);

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
                label="POSITION"
                value={formValues.position_title || ""}
                disabled
                sx={{ bgcolor: "white", width: "348px" }}
              />
            </Grid>
          </Grid>
        </Box>
      </Grid>

      <Grid item xs={12}>
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
                        </Box>
                        <Box sx={{ flex: 1, textAlign: "center" }}>
                          <TextField
                            size="small"
                            type="number"
                            value={kpi.target_percentage}
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
              {isCreate && !selectedEmployee
                ? "Please select an Employee to load Performance Objectives"
                : "No Performance Objectives available"}
            </Typography>
          </Box>
        )}
      </Grid>
    </Grid>
  );
};

export default EvaluationFormModalFields;
