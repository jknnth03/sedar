import React, {
  useState,
  useEffect,
  forwardRef,
  useImperativeHandle,
  useMemo,
  useRef,
  useCallback,
} from "react";
import { useFormContext } from "react-hook-form";
import { Box, Alert } from "@mui/material";
import { useLazyGetAllShowProgramsQuery } from "../../../../../features/api/extras/programsApi";
import { useLazyGetAllShowHonorTitlesQuery } from "../../../../../features/api/extras/honortitlesApi";
import { useLazyGetAllShowDegreesQuery } from "../../../../../features/api/extras/degreesApi";
import { useLazyGetAllShowAttainmentsQuery } from "../../../../../features/api/extras/attainmentsApi";
import AttainmentFormFields from "./PendingAttainmentFormFields";

const PendingAttainmentForm = forwardRef(
  (
    {
      selectedPendingAttainment,
      showArchived = false,
      isLoading,
      onValidationChange,
      mode = "create",
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

    const handleDropdownFocus = useCallback(
      (dropdownName) => {
        if (mode === "view" || dropdownsLoaded[dropdownName]) return;

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
      },
      [
        dropdownsLoaded,
        fetchPrograms,
        fetchDegrees,
        fetchHonors,
        fetchAttainments,
        showArchived,
        mode,
      ]
    );

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

    const programs = useMemo(() => {
      if (mode === "view" && selectedPendingAttainment?.program) {
        return [selectedPendingAttainment.program];
      }
      if (mode === "edit" && selectedPendingAttainment?.program) {
        const existingProgram = selectedPendingAttainment.program;
        const apiPrograms = normalizeApiData(programsData);

        if (!programsData) {
          return [existingProgram];
        }

        const hasExistingInApi = apiPrograms.some(
          (prog) => prog.id === existingProgram.id
        );

        if (!hasExistingInApi) {
          return [existingProgram, ...apiPrograms];
        }

        return apiPrograms;
      }
      return normalizeApiData(programsData);
    }, [mode, programsData, selectedPendingAttainment?.program]);

    const degrees = useMemo(() => {
      if (mode === "view" && selectedPendingAttainment?.degree) {
        return [selectedPendingAttainment.degree];
      }
      if (mode === "edit" && selectedPendingAttainment?.degree) {
        const existingDegree = selectedPendingAttainment.degree;
        const apiDegrees = normalizeApiData(degreesData);

        if (!degreesData) {
          return [existingDegree];
        }

        const hasExistingInApi = apiDegrees.some(
          (deg) => deg.id === existingDegree.id
        );

        if (!hasExistingInApi) {
          return [existingDegree, ...apiDegrees];
        }

        return apiDegrees;
      }
      return normalizeApiData(degreesData);
    }, [mode, degreesData, selectedPendingAttainment?.degree]);

    const honors = useMemo(() => {
      if (mode === "view" && selectedPendingAttainment?.honor_title) {
        return [selectedPendingAttainment.honor_title];
      }
      if (mode === "edit" && selectedPendingAttainment?.honor_title) {
        const existingHonor = selectedPendingAttainment.honor_title;
        const apiHonors = normalizeApiData(honorsData);

        if (!honorsData) {
          return [existingHonor];
        }

        const hasExistingInApi = apiHonors.some(
          (honor) => honor.id === existingHonor.id
        );

        if (!hasExistingInApi) {
          return [existingHonor, ...apiHonors];
        }

        return apiHonors;
      }
      return normalizeApiData(honorsData);
    }, [mode, honorsData, selectedPendingAttainment?.honor_title]);

    const attainments = useMemo(() => {
      if (mode === "view" && selectedPendingAttainment?.attainment) {
        return [selectedPendingAttainment.attainment];
      }
      if (mode === "edit" && selectedPendingAttainment?.attainment) {
        const existingAttainment = selectedPendingAttainment.attainment;
        const apiAttainments = normalizeApiData(attainmentsData);

        if (!attainmentsData) {
          return [existingAttainment];
        }

        const hasExistingInApi = apiAttainments.some(
          (att) => att.id === existingAttainment.id
        );

        if (!hasExistingInApi) {
          return [existingAttainment, ...apiAttainments];
        }

        return apiAttainments;
      }
      return normalizeApiData(attainmentsData);
    }, [mode, attainmentsData, selectedPendingAttainment?.attainment]);

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

    const findMatchingOption = (targetObject, dropdownData, type) => {
      if (!targetObject || !dropdownData || !Array.isArray(dropdownData))
        return null;

      const targetId =
        typeof targetObject === "object" ? targetObject.id : targetObject;
      const targetName =
        typeof targetObject === "object" ? targetObject.name : null;

      let match = dropdownData.find((item) => item.id === targetId);

      if (!match && targetName) {
        match = dropdownData.find((item) => {
          const itemName = getOptionLabel(item, type);
          return itemName === targetName;
        });
      }

      return match || null;
    };

    const extractObject = (value) => {
      if (!value) return null;
      if (typeof value === "object") return value;
      return null;
    };

    useEffect(() => {
      if (
        (mode === "edit" || mode === "view") &&
        selectedPendingAttainment &&
        !hasInitializedData.current &&
        programs.length > 0 &&
        degrees.length > 0 &&
        honors.length > 0 &&
        attainments.length > 0
      ) {
        const currentValues = getValues();

        if (!currentValues.employee_id) {
          setValue("employee_id", selectedPendingAttainment.id || "");
        }

        if (!currentValues.program_id) {
          const programValue = extractObject(selectedPendingAttainment.program);
          if (programValue) {
            const matchedProgram = findMatchingOption(
              programValue,
              programs,
              "program"
            );
            if (matchedProgram) {
              setValue("program_id", matchedProgram);
            }
          }
        }

        if (!currentValues.degree_id) {
          const degreeValue = extractObject(selectedPendingAttainment.degree);
          if (degreeValue) {
            const matchedDegree = findMatchingOption(
              degreeValue,
              degrees,
              "degree"
            );
            if (matchedDegree) {
              setValue("degree_id", matchedDegree);
            }
          }
        }

        if (!currentValues.honor_title_id) {
          const honorValue = extractObject(
            selectedPendingAttainment.honor_title
          );
          if (honorValue) {
            const matchedHonor = findMatchingOption(
              honorValue,
              honors,
              "honor"
            );
            if (matchedHonor) {
              setValue("honor_title_id", matchedHonor);
            }
          }
        }

        if (!currentValues.attainment_id) {
          const attainmentValue = extractObject(
            selectedPendingAttainment.attainment
          );
          if (attainmentValue) {
            const matchedAttainment = findMatchingOption(
              attainmentValue,
              attainments,
              "attainment"
            );
            if (matchedAttainment) {
              setValue("attainment_id", matchedAttainment);
            }
          }
        }

        if (!currentValues.academic_year_from) {
          setValue(
            "academic_year_from",
            selectedPendingAttainment.academic_year_from || ""
          );
        }

        if (!currentValues.academic_year_to) {
          setValue(
            "academic_year_to",
            selectedPendingAttainment.academic_year_to || ""
          );
        }

        if (!currentValues.gpa) {
          setValue("gpa", selectedPendingAttainment.gpa || "");
        }

        if (!currentValues.institution) {
          setValue("institution", selectedPendingAttainment.institution || "");
        }

        if (!currentValues.attainment_remarks) {
          setValue(
            "attainment_remarks",
            selectedPendingAttainment.attainment_remarks || ""
          );
        }

        const existingFilename =
          selectedPendingAttainment.existing_attachment_filename ||
          selectedPendingAttainment.attainment_attachment_filename ||
          "";
        const existingUrl =
          selectedPendingAttainment.existing_attachment_url ||
          selectedPendingAttainment.attainment_attachment ||
          "";

        setValue("attainment_attachment", null);
        setValue("existing_attachment_filename", existingFilename);
        setValue("existing_attachment_url", existingUrl);

        setErrorMessage(null);
        hasInitializedData.current = true;
      }
    }, [
      selectedPendingAttainment,
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
    }, [mode, selectedPendingAttainment?.id]);

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
        {errorMessage && (
          <Alert severity="error" className="general-form__alert">
            {errorMessage}
          </Alert>
        )}

        {mode !== "view" && programsError && (
          <Alert severity="warning" className="general-form__alert">
            Failed to load programs from server.
          </Alert>
        )}

        {mode !== "view" && degreesError && (
          <Alert severity="warning" className="general-form__alert">
            Failed to load degrees from server.
          </Alert>
        )}

        {mode !== "view" && honorsError && (
          <Alert severity="warning" className="general-form__alert">
            Failed to load honor titles from server.
          </Alert>
        )}

        {mode !== "view" && attainmentsError && (
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
          selectedPendingAttainment={selectedPendingAttainment}
          mode={mode}
        />
      </Box>
    );
  }
);

PendingAttainmentForm.displayName = "PendingAttainmentForm";

export default PendingAttainmentForm;
