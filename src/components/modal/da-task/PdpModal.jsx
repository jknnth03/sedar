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
import {
  useForm,
  useFieldArray,
  Controller,
  FormProvider,
} from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { styled } from "@mui/material/styles";
import dayjs from "dayjs";
import { useGetPdpTaskQuery } from "../../../features/api/da-task/pdpApi";
import PdpModalFields from "./PdpModalFields";

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
      date_accomplished: yup.date().nullable(),
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

const StyledDialog = styled(Dialog)(({ theme }) => ({
  "& .MuiDialog-paper": {
    maxWidth: "1200px",
    width: "100%",
    height: "90vh",
    maxHeight: "90vh",
    display: "flex",
    flexDirection: "column",
    position: "relative",
  },
}));

const StyledDialogTitle = styled(DialogTitle)(({ theme }) => ({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  backgroundColor: "#fff",
  flexShrink: 0,
  padding: "16px 24px",
  borderBottom: "1px solid #e0e0e0",
  "& .MuiTypography-root": {
    fontSize: "1.25rem",
    fontWeight: 600,
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
}));

const StyledDialogContent = styled(DialogContent)(({ theme }) => ({
  backgroundColor: "#fafafa",
  flex: 1,
  padding: "24px",
  overflow: "auto",
  "&::-webkit-scrollbar": {
    width: "8px",
  },
  "&::-webkit-scrollbar-track": {
    backgroundColor: "#f1f1f1",
    borderRadius: "4px",
  },
  "&::-webkit-scrollbar-thumb": {
    backgroundColor: "#c1c1c1",
    borderRadius: "4px",
    "&:hover": {
      backgroundColor: "#a1a1a1",
    },
  },
}));

const StyledDialogActions = styled(DialogActions)(({ theme }) => ({
  backgroundColor: "#fff",
  justifyContent: "flex-end",
  flexShrink: 0,
  padding: "16px 24px",
  borderTop: "1px solid #e0e0e0",
  position: "sticky",
  bottom: 0,
  zIndex: 1000,
}));

const SubmitButton = styled(Button)(({ theme }) => ({
  backgroundColor: "#4CAF50 !important",
  color: "white !important",
  fontWeight: 600,
  textTransform: "uppercase",
  padding: "12px 20px",
  borderRadius: "8px",
  fontSize: "0.875rem",
  border: "none !important",
  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
  minWidth: "120px",
  height: "44px",
  display: "flex",
  alignItems: "center",
  gap: "8px",
  "&:hover": {
    backgroundColor: "#45a049 !important",
  },
  "&:disabled": {
    backgroundColor: "#cccccc !important",
    color: "#666666 !important",
  },
}));

const DraftButton = styled(Button)(({ theme }) => ({
  backgroundColor: "#2196F3 !important",
  color: "white !important",
  fontWeight: 600,
  textTransform: "uppercase",
  padding: "12px 20px",
  borderRadius: "8px",
  fontSize: "0.875rem",
  border: "none !important",
  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
  minWidth: "120px",
  height: "44px",
  display: "flex",
  alignItems: "center",
  gap: "8px",
  "&:hover": {
    backgroundColor: "#1976D2 !important",
  },
  "&:disabled": {
    backgroundColor: "#cccccc !important",
    color: "#666666 !important",
  },
}));

const InfoCard = styled(Box)(({ theme }) => ({
  backgroundColor: "white",
  borderRadius: "8px",
  padding: "20px",
  marginBottom: "20px",
  boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
}));

const getStatusColor = (status) => {
  const statusColors = {
    FOR_ASSESSMENT: "#FF9800",
    FOR_SUBMISSION: "#2196F3",
    FOR_APPROVAL: "#FFC107",
    APPROVED: "#4CAF50",
    RETURNED: "#f44336",
    CANCELLED: "#9E9E9E",
    DRAFT: "#9E9E9E",
  };
  return statusColors[status] || "#9E9E9E";
};

const getStatusLabel = (status) => {
  const labels = {
    FOR_ASSESSMENT: "For Assessment",
    FOR_SUBMISSION: "For Submission",
    FOR_APPROVAL: "For Approval",
    APPROVED: "Approved",
    RETURNED: "Returned",
    CANCELLED: "Cancelled",
    DRAFT: "Draft",
  };
  return labels[status] || status;
};

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

  useEffect(() => {
    if (open && pdpData) {
      setCurrentMode(mode);
      setOriginalMode(mode);

      setValue(
        "development_plan_objective",
        pdpData.development_plan_objective || ""
      );
      setValue("goals", pdpData.goals || []);
      setValue("actions", pdpData.actions || []);
      setValue("resources", pdpData.resources || []);
      setValue("coaching_sessions", pdpData.coaching_sessions || []);
    }
  }, [open, pdpData, mode, setValue]);

  const shouldEnableEditButton = () => {
    if (!pdpData) return false;
    const status = pdpData.status;
    return status !== "APPROVED" && status !== "CANCELLED";
  };

  const handleModeChange = (newMode) => setCurrentMode(newMode);

  const handleCancelEdit = () => {
    setCurrentMode(originalMode);
    if (pdpData) {
      setValue(
        "development_plan_objective",
        pdpData.development_plan_objective || ""
      );
      setValue("goals", pdpData.goals || []);
      setValue("actions", pdpData.actions || []);
      setValue("resources", pdpData.resources || []);
      setValue("coaching_sessions", pdpData.coaching_sessions || []);
    }
  };

  const handleClose = () => {
    setCurrentMode("view");
    setOriginalMode("view");
    setIsUpdating(false);
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

  const generateTempId = (prefix) =>
    `temp-${prefix}-${Date.now()}-${Math.random()}`;

  const onSubmit = async (data) => {
    try {
      setIsUpdating(true);

      const formData = {
        action: "submit_for_validation",
        development_plan_objective: data.development_plan_objective,
        goals: data.goals.map((goal, index) => ({
          id: goal.id ? String(goal.id) : generateTempId("goal"),
          goal_number: index + 1,
          description: goal.description,
          target_date: goal.target_date
            ? dayjs(goal.target_date).format("YYYY-MM-DD")
            : null,
        })),
        actions: data.actions.map((action) => ({
          id: action.id ? String(action.id) : generateTempId("action"),
          pdp_goal_id: action.pdp_goal_id ? String(action.pdp_goal_id) : "",
          activity: action.activity,
          due_date: action.due_date
            ? dayjs(action.due_date).format("YYYY-MM-DD")
            : null,
          date_accomplished: action.date_accomplished
            ? dayjs(action.date_accomplished).format("YYYY-MM-DD")
            : null,
          expected_progress: action.expected_progress,
        })),
        resources: data.resources.map((resource) => ({
          id: resource.id ? String(resource.id) : generateTempId("resource"),
          pdp_goal_id: resource.pdp_goal_id ? String(resource.pdp_goal_id) : "",
          resource_item: resource.resource_item,
          description: resource.description,
          person_in_charge: resource.person_in_charge,
          due_date: resource.due_date
            ? dayjs(resource.due_date).format("YYYY-MM-DD")
            : null,
        })),
        coaching_sessions: data.coaching_sessions.map((session) => ({
          id: session.id ? String(session.id) : generateTempId("session"),
          month_label: session.month_label,
          session_date: session.session_date
            ? dayjs(session.session_date).format("YYYY-MM-DD")
            : null,
          commitment: session.commitment,
        })),
      };

      const success = await onSave(formData, false);
      if (success) {
        await refetch();
        handleClose();
      }
    } catch (error) {
      console.error("Submit error:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSaveAsDraft = async () => {
    try {
      setIsUpdating(true);
      const data = watch();

      const formData = {
        action: "save_draft",
        development_plan_objective: data.development_plan_objective,
        goals: data.goals.map((goal, index) => ({
          id: goal.id ? String(goal.id) : generateTempId("goal"),
          goal_number: index + 1,
          description: goal.description,
          target_date: goal.target_date
            ? dayjs(goal.target_date).format("YYYY-MM-DD")
            : null,
        })),
        actions: data.actions.map((action) => ({
          id: action.id ? String(action.id) : generateTempId("action"),
          pdp_goal_id: action.pdp_goal_id ? String(action.pdp_goal_id) : "",
          activity: action.activity,
          due_date: action.due_date
            ? dayjs(action.due_date).format("YYYY-MM-DD")
            : null,
          date_accomplished: action.date_accomplished
            ? dayjs(action.date_accomplished).format("YYYY-MM-DD")
            : null,
          expected_progress: action.expected_progress,
        })),
        resources: data.resources.map((resource) => ({
          id: resource.id ? String(resource.id) : generateTempId("resource"),
          pdp_goal_id: resource.pdp_goal_id ? String(resource.pdp_goal_id) : "",
          resource_item: resource.resource_item,
          description: resource.description,
          person_in_charge: resource.person_in_charge,
          due_date: resource.due_date
            ? dayjs(resource.due_date).format("YYYY-MM-DD")
            : null,
        })),
        coaching_sessions: data.coaching_sessions.map((session) => ({
          id: session.id ? String(session.id) : generateTempId("session"),
          month_label: session.month_label,
          session_date: session.session_date
            ? dayjs(session.session_date).format("YYYY-MM-DD")
            : null,
          commitment: session.commitment,
        })),
      };

      const success = await onSave(formData, true);
      if (success) {
        await refetch();
        handleClose();
      }
    } catch (error) {
      console.error("Save draft error:", error);
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
      pdp_goal_id: goalFields[0]?.id || "",
      activity: "",
      due_date: null,
      date_accomplished: null,
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
                  <SubmitButton type="submit" disabled={isProcessing}>
                    {isUpdating ? (
                      <CircularProgress size={16} sx={{ color: "white" }} />
                    ) : (
                      <>
                        <SendIcon sx={{ fontSize: 16 }} />
                        SUBMIT
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
