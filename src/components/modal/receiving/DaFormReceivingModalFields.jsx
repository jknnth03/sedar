import React, { useEffect, useState, useRef } from "react";
import { Controller, useFormContext } from "react-hook-form";
import {
  TextField,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";
import { sectionTitleStyles } from "../form/DAForm/DAFormModal.styles";

const DaFormReceivingModalFields = ({
  isReadOnly,
  currentMode,
  isAssessmentMode = false,
  isCompletedMode = false,
}) => {
  const {
    control,
    watch,
    formState: { errors },
  } = useFormContext();

  const formValues = watch();
  const [objectivesList, setObjectivesList] = useState([]);

  const isInitialMount = useRef(true);
  const prevModeRef = useRef(currentMode);

  useEffect(() => {
    if (currentMode !== prevModeRef.current) {
      isInitialMount.current = true;
      prevModeRef.current = currentMode;
    }
  }, [currentMode]);

  useEffect(() => {
    if (formValues.objectives && Array.isArray(formValues.objectives)) {
      if (isInitialMount.current && formValues.objectives.length > 0) {
        setObjectivesList(formValues.objectives);
        isInitialMount.current = false;
      }
    }
  }, [formValues.objectives]);

  const containerStyles = {
    main: {
      padding: "16px 24px",
    },
  };

  const textFieldStyles = {
    outlinedInput: {
      "& .MuiOutlinedInput-root": {
        borderRadius: "8px",
        "& fieldset": {
          borderColor: "#e0e0e0",
        },
        "&:hover fieldset": {
          borderColor: "#b0b0b0",
        },
        "&.Mui-focused fieldset": {
          borderColor: "rgb(33, 61, 112)",
        },
      },
      "& .MuiInputLabel-root": {
        color: "#666",
        "&.Mui-focused": {
          color: "rgb(33, 61, 112)",
        },
      },
    },
  };

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" sx={sectionTitleStyles}>
          EMPLOYEE INFORMATION
        </Typography>
        <Box sx={containerStyles.main}>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "1fr",
                md: "repeat(2, 1fr)",
              },
              "@media (min-width: 750px)": {
                gridTemplateColumns: "repeat(2, 1fr)",
              },
              gap: 2,
            }}>
            <Box>
              <TextField
                label="EMPLOYEE NAME"
                value={formValues.employee_name || ""}
                disabled
                fullWidth
                sx={textFieldStyles.outlinedInput}
              />
            </Box>

            <Box>
              <TextField
                label="POSITION - FROM"
                value={formValues.from_position_title || ""}
                disabled
                fullWidth
                sx={textFieldStyles.outlinedInput}
              />
            </Box>

            <Box>
              <TextField
                label="POSITION - TO"
                value={formValues.to_position_title || ""}
                disabled
                fullWidth
                sx={textFieldStyles.outlinedInput}
              />
            </Box>

            <Box>
              <TextField
                label="DEPARTMENT - FROM"
                value={formValues.from_department || "-"}
                disabled
                fullWidth
                sx={textFieldStyles.outlinedInput}
              />
            </Box>

            <Box>
              <TextField
                label="DEPARTMENT - TO"
                value={formValues.to_department || "-"}
                disabled
                fullWidth
                sx={textFieldStyles.outlinedInput}
              />
            </Box>

            <Box>
              <Controller
                name="start_date"
                control={control}
                render={({ field }) => (
                  <DatePicker
                    {...field}
                    value={
                      field.value && dayjs.isDayjs(field.value)
                        ? field.value
                        : field.value
                          ? dayjs(field.value)
                          : null
                    }
                    label="INCLUSIVE DATES - FROM"
                    disabled
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        sx: textFieldStyles.outlinedInput,
                      },
                    }}
                  />
                )}
              />
            </Box>

            <Box>
              <Controller
                name="end_date"
                control={control}
                render={({ field }) => (
                  <DatePicker
                    {...field}
                    value={
                      field.value && dayjs.isDayjs(field.value)
                        ? field.value
                        : field.value
                          ? dayjs(field.value)
                          : null
                    }
                    label="INCLUSIVE DATES - TO"
                    disabled
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        sx: textFieldStyles.outlinedInput,
                      },
                    }}
                  />
                )}
              />
            </Box>
          </Box>
        </Box>
      </Box>

      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" sx={sectionTitleStyles}>
          PART I - SETTING OF OBJECTIVES
        </Typography>

        <Box sx={containerStyles.main}>
          {objectivesList.length > 0 ? (
            <TableContainer
              component={Paper}
              sx={{
                width: "100%",
                overflowX: "auto",
              }}>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: "#f5f5f5" }}>
                    <TableCell
                      sx={{
                        fontWeight: 700,
                        width: "50%",
                      }}>
                      PERFORMANCE METRICS
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{
                        fontWeight: 700,
                        width: "50%",
                      }}>
                      ASSESSMENT
                      <br />
                      <span
                        style={{ fontSize: "0.75rem", fontStyle: "italic" }}>
                        (to be filled up 30 days before end of DA)
                      </span>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{ borderRight: "1px solid #e0e0e0" }}>
                      <Box sx={{ display: "flex", gap: 1 }}>
                        <Box sx={{ flex: 1, fontWeight: 600 }}>
                          Key Performance Indicators
                        </Box>
                        <Box
                          sx={{
                            flex: 1,
                            textAlign: "center",
                            fontWeight: 600,
                          }}>
                          Target
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ borderRight: "1px solid #e0e0e0" }}>
                      <Box sx={{ display: "flex", gap: 1 }}>
                        <Box
                          sx={{
                            flex: 1,
                            textAlign: "center",
                            fontWeight: 600,
                          }}>
                          Actual
                        </Box>
                        <Box
                          sx={{
                            flex: 1,
                            textAlign: "center",
                            fontWeight: 600,
                          }}>
                          Remarks
                        </Box>
                      </Box>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {objectivesList.map((objective, index) => (
                    <TableRow key={index}>
                      <TableCell sx={{ borderRight: "1px solid #e0e0e0" }}>
                        <Box sx={{ display: "flex", gap: 1 }}>
                          <Box sx={{ flex: 1 }}>
                            <Typography
                              variant="body2"
                              sx={{ fontWeight: 600, mb: 1 }}>
                              {objective.objective_name}
                            </Typography>
                            <Typography
                              variant="caption"
                              sx={{
                                color: "text.secondary",
                                display: "block",
                              }}>
                              {objective.deliverable}
                            </Typography>
                          </Box>
                          <Box sx={{ flex: 1, textAlign: "center" }}>
                            {`${objective.target_percentage}%`}
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell sx={{ borderRight: "1px solid #e0e0e0" }}>
                        <Box sx={{ display: "flex", gap: 1 }}>
                          <Box sx={{ flex: 1, textAlign: "center" }}>
                            {objective.actual_performance !== null &&
                            objective.actual_performance !== undefined
                              ? `${objective.actual_performance}%`
                              : "-"}
                          </Box>
                          <Box sx={{ flex: 1, textAlign: "center" }}>
                            {objective.remarks || "-"}
                          </Box>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Box
              sx={{
                textAlign: "center",
                py: 6,
                borderRadius: 2,
                border: "2px dashed",
                borderColor: "divider",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                width: "100%",
                minHeight: "50px",
              }}>
              <Typography
                variant="body1"
                sx={{ color: "text.secondary", fontWeight: 500 }}>
                No objectives available
              </Typography>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default DaFormReceivingModalFields;
