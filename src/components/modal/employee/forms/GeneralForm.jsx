import React, {
  useEffect,
  useState,
  useMemo,
  forwardRef,
  useImperativeHandle,
} from "react";
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
} from "@mui/material";
import { useLazyGetAllShowReligionsQuery } from "../../../../features/api/extras/religionsApi";
import { useLazyGetAllShowPrefixesQuery } from "../../../../features/api/extras/prefixesApi";
import { useLazyGetAllGeneralsQuery } from "../../../../features/api/employee/generalApi";

const GeneralForm = forwardRef(
  (
    {
      selectedGeneral,
      isLoading = false,
      onValidationChange,
      mode = "create",
      showHeader = true,
      onFormChange = null,
      employeeData,
    },

    ref
  ) => {
    const [form, setForm] = useState({
      id_number: "",
      prefix: "",
      prefix_display: "",
      first_name: "",
      middle_name: "",
      last_name: "",
      suffix: "",
      birth_date: "",
      civil_status: "",
      religion: "",
      religion_display: "",
      gender: "",
      referrer_id: "",
      referrer_display: "",
      remarks: "",
    });
    console.log("employeeeeDATA_general", employeeData);
    const [errors, setErrors] = useState({});
    const [errorMessage, setErrorMessage] = useState(null);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);
    const [dropdownsLoaded, setDropdownsLoaded] = useState({
      religions: false,
      prefixes: false,
      referrers: false,
    });

    const [
      triggerReligions,
      {
        data: religionsData,
        isLoading: religionsLoading,
        error: religionsError,
      },
    ] = useLazyGetAllShowReligionsQuery();

    const [
      triggerPrefixes,
      { data: prefixesData, isLoading: prefixesLoading, error: prefixesError },
    ] = useLazyGetAllShowPrefixesQuery();

    const [
      triggerGenerals,
      { data: generalsData, isLoading: generalsLoading, error: generalsError },
    ] = useLazyGetAllGeneralsQuery();

    // Fetch all necessary dropdown data immediately when entering edit mode
    useEffect(() => {
      if (mode === "edit") {
        const fetchParams = {
          page: 1,
          per_page: 1000,
          status: "active",
        };

        // Fetch religions and prefixes immediately
        triggerReligions(fetchParams);
        triggerPrefixes(fetchParams);

        // Mark them as loaded
        setDropdownsLoaded((prev) => ({
          ...prev,
          religions: true,
          prefixes: true,
        }));

        // Only fetch referrers when needed (on dropdown focus)
      }
    }, [mode, triggerReligions, triggerPrefixes]);

    // Handle dropdown focus for create mode (lazy loading)
    const handleDropdownFocus = (dropdownName) => {
      if (dropdownsLoaded[dropdownName]) return;

      const fetchParams = {
        page: 1,
        per_page: 1000,
        status: "active",
      };

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
        default:
          break;
      }

      setDropdownsLoaded((prev) => ({ ...prev, [dropdownName]: true }));
    };

    const religions = useMemo(() => {
      if (!religionsData) return [];

      if (Array.isArray(religionsData)) {
        return religionsData;
      } else if (religionsData.result && Array.isArray(religionsData.result)) {
        return religionsData.result;
      } else if (religionsData.data && Array.isArray(religionsData.data)) {
        return religionsData.data;
      } else if (
        religionsData.religions &&
        Array.isArray(religionsData.religions)
      ) {
        return religionsData.religions;
      } else if (religionsData.items && Array.isArray(religionsData.items)) {
        return religionsData.items;
      } else if (
        religionsData.results &&
        Array.isArray(religionsData.results)
      ) {
        return religionsData.results;
      }

      return [];
    }, [religionsData]);

    const prefixes = useMemo(() => {
      if (!prefixesData) return [];

      if (Array.isArray(prefixesData)) {
        return prefixesData;
      } else if (prefixesData.result && Array.isArray(prefixesData.result)) {
        return prefixesData.result;
      } else if (prefixesData.data && Array.isArray(prefixesData.data)) {
        return prefixesData.data;
      } else if (
        prefixesData.prefixes &&
        Array.isArray(prefixesData.prefixes)
      ) {
        return prefixesData.prefixes;
      } else if (prefixesData.items && Array.isArray(prefixesData.items)) {
        return prefixesData.items;
      } else if (prefixesData.results && Array.isArray(prefixesData.results)) {
        return prefixesData.results;
      }

      return [];
    }, [prefixesData]);

    const referrers = useMemo(() => {
      if (!generalsData) return [];

      let generals = [];

      if (Array.isArray(generalsData)) {
        generals = generalsData;
      } else if (generalsData.result && Array.isArray(generalsData.result)) {
        generals = generalsData.result;
      } else if (generalsData.data && Array.isArray(generalsData.data)) {
        generals = generalsData.data;
      } else if (
        generalsData.generals &&
        Array.isArray(generalsData.generals)
      ) {
        generals = generalsData.generals;
      } else if (generalsData.items && Array.isArray(generalsData.items)) {
        generals = generalsData.items;
      } else if (generalsData.results && Array.isArray(generalsData.results)) {
        generals = generalsData.results;
      }

      return generals.filter((general) => {
        if (selectedGeneral && selectedGeneral.id) {
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

    const [initialForm, setInitialForm] = useState({});

    const getMaxBirthDate = () => {
      const today = new Date();
      const eighteenYearsAgo = new Date(
        today.getFullYear() - 18,
        today.getMonth(),
        today.getDate()
      );
      return eighteenYearsAgo.toISOString().split("T")[0];
    };

    const validateBirthDate = (dateString) => {
      if (!dateString) return { isValid: false, message: "" };

      const inputDate = new Date(dateString);
      const today = new Date();

      if (isNaN(inputDate.getTime())) {
        return { isValid: false, message: "Please enter a valid date" };
      }

      if (inputDate > today) {
        return {
          isValid: false,
          message: "Birth date cannot be in the future",
        };
      }

      const eighteenYearsAgo = new Date(
        today.getFullYear() - 18,
        today.getMonth(),
        today.getDate()
      );

      if (inputDate > eighteenYearsAgo) {
        return { isValid: false, message: "Must be at least 18 years old" };
      }

      return { isValid: true, message: "" };
    };

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
          return value;
        }
      }

      return "";
    };

    const processGeneralData = (generalData) => {
      if (!generalData) {
        const emptyForm = {
          id_number: "",
          prefix: "",
          prefix_display: "",
          first_name: "",
          middle_name: "",
          last_name: "",
          suffix: "",
          birth_date: "",
          civil_status: "",
          religion: "",
          religion_display: "",
          gender: "",
          referrer_id: "",
          referrer_display: "",
          remarks: "",
        };
        setForm(emptyForm);
        setInitialForm({ ...emptyForm });
        setErrors({});
        setErrorMessage(null);
        setHasUnsavedChanges(false);
        setIsInitialized(true);
        return;
      }

      let formattedBirthDate = extractFieldValue(generalData, [
        "birth_date",
        "birthDate",
        "date_of_birth",
      ]);
      if (formattedBirthDate) {
        const date = new Date(formattedBirthDate);
        if (!isNaN(date.getTime())) {
          formattedBirthDate = date.toISOString().split("T")[0];
        }
      }

      const religionData = generalData.religion;
      const prefixData = generalData.prefix;
      const referrerData =
        generalData.referred_by ||
        generalData.referrer_id ||
        generalData.referrer;

      let prefixId = "";
      let prefixDisplay = "";
      if (prefixData) {
        if (typeof prefixData === "object") {
          prefixId = prefixData.id || "";
          prefixDisplay = prefixData.name || "";
        } else {
          prefixId = prefixData;
          prefixDisplay = prefixData;
        }
      }

      let religionId = "";
      let religionDisplay = "";
      if (religionData) {
        if (typeof religionData === "object") {
          religionId = religionData.id || "";
          religionDisplay = religionData.name || "";
        } else {
          religionId = religionData;
          religionDisplay = religionData;
        }
      }

      let referrerId = "";
      let referrerDisplay = "";
      if (referrerData) {
        if (typeof referrerData === "object") {
          referrerId = referrerData.id || "";
          referrerDisplay =
            referrerData.name ||
            `${referrerData.first_name || ""} ${
              referrerData.last_name || ""
            }`.trim() ||
            "";
        } else {
          referrerId = referrerData;
          referrerDisplay = referrerData;
        }
      }

      const newForm = {
        id_number: extractFieldValue(generalData, [
          "id_number",
          "idNumber",
          "employee_id",
          "emp_id",
        ]),
        prefix: prefixId,
        prefix_display: prefixDisplay,
        first_name: extractFieldValue(generalData, [
          "first_name",
          "firstName",
          "fname",
        ]),
        middle_name: extractFieldValue(generalData, [
          "middle_name",
          "middleName",
          "mname",
        ]),
        last_name: extractFieldValue(generalData, [
          "last_name",
          "lastName",
          "lname",
        ]),
        suffix: extractFieldValue(generalData, ["suffix", "suffix_name"]),
        birth_date: formattedBirthDate,
        civil_status: extractFieldValue(generalData, [
          "civil_status",
          "civilStatus",
          "marital_status",
        ]),
        religion: religionId,
        religion_display: religionDisplay,
        gender: extractFieldValue(generalData, ["gender", "sex"]),
        referrer_id: referrerId,
        referrer_display: referrerDisplay,
        remarks: extractFieldValue(generalData, [
          "remarks",
          "notes",
          "comments",
        ]),
      };

      setForm(newForm);
      setInitialForm({ ...newForm });
      setErrorMessage(null);
      setErrors({});
      setHasUnsavedChanges(false);
      setIsInitialized(true);
    };

    useEffect(() => {
      processGeneralData(selectedGeneral?.general_info || selectedGeneral);
    }, [selectedGeneral, mode]);

    useEffect(() => {
      if (mode === "edit") {
        const hasChanges = JSON.stringify(form) !== JSON.stringify(initialForm);
        setHasUnsavedChanges(hasChanges);
      }
    }, [form, initialForm, mode]);

    const isFormValid = () => {
      const requiredFields = [
        "id_number",
        "prefix",
        "first_name",
        "last_name",
        "birth_date",
        "civil_status",
        "religion",
        "gender",
      ];

      const hasRequiredFields = requiredFields.every((field) => {
        return form[field] && form[field].toString().trim() !== "";
      });

      const birthDateValidation = validateBirthDate(form.birth_date);

      return hasRequiredFields && birthDateValidation.isValid;
    };

    useEffect(() => {
      if (onValidationChange && isInitialized) {
        const isValid = isFormValid();
        onValidationChange(isValid, hasUnsavedChanges);
      }
    }, [form, onValidationChange, hasUnsavedChanges, isInitialized]);

    useEffect(() => {
      if (onFormChange && isInitialized) {
        onFormChange(form, hasUnsavedChanges);
      }
    }, [form, hasUnsavedChanges, onFormChange, isInitialized]);

    const handleChange = (e) => {
      const { name, value } = e.target;

      if (name === "birth_date") {
        setForm((prev) => ({ ...prev, [name]: value }));

        if (value) {
          const validation = validateBirthDate(value);
          if (!validation.isValid) {
            setErrors((prev) => ({
              ...prev,
              [name]: validation.message,
            }));
          } else {
            setErrors((prev) => {
              const newErrors = { ...prev };
              delete newErrors[name];
              return newErrors;
            });
          }
        } else {
          setErrors((prev) => {
            const newErrors = { ...prev };
            delete newErrors[name];
            return newErrors;
          });
        }
      } else {
        setForm((prev) => ({ ...prev, [name]: value }));

        if (errors[name]) {
          setErrors((prev) => ({ ...prev, [name]: false }));
        }
      }

      if (errorMessage) {
        setErrorMessage(null);
      }
    };

    const validateForm = () => {
      const requiredFields = [
        "id_number",
        "prefix",
        "first_name",
        "last_name",
        "birth_date",
        "civil_status",
        "religion",
        "gender",
      ];

      const newErrors = {};

      requiredFields.forEach((field) => {
        if (!form[field] || form[field].toString().trim() === "") {
          newErrors[field] = "This field is required";
        }
      });

      if (form.birth_date) {
        const validation = validateBirthDate(form.birth_date);
        if (!validation.isValid) {
          newErrors.birth_date = validation.message;
        }
      }

      setErrors(newErrors);

      if (Object.keys(newErrors).length > 0) {
        setErrorMessage("Please correct the highlighted fields");
        return false;
      }

      return true;
    };

    const getEnhancedFormData = () => {
      return {
        ...form,
        prefix_label: form.prefix_display || "",
        prefix_display_name: form.prefix_display || "",
        prefix_name: form.prefix_display || "",
        religion_label: form.religion_display || "",
        religion_display_name: form.religion_display || "",
        religion_name: form.religion_display || "",
        referrer_label: form.referrer_display || "",
        referrer_display_name: form.referrer_display || "",
        referrer_name: form.referrer_display || "",
      };
    };

    const handleDropdownChange = (name, value, displayName) => {
      setForm((prev) => ({
        ...prev,
        [name]: value,
        [`${name}_display`]: displayName || "",
      }));

      if (errors[name]) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[name];
          return newErrors;
        });
      }
    };

    const renderDropdownValue = (
      selected,
      displayName,
      dataArray,
      loading,
      fieldName
    ) => {
      if (!selected) return "";

      if (displayName && displayName !== "") return displayName;

      if (loading && dataArray.length === 0) return "Loading...";

      const foundItem = dataArray.find((item) => item.id == selected);
      if (foundItem) {
        return foundItem.name || foundItem.title || foundItem.label || "";
      }

      return `Loading ${fieldName}...`;
    };

    useImperativeHandle(ref, () => ({
      validateAndGetData: () => {
        if (validateForm()) {
          return getEnhancedFormData();
        }
        return null;
      },
      isFormValid,
      getFormData: getEnhancedFormData,
      setFormData: (data) => {
        setForm(data);
        setInitialForm({ ...data });
        setHasUnsavedChanges(false);
      },
      resetForm: () => {
        const emptyForm = {
          id_number: "",
          prefix: "",
          prefix_display: "",
          first_name: "",
          middle_name: "",
          last_name: "",
          suffix: "",
          birth_date: "",
          civil_status: "",
          religion: "",
          religion_display: "",
          gender: "",
          referrer_id: "",
          referrer_display: "",
          remarks: "",
        };
        setForm(emptyForm);
        setInitialForm({ ...emptyForm });
        setErrors({});
        setErrorMessage(null);
        setHasUnsavedChanges(false);
      },
      validateForm,
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

        {religionsError && (
          <Alert
            severity="warning"
            className="general-form__alert"
            sx={{ mb: 2 }}>
            Failed to load religions from server.
          </Alert>
        )}

        {prefixesError && (
          <Alert
            severity="warning"
            className="general-form__alert"
            sx={{ mb: 2 }}>
            Failed to load prefixes from server.
          </Alert>
        )}

        {generalsError && (
          <Alert
            severity="warning"
            className="general-form__alert"
            sx={{ mb: 2 }}>
            Failed to load referrers from server.
          </Alert>
        )}

        <Grid container spacing={2} className="general-form__grid">
          <Grid item xs={3} className="general-form__grid-item">
            <TextField
              label={
                <>
                  First Name <span style={{ color: "red" }}>*</span>
                </>
              }
              name="first_name"
              variant="outlined"
              fullWidth
              value={form.first_name}
              onChange={handleChange}
              disabled={isLoading}
              error={!!errors.first_name}
              helperText={errors.first_name || ""}
              className="general-form__text-field"
            />
          </Grid>

          <Grid item xs={3} className="general-form__grid-item">
            <TextField
              label="Middle Name (Optional)"
              name="middle_name"
              variant="outlined"
              fullWidth
              value={form.middle_name}
              onChange={handleChange}
              disabled={isLoading}
              className="general-form__text-field"
            />
          </Grid>

          <Grid item xs={3} className="general-form__grid-item">
            <TextField
              label={
                <>
                  Last Name <span style={{ color: "red" }}>*</span>
                </>
              }
              name="last_name"
              variant="outlined"
              fullWidth
              value={form.last_name}
              onChange={handleChange}
              disabled={isLoading}
              error={!!errors.last_name}
              helperText={errors.last_name || ""}
              className="general-form__text-field"
            />
          </Grid>

          <Grid item xs={3} className="general-form__grid-item">
            <TextField
              label="Suffix (Optional)"
              name="suffix"
              variant="outlined"
              fullWidth
              value={form.suffix}
              onChange={handleChange}
              disabled={isLoading}
              className="general-form__text-field"
            />
          </Grid>

          <Grid item xs={3} className="general-form__grid-item">
            <FormControl
              fullWidth
              variant="outlined"
              error={!!errors.prefix}
              disabled={isLoading || prefixesLoading}
              className="general-form__select">
              <InputLabel>
                Prefix <span style={{ color: "red" }}>*</span>
              </InputLabel>
              <Select
                name="prefix"
                value={form.prefix}
                onChange={(e) => {
                  const selectedPrefix = prefixes.find(
                    (p) => p.id === e.target.value
                  );
                  handleDropdownChange(
                    "prefix",
                    e.target.value,
                    selectedPrefix?.name ||
                      selectedPrefix?.title ||
                      selectedPrefix?.label ||
                      selectedPrefix?.code ||
                      ""
                  );
                }}
                onOpen={() => handleDropdownFocus("prefixes")}
                label="Prefix *"
                renderValue={(selected) =>
                  renderDropdownValue(
                    selected,
                    form.prefix_display,
                    prefixes,
                    prefixesLoading,
                    "prefix"
                  )
                }>
                <MenuItem value="">
                  <em>Select Prefix</em>
                </MenuItem>
                {prefixesLoading && prefixes.length === 0 ? (
                  <MenuItem disabled>
                    <CircularProgress size={16} sx={{ mr: 1 }} /> Loading
                    prefixes...
                  </MenuItem>
                ) : (
                  prefixes.map((prefix, index) => {
                    const prefixId = prefix.id || prefix.code || prefix.name;
                    const prefixDisplay =
                      prefix.name ||
                      prefix.title ||
                      prefix.label ||
                      prefix.code ||
                      "";
                    return (
                      <MenuItem key={prefixId || index} value={prefixId}>
                        {prefixDisplay}
                      </MenuItem>
                    );
                  })
                )}
              </Select>
              {errors.prefix && (
                <div className="form-error">{errors.prefix}</div>
              )}
            </FormControl>
          </Grid>

          <Grid item xs={3} className="general-form__grid-item">
            <TextField
              label={
                <>
                  ID Number <span style={{ color: "red" }}>*</span>
                </>
              }
              name="id_number"
              variant="outlined"
              fullWidth
              value={form.id_number}
              onChange={handleChange}
              disabled={isLoading}
              error={!!errors.id_number}
              helperText={errors.id_number || ""}
              className="general-form__text-field"
            />
          </Grid>

          <Grid item xs={3} className="general-form__grid-item">
            <TextField
              label={
                <>
                  Birth Date <span style={{ color: "red" }}>*</span>
                </>
              }
              name="birth_date"
              type="date"
              variant="outlined"
              fullWidth
              value={form.birth_date}
              onChange={handleChange}
              disabled={isLoading}
              error={!!errors.birth_date}
              helperText={errors.birth_date || "Must be at least 18 years old"}
              InputLabelProps={{
                shrink: true,
              }}
              inputProps={{
                max: getMaxBirthDate(),
              }}
              className="general-form__text-field"
            />
          </Grid>

          <Grid item xs={3} className="general-form__grid-item">
            <FormControl
              fullWidth
              variant="outlined"
              error={!!errors.gender}
              disabled={isLoading}
              className="general-form__select">
              <InputLabel>
                Gender <span style={{ color: "red" }}>*</span>
              </InputLabel>
              <Select
                name="gender"
                value={form.gender}
                onChange={handleChange}
                label="Gender *">
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
                <div className="form-error">{errors.gender}</div>
              )}
            </FormControl>
          </Grid>

          <Grid item xs={3} className="general-form__grid-item">
            <FormControl
              fullWidth
              variant="outlined"
              error={!!errors.civil_status}
              disabled={isLoading}
              className="general-form__select">
              <InputLabel>
                Civil Status <span style={{ color: "red" }}>*</span>
              </InputLabel>
              <Select
                name="civil_status"
                value={form.civil_status}
                onChange={handleChange}
                label="Civil Status *">
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
                <div className="form-error">{errors.civil_status}</div>
              )}
            </FormControl>
          </Grid>

          <Grid item xs={3} className="general-form__grid-item">
            <FormControl
              fullWidth
              variant="outlined"
              error={!!errors.religion}
              disabled={isLoading || religionsLoading}
              className="general-form__select">
              <InputLabel>
                Religion <span style={{ color: "red" }}>*</span>
              </InputLabel>
              <Select
                name="religion"
                value={form.religion}
                onChange={(e) => {
                  const selectedReligion = religions.find(
                    (r) => r.id === e.target.value
                  );
                  handleDropdownChange(
                    "religion",
                    e.target.value,
                    selectedReligion?.name ||
                      selectedReligion?.title ||
                      selectedReligion?.label ||
                      ""
                  );
                }}
                onOpen={() => handleDropdownFocus("religions")}
                label="Religion *"
                renderValue={(selected) =>
                  renderDropdownValue(
                    selected,
                    form.religion_display,
                    religions,
                    religionsLoading,
                    "religion"
                  )
                }>
                <MenuItem value="">
                  <em>Select Religion</em>
                </MenuItem>
                {religionsLoading && religions.length === 0 ? (
                  <MenuItem disabled>
                    <CircularProgress size={16} sx={{ mr: 1 }} /> Loading
                    religions...
                  </MenuItem>
                ) : (
                  religions.map((religion, index) => {
                    const religionId = religion.id;
                    const religionDisplay =
                      religion.name || religion.title || religion.label || "";
                    return (
                      <MenuItem key={religionId || index} value={religionId}>
                        {religionDisplay}
                      </MenuItem>
                    );
                  })
                )}
              </Select>
              {errors.religion && (
                <div className="form-error">{errors.religion}</div>
              )}
            </FormControl>
          </Grid>

          <Grid item xs={3} className="general-form__grid-item">
            <FormControl
              fullWidth
              variant="outlined"
              disabled={isLoading || generalsLoading}
              className="general-form__select">
              <InputLabel>Referred By (Optional)</InputLabel>
              <Select
                name="referrer_id"
                value={form.referrer_id}
                onChange={(e) => {
                  const selectedReferrer = referrers.find(
                    (r) => r.id === e.target.value
                  );
                  const referrerDisplayName = selectedReferrer
                    ? selectedReferrer.name ||
                      `${selectedReferrer.first_name || ""} ${
                        selectedReferrer.last_name || ""
                      }`.trim()
                    : "";
                  handleDropdownChange(
                    "referrer_id",
                    e.target.value,
                    referrerDisplayName
                  );
                }}
                onOpen={() => handleDropdownFocus("referrers")}
                label="Referred By (Optional)"
                renderValue={(selected) =>
                  renderDropdownValue(
                    selected,
                    form.referrer_display,
                    referrers,
                    generalsLoading,
                    "referrer"
                  )
                }>
                <MenuItem value="">
                  <em>None</em>
                </MenuItem>
                {generalsLoading && referrers.length === 0 ? (
                  <MenuItem disabled>
                    <CircularProgress size={16} sx={{ mr: 1 }} /> Loading
                    referrers...
                  </MenuItem>
                ) : (
                  referrers.map((referrer, index) => {
                    const referrerId = referrer.id;
                    const referrerDisplay =
                      referrer.name ||
                      `${referrer.first_name || ""} ${
                        referrer.last_name || ""
                      }`.trim() ||
                      referrer.title ||
                      referrer.label ||
                      "";
                    return (
                      <MenuItem key={referrerId || index} value={referrerId}>
                        {referrerDisplay}
                      </MenuItem>
                    );
                  })
                )}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} className="general-form__grid-item">
            <TextField
              label="Remarks (Optional)"
              name="remarks"
              variant="outlined"
              fullWidth
              multiline
              rows={3}
              value={form.remarks}
              onChange={handleChange}
              disabled={isLoading}
              className="general-form__text-field"
              placeholder="Additional notes or comments..."
            />
          </Grid>
        </Grid>
      </Box>
    );
  }
);

GeneralForm.displayName = "GeneralForm";

export default GeneralForm;
