import React, { useState, useMemo, useCallback } from "react";
import { useFormContext, Controller } from "react-hook-form";
import { Box, FormControl, Grid, TextField, Autocomplete } from "@mui/material";
import { useLazyGetAllShowBarangaysQuery } from "../../../../../features/api/administrative/barangaysApi";
import { useLazyGetAllShowMunicipalitiesQuery } from "../../../../../features/api/administrative/municipalitiesApi";
import { useLazyGetAllShowProvincesQuery } from "../../../../../features/api/administrative/provincesApi";
import { useLazyGetAllShowRegionsQuery } from "../../../../../features/api/administrative/regionsApi";

const PendingAddressForm = ({
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

  const handleDropdownFocus = useCallback(
    (dropdownName) => {
      if (mode === "view" || dropdownsLoaded[dropdownName]) return;

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
    },
    [
      dropdownsLoaded,
      triggerRegions,
      triggerProvinces,
      triggerMunicipalities,
      triggerBarangays,
      mode,
    ]
  );

  const normalizeApiData = (data) => {
    if (!data) return [];
    return Array.isArray(data)
      ? data
      : data.result || data.data || data.items || data.results || [];
  };

  const regions = useMemo(() => {
    if (mode === "view" && selectedAddress?.region) {
      return [selectedAddress.region];
    }
    if (mode === "edit" && selectedAddress?.region) {
      const existingRegion = selectedAddress.region;
      const apiRegions = normalizeApiData(regionsApiData);

      if (!regionsApiData) {
        return [existingRegion];
      }

      const hasExistingInApi = apiRegions.some(
        (region) => region.id === existingRegion.id
      );

      if (!hasExistingInApi) {
        return [existingRegion, ...apiRegions];
      }

      return apiRegions;
    }
    return normalizeApiData(regionsApiData);
  }, [mode, regionsApiData, selectedAddress?.region]);

  const provinces = useMemo(() => {
    if (mode === "view" && selectedAddress?.province) {
      return [selectedAddress.province];
    }
    if (mode === "edit" && selectedAddress?.province) {
      const existingProvince = selectedAddress.province;
      const apiProvinces = normalizeApiData(provincesApiData);

      if (!provincesApiData) {
        return [existingProvince];
      }

      const hasExistingInApi = apiProvinces.some(
        (province) => province.id === existingProvince.id
      );

      if (!hasExistingInApi) {
        return [existingProvince, ...apiProvinces];
      }

      return apiProvinces;
    }
    return normalizeApiData(provincesApiData);
  }, [mode, provincesApiData, selectedAddress?.province]);

  const municipalities = useMemo(() => {
    if (mode === "view" && selectedAddress?.city_municipality) {
      return [selectedAddress.city_municipality];
    }
    if (mode === "edit" && selectedAddress?.city_municipality) {
      const existingMunicipality = selectedAddress.city_municipality;
      const apiMunicipalities = normalizeApiData(municipalitiesApiData);

      if (!municipalitiesApiData) {
        return [existingMunicipality];
      }

      const hasExistingInApi = apiMunicipalities.some(
        (municipality) => municipality.id === existingMunicipality.id
      );

      if (!hasExistingInApi) {
        return [existingMunicipality, ...apiMunicipalities];
      }

      return apiMunicipalities;
    }
    return normalizeApiData(municipalitiesApiData);
  }, [mode, municipalitiesApiData, selectedAddress?.city_municipality]);

  const barangays = useMemo(() => {
    if (mode === "view" && selectedAddress?.barangay) {
      return [selectedAddress.barangay];
    }
    if (mode === "edit" && selectedAddress?.barangay) {
      const existingBarangay = selectedAddress.barangay;
      const apiBarangays = normalizeApiData(barangaysApiData);

      if (!barangaysApiData) {
        return [existingBarangay];
      }

      const hasExistingInApi = apiBarangays.some(
        (barangay) => barangay.id === existingBarangay.id
      );

      if (!hasExistingInApi) {
        return [existingBarangay, ...apiBarangays];
      }

      return apiBarangays;
    }
    return normalizeApiData(barangaysApiData);
  }, [mode, barangaysApiData, selectedAddress?.barangay]);

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
    setValue("region", value);
    setValue("region_id", value?.id || "");
    setValue("province", null);
    setValue("province_id", "");
    setValue("city_municipality", null);
    setValue("city_municipality_id", "");
    setValue("barangay", null);
    setValue("barangay_id", "");
  };

  const handleProvinceChange = (value) => {
    setValue("province", value);
    setValue("province_id", value?.id || "");
    setValue("city_municipality", null);
    setValue("city_municipality_id", "");
    setValue("barangay", null);
    setValue("barangay_id", "");
  };

  const handleMunicipalityChange = (value) => {
    setValue("city_municipality", value);
    setValue("city_municipality_id", value?.id || "");
    setValue("barangay", null);
    setValue("barangay_id", "");
  };

  const handleBarangayChange = (value) => {
    setValue("barangay", value);
    setValue("barangay_id", value?.id || "");
  };

  const isReadOnly = mode === "view";

  return (
    <Box
      className="general-form"
      sx={{ width: "100%", maxWidth: "1200px", overflow: "0" }}>
      <Grid container spacing={1}>
        <Grid item xs={12} sm={3} sx={{ minWidth: "362px", maxWidth: "362px" }}>
          <Controller
            name="region"
            control={control}
            render={({ field: { onChange, value, onBlur } }) => (
              <FormControl
                fullWidth
                variant="outlined"
                error={!!errors.region}
                disabled={
                  isLoading || (mode !== "view" && regionsLoading) || isReadOnly
                }>
                <Autocomplete
                  onChange={(event, item) => {
                    if (!isReadOnly) {
                      onChange(item);
                      setValue("region", item);
                      handleRegionChange(item);
                    }
                  }}
                  onBlur={() => {
                    if (!value || !value.id) {
                      onChange(null);
                    }
                    onBlur();
                  }}
                  value={value || null}
                  disabled={isLoading || isReadOnly}
                  options={regions ?? []}
                  loading={mode !== "view" && regionsLoading}
                  getOptionLabel={(item) => item?.name || ""}
                  isOptionEqualToValue={(option, value) => {
                    if (!option || !value) return false;
                    return option.id === value.id;
                  }}
                  onFocus={() => {
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
                      error={!!errors.region}
                      helperText={errors.region?.message}
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
            name="province"
            control={control}
            render={({ field: { onChange, value, onBlur } }) => (
              <FormControl
                fullWidth
                variant="outlined"
                disabled={
                  isLoading ||
                  (mode !== "view" && provincesLoading) ||
                  !watchedValues.region ||
                  isReadOnly
                }>
                <Autocomplete
                  onChange={(event, item) => {
                    if (!isReadOnly) {
                      onChange(item);
                      setValue("province", item);
                      handleProvinceChange(item);
                    }
                  }}
                  onBlur={() => {
                    if (!value || !value.id) {
                      onChange(null);
                    }
                    onBlur();
                  }}
                  value={value || null}
                  disabled={isLoading || isReadOnly}
                  options={filteredProvinces ?? []}
                  loading={mode !== "view" && provincesLoading}
                  getOptionLabel={(item) => item?.name || ""}
                  isOptionEqualToValue={(option, value) => {
                    if (!option || !value) return false;
                    return option.id === value.id;
                  }}
                  onFocus={() => {
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
            name="city_municipality"
            control={control}
            render={({ field: { onChange, value, onBlur } }) => (
              <FormControl
                fullWidth
                variant="outlined"
                error={!!errors.city_municipality}
                disabled={
                  isLoading ||
                  (mode !== "view" && municipalitiesLoading) ||
                  !watchedValues.region ||
                  isReadOnly
                }>
                <Autocomplete
                  onChange={(event, item) => {
                    if (!isReadOnly) {
                      onChange(item);
                      setValue("city_municipality", item);
                      handleMunicipalityChange(item);
                    }
                  }}
                  onBlur={() => {
                    if (!value || !value.id) {
                      onChange(null);
                    }
                    onBlur();
                  }}
                  value={value || null}
                  options={filteredMunicipalities ?? []}
                  loading={mode !== "view" && municipalitiesLoading}
                  getOptionLabel={(item) => item?.name || ""}
                  disabled={isLoading || isReadOnly}
                  isOptionEqualToValue={(option, value) => {
                    if (!option || !value) return false;
                    return option.id === value.id;
                  }}
                  onFocus={() => {
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
                      error={!!errors.city_municipality}
                      helperText={errors.city_municipality?.message}
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
            name="barangay"
            control={control}
            render={({ field: { onChange, value, onBlur } }) => (
              <FormControl
                fullWidth
                variant="outlined"
                error={!!errors.barangay}
                disabled={
                  isLoading ||
                  (mode !== "view" && barangaysLoading) ||
                  !watchedValues.city_municipality ||
                  isReadOnly
                }>
                <Autocomplete
                  onChange={(event, item) => {
                    if (!isReadOnly) {
                      onChange(item);
                      setValue("barangay", item);
                      handleBarangayChange(item);
                    }
                  }}
                  onBlur={() => {
                    if (!value || !value.id) {
                      onChange(null);
                    }
                    onBlur();
                  }}
                  value={value || null}
                  options={filteredBarangays ?? []}
                  disabled={isLoading || isReadOnly}
                  loading={mode !== "view" && barangaysLoading}
                  getOptionLabel={(item) => item?.name || ""}
                  isOptionEqualToValue={(option, value) => {
                    if (!option || !value) return false;
                    return option.id === value.id;
                  }}
                  onFocus={() => {
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
                      error={!!errors.barangay}
                      helperText={errors.barangay?.message}
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

PendingAddressForm.displayName = "PendingAddressForm";

export default PendingAddressForm;
