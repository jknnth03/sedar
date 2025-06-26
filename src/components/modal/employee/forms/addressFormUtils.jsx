export const INITIAL_FORM_STATE = {
  street: "",
  zip_code: "",
  address_remarks: "",
  barangay_id: "",
  city_municipality_id: "",
  sub_municipality_id: "",
  province_id: "",
  region_id: "",
};

export const REQUIRED_FIELDS = [
  "street",
  "zip_code",
  "barangay_id",
  "city_municipality_id",
  "region_id",
];

export const normalizeApiData = (data) => {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (data.result && Array.isArray(data.result)) return data.result;
  if (data.data && Array.isArray(data.data)) return data.data;
  return [];
};

export const extractFieldValue = (data, fieldPaths) => {
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
      return value;
    }
  }

  return "";
};

// Enhanced extractAddressData function with improved data extraction logic
export const extractAddressData = (selectedAddress) => {
  if (!selectedAddress) return null;

  try {
    // First, try to get the address data from various possible nested structures
    const addressData =
      selectedAddress.address_info ||
      selectedAddress.address ||
      selectedAddress.address_data ||
      selectedAddress.addresses?.[0] ||
      selectedAddress;

    // Helper function to safely extract and preserve data type
    const safeExtract = (data, paths, shouldConvertToString = false) => {
      if (!data) return shouldConvertToString ? "" : "";

      for (const path of paths) {
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
          // For ID fields, preserve the original type (number or string)
          // For text fields, convert to string
          if (shouldConvertToString) {
            return String(value);
          }
          return value;
        }
      }

      return shouldConvertToString ? "" : "";
    };

    // Extract region ID - try object structure first, then direct ID
    let regionValue = "";
    const regionData = addressData.region;
    if (regionData) {
      if (typeof regionData === "object" && regionData.id !== undefined) {
        regionValue = regionData.id;
      } else if (
        typeof regionData === "string" ||
        typeof regionData === "number"
      ) {
        regionValue = regionData;
      }
    }
    if (!regionValue && regionValue !== 0) {
      regionValue = safeExtract(addressData, ["region_id", "region_code"]);
    }

    // Extract province ID - try object structure first, then direct ID
    let provinceValue = "";
    const provinceData = addressData.province;
    if (provinceData) {
      if (typeof provinceData === "object" && provinceData.id !== undefined) {
        provinceValue = provinceData.id;
      } else if (
        typeof provinceData === "string" ||
        typeof provinceData === "number"
      ) {
        provinceValue = provinceData;
      }
    }
    if (!provinceValue && provinceValue !== 0) {
      provinceValue = safeExtract(addressData, [
        "province_id",
        "province_code",
      ]);
    }

    // Extract city/municipality ID - try object structure first, then direct ID
    let cityMunicipalityValue = "";
    const cityMunicipalityData =
      addressData.city_municipality ||
      addressData.municipality ||
      addressData.city;
    if (cityMunicipalityData) {
      if (
        typeof cityMunicipalityData === "object" &&
        cityMunicipalityData.id !== undefined
      ) {
        cityMunicipalityValue = cityMunicipalityData.id;
      } else if (
        typeof cityMunicipalityData === "string" ||
        typeof cityMunicipalityData === "number"
      ) {
        cityMunicipalityValue = cityMunicipalityData;
      }
    }
    if (!cityMunicipalityValue && cityMunicipalityValue !== 0) {
      cityMunicipalityValue = safeExtract(addressData, [
        "city_municipality_id",
        "municipality_id",
        "city_id",
        "city_municipality_code",
      ]);
    }

    // Extract barangay ID - try object structure first, then direct ID
    let barangayValue = "";
    const barangayData = addressData.barangay;
    if (barangayData) {
      if (typeof barangayData === "object" && barangayData.id !== undefined) {
        barangayValue = barangayData.id;
      } else if (
        typeof barangayData === "string" ||
        typeof barangayData === "number"
      ) {
        barangayValue = barangayData;
      }
    }
    if (!barangayValue && barangayValue !== 0) {
      barangayValue = safeExtract(addressData, [
        "barangay_id",
        "brgy_id",
        "barangay_code",
      ]);
    }

    // Extract sub-municipality ID
    let subMunicipalityValue = "";
    const subMunicipalityData = addressData.sub_municipality;
    if (subMunicipalityData) {
      if (
        typeof subMunicipalityData === "object" &&
        subMunicipalityData.id !== undefined
      ) {
        subMunicipalityValue = subMunicipalityData.id;
      } else if (
        typeof subMunicipalityData === "string" ||
        typeof subMunicipalityData === "number"
      ) {
        subMunicipalityValue = subMunicipalityData;
      }
    }
    if (!subMunicipalityValue && subMunicipalityValue !== 0) {
      subMunicipalityValue = safeExtract(addressData, [
        "sub_municipality.id",
        "sub_municipality_id",
        "sub_municipality_code",
      ]);
    }

    const extractedData = {
      street: safeExtract(
        addressData,
        [
          "street",
          "street_address",
          "address_line_1",
          "line1",
          "address_line1",
        ],
        true
      ),
      zip_code: safeExtract(
        addressData,
        ["zip_code", "zipcode", "postal_code", "zip", "postcode"],
        true
      ),
      address_remarks: safeExtract(
        addressData,
        [
          "address_remarks",
          "remarks",
          "notes",
          "comment",
          "description",
          "note",
        ],
        true
      ),
      // Keep IDs in their original format (preserve numbers) then convert to string
      barangay_id:
        barangayValue === null || barangayValue === undefined
          ? ""
          : String(barangayValue),
      city_municipality_id:
        cityMunicipalityValue === null || cityMunicipalityValue === undefined
          ? ""
          : String(cityMunicipalityValue),
      sub_municipality_id:
        subMunicipalityValue === null || subMunicipalityValue === undefined
          ? ""
          : String(subMunicipalityValue),
      province_id:
        provinceValue === null || provinceValue === undefined
          ? ""
          : String(provinceValue),
      region_id:
        regionValue === null || regionValue === undefined
          ? ""
          : String(regionValue),
    };

    console.log("Extracted address data:", extractedData);
    return extractedData;
  } catch (error) {
    console.error("Error extracting address data:", error);
    return null;
  }
};

export const getFilteredProvinces = (
  provinces,
  regionId,
  currentProvinceId = null
) => {
  if (!provinces.length) return [];

  // If no regionId is provided, return empty array
  if (!regionId) return [];

  const filtered = provinces.filter(
    (province) => province.region_id === parseInt(regionId)
  );

  // If we have a current province ID and it's not in the filtered results,
  // include it so the form can display the selected value
  if (
    currentProvinceId &&
    !filtered.find((p) => p.id === parseInt(currentProvinceId))
  ) {
    const currentProvince = provinces.find(
      (p) => p.id === parseInt(currentProvinceId)
    );
    if (currentProvince) {
      return [currentProvince, ...filtered];
    }
  }

  return filtered;
};

export const getFilteredCityMunicipalities = (
  municipalities,
  regionId,
  provinceId,
  currentCityMunicipalityId = null
) => {
  if (!municipalities.length || !regionId) return [];

  let filtered = [];
  if (provinceId && provinceId !== "") {
    filtered = municipalities.filter(
      (municipality) => municipality.province_id === parseInt(provinceId)
    );
  } else {
    filtered = municipalities.filter(
      (municipality) => municipality.region_id === parseInt(regionId)
    );
  }

  // If we have a current city/municipality ID and it's not in the filtered results,
  // include it so the form can display the selected value
  if (
    currentCityMunicipalityId &&
    !filtered.find((m) => m.id === parseInt(currentCityMunicipalityId))
  ) {
    const currentMunicipality = municipalities.find(
      (m) => m.id === parseInt(currentCityMunicipalityId)
    );
    if (currentMunicipality) {
      return [currentMunicipality, ...filtered];
    }
  }

  return filtered;
};

export const getFilteredBarangays = (
  barangays,
  cityMunicipalityId,
  currentBarangayId = null
) => {
  if (!barangays.length || !cityMunicipalityId) return [];

  const filtered = barangays.filter(
    (barangay) => barangay.city_municipality_id === parseInt(cityMunicipalityId)
  );

  // If we have a current barangay ID and it's not in the filtered results,
  // include it so the form can display the selected value
  if (
    currentBarangayId &&
    !filtered.find((b) => b.id === parseInt(currentBarangayId))
  ) {
    const currentBarangay = barangays.find(
      (b) => b.id === parseInt(currentBarangayId)
    );
    if (currentBarangay) {
      return [currentBarangay, ...filtered];
    }
  }

  return filtered;
};

export const validateForm = (form) => {
  const newErrors = {};

  REQUIRED_FIELDS.forEach((field) => {
    if (!form[field] || form[field].toString().trim() === "") {
      newErrors[field] = "This field is required";
    }
  });

  return {
    errors: newErrors,
    isValid: Object.keys(newErrors).length === 0,
    errorMessage:
      Object.keys(newErrors).length > 0
        ? "Please correct the highlighted fields"
        : null,
  };
};

export const isFormValid = (form) => {
  return REQUIRED_FIELDS.every((field) => {
    return form[field] && form[field].toString().trim() !== "";
  });
};

export const prepareFormDataForBackend = (formData) => {
  const backendData = { ...formData };

  if (
    backendData.province_id === "" ||
    backendData.province_id === null ||
    backendData.province_id === undefined
  ) {
    backendData.province_id = null;
  } else {
    backendData.province_id = parseInt(backendData.province_id);
  }

  if (
    backendData.sub_municipality_id === "" ||
    backendData.sub_municipality_id === null ||
    backendData.sub_municipality_id === undefined
  ) {
    backendData.sub_municipality_id = null;
  } else if (backendData.sub_municipality_id) {
    backendData.sub_municipality_id = parseInt(backendData.sub_municipality_id);
  }

  if (backendData.region_id) {
    backendData.region_id = parseInt(backendData.region_id);
  }
  if (backendData.city_municipality_id) {
    backendData.city_municipality_id = parseInt(
      backendData.city_municipality_id
    );
  }
  if (backendData.barangay_id) {
    backendData.barangay_id = parseInt(backendData.barangay_id);
  }

  return backendData;
};

export const getEnhancedFormData = (
  form,
  regions,
  provinces,
  municipalities,
  barangays
) => {
  const selectedRegion = regions.find((r) => r.id == form.region_id);
  const selectedProvince = provinces.find((p) => p.id == form.province_id);
  const selectedMunicipality = municipalities.find(
    (m) => m.id == form.city_municipality_id
  );
  const selectedBarangay = barangays.find((b) => b.id == form.barangay_id);

  return {
    ...prepareFormDataForBackend(form),
    region_name: selectedRegion?.name || "",
    province_name: selectedProvince?.name || "",
    city_municipality_name: selectedMunicipality?.name || "",
    barangay_name: selectedBarangay?.name || "",
    full_address: generateFullAddress(
      form,
      selectedRegion,
      selectedProvince,
      selectedMunicipality,
      selectedBarangay
    ),
  };
};

export const generateFullAddress = (
  form,
  selectedRegion,
  selectedProvince,
  selectedMunicipality,
  selectedBarangay
) => {
  const parts = [];
  if (form.street) parts.push(form.street);
  if (selectedBarangay) parts.push(selectedBarangay.name);
  if (selectedMunicipality) parts.push(selectedMunicipality.name);
  if (selectedProvince) parts.push(selectedProvince.name);
  if (selectedRegion) parts.push(selectedRegion.name);
  if (form.zip_code) parts.push(form.zip_code);
  return parts.join(", ");
};

// Helper function to initialize modal with preserved data
export const initializeModalData = (
  selectedAddress,
  allRegions,
  allProvinces,
  allMunicipalities,
  allBarangays
) => {
  const extractedData = extractAddressData(selectedAddress);

  if (!extractedData) {
    return {
      formData: INITIAL_FORM_STATE,
      filteredData: {
        regions: allRegions,
        provinces: [],
        municipalities: [],
        barangays: [],
      },
    };
  }

  const filteredData = getInitialFilteredData(
    extractedData,
    allRegions,
    allProvinces,
    allMunicipalities,
    allBarangays
  );

  return {
    formData: extractedData,
    filteredData,
  };
};

export const getInitialFilteredData = (
  formData,
  regions,
  provinces,
  municipalities,
  barangays
) => {
  // Get filtered provinces with current selection preserved
  const filteredProvinces = getFilteredProvinces(
    provinces,
    formData.region_id,
    formData.province_id
  );

  // Get filtered municipalities with current selection preserved
  const filteredMunicipalities = getFilteredCityMunicipalities(
    municipalities,
    formData.region_id,
    formData.province_id,
    formData.city_municipality_id
  );

  // Get filtered barangays with current selection preserved
  const filteredBarangays = getFilteredBarangays(
    barangays,
    formData.city_municipality_id,
    formData.barangay_id
  );

  return {
    regions,
    provinces: filteredProvinces,
    municipalities: filteredMunicipalities,
    barangays: filteredBarangays,
  };
};

export const handleFieldChange = (name, value, currentForm) => {
  if (name === "region_id") {
    return {
      ...currentForm,
      [name]: value,
      province_id: "",
      city_municipality_id: "",
      sub_municipality_id: "",
      barangay_id: "",
    };
  } else if (name === "province_id") {
    return {
      ...currentForm,
      [name]: value,
      city_municipality_id: "",
      sub_municipality_id: "",
      barangay_id: "",
    };
  } else if (name === "city_municipality_id") {
    return {
      ...currentForm,
      [name]: value,
      sub_municipality_id: "",
      barangay_id: "",
    };
  } else if (name === "sub_municipality_id") {
    return {
      ...currentForm,
      [name]: value,
      barangay_id: "",
    };
  } else {
    return { ...currentForm, [name]: value };
  }
};
