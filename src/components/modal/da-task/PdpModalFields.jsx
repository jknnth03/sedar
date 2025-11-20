import React from "react";
import {
  Box,
  Button,
  Typography,
  IconButton,
  TextField,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  TrendingUp as GoalIcon,
  Assignment as ActionIcon,
  LibraryBooks as ResourceIcon,
  Groups as CoachingIcon,
  ExpandMore as ExpandMoreIcon,
} from "@mui/icons-material";
import { Controller, useWatch } from "react-hook-form";
import dayjs from "dayjs";

const RequiredLabel = ({ children }) => (
  <span>
    {children}
    <span style={{ color: "#f44336", marginLeft: "4px" }}>*</span>
  </span>
);

const PdpModalFields = ({
  control,
  isViewMode,
  isProcessing,
  goalFields,
  actionFields,
  resourceFields,
  coachingFields,
  handleAddGoal,
  handleAddAction,
  handleAddResource,
  handleAddCoaching,
  removeGoal,
  removeAction,
  removeResource,
  removeCoaching,
  actionsExpanded,
  setActionsExpanded,
  resourcesExpanded,
  setResourcesExpanded,
  coachingExpanded,
  setCoachingExpanded,
  errors,
}) => {
  const watchedGoals = useWatch({ control, name: "goals" });

  const getGoalLabel = (goalId) => {
    if (!goalId || !watchedGoals) return "";
    const goalIndex = watchedGoals.findIndex(
      (g) => String(g.id) === String(goalId)
    );
    if (goalIndex === -1) return "";
    const goalDesc = watchedGoals[goalIndex]?.description || "";
    return `Goal ${goalIndex + 1}${
      goalDesc
        ? `: ${goalDesc.substring(0, 40)}${goalDesc.length > 40 ? "..." : ""}`
        : ""
    }`;
  };

  return (
    <>
      <Box
        sx={{
          backgroundColor: "white",
          borderRadius: "8px",
          padding: "20px",
          marginBottom: "20px",
          boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
        }}>
        <Typography
          variant="subtitle1"
          sx={{ fontWeight: 600, mb: 2, color: "rgb(33, 61, 112)" }}>
          <RequiredLabel>Development Plan Objective</RequiredLabel>
        </Typography>
        <Controller
          name="development_plan_objective"
          control={control}
          render={({ field, fieldState: { error } }) => (
            <TextField
              {...field}
              multiline
              rows={4}
              fullWidth
              disabled={isViewMode || isProcessing}
              error={!!error}
              helperText={error?.message}
              placeholder="Enter the overall development plan objective..."
            />
          )}
        />
      </Box>

      <Accordion defaultExpanded>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          sx={{ backgroundColor: "#f5f5f5" }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              width: "100%",
              justifyContent: "space-between",
            }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <GoalIcon sx={{ color: "rgb(33, 61, 112)" }} />
              <Typography sx={{ fontWeight: 600 }}>
                <RequiredLabel>Goals ({goalFields.length})</RequiredLabel>
              </Typography>
            </Box>
            {!isViewMode && (
              <Button
                size="small"
                startIcon={<AddIcon />}
                onClick={(e) => {
                  e.stopPropagation();
                  handleAddGoal();
                }}
                disabled={isProcessing}
                sx={{ mr: 2 }}>
                Add Goal
              </Button>
            )}
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          {goalFields.length === 0 ? (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ textAlign: "center", py: 3 }}>
              No goals added yet. At least one goal is required.
            </Typography>
          ) : (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {goalFields.map((field, index) => (
                <Paper key={field.id} sx={{ p: 2, backgroundColor: "#fafafa" }}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      mb: 2,
                    }}>
                    <Typography
                      variant="subtitle2"
                      sx={{ fontWeight: 600, color: "rgb(33, 61, 112)" }}>
                      Goal {index + 1}
                    </Typography>
                    {!isViewMode && (
                      <IconButton
                        size="small"
                        onClick={() => removeGoal(index)}
                        disabled={isProcessing}>
                        <DeleteIcon
                          fontSize="small"
                          sx={{ color: "#f44336" }}
                        />
                      </IconButton>
                    )}
                  </Box>
                  <Box sx={{ display: "flex", gap: 2 }}>
                    <Controller
                      name={`goals.${index}.description`}
                      control={control}
                      render={({ field, fieldState: { error } }) => (
                        <TextField
                          {...field}
                          label={<RequiredLabel>Description</RequiredLabel>}
                          sx={{ width: "calc(66.666% - 8px)" }}
                          disabled={isViewMode || isProcessing}
                          error={!!error}
                          helperText={error?.message}
                        />
                      )}
                    />
                    <Controller
                      name={`goals.${index}.target_date`}
                      control={control}
                      render={({ field, fieldState: { error } }) => (
                        <DatePicker
                          label={<RequiredLabel>Target Date</RequiredLabel>}
                          value={field.value ? dayjs(field.value) : null}
                          onChange={field.onChange}
                          disabled={isViewMode || isProcessing}
                          slotProps={{
                            textField: {
                              sx: { width: "calc(33.333% - 8px)" },
                              error: !!error,
                              helperText: error?.message,
                            },
                          }}
                        />
                      )}
                    />
                  </Box>
                </Paper>
              ))}
            </Box>
          )}
        </AccordionDetails>
      </Accordion>

      <Accordion
        expanded={actionsExpanded}
        onChange={(e, expanded) => setActionsExpanded(expanded)}
        sx={{ mt: 2 }}>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          sx={{ backgroundColor: "#f5f5f5" }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              width: "100%",
              justifyContent: "space-between",
            }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <ActionIcon sx={{ color: "rgb(33, 61, 112)" }} />
              <Typography sx={{ fontWeight: 600 }}>
                Actions ({actionFields.length})
              </Typography>
            </Box>
            {!isViewMode && (
              <Button
                size="small"
                startIcon={<AddIcon />}
                onClick={(e) => {
                  e.stopPropagation();
                  setActionsExpanded(true);
                  handleAddAction();
                }}
                disabled={isProcessing || goalFields.length === 0}
                sx={{ mr: 2 }}>
                Add Action
              </Button>
            )}
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          {actionFields.length === 0 ? (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ textAlign: "center", py: 3 }}>
              No actions added yet
            </Typography>
          ) : (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {actionFields.map((field, index) => (
                <Paper key={field.id} sx={{ p: 2, backgroundColor: "#fafafa" }}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      mb: 2,
                    }}>
                    <Typography
                      variant="subtitle2"
                      sx={{ fontWeight: 600, color: "rgb(33, 61, 112)" }}>
                      Action {index + 1}
                    </Typography>
                    {!isViewMode && (
                      <IconButton
                        size="small"
                        onClick={() => removeAction(index)}
                        disabled={isProcessing}>
                        <DeleteIcon
                          fontSize="small"
                          sx={{ color: "#f44336" }}
                        />
                      </IconButton>
                    )}
                  </Box>
                  <Box
                    sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    <Controller
                      name={`actions.${index}.activity`}
                      control={control}
                      render={({ field, fieldState: { error } }) => (
                        <TextField
                          {...field}
                          label={<RequiredLabel>Activity</RequiredLabel>}
                          multiline
                          rows={2}
                          fullWidth
                          disabled={isViewMode || isProcessing}
                          error={!!error}
                          helperText={error?.message}
                        />
                      )}
                    />
                    <Box sx={{ display: "flex", gap: 2 }}>
                      <Controller
                        name={`actions.${index}.due_date`}
                        control={control}
                        render={({ field, fieldState: { error } }) => (
                          <DatePicker
                            label={<RequiredLabel>Due Date</RequiredLabel>}
                            value={field.value ? dayjs(field.value) : null}
                            onChange={field.onChange}
                            disabled={isViewMode || isProcessing}
                            slotProps={{
                              textField: {
                                sx: { width: "calc(50% - 8px)" },
                                error: !!error,
                                helperText: error?.message,
                              },
                            }}
                          />
                        )}
                      />
                      <Controller
                        name={`actions.${index}.pdp_goal_id`}
                        control={control}
                        render={({ field, fieldState: { error } }) => (
                          <TextField
                            {...field}
                            value={field.value || ""}
                            select
                            label={<RequiredLabel>Linked Goal</RequiredLabel>}
                            disabled={isViewMode || isProcessing}
                            sx={{ width: "calc(50% - 8px)" }}
                            SelectProps={{ native: true }}
                            error={!!error}
                            helperText={error?.message}>
                            <option
                              value=""
                              style={{ display: "none" }}></option>
                            {goalFields.map((goal, idx) => (
                              <option key={goal.id} value={goal.id}>
                                Goal {idx + 1}
                              </option>
                            ))}
                          </TextField>
                        )}
                      />
                    </Box>
                    <Controller
                      name={`actions.${index}.expected_progress`}
                      control={control}
                      render={({ field, fieldState: { error } }) => (
                        <TextField
                          {...field}
                          label={
                            <RequiredLabel>Expected Progress</RequiredLabel>
                          }
                          fullWidth
                          disabled={isViewMode || isProcessing}
                          error={!!error}
                          helperText={error?.message}
                        />
                      )}
                    />
                  </Box>
                </Paper>
              ))}
            </Box>
          )}
        </AccordionDetails>
      </Accordion>

      <Accordion
        expanded={resourcesExpanded}
        onChange={(e, expanded) => setResourcesExpanded(expanded)}
        sx={{ mt: 2 }}>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          sx={{ backgroundColor: "#f5f5f5" }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              width: "100%",
              justifyContent: "space-between",
            }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <ResourceIcon sx={{ color: "rgb(33, 61, 112)" }} />
              <Typography sx={{ fontWeight: 600 }}>
                Resources ({resourceFields.length})
              </Typography>
            </Box>
            {!isViewMode && (
              <Button
                size="small"
                startIcon={<AddIcon />}
                onClick={(e) => {
                  e.stopPropagation();
                  setResourcesExpanded(true);
                  handleAddResource();
                }}
                disabled={isProcessing || goalFields.length === 0}
                sx={{ mr: 2 }}>
                Add Resource
              </Button>
            )}
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          {resourceFields.length === 0 ? (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ textAlign: "center", py: 3 }}>
              No resources added yet
            </Typography>
          ) : (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {resourceFields.map((field, index) => (
                <Paper key={field.id} sx={{ p: 2, backgroundColor: "#fafafa" }}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      mb: 2,
                    }}>
                    <Typography
                      variant="subtitle2"
                      sx={{ fontWeight: 600, color: "rgb(33, 61, 112)" }}>
                      Resource {index + 1}
                    </Typography>
                    {!isViewMode && (
                      <IconButton
                        size="small"
                        onClick={() => removeResource(index)}
                        disabled={isProcessing}>
                        <DeleteIcon
                          fontSize="small"
                          sx={{ color: "#f44336" }}
                        />
                      </IconButton>
                    )}
                  </Box>
                  <Box
                    sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    <Box sx={{ display: "flex", gap: 2 }}>
                      <Controller
                        name={`resources.${index}.resource_item`}
                        control={control}
                        render={({ field, fieldState: { error } }) => (
                          <TextField
                            {...field}
                            label={<RequiredLabel>Resource Item</RequiredLabel>}
                            sx={{ width: "calc(33.333% - 11px)" }}
                            disabled={isViewMode || isProcessing}
                            error={!!error}
                            helperText={error?.message}
                          />
                        )}
                      />
                      <Controller
                        name={`resources.${index}.pdp_goal_id`}
                        control={control}
                        render={({ field, fieldState: { error } }) => (
                          <TextField
                            {...field}
                            select
                            label={<RequiredLabel>Linked Goal</RequiredLabel>}
                            disabled={isViewMode || isProcessing}
                            sx={{ width: "calc(33.333% - 11px)" }}
                            SelectProps={{ native: true }}
                            error={!!error}
                            helperText={error?.message}>
                            <option
                              value=""
                              style={{ display: "none" }}></option>
                            {goalFields.map((goal, idx) => (
                              <option key={goal.id} value={goal.id}>
                                Goal {idx + 1}
                              </option>
                            ))}
                          </TextField>
                        )}
                      />
                      <Controller
                        name={`resources.${index}.person_in_charge`}
                        control={control}
                        render={({ field, fieldState: { error } }) => (
                          <TextField
                            {...field}
                            label={
                              <RequiredLabel>Person in Charge</RequiredLabel>
                            }
                            sx={{ width: "calc(33.333% - 11px)" }}
                            disabled={isViewMode || isProcessing}
                            error={!!error}
                            helperText={error?.message}
                          />
                        )}
                      />
                    </Box>
                    <Box sx={{ display: "flex", gap: 2 }}>
                      <Controller
                        name={`resources.${index}.description`}
                        control={control}
                        render={({ field, fieldState: { error } }) => (
                          <TextField
                            {...field}
                            label={<RequiredLabel>Description</RequiredLabel>}
                            multiline
                            rows={2}
                            sx={{ width: "calc(66.666% - 8px)" }}
                            disabled={isViewMode || isProcessing}
                            error={!!error}
                            helperText={error?.message}
                          />
                        )}
                      />
                      <Controller
                        name={`resources.${index}.due_date`}
                        control={control}
                        render={({ field, fieldState: { error } }) => (
                          <DatePicker
                            label={<RequiredLabel>Due Date</RequiredLabel>}
                            value={field.value ? dayjs(field.value) : null}
                            onChange={field.onChange}
                            disabled={isViewMode || isProcessing}
                            slotProps={{
                              textField: {
                                sx: { width: "calc(33.333% - 8px)" },
                                error: !!error,
                                helperText: error?.message,
                              },
                            }}
                          />
                        )}
                      />
                    </Box>
                  </Box>
                </Paper>
              ))}
            </Box>
          )}
        </AccordionDetails>
      </Accordion>

      <Accordion
        expanded={coachingExpanded}
        onChange={(e, expanded) => setCoachingExpanded(expanded)}
        sx={{ mt: 2 }}>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          sx={{ backgroundColor: "#f5f5f5" }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              width: "100%",
              justifyContent: "space-between",
            }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <CoachingIcon sx={{ color: "rgb(33, 61, 112)" }} />
              <Typography sx={{ fontWeight: 600 }}>
                Coaching Sessions ({coachingFields.length})
              </Typography>
            </Box>
            {!isViewMode && (
              <Button
                size="small"
                startIcon={<AddIcon />}
                onClick={(e) => {
                  e.stopPropagation();
                  setCoachingExpanded(true);
                  handleAddCoaching();
                }}
                disabled={isProcessing}
                sx={{ mr: 2 }}>
                Add Session
              </Button>
            )}
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          {coachingFields.length === 0 ? (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ textAlign: "center", py: 3 }}>
              No coaching sessions added yet
            </Typography>
          ) : (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {coachingFields.map((field, index) => (
                <Paper key={field.id} sx={{ p: 2, backgroundColor: "#fafafa" }}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      mb: 2,
                    }}>
                    <Typography
                      variant="subtitle2"
                      sx={{ fontWeight: 600, color: "rgb(33, 61, 112)" }}>
                      {field.month_label || `Session ${index + 1}`}
                    </Typography>
                    {!isViewMode && (
                      <IconButton
                        size="small"
                        onClick={() => removeCoaching(index)}
                        disabled={isProcessing}>
                        <DeleteIcon
                          fontSize="small"
                          sx={{ color: "#f44336" }}
                        />
                      </IconButton>
                    )}
                  </Box>
                  <Box sx={{ display: "flex", gap: 2 }}>
                    <Controller
                      name={`coaching_sessions.${index}.month_label`}
                      control={control}
                      render={({ field, fieldState: { error } }) => (
                        <TextField
                          {...field}
                          label={<RequiredLabel>Month Label</RequiredLabel>}
                          sx={{ width: "calc(33.333% - 11px)" }}
                          disabled={isViewMode || isProcessing}
                          error={!!error}
                          helperText={error?.message}
                        />
                      )}
                    />
                    <Controller
                      name={`coaching_sessions.${index}.session_date`}
                      control={control}
                      render={({ field, fieldState: { error } }) => (
                        <DatePicker
                          label={<RequiredLabel>Session Date</RequiredLabel>}
                          value={field.value ? dayjs(field.value) : null}
                          onChange={field.onChange}
                          disabled={isViewMode || isProcessing}
                          slotProps={{
                            textField: {
                              sx: { width: "calc(33.333% - 11px)" },
                              error: !!error,
                              helperText: error?.message,
                            },
                          }}
                        />
                      )}
                    />
                    <Controller
                      name={`coaching_sessions.${index}.commitment`}
                      control={control}
                      render={({ field, fieldState: { error } }) => (
                        <TextField
                          {...field}
                          label={<RequiredLabel>Commitment</RequiredLabel>}
                          sx={{ width: "calc(33.333% - 11px)" }}
                          disabled={isViewMode || isProcessing}
                          placeholder="Enter commitment for this coaching session..."
                          error={!!error}
                          helperText={error?.message}
                        />
                      )}
                    />
                  </Box>
                </Paper>
              ))}
            </Box>
          )}
        </AccordionDetails>
      </Accordion>
    </>
  );
};

export default PdpModalFields;
