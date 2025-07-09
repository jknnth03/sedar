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
import "./General.scss";

const PositionForm = ({
  selectedPosition,
  isLoading = false,
  mode = "create",
}) => {
  const {
    control,
    formState: { errors },
    watch,
    trigger,
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
    if (mode === "edit" || mode === "view") {
      const fetchParams = { page: 1, per_page: 1000, status: "active" };

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

  const handleDropdownFocus = (dropdownName) => {
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
  };

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

  const handleFieldChange = async (fieldName, value) => {
    await trigger(fieldName);
  };

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

      <Grid container spacing={1.5} sx={{ width: "100%" }}>
        <Grid item xs={12} sm={3} sx={{ minWidth: "353px", maxWidth: "350px" }}>
          <Controller
            name="position_id"
            control={control}
            render={({ field: { onChange, value, onBlur } }) => (
              <FormControl
                fullWidth
                variant="outlined"
                error={!!errors.position_id}
                disabled={isLoading || isReadOnly}
                sx={{
                  width: "100%",
                  "& .MuiFormHelperText-root": {
                    marginTop: "4px",
                  },
                }}>
                <Autocomplete
                  onChange={(event, item) => {
                    if (!isReadOnly) {
                      onChange(item);
                      handleFieldChange("position_id", item);
                    }
                  }}
                  onBlur={onBlur}
                  value={value || null}
                  options={positions ?? []}
                  loading={positionsLoading}
                  disabled={isLoading || isReadOnly}
                  getOptionLabel={(item) =>
                    item?.title?.name ||
                    item?.name ||
                    item?.title ||
                    item?.position_title ||
                    item?.position_name ||
                    ""
                  }
                  isOptionEqualToValue={(option, value) => {
                    if (!option || !value) return false;
                    return option.id === value.id;
                  }}
                  onOpen={() => {
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
                      error={!!errors.position_id}
                      helperText={errors.position_id?.message}
                      onBlur={onBlur}
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

        <Grid item xs={12} sm={3} sx={{ minWidth: "353px", maxWidth: "350px" }}>
          <Controller
            name="schedule_id"
            control={control}
            render={({ field: { onChange, value, onBlur } }) => (
              <FormControl
                fullWidth
                variant="outlined"
                error={!!errors.schedule_id}
                disabled={isLoading || schedulesLoading || isReadOnly}
                sx={{
                  width: "100%",
                  "& .MuiFormHelperText-root": {
                    marginTop: "4px",
                  },
                }}>
                <Autocomplete
                  onChange={(event, item) => {
                    if (!isReadOnly) {
                      onChange(item);
                      handleFieldChange("schedule_id", item);
                    }
                  }}
                  onBlur={onBlur}
                  value={value || null}
                  disabled={isLoading || isReadOnly}
                  options={schedules ?? []}
                  loading={schedulesLoading}
                  getOptionLabel={(item) =>
                    item?.name ||
                    item?.title ||
                    item?.schedule_name ||
                    item?.schedule_title ||
                    ""
                  }
                  isOptionEqualToValue={(option, value) => {
                    if (!option || !value) return false;
                    return option.id === value.id;
                  }}
                  onOpen={() => {
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
                      error={!!errors.schedule_id}
                      helperText={errors.schedule_id?.message}
                      onBlur={onBlur}
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

        <Grid item xs={12} sm={3} sx={{ minWidth: "353px", maxWidth: "350px" }}>
          <Controller
            name="job_level_id"
            control={control}
            render={({ field: { onChange, value, onBlur } }) => (
              <FormControl
                fullWidth
                variant="outlined"
                error={!!errors.job_level_id}
                disabled={isLoading || isReadOnly}
                sx={{
                  width: "100%",
                  "& .MuiFormHelperText-root": {
                    marginTop: "4px",
                  },
                }}>
                <Autocomplete
                  onChange={(event, item) => {
                    if (!isReadOnly) {
                      onChange(item);
                      handleFieldChange("job_level_id", item);
                    }
                  }}
                  onBlur={onBlur}
                  value={value || null}
                  options={jobLevels ?? []}
                  loading={jobLevelsLoading}
                  disabled={isLoading || isReadOnly}
                  getOptionLabel={(item) =>
                    item?.label ||
                    item?.title ||
                    item?.name ||
                    item?.job_level_name ||
                    item?.level_name ||
                    ""
                  }
                  isOptionEqualToValue={(option, value) => {
                    if (!option || !value) return false;
                    return option.id === value.id;
                  }}
                  onOpen={() => {
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
                      error={!!errors.job_level_id}
                      helperText={errors.job_level_id?.message}
                      onBlur={onBlur}
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

        <Grid item xs={12} sm={3} sx={{ minWidth: "353px", maxWidth: "350px" }}>
          <Controller
            name="job_rate"
            control={control}
            render={({ field: { onChange, value, onBlur } }) => (
              <TextField
                onChange={(e) => {
                  onChange(e);
                  handleFieldChange("job_rate", e.target.value);
                }}
                onBlur={onBlur}
                value={value || ""}
                fullWidth
                variant="outlined"
                label="Job Rate *"
                disabled={isLoading || isReadOnly}
                error={!!errors.job_rate}
                helperText={errors.job_rate?.message}
                type="number"
                sx={{
                  width: "100%",
                  "& .MuiFormHelperText-root": {
                    marginTop: "4px",
                  },
                }}
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

        <Grid item xs={12} sm={3} sx={{ minWidth: "353px", maxWidth: "350px" }}>
          <Controller
            name="allowance"
            control={control}
            render={({ field: { onChange, value, onBlur } }) => (
              <TextField
                onChange={(e) => {
                  onChange(e);
                  handleFieldChange("allowance", e.target.value);
                }}
                onBlur={onBlur}
                value={value || ""}
                fullWidth
                variant="outlined"
                label="Allowance (Optional)"
                disabled={isLoading || isReadOnly}
                error={!!errors.allowance}
                helperText={errors.allowance?.message}
                type="number"
                sx={{
                  width: "100%",
                  "& .MuiFormHelperText-root": {
                    marginTop: "4px",
                  },
                }}
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

        <Grid item xs={12} sm={3} sx={{ minWidth: "353px", maxWidth: "350px" }}>
          <Controller
            name="additional_rate"
            control={control}
            render={({ field: { onChange, value, onBlur } }) => (
              <TextField
                onChange={(e) => {
                  onChange(e);
                  handleFieldChange("additional_rate", e.target.value);
                }}
                onBlur={onBlur}
                value={value || ""}
                fullWidth
                variant="outlined"
                label="Additional Rate (Optional)"
                disabled={isLoading || isReadOnly}
                error={!!errors.additional_rate}
                helperText={errors.additional_rate?.message}
                type="number"
                sx={{
                  width: "100%",
                  "& .MuiFormHelperText-root": {
                    marginTop: "4px",
                  },
                }}
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

        <Grid item xs={12} sm={6} sx={{ minWidth: "535px", maxWidth: "700px" }}>
          <Controller
            name="additional_rate_remarks"
            control={control}
            render={({ field: { onChange, value, onBlur } }) => (
              <TextField
                onChange={(e) => {
                  onChange(e);
                  handleFieldChange("additional_rate_remarks", e.target.value);
                }}
                onBlur={onBlur}
                value={value || ""}
                fullWidth
                variant="outlined"
                label="Additional Rate Remarks (Optional)"
                disabled={isLoading || isReadOnly}
                error={!!errors.additional_rate_remarks}
                helperText={errors.additional_rate_remarks?.message}
                sx={{
                  width: "100%",
                  "& .MuiFormHelperText-root": {
                    marginTop: "4px",
                  },
                }}
                multiline
                rows={2}
                placeholder="Enter remarks for additional rate..."
                InputProps={{
                  readOnly: isReadOnly,
                }}
              />
            )}
          />
        </Grid>

        <Grid item xs={12} sm={6} sx={{ minWidth: "535px", maxWidth: "700px" }}>
          <Controller
            name="additional_tools"
            control={control}
            render={({ field: { onChange, value, onBlur } }) => (
              <TextField
                onChange={(e) => {
                  onChange(e);
                  handleFieldChange("additional_tools", e.target.value);
                }}
                onBlur={onBlur}
                value={value || ""}
                fullWidth
                variant="outlined"
                label="Additional Tools (Optional)"
                disabled={isLoading || isReadOnly}
                error={!!errors.additional_tools}
                helperText={errors.additional_tools?.message}
                sx={{
                  width: "100%",
                  "& .MuiFormHelperText-root": {
                    marginTop: "4px",
                  },
                }}
                multiline
                rows={2}
                placeholder="List additional tools or equipment..."
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

PositionForm.displayName = "PositionForm";

export default PositionForm;
