import React, { useEffect, useState, useRef } from "react";
import { Controller, useFormContext } from "react-hook-form";
import {
  Grid,
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

  return (
    <Grid container spacing={3} sx={{ height: "100%" }}>
      <Grid item xs={12}>
        <Typography variant="h6" sx={sectionTitleStyles}>
          EMPLOYEE INFORMATION
        </Typography>
        <Box
          sx={{
            p: 3.5,
            borderRadius: 2,
          }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                label="EMPLOYEE NAME"
                value={formValues.employee_name || ""}
                disabled
                sx={{ bgcolor: "white", width: "348px" }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                label="POSITION - FROM"
                value={formValues.from_position_title || ""}
                disabled
                sx={{ bgcolor: "white", width: "348px" }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                label="POSITION - TO"
                value={formValues.to_position_title || ""}
                disabled
                sx={{ bgcolor: "white", width: "348px" }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                label="DEPARTMENT - FROM"
                value={formValues.from_department || "-"}
                disabled
                sx={{ bgcolor: "white", width: "348px" }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                label="DEPARTMENT - TO"
                value={formValues.to_department || "-"}
                disabled
                sx={{ bgcolor: "white", width: "348px" }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
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
                        sx: { bgcolor: "white", width: "348px" },
                      },
                    }}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} md={6}>
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
                        sx: { bgcolor: "white", width: "348px" },
                      },
                    }}
                  />
                )}
              />
            </Grid>
          </Grid>
        </Box>
      </Grid>

      <Grid item xs={12}>
        <Typography variant="h6" sx={sectionTitleStyles}>
          PART I - SETTING OF OBJECTIVES
        </Typography>

        {objectivesList.length > 0 ? (
          <TableContainer
            component={Paper}
            sx={{
              width: 1140,
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
                    <span style={{ fontSize: "0.75rem", fontStyle: "italic" }}>
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
                        sx={{ flex: 1, textAlign: "center", fontWeight: 600 }}>
                        Target
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell sx={{ borderRight: "1px solid #e0e0e0" }}>
                    <Box sx={{ display: "flex", gap: 1 }}>
                      <Box
                        sx={{ flex: 1, textAlign: "center", fontWeight: 600 }}>
                        Actual
                      </Box>
                      <Box
                        sx={{ flex: 1, textAlign: "center", fontWeight: 600 }}>
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
                            sx={{ color: "text.secondary", display: "block" }}>
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
              width: 1140,
              minHeight: "50px",
            }}>
            <Typography
              variant="body1"
              sx={{ color: "text.secondary", fontWeight: 500 }}>
              No objectives available
            </Typography>
          </Box>
        )}
      </Grid>
    </Grid>
  );
};

export default DaFormReceivingModalFields;
