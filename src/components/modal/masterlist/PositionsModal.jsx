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
} from "@mui/icons-material";
import EditOffIcon from "@mui/icons-material/EditOff";
import { useSnackbar } from "notistack";
import {
  usePostPositionMutation,
  useUpdatePositionMutation,
} from "../../../features/api/masterlist/positionsApi";
import { useGetAllShowTitlesQuery } from "../../../features/api/extras/titleApi";
import { useGetAllShowTeamsQuery } from "../../../features/api/extras/teamsApi";
import { useGetAllShowSchedulesQuery } from "../../../features/api/extras/schedulesApi";
import { useLazyGetAllEmployeesQuery } from "../../../features/api/employee/mainApi";
import { CONSTANT } from "../../../config";
import { useGetAllShowToolsQuery } from "../../../features/api/extras/toolsApi";
import { useGetAllOneRdfQuery } from "../../../features/api/masterlist/realonerdfApi";
import RequestorSequence from "./RequestorSequence";

export default function PositionsModal({
  open,
  handleClose,
  refetch,
  selectedPosition,
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
  const [isInitialized, setIsInitialized] = useState(false);
  const [requestorSequence, setRequestorSequence] = useState([]);
  const [currentMode, setCurrentMode] = useState(edit);
  const [originalMode, setOriginalMode] = useState(edit);
  const { enqueueSnackbar } = useSnackbar();

  const { data: toolsListRaw = [], isLoading: toolsLoading } =
    useGetAllShowToolsQuery();

  const { data: titlesData, isLoading: titlesLoading } =
    useGetAllShowTitlesQuery();

  const { data: schedulesData, isLoading: schedulesLoading } =
    useGetAllShowSchedulesQuery();

  const { data: teamsData, isLoading: teamsLoading } =
    useGetAllShowTeamsQuery();

  const [
    getAllEmployees,
    { data: employeesData, isLoading: employeesLoading },
  ] = useLazyGetAllEmployeesQuery();

  const { data: chargingData, isLoading: chargingLoading } =
    useGetAllOneRdfQuery();

  const [postPosition, { isLoading: isAdding }] = usePostPositionMutation();
  const [updatePosition, { isLoading: isUpdating }] =
    useUpdatePositionMutation();

  const normalizeData = (data) => {
    if (!data) return [];
    const result = data.result?.data || data.result || [];
    return result;
  };

  const toolsList = useMemo(() => normalizeData(toolsListRaw), [toolsListRaw]);
  const titlesList = useMemo(() => normalizeData(titlesData), [titlesData]);
  const schedulesList = useMemo(
    () => normalizeData(schedulesData),
    [schedulesData]
  );
  const teamsList = useMemo(() => normalizeData(teamsData), [teamsData]);
  const employeesList = useMemo(
    () => normalizeData(employeesData),
    [employeesData]
  );
  const chargingList = useMemo(
    () => normalizeData(chargingData),
    [chargingData]
  );

  const isLoading =
    toolsLoading ||
    titlesLoading ||
    schedulesLoading ||
    teamsLoading ||
    employeesLoading ||
    chargingLoading;

  useEffect(() => {
    if (open) {
      getAllEmployees();
    }
  }, [open, getAllEmployees]);

  useEffect(() => {
    if (open) {
      setCurrentMode(edit);
      setOriginalMode(edit);
    }
  }, [open, edit]);

  const handleModeChange = (newMode) => {
    setCurrentMode(newMode);
  };

  const handleCancelEdit = () => {
    setCurrentMode(originalMode);
    if (selectedPosition) {
      initializeFormData();
    }
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
      [name]: name === "tools" ? value : value,
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

    if (currentMode !== true && currentMode !== "edit") {
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
        return tool?.id;
      })
      .filter(Boolean);
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

    const payload = {
      code: formData.code,
      title_id: formData.titles,
      superior_id: formData.superior_name || null,
      pay_frequency: formData.pay_frequency,
      schedule_id: formData.schedule,
      team_id: formData.team,
      charging_id: formData.charging,
      "tools[]": toolIds,
      "requester_user_ids[]": requestorIds,
      status: showArchived ? "inactive" : "active",
      position_attachment: formData.position_attachment,
    };

    const formDataToSend = new FormData();

    Object.entries(payload).forEach(([key, value]) => {
      if (key !== "position_attachment" && value != null) {
        formDataToSend.append(key, value);
      }
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
          id: selectedPosition.id,
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

  const initializeFormData = () => {
    if (selectedPosition && !isLoading && !isInitialized && open) {
      let toolNames = [];

      if (Array.isArray(selectedPosition.tools)) {
        if (
          selectedPosition.tools.length > 0 &&
          typeof selectedPosition.tools[0] === "object" &&
          selectedPosition.tools[0] !== null
        ) {
          toolNames = selectedPosition.tools
            .map((tool) => tool?.name || "")
            .filter(Boolean);
        } else if (
          selectedPosition.tools.length > 0 &&
          typeof selectedPosition.tools[0] === "number"
        ) {
          toolNames = selectedPosition.tools
            .map((toolId) => {
              const tool = toolsList.find((t) => t.id === toolId);
              return tool?.name || "";
            })
            .filter(Boolean);
        } else if (
          selectedPosition.tools.length > 0 &&
          typeof selectedPosition.tools[0] === "string"
        ) {
          toolNames = selectedPosition.tools;
        }
      }

      let attachmentInfo = null;
      if (selectedPosition.position_attachment) {
        if (typeof selectedPosition.position_attachment === "string") {
          attachmentInfo = {
            name: selectedPosition.position_attachment.split("/").pop(),
            original: selectedPosition.position_attachment,
          };
        } else if (typeof selectedPosition.position_attachment === "object") {
          attachmentInfo = {
            ...selectedPosition.position_attachment,
            original:
              selectedPosition.position_attachment.url ||
              selectedPosition.position_attachment.path ||
              selectedPosition.position_attachment.original,
          };
        }
      }

      setFormData({
        name: selectedPosition.name,
        code: selectedPosition.code,
        superior_name:
          selectedPosition.superior?.id || selectedPosition.superior_id || null,
        pay_frequency: selectedPosition.pay_frequency || "",
        tools: toolNames,
        titles: selectedPosition.title_id || "",
        schedule: selectedPosition.schedule_id || "",
        team: selectedPosition.team_id || "",
        charging:
          selectedPosition.charging?.id || selectedPosition.charging_id || "",
        position_attachment: attachmentInfo,
      });

      if (
        selectedPosition.requesters &&
        Array.isArray(selectedPosition.requesters)
      ) {
        const requestorsList = selectedPosition.requesters.map((requestor) => {
          const employee = employeesList.find(
            (e) => e.id === requestor.employee_id
          );
          return {
            id: requestor.id || requestor.user_id || requestor,
            name:
              requestor.full_name ||
              requestor.name ||
              requestor.user_name ||
              "Unknown User",
            position:
              employee?.position?.name ||
              employee?.title?.name ||
              "No Position",
            department:
              employee?.department?.name ||
              employee?.unit?.name ||
              "No Department",
            employee_id: requestor.employee_id,
            user_id: requestor.id,
          };
        });
        setRequestorSequence(requestorsList);
      }

      setIsInitialized(true);
    }
  };

  useEffect(() => {
    if (open) {
      setIsInitialized(false);
      setErrors({});
      setErrorMessage(null);
      setRequestorSequence([]);

      if (!selectedPosition) {
        setFormData({
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
        setRequestorSequence([]);
        setIsInitialized(true);
      }
    }
  }, [open, selectedPosition]);

  useEffect(() => {
    initializeFormData();
  }, [
    selectedPosition,
    isLoading,
    toolsList,
    employeesList,
    open,
    isInitialized,
  ]);

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

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="lg">
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          pb: 1,
          backgroundColor: "#fff",
        }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <WorkOutlineIcon sx={{ color: "rgb(33, 61, 112)" }} />
          <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
            {getModalTitle()}
          </Typography>
          {isViewMode && (
            <Tooltip title="EDIT POSITION" arrow placement="top">
              <IconButton
                onClick={() => handleModeChange("edit")}
                disabled={isLoading}
                size="small"
                sx={{
                  ml: 1,
                  padding: "8px",
                  "&:hover": {
                    backgroundColor: "rgba(0, 136, 32, 0.08)",
                    transform: "scale(1.1)",
                    transition: "all 0.2s ease-in-out",
                  },
                }}>
                <EditIcon
                  sx={{
                    fontSize: "20px",
                    "& path": {
                      fill: isLoading
                        ? "rgba(0, 0, 0, 0.26)"
                        : "rgba(0, 136, 32, 1)",
                    },
                  }}
                />
              </IconButton>
            </Tooltip>
          )}
          {isEditMode && originalMode === "view" && (
            <Tooltip title="CANCEL EDIT">
              <IconButton
                onClick={handleCancelEdit}
                disabled={isLoading}
                size="small"
                sx={{
                  ml: 1,
                  padding: "8px",
                  "&:hover": {
                    backgroundColor: "rgba(235, 0, 0, 0.08)",
                    transform: "scale(1.1)",
                    transition: "all 0.2s ease-in-out",
                  },
                }}>
                <EditOffIcon
                  sx={{
                    fontSize: "20px",
                    "& path": {
                      fill: "rgba(235, 0, 0, 1)",
                    },
                  }}
                />
              </IconButton>
            </Tooltip>
          )}
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <IconButton
            onClick={handleClose}
            sx={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              backgroundColor: "#fff",
              "&:hover": {
                backgroundColor: "#f5f5f5",
              },
              transition: "all 0.2s ease-in-out",
            }}>
            <CloseIcon
              sx={{
                fontSize: "18px",
                color: "#333",
              }}
            />
          </IconButton>
        </Box>
      </DialogTitle>

      {errorMessage && (
        <DialogContentText dividers>
          <Alert severity="error" sx={{ mb: 2 }}>
            {errorMessage}
          </Alert>
        </DialogContentText>
      )}

      <DialogContent>
        {isLoading ? (
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            padding={4}>
            <CircularProgress />
          </Box>
        ) : (
          <Box>
            <Box
              display="grid"
              gridTemplateColumns="1fr 1fr"
              gap={1.5}
              sx={{ paddingTop: "14px" }}>
              <Box gridColumn="span 2">
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
              </Box>

              <TextField
                label="Code"
                name="code"
                value={formData.code}
                onChange={handleChange}
                error={errors.code}
                helperText={errors.code && "Code is required"}
                disabled={isReadOnly}
                required
              />

              <Autocomplete
                options={employeesList}
                getOptionLabel={(option) => {
                  return (
                    option?.name ||
                    option?.full_name ||
                    option?.employee_name ||
                    ""
                  );
                }}
                value={
                  employeesList.find((e) => e.id === formData.superior_name) ||
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

              <Autocomplete
                options={schedulesList}
                getOptionLabel={(option) => option?.name || ""}
                value={
                  schedulesList.find((s) => s.id === formData.schedule) || null
                }
                onChange={(e, value) => {
                  setFormData((prev) => ({
                    ...prev,
                    schedule: value?.id || "",
                  }));
                  clearFieldError("schedule");
                }}
                disabled={isReadOnly}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Schedule"
                    name="schedule"
                    fullWidth
                    error={errors.schedule}
                    helperText={errors.schedule && "Please select a schedule"}
                    required
                  />
                )}
              />

              <Autocomplete
                options={teamsList}
                getOptionLabel={(option) => option?.name || ""}
                value={teamsList.find((t) => t.id === formData.team) || null}
                onChange={(e, value) => {
                  setFormData((prev) => ({
                    ...prev,
                    team: value?.id || "",
                  }));
                  clearFieldError("team");
                }}
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

              <Autocomplete
                options={chargingList}
                getOptionLabel={(option) => {
                  return option?.name || "";
                }}
                value={
                  chargingList.find((c) => c.id === formData.charging) || null
                }
                onChange={(e, value) => {
                  setFormData((prev) => ({
                    ...prev,
                    charging: value?.id || "",
                  }));
                  clearFieldError("charging");
                }}
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

              <Box sx={{ gridColumn: "span 2" }}>
                <Box sx={{ position: "relative" }}>
                  <TextField
                    fullWidth
                    label="Position Attachment"
                    value={getAttachmentDisplayName()}
                    InputLabelProps={{ shrink: true }}
                    InputProps={{
                      readOnly: true,
                      endAdornment: (
                        <Button
                          component="label"
                          variant="outlined"
                          size="large"
                          disabled={isReadOnly}
                          sx={{ ml: 1, minWidth: "120px" }}>
                          {getAttachmentDisplayName()
                            ? "Change"
                            : "Attach File Here"}
                          <input
                            hidden
                            type="file"
                            onChange={handleFileChange}
                          />
                        </Button>
                      ),
                    }}
                    error={errors.position_attachment}
                    helperText={
                      errors.position_attachment
                        ? "Attachment is required"
                        : null
                    }
                    required={currentMode !== true && currentMode !== "edit"}
                    sx={{
                      "& .MuiInputBase-input": {
                        cursor: "default",
                        caretColor: "transparent",
                      },
                    }}
                  />
                </Box>
              </Box>

              <Box gridColumn="span 2">
                <Autocomplete
                  multiple
                  options={toolsList}
                  getOptionLabel={(option) => {
                    if (typeof option === "string") return option;
                    return option?.name || "";
                  }}
                  value={formData.tools.map((toolName) => {
                    const matchingTool = toolsList.find(
                      (t) => t.name === toolName
                    );
                    return matchingTool || { name: toolName };
                  })}
                  onChange={(event, newValue) => {
                    const toolNames = newValue
                      .map((value) => {
                        if (typeof value === "string") return value;
                        return value?.name || "";
                      })
                      .filter(Boolean);

                    setFormData((prev) => ({
                      ...prev,
                      tools: toolNames,
                    }));
                    clearFieldError("tools");
                  }}
                  disabled={isReadOnly}
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
                  isOptionEqualToValue={(option, value) => {
                    if (
                      typeof option === "string" &&
                      typeof value === "string"
                    ) {
                      return option === value;
                    }
                    if (
                      typeof option === "object" &&
                      typeof value === "object"
                    ) {
                      return option?.name === value?.name;
                    }
                    if (
                      typeof option === "string" &&
                      typeof value === "object"
                    ) {
                      return option === value?.name;
                    }
                    if (
                      typeof option === "object" &&
                      typeof value === "string"
                    ) {
                      return option?.name === value;
                    }
                    return false;
                  }}
                />
              </Box>
            </Box>

            <RequestorSequence
              requestorSequence={requestorSequence}
              setRequestorSequence={setRequestorSequence}
              isReadOnly={isReadOnly}
              errors={errors}
              employeesList={employeesList}
            />
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={handleClose}>Cancel</Button>
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
  );
}
