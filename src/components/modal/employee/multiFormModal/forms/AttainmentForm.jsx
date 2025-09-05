import React, {
  useState,
  useEffect,
  forwardRef,
  useImperativeHandle,
  useMemo,
  useRef,
} from "react";
import { useFormContext } from "react-hook-form";
import { Box, Alert } from "@mui/material";
import { useLazyGetAllShowProgramsQuery } from "../../../../../features/api/extras/programsApi";
import { useLazyGetAllShowHonorTitlesQuery } from "../../../../../features/api/extras/honortitlesApi";
import { useLazyGetAllShowDegreesQuery } from "../../../../../features/api/extras/degreesApi";
import { useLazyGetAllShowAttainmentsQuery } from "../../../../../features/api/extras/attainmentsApi";
import AttainmentFormFields from "./AttainmentFormFields";
import EmployeeHeader from "./EmployeeHeader";
import "./General.scss";

const AttainmentForm = forwardRef(
  (
    {
      selectedAttainment,
      showArchived = false,
      isLoading,
      onValidationChange,
      mode = "create",
      employeeData,
    },
    ref
  ) => {
    const {
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
        (mode === "edit" || mode === "view") &&
        selectedAttainment &&
        !hasInitializedData.current
      ) {
        const attainmentData =
          selectedAttainment.attainment_info || selectedAttainment;
        const currentValues = getValues();

        console.log("Initializing form with attainment data:", attainmentData);

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

        const attachmentFilename = extractFieldValue(attainmentData, [
          "attainment_attachment_filename",
          "attachment_filename",
          "file_name",
          "filename",
        ]);

        const attachmentUrl = extractFieldValue(attainmentData, [
          "attainment_attachment_url",
          "attachment_url",
          "file_url",
          "url",
        ]);

        console.log("Attachment filename:", attachmentFilename);
        console.log("Attachment URL:", attachmentUrl);

        setValue("attainment_attachment", null);

        setValue("existing_attachment_filename", attachmentFilename || null);
        setValue("existing_attachment_url", attachmentUrl || null);

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

      if (!allowedTypes.includes(file.type) && !hasValidExtension) {
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
        setValue("existing_attachment_filename", null);
        setValue("existing_attachment_url", null);
        setErrorMessage(null);
        const fileInput = document.getElementById("attainment-file-input");
        if (fileInput) {
          fileInput.value = "";
        }
      },
      validateForm,
      setErrorMessage,
    }));

    const isReadOnly = mode === "view";

    return (
      <Box className="general-form">
        <EmployeeHeader getValues={getValues} selectedGeneral={employeeData} />

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

        <AttainmentFormFields
          programs={programs}
          degrees={degrees}
          honors={honors}
          attainments={attainments}
          programsLoading={programsLoading}
          degreesLoading={degreesLoading}
          honorsLoading={honorsLoading}
          attainmentsLoading={attainmentsLoading}
          isLoading={isLoading}
          isReadOnly={isReadOnly}
          watchedValues={watchedValues}
          handleDropdownFocus={handleDropdownFocus}
          handleFileChange={handleFileChange}
          handleFileRemove={handleFileRemove}
          getOptionLabel={getOptionLabel}
          selectedAttainment={selectedAttainment}
        />
      </Box>
    );
  }
);

AttainmentForm.displayName = "AttainmentForm";

export default AttainmentForm;
