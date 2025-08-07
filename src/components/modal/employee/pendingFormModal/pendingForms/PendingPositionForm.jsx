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

  useEffect(() => {
    const fetchParams = { page: 1, per_page: 1000, status: "active" };

    if (mode === "edit" || mode === "view") {
      triggerPositions(fetchParams);
      triggerSchedules(fetchParams);
      triggerJobLevels(fetchParams);

      setDropdownsLoaded({
        positions: true,
        schedules: true,
        jobLevels: true,
      });
    } else if (mode === "create") {
      triggerPositions(fetchParams);
      triggerSchedules(fetchParams);
      triggerJobLevels(fetchParams);

      setDropdownsLoaded({
        positions: true,
        schedules: true,
        jobLevels: true,
      });
    }
  }, [mode, triggerPositions, triggerSchedules, triggerJobLevels]);

  const handleDropdownFocus = useCallback(
    (dropdownName) => {
      if (dropdownsLoaded[dropdownName]) return;

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
    [dropdownsLoaded, triggerPositions, triggerSchedules, triggerJobLevels]
  );

  const normalizeApiData = (data) => {
    if (!data) return [];
    return Array.isArray(data)
      ? data
      : data.result || data.data || data.items || data.results || [];
  };

  const positions = useMemo(
    () => normalizeApiData(positionsApiData),
    [positionsApiData]
  );
  const schedules = useMemo(
    () => normalizeApiData(schedulesApiData),
    [schedulesApiData]
  );
  const jobLevels = useMemo(
    () => normalizeApiData(jobLevelsApiData),
    [jobLevelsApiData]
  );

  const isReadOnly = mode === "view";

  return (
    <Box
      className="general-form"
      sx={{ width: "100%", maxWidth: "1200px", overflow: "0" }}>
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

      <Grid container spacing={1.2}>
        <Grid item xs={12} md={6}>
          <Controller
            name="position"
            control={control}
            render={({
              field: { onChange, value, onBlur },
              fieldState: { error },
            }) => (
              <FormControl
                fullWidth
                variant="outlined"
                error={!!error}
                disabled={isLoading || isReadOnly}
                sx={{ minWidth: "360px", maxWidth: "360px" }}>
                <Autocomplete
                  onChange={(event, item) => {
                    if (!isReadOnly) {
                      onChange(item);
                      // Also update the position_id field
                      setValue("position_id", item ? item.id : "");
                    }
                  }}
                  onBlur={onBlur}
                  value={value || null}
                  options={positions ?? []}
                  loading={positionsLoading}
                  disabled={isLoading || isReadOnly}
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
                  onOpen={() => {
                    if (!isReadOnly) {
                      handleDropdownFocus("positions");
                    }
                  }}
                  onFocus={() => {
                    if (!isReadOnly) {
                      handleDropdownFocus("positions");
                    }
                  }}
                  readOnly={isReadOnly}
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
                      onBlur={params.InputProps.onBlur}
                      onFocus={() => {
                        params.InputProps.onFocus?.();
                        if (!isReadOnly) {
                          handleDropdownFocus("positions");
                        }
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
        </Grid>

        <Grid item xs={12} md={6}>
          <Controller
            name="schedule"
            control={control}
            render={({
              field: { onChange, value, onBlur },
              fieldState: { error },
            }) => (
              <FormControl
                fullWidth
                variant="outlined"
                error={!!error}
                disabled={isLoading || schedulesLoading || isReadOnly}
                sx={{ minWidth: "360px", maxWidth: "360px" }}>
                <Autocomplete
                  onChange={(event, item) => {
                    if (!isReadOnly) {
                      onChange(item);
                      // Also update the schedule_id field
                      setValue("schedule_id", item ? item.id : "");
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
                    if (!isReadOnly) {
                      handleDropdownFocus("schedules");
                    }
                  }}
                  onFocus={() => {
                    if (!isReadOnly) {
                      handleDropdownFocus("schedules");
                    }
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
                        if (!isReadOnly) {
                          handleDropdownFocus("schedules");
                        }
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
        </Grid>

        <Grid item xs={12} md={6}>
          <Controller
            name="job_level"
            control={control}
            render={({
              field: { onChange, value, onBlur },
              fieldState: { error },
            }) => (
              <FormControl
                fullWidth
                variant="outlined"
                error={!!error}
                disabled={isLoading || isReadOnly}
                sx={{ minWidth: "360px", maxWidth: "360px" }}>
                <Autocomplete
                  onChange={(event, item) => {
                    if (!isReadOnly) {
                      onChange(item);
                      // Also update the job_level_id field
                      setValue("job_level_id", item ? item.id : "");
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
                    if (!isReadOnly) {
                      handleDropdownFocus("jobLevels");
                    }
                  }}
                  onFocus={() => {
                    if (!isReadOnly) {
                      handleDropdownFocus("jobLevels");
                    }
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
                        if (!isReadOnly) {
                          handleDropdownFocus("jobLevels");
                        }
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
