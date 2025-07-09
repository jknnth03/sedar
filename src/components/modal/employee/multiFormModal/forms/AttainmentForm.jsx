import React, {
  useState,
  useEffect,
  forwardRef,
  useImperativeHandle,
  useMemo,
  useRef,
} from "react";
import { useFormContext, Controller } from "react-hook-form";
import {
  TextField,
  Grid,
  Box,
  FormControl,
  FormHelperText,
  Alert,
  Button,
  IconButton,
  Autocomplete,
} from "@mui/material";
import { CloudUpload, Delete } from "@mui/icons-material";
import { useLazyGetAllShowProgramsQuery } from "../../../../../features/api/extras/programsApi";
import { useLazyGetAllShowHonorTitlesQuery } from "../../../../../features/api/extras/honortitlesApi";
import { useLazyGetAllShowDegreesQuery } from "../../../../../features/api/extras/degreesApi";
import { useLazyGetAllShowAttainmentsQuery } from "../../../../../features/api/extras/attainmentsApi";
import "./General.scss";

const AttainmentForm = forwardRef(
  (
    {
      selectedAttainment,
      showArchived = false,
      isLoading,
      onValidationChange,
      mode = "create",
    },
    ref
  ) => {
    const {
      control,
      formState: { errors },
      setValue,
      watch,
      trigger,
      getValues,
    } = useFormContext();

    const watchedValues = watch();
    const hasInitializedData = useRef(false);

    const [errorMessage, setErrorMessage] = useState(null);
    const [dropdownsLoaded, setDropdownsLoaded] = useState({
      programs: false,
      degrees: false,
      honors: false,
      attainments: false,
    });

    const [
      fetchPrograms,
      { data: programsData, isLoading: programsLoading, error: programsError },
    ] = useLazyGetAllShowProgramsQuery();

    const [
      fetchDegrees,
      { data: degreesData, isLoading: degreesLoading, error: degreesError },
    ] = useLazyGetAllShowDegreesQuery();

    const [
      fetchHonors,
      { data: honorsData, isLoading: honorsLoading, error: honorsError },
    ] = useLazyGetAllShowHonorTitlesQuery();

    const [
      fetchAttainments,
      {
        data: attainmentsData,
        isLoading: attainmentsLoading,
        error: attainmentsError,
      },
    ] = useLazyGetAllShowAttainmentsQuery();

    useEffect(() => {
      if (mode === "edit" || mode === "view") {
        const fetchParams = {
          page: 1,
          per_page: 1000,
          status: showArchived ? "all" : "active",
        };

        fetchPrograms(fetchParams);
        fetchDegrees(fetchParams);
        fetchHonors(fetchParams);
        fetchAttainments(fetchParams);
        setDropdownsLoaded({
          programs: true,
          degrees: true,
          honors: true,
          attainments: true,
        });
      }
    }, [
      mode,
      showArchived,
      fetchPrograms,
      fetchDegrees,
      fetchHonors,
      fetchAttainments,
    ]);

    const handleDropdownFocus = (dropdownName) => {
      if (dropdownsLoaded[dropdownName]) return;

      const fetchParams = {
        page: 1,
        per_page: 1000,
        status: showArchived ? "all" : "active",
      };

      switch (dropdownName) {
        case "programs":
          fetchPrograms(fetchParams);
          break;
        case "degrees":
          fetchDegrees(fetchParams);
          break;
        case "honors":
          fetchHonors(fetchParams);
          break;
        case "attainments":
          fetchAttainments(fetchParams);
          break;
      }

      setDropdownsLoaded((prev) => ({ ...prev, [dropdownName]: true }));
    };

    const normalizeApiData = (data) => {
      if (!data) return [];
      if (Array.isArray(data)) return data;
      if (data.result && Array.isArray(data.result)) return data.result;
      if (data.data && Array.isArray(data.data)) return data.data;
      if (data.result?.data && Array.isArray(data.result.data))
        return data.result.data;
      if (data.data?.data && Array.isArray(data.data.data))
        return data.data.data;
      if (data.items && Array.isArray(data.items)) return data.items;
      if (data.results && Array.isArray(data.results)) return data.results;
      return [];
    };

    const programs = useMemo(
      () => normalizeApiData(programsData),
      [programsData]
    );
    const degrees = useMemo(() => normalizeApiData(degreesData), [degreesData]);
    const honors = useMemo(() => normalizeApiData(honorsData), [honorsData]);
    const attainments = useMemo(
      () => normalizeApiData(attainmentsData),
      [attainmentsData]
    );

    const getOptionLabel = (option, type) => {
      if (!option) return "";

      switch (type) {
        case "program":
          return (
            option.program_name ||
            option.name ||
            option.title ||
            option.code ||
            `Program ${option.id}`
          );
        case "degree":
          return (
            option.degree_name ||
            option.name ||
            option.title ||
            option.code ||
            `Degree ${option.id}`
          );
        case "honor":
          return (
            option.honor_name ||
            option.name ||
            option.title ||
            option.code ||
            `Honor ${option.id}`
          );
        case "attainment":
          return (
            option.attainment_name ||
            option.name ||
            option.title ||
            option.code ||
            `Attainment ${option.id}`
          );
        default:
          return option.name || option.title || `ID: ${option.id}`;
      }
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

    const extractRelationshipValue = (data, fieldPaths) => {
      if (!data) return null;

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

        if (value !== null && value !== undefined) {
          if (typeof value === "object" && value.id) {
            return value;
          } else if (typeof value === "string" || typeof value === "number") {
            const collections = { programs, degrees, honors, attainments };
            for (const collection of Object.values(collections)) {
              const found = collection.find((item) => item.id == value);
              if (found) return found;
            }
          }
        }
      }

      return null;
    };

    useEffect(() => {
      if (
        mode === "edit" &&
        selectedAttainment &&
        !hasInitializedData.current
      ) {
        const attainmentData =
          selectedAttainment.attainment_info || selectedAttainment;
        const currentValues = getValues();

        if (!currentValues.employee_id) {
          setValue(
            "employee_id",
            extractFieldValue(attainmentData, [
              "employee_id",
              "emp_id",
              "employee.id",
            ])
          );
        }

        if (!currentValues.program_id) {
          const programValue = extractRelationshipValue(attainmentData, [
            "program_id",
            "program.id",
            "program",
          ]);
          if (programValue) setValue("program_id", programValue);
        }

        if (!currentValues.degree_id) {
          const degreeValue = extractRelationshipValue(attainmentData, [
            "degree_id",
            "degree.id",
            "degree",
          ]);
          if (degreeValue) setValue("degree_id", degreeValue);
        }

        if (!currentValues.honor_title_id) {
          const honorValue = extractRelationshipValue(attainmentData, [
            "honor_title_id",
            "honor_title.id",
            "honor_title",
            "honor.id",
            "honor",
          ]);
          if (honorValue) setValue("honor_title_id", honorValue);
        }

        if (!currentValues.attainment_id) {
          const attainmentValue = extractRelationshipValue(attainmentData, [
            "attainment_id",
            "attainment.id",
            "attainment",
          ]);
          if (attainmentValue) setValue("attainment_id", attainmentValue);
        }

        if (!currentValues.academic_year_from) {
          setValue(
            "academic_year_from",
            extractFieldValue(attainmentData, [
              "academic_year_from",
              "year_from",
              "start_year",
            ])
          );
        }

        if (!currentValues.academic_year_to) {
          setValue(
            "academic_year_to",
            extractFieldValue(attainmentData, [
              "academic_year_to",
              "year_to",
              "end_year",
            ])
          );
        }

        if (!currentValues.gpa) {
          setValue(
            "gpa",
            extractFieldValue(attainmentData, [
              "gpa",
              "grade_point_average",
              "grade",
            ])
          );
        }

        if (!currentValues.institution) {
          setValue(
            "institution",
            extractFieldValue(attainmentData, [
              "institution",
              "school",
              "university",
            ])
          );
        }

        if (!currentValues.attainment_remarks) {
          setValue(
            "attainment_remarks",
            extractFieldValue(attainmentData, [
              "attainment_remarks",
              "remarks",
              "notes",
              "comments",
            ])
          );
        }

        setValue("attainment_attachment", null);
        setErrorMessage(null);
        hasInitializedData.current = true;
      }
    }, [
      selectedAttainment,
      mode,
      setValue,
      getValues,
      programs,
      degrees,
      honors,
      attainments,
    ]);

    useEffect(() => {
      if (mode === "create") {
        hasInitializedData.current = false;
      }
    }, [mode, selectedAttainment?.id]);

    useEffect(() => {
      if (onValidationChange) {
        onValidationChange();
      }
    }, [watchedValues, onValidationChange]);

    const validateFile = (file) => {
      if (!file) return { isValid: true, error: null };

      // First check if it's a File object
      if (!(file instanceof File)) {
        return {
          isValid: false,
          error: "The attainment attachment field must be a file.",
        };
      }

      if (file.size > 10 * 1024 * 1024) {
        return { isValid: false, error: "File size must be less than 10MB" };
      }

      const allowedTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "image/jpeg",
        "image/png",
      ];

      const allowedExtensions = [
        ".pdf",
        ".doc",
        ".docx",
        ".jpg",
        ".jpeg",
        ".png",
      ];
      const fileName = file.name.toLowerCase();
      const hasValidExtension = allowedExtensions.some((ext) =>
        fileName.endsWith(ext)
      );

      if (!allowedTypes.includes(fileType) && !hasValidExtension) {
        return {
          isValid: false,
          error: "File must be a PDF, DOC, DOCX, JPG, or PNG",
        };
      }

      return { isValid: true, error: null };
    };
    const handleFileChange = (e) => {
      const file = e.target.files[0];
      if (file) {
        const validation = validateFile(file);

        if (!validation.isValid) {
          setErrorMessage(validation.error);
          e.target.value = "";
          setValue("attainment_attachment", null);
          return;
        }

        setValue("attainment_attachment", file);
        setErrorMessage(null);
      }
    };

    const handleFileRemove = () => {
      setValue("attainment_attachment", null);
      const fileInput = document.getElementById("attainment-file-input");
      if (fileInput) {
        fileInput.value = "";
      }
      setErrorMessage(null);
    };

    const isFormValid = () => {
      const requiredFields = [
        "program_id",
        "degree_id",
        "honor_title_id",
        "attainment_id",
      ];

      const hasRequiredFields = requiredFields.every((field) => {
        const value = watchedValues[field];
        return value && (typeof value === "object" ? value.id : value);
      });

      if (watchedValues.attainment_attachment) {
        const validation = validateFile(watchedValues.attainment_attachment);
        if (!validation.isValid) {
          return false;
        }
      }

      return hasRequiredFields;
    };

    const validateForm = async () => {
      const isValid = await trigger();

      if (!isValid) {
        setErrorMessage("Please fix the validation errors before submitting.");
        return false;
      }

      return true;
    };

    useImperativeHandle(ref, () => ({
      validateAndGetData: async () => {
        const isValid = await validateForm();
        if (isValid) {
          const submitData = {
            ...watchedValues,
            program_id:
              watchedValues.program_id?.id || watchedValues.program_id,
            degree_id: watchedValues.degree_id?.id || watchedValues.degree_id,
            honor_title_id:
              watchedValues.honor_title_id?.id || watchedValues.honor_title_id,
            attainment_id:
              watchedValues.attainment_id?.id ||
              watchedValues.attainment_id ||
              null,
            academic_year_from: watchedValues.academic_year_from || null,
            academic_year_to: watchedValues.academic_year_to || null,
            gpa: watchedValues.gpa || null,
            institution: watchedValues.institution || null,
            attainment_remarks: watchedValues.attainment_remarks || null,
            attainment_attachment:
              watchedValues.attainment_attachment instanceof File
                ? watchedValues.attainment_attachment
                : null,
          };
          return submitData;
        }
        return null;
      },
      isFormValid,
      resetForm: () => {
        setValue("employee_id", "");
        setValue("program_id", null);
        setValue("degree_id", null);
        setValue("honor_title_id", null);
        setValue("attainment_id", null);
        setValue("academic_year_from", "");
        setValue("academic_year_to", "");
        setValue("gpa", "");
        setValue("institution", "");
        setValue("attainment_remarks", "");
        setValue("attainment_attachment", null);
        setErrorMessage(null);
        const fileInput = document.getElementById("attainment-file-input");
        if (fileInput) {
          fileInput.value = "";
        }
      },
      validateForm,
      setErrorMessage,
    }));

    const currentYear = new Date().getFullYear();
    const isReadOnly = mode === "view";

    return (
      <Box className="general-form">
        {errorMessage && (
          <Alert severity="error" className="general-form__alert">
            {errorMessage}
          </Alert>
        )}

        {programsError && (
          <Alert severity="warning" className="general-form__alert">
            Failed to load programs from server.
          </Alert>
        )}

        {degreesError && (
          <Alert severity="warning" className="general-form__alert">
            Failed to load degrees from server.
          </Alert>
        )}

        {honorsError && (
          <Alert severity="warning" className="general-form__alert">
            Failed to load honor titles from server.
          </Alert>
        )}

        {attainmentsError && (
          <Alert severity="warning" className="general-form__alert">
            Failed to load attainments from server.
          </Alert>
        )}

        <Grid container spacing={2} className="general-form__grid">
          <Grid
            item
            xs={12}
            sm={3}
            sx={{ minWidth: "353px", maxWidth: "350px" }}>
            <Controller
              name="program_id"
              control={control}
              render={({ field: { onChange, value } }) => (
                <FormControl
                  fullWidth
                  variant="outlined"
                  disabled={isLoading || programsLoading || isReadOnly}
                  error={!!errors.program_id}
                  sx={{ width: "355px" }}>
                  <Autocomplete
                    onChange={(event, item) => {
                      if (!isReadOnly) {
                        onChange(item);
                      }
                    }}
                    value={value || null}
                    options={programs ?? []}
                    loading={programsLoading}
                    disabled={isLoading || isReadOnly}
                    getOptionLabel={(item) => getOptionLabel(item, "program")}
                    isOptionEqualToValue={(option, value) => {
                      if (!option || !value) return false;
                      return option.id === value.id;
                    }}
                    onOpen={() => {
                      if (!isReadOnly) {
                        handleDropdownFocus("programs");
                      }
                    }}
                    readOnly={isReadOnly}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label={
                          <>
                            Program <span style={{ color: "red" }}>*</span>
                          </>
                        }
                        error={!!errors.program_id}
                        helperText={errors.program_id?.message}
                        sx={{ borderRadius: 2 }}
                        InputProps={{
                          ...params.InputProps,
                          readOnly: isReadOnly,
                        }}
                      />
                    )}
                  />
                  {errors.program_id && (
                    <FormHelperText error>
                      {errors.program_id.message}
                    </FormHelperText>
                  )}
                </FormControl>
              )}
            />
          </Grid>

          <Grid
            item
            xs={12}
            sm={3}
            sx={{ minWidth: "353px", maxWidth: "350px" }}>
            <Controller
              name="degree_id"
              control={control}
              render={({ field: { onChange, value } }) => (
                <FormControl
                  fullWidth
                  variant="outlined"
                  disabled={isLoading || degreesLoading || isReadOnly}
                  error={!!errors.degree_id}
                  sx={{ width: "355px" }}>
                  <Autocomplete
                    onChange={(event, item) => {
                      if (!isReadOnly) {
                        onChange(item);
                      }
                    }}
                    value={value || null}
                    options={degrees ?? []}
                    loading={degreesLoading}
                    disabled={isLoading || isReadOnly}
                    getOptionLabel={(item) => getOptionLabel(item, "degree")}
                    isOptionEqualToValue={(option, value) => {
                      if (!option || !value) return false;
                      return option.id === value.id;
                    }}
                    onOpen={() => {
                      if (!isReadOnly) {
                        handleDropdownFocus("degrees");
                      }
                    }}
                    readOnly={isReadOnly}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label={
                          <>
                            Degree <span style={{ color: "red" }}>*</span>
                          </>
                        }
                        error={!!errors.degree_id}
                        helperText={errors.degree_id?.message}
                        sx={{ borderRadius: 2 }}
                        InputProps={{
                          ...params.InputProps,
                          readOnly: isReadOnly,
                        }}
                      />
                    )}
                  />
                  {errors.degree_id && (
                    <FormHelperText error>
                      {errors.degree_id.message}
                    </FormHelperText>
                  )}
                </FormControl>
              )}
            />
          </Grid>

          <Grid
            item
            xs={12}
            sm={3}
            sx={{ minWidth: "353px", maxWidth: "350px" }}>
            <Controller
              name="honor_title_id"
              control={control}
              render={({ field: { onChange, value } }) => (
                <FormControl
                  fullWidth
                  variant="outlined"
                  disabled={isLoading || honorsLoading || isReadOnly}
                  error={!!errors.honor_title_id}
                  sx={{ width: "355px" }}>
                  <Autocomplete
                    onChange={(event, item) => {
                      if (!isReadOnly) {
                        onChange(item);
                      }
                    }}
                    value={value || null}
                    options={honors ?? []}
                    loading={honorsLoading}
                    disabled={isLoading || isReadOnly}
                    getOptionLabel={(item) => getOptionLabel(item, "honor")}
                    isOptionEqualToValue={(option, value) => {
                      if (!option || !value) return false;
                      return option.id === value.id;
                    }}
                    onOpen={() => {
                      if (!isReadOnly) {
                        handleDropdownFocus("honors");
                      }
                    }}
                    readOnly={isReadOnly}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label={
                          <>
                            Honor Title <span style={{ color: "red" }}>*</span>
                          </>
                        }
                        error={!!errors.honor_title_id}
                        helperText={errors.honor_title_id?.message}
                        sx={{ borderRadius: 2 }}
                        InputProps={{
                          ...params.InputProps,
                          readOnly: isReadOnly,
                        }}
                      />
                    )}
                  />
                  {errors.honor_title_id && (
                    <FormHelperText error>
                      {errors.honor_title_id.message}
                    </FormHelperText>
                  )}
                </FormControl>
              )}
            />
          </Grid>

          <Grid
            item
            xs={12}
            sm={3}
            sx={{ minWidth: "353px", maxWidth: "350px" }}>
            <Controller
              name="attainment_id"
              control={control}
              render={({ field: { onChange, value } }) => (
                <FormControl
                  fullWidth
                  variant="outlined"
                  disabled={isLoading || attainmentsLoading || isReadOnly}
                  error={!!errors.attainment_id}>
                  <Autocomplete
                    onChange={(event, item) => {
                      if (!isReadOnly) {
                        onChange(item);
                      }
                    }}
                    value={value || null}
                    options={attainments ?? []}
                    loading={attainmentsLoading}
                    disabled={isLoading || isReadOnly}
                    getOptionLabel={(item) =>
                      getOptionLabel(item, "attainment")
                    }
                    isOptionEqualToValue={(option, value) => {
                      if (!option || !value) return false;
                      return option.id === value.id;
                    }}
                    onOpen={() => {
                      if (!isReadOnly) {
                        handleDropdownFocus("attainments");
                      }
                    }}
                    readOnly={isReadOnly}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label={
                          <>
                            Attainment <span style={{ color: "red" }}>*</span>
                          </>
                        }
                        error={!!errors.attainment_id}
                        helperText={errors.attainment_id?.message}
                        sx={{ borderRadius: 2 }}
                        InputProps={{
                          ...params.InputProps,
                          readOnly: isReadOnly,
                        }}
                      />
                    )}
                  />
                  {errors.attainment_id && (
                    <FormHelperText error>
                      {errors.attainment_id.message}
                    </FormHelperText>
                  )}
                </FormControl>
              )}
            />
          </Grid>

          <Grid
            item
            xs={12}
            sm={3}
            sx={{ minWidth: "353px", maxWidth: "350px" }}>
            <Controller
              name="academic_year_from"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Academic Year From (Optional)"
                  type="number"
                  variant="outlined"
                  fullWidth
                  disabled={isLoading || isReadOnly}
                  error={!!errors.academic_year_from}
                  helperText={errors.academic_year_from?.message}
                  inputProps={{
                    min: 1900,
                    max: currentYear,
                    readOnly: isReadOnly,
                  }}
                  className="general-form__text-field"
                />
              )}
            />
          </Grid>

          <Grid
            item
            xs={12}
            sm={3}
            sx={{ minWidth: "353px", maxWidth: "350px" }}>
            <Controller
              name="academic_year_to"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Academic Year To (Optional)"
                  type="number"
                  variant="outlined"
                  fullWidth
                  disabled={isLoading || isReadOnly}
                  error={!!errors.academic_year_to}
                  helperText={errors.academic_year_to?.message}
                  inputProps={{
                    min: watchedValues.academic_year_from || 1900,
                    max: new Date().getFullYear() + 10,
                    readOnly: isReadOnly,
                  }}
                  className="general-form__text-field"
                />
              )}
            />
          </Grid>

          <Grid
            item
            xs={12}
            sm={3}
            sx={{ minWidth: "353px", maxWidth: "350px" }}>
            <Controller
              name="gpa"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="GPA (Optional)"
                  type="number"
                  variant="outlined"
                  fullWidth
                  disabled={isLoading || isReadOnly}
                  error={!!errors.gpa}
                  helperText={errors.gpa?.message}
                  inputProps={{
                    min: 0,
                    max: 5,
                    step: 0.01,
                    readOnly: isReadOnly,
                  }}
                  className="general-form__text-field"
                />
              )}
            />
          </Grid>

          <Grid
            item
            xs={12}
            sm={3}
            sx={{ minWidth: "722px", maxWidth: "722px" }}>
            <Controller
              name="institution"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Institution (Optional)"
                  variant="outlined"
                  fullWidth
                  disabled={isLoading || isReadOnly}
                  error={!!errors.institution}
                  helperText={errors.institution?.message}
                  className="general-form__text-field"
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
            sx={{ minWidth: "1090px", maxWidth: "1090px" }}>
            <Controller
              name="attainment_remarks"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Attainment Remarks (Optional)"
                  variant="outlined"
                  fullWidth
                  disabled={isLoading || isReadOnly}
                  placeholder="Optional: Additional notes about this attainment"
                  InputProps={{
                    readOnly: isReadOnly,
                  }}
                />
              )}
            />
          </Grid>
          {!isReadOnly && (
            <Grid item xs={12} className="general-form__grid-item">
              <Box sx={{ display: "flex", flexDirection: "column" }}>
                <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                  <input
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    style={{ display: "none" }}
                    id="attainment-file-input"
                    type="file"
                    onChange={handleFileChange}
                    disabled={isLoading}
                  />
                  <label htmlFor="attainment-file-input" style={{ flex: 1 }}>
                    <Button
                      variant="outlined"
                      component="span"
                      startIcon={<CloudUpload />}
                      disabled={isLoading}
                      sx={{
                        height: "40px",
                        width: "1094px",
                        borderRadius: 2,
                        borderStyle: "dashed",
                        borderColor: errors.attainment_attachment
                          ? "error.main"
                          : "darkblue",
                        color: errors.attainment_attachment
                          ? "error.main"
                          : "darkblue",
                        "&:hover": {
                          borderColor: errors.attainment_attachment
                            ? "error.dark"
                            : "#0000CD",
                          backgroundColor: "action.hover",
                        },
                        "& .MuiButton-label": {
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        },
                      }}>
                      {watchedValues.attainment_attachment?.name ||
                        "Upload Attachment (PDF, DOC, DOCX, JPG, PNG)"}
                    </Button>
                  </label>

                  {watchedValues.attainment_attachment && (
                    <IconButton
                      onClick={handleFileRemove}
                      disabled={isLoading}
                      sx={{ color: "error.main" }}
                      title="Remove file">
                      <Delete />
                    </IconButton>
                  )}
                </Box>

                {errors.attainment_attachment && (
                  <FormHelperText error sx={{ mt: 0.5 }}>
                    {errors.attainment_attachment.message ||
                      "Invalid file format or size"}
                  </FormHelperText>
                )}
              </Box>
            </Grid>
          )}
        </Grid>
      </Box>
    );
  }
);

AttainmentForm.displayName = "AttainmentForm";

export default AttainmentForm;
