import React, { useEffect, useState, useMemo } from "react";
import { useFormContext, Controller } from "react-hook-form";
import {
  Box,
  Alert,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Grid,
  CircularProgress,
  FormHelperText,
  Autocomplete,
} from "@mui/material";
import { useLazyGetAllShowReligionsQuery } from "../../../../../features/api/extras/religionsApi";
import { useLazyGetAllShowPrefixesQuery } from "../../../../../features/api/extras/prefixesApi";
import { useLazyGetAllGeneralsQuery } from "../../../../../features/api/employee/generalApi";

const GeneralForm = ({
  selectedGeneral,
  isLoading = false,
  mode = "create",
  isViewMode = false,
  readOnly = false,
  disabled = false,
}) => {
  const {
    control,
    watch,
    formState: { errors, defaultValues },
  } = useFormContext();

  const [dropdownsLoaded, setDropdownsLoaded] = useState({
    religions: false,
    prefixes: false,
    referrers: false,
  });

  const [
    triggerReligions,
    { data: religionsData, isLoading: religionsLoading, error: religionsError },
  ] = useLazyGetAllShowReligionsQuery();

  const [
    triggerPrefixes,
    { data: prefixesData, isLoading: prefixesLoading, error: prefixesError },
  ] = useLazyGetAllShowPrefixesQuery();

  const [
    triggerGenerals,
    { data: generalsData, isLoading: generalsLoading, error: generalsError },
  ] = useLazyGetAllGeneralsQuery();

  const isReadOnly = mode === "view" || isViewMode;
  const isFieldDisabled = isLoading || isReadOnly || readOnly || disabled;

  useEffect(() => {
    const loadInitialData = async () => {
      if (mode === "edit" || mode === "view" || isViewMode) {
        const fetchParams = { page: 1, per_page: 1000, status: "active" };

        try {
          const promises = [
            triggerReligions(fetchParams, true),
            triggerPrefixes(fetchParams),
            triggerGenerals(fetchParams),
          ];

          await Promise.allSettled(promises);

          setDropdownsLoaded({
            religions: true,
            prefixes: true,
            referrers: true,
          });
        } catch (error) {
          console.error("Error loading initial dropdown data:", error);
        }
      }
    };

    loadInitialData();
  }, [mode, isViewMode, triggerReligions, triggerPrefixes, triggerGenerals]);

  const handleDropdownFocus = async (dropdownName) => {
    if (dropdownsLoaded[dropdownName] || isReadOnly) return;

    const fetchParams = { page: 1, per_page: 1000, status: "active" };

    try {
      switch (dropdownName) {
        case "religions":
          await triggerReligions(fetchParams, true);
          break;
        case "prefixes":
          await triggerPrefixes(fetchParams);
          break;
        case "referrers":
          await triggerGenerals(fetchParams);
          break;
        default:
          return;
      }

      setDropdownsLoaded((prev) => ({ ...prev, [dropdownName]: true }));
    } catch (error) {
      console.error(`Error loading ${dropdownName} data:`, error);
    }
  };

  const normalizeApiData = (data) => {
    if (!data) return [];
    return Array.isArray(data)
      ? data
      : data.result || data.data || data.items || data.results || [];
  };

  const religions = useMemo(
    () => normalizeApiData(religionsData),
    [religionsData]
  );

  const prefixes = useMemo(
    () => normalizeApiData(prefixesData),
    [prefixesData]
  );

  const referrers = useMemo(() => {
    const generals = normalizeApiData(generalsData);

    return generals.filter((general) => {
      if (selectedGeneral?.id) {
        return general.id !== selectedGeneral.id;
      }
      return true;
    });
  }, [generalsData, selectedGeneral]);

  const civilStatusOptions = [
    "SINGLE",
    "MARRIED",
    "WIDOWED",
    "DIVORCED",
    "SEPARATED",
    "REGISTERED PARTNERSHIP",
  ];
  const genderOptions = ["MALE", "FEMALE"];

  const getMaxBirthDate = () => {
    const today = new Date();
    const eighteenYearsAgo = new Date(
      today.getFullYear() - 18,
      today.getMonth(),
      today.getDate()
    );
    return eighteenYearsAgo.toISOString().split("T")[0];
  };

  const renderReferrerItems = (items, loading) => {
    if (loading && items.length === 0) {
      return (
        <MenuItem disabled>
          <CircularProgress size={16} sx={{ mr: 1 }} />
          Loading...
        </MenuItem>
      );
    }

    return items.map((item, index) => {
      const display =
        item.name ||
        `${item.first_name || ""} ${item.last_name || ""}`.trim() ||
        item.title ||
        "";

      return (
        <MenuItem key={item.id || index} value={item.id}>
          {display}
        </MenuItem>
      );
    });
  };

  const hasErrors = religionsError || prefixesError || generalsError;

  return (
    <Box className="general-form" sx={{ width: "100%" }}>
      {hasErrors && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Error loading dropdown data. Please try again.
        </Alert>
      )}

      <Grid
        container
        spacing={0.75}
        sx={{
          width: "100%",
          "& .MuiGrid-item": {
            paddingBottom: "8px !important",
            "& .MuiTextField-root, & .MuiFormControl-root": {
              marginBottom: "0px",
              "& .MuiFormHelperText-root": {
                position: "absolute",
                bottom: "-20px",
                marginTop: "0px",
              },
            },
          },
        }}>
        <Grid
          item
          xs={12}
          sm={4}
          sx={{ minWidth: "353px", maxWidth: "350px", pr: 1 }}>
          <Controller
            name="first_name"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label={
                  <>
                    First Name <span style={{ color: "red" }}>*</span>
                  </>
                }
                variant="outlined"
                fullWidth
                disabled={isFieldDisabled}
                error={!!errors.first_name}
                helperText={errors.first_name?.message}
                InputProps={{
                  readOnly: isReadOnly,
                }}
                sx={{
                  width: "100%",
                  position: "relative",
                  "& .MuiFormHelperText-root": {
                    position: "absolute",
                    bottom: "-20px",
                    marginTop: "0px",
                  },
                }}
              />
            )}
          />
        </Grid>

        <Grid
          item
          xs={12}
          sm={4}
          sx={{ minWidth: "353px", maxWidth: "350px", pr: 1 }}>
          <Controller
            name="middle_name"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Middle Name (Optional)"
                variant="outlined"
                fullWidth
                disabled={isFieldDisabled}
                InputProps={{
                  readOnly: isReadOnly,
                }}
                sx={{ width: "100%" }}
              />
            )}
          />
        </Grid>

        <Grid
          item
          xs={12}
          sm={4}
          sx={{ minWidth: "353px", maxWidth: "350px", pr: 1 }}>
          <Controller
            name="last_name"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label={
                  <>
                    Last Name <span style={{ color: "red" }}>*</span>
                  </>
                }
                variant="outlined"
                fullWidth
                disabled={isFieldDisabled}
                error={!!errors.last_name}
                helperText={errors.last_name?.message}
                InputProps={{
                  readOnly: isReadOnly,
                }}
                sx={{
                  width: "100%",
                  position: "relative",
                  "& .MuiFormHelperText-root": {
                    position: "absolute",
                    bottom: "-20px",
                    marginTop: "0px",
                  },
                }}
              />
            )}
          />
        </Grid>

        <Grid
          item
          xs={12}
          sm={4}
          sx={{ minWidth: "353px", maxWidth: "350px", pr: 1 }}>
          <Controller
            name="suffix"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Suffix (Optional)"
                variant="outlined"
                fullWidth
                disabled={isFieldDisabled}
                InputProps={{
                  readOnly: isReadOnly,
                }}
                sx={{ width: "100%" }}
              />
            )}
          />
        </Grid>

        <Grid
          item
          xs={12}
          sm={4}
          sx={{ minWidth: "353px", maxWidth: "350px", pr: 1 }}>
          <Controller
            name="prefix"
            control={control}
            render={({ field: { onChange, value } }) => (
              <FormControl
                fullWidth
                variant="outlined"
                error={!!errors.prefix}
                disabled={isFieldDisabled || prefixesLoading}
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
                      // Ensure we're setting the complete object or null
                      onChange(item || null);
                    }
                  }}
                  value={value || null}
                  options={prefixes ?? []}
                  loading={prefixesLoading}
                  disabled={isFieldDisabled}
                  readOnly={isReadOnly}
                  getOptionLabel={(item) =>
                    item?.name || item?.title || item?.label || item?.code || ""
                  }
                  isOptionEqualToValue={(option, value) => {
                    if (!option || !value) return false;
                    return option.id === value.id;
                  }}
                  onFocus={() => {
                    if (!isReadOnly) {
                      handleDropdownFocus("prefixes");
                    }
                  }}
                  // Add onBlur to trigger validation
                  onBlur={() => {
                    // This will trigger validation when user leaves the field
                    if (!value || !value.id) {
                      onChange(null);
                    }
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label={
                        <>
                          Prefix <span style={{ color: "red" }}>*</span>
                        </>
                      }
                      error={!!errors.prefix}
                      helperText={errors.prefix?.message}
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

        <Grid
          item
          xs={12}
          sm={4}
          sx={{ minWidth: "353px", maxWidth: "350px", pr: 1 }}>
          <Controller
            name="id_number"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label={
                  <>
                    ID Number <span style={{ color: "red" }}>*</span>
                  </>
                }
                variant="outlined"
                fullWidth
                disabled={isFieldDisabled}
                error={!!errors.id_number}
                helperText={errors.id_number?.message}
                InputProps={{
                  readOnly: isReadOnly,
                }}
                sx={{
                  width: "100%",
                  position: "relative",
                  "& .MuiFormHelperText-root": {
                    position: "absolute",
                    bottom: "-20px",
                    marginTop: "0px",
                  },
                }}
              />
            )}
          />
        </Grid>

        <Grid
          item
          xs={12}
          sm={4}
          sx={{ minWidth: "353px", maxWidth: "350px", pr: 1 }}>
          <Controller
            name="birth_date"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label={
                  <>
                    Birth Date <span style={{ color: "red" }}>*</span>
                  </>
                }
                type="date"
                variant="outlined"
                fullWidth
                disabled={isFieldDisabled}
                error={!!errors.birth_date}
                helperText={errors.birth_date?.message}
                InputLabelProps={{ shrink: true }}
                InputProps={{
                  readOnly: isReadOnly,
                }}
                inputProps={{ max: getMaxBirthDate() }}
                sx={{
                  width: "100%",
                  position: "relative",
                  "& .MuiFormHelperText-root": {
                    position: "absolute",
                    bottom: "-20px",
                    marginTop: "0px",
                  },
                }}
              />
            )}
          />
        </Grid>

        <Grid
          item
          xs={12}
          sm={4}
          sx={{ minWidth: "353px", maxWidth: "350px", pr: 1 }}>
          <Controller
            name="gender"
            control={control}
            render={({ field }) => (
              <FormControl
                fullWidth
                variant="outlined"
                error={!!errors.gender}
                disabled={isFieldDisabled}
                sx={{
                  width: "100%",
                  position: "relative",
                  "& .MuiFormHelperText-root": {
                    position: "absolute",
                    bottom: "-20px",
                    marginTop: "0px",
                  },
                }}>
                <InputLabel>
                  Gender <span style={{ color: "red" }}>*</span>
                </InputLabel>
                <Select {...field} label="Gender *" readOnly={isReadOnly}>
                  <MenuItem value="">
                    <em>Select Gender</em>
                  </MenuItem>
                  {genderOptions.map((gender) => (
                    <MenuItem key={gender} value={gender}>
                      {gender}
                    </MenuItem>
                  ))}
                </Select>
                {errors.gender && (
                  <FormHelperText>{errors.gender.message}</FormHelperText>
                )}
              </FormControl>
            )}
          />
        </Grid>

        <Grid
          item
          xs={12}
          sm={4}
          sx={{ minWidth: "353px", maxWidth: "350px", pr: 1 }}>
          <Controller
            name="civil_status"
            control={control}
            render={({ field }) => (
              <FormControl
                fullWidth
                variant="outlined"
                error={!!errors.civil_status}
                disabled={isFieldDisabled}
                sx={{
                  width: "100%",
                  position: "relative",
                  "& .MuiFormHelperText-root": {
                    position: "absolute",
                    bottom: "-20px",
                    marginTop: "0px",
                  },
                }}>
                <InputLabel>
                  Civil Status <span style={{ color: "red" }}>*</span>
                </InputLabel>
                <Select {...field} label="Civil Status *" readOnly={isReadOnly}>
                  <MenuItem value="">
                    <em>Select Civil Status</em>
                  </MenuItem>
                  {civilStatusOptions.map((status) => (
                    <MenuItem key={status} value={status}>
                      {status}
                    </MenuItem>
                  ))}
                </Select>
                {errors.civil_status && (
                  <FormHelperText>{errors.civil_status.message}</FormHelperText>
                )}
              </FormControl>
            )}
          />
        </Grid>

        <Grid
          item
          xs={12}
          sm={4}
          sx={{ minWidth: "353px", maxWidth: "350px", pr: 1 }}>
          <Controller
            name="religion"
            control={control}
            render={({ field: { onChange, value } }) => (
              <FormControl
                fullWidth
                variant="outlined"
                error={!!errors.religion}
                disabled={isFieldDisabled || religionsLoading}
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
                  options={religions ?? []}
                  loading={religionsLoading}
                  disabled={isFieldDisabled}
                  readOnly={isReadOnly}
                  getOptionLabel={(item) => item?.name || ""}
                  isOptionEqualToValue={(option, value) => {
                    if (!option || !value) return false;
                    return option.id === value.id;
                  }}
                  onFocus={() => {
                    if (!isReadOnly) {
                      handleDropdownFocus("religions");
                    }
                  }}
                  onBlur={() => {
                    if (!value || !value.id) {
                      onChange(null);
                    }
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label={
                        <>
                          Religion <span style={{ color: "red" }}>*</span>
                        </>
                      }
                      error={!!errors.religion}
                      helperText={errors.religion?.message}
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

        <Grid
          item
          xs={12}
          sm={4}
          sx={{ minWidth: "353px", maxWidth: "350px", pr: 1 }}>
          <Controller
            name="referred_by"
            control={control}
            render={({ field }) => (
              <FormControl
                fullWidth
                variant="outlined"
                disabled={isFieldDisabled || generalsLoading}
                sx={{ width: "100%" }}>
                <InputLabel>Referred By (Optional)</InputLabel>
                <Select
                  {...field}
                  label="Referred By (Optional)"
                  readOnly={isReadOnly}
                  onFocus={() => {
                    if (!isReadOnly) {
                      handleDropdownFocus("referrers");
                    }
                  }}>
                  <MenuItem value="">
                    <em>None</em>
                  </MenuItem>
                  {renderReferrerItems(referrers, generalsLoading)}
                </Select>
              </FormControl>
            )}
          />
        </Grid>

        <Grid
          item
          xs={12}
          sm={4}
          sx={{ minWidth: "353px", maxWidth: "350px", pr: 1 }}>
          <Controller
            name="remarks"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Remarks (Optional)"
                variant="outlined"
                fullWidth
                disabled={isFieldDisabled}
                placeholder="Additional notes or comments..."
                InputProps={{
                  readOnly: isReadOnly,
                }}
                sx={{ width: "100%" }}
              />
            )}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

GeneralForm.displayName = "GeneralForm";

export default GeneralForm;
