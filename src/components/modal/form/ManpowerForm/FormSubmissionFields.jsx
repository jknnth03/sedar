import { useState, useMemo, useCallback, useEffect } from "react";
import { useFormContext, Controller } from "react-hook-form";
import {
  Box,
  TextField,
  Autocomplete,
  MenuItem,
  Chip,
  CircularProgress,
  Alert,
  Typography,
} from "@mui/material";
import { useLazyGetManpowerOptionsQuery } from "../../../../features/api/masterlist/positionsApi";
import { useLazyGetAllJobLevelsQuery } from "../../../../features/api/masterlist/jobLevelsApi";
import { useLazyGetAllRequisitionsQuery } from "../../../../features/api/extras/requisitionsApi";
import { useLazyGetAllEmployeesToBeReplacedQuery } from "../../../../features/api/employee/mainApi";
import { expectedSalaryInputProps } from "../../../../schema/approver/formSubmissionSchema";
import FileViewerDialog from "./FileViewerDialog";
import AttachmentField from "./AttachmentField";
import { formStyles } from "./FormSubmissionFieldStyles";
import { useLazyGetMrfMovementSourcesQuery } from "../../../../features/api/forms/mrfApi";

const MOVEMENT_REQUISITION_NAME = "REPLACEMENT DUE TO EMPLOYEE MOVEMENT";
const ADDITIONAL_REQUISITION_NAME = "ADDITIONAL MANPOWER";

const safeStringRender = (value, fallback = "") => {
  if (typeof value === "string") return value;
  if (typeof value === "number") return value.toString();
  if (value && typeof value === "object") return fallback;
  return value || fallback;
};

const formatPayFrequency = (value) => {
  if (!value || typeof value !== "string") return "";
  const firstWord = value.trim().split(/\s+/)[0] || "";
  return firstWord.charAt(0).toUpperCase() + firstWord.slice(1).toLowerCase();
};

const getJobLevelLabel = (option) => {
  if (!option) return "";
  if (option.label) return safeStringRender(option.label);
  const name = safeStringRender(option.name);
  const frequency = formatPayFrequency(option.pay_frequency);
  return frequency ? `${name} · ${frequency}` : name;
};

const getPositionLabel = (option) => {
  if (!option) return "";
  const titleWithUnit = safeStringRender(option.title_with_unit);
  if (titleWithUnit) return titleWithUnit;
  const title =
    option.title && typeof option.title === "object"
      ? option.title.name
      : option.title;
  return safeStringRender(title) || safeStringRender(option.name);
};

const getRequisitionHelperText = (requisitionName) => {
  if (!requisitionName) return "";
  const name = requisitionName.toUpperCase();
  if (name === ADDITIONAL_REQUISITION_NAME) {
    return "A new headcount for the position";
  }
  if (name === MOVEMENT_REQUISITION_NAME) {
    return "Refills the position someone moved out of";
  }
  if (name.includes("REPLACEMENT")) {
    return "Refills the position of someone leaving";
  }
  return "";
};

const MOVE_STATUS_INFO = {
  IN_PROGRESS: {
    status: "DA in progress",
    hrCanReceive: "Only after the move is final (MDA approved)",
  },
  FINAL: {
    status: "Final (MDA approved)",
    hrCanReceive: "Now, the move is final",
  },
};

const FormSubmissionFields = ({
  mode,
  selectedEntry,
  disabled = false,
  approverPreview = null,
}) => {
  const {
    control,
    formState: { errors },
    setValue,
    getValues,
    watch,
    clearErrors,
    register,
  } = useFormContext();

  const [fileViewerOpen, setFileViewerOpen] = useState(false);
  const [currentFormSubmissionId, setCurrentFormSubmissionId] = useState(null);
  const [currentAttachmentIndex, setCurrentAttachmentIndex] = useState(null);
  const [dropdownsLoaded, setDropdownsLoaded] = useState({
    requisitions: false,
    positions: false,
    jobLevels: false,
    employees: false,
    movementPosition: false,
  });
  const [isLoadingEmployees, setIsLoadingEmployees] = useState(false);

  const watchedRequisitionType = watch("requisition_type_id");
  const watchedPositionId = watch("position_id");
  const watchedSourceId = watch("source_mrf_submission_id");
  const watchedMovementEmployee = watch("movement_employee_id");
  const watchedMovementNewPosition = watch("movement_new_position_id");

  const isReadOnly = mode === "view" || disabled;
  const isEditMode = mode === "edit";
  const isCreateMode = mode === "create";
  const isViewMode = mode === "view" || disabled;
  const shouldLoadDropdowns = mode === "create" || mode === "edit";

  const isMovementRequisition =
    watchedRequisitionType?.name === MOVEMENT_REQUISITION_NAME;
  const isAdditionalRequisition =
    watchedRequisitionType?.name === ADDITIONAL_REQUISITION_NAME;

  const isReplacementDueToEmployeeMovement = useCallback(
    () => isMovementRequisition,
    [isMovementRequisition],
  );

  const isAdditionalManpower = useCallback(
    () => isAdditionalRequisition,
    [isAdditionalRequisition],
  );

  const [
    triggerGetPositions,
    { data: positionsData, isLoading: positionsLoading },
  ] = useLazyGetManpowerOptionsQuery();

  const [
    triggerGetJobLevels,
    { data: jobLevelsData, isLoading: jobLevelsLoading },
  ] = useLazyGetAllJobLevelsQuery();

  const [
    triggerGetRequisitions,
    { data: requisitionsData, isLoading: requisitionsLoading },
  ] = useLazyGetAllRequisitionsQuery();

  const [
    triggerGetEmployees,
    { data: employeesData, isLoading: employeesLoading },
  ] = useLazyGetAllEmployeesToBeReplacedQuery();

  const [
    triggerGetMovementSources,
    { data: movementSourcesData, isFetching: movementSourcesLoading },
  ] = useLazyGetMrfMovementSourcesQuery();

  const normalizeApiData = useCallback((data) => {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    if (data.result && Array.isArray(data.result.data)) return data.result.data;
    if (data.result && Array.isArray(data.result)) return data.result;
    if (Array.isArray(data.data)) return data.data;
    return [];
  }, []);

  const positions = useMemo(
    () => normalizeApiData(positionsData),
    [positionsData, normalizeApiData],
  );
  const jobLevels = useMemo(
    () => normalizeApiData(jobLevelsData),
    [jobLevelsData, normalizeApiData],
  );
  const requisitions = useMemo(
    () => normalizeApiData(requisitionsData),
    [requisitionsData, normalizeApiData],
  );
  const employees = useMemo(
    () => normalizeApiData(employeesData),
    [employeesData, normalizeApiData],
  );
  const movementSources = useMemo(
    () => normalizeApiData(movementSourcesData),
    [movementSourcesData, normalizeApiData],
  );

  const selectedMovementSource = useMemo(() => {
    if (watchedSourceId !== undefined && watchedSourceId !== null) {
      const found = movementSources.find(
        (source) => source.source_mrf_submission_id === watchedSourceId,
      );
      if (found) return found;
    }
    if (watchedMovementEmployee) {
      const employeeName = safeStringRender(
        watchedMovementEmployee.full_name ||
          watchedMovementEmployee.name ||
          watchedMovementEmployee.employee_name,
      );
      const newPositionTitle = getPositionLabel(watchedMovementNewPosition);
      return {
        source_mrf_submission_id: watchedSourceId ?? null,
        label: newPositionTitle
          ? `${employeeName} · moved to ${newPositionTitle}`
          : employeeName,
        employee: watchedMovementEmployee,
      };
    }
    return null;
  }, [
    watchedSourceId,
    watchedMovementEmployee,
    watchedMovementNewPosition,
    movementSources,
  ]);

  const moveStatusInfo = useMemo(() => {
    const moveStatus = selectedMovementSource?.move_status;
    if (!moveStatus) return null;
    return (
      MOVE_STATUS_INFO[moveStatus] || {
        status: safeStringRender(moveStatus),
        hrCanReceive: "",
      }
    );
  }, [selectedMovementSource]);

  const approverSteps = useMemo(() => {
    const source = Array.isArray(approverPreview)
      ? approverPreview
      : watchedPositionId?.approvers;
    if (!Array.isArray(source)) return [];
    return source
      .map((approver) =>
        safeStringRender(
          typeof approver === "string"
            ? approver
            : approver?.title || approver?.name || approver?.position?.title,
        ),
      )
      .filter(Boolean);
  }, [approverPreview, watchedPositionId]);

  const attachmentInstructions = useMemo(() => {
    const requisitionName = watchedRequisitionType?.name;
    if (!requisitionName) return null;

    const normalizedName = requisitionName.toLowerCase();

    const instructionMap = {
      resigned: {
        attachments: [
          "1. Resignation Letter",
          "2. KPI for the position",
          "3. Job Profile for the position",
        ],
        remarks: "Need this 3 before moving to the next step",
      },
      additional: {
        attachments: [
          "1. Organizational Structure",
          "2. KPI for the position",
          "3. Job Profile for the position",
        ],
        remarks: "Need this 3 before moving to the next step",
      },
      "additional manpower": {
        attachments: [
          "1. Organizational Structure",
          "2. KPI for the position",
          "3. Job Profile for the position",
        ],
        remarks: "Need this 3 before moving to the next step",
      },
      "end of contract": {
        attachments: [
          "1. Performance Evaluation",
          "2. KPI for the position",
          "3. Job Profile for the position",
        ],
        remarks: "Need this 3 before moving to the next step",
      },
      retirement: {
        attachments: [
          "1. KPI for the position",
          "2. Job Profile for the position",
        ],
        remarks: "Need this 2 before moving to the next step",
      },
      "terminated (dismissed, backout, blacklisted)": {
        attachments: ["1. Incident Report", "2. NOD if available"],
        remarks: null,
      },
      awol: { attachments: ["1. Incident Report"], remarks: null },
      "returned to agency": {
        attachments: ["1. Incident Report"],
        remarks: null,
      },
      deceased: { attachments: ["-"], remarks: null },
    };

    const matchedKey = Object.keys(instructionMap).find((key) =>
      normalizedName.includes(key),
    );

    return matchedKey ? instructionMap[matchedKey] : null;
  }, [watchedRequisitionType]);

  useEffect(() => {
    register("source_mrf_submission_id");
  }, [register]);

  const populateReplacementInfo = useCallback(
    (replacement, oldPosition = null) => {
      if (!replacement) return;

      const employeeData = replacement.employee;
      const replacementType = String(replacement.type || "").toUpperCase();

      if (replacementType.includes("MOVEMENT")) {
        const newPositionData =
          replacement.to_position || replacement.new_position;
        const sourceId =
          replacement.source_mrf?.id ?? replacement.source_mrf_submission_id;

        if (oldPosition) {
          setValue("position_id", oldPosition, { shouldValidate: false });
        }
        if (employeeData) {
          setValue(
            "movement_employee_id",
            {
              id: employeeData.id,
              full_name: employeeData.full_name,
              employee_code: employeeData.employee_code,
            },
            { shouldValidate: false },
          );
        }
        if (newPositionData) {
          setValue(
            "movement_new_position_id",
            {
              id: newPositionData.id,
              code: newPositionData.code,
              title: newPositionData.title,
              title_with_unit: newPositionData.title_with_unit,
              charging: newPositionData.charging,
            },
            { shouldValidate: false },
          );
        }
        if (sourceId) {
          setValue("source_mrf_submission_id", sourceId, {
            shouldValidate: false,
          });
        }
        if (replacement.reason_for_change) {
          setValue(
            "movement_reason_for_change",
            replacement.reason_for_change,
            {
              shouldValidate: false,
            },
          );
        }
        setValue(
          "movement_is_da",
          Boolean(replacement.da_start_date || replacement.da_end_date),
          { shouldValidate: false },
        );
        if (replacement.da_start_date) {
          setValue("movement_da_start_date", replacement.da_start_date, {
            shouldValidate: false,
          });
        }
        if (replacement.da_end_date) {
          setValue("movement_da_end_date", replacement.da_end_date, {
            shouldValidate: false,
          });
        }
      } else if (employeeData) {
        setValue(
          "employee_to_be_replaced_id",
          {
            id: employeeData.id,
            full_name: employeeData.full_name,
            employee_code: employeeData.employee_code,
          },
          { shouldValidate: false },
        );
      }
    },
    [setValue],
  );

  useEffect(() => {
    if (mode !== "view") return;

    const root = selectedEntry?.result || selectedEntry;
    const request = root?.request;
    if (!request) return;

    const replacement = root.replacement || null;

    if (request.position) {
      setValue("position_id", request.position, { shouldValidate: false });
    }
    if (request.job_level) {
      setValue("job_level_id", request.job_level, { shouldValidate: false });
    }
    if (request.requisition_type) {
      setValue("requisition_type_id", request.requisition_type, {
        shouldValidate: false,
      });
    }
    if (request.expected_salary)
      setValue("expected_salary", request.expected_salary, {
        shouldValidate: false,
      });
    if (request.employment_type)
      setValue("employment_type", request.employment_type, {
        shouldValidate: false,
      });
    if (request.justification)
      setValue("justification", request.justification, {
        shouldValidate: false,
      });
    if (request.remarks)
      setValue("remarks", request.remarks, { shouldValidate: false });

    const existingAttachments = request.attachments;
    if (
      existingAttachments &&
      Array.isArray(existingAttachments) &&
      existingAttachments.length > 0
    ) {
      setValue(
        "attachments",
        existingAttachments.map((att) => ({
          id: `existing_${att.id}`,
          file_attachment: null,
          existing_file_name: att.filename || "Unknown file",
          existing_file_path: att.download_url || null,
          existing_file_id: att.id,
          is_new_file: false,
          keep_existing: true,
        })),
        { shouldValidate: false },
      );
    }

    const isMovementReplacement = String(replacement?.type || "")
      .toUpperCase()
      .includes("MOVEMENT");

    if (
      !isMovementReplacement &&
      request.position?.id &&
      request.requisition_type?.id
    ) {
      triggerGetEmployees({
        position_id: request.position.id,
        requisition_type_id: request.requisition_type.id,
        ...(root?.id && { current_mrf_id: root.id }),
      }).then(() => {
        populateReplacementInfo(
          replacement,
          request.position || replacement?.from_position,
        );
      });
    } else {
      populateReplacementInfo(
        replacement,
        request.position || replacement?.from_position,
      );
    }
  }, [
    mode,
    selectedEntry,
    setValue,
    triggerGetEmployees,
    populateReplacementInfo,
  ]);

  useEffect(() => {
    if (isCreateMode && isMovementRequisition) {
      triggerGetMovementSources();
    }
  }, [isCreateMode, isMovementRequisition, triggerGetMovementSources]);

  useEffect(() => {
    const loadEmployees = async () => {
      if (
        watchedPositionId?.id &&
        watchedRequisitionType?.id &&
        !isEditMode &&
        !isMovementRequisition &&
        !isAdditionalRequisition
      ) {
        setIsLoadingEmployees(true);
        await triggerGetEmployees({
          position_id: watchedPositionId.id,
          requisition_type_id: watchedRequisitionType.id,
          ...(selectedEntry?.id && { current_mrf_id: selectedEntry.id }),
        });
        setIsLoadingEmployees(false);
      }
    };
    loadEmployees();
  }, [
    watchedRequisitionType?.id,
    watchedPositionId?.id,
    isEditMode,
    isMovementRequisition,
    isAdditionalRequisition,
    triggerGetEmployees,
    selectedEntry?.id,
  ]);

  const handleDropdownFocus = useCallback(
    (dropdownName) => {
      if (!shouldLoadDropdowns || dropdownsLoaded[dropdownName]) return;
      setDropdownsLoaded((prev) => ({ ...prev, [dropdownName]: true }));
      switch (dropdownName) {
        case "requisitions":
          triggerGetRequisitions();
          break;
        case "positions":
        case "movementPosition":
          triggerGetPositions();
          break;
        case "jobLevels":
          triggerGetJobLevels();
          break;
        default:
          break;
      }
    },
    [
      dropdownsLoaded,
      shouldLoadDropdowns,
      triggerGetRequisitions,
      triggerGetPositions,
      triggerGetJobLevels,
    ],
  );

  const handleRequisitionChange = useCallback(
    (onChange, item) => {
      if (isReadOnly || isEditMode) return;
      onChange(item);
      if (item) {
        setValue("employee_to_be_replaced_id", null, { shouldValidate: false });
        setValue("movement_employee_id", null, { shouldValidate: false });
        setValue("source_mrf_submission_id", null, { shouldValidate: false });
        setValue("position_id", null, { shouldValidate: false });
        setValue("movement_new_position_id", null, { shouldValidate: false });
        setValue("job_level_id", null, { shouldValidate: false });
        setValue("expected_salary", "", { shouldValidate: false });
        setValue("movement_reason_for_change", "", { shouldValidate: false });
        setValue("movement_is_da", false, { shouldValidate: false });
        setDropdownsLoaded((prev) => ({
          ...prev,
          employees: false,
        }));
      }
    },
    [isReadOnly, isEditMode, setValue],
  );

  const handlePositionChange = useCallback(
    (onChange, item) => {
      if (isReadOnly || isEditMode) return;
      onChange(item);
      setValue("employee_to_be_replaced_id", null, { shouldValidate: false });
      setValue("movement_employee_id", null, { shouldValidate: false });
      setValue("job_level_id", item?.job_level || null, {
        shouldValidate: !!item,
      });
      setValue("expected_salary", item?.expected_salary ?? "", {
        shouldValidate: !!item,
      });
      setDropdownsLoaded((prev) => ({
        ...prev,
        employees: false,
      }));
    },
    [isReadOnly, isEditMode, setValue],
  );

  const handleMovementSourceChange = useCallback(
    (onChange, item) => {
      if (isReadOnly || isEditMode) return;
      onChange(item?.employee || null);
      setValue(
        "source_mrf_submission_id",
        item?.source_mrf_submission_id ?? null,
        { shouldValidate: false },
      );
      setValue("position_id", item?.position || null, {
        shouldValidate: !!item,
      });
      setValue("movement_new_position_id", item?.new_position || null, {
        shouldValidate: !!item,
      });
      setValue("job_level_id", item?.job_level || null, {
        shouldValidate: !!item,
      });
      setValue("expected_salary", item?.expected_salary ?? "", {
        shouldValidate: !!item,
      });
      setValue("movement_is_da", false, { shouldValidate: false });
      if (item && !getValues("movement_reason_for_change")) {
        setValue("movement_reason_for_change", "Movement", {
          shouldValidate: true,
        });
      }
    },
    [isReadOnly, isEditMode, setValue, getValues],
  );

  const handleFileViewerOpen = useCallback(
    (index) => {
      const formSubmissionId = selectedEntry?.id;
      if (formSubmissionId) {
        setCurrentFormSubmissionId(formSubmissionId);
        setCurrentAttachmentIndex(index);
        setFileViewerOpen(true);
      }
    },
    [selectedEntry?.id],
  );

  const handleFileViewerClose = useCallback(() => {
    setFileViewerOpen(false);
    setCurrentFormSubmissionId(null);
    setCurrentAttachmentIndex(null);
  }, []);

  const handleEmploymentTypeChange = useCallback(
    (event) => {
      if (disabled) return;
      const value = event.target.value;
      setValue("employment_type", value, { shouldValidate: false });
      if (value && value !== "") clearErrors("employment_type");
    },
    [disabled, setValue, clearErrors],
  );

  const handleReasonForChangeChange = useCallback(
    (event) => {
      if (disabled) return;
      const value = event.target.value;
      setValue("movement_reason_for_change", value, { shouldValidate: false });
      if (value && value !== "") clearErrors("movement_reason_for_change");
    },
    [disabled, setValue, clearErrors],
  );

  const getErrorMessage = useCallback((error) => {
    if (!error) return "";
    if (typeof error.message === "string") return error.message;
    if (typeof error === "string") return error;
    if (error && typeof error === "object") return "Validation error";
    return "";
  }, []);

  const StyledTextField = useCallback(
    ({ label, required = false, ...props }) => (
      <TextField
        {...props}
        label={
          required ? (
            <span>
              {safeStringRender(label)}{" "}
              <span style={formStyles?.requiredAsterisk?.(isViewMode) || {}}>
                *
              </span>
            </span>
          ) : (
            safeStringRender(label)
          )
        }
      />
    ),
    [isViewMode],
  );

  const employmentTypeOptions = useMemo(
    () => ["PROBATIONARY", "PROJECT BASED", "AGENCY HIRED"],
    [],
  );

  const reasonForChangeOptions = useMemo(
    () => [
      "Movement",
      "PROMOTION",
      "DEMOTION",
      "TRANSFER",
      "REASSIGNMENT",
      "LATERAL MOVE",
      "ACTING CAPACITY",
      "SECONDMENT",
    ],
    [],
  );

  const positionPrerequisiteMessage =
    !watchedPositionId || !watchedRequisitionType
      ? "Please select Position and Requisition Type first"
      : "";

  const positionTitleForApprovers = getPositionLabel(watchedPositionId);

  const entryRoot = selectedEntry?.result || selectedEntry;
  const entryOldPosition =
    entryRoot?.request?.position || entryRoot?.replacement?.from_position;

  return (
    <>
      <Box sx={{ width: "100%", ...(formStyles?.container || {}) }}>
        <Box sx={{ mb: 3 }}>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)" },
              gap: 2,
            }}>
            <Box>
              <Controller
                name="requisition_type_id"
                control={control}
                render={({ field: { onChange, value } }) => (
                  <Autocomplete
                    onChange={(event, item) =>
                      handleRequisitionChange(onChange, item)
                    }
                    onOpen={() => handleDropdownFocus("requisitions")}
                    value={value || null}
                    disabled={isReadOnly || isEditMode}
                    options={requisitions}
                    loading={requisitionsLoading}
                    getOptionLabel={(option) => safeStringRender(option?.name)}
                    isOptionEqualToValue={(option, value) => {
                      if (!option || !value) return false;
                      return option.id === value.id;
                    }}
                    disablePortal
                    renderInput={(params) => (
                      <StyledTextField
                        {...params}
                        label="Requisition Type"
                        required={true}
                        fullWidth
                        error={!!errors.requisition_type_id}
                        helperText={
                          getErrorMessage(errors.requisition_type_id) ||
                          getRequisitionHelperText(watchedRequisitionType?.name)
                        }
                        sx={
                          formStyles?.autocompleteTextField?.(
                            isReadOnly,
                            isEditMode,
                          ) || {}
                        }
                        InputProps={{
                          ...params.InputProps,
                          endAdornment: (
                            <>
                              {requisitionsLoading && (
                                <CircularProgress color="inherit" size={20} />
                              )}
                              {params.InputProps.endAdornment}
                            </>
                          ),
                        }}
                      />
                    )}
                    noOptionsText={
                      requisitionsLoading
                        ? "Loading requisitions..."
                        : "No requisitions found"
                    }
                  />
                )}
              />
            </Box>

            {isReplacementDueToEmployeeMovement() ? (
              <>
                <Box>
                  <Controller
                    name="movement_employee_id"
                    control={control}
                    render={({ field: { onChange } }) => (
                      <Autocomplete
                        onChange={(event, item) =>
                          handleMovementSourceChange(onChange, item)
                        }
                        value={selectedMovementSource}
                        disabled={isReadOnly || isEditMode}
                        options={movementSources}
                        loading={movementSourcesLoading}
                        getOptionLabel={(option) =>
                          safeStringRender(
                            option?.label || option?.employee?.full_name,
                          )
                        }
                        isOptionEqualToValue={(option, value) => {
                          if (!option || !value) return false;
                          if (
                            option.source_mrf_submission_id != null &&
                            value.source_mrf_submission_id != null
                          ) {
                            return (
                              option.source_mrf_submission_id ===
                              value.source_mrf_submission_id
                            );
                          }
                          return option.employee?.id === value.employee?.id;
                        }}
                        disablePortal
                        renderInput={(params) => (
                          <StyledTextField
                            {...params}
                            label="Select Employee"
                            required={true}
                            fullWidth
                            error={!!errors.movement_employee_id}
                            helperText={
                              getErrorMessage(errors.movement_employee_id) ||
                              "People who moved out of positions you can request for. One MRF per move."
                            }
                            sx={
                              formStyles?.autocompleteTextField?.(
                                isReadOnly,
                                isEditMode,
                              ) || {}
                            }
                            InputProps={{
                              ...params.InputProps,
                              endAdornment: (
                                <>
                                  {movementSourcesLoading && (
                                    <CircularProgress
                                      color="inherit"
                                      size={20}
                                    />
                                  )}
                                  {params.InputProps.endAdornment}
                                </>
                              ),
                            }}
                          />
                        )}
                        noOptionsText={
                          movementSourcesLoading
                            ? "Loading employees..."
                            : "No employees have moved out of your positions"
                        }
                      />
                    )}
                  />
                </Box>

                <Box>
                  <Controller
                    name="position_id"
                    control={control}
                    render={({ field: { value } }) => (
                      <StyledTextField
                        label="Position"
                        required={true}
                        fullWidth
                        value={
                          getPositionLabel(value) ||
                          getPositionLabel(watchedPositionId) ||
                          (isCreateMode
                            ? ""
                            : getPositionLabel(entryOldPosition))
                        }
                        disabled
                        error={!!errors.position_id}
                        helperText={getErrorMessage(errors.position_id)}
                        sx={
                          formStyles?.autocompleteTextField?.(
                            true,
                            isEditMode,
                          ) || {}
                        }
                      />
                    )}
                  />
                </Box>

                <Box>
                  <Controller
                    name="movement_new_position_id"
                    control={control}
                    render={({ field: { value } }) => (
                      <StyledTextField
                        label="New Position"
                        required={true}
                        fullWidth
                        value={getPositionLabel(value)}
                        disabled
                        error={!!errors.movement_new_position_id}
                        helperText={getErrorMessage(
                          errors.movement_new_position_id,
                        )}
                        sx={formStyles?.textField?.(true) || {}}
                      />
                    )}
                  />
                </Box>
              </>
            ) : (
              <>
                <Box>
                  <Controller
                    name="position_id"
                    control={control}
                    render={({ field: { onChange, value } }) => (
                      <Autocomplete
                        onChange={(event, item) =>
                          handlePositionChange(onChange, item)
                        }
                        onOpen={() => handleDropdownFocus("positions")}
                        value={value || null}
                        disabled={
                          isReadOnly || isEditMode || !watchedRequisitionType
                        }
                        options={positions}
                        loading={positionsLoading}
                        getOptionLabel={(option) => getPositionLabel(option)}
                        isOptionEqualToValue={(option, value) => {
                          if (!option || !value) return false;
                          return option.id === value.id;
                        }}
                        disablePortal
                        renderInput={(params) => (
                          <StyledTextField
                            {...params}
                            label="Position"
                            required={true}
                            fullWidth
                            error={!!errors.position_id}
                            helperText={
                              getErrorMessage(errors.position_id) ||
                              "Positions you can request for. Job Level and Expected Salary fill in from it."
                            }
                            sx={
                              formStyles?.autocompleteTextField?.(
                                isReadOnly,
                                isEditMode,
                              ) || {}
                            }
                            InputProps={{
                              ...params.InputProps,
                              endAdornment: (
                                <>
                                  {positionsLoading && (
                                    <CircularProgress
                                      color="inherit"
                                      size={20}
                                    />
                                  )}
                                  {params.InputProps.endAdornment}
                                </>
                              ),
                            }}
                          />
                        )}
                        noOptionsText={
                          positionsLoading
                            ? "Loading positions..."
                            : "No positions found"
                        }
                      />
                    )}
                  />
                </Box>

                {!isAdditionalManpower() && (
                  <Box>
                    <Controller
                      name="employee_to_be_replaced_id"
                      control={control}
                      render={({ field: { onChange, value } }) => (
                        <Autocomplete
                          onChange={(event, item) => {
                            if (isReadOnly || isEditMode) return;
                            onChange(item);
                          }}
                          value={value || null}
                          disabled={
                            isReadOnly ||
                            isEditMode ||
                            !watchedPositionId ||
                            !watchedRequisitionType
                          }
                          options={employees}
                          loading={isLoadingEmployees || employeesLoading}
                          getOptionLabel={(option) =>
                            safeStringRender(
                              option?.full_name ||
                                option?.name ||
                                option?.employee_name,
                            )
                          }
                          isOptionEqualToValue={(option, value) => {
                            if (!option || !value) return false;
                            return option.id === value.id;
                          }}
                          disablePortal
                          renderInput={(params) => (
                            <StyledTextField
                              {...params}
                              label="Employee to be Replaced"
                              required={true}
                              fullWidth
                              error={!!errors.employee_to_be_replaced_id}
                              helperText={
                                getErrorMessage(
                                  errors.employee_to_be_replaced_id,
                                ) ||
                                positionPrerequisiteMessage ||
                                "The employee leaving this position"
                              }
                              sx={formStyles?.textField?.() || {}}
                              InputProps={{
                                ...params.InputProps,
                                endAdornment: (
                                  <>
                                    {(isLoadingEmployees ||
                                      employeesLoading) && (
                                      <CircularProgress
                                        color="inherit"
                                        size={20}
                                      />
                                    )}
                                    {params.InputProps.endAdornment}
                                  </>
                                ),
                              }}
                            />
                          )}
                          noOptionsText={
                            isLoadingEmployees || employeesLoading
                              ? "Loading employees..."
                              : !watchedPositionId || !watchedRequisitionType
                                ? "Select position and requisition type first"
                                : "No employees found"
                          }
                        />
                      )}
                    />
                  </Box>
                )}
              </>
            )}

            <Box>
              <Controller
                name="job_level_id"
                control={control}
                render={({ field: { onChange, value } }) => (
                  <Autocomplete
                    onChange={(event, item) => {
                      if (isReadOnly) return;
                      onChange(item);
                    }}
                    onOpen={() => handleDropdownFocus("jobLevels")}
                    value={value || null}
                    disabled={isReadOnly}
                    options={jobLevels}
                    loading={jobLevelsLoading}
                    getOptionLabel={(option) => getJobLevelLabel(option)}
                    isOptionEqualToValue={(option, value) => {
                      if (!option || !value) return false;
                      return option.id === value.id;
                    }}
                    disablePortal
                    renderInput={(params) => (
                      <StyledTextField
                        {...params}
                        label="Job Level"
                        required={true}
                        fullWidth
                        error={!!errors.job_level_id}
                        helperText={
                          getErrorMessage(errors.job_level_id) ||
                          (isReplacementDueToEmployeeMovement()
                            ? "Defaults to the old position's masterlist job level"
                            : "Defaults to the position's masterlist job level")
                        }
                        sx={formStyles?.textField?.(isReadOnly) || {}}
                        InputProps={{
                          ...params.InputProps,
                          endAdornment: (
                            <>
                              {jobLevelsLoading && (
                                <CircularProgress color="inherit" size={20} />
                              )}
                              {params.InputProps.endAdornment}
                            </>
                          ),
                        }}
                      />
                    )}
                    noOptionsText={
                      jobLevelsLoading
                        ? "Loading job levels..."
                        : "No job levels found"
                    }
                  />
                )}
              />
            </Box>

            <Box>
              <Controller
                name="expected_salary"
                control={control}
                render={({ field }) => (
                  <StyledTextField
                    {...field}
                    label="Expected Salary"
                    required={true}
                    fullWidth
                    type="number"
                    inputProps={expectedSalaryInputProps}
                    error={!!errors.expected_salary}
                    helperText={
                      getErrorMessage(errors.expected_salary) ||
                      (isReplacementDueToEmployeeMovement()
                        ? "Defaults to the old position's masterlist salary"
                        : "Defaults to the position's masterlist salary")
                    }
                    disabled={isReadOnly}
                    sx={formStyles?.textField?.(isReadOnly) || {}}
                  />
                )}
              />
            </Box>

            <Box>
              <Controller
                name="employment_type"
                control={control}
                render={({ field }) => (
                  <StyledTextField
                    select
                    {...field}
                    label="Employment Type"
                    value={safeStringRender(field.value)}
                    fullWidth
                    required={true}
                    error={!!errors.employment_type}
                    helperText={getErrorMessage(errors.employment_type)}
                    disabled={isReadOnly}
                    sx={formStyles?.textField?.(isReadOnly) || {}}
                    onChange={handleEmploymentTypeChange}>
                    {employmentTypeOptions.map((option) => (
                      <MenuItem key={option} value={option}>
                        {safeStringRender(option)}
                      </MenuItem>
                    ))}
                  </StyledTextField>
                )}
              />
            </Box>

            {isReplacementDueToEmployeeMovement() && (
              <Box>
                <Controller
                  name="movement_reason_for_change"
                  control={control}
                  render={({ field }) => (
                    <StyledTextField
                      select
                      {...field}
                      label="Reason for Change"
                      value={safeStringRender(field.value)}
                      fullWidth
                      required={true}
                      error={!!errors.movement_reason_for_change}
                      helperText={getErrorMessage(
                        errors.movement_reason_for_change,
                      )}
                      disabled={isReadOnly}
                      sx={formStyles?.textField?.(isReadOnly) || {}}
                      onChange={handleReasonForChangeChange}>
                      {reasonForChangeOptions.map((option) => (
                        <MenuItem key={option} value={option}>
                          {safeStringRender(option)}
                        </MenuItem>
                      ))}
                    </StyledTextField>
                  )}
                />
              </Box>
            )}

            <Box>
              <Controller
                name="justification"
                control={control}
                render={({ field }) => (
                  <StyledTextField
                    {...field}
                    value={field.value ?? ""}
                    label="Justification"
                    required={isAdditionalManpower()}
                    fullWidth
                    multiline
                    rows={1}
                    error={!!errors.justification}
                    helperText={
                      getErrorMessage(errors.justification) ||
                      (isAdditionalManpower()
                        ? "Required for Additional Manpower"
                        : "Optional")
                    }
                    disabled={isReadOnly}
                    sx={formStyles?.textField?.(isReadOnly) || {}}
                  />
                )}
              />
            </Box>

            <Box>
              <Controller
                name="remarks"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    value={field.value ?? ""}
                    label="Remarks"
                    fullWidth
                    multiline
                    rows={1}
                    error={!!errors.remarks}
                    helperText={getErrorMessage(errors.remarks)}
                    disabled={isReadOnly}
                    sx={formStyles?.textField?.(isReadOnly) || {}}
                  />
                )}
              />
            </Box>

            {isReplacementDueToEmployeeMovement() && moveStatusInfo && (
              <Box
                sx={{
                  gridColumn: "1 / -1",
                  display: "grid",
                  gridTemplateColumns: "max-content 1fr",
                  columnGap: 3,
                  rowGap: 0.5,
                  p: 2,
                  border: "1px dashed",
                  borderColor: "divider",
                  borderRadius: 1,
                }}>
                <Typography variant="body2" color="text.secondary">
                  Move status
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {moveStatusInfo.status}
                </Typography>
                {moveStatusInfo.hrCanReceive && (
                  <>
                    <Typography variant="body2" color="text.secondary">
                      When HR can receive
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {moveStatusInfo.hrCanReceive}
                    </Typography>
                  </>
                )}
              </Box>
            )}

            {approverSteps.length > 0 && (
              <Box sx={{ gridColumn: "1 / -1" }}>
                <Typography
                  variant="caption"
                  sx={{
                    display: "block",
                    fontWeight: 600,
                    letterSpacing: 0.4,
                    textTransform: "uppercase",
                    mb: 1,
                  }}>
                  Approvers (preview)
                </Typography>
                <Box
                  sx={{
                    display: "flex",
                    flexWrap: "wrap",
                    alignItems: "center",
                    gap: 1,
                  }}>
                  {[...approverSteps, "Standard approvers"].map(
                    (step, index, allSteps) => (
                      <Box
                        key={`${step}-${index}`}
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                        }}>
                        <Chip
                          label={step}
                          size="small"
                          variant="outlined"
                          sx={{
                            textTransform: "uppercase",
                            fontWeight: 600,
                            fontSize: "11px",
                          }}
                        />
                        {index < allSteps.length - 1 && (
                          <Typography variant="body2" color="text.secondary">
                            →
                          </Typography>
                        )}
                      </Box>
                    ),
                  )}
                </Box>
                {positionTitleForApprovers && (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mt: 1 }}>
                    {isReplacementDueToEmployeeMovement()
                      ? `From the old position's approver list (${positionTitleForApprovers}).`
                      : `From ${positionTitleForApprovers}'s approver list.`}
                  </Typography>
                )}
              </Box>
            )}
          </Box>
        </Box>

        {attachmentInstructions && (
          <Box sx={{ mb: 3 }}>
            <Alert
              severity="info"
              sx={{
                backgroundColor: "rgba(33, 61, 112, 0.08)",
                border: "1px solid rgba(33, 61, 112, 0.2)",
                "& .MuiAlert-icon": { color: "rgb(33, 61, 112)" },
                "& .MuiAlert-message": { color: "rgb(33, 61, 112)" },
              }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
                Required Attachments:
              </Typography>
              {attachmentInstructions.attachments.map((attachment, index) => (
                <Typography
                  key={index}
                  variant="body2"
                  sx={{ fontSize: "13px" }}>
                  {attachment}
                </Typography>
              ))}
              {attachmentInstructions.remarks && (
                <Typography
                  variant="body2"
                  sx={{
                    fontSize: "12px",
                    fontStyle: "italic",
                    mt: 0.5,
                    color: "rgb(33, 61, 112)",
                    fontWeight: 600,
                  }}>
                  * {attachmentInstructions.remarks}
                </Typography>
              )}
            </Alert>
          </Box>
        )}

        <Box sx={{ mb: 3, ...(formStyles?.attachmentContainer || {}) }}>
          <AttachmentField
            selectedEntry={selectedEntry}
            disabled={isViewMode}
            onFileViewerOpen={handleFileViewerOpen}
          />
        </Box>
      </Box>

      <FileViewerDialog
        open={fileViewerOpen}
        onClose={handleFileViewerClose}
        selectedEntry={selectedEntry}
        currentFormSubmissionId={currentFormSubmissionId}
        attachmentIndex={currentAttachmentIndex}
      />
    </>
  );
};

export default FormSubmissionFields;
