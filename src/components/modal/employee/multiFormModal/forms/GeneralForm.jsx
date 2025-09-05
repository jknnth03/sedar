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
import { useGetAllManpowerQuery } from "../../../../../features/api/employee/generalApi";
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

  const {
    data: approvalFormsData,
    isLoading: approvalFormsLoading,
    error: approvalFormsError,
  } = useGetAllManpowerQuery({ page: 1, per_page: 1000, status: "active" });

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

  const religions = useMemo(
    () => normalizeApiData(religionsData),
    [religionsData, normalizeApiData]
  );

  const prefixes = useMemo(
    () => normalizeApiData(prefixesData),
    [prefixesData, normalizeApiData]
  );

  const referrers = useMemo(() => {
    const generals = normalizeApiData(generalsData);
    const filtered = generals.filter((general) => {
      if (selectedGeneral?.id) {
        return general.id !== selectedGeneral.id;
      }
      return true;
    });
    return filtered;
  }, [generalsData, selectedGeneral, normalizeApiData]);

  const approvalForms = useMemo(() => {
    const normalized = normalizeApiData(approvalFormsData);

    if (
      watchedSubmissionTitle &&
      typeof watchedSubmissionTitle === "object" &&
      (watchedSubmissionTitle.id || watchedSubmissionTitle.submission_title)
    ) {
      const existingItem = normalized.find(
        (item) =>
          item.id === watchedSubmissionTitle.id ||
          item.submission_title === watchedSubmissionTitle.submission_title ||
          item.linked_mrf_title === watchedSubmissionTitle.submission_title
      );
      if (!existingItem) {
        return [watchedSubmissionTitle, ...normalized];
      }
    }

    return normalized;
  }, [approvalFormsData, normalizeApiData, watchedSubmissionTitle]);

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
        } catch (error) {
          //
        }
      }
    };

    fetchNextId();
  }, [watchedPrefix, getNextId, setValue, mode, isReadOnly]);

  useEffect(() => {
    const loadInitialData = async () => {
      if (mode === "edit" || mode === "view" || isViewMode) {
        const fetchParams = { page: 1, per_page: 1000, status: "active" };

        try {
          const promises = [
            triggerReligions(fetchParams, true),
            triggerPrefixes(fetchParams),
            triggerGenerals(fetchParams),
          ];

          await Promise.allSettled(promises);

          setDropdownsLoaded({
            religions: true,
            prefixes: true,
            referrers: true,
            approvalForms: true,
          });
        } catch (error) {
          //
        }
      }
    };

    loadInitialData();
  }, [mode, isViewMode, triggerReligions, triggerPrefixes, triggerGenerals]);

  useEffect(() => {
    if (
      approvalFormsData &&
      !approvalFormsLoading &&
      !dropdownsLoaded.approvalForms
    ) {
      setDropdownsLoaded((prev) => ({ ...prev, approvalForms: true }));
    }
  }, [approvalFormsData, approvalFormsLoading, dropdownsLoaded.approvalForms]);

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

  const handleDropdownFocus = async (dropdownName) => {
    if (dropdownsLoaded[dropdownName] || isReadOnly) {
      return;
    }

    const fetchParams = { page: 1, per_page: 1000, status: "active" };

    try {
      switch (dropdownName) {
        case "religions":
          await triggerReligions(fetchParams, true);
          break;
        case "prefixes":
          await triggerPrefixes(fetchParams);
          break;
        case "referrers":
          await triggerGenerals(fetchParams);
          break;
        case "approvalForms":
          if (approvalFormsData) {
            setDropdownsLoaded((prev) => ({ ...prev, approvalForms: true }));
          }
          break;
        default:
          return;
      }

      if (dropdownName !== "approvalForms") {
        setDropdownsLoaded((prev) => {
          const newState = { ...prev, [dropdownName]: true };
          return newState;
        });
      }
    } catch (error) {
      //
    }
  };

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
      } catch (error) {
        //
      }
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
