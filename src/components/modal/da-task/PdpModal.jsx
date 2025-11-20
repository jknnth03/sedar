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

  const {
    fields: goalFields,
    append: appendGoal,
    remove: removeGoal,
  } = useFieldArray({
    control,
    name: "goals",
  });

  const {
    fields: actionFields,
    append: appendAction,
    remove: removeAction,
  } = useFieldArray({
    control,
    name: "actions",
  });

  const {
    fields: resourceFields,
    append: appendResource,
    remove: removeResource,
  } = useFieldArray({
    control,
    name: "resources",
  });

  const {
    fields: coachingFields,
    append: appendCoaching,
    remove: removeCoaching,
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

  const extractActions = (data) => {
    if (!data || !data.goals) return [];

    const allActions = [];

    (data.goals || []).forEach((goal) => {
      if (goal.actions && goal.actions.length > 0) {
        goal.actions.forEach((action) => {
          allActions.push({
            ...action,
            id: String(action.id),
            pdp_goal_id: String(action.pdp_goal_id || goal.id),
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
          allResources.push({
            ...resource,
            id: String(resource.id),
            pdp_goal_id: String(resource.pdp_goal_id || goal.id),
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

    setValue(
      "development_plan_objective",
      data.development_plan_objective || ""
    );

    const formattedGoals = (data.goals || []).map((goal) => ({
      ...goal,
      id: String(goal.id),
      target_date: goal.target_date ? dayjs(goal.target_date) : null,
    }));
    setValue("goals", formattedGoals);
    setValue("actions", extractActions(data));
    setValue("resources", extractResources(data));

    const formattedCoachingSessions = (data.coaching_sessions || []).map(
      (session) => ({
        ...session,
        id: String(session.id),
        session_date: session.session_date ? dayjs(session.session_date) : null,
      })
    );
    setValue("coaching_sessions", formattedCoachingSessions);
  };

  useEffect(() => {
    if (open && pdpData) {
      setCurrentMode(mode);
      setOriginalMode(mode);
      loadFormData(pdpData);
    }
  }, [open, pdpData, mode]);

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

  const handleModeChange = (newMode) => setCurrentMode(newMode);

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
    const goalIdMap = new Map();
    const goalNumberToActualId = new Map();

    data.goals.forEach((goal, index) => {
      const goalNumber = index + 1;
      goalIdMap.set(String(goal.id), goalNumber);

      if (goal.id && !goal.id.startsWith("temp-")) {
        goalNumberToActualId.set(goalNumber, String(goal.id));
      }
    });

    return {
      action: actionType,
      development_plan_objective: data.development_plan_objective,
      goals: data.goals.map((goal, index) => ({
        id:
          goal.id && !goal.id.startsWith("temp-") ? String(goal.id) : undefined,
        goal_number: index + 1,
        description: goal.description,
        target_date: goal.target_date
          ? dayjs(goal.target_date).format("YYYY-MM-DD")
          : null,
      })),
      actions: data.actions.map((action) => {
        const goalNumber = goalIdMap.get(String(action.pdp_goal_id)) || 1;
        const actualGoalId = goalNumberToActualId.get(goalNumber);

        return {
          id:
            action.id && !action.id.startsWith("temp-")
              ? String(action.id)
              : undefined,
          pdp_goal_id: actualGoalId || undefined,
          goal_number: goalNumber,
          activity: action.activity,
          due_date: action.due_date
            ? dayjs(action.due_date).format("YYYY-MM-DD")
            : null,
          expected_progress: action.expected_progress,
        };
      }),
      resources: data.resources.map((resource) => {
        const goalNumber = goalIdMap.get(String(resource.pdp_goal_id)) || 1;
        const actualGoalId = goalNumberToActualId.get(goalNumber);

        return {
          id:
            resource.id && !resource.id.startsWith("temp-")
              ? String(resource.id)
              : undefined,
          pdp_goal_id: actualGoalId || undefined,
          goal_number: goalNumber,
          resource_item: resource.resource_item,
          description: resource.description,
          person_in_charge: resource.person_in_charge,
          due_date: resource.due_date
            ? dayjs(resource.due_date).format("YYYY-MM-DD")
            : null,
        };
      }),
      coaching_sessions: data.coaching_sessions.map((session) => ({
        id:
          session.id && !session.id.startsWith("temp-")
            ? String(session.id)
            : undefined,
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
      pdp_goal_id: goalFields[0]?.id || "",
      activity: "",
      due_date: null,
      expected_progress: "",
    });
  };

  const handleAddResource = () => {
    appendResource({
      id: generateTempId("resource"),
      pdp_goal_id: goalFields[0]?.id || "",
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
