import React, { useEffect, useState, useRef, useCallback } from "react";
import { Controller, useFormContext } from "react-hook-form";
import {
  Grid,
  TextField,
  Typography,
  Box,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  MenuItem,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";
import { sectionTitleStyles } from "../DAForm/DAFormModal.styles";

const ForEvaluationProcessingModalFields = ({
  isReadOnly,
  submissionData,
  currentMode,
}) => {
  const {
    control,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext();

  const formValues = watch();
  const [kpisList, setKpisList] = useState([]);
  const [isKpisLoading, setIsKpisLoading] = useState(false);
  const [cat1Sections, setCat1Sections] = useState([]);
  const [cdpList, setCdpList] = useState([]);

  const isInitialMount = useRef(true);
  const isCat1InitialMount = useRef(true);
  const isCdpInitialMount = useRef(true);
  const prevModeRef = useRef(currentMode);
  const updateTimeoutRef = useRef(null);

  useEffect(() => {
    if (currentMode !== prevModeRef.current) {
      isInitialMount.current = true;
      isCat1InitialMount.current = true;
      isCdpInitialMount.current = true;
      prevModeRef.current = currentMode;
    }
  }, [currentMode]);

  useEffect(() => {
    if (submissionData?.submittable) {
      setValue(
        "probation_start_date",
        submissionData.submittable.probation_start_date || null,
      );
      setValue(
        "probation_end_date",
        submissionData.submittable.probation_end_date || null,
      );

      if (
        submissionData.submittable.objectives &&
        Array.isArray(submissionData.submittable.objectives)
      ) {
        setValue("objectives", submissionData.submittable.objectives);
      }
    }
  }, [submissionData, setValue]);

  useEffect(() => {
    if (
      submissionData?.submittable?.objectives &&
      Array.isArray(submissionData.submittable.objectives)
    ) {
      if (
        isInitialMount.current &&
        submissionData.submittable.objectives.length > 0
      ) {
        setKpisList(submissionData.submittable.objectives);
        isInitialMount.current = false;
      }
    }
  }, [submissionData?.submittable?.objectives]);

  useEffect(() => {
    const sections =
      submissionData?.submittable?.competency_assessment?.template?.sections;
    if (Array.isArray(sections)) {
      if (isCat1InitialMount.current && sections.length > 0) {
        setCat1Sections(sections);
        setValue("competency_assessment_sections", sections);
        isCat1InitialMount.current = false;
      }
    }
  }, [
    submissionData?.submittable?.competency_assessment?.template?.sections,
    setValue,
  ]);

  useEffect(() => {
    const items = submissionData?.submittable?.cdp_items;
    if (Array.isArray(items)) {
      if (isCdpInitialMount.current && items.length > 0) {
        setCdpList(items);
        setValue("cdp_items", items);
        isCdpInitialMount.current = false;
      }
    }
  }, [submissionData?.submittable?.cdp_items, setValue]);

  const handleKpiFieldChange = useCallback(
    (index, field, value) => {
      setKpisList((prevKpisList) => {
        const updatedKpis = [...prevKpisList];

        if (field === "actual_performance") {
          let numValue = value === "" || value === null ? null : Number(value);

          if (numValue !== null) {
            if (numValue < 0) numValue = 0;
            if (numValue > 100) numValue = 100;
          }

          updatedKpis[index] = {
            ...updatedKpis[index],
            [field]: numValue,
          };
        } else {
          updatedKpis[index] = {
            ...updatedKpis[index],
            [field]: value,
          };
        }

        setValue("objectives", updatedKpis, { shouldValidate: false });

        return updatedKpis;
      });
    },
    [setValue],
  );

  const handleCat1ItemChange = useCallback(
    (sectionIndex, itemIndex, childIndex, field, value) => {
      setCat1Sections((prevSections) => {
        const updatedSections = prevSections.map((section, sIdx) => {
          if (sIdx !== sectionIndex) return section;

          const updatedItems = section.items.map((item, iIdx) => {
            if (iIdx !== itemIndex) return item;

            if (childIndex === null) {
              return { ...item, [field]: value };
            }

            const updatedChildren = item.children.map((child, cIdx) =>
              cIdx === childIndex ? { ...child, [field]: value } : child,
            );

            return { ...item, children: updatedChildren };
          });

          return { ...section, items: updatedItems };
        });

        setValue("competency_assessment_sections", updatedSections, {
          shouldValidate: false,
        });

        return updatedSections;
      });
    },
    [setValue],
  );

  const handleCdpFieldChange = useCallback(
    (index, field, value) => {
      setCdpList((prevCdpList) => {
        const updatedCdp = [...prevCdpList];
        updatedCdp[index] = {
          ...updatedCdp[index],
          [field]: value,
        };

        setValue("cdp_items", updatedCdp, { shouldValidate: false });

        return updatedCdp;
      });
    },
    [setValue],
  );

  useEffect(() => {
    return () => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
    };
  }, []);

  const ratingScale =
    submissionData?.submittable?.competency_assessment?.template
      ?.rating_scale || [];

  const renderRatingSelect = (rating_id, onChange) => (
    <TextField
      select
      size="small"
      value={rating_id ?? ""}
      onChange={(e) => onChange(e.target.value)}
      disabled={isReadOnly}
      sx={{ width: "220px", bgcolor: "white" }}>
      {ratingScale.map((rs) => (
        <MenuItem key={rs.id} value={rs.id}>
          {rs.label}
        </MenuItem>
      ))}
    </TextField>
  );

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
            <Grid item xs={12}>
              <TextField
                label="Employee Name"
                value={submissionData?.submittable?.employee?.full_name || ""}
                disabled
                sx={{ bgcolor: "white", width: "348px" }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                label="ID Number"
                value={submissionData?.submittable?.employee?.code || ""}
                disabled
                sx={{ bgcolor: "white", width: "348px" }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                label="Position"
                value={
                  submissionData?.submittable?.employee?.position?.position
                    ?.title?.name || ""
                }
                disabled
                sx={{ bgcolor: "white", width: "348px" }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Controller
                name="probation_start_date"
                control={control}
                render={({ field }) => (
                  <DatePicker
                    {...field}
                    label="Probation Start Date"
                    value={
                      field.value
                        ? dayjs(field.value)
                        : submissionData?.submittable?.probation_start_date
                          ? dayjs(
                              submissionData.submittable.probation_start_date,
                            )
                          : null
                    }
                    onChange={(newValue) => field.onChange(newValue)}
                    disabled={isReadOnly}
                    slotProps={{
                      textField: {
                        error: !!errors.probation_start_date,
                        helperText: errors.probation_start_date?.message,
                        sx: { bgcolor: "white", width: "348px" },
                      },
                    }}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Controller
                name="probation_end_date"
                control={control}
                render={({ field }) => (
                  <DatePicker
                    {...field}
                    label="Probation End Date"
                    value={
                      field.value
                        ? dayjs(field.value)
                        : submissionData?.submittable?.probation_end_date
                          ? dayjs(submissionData.submittable.probation_end_date)
                          : null
                    }
                    onChange={(newValue) => field.onChange(newValue)}
                    disabled={isReadOnly}
                    slotProps={{
                      textField: {
                        error: !!errors.probation_end_date,
                        helperText: errors.probation_end_date?.message,
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
          PART I - PERFORMANCE OBJECTIVES
        </Typography>

        {isKpisLoading ? (
          <Box
            sx={{
              textAlign: "center",
              py: 6,
              borderRadius: 2,
              border: "2px dashed",
              borderColor: "divider",
              minHeight: "200px",
              width: 1140,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
            }}>
            <CircularProgress />
            <Typography
              variant="body1"
              sx={{ color: "text.secondary", fontWeight: 500, mt: 2 }}>
              Loading Performance Objectives...
            </Typography>
          </Box>
        ) : kpisList.length > 0 ? (
          <TableContainer component={Paper} sx={{ width: 1140 }}>
            <Table sx={{ tableLayout: "fixed", width: "100%" }}>
              <colgroup>
                <col style={{ width: "420px" }} />
                <col style={{ width: "150px" }} />
                <col style={{ width: "150px" }} />
                <col style={{ width: "420px" }} />
              </colgroup>
              <TableHead>
                <TableRow sx={{ bgcolor: "#f5f5f5" }}>
                  <TableCell
                    colSpan={2}
                    sx={{
                      fontWeight: 700,
                      textAlign: "center",
                      borderRight: "1px solid #e0e0e0",
                    }}>
                    PERFORMANCE METRICS
                  </TableCell>
                  <TableCell
                    colSpan={2}
                    align="center"
                    sx={{
                      fontWeight: 700,
                    }}>
                    ASSESSMENT
                    <br />
                    <span style={{ fontSize: "0.75rem", fontStyle: "italic" }}>
                      (to be filled up 30 days before end of probation)
                    </span>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell
                    sx={{
                      fontWeight: 600,
                      p: 2,
                      borderRight: "1px solid #e0e0e0",
                    }}>
                    Key Performance Indicators
                  </TableCell>
                  <TableCell
                    sx={{
                      textAlign: "center",
                      fontWeight: 600,
                      p: 2,
                      borderRight: "1px solid #e0e0e0",
                    }}>
                    Target
                  </TableCell>
                  <TableCell
                    sx={{
                      textAlign: "center",
                      fontWeight: 600,
                      p: 2,
                      borderRight: "1px solid #e0e0e0",
                    }}>
                    Actual
                    {!isReadOnly && (
                      <span style={{ color: "#d32f2f", marginLeft: "4px" }}>
                        *
                      </span>
                    )}
                  </TableCell>
                  <TableCell
                    sx={{
                      textAlign: "center",
                      fontWeight: 600,
                      p: 2,
                    }}>
                    Remarks
                    <span
                      style={{
                        fontSize: "0.75rem",
                        fontStyle: "italic",
                        fontWeight: 400,
                      }}>
                      {" "}
                      (Optional)
                    </span>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {kpisList.map((kpi, index) => (
                  <TableRow key={index}>
                    <TableCell
                      sx={{
                        p: 2,
                        verticalAlign: "top",
                        borderRight: "1px solid #e0e0e0",
                      }}>
                      <Typography
                        variant="body2"
                        sx={{ fontWeight: 600, mb: 1 }}>
                        {kpi.objective_name}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{ color: "text.secondary", display: "block" }}>
                        {kpi.deliverable}
                      </Typography>
                    </TableCell>
                    <TableCell
                      sx={{
                        p: 2,
                        verticalAlign: "top",
                        textAlign: "center",
                        borderRight: "1px solid #e0e0e0",
                      }}>
                      <TextField
                        size="small"
                        type="number"
                        value={kpi.target_percentage}
                        inputProps={{
                          min: 0,
                          max: 100,
                          step: "any",
                        }}
                        sx={{ width: "100px" }}
                        disabled
                      />
                    </TableCell>
                    <TableCell
                      sx={{
                        p: 2,
                        verticalAlign: "top",
                        textAlign: "center",
                        borderRight: "1px solid #e0e0e0",
                      }}>
                      <TextField
                        size="small"
                        type="number"
                        value={kpi.actual_performance ?? ""}
                        onChange={(e) =>
                          handleKpiFieldChange(
                            index,
                            "actual_performance",
                            e.target.value,
                          )
                        }
                        inputProps={{
                          min: 0,
                          max: 100,
                          step: "any",
                        }}
                        placeholder={isReadOnly ? "-" : "Enter %"}
                        error={
                          !isReadOnly &&
                          (kpi.actual_performance === null ||
                            kpi.actual_performance === undefined ||
                            kpi.actual_performance === "")
                        }
                        helperText={
                          !isReadOnly &&
                          (kpi.actual_performance === null ||
                            kpi.actual_performance === undefined ||
                            kpi.actual_performance === "")
                            ? "Required"
                            : ""
                        }
                        sx={{
                          width: "100px",
                          "& .MuiOutlinedInput-root": {
                            backgroundColor: isReadOnly
                              ? "transparent"
                              : kpi.actual_performance !== null &&
                                  kpi.actual_performance !== undefined &&
                                  kpi.actual_performance !== ""
                                ? "#f1f8f4"
                                : "#fffef7",
                            "& fieldset": {
                              borderColor: isReadOnly
                                ? "#e0e0e0"
                                : kpi.actual_performance !== null &&
                                    kpi.actual_performance !== undefined &&
                                    kpi.actual_performance !== ""
                                  ? "#4caf50"
                                  : "#ffa726",
                              borderWidth: isReadOnly ? "1px" : "2px",
                            },
                            "&:hover fieldset": {
                              borderColor: isReadOnly
                                ? "#e0e0e0"
                                : kpi.actual_performance !== null &&
                                    kpi.actual_performance !== undefined &&
                                    kpi.actual_performance !== ""
                                  ? "#45a049"
                                  : "#ff9800",
                            },
                            "&.Mui-focused fieldset": {
                              borderColor: isReadOnly
                                ? "#e0e0e0"
                                : kpi.actual_performance !== null &&
                                    kpi.actual_performance !== undefined &&
                                    kpi.actual_performance !== ""
                                  ? "#45a049"
                                  : "#ff9800",
                            },
                            "&.Mui-error fieldset": {
                              borderColor: "#d32f2f",
                            },
                          },
                        }}
                        disabled={isReadOnly}
                      />
                    </TableCell>
                    <TableCell sx={{ p: 2, verticalAlign: "top" }}>
                      <TextField
                        size="small"
                        value={kpi.remarks || ""}
                        onChange={(e) =>
                          handleKpiFieldChange(index, "remarks", e.target.value)
                        }
                        placeholder={isReadOnly ? "-" : "Optional remarks"}
                        multiline
                        maxRows={2}
                        sx={{
                          width: "100%",
                          "& .MuiOutlinedInput-root": {
                            backgroundColor: "white",
                            "& fieldset": {
                              borderColor: "#e0e0e0",
                            },
                            "&:hover fieldset": {
                              borderColor: isReadOnly ? "#e0e0e0" : "#bdbdbd",
                            },
                            "&.Mui-focused fieldset": {
                              borderColor: isReadOnly ? "#e0e0e0" : "#1976d2",
                            },
                          },
                        }}
                        disabled={isReadOnly}
                      />
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
              No Performance Objectives available
            </Typography>
          </Box>
        )}
      </Grid>

      <Grid item xs={12}>
        <Typography variant="h6" sx={sectionTitleStyles}>
          PART II - COMPETENCY ASSESSMENT
        </Typography>

        {submissionData?.submittable?.competency_assessment?.template?.name && (
          <Typography
            variant="body2"
            sx={{ fontWeight: 600, mb: 2, color: "text.secondary" }}>
            {submissionData.submittable.competency_assessment.template.name}
          </Typography>
        )}

        {cat1Sections.length > 0 ? (
          <TableContainer component={Paper} sx={{ width: 1140 }}>
            <Table sx={{ tableLayout: "fixed", width: "100%" }}>
              <colgroup>
                <col style={{ width: "620px" }} />
                <col style={{ width: "220px" }} />
                <col style={{ width: "300px" }} />
              </colgroup>
              <TableHead>
                <TableRow sx={{ bgcolor: "#f5f5f5" }}>
                  <TableCell sx={{ fontWeight: 600, p: 2 }}>
                    Competency
                  </TableCell>
                  <TableCell
                    sx={{ fontWeight: 600, p: 2, textAlign: "center" }}>
                    Rating
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, p: 2 }}>Comments</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {cat1Sections.map((section, sectionIndex) => (
                  <React.Fragment key={section.id}>
                    <TableRow sx={{ bgcolor: "#eef2f7" }}>
                      <TableCell colSpan={3} sx={{ fontWeight: 700, p: 2 }}>
                        {section.title}
                      </TableCell>
                    </TableRow>
                    {section.items.map((item, itemIndex) => (
                      <React.Fragment key={item.id}>
                        <TableRow>
                          <TableCell
                            sx={{
                              p: 2,
                              fontWeight: item.is_header ? 600 : 400,
                              pl: 2,
                            }}>
                            {item.text}
                          </TableCell>
                          <TableCell sx={{ p: 2, textAlign: "center" }}>
                            {item.is_rateable &&
                              renderRatingSelect(item.rating_id, (value) =>
                                handleCat1ItemChange(
                                  sectionIndex,
                                  itemIndex,
                                  null,
                                  "rating_id",
                                  value,
                                ),
                              )}
                          </TableCell>
                          <TableCell sx={{ p: 2 }}>
                            {item.is_rateable && (
                              <TextField
                                size="small"
                                value={item.comments || ""}
                                onChange={(e) =>
                                  handleCat1ItemChange(
                                    sectionIndex,
                                    itemIndex,
                                    null,
                                    "comments",
                                    e.target.value,
                                  )
                                }
                                placeholder={isReadOnly ? "-" : "Comments"}
                                multiline
                                maxRows={2}
                                sx={{ width: "100%", bgcolor: "white" }}
                                disabled={isReadOnly}
                              />
                            )}
                          </TableCell>
                        </TableRow>
                        {item.children?.map((child, childIndex) => (
                          <TableRow key={child.id}>
                            <TableCell sx={{ p: 2, pl: 5 }}>
                              {child.text}
                            </TableCell>
                            <TableCell sx={{ p: 2, textAlign: "center" }}>
                              {child.is_rateable &&
                                renderRatingSelect(child.rating_id, (value) =>
                                  handleCat1ItemChange(
                                    sectionIndex,
                                    itemIndex,
                                    childIndex,
                                    "rating_id",
                                    value,
                                  ),
                                )}
                            </TableCell>
                            <TableCell sx={{ p: 2 }}>
                              {child.is_rateable && (
                                <TextField
                                  size="small"
                                  value={child.comments || ""}
                                  onChange={(e) =>
                                    handleCat1ItemChange(
                                      sectionIndex,
                                      itemIndex,
                                      childIndex,
                                      "comments",
                                      e.target.value,
                                    )
                                  }
                                  placeholder={isReadOnly ? "-" : "Comments"}
                                  multiline
                                  maxRows={2}
                                  sx={{ width: "100%", bgcolor: "white" }}
                                  disabled={isReadOnly}
                                />
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </React.Fragment>
                    ))}
                  </React.Fragment>
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
              No Competency Assessment available
            </Typography>
          </Box>
        )}
      </Grid>

      <Grid item xs={12}>
        <Typography variant="h6" sx={sectionTitleStyles}>
          PART III - CAREER DEVELOPMENT PLAN
        </Typography>

        {cdpList.length > 0 ? (
          <TableContainer component={Paper} sx={{ width: 1140 }}>
            <Table sx={{ tableLayout: "fixed", width: "100%" }}>
              <colgroup>
                <col style={{ width: "260px" }} />
                <col style={{ width: "220px" }} />
                <col style={{ width: "180px" }} />
                <col style={{ width: "240px" }} />
                <col style={{ width: "240px" }} />
              </colgroup>
              <TableHead>
                <TableRow sx={{ bgcolor: "#f5f5f5" }}>
                  <TableCell sx={{ fontWeight: 600, p: 2 }}>
                    Competency
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, p: 2 }}>
                    Action Plan
                  </TableCell>
                  <TableCell
                    sx={{ fontWeight: 600, p: 2, textAlign: "center" }}>
                    Target Date
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, p: 2 }}>
                    Person Responsible
                  </TableCell>
                  <TableCell
                    sx={{ fontWeight: 600, p: 2, textAlign: "center" }}>
                    Date of Completion
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {cdpList.map((cdp, index) => (
                  <TableRow key={cdp.id}>
                    <TableCell sx={{ p: 2, verticalAlign: "top" }}>
                      <TextField
                        size="small"
                        value={cdp.competency || ""}
                        onChange={(e) =>
                          handleCdpFieldChange(
                            index,
                            "competency",
                            e.target.value,
                          )
                        }
                        multiline
                        maxRows={2}
                        sx={{ width: "100%", bgcolor: "white" }}
                        disabled={isReadOnly}
                      />
                    </TableCell>
                    <TableCell sx={{ p: 2, verticalAlign: "top" }}>
                      <Typography variant="body2">
                        {(cdp.action_plan_types || [])
                          .map(
                            (type) =>
                              type.charAt(0).toUpperCase() + type.slice(1),
                          )
                          .join(", ")}
                        {cdp.action_plan_other
                          ? ` (${cdp.action_plan_other})`
                          : ""}
                      </Typography>
                    </TableCell>
                    <TableCell
                      sx={{ p: 2, verticalAlign: "top", textAlign: "center" }}>
                      <DatePicker
                        value={cdp.target_date ? dayjs(cdp.target_date) : null}
                        onChange={(newValue) =>
                          handleCdpFieldChange(index, "target_date", newValue)
                        }
                        disabled={isReadOnly}
                        slotProps={{
                          textField: {
                            size: "small",
                            sx: { bgcolor: "white", width: "160px" },
                          },
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ p: 2, verticalAlign: "top" }}>
                      <TextField
                        size="small"
                        value={cdp.person_responsible || ""}
                        onChange={(e) =>
                          handleCdpFieldChange(
                            index,
                            "person_responsible",
                            e.target.value,
                          )
                        }
                        placeholder={isReadOnly ? "-" : "Person Responsible"}
                        sx={{ width: "100%", bgcolor: "white" }}
                        disabled={isReadOnly}
                      />
                    </TableCell>
                    <TableCell
                      sx={{ p: 2, verticalAlign: "top", textAlign: "center" }}>
                      <DatePicker
                        value={
                          cdp.date_of_completion
                            ? dayjs(cdp.date_of_completion)
                            : null
                        }
                        onChange={(newValue) =>
                          handleCdpFieldChange(
                            index,
                            "date_of_completion",
                            newValue,
                          )
                        }
                        disabled={isReadOnly}
                        slotProps={{
                          textField: {
                            size: "small",
                            sx: { bgcolor: "white", width: "160px" },
                          },
                        }}
                      />
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
              No Career Development Plan items available
            </Typography>
          </Box>
        )}
      </Grid>
    </Grid>
  );
};

export default ForEvaluationProcessingModalFields;
