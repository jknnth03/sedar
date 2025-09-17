import React, {
  useEffect,
  useState,
  useMemo,
  useRef,
  useCallback,
} from "react";
import { useFormContext, Controller } from "react-hook-form";
import { Box, FormControl, Grid, TextField, Autocomplete } from "@mui/material";
import { useLazyGetAllShowBarangaysQuery } from "../../../../../features/api/administrative/barangaysApi";
import { useLazyGetAllShowMunicipalitiesQuery } from "../../../../../features/api/administrative/municipalitiesApi";
import { useLazyGetAllShowProvincesQuery } from "../../../../../features/api/administrative/provincesApi";
import { useLazyGetAllShowRegionsQuery } from "../../../../../features/api/administrative/regionsApi";
import EmployeeHeader from "./EmployeeHeader";
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

  const isReadOnly = mode === "view";

  const normalizeApiData = useCallback((data) => {
    if (!data) return [];
    return Array.isArray(data)
      ? data
      : data.result || data.data || data.items || data.results || [];
  }, []);

  const regions = useMemo(() => {
    if (mode === "view" && employeeData?.region_id) {
      return [employeeData.region_id];
    }
    if (mode === "edit" && employeeData?.region_id) {
      const existingRegion = employeeData.region_id;
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
  }, [mode, regionsApiData, employeeData?.region_id, normalizeApiData]);

  const provinces = useMemo(() => {
    if (mode === "view" && employeeData?.province_id) {
      return [employeeData.province_id];
    }
    if (mode === "edit" && employeeData?.province_id) {
      const existingProvince = employeeData.province_id;
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
  }, [mode, provincesApiData, employeeData?.province_id, normalizeApiData]);

  const municipalities = useMemo(() => {
    if (mode === "view" && employeeData?.city_municipality_id) {
      return [employeeData.city_municipality_id];
    }
    if (mode === "edit" && employeeData?.city_municipality_id) {
      const existingMunicipality = employeeData.city_municipality_id;
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
  }, [
    mode,
    municipalitiesApiData,
    employeeData?.city_municipality_id,
    normalizeApiData,
  ]);

  const barangays = useMemo(() => {
    if (mode === "view" && employeeData?.barangay_id) {
      return [employeeData.barangay_id];
    }
    if (mode === "edit" && employeeData?.barangay_id) {
      const existingBarangay = employeeData.barangay_id;
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
  }, [mode, barangaysApiData, employeeData?.barangay_id, normalizeApiData]);

  const handleDropdownFocus = useCallback(
    (dropdownName) => {
      if (mode === "view" || dropdownsLoaded[dropdownName]) return;

      const fetchParams = { page: 1, per_page: 1000, status: "active" };

      switch (dropdownName) {
        case "regions":
          triggerRegions(fetchParams);
          break;
        case "provinces":
          if (watchedValues.region_id?.psgc_id) {
            triggerProvinces({ psgc_id: watchedValues.region_id.psgc_id });
          }
          break;
        case "municipalities":
          if (watchedValues.province_id?.psgc_id) {
            triggerMunicipalities({
              psgc_id: watchedValues.province_id.psgc_id,
            });
          } else if (watchedValues.region_id?.psgc_id) {
            triggerMunicipalities({ psgc_id: watchedValues.region_id.psgc_id });
          }
          break;
        case "barangays":
          if (watchedValues.city_municipality_id?.psgc_id) {
            triggerBarangays({
              psgc_id: watchedValues.city_municipality_id.psgc_id,
            });
          }
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
      watchedValues,
    ]
  );

  const handleRegionChange = (value) => {
    setValue("region_id", value);
    setValue("province_id", null);
    setValue("city_municipality_id", null);
    setValue("barangay_id", null);

    if (value?.psgc_id) {
      triggerProvinces({ psgc_id: value.psgc_id });
      triggerMunicipalities({ psgc_id: value.psgc_id });
      setDropdownsLoaded((prev) => ({
        ...prev,
        provinces: true,
        municipalities: true,
      }));
    }
  };

  const handleProvinceChange = (value) => {
    setValue("province_id", value);
    setValue("city_municipality_id", null);
    setValue("barangay_id", null);

    if (value?.psgc_id) {
      triggerMunicipalities({ psgc_id: value.psgc_id });
      setDropdownsLoaded((prev) => ({ ...prev, municipalities: true }));
    }
  };

  const handleMunicipalityChange = (value) => {
    setValue("city_municipality_id", value);
    setValue("barangay_id", null);

    if (value?.psgc_id) {
      triggerBarangays({ psgc_id: value.psgc_id });
      setDropdownsLoaded((prev) => ({ ...prev, barangays: true }));
    }
  };

  const handleBarangayChange = (value) => {
    setValue("barangay_id", value);
  };

  return (
    <Box
      className="general-form"
      sx={{ width: "100%", maxWidth: "1200px", overflow: "0" }}>
      <EmployeeHeader getValues={getValues} selectedGeneral={employeeData} />
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
                  options={provinces ?? []}
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
                  options={municipalities ?? []}
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
                  options={barangays ?? []}
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
            render={({ field: { onChange, value, ...field } }) => (
              <TextField
                {...field}
                value={value}
                onChange={(e) => {
                  const numericValue = e.target.value.replace(/[^0-9]/g, "");
                  onChange(numericValue);
                }}
                fullWidth
                variant="outlined"
                label="ZIP Code *"
                disabled={isLoading || isReadOnly}
                error={!!errors.zip_code}
                helperText={errors.zip_code?.message}
                inputProps={{
                  inputMode: "numeric",
                  pattern: "[0-9]*",
                }}
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
