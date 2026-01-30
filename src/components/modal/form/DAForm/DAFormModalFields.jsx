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
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";
import { sectionTitleStyles } from "./DAFormModal.styles";
import {
  useLazyGetPositionKpisQuery,
  useGetAllEmployeesDaQuery,
} from "../../../../features/api/forms/daformApi";
import { useGetAllEmployeeMovementSubmissionsQuery } from "../../../../features/api/approvalsetting/formSubmissionApi";

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
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [selectedMrf, setSelectedMrf] = useState(null);
  const [kpisList, setKpisList] = useState([]);
  const [shouldFetchEmployees, setShouldFetchEmployees] = useState(false);
  const [shouldFetchMrf, setShouldFetchMrf] = useState(false);
  const [isKpisLoading, setIsKpisLoading] = useState(false);
  const [hasSyncedMrf, setHasSyncedMrf] = useState(false);

  const isInitialMount = useRef(true);
  const prevModeRef = useRef(currentMode);
  const prevSelectedMrfRef = useRef(null);

  const { data: employeesData, isLoading: isEmployeesLoading } =
    useGetAllEmployeesDaQuery(undefined, {
      skip: !shouldFetchEmployees,
    });

  const { data: mrfData, isLoading: isMrfLoading } =
    useGetAllEmployeeMovementSubmissionsQuery(
      {
        status: "active",
      },
      {
        skip: !shouldFetchMrf,
      },
    );

  const [fetchPositionKpis] = useLazyGetPositionKpisQuery();

  const employees = Array.isArray(employeesData?.result?.data)
    ? employeesData.result.data
    : [];

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
    if (selectedEmployee) {
      setValue("employee_id", selectedEmployee.id);
      setValue("employee_name", selectedEmployee.employee_name);
    }
  }, [selectedEmployee, setValue]);

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
        setValue("to_position_code", "");
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
      }

      prevSelectedMrfRef.current = selectedMrf;
    };

    loadMrfData();
  }, [selectedMrf, setValue, fetchPositionKpis, isCreate, isReadOnly]);

  const handleMrfOpen = () => {
    setShouldFetchMrf(true);
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
                md: "repeat(2, 1fr)",
              },
              "@media (min-width: 750px)": {
                gridTemplateColumns: "repeat(2, 1fr)",
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
                  onChange={(event, newValue) => {
                    setSelectedMrf(newValue);
                  }}
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
                sm: "1fr",
                md: "repeat(2, 1fr)",
              },
              "@media (min-width: 750px)": {
                gridTemplateColumns: "repeat(2, 1fr)",
              },
              gap: 3,
              mt: 2,
            }}>
            <Box>
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
                      if (date) {
                        const endDate = dayjs(date).add(6, "month");
                        setValue("end_date", endDate);
                      } else {
                        setValue("end_date", null);
                      }
                    }}
                    label={
                      <span>
                        Inclusive Dates - From{" "}
                        <span style={{ color: "red" }}>*</span>
                      </span>
                    }
                    disabled={true}
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
                    label={
                      <span>
                        Inclusive Dates - To{" "}
                        <span style={{ color: "red" }}>*</span>
                      </span>
                    }
                    disabled={true}
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
    </Box>
  );
};

export default DAFormModalFields;
