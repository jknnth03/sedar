import React, { useState, useMemo, useCallback } from "react";
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
  FormHelperText,
  Autocomplete,
} from "@mui/material";
import { useLazyGetAllShowReligionsQuery } from "../../../../../features/api/extras/religionsApi";
import { useLazyGetAllShowPrefixesQuery } from "../../../../../features/api/extras/prefixesApi";
import { useLazyGetAllGeneralsQuery } from "../../../../../features/api/employee/generalApi";
import { useLazyGetAllManpowerQuery } from "../../../../../features/api/employee/generalApi";

const PendingGeneralInformationForm = ({
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
    setValue,
  } = useFormContext();

  const [dropdownsLoaded, setDropdownsLoaded] = useState({
    religions: false,
    prefixes: false,
    referrers: false,
    approvalForms: false,
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

  const [
    triggerApprovalForms,
    {
      data: approvalFormsData,
      isLoading: approvalFormsLoading,
      error: approvalFormsError,
    },
  ] = useLazyGetAllManpowerQuery();

  const canEdit = selectedGeneral?.actions?.can_edit !== false;
  const isReadOnly = mode === "view" || isViewMode || !canEdit;
  const isFieldDisabled = isLoading || isReadOnly || readOnly || disabled;

  const handleDropdownFocus = useCallback(
    (dropdownName) => {
      if (
        mode === "view" ||
        isViewMode ||
        dropdownsLoaded[dropdownName] ||
        !canEdit
      )
        return;

      const fetchParams = { page: 1, per_page: 1000, status: "active" };

      switch (dropdownName) {
        case "religions":
          triggerReligions(fetchParams);
          break;
        case "prefixes":
          triggerPrefixes(fetchParams);
          break;
        case "referrers":
          triggerGenerals(fetchParams);
          break;
        case "approvalForms":
          triggerApprovalForms(fetchParams);
          break;
      }

      setDropdownsLoaded((prev) => ({ ...prev, [dropdownName]: true }));
    },
    [
      dropdownsLoaded,
      triggerReligions,
      triggerPrefixes,
      triggerGenerals,
      triggerApprovalForms,
      mode,
      isViewMode,
      canEdit,
    ]
  );

  const normalizeApiData = (data) => {
    if (!data) return [];
    return Array.isArray(data)
      ? data
      : data.result?.data ||
          data.result ||
          data.data ||
          data.items ||
          data.results ||
          [];
  };

  const religions = useMemo(() => {
    if (
      (mode === "view" || isViewMode || !canEdit) &&
      selectedGeneral?.religion
    ) {
      return [selectedGeneral.religion];
    }
    if (mode === "edit" && selectedGeneral?.religion && canEdit) {
      const existingReligion = selectedGeneral.religion;
      const apiReligions = normalizeApiData(religionsData);

      if (!religionsData) {
        return [existingReligion];
      }

      const hasExistingInApi = apiReligions.some(
        (religion) => religion.id === existingReligion.id
      );

      if (!hasExistingInApi) {
        return [existingReligion, ...apiReligions];
      }

      return apiReligions;
    }
    return normalizeApiData(religionsData);
  }, [mode, isViewMode, religionsData, selectedGeneral?.religion, canEdit]);

  const prefixes = useMemo(() => {
    if (
      (mode === "view" || isViewMode || !canEdit) &&
      selectedGeneral?.prefix
    ) {
      return [selectedGeneral.prefix];
    }
    if (mode === "edit" && selectedGeneral?.prefix && canEdit) {
      const existingPrefix = selectedGeneral.prefix;
      const apiPrefixes = normalizeApiData(prefixesData);

      if (!prefixesData) {
        return [existingPrefix];
      }

      const hasExistingInApi = apiPrefixes.some(
        (prefix) => prefix.id === existingPrefix.id
      );

      if (!hasExistingInApi) {
        return [existingPrefix, ...apiPrefixes];
      }

      return apiPrefixes;
    }
    return normalizeApiData(prefixesData);
  }, [mode, isViewMode, prefixesData, selectedGeneral?.prefix, canEdit]);

  const referrers = useMemo(() => {
    if (
      (mode === "view" || isViewMode || !canEdit) &&
      selectedGeneral?.referred_by
    ) {
      return [selectedGeneral.referred_by];
    }
    if (mode === "edit" && selectedGeneral?.referred_by && canEdit) {
      const existingReferrer = selectedGeneral.referred_by;
      const apiGenerals = normalizeApiData(generalsData);

      if (!generalsData) {
        return [existingReferrer];
      }

      const filtered = apiGenerals.filter((general) => {
        if (selectedGeneral?.id) {
          return general.id !== selectedGeneral.id;
        }
        return true;
      });

      const hasExistingInApi = filtered.some(
        (general) => general.id === existingReferrer.id
      );

      if (!hasExistingInApi) {
        return [existingReferrer, ...filtered];
      }

      return filtered;
    }
    const generals = normalizeApiData(generalsData);
    const filtered = generals.filter((general) => {
      if (selectedGeneral?.id) {
        return general.id !== selectedGeneral.id;
      }
      return true;
    });
    return filtered;
  }, [mode, isViewMode, generalsData, selectedGeneral, canEdit]);

  const approvalForms = useMemo(() => {
    if (
      (mode === "view" || isViewMode || !canEdit) &&
      selectedGeneral?.submission_title
    ) {
      return [selectedGeneral.submission_title];
    }
    if (mode === "edit" && selectedGeneral?.submission_title && canEdit) {
      const existingForm = selectedGeneral.submission_title;
      const apiForms = normalizeApiData(approvalFormsData);

      if (!approvalFormsData) {
        return [existingForm];
      }

      const hasExistingInApi = apiForms.some(
        (form) =>
          (form.id || form.submission_title) ===
          (existingForm.id || existingForm.submission_title)
      );

      if (!hasExistingInApi) {
        return [existingForm, ...apiForms];
      }

      return apiForms;
    }
    return normalizeApiData(approvalFormsData);
  }, [
    mode,
    isViewMode,
    approvalFormsData,
    selectedGeneral?.submission_title,
    canEdit,
  ]);

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

  const hasErrors =
    religionsError || prefixesError || generalsError || approvalFormsError;

  return (
    <Box
      className="pending-general-information-form"
      sx={{ width: "100%", paddingTop: 1 }}>
      {mode !== "view" && !isViewMode && hasErrors && (
        <Alert severity="error" sx={{ mb: 1 }}>
          Error loading dropdown data. Please try again.
        </Alert>
      )}

      {mode === "edit" && !canEdit && (
        <Alert severity="warning" sx={{ mb: 1 }}>
          You do not have permission to edit this record.
        </Alert>
      )}

      <Grid container spacing={1}>
        <Grid
          item
          xs={12}
          sm={4}
          sx={{ minWidth: "1134px", maxWidth: "1134px", pr: 1 }}>
          <Controller
            name="submission_title"
            control={control}
            render={({ field: { onChange, value, onBlur } }) => (
              <FormControl
                fullWidth
                variant="outlined"
                error={!!errors.submission_title}
                disabled={true}
                sx={{
                  width: "100%",
                  position: "relative",
                  "& .MuiFormHelperText-root": {
                    position: "absolute",
                  },
                }}>
                <Autocomplete
                  onChange={(event, item) => {
                    if (!isReadOnly) {
                      onChange(item || null);
                      setValue("submission_title", item);
                    }
                  }}
                  onBlur={() => {
                    if (!value || (!value.id && !value.submission_title)) {
                      onChange(null);
                    }
                    onBlur();
                  }}
                  value={value || null}
                  options={approvalForms ?? []}
                  loading={
                    mode !== "view" && !isViewMode && approvalFormsLoading
                  }
                  disabled={true}
                  readOnly={isReadOnly}
                  getOptionLabel={(item) => {
                    if (!item) return "";
                    return (
                      item?.submission_title || item?.name || item?.title || ""
                    );
                  }}
                  isOptionEqualToValue={(option, value) => {
                    if (!option || !value) return false;
                    const optionId = option.id || option.submission_title;
                    const valueId = value.id || value.submission_title;
                    return optionId === valueId;
                  }}
                  onFocus={() => {
                    if (!isReadOnly) {
                      handleDropdownFocus("approvalForms");
                    }
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Form *"
                      error={!!errors.submission_title}
                      helperText={errors.submission_title?.message}
                      InputProps={{
                        ...params.InputProps,
                        readOnly: isReadOnly,
                      }}
                    />
                  )}
                  renderOption={(props, option) => (
                    <li
                      {...props}
                      style={{ whiteSpace: "normal", wordWrap: "break-word" }}>
                      {option?.submission_title ||
                        option?.name ||
                        option?.title ||
                        ""}
                    </li>
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
          sx={{ minWidth: "373px", maxWidth: "373px", pr: 1 }}>
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
          sx={{ minWidth: "373px", maxWidth: "373px", pr: 1 }}>
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
          sx={{ minWidth: "373px", maxWidth: "373px", pr: 1 }}>
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
          sx={{ minWidth: "373px", maxWidth: "373px", pr: 1 }}>
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
          sx={{ minWidth: "373px", maxWidth: "373px", pr: 1 }}>
          <Controller
            name="prefix"
            control={control}
            render={({ field: { onChange, value, onBlur } }) => (
              <FormControl
                fullWidth
                variant="outlined"
                error={!!errors.prefix}
                disabled={
                  isFieldDisabled ||
                  (mode !== "view" && !isViewMode && prefixesLoading)
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
                    if (!isReadOnly) {
                      onChange(item || null);
                      setValue("prefix", item);
                    }
                  }}
                  onBlur={() => {
                    if (!value || !value.id) {
                      onChange(null);
                    }
                    onBlur();
                  }}
                  value={value || null}
                  options={prefixes ?? []}
                  loading={mode !== "view" && !isViewMode && prefixesLoading}
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
          sx={{ minWidth: "373px", maxWidth: "373px", pr: 1 }}>
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
          sx={{ minWidth: "373px", maxWidth: "373px", pr: 1 }}>
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
          sx={{ minWidth: "373px", maxWidth: "373px", pr: 1 }}>
          <Controller
            name="birth_place"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label={
                  <>
                    Birthplace <span style={{ color: "red" }}>*</span>
                  </>
                }
                variant="outlined"
                fullWidth
                disabled={isFieldDisabled}
                error={!!errors.birth_place}
                helperText={
                  errors.birth_place?.message ||
                  (!field.value ? "Birthplace is required." : "")
                }
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
          sx={{ minWidth: "373px", maxWidth: "373px", pr: 1 }}>
          <Controller
            name="nationality"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label={
                  <>
                    Nationality <span style={{ color: "red" }}>*</span>
                  </>
                }
                variant="outlined"
                fullWidth
                disabled={isFieldDisabled}
                error={!!errors.nationality}
                helperText={
                  errors.nationality?.message ||
                  (!field.value ? "Nationality is required." : "")
                }
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
          sx={{ minWidth: "373px", maxWidth: "373px", pr: 1 }}>
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
          sx={{ minWidth: "373px", maxWidth: "373px", pr: 1 }}>
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
          sx={{ minWidth: "373px", maxWidth: "373px", pr: 1 }}>
          <Controller
            name="religion"
            control={control}
            render={({ field: { onChange, value, onBlur } }) => (
              <FormControl
                fullWidth
                variant="outlined"
                error={!!errors.religion}
                disabled={
                  isFieldDisabled ||
                  (mode !== "view" && !isViewMode && religionsLoading)
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
                    if (!isReadOnly) {
                      onChange(item || null);
                      setValue("religion", item);
                    }
                  }}
                  onBlur={() => {
                    if (!value || !value.id) {
                      onChange(null);
                    }
                    onBlur();
                  }}
                  value={value || null}
                  options={religions ?? []}
                  loading={mode !== "view" && !isViewMode && religionsLoading}
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
          sx={{ minWidth: "373px", maxWidth: "373px", pr: 1 }}>
          <Controller
            name="referred_by"
            control={control}
            render={({ field: { onChange, value, onBlur } }) => (
              <FormControl
                fullWidth
                variant="outlined"
                disabled={
                  isFieldDisabled ||
                  (mode !== "view" && !isViewMode && generalsLoading)
                }
                sx={{ width: "100%" }}>
                <Autocomplete
                  onChange={(event, item) => {
                    if (!isReadOnly) {
                      onChange(item || null);
                      setValue("referred_by", item);
                    }
                  }}
                  onBlur={() => {
                    if (!value || !value.id) {
                      onChange(null);
                    }
                    onBlur();
                  }}
                  value={value || null}
                  options={referrers ?? []}
                  loading={mode !== "view" && !isViewMode && generalsLoading}
                  disabled={isFieldDisabled}
                  readOnly={isReadOnly}
                  getOptionLabel={(item) => {
                    const label =
                      item?.full_name ||
                      item?.name ||
                      `${item?.first_name || ""} ${
                        item?.last_name || ""
                      }`.trim() ||
                      item?.title ||
                      "";
                    return label;
                  }}
                  isOptionEqualToValue={(option, value) => {
                    if (!option || !value) return false;
                    return option.id === value.id;
                  }}
                  onFocus={() => {
                    if (!isReadOnly) {
                      handleDropdownFocus("referrers");
                    }
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Referred By (Optional)"
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
          sx={{ minWidth: "373px", maxWidth: "373px", pr: 1 }}>
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

PendingGeneralInformationForm.displayName = "PendingGeneralInformationForm";

export default PendingGeneralInformationForm;
