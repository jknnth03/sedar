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
  CircularProgress,
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
import { useSnackbar } from "notistack";
import {
  usePostPositionMutation,
  useUpdatePositionMutation,
  useLazyGetPositionByIdQuery,
} from "../../../features/api/masterlist/positionsApi";
import { useLazyGetAllShowTitlesQuery } from "../../../features/api/extras/titleApi";
import { useLazyGetAllShowTeamsQuery } from "../../../features/api/extras/teamsApi";
import { useLazyGetAllShowSchedulesQuery } from "../../../features/api/extras/schedulesApi";
import { CONSTANT } from "../../../config";
import { useLazyGetAllShowToolsQuery } from "../../../features/api/extras/toolsApi";
import { useLazyGetAllOneRdfQuery } from "../../../features/api/masterlist/realonerdfApi";
import RequestorSequence from "./RequestorSequence";
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
  setRequestorsFromResponse,
  setDisplayValuesFromResponse,
  setInitialDropdownOptions,
} from "./PositionsModalGetValues";
import PositionDialog from "../../../pages/masterlist/positions/PositionDialog";
import { useGetAllGeneralsQuery } from "../../../features/api/employee/generalApi";

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
  const [requestorSequence, setRequestorSequence] = useState([]);
  const [currentMode, setCurrentMode] = useState(edit);
  const [originalMode, setOriginalMode] = useState(edit);
  const [isInitialLoad, setIsInitialLoad] = useState(false);
  const [isSwitchingMode, setIsSwitchingMode] = useState(false);
  const [fullPositionData, setFullPositionData] = useState(null);
  const [attachmentDialogOpen, setAttachmentDialogOpen] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  const [initialOptions, setInitialOptions] = useState({
    titlesList: [],
    schedulesList: [],
    teamsList: [],
    chargingList: [],
    usersList: [],
  });

  const [fetchTools, { data: toolsListRaw = [], isLoading: toolsLoading }] =
    useLazyGetAllShowToolsQuery();
  const [fetchTitles, { data: titlesData, isLoading: titlesLoading }] =
    useLazyGetAllShowTitlesQuery();
  const [fetchSchedules, { data: schedulesData, isLoading: schedulesLoading }] =
    useLazyGetAllShowSchedulesQuery();
  const [fetchTeams, { data: teamsData, isLoading: teamsLoading }] =
    useLazyGetAllShowTeamsQuery();
  const { data: usersData, isLoading: usersLoading } = useGetAllGeneralsQuery();
  const [fetchCharging, { data: chargingData, isLoading: chargingLoading }] =
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
  const usersListFromApi = useMemo(() => normalizeData(usersData), [usersData]);
  const chargingListFromApi = useMemo(
    () => normalizeData(chargingData),
    [chargingData],
  );

  const titlesList = useMemo(
    () => mergeDropdownOptions(titlesListFromApi, initialOptions.titlesList),
    [titlesListFromApi, initialOptions.titlesList],
  );
  const schedulesList = useMemo(
    () =>
      mergeDropdownOptions(schedulesListFromApi, initialOptions.schedulesList),
    [schedulesListFromApi, initialOptions.schedulesList],
  );
  const teamsList = useMemo(
    () => mergeDropdownOptions(teamsListFromApi, initialOptions.teamsList),
    [teamsListFromApi, initialOptions.teamsList],
  );
  const usersList = useMemo(
    () => mergeDropdownOptions(usersListFromApi, initialOptions.usersList),
    [usersListFromApi, initialOptions.usersList],
  );
  const chargingList = useMemo(
    () =>
      mergeDropdownOptions(chargingListFromApi, initialOptions.chargingList),
    [chargingListFromApi, initialOptions.chargingList],
  );

  const isProcessing = isSwitchingMode || isInitialLoad;

  useEffect(() => {
    if (open) {
      setCurrentMode(edit);
      setOriginalMode(edit);
      setFullPositionData(null);
      setInitialOptions({
        titlesList: [],
        schedulesList: [],
        teamsList: [],
        chargingList: [],
        usersList: [],
      });
    }
  }, [open, edit]);

  useEffect(() => {
    if (open && position?.id && (edit === true || edit === "view")) {
      const fetchFullData = async () => {
        try {
          setIsInitialLoad(true);
          const response = await getPositionById(position.id).unwrap();
          const apiData = response.result;

          setFullPositionData(apiData);
          setInitialOptions(setInitialDropdownOptions(apiData));
          setFormData(setFormValuesFromResponse(apiData));
          setRequestorSequence(setRequestorsFromResponse(apiData.requesters));
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
  }, [open, position?.id, edit, getPositionById, enqueueSnackbar]);

  useEffect(() => {
    if (open) {
      setErrors({});
      setErrorMessage(null);

      if (!position || Object.keys(position).length === 0) {
        setFormData(setCreateModeValues());
        setRequestorSequence([]);
      }
    } else {
      setFormData(setCreateModeValues());
      setRequestorSequence([]);
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
          setInitialOptions(setInitialDropdownOptions(apiData));
          setFormData(setFormValuesFromResponse(apiData));
          setRequestorSequence(setRequestorsFromResponse(apiData.requesters));
        } else {
          setInitialOptions(setInitialDropdownOptions(fullPositionData));
          setFormData(setFormValuesFromResponse(fullPositionData));
          setRequestorSequence(
            setRequestorsFromResponse(fullPositionData.requesters),
          );
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

    const validation = validatePositionForm(
      formData,
      requestorSequence,
      currentMode,
    );

    if (!validation.isValid) {
      setErrors(validation.errors);
      setErrorMessage("Please fill out all required fields.");
      return;
    }

    const formDataToSend = buildFormDataPayload(
      formData,
      requestorSequence,
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
    if (titlesList.length === 0 && !isReadOnly) {
      fetchTitles();
    }
  };

  const handleSchedulesOpen = () => {
    if (schedulesList.length === 0 && !isReadOnly) {
      fetchSchedules();
    }
  };

  const handleTeamsOpen = () => {
    if (teamsList.length === 0 && !isReadOnly) {
      fetchTeams();
    }
  };

  const handleChargingOpen = () => {
    if (chargingList.length === 0 && !isReadOnly) {
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

  return (
    <>
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="lg">
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

              <Box sx={{ mt: 3 }}>
                <Skeleton
                  variant="text"
                  width="40%"
                  height={24}
                  sx={{ mb: 2 }}
                />
                <Skeleton variant="rounded" height={180} />
              </Box>
            </Box>
          ) : (
            <Box>
              <Box sx={styles.formGrid}>
                <Box sx={styles.fullWidthColumn}>
                  {isReadOnly ? (
                    <TextField
                      label="Titles"
                      value={displayTitle || ""}
                      disabled
                      fullWidth
                      required
                    />
                  ) : (
                    <Autocomplete
                      options={titlesList}
                      getOptionLabel={(option) => option?.name || ""}
                      value={
                        titlesList.find((t) => t.id === formData.titles) || null
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
                      loading={titlesLoading}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Titles"
                          name="titles"
                          fullWidth
                          error={errors.titles}
                          helperText={errors.titles && "Please select a title"}
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
                    getOptionLabel={(option) => {
                      return (
                        option?.full_name ||
                        option?.name ||
                        option?.username ||
                        ""
                      );
                    }}
                    value={
                      usersList.find((u) => u.id === formData.superior_name) ||
                      null
                    }
                    onChange={(e, value) => {
                      setFormData((prev) => ({
                        ...prev,
                        superior_name: value?.id || null,
                      }));
                      clearFieldError("superior_name");
                    }}
                    disabled={isReadOnly}
                    loading={usersLoading}
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
                      schedulesList.find((s) => s.id === formData.schedule) ||
                      null
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
                    loading={schedulesLoading}
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
                      teamsList.find((t) => t.id === formData.team) || null
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
                    loading={teamsLoading}
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
                    getOptionLabel={(option) => {
                      return option?.name || "";
                    }}
                    value={
                      chargingList.find((c) => c.id === formData.charging) ||
                      null
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
                    loading={chargingLoading}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Charging"
                        name="charging"
                        fullWidth
                        error={errors.charging}
                        helperText={errors.charging && "Please select charging"}
                        required
                      />
                    )}
                    isOptionEqualToValue={(option, value) => {
                      return option?.id === value?.id;
                    }}
                  />
                )}

                <Box sx={styles.fullWidthColumn}>
                  <TextField
                    fullWidth
                    label="Position Attachment"
                    value={getAttachmentDisplayName(
                      formData.position_attachment,
                    )}
                    InputLabelProps={{ shrink: true }}
                    InputProps={{
                      readOnly: true,
                      disableUnderline: false,
                      endAdornment: (
                        <Box sx={{ display: "flex", gap: 1 }}>
                          {hasExistingAttachment(
                            fullPositionData,
                            position,
                            formData,
                          ) && (
                            <Tooltip title="View Attachment">
                              <IconButton
                                onClick={handleViewAttachment}
                                size="small"
                                sx={{
                                  color: "rgb(33, 61, 112)",
                                }}>
                                <VisibilityIcon />
                              </IconButton>
                            </Tooltip>
                          )}
                          <Button
                            component="label"
                            variant="outlined"
                            size="large"
                            disabled={isReadOnly}
                            sx={styles.attachmentButton}>
                            {getAttachmentDisplayName(
                              formData.position_attachment,
                            )
                              ? "Change"
                              : "Attach File Here"}
                            <input
                              hidden
                              type="file"
                              onChange={handleFileChange}
                            />
                          </Button>
                        </Box>
                      ),
                    }}
                    disabled={isReadOnly}
                    error={errors.position_attachment}
                    helperText={
                      errors.position_attachment
                        ? "Attachment is required"
                        : null
                    }
                    required={
                      currentMode !== true &&
                      currentMode !== "edit" &&
                      currentMode !== "view"
                    }
                    sx={styles.attachmentField}
                  />
                </Box>

                <Box sx={styles.fullWidthColumn}>
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
                      loading={toolsLoading}
                      isOptionEqualToValue={(option, value) => {
                        return option?.id === value?.id;
                      }}
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

              <RequestorSequence
                requestorSequence={requestorSequence}
                setRequestorSequence={setRequestorSequence}
                isReadOnly={isReadOnly}
                errors={errors}
                employeesList={usersList}
              />
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={styles.dialogActions}>
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
