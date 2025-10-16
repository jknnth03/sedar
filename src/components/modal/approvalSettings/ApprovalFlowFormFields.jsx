import React from "react";
import { Controller } from "react-hook-form";
import {
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  CircularProgress,
  Box,
  Typography,
  Autocomplete,
} from "@mui/material";

const ApprovalFlowFormFields = ({
  control,
  errors,
  isReadOnly,
  chargingOptions,
  filteredDepartments,
  filteredLocations,
  filteredCompanies,
  filteredBusinessUnits,
  filteredUnits,
  filteredSubUnits,
  users,
  forms,
  isRdfLoading,
  isAllChargingLoading,
  isUsersLoading,
  isFormsLoading,
  handleChargingChange,
  isInUse,
  noChargingChecked,
}) => {
  const safeChargingOptions = Array.isArray(chargingOptions)
    ? chargingOptions
    : [];
  const safeFilteredDepartments = Array.isArray(filteredDepartments)
    ? filteredDepartments
    : [];
  const safeFilteredLocations = Array.isArray(filteredLocations)
    ? filteredLocations
    : [];
  const safeFilteredCompanies = Array.isArray(filteredCompanies)
    ? filteredCompanies
    : [];
  const safeFilteredBusinessUnits = Array.isArray(filteredBusinessUnits)
    ? filteredBusinessUnits
    : [];
  const safeFilteredUnits = Array.isArray(filteredUnits) ? filteredUnits : [];
  const safeFilteredSubUnits = Array.isArray(filteredSubUnits)
    ? filteredSubUnits
    : [];
  const safeUsers = Array.isArray(users) ? users : [];
  const safeForms = Array.isArray(forms) ? forms : [];

  // Helper function to get asterisk color based on mode
  const getAsteriskColor = () => (isReadOnly ? "gray" : "red");

  // Helper function to check if charging-related fields should be disabled
  const isChargingFieldDisabled = () => {
    return isReadOnly || noChargingChecked || isInUse;
  };

  return (
    <Grid container spacing={1.2}>
      <Grid item xs={12} md={6}>
        <Grid item xs={12} sm={4} sx={{ minWidth: "460px", maxWidth: "460px" }}>
          <Controller
            name="form_id"
            control={control}
            render={({ field: { onChange, value } }) => (
              <FormControl
                fullWidth
                variant="outlined"
                error={!!errors.form_id}
                disabled={isReadOnly || isFormsLoading}
                sx={{
                  width: "100%",
                  position: "relative",
                  "& .MuiFormHelperText-root": {
                    position: "absolute",
                    bottom: "-20px",
                    marginTop: "0px",
                  },
                }}>
                <Autocomplete
                  onChange={(event, item) => {
                    if (!isReadOnly) {
                      onChange(item || null);
                    }
                  }}
                  value={value || null}
                  options={safeForms}
                  loading={isFormsLoading}
                  disabled={isReadOnly}
                  readOnly={isReadOnly}
                  getOptionLabel={(item) => item?.name || ""}
                  isOptionEqualToValue={(option, value) => {
                    if (!option || !value) return false;
                    return option.id === value.id;
                  }}
                  onBlur={() => {
                    if (!value || !value.id) {
                      onChange(null);
                    }
                  }}
                  renderOption={(props, option) => (
                    <Box component="li" {...props}>
                      <Box>
                        <Typography variant="body2" fontWeight={500}>
                          {option.name || "Unknown Form"}
                        </Typography>
                        {option.description && (
                          <Typography variant="caption" color="text.secondary">
                            {option.description}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  )}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label={
                        <>
                          Form{" "}
                          <span style={{ color: getAsteriskColor() }}>*</span>
                        </>
                      }
                      error={!!errors.form_id}
                      helperText={errors.form_id?.message}
                      InputProps={{
                        ...params.InputProps,
                        readOnly: isReadOnly,
                      }}
                      sx={{
                        backgroundColor: isReadOnly ? "#f5f5f5" : "white",
                      }}
                    />
                  )}
                />
              </FormControl>
            )}
          />
        </Grid>
      </Grid>

      <Grid item xs={12} md={6}>
        <Grid item xs={12} sm={4} sx={{ minWidth: "460px", maxWidth: "460px" }}>
          <Controller
            name="rdf_charging"
            control={control}
            render={({ field: { onChange, value } }) => (
              <FormControl
                fullWidth
                variant="outlined"
                error={!!errors.rdf_charging}
                disabled={
                  isChargingFieldDisabled() ||
                  isRdfLoading ||
                  isAllChargingLoading
                }
                sx={{
                  width: "100%",
                  position: "relative",
                  "& .MuiFormHelperText-root": {
                    position: "absolute",
                    bottom: "-20px",
                    marginTop: "0px",
                  },
                }}>
                <Autocomplete
                  onChange={(event, item) => {
                    if (!isChargingFieldDisabled()) {
                      onChange(item || null);
                      handleChargingChange(item?.id || null);
                    }
                  }}
                  value={noChargingChecked ? null : value || null}
                  options={safeChargingOptions}
                  loading={isRdfLoading || isAllChargingLoading}
                  disabled={isChargingFieldDisabled()}
                  readOnly={isChargingFieldDisabled()}
                  getOptionLabel={(item) => item?.name || ""}
                  isOptionEqualToValue={(option, value) => {
                    if (!option || !value) return false;
                    return option.id === value.id;
                  }}
                  onBlur={() => {
                    if (!isChargingFieldDisabled() && (!value || !value.id)) {
                      onChange(null);
                    }
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label={
                        <Box
                          component="span"
                          display="flex"
                          alignItems="center">
                          Charging
                          {!noChargingChecked && (
                            <Box
                              component="span"
                              color={getAsteriskColor()}
                              ml={0.5}>
                              *
                            </Box>
                          )}
                        </Box>
                      }
                      error={!!errors.rdf_charging}
                      helperText={errors.rdf_charging?.message}
                      InputProps={{
                        ...params.InputProps,
                        readOnly: isChargingFieldDisabled(),
                      }}
                      sx={{
                        backgroundColor: isChargingFieldDisabled()
                          ? "#f5f5f5"
                          : "white",
                      }}
                    />
                  )}
                />
              </FormControl>
            )}
          />
        </Grid>
      </Grid>

      <Grid item xs={12} md={6}>
        <Grid
          item
          xs={12}
          sm={4}
          sx={{ minWidth: "460px", maxWidth: "460px" }}></Grid>
        <Controller
          name="department"
          control={control}
          render={({ field }) => (
            <FormControl
              fullWidth
              error={!!errors.department}
              disabled={isChargingFieldDisabled()}>
              <InputLabel>Department</InputLabel>
              <Select
                {...field}
                label="Department"
                value={noChargingChecked ? "" : field.value || ""}
                sx={{
                  backgroundColor: isChargingFieldDisabled()
                    ? "#f5f5f5"
                    : "white",
                }}>
                {safeFilteredDepartments.map((department) => (
                  <MenuItem key={department.id} value={department.id}>
                    {department.code} - {department.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <Grid
          item
          xs={12}
          sm={4}
          sx={{ minWidth: "460px", maxWidth: "460px" }}></Grid>
        <Controller
          name="company"
          control={control}
          render={({ field }) => (
            <FormControl
              fullWidth
              error={!!errors.company}
              disabled={isChargingFieldDisabled()}>
              <InputLabel>Company</InputLabel>
              <Select
                {...field}
                label="Company"
                value={noChargingChecked ? "" : field.value || ""}
                sx={{
                  backgroundColor: isChargingFieldDisabled()
                    ? "#f5f5f5"
                    : "white",
                }}>
                {safeFilteredCompanies.map((company) => (
                  <MenuItem key={company.id} value={company.id}>
                    {company.code} - {company.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <Grid
          item
          xs={12}
          sm={4}
          sx={{ minWidth: "460px", maxWidth: "460px" }}></Grid>
        <Controller
          name="business_unit"
          control={control}
          render={({ field }) => (
            <FormControl
              fullWidth
              error={!!errors.business_unit}
              disabled={isChargingFieldDisabled()}>
              <InputLabel>Business Unit</InputLabel>
              <Select
                {...field}
                label="Business Unit"
                value={noChargingChecked ? "" : field.value || ""}
                sx={{
                  backgroundColor: isChargingFieldDisabled()
                    ? "#f5f5f5"
                    : "white",
                }}>
                {safeFilteredBusinessUnits.map((businessUnit) => (
                  <MenuItem key={businessUnit.id} value={businessUnit.id}>
                    {businessUnit.code} - {businessUnit.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <Grid
          item
          xs={12}
          sm={4}
          sx={{ minWidth: "460px", maxWidth: "460px" }}></Grid>
        <Controller
          name="unit"
          control={control}
          render={({ field }) => (
            <FormControl
              fullWidth
              error={!!errors.unit}
              disabled={isChargingFieldDisabled()}>
              <InputLabel>Unit</InputLabel>
              <Select
                {...field}
                label="Unit"
                value={noChargingChecked ? "" : field.value || ""}
                sx={{
                  backgroundColor: isChargingFieldDisabled()
                    ? "#f5f5f5"
                    : "white",
                }}>
                {safeFilteredUnits.map((unit) => (
                  <MenuItem key={unit.id} value={unit.id}>
                    {unit.code} - {unit.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <Grid
          item
          xs={12}
          sm={4}
          sx={{ minWidth: "460px", maxWidth: "460px" }}></Grid>
        <Controller
          name="sub_unit"
          control={control}
          render={({ field }) => (
            <FormControl
              fullWidth
              error={!!errors.sub_unit}
              disabled={isChargingFieldDisabled()}>
              <InputLabel>Sub Unit</InputLabel>
              <Select
                {...field}
                label="Sub Unit"
                value={noChargingChecked ? "" : field.value || ""}
                sx={{
                  backgroundColor: isChargingFieldDisabled()
                    ? "#f5f5f5"
                    : "white",
                }}>
                {safeFilteredSubUnits.map((subUnit) => (
                  <MenuItem key={subUnit.id} value={subUnit.id}>
                    {subUnit.code} - {subUnit.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <Grid
          item
          xs={12}
          sm={4}
          sx={{ minWidth: "460px", maxWidth: "460px" }}></Grid>
        <Controller
          name="location"
          control={control}
          render={({ field }) => (
            <FormControl
              fullWidth
              error={!!errors.location}
              disabled={isChargingFieldDisabled()}>
              <InputLabel>Location</InputLabel>
              <Select
                {...field}
                label="Location"
                value={noChargingChecked ? "" : field.value || ""}
                sx={{
                  backgroundColor: isChargingFieldDisabled()
                    ? "#f5f5f5"
                    : "white",
                }}>
                {safeFilteredLocations.map((location) => (
                  <MenuItem key={location.id} value={location.id}>
                    {location.code} - {location.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <Grid
          item
          xs={12}
          sm={4}
          sx={{ minWidth: "460px", maxWidth: "460px" }}></Grid>
        <Controller
          name="name"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label={
                <Box component="span" display="flex" alignItems="center">
                  Flow Name
                  <Box component="span" color={getAsteriskColor()} ml={0.5}>
                    *
                  </Box>
                </Box>
              }
              fullWidth
              error={!!errors.name}
              helperText={errors.name?.message}
              disabled={isReadOnly}
              sx={{
                backgroundColor: isReadOnly ? "#f5f5f5" : "white",
              }}
            />
          )}
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <Grid item xs={12} sm={4} sx={{ minWidth: "460px", maxWidth: "460px" }}>
          <Controller
            name="receiver_user_id"
            control={control}
            render={({ field: { onChange, value } }) => (
              <FormControl
                fullWidth
                variant="outlined"
                error={!!errors.receiver_user_id}
                disabled={isReadOnly || isUsersLoading}
                sx={{
                  width: "100%",
                  position: "relative",
                  "& .MuiFormHelperText-root": {
                    position: "absolute",
                    bottom: "-20px",
                    marginTop: "0px",
                  },
                }}>
                <Autocomplete
                  onChange={(event, item) => {
                    if (!isReadOnly) {
                      onChange(item || null);
                    }
                  }}
                  value={value || null}
                  options={safeUsers}
                  loading={isUsersLoading}
                  disabled={isReadOnly}
                  readOnly={isReadOnly}
                  getOptionLabel={(item) => item?.full_name || ""}
                  isOptionEqualToValue={(option, value) => {
                    if (!option || !value) return false;
                    return option.id === value.id;
                  }}
                  onBlur={() => {
                    if (!value || !value.id) {
                      onChange(null);
                    }
                  }}
                  renderOption={(props, option) => (
                    <Box component="li" {...props}>
                      <Box>
                        <Typography variant="body2" fontWeight={500}>
                          {option.full_name || "Unknown User"}
                        </Typography>
                        {option.position && (
                          <Typography variant="caption" color="text.secondary">
                            {typeof option.position === "string"
                              ? option.position
                              : option.position.position_name || "No Position"}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  )}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Receiver" // Removed the asterisk to make it optional
                      error={!!errors.receiver_user_id}
                      helperText={errors.receiver_user_id?.message}
                      InputProps={{
                        ...params.InputProps,
                        readOnly: isReadOnly,
                      }}
                      sx={{
                        backgroundColor: isReadOnly ? "#f5f5f5" : "white",
                      }}
                    />
                  )}
                />
              </FormControl>
            )}
          />
        </Grid>
      </Grid>

      <Grid item xs={12} md={6}>
        <Grid
          item
          xs={12}
          sm={4}
          sx={{ minWidth: "928px", maxWidth: "928px" }}></Grid>
        <Controller
          name="description"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Description"
              fullWidth
              multiline
              rows={3}
              error={!!errors.description}
              helperText={errors.description?.message}
              disabled={isReadOnly}
              sx={{
                backgroundColor: isReadOnly ? "#f5f5f5" : "white",
              }}
            />
          )}
        />
      </Grid>
    </Grid>
  );
};

export default ApprovalFlowFormFields;
