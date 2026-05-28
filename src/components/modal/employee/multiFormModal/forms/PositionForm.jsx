import React, { useState, useMemo, useCallback } from "react";
import { useFormContext, Controller } from "react-hook-form";
import {
  Box,
  Alert,
  TextField,
  FormControl,
  InputAdornment,
  Autocomplete,
} from "@mui/material";
import { useLazyGetAllShowSchedulesQuery } from "../../../../../features/api/extras/schedulesApi";
import { useLazyGetAllJobLevelsQuery } from "../../../../../features/api/masterlist/joblevelsApi";
import { useGetAllPositionsQuery } from "../../../../../features/api/masterlist/positionsApi";
import EmployeeHeader from "./EmployeeHeader";
import "./General.scss";

const PositionForm = ({
  selectedPosition,
  isLoading = false,
  mode = "create",
  employeeData,
}) => {
  const {
    control,
    formState: { errors },
    watch,
    setValue,
    getValues,
  } = useFormContext();

  const [dropdownsLoaded, setDropdownsLoaded] = useState({
    schedules: false,
    jobLevels: false,
  });

  const {
    data: positionsApiData,
    isLoading: positionsLoading,
    error: positionsError,
  } = useGetAllPositionsQuery({ page: 1, per_page: 1000, status: "active" });

  const [
    triggerSchedules,
    {
      data: schedulesApiData,
      isLoading: schedulesLoading,
      error: schedulesError,
    },
  ] = useLazyGetAllShowSchedulesQuery();

  const [
    triggerJobLevels,
    {
      data: jobLevelsApiData,
      isLoading: jobLevelsLoading,
      error: jobLevelsError,
    },
  ] = useLazyGetAllJobLevelsQuery();

  const isReadOnly = mode === "view";

  const normalizeApiData = useCallback((data) => {
    if (!data) return [];
    return Array.isArray(data)
      ? data
      : data.result || data.data || data.items || data.results || [];
  }, []);

  const positions = useMemo(() => {
    if (mode === "view" && employeeData?.position_title) {
      return [
        {
          id: employeeData.position_id || employeeData.position_title,
          name: employeeData.position_title,
          title: employeeData.position_title,
          title_with_unit: employeeData.position_title,
        },
      ];
    }
    if (mode === "edit" && employeeData?.position_title) {
      const existingPosition = {
        id: employeeData.position_id || employeeData.position_title,
        name: employeeData.position_title,
        title: employeeData.position_title,
        title_with_unit: employeeData.position_title,
      };
      const apiPositions = normalizeApiData(positionsApiData);
      if (!positionsApiData) return [existingPosition];
      const hasExisting = apiPositions.some(
        (p) => p.id === existingPosition.id,
      );
      return hasExisting ? apiPositions : [existingPosition, ...apiPositions];
    }
    return normalizeApiData(positionsApiData);
  }, [
    mode,
    positionsApiData,
    employeeData?.position_title,
    employeeData?.position_id,
    normalizeApiData,
  ]);

  const schedules = useMemo(() => {
    if (mode === "view" && employeeData?.schedule_id) {
      return [employeeData.schedule_id];
    }
    if (mode === "edit" && employeeData?.schedule_id) {
      const existingSchedule = employeeData.schedule_id;
      const apiSchedules = normalizeApiData(schedulesApiData);
      if (!schedulesApiData) return [existingSchedule];
      const hasExisting = apiSchedules.some(
        (s) => s.id === existingSchedule.id,
      );
      return hasExisting ? apiSchedules : [existingSchedule, ...apiSchedules];
    }
    return normalizeApiData(schedulesApiData);
  }, [mode, schedulesApiData, employeeData?.schedule_id, normalizeApiData]);

  const jobLevels = useMemo(() => {
    if (mode === "view" && employeeData?.job_level_id) {
      return [employeeData.job_level_id];
    }
    if (mode === "edit" && employeeData?.job_level_id) {
      const existingJobLevel = employeeData.job_level_id;
      const apiJobLevels = normalizeApiData(jobLevelsApiData);
      if (!jobLevelsApiData) return [existingJobLevel];
      const hasExisting = apiJobLevels.some(
        (j) => j.id === existingJobLevel.id,
      );
      return hasExisting ? apiJobLevels : [existingJobLevel, ...apiJobLevels];
    }
    return normalizeApiData(jobLevelsApiData);
  }, [mode, jobLevelsApiData, employeeData?.job_level_id, normalizeApiData]);

  const handleDropdownFocus = useCallback(
    (dropdownName) => {
      if (mode === "view" || dropdownsLoaded[dropdownName]) return;

      const fetchParams = { page: 1, per_page: 1000, status: "active" };

      switch (dropdownName) {
        case "schedules":
          triggerSchedules(fetchParams);
          break;
        case "jobLevels":
          triggerJobLevels(fetchParams);
          break;
      }

      setDropdownsLoaded((prev) => ({ ...prev, [dropdownName]: true }));
    },
    [dropdownsLoaded, triggerSchedules, triggerJobLevels, mode],
  );

  return (
    <Box
      className="general-form"
      sx={{ width: "100%", maxWidth: "1200px", overflow: "0" }}>
      <EmployeeHeader getValues={getValues} selectedGeneral={employeeData} />

      {positionsError && (
        <Alert severity="warning" sx={{ mb: 1 }}>
          Failed to load positions from server.
        </Alert>
      )}
      {schedulesError && (
        <Alert severity="warning" sx={{ mb: 1 }}>
          Failed to load schedules from server.
        </Alert>
      )}
      {jobLevelsError && (
        <Alert severity="warning" sx={{ mb: 1 }}>
          Failed to load job levels from server.
        </Alert>
      )}

      <Box sx={{ px: 2 }}>
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
              name="position_title"
              control={control}
              render={({
                field: { onChange, value, onBlur },
                fieldState: { error },
              }) => (
                <FormControl
                  fullWidth
                  variant="outlined"
                  error={!!error}
                  disabled={isLoading || positionsLoading || isReadOnly}>
                  <Autocomplete
                    onChange={(event, item) => {
                      if (!isReadOnly) {
                        const titleValue =
                          item?.title_with_unit ||
                          item?.title ||
                          item?.name ||
                          null;
                        onChange(titleValue);
                        setValue("position_id", item?.id || null);
                        setValue("position", item || null);
                      }
                    }}
                    onBlur={onBlur}
                    value={
                      value
                        ? positions.find(
                            (p) =>
                              (p.title_with_unit || p.title || p.name) ===
                              value,
                          ) || {
                            name: value,
                            title: value,
                            title_with_unit: value,
                          }
                        : null
                    }
                    disabled={isLoading || isReadOnly}
                    options={positions ?? []}
                    loading={positionsLoading}
                    getOptionLabel={(item) => {
                      if (!item) return "";
                      return (
                        item?.title_with_unit || item?.title || item?.name || ""
                      );
                    }}
                    isOptionEqualToValue={(option, value) => {
                      if (!option || !value) return false;
                      return (
                        option.id === value.id ||
                        (option.title_with_unit ||
                          option.title ||
                          option.name) ===
                          (value.title_with_unit || value.title || value.name)
                      );
                    }}
                    renderOption={(props, item) => (
                      <li {...props} key={item.id}>
                        <Box sx={{ display: "flex", flexDirection: "column" }}>
                          <span style={{ fontSize: "0.875rem" }}>
                            {item?.title_with_unit ||
                              item?.title ||
                              item?.name ||
                              ""}
                          </span>
                          {item?.code && (
                            <span
                              style={{ fontSize: "0.75rem", color: "#888" }}>
                              {item.code}
                              {item?.charging?.name
                                ? ` • ${item.charging.name}`
                                : ""}
                              {item?.team ? ` • ${item.team}` : ""}
                            </span>
                          )}
                        </Box>
                      </li>
                    )}
                    readOnly={isReadOnly}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label={
                          <>
                            Position Title{" "}
                            <span style={{ color: "red" }}>*</span>
                          </>
                        }
                        error={!!error}
                        helperText={error?.message || ""}
                        InputProps={{
                          ...params.InputProps,
                          readOnly: isReadOnly,
                        }}
                      />
                    )}
                  />
                </FormControl>
              )}
            />
          </Box>

          <Box>
            <Controller
              name="schedule_id"
              control={control}
              render={({
                field: { onChange, value, onBlur },
                fieldState: { error },
              }) => (
                <FormControl
                  fullWidth
                  variant="outlined"
                  error={!!error}
                  disabled={isLoading || schedulesLoading || isReadOnly}>
                  <Autocomplete
                    onChange={(event, item) => {
                      if (!isReadOnly) {
                        onChange(item);
                      }
                    }}
                    onBlur={onBlur}
                    value={value || null}
                    disabled={isLoading || isReadOnly}
                    options={schedules ?? []}
                    loading={schedulesLoading}
                    getOptionLabel={(item) => {
                      if (!item) return "";
                      return (
                        item?.name ||
                        item?.title ||
                        item?.schedule_name ||
                        item?.schedule_title ||
                        ""
                      );
                    }}
                    isOptionEqualToValue={(option, value) => {
                      if (!option || !value) return false;
                      return option.id === value.id;
                    }}
                    onOpen={() => {
                      if (!isReadOnly) handleDropdownFocus("schedules");
                    }}
                    onFocus={() => {
                      if (!isReadOnly) handleDropdownFocus("schedules");
                    }}
                    readOnly={isReadOnly}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label={
                          <>
                            Schedule <span style={{ color: "red" }}>*</span>
                          </>
                        }
                        error={!!error}
                        helperText={error?.message || ""}
                        onBlur={params.InputProps.onBlur}
                        onFocus={() => {
                          params.InputProps.onFocus?.();
                          if (!isReadOnly) handleDropdownFocus("schedules");
                        }}
                        InputProps={{
                          ...params.InputProps,
                          readOnly: isReadOnly,
                        }}
                      />
                    )}
                  />
                </FormControl>
              )}
            />
          </Box>

          <Box>
            <Controller
              name="job_level_id"
              control={control}
              render={({
                field: { onChange, value, onBlur },
                fieldState: { error },
              }) => (
                <FormControl
                  fullWidth
                  variant="outlined"
                  error={!!error}
                  disabled={isLoading || isReadOnly}>
                  <Autocomplete
                    onChange={(event, item) => {
                      if (!isReadOnly) {
                        onChange(item);
                      }
                    }}
                    onBlur={onBlur}
                    value={value || null}
                    options={jobLevels ?? []}
                    loading={jobLevelsLoading}
                    disabled={isLoading || isReadOnly}
                    getOptionLabel={(item) => {
                      if (!item) return "";
                      return (
                        item?.label ||
                        item?.title ||
                        item?.name ||
                        item?.job_level_name ||
                        item?.level_name ||
                        ""
                      );
                    }}
                    isOptionEqualToValue={(option, value) => {
                      if (!option || !value) return false;
                      return option.id === value.id;
                    }}
                    onOpen={() => {
                      if (!isReadOnly) handleDropdownFocus("jobLevels");
                    }}
                    onFocus={() => {
                      if (!isReadOnly) handleDropdownFocus("jobLevels");
                    }}
                    readOnly={isReadOnly}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label={
                          <>
                            Job Level <span style={{ color: "red" }}>*</span>
                          </>
                        }
                        error={!!error}
                        helperText={error?.message || ""}
                        onBlur={params.InputProps.onBlur}
                        onFocus={() => {
                          params.InputProps.onFocus?.();
                          if (!isReadOnly) handleDropdownFocus("jobLevels");
                        }}
                        InputProps={{
                          ...params.InputProps,
                          readOnly: isReadOnly,
                        }}
                      />
                    )}
                  />
                </FormControl>
              )}
            />
          </Box>

          <Box>
            <Controller
              name="job_rate"
              control={control}
              render={({
                field: { onChange, value, onBlur },
                fieldState: { error },
              }) => (
                <TextField
                  onChange={onChange}
                  onBlur={onBlur}
                  value={value || ""}
                  fullWidth
                  variant="outlined"
                  label={
                    <>
                      Job Rate <span style={{ color: "red" }}>*</span>
                    </>
                  }
                  disabled={isLoading || isReadOnly}
                  error={!!error}
                  helperText={error?.message || ""}
                  type="number"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">₱</InputAdornment>
                    ),
                    readOnly: isReadOnly,
                  }}
                />
              )}
            />
          </Box>

          <Box>
            <Controller
              name="allowance"
              control={control}
              render={({
                field: { onChange, value, onBlur },
                fieldState: { error },
              }) => (
                <TextField
                  onChange={onChange}
                  onBlur={onBlur}
                  value={value || ""}
                  fullWidth
                  variant="outlined"
                  label="Allowance (Optional)"
                  disabled={isLoading || isReadOnly}
                  error={!!error}
                  helperText={error?.message || ""}
                  type="number"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">₱</InputAdornment>
                    ),
                    readOnly: isReadOnly,
                  }}
                />
              )}
            />
          </Box>

          <Box>
            <Controller
              name="additional_rate"
              control={control}
              render={({
                field: { onChange, value, onBlur },
                fieldState: { error },
              }) => (
                <TextField
                  onChange={onChange}
                  onBlur={onBlur}
                  value={value || ""}
                  fullWidth
                  variant="outlined"
                  label="Additional Rate (Optional)"
                  disabled={isLoading || isReadOnly}
                  error={!!error}
                  helperText={error?.message || ""}
                  type="number"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">₱</InputAdornment>
                    ),
                    readOnly: isReadOnly,
                  }}
                />
              )}
            />
          </Box>

          <Box sx={{ gridColumn: "1 / -1" }}>
            <Controller
              name="additional_rate_remarks"
              control={control}
              render={({
                field: { onChange, value, onBlur },
                fieldState: { error },
              }) => (
                <TextField
                  onChange={onChange}
                  onBlur={onBlur}
                  value={value || ""}
                  fullWidth
                  variant="outlined"
                  label="Additional Rate Remarks (Optional)"
                  disabled={isLoading || isReadOnly}
                  error={!!error}
                  helperText={error?.message || ""}
                  multiline
                  rows={2}
                  placeholder="Enter remarks for additional rate..."
                  InputProps={{
                    readOnly: isReadOnly,
                  }}
                />
              )}
            />
          </Box>

          <Box sx={{ gridColumn: "1 / -1" }}>
            <Controller
              name="additional_tools"
              control={control}
              render={({
                field: { onChange, value, onBlur },
                fieldState: { error },
              }) => (
                <TextField
                  onChange={onChange}
                  onBlur={onBlur}
                  value={value || ""}
                  fullWidth
                  variant="outlined"
                  label="Additional Tools (Optional)"
                  disabled={isLoading || isReadOnly}
                  error={!!error}
                  helperText={error?.message || ""}
                  multiline
                  rows={2}
                  placeholder="List additional tools or equipment..."
                  InputProps={{
                    readOnly: isReadOnly,
                  }}
                />
              )}
            />
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

PositionForm.displayName = "PositionForm";

export default PositionForm;
