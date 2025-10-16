import React from "react";
import { Controller } from "react-hook-form";
import { Grid, TextField, Typography, Box } from "@mui/material";
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

const InfoField = ({ label, value }) => (
  <Box sx={infoFieldContainerStyles}>
    <Typography variant="subtitle2" sx={infoFieldLabelStyles}>
      {label}
    </Typography>
    <Typography variant="body2" sx={infoFieldValueStyles}>
      {value || "-"}
    </Typography>
  </Box>
);

export const FromPositionFields = ({
  control,
  errors,
  isReadOnly,
  isCreate,
  showSummary,
  formValues,
  formatCurrency,
}) => {
  if (showSummary) {
    return (
      <Grid item xs={12}>
        <Typography
          variant="h6"
          sx={{
            ...sectionTitleStyles,
            ...sectionHeaderStyles.fromPosition,
          }}>
          FROM POSITION
        </Typography>
        <Grid container spacing={0}>
          <Grid item xs={12} md={4}>
            <Box sx={infoBoxStyles.fromPosition1}>
              <InfoSection>
                <InfoField
                  label="Position"
                  value={formValues.from_position_title}
                />
                <InfoField
                  label="Department"
                  value={formValues.from_department}
                />
                <InfoField label="Sub Unit" value={formValues.from_sub_unit} />
              </InfoSection>
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box sx={infoBoxStyles.fromPosition2}>
              <InfoSection>
                <InfoField
                  label="Job Level"
                  value={formValues.from_job_level}
                />
                <InfoField
                  label="Job Rate"
                  value={formatCurrency(formValues.from_job_rate)}
                />
                <InfoField
                  label="Allowance"
                  value={formatCurrency(formValues.from_allowance)}
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
        FROM POSITION
      </Typography>
      <Grid container spacing={1.6}>
        <Grid item xs={12} sm={4} sx={gridItemLargeStyles}>
          <Controller
            name="from_position_title"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Position Title From"
                fullWidth
                error={!!errors.from_position_title}
                helperText={errors.from_position_title?.message}
                disabled={isReadOnly || isCreate}
              />
            )}
          />
        </Grid>
        <Grid item xs={12} sm={4} sx={gridItemLargeStyles}>
          <Controller
            name="from_department"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Department From"
                fullWidth
                error={!!errors.from_department}
                helperText={errors.from_department?.message}
                disabled={isReadOnly || isCreate}
              />
            )}
          />
        </Grid>
        <Grid item xs={12} sm={4} sx={gridItemLargeStyles}>
          <Controller
            name="from_sub_unit"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Sub Unit From"
                fullWidth
                error={!!errors.from_sub_unit}
                helperText={errors.from_sub_unit?.message}
                disabled={isReadOnly || isCreate}
              />
            )}
          />
        </Grid>
        <Grid item xs={12} sm={4} sx={gridItemLargeStyles}>
          <Controller
            name="from_job_level"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Job Level From"
                fullWidth
                error={!!errors.from_job_level}
                helperText={errors.from_job_level?.message}
                disabled={isReadOnly || isCreate}
              />
            )}
          />
        </Grid>
        <Grid item xs={12} sm={4} sx={gridItemLargeStyles}></Grid>
        <Grid item xs={12} sm={4} sx={gridItemLargeStyles}>
          <Controller
            name="from_job_rate"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Job Rate From"
                fullWidth
                type="number"
                error={!!errors.from_job_rate}
                helperText={errors.from_job_rate?.message}
                disabled={isReadOnly || isCreate}
                inputProps={{
                  step: "0.01",
                  min: "0",
                }}
              />
            )}
          />
        </Grid>
        <Grid item xs={12} sm={4} sx={gridItemLargeStyles}>
          <Controller
            name="from_allowance"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Allowance From"
                fullWidth
                type="number"
                error={!!errors.from_allowance}
                helperText={errors.from_allowance?.message}
                disabled={isReadOnly || isCreate}
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

export const ToPositionFields = ({
  control,
  errors,
  isReadOnly,
  isCreate,
  showSummary,
  formValues,
}) => {
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
                <InfoField
                  label="Position"
                  value={formValues.to_position_title}
                />
                <InfoField
                  label="Department"
                  value={formValues.to_department}
                />
                <InfoField label="Sub Unit" value={formValues.to_sub_unit} />
              </InfoSection>
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box sx={infoBoxStyles.toPosition2}>
              <InfoSection>
                <InfoField label="Job Level" value={formValues.to_job_level} />
              </InfoSection>
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box sx={infoBoxStyles.toPosition3}>
              <InfoSection>
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
                      sx={textFieldStyles.toJobRate}
                      {...field}
                      value={value || ""}
                      label="Job Rate To *"
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
                      sx={textFieldStyles.toAllowance}
                      {...field}
                      value={value || ""}
                      label="Allowance To *"
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
        <Grid item xs={12} sm={4} sx={gridItemLargeStyles}>
          <Controller
            name="to_position_title"
            control={control}
            rules={{ required: "Position title is required" }}
            render={({ field }) => (
              <TextField
                {...field}
                label="Position Title To"
                fullWidth
                error={!!errors.to_position_title}
                helperText={errors.to_position_title?.message}
                disabled={isReadOnly || isCreate}
              />
            )}
          />
        </Grid>
        <Grid item xs={12} sm={4} sx={gridItemLargeStyles}>
          <Controller
            name="to_department"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Department To"
                fullWidth
                error={!!errors.to_department}
                helperText={errors.to_department?.message}
                disabled={isReadOnly || isCreate}
              />
            )}
          />
        </Grid>
        <Grid item xs={12} sm={4} sx={gridItemLargeStyles}>
          <Controller
            name="to_sub_unit"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Sub Unit To"
                fullWidth
                error={!!errors.to_sub_unit}
                helperText={errors.to_sub_unit?.message}
                disabled={isReadOnly || isCreate}
              />
            )}
          />
        </Grid>
        <Grid item xs={12} sm={4} sx={gridItemLargeStyles}>
          <Controller
            name="to_job_level"
            control={control}
            rules={{ required: "Job level is required" }}
            render={({ field }) => (
              <TextField
                {...field}
                label="Job Level To"
                fullWidth
                error={!!errors.to_job_level}
                helperText={errors.to_job_level?.message}
                disabled={isReadOnly || isCreate}
              />
            )}
          />
        </Grid>
        <Grid item xs={12} sm={4} sx={gridItemLargeStyles}></Grid>
        <Grid item xs={12} sm={4} sx={gridItemLargeStyles}>
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
        <Grid item xs={12} sm={4} sx={gridItemLargeStyles}>
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
