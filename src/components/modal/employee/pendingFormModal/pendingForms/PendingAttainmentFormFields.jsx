import React from "react";
import { Controller, useFormContext } from "react-hook-form";
import { TextField, Grid, FormControl, Autocomplete } from "@mui/material";

import PendingAttainmentFormAttachment from "./PendingAttainmentFormAttachment";

const PendingAttainmentFormFields = ({
  programs,
  degrees,
  honors,
  attainments,
  programsLoading,
  degreesLoading,
  honorsLoading,
  attainmentsLoading,
  isLoading,
  isReadOnly,
  watchedValues,
  handleDropdownFocus,
  handleFileChange,
  handleFileRemove,
  getOptionLabel,
  selectedPendingAttainment,
}) => {
  const {
    control,
    formState: { errors },
  } = useFormContext();

  const currentYear = new Date().getFullYear();

  const getEnhancedOptionLabel = (item, type) => {
    if (!item) return "";

    if (getOptionLabel && typeof getOptionLabel === "function") {
      return getOptionLabel(item, type);
    }
    a;
    if (item.name) return item.name;
    if (item.label) return item.label;
    if (item.id) return `${type} ${item.id}`;

    return "";
  };

  return (
    <>
      <Grid container spacing={1} className="general-form__grid">
        <Grid item xs={12} sm={6} sx={{ minWidth: "360px", maxWidth: "360px" }}>
          <Controller
            name="program_id"
            control={control}
            render={({ field: { onChange, value } }) => (
              <FormControl
                fullWidth
                variant="outlined"
                disabled={isLoading || programsLoading || isReadOnly}
                error={!!errors.program_id}
                sx={{ width: "355px" }}>
                <Autocomplete
                  onChange={(event, item) => {
                    if (!isReadOnly) onChange(item);
                  }}
                  value={value || null}
                  options={programs ?? []}
                  loading={programsLoading}
                  disabled={isLoading || isReadOnly}
                  getOptionLabel={(item) =>
                    getEnhancedOptionLabel(item, "program")
                  }
                  isOptionEqualToValue={(option, value) => {
                    if (!option || !value) return false;
                    return option.id === value.id;
                  }}
                  onOpen={() => {
                    if (!isReadOnly) handleDropdownFocus("programs");
                  }}
                  readOnly={isReadOnly}
                  noOptionsText="No programs available"
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label={
                        <>
                          Program <span style={{ color: "red" }}>*</span>
                        </>
                      }
                      error={!!errors.program_id}
                      helperText={errors.program_id?.message}
                      sx={{ borderRadius: 2 }}
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

        <Grid item xs={12} sm={6} sx={{ minWidth: "360px", maxWidth: "360px" }}>
          <Controller
            name="degree_id"
            control={control}
            render={({ field: { onChange, value } }) => (
              <FormControl
                fullWidth
                variant="outlined"
                disabled={isLoading || degreesLoading || isReadOnly}
                error={!!errors.degree_id}
                sx={{ width: "355px" }}>
                <Autocomplete
                  onChange={(event, item) => {
                    if (!isReadOnly) onChange(item);
                  }}
                  value={value || null}
                  options={degrees ?? []}
                  loading={degreesLoading}
                  disabled={isLoading || isReadOnly}
                  getOptionLabel={(item) =>
                    getEnhancedOptionLabel(item, "degree")
                  }
                  isOptionEqualToValue={(option, value) => {
                    if (!option || !value) return false;
                    return option.id === value.id;
                  }}
                  onOpen={() => {
                    if (!isReadOnly) handleDropdownFocus("degrees");
                  }}
                  readOnly={isReadOnly}
                  noOptionsText="No degrees available"
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label={
                        <>
                          Degree <span style={{ color: "red" }}>*</span>
                        </>
                      }
                      error={!!errors.degree_id}
                      helperText={errors.degree_id?.message}
                      sx={{ borderRadius: 2 }}
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

        <Grid item xs={12} sm={6} sx={{ minWidth: "360px", maxWidth: "360px" }}>
          <Controller
            name="honor_title_id"
            control={control}
            render={({ field: { onChange, value } }) => (
              <FormControl
                fullWidth
                variant="outlined"
                disabled={isLoading || honorsLoading || isReadOnly}
                error={!!errors.honor_title_id}
                sx={{ width: "355px" }}>
                <Autocomplete
                  onChange={(event, item) => {
                    if (!isReadOnly) onChange(item);
                  }}
                  value={value || null}
                  options={honors ?? []}
                  loading={honorsLoading}
                  disabled={isLoading || isReadOnly}
                  getOptionLabel={(item) =>
                    getEnhancedOptionLabel(item, "honor")
                  }
                  isOptionEqualToValue={(option, value) => {
                    if (!option || !value) return false;
                    return option.id === value.id;
                  }}
                  onOpen={() => {
                    if (!isReadOnly) handleDropdownFocus("honors");
                  }}
                  readOnly={isReadOnly}
                  noOptionsText="No honors available"
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label={
                        <>
                          Honor Title <span style={{ color: "red" }}>*</span>
                        </>
                      }
                      error={!!errors.honor_title_id}
                      helperText={errors.honor_title_id?.message}
                      sx={{ borderRadius: 2 }}
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

        <Grid item xs={12} sm={6} sx={{ minWidth: "360px", maxWidth: "360px" }}>
          <Controller
            name="attainment_id"
            control={control}
            render={({ field: { onChange, value } }) => (
              <FormControl
                fullWidth
                variant="outlined"
                disabled={isLoading || attainmentsLoading || isReadOnly}
                error={!!errors.attainment_id}
                sx={{ width: "355px" }}>
                <Autocomplete
                  onChange={(event, item) => {
                    if (!isReadOnly) onChange(item);
                  }}
                  value={value || null}
                  options={attainments ?? []}
                  loading={attainmentsLoading}
                  disabled={isLoading || isReadOnly}
                  getOptionLabel={(item) =>
                    getEnhancedOptionLabel(item, "attainment")
                  }
                  isOptionEqualToValue={(option, value) => {
                    if (!option || !value) return false;
                    return option.id === value.id;
                  }}
                  onOpen={() => {
                    if (!isReadOnly) handleDropdownFocus("attainments");
                  }}
                  readOnly={isReadOnly}
                  noOptionsText="No attainments available"
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label={
                        <>
                          Attainment <span style={{ color: "red" }}>*</span>
                        </>
                      }
                      error={!!errors.attainment_id}
                      helperText={errors.attainment_id?.message}
                      sx={{ borderRadius: 2 }}
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

        <Grid item xs={12} sm={6} sx={{ minWidth: "360px", maxWidth: "360px" }}>
          <Controller
            name="academic_year_from"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Academic Year From (Optional)"
                type="number"
                variant="outlined"
                fullWidth
                disabled={isLoading || isReadOnly}
                error={!!errors.academic_year_from}
                helperText={errors.academic_year_from?.message}
                inputProps={{
                  min: 1900,
                  max: currentYear,
                  readOnly: isReadOnly,
                }}
                className="general-form__text-field"
              />
            )}
          />
        </Grid>

        <Grid item xs={12} sm={6} sx={{ minWidth: "360px", maxWidth: "360px" }}>
          <Controller
            name="academic_year_to"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Academic Year To (Optional)"
                type="number"
                variant="outlined"
                fullWidth
                disabled={isLoading || isReadOnly}
                error={!!errors.academic_year_to}
                helperText={errors.academic_year_to?.message}
                inputProps={{
                  min: watchedValues.academic_year_from || 1900,
                  max: new Date().getFullYear() + 10,
                  readOnly: isReadOnly,
                }}
                className="general-form__text-field"
              />
            )}
          />
        </Grid>

        <Grid item xs={12} sm={6} sx={{ minWidth: "360px", maxWidth: "360px" }}>
          <Controller
            name="gpa"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="GPA (Optional)"
                type="number"
                variant="outlined"
                fullWidth
                disabled={isLoading || isReadOnly}
                error={!!errors.gpa}
                helperText={errors.gpa?.message}
                inputProps={{
                  min: 0,
                  max: 5,
                  step: 0.01,
                  readOnly: isReadOnly,
                }}
                className="general-form__text-field"
              />
            )}
          />
        </Grid>

        <Grid item xs={12} sx={{ minWidth: "730px", maxWidth: "730px" }}>
          <Controller
            name="institution"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Institution (Optional)"
                variant="outlined"
                fullWidth
                disabled={isLoading || isReadOnly}
                error={!!errors.institution}
                helperText={errors.institution?.message}
                className="general-form__text-field"
                InputProps={{
                  readOnly: isReadOnly,
                }}
              />
            )}
          />
        </Grid>

        <Grid item xs={12} sx={{ minWidth: "1100px", maxWidth: "1100px" }}>
          <Controller
            name="attainment_remarks"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Attainment Remarks (Optional)"
                variant="outlined"
                fullWidth
                disabled={isLoading || isReadOnly}
                placeholder="Optional: Additional notes about this pending attainment"
                InputProps={{
                  readOnly: isReadOnly,
                }}
              />
            )}
          />
        </Grid>

        <PendingAttainmentFormAttachment
          isLoading={isLoading}
          isReadOnly={isReadOnly}
          watchedValues={watchedValues}
          handleFileChange={handleFileChange}
          handleFileRemove={handleFileRemove}
          selectedPendingAttainment={selectedPendingAttainment}
        />
      </Grid>
    </>
  );
};

export default PendingAttainmentFormFields;
