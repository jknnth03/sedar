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
} from "@mui/material";
import { useSnackbar } from "notistack";
import {
  usePostPositionMutation,
  useUpdatePositionMutation,
} from "../../../features/api/masterlist/positionsApi";
import { useGetAllShowTitlesQuery } from "../../../features/api/extras/titleApi";
import { useGetAllShowTeamsQuery } from "../../../features/api/extras/teamsApi";
import { useGetAllShowSchedulesQuery } from "../../../features/api/extras/schedulesApi";
import { CONSTANT } from "../../../config";
import { useGetAllShowToolsQuery } from "../../../features/api/extras/toolsApi";
import { useGetAllPositionsQuery } from "../../../features/api/masterlist/positionsApi";

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
  const [isInitialized, setIsInitialized] = useState(false); // Add this flag
  const { enqueueSnackbar } = useSnackbar();

  const { data: toolsListRaw = [], isLoading: toolsLoading } =
    useGetAllShowToolsQuery();

  const { data: titlesData, isLoading: titlesLoading } =
    useGetAllShowTitlesQuery();

  const { data: schedulesData, isLoading: schedulesLoading } =
    useGetAllShowSchedulesQuery();

  const { data: teamsData, isLoading: teamsLoading } =
    useGetAllShowTeamsQuery();

  const { data: chargingData, isLoading: chargingLoading } =
    useGetAllPositionsQuery();

  const [postPosition, { isLoading: isAdding }] = usePostPositionMutation();
  const [updatePosition, { isLoading: isUpdating }] =
    useUpdatePositionMutation();

  console.log("Raw API Data:");
  console.log("toolsListRaw:", toolsListRaw);
  console.log("titlesData:", titlesData);
  console.log("schedulesData:", schedulesData);
  console.log("teamsData:", teamsData);
  console.log("chargingData:", chargingData);

  const normalizeData = (data) => {
    if (!data) return [];
    const result = data.result?.data || data.result || [];
    console.log("Normalized data:", result);
    return result;
  };

  const processChargingData = (data) => {
    if (!data) return [];
    const positions = data.result?.data || data.result || [];

    const chargingMap = new Map();

    positions.forEach((position) => {
      if (position.charging && position.charging.id) {
        const charging = position.charging;
        if (!chargingMap.has(charging.id)) {
          chargingMap.set(charging.id, {
            id: charging.id,
            name: charging.name,
            code: charging.code,
          });
        }
      }
    });

    return Array.from(chargingMap.values());
  };

  // Use useMemo to prevent unnecessary recalculations
  const toolsList = useMemo(() => normalizeData(toolsListRaw), [toolsListRaw]);
  const titlesList = useMemo(() => normalizeData(titlesData), [titlesData]);
  const schedulesList = useMemo(
    () => normalizeData(schedulesData),
    [schedulesData]
  );
  const teamsList = useMemo(() => normalizeData(teamsData), [teamsData]);
  const chargingList = useMemo(
    () => processChargingData(chargingData),
    [chargingData]
  );

  console.log("Final Lists:");
  console.log("toolsList:", toolsList);
  console.log("titlesList:", titlesList);
  console.log("schedulesList:", schedulesList);
  console.log("teamsList:", teamsList);
  console.log("chargingList:", chargingList);

  if (chargingList.length > 0) {
    console.log("First charging item:", chargingList[0]);
    console.log("Charging item has id?", chargingList[0]?.id);
    console.log("Charging item has name?", chargingList[0]?.name);
  }

  const isLoading =
    toolsLoading ||
    titlesLoading ||
    schedulesLoading ||
    teamsLoading ||
    chargingLoading;

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
    };

    if (!edit) {
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

  const handleSubmit = async () => {
    setErrorMessage(null);

    if (!validateForm()) {
      setErrorMessage("Please fill out all required fields.");
      return;
    }

    const toolIds = getToolsForPayload();

    const payload = {
      code: formData.code,
      title_id: formData.titles,
      superior_id: null,
      pay_frequency: formData.pay_frequency,
      schedule_id: formData.schedule,
      team_id: formData.team,
      charging_id: formData.charging,
      "tools[]": toolIds,
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
    } else if (edit && formData.position_attachment?.original) {
      formDataToSend.append(
        "position_attachment",
        formData.position_attachment.original
      );
    }

    console.log("Form data to send:", formDataToSend);

    for (let [key, value] of formDataToSend.entries()) {
      console.log(key, value);
    }

    try {
      if (edit) {
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
      console.error("API Error:", error);
      setErrorMessage(
        error?.data?.message || "An error occurred while saving the position."
      );
    }
  };

  // Reset form when modal opens/closes
  useEffect(() => {
    if (open) {
      setIsInitialized(false);
      setErrors({});
      setErrorMessage(null);

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
        setIsInitialized(true);
      }
    }
  }, [open, selectedPosition]);

  // Initialize form data for edit mode - only run once when data is available
  useEffect(() => {
    if (selectedPosition && !isLoading && !isInitialized && open) {
      console.log("Initializing form with selectedPosition:", selectedPosition);

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

      console.log(
        "Setting form data with charging:",
        selectedPosition.charging?.id || selectedPosition.charging_id
      );

      setFormData({
        name: selectedPosition.name,
        code: selectedPosition.code,
        superior_name: selectedPosition.superior_name || null,
        pay_frequency: selectedPosition.pay_frequency || "",
        tools: toolNames,
        titles: selectedPosition.title_id || "",
        schedule: selectedPosition.schedule_id || "",
        team: selectedPosition.team_id || "",
        charging:
          selectedPosition.charging?.id || selectedPosition.charging_id || "",
        position_attachment: attachmentInfo,
      });

      setIsInitialized(true);
    }
  }, [selectedPosition, isLoading, toolsList, open, isInitialized]);

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

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
      <DialogTitle
        sx={{
          backgroundColor: "#E3F2FD",
          fontWeight: "bold",
          fontSize: "1.2rem",
          padding: "12px 16px",
        }}>
        <Box sx={{ marginLeft: "4px", display: "inline-block" }}>
          {edit === true ? "EDIT POSITION" : "ADD POSITION"}
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
          <Box
            display="grid"
            gridTemplateColumns="1fr 1fr"
            gap={1.5}
            sx={{ paddingTop: "14px" }}>
            <Autocomplete
              options={titlesList}
              getOptionLabel={(option) => option?.name || ""}
              value={titlesList.find((t) => t.id === formData.titles) || null}
              onChange={(e, value) => {
                console.log("Titles onChange:", value);
                setFormData((prev) => ({
                  ...prev,
                  titles: value?.id || "",
                }));
                clearFieldError("titles");
              }}
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

            <TextField
              label="Code"
              name="code"
              value={formData.code}
              onChange={handleChange}
              error={errors.code}
              helperText={errors.code && "Code is required"}
              required
            />

            <TextField
              label="Superior Name"
              name="superior_name"
              value=""
              onChange={handleChange}
              disabled
            />

            <Autocomplete
              options={["MONTHLY PAID", "DAILY PAID", "HOURLY PAID"]}
              getOptionLabel={(option) => option}
              value={formData.pay_frequency || null}
              onChange={(e, value) => {
                console.log("Pay frequency onChange:", value);
                handleChange({
                  target: { name: "pay_frequency", value: value || "" },
                });
              }}
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
                console.log("Schedule onChange:", value);
                setFormData((prev) => ({
                  ...prev,
                  schedule: value?.id || "",
                }));
                clearFieldError("schedule");
              }}
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
                console.log("Team onChange:", value);
                setFormData((prev) => ({
                  ...prev,
                  team: value?.id || "",
                }));
                clearFieldError("team");
              }}
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
                console.log("Charging getOptionLabel called with:", option);
                return option?.name || "";
              }}
              value={
                chargingList.find((c) => c.id === formData.charging) || null
              }
              onChange={(e, value) => {
                console.log("Charging onChange:", value);
                setFormData((prev) => ({
                  ...prev,
                  charging: value?.id || "",
                }));
                clearFieldError("charging");
              }}
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
                  InputLabelProps={{ shrink: true }}
                  InputProps={{
                    readOnly: true,
                    endAdornment: (
                      <Button
                        component="label"
                        variant="outlined"
                        size="large"
                        sx={{ ml: 1, width: "100%" }}>
                        {getAttachmentDisplayName()
                          ? "Change"
                          : "Attach File Here"}
                        <input hidden type="file" onChange={handleFileChange} />
                      </Button>
                    ),
                    startAdornment: getAttachmentDisplayName() && (
                      <Box
                        component="span"
                        sx={{
                          mr: 1,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          maxWidth: "70%",
                        }}>
                        {getAttachmentDisplayName()}
                      </Box>
                    ),
                  }}
                  error={errors.position_attachment}
                  helperText={
                    errors.position_attachment ? "Attachment is required" : null
                  }
                  required={!edit}
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
                  console.log("Tools onChange:", newValue);
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
                  if (typeof option === "string" && typeof value === "string") {
                    return option === value;
                  }
                  if (typeof option === "object" && typeof value === "object") {
                    return option?.name === value?.name;
                  }
                  if (typeof option === "string" && typeof value === "object") {
                    return option === value?.name;
                  }
                  if (typeof option === "object" && typeof value === "string") {
                    return option?.name === value;
                  }
                  return false;
                }}
              />
            </Box>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={handleClose}>Cancel</Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={isLoading || isAdding || isUpdating}>
          {isAdding || isUpdating ? (
            "Saving..."
          ) : (
            <>
              {edit === true
                ? CONSTANT.BUTTONS.ADD.icon2
                : CONSTANT.BUTTONS.ADD.icon1}
              {edit === true
                ? CONSTANT.BUTTONS.ADD.label2
                : CONSTANT.BUTTONS.ADD.label1}
            </>
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
