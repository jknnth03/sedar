import React, { useEffect } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { Grid, TextField, Typography, Autocomplete, Box } from "@mui/material";
import { sectionTitleStyles } from "../DAForm/DAFormModal.styles";
import {
  infoSectionContainerStyles,
  infoSectionTitleStyles,
  infoFieldContainerStyles,
  infoFieldLabelStyles,
  infoFieldValueStyles,
  infoBoxStyles,
  sectionHeaderStyles,
} from "../MDAForm/MDAFormModalFields.styles";

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

export const ToPositionFields = ({
  control,
  errors,
  isReadOnly,
  showSummary,
  formValues,
  currentMode,
  positions = [],
  jobLevels = [],
}) => {
  const { setValue, watch } = useFormContext();

  const toPositionId = watch("to_position_id");
  const toJobLevelId = watch("to_job_level_id");

  const getPositionLabel = (item) => {
    if (!item) return "";
    if (typeof item === "string") return item;

    if (item?.title) {
      if (typeof item.title === "object" && item.title?.name) {
        return String(item.title.name);
      }
      if (typeof item.title === "string") {
        return String(item.title);
      }
    }

    return "";
  };

  const getJobLevelLabel = (item) => {
    if (!item) return "";
    if (typeof item === "string") return item;
    return item?.label || item?.name || "";
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

  useEffect(() => {
    if (currentMode === "edit" && !toJobLevelId && formValues.to_job_level) {
      const jobLevel = jobLevels.find(
        (jl) => jl.name === formValues.to_job_level,
      );
      if (jobLevel) {
        setValue("to_job_level_id", jobLevel.id, { shouldValidate: false });
      }
    }
  }, [currentMode, toJobLevelId, formValues.to_job_level, jobLevels, setValue]);

  useEffect(() => {
    if (
      currentMode === "edit" &&
      !toPositionId &&
      formValues.to_position_title
    ) {
      const position = positions.find((p) => {
        const titleName = typeof p.title === "object" ? p.title?.name : p.title;
        return titleName === formValues.to_position_title;
      });
      if (position) {
        setValue("to_position_id", position.id, { shouldValidate: false });
      }
    }
  }, [
    currentMode,
    toPositionId,
    formValues.to_position_title,
    positions,
    setValue,
  ]);

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
                        filterOptions={(options, state) => {
                          const inputValue = state.inputValue
                            .toLowerCase()
                            .trim();

                          if (!inputValue) return options;

                          return options.filter((option) => {
                            const label =
                              getPositionLabel(option).toLowerCase();
                            return label.includes(inputValue);
                          });
                        }}
                        value={selectedPosition}
                        onChange={(_, newValue) => {
                          onChange(newValue?.id || null);
                        }}
                        disabled={isReadOnly}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Position Title To *"
                            error={!!errors.to_position_id}
                            helperText={errors.to_position_id?.message}
                            sx={{ mb: 1.5 }}
                          />
                        )}
                        renderOption={(props, option) => (
                          <li {...props} key={option.id}>
                            {getPositionLabel(option)}
                          </li>
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
                        getOptionLabel={getJobLevelLabel}
                        isOptionEqualToValue={(option, val) => {
                          if (!option || !val) return false;
                          return option.id === val.id;
                        }}
                        filterOptions={(options, state) => {
                          const inputValue = state.inputValue
                            .toLowerCase()
                            .trim();

                          if (!inputValue) return options;

                          return options.filter((option) => {
                            const label =
                              getJobLevelLabel(option).toLowerCase();
                            return label.includes(inputValue);
                          });
                        }}
                        value={selectedJobLevel}
                        onChange={(_, newValue) => {
                          onChange(newValue?.id || null);
                        }}
                        disabled={isReadOnly}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Job Level *"
                            error={!!errors.to_job_level_id}
                            helperText={errors.to_job_level_id?.message}
                          />
                        )}
                        renderOption={(props, option) => (
                          <li {...props} key={option.id}>
                            {getJobLevelLabel(option)}
                          </li>
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
                  name="to_additional_rate"
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
                      label="Additional Rate To"
                      type="number"
                      fullWidth
                      error={!!errors.to_additional_rate}
                      helperText={errors.to_additional_rate?.message}
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
        </Grid>
      </Grid>
    );
  }

  if (currentMode === "view") {
    return (
      <Grid item xs={12} key="to-position-view">
        <Typography variant="h6" sx={sectionTitleStyles}>
          TO POSITION
        </Typography>
        <Grid container spacing={1.6}>
          <Grid item sx={{ width: "336px", minWidth: "336px" }}>
            <Controller
              name="to_position_title"
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
              name="to_job_level"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  value={field.value || ""}
                  label="Job Level To"
                  fullWidth
                  disabled={true}
                  InputLabelProps={{ shrink: true }}
                />
              )}
            />
          </Grid>

          <Grid item sx={{ width: "336px", minWidth: "336px" }}>
            <Controller
              name="to_job_rate"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  value={field.value || ""}
                  label="Job Rate To"
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
              name="to_department"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
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
              render={({ field }) => (
                <TextField
                  {...field}
                  value={field.value || ""}
                  label="Allowance To"
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
              name="to_additional_rate"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  value={field.value || ""}
                  label="Additional Rate To"
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
    <Grid item xs={12} key="to-position-edit">
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
                  filterOptions={(options, state) => {
                    const inputValue = state.inputValue.toLowerCase().trim();

                    if (!inputValue) return options;

                    return options.filter((option) => {
                      const label = getPositionLabel(option).toLowerCase();
                      return label.includes(inputValue);
                    });
                  }}
                  value={selectedPosition}
                  onChange={(_, newValue) => {
                    onChange(newValue?.id || null);
                  }}
                  disabled={false}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Position *"
                      error={!!errors.to_position_id}
                      helperText={errors.to_position_id?.message}
                    />
                  )}
                  renderOption={(props, option) => (
                    <li {...props} key={option.id}>
                      {getPositionLabel(option)}
                    </li>
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
                  getOptionLabel={getJobLevelLabel}
                  isOptionEqualToValue={(option, val) => {
                    if (!option || !val) return false;
                    return option.id === val.id;
                  }}
                  filterOptions={(options, state) => {
                    const inputValue = state.inputValue.toLowerCase().trim();

                    if (!inputValue) return options;

                    return options.filter((option) => {
                      const label = getJobLevelLabel(option).toLowerCase();
                      return label.includes(inputValue);
                    });
                  }}
                  value={selectedJobLevel}
                  onChange={(_, newValue) => {
                    onChange(newValue?.id || null);
                  }}
                  disabled={false}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Job Level To *"
                      error={!!errors.to_job_level_id}
                      helperText={errors.to_job_level_id?.message}
                    />
                  )}
                  renderOption={(props, option) => (
                    <li {...props} key={option.id}>
                      {getJobLevelLabel(option)}
                    </li>
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
                disabled={false}
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
                disabled={false}
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
            name="to_additional_rate"
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
                label="Additional Rate To"
                fullWidth
                type="number"
                error={!!errors.to_additional_rate}
                helperText={errors.to_additional_rate?.message}
                disabled={false}
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
