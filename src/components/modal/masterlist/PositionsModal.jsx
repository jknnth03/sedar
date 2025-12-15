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
import { useLazyGetAllUsersQuery } from "../../../features/api/usermanagement/userApi";
import {
  getCreateModeInitialValues,
  getViewEditModeFormData,
  getRequestorSequenceData,
  getDisplayValues,
  getInitialDropdownOptions,
  mergeDropdownOptions,
} from "./PositionModalHelpers";
import PositionDialog from "../../../pages/masterlist/positions/PositionDialog";

export default function PositionsModal({
  open,
  onClose,
  refetch,
  position,
  showArchived,
  edit,
}) {
  const [formData, setFormData] = useState({
    titles: "",
    code: "",
    superior_name: null,
    pay_frequency: "",
    tools: [],
    schedule: "",
    team: "",
    charging: "",
    position_attachment: null,
  });

  const [errors, setErrors] = useState({});
  const [errorMessage, setErrorMessage] = useState(null);
  const [requestorSequence, setRequestorSequence] = useState([]);
  const [currentMode, setCurrentMode] = useState(edit);
  const [originalMode, setOriginalMode] = useState(edit);
  const [isInitialLoad, setIsInitialLoad] = useState(false);
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

  const [fetchUsers, { data: usersData, isLoading: usersLoading }] =
    useLazyGetAllUsersQuery();

  const [fetchCharging, { data: chargingData, isLoading: chargingLoading }] =
    useLazyGetAllOneRdfQuery();

  const [getPositionById, { isFetching: isFetchingPosition }] =
    useLazyGetPositionByIdQuery();

  const [postPosition, { isLoading: isAdding }] = usePostPositionMutation();
  const [updatePosition, { isLoading: isUpdating }] =
    useUpdatePositionMutation();

  const normalizeData = (data) => {
    if (!data) return [];
    const result = data.result?.data || data.result || [];
    return result;
  };

  const toolsList = useMemo(() => normalizeData(toolsListRaw), [toolsListRaw]);
  const titlesListFromApi = useMemo(
    () => normalizeData(titlesData),
    [titlesData]
  );
  const schedulesListFromApi = useMemo(
    () => normalizeData(schedulesData),
    [schedulesData]
  );
  const teamsListFromApi = useMemo(() => normalizeData(teamsData), [teamsData]);
  const usersListFromApi = useMemo(() => normalizeData(usersData), [usersData]);
  const chargingListFromApi = useMemo(
    () => normalizeData(chargingData),
    [chargingData]
  );

  const titlesList = useMemo(
    () => mergeDropdownOptions(titlesListFromApi, initialOptions.titlesList),
    [titlesListFromApi, initialOptions.titlesList]
  );

  const schedulesList = useMemo(
    () =>
      mergeDropdownOptions(schedulesListFromApi, initialOptions.schedulesList),
    [schedulesListFromApi, initialOptions.schedulesList]
  );

  const teamsList = useMemo(
    () => mergeDropdownOptions(teamsListFromApi, initialOptions.teamsList),
    [teamsListFromApi, initialOptions.teamsList]
  );

  const usersList = useMemo(
    () => mergeDropdownOptions(usersListFromApi, initialOptions.usersList),
    [usersListFromApi, initialOptions.usersList]
  );

  const chargingList = useMemo(
    () =>
      mergeDropdownOptions(chargingListFromApi, initialOptions.chargingList),
    [chargingListFromApi, initialOptions.chargingList]
  );

  const isLoading =
    toolsLoading ||
    titlesLoading ||
    schedulesLoading ||
    teamsLoading ||
    usersLoading ||
    chargingLoading ||
    isFetchingPosition ||
    isInitialLoad;

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
          setFullPositionData(response.result);

          const dropdownOptions = getInitialDropdownOptions(response.result);
          setInitialOptions(dropdownOptions);

          const formData = getViewEditModeFormData(response.result);
          setFormData(formData);

          const requestorsList = getRequestorSequenceData(response.result);
          setRequestorSequence(requestorsList);
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

  const handleClose = () => {
    if (onClose) {
      onClose();
    }
  };

  const handleModeChange = async (newMode) => {
    if (newMode === "edit" && position?.id && currentMode === "view") {
      if (!fullPositionData) {
        try {
          setIsInitialLoad(true);
          const response = await getPositionById(position.id).unwrap();
          setFullPositionData(response.result);

          const dropdownOptions = getInitialDropdownOptions(response.result);
          setInitialOptions(dropdownOptions);

          const formData = getViewEditModeFormData(response.result);
          setFormData(formData);

          const requestorsList = getRequestorSequenceData(response.result);
          setRequestorSequence(requestorsList);
        } catch (error) {
          enqueueSnackbar("Failed to load position details", {
            variant: "error",
            autoHideDuration: 2000,
          });
          return;
        } finally {
          setIsInitialLoad(false);
        }
      } else {
        const dropdownOptions = getInitialDropdownOptions(fullPositionData);
        setInitialOptions(dropdownOptions);

        const formData = getViewEditModeFormData(fullPositionData);
        setFormData(formData);

        const requestorsList = getRequestorSequenceData(fullPositionData);
        setRequestorSequence(requestorsList);
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

  const validateForm = () => {
    const newErrors = {
      titles: !formData.titles,
      code: !formData.code || !formData.code.trim(),
      pay_frequency: !formData.pay_frequency,
      schedule: !formData.schedule,
      team: !formData.team,
      charging: !formData.charging,
      tools: formData.tools.length === 0,
      requestor_sequence: requestorSequence.length === 0,
    };

    if (
      currentMode !== true &&
      currentMode !== "edit" &&
      currentMode !== "view"
    ) {
      newErrors.position_attachment =
        !formData.position_attachment ||
        (formData.position_attachment instanceof FileList &&
          formData.position_attachment.length === 0);
    }

    setErrors(newErrors);
    return !Object.values(newErrors).some(Boolean);
  };

  const getToolsForPayload = () => {
    if (!formData.tools || formData.tools.length === 0) return [];

    return formData.tools
      .map((toolName) => {
        const tool = toolsList.find((t) => t.name === toolName);
        return tool ? tool.id : null;
      })
      .filter((id) => id !== null);
  };

  const getRequestorsForPayload = () => {
    if (!requestorSequence || requestorSequence.length === 0) return [];
    return requestorSequence.map((req) => req.id);
  };

  const handleSubmit = async () => {
    setErrorMessage(null);

    if (!validateForm()) {
      setErrorMessage("Please fill out all required fields.");
      return;
    }

    const toolIds = getToolsForPayload();
    const requestorIds = getRequestorsForPayload();

    const formDataToSend = new FormData();

    formDataToSend.append("code", formData.code);
    formDataToSend.append("title_id", formData.titles);
    if (formData.superior_name) {
      formDataToSend.append("superior_id", formData.superior_name);
    }
    formDataToSend.append("pay_frequency", formData.pay_frequency);
    formDataToSend.append("schedule_id", formData.schedule);
    formDataToSend.append("team_id", formData.team);
    formDataToSend.append("charging_id", formData.charging);
    formDataToSend.append("status", showArchived ? "inactive" : "active");

    toolIds.forEach((toolId) => {
      formDataToSend.append("tools[]", toolId);
    });

    requestorIds.forEach((requestorId) => {
      formDataToSend.append("requester_user_ids[]", requestorId);
    });

    if (formData.position_attachment instanceof File) {
      formDataToSend.append(
        "position_attachment",
        formData.position_attachment
      );
    } else if (
      (currentMode === true || currentMode === "edit") &&
      formData.position_attachment?.original
    ) {
      formDataToSend.append(
        "position_attachment",
        formData.position_attachment.original
      );
    }

    try {
      if (currentMode === true || currentMode === "edit") {
        formDataToSend.append("_method", "PATCH");

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
        error?.data?.message || "An error occurred while saving the position."
      );
    }
  };

  useEffect(() => {
    if (open) {
      setErrors({});
      setErrorMessage(null);

      if (!position || Object.keys(position).length === 0) {
        const initialValues = getCreateModeInitialValues();
        setFormData(initialValues);
        setRequestorSequence([]);
      }
    } else {
      const initialValues = getCreateModeInitialValues();
      setFormData(initialValues);
      setRequestorSequence([]);
      setErrors({});
      setErrorMessage(null);
    }
  }, [open, position]);

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

  const handleUsersOpen = () => {
    if (usersListFromApi.length === 0 && !isReadOnly) {
      fetchUsers();
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

  const getAttachmentDisplayName = () => {
    const attachment = formData.position_attachment;
    if (!attachment) return "";

    if (attachment instanceof File) {
      return attachment.name;
    } else if (typeof attachment === "object" && attachment !== null) {
      return attachment.name || "Attached Document";
    } else if (typeof attachment === "string") {
      return attachment.split("/").pop() || "Attached Document";
    }
    return "";
  };

  const handleViewAttachment = () => {
    const dataToUse = fullPositionData || position;
    if (dataToUse?.position_attachment) {
      setAttachmentDialogOpen(true);
    }
  };

  const hasExistingAttachment = () => {
    const dataToUse = fullPositionData || position;
    return !!(
      dataToUse?.position_attachment || formData.position_attachment?.original
    );
  };

  const getModalTitle = () => {
    switch (currentMode) {
      case false:
        return "ADD POSITION";
      case "view":
        return "VIEW POSITION";
      case true:
      case "edit":
        return "EDIT POSITION";
      default:
        return "Position";
    }
  };

  const isReadOnly = currentMode === "view";
  const isViewMode = currentMode === "view";
  const isEditMode = currentMode === true || currentMode === "edit";

  const dataToDisplay = fullPositionData || position;
  const displayValues = getDisplayValues(dataToDisplay);
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
              {getModalTitle()}
            </Typography>
            {isViewMode && (
              <Tooltip title="EDIT POSITION" arrow placement="top">
                <IconButton
                  onClick={() => handleModeChange("edit")}
                  disabled={isLoading}
                  size="small"
                  sx={styles.editButton}>
                  <EditIcon sx={getEditIconStyle(isLoading)} />
                </IconButton>
              </Tooltip>
            )}
            {isEditMode && originalMode === "view" && (
              <Tooltip title="CANCEL EDIT">
                <IconButton
                  onClick={handleCancelEdit}
                  disabled={isLoading}
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
          {isLoading ? (
            <Box sx={styles.loadingContainer}>
              <CircularProgress />
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
                    onOpen={handleUsersOpen}
                    disabled={isReadOnly}
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
                    value={getAttachmentDisplayName()}
                    InputLabelProps={{ shrink: true }}
                    InputProps={{
                      readOnly: true,
                      disableUnderline: false,
                      endAdornment: (
                        <Box sx={{ display: "flex", gap: 1 }}>
                          {hasExistingAttachment() && (
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
                            {getAttachmentDisplayName()
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
                      getOptionLabel={(option) => {
                        if (typeof option === "string") return option;
                        return option?.name || "";
                      }}
                      value={formData.tools.map(
                        (toolName) =>
                          toolsList.find((t) => t.name === toolName) || toolName
                      )}
                      onChange={(event, newValue) => {
                        const toolNames = newValue.map((item) =>
                          typeof item === "string" ? item : item.name
                        );
                        setFormData((prev) => ({
                          ...prev,
                          tools: toolNames,
                        }));
                        clearFieldError("tools");
                      }}
                      onOpen={handleToolsOpen}
                      disabled={isReadOnly}
                      isOptionEqualToValue={(option, value) => {
                        const optionName =
                          typeof option === "string" ? option : option?.name;
                        const valueName =
                          typeof value === "string" ? value : value?.name;
                        return optionName === valueName;
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
                onOpen={handleUsersOpen}
              />
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={styles.dialogActions}>
          {!isReadOnly && (
            <Button
              onClick={handleSubmit}
              variant="contained"
              disabled={isLoading || isAdding || isUpdating}>
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
