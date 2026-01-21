import React, { useEffect } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { Grid, TextField, Typography, Autocomplete } from "@mui/material";
import { sectionTitleStyles } from "../DAForm/DAFormModal.styles";
import {
  useGetAllPositionsQuery,
  useGetAllJobLevelsQuery,
} from "../../../../features/api/forms/mdaApi";

export const FromPositionFields = ({
  control,
  errors,
  isReadOnly,
  isCreate,
  showSummary,
  currentMode,
}) => {
  const { setValue, watch } = useFormContext();

  const shouldFetchData = currentMode === "edit" || currentMode === "create";

  const { data: jobLevelsData, isLoading: isJobLevelsLoading } =
    useGetAllJobLevelsQuery(undefined, {
      skip: !shouldFetchData,
    });
  const { data: positionsData, isLoading: isPositionsLoading } =
    useGetAllPositionsQuery(undefined, {
      skip: !shouldFetchData,
    });

  const jobLevels = jobLevelsData?.result || [];
  const positions = positionsData?.result || [];

  const fromPositionId = watch("from_position_id");
  const fromJobLevelId = watch("from_job_level_id");

  const getPositionLabel = (item) => {
    if (typeof item === "string") return item;
    if (!item) return "";
    if (item?.title && typeof item.title === "object" && item.title?.name) {
      return String(item.title.name);
    }
    if (item?.title && typeof item.title === "string") {
      return String(item.title);
    }
    return "";
  };

  useEffect(() => {
    if (shouldFetchData && fromPositionId && positions.length > 0) {
      const selectedPosition = positions.find((p) => p.id === fromPositionId);
      if (selectedPosition) {
        const positionTitle =
          typeof selectedPosition.title === "object"
            ? selectedPosition.title?.name || ""
            : selectedPosition.title || "";
        setValue("from_position_title", positionTitle, {
          shouldValidate: true,
        });
        setValue(
          "from_department",
          selectedPosition.charging?.department_name || "",
          { shouldValidate: true }
        );
        setValue(
          "from_sub_unit",
          selectedPosition.charging?.sub_unit_name || "",
          { shouldValidate: true }
        );

        const jobRate = selectedPosition.job_rate || "";
        const allowance = selectedPosition.allowance || "";

        if (jobRate) {
          setValue("from_job_rate", String(jobRate), { shouldValidate: true });
        }
        if (allowance) {
          setValue("from_allowance", String(allowance), {
            shouldValidate: true,
          });
        }
      }
    }
  }, [fromPositionId, positions, setValue, shouldFetchData]);

  useEffect(() => {
    if (shouldFetchData && fromJobLevelId && jobLevels.length > 0) {
      const selectedJobLevel = jobLevels.find((jl) => jl.id === fromJobLevelId);
      if (selectedJobLevel) {
        setValue("from_job_level", selectedJobLevel.name || "", {
          shouldValidate: true,
        });
      }
    }
  }, [fromJobLevelId, jobLevels, setValue, shouldFetchData]);

  if (showSummary) {
    return (
      <Grid item xs={12}>
        <Typography variant="h6" sx={sectionTitleStyles}>
          FROM POSITION
        </Typography>
        <Grid container spacing={1.6}>
          <Grid item sx={{ width: "336px", minWidth: "336px" }}>
            <Controller
              name="from_position_title"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  key={`summary_from_position_title_${field.value}`}
                  value={field.value || ""}
                  label="Position Title From"
                  fullWidth
                  disabled={true}
                  InputLabelProps={{ shrink: true }}
                />
              )}
            />
          </Grid>

          <Grid item sx={{ width: "336px", minWidth: "336px" }}>
            <Controller
              name="from_job_level"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  key={`summary_from_job_level_${field.value}`}
                  value={field.value || ""}
                  label="Job Level From"
                  fullWidth
                  disabled={true}
                  InputLabelProps={{ shrink: true }}
                />
              )}
            />
          </Grid>

          <Grid item sx={{ width: "336px", minWidth: "336px" }}>
            <Controller
              name="from_job_rate"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  key={`summary_from_job_rate_${field.value}`}
                  value={field.value || ""}
                  label="Job Rate From"
                  fullWidth
                  type="number"
                  disabled={true}
                  inputProps={{
                    step: "0.01",
                    min: "0",
                  }}
                  InputLabelProps={{ shrink: true }}
                />
              )}
            />
          </Grid>

          <Grid item sx={{ width: "336px", minWidth: "336px" }}>
            <Controller
              name="from_department"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  key={`summary_from_department_${field.value}`}
                  value={field.value || ""}
                  label="Department From"
                  fullWidth
                  disabled={true}
                  InputLabelProps={{ shrink: true }}
                />
              )}
            />
          </Grid>

          <Grid item sx={{ width: "336px", minWidth: "336px" }}>
            <Controller
              name="from_sub_unit"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  key={`summary_from_sub_unit_${field.value}`}
                  value={field.value || ""}
                  label="Sub Unit From"
                  fullWidth
                  disabled={true}
                  InputLabelProps={{ shrink: true }}
                />
              )}
            />
          </Grid>

          <Grid item sx={{ width: "336px", minWidth: "336px" }}>
            <Controller
              name="from_allowance"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  key={`summary_from_allowance_${field.value}`}
                  value={field.value || ""}
                  label="Allowance From"
                  fullWidth
                  type="number"
                  disabled={true}
                  inputProps={{
                    step: "0.01",
                    min: "0",
                  }}
                  InputLabelProps={{ shrink: true }}
                />
              )}
            />
          </Grid>

          <Grid item sx={{ width: "336px", minWidth: "336px" }}>
            <Controller
              name="from_additional_rate"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  key={`summary_from_additional_rate_${field.value}`}
                  value={field.value || ""}
                  label="Additional Rate From"
                  fullWidth
                  type="number"
                  disabled={true}
                  inputProps={{
                    step: "0.01",
                    min: "0",
                  }}
                  InputLabelProps={{ shrink: true }}
                />
              )}
            />
          </Grid>
        </Grid>
      </Grid>
    );
  }

  if (currentMode === "view") {
    return (
      <Grid item xs={12} key="from-position-view">
        <Typography variant="h6" sx={sectionTitleStyles}>
          FROM POSITION
        </Typography>
        <Grid container spacing={1.6}>
          <Grid item sx={{ width: "336px", minWidth: "336px" }}>
            <Controller
              name="from_position_title"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  value={field.value || ""}
                  label="Position"
                  fullWidth
                  disabled={true}
                  InputLabelProps={{ shrink: true }}
                />
              )}
            />
          </Grid>

          <Grid item sx={{ width: "336px", minWidth: "336px" }}>
            <Controller
              name="from_job_level"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  value={field.value || ""}
                  label="Job Level"
                  fullWidth
                  disabled={true}
                  InputLabelProps={{ shrink: true }}
                />
              )}
            />
          </Grid>

          <Grid item sx={{ width: "336px", minWidth: "336px" }}>
            <Controller
              name="from_position_title"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  value={field.value || ""}
                  label="Position Title From"
                  fullWidth
                  disabled={true}
                  InputLabelProps={{ shrink: true }}
                />
              )}
            />
          </Grid>

          <Grid item sx={{ width: "336px", minWidth: "336px" }}>
            <Controller
              name="from_department"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  value={field.value || ""}
                  label="Department From"
                  fullWidth
                  disabled={true}
                  InputLabelProps={{ shrink: true }}
                />
              )}
            />
          </Grid>

          <Grid item sx={{ width: "336px", minWidth: "336px" }}>
            <Controller
              name="from_sub_unit"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  value={field.value || ""}
                  label="Sub Unit From"
                  fullWidth
                  disabled={true}
                  InputLabelProps={{ shrink: true }}
                />
              )}
            />
          </Grid>

          <Grid item sx={{ width: "336px", minWidth: "336px" }}>
            <Controller
              name="from_job_level"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  value={field.value || ""}
                  label="Job Level From"
                  fullWidth
                  disabled={true}
                  InputLabelProps={{ shrink: true }}
                />
              )}
            />
          </Grid>

          <Grid item sx={{ width: "336px", minWidth: "336px" }}>
            <Controller
              name="from_job_rate"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  value={field.value || ""}
                  label="Job Rate From"
                  fullWidth
                  type="number"
                  disabled={true}
                  inputProps={{
                    step: "0.01",
                    min: "0",
                  }}
                  InputLabelProps={{ shrink: true }}
                />
              )}
            />
          </Grid>

          <Grid item sx={{ width: "336px", minWidth: "336px" }}>
            <Controller
              name="from_allowance"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  value={field.value || ""}
                  label="Allowance From"
                  fullWidth
                  type="number"
                  disabled={true}
                  inputProps={{
                    step: "0.01",
                    min: "0",
                  }}
                  InputLabelProps={{ shrink: true }}
                />
              )}
            />
          </Grid>

          <Grid item sx={{ width: "336px", minWidth: "336px" }}>
            <Controller
              name="from_additional_rate"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  value={field.value || ""}
                  label="Additional Rate From"
                  fullWidth
                  type="number"
                  disabled={true}
                  inputProps={{
                    step: "0.01",
                    min: "0",
                  }}
                  InputLabelProps={{ shrink: true }}
                />
              )}
            />
          </Grid>
        </Grid>
      </Grid>
    );
  }

  return (
    <Grid item xs={12} key="from-position-edit">
      <Typography variant="h6" sx={sectionTitleStyles}>
        FROM POSITION
      </Typography>
      <Grid container spacing={1.6}>
        <Grid item sx={{ width: "336px", minWidth: "336px" }}>
          <Controller
            name="from_position_id"
            control={control}
            rules={{ required: "Position is required" }}
            render={({ field: { onChange, value } }) => {
              const selectedPosition =
                positions.find((p) => p.id === value) || null;

              return (
                <Autocomplete
                  options={positions}
                  getOptionLabel={getPositionLabel}
                  isOptionEqualToValue={(option, val) => {
                    if (!option || !val) return false;
                    return option.id === val.id;
                  }}
                  value={selectedPosition}
                  onChange={(_, newValue) => {
                    onChange(newValue?.id || null);
                  }}
                  loading={isPositionsLoading}
                  disabled={isCreate}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Position *"
                      error={!!errors.from_position_id}
                      helperText={errors.from_position_id?.message}
                    />
                  )}
                />
              );
            }}
          />
        </Grid>

        <Grid item sx={{ width: "336px", minWidth: "336px" }}>
          <Controller
            name="from_job_level_id"
            control={control}
            rules={{ required: "Job level is required" }}
            render={({ field: { onChange, value } }) => {
              const selectedJobLevel =
                jobLevels.find((jl) => jl.id === value) || null;

              return (
                <Autocomplete
                  options={jobLevels}
                  getOptionLabel={(option) => {
                    if (!option || typeof option !== "object") return "";
                    return option.name || "";
                  }}
                  isOptionEqualToValue={(option, val) => {
                    if (!option || !val) return false;
                    return option.id === val.id;
                  }}
                  value={selectedJobLevel}
                  onChange={(_, newValue) => {
                    onChange(newValue?.id || null);
                  }}
                  loading={isJobLevelsLoading}
                  disabled={isCreate}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Job Level *"
                      error={!!errors.from_job_level_id}
                      helperText={errors.from_job_level_id?.message}
                    />
                  )}
                />
              );
            }}
          />
        </Grid>

        <Grid item sx={{ width: "336px", minWidth: "336px" }}>
          <Controller
            name="from_position_title"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                key={`from_position_title_${field.value}`}
                value={field.value || ""}
                label="Position Title From"
                fullWidth
                disabled={true}
                InputLabelProps={{ shrink: true }}
              />
            )}
          />
        </Grid>

        <Grid item sx={{ width: "336px", minWidth: "336px" }}>
          <Controller
            name="from_department"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                key={`from_department_${field.value}`}
                value={field.value || ""}
                label="Department From"
                fullWidth
                disabled={true}
                InputLabelProps={{ shrink: true }}
              />
            )}
          />
        </Grid>

        <Grid item sx={{ width: "336px", minWidth: "336px" }}>
          <Controller
            name="from_sub_unit"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                key={`from_sub_unit_${field.value}`}
                value={field.value || ""}
                label="Sub Unit From"
                fullWidth
                disabled={true}
                InputLabelProps={{ shrink: true }}
              />
            )}
          />
        </Grid>

        <Grid item sx={{ width: "336px", minWidth: "336px" }}>
          <Controller
            name="from_job_level"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                key={`from_job_level_${field.value}`}
                value={field.value || ""}
                label="Job Level From"
                fullWidth
                disabled={true}
                InputLabelProps={{ shrink: true }}
              />
            )}
          />
        </Grid>

        <Grid item sx={{ width: "336px", minWidth: "336px" }}>
          <Controller
            name="from_job_rate"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                key={`from_job_rate_${field.value}`}
                value={field.value || ""}
                label="Job Rate From"
                fullWidth
                type="number"
                disabled={true}
                inputProps={{
                  step: "0.01",
                  min: "0",
                }}
                InputLabelProps={{ shrink: true }}
              />
            )}
          />
        </Grid>

        <Grid item sx={{ width: "336px", minWidth: "336px" }}>
          <Controller
            name="from_allowance"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                key={`from_allowance_${field.value}`}
                value={field.value || ""}
                label="Allowance From"
                fullWidth
                type="number"
                disabled={true}
                inputProps={{
                  step: "0.01",
                  min: "0",
                }}
                InputLabelProps={{ shrink: true }}
              />
            )}
          />
        </Grid>

        <Grid item sx={{ width: "336px", minWidth: "336px" }}>
          <Controller
            name="from_additional_rate"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                key={`from_additional_rate_${field.value}`}
                value={field.value || ""}
                label="Additional Rate From"
                fullWidth
                type="number"
                disabled={true}
                inputProps={{
                  step: "0.01",
                  min: "0",
                }}
                InputLabelProps={{ shrink: true }}
              />
            )}
          />
        </Grid>
      </Grid>
    </Grid>
  );
};
