import React, {
  useEffect,
  useState,
  useMemo,
  useCallback,
  useRef,
} from "react";
import { useFormContext, Controller } from "react-hook-form";
import {
  Box,
  Alert,
  TextField,
  FormControl,
  Grid,
  InputAdornment,
  FormHelperText,
  Autocomplete,
} from "@mui/material";
import { useLazyGetAllShowSchedulesQuery } from "../../../../../features/api/extras/schedulesApi";
import { useLazyGetAllJobLevelsQuery } from "../../../../../features/api/masterlist/joblevelsApi";
import { useLazyGetAllPositionsQuery } from "../../../../../features/api/masterlist/positionsApi";

const PendingPositionForm = ({
  selectedPosition,
  isLoading = false,
  mode = "create",
}) => {
  const {
    control,
    formState: { errors },
    watch,
    trigger,
    setValue,
  } = useFormContext();

  const watchedValues = watch();
  const [fieldsInitialized, setFieldsInitialized] = useState(false);

  const [dropdownsLoaded, setDropdownsLoaded] = useState({
    positions: false,
    schedules: false,
    jobLevels: false,
  });

  const [
    triggerPositions,
    {
      data: positionsApiData,
      isLoading: positionsLoading,
      error: positionsError,
    },
  ] = useLazyGetAllPositionsQuery();

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

  const handleDropdownFocus = useCallback(
    (dropdownName) => {
      if (mode === "view" || dropdownsLoaded[dropdownName]) return;

      const fetchParams = { page: 1, per_page: 1000, status: "active" };

      switch (dropdownName) {
        case "positions":
          triggerPositions(fetchParams);
          break;
        case "schedules":
          triggerSchedules(fetchParams);
          break;
        case "jobLevels":
          triggerJobLevels(fetchParams);
          break;
      }

      setDropdownsLoaded((prev) => ({ ...prev, [dropdownName]: true }));
    },
    [
      dropdownsLoaded,
      triggerPositions,
      triggerSchedules,
      triggerJobLevels,
      mode,
    ]
  );

  const normalizeApiData = (data) => {
    if (!data) return [];
    return Array.isArray(data)
      ? data
      : data.result || data.data || data.items || data.results || [];
  };

  const positions = useMemo(() => {
    if (mode === "view" && selectedPosition?.position_details?.position) {
      return [selectedPosition.position_details.position];
    }
    if (mode === "edit" && selectedPosition?.position_details?.position) {
      const existingPosition = selectedPosition.position_details.position;
      const apiPositions = normalizeApiData(positionsApiData);

      if (!positionsApiData) {
        return [existingPosition];
      }

      const hasExistingInApi = apiPositions.some(
        (pos) => pos.id === existingPosition.id
      );

      if (!hasExistingInApi) {
        return [existingPosition, ...apiPositions];
      }

      return apiPositions;
    }
    return normalizeApiData(positionsApiData);
  }, [mode, positionsApiData, selectedPosition?.position_details?.position]);

  const schedules = useMemo(() => {
    if (mode === "view" && selectedPosition?.position_details?.schedule) {
      return [selectedPosition.position_details.schedule];
    }
    if (mode === "edit" && selectedPosition?.position_details?.schedule) {
      const existingSchedule = selectedPosition.position_details.schedule;
      const apiSchedules = normalizeApiData(schedulesApiData);

      if (!schedulesApiData) {
        return [existingSchedule];
      }

      const hasExistingInApi = apiSchedules.some(
        (sched) => sched.id === existingSchedule.id
      );

      if (!hasExistingInApi) {
        return [existingSchedule, ...apiSchedules];
      }

      return apiSchedules;
    }
    return normalizeApiData(schedulesApiData);
  }, [mode, schedulesApiData, selectedPosition?.position_details?.schedule]);

  const jobLevels = useMemo(() => {
    if (mode === "view" && selectedPosition?.position_details?.job_level) {
      return [selectedPosition.position_details.job_level];
    }
    if (mode === "edit" && selectedPosition?.position_details?.job_level) {
      const existingJobLevel = selectedPosition.position_details.job_level;
      const apiJobLevels = normalizeApiData(jobLevelsApiData);

      if (!jobLevelsApiData) {
        return [existingJobLevel];
      }

      const hasExistingInApi = apiJobLevels.some(
        (level) => level.id === existingJobLevel.id
      );

      if (!hasExistingInApi) {
        return [existingJobLevel, ...apiJobLevels];
      }

      return apiJobLevels;
    }
    return normalizeApiData(jobLevelsApiData);
  }, [mode, jobLevelsApiData, selectedPosition?.position_details?.job_level]);

  const isReadOnly = mode === "view";

  return (
    <Box
      className="general-form"
      sx={{ width: "100%", maxWidth: "1200px", overflow: "0" }}>
      {mode !== "view" && positionsError && (
        <Alert severity="warning" sx={{ mb: 1 }}>
          Failed to load positions from server.
        </Alert>
      )}
      {mode !== "view" && schedulesError && (
        <Alert severity="warning" sx={{ mb: 1 }}>
          Failed to load schedules from server.
        </Alert>
      )}
      {mode !== "view" && jobLevelsError && (
        <Alert severity="warning" sx={{ mb: 1 }}>
          Failed to load job levels from server.
        </Alert>
      )}

      <Grid container spacing={1.2}>
        <Grid item xs={12} md={6}>
          <Controller
            name="position_id"
            control={control}
            render={({
              field: { onChange, value, onBlur },
              fieldState: { error },
            }) => (
              <FormControl
                fullWidth
                variant="outlined"
                error={!!error}
                disabled={
                  isLoading ||
                  (mode !== "view" && positionsLoading) ||
                  isReadOnly
                }
                sx={{ minWidth: "360px", maxWidth: "360px" }}>
                <Autocomplete
                  onChange={(event, item) => {
                    if (!isReadOnly) {
                      onChange(item || null);
                      setValue("position", item);
                    }
                  }}
                  onBlur={() => {
                    if (!value || !value.id) {
                      onChange(null);
                    }
                    onBlur();
                  }}
                  value={value || null}
                  options={positions ?? []}
                  loading={mode !== "view" && positionsLoading}
                  disabled={isLoading || isReadOnly}
                  readOnly={isReadOnly}
                  getOptionLabel={(item) => {
                    if (!item) return "";
                    return (
                      item?.title?.name ||
                      item?.name ||
                      item?.title ||
                      item?.position_title ||
                      item?.position_name ||
                      ""
                    );
                  }}
                  isOptionEqualToValue={(option, value) => {
                    if (!option || !value) return false;
                    return option.id === value.id;
                  }}
                  onFocus={() => {
                    if (!isReadOnly) {
                      handleDropdownFocus("positions");
                    }
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label={
                        <>
                          Position Title <span style={{ color: "red" }}>*</span>
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
        </Grid>

        <Grid item xs={12} md={6}>
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
                disabled={
                  isLoading ||
                  (mode !== "view" && schedulesLoading) ||
                  isReadOnly
                }
                sx={{ minWidth: "360px", maxWidth: "360px" }}>
                <Autocomplete
                  onChange={(event, item) => {
                    if (!isReadOnly) {
                      onChange(item || null);
                      setValue("schedule", item);
                    }
                  }}
                  onBlur={() => {
                    if (!value || !value.id) {
                      onChange(null);
                    }
                    onBlur();
                  }}
                  value={value || null}
                  disabled={isLoading || isReadOnly}
                  readOnly={isReadOnly}
                  options={schedules ?? []}
                  loading={mode !== "view" && schedulesLoading}
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
                  onFocus={() => {
                    if (!isReadOnly) {
                      handleDropdownFocus("schedules");
                    }
                  }}
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
        </Grid>

        <Grid item xs={12} md={6}>
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
                disabled={
                  isLoading ||
                  (mode !== "view" && jobLevelsLoading) ||
                  isReadOnly
                }
                sx={{ minWidth: "360px", maxWidth: "360px" }}>
                <Autocomplete
                  onChange={(event, item) => {
                    if (!isReadOnly) {
                      onChange(item || null);
                      setValue("job_level", item);
                    }
                  }}
                  onBlur={() => {
                    if (!value || !value.id) {
                      onChange(null);
                    }
                    onBlur();
                  }}
                  value={value || null}
                  options={jobLevels ?? []}
                  loading={mode !== "view" && jobLevelsLoading}
                  disabled={isLoading || isReadOnly}
                  readOnly={isReadOnly}
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
                  onFocus={() => {
                    if (!isReadOnly) {
                      handleDropdownFocus("jobLevels");
                    }
                  }}
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
        </Grid>

        <Grid item xs={12} md={6}>
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
                label="Job Rate *"
                disabled={isLoading || isReadOnly}
                error={!!error}
                helperText={error?.message || ""}
                type="number"
                sx={{ minWidth: "360px", maxWidth: "360px" }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">₱</InputAdornment>
                  ),
                  readOnly: isReadOnly,
                }}
              />
            )}
          />
        </Grid>

        <Grid item xs={12} md={6}>
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
                sx={{ minWidth: "360px", maxWidth: "360px" }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">₱</InputAdornment>
                  ),
                  readOnly: isReadOnly,
                }}
              />
            )}
          />
        </Grid>

        <Grid item xs={12} md={6}>
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
                sx={{ minWidth: "360px", maxWidth: "360px" }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">₱</InputAdornment>
                  ),
                  readOnly: isReadOnly,
                }}
              />
            )}
          />
        </Grid>

        <Grid item xs={12} md={6}>
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
                sx={{ minWidth: "544px", maxWidth: "544px" }}
                InputProps={{
                  readOnly: isReadOnly,
                }}
              />
            )}
          />
        </Grid>

        <Grid item xs={12} md={6}>
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
                j
                placeholder="List additional tools or equipment..."
                sx={{ minWidth: "544px", maxWidth: "544px" }}
                InputProps={{
                  readOnly: isReadOnly,
                }}
              />
            )}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

PendingPositionForm.displayName = "PendingPositionForm";

export default PendingPositionForm;
