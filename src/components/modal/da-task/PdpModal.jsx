const extractActions = (data) => {
  if (!data || !data.goals) return [];

  const allActions = [];

  (data.goals || []).forEach((goal) => {
    if (goal.actions && goal.actions.length > 0) {
      goal.actions.forEach((action) => {
        const actualGoalId = action.pdp_goal_id
          ? String(action.pdp_goal_id)
          : String(goal.id);

        console.log(
          `extractAction: action.id=${action.id}, action.pdp_goal_id="${action.pdp_goal_id}", parentGoal.id=${goal.id}, using="${actualGoalId}"`
        );

        allActions.push({
          id: String(action.id),
          pdp_goal_id: actualGoalId,
          activity: action.activity || "",
          due_date: action.due_date ? dayjs(action.due_date) : null,
          expected_progress: action.expected_progress || "",
        });
      });
    }
  });

  return allActions;
};

const extractResources = (data) => {
  if (!data || !data.goals) return [];

  const allResources = [];

  (data.goals || []).forEach((goal) => {
    if (goal.resources && goal.resources.length > 0) {
      goal.resources.forEach((resource) => {
        const actualGoalId = resource.pdp_goal_id
          ? String(resource.pdp_goal_id)
          : String(goal.id);

        console.log(
          `extractResource: resource.id=${resource.id}, resource.pdp_goal_id="${resource.pdp_goal_id}", parentGoal.id=${goal.id}, using="${actualGoalId}"`
        );

        allResources.push({
          id: String(resource.id),
          pdp_goal_id: actualGoalId,
          resource_item: resource.resource_item || "",
          description: resource.description || "",
          person_in_charge: resource.person_in_charge || "",
          due_date: resource.due_date ? dayjs(resource.due_date) : null,
        });
      });
    }
  });

  return allResources;
};
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
      pdp_goal_id: yup.string().required("Linked goal is required"),
      expected_progress: yup.string().required("Expected progress is required"),
    })
  ),
  resources: yup.array().of(
    yup.object().shape({
      resource_item: yup.string().required("Resource item is required"),
      description: yup.string().required("Description is required"),
      person_in_charge: yup.string().required("Person in charge is required"),
      due_date: yup.date().nullable().required("Due date is required"),
      pdp_goal_id: yup.string().required("Linked goal is required"),
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
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [pendingFormData, setPendingFormData] = useState(null);
  const [actionsExpanded, setActionsExpanded] = useState(true);
  const [resourcesExpanded, setResourcesExpanded] = useState(true);
  const [coachingExpanded, setCoachingExpanded] = useState(true);
  const [goalIndexMap, setGoalIndexMap] = useState({});

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

  const buildUuidToGoalIdMap = (data) => {
    const map = {};

    (data.goals || []).forEach((goal) => {
      const goalNumericId = String(goal.id);

      if (goal.actions && goal.actions.length > 0) {
        goal.actions.forEach((action) => {
          const actionGoalUuid = String(action.pdp_goal_id);
          if (actionGoalUuid && actionGoalUuid !== goalNumericId) {
            map[actionGoalUuid] = goalNumericId;
            console.log(`Map: UUID ${actionGoalUuid} -> Goal ${goalNumericId}`);
          }
        });
      }

      if (goal.resources && goal.resources.length > 0) {
        goal.resources.forEach((resource) => {
          const resourceGoalUuid = String(resource.pdp_goal_id);
          if (resourceGoalUuid && resourceGoalUuid !== goalNumericId) {
            map[resourceGoalUuid] = goalNumericId;
            console.log(
              `Map: UUID ${resourceGoalUuid} -> Goal ${goalNumericId}`
            );
          }
        });
      }
    });

    return map;
  };

  const extractActions = (data) => {
    if (!data || !data.goals) return [];

    const uuidToGoalIdMap = buildUuidToGoalIdMap(data);
    const allActions = [];

    (data.goals || []).forEach((goal) => {
      if (goal.actions && goal.actions.length > 0) {
        goal.actions.forEach((action) => {
          const actionGoalUuid = String(action.pdp_goal_id);
          const mappedGoalId =
            uuidToGoalIdMap[actionGoalUuid] || String(goal.id);

          console.log(
            `extractAction: action.pdp_goal_id="${actionGoalUuid}" -> mappedGoalId="${mappedGoalId}"`
          );

          allActions.push({
            id: String(action.id),
            pdp_goal_id: mappedGoalId,
            activity: action.activity || "",
            due_date: action.due_date ? dayjs(action.due_date) : null,
            expected_progress: action.expected_progress || "",
          });
        });
      }
    });

    return allActions;
  };

  const extractResources = (data) => {
    if (!data || !data.goals) return [];

    const uuidToGoalIdMap = buildUuidToGoalIdMap(data);
    const allResources = [];

    (data.goals || []).forEach((goal) => {
      if (goal.resources && goal.resources.length > 0) {
        goal.resources.forEach((resource) => {
          const resourceGoalUuid = String(resource.pdp_goal_id);
          const mappedGoalId =
            uuidToGoalIdMap[resourceGoalUuid] || String(goal.id);

          console.log(
            `extractResource: resource.pdp_goal_id="${resourceGoalUuid}" -> mappedGoalId="${mappedGoalId}"`
          );

          allResources.push({
            id: String(resource.id),
            pdp_goal_id: mappedGoalId,
            resource_item: resource.resource_item || "",
            description: resource.description || "",
            person_in_charge: resource.person_in_charge || "",
            due_date: resource.due_date ? dayjs(resource.due_date) : null,
          });
        });
      }
    });

    return allResources;
  };

  const loadFormData = (data) => {
    if (!data) return;

    console.log("=== LOAD FORM DATA ===");
    console.log("Raw data.goals:", data.goals);

    const formattedGoals = (data.goals || []).map((goal, idx) => ({
      id: String(goal.id),
      goal_number: parseInt(goal.goal_number) || idx + 1,
      description: goal.description || "",
      target_date: goal.target_date ? dayjs(goal.target_date) : null,
    }));

    console.log("formattedGoals:", formattedGoals);

    const goalIdMap = {};
    formattedGoals.forEach((goal) => {
      goalIdMap[String(goal.id)] = String(goal.id);
    });
    setGoalIndexMap(goalIdMap);

    const formattedActions = extractActions(data);
    const formattedResources = extractResources(data);

    console.log("formattedActions after extract:", formattedActions);
    console.log("formattedResources after extract:", formattedResources);

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

  const [hasEditedForm, setHasEditedForm] = useState(false);

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
    setConfirmOpen(false);
    setConfirmAction(null);
    setPendingFormData(null);
    setGoalIndexMap({});
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
    const allFormGoals = data.goals || [];

    console.log("=== PREPARE FORM DATA ===");
    console.log("Raw allFormGoals:", allFormGoals);
    console.log("Actions raw:", data.actions);

    const goalIdToTempIdMap = {};
    const goalIdToIndexMap = {};

    allFormGoals.forEach((goal, index) => {
      const goalId = String(goal.id);
      goalIdToTempIdMap[goalId] = `temp-goal-${index + 1}`;
      goalIdToIndexMap[goalId] = index + 1;
      console.log(`Goal ${index + 1}: id=${goalId}`);
    });

    console.log("goalIdToTempIdMap:", goalIdToTempIdMap);

    const mappedActions = (data.actions || []).map((action, idx) => {
      const actionGoalId = String(action.pdp_goal_id);
      const tempGoalId = goalIdToTempIdMap[actionGoalId];

      console.log(
        `Action ${idx}: stored pdp_goal_id="${actionGoalId}" -> tempId="${tempGoalId}" (exists: ${!!tempGoalId})`
      );

      if (!tempGoalId) {
        console.warn(
          `WARNING: Action ${idx} goal ID not found in map. Available: ${Object.keys(
            goalIdToTempIdMap
          ).join(", ")}`
        );
      }

      return {
        id: `temp-action-${action.id}`,
        pdp_goal_id: tempGoalId || `temp-goal-1`,
        activity: action.activity,
        due_date: action.due_date
          ? dayjs(action.due_date).format("YYYY-MM-DD")
          : null,
        date_accomplished: null,
        expected_progress: action.expected_progress,
      };
    });

    const mappedResources = (data.resources || []).map((resource, idx) => {
      const resourceGoalId = String(resource.pdp_goal_id);
      const tempGoalId = goalIdToTempIdMap[resourceGoalId];

      console.log(
        `Resource ${idx}: stored pdp_goal_id="${resourceGoalId}" -> tempId="${tempGoalId}" (exists: ${!!tempGoalId})`
      );

      if (!tempGoalId) {
        console.warn(
          `WARNING: Resource ${idx} goal ID not found in map. Available: ${Object.keys(
            goalIdToTempIdMap
          ).join(", ")}`
        );
      }

      return {
        id: `temp-resource-${resource.id}`,
        pdp_goal_id: tempGoalId || `temp-goal-1`,
        resource_item: resource.resource_item,
        description: resource.description,
        person_in_charge: resource.person_in_charge,
        due_date: resource.due_date
          ? dayjs(resource.due_date).format("YYYY-MM-DD")
          : null,
      };
    });

    return {
      action: actionType,
      development_plan_objective: data.development_plan_objective,
      goals: allFormGoals.map((goal, index) => ({
        id: `temp-goal-${index + 1}`,
        goal_number: index + 1,
        description: goal.description,
        target_date: goal.target_date
          ? dayjs(goal.target_date).format("YYYY-MM-DD")
          : null,
      })),
      actions: mappedActions,
      resources: mappedResources,
      coaching_sessions: (data.coaching_sessions || []).map(
        (session, index) => ({
          id: `temp-session-${index + 1}`,
          month_label: session.month_label,
          session_date: session.session_date
            ? dayjs(session.session_date).format("YYYY-MM-DD")
            : null,
          commitment: session.commitment,
        })
      ),
    };
  };

  const onSubmit = async (data) => {
    console.log("=== ON SUBMIT - WATCH DATA ===");
    console.log(
      "data.goals:",
      data.goals.map((g) => ({ id: g.id, desc: g.description }))
    );
    console.log(
      "data.actions BEFORE prepareFormData:",
      data.actions.map((a, i) => ({
        idx: i,
        id: a.id,
        pdp_goal_id: a.pdp_goal_id,
        activity: a.activity,
      }))
    );

    const formData = prepareFormData(data, "submit_for_validation");
    setPendingFormData(formData);
    setConfirmAction(isForApprovalStatus() ? "update" : "submit");
    setConfirmOpen(true);
  };

  const handleSaveAsDraft = async () => {
    const data = watch();
    const formData = prepareFormData(data, "save_draft");
    setPendingFormData(formData);
    setConfirmAction("draft");
    setConfirmOpen(true);
  };

  const handleConfirmAction = async () => {
    if (!pendingFormData) return;
    setIsUpdating(true);

    try {
      const success = await onSave(pendingFormData, confirmAction === "draft");
      if (success) {
        const result = await refetch();

        if (result.data?.result) {
          loadFormData(result.data.result);
        }

        setCurrentMode("view");
        setOriginalMode("view");
        setConfirmOpen(false);
        setConfirmAction(null);
        setPendingFormData(null);
      }
    } catch (error) {
      console.error("Error during save:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleConfirmationCancel = () => {
    setConfirmOpen(false);
    setConfirmAction(null);
    setPendingFormData(null);
  };

  const getConfirmationMessage = () => {
    if (confirmAction === "update") {
      return "Are you sure you want to Update this PDP Request?";
    } else if (confirmAction === "submit") {
      return "Are you sure you want to Submit this PDP Request?";
    } else if (confirmAction === "draft") {
      return "Are you sure you want to Save this PDP as Draft?";
    }
    return "";
  };

  const getConfirmationIcon = () => {
    const iconConfig = {
      update: { color: "#2196F3", icon: "✎" },
      submit: { color: "#4CAF50", icon: "✓" },
      draft: { color: "#2196F3", icon: "💾" },
    };
    return iconConfig[confirmAction] || iconConfig.submit;
  };

  const getSubmissionDisplayName = () => {
    if (confirmAction === "update") return "PDP REQUEST";
    if (confirmAction === "draft") return "PDP DRAFT";
    return pdpData?.reference_number || "PDP SUBMISSION";
  };

  const handleAddGoal = () => {
    const tempId = generateTempId("goal");
    appendGoal({
      id: tempId,
      goal_number: goalFields.length + 1,
      description: "",
      target_date: null,
    });
  };

  const handleAddAction = () => {
    const watchedGoals = watch("goals");
    const firstGoalId = watchedGoals?.[0]?.id || "";
    const tempId = generateTempId("action");
    appendAction({
      id: tempId,
      pdp_goal_id: firstGoalId,
      activity: "",
      due_date: null,
      expected_progress: "",
    });
  };

  const handleAddResource = () => {
    const watchedGoals = watch("goals");
    const firstGoalId = watchedGoals?.[0]?.id || "";
    const tempId = generateTempId("resource");
    appendResource({
      id: tempId,
      pdp_goal_id: firstGoalId,
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

        <Dialog
          open={confirmOpen}
          onClose={handleConfirmationCancel}
          maxWidth="xs"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 3,
              padding: 2,
              boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
              textAlign: "center",
            },
          }}>
          <DialogTitle sx={{ padding: 0, marginBottom: 2 }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                marginBottom: 2,
              }}>
              <Box
                sx={{
                  width: 60,
                  height: 60,
                  borderRadius: "50%",
                  backgroundColor: getConfirmationIcon().color,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}>
                <Typography
                  sx={{
                    color: "white",
                    fontSize: "30px",
                    fontWeight: "normal",
                  }}>
                  {getConfirmationIcon().icon}
                </Typography>
              </Box>
            </Box>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 600,
                color: "rgb(25, 45, 84)",
                marginBottom: 0,
              }}>
              Confirmation
            </Typography>
          </DialogTitle>
          <DialogContent sx={{ padding: 0, textAlign: "center" }}>
            <Typography
              variant="body1"
              sx={{
                marginBottom: 2,
                fontSize: "16px",
                color: "#333",
                fontWeight: 400,
              }}>
              {getConfirmationMessage()}
            </Typography>
            <Typography
              variant="body2"
              sx={{
                fontSize: "14px",
                color: "#666",
                fontWeight: 500,
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}>
              {getSubmissionDisplayName()}
            </Typography>
          </DialogContent>
          <DialogActions
            sx={{
              justifyContent: "center",
              padding: 0,
              marginTop: 3,
              gap: 2,
            }}>
            <Button
              onClick={handleConfirmationCancel}
              variant="outlined"
              sx={{
                textTransform: "uppercase",
                fontWeight: 600,
                borderColor: "#f44336",
                color: "#f44336",
                paddingX: 3,
                paddingY: 1,
                borderRadius: 2,
                "&:hover": {
                  borderColor: "#d32f2f",
                  backgroundColor: "rgba(244, 67, 54, 0.04)",
                },
              }}
              disabled={isUpdating}>
              CANCEL
            </Button>
            <Button
              onClick={handleConfirmAction}
              variant="contained"
              sx={{
                textTransform: "uppercase",
                fontWeight: 600,
                backgroundColor: "#4caf50",
                paddingX: 3,
                paddingY: 1,
                borderRadius: 2,
                "&:hover": {
                  backgroundColor: "#388e3c",
                },
              }}
              disabled={isUpdating}>
              {isUpdating ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                "CONFIRM"
              )}
            </Button>
          </DialogActions>
        </Dialog>
      </LocalizationProvider>
    </FormProvider>
  );
};

export default PdpModal;
