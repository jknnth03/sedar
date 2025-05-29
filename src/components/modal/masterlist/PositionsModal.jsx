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
import { useGetAllShowCompaniesQuery } from "../../../features/api/masterlist/companiesApi";
import { useGetAllShowBusinessunitsQuery } from "../../../features/api/masterlist/businessunitsApi";
import { useGetAllShowDepartmentsQuery } from "../../../features/api/masterlist/departmentsApi";
import { useGetAllShowUnitsQuery } from "../../../features/api/masterlist/unitsApi";
import { useGetAllShowSubunitsQuery } from "../../../features/api/masterlist/subunitsApi";
import { useGetAllShowLocationsQuery } from "../../../features/api/masterlist/locationsApi";
import { useGetAllShowTitlesQuery } from "../../../features/api/extras/titleApi";
import { useGetAllShowTeamsQuery } from "../../../features/api/extras/teamsApi";
import { useGetAllShowSchedulesQuery } from "../../../features/api/extras/schedulesApi";
import { CONSTANT } from "../../../config";
import { useGetAllShowToolsQuery } from "../../../features/api/extras/toolsApi";

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
    company_name: null,
    business_unit_name: null,
    department_name: null,
    unit_name: null,
    subunit_name: null,
    location_name: null,
    superior_name: null,
    pay_frequency: "",
    tools: [],
    schedule: "",
    team: "",
    position_attachment: null,
  });

  console.log(formData);

  const [errors, setErrors] = useState({});
  const [errorMessage, setErrorMessage] = useState(null);
  const { enqueueSnackbar } = useSnackbar();

  // API queries with proper error handling
  const {
    data: companiesData,
    isLoading: companiesLoading,
    error: companiesError,
  } = useGetAllShowCompaniesQuery();

  const { data: businessUnitsData, isLoading: businessUnitsLoading } =
    useGetAllShowBusinessunitsQuery();

  const { data: departmentsDataRaw, isLoading: departmentsLoading } =
    useGetAllShowDepartmentsQuery();

  const { data: unitsData, isLoading: unitsLoading } =
    useGetAllShowUnitsQuery();

  const { data: subunitsData, isLoading: subunitsLoading } =
    useGetAllShowSubunitsQuery();

  const { data: locationsData, isLoading: locationsLoading } =
    useGetAllShowLocationsQuery();

  const { data: toolsListRaw = [], isLoading: toolsLoading } =
    useGetAllShowToolsQuery();

  const { data: titlesData, isLoading: titlesLoading } =
    useGetAllShowTitlesQuery();

  const { data: schedulesData, isLoading: schedulesLoading } =
    useGetAllShowSchedulesQuery();

  const { data: teamsData, isLoading: teamsLoading } =
    useGetAllShowTeamsQuery();

  const [postPosition, { isLoading: isAdding }] = usePostPositionMutation();
  const [updatePosition, { isLoading: isUpdating }] =
    useUpdatePositionMutation();

  // Normalize data access to handle different API response structures
  const normalizeData = (data) => {
    if (!data) return [];
    return data.result?.data || data.result || [];
  };

  const companiesList = normalizeData(companiesData);
  const businessUnitsList = normalizeData(businessUnitsData);
  const departmentsList = normalizeData(departmentsDataRaw);
  const unitsList = normalizeData(unitsData);
  const subunitsList = normalizeData(subunitsData);
  const locationsList = normalizeData(locationsData);
  const toolsList = normalizeData(toolsListRaw);
  const titlesList = normalizeData(titlesData);
  const schedulesList = normalizeData(schedulesData);
  const teamsList = normalizeData(teamsData);

  // Check if any critical data is missing
  const dataLoadingError = useMemo(() => {
    if (companiesError) return "Failed to load companies data.";
    if (companiesList.length === 0 && !companiesLoading)
      return "No companies available.";
    return null;
  }, [companiesError, companiesList, companiesLoading]);

  // Loading state for the entire form
  const isLoading =
    companiesLoading ||
    businessUnitsLoading ||
    departmentsLoading ||
    unitsLoading ||
    subunitsLoading ||
    locationsLoading ||
    toolsLoading ||
    titlesLoading ||
    schedulesLoading ||
    teamsLoading;

  // Filtered data for cascading dropdowns
  const filteredBusinessUnits = useMemo(() => {
    if (!formData.company_name?.sync_id) return [];
    return businessUnitsList.filter(
      (b) => b.company_id === formData.company_name.sync_id
    );
  }, [formData.company_name, businessUnitsList]);

  const filteredDepartments = useMemo(() => {
    if (!formData.business_unit_name?.sync_id) return [];
    return departmentsList.filter(
      (d) => d.business_unit_id === formData.business_unit_name.sync_id
    );
  }, [formData.business_unit_name, departmentsList]);

  const filteredUnits = useMemo(() => {
    if (!formData.department_name?.sync_id) return [];
    return unitsList.filter(
      (u) => u.department_id === formData.department_name.sync_id
    );
  }, [formData.department_name, unitsList]);

  const filteredSubunits = useMemo(() => {
    if (!formData.unit_name?.sync_id) return [];
    const selectedUnit = unitsList.find(
      (u) => u.sync_id === formData.unit_name.sync_id
    );
    return selectedUnit?.sub_units || [];
  }, [formData.unit_name, unitsList]);

  const filteredLocations = useMemo(() => {
    if (!formData.subunit_name?.sync_id) return [];
    const selectedSubunit = subunitsList.find(
      (s) => s.sync_id === formData.subunit_name.sync_id
    );
    return selectedSubunit?.locations || [];
  }, [formData.subunit_name, subunitsList]);

  // Clear field error when user makes changes
  const clearFieldError = (fieldName) => {
    setErrors((prev) => ({
      ...prev,
      [fieldName]: false,
    }));
    // Only clear general error message if it's a validation error
    if (
      errorMessage &&
      errorMessage.includes("Please fill out all required fields")
    ) {
      setErrorMessage(null);
    }
  };

  // Handle generic form input changes
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

  console.log("handleFileChange", formData.position_attachment);

  const validateForm = () => {
    const newErrors = {
      titles: !formData.titles,
      code: !formData.code || !formData.code.trim(),
      company_name: !formData.company_name,
      business_unit_name: !formData.business_unit_name,
      department_name: !formData.department_name,
      unit_name: !formData.unit_name,
      subunit_name: !formData.subunit_name,
      location_name: !formData.location_name,
      pay_frequency: !formData.pay_frequency,
      schedule: !formData.schedule,
      team: !formData.team,
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
      company_id: formData.company_name?.sync_id,
      business_unit_id: formData.business_unit_name?.sync_id,
      department_id: formData.department_name?.sync_id,
      unit_id: formData.unit_name?.sync_id,
      sub_unit_id: formData.subunit_name?.sync_id,
      location_id: formData.location_name?.sync_id,
      superior_id: null,
      pay_frequency: formData.pay_frequency,
      schedule_id: formData.schedule,
      team_id: formData.team,
      "tools[]": toolIds,
      status: showArchived ? "inactive" : "active",
      position_attachment: formData.position_attachment,
    };

    console.log("handleSubmit", payload);

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

    console.log(formDataToSend);

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

  useEffect(() => {
    if (selectedPosition && !isLoading) {
      const foundCompany = companiesList.find(
        (c) => c.sync_id === selectedPosition?.company?.sync_id
      );

      const foundBusinessUnit = businessUnitsList.find(
        (b) => b.sync_id === selectedPosition?.business_unit?.sync_id
      );

      const foundDepartment = departmentsList.find(
        (d) => d.sync_id === selectedPosition?.department?.sync_id
      );

      const foundUnit = unitsList.find(
        (u) => u.sync_id === selectedPosition?.unit?.sync_id
      );

      const foundSubunit = subunitsList.find(
        (s) => s.sync_id === selectedPosition?.sub_unit?.sync_id
      );

      const foundLocation = locationsList.find(
        (l) => l.sync_id === selectedPosition?.location?.sync_id
      );

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

      // In your useEffect for initializing edit data:
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
        company_name: foundCompany || null,
        business_unit_name: foundBusinessUnit || null,
        department_name: foundDepartment || null,
        unit_name: foundUnit || null,
        subunit_name: foundSubunit || null,
        location_name: foundLocation || null,
        superior_name: selectedPosition.superior_name || null,
        pay_frequency: selectedPosition.pay_frequency || "",
        tools: toolNames,
        titles: selectedPosition.title_id || "",
        schedule: selectedPosition.schedule_id || "",
        team: selectedPosition.team_id || "",
        position_attachment: attachmentInfo, // Store the attachment info directly
      });

      // Clear errors when editing
      setErrors({});
      setErrorMessage(null);
    } else if (!selectedPosition) {
      // Reset form when adding new position
      setFormData({
        titles: "",
        code: "",
        company_name: null,
        business_unit_name: null,
        department_name: null,
        unit_name: null,
        subunit_name: null,
        location_name: null,
        superior_name: null,
        pay_frequency: "",
        tools: [],
        schedule: "",
        team: "",
        position_attachment: null,
      });
      setErrors({});
      setErrorMessage(null);
    }
  }, [
    selectedPosition,
    isLoading,
    companiesList,
    businessUnitsList,
    departmentsList,
    unitsList,
    subunitsList,
    locationsList,
    toolsList,
  ]);

  // Handler functions for cascading dropdowns
  const handleCompanyChange = (company) => {
    setFormData((prev) => ({
      ...prev,
      company_name: company,
      business_unit_name: null,
      department_name: null,
      unit_name: null,
      subunit_name: null,
      location_name: null,
    }));
    clearFieldError("company_name");
  };

  const handleBusinessUnitChange = (businessUnit) => {
    setFormData((prev) => ({
      ...prev,
      business_unit_name: businessUnit,
      department_name: null,
      unit_name: null,
      subunit_name: null,
      location_name: null,
    }));
    clearFieldError("business_unit_name");
  };

  const handleDepartmentChange = (department) => {
    setFormData((prev) => ({
      ...prev,
      department_name: department,
      unit_name: null,
      subunit_name: null,
      location_name: null,
    }));
    clearFieldError("department_name");
  };

  const handleUnitChange = (unit) => {
    setFormData((prev) => ({
      ...prev,
      unit_name: unit,
      subunit_name: null,
      location_name: null,
    }));
    clearFieldError("unit_name");
  };

  const handleSubunitChange = (subunit) => {
    setFormData((prev) => ({
      ...prev,
      subunit_name: subunit,
      location_name: null,
    }));
    clearFieldError("subunit_name");
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

      {(errorMessage || dataLoadingError) && (
        <DialogContentText dividers>
          <Alert severity="error" sx={{ mb: 2 }}>
            {errorMessage || dataLoadingError}
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
            {/* Titles */}
            <Autocomplete
              options={titlesList}
              getOptionLabel={(option) => option?.name || ""}
              value={titlesList.find((t) => t.id === formData.titles) || null}
              onChange={(e, value) => {
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

            {/* Code */}
            <TextField
              label="Code"
              name="code"
              value={formData.code}
              onChange={handleChange}
              error={errors.code}
              helperText={errors.code && "Code is required"}
              required
            />

            {/* Company */}
            <Autocomplete
              options={companiesList}
              getOptionLabel={(option) => option?.name || ""}
              value={formData.company_name}
              onChange={(e, value) => handleCompanyChange(value)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Company"
                  error={errors.company_name}
                  helperText={errors.company_name && "Please select a company"}
                  required
                />
              )}
            />

            {/* Business Unit */}
            <Autocomplete
              options={filteredBusinessUnits}
              getOptionLabel={(option) => option?.name || ""}
              value={formData.business_unit_name}
              onChange={(e, value) => handleBusinessUnitChange(value)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Business Unit"
                  error={errors.business_unit_name}
                  helperText={
                    errors.business_unit_name && "Please select a business unit"
                  }
                  required
                />
              )}
              disabled={!formData.company_name}
            />

            {/* Department */}
            <Autocomplete
              options={filteredDepartments}
              getOptionLabel={(option) => option?.name || ""}
              value={formData.department_name}
              onChange={(e, value) => handleDepartmentChange(value)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Department"
                  error={errors.department_name}
                  helperText={
                    errors.department_name && "Please select a department"
                  }
                  required
                />
              )}
              disabled={!formData.business_unit_name}
            />

            {/* Unit */}
            <Autocomplete
              options={filteredUnits}
              getOptionLabel={(option) => option?.name || ""}
              value={formData.unit_name}
              onChange={(e, value) => handleUnitChange(value)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Unit"
                  error={errors.unit_name}
                  helperText={errors.unit_name && "Please select a unit"}
                  required
                />
              )}
              disabled={!formData.department_name}
            />

            {/* Sub Unit */}
            <Autocomplete
              options={filteredSubunits}
              getOptionLabel={(option) => option?.name || ""}
              value={formData.subunit_name}
              onChange={(e, value) => handleSubunitChange(value)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Sub Unit"
                  error={errors.subunit_name}
                  helperText={errors.subunit_name && "Please select a sub unit"}
                  required
                />
              )}
              disabled={!formData.unit_name}
            />

            {/* Location */}
            <Autocomplete
              options={filteredLocations}
              getOptionLabel={(option) => option?.name || ""}
              value={formData.location_name}
              onChange={(e, value) => {
                setFormData((prev) => ({
                  ...prev,
                  location_name: value || null,
                }));
                clearFieldError("location_name");
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Location"
                  error={errors.location_name}
                  helperText={
                    errors.location_name && "Please select a location"
                  }
                  required
                />
              )}
              disabled={!formData.subunit_name}
            />

            {/* Superior Name */}
            <TextField
              label="Superior Name"
              name="superior_name"
              value=""
              onChange={handleChange}
              disabled
            />

            {/* Pay Frequency */}
            <Autocomplete
              options={["MONTHLY PAID", "DAILY PAID", "HOURLY PAID"]}
              getOptionLabel={(option) => option}
              value={formData.pay_frequency || null}
              onChange={(e, value) => {
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

            {/* Schedule */}
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

            {/* Team */}
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

            {/* Attachment */}
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

            {/* Tools */}
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
          disabled={isLoading || isAdding || isUpdating || !!dataLoadingError}>
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
