import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useFormContext } from "react-hook-form";
import { Box, Alert, CircularProgress } from "@mui/material";
import { useLazyGetAllShowReligionsQuery } from "../../../../../features/api/extras/religionsApi";
import {
  useLazyGetAllShowPrefixesQuery,
  useLazyGetEmployeeNextIdQuery,
  useLazyCheckEmployeeIdUniqueQuery,
} from "../../../../../features/api/extras/prefixesApi";
import { useLazyGetAllGeneralsQuery } from "../../../../../features/api/employee/generalApi";
import { useLazyGetAllManpowerQuery } from "../../../../../features/api/employee/generalApi";
import { useDispatch } from "react-redux";
import { setApprovalForm } from "../../../../../features/slice/formSlice";
import GeneralFormFields from "./GeneralFormFields";
import EmployeeHeader from "./EmployeeHeader";

const GeneralForm = ({
  selectedGeneral,
  isLoading = false,
  mode = "create",
  isViewMode = false,
  readOnly = false,
  disabled = false,
  selectedId,
}) => {
  const {
    control,
    watch,
    setValue,
    reset,
    getValues,
    setError,
    clearErrors,
    formState: { errors, isSubmitted },
  } = useFormContext();

  const [dropdownsLoaded, setDropdownsLoaded] = useState({
    religions: false,
    prefixes: false,
    referrers: false,
    approvalForms: false,
  });

  const [formInitialized, setFormInitialized] = useState(false);

  const [
    triggerReligions,
    { data: religionsData, isLoading: religionsLoading, error: religionsError },
  ] = useLazyGetAllShowReligionsQuery();

  const [
    triggerPrefixes,
    { data: prefixesData, isLoading: prefixesLoading, error: prefixesError },
  ] = useLazyGetAllShowPrefixesQuery();

  const [
    triggerGenerals,
    { data: generalsData, isLoading: generalsLoading, error: generalsError },
  ] = useLazyGetAllGeneralsQuery();

  const [
    getNextId,
    { data: nextIdData, isLoading: nextIdLoading, error: nextIdError },
  ] = useLazyGetEmployeeNextIdQuery();

  const [
    checkIdUnique,
    {
      data: uniqueCheckData,
      isLoading: uniqueCheckLoading,
      error: uniqueCheckError,
    },
  ] = useLazyCheckEmployeeIdUniqueQuery();

  const [
    triggerApprovalForms,
    {
      data: approvalFormsData,
      isLoading: approvalFormsLoading,
      error: approvalFormsError,
    },
  ] = useLazyGetAllManpowerQuery();

  const isReadOnly = mode === "view" || isViewMode;
  const isFieldDisabled = isLoading || isReadOnly || readOnly || disabled;
  const dispatch = useDispatch();

  const watchedSubmissionTitle = watch("submission_title");
  const watchedPrefix = watch("prefix");
  const watchedIdNumber = watch("id_number");

  const normalizeApiData = useCallback((data) => {
    if (!data) return [];

    if (data.result && data.result.data) {
      return Array.isArray(data.result.data) ? data.result.data : [];
    }

    return Array.isArray(data)
      ? data
      : data.result || data.data || data.items || data.results || [];
  }, []);

  const religions = useMemo(() => {
    if ((mode === "view" || isViewMode) && selectedGeneral?.religion) {
      return [selectedGeneral.religion];
    }
    if (mode === "edit" && selectedGeneral?.religion) {
      const existingReligion = selectedGeneral.religion;
      const apiReligions = normalizeApiData(religionsData);

      if (!religionsData) {
        return [existingReligion];
      }

      const hasExistingInApi = apiReligions.some(
        (religion) => religion.id === existingReligion.id
      );

      if (!hasExistingInApi) {
        return [existingReligion, ...apiReligions];
      }

      return apiReligions;
    }
    return normalizeApiData(religionsData);
  }, [
    mode,
    isViewMode,
    religionsData,
    selectedGeneral?.religion,
    normalizeApiData,
  ]);

  const prefixes = useMemo(() => {
    if ((mode === "view" || isViewMode) && selectedGeneral?.prefix) {
      return [selectedGeneral.prefix];
    }
    if (mode === "edit" && selectedGeneral?.prefix) {
      const existingPrefix = selectedGeneral.prefix;
      const apiPrefixes = normalizeApiData(prefixesData);

      if (!prefixesData) {
        return [existingPrefix];
      }

      const hasExistingInApi = apiPrefixes.some(
        (prefix) => prefix.id === existingPrefix.id
      );

      if (!hasExistingInApi) {
        return [existingPrefix, ...apiPrefixes];
      }

      return apiPrefixes;
    }
    return normalizeApiData(prefixesData);
  }, [
    mode,
    isViewMode,
    prefixesData,
    selectedGeneral?.prefix,
    normalizeApiData,
  ]);

  const referrers = useMemo(() => {
    if ((mode === "view" || isViewMode) && selectedGeneral?.referred_by) {
      return [selectedGeneral.referred_by];
    }
    if (mode === "edit" && selectedGeneral?.referred_by) {
      const existingReferrer = selectedGeneral.referred_by;
      const apiGenerals = normalizeApiData(generalsData);

      if (!generalsData) {
        return [existingReferrer];
      }

      const filtered = apiGenerals.filter((general) => {
        if (selectedGeneral?.id) {
          return general.id !== selectedGeneral.id;
        }
        return true;
      });

      const hasExistingInApi = filtered.some(
        (general) => general.id === existingReferrer.id
      );

      if (!hasExistingInApi) {
        return [existingReferrer, ...filtered];
      }

      return filtered;
    }
    const generals = normalizeApiData(generalsData);
    const filtered = generals.filter((general) => {
      if (selectedGeneral?.id) {
        return general.id !== selectedGeneral.id;
      }
      return true;
    });
    return filtered;
  }, [generalsData, selectedGeneral, normalizeApiData, mode, isViewMode]);

  const approvalForms = useMemo(() => {
    if ((mode === "view" || isViewMode) && selectedGeneral?.submission_title) {
      return [selectedGeneral.submission_title];
    }
    if (mode === "edit" && selectedGeneral?.submission_title) {
      const existingForm = selectedGeneral.submission_title;
      const apiForms = normalizeApiData(approvalFormsData);

      if (!approvalFormsData) {
        return [existingForm];
      }

      const hasExistingInApi = apiForms.some(
        (form) =>
          (form.id || form.submission_title) ===
          (existingForm.id || existingForm.submission_title)
      );

      if (!hasExistingInApi) {
        return [existingForm, ...apiForms];
      }

      return apiForms;
    }
    return normalizeApiData(approvalFormsData);
  }, [
    approvalFormsData,
    normalizeApiData,
    selectedGeneral?.submission_title,
    mode,
    isViewMode,
  ]);

  useEffect(() => {
    const fetchNextId = async () => {
      if (
        watchedPrefix &&
        watchedPrefix.id &&
        mode === "create" &&
        !isReadOnly
      ) {
        try {
          const result = await getNextId(watchedPrefix.id);
          if (result.data && result.data.next_id_number) {
            setValue("id_number", result.data.next_id_number);
          }
        } catch (error) {}
      }
    };

    fetchNextId();
  }, [watchedPrefix, getNextId, setValue, mode, isReadOnly]);

  useEffect(() => {
    if (
      watchedSubmissionTitle &&
      typeof watchedSubmissionTitle === "object" &&
      (watchedSubmissionTitle.id || watchedSubmissionTitle.submission_title)
    ) {
      dispatch(setApprovalForm(watchedSubmissionTitle));
    }
  }, [watchedSubmissionTitle, dispatch]);

  useEffect(() => {
    let retryCount = 0;
    const maxRetries = 5;

    const initializeForm = () => {
      const currentValues = getValues();

      if (
        !currentValues.submission_title &&
        selectedGeneral &&
        (mode === "edit" || mode === "view")
      ) {
        if (retryCount < maxRetries) {
          retryCount++;
          setTimeout(initializeForm, 200);
          return;
        }
      }

      setFormInitialized(true);
    };

    const timer = setTimeout(initializeForm, 100);
    return () => clearTimeout(timer);
  }, [getValues, selectedGeneral, mode]);

  const handleDropdownFocus = useCallback(
    (dropdownName) => {
      if (mode === "view" || isViewMode || dropdownsLoaded[dropdownName])
        return;

      const fetchParams = { page: 1, per_page: 1000, status: "active" };

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
        case "approvalForms":
          triggerApprovalForms(fetchParams);
          break;
      }

      setDropdownsLoaded((prev) => ({ ...prev, [dropdownName]: true }));
    },
    [
      dropdownsLoaded,
      triggerReligions,
      triggerPrefixes,
      triggerGenerals,
      triggerApprovalForms,
      mode,
      isViewMode,
    ]
  );

  const validateIdUniqueness = useCallback(
    async (prefixId, idNumber) => {
      if (!prefixId || !idNumber || mode !== "create") {
        return;
      }

      try {
        const result = await checkIdUnique({ prefixId, idNumber });

        if (result.data?.prefix_id_number_exists === true) {
          setError("id_number", {
            type: "manual",
            message: "This ID number is already taken",
          });
        } else {
          clearErrors("id_number");
        }
      } catch (error) {}
    },
    [checkIdUnique, setError, clearErrors, mode]
  );

  const hasErrors =
    religionsError ||
    prefixesError ||
    generalsError ||
    approvalFormsError ||
    nextIdError ||
    uniqueCheckError;

  if (!formInitialized) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box className="general-form" sx={{ width: "100%" }}>
      {hasErrors && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Error loading dropdown data. Please try again.
        </Alert>
      )}

      {(mode === "edit" || mode === "view" || isViewMode) && (
        <EmployeeHeader
          getValues={getValues}
          selectedGeneral={selectedGeneral}
          initialData={selectedGeneral}
        />
      )}

      <GeneralFormFields
        control={control}
        errors={errors}
        mode={mode}
        isFieldDisabled={isFieldDisabled}
        isReadOnly={isReadOnly}
        religions={religions}
        prefixes={prefixes}
        referrers={referrers}
        approvalForms={approvalForms}
        religionsLoading={religionsLoading}
        prefixesLoading={prefixesLoading}
        generalsLoading={generalsLoading}
        approvalFormsLoading={approvalFormsLoading}
        nextIdLoading={nextIdLoading}
        uniqueCheckLoading={uniqueCheckLoading}
        handleDropdownFocus={handleDropdownFocus}
        dispatch={dispatch}
        setApprovalForm={setApprovalForm}
        watch={watch}
        setValue={setValue}
        getNextId={getNextId}
        validateIdUniqueness={validateIdUniqueness}
        initialData={selectedGeneral}
      />
    </Box>
  );
};

GeneralForm.displayName = "GeneralForm";

export default GeneralForm;
