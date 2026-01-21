import React, { useEffect, useState, useRef } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { TextField, Typography, Autocomplete, Box } from "@mui/material";
import { sectionTitleStyles } from "./MDAFornModal.styles";
import {
  useGetAllPositionsQuery,
  useGetAllJobLevelsQuery,
} from "../../../../features/api/forms/mdaApi";

const FromPositionFields = ({
  control,
  errors,
  isReadOnly,
  isCreate,
  showSummary,
  currentMode,
}) => {
  const { setValue, watch } = useFormContext();

  const [selectedPosition, setSelectedPosition] = useState(null);
  const [selectedJobLevel, setSelectedJobLevel] = useState(null);
  const [positionSearchInput, setPositionSearchInput] = useState("");
  const [jobLevelSearchInput, setJobLevelSearchInput] = useState("");
  const [isPositionAutocompleteOpen, setIsPositionAutocompleteOpen] =
    useState(false);
  const [isJobLevelAutocompleteOpen, setIsJobLevelAutocompleteOpen] =
    useState(false);

  const isInitialMount = useRef(true);
  const prevModeRef = useRef(currentMode);

  const shouldFetchData = currentMode === "edit" || currentMode === "create";

  const { data: jobLevelsData, isLoading: isJobLevelsLoading } =
    useGetAllJobLevelsQuery(undefined, {
      skip: !shouldFetchData || !isJobLevelAutocompleteOpen,
    });
  const { data: positionsData, isLoading: isPositionsLoading } =
    useGetAllPositionsQuery(undefined, {
      skip: !shouldFetchData || !isPositionAutocompleteOpen,
    });

  const jobLevels = jobLevelsData?.result || [];
  const positions = positionsData?.result || [];

  const fromPositionId = watch("from_position_id");
  const fromJobLevelId = watch("from_job_level_id");

  useEffect(() => {
    if (currentMode !== prevModeRef.current) {
      isInitialMount.current = true;
      prevModeRef.current = currentMode;
    }
  }, [currentMode]);

  useEffect(() => {
    if (shouldFetchData && fromPositionId && positions.length > 0) {
      const position = positions.find((p) => p.id === fromPositionId);
      if (position) {
        setSelectedPosition(position);
        const positionLabel = getPositionLabel(position);
        setPositionSearchInput(positionLabel);
      }
    }
  }, [shouldFetchData, fromPositionId, positions]);

  useEffect(() => {
    if (shouldFetchData && fromJobLevelId && jobLevels.length > 0) {
      const jobLevel = jobLevels.find((jl) => jl.id === fromJobLevelId);
      if (jobLevel) {
        setSelectedJobLevel(jobLevel);
        setJobLevelSearchInput(jobLevel.name || "");
      }
    }
  }, [shouldFetchData, fromJobLevelId, jobLevels]);

  const getPositionLabel = (item) => {
    if (typeof item === "string") return item;
    if (!item) return "";
    if (item?.title && typeof item.title === "object" && item.title?.name) {
      return String(item.title.name);
    }
    if (item?.title && typeof item.title === "string") {
      return String(item.title);
    }
    return "";
  };

  useEffect(() => {
    if (shouldFetchData && fromPositionId && positions.length > 0) {
      const selectedPositionData = positions.find(
        (p) => p.id === fromPositionId
      );
      if (selectedPositionData) {
        const positionTitle =
          typeof selectedPositionData.title === "object"
            ? selectedPositionData.title?.name || ""
            : selectedPositionData.title || "";
        setValue("from_position_title", positionTitle, {
          shouldValidate: true,
        });
        setValue(
          "from_department",
          selectedPositionData.charging?.department_name || "",
          { shouldValidate: true }
        );
        setValue(
          "from_sub_unit",
          selectedPositionData.charging?.sub_unit_name || "",
          { shouldValidate: true }
        );

        const jobRate = selectedPositionData.job_rate || "";
        const allowance = selectedPositionData.allowance || "";

        if (jobRate) {
          setValue("from_job_rate", String(jobRate), { shouldValidate: true });
        }
        if (allowance) {
          setValue("from_allowance", String(allowance), {
            shouldValidate: true,
          });
        }
      }
    }
  }, [fromPositionId, positions, setValue, shouldFetchData]);

  useEffect(() => {
    if (shouldFetchData && fromJobLevelId && jobLevels.length > 0) {
      const selectedJobLevelData = jobLevels.find(
        (jl) => jl.id === fromJobLevelId
      );
      if (selectedJobLevelData) {
        setValue("from_job_level", selectedJobLevelData.name || "", {
          shouldValidate: true,
        });
      }
    }
  }, [fromJobLevelId, jobLevels, setValue, shouldFetchData]);

  const handlePositionChange = (event, newValue) => {
    setSelectedPosition(newValue);
    if (newValue) {
      setValue("from_position_id", newValue.id);
    } else {
      setValue("from_position_id", null);
      setValue("from_position_title", "");
      setValue("from_department", "");
      setValue("from_sub_unit", "");
      setValue("from_job_rate", "");
      setValue("from_allowance", "");
      setSelectedPosition(null);
    }
  };

  const handleJobLevelChange = (event, newValue) => {
    setSelectedJobLevel(newValue);
    if (newValue) {
      setValue("from_job_level_id", newValue.id);
    } else {
      setValue("from_job_level_id", null);
      setValue("from_job_level", "");
      setSelectedJobLevel(null);
    }
  };

  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="h6" sx={sectionTitleStyles}>
        FROM POSITION
      </Typography>
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
            name="from_position_title"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                value={field.value || ""}
                label="Position Title From"
                fullWidth
                disabled={true}
                InputLabelProps={{ shrink: true }}
              />
            )}
          />

          <Controller
            name="from_job_level"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                value={field.value || ""}
                label="Job Level From"
                fullWidth
                disabled={true}
                InputLabelProps={{ shrink: true }}
                sx={{ mt: 2 }}
              />
            )}
          />

          <Controller
            name="from_job_rate"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                value={field.value || ""}
                label="Job Rate From"
                fullWidth
                type="number"
                disabled={true}
                inputProps={{
                  step: "0.01",
                  min: "0",
                }}
                InputLabelProps={{ shrink: true }}
                sx={{ mt: 2 }}
              />
            )}
          />
        </Box>

        <Box>
          <Controller
            name="from_department"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                value={field.value || ""}
                label="Department From"
                fullWidth
                disabled={true}
                InputLabelProps={{ shrink: true }}
              />
            )}
          />

          <Controller
            name="from_sub_unit"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                value={field.value || ""}
                label="Sub Unit From"
                fullWidth
                disabled={true}
                InputLabelProps={{ shrink: true }}
                sx={{ mt: 2 }}
              />
            )}
          />

          <Controller
            name="from_allowance"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                value={field.value || ""}
                label="Allowance From"
                fullWidth
                type="number"
                disabled={true}
                inputProps={{
                  step: "0.01",
                  min: "0",
                }}
                InputLabelProps={{ shrink: true }}
                sx={{ mt: 2 }}
              />
            )}
          />
        </Box>
      </Box>
    </Box>
  );
};

export { FromPositionFields };
