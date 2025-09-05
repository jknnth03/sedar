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
import EmployeeHeader from "./EmployeeHeader";
import "./General.scss";
import { useSelector } from "react-redux";

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
    trigger,
    setValue,
    getValues,
  } = useFormContext();

  const watchedValues = watch();
  const [fieldsInitialized, setFieldsInitialized] = useState(false);

  const [dropdownsLoaded, setDropdownsLoaded] = useState({
    positions: false,
    schedules: false,
    jobLevels: false,
  });

  const approvalFormData = useSelector((state) => state.form.approvalForm);

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
      triggerSchedules(fetchParams);
      triggerJobLevels(fetchParams);

      setDropdownsLoaded({
        positions: true,
        schedules: true,
        jobLevels: true,
      });
    } else if (mode === "create") {
      triggerSchedules(fetchParams);
      triggerJobLevels(fetchParams);

      setDropdownsLoaded({
        positions: true,
        schedules: true,
        jobLevels: true,
      });
    }
  }, [mode, triggerSchedules, triggerJobLevels]);

  useEffect(() => {
    if (approvalFormData?.submittable?.position?.title_with_unit) {
      setValue(
        "position_title",
        approvalFormData.submittable.position.title_with_unit
      );
    }
  }, [approvalFormData, setValue]);

  const handleDropdownFocus = useCallback(
    (dropdownName) => {
      if (dropdownsLoaded[dropdownName]) return;

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
    [dropdownsLoaded, triggerSchedules, triggerJobLevels]
  );

  const normalizeApiData = (data) => {
    if (!data) return [];
    return Array.isArray(data)
      ? data
      : data.result || data.data || data.items || data.results || [];
  };

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
      <EmployeeHeader getValues={getValues} selectedGeneral={employeeData} />
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
            name="position_title"
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
                    Position Title <span style={{ color: "red" }}>*</span>
                  </>
                }
                disabled={true}
                error={!!error}
                helperText={error?.message || "Auto-filled from selected form"}
                sx={{ minWidth: "360px", maxWidth: "360px" }}
                InputProps={{
                  readOnly: true,
                }}
              />
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
                disabled={isLoading || schedulesLoading || isReadOnly}
                sx={{ minWidth: "360px", maxWidth: "360px" }}>
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
                disabled={isLoading || isReadOnly}
                sx={{ minWidth: "360px", maxWidth: "360px" }}>
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

PositionForm.displayName = "PositionForm";

export default PositionForm;
