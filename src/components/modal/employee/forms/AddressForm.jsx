import React, {
  useEffect,
  useState,
  useMemo,
  forwardRef,
  useImperativeHandle,
  useCallback,
} from "react";
import {
  Box,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  TextField,
  Typography,
  CircularProgress,
} from "@mui/material";
import { useSnackbar } from "notistack";
import { useGetEmployeesQuery } from "../../../../features/api/employee/mainApi";
import { useLazyGetAllShowBarangaysQuery } from "../../../../features/api/administrative/barangaysApi";
import { useLazyGetAllShowMunicipalitiesQuery } from "../../../../features/api/administrative/municipalitiesApi";
import { useLazyGetAllShowProvincesQuery } from "../../../../features/api/administrative/provincesApi";
import { useLazyGetAllShowRegionsQuery } from "../../../../features/api/administrative/regionsApi";
import {
  INITIAL_FORM_STATE,
  normalizeApiData,
  getFilteredProvinces,
  getFilteredCityMunicipalities,
  getFilteredBarangays,
  validateForm,
  isFormValid,
  getEnhancedFormData,
  generateFullAddress,
  handleFieldChange,
} from "./addressFormUtils";
import "./General.scss";

const AddressForm = forwardRef(
  (
    {
      onSubmit,
      selectedAddress,
      selectedEmployeeId = null, // New prop for employee ID
      isLoading = false,
      onValidationChange,
      mode = "create",
      showHeader = true,
      onFormChange = null,
      employeeData,
    },
    ref
  ) => {
    const { enqueueSnackbar } = useSnackbar();

    const [form, setForm] = useState({
      ...INITIAL_FORM_STATE,
      region_display: "",
      province_display: "",
      city_municipality_display: "",
      barangay_display: "",
    });
    const [errors, setErrors] = useState({});
    const [errorMessage, setErrorMessage] = useState(null);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);
    const [initialForm, setInitialForm] = useState({});
    const [isProcessingAddress, setIsProcessingAddress] = useState(false);

    const [regionsData, setRegionsData] = useState([]);
    const [provincesData, setProvincesData] = useState([]);
    const [municipalitiesData, setMunicipalitiesData] = useState([]);
    const [barangaysData, setBarangaysData] = useState([]);

    console.log("employeeDataAdressForm", employeeData);

    // Employee API query
    const {
      data: employeesData,
      isLoading: employeesLoading,
      error: employeesError,
      refetch: refetchEmployees,
    } = useGetEmployeesQuery();

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
      if (mode === "edit" && (selectedAddress || selectedEmployeeId)) {
        triggerRegions();
        triggerProvinces();
        triggerMunicipalities();
        triggerBarangays();
      }
    }, [
      mode,
      selectedAddress,
      selectedEmployeeId,
      triggerRegions,
      triggerProvinces,
      triggerMunicipalities,
      triggerBarangays,
    ]);
    // Update state when API data changes
    useEffect(() => {
      if (regionsApiData) {
        setRegionsData(regionsApiData);
      }
    }, [regionsApiData]);

    useEffect(() => {
      if (provincesApiData) {
        setProvincesData(provincesApiData);
      }
    }, [provincesApiData]);

    useEffect(() => {
      if (municipalitiesApiData) {
        setMunicipalitiesData(municipalitiesApiData);
      }
    }, [municipalitiesApiData]);

    useEffect(() => {
      if (barangaysApiData) {
        setBarangaysData(barangaysApiData);
      }
    }, [barangaysApiData]);

    const extractEmployeeAddressData = useCallback((employeeData) => {
      if (!employeeData || !employeeData.address) return null;

      const address = employeeData.address;

      return {
        street: address.street || "",
        zip_code: address.zip_code || "",
        address_remarks: address.remarks || "",
        barangay_id: address.barangay?.id ? String(address.barangay.id) : "",
        barangay_display: address.barangay?.name || "",
        city_municipality_id: address.city_municipality?.id
          ? String(address.city_municipality.id)
          : "",
        city_municipality_display: address.city_municipality?.name || "",
        sub_municipality_id: address.sub_municipality?.id
          ? String(address.sub_municipality.id)
          : "",
        province_id: address.province?.id ? String(address.province.id) : "",
        province_display: address.province?.name || "",
        region_id: address.region?.id ? String(address.region.id) : "",
        region_display: address.region?.name || "",
      };
    }, []);

    const selectedEmployee = useMemo(() => {
      if (!selectedEmployeeId || !employeesData?.result?.data) return null;

      const employeesList = employeesData.result.data;
      const employee = employeesList.find(
        (emp) => emp.id === selectedEmployeeId
      );

      return employee || null;
    }, [selectedEmployeeId, employeesData]);

    const handleRegionDropdownClick = () => {
      if (regionsData.length === 0 && !regionsLoading) {
        triggerRegions();
      }
    };

    const handleProvinceDropdownClick = () => {
      if (provincesData.length === 0 && !provincesLoading) {
        triggerProvinces();
      }
    };

    const handleMunicipalityDropdownClick = () => {
      if (municipalitiesData.length === 0 && !municipalitiesLoading) {
        triggerMunicipalities();
      }
    };

    const handleBarangayDropdownClick = () => {
      if (barangaysData.length === 0 && !barangaysLoading) {
        triggerBarangays();
      }
    };

    const regions = useMemo(() => normalizeApiData(regionsData), [regionsData]);
    const provinces = useMemo(
      () => normalizeApiData(provincesData),
      [provincesData]
    );
    const municipalities = useMemo(
      () => normalizeApiData(municipalitiesData),
      [municipalitiesData]
    );
    const barangays = useMemo(
      () => normalizeApiData(barangaysData),
      [barangaysData]
    );

    const filteredProvinces = useMemo(
      () => getFilteredProvinces(provinces, form.region_id),
      [provinces, form.region_id]
    );
    const filteredCityMunicipalities = useMemo(
      () =>
        getFilteredCityMunicipalities(
          municipalities,
          form.region_id,
          form.province_id
        ),
      [municipalities, form.region_id, form.province_id]
    );
    const filteredBarangays = useMemo(
      () => getFilteredBarangays(barangays, form.city_municipality_id),
      [barangays, form.city_municipality_id]
    );

    const extractFieldValue = (data, fieldPaths) => {
      if (!data) return "";

      for (const path of fieldPaths) {
        const keys = path.split(".");
        let value = data;

        for (const key of keys) {
          if (value && typeof value === "object" && value.hasOwnProperty(key)) {
            value = value[key];
          } else {
            value = null;
            break;
          }
        }

        if (value !== null && value !== undefined && value !== "") {
          return String(value);
        }
      }

      return "";
    };

    const extractAddressData = useCallback((selectedAddress) => {
      if (!selectedAddress) return null;

      try {
        const addressData =
          selectedAddress.address_info ||
          selectedAddress.address ||
          selectedAddress.address_data ||
          selectedAddress.addresses?.[0] ||
          selectedAddress;

        let regionValue = "";
        const regionData = addressData.region;
        if (regionData) {
          if (typeof regionData === "object" && regionData.id) {
            regionValue = regionData.id;
          } else if (
            typeof regionData === "string" ||
            typeof regionData === "number"
          ) {
            regionValue = regionData;
          }
        }
        if (!regionValue) {
          regionValue = extractFieldValue(addressData, [
            "region_id",
            "region_code",
          ]);
        }

        let provinceValue = "";
        const provinceData = addressData.province;
        if (provinceData) {
          if (typeof provinceData === "object" && provinceData.id) {
            provinceValue = provinceData.id;
          } else if (
            typeof provinceData === "string" ||
            typeof provinceData === "number"
          ) {
            provinceValue = provinceData;
          }
        }
        if (!provinceValue) {
          provinceValue = extractFieldValue(addressData, [
            "province_id",
            "province_code",
          ]);
        }

        let cityMunicipalityValue = "";
        const cityMunicipalityData =
          addressData.city_municipality ||
          addressData.municipality ||
          addressData.city;
        if (cityMunicipalityData) {
          if (
            typeof cityMunicipalityData === "object" &&
            cityMunicipalityData.id
          ) {
            cityMunicipalityValue = cityMunicipalityData.id;
          } else if (
            typeof cityMunicipalityData === "string" ||
            typeof cityMunicipalityData === "number"
          ) {
            cityMunicipalityValue = cityMunicipalityData;
          }
        }
        if (!cityMunicipalityValue) {
          cityMunicipalityValue = extractFieldValue(addressData, [
            "city_municipality_id",
            "municipality_id",
            "city_id",
            "city_municipality_code",
          ]);
        }

        let barangayValue = "";
        const barangayData = addressData.barangay;
        if (barangayData) {
          if (typeof barangayData === "object" && barangayData.id) {
            barangayValue = barangayData.id;
          } else if (
            typeof barangayData === "string" ||
            typeof barangayData === "number"
          ) {
            barangayValue = barangayData;
          }
        }
        if (!barangayValue) {
          barangayValue = extractFieldValue(addressData, [
            "barangay_id",
            "brgy_id",
            "barangay_code",
          ]);
        }

        const extractedData = {
          street: extractFieldValue(addressData, [
            "street",
            "street_address",
            "address_line_1",
            "line1",
            "address_line1",
          ]),
          zip_code: extractFieldValue(addressData, [
            "zip_code",
            "zipcode",
            "postal_code",
            "zip",
            "postcode",
          ]),
          address_remarks: extractFieldValue(addressData, [
            "address_remarks",
            "remarks",
            "notes",
            "comment",
            "description",
            "note",
          ]),
          barangay_id: barangayValue,
          barangay_display: addressData.barangay?.name || "",
          city_municipality_id: cityMunicipalityValue,
          city_municipality_display:
            addressData.city_municipality?.name ||
            addressData.municipality?.name ||
            addressData.city?.name ||
            "",
          sub_municipality_id: extractFieldValue(addressData, [
            "sub_municipality.id",
            "sub_municipality_id",
            "sub_municipality_code",
          ]),
          province_id: provinceValue,
          province_display: addressData.province?.name || "",
          region_id: regionValue,
          region_display: addressData.region?.name || "",
        };

        return extractedData;
      } catch (error) {
        console.error("Error extracting address data:", error);
        return null;
      }
    }, []);

    const getDisplayName = (id, dataArray, fieldName) => {
      if (!id) return "";

      if (dataArray && dataArray.length > 0) {
        const item = dataArray.find((item) => item.id == id);
        return item ? item.name : `Loading ${fieldName}...`;
      }

      return `Loading ${fieldName}...`;
    };

    const processAddressData = useCallback(
      (addressData) => {
        if (!addressData) {
          const emptyForm = {
            ...INITIAL_FORM_STATE,
            region_display: "",
            province_display: "",
            city_municipality_display: "",
            barangay_display: "",
          };
          setForm(emptyForm);
          setInitialForm({ ...emptyForm });
          setErrors({});
          setErrorMessage(null);
          setHasUnsavedChanges(false);
          setIsInitialized(true);
          return;
        }

        const extractedData = extractAddressData(addressData);
        if (!extractedData) return;

        setForm((prevForm) => ({
          ...prevForm,
          ...extractedData,
        }));
        setInitialForm({ ...extractedData });
        setErrorMessage(null);
        setErrors({});
        setHasUnsavedChanges(false);
        setIsInitialized(true);
      },
      [extractAddressData]
    );
    useEffect(() => {
      if (mode === "edit" && employeeData?.address && !isProcessingAddress) {
        setIsProcessingAddress(true);

        const employeeAddressData = {
          street: employeeData.address.street || "",
          zip_code: employeeData.address.zip_code || "",
          address_remarks: employeeData.address.remarks || "",
          barangay_id: employeeData.address.barangay?.id
            ? String(employeeData.address.barangay.id)
            : "",
          barangay_display: employeeData.address.barangay?.name || "",
          city_municipality_id: employeeData.address.city_municipality?.id
            ? String(employeeData.address.city_municipality.id)
            : "",
          city_municipality_display:
            employeeData.address.city_municipality?.name || "",
          sub_municipality_id: employeeData.address.sub_municipality?.id
            ? String(employeeData.address.sub_municipality.id)
            : "",
          province_id: employeeData.address.province?.id
            ? String(employeeData.address.province.id)
            : "",
          province_display: employeeData.address.province?.name || "",
          region_id: employeeData.address.region?.id
            ? String(employeeData.address.region.id)
            : "",
          region_display: employeeData.address.region?.name || "",
        };

        setForm(employeeAddressData);
        setInitialForm({ ...employeeAddressData });
        setErrorMessage(null);
        setErrors({});
        setHasUnsavedChanges(false);
        setIsInitialized(true);

        setTimeout(() => setIsProcessingAddress(false), 100);
      }
    }, [mode, employeeData, isProcessingAddress]);
    useEffect(() => {
      if (selectedEmployee && !isProcessingAddress) {
        const employeeAddressData =
          extractEmployeeAddressData(selectedEmployee);
        if (employeeAddressData) {
          setIsProcessingAddress(true);

          const completeAddressData = {
            ...employeeAddressData,

            region_display:
              employeeAddressData.region_display ||
              selectedEmployee.address?.region?.name ||
              "",
            province_display:
              employeeAddressData.province_display ||
              selectedEmployee.address?.province?.name ||
              "",
            city_municipality_display:
              employeeAddressData.city_municipality_display ||
              selectedEmployee.address?.city_municipality?.name ||
              "",
            barangay_display:
              employeeAddressData.barangay_display ||
              selectedEmployee.address?.barangay?.name ||
              "",
          };

          setForm(completeAddressData);
          setInitialForm({ ...completeAddressData });
          setErrorMessage(null);
          setErrors({});
          setHasUnsavedChanges(false);
          setIsInitialized(true);
          setTimeout(() => setIsProcessingAddress(false), 100);
        }
      }
    }, [selectedEmployee, extractEmployeeAddressData, isProcessingAddress]);

    useEffect(() => {
      if (!isProcessingAddress && selectedAddress && !selectedEmployeeId) {
        processAddressData(selectedAddress);
      }
    }, [
      selectedAddress,
      processAddressData,
      isProcessingAddress,
      selectedEmployeeId,
    ]);

    useEffect(() => {
      if (onValidationChange && isInitialized) {
        const isValid = isFormValid(form);
        onValidationChange(isValid, hasUnsavedChanges);
      }
    }, [form, onValidationChange, hasUnsavedChanges, isInitialized]);

    useEffect(() => {
      if (onFormChange && isInitialized) {
        onFormChange(form, hasUnsavedChanges);
      }
    }, [form, hasUnsavedChanges, onFormChange, isInitialized]);

    const handleDropdownChange = (name, value, displayName) => {
      console.log({ name, value, displayName });
      setForm((prev) => {
        const newForm = {
          ...prev,
          [name]: value,
          [`${name.replace("_id", "_display")}`]: displayName || "",
        };

        if (name === "region_id") {
          newForm.province_id = "";
          newForm.province_display = "";
          newForm.city_municipality_id = "";
          newForm.city_municipality_display = "";
          newForm.sub_municipality_id = "";
          newForm.barangay_id = "";
          newForm.barangay_display = "";
        } else if (name === "province_id") {
          newForm.city_municipality_id = "";
          newForm.city_municipality_display = "";
          newForm.sub_municipality_id = "";
          newForm.barangay_id = "";
          newForm.barangay_display = "";
        } else if (name === "city_municipality_id") {
          newForm.sub_municipality_id = "";
          newForm.barangay_id = "";
          newForm.barangay_display = "";
        }

        return newForm;
      });

      if (!isProcessingAddress) {
        setHasUnsavedChanges(true);
      }
    };

    const handleChange = (e) => {
      const { name, value } = e.target;
      const newForm = handleFieldChange(name, value, form);
      setForm(newForm);

      if (!isProcessingAddress) {
        setHasUnsavedChanges(true);
      }

      if (errors[name]) {
        setErrors((prev) => ({ ...prev, [name]: false }));
      }
      if (errorMessage) {
        setErrorMessage(null);
      }
    };

    const performValidation = () => {
      const validation = validateForm(form);
      setErrors(validation.errors);
      setErrorMessage(validation.errorMessage);
      return validation.isValid;
    };

    const getFormData = () => {
      const data = getEnhancedFormData(
        form,
        regions,
        provinces,
        municipalities,
        barangays
      );
      return {
        ...data,
        region_name:
          form.region_display ||
          getDisplayName(form.region_id, regions, "region"),
        province_name:
          form.province_display ||
          getDisplayName(form.province_id, provinces, "province"),
        city_municipality_name:
          form.city_municipality_display ||
          getDisplayName(
            form.city_municipality_id,
            municipalities,
            "city/municipality"
          ),
        barangay_name:
          form.barangay_display ||
          getDisplayName(form.barangay_id, barangays, "barangay"),
      };
    };

    useImperativeHandle(ref, () => ({
      validateAndGetData: () => {
        if (performValidation()) {
          return getFormData();
        }
        return null;
      },
      validate: performValidation,
      isValid: () => isFormValid(form),
      getData: getFormData,
      getFormData: getFormData,
      setFormData: (data) => {
        if (!data) return;

        setIsProcessingAddress(true);
        const newForm = {
          street: String(data.street || ""),
          zip_code: String(data.zip_code || ""),
          address_remarks: String(data.address_remarks || ""),
          barangay_id: String(data.barangay_id || ""),
          barangay_display: String(data.barangay_display || ""),
          city_municipality_id: String(data.city_municipality_id || ""),
          city_municipality_display: String(
            data.city_municipality_display || ""
          ),
          sub_municipality_id: String(data.sub_municipality_id || ""),
          province_id: String(data.province_id || ""),
          province_display: String(data.province_display || ""),
          region_id: String(data.region_id || ""),
          region_display: String(data.region_display || ""),
        };

        setForm(newForm);
        setInitialForm({ ...newForm });
        setHasUnsavedChanges(false);
        setIsInitialized(true);
        setErrors({});
        setErrorMessage(null);
        setTimeout(() => setIsProcessingAddress(false), 100);
      },
      resetForm: () => {
        setIsProcessingAddress(true);
        const emptyForm = {
          ...INITIAL_FORM_STATE,
          region_display: "",
          province_display: "",
          city_municipality_display: "",
          barangay_display: "",
        };
        setForm(emptyForm);
        setInitialForm({ ...emptyForm });
        setErrors({});
        setErrorMessage(null);
        setHasUnsavedChanges(false);
        setIsInitialized(true);
        setTimeout(() => setIsProcessingAddress(false), 100);
      },
      validateForm: performValidation,
      setErrors,
      setErrorMessage,
      hasUnsavedChanges,
      discardChanges: () => {
        setForm({ ...initialForm });
        setErrors({});
        setErrorMessage(null);
        setHasUnsavedChanges(false);
      },
      isDirty: () => hasUnsavedChanges,
      isInitialized: () => isInitialized,
      refetchData: () => {
        triggerRegions();
        triggerProvinces();
        triggerMunicipalities();
        triggerBarangays();
        refetchEmployees();
      },
      forceInitialize: (addressData) => {
        setIsProcessingAddress(true);
        if (addressData) {
          processAddressData(addressData);
        } else {
          const emptyForm = {
            ...INITIAL_FORM_STATE,
            region_display: "",
            province_display: "",
            city_municipality_display: "",
            barangay_display: "",
          };
          setForm(emptyForm);
          setInitialForm({ ...emptyForm });
          setErrors({});
          setErrorMessage(null);
          setHasUnsavedChanges(false);
          setIsInitialized(true);
        }
        setTimeout(() => setIsProcessingAddress(false), 100);
      },
      getCurrentFormState: () => form,
      setEmployeeAddress: (employeeId) => {
        if (employeesData?.result?.data) {
          const employee = employeesData.result.data.find(
            (emp) => emp.id === employeeId
          );

          if (employee) {
            const employeeAddressData = extractEmployeeAddressData(employee);
            if (employeeAddressData) {
              setIsProcessingAddress(true);
              setForm((prevForm) => ({
                ...prevForm,
                ...employeeAddressData,
              }));
              setInitialForm({ ...employeeAddressData });
              setErrorMessage(null);
              setErrors({});
              setHasUnsavedChanges(false);
              setIsInitialized(true);
              setTimeout(() => setIsProcessingAddress(false), 100);
            }
          }
        }
      },
    }));

    return (
      <Box className="general-form">
        {errorMessage && (
          <Alert
            severity="error"
            className="general-form__alert"
            sx={{ mb: 2 }}>
            {errorMessage}
          </Alert>
        )}

        {(regionsError ||
          provincesError ||
          municipalitiesError ||
          barangaysError ||
          employeesError) && (
          <Alert
            severity="warning"
            className="general-form__alert"
            sx={{ mb: 2 }}>
            Failed to load data from server.
          </Alert>
        )}

        {employeesLoading && (
          <Alert severity="info" className="general-form__alert" sx={{ mb: 2 }}>
            Loading employee data...
          </Alert>
        )}

        <Grid container spacing={2} className="general-form__grid">
          <Grid item xs={3} className="general-form__grid-item">
            <FormControl
              fullWidth
              variant="outlined"
              error={!!errors.region_id}
              disabled={isLoading}
              className="general-form__select">
              <InputLabel id="region-label">
                Region <span style={{ color: "red" }}>*</span>
              </InputLabel>
              <Select
                labelId="region-label"
                name="region_id"
                value={form.region_id || employeeData?.address?.region?.id}
                onChange={(e) => {
                  const selectedRegion = regions.find(
                    (r) => r.id === e.target.value
                  );
                  handleDropdownChange(
                    "region_id",
                    e.target.value,
                    selectedRegion?.name || ""
                  );
                }}
                onOpen={handleRegionDropdownClick}
                label="Region *"
                renderValue={(selected) => {
                  if (regionsLoading && regions.length === 0)
                    return "Loading...";
                  if (!selected) return "";

                  if (form.region_display) {
                    return form.region_display;
                  }

                  const selectedRegion = regions.find((r) => r.id == selected);
                  return selectedRegion
                    ? selectedRegion.name
                    : employeeData?.address
                    ? employeeData?.address?.region?.name
                    : "Loading region...";
                }}>
                <MenuItem value="">
                  <em>Select Region</em>
                </MenuItem>
                {regionsLoading && regions.length === 0 ? (
                  <MenuItem disabled>
                    <CircularProgress size={16} sx={{ mr: 1 }} /> Loading
                    regions...
                  </MenuItem>
                ) : (
                  regions.map((region) => (
                    <MenuItem key={region.id} value={region.id}>
                      {region.name}
                    </MenuItem>
                  ))
                )}
              </Select>
              {errors.region_id && (
                <div className="form-error">{errors.region_id}</div>
              )}
            </FormControl>
          </Grid>

          <Grid item xs={3} className="general-form__grid-item">
            <FormControl
              fullWidth
              variant="outlined"
              className="general-form__select">
              <InputLabel>Province (Leave blank if none)</InputLabel>
              <Select
                name="province_id"
                value={form.province_id || employeeData?.address?.province?.id}
                onChange={(e) => {
                  const selectedProvince = filteredProvinces.find(
                    (p) => p.id === e.target.value
                  );
                  handleDropdownChange(
                    "province_id",
                    e.target.value,
                    selectedProvince?.name || ""
                  );
                }}
                onOpen={handleProvinceDropdownClick}
                label="Province (Leave blank if none)"
                renderValue={(selected) => {
                  if (provincesLoading && provinces.length === 0)
                    return "Loading...";
                  if (!selected) return "";

                  if (form.province_display) {
                    return form.province_display;
                  }

                  const selectedProvince = filteredProvinces.find(
                    (p) => p.id == selected
                  );
                  return selectedProvince
                    ? selectedProvince.name
                    : employeeData?.address
                    ? employeeData?.address?.province?.name
                    : "Loading province...";
                }}>
                <MenuItem value="">
                  <em>No Province / Independent City</em>
                </MenuItem>
                {provincesLoading && provinces.length === 0 ? (
                  <MenuItem disabled>
                    <CircularProgress size={16} sx={{ mr: 1 }} /> Loading
                    provinces...
                  </MenuItem>
                ) : (
                  filteredProvinces.map((province) => (
                    <MenuItem key={province.id} value={province.id}>
                      {province.name}
                    </MenuItem>
                  ))
                )}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={3} className="general-form__grid-item">
            <FormControl
              fullWidth
              variant="outlined"
              error={!!errors.city_municipality_id}
              className="general-form__select">
              <InputLabel>
                City/Municipality <span style={{ color: "red" }}>*</span>
              </InputLabel>
              <Select
                name="city_municipality_id"
                value={
                  form.city_municipality_id ||
                  employeeData?.address?.city_municipality?.id
                }
                onChange={(e) => {
                  const selectedMunicipality = filteredCityMunicipalities.find(
                    (m) => m.id === e.target.value
                  );
                  handleDropdownChange(
                    "city_municipality_id",
                    e.target.value,
                    selectedMunicipality?.name || ""
                  );
                }}
                onOpen={handleMunicipalityDropdownClick}
                label="City/Municipality *"
                renderValue={(selected) => {
                  if (municipalitiesLoading && municipalities.length === 0)
                    return "Loading...";
                  if (!selected) return "";

                  if (form.city_municipality_display) {
                    return form.city_municipality_display;
                  }

                  const selectedMunicipality = filteredCityMunicipalities.find(
                    (m) => m.id == selected
                  );
                  return selectedMunicipality
                    ? selectedMunicipality.name
                    : employeeData?.address
                    ? employeeData?.address?.city_municipality?.name
                    : "Loading city/municipality...";
                }}>
                <MenuItem value="">
                  <em>Select City/Municipality</em>
                </MenuItem>
                {municipalitiesLoading && municipalities.length === 0 ? (
                  <MenuItem disabled>
                    <CircularProgress size={16} sx={{ mr: 1 }} /> Loading
                    cities/municipalities...
                  </MenuItem>
                ) : (
                  filteredCityMunicipalities.map((municipality) => (
                    <MenuItem key={municipality.id} value={municipality.id}>
                      {municipality.name}
                    </MenuItem>
                  ))
                )}
              </Select>
              {errors.city_municipality_id && (
                <div className="form-error">{errors.city_municipality_id}</div>
              )}
            </FormControl>
          </Grid>

          <Grid item xs={3} className="general-form__grid-item">
            <FormControl
              fullWidth
              variant="outlined"
              error={!!errors.barangay_id}
              className="general-form__select">
              <InputLabel>
                Barangay <span style={{ color: "red" }}>*</span>
              </InputLabel>
              <Select
                name="barangay_id"
                value={form.barangay_id || employeeData?.address?.barangay?.id}
                onChange={(e) => {
                  const selectedBarangay = filteredBarangays.find(
                    (b) => b.id === e.target.value
                  );
                  handleDropdownChange(
                    "barangay_id",
                    e.target.value,
                    selectedBarangay?.name || ""
                  );
                }}
                onOpen={handleBarangayDropdownClick}
                label="Barangay *"
                renderValue={(selected) => {
                  if (barangaysLoading && barangays.length === 0)
                    return "Loading...";
                  if (!selected) return "";

                  if (form.barangay_display) {
                    return form.barangay_display;
                  }

                  const selectedBarangay = filteredBarangays.find(
                    (b) => b.id == selected
                  );
                  return selectedBarangay
                    ? selectedBarangay.name
                    : employeeData?.address
                    ? employeeData?.address?.barangay?.name
                    : "Loading barangay...";
                }}>
                <MenuItem value="">
                  <em>Select Barangay</em>
                </MenuItem>
                {barangaysLoading && barangays.length === 0 ? (
                  <MenuItem disabled>
                    <CircularProgress size={16} sx={{ mr: 1 }} /> Loading
                    barangays...
                  </MenuItem>
                ) : (
                  filteredBarangays.map((barangay) => (
                    <MenuItem key={barangay.id} value={barangay.id}>
                      {barangay.name}
                    </MenuItem>
                  ))
                )}
              </Select>
              {errors.barangay_id && (
                <div className="form-error">{errors.barangay_id}</div>
              )}
            </FormControl>
          </Grid>

          <Grid item xs={8} className="general-form__grid-item">
            <TextField
              fullWidth
              label="Street Address"
              name="street"
              value={form.street || employeeData?.address?.street || ""}
              onChange={handleChange}
              variant="outlined"
              error={!!errors.street}
              helperText={errors.street}
              className="general-form__text-field"
            />
          </Grid>

          <Grid item xs={4} className="general-form__grid-item">
            <TextField
              fullWidth
              label="ZIP Code"
              name="zip_code"
              value={form.zip_code || employeeData?.address?.zip_code || ""}
              onChange={handleChange}
              variant="outlined"
              error={!!errors.zip_code}
              helperText={errors.zip_code}
              className="general-form__text-field"
            />
          </Grid>

          <Grid item xs={12} className="general-form__grid-item">
            <TextField
              fullWidth
              label="Address Remarks"
              name="address_remarks"
              value={
                form.address_remarks ||
                employeeData?.address?.address_remarks ||
                ""
              }
              onChange={handleChange}
              variant="outlined"
              multiline
              rows={2}
              error={!!errors.address_remarks}
              helperText={errors.address_remarks}
              className="general-form__text-field"
            />
          </Grid>
        </Grid>
      </Box>
    );
  }
);

AddressForm.displayName = "AddressForm";

export default AddressForm;
