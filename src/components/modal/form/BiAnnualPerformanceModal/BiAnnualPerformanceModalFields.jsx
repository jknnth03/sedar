import React, { useEffect, useState, useCallback } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { TextField, Box, Autocomplete, CircularProgress } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";
import { sectionTitleStyles } from "../DAForm/DAFormModal.styles";
import {
  useGetProbationaryEmployeesQuery,
  useGetPerformanceEvaluationPrefillQuery,
} from "../../../../features/api/forms/biAnnualPerformanceApi";
import FormSection, { KpiTable, CompetencyTable } from "./FormSection";

const BiAnnualPerformanceModalFields = ({
  isCreate,
  isReadOnly,
  currentMode,
}) => {
  const {
    control,
    watch,
    setValue,
    clearErrors,
    formState: { errors },
  } = useFormContext();

  const formValues = watch();
  const [kpisList, setKpisList] = useState([]);
  const [competencyItems, setCompetencyItems] = useState([]);
  const [ratingScales, setRatingScales] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [employeeSearchInput, setEmployeeSearchInput] = useState("");
  const [isAutocompleteOpen, setIsAutocompleteOpen] = useState(false);
  const [templateId, setTemplateId] = useState(null);
  const [kpiErrors, setKpiErrors] = useState({});

  const { data: employeesData, isLoading: isLoadingEmployees } =
    useGetProbationaryEmployeesQuery(undefined, {
      skip: !isCreate || !isAutocompleteOpen,
    });

  const selectedEmployeeId = isCreate
    ? watch("employee_id")
    : formValues.employee_id;

  const { data: prefillData, isLoading: isLoadingPrefill } =
    useGetPerformanceEvaluationPrefillQuery(
      { employee_id: selectedEmployeeId },
      { skip: !selectedEmployeeId }
    );

  useEffect(() => {
    if (!isCreate && formValues.kpis && Array.isArray(formValues.kpis)) {
      setKpisList(formValues.kpis);
    }
  }, [isCreate, formValues.kpis]);

  useEffect(() => {
    if (!isCreate && formValues.competency_assessment) {
      const compAssessment = formValues.competency_assessment;

      console.log("Loading competency assessment:", compAssessment);

      if (compAssessment.assessment_template_id) {
        setTemplateId(compAssessment.assessment_template_id);
      } else if (compAssessment.template_id) {
        setTemplateId(compAssessment.template_id);
      }

      if (compAssessment.template?.rating_scale) {
        setRatingScales(compAssessment.template.rating_scale);
      }

      if (compAssessment.sections && Array.isArray(compAssessment.sections)) {
        const allItems = [];
        compAssessment.sections.forEach((section) => {
          if (section.items && Array.isArray(section.items)) {
            section.items.forEach((item) => {
              if (item.children && Array.isArray(item.children)) {
                item.children.forEach((child) => {
                  if (child.is_ratable) {
                    allItems.push({
                      saved_answer_id: child.saved_answer?.id || null,
                      template_item_id:
                        child.source_template_item_id || child.id,
                      pa_item_id: child.id,
                      template_item_name: child.text,
                      rating_scale_id:
                        child.saved_answer?.rating_scale_id || null,
                      rating_scale_name:
                        child.saved_answer?.rating_scale?.label || null,
                    });
                  }
                });
              }
            });
          }
        });
        console.log("Processed items from sections:", allItems);
        if (allItems.length > 0) {
          setCompetencyItems(allItems);
        }
      } else if (
        compAssessment.answers &&
        Array.isArray(compAssessment.answers) &&
        compAssessment.answers.length > 0
      ) {
        console.log("Loading from answers:", compAssessment.answers);
        setCompetencyItems(compAssessment.answers);
      }
    }
  }, [isCreate, formValues.competency_assessment]);

  useEffect(() => {
    if (prefillData?.result && isCreate) {
      if (prefillData.result.employee) {
        const empData = prefillData.result.employee;
        setValue("employee_code", empData.id_number);
        setValue("employee_name", empData.full_name);
        setValue("position_title", empData.position_title);
      }

      if (prefillData.result.kpis && Array.isArray(prefillData.result.kpis)) {
        const formattedKpis = prefillData.result.kpis.map((kpi) => ({
          source_kpi_id: kpi.source_kpi_id,
          objective_id: kpi.objective_id,
          objective_name: kpi.objective_name || "",
          deliverable: kpi.deliverable || "",
          distribution_percentage: kpi.distribution_percentage || 0,
          target_percentage: kpi.target_percentage || 0,
          actual_performance: "",
          remarks: "",
        }));
        setKpisList(formattedKpis);
        setValue("kpis", formattedKpis);
      }

      setValue("demerits", []);

      if (prefillData.result.competency_template) {
        const template = prefillData.result.competency_template;
        const compTemplateId = template.id;
        setTemplateId(compTemplateId);

        if (template.rating_scale && Array.isArray(template.rating_scale)) {
          setRatingScales(template.rating_scale);
        }

        if (template.sections) {
          const allItems = [];
          template.sections.forEach((section) => {
            if (section.items && Array.isArray(section.items)) {
              section.items.forEach((item) => {
                if (item.children && Array.isArray(item.children)) {
                  item.children.forEach((child) => {
                    if (child.is_ratable) {
                      allItems.push({
                        template_item_id: child.id,
                        template_item_name: child.text,
                        rating_scale_id: null,
                        rating_scale_name: null,
                      });
                    }
                  });
                }
              });
            }
          });
          setCompetencyItems(allItems);
          setValue("competency_assessment", {
            template_id: compTemplateId,
            answers: allItems,
          });
        }
      }
    }
  }, [prefillData, setValue, isCreate]);

  useEffect(() => {
    if (prefillData?.result && !isCreate) {
      if (prefillData.result.competency_template?.rating_scale) {
        setRatingScales(prefillData.result.competency_template.rating_scale);
      }
    }
  }, [prefillData, isCreate]);

  const handleEmployeeChange = (event, newValue) => {
    setSelectedEmployee(newValue);
    if (newValue) {
      setValue("employee_id", newValue.id);
      setValue("employee_name", newValue.employee_name || newValue.full_name);
      setValue("employee_code", "");
      setValue(
        "position_title",
        newValue.position_title || newValue.position?.title?.name
      );
    } else {
      setValue("employee_id", null);
      setValue("employee_name", "");
      setValue("employee_code", "");
      setValue("position_title", "");
      setValue("kpis", []);
      setValue("demerits", []);
      setKpisList([]);
      setCompetencyItems([]);
      setRatingScales([]);
      setTemplateId(null);
      setSelectedEmployee(null);
      setKpiErrors({});
    }
  };

  const validateNumericInput = (value) => {
    if (value === "" || value === null || value === undefined) {
      return true;
    }
    return /^[0-9]+(\.[0-9]+)?$/.test(value);
  };

  const handleKpiFieldChange = useCallback(
    (index, field, value) => {
      if (field === "actual_performance") {
        const isValid = validateNumericInput(value);

        // Update error state
        setKpiErrors((prev) => {
          const newErrors = { ...prev };
          if (!newErrors[index]) {
            newErrors[index] = {};
          }

          // Set error only if value is not empty and not valid
          // Clear error if value is empty or valid
          newErrors[index].actual_performance =
            value !== "" && !isValid ? "Only numbers are allowed" : null;

          return newErrors;
        });

        // Prevent updating the field if invalid (but allow empty)
        if (value !== "" && !isValid) return;

        // Clear react-hook-form error for this field if it exists
        if (isValid || value === "") {
          clearErrors(`kpis.${index}.actual_performance`);
        }
      }

      const updatedKpis = [...kpisList];
      updatedKpis[index] = { ...updatedKpis[index], [field]: value };
      setKpisList(updatedKpis);
      setValue("kpis", updatedKpis, { shouldValidate: false });
    },
    [kpisList, setValue, clearErrors]
  );

  const handleCompetencyRatingChange = useCallback(
    (index, ratingScaleId) => {
      const parsedId = ratingScaleId === "" ? null : parseInt(ratingScaleId);
      const selectedRating = ratingScales.find((r) => r.id === parsedId);

      setCompetencyItems((prevItems) => {
        const updatedItems = [...prevItems];
        updatedItems[index] = {
          ...updatedItems[index],
          rating_scale_id: parsedId,
          rating_scale_name: selectedRating?.label || null,
        };
        setValue(
          "competency_assessment",
          { template_id: templateId, answers: updatedItems },
          { shouldValidate: false }
        );
        return updatedItems;
      });
    },
    [setValue, ratingScales, templateId]
  );

  const employeeOptions = Array.isArray(employeesData?.result?.data)
    ? employeesData.result.data
    : [];

  const getKpiErrorMessage = () => {
    if (
      errors?.kpis &&
      typeof errors.kpis === "object" &&
      !Array.isArray(errors.kpis) &&
      errors.kpis.message
    ) {
      return errors.kpis.message;
    }
    return null;
  };

  const getCompetencyErrorMessage = () => {
    if (
      errors?.competency_assessment?.answers &&
      typeof errors.competency_assessment.answers === "object" &&
      !Array.isArray(errors.competency_assessment.answers) &&
      errors.competency_assessment.answers.message
    ) {
      return errors.competency_assessment.answers.message;
    }
    return null;
  };

  return (
    <Box sx={{ height: "100%" }}>
      <FormSection title="EMPLOYEE INFORMATION">
        <Box sx={{ p: 0, pb: 0, borderRadius: 2 }}>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "1fr",
                md: "repeat(3, 1fr)",
              },
              "@media (min-width: 900px)": {
                gridTemplateColumns: "repeat(3, 1fr)",
              },
              gap: 2,
              mb: 2,
            }}>
            <Box>
              {isCreate ? (
                <Controller
                  name="employee_id"
                  control={control}
                  rules={{ required: "Employee is required" }}
                  render={({ field }) => (
                    <Autocomplete
                      {...field}
                      options={employeeOptions}
                      getOptionLabel={(option) => option?.employee_name || ""}
                      value={selectedEmployee}
                      onChange={handleEmployeeChange}
                      inputValue={employeeSearchInput}
                      onInputChange={(event, newInputValue) =>
                        setEmployeeSearchInput(newInputValue)
                      }
                      onOpen={() => setIsAutocompleteOpen(true)}
                      onClose={() => setIsAutocompleteOpen(false)}
                      loading={isLoadingEmployees}
                      isOptionEqualToValue={(option, value) =>
                        option?.id === value?.id
                      }
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="EMPLOYEE NAME"
                          error={!!errors.employee_id}
                          helperText={errors.employee_id?.message}
                          fullWidth
                          sx={{ bgcolor: "white" }}
                          InputProps={{
                            ...params.InputProps,
                            endAdornment: (
                              <>
                                {isLoadingEmployees ? (
                                  <CircularProgress size={20} />
                                ) : null}
                                {params.InputProps.endAdornment}
                              </>
                            ),
                          }}
                        />
                      )}
                      disabled={isReadOnly}
                    />
                  )}
                />
              ) : (
                <TextField
                  label="EMPLOYEE NAME"
                  value={formValues.employee_name || ""}
                  disabled
                  fullWidth
                  sx={{ bgcolor: "white" }}
                />
              )}
            </Box>
            <Box>
              <TextField
                label="ID NUMBER"
                value={formValues.employee_code || ""}
                disabled
                fullWidth
                sx={{ bgcolor: "white" }}
              />
            </Box>
            <Box>
              <TextField
                label="POSITION"
                value={formValues.position_title || ""}
                disabled
                fullWidth
                sx={{ bgcolor: "white" }}
              />
            </Box>
          </Box>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "1fr",
                md: "repeat(2, 1fr)",
              },
              "@media (min-width: 750px)": {
                gridTemplateColumns: "repeat(2, 1fr)",
              },
              gap: 2,
            }}>
            <Box>
              <Controller
                name="evaluation_period_start_date"
                control={control}
                rules={{ required: "Start date is required" }}
                render={({ field }) => (
                  <DatePicker
                    {...field}
                    value={
                      field.value && dayjs.isDayjs(field.value)
                        ? field.value
                        : field.value
                        ? dayjs(field.value)
                        : null
                    }
                    onChange={(date) => field.onChange(date)}
                    label="EVALUATION PERIOD START DATE"
                    disabled={isReadOnly}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        error: !!errors.evaluation_period_start_date,
                        helperText:
                          errors.evaluation_period_start_date?.message,
                        sx: { bgcolor: "white" },
                      },
                    }}
                  />
                )}
              />
            </Box>
            <Box>
              <Controller
                name="evaluation_period_end_date"
                control={control}
                rules={{ required: "End date is required" }}
                render={({ field }) => (
                  <DatePicker
                    {...field}
                    value={
                      field.value && dayjs.isDayjs(field.value)
                        ? field.value
                        : field.value
                        ? dayjs(field.value)
                        : null
                    }
                    onChange={(date) => field.onChange(date)}
                    label="EVALUATION PERIOD END DATE"
                    disabled={isReadOnly}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        error: !!errors.evaluation_period_end_date,
                        helperText: errors.evaluation_period_end_date?.message,
                        sx: { bgcolor: "white" },
                      },
                    }}
                  />
                )}
              />
            </Box>
          </Box>
        </Box>
      </FormSection>

      <FormSection
        title="PART I - KEY PERFORMANCE INDICATORS"
        isLoading={isLoadingPrefill}
        loadingMessage="Loading Key Performance Indicators..."
        isEmpty={kpisList.length === 0}
        emptyMessage={
          isCreate && !selectedEmployee
            ? "Please select an employee to load KPIs"
            : "No Key Performance Indicators available"
        }
        error={getKpiErrorMessage()}>
        <KpiTable
          kpisList={kpisList}
          isReadOnly={isReadOnly}
          onFieldChange={handleKpiFieldChange}
          errors={errors}
          kpiErrors={kpiErrors}
        />
      </FormSection>

      <FormSection title="PART II - DISCUSSIONS">
        <Box sx={{ p: 0, pb: 0, borderRadius: 2 }}>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "1fr",
                md: "repeat(3, 1fr)",
              },
              "@media (min-width: 900px)": {
                gridTemplateColumns: "repeat(3, 1fr)",
              },
              gap: 2,
            }}>
            <Box>
              <Controller
                name="strengths_discussion"
                control={control}
                rules={{ required: "Strengths is required" }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="STRENGTHS"
                    multiline
                    rows={4}
                    disabled={isReadOnly}
                    fullWidth
                    error={!!errors.strengths_discussion}
                    helperText={errors.strengths_discussion?.message}
                    sx={{ bgcolor: "white" }}
                  />
                )}
              />
            </Box>
            <Box>
              <Controller
                name="development_discussion"
                control={control}
                rules={{ required: "Development areas is required" }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="DEVELOPMENT AREAS"
                    multiline
                    rows={4}
                    disabled={isReadOnly}
                    fullWidth
                    error={!!errors.development_discussion}
                    helperText={errors.development_discussion?.message}
                    sx={{ bgcolor: "white" }}
                  />
                )}
              />
            </Box>
            <Box>
              <Controller
                name="learning_needs_discussion"
                control={control}
                rules={{ required: "Learning needs is required" }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="LEARNING NEEDS"
                    multiline
                    rows={4}
                    disabled={isReadOnly}
                    fullWidth
                    error={!!errors.learning_needs_discussion}
                    helperText={errors.learning_needs_discussion?.message}
                    sx={{ bgcolor: "white" }}
                  />
                )}
              />
            </Box>
          </Box>
        </Box>
      </FormSection>

      <FormSection
        title="PART III - COMPETENCY ASSESSMENT"
        isLoading={isLoadingPrefill}
        loadingMessage="Loading Competency Assessment..."
        isEmpty={competencyItems.length === 0}
        emptyMessage={
          isCreate && !selectedEmployee
            ? "Please select an employee and evaluation period"
            : "No Competency Assessment available"
        }
        error={getCompetencyErrorMessage()}>
        <CompetencyTable
          competencyItems={competencyItems}
          isReadOnly={isReadOnly}
          ratingScales={ratingScales}
          onRatingChange={handleCompetencyRatingChange}
          errors={errors}
        />
      </FormSection>
    </Box>
  );
};

export default BiAnnualPerformanceModalFields;
