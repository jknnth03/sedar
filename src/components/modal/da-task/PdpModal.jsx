import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Button,
  Typography,
  IconButton,
  CircularProgress,
  Tooltip,
  Chip,
  Alert,
} from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import {
  Close as CloseIcon,
  Assignment as AssignmentIcon,
  Edit as EditIcon,
  Send as SendIcon,
  Save as SaveIcon,
  Person as PersonIcon,
} from "@mui/icons-material";
import EditOffIcon from "@mui/icons-material/EditOff";
import { useForm, useFieldArray, FormProvider } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import dayjs from "dayjs";
import { useGetPdpTaskQuery } from "../../../features/api/da-task/pdpApi";
import PdpModalFields from "./PdpModalFields";
import {
  StyledDialog,
  StyledDialogTitle,
  StyledDialogContent,
  StyledDialogActions,
  SubmitButton,
  DraftButton,
  InfoCard,
  getStatusColor,
  getStatusLabel,
} from "./PdpModalStyles";

const validationSchema = yup.object().shape({
  development_plan_objective: yup
    .string()
    .required("Development plan objective is required")
    .min(10, "Must be at least 10 characters"),
  goals: yup
    .array()
    .of(
      yup.object().shape({
        description: yup.string().required("Goal description is required"),
        target_date: yup.date().nullable().required("Target date is required"),
      })
    )
    .min(1, "At least one goal is required"),
  actions: yup.array().of(
    yup.object().shape({
      activity: yup.string().required("Activity is required"),
      due_date: yup.date().nullable().required("Due date is required"),
      goal_index: yup.number().required("Linked goal is required"),
      expected_progress: yup.string().required("Expected progress is required"),
    })
  ),
  resources: yup.array().of(
    yup.object().shape({
      resource_item: yup.string().required("Resource item is required"),
      description: yup.string().required("Description is required"),
      person_in_charge: yup.string().required("Person in charge is required"),
      due_date: yup.date().nullable().required("Due date is required"),
      goal_index: yup.number().required("Linked goal is required"),
    })
  ),
  coaching_sessions: yup.array().of(
    yup.object().shape({
      month_label: yup.string().required("Month label is required"),
      session_date: yup.date().nullable().required("Session date is required"),
      commitment: yup.string().required("Commitment is required"),
    })
  ),
});

const generateTempId = (prefix) =>
  `temp-${prefix}-${Date.now()}-${Math.random()}`;

const PdpModal = ({
  open,
  onClose,
  onSave,
  entry = null,
  mode = "view",
  isLoading: externalLoading = false,
}) => {
  const methods = useForm({
    resolver: yupResolver(validationSchema),
    mode: "onBlur",
    defaultValues: {
      development_plan_objective: "",
      goals: [],
      actions: [],
      resources: [],
      coaching_sessions: [],
    },
  });

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = methods;

  const [currentMode, setCurrentMode] = useState(mode);
  const [originalMode, setOriginalMode] = useState(mode);
  const [isUpdating, setIsUpdating] = useState(false);
  const [actionsExpanded, setActionsExpanded] = useState(true);
  const [resourcesExpanded, setResourcesExpanded] = useState(true);
  const [coachingExpanded, setCoachingExpanded] = useState(true);
  const [hasEditedForm, setHasEditedForm] = useState(false);

  const {
    fields: goalFields,
    append: appendGoal,
    remove: removeGoal,
    replace: replaceGoals,
  } = useFieldArray({
    control,
    name: "goals",
  });

  const {
    fields: actionFields,
    append: appendAction,
    remove: removeAction,
    replace: replaceActions,
  } = useFieldArray({
    control,
    name: "actions",
  });

  const {
    fields: resourceFields,
    append: appendResource,
    remove: removeResource,
    replace: replaceResources,
  } = useFieldArray({
    control,
    name: "resources",
  });

  const {
    fields: coachingFields,
    append: appendCoaching,
    remove: removeCoaching,
    replace: replaceCoaching,
  } = useFieldArray({
    control,
    name: "coaching_sessions",
  });

  const {
    data: taskData,
    isLoading: isFetchingTask,
    isFetching,
    error: fetchError,
    refetch,
  } = useGetPdpTaskQuery(entry?.id, {
    skip: !open || !entry?.id,
    refetchOnMountOrArgChange: true,
  });

  const pdpData = taskData?.result || entry;

  const loadFormData = (data) => {
    if (!data) return;

    const formattedGoals = (data.goals || []).map((goal, idx) => ({
      id: String(goal.id),
      goal_number: parseInt(goal.goal_number) || idx + 1,
      description: goal.description || "",
      target_date: goal.target_date ? dayjs(goal.target_date) : null,
    }));

    const formattedActions = (data.goals || []).flatMap((goal, goalIdx) =>
      (goal.actions || []).map((action) => ({
        id: String(action.id),
        goal_index: goalIdx,
        activity: action.activity || "",
        due_date: action.due_date ? dayjs(action.due_date) : null,
        expected_progress: action.expected_progress || "",
      }))
    );

    const formattedResources = (data.goals || []).flatMap((goal, goalIdx) =>
      (goal.resources || []).map((resource) => ({
        id: String(resource.id),
        goal_index: goalIdx,
        resource_item: resource.resource_item || "",
        description: resource.description || "",
        person_in_charge: resource.person_in_charge || "",
        due_date: resource.due_date ? dayjs(resource.due_date) : null,
      }))
    );

    const formattedCoachingSessions = (data.coaching_sessions || []).map(
      (session) => ({
        id: String(session.id),
        month_label: session.month_label || "",
        session_date: session.session_date ? dayjs(session.session_date) : null,
        commitment: session.commitment || "",
      })
    );

    setValue(
      "development_plan_objective",
      data.development_plan_objective || ""
    );
    replaceGoals(formattedGoals);
    replaceActions(formattedActions);
    replaceResources(formattedResources);
    replaceCoaching(formattedCoachingSessions);
  };

  useEffect(() => {
    if (open && pdpData) {
      if (originalMode === "view" && currentMode === "view" && !hasEditedForm) {
        setCurrentMode(mode);
        setOriginalMode(mode);
        loadFormData(pdpData);
      }
    }
  }, [open, pdpData]);

  const shouldEnableEditButton = () => {
    if (!pdpData) return false;
    const status = pdpData.status;
    return status !== "APPROVED" && status !== "CANCELLED";
  };

  const shouldShowSaveAsDraftButton = () => {
    const status = pdpData?.status;
    return status !== "FOR_APPROVAL";
  };

  const isForApprovalStatus = () => {
    const status = pdpData?.status;
    return status === "FOR_APPROVAL";
  };

  const handleModeChange = (newMode) => {
    if (newMode === "edit") {
      setHasEditedForm(true);
    }
    setCurrentMode(newMode);
  };

  const handleCancelEdit = () => {
    setCurrentMode(originalMode);
    if (pdpData) {
      loadFormData(pdpData);
    }
  };

  const handleClose = () => {
    setCurrentMode("view");
    setOriginalMode("view");
    setIsUpdating(false);
    setHasEditedForm(false);
    reset();
    onClose();
  };

  const getModalTitle = () => {
    switch (currentMode) {
      case "view":
        return "VIEW PDP SUBMISSION";
      case "edit":
        return "EDIT PDP SUBMISSION";
      default:
        return "PDP SUBMISSION";
    }
  };

  const prepareFormData = (data, actionType) => {
    return {
      action: actionType,
      development_plan_objective: data.development_plan_objective,
      goals: data.goals.map((goal, index) => ({
        id: `temp-goal-${index + 1}`,
        goal_number: index + 1,
        description: goal.description,
        target_date: goal.target_date
          ? dayjs(goal.target_date).format("YYYY-MM-DD")
          : null,
      })),
      actions: data.actions.map((action) => ({
        id: `temp-action-${action.id}`,
        pdp_goal_id: `temp-goal-${action.goal_index + 1}`,
        activity: action.activity,
        due_date: action.due_date
          ? dayjs(action.due_date).format("YYYY-MM-DD")
          : null,
        date_accomplished: null,
        expected_progress: action.expected_progress,
      })),
      resources: data.resources.map((resource) => ({
        id: `temp-resource-${resource.id}`,
        pdp_goal_id: `temp-goal-${resource.goal_index + 1}`,
        resource_item: resource.resource_item,
        description: resource.description,
        person_in_charge: resource.person_in_charge,
        due_date: resource.due_date
          ? dayjs(resource.due_date).format("YYYY-MM-DD")
          : null,
      })),
      coaching_sessions: data.coaching_sessions.map((session, index) => ({
        id: `temp-session-${index + 1}`,
        month_label: session.month_label,
        session_date: session.session_date
          ? dayjs(session.session_date).format("YYYY-MM-DD")
          : null,
        commitment: session.commitment,
      })),
    };
  };

  const onSubmit = async (data) => {
    const formData = prepareFormData(data, "submit_for_validation");
    setIsUpdating(true);

    try {
      const success = await onSave(formData, false);
      if (success) {
        const result = await refetch();

        if (result.data?.result) {
          loadFormData(result.data.result);
        }

        setCurrentMode("view");
        setOriginalMode("view");
      }
    } catch (error) {
      console.error("Error during save:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSaveAsDraft = async () => {
    const data = watch();
    const formData = prepareFormData(data, "save_draft");
    setIsUpdating(true);

    try {
      const success = await onSave(formData, true);
      if (success) {
        const result = await refetch();

        if (result.data?.result) {
          loadFormData(result.data.result);
        }

        setCurrentMode("view");
        setOriginalMode("view");
      }
    } catch (error) {
      console.error("Error during save:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAddGoal = () => {
    appendGoal({
      id: generateTempId("goal"),
      goal_number: goalFields.length + 1,
      description: "",
      target_date: null,
    });
  };

  const handleAddAction = () => {
    appendAction({
      id: generateTempId("action"),
      goal_index: 0,
      activity: "",
      due_date: null,
      expected_progress: "",
    });
  };

  const handleAddResource = () => {
    appendResource({
      id: generateTempId("resource"),
      goal_index: 0,
      resource_item: "",
      description: "",
      person_in_charge: "",
      due_date: null,
    });
  };

  const handleAddCoaching = () => {
    appendCoaching({
      id: generateTempId("session"),
      month_label: `${coachingFields.length + 1}${
        coachingFields.length === 0
          ? "st"
          : coachingFields.length === 1
          ? "nd"
          : coachingFields.length === 2
          ? "rd"
          : "th"
      } Month`,
      session_date: null,
      commitment: "",
    });
  };

  const isProcessing =
    externalLoading || isFetchingTask || isFetching || isUpdating;
  const isViewMode = currentMode === "view";
  const showLoadingState = isProcessing && !pdpData;

  return (
    <FormProvider {...methods}>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <StyledDialog open={open} onClose={handleClose} maxWidth="lg" fullWidth>
          <StyledDialogTitle>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <AssignmentIcon sx={{ color: "rgb(33, 61, 112)" }} />
              <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
                {getModalTitle()}
              </Typography>
              {currentMode === "view" && !showLoadingState && (
                <Tooltip
                  title={
                    shouldEnableEditButton()
                      ? "EDIT FORM"
                      : "Edit not available"
                  }
                  arrow>
                  <span>
                    <IconButton
                      onClick={() => handleModeChange("edit")}
                      disabled={!shouldEnableEditButton() || isProcessing}
                      size="small"
                      sx={{
                        ml: 1,
                        padding: "8px",
                        "&:hover": {
                          backgroundColor:
                            shouldEnableEditButton() && !isProcessing
                              ? "rgba(0, 136, 32, 0.08)"
                              : "transparent",
                          transform:
                            shouldEnableEditButton() && !isProcessing
                              ? "scale(1.1)"
                              : "none",
                        },
                      }}>
                      <EditIcon
                        sx={{
                          fontSize: "20px",
                          color:
                            shouldEnableEditButton() && !isProcessing
                              ? "rgba(0, 136, 32, 1)"
                              : "rgba(0, 0, 0, 0.26)",
                        }}
                      />
                    </IconButton>
                  </span>
                </Tooltip>
              )}
              {currentMode === "edit" && originalMode === "view" && (
                <Tooltip title="CANCEL EDIT">
                  <IconButton
                    onClick={handleCancelEdit}
                    disabled={isProcessing}
                    size="small"
                    sx={{
                      ml: 1,
                      padding: "8px",
                      "&:hover": { backgroundColor: "rgba(235, 0, 0, 0.08)" },
                    }}>
                    <EditOffIcon
                      sx={{ fontSize: "20px", color: "rgba(235, 0, 0, 1)" }}
                    />
                  </IconButton>
                </Tooltip>
              )}
            </Box>
            <IconButton
              onClick={handleClose}
              disabled={isUpdating}
              sx={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                "&:hover": { backgroundColor: "#f5f5f5" },
              }}>
              <CloseIcon sx={{ fontSize: "18px" }} />
            </IconButton>
          </StyledDialogTitle>

          <form
            onSubmit={handleSubmit(onSubmit)}
            style={{ display: "flex", flexDirection: "column", flex: 1 }}>
            <StyledDialogContent>
              {showLoadingState ? (
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    minHeight: "400px",
                  }}>
                  <CircularProgress
                    size={40}
                    sx={{ color: "rgb(33, 61, 112)" }}
                  />
                </Box>
              ) : fetchError ? (
                <Alert severity="error" sx={{ mb: 2 }}>
                  Failed to load PDP details. Please try again.
                </Alert>
              ) : pdpData ? (
                <>
                  <InfoCard>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                        <PersonIcon
                          sx={{ fontSize: 32, color: "rgb(33, 61, 112)" }}
                        />
                        <Box>
                          <Typography
                            variant="h6"
                            sx={{ fontWeight: 600, color: "rgb(33, 61, 112)" }}>
                            {pdpData.employee_name || "N/A"}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            ID: {pdpData.id}
                          </Typography>
                        </Box>
                      </Box>
                      {pdpData.status && (
                        <Chip
                          label={getStatusLabel(pdpData.status)}
                          sx={{
                            backgroundColor: getStatusColor(pdpData.status),
                            color: "white",
                            fontWeight: 600,
                          }}
                        />
                      )}
                    </Box>
                  </InfoCard>

                  <PdpModalFields
                    control={control}
                    isViewMode={isViewMode}
                    isProcessing={isProcessing}
                    goalFields={goalFields}
                    actionFields={actionFields}
                    resourceFields={resourceFields}
                    coachingFields={coachingFields}
                    handleAddGoal={handleAddGoal}
                    handleAddAction={handleAddAction}
                    handleAddResource={handleAddResource}
                    handleAddCoaching={handleAddCoaching}
                    removeGoal={removeGoal}
                    removeAction={removeAction}
                    removeResource={removeResource}
                    removeCoaching={removeCoaching}
                    actionsExpanded={actionsExpanded}
                    setActionsExpanded={setActionsExpanded}
                    resourcesExpanded={resourcesExpanded}
                    setResourcesExpanded={setResourcesExpanded}
                    coachingExpanded={coachingExpanded}
                    setCoachingExpanded={setCoachingExpanded}
                    errors={errors}
                  />
                </>
              ) : null}
            </StyledDialogContent>

            <StyledDialogActions>
              {currentMode === "edit" && !showLoadingState && (
                <>
                  {shouldShowSaveAsDraftButton() && (
                    <DraftButton
                      onClick={handleSaveAsDraft}
                      disabled={isProcessing}
                      sx={{ mr: 2 }}>
                      {isUpdating ? (
                        <CircularProgress size={16} sx={{ color: "white" }} />
                      ) : (
                        <>
                          <SaveIcon sx={{ fontSize: 16 }} />
                          SAVE AS DRAFT
                        </>
                      )}
                    </DraftButton>
                  )}
                  <SubmitButton type="submit" disabled={isProcessing}>
                    {isUpdating ? (
                      <CircularProgress size={16} sx={{ color: "white" }} />
                    ) : (
                      <>
                        {isForApprovalStatus() ? (
                          <>
                            <EditIcon sx={{ fontSize: 16 }} />
                            UPDATE
                          </>
                        ) : (
                          <>
                            <SendIcon sx={{ fontSize: 16 }} />
                            SUBMIT
                          </>
                        )}
                      </>
                    )}
                  </SubmitButton>
                </>
              )}
            </StyledDialogActions>
          </form>
        </StyledDialog>
      </LocalizationProvider>
    </FormProvider>
  );
};

export default PdpModal;
