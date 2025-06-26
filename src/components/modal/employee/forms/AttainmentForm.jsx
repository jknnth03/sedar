import React, {
  useState,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from "react";
import {
  TextField,
  Grid,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Alert,
  Button,
  IconButton,
} from "@mui/material";
import { CloudUpload, Delete } from "@mui/icons-material";
import { useLazyGetAllShowProgramsQuery } from "../../../../features/api/extras/programsApi";
import { useLazyGetAllShowHonorTitlesQuery } from "../../../../features/api/extras/honortitlesApi";
import { useLazyGetAllShowDegreesQuery } from "../../../../features/api/extras/degreesApi";
import { useLazyGetAllShowAttainmentsQuery } from "../../../../features/api/extras/attainmentsApi";
import "./General.scss";

const AttainmentForm = forwardRef(
  (
    { selectedAttainment, showArchived = false, isLoading, onValidationChange },
    ref
  ) => {
    const [formData, setFormData] = useState({
      employee_id: "",
      program_id: "",
      degree_id: "",
      honor_title_id: "",
      attainment_id: "",
      academic_year_from: "",
      academic_year_to: "",
      gpa: "",
      institution: "",
      attainment_remarks: "",
      attainment_attachment: null,
    });

    const [errors, setErrors] = useState({});
    const [errorMessage, setErrorMessage] = useState(null);
    const [dropdownsLoaded, setDropdownsLoaded] = useState({
      programs: false,
      degrees: false,
      honors: false,
      attainments: false,
    });

    // Replace useGetAll... with useLazyGetAll... hooks
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

    // Auto-load all dropdowns when editing (selectedAttainment is provided)
    useEffect(() => {
      if (selectedAttainment) {
        const fetchParams = {
          page: 1,
          per_page: 1000,
          status: showArchived ? "all" : "active",
        };

        // Load all dropdowns when editing
        if (!dropdownsLoaded.programs) {
          fetchPrograms(fetchParams);
          setDropdownsLoaded((prev) => ({ ...prev, programs: true }));
        }
        if (!dropdownsLoaded.degrees) {
          fetchDegrees(fetchParams);
          setDropdownsLoaded((prev) => ({ ...prev, degrees: true }));
        }
        if (!dropdownsLoaded.honors) {
          fetchHonors(fetchParams);
          setDropdownsLoaded((prev) => ({ ...prev, honors: true }));
        }
        if (!dropdownsLoaded.attainments) {
          fetchAttainments(fetchParams);
          setDropdownsLoaded((prev) => ({ ...prev, attainments: true }));
        }
      }
    }, [
      selectedAttainment,
      showArchived,
      fetchPrograms,
      fetchDegrees,
      fetchHonors,
      fetchAttainments,
      dropdownsLoaded,
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
        default:
          break;
      }

      setDropdownsLoaded((prev) => ({ ...prev, [dropdownName]: true }));
    };

    const getDropdownOptions = (data) => {
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

    const programs = getDropdownOptions(programsData);
    const degrees = getDropdownOptions(degreesData);
    const honors = getDropdownOptions(honorsData);
    const attainments = getDropdownOptions(attainmentsData);

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

        if (value !== null && value !== undefined) {
          if (typeof value === "object" && value.id) {
            return value.id;
          } else if (typeof value === "string" || typeof value === "number") {
            return value;
          }
        }
      }

      return "";
    };

    useEffect(() => {
      if (selectedAttainment) {
        const attainmentData =
          selectedAttainment.attainment_info || selectedAttainment;

        setFormData({
          employee_id: extractFieldValue(attainmentData, [
            "employee_id",
            "emp_id",
            "employee.id",
          ]),
          program_id: extractRelationshipValue(attainmentData, [
            "program_id",
            "program.id",
            "program",
          ]),
          degree_id: extractRelationshipValue(attainmentData, [
            "degree_id",
            "degree.id",
            "degree",
          ]),
          honor_title_id: extractRelationshipValue(attainmentData, [
            "honor_title_id",
            "honor_title.id",
            "honor_title",
            "honor.id",
            "honor",
          ]),
          attainment_id: extractRelationshipValue(attainmentData, [
            "attainment_id",
            "attainment.id",
            "attainment",
          ]),
          academic_year_from: extractFieldValue(attainmentData, [
            "academic_year_from",
            "year_from",
            "start_year",
          ]),
          academic_year_to: extractFieldValue(attainmentData, [
            "academic_year_to",
            "year_to",
            "end_year",
          ]),
          gpa: extractFieldValue(attainmentData, [
            "gpa",
            "grade_point_average",
            "grade",
          ]),
          institution: extractFieldValue(attainmentData, [
            "institution",
            "school",
            "university",
          ]),
          attainment_remarks: extractFieldValue(attainmentData, [
            "attainment_remarks",
            "remarks",
            "notes",
            "comments",
          ]),
          attainment_attachment: null,
        });
        setErrors({});
        setErrorMessage(null);
      } else {
        setFormData({
          employee_id: "",
          program_id: "",
          degree_id: "",
          honor_title_id: "",
          attainment_id: "",
          academic_year_from: "",
          academic_year_to: "",
          gpa: "",
          institution: "",
          attainment_remarks: "",
          attainment_attachment: null,
        });
        setErrors({});
        setErrorMessage(null);
      }
    }, [selectedAttainment]);

    useEffect(() => {
      if (onValidationChange) {
        onValidationChange();
      }
    }, [formData, onValidationChange]);

    const handleChange = (e) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));

      if (errors[name]) {
        setErrors((prev) => ({ ...prev, [name]: false }));
      }

      if (errorMessage) {
        setErrorMessage(null);
      }
    };

    const validateFile = (file) => {
      if (!file) return { isValid: true, error: null };

      if (file.size > 10 * 1024 * 1024) {
        return { isValid: false, error: "File size must be less than 10MB" };
      }

      const allowedTypes = ["application/pdf"];
      const fileType = file.type;
      const fileName = file.name.toLowerCase();
      const hasValidExtension = fileName.endsWith(".pdf");

      if (!allowedTypes.includes(fileType) && !hasValidExtension) {
        return { isValid: false, error: "Only PDF files are allowed" };
      }

      if (hasValidExtension) {
        return { isValid: true, error: null };
      }

      if (allowedTypes.includes(fileType)) {
        return { isValid: true, error: null };
      }

      return { isValid: false, error: "Only PDF files are allowed" };
    };

    const handleFileChange = (e) => {
      const file = e.target.files[0];
      if (file) {
        const validation = validateFile(file);

        if (!validation.isValid) {
          setErrors((prev) => ({ ...prev, attainment_attachment: true }));
          setErrorMessage(validation.error);
          e.target.value = "";
          return;
        }

        setFormData((prev) => ({ ...prev, attainment_attachment: file }));

        if (errors.attainment_attachment) {
          setErrors((prev) => ({ ...prev, attainment_attachment: false }));
        }
        if (errorMessage) {
          setErrorMessage(null);
        }
      }
    };

    const handleFileRemove = () => {
      setFormData((prev) => ({ ...prev, attainment_attachment: null }));
      const fileInput = document.getElementById("attainment-file-input");
      if (fileInput) {
        fileInput.value = "";
      }
      if (errors.attainment_attachment) {
        setErrors((prev) => ({ ...prev, attainment_attachment: false }));
      }
      if (errorMessage) {
        setErrorMessage(null);
      }
    };

    const isFormValid = () => {
      const requiredFields = [
        "program_id",
        "degree_id",
        "honor_title_id",
        "attainment_id",
      ];

      const hasRequiredFields = requiredFields.every((field) => {
        return formData[field] && formData[field].toString().trim() !== "";
      });

      if (formData.attainment_attachment) {
        const validation = validateFile(formData.attainment_attachment);
        if (!validation.isValid) {
          return false;
        }
      }

      return hasRequiredFields;
    };

    const validateForm = () => {
      const requiredFields = [
        "program_id",
        "degree_id",
        "honor_title_id",
        "attainment_id",
      ];
      const newErrors = {};

      requiredFields.forEach((field) => {
        if (!formData[field] || formData[field].toString().trim() === "") {
          newErrors[field] = true;
        }
      });

      const currentYear = new Date().getFullYear();

      if (formData.academic_year_from) {
        const fromYear = parseInt(formData.academic_year_from);
        if (isNaN(fromYear) || fromYear > currentYear) {
          newErrors.academic_year_from = true;
        }
      }

      if (formData.academic_year_to) {
        const toYear = parseInt(formData.academic_year_to);
        if (isNaN(toYear)) {
          newErrors.academic_year_to = true;
        }
      }

      if (formData.academic_year_from && formData.academic_year_to) {
        const fromYear = parseInt(formData.academic_year_from);
        const toYear = parseInt(formData.academic_year_to);
        if (!isNaN(fromYear) && !isNaN(toYear) && toYear < fromYear) {
          newErrors.academic_year_to = true;
        }
      }

      if (
        formData.gpa &&
        (isNaN(Number(formData.gpa)) ||
          Number(formData.gpa) < 0 ||
          Number(formData.gpa) > 5)
      ) {
        newErrors.gpa = true;
      }

      if (formData.attainment_attachment) {
        const validation = validateFile(formData.attainment_attachment);
        if (!validation.isValid) {
          newErrors.attainment_attachment = true;
          setErrorMessage(validation.error);
        }
      }

      setErrors(newErrors);

      if (Object.keys(newErrors).length > 0) {
        if (!errorMessage) {
          setErrorMessage(
            "Please fix the validation errors before submitting."
          );
        }
        return false;
      }

      return true;
    };

    useImperativeHandle(ref, () => ({
      validateAndGetData: () => {
        if (validateForm()) {
          const submitData = {
            ...formData,
            attainment_id: formData.attainment_id || null,
            academic_year_from: formData.academic_year_from || null,
            academic_year_to: formData.academic_year_to || null,
            gpa: formData.gpa || null,
            institution: formData.institution || null,
            attainment_remarks: formData.attainment_remarks || null,
            attainment_attachment:
              formData.attainment_attachment instanceof File
                ? formData.attainment_attachment
                : null,
          };
          return submitData;
        }
        return null;
      },
      isFormValid,
      getData: () => {
        const submitData = {
          ...formData,
          attainment_id: formData.attainment_id || null,
          academic_year_from: formData.academic_year_from || null,
          academic_year_to: formData.academic_year_to || null,
          gpa: formData.gpa || null,
          institution: formData.institution || null,
          attainment_remarks: formData.attainment_remarks || null,
          attainment_attachment:
            formData.attainment_attachment instanceof File
              ? formData.attainment_attachment
              : null,
        };
        return submitData;
      },
      getFormData: () => {
        const submitData = {
          ...formData,
          attainment_id: formData.attainment_id || null,
          academic_year_from: formData.academic_year_from || null,
          academic_year_to: formData.academic_year_to || null,
          gpa: formData.gpa || null,
          institution: formData.institution || null,
          attainment_remarks: formData.attainment_remarks || null,
          attainment_attachment:
            formData.attainment_attachment instanceof File
              ? formData.attainment_attachment
              : null,
        };
        return submitData;
      },
      setFormData: (data) => {
        setFormData({
          ...data,
          attainment_attachment: null,
        });
      },
      resetForm: () => {
        setFormData({
          employee_id: "",
          program_id: "",
          degree_id: "",
          honor_title_id: "",
          attainment_id: "",
          academic_year_from: "",
          academic_year_to: "",
          gpa: "",
          institution: "",
          attainment_remarks: "",
          attainment_attachment: null,
        });
        setErrors({});
        setErrorMessage(null);
        const fileInput = document.getElementById("attainment-file-input");
        if (fileInput) {
          fileInput.value = "";
        }
      },
      validateForm,
      setErrors,
      setErrorMessage,
    }));

    const getOptionDisplay = (option, type) => {
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

    const currentYear = new Date().getFullYear();

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
          <Grid item xs={3} className="general-form__grid-item">
            <FormControl
              fullWidth
              variant="outlined"
              disabled={isLoading || programsLoading}
              error={!!errors.program_id}
              className="general-form__select"
              sx={{ width: "355px" }}>
              <InputLabel>
                Program <span style={{ color: "red" }}>*</span>
              </InputLabel>
              <Select
                name="program_id"
                value={formData.program_id}
                onChange={handleChange}
                onOpen={() => handleDropdownFocus("programs")}
                label="Program *"
                sx={{ borderRadius: 2 }}>
                <MenuItem value="">
                  <em>Select Program</em>
                </MenuItem>
                {programs.map((program, index) => (
                  <MenuItem key={program.id || index} value={program.id}>
                    {getOptionDisplay(program, "program")}
                  </MenuItem>
                ))}
              </Select>
              {errors.program_id && (
                <FormHelperText error>Program is required</FormHelperText>
              )}
            </FormControl>
          </Grid>

          <Grid item xs={3} className="general-form__grid-item">
            <FormControl
              fullWidth
              variant="outlined"
              disabled={isLoading || degreesLoading}
              error={!!errors.degree_id}
              className="general-form__select"
              sx={{ width: "355px" }}>
              <InputLabel>
                Degree <span style={{ color: "red" }}>*</span>
              </InputLabel>
              <Select
                name="degree_id"
                value={formData.degree_id}
                onChange={handleChange}
                onOpen={() => handleDropdownFocus("degrees")}
                label="Degree *"
                sx={{ borderRadius: 2 }}>
                <MenuItem value="">
                  <em>Select Degree</em>
                </MenuItem>
                {degrees.map((degree, index) => (
                  <MenuItem key={degree.id || index} value={degree.id}>
                    {getOptionDisplay(degree, "degree")}
                  </MenuItem>
                ))}
              </Select>
              {errors.degree_id && (
                <FormHelperText error>Degree is required</FormHelperText>
              )}
            </FormControl>
          </Grid>

          <Grid item xs={3} className="general-form__grid-item">
            <FormControl
              fullWidth
              variant="outlined"
              disabled={isLoading || honorsLoading}
              error={!!errors.honor_title_id}
              className="general-form__select"
              sx={{ width: "355px" }}>
              <InputLabel>
                Honor Title <span style={{ color: "red" }}>*</span>
              </InputLabel>
              <Select
                name="honor_title_id"
                value={formData.honor_title_id}
                onChange={handleChange}
                onOpen={() => handleDropdownFocus("honors")}
                label="Honor Title *"
                sx={{ borderRadius: 2 }}>
                <MenuItem value="">
                  <em>Select Honor Title</em>
                </MenuItem>
                {honors.map((honor, index) => (
                  <MenuItem key={honor.id || index} value={honor.id}>
                    {getOptionDisplay(honor, "honor")}
                  </MenuItem>
                ))}
              </Select>
              {errors.honor_title_id && (
                <FormHelperText error>Honor Title is required</FormHelperText>
              )}
            </FormControl>
          </Grid>

          <Grid item xs={3} className="general-form__grid-item">
            <FormControl
              fullWidth
              variant="outlined"
              disabled={isLoading || attainmentsLoading}
              error={!!errors.attainment_id}
              className="general-form__select"
              sx={{ width: "355px" }}>
              <InputLabel>
                Attainment <span style={{ color: "red" }}>*</span>
              </InputLabel>
              <Select
                name="attainment_id"
                value={formData.attainment_id}
                onChange={handleChange}
                onOpen={() => handleDropdownFocus("attainments")}
                label="Attainment *"
                sx={{ borderRadius: 2 }}>
                <MenuItem value="">
                  <em>Select Attainment</em>
                </MenuItem>
                {attainments.map((attainment, index) => (
                  <MenuItem key={attainment.id || index} value={attainment.id}>
                    {getOptionDisplay(attainment, "attainment")}
                  </MenuItem>
                ))}
              </Select>
              {errors.attainment_id && (
                <FormHelperText error>Attainment is required</FormHelperText>
              )}
            </FormControl>
          </Grid>

          <Grid item xs={3} className="general-form__grid-item">
            <TextField
              label="Academic Year From (Optional)"
              name="academic_year_from"
              type="number"
              variant="outlined"
              fullWidth
              value={formData.academic_year_from}
              onChange={handleChange}
              disabled={isLoading}
              error={!!errors.academic_year_from}
              helperText={
                errors.academic_year_from
                  ? "Year cannot be greater than current year"
                  : ""
              }
              inputProps={{
                min: 1900,
                max: currentYear,
              }}
              className="general-form__text-field"
              sx={{
                width: "355px",
                "& .MuiOutlinedInput-root": { borderRadius: 2 },
              }}
            />
          </Grid>

          <Grid item xs={3} className="general-form__grid-item">
            <TextField
              label="Academic Year To (Optional)"
              name="academic_year_to"
              type="number"
              variant="outlined"
              fullWidth
              value={formData.academic_year_to}
              onChange={handleChange}
              disabled={isLoading}
              error={!!errors.academic_year_to}
              helperText={
                errors.academic_year_to
                  ? "Year must be greater than or equal to 'From' year"
                  : ""
              }
              inputProps={{
                min: formData.academic_year_from || 1900,
                max: new Date().getFullYear() + 10,
              }}
              className="general-form__text-field"
              sx={{
                width: "355px",
                "& .MuiOutlinedInput-root": { borderRadius: 2 },
              }}
            />
          </Grid>

          <Grid item xs={3} className="general-form__grid-item">
            <TextField
              label="GPA (Optional)"
              name="gpa"
              type="number"
              variant="outlined"
              fullWidth
              value={formData.gpa}
              onChange={handleChange}
              disabled={isLoading}
              error={!!errors.gpa}
              helperText={errors.gpa ? "GPA must be between 0 and 5" : ""}
              inputProps={{
                min: 0,
                max: 5,
                step: 0.01,
              }}
              className="general-form__text-field"
              sx={{
                width: "355px",
                "& .MuiOutlinedInput-root": { borderRadius: 2 },
              }}
            />
          </Grid>

          <Grid item xs={3} className="general-form__grid-item">
            <TextField
              label="Institution (Optional)"
              name="institution"
              variant="outlined"
              fullWidth
              value={formData.institution}
              onChange={handleChange}
              disabled={isLoading}
              error={!!errors.institution}
              className="general-form__text-field"
              sx={{
                width: "355px",
                "& .MuiOutlinedInput-root": { borderRadius: 2 },
              }}
            />
          </Grid>

          <Grid item xs={3} className="general-form__grid-item">
            <TextField
              label="Attainment Remarks (Optional)"
              name="attainment_remarks"
              variant="outlined"
              fullWidth
              value={formData.attainment_remarks}
              onChange={handleChange}
              disabled={isLoading}
              placeholder="Optional: Additional notes about this attainment"
              sx={{
                width: "355px",
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                },
                "& .MuiInputLabel-root": {
                  color: "rgb(33, 61, 112)",
                  "&.Mui-focused": {
                    color: "rgb(33, 61, 112)",
                  },
                },
                "& .MuiFormLabel-root": {
                  color: "rgb(33, 61, 112)",
                  "&.Mui-focused": {
                    color: "rgb(33, 61, 112)",
                  },
                },
              }}
            />
          </Grid>

          <Grid item xs={12} className="general-form__grid-item">
            <Box sx={{ display: "flex", flexDirection: "column" }}>
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                <input
                  accept=".pdf"
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
                    }}></Button>
                </label>

                {formData.attainment_attachment && (
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
                  {errorMessage || "Invalid file format or size"}
                </FormHelperText>
              )}
            </Box>
          </Grid>
        </Grid>
      </Box>
    );
  }
);

AttainmentForm.displayName = "AttainmentForm";

export default AttainmentForm;
