import React from "react";
import {
  Box,
  Typography,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
} from "@mui/material";
import { sectionTitleStyles } from "../DAForm/DAFormModal.styles";

const LoadingBox = ({ message }) => (
  <Box
    sx={{
      textAlign: "center",
      py: 6,
      borderRadius: 2,
      border: "2px dashed",
      borderColor: "divider",
      minHeight: "200px",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
    }}>
    <CircularProgress />
    <Typography
      variant="body1"
      sx={{ color: "text.secondary", fontWeight: 500, mt: 2 }}>
      {message}
    </Typography>
  </Box>
);

const EmptyStateBox = ({ message }) => (
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
      minHeight: "50px",
    }}>
    <Typography
      variant="body1"
      sx={{ color: "text.secondary", fontWeight: 500 }}>
      {message}
    </Typography>
  </Box>
);

const ErrorBox = ({ message }) => (
  <Box
    sx={{
      mb: 2,
      p: 2,
      bgcolor: "#ffebee",
      borderRadius: 1,
      border: "1px solid #ef5350",
    }}>
    <Typography variant="body2" sx={{ color: "#d32f2f", fontWeight: 500 }}>
      {message}
    </Typography>
  </Box>
);

export const KpiTable = ({
  kpisList,
  isReadOnly,
  onFieldChange,
  errors,
  kpiErrors,
}) => (
  <TableContainer component={Paper} sx={{ width: "100%" }}>
    <Table sx={{ tableLayout: "fixed", width: "100%" }}>
      <colgroup>
        <col style={{ width: "35%" }} />
        <col style={{ width: "15%" }} />
        <col style={{ width: "20%" }} />
        <col style={{ width: "30%" }} />
      </colgroup>
      <TableHead>
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
            Target (%)
          </TableCell>
          <TableCell
            sx={{
              textAlign: "center",
              fontWeight: 600,
              p: 2,
              borderRight: "1px solid #e0e0e0",
            }}>
            Actual Performance
          </TableCell>
          <TableCell sx={{ textAlign: "center", fontWeight: 600, p: 2 }}>
            Remarks{" "}
            <span
              style={{
                fontSize: "0.75rem",
                fontStyle: "italic",
                fontWeight: 400,
              }}>
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
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
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
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {kpi.target_percentage}%
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
                multiline
                maxRows={3}
                value={kpi.actual_performance || ""}
                onChange={(e) =>
                  onFieldChange(index, "actual_performance", e.target.value)
                }
                placeholder={isReadOnly ? "-" : "Enter performance"}
                error={
                  !!kpiErrors[index]?.actual_performance ||
                  !!errors?.kpis?.[index]?.actual_performance?.message
                }
                helperText={
                  kpiErrors[index]?.actual_performance ||
                  errors?.kpis?.[index]?.actual_performance?.message
                }
                sx={{
                  width: "100%",
                  "& .MuiOutlinedInput-root": {
                    backgroundColor: "white",
                    "& fieldset": {
                      borderColor:
                        kpiErrors[index]?.actual_performance ||
                        errors?.kpis?.[index]?.actual_performance?.message
                          ? "#d32f2f"
                          : "#e0e0e0",
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
                  onFieldChange(index, "remarks", e.target.value)
                }
                placeholder={isReadOnly ? "-" : "Optional remarks"}
                multiline
                maxRows={2}
                sx={{
                  width: "100%",
                  "& .MuiOutlinedInput-root": {
                    backgroundColor: "white",
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
);

export const CompetencyTable = ({
  competencyItems,
  isReadOnly,
  ratingScales,
  onRatingChange,
  errors,
}) => (
  <TableContainer component={Paper} sx={{ width: "100%" }}>
    <Table sx={{ tableLayout: "fixed", width: "100%" }}>
      <colgroup>
        <col style={{ width: "calc(100% - 300px)" }} />
        <col style={{ width: "300px" }} />
      </colgroup>
      <TableHead>
        <TableRow>
          <TableCell
            sx={{
              fontWeight: 600,
              p: 2,
              borderRight: "1px solid #e0e0e0",
            }}>
            Competency Item
          </TableCell>
          <TableCell sx={{ textAlign: "center", fontWeight: 600, p: 2 }}>
            Rating
          </TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {competencyItems.map((item, index) => (
          <TableRow key={index}>
            <TableCell sx={{ p: 2, borderRight: "1px solid #e0e0e0" }}>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                {item.template_item_name || `Item ${index + 1}`}
              </Typography>
            </TableCell>
            <TableCell sx={{ p: 2, textAlign: "center" }}>
              {isReadOnly ? (
                <Typography variant="body2">
                  {(() => {
                    if (item.rating_scale_name) return item.rating_scale_name;
                    if (item.rating_scale_id) {
                      const scale = ratingScales.find(
                        (r) => r.id === item.rating_scale_id
                      );
                      return scale?.label || item.rating_scale_id;
                    }
                    return "-";
                  })()}
                </Typography>
              ) : (
                <Box>
                  <TextField
                    select
                    size="small"
                    value={item.rating_scale_id || ""}
                    onChange={(e) => onRatingChange(index, e.target.value)}
                    error={
                      !!errors?.competency_assessment?.answers?.[index]
                        ?.rating_scale_id?.message
                    }
                    sx={{
                      width: "100%",
                      "& .MuiOutlinedInput-root": {
                        backgroundColor: "white",
                        "& fieldset": {
                          borderColor: errors?.competency_assessment?.answers?.[
                            index
                          ]?.rating_scale_id?.message
                            ? "#d32f2f"
                            : "#e0e0e0",
                        },
                      },
                    }}
                    SelectProps={{
                      native: true,
                      displayEmpty: true,
                    }}>
                    <option value="" style={{ display: "none" }}></option>
                    {ratingScales.map((scale) => (
                      <option key={scale.id} value={scale.id}>
                        {scale.label}
                      </option>
                    ))}
                  </TextField>
                  {errors?.competency_assessment?.answers?.[index]
                    ?.rating_scale_id?.message && (
                    <Typography
                      variant="caption"
                      sx={{
                        color: "#d32f2f",
                        display: "block",
                        mt: 0.5,
                        fontSize: "0.75rem",
                      }}>
                      {
                        errors.competency_assessment.answers[index]
                          .rating_scale_id.message
                      }
                    </Typography>
                  )}
                </Box>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </TableContainer>
);

const FormSection = ({
  title,
  children,
  isLoading,
  loadingMessage,
  isEmpty,
  emptyMessage,
  error,
}) => (
  <Box sx={{ mb: 3 }}>
    <Typography variant="h6" sx={sectionTitleStyles}>
      {title}
    </Typography>
    {error && <ErrorBox message={error} />}
    {isLoading ? (
      <LoadingBox message={loadingMessage} />
    ) : isEmpty ? (
      <EmptyStateBox message={emptyMessage} />
    ) : (
      children
    )}
  </Box>
);

export default FormSection;
