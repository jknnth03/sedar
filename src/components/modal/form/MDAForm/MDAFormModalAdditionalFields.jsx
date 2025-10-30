import React, { useEffect, useState } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { Grid, TextField, Typography, Box, Autocomplete } from "@mui/material";
import { sectionTitleStyles, gridItemLargeStyles } from "./MDAFornModal.styles";
import {
  infoSectionContainerStyles,
  infoSectionTitleStyles,
  infoFieldContainerStyles,
  infoFieldLabelStyles,
  infoFieldValueStyles,
  infoBoxStyles,
  textFieldStyles,
  sectionHeaderStyles,
} from "./MDAFormModalFields.styles";
import {
  useGetAllPositionsQuery,
  useGetAllJobLevelsQuery,
} from "../../../../features/api/forms/mdaApi";

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

const safeStringValue = (val) => {
  if (!val) return "-";
  if (typeof val === "object" && val !== null) {
    if (val.name) return String(val.name);
    if (val.title) return String(val.title);
    if (val.code) return String(val.code);
    return "-";
  }
  return String(val);
};

const InfoField = ({ label, value }) => {
  let displayValue = "-";

  if (value) {
    if (typeof value === "object" && value !== null) {
      displayValue = value.name || value.title || value.code || "-";
    } else {
      displayValue = String(value);
    }
  }

  return (
    <Box sx={infoFieldContainerStyles}>
      <Typography variant="subtitle2" sx={infoFieldLabelStyles}>
        {label}
      </Typography>
      <Typography variant="body2" sx={infoFieldValueStyles}>
        {displayValue}
      </Typography>
    </Box>
  );
};

export const FromPositionFields = ({
  control,
  errors,
  isReadOnly,
  isCreate,
  showSummary,
  formValues,
  formatCurrency,
}) => {
  const { setValue, watch } = useFormContext();
  const { data: jobLevelsData, isLoading: isJobLevelsLoading } =
    useGetAllJobLevelsQuery();
  const { data: positionsData, isLoading: isPositionsLoading } =
    useGetAllPositionsQuery();

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
    if (fromPositionId && positions.length > 0) {
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
  }, [fromPositionId, positions, setValue]);

  useEffect(() => {
    if (fromJobLevelId && jobLevels.length > 0) {
      const selectedJobLevel = jobLevels.find((jl) => jl.id === fromJobLevelId);
      if (selectedJobLevel) {
        setValue("from_job_level", selectedJobLevel.name || "", {
          shouldValidate: true,
        });
      }
    }
  }, [fromJobLevelId, jobLevels, setValue]);

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
        </Grid>
      </Grid>
    );
  }

  return (
    <Grid item xs={12}>
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
                  disabled={isReadOnly || isCreate}
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
                  disabled={isReadOnly || isCreate}
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
      </Grid>
    </Grid>
  );
};

export const ToPositionFields = ({
  control,
  errors,
  isReadOnly,
  isCreate,
  showSummary,
  formValues,
}) => {
  const { setValue, watch } = useFormContext();
  const { data: jobLevelsData, isLoading: isJobLevelsLoading } =
    useGetAllJobLevelsQuery();
  const { data: positionsData, isLoading: isPositionsLoading } =
    useGetAllPositionsQuery();

  const jobLevels = jobLevelsData?.result || [];
  const positions = positionsData?.result || [];

  const toPositionId = watch("to_position_id");
  const toJobLevelId = watch("to_job_level_id");

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
    if (toPositionId && positions.length > 0) {
      const selectedPosition = positions.find((p) => p.id === toPositionId);
      if (selectedPosition) {
        const positionTitle =
          typeof selectedPosition.title === "object"
            ? selectedPosition.title?.name || ""
            : selectedPosition.title || "";
        const deptName = selectedPosition.charging?.department_name || "";
        const subUnitName = selectedPosition.charging?.sub_unit_name || "";

        setValue("to_position_title", positionTitle, { shouldValidate: true });
        setValue("to_department", deptName, { shouldValidate: true });
        setValue("to_sub_unit", subUnitName, { shouldValidate: true });
      }
    }
  }, [toPositionId, positions, setValue]);

  useEffect(() => {
    if (toJobLevelId && jobLevels.length > 0) {
      const selectedJobLevel = jobLevels.find((jl) => jl.id === toJobLevelId);
      if (selectedJobLevel) {
        setValue("to_job_level", selectedJobLevel.name || "", {
          shouldValidate: true,
        });
      }
    }
  }, [toJobLevelId, jobLevels, setValue]);

  if (showSummary) {
    return (
      <Grid item xs={12}>
        <Typography
          variant="h6"
          sx={{
            ...sectionTitleStyles,
            ...sectionHeaderStyles.toPosition,
          }}>
          TO POSITION
        </Typography>
        <Grid container spacing={0}>
          <Grid item xs={12} md={4}>
            <Box sx={infoBoxStyles.toPosition1}>
              <InfoSection>
                <Controller
                  name="to_position_id"
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
                        disabled={isReadOnly}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Position *"
                            error={!!errors.to_position_id}
                            helperText={errors.to_position_id?.message}
                            sx={{ mb: 1.5 }}
                          />
                        )}
                      />
                    );
                  }}
                />
                <InfoField
                  label="Department"
                  value={safeStringValue(formValues.to_department)}
                />
                <InfoField
                  label="Sub Unit"
                  value={safeStringValue(formValues.to_sub_unit)}
                />
              </InfoSection>
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box sx={infoBoxStyles.toPosition2}>
              <InfoSection>
                <Controller
                  name="to_job_level_id"
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
                        disabled={isReadOnly}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Job Level *"
                            error={!!errors.to_job_level_id}
                            helperText={errors.to_job_level_id?.message}
                          />
                        )}
                      />
                    );
                  }}
                />
                <Controller
                  name="to_job_rate"
                  control={control}
                  rules={{
                    required: "Job rate is required",
                    pattern: {
                      value: /^\d+(\.\d{1,2})?$/,
                      message: "Please enter a valid amount",
                    },
                  }}
                  render={({ field: { value, ...field } }) => (
                    <TextField
                      {...field}
                      value={value || ""}
                      label="Job Rate To *"
                      type="number"
                      fullWidth
                      error={!!errors.to_job_rate}
                      helperText={errors.to_job_rate?.message}
                      disabled={isReadOnly}
                      inputProps={{
                        step: "0.01",
                        min: "0",
                      }}
                      sx={{ mt: 1.5 }}
                    />
                  )}
                />
              </InfoSection>
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box sx={infoBoxStyles.toPosition3}>
              <InfoSection>
                <Controller
                  name="to_allowance"
                  control={control}
                  rules={{
                    pattern: {
                      value: /^\d+(\.\d{1,2})?$/,
                      message: "Please enter a valid amount",
                    },
                  }}
                  render={({ field: { value, ...field } }) => (
                    <TextField
                      {...field}
                      value={value || ""}
                      label="Allowance To *"
                      type="number"
                      fullWidth
                      error={!!errors.to_allowance}
                      helperText={errors.to_allowance?.message}
                      disabled={isReadOnly}
                      inputProps={{
                        step: "0.01",
                        min: "0",
                      }}
                    />
                  )}
                />
                <Controller
                  name="to_department"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      key={`summary_to_department_${field.value}`}
                      value={field.value || ""}
                      label="Department"
                      fullWidth
                      disabled={true}
                      sx={{ mt: 1.5 }}
                      InputLabelProps={{ shrink: true }}
                    />
                  )}
                />
              </InfoSection>
            </Box>
          </Grid>
        </Grid>
      </Grid>
    );
  }

  return (
    <Grid item xs={12}>
      <Typography variant="h6" sx={sectionTitleStyles}>
        TO POSITION
      </Typography>
      <Grid container spacing={1.6}>
        <Grid item sx={{ width: "336px", minWidth: "336px" }}>
          <Controller
            name="to_position_id"
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
                  disabled={isReadOnly}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Position *"
                      error={!!errors.to_position_id}
                      helperText={errors.to_position_id?.message}
                    />
                  )}
                />
              );
            }}
          />
        </Grid>

        <Grid item sx={{ width: "336px", minWidth: "336px" }}>
          <Controller
            name="to_job_level_id"
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
                  disabled={isReadOnly}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Job Level To *"
                      error={!!errors.to_job_level_id}
                      helperText={errors.to_job_level_id?.message}
                    />
                  )}
                />
              );
            }}
          />
        </Grid>

        <Grid item sx={{ width: "336px", minWidth: "336px" }}>
          <Controller
            name="to_job_rate"
            control={control}
            rules={{
              required: "Job rate is required",
              pattern: {
                value: /^\d+(\.\d{1,2})?$/,
                message: "Please enter a valid amount",
              },
            }}
            render={({ field }) => (
              <TextField
                {...field}
                value={field.value || ""}
                label="Job Rate To *"
                fullWidth
                type="number"
                error={!!errors.to_job_rate}
                helperText={errors.to_job_rate?.message}
                disabled={isReadOnly}
                inputProps={{
                  step: "0.01",
                  min: "0",
                }}
              />
            )}
          />
        </Grid>

        <Grid item sx={{ width: "336px", minWidth: "336px" }}>
          <Controller
            name="to_department"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                key={`to_department_${field.value}`}
                value={field.value || ""}
                label="Department To"
                fullWidth
                disabled={true}
                InputLabelProps={{ shrink: true }}
              />
            )}
          />
        </Grid>

        <Grid item sx={{ width: "336px", minWidth: "336px" }}>
          <Controller
            name="to_sub_unit"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                key={`to_sub_unit_${field.value}`}
                value={field.value || ""}
                label="Sub Unit To"
                fullWidth
                disabled={true}
                InputLabelProps={{ shrink: true }}
              />
            )}
          />
        </Grid>

        <Grid item sx={{ width: "336px", minWidth: "336px" }}>
          <Controller
            name="to_allowance"
            control={control}
            rules={{
              pattern: {
                value: /^\d+(\.\d{1,2})?$/,
                message: "Please enter a valid amount",
              },
            }}
            render={({ field }) => (
              <TextField
                {...field}
                value={field.value || ""}
                label="Allowance To *"
                fullWidth
                type="number"
                error={!!errors.to_allowance}
                helperText={errors.to_allowance?.message}
                disabled={isReadOnly}
                inputProps={{
                  step: "0.01",
                  min: "0",
                }}
              />
            )}
          />
        </Grid>
      </Grid>
    </Grid>
  );
};
