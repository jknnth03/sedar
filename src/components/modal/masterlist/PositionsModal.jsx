import React, { useState, useEffect, useMemo } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Alert,
  Autocomplete,
  DialogContentText,
  Typography,
  IconButton,
  Tooltip,
  Skeleton,
} from "@mui/material";
import {
  Close as CloseIcon,
  Edit as EditIcon,
  WorkOutline as WorkOutlineIcon,
  Visibility as VisibilityIcon,
} from "@mui/icons-material";
import EditOffIcon from "@mui/icons-material/EditOff";
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import InsertDriveFileOutlinedIcon from "@mui/icons-material/InsertDriveFileOutlined";
import { useSnackbar } from "notistack";
import {
  usePostPositionMutation,
  useUpdatePositionMutation,
  useLazyGetPositionByIdQuery,
  useGetSuperiorOptionsQuery,
} from "../../../features/api/masterlist/positionsApi";
import { useLazyGetAllShowTitlesQuery } from "../../../features/api/extras/titleApi";
import { useLazyGetAllShowTeamsQuery } from "../../../features/api/extras/teamsApi";
import { useLazyGetAllShowSchedulesQuery } from "../../../features/api/extras/schedulesApi";
import { CONSTANT } from "../../../config/router";
import { useLazyGetAllShowToolsQuery } from "../../../features/api/extras/toolsApi";
import { useLazyGetAllOneRdfQuery } from "../../../features/api/masterlist/realonerdfApi";
// NOTE: adjust path to where your job levels API (useGetAllJobLevelsQuery) lives
import { useGetAllJobLevelsQuery } from "../../../features/api/masterlist/jobLevelsApi";
import { styles, getEditIconStyle } from "./PositionModalStyles";
import {
  mergeDropdownOptions,
  normalizeData,
  getAttachmentDisplayName,
  validatePositionForm,
  buildFormDataPayload,
  getModalTitle,
  hasExistingAttachment,
} from "./PositionsModalHelpers";
import {
  setCreateModeValues,
  setFormValuesFromResponse,
  setDisplayValuesFromResponse,
  setInitialDropdownOptions,
} from "./PositionsModalGetValues";
import PositionDialog from "../../../pages/masterlist/positions/PositionDialog";
import PositionViewContent from "./PositionViewContent";

// ---- form layout helpers (card sections, same look as the view mode) ----
const FORM_GRID = {
  display: "grid",
  gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)" },
  gap: 2,
};
const FORM_FULL = { gridColumn: "1 / -1" };

const FormCard = ({ title, children }) => (
  <Box
    sx={{
      border: "1px solid #e0e0e0",
      borderRadius: "8px",
      p: 2,
      mb: 2,
    }}>
    <Typography
      sx={{
        fontSize: "13px",
        fontWeight: 700,
        mb: 1.5,
        color: "rgb(33, 61, 112)",
      }}>
      {title}
    </Typography>
    {children}
  </Box>
);

function PositionsModal({
  open,
  onClose,
  refetch,
  position,
  showArchived,
  edit,
}) {
  const [formData, setFormData] = useState(setCreateModeValues());
  const [errors, setErrors] = useState({});
  const [errorMessage, setErrorMessage] = useState(null);
  const [currentMode, setCurrentMode] = useState(edit);
  const [originalMode, setOriginalMode] = useState(edit);
  const [isInitialLoad, setIsInitialLoad] = useState(false);
  const [isSwitchingMode, setIsSwitchingMode] = useState(false);
  const [fullPositionData, setFullPositionData] = useState(null);
  const [attachmentDialogOpen, setAttachmentDialogOpen] = useState(false);
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  const [initialOptions, setInitialOptions] = useState({
    titlesList: [],
    schedulesList: [],
    teamsList: [],
    chargingList: [],
    usersList: [],
    jobLevelsList: [],
  });

  const [fetchTools, { data: toolsListRaw = [], isFetching: toolsFetching }] =
    useLazyGetAllShowToolsQuery();
  const [fetchTitles, { data: titlesData, isFetching: titlesFetching }] =
    useLazyGetAllShowTitlesQuery();
  const [
    fetchSchedules,
    { data: schedulesData, isFetching: schedulesFetching },
  ] = useLazyGetAllShowSchedulesQuery();
  const [fetchTeams, { data: teamsData, isFetching: teamsFetching }] =
    useLazyGetAllShowTeamsQuery();

  // Superior dropdown: GET positions/superior-options?search=
  const [superiorOpened, setSuperiorOpened] = useState(false);
  const [superiorSearch, setSuperiorSearch] = useState("");
  const [debouncedSuperiorSearch, setDebouncedSuperiorSearch] = useState("");
  const [pickedSuperior, setPickedSuperior] = useState(null);

  useEffect(() => {
    const timer = setTimeout(
      () => setDebouncedSuperiorSearch(superiorSearch),
      500,
    );
    return () => clearTimeout(timer);
  }, [superiorSearch]);

  const { data: usersData, isFetching: usersFetching } =
    useGetSuperiorOptionsQuery(
      { search: debouncedSuperiorSearch },
      { skip: !open || !superiorOpened },
    );
  const { data: jobLevelsData, isFetching: jobLevelsFetching } =
    useGetAllJobLevelsQuery(undefined, { skip: !open });
  const [fetchCharging, { data: chargingData, isFetching: chargingFetching }] =
    useLazyGetAllOneRdfQuery();
  const [getPositionById, { isFetching: isFetchingPosition }] =
    useLazyGetPositionByIdQuery();
  const [postPosition, { isLoading: isAdding }] = usePostPositionMutation();
  const [updatePosition, { isLoading: isUpdating }] =
    useUpdatePositionMutation();

  const toolsList = useMemo(() => normalizeData(toolsListRaw), [toolsListRaw]);
  const titlesListFromApi = useMemo(
    () => normalizeData(titlesData),
    [titlesData],
  );
  const schedulesListFromApi = useMemo(
    () => normalizeData(schedulesData),
    [schedulesData],
  );
  const teamsListFromApi = useMemo(() => normalizeData(teamsData), [teamsData]);
  const usersListFromApi = useMemo(
    () =>
      Array.isArray(usersData?.result)
        ? usersData.result
        : normalizeData(usersData),
    [usersData],
  );
  const jobLevelsListFromApi = useMemo(
    () => normalizeData(jobLevelsData),
    [jobLevelsData],
  );
  const chargingListFromApi = useMemo(
    () => normalizeData(chargingData),
    [chargingData],
  );

  const titlesListMerged = useMemo(
    () => mergeDropdownOptions(titlesListFromApi, initialOptions.titlesList),
    [titlesListFromApi, initialOptions.titlesList],
  );
  const schedulesListMerged = useMemo(
    () =>
      mergeDropdownOptions(schedulesListFromApi, initialOptions.schedulesList),
    [schedulesListFromApi, initialOptions.schedulesList],
  );
  const teamsListMerged = useMemo(
    () => mergeDropdownOptions(teamsListFromApi, initialOptions.teamsList),
    [teamsListFromApi, initialOptions.teamsList],
  );
  const usersListMerged = useMemo(
    () =>
      mergeDropdownOptions(usersListFromApi, [
        ...initialOptions.usersList,
        ...(pickedSuperior ? [pickedSuperior] : []),
      ]),
    [usersListFromApi, initialOptions.usersList, pickedSuperior],
  );
  const jobLevelsListMerged = useMemo(
    () =>
      mergeDropdownOptions(jobLevelsListFromApi, initialOptions.jobLevelsList),
    [jobLevelsListFromApi, initialOptions.jobLevelsList],
  );
  const chargingListMerged = useMemo(
    () =>
      mergeDropdownOptions(chargingListFromApi, initialOptions.chargingList),
    [chargingListFromApi, initialOptions.chargingList],
  );

  const titlesList = titlesFetching ? [] : titlesListMerged;
  const schedulesList = schedulesFetching ? [] : schedulesListMerged;
  const teamsList = teamsFetching ? [] : teamsListMerged;
  const usersList = usersFetching ? [] : usersListMerged;
  const chargingList = chargingFetching ? [] : chargingListMerged;
  const jobLevelsList = jobLevelsFetching ? [] : jobLevelsListMerged;

  const isProcessing = isSwitchingMode || isInitialLoad;

  const buildTitleInitialOption = (apiData) => {
    if (!apiData?.title) return [];
    return [
      {
        id: apiData.title.id,
        name: apiData.title_with_unit || apiData.title.name,
        code: apiData.title.code,
      },
    ];
  };

  useEffect(() => {
    if (open) {
      setCurrentMode(edit);
      setOriginalMode(edit);
      setFullPositionData(null);
      setSuperiorOpened(false);
      setSuperiorSearch("");
      setDebouncedSuperiorSearch("");
      setPickedSuperior(null);
      setInitialOptions({
        titlesList: [],
        schedulesList: [],
        teamsList: [],
        chargingList: [],
        usersList: [],
        jobLevelsList: [],
      });
    }
  }, [open, edit]);

  useEffect(() => {
    if (open && position?.id) {
      const fetchFullData = async () => {
        try {
          setIsInitialLoad(true);

          const requests = [getPositionById(position.id).unwrap()];
          if (toolsList.length === 0) {
            requests.push(fetchTools());
          }

          const [response] = await Promise.all(requests);
          const apiData = response.result;

          setFullPositionData(apiData);
          setInitialOptions({
            ...setInitialDropdownOptions(apiData),
            titlesList: buildTitleInitialOption(apiData),
          });
          setFormData(setFormValuesFromResponse(apiData));
        } catch (error) {
          enqueueSnackbar("Failed to load position details", {
            variant: "error",
            autoHideDuration: 2000,
          });
        } finally {
          setIsInitialLoad(false);
        }
      };
      fetchFullData();
    }
  }, [open, position?.id, getPositionById, fetchTools, enqueueSnackbar]);

  useEffect(() => {
    if (open) {
      setErrors({});
      setErrorMessage(null);

      if (!position || Object.keys(position).length === 0) {
        setFormData(setCreateModeValues());
      }
    } else {
      setFormData(setCreateModeValues());
      setErrors({});
      setErrorMessage(null);
    }
  }, [open, position]);

  const handleClose = () => {
    if (onClose) {
      onClose();
    }
  };

  const handleModeChange = async (newMode) => {
    if (newMode === "edit" && position?.id && currentMode === "view") {
      try {
        setIsSwitchingMode(true);

        if (toolsList.length === 0) {
          await fetchTools();
        }

        if (!fullPositionData) {
          const response = await getPositionById(position.id).unwrap();
          const apiData = response.result;

          setFullPositionData(apiData);
          setInitialOptions({
            ...setInitialDropdownOptions(apiData),
            titlesList: buildTitleInitialOption(apiData),
          });
          setFormData(setFormValuesFromResponse(apiData));
        } else {
          setInitialOptions({
            ...setInitialDropdownOptions(fullPositionData),
            titlesList: buildTitleInitialOption(fullPositionData),
          });
          setFormData(setFormValuesFromResponse(fullPositionData));
        }
      } catch (error) {
        enqueueSnackbar("Failed to load position details", {
          variant: "error",
          autoHideDuration: 2000,
        });
        return;
      } finally {
        setIsSwitchingMode(false);
      }
    }
    setCurrentMode(newMode);
  };

  const handleCancelEdit = () => {
    setCurrentMode(originalMode);
  };

  const clearFieldError = (fieldName) => {
    setErrors((prev) => ({
      ...prev,
      [fieldName]: false,
    }));
    if (
      errorMessage &&
      errorMessage.includes("Please fill out all required fields")
    ) {
      setErrorMessage(null);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    clearFieldError(name);
  };

  // Headcount: digits only (strips letters, e, -, +, ., spaces, etc.)
  const handleHeadcountChange = (e) => {
    const digitsOnly = e.target.value.replace(/\D/g, "");
    setFormData((prev) => ({
      ...prev,
      headcount: digitsOnly,
    }));
    clearFieldError("headcount");
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({
        ...prev,
        position_attachment: file,
      }));
      clearFieldError("position_attachment");
    }
  };

  const handleSubmit = async () => {
    setErrorMessage(null);

    const validation = validatePositionForm(formData, currentMode);

    if (!validation.isValid) {
      setErrors(validation.errors);
      setErrorMessage("Please fill out all required fields.");
      return;
    }

    const formDataToSend = buildFormDataPayload(
      formData,
      toolsList,
      showArchived,
      currentMode,
    );

    try {
      if (currentMode === true || currentMode === "edit") {
        await updatePosition({
          formData: formDataToSend,
          id: position.id,
        }).unwrap();
        enqueueSnackbar("Position updated successfully!", {
          variant: "success",
        });
      } else {
        await postPosition(formDataToSend).unwrap();
        enqueueSnackbar("Position added successfully!", { variant: "success" });
      }
      refetch?.();
      handleClose();
    } catch (error) {
      setErrorMessage(
        error?.data?.message || "An error occurred while saving the position.",
      );
    }
  };

  const handleViewAttachment = () => {
    const dataToUse = fullPositionData || position;
    if (dataToUse?.position_attachment) {
      setAttachmentDialogOpen(true);
    }
  };

  const handleTitlesOpen = () => {
    if (titlesListFromApi.length === 0 && !isReadOnly) {
      fetchTitles();
    }
  };

  const handleSchedulesOpen = () => {
    if (schedulesListFromApi.length === 0 && !isReadOnly) {
      fetchSchedules();
    }
  };

  const handleTeamsOpen = () => {
    if (teamsListFromApi.length === 0 && !isReadOnly) {
      fetchTeams();
    }
  };

  const handleChargingOpen = () => {
    if (chargingListFromApi.length === 0 && !isReadOnly) {
      fetchCharging();
    }
  };

  const handleToolsOpen = () => {
    if (toolsList.length === 0 && !isReadOnly) {
      fetchTools();
    }
  };

  const isReadOnly = currentMode === "view";
  const isViewMode = currentMode === "view";
  const isEditMode = currentMode === true || currentMode === "edit";
  const dataToDisplay = fullPositionData || position;
  const displayValues = setDisplayValuesFromResponse(dataToDisplay);
  const {
    displayTitle,
    displaySchedule,
    displayTeam,
    displayCharging,
    displaySuperior,
    displayTools,
  } = displayValues;

  // Attachment field helpers
  const attachmentName = getAttachmentDisplayName(formData.position_attachment);
  const attachmentRequired =
    currentMode !== true && currentMode !== "edit" && currentMode !== "view";
  const canViewAttachment = hasExistingAttachment(
    fullPositionData,
    position,
    formData,
  );

  return (
    <>
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
        <DialogTitle sx={styles.dialogTitle}>
          <Box sx={styles.titleContainer}>
            <WorkOutlineIcon sx={styles.titleIcon} />
            <Typography variant="h6" component="div" sx={styles.titleText}>
              {getModalTitle(currentMode)}
            </Typography>
            {isViewMode && (
              <Tooltip title="EDIT POSITION" arrow placement="top">
                <IconButton
                  onClick={() => handleModeChange("edit")}
                  disabled={isProcessing}
                  size="small"
                  sx={styles.editButton}>
                  <EditIcon sx={getEditIconStyle(isProcessing)} />
                </IconButton>
              </Tooltip>
            )}
            {isEditMode && originalMode === "view" && (
              <Tooltip title="CANCEL EDIT">
                <IconButton
                  onClick={handleCancelEdit}
                  disabled={isProcessing}
                  size="small"
                  sx={styles.cancelEditButton}>
                  <EditOffIcon sx={styles.cancelEditIcon} />
                </IconButton>
              </Tooltip>
            )}
          </Box>

          <Box sx={styles.actionsContainer}>
            <IconButton onClick={handleClose} sx={styles.closeButton}>
              <CloseIcon sx={styles.closeIcon} />
            </IconButton>
          </Box>
        </DialogTitle>

        {errorMessage && (
          <DialogContentText dividers>
            <Alert severity="error" sx={styles.alertContainer}>
              {errorMessage}
            </Alert>
          </DialogContentText>
        )}

        <DialogContent>
          {isProcessing ? (
            <Box>
              <Box sx={styles.formGrid}>
                <Box sx={styles.fullWidthColumn}>
                  <Skeleton
                    variant="text"
                    width="15%"
                    height={20}
                    sx={{ mb: 1 }}
                  />
                  <Skeleton variant="rounded" height={56} />
                </Box>
                <Box>
                  <Skeleton
                    variant="text"
                    width="25%"
                    height={20}
                    sx={{ mb: 1 }}
                  />
                  <Skeleton variant="rounded" height={56} />
                </Box>
                <Box>
                  <Skeleton
                    variant="text"
                    width="35%"
                    height={20}
                    sx={{ mb: 1 }}
                  />
                  <Skeleton variant="rounded" height={56} />
                </Box>
                <Box>
                  <Skeleton
                    variant="text"
                    width="30%"
                    height={20}
                    sx={{ mb: 1 }}
                  />
                  <Skeleton variant="rounded" height={56} />
                </Box>
                <Box>
                  <Skeleton
                    variant="text"
                    width="25%"
                    height={20}
                    sx={{ mb: 1 }}
                  />
                  <Skeleton variant="rounded" height={56} />
                </Box>
                <Box>
                  <Skeleton
                    variant="text"
                    width="20%"
                    height={20}
                    sx={{ mb: 1 }}
                  />
                  <Skeleton variant="rounded" height={56} />
                </Box>
                <Box>
                  <Skeleton
                    variant="text"
                    width="25%"
                    height={20}
                    sx={{ mb: 1 }}
                  />
                  <Skeleton variant="rounded" height={56} />
                </Box>
                <Box sx={styles.fullWidthColumn}>
                  <Skeleton
                    variant="text"
                    width="40%"
                    height={20}
                    sx={{ mb: 1 }}
                  />
                  <Skeleton variant="rounded" height={56} />
                </Box>
                <Box sx={styles.fullWidthColumn}>
                  <Skeleton
                    variant="text"
                    width="18%"
                    height={20}
                    sx={{ mb: 1 }}
                  />
                  <Skeleton variant="rounded" height={56} />
                </Box>
              </Box>
            </Box>
          ) : isViewMode ? (
            <PositionViewContent
              positionId={position?.id}
              data={dataToDisplay}
              displayTitle={dataToDisplay?.title_with_unit || displayTitle}
              displayCharging={displayCharging}
              displaySchedule={displaySchedule}
              displayTeam={displayTeam}
              displaySuperior={displaySuperior}
              displayTools={displayTools}
              onViewAttachment={handleViewAttachment}
            />
          ) : (
            <Box>
              <FormCard title="Position">
                <Box sx={FORM_GRID}>
                  <Box sx={FORM_FULL}>
                    {isReadOnly ? (
                      <TextField
                        label="Titles"
                        value={
                          dataToDisplay?.title_with_unit || displayTitle || ""
                        }
                        disabled
                        fullWidth
                        required
                      />
                    ) : (
                      <Autocomplete
                        options={titlesList}
                        getOptionLabel={(option) => option?.name || ""}
                        value={
                          titlesListMerged.find(
                            (t) => t.id === formData.titles,
                          ) || null
                        }
                        onChange={(e, value) => {
                          setFormData((prev) => ({
                            ...prev,
                            titles: value?.id || "",
                          }));
                          clearFieldError("titles");
                        }}
                        onOpen={handleTitlesOpen}
                        disabled={isReadOnly}
                        loading={titlesFetching}
                        loadingText="Loading titles..."
                        isOptionEqualToValue={(option, value) =>
                          option?.id === value?.id
                        }
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Titles"
                            name="titles"
                            fullWidth
                            error={errors.titles}
                            helperText={
                              errors.titles && "Please select a title"
                            }
                            required
                          />
                        )}
                      />
                    )}
                  </Box>

                  <TextField
                    label="Code"
                    name="code"
                    value={formData.code || ""}
                    onChange={handleChange}
                    error={errors.code}
                    helperText={errors.code && "Code is required"}
                    disabled={isReadOnly}
                    required
                  />

                  <Autocomplete
                    options={jobLevelsList}
                    getOptionLabel={(option) =>
                      option?.label ||
                      [
                        option?.name,
                        option?.salary_structure,
                        option?.pay_frequency,
                      ]
                        .filter(Boolean)
                        .join(" | ") ||
                      option?.code ||
                      ""
                    }
                    value={
                      jobLevelsListMerged.find(
                        (j) => j.id === formData.job_level,
                      ) || null
                    }
                    onChange={(e, value) => {
                      setFormData((prev) => ({
                        ...prev,
                        job_level: value?.id || "",
                      }));
                      clearFieldError("job_level");
                    }}
                    disabled={isReadOnly}
                    loading={jobLevelsFetching}
                    loadingText="Loading job levels..."
                    isOptionEqualToValue={(option, value) =>
                      option?.id === value?.id
                    }
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Job Level"
                        name="job_level"
                        fullWidth
                        error={errors.job_level}
                        helperText={
                          errors.job_level && "Please select a job level"
                        }
                        required
                      />
                    )}
                  />

                  {isReadOnly ? (
                    <TextField
                      label="Superior Name"
                      value={displaySuperior || ""}
                      disabled
                      fullWidth
                    />
                  ) : (
                    <Autocomplete
                      options={usersList}
                      getOptionLabel={(option) =>
                        option?.full_name ||
                        option?.name ||
                        option?.username ||
                        ""
                      }
                      value={
                        usersListMerged.find(
                          (u) => u.id === formData.superior_name,
                        ) || null
                      }
                      onChange={(e, value) => {
                        setPickedSuperior(value || null);
                        setFormData((prev) => ({
                          ...prev,
                          superior_name: value?.id || null,
                        }));
                        clearFieldError("superior_name");
                      }}
                      onOpen={() => setSuperiorOpened(true)}
                      onInputChange={(e, value, reason) => {
                        if (reason === "input" || reason === "clear") {
                          setSuperiorSearch(value);
                        }
                      }}
                      filterOptions={(options) => options}
                      getOptionDisabled={(option) =>
                        option?.has_user_account === false
                      }
                      disabled={isReadOnly}
                      loading={usersFetching}
                      loadingText="Loading users..."
                      isOptionEqualToValue={(option, value) =>
                        option?.id === value?.id
                      }
                      renderOption={(props, option) => (
                        <li {...props} key={option.id}>
                          <Box>
                            <Typography
                              sx={{
                                fontSize: "13px",
                                fontWeight: 700,
                                textTransform: "uppercase",
                              }}>
                              {option.full_name ||
                                option.name ||
                                option.username}
                            </Typography>
                            <Typography
                              sx={{
                                fontSize: "11px",
                                color: "text.secondary",
                              }}>
                              {[option.employee_code, option.position_title]
                                .filter(Boolean)
                                .join(" · ")}
                              {option.has_user_account === false
                                ? " · No user account"
                                : ""}
                            </Typography>
                          </Box>
                        </li>
                      )}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Superior Name"
                          name="superior_name"
                          fullWidth
                          error={errors.superior_name}
                          helperText={
                            errors.superior_name && "Please select a superior"
                          }
                        />
                      )}
                    />
                  )}

                  {/* Headcount (sent as headcount in the payload), numbers only */}
                  <TextField
                    label="Headcount"
                    name="headcount"
                    type="text"
                    value={formData.headcount ?? ""}
                    onChange={handleHeadcountChange}
                    error={errors.headcount}
                    helperText={errors.headcount && "Headcount is required"}
                    disabled={isReadOnly}
                    fullWidth
                    inputProps={{
                      inputMode: "numeric",
                      pattern: "[0-9]*",
                    }}
                  />

                  <Autocomplete
                    options={["MONTHLY PAID", "DAILY PAID", "HOURLY PAID"]}
                    getOptionLabel={(option) => option}
                    value={formData.pay_frequency || null}
                    onChange={(e, value) => {
                      handleChange({
                        target: { name: "pay_frequency", value: value || "" },
                      });
                    }}
                    disabled={isReadOnly}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Pay Frequency"
                        error={errors.pay_frequency}
                        helperText={
                          errors.pay_frequency && "Please select pay frequency"
                        }
                        required
                        fullWidth
                      />
                    )}
                  />

                  {/* Expected Salary (sent as expected_salary in the payload) */}
                  <TextField
                    label="Expected Salary"
                    name="expected_salary"
                    type="number"
                    value={formData.expected_salary ?? ""}
                    onChange={handleChange}
                    error={errors.expected_salary}
                    helperText={
                      errors.expected_salary && "Expected salary is required"
                    }
                    disabled={isReadOnly}
                    fullWidth
                    inputProps={{ min: 0, step: "any" }}
                  />

                  <Box sx={FORM_FULL}>
                    {isReadOnly ? (
                      <TextField
                        label="Tools"
                        value={displayTools || ""}
                        disabled
                        fullWidth
                        required
                      />
                    ) : (
                      <Autocomplete
                        multiple
                        options={toolsList}
                        getOptionLabel={(option) => option?.name || ""}
                        value={formData.tools
                          .map((toolName) =>
                            toolsList.find((t) => t.name === toolName),
                          )
                          .filter(Boolean)}
                        onChange={(event, newValue) => {
                          const toolNames = newValue.map((item) => item.name);
                          setFormData((prev) => ({
                            ...prev,
                            tools: toolNames,
                          }));
                          clearFieldError("tools");
                        }}
                        onOpen={handleToolsOpen}
                        disabled={isReadOnly}
                        loading={toolsFetching}
                        loadingText="Loading tools..."
                        isOptionEqualToValue={(option, value) =>
                          option?.id === value?.id
                        }
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Tools"
                            name="tools"
                            fullWidth
                            error={errors.tools}
                            helperText={
                              errors.tools && "Please select at least one tool"
                            }
                            required
                          />
                        )}
                      />
                    )}
                  </Box>
                </Box>
              </FormCard>

              <FormCard title="Assignment">
                <Box sx={FORM_GRID}>
                  {isReadOnly ? (
                    <TextField
                      label="Schedule"
                      value={displaySchedule || ""}
                      disabled
                      fullWidth
                      required
                    />
                  ) : (
                    <Autocomplete
                      options={schedulesList}
                      getOptionLabel={(option) => option?.name || ""}
                      value={
                        schedulesListMerged.find(
                          (s) => s.id === formData.schedule,
                        ) || null
                      }
                      onChange={(e, value) => {
                        setFormData((prev) => ({
                          ...prev,
                          schedule: value?.id || "",
                        }));
                        clearFieldError("schedule");
                      }}
                      onOpen={handleSchedulesOpen}
                      disabled={isReadOnly}
                      loading={schedulesFetching}
                      loadingText="Loading schedules..."
                      isOptionEqualToValue={(option, value) =>
                        option?.id === value?.id
                      }
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Schedule"
                          name="schedule"
                          fullWidth
                          error={errors.schedule}
                          helperText={
                            errors.schedule && "Please select a schedule"
                          }
                          required
                        />
                      )}
                    />
                  )}

                  {isReadOnly ? (
                    <TextField
                      label="Team"
                      value={displayTeam || ""}
                      disabled
                      fullWidth
                      required
                    />
                  ) : (
                    <Autocomplete
                      options={teamsList}
                      getOptionLabel={(option) => option?.name || ""}
                      value={
                        teamsListMerged.find((t) => t.id === formData.team) ||
                        null
                      }
                      onChange={(e, value) => {
                        setFormData((prev) => ({
                          ...prev,
                          team: value?.id || "",
                        }));
                        clearFieldError("team");
                      }}
                      onOpen={handleTeamsOpen}
                      disabled={isReadOnly}
                      loading={teamsFetching}
                      loadingText="Loading teams..."
                      isOptionEqualToValue={(option, value) =>
                        option?.id === value?.id
                      }
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Team"
                          name="team"
                          fullWidth
                          error={errors.team}
                          helperText={errors.team && "Please select a team"}
                          required
                        />
                      )}
                    />
                  )}

                  <Box sx={FORM_FULL}>
                    {isReadOnly ? (
                      <TextField
                        label="Charging"
                        value={displayCharging || ""}
                        disabled
                        fullWidth
                        required
                      />
                    ) : (
                      <Autocomplete
                        options={chargingList}
                        getOptionLabel={(option) => option?.name || ""}
                        value={
                          chargingListMerged.find(
                            (c) => c.id === formData.charging,
                          ) || null
                        }
                        onChange={(e, value) => {
                          setFormData((prev) => ({
                            ...prev,
                            charging: value?.id || "",
                          }));
                          clearFieldError("charging");
                        }}
                        onOpen={handleChargingOpen}
                        disabled={isReadOnly}
                        loading={chargingFetching}
                        loadingText="Loading charging..."
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Charging"
                            name="charging"
                            fullWidth
                            error={errors.charging}
                            helperText={
                              errors.charging && "Please select charging"
                            }
                            required
                          />
                        )}
                        isOptionEqualToValue={(option, value) =>
                          option?.id === value?.id
                        }
                      />
                    )}
                  </Box>
                </Box>
              </FormCard>

              <FormCard title="Attachment">
                <Box
                  component="label"
                  onDragOver={(e) => {
                    e.preventDefault();
                    if (!isReadOnly) setIsDraggingFile(true);
                  }}
                  onDragLeave={() => setIsDraggingFile(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDraggingFile(false);
                    if (!isReadOnly && e.dataTransfer.files?.length) {
                      handleFileChange({
                        target: { files: e.dataTransfer.files },
                      });
                    }
                  }}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    p: 2,
                    borderRadius: "8px",
                    border: "1.5px dashed",
                    borderColor: errors.position_attachment
                      ? "#d32f2f"
                      : isDraggingFile || attachmentName
                        ? "rgb(33, 61, 112)"
                        : "#bdbdbd",
                    backgroundColor: isDraggingFile
                      ? "rgba(33, 61, 112, 0.08)"
                      : attachmentName
                        ? "rgba(33, 61, 112, 0.03)"
                        : "#fafafa",
                    cursor: isReadOnly ? "default" : "pointer",
                    pointerEvents: isReadOnly ? "none" : "auto",
                    opacity: isReadOnly ? 0.6 : 1,
                    transition: "all 0.2s ease-in-out",
                    "&:hover": {
                      borderColor: "rgb(33, 61, 112)",
                      backgroundColor: "rgba(33, 61, 112, 0.05)",
                    },
                  }}>
                  {/* input must come first: the label activates its first labelable child */}
                  <input
                    hidden
                    type="file"
                    onChange={(e) => {
                      handleFileChange(e);
                      // reset so the same file can be picked again
                      e.target.value = "";
                    }}
                  />
                  <Box
                    sx={{
                      width: 44,
                      height: 44,
                      borderRadius: "50%",
                      flexShrink: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: "rgba(33, 61, 112, 0.08)",
                      color: "rgb(33, 61, 112)",
                    }}>
                    {attachmentName ? (
                      <InsertDriveFileOutlinedIcon />
                    ) : (
                      <CloudUploadOutlinedIcon />
                    )}
                  </Box>

                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography
                      sx={{
                        fontSize: "10px",
                        fontWeight: 700,
                        letterSpacing: "0.5px",
                        textTransform: "uppercase",
                        color: "text.secondary",
                      }}>
                      Position Attachment{attachmentRequired ? " *" : ""}
                    </Typography>
                    <Typography
                      noWrap
                      sx={{
                        fontSize: "13px",
                        fontWeight: attachmentName ? 700 : 400,
                        color: attachmentName
                          ? "text.primary"
                          : "text.secondary",
                      }}>
                      {attachmentName || "Click to browse or drag a file here"}
                    </Typography>
                    {attachmentName && (
                      <Typography
                        sx={{ fontSize: "11px", color: "text.secondary" }}>
                        Click or drop a file to replace
                      </Typography>
                    )}
                  </Box>

                  {canViewAttachment && (
                    <Tooltip title="View Attachment">
                      <IconButton
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleViewAttachment();
                        }}
                        size="small"
                        sx={{ color: "rgb(33, 61, 112)" }}>
                        <VisibilityIcon />
                      </IconButton>
                    </Tooltip>
                  )}
                </Box>
                {errors.position_attachment && (
                  <Typography
                    sx={{
                      fontSize: "12px",
                      color: "#d32f2f",
                      mt: 0.75,
                      ml: 0.5,
                    }}>
                    Attachment is required
                  </Typography>
                )}
              </FormCard>
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={styles.dialogActions}>
          {isViewMode && (
            <Button
              onClick={handleClose}
              variant="outlined"
              sx={{ color: "rgb(33, 61, 112)", borderColor: "#ccc" }}>
              CLOSE
            </Button>
          )}
          {!isReadOnly && (
            <Button
              onClick={handleSubmit}
              variant="contained"
              disabled={isProcessing || isAdding || isUpdating}>
              {isAdding || isUpdating ? (
                "Saving..."
              ) : (
                <>
                  {isEditMode
                    ? CONSTANT.BUTTONS.ADD.icon2
                    : CONSTANT.BUTTONS.ADD.icon1}
                  {isEditMode
                    ? CONSTANT.BUTTONS.ADD.label2
                    : CONSTANT.BUTTONS.ADD.label1}
                </>
              )}
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {attachmentDialogOpen && (
        <PositionDialog
          open={attachmentDialogOpen}
          onClose={() => setAttachmentDialogOpen(false)}
          position={fullPositionData || position}
        />
      )}
    </>
  );
}

export default PositionsModal;
