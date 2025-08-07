import React, { useEffect, useState, useMemo, useRef } from "react";
import { useFormContext, Controller } from "react-hook-form";
import { Box, FormControl, Grid, TextField, Autocomplete } from "@mui/material";
import { useLazyGetAllShowBarangaysQuery } from "../../../../../features/api/administrative/barangaysApi";
import { useLazyGetAllShowMunicipalitiesQuery } from "../../../../../features/api/administrative/municipalitiesApi";
import { useLazyGetAllShowProvincesQuery } from "../../../../../features/api/administrative/provincesApi";
import { useLazyGetAllShowRegionsQuery } from "../../../../../features/api/administrative/regionsApi";
import "./General.scss";

const AddressForm = ({
  selectedAddress,
  isLoading = false,
  mode = "create",
  employeeData,
}) => {
  const {
    control,
    formState: { errors },
    setValue,
    watch,
    getValues,
  } = useFormContext();

  const watchedValues = watch();
  const isInitialMount = useRef(true);

  const [dropdownsLoaded, setDropdownsLoaded] = useState({
    regions: false,
    provinces: false,
    municipalities: false,
    barangays: false,
  });

  const [
    triggerRegions,
    { data: regionsApiData, isLoading: regionsLoading, error: regionsError },
  ] = useLazyGetAllShowRegionsQuery();

  const [
    triggerProvinces,
    {
      data: provincesApiData,
      isLoading: provincesLoading,
      error: provincesError,
    },
  ] = useLazyGetAllShowProvincesQuery();

  const [
    triggerMunicipalities,
    {
      data: municipalitiesApiData,
      isLoading: municipalitiesLoading,
      error: municipalitiesError,
    },
  ] = useLazyGetAllShowMunicipalitiesQuery();

  const [
    triggerBarangays,
    {
      data: barangaysApiData,
      isLoading: barangaysLoading,
      error: barangaysError,
    },
  ] = useLazyGetAllShowBarangaysQuery();

  useEffect(() => {
    if (mode === "edit" || mode === "view") {
      const fetchParams = { page: 1, per_page: 1000, status: "active" };

      triggerRegions(fetchParams);
      triggerProvinces(fetchParams);
      triggerMunicipalities(fetchParams);
      triggerBarangays(fetchParams);

      setDropdownsLoaded({
        regions: true,
        provinces: true,
        municipalities: true,
        barangays: true,
      });
    }
  }, [
    mode,
    triggerRegions,
    triggerProvinces,
    triggerMunicipalities,
    triggerBarangays,
  ]);

  const handleDropdownFocus = (dropdownName) => {
    if (dropdownsLoaded[dropdownName]) return;

    const fetchParams = { page: 1, per_page: 1000, status: "active" };

    switch (dropdownName) {
      case "regions":
        triggerRegions(fetchParams);
        break;
      case "provinces":
        triggerProvinces(fetchParams);
        break;
      case "municipalities":
        triggerMunicipalities(fetchParams);
        break;
      case "barangays":
        triggerBarangays(fetchParams);
        break;
    }

    setDropdownsLoaded((prev) => ({ ...prev, [dropdownName]: true }));
  };

  const normalizeApiData = (data) => {
    if (!data) return [];
    return Array.isArray(data)
      ? data
      : data.result || data.data || data.items || data.results || [];
  };

  const regions = useMemo(
    () => normalizeApiData(regionsApiData),
    [regionsApiData]
  );
  const provinces = useMemo(
    () => normalizeApiData(provincesApiData),
    [provincesApiData]
  );
  const municipalities = useMemo(
    () => normalizeApiData(municipalitiesApiData),
    [municipalitiesApiData]
  );
  const barangays = useMemo(
    () => normalizeApiData(barangaysApiData),
    [barangaysApiData]
  );

  const filteredProvinces = useMemo(() => {
    if (!watchedValues.region_id || !provinces.length) return [];
    const regionId = watchedValues.region_id?.id || watchedValues.region_id;
    return provinces.filter(
      (province) =>
        province.region_id == regionId || province.region?.id == regionId
    );
  }, [provinces, watchedValues.region_id]);

  const filteredMunicipalities = useMemo(() => {
    if (!watchedValues.region_id || !municipalities.length) return [];

    const regionId = watchedValues.region_id?.id || watchedValues.region_id;
    const provinceId =
      watchedValues.province_id?.id || watchedValues.province_id;

    if (provinceId) {
      return municipalities.filter(
        (municipality) =>
          municipality.province_id == provinceId ||
          municipality.province?.id == provinceId
      );
    } else {
      return municipalities.filter(
        (municipality) =>
          !municipality.province_id &&
          !municipality.province &&
          (municipality.region_id == regionId ||
            municipality.region?.id == regionId)
      );
    }
  }, [municipalities, watchedValues.region_id, watchedValues.province_id]);

  const filteredBarangays = useMemo(() => {
    if (!watchedValues.city_municipality_id || !barangays.length) return [];
    const municipalityId =
      watchedValues.city_municipality_id?.id ||
      watchedValues.city_municipality_id;
    return barangays.filter(
      (barangay) =>
        barangay.city_municipality_id == municipalityId ||
        barangay.city_municipality?.id == municipalityId ||
        barangay.municipality_id == municipalityId ||
        barangay.municipality?.id == municipalityId
    );
  }, [barangays, watchedValues.city_municipality_id]);

  const handleRegionChange = (value) => {
    setValue("region_id", value);
    setValue("province_id", null);
    setValue("city_municipality_id", null);
    setValue("barangay_id", null);
  };

  const handleProvinceChange = (value) => {
    setValue("province_id", value);
    setValue("city_municipality_id", null);
    setValue("barangay_id", null);
  };

  const handleMunicipalityChange = (value) => {
    setValue("city_municipality_id", value);
    setValue("barangay_id", null);
  };

  const handleBarangayChange = (value) => {
    setValue("barangay_id", value);
  };

  const isReadOnly = mode === "view";

  return (
    <Box
      className="general-form"
      sx={{ width: "100%", maxWidth: "1200px", overflow: "0" }}>
      <Grid container spacing={1}>
        <Grid item xs={12} sm={3} sx={{ minWidth: "362px", maxWidth: "362px" }}>
          <Controller
            name="region_id"
            control={control}
            render={({ field: { onChange, value } }) => (
              <FormControl
                fullWidth
                variant="outlined"
                error={!!errors.region_id}
                disabled={isLoading || regionsLoading || isReadOnly}>
                <Autocomplete
                  onChange={(event, item) => {
                    if (!isReadOnly) {
                      onChange(item);
                      handleRegionChange(item);
                    }
                  }}
                  value={value || null}
                  disabled={isLoading || isReadOnly}
                  options={regions ?? []}
                  loading={regionsLoading}
                  getOptionLabel={(item) => item?.name || ""}
                  isOptionEqualToValue={(option, value) => {
                    if (!option || !value) return false;
                    return option.id === value.id;
                  }}
                  onOpen={() => {
                    if (!isReadOnly) {
                      handleDropdownFocus("regions");
                    }
                  }}
                  readOnly={isReadOnly}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label={
                        <>
                          Region <span style={{ color: "red" }}>*</span>
                        </>
                      }
                      error={!!errors.region_id}
                      helperText={errors.region_id?.message}
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

        <Grid item xs={12} sm={3} sx={{ minWidth: "362px", maxWidth: "362px" }}>
          <Controller
            name="province_id"
            control={control}
            render={({ field: { onChange, value } }) => (
              <FormControl
                fullWidth
                variant="outlined"
                disabled={
                  isLoading ||
                  provincesLoading ||
                  !watchedValues.region_id ||
                  isReadOnly
                }>
                <Autocomplete
                  onChange={(event, item) => {
                    if (!isReadOnly) {
                      onChange(item);
                      handleProvinceChange(item);
                    }
                  }}
                  value={value || null}
                  disabled={isLoading || isReadOnly}
                  options={filteredProvinces ?? []}
                  loading={provincesLoading}
                  getOptionLabel={(item) => item?.name || ""}
                  isOptionEqualToValue={(option, value) => {
                    if (!option || !value) return false;
                    return option.id === value.id;
                  }}
                  onOpen={() => {
                    if (!isReadOnly) {
                      handleDropdownFocus("provinces");
                    }
                  }}
                  readOnly={isReadOnly}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Province (Leave blank if none)"
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

        <Grid item xs={12} sm={3} sx={{ minWidth: "362px", maxWidth: "362px" }}>
          <Controller
            name="city_municipality_id"
            control={control}
            render={({ field: { onChange, value } }) => (
              <FormControl
                fullWidth
                variant="outlined"
                error={!!errors.city_municipality_id}
                disabled={
                  isLoading ||
                  municipalitiesLoading ||
                  !watchedValues.region_id ||
                  isReadOnly
                }>
                <Autocomplete
                  onChange={(event, item) => {
                    if (!isReadOnly) {
                      onChange(item);
                      handleMunicipalityChange(item);
                    }
                  }}
                  value={value || null}
                  options={filteredMunicipalities ?? []}
                  loading={municipalitiesLoading}
                  getOptionLabel={(item) => item?.name || ""}
                  disabled={isLoading || isReadOnly}
                  isOptionEqualToValue={(option, value) => {
                    if (!option || !value) return false;
                    return option.id === value.id;
                  }}
                  onOpen={() => {
                    if (!isReadOnly) {
                      handleDropdownFocus("municipalities");
                    }
                  }}
                  readOnly={isReadOnly}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label={
                        <>
                          City/Municipality{" "}
                          <span style={{ color: "red" }}>*</span>
                        </>
                      }
                      error={!!errors.city_municipality_id}
                      helperText={errors.city_municipality_id?.message}
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

        <Grid item xs={12} sm={3} sx={{ minWidth: "362px", maxWidth: "362px" }}>
          <Controller
            name="barangay_id"
            control={control}
            render={({ field: { onChange, value } }) => (
              <FormControl
                fullWidth
                variant="outlined"
                error={!!errors.barangay_id}
                disabled={
                  isLoading ||
                  barangaysLoading ||
                  !watchedValues.city_municipality_id ||
                  isReadOnly
                }>
                <Autocomplete
                  onChange={(event, item) => {
                    if (!isReadOnly) {
                      onChange(item);
                      handleBarangayChange(item);
                    }
                  }}
                  value={value || null}
                  options={filteredBarangays ?? []}
                  disabled={isLoading || isReadOnly}
                  loading={barangaysLoading}
                  getOptionLabel={(item) => item?.name || ""}
                  isOptionEqualToValue={(option, value) => {
                    if (!option || !value) return false;
                    return option.id === value.id;
                  }}
                  onOpen={() => {
                    if (!isReadOnly) {
                      handleDropdownFocus("barangays");
                    }
                  }}
                  readOnly={isReadOnly}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label={
                        <>
                          Barangay <span style={{ color: "red" }}>*</span>
                        </>
                      }
                      error={!!errors.barangay_id}
                      helperText={errors.barangay_id?.message}
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

        <Grid item xs={12} sm={6} sx={{ minWidth: "362px", maxWidth: "700px" }}>
          <Controller
            name="street"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                variant="outlined"
                label="Street Address *"
                disabled={isLoading || isReadOnly}
                error={!!errors.street}
                helperText={errors.street?.message}
                InputProps={{
                  readOnly: isReadOnly,
                }}
              />
            )}
          />
        </Grid>

        <Grid item xs={12} sm={3} sx={{ minWidth: "362px", maxWidth: "362px" }}>
          <Controller
            name="zip_code"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                variant="outlined"
                label="ZIP Code *"
                disabled={isLoading || isReadOnly}
                error={!!errors.zip_code}
                helperText={errors.zip_code?.message}
                InputProps={{
                  readOnly: isReadOnly,
                }}
              />
            )}
          />
        </Grid>

        <Grid
          item
          xs={12}
          sm={3}
          sx={{ minWidth: "1102px", maxWidth: "1102px" }}>
          <Controller
            name="address_remarks"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                variant="outlined"
                label="Address Remarks (Optional)"
                disabled={isLoading || isReadOnly}
                error={!!errors.address_remarks}
                helperText={errors.address_remarks?.message}
                InputProps={{
                  readOnly: isReadOnly,
                }}
                multiline
                rows={3}
                placeholder="Additional notes or comments..."
              />
            )}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

AddressForm.displayName = "AddressForm";

export default AddressForm;
