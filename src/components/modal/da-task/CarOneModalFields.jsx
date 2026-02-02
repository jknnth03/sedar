import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Paper,
  Divider,
  Alert,
  LinearProgress,
  Skeleton,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { Controller, useFormContext } from "react-hook-form";
import dayjs from "dayjs";
import { format, parseISO } from "date-fns";
import Overdue from "../../../assets/clock-alert.svg";

const CatOneModalFields = ({
  isLoading = false,
  mode = "view",
  onFormDataCreate,
  selectedEntry = null,
  formInitialized = false,
  startDate = null,
  endDate = null,
  isOverdue = false,
}) => {
  const {
    control,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext();

  const [scores, setScores] = useState(null);

  const dateAssessed = watch("date_assessed");
  const answers = watch("answers") || [];

  const isViewMode = mode === "view";
  const templateData = selectedEntry?.template;

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return format(parseISO(dateString), "MMM dd, yyyy");
    } catch (error) {
      return "Invalid Date";
    }
  };

  useEffect(() => {
    if (isViewMode && selectedEntry?.scores) {
      setScores(selectedEntry.scores);
    }
  }, [isViewMode, selectedEntry?.scores]);

  useEffect(() => {
    if (formInitialized && templateData && answers.length === 0) {
      const initialAnswers = [];

      const collectRateableItems = (items) => {
        items.forEach((item) => {
          if (item.is_rateable) {
            initialAnswers.push({
              template_item_id: item.id,
              rating_scale_id: item.rating_id || null,
            });
          }
          if (item.children && item.children.length > 0) {
            collectRateableItems(item.children);
          }
        });
      };

      templateData.sections.forEach((section) => {
        collectRateableItems(section.items);
      });

      setValue("answers", initialAnswers, { shouldValidate: false });
    }
  }, [formInitialized, templateData, answers.length, setValue]);

  useEffect(() => {
    if (onFormDataCreate) {
      const getFormData = () => {
        const formData = {
          date_assessed: dateAssessed
            ? dayjs(dateAssessed).format("YYYY-MM-DD")
            : null,
          answers: answers.filter((answer) => answer.rating_scale_id !== null),
          action: "submit_for_validation",
        };
        return formData;
      };
      onFormDataCreate(getFormData);
    }
  }, [dateAssessed, answers, onFormDataCreate]);

  const handleRatingChange = (templateItemId, ratingScaleId) => {
    const updatedAnswers = answers.map((answer) =>
      answer.template_item_id === templateItemId
        ? { ...answer, rating_scale_id: ratingScaleId }
        : answer,
    );
    setValue("answers", updatedAnswers, { shouldValidate: true });
  };

  const getRatingForItem = (templateItemId) => {
    const answer = answers.find((a) => a.template_item_id === templateItemId);
    return answer?.rating_scale_id || null;
  };

  const calculateSectionProgress = (sectionItems) => {
    let totalRateable = 0;
    let totalAnswered = 0;

    const countItems = (items) => {
      items.forEach((item) => {
        if (item.is_rateable) {
          totalRateable++;
          if (getRatingForItem(item.id) !== null) {
            totalAnswered++;
          }
        }
        if (item.children && item.children.length > 0) {
          countItems(item.children);
        }
      });
    };

    countItems(sectionItems);
    return totalRateable > 0 ? (totalAnswered / totalRateable) * 100 : 0;
  };

  const renderItem = (item, level = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isRateable = item.is_rateable;

    return (
      <Box key={item.id} sx={{ mb: isRateable ? 2 : 1 }}>
        {isRateable ? (
          <Paper
            elevation={0}
            sx={{
              p: 3,
              border: "1px solid #e0e0e0",
              backgroundColor: isViewMode ? "#fafafa" : "white",
            }}>
            <FormControl
              component="fieldset"
              fullWidth
              disabled={isViewMode || isLoading}>
              <FormLabel
                component="legend"
                sx={{
                  fontWeight: 500,
                  fontSize: "0.95rem",
                  color: "text.primary",
                  mb: 2,
                  "&.Mui-focused": {
                    color: "text.primary",
                  },
                }}>
                {item.text}
              </FormLabel>
              <RadioGroup
                row
                value={getRatingForItem(item.id) || ""}
                onChange={(e) =>
                  handleRatingChange(item.id, parseInt(e.target.value))
                }
                sx={{
                  gap: 3,
                  flexWrap: "wrap",
                  justifyContent: "flex-start",
                }}>
                {templateData.rating_scale.map((scale) => (
                  <FormControlLabel
                    key={scale.id}
                    value={scale.id}
                    control={
                      <Radio
                        sx={{
                          color: isViewMode ? "#9e9e9e" : "rgb(33, 61, 112)",
                          "&.Mui-checked": {
                            color: isViewMode ? "#757575" : "rgb(33, 61, 112)",
                          },
                        }}
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {scale.label}
                        </Typography>
                      </Box>
                    }
                    sx={{
                      border: "1px solid #e0e0e0",
                      borderRadius: "8px",
                      px: 4,
                      py: 2,
                      m: 0,
                      minWidth: "180px",
                      flex: "1 1 auto",
                      maxWidth: "240px",
                      backgroundColor:
                        getRatingForItem(item.id) === scale.id
                          ? isViewMode
                            ? "#e0e0e0"
                            : "rgba(33, 61, 112, 0.08)"
                          : "white",
                      "&:hover": {
                        backgroundColor:
                          !isViewMode && !isLoading
                            ? "rgba(33, 61, 112, 0.04)"
                            : undefined,
                      },
                    }}
                  />
                ))}
              </RadioGroup>
            </FormControl>
          </Paper>
        ) : (
          <Typography
            variant="body1"
            sx={{
              fontWeight: 600,
              color: "text.primary",
              mb: 2,
              pl: level * 2,
            }}>
            {item.text}
          </Typography>
        )}

        {hasChildren && (
          <Box sx={{ pl: 3 }}>
            {item.children.map((child) => renderItem(child, level + 1))}
          </Box>
        )}
      </Box>
    );
  };

  if (isLoading) {
    return (
      <Box sx={{ p: 3 }}>
        <Paper
          elevation={0}
          sx={{
            p: 3,
            mb: 3,
            backgroundColor: "#f8f9fa",
            border: "1px solid #e0e0e0",
          }}>
          <Skeleton variant="text" width="40%" height={32} sx={{ mb: 2 }} />
          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
            <Box>
              <Skeleton variant="text" width="60%" height={20} />
              <Skeleton variant="text" width="80%" height={24} />
            </Box>
            <Box>
              <Skeleton variant="text" width="60%" height={20} />
              <Skeleton variant="text" width="80%" height={24} />
            </Box>
          </Box>
        </Paper>

        <Skeleton variant="rounded" width="100%" height={56} sx={{ mb: 3 }} />

        <Divider sx={{ my: 3 }} />

        <Skeleton variant="text" width="30%" height={32} sx={{ mb: 3 }} />

        {[1, 2, 3].map((section) => (
          <Box key={section} sx={{ mb: 4 }}>
            <Skeleton variant="text" width="50%" height={40} sx={{ mb: 2 }} />
            {[1, 2].map((item) => (
              <Paper
                key={item}
                elevation={0}
                sx={{
                  p: 3,
                  mb: 2,
                  border: "1px solid #e0e0e0",
                }}>
                <Skeleton
                  variant="text"
                  width="70%"
                  height={24}
                  sx={{ mb: 2 }}
                />
                <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
                  {[1, 2, 3, 4].map((radio) => (
                    <Skeleton
                      key={radio}
                      variant="rounded"
                      width={180}
                      height={60}
                      sx={{ borderRadius: "8px" }}
                    />
                  ))}
                </Box>
              </Paper>
            ))}
          </Box>
        ))}
      </Box>
    );
  }

  if (!templateData) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">Failed to load template data.</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 3,
          backgroundColor: "#f8f9fa",
          border: "1px solid #e0e0e0",
        }}>
        <Typography
          variant="h6"
          sx={{ mb: 2, fontWeight: 600, color: "rgb(33, 61, 112)" }}>
          Employee Information
        </Typography>
        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
          <Box>
            <Typography variant="caption" color="text.secondary">
              Employee Name
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 500 }}>
              {selectedEntry?.employee_name || "N/A"}
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">
              Position Title
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 500 }}>
              {selectedEntry?.to_position_title || "N/A"}
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">
              Department
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 500 }}>
              {selectedEntry?.department || "N/A"}
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">
              Template Name
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 500 }}>
              {templateData?.name || "N/A"}
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">
              Start Date
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 500 }}>
              {formatDate(startDate)}
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">
              End Date
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                {formatDate(endDate)}
              </Typography>
              {isOverdue && (
                <img
                  src={Overdue}
                  alt="Overdue"
                  style={{ width: "18px", height: "18px" }}
                />
              )}
            </Box>
          </Box>
        </Box>
      </Paper>

      <Box sx={{ mb: 3 }}>
        <Controller
          name="date_assessed"
          control={control}
          rules={{
            required: "Date assessed is required",
          }}
          render={({ field }) => (
            <DatePicker
              {...field}
              label="Date Assessed"
              disabled={isViewMode || isLoading}
              slotProps={{
                textField: {
                  fullWidth: true,
                  error: !!errors.date_assessed,
                  helperText: errors.date_assessed?.message,
                  sx: {
                    "& .MuiOutlinedInput-root": {
                      backgroundColor: isViewMode ? "#f5f5f5" : "white",
                    },
                  },
                },
              }}
            />
          )}
        />
      </Box>

      {isViewMode && scores && (
        <>
          <Divider sx={{ my: 3 }} />
          <Paper
            elevation={0}
            sx={{
              p: 3,
              mb: 3,
              backgroundColor: "#f0f7ff",
              border: "2px solid rgb(33, 61, 112)",
            }}>
            <Typography
              variant="h6"
              sx={{ mb: 2, fontWeight: 600, color: "rgb(33, 61, 112)" }}>
              Assessment Results
            </Typography>
            {Object.entries(scores.sections).map(
              ([sectionName, sectionData]) => (
                <Box key={sectionName} sx={{ mb: 2 }}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      mb: 1,
                    }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {sectionName}
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {sectionData.subtotal_percentage.toFixed(2)}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={sectionData.subtotal_percentage}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: "#e0e0e0",
                      "& .MuiLinearProgress-bar": {
                        backgroundColor: "rgb(33, 61, 112)",
                      },
                    }}
                  />
                  <Typography variant="caption" color="text.secondary">
                    Score: {sectionData.employee_score} /{" "}
                    {sectionData.total_possible_score} | Weight:{" "}
                    {sectionData.weight}%
                  </Typography>
                </Box>
              ),
            )}
            <Divider sx={{ my: 2 }} />
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Total Score:
              </Typography>
              <Typography
                variant="h5"
                sx={{ fontWeight: 700, color: "rgb(33, 61, 112)" }}>
                {scores.total_score_percentage.toFixed(2)}%
              </Typography>
            </Box>
          </Paper>
        </>
      )}

      <Divider sx={{ my: 3 }} />

      <Typography
        variant="h6"
        sx={{ mb: 3, fontWeight: 600, color: "rgb(33, 61, 112)" }}>
        Assessment Items
      </Typography>

      {templateData.sections.map((section) => (
        <Box key={section.id} sx={{ mb: 4 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
            }}>
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 600,
                color: "rgb(33, 61, 112)",
                backgroundColor: "#f0f4f8",
                padding: "8px 16px",
                borderRadius: "4px",
                flex: 1,
              }}>
              {section.title}
            </Typography>
            {!isViewMode && (
              <Box sx={{ ml: 2, minWidth: "120px" }}>
                <Typography variant="caption" color="text.secondary">
                  Progress: {calculateSectionProgress(section.items).toFixed(0)}
                  %
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={calculateSectionProgress(section.items)}
                  sx={{
                    height: 6,
                    borderRadius: 3,
                    backgroundColor: "#e0e0e0",
                    "& .MuiLinearProgress-bar": {
                      backgroundColor: "#4CAF50",
                    },
                  }}
                />
              </Box>
            )}
          </Box>

          {section.items.map((item) => renderItem(item))}
        </Box>
      ))}

      {!isViewMode && answers.length > 0 && (
        <Box sx={{ mt: 3 }}>
          <Alert
            severity={
              answers.every((a) => a.rating_scale_id !== null)
                ? "success"
                : "warning"
            }>
            {answers.every((a) => a.rating_scale_id !== null)
              ? "All assessment items have been rated."
              : `Please rate all assessment items. ${
                  answers.filter((a) => a.rating_scale_id === null).length
                } item(s) remaining.`}
          </Alert>
        </Box>
      )}
    </Box>
  );
};

export default CatOneModalFields;
