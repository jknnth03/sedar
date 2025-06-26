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
  InputAdornment,
  CircularProgress,
} from "@mui/material";
import { useSnackbar } from "notistack";
import { useGetAllShowSchedulesQuery } from "../../../../features/api/extras/schedulesApi";
import { useGetAllJobLevelsQuery } from "../../../../features/api/masterlist/joblevelsApi";
import { useGetAllPositionsQuery } from "../../../../features/api/masterlist/positionsApi";
import "./General.scss";

const PositionForm = forwardRef(
  (
    {
      onSubmit,
      selectedPosition,
      showArchived,
      isLoading = false,
      generalFormData,
      onValidationChange,
      mode = "create",
      showHeader = true,
      onFormChange = null,
    },
    ref
  ) => {
    const { enqueueSnackbar } = useSnackbar();

    const [form, setForm] = useState({
      position_id: "",
      position_display: "",
      schedule_id: "",
      schedule_display: "",
      job_level_id: "",
      job_level_display: "",
      job_rate: "",
      allowance: "",
      additional_rate: "",
      additional_rate_remarks: "",
      additional_tools: "",
    });

    const [errors, setErrors] = useState({});
    const [errorMessage, setErrorMessage] = useState(null);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [initialForm, setInitialForm] = useState({});
    const [isInitialized, setIsInitialized] = useState(false);

    // CHANGED: Always fetch data when form loads with existing values
    const shouldFetch = useMemo(() => {
      return (
        selectedPosition &&
        (selectedPosition.position_id ||
          selectedPosition.schedule_id ||
          selectedPosition.job_level_id)
      );
    }, [selectedPosition]);

    // Fetch data immediately if we have existing values, otherwise wait for user interaction
    const [shouldFetchPositions, setShouldFetchPositions] =
      useState(shouldFetch);
    const [shouldFetchSchedules, setShouldFetchSchedules] =
      useState(shouldFetch);
    const [shouldFetchJobLevels, setShouldFetchJobLevels] =
      useState(shouldFetch);

    // Only fetch data when needed using skip parameter
    const {
      data: positionsData,
      isLoading: positionsLoading,
      error: positionsError,
    } = useGetAllPositionsQuery(undefined, {
      skip: !shouldFetchPositions,
    });

    const {
      data: schedulesData,
      isLoading: schedulesLoading,
      error: schedulesError,
    } = useGetAllShowSchedulesQuery(undefined, {
      skip: !shouldFetchSchedules,
    });

    const {
      data: jobLevelsData,
      isLoading: jobLevelsLoading,
      error: jobLevelsError,
    } = useGetAllJobLevelsQuery(undefined, {
      skip: !shouldFetchJobLevels,
    });

    // DEBUG: Console log API responses
    useEffect(() => {
      if (positionsData) {
        console.log("=== POSITIONS API RESPONSE ===");
        console.log("Raw positionsData:", positionsData);
        console.log("Type of positionsData:", typeof positionsData);
        console.log("Is Array:", Array.isArray(positionsData));

        // Log all possible nested arrays
        const possibleKeys = [
          "result",
          "data",
          "positions",
          "items",
          "results",
        ];
        possibleKeys.forEach((key) => {
          if (positionsData[key]) {
            console.log(`positionsData.${key}:`, positionsData[key]);
            console.log(
              `Is positionsData.${key} an array:`,
              Array.isArray(positionsData[key])
            );
            if (
              Array.isArray(positionsData[key]) &&
              positionsData[key].length > 0
            ) {
              console.log(
                `First item in positionsData.${key}:`,
                positionsData[key][0]
              );
              console.log(
                `Keys in first item:`,
                Object.keys(positionsData[key][0])
              );
            }
          }
        });
        console.log("=== END POSITIONS ===");
      }
    }, [positionsData]);

    useEffect(() => {
      if (schedulesData) {
        console.log("=== SCHEDULES API RESPONSE ===");
        console.log("Raw schedulesData:", schedulesData);
        console.log("Type of schedulesData:", typeof schedulesData);
        console.log("Is Array:", Array.isArray(schedulesData));

        const possibleKeys = [
          "result",
          "data",
          "schedules",
          "items",
          "results",
        ];
        possibleKeys.forEach((key) => {
          if (schedulesData[key]) {
            console.log(`schedulesData.${key}:`, schedulesData[key]);
            console.log(
              `Is schedulesData.${key} an array:`,
              Array.isArray(schedulesData[key])
            );
            if (
              Array.isArray(schedulesData[key]) &&
              schedulesData[key].length > 0
            ) {
              console.log(
                `First item in schedulesData.${key}:`,
                schedulesData[key][0]
              );
              console.log(
                `Keys in first item:`,
                Object.keys(schedulesData[key][0])
              );
            }
          }
        });
        console.log("=== END SCHEDULES ===");
      }
    }, [schedulesData]);

    useEffect(() => {
      if (jobLevelsData) {
        console.log("=== JOB LEVELS API RESPONSE ===");
        console.log("Raw jobLevelsData:", jobLevelsData);
        console.log("Type of jobLevelsData:", typeof jobLevelsData);
        console.log("Is Array:", Array.isArray(jobLevelsData));

        const possibleKeys = [
          "result",
          "data",
          "jobLevels",
          "items",
          "results",
        ];
        possibleKeys.forEach((key) => {
          if (jobLevelsData[key]) {
            console.log(`jobLevelsData.${key}:`, jobLevelsData[key]);
            console.log(
              `Is jobLevelsData.${key} an array:`,
              Array.isArray(jobLevelsData[key])
            );
            if (
              Array.isArray(jobLevelsData[key]) &&
              jobLevelsData[key].length > 0
            ) {
              console.log(
                `First item in jobLevelsData.${key}:`,
                jobLevelsData[key][0]
              );
              console.log(
                `Keys in first item:`,
                Object.keys(jobLevelsData[key][0])
              );
            }
          }
        });
        console.log("=== END JOB LEVELS ===");
      }
    }, [jobLevelsData]);

    const positions = useMemo(() => {
      if (!positionsData) return [];
      const possibleArrays = [
        positionsData,
        positionsData.result,
        positionsData.data,
        positionsData.positions,
        positionsData.items,
        positionsData.results,
      ];
      for (const arr of possibleArrays) {
        if (Array.isArray(arr) && arr.length > 0) {
          console.log("Using positions array:", arr);
          console.log("Sample position item:", arr[0]);
          return arr;
        }
      }
      return [];
    }, [positionsData]);

    const schedules = useMemo(() => {
      if (!schedulesData) return [];
      const possibleArrays = [
        schedulesData,
        schedulesData.result,
        schedulesData.data,
        schedulesData.schedules,
        schedulesData.items,
        schedulesData.results,
      ];
      for (const arr of possibleArrays) {
        if (Array.isArray(arr) && arr.length > 0) {
          console.log("Using schedules array:", arr);
          console.log("Sample schedule item:", arr[0]);
          return arr;
        }
      }
      return [];
    }, [schedulesData]);

    const jobLevels = useMemo(() => {
      if (!jobLevelsData) return [];
      const possibleArrays = [
        jobLevelsData,
        jobLevelsData.result,
        jobLevelsData.data,
        jobLevelsData.jobLevels,
        jobLevelsData.items,
        jobLevelsData.results,
      ];
      for (const arr of possibleArrays) {
        if (Array.isArray(arr) && arr.length > 0) {
          console.log("Using jobLevels array:", arr);
          console.log("Sample jobLevel item:", arr[0]);
          return arr;
        }
      }
      return [];
    }, [jobLevelsData]);

    const getNestedValue = (obj, path, defaultValue = "") => {
      if (!obj || typeof obj !== "object") return defaultValue;
      const keys = path.split(".");
      let current = obj;
      for (const key of keys) {
        if (current && typeof current === "object" && key in current) {
          current = current[key];
        } else {
          return defaultValue;
        }
      }
      return current !== null && current !== undefined
        ? String(current)
        : defaultValue;
    };

    // FIXED: Updated extractPositionData to handle employee data structure
    const extractPositionData = (selectedPosition) => {
      if (!selectedPosition) return null;

      console.log("Extracting position data from:", selectedPosition);

      // Handle different data structures
      const fieldMappings = {
        position_id: [
          "position_id",
          "positionId",
          "position.id",
          "position.position_id",
          "id",
          "employee_position.position_id",
          "employee_positions.position_id",
          // Add direct access for employee data
          "employee_position_id",
          "current_position_id",
        ],
        schedule_id: [
          "schedule_id",
          "scheduleId",
          "schedule.id",
          "schedule.schedule_id",
          "employee_position.schedule_id",
          "employee_positions.schedule_id",
          // Add direct access for employee data
          "employee_schedule_id",
          "current_schedule_id",
        ],
        job_level_id: [
          "job_level_id",
          "jobLevelId",
          "jobLevel.id",
          "job_level.id",
          "employee_position.job_level_id",
          "employee_positions.job_level_id",
          // Add direct access for employee data
          "employee_job_level_id",
          "current_job_level_id",
        ],
        job_rate: [
          "job_rate",
          "jobRate",
          "rate",
          "salary",
          "employee_position.job_rate",
          "employee_positions.job_rate",
          "current_job_rate",
          "current_salary",
        ],
        allowance: [
          "allowance",
          "allowances",
          "daily_allowance",
          "employee_position.allowance",
          "employee_positions.allowance",
          "current_allowance",
        ],
        additional_rate: [
          "additional_rate",
          "additionalRate",
          "extra_rate",
          "employee_position.additional_rate",
          "employee_positions.additional_rate",
          "current_additional_rate",
        ],
        additional_rate_remarks: [
          "additional_rate_remarks",
          "additionalRateRemarks",
          "rate_remarks",
          "remarks",
          "employee_position.additional_rate_remarks",
          "employee_positions.additional_rate_remarks",
          "current_additional_rate_remarks",
        ],
        additional_tools: [
          "additional_tools",
          "additionalTools",
          "tools",
          "equipment",
          "employee_position.additional_tools",
          "employee_positions.additional_tools",
          "current_additional_tools",
        ],
      };

      const extractedData = {};
      let hasValidData = false;

      for (const [fieldName, paths] of Object.entries(fieldMappings)) {
        let value = "";
        for (const path of paths) {
          value = getNestedValue(selectedPosition, path);
          if (value && value !== "0" && value !== "") {
            hasValidData = true;
            break;
          }
        }
        extractedData[fieldName] = value;
      }

      // CHANGED: Don't try to extract display names from nested objects
      // Instead, leave them empty and let the form populate them from API data
      extractedData.position_display = "";
      extractedData.schedule_display = "";
      extractedData.job_level_display = "";

      console.log("Extracted data:", extractedData);
      return hasValidData ? extractedData : null;
    };

    const isFormValid = () => {
      const requiredFields = [
        "position_id",
        "schedule_id",
        "job_level_id",
        "job_rate",
      ];
      return requiredFields.every((field) => {
        return form[field] && form[field].toString().trim() !== "";
      });
    };

    // Fixed handleDropdownChange function
    const handleDropdownChange = (name, value, displayValue) => {
      console.log(
        `handleDropdownChange - name: ${name}, value: ${value}, displayValue: ${displayValue}`
      );
      setForm((prev) => ({
        ...prev,
        [`${name}_id`]: value,
        [`${name}_display`]: displayValue,
      }));
    };

    // Handle dropdown clicks - ONLY fetch when user actually opens dropdown
    const handleDropdownOpen = (dropdownType) => {
      console.log(`Opening dropdown: ${dropdownType}`);
      switch (dropdownType) {
        case "positions":
          if (!shouldFetchPositions) {
            console.log("Fetching positions data...");
            setShouldFetchPositions(true);
          }
          break;
        case "schedules":
          if (!shouldFetchSchedules) {
            console.log("Fetching schedules data...");
            setShouldFetchSchedules(true);
          }
          break;
        case "jobLevels":
          if (!shouldFetchJobLevels) {
            console.log("Fetching job levels data...");
            setShouldFetchJobLevels(true);
          }
          break;
        default:
          break;
      }
    };

    // FIXED: Enhanced function to get display name with better error handling
    const getDisplayName = (fieldType, value) => {
      if (!value) return "";

      console.log(`Getting display name for ${fieldType} with value:`, value);

      switch (fieldType) {
        case "position":
          if (form.position_display) {
            console.log(
              `Using form position_display: ${form.position_display}`
            );
            return form.position_display;
          }
          const selectedPosition = positions.find((p) => p.id == value);
          console.log("Found position:", selectedPosition);
          const positionName = selectedPosition
            ? selectedPosition.title?.name ||
              selectedPosition.name ||
              selectedPosition.title ||
              selectedPosition.position_title ||
              selectedPosition.position_name ||
              `Position ${selectedPosition.id}`
            : `Position ${value}`;
          console.log(`Position display name: ${positionName}`);
          return positionName;

        case "schedule":
          if (form.schedule_display) {
            console.log(
              `Using form schedule_display: ${form.schedule_display}`
            );
            return form.schedule_display;
          }
          const selectedSchedule = schedules.find((s) => s.id == value);
          console.log("Found schedule:", selectedSchedule);
          const scheduleName = selectedSchedule
            ? selectedSchedule.name ||
              selectedSchedule.title ||
              selectedSchedule.schedule_name ||
              selectedSchedule.schedule_title ||
              `Schedule ${selectedSchedule.id}`
            : `Schedule ${value}`;
          console.log(`Schedule display name: ${scheduleName}`);
          return scheduleName;

        case "job_level":
          if (form.job_level_display) {
            console.log(
              `Using form job_level_display: ${form.job_level_display}`
            );
            return form.job_level_display;
          }
          const selectedJobLevel = jobLevels.find((j) => j.id == value);
          console.log("Found job level:", selectedJobLevel);
          const jobLevelName = selectedJobLevel
            ? selectedJobLevel.label ||
              selectedJobLevel.title ||
              selectedJobLevel.name ||
              selectedJobLevel.job_level_name ||
              selectedJobLevel.level_name ||
              `Job Level ${selectedJobLevel.id}`
            : `Job Level ${value}`;
          console.log(`Job level display name: ${jobLevelName}`);
          return jobLevelName;

        default:
          return value;
      }
    };

    // ADDED: Function to populate display names from API data
    const populateDisplayNames = (formData) => {
      if (!formData) return formData;

      const updatedForm = { ...formData };

      // Populate position display name
      if (
        formData.position_id &&
        positions.length > 0 &&
        !formData.position_display
      ) {
        const position = positions.find((p) => p.id == formData.position_id);
        if (position) {
          updatedForm.position_display =
            position.title?.name ||
            position.name ||
            position.title ||
            position.position_title ||
            position.position_name ||
            `Position ${position.id}`;
        }
      }

      // Populate schedule display name
      if (
        formData.schedule_id &&
        schedules.length > 0 &&
        !formData.schedule_display
      ) {
        const schedule = schedules.find((s) => s.id == formData.schedule_id);
        if (schedule) {
          updatedForm.schedule_display =
            schedule.name ||
            schedule.title ||
            schedule.schedule_name ||
            schedule.schedule_title ||
            `Schedule ${schedule.id}`;
        }
      }

      // Populate job level display name
      if (
        formData.job_level_id &&
        jobLevels.length > 0 &&
        !formData.job_level_display
      ) {
        const jobLevel = jobLevels.find((j) => j.id == formData.job_level_id);
        if (jobLevel) {
          updatedForm.job_level_display =
            jobLevel.label ||
            jobLevel.title ||
            jobLevel.name ||
            jobLevel.job_level_name ||
            jobLevel.level_name ||
            `Job Level ${jobLevel.id}`;
        }
      }

      return updatedForm;
    };

    // ADDED: Effect to populate display names when API data loads
    useEffect(() => {
      if (
        isInitialized &&
        (positions.length > 0 || schedules.length > 0 || jobLevels.length > 0)
      ) {
        const updatedForm = populateDisplayNames(form);
        if (JSON.stringify(updatedForm) !== JSON.stringify(form)) {
          console.log("Updating form with display names:", updatedForm);
          setForm(updatedForm);
        }
      }
    }, [positions, schedules, jobLevels, isInitialized]);

    useEffect(() => {
      if (selectedPosition && !isInitialized) {
        console.log("Selected position changed:", selectedPosition);
        const extractedData = extractPositionData(selectedPosition);
        if (extractedData) {
          console.log("Extracted data:", extractedData);
          // Set form data first
          setForm(extractedData);
          setInitialForm({ ...extractedData });
          setErrorMessage(null);
          setErrors({});
          setHasUnsavedChanges(false);
          setIsInitialized(true);

          // ADDED: Trigger API fetches if we have IDs but no display names
          if (extractedData.position_id && !extractedData.position_display) {
            setShouldFetchPositions(true);
          }
          if (extractedData.schedule_id && !extractedData.schedule_display) {
            setShouldFetchSchedules(true);
          }
          if (extractedData.job_level_id && !extractedData.job_level_display) {
            setShouldFetchJobLevels(true);
          }
        }
      } else if (!selectedPosition && !isInitialized) {
        const emptyForm = {
          position_id: "",
          position_display: "",
          schedule_id: "",
          schedule_display: "",
          job_level_id: "",
          job_level_display: "",
          job_rate: "",
          allowance: "",
          additional_rate: "",
          additional_rate_remarks: "",
          additional_tools: "",
        };
        setForm(emptyForm);
        setInitialForm({ ...emptyForm });
        setErrors({});
        setErrorMessage(null);
        setHasUnsavedChanges(false);
        setIsInitialized(true);
      }
    }, [selectedPosition, isInitialized]);

    useEffect(() => {
      setIsInitialized(false);
    }, [selectedPosition]);

    useEffect(() => {
      if (mode === "edit" && isInitialized) {
        const hasChanges = JSON.stringify(form) !== JSON.stringify(initialForm);
        setHasUnsavedChanges(hasChanges);
      }
    }, [form, initialForm, mode, isInitialized]);

    useEffect(() => {
      if (onValidationChange) {
        const isValid = isFormValid();
        onValidationChange(isValid, hasUnsavedChanges);
      }
    }, [form, onValidationChange, hasUnsavedChanges]);

    useEffect(() => {
      if (onFormChange) {
        onFormChange(form, hasUnsavedChanges);
      }
    }, [form, hasUnsavedChanges, onFormChange]);

    const handleChange = (e) => {
      const { name, value } = e.target;
      setForm((prev) => ({ ...prev, [name]: value }));

      if (errors[name]) {
        setErrors((prev) => ({ ...prev, [name]: false }));
      }

      if (errorMessage) {
        setErrorMessage(null);
      }
    };

    const validateForm = () => {
      const requiredFields = [
        "position_id",
        "schedule_id",
        "job_level_id",
        "job_rate",
      ];
      const newErrors = {};

      requiredFields.forEach((field) => {
        if (!form[field] || form[field].toString().trim() === "") {
          newErrors[field] = "This field is required";
        }
      });

      const numericFields = ["job_rate", "allowance", "additional_rate"];
      numericFields.forEach((field) => {
        if (form[field] && isNaN(Number(form[field]))) {
          newErrors[field] = "Please enter a valid number";
        }
      });

      setErrors(newErrors);

      if (Object.keys(newErrors).length > 0) {
        setErrorMessage("Please correct the highlighted fields");
        return false;
      }

      return true;
    };

    const getEnhancedFormData = () => {
      // CHANGED: Use display values from form first, then fallback to API data
      const positionDisplayName =
        form.position_display ||
        positions.find((p) => p.id == form.position_id)?.title?.name ||
        positions.find((p) => p.id == form.position_id)?.name ||
        positions.find((p) => p.id == form.position_id)?.title ||
        "";

      const scheduleDisplayName =
        form.schedule_display ||
        schedules.find((s) => s.id == form.schedule_id)?.name ||
        schedules.find((s) => s.id == form.schedule_id)?.title ||
        "";

      const jobLevelDisplayName =
        form.job_level_display ||
        jobLevels.find((j) => j.id == form.job_level_id)?.label ||
        jobLevels.find((j) => j.id == form.job_level_id)?.title ||
        jobLevels.find((j) => j.id == form.job_level_id)?.name ||
        "";

      return {
        ...form,
        position_name: positionDisplayName,
        position_label: positionDisplayName,
        position_display_name: positionDisplayName,
        schedule_name: scheduleDisplayName,
        schedule_label: scheduleDisplayName,
        schedule_display_name: scheduleDisplayName,
        job_level_name: jobLevelDisplayName,
        job_level_label: jobLevelDisplayName,
        job_level_display_name: jobLevelDisplayName,
      };
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
        setIsInitialized(true);
      },
      resetForm: () => {
        const emptyForm = {
          position_id: "",
          position_display: "",
          schedule_id: "",
          schedule_display: "",
          job_level_id: "",
          job_level_display: "",
          job_rate: "",
          allowance: "",
          additional_rate: "",
          additional_rate_remarks: "",
          additional_tools: "",
        };
        setForm(emptyForm);
        setInitialForm({ ...emptyForm });
        setErrors({});
        setErrorMessage(null);
        setHasUnsavedChanges(false);
        setIsInitialized(false);
        // Reset fetch flags
        setShouldFetchPositions(false);
        setShouldFetchSchedules(false);
        setShouldFetchJobLevels(false);
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
      <Box sx={{ p: 2 }}>
        {errorMessage && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {errorMessage}
          </Alert>
        )}

        {positionsError && (
          <Alert severity="warning" sx={{ mb: 3 }}>
            Failed to load positions from server.
          </Alert>
        )}

        {schedulesError && (
          <Alert severity="warning" sx={{ mb: 3 }}>
            Failed to load schedules from server.
          </Alert>
        )}

        {jobLevelsError && (
          <Alert severity="warning" sx={{ mb: 3 }}>
            Failed to load job levels from server.
          </Alert>
        )}

        <Grid container spacing={2}>
          <Grid item xs={3}>
            <FormControl
              fullWidth
              variant="outlined"
              error={!!errors.position_id}
              disabled={isLoading || positionsLoading}
              sx={{ width: "355px" }}>
              <InputLabel>
                Position Title <span style={{ color: "red" }}>*</span>
              </InputLabel>
              <Select
                name="position_id"
                value={form.position_id}
                onOpen={() => handleDropdownOpen("positions")}
                onChange={(e) => {
                  console.log("Position selection changed:", e.target.value);
                  const selectedPosition = positions.find(
                    (p) => p.id === e.target.value
                  );
                  console.log("Selected position object:", selectedPosition);
                  const displayName =
                    selectedPosition?.title?.name ||
                    selectedPosition?.name ||
                    selectedPosition?.title ||
                    selectedPosition?.position_title ||
                    selectedPosition?.position_name ||
                    "";
                  console.log("Position display name:", displayName);
                  handleDropdownChange("position", e.target.value, displayName);
                }}
                label="Position Title *"
                sx={{ borderRadius: 2 }}
                renderValue={(selected) => {
                  if (positionsLoading) return "Loading...";
                  if (!selected) return "Select Position";
                  // Use display name from form first, then fallback to API data
                  return (
                    form.position_display ||
                    getDisplayName("position", selected) ||
                    "Select Position"
                  );
                }}
                MenuProps={{
                  PaperProps: {
                    style: {
                      maxHeight: 300,
                    },
                  },
                }}>
                <MenuItem value="">
                  <em>Select Position</em>
                </MenuItem>
                {positions.map((position) => {
                  const displayText =
                    position.title?.name ||
                    position.name ||
                    position.title ||
                    position.position_title ||
                    position.position_name ||
                    `Position ${position.id}`;
                  console.log(
                    `Position ${position.id} display text:`,
                    displayText
                  );
                  return (
                    <MenuItem key={position.id} value={position.id}>
                      {displayText}
                    </MenuItem>
                  );
                })}
                {positionsLoading && (
                  <MenuItem disabled>
                    <CircularProgress size={20} sx={{ mr: 1 }} />
                    Loading positions...
                  </MenuItem>
                )}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={3}>
            <FormControl
              fullWidth
              variant="outlined"
              error={!!errors.schedule_id}
              disabled={isLoading || schedulesLoading}
              sx={{ width: "355px" }}>
              <InputLabel>
                Schedule <span style={{ color: "red" }}>*</span>
              </InputLabel>
              <Select
                name="schedule_id"
                value={form.schedule_id}
                onOpen={() => handleDropdownOpen("schedules")}
                onChange={(e) => {
                  console.log("Schedule selection changed:", e.target.value);
                  const selectedSchedule = schedules.find(
                    (s) => s.id === e.target.value
                  );
                  console.log("Selected schedule object:", selectedSchedule);
                  const displayName =
                    selectedSchedule?.name ||
                    selectedSchedule?.title ||
                    selectedSchedule?.schedule_name ||
                    selectedSchedule?.schedule_title ||
                    "";
                  console.log("Schedule display name:", displayName);
                  handleDropdownChange("schedule", e.target.value, displayName);
                }}
                label="Schedule *"
                sx={{ borderRadius: 2 }}
                renderValue={(selected) => {
                  if (schedulesLoading) return "Loading...";
                  if (!selected) return "Select Schedule";
                  return (
                    form.schedule_display ||
                    getDisplayName("schedule", selected) ||
                    "Select Schedule"
                  );
                }}
                MenuProps={{
                  PaperProps: {
                    style: {
                      maxHeight: 300,
                    },
                  },
                }}>
                <MenuItem value="">
                  <em>Select Schedule</em>
                </MenuItem>
                {schedules.map((schedule) => {
                  const displayText =
                    schedule.name ||
                    schedule.title ||
                    schedule.schedule_name ||
                    schedule.schedule_title ||
                    `Schedule ${schedule.id}`;
                  return (
                    <MenuItem key={schedule.id} value={schedule.id}>
                      {displayText}
                    </MenuItem>
                  );
                })}
                {schedulesLoading && (
                  <MenuItem disabled>
                    <CircularProgress size={20} sx={{ mr: 1 }} />
                    Loading schedules...
                  </MenuItem>
                )}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={3}>
            <FormControl
              fullWidth
              variant="outlined"
              error={!!errors.job_level_id}
              disabled={isLoading || jobLevelsLoading}
              sx={{ width: "355px" }}>
              <InputLabel>
                Job Level <span style={{ color: "red" }}>*</span>
              </InputLabel>
              <Select
                name="job_level_id"
                value={form.job_level_id}
                onOpen={() => handleDropdownOpen("jobLevels")}
                onChange={(e) => {
                  console.log("Job level selection changed:", e.target.value);
                  const selectedJobLevel = jobLevels.find(
                    (j) => j.id === e.target.value
                  );
                  console.log("Selected job level object:", selectedJobLevel);
                  const displayName =
                    selectedJobLevel?.label ||
                    selectedJobLevel?.title ||
                    selectedJobLevel?.name ||
                    selectedJobLevel?.job_level_name ||
                    selectedJobLevel?.level_name ||
                    "";
                  console.log("Job level display name:", displayName);
                  handleDropdownChange(
                    "job_level",
                    e.target.value,
                    displayName
                  );
                }}
                label="Job Level *"
                sx={{ borderRadius: 2 }}
                renderValue={(selected) => {
                  if (jobLevelsLoading) return "Loading...";
                  if (!selected) return "Select Job Level";
                  return (
                    form.job_level_display ||
                    getDisplayName("job_level", selected) ||
                    "Select Job Level"
                  );
                }}
                MenuProps={{
                  PaperProps: {
                    style: {
                      maxHeight: 300,
                    },
                  },
                }}>
                <MenuItem value="">
                  <em>Select Job Level</em>
                </MenuItem>
                {jobLevels.map((jobLevel) => {
                  const displayText =
                    jobLevel.label ||
                    jobLevel.title ||
                    jobLevel.name ||
                    jobLevel.job_level_name ||
                    jobLevel.level_name ||
                    `Job Level ${jobLevel.id}`;
                  return (
                    <MenuItem key={jobLevel.id} value={jobLevel.id}>
                      {displayText}
                    </MenuItem>
                  );
                })}
                {jobLevelsLoading && (
                  <MenuItem disabled>
                    <CircularProgress size={20} sx={{ mr: 1 }} />
                    Loading job levels...
                  </MenuItem>
                )}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={3}>
            <TextField
              fullWidth
              name="job_rate"
              label="Job Rate"
              value={form.job_rate}
              onChange={handleChange}
              variant="outlined"
              error={!!errors.job_rate}
              helperText={errors.job_rate}
              required
              type="number"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">₱</InputAdornment>
                ),
              }}
              sx={{ borderRadius: 2, width: "355px" }}
            />
          </Grid>

          <Grid item xs={3}>
            <TextField
              fullWidth
              name="allowance"
              label="Allowance"
              value={form.allowance}
              onChange={handleChange}
              variant="outlined"
              error={!!errors.allowance}
              helperText={errors.allowance}
              type="number"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">₱</InputAdornment>
                ),
              }}
              sx={{ borderRadius: 2, width: "355px" }}
            />
          </Grid>

          <Grid item xs={3}>
            <TextField
              fullWidth
              name="additional_rate"
              label="Additional Rate"
              value={form.additional_rate}
              onChange={handleChange}
              variant="outlined"
              error={!!errors.additional_rate}
              helperText={errors.additional_rate}
              type="number"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">₱</InputAdornment>
                ),
              }}
              sx={{ borderRadius: 2, width: "355px" }}
            />
          </Grid>

          <Grid item xs={6}>
            <TextField
              fullWidth
              name="additional_rate_remarks"
              label="Additional Rate Remarks"
              value={form.additional_rate_remarks}
              onChange={handleChange}
              variant="outlined"
              multiline
              rows={2}
              sx={{ borderRadius: 2 }}
            />
          </Grid>

          <Grid item xs={6}>
            <TextField
              fullWidth
              name="additional_tools"
              label="Additional Tools"
              value={form.additional_tools}
              onChange={handleChange}
              variant="outlined"
              multiline
              rows={2}
              sx={{ borderRadius: 2 }}
            />
          </Grid>
        </Grid>
      </Box>
    );
  }
);

PositionForm.displayName = "PositionForm";

export default PositionForm;
