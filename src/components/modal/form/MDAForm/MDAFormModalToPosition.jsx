import React, { useEffect } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { TextField, Typography, Autocomplete, Box } from "@mui/material";
import { sectionTitleStyles } from "./MDAFornModal.styles";

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
        (jl) => jl.name === formValues.to_job_level
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

  if (currentMode === "view") {
    return (
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" sx={sectionTitleStyles}>
          TO POSITION
        </Typography>
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
                  sx={{ mt: 2 }}
                />
              )}
            />

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
                  sx={{ mt: 2 }}
                />
              )}
            />
          </Box>

          <Box>
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
                  sx={{ mt: 2 }}
                />
              )}
            />

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
                  sx={{ mt: 2 }}
                />
              )}
            />
          </Box>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="h6" sx={sectionTitleStyles}>
        TO POSITION
      </Typography>
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
                  disabled={isReadOnly}
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
                  disabled={isReadOnly}
                  sx={{ mt: 2 }}
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
                sx={{ mt: 2 }}
              />
            )}
          />
        </Box>

        <Box>
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
                sx={{ mt: 2 }}
              />
            )}
          />

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
                sx={{ mt: 2 }}
              />
            )}
          />
        </Box>
      </Box>
    </Box>
  );
};
